import SwiftUI

// =========================================================================
// 🏷️ AGENT TOPBAR VIEW (FLEET STATUS, LIVE ON/OFF DUTY TOGGLE, GPS RADAR)
// Redesigned to pixel-match reference Image 3:
// - Left: Hamburger (line.3.horizontal)
// - MedMarg Logo
// - Center: Pill toggle "ON DUTY" (Green capsule with white text & inner white knob)
// - Right: Notification bell with unread badge count
// - Profile Avatar circle with initials/photo
// - Logout shortcut
// =========================================================================

struct AgentTopbarView: View {
    let agentName: String
    let agentId: String
    @Binding var isOnDuty: Bool
    @ObservedObject var locationManager: AgentLocationManager
    let onToggleDuty: (Bool) -> Void
    var onSidebarTap: () -> Void = {}
    var onNotificationTap: () -> Void = {}
    var onProfileTap: () -> Void = {}

    var body: some View {
        HStack(spacing: 12) {
            // 1. Hamburger Sidebar Button
            Button(action: onSidebarTap) {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(MedMargTheme.slate900)
            }

            // 2. MedMarg Brand Logo
            Image("logo")
                .resizable()
                .scaledToFit()
                .frame(height: 28)

            Spacer()

            // 3. Green Pill "ON DUTY" Toggle matching reference design exactly
            Button(action: {
                withAnimation(.spring(response: 0.25, dampingFraction: 0.7)) {
                    isOnDuty.toggle()
                    onToggleDuty(isOnDuty)
                }
            }) {
                HStack(spacing: 6) {
                    if isOnDuty {
                        Circle()
                            .fill(Color.white)
                            .frame(width: 8, height: 8)
                        
                        Text("ON DUTY")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(.white)
                        
                        // Switch knob on right
                        Circle()
                            .fill(Color.white)
                            .frame(width: 18, height: 18)
                            .shadow(color: Color.black.opacity(0.15), radius: 2)
                    } else {
                        // Switch knob on left
                        Circle()
                            .fill(Color.white)
                            .frame(width: 18, height: 18)
                            .shadow(color: Color.black.opacity(0.15), radius: 2)

                        Text("OFF DUTY")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(.white)

                        Circle()
                            .fill(Color.white.opacity(0.6))
                            .frame(width: 8, height: 8)
                    }
                }
                .padding(.horizontal, 6)
                .padding(.vertical, 4)
                .background(
                    Capsule()
                        .fill(isOnDuty ? Color(red: 0.0, green: 0.72, blue: 0.42) : MedMargTheme.slate500)
                )
                .shadow(color: (isOnDuty ? Color(red: 0.0, green: 0.72, blue: 0.42) : MedMargTheme.slate500).opacity(0.3), radius: 4, y: 2)
            }

            // 4. Notification Bell with Badge Count (Reference shows bell with red badge "3")
            Button(action: onNotificationTap) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "bell")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(MedMargTheme.slate900)
                        .padding(4)

                    // Red Badge
                    Text("3")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.white)
                        .frame(width: 16, height: 16)
                        .background(Color.red)
                        .clipShape(Circle())
                        .offset(x: 4, y: -4)
                }
            }

            // 5. Profile Avatar Circle (matching photo/initials in reference)
            Button(action: onProfileTap) {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color(red: 0.85, green: 0.65, blue: 0.5), Color(red: 0.65, green: 0.45, blue: 0.35)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 34, height: 34)

                    Text(String(agentName.prefix(1)).uppercased())
                        .font(.system(size: 14, weight: .black))
                        .foregroundColor(.white)
                }
                .overlay(
                    Circle()
                        .stroke(Color.white, lineWidth: 1.5)
                )
            }

            // 6. Quick Logout / Exit Icon (far right in reference)
            Button(action: onSidebarTap) {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(MedMargTheme.slate700)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.white)
        .shadow(color: Color.black.opacity(0.04), radius: 4, x: 0, y: 2)
    }
}
