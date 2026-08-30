import SwiftUI

struct ContentView: View {
    // ==========================================
    // 👥 UNIVERSAL REGISTERED USER ACCOUNTS
    // ==========================================
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
        Group {
            if let user = loggedInUser {
                switch user.role {
                case .patient:
                    PatientAppContainerView(user: user, currentCity: currentCity, onLogout: { loggedInUser = nil })
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
            } else {
                CleanLoginView(
                    usernameInput: $usernameInput,
                    passwordInput: $passwordInput,
                    errorMessage: $errorMessage,
                    isPasswordVisible: $isPasswordVisible,
                    currentCity: currentCity,
                    onSignIn: performLogin,
                    onOAuthSignIn: { provider in
                        // Seamless OAuth fallback into Patient account
                        loggedInUser = users.first(where: { $0.role == .patient })
                    }
                )
            }
        }
        .preferredColorScheme(.light) // Force Light Mode Everywhere
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
                errorMessage = "Incorrect password. Default for all roles is 'password123'."
            }
        } else {
            errorMessage = "User not found. Try 'patient', 'doctor', 'admin', 'lab', 'scans', 'pharmacy', or 'agent'."
        }
    }
}

// =========================================================================
// 🔐 CLEAN UNIVERSAL LOGIN VIEW (STRICT BRANDING & SOCIAL LOGINS)
// =========================================================================
struct CleanLoginView: View {
    @Binding var usernameInput: String
    @Binding var passwordInput: String
    @Binding var errorMessage: String
    @Binding var isPasswordVisible: Bool
    let currentCity: String
    let onSignIn: () -> Void
    let onOAuthSignIn: (String) -> Void

    var body: some View {
        NavigationStack {
            ZStack {
                // Background
                MedMargTheme.slate50
                    .ignoresSafeArea()

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        
                        // 1. BRAND HEADER EMBLEM
                        VStack(spacing: 12) {
                            HStack(spacing: 12) {
                                ZStack {
                                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                                        .fill(
                                            LinearGradient(
                                                colors: [MedMargTheme.primaryTeal, MedMargTheme.darkTeal],
                                                startPoint: .topLeading,
                                                endPoint: .bottomTrailing
                                            )
                                        )
                                        .frame(width: 64, height: 64)
                                        .shadow(color: MedMargTheme.primaryTeal.opacity(0.35), radius: 10, x: 0, y: 5)

                                    Text("M")
                                        .font(.system(size: 34, weight: .black, design: .rounded))
                                        .foregroundColor(.white)
                                }

                                VStack(alignment: .leading, spacing: 2) {
                                    Text("MedMarg")
                                        .font(.system(size: 36, weight: .heavy, design: .rounded))
                                        .foregroundColor(MedMargTheme.primaryTeal)

                                    Text("Health & Diagnostics")
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundColor(MedMargTheme.accentEmerald)
                                        .textCase(.uppercase)
                                        .tracking(1.2)
                                }
                            }

                            Text("Multi-Lab Diagnostic & Open Healthcare Platform")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(MedMargTheme.slate500)
                                .multilineTextAlignment(.center)

                            // Location Badge
                            HStack(spacing: 6) {
                                Image(systemName: "mappin.and.ellipse")
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                Text(currentCity)
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                            }
                            .padding(.horizontal, 14)
                            .padding(.vertical, 6)
                            .background(MedMargTheme.primaryTeal.opacity(0.08))
                            .clipShape(Capsule())
                        }
                        .padding(.top, 40)

                        // 2. SIGN IN CREDENTIALS CARD
                        VStack(alignment: .leading, spacing: 18) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Sign In to Your Account")
                                    .font(.system(size: 20, weight: .bold, design: .rounded))
                                    .foregroundColor(MedMargTheme.slate900)

                                Text("Enter your credentials to access your personalized workspace")
                                    .font(.system(size: 13, weight: .regular))
                                    .foregroundColor(MedMargTheme.slate500)
                            }

                            if !errorMessage.isEmpty {
                                HStack(spacing: 8) {
                                    Image(systemName: "exclamationmark.circle.fill")
                                        .foregroundColor(.red)
                                    Text(errorMessage)
                                        .font(.system(size: 12, weight: .semibold))
                                        .foregroundColor(.red)
                                }
                                .padding(12)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.red.opacity(0.08))
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                            }

                            // Username / Email / Mobile Input
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Username, Email or Mobile Number")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate700)

                                HStack(spacing: 10) {
                                    Image(systemName: "person.fill")
                                        .foregroundColor(MedMargTheme.primaryTeal)
                                        .frame(width: 20)

                                    TextField("e.g. patient, doctor, admin, 9876543210", text: $usernameInput)
                                        .autocapitalization(.none)
                                        .disableAutocorrection(true)
                                        .font(.system(size: 15))
                                }
                                .padding(14)
                                .background(MedMargTheme.slate50)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(MedMargTheme.slate200, lineWidth: 1)
                                )
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                            }

                            // Password Input
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Password")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate700)

                                HStack(spacing: 10) {
                                    Image(systemName: "lock.fill")
                                        .foregroundColor(MedMargTheme.primaryTeal)
                                        .frame(width: 20)

                                    if isPasswordVisible {
                                        TextField("Enter password", text: $passwordInput)
                                            .autocapitalization(.none)
                                            .font(.system(size: 15))
                                    } else {
                                        SecureField("Enter password", text: $passwordInput)
                                            .font(.system(size: 15))
                                    }

                                    Button(action: { isPasswordVisible.toggle() }) {
                                        Image(systemName: isPasswordVisible ? "eye.slash.fill" : "eye.fill")
                                            .foregroundColor(MedMargTheme.slate500)
                                    }
                                }
                                .padding(14)
                                .background(MedMargTheme.slate50)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(MedMargTheme.slate200, lineWidth: 1)
                                )
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                            }

                            // Main Sign In Action Button
                            Button(action: onSignIn) {
                                HStack(spacing: 8) {
                                    Text("Sign In")
                                        .font(.system(size: 16, weight: .bold))
                                    Image(systemName: "arrow.right")
                                        .font(.system(size: 14, weight: .bold))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 15)
                                .background(
                                    LinearGradient(
                                        colors: [MedMargTheme.primaryTeal, MedMargTheme.darkTeal],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .foregroundColor(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 14))
                                .shadow(color: MedMargTheme.primaryTeal.opacity(0.35), radius: 8, x: 0, y: 4)
                            }
                        }
                        .padding(24)
                        .background(MedMargTheme.pureWhite)
                        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                        .shadow(color: Color.black.opacity(0.06), radius: 20, x: 0, y: 8)
                        .padding(.horizontal, 20)

                        // 3. SOCIAL OAUTH LOGIN OPTIONS
                        VStack(spacing: 16) {
                            HStack {
                                Rectangle()
                                    .fill(MedMargTheme.slate200)
                                    .frame(height: 1)
                                Text("OR CONTINUE WITH")
                                    .font(.system(size: 11, weight: .heavy))
                                    .foregroundColor(MedMargTheme.slate500)
                                    .padding(.horizontal, 8)
                                Rectangle()
                                    .fill(MedMargTheme.slate200)
                                    .frame(height: 1)
                            }
                            .padding(.horizontal, 24)

                            VStack(spacing: 12) {
                                // Sign in with Apple
                                Button(action: { onOAuthSignIn("Apple") }) {
                                    HStack(spacing: 10) {
                                        Image(systemName: "apple.logo")
                                            .font(.system(size: 18))
                                        Text("Sign in with Apple")
                                            .font(.system(size: 15, weight: .semibold))
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 13)
                                    .background(Color.black)
                                    .foregroundColor(.white)
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                }

                                // Sign in with Google
                                Button(action: { onOAuthSignIn("Google") }) {
                                    HStack(spacing: 10) {
                                        Image(systemName: "g.circle.fill")
                                            .font(.system(size: 18))
                                            .foregroundColor(.red)
                                        Text("Sign in with Google")
                                            .font(.system(size: 15, weight: .semibold))
                                            .foregroundColor(MedMargTheme.slate900)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 13)
                                    .background(MedMargTheme.pureWhite)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(MedMargTheme.slate200, lineWidth: 1.5)
                                    )
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                }

                                // Sign in with Facebook
                                Button(action: { onOAuthSignIn("Facebook") }) {
                                    HStack(spacing: 10) {
                                        Image(systemName: "f.circle.fill")
                                            .font(.system(size: 18))
                                            .foregroundColor(.white)
                                        Text("Sign in with Facebook")
                                            .font(.system(size: 15, weight: .semibold))
                                            .foregroundColor(.white)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 13)
                                    .background(Color(red: 0.09, green: 0.40, blue: 0.98))
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                }
                            }
                            .padding(.horizontal, 20)
                        }

                        // Subtle Developer / Testing Helper Note
                        Text("Default password for all roles: password123\nUsernames: patient, doctor, admin, lab, scans, pharmacy, agent")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(MedMargTheme.slate500)
                            .multilineTextAlignment(.center)
                            .padding(.bottom, 30)
                    }
                }
            }
            .navigationBarHidden(true)
        }
    }
}

