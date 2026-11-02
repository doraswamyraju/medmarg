package com.medmarg.patient.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
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
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.CatalogStore
import com.medmarg.patient.model.CatalogItem
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.delay

// =========================================================================
// 🧪 TESTS & PACKAGES (MODERN DISCOVERY PORTAL + MATRIX ENGINE)
// 1-on-1 Parity with iOS CareSeekerCatalogMatrixView.swift
// =========================================================================

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiagnosticsScreen(
    onSelectItem: (CatalogItem) -> Unit,
    onAddToCart: (CatalogItem) -> Unit
) {
    val tests by CatalogStore.tests.collectAsState()
    val profiles by CatalogStore.profiles.collectAsState()
    val packages by CatalogStore.packages.collectAsState()

    var viewMode by remember { mutableStateOf("DISCOVERY") } // DISCOVERY, ALL_CATALOG
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategoryId by remember { mutableStateOf("ALL") }
    var selectedTaxonomyFilter by remember { mutableStateOf("ALL") }
    var catalogSubTab by remember { mutableStateOf("ALL") } // ALL, PACKAGES, PROFILES, TESTS
    var fastingFilter by remember { mutableStateOf("ALL") } // ALL, YES, NO
    var sampleFilter by remember { mutableStateOf("ALL") }  // ALL, SERUM, EDTA, URINE, PLASMA
    var showAllCategoriesSheet by remember { mutableStateOf(false) }
    var addedToastName by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(addedToastName) {
        if (addedToastName != null) {
            delay(2000)
            addedToastName = null
        }
    }

    val recentSearches = remember {
        listOf("CBC", "HbA1c", "Lipid Profile", "Thyroid TSH", "Vitamin D3", "Liver Function (LFT)")
    }

    val filteredItems = remember(searchQuery, catalogSubTab, selectedCategoryId, fastingFilter, sampleFilter, tests, profiles, packages) {
        val baseList = when (catalogSubTab) {
            "PACKAGES" -> packages
            "PROFILES" -> profiles
            "TESTS" -> tests
            else -> packages + profiles + tests
        }

        baseList.filter { item ->
            // Category Filter
            if (selectedCategoryId != "ALL" && item.category?.contains(selectedCategoryId, ignoreCase = true) != true) {
                // soft fallback
            }

            // Search
            val q = searchQuery.trim().lowercase()
            val matchesQuery = q.isEmpty() ||
                    item.name.lowercase().contains(q) ||
                    item.code.lowercase().contains(q) ||
                    item.displaySample.lowercase().contains(q) ||
                    (item.tagline?.lowercase()?.contains(q) == true)

            val matchesFasting = when (fastingFilter) {
                "YES" -> item.requiresFasting
                "NO" -> !item.requiresFasting
                else -> true
            }

            val matchesSample = when (sampleFilter) {
                "ALL" -> true
                else -> item.displaySample.uppercase().contains(sampleFilter.uppercase())
            }

            matchesQuery && matchesFasting && matchesSample
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            if (viewMode == "DISCOVERY" && searchQuery.isEmpty()) {
                // ==========================================
                // 🌟 MODERN MULTI-CATEGORY DISCOVERY PORTAL
                // ==========================================
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(bottom = 120.dp)
                ) {
                    // 1. Header Title & Subtitle + View Switcher
                    DiscoveryHeaderTitleRow(
                        viewMode = viewMode,
                        onToggleViewMode = {
                            viewMode = if (viewMode == "DISCOVERY") "ALL_CATALOG" else "DISCOVERY"
                        }
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // 2. Top Search Bar with Mic & Magnifying Glass
                    TopSearchField(
                        searchQuery = searchQuery,
                        onSearchChange = { searchQuery = it },
                        onVoiceSearch = { searchQuery = "CBC" }
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // 3. Recently Searched / Viewed Biomarkers Chips
                    RecentlySearchedBar(
                        searches = recentSearches,
                        onSelectSearch = {
                            searchQuery = it
                            viewMode = "ALL_CATALOG"
                        }
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // 4. Quick 4 Service Hub Cards (Row of 4: Blood Tests, Packages, Scans, Popular)
                    QuickServiceHubCards(
                        onSelect = { subTab, catId ->
                            catalogSubTab = subTab
                            if (catId != null) selectedCategoryId = catId
                            viewMode = "ALL_CATALOG"
                        }
                    )

                    Spacer(modifier = Modifier.height(18.dp))

                    // 5. Test Categories 6x2 Grid (12 Items)
                    TestCategoriesGridSection(
                        onSelectCategory = { catId ->
                            selectedCategoryId = catId
                            viewMode = "ALL_CATALOG"
                        },
                        onViewAllClick = { showAllCategoriesSheet = true }
                    )

                    Spacer(modifier = Modifier.height(18.dp))

                    // 6. 6-Dimension Taxonomy Navigator Bar
                    TaxonomyDimensionPillsRow(
                        selectedFilter = selectedTaxonomyFilter,
                        onSelectFilter = { filter ->
                            selectedTaxonomyFilter = filter
                            if (filter != "ALL") {
                                showAllCategoriesSheet = true
                            }
                        }
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // 7. Popular Health Packages Carousel
                    PopularHealthPackagesSection(
                        packages = packages,
                        onViewAll = {
                            catalogSubTab = "PACKAGES"
                            viewMode = "ALL_CATALOG"
                        },
                        onAddPackage = { pkg ->
                            onAddToCart(pkg)
                            addedToastName = pkg.name
                        }
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // 8. Featured Tests List
                    FeaturedTestsSection(
                        tests = tests,
                        onViewAll = {
                            catalogSubTab = "TESTS"
                            viewMode = "ALL_CATALOG"
                        },
                        onAddTest = { test ->
                            onAddToCart(test)
                            addedToastName = test.name
                        }
                    )
                }
            } else {
                // ==========================================
                // 📊 DETAILED CATALOG MATRIX VIEW
                // ==========================================
                DetailedCatalogMatrixView(
                    searchQuery = searchQuery,
                    onSearchChange = { searchQuery = it },
                    catalogSubTab = catalogSubTab,
                    onSubTabChange = { catalogSubTab = it },
                    fastingFilter = fastingFilter,
                    onFastingFilterChange = { fastingFilter = it },
                    sampleFilter = sampleFilter,
                    onSampleFilterChange = { sampleFilter = it },
                    filteredItems = filteredItems,
                    onSelectItem = onSelectItem,
                    onAddToCart = {
                        onAddToCart(it)
                        addedToastName = it.name
                    },
                    onSwitchToDiscovery = {
                        searchQuery = ""
                        viewMode = "DISCOVERY"
                    }
                )
            }
        }

        // ✨ 9. FLOATING SEARCH BAR WITH AMBIENT TEAL OUTER GLOW (When in DISCOVERY mode)
        if (viewMode == "DISCOVERY" && searchQuery.isEmpty()) {
            FloatingOuterGlowSearchBar(
                searchQuery = searchQuery,
                onSearchChange = {
                    searchQuery = it
                    if (it.isNotEmpty()) viewMode = "ALL_CATALOG"
                },
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(horizontal = 16.dp, vertical = 6.dp)
            )
        }

        // Added Toast Notification
        AnimatedVisibility(
            visible = addedToastName != null,
            enter = slideInVertically(initialOffsetY = { -it }) + fadeIn(),
            exit = slideOutVertically(targetOffsetY = { -it }) + fadeOut(),
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 16.dp)
        ) {
            addedToastName?.let { name ->
                Surface(
                    color = MedTealPrimary,
                    shape = RoundedCornerShape(20.dp),
                    shadowElevation = 8.dp
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 18.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("$name added to cart", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }
            }
        }
    }

    // 🗂️ 10. ALL 24 MEDICAL CATEGORIES BOTTOM SHEET
    if (showAllCategoriesSheet) {
        ModalBottomSheet(
            onDismissRequest = { showAllCategoriesSheet = false },
            containerColor = PureWhite,
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
        ) {
            All24CategoriesSheetContent(
                onSelectCategory = { catId ->
                    showAllCategoriesSheet = false
                    selectedCategoryId = catId
                    viewMode = "ALL_CATALOG"
                }
            )
        }
    }
}

// =========================================================================
// 📝 1. HEADER TITLE & SUBTITLE + VIEW TOGGLE SWITCHER
// =========================================================================

@Composable
private fun DiscoveryHeaderTitleRow(
    viewMode: String,
    onToggleViewMode: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                text = "Tests & Packages",
                fontSize = 24.sp,
                fontWeight = FontWeight.Black,
                color = Slate900
            )
            Text(
                text = "Find the right tests for a healthier you",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = Slate500
            )
        }

        Surface(
            modifier = Modifier.clickable { onToggleViewMode() },
            shape = RoundedCornerShape(12.dp),
            color = MedTealLight,
            border = androidx.compose.foundation.BorderStroke(1.dp, MedTealPrimary.copy(alpha = 0.3f))
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = if (viewMode == "DISCOVERY") Icons.Default.TableChart else Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = MedTealDark,
                    modifier = Modifier.size(13.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = if (viewMode == "DISCOVERY") "Matrix View" else "Discovery",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MedTealDark
                )
            }
        }
    }
}

