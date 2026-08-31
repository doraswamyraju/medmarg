import SwiftUI

struct AdminConsoleView: View {
    @Binding var users: [UserProfile]
    let onLogout: () -> Void

    @Binding var activeTab: Int // 0: Overview, 1: Users & Access, 2: Tests & Catalog, 3: Partner Labs, 4: Fleet & Cold-Chain
    @Binding var activeSubTab: Int

    // Dynamic State for Tests, Labs & Fleet
    @State private var testsList: [LabTestItem] = WEB_THYROCARE_TESTS
    @State private var labPartners: [LabPartner] = [
        LabPartner(id: "LAB-01", name: "Thyrocare Central Processing Lab", type: "National Reference Lab", city: "Mumbai / Pan-India", nabl: "NABL-CC-4921", status: "ACTIVE", margin: "15%", testsCount: 104),
        LabPartner(id: "LAB-02", name: "Apollo Diagnostics Tirupati", type: "Regional Processing Hub", city: "Tirupati (Air Bypass Rd)", nabl: "NABL-AP-8921", status: "ACTIVE", margin: "18%", testsCount: 85),
        LabPartner(id: "LAB-03", name: "Dr. Lal PathLabs Hub", type: "Accredited Lab", city: "Tirupati (Renigunta Rd)", nabl: "NABL-AP-3104", status: "ACTIVE", margin: "15%", testsCount: 92)
    ]
    @State private var pendingLabRequests: [LabRequest] = [
        LabRequest(id: "REQ-101", name: "Star Diagnostics & Pathology Hub", applicant: "Dr. K. Srinivas", city: "Tirupati (Alipiri)", license: "AP-MED-2026-89", phone: "+91 98765 99001", testsOffered: 45, date: "30 Aug 2026"),
        LabRequest(id: "REQ-102", name: "Srinivasa Bio-Pathology Care", applicant: "Dr. R. Mohan", city: "Chandragiri, Tirupati", license: "AP-MED-2026-94", phone: "+91 98765 99002", testsOffered: 38, date: "29 Aug 2026")
    ]
    @State private var fleetAgents: [FleetAgentStatus] = [
        FleetAgentStatus(id: "AG-01", name: "Ramesh Kumar", phone: "+91 98765 11223", area: "Air Bypass & Alipiri, Tirupati", samplesToday: 9, temp: "4.2°C", battery: "88%", status: "ON_ROUTE"),
        FleetAgentStatus(id: "AG-02", name: "Srinivas Rao", phone: "+91 98765 22334", area: "Renigunta Rd, Tirupati", samplesToday: 14, temp: "3.8°C", battery: "94%", status: "AT_PATIENT_HOME"),
        FleetAgentStatus(id: "AG-03", name: "Praveen V.", phone: "+91 98765 33445", area: "SVIMS & Hospital Zone", samplesToday: 11, temp: "4.5°C", battery: "76%", status: "DELIVERING_TO_LAB")
    ]

    // Modals & Form States
    @State private var showAddUserSheet: Bool = false
    @State private var showAddTestSheet: Bool = false

    // New User Form State
    @State private var newName: String = ""
    @State private var newUsername: String = ""
    @State private var newEmail: String = ""
    @State private var newPhone: String = ""
    @State private var newOrganization: String = ""
    @State private var newRole: UserRole = .patient

    // New Test Form State
    @State private var newTestName: String = ""
    @State private var newTestCategory: String = "Thyroid & Hormones"
    @State private var newTestParams: String = "1"
    @State private var newTestSample: String = "Blood (Serum)"
    @State private var newTestDescription: String = ""
    @State private var newTestThyrocarePrice: String = ""
    @State private var newTestApolloPrice: String = ""
    @State private var newTestLalPrice: String = ""
    @State private var newTestMRP: String = ""
    @State private var newTestTag: String = "SPECIAL RATE"

