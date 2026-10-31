import SwiftUI

// =========================================================================
// ➕ AGENT FLOATING ACTION BUTTON (CREATE MANUAL ORDER)
// Replicates web module CreateManualOrderModal for phlebotomists in the field
// =========================================================================

struct AgentFloatingActionButton: View {
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 8) {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 18, weight: .black))
                Text("New Request")
                    .font(.system(size: 13, weight: .bold))
            }
            .foregroundColor(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(
                LinearGradient(
                    colors: [MedMargTheme.primaryTeal, MedMargTheme.darkTeal],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .clipShape(Capsule())
            .shadow(color: MedMargTheme.primaryTeal.opacity(0.4), radius: 8, x: 0, y: 4)
        }
    }
}

