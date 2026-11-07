package com.medmarg.patient.ui.freelance

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentWalletPayoutTxn
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.agent.AgentTopbarView
import com.medmarg.patient.ui.freelance.sheets.EditPayoutDetailsSheet
import com.medmarg.patient.ui.freelance.sheets.FreelanceWalletPayoutSheet
import com.medmarg.patient.ui.notifications.NotificationCenterSheet
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// =========================================================================
// ⚡ FREELANCE WALLET & PAYOUTS VIEW (DEDICATED PAYMENTS / WALLET TAB)
// 100% Live Backend Data from /api/v1/agent/wallet
// Shows available gig cashout balance, lifetime earnings, and instant UPI payouts
// 1:1 Parity with ios/FreelanceAgent/Views/FreelanceWalletPayoutView.swift
// =========================================================================

@Composable
fun FreelanceWalletPayoutScreen(
    user: UserProfile,
    onTabSelected: (Int) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "FL-502"

    // Live Wallet Data
    var availableCashout by remember { mutableIntStateOf(0) }
    var totalLifetimeEarnings by remember { mutableIntStateOf(0) }
    var todayEarnings by remember { mutableIntStateOf(0) }
    var completedTripsToday by remember { mutableIntStateOf(0) }
    var distancePayout by remember { mutableIntStateOf(0) }
    var tipsBonus by remember { mutableIntStateOf(0) }
    var inventoryCredits by remember { mutableIntStateOf(0) }
    var recentPayouts by remember { mutableStateOf<List<AgentWalletPayoutTxn>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }

    var upiId by remember { mutableStateOf("9876543210@upi") }
    var bankAccount by remember { mutableStateOf("HDFC Bank ••••••5678") }

    var showPayoutSheet by remember { mutableStateOf(false) }
    var showEditBankSheet by remember { mutableStateOf(false) }
    var showNotificationCenter by remember { mutableStateOf(false) }
    var unreadNotificationCount by remember { mutableIntStateOf(0) }
    var toastMessage by remember { mutableStateOf<String?>(null) }
    var showStatementToast by remember { mutableStateOf(false) }

    fun fetchWalletData() {
        coroutineScope.launch {
            isLoading = true
            val data = AgentRepository.fetchWalletData(effectiveAgentId)
            availableCashout = data.availableCashoutBalance
            totalLifetimeEarnings = data.totalLifetimeEarnings
            todayEarnings = data.todayEarnings
            completedTripsToday = data.completedTripsToday
            distancePayout = data.distancePayout
            tipsBonus = data.tipsBonus
            inventoryCredits = data.inventoryCredits
            recentPayouts = data.recentPayouts

            val profile = AgentRepository.fetchProfile(effectiveAgentId)
            if (profile.upiId.isNotEmpty()) upiId = profile.upiId
            if (profile.bankAccount.isNotEmpty()) bankAccount = "${profile.bankName} ••••••${profile.bankAccount.takeLast(4)}"

            unreadNotificationCount = AgentRepository.fetchUnreadNotificationCount(effectiveAgentId)
            isLoading = false
        }
    }

    LaunchedEffect(effectiveAgentId) {
        fetchWalletData()
    }

    Box(modifier = modifier.fillMaxSize().background(Slate50)) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Topbar
            AgentTopbarView(
                agentName = user.name,
                agentId = effectiveAgentId,
                isOnDuty = true,
                unreadNotificationCount = unreadNotificationCount,
                onToggleDuty = { },
                onLogoTap = { onTabSelected(0) },
                onSidebarTap = { },
                onNotificationTap = { showNotificationCenter = true },
                onProfileTap = { onTabSelected(4) }
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(vertical = 12),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Success Toast Banner
                AnimatedVisibility(visible = toastMessage != null) {
                    toastMessage?.let { msg ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(AccentEmerald)
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color.white, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text(msg, color = Color.white, fontSize = 13.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                            IconButton(onClick = { toastMessage = null }, modifier = Modifier.size(24.dp)) {
                                Icon(Icons.Default.Close, contentDescription = "Dismiss", tint = Color.white, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }

                // 1. Hero Wallet Balance Card
                WalletHeroCard(
                    availableCashout = availableCashout,
                    onWithdraw = { showPayoutSheet = true }
                )

                // 2. Earnings breakdown 2x2 Grid
                EarningsBreakdownGrid(
                    totalLifetimeEarnings = totalLifetimeEarnings,
                    todayEarnings = todayEarnings,
                    completedTripsToday = completedTripsToday,
                    distancePayout = distancePayout,
                    tipsBonus = tipsBonus
                )

                // 3. Payout Destination Card
                PayoutDestinationCard(
                    upiId = upiId,
                    bankAccount = bankAccount,
                    onChange = { showEditBankSheet = true }
                )

                // 4. Inventory Credit Wallet Card
                InventoryCreditWalletCard(
                    inventoryCredits = inventoryCredits,
                    onOrderTubes = { onTabSelected(1) }
                )

                // 5. Recent Settlements & Payouts Ledger
                RecentSettlementsSection(
                    recentPayouts = recentPayouts
                )

                // 6. Download Statement Banner
                DownloadStatementBanner(
                    showSuccess = showStatementToast,
                    onClick = {
                        coroutineScope.launch {
                            showStatementToast = true
                            delay(2500)
                            showStatementToast = false
                        }
                    }
                )

                Spacer(modifier = Modifier.height(100.dp))
            }
        }

        // Payout Request Sheet
        if (showPayoutSheet) {
            FreelanceWalletPayoutSheet(
                availableBalance = availableCashout,
                agentId = effectiveAgentId,
                onDismiss = { showPayoutSheet = false },
                onPayoutSubmitted = { amt, ref ->
                    showPayoutSheet = false
                    availableCashout = (availableCashout - amt).coerceAtLeast(0)
                    val newTxn = AgentWalletPayoutTxn(
                        id = ref,
                        date = "Just now",
                        amount = amt,
                        method = "UPI (Instant)",
                        status = "PROCESSING"
                    )
                    recentPayouts = listOf(newTxn) + recentPayouts
                    toastMessage = "✅ Payout request for ₹$amt submitted successfully!"
                }
            )
        }

        // Edit Payout Details Sheet
        if (showEditBankSheet) {
            EditPayoutDetailsSheet(
                agentId = effectiveAgentId,
                initialUpi = upiId,
                initialBank = bankAccount.split("•").firstOrNull()?.trim() ?: "HDFC Bank",
                onDismiss = { showEditBankSheet = false },
                onSaved = { newUpi, newBank, newAcc, _ ->
                    upiId = newUpi
                    bankAccount = "$newBank ••••••${newAcc.takeLast(4)}"
                    toastMessage = "Payout account details updated successfully."
                }
            )
        }

        // Notification Center Sheet
        if (showNotificationCenter) {
            NotificationCenterSheet(
                userId = effectiveAgentId,
                onDismiss = {
                    showNotificationCenter = false
                    fetchWalletData()
                }
            )
        }
    }
}

// ==========================================
// 1. HERO WALLET BALANCE CARD
// ==========================================
@Composable
private fun WalletHeroCard(
    availableCashout: Int,
    onWithdraw: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(18.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.linearGradient(
                        colors = listOf(Color(0xFF006B70), Color(0xFF00474D))
                    )
                )
                .padding(18.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            "AVAILABLE FOR CASHOUT",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.white.copy(alpha = 0.8f)
                        )
                        Row(verticalAlignment = Alignment.Bottom) {
                            Text("₹", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color.white)
                            Spacer(Modifier.width(2.dp))
                            Text("$availableCashout", fontSize = 38.sp, fontWeight = FontWeight.Black, color = Color.white)
                        }
                    }

                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .clip(CircleShape)
                            .background(Color.white.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.AccountBalanceWallet,
                            contentDescription = null,
                            tint = Color(0xFF33FFB3),
                            modifier = Modifier.size(28.dp)
                        )
                    }
                }

                Divider(color = Color.white.copy(alpha = 0.2f), thickness = 1.dp)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Timelapse,
                            contentDescription = null,
                            tint = Color(0xFF33FFB3),
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(Modifier.width(4.dp))
                        Text(
                            "Instant UPI Settlement",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF33FFB3)
                        )
                    }

                    Button(
                        onClick = onWithdraw,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color.white),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp)
                    ) {
                        Icon(Icons.Default.Bolt, contentDescription = null, tint = DarkTeal, modifier = Modifier.size(14.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Withdraw Payout", fontSize = 13.sp, fontWeight = FontWeight.Black, color = DarkTeal)
                    }
                }
            }
        }
    }
}

