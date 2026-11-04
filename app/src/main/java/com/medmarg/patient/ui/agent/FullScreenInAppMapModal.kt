package com.medmarg.patient.ui.agent

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.ui.theme.*

// =========================================================================
// 🗺 FULL-SCREEN IN-APP NAVIGATION & ROUTE MAP TO CUSTOMER LOCATION
// 1-on-1 replication of ios/Agent/Views/FullScreenInAppMapView.swift
// =========================================================================

@Composable
fun FullScreenInAppMapModal(
    order: AgentPickupOrder,
    onDismiss: () -> Unit,
    onMarkArrived: () -> Unit
) {
    val context = LocalContext.current
    var recenterCount by remember { mutableIntStateOf(0) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFEAF2F8))
        ) {
            // Interactive Vector Route Canvas (matching Tirupati Air Bypass Road route)
            Canvas(modifier = Modifier.fillMaxSize()) {
                val w = size.width
                val h = size.height

                // Grid roads
                val gridPaint = Color(0xFFD6E4F0)
                for (i in 1..8) {
                    drawLine(
                        color = gridPaint,
                        start = Offset(0f, h * i / 9f),
                        end = Offset(w, h * i / 9f),
                        strokeWidth = 4f
                    )
                    drawLine(
                        color = gridPaint,
                        start = Offset(w * i / 9f, 0f),
                        end = Offset(w * i / 9f, h),
                        strokeWidth = 4f
                    )
                }

                // Highway corridor
                val roadPath = Path().apply {
                    moveTo(w * 0.22f, h * 0.68f)
                    cubicTo(
                        w * 0.35f, h * 0.52f,
                        w * 0.58f, h * 0.45f,
                        w * 0.76f, h * 0.30f
                    )
                }
                drawPath(
                    path = roadPath,
                    color = Color.White,
                    style = Stroke(width = 28f, cap = StrokeCap.Round)
                )
                drawPath(
                    path = roadPath,
                    color = Color(0xFF2563EB),
                    style = Stroke(
                        width = 12f,
                        cap = StrokeCap.Round,
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(24f, 14f), 0f)
                    )
                )

                // Agent Pulse Halo
                val agentPos = Offset(w * 0.22f, h * 0.68f)
                drawCircle(
                    color = MedTealPrimary.copy(alpha = 0.22f),
                    radius = 48f,
                    center = agentPos
                )
                drawCircle(
                    color = MedTealPrimary,
                    radius = 18f,
                    center = agentPos
                )

                // Customer Pin Halo
                val custPos = Offset(w * 0.76f, h * 0.30f)
                drawCircle(
                    color = RoseError.copy(alpha = 0.22f),
                    radius = 44f,
                    center = custPos
                )
                drawCircle(
                    color = RoseError,
                    radius = 18f,
                    center = custPos
                )
            }

            // Pin Labels Overlay
            Box(
                modifier = Modifier
                    .align(Alignment.Center)
                    .offset(x = (-85).dp, y = 110.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Slate900)
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text("🛵 You (Phlebotomist)", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = PureWhite)
            }

            Box(
                modifier = Modifier
                    .align(Alignment.Center)
                    .offset(x = 75.dp, y = (-135).dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(RoseError)
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text("📍 ${order.effectivePatientName}", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = PureWhite)
            }

            // Top Floating Navigation Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Close Button
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .shadow(6.dp, CircleShape)
                        .clip(CircleShape)
                        .background(PureWhite)
                        .clickable { onDismiss() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate900, modifier = Modifier.size(18.dp))
                }

                // Turn-by-Turn Instruction Pill
                Row(
                    modifier = Modifier
                        .weight(1f)
                        .shadow(6.dp, RoundedCornerShape(16.dp))
                        .clip(RoundedCornerShape(16.dp))
                        .background(PureWhite)
                        .padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Default.TurnRight, contentDescription = null, tint = Color(0xFF2563EB), modifier = Modifier.size(20.dp))
                    Column {
                        Text(
                            text = "Head to ${order.effectivePatientName}",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = order.address ?: "Air Bypass Road, Tirupati",
                            fontSize = 11.sp,
                            color = Slate500,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                // Re-center on GPS
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .shadow(6.dp, CircleShape)
                        .clip(CircleShape)
                        .background(PureWhite)
                        .clickable { recenterCount++ },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.MyLocation, contentDescription = "Recenter", tint = MedTealPrimary, modifier = Modifier.size(18.dp))
                }
            }

            // Bottom Floating Control Panel
            Card(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 20.dp),
                shape = RoundedCornerShape(22.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                elevation = CardDefaults.cardElevation(10.dp)
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(EmeraldAccent))
                                Text("GPS NAVIGATION LIVE", fontSize = 10.sp, fontWeight = FontWeight.Black, color = EmeraldAccent)
                            }
                            Text("2.4 km • ETA ${order.eta ?: "8 mins"}", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Slate900)
                            Text("Fastest route via Air Bypass Road", fontSize = 11.sp, color = Slate500)
                        }

                        // External Google Maps Button
                        Column(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color(0xFF2563EB).copy(alpha = 0.1f))
                                .clickable {
                                    val query = Uri.encode(order.address ?: "Tirupati")
                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=$query"))
                                    context.startActivity(intent)
                                }
                                .padding(horizontal = 12.dp, vertical = 8.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(Icons.Default.OpenInNew, contentDescription = null, tint = Color(0xFF2563EB), modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.height(2.dp))
                            Text("Google Maps", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF2563EB))
                        }
                    }

                    // Action: I Have Arrived at Doorstep
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(
                                Brush.horizontalGradient(
                                    listOf(Color(0xFF0CB873), Color(0xFF009959))
                                )
                            )
                            .clickable {
                                onMarkArrived()
                                onDismiss()
                            }
                            .padding(vertical = 14.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(Icons.Default.LocationOn, contentDescription = null, tint = PureWhite, modifier = Modifier.size(18.dp))
                            Text("I Have Arrived at Doorstep", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                        }
                    }
                }
            }
        }
    }
}

