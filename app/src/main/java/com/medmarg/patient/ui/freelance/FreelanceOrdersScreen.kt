package com.medmarg.patient.ui.freelance

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.agent.AgentDoorstepQrPaymentModal
import com.medmarg.patient.ui.agent.AgentDoorstepVisitModal
import com.medmarg.patient.ui.agent.AgentLabHandoverModal
import com.medmarg.patient.ui.agent.AgentOrderDetailScreen
import com.medmarg.patient.ui.agent.AgentTopbarView
import com.medmarg.patient.ui.components.NotificationCenterSheet
import com.medmarg.patient.ui.freelance.sheets.FreelanceAssessAssignKitModal
import com.medmarg.patient.ui.freelance.sheets.FreelanceBroadcastJobsSheet
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// ⚡ FREELANCE ORDERS VIEW (DEDICATED ORDERS TAB)
// 100% Live Backend Data from /api/v1/agent/roster
// Manages claimed overflow gigs and tracks bedside progress
// 1:1 Match with ios/FreelanceAgent/Views/FreelanceOrdersView.swift
// =========================================================================

@Composable
fun FreelanceOrdersScreen(
    user: UserProfile,
    onTabSelected: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "FL-502"

    var orders by remember { mutableStateOf<List<AgentPickupOrder>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilterCategory by remember { mutableStateOf("ALL") } // "ALL", "CLAIMED", "ON_THE_WAY", "COLLECTION", "HANDOVER"
    var unreadNotificationCount by remember { mutableIntStateOf(0) }
    var actionBanner by remember { mutableStateOf<String?>(null) }

    // Modals & Sheets
    var selectedOrderDetail by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var activeVisitModalOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var activeAssessKitOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var activeDoorstepQrOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var showBroadcastGigsSheet by remember { mutableStateOf(false) }
    var showLabHandoverSheet by remember { mutableStateOf(false) }
    var showNotificationCenter by remember { mutableStateOf(false) }

    val claimedCount = orders.count { it.status == "BOOKED" || it.status == "ASSIGNED" }
    val onTheWayCount = orders.count { it.status == "KIT_ASSIGNED" || it.status == "ENROUTE" || it.status == "EN_ROUTE" }
    val collectionCount = orders.count { it.status == "ARRIVED" || it.status == "IN_PROGRESS" }
    val handoverCount = orders.count { it.status == "SAMPLE_COLLECTED" || it.status == "TRANSFERRED_TO_LAB" || it.status == "DELIVERED" || it.status == "COMPLETED" }

    val filteredOrders = remember(orders, selectedFilterCategory, searchQuery) {
        var result = orders
        when (selectedFilterCategory) {
            "CLAIMED" -> result = result.filter { it.status == "BOOKED" || it.status == "ASSIGNED" }
            "ON_THE_WAY" -> result = result.filter { it.status == "KIT_ASSIGNED" || it.status == "ENROUTE" || it.status == "EN_ROUTE" }
            "COLLECTION" -> result = result.filter { it.status == "ARRIVED" || it.status == "IN_PROGRESS" }
            "HANDOVER" -> result = result.filter { it.status == "SAMPLE_COLLECTED" || it.status == "TRANSFERRED_TO_LAB" || it.status == "DELIVERED" || it.status == "COMPLETED" }
        }
        val q = searchQuery.trim().lowercase()
        if (q.isNotEmpty()) {
            result = result.filter {
                it.effectivePatientName.lowercase().contains(q) ||
                it.id.lowercase().contains(q) ||
                (it.address?.lowercase()?.contains(q) == true) ||
                (it.items?.lowercase()?.contains(q) == true)
            }
        }
        result
    }

    fun fetchLiveRoster() {
        coroutineScope.launch {
            isLoading = true
            orders = AgentRepository.fetchRoster(effectiveAgentId)
            unreadNotificationCount = AgentRepository.fetchUnreadNotificationCount(effectiveAgentId)
            isLoading = false
        }
    }

    LaunchedEffect(effectiveAgentId) {
        fetchLiveRoster()
    }

    Box(modifier = modifier.fillMaxSize().background(Slate50)) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Topbar
            AgentTopbarView(
                agentName = user.name,
                agentId = effectiveAgentId,
                isOnDuty = true,
                unreadNotificationCount = unreadNotificationCount,
                onToggleDuty = { },
                onLogoTap = { onTabSelected(0) },
                onSidebarTap = { },
                onNotificationTap = { showNotificationCenter = true },
                onProfileTap = { onTabSelected(4) }
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Action banner
                AnimatedVisibility(visible = actionBanner != null) {
                    actionBanner?.let { banner ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(PrimaryTeal)
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = PureWhite, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text(banner, color = PureWhite, fontSize = 13.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                            IconButton(onClick = { actionBanner = null }, modifier = Modifier.size(24.dp)) {
                                Icon(Icons.Default.Close, contentDescription = "Dismiss", tint = PureWhite, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }

                // Broadcast Gigs Shortcut Banner
                BroadcastGigsShortcutBanner(
                    onClick = { showBroadcastGigsSheet = true }
                )

                // 4 Status Counters Row
                FreelanceStatusCountersRow(
                    claimedCount = claimedCount,
                    onTheWayCount = onTheWayCount,
                    collectionCount = collectionCount,
                    handoverCount = handoverCount,
                    selectedFilter = selectedFilterCategory,
                    onFilterSelect = { key ->
                        selectedFilterCategory = if (selectedFilterCategory == key) "ALL" else key
                    }
                )

                // Search & Filter Bar
                FreelanceSearchAndFilterSection(
                    searchQuery = searchQuery,
                    onSearchQueryChange = { searchQuery = it },
                    totalCount = orders.size,
                    claimedCount = claimedCount,
                    onTheWayCount = onTheWayCount,
                    collectionCount = collectionCount,
                    handoverCount = handoverCount,
                    selectedFilter = selectedFilterCategory,
                    onFilterSelect = { selectedFilterCategory = it }
                )

                // Orders List
                if (isLoading) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 40.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        CircularProgressIndicator(color = PrimaryTeal, modifier = Modifier.size(36.dp))
                        Text("Loading claimed gigs...", fontSize = 12.sp, color = Slate500)
                    }
                } else if (filteredOrders.isEmpty()) {
                    FreelanceEmptyGigsView(onBrowseGigs = { showBroadcastGigsSheet = true })
                } else {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        filteredOrders.forEach { order ->
                            FreelanceOrderCard(
                                order = order,
                                onViewVisit = { selectedOrderDetail = order },
                                onAssessKit = { activeAssessKitOrder = order }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(100.dp))
            }
        }

        // Modals & Sheets
        selectedOrderDetail?.let { order ->
            AgentOrderDetailScreen(
                initialOrder = order,
                agentId = effectiveAgentId,
                onBack = {
                    selectedOrderDetail = null
                    fetchLiveRoster()
                },
                onOrderUpdated = {
                    fetchLiveRoster()
                }
            )
        }

        activeAssessKitOrder?.let { order ->
            FreelanceAssessAssignKitModal(
                order = order,
                onDismiss = { activeAssessKitOrder = null },
                onAssigned = {
                    activeAssessKitOrder = null
                    actionBanner = "Field kit verified and assigned for order ${order.id}."
                    fetchLiveRoster()
                }
            )
        }

        activeVisitModalOrder?.let { order ->
            AgentDoorstepVisitModal(
                order = order,
                onDismiss = { activeVisitModalOrder = null },
                onCollectQrPayment = {
                    activeVisitModalOrder = null
                    activeDoorstepQrOrder = order
                },
                onCompleteVisit = {
                    activeVisitModalOrder = null
                    actionBanner = "Sample collected for #${order.id}! Stored in cold bag."
                    fetchLiveRoster()
                }
            )
        }

        activeDoorstepQrOrder?.let { order ->
            AgentDoorstepQrPaymentModal(
                order = order,
                onDismiss = { activeDoorstepQrOrder = null },
                onPaymentDone = {
                    activeDoorstepQrOrder = null
                    actionBanner = "Doorstep QR Payment recorded for #${order.id}"
                    fetchLiveRoster()
                }
            )
        }

        if (showBroadcastGigsSheet) {
            FreelanceBroadcastJobsSheet(
                user = user,
                onDismiss = { showBroadcastGigsSheet = false },
                onJobClaimed = { claimedJob ->
                    actionBanner = "⚡ Claimed order ${claimedJob.id}! Added to active pickups."
                    fetchLiveRoster()
                }
            )
        }

        if (showLabHandoverSheet) {
            AgentLabHandoverModal(
                collectedOrders = orders.filter { it.status == "SAMPLE_COLLECTED" },
                onDismiss = { showLabHandoverSheet = false },
                onHandoverComplete = {
                    showLabHandoverSheet = false
                    actionBanner = "Lab Handover completed successfully!"
                    fetchLiveRoster()
                }
            )
        }

        if (showNotificationCenter) {
            NotificationCenterSheet(
                onDismissRequest = {
                    showNotificationCenter = false
                    fetchLiveRoster()
                }
            )
        }
    }
}

// ==========================================
// BROADCAST GIGS SHORTCUT BANNER
// ==========================================
@Composable
private fun BroadcastGigsShortcutBanner(onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(AccentEmerald),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Bolt, contentDescription = null, tint = PureWhite, modifier = Modifier.size(18.dp))
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Broadcast Gig Feed", fontSize = 13.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Spacer(Modifier.width(6.dp))
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = AccentEmerald.copy(alpha = 0.12f)
                    ) {
                        Text(
                            "OPEN GIGS",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            color = AccentEmerald,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
                Spacer(Modifier.height(2.dp))
                Text("Tap to browse nearby unassigned overflow pickups", fontSize = 11.sp, color = Slate600)
            }
            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate400, modifier = Modifier.size(18.dp))
        }
    }
}

