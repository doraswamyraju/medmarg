package com.medmarg.patient.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.CatalogStore
import com.medmarg.patient.model.CatalogItem
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.delay
import java.util.Calendar

// =========================================================================
// 🏠 CARE SEEKER HOME SCREEN (REDESIGNED 1-ON-1 WITH IOS CARESEEKERHOMEVIEW)
// Scenic Tirupati Hero, Embedded Search, Quick Categories, Family Banner,
// Segmented Packages Carousel, Common Tests, and Health Profiles
// =========================================================================

@Composable
fun HomeScreen(
    user: UserProfile? = null,
    currentCity: String = "Tirupati",
    onNavigateToTab: (Int) -> Unit,
    onSelectItem: (CatalogItem) -> Unit,
    onAddToCart: ((CatalogItem) -> Unit)? = null,
    onOpenPrescription: () -> Unit
) {
    val context = LocalContext.current
    var packageTab by remember { mutableStateOf("POPULAR") } // POPULAR, RECOMMENDED, PROFILES
    var addedToast by remember { mutableStateOf<String?>(null) }

    // Auto-dismiss toast
    LaunchedEffect(addedToast) {
        if (addedToast != null) {
            delay(2000)
            addedToast = null
        }
    }

    val greetingText = remember {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        when {
            hour < 12 -> "Good Morning,"
            hour < 17 -> "Good Afternoon,"
            else -> "Good Evening,"
        }
    }

    val displayName = remember(user) {
        if (!user?.name.isNullOrEmpty()) user!!.name else "Ravi Kumar"
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 120.dp)
        ) {
            // 1. Scenic City Hero Header (Tirupati Skyline, Greeting, Embedded Search)
            ScenicCityHeroSection(
                greeting = greetingText,
                displayName = displayName,
                currentCity = currentCity,
                onSearchClick = { onNavigateToTab(1) }
            )

            Spacer(modifier = Modifier.height(14.dp))

            // 2. Active Phlebotomist Enroute Quick Banner
            ActiveDispatchQuickBanner(
                onTrackClick = { onNavigateToTab(2) }
            )

            Spacer(modifier = Modifier.height(18.dp))

            // 3. Quick Health Categories Row (6 Square Tiles)
            QuickCategoriesRow(
                onCategoryClick = { onNavigateToTab(1) }
            )

            Spacer(modifier = Modifier.height(18.dp))

            // 4. Hero Family Promotion Banner ("Prevent Today for a Healthier Tomorrow")
            HeroFamilyPromoBanner(
                onExploreClick = { onNavigateToTab(1) }
            )

            Spacer(modifier = Modifier.height(20.dp))

            // 5. Segmented Packages Section (Popular Packages | Recommended | Health Profiles)
            SegmentedPackagesSection(
                selectedTab = packageTab,
                onTabSelect = { packageTab = it },
                onPackageSelect = { onNavigateToTab(1) }
            )

            Spacer(modifier = Modifier.height(20.dp))

            // 6. Common Tests (Horizontal Scroll with Direct [Add])
            CommonTestsSection(
                onViewAll = { onNavigateToTab(1) },
                onAddTest = { test ->
                    onAddToCart?.invoke(test)
                    addedToast = "Added ${test.code} to cart!"
                }
            )

            Spacer(modifier = Modifier.height(20.dp))

            // 7. Health Profiles (Men, Women, Senior)
            HealthProfilesSection(
                onProfileClick = { onNavigateToTab(1) }
            )
        }

        // Added to Cart Animated Toast
        AnimatedVisibility(
            visible = addedToast != null,
            enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
            exit = slideOutVertically(targetOffsetY = { it }) + fadeOut(),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 70.dp)
        ) {
            addedToast?.let { toast ->
                Surface(
                    color = Color(0xFF029469),
                    shape = RoundedCornerShape(24.dp),
                    shadowElevation = 8.dp
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 18.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = PureWhite,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = toast,
                            fontSize = 13.sp,
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
// 🌄 1. SCENIC CITY HERO HEADER (TIRUPATI TEMPLE GOPURAM, GREETING, SEARCH)
// =========================================================================

@Composable
private fun ScenicCityHeroSection(
    greeting: String,
    displayName: String,
    currentCity: String,
    onSearchClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(210.dp)
    ) {
        // Gradient Backdrop
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        listOf(
                            Color(0xFFD1EDF9),
                            Color(0xFFE6F5F2),
                            Slate50
                        )
                    )
                )
        )

        // Subtle Hills & Gopuram Tower Silhouette Graphic (Top Right)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp, end = 12.dp),
            horizontalArrangement = Arrangement.End
        ) {
            Box(
                modifier = Modifier
                    .size(width = 110.dp, height = 90.dp)
                    .clip(RoundedCornerShape(bottomStart = 24.dp))
                    .background(Color(0xFF66A6BF).copy(alpha = 0.15f)),
                contentAlignment = Alignment.BottomCenter
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(bottom = 6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(width = 14.dp, height = 8.dp)
                            .background(Color(0xFFB38C40).copy(alpha = 0.4f), RoundedCornerShape(2.dp))
                    )
                    Box(
                        modifier = Modifier
                            .size(width = 24.dp, height = 10.dp)
                            .background(Color(0xFFB38C40).copy(alpha = 0.35f), RoundedCornerShape(2.dp))
                    )
                    Box(
                        modifier = Modifier
                            .size(width = 34.dp, height = 12.dp)
                            .background(Color(0xFFB38C40).copy(alpha = 0.35f), RoundedCornerShape(2.dp))
                    )
                    Box(
                        modifier = Modifier
                            .size(width = 44.dp, height = 14.dp)
                            .background(Color(0xFFB38C40).copy(alpha = 0.35f), RoundedCornerShape(2.dp))
                    )
                }
            }
        }

        // Overlay Content: Greeting & Embedded Search Bar
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.padding(top = 4.dp)) {
                Text(
                    text = greeting,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = Slate600
                )
                Text(
                    text = displayName,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(top = 2.dp)
                ) {
                    Text(
                        text = "Your health partner in ",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = Slate600
                    )
                    Text(
                        text = currentCity,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = MedTealPrimary
                    )
                }
            }

            // Embedded Search Bar
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onSearchClick() },
                shape = RoundedCornerShape(24.dp),
                color = PureWhite,
                shadowElevation = 4.dp,
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = Slate400,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Search for tests, packages or health concerns...",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = Slate500,
                        modifier = Modifier.weight(1f),
                        maxLines = 1
                    )
                    Icon(
                        imageVector = Icons.Default.Tune,
                        contentDescription = "Filter",
                        tint = Slate600,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}

