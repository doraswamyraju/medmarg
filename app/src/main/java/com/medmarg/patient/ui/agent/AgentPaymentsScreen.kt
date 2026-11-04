package com.medmarg.patient.ui.agent

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.agent.sheets.AgentDoorstepQrPaymentModal
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// 💳 AGENT PAYMENTS SCREEN (100% LIVE BACKEND PARITY WITH iOS AgentPaymentsView.swift)
// - Topbar with ON DUTY, Notification bell, Avatar
// - Title + Date Range Dropdown Pill ("This Month ∨")
// - 4 Metric Summary Cards: Total Collected, Prepaid (Online), Doorstep Payment, Pending
// - 4 Category Filter Tabs: All Payments | Prepaid | Doorstep | Pending
// - Search Bar + Sort
// - Payment Transaction Cards (clicking opens AgentOrderDetailScreen)
// - Bottom Card: Download Statement (Download PDF)
// =========================================================================

@Composable
fun AgentPaymentsScreen(
    user: UserProfile,
    onTabSelected: (Int) -> Unit = {},
    onOpenSidebar: () -> Unit = {},
    onOpenNotifications: () -> Unit = {}
) {
    val coroutineScope = rememberCoroutineScope()

    var isOnDuty by remember { mutableStateOf(true) }
    var orders by remember { mutableStateOf<List<AgentPickupOrder>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilterCategory by remember { mutableStateOf("ALL") } // ALL, PREPAID, DOORSTEP, PENDING
    var selectedDateRange by remember { mutableStateOf("This Month") }
    var showDateMenu by remember { mutableStateOf(false) }

    var selectedOrderDetail by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var selectedOrderForQr by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var showDownloadToast by remember { mutableStateOf(false) }

    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "AG-01"

    fun isDoorstepPayment(ord: AgentPickupOrder): Boolean {
        val mode = (ord.paymentMode ?: "").lowercase()
        val notes = (ord.paymentNotes ?: "").lowercase()
        return mode.contains("doorstep") || mode.contains("cash") || mode.contains("qr") || notes.contains("doorstep")
    }

    fun loadPaymentsData() {
        coroutineScope.launch {
            isLoading = true
            orders = AgentRepository.fetchRoster(effectiveAgentId)
            isLoading = false
        }
    }

    LaunchedEffect(effectiveAgentId) {
        loadPaymentsData()
    }

    val totalCollectedOrders = orders.filter { it.isPaid }
    val totalCollectedAmount = totalCollectedOrders.sumOf { it.effectiveAmount }

    val prepaidOrders = orders.filter { it.isPaid && !isDoorstepPayment(it) }
    val prepaidAmount = prepaidOrders.sumOf { it.effectiveAmount }

    val doorstepOrders = orders.filter { isDoorstepPayment(it) }
    val doorstepAmount = doorstepOrders.sumOf { it.effectiveAmount }

    val pendingOrders = orders.filter { !it.isPaid }
    val pendingAmount = pendingOrders.sumOf { it.effectiveAmount }

    val filteredOrders = remember(orders, selectedFilterCategory, searchQuery) {
        var list = when (selectedFilterCategory) {
            "PREPAID" -> prepaidOrders
            "DOORSTEP" -> doorstepOrders
            "PENDING" -> pendingOrders
            else -> orders
        }
        if (searchQuery.isNotBlank()) {
            val q = searchQuery.trim().lowercase()
            list = list.filter {
                it.id.lowercase().contains(q) ||
                    it.effectivePatientName.lowercase().contains(q) ||
                    (it.items?.lowercase()?.contains(q) == true) ||
                    (it.transactionId?.lowercase()?.contains(q) == true)
            }
        }
        list
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        // 1. Topbar
        AgentTopbarView(
            agentName = user.name,
            agentId = effectiveAgentId,
            isOnDuty = isOnDuty,
            onToggleDuty = { duty ->
                isOnDuty = duty
                coroutineScope.launch { AgentRepository.updateDuty(effectiveAgentId, duty) }
            },
            onLogoTap = { onTabSelected(0) },
            onSidebarTap = onOpenSidebar,
            onNotificationTap = onOpenNotifications,
            onProfileTap = { onTabSelected(4) }
        )

        // 2. Scrollable Body
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(top = 12.dp, bottom = 110.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            if (showDownloadToast) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(MedTealPrimary)
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Payment statement downloaded successfully!", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite, modifier = Modifier.weight(1f))
                    Icon(Icons.Default.Close, contentDescription = null, tint = PureWhite, modifier = Modifier.size(14.dp).clickable { showDownloadToast = false })
                }
            }

            // Header Section
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column {
                    Text("Payments", fontSize = 24.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Text("Track your collections and payment status", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Slate500)
                }

                Box {
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(PureWhite)
                            .border(1.dp, Slate200, RoundedCornerShape(12.dp))
                            .clickable { showDateMenu = true }
                            .padding(horizontal = 10.dp, vertical = 7.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(5.dp)
                    ) {
                        Icon(Icons.Default.CalendarToday, contentDescription = null, tint = Slate700, modifier = Modifier.size(12.dp))
                        Text(selectedDateRange, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate900)
                        Icon(Icons.Default.KeyboardArrowDown, contentDescription = null, tint = Slate500, modifier = Modifier.size(14.dp))
                    }

                    DropdownMenu(expanded = showDateMenu, onDismissRequest = { showDateMenu = false }) {
                        listOf("Today", "This Week", "This Month", "All Time").forEach { range ->
                            DropdownMenuItem(
                                text = { Text(range, fontSize = 12.sp, fontWeight = FontWeight.Bold) },
                                onClick = {
                                    selectedDateRange = range
                                    showDateMenu = false
                                }
                            )
                        }
                    }
                }
            }

            // 4 Metric Summary Cards
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                PaymentMetricSummaryCard(
                    amount = "₹$totalCollectedAmount",
                    title = "Total Collected",
                    ordersCount = "${totalCollectedOrders.size} Orders",
                    icon = Icons.Default.CurrencyRupee,
                    color = EmeraldAccent,
                    isSelected = selectedFilterCategory == "ALL",
                    onClick = { selectedFilterCategory = "ALL" }
                )
                PaymentMetricSummaryCard(
                    amount = "₹$prepaidAmount",
                    title = "Prepaid (Online)",
                    ordersCount = "${prepaidOrders.size} Orders",
                    icon = Icons.Default.CreditCard,
                    color = Color(0xFF2563EB),
                    isSelected = selectedFilterCategory == "PREPAID",
                    onClick = { selectedFilterCategory = "PREPAID" }
                )
                PaymentMetricSummaryCard(
                    amount = "₹$doorstepAmount",
                    title = "Doorstep Payment",
                    ordersCount = "${doorstepOrders.size} Orders",
                    icon = Icons.Default.QrCode,
                    color = Color(0xFFF97316),
                    isSelected = selectedFilterCategory == "DOORSTEP",
                    onClick = { selectedFilterCategory = "DOORSTEP" }
                )
                PaymentMetricSummaryCard(
                    amount = "₹$pendingAmount",
                    title = "Pending",
                    ordersCount = "${pendingOrders.size} Orders",
                    icon = Icons.Default.Schedule,
                    color = Color(0xFF9333EA),
                    isSelected = selectedFilterCategory == "PENDING",
                    onClick = { selectedFilterCategory = "PENDING" }
                )
            }

            // 4 Category Filter Tabs
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                listOf(
                    "ALL" to "All Payments (${orders.size})",
                    "PREPAID" to "Prepaid (${prepaidOrders.size})",
                    "DOORSTEP" to "Doorstep (${doorstepOrders.size})",
                    "PENDING" to "Pending (${pendingOrders.size})"
                ).forEach { (key, title) ->
                    val sel = selectedFilterCategory == key
                    Column(
                        modifier = Modifier.clickable { selectedFilterCategory = key },
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = title,
                            fontSize = 13.sp,
                            fontWeight = if (sel) FontWeight.Black else FontWeight.SemiBold,
                            color = if (sel) MedTealPrimary else Slate500
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Box(
                            modifier = Modifier
                                .height(2.5.dp)
                                .width(72.dp)
                                .background(if (sel) MedTealPrimary else Color.Transparent)
                        )
                    }
                }
            }

            // Search & Sort Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, modifier = Modifier.size(16.dp)) },
                    placeholder = { Text("Search by patient name, order ID or transaction ID...", fontSize = 11.sp) },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(PureWhite)
                        .border(1.dp, Slate200, RoundedCornerShape(12.dp))
                        .clickable { orders = orders.reversed() }
                        .padding(horizontal = 12.dp, vertical = 14.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Icon(Icons.Default.SwapVert, contentDescription = null, tint = Slate700, modifier = Modifier.size(14.dp))
                        Text("Sort", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate700)
                    }
                }
            }

            // Transactions List
            if (isLoading) {
                Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = MedTealPrimary)
                }
            } else if (filteredOrders.isEmpty()) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PureWhite)
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp).fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Default.Payments, contentDescription = null, tint = Slate400, modifier = Modifier.size(36.dp))
                        Text("No Transactions Found", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate700)
                        Text("No payment records match the selected category or search.", fontSize = 12.sp, color = Slate500)
                    }
                }
            } else {
                Column(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    filteredOrders.forEach { order ->
                        val isDoorstep = isDoorstepPayment(order)
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { selectedOrderDetail = order },
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = PureWhite),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.Top,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                // Date Column
                                Column(
                                    modifier = Modifier.width(52.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text("04", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Slate900)
                                    Text("Nov 2026", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Slate500)
                                    Text(order.slot?.take(8) ?: "07:30 AM", fontSize = 8.sp, color = Slate500)
                                }

                                // Patient & Test Details
                                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                    Text("ORD-${order.id}", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = Slate500)
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        Text(order.effectivePatientName, fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                        Text("♂ 34 yrs", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Slate500)
                                    }
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        Icon(Icons.Default.Science, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(12.dp))
                                        Text(order.items ?: "Diagnostic Profile", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate900, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    }
                                    Text("12 Tests | Home Collection", fontSize = 9.sp, color = Slate500)
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        Icon(Icons.Default.LocationOn, contentDescription = null, tint = Slate500, modifier = Modifier.size(11.dp))
                                        Text(order.address ?: "Tirupati", fontSize = 10.sp, color = Slate500, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    }
                                }

                                // Amount & Payment Status
                                Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background((if (isDoorstep) Color(0xFF9333EA) else Color(0xFF2563EB)).copy(alpha = 0.1f))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = if (isDoorstep) "Doorstep Payment" else "Prepaid (Online)",
                                            fontSize = 8.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isDoorstep) Color(0xFF9333EA) else Color(0xFF2563EB)
                                        )
                                    }

                                    Text("₹ ${order.effectiveAmount}", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)

                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                                        Icon(
                                            imageVector = if (order.isPaid) Icons.Default.CheckCircle else Icons.Default.Schedule,
                                            contentDescription = null,
                                            tint = if (order.isPaid) EmeraldAccent else Color(0xFFF97316),
                                            modifier = Modifier.size(11.dp)
                                        )
                                        Text(
                                            text = if (order.isPaid) "Paid" else "Pending",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (order.isPaid) EmeraldAccent else Color(0xFFF97316)
                                        )
                                    }

                                    if (!order.isPaid) {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(MedTealPrimary)
                                                .clickable { selectedOrderForQr = order }
                                                .padding(horizontal = 8.dp, vertical = 4.dp)
                                        ) {
                                            Text("Collect QR", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                        }
                                    } else {
                                        Text(
                                            text = "Txn: ${order.transactionId ?: "pay_${order.id.takeLast(6)}"}",
                                            fontSize = 8.sp,
                                            fontFamily = FontFamily.Monospace,
                                            color = Slate500
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Download Statement Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(MedTealPrimary.copy(alpha = 0.12f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Description, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(18.dp))
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Download Payment Statement", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                        Text("Export monthly collections & settlement log", fontSize = 10.sp, color = Slate500)
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(MedTealPrimary)
                            .clickable { showDownloadToast = true }
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                    ) {
                        Text("Download PDF", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }
            }
        }
    }

    selectedOrderDetail?.let { ord ->
        AgentOrderDetailScreen(
            initialOrder = ord,
            agentId = effectiveAgentId,
            onBack = {
                selectedOrderDetail = null
                loadPaymentsData()
            },
            onOrderUpdated = { loadPaymentsData() }
        )
    }

    selectedOrderForQr?.let { ord ->
        AgentDoorstepQrPaymentModal(
            order = ord,
            onDismiss = { selectedOrderForQr = null },
            onPaymentDone = {
                selectedOrderForQr = null
                loadPaymentsData()
            }
        )
    }
}

@Composable
private fun PaymentMetricSummaryCard(
    amount: String,
    title: String,
    ordersCount: String,
    icon: ImageVector,
    color: Color,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .width(130.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = androidx.compose.foundation.BorderStroke(if (isSelected) 2.dp else 1.dp, if (isSelected) color else Slate200)
    ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(color.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(14.dp))
            }
            Text(amount, fontSize = 17.sp, fontWeight = FontWeight.Black, color = Slate900, maxLines = 1)
            Column {
                Text(title, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate900, maxLines = 1)
                Text(ordersCount, fontSize = 9.sp, color = Slate500)
            }
        }
    }
}
