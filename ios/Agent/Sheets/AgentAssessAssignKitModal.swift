import SwiftUI

// =========================================================================
// 🧰 AGENT ASSESS & ASSIGN FIELD KIT (LIVE CATALOG & AGENT-SPECIFIC STOCK ONLY)
// Strict Clinical & Audit Guidelines:
// 1. Shows all live inventory catalog items (tubes, needles, consumables, kits).
// 2. Quantity shown is EXCLUSIVELY the agent's available in-hand field bag stock.
//    (Central warehouse quantities are NEVER shown to the agent).
// 3. ZERO PRE-POPULATED HARDCODED ASSUMPTIONS: The agent assesses what they need.
// 4. If the agent assesses an item that is OUT OF STOCK in their bag, it triggers
//    an option/modal to raise a Central Store Indent immediately.
// 5. Dual Terminal Action: "Confirm & Assign Kit from Bag" or "Mark as Kit Not Required".
// =========================================================================

struct AgentAssessAssignKitModal: View {
    let order: AgentPickupOrder
    let agentId: String
    let inHandInventory: [AgentInventoryItem]
    let onKitAssigned: () -> Void
    let onRaiseIndentTap: () -> Void
    @Environment(\.dismiss) private var dismiss

    // Safe Agent Identity
    private var effectiveAgentId: String {
        let a = agentId.trimmingCharacters(in: .whitespaces)
        return (a.isEmpty || a.lowercased() == "unassigned") ? "AG-01" : a
    }

    // Live Inventory from Backend
    @State private var liveAgentInventory: [AgentInventoryItem] = []
    @State private var allocatedQuantities: [String: Int] = [:] // item code -> allocated qty
    @State private var activeCategoryFilter: String = "ALL" // "ALL", "TUBES", "CONSUMABLES", "KITS"
    @State private var isLoading: Bool = true
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String? = nil
    @State private var actionBanner: String? = nil

    // Sheets & Dialogs
    @State private var showKitNotRequiredSheet: Bool = false
    @State private var showIndentSheet: Bool = false
    @State private var indentItemPrefill: String = ""

    // Filtered inventory based on selected category tab
    private var filteredInventory: [AgentInventoryItem] {
        switch activeCategoryFilter {
        case "TUBES":
            return liveAgentInventory.filter {
                let c = $0.code.lowercased()
                let cat = $0.category.lowercased()
                return c.contains("tube") || c.contains("sst") || c.contains("edta") || c.contains("flr") || cat.contains("blood")
            }
        case "CONSUMABLES":
            return liveAgentInventory.filter {
                let c = $0.code.lowercased()
                let cat = $0.category.lowercased()
                return c.contains("syr") || c.contains("glv") || c.contains("lbl") || cat.contains("consumable") || cat.contains("lab")
            }
        case "KITS":
            return liveAgentInventory.filter {
                let c = $0.code.lowercased()
                let cat = $0.category.lowercased()
                return c.contains("kit") || cat.contains("kit")
            }
        default:
            return liveAgentInventory
        }
    }

    // Check if any selected item exceeds agent's in-hand bag stock
    private var outOfStockSelectedItems: [(item: AgentInventoryItem, needed: Int, available: Int)] {
        var shortages: [(item: AgentInventoryItem, needed: Int, available: Int)] = []
        for (code, needed) in allocatedQuantities where needed > 0 {
            if let inv = liveAgentInventory.first(where: { $0.code == code }) {
                if needed > inv.stock {
                    shortages.append((item: inv, needed: needed, available: inv.stock))
                }
            }
        }
        return shortages
    }

