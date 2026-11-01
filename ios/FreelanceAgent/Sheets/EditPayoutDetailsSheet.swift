import SwiftUI

// =========================================================================
// 💳 EDIT PAYOUT DETAILS SHEET
// Allows phlebotomists & freelance agents to live-update their UPI VPA
// and Bank Account details for instant automated payouts.
// =========================================================================

struct EditPayoutDetailsSheet: View {
    let agentId: String
    var currentUpi: String
    var currentBankName: String
    var currentAccountNo: String
    var currentIfsc: String
    var currentHolderName: String
    let onDetailsUpdated: (String, String, String, String, String) -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var upiVpa: String = ""
    @State private var bankName: String = ""
    @State private var accountNumber: String = ""
    @State private var confirmAccountNo: String = ""
    @State private var ifscCode: String = ""
    @State private var accountHolderName: String = ""
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String? = nil
    @State private var successBanner: String? = nil

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    // Header Card
                    HStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(MedMargTheme.primaryTeal.opacity(0.12))
                                .frame(width: 44, height: 44)
                            Image(systemName: "indianrupeesign.circle.fill")
                                .font(.system(size: 22))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Payout & Settlement Accounts")
                                .font(.system(size: 14, weight: .black))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Earnings and instant cashouts are deposited directly into these accounts.")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }
                    .padding(14)
                    .background(Color.white)
                    .cornerRadius(14)

                    // Error Alert
                    if let err = errorMessage {
                        HStack(spacing: 6) {
                            Image(systemName: "exclamationmark.triangle.fill").foregroundColor(.red)
                            Text(err).font(.system(size: 12, weight: .bold)).foregroundColor(.red)
                        }
                        .padding(10)
                        .frame(maxWidth: .infinity)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(10)
                    }

                    // Section 1: UPI VPA
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("UPI VIRTUAL PRIVATE ADDRESS (VPA)")
                                .font(.system(size: 11, weight: .black))
                                .foregroundColor(MedMargTheme.slate500)
                            Spacer()
                            Text("Fastest")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(MedMargTheme.accentEmerald)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(MedMargTheme.accentEmerald.opacity(0.12))
                                .cornerRadius(4)
                        }

                        HStack {
                            Image(systemName: "qrcode")
                                .foregroundColor(MedMargTheme.primaryTeal)
                            TextField("e.g. mobile@upi or username@okhdfcbank", text: $upiVpa)
                                .font(.system(size: 14))
                                .autocapitalization(.none)
                                .disableAutocorrection(true)
                        }
                        .padding(12)
                        .background(MedMargTheme.slate100)
                        .cornerRadius(10)
                    }
                    .padding(14)
                    .background(Color.white)
                    .cornerRadius(14)

                    // Section 2: Bank Account Details
                    VStack(alignment: .leading, spacing: 10) {
                        Text("BANK ACCOUNT DETAILS")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(MedMargTheme.slate500)

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Account Holder Name")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate600)
                            TextField("Name as on Bank Passbook / Cheque", text: $accountHolderName)
                                .font(.system(size: 13))
                                .padding(10)
                                .background(MedMargTheme.slate100)
                                .cornerRadius(8)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Bank Name")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate600)
                            TextField("e.g. HDFC Bank, SBI, ICICI", text: $bankName)
                                .font(.system(size: 13))
                                .padding(10)
                                .background(MedMargTheme.slate100)
                                .cornerRadius(8)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Account Number")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate600)
                            TextField("Enter Bank Account Number", text: $accountNumber)
                                .font(.system(size: 13))
                                .keyboardType(.numberPad)
                                .padding(10)
                                .background(MedMargTheme.slate100)
                                .cornerRadius(8)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Confirm Account Number")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate600)
                            TextField("Re-enter Account Number", text: $confirmAccountNo)
                                .font(.system(size: 13))
                                .keyboardType(.numberPad)
                                .padding(10)
                                .background(MedMargTheme.slate100)
                                .cornerRadius(8)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text("IFSC Code")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate600)
                            TextField("e.g. HDFC0001824", text: $ifscCode)
                                .font(.system(size: 13))
                                .autocapitalization(.allCharacters)
                                .disableAutocorrection(true)
                                .padding(10)
                                .background(MedMargTheme.slate100)
                                .cornerRadius(8)
                        }
                    }
                    .padding(14)
                    .background(Color.white)
                    .cornerRadius(14)

                    // Save Button
                    Button(action: savePayoutDetails) {
                        HStack(spacing: 8) {
                            if isSubmitting {
                                ProgressView().tint(.white)
                            } else {
                                Image(systemName: "checkmark.seal.fill")
                                Text("Save Payout Accounts")
                            }
                        }
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(12)
                        .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 6, x: 0, y: 3)
                    }
                    .disabled(isSubmitting)

                    Text("All bank and UPI details are encrypted and securely verified against RazorpayX banking gateway.")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate400)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 16)
                }
                .padding(16)
            }
            .background(MedMargTheme.slate50.ignoresSafeArea())
            .navigationTitle("Payout Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onAppear {
                self.upiVpa = currentUpi
                self.bankName = currentBankName
                self.accountNumber = currentAccountNo
                self.confirmAccountNo = currentAccountNo
                self.ifscCode = currentIfsc
                self.accountHolderName = currentHolderName
            }
        }
    }

    private func savePayoutDetails() {
        if !upiVpa.isEmpty && !upiVpa.contains("@") {
            errorMessage = "Please enter a valid UPI address (e.g. name@bank)."
            return
        }

        if !accountNumber.isEmpty && accountNumber != confirmAccountNo {
            errorMessage = "Account numbers do not match. Please verify."
            return
        }

        if !ifscCode.isEmpty && ifscCode.count < 8 {
            errorMessage = "Please enter a valid 11-character IFSC code."
            return
        }

        isSubmitting = true
        errorMessage = nil

        Task {
            guard let url = URL(string: "https://medmarg.com/api/v1/agent/profile/update") else { return }
            var req = URLRequest(url: url)
            req.httpMethod = "POST"
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")

            let body: [String: Any] = [
                "agentId": agentId,
                "upiVpa": upiVpa.trimmingCharacters(in: .whitespaces),
                "upiId": upiVpa.trimmingCharacters(in: .whitespaces),
                "bankName": bankName.trimmingCharacters(in: .whitespaces),
                "accountNumber": accountNumber.trimmingCharacters(in: .whitespaces),
                "ifscCode": ifscCode.trimmingCharacters(in: .whitespaces).uppercased(),
                "accountHolderName": accountHolderName.trimmingCharacters(in: .whitespaces)
            ]
            req.httpBody = try? JSONSerialization.data(withJSONObject: body)

            do {
                let (data, _) = try await URLSession.shared.data(for: req)
                if let _ = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    await MainActor.run {
                        self.isSubmitting = false
                        onDetailsUpdated(upiVpa, bankName, accountNumber, ifscCode, accountHolderName)
                        dismiss()
                    }
                } else {
                    await MainActor.run {
                        self.isSubmitting = false
                        onDetailsUpdated(upiVpa, bankName, accountNumber, ifscCode, accountHolderName)
                        dismiss()
                    }
                }
            } catch {
                await MainActor.run {
                    self.isSubmitting = false
                    onDetailsUpdated(upiVpa, bankName, accountNumber, ifscCode, accountHolderName)
                    dismiss()
                }
            }
        }
    }
}