// =========================================================================
// 🔍 2. TOP SEARCH BAR
// =========================================================================

@Composable
private fun TopSearchField(
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    onVoiceSearch: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(14.dp),
        color = PureWhite,
        shadowElevation = 2.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.Search, contentDescription = "Search", tint = Slate400, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(10.dp))
            TextField(
                value = searchQuery,
                onValueChange = onSearchChange,
                placeholder = { Text("Search for tests, packages, scans or health concerns...", fontSize = 12.sp, color = Slate400) },
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent
                ),
                singleLine = true,
                modifier = Modifier.weight(1f)
            )
            if (searchQuery.isNotEmpty()) {
                IconButton(onClick = { onSearchChange("") }, modifier = Modifier.size(24.dp)) {
                    Icon(Icons.Default.Cancel, contentDescription = "Clear", tint = Slate400, modifier = Modifier.size(16.dp))
                }
            }
            IconButton(onClick = onVoiceSearch, modifier = Modifier.size(24.dp)) {
                Icon(Icons.Default.Mic, contentDescription = "Voice", tint = Slate500, modifier = Modifier.size(18.dp))
            }
        }
    }
}

// =========================================================================
// 🕒 3. RECENTLY SEARCHED CHIPS
// =========================================================================

@Composable
private fun RecentlySearchedBar(
    searches: List<String>,
    onSelectSearch: (String) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(Icons.Default.History, contentDescription = null, tint = Slate400, modifier = Modifier.size(14.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            searches.forEach { search ->
                Surface(
                    modifier = Modifier.clickable { onSelectSearch(search) },
                    shape = RoundedCornerShape(12.dp),
                    color = PureWhite,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                ) {
                    Text(
                        text = search,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Slate700,
                        modifier = Modifier.padding(horizontal = 9.dp, vertical = 5.dp)
                    )
                }
            }
        }
    }
}

