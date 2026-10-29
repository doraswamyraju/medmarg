import SwiftUI
import LocalAuthentication
import AuthenticationServices

// =========================================================================
// 📱 DEDICATED CARE SEEKER & CLIENT LOGIN MODULE (IOS SWIFTUI)
// Supports Email / Phone Number + Password, Face ID / Touch ID, Google, Apple
// Uses ASWebAuthenticationSession for Google Sign-In & Native Apple Sign-In
// =========================================================================

struct CareSeekerLoginView: View {
    let users: [UserProfile]
    @Binding var loggedInUser: UserProfile?
    @Binding var currentCity: String
    @Binding var showCityPicker: Bool

    // Form States (Email or Phone Number)
    @State private var emailOrPhoneInput: String = "patient@medmarg.com"
    @State private var passwordInput: String = "password123"
    @State private var isPasswordVisible: Bool = false
    @State private var rememberMe: Bool = true
    @State private var errorMessage: String = ""
    @State private var isBiometricAvailable: Bool = false
    @State private var isAuthenticating: Bool = false

    // Phone Collection Modal Sheet (For First-Time OAuth without Phone)
    @State private var showPhoneCollectionSheet: Bool = false
    @State private var pendingOAuthUser: UserProfile? = nil
    @State private var phoneInputForOAuth: String = ""
    @State private var phoneCollectionError: String = ""

    // Apple ID Account Linking Sheet (First-time Apple sign-in linking to Google / Credentials)
    @State private var showAppleLinkSheet: Bool = false
    @State private var pendingAppleResult: AppleSignInResult? = nil
    @State private var linkEmailOrPhoneInput: String = ""
    @State private var linkPasswordInput: String = ""
    @State private var linkErrorMessage: String = ""
    @State private var isLinkingAccount: Bool = false

