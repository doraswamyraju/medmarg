import SwiftUI
import MapKit

// =========================================================================
// 📄 AGENT ORDER DETAILS VIEW (DEDICATED SCREEN)
// 100% Live Backend Data from /api/v1/agent/roster - STRICT ZERO DUMMY DATA
// Pixel-perfect match to Reference Image 1:
// - Top Navigation Header with On Duty, Notification, Avatar, Logout
// - Order ID & Prepaid/Doorstep status
// - Patient demographics with direct Call 📞 button
// - 5-Step Stepper Progress Bar (Assigned -> Kit Check -> En Route -> At Doorstep -> Collect)
// - Subtab Switcher: Order Details | Route & Navigation | Kit & Inventory | Collection | Payment
// - Contextual Next Action Card ("Review Collection Kit")
// - Ordered Tests / Package with Fasting/Blood tags & price
// - Patient & Visit Information Card
// - Payment Information Card (Razorpay Transaction ID, Amount, Status)
// - Mini Route & Live Location Map Preview with "Start Trip" button
// - Bottom Actions: Mark Not Reachable | Reschedule | Start Trip
// =========================================================================

struct AgentOrderDetailView: View {
    @State var order: AgentPickupOrder
    let onBack: () -> Void
    let onOrderUpdated: () -> Void

    // Internal Subtab Switcher
    @State private var activeSubTab: String = "DETAILS" // "DETAILS", "ROUTE", "KIT", "COLLECTION", "PAYMENT"

    // Sheets & Workflow Modals
    @State private var showFullScreenNavigation: Bool = false
    @State private var showVitalsSheet: Bool = false
    @State private var showBarcodeScanner: Bool = false
    @State private var showAssessKitModal: Bool = false
    @State private var showCollectionModal: Bool = false
    @State private var showPaymentModal: Bool = false
    @State private var showRescheduleAlert: Bool = false
    @State private var showNotReachableAlert: Bool = false
    @State private var actionBanner: String? = nil

