package com.medmarg.patient.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.NotificationStore
import com.medmarg.patient.data.PatientNotificationItem
import com.medmarg.patient.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationCenterSheet(
    onDismissRequest: () -> Unit
) {
    val context = LocalContext.current
    val notifications by NotificationStore.notifications.collectAsState()
    val unreadCount by NotificationStore.unreadCount.collectAsState()

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
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Notification Center",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    if (unreadCount > 0) {
                        Surface(
                            color = RoseError.copy(alpha = 0.12f),
                            shape = RoundedCornerShape(50)
                        ) {
                            Text(
                                text = "$unreadCount new",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = RoseError,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }
                    }
                }

                if (unreadCount > 0) {
                    Surface(
                        onClick = { NotificationStore.markAllAsRead(context) },
                        shape = RoundedCornerShape(8.dp),
                        color = MedTealLight
                    ) {
                        Text(
                            text = "Mark all as read",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = MedTealPrimary,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (notifications.isEmpty()) {
                // Clean Empty State for Fresh Signups / Logins
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 36.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .clip(CircleShape)
                            .background(MedTealLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.NotificationsNone,
                            contentDescription = null,
                            tint = MedTealPrimary,
                            modifier = Modifier.size(32.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "All Caught Up!",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "No new notifications right now. Order updates, phlebotomist tracking, and lab reports will appear here.",
                        fontSize = 12.sp,
                        color = Slate500,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 24.dp),
                        lineHeight = 18.sp
                    )
                }
            } else {
                notifications.forEach { item ->
                    NotificationCard(
                        item = item,
                        onClick = {
                            NotificationStore.markAsRead(context, item.id)
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun NotificationCard(
    item: PatientNotificationItem,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 5.dp),
        shape = RoundedCornerShape(14.dp),
        color = if (item.isUnread) Slate50 else PureWhite,
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            if (item.isUnread) MedTealPrimary.copy(alpha = 0.35f) else Slate200
        ),
        shadowElevation = 1.dp
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(item.bgColor),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = item.icon,
                    contentDescription = null,
                    tint = item.iconColor,
                    modifier = Modifier.size(19.dp)
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
                                .size(7.dp)
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
