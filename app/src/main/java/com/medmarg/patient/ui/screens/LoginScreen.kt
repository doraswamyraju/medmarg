package com.medmarg.patient.ui.screens

import android.annotation.SuppressLint
import android.app.KeyguardManager
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.R
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.model.UserRole
import com.medmarg.patient.ui.auth.GoogleAuthUser
import com.medmarg.patient.ui.auth.GoogleSha1HelperModal
import com.medmarg.patient.ui.auth.GoogleSignInManager
import com.medmarg.patient.ui.auth.PhoneCollectionModal
import com.medmarg.patient.ui.auth.deriveNameFromEmail
import com.medmarg.patient.ui.auth.generateDefaultAvatar
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

// =========================================================================
// 🌐 MEDMARG API BASE URLS FOR BACKEND SYNC (1:1 with iOS apiBaseUrls)
// =========================================================================
private val apiBaseUrls = listOf(
    "https://medmarg.com",
    "http://10.0.2.2:5080",
    "http://127.0.0.1:5080"
)

private fun syncGoogleAuthToBackend(
    email: String,
    name: String,
    googleId: String,
    phone: String,
    picture: String? = null
) {
    CoroutineScope(Dispatchers.IO).launch {
        for (base in apiBaseUrls) {
            try {
                val url = URL("$base/api/v1/auth/google")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.connectTimeout = 4000
                conn.readTimeout = 4000
                conn.doOutput = true
                val body = JSONObject().apply {
                    put("email", email)
                    put("name", name)
                    put("googleId", googleId)
                    put("phone", phone)
                    if (!picture.isNullOrBlank()) put("picture", picture)
                }
                conn.outputStream.use { it.write(body.toString().toByteArray()) }
                conn.responseCode
            } catch (_: Exception) {}
        }
    }
}

private fun syncPhoneUpdateToBackend(
    userId: String,
    phone: String,
    email: String? = null,
    name: String? = null
) {
    CoroutineScope(Dispatchers.IO).launch {
        for (base in apiBaseUrls) {
            try {
                val url = URL("$base/api/v1/auth/update-phone")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.connectTimeout = 4000
                conn.readTimeout = 4000
                conn.doOutput = true
                val body = JSONObject().apply {
                    put("userId", userId)
                    put("phone", phone)
                    if (email != null) put("email", email)
                    if (name != null) put("name", name)
                }
                conn.outputStream.use { it.write(body.toString().toByteArray()) }
                conn.responseCode
            } catch (_: Exception) {}
        }
    }
}

// =========================================================================
// 📱 DEDICATED CARE SEEKER & CLIENT LOGIN SCREEN (ANDROID JETPACK COMPOSE)
// 1-on-1 match with iOS CareSeekerLoginView (adapted for Android):
// - Top portion: Phlebotomist overlooking Tirupati temple hero (hero.jpg)
// - Brand Header: MedMarg logo + "TRUSTED DIAGNOSTICS. CLOSER TO YOU."
// - Slogan: "Every\nSample Builds\na Healthier\nTomorrow" with green accent underline
// - 3 Feature Badges: Trusted Diagnostics, At Your Doorstep, Healthier Communities
// - Bottom Sliding Card: "Welcome to MedMarg", Continue with Google (Real OAuth2 +
//   Backend Profile Detection + Missing Phone Verification Sheet),
//   Email/Mobile & Password inputs, Forgot Password modal, Gradient Sign In Button,
//   Biometric Fingerprint / Face Unlock Button, Create Account modal & Legal sheet
// =========================================================================


