package com.medmarg.patient.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.LivePatientOrder
import com.medmarg.patient.ui.theme.*

/**
 * Modular Active Order Banner for HomeScreen.
 * Only renders when the logged-in patient has a real active order from the live backend.
 */
@Composable
fun ActiveOrderBanner(
    activeOrder: LivePatientOrder?,
    onTrackClick: () -> Unit
) {
    if (activeOrder == null || !activeOrder.isActive) return

    val statusLabel = when (activeOrder.status.uppercase()) {
        "PENDING_DISPATCH" -> "DISPATCHING PHLEBOTOMIST"
        "ASSIGNED" -> "AGENT ASSIGNED"
        "ENROUTE" -> "PHLEBOTOMIST EN ROUTE"
        "SAMPLE_COLLECTED" -> "SAMPLE COLLECTED • IN TRANSIT"
        "IN_LAB" -> "SAMPLE IN NABL LAB ANALYZER"
        else -> activeOrder.status
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clickable { onTrackClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = androidx.compose.foundation.BorderStroke(1.5.dp, MedTealPrimary.copy(alpha = 0.25f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
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
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(MedTealLight),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.LocalShipping,
                        contentDescription = null,
                        tint = MedTealPrimary,
                        modifier = Modifier.size(22.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(7.dp)
                                .clip(CircleShape)
                                .background(EmeraldAccent)
                        )
                        Text(
                            text = "$statusLabel • #${activeOrder.id}",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            color = EmeraldAccent
                        )
                    }

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = activeOrder.tests.firstOrNull()?.name ?: "Doorstep Sample Collection",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900,
                        maxLines = 1
                    )

                    Text(
                        text = "${activeOrder.slot} • Handover OTP: ${activeOrder.otp}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Slate500
                    )
                }
            }

            Surface(
                color = MedTealPrimary,
                shape = RoundedCornerShape(10.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 7.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Track",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = null,
                        tint = PureWhite,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }
        }
    }
}

