package com.medmarg.patient.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.CatalogStore
import com.medmarg.patient.model.CatalogItem
import com.medmarg.patient.ui.components.BiomarkerSparkline
import com.medmarg.patient.ui.components.BiomarkerTrendChart
import com.medmarg.patient.ui.components.TrendPoint
import com.medmarg.patient.ui.theme.*

@Composable
fun HomeScreen(
    onNavigateToTab: (Int) -> Unit,
    onSelectItem: (CatalogItem) -> Unit,
    onOpenPrescription: () -> Unit
) {
    val context = LocalContext.current
    val packages by CatalogStore.packages.collectAsState()
    val tests by CatalogStore.tests.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
            .verticalScroll(rememberScrollState())
            .padding(bottom = 120.dp)
    ) {
        // =========================================================================
        // 1. INSTANT CHANNELS BANNER (WhatsApp, 24x7 Call, 60-Min Visit in Tirupati)
        // =========================================================================
        VStackInstantChannels(
            onOpenWhatsApp = {
                val msg = "Hello MedMarg, I would like to book a home sample collection in Tirupati."
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/919876543210?text=${Uri.encode(msg)}"))
                context.startActivity(intent)
            },
            onCallLab = {
                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:919876543210"))
                context.startActivity(intent)
            },
            onOpenCatalog = { onNavigateToTab(1) }
        )

        Spacer(modifier = Modifier.height(18.dp))

        // =========================================================================
        // 2. 🫀 HEALTH SUMMARY & VITALS MONITORING DASHBOARD (HEALTH PACK)
        // =========================================================================
        VitalsDashboardSection()

        Spacer(modifier = Modifier.height(20.dp))

        // =========================================================================
        // 3. CURATED LIFE-STAGE WELLNESS PLANS (His, Her, Family Wellness)
        // =========================================================================
        CuratedWellnessSection(
            packages = packages,
            onSelectItem = onSelectItem
        )

        Spacer(modifier = Modifier.height(20.dp))

        // =========================================================================
        // 4. DISEASE & VITAL BIOMARKERS SCREENING SECTION
        // =========================================================================
        DiseaseAndVitalBiomarkersSection(
            onSelectItem = onSelectItem
        )

        Spacer(modifier = Modifier.height(20.dp))

        // =========================================================================
        // 5. AGE-BASED & HEALTH CONCERN FINDER
        // =========================================================================
        AgeAndConcernSection(
            onOpenCatalog = { onNavigateToTab(1) }
        )

        Spacer(modifier = Modifier.height(20.dp))

        // =========================================================================
        // 6. POPULAR PATHOLOGY TESTS (913+ TESTS CATALOG PREVIEW)
        // =========================================================================
        PopularPathologySection(
            tests = tests,
            onSelectItem = onSelectItem,
            onSeeAll = { onNavigateToTab(1) }
        )

        Spacer(modifier = Modifier.height(20.dp))

        // =========================================================================
        // 7. LIVE PHLEBOTOMIST TRACKER BANNER
        // =========================================================================
        LivePhlebotomistTrackerBanner(
            onTrackClick = { onNavigateToTab(2) }
        )
    }
}

@Composable
private fun VStackInstantChannels(
    onOpenWhatsApp: () -> Unit,
    onCallLab: () -> Unit,
    onOpenCatalog: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Slate900),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .background(Brush.linearGradient(listOf(MedTealPrimary, MedTealDark)))
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = AmberWarning,
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        text = "INSTANT CHANNELS",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(EmeraldAccent))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("60-Min Phlebo Visit in Tirupati", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Book Diagnostic Tests in 1 Tap",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = PureWhite
            )

            Text(
                text = "Order on WhatsApp, call our lab concierge or explore 913+ tests.",
                fontSize = 12.sp,
                color = MedTealLight,
                modifier = Modifier.padding(top = 2.dp)
            )

            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = onOpenWhatsApp,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366)),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Icon(Icons.Default.Chat, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("WhatsApp", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = onCallLab,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF15803D)),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Icon(Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Call Lab", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.weight(1f))

                Button(
                    onClick = onOpenCatalog,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PureWhite.copy(alpha = 0.2f)),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 8.dp)
                ) {
                    Text("Catalog →", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                }
            }
        }
    }
}