    private var totalAssessedCount: Int {
        allocatedQuantities.values.reduce(0, +)
    }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 16) {
                    // 1. Order Header Card
                    orderHeaderCard

                    // Action / Success Banner if any
                    if let banner = actionBanner {
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill").foregroundColor(.white)
                            Text(banner).font(.system(size: 12, weight: .bold)).foregroundColor(.white)
                            Spacer()
                            Button(action: { actionBanner = nil }) {
                                Image(systemName: "xmark").font(.system(size: 11)).foregroundColor(.white)
                            }
                        }
                        .padding(10)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(10)
                    }

                    // Error Message if any
                    if let err = errorMessage {
                        HStack(spacing: 8) {
                            Image(systemName: "exclamationmark.triangle.fill").foregroundColor(.red)
                            Text(err).font(.system(size: 12, weight: .bold)).foregroundColor(.red)
                        }
                        .padding(10)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(10)
                    }

                    // 2. Category Filter Pills
                    categoryFilterTabs

                    // 3. Live Inventory List with In-Hand Quantities Only
                    inventoryCatalogSection

                    // 4. Assessment Summary & Actions
                    assessmentSummaryAndActionSection

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
                ToolbarItem(placement: .primaryAction) {
                    Button(action: {
                        indentItemPrefill = ""
                        showIndentSheet = true
                    }) {
                        HStack(spacing: 4) {
                            Image(systemName: "plus.circle.fill")
                            Text("Raise Indent")
                        }
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }
            }
            .onAppear {
                fetchLiveAgentInventory()
            }
            .sheet(isPresented: $showIndentSheet) {
                AgentKitIndentSheet(
                    agentId: effectiveAgentId,
                    prefilledSummary: indentItemPrefill,
                    onSubmitted: {
                        actionBanner = "Indent request submitted to Central Store!"
                        fetchLiveAgentInventory()
                    }
                )
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
                Text("Select reason why kit supplies from your field bag are not required. This unblocks trip start without deducting supplies.")
            }
        }
    }

    // ==========================================
    // 🏷️ 1. ORDER SUMMARY HEADER
    // ==========================================
    private var orderHeaderCard: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text("ORD-\(order.id)")
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
                Text("Agent ID: \(effectiveAgentId)")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.slate700)

                Text("Field Bag Audit")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🔘 2. CATEGORY FILTER TABS
    // ==========================================
    private var categoryFilterTabs: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                categoryTab(title: "All Items", key: "ALL")
                categoryTab(title: "Vacutainer Tubes", key: "TUBES")
                categoryTab(title: "Consumables", key: "CONSUMABLES")
                categoryTab(title: "Pre-Packaged Kits", key: "KITS")
            }
        }
    }

    private func categoryTab(title: String, key: String) -> some View {
        let isSelected = activeCategoryFilter == key
        return Button(action: {
            withAnimation(.spring(response: 0.25, dampingFraction: 0.8)) {
                activeCategoryFilter = key
            }
        }) {
            Text(title)
                .font(.system(size: 11, weight: isSelected ? .bold : .medium))
                .foregroundColor(isSelected ? .white : MedMargTheme.slate700)
                .padding(.horizontal, 12)
                .padding(.vertical, 7)
                .background(isSelected ? MedMargTheme.primaryTeal : Color.white)
                .cornerRadius(10)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1))
        }
    }

    // ==========================================
    // 🏬 3. LIVE INVENTORY CATALOG SECTION
    // Displays ONLY the Agent's in-hand field bag quantities
    // ==========================================
    private var inventoryCatalogSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("LIVE INVENTORY (FIELD BAG STOCK)")
                        .font(.system(size: 11, weight: .black))
                        .foregroundColor(MedMargTheme.slate500)

                    Text("Showing live items with your available in-hand bag quantities")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Text("\(liveAgentInventory.count) Items")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.slate500)
            }

            if isLoading {
                VStack(spacing: 8) {
                    ProgressView().tint(MedMargTheme.primaryTeal)
                    Text("Syncing field bag inventory...")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate500)
                }
                .frame(maxWidth: .infinity)
                .padding(24)
            } else if liveAgentInventory.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "archivebox")
                        .font(.system(size: 28))
                        .foregroundColor(Color.orange)
                    Text("No Allocated Supplies in Bag")
                        .font(.system(size: 13, weight: .bold))
                    Text("Your field kit has 0 in-hand stock. Raise an indent to request supplies or mark this visit as Kit Not Required.")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                        .multilineTextAlignment(.center)
                }
                .padding(16)
                .frame(maxWidth: .infinity)
                .background(Color.orange.opacity(0.06))
                .cornerRadius(12)
            } else {
                VStack(spacing: 10) {
                    ForEach(filteredInventory) { item in
                        inventoryItemCard(item: item)
                    }
                }
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    private func inventoryItemCard(item: AgentInventoryItem) -> some View {
        let currentAssigned = allocatedQuantities[item.code] ?? 0
        let isShortage = currentAssigned > item.stock
        let isOutOfStock = item.stock <= 0

        return VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 12) {
                // Item Icon
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(itemIconBackground(item.code))
                        .frame(width: 38, height: 38)

                    Image(systemName: iconForInventory(item.code))
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(itemIconColor(item.code))
                }

                // Name & SKU
                VStack(alignment: .leading, spacing: 2) {
                    Text(item.name)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                        .lineLimit(1)

                    HStack(spacing: 6) {
                        Text("SKU: \(item.code)")
                            .font(.system(size: 9, design: .monospaced))
                            .foregroundColor(MedMargTheme.slate500)

                        // In-Hand Availability Pill (Agent Only)
                        HStack(spacing: 3) {
                            Circle()
                                .fill(item.stock > 0 ? Color.green : Color.red)
                                .frame(width: 5, height: 5)

                            Text(item.stock > 0 ? "\(item.stock) in Bag" : "0 in Bag")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(item.stock > 0 ? Color(red: 0.05, green: 0.65, blue: 0.35) : Color.red)
                        }
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background((item.stock > 0 ? Color.green : Color.red).opacity(0.1))
                        .cornerRadius(4)
                    }
                }

                Spacer(minLength: 4)

                // Interactive Counter / Stepper
                HStack(spacing: 8) {
                    Button(action: {
                        if currentAssigned > 0 {
                            allocatedQuantities[item.code] = currentAssigned - 1
                        }
                    }) {
                        Image(systemName: "minus")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(currentAssigned > 0 ? MedMargTheme.slate900 : MedMargTheme.slate200)
                            .frame(width: 28, height: 28)
                            .background(MedMargTheme.slate100)
                            .cornerRadius(7)
                    }
                    .disabled(currentAssigned <= 0)

                    Text("\(currentAssigned)")
                        .font(.system(size: 13, weight: .black, design: .monospaced))
                        .foregroundColor(isShortage ? Color.red : MedMargTheme.slate900)
                        .frame(minWidth: 20)

                    Button(action: {
                        let next = currentAssigned + 1
                        allocatedQuantities[item.code] = next

                        // If user assesses stock that is out of stock in bag, offer indent immediately
                        if next > item.stock {
                            indentItemPrefill = "\(next)x \(item.name)"
                        }
                    }) {
                        Image(systemName: "plus")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.white)
                            .frame(width: 28, height: 28)
                            .background(MedMargTheme.primaryTeal)
                            .cornerRadius(7)
                    }
                }
            }

            // Shortage / Out of Stock Inline Warning & Quick Indent Button
            if isShortage {
                HStack(spacing: 6) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .font(.system(size: 10))
                        .foregroundColor(Color.red)

                    Text("Out of stock in bag! (Available: \(item.stock), Selected: \(currentAssigned))")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(Color.red)

                    Spacer()

                    Button(action: {
                        indentItemPrefill = "\(currentAssigned)x \(item.name) (Order #\(order.id))"
                        showIndentSheet = true
                    }) {
                        HStack(spacing: 3) {
                            Image(systemName: "bolt.fill").font(.system(size: 8))
                            Text("Raise Indent").font(.system(size: 9, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 3)
                        .background(Color.orange)
                        .cornerRadius(6)
                    }
                }
                .padding(8)
                .background(Color.red.opacity(0.06))
                .cornerRadius(8)
            } else if isOutOfStock && currentAssigned == 0 {
                HStack {
                    Text("Item currently at 0 units in your bag.")
                        .font(.system(size: 9))
                        .foregroundColor(MedMargTheme.slate500)

                    Spacer()

                    Button(action: {
                        indentItemPrefill = "10x \(item.name)"
                        showIndentSheet = true
                    }) {
                        Text("+ Indent Restock")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }
            }
        }
        .padding(10)
        .background(MedMargTheme.slate50)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isShortage ? Color.red.opacity(0.4) : Color.clear, lineWidth: 1)
        )
    }

    // ==========================================
    // ⚡ 4. ASSESSMENT SUMMARY & ACTION SECTION
    // ==========================================
    private var assessmentSummaryAndActionSection: some View {
        VStack(spacing: 12) {
            // Selected Summary Chip
            if totalAssessedCount > 0 {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Assessed for This Visit")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(MedMargTheme.slate700)

                        Text("\(totalAssessedCount) items selected from your bag")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    Spacer()

                    if !outOfStockSelectedItems.isEmpty {
                        Text("\(outOfStockSelectedItems.count) Shortage")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.red)
                            .cornerRadius(6)
                    } else {
                        Text("Ready to Assign")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(Color(red: 0.05, green: 0.65, blue: 0.35))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.green.opacity(0.12))
                            .cornerRadius(6)
                    }
                }
                .padding(12)
                .background(Color.white)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(outOfStockSelectedItems.isEmpty ? MedMargTheme.primaryTeal.opacity(0.3) : Color.red.opacity(0.3), lineWidth: 1))
            }

            // Shortage Prompt Card if out of stock
            if !outOfStockSelectedItems.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 6) {
                        Image(systemName: "exclamationmark.triangle.fill").foregroundColor(Color.orange)
                        Text("Supplies Out of Stock in Field Bag")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                    }

                    Text("You assessed supplies that are currently out of stock in your bag. Raise a Central Store Indent to replenish stock, or mark this visit as Kit Not Required.")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate700)

                    HStack(spacing: 8) {
                        Button(action: {
                            let summary = outOfStockSelectedItems.map { "\($0.needed)x \($0.item.name)" }.joined(separator: ", ")
                            indentItemPrefill = summary
                            showIndentSheet = true
                        }) {
                            HStack(spacing: 4) {
                                Image(systemName: "bolt.fill")
                                Text("⚡ Raise Central Store Indent")
                            }
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color.orange)
                            .cornerRadius(8)
                        }
                    }
                }
                .padding(12)
                .background(Color.orange.opacity(0.08))
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.orange.opacity(0.4), lineWidth: 1))
            }

            // PRIMARY ACTION 1: Confirm & Assign Kit from Bag
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
                .background(outOfStockSelectedItems.isEmpty ? MedMargTheme.primaryTeal : Color.gray)
                .cornerRadius(12)
            }
            .disabled(isSubmitting || !outOfStockSelectedItems.isEmpty || totalAssessedCount == 0)

            // DUAL TERMINAL ACTION 2: Mark as Kit Not Required
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
    private func iconForInventory(_ code: String) -> String {
        let c = code.lowercased()
        if c.contains("sst") || c.contains("edta") || c.contains("flr") || c.contains("tube") {
            return "cross.vial.fill"
        }
        if c.contains("syr") || c.contains("needle") {
            return "syringe.fill"
        }
        if c.contains("glv") {
            return "hand.raised.fill"
        }
        if c.contains("lbl") || c.contains("roll") {
            return "barcode.viewfinder"
        }
        if c.contains("kit") {
            return "shippingbox.fill"
        }
        return "archivebox.fill"
    }

    private func itemIconColor(_ code: String) -> Color {
        let c = code.lowercased()
        if c.contains("sst") { return .yellow }
        if c.contains("edta") { return .purple }
        if c.contains("flr") { return .gray }
        if c.contains("syr") { return .blue }
        if c.contains("glv") { return MedMargTheme.primaryTeal }
        return MedMargTheme.slate700
    }

    private func itemIconBackground(_ code: String) -> Color {
        itemIconColor(code).opacity(0.12)
    }

    private func fetchLiveAgentInventory() {
        isLoading = true
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/inventory?agentId=\(effectiveAgentId)") else {
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
                        let cat = dict["category"] as? String ?? "General"
                        return AgentInventoryItem(id: id, name: name, code: code, stock: stock, unit: unit, minThreshold: 5, category: cat)
                    }
                }
            }
        }.resume()
    }

    private func submitKitAssignment() {
        // Guard against out-of-stock items
        if !outOfStockSelectedItems.isEmpty {
            let summary = outOfStockSelectedItems.map { "\($0.needed)x \($0.item.name)" }.joined(separator: ", ")
            indentItemPrefill = summary
            showIndentSheet = true
            return
        }

        guard totalAssessedCount > 0 else {
            errorMessage = "Please assess and select at least 1 consumable item to assign, or click 'Mark as Kit Not Required'."
            return
        }

        isSubmitting = true
        errorMessage = nil

        guard let url = URL(string: "https://medmarg.com/api/v1/agent/order/assign-kit") else {
            isSubmitting = false
            return
        }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let itemsPayload = allocatedQuantities.compactMap { (code, qty) -> [String: Any]? in
            guard qty > 0, let inv = liveAgentInventory.first(where: { $0.code == code }) else { return nil }
            return [
                "name": inv.name,
                "code": inv.code,
                "qty": qty
            ]
        }

        let payload: [String: Any] = [
            "orderId": order.id,
            "agentId": effectiveAgentId,
            "kitItems": itemsPayload
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
                    let msg = json["message"] as? String ?? "Insufficient supplies in in-hand kit"
                    self.errorMessage = msg
                    // If server reports shortage, prompt indent
                    if json["insufficient"] as? Bool == true {
                        self.indentItemPrefill = itemsPayload.map { "\($0["qty"] ?? 1)x \($0["name"] ?? "")" }.joined(separator: ", ")
                        self.showIndentSheet = true
                    }
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
            "agentId": effectiveAgentId,
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

// =========================================================================
// ⚡ COMPACT INDENT MODAL (CALLED WHEN OUT OF STOCK)
// =========================================================================
struct AgentKitIndentSheet: View {
    let agentId: String
    let prefilledSummary: String
    let onSubmitted: () -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var requestedItems: String = ""
    @State private var area: String = "Tirupati Central Zone"
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String? = nil

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                // Header Banner
                HStack(spacing: 8) {
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 16))
                        .foregroundColor(Color.orange)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Central Store Restock Indent")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)

                        Text("Dispatches directly to Store Lead (Anand) for immediate handover")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.orange.opacity(0.08))
                .cornerRadius(12)

                if let err = errorMessage {
                    Text(err).font(.system(size: 11, weight: .bold)).foregroundColor(.red)
                }

                // Requested Items
                VStack(alignment: .leading, spacing: 6) {
                    Text("Requested Consumables & Quantities")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)

                    TextField("e.g. 20x Gold SST Tubes, 10x Syringes", text: $requestedItems)
                        .font(.system(size: 12))
                        .padding(10)
                        .background(Color.white)
                        .cornerRadius(8)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))
                }

                // Collection Zone
                VStack(alignment: .leading, spacing: 6) {
                    Text("Phlebotomist Zone")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)

                    TextField("Zone Area", text: $area)
                        .font(.system(size: 12))
                        .padding(10)
                        .background(Color.white)
                        .cornerRadius(8)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))
                }

                Spacer()

                // Submit Button
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
                .disabled(isSubmitting || requestedItems.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            .padding(16)
            .background(MedMargTheme.slate50)
            .navigationTitle("Raise Indent")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onAppear {
                if !prefilledSummary.isEmpty {
                    self.requestedItems = prefilledSummary
                } else {
                    self.requestedItems = "10x Gold SST Tubes, 10x Purple EDTA Tubes"
                }
            }
        }
    }

    private func submitIndent() {
        isSubmitting = true
        errorMessage = nil

        guard let url = URL(string: "https://medmarg.com/api/v1/agent/indent") else {
            isSubmitting = false
            return
        }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload: [String: Any] = [
            "agentId": agentId,
            "agentName": "Ramesh Kumar (\(agentId))",
            "agentType": "SALARIED_AGENT",
            "area": area,
            "requestedItems": requestedItems,
            "paymentMode": "Company Quota Allocation (Free)"
        ]

        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

        URLSession.shared.dataTask(with: req) { _, _, err in
            DispatchQueue.main.async {
                self.isSubmitting = false
                if let err = err {
                    self.errorMessage = err.localizedDescription
                    return
                }
                self.onSubmitted()
                self.dismiss()
            }
        }.resume()
    }
}

// Extends AgentInventoryItem with category property
extension AgentInventoryItem {
    init(id: String, name: String, code: String, stock: Int, unit: String, minThreshold: Int, category: String) {
        self.init(id: id, name: name, code: code, stock: stock, unit: unit, minThreshold: minThreshold)
    }
    
    var category: String {
        let c = code.lowercased()
        if c.contains("tube") || c.contains("sst") || c.contains("edta") || c.contains("flr") {
            return "Blood Containers"
        }
        if c.contains("kit") {
            return "Pre-Packaged Kits"
        }
        return "Consumables"
    }
}
