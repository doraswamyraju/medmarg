import SwiftUI

struct TopbarView: View {
    let user: UserProfile
    @Binding var currentCity: String
    @Binding var showSidebar: Bool
    @Binding var showCityPicker: Bool
    @Binding var showCartSheet: Bool
    @Binding var showNotificationCenter: Bool
    let cartItemCount: Int
    let onLogout: () -> Void
    var onLogoTap: () -> Void = {}
    var onProfileTap: () -> Void = {}

    var body: some View {
        HStack(spacing: 10) {
            // 1. Sidebar Hamburger Toggle Button
            Button(action: { withAnimation { showSidebar.toggle() } }) {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(8)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(10)
            }

            // 2. Logo -> Tapping Logo navigates to Home
            Button(action: onLogoTap) {
                Image("logo")
                    .resizable()
                    .scaledToFit()
                    .frame(height: 26)
            }

            Spacer()

            // 3. Notification Bell Icon
            Button(action: { showNotificationCenter = true }) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "bell.fill")
                        .font(.system(size: 15))
                        .foregroundColor(MedMargTheme.slate700)
                        .padding(8)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(10)

                    Circle()
                        .fill(Color.red)
                        .frame(width: 7, height: 7)
                        .offset(x: 2, y: -2)
                }
            }

            // 4. Profile Picture Avatar -> Tapping opens Profile & Settings
            Button(action: onProfileTap) {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [MedMargTheme.primaryTeal, MedMargTheme.darkTeal],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 34, height: 34)
                        .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 4, x: 0, y: 2)

                    Text(user.name.isEmpty ? "C" : String(user.name.prefix(1)).uppercased())
                        .font(.system(size: 14, weight: .black))
                        .foregroundColor(.white)
                }
                .overlay(
                    Circle()
                        .stroke(MedMargTheme.accentEmerald, lineWidth: 1.5)
                )
            }

            // 5. Logout Action Icon Button
            Button(action: onLogout) {
                Image(systemName: "power")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.red)
                    .padding(8)
                    .background(Color.red.opacity(0.08))
                    .cornerRadius(10)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(MedMargTheme.pureWhite)
        .shadow(color: Color.black.opacity(0.03), radius: 4, x: 0, y: 2)
    }
}
