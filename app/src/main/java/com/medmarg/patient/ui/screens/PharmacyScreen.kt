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
import com.medmarg.patient.data.SampleDataProvider
import com.medmarg.patient.model.GenericAlt
import com.medmarg.patient.model.Medicine
import com.medmarg.patient.ui.components.SearchBarHeader
import com.medmarg.patient.ui.theme.*

@Composable
fun PharmacyScreen(
    onAddToCart: (Medicine, Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    val medicines = SampleDataProvider.medicinesList

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        SearchBarHeader(
            query = searchQuery,
            onQueryChange = { searchQuery = it },
            placeholder = "Search medicines, salts, wellness products..."
        )

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 16.dp)
        ) {
            // Prescription Upload Banner
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MedTealContainer)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(CircleShape)
                                .background(MedTealPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.DocumentScanner,
                                contentDescription = "Scan Rx",
                                tint = PureWhite,
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Have a Prescription?",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MedTealOnContainer
                            )
                            Text(
                                text = "Upload & our pharmacists will dispense genuine medicines with generic saving options",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MedTealOnContainer.copy(alpha = 0.8f)
                            )
                        }

                        Button(
                            onClick = {},
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text("Upload Rx", color = PureWhite)
                        }
                    }
                }
            }

            item {
                Text(
                    text = "Featured Medicines & Generic Alternatives",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Slate900,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }

            items(medicines) { medicine ->
                MedicineItemCard(
                    medicine = medicine,
                    onAddBranded = { onAddToCart(medicine, false) },
                    onAddGeneric = { onAddToCart(medicine, true) }
                )
            }

            item {
                Spacer(modifier = Modifier.height(40.dp))
            }
        }
    }
}

@Composable
fun MedicineItemCard(
    medicine: Medicine,
    onAddBranded: () -> Unit,
    onAddGeneric: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = BorderStroke(1.dp, CardBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = medicine.name,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Text(
                        text = "Salt: ${medicine.composition}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate600
                    )
                    Text(
                        text = "${medicine.packSize} • By ${medicine.manufacturer}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate500
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(
                            text = "₹${medicine.price}",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "₹${medicine.mrp}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Slate400,
                            textDecoration = TextDecoration.LineThrough
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Button(
                        onClick = onAddBranded,
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Slate800),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                        modifier = Modifier.height(32.dp)
                    ) {
                        Text("Add Branded", style = MaterialTheme.typography.labelSmall, color = PureWhite)
                    }
                }
            }

            // Generic Alternative Box if available
            medicine.genericAlternative?.let { gen ->
                Spacer(modifier = Modifier.height(12.dp))
                Surface(
                    color = EmeraldLight.copy(alpha = 0.5f),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, EmeraldAccent.copy(alpha = 0.4f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    color = EmeraldAccent,
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = "SAVE ${gen.savingsPercent}%",
                                        color = PureWhite,
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Generic Substitute Available",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = EmeraldAccent
                                )
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = gen.name,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = Slate900
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "₹${gen.discountedPrice}",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                color = EmeraldAccent
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Button(
                                onClick = onAddGeneric,
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                                modifier = Modifier.height(32.dp)
                            ) {
                                Text("Choose Generic", style = MaterialTheme.typography.labelSmall, color = PureWhite)
                            }
                        }
                    }
                }
            }
        }
    }
}
