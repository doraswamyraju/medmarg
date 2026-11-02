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
    var currentAddress: String = "Air Bypass Road, Tirupati"
    var onLocationTap: (() -> Void)? = nil

    private var displayCity: String {
        let parts = currentCity.components(separatedBy: ",")
        let first = parts.first?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        return first.isEmpty ? "Tirupati" : first
    }

    var body: some View {
        HStack(spacing: 8) {
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
                HStack(spacing: 6) {
                    Image("logo")
                        .resizable()
                        .scaledToFit()
                        .frame(height: 26)

                    if user.role == .collectionAgent {
                        Text("FLEET")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(.white)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(MedMargTheme.primaryTeal)
                            .cornerRadius(4)
                    } else if user.role == .freelanceAgent {
                        Text("GIG MLT")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(.white)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(Color.orange)
                            .cornerRadius(4)
                    }
                }
            }

            // 3. Location / Address Selector for CareSeeker / Patient
            if user.role == .patient {
                Button(action: {
                    if let onLocationTap = onLocationTap {
                        onLocationTap()
                    } else {
                        showCityPicker = true
                    }
                }) {
                    HStack(spacing: 5) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        VStack(alignment: .leading, spacing: 1) {
                            HStack(spacing: 3) {
                                Text(displayCity)
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)
                                    .lineLimit(1)

                                Image(systemName: "chevron.down")
                                    .font(.system(size: 8, weight: .heavy))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                            }

                            Text(currentAddress.isEmpty ? "Air Bypass Road, Tirupati" : currentAddress)
                                .font(.system(size: 9, weight: .medium))
                                .foregroundColor(MedMargTheme.slate500)
                                .lineLimit(1)
                                .truncationMode(.tail)
                        }
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(MedMargTheme.slate100)
                    .cornerRadius(8)
                }
                .buttonStyle(PlainButtonStyle())
            }

            Spacer()

            // 4. Notification Bell Icon
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
                        .frame(width: 36, height: 36)
                        .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 4, x: 0, y: 2)

                    if let avatarStr = user.avatarUrl, let avatarUrl = URL(string: avatarStr) {
                        AsyncImage(url: avatarUrl) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .scaledToFill()
                                    .frame(width: 36, height: 36)
                                    .clipShape(Circle())
                            case .failure, .empty:
                                Text(user.name.isEmpty ? "C" : String(user.name.prefix(1)).uppercased())
                                    .font(.system(size: 14, weight: .black))
                                    .foregroundColor(.white)
                            @unknown default:
                                Text(user.name.isEmpty ? "C" : String(user.name.prefix(1)).uppercased())
                                    .font(.system(size: 14, weight: .black))
                                    .foregroundColor(.white)
                            }
                        }
                    } else {
                        Text(user.name.isEmpty ? "C" : String(user.name.prefix(1)).uppercased())
                            .font(.system(size: 14, weight: .black))
                            .foregroundColor(.white)
                    }
                }
                .frame(width: 36, height: 36)
                .clipShape(Circle())
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
