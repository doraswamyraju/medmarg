package com.medmarg.patient.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.PatientSessionStore
import com.medmarg.patient.model.CartItem
import com.medmarg.patient.ui.theme.*

data class PartnerLabOption(
    val name: String,
    val accreditation: String,
    val tatText: String,
    val priceMultiplier: Double
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartViewSheet(
    cartItems: MutableList<CartItem>,
    onDismissRequest: () -> Unit,
    onProceedToCheckout: (selectedLabName: String, isExpress60Min: Boolean, finalPayableAmount: Int) -> Unit
) {
    val labOptions = remember {
        listOf(
            PartnerLabOption("MedMarg Central NABL Hub", "NABL & ISO 15189 Accredited", "Same-Day 6-12 Hr TAT", 1.0),
            PartnerLabOption("Thyrocare Accredited Hub", "CAP & NABL Accredited", "24 Hr Digital Report", 1.05),
            PartnerLabOption("Dr. Lal PathLabs Regional", "NABL & CAP Reference Lab", "18-24 Hr Report", 1.12)
        )
    }
    var selectedLab by remember { mutableStateOf(labOptions.first()) }
    var isExpress60Min by remember { mutableStateOf(false) }

    val baseTotal = cartItems.sumOf { it.price }
    val labAdjustedTotal = (baseTotal * selectedLab.priceMultiplier).toInt()
    val expressFee = if (isExpress60Min) 99 else 0
    val totalAmount = labAdjustedTotal + expressFee
    val totalMrp = cartItems.sumOf { if (it.mrp > 0) it.mrp else it.price + 500 }
    val totalSavings = maxOf(0, totalMrp - labAdjustedTotal)

    val defaultAddress = PatientSessionStore.savedAddresses.firstOrNull { it.isDefault }
        ?: PatientSessionStore.savedAddresses.firstOrNull()

    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        containerColor = PureWhite,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(vertical = 10.dp)
                    .width(40.dp)
                    .height(5.dp)
                    .clip(RoundedCornerShape(3.dp))
                    .background(Slate400.copy(alpha = 0.4f))
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
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Healthcare Cart & Lab Selection",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Text(
                    text = "Close",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = MedTealPrimary,
                    modifier = Modifier.clickable { onDismissRequest() }
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (cartItems.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Outlined.ShoppingCart,
                            contentDescription = null,
                            tint = Slate400,
                            modifier = Modifier.size(44.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Your cart is empty",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Text(
                            text = "Add pathology tests or health packages to schedule free home pickup.",
                            fontSize = 12.sp,
                            color = Slate500,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            } else {
                // 1. Selected Items List
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "SELECTED DIAGNOSTIC TESTS (${cartItems.size})",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate500,
                        letterSpacing = 0.5.sp
                    )
                    Text(
                        text = "Clear All",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = RoseError,
                        modifier = Modifier.clickable { cartItems.clear() }
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                cartItems.forEach { item ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = Slate50),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = item.title,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )
                                Text(
                                    text = item.subtitle,
                                    fontSize = 11.sp,
                                    color = Slate500
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "₹${item.price}",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Black,
                                    color = MedTealPrimary
                                )
                                Text(
                                    text = "Remove",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = RoseError,
                                    modifier = Modifier.clickable {
                                        cartItems.remove(item)
                                    }
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // 2. Multi-Lab Partner Comparison
                Text(
                    text = "SELECT ACCREDITED PROCESSING LAB",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate500,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                labOptions.forEach { lab ->
                    val isSel = selectedLab.name == lab.name
                    val labPrice = (baseTotal * lab.priceMultiplier).toInt()
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSel) MedTealLight else Slate50)
                            .border(1.dp, if (isSel) MedTealPrimary else Slate200, RoundedCornerShape(10.dp))
                            .clickable { selectedLab = lab }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Icon(
                                imageVector = if (isSel) Icons.Default.RadioButtonChecked else Icons.Default.RadioButtonUnchecked,
                                contentDescription = null,
                                tint = if (isSel) MedTealPrimary else Slate400,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = lab.name,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )
                                Text(
                                    text = "${lab.accreditation} • ${lab.tatText}",
                                    fontSize = 10.sp,
                                    color = Slate500
                                )
                            }
                        }
                        Text(
                            text = "₹$labPrice",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = MedTealPrimary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // 3. Express 60-Min Priority Collection Toggle
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = if (isExpress60Min) EmeraldLight else Slate50),
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (isExpress60Min) EmeraldAccent else Slate200)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Icon(
                                imageVector = Icons.Default.Bolt,
                                contentDescription = null,
                                tint = EmeraldAccent,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    text = "Express 60-Min Doorstep Collection",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )
                                Text(
                                    text = "Priority dispatch of nearest certified phlebotomist (+₹99)",
                                    fontSize = 10.sp,
                                    color = Slate500
                                )
                            }
                        }
                        Switch(
                            checked = isExpress60Min,
                            onCheckedChange = { isExpress60Min = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = PureWhite, checkedTrackColor = EmeraldAccent)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // 4. Serving Address Preview
                if (defaultAddress != null) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = MedTealLight)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = null,
                                tint = MedTealPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    text = "Doorstep Collection Address (${defaultAddress.label})",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MedTealPrimary
                                )
                                Text(
                                    text = defaultAddress.fullAddress,
                                    fontSize = 12.sp,
                                    color = Slate700
                                )
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(14.dp))
                }

                // 5. Bill Summary Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate50),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Total MRP", fontSize = 12.sp, color = Slate500)
                            Text("₹$totalMrp", fontSize = 12.sp, color = Slate500, textDecoration = TextDecoration.LineThrough)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("MedMarg Marketplace Discount", fontSize = 12.sp, color = EmeraldAccent)
                            Text("- ₹$totalSavings", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Standard Home Sample Collection", fontSize = 12.sp, color = Slate700)
                            Text("FREE", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                        }
                        if (isExpress60Min) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Express 60-Min Priority Dispatch", fontSize = 12.sp, color = Slate700)
                                Text("₹99", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            }
                        }
                        HorizontalDivider(color = Slate200, modifier = Modifier.padding(vertical = 8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Total Amount Payable", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                            Text("₹$totalAmount", fontSize = 18.sp, fontWeight = FontWeight.Black, color = MedTealPrimary)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // 6. Proceed to Slot & Payment Checkout CTA
                Button(
                    onClick = {
                        onProceedToCheckout(selectedLab.name, isExpress60Min, totalAmount)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                ) {
                    Text(
                        text = "Select Slot & Proceed to Checkout • ₹$totalAmount",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                }
            }
        }
    }
}
