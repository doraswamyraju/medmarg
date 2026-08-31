import SwiftUI

struct SidebarView: View {
    let user: UserProfile
    @Binding var showSidebar: Bool
    @Binding var selectedTab: Int
    let onSwitchRole: (UserRole) -> Void
    let onLogout: () -> Void

    var body: some View {
        ZStack(alignment: .leading) {
            // Dark Backdrop Overlay
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture {
                    withAnimation { showSidebar = false }
                }

            VStack(alignment: .leading, spacing: 0) {
                // User Profile Header
                VStack(alignment: .leading, spacing: 12) {
                    HStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(MedMargTheme.primaryTeal)
                                .frame(width: 50, height: 50)
                            Text(String(user.name.prefix(1)))
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(.white)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(user.name)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text(user.email)
                                .font(.system(size: 12))
                                .foregroundColor(MedMargTheme.slate500)
                            
                            Text(user.role.displayName)
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(MedMargTheme.lightTeal)
                                .cornerRadius(6)
                        }
                    }

                    Divider()
                }
                .padding(20)
                .background(MedMargTheme.slate50)

                // Navigation Items List
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("QUICK NAVIGATION")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                            .padding(.horizontal, 20)
                            .padding(.top, 12)

                        sidebarItem(icon: "house.fill", title: "Home Dashboard", active: selectedTab == 0) {
                            selectedTab = 0
                            showSidebar = false
                        }
                        sidebarItem(icon: "flask.fill", title: "Labs & Pathology Catalog", active: selectedTab == 1) {
                            selectedTab = 1
                            showSidebar = false
                        }
                        sidebarItem(icon: "location.fill.viewfinder", title: "Live Phlebotomist Tracker", active: selectedTab == 2) {
                            selectedTab = 2
                            showSidebar = false
                        }
                        sidebarItem(icon: "doc.text.fill", title: "Prescriptions & Records", active: selectedTab == 3) {
                            selectedTab = 3
                            showSidebar = false
                        }

                        Divider().padding(.vertical, 8)

                        Text("ROLE SWITCHER (DEMO)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                            .padding(.horizontal, 20)

                        ForEach(UserRole.allCases) { role in
                            sidebarItem(icon: role.iconName, title: role.displayName, active: user.role == role) {
                                onSwitchRole(role)
                                showSidebar = false
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }

                Spacer()

                // Logout Button
                Button(action: {
                    showSidebar = false
                    onLogout()
                }) {
                    HStack(spacing: 10) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                            .foregroundColor(.red)
                        Text("Sign Out")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.red)
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.red.opacity(0.05))
                }
            }
            .frame(width: 300)
            .background(MedMargTheme.pureWhite)
            .shadow(color: Color.black.opacity(0.2), radius: 10, x: 5, y: 0)
            .transition(.move(edge: .leading))
        }
    }

    private func sidebarItem(icon: String, title: String, active: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(active ? MedMargTheme.primaryTeal : MedMargTheme.slate700)
                    .frame(width: 24)
                Text(title)
                    .font(.system(size: 14, weight: active ? .bold : .medium))
                    .foregroundColor(active ? MedMargTheme.primaryTeal : MedMargTheme.slate900)
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(active ? MedMargTheme.lightTeal : Color.clear)
            .cornerRadius(8)
        }
    }
}
