package com.medmarg.patient.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BottomSheetMenuView(
    user: UserProfile? = null,
    onDismissRequest: () -> Unit,
    onNavigateTab: (Int, Int) -> Unit = { _, _ -> },
    onLogout: () -> Unit = {}
) {
    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        containerColor = PureWhite,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(top = 10.dp, bottom = 8.dp)
                    .width(40.dp)
                    .height(5.dp)
                    .clip(RoundedCornerShape(3.dp))
                    .background(Slate500.copy(alpha = 0.3f))
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 32.dp)
        ) {
            // Header Bar (Matching iOS BottomSheetMenuView)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.logo),
                        contentDescription = "MedMarg",
                        contentScale = ContentScale.Fit,
                        modifier = Modifier
                            .height(28.dp)
                            .width(110.dp)
                    )

                    Column {
                        Text(
                            text = "Workspace Hub",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Text(
                            text = "All Modules & Quick Navigation",
                            fontSize = 11.sp,
                            color = Slate500
                        )
                    }
                }

                IconButton(onClick = onDismissRequest) {
                    Icon(
                        imageVector = Icons.Default.Cancel,
                        contentDescription = "Close",
                        tint = Slate500,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            Divider(color = Slate200)

            // Grid / Cards List of Modules & Inner Sub-Tabs
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 14.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (user?.role == UserRole.ADMIN) {
                    // Admin Modules
                    BottomSheetModuleCard(
                        tabIndex = 0,
                        icon = Icons.Default.BarChart,
                        title = "Overview",
                        description = "Live Revenue, Order Metrics & Platform Activity Log",
                        subTabs = listOf(0 to "Live Metrics", 1 to "Telemetry Feed", 2 to "Activity Logs"),
                        onCardClick = { tab, sub ->
                            onDismissRequest()
                            onNavigateTab(tab, sub)
                        }
                    )
                    BottomSheetModuleCard(
                        tabIndex = 1,
                        icon = Icons.Default.Science,
                        title = "Tests",
                        description = "104 Parameters, B2B Negotiated Rates & Category Manager",
                        subTabs = listOf(0 to "Diagnostic Tests", 1 to "Full Body Packages", 2 to "Category Manager"),
                        onCardClick = { tab, sub ->
                            onDismissRequest()
                            onNavigateTab(tab, sub)
                        }
                    )
                    BottomSheetModuleCard(
                        tabIndex = 2,
                        icon = Icons.Default.Domain,
                        title = "Labs",
                        description = "Thyrocare, Apollo & Lal PathLabs Accredited Centers",
                        subTabs = listOf(0 to "Active Accredited Labs", 1 to "Lab Verification", 2 to "Processing Turnaround"),
                        onCardClick = { tab, sub ->
                            onDismissRequest()
                            onNavigateTab(tab, sub)
                        }
                    )
                    BottomSheetModuleCard(
                        tabIndex = 3,
                        icon = Icons.Default.LocalHospital,
                        title = "Hospitals & Doctors",
                        description = "OPD Specialist Clinics, Tokens & Verification Roster",
                        subTabs = listOf(0 to "Verified Doctors", 1 to "OPD Clinics", 2 to "Doctor Onboarding"),
                        onCardClick = { tab, sub ->
                            onDismissRequest()
                            onNavigateTab(tab, sub)
                        }
                    )
                    BottomSheetModuleCard(
                        tabIndex = 4,
                        icon = Icons.Default.Medication,
                        title = "Pharmacies",
                        description = "Generic Chemist Stores, Stock Inventory & E-Prescriptions",
                        subTabs = listOf(0 to "Generic Chemist Stores", 1 to "Medicine Inventory", 2 to "Prescription Orders"),
                        onCardClick = { tab, sub ->
                            onDismissRequest()
                            onNavigateTab(tab, sub)
                        }
                    )
                    BottomSheetModuleCard(
                        tabIndex = 5,
                        icon = Icons.Default.DirectionsCar,
                        title = "Agents",
                        description = "Phlebotomist Roster, Cold-Chain Telemetry & Onboarding",
                        subTabs = listOf(0 to "Phlebotomist Roster", 1 to "Cold-Chain Telemetry", 2 to "Agent Onboarding"),
                        onCardClick = { tab, sub ->
                            onDismissRequest()
                            onNavigateTab(tab, sub)
                        }
                    )
                } else {
                    // Patient Modules (Matching iOS patientBottomSheetModules exactly)
                    BottomSheetModuleCard(
                        tabIndex = 0,
                        icon = Icons.Default.Home,
                        title = "Home",
                        description = "Wellness Hub, His/Her/Family Wellness & Instant Booking",
                        subTabs = listOf(0 to "His Wellness", 1 to "Her Wellness", 2 to "Family Wellness", 3 to "Disease Screening"),
                        onCardClick = { tab, sub ->
                            onDismissRequest()
                            onNavigateTab(tab, sub)
                        }
                    )

                    BottomSheetModuleCard(
                        tabIndex = 1,
                        icon = Icons.Default.Science,
                        title = "Labs & Tests",
                        description = "913+ Pathology Tests, Profiles, Health Packages & Smart Savings",
                        subTabs = listOf(0 to "All Tests", 1 to "Health Packages", 2 to "Diagnostic Profiles"),
                        onCardClick = { tab, sub ->
                            onDismissRequest()
                            onNavigateTab(tab, sub)
                        }
                    )

                    BottomSheetModuleCard(
                        tabIndex = 2,
                        icon = Icons.Default.NearMe,
                        title = "Track",
                        description = "Live Phlebotomist GPS Tracking & IoT Cold-Chain Status",
                        subTabs = listOf(0 to "Active Pickups", 1 to "Cold-Chain Temp", 2 to "Collector Contact"),
                        onCardClick = { tab, sub ->
                            onDismissRequest()
                            onNavigateTab(tab, sub)
                        }
                    )

                    BottomSheetModuleCard(
                        tabIndex = 3,
                        icon = Icons.Default.Description,
                        title = "Reports",
                        description = "Digital Health Locker & Google Drive Synced NABL PDF Reports",
                        subTabs = listOf(0 to "Lab Reports PDF", 1 to "Biomarker Trends", 2 to "Doctor Prescriptions"),
                        onCardClick = { tab, sub ->
                            onDismissRequest()
                            onNavigateTab(tab, sub)
                        }
                    )

                    BottomSheetModuleCard(
                        tabIndex = 4,
                        icon = Icons.Default.Person,
                        title = "Profile",
                        description = "Verified Mobile Number, Home Addresses & Family Members",
                        subTabs = listOf(0 to "User Account", 1 to "Linked Family", 2 to "Saved Addresses"),
                        onCardClick = { tab, sub ->
                            onDismissRequest()
                            onNavigateTab(tab, sub)
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun BottomSheetModuleCard(
    tabIndex: Int,
    icon: ImageVector,
    title: String,
    description: String,
    subTabs: List<Pair<Int, String>>,
    onCardClick: (Int, Int) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCardClick(tabIndex, 0) },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Main Module Header Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(MedTealLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = icon,
                            contentDescription = null,
                            tint = MedTealPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Column {
                        Text(
                            text = title,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Text(
                            text = description,
                            fontSize = 11.sp,
                            color = Slate500,
                            maxLines = 1
                        )
                    }
                }

                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = MedTealPrimary,
                    modifier = Modifier.size(18.dp)
                )
            }

            // Inner Sub-Tabs Chips Row
            if (subTabs.isNotEmpty()) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    subTabs.forEach { (subIndex, subLabel) ->
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .clickable { onCardClick(tabIndex, subIndex) },
                            color = Slate50,
                            shape = RoundedCornerShape(6.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                        ) {
                            Text(
                                text = subLabel,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Slate700,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
