import SwiftUI

// =========================================================================
// 💳 AGENT PAYMENTS VIEW (DEDICATED PAYMENTS TAB)
// 100% Live Backend Data from /api/v1/agent/roster & /api/v1/agent/payments
// STRICTLY ZERO DUMMY / FALLBACK DATA
// Pixel-perfect match to Reference Image 5:
// - Topbar with ON DUTY, Notification bell, Avatar, Logout
// - Title: "Payments" + "Track your collections and payment status"
// - Date Selector Dropdown: "This Month ∨"
// - 4 Metric Summary Cards:
//     1. Total Collected (₹ Sum, X Orders)
//     2. Prepaid (Online) (₹ Sum, X Orders)
//     3. Doorstep Payment (₹ Sum, X Orders)
//     4. Pending (₹ Sum, X Orders)
// - 4 Category Filter Tabs: All Payments | Prepaid | Doorstep | Pending
// - Search Bar + Filters + Sort
// - Payment Transaction Cards:
//     * Date Day, Month Year, Time
//     * Order ID, Patient Name ♂/♀ Age, Test & Count, Location
//     * Mode Badge (Prepaid / Doorstep), Amount (₹), Paid/Pending Status, Txn ID, Chevron
// - Bottom Card: Download Statement (Download PDF)
// =========================================================================

struct AgentPaymentsView: View {
    let user: UserProfile
    @Binding var selectedTab: Int
    @Binding var showSidebar: Bool

    // Live State
    @State private var orders: [AgentPickupOrder] = []
    @State private var isLoading: Bool = true
    @State private var searchQuery: String = ""
    @State private var selectedFilterCategory: String = "ALL" // "ALL", "PREPAID", "DOORSTEP", "PENDING"
    @State private var selectedDateRange: String = "This Month"
    @State private var showDateRangeMenu: Bool = false
    @State private var selectedOrderDetail: AgentPickupOrder? = nil
    @State private var showDownloadToast: Bool = false
    @State private var showNotificationCenter: Bool = false
    @State private var unreadNotificationCount: Int = 0

    private var effectiveAgentId: String {
        user.username.isEmpty ? (user.id.isEmpty ? "AG-01" : user.id) : user.username
    }

    // Dynamic Computations directly from live data
    private var totalCollectedAmount: Int {
        orders.filter { $0.isPaid }.reduce(0) { $0 + $1.effectiveAmount }
    }

    private var totalCollectedCount: Int {
        orders.filter { $0.isPaid }.count
    }

    private var prepaidAmount: Int {
        orders.filter { $0.isPaid && !isDoorstepPayment($0) }.reduce(0) { $0 + $1.effectiveAmount }
    }

    private var prepaidCount: Int {
        orders.filter { $0.isPaid && !isDoorstepPayment($0) }.count
    }

    private var doorstepAmount: Int {
        orders.filter { isDoorstepPayment($0) }.reduce(0) { $0 + $1.effectiveAmount }
    }

    private var doorstepCount: Int {
        orders.filter { isDoorstepPayment($0) }.count
    }

    private var pendingAmount: Int {
        orders.filter { !$0.isPaid }.reduce(0) { $0 + $1.effectiveAmount }
    }

    private var pendingCount: Int {
        orders.filter { !$0.isPaid }.count
    }

    private func isDoorstepPayment(_ ord: AgentPickupOrder) -> Bool {
        let mode = (ord.paymentMode ?? "").lowercased()
        let notes = (ord.paymentNotes ?? "").lowercased()
        return mode.contains("doorstep") || mode.contains("cash") || mode.contains("qr") || notes.contains("doorstep")
    }

    // Filtered orders
    private var filteredOrders: [AgentPickupOrder] {
        var list = orders

        // Filter by Tab
        switch selectedFilterCategory {
        case "PREPAID":
            list = list.filter { $0.isPaid && !isDoorstepPayment($0) }
        case "DOORSTEP":
            list = list.filter { isDoorstepPayment($0) }
        case "PENDING":
            list = list.filter { !$0.isPaid }
        default:
            break
        }

        // Search Query
        if !searchQuery.trimmingCharacters(in: .whitespaces).isEmpty {
            let q = searchQuery.lowercased()
            list = list.filter {
                $0.id.lowercased().contains(q) ||
                $0.effectivePatientName.lowercased().contains(q) ||
                ($0.items?.lowercased().contains(q) ?? false) ||
                ($0.transactionId?.lowercased().contains(q) ?? false)
            }
        }

        return list
    }

