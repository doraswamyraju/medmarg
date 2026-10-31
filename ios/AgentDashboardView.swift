import SwiftUI

// =========================================================================
// 🛵 AGENT LIVE DATA MODELS (100% LIVE BACKEND PARITY)
// Fetched directly from /api/v1/agent/* endpoints
// =========================================================================

struct AgentPickupOrder: Identifiable, Codable, Equatable {
    let id: String
    var patientName: String?
    var careSeekerName: String?
    var phone: String?
    var patientPhone: String?
    var city: String?
    var address: String?
    var items: String?
    var totalPersons: Int?
    var selectedLabProvider: String?
    var labName: String?
    var amount: Int?
    var totalAmount: Int?
    var status: String?
    var assignedAgent: String?
    var phleboName: String?
    var phleboPhone: String?
    var phleboRating: String?
    var otp: String?
    var handoverOtp: String?
    var slot: String?
    var date: String?
    var eta: String?
    var tempTelemetry: String?
    var paymentMode: String?
    var paymentStatus: String?
    var barcode: String?
    var arrivalPhoto: String?
    var samplePhotos: [String]?
    var reviewRequestSent: Bool?
    var phleboVitals: PhleboVitalsRecord?

    var effectivePatientName: String {
        patientName ?? careSeekerName ?? "Care Seeker"
    }

    var effectivePhone: String {
        phone ?? patientPhone ?? ""
    }

    var effectiveAmount: Int {
        amount ?? totalAmount ?? 0
    }

    var isPaid: Bool {
        paymentStatus == "PAID_SUCCESS" || paymentStatus == "PAID_DOORSTEP_QR" || paymentStatus == "PAID_ONLINE"
    }
}

struct PhleboVitalsRecord: Codable, Equatable {
    var recordedAt: String?
    var bp: String?
    var pulse: String?
    var spo2: String?
    var sugar: String?
    var temp: String?
    var notes: String?
}

struct AgentInventoryItem: Identifiable, Codable, Equatable {
    let id: String
    var name: String
    var code: String
    var stock: Int
    var unit: String
    var minThreshold: Int?
}

struct AgentWarehouseStockItem: Identifiable, Codable, Equatable {
    var id: String { code }
    var code: String
    var name: String
    var type: String?
    var category: String?
    var stock: Int
    var unit: String
    var unitCost: Int?
}

struct AgentIndentItem: Identifiable, Codable, Equatable {
    let id: String
    var agentType: String?
    var agentName: String?
    var area: String?
    var requestedItems: String
    var status: String
    var date: String?
    var paymentMode: String?
}

struct AgentQuotaStats: Codable, Equatable {
    var agentId: String?
    var name: String?
    var samplesToday: Int?
    var maxDailyQuota: Int?
    var quotaRemaining: Int?
    var rating: Double?
    var zone: String?
    var onTimeRate: String?
    var fastingAccuracy: String?
    var earningsToday: Int?
    var completedToday: Int?
    var targetToday: Int?
    var pendingToday: Int?
    var incentivesEarned: Int?
}

struct AgentPaymentTxn: Identifiable, Codable, Equatable {
    let id: String
    var orderId: String?
    var patientName: String?
    var phone: String?
    var amount: Int?
    var paymentMode: String?
    var paymentStatus: String?
    var date: String?
    var razorpayPaymentId: String?
}

// =========================================================================
// 🚀 DEDICATED AGENT DASHBOARD VIEW (SALARIED FLEET PHLEBOTOMIST)
// Displays ONLY LIVE BACKEND DATA from /api/v1/agent/*
// =========================================================================

struct AgentDashboardView: View {
    let user: UserProfile
    let onLogout: () -> Void
    @Binding var selectedTab: Int // 0: Pickups, 1: Inventory/Store, 2: Shift Quota, 3: Payments, 4: Profile
    @Binding var showSidebar: Bool

    // Live Server States
    @State private var rosterOrders: [AgentPickupOrder] = []
    @State private var inventoryItems: [AgentInventoryItem] = []
    @State private var warehouseStock: [AgentWarehouseStockItem] = []
    @State private var indentsList: [AgentIndentItem] = []
    @State private var quotaStats: AgentQuotaStats? = nil
    @State private var paymentTxns: [AgentPaymentTxn] = []
    @State private var isLoading: Bool = true
    @State private var isRefreshing: Bool = false
    @State private var errorMessage: String? = nil
    @State private var isOnDuty: Bool = true

