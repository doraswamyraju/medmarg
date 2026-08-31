import SwiftUI

struct SidebarView: View {
    let user: UserProfile
    @Binding var showSidebar: Bool
    @Binding var selectedTab: Int
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
                // Brand Logo & User Profile Header
                VStack(alignment: .leading, spacing: 14) {
                    HStack(spacing: 10) {
                        Image("logo-icon")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 32, height: 32)
                        
                        VStack(alignment: .leading, spacing: 1) {
                            Text("MedMarg")
                                .font(.system(size: 18, weight: .black))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text("HEALTH & DIAGNOSTICS")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Button(action: { withAnimation { showSidebar = false } }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 20))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }

                    HStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(MedMargTheme.primaryTeal)
                                .frame(width: 44, height: 44)
                            Text(String(user.name.prefix(1)))
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(user.name)
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text(user.email)
                                .font(.system(size: 11))
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

                // Role-Specific Navigation Menu Items
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("WORKSPACE MODULES")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                            .padding(.horizontal, 20)
                            .padding(.top, 12)

                        switch user.role {
                        case .admin:
                            adminSidebarItems
                        case .patient:
                            patientSidebarItems
                        case .doctor:
                            doctorSidebarItems
                        case .diagnosticLab:
                            labSidebarItems
                        case .scanCenter:
                            scanCenterSidebarItems
                        case .pharmacy:
                            pharmacySidebarItems
                        case .collectionAgent:
                            agentSidebarItems
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

    // Role Specific Sidebar Content
    private var adminSidebarItems: some View {
        Group {
            sidebarItem(icon: "chart.bar.fill", title: "System Overview", active: selectedTab == 0) {
                selectedTab = 0
                showSidebar = false
            }
            sidebarItem(icon: "person.2.fill", title: "Users & Access Control", active: selectedTab == 1) {
                selectedTab = 1
                showSidebar = false
            }
            sidebarItem(icon: "flask.fill", title: "Tests & Pricing Catalog", active: selectedTab == 2) {
                selectedTab = 2
                showSidebar = false
            }
            sidebarItem(icon: "building.2.fill", title: "Partner NABL Labs", active: selectedTab == 3) {
                selectedTab = 3
                showSidebar = false
            }
            sidebarItem(icon: "car.fill", title: "Fleet & Cold-Chain IOT", active: selectedTab == 4) {
                selectedTab = 4
                showSidebar = false
            }
        }
    }

    private var patientSidebarItems: some View {
        Group {
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
        }
    }

    private var doctorSidebarItems: some View {
        Group {
            sidebarItem(icon: "stethoscope", title: "OPD Workdesk & Queue", active: selectedTab == 0) {
                selectedTab = 0
                showSidebar = false
            }
            sidebarItem(icon: "doc.badge.plus", title: "E-Prescriptions", active: selectedTab == 1) {
                selectedTab = 1
                showSidebar = false
            }
        }
    }

    private var labSidebarItems: some View {
        Group {
            sidebarItem(icon: "flask.fill", title: "Lab Processing Queue", active: selectedTab == 0) {
                selectedTab = 0
                showSidebar = false
            }
            sidebarItem(icon: "checkmark.seal.fill", title: "Upload Certified Reports", active: selectedTab == 1) {
                selectedTab = 1
                showSidebar = false
            }
        }
    }

    private var scanCenterSidebarItems: some View {
        Group {
            sidebarItem(icon: "waveform.path.ecg.rectangle", title: "3.0T Radiology Hub", active: selectedTab == 0) {
                selectedTab = 0
                showSidebar = false
            }
        }
    }

    private var pharmacySidebarItems: some View {
        Group {
            sidebarItem(icon: "pills.fill", title: "Generic Chemist Desk", active: selectedTab == 0) {
                selectedTab = 0
                showSidebar = false
            }
        }
    }

    private var agentSidebarItems: some View {
        Group {
            sidebarItem(icon: "car.fill", title: "Field Collection Roster", active: selectedTab == 0) {
                selectedTab = 0
                showSidebar = false
            }
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
