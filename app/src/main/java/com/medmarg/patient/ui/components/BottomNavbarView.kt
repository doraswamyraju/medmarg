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
    if (userRole == UserRole.COLLECTION_AGENT || userRole == UserRole.FREELANCE_AGENT) {
        // ==========================================
        // 🔮 GLASSMORPHIC FLOATING PILL NAVBAR FOR AGENTS (1-on-1 WITH IOS)
        // ==========================================
        AgentGlassmorphicNavbar(
            selectedTab = selectedTab,
            onTabSelected = onTabSelected,
            userRole = userRole,
            modifier = modifier
        )
    } else {
        StandardBottomNavbar(
            selectedTab = selectedTab,
            onTabSelected = onTabSelected,
            userRole = userRole,
            onOpenMenuSheet = onOpenMenuSheet,
            modifier = modifier
        )
    }
}

@Composable
private fun AgentGlassmorphicNavbar(
    selectedTab: Int,
    onTabSelected: (Int) -> Unit,
    userRole: UserRole,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(16.dp, shape = RoundedCornerShape(32.dp), spotColor = Color.Black.copy(alpha = 0.5f))
                .clip(RoundedCornerShape(32.dp))
                .background(Color(0xFF142428).copy(alpha = 0.96f))
                .border(
                    width = 1.dp,
                    brush = Brush.linearGradient(
                        listOf(
                            Color.White.copy(alpha = 0.25f),
                            Color.White.copy(alpha = 0.08f),
                            Color.Transparent
                        )
                    ),
                    shape = RoundedCornerShape(32.dp)
                )
                .padding(horizontal = 8.dp, vertical = 8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                AgentGlassTab(
                    index = 0,
                    selectedIndex = selectedTab,
                    icon = Icons.Default.Home,
                    title = "Home",
                    onClick = { onTabSelected(0) }
                )

                AgentGlassTab(
                    index = 7,
                    selectedIndex = selectedTab,
                    icon = Icons.Default.Assignment,
                    title = if (userRole == UserRole.FREELANCE_AGENT) "Gigs" else "Orders",
                    onClick = { onTabSelected(7) }
                )

                AgentGlassTab(
                    index = 1,
                    selectedIndex = selectedTab,
                    icon = Icons.Default.Inventory2,
                    title = if (userRole == UserRole.FREELANCE_AGENT) "Kit" else "Inventory",
                    onClick = { onTabSelected(1) }
                )

                AgentGlassTab(
                    index = 3,
                    selectedIndex = selectedTab,
                    icon = Icons.Default.CurrencyRupee,
                    title = if (userRole == UserRole.FREELANCE_AGENT) "Wallet" else "Payments",
                    onClick = { onTabSelected(3) }
                )

                AgentGlassTab(
                    index = 4,
                    selectedIndex = selectedTab,
                    icon = if (userRole == UserRole.FREELANCE_AGENT) Icons.Default.Person else Icons.Default.BarChart,
                    title = if (userRole == UserRole.FREELANCE_AGENT) "Profile" else "Quota",
                    onClick = { onTabSelected(4) }
                )
            }
        }
    }
}

@Composable
private fun AgentGlassTab(
    index: Int,
    selectedIndex: Int,
    icon: ImageVector,
    title: String,
    onClick: () -> Unit
) {
    val isSelected = selectedIndex == index || (index == 0 && (selectedIndex != 7 && selectedIndex != 1 && selectedIndex != 3 && selectedIndex != 4))

    Column(
        modifier = Modifier
            .clickable { onClick() }
            .padding(horizontal = 4.dp, vertical = 2.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        if (isSelected) {
            // Glowing Active Pill
            Box(
                modifier = Modifier
                    .size(width = 48.dp, height = 30.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF00DB8B).copy(alpha = 0.25f))
                    .border(1.dp, Color(0xFF00F29D).copy(alpha = 0.6f), RoundedCornerShape(16.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = Color(0xFF33FFAA),
                    modifier = Modifier.size(16.dp)
                )
            }

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = title,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF33FFAA)
            )

            // Small indicator dot
            Box(
                modifier = Modifier
                    .size(3.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF00F29D))
            )
        } else {
            Box(
                modifier = Modifier
                    .size(width = 48.dp, height = 30.dp),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = PureWhite.copy(alpha = 0.6f),
                    modifier = Modifier.size(17.dp)
                )
            }

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = title,
                fontSize = 9.sp,
                fontWeight = FontWeight.Medium,
                color = PureWhite.copy(alpha = 0.6f)
            )

            Spacer(modifier = Modifier.height(3.dp))
        }
    }
}

@Composable
private fun StandardBottomNavbar(
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