// =========================================================================
// 🌟 CREATIVE CUSTOMER (PATIENT) APP CONTAINER WITH FLOATING BOTTOM NAVBAR
// =========================================================================
struct PatientAppContainerView: View {
    let user: UserProfile
    let currentCity: String
    let onLogout: () -> Void

    @State private var activeTab: PatientTab = .home
    @State private var cartItems: [CartItem] = [
        CartItem(
            id: "c_1",
            title: "Aarogyam Complete 1.3 (Full Body)",
            subtitle: "104 Biomarkers • Free Home Collection",
            provider: "Thyrocare Central Lab",
            price: 1499,
            mrp: 3500,
            type: "Lab Test"
        )
    ]
    @State private var showCartSheet: Bool = false

    enum PatientTab: String, CaseIterable {
        case home = "Home"
        case labs = "Labs & Tests"
        case scans = "3.0T MRI"
        case pharmacy = "Pharmacy"
        case records = "Records"

        var icon: String {
            switch self {
            case .home: return "house.fill"
            case .labs: return "flask.fill"
            case .scans: return "waveform.path.ecg.rectangle"
            case .pharmacy: return "pills.fill"
            case .records: return "folder.fill"
            }
        }
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            // Main Active Screen View
            Group {
                switch activeTab {
                case .home:
                    PatientHomeTab(
                        user: user,
                        currentCity: currentCity,
                        cartCount: cartItems.count,
                        onNavigateTab: { tab in activeTab = tab },
                        onOpenCart: { showCartSheet = true },
                        onAddToCart: { item in cartItems.append(item) },
                        onLogout: onLogout
                    )
                case .labs:
                    PatientLabsTab(
                        cartCount: cartItems.count,
                        onOpenCart: { showCartSheet = true },
                        onAddToCart: { item in cartItems.append(item) }
                    )
                case .scans:
                    PatientScansTab(
                        cartCount: cartItems.count,
                        onOpenCart: { showCartSheet = true },
                        onAddToCart: { item in cartItems.append(item) }
                    )
                case .pharmacy:
                    PatientPharmacyTab(
                        cartCount: cartItems.count,
                        onOpenCart: { showCartSheet = true },
                        onAddToCart: { item in cartItems.append(item) }
                    )
                case .records:
                    PatientRecordsTab()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(.bottom, 74) // Space for floating bottom navbar

            // ================= CREATIVE FLOATING BOTTOM NAVBAR =================
            HStack(spacing: 0) {
                ForEach(PatientTab.allCases, id: \.self) { tab in
                    let isSelected = activeTab == tab
                    Button(action: {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                            activeTab = tab
                        }
                    }) {
                        VStack(spacing: 4) {
                            ZStack {
                                if isSelected {
                                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                                        .fill(MedMargTheme.primaryTeal.opacity(0.14))
                                        .frame(width: 48, height: 32)
                                }

                                Image(systemName: tab.icon)
                                    .font(.system(size: isSelected ? 18 : 17, weight: isSelected ? .bold : .medium))
                                    .foregroundColor(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                            }

                            Text(tab.rawValue)
                                .font(.system(size: 10.5, weight: isSelected ? .bold : .medium))
                                .foregroundColor(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
            }
            .padding(.vertical, 8)
            .background(
                MedMargTheme.pureWhite
                    .shadow(color: Color.black.opacity(0.10), radius: 20, x: 0, y: -4)
            )
            .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .stroke(MedMargTheme.slate200.opacity(0.8), lineWidth: 1)
            )
            .padding(.horizontal, 16)
            .padding(.bottom, 10)
        }
        .sheet(isPresented: $showCartSheet) {
            PatientCartSheet(cartItems: $cartItems, currentCity: currentCity)
        }
    }
}

// =========================================================================
// 1. PATIENT HOME TAB (LIVE DATA & HERO BANNER)
// =========================================================================
struct PatientHomeTab: View {
    let user: UserProfile
    let currentCity: String
    let cartCount: Int
    let onNavigateTab: (PatientAppContainerView.PatientTab) -> Void
    let onOpenCart: () -> Void
    let onAddToCart: (CartItem) -> Void
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    
                    // TOP BAR
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Serving in")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)

                            HStack(spacing: 4) {
                                Image(systemName: "mappin.circle.fill")
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                Text(currentCity)
                                    .font(.system(size: 15, weight: .heavy))
                                    .foregroundColor(MedMargTheme.slate900)
                            }
                        }

                        Spacer()

                        HStack(spacing: 12) {
                            // Cart Button
                            Button(action: onOpenCart) {
                                ZStack(alignment: .topTrailing) {
                                    Image(systemName: "cart.fill")
                                        .font(.system(size: 18))
                                        .foregroundColor(MedMargTheme.primaryTeal)
                                        .frame(width: 40, height: 40)
                                        .background(MedMargTheme.primaryTeal.opacity(0.1))
                                        .clipShape(Circle())

                                    if cartCount > 0 {
                                        Text("\(cartCount)")
                                            .font(.system(size: 10, weight: .black))
                                            .foregroundColor(.white)
                                            .frame(width: 18, height: 18)
                                            .background(Color.red)
                                            .clipShape(Circle())
                                            .offset(x: 4, y: -4)
                                    }
                                }
                            }

                            // Logout Button
                            Button(action: onLogout) {
                                Image(systemName: "rectangle.portrait.and.arrow.right")
                                    .font(.system(size: 16))
                                    .foregroundColor(MedMargTheme.slate500)
                                    .frame(width: 40, height: 40)
                                    .background(MedMargTheme.slate200.opacity(0.5))
                                    .clipShape(Circle())
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)

                    // HERO PROMO BANNER (57% OFF THYROCARE AAROGYAM)
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 20, style: .continuous)
                            .fill(
                                LinearGradient(
                                    colors: [MedMargTheme.primaryTeal, MedMargTheme.darkTeal],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )

                        VStack(alignment: .leading, spacing: 10) {
                            HStack {
                                Text("FLAT 57% OFF")
                                    .font(.system(size: 11, weight: .black))
                                    .foregroundColor(MedMargTheme.slate900)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 4)
                                    .background(MedMargTheme.amberGold)
                                    .clipShape(Capsule())

                                Spacer()

                                Text("⚡ 60-Min Phlebo Visit")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(.white.opacity(0.9))
                            }

                            Text("Thyrocare Aarogyam Complete 1.3")
                                .font(.system(size: 20, weight: .heavy, design: .rounded))
                                .foregroundColor(.white)

                            Text("104 Vital Biomarkers • Thyroid, Lipid, Liver, Kidney, Vitamin D & CBC")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.white.opacity(0.85))

                            HStack {
                                VStack(alignment: .leading, spacing: 1) {
                                    Text("₹1,499")
                                        .font(.system(size: 22, weight: .black))
                                        .foregroundColor(MedMargTheme.amberGold)
                                    Text("MRP: ₹3,500")
                                        .font(.system(size: 11, weight: .bold))
                                        .foregroundColor(.white.opacity(0.6))
                                        .strikethrough()
                                }

                                Spacer()

                                Button(action: {
                                    onAddToCart(
                                        CartItem(
                                            id: "c_aarogyam_\(UUID().uuidString.prefix(4))",
                                            title: "Aarogyam Complete 1.3",
                                            subtitle: "104 Parameters • Free Home Collection",
                                            provider: "Thyrocare Central Lab",
                                            price: 1499,
                                            mrp: 3500,
                                            type: "Lab Test"
                                        )
                                    )
                                }) {
                                    Text("+ Book Now")
                                        .font(.system(size: 13, weight: .black))
                                        .foregroundColor(MedMargTheme.primaryTeal)
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 10)
                                        .background(MedMargTheme.pureWhite)
                                        .clipShape(RoundedRectangle(cornerRadius: 12))
                                }
                            }
                        }
                        .padding(18)
                    }
                    .padding(.horizontal, 20)

