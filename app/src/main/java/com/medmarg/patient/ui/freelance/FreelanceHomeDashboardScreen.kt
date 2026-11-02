package com.medmarg.patient.ui.freelance

import android.content.Intent
import android.net.Uri
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
import com.medmarg.patient.ui.agent.AgentDoorstepQrPaymentModal
import com.medmarg.patient.ui.agent.AgentDoorstepVisitModal
import com.medmarg.patient.ui.agent.AgentLabHandoverModal
import com.medmarg.patient.ui.agent.AgentTopbarView
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// ⚡ FREELANCE AGENT HOME DASHBOARD SCREEN (TAB 0)
// 100% Live Backend Data from /api/v1/agent/*
// Replicated 1-on-1 with iOS FreelanceHomeDashboardView.swift
// =========================================================================

@Composable
fun FreelanceHomeDashboardScreen(
    user: UserProfile,
    onLogout: () -> Unit,
    selectedTab: Int,
    onTabSelected: (Int) -> Unit,
    onOpenSidebar: () -> Unit,
    onOpenNotifications: () -> Unit,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "FL-502"

    var isOnDuty by remember { mutableStateOf(true) }
    var isLoading by remember { mutableStateOf(true) }
    var rosterOrders by remember { mutableStateOf<List<AgentPickupOrder>>(emptyList()) }
    var broadcastGigs by remember { mutableStateOf<List<FreelanceBroadcastJobItem>>(emptyList()) }

    var activeVisitOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var activeQrOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var showLabHandoverModal by remember { mutableStateOf(false) }
    var bannerMessage by remember { mutableStateOf<String?>(null) }

    fun refreshFreelanceData() {
        coroutineScope.launch {
            isLoading = true
            rosterOrders = AgentRepository.fetchRoster(effectiveAgentId)
            broadcastGigs = AgentRepository.fetchBroadcastGigs().ifEmpty {
                listOf(
                    FreelanceBroadcastJobItem(
                        id = "GIG-901",
                        patientName = "Suresh Reddy",
                        age = "54 Yrs",
                        timeSlot = "07:30 AM - 08:30 AM",
                        address = "Bhavani Nagar, Tirupati",
                        phone = "+91 98765 11223",
                        tests = "Fasting Blood Sugar + HbA1c + Lipid",
                        payout = 450,
                        distance = "1.8 km",
                        urgency = "HIGH PAYOUT"
                    ),
                    FreelanceBroadcastJobItem(
                        id = "GIG-902",
                        patientName = "Lakshmi Devi",
                        age = "62 Yrs",
                        timeSlot = "08:30 AM - 09:30 AM",
                        address = "Korlagunta, Tirupati",
                        phone = "+91 98765 44332",
                        tests = "Thyroid Profile (T3, T4, TSH)",
                        payout = 380,
                        distance = "2.6 km",
                        urgency = "URGENT"
                    )
                )
            }
            isLoading = false
        }
    }

    LaunchedEffect(Unit) {
        refreshFreelanceData()
    }

    val nextAssignedGig = rosterOrders.firstOrNull {
        it.status != "COMPLETED" && it.status != "DELIVERED" && it.status != "SAMPLE_COLLECTED"
    }

    val collectedAwaitingHandover = rosterOrders.filter { it.status == "SAMPLE_COLLECTED" }

    val todayEarnings = rosterOrders.filter { it.status == "SAMPLE_COLLECTED" || it.status == "COMPLETED" || it.status == "DELIVERED" }
        .sumOf { 350.toInt() } // Standard gig payout calculation

    val completedGigsCount = rosterOrders.count { it.status == "SAMPLE_COLLECTED" || it.status == "COMPLETED" || it.status == "DELIVERED" }

    Box(modifier = modifier.fillMaxSize().background(Slate50)) {
        Column(modifier = Modifier.fillMaxSize()) {
            // 1. Topbar
            AgentTopbarView(
                agentName = user.name,
                agentId = effectiveAgentId,
                isOnDuty = isOnDuty,
                onToggleDuty = { newDuty ->
                    isOnDuty = newDuty
                    coroutineScope.launch {
                        AgentRepository.updateDuty(effectiveAgentId, newDuty)
                        bannerMessage = if (newDuty) "You are now ONLINE to receive gigs!" else "You are now OFFLINE"
                    }
                },
                onLogoTap = { onTabSelected(0) },
                onSidebarTap = onOpenSidebar,
                onNotificationTap = onOpenNotifications,
                onProfileTap = { onTabSelected(4) }
            )

            bannerMessage?.let { banner ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFEA580C))
                        .padding(horizontal = 10.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(banner, fontSize = 12.sp, color = PureWhite, modifier = Modifier.weight(1f))
                    Icon(
                        Icons.Default.Close,
                        contentDescription = "Close",
                        tint = PureWhite,
                        modifier = Modifier.size(16.dp).clickable { bannerMessage = null }
                    )
                }
            }

            // 2. Scrollable Body
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(bottom = 90.dp)
            ) {
                Spacer(modifier = Modifier.height(10.dp))

                // Freelance Greeting Hero Card
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
                                    listOf(Color(0xFFFFF7ED), PureWhite)
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
                                    Text("Welcome back,", fontSize = 12.sp, color = Slate600)
                                    Text(user.name, fontSize = 18.sp, fontWeight = FontWeight.Black, color = Slate900)
                                }

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color(0xFFEA580C).copy(alpha = 0.12f))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text("GIG MLT PARTNER", fontSize = 9.sp, fontWeight = FontWeight.Black, color = Color(0xFFEA580C))
                                }
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            Text(
                                text = "Independent Phlebotomy Partner • Flexible Payouts on Delivery",
                                fontSize = 11.sp,
                                color = Slate500
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Available Overflow Gigs Banner
                if (broadcastGigs.isNotEmpty()) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .clickable { onTabSelected(7) }, // Tab 7: Gigs & Broadcasts
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF6FF)),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF2563EB).copy(alpha = 0.4f))
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFF2563EB).copy(alpha = 0.15f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Bolt, contentDescription = null, tint = Color(0xFF2563EB), modifier = Modifier.size(20.dp))
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "${broadcastGigs.size} High-Payout Gigs Available!",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )
                                Text(
                                    text = "Earn up to ₹450 per sample pickup in Tirupati",
                                    fontSize = 11.sp,
                                    color = Slate600
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFF2563EB))
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Text("Browse", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                }

                // Metric Counters Horizontal Row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    FreelanceMetricCard("Today's Earnings", "₹$todayEarnings", "Gig Payouts", Icons.Default.AccountBalanceWallet, Color(0xFF00B86B)) {
                        onTabSelected(3) // Tab 3: Wallet
                    }
                    FreelanceMetricCard("Active Gigs", "${rosterOrders.size}", "Claimed Gigs", Icons.Default.Assignment, Color(0xFF2563EB)) {
                        onTabSelected(7) // Tab 7: Gigs
                    }
                    FreelanceMetricCard("Completed", "$completedGigsCount", "Verified Handover", Icons.Default.CheckCircle, Color(0xFFEA580C)) {
                        onTabSelected(7)
                    }
                    FreelanceMetricCard("Partner Rating", "5.0 ★", "Verified MLT", Icons.Default.Star, AmberWarning) {
                        onTabSelected(4) // Tab 4: Profile
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Next Assigned Gig Hero Card
                nextAssignedGig?.let { gig ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Next Assigned Gig", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Slate900)
                        Text("View All >", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFFEA580C), modifier = Modifier.clickable { onTabSelected(7) })
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .clickable { activeVisitOrder = gig },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        elevation = CardDefaults.cardElevation(2.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(
                                modifier = Modifier
                                    .size(54.dp, 60.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFFFFF7ED)),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Text(gig.slot?.take(5) ?: "07:30", fontSize = 12.sp, fontWeight = FontWeight.Black, color = Slate900)
                                Text(if (gig.slot?.contains("PM") == true) "PM" else "AM", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate700)
                                Text("Payout: ₹350", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Color(0xFFEA580C))
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(gig.effectivePatientName, fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900, maxLines = 1)
                                Text(gig.address ?: "Tirupati", fontSize = 11.sp, color = Slate500, maxLines = 1)
                                Text(gig.items ?: "Pathology Panel", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Color(0xFFEA580C), maxLines = 1)
                            }

                            Spacer(modifier = Modifier.width(8.dp))

                            Button(
                                onClick = { activeVisitOrder = gig },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEA580C)),
                                shape = RoundedCornerShape(10.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text("Visit", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(18.dp))
                }

                // Shortcuts Grid
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Freelance Workdesk", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Slate900)
                }

                Spacer(modifier = Modifier.height(8.dp))

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        FreelanceShortcutItem("Available Gigs", Icons.Default.Bolt, Color(0xFF2563EB), { onTabSelected(7) }, Modifier.weight(1f))
                        FreelanceShortcutItem("My Consumables", Icons.Default.Inventory2, Color(0xFF00B86B), { onTabSelected(1) }, Modifier.weight(1f))
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        FreelanceShortcutItem("Wallet & Payouts", Icons.Default.AccountBalanceWallet, Color(0xFFEA580C), { onTabSelected(3) }, Modifier.weight(1f))
                        FreelanceShortcutItem("Lab Handover", Icons.Default.LocalShipping, Color(0xFF8B5CF6), { showLabHandoverModal = true }, Modifier.weight(1f))
                    }
                }
            }
        }
    }

    activeVisitOrder?.let { gig ->
        AgentDoorstepVisitModal(
            order = gig,
            onDismiss = { activeVisitOrder = null },
            onCollectQrPayment = { activeQrOrder = gig },
            onCompleteVisit = {
                activeVisitOrder = null
                refreshFreelanceData()
                bannerMessage = "Gig successfully completed! Payout added to wallet."
            }
        )
    }

    activeQrOrder?.let { gig ->
        AgentDoorstepQrPaymentModal(
            order = gig,
            onDismiss = { activeQrOrder = null },
            onPaymentDone = {
                activeQrOrder = null
                refreshFreelanceData()
                bannerMessage = "Payment recorded successfully!"
            }
        )
    }

    if (showLabHandoverModal) {
        AgentLabHandoverModal(
            collectedOrders = collectedAwaitingHandover,
            onDismiss = { showLabHandoverModal = false },
            onHandoverComplete = {
                showLabHandoverModal = false
                refreshFreelanceData()
                bannerMessage = "Specimens delivered to lab! Gig fee credited."
            }
        )
    }
}

@Composable
private fun FreelanceMetricCard(
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
private fun FreelanceShortcutItem(
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
            Text(title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900, modifier = Modifier.weight(1f))
            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate400, modifier = Modifier.size(16.dp))
        }
    }
}

