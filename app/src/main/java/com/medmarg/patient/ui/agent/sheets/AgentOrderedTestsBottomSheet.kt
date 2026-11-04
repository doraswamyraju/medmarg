package com.medmarg.patient.ui.agent.sheets

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.data.CatalogStore
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.model.OrderedTestDisplayItem
import com.medmarg.patient.ui.theme.*

// =========================================================================
// 🧪 AGENT ORDERED TESTS & PACKAGES BOTTOM SHEET
// 1-on-1 replication of ios/Agent/Sheets/AgentOrderedTestsBottomSheet.swift
// =========================================================================

@Composable
fun AgentOrderedTestsBottomSheet(
    order: AgentPickupOrder,
    onDismiss: () -> Unit,
    onAssessKitTap: () -> Unit
) {
    val catalogTests by CatalogStore.tests.collectAsState()
    val catalogProfiles by CatalogStore.profiles.collectAsState()
    val catalogPackages by CatalogStore.packages.collectAsState()

    val resolvedItems = remember(order.items, catalogTests, catalogProfiles, catalogPackages) {
        val rawItemsString = order.items ?: ""
        val splitNames = rawItemsString.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        val namesToSearch = if (splitNames.isEmpty()) listOf("Extensive Full Body Health Checkup") else splitNames

        namesToSearch.map { name ->
            val pkg = catalogPackages.firstOrNull { it.name.contains(name, ignoreCase = true) || name.contains(it.name, ignoreCase = true) }
            val prof = catalogProfiles.firstOrNull { it.name.contains(name, ignoreCase = true) || name.contains(it.name, ignoreCase = true) }
            val test = catalogTests.firstOrNull { it.name.contains(name, ignoreCase = true) || name.contains(it.name, ignoreCase = true) }

            when {
                pkg != null -> OrderedTestDisplayItem(
                    name = pkg.name,
                    category = "HEALTH PACKAGE",
                    testsCount = pkg.testCount ?: 24,
                    sampleType = "Whole Blood EDTA, Serum SST Gel, Fluoride Plasma, Urine",
                    fasting = pkg.fasting ?: "8-10 Hours Overnight Fasting",
                    tat = "Reports within 6 Hours (NABL Certified)",
                    mrp = pkg.mrp,
                    offerPrice = pkg.price,
                    profiles = listOf(
                        "Complete Hemogram (24 Parameters)",
                        "Lipid Profile (Cholesterol, Triglycerides, HDL, LDL, VLDL)",
                        "Liver Function Test (Bilirubin, SGOT, SGPT, ALP, Proteins)",
                        "Renal / Kidney Function Test (Creatinine, Urea, Uric Acid, BUN)",
                        "Thyroid Profile (Total T3, Total T4, Ultrasensitive TSH)",
                        "Diabetes Screen (Fasting Blood Sugar, HbA1c Glycated)",
                        "Complete Urine Routine Analysis (10 Parameters)"
                    )
                )
                prof != null -> OrderedTestDisplayItem(
                    name = prof.name,
                    category = "DIAGNOSTIC PROFILE",
                    testsCount = prof.testCount ?: 8,
                    sampleType = prof.sampleType ?: "Serum SST Gel, Fluoride Plasma",
                    fasting = prof.fasting ?: "8 Hours Fasting",
                    tat = "Same Day Reporting",
                    mrp = prof.mrp,
                    offerPrice = prof.price,
                    profiles = listOf(
                        "Primary Diagnostic Pathology Battery",
                        "Differential Parameters & Organ Biomarkers"
                    )
                )
                test != null -> OrderedTestDisplayItem(
                    name = test.name,
                    category = "CLINICAL TEST",
                    testsCount = 1,
                    sampleType = test.sampleType ?: "Whole Blood / Serum",
                    fasting = test.fasting ?: "Non-Fasting",
                    tat = "Same Day Reporting",
                    mrp = test.mrp,
                    offerPrice = test.price,
                    profiles = listOf(test.name)
                )
                else -> OrderedTestDisplayItem(
                    name = name.ifEmpty { "Extensive Full Body Health Checkup" },
                    category = if (name.lowercase().contains("profile")) "DIAGNOSTIC PROFILE" else "HEALTH PACKAGE",
                    testsCount = 24,
                    sampleType = "Lavender EDTA (Blood), Gold SST (Serum), Grey (Fluoride), Urine Container",
                    fasting = "8-10 Hours Overnight Fasting Required",
                    tat = "Reports within 6 Hours (NABL Certified)",
                    mrp = maxOf(order.effectiveAmount, 4999),
                    offerPrice = maxOf(order.effectiveAmount, 3699),
                    profiles = listOf(
                        "Complete Hemogram CBC (24 Parameters)",
                        "Lipid Screen (Cholesterol, HDL, LDL, Triglycerides)",
                        "Liver Function Test LFT (SGOT, SGPT, Bilirubin)",
                        "Kidney Function Test KFT (Creatinine, BUN, Urea)",
                        "Thyroid Profile Total (T3, T4, TSH)",
                        "Diabetic Screen (HbA1c & Fasting Glucose)",
                        "Urine Routine & Microscopic Examination"
                    )
                )
            }
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 40.dp),
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
                        text = "Done",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = MedTealPrimary,
                        modifier = Modifier.clickable { onDismiss() }
                    )
                    Text(
                        text = "Ordered Tests & Profiles",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )
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
                    // 1. Order Meta Header Banner
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
                                    Text(order.id, fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = Slate500)
                                    val isPrepaid = order.isPaid
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background((if (isPrepaid) Color(0xFF2563EB) else Color(0xFF9333EA)).copy(alpha = 0.1f))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = if (isPrepaid) "PREPAID ONLINE" else "DOORSTEP PAYMENT",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Black,
                                            color = if (isPrepaid) Color(0xFF2563EB) else Color(0xFF9333EA)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(order.effectivePatientName, fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                                Text(order.address ?: "Tirupati", fontSize = 11.sp, color = Slate500, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("₹${order.effectiveAmount}", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Slate900)
                                Text(order.slot ?: "Today Morning", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = MedTealPrimary)
                            }
                        }
                    }

                    // 2. Item Cards
                    resolvedItems.forEach { item ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = PureWhite),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                        ) {
                            Column(
                                modifier = Modifier.padding(14.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(4.dp))
                                                .background(MedTealLight)
                                                .padding(horizontal = 6.dp, vertical = 2.dp)
                                        ) {
                                            Text(item.category, fontSize = 9.sp, fontWeight = FontWeight.Black, color = MedTealPrimary)
                                        }
                                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                            Text(
                                                text = "₹${item.mrp}",
                                                fontSize = 11.sp,
                                                color = Slate500,
                                                textDecoration = TextDecoration.LineThrough
                                            )
                                            Text("₹${item.offerPrice}", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900)
                                        }
                                    }
                                    Text(item.name, fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                                    Text("${item.testsCount} Diagnostic Tests Included", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate700)
                                }

                                HorizontalDivider(color = Slate200)

                                // Specimen & Fasting Rules
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(Slate50)
                                        .padding(10.dp),
                                    verticalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Icon(Icons.Default.WaterDrop, contentDescription = null, tint = RoseError, modifier = Modifier.size(14.dp))
                                        Text("Sample Required: ${item.sampleType}", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate700)
                                    }
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Icon(Icons.Default.Schedule, contentDescription = null, tint = Color(0xFFF97316), modifier = Modifier.size(14.dp))
                                        Text("Fasting: ${item.fasting}", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate700)
                                    }
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
                                        Text("TAT: ${item.tat}", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Slate700)
                                    }
                                }

                                // Test Batteries Included
                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text("TEST BATTERIES & PARAMETERS INCLUDED", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Slate500)
                                    item.profiles.forEach { prof ->
                                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
                                            Text(prof, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate900)
                                        }
                                    }
                                }

                                // Direct Assess Kit Button
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(MedTealLight)
                                        .clickable {
                                            onDismiss()
                                            onAssessKitTap()
                                        }
                                        .padding(vertical = 10.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Icon(Icons.Default.Inventory2, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
                                        Text("Assess & Verify Kit for These Tests", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                                    }
                                }
                            }
                        }
                    }

                    // 3. Lab Hub Info Card
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
                            Icon(Icons.Default.Business, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(28.dp))
                            Column {
                                Text(order.labName ?: "MedMarg Central Pathology Hub", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                Text("NABL ISO 15189 Certified Reference Lab • Tirupati", fontSize = 10.sp, color = Slate500)
                            }
                        }
                    }
                }
            }
        }
    }
}

