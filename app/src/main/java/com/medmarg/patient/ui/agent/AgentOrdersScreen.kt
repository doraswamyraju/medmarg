package com.medmarg.patient.ui.agent

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.agent.sheets.*
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

// =========================================================================
// 📋 AGENT ORDERS SCREEN (100% LIVE BACKEND PARITY WITH iOS AgentOrdersView.swift)
// - Topbar with ON/OFF Duty switch, Notifications, Avatar
// - Title + Dynamic Date Selector Pill
// - 4 Status Summary Metric Cards: Assigned, On the Way, Collection, Handover
// - 5 Segment Filter Tabs: All Orders | Assigned | On the Way | Collection | Handover
// - Search + Filter + Sort bar
// - Proceed to Lab Handover Banner when in Handover tab
// - Rich Order Cards with Time Box, 5-Step Progress Stepper, View on Map,
//   Assess Kit, Start Trip, Order Details, and Collect Payment
// =========================================================================

@Composable
fun AgentOrdersScreen(
    user: UserProfile,
    onTabSelected: (Int) -> Unit = {},
    onOpenSidebar: () -> Unit = {},
    onOpenNotifications: () -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var isOnDuty by remember { mutableStateOf(true) }
    var orders by remember { mutableStateOf<List<AgentPickupOrder>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedSegment by remember { mutableStateOf("ALL") } // ALL, ASSIGNED, ON_THE_WAY, COLLECTION, HANDOVER

    // Sheets & Modals
    var selectedOrderForDetail by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var selectedOrderForKit by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var selectedOrderForQr by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var selectedOrderForVisit by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var selectedOrderForMap by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var showLabHandoverSheet by remember { mutableStateOf(false) }

    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "AG-01"
    val todayFormatted = remember {
        SimpleDateFormat("EEE, dd MMM yyyy", Locale.US).format(Date())
    }

    fun loadOrders() {
        coroutineScope.launch {
            isLoading = true
            orders = AgentRepository.fetchRoster(effectiveAgentId)
            isLoading = false
        }
    }

    LaunchedEffect(effectiveAgentId) {
        loadOrders()
    }

    val assignedCount = orders.count { it.status == "ASSIGNED" || it.status == "KIT_ASSIGNED" }
    val onTheWayCount = orders.count { it.status == "ENROUTE" }
    val collectionCount = orders.count { it.status == "ARRIVED" }
    val handoverCount = orders.count { it.status == "SAMPLE_COLLECTED" }

    val filteredOrders = remember(orders, selectedSegment, searchQuery) {
        var list = when (selectedSegment) {
            "ASSIGNED" -> orders.filter { it.status == "ASSIGNED" || it.status == "KIT_ASSIGNED" }
            "ON_THE_WAY" -> orders.filter { it.status == "ENROUTE" }
            "COLLECTION" -> orders.filter { it.status == "ARRIVED" }
            "HANDOVER" -> orders.filter { it.status == "SAMPLE_COLLECTED" }
            else -> orders
        }
        if (searchQuery.isNotBlank()) {
            val q = searchQuery.trim().lowercase()
            list = list.filter {
                it.id.lowercase().contains(q) ||
                    it.effectivePatientName.lowercase().contains(q) ||
                    (it.address?.lowercase()?.contains(q) == true) ||
                    (it.items?.lowercase()?.contains(q) == true)
            }
        }
        list
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        // 1. Agent Topbar
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

        // 2. Scrollable Content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(top = 12.dp, bottom = 110.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header Section
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column {
                    Text("Orders", fontSize = 24.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Text("Manage and track your assigned orders", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Slate500)
                }

                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(PureWhite)
                        .border(1.dp, Slate200, RoundedCornerShape(12.dp))
                        .padding(horizontal = 10.dp, vertical = 7.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(5.dp)
                ) {
                    Icon(Icons.Default.CalendarToday, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(12.dp))
                    Text("Today, $todayFormatted", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate900)
                }
            }

            // 4 Status Summary Metric Cards Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OrderStatusMetricCard(
                    count = assignedCount,
                    title = "Assigned",
                    subtitle = "Ready to Start",
                    icon = Icons.Default.ListAlt,
                    color = Color(0xFF2563EB),
                    isSelected = selectedSegment == "ASSIGNED",
                    onClick = { selectedSegment = "ASSIGNED" }
                )
                OrderStatusMetricCard(
                    count = onTheWayCount,
                    title = "On the Way",
                    subtitle = "En Route",
                    icon = Icons.Default.NearMe,
                    color = EmeraldAccent,
                    isSelected = selectedSegment == "ON_THE_WAY",
                    onClick = { selectedSegment = "ON_THE_WAY" }
                )
                OrderStatusMetricCard(
                    count = collectionCount,
                    title = "Collection",
                    subtitle = "In Progress",
                    icon = Icons.Default.Science,
                    color = Color(0xFFF97316),
                    isSelected = selectedSegment == "COLLECTION",
                    onClick = { selectedSegment = "COLLECTION" }
                )
                OrderStatusMetricCard(
                    count = handoverCount,
                    title = "Handover",
                    subtitle = "Pending Lab Drop",
                    icon = Icons.Default.Inventory2,
                    color = Color(0xFF9333EA),
                    isSelected = selectedSegment == "HANDOVER",
                    onClick = { selectedSegment = "HANDOVER" }
                )
            }

            // 5 Segment Filter Tabs
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                listOf(
                    "ALL" to "All Orders (${orders.size})",
                    "ASSIGNED" to "Assigned ($assignedCount)",
                    "ON_THE_WAY" to "On the Way ($onTheWayCount)",
                    "COLLECTION" to "Collection ($collectionCount)",
                    "HANDOVER" to "Handover ($handoverCount)"
                ).forEach { (key, title) ->
                    val sel = selectedSegment == key
                    Column(
                        modifier = Modifier.clickable { selectedSegment = key },
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
                                .width(64.dp)
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
                    placeholder = { Text("Search by patient name, order ID or test...", fontSize = 12.sp) },
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
                        Icon(Icons.Default.SwapVert, contentDescription = "Sort", tint = Slate700, modifier = Modifier.size(14.dp))
                        Text("Sort", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate700)
                    }
                }
            }

            // Lab Handover Action Banner if in HANDOVER tab
            if (selectedSegment == "HANDOVER" && handoverCount > 0) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Brush.horizontalGradient(listOf(MedTealDark, MedTealPrimary)))
                        .clickable { showLabHandoverSheet = true }
                        .padding(14.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Icon(Icons.Default.Verified, contentDescription = null, tint = PureWhite, modifier = Modifier.size(26.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Proceed to Lab Handover ($handoverCount Ready)", fontSize = 14.sp, fontWeight = FontWeight.Black, color = PureWhite)
                            Text("Verify Cold-Chain & transfer specimen custody to NABL Hub", fontSize = 11.sp, color = PureWhite.copy(alpha = 0.85f))
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = PureWhite)
                    }
                }
            }

            // Orders List
            if (isLoading) {
                Box(modifier = Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) {
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
                        Icon(Icons.Default.AssignmentTurnedIn, contentDescription = null, tint = MedTealPrimary.copy(alpha = 0.5f), modifier = Modifier.size(38.dp))
                        Text("No Orders in This Section", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Slate900)
                        Text("Try switching filter tabs or clearing your search query.", fontSize = 12.sp, color = Slate500)
                    }
                }
            } else {
                Column(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    filteredOrders.forEach { ord ->
                        RichAgentOrderCard(
                            order = ord,
                            onOpenDetail = { selectedOrderForDetail = ord },
                            onAssessKit = { selectedOrderForKit = ord },
                            onViewOnMap = { selectedOrderForMap = ord },
                            onCollectQr = { selectedOrderForQr = ord },
                            onOpenVisit = { selectedOrderForVisit = ord },
                            onPrimaryStepAction = {
                                when (ord.status) {
                                    "ASSIGNED" -> {
                                        if (ord.kitAssigned == true || ord.kitNotRequired == true) {
                                            coroutineScope.launch {
                                                AgentRepository.updatePickupStatus(ord.id, "ENROUTE")
                                                loadOrders()
                                                selectedOrderForMap = ord.copy(status = "ENROUTE")
                                            }
                                        } else {
                                            selectedOrderForKit = ord
                                        }
                                    }
                                    "KIT_ASSIGNED" -> {
                                        coroutineScope.launch {
                                            AgentRepository.updatePickupStatus(ord.id, "ENROUTE")
                                            loadOrders()
                                            selectedOrderForMap = ord.copy(status = "ENROUTE")
                                        }
                                    }
                                    "ENROUTE" -> {
                                        coroutineScope.launch {
                                            AgentRepository.updatePickupStatus(ord.id, "ARRIVED")
                                            loadOrders()
                                            selectedOrderForVisit = ord.copy(status = "ARRIVED")
                                        }
                                    }
                                    "ARRIVED" -> {
                                        selectedOrderForVisit = ord
                                    }
                                    "SAMPLE_COLLECTED" -> {
                                        showLabHandoverSheet = true
                                    }
                                    else -> {
                                        selectedOrderForDetail = ord
                                    }
                                }
                            }
                        )
                    }
                }
            }
        }
    }

    // Sub-Screens & Modals
    selectedOrderForDetail?.let { ord ->
        AgentOrderDetailScreen(
            initialOrder = ord,
            agentId = effectiveAgentId,
            onBack = {
                selectedOrderForDetail = null
                loadOrders()
            },
            onOrderUpdated = { loadOrders() }
        )
    }

    selectedOrderForKit?.let { ord ->
        AgentAssessAssignKitModal(
            order = ord,
            agentId = effectiveAgentId,
            onDismiss = { selectedOrderForKit = null },
            onKitAssigned = {
                selectedOrderForKit = null
                loadOrders()
            }
        )
    }

    selectedOrderForQr?.let { ord ->
        AgentDoorstepQrPaymentModal(
            order = ord,
            onDismiss = { selectedOrderForQr = null },
            onPaymentDone = {
                selectedOrderForQr = null
                loadOrders()
            }
        )
    }

    selectedOrderForVisit?.let { ord ->
        AgentDoorstepVisitModal(
            order = ord,
            onDismiss = { selectedOrderForVisit = null },
            onCollectQrPayment = {
                selectedOrderForVisit = null
                selectedOrderForQr = ord
            },
            onCompleteVisit = {
                selectedOrderForVisit = null
                loadOrders()
            }
        )
    }

    selectedOrderForMap?.let { ord ->
        FullScreenInAppMapModal(
            order = ord,
            onDismiss = { selectedOrderForMap = null },
            onMarkArrived = {
                coroutineScope.launch {
                    AgentRepository.updatePickupStatus(ord.id, "ARRIVED")
                    loadOrders()
                    selectedOrderForVisit = ord.copy(status = "ARRIVED")
                }
            }
        )
    }

    if (showLabHandoverSheet) {
        AgentLabHandoverScreen(
            agentId = effectiveAgentId,
            agentName = user.name,
            collectedOrders = orders.filter { it.status == "SAMPLE_COLLECTED" },
            onDismiss = { showLabHandoverSheet = false },
            onHandoverSuccess = {
                showLabHandoverSheet = false
                loadOrders()
            }
        )
    }
}

