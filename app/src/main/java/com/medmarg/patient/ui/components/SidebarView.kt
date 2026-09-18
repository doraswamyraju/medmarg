package com.medmarg.patient.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.Image
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.R
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.model.UserRole
import com.medmarg.patient.ui.theme.*

@Composable
fun SidebarView(
    user: UserProfile,
    onNavigateTab: (Int, Int) -> Unit,
    onLogout: () -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    // Accordion State to toggle expand/collapse of main tabs
    var expandedTabs by remember { mutableStateOf(setOf(0)) }

    Surface(
        modifier = modifier
            .fillMaxHeight()
            .width(300.dp),
        color = PureWhite,
        shadowElevation = 16.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
        ) {
            // Header: Horizontal MedMarg Logo & User Info (Matching iOS SidebarView)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.logo),
                        contentDescription = "MedMarg",
                        contentScale = ContentScale.Fit,
                        modifier = Modifier
                            .height(32.dp)
                            .width(120.dp)
                    )

                    IconButton(onClick = onClose) {
                        Icon(
                            imageVector = Icons.Default.Cancel,
                            contentDescription = "Close",
                            tint = Slate500,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Column {
                    Text(
                        text = user.role.displayName,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = MedTealPrimary
                    )
                    Text(
                        text = user.email,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Slate500
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))
                Divider(color = Slate200)
            }

            // Sidebar Navigation Tabs with Accordion Show/Hide Inner Options
            Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 8.dp)
            ) {
                Text(
                    text = if (user.role == UserRole.ADMIN) "SUPER ADMIN MODULES" else "PATIENT MODULES",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate500,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )

                if (user.role == UserRole.ADMIN) {
                    // Super Admin Accordion Modules
                    AccordionTabItem(
                        index = 0,
                        icon = Icons.Default.BarChart,
                        title = "Overview",
                        subTabs = listOf(0 to "Live Metrics", 1 to "Telemetry Feed", 2 to "Activity Logs"),
                        isExpanded = expandedTabs.contains(0),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(0)) expandedTabs - 0 else expandedTabs + 0
                            onNavigateTab(0, 0)
                        },
                        onSelectSubTab = { sub -> onNavigateTab(0, sub) }
                    )
                    AccordionTabItem(
                        index = 1,
                        icon = Icons.Default.Science,
                        title = "Tests",
                        subTabs = listOf(0 to "Diagnostic Tests", 1 to "Full Body Packages", 2 to "Category Manager"),
                        isExpanded = expandedTabs.contains(1),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(1)) expandedTabs - 1 else expandedTabs + 1
                            onNavigateTab(1, 0)
                        },
                        onSelectSubTab = { sub -> onNavigateTab(1, sub) }
                    )
                    AccordionTabItem(
                        index = 2,
                        icon = Icons.Default.Domain,
                        title = "Labs",
                        subTabs = listOf(0 to "Active Accredited Labs", 1 to "Onboarding Requests", 2 to "Quality NABL"),
                        isExpanded = expandedTabs.contains(2),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(2)) expandedTabs - 2 else expandedTabs + 2
                            onNavigateTab(2, 0)
                        },
                        onSelectSubTab = { sub -> onNavigateTab(2, sub) }
                    )
                    AccordionTabItem(
                        index = 3,
                        icon = Icons.Default.LocalHospital,
                        title = "Hospitals",
                        subTabs = listOf(0 to "Partner Hospitals", 1 to "OPD Token Desk", 2 to "Radiology Hubs"),
                        isExpanded = expandedTabs.contains(3),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(3)) expandedTabs - 3 else expandedTabs + 3
                            onNavigateTab(3, 0)
                        },
                        onSelectSubTab = { sub -> onNavigateTab(3, sub) }
                    )
                    AccordionTabItem(
                        index = 4,
                        icon = Icons.Default.Medication,
                        title = "Pharmacies",
                        subTabs = listOf(0 to "Generic Chemist Stores", 1 to "Medicine Inventory", 2 to "Prescription Orders"),
                        isExpanded = expandedTabs.contains(4),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(4)) expandedTabs - 4 else expandedTabs + 4
                            onNavigateTab(4, 0)
                        },
                        onSelectSubTab = { sub -> onNavigateTab(4, sub) }
                    )
                    AccordionTabItem(
                        index = 5,
                        icon = Icons.Default.DirectionsCar,
                        title = "Agents",
                        subTabs = listOf(0 to "Phlebotomist Roster", 1 to "Cold-Chain Telemetry", 2 to "Agent Onboarding"),
                        isExpanded = expandedTabs.contains(5),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(5)) expandedTabs - 5 else expandedTabs + 5
                            onNavigateTab(5, 0)
                        },
                        onSelectSubTab = { sub -> onNavigateTab(5, sub) }
                    )
                    AccordionTabItem(
                        index = 6,
                        icon = Icons.Default.Inventory,
                        title = "Inventory",
                        subTabs = listOf(0 to "Stock Overview", 1 to "Agent Supplies Dispatch", 2 to "Purchase Orders"),
                        isExpanded = expandedTabs.contains(6),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(6)) expandedTabs - 6 else expandedTabs + 6
                            onNavigateTab(6, 0)
                        },
                        onSelectSubTab = { sub -> onNavigateTab(6, sub) }
                    )
                    AccordionTabItem(
                        index = 7,
                        icon = Icons.Default.Group,
                        title = "Users",
                        subTabs = listOf(0 to "All System Users", 1 to "Doctor Accounts", 2 to "Diagnostic Labs", 3 to "Phlebotomists", 4 to "Patients"),
                        isExpanded = expandedTabs.contains(7),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(7)) expandedTabs - 7 else expandedTabs + 7
                            onNavigateTab(7, 0)
                        },
                        onSelectSubTab = { sub -> onNavigateTab(7, sub) }
                    )
                } else {
                    // Patient Accordion Modules (Matching iOS patientAccordionModules exactly)
                    AccordionTabItem(
                        index = 0,
                        icon = Icons.Default.Home,
                        title = "Home",
                        subTabs = listOf(0 to "His Wellness", 1 to "Her Wellness", 2 to "Family Wellness", 3 to "Disease Screening"),
                        isExpanded = expandedTabs.contains(0),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(0)) expandedTabs - 0 else expandedTabs + 0
                            onNavigateTab(0, 0)
                        },
                        onSelectSubTab = { sub -> onNavigateTab(0, sub) }
                    )
                    AccordionTabItem(
                        index = 1,
                        icon = Icons.Default.Science,
                        title = "Labs & Tests",
                        subTabs = listOf(0 to "All Pathology Tests", 1 to "Health Packages", 2 to "Diagnostic Profiles"),
                        isExpanded = expandedTabs.contains(1),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(1)) expandedTabs - 1 else expandedTabs + 1
                            onNavigateTab(1, 0)
                        },
                        onSelectSubTab = { sub -> onNavigateTab(1, sub) }
                    )
                    AccordionTabItem(
                        index = 2,
                        icon = Icons.Default.NearMe,
                        title = "Track",
                        subTabs = listOf(0 to "Live Sample Tracking", 1 to "IoT Cold-Chain Telemetry"),
                        isExpanded = expandedTabs.contains(2),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(2)) expandedTabs - 2 else expandedTabs + 2
                            onNavigateTab(2, 0)
                        },
                        onSelectSubTab = { sub -> onNavigateTab(2, sub) }
                    )
                    AccordionTabItem(
                        index = 3,
                        icon = Icons.Default.Description,
                        title = "Reports",
                        subTabs = listOf(0 to "NABL PDF Reports", 1 to "Biomarker Trends", 2 to "Doctor Prescriptions"),
                        isExpanded = expandedTabs.contains(3),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(3)) expandedTabs - 3 else expandedTabs + 3
                            onNavigateTab(3, 0)
                        },
                        onSelectSubTab = { sub -> onNavigateTab(3, sub) }
                    )
                    AccordionTabItem(
                        index = 4,
                        icon = Icons.Default.Person,
                        title = "Profile",
                        subTabs = listOf(0 to "Patient Account", 1 to "Linked Family", 2 to "Addresses"),
                        isExpanded = expandedTabs.contains(4),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(4)) expandedTabs - 4 else expandedTabs + 4
                            onNavigateTab(4, 0)
                        },
                        onSelectSubTab = { sub -> onNavigateTab(4, sub) }
                    )
                }
            }

            // Footer Bar: Profile & Settings on left, Logout Power Icon on right (Matching iOS)
            Divider(color = Slate200)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Profile & Settings
                Row(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onNavigateTab(4, 0) },
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountCircle,
                        contentDescription = null,
                        tint = MedTealPrimary,
                        modifier = Modifier.size(24.dp)
                    )

                    Column {
                        Text(
                            text = "Profile & Settings",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Text(
                            text = "Account & Role Permissions",
                            fontSize = 10.sp,
                            color = Slate500
                        )
                    }
                }

                // Red Logout Action Button
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(RoseError.copy(alpha = 0.1f))
                        .clickable { onLogout() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.PowerSettingsNew,
                        contentDescription = "Logout",
                        tint = RoseError,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun AccordionTabItem(
    index: Int,
    icon: ImageVector,
    title: String,
    subTabs: List<Pair<Int, String>>,
    isExpanded: Boolean,
    onToggle: () -> Unit,
    onSelectSubTab: (Int) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp)
    ) {
        // Main Tab Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .clickable { onToggle() }
                .padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = MedTealPrimary,
                    modifier = Modifier.size(20.dp)
                )
                Text(
                    text = title,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
            }

            if (subTabs.isNotEmpty()) {
                Icon(
                    imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = Slate500,
                    modifier = Modifier.size(16.dp)
                )
            }
        }

        // Inner Options List
        AnimatedVisibility(
            visible = isExpanded && subTabs.isNotEmpty(),
            enter = expandVertically(),
            exit = shrinkVertically()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 44.dp, top = 2.dp, bottom = 4.dp)
            ) {
                subTabs.forEach { (subIdx, subLabel) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelectSubTab(subIdx) }
                            .padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(5.dp)
                                .clip(CircleShape)
                                .background(MedTealPrimary)
                        )
                        Text(
                            text = subLabel,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate700
                        )
                    }
                }
            }
        }
    }
}
