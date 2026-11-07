package com.medmarg.patient.ui.freelance.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.model.FreelanceBroadcastJobItem
import com.medmarg.patient.ui.theme.*

/**
 * ⚡ FREELANCE BROADCAST CARD (Replicated 1-on-1 with iOS FreelanceBroadcastCard.swift)
 * Standalone card displaying an unassigned overflow gig from central dispatch.
 * "First to claim gets assigned".
 */
@Composable
fun FreelanceBroadcastCard(
    job: FreelanceBroadcastJobItem,
    isClaiming: Boolean,
    onClaim: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isHighPriority = job.urgency?.uppercase()?.contains("HIGH") == true

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = BorderStroke(
            1.dp,
            if (isHighPriority) RoseError.copy(alpha = 0.35f) else Slate200.copy(alpha = 0.7f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Top Row: Urgency, Fasting Tag, Distance
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    if (isHighPriority) {
                        Surface(
                            color = RoseError.copy(alpha = 0.12f),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(3.dp)
                            ) {
                                Icon(Icons.Default.Whatshot, contentDescription = null, tint = RoseError, modifier = Modifier.size(11.dp))
                                Text("HIGH PRIORITY", fontSize = 9.sp, fontWeight = FontWeight.Black, color = RoseError)
                            }
                        }
                    }

                    if (job.fastingRequired == true) {
                        Surface(
                            color = AmberGold.copy(alpha = 0.12f),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(3.dp)
                            ) {
                                Icon(Icons.Default.WaterDrop, contentDescription = null, tint = AmberGold, modifier = Modifier.size(11.dp))
                                Text("FASTING (10-12 HRS)", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = AmberGold)
                            }
                        }
                    }
                }

                // Distance Badge
                Surface(
                    color = MedTealLight,
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                    ) {
                        Icon(Icons.Default.LocationOn, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(10.dp))
                        Text(job.distance ?: "2.5 km", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                    }
                }
            }

            // Patient Name, Age & Area
            Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = job.patientName ?: "Patient",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            color = Slate900
                        )
                        job.age?.let {
                            Text(it, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate500)
                        }
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                    ) {
                        Icon(Icons.Default.Schedule, contentDescription = null, tint = Slate600, modifier = Modifier.size(11.dp))
                        Text(job.timeSlot ?: "Today", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Slate600)
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(Icons.Default.Place, contentDescription = null, tint = Slate400, modifier = Modifier.size(12.dp))
                    Text(
                        text = job.address ?: "Tirupati Doorstep",
                        fontSize = 12.sp,
                        color = Slate600,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            // Diagnostic Tests & Tube Pills
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(Icons.Default.MedicalServices, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(12.dp))
                    Text(
                        text = job.tests ?: "Diagnostic Collection",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate800,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                job.tubes?.let { tubes ->
                    if (tubes.isNotEmpty()) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            tubes.forEach { tube ->
                                Surface(
                                    color = Slate100,
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(7.dp)
                                                .clip(CircleShape)
                                                .background(tubeColor(tube))
                                        )
                                        Text(tube, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate700)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            HorizontalDivider(color = Slate100)

            // Footer: Payout & Claim Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Guaranteed Payout", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = Slate500)
                    Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                        Text("₹${job.payout ?: 350}", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Color(0xFF00B86B))
                        Text("+ Tips & Bonus", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate400, modifier = Modifier.padding(bottom = 2.dp))
                    }
                }

                Button(
                    onClick = onClaim,
                    enabled = !isClaiming,
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00B86B)),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp)
                ) {
                    if (isClaiming) {
                        CircularProgressIndicator(modifier = Modifier.size(16.dp), color = PureWhite, strokeWidth = 2.dp)
                    } else {
                        Icon(Icons.Default.Bolt, contentDescription = null, tint = PureWhite, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("⚡ Claim Job", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }
            }
        }
    }
}

private fun tubeColor(name: String): Color {
    val n = name.lowercase()
    return when {
        n.contains("yellow") || n.contains("sst") || n.contains("gold") -> AmberGold
        n.contains("lavender") || n.contains("purple") || n.contains("edta") -> Color(0xFF9333EA)
        n.contains("grey") || n.contains("gray") || n.contains("sugar") || n.contains("fluoride") -> Slate500
        n.contains("green") || n.contains("heparin") -> Color(0xFF10B981)
        n.contains("blue") || n.contains("citrate") -> Color(0xFF2563EB)
        else -> MedTealPrimary
    }
}
