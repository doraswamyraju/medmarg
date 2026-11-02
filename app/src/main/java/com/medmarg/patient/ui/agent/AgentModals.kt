package com.medmarg.patient.ui.agent

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.model.PhleboVitalsRecord
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// 🚪 AGENT WORKFLOW MODALS (DOORSTEP VISIT, QR PAYMENT, MANUAL ORDER, HANDOVER)
// Replicated 1-on-1 with iOS Agent Sheets
// =========================================================================

// 1. DOORSTEP VISIT MODAL
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AgentDoorstepVisitModal(
    order: AgentPickupOrder,
    onDismiss: () -> Unit,
    onCollectQrPayment: () -> Unit,
    onCompleteVisit: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()

    var bp by remember { mutableStateOf("120/80") }
    var pulse by remember { mutableStateOf("72") }
    var spo2 by remember { mutableStateOf("99%") }
    var sugar by remember { mutableStateOf("94 mg/dL") }
    var isFastingConfirmed by remember { mutableStateOf(true) }
    var sstBarcode by remember { mutableStateOf("SST-890214") }
    var edtaBarcode by remember { mutableStateOf("EDTA-449102") }
    var isSubmitting by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 40.dp)
                .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)),
            color = PureWhite
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
            ) {
                // Top Header Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Doorstep Phlebotomy Visit", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                        Text("${order.effectivePatientName} • ${order.id}", fontSize = 12.sp, color = Slate500)
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate700)
                    }
                }

                Divider(color = Slate100, modifier = Modifier.padding(vertical = 10.dp))

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Payment Banner (If Unpaid)
                    if (!order.isPaid) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF2F2)),
                            border = androidx.compose.foundation.BorderStroke(1.dp, RoseError.copy(alpha = 0.3f))
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Payment Due: ₹${order.effectiveAmount}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = RoseError)
                                    Text("Collect via UPI QR or Cash", fontSize = 11.sp, color = Slate600)
                                }

                                Button(
                                    onClick = onCollectQrPayment,
                                    colors = ButtonDefaults.buttonColors(containerColor = RoseError),
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                ) {
                                    Text("Collect QR", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    // 1. Pre-Collection Vitals Checklist
                    Text("1. Patient Pre-Collection Vitals", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = bp,
                            onValueChange = { bp = it },
                            label = { Text("BP", fontSize = 10.sp) },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = pulse,
                            onValueChange = { pulse = it },
                            label = { Text("Pulse", fontSize = 10.sp) },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = spo2,
                            onValueChange = { spo2 = it },
                            label = { Text("SpO2", fontSize = 10.sp) },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true
                        )
                    }

                    // 2. Fasting Confirmation
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(Slate50)
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = isFastingConfirmed,
                            onCheckedChange = { isFastingConfirmed = it },
                            colors = CheckboxDefaults.colors(checkedColor = MedTealPrimary)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Patient confirmed 10-12 hours fasting (Water permitted)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate800
                        )
                    }

                    // 3. Vacutainer Barcode Entry
                    Text("2. Vacutainer Sample Barcodes", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)

                    OutlinedTextField(
                        value = sstBarcode,
                        onValueChange = { sstBarcode = it },
                        label = { Text("SST Gold (Serum) Barcode", fontSize = 10.sp) },
                        leadingIcon = { Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = MedTealPrimary) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = edtaBarcode,
                        onValueChange = { edtaBarcode = it },
                        label = { Text("EDTA Purple (Whole Blood) Barcode", fontSize = 10.sp) },
                        leadingIcon = { Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = Color(0xFF8B5CF6)) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )

                    // 4. Inclusions Summary
                    Text("3. Prescribed Tests: ${order.items}", fontSize = 12.sp, color = Slate600)
                }

                // Submit Button
                Button(
                    onClick = {
                        coroutineScope.launch {
                            isSubmitting = true
                            val vitalsRecord = PhleboVitalsRecord(
                                bp = bp,
                                pulse = pulse,
                                spo2 = spo2,
                                sugar = sugar
                            )
                            AgentRepository.updatePickupStatus(
                                orderId = order.id,
                                status = "SAMPLE_COLLECTED",
                                barcode = "$sstBarcode, $edtaBarcode",
                                vitals = vitalsRecord,
                                paymentCollected = order.isPaid
                            )
                            isSubmitting = false
                            onCompleteVisit()
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                    contentPadding = PaddingValues(vertical = 14.dp),
                    enabled = !isSubmitting
                ) {
                    if (isSubmitting) {
                        CircularProgressIndicator(color = PureWhite, modifier = Modifier.size(20.dp))
                    } else {
                        Text("Confirm Sample Collection", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }
            }
        }
    }
}

