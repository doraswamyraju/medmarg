import SwiftUI

struct BottomSheetMenuView: View {
    let user: UserProfile
    @Binding var isPresented: Bool
    @Binding var selectedTab: Int
    @Binding var selectedSubTab: Int
    let onLogout: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            // Drag Handle Bar
            Capsule()
                .fill(MedMargTheme.slate500.opacity(0.3))
                .frame(width: 40, height: 5)
                .padding(.top, 10)
                .padding(.bottom, 8)

            // Header Bar
            HStack {
                Image("logo")
                    .resizable()
                    .scaledToFit()
                    .frame(height: 28)

                VStack(alignment: .leading, spacing: 1) {
                    Text("Workspace Hub")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("All Modules & Inner Navigation")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Button(action: { isPresented = false }) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 22))
                        .foregroundColor(MedMargTheme.slate500)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 8)

            Divider()

            // Grid / Cards List of Modules & Inner Sub-Tabs
            ScrollView(showsIndicators: false) {
                VStack(spacing: 14) {
                    if user.role == .admin {
                        adminBottomSheetModules
                    } else {
                        patientBottomSheetModules
                    }
                }
                .padding(20)
            }

            Spacer()
        }
        .background(MedMargTheme.pureWhite)
    }

    private var adminBottomSheetModules: some View {
        VStack(spacing: 12) {
            // Module 0: Overview
            bottomSheetModuleCard(
                tabIndex: 0,
                icon: "chart.bar.fill",
                title: "Overview",
                description: "Live Revenue, Order Metrics & Platform Activity Log",
                subTabs: [
                    (0, "Live Metrics"),
                    (1, "Telemetry Feed"),
                    (2, "Activity Logs")
                ]
            )

            // Module 1: Tests
            bottomSheetModuleCard(
                tabIndex: 1,
                icon: "flask.fill",
                title: "Tests",
                description: "104 Parameters, B2B Negotiated Rates & Category Manager",
                subTabs: [
                    (0, "Diagnostic Tests"),
                    (1, "Full Body Packages"),
                    (2, "Category Manager")
                ]
            )

            // Module 2: Labs
            bottomSheetModuleCard(
                tabIndex: 2,
                icon: "building.2.fill",
                title: "Labs",
                description: "Thyrocare, Apollo & Lal PathLabs Accredited Centers",
                subTabs: [
                    (0, "Active Accredited Labs"),
                    (1, "Onboarding Requests"),
                    (2, "Quality NABL")
                ]
            )

            // Module 3: Hospitals
            bottomSheetModuleCard(
                tabIndex: 3,
                icon: "cross.case.fill",
                title: "Hospitals",
                description: "Partner Hospital Consoles, OPD Token Desks & Radiology",
                subTabs: [
                    (0, "Partner Hospitals"),
                    (1, "OPD Token Desk"),
                    (2, "Radiology Hubs")
                ]
            )

            // Module 4: Pharmacies
            bottomSheetModuleCard(
                tabIndex: 4,
                icon: "pills.fill",
                title: "Pharmacies",
                description: "Generic Chemist Stores, Stock Inventory & E-Prescriptions",
                subTabs: [
                    (0, "Generic Chemist Stores"),
                    (1, "Medicine Inventory"),
                    (2, "Prescription Orders")
                ]
            )

            // Module 5: Agents
            bottomSheetModuleCard(
                tabIndex: 5,
                icon: "car.fill",
                title: "Agents",
                description: "Phlebotomist Roster, Cold-Chain Telemetry & Onboarding",
                subTabs: [
                    (0, "Phlebotomist Roster"),
                    (1, "Cold-Chain Telemetry"),
                    (2, "Agent Onboarding")
                ]
            )

            // Module 6: Inventory
            bottomSheetModuleCard(
                tabIndex: 6,
                icon: "box.truck.fill",
                title: "Inventory",
                description: "Supplies Stock Overview, Agent Dispatches & Purchase Orders",
                subTabs: [
                    (0, "Stock Overview"),
                    (1, "Agent Supplies Dispatch"),
                    (2, "Purchase Orders")
                ]
            )

            // Module 7: Users
            bottomSheetModuleCard(
                tabIndex: 7,
                icon: "person.2.fill",
                title: "Users",
                description: "All System Users, Doctors, Labs, Agents & Patients Access",
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

    private var patientBottomSheetModules: some View {
        VStack(spacing: 12) {
            bottomSheetModuleCard(tabIndex: 0, icon: "house.fill", title: "Home Dashboard", description: "Multi-Lab Diagnostic Search & Bestseller Packages", subTabs: [])
            bottomSheetModuleCard(tabIndex: 1, icon: "flask.fill", title: "Labs & Pathology Catalog", description: "Thyrocare Full Body Profiles & Health Panels", subTabs: [])
            bottomSheetModuleCard(tabIndex: 2, icon: "location.fill.viewfinder", title: "Live Phlebotomist Tracker", description: "GPS Tracking for Home Sample Collection Agent", subTabs: [])
            bottomSheetModuleCard(tabIndex: 3, icon: "doc.text.fill", title: "Prescriptions & Records", description: "Digital Lab Reports & E-Prescriptions Vault", subTabs: [])
        }
    }

    private func bottomSheetModuleCard(tabIndex: Int, icon: String, title: String, description: String, subTabs: [(Int, String)]) -> some View {
        let isActive = selectedTab == tabIndex

        return VStack(alignment: .leading, spacing: 10) {
            // Main Module Header Row
            Button(action: {
                selectedTab = tabIndex
                selectedSubTab = 0
                isPresented = false
            }) {
                HStack(spacing: 12) {
                    Image(systemName: icon)
                        .font(.system(size: 20))
                        .foregroundColor(isActive ? .white : MedMargTheme.primaryTeal)
                        .padding(10)
                        .background(isActive ? MedMargTheme.primaryTeal : MedMargTheme.lightTeal)
                        .cornerRadius(10)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(title)
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)

                        Text(description)
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            // Inner Sub-Tabs Chips Row
            if !subTabs.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(subTabs, id: \.0) { sub in
                            let isSubActive = isActive && selectedSubTab == sub.0
                            Button(action: {
                                selectedTab = tabIndex
                                selectedSubTab = sub.0
                                isPresented = false
                            }) {
                                HStack(spacing: 4) {
                                    Circle()
                                        .fill(isSubActive ? .white : MedMargTheme.primaryTeal)
                                        .frame(width: 5, height: 5)
                                    Text(sub.1)
                                        .font(.system(size: 11, weight: isSubActive ? .bold : .medium))
                                }
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(isSubActive ? MedMargTheme.primaryTeal : MedMargTheme.slate50)
                                .foregroundColor(isSubActive ? .white : MedMargTheme.slate700)
                                .cornerRadius(14)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 14)
                                        .stroke(isSubActive ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1)
                                )
                            }
                        }
                    }
                }
            }
        }
        .padding(14)
        .background(MedMargTheme.pureWhite)
        .cornerRadius(14)
        .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(isActive ? MedMargTheme.primaryTeal.opacity(0.4) : Color.clear, lineWidth: 1.5)
        )
    }
}