    var body: some View {
        VStack(spacing: 0) {

            // Main Module Tab Pills (Row 1)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    adminMainTabPill(index: 0, title: "Overview", icon: "chart.bar.fill")
                    adminMainTabPill(index: 1, title: "Tests (\(testsList.count))", icon: "flask.fill")
                    adminMainTabPill(index: 2, title: "Labs (\(labPartners.count))", icon: "building.2.fill")
                    adminMainTabPill(index: 3, title: "Hospitals", icon: "cross.case.fill")
                    adminMainTabPill(index: 4, title: "Pharmacies", icon: "pills.fill")
                    adminMainTabPill(index: 5, title: "Agents (\(fleetAgents.count))", icon: "car.fill")
                    adminMainTabPill(index: 6, title: "Inventory", icon: "box.truck.fill")
                    adminMainTabPill(index: 7, title: "Users (\(users.count))", icon: "person.2.fill")
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
            }
            .background(MedMargTheme.slate50)

            // Inner Sub-Tab Pills (Row 2)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    ForEach(innerSubTabsFor(mainTab: activeTab), id: \.0) { sub in
                        Button(action: { activeSubTab = sub.0 }) {
                            HStack(spacing: 4) {
                                Circle()
                                    .fill(activeSubTab == sub.0 ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                                    .frame(width: 5, height: 5)
                                Text(sub.1)
                                    .font(.system(size: 11, weight: activeSubTab == sub.0 ? .bold : .medium))
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 5)
                            .background(activeSubTab == sub.0 ? MedMargTheme.lightTeal : MedMargTheme.pureWhite)
                            .foregroundColor(activeSubTab == sub.0 ? MedMargTheme.primaryTeal : MedMargTheme.slate700)
                            .cornerRadius(14)
                            .overlay(
                                RoundedRectangle(cornerRadius: 14)
                                    .stroke(activeSubTab == sub.0 ? MedMargTheme.primaryTeal.opacity(0.4) : MedMargTheme.slate200, lineWidth: 1)
                            )
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 6)
            }
            .background(MedMargTheme.pureWhite)
            .shadow(color: Color.black.opacity(0.02), radius: 2, x: 0, y: 1)

            // Active Tab Content
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    switch activeTab {
                    case 0:
                        AdminOverviewView()
                    case 1:
                        AdminTestsView(testsList: $testsList, showAddTestSheet: $showAddTestSheet)
                    case 2:
                        AdminLabsView(labPartners: $labPartners, pendingLabRequests: $pendingLabRequests)
                    case 3:
                        hospitalsModuleSection
                    case 4:
                        pharmaciesModuleSection
                    case 5:
                        AdminFleetView(fleetAgents: $fleetAgents)
                    case 6:
                        inventoryModuleSection
                    case 7:
                        AdminUsersView(users: $users, showAddUserSheet: $showAddUserSheet)
                    default:
                        AdminOverviewView()
                    }
                }
                .padding(16)
            }
        }
        .sheet(isPresented: $showAddUserSheet) {
            addUserSheet
        }
        .sheet(isPresented: $showAddTestSheet) {
            addTestSheet
        }
    }

    // Helper Sections for Hospitals, Pharmacies & Inventory
    private var hospitalsModuleSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Partner Hospital Hubs & OPD Consoles")
                    .font(.system(size: 15, weight: .bold))
                Spacer()
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("SVIMS Super Specialty Hospital")
                    .font(.system(size: 14, weight: .bold))
                Text("Alipiri Rd, Tirupati • OPD Token Desk Active")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(MedMargTheme.pureWhite)
            .cornerRadius(12)
        }
    }

    private var pharmaciesModuleSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Generic Chemist & Pharmacy Outlets")
                    .font(.system(size: 15, weight: .bold))
                Spacer()
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("MedMarg Generic Chemist Hub")
                    .font(.system(size: 14, weight: .bold))
                Text("Air Bypass Rd, Tirupati • Prescription Fulfillment Active")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(MedMargTheme.pureWhite)
            .cornerRadius(12)
        }
    }

    private var inventoryModuleSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Medical Inventory & Phlebotomist Supplies")
                    .font(.system(size: 15, weight: .bold))
                Spacer()
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("BD Vacutainer EDTA K2 Tubes (Purple)")
                    .font(.system(size: 14, weight: .bold))
                Text("Current Qty: 1,450 Tubes • Minimum Threshold: 300")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(MedMargTheme.pureWhite)
            .cornerRadius(12)
        }
    }

    private func adminMainTabPill(index: Int, title: String, icon: String) -> some View {
        Button(action: {
            activeTab = index
            activeSubTab = 0
        }) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 12))
                Text(title)
                    .font(.system(size: 12, weight: activeTab == index ? .bold : .medium))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(activeTab == index ? MedMargTheme.primaryTeal : MedMargTheme.pureWhite)
            .foregroundColor(activeTab == index ? .white : MedMargTheme.slate700)
            .cornerRadius(20)
            .shadow(color: Color.black.opacity(0.02), radius: 3, x: 0, y: 1)
        }
    }

    private func innerSubTabsFor(mainTab: Int) -> [(Int, String)] {
        switch mainTab {
        case 0:
            return [(0, "Live Metrics"), (1, "Telemetry Feed"), (2, "Activity Logs")]
        case 1:
            return [(0, "Diagnostic Tests"), (1, "Full Body Packages"), (2, "Category Manager")]
        case 2:
            return [(0, "Active Accredited Labs"), (1, "Onboarding Requests"), (2, "Quality NABL")]
        case 3:
            return [(0, "Partner Hospitals"), (1, "OPD Token Desk"), (2, "Radiology Hubs")]
        case 4:
            return [(0, "Generic Chemist Stores"), (1, "Medicine Inventory"), (2, "Prescription Orders")]
        case 5:
            return [(0, "Phlebotomist Roster"), (1, "Cold-Chain Telemetry"), (2, "Agent Onboarding")]
        case 6:
            return [(0, "Stock Overview"), (1, "Agent Supplies Dispatch"), (2, "Purchase Orders")]
        case 7:
            return [(0, "All System Users"), (1, "Doctor Accounts"), (2, "Diagnostic Labs"), (3, "Phlebotomists"), (4, "Patients")]
        default:
            return []
        }
    }

    // Modal Sheets
    private var addUserSheet: some View {
        VStack(spacing: 16) {
            HStack {
                Text("Create New System User")
                    .font(.system(size: 18, weight: .bold))
                Spacer()
                Button("Cancel") { showAddUserSheet = false }
            }
            .padding(20)

            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    TextField("Full Name", text: $newName)
                    TextField("Username", text: $newUsername)
                        .autocapitalization(.none)
                    TextField("Email Address", text: $newEmail)
                        .autocapitalization(.none)
                    TextField("Phone Number", text: $newPhone)
                    TextField("Organization / Address", text: $newOrganization)

                    Picker("User Role", selection: $newRole) {
                        ForEach(UserRole.allCases) { role in
                            Text(role.displayName).tag(role)
                        }
                    }
                    .pickerStyle(.menu)

                    Button(action: saveNewUser) {
                        Text("Save & Grant Access")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(MedMargTheme.primaryTeal)
                            .cornerRadius(10)
                    }
                    .padding(.top, 12)
                }
                .padding(.horizontal, 20)
            }
        }
    }

    private var addTestSheet: some View {
        VStack(spacing: 16) {
            HStack {
                Text("Add Diagnostic Test to Catalog")
                    .font(.system(size: 18, weight: .bold))
                Spacer()
                Button("Cancel") { showAddTestSheet = false }
            }
            .padding(20)

            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    TextField("Test Name", text: $newTestName)
                    TextField("Thyrocare Negotiated Price (₹)", text: $newTestThyrocarePrice)
                    TextField("Apollo Diagnostics Price (₹)", text: $newTestApolloPrice)
                    TextField("Dr. Lal PathLabs Price (₹)", text: $newTestLalPrice)
                    TextField("Original MRP (₹)", text: $newTestMRP)
                    TextField("Parameters Count", text: $newTestParams)
                    TextField("Sample Type (e.g. Blood/Urine)", text: $newTestSample)
                    TextField("Description", text: $newTestDescription)

                    Button(action: saveNewTest) {
                        Text("Save Test to Catalog")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(MedMargTheme.primaryTeal)
                            .cornerRadius(10)
                    }
                    .padding(.top, 12)
                }
                .padding(.horizontal, 20)
            }
        }
    }

    private func saveNewUser() {
        guard !newName.isEmpty, !newUsername.isEmpty else { return }
        let user = UserProfile(
            id: UUID().uuidString,
            name: newName,
            username: newUsername,
            email: newEmail.isEmpty ? "\(newUsername)@medmarg.com" : newEmail,
            phone: newPhone.isEmpty ? "+91 98765 00000" : newPhone,
            password: "password123",
            role: newRole,
            organization: newOrganization.isEmpty ? "Tirupati Hub" : newOrganization,
            status: "Active",
            createdAt: "31-Aug-2026"
        )
        users.append(user)
        showAddUserSheet = false
        newName = ""
        newUsername = ""
        newEmail = ""
        newPhone = ""
        newOrganization = ""
    }

    private func saveNewTest() {
        guard !newTestName.isEmpty else { return }
        let test = LabTestItem(
            id: UUID().uuidString,
            name: newTestName,
            category: newTestCategory,
            params: Int(newTestParams) ?? 1,
            sampleType: newTestSample,
            description: newTestDescription.isEmpty ? "Diagnostic test panel." : newTestDescription,
            mrp: Int(newTestMRP) ?? 1000,
            thyrocarePrice: Int(newTestThyrocarePrice) ?? 499,
            apolloPrice: Int(newTestApolloPrice) ?? 750,
            lalPrice: Int(newTestLalPrice) ?? 800,
            tat: "12 hrs",
            fasting: "No Fasting Required",
            bestseller: false,
            yellowTag: newTestTag
        )
        testsList.append(test)
        showAddTestSheet = false
        newTestName = ""
        newTestThyrocarePrice = ""
        newTestApolloPrice = ""
        newTestMRP = ""
    }
}
