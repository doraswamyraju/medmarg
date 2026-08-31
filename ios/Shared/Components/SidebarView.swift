import SwiftUI

struct SidebarView: View {
    let user: UserProfile
    @Binding var showSidebar: Bool
    @Binding var selectedTab: Int
    @Binding var selectedSubTab: Int
    let onLogout: () -> Void

    // Accordion State to toggle expand/collapse of main tabs
    @State private var expandedTabs: Set<Int> = [0]

    var body: some View {
        ZStack(alignment: .leading) {
            // Dark Backdrop Overlay
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture {
                    withAnimation { showSidebar = false }
                }

            VStack(alignment: .leading, spacing: 0) {
                // Header: Horizontal MedMarg Logo & User Info
                VStack(alignment: .leading, spacing: 10) {
                    HStack(alignment: .center, spacing: 10) {
                        Image("logo")
                            .resizable()
                            .scaledToFit()
                            .frame(height: 32)

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

                // Sidebar Navigation Tabs with Accordion Show/Hide Inner Options
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("SUPER ADMIN MODULES")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                            .padding(.horizontal, 20)
                            .padding(.top, 12)

                        if user.role == .admin {
                            adminAccordionModules
                        } else {
                            patientAccordionModules
                        }
                    }
                    .padding(.vertical, 8)
                }

                Spacer()

                // Footer Bar: Profile & Settings on left, Logout Icon on right ending
                HStack(spacing: 12) {
                    // Profile Options Button
                    Button(action: {
                        showSidebar = false
                        selectedTab = 7 // Users / Profile tab
                    }) {
                        HStack(spacing: 10) {
                            Image(systemName: "person.crop.circle.fill")
                                .font(.system(size: 20))
                                .foregroundColor(MedMargTheme.primaryTeal)

                            VStack(alignment: .leading, spacing: 1) {
                                Text("Profile & Settings")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)
                                Text("Account & Role Permissions")
                                    .font(.system(size: 10))
                                    .foregroundColor(MedMargTheme.slate500)
                            }
                        }
                    }

                    Spacer()

                    // Logout Action Button on Far Right Ending
                    Button(action: {
                        showSidebar = false
                        onLogout()
                    }) {
                        Image(systemName: "power")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.red)
                            .padding(10)
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(10)
                    }
                }
                .padding(16)
                .background(MedMargTheme.slate50)
                .overlay(
                    Rectangle()
                        .frame(height: 1)
                        .foregroundColor(MedMargTheme.slate200),
                    alignment: .top
                )
            }
            .frame(width: 300)
            .background(MedMargTheme.pureWhite)
            .shadow(color: Color.black.opacity(0.2), radius: 10, x: 5, y: 0)
            .transition(.move(edge: .leading))
        }
    }

    // 8 Exact Accordion Main Modules for Super Admin
    private var adminAccordionModules: some View {
        Group {
            // 0. Overview
            accordionTab(
                index: 0,
                icon: "chart.bar.fill",
                title: "Overview",
                subTabs: [
                    (0, "Live Metrics"),
                    (1, "Telemetry Feed"),
                    (2, "Activity Logs")
                ]
            )

            // 1. Tests
            accordionTab(
                index: 1,
                icon: "flask.fill",
                title: "Tests",
                subTabs: [
                    (0, "Diagnostic Tests"),
                    (1, "Full Body Packages"),
                    (2, "Category Manager")
                ]
            )

            // 2. Labs
            accordionTab(
                index: 2,
                icon: "building.2.fill",
                title: "Labs",
                subTabs: [
                    (0, "Active Accredited Labs"),
                    (1, "Onboarding Requests"),
                    (2, "Quality NABL")
                ]
            )

            // 3. Hospitals
            accordionTab(
                index: 3,
                icon: "cross.case.fill",
                title: "Hospitals",
                subTabs: [
                    (0, "Partner Hospitals"),
                    (1, "OPD Token Desk"),
                    (2, "Radiology Hubs")
                ]
            )

            // 4. Pharmacies
            accordionTab(
                index: 4,
                icon: "pills.fill",
                title: "Pharmacies",
                subTabs: [
                    (0, "Generic Chemist Stores"),
                    (1, "Medicine Inventory"),
                    (2, "Prescription Orders")
                ]
            )

            // 5. Agents
            accordionTab(
                index: 5,
                icon: "car.fill",
                title: "Agents",
                subTabs: [
                    (0, "Phlebotomist Roster"),
                    (1, "Cold-Chain Telemetry"),
                    (2, "Agent Onboarding")
                ]
            )

            // 6. Inventory
            accordionTab(
                index: 6,
                icon: "box.truck.fill",
                title: "Inventory",
                subTabs: [
                    (0, "Stock Overview"),
                    (1, "Agent Supplies Dispatch"),
                    (2, "Purchase Orders")
                ]
            )

            // 7. Users
            accordionTab(
                index: 7,
                icon: "person.2.fill",
                title: "Users",
                subTabs: [
                    (0, "All System Users"),
                    (1, "Doctor Accounts"),
                    (2, "Diagnostic Labs"),
                    (3, "Phlebotomists"),
                    (4, "Patients")
                ]
            )
        }
    }

    private var patientAccordionModules: some View {
        Group {
            accordionTab(index: 0, icon: "house.fill", title: "Home Dashboard", subTabs: [])
            accordionTab(index: 1, icon: "flask.fill", title: "Labs & Pathology Catalog", subTabs: [])
            accordionTab(index: 2, icon: "location.fill.viewfinder", title: "Live Phlebotomist Tracker", subTabs: [])
            accordionTab(index: 3, icon: "doc.text.fill", title: "Prescriptions & Records", subTabs: [])
        }
    }

    private func accordionTab(index: Int, icon: String, title: String, subTabs: [(Int, String)]) -> some View {
        let isMainSelected = selectedTab == index
        let isExpanded = expandedTabs.contains(index)

        return VStack(alignment: .leading, spacing: 2) {
            // Main Tab Row -> Click to expand/collapse inner options
            Button(action: {
                withAnimation(.easeInOut(duration: 0.25)) {
                    if isExpanded {
                        expandedTabs.remove(index)
                    } else {
                        expandedTabs.insert(index)
                    }
                    selectedTab = index
                    selectedSubTab = 0
                }
            }) {
                HStack(spacing: 12) {
                    Image(systemName: icon)
                        .font(.system(size: 16))
                        .foregroundColor(isMainSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate700)
                        .frame(width: 24)

                    Text(title)
                        .font(.system(size: 14, weight: isMainSelected ? .bold : .medium))
                        .foregroundColor(isMainSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate900)

                    Spacer()

                    if !subTabs.isEmpty {
                        Image(systemName: isExpanded ? "chevron.down" : "chevron.right")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(isMainSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(isMainSelected ? MedMargTheme.lightTeal : Color.clear)
                .cornerRadius(8)
            }

            // Inner Options list -> Shown when expanded
            if isExpanded && !subTabs.isEmpty {
                VStack(alignment: .leading, spacing: 2) {
                    ForEach(subTabs, id: \.0) { sub in
                        let isSubSelected = isMainSelected && selectedSubTab == sub.0

                        Button(action: {
                            selectedTab = index
                            selectedSubTab = sub.0
                            showSidebar = false
                        }) {
                            HStack(spacing: 8) {
                                Circle()
                                    .fill(isSubSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                                    .frame(width: 5, height: 5)

                                Text(sub.1)
                                    .font(.system(size: 12, weight: isSubSelected ? .bold : .regular))
                                    .foregroundColor(isSubSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate700)

                                Spacer()
                            }
                            .padding(.leading, 44)
                            .padding(.vertical, 6)
                        }
                    }
                }
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .padding(.horizontal, 4)
    }
}
