import SwiftUI

struct ContentView: View {
    // Universal User Accounts State (Managed & Editable by Super Admin)
    @State private var users: [UserProfile] = [
        UserProfile(
            id: "usr_admin",
            name: "MedMarg Super Admin",
            username: "admin",
            email: "admin@medmarg.com",
            phone: "+91 98765 00000",
            password: "password123",
            role: .admin,
            organization: "MedMarg Central Hub & Governance",
            status: "Active",
            createdAt: "30-Aug-2026"
        ),
        UserProfile(
            id: "usr_doc",
            name: "Dr. Ananya Sharma, MD",
            username: "doctor",
            email: "doctor@medmarg.com",
            phone: "+91 98765 11111",
            password: "password123",
            role: .doctor,
            organization: "MedMarg Care Clinic, Air Bypass Road, Tirupati",
            status: "Active",
            createdAt: "30-Aug-2026"
        ),
        UserProfile(
            id: "usr_pat",
            name: "Rahul Sharma",
            username: "patient",
            email: "patient@medmarg.com",
            phone: "+91 98765 43210",
            password: "password123",
            role: .patient,
            organization: "Air Bypass Road, Tirupati - 517501",
            status: "Active",
            createdAt: "30-Aug-2026"
        ),
        UserProfile(
            id: "usr_lab",
            name: "Thyrocare & Dr. Lal Hub",
            username: "lab",
            email: "lab@medmarg.com",
            phone: "+91 98765 22222",
            password: "password123",
            role: .diagnosticLab,
            organization: "NABL Processing Lab, Renigunta Rd, Tirupati",
            status: "Active",
            createdAt: "30-Aug-2026"
        ),
        UserProfile(
            id: "usr_scan",
            name: "Aarthi Scans & Radiology",
            username: "scans",
            email: "scans@medmarg.com",
            phone: "+91 98765 33333",
            password: "password123",
            role: .scanCenter,
            organization: "Siemens 3.0T MRI Center, Tirupati",
            status: "Active",
            createdAt: "30-Aug-2026"
        ),
        UserProfile(
            id: "usr_pharma",
            name: "MedPlus Generic Chemist",
            username: "pharmacy",
            email: "pharmacy@medmarg.com",
            phone: "+91 98765 44444",
            password: "password123",
            role: .pharmacy,
            organization: "Generic Pharmacy Hub, Tirupati",
            status: "Active",
            createdAt: "30-Aug-2026"
        ),
        UserProfile(
            id: "usr_agent",
            name: "Ramesh Kumar (Phlebo AG-01)",
            username: "agent",
            email: "agent@medmarg.com",
            phone: "+91 98765 55555",
            password: "password123",
            role: .collectionAgent,
            organization: "Tirupati Field Collection Fleet",
            status: "Active",
            createdAt: "30-Aug-2026"
        )
    ]

    // Login Form State
    @State private var usernameInput: String = ""
    @State private var passwordInput: String = ""
    @State private var errorMessage: String = ""
    @State private var isPasswordVisible: Bool = false
    @State private var loggedInUser: UserProfile? = nil
    @State private var currentCity: String = "Tirupati, Andhra Pradesh"