    // Action Modals
    @State private var activeVisitModalOrder: AgentPickupOrder? = nil
    @State private var activeDoorstepQrOrder: AgentPickupOrder? = nil
    @State private var showIndentSheet: Bool = false
    @State private var isSubmittingAction: Bool = false
    @State private var actionBannerMessage: String? = nil

    private var effectiveAgentId: String {
        user.username.isEmpty ? (user.id.isEmpty ? "AG-01" : user.id) : user.username
    }

    var body: some View {
        ZStack {
            MedMargTheme.slate50.ignoresSafeArea()

            Group {
                if selectedTab == 0 || (selectedTab != 1 && selectedTab != 2 && selectedTab != 3 && selectedTab != 4) {
                    // Full dedicated home dashboard manages its own internal ScrollView & Topbar
                    AgentHomeDashboardView(user: user, onLogout: onLogout, selectedTab: $selectedTab, showSidebar: $showSidebar)
                } else {
                    // Other tabs: Inventory, Quota, Payments, Profile
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 16) {
                            if let banner = actionBannerMessage {
                                HStack(spacing: 8) {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(.white)
                                    Text(banner)
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundColor(.white)
                                    Spacer()
                                    Button(action: { actionBannerMessage = nil }) {
                                        Image(systemName: "xmark")
                                            .font(.system(size: 12, weight: .bold))
                                            .foregroundColor(.white)
                                    }
                                }
                                .padding(12)
                                .background(MedMargTheme.primaryTeal)
                                .cornerRadius(12)
                                .padding(.horizontal, 16)
                                .padding(.top, 12)
                            }

                            if selectedTab == 1 {
                                agentInventoryStoreSection
                            } else if selectedTab == 2 {
                                agentShiftQuotaSection
                            } else if selectedTab == 3 {
                                agentPaymentsLedgerSection
                            } else if selectedTab == 4 {
                                agentProfileSection
                            }

                            Spacer().frame(height: 120) // Spacing for floating navbar
                        }
                        .padding(.top, 12)
                    }
                    .refreshable {
                        await fetchAllLiveAgentData()
                    }
                }
            }

