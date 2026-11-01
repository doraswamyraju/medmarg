import SwiftUI

// =========================================================================
// ⚡ FREELANCE ORDERS VIEW (DEDICATED ORDERS TAB)
// 100% Live Backend Data from /api/v1/agent/roster
// Manages claimed overflow gigs and tracks bedside progress
// =========================================================================

struct FreelanceOrdersView: View {
    let user: UserProfile
    @Binding var selectedTab: Int
    @Binding var showSidebar: Bool

    // Live Orders State
    @State private var orders: [AgentPickupOrder] = []
    @State private var isLoading: Bool = true
    @State private var searchQuery: String = ""
    @State private var selectedFilterCategory: String = "ALL" // "ALL", "CLAIMED", "ON_THE_WAY", "COLLECTION", "HANDOVER"
    @State private var selectedDate: Date = Date()

    // Modals & Sheets
    @State private var selectedOrderDetail: AgentPickupOrder? = nil
    @State private var showTrackNavigateView: Bool = false
    @State private var activeVisitModalOrder: AgentPickupOrder? = nil
    @State private var activeAssessKitOrder: AgentPickupOrder? = nil
    @State private var activeDoorstepQrOrder: AgentPickupOrder? = nil
    @State private var showLabHandoverSheet: Bool = false
    @State private var showBroadcastGigsSheet: Bool = false
    @State private var actionBanner: String? = nil

    private var effectiveAgentId: String {
        user.username.isEmpty ? (user.id.isEmpty ? "AG-01" : user.id) : user.username
    }

    private var claimedCount: Int {
        orders.filter { $0.status == "BOOKED" || $0.status == "ASSIGNED" }.count
    }

    private var onTheWayCount: Int {
        orders.filter { $0.status == "KIT_ASSIGNED" || $0.status == "ENROUTE" || $0.status == "EN_ROUTE" }.count
    }

    private var collectionCount: Int {
        orders.filter { $0.status == "ARRIVED" || $0.status == "IN_PROGRESS" }.count
    }

    private var handoverCount: Int {
        orders.filter { $0.status == "SAMPLE_COLLECTED" || $0.status == "TRANSFERRED_TO_LAB" || $0.status == "DELIVERED" || $0.status == "COMPLETED" }.count
    }

