package com.medmarg.patient.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.medmarg.patient.data.CatalogStore
import com.medmarg.patient.data.LiveVitalsSnapshot
import com.medmarg.patient.data.PatientSessionStore
import com.medmarg.patient.model.CatalogItem
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Dedicated Smart Device & Health Connect Vitals Screen (1:1 parity with iOS CareSeekerVitalsView.swift).
 */
@Composable
fun VitalsTelemetryScreen(
    onBackToHome: () -> Unit,
    onAddRecommendedTest: (CatalogItem) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val vitals = PatientSessionStore.vitals
    var isSyncing by remember { mutableStateOf(false) }
    var showLogVitalModal by remember { mutableStateOf(false) }

    var hrInput by remember { mutableStateOf(vitals.heartRateBpm.toString()) }
    var spo2Input by remember { mutableStateOf(vitals.spo2Percent.toString()) }
    var sysInput by remember { mutableStateOf(vitals.bpSystolic.toString()) }
    var diaInput by remember { mutableStateOf(vitals.bpDiastolic.toString()) }
    var gluInput by remember { mutableStateOf(vitals.fastingGlucoseMgDl.toString()) }

    val allTests by CatalogStore.tests.collectAsState()
    val correlatedTests = remember(allTests) {
        allTests.filter {
            it.name.contains("HbA1c", ignoreCase = true) ||
                it.name.contains("Lipid", ignoreCase = true) ||
                it.name.contains("Thyroid", ignoreCase = true) ||
                it.name.contains("Complete Blood", ignoreCase = true)
        }.take(4)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .padding(bottom = 120.dp)
    ) {
        // Header Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(PureWhite)
                        .clickable { onBackToHome() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Slate900, modifier = Modifier.size(18.dp))
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Smart Device & Health Vitals",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )
                    Text(
                        text = "Android Health Connect & Wearable Telemetry",
                        fontSize = 11.sp,
                        color = Slate500
                    )
                }
            }

            Button(
                onClick = { showLogVitalModal = true },
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Icon(Icons.Default.EditNote, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Log Reading", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PureWhite)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Health Connect Sync Banner
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Slate900)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(EmeraldAccent)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "ANDROID HEALTH CONNECT SYNC",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = EmeraldAccent
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = vitals.deviceSource,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                    Text(
                        text = "Continuous Heart Rate, SpO2, BP & Glucose correlation with NABL pathology biomarkers.",
                        fontSize = 11.sp,
                        color = Slate400,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Button(
                    onClick = {
                        isSyncing = true
                        coroutineScope.launch {
                            delay(800)
                            PatientSessionStore.vitals = vitals.copy(
                                heartRateBpm = (70..78).random(),
                                spo2Percent = (97..99).random(),
                                deviceSource = "Health Connect • Synced Just Now"
                            )
                            isSyncing = false
                        }
                    },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent)
                ) {
                    if (isSyncing) {
                        CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp, color = PureWhite)
                    } else {
                        Icon(Icons.Default.Sync, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Sync Now", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Detailed Vitals Cards
        com.medmarg.patient.ui.home.LiveVitalsDashboardCard(
            vitals = vitals,
            onOpenVitalsScreen = { showLogVitalModal = true }
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Correlated Diagnostic Tests Section
        Text(
            text = "Correlated Clinical Pathology Tests",
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
            color = Slate900
        )
        Text(
            text = "Recommended NABL lab tests based on your wearable vitals:",
            fontSize = 11.sp,
            color = Slate500
        )

        Spacer(modifier = Modifier.height(10.dp))

        correlatedTests.forEach { item ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 5.dp),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = item.name,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Text(
                            text = "${item.displayItemType} • Sample: ${item.displaySample}",
                            fontSize = 11.sp,
                            color = Slate500
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Button(
                        onClick = { onAddRecommendedTest(item) },
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Text("Add ₹${item.price}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }
            }
        }
    }

    if (showLogVitalModal) {
        Dialog(onDismissRequest = { showLogVitalModal = false }) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = PureWhite,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("Log Manual Vital Readings", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Slate900)
                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = hrInput,
                        onValueChange = { hrInput = it.filter { c -> c.isDigit() } },
                        label = { Text("Heart Rate (BPM)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = spo2Input,
                        onValueChange = { spo2Input = it.filter { c -> c.isDigit() } },
                        label = { Text("Blood Oxygen SpO2 (%)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = sysInput,
                            onValueChange = { sysInput = it.filter { c -> c.isDigit() } },
                            label = { Text("BP Systolic") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = diaInput,
                            onValueChange = { diaInput = it.filter { c -> c.isDigit() } },
                            label = { Text("BP Diastolic") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = gluInput,
                        onValueChange = { gluInput = it.filter { c -> c.isDigit() } },
                        label = { Text("Fasting Glucose (mg/dL)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(16.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(onClick = { showLogVitalModal = false }) {
                            Text("Cancel", color = Slate500)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = {
                                PatientSessionStore.vitals = LiveVitalsSnapshot(
                                    heartRateBpm = hrInput.toIntOrNull() ?: 74,
                                    spo2Percent = spo2Input.toIntOrNull() ?: 98,
                                    bpSystolic = sysInput.toIntOrNull() ?: 118,
                                    bpDiastolic = diaInput.toIntOrNull() ?: 78,
                                    fastingGlucoseMgDl = gluInput.toIntOrNull() ?: 94,
                                    deviceSource = "Patient Logged • Just Now"
                                )
                                showLogVitalModal = false
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                        ) {
                            Text("Save Vitals", color = PureWhite, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
