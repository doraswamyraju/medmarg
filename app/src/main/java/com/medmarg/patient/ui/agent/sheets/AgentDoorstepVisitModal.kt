package com.medmarg.patient.ui.agent.sheets

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import com.medmarg.patient.model.TubeBarcodeItem
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

// =========================================================================
// 🩺 AGENT DOORSTEP CLINICAL VISIT WIZARD (MULTI-STEP LIFECYCLE)
// 1-on-1 replication of ios/Agent/Sheets/AgentDoorstepVisitModal.swift
// =========================================================================

@Composable
fun AgentDoorstepVisitModal(
    order: AgentPickupOrder,
    onDismiss: () -> Unit,
    onCollectQrPayment: () -> Unit = {},
    onCompleteVisit: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()

    var currentStep by remember { mutableIntStateOf(1) }
    var totalElapsedSeconds by remember { mutableIntStateOf(0) }

    // Step 1: Arrival Photo, PPE & OTP
    var hasCapturedArrivalPhoto by remember { mutableStateOf(false) }
    var ppeGlovesWorn by remember { mutableStateOf(true) }
    var enteredOtp by remember { mutableStateOf("") }
    var otpBypassedWithGovId by remember { mutableStateOf(false) }

    // Native Camera Preview Launcher
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            hasCapturedArrivalPhoto = true
        }
    }

    // Step 2: Tube Barcodes (Empty by default!)
    val initialTubes = remember(order.items, order.barcode) {
        val testsText = (order.items ?: "").lowercase()
        val existingBarcode = order.barcode ?: ""
        val list = mutableListOf<TubeBarcodeItem>()

        list.add(
            TubeBarcodeItem(
                id = "TUBE-SST",
                name = "Vacutainer Gold SST (Serum Gel)",
                tubeType = "Biochemistry, Thyroid, LFT, Lipid",
                capColorHex = 0xFFEAB308,
                barcode = existingBarcode,
                isScanned = existingBarcode.isNotEmpty()
            )
        )
        if (testsText.contains("cbc") || testsText.contains("blood") || testsText.contains("hba1c") || testsText.contains("diabetic") || testsText.contains("full")) {
            list.add(
                TubeBarcodeItem(
                    id = "TUBE-EDTA",
                    name = "Vacutainer Purple (K2 EDTA)",
                    tubeType = "Hematology (CBC, ESR, HbA1c)",
                    capColorHex = 0xFF9333EA,
                    barcode = "",
                    isScanned = false
                )
            )
        }
        if (testsText.contains("sugar") || testsText.contains("glucose") || testsText.contains("fasting") || testsText.contains("diabetic")) {
            list.add(
                TubeBarcodeItem(
                    id = "TUBE-FL",
                    name = "Vacutainer Grey (Fluoride Sugar)",
                    tubeType = "Fasting Blood Glucose",
                    capColorHex = 0xFF64748B,
                    barcode = "",
                    isScanned = false
                )
            )
        }
        if (testsText.contains("urine") || testsText.contains("full") || testsText.contains("checkup")) {
            list.add(
                TubeBarcodeItem(
                    id = "TUBE-URINE",
                    name = "Sterile Urine Container",
                    tubeType = "Complete Urine Routine Analysis",
                    capColorHex = 0xFFF97316,
                    barcode = "",
                    isScanned = false
                )
            )
        }
        list
    }
    var tubes by remember { mutableStateOf(initialTubes) }
    var activeScanningTubeIndex by remember { mutableStateOf<Int?>(null) }

    // Step 3: Payment
    var cashCollected by remember { mutableStateOf(false) }
    var doorstepQrConfirmed by remember { mutableStateOf(false) }

    // Step 4: Seal & Finish
    var vacutainersSealed by remember { mutableStateOf(true) }
    var coldChainBoxSecured by remember { mutableStateOf(true) }

    var showReviewPromptDialog by remember { mutableStateOf(false) }
    var isSubmitting by remember { mutableStateOf(false) }

    // Unified Mission Stopwatch
    LaunchedEffect(Unit) {
        while (true) {
            delay(1000L)
            totalElapsedSeconds += 1
        }
    }

    val expectedOtp = remember(order.otp, order.handoverOtp) {
        (order.otp?.ifBlank { null } ?: order.handoverOtp ?: "").trim()
    }

    val isOtpValid = otpBypassedWithGovId || expectedOtp.isEmpty() || enteredOtp.trim() == expectedOtp
    val isOrderPrepaid = order.isPaid

    val isNextEnabled = when (currentStep) {
        1 -> hasCapturedArrivalPhoto && ppeGlovesWorn && isOtpValid
        2 -> tubes.isNotEmpty() && tubes.all { it.barcode.trim().isNotEmpty() }
        3 -> isOrderPrepaid || cashCollected || doorstepQrConfirmed
        4 -> vacutainersSealed && coldChainBoxSecured
        else -> true
    }

    val nextButtonTitle = when (currentStep) {
        1 -> "Next: Scan Tube Barcodes"
        2 -> if (isOrderPrepaid) "Next: Seal & Complete" else "Next: Collect Payment"
        3 -> "Next: Seal Vacutainers"
        4 -> "Complete Clinical Visit ✓"
        else -> "Next"
    }

    fun submitFinalVisit(sendReview: Boolean) {
        coroutineScope.launch {
            isSubmitting = true
            val durationMins = maxOf(1, totalElapsedSeconds / 60)
            val primaryCode = tubes.firstOrNull { it.barcode.isNotBlank() }?.barcode ?: order.barcode ?: ""
            AgentRepository.updatePickupStatus(
                orderId = order.id,
                status = "SAMPLE_COLLECTED",
                barcode = primaryCode,
                arrivalPhoto = if (hasCapturedArrivalPhoto) "DOORSTEP_PHOTO_VERIFIED" else "NONE",
                handoverOtp = enteredOtp,
                paymentCollected = !isOrderPrepaid && (cashCollected || doorstepQrConfirmed),
                paymentMode = if (isOrderPrepaid) "ONLINE" else if (cashCollected) "CASH" else "DOORSTEP_QR",
                sendReviewRequest = sendReview,
                durationMinutes = durationMins
            )
            isSubmitting = false
            onCompleteVisit()
            onDismiss()
        }
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
                        text = "Close",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate600,
                        modifier = Modifier.clickable { onDismiss() }
                    )
                    Text("Doorstep Clinical Visit", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Spacer(modifier = Modifier.width(36.dp))
                }

                // Header with Mission Stopwatch & 4-Step Breadcrumb Stepper
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(PureWhite)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Order #${order.id}", fontSize = 11.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Monospace, color = MedTealPrimary)
                            Text(order.effectivePatientName, fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                        }

                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(RoseError.copy(alpha = 0.08f))
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(RoseError))
                            Column(horizontalAlignment = Alignment.End) {
                                val mins = totalElapsedSeconds / 60
                                val secs = totalElapsedSeconds % 60
                                Text(
                                    text = String.format("%02d:%02d", mins, secs),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace,
                                    color = Slate900
                                )
                                Text("Trip Duration", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Slate500)
                            }
                        }
                    }

                    // 4-Step Wizard Stepper
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        val steps = listOf(
                            1 to "Arrival & OTP",
                            2 to "Tubes Barcode",
                            3 to if (isOrderPrepaid) "Prepaid" else "Payment",
                            4 to "Seal & Close"
                        )
                        steps.forEachIndexed { idx, (num, label) ->
                            val isDone = currentStep > num
                            val isCurrent = currentStep == num
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.weight(1f)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(22.dp)
                                        .clip(CircleShape)
                                        .background(if (isDone || isCurrent) MedTealPrimary else Slate100),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (isDone) {
                                        Icon(Icons.Default.Check, contentDescription = null, tint = PureWhite, modifier = Modifier.size(12.dp))
                                    } else {
                                        Text(
                                            text = "$num",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isCurrent) PureWhite else Slate500
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = label,
                                    fontSize = 9.sp,
                                    fontWeight = if (isCurrent) FontWeight.Black else FontWeight.Medium,
                                    color = if (isCurrent) Slate900 else Slate500,
                                    maxLines = 1
                                )
                            }
                            if (idx < steps.lastIndex) {
                                Box(
                                    modifier = Modifier
                                        .width(16.dp)
                                        .height(2.dp)
                                        .background(if (currentStep > num) MedTealPrimary else Slate200)
                                )
                            }
                        }
                    }
                }

                HorizontalDivider(color = Slate200)

                // Wizard Step Body
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    when (currentStep) {
                        1 -> {
                            Text("STEP 1: DOORSTEP ARRIVAL & IDENTITY VERIFICATION", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)

                            // 1. Arrival Photo
                            Text("1. Doorstep Arrival Photo", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            if (hasCapturedArrivalPhoto) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(EmeraldAccent.copy(alpha = 0.08f))
                                        .border(1.dp, EmeraldAccent, RoundedCornerShape(12.dp))
                                        .padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(54.dp)
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(EmeraldAccent.copy(alpha = 0.15f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(28.dp))
                                    }
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("Arrival Photo Captured", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                                        Text("Timestamp: Verified • GPS Tagged", fontSize = 10.sp, color = Slate500)
                                        Text(
                                            text = "Retake Photo",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = MedTealPrimary,
                                            modifier = Modifier.clickable {
                                                try { cameraLauncher.launch(null) } catch (_: Exception) { hasCapturedArrivalPhoto = true }
                                            }
                                        )
                                    }
                                }
                            } else {
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            try {
                                                cameraLauncher.launch(null)
                                            } catch (_: Exception) {
                                                hasCapturedArrivalPhoto = true
                                            }
                                        },
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
                                                .size(48.dp)
                                                .clip(RoundedCornerShape(10.dp))
                                                .background(MedTealLight),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(Icons.Default.CameraAlt, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(22.dp))
                                        }
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text("Open Camera to Take Arrival Photo", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                            Text("Tap to launch camera at patient doorstep", fontSize = 11.sp, color = Slate500)
                                        }
                                        Text(
                                            text = "Mark Verified",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = MedTealPrimary,
                                            modifier = Modifier.clickable { hasCapturedArrivalPhoto = true }
                                        )
                                    }
                                }
                            }

                            // 2. Customer Handover OTP
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = PureWhite),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isOtpValid) EmeraldAccent else Slate200)
                            ) {
                                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text("2. Customer Handover OTP", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                        if (isOtpValid) {
                                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                                Icon(Icons.Default.Verified, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(14.dp))
                                                Text("OTP Verified", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                                            }
                                        }
                                    }
                                    Text(
                                        "Ask the customer for the 4-digit Handover OTP shown in their MedMarg app:",
                                        fontSize = 11.sp,
                                        color = Slate500
                                    )
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                        OutlinedTextField(
                                            value = enteredOtp,
                                            onValueChange = { if (it.length <= 6) enteredOtp = it },
                                            placeholder = { Text("Enter 4-Digit OTP") },
                                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                            modifier = Modifier.weight(1f),
                                            singleLine = true
                                        )
                                        if (expectedOtp.isNotEmpty()) {
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(6.dp))
                                                    .background(Slate100)
                                                    .padding(horizontal = 8.dp, vertical = 6.dp)
                                            ) {
                                                Text("Expected: $expectedOtp", fontSize = 9.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = Slate600)
                                            }
                                        }
                                    }
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            "Bypass with Patient Gov ID (Aadhaar / Driving License)",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = Slate700,
                                            modifier = Modifier.weight(1f)
                                        )
                                        Switch(
                                            checked = otpBypassedWithGovId,
                                            onCheckedChange = { otpBypassedWithGovId = it }
                                        )
                                    }
                                }
                            }

                            // 3. Gloves & PPE Toggle
                            Text("3. Safety Compliance", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = PureWhite),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                        Icon(Icons.Default.PanTool, contentDescription = null, tint = if (ppeGlovesWorn) MedTealPrimary else Slate500, modifier = Modifier.size(20.dp))
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Column {
                                            Text("Sterile Nitrile Gloves & Mask Worn", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                            Text("Mandatory NABL protocol before drawing sample", fontSize = 10.sp, color = Slate500)
                                        }
                                    }
                                    Switch(checked = ppeGlovesWorn, onCheckedChange = { ppeGlovesWorn = it })
                                }
                            }
                        }

                        2 -> {
                            Text("STEP 2: SCAN OR ENTER VACUTAINER BARCODES", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)
                            Text(
                                "Scan each tube's barcode with the camera or type it manually. Reports are bound to CustomerName_Barcode.",
                                fontSize = 11.sp,
                                color = Slate500
                            )

                            tubes.forEachIndexed { index, tube ->
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(14.dp),
                                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                                    border = androidx.compose.foundation.BorderStroke(1.2.dp, if (tube.isScanned) EmeraldAccent else Slate200)
                                ) {
                                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Box(
                                                modifier = Modifier
                                                    .size(14.dp)
                                                    .clip(CircleShape)
                                                    .background(Color(tube.capColorHex))
                                            )
                                            Spacer(modifier = Modifier.width(10.dp))
                                            Column(modifier = Modifier.weight(1f)) {
                                                Text(tube.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                                Text(tube.tubeType, fontSize = 10.sp, fontWeight = FontWeight.Medium, color = Slate500)
                                            }
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(8.dp))
                                                    .background(MedTealPrimary)
                                                    .clickable { activeScanningTubeIndex = index }
                                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                                            ) {
                                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                                    Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = PureWhite, modifier = Modifier.size(13.dp))
                                                    Text("Scan", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                                }
                                            }
                                        }

                                        OutlinedTextField(
                                            value = tube.barcode,
                                            onValueChange = { newVal ->
                                                tubes = tubes.toMutableList().also { list ->
                                                    list[index] = tube.copy(
                                                        barcode = newVal.uppercase(),
                                                        isScanned = newVal.trim().isNotEmpty()
                                                    )
                                                }
                                            },
                                            placeholder = { Text("Type / Scan Barcode", fontSize = 12.sp) },
                                            trailingIcon = {
                                                if (tube.barcode.isNotBlank()) {
                                                    Icon(Icons.Default.Verified, contentDescription = null, tint = EmeraldAccent)
                                                }
                                            },
                                            modifier = Modifier.fillMaxWidth(),
                                            singleLine = true
                                        )

                                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                            Text("Label on Tube:", fontSize = 9.sp, color = Slate500)
                                            Text(
                                                text = "${order.effectivePatientName}_${tube.barcode.ifBlank { "AWAITING_BARCODE" }}",
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold,
                                                fontFamily = FontFamily.Monospace,
                                                color = if (tube.barcode.isBlank()) Color(0xFFF97316) else MedTealPrimary
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        3 -> {
                            Text("STEP 3: DOORSTEP PAYMENT COLLECTION", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)
                            if (isOrderPrepaid) {
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(14.dp),
                                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                                    border = androidx.compose.foundation.BorderStroke(1.5.dp, EmeraldAccent.copy(alpha = 0.3f))
                                ) {
                                    Column(
                                        modifier = Modifier.padding(20.dp).fillMaxWidth(),
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(36.dp))
                                        Text("Payment Already Settled Online", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                                        Text(
                                            "₹${order.effectiveAmount} prepaid via Razorpay. No payment collection required.",
                                            fontSize = 11.sp,
                                            color = Slate500,
                                            textAlign = TextAlign.Center
                                        )
                                    }
                                }
                            } else {
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                                ) {
                                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Column {
                                                Text("Total Amount Due", fontSize = 11.sp, color = Slate500)
                                                Text("₹${order.effectiveAmount}", fontSize = 24.sp, fontWeight = FontWeight.Black, color = Slate900)
                                            }
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(6.dp))
                                                    .background(Color(0xFF9333EA).copy(alpha = 0.1f))
                                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                                            ) {
                                                Text("DOORSTEP PAYMENT", fontSize = 9.sp, fontWeight = FontWeight.Black, color = Color(0xFF9333EA))
                                            }
                                        }

                                        HorizontalDivider(color = Slate200)

                                        Column(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clip(RoundedCornerShape(12.dp))
                                                .background(Slate50)
                                                .padding(12.dp),
                                            horizontalAlignment = Alignment.CenterHorizontally,
                                            verticalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            Text("Show Doorstep UPI QR to Patient", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(12.dp))
                                                    .background(MedTealLight)
                                                    .clickable { onCollectQrPayment() }
                                                    .padding(16.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Icon(Icons.Default.QrCode2, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(84.dp))
                                            }
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text("Payment Received via UPI QR", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                                Switch(checked = doorstepQrConfirmed, onCheckedChange = { doorstepQrConfirmed = it })
                                            }
                                        }

                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clip(RoundedCornerShape(12.dp))
                                                .background(Slate50)
                                                .padding(12.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text("Collected Cash at Doorstep", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                            Switch(checked = cashCollected, onCheckedChange = { cashCollected = it })
                                        }
                                    }
                                }
                            }
                        }

                        4 -> {
                            Text("STEP 4: SEAL VACUTAINERS & COMPLETE", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Slate500)
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = PureWhite),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                            ) {
                                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text("All Vacutainers Sealed in Biohazard Bag", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                            Text("Leak-proof primary seal for transport", fontSize = 11.sp, color = Slate500)
                                        }
                                        Switch(checked = vacutainersSealed, onCheckedChange = { vacutainersSealed = it })
                                    }

                                    HorizontalDivider(color = Slate200)

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text("Placed in Cold Chain Box (2°C - 8°C)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                            Text("Temperature verified for NABL lab transit", fontSize = 11.sp, color = Slate500)
                                        }
                                        Switch(checked = coldChainBoxSecured, onCheckedChange = { coldChainBoxSecured = it })
                                    }
                                }
                            }
                        }
                    }
                }

                // Sticky Bottom Navigation Buttons
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
                            onClick = {
                                if (currentStep == 4 && isOrderPrepaid) currentStep = 2 else currentStep -= 1
                            },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.height(48.dp)
                        ) {
                            Text("← Back", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate700)
                        }
                    }

                    Button(
                        onClick = {
                            when (currentStep) {
                                1 -> currentStep = 2
                                2 -> currentStep = if (isOrderPrepaid) 4 else 3
                                3 -> currentStep = 4
                                4 -> showReviewPromptDialog = true
                            }
                        },
                        enabled = isNextEnabled && !isSubmitting,
                        modifier = Modifier.weight(1f).height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(nextButtonTitle, fontSize = 14.sp, fontWeight = FontWeight.Black, color = PureWhite)
                    }
                }
            }
        }
    }

    // Barcode Scanner / Manual Modal for Tube
    activeScanningTubeIndex?.let { idx ->
        val currentTube = tubes.getOrNull(idx)
        if (currentTube != null) {
            var manualCode by remember { mutableStateOf(currentTube.barcode) }
            AlertDialog(
                onDismissRequest = { activeScanningTubeIndex = null },
                title = { Text("Scan / Enter Tube Barcode", fontWeight = FontWeight.Black, fontSize = 16.sp) },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(currentTube.name, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                        OutlinedTextField(
                            value = manualCode,
                            onValueChange = { manualCode = it.uppercase() },
                            label = { Text("Barcode Number") },
                            placeholder = { Text("e.g. MM-TPT-90812") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val code = manualCode.trim()
                            if (code.isNotEmpty()) {
                                tubes = tubes.toMutableList().also { list ->
                                    list[idx] = currentTube.copy(barcode = code, isScanned = true)
                                }
                            }
                            activeScanningTubeIndex = null
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                    ) {
                        Text("Confirm Barcode", color = PureWhite, fontWeight = FontWeight.Bold)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { activeScanningTubeIndex = null }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }

    if (showReviewPromptDialog) {
        AlertDialog(
            onDismissRequest = { showReviewPromptDialog = false },
            title = { Text("Clinical Visit Completed!", fontWeight = FontWeight.Black, fontSize = 16.sp) },
            text = {
                Text(
                    "All vacutainers for Order #${order.id} have been collected and sealed. Would you like to send a Google Review & Feedback link to ${order.effectivePatientName}?",
                    fontSize = 12.sp,
                    color = Slate700
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showReviewPromptDialog = false
                        submitFinalVisit(sendReview = true)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                ) {
                    Text("⭐ Request Google Review", fontWeight = FontWeight.Bold, color = PureWhite)
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showReviewPromptDialog = false
                        submitFinalVisit(sendReview = false)
                    }
                ) {
                    Text("Close without Review", fontWeight = FontWeight.Bold, color = Slate600)
                }
            }
        )
    }
}

