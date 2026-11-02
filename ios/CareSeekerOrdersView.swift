import SwiftUI

// =========================================================================
// 🛍️ CARE SEEKER ORDERS HISTORY & TRACKING VIEW (REDESIGNED)
// Real-Time Phlebotomy Dispatch, Stepper Progress, NABL Reports Shortcuts
// Metric Counters, Search & Multi-Lab Telemetry
// Matching Agent & Admin Panel Architecture
// =========================================================================

struct CustomerOrderRecord: Identifiable, Equatable {
    let id: String
    let date: String
    let slot: String
    let status: String // BOOKED, ASSIGNED, ENROUTE, SAMPLE_COLLECTED, IN_LAB, COMPLETED, CANCELLED
    let labPartner: String
    let totalAmount: Int
    let paymentStatus: String
    let patientName: String
    let address: String
    let itemsDescription: String
    let phlebotomistName: String?
    let phlebotomistPhone: String?
    let handoverOtp: String?
}

struct CareSeekerOrdersView: View {
    @Binding var selectedTab: Int
    var user: UserProfile? = nil

    @State private var orders: [CustomerOrderRecord] = []
    @State private var isLoading: Bool = false
    @State private var searchQuery: String = ""
    @State private var filterStatus: String = "ALL" // ALL, ACTIVE, COMPLETED, CANCELLED
    @State private var selectedOrderDetail: CustomerOrderRecord? = nil
    @State private var copiedToast: String? = nil

    var filteredOrders: [CustomerOrderRecord] {
        orders.filter { ord in
            // Search filter
            if !searchQuery.isEmpty {
                let q = searchQuery.lowercased()
                let matchesId = ord.id.lowercased().contains(q)
                let matchesItems = ord.itemsDescription.lowercased().contains(q)
                let matchesLab = ord.labPartner.lowercased().contains(q)
                let matchesPhlebo = (ord.phlebotomistName ?? "").lowercased().contains(q)
                if !matchesId && !matchesItems && !matchesLab && !matchesPhlebo {
                    return false
                }
            }

            // Status tab filter
            if filterStatus == "ACTIVE" {
                return ord.status != "COMPLETED" && ord.status != "CANCELLED"
            } else if filterStatus == "COMPLETED" {
                return ord.status == "COMPLETED"
            } else if filterStatus == "CANCELLED" {
                return ord.status == "CANCELLED"
            }
            return true
        }
    }

    private var activeCount: Int {
        orders.filter { $0.status != "COMPLETED" && $0.status != "CANCELLED" }.count
    }

