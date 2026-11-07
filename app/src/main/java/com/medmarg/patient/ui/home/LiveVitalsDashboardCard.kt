package com.medmarg.patient.ui.home

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.LiveVitalsSnapshot
import com.medmarg.patient.data.PatientSessionStore
import com.medmarg.patient.ui.theme.*

/**
 * Modular 2x2 Smart Device & Health Connect Vitals Card for HomeScreen.
 * Matches iOS CareSeekerHomeView Smart Device & Health Vitals card 1-on-1.
 */
@Composable
fun LiveVitalsDashboardCard(
    vitals: LiveVitalsSnapshot = PatientSessionStore.vitals,
    onOpenVitalsScreen: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clickable { onOpenVitalsScreen() },
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color(0xFFFEF2F2)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Favorite,
                            contentDescription = null,
                            tint = Color(0xFFEF4444),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Smart Device & Health Vitals",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Slate900
                        )
                        Text(
                            text = if (vitals.isConnected) vitals.deviceSource else "No wearable or health device paired",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate500
                        )
                    }
                }

                Surface(
                    color = if (vitals.isConnected) EmeraldLight else Color(0xFFEFF6FF),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.clickable { onOpenVitalsScreen() }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(if (vitals.isConnected) EmeraldAccent else Color(0xFF2563EB))
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (vitals.isConnected) "Live Hub" else "Connect",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (vitals.isConnected) EmeraldAccent else Color(0xFF2563EB)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            if (!vitals.isConnected) {
                // Blank / Connect Device State
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    color = Slate50,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200.copy(alpha = 0.7f))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFE0E7FF)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Watch,
                                    contentDescription = null,
                                    tint = Color(0xFF4F46E5),
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "Connect Health Connect / Wearable",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )
                                Text(
                                    text = "Sync real-time heart rate, SpO2 & BP with your lab tests",
                                    fontSize = 10.sp,
                                    color = Slate500
                                )
                            }
                        }

                        Button(
                            onClick = onOpenVitalsScreen,
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = "Pair Device",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = PureWhite
                            )
                        }
                    }
                }
            } else {
                // 2x2 Vitals Grid (Live readings only)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    VitalTile(
                        modifier = Modifier.weight(1f),
                        icon = Icons.Default.Favorite,
                        iconTint = Color(0xFFEF4444),
                        label = "Heart Rate",
                        value = vitals.heartRateBpm?.toString() ?: "--",
                        unit = "BPM",
                        badgeText = if (vitals.heartRateBpm != null) "Normal" else "Waiting"
                    )
                    VitalTile(
                        modifier = Modifier.weight(1f),
                        icon = Icons.Default.WaterDrop,
                        iconTint = Color(0xFF0284C7),
                        label = "Blood Oxygen",
                        value = vitals.spo2Percent?.let { "$it%" } ?: "--",
                        unit = "SpO2",
                        badgeText = if (vitals.spo2Percent != null) "Optimal" else "Waiting"
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    val bpText = if (vitals.bpSystolic != null && vitals.bpDiastolic != null) {
                        "${vitals.bpSystolic}/${vitals.bpDiastolic}"
                    } else "--/--"
                    VitalTile(
                        modifier = Modifier.weight(1f),
                        icon = Icons.Default.MonitorHeart,
                        iconTint = Color(0xFF8B5CF6),
                        label = "Blood Pressure",
                        value = bpText,
                        unit = "mmHg",
                        badgeText = if (vitals.bpSystolic != null) "Normal" else "Waiting"
                    )
                    VitalTile(
                        modifier = Modifier.weight(1f),
                        icon = Icons.Default.Bloodtype,
                        iconTint = Color(0xFFF59E0B),
                        label = "Fasting Glucose",
                        value = vitals.fastingGlucoseMgDl?.toString() ?: "--",
                        unit = "mg/dL",
                        badgeText = if (vitals.fastingGlucoseMgDl != null) "Active" else "Waiting"
                    )
                }
            }
        }
    }
}

@Composable
private fun VitalTile(
    modifier: Modifier = Modifier,
    icon: ImageVector,
    iconTint: Color,
    label: String,
    value: String,
    unit: String,
    badgeText: String
) {
    Surface(
        modifier = modifier,
        color = Slate50,
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200.copy(alpha = 0.7f))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = badgeText,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = EmeraldAccent
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = value,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = unit,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate500,
                    modifier = Modifier.padding(bottom = 2.dp)
                )
            }
            Text(
                text = label,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Slate500
            )
        }
    }
}

