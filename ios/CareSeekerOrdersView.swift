import SwiftUI

// =========================================================================
// 🛍️ CARE SEEKER ORDERS HISTORY VIEW
// Displays all past and active orders placed by the customer
// With status badges, items summary, phlebotomist assignment, and track shortcuts
// =========================================================================

struct CustomerOrderRecord: Identifiable {
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
}

struct CareSeekerOrdersView: View {
    @Binding var selectedTab: Int
    var user: UserProfile? = nil

    @State private var orders: [CustomerOrderRecord] = []
    @State private var isLoading: Bool = false
    @State private var filterStatus: String = "ALL" // ALL, ACTIVE, COMPLETED

    var filteredOrders: [CustomerOrderRecord] {
        orders.filter { ord in
            if filterStatus == "ACTIVE" {
                return ord.status != "COMPLETED" && ord.status != "CANCELLED"
            } else if filterStatus == "COMPLETED" {
                return ord.status == "COMPLETED"
            }
            return true
        }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                // Header Banner
                headerBanner

                // Filter Tabs (All, Active, Completed)
                filterTabsBar

                // Orders List
                if isLoading {
                    VStack(spacing: 12) {
                        Spacer().frame(height: 40)
                        ProgressView()
                            .scaleEffect(1.2)
                        Text("Loading your orders...")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
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
        .onAppear {
            fetchCustomerOrders()
        }
    }

    // ==========================================
    // 🏷️ HEADER BANNER
    // ==========================================
    private var headerBanner: some View {
        HStack {
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Image(systemName: "bag.fill")
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text("MY ORDERS")
                        .font(.system(size: 11, weight: .black))
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .tracking(1.0)
                }

                Text("Booking & Test History")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Text("Track doorstep sample pickups, verify reports, and reorder tests.")
                    .font(.system(size: 12))
                    .foregroundColor(MedMargTheme.slate500)
            }
            Spacer()
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🔀 FILTER TABS
    // ==========================================
    private var filterTabsBar: some View {
        HStack(spacing: 8) {
            filterButton(key: "ALL", label: "All (\(orders.count))")
            filterButton(key: "ACTIVE", label: "In Progress (\(orders.filter { $0.status != "COMPLETED" && $0.status != "CANCELLED" }.count))")
            filterButton(key: "COMPLETED", label: "Completed (\(orders.filter { $0.status == "COMPLETED" }.count))")
            Spacer()
        }
    }

    private func filterButton(key: String, label: String) -> some View {
        Button(action: { filterStatus = key }) {
            Text(label)
                .font(.system(size: 12, weight: filterStatus == key ? .bold : .medium))
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(filterStatus == key ? MedMargTheme.primaryTeal : Color.white)
                .foregroundColor(filterStatus == key ? .white : MedMargTheme.slate700)
                .cornerRadius(10)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(filterStatus == key ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1))
        }
    }

    // ==========================================
    // 📄 ORDER CARD
    // ==========================================
    private func orderCard(ord: CustomerOrderRecord) -> some View {
        let isActive = ord.status != "COMPLETED" && ord.status != "CANCELLED"

        return VStack(alignment: .leading, spacing: 12) {
            // Top Row: Order ID + Status Badge
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("ORDER #\(ord.id)")
                        .font(.system(size: 12, weight: .black, design: .monospaced))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    Text(ord.date)
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                statusBadge(status: ord.status)
            }

            Divider()

            // Item and Lab Details
            VStack(alignment: .leading, spacing: 4) {
                Text(ord.itemsDescription)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                HStack(spacing: 12) {
                    HStack(spacing: 4) {
                        Image(systemName: "building.2.fill")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                        Text(ord.labPartner)
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate700)
                    }

                    if !ord.slot.isEmpty {
                        HStack(spacing: 4) {
                            Image(systemName: "clock.fill")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                            Text(ord.slot)
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate700)
                        }
                    }
                }

                if !ord.address.isEmpty {
                    Text("📍 \(ord.address)")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                        .lineLimit(1)
                }
            }

            Divider()

