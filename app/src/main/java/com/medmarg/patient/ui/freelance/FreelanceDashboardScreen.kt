package com.medmarg.patient.ui.freelance

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.Slate50

// =========================================================================
// ⚡ FREELANCE AGENT DASHBOARD CONTAINER (ROOT FREELANCE VIEW)
// Replicated 1-on-1 with iOS FreelanceDashboardView.swift
// Routes:
// Tab 0: Freelance Home Dashboard
// Tab 7: Available Gigs & Active Orders
// Tab 1: Consumables & Tube Inventory
// Tab 3: Wallet & Instant Payouts
// Tab 4: Freelance Profile & Verification
// =========================================================================

@Composable
fun FreelanceDashboardScreen(
    user: UserProfile,
    onLogout: () -> Unit,
    selectedTab: Int,
    onTabSelected: (Int) -> Unit,
    onOpenSidebar: () -> Unit,
    onOpenNotifications: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize().background(Slate50)) {
        when (selectedTab) {
            0 -> FreelanceHomeDashboardScreen(
                user = user,
                onLogout = onLogout,
                selectedTab = selectedTab,
                onTabSelected = onTabSelected,
                onOpenSidebar = onOpenSidebar,
                onOpenNotifications = onOpenNotifications
            )
            7 -> FreelanceOrdersScreen(
                user = user,
                onTabSelected = onTabSelected
            )
            1 -> FreelanceInventoryScreen(
                user = user
            )
            3 -> FreelanceWalletPayoutScreen(
                user = user
            )
            4 -> FreelanceProfileScreen(
                user = user,
                onLogout = onLogout
            )
            else -> FreelanceHomeDashboardScreen(
                user = user,
                onLogout = onLogout,
                selectedTab = selectedTab,
                onTabSelected = onTabSelected,
                onOpenSidebar = onOpenSidebar,
                onOpenNotifications = onOpenNotifications
            )
        }
    }
}