    var body: some View {
        if let user = loggedInUser {
            Group {
                switch user.role {
                case .patient:
                    PatientHomeView(user: user, currentCity: currentCity, onLogout: { loggedInUser = nil })
                case .doctor:
                    DoctorHomeView(user: user, onLogout: { loggedInUser = nil })
                case .admin:
                    SuperAdminHomeView(user: user, users: $users, onLogout: { loggedInUser = nil })
                case .diagnosticLab:
                    LabHomeView(user: user, onLogout: { loggedInUser = nil })
                case .scanCenter:
                    ScanCenterHomeView(user: user, onLogout: { loggedInUser = nil })
                case .pharmacy:
                    PharmacyHomeView(user: user, onLogout: { loggedInUser = nil })
                case .collectionAgent:
                    AgentHomeView(user: user, onLogout: { loggedInUser = nil })
                }
            }
        } else {
            NavigationStack {
                ScrollView {
                    VStack(spacing: 24) {
                        // Header & Brand Logo
                        VStack(spacing: 10) {
                            HStack(spacing: 10) {
                                Text("M")
                                    .font(.system(size: 32, weight: .black))
                                    .foregroundColor(.white)
                                    .frame(width: 58, height: 58)
                                    .background(
                                        LinearGradient(
                                            colors: [Color(red: 0.0, green: 0.42, blue: 0.44), Color(red: 0.0, green: 0.3, blue: 0.32)],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .clipShape(RoundedRectangle(cornerRadius: 16))
                                    .shadow(color: Color(red: 0.0, green: 0.42, blue: 0.44).opacity(0.3), radius: 8, x: 0, y: 4)

                                Text("MedMarg")
                                    .font(.system(size: 36, weight: .heavy))
                                    .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                            }

                            Text("Multi-Lab Diagnostics & Open Healthcare Platform")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.top, 30)

                        // Serving Location Pill
                        HStack(spacing: 6) {
                            Image(systemName: "mappin.and.ellipse")
                                .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                            Text(currentCity)
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color(red: 0.0, green: 0.42, blue: 0.44).opacity(0.08))
                        .clipShape(Capsule())

                        // ================= COMMON UNIVERSAL LOGIN CARD =================
                        VStack(alignment: .leading, spacing: 16) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Universal Sign-In")
                                    .font(.title3)
                                    .fontWeight(.bold)
                                    .foregroundColor(.primary)

                                Text("Enter your credentials. MedMarg automatically detects your role & launches your personalized dashboard.")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }

                            if !errorMessage.isEmpty {
                                HStack {
                                    Image(systemName: "exclamationmark.triangle.fill")
                                        .foregroundColor(.red)
                                    Text(errorMessage)
                                        .font(.caption)
                                        .foregroundColor(.red)
                                        .fontWeight(.semibold)
                                }
                                .padding(10)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.red.opacity(0.1))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                            }

                            // Username / Phone / Email Input
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Username, Email or Phone")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(.secondary)

                                HStack {
                                    Image(systemName: "person.fill")
                                        .foregroundColor(.secondary)
                                    TextField("e.g. admin, doctor, patient, 9876543210", text: $usernameInput)
                                        .autocapitalization(.none)
                                        .disableAutocorrection(true)
                                }
                                .padding(12)
                                .background(Color(.systemGray6))
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                            }

                            // Password Input
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Password")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(.secondary)

                                HStack {
                                    Image(systemName: "lock.fill")
                                        .foregroundColor(.secondary)
                                    if isPasswordVisible {
                                        TextField("Enter password", text: $passwordInput)
                                            .autocapitalization(.none)
                                    } else {
                                        SecureField("Enter password", text: $passwordInput)
                                    }
                                    Button(action: { isPasswordVisible.toggle() }) {
                                        Image(systemName: isPasswordVisible ? "eye.slash.fill" : "eye.fill")
                                            .foregroundColor(.secondary)
                                    }
                                }
                                .padding(12)
                                .background(Color(.systemGray6))
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                            }

                            // Login Button with Smart Role Detection
                            Button(action: performLogin) {
                                HStack {
                                    Text("Sign In to MedMarg")
                                        .fontWeight(.bold)
                                    Image(systemName: "arrow.right")
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(Color(red: 0.0, green: 0.42, blue: 0.44))
                                .foregroundColor(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                                .shadow(color: Color(red: 0.0, green: 0.42, blue: 0.44).opacity(0.3), radius: 5, y: 3)
                            }
                        }
                        .padding(20)
                        .background(Color(.systemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                        .shadow(color: .black.opacity(0.06), radius: 15, x: 0, y: 6)
                        .padding(.horizontal)

                        // ================= 1-TAP DEMO ACCOUNTS (ALL CATEGORIES) =================
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("DEMO CREDENTIALS (1-TAP AUTO-FILL & LOGIN)")
                                    .font(.caption2)
                                    .fontWeight(.heavy)
                                    .foregroundColor(.secondary)
                                Spacer()
                                Text("Pass: password123")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }

                            ForEach(users) { user in
                                Button(action: {
                                    usernameInput = user.username
                                    passwordInput = user.password
                                    loggedInUser = user
                                }) {
                                    HStack(spacing: 12) {
                                        Image(systemName: user.role.iconName)
                                            .font(.title3)
                                            .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                                            .frame(width: 38, height: 38)
                                            .background(Color(red: 0.0, green: 0.42, blue: 0.44).opacity(0.1))
                                            .clipShape(Circle())

                                        VStack(alignment: .leading, spacing: 2) {
                                            HStack {
                                                Text(user.role.displayName)
                                                    .font(.subheadline)
                                                    .fontWeight(.bold)
                                                    .foregroundColor(.primary)
                                                Spacer()
                                                Text("User: \(user.username)")
                                                    .font(.caption2)
                                                    .fontWeight(.bold)
                                                    .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                                                    .padding(.horizontal, 6)
                                                    .padding(.vertical, 2)
                                                    .background(Color(red: 0.0, green: 0.42, blue: 0.44).opacity(0.08))
                                                    .clipShape(Capsule())
                                            }
                                            Text("\(user.name) • \(user.organization)")
                                                .font(.caption)
                                                .foregroundColor(.secondary)
                                                .lineLimit(1)
                                        }

                                        Image(systemName: "chevron.right")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                    .padding(14)
                                    .background(Color(.systemBackground))
                                    .clipShape(RoundedRectangle(cornerRadius: 14))
                                    .shadow(color: .black.opacity(0.03), radius: 4)
                                }
                            }
                        }
                        .padding(.horizontal)
                        .padding(.bottom, 30)
                    }
                }
                .background(Color(.systemGroupedBackground))
            }
        }
    }

