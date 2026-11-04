package com.medmarg.patient.ui.agent.sheets

import androidx.compose.foundation.background
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// =========================================================================
// 💳 AGENT DOORSTEP QR PAYMENT MODAL (RAZORPAY DYNAMIC UPI QR)
// 1-on-1 replication of ios/Agent/Sheets/AgentDoorstepQrPaymentModal.swift
// =========================================================================

@Composable
fun AgentDoorstepQrPaymentModal(
    order: AgentPickupOrder,
    onDismiss: () -> Unit,
    onPaymentDone: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var isLoading by remember { mutableStateOf(true) }
    var upiString by remember { mutableStateOf<String?>(null) }
    var isPaymentDetected by remember { mutableStateOf(false) }

    LaunchedEffect(order.id) {
        isLoading = true
        val (_, upi) = AgentRepository.generateDoorstepQr(
            orderId = order.id,
            amount = order.effectiveAmount,
            patientName = order.effectivePatientName,
            patientPhone = order.effectivePhone
        )
        upiString = upi ?: "upi://pay?pa=medmarg@razorpay&pn=MedMarg%20Diagnostics&am=${order.effectiveAmount}&cu=INR"
        isLoading = false

        // Poll every 3 seconds like iOS
        while (!isPaymentDetected) {
            delay(3000L)
            val paid = AgentRepository.checkOrderPaymentStatus(order.id)
            if (paid) {
                isPaymentDetected = true
                delay(1200L)
                onPaymentDone()
                onDismiss()
                break
            }
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            shape = RoundedCornerShape(24.dp),
            color = Slate50
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    Text(
                        text = "Close",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate600,
                        modifier = Modifier.clickable { onDismiss() }
                    )
                }

                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("Razorpay Doorstep UPI QR", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Text("Order #${order.id} • ${order.effectivePatientName}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                }

                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text("AMOUNT TO COLLECT", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Slate500)
                    Text("₹${order.effectiveAmount}", fontSize = 32.sp, fontWeight = FontWeight.Black, color = MedTealPrimary)
                }

                Box(
                    modifier = Modifier
                        .size(230.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(PureWhite),
                    contentAlignment = Alignment.Center
                ) {
                    if (isLoading) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            CircularProgressIndicator(color = MedTealPrimary, modifier = Modifier.size(28.dp))
                            Text("Generating Secure UPI QR...", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate500)
                        }
                    } else {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.QrCode2, contentDescription = "UPI QR", tint = Slate800, modifier = Modifier.size(170.dp))
                            Text(
                                text = "medmarg@razorpay",
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                color = Slate500
                            )
                        }
                    }

                    if (isPaymentDetected) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(EmeraldAccent.copy(alpha = 0.92f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = PureWhite, modifier = Modifier.size(48.dp))
                                Text("Payment Received!", fontSize = 16.sp, fontWeight = FontWeight.Black, color = PureWhite)
                            }
                        }
                    }
                }

                Text(
                    "Ask the patient to scan with Google Pay, PhonePe, or Paytm",
                    fontSize = 11.sp,
                    color = Slate500,
                    textAlign = TextAlign.Center
                )

                Button(
                    onClick = {
                        coroutineScope.launch {
                            AgentRepository.updatePickupStatus(
                                orderId = order.id,
                                status = order.status ?: "SAMPLE_COLLECTED",
                                paymentCollected = true,
                                paymentMode = "DOORSTEP_QR"
                            )
                            onPaymentDone()
                            onDismiss()
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Verified, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Confirm Payment Received (₹${order.effectiveAmount})",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        color = PureWhite,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }
            }
        }
    }
}

