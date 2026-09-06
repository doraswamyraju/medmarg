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
    
    // Google Sign-In & Missing Phone Number Verification State (VR Here workflow)
    @State private var showGooglePhoneSheet: Bool = false
    @State private var tempGoogleUser: UserProfile? = nil
    @State private var googlePhoneInput: String = ""
    @State private var googlePhoneError: String = ""
    
    // 5 Core Patient Navigation Tabs (0: Home, 1: Labs & Tests, 2: Track, 3: Reports, 4: Profile)
    @State private var selectedTab: Int = 0
    @State private var selectedSubTab: Int = 0
    @State private var showSidebar: Bool = false
    @State private var showCityPicker: Bool = false
    @State private var showCartSheet: Bool = false
    @State private var showNotificationCenter: Bool = false
    @State private var showBottomSheetMenu: Bool = false
    @State private var showQuickCreateSheet: Bool = false
    @State private var selectedCategory: String = "All Tests & Packages"
    @State private var searchQuery: String = ""
    
    // Item Details Modal State
    @State private var selectedDetailItem: CatalogItem? = nil
    
    // Master Catalog Store Integration
    @StateObject private var catalogStore = CatalogStore.shared
    @State private var catalogSubTab: String = "ALL" // "ALL" | "PACKAGES" | "PROFILES" | "TESTS"
    @State private var fastingFilter: String = "ALL" // "ALL" | "YES" | "NO"
    @State private var sampleFilter: String = "ALL" // "ALL" | "SERUM" | "EDTA" | "URINE" | "PLASMA"
    
    @State private var cartItems: [CartItem] = [
        CartItem(id: "c1", title: "Aarogyam Complete 1.3 (Full Body Checkup)", subtitle: "104 Biomarkers • Thyrocare NABL", provider: "Thyrocare Direct", price: 1499, mrp: 3500, type: "Lab Package")
    ]

    var totalCartPrice: Int {
        cartItems.reduce(0) { $0 + $1.price }
    }

    var totalCartSavings: Int {
        cartItems.reduce(0) { $0 + max(0, $1.mrp - $1.price) }
    }

    var body: some View {
        ZStack {
            MedMargTheme.slate50.ignoresSafeArea()

            if let user = loggedInUser {
                // Logged-in App Workspace with Navigation Drawer & Topbar
                ZStack(alignment: .bottom) {
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

                        // 3. Shared Dynamic Bottom Navigation Bar (5 Elements: Home, Labs, Track, Reports, Profile)
                        BottomNavbarView(
                            selectedTab: $selectedTab,
                            userRole: user.role,
                            showBottomSheetMenu: $showBottomSheetMenu,
                            showQuickCreateSheet: $showQuickCreateSheet
                        )
                    }

                    // 4. Floating Cart Pill Bar (When items exist in cart & user is Patient)
                    if user.role == .patient && !cartItems.isEmpty && selectedTab != 2 {
                        floatingCartBar
                            .padding(.bottom, 68)
                            .transition(.move(edge: .bottom).combined(with: .opacity))
                    }

                    // 5. Slide-Out Sidebar Navigation Drawer
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
                .sheet(item: $selectedDetailItem) { item in
                    itemDetailSheet(item: item)
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
                    .sheet(isPresented: $showGooglePhoneSheet) {
                        googlePhonePromptSheet
                    }
            }
        }
        .preferredColorScheme(.light)
    }

    // ==========================================
    // 🛒 FLOATING ADD TO CART BAR
    // ==========================================
    private var floatingCartBar: some View {
        Button(action: { showCartSheet = true }) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.amberGold)
                        .frame(width: 32, height: 32)
                    Text("\(cartItems.count)")
                        .font(.system(size: 13, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                }

                VStack(alignment: .leading, spacing: 1) {
                    HStack(spacing: 6) {
                        Text("₹\(totalCartPrice)")
                            .font(.system(size: 16, weight: .black))
                            .foregroundColor(.white)
                        if totalCartSavings > 0 {
                            Text("Save ₹\(totalCartSavings)")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.emeraldLight)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.black.opacity(0.2))
                                .cornerRadius(4)
                        }
                    }
                    Text("Free 60-Min Home Sample Pickup Included")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.lightTeal)
                }

                Spacer()

                HStack(spacing: 4) {
                    Text("View Cart")
                        .font(.system(size: 13, weight: .bold))
                    Image(systemName: "arrow.right")
                        .font(.system(size: 12, weight: .bold))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.white.opacity(0.2))
                .cornerRadius(8)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(LinearGradient(colors: [MedMargTheme.primaryTeal, MedMargTheme.darkTeal], startPoint: .leading, endPoint: .trailing))
            .cornerRadius(18)
            .shadow(color: MedMargTheme.primaryTeal.opacity(0.4), radius: 12, x: 0, y: 6)
            .padding(.horizontal, 16)
        }
    }

    // ==========================================
    // 🔐 BRANDED LOGIN VIEW (CLEANED & STREAMLINED)
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
                        Text("Enter your credentials or continue with Google")
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
                            TextField("e.g. patient, doctor, admin, agent", text: $usernameInput)
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

                    // Social Sign In (Google Flow with Phone Check)
                    HStack(spacing: 14) {
                        // Google Sign In Button
                        Button(action: initiateGoogleSignIn) {
                            HStack(spacing: 8) {
                                Text("G")
                                    .font(.system(size: 17, weight: .black))
                                    .foregroundColor(Color(red: 0.86, green: 0.25, blue: 0.20))
                                Text("Continue with Google")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Color.white)
                            .cornerRadius(12)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1.5))
                            .shadow(color: Color.black.opacity(0.04), radius: 4, x: 0, y: 2)
                        }

                        // Apple Sign In Button
                        Button(action: { quickDemoLogin(role: .patient) }) {
                            Image(systemName: "apple.logo")
                                .font(.system(size: 18, weight: .medium))
                                .foregroundColor(.white)
                                .frame(width: 48, height: 48)
                                .background(Color.black)
                                .cornerRadius(12)
                        }
                    }

                }
                .padding(22)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(20)
                .shadow(color: Color.black.opacity(0.04), radius: 12, x: 0, y: 6)
                .padding(.horizontal, 20)

                // Security Note
                HStack(spacing: 6) {
                    Image(systemName: "lock.shield.fill")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text("256-Bit SSL Encrypted • NABL & ABDM Certified Platform")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer().frame(height: 20)
            }
        }
        .sheet(isPresented: $showCityPicker) {
            cityPickerSheet
        }
    }

    // ==========================================
    // 📱 GOOGLE SIGN IN FIRST LOGIN PHONE SHEET
    // ==========================================
    private var googlePhonePromptSheet: some View {
        VStack(spacing: 20) {
            Capsule()
                .fill(MedMargTheme.slate500.opacity(0.3))
                .frame(width: 40, height: 5)
                .padding(.top, 12)

            VStack(spacing: 6) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.lightTeal)
                        .frame(width: 56, height: 56)
                    Image(systemName: "phone.badge.checkmark")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }

                Text("Complete Your Profile")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Text("Enter your 10-digit mobile number for order tracking and SMS report alerts.")
                    .font(.system(size: 13))
                    .foregroundColor(MedMargTheme.slate500)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 20)
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Mobile Number")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate700)

                HStack(spacing: 8) {
                    Text("🇮🇳 +91")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 12)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(10)
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))

                    TextField("9876543210", text: $googlePhoneInput)
                        .font(.system(size: 15, weight: .bold))
                        .keyboardType(.numberPad)
                        .padding(12)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(10)
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
                }

                if !googlePhoneError.isEmpty {
                    Text(googlePhoneError)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.red)
                }
            }
            .padding(.horizontal, 20)

            Button(action: completeGooglePhoneVerification) {
                Text("Verify & Continue to Dashboard")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(12)
                    .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 6, x: 0, y: 3)
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)

            Spacer()
        }
        .presentationDetents([.height(340)])
    }

    private func initiateGoogleSignIn() {
        let googleEmail = "rahul.patient@gmail.com"
        let googleName = "Rahul Sharma"
        
        let user = users.first(where: { $0.email == googleEmail || $0.role == .patient }) ?? UserProfile(
            id: "usr_g_\(UUID().uuidString.prefix(6))",
            name: googleName,
            username: "rahul_google",
            email: googleEmail,
            phone: "",
            password: "password123",
            role: .patient,
            organization: "MedMarg Healthcare Patient Portal",
            status: "Active",
            createdAt: "31-Aug-2026"
        )

        if user.phone.isEmpty || user.phone.count < 10 {
            tempGoogleUser = user
            showGooglePhoneSheet = true
        } else {
            loggedInUser = user
            errorMessage = ""
        }
    }

    private func completeGooglePhoneVerification() {
        let cleanDigits = googlePhoneInput.filter { "0123456789".contains($0) }
        if cleanDigits.count < 10 {
            googlePhoneError = "Please enter a valid 10-digit mobile number."
            return
        }

        if var user = tempGoogleUser {
            user.phone = "+91 \(cleanDigits)"
            loggedInUser = user
            showGooglePhoneSheet = false
            googlePhoneInput = ""
            googlePhoneError = ""
            errorMessage = ""
        }
    }

    // ==========================================
    // 📱 PATIENT BODY VIEW (5 DISTINCT TABS)
    // 0: Home, 1: Labs & Tests, 2: Track, 3: Reports, 4: Profile
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
                patientReportsTab
            case 4:
                patientProfileTab
            default:
                patientHomeTab
            }
        }
    }

    // ==========================================
    // 🏠 PATIENT HOME TAB (WELLNESS & INSTANT ACTIONS)
    // ==========================================
    private var patientHomeTab: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                
                // 1. Direct Order Action Bar (WhatsApp, Call, Upload Rx)
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("INSTANT CHANNELS")
                            .font(.system(size: 10, weight: .black))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(MedMargTheme.amberGold)
                            .foregroundColor(MedMargTheme.slate900)
                            .cornerRadius(4)

                        Spacer()

                        HStack(spacing: 4) {
                            Circle().fill(Color.green).frame(width: 6, height: 6)
                            Text("60-Min Phlebo Visit in Tirupati")
                                .font(.system(size: 11, weight: .bold))
                        }
                        .foregroundColor(.white)
                    }

                    Text("Book Diagnostic Tests in 1 Tap")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)

                    Text("Order on WhatsApp, call our lab concierge or explore 913+ tests.")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.lightTeal)

                    HStack(spacing: 10) {
                        // WhatsApp Button
                        Button(action: openWhatsApp) {
                            HStack(spacing: 6) {
                                Image(systemName: "message.fill")
                                    .font(.system(size: 13))
                                Text("WhatsApp")
                                    .font(.system(size: 13, weight: .bold))
                            }
                            .foregroundColor(.white)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 9)
                            .background(Color(red: 0.15, green: 0.78, blue: 0.38))
                            .cornerRadius(8)
                        }

                        // Call Button
                        Button(action: makeHelplineCall) {
                            HStack(spacing: 6) {
                                Image(systemName: "phone.fill")
                                    .font(.system(size: 13))
                                Text("Call Lab")
                                    .font(.system(size: 13, weight: .bold))
                            }
                            .foregroundColor(.white)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 9)
                            .background(Color(red: 0.08, green: 0.52, blue: 0.85))
                            .cornerRadius(8)
                        }

                        Spacer()

                        Button(action: { selectedTab = 1 }) {
                            Text("Catalog →")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 8)
                                .background(Color.white.opacity(0.15))
                                .cornerRadius(8)
                        }
                    }
                }
                .padding(16)
                .background(LinearGradient(colors: [MedMargTheme.primaryTeal, MedMargTheme.darkTeal], startPoint: .topLeading, endPoint: .bottomTrailing))
                .cornerRadius(16)
                .padding(.horizontal, 16)
                .padding(.top, 12)

                // 2. Wellness Curated Hub (His, Her, Family Wellness)
                VStack(alignment: .leading, spacing: 12) {
                    Text("Curated Wellness Plans")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                        .padding(.horizontal, 16)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 14) {
                            wellnessCard(
                                title: "His Wellness",
                                subtitle: "Testosterone, Prostate PSA, Lipids & Vital Stamina",
                                price: "₹1,699",
                                mrp: "₹3,800",
                                icon: "bolt.heart.fill",
                                color: Color.blue
                            )

                            wellnessCard(
                                title: "Her Wellness",
                                subtitle: "PCOS/PCOD, Hormones, Thyroid, Ferritin & Bone Care",
                                price: "₹1,799",
                                mrp: "₹4,000",
                                icon: "heart.fill",
                                color: Color.pink
                            )

                            wellnessCard(
                                title: "Family Wellness",
                                subtitle: "Senior Parents, Child Growth & Couple Annual Panel",
                                price: "₹4,499",
                                mrp: "₹11,000",
                                icon: "person.3.fill",
                                color: Color.purple
                            )
                        }
                        .padding(.horizontal, 16)
                    }
                }

                // 3. Disease-Based & Vital-Based Screening Section
                VStack(alignment: .leading, spacing: 12) {
                    Text("Disease & Vital Biomarkers")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                        .padding(.horizontal, 16)

                    VStack(spacing: 10) {
                        quickBiomarkerRow(name: "Diabetes HbA1c + Fasting Sugar", category: "DISEASE BASED", price: "₹499", icon: "drop.fill", color: Color.orange)
                        quickBiomarkerRow(name: "Cardiac Lipid Risk Profile", category: "DISEASE BASED", price: "₹549", icon: "heart.circle.fill", color: Color.red)
                        quickBiomarkerRow(name: "Vitamin D3 & B12 Vital Pair", category: "VITAL BASED", price: "₹799", icon: "sun.max.fill", color: MedMargTheme.amberGold)
                        quickBiomarkerRow(name: "Complete Blood Count (CBC 24 Params)", category: "VITAL BASED", price: "₹299", icon: "waveform.path.ecg", color: MedMargTheme.primaryTeal)
                        quickBiomarkerRow(name: "Liver & Kidney Comprehensive (LFT + KFT)", category: "DISEASE BASED", price: "₹799", icon: "cross.vial.fill", color: Color.blue)
                    }
                    .padding(.horizontal, 16)
                }

                // 4. Age-Based Checkup Recommendations & Health Concerns
                VStack(alignment: .leading, spacing: 12) {
                    Text("Age-Based & Health Concern Finder")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                        .padding(.horizontal, 16)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ageCheckupPill(age: "20–35 Yrs", label: "Men & Women Energy", price: "₹999", icon: "figure.walk")
                            ageCheckupPill(age: "35–50 Yrs", label: "Metabolic & Cardiac Care", price: "₹1,499", icon: "heart.text.square.fill")
                            ageCheckupPill(age: "50+ Yrs", label: "Senior Citizen Geriatric", price: "₹1,899", icon: "figure.stand")
                            ageCheckupPill(age: "Concern", label: "Hair Fall & Skin Health", price: "₹799", icon: "sparkles")
                            ageCheckupPill(age: "Concern", label: "Fatigue & Gut Wellness", price: "₹899", icon: "leaf.fill")
                        }
                        .padding(.horizontal, 16)
                    }
                }

                // 5. Popular Pathology Tests (Clickable for Details & Connected Packages)
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Popular Pathology Tests")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Click any item to view parameters & smart package savings")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        Spacer()
                        Button(action: { selectedTab = 1 }) {
                            Text("See All (\(catalogStore.allItems.count))+")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }
                    }
                    .padding(.horizontal, 16)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(Array(catalogStore.allItems.prefix(8))) { item in
                                catalogItemCardView(item: item)
                            }
                        }
                        .padding(.horizontal, 16)
                    }
                }

                // 6. Live Tracking Phlebotomist Banner
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        HStack(spacing: 6) {
                            Circle().fill(Color.green).frame(width: 8, height: 8)
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

                    Text("Ramesh Kumar (Certified Phlebotomist • AG-01)")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("Home Pickup: Plot 42, Air Bypass Road, Tirupati")
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

                Spacer().frame(height: 50)
            }
        }
        .background(MedMargTheme.slate50)
    }

    private func wellnessCard(title: String, subtitle: String, price: String, mrp: String, icon: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                ZStack {
                    Circle().fill(color.opacity(0.12)).frame(width: 36, height: 36)
                    Image(systemName: icon).font(.system(size: 18)).foregroundColor(color)
                }
                Spacer()
                Text("NABL Lab")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(color)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(color.opacity(0.1))
                    .cornerRadius(4)
            }

            Text(title)
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            Text(subtitle)
                .font(.system(size: 11))
                .foregroundColor(MedMargTheme.slate500)
                .lineLimit(2)
                .frame(height: 30, alignment: .topLeading)

            HStack {
                VStack(alignment: .leading, spacing: 1) {
                    Text(price)
                        .font(.system(size: 16, weight: .black))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text(mrp)
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                        .strikethrough()
                }

                Spacer()

                Button(action: {
                    cartItems.append(CartItem(id: UUID().uuidString, title: title, subtitle: subtitle, provider: "MedMarg Diagnostics", price: Int(price.replacingOccurrences(of: "₹", with: "").replacingOccurrences(of: ",", with: "")) ?? 1499, mrp: 3500, type: "Wellness Package"))
                }) {
                    Text("+ Add")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(color)
                        .cornerRadius(6)
                }
            }
        }
        .padding(14)
        .frame(width: 220)
        .background(MedMargTheme.pureWhite)
        .cornerRadius(14)
        .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 3)
    }

    private func quickBiomarkerRow(name: String, category: String, price: String, icon: String, color: Color) -> some View {
        HStack(spacing: 12) {
            ZStack {
                Circle().fill(color.opacity(0.12)).frame(width: 34, height: 34)
                Image(systemName: icon).font(.system(size: 15)).foregroundColor(color)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(name)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Text(category)
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }

            Spacer()

            Text(price)
                .font(.system(size: 14, weight: .black))
                .foregroundColor(MedMargTheme.primaryTeal)

            Button(action: {
                cartItems.append(CartItem(id: UUID().uuidString, title: name, subtitle: category, provider: "MedMarg Diagnostics", price: Int(price.replacingOccurrences(of: "₹", with: "")) ?? 499, mrp: 999, type: "Lab Test"))
            }) {
                Text("+")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
                    .frame(width: 28, height: 28)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(6)
            }
        }
        .padding(12)
        .background(MedMargTheme.pureWhite)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200.opacity(0.7), lineWidth: 1))
    }

    private func ageCheckupPill(age: String, label: String, price: String, icon: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(age)
                    .font(.system(size: 10, weight: .black))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(4)
                Spacer()
                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundColor(MedMargTheme.slate500)
            }

            Text(label)
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)
                .lineLimit(1)

            Text(price)
                .font(.system(size: 13, weight: .black))
                .foregroundColor(MedMargTheme.darkTeal)
        }
        .padding(10)
        .frame(width: 155)
        .background(MedMargTheme.pureWhite)
        .cornerRadius(10)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    private func catalogItemCardView(item: CatalogItem) -> some View {
        Button(action: { selectedDetailItem = item }) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(item.displayItemType)
                        .font(.system(size: 8, weight: .black))
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(
                            item.isPackage ? MedMargTheme.amberLight :
                            (item.isProfile ? MedMargTheme.lightTeal : MedMargTheme.emeraldLight)
                        )
                        .foregroundColor(
                            item.isPackage ? MedMargTheme.amberGold :
                            (item.isProfile ? MedMargTheme.darkTeal : MedMargTheme.accentEmerald)
                        )
                        .cornerRadius(4)

                    Spacer()

                    if item.calculatedDiscount > 0 {
                        Text("\(item.calculatedDiscount)% OFF")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(MedMargTheme.accentEmerald)
                    }
                }

                Text(item.name)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineLimit(2)
                    .frame(height: 34, alignment: .topLeading)
                    .multilineTextAlignment(.leading)

                Text("\(item.displaySample) • \(item.requiresFasting ? "Fasting" : "No Fasting")")
                    .font(.system(size: 10))
                    .foregroundColor(MedMargTheme.slate500)
                    .lineLimit(1)

                HStack {
                    VStack(alignment: .leading, spacing: 1) {
                        Text("₹\(item.price)")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                        if item.mrp > item.price {
                            Text("₹\(item.mrp)")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                                .strikethrough()
                        }
                    }

                    Spacer()

                    Button(action: {
                        addItemToCart(item: item)
                    }) {
                        Text("+ Add")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(MedMargTheme.primaryTeal)
                            .cornerRadius(6)
                    }
                }
            }
            .padding(12)
            .frame(width: 175)
            .background(MedMargTheme.pureWhite)
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 3)
        }
        .buttonStyle(PlainButtonStyle())
    }

    private func openWhatsApp() {
        let msg = "Hello MedMarg, I would like to book a home sample collection in Tirupati."
        let urlString = "https://wa.me/919876543210?text=\(msg.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
        if let url = URL(string: urlString) {
            UIApplication.shared.open(url)
        }
    }

    private func makeHelplineCall() {
        if let url = URL(string: "tel:919876543210") {
            UIApplication.shared.open(url)
        }
    }

    // ==========================================
    // 🧪 TAB 1: LABS & TESTS (FULL PATHOLOGY CATALOG)
    // ==========================================
    private var patientLabsCatalogTab: some View {
        VStack(spacing: 0) {
            // Search Bar
            VStack(spacing: 10) {
                HStack(spacing: 8) {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(MedMargTheme.slate500)
                        .font(.system(size: 14))
                    TextField("Search \(catalogStore.tests.count)+ tests (Thyroid, HbA1c, Vitamin D, Allergy, Liver)...", text: $searchQuery)
                        .font(.system(size: 13))
                    if !searchQuery.isEmpty {
                        Button(action: { searchQuery = "" }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(MedMargTheme.slate500)
                                .font(.system(size: 14))
                        }
                    }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 9)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(10)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
                .padding(.horizontal, 16)
                .padding(.top, 10)

                // Sub-Tab Switcher
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        catalogSubTabPill(tabKey: "ALL", label: "All Items (\(catalogStore.allItems.count))")
                        catalogSubTabPill(tabKey: "PACKAGES", label: "✨ Packages (\(catalogStore.packages.count))")
                        catalogSubTabPill(tabKey: "PROFILES", label: "🔬 Profiles (\(catalogStore.profiles.count))")
                        catalogSubTabPill(tabKey: "TESTS", label: "🧪 Tests (\(catalogStore.tests.count))")
                    }
                    .padding(.horizontal, 16)
                }

                // Fasting Filters
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        fastingFilterPill(key: "ALL", label: "All Fasting")
                        fastingFilterPill(key: "YES", label: "Fasting Required")
                        fastingFilterPill(key: "NO", label: "No Fasting")
                        
                        Divider().frame(height: 16).padding(.horizontal, 2)
                        
                        sampleFilterPill(key: "ALL", label: "All Samples")
                        sampleFilterPill(key: "SERUM", label: "Serum")
                        sampleFilterPill(key: "EDTA", label: "EDTA Blood")
                        sampleFilterPill(key: "URINE", label: "Urine")
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 8)
                }
            }
            .background(MedMargTheme.pureWhite)
            .shadow(color: Color.black.opacity(0.02), radius: 2, x: 0, y: 1)

            let displayItems = catalogStore.filterItems(
                tab: catalogSubTab,
                query: searchQuery,
                fastingFilter: fastingFilter,
                sampleFilter: sampleFilter
            )

            ScrollView(showsIndicators: false) {
                VStack(spacing: 12) {
                    ForEach(Array(displayItems.prefix(80))) { item in
                        Button(action: { selectedDetailItem = item }) {
                            VStack(alignment: .leading, spacing: 10) {
                                HStack(alignment: .top) {
                                    VStack(alignment: .leading, spacing: 4) {
                                        HStack(spacing: 6) {
                                            Text(item.displayItemType)
                                                .font(.system(size: 9, weight: .black))
                                                .padding(.horizontal, 6)
                                                .padding(.vertical, 2)
                                                .background(
                                                    item.isPackage ? MedMargTheme.amberLight :
                                                    (item.isProfile ? MedMargTheme.lightTeal : MedMargTheme.emeraldLight)
                                                )
                                                .foregroundColor(
                                                    item.isPackage ? MedMargTheme.amberGold :
                                                    (item.isProfile ? MedMargTheme.darkTeal : MedMargTheme.accentEmerald)
                                                )
                                                .cornerRadius(4)

                                            Text(item.code)
                                                .font(.system(size: 10, weight: .bold))
                                                .padding(.horizontal, 6)
                                                .padding(.vertical, 2)
                                                .background(MedMargTheme.slate50)
                                                .foregroundColor(MedMargTheme.slate700)
                                                .cornerRadius(4)
                                        }

                                        Text(item.name)
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(MedMargTheme.slate900)
                                            .multilineTextAlignment(.leading)
                                    }

                                    Spacer()

                                    Button(action: {
                                        addItemToCart(item: item)
                                    }) {
                                        Text("+ Add")
                                            .font(.system(size: 12, weight: .bold))
                                            .foregroundColor(.white)
                                            .padding(.horizontal, 14)
                                            .padding(.vertical, 7)
                                            .background(MedMargTheme.primaryTeal)
                                            .cornerRadius(8)
                                    }
                                }

                                Divider()

                                HStack {
                                    HStack(spacing: 10) {
                                        Text(item.displaySample)
                                            .font(.system(size: 11, weight: .medium))
                                            .foregroundColor(MedMargTheme.slate700)

                                        Text(item.requiresFasting ? "Fasting (8-10h)" : "No Fasting")
                                            .font(.system(size: 11, weight: .medium))
                                            .foregroundColor(item.requiresFasting ? MedMargTheme.amberGold : MedMargTheme.slate500)
                                    }

                                    Spacer()

                                    HStack(alignment: .firstTextBaseline, spacing: 5) {
                                        Text("₹\(item.price)")
                                            .font(.system(size: 16, weight: .black))
                                            .foregroundColor(MedMargTheme.primaryTeal)
                                        if item.mrp > item.price {
                                            Text("₹\(item.mrp)")
                                                .font(.system(size: 11))
                                                .foregroundColor(MedMargTheme.slate500)
                                                .strikethrough()
                                        }
                                    }
                                }
                            }
                            .padding(14)
                            .background(MedMargTheme.pureWhite)
                            .cornerRadius(12)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200.opacity(0.7), lineWidth: 1))
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                .padding(16)
                .padding(.bottom, 50)
            }
        }
    }

    private func addItemToCart(item: CatalogItem) {
        let sub = item.isPackage ? "\(item.testCount ?? 80) Parameters • Health Package" : (item.isProfile ? "Diagnostic Profile Panel" : "\(item.displaySample) • Fasting: \(item.requiresFasting ? "Yes" : "No")")
        let cartItem = CartItem(
            id: UUID().uuidString,
            title: item.name,
            subtitle: sub,
            provider: "MedMarg Central Diagnostics",
            price: item.price,
            mrp: item.mrp,
            type: item.isPackage ? "Health Package" : (item.isProfile ? "Diagnostic Profile" : "Lab Test")
        )
        cartItems.append(cartItem)
    }

    // ==========================================
    // 🔍 ITEM DETAILS SHEET WITH CONNECTED PACKAGES & SAVINGS HIGHLIGHT
    // ==========================================
    private func itemDetailSheet(item: CatalogItem) -> some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 18) {
                // Drag Capsule
                HStack {
                    Spacer()
                    Capsule()
                        .fill(MedMargTheme.slate500.opacity(0.3))
                        .frame(width: 40, height: 5)
                    Spacer()
                }
                .padding(.top, 12)

                // Header Badges & Code
                HStack {
                    Text(item.displayItemType)
                        .font(.system(size: 10, weight: .black))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(item.isPackage ? MedMargTheme.amberLight : MedMargTheme.lightTeal)
                        .foregroundColor(item.isPackage ? MedMargTheme.amberGold : MedMargTheme.darkTeal)
                        .cornerRadius(6)

                    Text(item.code)
                        .font(.system(size: 11, weight: .bold))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(MedMargTheme.slate50)
                        .foregroundColor(MedMargTheme.slate700)
                        .cornerRadius(6)

                    Spacer()

                    if item.calculatedDiscount > 0 {
                        Text("\(item.calculatedDiscount)% OFF")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(MedMargTheme.accentEmerald)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(MedMargTheme.emeraldLight)
                            .cornerRadius(6)
                    }
                }

                // Name & Price
                Text(item.name)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text("₹\(item.price)")
                        .font(.system(size: 26, weight: .black))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    if item.mrp > item.price {
                        Text("MRP ₹\(item.mrp)")
                            .font(.system(size: 14))
                            .foregroundColor(MedMargTheme.slate500)
                            .strikethrough()

                        Text("(Save ₹\(item.mrp - item.price))")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.accentEmerald)
                    }
                }

                Divider()

                // Key Specs Grid
                VStack(alignment: .leading, spacing: 10) {
                    Text("Diagnostic Specifications")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    HStack(spacing: 12) {
                        specBox(icon: "drop.fill", title: "Sample Type", value: item.displaySample)
                        specBox(icon: "clock.fill", title: "Fasting", value: item.requiresFasting ? "8-10 Hours" : "Not Required")
                        specBox(icon: "timer", title: "TAT", value: "\(item.tatHours ?? 24) Hours")
                    }
                }

                // Description
                if let desc = item.description, !desc.isEmpty {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Clinical Significance & Overview")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text(desc)
                            .font(.system(size: 13))
                            .foregroundColor(MedMargTheme.slate700)
                            .lineSpacing(3)
                    }
                }

                // ==========================================
                // 💡 CONNECTED SMART PACKAGES WITH SAVINGS HIGHLIGHT
                // ==========================================
                if !item.isPackage {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 6) {
                            Image(systemName: "sparkles")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(MedMargTheme.amberGold)
                            Text("Connected Smart Packages")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                        }

                        Text("Upgrade to a full-body package containing this test to maximize savings & biomarkers.")
                            .font(.system(size: 12))
                            .foregroundColor(MedMargTheme.slate500)

                        VStack(spacing: 10) {
                            connectedPackageCard(
                                title: "Thyrocare Aarogyam Complete 1.3",
                                testCount: 104,
                                price: 1499,
                                mrp: 3500,
                                savings: 2001,
                                savingsPercent: 57
                            )

                            connectedPackageCard(
                                title: "MedMarg Master Health Shield",
                                testCount: 92,
                                price: 1799,
                                mrp: 4200,
                                savings: 2401,
                                savingsPercent: 57
                            )
                        }
                    }
                    .padding(14)
                    .background(MedMargTheme.amberLight.opacity(0.4))
                    .cornerRadius(14)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.amberGold.opacity(0.3), lineWidth: 1))
                }

                // Bottom Action Buttons
                VStack(spacing: 8) {
                    Button(action: {
                        addItemToCart(item: item)
                        selectedDetailItem = nil
                    }) {
                        HStack {
                            Image(systemName: "cart.badge.plus")
                            Text("Add to Cart • ₹\(item.price)")
                        }
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(12)
                        .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 6, x: 0, y: 3)
                    }

                    Button(action: openWhatsApp) {
                        HStack {
                            Image(systemName: "message.fill")
                            Text("Book via WhatsApp Concierge")
                        }
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(Color(red: 0.15, green: 0.78, blue: 0.38))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color(red: 0.15, green: 0.78, blue: 0.38).opacity(0.1))
                        .cornerRadius(10)
                    }
                }
                .padding(.top, 8)
            }
            .padding(20)
        }
    }

    private func specBox(icon: String, title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 10))
                    .foregroundColor(MedMargTheme.primaryTeal)
                Text(title)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.slate500)
            }
            Text(value)
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)
                .lineLimit(1)
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(MedMargTheme.slate50)
        .cornerRadius(10)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    private func connectedPackageCard(title: String, testCount: Int, price: Int, mrp: Int, savings: Int, savingsPercent: Int) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Text("\(testCount) Biomarkers • Save ₹\(savings) (\(savingsPercent)% OFF)")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.accentEmerald)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text("₹\(price)")
                    .font(.system(size: 14, weight: .black))
                    .foregroundColor(MedMargTheme.primaryTeal)

                Button(action: {
                    cartItems.append(CartItem(id: UUID().uuidString, title: title, subtitle: "\(testCount) Biomarkers Package", provider: "MedMarg Diagnostics", price: price, mrp: mrp, type: "Health Package"))
                    selectedDetailItem = nil
                }) {
                    Text("+ Add")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(6)
                }
            }
        }
        .padding(10)
        .background(MedMargTheme.pureWhite)
        .cornerRadius(10)
    }

    private func catalogSubTabPill(tabKey: String, label: String) -> some View {
        Button(action: { catalogSubTab = tabKey }) {
            Text(label)
                .font(.system(size: 12, weight: catalogSubTab == tabKey ? .bold : .medium))
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(catalogSubTab == tabKey ? MedMargTheme.primaryTeal : MedMargTheme.slate50)
                .foregroundColor(catalogSubTab == tabKey ? .white : MedMargTheme.slate700)
                .cornerRadius(16)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(catalogSubTab == tabKey ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1))
        }
    }

    private func fastingFilterPill(key: String, label: String) -> some View {
        Button(action: { fastingFilter = key }) {
            Text(label)
                .font(.system(size: 10, weight: fastingFilter == key ? .bold : .medium))
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(fastingFilter == key ? MedMargTheme.darkTeal : MedMargTheme.pureWhite)
                .foregroundColor(fastingFilter == key ? .white : MedMargTheme.slate500)
                .cornerRadius(10)
        }
    }

    private func sampleFilterPill(key: String, label: String) -> some View {
        Button(action: { sampleFilter = key }) {
            Text(label)
                .font(.system(size: 10, weight: sampleFilter == key ? .bold : .medium))
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(sampleFilter == key ? MedMargTheme.primaryTeal : MedMargTheme.pureWhite)
                .foregroundColor(sampleFilter == key ? .white : MedMargTheme.slate500)
                .cornerRadius(10)
        }
    }

    // ==========================================
    // 📍 TAB 2: TRACK (LIVE PHLEBOTOMIST GPS TRACKER)
    // ==========================================
    private var patientLiveTrackTab: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                VStack(spacing: 10) {
                    ZStack {
                        Circle().fill(MedMargTheme.lightTeal).frame(width: 76, height: 76)
                        Image(systemName: "location.fill.viewfinder")
                            .font(.system(size: 34, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }

                    Text("Live Phlebotomist Tracker")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("Real-time GPS tracking for home sample pickup in Tirupati")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate500)
                }
                .padding(.top, 16)

                VStack(alignment: .leading, spacing: 14) {
                    HStack {
                        ZStack {
                            Circle().fill(MedMargTheme.primaryTeal).frame(width: 44, height: 44)
                            Image(systemName: "person.fill").foregroundColor(.white).font(.system(size: 20))
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Ramesh Kumar")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Senior Certified Phlebotomist • AG-01")
                                .font(.system(size: 12))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Button(action: {
                            if let url = URL(string: "tel:9876511223") {
                                UIApplication.shared.open(url)
                            }
                        }) {
                            Image(systemName: "phone.fill")
                                .foregroundColor(.white)
                                .padding(10)
                                .background(MedMargTheme.accentEmerald)
                                .clipShape(Circle())
                        }
                    }

                    Divider()

                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("COLD-CHAIN IOT TEMP")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)
                            Text("4.2°C (Optimal)")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.accentEmerald)
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 2) {
                            Text("TARGET NABL HUB")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)
                            Text("Thyrocare Tirupati")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }
                    }
                }
                .padding(16)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(16)
                .padding(.horizontal, 16)
            }
        }
    }

    // ==========================================
    // 📄 TAB 3: REPORTS (HEALTH LOCKER & PDFS)
    // ==========================================
    private var patientReportsTab: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Digital Health Locker")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Encrypted lab report PDFs backed up to Google Drive")
                                .font(.system(size: 12))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        Spacer()
                    }
                    .padding(.top, 16)

                    docReportCard(title: "Thyrocare Aarogyam Complete 1.3", date: "15-Aug-2026", lab: "Thyrocare NABL Lab")
                    docReportCard(title: "Thyroid Profile Total Report", date: "02-Jul-2026", lab: "Dr. Lal PathLabs")
                    docReportCard(title: "Lipid & HbA1c Quarterly Follow-up", date: "10-Jan-2026", lab: "MedMarg Diagnostics")
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

            Button(action: {
                openWhatsApp()
            }) {
                Image(systemName: "arrow.down.circle.fill")
                    .font(.system(size: 20))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
        }
        .padding(14)
        .background(MedMargTheme.pureWhite)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 👤 TAB 4: PROFILE (PATIENT PROFILE & SETTINGS)
    // ==========================================
    private var patientProfileTab: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                if let user = loggedInUser {
                    VStack(spacing: 12) {
                        ZStack {
                            Circle().fill(MedMargTheme.primaryTeal).frame(width: 64, height: 64)
                            Text(String(user.name.prefix(1)))
                                .font(.system(size: 26, weight: .bold))
                                .foregroundColor(.white)
                        }

                        Text(user.name)
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)

                        Text(user.phone.isEmpty ? user.email : user.phone)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        Text("Patient Profile • Verified ABDM Health Account")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity)
                    .background(MedMargTheme.pureWhite)
                    .cornerRadius(16)
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
                }

                // Profile Details Card
                VStack(alignment: .leading, spacing: 14) {
                    Text("Saved Information")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    HStack {
                        Image(systemName: "location.fill").foregroundColor(MedMargTheme.primaryTeal)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Primary Address").font(.system(size: 11, weight: .bold)).foregroundColor(MedMargTheme.slate500)
                            Text("Plot 42, Air Bypass Road, Tirupati - 517501").font(.system(size: 13)).foregroundColor(MedMargTheme.slate900)
                        }
                    }

                    Divider()

                    HStack {
                        Image(systemName: "person.2.fill").foregroundColor(MedMargTheme.primaryTeal)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Family Members").font(.system(size: 11, weight: .bold)).foregroundColor(MedMargTheme.slate500)
                            Text("Rahul Sharma (Self), Priya Sharma (Spouse), K. Sharma (Father)").font(.system(size: 13)).foregroundColor(MedMargTheme.slate900)
                        }
                    }
                }
                .padding(16)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(16)
                .padding(.horizontal, 16)

                // Sign Out Action
                Button(action: logout) {
                    HStack {
                        Image(systemName: "power")
                        Text("Sign Out")
                    }
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.red)
                    .frame(maxWidth: .infinity)
                    .padding(14)
                    .background(Color.red.opacity(0.08))
                    .cornerRadius(12)
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
            }
        }
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
    // 🛒 CART VIEW & STREAMLINED CHECKOUT SHEET
    // ==========================================
    private var cartViewSheet: some View {
        VStack(spacing: 0) {
            HStack {
                Text("Healthcare Cart & Checkout")
                    .font(.system(size: 18, weight: .bold))
                Spacer()
                Button("Close") { showCartSheet = false }
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
            .padding(20)

            if cartItems.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "cart")
                        .font(.system(size: 40))
                        .foregroundColor(MedMargTheme.slate500)
                    Text("Your cart is empty")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Add pathology tests or health packages to schedule free home pickup.")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate500)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(40)
            } else {
                ScrollView {
                    VStack(spacing: 16) {
                        // Selected Items List
                        VStack(alignment: .leading, spacing: 10) {
                            Text("SELECTED DIAGNOSTIC TESTS (\(cartItems.count))")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)

                            ForEach(cartItems) { item in
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(item.title)
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(MedMargTheme.slate900)
                                        Text(item.subtitle)
                                            .font(.system(size: 11))
                                            .foregroundColor(MedMargTheme.slate500)
                                    }
                                    Spacer()
                                    VStack(alignment: .trailing, spacing: 2) {
                                        Text("₹\(item.price)")
                                            .font(.system(size: 15, weight: .black))
                                            .foregroundColor(MedMargTheme.primaryTeal)
                                        Button(action: {
                                            cartItems.removeAll(where: { $0.id == item.id })
                                        }) {
                                            Text("Remove")
                                                .font(.system(size: 10, weight: .bold))
                                                .foregroundColor(.red)
                                        }
                                    }
                                }
                                .padding(12)
                                .background(MedMargTheme.slate50)
                                .cornerRadius(10)
                            }
                        }

                        // Collection Slot & Address
                        VStack(alignment: .leading, spacing: 10) {
                            Text("HOME COLLECTION DETAILS")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)

                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Image(systemName: "clock.badge.checkmark")
                                        .foregroundColor(MedMargTheme.primaryTeal)
                                    Text("Morning Fasting Slot: Tomorrow (07:30 AM - 08:30 AM)")
                                        .font(.system(size: 12, weight: .bold))
                                        .foregroundColor(MedMargTheme.slate900)
                                }
                                HStack {
                                    Image(systemName: "location.fill")
                                        .foregroundColor(MedMargTheme.primaryTeal)
                                    Text("Plot 42, Air Bypass Road, Tirupati, AP - 517501")
                                        .font(.system(size: 12))
                                        .foregroundColor(MedMargTheme.slate700)
                                }
                            }
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(MedMargTheme.lightTeal)
                            .cornerRadius(10)
                        }

                        // Bill Summary
                        VStack(spacing: 6) {
                            HStack {
                                Text("Total MRP").font(.system(size: 12)).foregroundColor(MedMargTheme.slate500)
                                Spacer()
                                Text("₹\(cartItems.reduce(0) { $0 + $1.mrp })").font(.system(size: 12)).foregroundColor(MedMargTheme.slate500)
                            }
                            HStack {
                                Text("MedMarg Marketplace Discount").font(.system(size: 12)).foregroundColor(MedMargTheme.accentEmerald)
                                Spacer()
                                Text("- ₹\(totalCartSavings)").font(.system(size: 12, weight: .bold)).foregroundColor(MedMargTheme.accentEmerald)
                            }
                            HStack {
                                Text("Home Sample Collection").font(.system(size: 12)).foregroundColor(MedMargTheme.slate700)
                                Spacer()
                                Text("FREE").font(.system(size: 12, weight: .bold)).foregroundColor(MedMargTheme.accentEmerald)
                            }
                            Divider().padding(.vertical, 4)
                            HStack {
                                Text("Total Amount Payable").font(.system(size: 15, weight: .black)).foregroundColor(MedMargTheme.slate900)
                                Spacer()
                                Text("₹\(totalCartPrice)").font(.system(size: 18, weight: .black)).foregroundColor(MedMargTheme.primaryTeal)
                            }
                        }
                        .padding(14)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(12)
                    }
                    .padding(20)
                }

                Button(action: {
                    cartItems.removeAll()
                    showCartSheet = false
                    selectedTab = 2 // Direct to live tracker
                }) {
                    Text("Confirm Free Home Collection (₹\(totalCartPrice))")
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
// 🧑‍⚕️ WORKDESK VIEWS FOR DOCTOR, ADMIN, LAB, RADIOLOGY, PHARMACY
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

// =========================================================================
// 🛵 COMPLETE SAMPLE COLLECTION AGENT (PHLEBOTOMIST) PANEL
// =========================================================================
struct FleetDeskView: View {
    let user: UserProfile
    let onLogout: () -> Void

    @State private var isOnDuty: Bool = true
    @State private var completedPickups: Set<String> = []
    @State private var currentStep: [String: Int] = ["PK-01": 2, "PK-02": 1, "PK-03": 0]

    let assignedPickups = [
        (id: "PK-01", name: "Rahul Sharma", time: "07:30 AM - 08:30 AM", address: "Plot 42, Air Bypass Rd, Tirupati", phone: "+91 98765 43210", tests: "Thyrocare Aarogyam 1.3 (SST Serum + EDTA)", tubes: ["Yellow SST (Serum)", "Lavender (EDTA)", "Grey (Sugar)"], fasting: "YES (10h Verified)"),
        (id: "PK-02", name: "Lakshmi Devi", time: "08:45 AM - 09:30 AM", address: "Door 12-4, Gandhi Road, Tirupati", phone: "+91 98765 22114", tests: "Thyroid Profile Total + Lipid Panel", tubes: ["Yellow SST (Serum)", "Lavender (EDTA)"], fasting: "YES (Fasting)"),
        (id: "PK-03", name: "Suresh Reddy", time: "10:00 AM - 11:00 AM", address: "Near Alipiri Gate, Tirupati", phone: "+91 98765 99887", tests: "Complete Blood Count (CBC) + Vitamin D3", tubes: ["Lavender (EDTA)", "Yellow SST (Serum)"], fasting: "NO (Non-Fasting)")
    ]

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                
                // 1. Phlebotomist Status & Duty Switch Header
                VStack(spacing: 14) {
                    HStack {
                        ZStack {
                            Circle().fill(MedMargTheme.primaryTeal).frame(width: 48, height: 48)
                            Image(systemName: "bicycle.circle.fill").foregroundColor(.white).font(.system(size: 24))
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(user.name)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Certified Phlebotomist • AG-01 Tirupati Fleet")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Toggle("", isOn: $isOnDuty)
                            .labelsHidden()
                            .toggleStyle(SwitchToggleStyle(tint: MedMargTheme.accentEmerald))
                    }

                    HStack(spacing: 12) {
                        HStack(spacing: 6) {
                            Circle()
                                .fill(isOnDuty ? Color.green : Color.red)
                                .frame(width: 8, height: 8)
                            Text(isOnDuty ? "ON DUTY (GPS Active)" : "OFF DUTY")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(isOnDuty ? MedMargTheme.accentEmerald : Color.red)
                        }

                        Spacer()

                        Text("3 Pickups Today")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate700)
                    }
                }
                .padding(16)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(16)
                .padding(.horizontal, 16)
                .padding(.top, 12)

                // 2. IoT Cold-Chain Temperature Telemetry Box
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Image(systemName: "thermometer.medium")
                            .foregroundColor(MedMargTheme.accentEmerald)
                        Text("COLD-CHAIN IOT TELEMETRY BOX #CB-88")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate700)
                        Spacer()
                        Text("🔋 88% Battery")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    HStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("4.2°C")
                                .font(.system(size: 24, weight: .black))
                                .foregroundColor(MedMargTheme.accentEmerald)
                            Text("Optimal Serum Temp (2°C - 8°C)")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 2) {
                            Text("DESTINATION")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)
                            Text("Thyrocare NABL Lab")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }
                    }
                }
                .padding(16)
                .background(MedMargTheme.emeraldLight.opacity(0.4))
                .cornerRadius(16)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.accentEmerald.opacity(0.3), lineWidth: 1))
                .padding(.horizontal, 16)

                // 3. Assigned Today Pickups Card List
                VStack(alignment: .leading, spacing: 12) {
                    Text("Today's Assigned Home Collections")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                        .padding(.horizontal, 16)

                    ForEach(assignedPickups, id: \.id) { pickup in
                        let isDone = completedPickups.contains(pickup.id)

                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text(pickup.id)
                                    .font(.system(size: 10, weight: .black))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(MedMargTheme.lightTeal)
                                    .cornerRadius(4)

                                Text(pickup.time)
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate700)

                                Spacer()

                                if isDone {
                                    Text("✓ COMPLETED")
                                        .font(.system(size: 10, weight: .black))
                                        .foregroundColor(MedMargTheme.accentEmerald)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(MedMargTheme.emeraldLight)
                                        .cornerRadius(4)
                                }
                            }

                            Text(pickup.name)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)

                            Text(pickup.address)
                                .font(.system(size: 12))
                                .foregroundColor(MedMargTheme.slate500)

                            // Required vacutainer tubes
                            VStack(alignment: .leading, spacing: 4) {
                                Text("REQUIRED TEST TUBES:")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate500)

                                HStack(spacing: 6) {
                                    ForEach(pickup.tubes, id: \.self) { tube in
                                        Text(tube)
                                            .font(.system(size: 10, weight: .bold))
                                            .padding(.horizontal, 6)
                                            .padding(.vertical, 2)
                                            .background(MedMargTheme.slate50)
                                            .foregroundColor(MedMargTheme.slate700)
                                            .cornerRadius(4)
                                    }
                                }
                            }

                            Divider()

                            // Action Workflow Row
                            HStack(spacing: 8) {
                                Button(action: {
                                    if let url = URL(string: "tel:\(pickup.phone.filter { "0123456789".contains($0) })") {
                                        UIApplication.shared.open(url)
                                    }
                                }) {
                                    HStack(spacing: 4) {
                                        Image(systemName: "phone.fill")
                                        Text("Call")
                                    }
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 7)
                                    .background(MedMargTheme.lightTeal)
                                    .cornerRadius(8)
                                }

                                Button(action: {
                                    let urlString = "https://maps.apple.com/?q=\(pickup.address.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
                                    if let url = URL(string: urlString) {
                                        UIApplication.shared.open(url)
                                    }
                                }) {
                                    HStack(spacing: 4) {
                                        Image(systemName: "map.fill")
                                        Text("Navigate")
                                    }
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 7)
                                    .background(MedMargTheme.primaryTeal)
                                    .cornerRadius(8)
                                }

                                Spacer()

                                Button(action: {
                                    if isDone {
                                        completedPickups.remove(pickup.id)
                                    } else {
                                        completedPickups.insert(pickup.id)
                                    }
                                }) {
                                    Text(isDone ? "Reopen" : "Scan & Collect")
                                        .font(.system(size: 12, weight: .bold))
                                        .foregroundColor(.white)
                                        .padding(.horizontal, 14)
                                        .padding(.vertical, 7)
                                        .background(isDone ? MedMargTheme.slate500 : MedMargTheme.accentEmerald)
                                        .cornerRadius(8)
                                }
                            }
                        }
                        .padding(14)
                        .background(MedMargTheme.pureWhite)
                        .cornerRadius(14)
                        .padding(.horizontal, 16)
                    }
                }

                // 4. Daily Earnings & Incentive Card
                VStack(alignment: .leading, spacing: 8) {
                    Text("Today's Earnings & Mileage")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("₹1,450")
                                .font(.system(size: 20, weight: .black))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text("3 Home Pickups • 14.2 KM Total")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Text("Target: 5 Pickups")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.accentEmerald)
                            .padding(6)
                            .background(MedMargTheme.emeraldLight)
                            .cornerRadius(6)
                    }
                }
                .padding(16)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(16)
                .padding(.horizontal, 16)
                .padding(.bottom, 30)
            }
        }
        .background(MedMargTheme.slate50)
    }
}
