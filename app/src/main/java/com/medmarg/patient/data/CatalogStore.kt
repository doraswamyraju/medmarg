package com.medmarg.patient.data

import android.content.Context
import com.medmarg.patient.model.CatalogItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONObject

object CatalogStore {
    private val _tests = MutableStateFlow<List<CatalogItem>>(emptyList())
    val tests: StateFlow<List<CatalogItem>> = _tests.asStateFlow()

    private val _profiles = MutableStateFlow<List<CatalogItem>>(emptyList())
    val profiles: StateFlow<List<CatalogItem>> = _profiles.asStateFlow()

    private val _packages = MutableStateFlow<List<CatalogItem>>(emptyList())
    val packages: StateFlow<List<CatalogItem>> = _packages.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private var isInitialized = false

    fun initialize(context: Context) {
        if (isInitialized) return
        _isLoading.value = true
        try {
            val jsonString = context.assets.open("catalogData.json").bufferedReader().use { it.readText() }
            val root = JSONObject(jsonString)

            // 1. Parse Tests
            val testsList = mutableListOf<CatalogItem>()
            val testsArray = root.optJSONArray("tests")
            if (testsArray != null) {
                for (i in 0 until testsArray.length()) {
                    val obj = testsArray.getJSONObject(i)
                    testsList.add(
                        CatalogItem(
                            id = obj.optString("id", "test_$i"),
                            serialNo = obj.optInt("serialNo", i + 1),
                            code = obj.optString("code", ""),
                            name = obj.optString("name", "Test"),
                            sampleType = obj.optString("sampleType", "SERUM"),
                            fasting = obj.optString("fasting", "NO"),
                            category = obj.optString("category", "General"),
                            mrp = obj.optInt("mrp", 200),
                            price = obj.optInt("price", 150),
                            tatHours = obj.optInt("tatHours", 24),
                            description = obj.optString("description", null),
                            active = obj.optBoolean("active", true),
                            itemType = "TEST"
                        )
                    )
                }
            }

            // 2. Parse Profiles
            val profilesList = mutableListOf<CatalogItem>()
            val profilesArray = root.optJSONArray("profiles")
            if (profilesArray != null) {
                for (i in 0 until profilesArray.length()) {
                    val obj = profilesArray.getJSONObject(i)
                    val testsInProf = mutableListOf<String>()
                    val tArr = obj.optJSONArray("tests")
                    if (tArr != null) {
                        for (j in 0 until tArr.length()) {
                            testsInProf.add(tArr.getString(j))
                        }
                    }
                    profilesList.add(
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
            }

            // 3. Parse Packages (Default curated & life-stage wellness packages)
            val packagesList = mutableListOf<CatalogItem>()
            val pkgsArray = root.optJSONArray("packages")
            if (pkgsArray != null && pkgsArray.length() > 0) {
                for (i in 0 until pkgsArray.length()) {
                    val obj = pkgsArray.getJSONObject(i)
                    val profs = mutableListOf<String>()
                    val pArr = obj.optJSONArray("profiles")
                    if (pArr != null) {
                        for (j in 0 until pArr.length()) profs.add(pArr.getString(j))
                    }
                    packagesList.add(
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
            } else {
                // Curated Life-Stage Packages matching iOS/Web
                packagesList.addAll(getDefaultCuratedPackages())
            }

            _tests.value = testsList
            _profiles.value = profilesList
            _packages.value = packagesList
            isInitialized = true
        } catch (e: Exception) {
            e.printStackTrace()
            // Fallback default packages if asset read fails
            _packages.value = getDefaultCuratedPackages()
        } finally {
            _isLoading.value = false
        }
    }

    private fun getDefaultCuratedPackages(): List<CatalogItem> {
        return listOf(
            CatalogItem(
                id = "PKG_AAROGYAM_1.3",
                code = "AAROGYAM 1.3",
                name = "Aarogyam Complete 1.3 (Full Body Checkup)",
                mrp = 3500,
                price = 1499,
                discountPercent = 57,
                tagline = "104 Biomarkers • Complete Vital Screening",
                popular = true,
                fasting = "YES",
                itemType = "PACKAGE",
                testCount = 104,
                profiles = listOf("LP8", "LFT", "KFT", "THY", "CBC", "DIAB", "VIT")
            ),
            CatalogItem(
                id = "PKG_HIS_WELLNESS",
                code = "HIS_WELLNESS",
                name = "His Wellness Comprehensive (Men 20-50+)",
                mrp = 4000,
                price = 1699,
                discountPercent = 58,
                tagline = "78 Tests • Testosterone, Cardiac, Stamina & LFT",
                popular = true,
                fasting = "YES",
                itemType = "PACKAGE",
                testCount = 78,
                profiles = listOf("LP8", "LFT", "KFT", "THY", "TESTO")
            ),
            CatalogItem(
                id = "PKG_HER_WELLNESS",
                code = "HER_WELLNESS",
                name = "Her Wellness & Hormone Harmony (Women)",
                mrp = 4200,
                price = 1799,
                discountPercent = 57,
                tagline = "84 Tests • PCOS, Ultra Thyroid, Ferritin & Calcium",
                popular = true,
                fasting = "YES",
                itemType = "PACKAGE",
                testCount = 84,
                profiles = listOf("LP8", "LFT", "KFT", "THY", "PCOS", "FERR")
            ),
            CatalogItem(
                id = "PKG_FAMILY_SHIELD",
                code = "FAMILY_SHIELD",
                name = "Family Complete Health Shield (4 Members)",
                mrp = 9999,
                price = 4499,
                discountPercent = 55,
                tagline = "110+ Tests for 4 Members • Geriatric & Pediatric",
                popular = true,
                fasting = "YES",
                itemType = "PACKAGE",
                testCount = 110,
                profiles = listOf("LP8", "LFT", "KFT", "THY", "CBC", "DIAB", "VIT", "SR_CITIZEN")
            )
        )
    }

    /**
     * Find packages that contain or cover the given test code or keyword
     */
    fun findContainingPackages(item: CatalogItem): List<CatalogItem> {
        val query = item.name.lowercase()
        val code = item.code.uppercase()
        return _packages.value.filter { pkg ->
            pkg.name.contains("Full Body", ignoreCase = true) ||
            pkg.tagline?.contains("Complete", ignoreCase = true) == true ||
            (query.contains("thyroid") && pkg.name.contains("Aarogyam", ignoreCase = true)) ||
            (query.contains("vitamin") && pkg.name.contains("Wellness", ignoreCase = true)) ||
            (query.contains("lipid") || query.contains("cholesterol") || query.contains("glucose"))
        }.take(3)
    }
}
