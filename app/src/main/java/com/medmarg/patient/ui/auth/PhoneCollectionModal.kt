package com.medmarg.patient.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PhoneCallback
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*

@Composable
fun PhoneCollectionModal(
    pendingUser: UserProfile,
    onDismiss: () -> Unit,
    onPhoneConfirmed: (fullName: String, formattedPhone: String) -> Unit
) {
    var nameInput by remember { mutableStateOf(pendingUser.name) }
    var phoneInput by remember { mutableStateOf("") }
    var errorText by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
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
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(MedTealLight),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.PhoneCallback,
                        contentDescription = null,
                        tint = MedTealPrimary,
                        modifier = Modifier.size(30.dp)
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Complete Your Profile",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "Signed in as ${pendingUser.email}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MedTealPrimary
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "Please confirm your name and 10-digit mobile number for doorstep phlebotomist coordination and live sample tracking OTPs.",
                    fontSize = 12.sp,
                    color = Slate500,
                    textAlign = TextAlign.Center
                )

                if (errorText.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = errorText,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFDC2626)
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Full Name Input
                OutlinedTextField(
                    value = nameInput,
                    onValueChange = {
                        nameInput = it
                        errorText = ""
                    },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Patient Full Name", fontSize = 12.sp) },
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MedTealPrimary,
                        unfocusedBorderColor = Slate200,
                        focusedContainerColor = Slate50,
                        unfocusedContainerColor = Slate50
                    )
                )

                Spacer(modifier = Modifier.height(10.dp))

                // 10-Digit Mobile Input
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Surface(
                        color = Slate100,
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(
                            text = "+91",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate700,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 15.dp)
                        )
                    }

                    OutlinedTextField(
                        value = phoneInput,
                        onValueChange = {
                            phoneInput = it.filter { ch -> ch.isDigit() }.take(10)
                            errorText = ""
                        },
                        modifier = Modifier.weight(1f),
                        placeholder = { Text("10-digit mobile number", fontSize = 14.sp, color = Slate400) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = MedTealPrimary,
                            unfocusedBorderColor = Slate200,
                            focusedContainerColor = Slate50,
                            unfocusedContainerColor = Slate50
                        )
                    )
                }

                Spacer(modifier = Modifier.height(18.dp))

                Button(
                    onClick = {
                        val cleanDigits = phoneInput.filter { it.isDigit() }
                        if (nameInput.trim().length < 2) {
                            errorText = "Please enter your full name."
                            return@Button
                        }
                        if (cleanDigits.length < 10) {
                            errorText = "Please enter a valid 10-digit mobile number."
                            return@Button
                        }
                        onPhoneConfirmed(nameInput.trim(), "+91 ${cleanDigits.takeLast(10)}")
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                ) {
                    Text(
                        text = "Save & Continue to Patient Panel",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                }
            }
        }
    }
}