                    // QUICK ACTION SERVICE CATEGORIES
                    HStack(spacing: 12) {
                        ServiceActionPill(icon: "flask.fill", title: "Labs", color: MedMargTheme.amberGold) {
                            onNavigateTab(.labs)
                        }
                        ServiceActionPill(icon: "waveform.path.ecg.rectangle", title: "3.0T MRI", color: MedMargTheme.cyanBlue) {
                            onNavigateTab(.scans)
                        }
                        ServiceActionPill(icon: "stethoscope", title: "Doctors", color: MedMargTheme.purpleClinic) {
                            onNavigateTab(.home)
                        }
                        ServiceActionPill(icon: "pills.fill", title: "Generics", color: MedMargTheme.accentEmerald) {
                            onNavigateTab(.pharmacy)
                        }
                    }
                    .padding(.horizontal, 20)

                    // POPULAR TESTS SINGLE ROW CARDS (MATCHING WEB MODULE)
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Popular Pathology Tests")
                                .font(.system(size: 18, weight: .heavy, design: .rounded))
                                .foregroundColor(MedMargTheme.slate900)
                            Spacer()
                            Button(action: { onNavigateTab(.labs) }) {
                                Text("See 104+ Tests")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                            }
                        }
                        .padding(.horizontal, 20)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 14) {
                                ForEach(samplePopularTests) { test in
                                    TestCardMini(test: test, onAddToCart: {
                                        onAddToCart(
                                            CartItem(
                                                id: "t_\(test.id)",
                                                title: test.name,
                                                subtitle: "\(test.params) Parameters • \(test.tatHours)h TAT",
                                                provider: "Thyrocare Central Lab",
                                                price: test.thyrocarePrice,
                                                mrp: test.mrp,
                                                type: "Lab Test"
                                            )
                                        )
                                    })
                                }
                            }
                            .padding(.horizontal, 20)
                        }
                    }

                    // DOCTOR PRESCRIBED TESTS SECTION
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Image(systemName: "stethoscope")
                                .foregroundColor(MedMargTheme.purpleClinic)
                            Text("Doctor Prescriptions for You")
                                .font(.system(size: 16, weight: .heavy, design: .rounded))
                                .foregroundColor(MedMargTheme.slate900)
                        }
                        .padding(.horizontal, 20)

                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("Dr. Ananya Sharma, MD")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(MedMargTheme.purpleClinic)
                                Spacer()
                                Text("Phlebotomist Enroute")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(MedMargTheme.amberGold)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 3)
                                    .background(MedMargTheme.amberLight)
                                    .clipShape(Capsule())
                            }

                            Text("Prescribed Tests: Thyroid Profile Total + Complete Lipid Profile")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(MedMargTheme.slate700)

                            HStack {
                                Text("Doctor Price: ₹1,000")
                                    .font(.system(size: 14, weight: .heavy))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                Spacer()
                                Text("✓ B2B Lab Paid")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(MedMargTheme.accentEmerald)
                            }
                        }
                        .padding(16)
                        .background(MedMargTheme.pureWhite)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(MedMargTheme.purpleClinic.opacity(0.3), lineWidth: 1.5)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .padding(.horizontal, 20)
                    }

                    Spacer().frame(height: 20)
                }
            }
            .background(MedMargTheme.slate50)
            .navigationBarHidden(true)
        }
    }
}

