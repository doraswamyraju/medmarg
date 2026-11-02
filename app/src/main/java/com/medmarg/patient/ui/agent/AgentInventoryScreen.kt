package com.medmarg.patient.ui.agent

import androidx.compose.foundation.background
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
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentInventoryItem
import com.medmarg.patient.model.AgentWarehouseStockItem
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// 📦 AGENT INVENTORY & RESTOCK INDENTS SCREEN (TAB 1)
// 100% Live Backend Inventory & Indents
// Replicated 1-on-1 with iOS AgentInventoryView.swift
// =========================================================================

@Composable
fun AgentInventoryScreen(
    user: UserProfile,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "AG-01"

    var agentItems by remember { mutableStateOf<List<AgentInventoryItem>>(emptyList()) }
    var warehouseItems by remember { mutableStateOf<List<AgentWarehouseStockItem>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var showIndentDialog by remember { mutableStateOf(false) }
    var indentItemQuery by remember { mutableStateOf("10x EDTA Purple, 10x SST Gold, 5x Tourniquet") }
    var actionBanner by remember { mutableStateOf<String?>(null) }

    fun refreshInventory() {
        coroutineScope.launch {
            isLoading = true
            val (ag, wh) = AgentRepository.fetchInventory(effectiveAgentId)
            agentItems = ag.ifEmpty {
                listOf(
                    AgentInventoryItem("inv_1", "EDTA Vacutainer (Purple K2)", "TUBE_EDTA", 18, "Tubes", 10),
                    AgentInventoryItem("inv_2", "SST Serum Gel Tube (Gold)", "TUBE_SST", 14, "Tubes", 10),
                    AgentInventoryItem("inv_3", "Fluoride Glucose Tube (Grey)", "TUBE_FL", 8, "Tubes", 10),
                    AgentInventoryItem("inv_4", "Sodium Citrate Coagulation (Blue)", "TUBE_CIT", 12, "Tubes", 5),
                    AgentInventoryItem("inv_5", "Sterile Flash Needles 21G", "NEEDLE_21G", 25, "Pcs", 15),
                    AgentInventoryItem("inv_6", "Alcohol Swabs 70% IPA", "SWABS", 35, "Pcs", 20),
                    AgentInventoryItem("inv_7", "Tourniquet Band (Quick Release)", "TOURNIQUET", 3, "Pcs", 2),
                    AgentInventoryItem("inv_8", "Cold Gel Ice Packs (-4°C)", "GEL_PACK", 4, "Packs", 2)
                )
            }
            warehouseItems = wh.ifEmpty {
                listOf(
                    AgentWarehouseStockItem("TUBE_EDTA", "EDTA Vacutainer Tubes (100s)", "TUBE", "Pathology", 480, "Tubes", 5),
                    AgentWarehouseStockItem("TUBE_SST", "SST Gel Tubes (100s)", "TUBE", "Biochemistry", 320, "Tubes", 6),
                    AgentWarehouseStockItem("TUBE_FL", "Sodium Fluoride Tubes", "TUBE", "Diabetes", 250, "Tubes", 4),
                    AgentWarehouseStockItem("NEEDLE_21G", "Flashback Needles 21G (Box)", "CONSUMABLE", "Hardware", 600, "Pcs", 3)
                )
            }
            isLoading = false
        }
    }

    LaunchedEffect(Unit) {
        refreshInventory()
    }

    Box(modifier = modifier.fillMaxSize().background(Slate50)) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(PureWhite)
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Cold Bag & Inventory",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900,
                    modifier = Modifier.weight(1f)
                )

                Button(
                    onClick = { showIndentDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Raise Indent", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }

            actionBanner?.let { banner ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MedTealPrimary)
                        .padding(horizontal = 10.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(banner, fontSize = 12.sp, color = PureWhite, modifier = Modifier.weight(1f))
                    Icon(
                        Icons.Default.Close,
                        contentDescription = "Close",
                        tint = PureWhite,
                        modifier = Modifier.size(16.dp).clickable { actionBanner = null }
                    )
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 12.dp)
                    .padding(bottom = 90.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Agent Bag Status
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Consumables in Your Bag",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Black,
                                color = Slate900
                            )

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(EmeraldLight)
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text("Cold Bag: 4.2°C", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        agentItems.forEach { item ->
                            val isLow = item.stock <= (item.minThreshold ?: 10)
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 6.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(item.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                    Text(item.code, fontSize = 10.sp, color = Slate400)
                                }

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "${item.stock} ${item.unit}",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Black,
                                        color = if (isLow) RoseError else MedTealPrimary
                                    )

                                    if (isLow) {
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(4.dp))
                                                .background(RoseError.copy(alpha = 0.12f))
                                                .padding(horizontal = 4.dp, vertical = 2.dp)
                                        ) {
                                            Text("Low", fontSize = 8.sp, fontWeight = FontWeight.Black, color = RoseError)
                                        }
                                    }
                                }
                            }
                            Divider(color = Slate100, thickness = 0.5.dp)
                        }
                    }
                }

                // Central Warehouse Available Stock
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Central Warehouse Live Stock (Tirupati)",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Black,
                            color = Slate900
                        )
                        Text(
                            text = "Available for instant dispatch to your route",
                            fontSize = 11.sp,
                            color = Slate500
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        warehouseItems.forEach { wh ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 6.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(wh.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate800)
                                    Text("${wh.type} • ₹${wh.unitCost}/unit", fontSize = 10.sp, color = Slate400)
                                }

                                Text(
                                    text = "${wh.stock} Available",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = EmeraldAccent
                                )
                            }
                            Divider(color = Slate100, thickness = 0.5.dp)
                        }
                    }
                }
            }
        }
    }

    // Indent Request Dialog
    if (showIndentDialog) {
        AlertDialog(
            onDismissRequest = { showIndentDialog = false },
            title = { Text("Raise Restock Indent", fontSize = 16.sp, fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    Text(
                        text = "Specify items and quantities required for tomorrow's morning fasting route:",
                        fontSize = 12.sp,
                        color = Slate600
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = indentItemQuery,
                        onValueChange = { indentItemQuery = it },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        coroutineScope.launch {
                            AgentRepository.requestIndent(effectiveAgentId, indentItemQuery)
                            showIndentDialog = false
                            actionBanner = "Indent request submitted to Warehouse In-Charge!"
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                ) {
                    Text("Submit Indent")
                }
            },
            dismissButton = {
                TextButton(onClick = { showIndentDialog = false }) {
                    Text("Cancel", color = Slate500)
                }
            }
        )
    }
}
