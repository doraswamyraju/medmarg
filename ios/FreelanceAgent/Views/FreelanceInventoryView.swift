import SwiftUI

// =========================================================================
// ⚡ FREELANCE INVENTORY VIEW (DEDICATED INVENTORY TAB)
// 100% Live Backend Data from /api/v1/agent/inventory
// Integrated with Freelancer Onboarding Credit Balance (₹2,000 Credits)
// =========================================================================

struct FreelanceInventoryView: View {
    let user: UserProfile
    @Binding var selectedTab: Int
    @Binding var showSidebar: Bool

    // Live State
    @State private var items: [AgentInventoryItem] = []
    @State private var walletCredits: Int = 2000
    @State private var isLoading: Bool = true
    @State private var searchQuery: String = ""
    @State private var selectedFilterCategory: String = "ALL" // "ALL", "LOW_STOCK", "OUT_OF_STOCK"

    // Modals
    @State private var showIndentSheet: Bool = false
    @State private var showReportIssueModal: Bool = false
    @State private var showNotificationCenter: Bool = false
    @State private var unreadNotificationCount: Int = 0
    @State private var actionBanner: String? = nil

    private var effectiveAgentId: String {
        user.username.isEmpty ? (user.id.isEmpty ? "AG-01" : user.id) : user.username
    }

    private var totalItemsCount: Int { items.count }
    private var readyCount: Int { items.filter { $0.stock >= ($0.minThreshold ?? 5) }.count }
    private var lowStockCount: Int { items.filter { $0.stock > 0 && $0.stock < ($0.minThreshold ?? 5) }.count }
    private var outOfStockCount: Int { items.filter { $0.stock == 0 }.count }

    private var filteredItems: [AgentInventoryItem] {
        var result = items
        switch selectedFilterCategory {
        case "LOW_STOCK":
            result = result.filter { $0.stock > 0 && $0.stock < ($0.minThreshold ?? 5) }
        case "OUT_OF_STOCK":
            result = result.filter { $0.stock == 0 }
        default:
            break
        }
        if !searchQuery.trimmingCharacters(in: .whitespaces).isEmpty {
            let q = searchQuery.lowercased()
            result = result.filter { $0.name.lowercased().contains(q) || $0.code.lowercased().contains(q) }
        }
        return result
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
                VStack(spacing: 14) {
                    if let banner = actionBanner {
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.white)
                            Text(banner)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(.white)
                            Spacer()
                            Button(action: { actionBanner = nil }) {
                                Image(systemName: "xmark").foregroundColor(.white)
                            }
                        }
                        .padding(12)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(12)
                        .padding(.horizontal, 16)
                        .padding(.top, 4)
                    }

                    // 1. Freelancer Credit Balance Card
                    creditWalletCard

                    // 2. 4 Metric Cards
                    stockCountersRow

                    // 3. Search Bar
                    searchBarView

                    // 4. Segment Filter Tabs
                    categorySegmentBar

