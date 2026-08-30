package com.medmarg.patient

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.medmarg.patient.model.CartItem
import com.medmarg.patient.model.ServiceType
import com.medmarg.patient.navigation.Screen
import com.medmarg.patient.navigation.bottomNavScreens
import com.medmarg.patient.ui.components.LocationPickerBottomSheet
import com.medmarg.patient.ui.components.MedMargTopHeader
import com.medmarg.patient.ui.screens.*
import com.medmarg.patient.ui.theme.EmeraldAccent
import com.medmarg.patient.ui.theme.MedTealDark
import com.medmarg.patient.ui.theme.MedTealPrimary
import com.medmarg.patient.ui.theme.PureWhite
import com.medmarg.patient.ui.theme.Slate500
import kotlinx.coroutines.launch

@Composable
fun MedMargApp() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Home.route

    val snackbarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()

    var currentLocation by remember { mutableStateOf("Tirupati, Andhra Pradesh") }
    var showLocationSheet by remember { mutableStateOf(false) }
    
    // Multi-role state
    var activeRole by remember { mutableStateOf(com.medmarg.patient.model.UserRole.PATIENT) }
    var showRoleSwitchSheet by remember { mutableStateOf(false) }

    // Global Cart State
    val cartItems = remember {
        mutableStateListOf(
            CartItem(
                id = "cart_1",
                title = "Aarogyam Complete 1.3 (Full Body)",
                subtitle = "104 Biomarkers • Free Home Collection in Tirupati",
                providerName = "Thyrocare Central Lab",
                price = 1499,
                originalPrice = 3500,
                serviceType = ServiceType.LAB_TEST,
                appointmentDate = "Tomorrow, 07:30 AM",
                isHomeCollection = true
            )
        )
    }

    if (showLocationSheet) {
        LocationPickerBottomSheet(
            onDismissRequest = { showLocationSheet = false },
            onSelectAddress = { newAddress ->
                currentLocation = newAddress
                coroutineScope.launch {
                    snackbarHostState.showSnackbar("Serving location updated to: $newAddress")
                }
            }
        )
    }

    // Role switcher bottom sheet
    if (showRoleSwitchSheet) {
        ModalBottomSheet(
            onDismissRequest = { showRoleSwitchSheet = false },
            containerColor = PureWhite
        ) {
            Column(modifier = Modifier.fillMaxWidth().padding(20.dp)) {
                Text(
                    "Switch User Workspace",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Text(
                    "Select which MedMarg module console to open:",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate500
                )
                Spacer(modifier = Modifier.height(14.dp))
                com.medmarg.patient.model.UserRole.entries.forEach { role ->
                    Surface(
                        color = if (activeRole == role) MedTealLight else Slate50,
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (activeRole == role) MedTealPrimary else Slate200),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp)
                            .clickable {
                                activeRole = role
                                showRoleSwitchSheet = false
                            }
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
                        ) {
                            Text(
                                text = role.displayName,
                                fontWeight = FontWeight.Bold,
                                color = if (activeRole == role) MedTealPrimary else Slate900,
                                modifier = Modifier.weight(1f)
                            )
                            if (activeRole == role) {
                                Text("ACTIVE", color = MedTealPrimary, fontWeight = FontWeight.Black, fontSize = 11.sp)
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(20.dp))
            }
        }
    }

    // Direct View for Super Admin and Doctor Roles
    if (activeRole == com.medmarg.patient.model.UserRole.SUPER_ADMIN) {
        AdminDashboardScreen(onSwitchRole = { showRoleSwitchSheet = true })
    } else if (activeRole == com.medmarg.patient.model.UserRole.DOCTOR) {
        DoctorDashboardScreen(onSwitchRole = { showRoleSwitchSheet = true })
    } else {
        Scaffold(
            snackbarHost = { SnackbarHost(snackbarHostState) },
            topBar = {
                if (currentRoute != Screen.Booking.route) {
                    MedMargTopHeader(
                        currentLocation = currentLocation,
                        cartCount = cartItems.size,
                        onLocationClick = { showLocationSheet = true },
                        onCartClick = { navController.navigate(Screen.Booking.route) }
                    )
                }
            },
            bottomBar = {
                if (currentRoute != Screen.Booking.route) {
                    NavigationBar(
                        containerColor = PureWhite,
                        contentColor = MedTealDark
                    ) {
                        bottomNavScreens.forEach { screen ->
                            val isSelected = currentRoute == screen.route
                            NavigationBarItem(
                                selected = isSelected,
                                onClick = {
                                    navController.navigate(screen.route) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                },
                                icon = {
                                    Icon(
                                        imageVector = if (isSelected) screen.selectedIcon else screen.unselectedIcon,
                                        contentDescription = screen.title
                                    )
                                },
                                label = {
                                    Text(
                                        text = screen.title,
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                    )
                                },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = MedTealPrimary,
                                    selectedTextColor = MedTealPrimary,
                                    indicatorColor = MedTealPrimary.copy(alpha = 0.15f),
                                    unselectedIconColor = Slate500,
                                    unselectedTextColor = Slate500
                                )
                            )
                        }
                    }
                }
            }
        ) { innerPadding ->
            NavHost(
                navController = navController,
                startDestination = Screen.Home.route,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    onNavigate = { route -> navController.navigate(route) },
                    onSelectLabTest = { test, labPricing ->
                        cartItems.add(
                            CartItem(
                                id = "cart_${System.currentTimeMillis()}",
                                title = test.name,
                                subtitle = "${test.parametersCount} Parameters • ${labPricing.tatHours}h TAT",
                                providerName = labPricing.labName,
                                price = labPricing.discountedPrice,
                                originalPrice = labPricing.originalPrice,
                                serviceType = ServiceType.LAB_TEST,
                                appointmentDate = "Tomorrow, 08:00 AM",
                                isHomeCollection = labPricing.homeCollectionAvailable
                            )
                        )
                        coroutineScope.launch {
                            snackbarHostState.showSnackbar("Added ${test.name} (${labPricing.labName}) to Cart")
                        }
                    }
                )
            }

            composable(Screen.Diagnostics.route) {
                DiagnosticsScreen(
                    onSelectLabTest = { test, labPricing ->
                        cartItems.add(
                            CartItem(
                                id = "cart_${System.currentTimeMillis()}",
                                title = test.name,
                                subtitle = "${test.parametersCount} Parameters",
                                providerName = labPricing.labName,
                                price = labPricing.discountedPrice,
                                originalPrice = labPricing.originalPrice,
                                serviceType = ServiceType.LAB_TEST
                            )
                        )
                        coroutineScope.launch {
                            snackbarHostState.showSnackbar("Added ${test.name} (${labPricing.labName}) to Cart")
                        }
                    }
                )
            }

            composable(Screen.Scans.route) {
                ScansScreen(
                    onSelectScanCenter = { scan, pricing ->
                        cartItems.add(
                            CartItem(
                                id = "cart_scan_${System.currentTimeMillis()}",
                                title = scan.name,
                                subtitle = pricing.machineSpec,
                                providerName = pricing.centerName,
                                price = pricing.price,
                                originalPrice = pricing.originalPrice,
                                serviceType = ServiceType.SCAN_RADIOLOGY,
                                appointmentDate = pricing.nextSlot,
                                isHomeCollection = false
                            )
                        )
                        coroutineScope.launch {
                            snackbarHostState.showSnackbar("Scan slot booked at ${pricing.centerName}")
                        }
                    }
                )
            }

            composable(Screen.Doctors.route) {
                DoctorsScreen(
                    onBookDoctor = { doctor ->
                        cartItems.add(
                            CartItem(
                                id = "cart_doc_${System.currentTimeMillis()}",
                                title = "Consultation: ${doctor.name}",
                                subtitle = doctor.specialty,
                                providerName = doctor.clinicOrHospital,
                                price = doctor.fee,
                                originalPrice = doctor.fee,
                                serviceType = ServiceType.DOCTOR_CONSULT,
                                appointmentDate = doctor.nextSlot,
                                isHomeCollection = false
                            )
                        )
                        coroutineScope.launch {
                            snackbarHostState.showSnackbar("Consultation booked with ${doctor.name}")
                        }
                    }
                )
            }

            composable(Screen.Pharmacy.route) {
                PharmacyScreen(
                    onAddToCart = { medicine, isGeneric ->
                        val (title, price, origPrice) = if (isGeneric && medicine.genericAlternative != null) {
                            Triple(medicine.genericAlternative.name, medicine.genericAlternative.discountedPrice, medicine.genericAlternative.mrp)
                        } else {
                            Triple(medicine.name, medicine.price, medicine.mrp)
                        }
                        cartItems.add(
                            CartItem(
                                id = "cart_med_${System.currentTimeMillis()}",
                                title = title,
                                subtitle = medicine.packSize,
                                providerName = if (isGeneric) "MedMarg Generics" else medicine.manufacturer,
                                price = price,
                                originalPrice = origPrice,
                                serviceType = ServiceType.PHARMACY,
                                isHomeCollection = true
                            )
                        )
                        coroutineScope.launch {
                            snackbarHostState.showSnackbar("Added $title to Cart")
                        }
                    }
                )
            }

            composable(Screen.HealthLocker.route) {
                HealthLockerScreen()
            }

            composable(Screen.Insurance.route) {
                InsuranceScreen()
            }

            composable(Screen.Booking.route) {
                BookingScreen(
                    cartItems = cartItems,
                    onRemoveItem = { cartItems.remove(it) },
                    onConfirmBooking = {
                        cartItems.clear()
                        coroutineScope.launch {
                            snackbarHostState.showSnackbar("🎉 Booking Confirmed! Phlebotomist/Appointment details sent via SMS & WhatsApp.")
                        }
                        navController.navigate(Screen.Home.route)
                    }
                )
            }
        }
    }
}
