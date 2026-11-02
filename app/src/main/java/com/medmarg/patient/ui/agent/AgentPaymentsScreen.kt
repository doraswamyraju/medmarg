package com.medmarg.patient.ui.agent

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// 💳 AGENT PAYMENTS & COLLECTIONS LEDGER (TAB 3)
// 100% Live Backend Parity with iOS AgentPaymentsView.swift
// =========================================================================

@Composable
fun AgentPaymentsScreen(
    user: UserProfile,
    onTabSelected: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "AG-01"

    var orders by remember { mutableStateOf<List<AgentPickupOrder>>(emptyList()) }
    var selectedFilter by remember { mutableStateOf("ALL") } // ALL, QR, CASH, PREPAID
    var activeQrOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var actionBanner by remember { mutableStateOf<String?>(null) }

    fun refreshPayments() {
        coroutineScope.launch {
            orders = AgentRepository.fetchRoster(effectiveAgentId)
        }
    }

    LaunchedEffect(Unit) {
        refreshPayments()
    }

    val totalCollected = orders.filter { it.isPaid }.sumOf { it.effectiveAmount }
    val qrCollected = orders.filter { it.isPaid && (it.paymentMode?.contains("QR") == true || it.paymentStatus == "PAID_DOORSTEP_QR") }.sumOf { it.effectiveAmount }
    val cashCollected = orders.filter { it.isPaid && (it.paymentMode?.contains("CASH") == true || it.paymentStatus == "CASH_COLLECTED") }.sumOf { it.effectiveAmount }
    val pendingAmount = orders.filter { !it.isPaid }.sumOf { it.effectiveAmount }

    val filteredOrders = orders.filter { ord ->
        when (selectedFilter) {
            "QR" -> ord.paymentMode?.contains("QR") == true || ord.paymentStatus == "PAID_DOORSTEP_QR"
            "CASH" -> ord.paymentMode?.contains("CASH") == true || ord.paymentStatus == "CASH_COLLECTED"
            "PREPAID" -> ord.paymentStatus == "PAID_ONLINE" || ord.paymentStatus == "PAID_SUCCESS"
            else -> true
        }
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
                    text = "Collections & Payments Ledger",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900,
                    modifier = Modifier.weight(1f)
                )

                IconButton(onClick = { refreshPayments() }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = MedTealPrimary)
                }
            }

            actionBanner?.let { banner ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MedTealPrimary)
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
                // Today's Collections Summary Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Today's Total Handover Collections", fontSize = 12.sp, color = Slate500)
                        Text("₹$totalCollected", fontSize = 28.sp, fontWeight = FontWeight.Black, color = MedTealPrimary)

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Doorstep QR (UPI)", fontSize = 10.sp, color = Slate400)
                                Text("₹$qrCollected", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF2563EB))
                            }
                            Column {
                                Text("Cash Handover", fontSize = 10.sp, color = Slate400)
                                Text("₹$cashCollected", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                            }
                            Column {
                                Text("Pending Due", fontSize = 10.sp, color = Slate400)
                                Text("₹$pendingAmount", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = RoseError)
                            }
                        }
                    }
                }

                // Filter Chips
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    val chips = listOf(
                        "ALL" to "All Txns (${orders.size})",
                        "QR" to "Doorstep QR",
                        "CASH" to "Cash",
                        "PREPAID" to "Prepaid"
                    )

                    chips.forEach { (key, label) ->
                        val isSelected = selectedFilter == key
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(if (isSelected) MedTealPrimary else PureWhite)
                                .clickable { selectedFilter = key }
                                .padding(horizontal = 12.dp, vertical = 6.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = label,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) PureWhite else Slate700
                            )
                        }
                    }
                }

                // Transactions List
                Text("Visit Payment Entries", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate900)

                filteredOrders.forEach { ord ->
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
                                    .size(38.dp)
                                    .clip(CircleShape)
                                    .background(if (ord.isPaid) EmeraldLight else RoseError.copy(alpha = 0.12f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    if (ord.isPaid) Icons.Default.CheckCircle else Icons.Default.QrCode,
                                    contentDescription = null,
                                    tint = if (ord.isPaid) EmeraldAccent else RoseError,
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(ord.effectivePatientName, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                Text("${ord.id} • ${ord.slot ?: "Morning Slot"}", fontSize = 11.sp, color = Slate500)
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text("₹${ord.effectiveAmount}", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900)

                                if (!ord.isPaid) {
                                    Button(
                                        onClick = { activeQrOrder = ord },
                                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                                        shape = RoundedCornerShape(6.dp),
                                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                        modifier = Modifier.height(26.dp)
                                    ) {
                                        Text("Collect", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                    }
                                } else {
                                    Text(
                                        text = ord.paymentMode ?: "PAID",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = EmeraldAccent
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    activeQrOrder?.let { ord ->
        AgentDoorstepQrPaymentModal(
            order = ord,
            onDismiss = { activeQrOrder = null },
            onPaymentDone = {
                activeQrOrder = null
                refreshPayments()
                actionBanner = "Payment of ₹${ord.effectiveAmount} marked complete!"
            }
        )
    }
}