// =========================================================================
// 🏷️ 2. ACTIVE LIVE ORDER QUICK BANNER
// =========================================================================

@Composable
private fun ActiveDispatchQuickBanner(
    onTrackClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clickable { onTrackClick() },
        shape = RoundedCornerShape(14.dp),
        color = PureWhite,
        shadowElevation = 2.dp,
        border = androidx.compose.foundation.BorderStroke(1.5.dp, AmberGold.copy(alpha = 0.5f))
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
                    .clip(CircleShape)
                    .background(AmberGold.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.MyLocation,
                    contentDescription = null,
                    tint = AmberGold,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "Phlebotomist Enroute",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Surface(
                        color = RoseError,
                        shape = RoundedCornerShape(3.dp)
                    ) {
                        Text(
                            text = "LIVE",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            color = PureWhite,
                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                        )
                    }
                }

                Text(
                    text = "Order #ORD-7821 • OTP: 4892 • 07:30 AM",
                    fontSize = 11.sp,
                    color = Slate500,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }

            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = "Track",
                tint = MedTealPrimary,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}

// =========================================================================
// 🔲 3. QUICK HEALTH CATEGORIES ROW (6 SQUARE TILES)
// =========================================================================

@Composable
private fun QuickCategoriesRow(
    onCategoryClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        QuickCategoryTile(
            title = "Full Body\nCheckup",
            icon = Icons.Default.Person,
            iconColor = Color(0xFF2563EB),
            bgColor = Color(0xFFEBF2FE),
            onClick = onCategoryClick
        )
        QuickCategoryTile(
            title = "Diabetes\nCare",
            icon = Icons.Default.WaterDrop,
            iconColor = Color(0xFFDC2626),
            bgColor = Color(0xFFFEE2E2),
            onClick = onCategoryClick
        )
        QuickCategoryTile(
            title = "Heart\nHealth",
            icon = Icons.Default.Favorite,
            iconColor = Color(0xFFE11D48),
            bgColor = Color(0xFFFFE4E6),
            onClick = onCategoryClick
        )
        QuickCategoryTile(
            title = "Women's\nHealth",
            icon = Icons.Default.Woman,
            iconColor = Color(0xFFD946EF),
            bgColor = Color(0xFFFAE8FF),
            onClick = onCategoryClick
        )
        QuickCategoryTile(
            title = "Senior\nCare",
            icon = Icons.Default.Elderly,
            iconColor = Color(0xFF7C3AED),
            bgColor = Color(0xFFEDE9FE),
            onClick = onCategoryClick
        )
        QuickCategoryTile(
            title = "View\nAll",
            icon = Icons.Default.GridView,
            iconColor = Color(0xFF059669),
            bgColor = Color(0xFFD1FAE5),
            onClick = onCategoryClick
        )
    }
}

