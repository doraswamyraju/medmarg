import SwiftUI

// =========================================================================
// 🏷️ AGENT TOPBAR VIEW (FLEET STATUS, LIVE ON/OFF DUTY TOGGLE, GPS RADAR)
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
        HStack(spacing: 10) {
            // Hamburger Sidebar Button
            Button(action: onSidebarTap) {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(8)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(10)
            }

            // Fleet Logo Badge
            HStack(spacing: 6) {
                Image("logo")
                    .resizable()
                    .scaledToFit()
                    .frame(height: 24)

                Text("FLEET")
                    .font(.system(size: 9, weight: .black))
                    .foregroundColor(.white)
                    .padding(.horizontal, 5)
                    .padding(.vertical, 2)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(4)
            }

            Spacer()

            // GPS Telemetry Radar Pill
            HStack(spacing: 5) {
                Circle()
                    .fill(isOnDuty && locationManager.isTransmitting ? Color.green : (isOnDuty ? Color.orange : Color.gray))
                    .frame(width: 7, height: 7)

                Text(isOnDuty ? (locationManager.isTransmitting ? "GPS LIVE" : "LOCATING") : "OFFLINE")
                    .font(.system(size: 9, weight: .black, design: .monospaced))
                    .foregroundColor(isOnDuty ? (locationManager.isTransmitting ? Color.green : Color.orange) : Color.gray)
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(MedMargTheme.slate100)
            .cornerRadius(12)

            // Duty Toggle Switch with Instant Visual Feedback
            HStack(spacing: 6) {
                Text(isOnDuty ? "ON DUTY" : "OFF DUTY")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(isOnDuty ? MedMargTheme.accentEmerald : MedMargTheme.slate500)

                Toggle("", isOn: Binding(
                    get: { isOnDuty },
                    set: { newVal in
                        isOnDuty = newVal
                        onToggleDuty(newVal)
                    }
                ))
                .labelsHidden()
                .toggleStyle(SwitchToggleStyle(tint: MedMargTheme.accentEmerald))
                .scaleEffect(0.8)
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 2)
            .background(isOnDuty ? MedMargTheme.accentEmerald.opacity(0.12) : MedMargTheme.slate100)
            .cornerRadius(16)

            // Notifications
            Button(action: onNotificationTap) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "bell.fill")
                        .font(.system(size: 14))
                        .foregroundColor(MedMargTheme.slate700)
                        .padding(7)
                        .background(MedMargTheme.slate100)
                        .cornerRadius(8)
                }
            }

            // Profile Avatar Pill
            Button(action: onProfileTap) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.primaryTeal)
                        .frame(width: 30, height: 30)

                    Text(String(agentName.prefix(1)).uppercased())
                        .font(.system(size: 12, weight: .black))
                        .foregroundColor(.white)
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background(Color.white)
        .shadow(color: Color.black.opacity(0.04), radius: 3, x: 0, y: 1)
    }
}

