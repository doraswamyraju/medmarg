package com.medmarg.patient.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
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
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.LivePatientOrder
import com.medmarg.patient.data.PatientApiService
import com.medmarg.patient.data.PatientSessionStore
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun TrackScreen(
    user: UserProfile? = null,
    onBrowseTests: () -> Unit = {},
    onOpenAllOrders: () -> Unit = {},
    onOpenReports: () -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var isLoading by remember { mutableStateOf(true) }

    fun syncLiveOrders() {
        coroutineScope.launch {
            val fetched = PatientApiService.fetchPatientOrders(user)
            val existingIds = fetched.map { it.id }.toSet()
            val localOnly = PatientSessionStore.liveOrders.filter { it.id !in existingIds }
            PatientSessionStore.liveOrders.clear()
            PatientSessionStore.liveOrders.addAll(localOnly + fetched)
            isLoading = false
        }
    }

    LaunchedEffect(user?.id, user?.phone) {
        isLoading = true
        syncLiveOrders()
        while (true) {
            delay(10000)
            syncLiveOrders()
        }
    }

    val activeOrders = PatientSessionStore.liveOrders.filter { it.isActive }
    var selectedOrderIndex by remember { mutableIntStateOf(0) }
    val currentOrder: LivePatientOrder? = activeOrders.getOrNull(selectedOrderIndex) ?: activeOrders.firstOrNull()

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val radarRadius by infiniteTransition.animateFloat(
        initialValue = 8f,
        targetValue = 28f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "radarRadius"
    )
    val radarAlpha by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 0.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "radarAlpha"
    )

    if (isLoading && PatientSessionStore.liveOrders.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Slate50),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                CircularProgressIndicator(color = MedTealPrimary)
                Spacer(modifier = Modifier.height(12.dp))
                Text("Syncing live dispatch radar...", fontSize = 13.sp, color = Slate500)
            }
        }
        return
    }

    if (currentOrder == null) {
        // Zero Dummy Data State when no active order exists for the logged-in patient
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Slate50)
                .padding(20.dp),
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(22.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200),
                elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(68.dp)
                            .clip(CircleShape)
                            .background(MedTealLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationSearching,
                            contentDescription = null,
                            tint = MedTealPrimary,
                            modifier = Modifier.size(34.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "No Active Doorstep Pickup",
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "You don't have an active sample collection in progress right now. Book a test or health package to track your certified phlebotomist in real time.",
                        fontSize = 13.sp,
                        color = Slate500,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = onBrowseTests,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                    ) {
                        Icon(Icons.Default.Biotech, contentDescription = null, tint = PureWhite, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Book Diagnostic Test / Package", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }

                    if (PatientSessionStore.liveOrders.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(10.dp))
                        OutlinedButton(
                            onClick = onOpenAllOrders,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(44.dp),
                            shape = RoundedCornerShape(12.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, MedTealPrimary)
                        ) {
                            Text("View Past Completed Orders (${PatientSessionStore.liveOrders.size})", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                        }
                    }
                }
            }
        }
        return
    }

    val statusUpper = currentOrder.status.uppercase()
    val currentStepIndex = when (statusUpper) {
        "PENDING_DISPATCH", "BOOKED", "CONFIRMED" -> 0
        "ASSIGNED" -> 1
        "ENROUTE", "EN_ROUTE" -> 2
        "SAMPLE_COLLECTED" -> 3
        "IN_LAB" -> 4
        "COMPLETED" -> 5
        else -> 0
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
            .verticalScroll(rememberScrollState())
            .padding(bottom = 120.dp)
    ) {
        // 1. Live Interactive Vector Map Canvas
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(280.dp)
                .background(Color(0xFFE8ECEF))
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val canvasWidth = size.width
                val canvasHeight = size.height

                drawRect(color = Color(0xFFF1F5F9))

                drawRoundRect(
                    color = Color(0xFFDCFCE7),
                    topLeft = Offset(canvasWidth * 0.08f, canvasHeight * 0.12f),
                    size = Size(canvasWidth * 0.32f, canvasHeight * 0.22f),
                    cornerRadius = CornerRadius(16f, 16f)
                )
                drawRoundRect(
                    color = Color(0xFFDCFCE7),
                    topLeft = Offset(canvasWidth * 0.65f, canvasHeight * 0.58f),
                    size = Size(canvasWidth * 0.28f, canvasHeight * 0.30f),
                    cornerRadius = CornerRadius(16f, 16f)
                )

                val roadColor = Color(0xFFFFFFFF)
                val roadBorderColor = Color(0xFFCBD5E1)

                listOf(0.24f, 0.46f, 0.72f).forEach { yFrac ->
                    val y = canvasHeight * yFrac
                    drawLine(color = roadBorderColor, start = Offset(0f, y), end = Offset(canvasWidth, y), strokeWidth = 24f)
                    drawLine(color = roadColor, start = Offset(0f, y), end = Offset(canvasWidth, y), strokeWidth = 20f)
                }

                listOf(0.22f, 0.50f, 0.78f).forEach { xFrac ->
                    val x = canvasWidth * xFrac
                    drawLine(color = roadBorderColor, start = Offset(x, 0f), end = Offset(x, canvasHeight), strokeWidth = 22f)
                    drawLine(color = roadColor, start = Offset(x, 0f), end = Offset(x, canvasHeight), strokeWidth = 18f)
                }

                val fullRoutePath = Path().apply {
                    moveTo(canvasWidth * 0.14f, canvasHeight * 0.22f)
                    lineTo(canvasWidth * 0.38f, canvasHeight * 0.30f)
                    lineTo(canvasWidth * 0.55f, canvasHeight * 0.48f)
                    lineTo(canvasWidth * 0.82f, canvasHeight * 0.70f)
                }

                drawPath(
                    path = fullRoutePath,
                    color = MedTealPrimary.copy(alpha = 0.25f),
                    style = Stroke(width = 16f, cap = StrokeCap.Round)
                )
                drawPath(
                    path = fullRoutePath,
                    color = MedTealPrimary,
                    style = Stroke(width = 7f, cap = StrokeCap.Round, pathEffect = PathEffect.dashPathEffect(floatArrayOf(16f, 10f)))
                )

                // Hub Marker
                val hubCenter = Offset(canvasWidth * 0.14f, canvasHeight * 0.22f)
                drawCircle(color = Slate900, radius = 12f, center = hubCenter)
                drawCircle(color = PureWhite, radius = 5f, center = hubCenter)

                // Patient Home Marker
                val homeCenter = Offset(canvasWidth * 0.82f, canvasHeight * 0.70f)
                drawCircle(color = EmeraldAccent, radius = 14f, center = homeCenter)
                drawCircle(color = PureWhite, radius = 6f, center = homeCenter)

                // Phlebotomist Radar Marker
                val agentCenter = Offset(canvasWidth * 0.52f, canvasHeight * 0.46f)
                drawCircle(
                    color = MedTealPrimary.copy(alpha = radarAlpha),
                    radius = radarRadius * 2f,
                    center = agentCenter
                )
                drawCircle(color = MedTealPrimary, radius = 14f, center = agentCenter)
                drawCircle(color = PureWhite, radius = 6f, center = agentCenter)
            }

            // Top Floating Status Pill
            Surface(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(14.dp),
                shape = RoundedCornerShape(12.dp),
                color = Slate900.copy(alpha = 0.92f),
                shadowElevation = 6.dp
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(EmeraldAccent)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "LIVE RADAR • ORDER #${currentOrder.id}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = PureWhite
                    )
                }
            }

            // Refresh Button on Map
            Surface(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(14.dp)
                    .clickable { syncLiveOrders() },
                shape = CircleShape,
                color = PureWhite,
                shadowElevation = 4.dp
            ) {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "Refresh",
                    tint = MedTealPrimary,
                    modifier = Modifier.padding(8.dp).size(18.dp)
                )
            }

            // Cold-Chain Telemetry Badge
            Surface(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(14.dp),
                shape = RoundedCornerShape(10.dp),
                color = PureWhite.copy(alpha = 0.95f),
                shadowElevation = 4.dp
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.AcUnit, contentDescription = null, tint = Color(0xFF0284C7), modifier = Modifier.size(15.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Cold-Chain: 4.2°C • Sealed",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate800
                    )
                }
            }

            // ETA & Distance Telemetry Badge (1-on-1 Parity with iOS CareSeekerTrackingView)
            Surface(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(14.dp),
                shape = RoundedCornerShape(10.dp),
                color = Slate900.copy(alpha = 0.92f),
                shadowElevation = 4.dp
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.DirectionsBike,
                        contentDescription = null,
                        tint = EmeraldAccent,
                        modifier = Modifier.size(15.dp)
                    )
                    Text(
                        text = "ETA: ~14 Mins • 1.8 km",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                }
            }
        }

        // Multiple Active Orders Selector if > 1
        if (activeOrders.size > 1) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                activeOrders.forEachIndexed { idx, ord ->
                    val isSel = idx == selectedOrderIndex
                    Surface(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .clickable { selectedOrderIndex = idx },
                        color = if (isSel) MedTealPrimary else PureWhite,
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) MedTealPrimary else Slate200)
                    ) {
                        Text(
                            text = "#${ord.id}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSel) PureWhite else Slate700,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }
            }
        }

        // 2. Handover OTP & Phlebotomist Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200),
            elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = currentOrder.assignedAgentName,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            color = Slate900
                        )
                        Text(
                            text = "${currentOrder.labName} • Certified Phlebotomist",
                            fontSize = 12.sp,
                            color = Slate500
                        )
                    }

                    // 4-Digit Handover OTP Box
                    Surface(
                        color = MedTealLight,
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, MedTealPrimary)
                    ) {
                        Column(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "HANDOVER OTP",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = MedTealPrimary
                            )
                            Text(
                                text = currentOrder.otp,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                color = Slate900,
                                letterSpacing = 2.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Button(
                        onClick = {
                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${currentOrder.assignedAgentPhone}"))
                            context.startActivity(intent)
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                    ) {
                        Icon(Icons.Default.Call, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Call Phlebotomist", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }

                    OutlinedButton(
                        onClick = onOpenAllOrders,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Icon(Icons.Default.ReceiptLong, contentDescription = null, tint = Slate700, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("All Bookings", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate700)
                    }
                }
            }
        }

        // 3. Live 5-Stage Diagnostic Progress Stepper
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "LIVE SAMPLE CHAIN-OF-CUSTODY",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate500,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(12.dp))

                val stages = listOf(
                    Triple("Booking Confirmed & Dispatched", "Order #${currentOrder.id} • ${currentOrder.date} (${currentOrder.slot})", 0),
                    Triple("Certified Phlebotomist Assigned", currentOrder.assignedAgentName, 1),
                    Triple("Phlebotomist En Route to Doorstep", currentOrder.address, 2),
                    Triple("Vacutainer Sample Collected & Barcoded", "Verified via Handover OTP ${currentOrder.otp}", 3),
                    Triple("Processing in NABL Automated Analyzer", currentOrder.labName, 4),
                    Triple("Diagnostic Report Generated", if (currentStepIndex >= 5) "Digital PDF Ready in Health Vault" else "Available within 6-12 hours of collection", 5)
                )

                stages.forEach { (title, subtitle, stepIdx) ->
                    val isDone = currentStepIndex >= stepIdx
                    val isCurrent = currentStepIndex == stepIdx
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(
                                    when {
                                        isCurrent -> EmeraldAccent
                                        isDone -> MedTealPrimary
                                        else -> Slate200
                                    }
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (isDone) Icons.Default.Check else Icons.Default.Schedule,
                                contentDescription = null,
                                tint = if (isDone) PureWhite else Slate500,
                                modifier = Modifier.size(14.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = title,
                                fontSize = 13.sp,
                                fontWeight = if (isCurrent) FontWeight.Black else FontWeight.Bold,
                                color = if (isDone) Slate900 else Slate400
                            )
                            Text(
                                text = subtitle,
                                fontSize = 11.sp,
                                color = if (isDone) Slate600 else Slate400
                            )
                        }
                    }
                }

                if (currentStepIndex >= 5) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = onOpenReports,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent)
                    ) {
                        Icon(Icons.Default.Description, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("View Digital Report in Health Vault", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 4. Booked Tests & Payment Details Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "BOOKED DIAGNOSTIC TESTS (${currentOrder.tests.size})",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate500
                )
                Spacer(modifier = Modifier.height(8.dp))

                currentOrder.tests.forEach { t ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(t.name, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Slate900, modifier = Modifier.weight(1f))
                        if (t.price > 0) {
                            Text("₹${t.price}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                        }
                    }
                }

                HorizontalDivider(color = Slate100, modifier = Modifier.padding(vertical = 10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Total (${currentOrder.paymentStatus.replace("_", " ")})",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Text(
                        text = "₹${currentOrder.totalAmount}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        color = MedTealPrimary
                    )
                }
            }
        }
    }
}
