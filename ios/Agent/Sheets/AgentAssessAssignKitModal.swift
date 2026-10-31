import SwiftUI

// =========================================================================
// 🧰 AGENT ASSESS & ASSIGN FIELD KIT MODAL
// Agent assesses in-hand consumables vs tests ordered before committing to trip
// =========================================================================

struct AgentAssessAssignKitModal: View {
    let order: AgentPickupOrder
    let agentId: String
    let inHandInventory: [AgentInventoryItem]
    let onKitAssigned: () -> Void
    let onRaiseIndentTap: () -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String? = nil
    @State private var showKitNotRequiredSheet: Bool = false

    // Derived required consumables based on ordered tests
    private var requiredConsumables: [(name: String, code: String, qty: Int, icon: String)] {
        var items: [(name: String, code: String, qty: Int, icon: String)] = []
        let testsText = (order.items ?? "").lowercased()

        // Vacutainer Gold SST (Serum)
        items.append((name: "Vacutainer Gold SST (Serum Gel)", code: "VAC-SST-01", qty: 1, icon: "cross.vial.fill"))

        // Lavender EDTA for CBC / HbA1c
        if testsText.contains("cbc") || testsText.contains("blood") || testsText.contains("hba1c") || testsText.contains("diabetic") || testsText.contains("comprehensive") || testsText.contains("full") {
            items.append((name: "Vacutainer Purple/Lavender (EDTA)", code: "VAC-EDTA-02", qty: 1, icon: "cross.vial.fill"))
        }

        // Grey Fluoride for Glucose/Fasting
        if testsText.contains("sugar") || testsText.contains("glucose") || testsText.contains("fasting") || testsText.contains("diabetic") {
            items.append((name: "Vacutainer Grey (Fluoride Sugar)", code: "VAC-FL-03", qty: 1, icon: "cross.vial.fill"))
        }

        // Standard Safety Syringes & Barcode labels
        items.append((name: "Sterile Safety Syringes 5ml", code: "SYR-5ML", qty: 1, icon: "syringe.fill"))
        items.append((name: "Nitrile Examination Gloves", code: "GLV-NIT-M", qty: 1, icon: "hand.raised.fill"))
        items.append((name: "Barcode Thermal Label Rolls", code: "LBL-BAR-01", qty: 1, icon: "barcode.viewfinder"))

        return items
    }

    // Check if in-hand supplies are sufficient
    private var shortages: [(name: String, needed: Int, available: Int)] {
        var missing: [(name: String, needed: Int, available: Int)] = []
        for req in requiredConsumables {
            let available = inHandInventory.first { item in
                item.name.localizedCaseInsensitiveContains(req.code) ||
                item.name.localizedCaseInsensitiveContains(req.name.components(separatedBy: " ").first ?? "")
            }?.stock ?? 0

            if available < req.qty {
                missing.append((name: req.name, needed: req.qty, available: available))
            }
        }
        return missing
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Header Details
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Image(systemName: "archivebox.fill")
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text("Assess & Assign Field Kit")
                                .font(.system(size: 17, weight: .black))
                                .foregroundColor(MedMargTheme.slate900)
                        }

                        Text("Order #\(order.id) • \(order.effectivePatientName)")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        Text("Verify that you have all required tubes, sterile needles, and thermal barcode labels in your bag before starting the trip.")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.white)
                    .cornerRadius(14)

                    // Error Banner
                    if let err = errorMessage {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.red)
                            Text(err)
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.red)
                        }
                        .padding(10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(10)
                    }

                    // 1. Required Diagnostic Consumables for this Order
                    VStack(alignment: .leading, spacing: 10) {
                        Text("1. REQUIRED DIAGNOSTIC CONSUMABLES FOR THIS VISIT")
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(MedMargTheme.slate500)

                        ForEach(requiredConsumables, id: \.code) { item in
                            HStack(spacing: 10) {
                                Image(systemName: item.icon)
                                    .font(.system(size: 14))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                    .frame(width: 24)

                                Text(item.name)
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)

                                Spacer()

                                Text("\(item.qty)x")
                                    .font(.system(size: 12, weight: .black, design: .monospaced))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 3)
                                    .background(MedMargTheme.lightTeal)
                                    .cornerRadius(6)
                            }
                            .padding(.vertical, 4)

                            if item.code != requiredConsumables.last?.code {
                                Divider()
                            }
                        }
                    }
                    .padding(14)
                    .background(Color.white)
                    .cornerRadius(14)

                    // 2. In-Hand Bag Inventory Check
                    VStack(alignment: .leading, spacing: 10) {
                        Text("2. YOUR IN-HAND FIELD KIT BAG STATUS")
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(MedMargTheme.slate500)

                        if inHandInventory.isEmpty {
                            VStack(spacing: 12) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .font(.system(size: 28))
                                    .foregroundColor(Color.orange)

                                Text("In-Hand Bag Empty (0 Supplies Allotted)")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)

                                Text("You do not have any consumables allotted in your field kit to fulfill this order yet. Please raise an indent to collect tubes from store.")
                                    .font(.system(size: 11))
                                    .foregroundColor(MedMargTheme.slate500)
                                    .multilineTextAlignment(.center)

                                Button(action: {
                                    dismiss()
                                    onRaiseIndentTap()
                                }) {
                                    HStack(spacing: 6) {
                                        Image(systemName: "bolt.fill")
                                        Text("Raise Replenishment Indent Now")
                                    }
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 10)
                                    .background(MedMargTheme.primaryTeal)
                                    .cornerRadius(8)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding(16)
                            .background(Color.orange.opacity(0.08))
                            .cornerRadius(12)
                        } else {
                            ForEach(inHandInventory) { inv in
                                HStack {
                                    Text(inv.name)
                                        .font(.system(size: 12, weight: .semibold))
                                        .foregroundColor(MedMargTheme.slate900)

                                    Spacer()

                                    Text("\(inv.stock) in bag")
                                        .font(.system(size: 11, weight: .bold))
                                        .foregroundColor(inv.stock > 0 ? Color.green : Color.red)
                                }
                                .padding(.vertical, 3)
                            }
                        }
                    }
                    .padding(14)
                    .background(Color.white)
                    .cornerRadius(14)

                    // 3. Confirm Actions
                    VStack(spacing: 10) {
                        Button(action: submitKitAssignment) {
                            HStack(spacing: 8) {
                                if isSubmitting {
                                    ProgressView().tint(.white)
                                }
                                Text(isSubmitting ? "Assigning Kit..." : "✓ Confirm & Assign Kit to Visit")
                                    .font(.system(size: 14, weight: .black))
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(MedMargTheme.primaryTeal)
                            .cornerRadius(12)
                        }
                        .disabled(isSubmitting)

                        // Secondary Action: Mark as Kit Not Required
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
                .padding(16)
            }
            .background(MedMargTheme.slate50)
            .navigationTitle("Assess Kit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
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
                Text("Select the reason why kit supplies from your bag are not required for this visit. You will then be able to start the order.")
            }
        }
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

        URLSession.shared.dataTask(with: req) { data, res, err in
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

        URLSession.shared.dataTask(with: req) { data, res, err in
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
