package com.medmarg.patient.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.R
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.model.UserRole
import com.medmarg.patient.ui.theme.*

/**
 * 1-on-1 Replicated Slide-Out Sidebar Navigation Drawer (`ios/Shared/Components/SidebarView.swift`).
 * - Exact active main tab & sub-tab highlighting (`selectedTab`, `selectedSubTab`)
 * - Flush left-aligned MedMarg logo (`ContentScale.Fit`, `Alignment.CenterStart`)
 * - All 8 Patient modules (`Home`, `Labs & Tests Matrix`, `Apple/Android Health Vitals`, `Live Tracking Radar`,
 *   `Digital Health Vault`, `Refer & Corporate`, `My Bookings & Invoices`, `Care Seeker Profile`)
 */
@Composable
fun SidebarView(
    user: UserProfile,
    selectedTab: Int = 0,
    selectedSubTab: Int = 0,
    onNavigateTab: (Int, Int) -> Unit,
    onLogout: () -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    // Expand the currently active tab by default when sidebar opens (matching iOS)
    var expandedTabs by remember(selectedTab) { mutableStateOf(setOf(selectedTab)) }

    Surface(
        modifier = modifier
            .fillMaxHeight()
            .width(305.dp)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { /* Consume taps inside sidebar so backdrop doesn't close it */ },
        color = PureWhite,
        shadowElevation = 20.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
        ) {
            // 1. Header: Horizontal MedMarg Logo & User Info (Matching iOS SidebarView.swift)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 18.dp, vertical = 14.dp)
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
                        alignment = Alignment.CenterStart,
                        modifier = Modifier
                            .height(32.dp)
                            .width(128.dp)
                    )

                    Box(
                        modifier = Modifier
                            .size(30.dp)
                            .clip(CircleShape)
                            .background(Slate100)
                            .clickable { onClose() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = Slate600,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = user.role.displayName,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = MedTealPrimary
                )
                Text(
                    text = user.email.ifEmpty { user.phone },
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Slate500,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(top = 2.dp)
                )

                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = Slate200)
            }

            // 2. Sidebar Navigation Tabs with Accordion Show/Hide Inner Options
            Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 10.dp)
            ) {
                val sectionHeader = when (user.role) {
                    UserRole.ADMIN -> "SUPER ADMIN MODULES"
                    UserRole.COLLECTION_AGENT -> "PHLEBOTOMY FLEET TERMINAL"
                    UserRole.FREELANCE_AGENT -> "GIG PHLEBOTOMIST NETWORK"
                    else -> "PATIENT SERVICES"
                }

                Text(
                    text = sectionHeader,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate500,
                    letterSpacing = 0.6.sp,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                )

                if (user.role == UserRole.ADMIN) {
                    AccordionTabItem(
                        index = 0,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.BarChart,
                        title = "Overview",
                        subTabs = listOf(0 to "Live Metrics", 1 to "Telemetry Feed", 2 to "Activity Logs"),
                        isExpanded = expandedTabs.contains(0),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(0)) expandedTabs - 0 else expandedTabs + 0
                        },
                        onSelectSubTab = { sub -> onNavigateTab(0, sub) }
                    )
                    AccordionTabItem(
                        index = 1,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Science,
                        title = "Tests",
                        subTabs = listOf(0 to "Diagnostic Tests", 1 to "Full Body Packages", 2 to "Category Manager"),
                        isExpanded = expandedTabs.contains(1),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(1)) expandedTabs - 1 else expandedTabs + 1
                        },
                        onSelectSubTab = { sub -> onNavigateTab(1, sub) }
                    )
                    AccordionTabItem(
                        index = 2,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Domain,
                        title = "Labs",
                        subTabs = listOf(0 to "Active Accredited Labs", 1 to "Onboarding Requests", 2 to "Quality NABL"),
                        isExpanded = expandedTabs.contains(2),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(2)) expandedTabs - 2 else expandedTabs + 2
                        },
                        onSelectSubTab = { sub -> onNavigateTab(2, sub) }
                    )
                    AccordionTabItem(
                        index = 3,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.LocalHospital,
                        title = "Hospitals",
                        subTabs = listOf(0 to "Partner Hospitals", 1 to "OPD Token Desk", 2 to "Radiology Hubs"),
                        isExpanded = expandedTabs.contains(3),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(3)) expandedTabs - 3 else expandedTabs + 3
                        },
                        onSelectSubTab = { sub -> onNavigateTab(3, sub) }
                    )
                    AccordionTabItem(
                        index = 4,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Medication,
                        title = "Pharmacies",
                        subTabs = listOf(0 to "Generic Chemist Stores", 1 to "Medicine Inventory", 2 to "Prescription Orders"),
                        isExpanded = expandedTabs.contains(4),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(4)) expandedTabs - 4 else expandedTabs + 4
                        },
                        onSelectSubTab = { sub -> onNavigateTab(4, sub) }
                    )
                    AccordionTabItem(
                        index = 5,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.DirectionsCar,
                        title = "Agents",
                        subTabs = listOf(0 to "Phlebotomist Roster", 1 to "Cold-Chain Telemetry", 2 to "Agent Onboarding"),
                        isExpanded = expandedTabs.contains(5),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(5)) expandedTabs - 5 else expandedTabs + 5
                        },
                        onSelectSubTab = { sub -> onNavigateTab(5, sub) }
                    )
                    AccordionTabItem(
                        index = 6,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Inventory,
                        title = "Inventory",
                        subTabs = listOf(0 to "Stock Overview", 1 to "Agent Supplies Dispatch", 2 to "Purchase Orders"),
                        isExpanded = expandedTabs.contains(6),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(6)) expandedTabs - 6 else expandedTabs + 6
                        },
                        onSelectSubTab = { sub -> onNavigateTab(6, sub) }
                    )
                    AccordionTabItem(
                        index = 7,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Group,
                        title = "Users",
                        subTabs = listOf(0 to "All System Users", 1 to "Doctor Accounts", 2 to "Diagnostic Labs", 3 to "Phlebotomists", 4 to "Patients"),
                        isExpanded = expandedTabs.contains(7),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(7)) expandedTabs - 7 else expandedTabs + 7
                        },
                        onSelectSubTab = { sub -> onNavigateTab(7, sub) }
                    )
                } else if (user.role == UserRole.COLLECTION_AGENT) {
                    AccordionTabItem(
                        index = 0,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.DirectionsBike,
                        title = "Assigned Pickups",
                        subTabs = listOf(0 to "Live Today Roster", 1 to "Sample Collected", 2 to "Delivered to Lab"),
                        isExpanded = expandedTabs.contains(0),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(0)) expandedTabs - 0 else expandedTabs + 0
                        },
                        onSelectSubTab = { sub -> onNavigateTab(0, sub) }
                    )
                    AccordionTabItem(
                        index = 7,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Assignment,
                        title = "Pickups & Orders",
                        subTabs = listOf(0 to "Today's Roster", 1 to "En Route Orders"),
                        isExpanded = expandedTabs.contains(7),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(7)) expandedTabs - 7 else expandedTabs + 7
                        },
                        onSelectSubTab = { sub -> onNavigateTab(7, sub) }
                    )
                    AccordionTabItem(
                        index = 1,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Inventory2,
                        title = "Supplies & Store",
                        subTabs = listOf(0 to "In-Hand Field Kit", 1 to "Warehouse Stock", 2 to "Indent History"),
                        isExpanded = expandedTabs.contains(1),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(1)) expandedTabs - 1 else expandedTabs + 1
                        },
                        onSelectSubTab = { sub -> onNavigateTab(1, sub) }
                    )
                    AccordionTabItem(
                        index = 2,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.NearMe,
                        title = "Track & Navigate",
                        subTabs = listOf(0 to "Live Route Map", 1 to "Stop-by-Stop Queue"),
                        isExpanded = expandedTabs.contains(2),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(2)) expandedTabs - 2 else expandedTabs + 2
                        },
                        onSelectSubTab = { sub -> onNavigateTab(2, sub) }
                    )
                    AccordionTabItem(
                        index = 3,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.CreditCard,
                        title = "Doorstep Payments",
                        subTabs = listOf(0 to "Razorpay UPI QR POS", 1 to "Collected Today", 2 to "Cash Handover"),
                        isExpanded = expandedTabs.contains(3),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(3)) expandedTabs - 3 else expandedTabs + 3
                        },
                        onSelectSubTab = { sub -> onNavigateTab(3, sub) }
                    )
                    AccordionTabItem(
                        index = 4,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.AccountCircle,
                        title = "Fleet Terminal",
                        subTabs = listOf(0 to "Agent Identity", 1 to "Duty Shift Toggle", 2 to "Device Telemetry"),
                        isExpanded = expandedTabs.contains(4),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(4)) expandedTabs - 4 else expandedTabs + 4
                        },
                        onSelectSubTab = { sub -> onNavigateTab(4, sub) }
                    )
                } else if (user.role == UserRole.FREELANCE_AGENT) {
                    AccordionTabItem(
                        index = 0,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Home,
                        title = "Claimed Pickups",
                        subTabs = listOf(0 to "Active Tasks", 1 to "Sample Drop"),
                        isExpanded = expandedTabs.contains(0),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(0)) expandedTabs - 0 else expandedTabs + 0
                        },
                        onSelectSubTab = { sub -> onNavigateTab(0, sub) }
                    )
                    AccordionTabItem(
                        index = 7,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Bolt,
                        title = "Broadcast Marketplace",
                        subTabs = listOf(0 to "Nearby Broadcast Jobs", 1 to "Claim Payout ₹180"),
                        isExpanded = expandedTabs.contains(7),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(7)) expandedTabs - 7 else expandedTabs + 7
                        },
                        onSelectSubTab = { sub -> onNavigateTab(7, sub) }
                    )
                    AccordionTabItem(
                        index = 1,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Inventory2,
                        title = "Supplies & Store",
                        subTabs = listOf(0 to "Allotted Consumables", 1 to "Store Replenishment"),
                        isExpanded = expandedTabs.contains(1),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(1)) expandedTabs - 1 else expandedTabs + 1
                        },
                        onSelectSubTab = { sub -> onNavigateTab(1, sub) }
                    )
                    AccordionTabItem(
                        index = 3,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.AccountBalanceWallet,
                        title = "Earnings & Cashout",
                        subTabs = listOf(0 to "Instant UPI Cashout", 1 to "Weekly Statement"),
                        isExpanded = expandedTabs.contains(3),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(3)) expandedTabs - 3 else expandedTabs + 3
                        },
                        onSelectSubTab = { sub -> onNavigateTab(3, sub) }
                    )
                    AccordionTabItem(
                        index = 4,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Person,
                        title = "Gig Profile",
                        subTabs = listOf(0 to "MLT Certifications", 1 to "Payout Bank VPA"),
                        isExpanded = expandedTabs.contains(4),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(4)) expandedTabs - 4 else expandedTabs + 4
                        },
                        onSelectSubTab = { sub -> onNavigateTab(4, sub) }
                    )
                } else {
                    // Patient Accordion Modules (1:1 with iOS patientAccordionModules)
                    AccordionTabItem(
                        index = 0,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Home,
                        title = "Home",
                        subTabs = listOf(0 to "Healthcare Hub", 1 to "Curated Plans", 2 to "Offers Zone"),
                        isExpanded = expandedTabs.contains(0),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(0)) expandedTabs - 0 else expandedTabs + 0
                        },
                        onSelectSubTab = { sub -> onNavigateTab(0, sub) }
                    )
                    AccordionTabItem(
                        index = 1,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Science,
                        title = "Labs & Tests Matrix",
                        subTabs = listOf(
                            0 to "All 913+ Tests",
                            1 to "Full Body Packages",
                            2 to "Diagnostic Profiles",
                            3 to "Individual Tests"
                        ),
                        isExpanded = expandedTabs.contains(1),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(1)) expandedTabs - 1 else expandedTabs + 1
                        },
                        onSelectSubTab = { sub -> onNavigateTab(1, sub) }
                    )
                    AccordionTabItem(
                        index = 8,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.MonitorHeart,
                        title = "Smart Vitals Hub",
                        subTabs = listOf(
                            0 to "Live Telemetry",
                            1 to "Historical Analytics",
                            2 to "Correlated Tests"
                        ),
                        isExpanded = expandedTabs.contains(8),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(8)) expandedTabs - 8 else expandedTabs + 8
                        },
                        onSelectSubTab = { sub -> onNavigateTab(8, sub) }
                    )
                    AccordionTabItem(
                        index = 2,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.NearMe,
                        title = "Live Tracking Radar",
                        subTabs = listOf(
                            0 to "Phlebotomist GPS",
                            1 to "Doorstep OTP",
                            2 to "Cold-Chain IoT (3.8°C)"
                        ),
                        isExpanded = expandedTabs.contains(2),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(2)) expandedTabs - 2 else expandedTabs + 2
                        },
                        onSelectSubTab = { sub -> onNavigateTab(2, sub) }
                    )
                    AccordionTabItem(
                        index = 3,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Description,
                        title = "Digital Health Vault",
                        subTabs = listOf(
                            0 to "NABL PDF Reports",
                            1 to "Biomarker Progression",
                            2 to "Google Drive Sync"
                        ),
                        isExpanded = expandedTabs.contains(3),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(3)) expandedTabs - 3 else expandedTabs + 3
                        },
                        onSelectSubTab = { sub -> onNavigateTab(3, sub) }
                    )
                    AccordionTabItem(
                        index = 10,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.CardGiftcard,
                        title = "Refer & Corporate",
                        subTabs = listOf(
                            0 to "Refer & Earn ₹200",
                            1 to "Corporate Wellness",
                            2 to "Staff Health Roster"
                        ),
                        isExpanded = expandedTabs.contains(10),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(10)) expandedTabs - 10 else expandedTabs + 10
                        },
                        onSelectSubTab = { sub -> onNavigateTab(10, sub) }
                    )
                    AccordionTabItem(
                        index = 9,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.ReceiptLong,
                        title = "My Bookings & Invoices",
                        subTabs = listOf(0 to "Active Orders", 1 to "Past Bookings"),
                        isExpanded = expandedTabs.contains(9),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(9)) expandedTabs - 9 else expandedTabs + 9
                        },
                        onSelectSubTab = { sub -> onNavigateTab(9, sub) }
                    )
                    AccordionTabItem(
                        index = 4,
                        selectedTab = selectedTab,
                        selectedSubTab = selectedSubTab,
                        icon = Icons.Default.Person,
                        title = "Care Seeker Profile",
                        subTabs = listOf(
                            0 to "ABHA Digital ID",
                            1 to "Linked Family",
                            2 to "Saved Addresses"
                        ),
                        isExpanded = expandedTabs.contains(4),
                        onToggle = {
                            expandedTabs = if (expandedTabs.contains(4)) expandedTabs - 4 else expandedTabs + 4
                        },
                        onSelectSubTab = { sub -> onNavigateTab(4, sub) }
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))
            }

            // 3. Footer Bar: Profile & Settings on left, Logout Power Icon on right (Matching iOS)
            HorizontalDivider(color = Slate200)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .clickable { onNavigateTab(4, 0) }
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountCircle,
                        contentDescription = null,
                        tint = MedTealPrimary,
                        modifier = Modifier.size(26.dp)
                    )

                    Column {
                        Text(
                            text = if (user.role == UserRole.COLLECTION_AGENT) "Terminal ID" else "Profile & Settings",
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
    selectedTab: Int,
    selectedSubTab: Int,
    icon: ImageVector,
    title: String,
    subTabs: List<Pair<Int, String>>,
    isExpanded: Boolean,
    onToggle: () -> Unit,
    onSelectSubTab: (Int) -> Unit
) {
    val isMainSelected = selectedTab == index

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp)
    ) {
        // Main Tab Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(10.dp))
                .background(if (isMainSelected) MedTealLight else Color.Transparent)
                .clickable { onToggle() }
                .padding(horizontal = 14.dp, vertical = 11.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier.width(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = if (isMainSelected) MedTealPrimary else Slate700,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Text(
                    text = title,
                    fontSize = 14.sp,
                    fontWeight = if (isMainSelected) FontWeight.Bold else FontWeight.Medium,
                    color = if (isMainSelected) MedTealPrimary else Slate900,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            if (subTabs.isNotEmpty()) {
                Icon(
                    imageVector = if (isExpanded) Icons.Default.KeyboardArrowDown else Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = if (isMainSelected) MedTealPrimary else Slate500,
                    modifier = Modifier.size(18.dp)
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
                    val isSubSelected = isMainSelected && selectedSubTab == subIdx
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { onSelectSubTab(subIdx) }
                            .padding(vertical = 7.dp, horizontal = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(if (isSubSelected) MedTealPrimary else Slate400)
                        )
                        Text(
                            text = subLabel,
                            fontSize = 12.sp,
                            fontWeight = if (isSubSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSubSelected) MedTealPrimary else Slate700
                        )
                    }
                }
            }
        }
    }
}
