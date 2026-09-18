package com.medmarg.patient.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.CatalogStore
import com.medmarg.patient.model.CatalogItem
import com.medmarg.patient.ui.theme.*

@Composable
fun DiagnosticsScreen(
    onSelectItem: (CatalogItem) -> Unit,
    onAddToCart: (CatalogItem) -> Unit
) {
    val tests by CatalogStore.tests.collectAsState()
    val profiles by CatalogStore.profiles.collectAsState()
    val packages by CatalogStore.packages.collectAsState()
    val isLoading by CatalogStore.isLoading.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedSubTab by remember { mutableStateOf("ALL") } // ALL, PACKAGES, PROFILES, TESTS
    var selectedFastingFilter by remember { mutableStateOf("ALL") } // ALL, YES, NO
    var selectedSampleFilter by remember { mutableStateOf("ALL") } // ALL, SERUM, EDTA, URINE, PLASMA

    // Combined filtered items
    val filteredItems = remember(searchQuery, selectedSubTab, selectedFastingFilter, selectedSampleFilter, tests, profiles, packages) {
        val baseList = when (selectedSubTab) {
            "PACKAGES" -> packages
            "PROFILES" -> profiles
            "TESTS" -> tests
            else -> packages + profiles + tests
        }

        baseList.filter { item ->
            val q = searchQuery.trim().lowercase()
            val matchesQuery = q.isEmpty() ||
                    item.name.lowercase().contains(q) ||
                    item.code.lowercase().contains(q) ||
                    item.displaySample.lowercase().contains(q) ||
                    (item.tagline?.lowercase()?.contains(q) == true)

            val matchesFasting = when (selectedFastingFilter) {
                "YES" -> item.requiresFasting
                "NO" -> !item.requiresFasting
                else -> true
            }

            val matchesSample = when (selectedSampleFilter) {
                "ALL" -> true
                else -> item.displaySample.uppercase().contains(selectedSampleFilter.uppercase())
            }

            matchesQuery && matchesFasting && matchesSample
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        // Search & Filter Header
        Surface(
            color = PureWhite,
            shadowElevation = 2.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                // Search Input
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("Search 913+ Tests, Profiles & Packages...", fontSize = 13.sp, color = Slate400) },
                    leadingIcon = {
                        Icon(Icons.Default.Search, contentDescription = "Search", tint = Slate500, modifier = Modifier.size(20.dp))
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear", tint = Slate400, modifier = Modifier.size(18.dp))
                            }
                        }
                    },
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MedTealPrimary,
                        unfocusedBorderColor = Slate200,
                        focusedContainerColor = Slate50,
                        unfocusedContainerColor = Slate50
                    ),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search)
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Sub-tabs (ALL, PACKAGES, PROFILES, TESTS)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("ALL" to "All Items (${packages.size + profiles.size + tests.size})",
                           "PACKAGES" to "Health Packages (${packages.size})",
                           "PROFILES" to "Profiles (${profiles.size})",
                           "TESTS" to "Individual Tests (${tests.size})").forEach { (tabKey, label) ->
                        val isSelected = selectedSubTab == tabKey
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .clickable { selectedSubTab = tabKey },
                            color = if (isSelected) MedTealPrimary else Slate100,
                            shape = RoundedCornerShape(20.dp)
                        ) {
                            Text(
                                text = label,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) PureWhite else Slate700,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Fasting and Sample Type Filter Chips
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Filters:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate400)

                    // Fasting filters
                    listOf("ALL" to "Any Fasting", "YES" to "Fasting Only", "NO" to "No Fasting").forEach { (k, label) ->
                        val isSel = selectedFastingFilter == k
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .clickable { selectedFastingFilter = k },
                            color = if (isSel) AmberWarningLight else Slate50,
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) AmberWarning else Slate200)
                        ) {
                            Text(
                                text = label,
                                fontSize = 10.sp,
                                fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSel) AmberWarning else Slate600,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }

                    // Sample filters
                    listOf("SERUM", "EDTA", "URINE").forEach { sample ->
                        val isSel = selectedSampleFilter == sample
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .clickable { selectedSampleFilter = if (isSel) "ALL" else sample },
                            color = if (isSel) MedTealLight else Slate50,
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) MedTealPrimary else Slate200)
                        ) {
                            Text(
                                text = sample,
                                fontSize = 10.sp,
                                fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSel) MedTealPrimary else Slate600,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }
        }

        // List of Diagnostic Items
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = MedTealPrimary)
            }
        } else if (filteredItems.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Outlined.SearchOff, contentDescription = null, tint = Slate400, modifier = Modifier.size(48.dp))
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("No diagnostic tests found", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Slate700)
                    Text("Try clearing your search query or adjusting the filters", fontSize = 12.sp, color = Slate500)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredItems, key = { it.id }) { item ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelectItem(item) },
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = PureWhite),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200),
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            // Top Badges
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
                                        color = if (item.isPackage) EmeraldLight else MedTealLight,
                                        shape = RoundedCornerShape(6.dp)
                                    ) {
                                        Text(
                                            text = item.displayItemType,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (item.isPackage) EmeraldAccent else MedTealPrimary,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }

                                    if (item.requiresFasting) {
                                        Surface(
                                            color = AmberWarningLight,
                                            shape = RoundedCornerShape(6.dp)
                                        ) {
                                            Text(
                                                text = "Fasting 8-10h",
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = AmberWarning,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
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
                                            text = "Save ${item.calculatedDiscount}%",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = EmeraldAccent,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            // Name
                            Text(
                                text = item.name,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900,
                                lineHeight = 18.sp
                            )

                            if (!item.tagline.isNullOrEmpty()) {
                                Text(
                                    text = item.tagline,
                                    fontSize = 11.sp,
                                    color = Slate500,
                                    modifier = Modifier.padding(top = 2.dp)
                                )
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            // Sample & TAT
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Outlined.Science, contentDescription = null, tint = Slate400, modifier = Modifier.size(13.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(item.displaySample, fontSize = 11.sp, color = Slate600)
                                }

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Outlined.Schedule, contentDescription = null, tint = Slate400, modifier = Modifier.size(13.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("${item.tatHours ?: 24}h TAT", fontSize = 11.sp, color = Slate600)
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Bottom Price & Action Row
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.Bottom) {
                                    Text(
                                        text = "₹${item.price}",
                                        fontSize = 17.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Slate900
                                    )
                                    if (item.mrp > item.price) {
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = "₹${item.mrp}",
                                            fontSize = 12.sp,
                                            color = Slate400,
                                            textDecoration = TextDecoration.LineThrough
                                        )
                                    }
                                }

                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    OutlinedButton(
                                        onClick = { onSelectItem(item) },
                                        shape = RoundedCornerShape(8.dp),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                        border = androidx.compose.foundation.BorderStroke(1.dp, MedTealPrimary)
                                    ) {
                                        Text("Details", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                                    }

                                    Button(
                                        onClick = { onAddToCart(item) },
                                        shape = RoundedCornerShape(8.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                    ) {
                                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Add", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
