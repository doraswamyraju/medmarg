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

    // State Management
    @State private var usernameInput: String = ""
    @State private var passwordInput: String = ""
    @State private var errorMessage: String = ""
    @State private var isPasswordVisible: Bool = false
    @State private var loggedInUser: UserProfile? = nil
    @State private var currentCity: String = "Tirupati, Andhra Pradesh"
    
    // UI Navigation State
    @State private var selectedTab: Int = 0 // 0: Home, 1: Labs & Tests, 2: Track, 3: Docs & Profile
    @State private var showSidebar: Bool = false
    @State private var showCityPicker: Bool = false
    @State private var showCartSheet: Bool = false
    @State private var selectedCategory: String = "All Tests & Packages"
    @State private var searchQuery: String = ""
    @State private var cartItems: [CartItem] = [
        CartItem(id: "c1", title: "Aarogyam Complete 1.3 (Full Body Checkup)", subtitle: "104 Biomarkers • Thyrocare NABL", provider: "Thyrocare Direct", price: 1499, mrp: 3500, type: "Lab Package")
    ]

    var body: some View {
        ZStack {
            MedMargTheme.slate50.ignoresSafeArea()

            if let user = loggedInUser {
                // Logged-in App Workspace with Navigation Drawer & Topbar
                ZStack {
                    VStack(spacing: 0) {
                        // 1. Unified Industry-Standard Top Bar
                        appTopBar(user: user)
                        
                        // 2. Role-Based Active View Body
                        Group {
                            switch user.role {
                            case .patient:
                                patientBodyView
                            case .doctor:
                                DoctorWorkdeskView(user: user, onLogout: logout)
                            case .admin:
                                AdminConsoleView(users: $users, onLogout: logout)
                            case .diagnosticLab:
                                LabDeskView(user: user, onLogout: logout)
                            case .scanCenter:
                                RadiologyDeskView(user: user, onLogout: logout)
                            case .pharmacy:
                                PharmacyDeskView(user: user, onLogout: logout)
                            case .collectionAgent:
                                FleetDeskView(user: user, onLogout: logout)
                            }
                        }
                    }

                    // 3. Slide-Out Sidebar Navigation Drawer
                    if showSidebar {
                        sidebarDrawerOverlay(user: user)
                    }
                }
                .sheet(isPresented: $showCityPicker) {
                    cityPickerSheet
                }
                .sheet(isPresented: $showCartSheet) {
                    cartViewSheet
                }
            } else {
                // Clean Branded Login View
                loginView
            }
        }
        .preferredColorScheme(.light)
    }

    // ==========================================
    // 🔐 BRANDED LOGIN VIEW
    // ==========================================
    private var loginView: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 24) {
                Spacer().frame(height: 30)

                // Branding Header with Official Logo
                VStack(spacing: 12) {
                    HStack(spacing: 12) {
                        Image("logo-icon")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 56, height: 56)
                            .cornerRadius(12)
                            .shadow(color: MedMargTheme.primaryTeal.opacity(0.2), radius: 6, x: 0, y: 3)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("MedMarg")
                                .font(.system(size: 32, weight: .bold, design: .rounded))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text("HEALTH & DIAGNOSTICS")
                                .font(.system(size: 11, weight: .heavy))
                                .foregroundColor(MedMargTheme.accentEmerald)
                                .tracking(1.2)
                        }
                    }

                    Text("Multi-Lab Diagnostic & Open Healthcare Platform")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(MedMargTheme.slate500)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)

                    // Current City Location Badge
                    Button(action: { showCityPicker = true }) {
                        HStack(spacing: 6) {
                            Image(systemName: "location.fill")
                                .font(.system(size: 12))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text(currentCity)
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(MedMargTheme.darkTeal)
                            Image(systemName: "chevron.down")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(MedMargTheme.lightTeal)
                        .cornerRadius(20)
                    }
                }

                // Sign In Form Card
                VStack(alignment: .leading, spacing: 18) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Sign In to Your Account")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Enter credentials or choose a quick demo profile")
                            .font(.system(size: 13))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    if !errorMessage.isEmpty {
                        HStack(spacing: 8) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.red)
                            Text(errorMessage)
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(.red)
                        }
                        .padding(10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(8)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Username, Email or Mobile")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(MedMargTheme.slate700)
                        
                        HStack {
                            Image(systemName: "person.fill")
                                .foregroundColor(MedMargTheme.primaryTeal)
                            TextField("e.g. patient, doctor, admin", text: $usernameInput)
                                .autocapitalization(.none)
                        }
                        .padding(14)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(10)
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Password")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(MedMargTheme.slate700)

                        HStack {
                            Image(systemName: "lock.fill")
                                .foregroundColor(MedMargTheme.primaryTeal)
                            
                            if isPasswordVisible {
                                TextField("Enter password", text: $passwordInput)
                                    .autocapitalization(.none)
                            } else {
                                SecureField("Enter password", text: $passwordInput)
                            }

                            Button(action: { isPasswordVisible.toggle() }) {
                                Image(systemName: isPasswordVisible ? "eye.slash.fill" : "eye.fill")
                                    .foregroundColor(MedMargTheme.slate500)
                            }
                        }
                        .padding(14)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(10)
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
                    }

                    Button(action: handleLogin) {
                        HStack {
                            Text("Sign In")
                                .font(.system(size: 16, weight: .bold))
                            Image(systemName: "arrow.right")
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(12)
                        .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 6, x: 0, y: 3)
                    }

                    // Divider
                    HStack {
                        VStack { Divider() }
                        Text("OR CONTINUE WITH")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                            .padding(.horizontal, 8)
                        VStack { Divider() }
                    }
                    .padding(.vertical, 4)

                    // 2. REQUIREMENT: 3 Social Sign In Buttons in Single Compact Horizontal Row
                    HStack(spacing: 16) {
                        // Apple Button
                        Button(action: { quickDemoLogin(role: .patient) }) {
                            HStack(spacing: 6) {
                                Image(systemName: "apple.logo")
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundColor(.white)
                                Text("Apple")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(.white)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color.black)
                            .cornerRadius(10)
                        }

                        // Google Button
                        Button(action: { quickDemoLogin(role: .patient) }) {
                            HStack(spacing: 6) {
                                Text("G")
                                    .font(.system(size: 16, weight: .black))
                                    .foregroundColor(Color(red: 0.86, green: 0.25, blue: 0.20))
                                Text("Google")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(MedMargTheme.slate900)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color.white)
                            .cornerRadius(10)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
                        }

                        // Facebook Button
                        Button(action: { quickDemoLogin(role: .patient) }) {
                            HStack(spacing: 6) {
                                Text("f")
                                    .font(.system(size: 16, weight: .bold, design: .serif))
                                    .foregroundColor(.white)
                                Text("Facebook")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(.white)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color(red: 0.09, green: 0.47, blue: 0.95))
                            .cornerRadius(10)
                        }
                    }

                    // Quick Demo Credentials Selector
                    VStack(alignment: .leading, spacing: 8) {
                        Text("QUICK DEMO ONE-TAP LOGIN:")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(UserRole.allCases) { role in
                                    Button(action: { quickDemoLogin(role: role) }) {
                                        HStack(spacing: 4) {
                                            Image(systemName: role.iconName)
                                                .font(.system(size: 11))
                                            Text(role.rawValue)
                                                .font(.system(size: 11, weight: .bold))
                                        }
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 6)
                                        .background(MedMargTheme.lightTeal)
                                        .foregroundColor(MedMargTheme.primaryTeal)
                                        .cornerRadius(8)
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(20)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(20)
                .shadow(color: Color.black.opacity(0.04), radius: 12, x: 0, y: 6)
                .padding(.horizontal, 20)

                Spacer().frame(height: 20)
            }
        }
        .sheet(isPresented: $showCityPicker) {
            cityPickerSheet
        }
    }

    // ==========================================
    // 🔝 INDUSTRY-STANDARD REDESIGNED TOP BAR
    // ==========================================
    private func appTopBar(user: UserProfile) -> some View {
        HStack(spacing: 12) {
            // 3. REQUIREMENT: Sidebar Hamburger Button
            Button(action: { withAnimation { showSidebar.toggle() } }) {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(8)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(10)
            }

            // Topbar Location & Brand Title
            VStack(alignment: .leading, spacing: 1) {
                Text("Serving in")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)
                
                Button(action: { showCityPicker = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "location.fill")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.primaryTeal)
                        Text(currentCity)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                            .lineLimit(1)
                        Image(systemName: "chevron.down")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }
            }

            Spacer()

            // Cart Icon with Badge
            Button(action: { showCartSheet = true }) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "cart.fill")
                        .font(.system(size: 18))
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .padding(8)
                        .background(MedMargTheme.lightTeal)
                        .cornerRadius(10)

                    if !cartItems.isEmpty {
                        Text("\(cartItems.count)")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white)
                            .padding(4)
                            .background(Color.red)
                            .clipShape(Circle())
                            .offset(x: 4, y: -4)
                    }
                }
            }

            // User Profile Avatar
            Button(action: { withAnimation { showSidebar.toggle() } }) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.primaryTeal)
                        .frame(width: 34, height: 34)
                    Text(String(user.name.prefix(1)))
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(MedMargTheme.pureWhite)
        .shadow(color: Color.black.opacity(0.03), radius: 4, x: 0, y: 2)
    }

    // ==========================================
    // 🚪 SIDEBAR NAVIGATION DRAWER OVERLAY
    // ==========================================
    private func sidebarDrawerOverlay(user: UserProfile) -> some View {
        ZStack(alignment: .leading) {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture {
                    withAnimation { showSidebar = false }
                }

            VStack(alignment: .leading, spacing: 0) {
                // User Profile Header in Sidebar
                VStack(alignment: .leading, spacing: 12) {
                    HStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(MedMargTheme.primaryTeal)
                                .frame(width: 50, height: 50)
                            Text(String(user.name.prefix(1)))
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(.white)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(user.name)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text(user.email)
                                .font(.system(size: 12))
                                .foregroundColor(MedMargTheme.slate500)
                            
                            Text(user.role.displayName)
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(MedMargTheme.lightTeal)
                                .cornerRadius(6)
                        }
                    }

                    Divider()
                }
                .padding(20)
                .background(MedMargTheme.slate50)

                // Navigation Items
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("QUICK NAVIGATION")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                            .padding(.horizontal, 20)
                            .padding(.top, 12)

                        sidebarItem(icon: "house.fill", title: "Home Dashboard", active: selectedTab == 0) {
                            selectedTab = 0
                            showSidebar = false
                        }
                        sidebarItem(icon: "flask.fill", title: "Labs & Pathology Catalog", active: selectedTab == 1) {
                            selectedTab = 1
                            showSidebar = false
                        }
                        sidebarItem(icon: "location.fill.viewfinder", title: "Live Phlebotomist Tracker", active: selectedTab == 2) {
                            selectedTab = 2
                            showSidebar = false
                        }
                        sidebarItem(icon: "doc.text.fill", title: "Prescriptions & Records", active: selectedTab == 3) {
                            selectedTab = 3
                            showSidebar = false
                        }

                        Divider().padding(.vertical, 8)

                        Text("ROLE SWITCHER (DEMO)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                            .padding(.horizontal, 20)

                        ForEach(UserRole.allCases) { role in
                            sidebarItem(icon: role.iconName, title: role.displayName, active: user.role == role) {
                                quickDemoLogin(role: role)
                                showSidebar = false
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }

                Spacer()

                // Logout Footer Button
                Button(action: {
                    showSidebar = false
                    logout()
                }) {
                    HStack(spacing: 10) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                            .foregroundColor(.red)
                        Text("Sign Out")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.red)
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.red.opacity(0.05))
                }
            }
            .frame(width: 300)
            .background(MedMargTheme.pureWhite)
            .shadow(color: Color.black.opacity(0.2), radius: 10, x: 5, y: 0)
            .transition(.move(edge: .leading))
        }
    }

    private func sidebarItem(icon: String, title: String, active: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(active ? MedMargTheme.primaryTeal : MedMargTheme.slate700)
                    .frame(width: 24)
                Text(title)
                    .font(.system(size: 14, weight: active ? .bold : .medium))
                    .foregroundColor(active ? MedMargTheme.primaryTeal : MedMargTheme.slate900)
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(active ? MedMargTheme.lightTeal : Color.clear)
            .cornerRadius(8)
        }
    }

    // ==========================================
    // 📱 PATIENT BODY VIEW & REDESIGNED NAVBAR
    // ==========================================
    private var patientBodyView: some View {
        VStack(spacing: 0) {
            // Main Tab Content
            Group {
                switch selectedTab {
                case 0:
                    patientHomeTab
                case 1:
                    patientLabsCatalogTab
                case 2:
                    patientLiveTrackTab
                case 3:
                    patientDocsAndProfileTab
                default:
                    patientHomeTab
                }
            }

            // 4. REQUIREMENT: Redesigned Bottom Navbar (Home, Labs & Tests, Track [Creative], Docs & Profile)
            HStack {
                // Tab 0: Home
                bottomNavTab(index: 0, icon: "house.fill", title: "Home")

                // Tab 1: Labs & Tests
                bottomNavTab(index: 1, icon: "flask.fill", title: "Labs & Tests")

                // Tab 2: Track (CREATIVE & ATTRACTIVE HIGHLIGHTED TAB)
                Button(action: { selectedTab = 2 }) {
                    VStack(spacing: 2) {
                        ZStack {
                            Circle()
                                .fill(LinearGradient(colors: [MedMargTheme.primaryTeal, MedMargTheme.accentEmerald], startPoint: .topLeading, endPoint: .bottomTrailing))
                                .frame(width: 44, height: 44)
                                .shadow(color: MedMargTheme.accentEmerald.opacity(0.4), radius: 8, x: 0, y: 3)

                            Image(systemName: "location.fill.viewfinder")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(.white)

                            // Live Indicator Badge
                            Circle()
                                .fill(Color.red)
                                .frame(width: 10, height: 10)
                                .overlay(Circle().stroke(Color.white, lineWidth: 2))
                                .offset(x: 14, y: -14)
                        }

                        Text("Track")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(selectedTab == 2 ? MedMargTheme.primaryTeal : MedMargTheme.slate700)
                    }
                    .frame(maxWidth: .infinity)
                }

                // Tab 3: Docs & Profile
                bottomNavTab(index: 3, icon: "doc.text.fill", title: "Docs & Profile")
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 16)
            .background(MedMargTheme.pureWhite)
            .shadow(color: Color.black.opacity(0.06), radius: 10, x: 0, y: -4)
        }
    }

    private func bottomNavTab(index: Int, icon: String, title: String) -> some View {
        Button(action: { selectedTab = index }) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(selectedTab == index ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                Text(title)
                    .font(.system(size: 11, weight: selectedTab == index ? .bold : .medium))
                    .foregroundColor(selectedTab == index ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
            }
            .frame(maxWidth: .infinity)
        }
    }

    // ==========================================
    // 🏠 PATIENT HOME TAB (WEB MODULE PARITY)
    // ==========================================
    private var patientHomeTab: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                // Hero Promotional Banner (Web Module Parity)
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("FLAT 57% OFF")
                            .font(.system(size: 11, weight: .black))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(MedMargTheme.amberGold)
                            .foregroundColor(MedMargTheme.slate900)
                            .cornerRadius(6)

                        Spacer()

                        HStack(spacing: 4) {
                            Image(systemName: "bolt.fill")
                                .font(.system(size: 11))
                            Text("60-Min Phlebo Visit")
                                .font(.system(size: 11, weight: .bold))
                        }
                        .foregroundColor(.white)
                    }

                    Text("Thyrocare Aarogyam Complete 1.3")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)

                    Text("104 Vital Biomarkers • Thyroid, Lipid, Liver, Kidney, Vitamin D & CBC")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.lightTeal)

                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("₹1,499")
                                .font(.system(size: 22, weight: .black))
                                .foregroundColor(MedMargTheme.amberGold)
                            Text("MRP: ₹3,500")
                                .font(.system(size: 11))
                                .foregroundColor(.white.opacity(0.7))
                                .strikethrough()
                        }

                        Spacer()

                        Button(action: {
                            cartItems.append(CartItem(id: UUID().uuidString, title: "Aarogyam Complete 1.3", subtitle: "104 Biomarkers", provider: "Thyrocare Direct", price: 1499, mrp: 3500, type: "Lab Package"))
                            showCartSheet = true
                        }) {
                            Text("+ Book Now")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(MedMargTheme.darkTeal)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(Color.white)
                                .cornerRadius(8)
                        }
                    }
                }
                .padding(16)
                .background(LinearGradient(colors: [MedMargTheme.primaryTeal, MedMargTheme.darkTeal], startPoint: .topLeading, endPoint: .bottomTrailing))
                .cornerRadius(16)
                .padding(.horizontal, 16)
                .padding(.top, 12)

                // Category Quick Pills
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        quickCategoryPill(icon: "flask.fill", title: "Labs", color: Color.orange) { selectedTab = 1 }
                        quickCategoryPill(icon: "waveform.path.ecg.rectangle", title: "3.0T MRI", color: Color.blue) { selectedTab = 1 }
                        quickCategoryPill(icon: "stethoscope", title: "Doctors", color: Color.purple) { }
                        quickCategoryPill(icon: "pills.fill", title: "Generics", color: Color.green) { }
                    }
                    .padding(.horizontal, 16)
                }

                // Live Tracking Phlebotomist Banner
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        HStack(spacing: 6) {
                            Circle()
                                .fill(Color.green)
                                .frame(width: 8, height: 8)
                            Text("Phlebotomist Enroute")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.accentEmerald)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(MedMargTheme.emeraldLight)
                        .cornerRadius(6)

                        Spacer()

                        Text("ETA: 25 Mins")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }

                    Text("Rajesh Kumar (NABL Certified Sample Collector)")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("Home Pickup Address: Plot 42, Air Bypass Road, Tirupati")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate500)

                    Button(action: { selectedTab = 2 }) {
                        HStack {
                            Image(systemName: "location.fill")
                            Text("Track Phlebotomist on Live Map")
                                .font(.system(size: 13, weight: .bold))
                        }
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(MedMargTheme.lightTeal)
                        .cornerRadius(8)
                    }
                }
                .padding(14)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.emeraldLight, lineWidth: 1.5))
                .padding(.horizontal, 16)

                // Popular Pathology Tests Section (Web Data Parity)
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Popular Pathology Tests")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Spacer()
                        Button(action: { selectedTab = 1 }) {
                            Text("See All \(WEB_THYROCARE_TESTS.count)+ Tests")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }
                    }
                    .padding(.horizontal, 16)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(Array(WEB_THYROCARE_TESTS.prefix(5))) { test in
                                testCardView(test: test)
                            }
                        }
                        .padding(.horizontal, 16)
                    }
                }

                // Doctor Prescriptions Section
                VStack(alignment: .leading, spacing: 10) {
                    Text("Doctor Prescriptions for You")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                        .padding(.horizontal, 16)

                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Dr. Ananya Sharma, MD")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)
                                Text("MedMarg Care Clinic, Air Bypass Rd, Tirupati")
                                    .font(.system(size: 11))
                                    .foregroundColor(MedMargTheme.slate500)
                            }
                            Spacer()
                            Text("Prescription Active")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                                .padding(6)
                                .background(MedMargTheme.lightTeal)
                                .cornerRadius(6)
                        }

                        Text("Prescribed: Thyroid Profile Total + Complete Lipid Profile")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(MedMargTheme.darkTeal)
                    }
                    .padding(14)
                    .background(MedMargTheme.pureWhite)
                    .cornerRadius(12)
                    .padding(.horizontal, 16)
                }

                Spacer().frame(height: 20)
            }
        }
        .background(MedMargTheme.slate50)
    }

    private func quickCategoryPill(icon: String, title: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(color.opacity(0.12))
                        .frame(width: 50, height: 50)
                    Image(systemName: icon)
                        .font(.system(size: 20))
                        .foregroundColor(color)
                }
                Text(title)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(MedMargTheme.slate900)
            }
            .frame(width: 75)
        }
    }

    private func testCardView(test: LabTestItem) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(test.yellowTag)
                .font(.system(size: 9, weight: .bold))
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(MedMargTheme.amberLight)
                .foregroundColor(MedMargTheme.amberGold)
                .cornerRadius(4)

            Text(test.name)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)
                .lineLimit(2)
                .frame(height: 34, alignment: .topLeading)

            Text("\(test.params) Parameters • \(test.tat) TAT")
                .font(.system(size: 11))
                .foregroundColor(MedMargTheme.slate500)

            HStack {
                VStack(alignment: .leading, spacing: 1) {
                    Text("₹\(test.thyrocarePrice)")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text("₹\(test.mrp)")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.slate500)
                        .strikethrough()
                }

                Spacer()

                Button(action: {
                    cartItems.append(CartItem(id: UUID().uuidString, title: test.name, subtitle: "\(test.params) Parameters", provider: "Thyrocare Direct", price: test.thyrocarePrice, mrp: test.mrp, type: "Lab Test"))
                    showCartSheet = true
                }) {
                    Text("+ Add")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(6)
                }
            }
        }
        .padding(12)
        .frame(width: 170)
        .background(MedMargTheme.pureWhite)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 3)
    }

    // ==========================================
    // 🧪 PATIENT LABS & TESTS CATALOG TAB
    // ==========================================
    private var patientLabsCatalogTab: some View {
        VStack(spacing: 0) {
            // Category Filter Scroll
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(WEB_THYROCARE_CATEGORIES, id: \.self) { cat in
                        Button(action: { selectedCategory = cat }) {
                            Text(cat)
                                .font(.system(size: 12, weight: selectedCategory == cat ? .bold : .medium))
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(selectedCategory == cat ? MedMargTheme.primaryTeal : MedMargTheme.pureWhite)
                                .foregroundColor(selectedCategory == cat ? .white : MedMargTheme.slate700)
                                .cornerRadius(20)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
            }
            .background(MedMargTheme.slate50)

            // Tests List (Showing exact Web data filtered)
            ScrollView(showsIndicators: false) {
                VStack(spacing: 12) {
                    let filtered = WEB_THYROCARE_TESTS.filter {
                        selectedCategory == "All Tests & Packages" || $0.category == selectedCategory
                    }

                    ForEach(filtered) { test in
                        HStack(spacing: 12) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(test.name)
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)

                                Text(test.description)
                                    .font(.system(size: 11))
                                    .foregroundColor(MedMargTheme.slate500)
                                    .lineLimit(2)

                                HStack(spacing: 8) {
                                    Text("Thyrocare: ₹\(test.thyrocarePrice)")
                                        .font(.system(size: 12, weight: .bold))
                                        .foregroundColor(MedMargTheme.primaryTeal)
                                    Text("Apollo: ₹\(test.apolloPrice)")
                                        .font(.system(size: 11))
                                        .foregroundColor(MedMargTheme.slate500)
                                    Text("Lal: ₹\(test.lalPrice)")
                                        .font(.system(size: 11))
                                        .foregroundColor(MedMargTheme.slate500)
                                }
                            }

                            Spacer()

                            Button(action: {
                                cartItems.append(CartItem(id: UUID().uuidString, title: test.name, subtitle: "\(test.params) Parameters", provider: "Thyrocare Direct", price: test.thyrocarePrice, mrp: test.mrp, type: "Lab Test"))
                                showCartSheet = true
                            }) {
                                Text("+ Add")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(MedMargTheme.primaryTeal)
                                    .cornerRadius(8)
                            }
                        }
                        .padding(14)
                        .background(MedMargTheme.pureWhite)
                        .cornerRadius(12)
                    }
                }
                .padding(16)
            }
        }
    }

    // ==========================================
    // 📍 PATIENT LIVE TRACK TAB (CREATIVE & ATTRACTIVE)
    // ==========================================
    private var patientLiveTrackTab: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                // Radar Live Animation Header
                VStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(MedMargTheme.lightTeal)
                            .frame(width: 80, height: 80)
                        Circle()
                            .stroke(MedMargTheme.primaryTeal.opacity(0.3), lineWidth: 2)
                            .frame(width: 100, height: 100)
                        Image(systemName: "location.fill.viewfinder")
                            .font(.system(size: 36, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }

                    Text("Live Sample Phlebotomist Tracker")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("Real-time GPS tracking for home sample pickup in Tirupati")
                        .font(.system(size: 13))
                        .foregroundColor(MedMargTheme.slate500)
                }
                .padding(.top, 20)

                // Phlebotomist Status Card
                VStack(alignment: .leading, spacing: 14) {
                    HStack {
                        ZStack {
                            Circle().fill(MedMargTheme.primaryTeal).frame(width: 44, height: 44)
                            Image(systemName: "person.fill").foregroundColor(.white).font(.system(size: 20))
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Rajesh Kumar")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Senior Certified Phlebotomist • AG-01")
                                .font(.system(size: 12))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Button(action: {}) {
                            Image(systemName: "phone.fill")
                                .foregroundColor(.white)
                                .padding(10)
                                .background(MedMargTheme.accentEmerald)
                                .clipShape(Circle())
                        }
                    }

                    Divider()

                    // Step Tracker
                    VStack(alignment: .leading, spacing: 12) {
                        trackStepItem(step: "1", title: "Order Confirmed & Lab Assigned", done: true)
                        trackStepItem(step: "2", title: "Phlebotomist Enroute to Air Bypass Rd", done: true)
                        trackStepItem(step: "3", title: "Sample Collection & Barcode Scan", done: false)
                        trackStepItem(step: "4", title: "In-Transit to Thyrocare NABL Lab", done: false)
                    }
                }
                .padding(16)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(16)
                .padding(.horizontal, 16)
            }
        }
    }

    private func trackStepItem(step: String, title: String, done: Bool) -> some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(done ? MedMargTheme.primaryTeal : MedMargTheme.slate200)
                    .frame(width: 24, height: 24)
                Text(step)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(done ? .white : MedMargTheme.slate500)
            }

            Text(title)
                .font(.system(size: 13, weight: done ? .bold : .regular))
                .foregroundColor(done ? MedMargTheme.slate900 : MedMargTheme.slate500)
        }
    }

    // ==========================================
    // 📋 PATIENT DOCS & PROFILE TAB
    // ==========================================
    private var patientDocsAndProfileTab: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                // Profile Header Card
                if let user = loggedInUser {
                    VStack(spacing: 10) {
                        ZStack {
                            Circle().fill(MedMargTheme.primaryTeal).frame(width: 64, height: 64)
                            Text(String(user.name.prefix(1)))
                                .font(.system(size: 26, weight: .bold))
                                .foregroundColor(.white)
                        }

                        Text(user.name)
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)

                        Text(user.email)
                            .font(.system(size: 13))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity)
                    .background(MedMargTheme.pureWhite)
                    .cornerRadius(16)
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
                }

                // Health Records & PDF Reports Section
                VStack(alignment: .leading, spacing: 12) {
                    Text("Health Records & Lab Reports")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    docReportCard(title: "Aarogyam Complete 1.3 Report", date: "15-Aug-2026", lab: "Thyrocare NABL Lab")
                    docReportCard(title: "Thyroid Profile Total Report", date: "02-Jul-2026", lab: "Apollo Diagnostics")
                }
                .padding(.horizontal, 16)
            }
        }
    }

    private func docReportCard(title: String, date: String, lab: String) -> some View {
        HStack {
            Image(systemName: "doc.text.fill")
                .font(.system(size: 24))
                .foregroundColor(MedMargTheme.primaryTeal)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Text("\(lab) • \(date)")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
            }

            Spacer()

            Image(systemName: "arrow.down.circle.fill")
                .font(.system(size: 20))
                .foregroundColor(MedMargTheme.primaryTeal)
        }
        .padding(12)
        .background(MedMargTheme.pureWhite)
        .cornerRadius(10)
    }

    // ==========================================
    // 🏙️ CITY PICKER SHEET
    // ==========================================
    private var cityPickerSheet: some View {
        VStack(spacing: 16) {
            Text("Select Your City")
                .font(.system(size: 18, weight: .bold))
                .padding(.top, 20)

            List(WEB_CITIES, id: \.self) { city in
                Button(action: {
                    currentCity = city
                    showCityPicker = false
                }) {
                    HStack {
                        Text(city)
                            .foregroundColor(currentCity == city ? MedMargTheme.primaryTeal : MedMargTheme.slate900)
                            .font(.system(size: 15, weight: currentCity == city ? .bold : .medium))
                        Spacer()
                        if currentCity == city {
                            Image(systemName: "checkmark")
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }
                    }
                }
            }
        }
    }

    // ==========================================
    // 🛒 CART VIEW SHEET
    // ==========================================
    private var cartViewSheet: some View {
        VStack(spacing: 16) {
            HStack {
                Text("Your Healthcare Cart")
                    .font(.system(size: 18, weight: .bold))
                Spacer()
                Button("Close") { showCartSheet = false }
            }
            .padding(20)

            if cartItems.isEmpty {
                Text("Your cart is empty")
                    .foregroundColor(MedMargTheme.slate500)
                    .padding(40)
            } else {
                List(cartItems) { item in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.title)
                                .font(.system(size: 14, weight: .bold))
                            Text(item.provider)
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        Spacer()
                        Text("₹\(item.price)")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }

                Button(action: {
                    cartItems.removeAll()
                    showCartSheet = false
                }) {
                    Text("Proceed to Checkout")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(12)
                        .padding(20)
                }
            }
        }
    }

    // ==========================================
    // 🔑 AUTHENTICATION & DEMO LOGIC
    // ==========================================
    private func handleLogin() {
        let trimmed = usernameInput.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if trimmed.isEmpty {
            errorMessage = "Please enter username or email"
            return
        }

        if let match = users.first(where: { $0.username.lowercased() == trimmed || $0.email.lowercased() == trimmed }) {
            loggedInUser = match
            errorMessage = ""
        } else {
            // Default fallback to patient
            quickDemoLogin(role: .patient)
        }
    }

    private func quickDemoLogin(role: UserRole) {
        if let match = users.first(where: { $0.role == role }) {
            loggedInUser = match
            errorMessage = ""
        }
    }

    private func logout() {
        loggedInUser = nil
        usernameInput = ""
        passwordInput = ""
        errorMessage = ""
    }
}

