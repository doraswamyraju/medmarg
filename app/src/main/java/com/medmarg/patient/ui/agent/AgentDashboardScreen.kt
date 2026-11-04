package com.medmarg.patient.ui.agent

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

// =========================================================================
// 🛵 SALARIED COLLECTION AGENT DASHBOARD SHELL
// 1-on-1 replication of iOS Salaried Agent Navigation & Tab Architecture:
// Tab 0 -> AgentHomeDashboardScreen (Home)
// Tab 7 -> AgentOrdersScreen (Orders)
// Tab 1 -> AgentInventoryScreen (Inventory)
// Tab 2 -> AgentTrackNavigateScreen (Track & Navigate)
// Tab 3 -> AgentPaymentsScreen (Payments)
// Tab 4 -> AgentProfileScreen (Profile & Quota)
// Tab 8 -> AgentLabHandoverScreen (Lab Handover)
// Tab 9 -> AgentChangePasswordScreen (Change Password)
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
    val coroutineScope = rememberCoroutineScope()
    var selectedOrderForDetail by remember { mutableStateOf<AgentPickupOrder?>(null) }
    var collectedOrdersForHandover by remember { mutableStateOf<List<AgentPickupOrder>>(emptyList()) }

    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "AG-01"

    LaunchedEffect(selectedTab) {
        if (selectedTab == 8) {
            val roster = AgentRepository.fetchRoster(effectiveAgentId)
            collectedOrdersForHandover = roster.filter { it.status == "SAMPLE_COLLECTED" }
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        when (selectedTab) {
            0 -> AgentHomeDashboardScreen(
                user = user,
                onLogout = onLogout,
                selectedTab = selectedTab,
                onTabSelected = onTabSelected,
                onOpenSidebar = onOpenSidebar,
                onOpenNotifications = onOpenNotifications,
                onOpenOrderDetail = { ord -> selectedOrderForDetail = ord }
            )
            7 -> AgentOrdersScreen(
                user = user,
                onTabSelected = onTabSelected,
                onOpenSidebar = onOpenSidebar,
                onOpenNotifications = onOpenNotifications
            )
            1 -> AgentInventoryScreen(
                user = user,
                onTabSelected = onTabSelected,
                onOpenSidebar = onOpenSidebar,
                onOpenNotifications = onOpenNotifications
            )
            2 -> AgentTrackNavigateScreen(
                user = user,
                onTabSelected = onTabSelected,
                onOpenSidebar = onOpenSidebar,
                onOpenNotifications = onOpenNotifications,
                onOpenOrderDetail = { ord -> selectedOrderForDetail = ord }
            )
            3 -> AgentPaymentsScreen(
                user = user,
                onTabSelected = onTabSelected,
                onOpenSidebar = onOpenSidebar,
                onOpenNotifications = onOpenNotifications
            )
            4 -> AgentProfileScreen(
                user = user,
                onLogout = onLogout,
                onTabSelected = onTabSelected,
                onOpenSidebar = onOpenSidebar,
                onOpenNotifications = onOpenNotifications
            )
            8 -> AgentLabHandoverScreen(
                agentId = effectiveAgentId,
                agentName = user.name,
                collectedOrders = collectedOrdersForHandover,
                onDismiss = { onTabSelected(0) },
                onHandoverSuccess = {
                    coroutineScope.launch {
                        val roster = AgentRepository.fetchRoster(effectiveAgentId)
                        collectedOrdersForHandover = roster.filter { it.status == "SAMPLE_COLLECTED" }
                    }
                }
            )
            9 -> AgentChangePasswordScreen(
                user = user,
                onBack = { onTabSelected(4) }
            )
            else -> AgentHomeDashboardScreen(
                user = user,
                onLogout = onLogout,
                selectedTab = selectedTab,
                onTabSelected = onTabSelected,
                onOpenSidebar = onOpenSidebar,
                onOpenNotifications = onOpenNotifications,
                onOpenOrderDetail = { ord -> selectedOrderForDetail = ord }
            )
        }

        selectedOrderForDetail?.let { ord ->
            AgentOrderDetailScreen(
                initialOrder = ord,
                agentId = effectiveAgentId,
                onBack = { selectedOrderForDetail = null },
                onOrderUpdated = {}
            )
        }
    }
}