@Composable
private fun QuickCategoryTile(
    title: String,
    icon: ImageVector,
    iconColor: Color,
    bgColor: Color,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .width(68.dp)
            .clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(bgColor),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = iconColor,
                modifier = Modifier.size(26.dp)
            )
        }

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = title,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = Slate900,
            textAlign = TextAlign.Center,
            lineHeight = 13.sp,
            maxLines = 2
        )
    }
}

// =========================================================================
// 👨‍👩‍👧 4. HERO FAMILY PROMOTION BANNER ("PREVENT TODAY FOR HEALTHIER TOMORROW")
// =========================================================================

@Composable
private fun HeroFamilyPromoBanner(
    onExploreClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(20.dp),
        color = Color.Transparent,
        shadowElevation = 3.dp
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.linearGradient(
                        listOf(
                            Color(0xFFE0F7FA),
                            Color(0xFFE8F5E9)
                        )
                    )
                )
                .border(1.5.dp, PureWhite, RoundedCornerShape(20.dp))
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Left Column
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Column {
                        Text(
                            text = "Prevent Today",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Black,
                            color = Slate900
                        )
                        Row {
                            Text(
                                text = "for a ",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                            Text(
                                text = "Healthier Tomorrow",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF059669)
                            )
                        }
                    }

                    Text(
                        text = "Trusted diagnostic packages with home sample collection.",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        color = Slate600,
                        lineHeight = 13.sp,
                        maxLines = 2
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Button(
                        onClick = onExploreClick,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                        shape = RoundedCornerShape(20.dp),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Text("Explore Packages", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(12.dp))
                    }
                }

                Spacer(modifier = Modifier.width(8.dp))

                // Center: Family Icon Container
                Box(
                    modifier = Modifier
                        .size(76.dp)
                        .clip(CircleShape)
                        .background(PureWhite.copy(alpha = 0.6f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.FamilyRestroom,
                        contentDescription = null,
                        tint = MedTealPrimary,
                        modifier = Modifier.size(42.dp)
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                // Right Column: 4 Feature Badges
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    FeatureBadge(icon = Icons.Default.Home, text = "Home\nCollection")
                    FeatureBadge(icon = Icons.Default.Science, text = "Trusted\nLabs")
                    FeatureBadge(icon = Icons.Default.Description, text = "Accurate\nReports")
                    FeatureBadge(icon = Icons.Default.CreditCard, text = "No Cash\nPayments")
                }
            }
        }
    }
}

@Composable
private fun FeatureBadge(icon: ImageVector, text: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(18.dp)
                .clip(CircleShape)
                .background(Color(0xFF059669).copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = Color(0xFF059669),
                modifier = Modifier.size(10.dp)
            )
        }
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = text,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = Slate700,
            lineHeight = 11.sp
        )
    }
}