    // Smart Authentication Logic
    private func performLogin() {
        errorMessage = ""
        let query = usernameInput.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let pass = passwordInput.trimmingCharacters(in: .whitespacesAndNewlines)

        guard !query.isEmpty else {
            errorMessage = "Please enter username, email, or mobile number."
            return
        }
        guard !pass.isEmpty else {
            errorMessage = "Please enter your password."
            return
        }

        // Match user by username, email, or phone
        if let match = users.first(where: {
            $0.username.lowercased() == query ||
            $0.email.lowercased() == query ||
            $0.phone.replacingOccurrences(of: " ", with: "").contains(query)
        }) {
            if match.password == pass {
                if match.status == "Suspended" {
                    errorMessage = "Account is suspended. Please contact Super Admin."
                } else {
                    loggedInUser = match
                }
            } else {
                errorMessage = "Incorrect password for \(match.name). Try 'password123'."
            }
        } else {
            errorMessage = "User not found. Use demo users (admin, doctor, patient, lab, scans, pharmacy, agent)."
        }
    }
}

// =========================================================================
// 1. PATIENT HOME VIEW
// =========================================================================
struct PatientHomeView: View {
    let user: UserProfile
    let currentCity: String
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("Serving Location") {
                    HStack {
                        Image(systemName: "mappin.circle.fill")
                            .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                        Text(currentCity)
                            .fontWeight(.bold)
                        Spacer()
                        Text("60-Min Home Sample Collection")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                }

                Section("Thyrocare Diagnostic Pathology") {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text("Aarogyam Complete 1.3")
                                .fontWeight(.bold)
                            Spacer()
                            Text("₹1,499")
                                .fontWeight(.heavy)
                                .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                        }
                        Text("104 Parameters • Liver, Kidney, Lipid, Thyroid, Vitamins & CBC")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("Free Home Sample Collection in Tirupati")
                            .font(.caption2)
                            .foregroundColor(.green)
                    }
                    .padding(.vertical, 4)

                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text("Thyroid Profile Total (T3/T4/TSH)")
                                .fontWeight(.bold)
                            Spacer()
                            Text("₹349")
                                .fontWeight(.heavy)
                                .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                        }
                        Text("3 Biomarkers • Free Home Visit")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 4)
                }

                Section("Prescribed by Your Doctor") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Dr. Ananya Sharma (MedMarg Care Clinic)")
                            .fontWeight(.bold)
                            .foregroundColor(Color(red: 0.39, green: 0.4, blue: 0.95))
                        Text("Prescribed: Thyroid Total + Lipid Profile")
                            .font(.caption)
                        HStack {
                            Text("Doctor Custom Price: ₹1,000")
                                .font(.caption)
                                .fontWeight(.bold)
                            Spacer()
                            Text("Phlebo Dispatched")
                                .font(.caption2)
                                .foregroundColor(.orange)
                        }
                    }
                }

                Section("3.0T Silent MRI Scans") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("MRI Brain (Siemens 3.0T Silent MRI)")
                            .fontWeight(.bold)
                        Text("Aarthi Scans & Labs, Tirupati • Slot: Today 5:00 PM • ₹3,499")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Section("In-Clinic Doctors") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Dr. Ananya Sharma (MD Diabetology)")
                            .fontWeight(.bold)
                        Text("MedMarg Care Clinic, Air Bypass Road • Token #4 • ₹499")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Section("Generic Pharmacy (70% Cost-Saver)") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Saroglitazar 4mg (Generic Equivalent)")
                            .fontWeight(.bold)
                        Text("Brand MRP: ₹290 ➔ Generic Price: ₹135 (Save 53%)")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                }

                Section("Digital Health Records (Google Drive Sync)") {
                    Link(destination: URL(string: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view")!) {
                        HStack {
                            Image(systemName: "folder.badge.gearshape")
                                .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                            Text("Open Reports Archive in Google Drive")
                            Spacer()
                            Image(systemName: "arrow.up.right.square")
                        }
                    }
                }
            }
            .navigationTitle("Patient Portal (\(user.name))")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Logout", action: onLogout)
                }
            }
        }
    }
}

