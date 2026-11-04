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
import com.medmarg.patient.data.CatalogStore
import com.medmarg.patient.model.CatalogItem
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// ➕ AGENT CREATE MANUAL ORDER MODAL (3-STEP WIZARD - 100% iOS PARITY)
// 1-on-1 replication of ios/Agent/Sheets/AgentCreateManualOrderModal.swift
// =========================================================================

@Composable
fun AgentCreateManualOrderModal(
    agentId: String,
    agentName: String = "Ramesh Kumar",
    onDismiss: () -> Unit,
    onOrderCreated: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val catalogTests by CatalogStore.tests.collectAsState()
    val catalogProfiles by CatalogStore.profiles.collectAsState()
    val catalogPackages by CatalogStore.packages.collectAsState()

    val allCatalogItems = remember(catalogTests, catalogProfiles, catalogPackages) {
        (catalogPackages + catalogProfiles + catalogTests).distinctBy { it.id }
    }

    var currentStep by remember { mutableIntStateOf(1) }

    // Step 1: Patient Details
    var patientName by remember { mutableStateOf("") }
    var patientPhone by remember { mutableStateOf("") }
    var patientAge by remember { mutableStateOf("") }
    var patientGender by remember { mutableStateOf("Male") }
    var deliveryAddress by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("Tirupati") }
    var pincode by remember { mutableStateOf("517501") }

    // Step 2: Catalog Selection
    var searchQuery by remember { mutableStateOf("") }
    var selectedItems by remember { mutableStateOf<List<CatalogItem>>(emptyList()) }

    // Step 3: Schedule & Payment
    val slotOptions = listOf(
        "06:30 AM - 07:30 AM (Fasting Early)",
        "07:30 AM - 08:30 AM (Fasting)",
        "08:30 AM - 09:30 AM (Fasting)",
        "09:30 AM - 10:30 AM (Postprandial / Routine)",
        "11:00 AM - 12:30 PM (Mid-Day)",
        "04:00 PM - 05:30 PM (Evening Routine)"
    )
    var selectedSlot by remember { mutableStateOf(slotOptions[1]) }
    var paymentMode by remember { mutableStateOf("DOORSTEP_QR") } // DOORSTEP_QR, CASH, PREPAID_UPI
    var specialNotes by remember { mutableStateOf("") }

    var isSubmitting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val totalOrderPrice = remember(selectedItems) {
        selectedItems.sumOf { it.price }
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
                    Text("Create Manual Order", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Spacer(modifier = Modifier.width(42.dp))
                }

                // 3-Step Indicator Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(PureWhite)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    listOf(1 to "Patient", 2 to "Tests", 3 to "Schedule").forEachIndexed { idx, (num, title) ->
                        val isActive = currentStep == num
                        val isCompleted = currentStep > num
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(22.dp)
                                    .clip(CircleShape)
                                    .background(if (isCompleted) EmeraldAccent else if (isActive) MedTealPrimary else Slate200),
                                contentAlignment = Alignment.Center
                            ) {
                                if (isCompleted) {
                                    Icon(Icons.Default.Check, contentDescription = null, tint = PureWhite, modifier = Modifier.size(12.dp))
                                } else {
                                    Text("$num", fontSize = 11.sp, fontWeight = FontWeight.Black, color = if (isActive) PureWhite else Slate500)
                                }
                            }
                            Text(
                                text = title,
                                fontSize = 12.sp,
                                fontWeight = if (isActive) FontWeight.Black else FontWeight.Bold,
                                color = if (isActive) Slate900 else Slate500
                            )
                        }
                        if (idx < 2) {
                            Box(modifier = Modifier.width(24.dp).height(1.dp).background(Slate200))
                        }
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

                    when (currentStep) {
                        1 -> {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = PureWhite)
                            ) {
                                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                    Text("1. PATIENT DEMOGRAPHICS", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)

                                    OutlinedTextField(
                                        value = patientName,
                                        onValueChange = { patientName = it },
                                        label = { Text("Full Name *") },
                                        placeholder = { Text("e.g. Ramesh Varma") },
                                        modifier = Modifier.fillMaxWidth(),
                                        singleLine = true
                                    )

                                    OutlinedTextField(
                                        value = patientPhone,
                                        onValueChange = { patientPhone = it },
                                        label = { Text("Mobile Phone Number *") },
                                        placeholder = { Text("+91 98765 43210") },
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                        modifier = Modifier.fillMaxWidth(),
                                        singleLine = true
                                    )

                                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                        OutlinedTextField(
                                            value = patientAge,
                                            onValueChange = { patientAge = it },
                                            label = { Text("Age") },
                                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                            modifier = Modifier.weight(1f),
                                            singleLine = true
                                        )

                                        Column(modifier = Modifier.weight(1.5f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                            Text("Gender", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate600)
                                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                                listOf("Male", "Female", "Other").forEach { g ->
                                                    val sel = patientGender == g
                                                    Box(
                                                        modifier = Modifier
                                                            .weight(1f)
                                                            .clip(RoundedCornerShape(8.dp))
                                                            .background(if (sel) MedTealPrimary else Slate100)
                                                            .clickable { patientGender = g }
                                                            .padding(vertical = 10.dp),
                                                        contentAlignment = Alignment.Center
                                                    ) {
                                                        Text(g, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (sel) PureWhite else Slate700)
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    OutlinedTextField(
                                        value = deliveryAddress,
                                        onValueChange = { deliveryAddress = it },
                                        label = { Text("Doorstep Address *") },
                                        modifier = Modifier.fillMaxWidth(),
                                        minLines = 2
                                    )

                                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                        OutlinedTextField(
                                            value = city,
                                            onValueChange = { city = it },
                                            label = { Text("City") },
                                            modifier = Modifier.weight(1f),
                                            singleLine = true
                                        )
                                        OutlinedTextField(
                                            value = pincode,
                                            onValueChange = { pincode = it },
                                            label = { Text("Pincode") },
                                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                            modifier = Modifier.weight(1f),
                                            singleLine = true
                                        )
                                    }
                                }
                            }
                        }

                        2 -> {
                            Text("2. SELECT TESTS & PROFILES", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)

                            OutlinedTextField(
                                value = searchQuery,
                                onValueChange = { searchQuery = it },
                                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                                placeholder = { Text("Search CBC, Thyroid, Lipid, Sugar...") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )

                            if (selectedItems.isNotEmpty()) {
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(containerColor = PureWhite)
                                ) {
                                    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Text("Selected Items (${selectedItems.size}):", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                                        selectedItems.forEach { item ->
                                            Row(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .clip(RoundedCornerShape(8.dp))
                                                    .background(MedTealLight.copy(alpha = 0.4f))
                                                    .padding(8.dp),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text(item.name, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900, modifier = Modifier.weight(1f))
                                                Text("₹${item.price}", fontSize = 12.sp, fontWeight = FontWeight.Black, color = MedTealPrimary)
                                                Spacer(modifier = Modifier.width(8.dp))
                                                Icon(
                                                    Icons.Default.Cancel,
                                                    contentDescription = "Remove",
                                                    tint = RoseError,
                                                    modifier = Modifier
                                                        .size(18.dp)
                                                        .clickable { selectedItems = selectedItems.filterNot { it.id == item.id } }
                                                )
                                            }
                                        }
                                    }
                                }
                            }

                            val filtered = allCatalogItems.filter {
                                searchQuery.isBlank() || it.name.contains(searchQuery, ignoreCase = true)
                            }.take(20)

                            filtered.forEach { test ->
                                val isAdded = selectedItems.any { it.id == test.id }
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = CardDefaults.cardColors(containerColor = PureWhite)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(10.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(test.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                            Text("${test.sampleType ?: "SERUM"} • ${test.fasting ?: "Routine"}", fontSize = 10.sp, color = Slate500)
                                        }
                                        Text("₹${test.price}", fontSize = 13.sp, fontWeight = FontWeight.Black, color = MedTealPrimary)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(if (isAdded) EmeraldAccent else MedTealLight)
                                                .clickable {
                                                    selectedItems = if (isAdded) {
                                                        selectedItems.filterNot { it.id == test.id }
                                                    } else {
                                                        selectedItems + test
                                                    }
                                                }
                                                .padding(horizontal = 10.dp, vertical = 6.dp)
                                        ) {
                                            Text(
                                                text = if (isAdded) "Added" else "+ Add",
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (isAdded) PureWhite else MedTealPrimary
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        3 -> {
                            Text("3. SCHEDULE & PAYMENT COLLECTION", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)

                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = PureWhite)
                            ) {
                                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Text("Select Doorstep Time Slot *", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate700)
                                    slotOptions.forEach { slot ->
                                        val sel = selectedSlot == slot
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(if (sel) MedTealLight else Slate50)
                                                .border(1.dp, if (sel) MedTealPrimary else Slate200, RoundedCornerShape(8.dp))
                                                .clickable { selectedSlot = slot }
                                                .padding(10.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(slot, fontSize = 12.sp, fontWeight = if (sel) FontWeight.Bold else FontWeight.Medium, color = Slate900)
                                            if (sel) {
                                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(16.dp))
                                            }
                                        }
                                    }
                                }
                            }

                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = PureWhite)
                            ) {
                                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Text("Payment Method *", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate700)
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        listOf(
                                            "DOORSTEP_QR" to "Doorstep QR",
                                            "CASH" to "Cash",
                                            "PREPAID_UPI" to "Prepaid UPI"
                                        ).forEach { (mode, title) ->
                                            val sel = paymentMode == mode
                                            Box(
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .clip(RoundedCornerShape(10.dp))
                                                    .background(if (sel) MedTealPrimary else Slate100)
                                                    .clickable { paymentMode = mode }
                                                    .padding(vertical = 10.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Text(title, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (sel) PureWhite else Slate700)
                                            }
                                        }
                                    }
                                }
                            }

                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = PureWhite)
                            ) {
                                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text("ORDER SUMMARY", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Slate500)
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Patient:", fontSize = 12.sp, color = Slate600)
                                        Text(patientName, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                    }
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Selected Tests:", fontSize = 12.sp, color = Slate600)
                                        Text("${selectedItems.size} Items", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                    }
                                    HorizontalDivider(color = Slate200)
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Total Payable", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900)
                                        Text("₹$totalOrderPrice", fontSize = 16.sp, fontWeight = FontWeight.Black, color = MedTealPrimary)
                                    }
                                }
                            }
                        }
                    }
                }

                // Footer Buttons
                HorizontalDivider(color = Slate200)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(PureWhite)
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    if (currentStep > 1) {
                        OutlinedButton(
                            onClick = { currentStep -= 1 },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.height(48.dp)
                        ) {
                            Text("← Back", fontWeight = FontWeight.Bold, color = Slate700)
                        }
                    }

                    Button(
                        onClick = {
                            errorMessage = null
                            when (currentStep) {
                                1 -> {
                                    if (patientName.isBlank() || patientPhone.isBlank() || deliveryAddress.isBlank()) {
                                        errorMessage = "Please fill patient name, phone number, and doorstep address."
                                    } else {
                                        currentStep = 2
                                    }
                                }
                                2 -> {
                                    if (selectedItems.isEmpty()) {
                                        errorMessage = "Please select at least 1 diagnostic test or package."
                                    } else {
                                        currentStep = 3
                                    }
                                }
                                3 -> {
                                    coroutineScope.launch {
                                        isSubmitting = true
                                        val ok = AgentRepository.createManualOrder(
                                            agentId = agentId,
                                            patientName = patientName,
                                            phone = patientPhone,
                                            address = deliveryAddress,
                                            tests = selectedItems.joinToString(", ") { it.name },
                                            amount = totalOrderPrice,
                                            slot = selectedSlot,
                                            age = patientAge.ifBlank { "35" },
                                            gender = patientGender,
                                            city = city,
                                            pincode = pincode,
                                            paymentMode = paymentMode,
                                            notes = specialNotes
                                        )
                                        isSubmitting = false
                                        if (ok) {
                                            onOrderCreated()
                                            onDismiss()
                                        } else {
                                            errorMessage = "Failed to create order. Please try again."
                                        }
                                    }
                                }
                            }
                        },
                        enabled = !isSubmitting,
                        modifier = Modifier.weight(1f).height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = when (currentStep) {
                                1 -> "Next: Select Tests →"
                                2 -> "Next: Schedule & Payment →"
                                else -> if (isSubmitting) "Creating Order..." else "Confirm & Assign Order (₹$totalOrderPrice)"
                            },
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            color = PureWhite
                        )
                    }
                }
            }
        }
    }
}

