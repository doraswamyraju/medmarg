package com.medmarg.patient.ui.agent.sheets

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// 📦 AGENT INVENTORY SHEETS (INDENT, REPORT ISSUE, BARCODE SCANNER)
// 1-on-1 replication of ios/Agent/Views/AgentInventoryView.swift sheets
// =========================================================================

@Composable
fun AgentRaiseIndentSheet(
    agentId: String,
    agentName: String,
    onDismiss: () -> Unit,
    onSubmitted: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var requestedItems by remember { mutableStateOf("10x Gold SST Tubes, 10x Purple EDTA Tubes, 10x Sterile Syringes") }
    var urgency by remember { mutableStateOf("NORMAL") }
    var notes by remember { mutableStateOf("") }
    var isSubmitting by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.Assignment, contentDescription = null, tint = MedTealPrimary)
                Text("Request Refill / Indent", fontSize = 16.sp, fontWeight = FontWeight.Black)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Request field consumables and collection kits from Central Store Admin.", fontSize = 11.sp, color = Slate500)

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("NORMAL" to "Routine", "HIGH" to "Urgent").forEach { (key, label) ->
                        val sel = urgency == key
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (sel) MedTealPrimary else Slate100)
                                .clickable { urgency = key }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (sel) PureWhite else Slate700)
                        }
                    }
                }

                OutlinedTextField(
                    value = requestedItems,
                    onValueChange = { requestedItems = it },
                    label = { Text("Items & Quantities") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2
                )

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Additional Notes (Optional)") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    coroutineScope.launch {
                        isSubmitting = true
                        AgentRepository.requestIndent(
                            agentId = agentId,
                            requestedItems = requestedItems,
                            agentName = agentName,
                            urgency = urgency,
                            notes = notes.ifBlank { null }
                        )
                        isSubmitting = false
                        onSubmitted()
                        onDismiss()
                    }
                },
                enabled = !isSubmitting && requestedItems.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
            ) {
                Text(if (isSubmitting) "Submitting..." else "Submit Indent", fontWeight = FontWeight.Bold, color = PureWhite)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun AgentReportIssueSheet(
    agentId: String,
    agentName: String,
    onDismiss: () -> Unit,
    onReported: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var issueType by remember { mutableStateOf("DAMAGED") } // DAMAGED, EXPIRED, MISSING
    var itemCode by remember { mutableStateOf("TUBE-SST") }
    var quantity by remember { mutableIntStateOf(1) }
    var details by remember { mutableStateOf("") }
    var isSubmitting by remember { mutableStateOf(false) }

    val itemChoices = listOf(
        "TUBE-SST" to "Vacutainer Gold SST",
        "TUBE-EDTA" to "Vacutainer Purple EDTA",
        "TUBE-FLR" to "Vacutainer Grey Fluoride",
        "SYR-5ML" to "Sterile Safety Syringes 5ml",
        "GLV-NIT-M" to "Nitrile Gloves"
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Report Bag Issue", fontSize = 16.sp, fontWeight = FontWeight.Black)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("ISSUE CATEGORY", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Slate500)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("DAMAGED" to "Damaged", "EXPIRED" to "Expired", "MISSING" to "Missing").forEach { (key, label) ->
                        val sel = issueType == key
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (sel) MedTealDark else Slate100)
                                .clickable { issueType = key }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (sel) PureWhite else Slate700)
                        }
                    }
                }

                Text("AFFECTED ITEM", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Slate500)
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    itemChoices.forEach { (code, name) ->
                        val sel = itemCode == code
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (sel) MedTealLight else Slate50)
                                .border(1.dp, if (sel) MedTealPrimary else Slate200, RoundedCornerShape(8.dp))
                                .clickable { itemCode = code }
                                .padding(horizontal = 10.dp, vertical = 7.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(name, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            if (sel) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
                            }
                        }
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Quantity Affected: $quantity", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { if (quantity > 1) quantity -= 1 }, contentPadding = PaddingValues(0.dp), modifier = Modifier.size(30.dp)) {
                            Text("-")
                        }
                        OutlinedButton(onClick = { if (quantity < 20) quantity += 1 }, contentPadding = PaddingValues(0.dp), modifier = Modifier.size(30.dp)) {
                            Text("+")
                        }
                    }
                }

                OutlinedTextField(
                    value = details,
                    onValueChange = { details = it },
                    label = { Text("Incident Details") },
                    placeholder = { Text("Describe what happened...") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    coroutineScope.launch {
                        isSubmitting = true
                        AgentRepository.requestIndent(
                            agentId = agentId,
                            agentName = agentName,
                            urgency = "HIGH",
                            requestedItems = "${quantity}x $itemCode",
                            notes = "ISSUE REPORT ($issueType): ${quantity}x $itemCode. Details: $details"
                        )
                        isSubmitting = false
                        onReported()
                        onDismiss()
                    }
                },
                enabled = !isSubmitting,
                colors = ButtonDefaults.buttonColors(containerColor = MedTealDark)
            ) {
                Text(if (isSubmitting) "Submitting..." else "Submit Issue to Store In-Charge", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun AgentInventoryScannerSheet(
    onDismiss: () -> Unit,
    onScanned: (String) -> Unit
) {
    var manualInput by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Scan Kit Item", fontSize = 16.sp, fontWeight = FontWeight.Black)
        },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(14.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(170.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color.Black.copy(alpha = 0.85f)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(48.dp))
                        Text("Align Item Barcode / QR Code", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                        Text("Instant bag item verification", fontSize = 11.sp, color = Slate200)
                    }
                }

                OutlinedTextField(
                    value = manualInput,
                    onValueChange = { manualInput = it.uppercase() },
                    label = { Text("Manual Item Code Verification") },
                    placeholder = { Text("e.g. TUBE-SST or 890123456") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val code = manualInput.trim()
                    if (code.isNotEmpty()) {
                        onScanned(code)
                        onDismiss()
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
            ) {
                Text("Verify", fontWeight = FontWeight.Bold, color = PureWhite)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