// =========================================================================
// 2. DOCTOR HOME VIEW
// =========================================================================
struct DoctorHomeView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("My Patients Directory (Tirupati)") {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text("Rahul Sharma (34y, M)")
                                .fontWeight(.bold)
                            Spacer()
                            Text("App Access Active")
                                .font(.caption2)
                                .foregroundColor(.green)
                        }
                        Text("📞 +91 98765 43210 • Plot 42, Air Bypass Rd, Tirupati")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text("K. Srinivasa Rao (58y, M)")
                                .fontWeight(.bold)
                            Spacer()
                            Text("App Access Active")
                                .font(.caption2)
                                .foregroundColor(.green)
                        }
                        Text("📞 +91 98765 88990 • SVIMS Staff Quarters, Tirupati")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Section("Prescribe Tests with Custom Patient Price") {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Patient: Rahul Sharma")
                            .fontWeight(.bold)
                        Text("Thyroid Total (Lab Cost: ₹349 | Your Price: ₹450)")
                            .font(.caption)
                        Text("Lipid Profile (Lab Cost: ₹449 | Your Price: ₹550)")
                            .font(.caption)
                        HStack {
                            Text("You Pay Lab: ₹798")
                                .fontWeight(.bold)
                                .foregroundColor(.orange)
                            Spacer()
                            Text("Patient Price: ₹1,000")
                                .fontWeight(.heavy)
                                .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                        }
                    }
                }

                Section("In-Clinic OPD Tokens (MedMarg Care Clinic)") {
                    HStack {
                        Text("Token #1: Rahul Sharma")
                            .fontWeight(.bold)
                        Spacer()
                        Text("In Consultation")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                    HStack {
                        Text("Token #2: K. Srinivasa Rao")
                            .fontWeight(.bold)
                        Spacer()
                        Text("Waiting")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Section("Doctor Clinic Earnings") {
                    HStack {
                        Text("Total Weekly Payouts:")
                        Spacer()
                        Text("₹39,350")
                            .fontWeight(.heavy)
                            .foregroundColor(.green)
                    }
                }
            }
            .navigationTitle("Doctor Workdesk")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Logout", action: onLogout)
                }
            }
        }
    }
}

// =========================================================================
// 3. SUPER ADMIN HOME VIEW (WITH FULL USER MANAGEMENT)
// =========================================================================
struct SuperAdminHomeView: View {
    let user: UserProfile
    @Binding var users: [UserProfile]
    let onLogout: () -> Void

    @State private var showAddUserSheet: Bool = false
    @State private var editingUser: UserProfile? = nil

    // New User Sheet Form State
    @State private var newName: String = ""
    @State private var newUsername: String = ""
    @State private var newEmail: String = ""
    @State private var newPhone: String = ""
    @State private var newPassword: String = "password123"
    @State private var newRole: UserRole = .patient
    @State private var newOrg: String = ""

