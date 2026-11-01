import SwiftUI

// =========================================================================
// ⚡ FREELANCE ASSESS & ASSIGN FIELD KIT MODAL
// Tailored for freelance phlebotomist with Onboarding Credit Wallet visibility
// =========================================================================

struct FreelanceAssessAssignKitModal: View {
    let order: AgentPickupOrder
    let onAssigned: () -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var liveInventory: [AgentInventoryItem] = []
    @State private var walletCredits: Int = 0
    @State private var isLoading: Bool = true
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String? = nil

    private var testsDescription: String {
        order.items ?? "Diagnostic Tests"
    }

    private var requiredItems: [(name: String, needed: Int, icon: String, color: Color)] {
        var items: [(name: String, needed: Int, icon: String, color: Color)] = []
        let testsText = testsDescription.lowercased()

        items.append(("Vacutainer Gold SST (Serum Gel)", 1, "circle.fill", Color.yellow))
        items.append(("Vacutainer Purple/Lavender (EDTA)", 1, "circle.fill", Color.purple))

        if testsText.contains("sugar") || testsText.contains("glucose") || testsText.contains("diabetes") || testsText.contains("hba1c") {
            items.append(("Vacutainer Grey (Sodium Fluoride)", 1, "circle.fill", Color.gray))
        }

        items.append(("Sterile Safety Syringes 5ml", 1, "cross.fill", MedMargTheme.primaryTeal))
        items.append(("Nitrile Examination Gloves", 1, "hand.raised.fill", Color.blue))
        items.append(("Barcode Thermal Label Rolls", 1, "barcode.viewfinder", MedMargTheme.slate900))
        return items
    }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    orderInfoCard
                    requiredItemsSection
                    actionButtonsSection
                }
                .padding(16)
            }
            .background(MedMargTheme.slate50.ignoresSafeArea())
            .navigationTitle("Assess & Assign Field Kit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onAppear {
                fetchFreelancerInventory()
            }
        }
    }

    private var orderInfoCard: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(order.id)
                    .font(.system(size: 13, weight: .black))
                    .foregroundColor(MedMargTheme.primaryTeal)
                Spacer()
                HStack(spacing: 4) {
                    Image(systemName: "creditcard.fill")
                    Text("Kit Credit Wallet: ₹\(walletCredits)")
                }
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(MedMargTheme.accentEmerald)
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .background(MedMargTheme.accentEmerald.opacity(0.12))
                .cornerRadius(6)
            }

            Text(order.effectivePatientName)
                .font(.system(size: 16, weight: .black))
                .foregroundColor(MedMargTheme.slate900)

            Text(order.address ?? "Tirupati Doorstep")
                .font(.system(size: 12))
                .foregroundColor(MedMargTheme.slate600)
                .lineLimit(1)
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(14)
        .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
    }

    private var requiredItemsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("1. REQUIRED FOR THIS VISIT")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            ForEach(requiredItems, id: \.name) { req in
                let inHand = liveInventory.first(where: { $0.name.lowercased().contains(req.name.prefix(8).lowercased()) })?.stock ?? 0
                HStack(spacing: 10) {
                    Image(systemName: req.icon)
                        .foregroundColor(req.color)
                        .font(.system(size: 14))

                    VStack(alignment: .leading, spacing: 2) {
                        Text(req.name)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Needed: \(req.needed)x")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    Spacer()

                    if inHand >= req.needed {
                        HStack(spacing: 3) {
                            Image(systemName: "checkmark.circle.fill")
                            Text("In Bag (\(inHand))")
                        }
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.accentEmerald)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(MedMargTheme.accentEmerald.opacity(0.12))
                        .cornerRadius(6)
                    } else {
                        HStack(spacing: 3) {
                            Image(systemName: "exclamationmark.triangle.fill")
                            Text("Low (\(inHand))")
                        }
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(Color.orange)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.orange.opacity(0.12))
                        .cornerRadius(6)
                    }
                }
                .padding(10)
                .background(MedMargTheme.slate50)
                .cornerRadius(10)
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(14)
    }

    private var actionButtonsSection: some View {
        VStack(spacing: 10) {
            Button(action: confirmAndAssignKit) {
                HStack(spacing: 6) {
                    if isSubmitting {
                        ProgressView().tint(.white)
                    } else {
                        Image(systemName: "checkmark.seal.fill")
                        Text("✔ Confirm & Assign Kit from Bag")
                    }
                }
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(MedMargTheme.primaryTeal)
                .cornerRadius(12)
            }
            .disabled(isSubmitting)

            Button(action: markKitNotRequired) {
                HStack(spacing: 6) {
                    Image(systemName: "slash.circle")
                    Text("Mark as Kit Not Required")
                }
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(MedMargTheme.slate700)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(MedMargTheme.slate200)
                .cornerRadius(12)
            }
        }
    }

    private func fetchFreelancerInventory() {
        Task {
            guard let url = URL(string: "https://medmarg.com/api/v1/agent/inventory?agentId=\(order.assignedAgent ?? "FL-502")") else { return }
            do {
                let (data, _) = try await URLSession.shared.data(from: url)
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let arr = json["inventory"] as? [[String: Any]] {
                    let mapped: [AgentInventoryItem] = arr.compactMap { d in
                        guard let id = d["id"] as? String,
                              let name = d["name"] as? String,
                              let code = d["code"] as? String,
                              let stock = d["stock"] as? Int else { return nil }
                        return AgentInventoryItem(
                            id: id,
                            name: name,
                            code: code,
                            stock: stock,
                            unit: d["unit"] as? String ?? "pcs",
                            minThreshold: d["minThreshold"] as? Int ?? 5
                        )
                    }
                    let creds = json["walletCredits"] as? Int ?? 0
                    await MainActor.run {
                        self.liveInventory = mapped
                        self.walletCredits = creds
                        self.isLoading = false
                    }
                }
            } catch {
                await MainActor.run { self.isLoading = false }
            }
        }
    }

    private func confirmAndAssignKit() {
        isSubmitting = true
        Task {
            guard let url = URL(string: "https://medmarg.com/api/v1/agent/assign-kit") else { return }
            var req = URLRequest(url: url)
            req.httpMethod = "POST"
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")

            let body: [String: Any] = [
                "orderId": order.id,
                "agentId": order.assignedAgent ?? "FL-502",
                "kitNotRequired": false
            ]
            req.httpBody = try? JSONSerialization.data(withJSONObject: body)

            do {
                let _ = try await URLSession.shared.data(for: req)
                await MainActor.run {
                    isSubmitting = false
                    onAssigned()
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    isSubmitting = false
                    onAssigned()
                    dismiss()
                }
            }
        }
    }

    private func markKitNotRequired() {
        isSubmitting = true
        Task {
            guard let url = URL(string: "https://medmarg.com/api/v1/agent/assign-kit") else { return }
            var req = URLRequest(url: url)
            req.httpMethod = "POST"
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")

            let body: [String: Any] = [
                "orderId": order.id,
                "agentId": order.assignedAgent ?? "FL-502",
                "kitNotRequired": true
            ]
            req.httpBody = try? JSONSerialization.data(withJSONObject: body)

            do {
                let _ = try await URLSession.shared.data(for: req)
                await MainActor.run {
                    isSubmitting = false
                    onAssigned()
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    isSubmitting = false
                    onAssigned()
                    dismiss()
                }
            }
        }
    }
}