@Composable
private fun VitalsDashboardSection() {
    var selectedViewMode by remember { mutableIntStateOf(0) } // 0: Quick Cards with Sparklines, 1: Graphical Trend Curves

    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Favorite, contentDescription = null, tint = RoseError, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Health & Vitals Dashboard", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Slate900)
            }

            Surface(color = EmeraldLight, shape = RoundedCornerShape(6.dp)) {
                Text(
                    text = "Health Connect Synced",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = EmeraldAccent,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
        }

        Text(
            text = "Continuous biometric monitoring from Android Health Connect & NABL reports",
            fontSize = 11.sp,
            color = Slate500,
            modifier = Modifier.padding(top = 2.dp)
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Tab Pill Toggle: [Quick Snapshot] vs [Graphical Trends]
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(10.dp))
                .background(Slate200.copy(alpha = 0.6f))
                .padding(3.dp)
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (selectedViewMode == 0) PureWhite else Color.Transparent)
                    .clickable { selectedViewMode = 0 }
                    .padding(vertical = 6.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "📊 Quick Vitals Snapshot",
                    fontSize = 11.sp,
                    fontWeight = if (selectedViewMode == 0) FontWeight.Bold else FontWeight.Medium,
                    color = if (selectedViewMode == 0) Slate900 else Slate600
                )
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (selectedViewMode == 1) PureWhite else Color.Transparent)
                    .clickable { selectedViewMode = 1 }
                    .padding(vertical = 6.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "📈 Graphical Trends (7-Day)",
                    fontSize = 11.sp,
                    fontWeight = if (selectedViewMode == 1) FontWeight.Bold else FontWeight.Medium,
                    color = if (selectedViewMode == 1) MedTealPrimary else Slate600
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (selectedViewMode == 0) {
            // 2x3 Grid of Key Biomarkers with Mini Sparklines
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                VitalMetricCard(
                    title = "Blood Pressure",
                    value = "120/80",
                    unit = "mmHg",
                    status = "Normal",
                    statusColor = EmeraldAccent,
                    icon = Icons.Default.MonitorHeart,
                    sparklineData = listOf(124f, 122f, 126f, 121f, 120f),
                    modifier = Modifier.weight(1f)
                )
                VitalMetricCard(
                    title = "Blood Glucose",
                    value = "94",
                    unit = "mg/dL",
                    status = "Fasting Normal",
                    statusColor = EmeraldAccent,
                    icon = Icons.Default.WaterDrop,
                    sparklineData = listOf(105f, 98f, 102f, 96f, 94f),
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                VitalMetricCard(
                    title = "Heart Rate",
                    value = "72",
                    unit = "bpm",
                    status = "Resting Optimal",
                    statusColor = EmeraldAccent,
                    icon = Icons.Default.FavoriteBorder,
                    sparklineData = listOf(76f, 74f, 78f, 71f, 72f),
                    modifier = Modifier.weight(1f)
                )
                VitalMetricCard(
                    title = "Oxygen (SpO2)",
                    value = "98%",
                    unit = "SpO2",
                    status = "Optimal",
                    statusColor = CyanAccent,
                    icon = Icons.Default.Air,
                    sparklineData = listOf(97f, 98f, 98f, 99f, 98f),
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                VitalMetricCard(
                    title = "Weight & BMI",
                    value = "68.5 kg",
                    unit = "BMI 22.4",
                    status = "Healthy Range",
                    statusColor = EmeraldAccent,
                    icon = Icons.Default.FitnessCenter,
                    sparklineData = listOf(69.2f, 69.0f, 68.8f, 68.6f, 68.5f),
                    modifier = Modifier.weight(1f)
                )
                VitalMetricCard(
                    title = "Activity & Sleep",
                    value = "6,420",
                    unit = "Steps • 7h 20m",
                    status = "Active",
                    statusColor = MedTealPrimary,
                    icon = Icons.Default.DirectionsWalk,
                    sparklineData = listOf(5200f, 7100f, 6800f, 5900f, 6420f),
                    modifier = Modifier.weight(1f)
                )
            }
        } else {
            // Full Graphical Trend Curves with Normal Target Bands
            BiomarkerTrendChart(
                title = "Blood Pressure (Systolic & Diastolic)",
                unit = "mmHg",
                latestValue = "120/80",
                statusText = "Optimal Target Zone",
                statusColor = EmeraldAccent,
                normalMin = 80f,
                normalMax = 120f,
                hasSecondarySeries = true,
                secondaryTitle = "Diastolic",
                points = listOf(
                    TrendPoint("12 Sep", 126f, false, 84f),
                    TrendPoint("14 Sep", 122f, false, 82f),
                    TrendPoint("15 Sep", 125f, false, 83f),
                    TrendPoint("16 Sep", 121f, false, 80f),
                    TrendPoint("17 Sep", 119f, false, 79f),
                    TrendPoint("18 Sep", 120f, false, 80f)
                )
            )

            BiomarkerTrendChart(
                title = "Fasting Blood Glucose",
                unit = "mg/dL",
                latestValue = "94",
                statusText = "Normal Fasting",
                statusColor = EmeraldAccent,
                normalMin = 70f,
                normalMax = 99f,
                points = listOf(
                    TrendPoint("12 Sep", 108f, true),
                    TrendPoint("14 Sep", 102f, true),
                    TrendPoint("15 Sep", 97f, false),
                    TrendPoint("16 Sep", 99f, false),
                    TrendPoint("17 Sep", 93f, false),
                    TrendPoint("18 Sep", 94f, false)
                )
            )

            BiomarkerTrendChart(
                title = "Resting Heart Rate",
                unit = "bpm",
                latestValue = "72",
                statusText = "Optimal Cardiac Rhythm",
                statusColor = EmeraldAccent,
                normalMin = 60f,
                normalMax = 100f,
                points = listOf(
                    TrendPoint("12 Sep", 76f),
                    TrendPoint("14 Sep", 74f),
                    TrendPoint("15 Sep", 78f),
                    TrendPoint("16 Sep", 71f),
                    TrendPoint("17 Sep", 70f),
                    TrendPoint("18 Sep", 72f)
                )
            )
        }
    }
}

