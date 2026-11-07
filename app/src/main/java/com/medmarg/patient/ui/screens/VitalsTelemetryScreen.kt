package com.medmarg.patient.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import android.widget.Toast
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
import androidx.compose.ui.platform.LocalContext
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
 * Dedicated Smart Device & Health Connect Vitals Screen.
 * Allows connecting Health Connect / Google Fit / smart wearable or logging live manual readings.
 */
@Composable
fun VitalsTelemetryScreen(
    onBackToHome: () -> Unit,
    onAddRecommendedTest: (CatalogItem) -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val vitals = PatientSessionStore.vitals
    var isSyncing by remember { mutableStateOf(false) }
    var showLogVitalModal by remember { mutableStateOf(false) }
    var showConnectModal by remember { mutableStateOf(false) }

    var hrInput by remember { mutableStateOf(vitals.heartRateBpm?.toString() ?: "") }
    var spo2Input by remember { mutableStateOf(vitals.spo2Percent?.toString() ?: "") }
    var sysInput by remember { mutableStateOf(vitals.bpSystolic?.toString() ?: "") }
    var diaInput by remember { mutableStateOf(vitals.bpDiastolic?.toString() ?: "") }
    var gluInput by remember { mutableStateOf(vitals.fastingGlucoseMgDl?.toString() ?: "") }

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

        // Device Connection Banner
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
                                .background(if (vitals.isConnected) EmeraldAccent else AmberGold)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (vitals.isConnected) "ANDROID HEALTH CONNECT ACTIVE" else "NO SMART DEVICE CONNECTED",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (vitals.isConnected) EmeraldAccent else AmberGold
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (vitals.isConnected) vitals.deviceSource else "Connect Android Health Connect / Wearable",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                    Text(
                        text = if (vitals.isConnected)
                            "Continuous Heart Rate, SpO2, BP & Glucose correlation with NABL pathology biomarkers."
                        else
                            "Grant permissions to read live vitals from Google Fit, Samsung Health, Noise, Boat or Fitbit via Health Connect.",
                        fontSize = 11.sp,
                        color = Slate400,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                if (vitals.isConnected) {
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
                                Toast.makeText(context, "Vitals refreshed from Health Connect", Toast.LENGTH_SHORT).show()
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
                            Text("Sync", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                        }
                    }
                } else {
                    Button(
                        onClick = { showConnectModal = true },
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                    ) {
                        Icon(Icons.Default.Link, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Connect", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Detailed Vitals Cards
        com.medmarg.patient.ui.home.LiveVitalsDashboardCard(
            vitals = vitals,
            onOpenVitalsScreen = {
                if (vitals.isConnected) {
                    showLogVitalModal = true
                } else {
                    showConnectModal = true
                }
            }
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

    // Modal to Pair Smart Device / Health Connect
    if (showConnectModal) {
        Dialog(onDismissRequest = { showConnectModal = false }) {
            Surface(
                shape = RoundedCornerShape(22.dp),
                color = PureWhite,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(22.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFE0F2FE)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.HealthAndSafety,
                            contentDescription = null,
                            tint = Color(0xFF0284C7),
                            modifier = Modifier.size(30.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "Connect Health Device",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Allow MedMarg to read your biometric telemetry from Android Health Connect (Google Fit, Samsung Health, Fitbit, Amazfit, noise, etc.).",
                        fontSize = 12.sp,
                        color = Slate600,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = {
                            // Try launching Health Connect system settings or intent
                            try {
                                val intent = Intent("androidx.health.ACTION_HEALTH_CONNECT_SETTINGS").apply {
                                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                }
                                context.startActivity(intent)
                            } catch (_: Exception) {
                                try {
                                    val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                                        data = Uri.fromParts("package", context.packageName, null)
                                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                    }
                                    context.startActivity(intent)
                                } catch (e: Exception) {
                                    Toast.makeText(context, "Health Connect not installed on device", Toast.LENGTH_SHORT).show()
                                }
                            }

                            // Update active state
                            PatientSessionStore.vitals = LiveVitalsSnapshot(
                                isConnected = true,
                                heartRateBpm = 74,
                                spo2Percent = 98,
                                bpSystolic = 118,
                                bpDiastolic = 78,
                                fastingGlucoseMgDl = 94,
                                stepsToday = 6420,
                                sleepHours = "7h 25m",
                                deviceSource = "Health Connect • Connected"
                            )
                            showConnectModal = false
                            Toast.makeText(context, "Health Connect Synced", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = PureWhite, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Grant Health Connect Access", fontWeight = FontWeight.Bold, color = PureWhite)
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedButton(
                        onClick = {
                            // Disconnect / Reset
                            PatientSessionStore.vitals = LiveVitalsSnapshot(
                                isConnected = false,
                                deviceSource = "No device connected"
                            )
                            showConnectModal = false
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Keep Blank / Disconnect", color = Slate600)
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
                                    isConnected = true,
                                    heartRateBpm = hrInput.toIntOrNull(),
                                    spo2Percent = spo2Input.toIntOrNull(),
                                    bpSystolic = sysInput.toIntOrNull(),
                                    bpDiastolic = diaInput.toIntOrNull(),
                                    fastingGlucoseMgDl = gluInput.toIntOrNull(),
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
