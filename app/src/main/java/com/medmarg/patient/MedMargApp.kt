package com.medmarg.patient

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.CatalogStore
import com.medmarg.patient.model.CartItem
import com.medmarg.patient.model.CatalogItem
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.model.UserRole
import com.medmarg.patient.ui.components.*
import com.medmarg.patient.ui.screens.*
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MedMargApp() {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    // Initialize Catalog Store with 913+ Tests from Assets
    LaunchedEffect(Unit) {
        CatalogStore.initialize(context)
    }

    // Authenticated User State (Matches iOS login/logout workflow)
    var loggedInUser by remember {
        mutableStateOf<UserProfile?>(
            UserProfile(
                id = "usr_pat",
                name = "Rahul Sharma",
                username = "patient",
                email = "patient@medmarg.com",
                phone = "+91 98765 43210",
                role = UserRole.PATIENT,
                organization = "Air Bypass Road, Tirupati - 517501"
            )
        )
    }

    // Navigation State: 0: Home, 1: Labs & Tests, 2: Track, 3: Reports, 4: Profile, 5: Doctors, 6: Pharmacy, 7: Scans
    var selectedTab by remember { mutableIntStateOf(0) }

    // Sheets & Overlays State
    var showSidebar by remember { mutableStateOf(false) }
    var showNotificationCenter by remember { mutableStateOf(false) }
    var showBottomSheetMenu by remember { mutableStateOf(false) }
    var showCartSheet by remember { mutableStateOf(false) }
    var showRoleSwitchSheet by remember { mutableStateOf(false) }
    var showLocationSheet by remember { mutableStateOf(false) }
    var showGooglePhoneSheet by remember { mutableStateOf(false) }

    // Universal Item Details Sheet State
    var selectedDetailItem by remember { mutableStateOf<CatalogItem?>(null) }

    // Global Cart Items State
    val cartItems = remember {
        mutableStateListOf(
            CartItem(
                id = "cart_1",
                title = "Aarogyam Complete 1.3 (Full Body)",
                subtitle = "104 Biomarkers • Free Home Collection in Tirupati",
                provider = "MedMarg Central Diagnostics",
                price = 1499,
                mrp = 3500,
                type = "Health Package",
                appointmentDate = "Tomorrow, 07:30 AM",
                isHomeCollection = true
            )
        )
    }

    if (loggedInUser == null) {
        // ==========================================
        // 🔐 AUTHENTICATION / LOGIN VIEW
        // ==========================================
        LoginScreen(
            onLoginSuccess = { user ->
                loggedInUser = user
                coroutineScope.launch {
                    snackbarHostState.showSnackbar("Welcome back, ${user.name}!")
                }
            },
            onGoogleSignInClicked = {
                val googleUser = UserProfile(
                    id = "usr_g_12345",
                    name = "Rahul Sharma",
                    username = "rahul_google",
                    email = "rahul.patient@gmail.com",
                    phone = "",
                    role = UserRole.PATIENT,
                    organization = "MedMarg Patient Portal"
                )
                loggedInUser = googleUser
                showGooglePhoneSheet = true
            }
        )

        // Google Phone Prompt Sheet
        if (showGooglePhoneSheet) {
            loggedInUser?.let { user ->
                GooglePhoneSheet(
                    tempUser = user,
                    onDismissRequest = { showGooglePhoneSheet = false },
                    onConfirmPhone = { phone ->
                        loggedInUser = user.copy(phone = phone)
                        showGooglePhoneSheet = false
                        coroutineScope.launch {
                            snackbarHostState.showSnackbar("Phone verified: $phone")
                        }
                    }
                )
            }
        }
    } else {
        // ==========================================
        // 🏥 MAIN MEDMARG LOGGED-IN WORKSPACE
        // ==========================================
        val user = loggedInUser!!

        Scaffold(
            snackbarHost = { SnackbarHost(snackbarHostState) },
            topBar = {
                TopbarView(
                    user = user,
                    onMenuClick = { showSidebar = true },
                    onNotificationClick = { showNotificationCenter = true },
                    onLogoutClick = {
                        loggedInUser = null
                        selectedTab = 0
                        coroutineScope.launch {
                            snackbarHostState.showSnackbar("Signed out of MedMarg")
                        }
                    }
                )
            },
            bottomBar = {
                Column {
                    // Floating Cart Bar (Sticky when cart has items)
                    if (cartItems.isNotEmpty() && selectedTab != 2) {
                        FloatingCartBar(
                            cartItems = cartItems,
                            onCheckoutClick = { showCartSheet = true }
                        )
                    }

                    // 5-Tab Navigation Bar with Drag Handle Bar
                    BottomNavbarView(
                        selectedTab = selectedTab,
                        onTabSelected = { selectedTab = it },
                        userRole = user.role,
                        onOpenMenuSheet = { showBottomSheetMenu = true }
                    )
                }
            },
            containerColor = Slate50
        ) { paddingValues ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                // Main Tab Routing
                when (selectedTab) {
                    0 -> HomeScreen(
                        onNavigateToTab = { selectedTab = it },
                        onSelectItem = { selectedDetailItem = it },
                        onOpenPrescription = {
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Prescription Upload Camera Opened")
                            }
                        }
                    )
                    1 -> DiagnosticsScreen(
                        onSelectItem = { selectedDetailItem = it },
                        onAddToCart = { item ->
                            cartItems.add(
                                CartItem(
                                    id = "cart_${System.currentTimeMillis()}",
                                    title = item.name,
                                    subtitle = "${item.displayItemType} • ${item.displaySample}",
                                    price = item.price,
                                    mrp = if (item.mrp > 0) item.mrp else item.price + 500,
                                    type = item.displayItemType
                                )
                            )
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Added ${item.name} to Cart")
                            }
                        }
                    )
                    2 -> TrackScreen()
                    3 -> HealthLockerScreen()
                    4 -> ProfileScreen(
                        user = user,
                        onOpenLocationPicker = { showLocationSheet = true },
                        onSwitchRole = { showRoleSwitchSheet = true },
                        onLogout = {
                            loggedInUser = null
                            selectedTab = 0
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Signed out")
                            }
                        }
                    )
                    5 -> DoctorsScreen(
                        onBookDoctor = { doctor ->
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Consultation slot selected with ${doctor.name}")
                            }
                        }
                    )
                    6 -> PharmacyScreen(
                        onAddToCart = { med, isGeneric ->
                            val finalPrice = if (isGeneric && med.genericAlternative != null) med.genericAlternative.discountedPrice else med.price
                            val finalTitle = if (isGeneric && med.genericAlternative != null) "${med.genericAlternative.name} (Generic substitute)" else med.name
                            cartItems.add(
                                CartItem(
                                    id = "med_${med.id}",
                                    title = finalTitle,
                                    subtitle = "${med.composition} • ${med.packSize}",
                                    price = finalPrice,
                                    mrp = med.mrp,
                                    type = "Pharmacy"
                                )
                            )
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Added $finalTitle to Cart")
                            }
                        }
                    )
                    7 -> ScansScreen(
                        onSelectScanCenter = { scan, center ->
                            cartItems.add(
                                CartItem(
                                    id = "scan_${scan.id}",
                                    title = scan.name,
                                    subtitle = "${scan.modality} • ${scan.bodyPart} • ${center.centerName}",
                                    price = center.price,
                                    mrp = center.originalPrice,
                                    type = "Radiology Scan"
                                )
                            )
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Added ${scan.name} (${center.centerName}) to Cart")
                            }
                        }
                    )
                }

                // Universal Item Details Sheet (With Smart Package Upgrades & Highlighted Savings)
                selectedDetailItem?.let { item ->
                    UniversalItemDetailsSheet(
                        item = item,
                        onDismissRequest = { selectedDetailItem = null },
                        onAddToCart = { selectedItem ->
                            cartItems.add(
                                CartItem(
                                    id = "cart_${System.currentTimeMillis()}",
                                    title = selectedItem.name,
                                    subtitle = "${selectedItem.displayItemType} • ${selectedItem.displaySample}",
                                    price = selectedItem.price,
                                    mrp = if (selectedItem.mrp > 0) selectedItem.mrp else selectedItem.price + 500,
                                    type = selectedItem.displayItemType
                                )
                            )
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Added ${selectedItem.name} to Cart")
                            }
                        },
                        onUpgradeToPackage = { pkg ->
                            cartItems.clear()
                            cartItems.add(
                                CartItem(
                                    id = "cart_${System.currentTimeMillis()}",
                                    title = pkg.name,
                                    subtitle = "${pkg.testCount ?: 104} Biomarkers • Complete Screening",
                                    price = pkg.price,
                                    mrp = pkg.mrp,
                                    type = "Health Package"
                                )
                            )
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Upgraded to ${pkg.name}! Saved 57% OFF.")
                            }
                        }
                    )
                }

                // Cart View Sheet (Opens when user clicks floating cart bar or cart action)
                if (showCartSheet) {
                    CartViewSheet(
                        cartItems = cartItems,
                        onDismissRequest = { showCartSheet = false },
                        onConfirmOrder = {
                            cartItems.clear()
                            showCartSheet = false
                            selectedTab = 2 // Switch directly to live tracker
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Home Collection Confirmed! Phlebotomist Dispatched.")
                            }
                        }
                    )
                }

                // Bottom Sheet Quick Menu (Matching iOS BottomSheetMenuView)
                if (showBottomSheetMenu) {
                    BottomSheetMenuView(
                        user = user,
                        onDismissRequest = { showBottomSheetMenu = false },
                        onNavigateTab = { tabIndex, _ ->
                            selectedTab = tabIndex
                            showBottomSheetMenu = false
                        },
                        onLogout = {
                            showBottomSheetMenu = false
                            loggedInUser = null
                            selectedTab = 0
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Signed out")
                            }
                        }
                    )
                }

                // Notification Center Sheet
                if (showNotificationCenter) {
                    NotificationCenterSheet(
                        onDismissRequest = { showNotificationCenter = false }
                    )
                }

                // Location Picker Bottom Sheet
                if (showLocationSheet) {
                    LocationPickerBottomSheet(
                        onDismissRequest = { showLocationSheet = false },
                        onSelectAddress = { address ->
                            showLocationSheet = false
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Serving address updated: $address")
                            }
                        }
                    )
                }

                // First-Login Google Phone Sheet
                if (showGooglePhoneSheet) {
                    GooglePhoneSheet(
                        tempUser = user,
                        onDismissRequest = { showGooglePhoneSheet = false },
                        onConfirmPhone = { phone ->
                            loggedInUser = user.copy(phone = phone)
                            showGooglePhoneSheet = false
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Phone verified: $phone")
                            }
                        }
                    )
                }

                // Role Switcher Modal
                if (showRoleSwitchSheet) {
                    ModalBottomSheet(
                        onDismissRequest = { showRoleSwitchSheet = false },
                        containerColor = PureWhite
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp)
                                .padding(bottom = 32.dp)
                        ) {
                            Text(
                                text = "Switch User Workspace",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                            Text(
                                text = "Select which MedMarg module console to open:",
                                fontSize = 12.sp,
                                color = Slate500
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            UserRole.entries.forEach { role ->
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp)
                                        .clickable {
                                            loggedInUser = loggedInUser?.copy(role = role)
                                            showRoleSwitchSheet = false
                                            coroutineScope.launch {
                                                snackbarHostState.showSnackbar("Switched to ${role.displayName}")
                                            }
                                        },
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(
                                        containerColor = if (loggedInUser?.role == role) MedTealLight else Slate50
                                    ),
                                    border = androidx.compose.foundation.BorderStroke(
                                        1.dp,
                                        if (loggedInUser?.role == role) MedTealPrimary else Slate200
                                    )
                                ) {
                                    Row(
                                        modifier = Modifier.padding(14.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(10.dp)
                                                .clip(CircleShape)
                                                .background(Color(role.badgeColorHex))
                                        )
                                        Spacer(modifier = Modifier.width(12.dp))
                                        Text(
                                            text = role.displayName,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (loggedInUser?.role == role) MedTealPrimary else Slate900
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // Sidebar Drawer (Animated Slide-In, Matching iOS SidebarView)
                AnimatedVisibility(
                    visible = showSidebar,
                    enter = slideInHorizontally(initialOffsetX = { -it }) + fadeIn(),
                    exit = slideOutHorizontally(targetOffsetX = { -it }) + fadeOut()
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color.Black.copy(alpha = 0.5f))
                            .clickable { showSidebar = false }
                    ) {
                        SidebarView(
                            user = user,
                            onNavigateTab = { tabIndex, _ ->
                                selectedTab = tabIndex
                                showSidebar = false
                            },
                            onLogout = {
                                showSidebar = false
                                loggedInUser = null
                                selectedTab = 0
                                coroutineScope.launch {
                                    snackbarHostState.showSnackbar("Signed out")
                                }
                            },
                            onClose = { showSidebar = false }
                        )
                    }
                }
            }
        }
    }
}