// =========================================================================
// 2. PATIENT LABS & TESTS TAB (FULL CATALOG + MULTI-LAB PRICE COMPARE)
// =========================================================================
struct PatientLabsTab: View {
    let cartCount: Int
    let onOpenCart: () -> Void
    let onAddToCart: (CartItem) -> Void

    @State private var selectedCategory: String = "All"
    @State private var searchCatalog: String = ""

    let categories = ["All", "Full Body", "Thyroid", "Lipid", "Liver (LFT)", "Kidney (KFT)", "Vitamins", "Diabetes"]

    var filteredTests: [LabTestItem] {
        samplePopularTests.filter { test in
            (selectedCategory == "All" || test.category == selectedCategory) &&
            (searchCatalog.isEmpty || test.name.localizedCaseInsensitiveContains(searchCatalog))
        }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                
                // TOP HEADER
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Diagnostic Pathology")
                            .font(.system(size: 22, weight: .heavy, design: .rounded))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("104+ NABL Certified Pathology Tests & Bundles")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    Spacer()
                    Button(action: onOpenCart) {
                        ZStack(alignment: .topTrailing) {
                            Image(systemName: "cart.fill")
                                .font(.system(size: 18))
                                .foregroundColor(MedMargTheme.primaryTeal)
                                .frame(width: 40, height: 40)
                                .background(MedMargTheme.primaryTeal.opacity(0.1))
                                .clipShape(Circle())

                            if cartCount > 0 {
                                Text("\(cartCount)")
                                    .font(.system(size: 10, weight: .black))
                                    .foregroundColor(.white)
                                    .frame(width: 18, height: 18)
                                    .background(Color.red)
                                    .clipShape(Circle())
                                    .offset(x: 4, y: -4)
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 14)
                .background(MedMargTheme.pureWhite)

                // SEARCH BAR
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(MedMargTheme.slate500)
                    TextField("Search test, biomarker, or organ...", text: $searchCatalog)
                        .font(.system(size: 14))
                }
                .padding(12)
                .background(MedMargTheme.slate50)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .padding(.horizontal, 20)
                .padding(.vertical, 8)
                .background(MedMargTheme.pureWhite)

                // CATEGORY FILTER PILLS
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(categories, id: \.self) { cat in
                            let isSel = selectedCategory == cat
                            Button(action: { selectedCategory = cat }) {
                                Text(cat)
                                    .font(.system(size: 13, weight: isSel ? .bold : .medium))
                                    .foregroundColor(isSel ? .white : MedMargTheme.slate700)
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 8)
                                    .background(isSel ? MedMargTheme.primaryTeal : MedMargTheme.slate200.opacity(0.6))
                                    .clipShape(Capsule())
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 8)
                }
                .background(MedMargTheme.pureWhite)

                Divider()

                // TESTS LIST WITH MULTI-LAB PRICING
                ScrollView(showsIndicators: false) {
                    LazyVStack(spacing: 14) {
                        ForEach(filteredTests) { test in
                            VStack(alignment: .leading, spacing: 10) {
                                HStack(alignment: .top) {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(test.name)
                                            .font(.system(size: 16, weight: .bold, design: .rounded))
                                            .foregroundColor(MedMargTheme.slate900)

                                        HStack(spacing: 8) {
                                            Text("\(test.params) Biomarkers")
                                                .font(.system(size: 11, weight: .bold))
                                                .foregroundColor(MedMargTheme.primaryTeal)
                                            Text("•")
                                                .foregroundColor(MedMargTheme.slate500)
                                            Text("Sample: \(test.sampleType)")
                                                .font(.system(size: 11, weight: .medium))
                                                .foregroundColor(MedMargTheme.slate500)
                                            Text("•")
                                                .foregroundColor(MedMargTheme.slate500)
                                            Text("TAT: \(test.tatHours)h")
                                                .font(.system(size: 11, weight: .medium))
                                                .foregroundColor(MedMargTheme.slate500)
                                        }
                                    }
                                    Spacer()
                                    VStack(alignment: .trailing, spacing: 2) {
                                        Text("₹\(test.thyrocarePrice)")
                                            .font(.system(size: 18, weight: .black))
                                            .foregroundColor(MedMargTheme.primaryTeal)
                                        Text("MRP ₹\(test.mrp)")
                                            .font(.system(size: 11, weight: .bold))
                                            .foregroundColor(MedMargTheme.slate500)
                                            .strikethrough()
                                    }
                                }

                                // Multi-Lab Price Comparison Grid
                                HStack(spacing: 8) {
                                    LabPriceBadge(lab: "Thyrocare", price: test.thyrocarePrice, isBest: true)
                                    LabPriceBadge(lab: "Apollo", price: test.apolloPrice, isBest: false)
                                    LabPriceBadge(lab: "Dr. Lal", price: test.lalPrice, isBest: false)
                                }

                                HStack {
                                    HStack(spacing: 4) {
                                        Image(systemName: "checkmark.shield.fill")
                                            .foregroundColor(MedMargTheme.accentEmerald)
                                        Text("Free Tirupati Home Collection")
                                            .font(.system(size: 11, weight: .bold))
                                            .foregroundColor(MedMargTheme.accentEmerald)
                                    }

                                    Spacer()

                                    Button(action: {
                                        onAddToCart(
                                            CartItem(
                                                id: "t_\(test.id)_\(UUID().uuidString.prefix(4))",
                                                title: test.name,
                                                subtitle: "\(test.params) Parameters • \(test.tatHours)h TAT",
                                                provider: "Thyrocare Central Lab",
                                                price: test.thyrocarePrice,
                                                mrp: test.mrp,
                                                type: "Lab Test"
                                            )
                                        )
                                    }) {
                                        HStack(spacing: 4) {
                                            Image(systemName: "plus")
                                            Text("Add to Cart")
                                        }
                                        .font(.system(size: 12, weight: .bold))
                                        .foregroundColor(.white)
                                        .padding(.horizontal, 14)
                                        .padding(.vertical, 8)
                                        .background(MedMargTheme.primaryTeal)
                                        .clipShape(RoundedRectangle(cornerRadius: 10))
                                    }
                                }
                            }
                            .padding(16)
                            .background(MedMargTheme.pureWhite)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                            .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 3)
                        }
                    }
                    .padding(20)
                }
            }
            .background(MedMargTheme.slate50)
            .navigationBarHidden(true)
        }
    }
}

