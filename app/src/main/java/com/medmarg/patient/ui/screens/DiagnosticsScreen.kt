package com.medmarg.patient.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.CatalogStore
import com.medmarg.patient.model.CatalogItem
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.delay

data class RichCategoryItem(
    val id: String,
    val name: String,
    val icon: ImageVector,
    val count: String,
    val tint: Color,
    val bgTint: Color
)

data class TaxonomyPillItem(
    val id: String,
    val label: String,
    val icon: ImageVector?
)

// =========================================================================
// 🧪 TESTS & PACKAGES (MODERN DISCOVERY PORTAL + MATRIX ENGINE)
// 1-on-1 Parity with iOS CareSeekerCatalogMatrixView.swift
// =========================================================================

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiagnosticsScreen(
    onSelectItem: (CatalogItem) -> Unit,
    onAddToCart: (CatalogItem) -> Unit,
    initialSubTab: Int = 0,
    onOpenScans: () -> Unit = {}
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

    // Sync with Sidebar sub-tab selection (0 = All, 1 = Packages, 2 = Profiles, 3 = Individual Tests)
    LaunchedEffect(initialSubTab) {
        when (initialSubTab) {
            1 -> {
                catalogSubTab = "PACKAGES"
                viewMode = "ALL_CATALOG"
            }
            2 -> {
                catalogSubTab = "PROFILES"
                viewMode = "ALL_CATALOG"
            }
            3 -> {
                catalogSubTab = "TESTS"
                viewMode = "ALL_CATALOG"
            }
            else -> {
                catalogSubTab = "ALL"
            }
        }
    }

    LaunchedEffect(addedToastName) {
        if (addedToastName != null) {
            delay(2000)
            addedToastName = null
        }
    }

    val recentSearches = remember {
        listOf("CBC", "HbA1c", "Lipid Profile", "Thyroid TSH", "Vitamin D3", "Liver Function")
    }

    val all24Categories = remember {
        listOf(
            RichCategoryItem("Diabetes", "Diabetes", Icons.Default.WaterDrop, "12 Tests", Color(0xFFDC2626), Color(0xFFFEE2E2)),
            RichCategoryItem("Heart", "Heart", Icons.Default.Favorite, "28 Tests", Color(0xFFE11D48), Color(0xFFFFE4E6)),
            RichCategoryItem("Liver", "Liver", Icons.Default.LocalFireDepartment, "22 Tests", Color(0xFFD97706), Color(0xFFFEF3C7)),
            RichCategoryItem("Kidney", "Kidney", Icons.Default.FilterCenterFocus, "20 Tests", Color(0xFFEA580C), Color(0xFFFFEDD5)),
            RichCategoryItem("Thyroid", "Thyroid", Icons.Default.MedicalServices, "14 Tests", Color(0xFF9333EA), Color(0xFFF3E8FF)),
            RichCategoryItem("Hormones", "Hormones", Icons.Default.BubbleChart, "18 Tests", Color(0xFF0284C7), Color(0xFFE0F2FE)),
            RichCategoryItem("Gastro", "Gastro", Icons.Default.Opacity, "16 Tests", Color(0xFFD97706), Color(0xFFFEF3C7)),
            RichCategoryItem("Bone", "Bone & Joint", Icons.Default.AccessibilityNew, "14 Tests", Color(0xFF0284C7), Color(0xFFE0F2FE)),
            RichCategoryItem("Infection", "Infection", Icons.Default.Coronavirus, "24 Tests", Color(0xFF059669), Color(0xFFD1FAE5)),
            RichCategoryItem("Vitamins", "Vitamins", Icons.Default.Medication, "18 Tests", Color(0xFF2563EB), Color(0xFFDBEAFE)),
            RichCategoryItem("Cancer", "Cancer Markers", Icons.Default.Bookmark, "20 Tests", Color(0xFFDB2777), Color(0xFFFCE7F3)),
            RichCategoryItem("Fever", "Fever Panel", Icons.Default.Thermostat, "15 Tests", Color(0xFFE11D48), Color(0xFFFFE4E6)),
            RichCategoryItem("Allergy", "Allergy", Icons.Default.Air, "32 Tests", Color(0xFF0D9488), Color(0xFFCCFBF1)),
            RichCategoryItem("Anemia", "Anemia", Icons.Default.Bloodtype, "16 Tests", Color(0xFFDC2626), Color(0xFFFEE2E2)),
            RichCategoryItem("Immunity", "Immunity", Icons.Default.VerifiedUser, "19 Tests", Color(0xFF059669), Color(0xFFD1FAE5)),
            RichCategoryItem("Pregnancy", "Pregnancy", Icons.Default.ChildCare, "25 Tests", Color(0xFFDB2777), Color(0xFFFCE7F3)),
            RichCategoryItem("Women", "Women Care", Icons.Default.Female, "30 Tests", Color(0xFF9333EA), Color(0xFFF3E8FF)),
            RichCategoryItem("Men", "Men's Health", Icons.Default.Male, "26 Tests", Color(0xFF2563EB), Color(0xFFDBEAFE)),
            RichCategoryItem("Senior", "Senior Care", Icons.Default.Elderly, "22 Tests", Color(0xFF4F46E5), Color(0xFFE0E7FF)),
            RichCategoryItem("Child", "Pediatrics", Icons.Default.ChildFriendly, "14 Tests", Color(0xFF0284C7), Color(0xFFE0F2FE)),
            RichCategoryItem("Lungs", "Respiratory", Icons.Default.Air, "12 Tests", Color(0xFF0D9488), Color(0xFFCCFBF1)),
            RichCategoryItem("Neuro", "Neurology", Icons.Default.Psychology, "15 Tests", Color(0xFF7C3AED), Color(0xFFEDE9FE)),
            RichCategoryItem("Autoimmune", "Autoimmune", Icons.Default.Flare, "18 Tests", Color(0xFFD97706), Color(0xFFFEF3C7)),
            RichCategoryItem("FullBody", "Full Body", Icons.Default.MonitorHeart, "35 Packs", Color(0xFF0D7C66), Color(0xFFE6F4F1))
        )
    }

    val taxonomyDimensions = remember {
        listOf(
            TaxonomyPillItem("ALL", "All Dimensions", null),
            TaxonomyPillItem("ORGAN", "Body Organs", Icons.Default.MonitorHeart),
            TaxonomyPillItem("CONCERN", "Health Concerns", Icons.Default.MedicalServices),
            TaxonomyPillItem("PACKAGES", "Curated Packages", Icons.Default.Inventory2),
            TaxonomyPillItem("PROFILES", "Clinical Profiles", Icons.Default.Analytics),
            TaxonomyPillItem("LIFE", "Life Stages", Icons.Default.People),
            TaxonomyPillItem("DEPT", "Lab Departments", Icons.Default.Science)
        )
    }

    val filteredItems = remember(
        searchQuery,
        catalogSubTab,
        selectedCategoryId,
        fastingFilter,
        sampleFilter,
        tests,
        profiles,
        packages
    ) {
        val baseList = when (catalogSubTab) {
            "PACKAGES" -> packages
            "PROFILES" -> profiles
            "TESTS" -> tests
            else -> packages + profiles + tests
        }

        baseList.filter { item ->
            val matchesCategory = selectedCategoryId == "ALL" ||
                item.category?.contains(selectedCategoryId, ignoreCase = true) == true ||
                item.name.contains(selectedCategoryId, ignoreCase = true) ||
                item.tagline?.contains(selectedCategoryId, ignoreCase = true) == true

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

            matchesCategory && matchesQuery && matchesFasting && matchesSample
        }
    }

    val totalCatalogSize = packages.size + profiles.size + tests.size

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
    ) {
        if (viewMode == "DISCOVERY" && searchQuery.isEmpty() && selectedCategoryId == "ALL") {
            // ==========================================
            // 🌟 MODERN MULTI-CATEGORY DISCOVERY PORTAL
            // ==========================================
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(bottom = 110.dp)
            ) {
                // 1. Header Title & Subtitle + Matrix View Switcher
                DiscoveryHeaderTitleRow(
                    totalCount = totalCatalogSize,
                    viewMode = viewMode,
                    onToggleViewMode = {
                        viewMode = if (viewMode == "DISCOVERY") "ALL_CATALOG" else "DISCOVERY"
                    }
                )

                // 2. Compact 48dp Single-Line Top Search Bar (Never wraps placeholder onto 2 lines!)
                TopSearchField(
                    searchQuery = searchQuery,
                    onSearchChange = { searchQuery = it },
                    onVoiceSearch = {
                        searchQuery = "CBC"
                        viewMode = "ALL_CATALOG"
                    }
                )

                // 3. Recently Searched / Popular Biomarker Chips
                RecentlySearchedBar(
                    searches = recentSearches,
                    onSelectSearch = {
                        searchQuery = it
                        viewMode = "ALL_CATALOG"
                    }
                )

                // 4. Quick 4 Service Hub Cards (Clean 2x2 Grid — Zero Text Truncation)
                QuickServiceHubCards(
                    onSelectBloodTests = {
                        catalogSubTab = "TESTS"
                        viewMode = "ALL_CATALOG"
                    },
                    onSelectPackages = {
                        catalogSubTab = "PACKAGES"
                        viewMode = "ALL_CATALOG"
                    },
                    onSelectScans = {
                        catalogSubTab = "PROFILES"
                        viewMode = "ALL_CATALOG"
                    },
                    onSelectPopular = {
                        catalogSubTab = "ALL"
                        viewMode = "ALL_CATALOG"
                    }
                )

                // 5. Test Categories 4x3 Grid (11 Categories + "More (24)" — Zero Text Truncation!)
                TestCategoriesGridSection(
                    categories = all24Categories.take(11),
                    selectedCategoryId = selectedCategoryId,
                    onSelectCategory = { cat ->
                        selectedCategoryId = cat.id
                        viewMode = "ALL_CATALOG"
                    },
                    onViewAllClick = { showAllCategoriesSheet = true }
                )

                // 6. Taxonomy Dimension Pills Row
                TaxonomyDimensionPillsRow(
                    dimensions = taxonomyDimensions,
                    selectedFilter = selectedTaxonomyFilter,
                    onSelectFilter = { dim ->
                        selectedTaxonomyFilter = dim.id
                        when (dim.id) {
                            "PACKAGES" -> {
                                catalogSubTab = "PACKAGES"
                                viewMode = "ALL_CATALOG"
                            }
                            "PROFILES" -> {
                                catalogSubTab = "PROFILES"
                                viewMode = "ALL_CATALOG"
                            }
                            "ORGAN", "CONCERN", "LIFE" -> {
                                showAllCategoriesSheet = true
                            }
                            "DEPT" -> {
                                viewMode = "ALL_CATALOG"
                            }
                        }
                    }
                )

                // 7. Popular Health Packages Horizontal Carousel
                PopularHealthPackagesSection(
                    packages = packages,
                    onViewAll = {
                        catalogSubTab = "PACKAGES"
                        viewMode = "ALL_CATALOG"
                    },
                    onSelectPackage = { onSelectItem(it) },
                    onAddPackage = { pkg ->
                        onAddToCart(pkg)
                        addedToastName = pkg.name
                    }
                )

                // 8. Frequently Booked Lab Tests List
                FeaturedTestsSection(
                    tests = tests,
                    onViewAll = {
                        catalogSubTab = "TESTS"
                        viewMode = "ALL_CATALOG"
                    },
                    onSelectTest = { onSelectItem(it) },
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
                totalCatalogSize = totalCatalogSize,
                searchQuery = searchQuery,
                onSearchChange = { searchQuery = it },
                catalogSubTab = catalogSubTab,
                onSubTabChange = { catalogSubTab = it },
                selectedCategoryId = selectedCategoryId,
                onClearCategory = { selectedCategoryId = "ALL" },
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
                    selectedCategoryId = "ALL"
                    catalogSubTab = "ALL"
                    fastingFilter = "ALL"
                    sampleFilter = "ALL"
                    viewMode = "DISCOVERY"
                }
            )
        }
    }

    // All 24 Clinical Categories Bottom Sheet
    if (showAllCategoriesSheet) {
        ModalBottomSheet(
            onDismissRequest = { showAllCategoriesSheet = false },
            containerColor = PureWhite,
            shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp)
        ) {
            All24CategoriesSheetContent(
                categories = all24Categories,
                selectedCategoryId = selectedCategoryId,
                onSelectCategory = { cat ->
                    selectedCategoryId = cat.id
                    showAllCategoriesSheet = false
                    viewMode = "ALL_CATALOG"
                },
                onClose = { showAllCategoriesSheet = false }
            )
        }
    }
}

