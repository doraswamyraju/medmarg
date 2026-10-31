import SwiftUI

// =========================================================================
// ⭐ AGENT REVIEW REQUEST MODAL
// Shown after collection to send instant WhatsApp / SMS review request
// or close visit without review
// =========================================================================

struct AgentReviewRequestModal: View {
    let order: AgentPickupOrder
    let onDone: () -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var isSubmitting: Bool = false
    @State private var selectedRating: Int = 5

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Celebration Icon
                ZStack {
                    Circle()
                        .fill(Color.green.opacity(0.12))
                        .frame(width: 80, height: 80)
                    Image(systemName: "hand.thumbsup.fill")
                        .font(.system(size: 38))
                        .foregroundColor(Color.green)
                }
                .padding(.top, 24)

                // Title
                VStack(spacing: 6) {
                    Text("Sample Collected Successfully!")
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Order #\(order.id) • \(order.effectivePatientName)")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text("Would you like to trigger a customer satisfaction review link via WhatsApp & SMS?")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate500)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                }

                // 5-Star Interactive Rating Preview
                HStack(spacing: 12) {
                    ForEach(1...5, id: \.self) { star in
                        Button(action: { selectedRating = star }) {
                            Image(systemName: star <= selectedRating ? "star.fill" : "star")
                                .font(.system(size: 28))
                                .foregroundColor(star <= selectedRating ? Color.orange : MedMargTheme.slate500.opacity(0.3))
                        }
                    }
                }
                .padding(12)
                .background(Color.white)
                .cornerRadius(12)

                Spacer()

                // Actions
                VStack(spacing: 10) {
                    // Send Review Link Button
                    Button(action: { submitReview(send: true) }) {
                        HStack(spacing: 8) {
                            if isSubmitting {
                                ProgressView().tint(.white)
                            }
                            Image(systemName: "paperplane.fill")
                            Text(isSubmitting ? "Sending..." : "Send Review Request (WhatsApp/SMS)")
                                .font(.system(size: 14, weight: .black))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(12)
                    }
                    .disabled(isSubmitting)

                    // Close Without Review Button
                    Button {
                        submitReview(send: false)
                    } label: {
                        Text("Close Without Review")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate700)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Color.white)
                            .cornerRadius(12)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
                    }
                    .disabled(isSubmitting)
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 20)
            }
            .background(MedMargTheme.slate50)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Skip") {
                        dismiss()
                        onDone()
                    }
                }
            }
        }
    }

    private func submitReview(send: Bool) {
        isSubmitting = true
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/pickup/update") else {
            isSubmitting = false
            return
        }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload: [String: Any] = [
            "orderId": order.id,
            "sendReviewRequest": send
        ]

        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

        URLSession.shared.dataTask(with: req) { _, _, _ in
            DispatchQueue.main.async {
                self.isSubmitting = false
                self.dismiss()
                self.onDone()
            }
        }.resume()
    }
}
