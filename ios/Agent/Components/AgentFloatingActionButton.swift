import SwiftUI

// =========================================================================
// ➕ AGENT FLOATING ACTION BUTTON (CREATE MANUAL ORDER)
// Pixel-perfect match to reference Image 3:
// - Green circle '+' button (accent emerald)
// - Speech bubble tooltip badge on left: "Create Order for Customer" with small tail pointer
// =========================================================================

struct AgentFloatingActionButton: View {
    let onTap: () -> Void

    var body: some View {
        HStack(spacing: 8) {
            // Speech bubble tooltip: "Create Order for Customer"
            HStack(spacing: 4) {
                Text("Create Order\nfor Customer")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .multilineTextAlignment(.center)
                    .lineSpacing(1)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.white)
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.08), radius: 6, x: 0, y: 2)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(MedMargTheme.slate200, lineWidth: 1)
            )

            // Green circle button with '+' icon
            Button(action: onTap) {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(red: 0.05, green: 0.78, blue: 0.45),
                                    Color(red: 0.0, green: 0.65, blue: 0.38)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 54, height: 54)
                        .shadow(color: Color(red: 0.0, green: 0.7, blue: 0.4).opacity(0.4), radius: 10, x: 0, y: 4)

                    Image(systemName: "plus")
                        .font(.system(size: 26, weight: .bold))
                        .foregroundColor(.white)
                }
            }
        }
    }
}