// =========================================================================
// 🎁 5. SEGMENTED PACKAGES SECTION
// =========================================================================

@Composable
private fun SegmentedPackagesSection(
    selectedTab: String,
    onTabSelect: (String) -> Unit,
    onPackageSelect: () -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        // Tab Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            PackageTabButton("POPULAR", "Popular Packages", selectedTab == "POPULAR") { onTabSelect("POPULAR") }
            PackageTabButton("RECOMMENDED", "Recommended for You", selectedTab == "RECOMMENDED") { onTabSelect("RECOMMENDED") }
            PackageTabButton("PROFILES", "Health Profiles", selectedTab == "PROFILES") { onTabSelect("PROFILES") }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Horizontal Carousel
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            PackageHeroCard(
                badge = "Most Popular",
                badgeColor = Color(0xFF059669),
                icon = Icons.Default.Groups,
                iconColor = Color(0xFF2563EB),
                title = "Full Body Checkup Basic",
                testsSummary = "60 Tests | 12 Health Parameters",
                price = 999,
                mrp = 1499,
                discount = "33% OFF",
                onDetail = onPackageSelect
            )

            PackageHeroCard(
                badge = null,
                badgeColor = null,
                icon = Icons.Default.WaterDrop,
                iconColor = Color(0xFF2563EB),
                title = "Diabetes Care Package",
                testsSummary = "45 Tests | 10 Health Parameters",
                price = 799,
                mrp = 1200,
                discount = "33% OFF",
                onDetail = onPackageSelect
            )

            PackageHeroCard(
                badge = null,
                badgeColor = null,
                icon = Icons.Default.Favorite,
                iconColor = Color(0xFFDC2626),
                title = "Heart Health Package",
                testsSummary = "55 Tests | 11 Health Parameters",
                price = 1299,
                mrp = 1999,
                discount = "35% OFF",
                onDetail = onPackageSelect
            )
        }
    }
}

@Composable
private fun PackageTabButton(
    key: String,
    title: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Column(
        modifier = Modifier.clickable { onClick() },
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = title,
            fontSize = 13.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.SemiBold,
            color = if (isSelected) MedTealPrimary else Slate500
        )
        Spacer(modifier = Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .height(3.dp)
                .width(if (isSelected) 36.dp else 0.dp)
                .clip(RoundedCornerShape(2.dp))
                .background(if (isSelected) MedTealPrimary else Color.Transparent)
        )
    }
}

@Composable
private fun PackageHeroCard(
    badge: String?,
    badgeColor: Color?,
    icon: ImageVector,
    iconColor: Color,
    title: String,
    testsSummary: String,
    price: Int,
    mrp: Int,
    discount: String,
    onDetail: () -> Unit
) {
    Surface(
        modifier = Modifier.width(220.dp),
        shape = RoundedCornerShape(16.dp),
        color = PureWhite,
        shadowElevation = 2.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                if (badge != null && badgeColor != null) {
                    Surface(
                        color = badgeColor,
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = badge,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = PureWhite,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                } else {
                    Spacer(modifier = Modifier.height(18.dp))
                }

                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(iconColor.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconColor,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    text = title,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900,
                    maxLines = 1
                )
                Text(
                    text = testsSummary,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    color = Slate500,
                    maxLines = 1
                )
            }

            // Price Row
            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = "₹$price",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "₹$mrp",
                    fontSize = 11.sp,
                    color = Slate400,
                    textDecoration = TextDecoration.LineThrough
                )
                Spacer(modifier = Modifier.width(6.dp))
                Surface(
                    color = Color(0xFFFEE2E2),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        text = discount,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFFDC2626),
                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                    )
                }
            }

            Divider(color = Slate200)

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onDetail() },
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "View Details",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MedTealPrimary
                )
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                    imageVector = Icons.Default.ArrowForward,
                    contentDescription = null,
                    tint = MedTealPrimary,
                    modifier = Modifier.size(12.dp)
                )
            }
        }
    }
}

// =========================================================================
// 🩸 6. COMMON TESTS (HORIZONTAL SCROLL WITH INSTANT [ADD])
// =========================================================================