// =========================================================================
// 🩸 4. QUICK SERVICE HUB CARDS (ROW OF 4)
// =========================================================================

@Composable
private fun QuickServiceHubCards(
    onSelect: (subTab: String, catId: String?) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        QuickHubCard("Blood Tests", "500+ Tests", Icons.Default.WaterDrop, Color(0xFFDC2626), Color(0xFFFEE2E2), Modifier.weight(1f)) {
            onSelect("TESTS", null)
        }
        QuickHubCard("Health Packages", "Curated Packages", Icons.Default.Favorite, Color(0xFF059669), Color(0xFFD1FAE5), Modifier.weight(1f)) {
            onSelect("PACKAGES", null)
        }
        QuickHubCard("Diagnostic Scans", "X-Ray, CT, MRI", Icons.Default.ViewInAr, Color(0xFF2563EB), Color(0xFFDBEAFE), Modifier.weight(1f)) {
            onSelect("ALL", null)
        }
        QuickHubCard("Popular Tests", "Most Booked", Icons.Default.Science, Color(0xFFEA580C), Color(0xFFFFEDD5), Modifier.weight(1f)) {
            onSelect("ALL", "CAT_POPULAR")
        }
    }
}

@Composable
private fun QuickHubCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    iconColor: Color,
    bgColor: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        color = PureWhite,
        shadowElevation = 2.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
    ) {
        Column(
            modifier = Modifier.padding(vertical = 10.dp, horizontal = 4.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(bgColor),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = iconColor, modifier = Modifier.size(20.dp))
            }
            Text(title, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate900, textAlign = TextAlign.Center, maxLines = 1)
            Text(subtitle, fontSize = 9.sp, fontWeight = FontWeight.Medium, color = Slate500, textAlign = TextAlign.Center, maxLines = 1)
        }
    }
}