// =========================================================================
// 1. DISCOVERY HEADER TITLE ROW
// =========================================================================
@Composable
private fun DiscoveryHeaderTitleRow(
    totalCount: Int,
    viewMode: String,
    onToggleViewMode: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(top = 14.dp, bottom = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = "Tests & Packages",
                fontSize = 24.sp,
                fontWeight = FontWeight.Black,
                color = Slate900,
                letterSpacing = (-0.5).sp
            )
            Text(
                text = "Compare rates across 4 NABL labs • ${maxOf(totalCount, 913)}+ tests",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Slate500,
                modifier = Modifier.padding(top = 2.dp)
            )
        }

        Surface(
            onClick = onToggleViewMode,
            shape = RoundedCornerShape(12.dp),
            color = Color(0xFFE6F4F1),
            border = BorderStroke(1.dp, MedTealPrimary.copy(alpha = 0.25f))
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.ViewModule,
                    contentDescription = null,
                    tint = MedTealPrimary,
                    modifier = Modifier.size(15.dp)
                )
                Text(
                    text = if (viewMode == "DISCOVERY") "Matrix View" else "Discovery",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MedTealPrimary
                )
            }
        }
    }
}

// =========================================================================
// 2. SLEEK 48DP SINGLE-LINE SEARCH BAR (NO TWO-LINE WRAPPING)
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
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .height(48.dp),
        shape = RoundedCornerShape(14.dp),
        color = PureWhite,
        shadowElevation = 2.dp,
        border = BorderStroke(1.dp, Slate200)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Search,
                contentDescription = "Search",
                tint = MedTealPrimary,
                modifier = Modifier.size(20.dp)
            )

            Box(
                modifier = Modifier.weight(1f),
                contentAlignment = Alignment.CenterStart
            ) {
                if (searchQuery.isEmpty()) {
                    Text(
                        text = "Search tests, packages, organs or labs...",
                        fontSize = 13.sp,
                        color = Slate400,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                BasicTextField(
                    value = searchQuery,
                    onValueChange = onSearchChange,
                    singleLine = true,
                    textStyle = TextStyle(
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = Slate900
                    ),
                    cursorBrush = SolidColor(MedTealPrimary),
                    modifier = Modifier.fillMaxWidth()
                )
            }

            if (searchQuery.isNotEmpty()) {
                IconButton(
                    onClick = { onSearchChange("") },
                    modifier = Modifier.size(26.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Cancel,
                        contentDescription = "Clear",
                        tint = Slate400,
                        modifier = Modifier.size(18.dp)
                    )
                }
            } else {
                Box(
                    modifier = Modifier
                        .size(30.dp)
                        .clip(CircleShape)
                        .background(MedTealLight)
                        .clickable { onVoiceSearch() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Mic,
                        contentDescription = "Voice Search",
                        tint = MedTealPrimary,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

// =========================================================================
// 3. RECENTLY SEARCHED BIOMARKERS CHIPS ROW
// =========================================================================
@Composable
private fun RecentlySearchedBar(
    searches: List<String>,
    onSelectSearch: (String) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Icon(
            imageVector = Icons.Default.History,
            contentDescription = null,
            tint = Slate400,
            modifier = Modifier.size(16.dp)
        )

        searches.forEach { term ->
            Surface(
                onClick = { onSelectSearch(term) },
                shape = RoundedCornerShape(50),
                color = PureWhite,
                border = BorderStroke(1.dp, Slate200)
            ) {
                Text(
                    text = term,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Slate700,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
        }
    }
}

// =========================================================================
// 4. QUICK SERVICE HUB CARDS (CLEAN 2x2 GRID — ZERO TEXT TRUNCATION)
// =========================================================================
@Composable
private fun QuickServiceHubCards(
    onSelectBloodTests: () -> Unit,
    onSelectPackages: () -> Unit,
    onSelectScans: () -> Unit,
    onSelectPopular: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            QuickHubHorizontalTile(
                modifier = Modifier.weight(1f),
                title = "Blood Tests",
                subtitle = "500+ NABL Tests",
                icon = Icons.Default.WaterDrop,
                iconTint = Color(0xFFDC2626),
                iconBg = Color(0xFFFEE2E2),
                onClick = onSelectBloodTests
            )
            QuickHubHorizontalTile(
                modifier = Modifier.weight(1f),
                title = "Health Packages",
                subtitle = "Curated Checkups",
                icon = Icons.Default.Favorite,
                iconTint = Color(0xFF059669),
                iconBg = Color(0xFFD1FAE5),
                onClick = onSelectPackages
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            QuickHubHorizontalTile(
                modifier = Modifier.weight(1f),
                title = "Diagnostic Profiles",
                subtitle = "Organ & Disease Panels",
                icon = Icons.Default.Analytics,
                iconTint = Color(0xFF2563EB),
                iconBg = Color(0xFFDBEAFE),
                onClick = onSelectScans
            )
            QuickHubHorizontalTile(
                modifier = Modifier.weight(1f),
                title = "Popular Tests",
                subtitle = "Most Booked Today",
                icon = Icons.Default.Science,
                iconTint = Color(0xFFD97706),
                iconBg = Color(0xFFFEF3C7),
                onClick = onSelectPopular
            )
        }
    }
}

@Composable
private fun QuickHubHorizontalTile(
    modifier: Modifier = Modifier,
    title: String,
    subtitle: String,
    icon: ImageVector,
    iconTint: Color,
    iconBg: Color,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        color = PureWhite,
        shadowElevation = 2.dp,
        border = BorderStroke(1.dp, Slate100)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(iconBg),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = iconTint,
                    modifier = Modifier.size(21.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Slate900,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = subtitle,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    color = Slate500,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }
    }
}

// =========================================================================
// 5. TEST CATEGORIES 4x3 GRID (NO TRUNCATION ON "BONE & JOINT" OR "CANCER")
// =========================================================================
@Composable
private fun TestCategoriesGridSection(
    categories: List<RichCategoryItem>,
    selectedCategoryId: String,
    onSelectCategory: (RichCategoryItem) -> Unit,
    onViewAllClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 4.dp, bottom = 10.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Test Categories",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                Text(
                    text = "Browse tests by organ system or clinical specialty",
                    fontSize = 11.sp,
                    color = Slate500
                )
            }

            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .clickable { onViewAllClick() }
                    .padding(horizontal = 6.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "View All 24",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = MedTealPrimary
                )
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = MedTealPrimary,
                    modifier = Modifier.size(16.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 4 columns x 3 rows (11 categories + 1 "More" button = 12 cells)
        val rows = categories.chunked(4)
        rows.forEachIndexed { rowIndex, rowItems ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                rowItems.forEach { cat ->
                    CategoryGridCell(
                        modifier = Modifier.weight(1f),
                        item = cat,
                        isSelected = selectedCategoryId == cat.id,
                        onClick = { onSelectCategory(cat) }
                    )
                }
                if (rowIndex == rows.lastIndex && rowItems.size < 4) {
                    MoreCategoryCell(
                        modifier = Modifier.weight(1f),
                        onClick = onViewAllClick
                    )
                }
            }
        }
    }
}

@Composable
private fun CategoryGridCell(
    modifier: Modifier = Modifier,
    item: RichCategoryItem,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        color = if (isSelected) MedTealLight else PureWhite,
        border = BorderStroke(
            1.dp,
            if (isSelected) MedTealPrimary else Slate100
        ),
        shadowElevation = 1.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 10.dp, horizontal = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(item.bgTint),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = item.icon,
                    contentDescription = item.name,
                    tint = item.tint,
                    modifier = Modifier.size(21.dp)
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = item.name,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Text(
                text = item.count,
                fontSize = 9.sp,
                fontWeight = FontWeight.SemiBold,
                color = Slate500,
                maxLines = 1
            )
        }
    }
}