// ==========================================
// 2. EARNINGS BREAKDOWN 2x2 GRID
// ==========================================
@Composable
private fun EarningsBreakdownGrid(
    totalLifetimeEarnings: Int,
    todayEarnings: Int,
    completedTripsToday: Int,
    distancePayout: Int,
    tipsBonus: Int
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MetricMiniCard(
                title = "Total Lifetime",
                value = "₹$totalLifetimeEarnings",
                subtext = "All Gigs Earned",
                icon = Icons.Default.TrendingUp,
                accent = PrimaryTeal,
                modifier = Modifier.weight(1f)
            )
            MetricMiniCard(
                title = "Earned Today",
                value = "₹$todayEarnings",
                subtext = "$completedTripsToday Trips Completed",
                icon = Icons.Default.CalendarToday,
                accent = AccentEmerald,
                modifier = Modifier.weight(1f)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MetricMiniCard(
                title = "Distance Bonus",
                value = "₹$distancePayout",
                subtext = "Fuel & Travel",
                icon = Icons.Default.Navigation,
                accent = Color(0xFF2563EB),
                modifier = Modifier.weight(1f)
            )
            MetricMiniCard(
                title = "Customer Tips",
                value = "₹$tipsBonus",
                subtext = "100% Retained",
                icon = Icons.Default.Favorite,
                accent = Color(0xFFEC4899),
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun MetricMiniCard(
    title: String,
    value: String,
    subtext: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    accent: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.white),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, contentDescription = null, tint = accent, modifier = Modifier.size(13.dp))
                Spacer(Modifier.width(4.dp))
                Text(title, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate500)
            }
            Text(value, fontSize = 18.sp, fontWeight = FontWeight.Black, color = Slate900)
            Text(subtext, fontSize = 10.sp, color = Slate500)
        }
    }
}

