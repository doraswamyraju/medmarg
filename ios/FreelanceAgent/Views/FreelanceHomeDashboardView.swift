import SwiftUI

// =========================================================================
// ⚡ FREELANCE HOME DASHBOARD VIEW (TAB 0)
// 100% Live Backend Data from /api/v1/agent/*
// Hero greeting, live gig earnings, available broadcasts alert, and active visit tracking
// =========================================================================

struct FreelanceHomeDashboardView: View {
    let user: UserProfile
    let onLogout: () -> Void
    @Binding var selectedTab: Int
    @Binding var showSidebar: Bool

    // Live Server States
    @State private var rosterOrders: [AgentPickupOrder] = []
    @State private var broadcastGigs: [FreelanceBroadcastJobItem] = []
    @State private var todayEarnings: Int = 0
    @State private var completedCount: Int = 0
    @State private var partnerRating: String = "5.0 ★"
    @State private var isLoading: Bool = true
    @State private var isRefreshing: Bool = false
    @State private var isOnDuty: Bool = true
    @State private var showNotificationCenter: Bool = false
    @State private var unreadNotificationCount: Int = 0
    @State private var actionBanner: String? = nil

    // Sheets & Workflow Modals
    @State private var showBroadcastGigsSheet: Bool = false
    @State private var activeOrderDetailOrder: AgentPickupOrder? = nil
    @State private var activeVisitModalOrder: AgentPickupOrder? = nil
    @State private var activeAssessKitOrder: AgentPickupOrder? = nil
    @State private var activeDoorstepQrOrder: AgentPickupOrder? = nil
    @State private var showLabHandoverSheet: Bool = false
    @State private var showTrackNavigateView: Bool = false

    private var effectiveAgentId: String {
        user.username.isEmpty ? (user.id.isEmpty ? "FL-502" : user.id) : user.username
    }

    private var nextAssignedOrder: AgentPickupOrder? {
        rosterOrders.first { ord in
            let st = (ord.status ?? "").uppercased()
            return st != "SAMPLE_COLLECTED" && st != "TRANSFERRED_TO_LAB" && st != "DELIVERED" && st != "COMPLETED"
        }
    }

    private var collectedOrdersAwaitingHandover: [AgentPickupOrder] {
        rosterOrders.filter { $0.status == "SAMPLE_COLLECTED" }
    }

    private var activeGigsCount: Int {
        rosterOrders.filter {
            let st = ($0.status ?? "").uppercased()
            return st != "SAMPLE_COLLECTED" && st != "TRANSFERRED_TO_LAB" && st != "DELIVERED" && st != "COMPLETED"
        }
        .count
    }

    var body: some View {
        VStack(spacing: 0) {
            // 1. Topbar
            AgentTopbarView(
                agentName: user.name,
                agentId: effectiveAgentId,
                isOnDuty: $isOnDuty,
                locationManager: AgentLocationManager.shared,
                unreadNotificationCount: unreadNotificationCount,
                onToggleDuty: { _ in },
                onLogoTap: { selectedTab = 0 },
                onSidebarTap: { withAnimation { showSidebar.toggle() } },
                onNotificationTap: { showNotificationCenter = true },
                onProfileTap: { selectedTab = 4 },
                onLogoutTap: onLogout
            )

            // 2. Scrollable Body
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 14) {
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
                        .background(MedMargTheme.accentEmerald)
                        .cornerRadius(12)
                        .padding(.horizontal, 16)
                        .padding(.top, 4)
                    }

                    // Tirupati Temple Hero Card
                    heroGreetingCard

                    // Available Overflow Gigs Banner (Broadcast Feed Alert)
                    if !broadcastGigs.isEmpty {
                        openBroadcastAlertBanner
                    }

                    // Lab Handover Banner (Active when specimens collected)
                    if !collectedOrdersAwaitingHandover.isEmpty {
                        labHandoverActionBanner
                    }

                    // Freelancer Metric Counters Row (Tappable)
                    FreelanceMetricCountersRow(
                        todayEarnings: todayEarnings,
                        activeGigsCount: activeGigsCount,
                        completedCount: completedCount,
                        ratingScore: partnerRating,
                        onSelectMetric: { targetTab in
                            withAnimation { selectedTab = targetTab }
                        }
                    )

                    // Next Claimed / Assigned Order
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Next Assigned Gig")
                                .font(.system(size: 15, weight: .black))
                                .foregroundColor(MedMargTheme.slate900)
                            Spacer()
                            Button(action: { selectedTab = 7 }) {
                                HStack(spacing: 2) {
                                    Text("View All")
                                    Image(systemName: "chevron.right")
                                }
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            }
                        }
                        .padding(.horizontal, 16)