// =========================================================================
// 🩺 5. TEST CATEGORIES 6x2 GRID (12 ITEMS MATCHING IMAGE 3)
// =========================================================================

data class TopCategoryTile(
    val id: String,
    val name: String,
    val count: String,
    val icon: ImageVector,
    val color: Color,
    val isMore: Boolean = false
)

@Composable
private fun TestCategoriesGridSection(
    onSelectCategory: (String) -> Unit,
    onViewAllClick: () -> Unit
) {
    val categories = remember {
        listOf(
            TopCategoryTile("CAT_DIABETES", "Diabetes", "12 Tests", Icons.Default.WaterDrop, Color(0xFFDC2626)),
            TopCategoryTile("CAT_HEART", "Heart", "28 Tests", Icons.Default.Favorite, Color(0xFFE11D48)),
            TopCategoryTile("CAT_LIVER", "Liver", "22 Tests", Icons.Default.LocalFireDepartment, Color(0xFFEA580C)),
            TopCategoryTile("CAT_KIDNEY", "Kidney", "20 Tests", Icons.Default.GpsFixed, Color(0xFFDC2626)),
            TopCategoryTile("CAT_THYROID", "Thyroid", "14 Tests", Icons.Default.MedicalServices, Color(0xFF9333EA)),
            TopCategoryTile("CAT_CLIN_HORM", "Hormones", "18 Tests", Icons.Default.BubbleChart, Color(0xFF0284C7)),
            TopCategoryTile("CAT_ORG_DIGEST", "Gastro", "16 Tests", Icons.Default.WaterDrop, Color(0xFFEA580C)),
            TopCategoryTile("CAT_BONE_JOINT", "Bone & Joint", "14 Tests", Icons.Default.Shield, Color(0xFF0284C7)),
            TopCategoryTile("CAT_FEVER", "Infection", "24 Tests", Icons.Default.Coronavirus, Color(0xFF059669)),
            TopCategoryTile("CAT_CLIN_BIO", "Vitamins", "18 Tests", Icons.Default.Medication, Color(0xFF2563EB)),
            TopCategoryTile("CAT_CANCER", "Cancer Markers", "20 Tests", Icons.Default.Bookmark, Color(0xFFDB2777)),
            TopCategoryTile("MORE", "More", "View All", Icons.Default.MoreHoriz, Slate500, isMore = true)
        )
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Test Categories", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Slate900)
            Row(modifier = Modifier.clickable { onViewAllClick() }, verticalAlignment = Alignment.CenterVertically) {
                Text("View All", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 6 columns x 2 rows grid
        Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                categories.take(6).forEach { cat ->
                    CategoryTileView(cat, onSelectCategory, onViewAllClick)
                }
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                categories.drop(6).take(6).forEach { cat ->
                    CategoryTileView(cat, onSelectCategory, onViewAllClick)
                }
            }
        }
    }
}

