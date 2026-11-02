package com.medmarg.patient.ui.agent

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.R
import com.medmarg.patient.ui.theme.*

// =========================================================================
// 🏷️ AGENT TOPBAR VIEW (FLEET STATUS, LIVE ON/OFF DUTY TOGGLE, ACTIONS)
// 1-on-1 with iOS AgentTopbarView.swift
// 1. Logo -> Takes agent to Home (tab = 0)
// 2. Duty switch -> Live toggle synced to backend
// 3. Notification -> Opens notification sheet
// 4. Avatar -> Opens Agent Profile (tab = 4)
// =========================================================================

@Composable
fun AgentTopbarView(
    agentName: String,
    agentId: String,
    isOnDuty: Boolean,
    unreadNotificationCount: Int = 0,
    onToggleDuty: (Boolean) -> Unit,
    onLogoTap: () -> Unit = {},
    onSidebarTap: () -> Unit = {},
    onNotificationTap: () -> Unit = {},
    onProfileTap: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val dutyBgColor by animateColorAsState(
        targetValue = if (isOnDuty) Color(0xFF00B86B) else Slate500,
        label = "dutyBg"
    )

    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(PureWhite)
            .statusBarsPadding()
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // 1. Hamburger Sidebar Button
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(10.dp))
                .clickable { onSidebarTap() },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Menu,
                contentDescription = "Sidebar",
                tint = Slate900,
                modifier = Modifier.size(22.dp)
            )
        }

        Spacer(modifier = Modifier.width(6.dp))

        // 2. MedMarg Brand Logo (Clicking navigates to Home)
        Image(
            painter = painterResource(id = R.drawable.logo),
            contentDescription = "MedMarg Logo",
            modifier = Modifier
                .height(26.dp)
                .width(110.dp)
                .clickable { onLogoTap() }
        )

        Spacer(modifier = Modifier.weight(1f))

        // 3. ON DUTY / OFF DUTY Pill Toggle
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(18.dp))
                .background(dutyBgColor)
                .clickable { onToggleDuty(!isOnDuty) }
                .padding(horizontal = 8.dp, vertical = 4.dp),
            contentAlignment = Alignment.Center
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(5.dp)
            ) {
                if (isOnDuty) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(PureWhite)
                    )
                    Text(
                        text = "ON DUTY",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = PureWhite
                    )
                    Box(
                        modifier = Modifier
                            .size(16.dp)
                            .shadow(2.dp, CircleShape)
                            .clip(CircleShape)
                            .background(PureWhite)
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .size(16.dp)
                            .shadow(2.dp, CircleShape)
                            .clip(CircleShape)
                            .background(PureWhite)
                    )
                    Text(
                        text = "OFF DUTY",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = PureWhite
                    )
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(PureWhite.copy(alpha = 0.5f))
                    )
                }
            }
        }

        Spacer(modifier = Modifier.width(10.dp))

        // 4. Notification Bell with Badge
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .clickable { onNotificationTap() },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Notifications,
                contentDescription = "Notifications",
                tint = Slate700,
                modifier = Modifier.size(20.dp)
            )

            if (unreadNotificationCount > 0) {
                Box(
                    modifier = Modifier
                        .size(14.dp)
                        .align(Alignment.TopEnd)
                        .offset(x = 2.dp, y = (-2).dp)
                        .clip(CircleShape)
                        .background(RoseError),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "$unreadNotificationCount",
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                }
            }
        }

        Spacer(modifier = Modifier.width(4.dp))

        // 5. Agent Profile Avatar
        Box(
            modifier = Modifier
                .size(34.dp)
                .clip(CircleShape)
                .background(MedTealLight)
                .clickable { onProfileTap() },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Person,
                contentDescription = "Profile",
                tint = MedTealPrimary,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