    private var filteredOrders: [AgentPickupOrder] {
        var result = orders
        switch selectedFilterCategory {
        case "CLAIMED":
            result = result.filter { $0.status == "BOOKED" || $0.status == "ASSIGNED" }
        case "ON_THE_WAY":
            result = result.filter { $0.status == "KIT_ASSIGNED" || $0.status == "ENROUTE" || $0.status == "EN_ROUTE" }
        case "COLLECTION":
            result = result.filter { $0.status == "ARRIVED" || $0.status == "IN_PROGRESS" }
        case "HANDOVER":
            result = result.filter { $0.status == "SAMPLE_COLLECTED" || $0.status == "TRANSFERRED_TO_LAB" || $0.status == "DELIVERED" || $0.status == "COMPLETED" }
        default:
            break
        }

        if !searchQuery.trimmingCharacters(in: .whitespaces).isEmpty {
            let q = searchQuery.lowercased()
            result = result.filter {
                $0.effectivePatientName.lowercased().contains(q) ||
                $0.id.lowercased().contains(q) ||
                ($0.address?.lowercased().contains(q) ?? false) ||
                ($0.items?.lowercased().contains(q) ?? false)
            }
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
                unreadNotificationCount: 0,
                onToggleDuty: { _ in },
                onLogoTap: { selectedTab = 0 },
                onSidebarTap: { withAnimation { showSidebar.toggle() } },
                onNotificationTap: { },
                onProfileTap: { selectedTab = 4 },
                onLogoutTap: { }
            )

            ScrollView(showsIndicators: false) {
                VStack(spacing: 12) {
                    if let banner = actionBanner {
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill").foregroundColor(.white)
                            Text(banner).font(.system(size: 13, weight: .bold)).foregroundColor(.white)
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

                    // Available Gigs Marketplace Shortcut Banner
                    broadcastGigsShortcutBanner

                    // 4 Status Counters Row
                    statusCountersRow

                    // Search & Filter Bar
                    searchAndFilterSection

                    // Orders List
                    if isLoading {
                        VStack(spacing: 12) {
                            ProgressView().tint(MedMargTheme.primaryTeal)
                            Text("Loading claimed gigs...")
                                .font(.system(size: 12))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        .padding(.top, 40)
                    } else if filteredOrders.isEmpty {
                        emptyGigsView
                    } else {
                        VStack(spacing: 12) {
                            ForEach(filteredOrders) { order in
                                orderCard(order)
                            }
                        }
                        .padding(.horizontal, 16)
                    }

                    Spacer().frame(height: 120)
                }
                .padding(.top, 8)
            }
            .refreshable {
                await fetchLiveRoster()
            }
        }
        .background(MedMargTheme.slate50.ignoresSafeArea())
        .onAppear {
            Task { await fetchLiveRoster() }
        }
        .sheet(item: $selectedOrderDetail) { order in
            AgentOrderDetailView(
                order: order,
                onBack: {
                    selectedOrderDetail = nil
                    Task { await fetchLiveRoster() }
                },
                onOrderUpdated: {
                    Task { await fetchLiveRoster() }
                }
            )
        }
        .sheet(item: $activeAssessKitOrder) { order in
            FreelanceAssessAssignKitModal(
                order: order,
                onAssigned: {
                    actionBanner = "Field kit verified and assigned for order \(order.id)."
                    Task { await fetchLiveRoster() }
                }
            )
        }
        .sheet(item: $activeVisitModalOrder) { order in
            AgentDoorstepVisitModal(
                order: order,
                onVisitCompleted: { duration in
                    actionBanner = "Sample collected for #\(order.id) in \(duration)m! Stored in cold bag."
                    Task { await fetchLiveRoster() }
                },
                onTriggerPaymentModal: {
                    activeDoorstepQrOrder = order
                },
                onTriggerReviewModal: { }
            )
        }
        .sheet(item: $activeDoorstepQrOrder) { order in
            AgentDoorstepQrPaymentModal(order: order) {
                actionBanner = "Doorstep QR Payment recorded for #\(order.id)"
                Task { await fetchLiveRoster() }
            }
        }
        .sheet(isPresented: $showBroadcastGigsSheet) {
            FreelanceBroadcastJobsView(
                user: user,
                onJobClaimed: { newOrder in
                    actionBanner = "⚡ Claimed order \(newOrder.id)! Added to active pickups."
                    Task { await fetchLiveRoster() }
                }
            )
        }
        .sheet(isPresented: $showLabHandoverSheet) {
            AgentLabHandoverView(
                agentId: effectiveAgentId,
                agentName: user.name,
                onHandoverCompleted: {
                    actionBanner = "Lab Handover completed successfully!"
                    Task { await fetchLiveRoster() }
                }
            )
        }
    }

    // ==========================================
    // BROADCAST GIGS SHORTCUT BANNER
    // ==========================================
    private var broadcastGigsShortcutBanner: some View {
        Button(action: { showBroadcastGigsSheet = true }) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.accentEmerald)
                        .frame(width: 36, height: 36)
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 16))
                        .foregroundColor(.white)
                }

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text("Broadcast Gig Feed")
                            .font(.system(size: 13, weight: .black))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("OPEN GIGS")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(MedMargTheme.accentEmerald)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(MedMargTheme.accentEmerald.opacity(0.12))
                            .cornerRadius(4)
                    }
                    Text("Tap to browse nearby unassigned overflow pickups")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate600)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate400)
            }
            .padding(12)
            .background(Color.white)
            .cornerRadius(14)
            .padding(.horizontal, 16)
            .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
        }
        .buttonStyle(PlainButtonStyle())
    }

    // ==========================================
    // 4 STATUS COUNTERS ROW
    // ==========================================
    private var statusCountersRow: some View {
        HStack(spacing: 8) {
            counterCard(title: "Claimed", count: claimedCount, color: Color.blue, tabKey: "CLAIMED")
            counterCard(title: "On the Way", count: onTheWayCount, color: Color.orange, tabKey: "ON_THE_WAY")
            counterCard(title: "Collection", count: collectionCount, color: MedMargTheme.primaryTeal, tabKey: "COLLECTION")
            counterCard(title: "Handover", count: handoverCount, color: MedMargTheme.accentEmerald, tabKey: "HANDOVER")
        }
        .padding(.horizontal, 16)
    }

    private func counterCard(title: String, count: Int, color: Color, tabKey: String) -> some View {
        let isSel = selectedFilterCategory == tabKey
        return Button(action: {
            withAnimation(.spring(response: 0.25)) {
                selectedFilterCategory = isSel ? "ALL" : tabKey
            }
        }) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.slate500)
                Text("\(count)")
                    .font(.system(size: 16, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)
                Text("Gigs")
                    .font(.system(size: 9))
                    .foregroundColor(color)
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSel ? color : Color.clear, lineWidth: 2)
            )
            .shadow(color: Color.black.opacity(0.03), radius: 4, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }

    // ==========================================
    // SEARCH & FILTER BAR
    // ==========================================
    private var searchAndFilterSection: some View {
        VStack(spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(MedMargTheme.slate400)
                TextField("Search patient, ID, tests, area...", text: $searchQuery)
                    .font(.system(size: 13))
                if !searchQuery.isEmpty {
                    Button(action: { searchQuery = "" }) {
                        Image(systemName: "xmark.circle.fill").foregroundColor(MedMargTheme.slate400)
                    }
                }
            }
            .padding(10)
            .background(Color.white)
            .cornerRadius(12)
            .padding(.horizontal, 16)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    segmentTab(title: "All Gigs (\(orders.count))", key: "ALL")
                    segmentTab(title: "Claimed (\(claimedCount))", key: "CLAIMED")
                    segmentTab(title: "En Route (\(onTheWayCount))", key: "ON_THE_WAY")
                    segmentTab(title: "At Doorstep (\(collectionCount))", key: "COLLECTION")
                    segmentTab(title: "Delivered (\(handoverCount))", key: "HANDOVER")
                }
                .padding(.horizontal, 16)
            }
        }
    }

    private func segmentTab(title: String, key: String) -> some View {
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
    // ORDER CARD
    // ==========================================
    private func orderCard(_ order: AgentPickupOrder) -> some View {
        let isCompleted = order.status == "SAMPLE_COLLECTED" || order.status == "TRANSFERRED_TO_LAB" || order.status == "COMPLETED"

        return VStack(alignment: .leading, spacing: 10) {
            // Header Row: Time Box, Name, Age, Status Chip
            HStack(alignment: .top, spacing: 10) {
                VStack(spacing: 2) {
                    Text(order.slot ?? "07:30 AM")
                        .font(.system(size: 11, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                        .multilineTextAlignment(.center)
                    Text(order.date ?? "Today")
                        .font(.system(size: 9))
                        .foregroundColor(MedMargTheme.slate500)
                }
                .padding(8)
                .background(MedMargTheme.slate100)
                .cornerRadius(8)

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 4) {
                        Text(order.id)
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                        Spacer()
                        if order.isPaid {
                            Text("Prepaid")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(Color.blue)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.blue.opacity(0.12))
                                .cornerRadius(4)
                        } else {
                            Text("Pay at Doorstep")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(Color.orange)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.orange.opacity(0.12))
                                .cornerRadius(4)
                        }
                    }

                    Text(order.effectivePatientName)
                        .font(.system(size: 15, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)

                    HStack(spacing: 4) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate400)
                        Text(order.address ?? "Tirupati Doorstep")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate600)
                            .lineLimit(1)
                    }
                }
            }

            // Diagnostic Tests
            HStack(spacing: 6) {
                Image(systemName: "cross.fill")
                    .font(.system(size: 10))
                    .foregroundColor(MedMargTheme.primaryTeal)
                Text(order.items ?? "Diagnostic Collection")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate800)
                    .lineLimit(1)
            }

            Divider()

            // Footer: Payout info & Action Button
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 1) {
                    Text("Gig Payout")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(MedMargTheme.slate400)
                    Text("₹350")
                        .font(.system(size: 16, weight: .black))
                        .foregroundColor(MedMargTheme.accentEmerald)
                }

                Spacer()

                if isCompleted {
                    HStack(spacing: 4) {
                        Image(systemName: "checkmark.circle.fill")
                        Text("Sample in Cold Bag")
                    }
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.accentEmerald)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(MedMargTheme.accentEmerald.opacity(0.12))
                    .cornerRadius(10)
                } else {
                    Button(action: { selectedOrderDetail = order }) {
                        HStack(spacing: 4) {
                            Text("View Visit")
                            Image(systemName: "chevron.right")
                        }
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(10)
                    }
                }
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
    }

    private var emptyGigsView: some View {
        VStack(spacing: 16) {
            Image(systemName: "shippingbox")
                .font(.system(size: 44))
                .foregroundColor(MedMargTheme.slate300)
            Text("No Active Pickups")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(MedMargTheme.slate700)
            Text("Claim open overflow gigs from the marketplace broadcast feed above to start earning.")
                .font(.system(size: 12))
                .foregroundColor(MedMargTheme.slate500)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            Button(action: { showBroadcastGigsSheet = true }) {
                HStack(spacing: 6) {
                    Image(systemName: "bolt.fill")
                    Text("Browse Open Gigs")
                }
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(.white)
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(MedMargTheme.accentEmerald)
                .cornerRadius(10)
            }
        }
        .padding(.top, 40)
    }

    private func fetchLiveRoster() async {
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/roster?agentId=\(effectiveAgentId)") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let arr = (json["roster"] as? [[String: Any]]) ?? (json["orders"] as? [[String: Any]]) {
                let parsed: [AgentPickupOrder] = arr.compactMap { d in
                    guard let id = d["id"] as? String else { return nil }
                    return AgentPickupOrder(
                        id: id,
                        patientName: d["patientName"] as? String,
                        careSeekerName: d["careSeekerName"] as? String,
                        phone: d["phone"] as? String,
                        patientPhone: d["patientPhone"] as? String,
                        city: d["city"] as? String,
                        address: d["address"] as? String,
                        items: d["items"] as? String,
                        totalPersons: d["totalPersons"] as? Int,
                        selectedLabProvider: d["selectedLabProvider"] as? String,
                        labName: d["labName"] as? String,
                        amount: d["amount"] as? Int,
                        totalAmount: d["totalAmount"] as? Int,
                        status: d["status"] as? String,
                        assignedAgent: d["assignedAgent"] as? String,
                        phleboName: d["phleboName"] as? String,
                        phleboPhone: d["phleboPhone"] as? String,
                        phleboRating: d["phleboRating"] as? String,
                        otp: d["otp"] as? String,
                        handoverOtp: d["handoverOtp"] as? String,
                        slot: d["slot"] as? String ?? d["time"] as? String,
                        date: d["date"] as? String,
                        eta: d["eta"] as? String,
                        tempTelemetry: d["tempTelemetry"] as? String,
                        paymentMode: d["paymentMode"] as? String,
                        paymentStatus: d["paymentStatus"] as? String,
                        barcode: d["barcode"] as? String,
                        arrivalPhoto: d["arrivalPhoto"] as? String,
                        samplePhotos: d["samplePhotos"] as? [String],
                        reviewRequestSent: d["reviewRequestSent"] as? Bool,
                        reviewStatus: d["reviewStatus"] as? String,
                        phleboVitals: nil,
                        kitAssigned: d["kitAssigned"] as? Bool,
                        kitNotRequired: d["kitNotRequired"] as? Bool,
                        tripStartedAt: d["tripStartedAt"] as? String,
                        transactionId: d["transactionId"] as? String,
                        paymentNotes: d["paymentNotes"] as? String
                    )
                }
                await MainActor.run {
                    self.orders = parsed
                    self.isLoading = false
                }
            }
        } catch {
            await MainActor.run { self.isLoading = false }
        }
    }
}
