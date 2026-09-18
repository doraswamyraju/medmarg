package com.medmarg.patient.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.CatalogStore
import com.medmarg.patient.model.CatalogItem
import com.medmarg.patient.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UniversalItemDetailsSheet(
    item: CatalogItem,
    onDismissRequest: () -> Unit,
    onAddToCart: (CatalogItem) -> Unit,
    onUpgradeToPackage: (CatalogItem) -> Unit
) {
    val context = LocalContext.current
    val containingPackages = CatalogStore.findContainingPackages(item).ifEmpty {
        listOf(
            CatalogItem(
                id = "PKG_AAROGYAM_1.3",
                code = "AAROGYAM 1.3",
                name = "Thyrocare Aarogyam Complete 1.3",
                mrp = 3500,
                price = 1499,
                discountPercent = 57,
                tagline = "104 Biomarkers • Complete Vital Screening",
                itemType = "PACKAGE",
                testCount = 104
            ),
            CatalogItem(
                id = "PKG_MASTER_SHIELD",
                code = "MASTER_SHIELD",
                name = "MedMarg Master Health Shield",
                mrp = 4200,
                price = 1799,
                discountPercent = 57,
                tagline = "92 Biomarkers • Cardiac, Liver, Thyroid & Vit D3",
                itemType = "PACKAGE",
                testCount = 92
            )
        )
    }

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
            // Header Badges & Code
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        color = if (item.isPackage) AmberWarningLight else MedTealLight,
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = item.displayItemType,
                            color = if (item.isPackage) AmberWarning else MedTealDark,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }

                    if (item.code.isNotEmpty()) {
                        Surface(
                            color = Slate50,
                            shape = RoundedCornerShape(6.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                        ) {
                            Text(
                                text = item.code,
                                color = Slate700,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                    }
                }

                if (item.calculatedDiscount > 0) {
                    Surface(
                        color = EmeraldLight,
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = "${item.calculatedDiscount}% OFF",
                            color = EmeraldAccent,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Name
            Text(
                text = item.name,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900,
                lineHeight = 26.sp
            )

            // Pricing
            Row(
                modifier = Modifier.padding(top = 6.dp),
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "₹${item.price}",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Black,
                    color = MedTealPrimary
                )

                if (item.mrp > item.price) {
                    Text(
                        text = "MRP ₹${item.mrp}",
                        fontSize = 14.sp,
                        color = Slate500,
                        textDecoration = TextDecoration.LineThrough
                    )

                    Text(
                        text = "(Save ₹${item.mrp - item.price})",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldAccent
                    )
                }
            }

            Divider(color = Slate200, modifier = Modifier.padding(vertical = 14.dp))

            // Diagnostic Specifications Grid
            Text(
                text = "Diagnostic Specifications",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                SpecBox(
                    icon = Icons.Default.WaterDrop,
                    title = "Sample Type",
                    value = item.displaySample,
                    modifier = Modifier.weight(1f)
                )
                SpecBox(
                    icon = Icons.Default.Schedule,
                    title = "Fasting",
                    value = if (item.requiresFasting) "8-10 Hours" else "Not Required",
                    modifier = Modifier.weight(1f)
                )
                SpecBox(
                    icon = Icons.Default.Timer,
                    title = "TAT",
                    value = "${item.tatHours ?: 24} Hours",
                    modifier = Modifier.weight(1f)
                )
            }

            // Description
            if (!item.description.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(14.dp))
                Text(
                    text = "Clinical Significance & Overview",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Text(
                    text = item.description,
                    fontSize = 13.sp,
                    color = Slate700,
                    modifier = Modifier.padding(top = 4.dp),
                    lineHeight = 18.sp
                )
            }

            // =========================================================================
            // 💡 CONNECTED SMART PACKAGES WITH HIGHLIGHTED SAVINGS (FOR SINGLE TESTS)
            // =========================================================================
            if (!item.isPackage) {
                Spacer(modifier = Modifier.height(18.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = AmberWarningLight.copy(alpha = 0.4f)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, AmberWarning.copy(alpha = 0.3f))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = null,
                                tint = AmberWarning,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "Connected Smart Packages",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                        }

                        Text(
                            text = "Upgrade to a full-body package containing this test to maximize savings & biomarkers.",
                            fontSize = 12.sp,
                            color = Slate600,
                            modifier = Modifier.padding(top = 2.dp)
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        containingPackages.forEach { pkg ->
                            val savings = (pkg.mrp - pkg.price)
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = CardDefaults.cardColors(containerColor = PureWhite)
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = pkg.name,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Slate900
                                        )
                                        Text(
                                            text = "${pkg.testCount ?: 104} Biomarkers • Save ₹$savings (${pkg.discountPercent ?: 57}% OFF)",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = EmeraldAccent
                                        )
                                    }

                                    Spacer(modifier = Modifier.width(8.dp))

                                    Column(horizontalAlignment = Alignment.End) {
                                        Text(
                                            text = "₹${pkg.price}",
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Black,
                                            color = MedTealPrimary
                                        )

                                        Button(
                                            onClick = {
                                                onUpgradeToPackage(pkg)
                                                onDismissRequest()
                                            },
                                            shape = RoundedCornerShape(6.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                        ) {
                                            Text("+ Add", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Bottom CTA Buttons
            Button(
                onClick = {
                    onAddToCart(item)
                    onDismissRequest()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
            ) {
                Icon(Icons.Default.AddShoppingCart, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Add to Cart • ₹${item.price}",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = PureWhite
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedButton(
                onClick = {
                    val msg = "Hello MedMarg, I would like to book ${item.name}."
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/919876543210?text=${Uri.encode(msg)}"))
                    context.startActivity(intent)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF25D366))
            ) {
                Icon(Icons.Default.Chat, contentDescription = null, tint = Color(0xFF25D366), modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Book via WhatsApp Concierge", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF25D366))
            }
        }
    }
}

@Composable
private fun SpecBox(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = Slate50),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(12.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(title, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate500)
            }
            Spacer(modifier = Modifier.height(2.dp))
            Text(value, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate900, maxLines = 1)
        }
    }
}
