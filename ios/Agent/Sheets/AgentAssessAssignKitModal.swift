import SwiftUI

// =========================================================================
// 🧰 AGENT ASSESS & ASSIGN FIELD KIT (LIVE ADMIN CATALOG & AGENT-SPECIFIC STOCK)
// Redesigned to show:
// 1. Live Admin Panel Inventory Catalog items with agent-specific bag quantities.
// 2. Specific diagnostic requirements for this order (EDTA, SST, Fluoride, Syringes).
// 3. Dual Terminal Actions: "Confirm & Assign Kit" or "Mark as Kit Not Required".
// 4. One-tap Central Store Indent Replenishment.
// =========================================================================

struct AgentAssessAssignKitModal: View {
    let order: AgentPickupOrder
    let agentId: String
    let inHandInventory: [AgentInventoryItem]
    let onKitAssigned: () -> Void
    let onRaiseIndentTap: () -> Void
    @Environment(\.dismiss) private var dismiss

    // Live backend inventory
    @State private var liveAgentInventory: [AgentInventoryItem] = []
    @State private var warehouseItems: [AgentWarehouseStockItem] = []
    @State private var isLoading: Bool = true
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String? = nil
    @State private var showKitNotRequiredSheet: Bool = false
    @State private var activeCategoryFilter: String = "ALL" // "ALL", "TUBES", "KITS", "CONSUMABLES"

