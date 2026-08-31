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

    var body: some View {
        HStack(spacing: 12) {
            // 1. Sidebar Hamburger Toggle Button
            Button(action: { withAnimation { showSidebar.toggle() } }) {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(8)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(10)
            }

            // 2. Horizontal Logo & Welcome User Label (Single Line Full Name)
            VStack(alignment: .leading, spacing: 2) {
                Image("logo")
                    .resizable()
                    .scaledToFit()
                    .frame(height: 24)

                // Single line scrollable full name (no truncation)
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 4) {
                        Text("Welcome,")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(MedMargTheme.slate500)

                        Text(user.name)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)

                        Text("(\(user.role.displayName))")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }
            }

            Spacer()

            // 3. Notification Bell Icon
            Button(action: { showNotificationCenter = true }) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "bell.fill")
                        .font(.system(size: 16))
                        .foregroundColor(MedMargTheme.slate700)
                        .padding(8)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(10)

                    Circle()
                        .fill(Color.red)
                        .frame(width: 8, height: 8)
                        .offset(x: 2, y: -2)
                }
            }

            // 4. Logout Action Icon Button
            Button(action: onLogout) {
                Image(systemName: "power")
                    .font(.system(size: 16, weight: .bold))
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
