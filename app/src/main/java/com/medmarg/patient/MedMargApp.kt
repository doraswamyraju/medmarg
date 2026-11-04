package com.medmarg.patient

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.zIndex
import com.medmarg.patient.data.CatalogStore
import com.medmarg.patient.data.PatientApiService
import com.medmarg.patient.data.PatientSessionStore
import com.medmarg.patient.model.CartItem
import com.medmarg.patient.model.CatalogItem
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.model.UserRole
import com.medmarg.patient.ui.agent.*
import com.medmarg.patient.ui.checkout.AddressPinpointModal
import com.medmarg.patient.ui.components.*
import com.medmarg.patient.ui.customer.topbar.CustomerTopbarView
import com.medmarg.patient.ui.freelance.*
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

    // Authenticated User State
    var loggedInUser by remember {
        mutableStateOf<UserProfile?>(null)
    }

    // Navigation State:
    // 0: Home, 1: Labs & Tests, 2: Track, 3: Reports, 4: Profile,
    // 5: Doctors, 6: Pharmacy, 7: Scans, 8: Vitals Hub, 9: Customer Orders, 10: Refer & Corporate
    var selectedTab by remember { mutableIntStateOf(0) }
    var selectedSubTab by remember { mutableIntStateOf(0) }

    // Sheets & Overlays State
    var showSidebar by remember { mutableStateOf(false) }
    var showNotificationCenter by remember { mutableStateOf(false) }
    var showBottomSheetMenu by remember { mutableStateOf(false) }
    var showCartSheet by remember { mutableStateOf(false) }
    var showCheckoutSheet by remember { mutableStateOf(false) }
    var showRoleSwitchSheet by remember { mutableStateOf(false) }
    var showLocationSheet by remember { mutableStateOf(false) }
    var showGooglePhoneSheet by remember { mutableStateOf(false) }
    var showPrescriptionModal by remember { mutableStateOf(false) }

    // Checkout Context passed from CartViewSheet -> CheckoutSheet
    var checkoutLabName by remember { mutableStateOf("MedMarg Central NABL Hub") }
    var checkoutIsExpress by remember { mutableStateOf(false) }
    var checkoutPayableAmount by remember { mutableIntStateOf(0) }

    // Universal Item Details Sheet State
    var selectedDetailItem by remember { mutableStateOf<CatalogItem?>(null) }

    // Global Cart Items State (Starts EMPTY — zero pre-added dummy tests!)
    val cartItems = remember {
        mutableStateListOf<CartItem>()
    }

    // Sync Patient Session & Live Orders on User Login
    LaunchedEffect(loggedInUser?.id, loggedInUser?.phone) {
        val currentUser = loggedInUser
        if (currentUser != null) {
            com.medmarg.patient.data.NotificationStore.initializeForUser(context, currentUser.email.ifEmpty { currentUser.phone })
            if (currentUser.role == UserRole.PATIENT) {
                PatientSessionStore.initializeForUser(context, currentUser)
                val fetchedOrders = PatientApiService.fetchPatientOrders(currentUser)
                PatientSessionStore.liveOrders.clear()
                PatientSessionStore.liveOrders.addAll(fetchedOrders)
            }
        }
    }

    if (loggedInUser == null) {
        // ==========================================
        // 🔐 AUTHENTICATION / LOGIN VIEW
        // ==========================================
        LoginScreen(
            onLoginSuccess = { user ->
                loggedInUser = user
                coroutineScope.launch {
                    snackbarHostState.showSnackbar("Welcome, ${user.name}!")
                }
            }
        )
    } else {
        // ==========================================
        // 🏥 MAIN MEDMARG LOGGED-IN WORKSPACE
        // ==========================================
        val user = loggedInUser!!

        Box(modifier = Modifier.fillMaxSize()) {
        Scaffold(
            snackbarHost = { SnackbarHost(snackbarHostState) },
            topBar = {
                if (user.role == UserRole.PATIENT) {
                    val defaultAddr = PatientSessionStore.savedAddresses.firstOrNull { it.isDefault }
                        ?: PatientSessionStore.savedAddresses.firstOrNull()
                    val addrText = defaultAddr?.fullAddress ?: user.organization

                    CustomerTopbarView(
                        user = user,
                        city = PatientSessionStore.selectedCity,
                        address = addrText,
                        onMenuClick = { showSidebar = true },
                        onLogoClick = {
                            selectedTab = 0
                            selectedSubTab = 0
                            showSidebar = false
                        },
                        onLocationClick = { showLocationSheet = true },
                        onNotificationClick = { showNotificationCenter = true },
                        onProfileClick = {
                            selectedTab = 4
                            selectedSubTab = 0
                            showSidebar = false
                        },
                        onLogoutClick = {
                            loggedInUser = null
                            selectedTab = 0
                            selectedSubTab = 0
                            cartItems.clear()
                            PatientSessionStore.liveOrders.clear()
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Signed out of MedMarg")
                            }
                        }
                    )
                } else if (user.role != UserRole.COLLECTION_AGENT && user.role != UserRole.FREELANCE_AGENT) {
                    TopbarView(
                        user = user,
                        onMenuClick = { showSidebar = true },
                        onNotificationClick = { showNotificationCenter = true },
                        onLogoutClick = {
                            loggedInUser = null
                            selectedTab = 0
                            selectedSubTab = 0
                            cartItems.clear()
                            PatientSessionStore.liveOrders.clear()
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Signed out of MedMarg")
                            }
                        },
                        onLogoClick = {
                            selectedTab = 0
                            selectedSubTab = 0
                            showSidebar = false
                        }
                    )
                }
            },
            bottomBar = {
                Column {
                    // Floating Cart Bar (Sticky when cart has items & user is Patient)
                    if (user.role == UserRole.PATIENT && cartItems.isNotEmpty() && selectedTab != 2) {
                        FloatingCartBar(
                            cartItems = cartItems,
                            onCheckoutClick = { showCartSheet = true }
                        )
                    }

                    // Bottom Navigation Bar
                    BottomNavbarView(
                        selectedTab = if (selectedTab in 0..4) selectedTab else 0,
                        onTabSelected = {
                            selectedTab = it
                            selectedSubTab = 0
                        },
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
                // Role-Based Screen Routing
                when (user.role) {
                    UserRole.COLLECTION_AGENT -> {
                        AgentDashboardScreen(
                            user = user,
                            onLogout = {
                                loggedInUser = null
                                selectedTab = 0
                            },
                            selectedTab = selectedTab,
                            onTabSelected = { selectedTab = it },
                            onOpenSidebar = { showSidebar = true },
                            onOpenNotifications = { showNotificationCenter = true }
                        )
                    }
                    UserRole.FREELANCE_AGENT -> {
                        FreelanceDashboardScreen(
                            user = user,
                            onLogout = {
                                loggedInUser = null
                                selectedTab = 0
                            },
                            selectedTab = selectedTab,
                            onTabSelected = { selectedTab = it },
                            onOpenSidebar = { showSidebar = true },
                            onOpenNotifications = { showNotificationCenter = true }
                        )
                    }
                    UserRole.ADMIN -> {
                        AdminDashboardScreen(
                            onSwitchRole = { showRoleSwitchSheet = true }
                        )
                    }
                    UserRole.DOCTOR -> {
                        DoctorDashboardScreen(
                            onSwitchRole = { showRoleSwitchSheet = true }
                        )
                    }
                    else -> {
                        // Patient Main Tab Routing
                        val activeOrder = PatientSessionStore.liveOrders.firstOrNull { it.isActive }
                        when (selectedTab) {
                            0 -> HomeScreen(
                                user = user,
                                currentCity = PatientSessionStore.selectedCity,
                                activeOrder = activeOrder,
                                onNavigateToTab = {
                                    selectedTab = it
                                    selectedSubTab = 0
                                },
                                onSelectItem = { selectedDetailItem = it },
                                onAddToCart = { item ->
                                    cartItems.add(
                                        CartItem(
                                            id = item.code.ifEmpty { item.id },
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
                                },
                                onOpenPrescription = { showPrescriptionModal = true },
                                onOpenVitals = { selectedTab = 8 }
                            )
                            1 -> DiagnosticsScreen(
                                onSelectItem = { selectedDetailItem = it },
                                onAddToCart = { item ->
                                    cartItems.add(
                                        CartItem(
                                            id = item.code.ifEmpty { item.id },
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
                                },
                                initialSubTab = selectedSubTab,
                                onOpenScans = { selectedTab = 7 }
                            )
                            2 -> TrackScreen(
                                user = user,
                                onBrowseTests = { selectedTab = 1 },
                                onOpenAllOrders = { selectedTab = 9 }
                            )
                            3 -> HealthLockerScreen(
                                user = user,
                                onBrowseTests = { selectedTab = 1 }
                            )
                            4 -> ProfileScreen(
                                user = user,
                                onOpenLocationPicker = { showLocationSheet = true },
                                onSwitchRole = { showRoleSwitchSheet = true },
                                onLogout = {
                                    loggedInUser = null
                                    selectedTab = 0
                                    selectedSubTab = 0
                                    cartItems.clear()
                                    PatientSessionStore.liveOrders.clear()
                                    coroutineScope.launch {
                                        snackbarHostState.showSnackbar("Signed out")
                                    }
                                },
                                onOpenMyOrders = { selectedTab = 9 },
                                onOpenVaultReports = { selectedTab = 3 },
                                onOpenVitals = { selectedTab = 8 },
                                onOpenReferralCorporate = {
                                    selectedTab = 10
                                    selectedSubTab = 0
                                },
                                onUserUpdated = { updatedUser ->
                                    loggedInUser = updatedUser
                                    coroutineScope.launch {
                                        snackbarHostState.showSnackbar("Profile updated")
                                    }
                                },
                                initialSubTab = selectedSubTab
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
                            8 -> VitalsTelemetryScreen(
                                onBackToHome = { selectedTab = 0 },
                                onAddRecommendedTest = { item ->
                                    cartItems.add(
                                        CartItem(
                                            id = item.code.ifEmpty { item.id },
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
                            9 -> CustomerOrdersScreen(
                                user = user,
                                onBack = { selectedTab = 4 },
                                onOpenLiveTracker = { selectedTab = 2 },
                                onBrowseTests = { selectedTab = 1 }
                            )
                            10 -> ReferralCorporateScreen(
                                user = user,
                                initialSubTab = selectedSubTab,
                                onNavigateToCatalog = { selectedTab = 1 }
                            )
                        }
                    }
                }

                // Universal Item Details Sheet
                selectedDetailItem?.let { item ->
                    UniversalItemDetailsSheet(
                        item = item,
                        onDismissRequest = { selectedDetailItem = null },
                        onAddToCart = { selectedItem ->
                            cartItems.add(
                                CartItem(
                                    id = selectedItem.code.ifEmpty { selectedItem.id },
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
                                    id = pkg.code.ifEmpty { pkg.id },
                                    title = pkg.name,
                                    subtitle = "${pkg.testCount ?: 104} Biomarkers • Complete Screening",
                                    price = pkg.price,
                                    mrp = pkg.mrp,
                                    type = "Health Package"
                                )
                            )
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Upgraded to ${pkg.name}!")
                            }
                        }
                    )
                }

                // Step 1: Cart View Sheet -> Opens Step 2: CheckoutSheet
                if (showCartSheet) {
                    CartViewSheet(
                        cartItems = cartItems,
                        onDismissRequest = { showCartSheet = false },
                        onProceedToCheckout = { labName, isExpress, finalPayable ->
                            checkoutLabName = labName
                            checkoutIsExpress = isExpress
                            checkoutPayableAmount = finalPayable
                            showCartSheet = false
                            showCheckoutSheet = true
                        }
                    )
                }

                // Step 2: Checkout Sheet (Beneficiary, Address Pinpoint, Slot & Razorpay / Doorstep Payment)
                if (showCheckoutSheet) {
                    CheckoutSheet(
                        user = user,
                        cartItems = cartItems,
                        selectedLabName = checkoutLabName,
                        isExpress60Min = checkoutIsExpress,
                        payableAmount = checkoutPayableAmount,
                        onDismissRequest = { showCheckoutSheet = false },
                        onOrderBooked = { bookedOrder ->
                            cartItems.clear()
                            showCheckoutSheet = false
                            selectedTab = 2 // Switch directly to live tracker
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Order #${bookedOrder.id} Confirmed! Handover OTP: ${bookedOrder.otp}")
                            }
                        }
                    )
                }

                // Prescription Upload Modal
                if (showPrescriptionModal) {
                    PrescriptionUploadModal(
                        patientName = user.name,
                        patientPhone = user.phone,
                        onDismiss = { showPrescriptionModal = false },
                        onSubmitted = {
                            showPrescriptionModal = false
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Prescription received! Our pathologist team will call ${user.phone} shortly.")
                            }
                        }
                    )
                }

                // Bottom Sheet Quick Menu
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
                            cartItems.clear()
                            PatientSessionStore.liveOrders.clear()
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

                // Location / Address Pinpoint Modal
                if (showLocationSheet) {
                    AddressPinpointModal(
                        defaultPhone = user.phone,
                        onDismiss = { showLocationSheet = false },
                        onAddressSaved = { newAddr ->
                            if (newAddr.isDefault) {
                                for (i in PatientSessionStore.savedAddresses.indices) {
                                    PatientSessionStore.savedAddresses[i] = PatientSessionStore.savedAddresses[i].copy(isDefault = false)
                                }
                            }
                            PatientSessionStore.savedAddresses.add(0, newAddr)
                            PatientSessionStore.saveAddresses(context, user)
                            showLocationSheet = false
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("Doorstep address saved: ${newAddr.fullAddress}")
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
            }
        }

        // Full-Screen Slide-Out Sidebar Drawer (Overlays Topbar & Bottom Navbar 1-on-1 with iOS)
        AnimatedVisibility(
            visible = showSidebar,
            enter = slideInHorizontally(initialOffsetX = { -it }) + fadeIn(),
            exit = slideOutHorizontally(targetOffsetX = { -it }) + fadeOut(),
            modifier = Modifier.fillMaxSize().zIndex(100f)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.45f))
                    .clickable { showSidebar = false }
            ) {
                SidebarView(
                    user = user,
                    selectedTab = selectedTab,
                    selectedSubTab = selectedSubTab,
                    onNavigateTab = { tabIndex, subTabIndex ->
                        selectedTab = tabIndex
                        selectedSubTab = subTabIndex
                        showSidebar = false
                    },
                    onLogout = {
                        showSidebar = false
                        loggedInUser = null
                        selectedTab = 0
                        selectedSubTab = 0
                        cartItems.clear()
                        PatientSessionStore.liveOrders.clear()
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
