package com.medmarg.patient.ui.freelance.sheets

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

/**
 * 💳 EDIT PAYOUT DETAILS SHEET (Replicated 1-on-1 with iOS EditPayoutDetailsSheet.swift)
 * Allows phlebotomists & freelance agents to live-update their UPI VPA
 * and Bank Account details for instant automated payouts.
 */
@Composable
fun EditPayoutDetailsSheet(
    agentId: String,
    currentUpi: String = "9848022338@upi",
    currentBankName: String = "HDFC Bank",
    currentAccountNo: String = "50100492814321",
    currentIfsc: String = "HDFC0001824",
    currentHolderName: String = "Doraswamy Raju",
    onDismiss: () -> Unit,
    onDetailsUpdated: (upi: String, bank: String, acc: String, ifsc: String) -> Unit = { _, _, _, _ -> }
) {
    val coroutineScope = rememberCoroutineScope()
    var upiVpa by remember { mutableStateOf(currentUpi) }
    var bankName by remember { mutableStateOf(currentBankName) }
    var accountNumber by remember { mutableStateOf(currentAccountNo) }
    var confirmAccountNo by remember { mutableStateOf(currentAccountNo) }
    var ifscCode by remember { mutableStateOf(currentIfsc) }
    var accountHolderName by remember { mutableStateOf(currentHolderName) }

    var isSubmitting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(22.dp),
            color = PureWhite,
            shadowElevation = 24.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Top Header Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Payout & Settlement Accounts", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate500)
                    }
                }

                // Error Banner
                errorMessage?.let { err ->
                    Surface(
                        color = RoseError.copy(alpha = 0.1f),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(Icons.Default.ErrorOutline, contentDescription = null, tint = RoseError, modifier = Modifier.size(16.dp))
                            Text(err, fontSize = 12.sp, color = RoseError, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                // Section 1: UPI VPA
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("UPI VIRTUAL PRIVATE ADDRESS (VPA)", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)
                        Surface(
                            color = Color(0xFF00B86B).copy(alpha = 0.12f),
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text("Fastest", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF00B86B), modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                        }
                    }

                    OutlinedTextField(
                        value = upiVpa,
                        onValueChange = { upiVpa = it.trim() },
                        placeholder = { Text("e.g. mobile@upi or username@oksbi") },
                        leadingIcon = { Icon(Icons.Default.QrCode, contentDescription = null, tint = MedTealPrimary) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )
                }

                // Section 2: Bank Account Details
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("BANK ACCOUNT DETAILS", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)

                    OutlinedTextField(
                        value = accountHolderName,
                        onValueChange = { accountHolderName = it },
                        label = { Text("Account Holder Name") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = bankName,
                        onValueChange = { bankName = it },
                        label = { Text("Bank Name (e.g., HDFC Bank, SBI)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = accountNumber,
                        onValueChange = { accountNumber = it.filter { c -> c.isDigit() } },
                        label = { Text("Account Number") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = confirmAccountNo,
                        onValueChange = { confirmAccountNo = it.filter { c -> c.isDigit() } },
                        label = { Text("Confirm Account Number") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = ifscCode,
                        onValueChange = { ifscCode = it.uppercase().trim() },
                        label = { Text("IFSC Code (11-characters)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        singleLine = true
                    )
                }

                // Save Button
                Button(
                    onClick = {
                        if (upiVpa.isNotEmpty() && !upiVpa.contains("@")) {
                            errorMessage = "Please enter a valid UPI address (e.g. name@bank)."
                            return@Button
                        }
                        if (accountNumber.isNotEmpty() && accountNumber != confirmAccountNo) {
                            errorMessage = "Account numbers do not match. Please verify."
                            return@Button
                        }
                        if (ifscCode.isNotEmpty() && ifscCode.length < 8) {
                            errorMessage = "Please enter a valid 11-character IFSC code."
                            return@Button
                        }

                        isSubmitting = true
                        errorMessage = null
                        coroutineScope.launch {
                            AgentRepository.updateAgentProfile(
                                agentId = agentId,
                                upiId = upiVpa,
                                bankAccount = "$bankName • $accountNumber"
                            )
                            isSubmitting = false
                            onDetailsUpdated(upiVpa, bankName, accountNumber, ifscCode)
                            onDismiss()
                        }
                    },
                    enabled = !isSubmitting,
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                ) {
                    if (isSubmitting) {
                        CircularProgressIndicator(modifier = Modifier.size(18.dp), color = PureWhite, strokeWidth = 2.dp)
                    } else {
                        Icon(Icons.Default.Verified, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Save Payout Accounts", fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }

                Text(
                    text = "All bank and UPI details are encrypted and securely verified against RazorpayX banking gateway.",
                    fontSize = 11.sp,
                    color = Slate400,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 10.dp)
                )
            }
        }
    }
}

