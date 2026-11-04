package com.medmarg.patient.ui.agent

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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// 🏢 AGENT LAB HANDOVER VIEW (SPECIMEN BATCH CUSTODY TRANSFER)
// 1-on-1 replication of ios/Agent/Views/AgentLabHandoverView.swift
// =========================================================================

@Composable
fun AgentLabHandoverScreen(
    agentId: String,
    agentName: String,
    collectedOrders: List<AgentPickupOrder>,
    onDismiss: () -> Unit,
    onHandoverSuccess: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()

    val labReceivers = listOf(
        "Dr. S. Venkat (Chief Pathologist)",
        "K. Madhavi (Senior Lab Technician - MLT)",
        "R. Prakash (Accessioning Desk In-Charge)"
    )
    var selectedLabReceiver by remember { mutableStateOf(labReceivers[1]) }
    var handoverOtp by remember { mutableStateOf("") }
    var coldChainVerified by remember { mutableStateOf(true) }
    var hemolysisChecked by remember { mutableStateOf(true) }
    var barcodeManifestVerified by remember { mutableStateOf(true) }

    var isSubmitting by remember { mutableStateOf(false) }
    var showSuccessBanner by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 24.dp),
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
            color = Slate50
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Top Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(PureWhite)
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Close",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate600,
                        modifier = Modifier.clickable { onDismiss() }
                    )
                    Text("Lab Specimen Handover", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Spacer(modifier = Modifier.width(36.dp))
                }

                HorizontalDivider(color = Slate200)

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // 1. Cold-Chain & Lab Header Card
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(
                                Brush.linearGradient(
                                    listOf(MedTealDark, MedTealPrimary)
                                )
                            )
                            .padding(16.dp)
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(PureWhite.copy(alpha = 0.16f))
                                        .padding(horizontal = 8.dp, vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Icon(Icons.Default.AcUnit, contentDescription = null, tint = Color(0xFF67E8F9), modifier = Modifier.size(12.dp))
                                    Text("COLD CHAIN: 2°C - 8°C VERIFIED", fontSize = 9.sp, fontWeight = FontWeight.Black, color = Color(0xFF67E8F9))
                                }

                                Text("Hub ID: TPT-LAB-01", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = PureWhite.copy(alpha = 0.8f))
                            }

                            Text("MedMarg Regional NABL Processing Hub", fontSize = 16.sp, fontWeight = FontWeight.Black, color = PureWhite)
                            Text("Tirupati Central Accessioning Desk • Gate 2", fontSize = 11.sp, color = PureWhite.copy(alpha = 0.8f))

                            Row(horizontalArrangement = Arrangement.spacedBy(14.dp), modifier = Modifier.padding(top = 4.dp)) {
                                Column {
                                    Text("${collectedOrders.size}", fontSize = 16.sp, fontWeight = FontWeight.Black, color = PureWhite)
                                    Text("Orders Ready", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = PureWhite.copy(alpha = 0.75f))
                                }
                                Column {
                                    Text("${collectedOrders.size * 2}", fontSize = 16.sp, fontWeight = FontWeight.Black, color = PureWhite)
                                    Text("Vacutainers", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = PureWhite.copy(alpha = 0.75f))
                                }
                                Column {
                                    Text("4.2°C", fontSize = 16.sp, fontWeight = FontWeight.Black, color = PureWhite)
                                    Text("Bag Temp", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = PureWhite.copy(alpha = 0.75f))
                                }
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

                    if (showSuccessBanner) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = PureWhite),
                            border = androidx.compose.foundation.BorderStroke(1.5.dp, EmeraldAccent.copy(alpha = 0.4f))
                        ) {
                            Column(
                                modifier = Modifier.padding(24.dp).fillMaxWidth(),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Icon(Icons.Default.Verified, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(48.dp))
                                Text("Specimen Custody Transferred!", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Slate900)
                                Text(
                                    "All vacutainers have been logged at the Lab Accessioning Desk under $selectedLabReceiver. Automated analyzer processing has begun.",
                                    fontSize = 12.sp,
                                    color = Slate500,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    } else if (collectedOrders.isEmpty()) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = PureWhite)
                        ) {
                            Column(
                                modifier = Modifier.padding(28.dp).fillMaxWidth(),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MedTealPrimary.copy(alpha = 0.6f), modifier = Modifier.size(44.dp))
                                Text("No Pending Specimens in Bag", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                                Text(
                                    "All collected samples have already been handed over to the laboratory.",
                                    fontSize = 12.sp,
                                    color = Slate500,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    } else {
                        // 2. Specimens Awaiting Handover List
                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Text("SPECIMENS IN COLD BAG (${collectedOrders.size})", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)
                            collectedOrders.forEach { order ->
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(40.dp)
                                                .clip(CircleShape)
                                                .background(MedTealLight),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(Icons.Default.Science, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(18.dp))
                                        }
                                        Column(modifier = Modifier.weight(1f)) {
                                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                                                Text("#${order.id}", fontSize = 11.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Monospace, color = MedTealPrimary)
                                                Text("•", color = Slate400)
                                                Text(order.effectivePatientName, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                            }
                                            Text(order.items ?: "Diagnostic Panel", fontSize = 11.sp, color = Slate500, maxLines = 1)
                                            Text(
                                                text = "Barcode: ${order.barcode ?: "MM-${order.id}-TPT"}",
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                fontFamily = FontFamily.Monospace,
                                                color = Slate700
                                            )
                                        }
                                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(18.dp))
                                    }
                                }
                            }
                        }

                        // 3. Quality & Cold-Chain Compliance Checklist
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = PureWhite),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                        ) {
                            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Text("NABL CHAIN-OF-CUSTODY CHECKLIST", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                    Text("Cold-Chain Temperature Maintained (2°C - 8°C)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900, modifier = Modifier.weight(1f))
                                    Switch(checked = coldChainVerified, onCheckedChange = { coldChainVerified = it })
                                }
                                HorizontalDivider(color = Slate200)
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                    Text("Zero Hemolysis / Clotting / Leakage Verified", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900, modifier = Modifier.weight(1f))
                                    Switch(checked = hemolysisChecked, onCheckedChange = { hemolysisChecked = it })
                                }
                                HorizontalDivider(color = Slate200)
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                    Text("All Tube Barcodes Match Digital Manifest", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900, modifier = Modifier.weight(1f))
                                    Switch(checked = barcodeManifestVerified, onCheckedChange = { barcodeManifestVerified = it })
                                }
                            }
                        }

                        // 4. Receiving Lab Technician & OTP Verification
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = PureWhite),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                        ) {
                            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Text("RECEIVING LAB AUTHORIZATION", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)
                                Text("Select Receiving Lab Technician / Officer", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate700)

                                labReceivers.forEach { receiver ->
                                    val sel = selectedLabReceiver == receiver
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(if (sel) MedTealLight else Slate50)
                                            .border(1.dp, if (sel) MedTealPrimary else Slate200, RoundedCornerShape(8.dp))
                                            .clickable { selectedLabReceiver = receiver }
                                            .padding(10.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(receiver, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                        if (sel) {
                                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(16.dp))
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Lab Accessioning Desk OTP / Token (Optional)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate700)
                                OutlinedTextField(
                                    value = handoverOtp,
                                    onValueChange = { handoverOtp = it },
                                    placeholder = { Text("Enter 4-Digit Lab Desk Pin (e.g. 8899)") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    modifier = Modifier.fillMaxWidth(),
                                    singleLine = true
                                )
                            }
                        }

                        // 5. Submit Batch Handover Button
                        Button(
                            onClick = {
                                if (!coldChainVerified || !hemolysisChecked || !barcodeManifestVerified) {
                                    errorMessage = "Please verify all 3 NABL Chain-of-Custody compliance checks."
                                    return@Button
                                }
                                coroutineScope.launch {
                                    isSubmitting = true
                                    errorMessage = null
                                    collectedOrders.forEach { ord ->
                                        AgentRepository.updatePickupStatus(
                                            orderId = ord.id,
                                            status = "DELIVERED",
                                            notes = "Handed over to $selectedLabReceiver by $agentName ($agentId)"
                                        )
                                    }
                                    isSubmitting = false
                                    showSuccessBanner = true
                                    onHandoverSuccess()
                                }
                            },
                            enabled = !isSubmitting,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Icon(Icons.Default.Verified, contentDescription = null, tint = PureWhite, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (isSubmitting) "Recording Custody Transfer..." else "Confirm Batch Handover (${collectedOrders.size} Orders)",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Black,
                                color = PureWhite,
                                modifier = Modifier.padding(vertical = 6.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

