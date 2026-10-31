import SwiftUI

// =========================================================================
// ➕ AGENT FLOATING ACTION BUTTON (CREATE MANUAL ORDER)
// Clean green circular '+' FAB button matching user specifications
// =========================================================================

struct AgentFloatingActionButton: View {
    let onTap: () -> Void

    var body: some View {
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
                    .frame(width: 56, height: 56)
                    .shadow(color: Color(red: 0.0, green: 0.7, blue: 0.4).opacity(0.4), radius: 10, x: 0, y: 4)

                Image(systemName: "plus")
                    .font(.system(size: 26, weight: .bold))
                    .foregroundColor(.white)
            }
        }
    }
}
