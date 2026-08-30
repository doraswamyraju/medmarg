package com.medmarg.patient.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import com.medmarg.patient.model.CartItem
import com.medmarg.patient.model.ServiceType
import com.medmarg.patient.ui.theme.*

@Composable
fun BookingScreen(
    cartItems: List<CartItem>,
    onRemoveItem: (CartItem) -> Unit,
    onConfirmBooking: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedPatient by remember { mutableStateOf("Rahul Sharma (Self, 32M)") }
    var selectedSlot by remember { mutableStateOf("Tomorrow, 07:30 AM - 08:30 AM (Fasting)") }
    var paymentMethod by remember { mutableStateOf("UPI / GPay / PhonePe") }

    val totalOriginal = cartItems.sumOf { it.originalPrice }
    val totalDiscounted = cartItems.sumOf { it.price }
    val totalSavings = totalOriginal - totalDiscounted

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Slate50)
            .padding(bottom = 16.dp)
    ) {
        item {
            Surface(
                color = MedTealPrimary,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text(
                        text = "Booking & Sample Collection Summary",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                    Text(
                        text = "${cartItems.size} item(s) selected from verified accredited centers",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MedTealLight
                    )
                }
            }
        }

        // Cart Items
        item {
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Selected Services & Labs",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Slate900,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }

        items(cartItems) { item ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = BorderStroke(1.dp, CardBorder)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = item.title,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Text(
                            text = "Provider: ${item.providerName}",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = MedTealPrimary
                        )
                        Text(
                            text = if (item.isHomeCollection) "Home Collection • ${item.appointmentDate}" else "Center Visit • ${item.appointmentDate}",
                            style = MaterialTheme.typography.labelSmall,
                            color = Slate500
                        )
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Row(verticalAlignment = Alignment.Bottom) {
                            Text(
                                text = "₹${item.price}",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "₹${item.originalPrice}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Slate400,
                                textDecoration = TextDecoration.LineThrough
                            )
                        }

                        IconButton(
                            onClick = { onRemoveItem(item) },
                            modifier = Modifier.size(30.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.DeleteOutline,
                                contentDescription = "Remove",
                                tint = RoseError,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }

        // Patient Member & Sample Collection Slot
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = BorderStroke(1.dp, CardBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Patient & Collection Details",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedCard(
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Person, contentDescription = null, tint = MedTealPrimary)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text("Patient", style = MaterialTheme.typography.labelSmall, color = Slate400)
                                Text(selectedPatient, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedCard(
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.AccessTime, contentDescription = null, tint = MedTealPrimary)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text("Collection Slot", style = MaterialTheme.typography.labelSmall, color = Slate400)
                                Text(selectedSlot, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedCard(
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.LocationOn, contentDescription = null, tint = MedTealPrimary)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text("Home Address", style = MaterialTheme.typography.labelSmall, color = Slate400)
                                Text("Flat 402, Green Glen Layout, Indiranagar, Bangalore", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            }
        }

        // Bill Breakdown
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = BorderStroke(1.dp, CardBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Bill Breakdown",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Item Total (MRP)", style = MaterialTheme.typography.bodyMedium, color = Slate600)
                        Text("₹$totalOriginal", style = MaterialTheme.typography.bodyMedium, color = Slate600)
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("MedMarg Multi-Lab Discount", style = MaterialTheme.typography.bodyMedium, color = EmeraldAccent)
                        Text("-₹$totalSavings", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Home Sample Collection Fee", style = MaterialTheme.typography.bodyMedium, color = Slate600)
                        Text("FREE", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 10.dp), color = Slate200)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("To Pay", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Slate900)
                        Text("₹$totalDiscounted", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                    }
                }
            }
        }

        // Confirm Button
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = onConfirmBooking,
                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .padding(horizontal = 16.dp)
            ) {
                Text(
                    text = "Confirm & Pay ₹$totalDiscounted",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = PureWhite
                )
            }
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}