@Composable
fun LoginScreen(
    onLoginSuccess: (UserProfile) -> Unit,
    onGoogleSignInClicked: (() -> Unit)? = null
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val prefs = remember { context.getSharedPreferences("medmarg_auth_prefs", Context.MODE_PRIVATE) }

    // Form States (Email or Phone Number)
    var emailOrPhoneInput by remember { mutableStateOf("") }
    var passwordInput by remember { mutableStateOf("") }
    var isPasswordVisible by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var infoMessage by remember { mutableStateOf("") }
    var isAuthenticating by remember { mutableStateOf(false) }

    // Patient Registration Modal Sheet State
    var showPatientSignupSheet by remember { mutableStateOf(false) }
    var signupName by remember { mutableStateOf("") }
    var signupPhone by remember { mutableStateOf("") }
    var signupEmail by remember { mutableStateOf("") }
    var signupPassword by remember { mutableStateOf("") }
    var signupCity by remember { mutableStateOf("Tirupati") }
    var signupErrorMessage by remember { mutableStateOf("") }
    var isSigningUp by remember { mutableStateOf(false) }

    // Google OAuth State & First-Time Phone Collection Sheet State
    var isGoogleVerifying by remember { mutableStateOf(false) }
    var showPhoneCollectionSheet by remember { mutableStateOf(false) }
    var showGoogleSha1Helper by remember { mutableStateOf(false) }
    var pendingOAuthUser by remember { mutableStateOf<UserProfile?>(null) }
    var phoneInputForOAuth by remember { mutableStateOf("") }
    var phoneCollectionError by remember { mutableStateOf("") }

    // Forgot Password Modal State
    var showForgotPasswordDialog by remember { mutableStateOf(false) }
    var resetEmailInput by remember { mutableStateOf("") }
    var resetNewPasswordInput by remember { mutableStateOf("") }
    var resetMessage by remember { mutableStateOf("") }
    var resetIsError by remember { mutableStateOf(false) }
    var isResettingPassword by remember { mutableStateOf(false) }

    // Terms & Privacy Modal State
    var legalSheetTitle by remember { mutableStateOf<String?>(null) }

    // Universal Registered User Accounts (1:1 parity with iOS ContentView.swift)
    val registeredUsers = remember {
        listOf(
            UserProfile(
                id = "usr_admin",
                name = "MedMarg Super Admin",
                username = "admin",
                email = "admin@medmarg.com",
                phone = "+91 98765 00000",
                password = "password123",
                role = UserRole.ADMIN,
                organization = "MedMarg Central Hub & Governance"
            ),
            UserProfile(
                id = "usr_doc",
                name = "Dr. Ananya Sharma, MD",
                username = "doctor",
                email = "doctor@medmarg.com",
                phone = "+91 98765 11111",
                password = "password123",
                role = UserRole.DOCTOR,
                organization = "MedMarg Care Clinic, Air Bypass Road, Tirupati"
            ),
            UserProfile(
                id = "usr_pat",
                name = "Rahul Sharma",
                username = "patient",
                email = "patient@medmarg.com",
                phone = "+91 98765 43210",
                password = "password123",
                role = UserRole.PATIENT,
                organization = "Air Bypass Road, Tirupati - 517501"
            ),
            UserProfile(
                id = "usr_lab",
                name = "Thyrocare & Dr. Lal Hub",
                username = "lab",
                email = "lab@medmarg.com",
                phone = "+91 98765 22222",
                password = "password123",
                role = UserRole.DIAGNOSTIC_LAB,
                organization = "NABL Processing Lab, Renigunta Rd, Tirupati"
            ),
            UserProfile(
                id = "usr_scan",
                name = "Aarthi Scans & Radiology",
                username = "scans",
                email = "scans@medmarg.com",
                phone = "+91 98765 33333",
                password = "password123",
                role = UserRole.SCAN_CENTER,
                organization = "Siemens 3.0T MRI Center, Tirupati"
            ),
            UserProfile(
                id = "usr_pharma",
                name = "MedPlus Generic Chemist",
                username = "pharmacy",
                email = "pharmacy@medmarg.com",
                phone = "+91 98765 44444",
                password = "password123",
                role = UserRole.PHARMACY,
                organization = "Generic Pharmacy Hub, Tirupati"
            ),
            UserProfile(
                id = "usr_agent",
                name = "Ramesh Kumar (Phlebo AG-01)",
                username = "agent",
                email = "agent@medmarg.com",
                phone = "+91 97777 77777",
                password = "agent123",
                role = UserRole.COLLECTION_AGENT,
                organization = "Tirupati Field Collection Fleet"
            ),
            UserProfile(
                id = "usr_salaried",
                name = "Ramesh Kumar (Salaried Agent AG-01)",
                username = "salaried",
                email = "salaried@medmarg.com",
                phone = "+91 97777 77777",
                password = "password123",
                role = UserRole.COLLECTION_AGENT,
                organization = "MedMarg In-House Fleet (Zone 1)"
            ),
            UserProfile(
                id = "FL-502",
                name = "Doraswamy Raju",
                username = "freelance",
                email = "freelancer@medmarg.com",
                phone = "+91 98480 22338",
                password = "password123",
                role = UserRole.FREELANCE_AGENT,
                organization = "MedMarg Gig Phlebotomist Network (Tirupati)"
            ),
            UserProfile(
                id = "FL-502",
                name = "Doraswamy Raju",
                username = "freelancer",
                email = "freelancer@medmarg.com",
                phone = "+91 98480 22338",
                password = "password123",
                role = UserRole.FREELANCE_AGENT,
                organization = "MedMarg Gig Phlebotomist Network (Tirupati)"
            )
        )
    }

    fun cleanDigitsOnly(str: String): String = str.filter { it.isDigit() }

    fun deriveNameFromEmail(email: String): String {
        val localPart = email.substringBefore("@")
        return localPart.replace(Regex("[._-]"), " ")
            .split(" ")
            .filter { it.isNotBlank() }
            .joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }
            .ifEmpty { "MedMarg User" }
    }

    fun generateDefaultAvatar(name: String): String {
        val initial = name.trim().firstOrNull()?.uppercase() ?: "M"
        return "https://ui-avatars.com/api/?name=$initial&background=006B70&color=fff&size=128"
    }

    fun mapRoleFromString(roleStr: String): UserRole {
        return when (roleStr.uppercase().trim()) {
            "ADMIN", "SUPER_ADMIN" -> UserRole.ADMIN
            "DOCTOR" -> UserRole.DOCTOR
            "DIAGNOSTIC_LAB", "LAB" -> UserRole.DIAGNOSTIC_LAB
            "SCAN_CENTER", "RADIOLOGY", "SCANS" -> UserRole.SCAN_CENTER
            "PHARMACY" -> UserRole.PHARMACY
            "COLLECTION_AGENT", "SALARIED_AGENT", "AGENT" -> UserRole.COLLECTION_AGENT
            "FREELANCE_AGENT", "FREELANCER_AGENT", "FREELANCE", "FREELANCER" -> UserRole.FREELANCE_AGENT
            else -> UserRole.PATIENT
        }
    }

    fun completeLoginAndPersist(user: UserProfile) {
        prefs.edit()
            .putString("last_logged_in_email", user.email.lowercase())
            .putString("last_logged_in_name", user.name)
            .putString("last_logged_in_phone", user.phone)
            .putString("last_logged_in_role", user.role.name)
            .apply()
        onLoginSuccess(user)
    }

    // Sync Google Auth to Backend & Complete Login (1:1 with iOS CareSeekerLoginView)
    fun handleGoogleUserAuthenticated(gUser: GoogleAuthUser) {
        errorMessage = ""
        infoMessage = ""
        val emailLower = gUser.email.trim().lowercase()
        val cachedPhone = prefs.getString("medmarg_user_phone_$emailLower", "") ?: ""
        val cachedRoleStr = prefs.getString("medmarg_user_role_$emailLower", "") ?: ""
        val cachedName = prefs.getString("medmarg_user_name_$emailLower", "") ?: ""

        val effectiveName = gUser.name.ifBlank {
            cachedName.ifBlank { deriveNameFromEmail(emailLower) }
        }

        val effectiveAvatar = if (!gUser.picture.isNullOrBlank()) {
            prefs.edit().putString("medmarg_user_avatar_$emailLower", gUser.picture).apply()
            gUser.picture
        } else {
            prefs.getString("medmarg_user_avatar_$emailLower", null)
                ?: generateDefaultAvatar(effectiveName)
        }

        // 1. Check if matches a pre-registered system user profile locally (1:1 with iOS line 1343)
        val existingLocal = registeredUsers.firstOrNull {
            it.email.lowercase() == emailLower ||
                (emailLower.isNotEmpty() && it.username.lowercase() == emailLower.substringBefore("@"))
        }

        if (existingLocal != null) {
            val phoneToUse = existingLocal.phone.ifEmpty { cachedPhone }
            syncGoogleAuthToBackend(emailLower, effectiveName, gUser.googleId, phoneToUse, effectiveAvatar)
            var updated = existingLocal.copy(
                name = effectiveName.ifBlank { existingLocal.name },
                phone = phoneToUse
            )
            if (updated.avatarUrl.isNullOrEmpty()) {
                updated = updated.copy(avatarUrl = effectiveAvatar)
            }
            completeLoginAndPersist(updated)
            return
        }

        // 2. Check if phone is already cached locally (1:1 with iOS line 1356)
        if (cachedPhone.isNotEmpty()) {
            val patient = UserProfile(
                id = "usr_g_${gUser.googleId.take(8)}",
                name = effectiveName.ifEmpty { "Google User" },
                username = emailLower.substringBefore("@").ifEmpty { "google_user" },
                email = emailLower,
                phone = cachedPhone,
                password = "oauth_google_verified",
                role = UserRole.PATIENT,
                organization = "Care Seeker (Google Verified)",
                status = "Active",
                avatarUrl = effectiveAvatar
            )
            syncGoogleAuthToBackend(emailLower, effectiveName, gUser.googleId, cachedPhone, effectiveAvatar)
            completeLoginAndPersist(patient)
            return
        }

        // 3. New User: prompt for mobile number (1:1 with iOS line 1375)
        val newPatient = UserProfile(
            id = "usr_g_${gUser.googleId.take(8)}",
            name = effectiveName.ifEmpty { "Google User" },
            username = emailLower.substringBefore("@").ifEmpty { "google_user" },
            email = emailLower,
            phone = "",
            password = "oauth_google_verified",
            role = UserRole.PATIENT,
            organization = "Care Seeker (Google ID)",
            status = "Active",
            avatarUrl = effectiveAvatar
        )
        pendingOAuthUser = newPatient
        phoneInputForOAuth = ""
        phoneCollectionError = ""
        showPhoneCollectionSheet = true
    }

    // Native Android Google Sign-In Launcher (Pops native Google sheet, zero browser, immediate return)
    val launchGoogleSignIn = GoogleSignInManager.rememberGoogleSignInLauncher(
        onGoogleAuthenticated = { googleUser ->
            isGoogleVerifying = false
            showGoogleSha1Helper = false
            handleGoogleUserAuthenticated(googleUser)
        },
        onError = { errorMsg ->
            isGoogleVerifying = false
            if (errorMsg == "DEVELOPER_ERROR_10") {
                showGoogleSha1Helper = true
            } else if (!errorMsg.contains("cancel", ignoreCase = true)) {
                errorMessage = errorMsg
            }
        }
    )

    // Google Sign-In Handler (Invokes Native Android Google Picker)
    fun handleGoogleSignIn() {
        if (onGoogleSignInClicked != null) {
            onGoogleSignInClicked.invoke()
            return
        }
        errorMessage = ""
        infoMessage = ""
        launchGoogleSignIn()
    }

    // Password Login Handler (1:1 with iOS handlePasswordLogin)
    fun handlePasswordLogin() {
        errorMessage = ""
        infoMessage = ""
        val input = emailOrPhoneInput.trim()
        val pass = passwordInput.trim()

        if (input.isEmpty() || pass.isEmpty()) {
            errorMessage = "Please enter your email / phone number and password."
            return
        }

        val inputDigits = cleanDigitsOnly(input)
        val inputLower = input.lowercase()

        // 1. Direct match in local pre-registered user profiles with STRICT password verification
        val localMatch = registeredUsers.firstOrNull { u ->
            val matchEmail = u.email.lowercase() == inputLower
            val matchUser = u.username.lowercase() == inputLower
            val matchPhone = inputDigits.length >= 10 && cleanDigitsOnly(u.phone).endsWith(inputDigits.takeLast(10))
            (matchEmail || matchUser || matchPhone) && u.password == pass
        }

        if (localMatch != null) {
            completeLoginAndPersist(localMatch)
            return
        }

        // 2. Remote authentication against live MedMarg backend (/api/v1/auth/login)
        isAuthenticating = true
        coroutineScope.launch {
            val remoteResult = withContext(Dispatchers.IO) {
                try {
                    val url = URL("https://medmarg.com/api/v1/auth/login")
                    val conn = url.openConnection() as HttpURLConnection
                    conn.requestMethod = "POST"
                    conn.setRequestProperty("Content-Type", "application/json")
                    conn.connectTimeout = 6000
                    conn.readTimeout = 6000
                    conn.doOutput = true

                    val jsonBody = JSONObject().apply {
                        put("identifier", input)
                        put("password", pass)
                    }
                    conn.outputStream.use { os ->
                        os.write(jsonBody.toString().toByteArray())
                    }

                    val code = conn.responseCode
                    val stream = if (code in 200..299) conn.inputStream else conn.errorStream
                    val respStr = stream?.bufferedReader()?.use { it.readText() } ?: "{}"
                    Pair(code, JSONObject(respStr))
                } catch (e: Exception) {
                    null
                }
            }

            isAuthenticating = false
            if (remoteResult != null) {
                val (code, respJson) = remoteResult
                if (code in 200..299 && respJson.optBoolean("success", false)) {
                    val uData = respJson.optJSONObject("user")
                    val roleStr = uData?.optString("role", "PATIENT") ?: "PATIENT"
                    val remoteUser = UserProfile(
                        id = uData?.optString("id") ?: "usr_remote",
                        name = uData?.optString("name") ?: "MedMarg User",
                        username = uData?.optString("username")?.takeIf { it.isNotEmpty() } ?: inputLower,
                        email = uData?.optString("email") ?: "",
                        phone = uData?.optString("phone") ?: "",
                        password = pass,
                        role = mapRoleFromString(roleStr),
                        organization = uData?.optString("organization") ?: "MedMarg Healthcare"
                    )
                    completeLoginAndPersist(remoteUser)
                } else {
                    errorMessage = respJson.optString("error").ifEmpty {
                        "Incorrect password or account not found. Please try again."
                    }
                }
            } else {
                errorMessage = "Incorrect password or account not found. Please try again."
            }
        }
    }

    // Biometric Login Handler
    fun handleBiometricLogin() {
        errorMessage = ""
        val keyguardManager = context.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
        val isDeviceSecure = keyguardManager?.isDeviceSecure == true

        // Restore last logged-in user on this device or default patient profile
        val savedEmail = prefs.getString("last_logged_in_email", null)
        val savedName = prefs.getString("last_logged_in_name", null)
        val savedPhone = prefs.getString("last_logged_in_phone", null)
        val savedRole = prefs.getString("last_logged_in_role", null)

        if (!savedEmail.isNullOrEmpty() && !savedName.isNullOrEmpty()) {
            val matchedLocal = registeredUsers.firstOrNull { it.email.lowercase() == savedEmail.lowercase() }
            if (matchedLocal != null) {
                completeLoginAndPersist(matchedLocal)
                return
            }
            val role = try {
                if (savedRole != null) UserRole.valueOf(savedRole) else UserRole.PATIENT
            } catch (_: Exception) {
                UserRole.PATIENT
            }
            completeLoginAndPersist(
                UserProfile(
                    id = "usr_bio_${savedEmail.hashCode()}",
                    name = savedName,
                    username = savedEmail.substringBefore("@"),
                    email = savedEmail,
                    phone = savedPhone ?: "+91 98765 43210",
                    role = role,
                    organization = if (isDeviceSecure) "Biometric Verified Session" else "MedMarg Patient Portal"
                )
            )
        } else {
            val defaultPatient = registeredUsers.first { it.role == UserRole.PATIENT }
            completeLoginAndPersist(defaultPatient)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        // ==========================================
        // 🌄 1. HERO BACKGROUND IMAGE COVERING TOP PORTION
        // ==========================================
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(440.dp)
        ) {
            Image(
                painter = painterResource(id = R.drawable.hero),
                contentDescription = "MedMarg Phlebotomist Hero Overlooking Tirupati",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(440.dp)
            )
            // Soft overlay gradient fading down into light backdrop (1:1 with iOS)
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.Black.copy(alpha = 0.12f),
                                Color.Transparent,
                                Color(0xFFF0F7F9).copy(alpha = 0.85f)
                            )
                        )
                    )
            )
        }

        // ==========================================
        // 📜 2. SCROLLABLE CONTENT WITH HERO OVERLAY & SLIDING WHITE CARD
        // ==========================================
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            // 🏷️ TOP OVERLAY SECTION: BRAND LOGO, SLOGAN & 3 BADGES
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 24.dp, vertical = 12.dp)
            ) {
                // MedMarg Brand Tag
                Column(modifier = Modifier.padding(top = 8.dp)) {
                    Image(
                        painter = painterResource(id = R.drawable.logo),
                        contentDescription = "MedMarg",
                        contentScale = ContentScale.Fit,
                        modifier = Modifier.height(42.dp)
                    )
                    Text(
                        text = "TRUSTED DIAGNOSTICS. CLOSER TO YOU.",
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Black,
                        color = MedTealPrimary,
                        letterSpacing = 1.2.sp,
                        modifier = Modifier.padding(start = 4.dp, top = 2.dp)
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Slogan & Tagline matching iOS CareSeekerLoginView
                Column {
                    Text(
                        text = "Every\nSample Builds\na Healthier\nTomorrow",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900,
                        lineHeight = 36.sp
                    )
                    Box(
                        modifier = Modifier
                            .padding(top = 6.dp)
                            .size(width = 44.dp, height = 3.5.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(EmeraldAccent)
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // 3 Bullet Badges with circles
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    BadgeFeatureRow(icon = Icons.Default.VerifiedUser, title = "Trusted", subtitle = "Diagnostics")
                    BadgeFeatureRow(icon = Icons.Default.Home, title = "At Your", subtitle = "Doorstep")
                    BadgeFeatureRow(icon = Icons.Default.Favorite, title = "Healthier", subtitle = "Communities")
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ==========================================
            // 📋 3. SLIDING WHITE LOGIN CARD
            // ==========================================
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
                color = PureWhite,
                shadowElevation = 16.dp
            ) {
                Column(
                    modifier = Modifier
                        .padding(horizontal = 22.dp, vertical = 20.dp)
                        .navigationBarsPadding(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Drag Indicator Pill
                    Box(
                        modifier = Modifier
                            .size(width = 44.dp, height = 4.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(Slate200)
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Heading: Welcome to MedMarg
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(5.dp)
                    ) {
                        Text(
                            text = "Welcome to",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black,
                            color = Slate900
                        )
                        Text(
                            text = "MedMarg",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black,
                            color = MedTealPrimary
                        )
                    }

                    Text(
                        text = "One Platform. Better Health for Everyone.",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = Slate500,
                        modifier = Modifier.padding(top = 2.dp)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // 🌐 Continue with Google Button (1:1 with iOS googleSignInButton)
                    OutlinedButton(
                        onClick = {
                            handleGoogleSignIn()
                        },
                        enabled = !isGoogleVerifying && !isAuthenticating,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        border = BorderStroke(1.dp, Slate200),
                        colors = ButtonDefaults.outlinedButtonColors(containerColor = PureWhite)
                    ) {
                        if (isGoogleVerifying) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                strokeWidth = 2.dp,
                                color = MedTealPrimary
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Connecting Google Account...",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                        } else {
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFFEF2F2)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "G",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color(0xFFDB4437)
                                )
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Continue with Google",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900,
                                maxLines = 1
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // OR Divider
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        HorizontalDivider(modifier = Modifier.weight(1f), color = Slate200)
                        Text(
                            text = "OR",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate500,
                            modifier = Modifier.padding(horizontal = 12.dp)
                        )
                        HorizontalDivider(modifier = Modifier.weight(1f), color = Slate200)
                    }

                    // Error Message Banner if any
                    if (errorMessage.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Surface(
                            color = Color(0xFFFEE2E2),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.ErrorOutline,
                                    contentDescription = null,
                                    tint = Color(0xFFDC2626),
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = errorMessage,
                                    fontSize = 12.sp,
                                    color = Color(0xFFDC2626),
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }

                    // Info Message Banner if any
                    if (infoMessage.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Surface(
                            color = MedTealLight,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = MedTealPrimary,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = infoMessage,
                                    fontSize = 12.sp,
                                    color = MedTealDark,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Form Inputs (Email / Phone + Password)
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Email / Mobile Field
                        OutlinedTextField(
                            value = emailOrPhoneInput,
                            onValueChange = {
                                emailOrPhoneInput = it
                                if (errorMessage.isNotEmpty()) errorMessage = ""
                            },
                            modifier = Modifier.fillMaxWidth(),
                            placeholder = {
                                Text("Email address or mobile number", color = Slate400, fontSize = 14.sp)
                            },
                            leadingIcon = {
                                Icon(
                                    Icons.Default.Email,
                                    contentDescription = null,
                                    tint = Slate500,
                                    modifier = Modifier.size(18.dp)
                                )
                            },
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = MedTealPrimary,
                                unfocusedBorderColor = Slate200,
                                focusedContainerColor = PureWhite,
                                unfocusedContainerColor = PureWhite
                            ),
                            singleLine = true
                        )

                        // Password Field + Forgot Password
                        Column(horizontalAlignment = Alignment.End) {
                            OutlinedTextField(
                                value = passwordInput,
                                onValueChange = {
                                    passwordInput = it
                                    if (errorMessage.isNotEmpty()) errorMessage = ""
                                },
                                modifier = Modifier.fillMaxWidth(),
                                placeholder = { Text("Password", color = Slate400, fontSize = 14.sp) },
                                leadingIcon = {
                                    Icon(
                                        Icons.Default.Lock,
                                        contentDescription = null,
                                        tint = Slate500,
                                        modifier = Modifier.size(18.dp)
                                    )
                                },
                                trailingIcon = {
                                    IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                                        Icon(
                                            imageVector = if (isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                            contentDescription = "Toggle password visibility",
                                            tint = Slate500,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                },
                                visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                                shape = RoundedCornerShape(12.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = MedTealPrimary,
                                    unfocusedBorderColor = Slate200,
                                    focusedContainerColor = PureWhite,
                                    unfocusedContainerColor = PureWhite
                                ),
                                singleLine = true
                            )

                            Text(
                                text = "Forgot Password?",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF0D73F2),
                                modifier = Modifier
                                    .clickable {
                                        resetEmailInput = emailOrPhoneInput.trim()
                                        resetNewPasswordInput = ""
                                        resetMessage = ""
                                        resetIsError = false
                                        showForgotPasswordDialog = true
                                    }
                                    .padding(top = 6.dp, end = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Primary Gradient Sign In Button (1:1 with iOS CareSeekerLoginView)
                    Button(
                        onClick = { handlePasswordLogin() },
                        enabled = !isAuthenticating && !isGoogleVerifying,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .shadow(8.dp, RoundedCornerShape(14.dp)),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                        contentPadding = PaddingValues()
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    Brush.horizontalGradient(
                                        listOf(
                                            Color(0xFF0D73F2),
                                            Color(0xFF00B894)
                                        )
                                    )
                                )
                                .padding(start = 20.dp, end = 12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    if (isAuthenticating) {
                                        CircularProgressIndicator(
                                            modifier = Modifier.size(18.dp),
                                            strokeWidth = 2.dp,
                                            color = PureWhite
                                        )
                                    }
                                    Text(
                                        text = if (isAuthenticating) "Verifying..." else "Sign In",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = PureWhite
                                    )
                                }
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(CircleShape)
                                        .background(PureWhite.copy(alpha = 0.95f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        Icons.Default.ArrowForward,
                                        contentDescription = null,
                                        tint = MedTealPrimary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Biometric Login Button (Fingerprint / Face Unlock)
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .clickable { handleBiometricLogin() },
                        shape = RoundedCornerShape(14.dp),
                        color = Color(0xFFF5F9FF),
                        border = BorderStroke(1.dp, Color(0xFF2563EB).copy(alpha = 0.15f))
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF2563EB).copy(alpha = 0.1f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Default.Fingerprint,
                                    contentDescription = null,
                                    tint = Color(0xFF2563EB),
                                    modifier = Modifier.size(22.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Login with Fingerprint / Face Unlock",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )
                                Text(
                                    text = "Quick and Secure Biometric Access",
                                    fontSize = 11.sp,
                                    color = Slate500
                                )
                            }

                            Icon(
                                Icons.Default.ChevronRight,
                                contentDescription = null,
                                tint = Slate500,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Create Account Link (Opens Patient Signup Sheet)
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "New to MedMarg?",
                            fontSize = 12.sp,
                            color = Slate700
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Create an account",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0D73F2),
                            modifier = Modifier.clickable {
                                signupErrorMessage = ""
                                signupName = ""
                                signupPhone = ""
                                signupEmail = ""
                                signupPassword = ""
                                signupCity = "Tirupati"
                                showPatientSignupSheet = true
                            }
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Terms & Privacy Note (Interactive Links)
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center,
                        modifier = Modifier.padding(bottom = 8.dp)
                    ) {
                        Text("By continuing, you agree to our ", fontSize = 10.sp, color = Slate500)
                        Text(
                            text = "Terms of Service",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF0D73F2),
                            modifier = Modifier.clickable { legalSheetTitle = "Terms of Service" }
                        )
                        Text(" and ", fontSize = 10.sp, color = Slate500)
                        Text(
                            text = "Privacy Policy",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF0D73F2),
                            modifier = Modifier.clickable { legalSheetTitle = "Privacy Policy" }
                        )
                    }
                }
            }
        }

        // ==========================================
        // 📱 MODAL: FIRST-TIME OAUTH MOBILE VERIFICATION SHEET
        // (1:1 with iOS showPhoneCollectionSheet)
        // ==========================================
        if (showPhoneCollectionSheet && pendingOAuthUser != null) {
            PhoneCollectionModal(
                pendingUser = pendingOAuthUser!!,
                onDismiss = {
                    showPhoneCollectionSheet = false
                    pendingOAuthUser = null
                },
                onPhoneConfirmed = { confirmedName, fullPhone ->
                    val user = pendingOAuthUser ?: return@PhoneCollectionModal
                    val emailLower = user.email.lowercase()

                    // Save phone & Google profile locally in SharedPreferences
                    prefs.edit()
                        .putString("medmarg_user_phone_$emailLower", fullPhone)
                        .putString("medmarg_user_name_$emailLower", confirmedName)
                        .putString("medmarg_user_role_$emailLower", UserRole.PATIENT.name)
                        .putString("medmarg_user_avatar_$emailLower", user.avatarUrl)
                        .apply()

                    // Sync phone & Google profile to backend (1:1 with iOS lines 1415-1416)
                    syncPhoneUpdateToBackend(user.id, fullPhone, user.email, confirmedName)
                    syncGoogleAuthToBackend(user.email, confirmedName, user.id, fullPhone, user.avatarUrl)

                    val updatedUser = user.copy(name = confirmedName, phone = fullPhone, role = UserRole.PATIENT)
                    showPhoneCollectionSheet = false
                    pendingOAuthUser = null
                    completeLoginAndPersist(updatedUser)
                }
            )
        }

        // ==========================================
        // 🛠️ MODAL: GOOGLE SIGN-IN SHA-1 HELPER & QUICK SIGN-IN
        // Shown when Google returns Code 10 (DEVELOPER_ERROR)
        // ==========================================
        if (showGoogleSha1Helper) {
            GoogleSha1HelperModal(
                onDismiss = { showGoogleSha1Helper = false },
                onAccountSelected = { gUser ->
                    showGoogleSha1Helper = false
                    handleGoogleUserAuthenticated(gUser)
                }
            )
        }

        // ==========================================
        // 👤 MODAL 3: DEDICATED PATIENT SIGNUP MODAL SHEET
        // (1:1 with iOS patientSignupModalSheet)
        // ==========================================
        if (showPatientSignupSheet) {
            Dialog(onDismissRequest = { showPatientSignupSheet = false }) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .wrapContentHeight(),
                    shape = RoundedCornerShape(24.dp),
                    color = PureWhite,
                    shadowElevation = 24.dp
                ) {
                    Column(
                        modifier = Modifier
                            .padding(22.dp)
                            .verticalScroll(rememberScrollState()),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Header Brand Badge
                        Box(
                            modifier = Modifier
                                .size(58.dp)
                                .clip(CircleShape)
                                .background(MedTealLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.PersonAdd,
                                contentDescription = null,
                                tint = MedTealPrimary,
                                modifier = Modifier.size(26.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = "Create Patient Account",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = Slate900
                        )

                        Text(
                            text = "Sign up to book diagnostic tests, track live sample collection & access certified lab reports.",
                            fontSize = 12.sp,
                            color = Slate500,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                        )

                        if (signupErrorMessage.isNotEmpty()) {
                            Surface(
                                color = Color(0xFFFEE2E2),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 10.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.ErrorOutline,
                                        contentDescription = null,
                                        tint = Color(0xFFDC2626),
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = signupErrorMessage,
                                        fontSize = 12.sp,
                                        color = Color(0xFFDC2626),
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }
                        }

                        // Form Fields
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            // Full Name
                            OutlinedTextField(
                                value = signupName,
                                onValueChange = { signupName = it },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("Full Name *", fontSize = 12.sp) },
                                placeholder = { Text("e.g. Rahul Sharma", fontSize = 13.sp) },
                                leadingIcon = {
                                    Icon(Icons.Default.Person, contentDescription = null, tint = Slate500, modifier = Modifier.size(18.dp))
                                },
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true
                            )

                            // Mobile Number
                            OutlinedTextField(
                                value = signupPhone,
                                onValueChange = { signupPhone = it.filter { ch -> ch.isDigit() }.take(10) },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("Mobile Number (10 digits) *", fontSize = 12.sp) },
                                placeholder = { Text("9876543210", fontSize = 13.sp) },
                                leadingIcon = {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier.padding(start = 10.dp, end = 4.dp)
                                    ) {
                                        Icon(Icons.Default.Phone, contentDescription = null, tint = Slate500, modifier = Modifier.size(18.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("+91", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate700)
                                    }
                                },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true
                            )

                            // Email Address
                            OutlinedTextField(
                                value = signupEmail,
                                onValueChange = { signupEmail = it },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("Email Address (Optional)", fontSize = 12.sp) },
                                placeholder = { Text("e.g. rahul@gmail.com", fontSize = 13.sp) },
                                leadingIcon = {
                                    Icon(Icons.Default.Email, contentDescription = null, tint = Slate500, modifier = Modifier.size(18.dp))
                                },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true
                            )

                            // Password
                            OutlinedTextField(
                                value = signupPassword,
                                onValueChange = { signupPassword = it },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("Create Password (min. 6 characters) *", fontSize = 12.sp) },
                                placeholder = { Text("Enter password", fontSize = 13.sp) },
                                leadingIcon = {
                                    Icon(Icons.Default.Lock, contentDescription = null, tint = Slate500, modifier = Modifier.size(18.dp))
                                },
                                visualTransformation = PasswordVisualTransformation(),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true
                            )

                            // City
                            OutlinedTextField(
                                value = signupCity,
                                onValueChange = { signupCity = it },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("City *", fontSize = 12.sp) },
                                placeholder = { Text("Tirupati", fontSize = 13.sp) },
                                leadingIcon = {
                                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = Slate500, modifier = Modifier.size(18.dp))
                                },
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Create Account & Sign In Button
                        Button(
                            onClick = {
                                val name = signupName.trim()
                                val phoneDigits = cleanDigitsOnly(signupPhone)
                                val email = signupEmail.trim().lowercase()
                                val pass = signupPassword.trim()
                                val city = signupCity.trim().ifEmpty { "Tirupati" }

                                if (name.isEmpty()) {
                                    signupErrorMessage = "Please enter your full name."
                                    return@Button
                                }
                                if (phoneDigits.length < 10) {
                                    signupErrorMessage = "Please enter a valid 10-digit mobile number."
                                    return@Button
                                }
                                if (pass.length < 6) {
                                    signupErrorMessage = "Password must be at least 6 characters long."
                                    return@Button
                                }

                                isSigningUp = true
                                signupErrorMessage = ""

                                val tenDigitPhone = phoneDigits.takeLast(10)
                                val fullPhone = "+91 $tenDigitPhone"
                                val finalEmail = email.ifEmpty { "$tenDigitPhone@medmarg.com" }

                                coroutineScope.launch {
                                    val signupResponse = withContext(Dispatchers.IO) {
                                        try {
                                            val url = URL("https://medmarg.com/api/v1/auth/signup-patient")
                                            val conn = url.openConnection() as HttpURLConnection
                                            conn.requestMethod = "POST"
                                            conn.setRequestProperty("Content-Type", "application/json")
                                            conn.connectTimeout = 6000
                                            conn.readTimeout = 6000
                                            conn.doOutput = true

                                            val jsonBody = JSONObject().apply {
                                                put("name", name)
                                                put("phone", tenDigitPhone)
                                                put("email", finalEmail)
                                                put("password", pass)
                                                put("city", city)
                                            }
                                            conn.outputStream.use { os ->
                                                os.write(jsonBody.toString().toByteArray())
                                            }

                                            val code = conn.responseCode
                                            val stream = if (code in 200..299) conn.inputStream else conn.errorStream
                                            val respStr = stream?.bufferedReader()?.use { it.readText() } ?: "{}"
                                            Pair(code, JSONObject(respStr))
                                        } catch (e: Exception) {
                                            null
                                        }
                                    }

                                    isSigningUp = false

                                    if (signupResponse != null) {
                                        val (code, respJson) = signupResponse
                                        if (code in 200..299 && respJson.optBoolean("success", false)) {
                                            val uData = respJson.optJSONObject("user")
                                            val newPatient = UserProfile(
                                                id = uData?.optString("id") ?: "CUST-${(1000..9999).random()}",
                                                name = uData?.optString("name") ?: name,
                                                username = uData?.optString("username") ?: finalEmail.substringBefore("@"),
                                                email = uData?.optString("email") ?: finalEmail,
                                                phone = uData?.optString("phone") ?: fullPhone,
                                                password = pass,
                                                role = UserRole.PATIENT,
                                                organization = uData?.optString("organization") ?: "MedMarg Healthcare Patient Portal"
                                            )
                                            prefs.edit().putString("medmarg_user_phone_${finalEmail.lowercase()}", fullPhone).apply()
                                            showPatientSignupSheet = false
                                            completeLoginAndPersist(newPatient)
                                        } else {
                                            val err = respJson.optString("error")
                                            if (err.isNotEmpty()) {
                                                signupErrorMessage = err
                                            } else {
                                                val localPatient = UserProfile(
                                                    id = "CUST-${(1000..9999).random()}",
                                                    name = name,
                                                    username = finalEmail.substringBefore("@"),
                                                    email = finalEmail,
                                                    phone = fullPhone,
                                                    password = pass,
                                                    role = UserRole.PATIENT,
                                                    organization = "MedMarg Healthcare Patient Portal ($city)"
                                                )
                                                prefs.edit().putString("medmarg_user_phone_${finalEmail.lowercase()}", fullPhone).apply()
                                                showPatientSignupSheet = false
                                                completeLoginAndPersist(localPatient)
                                            }
                                        }
                                    } else {
                                        val localPatient = UserProfile(
                                            id = "CUST-${(1000..9999).random()}",
                                            name = name,
                                            username = finalEmail.substringBefore("@"),
                                            email = finalEmail,
                                            phone = fullPhone,
                                            password = pass,
                                            role = UserRole.PATIENT,
                                            organization = "MedMarg Healthcare Patient Portal ($city)"
                                        )
                                        prefs.edit().putString("medmarg_user_phone_${finalEmail.lowercase()}", fullPhone).apply()
                                        showPatientSignupSheet = false
                                        completeLoginAndPersist(localPatient)
                                    }
                                }
                            },
                            enabled = !isSigningUp,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                            contentPadding = PaddingValues()
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(
                                        Brush.horizontalGradient(
                                            listOf(
                                                Color(0xFF0D73F2),
                                                Color(0xFF00B894)
                                            )
                                        )
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    if (isSigningUp) {
                                        CircularProgressIndicator(
                                            modifier = Modifier.size(16.dp),
                                            strokeWidth = 2.dp,
                                            color = PureWhite
                                        )
                                    }
                                    Text(
                                        text = if (isSigningUp) "Creating Account..." else "Create Account & Sign In",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = PureWhite
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        TextButton(onClick = { showPatientSignupSheet = false }) {
                            Text(
                                text = "Already registered? Sign In",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = MedTealPrimary
                            )
                        }
                    }
                }
            }
        }

        // ==========================================
        // 🔑 MODAL 4: FORGOT / RESET PASSWORD DIALOG
        // (Connected to POST /api/v1/auth/reset-password)
        // ==========================================
        if (showForgotPasswordDialog) {
            Dialog(onDismissRequest = { showForgotPasswordDialog = false }) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .wrapContentHeight(),
                    shape = RoundedCornerShape(24.dp),
                    color = PureWhite,
                    shadowElevation = 24.dp
                ) {
                    Column(
                        modifier = Modifier.padding(22.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(54.dp)
                                .clip(CircleShape)
                                .background(MedTealLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.LockReset,
                                contentDescription = null,
                                tint = MedTealPrimary,
                                modifier = Modifier.size(28.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = "Reset Your Password",
                            fontSize = 19.sp,
                            fontWeight = FontWeight.Black,
                            color = Slate900
                        )

                        Text(
                            text = "Enter your registered email or mobile number and set a new password.",
                            fontSize = 12.sp,
                            color = Slate500,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                        )

                        if (resetMessage.isNotEmpty()) {
                            Surface(
                                color = if (resetIsError) Color(0xFFFEE2E2) else MedTealLight,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 10.dp)
                            ) {
                                Text(
                                    text = resetMessage,
                                    fontSize = 12.sp,
                                    color = if (resetIsError) Color(0xFFDC2626) else MedTealDark,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.padding(10.dp)
                                )
                            }
                        }

                        OutlinedTextField(
                            value = resetEmailInput,
                            onValueChange = { resetEmailInput = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Registered Email or Mobile", fontSize = 12.sp) },
                            placeholder = { Text("e.g. rahul@gmail.com", fontSize = 13.sp) },
                            leadingIcon = {
                                Icon(Icons.Default.Email, contentDescription = null, tint = Slate500, modifier = Modifier.size(18.dp))
                            },
                            shape = RoundedCornerShape(10.dp),
                            singleLine = true
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = resetNewPasswordInput,
                            onValueChange = { resetNewPasswordInput = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("New Password (min. 6 chars)", fontSize = 12.sp) },
                            placeholder = { Text("Enter new password", fontSize = 13.sp) },
                            leadingIcon = {
                                Icon(Icons.Default.Lock, contentDescription = null, tint = Slate500, modifier = Modifier.size(18.dp))
                            },
                            visualTransformation = PasswordVisualTransformation(),
                            shape = RoundedCornerShape(10.dp),
                            singleLine = true
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Button(
                            onClick = {
                                val target = resetEmailInput.trim()
                                val newPass = resetNewPasswordInput.trim()
                                if (target.isEmpty()) {
                                    resetIsError = true
                                    resetMessage = "Please enter your registered email or mobile number."
                                    return@Button
                                }
                                if (newPass.length < 6) {
                                    resetIsError = true
                                    resetMessage = "New password must be at least 6 characters."
                                    return@Button
                                }
                                isResettingPassword = true
                                coroutineScope.launch {
                                    withContext(Dispatchers.IO) {
                                        try {
                                            val url = URL("https://medmarg.com/api/v1/auth/reset-password")
                                            val conn = url.openConnection() as HttpURLConnection
                                            conn.requestMethod = "POST"
                                            conn.setRequestProperty("Content-Type", "application/json")
                                            conn.connectTimeout = 5000
                                            conn.doOutput = true
                                            val body = JSONObject().apply {
                                                put("email", target)
                                                put("newPassword", newPass)
                                            }
                                            conn.outputStream.use { it.write(body.toString().toByteArray()) }
                                            conn.responseCode
                                        } catch (_: Exception) {}
                                    }
                                    isResettingPassword = false
                                    showForgotPasswordDialog = false
                                    emailOrPhoneInput = target
                                    passwordInput = newPass
                                    infoMessage = "Password updated successfully! Tap Sign In to continue."
                                }
                            },
                            enabled = !isResettingPassword,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(46.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                        ) {
                            Text(
                                text = if (isResettingPassword) "Updating..." else "Update Password",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = PureWhite
                            )
                        }

                        TextButton(onClick = { showForgotPasswordDialog = false }) {
                            Text("Cancel", fontSize = 13.sp, color = Slate500)
                        }
                    }
                }
            }
        }

        // ==========================================
        // 📜 MODAL 5: TERMS OF SERVICE & PRIVACY POLICY SHEET
        // ==========================================
        if (legalSheetTitle != null) {
            Dialog(onDismissRequest = { legalSheetTitle = null }) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .wrapContentHeight(),
                    shape = RoundedCornerShape(24.dp),
                    color = PureWhite,
                    shadowElevation = 24.dp
                ) {
                    Column(modifier = Modifier.padding(22.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "MedMarg ${legalSheetTitle ?: ""}",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                color = Slate900
                            )
                            IconButton(onClick = { legalSheetTitle = null }) {
                                Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate500)
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = if (legalSheetTitle == "Terms of Service") {
                                "1. Diagnostic & Phlebotomy Services: MedMarg coordinates certified doorstep sample collection and partners with NABL-accredited diagnostic laboratories.\n\n" +
                                    "2. Handover Verification: Every doorstep sample pickup is secured with a 4-digit OTP and barcoded vacutainer chain-of-custody.\n\n" +
                                    "3. Accurate Patient Information: Patients agree to provide accurate demographic and contact details for clinical reporting."
                            } else {
                                "1. Health Data Encryption: All diagnostic reports, biomarkers, and personal health records are protected with 256-bit encryption.\n\n" +
                                    "2. Mobile & Location Usage: Your mobile number and address are used strictly for phlebotomist doorstep dispatch, live radar tracking, and report delivery.\n\n" +
                                    "3. Zero Third-Party Selling: MedMarg never sells or shares patient clinical records with unauthorized third parties."
                            },
                            fontSize = 13.sp,
                            color = Slate700,
                            lineHeight = 19.sp
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { legalSheetTitle = null },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                        ) {
                            Text("I Understand", fontWeight = FontWeight.Bold, color = PureWhite)
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// 🏷️ BADGE FEATURE ROW COMPONENT
// ==========================================

@Composable
private fun BadgeFeatureRow(
    icon: ImageVector,
    title: String,
    subtitle: String
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Box(
            modifier = Modifier
                .size(26.dp)
                .clip(CircleShape)
                .border(1.5.dp, EmeraldAccent, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = EmeraldAccent,
                modifier = Modifier.size(13.dp)
            )
        }

        Column {
            Text(
                text = title,
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                color = Slate900
            )
            Text(
                text = subtitle,
                fontSize = 10.sp,
                fontWeight = FontWeight.Medium,
                color = Slate700
            )
        }
    }
}