// =========================================================================
// 3. PATIENT 3.0T MRI & SCANS TAB
// =========================================================================
struct PatientScansTab: View {
    let cartCount: Int
    let onOpenCart: () -> Void
    let onAddToCart: (CartItem) -> Void

    let scansList = [
        ScanServiceItem(
            id: "s_1",
            name: "MRI Brain (Plain + Neuro Imaging)",
            category: "Brain & Spine",
            centerName: "Aarthi Scans & Radiology, Tirupati",
            machineSpec: "Siemens Magnetom 3.0T Silent MRI (70cm Wide Bore)",
            price: 3499,
            mrp: 6500,
            durationMins: 25,
            nextSlot: "Today, 04:30 PM",
            fastingRequired: false
        ),
        ScanServiceItem(
            id: "s_2",
            name: "MRI Lumbar Spine (Lower Back)",
            category: "Brain & Spine",
            centerName: "MedMarg Advanced Imaging Hub",
            machineSpec: "Siemens 3.0 Tesla High-Gradient Superconducting",
            price: 3899,
            mrp: 7000,
            durationMins: 20,
            nextSlot: "Today, 05:45 PM",
            fastingRequired: false
        ),
        ScanServiceItem(
            id: "s_3",
            name: "CT Coronary Angiography (128-Slice)",
            category: "Cardiac Imaging",
            centerName: "Apollo Scan Center, Tirupati",
            machineSpec: "GE Optima 128-Slice Ultra-Fast Dual Energy CT",
            price: 6999,
            mrp: 12000,
            durationMins: 15,
            nextSlot: "Tomorrow, 08:00 AM",
            fastingRequired: true
        )
    ]

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 18) {
                    
                    // HEADER
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("3.0T MRI & CT Scans")
                                .font(.system(size: 22, weight: .heavy, design: .rounded))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Hospital-Grade 3.0 Tesla Silent MRI Slots in Tirupati")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        Spacer()
                        Button(action: onOpenCart) {
                            ZStack(alignment: .topTrailing) {
                                Image(systemName: "cart.fill")
                                    .font(.system(size: 18))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                    .frame(width: 40, height: 40)
                                    .background(MedMargTheme.primaryTeal.opacity(0.1))
                                    .clipShape(Circle())

                                if cartCount > 0 {
                                    Text("\(cartCount)")
                                        .font(.system(size: 10, weight: .black))
                                        .foregroundColor(.white)
                                        .frame(width: 18, height: 18)
                                        .background(Color.red)
                                        .clipShape(Circle())
                                        .offset(x: 4, y: -4)
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)

                    // 3.0T MRI SPEC HIGHLIGHT
                    HStack(spacing: 12) {
                        Image(systemName: "waveform.path.ecg.rectangle")
                            .font(.system(size: 26))
                            .foregroundColor(MedMargTheme.cyanBlue)

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Siemens Magnetom 3.0T High-Res")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Silent Scan Technology • 70% Less Noise • 2X Image Clarity")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }
                    .padding(14)
                    .background(MedMargTheme.cyanBlue.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .padding(.horizontal, 20)

                    // SCANS LIST
                    VStack(spacing: 14) {
                        ForEach(scansList) { scan in
                            VStack(alignment: .leading, spacing: 10) {
                                HStack {
                                    Text(scan.name)
                                        .font(.system(size: 16, weight: .bold, design: .rounded))
                                        .foregroundColor(MedMargTheme.slate900)
                                    Spacer()
                                    Text("₹\(scan.price)")
                                        .font(.system(size: 18, weight: .black))
                                        .foregroundColor(MedMargTheme.primaryTeal)
                                }

                                Text("🏢 \(scan.centerName)")
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(MedMargTheme.slate700)

                                Text("⚙️ \(scan.machineSpec)")
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundColor(MedMargTheme.slate500)

                                HStack {
                                    HStack(spacing: 4) {
                                        Image(systemName: "clock.fill")
                                            .foregroundColor(MedMargTheme.amberGold)
                                        Text("Slot: \(scan.nextSlot)")
                                            .font(.system(size: 11, weight: .bold))
                                            .foregroundColor(MedMargTheme.amberGold)
                                    }

                                    Spacer()

                                    Button(action: {
                                        onAddToCart(
                                            CartItem(
                                                id: "s_\(scan.id)",
                                                title: scan.name,
                                                subtitle: scan.centerName,
                                                provider: scan.machineSpec,
                                                price: scan.price,
                                                mrp: scan.mrp,
                                                type: "MRI Scan"
                                            )
                                        )
                                    }) {
                                        Text("Book Slot")
                                            .font(.system(size: 12, weight: .bold))
                                            .foregroundColor(.white)
                                            .padding(.horizontal, 14)
                                            .padding(.vertical, 8)
                                            .background(MedMargTheme.cyanBlue)
                                            .clipShape(RoundedRectangle(cornerRadius: 10))
                                    }
                                }
                            }
                            .padding(16)
                            .background(MedMargTheme.pureWhite)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                            .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 3)
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }
            .background(MedMargTheme.slate50)
            .navigationBarHidden(true)
        }
    }
}

// =========================================================================
// 4. PATIENT GENERIC PHARMACY TAB (53% - 70% SAVINGS SWITCHER)
// =========================================================================
struct PatientPharmacyTab: View {
    let cartCount: Int
    let onOpenCart: () -> Void
    let onAddToCart: (CartItem) -> Void