@Composable
private fun CategoryTileView(
    cat: TopCategoryTile,
    onSelectCategory: (String) -> Unit,
    onViewAllClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .width(52.dp)
            .clickable {
                if (cat.isMore) onViewAllClick() else onSelectCategory(cat.id)
            }
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(cat.color.copy(alpha = 0.12f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(cat.icon, contentDescription = cat.name, tint = cat.color, modifier = Modifier.size(20.dp))
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(cat.name, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate900, textAlign = TextAlign.Center, maxLines = 1)
        Text(cat.count, fontSize = 8.sp, fontWeight = FontWeight.Medium, color = Slate500, textAlign = TextAlign.Center, maxLines = 1)
    }
}

// =========================================================================
// 🧭 6. 6-DIMENSION TAXONOMY PILLS BAR
// =========================================================================

@Composable
private fun TaxonomyDimensionPillsRow(
    selectedFilter: String,
    onSelectFilter: (String) -> Unit
) {
    val dimensions = listOf(
        "ALL" to "All Dimensions",
        "ORGAN" to "🫀 Body Organs",
        "CONDITION" to "🩺 Health Concerns",
        "CURATED" to "⭐ Curated Packages",
        "DEMOGRAPHIC" to "👥 Demographics",
        "GOAL" to "🎯 Health Goals",
        "CLINICAL" to "🔬 Clinical Specialties"
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        dimensions.forEach { (key, label) ->
            val isSel = selectedFilter == key
            Surface(
                modifier = Modifier.clickable { onSelectFilter(key) },
                shape = RoundedCornerShape(14.dp),
                color = if (isSel) MedTealDark else PureWhite,
                border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) MedTealDark else Slate200),
                shadowElevation = if (isSel) 3.dp else 0.dp
            ) {
                Text(
                    text = label,
                    fontSize = 11.sp,
                    fontWeight = if (isSel) FontWeight.Bold else FontWeight.SemiBold,
                    color = if (isSel) PureWhite else Slate700,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                )
            }
        }
    }
}

// =========================================================================
// 🎁 7. POPULAR HEALTH PACKAGES CAROUSEL
// =========================================================================

@Composable
private fun PopularHealthPackagesSection(
    packages: List<CatalogItem>,
    onViewAll: () -> Unit,
    onAddPackage: (CatalogItem) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Popular Health Packages", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Slate900)
            Row(modifier = Modifier.clickable { onViewAll() }, verticalAlignment = Alignment.CenterVertically) {
                Text("View All", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            PopularPackageCard(
                tag = "Best Seller",
                tagColor = MedTealDark,
                tagBg = EmeraldLight,
                title = "Full Body Health Checkup",
                summary = "85 Tests | Includes CBC, LFT, KFT, Lipid, Sugar & more",
                price = 999,
                mrp = 1500,
                discount = "33% OFF",
                icon = Icons.Default.Groups,
                onAdd = {
                    val pkg = packages.firstOrNull { it.name.contains("Full Body", ignoreCase = true) } ?: packages.firstOrNull()
                    pkg?.let { onAddPackage(it) }
                }
            )

            PopularPackageCard(
                tag = "Most Booked",
                tagColor = Color(0xFF059669),
                tagBg = Color(0xFFD1FAE5),
                title = "Diabetes Profile",
                summary = "12 Tests | HbA1c, Fasting Sugar, Lipid & more",
                price = 499,
                mrp = 800,
                discount = "38% OFF",
                icon = Icons.Default.WaterDrop,
                onAdd = {
                    val pkg = packages.firstOrNull { it.name.contains("Diabetes", ignoreCase = true) } ?: packages.firstOrNull()
                    pkg?.let { onAddPackage(it) }
                }
            )

            PopularPackageCard(
                tag = "Women's Health",
                tagColor = Color(0xFFDB2777),
                tagBg = Color(0xFFFCE7F3),
                title = "Women's Wellness Package",
                summary = "52 Tests | Hormones, Vitamins, CBC & more",
                price = 1299,
                mrp = 2000,
                discount = "33% OFF",
                icon = Icons.Default.Favorite,
                onAdd = {
                    val pkg = packages.firstOrNull { it.name.contains("Women", ignoreCase = true) } ?: packages.firstOrNull()
                    pkg?.let { onAddPackage(it) }
                }
            )
        }
    }
}

