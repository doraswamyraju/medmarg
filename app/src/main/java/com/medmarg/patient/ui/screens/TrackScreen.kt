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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.delay
import kotlin.math.atan2

@Composable
fun TrackScreen() {
    val context = LocalContext.current

    // Live Simulated GPS & ETA Countdown Telemetry
    var etaMinutes by remember { mutableIntStateOf(12) }
    var distanceKm by remember { mutableFloatStateOf(1.4f) }
    var agentSpeedKmh by remember { mutableIntStateOf(26) }
    var progressFraction by remember { mutableFloatStateOf(0.35f) }

    // Live continuous route progress animation
    LaunchedEffect(Unit) {
        while (true) {
            delay(2500)
            if (progressFraction < 0.90f) {
                progressFraction += 0.035f
                distanceKm = maxOf(0.15f, distanceKm - 0.08f)
                etaMinutes = maxOf(2, (distanceKm * 7.5f).toInt() + 1)
                agentSpeedKmh = (24..32).random()
            }
        }
    }

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

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
            .verticalScroll(rememberScrollState())
            .padding(bottom = 120.dp)
    ) {
        // =========================================================================
        // 1. LIVE INTERACTIVE VECTOR MAP CANVAS (High-End On-Demand Tracking Experience)
        // =========================================================================
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(340.dp)
                .background(Color(0xFFE8ECEF))
        ) {
            // Realistic Vector Map Simulation
            Canvas(modifier = Modifier.fillMaxSize()) {
                val canvasWidth = size.width
                val canvasHeight = size.height

                // A. Background Grid / City Blocks
                drawRect(color = Color(0xFFF1F5F9))

                // B. Parks / Green Zones
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

                // C. River / Water Feature
                val riverPath = Path().apply {
                    moveTo(0f, canvasHeight * 0.88f)
                    cubicTo(
                        canvasWidth * 0.3f, canvasHeight * 0.82f,
                        canvasWidth * 0.7f, canvasHeight * 0.95f,
                        canvasWidth, canvasHeight * 0.86f
                    )
                }
                drawPath(
                    path = riverPath,
                    color = Color(0xFFBAE6FD),
                    style = Stroke(width = 30f, cap = StrokeCap.Round)
                )

                // D. City Street Network (Secondary Roads)
                val roadColor = Color(0xFFFFFFFF)
                val roadBorderColor = Color(0xFFCBD5E1)

                // Horizontal streets
                listOf(0.24f, 0.46f, 0.72f).forEach { yFrac ->
                    val y = canvasHeight * yFrac
                    drawLine(color = roadBorderColor, start = Offset(0f, y), end = Offset(canvasWidth, y), strokeWidth = 26f)
                    drawLine(color = roadColor, start = Offset(0f, y), end = Offset(canvasWidth, y), strokeWidth = 22f)
                }

                // Vertical streets
                listOf(0.22f, 0.50f, 0.78f).forEach { xFrac ->
                    val x = canvasWidth * xFrac
                    drawLine(color = roadBorderColor, start = Offset(x, 0f), end = Offset(x, canvasHeight), strokeWidth = 24f)
                    drawLine(color = roadColor, start = Offset(x, 0f), end = Offset(x, canvasHeight), strokeWidth = 20f)
                }

                // Diagonal Arterial Highway (Air Bypass Road)
                val highwayBorder = Path().apply {
                    moveTo(canvasWidth * 0.05f, canvasHeight * 0.15f)
                    cubicTo(
                        canvasWidth * 0.35f, canvasHeight * 0.25f,
                        canvasWidth * 0.55f, canvasHeight * 0.65f,
                        canvasWidth * 0.92f, canvasHeight * 0.75f
                    )
                }
                drawPath(path = highwayBorder, color = Color(0xFFCBD5E1), style = Stroke(width = 36f, cap = StrokeCap.Round))
                drawPath(path = highwayBorder, color = Color(0xFFFFFFFF), style = Stroke(width = 30f, cap = StrokeCap.Round))
                drawPath(
                    path = highwayBorder,
                    color = Color(0xFFFDE68A),
                    style = Stroke(width = 3f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 8f)))
                )

                // E. Active Delivery Polyline Route (From Central Hub to User Home)
                // Waypoints: (10% W, 20% H) -> (32% W, 26% H) -> (50% W, 48% H) -> (68% W, 50% H) -> (84% W, 72% H)
                val fullRoutePath = Path().apply {
                    moveTo(canvasWidth * 0.12f, canvasHeight * 0.20f)
                    lineTo(canvasWidth * 0.35f, canvasHeight * 0.26f)
                    lineTo(canvasWidth * 0.50f, canvasHeight * 0.46f)
                    lineTo(canvasWidth * 0.68f, canvasHeight * 0.50f)
                    lineTo(canvasWidth * 0.84f, canvasHeight * 0.72f)
                }

                // Draw background route glow
                drawPath(
                    path = fullRoutePath,
                    color = MedTealPrimary.copy(alpha = 0.25f),
                    style = Stroke(width = 16f, cap = StrokeCap.Round)
                )
                // Draw active vibrant route line
                drawPath(
                    path = fullRoutePath,
                    color = MedTealPrimary,
                    style = Stroke(width = 8f, cap = StrokeCap.Round)
                )

                // F. Waypoint 1: MedMarg Central Diagnostic Hub (Origin)
                val hubX = canvasWidth * 0.12f
                val hubY = canvasHeight * 0.20f
                drawCircle(color = Slate900, radius = 10f, center = Offset(hubX, hubY))
                drawCircle(color = PureWhite, radius = 4f, center = Offset(hubX, hubY))

                // G. Waypoint 2: Patient Destination (Home Doorstep)
                val homeX = canvasWidth * 0.84f
                val homeY = canvasHeight * 0.72f

                // Pulsing target halo around home
                drawCircle(color = RoseError.copy(alpha = 0.2f), radius = 24f, center = Offset(homeX, homeY))
                drawCircle(color = RoseError, radius = 12f, center = Offset(homeX, homeY))
                drawCircle(color = PureWhite, radius = 5f, center = Offset(homeX, homeY))

                // H. Current Agent Live Moving Position on the polyline
                // Segment 1 (0 to 0.25): (0.12, 0.20) -> (0.35, 0.26)
                // Segment 2 (0.25 to 0.50): (0.35, 0.26) -> (0.50, 0.46)
                // Segment 3 (0.50 to 0.75): (0.50, 0.46) -> (0.68, 0.50)
                // Segment 4 (0.75 to 1.0): (0.68, 0.50) -> (0.84, 0.72)
                val agentX: Float
                val agentY: Float
                val p = progressFraction.coerceIn(0f, 1f)
                when {
                    p <= 0.25f -> {
                        val subP = p / 0.25f
                        agentX = canvasWidth * (0.12f + (0.35f - 0.12f) * subP)
                        agentY = canvasHeight * (0.20f + (0.26f - 0.20f) * subP)
                    }
                    p <= 0.50f -> {
                        val subP = (p - 0.25f) / 0.25f
                        agentX = canvasWidth * (0.35f + (0.50f - 0.35f) * subP)
                        agentY = canvasHeight * (0.26f + (0.46f - 0.26f) * subP)
                    }
                    p <= 0.75f -> {
                        val subP = (p - 0.50f) / 0.25f
                        agentX = canvasWidth * (0.50f + (0.68f - 0.50f) * subP)
                        agentY = canvasHeight * (0.46f + (0.50f - 0.46f) * subP)
                    }
                    else -> {
                        val subP = (p - 0.75f) / 0.25f
                        agentX = canvasWidth * (0.68f + (0.84f - 0.68f) * subP)
                        agentY = canvasHeight * (0.50f + (0.72f - 0.50f) * subP)
                    }
                }

                // Live Pulsing Accuracy Radar Circle
                drawCircle(
                    color = EmeraldAccent.copy(alpha = radarAlpha),
                    radius = radarRadius,
                    center = Offset(agentX, agentY),
                    style = Stroke(width = 3f)
                )

                // Agent Vehicle Marker (Outer Shadow + Emerald Glow)
                drawCircle(color = PureWhite, radius = 16f, center = Offset(agentX, agentY))
                drawCircle(color = EmeraldAccent, radius = 12f, center = Offset(agentX, agentY))
                drawCircle(color = PureWhite, radius = 4f, center = Offset(agentX, agentY))
            }

            // Top Floating Live Telemetry Badge
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = Slate900.copy(alpha = 0.90f),
                    shape = RoundedCornerShape(20.dp),
                    shadowElevation = 4.dp
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(EmeraldAccent)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "LIVE GPS • $agentSpeedKmh km/h",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            color = PureWhite
                        )
                    }
                }

                Surface(
                    color = PureWhite,
                    shape = RoundedCornerShape(20.dp),
                    shadowElevation = 4.dp
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.MyLocation, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Air Bypass Road",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                    }
                }
            }

            // Destination Pill (Doorstep Callout)
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(end = 20.dp, bottom = 24.dp)
            ) {
                Surface(
                    color = Slate900,
                    shape = RoundedCornerShape(10.dp),
                    shadowElevation = 4.dp
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Home, contentDescription = null, tint = RoseError, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Your Doorstep",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = PureWhite
                        )
                    }
                }
            }
        }

        // =========================================================================
        // 2. LIVE ON-DEMAND DELIVERY HUD & ETA CARD
        // =========================================================================
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .offset(y = (-16).dp),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                // ETA Headline & Distance Remaining
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Arriving in $etaMinutes Mins",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Black,
                                color = Slate900
                            )
                        }
                        Text(
                            text = "${String.format("%.1f", distanceKm)} km away • Fasting Slot (07:30 AM)",
                            fontSize = 12.sp,
                            color = Slate500,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }

                    // Handover Security OTP Box
                    Surface(
                        color = AmberWarningLight,
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, AmberWarning.copy(alpha = 0.5f))
                    ) {
                        Column(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "HANDOVER OTP",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                color = AmberWarning,
                                letterSpacing = 0.5.sp
                            )
                            Text(
                                text = "4 8 9 2",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Black,
                                color = Slate900
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Animated Linear Progress Track
                LinearProgressIndicator(
                    progress = { progressFraction.coerceIn(0f, 1f) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = MedTealPrimary,
                    trackColor = Slate200,
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Phlebotomist Profile Card (Photo, Name, Hero Electric, 1-Tap Dial & WhatsApp)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(Slate50)
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(CircleShape)
                                .background(Brush.linearGradient(listOf(MedTealPrimary, EmeraldAccent))),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Person, contentDescription = null, tint = PureWhite, modifier = Modifier.size(24.dp))
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "Ramesh Kumar",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    color = EmeraldLight,
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = "★ 4.9",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = EmeraldAccent,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                    )
                                }
                            }
                            Text(
                                text = "Senior Phlebotomist (AG-01)",
                                fontSize = 11.sp,
                                color = Slate500
                            )
                            Text(
                                text = "Hero Electric AP 03 BF 4210",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Medium,
                                color = MedTealPrimary
                            )
                        }
                    }

                    // Call & WhatsApp Direct Action Buttons
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(EmeraldAccent)
                                .clickable {
                                    val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:9876511223"))
                                    context.startActivity(intent)
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Phone, contentDescription = "Call", tint = PureWhite, modifier = Modifier.size(18.dp))
                        }

                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF25D366))
                                .clickable {
                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/919876511223?text=Hello%20Ramesh,%20checking%20on%20my%20sample%20collection"))
                                    context.startActivity(intent)
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Chat, contentDescription = "WhatsApp", tint = PureWhite, modifier = Modifier.size(18.dp))
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Cold-Chain IoT Box & Lab Safety Badges
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Card(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = EmeraldLight)
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(EmeraldAccent))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("COLD-CHAIN IOT", fontSize = 9.sp, fontWeight = FontWeight.Black, color = EmeraldAccent)
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text("4.2°C Active", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            Text("Optimal (2°C - 8°C)", fontSize = 10.sp, color = Slate600)
                        }
                    }

                    Card(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = MedTealLight)
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Verified, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(12.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("SAFETY STANDARD", fontSize = 9.sp, fontWeight = FontWeight.Black, color = MedTealPrimary)
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text("100% Sterile Kit", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            Text("Barcoded Vacutainers", fontSize = 10.sp, color = Slate600)
                        }
                    }
                }
            }
        }

        // =========================================================================
        // 3. BARCODED STERILE COLLECTION TUBE KIT CHECKLIST
        // =========================================================================
        Column(modifier = Modifier.padding(horizontal = 16.dp)) {
            Text(
                text = "Sterile Collection Kit Prepared",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
            Text(
                text = "Pre-labeled barcoded vacutainers allocated for your scheduled test panel",
                fontSize = 11.sp,
                color = Slate500
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TubeCard(
                    color = Color(0xFFF59E0B),
                    capName = "Gold SST",
                    testName = "Lipid & Thyroid",
                    modifier = Modifier.weight(1f)
                )
                TubeCard(
                    color = Color(0xFF8B5CF6),
                    capName = "Purple EDTA",
                    testName = "CBC & HbA1c",
                    modifier = Modifier.weight(1f)
                )
                TubeCard(
                    color = Color(0xFF64748B),
                    capName = "Grey Fluoride",
                    testName = "Fasting Glucose",
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // =========================================================================
            // 4. STEP-BY-STEP SAMPLE JOURNEY TIMELINE
            // =========================================================================
            Text(
                text = "Sample Journey & Digital Handover",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )

            Spacer(modifier = Modifier.height(12.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    listOf(
                        Triple("1. Order Placed & Fasting Slot Confirmed", "Tomorrow, 07:30 AM Slot Verified", true),
                        Triple("2. Senior Phlebotomist Assigned", "Ramesh Kumar (AG-01) Dispatched", true),
                        Triple("3. En Route to Doorstep (Live GPS)", "ETA $etaMinutes mins • 4.2°C Cold-Chain Active", true),
                        Triple("4. Doorstep OTP Verification & Sample Draw", "Share OTP 4892 upon arrival", false),
                        Triple("5. Cold-Chain Handover to NABL Hub", "Processing at MedMarg Central Lab", false),
                        Triple("6. Digital Report Synced to Google Drive", "PDF & biomarkers saved to Google Drive", false)
                    ).forEachIndexed { index, (title, subtitle, isDone) ->
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
                                    .background(if (isDone) EmeraldAccent else Slate200),
                                contentAlignment = Alignment.Center
                            ) {
                                if (isDone) {
                                    Icon(Icons.Default.Check, contentDescription = null, tint = PureWhite, modifier = Modifier.size(14.dp))
                                } else {
                                    Text("${index + 1}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate500)
                                }
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column {
                                Text(
                                    text = title,
                                    fontSize = 13.sp,
                                    fontWeight = if (isDone) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isDone) Slate900 else Slate500
                                )
                                Text(
                                    text = subtitle,
                                    fontSize = 11.sp,
                                    color = Slate400
                                )
                            }
                        }

                        if (index < 5) {
                            Box(
                                modifier = Modifier
                                    .padding(start = 11.dp)
                                    .width(2.dp)
                                    .height(14.dp)
                                    .background(if (isDone) EmeraldAccent.copy(alpha = 0.5f) else Slate200)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TubeCard(
    color: Color,
    capName: String,
    testName: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(24.dp, 10.dp)
                    .clip(RoundedCornerShape(3.dp))
                    .background(color)
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = capName,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
            Text(
                text = testName,
                fontSize = 10.sp,
                color = Slate500,
                maxLines = 1
            )
        }
    }
}
