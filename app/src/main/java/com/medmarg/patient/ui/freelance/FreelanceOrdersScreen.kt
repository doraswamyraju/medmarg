package com.medmarg.patient.ui.freelance

import android.content.Intent
import android.net.Uri
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.model.FreelanceBroadcastJobItem
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.agent.AgentDoorstepQrPaymentModal
import com.medmarg.patient.ui.agent.AgentDoorstepVisitModal
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// 🎯 FREELANCE GIGS & BROADCASTS SCREEN (TAB 7)
// Replicated 1-on-1 with iOS FreelanceOrdersView.swift
// Features: My Assigned Gigs + Available Broadcast Overflow Gigs (Claim)
// =========================================================================

@Composable
fun FreelanceOrdersScreen(
    user: UserProfile,
    onTabSelected: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "FL-502"

    var selectedSubTab by remember { mutableIntStateOf(0) } // 0: My Gigs, 1: Available Broadcasts
    var myOrders by remember { mutableStateOf<List<AgentPickupOrder>>(emptyList()) }
    var broadcastGigs by remember { mutableStateOf<List<FreelanceBroadcastJobItem>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var bannerMessage by remember { mutableStateOf<String?>(null) }

    var activeVisitOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var activeQrOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }

    fun refreshGigs() {
        coroutineScope.launch {
            isLoading = true
            myOrders = AgentRepository.fetchRoster(effectiveAgentId)
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
        refreshGigs()
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
                    text = "Freelance Phlebotomy Gigs",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900,
                    modifier = Modifier.weight(1f)
                )

                IconButton(onClick = { refreshGigs() }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = Color(0xFFEA580C))
                }
            }

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

            // Segmented Tabs: My Assigned Gigs vs Available Broadcasts
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Slate200)
                    .padding(3.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (selectedSubTab == 0) PureWhite else Color.Transparent)
                        .clickable { selectedSubTab = 0 }
                        .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "My Assigned Gigs (${myOrders.size})",
                        fontSize = 12.sp,
                        fontWeight = if (selectedSubTab == 0) FontWeight.Bold else FontWeight.Medium,
                        color = if (selectedSubTab == 0) Color(0xFFEA580C) else Slate700
                    )
                }

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (selectedSubTab == 1) PureWhite else Color.Transparent)
                        .clickable { selectedSubTab = 1 }
                        .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Available Broadcasts (${broadcastGigs.size})",
                        fontSize = 12.sp,
                        fontWeight = if (selectedSubTab == 1) FontWeight.Bold else FontWeight.Medium,
                        color = if (selectedSubTab == 1) Color(0xFF2563EB) else Slate700
                    )
                }
            }

            // Body List
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .padding(bottom = 90.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (selectedSubTab == 0) {
                    // My Assigned Gigs
                    if (myOrders.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(30.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("No gigs currently assigned", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate700)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Switch to 'Available Broadcasts' to claim open patient visits", fontSize = 12.sp, color = Slate500)
                            }
                        }
                    } else {
                        myOrders.forEach { ord ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { activeVisitOrder = ord },
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = PureWhite),
                                elevation = CardDefaults.cardElevation(2.dp)
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.Top
                                    ) {
                                        Column {
                                            Text(ord.effectivePatientName, fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                                            Text(ord.address ?: "Tirupati", fontSize = 11.sp, color = Slate500)
                                        }

                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(Color(0xFFFFF7ED))
                                                .padding(horizontal = 8.dp, vertical = 4.dp)
                                        ) {
                                            Text("₹350 Payout", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Color(0xFFEA580C))
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(ord.items ?: "Pathology Panel", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = MedTealPrimary)

                                    Spacer(modifier = Modifier.height(10.dp))
                                    Divider(color = Slate100)
                                    Spacer(modifier = Modifier.height(10.dp))

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text("Status: ${ord.status}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate700)

                                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                            IconButton(
                                                onClick = {
                                                    val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${ord.effectivePhone}"))
                                                    context.startActivity(intent)
                                                },
                                                modifier = Modifier.size(34.dp).clip(CircleShape).background(Slate100)
                                            ) {
                                                Icon(Icons.Default.Phone, contentDescription = null, tint = Slate700, modifier = Modifier.size(16.dp))
                                            }

                                            Button(
                                                onClick = { activeVisitOrder = ord },
                                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEA580C)),
                                                shape = RoundedCornerShape(8.dp),
                                                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                                            ) {
                                                Text("Start Visit", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // Available Broadcast Overflow Gigs (First to Claim Gets It!)
                    broadcastGigs.forEach { gig ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = PureWhite),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF2563EB).copy(alpha = 0.3f)),
                            elevation = CardDefaults.cardElevation(2.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(Color(0xFFDBEAFE))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(gig.urgency ?: "URGENT", fontSize = 9.sp, fontWeight = FontWeight.Black, color = Color(0xFF2563EB))
                                    }

                                    Text(
                                        text = "Payout: ₹${gig.effectivePayout}",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Black,
                                        color = EmeraldAccent
                                    )
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                Text(gig.patientName ?: "Care Seeker", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                                Text("${gig.address} • ${gig.distance}", fontSize = 11.sp, color = Slate500)
                                Text("Slot: ${gig.timeSlot}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate700)

                                Spacer(modifier = Modifier.height(4.dp))
                                Text(gig.tests ?: "Diagnostics", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = MedTealPrimary)

                                Spacer(modifier = Modifier.height(12.dp))

                                Button(
                                    onClick = {
                                        coroutineScope.launch {
                                            val success = AgentRepository.claimBroadcastGig(effectiveAgentId, gig.id)
                                            if (success) {
                                                bannerMessage = "Gig ${gig.id} claimed! Added to your assigned route."
                                                selectedSubTab = 0
                                                refreshGigs()
                                            }
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB)),
                                    shape = RoundedCornerShape(10.dp),
                                    contentPadding = PaddingValues(vertical = 10.dp)
                                ) {
                                    Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Claim Gig (₹${gig.effectivePayout})", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
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
                refreshGigs()
                bannerMessage = "Gig completed! ₹350 payout credited to wallet."
            }
        )
    }

    activeQrOrder?.let { gig ->
        AgentDoorstepQrPaymentModal(
            order = gig,
            onDismiss = { activeQrOrder = null },
            onPaymentDone = {
                activeQrOrder = null
                refreshGigs()
                bannerMessage = "Payment recorded successfully!"
            }
        )
    }
}
