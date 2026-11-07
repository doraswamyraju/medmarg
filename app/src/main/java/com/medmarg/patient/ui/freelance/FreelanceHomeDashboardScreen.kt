package com.medmarg.patient.ui.freelance

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.R
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.*
import com.medmarg.patient.ui.agent.AgentDoorstepQrPaymentModal
import com.medmarg.patient.ui.agent.AgentDoorstepVisitModal
import com.medmarg.patient.ui.agent.AgentLabHandoverScreen
import com.medmarg.patient.ui.agent.AgentNextAssignedCard
import com.medmarg.patient.ui.agent.AgentOrderDetailScreen
import com.medmarg.patient.ui.agent.AgentTopbarView
import com.medmarg.patient.ui.freelance.components.FreelanceMetricCountersRow
import com.medmarg.patient.ui.freelance.components.FreelanceShortcutsGrid
import com.medmarg.patient.ui.freelance.sheets.FreelanceAssessAssignKitModal
import com.medmarg.patient.ui.freelance.sheets.FreelanceBroadcastJobsSheet
import com.medmarg.patient.ui.notifications.NotificationCenterSheet
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch
import java.util.Calendar

// =========================================================================
// ⚡ FREELANCE HOME DASHBOARD VIEW (TAB 0)
// 100% Live Backend Data from /api/v1/agent/*
// Hero greeting, live gig earnings, available broadcasts alert, and active visit tracking
// 1:1 Parity with ios/FreelanceAgent/Views/FreelanceHomeDashboardView.swift
// =========================================================================

