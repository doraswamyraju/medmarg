package com.medmarg.patient.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
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

data class MedMargNotification(
    val id: String,
    val title: String,
    val message: String,
    val timestamp: String,
    val icon: ImageVector,
    val iconColor: Color,
    val bgColor: Color,
    val isUnread: Boolean = false
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationCenterSheet(
    onDismissRequest: () -> Unit
) {
    val sampleNotifications = listOf(
        MedMargNotification(
            id = "n1",
            title = "Phlebotomist Assigned to Your Booking",
            message = "Ramesh Kumar (Phlebo AG-01) is assigned for your Aarogyam 1.3 collection at 07:30 AM tomorrow.",
            timestamp = "10 mins ago",
            icon = Icons.Default.DirectionsBike,
            iconColor = EmeraldAccent,
            bgColor = EmeraldLight,
            isUnread = true
        ),
        MedMargNotification(
            id = "n2",
            title = "Google Drive Health Report Synced",
            message = "Your Complete Lipid Profile report has been automatically encrypted and synced to MedMarg/Laboratory Reports/2026/.",
            timestamp = "2 hours ago",
            icon = Icons.Default.CloudDone,
            iconColor = MedTealPrimary,
            bgColor = MedTealLight,
            isUnread = true
        ),
        MedMargNotification(
            id = "n3",
            title = "Fasting Reminder for Tomorrow",
            message = "Please observe 8-10 hours overnight fasting prior to your 07:30 AM sample pickup. Water is permitted.",
            timestamp = "Yesterday",
            icon = Icons.Default.Timer,
            iconColor = AmberWarning,
            bgColor = AmberWarningLight,
            isUnread = false
        )
    )

    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        containerColor = PureWhite,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(vertical = 10.dp)
                    .width(40.dp)
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(Slate400.copy(alpha = 0.5f))
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .verticalScroll(rememberScrollState())
                .padding(bottom = 32.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Notification Center",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Text(
                    text = "Mark all as read",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MedTealPrimary
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            sampleNotifications.forEach { item ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = if (item.isUnread) Slate50 else PureWhite),
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (item.isUnread) MedTealPrimary.copy(alpha = 0.3f) else Slate200)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(item.bgColor),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = null,
                                tint = item.iconColor,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = item.title,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )
                                if (item.isUnread) {
                                    Box(
                                        modifier = Modifier
                                            .size(6.dp)
                                            .clip(CircleShape)
                                            .background(RoseError)
                                    )
                                }
                            }
                            Text(
                                text = item.message,
                                fontSize = 11.sp,
                                color = Slate600,
                                modifier = Modifier.padding(top = 2.dp),
                                lineHeight = 16.sp
                            )
                            Text(
                                text = item.timestamp,
                                fontSize = 10.sp,
                                color = Slate400,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