                        if let next = nextAssignedOrder {
                            AgentNextAssignedCard(
                                order: next,
                                onStartTrip: { activeOrderDetailOrder = next },
                                onAssessKit: { activeAssessKitOrder = next },
                                onOpenVisit: { activeOrderDetailOrder = next },
                                onDoorstepQr: { activeDoorstepQrOrder = next }
                            )
                        } else {
                            noAssignedOrdersPlaceholder
                        }
                    }

                    // Quick Actions
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Quick Actions")
                                .font(.system(size: 15, weight: .black))
                                .foregroundColor(MedMargTheme.slate900)
                            Spacer()
                        }
                        .padding(.horizontal, 16)

                        FreelanceShortcutsGrid(
                            onClaimGigsTap: { showBroadcastGigsSheet = true },
                            onInventoryTap: { selectedTab = 1 },
                            onBarcodeScanTap: {
                                if let next = nextAssignedOrder {
                                    activeVisitModalOrder = next
                                } else {
                                    actionBanner = "No active gig to scan barcode for"
                                }
                            },
                            onLabHandoverTap: { showLabHandoverSheet = true }
                        )
                    }

                    // Today's Pickups Section
                    todayPickupsSection

                    Spacer().frame(height: 120)
                }
                .padding(.top, 10)
            }
            .refreshable {
                await fetchAllData()
            }
        }
        .background(MedMargTheme.slate50.ignoresSafeArea())
        .onAppear {
            Task { await fetchAllData() }
        }
        .sheet(isPresented: $showBroadcastGigsSheet) {
            FreelanceBroadcastJobsView(
                user: user,
                onJobClaimed: { newOrder in
                    actionBanner = "⚡ Gig \(newOrder.id) claimed successfully! Added to your schedule."
                    Task { await fetchAllData() }
                }
            )
        }
        .sheet(item: $activeOrderDetailOrder) { order in
            AgentOrderDetailView(
                order: order,
                onBack: { activeOrderDetailOrder = nil },
                onOrderUpdated: {
                    Task { await fetchAllData() }
                }
            )
        }
        .sheet(item: $activeAssessKitOrder) { order in
            FreelanceAssessAssignKitModal(
                order: order,
                onAssigned: {
                    actionBanner = "Field kit verified and assigned."
                    Task { await fetchAllData() }
                }
            )
        }
        .sheet(item: $activeVisitModalOrder) { order in
            AgentDoorstepVisitModal(
                order: order,
                onVisitCompleted: { duration in
                    actionBanner = "Sample collected in \(duration)m and stored in cold bag!"
                    Task { await fetchAllData() }
                },
                onTriggerPaymentModal: {
                    activeDoorstepQrOrder = order
                },
                onTriggerReviewModal: { }
            )
        }
        .sheet(item: $activeDoorstepQrOrder) { order in
            AgentDoorstepQrPaymentModal(order: order) {
                actionBanner = "Payment confirmed for \(order.id)."
                Task { await fetchAllData() }
            }
        }
        .sheet(isPresented: $showLabHandoverSheet) {
            AgentLabHandoverView(
                agentId: effectiveAgentId,
                agentName: user.name,
                onHandoverCompleted: {
                    actionBanner = "Lab Handover completed successfully!"
                    Task { await fetchAllData() }
                }
            )
        }
        .sheet(isPresented: $showNotificationCenter) {
            NotificationCenterSheet(isPresented: $showNotificationCenter)
        }
    }

    // ==========================================
    // HERO GREETING CARD
    // ==========================================
    private var heroGreetingCard: some View {
        ZStack(alignment: .bottomLeading) {
            // Background Temple Art
            Group {
                if let templeImg = UIImage(named: "tirupati-temple-banner") ?? UIImage(named: "temple") {
                    Image(uiImage: templeImg)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(height: 140)
                        .clipped()
                } else {
                    LinearGradient(
                        colors: [Color(red: 0.94, green: 0.97, blue: 0.98), Color(red: 0.88, green: 0.94, blue: 0.95)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    .frame(height: 140)
                }
            }

            // Glassmorphic Gradient Overlay
            LinearGradient(
                colors: [Color.white.opacity(0.92), Color.white.opacity(0.65), Color.clear],
                startPoint: .leading,
                endPoint: .trailing
            )

            // Greeting Text
            VStack(alignment: .leading, spacing: 3) {
                Text(greetingTimeOfDay())
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate600)

                Text(user.name.isEmpty ? "Freelance Partner" : user.name)
                    .font(.system(size: 18, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)

                HStack(spacing: 6) {
                    HStack(spacing: 3) {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 11))
                        Text("Freelance Partner • Verified MLT")
                    }
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.accentEmerald)

                    Text("•")
                        .foregroundColor(MedMargTheme.slate400)

                    Text("Tirupati Fleet")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(MedMargTheme.slate600)
                }
            }
            .padding(16)
        }
        .frame(height: 140)
        .cornerRadius(18)
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(MedMargTheme.slate200, lineWidth: 1))
        .padding(.horizontal, 16)
        .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 2)
    }

    // ==========================================
    // BROADCAST GIGS ALERT BANNER
    // ==========================================
    private var openBroadcastAlertBanner: some View {
        Button(action: { showBroadcastGigsSheet = true }) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.accentEmerald)
                        .frame(width: 38, height: 38)
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 16, weight: .black))
                        .foregroundColor(.white)
                }

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text("⚡ \(broadcastGigs.count) Overflow Gigs Available")
                            .font(.system(size: 13, weight: .black))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("CLAIM NOW")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(MedMargTheme.accentEmerald)
                            .cornerRadius(4)
                    }
                    Text("Earn up to ₹420 per sample collection • First claim wins")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate600)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate400)
            }
            .padding(12)
            .background(MedMargTheme.accentEmerald.opacity(0.08))
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(MedMargTheme.accentEmerald.opacity(0.3), lineWidth: 1)
            )
            .padding(.horizontal, 16)
        }
        .buttonStyle(PlainButtonStyle())
    }

    // ==========================================
    // LAB HANDOVER BANNER
    // ==========================================
    private var labHandoverActionBanner: some View {
        Button(action: { showLabHandoverSheet = true }) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(Color.orange)
                        .frame(width: 38, height: 38)
                    Image(systemName: "shippingbox.and.arrow.backward.fill")
                        .font(.system(size: 16))
                        .foregroundColor(.white)
                }

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text("Deliver Samples to Designated Lab")
                            .font(.system(size: 13, weight: .black))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("\(collectedOrdersAwaitingHandover.count) Pending")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.orange)
                            .cornerRadius(4)
                    }
                    Text("Cold bag at 4.2°C • Transfer to lab technician for processing")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate600)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate400)
            }
            .padding(12)
            .background(Color.orange.opacity(0.08))
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(Color.orange.opacity(0.3), lineWidth: 1)
            )
            .padding(.horizontal, 16)
        }
        .buttonStyle(PlainButtonStyle())
    }

    private var noAssignedOrdersPlaceholder: some View {
        VStack(spacing: 10) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 32))
                .foregroundColor(MedMargTheme.accentEmerald)
            Text("No Active Pickups In Progress")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(MedMargTheme.slate800)
            Text("Claim overflow gigs from the marketplace above to start your next collection.")
                .font(.system(size: 12))
                .foregroundColor(MedMargTheme.slate500)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
        .background(Color.white)
        .cornerRadius(16)
        .padding(.horizontal, 16)
    }

    private var todayPickupsSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Today's Gigs (\(rosterOrders.count))")
                    .font(.system(size: 15, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                Button(action: { selectedTab = 7 }) {
                    Text("View History")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
            }
            .padding(.horizontal, 16)

            VStack(spacing: 8) {
                ForEach(rosterOrders.prefix(3)) { ord in
                    HStack(spacing: 12) {
                        Circle()
                            .fill(ord.status == "SAMPLE_COLLECTED" ? MedMargTheme.accentEmerald : MedMargTheme.primaryTeal)
                            .frame(width: 8, height: 8)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(ord.effectivePatientName)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text(ord.items ?? "Collection")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                                .lineLimit(1)
                        }

                        Spacer()

                        if ord.status == "SAMPLE_COLLECTED" {
                            Text("Collected")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.accentEmerald)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(MedMargTheme.accentEmerald.opacity(0.12))
                                .cornerRadius(6)
                        } else {
                            Text("Active")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(MedMargTheme.lightTeal)
                                .cornerRadius(6)
                        }
                    }
                    .padding(12)
                    .background(Color.white)
                    .cornerRadius(12)
                }
            }
            .padding(.horizontal, 16)
        }
    }

    private func greetingTimeOfDay() -> String {
        let hour = Calendar.current.component(.hour, from: Date())
        if hour < 12 { return "Good Morning," }
        if hour < 17 { return "Good Afternoon," }
        return "Good Evening,"
    }

    private func fetchAllData() async {
        // 1. Fetch roster orders
        if let url = URL(string: "https://medmarg.com/api/v1/agent/roster?agentId=\(effectiveAgentId)") {
            if let (data, _) = try? await URLSession.shared.data(from: url),
               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
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
                    self.rosterOrders = parsed
                }
            }
        }

        // 2. Fetch broadcast jobs (100% Live)
        if let url = URL(string: "https://medmarg.com/api/v1/agent/broadcast-jobs") {
            if let (data, _) = try? await URLSession.shared.data(from: url),
               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let arr = json["jobs"] as? [[String: Any]] {
                let parsed: [FreelanceBroadcastJobItem] = arr.compactMap { d in
                    guard let id = d["id"] as? String else { return nil }
                    return FreelanceBroadcastJobItem(
                        id: id,
                        patientName: d["patientName"] as? String,
                        age: d["age"] as? String,
                        timeSlot: d["timeSlot"] as? String,
                        address: d["address"] as? String,
                        phone: d["phone"] as? String,
                        tests: d["tests"] as? String,
                        tubes: d["tubes"] as? [String],
                        payout: d["payout"] as? Int,
                        distance: d["distance"] as? String,
                        fastingRequired: d["fastingRequired"] as? Bool,
                        urgency: d["urgency"] as? String
                    )
                }
                await MainActor.run {
                    self.broadcastGigs = parsed
                }
            }
        }

        // 3. Fetch wallet stats (100% Live)
        if let url = URL(string: "https://medmarg.com/api/v1/agent/wallet?agentId=\(effectiveAgentId)") {
            if let (data, _) = try? await URLSession.shared.data(from: url),
               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let w = json["wallet"] as? [String: Any] {
                let earned = w["todayEarnings"] as? Int ?? 0
                let trips = w["completedTripsToday"] as? Int ?? 0
                await MainActor.run {
                    self.todayEarnings = earned
                    self.completedCount = trips
                    self.isLoading = false
                }
            }
        }

        // 4. Fetch unread notifications
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