@Composable
private fun MoreCategoryCell(
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        color = PureWhite,
        border = BorderStroke(1.dp, MedTealPrimary.copy(alpha = 0.25f)),
        shadowElevation = 1.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 10.dp, horizontal = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MedTealLight),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.GridView,
                    contentDescription = "All 24",
                    tint = MedTealPrimary,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "More (24)",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = MedTealPrimary,
                maxLines = 1
            )

            Text(
                text = "View All",
                fontSize = 9.sp,
                fontWeight = FontWeight.SemiBold,
                color = Slate500,
                maxLines = 1
            )
        }
    }
}

// =========================================================================
// 6. TAXONOMY DIMENSION PILLS ROW
// =========================================================================
@Composable
private fun TaxonomyDimensionPillsRow(
    dimensions: List<TaxonomyPillItem>,
    selectedFilter: String,
    onSelectFilter: (TaxonomyPillItem) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        dimensions.forEach { dim ->
            val isSelected = selectedFilter == dim.id
            Surface(
                onClick = { onSelectFilter(dim) },
                shape = RoundedCornerShape(12.dp),
                color = if (isSelected) MedTealPrimary else PureWhite,
                border = if (isSelected) null else BorderStroke(1.dp, Slate200)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 9.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    if (dim.icon != null) {
                        Icon(
                            imageVector = dim.icon,
                            contentDescription = null,
                            tint = if (isSelected) PureWhite else MedTealPrimary,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                    Text(
                        text = dim.label,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isSelected) PureWhite else Slate700
                    )
                }
            }
        }
    }
}

