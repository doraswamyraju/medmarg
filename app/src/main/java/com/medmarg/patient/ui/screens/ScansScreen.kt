package com.medmarg.patient.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import com.medmarg.patient.model.ScanCenterPricing
import com.medmarg.patient.model.ScanService
import com.medmarg.patient.ui.components.SearchBarHeader
import com.medmarg.patient.ui.theme.*

@Composable
fun ScansScreen(
    onSelectScanCenter: (ScanService, ScanCenterPricing) -> Unit,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    val modalities = listOf("All Scans", "MRI (1.5T/3.0T)", "CT Scan", "Ultrasound / USG", "X-Ray & Dexa")
    var selectedModalityIndex by remember { mutableIntStateOf(0) }

    val scanList = SampleDataProvider.scanServices

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        SearchBarHeader(
            query = searchQuery,
            onQueryChange = { searchQuery = it },
            placeholder = "Search MRI Brain, CT Chest, Abdomen Ultrasound..."
        )

        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(modalities.indices.toList()) { index ->
                val isSelected = selectedModalityIndex == index
                FilterChip(
                    selected = isSelected,
                    onClick = { selectedModalityIndex = index },
                    label = {
                        Text(
                            text = modalities[index],
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MedTealPrimary,
                        selectedLabelColor = PureWhite,
                        containerColor = PureWhite,
                        labelColor = Slate700
                    ),
                    shape = RoundedCornerShape(20.dp)
                )
            }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 16.dp)
        ) {
            items(scanList) { scanService ->
                ScanServiceCard(
                    scanService = scanService,
                    onSelectCenter = { pricing -> onSelectScanCenter(scanService, pricing) }
                )
            }

            item {
                Spacer(modifier = Modifier.height(40.dp))
            }
        }
    }
}

@Composable
fun ScanServiceCard(
    scanService: ScanService,
    onSelectCenter: (ScanCenterPricing) -> Unit
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
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Surface(
                        color = CyanLight,
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(
                            text = scanService.modality,
                            color = Slate900,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = scanService.name,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Text(
                        text = "${scanService.bodyPart} • ~${scanService.durationMinutes} mins • ${scanService.precautions}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate500
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Preparation note
            Surface(
                color = AmberWarningLight.copy(alpha = 0.5f),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(10.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "Prep",
                        tint = AmberWarning,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Prep: ${scanService.preparation}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate800
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Available Scanning Centers & Pricing",
                style = MaterialTheme.typography.labelLarge,
                color = Slate700
            )

            Spacer(modifier = Modifier.height(8.dp))

            // List of centers offering this scan
            scanService.centerPricings.forEach { centerPricing ->
                Surface(
                    color = Slate50,
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, Slate200),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp)
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
                                text = centerPricing.centerName,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                            Text(
                                text = "${centerPricing.machineSpec} • ${centerPricing.address}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MedTealPrimary,
                                fontWeight = FontWeight.Medium
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Schedule,
                                    contentDescription = "Next Slot",
                                    tint = EmeraldAccent,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "Slot: ${centerPricing.nextSlot}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = EmeraldAccent,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Row(verticalAlignment = Alignment.Bottom) {
                                Text(
                                    text = "₹${centerPricing.price}",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    color = MedTealPrimary
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "₹${centerPricing.originalPrice}",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Slate400,
                                    textDecoration = TextDecoration.LineThrough
                                )
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            Button(
                                onClick = { onSelectCenter(centerPricing) },
                                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.height(34.dp)
                            ) {
                                Text(
                                    text = "Book Slot",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = PureWhite
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
