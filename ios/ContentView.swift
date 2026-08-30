import SwiftUI

struct ContentView: View {
    @State private var identifier: String = ""
    @State private var otp: String = ""
    @State private var isOtpSent: Bool = false
    @State private var loggedInUser: UserProfile? = nil

    let demoAccounts: [UserProfile] = [
        UserProfile(id: "1", name: "Rahul Sharma", identifier: "+91 98765 43210", role: .patient, organization: "Bangalore"),
        UserProfile(id: "2", name: "Dr. Lal PathLabs", identifier: "lab@medmarg.com", role: .diagnosticLab, organization: "NABL Accredited"),
        UserProfile(id: "3", name: "Aarthi Scans", identifier: "scans@medmarg.com", role: .scanCenter, organization: "3.0T MRI"),
        UserProfile(id: "4", name: "Dr. Ananya Sharma", identifier: "doctor@medmarg.com", role: .doctor, organization: "OPD Clinic"),
        UserProfile(id: "5", name: "MedPlus Chemist", identifier: "pharmacy@medmarg.com", role: .pharmacy, organization: "Generic Partner"),
        UserProfile(id: "6", name: "Super Admin", identifier: "admin@medmarg.com", role: .admin, organization: "Platform Governance")
    ]

    var body: some View {
        if let user = loggedInUser {
            Group {
                switch user.role {
                case .patient:
                    PatientHomeView(user: user, onLogout: { loggedInUser = nil })
                case .diagnosticLab:
                    LabHomeView(user: user, onLogout: { loggedInUser = nil })
                case .doctor:
                    DoctorHomeView(user: user, onLogout: { loggedInUser = nil })
                default:
                    PatientHomeView(user: user, onLogout: { loggedInUser = nil })
                }
            }
        } else {
            NavigationStack {
                ScrollView {
                    VStack(spacing: 20) {
                        // Logo
                        VStack(spacing: 8) {
                            Text("M")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.white)
                                .frame(width: 60, height: 60)
                                .background(Color(red: 0.0, green: 0.42, blue: 0.44))
                                .clipShape(RoundedRectangle(cornerRadius: 14))

                            Text("MedMarg")
                                .font(.title)
                                .fontWeight(.heavy)
                                .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))

                            Text("Multi-Lab Diagnostic & Healthcare Platform")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        .padding(.top, 40)

                        // Login Card
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Universal Sign-In")
                                .font(.headline)
                                .fontWeight(.bold)

                            Text("Enter your phone, email, or ABHA ID. The system automatically detects your user role.")
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
                                    Text("Continue with OTP")
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
                        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
                        .padding(.horizontal)

                        // Instant Role Previews
                        VStack(alignment: .leading, spacing: 12) {
                            Text("INSTANT ROLE PREVIEWS")
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

struct PatientHomeView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("Compare Pathology Labs") {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text("Lipid Profile (8 Parameters)")
                                .fontWeight(.bold)
                            Spacer()
                            Text("₹499")
                                .fontWeight(.heavy)
                                .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                        }
                        Text("Apollo Diagnostics • NABL Accredited • TAT 6h")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("Free Home Sample Collection Available")
                            .font(.caption2)
                            .foregroundColor(.green)
                    }
                    .padding(.vertical, 4)
                }

                Section("Radiology & Scans") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("MRI Brain (Siemens 3.0T Silent MRI)")
                            .fontWeight(.bold)
                        Text("Aarthi Scans & Labs • Slot: Today 5:00 PM")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Section("In-Clinic Doctor Appointment (No Video Call)") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Dr. Ananya Sharma (Diabetologist)")
                            .fontWeight(.bold)
                        Text("MedMarg Care Clinic, Indiranagar • Fee: ₹499")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Section("Google Drive Diagnostic Reports") {
                    Link(destination: URL(string: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view")!) {
                        HStack {
                            Image(systemName: "doc.text.fill")
                                .foregroundColor(Color(red: 0.0, green: 0.42, blue: 0.44))
                            Text("Open Lipid Report in Google Drive")
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

struct LabHomeView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("Sample Collection Orders") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Siddharth V. - Lipid Profile")
                            .fontWeight(.bold)
                        Text("Home Collection • Phlebotomist: Suresh Kumar")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("Status: Sample Analyzing")
                            .font(.caption)
                            .foregroundColor(.blue)
                    }
                }
            }
            .navigationTitle("Lab Partner Console")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Logout", action: onLogout)
                }
            }
        }
    }
}

struct DoctorHomeView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("Today's In-Clinic Appointments (OPD)") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Kavita Menon (42 / F)")
                            .fontWeight(.bold)
                        Text("Reason: Type-2 Diabetes Review • Slot: 04:30 PM")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("Status: Waiting in Clinic Lobby")
                            .font(.caption)
                            .foregroundColor(.orange)
                    }
                }
            }
            .navigationTitle("Doctor Clinic Studio")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Logout", action: onLogout)
                }
            }
        }
    }
}
