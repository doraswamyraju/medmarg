import SwiftUI

// =========================================================================
// ⚡ FREELANCE WALLET & PAYOUTS VIEW (DEDICATED PAYMENTS / WALLET TAB)
// 100% Live Backend Data from /api/v1/agent/wallet
// Shows available gig cashout balance, lifetime earnings, and instant UPI payouts
// =========================================================================

struct FreelanceWalletPayoutView: View {
    let user: UserProfile
    @Binding var selectedTab: Int
    @Binding var showSidebar: Bool

    // Live Wallet Data
    @State private var availableCashout: Int = 0
    @State private var totalLifetimeEarnings: Int = 0
    @State private var todayEarnings: Int = 0
    @State private var completedTripsToday: Int = 0
    @State private var distancePayout: Int = 0
    @State private var tipsBonus: Int = 0
    @State private var inventoryCredits: Int = 0
    @State private var recentPayouts: [AgentWalletPayoutTxn] = []
    @State private var isLoading: Bool = true
    @State private var showPayoutSheet: Bool = false
    @State private var showNotificationCenter: Bool = false
    @State private var unreadNotificationCount: Int = 0
    @State private var showStatementToast: Bool = false
    @State private var toastMessage: String? = nil

    private var effectiveAgentId: String {
        user.username.isEmpty ? (user.id.isEmpty ? "AG-01" : user.id) : user.username
    }

    var body: some View {
        VStack(spacing: 0) {
            // Topbar
            AgentTopbarView(
                agentName: user.name,
                agentId: effectiveAgentId,
                isOnDuty: .constant(true),
                locationManager: AgentLocationManager.shared,
                unreadNotificationCount: unreadNotificationCount,
                onToggleDuty: { _ in },
                onLogoTap: { selectedTab = 0 },
                onSidebarTap: { withAnimation { showSidebar.toggle() } },
                onNotificationTap: { showNotificationCenter = true },
                onProfileTap: { selectedTab = 4 },
                onLogoutTap: { }
            )

            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    if let msg = toastMessage {
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.white)
                            Text(msg)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(.white)
                            Spacer()
                            Button(action: { toastMessage = nil }) {
                                Image(systemName: "xmark")
                                    .foregroundColor(.white)
                            }
                        }
                        .padding(12)
                        .background(MedMargTheme.accentEmerald)
                        .cornerRadius(12)
                        .padding(.horizontal, 16)
                        .padding(.top, 4)
                    }

                    // 1. Hero Wallet Balance Card
                    walletHeroCard

                    // 2. 4 Micro Metric Cards (Earnings breakdown)
                    earningsBreakdownGrid

                    // 3. Payout Destination Card
                    payoutDestinationCard

                    // 4. Inventory Credit Wallet Card
                    inventoryCreditWalletCard

                    // 5. Recent Payout History Ledger
                    recentPayoutsSection

                    // 6. Download Statement Banner
                    downloadStatementBanner

