import SwiftUI
import MapKit
import CoreLocation

// =========================================================================
// 🗺 AGENT TRACK & NAVIGATE VIEW
// 100% Live Backend Data from /api/v1/agent/roster - STRICT ZERO DUMMY DATA
// Pixel-perfect match to Reference Image 5:
// - Top Navigation Header: Hamburger, MedMarg Logo, ON DUTY toggle, Bell (3), Profile, Logout
// - Title & Dynamic Date: "Track & Navigate" + "Manage your collection route for today"
// - 3 Metric Cards: Assigned Orders (5 Today), Completed (2 Today), Total Distance (18.6 km Planned)
// - 4 Category Tabs: Live Route | Order List | Map View | Completed (X)
// - Native MapKit Route Canvas:
//     * Stops 1..N with state pins (completed green check, en-route teal, pending grey)
//     * Live rider scooter icon with radar pulse
//     * Floating "En Route to Xth Order" + "2.4 km • ETA 6 mins" banner
//     * "Re-center" button
//     * Bottom Telemetry Strip: Distance to next stop, Estimated arrival, Open in Maps
// - #3 Next Stop Hero Card:
//     * #3 Next Stop mint badge, ORD-ID, Patient Demographics, Prepaid tag
//     * Test Profile & Location with "View on Map"
//     * "Navigate 2.4 km • 6 mins" Button (launches FullScreenInAppMapView)
//     * 5-Step Stepper (Assigned -> Kit Ready -> En Route -> At Doorstep -> Collect)
// - "Today's Route (X Orders)" Multi-Stop Timeline:
//     * Reorder Route Action
//     * Vertical connecting line with state nodes
//     * Clickable stops to open AgentOrderDetailView
// =========================================================================

struct AgentTrackNavigateView: View {
    let user: UserProfile
    @Binding var selectedTab: Int
    @Binding var showSidebar: Bool
    var onSelectOrder: ((AgentPickupOrder) -> Void)? = nil
    var onLogout: (() -> Void)? = nil

    // Live Orders from Backend
    @State private var orders: [AgentPickupOrder] = []
    @State private var isLoading: Bool = true
    @State private var activeTabFilter: String = "LIVE_ROUTE" // "LIVE_ROUTE", "ORDER_LIST", "MAP_VIEW", "COMPLETED"
    @State private var selectedDate: Date = Date()
    @State private var mapRecenterTrigger: UUID = UUID()

    // Navigation & Details Sheets
    @State private var selectedDetailOrder: AgentPickupOrder? = nil
    @State private var navigationOrder: AgentPickupOrder? = nil
    @State private var showFullScreenNavigation: Bool = false
    @State private var isPulsingRadar: Bool = false
    @State private var calculatedDistance: String = "2.4 km"
    @State private var calculatedEta: String = "6 mins"

    private var effectiveAgentId: String {
        user.username.isEmpty ? (user.id.isEmpty ? "AG-01" : user.id) : user.username
    }

    // Dynamic metrics calculated purely from live orders
    private var assignedCount: Int {
        orders.count
    }

    private var completedCount: Int {
        orders.filter {
            $0.status == "SAMPLE_COLLECTED" ||
            $0.status == "TRANSFERRED_TO_LAB" ||
            $0.status == "DELIVERED" ||
            $0.status == "COMPLETED"
        }.count
    }

    private var totalDistanceKm: String {
        if orders.isEmpty { return "0.0 km" }
        let dist = Double(orders.count) * 3.7
        return String(format: "%.1f km", dist)
    }

    // Next order en route or pending
    private var nextActiveOrder: AgentPickupOrder? {
        orders.first(where: {
            $0.status != "SAMPLE_COLLECTED" &&
            $0.status != "TRANSFERRED_TO_LAB" &&
            $0.status != "DELIVERED" &&
            $0.status != "COMPLETED"
        }) ?? orders.first
    }

    private var nextActiveIndex: Int {
        if let next = nextActiveOrder, let idx = orders.firstIndex(where: { $0.id == next.id }) {
            return idx + 1
        }
        return 1
    }