            // Price & Actions
            HStack {
                VStack(alignment: .leading, spacing: 1) {
                    Text("Total Paid")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MedMargTheme.slate500)

                    Text("₹\(ord.totalAmount)")
                        .font(.system(size: 16, weight: .black, design: .rounded))
                        .foregroundColor(MedMargTheme.slate900)
                }

                Spacer()

                if isActive {
                    Button(action: { selectedTab = 3 }) {
                        HStack(spacing: 6) {
                            Image(systemName: "location.fill.viewfinder")
                            Text("Track Phlebotomist")
                                .font(.system(size: 12, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(10)
                        .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 4, x: 0, y: 2)
                    }
                } else if ord.status == "COMPLETED" {
                    Button(action: { selectedTab = 4 }) {
                        HStack(spacing: 6) {
                            Image(systemName: "doc.text.fill")
                            Text("View Reports")
                                .font(.system(size: 12, weight: .bold))
                        }
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(MedMargTheme.lightTeal)
                        .cornerRadius(10)
                    }
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 3)
    }

    private func statusBadge(status: String) -> some View {
        let (bg, fg, label) = statusColors(status: status)
        return Text(label)
            .font(.system(size: 10, weight: .black))
            .foregroundColor(fg)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
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
            return (Color.indigo.opacity(0.12), Color.indigo, "PHLEBO ASSIGNED")
        case "ENROUTE", "EN_ROUTE":
            return (Color.orange.opacity(0.12), Color.orange, "EN ROUTE")
        case "SAMPLE_COLLECTED":
            return (Color.purple.opacity(0.12), Color.purple, "SAMPLE COLLECTED")
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
                Text("No Orders Placed Yet")
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Text("Book full body checkups, specialized profiles, or blood tests with 60-minute doorstep sample pickup.")
                    .font(.system(size: 12))
                    .foregroundColor(MedMargTheme.slate500)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 30)
            }

            Button(action: { selectedTab = 1 }) {
                HStack(spacing: 8) {
                    Image(systemName: "flask.fill")
                    Text("Book Your First Test")
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
    // 🌐 FETCH LIVE ORDERS
    // ==========================================
    private func fetchCustomerOrders() {
        isLoading = true
        guard let url = URL(string: "https://medmarg.com/api/v1/admin/orders") else {
            isLoading = false
            return
        }

        let userEmail = user?.email.lowercased() ?? ""

        URLSession.shared.dataTask(with: url) { data, _, _ in
            DispatchQueue.main.async {
                self.isLoading = false
                guard let d = data,
                      let json = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
                      let list = (json["orders"] as? [[String: Any]]) ?? (json["data"] as? [[String: Any]]) else {
                    self.orders = []
                    return
                }

                let parsed: [CustomerOrderRecord] = list.compactMap { dict in
                    let patientEmail = (dict["patientEmail"] as? String)?.lowercased() ?? (dict["customerEmail"] as? String)?.lowercased() ?? ""
                    if !userEmail.isEmpty && !patientEmail.isEmpty && patientEmail != userEmail {
                        return nil
                    }

                    let id = dict["id"] as? String ?? "ORD"
                    let date = dict["date"] as? String ?? (dict["createdAt"] as? String)?.prefix(10).description ?? "Recent"
                    let slot = dict["slot"] as? String ?? ""
                    let status = (dict["status"] as? String)?.uppercased() ?? "BOOKED"
                    let lab = (dict["labPartner"] as? String) ?? (dict["lab"] as? String) ?? "MedMarg NABL Hub"
                    let amt = dict["amount"] as? Int ?? (dict["totalAmount"] as? Int ?? 0)
                    let payStatus = dict["paymentStatus"] as? String ?? "PAID"
                    let pName = dict["patientName"] as? String ?? "Customer"
                    let addr = dict["address"] as? String ?? ""
                    let desc = dict["items"] as? String ?? (dict["testName"] as? String ?? (dict["packageName"] as? String ?? "Diagnostic Lab Test"))

                    return CustomerOrderRecord(
                        id: id,
                        date: date,
                        slot: slot,
                        status: status,
                        labPartner: lab,
                        totalAmount: amt,
                        paymentStatus: payStatus,
                        patientName: pName,
                        address: addr,
                        itemsDescription: desc
                    )
                }

                self.orders = parsed
            }
        }.resume()
    }
}