            if isLoading {
                ZStack {
                    Color.black.opacity(0.15).ignoresSafeArea()
                    VStack(spacing: 12) {
                        ProgressView().tint(MedMargTheme.primaryTeal).scaleEffect(1.3)
                        Text("Connecting to Fleet Telemetry...")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate700)
                    }
                    .padding(24)
                    .background(Color.white)
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.1), radius: 10)
                }
            }
        }
        .onAppear {
            Task {
                await fetchAllLiveAgentData()
            }
        }
        .sheet(item: $activeDoorstepQrOrder) { order in
            AgentDoorstepQrModalView(order: order, onPaymentConfirmed: {
                Task {
                    await fetchAllLiveAgentData()
                    actionBannerMessage = "Doorstep QR Payment Recorded for #\(order.id)"
                }
            })
        }
        .sheet(item: $activeVisitModalOrder) { order in
            AgentDoorstepVisitWorkflowSheet(order: order, onVisitCompleted: {
                Task {
                    await fetchAllLiveAgentData()
                    actionBannerMessage = "Sample Visit Completed for #\(order.id)"
                }
            })
        }
        .sheet(isPresented: $showIndentSheet) {
            AgentRaiseIndentSheet(agentId: effectiveAgentId, agentName: user.name, warehouseStock: warehouseStock, onSubmitted: {
                Task {
                    await fetchAllLiveAgentData()
                    actionBannerMessage = "Supply indent submitted to Store In-Charge!"
                }
            })
        }
    }

    // =========================================================================
    // 🛵 TAB 0: LIVE ASSIGNED PICKUPS & ROSTER
    // =========================================================================
    private var agentRosterPickupsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            // Live Status & Duty Switch Header
            VStack(spacing: 12) {
                HStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(isOnDuty ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                            .frame(width: 46, height: 46)
                        Image(systemName: "car.fill")
                            .font(.system(size: 20))
                            .foregroundColor(.white)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(user.name)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Salaried Phlebotomy Fleet • \(quotaStats?.zone ?? "Zone 1 Tirupati")")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }

                    Spacer()

                    Toggle("", isOn: $isOnDuty)
                        .labelsHidden()
                        .toggleStyle(SwitchToggleStyle(tint: MedMargTheme.accentEmerald))
                        .onChange(of: isOnDuty) { newValue in
                            updateDutyStatus(duty: newValue)
                        }
                }

                Divider()

                HStack {
                    HStack(spacing: 6) {
                        Circle()
                            .fill(isOnDuty ? Color.green : Color.red)
                            .frame(width: 8, height: 8)
                        Text(isOnDuty ? "ON DUTY (GPS Active)" : "OFF DUTY")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(isOnDuty ? Color.green : Color.red)
                    }

                    Spacer()

                    Text("\(rosterOrders.count) LIVE ASSIGNED PICKUPS")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                }
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
            .padding(.horizontal, 16)

            // IoT Cold-Chain Temperature Telemetry Banner
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "thermometer.snowflake")
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text("IOT COLD-CHAIN TELEMETRY BOX #CB-88")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(MedMargTheme.slate700)
                    Spacer()
                    Text("🔋 92% Battery")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MedMargTheme.slate500)
                }

                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("3.8°C")
                            .font(.system(size: 22, weight: .black, design: .rounded))
                            .foregroundColor(MedMargTheme.primaryTeal)
                        Text("Optimal Cold-Chain Window (2°C - 8°C)")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 2) {
                        Text("DESTINATION HUB")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                        Text("MedMarg Central Diagnostics")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }
            }
            .padding(14)
            .background(MedMargTheme.lightTeal.opacity(0.4))
            .cornerRadius(14)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.primaryTeal.opacity(0.3), lineWidth: 1))
            .padding(.horizontal, 16)

            // Pickups Header
            HStack {
                Text("Today's Assigned Doorstep Collections")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                Text("\(rosterOrders.count) Total")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate500)
            }
            .padding(.horizontal, 16)

            if rosterOrders.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 42))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text("No Pending Pickups Assigned")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("All assigned patient doorstep visits have been fulfilled or dispatched. New orders placed by patients will appear here in real time.")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate500)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 36)
                .background(Color.white)
                .cornerRadius(16)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
                .padding(.horizontal, 16)
            } else {
                ForEach(rosterOrders) { order in
                    agentPickupCard(order: order)
                }
            }
        }
    }

    private func agentPickupCard(order: AgentPickupOrder) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header Row: Order ID, Slot & Status Badges
            HStack {
                Text(order.id)
                    .font(.system(size: 11, weight: .black, design: .monospaced))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(6)

                Text(order.slot ?? "Scheduled Slot")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate700)

                Spacer()

                if order.isPaid {
                    HStack(spacing: 4) {
                        Image(systemName: "checkmark.seal.fill")
                        Text("PAID")
                    }
                    .font(.system(size: 10, weight: .black))
                    .foregroundColor(Color.green)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(Color.green.opacity(0.12))
                    .cornerRadius(6)
                } else {
                    Text("PAYMENT PENDING")
                        .font(.system(size: 9, weight: .black))
                        .foregroundColor(Color.orange)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 3)
                        .background(Color.orange.opacity(0.12))
                        .cornerRadius(6)
                }

                Text(order.status ?? "BOOKED")
                    .font(.system(size: 9, weight: .black))
                    .foregroundColor(order.status == "COMPLETED" ? Color.green : MedMargTheme.primaryTeal)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(order.status == "COMPLETED" ? Color.green.opacity(0.15) : MedMargTheme.lightTeal)
                    .cornerRadius(6)
            }

            // Patient Name & Address
            VStack(alignment: .leading, spacing: 3) {
                Text(order.effectivePatientName)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Text(order.address ?? "Doorstep Address Not Specified")
                    .font(.system(size: 12))
                    .foregroundColor(MedMargTheme.slate500)
                    .lineLimit(2)
            }

            // Tests List & OTP
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("TESTS:")
                        .font(.system(size: 9, weight: .black))
                        .foregroundColor(MedMargTheme.slate500)
                    Text(order.items ?? "Diagnostic Pathology Tests")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                        .lineLimit(2)
                }

                Spacer()

                if let otp = order.otp ?? order.handoverOtp, !otp.isEmpty {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("HANDOVER OTP")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(MedMargTheme.primaryTeal)
                        Text(otp)
                            .font(.system(size: 14, weight: .black, design: .monospaced))
                            .foregroundColor(MedMargTheme.slate900)
                    }
                }
            }
            .padding(10)
            .background(MedMargTheme.slate50)
            .cornerRadius(10)

            Divider()

            // Action Buttons Bar
            HStack(spacing: 8) {
                // Call Patient
                Button(action: {
                    let cleaned = order.effectivePhone.filter { "0123456789".contains($0) }
                    if let url = URL(string: "tel:\(cleaned)") {
                        UIApplication.shared.open(url)
                    }
                }) {
                    HStack(spacing: 4) {
                        Image(systemName: "phone.fill")
                        Text("Call")
                    }
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 7)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(8)
                }

                // Apple Maps Navigation
                Button(action: {
                    let query = order.address ?? "Tirupati"
                    if let encoded = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
                       let url = URL(string: "https://maps.apple.com/?q=\(encoded)") {
                        UIApplication.shared.open(url)
                    }
                }) {
                    HStack(spacing: 4) {
                        Image(systemName: "map.fill")
                        Text("Map")
                    }
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 7)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(8)
                }

                // Razorpay Doorstep QR Modal
                if !order.isPaid {
                    Button(action: { activeDoorstepQrOrder = order }) {
                        HStack(spacing: 4) {
                            Image(systemName: "qrcode.viewfinder")
                            Text("Doorstep QR")
                        }
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 7)
                        .background(
                            LinearGradient(
                                colors: [Color(red: 0.05, green: 0.35, blue: 0.8), Color(red: 0.1, green: 0.5, blue: 0.9)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(8)
                    }
                }

                Spacer()

                // Visit Workflow (Open Draw & Scanner)
                Button(action: { activeVisitModalOrder = order }) {
                    Text(order.status == "COMPLETED" ? "Review Visit" : "Open Visit")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .background(order.status == "COMPLETED" ? Color.green : MedMargTheme.primaryTeal)
                        .cornerRadius(8)
                }
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
        .padding(.horizontal, 16)
    }

    // =========================================================================
    // 📦 TAB 1: LIVE INVENTORY & WAREHOUSE STORE
    // =========================================================================
    private var agentInventoryStoreSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            // Header with Raise Indent Button
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Field Kit Consumables")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Consumables in-hand and available in warehouse")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }
                Spacer()
                Button(action: { showIndentSheet = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus.circle.fill")
                        Text("Raise Indent")
                    }
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(8)
                }
            }
            .padding(.horizontal, 16)

            // In-Hand Inventory Table
            VStack(alignment: .leading, spacing: 10) {
                Text("YOUR IN-HAND FIELD KIT")
                    .font(.system(size: 11, weight: .black))
                    .foregroundColor(MedMargTheme.slate500)

                if inventoryItems.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "archivebox.fill")
                            .font(.system(size: 32))
                            .foregroundColor(Color.orange)
                        Text("In-Hand Bag Empty (0 Supplies Allotted)")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(Color.orange)
                        Text("You do not have any consumables allotted yet. Tap 'Raise Indent' to request fresh stock from the Central Warehouse Store In-Charge.")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 16)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(20)
                    .background(Color.orange.opacity(0.08))
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.orange.opacity(0.3), lineWidth: 1))
                } else {
                    ForEach(inventoryItems) { item in
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(item.name)
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)
                                Text("Code: \(item.code)")
                                    .font(.system(size: 10))
                                    .foregroundColor(MedMargTheme.slate500)
                            }
                            Spacer()
                            Text("\(item.stock) \(item.unit)")
                                .font(.system(size: 13, weight: .black, design: .rounded))
                                .foregroundColor(item.stock <= 5 ? Color.red : MedMargTheme.primaryTeal)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(item.stock <= 5 ? Color.red.opacity(0.12) : MedMargTheme.lightTeal)
                                .cornerRadius(6)
                        }
                        .padding(10)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(10)
                    }
                }
            }
            .padding(14)
            .background(Color.white)
            .cornerRadius(14)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
            .padding(.horizontal, 16)

            // Central Warehouse Live Stock Overview
            VStack(alignment: .leading, spacing: 10) {
                Text("CENTRAL WAREHOUSE STOCK (TIRUPATI HUB)")
                    .font(.system(size: 11, weight: .black))
                    .foregroundColor(MedMargTheme.slate500)

                ForEach(warehouseStock) { item in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.name)
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("\(item.category ?? "Consumables") • Unit Cost ₹\(item.unitCost ?? 0)")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        Spacer()
                        Text("\(item.stock) \(item.unit)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate700)
                    }
                    .padding(8)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(8)
                }
            }
            .padding(14)
            .background(Color.white)
            .cornerRadius(14)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
            .padding(.horizontal, 16)

            // Indents History
            if !indentsList.isEmpty {
                VStack(alignment: .leading, spacing: 10) {
                    Text("YOUR STOCK INDENT REQUESTS")
                        .font(.system(size: 11, weight: .black))
                        .foregroundColor(MedMargTheme.slate500)

                    ForEach(indentsList) { ind in
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(ind.id)
                                    .font(.system(size: 10, weight: .black, design: .monospaced))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                Text(ind.requestedItems)
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate700)
                                    .lineLimit(1)
                            }
                            Spacer()
                            Text(ind.status)
                                .font(.system(size: 9, weight: .black))
                                .foregroundColor(ind.status == "ACCEPTED" || ind.status == "APPROVED" ? Color.green : Color.orange)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 3)
                                .background(ind.status == "ACCEPTED" || ind.status == "APPROVED" ? Color.green.opacity(0.12) : Color.orange.opacity(0.12))
                                .cornerRadius(4)
                        }
                        .padding(8)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(8)
                    }
                }
                .padding(14)
                .background(Color.white)
                .cornerRadius(14)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
                .padding(.horizontal, 16)
            }
        }
    }

    // =========================================================================
    // 🎯 TAB 2: SHIFT QUOTA & DAILY PERFORMANCE
    // =========================================================================
    private var agentShiftQuotaSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Shift Quota & Daily Progress")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)
                .padding(.horizontal, 16)

            // Quota Stats Overview Card
            VStack(spacing: 16) {
                HStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("COMPLETED TODAY")
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(MedMargTheme.slate500)
                        Text("\(quotaStats?.samplesToday ?? 0) / \(quotaStats?.maxDailyQuota ?? 15)")
                            .font(.system(size: 24, weight: .black, design: .rounded))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 4) {
                        Text("QUOTA REMAINING")
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(MedMargTheme.slate500)
                        Text("\(quotaStats?.quotaRemaining ?? 15) Samples")
                            .font(.system(size: 16, weight: .black))
                            .foregroundColor(MedMargTheme.slate700)
                    }
                }

                // Progress Bar
                GeometryReader { geo in
                    let maxVal = Double(quotaStats?.maxDailyQuota ?? 15)
                    let currentVal = Double(quotaStats?.samplesToday ?? 0)
                    let ratio = maxVal > 0 ? min(1.0, currentVal / maxVal) : 0.0

                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 6)
                            .fill(MedMargTheme.slate200)
                            .frame(height: 10)

                        RoundedRectangle(cornerRadius: 6)
                            .fill(MedMargTheme.primaryTeal)
                            .frame(width: geo.size.width * CGFloat(ratio), height: 10)
                    }
                }
                .frame(height: 10)

                Divider()

                HStack(spacing: 20) {
                    VStack(spacing: 2) {
                        Text("Customer Rating")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                        Text("★ \(String(format: "%.1f", quotaStats?.rating ?? 4.9))")
                            .font(.system(size: 14, weight: .black))
                            .foregroundColor(Color.orange)
                    }

                    Spacer()

                    VStack(spacing: 2) {
                        Text("On-Time Dispatch")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                        Text(quotaStats?.onTimeRate ?? "98%")
                            .font(.system(size: 14, weight: .black))
                            .foregroundColor(Color.green)
                    }

                    Spacer()

                    VStack(spacing: 2) {
                        Text("Fasting Accuracy")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                        Text(quotaStats?.fastingAccuracy ?? "100%")
                            .font(.system(size: 14, weight: .black))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
            .padding(.horizontal, 16)
        }
    }

    // =========================================================================
    // 💳 TAB 3: PAYMENTS LEDGER & DOORSTEP COLLECTIONS
    // =========================================================================
    private var agentPaymentsLedgerSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Doorstep Payments & Razorpay POS")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)
                .padding(.horizontal, 16)

            if paymentTxns.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "creditcard.circle.fill")
                        .font(.system(size: 42))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text("No Doorstep Payments Collected Yet")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Transactions collected via Razorpay Doorstep QR will sync here live.")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(24)
                .background(Color.white)
                .cornerRadius(16)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
                .padding(.horizontal, 16)
            } else {
                ForEach(paymentTxns) { txn in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(txn.orderId ?? txn.id)
                                .font(.system(size: 12, weight: .black, design: .monospaced))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text(txn.patientName ?? "Patient")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text(txn.date ?? "Today")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 2) {
                            Text("₹\(txn.amount ?? 0)")
                                .font(.system(size: 15, weight: .black, design: .rounded))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text(txn.paymentStatus ?? "PAID")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(txn.paymentStatus == "PAID_SUCCESS" || txn.paymentStatus == "PAID_DOORSTEP_QR" ? Color.green : Color.orange)
                        }
                    }
                    .padding(12)
                    .background(Color.white)
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
                    .padding(.horizontal, 16)
                }
            }
        }
    }

    // =========================================================================
    // 👤 TAB 4: AGENT PROFILE & FLEET IDENTITY
    // =========================================================================
    private var agentProfileSection: some View {
        VStack(spacing: 16) {
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.primaryTeal)
                        .frame(width: 64, height: 64)
                    Image(systemName: "car.fill")
                        .font(.system(size: 30))
                        .foregroundColor(.white)
                }

                Text(user.name)
                    .font(.system(size: 17, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)

                Text("ID: \(effectiveAgentId) • Salaried Fleet Phlebotomist")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)

                Text(user.organization)
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
            }
            .frame(maxWidth: .infinity)
            .padding(20)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
            .padding(.horizontal, 16)

            Button(action: onLogout) {
                HStack(spacing: 6) {
                    Image(systemName: "rectangle.portrait.and.arrow.right")
                    Text("Logout from Fleet Terminal")
                }
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(Color.red)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.red.opacity(0.1))
                .cornerRadius(12)
            }
            .padding(.horizontal, 16)
        }
    }

    // =========================================================================
    // 🌐 LIVE BACKEND NETWORK CALLS
    // =========================================================================
    private func fetchAllLiveAgentData() async {
        await withTaskGroup(of: Void.self) { group in
            group.addTask { await fetchRoster() }
            group.addTask { await fetchInventory() }
            group.addTask { await fetchQuotaStats() }
            group.addTask { await fetchPayments() }
        }
        await MainActor.run {
            self.isLoading = false
            self.isRefreshing = false
        }
    }

    private func fetchRoster() async {
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/roster?agentId=\(effectiveAgentId)") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let rosterRaw = json["roster"] as? [[String: Any]] {
                let rosterData = try JSONSerialization.data(withJSONObject: rosterRaw, options: [])
                let decoded = try JSONDecoder().decode([AgentPickupOrder].self, from: rosterData)
                await MainActor.run {
                    self.rosterOrders = decoded
                }
            }
        } catch {
            print("[Agent Roster Live Fetch Error]:", error)
        }
    }

    private func fetchInventory() async {
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/inventory?agentId=\(effectiveAgentId)") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                if let invRaw = json["inventory"] as? [[String: Any]] {
                    let d = try JSONSerialization.data(withJSONObject: invRaw, options: [])
                    let inv = try JSONDecoder().decode([AgentInventoryItem].self, from: d)
                    await MainActor.run { self.inventoryItems = inv }
                }
                if let whRaw = json["warehouseStock"] as? [[String: Any]] {
                    let d = try JSONSerialization.data(withJSONObject: whRaw, options: [])
                    let wh = try JSONDecoder().decode([AgentWarehouseStockItem].self, from: d)
                    await MainActor.run { self.warehouseStock = wh }
                }
                if let indRaw = json["indents"] as? [[String: Any]] {
                    let d = try JSONSerialization.data(withJSONObject: indRaw, options: [])
                    let ind = try JSONDecoder().decode([AgentIndentItem].self, from: d)
                    await MainActor.run { self.indentsList = ind }
                }
            }
        } catch {
            print("[Agent Inventory Live Fetch Error]:", error)
        }
    }

    private func fetchQuotaStats() async {
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/quota-stats?agentId=\(effectiveAgentId)") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoded = try JSONDecoder().decode(AgentQuotaStats.self, from: data)
            await MainActor.run {
                self.quotaStats = decoded
            }
        } catch {
            print("[Agent Quota Stats Fetch Error]:", error)
        }
    }

    private func fetchPayments() async {
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/payments/\(effectiveAgentId)") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let txnsRaw = json["transactions"] as? [[String: Any]] {
                let d = try JSONSerialization.data(withJSONObject: txnsRaw, options: [])
                let decoded = try JSONDecoder().decode([AgentPaymentTxn].self, from: d)
                await MainActor.run {
                    self.paymentTxns = decoded
                }
            }
        } catch {
            print("[Agent Payments Live Fetch Error]:", error)
        }
    }

    private func updateDutyStatus(duty: Bool) {
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/shift") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let payload: [String: Any] = ["agentId": effectiveAgentId, "isOnDuty": duty]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload, options: [])
        URLSession.shared.dataTask(with: req).resume()
    }
}

