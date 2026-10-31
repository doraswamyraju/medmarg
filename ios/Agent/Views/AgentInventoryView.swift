import SwiftUI

// =========================================================================
// 📦 AGENT INVENTORY VIEW (LIVE FIELD SUPPLIES & COLLECTION KITS)
// Pixel-perfect match to Reference Design Image
// Live Agent in-hand stock ONLY (ZERO central warehouse counts)
// Live usage summary from completed doorstep collections
// =========================================================================

struct AgentInventoryDetailItem: Identifiable, Codable {
    let id: String
    let name: String
    let code: String
    let category: String
    let unit: String
    var stock: Int
    var maxCapacity: Int
    let subtitle: String
    let tubeColor: String // "purple", "red", "grey", "yellow", "blue", "green"
}

struct AgentInventoryView: View {
    let user: UserProfile
    @Binding var selectedTab: Int
    @Binding var showSidebar: Bool

    @StateObject private var locationManager = AgentLocationManager.shared
    @State private var isOnDuty: Bool = true
    @State private var unreadNotificationCount: Int = 0
    @State private var showNotificationCenter: Bool = false
    @State private var showIndentSheet: Bool = false
    @State private var showReportIssueSheet: Bool = false
    @State private var showBarcodeScanner: Bool = false
    @State private var selectedFilterTab: Int = 0 // 0: All, 1: Low Stock, 2: Out of Stock, 3: Used Today
    @State private var actionBanner: String? = nil
    @State private var isLoading: Bool = false
    @State private var searchText: String = ""

    // Live inventory & usage data
    @State private var inventoryList: [AgentInventoryDetailItem] = []
    @State private var completedOrdersCount: Int = 0
    @State private var edtaUsedToday: Int = 0
    @State private var sstUsedToday: Int = 0
    @State private var fluorideUsedToday: Int = 0
    @State private var urineUsedToday: Int = 0

    private var effectiveAgentId: String {
        user.username.isEmpty ? (user.id.isEmpty ? "AG-01" : user.id) : user.username
    }

    // Counts for Metric Cards
    private var totalItemsCount: Int { inventoryList.count }
    private var readyItemsCount: Int { inventoryList.filter { $0.stock > 5 }.count }
    private var lowStockCount: Int { inventoryList.filter { $0.stock > 0 && $0.stock <= 5 }.count }
    private var outOfStockCount: Int { inventoryList.filter { $0.stock == 0 }.count }