    // Derived required consumables based on ordered tests
    private var requiredConsumables: [(name: String, code: String, qty: Int, icon: String, capColor: Color)] {
        var items: [(name: String, code: String, qty: Int, icon: String, capColor: Color)] = []
        let testsText = (order.items ?? "").lowercased()

        // Vacutainer Gold SST (Serum Gel)
        items.append((name: "Vacutainer Gold SST (Serum Gel)", code: "TUBE-SST", qty: 1, icon: "cross.vial.fill", capColor: .yellow))

        // Lavender EDTA for CBC / HbA1c
        if testsText.contains("cbc") || testsText.contains("blood") || testsText.contains("hba1c") || testsText.contains("diabetic") || testsText.contains("full") {
            items.append((name: "Vacutainer Purple/Lavender (EDTA)", code: "TUBE-EDTA", qty: 1, icon: "cross.vial.fill", capColor: .purple))
        }

        // Grey Fluoride for Glucose/Fasting
        if testsText.contains("sugar") || testsText.contains("glucose") || testsText.contains("fasting") || testsText.contains("diabetic") {
            items.append((name: "Vacutainer Grey (Fluoride Sugar)", code: "TUBE-FLR", qty: 1, icon: "cross.vial.fill", capColor: .gray))
        }

        // Standard Safety Syringes & Barcode labels
        items.append((name: "Sterile Safety Syringes 5ml", code: "SYR-5ML", qty: 1, icon: "syringe.fill", capColor: .blue))
        items.append((name: "Nitrile Examination Gloves", code: "GLV-NIT-M", qty: 1, icon: "hand.raised.fill", capColor: MedMargTheme.primaryTeal))
        items.append((name: "Barcode Thermal Label Rolls", code: "LBL-ROLL", qty: 1, icon: "barcode.viewfinder", capColor: .black))

        return items
    }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 16) {
                    // Header Order Summary Card
                    orderHeaderCard

                    if let err = errorMessage {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill").foregroundColor(.red)
                            Text(err).font(.system(size: 12, weight: .bold)).foregroundColor(.red)
                        }
                        .padding(10)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(10)
                    }

                    // 1. Visit-Specific Required Kit Items
                    requiredVisitConsumablesSection

                    // 2. Full Admin Catalog with Agent-Specific In-Hand Quantities
                    adminCatalogLiveInventorySection

                    // 3. Confirm Actions
                    actionButtonsSection

                    Spacer().frame(height: 30)
                }
                .padding(16)
            }
            .background(MedMargTheme.slate50)
            .navigationTitle("Assess & Assign Field Kit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onAppear {
                fetchLiveAgentInventory()
            }
            .confirmationDialog(
                "Mark Kit as Not Required",
                isPresented: $showKitNotRequiredSheet,
                titleVisibility: .visible
            ) {
                Button("Patient Has Doctor / Home Collection Kit") {
                    submitKitNotRequired(reason: "Patient Has Doctor / Home Collection Kit")
                }
                Button("Supplies Already Pre-Delivered at Clinic") {
                    submitKitNotRequired(reason: "Supplies Already Pre-Delivered at Clinic")
                }
                Button("Non-Invasive / Urine Sample Only") {
                    submitKitNotRequired(reason: "Non-Invasive / Urine Sample Only")
                }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Select reason why kit supplies from your bag are not required. This unblocks trip start without bag deduction.")
            }
        }
    }

    // ==========================================
    // 🏷️ ORDER SUMMARY HEADER
    // ==========================================
    private var orderHeaderCard: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(order.id)
                        .font(.system(size: 11, weight: .black, design: .monospaced))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    Text(order.slot ?? "Today Morning")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Text(order.effectivePatientName)
                    .font(.system(size: 16, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)

                Text(order.address ?? "Tirupati")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
                    .lineLimit(1)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text("Agent ID: \(agentId)")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.slate700)

                Text("Field Bag Audit")
                    .font(.system(size: 9))
                    .foregroundColor(MedMargTheme.slate500)
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🧪 1. REQUIRED CONSUMABLES FOR THIS VISIT
    // ==========================================
    private var requiredVisitConsumablesSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("1. REQUIRED FOR THIS VISIT")
                    .font(.system(size: 11, weight: .black))
                    .foregroundColor(MedMargTheme.slate500)

                Spacer()

                Text("Audit vs Bag")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }

            VStack(spacing: 8) {
                ForEach(requiredConsumables, id: \.code) { req in
                    let inHandStock = agentStock(for: req.code)
                    let isAvailable = inHandStock >= req.qty

                    HStack(spacing: 10) {
                        Circle()
                            .fill(req.capColor)
                            .frame(width: 12, height: 12)

                        VStack(alignment: .leading, spacing: 1) {
                            Text(req.name)
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Needed: \(req.qty)x")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        HStack(spacing: 4) {
                            Image(systemName: isAvailable ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                                .font(.system(size: 11))
                                .foregroundColor(isAvailable ? Color.green : Color.orange)

                            Text(isAvailable ? "\(inHandStock) in Bag" : "Low (\(inHandStock))")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(isAvailable ? Color.green : Color.orange)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background((isAvailable ? Color.green : Color.orange).opacity(0.1))
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
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🏬 2. LIVE ADMIN CATALOG & AGENT IN-HAND QUANTITIES
    // ==========================================
    private var adminCatalogLiveInventorySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("2. LIVE INVENTORY (AGENT FIELD BAG)")
                        .font(.system(size: 11, weight: .black))
                        .foregroundColor(MedMargTheme.slate500)
                    Text("Admin master catalog items with your allocated in-hand quantities")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Button(action: {
                    dismiss()
                    onRaiseIndentTap()
                }) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus.circle.fill").font(.system(size: 10))
                        Text("Raise Indent").font(.system(size: 11, weight: .bold))
                    }
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 5)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(8)
                }
            }

            if isLoading {
                ProgressView("Syncing Live Inventory...")
                    .frame(maxWidth: .infinity)
                    .padding(20)
            } else if liveAgentInventory.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "archivebox")
                        .font(.system(size: 30))
                        .foregroundColor(Color.orange)
                    Text("No Allocated Supplies in Bag")
                        .font(.system(size: 13, weight: .bold))
                    Text("Your field kit has 0 in-hand stock. You can raise a central store indent or mark this visit as 'Kit Not Required'.")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                        .multilineTextAlignment(.center)
                }
                .padding(16)
                .frame(maxWidth: .infinity)
                .background(Color.orange.opacity(0.06))
                .cornerRadius(12)
            } else {
                VStack(spacing: 8) {
                    ForEach(liveAgentInventory) { inv in
                        HStack(spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(MedMargTheme.lightTeal)
                                    .frame(width: 36, height: 36)

                                Image(systemName: iconForInventory(inv.code))
                                    .font(.system(size: 16))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text(inv.name)
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)
                                    .lineLimit(1)

                                Text("SKU: \(inv.code) • \(inv.unit)")
                                    .font(.system(size: 9))
                                    .foregroundColor(MedMargTheme.slate500)
                            }

                            Spacer()

                            VStack(alignment: .trailing, spacing: 1) {
                                Text("\(inv.stock)")
                                    .font(.system(size: 15, weight: .black, design: .monospaced))
                                    .foregroundColor(inv.stock > 0 ? Color.green : Color.red)

                                Text("in your bag")
                                    .font(.system(size: 8, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate500)
                            }
                        }
                        .padding(10)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(10)
                    }
                }
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🔘 3. ACTION BUTTONS
    // ==========================================
    private var actionButtonsSection: some View {
        VStack(spacing: 10) {
            // Confirm & Assign Kit
            Button(action: submitKitAssignment) {
                HStack(spacing: 8) {
                    if isSubmitting {
                        ProgressView().tint(.white)
                    }
                    Text(isSubmitting ? "Assigning Kit..." : "✓ Confirm & Assign Kit from Bag")
                        .font(.system(size: 14, weight: .black))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(MedMargTheme.primaryTeal)
                .cornerRadius(12)
            }
            .disabled(isSubmitting)

            // Mark as Kit Not Required
            Button(action: {
                showKitNotRequiredSheet = true
            }) {
                HStack(spacing: 6) {
                    Image(systemName: "slash.circle")
                    Text("Mark as Kit Not Required")
                        .font(.system(size: 13, weight: .bold))
                }
                .foregroundColor(MedMargTheme.slate700)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color.white)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
            }
            .disabled(isSubmitting)
        }
    }

    // ==========================================
    // 🔄 HELPERS & LIVE API CALLS
    // ==========================================
    private func agentStock(for code: String) -> Int {
        if let found = liveAgentInventory.first(where: {
            $0.code.localizedCaseInsensitiveContains(code) ||
            code.localizedCaseInsensitiveContains($0.code) ||
            $0.name.localizedCaseInsensitiveContains(code)
        }) {
            return found.stock
        }
        return 0
    }

    private func iconForInventory(_ code: String) -> String {
        let c = code.lowercased()
        if c.contains("sst") || c.contains("edta") || c.contains("flr") || c.contains("tube") {
            return "cross.vial.fill"
        }
        if c.contains("syr") || c.contains("needle") {
            return "syringe.fill"
        }
        if c.contains("lbl") || c.contains("roll") {
            return "barcode.viewfinder"
        }
        if c.contains("kit") {
            return "shippingbox.fill"
        }
        return "archivebox.fill"
    }

    private func fetchLiveAgentInventory() {
        isLoading = true
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/inventory?agentId=\(agentId)") else {
            isLoading = false
            return
        }

        URLSession.shared.dataTask(with: url) { data, _, err in
            DispatchQueue.main.async {
                self.isLoading = false
                guard let d = data,
                      let json = try? JSONSerialization.jsonObject(with: d) as? [String: Any] else {
                    return
                }

                if let invArray = json["inventory"] as? [[String: Any]] {
                    self.liveAgentInventory = invArray.compactMap { dict in
                        let id = dict["id"] as? String ?? UUID().uuidString
                        let name = dict["name"] as? String ?? ""
                        let code = dict["code"] as? String ?? ""
                        let stock = dict["stock"] as? Int ?? 0
                        let unit = dict["unit"] as? String ?? "Units"
                        return AgentInventoryItem(id: id, name: name, code: code, stock: stock, unit: unit, minThreshold: 5)
                    }
                }
            }
        }.resume()
    }

    private func submitKitAssignment() {
        isSubmitting = true
        errorMessage = nil

        guard let url = URL(string: "https://medmarg.com/api/v1/agent/order/assign-kit") else {
            isSubmitting = false
            return
        }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload: [String: Any] = [
            "orderId": order.id,
            "agentId": agentId,
            "kitItems": requiredConsumables.map { [
                "name": $0.name,
                "code": $0.code,
                "qty": $0.qty
            ]}
        ]

        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

        URLSession.shared.dataTask(with: req) { data, _, err in
            DispatchQueue.main.async {
                self.isSubmitting = false
                if let err = err {
                    self.errorMessage = err.localizedDescription
                    return
                }

                guard let d = data,
                      let json = try? JSONSerialization.jsonObject(with: d) as? [String: Any] else {
                    self.errorMessage = "Failed to parse server response"
                    return
                }

                if let success = json["success"] as? Bool, success {
                    self.onKitAssigned()
                    self.dismiss()
                } else {
                    self.errorMessage = json["message"] as? String ?? "Insufficient supplies in in-hand kit"
                }
            }
        }.resume()
    }

    private func submitKitNotRequired(reason: String) {
        isSubmitting = true
        errorMessage = nil

        guard let url = URL(string: "https://medmarg.com/api/v1/agent/order/assign-kit") else {
            isSubmitting = false
            return
        }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload: [String: Any] = [
            "orderId": order.id,
            "agentId": agentId,
            "kitNotRequired": true,
            "reason": reason
        ]

        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

        URLSession.shared.dataTask(with: req) { data, _, err in
            DispatchQueue.main.async {
                self.isSubmitting = false
                if let err = err {
                    self.errorMessage = err.localizedDescription
                    return
                }

                guard let d = data,
                      let json = try? JSONSerialization.jsonObject(with: d) as? [String: Any] else {
                    self.errorMessage = "Failed to parse server response"
                    return
                }

                if let success = json["success"] as? Bool, success {
                    self.onKitAssigned()
                    self.dismiss()
                } else {
                    self.errorMessage = json["message"] as? String ?? "Failed to mark kit as not required"
                }
            }
        }.resume()
    }
}