@Composable
private fun VitalMetricCard(
    title: String,
    value: String,
    unit: String,
    status: String,
    statusColor: Color,
    icon: ImageVector,
    sparklineData: List<Float> = emptyList(),
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(title, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Slate500)
                Icon(icon, contentDescription = null, tint = statusColor, modifier = Modifier.size(16.dp))
            }

            Spacer(modifier = Modifier.height(4.dp))

            Row(verticalAlignment = Alignment.Bottom) {
                Text(value, fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                Spacer(modifier = Modifier.width(4.dp))
                Text(unit, fontSize = 10.sp, color = Slate500)
            }

            if (sparklineData.isNotEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                BiomarkerSparkline(values = sparklineData, lineColor = statusColor)
            }

            Spacer(modifier = Modifier.height(4.dp))

            Surface(
                color = statusColor.copy(alpha = 0.12f),
                shape = RoundedCornerShape(4.dp)
            ) {
                Text(
                    text = status,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = statusColor,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
        }
    }
}

@Composable
private fun CuratedWellnessSection(
    packages: List<CatalogItem>,
    onSelectItem: (CatalogItem) -> Unit
) {
    Column {
        Text(
            text = "Curated Wellness Plans",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Slate900,
            modifier = Modifier.padding(horizontal = 16.dp)
        )
        Text(
            text = "NABL accredited health checkups with free home collection",
            fontSize = 11.sp,
            color = Slate500,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            packages.forEach { pkg ->
                Card(
                    modifier = Modifier
                        .width(220.dp)
                        .clickable { onSelectItem(pkg) },
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(MedTealLight),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Bolt, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(18.dp))
                            }
                            Surface(color = EmeraldLight, shape = RoundedCornerShape(4.dp)) {
                                Text("NABL Lab", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(pkg.name, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate900, maxLines = 1)
                        Text(pkg.tagline ?: "${pkg.testCount ?: 80} Tests Included", fontSize = 11.sp, color = Slate500, maxLines = 2, modifier = Modifier.height(30.dp))

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("₹${pkg.price}", fontSize = 16.sp, fontWeight = FontWeight.Black, color = MedTealPrimary)
                                if (pkg.mrp > pkg.price) {
                                    Text("₹${pkg.mrp}", fontSize = 11.sp, color = Slate400, textDecoration = TextDecoration.LineThrough)
                                }
                            }

                            Button(
                                onClick = { onSelectItem(pkg) },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Text("+ Add", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DiseaseAndVitalBiomarkersSection(
    onSelectItem: (CatalogItem) -> Unit
) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Text("Disease & Vital Biomarkers", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Slate900)
        Text("Targeted blood screenings with same-day digital reporting", fontSize = 11.sp, color = Slate500)

        Spacer(modifier = Modifier.height(10.dp))

        val items = listOf(
            Triple("Diabetes HbA1c + Fasting Sugar", "DISEASE BASED", 499),
            Triple("Cardiac Lipid Risk Profile", "DISEASE BASED", 549),
            Triple("Vitamin D3 & B12 Vital Pair", "VITAL BASED", 799),
            Triple("Complete Blood Count (CBC 24 Params)", "VITAL BASED", 299),
            Triple("Liver & Kidney Comprehensive (LFT + KFT)", "DISEASE BASED", 799)
        )

        items.forEach { (name, category, price) ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clickable {
                        onSelectItem(
                            CatalogItem(
                                id = "test_${name.take(6)}",
                                name = name,
                                category = category,
                                price = price,
                                mrp = price + 300,
                                sampleType = "SERUM + EDTA",
                                fasting = "YES",
                                itemType = "TEST"
                            )
                        )
                    },
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(CircleShape)
                                .background(MedTealLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.WaterDrop, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(16.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            Text(category, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                        }
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("₹$price", fontSize = 14.sp, fontWeight = FontWeight.Black, color = MedTealPrimary)
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(MedTealPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun AgeAndConcernSection(
    onOpenCatalog: () -> Unit
) {
    Column {
        Text(
            text = "Age-Based & Health Concern Finder",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Slate900,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            listOf(
                Triple("20–35 Yrs", "Men & Women Energy", "₹999"),
                Triple("35–50 Yrs", "Metabolic & Cardiac Care", "₹1,499"),
                Triple("50+ Yrs", "Senior Citizen Geriatric", "₹1,899"),
                Triple("Concern", "Hair Fall & Skin Health", "₹799"),
                Triple("Concern", "Fatigue & Gut Wellness", "₹899")
            ).forEach { (age, label, price) ->
                Card(
                    modifier = Modifier
                        .width(155.dp)
                        .clickable { onOpenCatalog() },
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Surface(color = MedTealLight, shape = RoundedCornerShape(4.dp)) {
                            Text(age, fontSize = 9.sp, fontWeight = FontWeight.Black, color = MedTealPrimary, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(label, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900, maxLines = 1)
                        Text(price, fontSize = 13.sp, fontWeight = FontWeight.Black, color = MedTealDark)
                    }
                }
            }
        }
    }
}

@Composable
private fun PopularPathologySection(
    tests: List<CatalogItem>,
    onSelectItem: (CatalogItem) -> Unit,
    onSeeAll: () -> Unit
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Popular Pathology Tests", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Slate900)
                Text("Click any item to view parameters & smart package savings", fontSize = 11.sp, color = Slate500)
            }
            Text("See All →", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary, modifier = Modifier.clickable { onSeeAll() })
        }

        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            tests.take(8).forEach { item ->
                Card(
                    modifier = Modifier
                        .width(175.dp)
                        .clickable { onSelectItem(item) },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Surface(color = MedTealLight, shape = RoundedCornerShape(4.dp)) {
                                Text(item.displayItemType, fontSize = 8.sp, fontWeight = FontWeight.Black, color = MedTealDark, modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                            }
                            if (item.calculatedDiscount > 0) {
                                Text("${item.calculatedDiscount}% OFF", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(item.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900, maxLines = 2, modifier = Modifier.height(34.dp))

                        Text("${item.displaySample} • ${if (item.requiresFasting) "Fasting" else "No Fasting"}", fontSize = 10.sp, color = Slate500, maxLines = 1)

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("₹${item.price}", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                            Button(
                                onClick = { onSelectItem(item) },
                                shape = RoundedCornerShape(6.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text("+ Add", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun LivePhlebotomistTrackerBanner(
    onTrackClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clickable { onTrackClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = androidx.compose.foundation.BorderStroke(1.5.dp, EmeraldLight)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(color = EmeraldLight, shape = RoundedCornerShape(6.dp)) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(EmeraldAccent))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Phlebotomist Enroute", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                    }
                }

                Text("ETA: 25 Mins", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text("Ramesh Kumar (Certified Phlebotomist • AG-01)", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate900)
            Text("Home Pickup: Plot 42, Air Bypass Road, Tirupati", fontSize = 12.sp, color = Slate500)

            Spacer(modifier = Modifier.height(10.dp))

            Button(
                onClick = onTrackClick,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MedTealLight)
            ) {
                Icon(Icons.Default.LocationOn, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Track Phlebotomist on Live Map", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
            }
        }
    }
}
