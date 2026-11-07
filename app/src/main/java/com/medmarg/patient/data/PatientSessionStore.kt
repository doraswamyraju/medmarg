package com.medmarg.patient.data

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.medmarg.patient.model.FamilyMember
import com.medmarg.patient.model.SavedAddress
import com.medmarg.patient.model.UserProfile
import org.json.JSONArray
import org.json.JSONObject
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

data class PatientMedicalMeta(
    val age: Int = 29,
    val gender: String = "Male",
    val bloodGroup: String = "O+",
    val heightWeight: String = "174cm / 70kg",
    val abhaId: String = "",
    val abhaLinked: Boolean = false,
    val preferredLanguage: String = "Telugu & English",
    val needleSensitivity: String = "Butterfly 23G (Sensitive)",
    val allergies: String = "None reported",
    val chronicConditions: String = "None reported",
    val currentMedications: String = "None",
    val emergencyContactName: String = "Family Emergency",
    val emergencyContact: String = "",
    val biometricsEnabled: Boolean = true,
    val whatsAppNotifications: Boolean = true,
    val smsOrderUpdates: Boolean = true
)

data class LiveVitalsSnapshot(
    val isConnected: Boolean = false,
    val heartRateBpm: Int? = null,
    val spo2Percent: Int? = null,
    val bpSystolic: Int? = null,
    val bpDiastolic: Int? = null,
    val fastingGlucoseMgDl: Int? = null,
    val stepsToday: Int? = null,
    val sleepHours: String? = null,
    val deviceSource: String = "No device connected"
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
                    abhaId = o.optString("abhaId", ""),
                    abhaLinked = o.optBoolean("abhaLinked", false),
                    preferredLanguage = o.optString("preferredLanguage", "Telugu & English"),
                    needleSensitivity = o.optString("needleSensitivity", "Butterfly 23G (Sensitive)"),
                    allergies = o.optString("allergies", "None reported"),
                    chronicConditions = o.optString("chronicConditions", "None reported"),
                    currentMedications = o.optString("currentMedications", "None"),
                    emergencyContactName = o.optString("emergencyContactName", "Family Emergency"),
                    emergencyContact = o.optString("emergencyContact", user.phone),
                    biometricsEnabled = o.optBoolean("biometricsEnabled", true),
                    whatsAppNotifications = o.optBoolean("whatsAppNotifications", true),
                    smsOrderUpdates = o.optBoolean("smsOrderUpdates", true)
                )
            } catch (_: Exception) {}
        } else {
            medicalMeta = PatientMedicalMeta(emergencyContact = user.phone)
        }

        // 4. Load Live Vitals Connection State
        val vitalsStr = prefs.getString("vitals_$userKey", null)
        if (!vitalsStr.isNullOrEmpty()) {
            try {
                val vo = JSONObject(vitalsStr)
                vitals = LiveVitalsSnapshot(
                    isConnected = vo.optBoolean("isConnected", false),
                    heartRateBpm = if (vo.has("heartRateBpm")) vo.optInt("heartRateBpm") else null,
                    spo2Percent = if (vo.has("spo2Percent")) vo.optInt("spo2Percent") else null,
                    bpSystolic = if (vo.has("bpSystolic")) vo.optInt("bpSystolic") else null,
                    bpDiastolic = if (vo.has("bpDiastolic")) vo.optInt("bpDiastolic") else null,
                    fastingGlucoseMgDl = if (vo.has("fastingGlucoseMgDl")) vo.optInt("fastingGlucoseMgDl") else null,
                    stepsToday = if (vo.has("stepsToday")) vo.optInt("stepsToday") else null,
                    sleepHours = vo.optString("sleepHours", null),
                    deviceSource = vo.optString("deviceSource", "No device connected")
                )
            } catch (_: Exception) {}
        } else {
            vitals = LiveVitalsSnapshot(isConnected = false, deviceSource = "No device connected")
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
            put("abhaLinked", updated.abhaLinked)
            put("preferredLanguage", updated.preferredLanguage)
            put("needleSensitivity", updated.needleSensitivity)
            put("allergies", updated.allergies)
            put("chronicConditions", updated.chronicConditions)
            put("currentMedications", updated.currentMedications)
            put("emergencyContactName", updated.emergencyContactName)
            put("emergencyContact", updated.emergencyContact)
            put("biometricsEnabled", updated.biometricsEnabled)
            put("whatsAppNotifications", updated.whatsAppNotifications)
            put("smsOrderUpdates", updated.smsOrderUpdates)
        }
        prefs.edit().putString("meta_$userKey", obj.toString()).apply()
    }

    fun saveVitals(context: Context, user: UserProfile, updated: LiveVitalsSnapshot) {
        vitals = updated
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val userKey = user.email.ifEmpty { user.phone }.lowercase().trim()
        val obj = JSONObject().apply {
            put("isConnected", updated.isConnected)
            updated.heartRateBpm?.let { put("heartRateBpm", it) }
            updated.spo2Percent?.let { put("spo2Percent", it) }
            updated.bpSystolic?.let { put("bpSystolic", it) }
            updated.bpDiastolic?.let { put("bpDiastolic", it) }
            updated.fastingGlucoseMgDl?.let { put("fastingGlucoseMgDl", it) }
            updated.stepsToday?.let { put("stepsToday", it) }
            updated.sleepHours?.let { put("sleepHours", it) }
            put("deviceSource", updated.deviceSource)
        }
        prefs.edit().putString("vitals_$userKey", obj.toString()).apply()
    }

    // Secure local persistence for in-flight pending checkout (Process death recovery)
    // Uses Android Keystore AES-256-GCM hardware-backed encryption with graceful fallback
    private const val KEYSTORE_ALIAS = "MedMargPaymentKey"
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val GCM_TAG_LENGTH = 128

    private fun getOrCreateSecretKey(): SecretKey {
        val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
        val existing = keyStore.getKey(KEYSTORE_ALIAS, null) as? SecretKey
        if (existing != null) return existing

        val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
        val spec = KeyGenParameterSpec.Builder(
            KEYSTORE_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .build()
        keyGenerator.init(spec)
        return keyGenerator.generateKey()
    }

    private fun encryptToken(plainText: String): String {
        return try {
            val secretKey = getOrCreateSecretKey()
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.ENCRYPT_MODE, secretKey)
            val iv = cipher.iv
            val cipherText = cipher.doFinal(plainText.toByteArray(Charsets.UTF_8))
            val combined = ByteArray(iv.size + cipherText.size)
            System.arraycopy(iv, 0, combined, 0, iv.size)
            System.arraycopy(cipherText, 0, combined, iv.size, cipherText.size)
            Base64.encodeToString(combined, Base64.NO_WRAP)
        } catch (_: Exception) {
            // Safe fallback if Keystore is temporarily unavailable
            Base64.encodeToString(plainText.toByteArray(Charsets.UTF_8), Base64.NO_WRAP)
        }
    }

    private fun decryptToken(encryptedBase64: String): String {
        return try {
            val combined = Base64.decode(encryptedBase64, Base64.NO_WRAP)
            val secretKey = getOrCreateSecretKey()
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            // GCM standard IV is 12 bytes
            val ivLength = 12
            if (combined.size <= ivLength) return ""
            val spec = GCMParameterSpec(GCM_TAG_LENGTH, combined, 0, ivLength)
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
            val plainBytes = cipher.doFinal(combined, ivLength, combined.size - ivLength)
            String(plainBytes, Charsets.UTF_8)
        } catch (_: Exception) {
            try {
                // Fallback for decode
                val rawBytes = Base64.decode(encryptedBase64, Base64.NO_WRAP)
                String(rawBytes, Charsets.UTF_8)
            } catch (_: Exception) {
                ""
            }
        }
    }

    fun savePendingPayment(context: Context, orderId: String, orderToken: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val encryptedToken = encryptToken(orderToken)
        prefs.edit()
            .putString("pending_order_id", orderId)
            .putString("pending_order_token_enc", encryptedToken)
            .apply()
    }

    fun getPendingPayment(context: Context): Pair<String, String>? {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val id = prefs.getString("pending_order_id", null) ?: return null
        val encToken = prefs.getString("pending_order_token_enc", null)
        val legacyToken = prefs.getString("pending_order_token", null)

        val token = when {
            !encToken.isNullOrEmpty() -> decryptToken(encToken).ifEmpty { legacyToken ?: "" }
            !legacyToken.isNullOrEmpty() -> legacyToken
            else -> ""
        }

        return if (id.isNotEmpty() && token.isNotEmpty()) Pair(id, token) else null
    }

    fun clearPendingPayment(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .remove("pending_order_id")
            .remove("pending_order_token_enc")
            .remove("pending_order_token")
            .apply()
    }
}

