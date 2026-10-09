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
                    Text("All Modules & Quick Navigation")
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
                    } else if user.role == .collectionAgent {
                        agentBottomSheetModules
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
            bottomSheetModuleCard(
                tabIndex: 0,
                icon: "chart.bar.fill",
                title: "Overview",
                description: "Live Revenue, Order Metrics & Platform Activity Log",
                subTabs: [(0, "Live Metrics"), (1, "Telemetry Feed"), (2, "Activity Logs")]
            )

            bottomSheetModuleCard(
                tabIndex: 1,
                icon: "flask.fill",
                title: "Tests",
                description: "104 Parameters, B2B Negotiated Rates & Category Manager",
                subTabs: [(0, "Diagnostic Tests"), (1, "Full Body Packages"), (2, "Category Manager")]
            )

            bottomSheetModuleCard(
                tabIndex: 2,
                icon: "building.2.fill",
                title: "Labs",
                description: "Thyrocare, Apollo & Lal PathLabs Accredited Centers",
                subTabs: [(0, "Active Accredited Labs"), (1, "Lab Verification"), (2, "Processing Turnaround")]
            )

            bottomSheetModuleCard(
                tabIndex: 3,
                icon: "cross.case.fill",
                title: "Hospitals & Doctors",
                description: "OPD Specialist Clinics, Tokens & Verification Roster",
                subTabs: [(0, "Verified Doctors"), (1, "OPD Clinics"), (2, "Doctor Onboarding")]
            )

            bottomSheetModuleCard(
                tabIndex: 4,
                icon: "pills.fill",
                title: "Pharmacies",
                description: "Generic Chemist Stores, Stock Inventory & E-Prescriptions",
                subTabs: [(0, "Generic Chemist Stores"), (1, "Medicine Inventory"), (2, "Prescription Orders")]
            )

            bottomSheetModuleCard(
                tabIndex: 5,
                icon: "car.fill",
                title: "Agents",
                description: "Phlebotomist Roster, Cold-Chain Telemetry & Onboarding",
                subTabs: [(0, "Phlebotomist Roster"), (1, "Cold-Chain Telemetry"), (2, "Agent Onboarding")]
            )
        }
    }

    private var patientBottomSheetModules: some View {
        VStack(spacing: 12) {
            // Tab 0: Home
            bottomSheetModuleCard(
                tabIndex: 0,
                icon: "house.fill",
                title: "Home",
                description: "Healthcare & Wellness Hub, Instant Booking & Curated Plans",
                subTabs: [(0, "Curated Plans"), (1, "Offers Zone"), (2, "Instant Services")]
            )

            // Tab 1: Labs & Tests Matrix
            bottomSheetModuleCard(
                tabIndex: 1,
                icon: "flask.fill",
                title: "Labs & Tests Matrix",
                description: "913+ Pathology Tests, Profiles, Health Packages & Multi-Lab Pricing",
                subTabs: [(0, "All Matrix"), (1, "Health Packages"), (2, "Diagnostic Profiles"), (3, "Individual Tests")]
            )

            // Tab 2: Apple Health Vitals Hub
            bottomSheetModuleCard(
                tabIndex: 2,
                icon: "heart.fill",
                title: "Apple Health Vitals & History",
                description: "Real-Time Telemetry, Past 24h/7D/30D Historical Analytics & Alerts",
                subTabs: [(0, "Live Telemetry"), (1, "Historical Data"), (2, "Vital Alerts")]
            )

            // Tab 3: Track Radar
            bottomSheetModuleCard(
                tabIndex: 3,
                icon: "location.fill.viewfinder",
                title: "Live Tracking & Dispatch",
                description: "Phlebotomist GPS Radar, 4-Digit Handover OTP & IoT Cold-Chain 3.8°C",
                subTabs: [(0, "Active Radar"), (1, "Doorstep OTP"), (2, "Collector Contact")]
            )

            // Tab 4: Reports Vault
            bottomSheetModuleCard(
                tabIndex: 4,
                icon: "doc.text.fill",
                title: "Digital Health Vault",
                description: "NABL PDF Lab Reports & Multi-Month Longitudinal Biomarker Trends",
                subTabs: [(0, "NABL Reports"), (1, "Biomarker Trends"), (2, "Google Drive Sync")]
            )

            // Tab 5: Referrals & Corporate
            bottomSheetModuleCard(
                tabIndex: 5,
                icon: "gift.fill",
                title: "Refer & Corporate Wellness",
                description: "Earn ₹200 Wallet Cash per Referral & Manage Corporate Staff Roster",
                subTabs: [(0, "Refer & Earn"), (1, "Corporate Wellness"), (2, "Staff Health Roster")]
            )

            // Tab 6: Profile & Family
            bottomSheetModuleCard(
                tabIndex: 6,
                icon: "person.crop.circle.fill",
                title: "Care Seeker Profile & Family",
                description: "ABHA ID, Linked Family Profiles, Saved Addresses & Preferences",
                subTabs: [(0, "Care Seeker Profile"), (1, "ABHA Digital ID"), (2, "Linked Family")]
            )
        }
    }

    private var agentBottomSheetModules: some View {
        VStack(spacing: 12) {
            bottomSheetModuleCard(
                tabIndex: 0,
                icon: "list.clipboard.fill",
                title: "Assigned Pickups",
                description: "Today's Home Sample Collections & Time Slots",
                subTabs: [(0, "Pending"), (1, "Sample Drawn"), (2, "Delivered to Lab")]
            )

            bottomSheetModuleCard(
                tabIndex: 1,
                icon: "thermometer.medium",
                title: "Cold-Chain Box",
                description: "IoT Temperature Sensor (4.2°C) & Battery Level",
                subTabs: [(0, "Live Temp"), (1, "Ice Gel Pack Log")]
            )

            bottomSheetModuleCard(
                tabIndex: 2,
                icon: "qrcode.viewfinder",
                title: "Barcode Scanner",
                description: "Scan Vacutainer Test Tubes & Link to Patient Order",
                subTabs: [(0, "Scan SST"), (1, "Scan EDTA"), (2, "Scan Urine")]
            )
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
                    HStack(spacing: 8) {
                        ForEach(subTabs, id: \.0) { sub in
                            Button(action: {
                                selectedTab = tabIndex
                                selectedSubTab = sub.0
                                isPresented = false
                            }) {
                                Text(sub.1)
                                    .font(.system(size: 11, weight: .semibold))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 5)
                                    .background(selectedTab == tabIndex && selectedSubTab == sub.0 ? MedMargTheme.darkTeal : MedMargTheme.slate50)
                                    .foregroundColor(selectedTab == tabIndex && selectedSubTab == sub.0 ? .white : MedMargTheme.slate700)
                                    .cornerRadius(6)
                            }
                        }
                    }
                }
            }
        }
        .padding(14)
        .background(MedMargTheme.pureWhite)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isActive ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: isActive ? 1.5 : 1)
        )
    }
}