// 2. DOORSTEP QR PAYMENT MODAL
@Composable
fun AgentDoorstepQrPaymentModal(
    order: AgentPickupOrder,
    onDismiss: () -> Unit,
    onPaymentDone: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var isMarkingPaid by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Doorstep UPI Payment", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate500)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text("Order: ${order.id}", fontSize = 12.sp, color = Slate500)
                Text("₹${order.effectiveAmount}", fontSize = 28.sp, fontWeight = FontWeight.Black, color = MedTealPrimary)
                Text("Scan via any UPI App (GPay, PhonePe, Paytm)", fontSize = 11.sp, color = Slate500)

                Spacer(modifier = Modifier.height(16.dp))

                // Simulated Dynamic QR Box
                Box(
                    modifier = Modifier
                        .size(180.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Slate100)
                        .border(1.dp, Slate200, RoundedCornerShape(14.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.QrCode,
                            contentDescription = "QR Code",
                            tint = Slate900,
                            modifier = Modifier.size(120.dp)
                        )
                        Text("UPI: medmarg@icici", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate600)
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                Button(
                    onClick = {
                        coroutineScope.launch {
                            isMarkingPaid = true
                            AgentRepository.updatePickupStatus(
                                orderId = order.id,
                                status = order.status ?: "ARRIVED",
                                paymentCollected = true,
                                paymentMode = "DOORSTEP_QR"
                            )
                            isMarkingPaid = false
                            onPaymentDone()
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent),
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(vertical = 12.dp),
                    enabled = !isMarkingPaid
                ) {
                    if (isMarkingPaid) {
                        CircularProgressIndicator(color = PureWhite, modifier = Modifier.size(18.dp))
                    } else {
                        Text("Mark as Paid (UPI Received)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedButton(
                    onClick = {
                        coroutineScope.launch {
                            isMarkingPaid = true
                            AgentRepository.updatePickupStatus(
                                orderId = order.id,
                                status = order.status ?: "ARRIVED",
                                paymentCollected = true,
                                paymentMode = "CASH"
                            )
                            isMarkingPaid = false
                            onPaymentDone()
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Cash Handover Collected", fontSize = 12.sp, color = Slate700)
                }
            }
        }
    }
}

// 3. CREATE MANUAL CUSTOMER ORDER MODAL
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AgentCreateManualOrderModal(
    agentId: String,
    onDismiss: () -> Unit,
    onOrderCreated: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()

    var patientName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var selectedTest by remember { mutableStateOf("Complete Blood Count (CBC) - ₹199") }
    var amount by remember { mutableIntStateOf(199) }
    var slot by remember { mutableStateOf("Tomorrow, 07:30 AM") }
    var isSubmitting by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 40.dp)
                .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)),
            color = PureWhite
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Book Order for Customer", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate700)
                    }
                }

                Divider(color = Slate100, modifier = Modifier.padding(vertical = 10.dp))

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = patientName,
                        onValueChange = { patientName = it },
                        label = { Text("Patient Full Name") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Phone Number (+91)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    OutlinedTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = { Text("Complete Address / Doorstep Location") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    OutlinedTextField(
                        value = selectedTest,
                        onValueChange = { selectedTest = it },
                        label = { Text("Tests / Health Packages") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    OutlinedTextField(
                        value = slot,
                        onValueChange = { slot = it },
                        label = { Text("Preferred Time Slot") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                }

                Button(
                    onClick = {
                        if (patientName.isNotEmpty() && phone.isNotEmpty()) {
                            coroutineScope.launch {
                                isSubmitting = true
                                AgentRepository.createManualOrder(
                                    agentId = agentId,
                                    patientName = patientName,
                                    phone = phone,
                                    address = address.ifEmpty { "Air Bypass Road, Tirupati" },
                                    tests = selectedTest,
                                    amount = amount,
                                    slot = slot
                                )
                                isSubmitting = false
                                onOrderCreated()
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                    contentPadding = PaddingValues(vertical = 14.dp),
                    enabled = !isSubmitting && patientName.isNotEmpty()
                ) {
                    if (isSubmitting) {
                        CircularProgressIndicator(color = PureWhite, modifier = Modifier.size(20.dp))
                    } else {
                        Text("Create & Assign to My Route", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }
            }
        }
    }
}

// 4. LAB HANDOVER MODAL
@Composable
fun AgentLabHandoverModal(
    collectedOrders: List<AgentPickupOrder>,
    onDismiss: () -> Unit,
    onHandoverComplete: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var otpInput by remember { mutableStateOf("5678") }
    var selectedLab by remember { mutableStateOf("MedMarg Central Diagnostics Hub") }
    var isSubmitting by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Handover Samples to Lab", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate500)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "Total ${collectedOrders.size} patient specimen kits ready for accessioning.",
                    fontSize = 12.sp,
                    color = Slate600
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = selectedLab,
                    onValueChange = { selectedLab = it },
                    label = { Text("Receiving Lab") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = otpInput,
                    onValueChange = { otpInput = it },
                    label = { Text("Lab In-Charge 4-Digit Handover OTP") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        coroutineScope.launch {
                            isSubmitting = true
                            collectedOrders.forEach { ord ->
                                AgentRepository.updatePickupStatus(ord.id, "DELIVERED")
                            }
                            isSubmitting = false
                            onHandoverComplete()
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF97316)),
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(vertical = 12.dp),
                    enabled = !isSubmitting
                ) {
                    if (isSubmitting) {
                        CircularProgressIndicator(color = PureWhite, modifier = Modifier.size(18.dp))
                    } else {
                        Text("Confirm Sample Handover", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }
            }
        }
    }
}
