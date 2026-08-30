package com.medmarg.patient.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboardScreen(
    onSwitchRole: () -> Unit = {}
) {
    var activeMainTab by remember { mutableStateOf("TESTS_CATALOG") }
    // Sub-tabs
    var testsSubTab by remember { mutableStateOf("TESTS") } // TESTS | PACKAGES | CATEGORIES
    var labsSubTab by remember { mutableStateOf("ACTIVE_LABS") } // ACTIVE_LABS | REQUESTS | COMMISSIONS | NABL
    var agentsSubTab by remember { mutableStateOf("LIVE_MAP") } // LIVE_MAP | REQUESTS | TRACKER | COLD_CHAIN
    var inventorySubTab by remember { mutableStateOf("STOCK") } // STOCK | DISPATCH | PO | USAGE

    // Interactive State
    var showAddTestDialog by remember { mutableStateOf(false) }
    var showIssueKitDialog by remember { mutableStateOf(false) }

    val darkNavy = Color(0xFF0F172A)
    val cardNavy = Color(0xFF1E293B)
    val goldAmber = Color(0xFFF59E0B)

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "SUPER ADMIN CONSOLE",
                                color = goldAmber,
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Black
                            )
                        }
                        Text(
                            text = "Central Processing Lab & Governance",
                            color = PureWhite,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                },
                actions = {
                    Button(
                        onClick = onSwitchRole,
                        colors = ButtonDefaults.buttonColors(containerColor = cardNavy),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text("Switch Role", color = goldAmber, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = darkNavy)
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0B132B))
                .padding(innerPadding)
        ) {
            // Main Module Scrollable Pills Bar
            ScrollableTabRow(
                selectedTabIndex = when (activeMainTab) {
                    "TESTS_CATALOG" -> 0
                    "DOCTOR_ORDERS" -> 1
                    "LABS" -> 2
                    "AGENTS" -> 3
                    "INVENTORY" -> 4
                    else -> 0
                },
                containerColor = darkNavy,
                contentColor = goldAmber,
                edgePadding = 12.dp
            ) {
                Tab(
                    selected = activeMainTab == "TESTS_CATALOG",
                    onClick = { activeMainTab = "TESTS_CATALOG" },
                    text = { Text("Tests & Packages", fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = activeMainTab == "DOCTOR_ORDERS",
                    onClick = { activeMainTab = "DOCTOR_ORDERS" },
                    text = { Text("Doctor Orders (2)", fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = activeMainTab == "LABS",
                    onClick = { activeMainTab = "LABS" },
                    text = { Text("Partner Labs", fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = activeMainTab == "AGENTS",
                    onClick = { activeMainTab = "AGENTS" },
                    text = { Text("Collection Agents", fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = activeMainTab == "INVENTORY",
                    onClick = { activeMainTab = "INVENTORY" },
                    text = { Text("Medical Inventory", fontWeight = FontWeight.Bold) }
                )
            }

            // ==================== 1. TESTS CATALOG & PRICING ====================
            if (activeMainTab == "TESTS_CATALOG") {
                // Sub-tabs row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(
                        "TESTS" to "Individual Tests (104)",
                        "PACKAGES" to "Packages Studio",
                        "CATEGORIES" to "Categories (11)"
                    ).forEach { (key, label) ->
                        val isSel = testsSubTab == key
                        Surface(
                            color = if (isSel) MedTealPrimary else cardNavy,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { testsSubTab = key }
                        ) {
                            Text(
                                text = label,
                                color = if (isSel) PureWhite else Slate400,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(vertical = 8.dp),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }
                    }
                }

                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    if (testsSubTab == "TESTS") {
                        item {
                            Button(
                                onClick = { showAddTestDialog = true },
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Create & Publish New Test", fontWeight = FontWeight.Bold)
                            }
                        }

                        items(listOf(
                            Triple("Aarogyam Complete 1.3 (Full Body)", 1499, 3500),
                            Triple("Thyroid Profile Total (T3/T4/TSH)", 349, 600),
                            Triple("Complete Lipid Profile (8 Params)", 449, 850),
                            Triple("Liver Function Test (LFT 11 Params)", 599, 1100),
                            Triple("Kidney Function Screen (KFT/RFT)", 549, 950),
                            Triple("Vitamin D 25-Hydroxy Total", 699, 1400)
                        )) { (name, price, mrp) ->
                            Card(
                                colors = CardDefaults.cardColors(containerColor = cardNavy),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(14.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(name, color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                        Text("Lab Cost: ₹$price • MRP: ₹$mrp", color = Slate400, fontSize = 12.sp)
                                    }
                                    Row {
                                        IconButton(onClick = { /* Edit */ }) {
                                            Icon(Icons.Default.Edit, contentDescription = "Edit", tint = CyanAccent, modifier = Modifier.size(18.dp))
                                        }
                                        IconButton(onClick = { /* Delete */ }) {
                                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFEF4444), modifier = Modifier.size(18.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (testsSubTab == "PACKAGES") {
                        item {
                            Card(
                                colors = CardDefaults.cardColors(containerColor = cardNavy),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier.border(1.5.dp, goldAmber, RoundedCornerShape(14.dp))
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Text("HEALTH PACKAGE BUNDLER", color = goldAmber, fontWeight = FontWeight.Black, fontSize = 12.sp)
                                    Text("Aarogyam Master Health Checkup", color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                    Text("Includes: Thyroid, Lipid, LFT, KFT, Vitamin D & CBC (104 Biomarkers)", color = Slate400, fontSize = 12.sp)
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column {
                                            Text("Deal Price: ₹1,499", color = goldAmber, fontWeight = FontWeight.Black, fontSize = 16.sp)
                                            Text("MRP: ₹3,500 (57% OFF)", color = EmeraldAccent, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                        }
                                        Button(
                                            onClick = {},
                                            colors = ButtonDefaults.buttonColors(containerColor = goldAmber),
                                            shape = RoundedCornerShape(8.dp)
                                        ) {
                                            Text("Edit Bundle", color = darkNavy, fontWeight = FontWeight.Black, fontSize = 12.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (testsSubTab == "CATEGORIES") {
                        items(listOf(
                            "Thyroid & Hormones", "Lipid & Cardiac Risk", "Liver & Digestive Care",
                            "Kidney & Renal Health", "Vitamins & Minerals", "Diabetes Monitoring",
                            "Complete Hemogram & Blood", "Infertility & Reproductive"
                        )) { cat ->
                            Card(
                                colors = CardDefaults.cardColors(containerColor = cardNavy),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(12.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(cat, color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Icon(Icons.Default.Edit, contentDescription = null, tint = CyanAccent, modifier = Modifier.size(16.dp))
                                }
                            }
                        }
                    }
                }
            }

            // ==================== 2. DOCTOR PRESCRIBED ORDERS QUEUE ====================
            if (activeMainTab == "DOCTOR_ORDERS") {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        Text(
                            "Doctor Orders Queue (B2B Lab Settlements)",
                            color = PureWhite,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    items(listOf(
                        Triple("Dr. Ananya Sharma", "Rahul Sharma (Air Bypass Rd, Tirupati)", "Thyroid Total + Lipid Complete"),
                        Triple("Dr. Rajeshwar Rao", "K. Srinivasa Rao (SVIMS Rd, Tirupati)", "Cardiac Risk + HbA1c Glycated")
                    )) { (doc, pat, tests) ->
                        Card(
                            colors = CardDefaults.cardColors(containerColor = cardNavy),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(doc, color = Color(0xFFC084FC), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    Text("✓ PAID TO LAB", color = EmeraldAccent, fontWeight = FontWeight.Black, fontSize = 11.sp)
                                }
                                Text("Patient: $pat", color = PureWhite, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                                Text("Tests: $tests", color = Slate400, fontSize = 12.sp)
                                Spacer(modifier = Modifier.height(8.dp))
                                Button(
                                    onClick = { /* Dual report upload */ },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Icon(Icons.Default.CloudUpload, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Upload Report & Sync to Doctor + Patient", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            // ==================== 3. PARTNER LABS ====================
            if (activeMainTab == "LABS") {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        Text("Accredited Partner Labs & Processing Hubs", color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }

                    items(listOf(
                        Triple("Thyrocare Central Processing Lab", "NABL-CC-4921 (Mumbai / Pan-India)", "Margin: 15%"),
                        Triple("Apollo Diagnostics Tirupati Hub", "NABL-AP-8921 (Air Bypass Rd)", "Margin: 18%"),
                        Triple("Dr. Lal PathLabs Center", "NABL-AP-3104 (Renigunta Rd)", "Margin: 15%")
                    )) { (name, cert, margin) ->
                        Card(colors = CardDefaults.cardColors(containerColor = cardNavy), shape = RoundedCornerShape(12.dp)) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(name, color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(cert, color = CyanAccent, fontSize = 12.sp)
                                Text(margin, color = goldAmber, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }

            // ==================== 4. COLLECTION AGENTS (FLEET) ====================
            if (activeMainTab == "AGENTS") {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = cardNavy),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.border(1.5.dp, MedTealPrimary, RoundedCornerShape(14.dp))
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(EmeraldAccent))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("TIRUPATI LIVE FLEET GPS TRACKER", color = MedTealLight, fontWeight = FontWeight.Black, fontSize = 12.sp)
                                }
                                Text("3 Collection Agents Active in Tirupati Grid", color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                Text("Real-time IoT BLE Box Temperature Monitor (2°-8°C)", color = Slate400, fontSize = 12.sp)
                            }
                        }
                    }

                    items(listOf(
                        Triple("Ramesh Kumar (AG-01)", "Route: Air Bypass & Alipiri", "Box: 4.2°C • 9 Samples"),
                        Triple("Suresh Babu (AG-02)", "Route: Renigunta & Tiruchanoor", "Box: 3.8°C • 7 Samples"),
                        Triple("Venkat Reddy (AG-03)", "Route: Chandragiri & SVIMS", "Box: 4.5°C • 8 Samples")
                    )) { (agent, route, stats) ->
                        Card(colors = CardDefaults.cardColors(containerColor = cardNavy), shape = RoundedCornerShape(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(14.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(agent, color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    Text(route, color = CyanAccent, fontSize = 12.sp)
                                    Text(stats, color = EmeraldAccent, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                                Icon(Icons.Default.MyLocation, contentDescription = null, tint = goldAmber, modifier = Modifier.size(22.dp))
                            }
                        }
                    }
                }
            }

            // ==================== 5. MEDICAL INVENTORY & SUPPLIES ====================
            if (activeMainTab == "INVENTORY") {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        Button(
                            onClick = { showIssueKitDialog = true },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = goldAmber),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Send, contentDescription = null, tint = darkNavy, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Issue Supplies Kit to Collection Agent", color = darkNavy, fontWeight = FontWeight.Black)
                        }
                    }

                    items(listOf(
                        Triple("BD Vacutainer EDTA K2 Tubes (2ml)", "1,450 Tubes", "Min: 300"),
                        Triple("SST Gel & Clot Activator Tubes", "1,800 Tubes", "Min: 400"),
                        Triple("Nitrile Gloves Powder-Free (M)", "240 Boxes", "Min: 100"),
                        Triple("Sterile Syringes 5ml with 23G Needle", "950 Units", "Min: 250"),
                        Triple("Alcohol Swabs 70% Foil Packed", "3,200 Swabs", "Min: 800"),
                        Triple("Cold-Chain Reusable Ice Gel Packs", "85 Packs", "Min: 30")
                    )) { (item, qty, min) ->
                        Card(colors = CardDefaults.cardColors(containerColor = cardNavy), shape = RoundedCornerShape(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(14.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(item, color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Text(min, color = Slate400, fontSize = 11.sp)
                                }
                                Text(qty, color = EmeraldAccent, fontWeight = FontWeight.Black, fontSize = 14.sp)
                            }
                        }
                    }
                }
            }

        }
    }
}