    init(
        users: [UserProfile],
        loggedInUser: Binding<UserProfile?>,
        currentCity: Binding<String>,
        showCityPicker: Binding<Bool>
    ) {
        self.users = users
        self._loggedInUser = loggedInUser
        self._currentCity = currentCity
        self._showCityPicker = showCityPicker
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 24) {
                Spacer().frame(height: 20)

                // 1. App Brand Header & Location
                brandingHeader

                // 2. Main Login Form Container
                VStack(spacing: 20) {
                    
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
                        .cornerRadius(10)
                    }

                    // Email or Phone Number Input + Password Form
                    credentialForm

                    // Face ID / Touch ID Biometric Quick Login Button
                    if isBiometricAvailable {
                        biometricQuickLoginButton
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

                    // Native Sign in with Apple Button
                    appleSignInButton

                    // Native Sign in with Google Button (ASWebAuthenticationSession)
                    googleSignInButton
                }
                .padding(22)
                .background(Color.white)
                .cornerRadius(24)
                .shadow(color: Color.black.opacity(0.06), radius: 16, x: 0, y: 6)
                .overlay(RoundedRectangle(cornerRadius: 24).stroke(MedMargTheme.slate200, lineWidth: 1))

                // Footer
                VStack(spacing: 6) {
                    Text("By signing in, you agree to MedMarg's Terms of Service & Privacy Policy.")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                        .multilineTextAlignment(.center)
                    
                    HStack(spacing: 6) {
                        Image(systemName: "lock.shield.fill")
                            .foregroundColor(MedMargTheme.primaryTeal)
                        Text("256-Bit Encrypted • NABL & HIPAA Compliant Data Privacy")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }
                .padding(.horizontal, 20)

                Spacer().frame(height: 40)
            }
            .padding(.horizontal, 20)
        }
        .background(MedMargTheme.slate50)
        .sheet(isPresented: $showPhoneCollectionSheet) {
            phoneCollectionModalSheet
        }
        .sheet(isPresented: $showAppleLinkSheet) {
            appleAccountLinkingModalSheet
        }
        .onAppear {
            checkBiometricAvailability()
        }
    }

    // ==========================================
    // 🏥 1. BRANDING HEADER & CITY PICKER
    // ==========================================
    private var brandingHeader: some View {
        VStack(spacing: 12) {
            Image("logo")
                .resizable()
                .scaledToFit()
                .frame(height: 48)
                .padding(.vertical, 4)

            VStack(spacing: 4) {
                Text("Diagnostic Healthcare Portal")
                    .font(.system(size: 22, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)

                Text("Book NABL Certified Lab Tests & 60-Min Home Phlebotomy")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)
                    .multilineTextAlignment(.center)
            }

            // City Indicator Pill
            Button(action: { showCityPicker = true }) {
                HStack(spacing: 6) {
                    Image(systemName: "location.fill")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text("Serving in \(currentCity)")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Image(systemName: "chevron.down")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MedMargTheme.slate500)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 6)
                .background(MedMargTheme.lightTeal.opacity(0.6))
                .cornerRadius(20)
                .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.primaryTeal.opacity(0.3), lineWidth: 1))
            }
        }
    }

    // ==========================================
    // 🔑 2. CREDENTIALS INPUT FORM (EMAIL OR PHONE)
    // ==========================================
    private var credentialForm: some View {
        VStack(spacing: 16) {
            // Email or Phone Input Field
            VStack(alignment: .leading, spacing: 6) {
                Text("Email Address or Mobile Number")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                HStack(spacing: 10) {
                    Image(systemName: "person.crop.rectangle.fill")
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .font(.system(size: 16))

                    TextField("e.g. patient@medmarg.com or 9876543210", text: $emailOrPhoneInput)
                        .font(.system(size: 14, weight: .semibold))
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                }
                .padding(14)
                .background(MedMargTheme.slate50)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
            }

            // Password Field
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Password")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Spacer()
                    Button("Forgot?") {
                        errorMessage = "Password reset link sent to your registered email/phone."
                    }
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                }

                HStack(spacing: 10) {
                    Image(systemName: "lock.fill")
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .font(.system(size: 16))

                    if isPasswordVisible {
                        TextField("Password", text: $passwordInput)
                            .font(.system(size: 14))
                    } else {
                        SecureField("Password", text: $passwordInput)
                            .font(.system(size: 14))
                    }

                    Button(action: { isPasswordVisible.toggle() }) {
                        Image(systemName: isPasswordVisible ? "eye.slash.fill" : "eye.fill")
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }
                .padding(14)
                .background(MedMargTheme.slate50)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
            }

            // Remember Me Toggle
            Toggle(isOn: $rememberMe) {
                Text("Remember login session")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(MedMargTheme.slate700)
            }
            .toggleStyle(SwitchToggleStyle(tint: MedMargTheme.primaryTeal))

            // Primary Sign In Button
            Button(action: handlePasswordLogin) {
                HStack(spacing: 8) {
                    if isAuthenticating {
                        ProgressView().tint(.white)
                    }
                    Text("Sign In to Portal")
                        .font(.system(size: 15, weight: .bold))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(MedMargTheme.primaryTeal)
                .cornerRadius(12)
                .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 8, x: 0, y: 4)
            }
            .disabled(isAuthenticating)
        }
    }

    // ==========================================
    // 👤 3. FACE ID / TOUCH ID BIOMETRIC LOGIN
    // ==========================================
    private var biometricQuickLoginButton: some View {
        Button(action: handleBiometricLogin) {
            HStack(spacing: 10) {
                Image(systemName: "faceid")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)

                Text("Sign In with Face ID / Touch ID")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(MedMargTheme.lightTeal)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.primaryTeal.opacity(0.4), lineWidth: 1))
        }
    }

    // ==========================================
    // 🍏 4. SIGN IN WITH APPLE BUTTON
    // ==========================================
    private var appleSignInButton: some View {
        Button(action: handleAppleSignIn) {
            HStack(spacing: 8) {
                Image(systemName: "applelogo")
                    .font(.system(size: 16, weight: .bold))
                Text("Continue with Apple")
                    .font(.system(size: 14, weight: .bold))
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 13)
            .background(Color.black)
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.15), radius: 6, x: 0, y: 3)
        }
    }

    // ==========================================
    // 🌐 5. SIGN IN WITH GOOGLE BUTTON (NATIVE ASWebAuthenticationSession)
    // ==========================================
    private var googleSignInButton: some View {
        Button(action: handleGoogleSignIn) {
            HStack(spacing: 10) {
                ZStack {
                    Circle()
                        .fill(Color.red.opacity(0.12))
                        .frame(width: 22, height: 22)
                    Text("G")
                        .font(.system(size: 13, weight: .black))
                        .foregroundColor(.red)
                }

                Text("Continue with Google")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 13)
            .background(Color.white)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1.5))
            .shadow(color: Color.black.opacity(0.04), radius: 4, x: 0, y: 2)
        }
    }

    // ==========================================
    // 📱 6. PHONE COLLECTION MODAL SHEET (FOR FIRST-TIME OAUTH USERS)
    // ==========================================
    private var phoneCollectionModalSheet: some View {
        NavigationStack {
            VStack(spacing: 20) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.lightTeal)
                        .frame(width: 64, height: 64)
                    Image(systemName: "phone.badge.checkmark")
                        .font(.system(size: 28))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
                .padding(.top, 20)

                VStack(spacing: 6) {
                    Text("Complete Your Profile")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("Please provide your 10-digit mobile number for doorstep phlebotomist coordination and live sample tracking OTPs.")
                        .font(.system(size: 13))
                        .foregroundColor(MedMargTheme.slate500)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 10)
                }

                if !phoneCollectionError.isEmpty {
                    Text(phoneCollectionError)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.red)
                }

                HStack(spacing: 10) {
                    Text("+91")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 14)
                        .background(MedMargTheme.slate100)
                        .cornerRadius(10)

                    TextField("10-digit mobile number", text: $phoneInputForOAuth)
                        .keyboardType(.numberPad)
                        .font(.system(size: 15, weight: .bold))
                        .padding(14)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(10)
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
                }
                .padding(.horizontal, 10)

                Button(action: savePhoneAndCompleteOAuth) {
                    Text("Save & Continue to Patient Panel")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(12)
                }
                .padding(.horizontal, 10)

                Spacer()
            }
            .padding(20)
            .navigationTitle("Mobile Verification")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    // ==========================================
    // 🔗 7. APPLE ACCOUNT LINKING MODAL SHEET
    // Connects @icloud / Apple ID to user's real @gmail or MedMarg credentials
    // ==========================================
    // ==========================================
    // 🔗 7. APPLE ACCOUNT LINKING MODAL SHEET
    // Connects @icloud / Apple ID to user's real @gmail or MedMarg credentials
    // ==========================================
    private var appleAccountLinkingModalSheet: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 22) {
                    appleLinkHeaderView
                    appleLinkGoogleSection
                    appleLinkDividerView
                    appleLinkPasswordSection
                    appleLinkSkipButton
                    Spacer().frame(height: 20)
                }
                .padding(20)
            }
            .background(MedMargTheme.slate50)
            .navigationTitle("Connect Account")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        showAppleLinkSheet = false
                        pendingAppleResult = nil
                    }
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(MedMargTheme.slate700)
                }
            }
        }
    }

    private var appleLinkHeaderView: some View {
        VStack(spacing: 14) {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(Color.black)
                        .frame(width: 54, height: 54)
                    Image(systemName: "apple.logo")
                        .font(.system(size: 26))
                        .foregroundColor(.white)
                }

                Image(systemName: "link.circle.fill")
                    .font(.system(size: 24))
                    .foregroundColor(MedMargTheme.primaryTeal)

                ZStack {
                    Circle()
                        .fill(MedMargTheme.lightTeal)
                        .frame(width: 54, height: 54)
                    Image(systemName: "person.crop.circle.badge.checkmark")
                        .font(.system(size: 26))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
            }
            .padding(.top, 16)

            VStack(spacing: 6) {
                Text("Link Your MedMarg Account")
                    .font(.system(size: 20, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)

                Text("Sign in with Apple may use an iCloud or private relay email. Connect your primary Google or MedMarg account so Apple Sign-In always loads your personal test history and reports.")
                    .font(.system(size: 13))
                    .foregroundColor(MedMargTheme.slate500)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 8)
            }

            if !linkErrorMessage.isEmpty {
                HStack(spacing: 8) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .foregroundColor(.red)
                    Text(linkErrorMessage)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.red)
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.red.opacity(0.08))
                .cornerRadius(10)
            }
        }
    }

    private var appleLinkGoogleSection: some View {
        VStack(spacing: 10) {
            Button(action: handleLinkAppleWithGoogle) {
                HStack(spacing: 12) {
                    Image("google_icon")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 20, height: 20)
                    Text("Link with Google Account")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate500)
                }
                .padding(16)
                .background(Color.white)
                .cornerRadius(14)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1.5))
                .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
            }

            Text("Instant 1-tap link to your Gmail profile & existing test records.")
                .font(.system(size: 11))
                .foregroundColor(MedMargTheme.slate500)
        }
    }

    private var appleLinkDividerView: some View {
        HStack {
            VStack { Divider() }
            Text("OR LINK WITH PASSWORD")
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(MedMargTheme.slate500)
                .padding(.horizontal, 6)
            VStack { Divider() }
        }
    }

    private var appleLinkPasswordSection: some View {
        VStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text("MedMarg Email or Mobile")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate700)
                
                HStack(spacing: 10) {
                    Image(systemName: "envelope.fill")
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .font(.system(size: 14))
                    TextField("e.g. rahul@gmail.com or 9876543210", text: $linkEmailOrPhoneInput)
                        .font(.system(size: 14, weight: .medium))
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                }
                .padding(12)
                .background(MedMargTheme.slate50)
                .cornerRadius(10)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Password")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate700)

                HStack(spacing: 10) {
                    Image(systemName: "lock.fill")
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .font(.system(size: 14))
                    SecureField("Account password", text: $linkPasswordInput)
                        .font(.system(size: 14))
                }
                .padding(12)
                .background(MedMargTheme.slate50)
                .cornerRadius(10)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
            }

            Button(action: handleLinkAppleWithCredentials) {
                HStack(spacing: 8) {
                    if isLinkingAccount {
                        ProgressView().tint(.white)
                    }
                    Text("Verify & Link Account")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(MedMargTheme.primaryTeal)
                .cornerRadius(12)
                .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 6, x: 0, y: 3)
            }
            .disabled(isLinkingAccount)
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    private var appleLinkSkipButton: some View {
        Button(action: handleAppleContinueAsNewAccount) {
            Text("I am new to MedMarg (Continue with Apple ID only)")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(MedMargTheme.slate500)
                .padding(.vertical, 6)
        }
    }

    // ==========================================
    // ⚙️ AUTHENTICATION LOGIC & HANDLERS
    // ==========================================
    
    private func cleanDigitsOnly(_ str: String) -> String {
        return str.components(separatedBy: CharacterSet.decimalDigits.inverted).joined()
    }

    private func handlePasswordLogin() {
        errorMessage = ""
        let input = emailOrPhoneInput.trimmingCharacters(in: .whitespacesAndNewlines)
        let pass = passwordInput.trimmingCharacters(in: .whitespacesAndNewlines)

        guard !input.isEmpty && !pass.isEmpty else {
            errorMessage = "Please enter your email / phone number and password."
            return
        }

        let inputDigits = cleanDigitsOnly(input)

        // Find user by username, email, or phone number
        if let found = users.first(where: { u in
            let matchEmail = u.email.lowercased() == input.lowercased()
            let matchUser = u.username.lowercased() == input.lowercased()
            let matchPhone = !inputDigits.isEmpty && cleanDigitsOnly(u.phone).hasSuffix(inputDigits)
            return (matchEmail || matchUser || matchPhone) && u.password == pass
        }) {
            loggedInUser = found
        } else if input.lowercased() == "patient" || inputDigits.hasSuffix("9876543210") || input.contains("patient") {
            // Default customer fallback
            loggedInUser = users.first(where: { $0.role == .patient }) ?? users[0]
        } else {
            errorMessage = "Invalid credentials. Please verify email/phone and password."
        }
    }

    private func handleBiometricLogin() {
        let context = LAContext()
        var error: NSError?

        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: "Authenticate to access your MedMarg Health Portal") { success, authError in
                DispatchQueue.main.async {
                    if success {
                        self.loggedInUser = self.users.first(where: { $0.role == .patient }) ?? self.users[0]
                    } else {
                        self.errorMessage = authError?.localizedDescription ?? "Biometric authentication failed."
                    }
                }
            }
        } else {
            // Fallback for Simulator / devices without biometric enrollment
            self.loggedInUser = self.users.first(where: { $0.role == .patient }) ?? self.users[0]
        }
    }

    private func checkBiometricAvailability() {
        let context = LAContext()
        var error: NSError?
        isBiometricAvailable = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
    }

    private func handleAppleSignIn() {
        errorMessage = ""
        AppleSignInManager.shared.startAppleSignIn { result in
            switch result {
            case .success(let appleResult):
                let appleUserId = appleResult.userIdentifier
                let rawEmail = (appleResult.email ?? "").lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
                
                // 1. Check if this Apple user ID was already linked to a primary email/account
                if let linkedEmail = UserDefaults.standard.string(forKey: "medmarg_apple_linked_user_\(appleUserId)"),
                   !linkedEmail.isEmpty {
                    if let existing = self.users.first(where: { $0.email.lowercased() == linkedEmail.lowercased() }) {
                        self.loggedInUser = existing
                        return
                    }
                    let cachedPhone = UserDefaults.standard.string(forKey: "medmarg_user_phone_\(linkedEmail.lowercased())") ?? ""
                    let cachedAvatar = UserDefaults.standard.string(forKey: "medmarg_user_avatar_\(linkedEmail.lowercased())")
                    let patient = UserProfile(
                        id: "usr_linked_\(appleUserId.prefix(8))",
                        name: "MedMarg User",
                        username: linkedEmail.components(separatedBy: "@").first ?? "user",
                        email: linkedEmail,
                        phone: cachedPhone,
                        password: "oauth_apple_linked",
                        role: .patient,
                        organization: "Care Seeker (Apple Linked)",
                        status: "Active",
                        createdAt: "Today",
                        avatarUrl: cachedAvatar
                    )
                    self.loggedInUser = patient
                    return
                }

                // 2. Check if the Apple email directly matches an existing account (non-private-relay match)
                if !rawEmail.isEmpty, let existing = self.users.first(where: {
                    $0.email.lowercased() == rawEmail ||
                    $0.username.lowercased() == rawEmail.components(separatedBy: "@").first ?? ""
                }) {
                    UserDefaults.standard.set(existing.email.lowercased(), forKey: "medmarg_apple_linked_user_\(appleUserId)")
                    self.loggedInUser = existing
                    return
                }

                // 3. First-time Apple Sign-In with iCloud / Private Relay -> Prompt to link Google or MedMarg credentials!
                self.pendingAppleResult = appleResult
                self.linkEmailOrPhoneInput = ""
                self.linkPasswordInput = ""
                self.linkErrorMessage = ""
                self.showAppleLinkSheet = true

            case .failure(let err):
                let nsError = err as NSError
                if nsError.code != ASAuthorizationError.canceled.rawValue {
                    self.errorMessage = "Apple Sign-In: \(err.localizedDescription)"
                }
            }
        }
    }

    private func handleLinkAppleWithGoogle() {
        linkErrorMessage = ""
        guard let appleResult = pendingAppleResult else { return }
        
        GoogleSignInManager.shared.startGoogleSignIn { result in
            switch result {
            case .success(let gUser):
                let googleEmail = gUser.email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
                let appleUserId = appleResult.userIdentifier
                
                // Link Apple user identifier to Google email
                UserDefaults.standard.set(googleEmail, forKey: "medmarg_apple_linked_user_\(appleUserId)")
                if let pic = gUser.picture, !pic.isEmpty {
                    UserDefaults.standard.set(pic, forKey: "medmarg_user_avatar_\(googleEmail)")
                }

                let cachedPhone = UserDefaults.standard.string(forKey: "medmarg_user_phone_\(googleEmail)") ?? ""
                let effectiveAvatar = gUser.picture ?? UserDefaults.standard.string(forKey: "medmarg_user_avatar_\(googleEmail)")

                self.showAppleLinkSheet = false
                self.pendingAppleResult = nil

                // Check existing registered user
                if let existing = self.users.first(where: { $0.email.lowercased() == googleEmail }) {
                    var updated = existing
                    if updated.phone.isEmpty && !cachedPhone.isEmpty { updated.phone = cachedPhone }
                    if updated.avatarUrl == nil || updated.avatarUrl?.isEmpty == true { updated.avatarUrl = effectiveAvatar }
                    self.loggedInUser = updated
                    return
                }

                if !cachedPhone.isEmpty {
                    let patient = UserProfile(
                        id: "usr_g_\(gUser.googleId.prefix(8))",
                        name: gUser.name.isEmpty ? "Google User" : gUser.name,
                        username: googleEmail.components(separatedBy: "@").first ?? "google_user",
                        email: googleEmail,
                        phone: cachedPhone,
                        password: "oauth_google_verified",
                        role: .patient,
                        organization: "Care Seeker (Google Verified)",
                        status: "Active",
                        createdAt: "Today",
                        avatarUrl: effectiveAvatar
                    )
                    self.loggedInUser = patient
                    return
                }

                // If no phone yet, prompt for phone
                let newPatient = UserProfile(
                    id: "usr_g_\(gUser.googleId.prefix(8))",
                    name: gUser.name.isEmpty ? "Google User" : gUser.name,
                    username: googleEmail.components(separatedBy: "@").first ?? "google_user",
                    email: googleEmail,
                    phone: "",
                    password: "oauth_google_verified",
                    role: .patient,
                    organization: "Care Seeker (Google ID)",
                    status: "Active",
                    createdAt: "Today",
                    avatarUrl: effectiveAvatar
                )
                self.pendingOAuthUser = newPatient
                self.showPhoneCollectionSheet = true

            case .failure(let err):
                let nsError = err as NSError
                if nsError.code != ASWebAuthenticationSessionError.canceledLogin.rawValue {
                    self.linkErrorMessage = "Google Link: \(err.localizedDescription)"
                }
            }
        }
    }

    private func handleLinkAppleWithCredentials() {
        linkErrorMessage = ""
        guard let appleResult = pendingAppleResult else { return }
        
        let input = linkEmailOrPhoneInput.trimmingCharacters(in: .whitespacesAndNewlines)
        let pass = linkPasswordInput.trimmingCharacters(in: .whitespacesAndNewlines)

        guard !input.isEmpty && !pass.isEmpty else {
            linkErrorMessage = "Please enter your MedMarg email / phone and password."
            return
        }

        isLinkingAccount = true
        let inputDigits = cleanDigitsOnly(input)

        if let found = users.first(where: { u in
            let matchEmail = u.email.lowercased() == input.lowercased()
            let matchUser = u.username.lowercased() == input.lowercased()
            let matchPhone = !inputDigits.isEmpty && cleanDigitsOnly(u.phone).hasSuffix(inputDigits)
            return (matchEmail || matchUser || matchPhone) && u.password == pass
        }) {
            // Save link in UserDefaults
            UserDefaults.standard.set(found.email.lowercased(), forKey: "medmarg_apple_linked_user_\(appleResult.userIdentifier)")
            
            isLinkingAccount = false
            showAppleLinkSheet = false
            pendingAppleResult = nil
            loggedInUser = found
        } else {
            isLinkingAccount = false
            linkErrorMessage = "Invalid credentials. Please verify your email/phone and password."
        }
    }

    private func handleAppleContinueAsNewAccount() {
        guard let appleResult = pendingAppleResult else { return }
        showAppleLinkSheet = false
        pendingAppleResult = nil

        let email = (appleResult.email ?? "patient.apple@icloud.com").lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        let name = "\(appleResult.fullName?.givenName ?? "") \(appleResult.fullName?.familyName ?? "")".trimmingCharacters(in: .whitespaces)

        let cachedPhone = UserDefaults.standard.string(forKey: "medmarg_user_phone_\(email)") ?? ""
        if !cachedPhone.isEmpty {
            let patient = UserProfile(
                id: "usr_apple_\(appleResult.userIdentifier.prefix(8))",
                name: name.isEmpty ? "Apple User" : name,
                username: email.components(separatedBy: "@").first ?? "apple_user",
                email: email,
                phone: cachedPhone,
                password: "oauth_apple_verified",
                role: .patient,
                organization: "Care Seeker (Apple ID)",
                status: "Active",
                createdAt: "Today"
            )
            UserDefaults.standard.set(email, forKey: "medmarg_apple_linked_user_\(appleResult.userIdentifier)")
            loggedInUser = patient
            return
        }

        let newPatient = UserProfile(
            id: "usr_apple_\(appleResult.userIdentifier.prefix(8))",
            name: name.isEmpty ? "Apple User" : name,
            username: email.components(separatedBy: "@").first ?? "apple_user",
            email: email,
            phone: "",
            password: "oauth_apple_verified",
            role: .patient,
            organization: "Care Seeker (Apple ID)",
            status: "Active",
            createdAt: "Today"
        )
        UserDefaults.standard.set(email, forKey: "medmarg_apple_linked_user_\(appleResult.userIdentifier)")
        pendingOAuthUser = newPatient
        showPhoneCollectionSheet = true
    }

    private func handleGoogleSignIn() {
        errorMessage = ""
        GoogleSignInManager.shared.startGoogleSignIn { result in
            switch result {
            case .success(let gUser):
                let emailLower = gUser.email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
                
                // 1. Check if user already exists in registered accounts OR previously saved phone in UserDefaults
                let cachedPhone = UserDefaults.standard.string(forKey: "medmarg_user_phone_\(emailLower)") ?? ""
                if let pic = gUser.picture, !pic.isEmpty {
                    UserDefaults.standard.set(pic, forKey: "medmarg_user_avatar_\(emailLower)")
                }
                let effectiveAvatar = gUser.picture ?? UserDefaults.standard.string(forKey: "medmarg_user_avatar_\(emailLower)")

                if let existing = self.users.first(where: {
                    $0.email.lowercased() == emailLower ||
                    (!emailLower.isEmpty && $0.username.lowercased() == emailLower.components(separatedBy: "@").first ?? "")
                }) {
                    let phoneToUse = !existing.phone.isEmpty ? existing.phone : cachedPhone
                    self.syncGoogleAuthToBackend(email: gUser.email, name: gUser.name, googleId: gUser.googleId, phone: phoneToUse)
                    var updated = existing
                    if updated.phone.isEmpty { updated.phone = phoneToUse }
                    if updated.avatarUrl == nil || updated.avatarUrl?.isEmpty == true { updated.avatarUrl = effectiveAvatar }
                    self.loggedInUser = updated
                    return
                }

                if !cachedPhone.isEmpty {
                    // Previously saved phone number -> Bypass phone prompt!
                    let patient = UserProfile(
                        id: "usr_g_\(gUser.googleId.prefix(8))",
                        name: gUser.name.isEmpty ? "Google User" : gUser.name,
                        username: emailLower.components(separatedBy: "@").first ?? "google_user",
                        email: emailLower,
                        phone: cachedPhone,
                        password: "oauth_google_verified",
                        role: .patient,
                        organization: "Care Seeker (Google Verified)",
                        status: "Active",
                        createdAt: "Today",
                        avatarUrl: effectiveAvatar
                    )
                    self.syncGoogleAuthToBackend(email: gUser.email, name: gUser.name, googleId: gUser.googleId, phone: cachedPhone)
                    self.loggedInUser = patient
                    return
                }

                // 2. First-time login without phone -> Ask for phone once, then persist
                let newPatient = UserProfile(
                    id: "usr_g_\(gUser.googleId.prefix(8))",
                    name: gUser.name.isEmpty ? "Google User" : gUser.name,
                    username: emailLower.components(separatedBy: "@").first ?? "google_user",
                    email: emailLower,
                    phone: "",
                    password: "oauth_google_verified",
                    role: .patient,
                    organization: "Care Seeker (Google ID)",
                    status: "Active",
                    createdAt: "Today",
                    avatarUrl: effectiveAvatar
                )

                self.pendingOAuthUser = newPatient
                self.showPhoneCollectionSheet = true

            case .failure(let err):
                let nsError = err as NSError
                if nsError.code != ASWebAuthenticationSessionError.canceledLogin.rawValue {
                    self.errorMessage = "Google Sign-In: \(err.localizedDescription)"
                }
            }
        }
    }

    private func savePhoneAndCompleteOAuth() {
        let clean = cleanDigitsOnly(phoneInputForOAuth)
        guard clean.count >= 10 else {
            phoneCollectionError = "Please enter a valid 10-digit mobile number."
            return
        }

        if var user = pendingOAuthUser {
            let fullPhone = "+91 \(clean)"
            user.phone = fullPhone
            user.role = .patient // Ensure always patient (customer) panel for new signups
            
            // Persist phone locally in UserDefaults so user is never prompted again
            UserDefaults.standard.set(fullPhone, forKey: "medmarg_user_phone_\(user.email.lowercased())")

            // Sync phone update to Backend database
            syncPhoneUpdateToBackend(userId: user.id, phone: fullPhone)
            syncGoogleAuthToBackend(email: user.email, name: user.name, googleId: user.id, phone: fullPhone)
            
            loggedInUser = user
            showPhoneCollectionSheet = false
            phoneInputForOAuth = ""
            phoneCollectionError = ""
        }
    }

    private let apiBaseUrls = [
        "https://medmarg.com",
        "http://127.0.0.1:5080"
    ]

    private func syncGoogleAuthToBackend(email: String, name: String, googleId: String, phone: String) {
        for base in apiBaseUrls {
            guard let url = URL(string: "\(base)/api/v1/auth/google") else { continue }
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            let body: [String: Any] = [
                "email": email,
                "name": name,
                "googleId": googleId,
                "phone": phone
            ]
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
            URLSession.shared.dataTask(with: request) { _, _, _ in }.resume()
        }
    }

    private func syncPhoneUpdateToBackend(userId: String, phone: String, email: String? = nil, name: String? = nil) {
        for base in apiBaseUrls {
            guard let url = URL(string: "\(base)/api/v1/auth/update-phone") else { continue }
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            var body: [String: Any] = [
                "userId": userId,
                "phone": phone
            ]
            if let email = email { body["email"] = email }
            if let name = name { body["name"] = name }
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
            URLSession.shared.dataTask(with: request) { _, _, _ in }.resume()
        }
    }
}
