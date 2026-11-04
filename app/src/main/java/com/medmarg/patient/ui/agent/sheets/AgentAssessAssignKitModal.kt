package com.medmarg.patient.ui.agent.sheets

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentInventoryItem
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// 🧰 AGENT ASSESS & ASSIGN FIELD KIT (LIVE CATALOG & AGENT-SPECIFIC STOCK ONLY)
// 1-on-1 replication of ios/Agent/Sheets/AgentAssessAssignKitModal.swift
// =========================================================================

@Composable
fun AgentAssessAssignKitModal(
    order: AgentPickupOrder,
    agentId: String,
    onDismiss: () -> Unit,
    onKitAssigned: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val effectiveAgentId = remember(agentId) {
        val clean = agentId.trim()
        if (clean.isEmpty() || clean.equals("unassigned", ignoreCase = true)) "AG-01" else clean
    }

    var liveAgentInventory by remember { mutableStateOf<List<AgentInventoryItem>>(emptyList()) }
    var allocatedQuantities by remember { mutableStateOf<Map<String, Int>>(emptyMap()) }
    var activeCategoryFilter by remember { mutableStateOf("ALL") } // ALL, TUBES, CONSUMABLES, KITS
    var isLoading by remember { mutableStateOf(true) }
    var isSubmitting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var actionBanner by remember { mutableStateOf<String?>(null) }

    var showKitNotRequiredDialog by remember { mutableStateOf(false) }
    var showIndentSheet by remember { mutableStateOf(false) }
    var indentItemPrefill by remember { mutableStateOf("") }

    fun loadInventory() {
        coroutineScope.launch {
            isLoading = true
            val (agentInv, _) = AgentRepository.fetchInventory(effectiveAgentId)
            liveAgentInventory = agentInv
            isLoading = false
        }
    }

    LaunchedEffect(effectiveAgentId) {
        loadInventory()
    }

    val filteredInventory = remember(liveAgentInventory, activeCategoryFilter) {
        when (activeCategoryFilter) {
            "TUBES" -> liveAgentInventory.filter {
                val c = it.code.lowercase()
                val cat = it.category.lowercase()
                c.contains("tube") || c.contains("sst") || c.contains("edta") || c.contains("flr") || cat.contains("blood")
            }
            "CONSUMABLES" -> liveAgentInventory.filter {
                val c = it.code.lowercase()
                val cat = it.category.lowercase()
                c.contains("syr") || c.contains("glv") || c.contains("lbl") || cat.contains("consumable") || cat.contains("lab")
            }
            "KITS" -> liveAgentInventory.filter {
                val c = it.code.lowercase()
                val cat = it.category.lowercase()
                c.contains("kit") || cat.contains("kit")
            }
            else -> liveAgentInventory
        }
    }

    val outOfStockSelectedItems = remember(allocatedQuantities, liveAgentInventory) {
        allocatedQuantities.entries.mapNotNull { (code, needed) ->
            if (needed <= 0) null
            else {
                val inv = liveAgentInventory.firstOrNull { it.code == code }
                if (inv != null && needed > inv.stock) Triple(inv, needed, inv.stock) else null
            }
        }
    }

    val totalAssessedCount = remember(allocatedQuantities) {
        allocatedQuantities.values.sum()
    }

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
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Cancel",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate600,
                        modifier = Modifier.clickable { onDismiss() }
                    )

                    Text(
                        text = "Assess & Assign Field Kit",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clickable {
                            indentItemPrefill = ""
                            showIndentSheet = true
                        }
                    ) {
                        Icon(Icons.Default.AddCircle, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Raise Indent", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                    }
                }

                HorizontalDivider(color = Slate200)

                // Body
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // 1. Order Summary Header Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(
                                        text = "ORD-${order.id}",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Black,
                                        fontFamily = FontFamily.Monospace,
                                        color = MedTealPrimary
                                    )
                                    Text(
                                        text = order.slot ?: "Today Morning",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Slate500
                                    )
                                }
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(order.effectivePatientName, fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                                Text(order.address ?: "Tirupati", fontSize = 11.sp, color = Slate500, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("Agent ID: $effectiveAgentId", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate700)
                                Text("Field Bag Audit", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = MedTealPrimary)
                            }
                        }
                    }

                    // Action Banner
                    actionBanner?.let { banner ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(MedTealPrimary)
                                .padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(banner, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite, modifier = Modifier.weight(1f))
                            Icon(Icons.Default.Close, contentDescription = null, tint = PureWhite, modifier = Modifier.size(14.dp).clickable { actionBanner = null })
                        }
                    }

                    // Error Message
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

                    // 2. Category Filter Tabs
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf(
                            "ALL" to "All Items",
                            "TUBES" to "Vacutainer Tubes",
                            "CONSUMABLES" to "Consumables",
                            "KITS" to "Pre-Packaged Kits"
                        ).forEach { (key, title) ->
                            val isSelected = activeCategoryFilter == key
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isSelected) MedTealPrimary else PureWhite)
                                    .border(1.dp, if (isSelected) MedTealPrimary else Slate200, RoundedCornerShape(10.dp))
                                    .clickable { activeCategoryFilter = key }
                                    .padding(horizontal = 12.dp, vertical = 7.dp)
                            ) {
                                Text(
                                    text = title,
                                    fontSize = 11.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSelected) PureWhite else Slate700
                                )
                            }
                        }
                    }

                    // 3. Live Inventory Catalog Section (Field Bag Stock Only)
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("LIVE INVENTORY (FIELD BAG STOCK)", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)
                                    Text("Showing live items with your available in-hand bag quantities", fontSize = 10.sp, color = Slate500)
                                }
                                Text("${liveAgentInventory.size} Items", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate500)
                            }

                            if (isLoading) {
                                Box(modifier = Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        CircularProgressIndicator(color = MedTealPrimary, modifier = Modifier.size(28.dp))
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text("Syncing field bag inventory...", fontSize = 12.sp, color = Slate500)
                                    }
                                }
                            } else if (liveAgentInventory.isEmpty()) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(Color(0xFFFFF7ED))
                                        .padding(16.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Icon(Icons.Default.Inventory2, contentDescription = null, tint = Color(0xFFF97316), modifier = Modifier.size(28.dp))
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text("No Allocated Supplies in Bag", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                    Text(
                                        "Your field kit has 0 in-hand stock. Raise an indent to request supplies or mark this visit as Kit Not Required.",
                                        fontSize = 11.sp,
                                        color = Slate500,
                                        textAlign = TextAlign.Center
                                    )
                                }
                            } else {
                                filteredInventory.forEach { item ->
                                    val currentAssigned = allocatedQuantities[item.code] ?: 0
                                    val isShortage = currentAssigned > item.stock
                                    val isOutOfStock = item.stock <= 0

                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(Slate50)
                                            .border(
                                                width = 1.dp,
                                                color = if (isShortage) RoseError.copy(alpha = 0.4f) else Color.Transparent,
                                                shape = RoundedCornerShape(12.dp)
                                            )
                                            .padding(10.dp),
                                        verticalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            val itemColor = itemIconColor(item.code)
                                            Box(
                                                modifier = Modifier
                                                    .size(38.dp)
                                                    .clip(RoundedCornerShape(10.dp))
                                                    .background(itemColor.copy(alpha = 0.12f)),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Icon(
                                                    imageVector = iconForInventory(item.code),
                                                    contentDescription = null,
                                                    tint = itemColor,
                                                    modifier = Modifier.size(18.dp)
                                                )
                                            }

                                            Spacer(modifier = Modifier.width(10.dp))

                                            Column(modifier = Modifier.weight(1f)) {
                                                Text(item.name, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                                    Text("SKU: ${item.code}", fontSize = 9.sp, fontFamily = FontFamily.Monospace, color = Slate500)
                                                    Row(
                                                        modifier = Modifier
                                                            .clip(RoundedCornerShape(4.dp))
                                                            .background((if (item.stock > 0) EmeraldAccent else RoseError).copy(alpha = 0.12f))
                                                            .padding(horizontal = 6.dp, vertical = 2.dp),
                                                        verticalAlignment = Alignment.CenterVertically,
                                                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                                                    ) {
                                                        Box(
                                                            modifier = Modifier
                                                                .size(5.dp)
                                                                .clip(CircleShape)
                                                                .background(if (item.stock > 0) EmeraldAccent else RoseError)
                                                        )
                                                        Text(
                                                            text = if (item.stock > 0) "${item.stock} in Bag" else "0 in Bag",
                                                            fontSize = 9.sp,
                                                            fontWeight = FontWeight.Bold,
                                                            color = if (item.stock > 0) EmeraldAccent else RoseError
                                                        )
                                                    }
                                                }
                                            }

                                            // Counter Stepper
                                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                                Box(
                                                    modifier = Modifier
                                                        .size(28.dp)
                                                        .clip(RoundedCornerShape(7.dp))
                                                        .background(Slate200)
                                                        .clickable(enabled = currentAssigned > 0) {
                                                            allocatedQuantities = allocatedQuantities.toMutableMap().apply {
                                                                put(item.code, (currentAssigned - 1).coerceAtLeast(0))
                                                            }
                                                        },
                                                    contentAlignment = Alignment.Center
                                                ) {
                                                    Icon(Icons.Default.Remove, contentDescription = "Minus", tint = if (currentAssigned > 0) Slate900 else Slate400, modifier = Modifier.size(14.dp))
                                                }

                                                Text(
                                                    text = "$currentAssigned",
                                                    fontSize = 13.sp,
                                                    fontWeight = FontWeight.Black,
                                                    fontFamily = FontFamily.Monospace,
                                                    color = if (isShortage) RoseError else Slate900
                                                )

                                                Box(
                                                    modifier = Modifier
                                                        .size(28.dp)
                                                        .clip(RoundedCornerShape(7.dp))
                                                        .background(MedTealPrimary)
                                                        .clickable {
                                                            val next = currentAssigned + 1
                                                            allocatedQuantities = allocatedQuantities.toMutableMap().apply {
                                                                put(item.code, next)
                                                            }
                                                            if (next > item.stock) {
                                                                indentItemPrefill = "${next}x ${item.name}"
                                                            }
                                                        },
                                                    contentAlignment = Alignment.Center
                                                ) {
                                                    Icon(Icons.Default.Add, contentDescription = "Plus", tint = PureWhite, modifier = Modifier.size(14.dp))
                                                }
                                            }
                                        }

                                        if (isShortage) {
                                            Row(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .clip(RoundedCornerShape(8.dp))
                                                    .background(RoseError.copy(alpha = 0.08f))
                                                    .padding(8.dp),
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Icon(Icons.Default.Error, contentDescription = null, tint = RoseError, modifier = Modifier.size(12.dp))
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Text(
                                                    text = "Out of stock in bag! (Available: ${item.stock}, Selected: $currentAssigned)",
                                                    fontSize = 9.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = RoseError,
                                                    modifier = Modifier.weight(1f)
                                                )
                                                Box(
                                                    modifier = Modifier
                                                        .clip(RoundedCornerShape(6.dp))
                                                        .background(Color(0xFFF97316))
                                                        .clickable {
                                                            indentItemPrefill = "${currentAssigned}x ${item.name} (Order #${order.id})"
                                                            showIndentSheet = true
                                                        }
                                                        .padding(horizontal = 7.dp, vertical = 3.dp)
                                                ) {
                                                    Text("⚡ Raise Indent", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                                }
                                            }
                                        } else if (isOutOfStock && currentAssigned == 0) {
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text("Item currently at 0 units in your bag.", fontSize = 9.sp, color = Slate500)
                                                Text(
                                                    text = "+ Indent Restock",
                                                    fontSize = 9.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = MedTealPrimary,
                                                    modifier = Modifier.clickable {
                                                        indentItemPrefill = "10x ${item.name}"
                                                        showIndentSheet = true
                                                    }
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // 4. Assessment Summary & Actions
                    if (totalAssessedCount > 0) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(PureWhite)
                                .border(1.dp, if (outOfStockSelectedItems.isEmpty()) MedTealPrimary.copy(alpha = 0.3f) else RoseError.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("Assessed for This Visit", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate700)
                                Text("$totalAssessedCount items selected from your bag", fontSize = 10.sp, color = Slate500)
                            }
                            if (outOfStockSelectedItems.isNotEmpty()) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(RoseError)
                                        .padding(horizontal = 8.dp, vertical = 3.dp)
                                ) {
                                    Text("${outOfStockSelectedItems.size} Shortage", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                }
                            } else {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(EmeraldAccent.copy(alpha = 0.12f))
                                        .padding(horizontal = 8.dp, vertical = 3.dp)
                                ) {
                                    Text("Ready to Assign", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                                }
                            }
                        }
                    }

                    if (outOfStockSelectedItems.isNotEmpty()) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFFFFF7ED))
                                .border(1.dp, Color(0xFFF97316).copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Icon(Icons.Default.Warning, contentDescription = null, tint = Color(0xFFF97316), modifier = Modifier.size(16.dp))
                                Text("Supplies Out of Stock in Field Bag", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            }
                            Text(
                                "You assessed supplies that are currently out of stock in your bag. Raise a Central Store Indent to replenish stock, or mark this visit as Kit Not Required.",
                                fontSize = 11.sp,
                                color = Slate700
                            )
                            Button(
                                onClick = {
                                    indentItemPrefill = outOfStockSelectedItems.joinToString(", ") { "${it.second}x ${it.first.name}" }
                                    showIndentSheet = true
                                },
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF97316)),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("⚡ Raise Central Store Indent", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                            }
                        }
                    }

                    // Primary Action 1: Confirm & Assign Kit from Bag
                    Button(
                        onClick = {
                            coroutineScope.launch {
                                isSubmitting = true
                                errorMessage = null
                                val payloadList = allocatedQuantities.mapNotNull { (code, qty) ->
                                    if (qty <= 0) null
                                    else {
                                        val inv = liveAgentInventory.firstOrNull { it.code == code }
                                        if (inv != null) Triple(inv.name, inv.code, qty) else null
                                    }
                                }
                                val (ok, msg) = AgentRepository.assignKitToOrder(
                                    orderId = order.id,
                                    agentId = effectiveAgentId,
                                    kitItems = payloadList
                                )
                                isSubmitting = false
                                if (ok) {
                                    onKitAssigned()
                                    onDismiss()
                                } else {
                                    errorMessage = msg
                                }
                            }
                        },
                        enabled = !isSubmitting && outOfStockSelectedItems.isEmpty() && totalAssessedCount > 0,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = if (isSubmitting) "Assigning Kit..." else "✓ Confirm & Assign Kit from Bag",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = PureWhite,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )
                    }

                    // Dual Terminal Action 2: Mark as Kit Not Required
                    OutlinedButton(
                        onClick = { showKitNotRequiredDialog = true },
                        enabled = !isSubmitting,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.Block, contentDescription = null, tint = Slate700, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Mark as Kit Not Required", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate700)
                    }

                    Spacer(modifier = Modifier.height(20.dp))
                }
            }
        }
    }

    if (showKitNotRequiredDialog) {
        val reasons = listOf(
            "Patient Has Doctor / Home Collection Kit",
            "Supplies Already Pre-Delivered at Clinic",
            "Non-Invasive / Urine Sample Only"
        )
        AlertDialog(
            onDismissRequest = { showKitNotRequiredDialog = false },
            title = { Text("Mark Kit as Not Required", fontWeight = FontWeight.Black, fontSize = 16.sp) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        "Select reason why kit supplies from your field bag are not required. This unblocks trip start without deducting supplies.",
                        fontSize = 12.sp,
                        color = Slate600
                    )
                    reasons.forEach { reason ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    showKitNotRequiredDialog = false
                                    coroutineScope.launch {
                                        isSubmitting = true
                                        val (ok, msg) = AgentRepository.assignKitToOrder(
                                            orderId = order.id,
                                            agentId = effectiveAgentId,
                                            kitNotRequired = true,
                                            reason = reason
                                        )
                                        isSubmitting = false
                                        if (ok) {
                                            onKitAssigned()
                                            onDismiss()
                                        } else {
                                            errorMessage = msg
                                        }
                                    }
                                },
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = Slate100)
                        ) {
                            Text(
                                text = reason,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showKitNotRequiredDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    if (showIndentSheet) {
        AgentKitIndentSheet(
            agentId = effectiveAgentId,
            prefilledSummary = indentItemPrefill,
            onDismiss = { showIndentSheet = false },
            onSubmitted = {
                showIndentSheet = false
                actionBanner = "Indent request submitted to Central Store!"
                loadInventory()
            }
        )
    }
}

@Composable
fun AgentKitIndentSheet(
    agentId: String,
    prefilledSummary: String,
    onDismiss: () -> Unit,
    onSubmitted: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var requestedItems by remember {
        mutableStateOf(if (prefilledSummary.isNotEmpty()) prefilledSummary else "10x Gold SST Tubes, 10x Purple EDTA Tubes")
    }
    var area by remember { mutableStateOf("Tirupati Central Zone") }
    var isSubmitting by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.Bolt, contentDescription = null, tint = Color(0xFFF97316))
                Text("Central Store Restock Indent", fontSize = 16.sp, fontWeight = FontWeight.Black)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    "Dispatches directly to Store Lead for immediate field bag handover.",
                    fontSize = 11.sp,
                    color = Slate500
                )

                OutlinedTextField(
                    value = requestedItems,
                    onValueChange = { requestedItems = it },
                    label = { Text("Requested Consumables & Quantities") },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = area,
                    onValueChange = { area = it },
                    label = { Text("Phlebotomist Zone") },
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
                            area = area
                        )
                        isSubmitting = false
                        onSubmitted()
                    }
                },
                enabled = !isSubmitting && requestedItems.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
            ) {
                Text(if (isSubmitting) "Submitting..." else "⚡ Submit Indent", fontWeight = FontWeight.Bold, color = PureWhite)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

private fun iconForInventory(code: String): ImageVector {
    val c = code.lowercase()
    return when {
        c.contains("sst") || c.contains("edta") || c.contains("flr") || c.contains("tube") -> Icons.Default.Science
        c.contains("syr") || c.contains("needle") -> Icons.Default.Vaccines
        c.contains("glv") -> Icons.Default.PanTool
        c.contains("lbl") || c.contains("roll") -> Icons.Default.QrCode
        c.contains("kit") -> Icons.Default.Inventory2
        else -> Icons.Default.MedicalServices
    }
}

private fun itemIconColor(code: String): Color {
    val c = code.lowercase()
    return when {
        c.contains("sst") -> Color(0xFFEAB308)
        c.contains("edta") -> Color(0xFF9333EA)
        c.contains("flr") -> Color(0xFF64748B)
        c.contains("syr") -> Color(0xFF2563EB)
        c.contains("glv") -> MedTealPrimary
        else -> Slate700
    }
}