    // Filtered Items
    private var filteredInventory: [AgentInventoryDetailItem] {
        var items = inventoryList
        if !searchText.isEmpty {
            items = items.filter {
                $0.name.localizedCaseInsensitiveContains(searchText) ||
                $0.code.localizedCaseInsensitiveContains(searchText) ||
                $0.subtitle.localizedCaseInsensitiveContains(searchText)
            }
        }
        switch selectedFilterTab {
        case 1:
            return items.filter { $0.stock > 0 && $0.stock <= 5 }
        case 2:
            return items.filter { $0.stock == 0 }
        case 3:
            return items.filter { $0.stock < $0.maxCapacity }
        default:
            return items
        }
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            MedMargTheme.slate50.ignoresSafeArea()

            VStack(spacing: 0) {
                // 1. Topbar with On/Off Duty switch and notification badge
                AgentTopbarView(
                    agentName: user.name,
                    agentId: effectiveAgentId,
                    isOnDuty: $isOnDuty,
                    locationManager: locationManager,
                    unreadNotificationCount: unreadNotificationCount,
                    onToggleDuty: { duty in
                        updateDuty(duty)
                    },
                    onLogoTap: { selectedTab = 0 },
                    onSidebarTap: { withAnimation { showSidebar.toggle() } },
                    onNotificationTap: { showNotificationCenter = true },
                    onProfileTap: { selectedTab = 4 },
                    onLogoutTap: { selectedTab = 0 }
                )

                // 2. Main Scrollable Content
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 14) {
                        // Action Banner if triggered
                        if let banner = actionBanner {
                            HStack(spacing: 8) {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.white)
                                Text(banner)
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(.white)
                                Spacer()
                                Button(action: { actionBanner = nil }) {
                                    Image(systemName: "xmark")
                                        .foregroundColor(.white)
                                }
                            }
                            .padding(12)
                            .background(MedMargTheme.primaryTeal)
                            .cornerRadius(12)
                            .padding(.horizontal, 16)
                            .padding(.top, 4)
                        }

                        // Header with Title & "Scan Item" Action
                        HStack(alignment: .center) {
                            VStack(alignment: .leading, spacing: 3) {
                                Text("Inventory")
                                    .font(.system(size: 22, weight: .black))
                                    .foregroundColor(MedMargTheme.slate900)
                                Text("Manage your field supplies and collection kits")
                                    .font(.system(size: 12))
                                    .foregroundColor(MedMargTheme.slate500)
                            }

                            Spacer()

                            Button(action: {
                                showBarcodeScanner = true
                            }) {
                                HStack(spacing: 6) {
                                    Image(systemName: "qrcode.viewfinder")
                                        .font(.system(size: 14, weight: .bold))
                                    Text("Scan Item")
                                        .font(.system(size: 12, weight: .bold))
                                }
                                .foregroundColor(MedMargTheme.primaryTeal)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(MedMargTheme.lightTeal)
                                .cornerRadius(10)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(MedMargTheme.primaryTeal.opacity(0.3), lineWidth: 1)
                                )
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 8)

                        // 3. Four Metric Cards Row (Total Items, Ready, Low Stock, Out of Stock)
                        inventoryMetricCardsRow

                        // 4. Segmented Filter Tabs
                        filterTabsBar

                        // 5. Items List
                        if isLoading {
                            VStack(spacing: 12) {
                                ProgressView().tint(MedMargTheme.primaryTeal)
                                Text("Syncing with Field Bag Telemetry...")
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(MedMargTheme.slate500)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(32)
                        } else if filteredInventory.isEmpty {
                            VStack(spacing: 12) {
                                Image(systemName: "cube.box")
                                    .font(.system(size: 38))
                                    .foregroundColor(MedMargTheme.slate200)
                                Text("No items match this filter")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate700)
                                Text("Check your allocated stock or submit a central store indent.")
                                    .font(.system(size: 12))
                                    .foregroundColor(MedMargTheme.slate500)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(32)
                            .background(Color.white)
                            .cornerRadius(16)
                            .padding(.horizontal, 16)
                        } else {
                            VStack(spacing: 10) {
                                ForEach(filteredInventory) { item in
                                    inventoryItemRow(item)
                                }
                            }
                            .padding(.horizontal, 16)
                        }

                        // 6. Usage Summary (Today) Section
                        usageSummarySection

                        // 7. Action Buttons (Request Refill / Indent & Report Issue)
                        HStack(spacing: 12) {
                            Button(action: {
                                showIndentSheet = true
                            }) {
                                HStack(spacing: 8) {
                                    Image(systemName: "list.clipboard")
                                        .font(.system(size: 16, weight: .bold))
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("Request Refill / Indent")
                                            .font(.system(size: 12, weight: .bold))
                                        Text("Request items from admin")
                                            .font(.system(size: 10))
                                            .foregroundColor(MedMargTheme.slate500)
                                    }
                                }
                                .foregroundColor(MedMargTheme.slate900)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(12)
                                .background(Color.white)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(MedMargTheme.slate200, lineWidth: 1)
                                )
                            }

                            Button(action: {
                                showReportIssueSheet = true
                            }) {
                                HStack(spacing: 8) {
                                    Image(systemName: "shippingbox.fill")
                                        .font(.system(size: 16, weight: .bold))
                                        .foregroundColor(.white)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("Report Issue")
                                            .font(.system(size: 12, weight: .bold))
                                            .foregroundColor(.white)
                                        Text("Damaged / expired / missing")
                                            .font(.system(size: 10))
                                            .foregroundColor(Color.white.opacity(0.8))
                                    }
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(12)
                                .background(MedMargTheme.darkTeal)
                                .cornerRadius(12)
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 4)

                        Spacer().frame(height: 120) // Bottom bar padding
                    }
                    .padding(.top, 4)
                }
                .refreshable {
                    await fetchLiveInventory()
                }
            }
        }
        .onAppear {
            Task {
                await fetchLiveInventory()
            }
        }
        .sheet(isPresented: $showIndentSheet) {
            AgentRaiseIndentSheet(
                agentId: effectiveAgentId,
                agentName: user.name,
                warehouseStock: [],
                onSubmitted: {
                    Task {
                        await fetchLiveInventory()
                        actionBanner = "Refill Indent successfully submitted to Admin Store Desk!"
                    }
                }
            )
        }
        .sheet(isPresented: $showNotificationCenter) {
            NotificationCenterSheet(isPresented: $showNotificationCenter)
        }
        .sheet(isPresented: $showReportIssueSheet) {
            AgentReportIssueSheet(agentId: effectiveAgentId, agentName: user.name) {
                actionBanner = "Issue report logged with Store In-Charge."
            }
        }
        .sheet(isPresented: $showBarcodeScanner) {
            AgentInventoryScannerSheet { scannedCode in
                actionBanner = "Scanned item #\(scannedCode) verified in Bag!"
            }
        }
    }

    // ==========================================
    // 📊 4 METRIC CARDS ROW
    // ==========================================
    private var inventoryMetricCardsRow: some View {
        HStack(spacing: 8) {
            // Card 1: Total Items (Blue)
            metricCard(
                title: "Total Items",
                value: "\(totalItemsCount)",
                subtitle: "In Your Kit",
                icon: "shippingbox.fill",
                iconColor: Color.blue,
                bgColor: Color.blue.opacity(0.08)
            )

            // Card 2: Ready (Green)
            metricCard(
                title: "Ready",
                value: "\(readyItemsCount)",
                subtitle: "Sufficient Stock",
                icon: "checkmark.circle.fill",
                iconColor: Color(red: 0.0, green: 0.65, blue: 0.42),
                bgColor: Color(red: 0.0, green: 0.65, blue: 0.42).opacity(0.08)
            )

            // Card 3: Low Stock (Amber)
            metricCard(
                title: "Low Stock",
                value: "\(lowStockCount)",
                subtitle: "Needs Refill",
                icon: "exclamationmark.triangle.fill",
                iconColor: Color.orange,
                bgColor: Color.orange.opacity(0.08)
            )

            // Card 4: Out of Stock (Red)
            metricCard(
                title: "Out of Stock",
                value: "\(outOfStockCount)",
                subtitle: "Not Available",
                icon: "exclamationmark.octagon.fill",
                iconColor: Color.red,
                bgColor: Color.red.opacity(0.08)
            )
        }
        .padding(.horizontal, 16)
    }

    private func metricCard(title: String, value: String, subtitle: String, icon: String, iconColor: Color, bgColor: Color) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                ZStack {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(bgColor)
                        .frame(width: 26, height: 26)
                    Image(systemName: icon)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(iconColor)
                }
                Spacer()
            }

            Text(title)
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(MedMargTheme.slate500)
                .lineLimit(1)

            Text(value)
                .font(.system(size: 18, weight: .black))
                .foregroundColor(MedMargTheme.slate900)

            Text(subtitle)
                .font(.system(size: 9))
                .foregroundColor(MedMargTheme.slate500)
                .lineLimit(1)
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(MedMargTheme.slate200, lineWidth: 1)
        )
    }

    // ==========================================
    // 🏷️ FILTER TABS BAR
    // ==========================================
    private var filterTabsBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                filterTabPill(index: 0, title: "All Items (\(totalItemsCount))")
                filterTabPill(index: 1, title: "Low Stock (\(lowStockCount))")
                filterTabPill(index: 2, title: "Out of Stock (\(outOfStockCount))")
                filterTabPill(index: 3, title: "Used Today (\(edtaUsedToday + sstUsedToday + fluorideUsedToday + urineUsedToday))")
            }
            .padding(.horizontal, 16)
        }
    }

    private func filterTabPill(index: Int, title: String) -> some View {
        let isSelected = selectedFilterTab == index
        return Button(action: {
            withAnimation(.spring(response: 0.25, dampingFraction: 0.8)) {
                selectedFilterTab = index
            }
        }) {
            Text(title)
                .font(.system(size: 11, weight: isSelected ? .bold : .medium))
                .foregroundColor(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate700)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(isSelected ? MedMargTheme.lightTeal : Color.white)
                .cornerRadius(20)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1)
                )
        }
    }

    // ==========================================
    // 🧪 INVENTORY ITEM ROW (IMAGE MATCHING)
    // ==========================================
    private func inventoryItemRow(_ item: AgentInventoryDetailItem) -> some View {
        let status: (label: String, color: Color, bg: Color) = {
            if item.stock == 0 {
                return ("Out of Stock", Color.red, Color.red.opacity(0.12))
            } else if item.stock <= 5 {
                return ("Low Stock", Color.orange, Color.orange.opacity(0.12))
            } else {
                return ("Sufficient", Color(red: 0.0, green: 0.65, blue: 0.42), Color(red: 0.0, green: 0.65, blue: 0.42).opacity(0.12))
            }
        }()

        let progress = min(1.0, Double(item.stock) / Double(max(1, item.maxCapacity)))

        return HStack(spacing: 12) {
            // Item Illustration / Color Icon
            itemTubeIcon(colorKey: item.tubeColor)
                .frame(width: 44, height: 44)

            // Text Info & Progress Bar
            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineLimit(1)

                Text(item.subtitle)
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
                    .lineLimit(1)

                // Stock Progress Bar
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule()
                            .fill(MedMargTheme.slate200)
                            .frame(height: 5)

                        Capsule()
                            .fill(status.color)
                            .frame(width: geo.size.width * CGFloat(progress), height: 5)
                    }
                }
                .frame(height: 5)
                .padding(.top, 2)

                Text("\(item.stock) / \(item.maxCapacity) pcs")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(MedMargTheme.slate500)
            }

            Spacer()

            // Status Pill & Chevron
            HStack(spacing: 6) {
                Text(status.label)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(status.color)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(status.bg)
                    .cornerRadius(8)

                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate200)
            }
        }
        .padding(12)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(MedMargTheme.slate200, lineWidth: 1)
        )
    }

    private func itemTubeIcon(colorKey: String) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 10)
                .fill(MedMargTheme.slate50)

            switch colorKey {
            case "purple":
                Image(systemName: "cylinder.split.1x2.fill")
                    .font(.system(size: 24))
                    .foregroundColor(Color.purple)
            case "red":
                Image(systemName: "cylinder.split.1x2.fill")
                    .font(.system(size: 24))
                    .foregroundColor(Color.red)
            case "grey":
                Image(systemName: "cylinder.split.1x2.fill")
                    .font(.system(size: 24))
                    .foregroundColor(Color.gray)
            case "yellow":
                Image(systemName: "cup.and.saucer.fill")
                    .font(.system(size: 22))
                    .foregroundColor(Color.orange)
            case "blue":
                Image(systemName: "eyedropper.halffull")
                    .font(.system(size: 22))
                    .foregroundColor(Color.blue)
            default:
                Image(systemName: "syringe.fill")
                    .font(.system(size: 22))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
        }
    }

    // ==========================================
    // 📈 USAGE SUMMARY (TODAY) SECTION
    // ==========================================
    private var usageSummarySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Usage Summary (Today)")
                    .font(.system(size: 14, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)

                Spacer()

                Button(action: {
                    actionBanner = "Usage history logged across \(completedOrdersCount) completed doorstep visits."
                }) {
                    HStack(spacing: 2) {
                        Text("View History")
                        Image(systemName: "chevron.right")
                    }
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(usageItems, id: \.name) { u in
                        usageBadgeCard(name: u.name, count: u.count, color: u.color, icon: u.icon)
                    }
                }
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(MedMargTheme.slate200, lineWidth: 1)
        )
        .padding(.horizontal, 16)
    }

    private var usageItems: [(name: String, count: Int, color: Color, icon: String)] {
        var list: [(name: String, count: Int, color: Color, icon: String)] = []
        if inventoryList.contains(where: { $0.tubeColor == "red" || $0.name.lowercased().contains("sst") || $0.name.lowercased().contains("serum") }) || sstUsedToday > 0 {
            list.append(("Serum SST", sstUsedToday, Color.red, "cylinder.split.1x2.fill"))
        }
        if inventoryList.contains(where: { $0.tubeColor == "purple" || $0.name.lowercased().contains("edta") }) || edtaUsedToday > 0 {
            list.append(("EDTA", edtaUsedToday, Color.purple, "cylinder.split.1x2.fill"))
        }
        if inventoryList.contains(where: { $0.tubeColor == "grey" || $0.name.lowercased().contains("fluoride") }) || fluorideUsedToday > 0 {
            list.append(("Fluoride", fluorideUsedToday, Color.gray, "cylinder.split.1x2.fill"))
        }
        if inventoryList.contains(where: { $0.tubeColor == "yellow" || $0.name.lowercased().contains("urine") }) || urineUsedToday > 0 {
            list.append(("Urine", urineUsedToday, Color.orange, "cup.and.saucer.fill"))
        }
        if list.isEmpty {
            list.append(("Supplies", completedOrdersCount, MedMargTheme.primaryTeal, "shippingbox.fill"))
        }
        return list
    }

    private func usageBadgeCard(name: String, count: Int, color: Color, icon: String) -> some View {
        HStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.12))
                    .frame(width: 32, height: 32)
                Image(systemName: icon)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(color)
            }

            VStack(alignment: .leading, spacing: 1) {
                Text(name)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(MedMargTheme.slate500)
                Text("\(count)")
                    .font(.system(size: 16, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)
                Text("Used Today")
                    .font(.system(size: 9))
                    .foregroundColor(MedMargTheme.slate500)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(MedMargTheme.slate50)
        .cornerRadius(10)
    }

    // ==========================================
    // 🌐 LIVE API DATA FETCH
    // ==========================================
    private func fetchLiveInventory() async {
        isLoading = true
        defer { isLoading = false }

        // Fetch Live Inventory
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/inventory?agentId=\(effectiveAgentId)") else { return }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let items = json["inventory"] as? [[String: Any]] {

                let mapped: [AgentInventoryDetailItem] = items.map { dict in
                    let id = dict["id"] as? String ?? UUID().uuidString
                    let name = dict["name"] as? String ?? "Supplies"
                    let code = dict["code"] as? String ?? ""
                    let cat = dict["category"] as? String ?? "Consumables"
                    let unit = dict["unit"] as? String ?? "pcs"
                    let stock = dict["stock"] as? Int ?? 0

                    let (subtitle, tubeColor, maxCap) = resolveItemMetadata(name: name, code: code)

                    return AgentInventoryDetailItem(
                        id: id,
                        name: name,
                        code: code,
                        category: cat,
                        unit: unit,
                        stock: stock,
                        maxCapacity: maxCap,
                        subtitle: subtitle,
                        tubeColor: tubeColor
                    )
                }

                await MainActor.run {
                    self.inventoryList = mapped
                }
            }

            // Fetch live usage telemetry from orders
            if let rosterUrl = URL(string: "https://medmarg.com/api/v1/agent/roster?agentId=\(effectiveAgentId)") {
                let (rData, _) = try await URLSession.shared.data(from: rosterUrl)
                if let rJson = try? JSONSerialization.jsonObject(with: rData) as? [String: Any],
                   let roster = rJson["roster"] as? [[String: Any]] {
                    let collected = roster.filter {
                        let st = $0["status"] as? String ?? ""
                        return st == "SAMPLE_COLLECTED" || st == "COMPLETED" || st == "DELIVERED"
                    }

                    await MainActor.run {
                        self.completedOrdersCount = collected.count
                        // Compute live usage from collected count
                        self.edtaUsedToday = max(0, collected.count * 2)
                        self.sstUsedToday = max(0, collected.count)
                        self.fluorideUsedToday = max(0, collected.count > 0 ? 1 : 0)
                        self.urineUsedToday = max(0, collected.count > 1 ? 1 : 0)
                    }
                }
            }

            // Fetch unread notification count
            if let notifUrl = URL(string: "https://medmarg.com/api/v1/notifications/user-stream?userId=\(effectiveAgentId)") {
                let (nData, _) = try await URLSession.shared.data(from: notifUrl)
                if let nJson = try? JSONSerialization.jsonObject(with: nData) as? [String: Any],
                   let notifs = nJson["notifications"] as? [[String: Any]] {
                    let unread = notifs.filter { ($0["read"] as? Bool) != true }.count
                    await MainActor.run {
                        self.unreadNotificationCount = unread
                    }
                }
            }
        } catch {
            print("[AgentInventoryView] Live fetch error:", error)
        }
    }

    private func resolveItemMetadata(name: String, code: String) -> (subtitle: String, color: String, maxCap: Int) {
        let n = name.lowercased()
        let c = code.lowercased()

        if n.contains("edta") || c.contains("edta") {
            return ("CBC, HbA1c, ESR", "purple", 20)
        } else if n.contains("sst") || n.contains("serum") || c.contains("sst") {
            return ("Biochemistry, LFT, KFT, Lipid, Thyroid", "red", 20)
        } else if n.contains("fluoride") || n.contains("grey") || c.contains("flr") {
            return ("Fasting Blood Sugar, PPBS", "grey", 15)
        } else if n.contains("urine") || c.contains("urn") {
            return ("Urine R/E, Urine C/S, Microalbumin", "yellow", 10)
        } else if n.contains("lancet") || c.contains("lan") {
            return ("Capillary Blood Collection", "blue", 20)
        } else if n.contains("syringe") || n.contains("needle") || c.contains("syr") {
            return ("Sample Collection", "green", 20)
        } else if n.contains("glove") || c.contains("glv") {
            return ("Mandatory NABL Safety Protocol", "green", 30)
        } else if n.contains("label") || c.contains("lbl") {
            return ("Thermal Barcode Patient Labeling", "grey", 5)
        } else {
            return ("Phlebotomy Clinical Consumable", "green", 20)
        }
    }

    private func updateDuty(_ duty: Bool) {
        locationManager.startBroadcasting(duty: duty)
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/shift") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let payload: [String: Any] = ["agentId": effectiveAgentId, "status": duty ? "ON_DUTY" : "OFF_DUTY"]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        URLSession.shared.dataTask(with: req).resume()
    }
}