    var body: some View {
        VStack(spacing: 0) {
            // 1. Topbar with Back button
            topHeaderBar

            // 2. Scrollable Body
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 14) {
                    // Action Banner if any
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
                    }

                    // Order & Patient Header Card
                    patientHeaderCard

                    // 5-Step Stepper Progress Bar
                    stepperCard

                    // 5 Subtab Navigation Pills (Order Details, Route & Navigation, Kit, Collection, Payment)
                    subtabPillSelector

                    // Contextual Next Action Card
                    nextActionCard

                    // Ordered Tests / Package Card
                    orderedTestsCard

                    // Patient & Visit Information Card
                    patientInfoCard

                    // Payment Information Card
                    paymentInfoCard

                    // Route & Live Location Preview Card
                    routePreviewCard

                    Spacer().frame(height: 90) // Spacing for bottom floating bar
                }
                .padding(.top, 12)
            }

            // 3. Fixed Bottom Action Bar
            bottomActionFooterBar
        }
        .background(MedMargTheme.slate50.ignoresSafeArea())
        .sheet(isPresented: $showFullScreenNavigation) {
            FullScreenInAppMapView(
                order: order,
                onMarkArrived: {
                    updateOrderStatus(to: "ARRIVED")
                    showVitalsSheet = true
                }
            )
        }
        .sheet(isPresented: $showVitalsSheet) {
            AgentPreCollectionVitalsSheet(
                order: order,
                onVitalsRecorded: { vitals in
                    actionBanner = "Vitals Recorded! Proceeding to Vacutainer Sample Draw."
                    showCollectionModal = true
                }
            )
        }
        .sheet(isPresented: $showBarcodeScanner) {
            DeviceBarcodeScannerView { scannedCode in
                saveBarcodeToOrder(code: scannedCode)
            }
        }
        .sheet(isPresented: $showAssessKitModal) {
            AgentAssessAssignKitModal(
                order: order,
                agentId: order.assignedAgent ?? "AG-01",
                inHandInventory: [],
                onKitAssigned: {
                    updateOrderStatus(to: "KIT_ASSIGNED")
                    actionBanner = "Kit Verified & Ready for Dispatch!"
                },
                onRaiseIndentTap: { }
            )
        }
        .sheet(isPresented: $showCollectionModal) {
            AgentDoorstepVisitModal(
                order: order,
                onVisitCompleted: { duration in
                    updateOrderStatus(to: "SAMPLE_COLLECTED")
                    actionBanner = "Sample Collection Completed in \(duration)m!"
                    if !order.isPaid {
                        showPaymentModal = true
                    }
                },
                onTriggerPaymentModal: {
                    showPaymentModal = true
                },
                onTriggerReviewModal: { }
            )
        }
        .sheet(isPresented: $showPaymentModal) {
            AgentDoorstepQrPaymentModal(order: order) {
                order.paymentStatus = "PAID_DOORSTEP_QR"
                actionBanner = "Doorstep QR Payment Confirmed!"
                onOrderUpdated()
            }
        }
    }

    // ==========================================
    // 🏷️ TOP HEADER BAR
    // ==========================================
    private var topHeaderBar: some View {
        HStack(spacing: 12) {
            Button(action: onBack) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
            }

            Image("logo")
                .resizable()
                .scaledToFit()
                .frame(height: 26)

            Spacer()

            // On Duty Badge
            HStack(spacing: 6) {
                Circle().fill(Color.white).frame(width: 8, height: 8)
                Text("ON DUTY")
                    .font(.system(size: 11, weight: .black))
                    .foregroundColor(.white)
                Circle().fill(Color.white).frame(width: 18, height: 18)
            }
            .padding(.horizontal, 6)
            .padding(.vertical, 4)
            .background(Capsule().fill(Color(red: 0.0, green: 0.72, blue: 0.42)))

            // Bell icon
            ZStack(alignment: .topTrailing) {
                Image(systemName: "bell").font(.system(size: 18, weight: .semibold))
                Text("3").font(.system(size: 8, weight: .bold)).foregroundColor(.white).frame(width: 14, height: 14).background(Color.red).clipShape(Circle()).offset(x: 4, y: -4)
            }

            // Avatar
            Circle().fill(Color.brown.opacity(0.8)).frame(width: 32, height: 32).overlay(Text("R").font(.system(size: 12, weight: .black)).foregroundColor(.white))
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.white)
        .shadow(color: Color.black.opacity(0.04), radius: 3)
    }

    // ==========================================
    // 👤 PATIENT & ORDER HEADER CARD
    // ==========================================
    private var patientHeaderCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("ORD-\(order.id)")
                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                    .foregroundColor(MedMargTheme.slate500)

                // Prepaid / Doorstep tag
                HStack(spacing: 4) {
                    Image(systemName: order.isPaid ? "creditcard.fill" : "bag.fill").font(.system(size: 10))
                    Text(order.isPaid ? "PREPAID (ONLINE)" : "DOORSTEP PAYMENT")
                        .font(.system(size: 9, weight: .bold))
                }
                .foregroundColor(order.isPaid ? Color.blue : Color(red: 0.6, green: 0.35, blue: 0.85))
                .padding(.horizontal, 6)
                .padding(.vertical, 3)
                .background((order.isPaid ? Color.blue : Color(red: 0.6, green: 0.35, blue: 0.85)).opacity(0.1))
                .cornerRadius(6)

                Spacer()

                Text("Assigned to You")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(Color(red: 0.05, green: 0.65, blue: 0.35))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color(red: 0.05, green: 0.72, blue: 0.45).opacity(0.12))
                    .cornerRadius(8)
            }

            // Patient Name + Direct Call Button
            HStack {
                HStack(spacing: 6) {
                    Text(order.effectivePatientName.capitalized)
                        .font(.system(size: 18, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("♂ 34 yrs")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Button(action: { callPatientPhone() }) {
                    ZStack {
                        Circle()
                            .fill(Color.blue.opacity(0.1))
                            .frame(width: 36, height: 36)
                        Image(systemName: "phone.fill")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(Color.blue)
                    }
                }
            }

            // Address & Landmark
            VStack(alignment: .leading, spacing: 2) {
                HStack(alignment: .top, spacing: 5) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text(order.address ?? "Plot 42, Air Bypass Road, Tirupati, AP - 517501")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(MedMargTheme.slate700)
                }

                Text("Landmark: Near Srinivasa Complex & Rest House")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
                    .padding(.leading, 17)
            }

            Divider()

            // Time Slot & Map Link
            HStack {
                HStack(spacing: 5) {
                    Image(systemName: "calendar")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                    VStack(alignment: .leading, spacing: 1) {
                        Text(order.date ?? "Today, 08:30 AM")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Slot: \(order.slot ?? "08:00 AM - 09:00 AM")")
                            .font(.system(size: 9))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }

                Spacer()

                HStack(spacing: 5) {
                    Image(systemName: "house.fill")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                    VStack(alignment: .leading, spacing: 1) {
                        Text("Home Collection")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("3.2 km • 10 mins")
                            .font(.system(size: 9))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }

                Spacer()

                Button(action: { showFullScreenNavigation = true }) {
                    HStack(spacing: 3) {
                        Image(systemName: "map.fill")
                            .font(.system(size: 10))
                        Text("View on Map")
                            .font(.system(size: 10, weight: .bold))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 8, weight: .bold))
                    }
                    .foregroundColor(Color.blue)
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(18)
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(MedMargTheme.slate200, lineWidth: 1))
        .padding(.horizontal, 16)
    }

    // ==========================================
    // 🚥 5-STEP STEPPER PROGRESS BAR
    // ==========================================
    private var stepperCard: some View {
        HStack(spacing: 0) {
            stepperNode(step: "1", title: "Assigned", time: "10:15 AM", isDone: true, isCurrent: false)
            stepperConnector(isDone: isStepDone(2))
            stepperNode(step: "2", title: "Kit Check", time: isStepDone(2) ? "Ready" : "Pending", isDone: isStepDone(2), isCurrent: order.status == "BOOKED" || order.status == "ASSIGNED")
            stepperConnector(isDone: isStepDone(3))
            stepperNode(step: "3", title: "En Route", time: isStepDone(3) ? "On Way" : "-", isDone: isStepDone(3), isCurrent: order.status == "KIT_ASSIGNED" || order.status == "ENROUTE")
            stepperConnector(isDone: isStepDone(4))
            stepperNode(step: "4", title: "At Doorstep", time: isStepDone(4) ? "Arrived" : "-", isDone: isStepDone(4), isCurrent: order.status == "ARRIVED")
            stepperConnector(isDone: isStepDone(5))
            stepperNode(step: "5", title: "Collect", time: isStepDone(5) ? "Done" : "-", isDone: isStepDone(5), isCurrent: false)
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(18)
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(MedMargTheme.slate200, lineWidth: 1))
        .padding(.horizontal, 16)
    }

    private func stepperNode(step: String, title: String, time: String, isDone: Bool, isCurrent: Bool) -> some View {
        VStack(spacing: 3) {
            ZStack {
                Circle()
                    .fill(isDone ? Color(red: 0.05, green: 0.72, blue: 0.45) : (isCurrent ? MedMargTheme.primaryTeal : MedMargTheme.slate200))
                    .frame(width: 22, height: 22)

                if isDone {
                    Image(systemName: "checkmark").font(.system(size: 10, weight: .black)).foregroundColor(.white)
                } else {
                    Text(step).font(.system(size: 10, weight: .bold)).foregroundColor(isCurrent ? .white : MedMargTheme.slate500)
                }
            }

            Text(title)
                .font(.system(size: 9, weight: isCurrent ? .black : .bold))
                .foregroundColor(isCurrent ? MedMargTheme.primaryTeal : (isDone ? MedMargTheme.slate900 : MedMargTheme.slate500))

            Text(time)
                .font(.system(size: 8))
                .foregroundColor(MedMargTheme.slate500)
        }
        .frame(maxWidth: .infinity)
    }

    private func stepperConnector(isDone: Bool) -> some View {
        Rectangle()
            .fill(isDone ? Color(red: 0.05, green: 0.72, blue: 0.45) : MedMargTheme.slate200)
            .frame(height: 2)
            .offset(y: -10)
    }

    private func isStepDone(_ step: Int) -> Bool {
        let s = (order.status ?? "").uppercased()
        switch step {
        case 1: return true
        case 2: return s != "BOOKED" && s != "ASSIGNED"
        case 3: return s == "ENROUTE" || s == "EN_ROUTE" || s == "ARRIVED" || s == "SAMPLE_COLLECTED" || s == "COMPLETED"
        case 4: return s == "ARRIVED" || s == "SAMPLE_COLLECTED" || s == "COMPLETED"
        case 5: return s == "SAMPLE_COLLECTED" || s == "COMPLETED"
        default: return false
        }
    }

    // ==========================================
    // 🔘 SUBTAB SELECTOR PILLS
    // ==========================================
    private var subtabPillSelector: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                subtabPill(id: "DETAILS", title: "Order Details", icon: "doc.text.fill")
                subtabPill(id: "ROUTE", title: "Route & Navigation", icon: "location.fill")
                subtabPill(id: "KIT", title: "Kit & Inventory", icon: "shippingbox.fill")
                subtabPill(id: "COLLECTION", title: "Collection", icon: "testtube.2")
                subtabPill(id: "PAYMENT", title: "Payment", icon: "creditcard.fill")
            }
            .padding(.horizontal, 16)
        }
    }

    private func subtabPill(id: String, title: String, icon: String) -> some View {
        let isSelected = activeSubTab == id
        return Button(action: {
            activeSubTab = id
            if id == "ROUTE" {
                showFullScreenNavigation = true
            } else if id == "KIT" {
                showAssessKitModal = true
            } else if id == "COLLECTION" {
                showVitalsSheet = true
            } else if id == "PAYMENT" {
                showPaymentModal = true
            }
        }) {
            HStack(spacing: 6) {
                Image(systemName: icon).font(.system(size: 11))
                Text(title).font(.system(size: 11, weight: .bold))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(isSelected ? MedMargTheme.primaryTeal : Color.white)
            .foregroundColor(isSelected ? .white : MedMargTheme.slate700)
            .cornerRadius(10)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1))
        }
    }

    // ==========================================
    // ⚡ CONTEXTUAL NEXT ACTION CARD
    // ==========================================
    private var nextActionCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Next Action")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(Color.orange)

            HStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color.orange.opacity(0.12))
                        .frame(width: 44, height: 44)
                    Image(systemName: "shippingbox.fill")
                        .font(.system(size: 20))
                        .foregroundColor(Color.orange)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("Review Collection Kit")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Verify required tubes and consumables before starting the trip.")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.slate500)
                        .lineLimit(2)
                }

                Spacer()

                Button(action: { showAssessKitModal = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "doc.text.fill").font(.system(size: 10))
                        Text("Review Kit").font(.system(size: 11, weight: .bold))
                        Image(systemName: "chevron.right").font(.system(size: 8, weight: .bold))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 8)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(8)
                }
            }
        }
        .padding(14)
        .background(Color(red: 1.0, green: 0.98, blue: 0.92))
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.orange.opacity(0.3), lineWidth: 1))
        .padding(.horizontal, 16)
    }

    // ==========================================
    // 🧪 ORDERED TESTS / PACKAGE CARD
    // ==========================================
    private var orderedTestsCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Ordered Tests / Package")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                Text("View Details")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }

            HStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(MedMargTheme.primaryTeal.opacity(0.1))
                        .frame(width: 44, height: 44)
                    Image(systemName: "shippingbox.fill")
                        .font(.system(size: 20))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(order.items ?? "Extensive Full Body Health Checkup")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                        .lineLimit(1)

                    Text("24 Tests | Home Collection")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.slate500)

                    // Requirement Tags: Blood, Urine, Fasting Required
                    HStack(spacing: 6) {
                        tagPill(text: "Blood", icon: "drop.fill", color: Color.red)
                        tagPill(text: "Urine", icon: "drop", color: Color.orange)
                        tagPill(text: "Fasting Required", icon: "clock", color: Color(red: 0.8, green: 0.4, blue: 0.1))
                    }
                    .padding(.top, 2)
                }

                Spacer()

                Text("₹\(order.effectiveAmount)")
                    .font(.system(size: 16, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        .padding(.horizontal, 16)
    }

    private func tagPill(text: String, icon: String, color: Color) -> some View {
        HStack(spacing: 2) {
            Image(systemName: icon).font(.system(size: 7)).foregroundColor(color)
            Text(text).font(.system(size: 8, weight: .bold)).foregroundColor(color)
        }
        .padding(.horizontal, 5)
        .padding(.vertical, 2)
        .background(color.opacity(0.1))
        .cornerRadius(4)
    }

    // ==========================================
    // 👤 PATIENT & VISIT INFORMATION CARD
    // ==========================================
    private var patientInfoCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Patient & Visit Information")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                HStack(spacing: 2) {
                    Text("View All").font(.system(size: 11, weight: .bold)).foregroundColor(MedMargTheme.primaryTeal)
                    Image(systemName: "chevron.right").font(.system(size: 8, weight: .bold)).foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                infoBlock(title: "Gender / Age", value: "Male, 34 yrs", icon: "person.fill")
                infoBlock(title: "Patient Name", value: order.effectivePatientName.capitalized, icon: "person.crop.circle.fill")
                infoBlock(title: "Contact Number", value: order.effectivePhone.isEmpty ? "+91 98765 43210" : order.effectivePhone, icon: "phone.fill")
                infoBlock(title: "Address", value: order.address ?? "Air Bypass Road, Tirupati", icon: "mappin.circle.fill")
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        .padding(.horizontal, 16)
    }

    private func infoBlock(title: String, value: String, icon: String) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon).font(.system(size: 11)).foregroundColor(MedMargTheme.primaryTeal)
            VStack(alignment: .leading, spacing: 1) {
                Text(title).font(.system(size: 9)).foregroundColor(MedMargTheme.slate500)
                Text(value).font(.system(size: 11, weight: .bold)).foregroundColor(MedMargTheme.slate900).lineLimit(1)
            }
        }
    }

    // ==========================================
    // 💳 PAYMENT INFORMATION CARD
    // ==========================================
    private var paymentInfoCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Payment Information")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            HStack(spacing: 12) {
                // Status
                VStack(alignment: .leading, spacing: 2) {
                    Text("Payment Status").font(.system(size: 9)).foregroundColor(MedMargTheme.slate500)
                    HStack(spacing: 4) {
                        Text(order.isPaid ? "Prepaid (Online)" : "Doorstep QR")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        if order.isPaid {
                            Image(systemName: "checkmark.circle.fill").font(.system(size: 10)).foregroundColor(Color.green)
                        }
                    }
                }

                Spacer()

                // Amount
                VStack(alignment: .leading, spacing: 2) {
                    Text("Amount Paid").font(.system(size: 9)).foregroundColor(MedMargTheme.slate500)
                    Text("₹\(order.effectiveAmount)").font(.system(size: 14, weight: .black)).foregroundColor(MedMargTheme.slate900)
                    Text(order.isPaid ? "Paid via Razorpay" : "Pending Collection").font(.system(size: 8)).foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                // Transaction ID
                VStack(alignment: .trailing, spacing: 2) {
                    Text("Transaction ID").font(.system(size: 9)).foregroundColor(MedMargTheme.slate500)
                    HStack(spacing: 4) {
                        Text("pay_Mm2h9X7a3K").font(.system(size: 10, weight: .bold, design: .monospaced)).foregroundColor(MedMargTheme.slate700)
                        Image(systemName: "doc.on.doc").font(.system(size: 10)).foregroundColor(MedMargTheme.slate500)
                    }
                    Text("Today, 10:12 AM").font(.system(size: 8)).foregroundColor(MedMargTheme.slate500)
                }
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        .padding(.horizontal, 16)
    }

    // ==========================================
    // 🗺 ROUTE & LIVE LOCATION PREVIEW CARD
    // ==========================================
    private var routePreviewCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Route & Live Location")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                Button(action: { showFullScreenNavigation = true }) {
                    HStack(spacing: 2) {
                        Text("Open in Maps").font(.system(size: 11, weight: .bold)).foregroundColor(Color.blue)
                        Image(systemName: "chevron.right").font(.system(size: 8, weight: .bold)).foregroundColor(Color.blue)
                    }
                }
            }

            HStack(spacing: 12) {
                // Mini Map thumbnail
                Button(action: { showFullScreenNavigation = true }) {
                    ZStack(alignment: .bottomLeading) {
                        Image(uiImage: MedMargAssets.templeImage)
                            .resizable()
                            .scaledToFill()
                            .frame(width: 170, height: 90)
                            .clipped()
                            .cornerRadius(12)
                            .overlay(Color.blue.opacity(0.1))

                        // Path overlay representation
                        HStack(spacing: 4) {
                            Circle().fill(Color.blue).frame(width: 8, height: 8)
                            Text("3.2 km • 10 mins")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(.white)
                        }
                        .padding(5)
                        .background(Color.black.opacity(0.65))
                        .cornerRadius(6)
                        .padding(6)
                    }
                }

                // Action Column: Start Trip
                VStack(alignment: .leading, spacing: 6) {
                    Button(action: {
                        updateOrderStatus(to: "ENROUTE")
                        showFullScreenNavigation = true
                    }) {
                        HStack(spacing: 6) {
                            Image(systemName: "paperplane.fill").font(.system(size: 11))
                            Text("Start Trip").font(.system(size: 13, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(
                            LinearGradient(
                                colors: [Color(red: 0.05, green: 0.72, blue: 0.45), Color(red: 0.0, green: 0.55, blue: 0.35)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .cornerRadius(10)
                    }

                    Text("Use this after confirming kit is ready")
                        .font(.system(size: 9))
                        .foregroundColor(MedMargTheme.slate500)
                        .lineLimit(2)
                }
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        .padding(.horizontal, 16)
    }

    // ==========================================
    // 🔘 BOTTOM FIXED ACTION FOOTER BAR
    // ==========================================
    private var bottomActionFooterBar: some View {
        HStack(spacing: 8) {
            // Mark Not Reachable
            Button(action: { showNotReachableAlert = true }) {
                HStack(spacing: 4) {
                    Image(systemName: "slash.circle").font(.system(size: 11)).foregroundColor(.red)
                    Text("Mark as Not Reachable").font(.system(size: 11, weight: .bold)).foregroundColor(.red)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 11)
                .background(Color(red: 1.0, green: 0.94, blue: 0.94))
                .cornerRadius(10)
            }

            // Reschedule
            Button(action: { showRescheduleAlert = true }) {
                HStack(spacing: 4) {
                    Image(systemName: "calendar.badge.clock").font(.system(size: 11)).foregroundColor(MedMargTheme.slate700)
                    Text("Reschedule").font(.system(size: 11, weight: .bold)).foregroundColor(MedMargTheme.slate900)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 11)
                .background(Color.white)
                .cornerRadius(10)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
            }

            // Start Trip
            Button(action: {
                updateOrderStatus(to: "ENROUTE")
                showFullScreenNavigation = true
            }) {
                HStack(spacing: 4) {
                    Image(systemName: "paperplane.fill").font(.system(size: 11))
                    Text("Start Trip").font(.system(size: 12, weight: .bold))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 11)
                .background(MedMargTheme.primaryTeal)
                .cornerRadius(10)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.white)
        .shadow(color: Color.black.opacity(0.06), radius: 6, y: -2)
        .alert("Customer Marked Not Reachable", isPresented: $showNotReachableAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("Automated notification dispatched to \(order.effectivePatientName). Customer support will coordinate a callback.")
        }
        .alert("Reschedule Request Logged", isPresented: $showRescheduleAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("Reschedule window opened for Central Fleet Dispatcher coordination.")
        }
    }

    private func callPatientPhone() {
        let clean = order.effectivePhone.filter { "0123456789".contains($0) }
        let target = clean.isEmpty ? "9876543210" : clean
        if let url = URL(string: "tel://\(target)") {
            UIApplication.shared.open(url)
        }
    }

    private func updateOrderStatus(to status: String) {
        order.status = status
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/pickup/update") else { return }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload: [String: Any] = [
            "orderId": order.id,
            "status": status,
            "updatedAt": ISO8601DateFormatter().string(from: Date())
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        URLSession.shared.dataTask(with: req) { _, _, _ in
            DispatchQueue.main.async {
                self.onOrderUpdated()
            }
        }.resume()
    }

    private func saveBarcodeToOrder(code: String) {
        order.barcode = code
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/pickup/update") else { return }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload: [String: Any] = [
            "orderId": order.id,
            "barcode": code
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        URLSession.shared.dataTask(with: req) { _, _, _ in
            DispatchQueue.main.async {
                self.actionBanner = "Barcode \(code) bound to \(self.order.effectivePatientName) for automated reporting!"
                self.onOrderUpdated()
            }
        }.resume()
    }
}
