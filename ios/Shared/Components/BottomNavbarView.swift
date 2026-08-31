import SwiftUI

struct BottomNavbarView: View {
    @Binding var selectedTab: Int
    let userRole: UserRole
    @Binding var showBottomSheetMenu: Bool

    var body: some View {
        VStack(spacing: 4) {
            // Drag Handle Bar to Open Dedicated Bottom Sheet Menu
            Button(action: {
                withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                    showBottomSheetMenu = true
                }
            }) {
                HStack(spacing: 4) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(MedMargTheme.slate500.opacity(0.4))
                        .frame(width: 36, height: 4)
                }
                .padding(.top, 4)
                .padding(.bottom, 2)
                .frame(maxWidth: .infinity)
            }

            HStack {
                if userRole == .admin {
                    // ==========================================
                    // 🛡️ SUPER ADMIN DEDICATED BOTTOM NAVBAR
                    // ==========================================
                    // Tab 0: Overview
                    bottomNavTab(index: 0, icon: "chart.bar.fill", title: "Overview")

                    // Tab 1: Tests (CREATIVE CENTER HIGHLIGHTED ACTION BUTTON)
                    Button(action: { selectedTab = 1 }) {
                        VStack(spacing: 2) {
                            ZStack {
                                Circle()
                                    .fill(LinearGradient(colors: [MedMargTheme.primaryTeal, MedMargTheme.accentEmerald], startPoint: .topLeading, endPoint: .bottomTrailing))
                                    .frame(width: 44, height: 44)
                                    .shadow(color: MedMargTheme.accentEmerald.opacity(0.4), radius: 8, x: 0, y: 3)

                                Image(systemName: "flask.fill")
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundColor(.white)
                            }

                            Text("Tests")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(selectedTab == 1 ? MedMargTheme.primaryTeal : MedMargTheme.slate700)
                        }
                        .frame(maxWidth: .infinity)
                    }

                    // Tab 2: Labs
                    bottomNavTab(index: 2, icon: "building.2.fill", title: "Labs")

                    // Tab 3: Hospitals
                    bottomNavTab(index: 3, icon: "cross.case.fill", title: "Hospitals")

                    // Tab 7: Users
                    bottomNavTab(index: 7, icon: "person.2.fill", title: "Users")
                } else {
                    // ==========================================
                    // 📱 PATIENT / DEFAULT BOTTOM NAVBAR
                    // ==========================================
                    // Tab 0: Home
                    bottomNavTab(index: 0, icon: "house.fill", title: "Home")

                    // Tab 1: Labs & Tests
                    bottomNavTab(index: 1, icon: "flask.fill", title: "Labs & Tests")

                    // Tab 2: Track (CREATIVE CENTER HIGHLIGHTED ACTION BUTTON)
                    Button(action: { selectedTab = 2 }) {
                        VStack(spacing: 2) {
                            ZStack {
                                Circle()
                                    .fill(LinearGradient(colors: [MedMargTheme.primaryTeal, MedMargTheme.accentEmerald], startPoint: .topLeading, endPoint: .bottomTrailing))
                                    .frame(width: 44, height: 44)
                                    .shadow(color: MedMargTheme.accentEmerald.opacity(0.4), radius: 8, x: 0, y: 3)

                                Image(systemName: "location.fill.viewfinder")
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundColor(.white)

                                // Glowing LIVE Indicator Badge
                                Circle()
                                    .fill(Color.red)
                                    .frame(width: 10, height: 10)
                                    .overlay(Circle().stroke(Color.white, lineWidth: 2))
                                    .offset(x: 14, y: -14)
                            }

                            Text("Track")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(selectedTab == 2 ? MedMargTheme.primaryTeal : MedMargTheme.slate700)
                        }
                        .frame(maxWidth: .infinity)
                    }

                    // Tab 3: Docs & Profile
                    bottomNavTab(index: 3, icon: "doc.text.fill", title: "Docs & Profile")
                }
            }
            .padding(.bottom, 6)
            .padding(.horizontal, 16)
        }
        .background(MedMargTheme.pureWhite)
        .shadow(color: Color.black.opacity(0.06), radius: 10, x: 0, y: -4)
        .gesture(
            DragGesture(minimumDistance: 15, coordinateSpace: .local)
                .onEnded { value in
                    if value.translation.height < -20 {
                        // Swipe Up detected -> open dedicated bottom sheet menu
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                            showBottomSheetMenu = true
                        }
                    }
                }
        )
    }

    private func bottomNavTab(index: Int, icon: String, title: String) -> some View {
        Button(action: { selectedTab = index }) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(selectedTab == index ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                Text(title)
                    .font(.system(size: 11, weight: selectedTab == index ? .bold : .medium))
                    .foregroundColor(selectedTab == index ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
            }
            .frame(maxWidth: .infinity)
        }
    }
}