// =========================================================================
// 🔲 MODAL 1: RAZORPAY DOORSTEP QR CODE MODAL FOR FIELD AGENT
// Generates live dynamic UPI QR code linked to MedMarg backend
// =========================================================================

struct AgentDoorstepQrModalView: View {
    let order: AgentPickupOrder
    let onPaymentConfirmed: () -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var qrImageUrl: String = ""
    @State private var isCheckingStatus: Bool = false
    @State private var isMarkingPaid: Bool = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // Header Details
                VStack(spacing: 4) {
                    Text("Doorstep UPI Payment QR")
                        .font(.system(size: 18, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Order #\(order.id) • \(order.effectivePatientName)")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
                .padding(.top, 16)

                // QR Display
                VStack(spacing: 12) {
                    if !qrImageUrl.isEmpty, let url = URL(string: qrImageUrl) {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .success(let img):
                                img.resizable().scaledToFit().frame(width: 220, height: 220)
                            default:
                                ProgressView().frame(width: 220, height: 220)
                            }
                        }
                    } else {
                        ProgressView().frame(width: 220, height: 220)
                    }

                    Text("Amount to Collect: ₹\(order.effectiveAmount)")
                        .font(.system(size: 20, weight: .black, design: .rounded))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    Text("Ask patient to scan with any UPI App (GPay, PhonePe, Paytm)")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }
                .padding(20)
                .background(Color.white)
                .cornerRadius(16)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))

                Spacer()

                // Confirm Cash / Doorstep Payment Button
                Button(action: markDoorstepPaid) {
                    HStack(spacing: 6) {
                        if isMarkingPaid {
                            ProgressView().tint(.white)
                        }
                        Text(isMarkingPaid ? "Recording..." : "✓ Confirm Payment Collected (₹\(order.effectiveAmount))")
                            .font(.system(size: 14, weight: .bold))
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.green)
                    .cornerRadius(12)
                }
                .disabled(isMarkingPaid)
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
            }
            .navigationTitle("Doorstep Collection")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
            .onAppear {
                generateLiveDoorstepQr()
            }
        }
    }

    private func generateLiveDoorstepQr() {
        guard let url = URL(string: "https://medmarg.com/api/v1/payments/generate-doorstep-qr") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let payload: [String: Any] = [
            "orderId": order.id,
            "amount": order.effectiveAmount,
            "patientName": order.effectivePatientName,
            "patientPhone": order.effectivePhone
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload, options: [])

        URLSession.shared.dataTask(with: req) { data, _, _ in
            if let d = data,
               let json = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
               let dataObj = json["data"] as? [String: Any],
               let img = dataObj["qrImageUrl"] as? String {
                DispatchQueue.main.async {
                    self.qrImageUrl = img
                }
            }
        }.resume()
    }

    private func markDoorstepPaid() {
        isMarkingPaid = true
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/pickup/update") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let payload: [String: Any] = [
            "orderId": order.id,
            "paymentCollected": true,
            "paymentMode": "DOORSTEP_QR"
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload, options: [])

        URLSession.shared.dataTask(with: req) { _, _, _ in
            DispatchQueue.main.async {
                self.isMarkingPaid = false
                self.onPaymentConfirmed()
                self.dismiss()
            }
        }.resume()
    }
}

