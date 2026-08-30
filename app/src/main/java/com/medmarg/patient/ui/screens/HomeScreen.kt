package com.medmarg.patient.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.SampleDataProvider
import com.medmarg.patient.model.DiagnosticTest
import com.medmarg.patient.model.LabTestPricing
import com.medmarg.patient.ui.components.*
import com.medmarg.patient.ui.theme.*

data class QuickActionItem(
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val iconBgColor: Color,
    val route: String
)

@Composable
fun HomeScreen(
    onNavigate: (String) -> Unit,
    onSelectLabTest: (DiagnosticTest, LabTestPricing) -> Unit,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }

    val quickActions = listOf(
        QuickActionItem("Lab Tests", "Multi-Lab Compare", Icons.Default.Science, MedTealPrimary, "diagnostics"),
        QuickActionItem("MRI / Scans", "Radiology Slots", Icons.Default.CameraAlt, CyanAccent, "scans"),
        QuickActionItem("Book Doctor", "Clinic Appointments", Icons.Default.CalendarMonth, Color(0xFF8B5CF6), "doctors"),
        QuickActionItem("Pharmacy", "Generic Savings", Icons.Default.Medication, EmeraldAccent, "pharmacy"),
        QuickActionItem("Health Insurance", "Cashless Pre-Auth", Icons.Default.HealthAndSafety, AmberWarning, "insurance"),
        QuickActionItem("Health Locker", "Biomarkers & ABHA", Icons.Default.FolderShared, Color(0xFFEC4899), "health_locker")
    )

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        // Search Header Card
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(MedTealDark, MedTealPrimary)
                        )
                    )
                    .padding(bottom = 16.dp)
            ) {
                SearchBarHeader(
                    query = searchQuery,
                    onQueryChange = { searchQuery = it },
                    placeholder = "Search tests (Lipid, HbA1c), Scans (MRI), Labs..."
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Tagline Banner
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.VerifiedUser,
                        contentDescription = "Verified",
                        tint = EmeraldAccent,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Open Multi-Lab Marketplace • NABL Certified • Transparent Prices",
                        style = MaterialTheme.typography.labelSmall,
                        color = MedTealLight,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        // Live Phlebotomist Sample Tracker Card (Active Status)
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = BorderStroke(1.dp, EmeraldLight),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(EmeraldLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.DirectionsWalk,
                            contentDescription = "Phlebotomist",
                            tint = EmeraldAccent,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Sample Collection En Route",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                color = EmeraldAccent,
                                shape = CircleShape,
                                modifier = Modifier.size(8.dp)
                            ) {}
                        }
                        Text(
                            text = "Phlebotomist Suresh arriving by 08:30 AM (Vial Barcode Verified)",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Slate600
                        )
                    }

                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = "Track",
                        tint = Slate400
                    )
                }
            }
        }

        // Quick Category Action Grid
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Text(
                    text = "Explore Healthcare Services",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Spacer(modifier = Modifier.height(12.dp))

                // 2x3 Grid
                for (i in quickActions.indices step 2) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 10.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        QuickActionCard(
                            item = quickActions[i],
                            modifier = Modifier.weight(1f),
                            onClick = { onNavigate(quickActions[i].route) }
                        )
                        if (i + 1 < quickActions.size) {
                            QuickActionCard(
                                item = quickActions[i + 1],
                                modifier = Modifier.weight(1f),
                                onClick = { onNavigate(quickActions[i + 1].route) }
                            )
                        }
                    }
                }
            }
        }

        // Section Title: Multi-Lab Price Comparison Engine
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Compare Diagnostic Labs",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Text(
                        text = "Choose your desired lab by Price, TAT & NABL rating",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate500
                    )
                }

                TextButton(onClick = { onNavigate("diagnostics") }) {
                    Text(
                        text = "View All",
                        color = MedTealPrimary,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Tests Comparison List
        items(SampleDataProvider.popularTests.take(2)) { test ->
            TestComparisonCard(
                test = test,
                onSelectLab = onSelectLabTest
            )
        }

        // Scanning Centers Feature Banner
        item {
            Spacer(modifier = Modifier.height(12.dp))
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .clickable { onNavigate("scans") },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Surface(
                            color = CyanAccent.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "RADIOLOGY & IMAGING",
                                color = CyanAccent,
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Book MRI, CT & Ultrasound",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = PureWhite
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "3.0 Tesla Silent MRI • Up to 50% MedMarg Partner Discount",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Slate400
                        )
                    }

                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(CyanAccent),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.CameraAlt,
                            contentDescription = "Scans",
                            tint = Slate900
                        )
                    }
                }
            }
        }

        // Generic Medicine Savings Banner
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .clickable { onNavigate("pharmacy") },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = EmeraldLight),
                border = BorderStroke(1.dp, EmeraldAccent.copy(alpha = 0.3f))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(EmeraldAccent),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Savings,
                            contentDescription = "Save",
                            tint = PureWhite
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Save up to 70% with Generic Medicines",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Text(
                            text = "Same chemical composition & quality, 1/3rd the price",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Slate700
                        )
                    }
                    Icon(
                        imageVector = Icons.Default.ArrowForward,
                        contentDescription = "Go",
                        tint = EmeraldAccent
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}

@Composable
fun QuickActionCard(
    item: QuickActionItem,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = BorderStroke(1.dp, CardBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(item.iconBgColor.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = item.icon,
                    contentDescription = item.title,
                    tint = item.iconBgColor,
                    modifier = Modifier.size(22.dp)
                )
            }

            Spacer(modifier = Modifier.width(10.dp))

            Column {
                Text(
                    text = item.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Text(
                    text = item.subtitle,
                    style = MaterialTheme.typography.labelSmall,
                    color = Slate500
                )
            }
        }
    }
}
