package com.medmarg.patient.ui.customer.topbar

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.medmarg.patient.data.NotificationStore
import com.medmarg.patient.ui.theme.RoseError
import com.medmarg.patient.ui.theme.Slate50
import com.medmarg.patient.ui.theme.Slate700

/**
 * 4. Notification Bell Action Button.
 * - Displays reactive unread red badge only when unreadCount > 0.
 * - Clicking opens the Notification Center bottom sheet.
 */
@Composable
fun CustomerTopbarNotificationButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val unreadCount by NotificationStore.unreadCount.collectAsState()

    Box(
        modifier = modifier
            .size(38.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(Slate50)
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = Icons.Default.Notifications,
            contentDescription = "Notifications",
            tint = Slate700,
            modifier = Modifier.size(18.dp)
        )

        if (unreadCount > 0) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(RoseError)
                    .align(Alignment.TopEnd)
                    .offset(x = (-4).dp, y = 4.dp)
            )
        }
    }
}