@Composable
private fun PopularPackageCard(
    tag: String,
    tagColor: Color,
    tagBg: Color,
    title: String,
    summary: String,
    price: Int,
    mrp: Int,
    discount: String,
    icon: ImageVector,
    onAdd: () -> Unit
) {
    Surface(
        modifier = Modifier.width(220.dp),
        shape = RoundedCornerShape(14.dp),
        color = PureWhite,
        shadowElevation = 2.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
    ) {
        Column(modifier = Modifier.padding(8.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            // Illustration container with Tag
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(90.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(tagBg.copy(alpha = 0.5f))
                    .padding(8.dp)
            ) {
                Surface(color = tagBg, shape = RoundedCornerShape(6.dp)) {
                    Text(tag, fontSize = 9.sp, fontWeight = FontWeight.Black, color = tagColor, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                }
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = tagColor.copy(alpha = 0.25f),
                    modifier = Modifier
                        .size(44.dp)
                        .align(Alignment.BottomEnd)
                )
            }

            Text(title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900, maxLines = 1)
            Text(summary, fontSize = 10.sp, fontWeight = FontWeight.Medium, color = Slate500, maxLines = 2, modifier = Modifier.height(28.dp))

            Row(verticalAlignment = Alignment.Bottom) {
                Text("₹$price", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                Spacer(modifier = Modifier.width(4.dp))
                Text("₹$mrp", fontSize = 11.sp, color = Slate400, textDecoration = TextDecoration.LineThrough)
                Spacer(modifier = Modifier.width(4.dp))
                Surface(color = EmeraldLight, shape = RoundedCornerShape(4.dp)) {
                    Text(discount, fontSize = 9.sp, fontWeight = FontWeight.Black, color = Color(0xFF059669), modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp))
                }
                Spacer(modifier = Modifier.weight(1f))
                OutlinedButton(
                    onClick = onAdd,
                    shape = RoundedCornerShape(6.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MedTealPrimary),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 3.dp),
                    modifier = Modifier.height(26.dp)
                ) {
                    Text("Add", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                }
            }
        }
    }
}

// =========================================================================
// 🔬 8. FEATURED TESTS LIST
// =========================================================================

@Composable
private fun FeaturedTestsSection(
    tests: List<CatalogItem>,
    onViewAll: () -> Unit,
    onAddTest: (CatalogItem) -> Unit
) {
    val featuredTests = remember {
        listOf(
            Triple("Complete Blood Count (CBC)", "11 Parameters • Blood Test", 199),
            Triple("HbA1c (Glycated Hemoglobin)", "1 Parameter • Blood Test", 299),
            Triple("Liver Function Test (LFT)", "11 Parameters • Blood Test", 399),
            Triple("Lipid Profile", "8 Parameters • Blood Test", 399)
        )
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Featured Tests", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Slate900)
            Row(modifier = Modifier.clickable { onViewAll() }, verticalAlignment = Alignment.CenterVertically) {
                Text("View All", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
            }
        }

        featuredTests.forEach { (name, params, price) ->
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = PureWhite,
                shadowElevation = 2.dp,
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(RoseError.copy(alpha = 0.1f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.WaterDrop, contentDescription = null, tint = RoseError, modifier = Modifier.size(18.dp))
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900, maxLines = 1)
                        Text(params, fontSize = 10.sp, fontWeight = FontWeight.Medium, color = Slate500)
                    }

                    Text("₹$price", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900)

                    Spacer(modifier = Modifier.width(10.dp))

                    OutlinedButton(
                        onClick = {
                            val liveTest = tests.firstOrNull { it.name.contains(name.take(4), ignoreCase = true) } ?: tests.firstOrNull()
                            liveTest?.let { onAddTest(it) }
                        },
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, MedTealPrimary),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 4.dp),
                        modifier = Modifier.height(28.dp)
                    ) {
                        Text("Add", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                    }
                }
            }
        }
    }
}

// =========================================================================
// ✨ 9. FLOATING SEARCH BAR WITH AMBIENT TEAL OUTER GLOW
// =========================================================================

@Composable
private fun FloatingOuterGlowSearchBar(
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .shadow(16.dp, RoundedCornerShape(24.dp), spotColor = MedTealPrimary.copy(alpha = 0.5f))
            .clip(RoundedCornerShape(24.dp))
            .background(PureWhite.copy(alpha = 0.96f))
            .border(
                1.5.dp,
                Brush.linearGradient(listOf(MedTealPrimary, EmeraldAccent, MedTealPrimary.copy(alpha = 0.4f))),
                RoundedCornerShape(24.dp)
            )
            .padding(horizontal = 14.dp, vertical = 10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.Search, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(10.dp))
            TextField(
                value = searchQuery,
                onValueChange = onSearchChange,
                placeholder = { Text("Search for tests, packages, scans or health concerns...", fontSize = 12.sp, color = Slate500) },
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent
                ),
                singleLine = true,
                modifier = Modifier.weight(1f)
            )
            Icon(Icons.Default.Mic, contentDescription = "Voice", tint = MedTealPrimary, modifier = Modifier.size(18.dp))
        }
    }
}

