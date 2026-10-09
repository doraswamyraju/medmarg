import SwiftUI
import MapKit

// =========================================================================
// 📍 CARE SEEKER LIVE DISPATCH & PHLEBOTOMIST TELEMETRY RADAR
// 100% Feature Parity with Web CareSeekerTrackingTab.jsx & CareSeekerRouteMap
// =========================================================================

struct LiveOrderItem: Identifiable, Equatable {
    let id: String
    let name: String
    let price: Int
}

struct LiveOrderModel: Identifiable, Equatable {
    let id: String
    let date: String
    let slot: String
    let address: String
    let phleboName: String
    let phleboPhone: String
    var status: String // BOOKED, ASSIGNED, ENROUTE, SAMPLE_COLLECTED, IN_LAB, COMPLETED
    var eta: String
    var tempTelemetry: String
    let handoverOtp: String
    let items: [LiveOrderItem]
    let totalAmount: Int
    let paymentStatus: String
}

struct OrderStep {
    let key: String
    let label: String
    let desc: String
    let done: Bool
}

struct CareSeekerTrackingView: View {
    @Binding var selectedTab: Int
    let onOrderCall: () -> Void

    @State private var allOrders: [LiveOrderModel] = [
        LiveOrderModel(
            id: "MM-LAB-9842",
            date: "31 Aug 2026",
            slot: "07:30 AM - 08:30 AM",
            address: "Plot 42, Air Bypass Road, Tirupati, AP - 517501",
            phleboName: "Ramesh Kumar (Certified Phlebotomist)",
            phleboPhone: "+91 98765 11223",
            status: "ENROUTE",
            eta: "14 Mins",
            tempTelemetry: "3.8°C (Optimal Cold-Chain)",
            handoverOtp: "4821",
            items: [
                LiveOrderItem(id: "1", name: "MedMarg Master Health Checkup (Comprehensive)", price: 1499),
                LiveOrderItem(id: "2", name: "Thyroid Profile Total (T3/T4/TSH)", price: 299)
            ],
            totalAmount: 1798,
            paymentStatus: "PAID"
        ),
        LiveOrderModel(
            id: "MM-LAB-7193",
            date: "15 Sep 2026",
            slot: "06:30 AM - 07:30 AM",
            address: "Door 12-4/A, Gandhi Road, Tirupati, AP - 517502",
            phleboName: "Anand Reddy (Lead Phlebotomist)",
            phleboPhone: "+91 98480 22334",
            status: "COMPLETED",
            eta: "Delivered",
            tempTelemetry: "4.1°C (Completed)",
            handoverOtp: "8912",
            items: [
                LiveOrderItem(id: "3", name: "HbA1c & Fasting Blood Sugar", price: 399)
            ],
            totalAmount: 399,
            paymentStatus: "PAID"
        )
    ]

    @State private var selectedOrderIndex: Int = 0
    @State private var isPulsingRadar: Bool = false

    private var currentOrder: LiveOrderModel {
        guard !allOrders.isEmpty else {
            return LiveOrderModel(
                id: "MM-LAB-9842",
                date: "Today",
                slot: "07:30 AM - 08:30 AM",
                address: "Plot 42, Air Bypass Road, Tirupati, AP - 517501",
                phleboName: "Ramesh Kumar",
                phleboPhone: "+91 98765 11223",
                status: "ENROUTE",
                eta: "14 Mins",
                tempTelemetry: "3.8°C",
                handoverOtp: "4821",
                items: [],
                totalAmount: 1798,
                paymentStatus: "PAID"
            )
        }
        return allOrders[min(selectedOrderIndex, allOrders.count - 1)]
    }

