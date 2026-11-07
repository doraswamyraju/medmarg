package com.medmarg.patient.ui.freelance.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.ui.theme.*

/**
 * ⚡ FREELANCE AGENT METRIC COUNTERS ROW (Replicated 1-on-1 with iOS FreelanceMetricCountersRow.swift)
 * Replaces salaried quota counters with live gig earnings & active overflow stats.
 * Taps navigate to: Tab 3 (Wallet), Tab 7 (Orders), Tab 4 (Profile).
 */
@Composable
fun FreelanceMetricCountersRow(
    todayEarnings: Int,
    activeGigsCount: Int,
    completedCount: Int,
    ratingScore: String,
    onSelectMetric: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Card 1: Today's Gig Earnings (Green accent, taps to Wallet)
        MetricItem(
            modifier = Modifier.weight(1f),
            icon = Icons.Default.CurrencyRupee,
            iconTint = Color(0xFF00B86B),
            label = "Today's Gig",
            value = "₹$todayEarnings",
            subtext = "Live Wallet",
            subtextColor = Color(0xFF00B86B),
            hasIndicator = true,
            onClick = { onSelectMetric(3) }
        )

        // Card 2: Active Gigs (Blue accent, taps to Orders)
        MetricItem(
            modifier = Modifier.weight(1f),
            icon = Icons.Default.DirectionsBike,
            iconTint = Color(0xFF2563EB),
            label = "Active Gigs",
            value = "$activeGigsCount",
            subtext = if (activeGigsCount == 0) "Open for Gigs" else "In Progress",
            subtextColor = if (activeGigsCount > 0) Color(0xFF2563EB) else Slate500,
            hasIndicator = false,
            onClick = { onSelectMetric(7) }
        )

        // Card 3: Completed Gigs (Teal accent, taps to Orders)
        MetricItem(
            modifier = Modifier.weight(1f),
            icon = Icons.Default.Verified,
            iconTint = MedTealPrimary,
            label = "Completed",
            value = "$completedCount",
            subtext = "Samples Done",
            subtextColor = MedTealPrimary,
            hasIndicator = false,
            onClick = { onSelectMetric(7) }
        )

        // Card 4: Partner Rating (Orange accent, taps to Profile)
        MetricItem(
            modifier = Modifier.weight(1f),
            icon = Icons.Default.Star,
            iconTint = AmberGold,
            label = "Rating",
            value = ratingScore.ifEmpty { "5.0 ★" },
            subtext = "Verified MLT",
            subtextColor = AmberGold,
            hasIndicator = false,
            onClick = { onSelectMetric(4) }
        )
    }
}

@Composable
private fun MetricItem(
    modifier: Modifier = Modifier,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconTint: Color,
    label: String,
    value: String,
    subtext: String,
    subtextColor: Color,
    hasIndicator: Boolean,
    onClick: () -> Unit
) {
    Surface(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        color = PureWhite,
        shadowElevation = 2.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200.copy(alpha = 0.7f))
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(3.dp)
                ) {
                    Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(11.dp))
                    Text(label, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate500)
                }
                if (hasIndicator) {
                    Box(
                        modifier = Modifier
                            .size(5.dp)
                            .clip(CircleShape)
                            .background(iconTint)
                    )
                }
            }

            Text(
                text = value,
                fontSize = 15.sp,
                fontWeight = FontWeight.Black,
                color = Slate900,
                maxLines = 1
            )

            Text(
                text = subtext,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                color = subtextColor,
                maxLines = 1
            )
        }
    }
}
