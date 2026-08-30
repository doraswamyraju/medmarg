package com.medmarg.patient.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.medmarg.patient.model.DiagnosticTest
import com.medmarg.patient.model.LabTestPricing
import com.medmarg.patient.ui.components.SearchBarHeader
import com.medmarg.patient.ui.components.TestComparisonCard
import com.medmarg.patient.ui.theme.*
import com.medmarg.patient.viewmodel.DiagnosticsViewModel
import com.medmarg.patient.viewmodel.LabSortOption

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiagnosticsScreen(
    onSelectLabTest: (DiagnosticTest, LabTestPricing) -> Unit,
    viewModel: DiagnosticsViewModel = viewModel(),
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()

    val filterOptions = listOf("All Labs", "NABL Certified", "Free Home Collection", "Fastest TAT (< 6h)", "Lowest Price")
    val categoryPills = listOf("All", "Heart Health", "Diabetes Care", "Hormone & Metabolism", "General Health")

    var showSortMenu by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        // Search Bar
        SearchBarHeader(
            query = uiState.searchQuery,
            onQueryChange = { viewModel.updateSearchQuery(it) },
            placeholder = "Search 500+ blood tests & lab packages..."
        )

        // Filter Pills & Sort Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 2.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            LazyRow(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filterOptions.indices.toList()) { index ->
                    val isSelected = uiState.selectedFilterIndex == index
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.selectFilter(index) },
                        label = {
                            Text(
                                text = filterOptions[index],
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

            Box {
                IconButton(onClick = { showSortMenu = true }) {
                    Icon(
                        imageVector = Icons.Default.Tune,
                        contentDescription = "Sort",
                        tint = MedTealPrimary
                    )
                }
                DropdownMenu(
                    expanded = showSortMenu,
                    onDismissRequest = { showSortMenu = false }
                ) {
                    DropdownMenuItem(
                        text = { Text("Relevance") },
                        onClick = {
                            viewModel.setSortOption(LabSortOption.RELEVANCE)
                            showSortMenu = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("Price: Low to High") },
                        onClick = {
                            viewModel.setSortOption(LabSortOption.PRICE_LOW_TO_HIGH)
                            showSortMenu = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("Fastest TAT") },
                        onClick = {
                            viewModel.setSortOption(LabSortOption.FASTEST_TAT)
                            showSortMenu = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("Highest Rated") },
                        onClick = {
                            viewModel.setSortOption(LabSortOption.HIGHEST_RATING)
                            showSortMenu = false
                        }
                    )
                }
            }
        }

        // Category Carousel
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(categoryPills) { category ->
                val isSelected = uiState.selectedCategory == category
                Surface(
                    color = if (isSelected) MedTealContainer else Slate100,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .clickable { viewModel.selectCategory(category) }
                ) {
                    Text(
                        text = category,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) MedTealOnContainer else Slate600,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Diagnostic Tests with Multi-Lab comparison list
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 16.dp)
        ) {
            items(uiState.tests) { test ->
                TestComparisonCard(
                    test = test,
                    onSelectLab = onSelectLabTest
                )
            }
            item {
                Spacer(modifier = Modifier.height(40.dp))
            }
        }
    }
}