    var body: some View {
        NavigationStack {
            List {
                // ================= USER MANAGEMENT SUITE =================
                Section(header: HStack {
                    Text("Universal Users & Access Management")
                    Spacer()
                    Button(action: { showAddUserSheet = true }) {
                        HStack(spacing: 4) {
                            Image(systemName: "plus.circle.fill")
                            Text("Add User")
                        }
                        .font(.caption)
                        .fontWeight(.bold)
                    }
                }) {
                    ForEach(users) { usr in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Image(systemName: usr.role.iconName)
                                    .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(usr.name)
                                        .fontWeight(.bold)
                                    Text("\(usr.role.displayName) • User: \(usr.username)")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }

                                Spacer()

                                Text(usr.status)
                                    .font(.caption2)
                                    .fontWeight(.bold)
                                    .foregroundColor(usr.status == "Active" ? .green : .red)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background((usr.status == "Active" ? Color.green : Color.red).opacity(0.1))
                                    .clipShape(Capsule())
                            }

                            Text("Email: \(usr.email) • Phone: \(usr.phone)")
                                .font(.caption2)
                                .foregroundColor(.secondary)

                            HStack {
                                Text("Pass: \(usr.password)")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                                Spacer()
                                Button("Edit / Reset") {
                                    editingUser = usr
                                }
                                .font(.caption2)
                                .foregroundColor(.blue)

                                Button("Toggle Status") {
                                    if let idx = users.firstIndex(where: { $0.id == usr.id }) {
                                        users[idx].status = (users[idx].status == "Active") ? "Suspended" : "Active"
                                    }
                                }
                                .font(.caption2)
                                .foregroundColor(.orange)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                    .onDelete { indexSet in
                        users.remove(atOffsets: indexSet)
                    }
                }

                // ================= OTHER MODULES =================
                Section("1. Tests Catalog & Health Packages Studio") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Tests Catalog (104 Tests Active)")
                            .fontWeight(.bold)
                        Text("Aarogyam 1.3, Thyroid, Lipid, LFT, KFT, Vitamin D, HbA1c")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Health Package Bundler Studio")
                            .fontWeight(.bold)
                            .foregroundColor(Color(red: 0.96, green: 0.62, blue: 0.04))
                        Text("Aarogyam Senior Citizen: 104 Tests • ₹1,499 (57% OFF)")
                            .font(.caption)
                    }
                }

                Section("2. Doctor Prescribed Orders Queue") {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text("Dr. Ananya Sharma ➔ Rahul Sharma")
                                .fontWeight(.bold)
                            Spacer()
                            Text("PAID ₹1,000")
                                .font(.caption)
                                .foregroundColor(.green)
                        }
                        Text("Tests: Thyroid Total + Lipid Profile • Phlebo Assigned")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Section("3. Collection Agents Fleet (Tirupati Grid)") {
                    HStack {
                        Text("📍 Ramesh Kumar (AG-01)")
                        Spacer()
                        Text("Box: 4.2°C • 9 Samples")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                }

                Section("4. Medical Inventory & Consumables") {
                    HStack {
                        Text("BD Vacutainer EDTA Tubes (2ml)")
                        Spacer()
                        Text("1,450 In Stock")
                            .fontWeight(.bold)
                            .foregroundColor(.green)
                    }
                }
            }
            .navigationTitle("Super Admin Console")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Logout", action: onLogout)
                }
            }
            .sheet(isPresented: $showAddUserSheet) {
                NavigationStack {
                    Form {
                        Section("User Details") {
                            TextField("Full Name", text: $newName)
                            TextField("Username", text: $newUsername)
                                .autocapitalization(.none)
                            TextField("Email Address", text: $newEmail)
                                .autocapitalization(.none)
                            TextField("Phone Number", text: $newPhone)
                            SecureField("Password", text: $newPassword)
                        }

                        Section("Role & Workspace") {
                            Picker("User Role", selection: $newRole) {
                                ForEach(UserRole.allCases) { role in
                                    Text(role.displayName).tag(role)
                                }
                            }
                            TextField("Organization / Clinic / Address", text: $newOrg)
                        }
                    }
                    .navigationTitle("Add New System User")
                    .toolbar {
                        ToolbarItem(placement: .navigationBarLeading) {
                            Button("Cancel") { showAddUserSheet = false }
                        }
                        ToolbarItem(placement: .navigationBarTrailing) {
                            Button("Save User") {
                                let newUser = UserProfile(
                                    id: "usr_\(UUID().uuidString.prefix(6))",
                                    name: newName.isEmpty ? "New User" : newName,
                                    username: newUsername.isEmpty ? "user\(users.count + 1)" : newUsername,
                                    email: newEmail.isEmpty ? "user@medmarg.com" : newEmail,
                                    phone: newPhone.isEmpty ? "+91 98765 99999" : newPhone,
                                    password: newPassword.isEmpty ? "password123" : newPassword,
                                    role: newRole,
                                    organization: newOrg.isEmpty ? "Tirupati Hub" : newOrg,
                                    status: "Active",
                                    createdAt: "30-Aug-2026"
                                )
                                users.append(newUser)
                                showAddUserSheet = false
                                // Reset form
                                newName = ""; newUsername = ""; newEmail = ""; newPhone = ""; newOrg = ""
                            }
                            .fontWeight(.bold)
                        }
                    }
                }
            }
            .sheet(item: $editingUser) { usr in
                EditUserSheet(user: usr, onSave: { updated in
                    if let idx = users.firstIndex(where: { $0.id == updated.id }) {
                        users[idx] = updated
                    }
                    editingUser = nil
                }, onCancel: {
                    editingUser = nil
                })
            }
        }
    }
}

