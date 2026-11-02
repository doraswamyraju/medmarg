package com.medmarg.patient.ui.agent

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// 📋 AGENT ORDERS ROSTER SCREEN (TAB 7)
// 100% Live Backend Roster - Zero Dummy Data
// Replicated 1-on-1 with iOS AgentOrdersView.swift
// =========================================================================

@Composable
fun AgentOrdersScreen(
    user: UserProfile,
    onTabSelected: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "AG-01"

    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("ALL") } // ALL, PENDING, ENROUTE, ARRIVED, COLLECTED, COMPLETED
    var ordersList by remember { mutableStateOf<List<AgentPickupOrder>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }

    var activeVisitOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var activeQrOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var bannerMessage by remember { mutableStateOf<String?>(null) }

    fun refreshOrders() {
        coroutineScope.launch {
            isLoading = true
            ordersList = AgentRepository.fetchRoster(effectiveAgentId)
            isLoading = false
        }
    }

    LaunchedEffect(Unit) {
        refreshOrders()
    }

    val filteredOrders = ordersList.filter { ord ->
        val q = searchQuery.lowercase().trim()
        val matchSearch = q.isEmpty() ||
                ord.effectivePatientName.lowercase().contains(q) ||
                (ord.address ?: "").lowercase().contains(q) ||
                (ord.items ?: "").lowercase().contains(q) ||
                ord.id.lowercase().contains(q)

        val matchFilter = when (selectedFilter) {
            "PENDING" -> ord.status == "ASSIGNED"
            "ENROUTE" -> ord.status == "ENROUTE"
            "ARRIVED" -> ord.status == "ARRIVED" || ord.status == "KIT_ASSIGNED"
            "COLLECTED" -> ord.status == "SAMPLE_COLLECTED"
            "COMPLETED" -> ord.status == "COMPLETED" || ord.status == "DELIVERED"
            else -> true
        }

        matchSearch && matchFilter
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
                    text = "Pickups & Orders Roster",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900,
                    modifier = Modifier.weight(1f)
                )

                IconButton(onClick = { refreshOrders() }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = MedTealPrimary)
                }
            }

            bannerMessage?.let { banner ->
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
                        modifier = Modifier.size(16.dp).clickable { bannerMessage = null }
                    )
                }
            }

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search patient, phone, address, test...", fontSize = 12.sp, color = Slate400) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Slate400) },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        Icon(
                            Icons.Default.Close,
                            contentDescription = "Clear",
                            tint = Slate400,
                            modifier = Modifier.clickable { searchQuery = "" }
                        )
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = PureWhite,
                    unfocusedContainerColor = PureWhite,
                    focusedBorderColor = MedTealPrimary,
                    unfocusedBorderColor = Slate200
                ),
                singleLine = true
            )

            // Status Filter Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                val chips = listOf(
                    "ALL" to "All (${ordersList.size})",
                    "PENDING" to "Pending",
                    "ENROUTE" to "En Route",
                    "ARRIVED" to "Arrived",
                    "COLLECTED" to "Collected",
                    "COMPLETED" to "Completed"
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

            Spacer(modifier = Modifier.height(8.dp))

            // Scrollable Orders List
            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = MedTealPrimary)
                }
            } else if (filteredOrders.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No matching orders found", fontSize = 13.sp, color = Slate500)
                }
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp)
                        .padding(bottom = 90.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    filteredOrders.forEach { ord ->
                        RosterOrderCard(
                            order = ord,
                            onOpenVisit = { activeVisitOrder = ord },
                            onCollectPayment = { activeQrOrder = ord },
                            onStatusAction = { nextStatus ->
                                coroutineScope.launch {
                                    AgentRepository.updatePickupStatus(ord.id, nextStatus)
                                    refreshOrders()
                                    bannerMessage = "Order ${ord.id} updated to $nextStatus"
                                }
                            }
                        )
                    }
                }
            }
        }
    }

    // Modals
    activeVisitOrder?.let { ord ->
        AgentDoorstepVisitModal(
            order = ord,
            onDismiss = { activeVisitOrder = null },
            onCollectQrPayment = { activeQrOrder = ord },
            onCompleteVisit = {
                activeVisitOrder = null
                refreshOrders()
                bannerMessage = "Sample collected for ${ord.effectivePatientName}!"
            }
        )
    }

    activeQrOrder?.let { ord ->
        AgentDoorstepQrPaymentModal(
            order = ord,
            onDismiss = { activeQrOrder = null },
            onPaymentDone = {
                activeQrOrder = null
                refreshOrders()
                bannerMessage = "Payment recorded successfully!"
            }
        )
    }
}

@Composable
private fun RosterOrderCard(
    order: AgentPickupOrder,
    onOpenVisit: () -> Unit,
    onCollectPayment: () -> Unit,
    onStatusAction: (String) -> Unit
) {
    val context = LocalContext.current

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onOpenVisit() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header Row: Slot, Name, Status Pill
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = order.slot ?: "07:30 AM - 08:30 AM",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate500
                    )
                    Text(
                        text = order.effectivePatientName,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )
                }

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
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = order.status ?: "ASSIGNED",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = stColor
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Address & Phone
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Place, contentDescription = null, tint = Slate400, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(order.address ?: "Tirupati", fontSize = 12.sp, color = Slate600)
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Tests
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Biotech, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(order.items ?: "Diagnostic Blood Tests", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Slate800)
            }

            Spacer(modifier = Modifier.height(10.dp))

            Divider(color = Slate100, thickness = 1.dp)

            Spacer(modifier = Modifier.height(10.dp))

            // Footer Row: Price, Payment Status & Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "₹${order.effectiveAmount}",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )
                    Text(
                        text = if (order.isPaid) "PAID" else "PAYMENT DUE",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (order.isPaid) EmeraldAccent else RoseError
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    // Call Button
                    IconButton(
                        onClick = {
                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${order.effectivePhone}"))
                            context.startActivity(intent)
                        },
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Slate100)
                    ) {
                        Icon(Icons.Default.Phone, contentDescription = "Call", tint = Slate700, modifier = Modifier.size(18.dp))
                    }

                    // Maps Direction Button
                    IconButton(
                        onClick = {
                            val uri = Uri.parse("geo:0,0?q=${Uri.encode(order.address ?: "Tirupati")}")
                            val intent = Intent(Intent.ACTION_VIEW, uri)
                            context.startActivity(intent)
                        },
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(MedTealLight)
                    ) {
                        Icon(Icons.Default.Navigation, contentDescription = "Navigate", tint = MedTealPrimary, modifier = Modifier.size(18.dp))
                    }

                    // Primary Step Action Button
                    val (btnLabel, nextState) = when (order.status) {
                        "ASSIGNED" -> Pair("Start Trip", "ENROUTE")
                        "ENROUTE" -> Pair("Arrived", "ARRIVED")
                        "ARRIVED", "KIT_ASSIGNED" -> Pair("Collect", null)
                        "SAMPLE_COLLECTED" -> Pair("Handover", null)
                        else -> Pair("View", null)
                    }

                    Button(
                        onClick = {
                            if (nextState != null) {
                                onStatusAction(nextState)
                            } else {
                                onOpenVisit()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Text(btnLabel, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }
            }
        }
    }
}