    let genericMedicines = [
        GenericMedicineItem(
            id: "med_1",
            brandName: "Lipaglyn 4mg (Zydus)",
            genericName: "Saroglitazar 4mg",
            category: "Diabetes & Lipid",
            manufacturer: "MedMarg Certified Generic",
            brandMrp: 290.0,
            genericPrice: 135.0,
            packSize: "10 Tablets Strip",
            savingsPercent: 53
        ),
        GenericMedicineItem(
            id: "med_2",
            brandName: "Telma 40mg (Glenmark)",
            genericName: "Telmisartan 40mg IP",
            category: "Blood Pressure & Cardiac",
            manufacturer: "MedMarg Certified Generic",
            brandMrp: 145.0,
            genericPrice: 42.0,
            packSize: "15 Tablets Strip",
            savingsPercent: 71
        ),
        GenericMedicineItem(
            id: "med_3",
            brandName: "Rosuvas 10mg (Sun Pharma)",
            genericName: "Rosuvastatin 10mg IP",
            category: "Cholesterol Reducer",
            manufacturer: "MedMarg Certified Generic",
            brandMrp: 260.0,
            genericPrice: 78.0,
            packSize: "10 Tablets Strip",
            savingsPercent: 70
        )
    ]

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 18) {
                    
                    // HEADER
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Generic Pharmacy")
                                .font(.system(size: 22, weight: .heavy, design: .rounded))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Save 53% to 70% on Identical Active Salts")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(MedMargTheme.accentEmerald)
                        }
                        Spacer()
                        Button(action: onOpenCart) {
                            ZStack(alignment: .topTrailing) {
                                Image(systemName: "cart.fill")
                                    .font(.system(size: 18))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                    .frame(width: 40, height: 40)
                                    .background(MedMargTheme.primaryTeal.opacity(0.1))
                                    .clipShape(Circle())

                                if cartCount > 0 {
                                    Text("\(cartCount)")
                                        .font(.system(size: 10, weight: .black))
                                        .foregroundColor(.white)
                                        .frame(width: 18, height: 18)
                                        .background(Color.red)
                                        .clipShape(Circle())
                                        .offset(x: 4, y: -4)
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)

                    // MEDICINE COMPARISON CARDS
                    VStack(spacing: 14) {
                        ForEach(genericMedicines) { med in
                            VStack(alignment: .leading, spacing: 12) {
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(med.genericName)
                                            .font(.system(size: 16, weight: .bold, design: .rounded))
                                            .foregroundColor(MedMargTheme.slate900)
                                        Text("Replaces: \(med.brandName)")
                                            .font(.system(size: 12, weight: .semibold))
                                            .foregroundColor(MedMargTheme.slate500)
                                    }
                                    Spacer()
                                    Text("SAVE \(med.savingsPercent)%")
                                        .font(.system(size: 11, weight: .black))
                                        .foregroundColor(MedMargTheme.accentEmerald)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(MedMargTheme.emeraldLight)
                                        .clipShape(Capsule())
                                }

                                HStack(spacing: 12) {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("Brand MRP")
                                            .font(.system(size: 10, weight: .bold))
                                            .foregroundColor(MedMargTheme.slate500)
                                        Text("₹\(Int(med.brandMrp))")
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(MedMargTheme.slate500)
                                            .strikethrough()
                                    }

                                    Image(systemName: "arrow.right")
                                        .foregroundColor(MedMargTheme.accentEmerald)

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("Generic Deal")
                                            .font(.system(size: 10, weight: .black))
                                            .foregroundColor(MedMargTheme.accentEmerald)
                                        Text("₹\(Int(med.genericPrice))")
                                            .font(.system(size: 18, weight: .black))
                                            .foregroundColor(MedMargTheme.accentEmerald)
                                    }

                                    Spacer()

                                    Button(action: {
                                        onAddToCart(
                                            CartItem(
                                                id: "m_\(med.id)",
                                                title: med.genericName,
                                                subtitle: "\(med.packSize) • Save \(med.savingsPercent)%",
                                                provider: "MedMarg Generic Hub",
                                                price: Int(med.genericPrice),
                                                mrp: Int(med.brandMrp),
                                                type: "Medicine"
                                            )
                                        )
                                    }) {
                                        HStack(spacing: 4) {
                                            Image(systemName: "plus")
                                            Text("Add")
                                        }
                                        .font(.system(size: 12, weight: .bold))
                                        .foregroundColor(.white)
                                        .padding(.horizontal, 14)
                                        .padding(.vertical, 8)
                                        .background(MedMargTheme.accentEmerald)
                                        .clipShape(RoundedRectangle(cornerRadius: 10))
                                    }
                                }
                            }
                            .padding(16)
                            .background(MedMargTheme.pureWhite)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                            .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 3)
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }
            .background(MedMargTheme.slate50)
            .navigationBarHidden(true)
        }
    }
}

// =========================================================================
// 5. PATIENT DIGITAL HEALTH RECORDS TAB (GOOGLE DRIVE SYNC)
// =========================================================================
struct PatientRecordsTab: View {
    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 18) {
                    
                    // HEADER
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Digital Health Records")
                            .font(.system(size: 22, weight: .heavy, design: .rounded))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("HIPAA Compliant Cloud Diagnostic Storage")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)

                    // CLOUD SYNC CARD
                    HStack(spacing: 12) {
                        Image(systemName: "icloud.and.arrow.up.fill")
                            .font(.system(size: 28))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Direct Google Drive Sync")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Reports automatically sync to your Google Drive folder")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }
                    .padding(16)
                    .background(MedMargTheme.lightTeal)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .padding(.horizontal, 20)

                    // REPORTS ARCHIVE
                    VStack(spacing: 12) {
                        ReportArchiveCard(
                            title: "Thyrocare Aarogyam Complete 1.3",
                            lab: "Thyrocare Central Processing Lab",
                            date: "28-Aug-2026",
                            status: "Ready",
                            driveUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view"
                        )

                        ReportArchiveCard(
                            title: "Complete Lipid Profile (8 Parameters)",
                            lab: "Apollo Diagnostics, Tirupati",
                            date: "14-Aug-2026",
                            status: "Ready",
                            driveUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view"
                        )
                    }
                    .padding(.horizontal, 20)
                }
            }
            .background(MedMargTheme.slate50)
            .navigationBarHidden(true)
        }
    }
}

// =========================================================================
// 🛒 PATIENT CART & CHECKOUT SHEET
// =========================================================================
struct PatientCartSheet: View {
    @Binding var cartItems: [CartItem]
    let currentCity: String
    @Environment(\.dismiss) var dismiss

