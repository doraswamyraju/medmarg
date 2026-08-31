import SwiftUI

struct BottomNavbarView: View {
    @Binding var selectedTab: Int
    let userRole: UserRole

    var body: some View {
        HStack {
            if userRole == .admin {
                // ==========================================
                // 🛡️ SUPER ADMIN DEDICATED BOTTOM NAVBAR
                // ==========================================
                // Tab 0: Overview
                bottomNavTab(index: 0, icon: "chart.bar.fill", title: "Overview")

                // Tab 1: Users & Access
                bottomNavTab(index: 1, icon: "person.2.fill", title: "Users")

                // Tab 2: Tests & Rates Catalog (CREATIVE CENTER HIGHLIGHTED ACTION BUTTON)
                Button(action: { selectedTab = 2 }) {
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

                        Text("Tests & Rates")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(selectedTab == 2 ? MedMargTheme.primaryTeal : MedMargTheme.slate700)
                    }
                    .frame(maxWidth: .infinity)
                }

                // Tab 3: Partner Labs
                bottomNavTab(index: 3, icon: "building.2.fill", title: "NABL Labs")

                // Tab 4: Fleet & Cold-Chain
                bottomNavTab(index: 4, icon: "car.fill", title: "Fleet & IOT")
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
        .padding(.vertical, 8)
        .padding(.horizontal, 16)
        .background(MedMargTheme.pureWhite)
        .shadow(color: Color.black.opacity(0.06), radius: 10, x: 0, y: -4)
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
