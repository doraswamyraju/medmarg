package com.medmarg.patient.ui.freelance.sheets

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * ⚡ FREELANCE WALLET PAYOUT SHEET (Replicated 1-on-1 with iOS FreelanceWalletPayoutSheet.swift)
 * Instant cashout request to UPI VPA or Bank Account.
 */
@Composable
fun FreelanceWalletPayoutSheet(
    availableBalance: Int,
    upiVpa: String = "vikram.mlt@oksbi",
    bankAccount: String = "HDFC Bank (A/C: ****4321)",
    ifscCode: String = "HDFC0001824",
    onDismiss: () -> Unit,
    onPayoutSubmitted: (amount: Int, method: String) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var amountString by remember { mutableStateOf("") }
    var selectedMethod by remember { mutableStateOf("UPI") } // "UPI" or "BANK"
    var isSubmitting by remember { mutableStateOf(false) }
    var successReceipt by remember { mutableStateOf<String?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val parsedAmount = amountString.toIntOrNull() ?: 0

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
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Request Instant Payout", fontSize = 17.sp, fontWeight = FontWeight.Black, color = Slate900)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate500)
                    }
                }

                if (successReceipt != null) {
                    // Success View
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF00B86B).copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF00B86B), modifier = Modifier.size(40.dp))
                        }

                        Text("Payout Requested Successfully!", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                        val dest = if (selectedMethod == "UPI") upiVpa else bankAccount
                        Text(
                            "₹$parsedAmount will be credited to $dest within 15–30 minutes.",
                            fontSize = 12.sp,
                            color = Slate600,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )

                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MedTealLight
                        ) {
                            Text(
                                "Ref ID: $successReceipt",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MedTealPrimary,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Button(
                            onClick = onDismiss,
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                        ) {
                            Text("Done", fontWeight = FontWeight.Bold, color = PureWhite)
                        }
                    }
                } else {
                    // Balance Hero Card
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        color = PureWhite,
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text("Available for Instant Cashout", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate500)
                            Text("₹$availableBalance", fontSize = 32.sp, fontWeight = FontWeight.Black, color = Color(0xFF00B86B))
                            Surface(
                                color = Color(0xFF00B86B).copy(alpha = 0.12f),
                                shape = RoundedCornerShape(20.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Icon(Icons.Default.Bolt, contentDescription = null, tint = Color(0xFF00B86B), modifier = Modifier.size(12.dp))
                                    Text("Instant 24/7 UPI Gateway Payout", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF00B86B))
                                }
                            }
                        }
                    }

                    // Amount Input & Quick Chips
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("ENTER PAYOUT AMOUNT", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)

                        OutlinedTextField(
                            value = amountString,
                            onValueChange = { amountString = it.filter { c -> c.isDigit() } },
                            prefix = { Text("₹ ", fontWeight = FontWeight.Bold, fontSize = 18.sp) },
                            placeholder = { Text("Enter amount (min ₹100)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )

                        // Quick Chips
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(500, 1000, 2000).forEach { amt ->
                                Surface(
                                    modifier = Modifier.clickable { amountString = "$amt" },
                                    shape = RoundedCornerShape(8.dp),
                                    color = Slate100
                                ) {
                                    Text("₹$amt", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate700, modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp))
                                }
                            }

                            Surface(
                                modifier = Modifier.clickable { amountString = "$availableBalance" },
                                shape = RoundedCornerShape(8.dp),
                                color = MedTealLight
                            ) {
                                Text("Full Balance", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary, modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp))
                            }
                        }
                    }

                    // Payout Destination
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("PAYOUT DESTINATION", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)

                        // UPI Option
                        Surface(
                            modifier = Modifier.fillMaxWidth().clickable { selectedMethod = "UPI" },
                            shape = RoundedCornerShape(12.dp),
                            color = if (selectedMethod == "UPI") MedTealLight.copy(alpha = 0.4f) else Slate50,
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (selectedMethod == "UPI") MedTealPrimary else Slate200)
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text("UPI Virtual Private Address (VPA)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                    Text(upiVpa, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate600)
                                }
                                Surface(
                                    color = Color(0xFF00B86B).copy(alpha = 0.12f),
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Text("Instant", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF00B86B), modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                                }
                            }
                        }

                        // Bank Account Option
                        Surface(
                            modifier = Modifier.fillMaxWidth().clickable { selectedMethod = "BANK" },
                            shape = RoundedCornerShape(12.dp),
                            color = if (selectedMethod == "BANK") MedTealLight.copy(alpha = 0.4f) else Slate50,
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (selectedMethod == "BANK") MedTealPrimary else Slate200)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("Direct Bank Account Transfer", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                Text("$bankAccount • IFSC: $ifscCode", fontSize = 11.sp, color = Slate600)
                            }
                        }
                    }

                    errorMessage?.let {
                        Text(it, fontSize = 11.sp, color = RoseError)
                    }

                    // Submit Button
                    Button(
                        onClick = {
                            if (parsedAmount < 100) {
                                errorMessage = "Minimum withdrawal amount is ₹100"
                                return@Button
                            }
                            if (parsedAmount > availableBalance) {
                                errorMessage = "Requested amount exceeds available balance"
                                return@Button
                            }
                            isSubmitting = true
                            errorMessage = null
                            coroutineScope.launch {
                                delay(600)
                                val ref = "UTR-${(1000000..9999999).random()}"
                                successReceipt = ref
                                isSubmitting = false
                                onPayoutSubmitted(parsedAmount, selectedMethod)
                            }
                        },
                        enabled = !isSubmitting && parsedAmount > 0,
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00B86B))
                    ) {
                        if (isSubmitting) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), color = PureWhite, strokeWidth = 2.dp)
                        } else {
                            Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Confirm Withdrawal of ₹$parsedAmount", fontWeight = FontWeight.Bold, color = PureWhite)
                        }
                    }
                }
            }
        }
    }
}
