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

            HStack(spacing: 0) {
                if userRole == .collectionAgent {
                    // ==========================================
                    // 🛵 SALARIED FLEET PHLEBOTOMIST DEDICATED 5-ELEMENT BOTTOM NAVBAR
                    // 0: Pickups (CENTER LIVE ACTION), 1: Store/Inventory, 2: Shift Quota, 3: Payments, 4: Profile
                    // ==========================================
                    // Tab 1: Live Supplies / Inventory
                    bottomNavTab(index: 1, icon: "archivebox.fill", title: "Supplies")

                    // Tab 2: Shift Quota
                    bottomNavTab(index: 2, icon: "target", title: "Quota")

                    // Tab 0: Pickups (PROMINENT CENTER ACTION BUTTON)
                    Button(action: { selectedTab = 0 }) {
                        VStack(spacing: 2) {
                            ZStack {
                                Circle()
                                    .fill(LinearGradient(colors: [MedMargTheme.primaryTeal, MedMargTheme.darkTeal], startPoint: .topLeading, endPoint: .bottomTrailing))
                                    .frame(width: 44, height: 44)
                                    .shadow(color: MedMargTheme.primaryTeal.opacity(0.4), radius: 6, x: 0, y: 2)

                                Image(systemName: "bicycle.circle.fill")
                                    .font(.system(size: 22, weight: .bold))
                                    .foregroundColor(.white)
                            }

                            Text("Pickups")
                                .font(.system(size: 10, weight: .black))
                                .foregroundColor(selectedTab == 0 ? MedMargTheme.primaryTeal : MedMargTheme.slate700)
                        }
                        .frame(maxWidth: .infinity)
                    }

                    // Tab 3: Payments / POS Ledger
                    bottomNavTab(index: 3, icon: "creditcard.fill", title: "Payments")

                    // Tab 4: Agent Profile
                    bottomNavTab(index: 4, icon: "person.crop.circle.fill", title: "Terminal")
                } else if userRole == .freelanceAgent {
                    // ==========================================
                    // ⚡ FREELANCE GIG PHLEBOTOMIST DEDICATED BOTTOM NAVBAR
                    // 0: Claimed Pickups, 1: Broadcast Marketplace, 2: Wallet/Cashout, 3: Supplies, 4: Terminal
                    // ==========================================
                    bottomNavTab(index: 1, icon: "bolt.fill", title: "Marketplace")
                    bottomNavTab(index: 2, icon: "wallet.pass.fill", title: "Wallet")

                    Button(action: { selectedTab = 0 }) {
                        VStack(spacing: 2) {
                            ZStack {
                                Circle()
                                    .fill(LinearGradient(colors: [Color.orange, Color.red], startPoint: .topLeading, endPoint: .bottomTrailing))
                                    .frame(width: 44, height: 44)
                                    .shadow(color: Color.orange.opacity(0.4), radius: 6, x: 0, y: 2)

                                Image(systemName: "bicycle.circle.fill")
                                    .font(.system(size: 22, weight: .bold))
                                    .foregroundColor(.white)
                            }

                            Text("My Tasks")
                                .font(.system(size: 10, weight: .black))
                                .foregroundColor(selectedTab == 0 ? Color.orange : MedMargTheme.slate700)
                        }
                        .frame(maxWidth: .infinity)
                    }

                    bottomNavTab(index: 3, icon: "archivebox.fill", title: "Supplies")
                    bottomNavTab(index: 4, icon: "person.crop.circle.fill", title: "Profile")
                } else if userRole == .admin {
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

                    // 4. Hospitals (Tab 3)
                    bottomNavTab(index: 3, icon: "cross.case.fill", title: "Hospitals")

                    // 5. Agents (Tab 5)
                    bottomNavTab(index: 5, icon: "car.fill", title: "Agents")
                } else {
                    // ==========================================
                    // 📱 PATIENT / CARE SEEKER 5 CORE TABS
                    // 1: Tests, 7: Orders, 3: Track (CENTER), 4: Reports, 5: Offers
                    // (Profile is accessible via Topbar avatar)
                    // ==========================================
                    // Tab 1: Tests Matrix
                    bottomNavTab(index: 1, icon: "flask.fill", title: "Tests")

                    // Tab 7: Orders Desk
                    bottomNavTab(index: 7, icon: "bag.fill", title: "Orders")

                    // Tab 3: Track (ALWAYS CENTER HIGHLIGHTED ACTION BUTTON)
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

                                // Glowing LIVE Indicator Badge
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

                    // Tab 4: Health Vault Reports
                    bottomNavTab(index: 4, icon: "doc.text.fill", title: "Reports")

                    // Tab 5: Offers Zone & Promos
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
