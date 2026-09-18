package com.medmarg.patient.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.model.UserRole
import com.medmarg.patient.ui.theme.*

@Composable
fun BottomNavbarView(
    selectedTab: Int,
    onTabSelected: (Int) -> Unit,
    userRole: UserRole,
    onOpenMenuSheet: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .shadow(10.dp, spotColor = Color.Black.copy(alpha = 0.08f))
            .pointerInput(Unit) {
                var totalDragY = 0f
                detectVerticalDragGestures(
                    onDragStart = { totalDragY = 0f },
                    onVerticalDrag = { change, dragAmount ->
                        change.consume()
                        totalDragY += dragAmount
                    },
                    onDragEnd = {
                        if (totalDragY < -20f) { // Swipe up detected -> opens side elements bottom sheet
                            onOpenMenuSheet()
                        }
                    }
                )
            },
        color = PureWhite
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            if (userRole == UserRole.ADMIN) {
                // ==========================================
                // 🛡️ SUPER ADMIN DEDICATED 5-ELEMENT BOTTOM NAVBAR
                // ==========================================
                NavTabItem(index = 1, selectedIndex = selectedTab, icon = Icons.Default.Science, label = "Tests", onClick = { onTabSelected(1) })
                NavTabItem(index = 2, selectedIndex = selectedTab, icon = Icons.Default.Domain, label = "Labs", onClick = { onTabSelected(2) })

                // Center Create Button
                Box(
                    modifier = Modifier
                        .offset(y = (-6).dp)
                        .clickable { onOpenMenuSheet() },
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .shadow(8.dp, CircleShape, spotColor = EmeraldAccent.copy(alpha = 0.5f))
                                .clip(CircleShape)
                                .background(Brush.linearGradient(listOf(MedTealPrimary, EmeraldAccent))),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Create", tint = PureWhite, modifier = Modifier.size(22.dp))
                        }
                        Text("Create", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                    }
                }

                NavTabItem(index = 3, selectedIndex = selectedTab, icon = Icons.Default.LocalHospital, label = "Hospitals", onClick = { onTabSelected(3) })
                NavTabItem(index = 5, selectedIndex = selectedTab, icon = Icons.Default.DirectionsCar, label = "Agents", onClick = { onTabSelected(5) })
            } else {
                // ==========================================
                // 📱 PATIENT / DEFAULT 5 CORE TABS
                // 1. Home, 2. Labs & Tests, 3. Track, 4. Reports, 5. Profile
                // ==========================================
                NavTabItem(index = 0, selectedIndex = selectedTab, icon = Icons.Default.Home, label = "Home", onClick = { onTabSelected(0) })
                NavTabItem(index = 1, selectedIndex = selectedTab, icon = Icons.Default.Science, label = "Labs & Tests", onClick = { onTabSelected(1) })

                // Tab 2: Track (CENTER HIGHLIGHTED ACTION BUTTON MATCHING IOS)
                Box(
                    modifier = Modifier
                        .offset(y = (-8).dp)
                        .clickable { onTabSelected(2) },
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(contentAlignment = Alignment.Center) {
                            Box(
                                modifier = Modifier
                                    .size(42.dp)
                                    .shadow(6.dp, CircleShape, spotColor = EmeraldAccent.copy(alpha = 0.4f))
                                    .clip(CircleShape)
                                    .background(Brush.linearGradient(listOf(MedTealPrimary, EmeraldAccent))),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.NearMe,
                                    contentDescription = "Track",
                                    tint = PureWhite,
                                    modifier = Modifier.size(19.dp)
                                )
                            }

                            // Glowing Red Live Dot Badge
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .align(Alignment.TopEnd)
                                    .offset(x = 2.dp, y = (-2).dp)
                                    .clip(CircleShape)
                                    .background(RoseError)
                            )
                        }

                        Text(
                            text = "Track",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (selectedTab == 2) MedTealPrimary else Slate700,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                }

                NavTabItem(index = 3, selectedIndex = selectedTab, icon = Icons.Default.Description, label = "Reports", onClick = { onTabSelected(3) })
                NavTabItem(index = 4, selectedIndex = selectedTab, icon = Icons.Default.Person, label = "Profile", onClick = { onTabSelected(4) })
            }
        }
    }
}

@Composable
private fun NavTabItem(
    index: Int,
    selectedIndex: Int,
    icon: ImageVector,
    label: String,
    onClick: () -> Unit
) {
    val isSelected = index == selectedIndex
    Column(
        modifier = Modifier
            .clickable { onClick() }
            .padding(horizontal = 8.dp, vertical = 2.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = if (isSelected) MedTealPrimary else Slate500,
            modifier = Modifier.size(20.dp)
        )
        Text(
            text = label,
            fontSize = 10.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            color = if (isSelected) MedTealPrimary else Slate500,
            modifier = Modifier.padding(top = 2.dp),
            maxLines = 1
        )
    }
}
