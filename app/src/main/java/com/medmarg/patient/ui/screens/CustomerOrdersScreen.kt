package com.medmarg.patient.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.ReceiptLong
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.LivePatientOrder
import com.medmarg.patient.data.PatientApiService
import com.medmarg.patient.data.PatientSessionStore
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

/**
 * Dedicated Customer Orders Screen (1:1 parity with iOS CareSeekerOrdersView.swift).
 * Displays live Active Bookings and Past Diagnostic Orders with zero dummy data.
 */
@Composable
fun CustomerOrdersScreen(
    user: UserProfile,
    onBack: () -> Unit,
    onOpenLiveTracker: (LivePatientOrder) -> Unit,
    onBrowseTests: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var isLoading by remember { mutableStateOf(true) }
    var filterTab by remember { mutableStateOf("ALL") } // ALL, ACTIVE, COMPLETED

    fun refreshOrders() {
        coroutineScope.launch {
            isLoading = true
            val fetched = PatientApiService.fetchPatientOrders(user)
            val existingIds = fetched.map { it.id }.toSet()
            val localOnly = PatientSessionStore.liveOrders.filter { it.id !in existingIds }
            PatientSessionStore.liveOrders.clear()
            PatientSessionStore.liveOrders.addAll(localOnly + fetched)
            isLoading = false
        }
    }

    LaunchedEffect(user.id, user.phone) {
        refreshOrders()
    }

    val displayedOrders = PatientSessionStore.liveOrders.filter { ord ->
        when (filterTab) {
            "ACTIVE" -> ord.isActive
            "COMPLETED" -> !ord.isActive
            else -> true
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
            .padding(16.dp)
            .padding(bottom = 100.dp)
    ) {
        // Header Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(PureWhite)
                        .clickable { onBack() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Slate900, modifier = Modifier.size(18.dp))
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "My Diagnostic Bookings",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )
                    Text(
                        text = "Live Doorstep Sample Pickups & Lab Invoices",
                        fontSize = 11.sp,
                        color = Slate500
                    )
                }
            }

            IconButton(onClick = { refreshOrders() }) {
                Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = MedTealPrimary)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Filter Tabs
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(
                "ALL" to "All Orders (${PatientSessionStore.liveOrders.size})",
                "ACTIVE" to "Active (${PatientSessionStore.liveOrders.count { it.isActive }})",
                "COMPLETED" to "Completed (${PatientSessionStore.liveOrders.count { !it.isActive }})"
            ).forEach { (key, label) ->
                val isSel = filterTab == key
                Surface(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .clickable { filterTab = key },
                    color = if (isSel) MedTealPrimary else PureWhite,
                    shape = RoundedCornerShape(20.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) MedTealPrimary else Slate200)
                ) {
                    Text(
                        text = label,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isSel) PureWhite else Slate700,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 48.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = MedTealPrimary)
            }
        } else if (displayedOrders.isEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape)
                            .background(MedTealLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.ReceiptLong,
                            contentDescription = null,
                            tint = MedTealPrimary,
                            modifier = Modifier.size(30.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = "No Diagnostic Bookings Yet",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Text(
                        text = "Book a blood test or full-body health checkup for free doorstep sample collection.",
                        fontSize = 12.sp,
                        color = Slate500,
                        modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
                    )
                    Button(
                        onClick = onBrowseTests,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                    ) {
                        Text("Explore Tests & Packages", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(displayedOrders, key = { it.id }) { order ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onOpenLiveTracker(order) },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Order #${order.id}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Black,
                                    color = MedTealPrimary
                                )
                                Surface(
                                    color = if (order.isActive) EmeraldLight else Slate100,
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Text(
                                        text = order.status.replace("_", " "),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (order.isActive) EmeraldAccent else Slate700,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = order.tests.joinToString(", ") { it.name }.ifEmpty { "Diagnostic Home Collection" },
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )

                            Text(
                                text = "${order.labName} • Beneficiary: ${order.patientName} (${order.beneficiaryRelation})",
                                fontSize = 11.sp,
                                color = Slate500,
                                modifier = Modifier.padding(top = 2.dp)
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Schedule, contentDescription = null, tint = Slate500, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("${order.date} • ${order.slot}", fontSize = 11.sp, color = Slate700)
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.LocationOn, contentDescription = null, tint = Slate500, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(order.address, fontSize = 11.sp, color = Slate600, maxLines = 1)
                            }

                            HorizontalDivider(color = Slate100, modifier = Modifier.padding(vertical = 10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "₹${order.totalAmount} (${order.paymentStatus.replace("_", " ")})",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Slate900
                                    )
                                    Text(
                                        text = "Handover OTP: ${order.otp}",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = AmberGold
                                    )
                                }

                                Button(
                                    onClick = { onOpenLiveTracker(order) },
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)
                                ) {
                                    Text(
                                        text = if (order.isActive) "Track Live" else "View Details",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = PureWhite
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

