package com.medmarg.patient.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val selectedIcon: ImageVector, val unselectedIcon: ImageVector) {
    data object Home : Screen("home", "Home", Icons.Filled.Home, Icons.Outlined.Home)
    data object Diagnostics : Screen("diagnostics", "Labs & Tests", Icons.Filled.Science, Icons.Outlined.Science)
    data object Scans : Screen("scans", "MRI & Scans", Icons.Filled.CameraAlt, Icons.Outlined.CameraAlt)
    data object Doctors : Screen("doctors", "Doctors", Icons.Filled.VideoCall, Icons.Outlined.VideoCall)
    data object Pharmacy : Screen("pharmacy", "Pharmacy", Icons.Filled.Medication, Icons.Outlined.Medication)
    data object HealthLocker : Screen("health_locker", "Records", Icons.Filled.FolderShared, Icons.Outlined.FolderShared)
    data object Insurance : Screen("insurance", "Insurance", Icons.Filled.HealthAndSafety, Icons.Outlined.HealthAndSafety)
    data object Booking : Screen("booking", "Cart", Icons.Filled.ShoppingCart, Icons.Outlined.ShoppingCart)
}

val bottomNavScreens = listOf(
    Screen.Home,
    Screen.Diagnostics,
    Screen.Scans,
    Screen.Pharmacy,
    Screen.HealthLocker
)
