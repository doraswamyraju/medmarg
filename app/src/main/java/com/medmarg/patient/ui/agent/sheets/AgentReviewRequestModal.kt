package com.medmarg.patient.ui.agent.sheets

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// ⭐ AGENT REVIEW REQUEST MODAL
// 1-on-1 replication of ios/Agent/Sheets/AgentReviewRequestModal.swift
// =========================================================================

@Composable
fun AgentReviewRequestModal(
    order: AgentPickupOrder,
    onDismiss: () -> Unit,
    onDone: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var isSubmitting by remember { mutableStateOf(false) }
    var selectedRating by remember { mutableIntStateOf(5) }

    fun submitReview(send: Boolean) {
        coroutineScope.launch {
            isSubmitting = true
            AgentRepository.sendReviewRequest(order.id, send)
            isSubmitting = false
            onDone()
            onDismiss()
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
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    Text(
                        text = "Skip",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate500,
                        modifier = Modifier.clickable {
                            onDone()
                            onDismiss()
                        }
                    )
                }

                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(CircleShape)
                        .background(EmeraldAccent.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.ThumbUp, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(38.dp))
                }

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text("Sample Collected Successfully!", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Slate900, textAlign = TextAlign.Center)
                    Text("Order #${order.id} • ${order.effectivePatientName}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                    Text(
                        "Would you like to trigger a customer satisfaction review link via WhatsApp & SMS?",
                        fontSize = 12.sp,
                        color = Slate500,
                        textAlign = TextAlign.Center
                    )
                }

                // 5-Star Interactive Preview
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(PureWhite)
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    (1..5).forEach { star ->
                        Icon(
                            imageVector = if (star <= selectedRating) Icons.Default.Star else Icons.Default.StarBorder,
                            contentDescription = "Star $star",
                            tint = if (star <= selectedRating) Color(0xFFF97316) else Slate400,
                            modifier = Modifier
                                .size(30.dp)
                                .clickable { selectedRating = star }
                        )
                    }
                }

                Column(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(
                        onClick = { submitReview(true) },
                        enabled = !isSubmitting,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.Send, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isSubmitting) "Sending..." else "Send Review Request (WhatsApp/SMS)",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            color = PureWhite,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )
                    }

                    OutlinedButton(
                        onClick = { submitReview(false) },
                        enabled = !isSubmitting,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Close Without Review", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate700)
                    }
                }
            }
        }
    }
}