@Composable
private fun CommonTestsSection(
    onViewAll: () -> Unit,
    onAddTest: (CatalogItem) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Common Tests",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )

            Row(
                modifier = Modifier.clickable { onViewAll() },
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "View All",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MedTealPrimary
                )
                Spacer(modifier = Modifier.width(2.dp))
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = MedTealPrimary,
                    modifier = Modifier.size(14.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            CommonTestCard("CBC", "Complete Blood\nCount (CBC)", 150, Icons.Default.WaterDrop, Color(0xFFDC2626), onAddTest)
            CommonTestCard("FBS", "Blood Sugar\n(FBS)", 100, Icons.Default.WaterDrop, Color(0xFFDC2626), onAddTest)
            CommonTestCard("LIPID", "Lipid Profile\nComplete", 250, Icons.Default.WaterDrop, Color(0xFFEA580C), onAddTest)
            CommonTestCard("THYROID", "Thyroid Profile\n(TSH, T3, T4)", 300, Icons.Default.AddBox, Color(0xFFD946EF), onAddTest)
            CommonTestCard("VIT_D", "Vitamin D\n(25-OH)", 450, Icons.Default.WbSunny, Color(0xFFF59E0B), onAddTest)
        }
    }
}

@Composable
private fun CommonTestCard(
    code: String,
    name: String,
    price: Int,
    icon: ImageVector,
    iconColor: Color,
    onAddTest: (CatalogItem) -> Unit
) {
    Surface(
        modifier = Modifier.width(120.dp),
        shape = RoundedCornerShape(16.dp),
        color = PureWhite,
        shadowElevation = 2.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(iconColor.copy(alpha = 0.10f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(20.dp)
                )
            }

            Text(
                text = name,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900,
                textAlign = TextAlign.Center,
                lineHeight = 13.sp,
                maxLines = 2,
                modifier = Modifier.height(28.dp)
            )

            Text(
                text = "₹$price",
                fontSize = 15.sp,
                fontWeight = FontWeight.Black,
                color = Slate900
            )

            OutlinedButton(
                onClick = {
                    val test = CatalogItem(
                        id = code,
                        serialNo = 1,
                        code = code,
                        name = name.replace("\n", " "),
                        sampleType = "SERUM",
                        fasting = "NO",
                        mrp = price + 150,
                        price = price,
                        tatHours = 24,
                        description = "Standard clinical laboratory investigation",
                        active = true,
                        itemType = "TEST"
                    )
                    onAddTest(test)
                },
                shape = RoundedCornerShape(8.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, MedTealPrimary),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = MedTealPrimary),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                modifier = Modifier.height(28.dp)
            ) {
                Text("Add", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

// =========================================================================
// 🧬 7. HEALTH PROFILES SECTION (MEN, WOMEN, SENIOR)
// =========================================================================

@Composable
private fun HealthProfilesSection(
    onProfileClick: () -> Unit
) {
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
            Text(
                text = "Health Profiles",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )

            Row(
                modifier = Modifier.clickable { onProfileClick() },
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "View All",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MedTealPrimary
                )
                Spacer(modifier = Modifier.width(2.dp))
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = MedTealPrimary,
                    modifier = Modifier.size(14.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            ProfilePillCard("Men's Health\nProfile", Icons.Default.Male, Color(0xFF2563EB), onProfileClick)
            ProfilePillCard("Women's Health\nProfile", Icons.Default.Female, Color(0xFFD946EF), onProfileClick)
            ProfilePillCard("Senior Care\nProfile", Icons.Default.Elderly, Color(0xFF7C3AED), onProfileClick)
        }
    }
}

@Composable
private fun ProfilePillCard(
    title: String,
    icon: ImageVector,
    iconColor: Color,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .width(180.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        color = PureWhite,
        shadowElevation = 2.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(10.dp))
                .background(iconColor.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(10.dp))

            Text(
                text = title,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900,
                lineHeight = 14.sp,
                modifier = Modifier.weight(1f)
            )

            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = Slate400,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}