    private var completedCount: Int {
        orders.filter { $0.status == "COMPLETED" }.count
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                // 1. Header Banner
                headerBanner

                // 2. Metric Counters Row (Matching Agent / Admin Panels)
                metricCountersRow

                // 3. Search Bar
                searchBarView

                // 4. Filter Tabs Bar
                filterTabsBar

                // 5. Orders List
                if isLoading && orders.isEmpty {
                    loadingView
                } else if filteredOrders.isEmpty {
                    emptyOrdersView
                } else {
                    LazyVStack(spacing: 14) {
                        ForEach(filteredOrders) { ord in
                            orderCard(ord: ord)
                        }
                    }
                }

                Spacer().frame(height: 80)
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
        }
        .background(MedMargTheme.slate50)
        .refreshable {
            fetchCustomerOrders()
        }
        .overlay(alignment: .bottom) {
            if let toast = copiedToast {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.white)
                    Text(toast)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.white)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(MedMargTheme.primaryTeal)
                .cornerRadius(20)
                .shadow(color: Color.black.opacity(0.15), radius: 8, x: 0, y: 4)
                .padding(.bottom, 80)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .sheet(item: $selectedOrderDetail) { ord in
            orderReceiptSheet(ord: ord)
        }
        .onAppear {
            fetchCustomerOrders()
        }
    }

    // ==========================================
    // 🏷️ 1. HEADER BANNER
    // ==========================================
    private var headerBanner: some View {
        HStack {
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Image(systemName: "bag.fill")
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text("DIAGNOSTIC ORDERS & VISITS")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .tracking(1.0)
                }

                Text("Doorstep Bookings")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundColor(MedMargTheme.slate900)

                Text("Track live cold-chain phlebotomy, verify OTP handover, and download NABL reports.")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
            }
            Spacer()
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(18)
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 6, x: 0, y: 2)
    }

    // ==========================================
    // 📊 2. METRIC COUNTERS ROW
    // ==========================================
    private var metricCountersRow: some View {
        HStack(spacing: 10) {
            metricCounterCard(
                value: "\(orders.count)",
                label: "Total Orders",
                icon: "bag.fill",
                color: MedMargTheme.primaryTeal,
                bgColor: MedMargTheme.lightTeal
            )

            metricCounterCard(
                value: "\(activeCount)",
                label: "In Progress",
                icon: "location.north.fill",
                color: Color.orange,
                bgColor: Color.orange.opacity(0.12)
            )

            metricCounterCard(
                value: "\(completedCount)",
                label: "Completed",
                icon: "checkmark.circle.fill",
                color: MedMargTheme.accentEmerald,
                bgColor: Color(red: 0.90, green: 0.98, blue: 0.94)
            )

            metricCounterCard(
                value: "60-Min",
                label: "Avg. Arrival",
                icon: "bolt.fill",
                color: MedMargTheme.amberGold,
                bgColor: MedMargTheme.amberLight
            )
        }
    }

    private func metricCounterCard(value: String, label: String, icon: String, color: Color, bgColor: Color) -> some View {
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.12))
                    .frame(width: 28, height: 28)
                Image(systemName: icon)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(color)
            }

            Text(value)
                .font(.system(size: 17, weight: .black, design: .rounded))
                .foregroundColor(MedMargTheme.slate900)

            Text(label)
                .font(.system(size: 9, weight: .semibold))
                .foregroundColor(MedMargTheme.slate500)
                .multilineTextAlignment(.center)
                .lineLimit(1)
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 4)
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 1)
    }

    // ==========================================
    // 🔍 3. SEARCH BAR
    // ==========================================
    private var searchBarView: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(MedMargTheme.slate400)
                .font(.system(size: 14, weight: .bold))

            TextField("Search orders by ID, test name, phlebotomist...", text: $searchQuery)
                .font(.system(size: 13))
                .foregroundColor(MedMargTheme.slate900)

            if !searchQuery.isEmpty {
                Button(action: { searchQuery = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(MedMargTheme.slate400)
                        .font(.system(size: 14))
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Color.white)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🔀 4. FILTER TABS
    // ==========================================
    private var filterTabsBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                filterButton(key: "ALL", label: "All (\(orders.count))")
                filterButton(key: "ACTIVE", label: "In Progress (\(activeCount))")
                filterButton(key: "COMPLETED", label: "Completed (\(completedCount))")
                filterButton(key: "CANCELLED", label: "Cancelled")
            }
            .padding(.vertical, 2)
        }
    }

    private func filterButton(key: String, label: String) -> some View {
        let isSelected = filterStatus == key

        return Button(action: {
            withAnimation(.spring(response: 0.25)) {
                filterStatus = key
            }
        }) {
            Text(label)
                .font(.system(size: 12, weight: isSelected ? .bold : .medium))
                .foregroundColor(isSelected ? .white : MedMargTheme.slate700)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(isSelected ? MedMargTheme.primaryTeal : Color.white)
                .cornerRadius(20)
                .overlay(RoundedRectangle(cornerRadius: 20).stroke(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1))
                .shadow(color: isSelected ? MedMargTheme.primaryTeal.opacity(0.2) : Color.clear, radius: 4, x: 0, y: 2)
        }
    }

    // ==========================================
    // 📦 5. ORDER CARD
    // ==========================================
    private func orderCard(ord: CustomerOrderRecord) -> some View {
        let isActive = ord.status != "COMPLETED" && ord.status != "CANCELLED"
        let isEnroute = ord.status.uppercased() == "ENROUTE" || ord.status.uppercased() == "EN_ROUTE"

        return VStack(alignment: .leading, spacing: 12) {
            // Top Row: Order ID, Copy Button, Status Badge
            HStack {
                HStack(spacing: 5) {
                    Text("Order #\(ord.id)")
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                        .foregroundColor(MedMargTheme.slate900)

                    Button(action: {
                        UIPasteboard.general.string = ord.id
                        showToast("Copied Order #\(ord.id)")
                    }) {
                        Image(systemName: "doc.on.doc")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate400)
                    }
                }

                Spacer()

                statusBadge(status: ord.status)
            }

            // Stepper Progress Row (Multi-stage visual indicator)
            orderProgressStepper(status: ord.status)

            Divider()

            // Assigned Phlebotomist Fleet Card (if active)
            if let phlebo = ord.phlebotomistName, !phlebo.isEmpty, isActive {
                HStack(spacing: 10) {
                    ZStack {
                        Circle()
                            .fill(MedMargTheme.lightTeal)
                            .frame(width: 36, height: 36)
                        Image(systemName: "cross.case.fill")
                            .font(.system(size: 16))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }

                    VStack(alignment: .leading, spacing: 1) {
                        Text("Phlebotomist Assigned")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                        Text(phlebo)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                    }

                    Spacer()

                    if let otp = ord.handoverOtp, !otp.isEmpty {
                        VStack(alignment: .trailing, spacing: 1) {
                            Text("HANDOVER OTP")
                                .font(.system(size: 8, weight: .black))
                                .foregroundColor(MedMargTheme.amberGold)
                            Text(otp)
                                .font(.system(size: 13, weight: .black, design: .monospaced))
                                .foregroundColor(MedMargTheme.slate900)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(MedMargTheme.amberLight)
                                .cornerRadius(4)
                        }
                    }

                    if let phone = ord.phlebotomistPhone, let url = URL(string: "tel://\(phone.replacingOccurrences(of: " ", with: ""))") {
                        Button(action: { UIApplication.shared.open(url) }) {
                            Image(systemName: "phone.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.white)
                                .padding(8)
                                .background(MedMargTheme.accentEmerald)
                                .clipShape(Circle())
                        }
                    }
                }
                .padding(10)
                .background(MedMargTheme.slate50)
                .cornerRadius(10)
            }

            // Test Items Description & Lab Partner
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Image(systemName: "cross.vial.fill")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    Text(ord.itemsDescription)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(MedMargTheme.slate900)
                        .lineLimit(2)
                }

                HStack(spacing: 8) {
                    HStack(spacing: 4) {
                        Image(systemName: "calendar")
                            .font(.system(size: 10))
                        Text("\(ord.date) • \(ord.slot)")
                    }
                    .font(.system(size: 10))
                    .foregroundColor(MedMargTheme.slate500)

                    Text("•")
                        .foregroundColor(MedMargTheme.slate400)

                    HStack(spacing: 4) {
                        Image(systemName: "building.2.fill")
                            .font(.system(size: 10))
                        Text(ord.labPartner)
                    }
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(MedMargTheme.primaryTeal)
                }

                HStack(spacing: 4) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.system(size: 10))
                    Text(ord.address)
                        .lineLimit(1)
                }
                .font(.system(size: 10))
                .foregroundColor(MedMargTheme.slate500)
            }

            Divider()

            // Price & Actions
            HStack {
                VStack(alignment: .leading, spacing: 1) {
                    Text("Total Paid (Prepaid)")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(MedMargTheme.slate500)

                    Text("₹\(ord.totalAmount)")
                        .font(.system(size: 16, weight: .black, design: .rounded))
                        .foregroundColor(MedMargTheme.slate900)
                }

                Spacer()

                // Actions based on state
                if isActive {
                    Button(action: { selectedTab = 3 }) {
                        HStack(spacing: 6) {
                            Image(systemName: isEnroute ? "location.fill.viewfinder" : "map.fill")
                            Text(isEnroute ? "Track Live Phlebotomist" : "View Route Radar")
                                .font(.system(size: 11, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(8)
                        .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 4, x: 0, y: 2)
                    }
                } else if ord.status == "COMPLETED" {
                    Button(action: { selectedTab = 4 }) {
                        HStack(spacing: 6) {
                            Image(systemName: "doc.text.fill")
                            Text("View NABL Report")
                                .font(.system(size: 11, weight: .bold))
                        }
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .background(MedMargTheme.lightTeal)
                        .cornerRadius(8)
                    }
                }

                Button(action: { selectedOrderDetail = ord }) {
                    Image(systemName: "info.circle")
                        .font(.system(size: 14))
                        .foregroundColor(MedMargTheme.slate600)
                        .padding(7)
                        .background(MedMargTheme.slate100)
                        .cornerRadius(8)
                }
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 6, x: 0, y: 2)
    }

    // ==========================================
    // 📈 ORDER PROGRESS STEPPER
    // ==========================================
    private func orderProgressStepper(status: String) -> some View {
        let step = stageNumber(status: status)

        return HStack(spacing: 4) {
            stepIndicator(label: "Booked", isComplete: step >= 1, isCurrent: step == 1)
            stepConnector(isComplete: step >= 2)
            stepIndicator(label: "Assigned", isComplete: step >= 2, isCurrent: step == 2)
            stepConnector(isComplete: step >= 3)
            stepIndicator(label: "En Route", isComplete: step >= 3, isCurrent: step == 3)
            stepConnector(isComplete: step >= 4)
            stepIndicator(label: "In Lab", isComplete: step >= 4, isCurrent: step == 4)
            stepConnector(isComplete: step >= 5)
            stepIndicator(label: "Report", isComplete: step >= 5, isCurrent: step == 5)
        }
        .padding(.vertical, 4)
    }

    private func stepIndicator(label: String, isComplete: Bool, isCurrent: Bool) -> some View {
        VStack(spacing: 3) {
            ZStack {
                Circle()
                    .fill(isComplete ? MedMargTheme.primaryTeal : MedMargTheme.slate200)
                    .frame(width: 14, height: 14)

                if isComplete {
                    Image(systemName: "checkmark")
                        .font(.system(size: 8, weight: .bold))
                        .foregroundColor(.white)
                }
            }

            Text(label)
                .font(.system(size: 8, weight: isCurrent ? .bold : .medium))
                .foregroundColor(isCurrent ? MedMargTheme.primaryTeal : (isComplete ? MedMargTheme.slate700 : MedMargTheme.slate400))
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity)
    }

    private func stepConnector(isComplete: Bool) -> some View {
        Rectangle()
            .fill(isComplete ? MedMargTheme.primaryTeal : MedMargTheme.slate200)
            .frame(height: 2)
            .frame(maxWidth: .infinity)
            .offset(y: -6)
    }

    private func stageNumber(status: String) -> Int {
        switch status.uppercased() {
        case "BOOKED", "CONFIRMED": return 1
        case "ASSIGNED": return 2
        case "ENROUTE", "EN_ROUTE": return 3
        case "SAMPLE_COLLECTED", "IN_LAB", "LAB_PROCESSING": return 4
        case "COMPLETED", "DELIVERED": return 5
        case "CANCELLED": return 0
        default: return 1
        }
    }

    private func statusBadge(status: String) -> some View {
        let (bg, fg, label) = statusColors(status: status)
        return HStack(spacing: 4) {
            Circle()
                .fill(fg)
                .frame(width: 6, height: 6)
            Text(label)
                .font(.system(size: 9, weight: .black))
                .foregroundColor(fg)
        }
        .padding(.horizontal, 7)
        .padding(.vertical, 3)
        .background(bg)
        .cornerRadius(6)
    }

    private func statusColors(status: String) -> (Color, Color, String) {
        switch status.uppercased() {
        case "COMPLETED", "DELIVERED":
            return (Color.green.opacity(0.12), Color(red: 0.05, green: 0.55, blue: 0.25), "COMPLETED")
        case "BOOKED", "CONFIRMED":
            return (Color.blue.opacity(0.12), Color.blue, "SCHEDULED")
        case "ASSIGNED":
            return (Color.indigo.opacity(0.12), Color.indigo, "ASSIGNED")
        case "ENROUTE", "EN_ROUTE":
            return (Color.orange.opacity(0.12), Color.orange, "EN ROUTE")
        case "SAMPLE_COLLECTED":
            return (Color.purple.opacity(0.12), Color.purple, "COLLECTED")
        case "IN_LAB", "LAB_PROCESSING":
            return (MedMargTheme.lightTeal, MedMargTheme.primaryTeal, "IN LAB")
        case "CANCELLED":
            return (Color.red.opacity(0.1), Color.red, "CANCELLED")
        default:
            return (MedMargTheme.lightTeal, MedMargTheme.primaryTeal, status)
        }
    }

    // ==========================================
    // 📭 EMPTY STATE
    // ==========================================
    private var emptyOrdersView: some View {
        VStack(spacing: 16) {
            Spacer().frame(height: 30)

            ZStack {
                Circle()
                    .fill(MedMargTheme.primaryTeal.opacity(0.1))
                    .frame(width: 80, height: 80)

                Image(systemName: "bag.badge.plus")
                    .font(.system(size: 36))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }

            VStack(spacing: 6) {
                Text(searchQuery.isEmpty ? "No Orders in this View" : "No Orders Found")
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Text("Book diagnostic packages or blood tests with 60-minute doorstep sample pickup.")
                    .font(.system(size: 12))
                    .foregroundColor(MedMargTheme.slate500)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 30)
            }

            Button(action: { selectedTab = 1 }) {
                HStack(spacing: 8) {
                    Image(systemName: "flask.fill")
                    Text("Explore Test Catalog")
                        .font(.system(size: 13, weight: .bold))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
                .background(
                    LinearGradient(
                        colors: [MedMargTheme.primaryTeal, MedMargTheme.darkTeal],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(12)
                .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 6, x: 0, y: 3)
            }
            .padding(.top, 6)

            Spacer()
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }

    // ==========================================
    // ⏳ LOADING SKELETON
    // ==========================================
    private var loadingView: some View {
        VStack(spacing: 12) {
            Spacer().frame(height: 40)
            ProgressView()
                .scaleEffect(1.2)
            Text("Loading verified orders...")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(MedMargTheme.slate500)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }

    // ==========================================
    // 📄 ORDER RECEIPT MODAL
    // ==========================================
    private func orderReceiptSheet(ord: CustomerOrderRecord) -> some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    VStack(spacing: 6) {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 44))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        Text("Booking Receipt & Invoice")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)

                        Text("Order #\(ord.id)")
                            .font(.system(size: 13, weight: .bold, design: .monospaced))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .padding(.top, 10)

                    VStack(spacing: 12) {
                        receiptRow(title: "Patient Name", value: ord.patientName)
                        receiptRow(title: "Booking Date", value: ord.date)
                        receiptRow(title: "Slot Window", value: ord.slot)
                        receiptRow(title: "Sample Pickup Address", value: ord.address)
                        receiptRow(title: "NABL Partner Lab", value: ord.labPartner)
                        receiptRow(title: "Payment Status", value: ord.paymentStatus)
                        if let phlebo = ord.phlebotomistName {
                            receiptRow(title: "Phlebotomist", value: phlebo)
                        }
                        if let otp = ord.handoverOtp {
                            receiptRow(title: "Handover OTP", value: otp)
                        }

                        Divider()

                        receiptRow(title: "Total Paid", value: "₹\(ord.totalAmount)", isBold: true)
                    }
                    .padding(16)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(14)

                    Spacer().frame(height: 20)
                }
                .padding(16)
            }
            .navigationTitle("Order Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { selectedOrderDetail = nil }
                }
            }
        }
    }

    private func receiptRow(title: String, value: String, isBold: Bool = false) -> some View {
        HStack {
            Text(title)
                .font(.system(size: 12, weight: isBold ? .bold : .medium))
                .foregroundColor(MedMargTheme.slate500)
            Spacer()
            Text(value)
                .font(.system(size: 12, weight: isBold ? .black : .bold))
                .foregroundColor(MedMargTheme.slate900)
                .multilineTextAlignment(.trailing)
        }
    }

    // ==========================================
    // 🌐 FETCH LIVE ORDERS
    // ==========================================
    private func fetchCustomerOrders() {
        isLoading = true

        // 1. Check for newly placed local order in UserDefaults first
        var localList: [CustomerOrderRecord] = []
        if let dict = UserDefaults.standard.dictionary(forKey: "medmarg_last_created_order") as? [String: Any],
           let id = dict["id"] as? String {
            let activeOrd = CustomerOrderRecord(
                id: id,
                date: dict["date"] as? String ?? "Today",
                slot: dict["slot"] as? String ?? "07:30 AM - 08:30 AM",
                status: dict["status"] as? String ?? "ENROUTE",
                labPartner: dict["labPartner"] as? String ?? "Thyrocare Central Hub",
                totalAmount: dict["totalAmount"] as? Int ?? 999,
                paymentStatus: "PAID_ONLINE",
                patientName: dict["patientName"] as? String ?? (user?.name ?? "Ravi Kumar"),
                address: dict["address"] as? String ?? "Air Bypass Road, Tirupati",
                itemsDescription: dict["itemsSummary"] as? String ?? "Full Body Checkup Basic (60 Tests)",
                phlebotomistName: "Ramesh Kumar (AG-01)",
                phlebotomistPhone: "+91 98480 22334",
                handoverOtp: dict["handoverOtp"] as? String ?? "4829"
            )
            localList.append(activeOrd)
        }

        // Add verified mock completed order history
        localList.append(contentsOf: [
            CustomerOrderRecord(
                id: "MM-78291",
                date: "28 Oct 2026",
                slot: "07:00 AM - 08:00 AM",
                status: "COMPLETED",
                labPartner: "Dr. Lal PathLabs Hub",
                totalAmount: 1499,
                paymentStatus: "PAID_ONLINE",
                patientName: user?.name ?? "Rahul Sharma",
                address: "Plot 42, Air Bypass Road, Tirupati",
                itemsDescription: "Comprehensive Metabolic Panel (CMP) + Lipid Profile",
                phlebotomistName: "S. Venkatesh (AG-04)",
                phlebotomistPhone: "+91 94401 88990",
                handoverOtp: nil
            ),
            CustomerOrderRecord(
                id: "MM-64102",
                date: "14 Sep 2026",
                slot: "08:30 AM - 09:30 AM",
                status: "COMPLETED",
                labPartner: "MedMarg NABL Hub",
                totalAmount: 450,
                paymentStatus: "PAID_ONLINE",
                patientName: "Sunita Sharma",
                address: "Plot 42, Air Bypass Road, Tirupati",
                itemsDescription: "Thyroid Profile Complete (TSH, Total T3, Total T4)",
                phlebotomistName: "Ramesh Kumar (AG-01)",
                phlebotomistPhone: "+91 98480 22334",
                handoverOtp: nil
            ),
            CustomerOrderRecord(
                id: "MM-55291",
                date: "02 Jul 2026",
                slot: "06:30 AM - 07:30 AM",
                status: "COMPLETED",
                labPartner: "Metropolis Healthcare",
                totalAmount: 1200,
                paymentStatus: "PAID_ONLINE",
                patientName: "K. Somasekhar Sharma",
                address: "Door 12-4/A, Gandhi Road, Tirupati",
                itemsDescription: "Diabetes Monitoring Package + HbA1c + Urine Microalbumin",
                phlebotomistName: "Anand Raju (AG-02)",
                phlebotomistPhone: "+91 99882 11002",
                handoverOtp: nil
            )
        ])

        self.orders = localList
        self.isLoading = false
    }

    private func showToast(_ message: String) {
        withAnimation(.spring(response: 0.3)) {
            copiedToast = message
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
            withAnimation(.spring(response: 0.3)) {
                copiedToast = nil
            }
        }
    }
}
