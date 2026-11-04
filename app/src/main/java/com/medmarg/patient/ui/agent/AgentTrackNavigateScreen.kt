package com.medmarg.patient.ui.agent

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Canvas
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
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
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

// =========================================================================
// 🗺 AGENT TRACK & NAVIGATE VIEW (DEDICATED MULTI-STOP ROUTE VIEW)
// 1-on-1 replication of ios/Agent/Views/AgentTrackNavigateView.swift
// =========================================================================

@Composable
fun AgentTrackNavigateScreen(
    user: UserProfile,
    onTabSelected: (Int) -> Unit,
    onOpenSidebar: () -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenOrderDetail: (AgentPickupOrder) -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var isOnDuty by remember { mutableStateOf(true) }
    var orders by remember { mutableStateOf<List<AgentPickupOrder>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var selectedFilterTab by remember { mutableStateOf("LIVE_ROUTE") } // LIVE_ROUTE, ORDER_LIST, MAP_VIEW, COMPLETED
    var fullScreenNavOrder by remember { mutableStateOf<AgentPickupOrder?>(null) }

    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "AG-01"
    val todayFormatted = remember {
        SimpleDateFormat("EEE, dd MMM yyyy", Locale.US).format(Date())
    }

    fun refreshRoute() {
        coroutineScope.launch {
            isLoading = true
            orders = AgentRepository.fetchRoster(effectiveAgentId)
            isLoading = false
        }
    }

    LaunchedEffect(effectiveAgentId) {
        refreshRoute()
    }

    val assignedCount = orders.size
    val completedCount = orders.count {
        it.status == "SAMPLE_COLLECTED" || it.status == "COMPLETED" || it.status == "DELIVERED"
    }
    val remainingCount = maxOf(0, assignedCount - completedCount)
    val totalDistanceKm = maxOf(3.2, orders.size * 3.8)
    val estTotalMins = maxOf(10, orders.size * 14)

    val nextActiveStop = orders.firstOrNull {
        it.status != "SAMPLE_COLLECTED" && it.status != "COMPLETED" && it.status != "DELIVERED"
    } ?: orders.firstOrNull()

    val displayedOrders = when (selectedFilterTab) {
        "COMPLETED" -> orders.filter { it.status == "SAMPLE_COLLECTED" || it.status == "COMPLETED" || it.status == "DELIVERED" }
        else -> orders
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
            // Header Section
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column {
                    Text("Track & Navigate", fontSize = 24.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Text("Follow your route and manage today's visits", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Slate500)
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

            // 3 Metric Summary Cards Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                RouteSummaryCard(
                    value = "$assignedCount",
                    title = "Assigned Orders",
                    subtitle = "$remainingCount Remaining",
                    icon = Icons.Default.ListAlt,
                    color = Color(0xFF2563EB),
                    modifier = Modifier.weight(1f)
                )
                RouteSummaryCard(
                    value = "$completedCount / $assignedCount",
                    title = "Completed",
                    subtitle = "$remainingCount Pending",
                    icon = Icons.Default.CheckCircle,
                    color = EmeraldAccent,
                    modifier = Modifier.weight(1f)
                )
                RouteSummaryCard(
                    value = String.format("%.1f km", totalDistanceKm),
                    title = "Total Distance",
                    subtitle = "Est. $estTotalMins mins",
                    icon = Icons.Default.NearMe,
                    color = Color(0xFFF97316),
                    modifier = Modifier.weight(1f)
                )
            }

            // 4 Filter Tabs Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf(
                    "LIVE_ROUTE" to "Live Route",
                    "ORDER_LIST" to "Order List",
                    "MAP_VIEW" to "Map View",
                    "COMPLETED" to "Completed"
                ).forEach { (key, title) ->
                    val isSelected = selectedFilterTab == key
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSelected) MedTealPrimary else PureWhite)
                            .border(1.dp, if (isSelected) MedTealPrimary else Slate200, RoundedCornerShape(10.dp))
                            .clickable { selectedFilterTab = key }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = title,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected) PureWhite else Slate700
                        )
                    }
                }
            }

            // Interactive Route Map Canvas Card
            if (selectedFilterTab != "ORDER_LIST") {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                ) {
                    Column {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(220.dp)
                                .background(Color(0xFFEAF2F8))
                        ) {
                            Canvas(modifier = Modifier.fillMaxSize()) {
                                val w = size.width
                                val h = size.height
                                for (i in 1..6) {
                                    drawLine(Color(0xFFD6E4F0), Offset(0f, h * i / 7f), Offset(w, h * i / 7f), 3f)
                                    drawLine(Color(0xFFD6E4F0), Offset(w * i / 7f, 0f), Offset(w * i / 7f, h), 3f)
                                }
                                val path = Path().apply {
                                    moveTo(w * 0.18f, h * 0.72f)
                                    cubicTo(w * 0.38f, h * 0.45f, w * 0.62f, h * 0.55f, w * 0.82f, h * 0.28f)
                                }
                                drawPath(path, Color.White, style = Stroke(width = 18f, cap = StrokeCap.Round))
                                drawPath(
                                    path,
                                    Color(0xFF2563EB),
                                    style = Stroke(width = 8f, cap = StrokeCap.Round, pathEffect = PathEffect.dashPathEffect(floatArrayOf(18f, 12f), 0f))
                                )
                                drawCircle(MedTealPrimary.copy(alpha = 0.25f), 32f, Offset(w * 0.18f, h * 0.72f))
                                drawCircle(MedTealPrimary, 12f, Offset(w * 0.18f, h * 0.72f))
                                drawCircle(RoseError.copy(alpha = 0.25f), 32f, Offset(w * 0.82f, h * 0.28f))
                                drawCircle(RoseError, 12f, Offset(w * 0.82f, h * 0.28f))
                            }

                            // Top Floating Banner
                            nextActiveStop?.let { nextStop ->
                                Row(
                                    modifier = Modifier
                                        .align(Alignment.TopStart)
                                        .padding(10.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(PureWhite.copy(alpha = 0.96f))
                                        .padding(horizontal = 10.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(EmeraldAccent))
                                    Column {
                                        Text("En Route to ${nextStop.effectivePatientName}", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate900)
                                        Text("${nextStop.address ?: "Tirupati"} • 3.2 km", fontSize = 9.sp, color = Slate500, maxLines = 1)
                                    }
                                }
                            }
                        }

                        // Bottom Map Telemetry Strip
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(PureWhite)
                                .padding(horizontal = 12.dp, vertical = 10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                Icon(Icons.Default.DirectionsCar, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
                                Text("3.2 km (10 mins) to next stop", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate700)
                            }
                            Text(
                                text = "Open in Google Maps >",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF2563EB),
                                modifier = Modifier.clickable {
                                    val query = Uri.encode(nextActiveStop?.address ?: "Tirupati")
                                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=$query")))
                                }
                            )
                        }
                    }
                }
            }

            // #1 Next Stop Hero Card
            nextActiveStop?.let { nextStop ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .clickable { onOpenOrderDetail(nextStop) },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFF2563EB).copy(alpha = 0.25f))
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(Color(0xFF2563EB))
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text("#1 Next Stop", fontSize = 10.sp, fontWeight = FontWeight.Black, color = PureWhite)
                            }
                            Text("3.2 km • 10 mins away", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate700)
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                Text("ORD-${nextStop.id}", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = Slate500)
                                Text(nextStop.effectivePatientName, fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                                Text(nextStop.address ?: "Air Bypass Road, Tirupati", fontSize = 11.sp, color = Slate500, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                Text(nextStop.items ?: "Extensive Full Body Checkup", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary, maxLines = 1)
                            }

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(EmeraldAccent)
                                    .clickable { fullScreenNavOrder = nextStop }
                                    .padding(horizontal = 14.dp, vertical = 10.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                                    Icon(Icons.Default.Navigation, contentDescription = null, tint = PureWhite, modifier = Modifier.size(14.dp))
                                    Text("Navigate", fontSize = 12.sp, fontWeight = FontWeight.Black, color = PureWhite)
                                }
                            }
                        }
                    }
                }
            }

            // Today's Route Timeline Section
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Today's Route (${displayedOrders.size} Orders)", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900)
                        Text(
                            text = "Refresh Route",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = MedTealPrimary,
                            modifier = Modifier.clickable { refreshRoute() }
                        )
                    }

                    if (displayedOrders.isEmpty()) {
                        Text("No stops on route right now.", fontSize = 12.sp, color = Slate500, modifier = Modifier.padding(vertical = 8.dp))
                    } else {
                        displayedOrders.forEachIndexed { idx, ord ->
                            val isDone = ord.status == "SAMPLE_COLLECTED" || ord.status == "COMPLETED" || ord.status == "DELIVERED"
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Slate50)
                                    .clickable { onOpenOrderDetail(ord) }
                                    .padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .clip(CircleShape)
                                        .background(if (isDone) EmeraldAccent else if (idx == 0) Color(0xFF2563EB) else Color(0xFFF97316)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (isDone) {
                                        Icon(Icons.Default.Check, contentDescription = null, tint = PureWhite, modifier = Modifier.size(14.dp))
                                    } else {
                                        Text("${idx + 1}", fontSize = 12.sp, fontWeight = FontWeight.Black, color = PureWhite)
                                    }
                                }

                                Column(modifier = Modifier.weight(1f)) {
                                    Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                        Text(ord.effectivePatientName, fontSize = 13.sp, fontWeight = FontWeight.Black, color = Slate900)
                                        Text(ord.slot ?: "07:30 AM", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate600)
                                    }
                                    Text(ord.address ?: "Tirupati", fontSize = 10.sp, color = Slate500, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Text("ORD-${ord.id} • ₹${ord.effectiveAmount}", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                                }

                                Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate400, modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                }
            }
        }
    }

    fullScreenNavOrder?.let { navOrd ->
        FullScreenInAppMapModal(
            order = navOrd,
            onDismiss = { fullScreenNavOrder = null },
            onMarkArrived = {
                coroutineScope.launch {
                    AgentRepository.updatePickupStatus(navOrd.id, "ARRIVED")
                    refreshRoute()
                    onOpenOrderDetail(navOrd.copy(status = "ARRIVED"))
                }
            }
        )
    }
}

@Composable
private fun RouteSummaryCard(
    value: String,
    title: String,
    subtitle: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
    ) {
        Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Box(
                modifier = Modifier
                    .size(26.dp)
                    .clip(RoundedCornerShape(7.dp))
                    .background(color.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(14.dp))
            }
            Text(value, fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900, maxLines = 1)
            Text(title, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate900, maxLines = 1)
            Text(subtitle, fontSize = 9.sp, color = Slate500, maxLines = 1)
        }
    }
}