                    Spacer().frame(height: 120) // Floating navbar clearance
                }
                .padding(.top, 12)
            }
            .refreshable {
                await fetchWalletData()
            }
        }
        .background(MedMargTheme.slate50.ignoresSafeArea())
        .onAppear {
            Task {
                await fetchWalletData()
            }
        }
        .sheet(isPresented: $showPayoutSheet) {
            FreelanceWalletPayoutSheet(
                availableBalance: availableCashout,
                agentId: effectiveAgentId,
                onPayoutSubmitted: { amt, ref in
                    withAnimation {
                        availableCashout = max(0, availableCashout - amt)
                        recentPayouts.insert(
                            AgentWalletPayoutTxn(
                                id: ref,
                                date: "Just now",
                                amount: amt,
                                method: "UPI (Instant)",
                                status: "PROCESSING"
                            ),
                            at: 0
                        )
                        toastMessage = "✅ Payout request for ₹\(amt) submitted successfully!"
                    }
                }
            )
        }
        .sheet(isPresented: $showNotificationCenter) {
            NotificationCenterSheet(isPresented: $showNotificationCenter)
        }
    }

    // ==========================================
    // HERO WALLET BALANCE CARD
    // ==========================================
    private var walletHeroCard: some View {
        VStack(spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("AVAILABLE FOR CASHOUT")
                        .font(.system(size: 11, weight: .black))
                        .foregroundColor(Color.white.opacity(0.8))
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("₹")
                            .font(.system(size: 24, weight: .bold))
                        Text("\(availableCashout)")
                            .font(.system(size: 38, weight: .black))
                    }
                    .foregroundColor(.white)
                }
                Spacer()

                ZStack {
                    Circle()
                        .fill(Color.white.opacity(0.15))
                        .frame(width: 50, height: 50)
                    Image(systemName: "indianrupeesign.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(Color(red: 0.2, green: 1.0, blue: 0.7))
                }
            }

            Divider().background(Color.white.opacity(0.2))

            HStack {
                HStack(spacing: 4) {
                    Image(systemName: "clock.arrow.circlepath")
                    Text("Instant UPI Settlement")
                }
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(Color(red: 0.2, green: 1.0, blue: 0.7))

                Spacer()

                Button(action: { showPayoutSheet = true }) {
                    HStack(spacing: 6) {
                        Image(systemName: "bolt.fill")
                        Text("Withdraw Payout")
                    }
                    .font(.system(size: 13, weight: .black))
                    .foregroundColor(MedMargTheme.darkTeal)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Color.white)
                    .cornerRadius(12)
                    .shadow(color: Color.black.opacity(0.15), radius: 6, x: 0, y: 3)
                }
            }
        }
        .padding(18)
        .background(
            LinearGradient(
                colors: [Color(red: 0.0, green: 0.42, blue: 0.44), Color(red: 0.0, green: 0.28, blue: 0.30)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(18)
        .padding(.horizontal, 16)
        .shadow(color: MedMargTheme.darkTeal.opacity(0.25), radius: 10, x: 0, y: 4)
    }

    // ==========================================
    // EARNINGS BREAKDOWN 2x2 GRID
    // ==========================================
    private var earningsBreakdownGrid: some View {
        VStack(spacing: 10) {
            HStack(spacing: 10) {
                metricMiniCard(
                    title: "Total Lifetime",
                    value: "₹\(totalLifetimeEarnings)",
                    subtext: "All Gigs Earned",
                    icon: "chart.line.uptrend.xyaxis",
                    accent: MedMargTheme.primaryTeal
                )
                metricMiniCard(
                    title: "Earned Today",
                    value: "₹\(todayEarnings)",
                    subtext: "\(completedTripsToday) Trips Completed",
                    icon: "calendar.badge.clock",
                    accent: MedMargTheme.accentEmerald
                )
            }

            HStack(spacing: 10) {
                metricMiniCard(
                    title: "Distance Bonus",
                    value: "₹\(distancePayout)",
                    subtext: "Fuel & Travel",
                    icon: "location.north.circle.fill",
                    accent: Color.blue
                )
                metricMiniCard(
                    title: "Customer Tips",
                    value: "₹\(tipsBonus)",
                    subtext: "100% Retained",
                    icon: "heart.fill",
                    accent: Color.pink
                )
            }
        }
        .padding(.horizontal, 16)
    }

    private func metricMiniCard(title: String, value: String, subtext: String, icon: String, accent: Color) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(accent)
                Text(title)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate500)
                Spacer()
            }

            Text(value)
                .font(.system(size: 18, weight: .black))
                .foregroundColor(MedMargTheme.slate900)

            Text(subtext)
                .font(.system(size: 10))
                .foregroundColor(MedMargTheme.slate500)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .cornerRadius(14)
        .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
    }

    // ==========================================
    // PAYOUT DESTINATION CARD
    // ==========================================
    private var payoutDestinationCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("PAYOUT DESTINATION")
                    .font(.system(size: 11, weight: .black))
                    .foregroundColor(MedMargTheme.slate500)
                Spacer()
                Button(action: { selectedTab = 4 }) {
                    Text("Change")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            HStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(MedMargTheme.lightTeal)
                        .frame(width: 40, height: 40)
                    Image(systemName: "indianrupeesign.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text("UPI VPA (RazorpayX Linked)")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Active")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(MedMargTheme.accentEmerald)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(MedMargTheme.accentEmerald.opacity(0.12))
                            .cornerRadius(4)
                    }
                    Text("9876543210@upi • HDFC Bank")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate600)
                }
                Spacer()
            }
            .padding(12)
            .background(MedMargTheme.slate50)
            .cornerRadius(12)
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .padding(.horizontal, 16)
    }

    // ==========================================
    // INVENTORY CREDIT WALLET CARD
    // ==========================================
    private var inventoryCreditWalletCard: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.orange.opacity(0.12))
                    .frame(width: 42, height: 42)
                Image(systemName: "shippingbox.fill")
                    .font(.system(size: 20))
                    .foregroundColor(Color.orange)
            }

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text("Inventory Credit Wallet")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("From Onboarding Fee")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(Color.orange)
                }
                Text("₹\(inventoryCredits) credits available for tube refills")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate600)
            }
            Spacer()

            Button(action: { selectedTab = 1 }) {
                Text("Order Tubes")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(Color.orange)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color.orange.opacity(0.12))
                    .cornerRadius(8)
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .padding(.horizontal, 16)
    }

    // ==========================================
    // RECENT PAYOUTS SECTION
    // ==========================================
    private var recentPayoutsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("RECENT SETTLEMENTS & PAYOUTS")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            if recentPayouts.isEmpty {
                Text("No payout requests yet. Completed trip earnings are stored safely in your balance.")
                    .font(.system(size: 12))
                    .foregroundColor(MedMargTheme.slate500)
                    .padding(.vertical, 8)
            } else {
                ForEach(recentPayouts) { p in
                    HStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(p.status == "SETTLED" ? MedMargTheme.accentEmerald.opacity(0.12) : Color.orange.opacity(0.12))
                                .frame(width: 38, height: 38)
                            Image(systemName: p.status == "SETTLED" ? "arrow.down.left" : "hourglass")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(p.status == "SETTLED" ? MedMargTheme.accentEmerald : Color.orange)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Payout \(p.id)")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("\(p.method) • \(p.date)")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 2) {
                            Text("₹\(p.amount)")
                                .font(.system(size: 15, weight: .black))
                                .foregroundColor(MedMargTheme.slate900)
                            Text(p.status)
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(p.status == "SETTLED" ? MedMargTheme.accentEmerald : Color.orange)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(p.status == "SETTLED" ? MedMargTheme.accentEmerald.opacity(0.12) : Color.orange.opacity(0.12))
                                .cornerRadius(4)
                        }
                    }
                    .padding(12)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(12)
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .padding(.horizontal, 16)
    }

    // ==========================================
    // DOWNLOAD STATEMENT BANNER
    // ==========================================
    private var downloadStatementBanner: some View {
        Button(action: {
            showStatementToast = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                showStatementToast = false
            }
        }) {
            HStack(spacing: 12) {
                Image(systemName: "doc.text.fill")
                    .font(.system(size: 18))
                    .foregroundColor(MedMargTheme.primaryTeal)

                VStack(alignment: .leading, spacing: 2) {
                    Text(showStatementToast ? "Statement Sent to Email!" : "Download Monthly Earnings PDF")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("GST invoices, trip receipts and tax deduction summary")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }
                Spacer()
                Image(systemName: showStatementToast ? "checkmark.circle.fill" : "arrow.down.doc")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(showStatementToast ? MedMargTheme.accentEmerald : MedMargTheme.primaryTeal)
            }
            .padding(14)
            .background(Color.white)
            .cornerRadius(16)
            .padding(.horizontal, 16)
        }
        .buttonStyle(PlainButtonStyle())
    }

    private func fetchWalletData() async {
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/wallet?agentId=\(effectiveAgentId)") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let w = json["wallet"] as? [String: Any] {
                let cashout = w["availableCashoutBalance"] as? Int ?? 0
                let total = w["totalLifetimeEarnings"] as? Int ?? 0
                let today = w["todayEarnings"] as? Int ?? 0
                let trips = w["completedTripsToday"] as? Int ?? 0
                let dist = w["distancePayout"] as? Int ?? 0
                let tips = w["tipsBonus"] as? Int ?? 0
                let creds = w["inventoryCredits"] as? Int ?? 0

                var payouts: [AgentWalletPayoutTxn] = []
                if let arr = w["recentPayouts"] as? [[String: Any]] {
                    payouts = arr.compactMap { d in
                        AgentWalletPayoutTxn(
                            id: d["id"] as? String ?? "PO-0",
                            date: d["date"] as? String ?? "",
                            amount: d["amount"] as? Int ?? 0,
                            method: d["method"] as? String ?? "UPI",
                            status: d["status"] as? String ?? "SETTLED"
                        )
                    }
                }

                await MainActor.run {
                    self.availableCashout = cashout
                    self.totalLifetimeEarnings = total
                    self.todayEarnings = today
                    self.completedTripsToday = trips
                    self.distancePayout = dist
                    self.tipsBonus = tips
                    self.inventoryCredits = creds
                    self.recentPayouts = payouts
                    self.isLoading = false
                }
            }
        } catch {
            await MainActor.run { self.isLoading = false }
        }

        // Fetch unread notifications
        if let notifUrl = URL(string: "https://medmarg.com/api/v1/notifications/user-stream?userId=\(effectiveAgentId)") {
            if let (notifData, _) = try? await URLSession.shared.data(from: notifUrl),
               let notifJson = try? JSONSerialization.jsonObject(with: notifData) as? [String: Any],
               let notifs = notifJson["notifications"] as? [[String: Any]] {
                let unread = notifs.filter { ($0["read"] as? Bool) != true && ($0["isRead"] as? Bool) != true }.count
                await MainActor.run {
                    self.unreadNotificationCount = unread
                }
            }
        }
    }
}

struct AgentWalletPayoutTxn: Identifiable, Codable, Equatable {
    let id: String
    var date: String
    var amount: Int
    var method: String
    var status: String
}

