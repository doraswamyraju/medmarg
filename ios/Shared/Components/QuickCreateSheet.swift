import SwiftUI

struct QuickCreateSheet: View {
    @Binding var isPresented: Bool
    @Binding var selectedTab: Int
    @Binding var selectedSubTab: Int

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
                VStack(alignment: .leading, spacing: 2) {
                    Text("Quick Create & Onboarding")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Select an entity to create or onboard into MedMarg")
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
            .padding(.vertical, 10)

            Divider()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 12) {
                    // Option 1: Create Test / Package
                    quickCreateActionCard(
                        icon: "flask.fill",
                        color: MedMargTheme.primaryTeal,
                        title: "Create Diagnostic Test / Package",
                        description: "Add a single test parameter or full-body checkup profile with NABL rate card",
                        action: {
                            selectedTab = 1 // Tests tab
                            selectedSubTab = 0
                            isPresented = false
                        }
                    )

                    // Option 2: Create User / Doctor
                    quickCreateActionCard(
                        icon: "person.badge.plus",
                        color: MedMargTheme.accentEmerald,
                        title: "Create User / Doctor Account",
                        description: "Grant system role access for doctors, admins, or patient profiles",
                        action: {
                            selectedTab = 7 // Users tab
                            selectedSubTab = 0
                            isPresented = false
                        }
                    )

                    // Option 3: Onboard Partner NABL Lab
                    quickCreateActionCard(
                        icon: "building.2.fill",
                        color: Color.blue,
                        title: "Onboard Partner NABL Lab",
                        description: "Register processing lab, NABL license credentials & B2B margins",
                        action: {
                            selectedTab = 2 // Labs tab
                            selectedSubTab = 1 // Onboarding requests
                            isPresented = false
                        }
                    )

                    // Option 4: Add Partner Hospital Console
                    quickCreateActionCard(
                        icon: "cross.case.fill",
                        color: Color.purple,
                        title: "Add Partner Hospital Console",
                        description: "Connect hospital OPD token desk & radiology scanning center",
                        action: {
                            selectedTab = 3 // Hospitals tab
                            selectedSubTab = 0
                            isPresented = false
                        }
                    )

                    // Option 5: Add Generic Pharmacy Outlet
                    quickCreateActionCard(
                        icon: "pills.fill",
                        color: Color.orange,
                        title: "Add Generic Pharmacy Outlet",
                        description: "Link chemist store for prescription fulfillment & medicine inventory",
                        action: {
                            selectedTab = 4 // Pharmacies tab
                            selectedSubTab = 0
                            isPresented = false
                        }
                    )

                    // Option 6: Onboard Phlebotomist Agent
                    quickCreateActionCard(
                        icon: "car.fill",
                        color: Color.indigo,
                        title: "Onboard Phlebotomist Agent",
                        description: "Assign home collection agent to fleet roster with cold-chain IOT box",
                        action: {
                            selectedTab = 5 // Agents tab
                            selectedSubTab = 0
                            isPresented = false
                        }
                    )
                }
                .padding(20)
            }
        }
        .background(MedMargTheme.pureWhite)
    }

    private func quickCreateActionCard(icon: String, color: Color, title: String, description: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Image(systemName: icon)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(color)
                    .padding(12)
                    .background(color.opacity(0.1))
                    .cornerRadius(12)

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Text(description)
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                        .multilineTextAlignment(.leading)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate500)
            }
            .padding(14)
            .background(MedMargTheme.pureWhite)
            .cornerRadius(14)
            .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(MedMargTheme.slate200, lineWidth: 1)
            )
        }
    }
}
