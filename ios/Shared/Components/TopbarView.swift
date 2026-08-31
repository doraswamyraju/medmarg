import SwiftUI

struct TopbarView: View {
    let user: UserProfile
    @Binding var currentCity: String
    @Binding var showSidebar: Bool
    @Binding var showCityPicker: Bool
    @Binding var showCartSheet: Bool
    @Binding var showNotificationCenter: Bool
    let cartItemCount: Int

    var body: some View {
        HStack(spacing: 12) {
            // 1. Sidebar Drawer Toggle Button
            Button(action: { withAnimation { showSidebar.toggle() } }) {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(8)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(10)
            }

            // 2. Role-Specific Header Contents
            if user.role == .admin {
                // SUPER ADMIN TOPBAR HEADER WITH OFFICIAL BRANDING LOGO
                HStack(spacing: 8) {
                    Image("logo-icon")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 28, height: 28)

                    VStack(alignment: .leading, spacing: 1) {
                        HStack(spacing: 4) {
                            Text("MedMarg")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text("Super Admin")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                        }
                        Text("Central Control & Telemetry")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }

                Spacer()

                // NABL Sync Status Badge
                HStack(spacing: 4) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 6, height: 6)
                    Text("NABL Sync")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MedMargTheme.darkTeal)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(MedMargTheme.lightTeal)
                .cornerRadius(12)

                // Notification Bell connected to Bottom Sheet Notification Center
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

                // Super Admin Profile Avatar
                Button(action: { withAnimation { showSidebar.toggle() } }) {
                    ZStack {
                        Circle()
                            .fill(MedMargTheme.primaryTeal)
                            .frame(width: 34, height: 34)
                        Text(String(user.name.prefix(1)))
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
            } else if user.role == .patient {
                // PATIENT / CUSTOMER TOPBAR HEADER WITH LOGO
                HStack(spacing: 6) {
                    Image("logo-icon")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 24, height: 24)

                    VStack(alignment: .leading, spacing: 1) {
                        Text("Serving in")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(MedMargTheme.slate500)

                        Button(action: { showCityPicker = true }) {
                            HStack(spacing: 4) {
                                Image(systemName: "location.fill")
                                    .font(.system(size: 11))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                Text(currentCity)
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)
                                    .lineLimit(1)
                                Image(systemName: "chevron.down")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                            }
                        }
                    }
                }

                Spacer()

                // Cart Action Icon with Live Badge
                Button(action: { showCartSheet = true }) {
                    ZStack(alignment: .topTrailing) {
                        Image(systemName: "cart.fill")
                            .font(.system(size: 18))
                            .foregroundColor(MedMargTheme.primaryTeal)
                            .padding(8)
                            .background(MedMargTheme.lightTeal)
                            .cornerRadius(10)

                        if cartItemCount > 0 {
                            Text("\(cartItemCount)")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.white)
                                .padding(4)
                                .background(Color.red)
                                .clipShape(Circle())
                                .offset(x: 4, y: -4)
                        }
                    }
                }

                // Notification Bell
                Button(action: { showNotificationCenter = true }) {
                    ZStack(alignment: .topTrailing) {
                        Image(systemName: "bell.fill")
                            .font(.system(size: 16))
                            .foregroundColor(MedMargTheme.slate700)
                            .padding(8)
                            .background(MedMargTheme.slate50)
                            .cornerRadius(10)
                    }
                }

                // User Profile Avatar Circle
                Button(action: { withAnimation { showSidebar.toggle() } }) {
                    ZStack {
                        Circle()
                            .fill(MedMargTheme.primaryTeal)
                            .frame(width: 34, height: 34)
                        Text(String(user.name.prefix(1)))
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
            } else {
                // PROVIDER / PARTNER WORKSPACE TOPBAR HEADER WITH LOGO
                HStack(spacing: 8) {
                    Image("logo-icon")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 26, height: 26)

                    VStack(alignment: .leading, spacing: 1) {
                        Text(user.organization)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text(user.role.displayName)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }

                Spacer()

                // Notification Bell
                Button(action: { showNotificationCenter = true }) {
                    ZStack(alignment: .topTrailing) {
                        Image(systemName: "bell.fill")
                            .font(.system(size: 16))
                            .foregroundColor(MedMargTheme.slate700)
                            .padding(8)
                            .background(MedMargTheme.slate50)
                            .cornerRadius(10)
                    }
                }

                Button(action: { withAnimation { showSidebar.toggle() } }) {
                    ZStack {
                        Circle()
                            .fill(MedMargTheme.primaryTeal)
                            .frame(width: 34, height: 34)
                        Text(String(user.name.prefix(1)))
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(MedMargTheme.pureWhite)
        .shadow(color: Color.black.opacity(0.03), radius: 4, x: 0, y: 2)
    }
}