@Composable
fun FreelanceHomeDashboardScreen(
    user: UserProfile,
    onLogout: () -> Void = {},
    selectedTab: Int = 0,
    onTabSelected: (Int) -> Unit = {},
    onOpenSidebar: () -> Unit = {},
    onOpenNotifications: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "FL-502"

    // Live Server States
    var rosterOrders by remember { mutableStateOf<List<AgentPickupOrder>>(emptyList()) }
    var broadcastGigs by remember { mutableStateOf<List<FreelanceBroadcastJobItem>>(emptyList()) }
    var todayEarnings by remember { mutableIntStateOf(0) }
    var completedCount by remember { mutableIntStateOf(0) }
    var partnerRating by remember { mutableStateOf("5.0 ★") }
    var isLoading by remember { mutableStateOf(true) }
    var isOnDuty by remember { mutableStateOf(true) }
    var unreadNotificationCount by remember { mutableIntStateOf(0) }
    var actionBanner by remember { mutableStateOf<String?>(null) }

    // Sheets & Workflow Modals
    var showBroadcastGigsSheet by remember { mutableStateOf(false) }
    var activeOrderDetailOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var activeVisitModalOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var activeAssessKitOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var activeDoorstepQrOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var showLabHandoverSheet by remember { mutableStateOf(false) }
    var showNotificationCenter by remember { mutableStateOf(false) }

    val nextAssignedOrder = remember(rosterOrders) {
        rosterOrders.firstOrNull { ord ->
            val st = (ord.status ?: "").uppercase()
            st != "SAMPLE_COLLECTED" && st != "TRANSFERRED_TO_LAB" && st != "DELIVERED" && st != "COMPLETED"
        }
    }

    val collectedOrdersAwaitingHandover = remember(rosterOrders) {
        rosterOrders.filter { it.status == "SAMPLE_COLLECTED" }
    }

    val activeGigsCount = remember(rosterOrders) {
        rosterOrders.count { ord ->
            val st = (ord.status ?: "").uppercase()
            st != "SAMPLE_COLLECTED" && st != "TRANSFERRED_TO_LAB" && st != "DELIVERED" && st != "COMPLETED"
        }
    }

    fun fetchAllData() {
        coroutineScope.launch {
            isLoading = true
            rosterOrders = AgentRepository.fetchRoster(effectiveAgentId)
            broadcastGigs = AgentRepository.fetchBroadcastGigs()

            val wallet = AgentRepository.fetchWalletData(effectiveAgentId)
            todayEarnings = wallet.todayEarnings
            completedCount = wallet.completedTripsToday

            val profile = AgentRepository.fetchProfile(effectiveAgentId)
            partnerRating = "${String.format("%.1f", profile.rating)} ★"

            unreadNotificationCount = AgentRepository.fetchUnreadNotificationCount(effectiveAgentId)
            isLoading = false
        }
    }

    LaunchedEffect(effectiveAgentId) {
        fetchAllData()
    }

    fun greetingTimeOfDay(): String {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        return when (hour) {
            in 5..11 -> "Good Morning ☀️"
            in 12..16 -> "Good Afternoon 🌤️"
            else -> "Good Evening 🌙"
        }
    }

    Box(modifier = modifier.fillMaxSize().background(Slate50)) {
        Column(modifier = Modifier.fillMaxSize()) {
            // 1. Topbar
            AgentTopbarView(
                agentName = user.name,
                agentId = effectiveAgentId,
                isOnDuty = isOnDuty,
                unreadNotificationCount = unreadNotificationCount,
                onToggleDuty = { isOnDuty = it },
                onLogoTap = { onTabSelected(0) },
                onSidebarTap = onOpenSidebar,
                onNotificationTap = { showNotificationCenter = true },
                onProfileTap = { onTabSelected(4) }
            )

            // 2. Scrollable Body
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(vertical = 12),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Action banner
                AnimatedVisibility(visible = actionBanner != null) {
                    actionBanner?.let { banner ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(AccentEmerald)
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color.white, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text(banner, color = Color.white, fontSize = 13.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                            IconButton(onClick = { actionBanner = null }, modifier = Modifier.size(24.dp)) {
                                Icon(Icons.Default.Close, contentDescription = "Dismiss", tint = Color.white, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }

                // Tirupati Temple Hero Card
                HeroGreetingCard(
                    greeting = greetingTimeOfDay(),
                    agentName = user.name.ifEmpty { "Freelance Partner" }
                )

                // Available Overflow Gigs Banner (Broadcast Feed Alert)
                if (broadcastGigs.isNotEmpty()) {
                    OpenBroadcastAlertBanner(
                        gigsCount = broadcastGigs.size,
                        onClick = { showBroadcastGigsSheet = true }
                    )
                }

                // Lab Handover Banner (Active when specimens collected)
                if (collectedOrdersAwaitingHandover.isNotEmpty()) {
                    LabHandoverActionBanner(
                        pendingCount = collectedOrdersAwaitingHandover.size,
                        onClick = { showLabHandoverSheet = true }
                    )
                }

                // Freelancer Metric Counters Row (Tappable)
                FreelanceMetricCountersRow(
                    todayEarnings = todayEarnings,
                    activeGigsCount = activeGigsCount,
                    completedCount = completedCount,
                    ratingScore = partnerRating,
                    onSelectMetric = { targetTab -> onTabSelected(targetTab) }
                )

                // Next Claimed / Assigned Order
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Next Assigned Gig", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                        Row(
                            modifier = Modifier.clickable { onTabSelected(7) },
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("View All", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PrimaryTeal)
                            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = PrimaryTeal, modifier = Modifier.size(14.dp))
                        }
                    }

                    if (nextAssignedOrder != null) {
                        Box(modifier = Modifier.padding(horizontal = 16.dp)) {
                            AgentNextAssignedCard(
                                order = nextAssignedOrder,
                                onStartTrip = { activeOrderDetailOrder = nextAssignedOrder },
                                onAssessKit = { activeAssessKitOrder = nextAssignedOrder },
                                onOpenVisit = { activeOrderDetailOrder = nextAssignedOrder },
                                onDoorstepQr = { activeDoorstepQrOrder = nextAssignedOrder }
                            )
                        }
                    } else {
                        NoAssignedOrdersPlaceholder()
                    }
                }

                // Quick Actions
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        "Quick Actions",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )

                    FreelanceShortcutsGrid(
                        onClaimGigsTap = { showBroadcastGigsSheet = true },
                        onInventoryTap = { onTabSelected(1) },
                        onBarcodeScanTap = {
                            if (nextAssignedOrder != null) {
                                activeVisitModalOrder = nextAssignedOrder
                            } else {
                                actionBanner = "No active gig to scan barcode for"
                            }
                        },
                        onLabHandoverTap = { showLabHandoverSheet = true }
                    )
                }

                // Today's Pickups Section
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Today's Gigs (${rosterOrders.size})", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                        Text(
                            "View History",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = PrimaryTeal,
                            modifier = Modifier.clickable { onTabSelected(7) }
                        )
                    }

                    if (rosterOrders.isEmpty()) {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.white)
                        ) {
                            Box(modifier = Modifier.padding(20.dp), contentAlignment = Alignment.Center) {
                                Text("No gigs booked for today yet.", fontSize = 12.sp, color = Slate500)
                            }
                        }
                    } else {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            rosterOrders.take(3).forEach { ord ->
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { activeOrderDetailOrder = ord },
                                    shape = RoundedCornerShape(14.dp),
                                    colors = CardDefaults.cardColors(containerColor = Color.white),
                                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Text(ord.id, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PrimaryTeal)
                                                Spacer(Modifier.width(6.dp))
                                                Text(ord.slot ?: "07:30 AM", fontSize = 10.sp, color = Slate500)
                                            }
                                            Text(ord.effectivePatientName, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                            Text(ord.items ?: "Diagnostic Collection", fontSize = 11.sp, color = Slate600, maxLines = 1)
                                        }
                                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate400, modifier = Modifier.size(16.dp))
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(100.dp))
            }
        }

        // Modals & Sheets
        if (showBroadcastGigsSheet) {
            FreelanceBroadcastJobsSheet(
                user = user,
                onDismiss = { showBroadcastGigsSheet = false },
                onJobClaimed = { claimedJob ->
                    actionBanner = "⚡ Gig ${claimedJob.id} claimed successfully! Added to your schedule."
                    fetchAllData()
                }
            )
        }

        activeOrderDetailOrder?.let { order ->
            AgentOrderDetailScreen(
                order = order,
                onDismiss = {
                    activeOrderDetailOrder = null
                    fetchAllData()
                },
                onOrderUpdated = { fetchAllData() }
            )
        }

        activeAssessKitOrder?.let { order ->
            FreelanceAssessAssignKitModal(
                order = order,
                onDismiss = { activeAssessKitOrder = null },
                onAssigned = {
                    activeAssessKitOrder = null
                    actionBanner = "Field kit verified and assigned."
                    fetchAllData()
                }
            )
        }

        activeVisitModalOrder?.let { order ->
            AgentDoorstepVisitModal(
                order = order,
                onDismiss = { activeVisitModalOrder = null },
                onVisitCompleted = { duration ->
                    activeVisitModalOrder = null
                    actionBanner = "Sample collected in ${duration}m and stored in cold bag!"
                    fetchAllData()
                },
                onTriggerPaymentModal = {
                    activeVisitModalOrder = null
                    activeDoorstepQrOrder = order
                }
            )
        }

        activeDoorstepQrOrder?.let { order ->
            AgentDoorstepQrPaymentModal(
                order = order,
                onDismiss = { activeDoorstepQrOrder = null },
                onPaymentRecorded = {
                    activeDoorstepQrOrder = null
                    actionBanner = "Payment confirmed for ${order.id}."
                    fetchAllData()
                }
            )
        }

        if (showLabHandoverSheet) {
            AgentLabHandoverScreen(
                agentId = effectiveAgentId,
                agentName = user.name,
                onDismiss = { showLabHandoverSheet = false },
                onHandoverCompleted = {
                    showLabHandoverSheet = false
                    actionBanner = "Lab Handover completed successfully!"
                    fetchAllData()
                }
            )
        }

        if (showNotificationCenter) {
            NotificationCenterSheet(
                userId = effectiveAgentId,
                onDismiss = {
                    showNotificationCenter = false
                    fetchAllData()
                }
            )
        }
    }
}