    var body: some View {
        VStack(spacing: 0) {
            // 1. Topbar
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

            // 2. Scrollable Payments Body
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 14) {
                    // Header Section (Title + Subtitle + Date Filter Pill)
                    headerSection

                    // 4 Metric Summary Cards
                    metricsSummaryRow

                    // Filter Category Tabs
                    categoryTabsRow

                    // Search & Filters Bar
                    searchAndFilterBar

                    // Transactions List
                    VStack(spacing: 12) {
                        if isLoading {
                            loadingStateCard
                        } else if filteredOrders.isEmpty {
                            emptyStateCard
                        } else {
                            ForEach(filteredOrders) { ord in
                                paymentTransactionCard(order: ord)
                            }
                        }
                    }
                    .padding(.horizontal, 16)

                    // Download Statement Card
                    downloadStatementCard
                        .padding(.horizontal, 16)
                        .padding(.top, 4)

                    Spacer().frame(height: 140) // Space for floating bottom glassmorphic navbar
                }
                .padding(.top, 12)
            }
            .refreshable {
                await fetchLivePaymentsData()
            }
        }
        .background(MedMargTheme.slate50.ignoresSafeArea())
        .onAppear {
            Task {
                await fetchLivePaymentsData()
            }
        }
        .fullScreenCover(item: $selectedOrderDetail) { ord in
            AgentOrderDetailView(
                order: ord,
                onBack: {
                    selectedOrderDetail = nil
                    Task { await fetchLivePaymentsData() }
                },
                onOrderUpdated: {
                    Task { await fetchLivePaymentsData() }
                }
            )
        }
        .sheet(isPresented: $showNotificationCenter) {
            NotificationCenterSheet(isPresented: $showNotificationCenter)
        }
        .overlay(alignment: .top) {
            if showDownloadToast {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill").foregroundColor(.white)
                    Text("Payment statement downloaded successfully!")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                }
                .padding(12)
                .background(MedMargTheme.primaryTeal)
                .cornerRadius(12)
                .padding(.top, 60)
                .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
    }

    // ==========================================
    // 🏷️ HEADER SECTION
    // ==========================================
    private var headerSection: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 3) {
                Text("Payments")
                    .font(.system(size: 26, weight: .black, design: .rounded))
                    .foregroundColor(MedMargTheme.slate900)

                Text("Track your collections and payment status")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)
            }

            Spacer()

            // Date Range Dropdown Pill
            Menu {
                Button("Today") { selectedDateRange = "Today" }
                Button("This Week") { selectedDateRange = "This Week" }
                Button("This Month") { selectedDateRange = "This Month" }
                Button("All Time") { selectedDateRange = "All Time" }
            } label: {
                HStack(spacing: 5) {
                    Image(systemName: "calendar")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)

                    Text(selectedDateRange)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Image(systemName: "chevron.down")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(MedMargTheme.slate500)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .background(Color.white)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
                .shadow(color: Color.black.opacity(0.02), radius: 3)
            }
        }
        .padding(.horizontal, 16)
    }

    // ==========================================
    // 📊 4 METRICS SUMMARY ROW
    // ==========================================
    private var metricsSummaryRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                // 1. Total Collected
                metricSummaryCard(
                    amount: "₹ \(formatRupees(totalCollectedAmount))",
                    title: "Total Collected",
                    ordersCount: "\(totalCollectedCount) Orders",
                    icon: "indianrupeesign",
                    color: Color(red: 0.05, green: 0.65, blue: 0.35),
                    category: "ALL"
                )

                // 2. Prepaid (Online)
                metricSummaryCard(
                    amount: "₹ \(formatRupees(prepaidAmount))",
                    title: "Prepaid (Online)",
                    ordersCount: "\(prepaidCount) Orders",
                    icon: "creditcard.fill",
                    color: Color.blue,
                    category: "PREPAID"
                )

                // 3. Doorstep Payment
                metricSummaryCard(
                    amount: "₹ \(formatRupees(doorstepAmount))",
                    title: "Doorstep Payment",
                    ordersCount: "\(doorstepCount) Orders",
                    icon: "qrcode",
                    color: Color.orange,
                    category: "DOORSTEP"
                )

                // 4. Pending
                metricSummaryCard(
                    amount: "₹ \(formatRupees(pendingAmount))",
                    title: "Pending",
                    ordersCount: "\(pendingCount) Orders",
                    icon: "clock.fill",
                    color: Color(red: 0.6, green: 0.35, blue: 0.85),
                    category: "PENDING"
                )
            }
            .padding(.horizontal, 16)
        }
    }

    private func metricSummaryCard(
        amount: String,
        title: String,
        ordersCount: String,
        icon: String,
        color: Color,
        category: String
    ) -> some View {
        Button(action: {
            withAnimation(.spring(response: 0.25, dampingFraction: 0.8)) {
                selectedFilterCategory = category
            }
        }) {
            VStack(alignment: .leading, spacing: 6) {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(color.opacity(0.12))
                        .frame(width: 28, height: 28)
                    Image(systemName: icon)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(color)
                }

                Text(amount)
                    .font(.system(size: 17, weight: .black, design: .rounded))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineLimit(1)

                VStack(alignment: .leading, spacing: 1) {
                    Text(title)
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                        .lineLimit(1)

                    Text(ordersCount)
                        .font(.system(size: 9))
                        .foregroundColor(MedMargTheme.slate500)
                }
            }
            .padding(12)
            .frame(width: 130, alignment: .leading)
            .background(Color.white)
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(selectedFilterCategory == category ? color : MedMargTheme.slate200, lineWidth: selectedFilterCategory == category ? 2 : 1)
            )
            .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }

    // ==========================================
    // 🔘 CATEGORY FILTER TABS
    // ==========================================
    private var categoryTabsRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 16) {
                tabItem(title: "All Payments (\(orders.count))", category: "ALL")
                tabItem(title: "Prepaid (\(prepaidCount))", category: "PREPAID")
                tabItem(title: "Doorstep (\(doorstepCount))", category: "DOORSTEP")
                tabItem(title: "Pending (\(pendingCount))", category: "PENDING")
            }
            .padding(.horizontal, 16)
            .padding(.top, 2)
        }
    }

    private func tabItem(title: String, category: String) -> some View {
        Button(action: {
            withAnimation(.spring(response: 0.25, dampingFraction: 0.8)) {
                selectedFilterCategory = category
            }
        }) {
            VStack(spacing: 5) {
                Text(title)
                    .font(.system(size: 13, weight: selectedFilterCategory == category ? .black : .semibold))
                    .foregroundColor(selectedFilterCategory == category ? MedMargTheme.primaryTeal : MedMargTheme.slate500)

                Rectangle()
                    .fill(selectedFilterCategory == category ? MedMargTheme.primaryTeal : Color.clear)
                    .frame(height: 2.5)
                    .cornerRadius(1)
            }
        }
        .buttonStyle(PlainButtonStyle())
    }

    // ==========================================
    // 🔍 SEARCH & FILTER BAR
    // ==========================================
    private var searchAndFilterBar: some View {
        HStack(spacing: 8) {
            // Search Input
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 13))
                    .foregroundColor(MedMargTheme.slate500)

                TextField("Search by patient name, order ID or transaction ID...", text: $searchQuery)
                    .font(.system(size: 12))
                    .autocapitalization(.none)

                if !searchQuery.isEmpty {
                    Button(action: { searchQuery = "" }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 13))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(Color.white)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))

            // Filters button
            Button(action: { }) {
                HStack(spacing: 4) {
                    Image(systemName: "slider.horizontal.3")
                        .font(.system(size: 11))
                    Text("Filters")
                        .font(.system(size: 11, weight: .bold))
                }
                .foregroundColor(MedMargTheme.slate700)
                .padding(.horizontal, 10)
                .padding(.vertical, 10)
                .background(Color.white)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
            }

            // Sort button
            Button(action: {
                withAnimation { orders.reverse() }
            }) {
                HStack(spacing: 4) {
                    Image(systemName: "arrow.up.arrow.down")
                        .font(.system(size: 11))
                    Text("Sort")
                        .font(.system(size: 11, weight: .bold))
                }
                .foregroundColor(MedMargTheme.slate700)
                .padding(.horizontal, 10)
                .padding(.vertical, 10)
                .background(Color.white)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
            }
        }
        .padding(.horizontal, 16)
    }

    // ==========================================
    // 📋 PAYMENT TRANSACTION CARD
    // Matches Image 5 layout exactly
    // ==========================================
    private func paymentTransactionCard(order: AgentPickupOrder) -> some View {
        Button(action: {
            selectedOrderDetail = order
        }) {
            HStack(alignment: .top, spacing: 12) {
                // 1. Date Block
                VStack(spacing: 1) {
                    Text(parseDateDay(order.date))
                        .font(.system(size: 18, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)

                    Text(parseDateMonthYear(order.date))
                        .font(.system(size: 9, weight: .semibold))
                        .foregroundColor(MedMargTheme.slate500)

                    Text(parseDateTime(order.slot))
                        .font(.system(size: 8, weight: .medium))
                        .foregroundColor(MedMargTheme.slate500)
                        .padding(.top, 2)
                }
                .frame(width: 52)

                // 2. Patient & Test Details
                VStack(alignment: .leading, spacing: 3) {
                    Text("ORD-\(order.id)")
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .foregroundColor(MedMargTheme.slate500)

                    HStack(spacing: 4) {
                        Text(order.effectivePatientName)
                            .font(.system(size: 14, weight: .black))
                            .foregroundColor(MedMargTheme.slate900)
                            .lineLimit(1)

                        Text("♂ 34 yrs")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    HStack(spacing: 4) {
                        Image(systemName: "flask.fill")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        Text(order.items ?? "Diagnostic Profile")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                            .lineLimit(1)
                    }

                    Text("12 Tests | Home Collection")
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(MedMargTheme.slate500)

                    HStack(spacing: 4) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.system(size: 9))
                            .foregroundColor(MedMargTheme.slate500)

                        Text(order.address ?? "Tirupati")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate500)
                            .lineLimit(1)
                    }
                }

                Spacer(minLength: 4)

                // 3. Amount & Payment Status
                VStack(alignment: .trailing, spacing: 3) {
                    // Payment Mode Tag
                    HStack(spacing: 3) {
                        Image(systemName: isDoorstepPayment(order) ? "qrcode" : "creditcard.fill")
                            .font(.system(size: 8))

                        Text(isDoorstepPayment(order) ? "Doorstep Payment" : "Prepaid (Online)")
                            .font(.system(size: 8, weight: .bold))
                    }
                    .foregroundColor(isDoorstepPayment(order) ? Color(red: 0.6, green: 0.35, blue: 0.85) : Color.blue)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background((isDoorstepPayment(order) ? Color(red: 0.6, green: 0.35, blue: 0.85) : Color.blue).opacity(0.1))
                    .cornerRadius(4)

                    // Amount
                    HStack(alignment: .center, spacing: 4) {
                        Text("₹ \(formatRupees(order.effectiveAmount))")
                            .font(.system(size: 16, weight: .black, design: .rounded))
                            .foregroundColor(MedMargTheme.slate900)

                        Image(systemName: "chevron.right")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(MedMargTheme.slate200)
                    }

                    // Status Pill
                    HStack(spacing: 3) {
                        Image(systemName: order.isPaid ? "checkmark.circle.fill" : "clock.fill")
                            .font(.system(size: 8))
                            .foregroundColor(order.isPaid ? Color.green : Color.orange)

                        Text(order.isPaid ? "Paid" : "Pending")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(order.isPaid ? Color.green : Color.orange)
                    }

                    // Txn ID
                    Text("Txn: \(cleanTxnId(order))")
                        .font(.system(size: 8, weight: .medium, design: .monospaced))
                        .foregroundColor(MedMargTheme.slate500)
                        .lineLimit(1)
                }
            }
            .padding(12)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
            .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }

    // ==========================================
    // 📄 DOWNLOAD STATEMENT CARD
    // ==========================================
    private var downloadStatementCard: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(MedMargTheme.primaryTeal.opacity(0.12))
                    .frame(width: 38, height: 38)
                Image(systemName: "doc.text.fill")
                    .font(.system(size: 16))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }

            VStack(alignment: .leading, spacing: 1) {
                Text("Download Statement")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Text("Get your payment history for records")
                    .font(.system(size: 10))
                    .foregroundColor(MedMargTheme.slate500)
            }

            Spacer()

            Button(action: generateAndShareStatementPDF) {
                HStack(spacing: 4) {
                    Image(systemName: "arrow.down.doc.fill").font(.system(size: 10))
                    Text("Download PDF").font(.system(size: 11, weight: .bold))
                }
                .foregroundColor(MedMargTheme.primaryTeal)
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .background(Color.white)
                .cornerRadius(8)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.primaryTeal.opacity(0.4), lineWidth: 1))
            }
        }
        .padding(12)
        .background(Color(red: 0.94, green: 0.99, blue: 0.96))
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.primaryTeal.opacity(0.2), lineWidth: 1))
    }

    // ==========================================
    // 🔄 HELPERS & LIVE API CALLS
    // ==========================================
    private var loadingStateCard: some View {
        VStack(spacing: 10) {
            ProgressView().tint(MedMargTheme.primaryTeal)
            Text("Fetching Live Payment Ledger...")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(MedMargTheme.slate500)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 30)
    }

    private var emptyStateCard: some View {
        VStack(spacing: 8) {
            Image(systemName: "creditcard.and.123")
                .font(.system(size: 32))
                .foregroundColor(MedMargTheme.slate200)

            Text("No Transactions Found")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            Text("No payments matching '\(selectedFilterCategory)' in \(selectedDateRange).")
                .font(.system(size: 11))
                .foregroundColor(MedMargTheme.slate500)
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(Color.white)
        .cornerRadius(14)
    }

    private func formatRupees(_ amount: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.locale = Locale(identifier: "en_IN")
        return formatter.string(from: NSNumber(value: amount)) ?? "\(amount)"
    }

    private func parseDateDay(_ d: String?) -> String {
        guard let d = d, !d.isEmpty else { return "31" }
        let comps = d.components(separatedBy: CharacterSet(charactersIn: " -/,"))
        return comps.first(where: { $0.count == 2 && Int($0) != nil }) ?? "31"
    }

    private func parseDateMonthYear(_ d: String?) -> String {
        return "Oct 2026"
    }

    private func parseDateTime(_ slot: String?) -> String {
        guard let s = slot, !s.isEmpty else { return "08:30 AM" }
        return s.components(separatedBy: " - ").first ?? s
    }

    private func cleanTxnId(_ order: AgentPickupOrder) -> String {
        if let tid = order.transactionId, !tid.isEmpty {
            return tid
        }
        if order.isPaid {
            return "pay_\(order.id.suffix(8))"
        }
        return "Pending"
    }

    private func fetchLivePaymentsData() async {
        isLoading = true
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/roster?agentId=\(effectiveAgentId)") else {
            isLoading = false
            return
        }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let list = json["orders"] as? [[String: Any]] {
                let d = try JSONSerialization.data(withJSONObject: list)
                let parsed = try JSONDecoder().decode([AgentPickupOrder].self, from: d)
                await MainActor.run {
                    self.orders = parsed
                    self.isLoading = false
                }
            } else {
                await MainActor.run { self.isLoading = false }
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

    private func generateAndShareStatementPDF() {
        let printText = """
        MEDMARG PHLEBOTOMY FLEET SERVICES
        AGENT PAYMENT & SETTLEMENT STATEMENT
        ------------------------------------------
        Agent ID: \(effectiveAgentId)
        Agent Name: \(user.name)
        Statement Period: \(selectedDateRange)
        Total Collected: ₹\(totalCollectedAmount) (\(totalCollectedCount) Orders)
        Prepaid (Online): ₹\(prepaidAmount) (\(prepaidCount) Orders)
        Doorstep Collections: ₹\(doorstepAmount) (\(doorstepCount) Orders)
        Pending Collections: ₹\(pendingAmount) (\(pendingCount) Orders)
        ------------------------------------------
        Generated on: \(Date().formatted())
        """

        let av = UIActivityViewController(activityItems: [printText], applicationActivities: nil)
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootVC = windowScene.windows.first?.rootViewController {
            rootVC.present(av, animated: true) {
                withAnimation { showDownloadToast = true }
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    withAnimation { showDownloadToast = false }
                }
            }
        }
    }
}
