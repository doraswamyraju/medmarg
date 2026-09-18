package com.medmarg.patient.ui.components

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
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.model.CartItem
import com.medmarg.patient.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutSheet(
    cartItems: List<CartItem>,
    onDismissRequest: () -> Unit,
    onConfirmBooking: (String, String, String) -> Unit
) {
    var selectedSlot by remember { mutableStateOf("06:30 AM - 07:30 AM (Recommended Fasting)") }
    var selectedDate by remember { mutableStateOf("Tomorrow, 19-Sep") }
    var selectedPatient by remember { mutableStateOf("Rahul Sharma (Self)") }
    var selectedPaymentMethod by remember { mutableStateOf("UPI / Online Payment") }

    val totalAmount = cartItems.sumOf { it.price }
    val totalSavings = cartItems.sumOf { maxOf(0, it.mrp - it.price) }

    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        containerColor = PureWhite,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(vertical = 10.dp)
                    .width(40.dp)
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(Slate400.copy(alpha = 0.5f))
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .verticalScroll(rememberScrollState())
                .padding(bottom = 36.dp)
        ) {
            Text(
                text = "Fasting Slot & Doorstep Checkout",
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Slate900
            )
            Text(
                text = "MedMarg Certified Phlebotomist Doorstep Collection",
                fontSize = 11.sp,
                color = Slate500
            )

            Spacer(modifier = Modifier.height(16.dp))

            // 1. Select Patient
            Text(
                text = "1. Select Patient",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("Rahul Sharma (Self)", "Sunita Sharma (Mother)", "Ramesh Sharma (Father)").forEach { patient ->
                    val isSel = selectedPatient == patient
                    Surface(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .clickable { selectedPatient = patient },
                        color = if (isSel) MedTealLight else Slate50,
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) MedTealPrimary else Slate200)
                    ) {
                        Text(
                            text = patient,
                            fontSize = 11.sp,
                            fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSel) MedTealPrimary else Slate700,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 2. Fasting Time Slot Selector
            Text(
                text = "2. Select Early Morning Fasting Slot",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
            Spacer(modifier = Modifier.height(6.dp))
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                listOf(
                    "06:30 AM - 07:30 AM (Recommended Fasting)",
                    "07:30 AM - 08:30 AM (Popular Slot)",
                    "08:30 AM - 09:30 AM",
                    "10:00 AM - 11:00 AM (Non-Fasting)"
                ).forEach { slot ->
                    val isSel = selectedSlot == slot
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSel) EmeraldLight else Slate50)
                            .border(1.dp, if (isSel) EmeraldAccent else Slate200, RoundedCornerShape(10.dp))
                            .clickable { selectedSlot = slot }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (isSel) Icons.Default.RadioButtonChecked else Icons.Default.RadioButtonUnchecked,
                                contentDescription = null,
                                tint = if (isSel) EmeraldAccent else Slate400,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = slot,
                                fontSize = 12.sp,
                                fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSel) Slate900 else Slate700
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 3. Bill Summary
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Slate50),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text("Payment Summary", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Item Total (${cartItems.size} items)", fontSize = 12.sp, color = Slate600)
                        Text("₹${cartItems.sumOf { it.mrp }}", fontSize = 12.sp, color = Slate600)
                    }

                    if (totalSavings > 0) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Package & Promotional Savings", fontSize = 12.sp, color = EmeraldAccent, fontWeight = FontWeight.SemiBold)
                            Text("-₹$totalSavings", fontSize = 12.sp, color = EmeraldAccent, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Home Sample Collection Fee", fontSize = 12.sp, color = Slate600)
                        Text("FREE", fontSize = 12.sp, color = EmeraldAccent, fontWeight = FontWeight.Bold)
                    }

                    Divider(color = Slate200, modifier = Modifier.padding(vertical = 8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Total Payable", fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = Slate900)
                        Text("₹$totalAmount", fontSize = 18.sp, fontWeight = FontWeight.Black, color = MedTealPrimary)
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Confirm & Pay CTA
            Button(
                onClick = {
                    onConfirmBooking(selectedPatient, selectedDate, selectedSlot)
                    onDismissRequest()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent)
            ) {
                Icon(Icons.Default.Lock, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Confirm Booking & Pay ₹$totalAmount",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = PureWhite
                )
            }
        }
    }
}
