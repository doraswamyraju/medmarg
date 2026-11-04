package com.medmarg.patient.ui.agent.sheets

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.model.PhleboVitalsRecord
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

// =========================================================================
// 🩺 AGENT BEDSIDE PRE-COLLECTION VITALS RECORDING SHEET
// 1-on-1 replication of ios/Agent/Sheets/AgentPreCollectionVitalsSheet.swift
// =========================================================================

@Composable
fun AgentPreCollectionVitalsSheet(
    order: AgentPickupOrder,
    onDismiss: () -> Unit,
    onVitalsRecorded: (PhleboVitalsRecord) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()

    var systolic by remember { mutableStateOf(order.phleboVitals?.bp?.substringBefore("/") ?: "120") }
    var diastolic by remember { mutableStateOf(order.phleboVitals?.bp?.substringAfter("/", "80") ?: "80") }
    var pulse by remember { mutableStateOf(order.phleboVitals?.pulse ?: "74") }
    var spo2 by remember { mutableStateOf(order.phleboVitals?.spo2?.replace("%", "") ?: "98") }
    var bloodSugar by remember { mutableStateOf(order.phleboVitals?.sugar ?: "") }
    var bodyTemp by remember { mutableStateOf(order.phleboVitals?.temp?.replace("°F", "") ?: "98.4") }
    var clinicalNotes by remember { mutableStateOf(order.phleboVitals?.notes ?: "") }
    var isSubmitting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 36.dp),
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
            color = Slate50
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(PureWhite)
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Cancel",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate600,
                        modifier = Modifier.clickable { onDismiss() }
                    )
                    Text(
                        text = "Bedside Vitals Check",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )
                    Spacer(modifier = Modifier.width(42.dp))
                }

                HorizontalDivider(color = Slate200)

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Patient Summary Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(46.dp)
                                    .clip(CircleShape)
                                    .background(MedTealPrimary.copy(alpha = 0.12f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.MonitorHeart, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(22.dp))
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(order.effectivePatientName, fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                                Text("Pre-Sample Clinical Baseline Assessment", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate500)
                            }
                        }
                    }

                    errorMessage?.let { err ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(RoseError.copy(alpha = 0.1f))
                                .padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Warning, contentDescription = null, tint = RoseError, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(err, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = RoseError)
                        }
                    }

                    // 1. Blood Pressure
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Icon(Icons.Default.Speed, contentDescription = null, tint = RoseError, modifier = Modifier.size(18.dp))
                                Text("Blood Pressure (mmHg) *", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            }

                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                OutlinedTextField(
                                    value = systolic,
                                    onValueChange = { systolic = it },
                                    label = { Text("Systolic") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    modifier = Modifier.weight(1f),
                                    singleLine = true
                                )
                                Text("/", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Slate500)
                                OutlinedTextField(
                                    value = diastolic,
                                    onValueChange = { diastolic = it },
                                    label = { Text("Diastolic") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    modifier = Modifier.weight(1f),
                                    singleLine = true
                                )
                            }
                        }
                    }

                    // 2. Pulse & SpO2
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = PureWhite),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                        ) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Icon(Icons.Default.Favorite, contentDescription = null, tint = RoseError, modifier = Modifier.size(15.dp))
                                    Text("Pulse (BPM)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                }
                                OutlinedTextField(
                                    value = pulse,
                                    onValueChange = { pulse = it },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    singleLine = true
                                )
                            }
                        }

                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = PureWhite),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                        ) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Icon(Icons.Default.Air, contentDescription = null, tint = Color(0xFF2563EB), modifier = Modifier.size(15.dp))
                                    Text("SpO2 (%)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                }
                                OutlinedTextField(
                                    value = spo2,
                                    onValueChange = { spo2 = it },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    singleLine = true
                                )
                            }
                        }
                    }

                    // 3. Body Temp & Sugar
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = PureWhite),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                        ) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Icon(Icons.Default.Thermostat, contentDescription = null, tint = Color(0xFFF97316), modifier = Modifier.size(15.dp))
                                    Text("Temp (°F)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                }
                                OutlinedTextField(
                                    value = bodyTemp,
                                    onValueChange = { bodyTemp = it },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                    singleLine = true
                                )
                            }
                        }

                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = PureWhite),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                        ) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Icon(Icons.Default.WaterDrop, contentDescription = null, tint = Color(0xFF9333EA), modifier = Modifier.size(15.dp))
                                    Text("Sugar (mg/dL)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                }
                                OutlinedTextField(
                                    value = bloodSugar,
                                    onValueChange = { bloodSugar = it },
                                    placeholder = { Text("Optional", fontSize = 12.sp) },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    singleLine = true
                                )
                            }
                        }
                    }

                    // 4. Clinical Notes
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("Patient Fasting & Clinical Notes", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate700)
                            OutlinedTextField(
                                value = clinicalNotes,
                                onValueChange = { clinicalNotes = it },
                                placeholder = { Text("e.g. 10 hours fasting confirmed, calm demeanor", fontSize = 12.sp) },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }

                    // Save Button
                    Button(
                        onClick = {
                            if (systolic.isBlank() || diastolic.isBlank()) {
                                errorMessage = "Please enter Blood Pressure readings."
                                return@Button
                            }
                            coroutineScope.launch {
                                isSubmitting = true
                                val isoTime = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
                                val record = PhleboVitalsRecord(
                                    recordedAt = isoTime,
                                    bp = "$systolic/$diastolic",
                                    pulse = pulse,
                                    spo2 = "$spo2%",
                                    sugar = bloodSugar.ifBlank { null },
                                    temp = "${bodyTemp}°F",
                                    notes = clinicalNotes
                                )
                                AgentRepository.updatePickupStatus(
                                    orderId = order.id,
                                    status = "ARRIVED",
                                    vitals = record
                                )
                                isSubmitting = false
                                onVitalsRecorded(record)
                                onDismiss()
                            }
                        },
                        enabled = !isSubmitting,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text(
                            text = if (isSubmitting) "Saving Vitals..." else "Confirm Vitals & Proceed to Sample Draw →",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = PureWhite,
                            modifier = Modifier.padding(vertical = 6.dp)
                        )
                    }
                }
            }
        }
    }
}

