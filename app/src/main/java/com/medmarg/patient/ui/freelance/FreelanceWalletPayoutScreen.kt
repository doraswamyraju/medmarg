package com.medmarg.patient.ui.freelance

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.model.FreelancePayoutRequest
import com.medmarg.patient.model.FreelanceWalletSummary
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*

// =========================================================================
// 💰 FREELANCE WALLET & INSTANT PAYOUTS SCREEN (TAB 3)
// Replicated 1-on-1 with iOS FreelanceWalletPayoutView.swift
// =========================================================================

@Composable
fun FreelanceWalletPayoutScreen(
    user: UserProfile,
    modifier: Modifier = Modifier
) {
    var wallet by remember { mutableStateOf(FreelanceWalletSummary()) }
    var showWithdrawDialog by remember { mutableStateOf(false) }
    var showEditBankDialog by remember { mutableStateOf(false) }
    var withdrawAmount by remember { mutableStateOf("2000") }
    var actionBanner by remember { mutableStateOf<String?>(null) }

    var payoutHistory by remember {
        mutableStateOf(
            listOf(
                FreelancePayoutRequest("PAY-4891", 3500, "PROCESSED", "Yesterday, 06:30 PM", "vikram.mlt@oksbi", "UTR890124119"),
                FreelancePayoutRequest("PAY-4820", 4200, "PROCESSED", "28-Oct-2026", "vikram.mlt@oksbi", "UTR778219002"),
                FreelancePayoutRequest("PAY-4765", 2800, "PROCESSED", "24-Oct-2026", "vikram.mlt@oksbi", "UTR665129841")
            )
        )
    }

    Box(modifier = modifier.fillMaxSize().background(Slate50)) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(PureWhite)
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Freelance Gig Wallet",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900,
                    modifier = Modifier.weight(1f)
                )

                Button(
                    onClick = { showWithdrawDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00B86B)),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("Withdraw", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }

            actionBanner?.let { banner ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFF00B86B))
                        .padding(horizontal = 10.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(banner, fontSize = 12.sp, color = PureWhite, modifier = Modifier.weight(1f))
                    Icon(
                        Icons.Default.Close,
                        contentDescription = "Close",
                        tint = PureWhite,
                        modifier = Modifier.size(16.dp).clickable { actionBanner = null }
                    )
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 12.dp)
                    .padding(bottom = 90.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Wallet Balance Hero Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text("Available for Withdrawal", fontSize = 12.sp, color = Slate500)
                        Text("₹${wallet.availableBalance}", fontSize = 32.sp, fontWeight = FontWeight.Black, color = Color(0xFF00B86B))

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Lifetime Earnings", fontSize = 10.sp, color = Slate400)
                                Text("₹${wallet.totalLifetimeEarnings}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            }
                            Column {
                                Text("Completed Gigs", fontSize = 10.sp, color = Slate400)
                                Text("${wallet.completedGigs} Visits", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF2563EB))
                            }
                            Column {
                                Text("Pending Payouts", fontSize = 10.sp, color = Slate400)
                                Text("₹${wallet.pendingPayouts}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = AmberWarning)
                            }
                        }
                    }
                }

                // Linked Payout Account Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                    elevation = CardDefaults.cardElevation(1.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Linked Payout Destination", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900)
                            Text(
                                text = "Edit",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = MedTealPrimary,
                                modifier = Modifier.clickable { showEditBankDialog = true }
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.AccountBalance, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text("Primary UPI ID: ${wallet.upiId}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate800)
                                Text("Bank: ${wallet.bankAccountNumber} (${wallet.bankIfsc})", fontSize = 11.sp, color = Slate500)
                            }
                        }
                    }
                }

                // Payout History
                Text("Payout History", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)

                payoutHistory.forEach { req ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        elevation = CardDefaults.cardElevation(1.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(EmeraldLight),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Check, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(18.dp))
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text("₹${req.amount} Payout Credited", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                Text("${req.id} • ${req.date}", fontSize = 11.sp, color = Slate500)
                            }

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(EmeraldLight)
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text(req.status, fontSize = 9.sp, fontWeight = FontWeight.Black, color = EmeraldAccent)
                            }
                        }
                    }
                }
            }
        }
    }

    // Withdraw Dialog
    if (showWithdrawDialog) {
        AlertDialog(
            onDismissRequest = { showWithdrawDialog = false },
            title = { Text("Instant Wallet Payout", fontSize = 16.sp, fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    Text("Transfer available balance directly to your verified UPI ID (${wallet.upiId}):", fontSize = 12.sp, color = Slate600)
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = withdrawAmount,
                        onValueChange = { withdrawAmount = it },
                        label = { Text("Amount (₹)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val amt = withdrawAmount.toIntOrNull() ?: 1000
                        wallet = wallet.copy(availableBalance = maxOf(0, wallet.availableBalance - amt))
                        showWithdrawDialog = false
                        actionBanner = "₹$amt payout initiated! Funds will credit in ~10 minutes."
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00B86B))
                ) {
                    Text("Confirm Transfer")
                }
            },
            dismissButton = {
                TextButton(onClick = { showWithdrawDialog = false }) {
                    Text("Cancel", color = Slate500)
                }
            }
        )
    }

    // Edit Bank Dialog
    if (showEditBankDialog) {
        var tempUpi by remember { mutableStateOf(wallet.upiId) }
        AlertDialog(
            onDismissRequest = { showEditBankDialog = false },
            title = { Text("Update Payout UPI / Bank", fontSize = 16.sp, fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    OutlinedTextField(
                        value = tempUpi,
                        onValueChange = { tempUpi = it },
                        label = { Text("UPI ID (VPA)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        wallet = wallet.copy(upiId = tempUpi)
                        showEditBankDialog = false
                        actionBanner = "Payout details updated successfully!"
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditBankDialog = false }) {
                    Text("Cancel", color = Slate500)
                }
            }
        )
    }
}

