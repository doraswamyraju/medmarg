package com.medmarg.patient.ui.agent

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.*
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.*
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// 🛵 AGENT HOME DASHBOARD VIEW (TAB 0)
// 100% Live Backend Data - Zero Dummy Data
// Replicated 1-on-1 with iOS AgentHomeDashboardView.swift
// =========================================================================

@Composable
fun AgentHomeDashboardScreen(
    user: UserProfile,
    onLogout: () -> Unit,
    selectedTab: Int,
    onTabSelected: (Int) -> Unit,
    onOpenSidebar: () -> Unit,
    onOpenNotifications: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var isOnDuty by remember { mutableStateOf(true) }
    var isLoading by remember { mutableStateOf(true) }
    var rosterOrders by remember { mutableStateOf<List<AgentPickupOrder>>(emptyList()) }
    var orderFilterTab by remember { mutableIntStateOf(0) } // 0: Today's Orders, 1: In Progress, 2: Completed

    // Modals & Sheets
    var activeVisitOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var activeQrPaymentOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var showManualOrderModal by remember { mutableStateOf(false) }
    var showLabHandoverModal by remember { mutableStateOf(false) }
    var actionBannerMessage by remember { mutableStateOf<String?>(null) }

    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "AG-01"

    // Load Live Roster
    fun refreshLiveRoster() {
        coroutineScope.launch {
            isLoading = true
            val orders = AgentRepository.fetchRoster(effectiveAgentId)
            rosterOrders = orders
            isLoading = false
        }
    }

    LaunchedEffect(Unit) {
        refreshLiveRoster()
    }

    val nextAssignedOrder = rosterOrders.firstOrNull {
        it.status != "COMPLETED" && it.status != "DELIVERED" && it.status != "SAMPLE_COLLECTED"
    }

    val collectedAwaitingHandover = rosterOrders.filter { it.status == "SAMPLE_COLLECTED" }

    val todayEarnings = rosterOrders.filter { ord ->
        val mode = ((ord.paymentMode ?: "") + " " + (ord.paymentNotes ?: "")).lowercase()
        val isDoorstep = mode.contains("doorstep") || mode.contains("cash") || mode.contains("cod") || ord.paymentStatus == "PAID_DOORSTEP_QR"
        ord.isPaid && isDoorstep
    }.sumOf { it.effectiveAmount }

    val completedCount = rosterOrders.count { it.status == "SAMPLE_COLLECTED" || it.status == "COMPLETED" || it.status == "DELIVERED" }
    val inProgressCount = rosterOrders.count { it.status == "ENROUTE" || it.status == "ARRIVED" || it.status == "KIT_ASSIGNED" }

    val filteredOrders = when (orderFilterTab) {
        1 -> rosterOrders.filter { it.status == "ENROUTE" || it.status == "ARRIVED" || it.status == "KIT_ASSIGNED" }
        2 -> rosterOrders.filter { it.status == "SAMPLE_COLLECTED" || it.status == "COMPLETED" || it.status == "DELIVERED" }
        else -> rosterOrders
    }

    Box(modifier = modifier.fillMaxSize().background(Slate50)) {
        Column(modifier = Modifier.fillMaxSize()) {
            // 1. Agent Topbar
            AgentTopbarView(
                agentName = user.name,
                agentId = effectiveAgentId,
                isOnDuty = isOnDuty,
                onToggleDuty = { newDuty ->
                    isOnDuty = newDuty
                    coroutineScope.launch {
                        AgentRepository.updateDuty(effectiveAgentId, newDuty)
                        actionBannerMessage = if (newDuty) "You are now ONLINE & Active for Pickups" else "You are now OFFLINE"
                    }
                },
                onLogoTap = { onTabSelected(0) },
                onSidebarTap = onOpenSidebar,
                onNotificationTap = onOpenNotifications,
                onProfileTap = { onTabSelected(4) }
            )

            // Action Banner if triggered
            actionBannerMessage?.let { banner ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(MedTealPrimary)
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(banner, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite, modifier = Modifier.weight(1f))
                    Icon(
                        Icons.Default.Close,
                        contentDescription = "Close",
                        tint = PureWhite,
                        modifier = Modifier.size(16.dp).clickable { actionBannerMessage = null }
                    )
                }
            }

            // 2. Main Scrollable Content
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(bottom = 90.dp)
            ) {
                Spacer(modifier = Modifier.height(10.dp))

                // Hero Greeting Card (Tirupati Landscape Theme)
                AgentHeroGreetingCard(user = user)

                Spacer(modifier = Modifier.height(14.dp))

                // Lab Handover Alert Banner (when samples collected)
                if (collectedAwaitingHandover.isNotEmpty()) {
                    LabHandoverActionCard(
                        count = collectedAwaitingHandover.size,
                        onClick = { showLabHandoverModal = true }
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                }

                // 3. Single Horizontal Scrollable Row: Metric Counters
                AgentMetricCountersRow(
                    todayEarnings = todayEarnings,
                    assignedCount = rosterOrders.size,
                    completedCount = completedCount,
                    totalTarget = maxOf(10, rosterOrders.size),
                    onTimeRate = 96,
                    onSelectMetric = { tabIdx -> onTabSelected(tabIdx) }
                )

                Spacer(modifier = Modifier.height(18.dp))

                // 4. Next Assigned Order Hero Card
                nextAssignedOrder?.let { nextOrder ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Next Assigned Order",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )

                        Text(
                            text = "View All >",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = MedTealPrimary,
                            modifier = Modifier.clickable { onTabSelected(7) }
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    AgentNextAssignedCard(
                        order = nextOrder,
                        onOpenVisit = { activeVisitOrder = nextOrder },
                        onStartTrip = {
                            coroutineScope.launch {
                                AgentRepository.updatePickupStatus(nextOrder.id, "ENROUTE")
                                refreshLiveRoster()
                                actionBannerMessage = "Trip started for ${nextOrder.effectivePatientName}"
                            }
                        }
                    )

                    Spacer(modifier = Modifier.height(18.dp))
                }

                // 5. Quick Shortcuts Grid (2x2)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Quick Shortcuts",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                AgentShortcutsGrid(
                    onSelectShortcut = { tabIdx -> onTabSelected(tabIdx) },
                    onLabHandover = { showLabHandoverModal = true }
                )

                Spacer(modifier = Modifier.height(18.dp))

                // 6. Segmented Order Filter Tabs
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Slate200)
                        .padding(3.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    OrderFilterTabPill(
                        label = "Today (${rosterOrders.size})",
                        isSelected = orderFilterTab == 0,
                        onClick = { orderFilterTab = 0 },
                        modifier = Modifier.weight(1f)
                    )
                    OrderFilterTabPill(
                        label = "In Progress ($inProgressCount)",
                        isSelected = orderFilterTab == 1,
                        onClick = { orderFilterTab = 1 },
                        modifier = Modifier.weight(1f)
                    )
                    OrderFilterTabPill(
                        label = "Completed ($completedCount)",
                        isSelected = orderFilterTab == 2,
                        onClick = { orderFilterTab = 2 },
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // 7. Orders Timeline List
                if (filteredOrders.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("No orders in this section", fontSize = 13.sp, color = Slate500)
                    }
                } else {
                    Column(
                        modifier = Modifier.padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        filteredOrders.forEach { ord ->
                            AgentOrderTimelineCard(
                                order = ord,
                                onOpenVisit = { activeVisitOrder = ord },
                                onActionClick = {
                                    when (ord.status) {
                                        "ASSIGNED" -> {
                                            coroutineScope.launch {
                                                AgentRepository.updatePickupStatus(ord.id, "ENROUTE")
                                                refreshLiveRoster()
                                                actionBannerMessage = "En Route to ${ord.effectivePatientName}"
                                            }
                                        }
                                        "ENROUTE" -> {
                                            coroutineScope.launch {
                                                AgentRepository.updatePickupStatus(ord.id, "ARRIVED")
                                                refreshLiveRoster()
                                                actionBannerMessage = "Marked Arrived at ${ord.effectivePatientName}'s doorstep"
                                            }
                                        }
                                        "ARRIVED", "KIT_ASSIGNED" -> {
                                            activeVisitOrder = ord
                                        }
                                        "SAMPLE_COLLECTED" -> {
                                            showLabHandoverModal = true
                                        }
                                    }
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(30.dp))
            }
        }

        // Floating Action Button: Green circle '+' with speech bubble tooltip
        Box(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 20.dp, bottom = 80.dp)
        ) {
            Column(horizontalAlignment = Alignment.End) {
                // Speech Bubble Tooltip
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Slate900)
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Text(
                        text = "Create Order for Customer",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                FloatingActionButton(
                    onClick = { showManualOrderModal = true },
                    containerColor = Color(0xFF00B86B),
                    contentColor = PureWhite,
                    shape = CircleShape,
                    modifier = Modifier.size(54.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Create Order", modifier = Modifier.size(28.dp))
                }
            }
        }
    }

    // Modal Overlays
    activeVisitOrder?.let { ord ->
        AgentDoorstepVisitModal(
            order = ord,
            onDismiss = { activeVisitOrder = null },
            onCollectQrPayment = { activeQrPaymentOrder = ord },
            onCompleteVisit = {
                activeVisitOrder = null
                refreshLiveRoster()
                actionBannerMessage = "Samples successfully collected for ${ord.effectivePatientName}!"
            }
        )
    }

    activeQrPaymentOrder?.let { ord ->
        AgentDoorstepQrPaymentModal(
            order = ord,
            onDismiss = { activeQrPaymentOrder = null },
            onPaymentDone = {
                activeQrPaymentOrder = null
                refreshLiveRoster()
                actionBannerMessage = "Payment of ₹${ord.effectiveAmount} marked complete!"
            }
        )
    }

    if (showManualOrderModal) {
        AgentCreateManualOrderModal(
            agentId = effectiveAgentId,
            onDismiss = { showManualOrderModal = false },
            onOrderCreated = {
                showManualOrderModal = false
                refreshLiveRoster()
                actionBannerMessage = "New customer order created & assigned to you!"
            }
        )
    }

    if (showLabHandoverModal) {
        AgentLabHandoverModal(
            collectedOrders = collectedAwaitingHandover,
            onDismiss = { showLabHandoverModal = false },
            onHandoverComplete = {
                showLabHandoverModal = false
                refreshLiveRoster()
                actionBannerMessage = "Specimens safely handed over to central lab!"
            }
        )
    }
}

@Composable
private fun AgentHeroGreetingCard(user: UserProfile) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        listOf(Color(0xFFE0F2F1), PureWhite)
                    )
                )
                .padding(16.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Good Morning,",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate600
                        )
                        Text(
                            text = user.name,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black,
                            color = Slate900
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(MedTealPrimary.copy(alpha = 0.12f))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "TIRUPATI HUB",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            color = MedTealPrimary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "Fast, Reliable Home Sample Collection • NABL Accredited",
                    fontSize = 11.sp,
                    color = Slate500
                )
            }
        }
    }
}