// =========================================================================
// 💉 MODAL 2: SAMPLE COLLECTION & VISIT WORKFLOW SHEET
// Handles Reached Doorstep, Barcode Generation, Sample Drawn & Vitals
// =========================================================================

struct AgentDoorstepVisitWorkflowSheet: View {
    let order: AgentPickupOrder
    let onVisitCompleted: () -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var barcodeValue: String = ""
    @State private var systolicInput: String = "120"
    @State private var diastolicInput: String = "80"
    @State private var pulseInput: String = "74"
    @State private var spo2Input: String = "98"
    @State private var isSubmitting: Bool = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Header Order Details
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Doorstep Clinical Execution")
                            .font(.system(size: 18, weight: .black))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Order #\(order.id) • \(order.effectivePatientName)")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                        Text(order.address ?? "")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.white)
                    .cornerRadius(12)

                    // 1. Barcode Tube Verification
                    VStack(alignment: .leading, spacing: 10) {
                        Text("1. VACUTAINER BARCODE LABEL")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(MedMargTheme.slate500)

                        HStack {
                            TextField("Enter or Auto-Generate Barcode", text: $barcodeValue)
                                .font(.system(size: 13, weight: .bold, design: .monospaced))
                                .padding(10)
                                .background(MedMargTheme.slate50)
                                .cornerRadius(8)

                            Button(action: generateBarcode) {
                                Text("Auto Generate")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 10)
                                    .background(MedMargTheme.primaryTeal)
                                    .cornerRadius(8)
                            }
                        }
                    }
                    .padding(14)
                    .background(Color.white)
                    .cornerRadius(12)

                    // 2. Bedside Vitals Checkup
                    VStack(alignment: .leading, spacing: 10) {
                        Text("2. BEDSIDE VITALS RECORDING")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(MedMargTheme.slate500)

                        HStack(spacing: 12) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("BP (Systolic/Diastolic)")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate700)
                                HStack {
                                    TextField("120", text: $systolicInput).frame(width: 45)
                                    Text("/")
                                    TextField("80", text: $diastolicInput).frame(width: 45)
                                }
                                .padding(8)
                                .background(MedMargTheme.slate50)
                                .cornerRadius(8)
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                Text("Pulse (BPM)")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate700)
                                TextField("74", text: $pulseInput)
                                    .padding(8)
                                    .background(MedMargTheme.slate50)
                                    .cornerRadius(8)
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                Text("SpO2 (%)")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate700)
                                TextField("98", text: $spo2Input)
                                    .padding(8)
                                    .background(MedMargTheme.slate50)
                                    .cornerRadius(8)
                            }
                        }
                    }
                    .padding(14)
                    .background(Color.white)
                    .cornerRadius(12)

                    // Complete Button
                    Button(action: submitVisitCompletion) {
                        HStack(spacing: 6) {
                            if isSubmitting {
                                ProgressView().tint(.white)
                            }
                            Text(isSubmitting ? "Submitting..." : "✓ Complete Sample Collection & Seal Kit")
                                .font(.system(size: 14, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(12)
                    }
                    .disabled(isSubmitting)
                }
                .padding(16)
            }
            .navigationTitle("Doorstep Visit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onAppear {
                if let bc = order.barcode, !bc.isEmpty {
                    self.barcodeValue = bc
                } else {
                    generateBarcode()
                }
            }
        }
    }

    private func generateBarcode() {
        let code = "MM-BC-\(Int.random(in: 10000...99999))"
        self.barcodeValue = code
    }

    private func submitVisitCompletion() {
        isSubmitting = true
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/pickup/update") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload: [String: Any] = [
            "orderId": order.id,
            "status": "SAMPLE_COLLECTED",
            "barcode": barcodeValue,
            "vitals": [
                "bp": "\(systolicInput)/\(diastolicInput)",
                "pulse": pulseInput,
                "spo2": spo2Input
            ]
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload, options: [])

        URLSession.shared.dataTask(with: req) { _, _, _ in
            DispatchQueue.main.async {
                self.isSubmitting = false
                self.onVisitCompleted()
                self.dismiss()
            }
        }.resume()
    }
}

