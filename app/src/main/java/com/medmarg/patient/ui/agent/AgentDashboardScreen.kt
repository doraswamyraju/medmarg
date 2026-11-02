package com.medmarg.patient.ui.agent

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.Slate50

// =========================================================================
// 🚀 DEDICATED AGENT DASHBOARD CONTAINER (SALARIED FLEET PHLEBOTOMIST)
// Replicated 1-on-1 with iOS AgentDashboardView.swift
// Routes:
// Tab 0: Home Dashboard
// Tab 7: Orders & Pickups
// Tab 1: Cold Bag & Consumables Inventory
// Tab 3: Payments & Collections Ledger
// Tab 4: Profile & Quota Settings
// =========================================================================

@Composable
fun AgentDashboardScreen(
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
            0 -> AgentHomeDashboardScreen(
                user = user,
                onLogout = onLogout,
                selectedTab = selectedTab,
                onTabSelected = onTabSelected,
                onOpenSidebar = onOpenSidebar,
                onOpenNotifications = onOpenNotifications
            )
            7 -> AgentOrdersScreen(
                user = user,
                onTabSelected = onTabSelected
            )
            1 -> AgentInventoryScreen(
                user = user
            )
            3 -> AgentPaymentsScreen(
                user = user,
                onTabSelected = onTabSelected
            )
            4 -> AgentProfileScreen(
                user = user,
                onLogout = onLogout
            )
            else -> AgentHomeDashboardScreen(
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