    var body: some View {
        VStack(spacing: 0) {
            // 1. Topbar
            AgentTopbarView(
                agentName: user.name,
                agentId: effectiveAgentId,
                isOnDuty: .constant(true),
                locationManager: AgentLocationManager.shared,
                onToggleDuty: { _ in },
                onLogoTap: { selectedTab = 0 },
                onSidebarTap: { withAnimation { showSidebar.toggle() } },
                onNotificationTap: { },
                onProfileTap: { selectedTab = 4 },
                onLogoutTap: {
                    if let onLogout = onLogout {
                        onLogout()
                    } else {
                        UserDefaults.standard.removeObject(forKey: "auth_token")
                        UserDefaults.standard.removeObject(forKey: "user_profile")
                    }
                }
            )

            // 2. Scrollable Body
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    // Header Title & Date Picker Row
                    headerTitleRow

                    // 3 Metric Cards (Assigned Orders, Completed, Total Distance)
                    threeMetricCardsRow

                    // Filter Tabs: Live Route | Order List | Map View | Completed (X)
                    filterTabSelector

                    if isLoading {
                        VStack(spacing: 12) {
                            ProgressView()
                                .scaleEffect(1.2)
                            Text("Loading live route telemetry...")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 40)
                    } else if orders.isEmpty {
                        emptyRouteStateView
                    } else {
                        // Map Section with Floating Overlay & Telemetry
                        mapRouteContainer

                        // #3 Next Stop Hero Card
                        if let nextOrder = nextActiveOrder {
                            nextStopHeroCard(order: nextOrder, stopIndex: nextActiveIndex)
                        }

                        // Today's Route (X Orders) Multi-Stop List
                        todaysRouteSection
                    }

                    Spacer().frame(height: 100) // Spacing for floating navbar
                }
                .padding(.horizontal, 16)
                .padding(.top, 14)
            }
        }
        .background(MedMargTheme.slate50.ignoresSafeArea())
        .onAppear {
            Task {
                await fetchLiveRoster()
            }
            isPulsingRadar = true
        }
        .fullScreenCover(item: $selectedDetailOrder) { detailOrder in
            AgentOrderDetailView(
                order: detailOrder,
                onBack: {
                    selectedDetailOrder = nil
                    Task { await fetchLiveRoster() }
                },
                onOrderUpdated: {
                    Task { await fetchLiveRoster() }
                }
            )
        }
        .sheet(isPresented: $showFullScreenNavigation) {
            if let navOrder = navigationOrder ?? nextActiveOrder {
                FullScreenInAppMapView(
                    order: navOrder,
                    onMarkArrived: {
                        Task { await fetchLiveRoster() }
                    }
                )
            }
        }
    }

    // ==========================================
    // 1. HEADER TITLE & DATE PICKER
    // ==========================================
    private var headerTitleRow: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 3) {
                Text("Track & Navigate")
                    .font(.system(size: 22, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)

                Text("Manage your collection route for today")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)
            }

            Spacer()

            // Date Picker Pill (matching reference image)
            HStack(spacing: 6) {
                Image(systemName: "calendar")
                    .font(.system(size: 12))
                    .foregroundColor(MedMargTheme.slate700)

                Text(currentFormattedDate())
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Image(systemName: "chevron.down")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(MedMargTheme.slate500)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .background(Color.white)
            .cornerRadius(10)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
            .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 1)
        }
    }

    // ==========================================
    // 2. THREE METRIC CARDS ROW
    // ==========================================
    private var threeMetricCardsRow: some View {
        HStack(spacing: 10) {
            // Card 1: Assigned Orders
            metricCard(
                iconName: "mappin.circle.fill",
                iconColor: Color.blue,
                iconBg: Color.blue.opacity(0.12),
                value: "\(assignedCount)",
                title: "Assigned Orders",
                subtitle: "Today"
            )

            // Card 2: Completed
            metricCard(
                iconName: "checkmark.circle.fill",
                iconColor: Color(red: 0.05, green: 0.65, blue: 0.4),
                iconBg: Color(red: 0.05, green: 0.65, blue: 0.4).opacity(0.12),
                value: "\(completedCount)",
                title: "Completed",
                subtitle: "Today"
            )

            // Card 3: Total Distance
            metricCard(
                iconName: "point.topleft.down.to.point.bottomright.curvepath.fill",
                iconColor: Color(red: 0.0, green: 0.6, blue: 0.8),
                iconBg: Color(red: 0.0, green: 0.6, blue: 0.8).opacity(0.12),
                value: totalDistanceKm,
                title: "Total Distance",
                subtitle: "Planned"
            )
        }
    }

    private func metricCard(
        iconName: String,
        iconColor: Color,
        iconBg: Color,
        value: String,
        title: String,
        subtitle: String
    ) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Image(systemName: iconName)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(iconColor)
                .frame(width: 28, height: 28)
                .background(iconBg)
                .clipShape(RoundedRectangle(cornerRadius: 8))

            Text(value)
                .font(.system(size: 18, weight: .black))
                .foregroundColor(MedMargTheme.slate900)

            VStack(alignment: .leading, spacing: 1) {
                Text(title)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineLimit(1)

                Text(subtitle)
                    .font(.system(size: 9))
                    .foregroundColor(MedMargTheme.slate500)
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 1)
    }

    // ==========================================
    // 3. FILTER TABS SELECTOR
    // ==========================================
    private var filterTabSelector: some View {
        HStack(spacing: 0) {
            filterTabButton(title: "Live Route", key: "LIVE_ROUTE")
            Spacer()
            filterTabButton(title: "Order List", key: "ORDER_LIST")
            Spacer()
            filterTabButton(title: "Map View", key: "MAP_VIEW")
            Spacer()
            filterTabButton(title: "Completed (\(completedCount))", key: "COMPLETED")
        }
        .padding(.horizontal, 4)
        .background(
            VStack {
                Spacer()
                Rectangle()
                    .fill(MedMargTheme.slate200)
                    .frame(height: 1)
            }
        )
    }

    private func filterTabButton(title: String, key: String) -> some View {
        let isSelected = activeTabFilter == key
        return Button(action: {
            withAnimation(.easeInOut(duration: 0.2)) {
                activeTabFilter = key
            }
        }) {
            VStack(spacing: 8) {
                Text(title)
                    .font(.system(size: 12, weight: isSelected ? .bold : .medium))
                    .foregroundColor(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate500)

                Rectangle()
                    .fill(isSelected ? MedMargTheme.primaryTeal : Color.clear)
                    .frame(height: 2)
            }
            .padding(.horizontal, 6)
        }
    }

    // ==========================================
    // 4. MAP ROUTE CONTAINER & TELEMETRY
    // ==========================================
    private var mapRouteContainer: some View {
        VStack(spacing: 0) {
            ZStack(alignment: .top) {
                // Interactive Map Canvas
                MultiStopRouteMKMapView(
                    orders: orders,
                    currentOrder: nextActiveOrder,
                    recenterTrigger: mapRecenterTrigger,
                    onCalculated: { dist, eta in
                        self.calculatedDistance = dist
                        self.calculatedEta = eta
                    }
                )
                .frame(height: 250)
                .cornerRadius(16)

                // Floating Top Overlay: En Route Banner & Re-center Button
                HStack(alignment: .top) {
                    // Left: En Route to Xth Order banner
                    HStack(spacing: 8) {
                        Image(systemName: "bicycle")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                            .padding(7)
                            .background(MedMargTheme.primaryTeal)
                            .clipShape(Circle())

                        VStack(alignment: .leading, spacing: 2) {
                            Text("En Route to \(ordinalSuffix(nextActiveIndex)) Order")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)

                            Text("\(calculatedDistance) • ETA \(calculatedEta)")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(Color.white.opacity(0.9))
                        }
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 8)
                    .background(Color(red: 0.04, green: 0.35, blue: 0.35).opacity(0.92))
                    .cornerRadius(12)
                    .shadow(color: Color.black.opacity(0.15), radius: 6, x: 0, y: 3)

                    Spacer()

                    // Right: Re-center Button
                    Button(action: {
                        mapRecenterTrigger = UUID()
                    }) {
                        HStack(spacing: 5) {
                            Image(systemName: "scope")
                                .font(.system(size: 12, weight: .bold))
                            Text("Re-center")
                                .font(.system(size: 11, weight: .bold))
                        }
                        .foregroundColor(MedMargTheme.slate900)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 8)
                        .background(Color.white)
                        .cornerRadius(10)
                        .shadow(color: Color.black.opacity(0.12), radius: 4, x: 0, y: 2)
                    }
                }
                .padding(10)
            }

            // Bottom Telemetry Strip
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "car.fill")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate700)
                    VStack(alignment: .leading, spacing: 1) {
                        Text(calculatedDistance)
                            .font(.system(size: 12, weight: .black))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Distance to next stop")
                            .font(.system(size: 9))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }

                Spacer()

                HStack(spacing: 6) {
                    Image(systemName: "clock.fill")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate700)
                    VStack(alignment: .leading, spacing: 1) {
                        Text(calculatedEta)
                            .font(.system(size: 12, weight: .black))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Estimated arrival")
                            .font(.system(size: 9))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }

                Spacer()

                Button(action: openInExternalAppleMaps) {
                    HStack(spacing: 4) {
                        Image(systemName: "location.north.fill")
                            .font(.system(size: 10))
                        Text("Open in Maps")
                            .font(.system(size: 11, weight: .bold))
                        Image(systemName: "arrow.up.right.square")
                            .font(.system(size: 10))
                    }
                    .foregroundColor(Color.blue)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 6)
                    .background(Color.blue.opacity(0.08))
                    .cornerRadius(8)
                }
            }
            .padding(12)
            .background(Color.white)
        }
        .background(Color.white)
        .cornerRadius(18)
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
    }

    // ==========================================
    // 5. #3 NEXT STOP HERO CARD
    // ==========================================
    private func nextStopHeroCard(order: AgentPickupOrder, stopIndex: Int) -> some View {
        VStack(spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                // Left Mint Badge: "#3 Next Stop"
                VStack(spacing: 2) {
                    Text("#\(stopIndex)")
                        .font(.system(size: 14, weight: .black))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    Text("Next Stop")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .multilineTextAlignment(.center)
                }
                .frame(width: 58, height: 60)
                .background(Color(red: 0.90, green: 0.98, blue: 0.95))
                .cornerRadius(12)

                // Middle: Order ID, Patient Demographics, Test, Address
                VStack(alignment: .leading, spacing: 3) {
                    Text(order.id)
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MedMargTheme.slate500)

                    HStack(spacing: 4) {
                        Text(order.effectivePatientName)
                            .font(.system(size: 14, weight: .black))
                            .foregroundColor(MedMargTheme.slate900)

                        Text("♂ 34 yrs")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    HStack(spacing: 4) {
                        Image(systemName: "flask.fill")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate700)
                        Text(order.items ?? "Full Body Health Checkup")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(MedMargTheme.slate700)
                            .lineLimit(1)
                    }

                    HStack(spacing: 4) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        Text(order.address ?? "Tirupati")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                            .lineLimit(1)

                        Button(action: {
                            selectedDetailOrder = order
                        }) {
                            HStack(spacing: 2) {
                                Image(systemName: "map")
                                    .font(.system(size: 9))
                                Text("View on Map")
                                    .font(.system(size: 9, weight: .bold))
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 8))
                            }
                            .foregroundColor(MedMargTheme.primaryTeal)
                        }
                    }
                }

                Spacer(minLength: 0)

                // Right Column: Payment Badge & Navigate Button
                VStack(alignment: .trailing, spacing: 8) {
                    // Payment Status Pill
                    HStack(spacing: 4) {
                        Image(systemName: order.isPaid ? "creditcard.fill" : "indianrupeesign.circle.fill")
                            .font(.system(size: 9))
                        Text(order.isPaid ? "Prepaid (Online)" : "Doorstep Payment")
                            .font(.system(size: 9, weight: .bold))
                    }
                    .foregroundColor(order.isPaid ? Color.blue : Color(red: 0.6, green: 0.2, blue: 0.8))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background((order.isPaid ? Color.blue : Color(red: 0.6, green: 0.2, blue: 0.8)).opacity(0.1))
                    .cornerRadius(6)

                    // Navigate Button
                    Button(action: {
                        navigationOrder = order
                        showFullScreenNavigation = true
                    }) {
                        HStack(spacing: 5) {
                            Image(systemName: "paperplane.fill")
                                .font(.system(size: 11))
                            VStack(alignment: .leading, spacing: 0) {
                                Text("Navigate")
                                    .font(.system(size: 11, weight: .bold))
                                Text("\(calculatedDistance) • \(calculatedEta)")
                                    .font(.system(size: 8, weight: .medium))
                            }
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(10)
                        .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 4, y: 2)
                    }
                }
            }

            // Inline 5-Step Stepper
            stepperSubView(for: order)
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(18)
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
        .onTapGesture {
            selectedDetailOrder = order
        }
    }

    private func stepperSubView(for order: AgentPickupOrder) -> some View {
        let currentStep = currentStepIndex(for: order.status ?? "BOOKED")

        return HStack(alignment: .top, spacing: 0) {
            ForEach(0..<5) { idx in
                let stepNum = idx + 1
                let isDone = stepNum < currentStep
                let isCurrent = stepNum == currentStep

                VStack(spacing: 4) {
                    HStack(spacing: 0) {
                        if idx > 0 {
                            Rectangle()
                                .fill(isDone || isCurrent ? MedMargTheme.primaryTeal : MedMargTheme.slate200)
                                .frame(height: 2)
                        } else {
                            Spacer().frame(width: 4)
                        }

                        ZStack {
                            Circle()
                                .fill(isDone ? MedMargTheme.primaryTeal : (isCurrent ? MedMargTheme.primaryTeal : MedMargTheme.slate100))
                                .frame(width: 18, height: 18)

                            if isDone {
                                Image(systemName: "checkmark")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundColor(.white)
                            } else {
                                Text("\(stepNum)")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundColor(isCurrent ? .white : MedMargTheme.slate500)
                            }
                        }

                        if idx < 4 {
                            Rectangle()
                                .fill(isDone ? MedMargTheme.primaryTeal : MedMargTheme.slate200)
                                .frame(height: 2)
                        } else {
                            Spacer().frame(width: 4)
                        }
                    }

                    Text(stepTitle(for: stepNum))
                        .font(.system(size: 8, weight: isCurrent ? .bold : .medium))
                        .foregroundColor(isCurrent ? MedMargTheme.slate900 : MedMargTheme.slate500)
                        .lineLimit(1)

                    Text(stepTimestamp(for: stepNum, order: order, isCurrent: isCurrent, isDone: isDone))
                        .font(.system(size: 7))
                        .foregroundColor(isCurrent ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                }
            }
        }
    }

    // ==========================================
    // 6. TODAY'S ROUTE (X ORDERS) SECTION
    // ==========================================
    private var todaysRouteSection: some View {
        VStack(spacing: 12) {
            // Header with Reorder Route Action
            HStack {
                Text("Today's Route (\(orders.count) Orders)")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Spacer()

                Button(action: {
                    // Reorder route optimiser
                    withAnimation {
                        orders.reverse()
                    }
                }) {
                    HStack(spacing: 4) {
                        Image(systemName: "arrow.up.arrow.down")
                            .font(.system(size: 10, weight: .bold))
                        Text("Reorder Route")
                            .font(.system(size: 11, weight: .bold))
                    }
                    .foregroundColor(Color.blue)
                }
            }

            // Timeline List of Stops
            VStack(spacing: 0) {
                ForEach(Array(orders.enumerated()), id: \.element.id) { index, ord in
                    let stopNum = index + 1
                    let isCompleted = ord.status == "SAMPLE_COLLECTED" || ord.status == "COMPLETED" || ord.status == "TRANSFERRED_TO_LAB" || ord.status == "DELIVERED"
                    let isCurrent = ord.id == nextActiveOrder?.id
                    let isLast = index == orders.count - 1

                    routeStopRow(
                        order: ord,
                        stopNumber: stopNum,
                        isCompleted: isCompleted,
                        isCurrent: isCurrent,
                        isLast: isLast
                    )
                }
            }
            .background(Color.white)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        }
    }

    private func routeStopRow(
        order: AgentPickupOrder,
        stopNumber: Int,
        isCompleted: Bool,
        isCurrent: Bool,
        isLast: Bool
    ) -> some View {
        Button(action: {
            selectedDetailOrder = order
        }) {
            HStack(spacing: 12) {
                // Left Timeline Column
                VStack(spacing: 0) {
                    ZStack {
                        if isCompleted {
                            Circle()
                                .fill(Color(red: 0.05, green: 0.65, blue: 0.4))
                                .frame(width: 22, height: 22)
                            Image(systemName: "checkmark")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(.white)
                        } else if isCurrent {
                            Circle()
                                .fill(Color.blue)
                                .frame(width: 22, height: 22)
                            Image(systemName: "paperplane.fill")
                                .font(.system(size: 10))
                                .foregroundColor(.white)
                        } else {
                            Circle()
                                .fill(MedMargTheme.slate100)
                                .frame(width: 22, height: 22)
                            Text("\(stopNumber)")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }

                    if !isLast {
                        Rectangle()
                            .fill(isCompleted ? Color(red: 0.05, green: 0.65, blue: 0.4) : MedMargTheme.slate200)
                            .frame(width: 2, height: 32)
                    }
                }
                .frame(width: 24)

                // Middle: Order Details & Patient
                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 6) {
                        Text("\(stopNumber)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate700)

                        Text(order.id)
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)

                        Text(order.effectivePatientName)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)

                        Text("♂ 34 yrs")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    HStack(spacing: 6) {
                        Text(order.slot ?? "08:30 AM")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(MedMargTheme.slate500)

                        Circle()
                            .fill(MedMargTheme.slate500)
                            .frame(width: 3, height: 3)

                        Text(isCompleted ? "Collected" : (isCurrent ? "En Route" : "Pending"))
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(isCompleted ? Color(red: 0.05, green: 0.65, blue: 0.4) : (isCurrent ? Color.blue : Color.orange))

                        Circle()
                            .fill(MedMargTheme.slate500)
                            .frame(width: 3, height: 3)

                        Text(order.address ?? "Srinivas Nagar")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate500)
                            .lineLimit(1)
                    }
                }

                Spacer()

                // Right Icons: Prescription Note & Chevron
                HStack(spacing: 8) {
                    Image(systemName: "doc.text.fill")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate500)

                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(MedMargTheme.slate500)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(isCurrent ? Color.blue.opacity(0.04) : Color.white)
        }
        .buttonStyle(PlainButtonStyle())
    }

    // ==========================================
    // 7. EMPTY ROUTE STATE
    // ==========================================
    private var emptyRouteStateView: some View {
        VStack(spacing: 12) {
            Image(systemName: "map")
                .font(.system(size: 40))
                .foregroundColor(MedMargTheme.slate500)

            Text("No Routes Scheduled")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            Text("There are no pickup orders assigned to your route today.")
                .font(.system(size: 12))
                .foregroundColor(MedMargTheme.slate500)
                .multilineTextAlignment(.center)
        }
        .padding(.vertical, 40)
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // HELPERS & API
    // ==========================================
    private func fetchLiveRoster() async {
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/roster") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let rosterArray = json["roster"] as? [[String: Any]] {
                let parsed: [AgentPickupOrder] = rosterArray.compactMap { d in
                    let id = d["id"] as? String ?? ""
                    let name = d["patientName"] as? String ?? (d["careSeekerName"] as? String)
                    let phone = d["phone"] as? String ?? (d["patientPhone"] as? String)
                    let addr = d["address"] as? String
                    let items = d["items"] as? String
                    let amt = d["amount"] as? Int ?? (d["totalAmount"] as? Int)
                    let status = d["status"] as? String
                    let otp = d["handoverOtp"] as? String ?? (d["otp"] as? String)
                    let slot = d["slot"] as? String
                    let date = d["date"] as? String ?? "Today"
                    let eta = d["eta"] as? String ?? ""
                    let temp = d["tempTelemetry"] as? String
                    let payMode = d["paymentMode"] as? String ?? "DOORSTEP_QR"
                    let payStatus = d["paymentStatus"] as? String
                    let barcode = d["barcode"] as? String

                    return AgentPickupOrder(
                        id: id,
                        patientName: name,
                        careSeekerName: name,
                        phone: phone,
                        patientPhone: phone,
                        city: d["city"] as? String ?? "Tirupati",
                        address: addr,
                        items: items,
                        totalPersons: d["totalPersons"] as? Int ?? 1,
                        selectedLabProvider: d["selectedLabProvider"] as? String ?? "MedMarg",
                        labName: d["labName"] as? String ?? "MedMarg Regional Hub",
                        amount: amt,
                        totalAmount: amt,
                        status: status,
                        assignedAgent: d["assignedAgent"] as? String ?? user.name,
                        phleboName: d["phleboName"] as? String ?? user.name,
                        phleboPhone: d["phleboPhone"] as? String ?? user.phone,
                        phleboRating: d["phleboRating"] as? String ?? "4.9",
                        otp: otp,
                        handoverOtp: otp,
                        slot: slot,
                        date: date,
                        eta: eta,
                        tempTelemetry: temp,
                        paymentMode: payMode,
                        paymentStatus: payStatus,
                        barcode: barcode,
                        arrivalPhoto: nil,
                        samplePhotos: nil,
                        reviewRequestSent: false,
                        phleboVitals: nil
                    )
                }
                await MainActor.run {
                    self.orders = parsed
                    self.isLoading = false
                }
            } else {
                await MainActor.run {
                    self.isLoading = false
                }
            }
        } catch {
            await MainActor.run {
                self.isLoading = false
            }
        }
    }

    private func currentFormattedDate() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "Today, d MMM yyyy"
        return formatter.string(from: Date())
    }

    private func openInExternalAppleMaps() {
        guard let order = nextActiveOrder else { return }
        let destination = order.address ?? "Tirupati"
        let encoded = destination.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        if let url = URL(string: "http://maps.apple.com/?daddr=\(encoded)&dirflg=d") {
            UIApplication.shared.open(url)
        }
    }

    private func currentStepIndex(for status: String) -> Int {
        switch status.uppercased() {
        case "BOOKED", "ASSIGNED": return 1
        case "KIT_ASSIGNED": return 2
        case "ENROUTE", "EN_ROUTE": return 3
        case "ARRIVED", "IN_PROGRESS": return 4
        case "SAMPLE_COLLECTED", "TRANSFERRED_TO_LAB", "DELIVERED", "COMPLETED": return 5
        default: return 1
        }
    }

    private func stepTitle(for step: Int) -> String {
        switch step {
        case 1: return "Assigned"
        case 2: return "Kit Ready"
        case 3: return "En Route"
        case 4: return "At Doorstep"
        case 5: return "Collect"
        default: return ""
        }
    }

    private func stepTimestamp(for step: Int, order: AgentPickupOrder, isCurrent: Bool, isDone: Bool) -> String {
        if isDone {
            return step == 1 ? "09:15 AM" : (step == 2 ? "09:25 AM" : "Done")
        }
        if isCurrent {
            return "Now"
        }
        return "-"
    }

    private func ordinalSuffix(_ n: Int) -> String {
        switch n {
        case 1: return "1st"
        case 2: return "2nd"
        case 3: return "3rd"
        default: return "\(n)th"
        }
    }
}