    private var steps: [OrderStep] {
        let status = currentOrder.status
        return [
            OrderStep(key: "BOOKED", label: "Order Booked", desc: "Confirmed by Lab Hub", done: true),
            OrderStep(key: "ASSIGNED", label: "Phlebotomist Assigned", desc: "Vaccinated & Certified", done: true),
            OrderStep(key: "ENROUTE", label: "Enroute to Doorstep", desc: currentOrder.eta.isEmpty ? "On the way" : "ETA: \(currentOrder.eta)", done: ["ENROUTE", "SAMPLE_COLLECTED", "IN_LAB", "COMPLETED"].contains(status)),
            OrderStep(key: "SAMPLE_COLLECTED", label: "Sample Collected", desc: "Barcoded vacutainers", done: ["SAMPLE_COLLECTED", "IN_LAB", "COMPLETED"].contains(status)),
            OrderStep(key: "IN_LAB", label: "Processing in Lab", desc: "NABL Certified Hub", done: ["IN_LAB", "COMPLETED"].contains(status)),
            OrderStep(key: "COMPLETED", label: "Report Generated", desc: "PDF in Health Vault", done: status == "COMPLETED")
        ]
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                
                // 1. Multi-Order Selector Pills (if multiple orders)
                if allOrders.count > 1 {
                    orderSelectorBar
                }

                // 2. Dispatch Radar Hero Banner with 4-Digit Handover OTP
                dispatchHeroBanner

                // 3. Interactive Route Map Radar
                interactiveMapRadarCard

                // 4. 6-Stage Diagnostic Pipeline Telemetry Stepper
                pipelineStepperCard

                // 5. Assigned Phlebotomist Contact Card & Ordered Tests
                phlebotomistAndBillCards

                Spacer().frame(height: 80)
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
        }
        .background(MedMargTheme.slate50)
        .onAppear {
            isPulsingRadar = true
        }
    }

    // ==========================================
    // 📑 1. MULTI-ORDER SELECTOR BAR
    // ==========================================
    private var orderSelectorBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(0..<allOrders.count, id: \.self) { idx in
                    let ord = allOrders[idx]
                    let isSelected = idx == selectedOrderIndex

                    Button(action: { selectedOrderIndex = idx }) {
                        HStack(spacing: 8) {
                            Circle()
                                .fill(isSelected ? Color.white : MedMargTheme.primaryTeal)
                                .frame(width: 8, height: 8)
                            Text("Order #\(ord.id)")
                                .font(.system(size: 13, weight: .bold))
                            Text(ord.status)
                                .font(.system(size: 10, weight: .black))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(isSelected ? Color.white.opacity(0.25) : MedMargTheme.lightTeal)
                                .foregroundColor(isSelected ? Color.white : MedMargTheme.primaryTeal)
                                .cornerRadius(6)
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(isSelected ? MedMargTheme.primaryTeal : Color.white)
                        .foregroundColor(isSelected ? Color.white : MedMargTheme.slate700)
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1.5)
                        )
                    }
                }
            }
            .padding(.vertical, 2)
        }
    }

    // ==========================================
    // ⚡ 2. DISPATCH HERO BANNER WITH OTP
    // ==========================================
    private var dispatchHeroBanner: some View {
        VStack(spacing: 16) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 6) {
                        Image(systemName: "antenna.radiowaves.left.and.right")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.amberGold)
                        Text("LIVE DISPATCH RADAR • \(currentOrder.id)")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(MedMargTheme.amberLight)
                            .tracking(0.5)
                    }

                    Text(currentOrder.status == "COMPLETED" ? "Sample Processed & Reports Ready" : "Phlebotomist Enroute to Your Doorstep")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(2)

                    Text("📍 \(currentOrder.address)")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.emeraldLight)
                        .lineLimit(2)

                    Text("Scheduled Slot: \(currentOrder.slot)")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(Color.white.opacity(0.9))
                }

                Spacer()
            }

            // 4-Digit Doorstep Handover Security OTP Box
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Image(systemName: "lock.shield.fill")
                            .foregroundColor(MedMargTheme.amberGold)
                        Text("DOORSTEP HANDOVER OTP")
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(MedMargTheme.amberLight)
                    }
                    Text("Share with your phlebotomist to verify sample handover")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.lightTeal)
                }

                Spacer()

                Text(currentOrder.handoverOtp)
                    .font(.system(size: 26, weight: .black, design: .monospaced))
                    .foregroundColor(Color.white)
                    .tracking(4)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.white.opacity(0.12))
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.emeraldLight.opacity(0.4), lineWidth: 1))
            }
            .padding(14)
            .background(Color(red: 0.0, green: 0.22, blue: 0.20))
            .cornerRadius(14)
        }
        .padding(20)
        .background(
            LinearGradient(
                colors: [MedMargTheme.darkTeal, Color(red: 0.0, green: 0.35, blue: 0.32)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(22)
        .shadow(color: MedMargTheme.darkTeal.opacity(0.3), radius: 12, x: 0, y: 6)
    }

    // ==========================================
    // 🗺 3. INTERACTIVE ROUTE MAP RADAR
    // ==========================================
    private var interactiveMapRadarCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Live GPS Radar & Navigation")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Real-time location, route mapping & cold-chain telemetry")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                HStack(spacing: 4) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 8, height: 8)
                        .scaleEffect(isPulsingRadar ? 1.2 : 0.8)
                        .animation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true), value: isPulsingRadar)
                    Text("IoT: \(currentOrder.tempTelemetry)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(Color(red: 0.03, green: 0.5, blue: 0.3))
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.green.opacity(0.12))
                .cornerRadius(20)
            }

            // Map View with Simulated Route
            ZStack {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(red: 0.93, green: 0.95, blue: 0.96))
                    .frame(height: 220)

                // Simulated Map Grid Lines
                VStack(spacing: 24) {
                    ForEach(0..<6) { _ in
                        Divider().background(Color.black.opacity(0.04))
                    }
                }
                .padding(.horizontal, 10)

                // Route Path Simulation
                Path { path in
                    path.move(to: CGPoint(x: 50, y: 160))
                    path.addQuadCurve(to: CGPoint(x: 180, y: 110), control: CGPoint(x: 100, y: 90))
                    path.addLine(to: CGPoint(x: 290, y: 60))
                }
                .stroke(
                    MedMargTheme.primaryTeal,
                    style: StrokeStyle(lineWidth: 4, lineCap: .round, lineJoin: .round, dash: [6, 4])
                )

                // Phlebotomist Marker (Live Moving)
                VStack(spacing: 2) {
                    ZStack {
                        Circle()
                            .fill(MedMargTheme.primaryTeal.opacity(0.2))
                            .frame(width: 44, height: 44)
                            .scaleEffect(isPulsingRadar ? 1.3 : 0.9)
                            .animation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true), value: isPulsingRadar)

                        Circle()
                            .fill(MedMargTheme.primaryTeal)
                            .frame(width: 32, height: 32)

                        Image(systemName: "bicycle")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                    }

                    Text("Ramesh • \(currentOrder.eta)")
                        .font(.system(size: 9, weight: .black))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(MedMargTheme.slate900)
                        .foregroundColor(.white)
                        .cornerRadius(6)
                }
                .position(x: 180, y: 100)

                // Patient Home Marker
                VStack(spacing: 2) {
                    ZStack {
                        Circle()
                            .fill(Color.red.opacity(0.15))
                            .frame(width: 36, height: 36)
                        Circle()
                            .fill(Color.red)
                            .frame(width: 26, height: 26)
                        Image(systemName: "house.fill")
                            .font(.system(size: 12))
                            .foregroundColor(.white)
                    }

                    Text("Your Doorstep")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                }
                .position(x: 290, y: 55)

                // Bottom Overlay Bar
                VStack {
                    Spacer()
                    HStack {
                        HStack(spacing: 6) {
                            Image(systemName: "location.fill")
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text("1.8 km away • ETA \(currentOrder.eta)")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                        }

                        Spacer()

                        Text("60-Min Phlebotomy Guaranteed")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                    .padding(10)
                    .background(Color.white.opacity(0.95))
                    .cornerRadius(10)
                    .padding(10)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🧬 4. PIPELINE TELEMETRY STEPPER
    // ==========================================
    private var pipelineStepperCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Diagnostic Pipeline Telemetry")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            VStack(spacing: 12) {
                ForEach(0..<steps.count, id: \.self) { idx in
                    let step = steps[idx]
                    HStack(alignment: .top, spacing: 12) {
                        
                        // Step Icon / Status Dot
                        VStack(spacing: 0) {
                            ZStack {
                                Circle()
                                    .fill(step.done ? MedMargTheme.primaryTeal : MedMargTheme.slate200)
                                    .frame(width: 28, height: 28)

                                if step.done {
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 11, weight: .bold))
                                        .foregroundColor(.white)
                                } else {
                                    Text("\(idx + 1)")
                                        .font(.system(size: 11, weight: .bold))
                                        .foregroundColor(MedMargTheme.slate500)
                                }
                            }

                            if idx < steps.count - 1 {
                                Rectangle()
                                    .fill(step.done ? MedMargTheme.primaryTeal : MedMargTheme.slate200)
                                    .frame(width: 2, height: 28)
                            }
                        }

                        // Step Text
                        VStack(alignment: .leading, spacing: 2) {
                            Text(step.label)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(step.done ? MedMargTheme.slate900 : MedMargTheme.slate500)
                            Text(step.desc)
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        .padding(.top, 4)

                        Spacer()
                    }
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 👨‍⚕️ 5. PHLEBOTOMIST & BILL CARDS
    // ==========================================
    private var phlebotomistAndBillCards: some View {
        VStack(spacing: 16) {
            
            // Phlebotomist Card
            VStack(spacing: 14) {
                HStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(MedMargTheme.lightTeal)
                            .frame(width: 52, height: 52)
                        Image(systemName: "person.badge.shield.checkmark.fill")
                            .font(.system(size: 24))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text("ASSIGNED PHLEBOTOMIST")
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(MedMargTheme.primaryTeal)
                        Text(currentOrder.phleboName)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("AP-PMC-89102 • Double Vaccinated • 4.9★")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    Spacer()
                }

                HStack(spacing: 10) {
                    Button(action: {
                        if let url = URL(string: "tel://919876511223") {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        HStack(spacing: 6) {
                            Image(systemName: "phone.fill")
                            Text("Call Collector")
                                .font(.system(size: 13, weight: .bold))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(MedMargTheme.primaryTeal)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }

                    Button(action: {
                        let msg = "Hello Ramesh Kumar, I am tracking my MedMarg order #\(currentOrder.id)."
                        let urlStr = "https://wa.me/919876511223?text=\(msg.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
                        if let url = URL(string: urlStr) {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        HStack(spacing: 6) {
                            Image(systemName: "message.fill")
                            Text("WhatsApp")
                                .font(.system(size: 13, weight: .bold))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color(red: 0.15, green: 0.78, blue: 0.40))
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                }
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(20)
            .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))

            // Ordered Tests Summary Card
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Ordered Tests (\(currentOrder.items.count))")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Spacer()

                    Text(currentOrder.paymentStatus)
                        .font(.system(size: 10, weight: .black))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Color.green.opacity(0.12))
                        .foregroundColor(Color(red: 0.03, green: 0.5, blue: 0.3))
                        .cornerRadius(6)
                }

                Divider()

                ForEach(currentOrder.items) { itm in
                    HStack {
                        Text(itm.name)
                            .font(.system(size: 12))
                            .foregroundColor(MedMargTheme.slate700)
                            .lineLimit(1)
                        Spacer()
                        Text("₹\(itm.price)")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                    }
                }

                Divider()

                HStack {
                    Text("Total Amount Paid")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Spacer()
                    Text("₹\(currentOrder.totalAmount)")
                        .font(.system(size: 16, weight: .black))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(20)
            .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))
        }
    }
}
