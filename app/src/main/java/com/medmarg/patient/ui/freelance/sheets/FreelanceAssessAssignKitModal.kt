package com.medmarg.patient.ui.freelance.sheets

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentInventoryItem
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

/**
 * ⚡ FREELANCE ASSESS & ASSIGN FIELD KIT MODAL (Replicated 1-on-1 with iOS FreelanceAssessAssignKitModal.swift)
 * Tailored for freelance phlebotomists with Onboarding Credit Wallet visibility and tube requirements.
 */
@Composable
fun FreelanceAssessAssignKitModal(
    order: AgentPickupOrder,
    onDismiss: () -> Unit,
    onAssigned: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var liveInventory by remember { mutableStateOf<List<AgentInventoryItem>>(emptyList()) }
    var walletCredits by remember { mutableIntStateOf(2000) }
    var isLoading by remember { mutableStateOf(true) }
    var isSubmitting by remember { mutableStateOf(false) }

    val testsText = (order.items ?: "").lowercase()

    data class RequiredItem(val name: String, val needed: Int, val iconTint: Color)
    val requiredItems = remember(testsText) {
        val list = mutableListOf(
            RequiredItem("Vacutainer Gold SST (Serum Gel)", 1, AmberGold),
            RequiredItem("Vacutainer Purple/Lavender (EDTA)", 1, Color(0xFF9333EA))
        )
        if (testsText.contains("sugar") || testsText.contains("glucose") || testsText.contains("diabetes") || testsText.contains("hba1c")) {
            list.add(RequiredItem("Vacutainer Grey (Sodium Fluoride)", 1, Slate500))
        }
        list.add(RequiredItem("Sterile Safety Syringes 5ml", 1, MedTealPrimary))
        list.add(RequiredItem("Nitrile Examination Gloves", 1, Color(0xFF2563EB)))
        list.add(RequiredItem("Barcode Thermal Label Rolls", 1, Slate900))
        list
    }

    LaunchedEffect(Unit) {
        isLoading = true
        liveInventory = AgentRepository.fetchInventory(order.assignedAgent ?: "FL-502")
        isLoading = false
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(22.dp),
            color = PureWhite,
            shadowElevation = 24.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Assess & Assign Field Kit", fontSize = 17.sp, fontWeight = FontWeight.Black, color = Slate900)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate500)
                    }
                }

                // Order Info Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate50)
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(order.id, fontSize = 13.sp, fontWeight = FontWeight.Black, color = MedTealPrimary)
                            Surface(
                                color = Color(0xFF00B86B).copy(alpha = 0.12f),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(3.dp)
                                ) {
                                    Icon(Icons.Default.CreditCard, contentDescription = null, tint = Color(0xFF00B86B), modifier = Modifier.size(11.dp))
                                    Text("Kit Credit: ₹$walletCredits", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF00B86B))
                                }
                            }
                        }

                        Text(order.effectivePatientName, fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                        Text(order.address ?: "Tirupati Doorstep", fontSize = 12.sp, color = Slate600)
                    }
                }

                // Required Items Section
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("1. REQUIRED FOR THIS VISIT", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)

                    requiredItems.forEach { req ->
                        val inHand = liveInventory.firstOrNull { it.name.contains(req.name.take(8), ignoreCase = true) }?.stock ?: 10

                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = Slate50,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Icon(Icons.Default.FiberManualRecord, contentDescription = null, tint = req.iconTint, modifier = Modifier.size(14.dp))
                                    Column {
                                        Text(req.name, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                        Text("Needed: ${req.needed}x", fontSize = 10.sp, color = Slate500)
                                    }
                                }

                                Surface(
                                    color = if (inHand >= req.needed) Color(0xFF00B86B).copy(alpha = 0.12f) else AmberGold.copy(alpha = 0.12f),
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Text(
                                        text = if (inHand >= req.needed) "In Bag ($inHand)" else "Low ($inHand)",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (inHand >= req.needed) Color(0xFF00B86B) else AmberGold,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                // Action Buttons
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Button(
                        onClick = {
                            isSubmitting = true
                            coroutineScope.launch {
                                AgentRepository.assignKit(order.id, order.assignedAgent ?: "FL-502", false)
                                isSubmitting = false
                                onAssigned()
                                onDismiss()
                            }
                        },
                        enabled = !isSubmitting,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                    ) {
                        if (isSubmitting) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), color = PureWhite, strokeWidth = 2.dp)
                        } else {
                            Icon(Icons.Default.Verified, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("✔ Confirm & Assign Kit from Bag", fontWeight = FontWeight.Bold, color = PureWhite)
                        }
                    }

                    OutlinedButton(
                        onClick = {
                            isSubmitting = true
                            coroutineScope.launch {
                                AgentRepository.assignKit(order.id, order.assignedAgent ?: "FL-502", true)
                                isSubmitting = false
                                onAssigned()
                                onDismiss()
                            }
                        },
                        enabled = !isSubmitting,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Mark as Kit Not Required", color = Slate700, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
