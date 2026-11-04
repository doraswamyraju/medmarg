package com.medmarg.patient.data

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.medmarg.patient.model.FamilyMember
import com.medmarg.patient.model.SavedAddress
import com.medmarg.patient.model.UserProfile
import org.json.JSONArray
import org.json.JSONObject

data class PatientMedicalMeta(
    val age: Int = 29,
    val gender: String = "Male",
    val bloodGroup: String = "O+",
    val heightWeight: String = "174cm / 70kg",
    val abhaId: String = "91-4829-1042-8831",
    val allergies: String = "None reported",
    val chronicConditions: String = "None reported",
    val currentMedications: String = "None",
    val emergencyContact: String = ""
)

data class LiveVitalsSnapshot(
    val heartRateBpm: Int = 74,
    val spo2Percent: Int = 98,
    val bpSystolic: Int = 118,
    val bpDiastolic: Int = 78,
    val fastingGlucoseMgDl: Int = 94,
    val stepsToday: Int = 6420,
    val sleepHours: String = "7h 25m",
    val deviceSource: String = "Health Connect • Synced Just Now"
)

object PatientSessionStore {
    private const val PREFS_NAME = "medmarg_patient_session_store"

    val familyMembers = mutableStateListOf<FamilyMember>()
    val savedAddresses = mutableStateListOf<SavedAddress>()
    val liveOrders = mutableStateListOf<LivePatientOrder>()

    var medicalMeta by mutableStateOf(PatientMedicalMeta())
    var vitals by mutableStateOf(LiveVitalsSnapshot())
    var selectedCity by mutableStateOf("Tirupati")

    fun initializeForUser(context: Context, user: UserProfile) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val userKey = user.email.ifEmpty { user.phone }.lowercase().trim()

        // 1. Load Family Members (Always ensure Self is first, no fake family names!)
        familyMembers.clear()
        val famJsonStr = prefs.getString("family_$userKey", null)
        if (!famJsonStr.isNullOrEmpty()) {
            try {
                val arr = JSONArray(famJsonStr)
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    familyMembers.add(
                        FamilyMember(
                            id = o.optString("id", "fam_$i"),
                            name = o.optString("name", user.name),
                            relationship = o.optString("relationship", "Self"),
                            age = o.optInt("age", 29),
                            gender = o.optString("gender", "Male"),
                            bloodGroup = o.optString("bloodGroup", "O+")
                        )
                    )
                }
            } catch (_: Exception) {}
        }
        if (familyMembers.isEmpty()) {
            familyMembers.add(
                FamilyMember(
                    id = "fam_self",
                    name = user.name,
                    relationship = "Self",
                    age = 29,
                    gender = "Male",
                    bloodGroup = "O+"
                )
            )
            saveFamilyMembers(context, user)
        } else {
            // Keep Self name synced with logged-in user
            val selfIdx = familyMembers.indexOfFirst { it.relationship.equals("Self", ignoreCase = true) }
            if (selfIdx >= 0) {
                familyMembers[selfIdx] = familyMembers[selfIdx].copy(name = user.name)
            }
        }

        // 2. Load Saved Doorstep Addresses
        savedAddresses.clear()
        val addrJsonStr = prefs.getString("addresses_$userKey", null)
        if (!addrJsonStr.isNullOrEmpty()) {
            try {
                val arr = JSONArray(addrJsonStr)
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    savedAddresses.add(
                        SavedAddress(
                            id = o.optString("id", "addr_$i"),
                            label = o.optString("label", "Home"),
                            fullAddress = o.optString("fullAddress", user.organization),
                            landmark = o.optString("landmark", ""),
                            city = o.optString("city", "Tirupati"),
                            pincode = o.optString("pincode", "517501"),
                            lat = o.optDouble("lat", 13.6288),
                            lng = o.optDouble("lng", 79.4192),
                            isDefault = o.optBoolean("isDefault", i == 0),
                            contactPhone = o.optString("contactPhone", user.phone)
                        )
                    )
                }
            } catch (_: Exception) {}
        }
        if (savedAddresses.isEmpty()) {
            val defaultAddr = if (user.organization.isNotEmpty() && !user.organization.contains("Google")) {
                user.organization
            } else {
                "Air Bypass Road, Tirupati - 517501"
            }
            savedAddresses.add(
                SavedAddress(
                    id = "addr_default",
                    label = "Home",
                    fullAddress = defaultAddr,
                    landmark = "Main Road",
                    city = "Tirupati",
                    pincode = "517501",
                    isDefault = true,
                    contactPhone = user.phone
                )
            )
            saveAddresses(context, user)
        }

        // 3. Load Medical Profile Meta
        val metaStr = prefs.getString("meta_$userKey", null)
        if (!metaStr.isNullOrEmpty()) {
            try {
                val o = JSONObject(metaStr)
                medicalMeta = PatientMedicalMeta(
                    age = o.optInt("age", 29),
                    gender = o.optString("gender", "Male"),
                    bloodGroup = o.optString("bloodGroup", "O+"),
                    heightWeight = o.optString("heightWeight", "174cm / 70kg"),
                    abhaId = o.optString("abhaId", "91-4829-1042-8831"),
                    allergies = o.optString("allergies", "None reported"),
                    chronicConditions = o.optString("chronicConditions", "None reported"),
                    currentMedications = o.optString("currentMedications", "None"),
                    emergencyContact = o.optString("emergencyContact", user.phone)
                )
            } catch (_: Exception) {}
        } else {
            medicalMeta = PatientMedicalMeta(emergencyContact = user.phone)
        }
    }

    fun saveFamilyMembers(context: Context, user: UserProfile) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val userKey = user.email.ifEmpty { user.phone }.lowercase().trim()
        val arr = JSONArray()
        familyMembers.forEach { f ->
            arr.put(
                JSONObject().apply {
                    put("id", f.id)
                    put("name", f.name)
                    put("relationship", f.relationship)
                    put("age", f.age)
                    put("gender", f.gender)
                    put("bloodGroup", f.bloodGroup)
                }
            )
        }
        prefs.edit().putString("family_$userKey", arr.toString()).apply()
    }

    fun saveAddresses(context: Context, user: UserProfile) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val userKey = user.email.ifEmpty { user.phone }.lowercase().trim()
        val arr = JSONArray()
        savedAddresses.forEach { a ->
            arr.put(
                JSONObject().apply {
                    put("id", a.id)
                    put("label", a.label)
                    put("fullAddress", a.fullAddress)
                    put("landmark", a.landmark)
                    put("city", a.city)
                    put("pincode", a.pincode)
                    put("lat", a.lat)
                    put("lng", a.lng)
                    put("isDefault", a.isDefault)
                    put("contactPhone", a.contactPhone)
                }
            )
        }
        prefs.edit().putString("addresses_$userKey", arr.toString()).apply()
    }

    fun saveMedicalMeta(context: Context, user: UserProfile, updated: PatientMedicalMeta) {
        medicalMeta = updated
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val userKey = user.email.ifEmpty { user.phone }.lowercase().trim()
        val obj = JSONObject().apply {
            put("age", updated.age)
            put("gender", updated.gender)
            put("bloodGroup", updated.bloodGroup)
            put("heightWeight", updated.heightWeight)
            put("abhaId", updated.abhaId)
            put("allergies", updated.allergies)
            put("chronicConditions", updated.chronicConditions)
            put("currentMedications", updated.currentMedications)
            put("emergencyContact", updated.emergencyContact)
        }
        prefs.edit().putString("meta_$userKey", obj.toString()).apply()
    }
}

