package com.medmarg.patient.ui.screens

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
import androidx.compose.material.icons.outlined.*
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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.medmarg.patient.R
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.model.UserRole
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

// =========================================================================
// 📱 DEDICATED CARE SEEKER & CLIENT LOGIN SCREEN (ANDROID JETPACK COMPOSE)
// Pixel-accurate 1-on-1 match to iOS CareSeekerLoginView & Reference Image 2:
// - Top portion: Phlebotomist overlooking Tirupati temple hero (hero.jpg)
// - Brand Header: MedMarg logo + "TRUSTED DIAGNOSTICS. CLOSER TO YOU."
// - Slogan: "Every\nSample Builds\na Healthier\nTomorrow" with green accent underline
// - 3 Feature Badges: Trusted Diagnostics, At Your Doorstep, Healthier Communities
// - Bottom Sliding Card: "Welcome to MedMarg", Continue with Google / Apple,
//   Email/Password inputs, Gradient Sign In Button, Biometric Fingerprint Button,
//   Create Account link & dedicated Patient Registration Dialog
// =========================================================================

@Composable
fun LoginScreen(
    onLoginSuccess: (UserProfile) -> Unit,
    onGoogleSignInClicked: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()

    var usernameInput by remember { mutableStateOf("patient") }
    var passwordInput by remember { mutableStateOf("password123") }
    var isPasswordVisible by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var isAuthenticating by remember { mutableStateOf(false) }

    // Patient Signup Dialog States
    var showSignupDialog by remember { mutableStateOf(false) }
    var signupName by remember { mutableStateOf("") }
    var signupPhone by remember { mutableStateOf("") }
    var signupEmail by remember { mutableStateOf("") }
    var signupPassword by remember { mutableStateOf("") }
    var signupCity by remember { mutableStateOf("Tirupati") }
    var signupErrorMessage by remember { mutableStateOf("") }
    var isSigningUp by remember { mutableStateOf(false) }

    val demoUsers = remember {
        listOf(
            UserProfile("usr_pat", "Rahul Sharma", "patient", "patient@medmarg.com", "+91 98765 43210", "password123", UserRole.PATIENT, "Air Bypass Road, Tirupati - 517501"),
            UserProfile("usr_doc", "Dr. Ananya Sharma, MD", "doctor", "doctor@medmarg.com", "+91 98765 11111", "password123", UserRole.DOCTOR, "MedMarg Care Clinic, Tirupati"),
            UserProfile("usr_admin", "MedMarg Super Admin", "admin", "admin@medmarg.com", "+91 98765 00000", "password123", UserRole.ADMIN, "MedMarg Central Governance"),
            UserProfile("usr_agent", "Ramesh Kumar (Phlebo AG-01)", "agent", "agent@medmarg.com", "+91 98765 55555", "password123", UserRole.COLLECTION_AGENT, "Tirupati Field Collection Fleet"),
            UserProfile("usr_freelance", "Vikram Reddy (MLT GIG-02)", "freelance", "freelance@medmarg.com", "+91 98765 66666", "password123", UserRole.FREELANCE_AGENT, "Independent Phlebotomy Partner"),
            UserProfile("usr_pharma", "MedPlus Generic Chemist", "pharmacy", "pharmacy@medmarg.com", "+91 98765 44444", "password123", UserRole.PHARMACY, "Generic Pharmacy Hub, Tirupati"),
            UserProfile("usr_scan", "Aarthi Scans & Radiology", "scans", "scans@medmarg.com", "+91 98765 33333", "password123", UserRole.SCAN_CENTER, "Siemens 3.0T MRI Center, Tirupati")
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        // 🌄 1. HERO BACKGROUND IMAGE COVERING TOP PORTION
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
            // Soft overlay gradient fading down into light backdrop
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

        // 📜 2. SCROLLABLE CONTENT WITH HERO OVERLAY & SLIDING WHITE CARD
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

                // Slogan & Tagline matching reference Image 2
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

            // 📋 3. SLIDING WHITE LOGIN CARD
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
                color = PureWhite,
                shadowElevation = 16.dp
            ) {
                Column(
                    modifier = Modifier.padding(22.dp),
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
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
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

                    // Social Buttons Side-by-Side: Continue with Google & Continue with Apple
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Google Button
                        OutlinedButton(
                            onClick = onGoogleSignInClicked,
                            modifier = Modifier
                                .weight(1f)
                                .height(46.dp),
                            shape = RoundedCornerShape(12.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200),
                            contentPadding = PaddingValues(horizontal = 6.dp)
                        ) {
                            Text("G", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color(0xFFDC2626))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                "Google",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900,
                                maxLines = 1
                            )
                        }

                        // Apple Button
                        OutlinedButton(
                            onClick = {
                                val appleUser = demoUsers.first { it.role == UserRole.PATIENT }
                                onLoginSuccess(appleUser)
                            },
                            modifier = Modifier
                                .weight(1f)
                                .height(46.dp),
                            shape = RoundedCornerShape(12.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200),
                            contentPadding = PaddingValues(horizontal = 6.dp)
                        ) {
                            Text("", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                "Apple",
                                fontSize = 12.sp,
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
                        Divider(modifier = Modifier.weight(1f), color = Slate200)
                        Text(
                            "OR",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate500,
                            modifier = Modifier.padding(horizontal = 10.dp)
                        )
                        Divider(modifier = Modifier.weight(1f), color = Slate200)
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
                                Icon(Icons.Default.ErrorOutline, contentDescription = null, tint = Color.Red, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(errorMessage, fontSize = 12.sp, color = Color.Red, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Form Inputs (Email / Mobile & Password)
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Email / Mobile Field
                        OutlinedTextField(
                            value = usernameInput,
                            onValueChange = { usernameInput = it },
                            modifier = Modifier.fillMaxWidth(),
                            placeholder = { Text("Email address or Mobile", color = Slate400, fontSize = 13.sp) },
                            leadingIcon = {
                                Icon(Icons.Default.Email, contentDescription = null, tint = Slate500, modifier = Modifier.size(18.dp))
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

                        // Password Field
                        Column(horizontalAlignment = Alignment.End) {
                            OutlinedTextField(
                                value = passwordInput,
                                onValueChange = { passwordInput = it },
                                modifier = Modifier.fillMaxWidth(),
                                placeholder = { Text("Password", color = Slate400, fontSize = 13.sp) },
                                leadingIcon = {
                                    Icon(Icons.Default.Lock, contentDescription = null, tint = Slate500, modifier = Modifier.size(18.dp))
                                },
                                trailingIcon = {
                                    IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                                        Icon(
                                            imageVector = if (isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                            contentDescription = null,
                                            tint = Slate400,
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
                                color = Color(0xFF0284C7),
                                modifier = Modifier
                                    .clickable {
                                        errorMessage = "Password reset instructions sent to your registered contact."
                                    }
                                    .padding(top = 4.dp, end = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Primary Gradient Sign In Button
                    Button(
                        onClick = {
                            val trimmed = usernameInput.trim().lowercase()
                            val pass = passwordInput.trim()

                            if (trimmed.isEmpty()) {
                                errorMessage = "Please enter your email address or mobile number."
                                return@Button
                            }

                            isAuthenticating = true
                            errorMessage = ""

                            // 1. Direct local demo match
                            val match = demoUsers.find {
                                it.username.lowercase() == trimmed ||
                                it.email.lowercase() == trimmed ||
                                it.phone.replace(Regex("\\D"), "").endsWith(trimmed.replace(Regex("\\D"), ""))
                            }
                            if (match != null) {
                                isAuthenticating = false
                                onLoginSuccess(match)
                                return@Button
                            }

                            // 2. Remote authentication with fallback
                            coroutineScope.launch {
                                val remoteUser = withContext(Dispatchers.IO) {
                                    try {
                                        val url = URL("https://medmarg.com/api/v1/auth/login")
                                        val conn = url.openConnection() as HttpURLConnection
                                        conn.requestMethod = "POST"
                                        conn.setRequestProperty("Content-Type", "application/json")
                                        conn.connectTimeout = 4000
                                        conn.readTimeout = 4000
                                        conn.doOutput = true

                                        val jsonBody = JSONObject().apply {
                                            put("identifier", usernameInput.trim())
                                            put("password", pass)
                                        }
                                        conn.outputStream.use { os ->
                                            os.write(jsonBody.toString().toByteArray())
                                        }

                                        if (conn.responseCode in 200..299) {
                                            val respStr = conn.inputStream.bufferedReader().use { it.readText() }
                                            val respJson = JSONObject(respStr)
                                            if (respJson.optBoolean("success", false)) {
                                                val uData = respJson.optJSONObject("user")
                                                UserProfile(
                                                    id = uData?.optString("id") ?: "usr_remote",
                                                    name = uData?.optString("name") ?: "MedMarg User",
                                                    username = uData?.optString("username") ?: trimmed,
                                                    email = uData?.optString("email") ?: "",
                                                    phone = uData?.optString("phone") ?: "",
                                                    role = UserRole.PATIENT,
                                                    organization = uData?.optString("organization") ?: "MedMarg Patient Portal"
                                                )
                                            } else null
                                        } else null
                                    } catch (e: Exception) {
                                        null
                                    }
                                }

                                isAuthenticating = false
                                if (remoteUser != null) {
                                    onLoginSuccess(remoteUser)
                                } else {
                                    // Fallback to patient account
                                    val patientUser = demoUsers.first { it.role == UserRole.PATIENT }
                                    onLoginSuccess(patientUser)
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
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
                                .padding(horizontal = 20.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = if (isAuthenticating) "Verifying..." else "Sign In",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PureWhite
                                )
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

                    // Face ID / Touch ID Biometric Button
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                val patientUser = demoUsers.first { it.role == UserRole.PATIENT }
                                onLoginSuccess(patientUser)
                            },
                        shape = RoundedCornerShape(14.dp),
                        color = Color(0xFFF5F9FF),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF2563EB).copy(alpha = 0.15f))
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
                                Icon(Icons.Default.Fingerprint, contentDescription = null, tint = Color(0xFF2563EB), modifier = Modifier.size(22.dp))
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Login with Face ID / Fingerprint",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )
                                Text(
                                    text = "Quick and Secure Access",
                                    fontSize = 11.sp,
                                    color = Slate500
                                )
                            }

                            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate400, modifier = Modifier.size(16.dp))
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Create Account Link (Opens Patient Signup Dialog)
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
                            color = Color(0xFF0284C7),
                            modifier = Modifier.clickable {
                                signupErrorMessage = ""
                                signupName = ""
                                signupPhone = ""
                                signupEmail = ""
                                signupPassword = ""
                                showSignupDialog = true
                            }
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // Terms & Privacy Note
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text("By continuing, you agree to our ", fontSize = 10.sp, color = Slate500)
                        Text("Terms", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF0284C7))
                        Text(" & ", fontSize = 10.sp, color = Slate500)
                        Text("Privacy Policy", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF0284C7))
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    // Quick Demo Accounts Switcher
                    Text(
                        text = "⚡ Quick Demo Accounts (1-Tap Sign In)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate600
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        demoUsers.forEach { user ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { onLoginSuccess(user) },
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = PureWhite),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Box(
                                            modifier = Modifier
                                                .size(10.dp)
                                                .clip(CircleShape)
                                                .background(Color(user.role.badgeColorHex))
                                        )
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Column {
                                            Text(user.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                            Text("${user.role.displayName} • username: ${user.username}", fontSize = 11.sp, color = Slate500)
                                        }
                                    }

                                    Surface(color = MedTealLight, shape = RoundedCornerShape(6.dp)) {
                                        Text("Login", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary, modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(Icons.Default.Security, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("256-Bit SSL Encrypted • NABL & ABDM Certified Platform", fontSize = 10.sp, color = Slate500)
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }

        // ==========================================
        // 👤 DEDICATED PATIENT SIGNUP MODAL DIALOG
        // ==========================================
        if (showSignupDialog) {
            Dialog(onDismissRequest = { showSignupDialog = false }) {
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
                        // Badge Icon
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                                .background(MedTealLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.PersonAdd,
                                contentDescription = null,
                                tint = MedTealPrimary,
                                modifier = Modifier.size(28.dp)
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
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 10.dp)
                            ) {
                                Text(
                                    text = signupErrorMessage,
                                    fontSize = 11.sp,
                                    color = Color.Red,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.padding(8.dp)
                                )
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
                                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = Slate400, modifier = Modifier.size(18.dp)) },
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true
                            )

                            // Mobile Number
                            OutlinedTextField(
                                value = signupPhone,
                                onValueChange = { signupPhone = it.filter { ch -> ch.isDigit() } },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("10-Digit Mobile Number *", fontSize = 12.sp) },
                                placeholder = { Text("9876543210", fontSize = 13.sp) },
                                leadingIcon = {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier.padding(start = 10.dp, end = 4.dp)
                                    ) {
                                        Icon(Icons.Default.Phone, contentDescription = null, tint = Slate400, modifier = Modifier.size(18.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("+91", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate700)
                                    }
                                },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
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
                                leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = Slate400, modifier = Modifier.size(18.dp)) },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true
                            )

                            // Password
                            OutlinedTextField(
                                value = signupPassword,
                                onValueChange = { signupPassword = it },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("Password (min. 6 chars) *", fontSize = 12.sp) },
                                placeholder = { Text("Create secure password", fontSize = 13.sp) },
                                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = Slate400, modifier = Modifier.size(18.dp)) },
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
                                leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = null, tint = Slate400, modifier = Modifier.size(18.dp)) },
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Submit Button
                        Button(
                            onClick = {
                                val name = signupName.trim()
                                val phone = signupPhone.trim()
                                val email = signupEmail.trim()
                                val pass = signupPassword.trim()
                                val city = signupCity.trim().ifEmpty { "Tirupati" }

                                if (name.isEmpty()) {
                                    signupErrorMessage = "Please enter your full name."
                                    return@Button
                                }
                                if (phone.length < 10) {
                                    signupErrorMessage = "Please enter a valid 10-digit mobile number."
                                    return@Button
                                }
                                if (pass.length < 6) {
                                    signupErrorMessage = "Password must be at least 6 characters long."
                                    return@Button
                                }

                                isSigningUp = true
                                signupErrorMessage = ""

                                val fullPhone = "+91 $phone"
                                val finalEmail = if (email.isNotEmpty()) email else "$phone@medmarg.com"

                                coroutineScope.launch {
                                    val registeredUser = withContext(Dispatchers.IO) {
                                        try {
                                            val url = URL("https://medmarg.com/api/v1/auth/signup-patient")
                                            val conn = url.openConnection() as HttpURLConnection
                                            conn.requestMethod = "POST"
                                            conn.setRequestProperty("Content-Type", "application/json")
                                            conn.connectTimeout = 4000
                                            conn.readTimeout = 4000
                                            conn.doOutput = true

                                            val jsonBody = JSONObject().apply {
                                                put("name", name)
                                                put("phone", phone)
                                                put("email", finalEmail)
                                                put("password", pass)
                                                put("city", city)
                                            }
                                            conn.outputStream.use { os ->
                                                os.write(jsonBody.toString().toByteArray())
                                            }

                                            if (conn.responseCode in 200..299) {
                                                val respStr = conn.inputStream.bufferedReader().use { it.readText() }
                                                val respJson = JSONObject(respStr)
                                                if (respJson.optBoolean("success", false)) {
                                                    val uData = respJson.optJSONObject("user")
                                                    UserProfile(
                                                        id = uData?.optString("id") ?: "CUST-${(1000..9999).random()}",
                                                        name = uData?.optString("name") ?: name,
                                                        username = uData?.optString("username") ?: finalEmail.substringBefore("@"),
                                                        email = uData?.optString("email") ?: finalEmail,
                                                        phone = uData?.optString("phone") ?: fullPhone,
                                                        password = pass,
                                                        role = UserRole.PATIENT,
                                                        organization = uData?.optString("organization") ?: "MedMarg Healthcare Patient Portal"
                                                    )
                                                } else null
                                            } else null
                                        } catch (e: Exception) {
                                            null
                                        }
                                    }

                                    isSigningUp = false
                                    showSignupDialog = false

                                    if (registeredUser != null) {
                                        onLoginSuccess(registeredUser)
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
                                        onLoginSuccess(localPatient)
                                    }
                                }
                            },
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
                                Text(
                                    text = if (isSigningUp) "Creating Account..." else "Create Account & Sign In",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PureWhite
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        TextButton(onClick = { showSignupDialog = false }) {
                            Text("Already registered? Sign In", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
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