    var subtotal: Int { cartItems.reduce(0) { $0 + $1.price } }
    var mrpTotal: Int { cartItems.reduce(0) { $0 + $1.mrp } }
    var savings: Int { mrpTotal - subtotal }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if cartItems.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "cart.badge.questionmark")
                            .font(.system(size: 48))
                            .foregroundColor(MedMargTheme.slate500)
                        Text("Your Cart is Empty")
                            .font(.system(size: 18, weight: .bold))
                        Text("Add diagnostic tests or generic medicines to proceed.")
                            .font(.system(size: 13))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List {
                        Section("Selected Healthcare Services (\(cartItems.count))") {
                            ForEach(cartItems) { item in
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(item.title)
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(MedMargTheme.slate900)
                                        Text(item.subtitle)
                                            .font(.system(size: 11))
                                            .foregroundColor(MedMargTheme.slate500)
                                        Text("Provider: \(item.provider)")
                                            .font(.system(size: 11, weight: .semibold))
                                            .foregroundColor(MedMargTheme.primaryTeal)
                                    }
                                    Spacer()
                                    VStack(alignment: .trailing, spacing: 2) {
                                        Text("₹\(item.price)")
                                            .font(.system(size: 15, weight: .black))
                                            .foregroundColor(MedMargTheme.slate900)
                                        Text("₹\(item.mrp)")
                                            .font(.system(size: 11))
                                            .foregroundColor(MedMargTheme.slate500)
                                            .strikethrough()
                                    }
                                }
                            }
                            .onDelete { indexSet in
                                cartItems.remove(atOffsets: indexSet)
                            }
                        }

                        Section("Tirupati Home Sample Collection Schedule") {
                            HStack {
                                Image(systemName: "clock.badge.checkmark.fill")
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Tomorrow Morning: 07:00 AM - 08:30 AM")
                                        .font(.system(size: 13, weight: .bold))
                                    Text("Address: Plot 42, Air Bypass Road, Tirupati")
                                        .font(.system(size: 11))
                                        .foregroundColor(MedMargTheme.slate500)
                                }
                            }
                        }

                        Section("Payment Summary") {
                            HStack {
                                Text("Total MRP")
                                Spacer()
                                Text("₹\(mrpTotal)")
                            }
                            HStack {
                                Text("Total Savings")
                                Spacer()
                                Text("- ₹\(savings)")
                                    .foregroundColor(MedMargTheme.accentEmerald)
                                    .fontWeight(.bold)
                            }
                            HStack {
                                Text("Phlebotomist Home Visit")
                                Spacer()
                                Text("FREE")
                                    .foregroundColor(MedMargTheme.accentEmerald)
                                    .fontWeight(.bold)
                            }
                            HStack {
                                Text("Amount Payable")
                                    .fontWeight(.bold)
                                Spacer()
                                Text("₹\(subtotal)")
                                    .font(.system(size: 18, weight: .black))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                            }
                        }
                    }

                    // Confirm Booking Action Bar
                    VStack(spacing: 8) {
                        Button(action: {
                            cartItems.removeAll()
                            dismiss()
                        }) {
                            HStack {
                                Text("Confirm Booking (₹\(subtotal))")
                                    .font(.system(size: 16, weight: .bold))
                                Image(systemName: "checkmark.circle.fill")
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(MedMargTheme.primaryTeal)
                            .foregroundColor(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                        }
                    }
                    .padding(20)
                    .background(MedMargTheme.pureWhite)
                }
            }
            .navigationTitle("Your Healthcare Cart")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Close") { dismiss() }
                }
            }
        }
    }
}

// =========================================================================
// 🧰 HELPER UI COMPONENTS
// =========================================================================
struct ServiceActionPill: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
                    .frame(width: 48, height: 48)
                    .background(color.opacity(0.12))
                    .clipShape(Circle())

                Text(title)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
            }
            .frame(maxWidth: .infinity)
        }
    }
}

struct TestCardMini: View {
    let test: LabTestItem
    let onAddToCart: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(test.name)
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundColor(MedMargTheme.slate900)
                .lineLimit(2)
                .frame(height: 38, alignment: .topLeading)

            Text("\(test.params) Parameters • \(test.tatHours)h TAT")
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(MedMargTheme.slate500)

            HStack {
                VStack(alignment: .leading, spacing: 1) {
                    Text("₹\(test.thyrocarePrice)")
                        .font(.system(size: 16, weight: .black))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text("₹\(test.mrp)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MedMargTheme.slate500)
                        .strikethrough()
                }

                Spacer()

                Button(action: onAddToCart) {
                    Text("+ Add")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(MedMargTheme.primaryTeal)
                        .clipShape(Capsule())
                }
            }
        }
        .padding(14)
        .frame(width: 170)
        .background(MedMargTheme.pureWhite)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
    }
}

struct LabPriceBadge: View {
    let lab: String
    let price: Int
    let isBest: Bool

    var body: some View {
        VStack(spacing: 2) {
            Text(lab)
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(isBest ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
            Text("₹\(price)")
                .font(.system(size: 12, weight: .heavy))
                .foregroundColor(isBest ? MedMargTheme.primaryTeal : MedMargTheme.slate900)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(isBest ? MedMargTheme.primaryTeal.opacity(0.1) : MedMargTheme.slate50)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(isBest ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct ReportArchiveCard: View {
    let title: String
    let lab: String
    let date: String
    let status: String
    let driveUrl: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "doc.text.fill")
                    .foregroundColor(MedMargTheme.primaryTeal)
                Text(title)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                Text(status)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.accentEmerald)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(MedMargTheme.emeraldLight)
                    .clipShape(Capsule())
            }

            Text("Laboratory: \(lab) • Date: \(date)")
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(MedMargTheme.slate500)

            Link(destination: URL(string: driveUrl)!) {
                HStack(spacing: 6) {
                    Image(systemName: "arrow.up.right.square")
                    Text("Open PDF Report in Google Drive")
                }
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(MedMargTheme.primaryTeal)
            }
        }
        .padding(16)
        .background(MedMargTheme.pureWhite)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
    }
}

