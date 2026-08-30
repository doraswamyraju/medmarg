package com.medmarg.patient.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DoctorDashboardScreen(
    onSwitchRole: () -> Unit = {}
) {
    var activeTab by remember { mutableStateOf("PATIENTS") } // PATIENTS | PRESCRIBE | REPORTS | OPD | EARNINGS
    var showAddPatientDialog by remember { mutableStateOf(false) }

    val deepIndigo = Color(0xFF1E1B4B)
    val purplePrimary = Color(0xFF6366F1)
    val purpleLight = Color(0xFFEDE9FE)

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "DOCTOR CLINICAL WORKDESK",
                            color = Color(0xFFC7D2FE),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = "Dr. Ananya Sharma, MD",
                            color = PureWhite,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                },
                actions = {
                    Button(
                        onClick = onSwitchRole,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF312E81)),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Switch Role", color = Color(0xFFFDE047), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = deepIndigo)
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Slate50)
                .padding(innerPadding)
        ) {
            // Tab Row
            ScrollableTabRow(
                selectedTabIndex = when (activeTab) {
                    "PATIENTS" -> 0
                    "PRESCRIBE" -> 1
                    "REPORTS" -> 2
                    "OPD" -> 3
                    "EARNINGS" -> 4
                    else -> 0
                },
                containerColor = deepIndigo,
                contentColor = Color(0xFFFDE047),
                edgePadding = 12.dp
            ) {
                Tab(selected = activeTab == "PATIENTS", onClick = { activeTab = "PATIENTS" }, text = { Text("My Patients (3)") })
                Tab(selected = activeTab == "PRESCRIBE", onClick = { activeTab = "PRESCRIBE" }, text = { Text("Prescribe Tests") })
                Tab(selected = activeTab == "REPORTS", onClick = { activeTab = "REPORTS" }, text = { Text("Reports Archive") })
                Tab(selected = activeTab == "OPD", onClick = { activeTab = "OPD" }, text = { Text("OPD Queue (3)") })
                Tab(selected = activeTab == "EARNINGS", onClick = { activeTab = "EARNINGS" }, text = { Text("Earnings") })
            }

            // PATIENTS DIRECTORY
            if (activeTab == "PATIENTS") {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        Button(
                            onClick = { showAddPatientDialog = true },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = purplePrimary),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.PersonAdd, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Add Patient to Registry", fontWeight = FontWeight.Bold)
                        }
                    }

                    items(listOf(
                        Triple("Rahul Sharma (34y, M)", "+91 98765 43210", "Plot 42, Air Bypass Rd, Tirupati"),
                        Triple("K. Srinivasa Rao (58y, M)", "+91 98765 88990", "SVIMS Staff Quarters, Tirupati"),
                        Triple("Lakshmi Narayana (46y, F)", "+91 98765 11223", "Tiruchanoor Road, Tirupati")
                    )) { (name, phone, addr) ->
                        Card(
                            colors = CardDefaults.cardColors(containerColor = PureWhite),
                            shape = RoundedCornerShape(12.dp),
                            elevation = CardDefaults.cardElevation(2.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(name, fontWeight = FontWeight.Bold, color = Slate900, fontSize = 15.sp)
                                    Surface(color = EmeraldLight, shape = RoundedCornerShape(4.dp)) {
                                        Text("✓ App Access", color = EmeraldAccent, fontWeight = FontWeight.Bold, fontSize = 10.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                                    }
                                }
                                Text("📞 $phone", color = Slate600, fontSize = 12.sp, modifier = Modifier.padding(top = 2.dp))
                                Text("📍 $addr", color = Slate500, fontSize = 12.sp)
                                Spacer(modifier = Modifier.height(10.dp))
                                Button(
                                    onClick = { activeTab = "PRESCRIBE" },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(containerColor = purplePrimary),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Icon(Icons.Default.Science, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Prescribe Pathology Tests", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            // PRESCRIBE TESTS & CUSTOM PRICING
            if (activeTab == "PRESCRIBE") {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = PureWhite),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.border(1.5.dp, purplePrimary, RoundedCornerShape(14.dp))
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text("PATIENT: Rahul Sharma (34y, M)", fontWeight = FontWeight.Bold, color = Slate900, fontSize = 14.sp)
                                Text("Home Collection: Plot 42, Air Bypass Road, Tirupati", color = Slate500, fontSize = 12.sp)
                                Spacer(modifier = Modifier.height(10.dp))
                                Text("Selected Prescriptions:", fontWeight = FontWeight.Bold, color = purplePrimary, fontSize = 13.sp)
                                Text("1. Thyroid Profile Total (Lab Cost: ₹349 | Your Price: ₹450)", color = Slate700, fontSize = 12.sp)
                                Text("2. Complete Lipid Profile (Lab Cost: ₹449 | Your Price: ₹550)", color = Slate700, fontSize = 12.sp)
                                Spacer(modifier = Modifier.height(10.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column {
                                        Text("Total You Pay Lab: ₹798", color = Color(0xFFB45309), fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                        Text("Patient Price: ₹1,000 (Margin: ₹202)", color = EmeraldAccent, fontWeight = FontWeight.Black, fontSize = 14.sp)
                                    }
                                }
                                Spacer(modifier = Modifier.height(10.dp))
                                Button(
                                    onClick = { activeTab = "REPORTS" },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(containerColor = purplePrimary),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Pay Lab Cost (₹798) & Dispatch Phlebotomist", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                }
                            }
                        }
                    }
                }
            }

            // REPORTS ARCHIVE
            if (activeTab == "REPORTS") {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(listOf(
                        Triple("Rahul Sharma", "Aarogyam Complete 1.3", "Report Ready (Google Drive)"),
                        Triple("K. Srinivasa Rao", "Lipid Profile + HbA1c", "Report Ready (Google Drive)")
                    )) { (pat, tests, status) ->
                        Card(colors = CardDefaults.cardColors(containerColor = PureWhite), shape = RoundedCornerShape(12.dp)) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(pat, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Slate900)
                                Text(tests, color = Slate600, fontSize = 12.sp)
                                Spacer(modifier = Modifier.height(6.dp))
                                Surface(color = EmeraldLight, shape = RoundedCornerShape(6.dp)) {
                                    Text("✓ $status", color = EmeraldAccent, fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                                }
                            }
                        }
                    }
                }
            }

            // OPD QUEUE
            if (activeTab == "OPD") {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(listOf(
                        Triple("Token #1", "Rahul Sharma (4:30 PM)", "In Consultation"),
                        Triple("Token #2", "K. Srinivasa Rao (4:45 PM)", "Waiting"),
                        Triple("Token #3", "Venkatamma G. (5:00 PM)", "Waiting")
                    )) { (token, pat, status) ->
                        Card(colors = CardDefaults.cardColors(containerColor = PureWhite), shape = RoundedCornerShape(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(14.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(token, color = purplePrimary, fontWeight = FontWeight.Black, fontSize = 15.sp)
                                    Text(pat, color = Slate900, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                }
                                Surface(color = if (status == "In Consultation") EmeraldLight else Slate100, shape = RoundedCornerShape(6.dp)) {
                                    Text(status, color = if (status == "In Consultation") EmeraldAccent else Slate600, fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                                }
                            }
                        }
                    }
                }
            }

            // EARNINGS
            if (activeTab == "EARNINGS") {
                Column(
                    modifier = Modifier.fillMaxSize().padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, tint = purplePrimary, modifier = Modifier.size(54.dp))
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("Total Clinic Earnings: ₹39,350", fontWeight = FontWeight.Black, fontSize = 20.sp, color = Slate900)
                    Text("Tests Margin: ₹14,850 • OPD Fees: ₹24,500", color = Slate500, fontSize = 13.sp)
                }
            }

        }
    }
}