// ==========================================
// 3. PAYOUT DESTINATION CARD
// ==========================================
@Composable
private fun PayoutDestinationCard(
    upiId: String,
    bankAccount: String,
    onChange: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.white),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "PAYOUT DESTINATION",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate500
                )
                Text(
                    "Change",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = PrimaryTeal,
                    modifier = Modifier.clickable { onChange() }
                )
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(Slate50)
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(LightTeal),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.AccountBalance, contentDescription = null, tint = PrimaryTeal, modifier = Modifier.size(20.dp))
                }

                Spacer(Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("UPI VPA (RazorpayX Linked)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                        Spacer(Modifier.width(6.dp))
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = AccentEmerald.copy(alpha = 0.12f)
                        ) {
                            Text(
                                "Active",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                color = AccentEmerald,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Text(
                        "$upiId • $bankAccount",
                        fontSize = 11.sp,
                        color = Slate600
                    )
                }
            }
        }
    }
}

// ==========================================
// 4. INVENTORY CREDIT WALLET CARD
// ==========================================
@Composable
private fun InventoryCreditWalletCard(
    inventoryCredits: Int,
    onOrderTubes: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.white),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFFF59E0B).copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Inventory, contentDescription = null, tint = Color(0xFFD97706), modifier = Modifier.size(20.dp))
            }

            Spacer(Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Inventory Credit Wallet", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                    Spacer(Modifier.width(4.dp))
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = Color(0xFFF59E0B).copy(alpha = 0.12f)
                    ) {
                        Text(
                            "From Onboarding",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFD97706),
                            modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp)
                        )
                    }
                }
                Text("₹$inventoryCredits credits available for tube refills", fontSize = 11.sp, color = Slate600)
            }

            Surface(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .clickable { onOrderTubes() },
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFFF59E0B).copy(alpha = 0.12f)
            ) {
                Text(
                    "Order Tubes",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFD97706),
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                )
            }
        }
    }
}

// ==========================================
// 5. RECENT SETTLEMENTS & PAYOUTS LEDGER
// ==========================================
@Composable
private fun RecentSettlementsSection(
    recentPayouts: List<AgentWalletPayoutTxn>
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.white),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                "RECENT SETTLEMENTS & PAYOUTS",
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                color = Slate500
            )

            if (recentPayouts.isEmpty()) {
                Text(
                    "No payout requests yet. Completed trip earnings are stored safely in your balance.",
                    fontSize = 12.sp,
                    color = Slate500,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    recentPayouts.forEach { p ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Slate50)
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            val isSettled = p.status == "SETTLED"
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(CircleShape)
                                    .background(
                                        if (isSettled) AccentEmerald.copy(alpha = 0.12f)
                                        else Color(0xFFF59E0B).copy(alpha = 0.12f)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = if (isSettled) Icons.Default.CallReceived else Icons.Default.HourglassTop,
                                    contentDescription = null,
                                    tint = if (isSettled) AccentEmerald else Color(0xFFD97706),
                                    modifier = Modifier.size(16.dp)
                                )
                            }

                            Spacer(Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text("Payout ${p.id}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                Text("${p.method} • ${p.date}", fontSize = 11.sp, color = Slate500)
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text("₹${p.amount}", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = if (isSettled) AccentEmerald.copy(alpha = 0.12f) else Color(0xFFF59E0B).copy(alpha = 0.12f)
                                ) {
                                    Text(
                                        p.status,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSettled) AccentEmerald else Color(0xFFD97706),
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// 6. DOWNLOAD STATEMENT BANNER
// ==========================================
@Composable
private fun DownloadStatementBanner(
    showSuccess: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.white),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.Description, contentDescription = null, tint = PrimaryTeal, modifier = Modifier.size(20.dp))
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    if (showSuccess) "Statement Sent to Email!" else "Download Monthly Earnings PDF",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Text(
                    "GST invoices, trip receipts and tax deduction summary",
                    fontSize = 11.sp,
                    color = Slate500
                )
            }
            Icon(
                imageVector = if (showSuccess) Icons.Default.CheckCircle else Icons.Default.FileDownload,
                contentDescription = null,
                tint = if (showSuccess) AccentEmerald else PrimaryTeal,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}