                    // 5. Items List
                    if isLoading {
                        VStack(spacing: 12) {
                            ProgressView().tint(MedMargTheme.primaryTeal)
                            Text("Loading kit inventory...")
                                .font(.system(size: 12))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        .padding(.top, 30)
                    } else if filteredItems.isEmpty {
                        VStack(spacing: 10) {
                            Image(systemName: "tray")
                                .font(.system(size: 40))
                                .foregroundColor(MedMargTheme.slate300)
                            Text("No Items in Kit")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(MedMargTheme.slate600)
                        }
                        .padding(.top, 30)
                    } else {
                        VStack(spacing: 10) {
                            ForEach(filteredItems) { item in
                                inventoryItemRow(item)
                            }
                        }
                        .padding(.horizontal, 16)
                    }

                    // 6. Action Buttons
                    HStack(spacing: 10) {
                        Button(action: { showIndentSheet = true }) {
                            HStack(spacing: 6) {
                                Image(systemName: "doc.badge.plus")
                                Text("Order Refill (Credits)")
                            }
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(MedMargTheme.lightTeal)
                            .cornerRadius(12)
                        }

                        Button(action: { showReportIssueModal = true }) {
                            HStack(spacing: 6) {
                                Image(systemName: "exclamationmark.triangle")
                                Text("Report Issue")
                            }
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(MedMargTheme.darkTeal)
                            .cornerRadius(12)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 8)

                    Spacer().frame(height: 120)
                }
                .padding(.top, 10)
            }
            .refreshable {
                await fetchLiveInventory()
            }
        }
        .background(MedMargTheme.slate50.ignoresSafeArea())
        .onAppear {
            Task { await fetchLiveInventory() }
        }
        .sheet(isPresented: $showIndentSheet) {
            AgentRaiseIndentSheet(
                agentId: effectiveAgentId,
                agentName: user.name,
                warehouseStock: [],
                onSubmitted: {
                    actionBanner = "Refill indent requested successfully from credit balance!"
                    Task { await fetchLiveInventory() }
                }
            )
        }
        .sheet(isPresented: $showReportIssueModal) {
            AgentReportIssueSheet(
                agentId: effectiveAgentId,
                agentName: user.name,
                onReported: {
                    actionBanner = "Issue reported to Admin store desk."
                }
            )
        }
        .sheet(isPresented: $showNotificationCenter) {
            NotificationCenterSheet(isPresented: $showNotificationCenter)
        }
    }

    // ==========================================
    // CREDIT WALLET CARD
    // ==========================================
    private var creditWalletCard: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(MedMargTheme.accentEmerald.opacity(0.15))
                    .frame(width: 44, height: 44)
                Image(systemName: "wallet.pass.fill")
                    .font(.system(size: 20))
                    .foregroundColor(MedMargTheme.accentEmerald)
            }

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text("Inventory Credit Balance")
                        .font(.system(size: 13, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("₹\(walletCredits)")
                        .font(.system(size: 14, weight: .black))
                        .foregroundColor(MedMargTheme.accentEmerald)
                }
                Text("Redeem vacutainers and collection supplies directly")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
            }
            Spacer()

            Button(action: { showIndentSheet = true }) {
                Text("Redeem")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(MedMargTheme.accentEmerald)
                    .cornerRadius(8)
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .padding(.horizontal, 16)
        .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
    }

    // ==========================================
    // STOCK COUNTERS ROW
    // ==========================================
    private var stockCountersRow: some View {
        HStack(spacing: 8) {
            counterCard(title: "Total Items", count: totalItemsCount, sub: "In Bag", color: Color.blue)
            counterCard(title: "Ready", count: readyCount, sub: "Sufficient", color: MedMargTheme.accentEmerald)
            counterCard(title: "Low Stock", count: lowStockCount, sub: "Refill Soon", color: Color.orange)
            counterCard(title: "Out of Stock", count: outOfStockCount, sub: "Empty", color: Color.red)
        }
        .padding(.horizontal, 16)
    }

    private func counterCard(title: String, count: Int, sub: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(MedMargTheme.slate500)
            Text("\(count)")
                .font(.system(size: 16, weight: .black))
                .foregroundColor(MedMargTheme.slate900)
            Text(sub)
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(color)
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.03), radius: 4, x: 0, y: 1)
    }

    // ==========================================
    // SEARCH BAR
    // ==========================================
    private var searchBarView: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(MedMargTheme.slate400)
            TextField("Search consumables, tubes, lancets...", text: $searchQuery)
                .font(.system(size: 13))
            if !searchQuery.isEmpty {
                Button(action: { searchQuery = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(MedMargTheme.slate400)
                }
            }
        }
        .padding(10)
        .background(Color.white)
        .cornerRadius(12)
        .padding(.horizontal, 16)
    }

    // ==========================================
    // CATEGORY SEGMENTS
    // ==========================================
    private var categorySegmentBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                segmentButton(title: "All Items (\(totalItemsCount))", key: "ALL")
                segmentButton(title: "Low Stock (\(lowStockCount))", key: "LOW_STOCK")
                segmentButton(title: "Out of Stock (\(outOfStockCount))", key: "OUT_OF_STOCK")
            }
            .padding(.horizontal, 16)
        }
    }

    private func segmentButton(title: String, key: String) -> some View {
        let isSel = selectedFilterCategory == key
        return Button(action: {
            withAnimation(.spring(response: 0.25)) { selectedFilterCategory = key }
        }) {
            Text(title)
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(isSel ? .white : MedMargTheme.slate700)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSel ? MedMargTheme.primaryTeal : MedMargTheme.slate100)
                .cornerRadius(20)
        }
        .buttonStyle(PlainButtonStyle())
    }

    // ==========================================
    // INVENTORY ITEM ROW
    // ==========================================
    private func inventoryItemRow(_ item: AgentInventoryItem) -> some View {
        let minT = item.minThreshold ?? 5
        let statusColor: Color = item.stock == 0 ? .red : (item.stock < minT ? .orange : MedMargTheme.accentEmerald)
        let statusText: String = item.stock == 0 ? "Out of Stock" : (item.stock < minT ? "Low Stock" : "Sufficient")

        return HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(MedMargTheme.slate100)
                    .frame(width: 44, height: 44)
                Image(systemName: iconForCategory(item.name))
                    .font(.system(size: 20))
                    .foregroundColor(colorForCategory(item.name))
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                HStack(spacing: 6) {
                    Text("\(item.stock) / 20 \(item.unit)")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(MedMargTheme.slate600)
                    Text("• Min: \(minT)")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.slate400)
                }

                // Progress Bar
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(MedMargTheme.slate200).frame(height: 4)
                        Capsule()
                            .fill(statusColor)
                            .frame(width: min(geo.size.width, geo.size.width * CGFloat(min(item.stock, 20)) / 20.0), height: 4)
                    }
                }
                .frame(height: 4)
            }

            Spacer()

            Text(statusText)
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(statusColor)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(statusColor.opacity(0.12))
                .cornerRadius(6)
        }
        .padding(12)
        .background(Color.white)
        .cornerRadius(14)
        .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 1)
    }

    private func iconForCategory(_ name: String) -> String {
        let n = name.lowercased()
        if n.contains("tube") || n.contains("edta") || n.contains("sst") || n.contains("fluoride") {
            return "testtube.2"
        } else if n.contains("syringe") || n.contains("needle") {
            return "cross.fill"
        } else if n.contains("glove") {
            return "hand.raised.fill"
        } else if n.contains("container") || n.contains("urine") {
            return "cup.and.saucer.fill"
        } else if n.contains("barcode") || n.contains("label") {
            return "barcode"
        }
        return "shippingbox.fill"
    }

    private func colorForCategory(_ name: String) -> Color {
        let n = name.lowercased()
        if n.contains("edta") || n.contains("purple") { return Color.purple }
        if n.contains("sst") || n.contains("serum") || n.contains("gold") { return Color.yellow }
        if n.contains("fluoride") || n.contains("grey") { return Color.gray }
        if n.contains("urine") { return Color.orange }
        return MedMargTheme.primaryTeal
    }

    private func fetchLiveInventory() async {
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/inventory?agentId=\(effectiveAgentId)") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let arr = json["inventory"] as? [[String: Any]] {
                let mapped: [AgentInventoryItem] = arr.compactMap { d in
                    guard let id = d["id"] as? String,
                          let name = d["name"] as? String,
                          let code = d["code"] as? String,
                          let stock = d["stock"] as? Int else { return nil }
                    return AgentInventoryItem(
                        id: id,
                        name: name,
                        code: code,
                        stock: stock,
                        unit: d["unit"] as? String ?? "pcs",
                        minThreshold: d["minThreshold"] as? Int ?? 5
                    )
                }
                await MainActor.run {
                    self.items = mapped
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