// =========================================================================
// 🧑‍⚕️ WORKDESK VIEWS FOR DOCTOR, ADMIN, LAB, RADIOLOGY, PHARMACY, FLEET
// =========================================================================
struct DoctorWorkdeskView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Doctor OPD Workdesk")
                    .font(.system(size: 20, weight: .bold))
                    .padding(.horizontal, 16)
                    .padding(.top, 16)

                Text("Manage walk-in consultations, digital prescriptions, and direct lab test orders.")
                    .font(.system(size: 13))
                    .foregroundColor(MedMargTheme.slate500)
                    .padding(.horizontal, 16)
            }
        }
    }
}

struct AdminConsoleView: View {
    @Binding var users: [UserProfile]
    let onLogout: () -> Void

    // Navigation & Filters
    @State private var activeTab: Int = 0 // 0: Overview, 1: Users & Access, 2: Tests & Catalog, 3: Partner Labs, 4: Fleet & Cold-Chain
    @State private var searchQuery: String = ""
    @State private var roleFilter: String = "ALL"

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
            // Header Bar
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Image(systemName: "shield.fill")
                            .foregroundColor(MedMargTheme.primaryTeal)
                        Text("Super Admin Governance")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                    }
                    Text("Central Platform Control • Multi-Lab Agreements & Telemetry")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Button(action: onLogout) {
                    HStack(spacing: 4) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                        Text("Logout")
                    }
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.red)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color.red.opacity(0.1))
                    .cornerRadius(8)
                }
            }
            .padding(16)
            .background(MedMargTheme.pureWhite)

            // Sub-Tab Selector Pills
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    adminSubTabPill(index: 0, title: "Overview", icon: "chart.bar.fill")
                    adminSubTabPill(index: 1, title: "Users & Access (\(users.count))", icon: "person.2.fill")
                    adminSubTabPill(index: 2, title: "Tests & Catalog (\(testsList.count))", icon: "flask.fill")
                    adminSubTabPill(index: 3, title: "Partner Labs (\(labPartners.count))", icon: "building.2.fill")
                    adminSubTabPill(index: 4, title: "Fleet & Cold-Chain", icon: "car.fill")
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
            }
            .background(MedMargTheme.slate50)

            // Active Tab Content
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    switch activeTab {
                    case 0:
                        adminOverviewSection
                    case 1:
                        adminUsersSection
                    case 2:
                        adminTestsSection
                    case 3:
                        adminLabsSection
                    case 4:
                        adminFleetSection
                    default:
                        adminOverviewSection
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

    private func adminSubTabPill(index: Int, title: String, icon: String) -> some View {
        Button(action: { activeTab = index }) {
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

    // ==========================================
    // 📊 TAB 0: OVERVIEW & SYSTEM METRICS
    // ==========================================
    private var adminOverviewSection: some View {
        VStack(spacing: 16) {
            // Live Status Banner
            HStack {
                HStack(spacing: 8) {
                    Circle().fill(Color.green).frame(width: 10, height: 10)
                    Text("Central Processing Hub Online")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.darkTeal)
                }
                Spacer()
                Text("NABL Sync Active")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
            .padding(12)
            .background(MedMargTheme.lightTeal)
            .cornerRadius(10)

            // Metrics 2x2 Grid
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                adminMetricCard(title: "Revenue Today", value: "₹4,82,500", trend: "+14.2% vs yesterday", icon: "indianrupeesign.circle.fill", color: Color.green)
                adminMetricCard(title: "Lab Bookings", value: "1,420 Orders", trend: "104 Full Checkups", icon: "doc.plaintext.fill", color: Color.blue)
                adminMetricCard(title: "NABL Labs", value: "14 Partners", trend: "100% Compliant", icon: "building.2.fill", color: Color.purple)
                adminMetricCard(title: "On-Duty Fleet", value: "32 Agents", trend: "Avg Temp: 4.2°C", icon: "truck.box.fill", color: Color.orange)
            }

            // Platform Activity Stream
            VStack(alignment: .leading, spacing: 12) {
                Text("Recent System Activity")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                adminActivityRow(icon: "checkmark.circle.fill", color: .green, title: "Thyrocare Price Sync Completed", subtitle: "104 test parameters updated across Tirupati hub", time: "10 mins ago")
                adminActivityRow(icon: "person.crop.circle.badge.plus", color: .blue, title: "New Doctor Onboarded", subtitle: "Dr. Ananya Sharma MD verified for OPD token booking", time: "25 mins ago")
                adminActivityRow(icon: "building.badge.gearshape.fill", color: .purple, title: "Lab Onboarding Requested", subtitle: "Star Diagnostics submitted NABL license for review", time: "1 hour ago")
            }
            .padding(14)
            .background(MedMargTheme.pureWhite)
            .cornerRadius(12)
        }
    }

    private func adminMetricCard(title: String, value: String, trend: String, icon: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
                Spacer()
            }

            Text(value)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            Text(title)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(MedMargTheme.slate500)

            Text(trend)
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(color)
        }
        .padding(14)
        .background(MedMargTheme.pureWhite)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 2)
    }

    private func adminActivityRow(icon: String, color: Color, title: String, subtitle: String, time: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(color)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Text(subtitle)
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
            }

            Spacer()

            Text(time)
                .font(.system(size: 10))
                .foregroundColor(MedMargTheme.slate500)
        }
        .padding(.vertical, 6)
    }

    // ==========================================
    // 👥 TAB 1: USERS & ACCESS MANAGEMENT
    // ==========================================
    private var adminUsersSection: some View {
        VStack(spacing: 12) {
            // Action & Search Header
            HStack {
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(MedMargTheme.slate500)
                    TextField("Search users by name, email, role...", text: $searchQuery)
                        .autocapitalization(.none)
                }
                .padding(10)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(10)

                Button(action: { showAddUserSheet = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                        Text("Add User")
                    }
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(10)
                }
            }

            // Role Filter Pills
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    roleFilterPill(roleKey: "ALL", label: "All Users")
                    ForEach(UserRole.allCases) { role in
                        roleFilterPill(roleKey: role.rawValue, label: role.rawValue)
                    }
                }
            }

            // Users List
            let filteredUsers = users.filter { user in
                (roleFilter == "ALL" || user.role.rawValue == roleFilter) &&
                (searchQuery.isEmpty || user.name.localizedCaseInsensitiveContains(searchQuery) || user.email.localizedCaseInsensitiveContains(searchQuery) || user.username.localizedCaseInsensitiveContains(searchQuery))
            }

            ForEach(filteredUsers) { user in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        ZStack {
                            Circle().fill(MedMargTheme.primaryTeal.opacity(0.15)).frame(width: 40, height: 40)
                            Text(String(user.name.prefix(1)))
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            HStack(spacing: 6) {
                                Text(user.name)
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)

                                Text(user.role.rawValue)
                                    .font(.system(size: 9, weight: .bold))
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(MedMargTheme.lightTeal)
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                    .cornerRadius(4)
                            }

                            Text("@\(user.username) • \(user.email)")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Text(user.status)
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(user.status == "Active" ? .green : .red)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(user.status == "Active" ? Color.green.opacity(0.1) : Color.red.opacity(0.1))
                            .cornerRadius(6)
                    }

                    Text("Org/Address: \(user.organization)")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate700)

                    Divider()

                    // Action Controls
                    HStack {
                        Button(action: { toggleUserStatus(userId: user.id) }) {
                            Text(user.status == "Active" ? "Suspend Account" : "Activate Account")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(user.status == "Active" ? .red : .green)
                        }

                        Spacer()

                        Button(action: { deleteUser(userId: user.id) }) {
                            Image(systemName: "trash.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.red)
                        }
                    }
                }
                .padding(14)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(12)
            }
        }
    }

    private func roleFilterPill(roleKey: String, label: String) -> some View {
        Button(action: { roleFilter = roleKey }) {
            Text(label)
                .font(.system(size: 11, weight: roleFilter == roleKey ? .bold : .medium))
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(roleFilter == roleKey ? MedMargTheme.primaryTeal : MedMargTheme.pureWhite)
                .foregroundColor(roleFilter == roleKey ? .white : MedMargTheme.slate700)
                .cornerRadius(14)
        }
    }

    // ==========================================
    // 🧪 TAB 2: TESTS & CATALOG MANAGEMENT
    // ==========================================
    private var adminTestsSection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Diagnostic Tests & Packages Catalog")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Spacer()

                Button(action: { showAddTestSheet = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                        Text("Add Test")
                    }
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(8)
                }
            }

            ForEach(testsList) { test in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(test.name)
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("\(test.category) • \(test.params) Parameters")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        Spacer()
                        Text(test.yellowTag)
                            .font(.system(size: 9, weight: .bold))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(MedMargTheme.amberLight)
                            .foregroundColor(MedMargTheme.amberGold)
                            .cornerRadius(4)
                    }

                    // Multi-Lab Negotiated Pricing Bar
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 1) {
                            Text("Thyrocare Rate")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                            Text("₹\(test.thyrocarePrice)")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }

                        VStack(alignment: .leading, spacing: 1) {
                            Text("Apollo Price")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                            Text("₹\(test.apolloPrice)")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(MedMargTheme.slate700)
                        }

                        VStack(alignment: .leading, spacing: 1) {
                            Text("Lal Path Price")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                            Text("₹\(test.lalPrice)")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(MedMargTheme.slate700)
                        }

                        Spacer()

                        Button(action: {
                            testsList.removeAll(where: { $0.id == test.id })
                        }) {
                            Image(systemName: "trash")
                                .foregroundColor(.red)
                                .font(.system(size: 14))
                        }
                    }
                    .padding(8)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(8)
                }
                .padding(14)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(12)
            }
        }
    }

    // ==========================================
    // 🏥 TAB 3: PARTNER LABS & ONBOARDING
    // ==========================================
    private var adminLabsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Active Labs
            Text("Active NABL Diagnostic Lab Partners")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            ForEach(labPartners) { lab in
                HStack(spacing: 12) {
                    Image(systemName: "building.2.crop.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(lab.name)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("\(lab.type) • \(lab.city)")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                        Text("Accreditation: \(lab.nabl) • Commission Margin: \(lab.margin)")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }

                    Spacer()
                }
                .padding(14)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(12)
            }

            // Onboarding Requests
            Text("Pending Onboarding Applications (\(pendingLabRequests.count))")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            ForEach(pendingLabRequests) { req in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(req.name)
                                .font(.system(size: 14, weight: .bold))
                            Text("Applicant: \(req.applicant) • \(req.city)")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        Spacer()
                        Text("UNDER REVIEW")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.orange)
                            .padding(4)
                            .background(Color.orange.opacity(0.1))
                            .cornerRadius(4)
                    }

                    HStack {
                        Button(action: {
                            labPartners.append(LabPartner(id: req.id, name: req.name, type: "Approved Partner Lab", city: req.city, nabl: req.license, status: "ACTIVE", margin: "15%", testsCount: req.testsOffered))
                            pendingLabRequests.removeAll(where: { $0.id == req.id })
                        }) {
                            Text("Approve & Onboard")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.green)
                                .cornerRadius(6)
                        }

                        Button(action: {
                            pendingLabRequests.removeAll(where: { $0.id == req.id })
                        }) {
                            Text("Reject Application")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.red)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.red.opacity(0.1))
                                .cornerRadius(6)
                        }
                    }
                }
                .padding(14)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(12)
            }
        }
    }

    // ==========================================
    // 🚚 TAB 4: FLEET & COLD CHAIN IOT
    // ==========================================
    private var adminFleetSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Field Collection Fleet & Cold-Chain Telemetry")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            ForEach(fleetAgents) { agent in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(agent.name) (\(agent.id))")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Assigned Zone: \(agent.area)")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Text(agent.temp)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.darkTeal)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(MedMargTheme.emeraldLight)
                            .cornerRadius(6)
                    }

                    HStack(spacing: 16) {
                        Text("Samples Today: \(agent.samplesToday)")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        Text("IOT Battery: \(agent.battery)")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)

                        Spacer()

                        Text(agent.status)
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.slate700)
                    }
                }
                .padding(14)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(12)
            }
        }
    }

    // ==========================================
    // 📄 ADD USER MODAL SHEET
    // ==========================================
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

    // ==========================================
    // 📄 ADD TEST MODAL SHEET
    // ==========================================
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

    // Helpers
    private func toggleUserStatus(userId: String) {
        if let idx = users.firstIndex(where: { $0.id == userId }) {
            users[idx].status = (users[idx].status == "Active") ? "Suspended" : "Active"
        }
    }

    private func deleteUser(userId: String) {
        users.removeAll(where: { $0.id == userId })
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
        newTestLalPrice = ""
        newTestMRP = ""
    }
}

struct LabDeskView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Diagnostic Lab Partner Desk")
                    .font(.system(size: 20, weight: .bold))
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
            }
        }
    }
}

struct RadiologyDeskView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("3.0T Radiology & Scan Center Hub")
                    .font(.system(size: 20, weight: .bold))
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
            }
        }
    }
}

struct PharmacyDeskView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Generic Chemist Store Desk")
                    .font(.system(size: 20, weight: .bold))
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
            }
        }
    }
}

struct FleetDeskView: View {
    let user: UserProfile
    let onLogout: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Fleet Sample Collection Agent Desk")
                    .font(.system(size: 20, weight: .bold))
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
            }
        }
    }
}
