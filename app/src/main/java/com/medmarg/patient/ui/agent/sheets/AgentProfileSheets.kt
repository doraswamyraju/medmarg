package com.medmarg.patient.ui.agent.sheets

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
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
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// 👤 AGENT PROFILE SHEETS (EDIT PROFILE & DOCUMENT PREVIEW)
// 1-on-1 replication of ios/Agent/Views/AgentProfileView.swift sheets
// =========================================================================

@Composable
fun AgentEditProfileSheet(
    agentId: String,
    currentName: String,
    currentPhone: String,
    currentEmail: String,
    currentBankAccount: String,
    currentUpiId: String,
    onDismiss: () -> Unit,
    onSaved: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var name by remember { mutableStateOf(currentName) }
    var phone by remember { mutableStateOf(currentPhone) }
    var email by remember { mutableStateOf(currentEmail) }
    var bankAccount by remember { mutableStateOf(currentBankAccount) }
    var upiId by remember { mutableStateOf(currentUpiId) }
    var isSubmitting by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Edit Profile", fontSize = 17.sp, fontWeight = FontWeight.Black)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("PERSONAL INFORMATION", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Slate500)
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Full Name") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Mobile Number") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email Address") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(4.dp))
                Text("PAYOUT & BANKING", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Slate500)
                OutlinedTextField(
                    value = bankAccount,
                    onValueChange = { bankAccount = it },
                    label = { Text("Bank Account") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                OutlinedTextField(
                    value = upiId,
                    onValueChange = { upiId = it },
                    label = { Text("UPI ID (for instant settlement)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    coroutineScope.launch {
                        isSubmitting = true
                        AgentRepository.updateAgentProfile(
                            agentId = agentId,
                            name = name,
                            phone = phone,
                            email = email,
                            bankAccount = bankAccount,
                            upiId = upiId
                        )
                        isSubmitting = false
                        onSaved()
                        onDismiss()
                    }
                },
                enabled = !isSubmitting,
                colors = ButtonDefaults.buttonColors(containerColor = MedTealDark)
            ) {
                Text(if (isSubmitting) "Saving..." else "Save Profile Updates", fontWeight = FontWeight.Bold, color = PureWhite)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun AgentDocumentPreviewSheet(
    documentTitle: String,
    agentName: String,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Document Verification", fontSize = 16.sp, fontWeight = FontWeight.Black)
        },
        text = {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                elevation = CardDefaults.cardElevation(4.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Verified,
                        contentDescription = null,
                        tint = EmeraldAccent,
                        modifier = Modifier.size(48.dp)
                    )
                    Text(
                        text = documentTitle,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900,
                        textAlign = TextAlign.Center
                    )
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("Issued to: $agentName", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Slate700)
                        Text("NABL Quality Protocol Verified", fontSize = 12.sp, color = EmeraldAccent)
                        Text("Valid Thru: Dec 2027", fontSize = 11.sp, color = Slate500)
                    }
                    HorizontalDivider(color = Slate200)
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Icon(Icons.Default.Security, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(16.dp))
                        Text("MedMarg Trust & Credential Verification Vault", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate500)
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
            ) {
                Text("Done", fontWeight = FontWeight.Bold, color = PureWhite)
            }
        }
    )
}