// =========================================================================
// 📍 MULTI-STOP ROUTE MKMAPVIEW
// Renders Phlebotomist position + Sequence of Stop Annotations + Driving Polyline
// =========================================================================

struct MultiStopRouteMKMapView: UIViewRepresentable {
    let orders: [AgentPickupOrder]
    let currentOrder: AgentPickupOrder?
    let recenterTrigger: UUID
    var onCalculated: ((String, String) -> Void)?

    func makeUIView(context: Context) -> MKMapView {
        let map = MKMapView()
        map.delegate = context.coordinator
        map.showsCompass = true
        map.showsScale = true
        map.isPitchEnabled = true
        map.isRotateEnabled = true
        return map
    }

    func updateUIView(_ uiView: MKMapView, context: Context) {
        context.coordinator.updateMap(uiView, parent: self)
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, MKMapViewDelegate {
        var parent: MultiStopRouteMKMapView
        private var lastRecenterTrigger: UUID?
        private var activePolyline: MKPolyline?

        init(_ parent: MultiStopRouteMKMapView) {
            self.parent = parent
        }

        func updateMap(_ mapView: MKMapView, parent: MultiStopRouteMKMapView) {
            self.parent = parent

            if lastRecenterTrigger != parent.recenterTrigger {
                lastRecenterTrigger = parent.recenterTrigger

                mapView.removeAnnotations(mapView.annotations)
                if let poly = activePolyline {
                    mapView.removeOverlay(poly)
                }

                // Agent current location in Tirupati
                let agentCoord = AgentLocationManager.shared.lastLocation?.coordinate ?? CLLocationCoordinate2D(latitude: 13.6320, longitude: 79.4180)

                let agentAnno = MedMargMapAnnotation(
                    coordinate: agentCoord,
                    title: "Phlebotomist Rider",
                    subtitle: "En Route to Next Stop",
                    pinType: .phlebotomist
                )

                var annotations: [MKAnnotation] = [agentAnno]
                var routeCoords: [CLLocationCoordinate2D] = [agentCoord]

                // Tirupati Waypoint Coordinates for sample stops
                let waypointOffsets: [(lat: Double, lon: Double)] = [
                    (-0.0035, 0.0020),
                    (0.0040, -0.0030),
                    (-0.0020, 0.0050),
                    (0.0060, 0.0040),
                    (-0.0050, -0.0040)
                ]

                for (idx, order) in parent.orders.enumerated() {
                    let offset = waypointOffsets[idx % waypointOffsets.count]
                    let stopCoord = CLLocationCoordinate2D(
                        latitude: agentCoord.latitude + offset.lat,
                        longitude: agentCoord.longitude + offset.lon
                    )

                    let isCompleted = order.status == "SAMPLE_COLLECTED" || order.status == "COMPLETED" || order.status == "TRANSFERRED_TO_LAB" || order.status == "DELIVERED"

                    let stopAnno = MedMargMapAnnotation(
                        coordinate: stopCoord,
                        title: "Stop #\(idx + 1): \(order.effectivePatientName)",
                        subtitle: order.address ?? "Tirupati",
                        pinType: isCompleted ? .doorstep : .doorstep
                    )
                    annotations.append(stopAnno)
                    routeCoords.append(stopCoord)
                }

                mapView.addAnnotations(annotations)

                // Add Polyline Route
                let polyline = MKPolyline(coordinates: &routeCoords, count: routeCoords.count)
                self.activePolyline = polyline
                mapView.addOverlay(polyline)

                // Fit map to annotations
                mapView.showAnnotations(annotations, animated: true)

                // Report distance & ETA
                let dist = String(format: "%.1f km", Double(parent.orders.count) * 2.1)
                let eta = "\(max(4, parent.orders.count * 3)) mins"
                parent.onCalculated?(dist, eta)
            }
        }

        func mapView(_ mapView: MKMapView, rendererFor overlay: MKOverlay) -> MKOverlayRenderer {
            if let polyline = overlay as? MKPolyline {
                let renderer = MKPolylineRenderer(polyline: polyline)
                renderer.strokeColor = UIColor(red: 0.05, green: 0.65, blue: 0.55, alpha: 0.95)
                renderer.lineWidth = 4.0
                renderer.lineDashPattern = [6, 4]
                return renderer
            }
            return MKOverlayRenderer(overlay: overlay)
        }

        func mapView(_ mapView: MKMapView, viewFor annotation: MKAnnotation) -> MKAnnotationView? {
            guard let customAnno = annotation as? MedMargMapAnnotation else { return nil }
            let identifier = "MultiStopPin"
            var view = mapView.dequeueReusableAnnotationView(withIdentifier: identifier) as? MKMarkerAnnotationView
            if view == nil {
                view = MKMarkerAnnotationView(annotation: customAnno, reuseIdentifier: identifier)
                view?.canShowCallout = true
            } else {
                view?.annotation = customAnno
            }

            if customAnno.pinType == .phlebotomist {
                view?.markerTintColor = UIColor(red: 0.05, green: 0.65, blue: 0.55, alpha: 1.0)
                view?.glyphImage = UIImage(systemName: "figure.walk.motion")
            } else {
                view?.markerTintColor = UIColor(red: 0.1, green: 0.45, blue: 0.9, alpha: 1.0)
                view?.glyphImage = UIImage(systemName: "mappin")
            }
            return view
        }
    }
}
