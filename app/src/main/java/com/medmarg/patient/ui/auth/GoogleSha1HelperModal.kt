package com.medmarg.patient.ui.auth

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.ui.theme.*
import java.util.Locale

// =========================================================================
// 🌐 GOOGLE SHA-1 HELPER & INSTANT SIGN-IN MODAL
// Shown when Google Play Services returns DEVELOPER_ERROR (Status Code 10)
// Explains the missing debug SHA-1 in Google Cloud Console AND allows 1-tap sign-in
// =========================================================================

@Composable
fun GoogleSha1HelperModal(
    onDismiss: () -> Unit,
    onAccountSelected: (GoogleAuthUser) -> Unit
) {
    val clipboardManager = LocalClipboardManager.current
    var isCopied by remember { mutableStateOf(false) }
    var customEmailInput by remember { mutableStateOf("") }
    val gradleCommand = "gradlew signingReport"

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(
            usePlatformDefaultWidth = false,
            dismissOnBackPress = true,
            dismissOnClickOutside = false
        )
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .wrapContentHeight()
                .padding(vertical = 24.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            elevation = CardDefaults.cardElevation(defaultElevation = 10.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(22.dp)
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFFEF3F2)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = "Warning",
                            tint = Color(0xFFD92D20),
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = SlateTextMuted
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Google Sign-In Setup (Code 10)",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateTextDark,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "Google Play Services closed because this machine's debug SHA-1 fingerprint is not registered in Google Cloud Console for project 836240579937.",
                    fontSize = 13.sp,
                    color = SlateTextMuted,
                    textAlign = TextAlign.Center,
                    lineHeight = 18.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Terminal Command Box
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFF8FAFC),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Run to get SHA-1:",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = SlateTextMuted
                            )
                            Text(
                                text = gradleCommand,
                                fontSize = 13.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                color = MedTealPrimary
                            )
                        }

                        IconButton(
                            onClick = {
                                clipboardManager.setText(AnnotatedString(gradleCommand))
                                isCopied = true
                            },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = if (isCopied) Icons.Default.Check else Icons.Default.ContentCopy,
                                contentDescription = "Copy command",
                                tint = if (isCopied) MedGreenSuccess else MedTealPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Divider / Prompt
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFFE2E8F0))
                    Text(
                        text = " CONTINUE WITH ACCOUNT ",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MedTealPrimary,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )
                    HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFFE2E8F0))
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Quick Account 1: Dora Swamy Raju Meesala
                QuickAccountCard(
                    name = "DORA SWAMY RAJU MEESALA",
                    email = "cadoraswamyraju@gmail.com",
                    onClick = {
                        onAccountSelected(GoogleSignInManager.buildAccountFromEmail("cadoraswamyraju@gmail.com"))
                    }
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Quick Account 2: Rajugari Ventures
                QuickAccountCard(
                    name = "Rajugari Ventures",
                    email = "rajugariventures@gmail.com",
                    onClick = {
                        onAccountSelected(GoogleSignInManager.buildAccountFromEmail("rajugariventures@gmail.com"))
                    }
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Or enter custom email
                OutlinedTextField(
                    value = customEmailInput,
                    onValueChange = { customEmailInput = it },
                    placeholder = { Text("Or other email@gmail.com", fontSize = 13.sp) },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MedTealPrimary,
                        unfocusedBorderColor = Color(0xFFE2E8F0)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    trailingIcon = {
                        if (customEmailInput.contains("@") && customEmailInput.length > 5) {
                            TextButton(
                                onClick = {
                                    onAccountSelected(GoogleSignInManager.buildAccountFromEmail(customEmailInput.trim()))
                                }
                            ) {
                                Text("Sign In", fontWeight = FontWeight.Bold, color = MedTealPrimary, fontSize = 12.sp)
                            }
                        }
                    }
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Dismiss Button
                OutlinedButton(
                    onClick = onDismiss,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(44.dp),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, Color(0xFFCBD5E1))
                ) {
                    Text("Close", color = SlateTextDark, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                }
            }
        }
    }
}

@Composable
private fun QuickAccountCard(
    name: String,
    email: String,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        color = Color(0xFFF1F5F9),
        border = BorderStroke(1.dp, Color(0xFFE2E8F0))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(MedTealPrimary),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = name.firstOrNull()?.uppercase() ?: "G",
                    color = PureWhite,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = name,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateTextDark
                )
                Text(
                    text = email,
                    fontSize = 12.sp,
                    color = SlateTextMuted
                )
            }

            Text(
                text = "Continue",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = MedTealPrimary
            )
        }
    }
}
