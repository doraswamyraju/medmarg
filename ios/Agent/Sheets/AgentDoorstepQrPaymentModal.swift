import SwiftUI

// =========================================================================
// 💳 AGENT DOORSTEP QR PAYMENT MODAL (RAZORPAY DYNAMIC UPI QR)
// Fetches dynamic UPI QR from /api/v1/payments/generate-doorstep-qr
// Polls /api/v1/payments/order-status/:id until payment is captured
// =========================================================================

struct AgentDoorstepQrPaymentModal: View {
    let order: AgentPickupOrder
    let onPaymentConfirmed: () -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var qrImageUrl: String? = nil
    @State private var upiString: String? = nil
    @State private var isLoading: Bool = true
    @State private var isPaymentDetected: Bool = false
    @State private var checkStatusTimer: Timer? = nil

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // Header
                VStack(spacing: 4) {
                    Text("Razorpay Doorstep UPI QR")
                        .font(.system(size: 18, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Order #\(order.id) • \(order.effectivePatientName)")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }

                // Amount to Collect
                VStack(spacing: 4) {
                    Text("AMOUNT TO COLLECT")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(MedMargTheme.slate500)
                    Text("₹\(order.effectiveAmount)")
                        .font(.system(size: 32, weight: .black, design: .rounded))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }

                // QR Code Container
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.white)
                        .frame(width: 250, height: 250)
                        .shadow(color: Color.black.opacity(0.08), radius: 10, x: 0, y: 4)

                    if isLoading {
                        VStack(spacing: 8) {
                            ProgressView().tint(MedMargTheme.primaryTeal)
                            Text("Generating Secure UPI QR...")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    } else if let imgUrl = qrImageUrl, let url = URL(string: imgUrl) {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .success(let img):
                                img.resizable().scaledToFit().frame(width: 220, height: 220)
                            default:
                                Image(systemName: "qrcode")
                                    .resizable()
                                    .scaledToFit()
                                    .frame(width: 180, height: 180)
                                    .foregroundColor(MedMargTheme.slate700)
                            }
                        }
                    } else {
                        Image(systemName: "qrcode")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 180, height: 180)
                            .foregroundColor(MedMargTheme.slate700)
                    }

                    if isPaymentDetected {
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Color.green.opacity(0.92))
                            .frame(width: 250, height: 250)
                            .overlay(
                                VStack(spacing: 8) {
                                    Image(systemName: "checkmark.circle.fill")
                                        .font(.system(size: 48))
                                        .foregroundColor(.white)
                                    Text("Payment Received!")
                                        .font(.system(size: 16, weight: .black))
                                        .foregroundColor(.white)
                                }
                            )
                    }
                }

                Text("Ask the patient to scan with Google Pay, PhonePe, or Paytm")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)

                Spacer()

                // Manual Confirmation Override Button
                Button(action: {
                    markPaymentComplete()
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.seal.fill")
                        Text("Confirm Payment Received (₹\(order.effectiveAmount))")
                            .font(.system(size: 14, weight: .black))
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.green)
                    .cornerRadius(12)
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 16)
            }
            .padding(.top, 20)
            .background(MedMargTheme.slate50)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") {
                        stopPolling()
                        dismiss()
                    }
                }
            }
            .onAppear {
                generateQrCode()
                startPolling()
            }
            .onDisappear {
                stopPolling()
            }
        }
    }

    private func generateQrCode() {
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

        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

        URLSession.shared.dataTask(with: req) { data, _, _ in
            DispatchQueue.main.async {
                self.isLoading = false
                guard let d = data,
                      let json = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
                      let dataObj = json["data"] as? [String: Any] else { return }

                self.qrImageUrl = dataObj["qrImageUrl"] as? String
                self.upiString = dataObj["dynamicUpiString"] as? String
            }
        }.resume()
    }

    private func startPolling() {
        checkStatusTimer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: true) { _ in
            checkPaymentStatus()
        }
    }

    private func stopPolling() {
        checkStatusTimer?.invalidate()
        checkStatusTimer = nil
    }

    private func checkPaymentStatus() {
        guard let url = URL(string: "https://medmarg.com/api/v1/payments/order-status/\(order.id)") else { return }
        URLSession.shared.dataTask(with: url) { data, _, _ in
            guard let d = data,
                  let json = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
                  let isPaid = json["isPaid"] as? Bool, isPaid else { return }

            DispatchQueue.main.async {
                self.isPaymentDetected = true
                self.stopPolling()
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                    self.onPaymentConfirmed()
                    self.dismiss()
                }
            }
        }.resume()
    }

    private func markPaymentComplete() {
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/pickup/update") else { return }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload: [String: Any] = [
            "orderId": order.id,
            "paymentCollected": true,
            "paymentMode": "DOORSTEP_QR"
        ]

        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

        URLSession.shared.dataTask(with: req) { _, _, _ in
            DispatchQueue.main.async {
                self.stopPolling()
                self.onPaymentConfirmed()
                self.dismiss()
            }
        }.resume()
    }
}