// =========================================================================
// 7. POPULAR HEALTH PACKAGES CAROUSEL
// =========================================================================
@Composable
private fun PopularHealthPackagesSection(
    packages: List<CatalogItem>,
    onViewAll: () -> Unit,
    onSelectPackage: (CatalogItem) -> Unit,
    onAddPackage: (CatalogItem) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Popular Health Packages",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                Text(
                    text = "Comprehensive full body checkups with free home collection",
                    fontSize = 11.sp,
                    color = Slate500
                )
            }

            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .clickable { onViewAll() }
                    .padding(horizontal = 6.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "View All",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = MedTealPrimary
                )
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = MedTealPrimary,
                    modifier = Modifier.size(16.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            packages.take(8).forEachIndexed { index, pkg ->
                PopularPackageCard(
                    pkg = pkg,
                    isBestValue = index == 0,
                    onClick = { onSelectPackage(pkg) },
                    onBookClick = { onAddPackage(pkg) }
                )
            }
        }
    }
}

@Composable
private fun PopularPackageCard(
    pkg: CatalogItem,
    isBestValue: Boolean,
    onClick: () -> Unit,
    onBookClick: () -> Unit
) {
    val mrp = if (pkg.mrp > pkg.price) pkg.mrp else (pkg.price * 1.45).toInt()
    val discount = (((mrp - pkg.price).toFloat() / mrp.toFloat()) * 100).toInt().coerceIn(15, 65)

    Surface(
        modifier = Modifier
            .width(288.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(20.dp),
        color = PureWhite,
        shadowElevation = 3.dp,
        border = BorderStroke(1.dp, Slate100)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.horizontalGradient(
                            listOf(
                                Color(0xFFE6F4F1),
                                Color(0xFFF0FDF4)
                            )
                        )
                    )
                    .padding(horizontal = 14.dp, vertical = 12.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = if (isBestValue) MedTealPrimary else PureWhite
                        ) {
                            Text(
                                text = if (isBestValue) "BESTSELLER" else "NABL PACKAGE",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                color = if (isBestValue) PureWhite else MedTealPrimary,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = EmeraldSuccess.copy(alpha = 0.14f)
                        ) {
                            Text(
                                text = "$discount% OFF",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = EmeraldSuccess,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = pkg.name,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Slate900,
                        maxLines = 2,
                        minLines = 2,
                        lineHeight = 19.sp,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Slate50,
                        border = BorderStroke(1.dp, Slate200)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Science,
                                contentDescription = null,
                                tint = MedTealPrimary,
                                modifier = Modifier.size(12.dp)
                            )
                            Text(
                                text = "${pkg.testCount ?: 72} Biomarkers",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate800
                            )
                        }
                    }

                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Slate50,
                        border = BorderStroke(1.dp, Slate200)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Schedule,
                                contentDescription = null,
                                tint = Slate600,
                                modifier = Modifier.size(12.dp)
                            )
                            Text(
                                text = pkg.displayTat,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Slate600
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = Slate100)
                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                text = "₹${pkg.price}",
                                fontSize = 19.sp,
                                fontWeight = FontWeight.Black,
                                color = Slate900
                            )
                            Text(
                                text = "₹$mrp",
                                fontSize = 12.sp,
                                color = Slate400,
                                textDecoration = TextDecoration.LineThrough
                            )
                        }
                        Text(
                            text = "Free Home Sample Pickup",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = EmeraldSuccess
                        )
                    }

                    Button(
                        onClick = onBookClick,
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp),
                        modifier = Modifier.height(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = null,
                            tint = PureWhite,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Book",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = PureWhite
                        )
                    }
                }
            }
        }
    }
}