// ==========================================
// 4 STATUS COUNTERS ROW
// ==========================================
@Composable
private fun FreelanceStatusCountersRow(
    claimedCount: Int,
    onTheWayCount: Int,
    collectionCount: Int,
    handoverCount: Int,
    selectedFilter: String,
    onFilterSelect: (String) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        CounterCard(title = "Claimed", count = claimedCount, color = Color(0xFF2563EB), isSelected = selectedFilter == "CLAIMED", modifier = Modifier.weight(1f)) {
            onFilterSelect("CLAIMED")
        }
        CounterCard(title = "On the Way", count = onTheWayCount, color = Color(0xFFF59E0B), isSelected = selectedFilter == "ON_THE_WAY", modifier = Modifier.weight(1f)) {
            onFilterSelect("ON_THE_WAY")
        }
        CounterCard(title = "Collection", count = collectionCount, color = PrimaryTeal, isSelected = selectedFilter == "COLLECTION", modifier = Modifier.weight(1f)) {
            onFilterSelect("COLLECTION")
        }
        CounterCard(title = "Handover", count = handoverCount, color = AccentEmerald, isSelected = selectedFilter == "HANDOVER", modifier = Modifier.weight(1f)) {
            onFilterSelect("HANDOVER")
        }
    }
}

@Composable
private fun CounterCard(
    title: String,
    count: Int,
    color: Color,
    isSelected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .then(
                if (isSelected) Modifier.border(2.dp, color, RoundedCornerShape(12.dp))
                else Modifier
            ),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(title, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate500)
            Text("$count", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
            Text("Gigs", fontSize = 9.sp, color = color)
        }
    }
}