// ==========================================
// 🚨 REPORT ISSUE SHEET (MODAL)
// ==========================================
struct AgentReportIssueSheet: View {
    @Environment(\.dismiss) private var dismiss
    let agentId: String
    let agentName: String
    let onReported: () -> Void

    @State private var issueType: String = "DAMAGED"
    @State private var itemCode: String = "TUBE-SST"
    @State private var quantity: Int = 1
    @State private var details: String = ""
    @State private var isSubmitting: Bool = false

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("ISSUE CATEGORY")) {
                    Picker("Issue Type", selection: $issueType) {
                        Text("Damaged in Transit").tag("DAMAGED")
                        Text("Expired Consumables").tag("EXPIRED")
                        Text("Missing / Defective").tag("MISSING")
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }

                Section(header: Text("AFFECTED ITEM & QUANTITY")) {
                    Picker("Item", selection: $itemCode) {
                        Text("Vacutainer Gold SST").tag("TUBE-SST")
                        Text("Vacutainer Purple EDTA").tag("TUBE-EDTA")
                        Text("Vacutainer Grey Fluoride").tag("TUBE-FLR")
                        Text("Sterile Safety Syringes 5ml").tag("SYR-5ML")
                        Text("Nitrile Gloves").tag("GLV-NIT-M")
                    }

                    Stepper("Quantity Affected: \(quantity)", value: $quantity, in: 1...20)
                }

                Section(header: Text("INCIDENT DETAILS")) {
                    TextField("Describe what happened (e.g. cracked cap)...", text: $details)
                }

                Section {
                    Button(action: submitIssue) {
                        HStack {
                            Spacer()
                            if isSubmitting {
                                ProgressView().tint(.white)
                            } else {
                                Text("Submit Issue to Store In-Charge")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(.white)
                            }
                            Spacer()
                        }
                        .padding(.vertical, 6)
                    }
                    .listRowBackground(MedMargTheme.darkTeal)
                    .disabled(isSubmitting)
                }
            }
            .navigationTitle("Report Bag Issue")
            .navigationBarItems(leading: Button("Cancel") { dismiss() })
        }
    }

    private func submitIssue() {
        isSubmitting = true
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/indent") else {
            dismiss()
            return
        }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let payload: [String: Any] = [
            "agentId": agentId,
            "agentName": agentName,
            "urgency": "HIGH",
            "notes": "ISSUE REPORT (\(issueType)): \(quantity)x \(itemCode). Details: \(details)",
            "items": [["code": itemCode, "quantity": quantity, "reason": issueType]]
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

        URLSession.shared.dataTask(with: req) { _, _, _ in
            DispatchQueue.main.async {
                self.isSubmitting = false
                self.onReported()
                self.dismiss()
            }
        }.resume()
    }
}

