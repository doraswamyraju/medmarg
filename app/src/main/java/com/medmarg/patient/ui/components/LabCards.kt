package com.medmarg.patient.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.model.DiagnosticTest
import com.medmarg.patient.model.LabTestPricing
import com.medmarg.patient.model.ScanService
import com.medmarg.patient.ui.theme.*

@Composable
fun TestComparisonCard(
    test: DiagnosticTest,
    onSelectLab: (DiagnosticTest, LabTestPricing) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
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
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = test.name,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "${test.parametersCount} Parameters • ${test.sampleType} Sample • ${if (test.fastingRequiredHours > 0) "${test.fastingRequiredHours}h Fasting" else "No Fasting"}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate500
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Multi-lab comparison subtitle badge
            Surface(
                color = MedTealLight,
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.CompareArrows,
                        contentDescription = "Compare",
                        tint = MedTealPrimary,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Available at ${test.labPricings.size} Accredited Labs nearby (Compare & Save)",
                        style = MaterialTheme.typography.labelSmall,
                        color = MedTealPrimary,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Lab List comparisons
            test.labPricings.forEach { labPricing ->
                SingleLabOptionItem(
                    test = test,
                    labPricing = labPricing,
                    onBookClick = { onSelectLab(test, labPricing) }
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

@Composable
fun SingleLabOptionItem(
    test: DiagnosticTest,
    labPricing: LabTestPricing,
    onBookClick: () -> Unit
) {
    Surface(
        color = Slate50,
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, Slate200),
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
                    Text(
                        text = labPricing.labName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    if (labPricing.isNabl) {
                        Surface(
                            color = NablBlueLight,
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = "NABL",
                                color = NablBlue,
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = AmberWarningLight,
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = "Rating",
                                tint = AmberWarning,
                                modifier = Modifier.size(12.dp)
                            )
                            Spacer(modifier = Modifier.width(2.dp))
                            Text(
                                text = "${labPricing.rating}",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = Slate800
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "• ${labPricing.distanceKm} km away",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate500
                    )

                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "• TAT ${labPricing.tatHours} hrs",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MedTealPrimary,
                        fontWeight = FontWeight.Medium
                    )
                }

                if (labPricing.homeCollectionAvailable) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Home,
                            contentDescription = "Home",
                            tint = EmeraldAccent,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (labPricing.homeCollectionFee == 0) "Free Home Sample Collection" else "Home Collection ₹${labPricing.homeCollectionFee}",
                            style = MaterialTheme.typography.labelSmall,
                            color = EmeraldAccent,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            Column(
                horizontalAlignment = Alignment.End,
                modifier = Modifier.padding(start = 12.dp)
            ) {
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = "₹${labPricing.discountedPrice}",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MedTealPrimary
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "₹${labPricing.originalPrice}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate400,
                        textDecoration = TextDecoration.LineThrough
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Button(
                    onClick = onBookClick,
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.height(34.dp)
                ) {
                    Text(
                        text = "Select Lab",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                }
            }
        }
    }
}
