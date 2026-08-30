package com.medmarg.patient.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.medmarg.patient.ui.theme.*

data class TimelineStep(
    val title: String,
    val description: String,
    val timeLabel: String,
    val isCompleted: Boolean,
    val isCurrent: Boolean,
    val icon: ImageVector
)

@Composable
fun PhlebotomistLiveTrackingView(
    phlebotomistName: String = "Suresh Kumar",
    phlebotomistPhone: String = "+91 98765 43210",
    vaccinationStatus: String = "Fully Vaccinated • NABL Certified Collector",
    steps: List<TimelineStep>,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = BorderStroke(1.dp, CardBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header with collector info
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(MedTealLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.DirectionsBike,
                            contentDescription = "Phlebotomist",
                            tint = MedTealPrimary,
                            modifier = Modifier.size(26.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = phlebotomistName,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Text(
                            text = vaccinationStatus,
                            style = MaterialTheme.typography.labelSmall,
                            color = EmeraldAccent,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                IconButton(
                    onClick = {},
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(EmeraldLight)
                ) {
                    Icon(
                        imageVector = Icons.Default.Call,
                        contentDescription = "Call Collector",
                        tint = EmeraldAccent,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = Slate200)

            // Timeline Steps
            steps.forEachIndexed { index, step ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.Top
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.width(28.dp)
                    ) {
                        val dotColor = when {
                            step.isCompleted -> EmeraldAccent
                            step.isCurrent -> MedTealPrimary
                            else -> Slate200
                        }
                        Box(
                            modifier = Modifier
                                .size(22.dp)
                                .clip(CircleShape)
                                .background(dotColor),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (step.isCompleted) Icons.Default.Check else step.icon,
                                contentDescription = null,
                                tint = if (step.isCompleted || step.isCurrent) PureWhite else Slate400,
                                modifier = Modifier.size(12.dp)
                            )
                        }

                        if (index < steps.size - 1) {
                            Box(
                                modifier = Modifier
                                    .width(2.dp)
                                    .height(36.dp)
                                    .background(if (step.isCompleted) EmeraldAccent else Slate200)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = step.title,
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = if (step.isCurrent) FontWeight.Bold else FontWeight.SemiBold,
                                color = if (step.isCurrent) MedTealPrimary else if (step.isCompleted) Slate900 else Slate400
                            )
                            Text(
                                text = step.timeLabel,
                                style = MaterialTheme.typography.labelSmall,
                                color = if (step.isCurrent) MedTealPrimary else Slate400
                            )
                        }
                        Text(
                            text = step.description,
                            style = MaterialTheme.typography.labelSmall,
                            color = if (step.isCurrent) Slate700 else Slate400
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                    }
                }
            }
        }
    }
}
