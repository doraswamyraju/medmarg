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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.R
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.model.UserRole
import com.medmarg.patient.ui.theme.*

@Composable
fun LoginScreen(
    onLoginSuccess: (UserProfile) -> Unit,
    onGoogleSignInClicked: () -> Unit
) {
    var usernameInput by remember { mutableStateOf("patient") }
    var passwordInput by remember { mutableStateOf("password123") }
    var isPasswordVisible by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var currentCity by remember { mutableStateOf("Tirupati, Andhra Pradesh") }

    val demoUsers = listOf(
        UserProfile("usr_pat", "Rahul Sharma", "patient", "patient@medmarg.com", "+91 98765 43210", "password123", UserRole.PATIENT, "Air Bypass Road, Tirupati - 517501"),
        UserProfile("usr_doc", "Dr. Ananya Sharma, MD", "doctor", "doctor@medmarg.com", "+91 98765 11111", "password123", UserRole.DOCTOR, "MedMarg Care Clinic, Tirupati"),
        UserProfile("usr_admin", "MedMarg Super Admin", "admin", "admin@medmarg.com", "+91 98765 00000", "password123", UserRole.ADMIN, "MedMarg Central Governance"),
        UserProfile("usr_agent", "Ramesh Kumar (Phlebo AG-01)", "agent", "agent@medmarg.com", "+91 98765 55555", "password123", UserRole.COLLECTION_AGENT, "Tirupati Field Collection Fleet"),
        UserProfile("usr_pharma", "MedPlus Generic Chemist", "pharmacy", "pharmacy@medmarg.com", "+91 98765 44444", "password123", UserRole.PHARMACY, "Generic Pharmacy Hub, Tirupati"),
        UserProfile("usr_scan", "Aarthi Scans & Radiology", "scans", "scans@medmarg.com", "+91 98765 33333", "password123", UserRole.SCAN_CENTER, "Siemens 3.0T MRI Center, Tirupati")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
            .statusBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // Branding Header with Official App Icon & Logo
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Image(
                painter = painterResource(id = R.drawable.logo_icon),
                contentDescription = "MedMarg Icon",
                contentScale = androidx.compose.ui.layout.ContentScale.Fit,
                modifier = Modifier
                    .size(72.dp)
                    .clip(RoundedCornerShape(18.dp))
            )

            Spacer(modifier = Modifier.height(10.dp))

            Image(
                painter = painterResource(id = R.drawable.logo),
                contentDescription = "MedMarg Official Logo",
                contentScale = androidx.compose.ui.layout.ContentScale.Fit,
                modifier = Modifier
                    .height(34.dp)
                    .width(150.dp)
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "HEALTH & DIAGNOSTICS PLATFORM",
                fontSize = 10.sp,
                fontWeight = FontWeight.Black,
                color = EmeraldAccent,
                letterSpacing = 1.2.sp
            )

            Text(
                text = "Single-Provider Diagnostic & Open Healthcare Platform",
                fontSize = 12.sp,
                color = Slate500,
                modifier = Modifier.padding(top = 2.dp)
            )
        }

        // Location Badge
        Surface(
            color = MedTealLight,
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.padding(top = 10.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.LocationOn, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(currentCity, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealDark)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Sign In Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = "Sign In to Your Account",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Text(
                    text = "Enter your credentials or continue with Google",
                    fontSize = 12.sp,
                    color = Slate500
                )

                if (errorMessage.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        color = RoseErrorLight,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.ErrorOutline, contentDescription = null, tint = RoseError, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(errorMessage, fontSize = 12.sp, color = RoseError, fontWeight = FontWeight.Medium)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Username / Email Field
                Text("Username, Email or Mobile", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate700)
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = usernameInput,
                    onValueChange = { usernameInput = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("e.g. patient, doctor, admin, agent", color = Slate400, fontSize = 13.sp) },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(18.dp)) },
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MedTealPrimary,
                        unfocusedBorderColor = Slate200,
                        focusedContainerColor = Slate50,
                        unfocusedContainerColor = Slate50
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Password Field
                Text("Password", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate700)
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = passwordInput,
                    onValueChange = { passwordInput = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("Enter password", color = Slate400, fontSize = 13.sp) },
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(18.dp)) },
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
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MedTealPrimary,
                        unfocusedBorderColor = Slate200,
                        focusedContainerColor = Slate50,
                        unfocusedContainerColor = Slate50
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Sign In Button
                Button(
                    onClick = {
                        val trimmed = usernameInput.trim().lowercase()
                        if (trimmed.isEmpty()) {
                            errorMessage = "Please enter username or email"
                            return@Button
                        }
                        val match = demoUsers.find { it.username.lowercase() == trimmed || it.email.lowercase() == trimmed }
                        if (match != null) {
                            onLoginSuccess(match)
                        } else {
                            val patientUser = demoUsers.first { it.role == UserRole.PATIENT }
                            onLoginSuccess(patientUser)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                ) {
                    Text("Sign In", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(18.dp))
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Divider
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Divider(modifier = Modifier.weight(1f), color = Slate200)
                    Text("OR CONTINUE WITH", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate400, modifier = Modifier.padding(horizontal = 8.dp))
                    Divider(modifier = Modifier.weight(1f), color = Slate200)
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Google Sign In Button
                OutlinedButton(
                    onClick = onGoogleSignInClicked,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, Slate200)
                ) {
                    Text("G", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color(0xFFEA4335))
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("Continue with Google", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate900)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

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

        Spacer(modifier = Modifier.height(20.dp))

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(Icons.Default.Security, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("256-Bit SSL Encrypted • NABL & ABDM Certified Platform", fontSize = 10.sp, color = Slate500)
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}