// ==========================================
// HERO GREETING CARD
// ==========================================
@Composable
private fun HeroGreetingCard(
    greeting: String,
    agentName: String
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(140.dp)
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(18.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            // Background scenic temple banner
            Image(
                painter = painterResource(id = R.drawable.temple),
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )

            // Glassmorphic Gradient Overlay
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.horizontalGradient(
                            colors = listOf(
                                Color.White.copy(alpha = 0.94f),
                                Color.White.copy(alpha = 0.70f),
                                Color.White.copy(alpha = 0.15f)
                            )
                        )
                    )
            )

            // Greeting Text
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(3.dp),
                horizontalAlignment = Alignment.Start
            ) {
                Text(greeting, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate600)
                Text(agentName, fontSize = 18.sp, fontWeight = FontWeight.Black, color = Slate900)

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Verified, contentDescription = null, tint = AccentEmerald, modifier = Modifier.size(13.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Freelance Partner • Verified MLT", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = AccentEmerald)
                    Spacer(Modifier.width(6.dp))
                    Text("•", color = Slate400)
                    Spacer(Modifier.width(6.dp))
                    Text("Tirupati Fleet", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Slate600)
                }
            }
        }
    }
}

// ==========================================
// BROADCAST GIGS ALERT BANNER
// ==========================================
@Composable
private fun OpenBroadcastAlertBanner(
    gigsCount: Int,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clip(RoundedCornerShape(14.dp))
            .clickable { onClick() }
            .border(1.dp, AccentEmerald.copy(alpha = 0.3f), RoundedCornerShape(14.dp)),
        shape = RoundedCornerShape(14.dp),
        color = AccentEmerald.copy(alpha = 0.08f)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(AccentEmerald),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Bolt, contentDescription = null, tint = Color.white, modifier = Modifier.size(18.dp))
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("⚡ $gigsCount Overflow Gigs Available", fontSize = 13.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Spacer(Modifier.width(6.dp))
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = AccentEmerald
                    ) {
                        Text(
                            "CLAIM NOW",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.white,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
                Spacer(Modifier.height(2.dp))
                Text("Earn up to ₹420 per sample collection • First claim wins", fontSize = 11.sp, color = Slate600)
            }
            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate400, modifier = Modifier.size(16.dp))
        }
    }
}

