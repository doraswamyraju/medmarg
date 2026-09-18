package com.medmarg.patient.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.model.CartItem
import com.medmarg.patient.ui.theme.*

@Composable
fun FloatingCartBar(
    cartItems: List<CartItem>,
    onCheckoutClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (cartItems.isEmpty()) return

    val totalAmount = cartItems.sumOf { it.price }
    val totalSavings = cartItems.sumOf { maxOf(0, it.mrp - it.price) }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .shadow(12.dp, RoundedCornerShape(18.dp), spotColor = MedTealPrimary.copy(alpha = 0.4f))
            .clip(RoundedCornerShape(18.dp))
            .background(Brush.horizontalGradient(listOf(MedTealPrimary, MedTealDark)))
            .clickable { onCheckoutClick() }
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // 1. Amber Gold Circular Badge with Cart Count
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(AmberWarning),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "${cartItems.size}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                // 2. Price, Savings & Subtitle
                Column(verticalArrangement = Arrangement.Center) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "₹$totalAmount",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            color = PureWhite
                        )
                        if (totalSavings > 0) {
                            Surface(
                                color = Color.Black.copy(alpha = 0.2f),
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    text = "Save ₹$totalSavings",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = EmeraldAccent,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    Text(
                        text = "Free 60-Min Home Sample Pickup Included",
                        fontSize = 10.sp,
                        color = MedTealLight
                    )
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            // 3. View Cart Action Pill Button
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(PureWhite.copy(alpha = 0.2f))
                    .clickable { onCheckoutClick() }
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "View Cart",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = PureWhite
                )
                Icon(
                    imageVector = Icons.Default.ArrowForward,
                    contentDescription = null,
                    tint = PureWhite,
                    modifier = Modifier.size(12.dp)
                )
            }
        }
    }
}
