package com.medmarg.patient.data

import android.content.Context
import com.medmarg.patient.model.CatalogItem
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

object CatalogStore {
    private const val PREFS_NAME = "medmarg_catalog_prefs"
    private const val KEY_TESTS_JSON = "cached_tests_json"
    private const val KEY_PROFILES_JSON = "cached_profiles_json"
    private const val KEY_PACKAGES_JSON = "cached_packages_json"
    private const val BASE_URL = "https://medmarg.com"

    private val _tests = MutableStateFlow<List<CatalogItem>>(emptyList())
    val tests: StateFlow<List<CatalogItem>> = _tests.asStateFlow()

    private val _profiles = MutableStateFlow<List<CatalogItem>>(emptyList())
    val profiles: StateFlow<List<CatalogItem>> = _profiles.asStateFlow()

    private val _packages = MutableStateFlow<List<CatalogItem>>(emptyList())
    val packages: StateFlow<List<CatalogItem>> = _packages.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isOnlineSynced = MutableStateFlow(false)
    val isOnlineSynced: StateFlow<Boolean> = _isOnlineSynced.asStateFlow()

    private var isInitialized = false

    fun initialize(context: Context) {
        if (isInitialized) return
        _isLoading.value = true

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val cachedTests = prefs.getString(KEY_TESTS_JSON, null)
        val cachedProfiles = prefs.getString(KEY_PROFILES_JSON, null)
        val cachedPackages = prefs.getString(KEY_PACKAGES_JSON, null)

        var loadedFromCache = false
        if (cachedTests != null && cachedProfiles != null && cachedPackages != null) {
            try {
                val tList = parseTestsArray(JSONArray(cachedTests))
                val prList = parseProfilesArray(JSONArray(cachedProfiles))
                val pkList = parsePackagesArray(JSONArray(cachedPackages))
                if (tList.isNotEmpty()) {
                    _tests.value = tList
                    _profiles.value = prList
                    _packages.value = pkList.ifEmpty { getDefaultCuratedPackages() }
                    loadedFromCache = true
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        if (!loadedFromCache) {
            loadBundledAsset(context)
        }

        isInitialized = true
        _isLoading.value = false

        // Asynchronously synchronize with live backend (1-on-1 parity with iOS CatalogStore.swift)
        syncWithLiveBackend(context)
    }

    private fun loadBundledAsset(context: Context) {
        try {
            val jsonString = context.assets.open("catalogData.json").bufferedReader().use { it.readText() }
            val root = JSONObject(jsonString)

            val testsArray = root.optJSONArray("tests")
            if (testsArray != null) {
                _tests.value = parseTestsArray(testsArray)
            }

            val profilesArray = root.optJSONArray("profiles")
            if (profilesArray != null) {
                _profiles.value = parseProfilesArray(profilesArray)
            }

            val pkgsArray = root.optJSONArray("packages")
            if (pkgsArray != null && pkgsArray.length() > 0) {
                _packages.value = parsePackagesArray(pkgsArray)
            } else {
                _packages.value = getDefaultCuratedPackages()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _packages.value = getDefaultCuratedPackages()
        }
    }

    private fun syncWithLiveBackend(context: Context) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // 1. Fetch Tests
                val testsResponse = httpGet("$BASE_URL/api/v1/catalog/tests?limit=2000")
                var fetchedTests: List<CatalogItem>? = null
                var rawTestsArray: String? = null
                if (testsResponse != null) {
                    val root = JSONObject(testsResponse)
                    val arr = root.optJSONArray("tests")
                    if (arr != null && arr.length() > 0) {
                        fetchedTests = parseTestsArray(arr)
                        rawTestsArray = arr.toString()
                    }
                }

                // 2. Fetch Profiles
                val profilesResponse = httpGet("$BASE_URL/api/v1/catalog/profiles")
                var fetchedProfiles: List<CatalogItem>? = null
                var rawProfilesArray: String? = null
                if (profilesResponse != null) {
                    val root = JSONObject(profilesResponse)
                    val arr = root.optJSONArray("profiles")
                    if (arr != null && arr.length() > 0) {
                        fetchedProfiles = parseProfilesArray(arr)
                        rawProfilesArray = arr.toString()
                    }
                }

                // 3. Fetch Packages
                val packagesResponse = httpGet("$BASE_URL/api/v1/catalog/packages")
                var fetchedPackages: List<CatalogItem>? = null
                var rawPackagesArray: String? = null
                if (packagesResponse != null) {
                    val root = JSONObject(packagesResponse)
                    val arr = root.optJSONArray("packages")
                    if (arr != null && arr.length() > 0) {
                        fetchedPackages = parsePackagesArray(arr)
                        rawPackagesArray = arr.toString()
                    }
                }

                // Apply updates if successful
                if (fetchedTests != null && fetchedTests.isNotEmpty()) {
                    _tests.value = fetchedTests
                }
                if (fetchedProfiles != null && fetchedProfiles.isNotEmpty()) {
                    _profiles.value = fetchedProfiles
                }
                if (fetchedPackages != null && fetchedPackages.isNotEmpty()) {
                    _packages.value = fetchedPackages
                }

                if (fetchedTests != null || fetchedProfiles != null || fetchedPackages != null) {
                    _isOnlineSynced.value = true
                    // Cache to SharedPreferences
                    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                    prefs.edit().apply {
                        if (rawTestsArray != null) putString(KEY_TESTS_JSON, rawTestsArray)
                        if (rawProfilesArray != null) putString(KEY_PROFILES_JSON, rawProfilesArray)
                        if (rawPackagesArray != null) putString(KEY_PACKAGES_JSON, rawPackagesArray)
                        apply()
                    }
                }
            } catch (e: Exception) {
                // Network error - stay on cached/bundled data safely
                e.printStackTrace()
            }
        }
    }

    private fun httpGet(urlString: String): String? {
        var conn: HttpURLConnection? = null
        return try {
            val url = URL(urlString)
            conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "GET"
            conn.connectTimeout = 8000
            conn.readTimeout = 8000
            conn.setRequestProperty("Accept", "application/json")
            if (conn.responseCode in 200..299) {
                BufferedReader(InputStreamReader(conn.inputStream)).use { it.readText() }
            } else null
        } catch (e: Exception) {
            null
        } finally {
            conn?.disconnect()
        }
    }

    private fun parseTestsArray(testsArray: JSONArray): List<CatalogItem> {
        val list = mutableListOf<CatalogItem>()
        for (i in 0 until testsArray.length()) {
            val obj = testsArray.getJSONObject(i)
            val aliases = mutableListOf<String>()
            val aArr = obj.optJSONArray("aliasNames")
            if (aArr != null) {
                for (k in 0 until aArr.length()) aliases.add(aArr.getString(k))
            }
            list.add(
                CatalogItem(
                    id = obj.optString("id", "test_$i"),
                    serialNo = obj.optInt("serialNo", i + 1),
                    code = obj.optString("code", ""),
                    name = obj.optString("name", "Test"),
                    sampleType = obj.optString("sampleType", "EDTA WHOLE BLOOD"),
                    fasting = obj.optString("fasting", "NO"),
                    category = obj.optString("category", "General"),
                    mrp = obj.optInt("mrp", 200),
                    price = obj.optInt("price", 150),
                    tatHours = obj.optInt("tatHours", 24),
                    description = obj.optString("description", null),
                    active = obj.optBoolean("active", true),
                    itemType = "TEST",
                    aliasNames = aliases
                )
            )
        }
        return list
    }

    private fun parseProfilesArray(profilesArray: JSONArray): List<CatalogItem> {
        val list = mutableListOf<CatalogItem>()
        for (i in 0 until profilesArray.length()) {
            val obj = profilesArray.getJSONObject(i)
            val testsInProf = mutableListOf<String>()
            val tArr = obj.optJSONArray("tests")
            if (tArr != null) {
                for (j in 0 until tArr.length()) {
                    testsInProf.add(tArr.getString(j))
                }
            }
            list.add(
                CatalogItem(
                    id = obj.optString("id", "prof_$i"),
                    code = obj.optString("code", ""),
                    name = obj.optString("name", "Profile"),
                    sampleType = obj.optString("sampleType", "SERUM"),
                    fasting = obj.optString("fasting", "NO"),
                    category = obj.optString("category", "Profile"),
                    mrp = obj.optInt("mrp", 500),
                    price = obj.optInt("price", 399),
                    tatHours = obj.optInt("tatHours", 24),
                    itemType = "PROFILE",
                    tests = testsInProf,
                    testCount = obj.optInt("testCount", testsInProf.size)
                )
            )
        }
        return list
    }

    private fun parsePackagesArray(pkgsArray: JSONArray): List<CatalogItem> {
        val list = mutableListOf<CatalogItem>()
        for (i in 0 until pkgsArray.length()) {
            val obj = pkgsArray.getJSONObject(i)
            val profs = mutableListOf<String>()
            val pArr = obj.optJSONArray("profiles")
            if (pArr != null) {
                for (j in 0 until pArr.length()) profs.add(pArr.getString(j))
            }
            list.add(
                CatalogItem(
                    id = obj.optString("id", "pkg_$i"),
                    code = obj.optString("code", "PKG"),
                    name = obj.optString("name", "Health Package"),
                    mrp = obj.optInt("mrp", 2500),
                    price = obj.optInt("price", 1499),
                    discountPercent = obj.optInt("discountPercent", 40),
                    tagline = obj.optString("tagline", "Complete Screening"),
                    popular = obj.optBoolean("popular", true),
                    fasting = obj.optString("fasting", "YES"),
                    itemType = "PACKAGE",
                    profiles = profs,
                    testCount = obj.optInt("testCount", 85)
                )
            )
        }
        return list
    }

    private fun getDefaultCuratedPackages(): List<CatalogItem> {
        return listOf(
            CatalogItem(
                id = "PKG_1",
                code = "MM_MASTER",
                name = "MedMarg Master Full Body Checkup (100+ Biomarkers)",
                mrp = 2499,
                price = 1199,
                discountPercent = 52,
                tagline = "Comprehensive Preventive Health Package covering CBC, Lipid, Liver, Kidney, Thyroid & Vitamins",
                popular = true,
                fasting = "YES",
                itemType = "PACKAGE",
                testCount = 100,
                profiles = listOf("LIPID")
            )
        )
    }

    /**
     * Find packages that contain or cover the given test code or keyword
     */
    fun findContainingPackages(item: CatalogItem): List<CatalogItem> {
        val query = item.name.lowercase()
        return _packages.value.filter { pkg ->
            pkg.name.contains("Full Body", ignoreCase = true) ||
            pkg.tagline?.contains("Complete", ignoreCase = true) == true ||
            (query.contains("thyroid") && pkg.name.contains("Aarogyam", ignoreCase = true)) ||
            (query.contains("vitamin") && pkg.name.contains("Wellness", ignoreCase = true)) ||
            (query.contains("lipid") || query.contains("cholesterol") || query.contains("glucose"))
        }.take(3)
    }
}