@Composable
private fun OrderStatusMetricCard(
    count: Int,
    title: String,
    subtitle: String,
    icon: ImageVector,
    color: Color,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .width(120.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = androidx.compose.foundation.BorderStroke(if (isSelected) 2.dp else 1.dp, if (isSelected) color else Slate200)
    ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(color.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(14.dp))
            }
            Text("$count", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Slate900)
            Text(title, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate900, maxLines = 1)
            Text(subtitle, fontSize = 9.sp, color = Slate500, maxLines = 1)
        }
    }
}

@Composable
private fun RichAgentOrderCard(
    order: AgentPickupOrder,
    onOpenDetail: () -> Unit,
    onAssessKit: () -> Unit,
    onViewOnMap: () -> Unit,
    onCollectQr: () -> Unit,
    onOpenVisit: () -> Unit,
    onPrimaryStepAction: () -> Unit
) {
    val context = LocalContext.current
    val isKitDone = order.kitAssigned == true || order.kitNotRequired == true || order.status != "ASSIGNED"

    val stepIdx = when (order.status) {
        "ASSIGNED" -> if (isKitDone) 2 else 1
        "KIT_ASSIGNED" -> 2
        "ENROUTE" -> 3
        "ARRIVED" -> 4
        "SAMPLE_COLLECTED", "DELIVERED", "COMPLETED" -> 5
        else -> 1
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onOpenDetail() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            // Top Row: Time Box + Patient Info + Call & Status
            Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                // Time Box
                Column(
                    modifier = Modifier
                        .width(64.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Slate50)
                        .border(1.dp, Slate200, RoundedCornerShape(12.dp))
                        .padding(vertical = 8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(order.slot?.take(5) ?: "07:30", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Text(if (order.slot?.contains("PM") == true) "PM" else "AM", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate500)
                    Spacer(modifier = Modifier.height(2.dp))
                    Text("Today", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = MedTealPrimary)
                }

                // Patient & Tests
                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("ORD-${order.id}", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = Slate500)
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background((if (order.isPaid) Color(0xFF2563EB) else Color(0xFF9333EA)).copy(alpha = 0.1f))
                                .padding(horizontal = 5.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = if (order.isPaid) "Prepaid (Online)" else "Doorstep Payment",
                                fontSize = 8.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (order.isPaid) Color(0xFF2563EB) else Color(0xFF9333EA)
                            )
                        }
                    }

                    Text(order.effectivePatientName, fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(order.items ?: "Extensive Full Body Checkup", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(order.address ?: "Air Bypass Road, Tirupati", fontSize = 10.sp, color = Slate500, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }

                // Call & Amount
                Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("₹${order.effectiveAmount}", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Box(
                        modifier = Modifier
                            .size(30.dp)
                            .clip(CircleShape)
                            .background(MedTealLight)
                            .clickable {
                                context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:${order.effectivePhone}")))
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Phone, contentDescription = "Call", tint = MedTealPrimary, modifier = Modifier.size(15.dp))
                    }
                }
            }

            // 5-Step Progress Stepper Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(Slate50)
                    .padding(horizontal = 10.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                listOf(1 to "Assigned", 2 to "Kit Check", 3 to "En Route", 4 to "Doorstep", 5 to "Collect").forEachIndexed { idx, (num, label) ->
                    val done = stepIdx > num || order.status == "SAMPLE_COLLECTED"
                    val active = stepIdx == num
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                        Box(
                            modifier = Modifier
                                .size(16.dp)
                                .clip(CircleShape)
                                .background(if (done) EmeraldAccent else if (active) Color(0xFFF97316) else Slate200),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("$num", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = if (done || active) PureWhite else Slate600)
                        }
                        Text(label, fontSize = 8.sp, fontWeight = if (active || done) FontWeight.Bold else FontWeight.Medium, color = if (active || done) Slate900 else Slate500)
                    }
                }
            }

            // Action Buttons Footer Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // View on Map
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Slate100)
                        .clickable { onViewOnMap() }
                        .padding(horizontal = 10.dp, vertical = 8.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Icon(Icons.Default.Map, contentDescription = null, tint = Slate700, modifier = Modifier.size(13.dp))
                        Text("Map", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate700)
                    }
                }

                // Assess Kit
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isKitDone) EmeraldAccent.copy(alpha = 0.12f) else Color(0xFFFFF7ED))
                        .clickable { onAssessKit() }
                        .padding(horizontal = 10.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = if (isKitDone) "Kit Ready ✓" else "Assess Kit",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isKitDone) EmeraldAccent else Color(0xFFF97316)
                    )
                }

                if (!order.isPaid) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color(0xFF9333EA).copy(alpha = 0.12f))
                            .clickable { onCollectQr() }
                            .padding(horizontal = 10.dp, vertical = 8.dp)
                    ) {
                        Text("QR Pay", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF9333EA))
                    }
                }

                Spacer(modifier = Modifier.weight(1f))

                // Primary Step Action Button
                val primaryLabel = when (order.status) {
                    "ASSIGNED" -> if (isKitDone) "Start Trip >" else "Assess Kit >"
                    "KIT_ASSIGNED" -> "Start Trip >"
                    "ENROUTE" -> "Mark Arrived >"
                    "ARRIVED" -> "Collect Sample >"
                    "SAMPLE_COLLECTED" -> "Lab Handover >"
                    else -> "Details >"
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(MedTealPrimary)
                        .clickable { onPrimaryStepAction() }
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Text(primaryLabel, fontSize = 11.sp, fontWeight = FontWeight.Black, color = PureWhite)
                }
            }
        }
    }
}