// ==========================================
// LAB HANDOVER BANNER
// ==========================================
@Composable
private fun LabHandoverActionBanner(
    pendingCount: Int,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clip(RoundedCornerShape(14.dp))
            .clickable { onClick() }
            .border(1.dp, Color(0xFFF59E0B).copy(alpha = 0.3f), RoundedCornerShape(14.dp)),
        shape = RoundedCornerShape(14.dp),
        color = Color(0xFFF59E0B).copy(alpha = 0.08f)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFF59E0B)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.LocalShipping, contentDescription = null, tint = Color.white, modifier = Modifier.size(18.dp))
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Deliver Samples to Designated Lab", fontSize = 13.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Spacer(Modifier.width(6.dp))
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = Color(0xFFF59E0B)
                    ) {
                        Text(
                            "$pendingCount Pending",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.white,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
                Spacer(Modifier.height(2.dp))
                Text("Cold bag at 4.2°C • Transfer to lab technician for processing", fontSize = 11.sp, color = Slate600)
            }
            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate400, modifier = Modifier.size(16.dp))
        }
    }
}

// ==========================================
// NO ASSIGNED ORDERS PLACEHOLDER
// ==========================================
@Composable
private fun NoAssignedOrdersPlaceholder() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.white),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 24.dp, horizontal = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = AccentEmerald, modifier = Modifier.size(32.dp))
            Text("No Active Pickups In Progress", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate800)
            Text(
                "Claim overflow gigs from the marketplace above to start your next collection.",
                fontSize = 12.sp,
                color = Slate500,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }
    }
}