// ==========================================
// SEARCH & FILTER BAR
// ==========================================
@Composable
private fun FreelanceSearchAndFilterSection(
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    totalCount: Int,
    claimedCount: Int,
    onTheWayCount: Int,
    collectionCount: Int,
    handoverCount: Int,
    selectedFilter: String,
    onFilterSelect: (String) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.Search, contentDescription = null, tint = Slate400, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                TextField(
                    value = searchQuery,
                    onValueChange = onSearchQueryChange,
                    placeholder = { Text("Search patient, ID, tests, area...", fontSize = 13.sp, color = Slate400) },
                    modifier = Modifier.weight(1f),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent
                    ),
                    singleLine = true
                )
                if (searchQuery.isNotEmpty()) {
                    IconButton(onClick = { onSearchQueryChange("") }, modifier = Modifier.size(24.dp)) {
                        Icon(Icons.Default.Cancel, contentDescription = "Clear", tint = Slate400, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            FilterSegmentChip(title = "All Gigs ($totalCount)", isSelected = selectedFilter == "ALL") { onFilterSelect("ALL") }
            FilterSegmentChip(title = "Claimed ($claimedCount)", isSelected = selectedFilter == "CLAIMED") { onFilterSelect("CLAIMED") }
            FilterSegmentChip(title = "En Route ($onTheWayCount)", isSelected = selectedFilter == "ON_THE_WAY") { onFilterSelect("ON_THE_WAY") }
            FilterSegmentChip(title = "At Doorstep ($collectionCount)", isSelected = selectedFilter == "COLLECTION") { onFilterSelect("COLLECTION") }
            FilterSegmentChip(title = "Delivered ($handoverCount)", isSelected = selectedFilter == "HANDOVER") { onFilterSelect("HANDOVER") }
        }
    }
}