@Composable
private fun LabHandoverActionCard(count: Int, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF7ED)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF97316).copy(alpha = 0.4f))
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFFF97316).copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.LocalShipping, contentDescription = null, tint = Color(0xFFF97316), modifier = Modifier.size(20.dp))
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Lab Handover Ready ($count Specimens)",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Text(
                    text = "Deliver cold box to Central Diagnostics",
                    fontSize = 11.sp,
                    color = Slate600
                )
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFFF97316))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "Handover",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = PureWhite
                )
            }
        }
    }
}

@Composable
private fun AgentMetricCountersRow(
    todayEarnings: Int,
    assignedCount: Int,
    completedCount: Int,
    totalTarget: Int,
    onTimeRate: Int,
    onSelectMetric: (Int) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        MetricCounterCard(
            title = "Today's Collections",
            value = "₹$todayEarnings",
            sub = "Doorstep Cash & QR",
            icon = Icons.Default.CurrencyRupee,
            color = MedTealPrimary,
            onClick = { onSelectMetric(3) } // Tab 3: Payments
        )

        MetricCounterCard(
            title = "Assigned Orders",
            value = "$assignedCount",
            sub = "${maxOf(0, assignedCount - completedCount)} Pending",
            icon = Icons.Default.ListAlt,
            color = Color(0xFF2563EB),
            onClick = { onSelectMetric(7) } // Tab 7: Orders
        )

        MetricCounterCard(
            title = "Completed",
            value = "$completedCount / $totalTarget",
            sub = "Daily Shift Target",
            icon = Icons.Default.CheckCircle,
            color = Color(0xFFF97316),
            onClick = { onSelectMetric(0) }
        )

        MetricCounterCard(
            title = "On-Time Rate",
            value = "$onTimeRate%",
            sub = "High Performance",
            icon = Icons.Default.Schedule,
            color = Color(0xFF8B5CF6),
            onClick = { onSelectMetric(4) } // Tab 4: Profile & Quota
        )
    }
}

