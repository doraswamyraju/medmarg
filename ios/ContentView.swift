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
    @State private var selectedSubTab: Int = 0
    @State private var showSidebar: Bool = false
    @State private var showCityPicker: Bool = false
    @State private var showCartSheet: Bool = false
    @State private var showNotificationCenter: Bool = false
    @State private var showBottomSheetMenu: Bool = false
    @State private var showQuickCreateSheet: Bool = false
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
                        TopbarView(
                            user: user,
                            currentCity: $currentCity,
                            showSidebar: $showSidebar,
                            showCityPicker: $showCityPicker,
                            showCartSheet: $showCartSheet,
                            showNotificationCenter: $showNotificationCenter,
                            cartItemCount: cartItems.count,
                            onLogout: logout
                        )
                        
                        // 2. Role-Based Active View Body
                        Group {
                            switch user.role {
                            case .patient:
                                patientBodyView
                            case .doctor:
                                DoctorWorkdeskView(user: user, onLogout: logout)
                            case .admin:
                                AdminConsoleView(users: $users, onLogout: logout, activeTab: $selectedTab, activeSubTab: $selectedSubTab)
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

                        // 3. Shared Dynamic Bottom Navigation Bar
                        BottomNavbarView(
                            selectedTab: $selectedTab,
                            userRole: user.role,
                            showBottomSheetMenu: $showBottomSheetMenu,
                            showQuickCreateSheet: $showQuickCreateSheet
                        )
                    }

                    // 3. Slide-Out Sidebar Navigation Drawer
                    if showSidebar {
                        SidebarView(
                            user: user,
                            showSidebar: $showSidebar,
                            selectedTab: $selectedTab,
                            selectedSubTab: $selectedSubTab,
                            onLogout: logout
                        )
                    }
                }
                .sheet(isPresented: $showCityPicker) {
                    cityPickerSheet
                }
                .sheet(isPresented: $showCartSheet) {
                    cartViewSheet
                }
                .sheet(isPresented: $showNotificationCenter) {
                    NotificationCenterSheet(isPresented: $showNotificationCenter)
                }
                .sheet(isPresented: $showBottomSheetMenu) {
                    BottomSheetMenuView(
                        user: user,
                        isPresented: $showBottomSheetMenu,
                        selectedTab: $selectedTab,
                        selectedSubTab: $selectedSubTab,
                        onLogout: logout
                    )
                }
                .sheet(isPresented: $showQuickCreateSheet) {
                    QuickCreateSheet(
                        isPresented: $showQuickCreateSheet,
                        selectedTab: $selectedTab,
                        selectedSubTab: $selectedSubTab
                    )
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