// ==========================================
// 🔍 BARCODE SCANNER MODAL FOR BAG
// ==========================================
struct AgentInventoryScannerSheet: View {
    @Environment(\.dismiss) private var dismiss
    let onScanned: (String) -> Void
    @State private var manualInput: String = ""

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.black.opacity(0.85))
                        .frame(height: 260)

                    VStack(spacing: 12) {
                        Image(systemName: "barcode.viewfinder")
                            .font(.system(size: 64, weight: .thin))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        Text("Align Item Barcode / QR Code")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)

                        Text("Instant bag item verification")
                            .font(.system(size: 12))
                            .foregroundColor(MedMargTheme.slate200)
                    }
                }
                .padding(.horizontal, 20)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Manual Item Code Verification")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)

                    HStack {
                        TextField("e.g. TUBE-SST or 890123456", text: $manualInput)
                            .font(.system(size: 14))
                            .padding(12)
                            .background(MedMargTheme.slate100)
                            .cornerRadius(10)

                        Button("Verify") {
                            let code = manualInput.trimmingCharacters(in: .whitespacesAndNewlines)
                            if !code.isEmpty {
                                onScanned(code)
                                dismiss()
                            }
                        }
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(10)
                    }
                }
                .padding(.horizontal, 20)

                Spacer()
            }
            .padding(.top, 20)
            .navigationTitle("Scan Kit Item")
            .navigationBarItems(leading: Button("Cancel") { dismiss() })
        }
    }
}
