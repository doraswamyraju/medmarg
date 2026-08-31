import SwiftUI

struct SidebarView: View {
    let user: UserProfile
    @Binding var showSidebar: Bool
    @Binding var selectedTab: Int
    @Binding var selectedSubTab: Int
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
                // Header: Horizontal MedMarg Logo, Super Admin Title & Email
                VStack(alignment: .leading, spacing: 10) {
                    HStack(alignment: .center, spacing: 10) {
                        Image("logo")
                            .resizable()
                            .scaledToFit()
                            .frame(height: 34)

                        Spacer()

                        Button(action: { withAnimation { showSidebar = false } }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 22))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(user.role.displayName)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        Text(user.email)
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    Divider()
                }
                .padding(18)
                .background(MedMargTheme.slate50)

                // Sidebar Navigation Tabs with Inner Sub-Tabs
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("WORKSPACE MODULES")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                            .padding(.horizontal, 20)
                            .padding(.top, 12)

                        if user.role == .admin {
                            adminSidebarModules
                        } else {
                            patientSidebarModules
                        }
                    }
                    .padding(.vertical, 8)
                }

                Spacer()

                // Logout Footer Button
                Button(action: {
                    showSidebar = false
                    onLogout()
                }) {
                    HStack(spacing: 10) {
                        Image(systemName: "power")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.red)
                        Text("Logout")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.red)
                    }
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.red.opacity(0.06))
                }
            }
            .frame(width: 300)
            .background(MedMargTheme.pureWhite)
            .shadow(color: Color.black.opacity(0.2), radius: 10, x: 5, y: 0)
            .transition(.move(edge: .leading))
        }
    }

    // Super Admin Expandable Modules with Inner Sub-Tabs
    private var adminSidebarModules: some View {
        Group {
            // Module 0: Overview
            sidebarMainTab(index: 0, icon: "chart.bar.fill", title: "System Overview", subTabs: [
                (0, "Live Metrics"),
                (1, "Telemetry Feed"),
                (2, "Activity Logs")
            ])

            // Module 1: Users & Access
            sidebarMainTab(index: 1, icon: "person.2.fill", title: "Users & Access Control", subTabs: [
                (0, "All System Users"),
                (1, "Doctor Accounts"),
                (2, "Diagnostic Labs"),
                (3, "Phlebotomists")
            ])

            // Module 2: Tests & Catalog
            sidebarMainTab(index: 2, icon: "flask.fill", title: "Tests & Rates Catalog", subTabs: [
                (0, "Diagnostic Tests"),
                (1, "Full Body Packages"),
                (2, "Categories Manager")
            ])

            // Module 3: Partner Labs
            sidebarMainTab(index: 3, icon: "building.2.fill", title: "Partner NABL Labs", subTabs: [
                (0, "Active Accredited Labs"),
                (1, "Onboarding Requests"),
                (2, "Commission Margins")
            ])

            // Module 4: Fleet & Cold-Chain
            sidebarMainTab(index: 4, icon: "car.fill", title: "Fleet & Cold-Chain IOT", subTabs: [
                (0, "Phlebotomist Roster"),
                (1, "IOT Temperature Telemetry"),
                (2, "Sample Dispatches")
            ])
        }
    }

    private var patientSidebarModules: some View {
        Group {
            sidebarMainTab(index: 0, icon: "house.fill", title: "Home Dashboard", subTabs: [])
            sidebarMainTab(index: 1, icon: "flask.fill", title: "Labs & Pathology Catalog", subTabs: [])
            sidebarMainTab(index: 2, icon: "location.fill.viewfinder", title: "Live Phlebotomist Tracker", subTabs: [])
            sidebarMainTab(index: 3, icon: "doc.text.fill", title: "Prescriptions & Records", subTabs: [])
        }
    }

    private func sidebarMainTab(index: Int, icon: String, title: String, subTabs: [(Int, String)]) -> some View {
        let isMainActive = selectedTab == index

        return VStack(alignment: .leading, spacing: 2) {
            Button(action: {
                selectedTab = index
                selectedSubTab = 0
                showSidebar = false
            }) {
                HStack(spacing: 12) {
                    Image(systemName: icon)
                        .font(.system(size: 16))
                        .foregroundColor(isMainActive ? MedMargTheme.primaryTeal : MedMargTheme.slate700)
                        .frame(width: 24)

                    Text(title)
                        .font(.system(size: 14, weight: isMainActive ? .bold : .medium))
                        .foregroundColor(isMainActive ? MedMargTheme.primaryTeal : MedMargTheme.slate900)

                    Spacer()

                    if !subTabs.isEmpty {
                        Image(systemName: isMainActive ? "chevron.down" : "chevron.right")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(isMainActive ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(isMainActive ? MedMargTheme.lightTeal : Color.clear)
                .cornerRadius(8)
            }

            // Render Inner Sub-Tabs if main tab is active
            if isMainActive && !subTabs.isEmpty {
                VStack(alignment: .leading, spacing: 2) {
                    ForEach(subTabs, id: \.0) { sub in
                        Button(action: {
                            selectedTab = index
                            selectedSubTab = sub.0
                            showSidebar = false
                        }) {
                            HStack(spacing: 8) {
                                Circle()
                                    .fill(selectedSubTab == sub.0 ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                                    .frame(width: 5, height: 5)
                                Text(sub.1)
                                    .font(.system(size: 12, weight: selectedSubTab == sub.0 ? .bold : .regular))
                                    .foregroundColor(selectedSubTab == sub.0 ? MedMargTheme.primaryTeal : MedMargTheme.slate700)
                                Spacer()
                            }
                            .padding(.leading, 44)
                            .padding(.vertical, 6)
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 4)
    }
}
