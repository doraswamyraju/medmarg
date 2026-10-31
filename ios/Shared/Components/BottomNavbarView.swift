import SwiftUI

struct BottomNavbarView: View {
    @Binding var selectedTab: Int
    let userRole: UserRole
    @Binding var showBottomSheetMenu: Bool
    @Binding var showQuickCreateSheet: Bool

    var body: some View {
        if userRole == .collectionAgent || userRole == .freelanceAgent {
            agentGlassmorphicNavbar
        } else {
            standardBottomNavbar
        }
    }

    // ==========================================
    // 🔮 GLASSMORPHIC FLOATING PILL NAVBAR FOR AGENT
    // Matches Reference Design 3: Dark frosted glass capsule
    // Tabs: 0: Home, 7: Orders, 1: Inventory, 3: Payments, 4: Reports
    // ==========================================
    private var agentGlassmorphicNavbar: some View {
        HStack(spacing: 0) {
            agentGlassTab(index: 0, icon: "house.fill", title: "Home", isCenterBadge: true)
            agentGlassTab(index: 7, icon: "list.clipboard.fill", title: "Orders")
            agentGlassTab(index: 1, icon: "cube.box.fill", title: "Inventory")
            agentGlassTab(index: 3, icon: "indianrupeesign.circle.fill", title: "Payments")
            agentGlassTab(index: 4, icon: "chart.bar.xaxis", title: "Reports")
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(
            Capsule()
                .fill(Color(red: 0.08, green: 0.16, blue: 0.18).opacity(0.92))
                .overlay(
                    Capsule()
                        .stroke(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0.3),
                                    Color.white.opacity(0.08),
                                    Color.clear
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1
                        )
                )
                .shadow(color: Color.black.opacity(0.35), radius: 16, x: 0, y: 8)
        )
        .padding(.horizontal, 16)
        .padding(.bottom, 6)
    }

    private func agentGlassTab(index: Int, icon: String, title: String, isCenterBadge: Bool = false) -> some View {
        let isSelected = (selectedTab == index) || (index == 0 && (selectedTab != 7 && selectedTab != 1 && selectedTab != 3 && selectedTab != 4))
        
        return Button(action: {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) {
                selectedTab = index
            }
        }) {
            VStack(spacing: 4) {
                if isSelected {
                    // Glowing Active Capsule or Icon
                    ZStack {
                        Capsule()
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color(red: 0.0, green: 0.85, blue: 0.55).opacity(0.35),
                                        Color(red: 0.0, green: 0.65, blue: 0.45).opacity(0.2)
                                    ],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                            .frame(width: 52, height: 34)
                            .overlay(Capsule().stroke(Color(red: 0.0, green: 0.95, blue: 0.65).opacity(0.6), lineWidth: 1))

                        Image(systemName: icon)
                            .font(.system(size: 16, weight: .black))
                            .foregroundColor(Color(red: 0.2, green: 1.0, blue: 0.7))
                    }

                    Text(title)
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(Color(red: 0.2, green: 1.0, blue: 0.7))

                    // Small indicator dot
                    Circle()
                        .fill(Color(red: 0.0, green: 0.95, blue: 0.65))
                        .frame(width: 4, height: 4)
                        .shadow(color: Color(red: 0.0, green: 0.95, blue: 0.65), radius: 4)
                } else {
                    VStack(spacing: 4) {
                        Image(systemName: icon)
                            .font(.system(size: 17, weight: .medium))
                            .foregroundColor(Color.white.opacity(0.6))
                            .frame(height: 34)

                        Text(title)
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(Color.white.opacity(0.6))

                        Circle()
                            .fill(Color.clear)
                            .frame(width: 4, height: 4)
                    }
                }
            }
            .frame(maxWidth: .infinity)
        }
    }

    // ==========================================
    // 📱 STANDARD PORTAL BOTTOM NAVBAR (CUSTOMER & ADMIN)
    // ==========================================
    private var standardBottomNavbar: some View {
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

            HStack(spacing: 0) {
                if userRole == .admin {
                    // ==========================================
                    // 🛡️ SUPER ADMIN DEDICATED 5-ELEMENT BOTTOM NAVBAR
                    // ==========================================
                    bottomNavTab(index: 1, icon: "flask.fill", title: "Tests")
                    bottomNavTab(index: 2, icon: "building.2.fill", title: "Labs")

                    Button(action: { showQuickCreateSheet = true }) {
                        VStack(spacing: 2) {
                            ZStack {
                                Circle()
                                    .fill(LinearGradient(colors: [MedMargTheme.primaryTeal, MedMargTheme.accentEmerald], startPoint: .topLeading, endPoint: .bottomTrailing))
                                    .frame(width: 44, height: 44)
                                    .shadow(color: MedMargTheme.accentEmerald.opacity(0.5), radius: 8, x: 0, y: 4)

                                Image(systemName: "plus")
                                    .font(.system(size: 22, weight: .black))
                                    .foregroundColor(.white)
                            }

                            Text("Create")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }
                        .frame(maxWidth: .infinity)
                    }

                    bottomNavTab(index: 3, icon: "cross.case.fill", title: "Hospitals")
                    bottomNavTab(index: 5, icon: "car.fill", title: "Agents")
                } else {
                    // Customer
                    bottomNavTab(index: 1, icon: "flask.fill", title: "Tests")
                    bottomNavTab(index: 7, icon: "bag.fill", title: "Orders")

                    Button(action: { selectedTab = 3 }) {
                        VStack(spacing: 2) {
                            ZStack {
                                Circle()
                                    .fill(LinearGradient(colors: [MedMargTheme.primaryTeal, MedMargTheme.accentEmerald], startPoint: .topLeading, endPoint: .bottomTrailing))
                                    .frame(width: 42, height: 42)
                                    .shadow(color: MedMargTheme.accentEmerald.opacity(0.4), radius: 6, x: 0, y: 2)

                                Image(systemName: "location.fill.viewfinder")
                                    .font(.system(size: 19, weight: .bold))
                                    .foregroundColor(.white)

                                Circle()
                                    .fill(Color.red)
                                    .frame(width: 8, height: 8)
                                    .overlay(Circle().stroke(Color.white, lineWidth: 1.5))
                                    .offset(x: 12, y: -12)
                            }

                            Text("Track")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(selectedTab == 3 ? MedMargTheme.primaryTeal : MedMargTheme.slate700)
                        }
                        .frame(maxWidth: .infinity)
                    }

                    bottomNavTab(index: 4, icon: "doc.text.fill", title: "Reports")
                    bottomNavTab(index: 5, icon: "tag.fill", title: "Offers")
                }
            }
            .padding(.bottom, 6)
            .padding(.horizontal, 10)
        }
        .background(MedMargTheme.pureWhite)
        .shadow(color: Color.black.opacity(0.06), radius: 10, x: 0, y: -4)
        .gesture(
            DragGesture(minimumDistance: 15, coordinateSpace: .local)
                .onEnded { value in
                    if value.translation.height < -20 {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                            showBottomSheetMenu = true
                        }
                    }
                }
        )
    }

    private func bottomNavTab(index: Int, icon: String, title: String) -> some View {
        Button(action: { selectedTab = index }) {
            VStack(spacing: 3) {
                Image(systemName: icon)
                    .font(.system(size: 17))
                    .foregroundColor(selectedTab == index ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                Text(title)
                    .font(.system(size: 10, weight: selectedTab == index ? .bold : .medium))
                    .foregroundColor(selectedTab == index ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
        }
    }
}
