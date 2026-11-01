import SwiftUI

// =========================================================================
// 🏷️ AGENT TOPBAR VIEW (FLEET STATUS, LIVE ON/OFF DUTY TOGGLE, ACTIONS)
// 1. Click on logo -> takes user to home (selectedTab = 0)
// 2. Click on notification -> opens NotificationCenterSheet bottom sheet
// 3. Click on profile icon -> opens agent profile screen (selectedTab = 4)
// 4. Click on logout -> logs out agent and returns to login screen
// =========================================================================

struct AgentTopbarView: View {
    let agentName: String
    let agentId: String
    @Binding var isOnDuty: Bool
    @ObservedObject var locationManager: AgentLocationManager
    var unreadNotificationCount: Int = 0
    var avatarUrl: String? = nil
    let onToggleDuty: (Bool) -> Void
    var onLogoTap: () -> Void = {}
    var onSidebarTap: () -> Void = {}
    var onNotificationTap: () -> Void = {}
    var onProfileTap: () -> Void = {}
    var onLogoutTap: () -> Void = {}

    @State private var avatarImage: UIImage? = nil

    var body: some View {
        HStack(spacing: 12) {
            // 1. Hamburger Sidebar Button
            Button(action: onSidebarTap) {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(MedMargTheme.slate900)
            }

            // 2. MedMarg Brand Logo (Clicking takes user to Home)
            Button(action: onLogoTap) {
                Image("logo")
                    .resizable()
                    .scaledToFit()
                    .frame(height: 28)
            }
            .buttonStyle(PlainButtonStyle())

            Spacer()

            // 3. Green Pill "ON DUTY" Toggle matching reference design
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

            // 4. Notification Bell with Badge Count (ONLY SHOWS COUNT IF PENDING NOTIFICATIONS > 0)
            Button(action: onNotificationTap) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "bell")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(MedMargTheme.slate900)
                        .padding(4)

                    // Dynamic Red Badge - only shown if unread notifications exist
                    if unreadNotificationCount > 0 {
                        Text("\(unreadNotificationCount)")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.white)
                            .frame(width: 16, height: 16)
                            .background(Color.red)
                            .clipShape(Circle())
                            .offset(x: 4, y: -4)
                    }
                }
            }

            // 5. Profile Avatar Circle (Opens agent profile screen with live photo)
            Button(action: onProfileTap) {
                if let img = avatarImage {
                    Image(uiImage: img)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 34, height: 34)
                        .clipShape(Circle())
                        .overlay(
                            Circle()
                                .stroke(Color.white, lineWidth: 1.5)
                        )
                        .shadow(color: Color.black.opacity(0.12), radius: 2)
                } else {
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
            }

            // 6. Quick Logout Button (Logs out agent back to login screen)
            Button(action: onLogoutTap) {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(MedMargTheme.slate700)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.white)
        .shadow(color: Color.black.opacity(0.04), radius: 4, x: 0, y: 2)
        .onAppear {
            loadAvatar()
        }
        .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("AgentAvatarUpdated"))) { _ in
            loadAvatar()
        }
    }

    private func loadAvatar() {
        // 1. Check UserDefaults for cached base64 avatar
        let keysToCheck = [
            "agent_avatar_\(agentId)",
            "agent_avatar_FL-502",
            "agent_avatar_AG-01",
            "agent_avatar_current"
        ]
        for key in keysToCheck {
            if let b64 = UserDefaults.standard.string(forKey: key), !b64.isEmpty {
                let clean = b64.contains(",") ? String(b64.split(separator: ",")[1]) : b64
                if let data = Data(base64Encoded: clean, options: .ignoreUnknownCharacters),
                   let uiImg = UIImage(data: data) {
                    self.avatarImage = uiImg
                    return
                }
            }
        }

        // 2. If avatarUrl string is provided
        if let av = avatarUrl, !av.isEmpty {
            if av.hasPrefix("data:image") {
                let clean = av.contains(",") ? String(av.split(separator: ",")[1]) : av
                if let data = Data(base64Encoded: clean, options: .ignoreUnknownCharacters),
                   let uiImg = UIImage(data: data) {
                    self.avatarImage = uiImg
                    return
                }
            } else if let url = URL(string: av) {
                Task {
                    if let (data, _) = try? await URLSession.shared.data(from: url),
                       let uiImg = UIImage(data: data) {
                        await MainActor.run { self.avatarImage = uiImg }
                    }
                }
                return
            }
        }

        // 3. Fallback: Fetch from remote server profile
        Task {
            guard let url = URL(string: "https://medmarg.com/api/v1/agent/profile?agentId=\(agentId)") else { return }
            if let (data, _) = try? await URLSession.shared.data(from: url),
               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let p = json["profile"] as? [String: Any],
               let remoteAv = p["avatarUrl"] as? String, !remoteAv.isEmpty {
                let clean = remoteAv.contains(",") ? String(remoteAv.split(separator: ",")[1]) : remoteAv
                if let imgData = Data(base64Encoded: clean, options: .ignoreUnknownCharacters),
                   let uiImg = UIImage(data: imgData) {
                    UserDefaults.standard.set(remoteAv, forKey: "agent_avatar_\(agentId)")
                    UserDefaults.standard.set(remoteAv, forKey: "agent_avatar_current")
                    await MainActor.run { self.avatarImage = uiImg }
                }
            }
        }
    }
}