// =========================================================================
// 🧪 SAMPLE LIVE DATA (MATCHING WEB MODULE)
// =========================================================================
let samplePopularTests: [LabTestItem] = [
    LabTestItem(
        id: "t_aarogyam13",
        name: "Aarogyam Complete 1.3 (Full Body)",
        category: "Full Body",
        sampleType: "Blood & Urine",
        fastingHours: 12,
        params: 104,
        thyrocarePrice: 1499,
        apolloPrice: 2800,
        lalPrice: 3200,
        mrp: 3500,
        tatHours: 14,
        tags: ["Bestseller", "Full Body", "Free Home Visit"]
    ),
    LabTestItem(
        id: "t_thyroid",
        name: "Thyroid Profile Total (T3, T4, TSH)",
        category: "Thyroid",
        sampleType: "Blood",
        fastingHours: 0,
        params: 3,
        thyrocarePrice: 349,
        apolloPrice: 550,
        lalPrice: 600,
        mrp: 600,
        tatHours: 6,
        tags: ["Thyroid", "Fast Report"]
    ),
    LabTestItem(
        id: "t_lipid",
        name: "Complete Lipid Profile (Cholesterol)",
        category: "Lipid",
        sampleType: "Blood",
        fastingHours: 12,
        params: 8,
        thyrocarePrice: 449,
        apolloPrice: 750,
        lalPrice: 850,
        mrp: 850,
        tatHours: 8,
        tags: ["Cardiac Risk", "Fasting Required"]
    ),
    LabTestItem(
        id: "t_lft",
        name: "Liver Function Test (LFT 11 Params)",
        category: "Liver (LFT)",
        sampleType: "Blood",
        fastingHours: 0,
        params: 11,
        thyrocarePrice: 599,
        apolloPrice: 950,
        lalPrice: 1100,
        mrp: 1100,
        tatHours: 8,
        tags: ["Liver Care"]
    ),
    LabTestItem(
        id: "t_kft",
        name: "Kidney Function Test (KFT / RFT)",
        category: "Kidney (KFT)",
        sampleType: "Blood",
        fastingHours: 0,
        params: 7,
        thyrocarePrice: 549,
        apolloPrice: 850,
        lalPrice: 950,
        mrp: 950,
        tatHours: 8,
        tags: ["Renal Health"]
    ),
    LabTestItem(
        id: "t_vitd",
        name: "Vitamin D 25-Hydroxy Total",
        category: "Vitamins",
        sampleType: "Blood",
        fastingHours: 0,
        params: 1,
        thyrocarePrice: 699,
        apolloPrice: 1200,
        lalPrice: 1400,
        mrp: 1400,
        tatHours: 10,
        tags: ["Bone Health", "Immunity"]
    ),
    LabTestItem(
        id: "t_hba1c",
        name: "HbA1c (Glycosylated Hemoglobin)",
        category: "Diabetes",
        sampleType: "Blood",
        fastingHours: 0,
        params: 2,
        thyrocarePrice: 399,
        apolloPrice: 600,
        lalPrice: 650,
        mrp: 650,
        tatHours: 6,
        tags: ["Diabetes Monitoring"]
    )
]

// =========================================================================
// 🩺 DOCTOR WORKDESK VIEW
// =========================================================================
struct DoctorHomeView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("Doctor In-Clinic OPD Token Desk") {
                    HStack {
                        Text("Token #1: Rahul Sharma (Air Bypass Rd)")
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

                Section("Prescribe Tests with Custom Patient Price") {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Patient: Rahul Sharma (34y, M)")
                            .fontWeight(.bold)
                        Text("Thyroid Total + Lipid Profile")
                            .font(.caption)
                        HStack {
                            Text("You Pay Lab: ₹798")
                                .fontWeight(.bold)
                                .foregroundColor(.orange)
                            Spacer()
                            Text("Patient Price: ₹1,000")
                                .fontWeight(.heavy)
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }
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
// 👑 SUPER ADMIN CONSOLE VIEW (WITH FULL USER MANAGEMENT)
// =========================================================================
struct SuperAdminHomeView: View {
    let user: UserProfile
    @Binding var users: [UserProfile]
    let onLogout: () -> Void

    @State private var showAddUserSheet: Bool = false
    @State private var editingUser: UserProfile? = nil

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
                                    .foregroundColor(MedMargTheme.primaryTeal)

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(usr.name)
                                        .fontWeight(.bold)
                                    Text("\(usr.role.displayName) • User: \(usr.username)")
                                        .font(.caption)
                                        .foregroundColor(MedMargTheme.slate500)
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
                                .foregroundColor(MedMargTheme.slate500)

                            HStack {
                                Text("Pass: \(usr.password)")
                                    .font(.caption2)
                                    .foregroundColor(MedMargTheme.slate500)
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

                Section("Tests & Catalog Management") {
                    Text("104+ Tests Active in Catalog")
                    Text("Aarogyam Package Studio: 57% Off Bundle")
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

                        Section("Role & Organization") {
                            Picker("Role", selection: $newRole) {
                                ForEach(UserRole.allCases) { role in
                                    Text(role.displayName).tag(role)
                                }
                            }
                            TextField("Organization / Clinic", text: $newOrg)
                        }
                    }
                    .navigationTitle("Add New User")
                    .toolbar {
                        ToolbarItem(placement: .navigationBarLeading) {
                            Button("Cancel") { showAddUserSheet = false }
                        }
                        ToolbarItem(placement: .navigationBarTrailing) {
                            Button("Save") {
                                let u = UserProfile(
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
                                users.append(u)
                                showAddUserSheet = false
                                newName = ""; newUsername = ""; newEmail = ""; newPhone = ""; newOrg = ""
                            }
                            .fontWeight(.bold)
                        }
                    }
                }
            }
        }
    }
}

// =========================================================================
// 🔬 LAB PARTNER VIEW
// =========================================================================
struct LabHomeView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("Sample Processing Queue") {
                    Text("Rahul Sharma - Aarogyam Complete 1.3 (Analyzing)")
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
// 🧲 SCAN CENTER VIEW
// =========================================================================
struct ScanCenterHomeView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("3.0T MRI Machine Schedule") {
                    Text("Karan Mehra - MRI Brain (Slot: 05:00 PM)")
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
// 💊 PHARMACY VIEW
// =========================================================================
struct PharmacyHomeView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("Generic Prescription Queue") {
                    Text("Anil Gupta - Saroglitazar 4mg (Substituted 53% Savings)")
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
// 🚚 COLLECTION AGENT / FLEET VIEW
// =========================================================================
struct AgentHomeView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section("Field Sample Collection Orders") {
                    Text("Stop #1: Rahul Sharma (Air Bypass Rd) • 4.2°C Cold Box")
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
