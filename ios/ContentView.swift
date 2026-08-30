import SwiftUI

struct ContentView: View {
    @State private var identifier: String = ""
    @State private var loggedInUser: UserProfile? = nil
    @State private var currentCity: String = "Tirupati, Andhra Pradesh"

    let demoAccounts: [UserProfile] = [
        UserProfile(id: "1", name: "Rahul Sharma", identifier: "+91 98765 43210", role: .patient, organization: "Tirupati (Air Bypass Rd)"),
        UserProfile(id: "2", name: "Dr. Ananya Sharma", identifier: "doctor@medmarg.com", role: .doctor, organization: "MedMarg Care Clinic, Tirupati"),
        UserProfile(id: "3", name: "Super Admin (Central Lab)", identifier: "admin@medmarg.com", role: .admin, organization: "Central Lab & Platform Governance"),
        UserProfile(id: "4", name: "Dr. Lal PathLabs Hub", identifier: "lab@medmarg.com", role: .diagnosticLab, organization: "NABL Processing Hub, Tirupati"),
        UserProfile(id: "5", name: "Aarthi Scans & Labs", identifier: "scans@medmarg.com", role: .scanCenter, organization: "Siemens 3.0T MRI Center"),
        UserProfile(id: "6", name: "MedPlus Generic Chemist", identifier: "pharmacy@medmarg.com", role: .pharmacy, organization: "Generic Pharmacy Partner")
    ]

    var body: some View {
        if let user = loggedInUser {
            Group {
                switch user.role {
                case .patient:
                    PatientHomeView(user: user, currentCity: currentCity, onLogout: { loggedInUser = nil })
                case .doctor:
                    DoctorHomeView(user: user, onLogout: { loggedInUser = nil })
                case .admin:
                    SuperAdminHomeView(user: user, onLogout: { loggedInUser = nil })
                case .diagnosticLab:
                    LabHomeView(user: user, onLogout: { loggedInUser = nil })
                case .scanCenter:
                    ScanCenterHomeView(user: user, onLogout: { loggedInUser = nil })
                case .pharmacy:
                    PharmacyHomeView(user: user, onLogout: { loggedInUser = nil })
                }
            }
        } else {
            NavigationStack {
                ScrollView {
                    VStack(spacing: 20) {
                        // Brand Logo
                        VStack(spacing: 8) {
                            HStack(spacing: 8) {
                                Text("M")
                                    .font(.system(size: 28, weight: .black))
                                    .foregroundColor(.white)
                                    .frame(width: 52, height: 52)
                                    .background(Color(red: 0.0, green: 0.42, blue: 0.44))
                                    .clipShape(RoundedRectangle(cornerRadius: 14))

                                Text("MedMarg")
                                    .font(.system(size: 32, weight: .heavy))
                                    .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                            }

                            Text("Multi-Lab Diagnostics & Open Healthcare Platform")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.top, 30)

                        // Location Badge
                        HStack {
                            Image(systemName: "mappin.and.ellipse")
                                .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                            Text(currentCity)
                                .font(.subheadline)
                                .fontWeight(.bold)
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 6)
                        .background(Color(red: 0.0, green: 0.42, blue: 0.44).opacity(0.1))
                        .clipShape(Capsule())

                        // Universal Login Card
                        VStack(alignment: .leading, spacing: 14) {
                            Text("Universal Sign-In")
                                .font(.headline)
                                .fontWeight(.bold)

                            Text("Enter your mobile number or email. The system automatically routes to your workspace.")
                                .font(.caption)
                                .foregroundColor(.secondary)

                            TextField("Phone or Email", text: $identifier)
                                .textFieldStyle(.roundedBorder)
                                .padding(.vertical, 4)

                            Button(action: {
                                if let match = demoAccounts.first(where: { $0.identifier == identifier }) {
                                    loggedInUser = match
                                } else {
                                    loggedInUser = demoAccounts[0]
                                }
                            }) {
                                HStack {
                                    Text("Sign In with Secure OTP")
                                        .fontWeight(.bold)
                                    Image(systemName: "arrow.right")
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color(red: 0.0, green: 0.42, blue: 0.44))
                                .foregroundColor(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                        }
                        .padding()
                        .background(Color(.systemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .shadow(color: .black.opacity(0.06), radius: 10, x: 0, y: 4)
                        .padding(.horizontal)

                        // Role Previews
                        VStack(alignment: .leading, spacing: 10) {
                            Text("INSTANT ROLE WORKSPACES")
                                .font(.caption2)
                                .fontWeight(.bold)
                                .foregroundColor(.secondary)

                            ForEach(demoAccounts) { account in
                                Button(action: { loggedInUser = account }) {
                                    HStack {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(account.role.displayName)
                                                .font(.subheadline)
                                                .fontWeight(.bold)
                                                .foregroundColor(.primary)
                                            Text(account.organization)
                                                .font(.caption)
                                                .foregroundColor(.secondary)
                                        }
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .foregroundColor(.secondary)
                                    }
                                    .padding()
                                    .background(Color(.systemBackground))
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                    .shadow(color: .black.opacity(0.03), radius: 4)
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                .background(Color(.systemGroupedBackground))
            }
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
                Section("Primary Service Location") {
                    HStack {
                        Image(systemName: "mappin.circle.fill")
                            .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                        Text(currentCity)
                            .fontWeight(.bold)
                        Spacer()
                        Text("60-Min Collection")
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
            .navigationTitle("MedMarg Patient")
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
// 3. SUPER ADMIN HOME VIEW
// =========================================================================
struct SuperAdminHomeView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
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

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Test Categories Manager (11 Categories)")
                            .fontWeight(.bold)
                        Text("Editable: Thyroid, Cardiac, Liver, Kidney, Vitamins, Diabetes")
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

                Section("3. Partner Diagnostic Labs") {
                    Text("• Thyrocare Central Lab (NABL-CC-4921) - 15% Margin")
                        .font(.caption)
                    Text("• Apollo Diagnostics Tirupati (NABL-AP-8921) - 18% Margin")
                        .font(.caption)
                    Text("• Dr. Lal PathLabs Hub (NABL-AP-3104) - 15% Margin")
                        .font(.caption)
                }

                Section("4. Collection Agents Fleet (Tirupati Grid)") {
                    HStack {
                        Text("📍 Ramesh Kumar (AG-01)")
                        Spacer()
                        Text("Box: 4.2°C • 9 Samples")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                    HStack {
                        Text("📍 Suresh Babu (AG-02)")
                        Spacer()
                        Text("Box: 3.8°C • 7 Samples")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                    HStack {
                        Text("📍 Venkat Reddy (AG-03)")
                        Spacer()
                        Text("Box: 4.5°C • 8 Samples")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                }

                Section("5. Medical Inventory & Consumables") {
                    HStack {
                        Text("BD Vacutainer EDTA Tubes (2ml)")
                        Spacer()
                        Text("1,450 In Stock")
                            .fontWeight(.bold)
                            .foregroundColor(.green)
                    }
                    HStack {
                        Text("SST Gel Tubes (Yellow Top)")
                        Spacer()
                        Text("1,800 In Stock")
                            .fontWeight(.bold)
                            .foregroundColor(.green)
                    }
                    HStack {
                        Text("Nitrile Gloves Powder-Free (M)")
                        Spacer()
                        Text("240 Boxes")
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