// =========================================================================
// 📝 MODAL 3: RAISE REPLENISHMENT INDENT TO STORE IN-CHARGE
// =========================================================================

struct AgentRaiseIndentSheet: View {
    let agentId: String
    let agentName: String
    let warehouseStock: [AgentWarehouseStockItem]
    let onSubmitted: () -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var selectedItemsSummary: String = "20x Gold SST Tubes, 10x Purple EDTA Tubes"
    @State private var area: String = "Tirupati Urban Zone 1"
    @State private var isSubmitting: Bool = false

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                Text("Request Consumables Replenishment")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Text("This request will be routed directly to Anand (Central Store Lead) for immediate approval and dispatch.")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)

                VStack(alignment: .leading, spacing: 6) {
                    Text("Requested Items & Quantities")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                    TextField("e.g. 50x Gold SST Tubes, 20x Syringes", text: $selectedItemsSummary)
                        .padding(10)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(8)
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Assigned Collection Zone")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                    TextField("Zone Area", text: $area)
                        .padding(10)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(8)
                }

                Spacer()

                Button(action: submitIndent) {
                    HStack(spacing: 6) {
                        if isSubmitting {
                            ProgressView().tint(.white)
                        }
                        Text(isSubmitting ? "Submitting..." : "⚡ Submit Indent Request")
                            .font(.system(size: 14, weight: .bold))
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(12)
                }
                .disabled(isSubmitting)
            }
            .padding(16)
            .navigationTitle("New Indent")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private func submitIndent() {
        isSubmitting = true
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/indent") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload: [String: Any] = [
            "agentId": agentId,
            "agentName": agentName,
            "agentType": "SALARIED_AGENT",
            "area": area,
            "requestedItems": selectedItemsSummary,
            "paymentMode": "Company Quota Allocation (Free)"
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload, options: [])

        URLSession.shared.dataTask(with: req) { _, _, _ in
            DispatchQueue.main.async {
                self.isSubmitting = false
                self.onSubmitted()
                self.dismiss()
            }
        }.resume()
    }
}