// =========================================================================
// 🗂️ 10. ALL 24 MEDICAL CATEGORIES BOTTOM SHEET CONTENT
// =========================================================================

data class MedicalCategory24(
    val id: String,
    val name: String,
    val icon: ImageVector,
    val color: Color,
    val desc: String
)

@Composable
private fun All24CategoriesSheetContent(
    onSelectCategory: (String) -> Unit
) {
    val categories24 = remember {
        listOf(
            MedicalCategory24("CAT_HEART", "Heart Health", Icons.Default.Favorite, Color.Red, "Lipid profile, ECG, cardiac risk markers"),
            MedicalCategory24("CAT_DIABETES", "Diabetes", Icons.Default.WaterDrop, Color.Red, "HbA1c, Fasting & PP glucose"),
            MedicalCategory24("CAT_ORG_LUNGS", "Respiratory", Icons.Default.Air, Color(0xFFE11D48), "Lungs, asthma, chest, allergy"),
            MedicalCategory24("CAT_ORG_DIGEST", "Digestive Health", Icons.Default.WaterDrop, Color(0xFFEA580C), "Stomach, gut, endoscopy, pancreas"),
            MedicalCategory24("CAT_LIVER", "Liver Health", Icons.Default.LocalFireDepartment, Color(0xFFDC2626), "LFT, Bilirubin, SGOT, SGPT enzymes"),
            MedicalCategory24("CAT_KIDNEY", "Kidney Health", Icons.Default.GpsFixed, Color(0xFF2563EB), "KFT, Creatinine, BUN, electrolytes"),
            MedicalCategory24("CAT_NEURO", "Neurology", Icons.Default.Psychology, Color(0xFFDB2777), "Brain, nerve conduction, B12"),
            MedicalCategory24("CAT_BONE_JOINT", "Bone & Joint", Icons.Default.Shield, Color(0xFF0284C7), "Calcium, Vitamin D, arthritis, uric acid"),
            MedicalCategory24("CAT_IMMUNITY", "Immunity", Icons.Default.Security, Color(0xFF059669), "Immunoglobulins, zinc, vitamin panel"),
            MedicalCategory24("CAT_THYROID", "Thyroid", Icons.Default.MedicalServices, Color(0xFF9333EA), "TSH, Total T3, Total T4 thyroid panel"),
            MedicalCategory24("CAT_CANCER", "Cancer Screening", Icons.Default.Bookmark, Color(0xFF7C3AED), "PSA, CA-125, CEA markers"),
            MedicalCategory24("CAT_CLIN_HORM", "Hormonal Health", Icons.Default.BubbleChart, Color(0xFF0284C7), "Estrogen, testosterone, cortisol"),
            MedicalCategory24("CAT_WOMEN", "Women's Health", Icons.Default.Woman, Color(0xFFDB2777), "PCOD, pregnancy, iron, wellness"),
            MedicalCategory24("CAT_MEN", "Men's Health", Icons.Default.Man, Color(0xFF2563EB), "Prostate, vitality, cardiac checkup"),
            MedicalCategory24("CAT_CHILD", "Child Health", Icons.Default.ChildCare, Color(0xFF0284C7), "Pediatric growth, anemia, immunity"),
            MedicalCategory24("CAT_SENIOR", "Senior Care", Icons.Default.Elderly, Color(0xFF7C3AED), "Geriatric full body, joint mobility"),
            MedicalCategory24("CAT_SKIN_HAIR", "Skin, Hair & Nails", Icons.Default.AutoAwesome, Color(0xFFD97706), "Biotin, ferritin, fungal culture"),
            MedicalCategory24("CAT_EYE", "Eye Care", Icons.Default.RemoveRedEye, Color(0xFF2563EB), "Diabetic retinopathy, vision panel"),
            MedicalCategory24("CAT_DENTAL", "Dental Health", Icons.Default.MedicalServices, Color(0xFF0284C7), "Oral infections, calcium bone density"),
            MedicalCategory24("CAT_FEVER", "Infectious Diseases", Icons.Default.Coronavirus, Color(0xFF059669), "Dengue, typhoid, malaria, viral panel"),
            MedicalCategory24("CAT_ANEMIA", "Anemia & Blood Health", Icons.Default.Bloodtype, Color(0xFFDC2626), "CBC, Iron, Ferritin, TIBC, Smear"),
            MedicalCategory24("CAT_WEIGHT", "Weight & Metabolism", Icons.Default.MonitorWeight, Color(0xFF059669), "Obesity, metabolic syndrome, insulin"),
            MedicalCategory24("CAT_MENTAL", "Mental Health", Icons.Default.Spa, Color(0xFF0284C7), "Stress, cortisol, sleep hormones"),
            MedicalCategory24("CAT_ALLERGY", "Allergy & Immunology", Icons.Default.Healing, Color(0xFFEA580C), "Food allergy, inhalant IgE panel")
        )
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text("All 24 Health Categories & Body Systems", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Slate900)
        Text("Browse diagnostic tests across 24 anatomical organs & clinical specialties.", fontSize = 12.sp, color = Slate500, modifier = Modifier.padding(top = 2.dp, bottom = 12.dp))

        LazyColumn(
            modifier = Modifier.fillMaxHeight(0.75f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(categories24) { cat ->
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSelectCategory(cat.id) },
                    shape = RoundedCornerShape(12.dp),
                    color = Slate50,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(cat.color.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(cat.icon, contentDescription = null, tint = cat.color, modifier = Modifier.size(20.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(cat.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            Text(cat.desc, fontSize = 11.sp, color = Slate500, maxLines = 1)
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate400, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }
    }
}

// =========================================================================
// 📊 11. FULL DETAILED CATALOG MATRIX VIEW
// =========================================================================

@Composable
private fun DetailedCatalogMatrixView(
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    catalogSubTab: String,
    onSubTabChange: (String) -> Unit,
    fastingFilter: String,
    onFastingFilterChange: (String) -> Unit,
    sampleFilter: String,
    onSampleFilterChange: (String) -> Unit,
    filteredItems: List<CatalogItem>,
    onSelectItem: (CatalogItem) -> Unit,
    onAddToCart: (CatalogItem) -> Unit,
    onSwitchToDiscovery: () -> Unit
) {
    Column(modifier = Modifier.fillMaxSize()) {
        // Sticky Top Filter Bar
        Surface(color = PureWhite, shadowElevation = 2.dp) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onSwitchToDiscovery) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back to Discovery", tint = MedTealPrimary)
                    }

                    TextField(
                        value = searchQuery,
                        onValueChange = onSearchChange,
                        placeholder = { Text("Filter ${filteredItems.size} items...", fontSize = 12.sp, color = Slate400) },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Slate50,
                            unfocusedContainerColor = Slate50,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        shape = RoundedCornerShape(20.dp),
                        singleLine = true,
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // SubTab Chips
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf("ALL" to "All Items", "TESTS" to "Tests", "PROFILES" to "Profiles", "PACKAGES" to "Packages").forEach { (key, label) ->
                        val isSel = catalogSubTab == key
                        Surface(
                            modifier = Modifier.clickable { onSubTabChange(key) },
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSel) MedTealPrimary else Slate100
                        ) {
                            Text(
                                text = label,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSel) PureWhite else Slate700,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }
                    }
                }
            }
        }

        // List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(filteredItems) { item ->
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSelectItem(item) },
                    shape = RoundedCornerShape(14.dp),
                    color = PureWhite,
                    shadowElevation = 1.dp,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(MedTealLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Science, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(20.dp))
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(item.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900, maxLines = 1)
                            Text("${item.displayItemType} • ${item.displaySample}", fontSize = 10.sp, color = Slate500)
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text("₹${item.price}", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900)
                            Spacer(modifier = Modifier.height(2.dp))
                            OutlinedButton(
                                onClick = { onAddToCart(item) },
                                shape = RoundedCornerShape(6.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, MedTealPrimary),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                                modifier = Modifier.height(24.dp)
                            ) {
                                Text("Add", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                            }
                        }
                    }
                }
            }
        }
    }
}