// =========================================================================
// 8. FEATURED INDIVIDUAL LAB TESTS PREVIEW SECTION
// =========================================================================
@Composable
private fun FeaturedTestsSection(
    tests: List<CatalogItem>,
    onViewAll: () -> Unit,
    onSelectTest: (CatalogItem) -> Unit,
    onAddTest: (CatalogItem) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Frequently Booked Lab Tests",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                Text(
                    text = "Tap any test for clinical breakdown or multi-lab comparison",
                    fontSize = 11.sp,
                    color = Slate500
                )
            }

            Text(
                text = "See All",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = MedTealPrimary,
                modifier = Modifier.clickable { onViewAll() }
            )
        }

        tests.take(6).forEach { test ->
            CatalogMatrixItemCard(
                item = test,
                onSelectItem = { onSelectTest(test) },
                onAddToCart = { onAddTest(test) }
            )
        }
    }
}

// =========================================================================
// 9. ALL 24 CLINICAL CATEGORIES MODAL BOTTOM SHEET
// =========================================================================
@Composable
private fun All24CategoriesSheetContent(
    categories: List<RichCategoryItem>,
    selectedCategoryId: String,
    onSelectCategory: (RichCategoryItem) -> Unit,
    onClose: () -> Unit
) {
    var catSearch by remember { mutableStateOf("") }
    val filteredCats = remember(categories, catSearch) {
        if (catSearch.isBlank()) categories
        else categories.filter { it.name.contains(catSearch, ignoreCase = true) }
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(bottom = 28.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "All 24 Clinical Categories",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                Text(
                    text = "Select an organ system or specialty to filter tests",
                    fontSize = 12.sp,
                    color = Slate500
                )
            }
            IconButton(onClick = onClose) {
                Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate600)
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(42.dp),
            shape = RoundedCornerShape(12.dp),
            color = Slate50,
            border = BorderStroke(1.dp, Slate200)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(Icons.Default.Search, contentDescription = null, tint = Slate400, modifier = Modifier.size(16.dp))
                Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.CenterStart) {
                    if (catSearch.isEmpty()) {
                        Text("Filter categories (e.g. Thyroid, Heart, Vitamin)...", fontSize = 12.sp, color = Slate400)
                    }
                    BasicTextField(
                        value = catSearch,
                        onValueChange = { catSearch = it },
                        singleLine = true,
                        textStyle = TextStyle(fontSize = 13.sp, color = Slate900),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(max = 440.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            filteredCats.chunked(4).forEach { rowItems ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    rowItems.forEach { cat ->
                        CategoryGridCell(
                            modifier = Modifier.weight(1f),
                            item = cat,
                            isSelected = selectedCategoryId == cat.id,
                            onClick = { onSelectCategory(cat) }
                        )
                    }
                    repeat(4 - rowItems.size) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

// =========================================================================
// 10. DETAILED CATALOG MATRIX VIEW
// =========================================================================
@Composable
private fun DetailedCatalogMatrixView(
    totalCatalogSize: Int,
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    catalogSubTab: String,
    onSubTabChange: (String) -> Unit,
    selectedCategoryId: String,
    onClearCategory: () -> Unit,
    fastingFilter: String,
    onFastingFilterChange: (String) -> Unit,
    sampleFilter: String,
    onSampleFilterChange: (String) -> Unit,
    filteredItems: List<CatalogItem>,
    onSelectItem: (CatalogItem) -> Unit,
    onAddToCart: (CatalogItem) -> Unit,
    onSwitchToDiscovery: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        Surface(
            color = PureWhite,
            shadowElevation = 2.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(
                            onClick = onSwitchToDiscovery,
                            shape = CircleShape,
                            color = Slate100,
                            modifier = Modifier.size(34.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.ArrowBack,
                                    contentDescription = "Back",
                                    tint = Slate800,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                        Column {
                            Text(
                                text = "Multi-Lab Diagnostic Matrix",
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Black,
                                color = Slate900
                            )
                            Text(
                                text = "Showing ${filteredItems.size} of ${maxOf(totalCatalogSize, 913)} NABL items",
                                fontSize = 11.sp,
                                color = Slate500
                            )
                        }
                    }

                    if (selectedCategoryId != "ALL") {
                        Surface(
                            onClick = onClearCategory,
                            shape = RoundedCornerShape(50),
                            color = MedTealLight
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = selectedCategoryId,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MedTealPrimary
                                )
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Clear",
                                    tint = MedTealPrimary,
                                    modifier = Modifier.size(13.dp)
                                )
                            }
                        }
                    }
                }

                // Compact 44dp Search Box inside Matrix Header
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(44.dp),
                    shape = RoundedCornerShape(12.dp),
                    color = Slate50,
                    border = BorderStroke(1.dp, Slate200)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = null,
                            tint = MedTealPrimary,
                            modifier = Modifier.size(18.dp)
                        )
                        Box(
                            modifier = Modifier.weight(1f),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            if (searchQuery.isEmpty()) {
                                Text(
                                    text = "Filter ${filteredItems.size} tests, packages or codes...",
                                    fontSize = 12.sp,
                                    color = Slate400,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                            BasicTextField(
                                value = searchQuery,
                                onValueChange = onSearchChange,
                                singleLine = true,
                                textStyle = TextStyle(
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Slate900
                                ),
                                cursorBrush = SolidColor(MedTealPrimary),
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                        if (searchQuery.isNotEmpty()) {
                            IconButton(
                                onClick = { onSearchChange("") },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Clear",
                                    tint = Slate500,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }

                // SubTab & Fasting Filter Pills Row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    listOf(
                        "ALL" to "All Items",
                        "PACKAGES" to "Packages",
                        "PROFILES" to "Profiles",
                        "TESTS" to "Single Tests"
                    ).forEach { (key, label) ->
                        val isSel = catalogSubTab == key
                        Surface(
                            onClick = { onSubTabChange(key) },
                            shape = RoundedCornerShape(50),
                            color = if (isSel) MedTealPrimary else Slate100
                        ) {
                            Text(
                                text = label,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSel) PureWhite else Slate700,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }
                    }

                    Surface(
                        onClick = {
                            onFastingFilterChange(
                                when (fastingFilter) {
                                    "ALL" -> "NO"
                                    "NO" -> "YES"
                                    else -> "ALL"
                                }
                            )
                        },
                        shape = RoundedCornerShape(50),
                        color = if (fastingFilter != "ALL") AmberWarning.copy(alpha = 0.15f) else Slate100
                    ) {
                        Text(
                            text = when (fastingFilter) {
                                "NO" -> "No Fasting Only"
                                "YES" -> "Fasting Required"
                                else -> "Fasting: Any"
                            },
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (fastingFilter != "ALL") AmberWarning else Slate700,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(
                start = 16.dp,
                end = 16.dp,
                top = 12.dp,
                bottom = 110.dp
            ),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(filteredItems, key = { it.id + it.code }) { item ->
                CatalogMatrixItemCard(
                    item = item,
                    onSelectItem = { onSelectItem(item) },
                    onAddToCart = { onAddToCart(item) }
                )
            }
        }
    }
}

@Composable
private fun CatalogMatrixItemCard(
    item: CatalogItem,
    onSelectItem: () -> Unit,
    onAddToCart: () -> Unit
) {
    val mrp = if (item.mrp > item.price) item.mrp else (item.price * 1.35).toInt()

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onSelectItem() },
        shape = RoundedCornerShape(16.dp),
        color = PureWhite,
        shadowElevation = 1.dp,
        border = BorderStroke(1.dp, Slate200)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        if (item.code.isNotBlank()) {
                            Surface(
                                color = Slate100,
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    text = item.code,
                                    fontSize = 9.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate600,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Surface(
                            color = MedTealLight,
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = item.displayItemType,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = MedTealPrimary,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = item.name,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )

                    Text(
                        text = "${item.displaySample} • Report in ${item.displayTat}",
                        fontSize = 11.sp,
                        color = Slate500,
                        modifier = Modifier.padding(top = 3.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "₹${item.price}",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Black,
                        color = MedTealPrimary
                    )
                    Text(
                        text = "MRP ₹$mrp",
                        fontSize = 10.sp,
                        color = Slate400,
                        textDecoration = TextDecoration.LineThrough
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Button(
                        onClick = onAddToCart,
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                        modifier = Modifier.height(30.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = null,
                            tint = PureWhite,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = "Add",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = PureWhite
                        )
                    }
                }
            }
        }
    }
}
