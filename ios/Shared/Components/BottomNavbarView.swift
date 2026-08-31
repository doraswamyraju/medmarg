import SwiftUI

struct BottomNavbarView: View {
    @Binding var selectedTab: Int
    let userRole: UserRole
    @Binding var showBottomSheetMenu: Bool
    @Binding var showQuickCreateSheet: Bool

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
                    // 🛡️ SUPER ADMIN DEDICATED 5-ELEMENT BOTTOM NAVBAR
                    // ==========================================
                    // 1. Tests (Tab 1)
                    bottomNavTab(index: 1, icon: "flask.fill", title: "Tests")

                    // 2. Labs (Tab 2)
                    bottomNavTab(index: 2, icon: "building.2.fill", title: "Labs")

                    // 3. ➕ Quick Create Action Button (DISTINCT HIGHLIGHTED CENTER BUTTON)
                    Button(action: { showQuickCreateSheet = true }) {
                        VStack(spacing: 2) {
                            ZStack {
                                Circle()
                                    .fill(LinearGradient(colors: [MedMargTheme.primaryTeal, MedMargTheme.accentEmerald], startPoint: .topLeading, endPoint: .bottomTrailing))
                                    .frame(width: 48, height: 48)
                                    .shadow(color: MedMargTheme.accentEmerald.opacity(0.5), radius: 8, x: 0, y: 4)

                                Image(systemName: "plus")
                                    .font(.system(size: 24, weight: .black))
                                    .foregroundColor(.white)
                            }

                            Text("Create")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }
                        .frame(maxWidth: .infinity)
                    }

                    // 4. Hospitals (Tab 3)
                    bottomNavTab(index: 3, icon: "cross.case.fill", title: "Hospitals")

                    // 5. Agents (Tab 5)
                    bottomNavTab(index: 5, icon: "car.fill", title: "Agents")
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
