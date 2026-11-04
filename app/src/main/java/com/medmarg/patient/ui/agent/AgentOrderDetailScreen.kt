package com.medmarg.patient.ui.agent

import android.content.Intent
import android.net.Uri
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.ui.agent.sheets.*
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// 📋 AGENT ORDER DETAIL SCREEN (FULL-SCREEN 5-STEP CLINICAL WORKFLOW)
// 1-on-1 replication of ios/Agent/Views/AgentOrderDetailView.swift
// =========================================================================

@Composable
fun AgentOrderDetailScreen(
    initialOrder: AgentPickupOrder,
    agentId: String = "AG-01",
    onBack: () -> Unit,
    onOrderUpdated: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var order by remember(initialOrder) { mutableStateOf(initialOrder) }
    var activeSubTab by remember { mutableStateOf("DETAILS") } // DETAILS, ROUTE, KIT, COLLECTION, PAYMENT
    var isKitAssessed by remember(initialOrder) {
        mutableStateOf(
            initialOrder.kitAssigned == true ||
                initialOrder.kitNotRequired == true ||
                initialOrder.status == "KIT_ASSIGNED" ||
                initialOrder.status == "ENROUTE" ||
                initialOrder.status == "ARRIVED" ||
                initialOrder.status == "SAMPLE_COLLECTED" ||
                initialOrder.status == "DELIVERED" ||
                initialOrder.status == "COMPLETED"
        )
    }

    var actionBanner by remember { mutableStateOf<String?>(null) }

    // Sheets & Modals
    var showOrderedTestsSheet by remember { mutableStateOf(false) }
    var showAssessKitModal by remember { mutableStateOf(false) }
    var showFullScreenNavigation by remember { mutableStateOf(false) }
    var showPreCollectionVitalsSheet by remember { mutableStateOf(false) }
    var showDoorstepVisitModal by remember { mutableStateOf(false) }
    var showDoorstepQrModal by remember { mutableStateOf(false) }
    var showReviewRequestModal by remember { mutableStateOf(false) }
    var showBarcodeInputSheet by remember { mutableStateOf(false) }

    // Alerts
    var showNotReachableAlert by remember { mutableStateOf(false) }
    var showRescheduleAlert by remember { mutableStateOf(false) }
    var showAssessKitRequiredAlert by remember { mutableStateOf(false) }

    val isOrderCompleted = order.status == "SAMPLE_COLLECTED" || order.status == "DELIVERED" || order.status == "COMPLETED"

    val currentStepIndex = when (order.status) {
        "ASSIGNED" -> if (isKitAssessed) 2 else 1
        "KIT_ASSIGNED" -> 2
        "ENROUTE" -> 3
        "ARRIVED" -> 4
        "SAMPLE_COLLECTED", "DELIVERED", "COMPLETED" -> 5
        else -> 1
    }

    fun updateStatus(newStatus: String) {
        order = order.copy(status = newStatus)
        coroutineScope.launch {
            AgentRepository.updatePickupStatus(order.id, newStatus)
            onOrderUpdated()
        }
    }

    fun startMissionTrip() {
        if (!isKitAssessed) {
            showAssessKitRequiredAlert = true
            return
        }
        updateStatus("ENROUTE")
        showFullScreenNavigation = true
    }

    Dialog(
        onDismissRequest = onBack,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = Slate50
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // 1. Topbar with Back button & ON DUTY badge
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(PureWhite)
                        .statusBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.clickable { onBack() }
                    ) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Slate900, modifier = Modifier.size(20.dp))
                        Text("Order Details", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(EmeraldAccent)
                            .padding(horizontal = 10.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(5.dp)
                    ) {
                        Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(PureWhite))
                        Text("ON DUTY", fontSize = 9.sp, fontWeight = FontWeight.Black, color = PureWhite)
                    }
                }

                HorizontalDivider(color = Slate200)

                // 2. Scrollable Body
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(vertical = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Action Banner
                    actionBanner?.let { banner ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(MedTealPrimary)
                                .padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(banner, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PureWhite, modifier = Modifier.weight(1f))
                            Icon(Icons.Default.Close, contentDescription = null, tint = PureWhite, modifier = Modifier.size(14.dp).clickable { actionBanner = null })
                        }
                    }

                    // Order & Patient Header Card
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text("ORD-${order.id}", fontSize = 12.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Monospace, color = Slate900)
                                    val isPrepaid = order.isPaid
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background((if (isPrepaid) Color(0xFF2563EB) else Color(0xFF9333EA)).copy(alpha = 0.12f))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = if (isPrepaid) "PREPAID (ONLINE)" else "DOORSTEP PAYMENT",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Black,
                                            color = if (isPrepaid) Color(0xFF2563EB) else Color(0xFF9333EA)
                                        )
                                    }
                                }

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(MedTealLight)
                                        .padding(horizontal = 8.dp, vertical = 3.dp)
                                ) {
                                    Text(
                                        text = if (isOrderCompleted) "Sample Collected ✓" else "Assigned to You",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MedTealPrimary
                                    )
                                }
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Text(order.effectivePatientName, fontSize = 18.sp, fontWeight = FontWeight.Black, color = Slate900)
                                        Text("♂ 34 yrs", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Slate500)
                                    }
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(order.address ?: "Air Bypass Road, Tirupati", fontSize = 11.sp, color = Slate500)
                                    Text("Slot: ${order.slot ?: "07:30 AM - 08:30 AM"}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                                }

                                // Call & WhatsApp Buttons
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(MedTealPrimary)
                                            .clickable {
                                                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${order.effectivePhone}"))
                                                context.startActivity(intent)
                                            }
                                            .padding(horizontal = 12.dp, vertical = 8.dp)
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                            Icon(Icons.Default.Phone, contentDescription = "Call", tint = PureWhite, modifier = Modifier.size(14.dp))
                                            Text("Call", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                        }
                                    }

                                    Box(
                                        modifier = Modifier
                                            .size(34.dp)
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(EmeraldAccent.copy(alpha = 0.14f))
                                            .clickable {
                                                val cleanPhone = order.effectivePhone.filter { it.isDigit() }
                                                val uri = Uri.parse("https://wa.me/$cleanPhone")
                                                context.startActivity(Intent(Intent.ACTION_VIEW, uri))
                                            },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(Icons.Default.Chat, contentDescription = "WhatsApp", tint = EmeraldAccent, modifier = Modifier.size(16.dp))
                                    }
                                }
                            }
                        }
                    }

                    // 5-Step Stepper Progress Bar
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 12.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            val steps = listOf(
                                1 to "Assigned",
                                2 to "Kit Check",
                                3 to "En Route",
                                4 to "At Doorstep",
                                5 to "Collect"
                            )
                            steps.forEachIndexed { idx, (stepNum, title) ->
                                val isDone = currentStepIndex > stepNum || isOrderCompleted
                                val isActive = currentStepIndex == stepNum && !isOrderCompleted
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Box(
                                        modifier = Modifier
                                            .size(22.dp)
                                            .clip(CircleShape)
                                            .background(
                                                when {
                                                    isDone -> EmeraldAccent
                                                    isActive -> Color(0xFFF97316)
                                                    else -> Slate100
                                                }
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        if (isDone) {
                                            Icon(Icons.Default.Check, contentDescription = null, tint = PureWhite, modifier = Modifier.size(12.dp))
                                        } else {
                                            Text(
                                                text = "$stepNum",
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (isActive) PureWhite else Slate500
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = title,
                                        fontSize = 9.sp,
                                        fontWeight = if (isActive || isDone) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isActive || isDone) Slate900 else Slate500
                                    )
                                }
                                if (idx < steps.lastIndex) {
                                    Box(
                                        modifier = Modifier
                                            .width(18.dp)
                                            .height(2.dp)
                                            .background(if (currentStepIndex > stepNum) EmeraldAccent else Slate200)
                                    )
                                }
                            }
                        }
                    }

                    // 5 Subtab Switcher Pills
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState())
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf(
                            Triple("DETAILS", "Order Details", Icons.Default.Description),
                            Triple("ROUTE", "Route & Navigation", Icons.Default.Map),
                            Triple("KIT", "Kit & Inventory", Icons.Default.Inventory2),
                            Triple("COLLECTION", "Collection", Icons.Default.Science),
                            Triple("PAYMENT", "Payment", Icons.Default.CreditCard)
                        ).forEach { (key, title, icon) ->
                            val isSelected = activeSubTab == key
                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isSelected) MedTealPrimary else PureWhite)
                                    .border(1.dp, if (isSelected) MedTealPrimary else Slate200, RoundedCornerShape(10.dp))
                                    .clickable {
                                        activeSubTab = key
                                        when (key) {
                                            "ROUTE" -> showFullScreenNavigation = true
                                            "KIT" -> showAssessKitModal = true
                                            "COLLECTION" -> {
                                                if (order.phleboVitals == null && !isOrderCompleted) {
                                                    showPreCollectionVitalsSheet = true
                                                } else {
                                                    showDoorstepVisitModal = true
                                                }
                                            }
                                            "PAYMENT" -> {
                                                if (!order.isPaid) showDoorstepQrModal = true
                                            }
                                        }
                                    }
                                    .padding(horizontal = 12.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(icon, contentDescription = null, tint = if (isSelected) PureWhite else Slate700, modifier = Modifier.size(14.dp))
                                Text(title, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (isSelected) PureWhite else Slate700)
                            }
                        }
                    }

                    // Contextual Next Action Card
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isOrderCompleted || isKitAssessed) Color(0xFFF0FDF4) else Color(0xFFFFFBEB)
                        ),
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            (if (isKitAssessed) MedTealPrimary else Color(0xFFF97316)).copy(alpha = 0.3f)
                        )
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                text = "Next Action",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                color = if (isOrderCompleted) EmeraldAccent else if (isKitAssessed) MedTealPrimary else Color(0xFFF97316)
                            )

                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Box(
                                    modifier = Modifier
                                        .size(44.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(
                                            (if (isOrderCompleted) EmeraldAccent else if (isKitAssessed) MedTealPrimary else Color(0xFFF97316)).copy(alpha = 0.14f)
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = when {
                                            isOrderCompleted -> Icons.Default.Verified
                                            order.status == "ARRIVED" -> Icons.Default.MonitorHeart
                                            isKitAssessed -> Icons.Default.Send
                                            else -> Icons.Default.Inventory2
                                        },
                                        contentDescription = null,
                                        tint = if (isOrderCompleted) EmeraldAccent else if (isKitAssessed) MedTealPrimary else Color(0xFFF97316),
                                        modifier = Modifier.size(22.dp)
                                    )
                                }

                                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                    Text(
                                        text = when {
                                            isOrderCompleted -> "Sample Collected & Stored"
                                            order.status == "ARRIVED" && order.phleboVitals == null -> "Record Bedside Vitals"
                                            order.status == "ARRIVED" -> "Collect Sample & Scan Barcodes"
                                            isKitAssessed -> "Start Trip to Doorstep"
                                            else -> "Review Collection Kit"
                                        },
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Slate900
                                    )
                                    Text(
                                        text = when {
                                            isOrderCompleted -> "Specimens sealed and stored in Cold Bag CB-88 (3.8°C). Ready for Lab Handover."
                                            order.status == "ARRIVED" -> "Verify patient handover OTP, record baseline vitals, and scan vacutainer tubes."
                                            isKitAssessed -> "Kit supplies verified & reserved. Begin transit to customer doorstep."
                                            else -> "Verify required tubes and consumables before starting the trip."
                                        },
                                        fontSize = 10.sp,
                                        color = Slate600,
                                        maxLines = 2
                                    )
                                }

                                when {
                                    isOrderCompleted -> {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(EmeraldAccent.copy(alpha = 0.14f))
                                                .padding(horizontal = 10.dp, vertical = 8.dp)
                                        ) {
                                            Text("Collected ✓", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                                        }
                                    }
                                    order.status == "ARRIVED" && order.phleboVitals == null -> {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(MedTealPrimary)
                                                .clickable { showPreCollectionVitalsSheet = true }
                                                .padding(horizontal = 10.dp, vertical = 8.dp)
                                        ) {
                                            Text("Vitals Check >", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                        }
                                    }
                                    order.status == "ARRIVED" -> {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(MedTealPrimary)
                                                .clickable { showDoorstepVisitModal = true }
                                                .padding(horizontal = 10.dp, vertical = 8.dp)
                                        ) {
                                            Text("Collect Now >", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                        }
                                    }
                                    !isKitAssessed -> {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(MedTealPrimary)
                                                .clickable { showAssessKitModal = true }
                                                .padding(horizontal = 10.dp, vertical = 8.dp)
                                        ) {
                                            Text("Review Kit >", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                        }
                                    }
                                    else -> {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(EmeraldAccent)
                                                .clickable { startMissionTrip() }
                                                .padding(horizontal = 10.dp, vertical = 8.dp)
                                        ) {
                                            Text("Start Trip >", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Ordered Tests / Package Card (Opens AgentOrderedTestsBottomSheet)
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .clickable { showOrderedTestsSheet = true },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Ordered Tests / Package", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                Text("View Details >", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                            }

                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Box(
                                    modifier = Modifier
                                        .size(44.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(MedTealLight),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.Inventory2, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(20.dp))
                                }

                                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                    Text(order.items ?: "Extensive Full Body Health Checkup", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Text("24 Tests | Home Collection", fontSize = 10.sp, color = Slate500)
                                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        RequirementTagPill("Blood", RoseError)
                                        RequirementTagPill("Urine", Color(0xFFF97316))
                                        RequirementTagPill("Fasting Required", Color(0xFFB45309))
                                    }
                                }

                                Column(horizontalAlignment = Alignment.End) {
                                    Text("₹${order.effectiveAmount}", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                                    Text("View All >", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                                }
                            }
                        }
                    }

                    // Patient & Visit Information Card
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Patient & Visit Information", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                Text(
                                    text = if (order.barcode.isNullOrBlank()) "+ Bind Barcode" else "Barcode: ${order.barcode}",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MedTealPrimary,
                                    modifier = Modifier.clickable { showBarcodeInputSheet = true }
                                )
                            }

                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                InfoMiniBlock("Gender / Age", "Male, 34 yrs", Icons.Default.Person, Modifier.weight(1f))
                                InfoMiniBlock("Patient Name", order.effectivePatientName, Icons.Default.AccountCircle, Modifier.weight(1f))
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                InfoMiniBlock("Contact Number", order.effectivePhone, Icons.Default.Phone, Modifier.weight(1f))
                                InfoMiniBlock("Address", order.address ?: "Air Bypass Road, Tirupati", Icons.Default.LocationOn, Modifier.weight(1f))
                            }
                        }
                    }

                    // Payment Information Card
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Payment Information", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                if (!order.isPaid) {
                                    Text(
                                        text = "Show Doorstep QR >",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MedTealPrimary,
                                        modifier = Modifier.clickable { showDoorstepQrModal = true }
                                    )
                                }
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Payment Status", fontSize = 9.sp, color = Slate500)
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        Text(
                                            text = if (order.isPaid) "Prepaid (Online)" else "Doorstep QR",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Slate900
                                        )
                                        if (order.isPaid) {
                                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(12.dp))
                                        }
                                    }
                                }

                                Column {
                                    Text("Amount Paid", fontSize = 9.sp, color = Slate500)
                                    Text("₹${order.effectiveAmount}", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900)
                                    Text(if (order.isPaid) "Paid via Razorpay" else "Pending Collection", fontSize = 8.sp, color = Slate500)
                                }

                                Column(horizontalAlignment = Alignment.End) {
                                    Text("Transaction ID", fontSize = 9.sp, color = Slate500)
                                    Text(order.transactionId ?: "pay_Mm2h9X7a3K", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = Slate700)
                                    Text("Today, 10:12 AM", fontSize = 8.sp, color = Slate500)
                                }
                            }
                        }
                    }

                    // Route & Live Location Preview Card
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Route & Live Location", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                Text(
                                    text = "Open in Maps >",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF2563EB),
                                    modifier = Modifier.clickable { showFullScreenNavigation = true }
                                )
                            }

                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                // Mini Map Preview Box
                                Box(
                                    modifier = Modifier
                                        .width(155.dp)
                                        .height(86.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(Color(0xFFDBEAFE))
                                        .clickable { showFullScreenNavigation = true }
                                ) {
                                    Icon(
                                        Icons.Default.Map,
                                        contentDescription = null,
                                        tint = Color(0xFF2563EB).copy(alpha = 0.35f),
                                        modifier = Modifier.size(48.dp).align(Alignment.Center)
                                    )
                                    Row(
                                        modifier = Modifier
                                            .align(Alignment.BottomStart)
                                            .padding(6.dp)
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(Color.Black.copy(alpha = 0.68f))
                                            .padding(horizontal = 6.dp, vertical = 3.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(Color(0xFF38BDF8)))
                                        Text("3.2 km • 10 mins", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                    }
                                }

                                // Right Action Column
                                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    if (isOrderCompleted) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clip(RoundedCornerShape(10.dp))
                                                .background(EmeraldAccent.copy(alpha = 0.12f))
                                                .padding(vertical = 10.dp),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text("✓ Visit Completed", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                                        }
                                        Text("Sample Collected at Doorstep", fontSize = 9.sp, color = Slate500)
                                    } else {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clip(RoundedCornerShape(10.dp))
                                                .background(
                                                    if (isKitAssessed) Brush.horizontalGradient(listOf(EmeraldAccent, MedTealPrimary))
                                                    else Brush.horizontalGradient(listOf(Color(0xFFF97316), Color(0xFFEA580C)))
                                                )
                                                .clickable { startMissionTrip() }
                                                .padding(vertical = 10.dp),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                                                Icon(
                                                    imageVector = if (isKitAssessed) Icons.Default.Send else Icons.Default.Lock,
                                                    contentDescription = null,
                                                    tint = PureWhite,
                                                    modifier = Modifier.size(13.dp)
                                                )
                                                Text(
                                                    text = if (isKitAssessed) "Start Trip" else "Assess Kit First",
                                                    fontSize = 12.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = PureWhite
                                                )
                                            }
                                        }
                                        Text(
                                            text = if (isKitAssessed) "Use this after confirming kit is ready" else "Kit assessment or exemption required",
                                            fontSize = 9.sp,
                                            color = Slate500
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))
                }

                // 3. Bottom Fixed Action Footer Bar
                HorizontalDivider(color = Slate200)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(PureWhite)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (isOrderCompleted) {
                        Row(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(Slate100)
                                .clickable { showReviewRequestModal = true }
                                .padding(horizontal = 12.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(Icons.Default.Star, contentDescription = null, tint = Color(0xFFF97316), modifier = Modifier.size(14.dp))
                            Text(
                                text = if (order.reviewStatus == "REVIEW_SUBMITTED") "Review Received ★ 5.0"
                                else if (order.reviewRequestSent == true) "Review Request Dispatched"
                                else "Send Google Review Link",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate700
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(EmeraldAccent)
                                .padding(horizontal = 16.dp, vertical = 12.dp)
                        ) {
                            Text("✓ Sample Collected", fontSize = 12.sp, fontWeight = FontWeight.Black, color = PureWhite)
                        }
                    } else {
                        // Mark as Not Reachable
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color(0xFFFEF2F2))
                                .clickable { showNotReachableAlert = true }
                                .padding(horizontal = 10.dp, vertical = 11.dp)
                        ) {
                            Text("Not Reachable", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = RoseError)
                        }

                        // Reschedule
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(PureWhite)
                                .border(1.dp, Slate200, RoundedCornerShape(10.dp))
                                .clickable { showRescheduleAlert = true }
                                .padding(horizontal = 10.dp, vertical = 11.dp)
                        ) {
                            Text("Reschedule", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate900)
                        }

                        // Primary Action Button
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(
                                    when {
                                        order.status == "ARRIVED" -> EmeraldAccent
                                        isKitAssessed -> MedTealPrimary
                                        else -> Color(0xFFF97316)
                                    }
                                )
                                .clickable {
                                    when {
                                        order.status == "ARRIVED" -> showDoorstepVisitModal = true
                                        else -> startMissionTrip()
                                    }
                                }
                                .padding(vertical = 11.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = when {
                                    order.status == "ARRIVED" -> "Collect Sample"
                                    isKitAssessed -> "Start Trip"
                                    else -> "Assess Kit First"
                                },
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = PureWhite
                            )
                        }
                    }
                }
            }
        }
    }

    // Sub-Sheets & Modals
    if (showOrderedTestsSheet) {
        AgentOrderedTestsBottomSheet(
            order = order,
            onDismiss = { showOrderedTestsSheet = false },
            onAssessKitTap = {
                showOrderedTestsSheet = false
                showAssessKitModal = true
            }
        )
    }

    if (showAssessKitModal) {
        AgentAssessAssignKitModal(
            order = order,
            agentId = agentId,
            onDismiss = { showAssessKitModal = false },
            onKitAssigned = {
                isKitAssessed = true
                order = order.copy(kitAssigned = true, status = "KIT_ASSIGNED")
                actionBanner = "Kit assigned & verified from your field bag!"
                onOrderUpdated()
            }
        )
    }

    if (showFullScreenNavigation) {
        FullScreenInAppMapModal(
            order = order,
            onDismiss = { showFullScreenNavigation = false },
            onMarkArrived = {
                updateStatus("ARRIVED")
                showPreCollectionVitalsSheet = true
            }
        )
    }

    if (showPreCollectionVitalsSheet) {
        AgentPreCollectionVitalsSheet(
            order = order,
            onDismiss = { showPreCollectionVitalsSheet = false },
            onVitalsRecorded = { vitals ->
                order = order.copy(status = "ARRIVED", phleboVitals = vitals)
                showPreCollectionVitalsSheet = false
                showDoorstepVisitModal = true
                onOrderUpdated()
            }
        )
    }

    if (showDoorstepVisitModal) {
        AgentDoorstepVisitModal(
            order = order,
            onDismiss = { showDoorstepVisitModal = false },
            onCollectQrPayment = {
                showDoorstepVisitModal = false
                showDoorstepQrModal = true
            },
            onCompleteVisit = {
                order = order.copy(status = "SAMPLE_COLLECTED")
                showDoorstepVisitModal = false
                actionBanner = "Samples collected & sealed in Cold Box!"
                onOrderUpdated()
            }
        )
    }

    if (showDoorstepQrModal) {
        AgentDoorstepQrPaymentModal(
            order = order,
            onDismiss = { showDoorstepQrModal = false },
            onPaymentDone = {
                order = order.copy(paymentStatus = "PAID_DOORSTEP_QR")
                showDoorstepQrModal = false
                actionBanner = "Doorstep QR Payment of ₹${order.effectiveAmount} verified!"
                onOrderUpdated()
            }
        )
    }

    if (showReviewRequestModal) {
        AgentReviewRequestModal(
            order = order,
            onDismiss = { showReviewRequestModal = false },
            onDone = {
                order = order.copy(reviewRequestSent = true)
                actionBanner = "5-Star Google Review link sent to ${order.effectivePatientName}!"
                onOrderUpdated()
            }
        )
    }

    if (showBarcodeInputSheet) {
        var codeInput by remember { mutableStateOf(order.barcode ?: "") }
        AlertDialog(
            onDismissRequest = { showBarcodeInputSheet = false },
            title = { Text("Bind Vacutainer Barcode", fontWeight = FontWeight.Black, fontSize = 16.sp) },
            text = {
                OutlinedTextField(
                    value = codeInput,
                    onValueChange = { codeInput = it.uppercase() },
                    label = { Text("Barcode ID") },
                    placeholder = { Text("e.g. MM-TPT-90812") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        val clean = codeInput.trim()
                        if (clean.isNotEmpty()) {
                            coroutineScope.launch {
                                AgentRepository.saveBarcodeToOrder(order.id, clean)
                                order = order.copy(barcode = clean)
                                actionBanner = "Barcode $clean bound to ${order.effectivePatientName}!"
                                onOrderUpdated()
                            }
                        }
                        showBarcodeInputSheet = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                ) {
                    Text("Save Barcode", color = PureWhite, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showBarcodeInputSheet = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    if (showNotReachableAlert) {
        AlertDialog(
            onDismissRequest = { showNotReachableAlert = false },
            title = { Text("Customer Marked Not Reachable", fontWeight = FontWeight.Black, fontSize = 16.sp) },
            text = { Text("Automated notification dispatched to ${order.effectivePatientName}. Customer support will coordinate a callback.", fontSize = 12.sp) },
            confirmButton = {
                Button(onClick = { showNotReachableAlert = false }, colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)) {
                    Text("OK", color = PureWhite)
                }
            }
        )
    }

    if (showRescheduleAlert) {
        AlertDialog(
            onDismissRequest = { showRescheduleAlert = false },
            title = { Text("Reschedule Request Logged", fontWeight = FontWeight.Black, fontSize = 16.sp) },
            text = { Text("Reschedule window opened for Central Fleet Dispatcher coordination.", fontSize = 12.sp) },
            confirmButton = {
                Button(onClick = { showRescheduleAlert = false }, colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)) {
                    Text("OK", color = PureWhite)
                }
            }
        )
    }

    if (showAssessKitRequiredAlert) {
        AlertDialog(
            onDismissRequest = { showAssessKitRequiredAlert = false },
            title = { Text("Kit Assessment Required", fontWeight = FontWeight.Black, fontSize = 16.sp) },
            text = { Text("You must assess and assign your collection kit or mark kit as not required before starting this trip.", fontSize = 12.sp) },
            confirmButton = {
                Button(
                    onClick = {
                        showAssessKitRequiredAlert = false
                        showAssessKitModal = true
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                ) {
                    Text("Assess Kit Now", color = PureWhite, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAssessKitRequiredAlert = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun RequirementTagPill(text: String, color: Color) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(color.copy(alpha = 0.1f))
            .padding(horizontal = 5.dp, vertical = 2.dp)
    ) {
        Text(text, fontSize = 8.sp, fontWeight = FontWeight.Bold, color = color)
    }
}

@Composable
private fun InfoMiniBlock(title: String, value: String, icon: ImageVector, modifier: Modifier = Modifier) {
    Row(modifier = modifier, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        Icon(icon, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
        Column {
            Text(title, fontSize = 9.sp, color = Slate500)
            Text(value, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate900, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
    }
}

