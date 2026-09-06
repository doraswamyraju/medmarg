import SwiftUI

struct AdminConsoleView: View {
    @Binding var users: [UserProfile]
    let onLogout: () -> Void

    @Binding var activeTab: Int // 0: Overview, 1: Tests & Catalog, 2: Partner Labs, 3: Hospitals, 4: Pharmacies, 5: Fleet & Cold-Chain, 6: Inventory, 7: Users & Access
    @Binding var activeSubTab: Int

    @ObservedObject var catalogStore: CatalogStore = CatalogStore.shared

    // Dynamic State for Labs & Fleet
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

    // New Test/Profile Form State
    @State private var newItemType: String = "TEST" // "TEST" | "PROFILE"
    @State private var newTestCode: String = ""
    @State private var newTestName: String = ""
    @State private var newTestSample: String = "SERUM"
    @State private var newTestFasting: String = "NO"
    @State private var newTestPrice: String = "299"
    @State private var newTestMRP: String = "499"
    @State private var newTestTAT: String = "24"
    @State private var newTestDescription: String = ""

    var body: some View {
        VStack(spacing: 0) {

            // Main Module Tab Pills (Row 1)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    adminMainTabPill(index: 0, title: "Overview", icon: "chart.bar.fill")
                    adminMainTabPill(index: 1, title: "Catalog (\(catalogStore.allItems.count))", icon: "flask.fill")
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
                        AdminTestsView(catalogStore: catalogStore, showAddTestSheet: $showAddTestSheet)
                    case 2:
                        AdminLabsView(labPartners: $labPartners, pendingLabRequests: $pendingLabRequests)
                    case 3:
                        AdminHospitalsView()
                    case 4:
                        AdminPharmaciesView()
                    case 5:
                        AdminFleetView(fleetAgents: $fleetAgents)
                    case 6:
                        AdminInventoryView()
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
            return [(0, "Unified Master Catalog"), (1, "Diagnostic Profiles"), (2, "Health Packages")]
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
                Text("Add Master Diagnostic Item")
                    .font(.system(size: 18, weight: .bold))
                Spacer()
                Button("Cancel") { showAddTestSheet = false }
            }
            .padding(20)

            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    Picker("Item Type", selection: $newItemType) {
                        Text("Individual Test").tag("TEST")
                        Text("Diagnostic Profile").tag("PROFILE")
                    }
                    .pickerStyle(.segmented)

                    TextField("Test/Profile Code (e.g. CBC, LP, ALDRR)", text: $newTestCode)
                        .autocapitalization(.allCharacters)
                    TextField("Full Item Name", text: $newTestName)
                    TextField("Sample Tube (e.g. SERUM, EDTA, URINE)", text: $newTestSample)
                    
                    Picker("Fasting Required?", selection: $newTestFasting) {
                        Text("NO Fasting Required").tag("NO")
                        Text("YES Fasting Required (8-10h)").tag("YES")
                    }
                    .pickerStyle(.segmented)

                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Discounted Price (₹)")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(MedMargTheme.slate500)
                            TextField("Price", text: $newTestPrice)
                                .keyboardType(.numberPad)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Standard MRP (₹)")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(MedMargTheme.slate500)
                            TextField("MRP", text: $newTestMRP)
                                .keyboardType(.numberPad)
                        }
                    }

                    TextField("Turnaround Time in Hours (e.g. 24)", text: $newTestTAT)
                        .keyboardType(.numberPad)
                    TextField("Description", text: $newTestDescription)

                    Button(action: saveNewTest) {
                        Text("Save to Master Catalog")
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
        guard !newTestName.isEmpty, !newTestCode.isEmpty else { return }

        let price = Int(newTestPrice) ?? 299
        let mrp = Int(newTestMRP) ?? 499
        let tat = Int(newTestTAT) ?? 24

        if newItemType == "PROFILE" {
            catalogStore.addProfile(
                code: newTestCode,
                name: newTestName,
                sampleType: newTestSample,
                fasting: newTestFasting,
                mrp: mrp,
                price: price,
                tatHours: tat,
                description: newTestDescription.isEmpty ? "Comprehensive diagnostic profile." : newTestDescription
            )
        } else {
            catalogStore.addTest(
                code: newTestCode,
                name: newTestName,
                sampleType: newTestSample,
                fasting: newTestFasting,
                mrp: mrp,
                price: price,
                tatHours: tat,
                description: newTestDescription.isEmpty ? "Clinical laboratory diagnostic test." : newTestDescription
            )
        }

        showAddTestSheet = false
        newTestCode = ""
        newTestName = ""
        newTestDescription = ""
        newTestPrice = "299"
        newTestMRP = "499"
    }
}