@Composable
private fun FilterSegmentChip(
    title: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .clickable { onClick() },
        shape = RoundedCornerShape(20.dp),
        color = if (isSelected) PrimaryTeal else Slate100
    ) {
        Text(
            text = title,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = if (isSelected) PureWhite else Slate700,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}

// ==========================================
// ORDER CARD
// ==========================================
@Composable
private fun FreelanceOrderCard(
    order: AgentPickupOrder,
    onViewVisit: () -> Unit,
    onAssessKit: () -> Unit
) {
    val isCompleted = order.status == "SAMPLE_COLLECTED" || order.status == "TRANSFERRED_TO_LAB" || order.status == "COMPLETED"

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Slate100,
                    modifier = Modifier.padding(top = 2.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(order.slot ?: "07:30 AM", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate900)
                        Text(order.date ?: "Today", fontSize = 9.sp, color = Slate500)
                    }
                }

                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(order.id, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PrimaryTeal)
                        if (order.isPaid) {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = Color(0xFF2563EB).copy(alpha = 0.12f)
                            ) {
                                Text(
                                    "Prepaid",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF2563EB),
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        } else {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = Color(0xFFF59E0B).copy(alpha = 0.12f)
                            ) {
                                Text(
                                    "Pay at Doorstep",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFD97706),
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    Text(order.effectivePatientName, fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Place, contentDescription = null, tint = Slate400, modifier = Modifier.size(12.dp))
                        Spacer(Modifier.width(4.dp))
                        Text(order.address ?: "Tirupati Doorstep", fontSize = 11.sp, color = Slate600, maxLines = 1)
                    }
                }
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Medication, contentDescription = null, tint = PrimaryTeal, modifier = Modifier.size(13.dp))
                Spacer(Modifier.width(6.dp))
                Text(order.items ?: "Diagnostic Collection", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate800, maxLines = 1)
            }

            Divider(color = Slate100, thickness = 1.dp)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Gig Payout", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate400)
                    Text("₹350", fontSize = 16.sp, fontWeight = FontWeight.Black, color = AccentEmerald)
                }

                if (isCompleted) {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = AccentEmerald.copy(alpha = 0.12f)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = AccentEmerald, modifier = Modifier.size(14.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Sample in Cold Bag", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = AccentEmerald)
                        }
                    }
                } else {
                    Button(
                        onClick = onViewVisit,
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryTeal),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Text("View Visit", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                        Spacer(Modifier.width(4.dp))
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = PureWhite, modifier = Modifier.size(14.dp))
                    }
                }
            }
        }
    }
}

// ==========================================
// EMPTY GIGS VIEW
// ==========================================
@Composable
private fun FreelanceEmptyGigsView(onBrowseGigs: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 40.dp, start = 32.dp, end = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Icon(Icons.Default.Inventory2, contentDescription = null, tint = Slate300, modifier = Modifier.size(48.dp))
        Text("No Active Pickups", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Slate700)
        Text(
            "Claim open overflow gigs from the marketplace broadcast feed above to start earning.",
            fontSize = 12.sp,
            color = Slate500,
            modifier = Modifier.padding(horizontal = 16.dp)
        )
        Button(
            onClick = onBrowseGigs,
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AccentEmerald),
            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 10.dp)
        ) {
            Icon(Icons.Default.Bolt, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
            Text("Browse Open Gigs", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PureWhite)
        }
    }
}
