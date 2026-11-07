package com.medmarg.patient.ui.freelance.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.ui.theme.*

/**
 * ⚡ FREELANCE AGENT SHORTCUTS GRID (Replicated 1-on-1 with iOS FreelanceShortcutsGrid.swift)
 * Quick action cards tailored for freelance gig phlebotomists.
 * Includes Claim Gigs, Kit & Credits, Scan Barcode, Lab Handover, plus IoT Cold-Chain status card.
 */
@Composable
fun FreelanceShortcutsGrid(
    creditsSubtitle: String = "Redeem Kit",
    onClaimGigsTap: () -> Unit,
    onInventoryTap: () -> Unit,
    onBarcodeScanTap: () -> Unit,
    onLabHandoverTap: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // 2x2 Grid
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            ShortcutCard(
                modifier = Modifier.weight(1f),
                title = "Claim Gigs",
                subtitle = "Open Broadcasts",
                icon = Icons.Default.Bolt,
                iconTint = Color(0xFF00B86B),
                onClick = onClaimGigsTap
            )
            ShortcutCard(
                modifier = Modifier.weight(1f),
                title = "Kit & Credits",
                subtitle = creditsSubtitle,
                icon = Icons.Default.Inventory2,
                iconTint = MedTealPrimary,
                onClick = onInventoryTap
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            ShortcutCard(
                modifier = Modifier.weight(1f),
                title = "Scan Barcode",
                subtitle = "Google Vision",
                icon = Icons.Default.QrCodeScanner,
                iconTint = Color(0xFF2563EB),
                onClick = onBarcodeScanTap
            )
            ShortcutCard(
                modifier = Modifier.weight(1f),
                title = "Lab Handover",
                subtitle = "Deliver Samples",
                icon = Icons.Default.LocalShipping,
                iconTint = AmberGold,
                onClick = onLabHandoverTap
            )
        }

        // Full-width IoT Cold-Chain Banner
        Surface(
            shape = RoundedCornerShape(14.dp),
            color = PureWhite,
            shadowElevation = 2.dp,
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200.copy(alpha = 0.7f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFFE0F2FE)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.AcUnit,
                        contentDescription = null,
                        tint = Color(0xFF0284C7),
                        modifier = Modifier.size(18.dp)
                    )
                }

                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text("IoT Cold-Chain Monitoring", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                        Surface(
                            color = Color(0xFFDBEAFE),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                "Active",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF2563EB),
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Text(
                        "Bluetooth Smart Sensor Pairing for sample safety (2°C - 8°C)",
                        fontSize = 11.sp,
                        color = Slate500
                    )
                }

                Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate400, modifier = Modifier.size(16.dp))
            }
        }
    }
}

@Composable
private fun ShortcutCard(
    modifier: Modifier = Modifier,
    title: String,
    subtitle: String,
    icon: ImageVector,
    iconTint: Color,
    onClick: () -> Unit
) {
    Surface(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        color = PureWhite,
        shadowElevation = 2.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200.copy(alpha = 0.7f))
    ) {
        Row(
            modifier = Modifier.padding(10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(iconTint.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(18.dp))
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                Text(subtitle, fontSize = 10.sp, color = Slate500)
            }

            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate400, modifier = Modifier.size(14.dp))
        }
    }
}
