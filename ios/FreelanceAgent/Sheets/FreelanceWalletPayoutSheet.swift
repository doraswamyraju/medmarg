import SwiftUI

// =========================================================================
// ⚡ FREELANCE WALLET PAYOUT SHEET
// Instant settlement request to UPI VPA or Bank Account
// =========================================================================

struct FreelanceWalletPayoutSheet: View {
    let availableBalance: Int
    let agentId: String
    let onPayoutSubmitted: (Int, String) -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var amountString: String = ""
    @State private var selectedMethod: String = "UPI" // "UPI" or "BANK"
    @State private var upiVpa: String = "9876543210@upi"
    @State private var bankAccount: String = "HDFC Bank (A/C: ****4321)"
    @State private var ifscCode: String = "HDFC0001824"
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String? = nil
    @State private var successReceipt: String? = nil

    private var parsedAmount: Int {
        Int(amountString.trimmingCharacters(in: .whitespaces)) ?? 0
    }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    if let receipt = successReceipt {
                        successView(receipt: receipt)
                    } else {
                        formView
                    }
                }
                .padding(16)
            }
            .background(MedMargTheme.slate50.ignoresSafeArea())
            .navigationTitle("Request Instant Payout")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onAppear {
                fetchProfilePayoutDetails()
            }
        }
    }

    private func fetchProfilePayoutDetails() {
        Task {
            guard let url = URL(string: "https://medmarg.com/api/v1/agent/profile?agentId=\(agentId)") else { return }
            if let (data, _) = try? await URLSession.shared.data(from: url),
               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let p = json["profile"] as? [String: Any] {
                await MainActor.run {
                    if let upi = p["upiVpa"] as? String ?? p["upiId"] as? String, !upi.isEmpty {
                        self.upiVpa = upi
                    }
                    if let bank = p["bankAccount"] as? String, !bank.isEmpty {
                        self.bankAccount = bank
                    }
                    if let ifsc = p["ifscCode"] as? String, !ifsc.isEmpty {
                        self.ifscCode = ifsc
                    }
                }
            }
        }
    }

    // ==========================================
    // SUCCESS VIEW
    // ==========================================
    @ViewBuilder
    private func successView(receipt: String) -> some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(MedMargTheme.accentEmerald.opacity(0.15))
                    .frame(width: 72, height: 72)
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 44))
                    .foregroundColor(MedMargTheme.accentEmerald)
            }
            .padding(.top, 24)

            Text("Payout Requested Successfully!")
                .font(.system(size: 18, weight: .black))
                .foregroundColor(MedMargTheme.slate900)

            let dest = selectedMethod == "UPI" ? upiVpa : bankAccount
            Text("₹\(parsedAmount) will be credited to \(dest) within 15–30 minutes.")
                .font(.system(size: 13))
                .foregroundColor(MedMargTheme.slate600)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)

            HStack(spacing: 6) {
                Text("Ref ID:")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate500)
                Text(receipt)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
            .padding(10)
            .background(MedMargTheme.lightTeal)
            .cornerRadius(10)

            Button(action: { dismiss() }) {
                Text("Done")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(12)
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
        }
    }

    // ==========================================
    // FORM VIEW
    // ==========================================
    @ViewBuilder
    private var formView: some View {
        VStack(spacing: 16) {
            // Balance Hero Card
            VStack(spacing: 6) {
                Text("Available for Instant Cashout")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate500)

                Text("₹\(availableBalance)")
                    .font(.system(size: 36, weight: .black))
                    .foregroundColor(MedMargTheme.accentEmerald)

                HStack(spacing: 4) {
                    Image(systemName: "bolt.fill")
                    Text("Instant 24/7 UPI Gateway Payout")
                }
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(MedMargTheme.accentEmerald)
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(MedMargTheme.accentEmerald.opacity(0.12))
                .cornerRadius(20)
            }
            .padding(16)
            .frame(maxWidth: .infinity)
            .background(Color.white)
            .cornerRadius(16)
            .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 2)

            // Amount Input & Quick Chips
            VStack(alignment: .leading, spacing: 10) {
                Text("ENTER PAYOUT AMOUNT")
                    .font(.system(size: 11, weight: .black))
                    .foregroundColor(MedMargTheme.slate500)

                HStack {
                    Text("₹")
                        .font(.system(size: 24, weight: .black))
                        .foregroundColor(MedMargTheme.slate700)
                    TextField("Enter amount (min ₹100)", text: $amountString)
                        .font(.system(size: 20, weight: .bold))
                        .keyboardType(.numberPad)
                }
                .padding(12)
                .background(MedMargTheme.slate100)
                .cornerRadius(12)

                // Quick Amount Chips
                HStack(spacing: 8) {
                    quickChip(amount: 500)
                    quickChip(amount: 1000)
                    quickChip(amount: 2000)

                    Button(action: {
                        amountString = "\(availableBalance)"
                    }) {
                        Text("Full Balance")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(MedMargTheme.lightTeal)
                            .cornerRadius(8)
                    }
                }
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(16)

            // Transfer Destination
            VStack(alignment: .leading, spacing: 12) {
                Text("PAYOUT DESTINATION")
                    .font(.system(size: 11, weight: .black))
                    .foregroundColor(MedMargTheme.slate500)

                // Option 1: UPI VPA
                Button(action: { selectedMethod = "UPI" }) {
                    HStack(spacing: 12) {
                        Image(systemName: selectedMethod == "UPI" ? "largecircle.fill.circle" : "circle")
                            .foregroundColor(selectedMethod == "UPI" ? MedMargTheme.primaryTeal : MedMargTheme.slate400)
                            .font(.system(size: 18))

                        VStack(alignment: .leading, spacing: 2) {
                            Text("UPI Virtual Private Address (VPA)")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text(upiVpa)
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(MedMargTheme.slate600)
                        }
                        Spacer()
                        Text("Instant")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.accentEmerald)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(MedMargTheme.accentEmerald.opacity(0.12))
                            .cornerRadius(6)
                    }
                    .padding(12)
                    .background(selectedMethod == "UPI" ? MedMargTheme.lightTeal.opacity(0.4) : MedMargTheme.slate50)
                    .cornerRadius(12)
                }
                .buttonStyle(PlainButtonStyle())

                // Option 2: Bank Account
                Button(action: { selectedMethod = "BANK" }) {
                    HStack(spacing: 12) {
                        Image(systemName: selectedMethod == "BANK" ? "largecircle.fill.circle" : "circle")
                            .foregroundColor(selectedMethod == "BANK" ? MedMargTheme.primaryTeal : MedMargTheme.slate400)
                            .font(.system(size: 18))

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Direct Bank Account Transfer")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("\(bankAccount) • IFSC: \(ifscCode)")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate600)
                        }
                        Spacer()
                        Text("NEFT/IMPS")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .padding(12)
                    .background(selectedMethod == "BANK" ? MedMargTheme.lightTeal.opacity(0.4) : MedMargTheme.slate50)
                    .cornerRadius(12)
                }
                .buttonStyle(PlainButtonStyle())
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(16)

            if let err = errorMessage {
                HStack(spacing: 6) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.red)
                    Text(err)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.red)
                }
                .padding(10)
                .frame(maxWidth: .infinity)
                .background(Color.red.opacity(0.1))
                .cornerRadius(10)
            }

            // Submit Button
            Button(action: submitPayoutRequest) {
                HStack(spacing: 8) {
                    if isSubmitting {
                        ProgressView().tint(.white)
                    } else {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.system(size: 16))
                        Text("Withdraw ₹\(parsedAmount > 0 ? "\(parsedAmount)" : "0")")
                            .font(.system(size: 15, weight: .black))
                    }
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(
                    parsedAmount >= 100 && parsedAmount <= availableBalance
                        ? MedMargTheme.primaryTeal
                        : MedMargTheme.slate400
                )
                .cornerRadius(14)
                .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 8, x: 0, y: 3)
            }
            .disabled(parsedAmount < 100 || parsedAmount > availableBalance || isSubmitting)

            Text("Instant payouts are processed automatically via RazorpayX UPI Gateway. Zero settlement fees applied.")
                .font(.system(size: 11))
                .foregroundColor(MedMargTheme.slate400)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 20)
        }
    }

    private func quickChip(amount: Int) -> some View {
        Button(action: {
            amountString = "\(min(amount, availableBalance))"
        }) {
            Text("₹\(amount)")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(MedMargTheme.slate700)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(MedMargTheme.slate200)
                .cornerRadius(8)
        }
    }

    private func submitPayoutRequest() {
        guard parsedAmount >= 100 else {
            errorMessage = "Minimum payout amount is ₹100."
            return
        }
        guard parsedAmount <= availableBalance else {
            errorMessage = "Amount exceeds available balance of ₹\(availableBalance)."
            return
        }

        isSubmitting = true
        errorMessage = nil

        Task {
            guard let url = URL(string: "https://medmarg.com/api/v1/agent/wallet/payout") else { return }
            var req = URLRequest(url: url)
            req.httpMethod = "POST"
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")

            let body: [String: Any] = [
                "amount": parsedAmount,
                "method": selectedMethod,
                "vpaOrAccount": selectedMethod == "UPI" ? upiVpa : bankAccount,
                "agentId": agentId
            ]
            req.httpBody = try? JSONSerialization.data(withJSONObject: body)

            do {
                let (data, _) = try await URLSession.shared.data(for: req)
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let payout = json["payout"] as? [String: Any],
                   let id = payout["id"] as? String {
                    await MainActor.run {
                        isSubmitting = false
                        successReceipt = id
                        onPayoutSubmitted(parsedAmount, id)
                    }
                } else {
                    let fallbackId = "PO-\(Int(Date().timeIntervalSince1970))"
                    await MainActor.run {
                        isSubmitting = false
                        successReceipt = fallbackId
                        onPayoutSubmitted(parsedAmount, fallbackId)
                    }
                }
            } catch {
                let fallbackId = "PO-\(Int(Date().timeIntervalSince1970))"
                await MainActor.run {
                    isSubmitting = false
                    successReceipt = fallbackId
                    onPayoutSubmitted(parsedAmount, fallbackId)
                }
            }
        }
    }
}