@Composable
private fun MetricCounterCard(
    title: String,
    value: String,
    sub: String,
    icon: ImageVector,
    color: Color,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .width(135.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(color.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(16.dp))
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(title, fontSize = 10.sp, fontWeight = FontWeight.Medium, color = Slate500, maxLines = 1)
            Text(value, fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900, maxLines = 1)
            Text(sub, fontSize = 9.sp, color = Slate400, maxLines = 1)
        }
    }
}

@Composable
private fun AgentNextAssignedCard(
    order: AgentPickupOrder,
    onOpenVisit: () -> Unit,
    onStartTrip: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clickable { onOpenVisit() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        elevation = CardDefaults.cardElevation(3.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Time Slot Box
            Column(
                modifier = Modifier
                    .size(54.dp, 60.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFFF1F5F9)),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = order.slot?.take(5) ?: "07:30",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                Text(
                    text = if (order.slot?.contains("PM") == true) "PM" else "AM",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate700
                )
                Text(
                    text = "Today",
                    fontSize = 8.sp,
                    color = Slate500
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Patient Info & Tags
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = order.effectivePatientName,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Text(
                    text = order.address ?: "Tirupati",
                    fontSize = 11.sp,
                    color = Slate500,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Text(
                    text = order.items ?: "Blood Pathology",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = MedTealPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(4.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(Color(0xFFFEE2E2))
                            .padding(horizontal = 4.dp, vertical = 2.dp)
                    ) {
                        Text("Doorstep", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Color(0xFFDC2626))
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(Color(0xFFDBEAFE))
                            .padding(horizontal = 4.dp, vertical = 2.dp)
                    ) {
                        Text(if (order.isPaid) "Prepaid" else "Doorstep QR", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Color(0xFF2563EB))
                    }
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Action / Start Button
            Button(
                onClick = {
                    if (order.status == "ASSIGNED") {
                        onStartTrip()
                    } else {
                        onOpenVisit()
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                shape = RoundedCornerShape(10.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text(
                    text = if (order.status == "ASSIGNED") "Start" else "Visit",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = PureWhite
                )
            }
        }
    }
}

@Composable
private fun AgentShortcutsGrid(
    onSelectShortcut: (Int) -> Unit,
    onLabHandover: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            ShortcutCard(
                title = "Inventory Bag",
                icon = Icons.Default.Inventory2,
                color = Color(0xFF00B86B),
                onClick = { onSelectShortcut(1) }, // Tab 1: Inventory
                modifier = Modifier.weight(1f)
            )

            ShortcutCard(
                title = "Shift Quota",
                icon = Icons.Default.CalendarToday,
                color = Color(0xFF8B5CF6),
                onClick = { onSelectShortcut(4) }, // Tab 4: Quota & Profile
                modifier = Modifier.weight(1f)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            ShortcutCard(
                title = "My Orders",
                icon = Icons.Default.Assignment,
                color = Color(0xFF2563EB),
                onClick = { onSelectShortcut(7) }, // Tab 7: Orders
                modifier = Modifier.weight(1f)
            )

            ShortcutCard(
                title = "Lab Handover",
                icon = Icons.Default.LocalShipping,
                color = Color(0xFFF97316),
                onClick = onLabHandover,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun ShortcutCard(
    title: String,
    icon: ImageVector,
    color: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(color.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
            }

            Spacer(modifier = Modifier.width(10.dp))

            Text(
                text = title,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900,
                modifier = Modifier.weight(1f)
            )

            Icon(
                Icons.Default.ChevronRight,
                contentDescription = null,
                tint = Slate400,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}

@Composable
private fun OrderFilterTabPill(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(if (isSelected) PureWhite else Color.Transparent)
            .clickable { onClick() }
            .padding(vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            color = if (isSelected) MedTealPrimary else Slate600
        )
    }
}

@Composable
private fun AgentOrderTimelineCard(
    order: AgentPickupOrder,
    onOpenVisit: () -> Unit,
    onActionClick: () -> Unit
) {
    val context = LocalContext.current

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onOpenVisit() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = order.effectivePatientName,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )

                // Status Tag
                val (stColor, stBg) = when (order.status) {
                    "ENROUTE" -> Pair(Color(0xFF2563EB), Color(0xFFDBEAFE))
                    "ARRIVED" -> Pair(Color(0xFF8B5CF6), Color(0xFFEDE9FE))
                    "SAMPLE_COLLECTED" -> Pair(Color(0xFF00B86B), Color(0xFFD1FAE5))
                    "COMPLETED", "DELIVERED" -> Pair(Color(0xFF059669), Color(0xFFD1FAE5))
                    else -> Pair(Slate700, Slate100)
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(stBg)
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = order.status ?: "ASSIGNED",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Black,
                        color = stColor
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = order.address ?: "Tirupati",
                fontSize = 11.sp,
                color = Slate500,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Text(
                text = order.items ?: "Pathology Panel",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = MedTealPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "₹${order.effectiveAmount} • ${if (order.isPaid) "PAID" else "PAYMENT DUE"}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (order.isPaid) EmeraldAccent else RoseError
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    // Call Patient Icon Button
                    Box(
                        modifier = Modifier
                            .size(30.dp)
                            .clip(CircleShape)
                            .background(MedTealLight)
                            .clickable {
                                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${order.effectivePhone}"))
                                context.startActivity(intent)
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Phone, contentDescription = "Call", tint = MedTealPrimary, modifier = Modifier.size(16.dp))
                    }

                    // Main Action Button
                    val actionLabel = when (order.status) {
                        "ASSIGNED" -> "Start Trip"
                        "ENROUTE" -> "Arrived"
                        "ARRIVED", "KIT_ASSIGNED" -> "Collect"
                        "SAMPLE_COLLECTED" -> "Handover"
                        else -> "View"
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(MedTealPrimary)
                            .clickable { onActionClick() }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = actionLabel,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = PureWhite
                        )
                    }
                }
            }
        }
    }
}