// Edit User Modal Sheet
struct EditUserSheet: View {
    @State var user: UserProfile
    let onSave: (UserProfile) -> Void
    let onCancel: () -> Void

    var body: some View {
        NavigationStack {
            Form {
                Section("Edit Profile") {
                    TextField("Full Name", text: $user.name)
                    TextField("Username", text: $user.username)
                        .autocapitalization(.none)
                    TextField("Email", text: $user.email)
                    TextField("Phone", text: $user.phone)
                    TextField("Password", text: $user.password)
                }

                Section("Role & Status") {
                    Picker("Role", selection: $user.role) {
                        ForEach(UserRole.allCases) { role in
                            Text(role.displayName).tag(role)
                        }
                    }
                    Picker("Account Status", selection: $user.status) {
                        Text("Active").tag("Active")
                        Text("Suspended").tag("Suspended")
                    }
                    TextField("Organization", text: $user.organization)
                }
            }
            .navigationTitle("Edit User: \(user.username)")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel", action: onCancel)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save Changes") {
                        onSave(user)
                    }
                    .fontWeight(.bold)
                }
            }
        }
    }
}

// =========================================================================
// 4. DIAGNOSTIC LAB PARTNER VIEW
// =========================================================================
struct LabHomeView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("Sample Processing Queue") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Rahul Sharma - Aarogyam Complete 1.3")
                            .fontWeight(.bold)
                        Text("Collector: Ramesh Kumar • Barcode: MED-BC-9921")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("Status: Sample Processing in Lab")
                            .font(.caption)
                            .foregroundColor(.blue)
                    }
                }
            }
            .navigationTitle("Lab Partner Desk")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Logout", action: onLogout)
                }
            }
        }
    }
}

// =========================================================================
// 5. RADIOLOGY & SCAN CENTER VIEW
// =========================================================================
struct ScanCenterHomeView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("Today's Scan Machine Schedule") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Karan Mehra - MRI Brain (Plain + Angio)")
                            .fontWeight(.bold)
                        Text("Siemens 3.0T Silent MRI • Slot: 5:00 PM")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("Metal Checklist: Cleared • Fasting: Verified")
                            .font(.caption2)
                            .foregroundColor(.green)
                    }
                }
            }
            .navigationTitle("3.0T Radiology Hub")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Logout", action: onLogout)
                }
            }
        }
    }
}

// =========================================================================
// 6. GENERIC PHARMACY VIEW
// =========================================================================
struct PharmacyHomeView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("Prescription Queue & Generic Substitutions") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Anil Gupta - Lipaglyn 4mg")
                            .fontWeight(.bold)
                        Text("Substituted: Saroglitazar 4mg (MedMarg Generic)")
                            .font(.caption)
                            .foregroundColor(.green)
                        Text("Savings: 53% • Dispatched for Home Delivery in Tirupati")
                            .font(.caption2)
                    }
                }
            }
            .navigationTitle("Generic Chemist")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Logout", action: onLogout)
                }
            }
        }
    }
}

// =========================================================================
// 7. COLLECTION AGENT / FLEET VIEW
// =========================================================================
struct AgentHomeView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("Field Sample Collection Orders (Tirupati)") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Stop #1: Rahul Sharma (Air Bypass Rd)")
                            .fontWeight(.bold)
                        Text("Tests: Thyroid Total + Lipid Profile • Fasting: 12h")
                            .font(.caption)
                        Text("Box Temperature: 4.2°C (Compliant)")
                            .font(.caption2)
                            .foregroundColor(.green)
                    }
                }
            }
            .navigationTitle("Fleet Agent Desk")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Logout", action: onLogout)
                }
            }
        }
    }
}
