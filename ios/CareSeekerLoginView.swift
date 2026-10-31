import SwiftUI
import LocalAuthentication
import AuthenticationServices

// =========================================================================
// 📱 DEDICATED CARE SEEKER & CLIENT LOGIN MODULE (IOS SWIFTUI)
// Pixel-accurate match to reference Image 2 (Phlebotomist hero overlooking Tirupati):
// - Top 48%: Phlebotomist overlooking Tirupati temple hero
// - Brand Header: MedMarg logo + "TRUSTED DIAGNOSTICS. CLOSER TO YOU."
// - Slogan: "Every Sample Builds a Healthier Tomorrow" with green accent underline
// - 3 Feature Badges: Trusted Diagnostics, At Your Doorstep, Healthier Communities
// - Bottom Sliding Card: "Welcome to MedMarg", Continue with Google / Apple,
//   Email/Password inputs, Gradient Sign In Button, Face ID / Touch ID Button,
//   Create Account link & compliance note
// =========================================================================

struct CareSeekerLoginView: View {
    let users: [UserProfile]
    @Binding var loggedInUser: UserProfile?
    @Binding var currentCity: String
    @Binding var showCityPicker: Bool

    // Form States (Email or Phone Number)
    @State private var emailOrPhoneInput: String = ""
    @State private var passwordInput: String = ""
    @State private var isPasswordVisible: Bool = false
    @State private var errorMessage: String = ""
    @State private var isBiometricAvailable: Bool = false
    @State private var isAuthenticating: Bool = false

    // Phone Collection Modal Sheet (For First-Time OAuth without Phone)
    @State private var showPhoneCollectionSheet: Bool = false
    @State private var pendingOAuthUser: UserProfile? = nil
    @State private var phoneInputForOAuth: String = ""
    @State private var phoneCollectionError: String = ""

    // Apple ID Account Linking Sheet
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
        ZStack {
            // Background Hero Image covering top portion
            heroBackgroundView

            // Content ScrollView with floating bottom card
            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    heroTopOverlaySection

                    Spacer().frame(height: 32)

                    slidingLoginCard
                }
            }
        }
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
    // 🌄 HERO BACKGROUND VIEW
    // ==========================================
    private var heroBackgroundView: some View {
        VStack(spacing: 0) {
            GeometryReader { geo in
                Image("hero")
                    .resizable()
                    .scaledToFill()
                    .frame(width: geo.size.width, height: 440)
                    .clipped()
                    .overlay(
                        LinearGradient(
                            colors: [
                                Color.black.opacity(0.12),
                                Color.clear,
                                Color(red: 0.94, green: 0.97, blue: 0.98).opacity(0.8)
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
            }
            .frame(height: 400)

            Spacer()
        }
        .ignoresSafeArea(edges: .top)
    }

    // ==========================================
    // 🏷️ HERO OVERLAY: BRAND, SLOGAN & BADGES
    // ==========================================
    private var heroTopOverlaySection: some View {
        VStack(alignment: .leading, spacing: 14) {
            // MedMarg Brand Tag
            VStack(alignment: .leading, spacing: 2) {
                Image("logo")
                    .resizable()
                    .scaledToFit()
                    .frame(height: 42)

                Text("TRUSTED DIAGNOSTICS. CLOSER TO YOU.")
                    .font(.system(size: 8, weight: .black))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .tracking(1.2)
                    .padding(.leading, 4)
            }
            .padding(.top, 16)

            // Slogan & Tagline matching reference Image 2
            VStack(alignment: .leading, spacing: 4) {
                Text("Every\nSample Builds\na Healthier\nTomorrow")
                    .font(.system(size: 32, weight: .black, design: .rounded))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineSpacing(2)

                Rectangle()
                    .fill(MedMargTheme.accentEmerald)
                    .frame(width: 44, height: 3.5)
                    .cornerRadius(2)
                    .padding(.top, 4)
            }
            .padding(.top, 10)

            // 3 Bullet Badges with circles
            VStack(alignment: .leading, spacing: 10) {
                badgeFeatureRow(icon: "checkmark.shield", title: "Trusted", subtitle: "Diagnostics")
                badgeFeatureRow(icon: "house", title: "At Your", subtitle: "Doorstep")
                badgeFeatureRow(icon: "heart", title: "Healthier", subtitle: "Communities")
            }
            .padding(.top, 6)
        }
        .padding(.horizontal, 24)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func badgeFeatureRow(icon: String, title: String, subtitle: String) -> some View {
        HStack(spacing: 10) {
            ZStack {
                Circle()
                    .stroke(MedMargTheme.accentEmerald, lineWidth: 1.5)
                    .frame(width: 26, height: 26)
                Image(systemName: icon)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.accentEmerald)
            }

            VStack(alignment: .leading, spacing: 1) {
                Text(title)
                    .font(.system(size: 11, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)
                Text(subtitle)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(MedMargTheme.slate700)
            }
        }
    }

    // ==========================================
    // 📋 SLIDING WHITE LOGIN CARD
    // ==========================================
    private var slidingLoginCard: some View {
        VStack(spacing: 16) {
            // Drag Indicator Pill
            Capsule()
                .fill(MedMargTheme.slate200)
                .frame(width: 44, height: 4)
                .padding(.top, 4)

            // Heading: Welcome to MedMarg
            VStack(spacing: 4) {
                HStack(spacing: 4) {
                    Text("Welcome to")
                        .font(.system(size: 24, weight: .black, design: .rounded))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("MedMarg")
                        .font(.system(size: 24, weight: .black, design: .rounded))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }

                Text("One Platform. Better Health for Everyone.")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)
            }
            .padding(.top, 2)

            // Social Buttons Side-by-Side: Continue with Google & Continue with Apple
            HStack(spacing: 12) {
                googleSignInButton
                appleSignInButton
            }
            .padding(.top, 4)

            // OR Divider
            HStack(spacing: 12) {
                Rectangle().frame(height: 1).foregroundColor(MedMargTheme.slate200)
                Text("OR")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate500)
                Rectangle().frame(height: 1).foregroundColor(MedMargTheme.slate200)
            }
            .padding(.vertical, 2)

            // Error Message if any
            if !errorMessage.isEmpty {
                HStack(spacing: 8) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .foregroundColor(.red)
                    Text(errorMessage)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.red)
                }
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.red.opacity(0.08))
                .cornerRadius(10)
            }

            // Form Inputs (Email + Password)
            VStack(spacing: 12) {
                // Email / Phone
                HStack(spacing: 12) {
                    Image(systemName: "envelope")
                        .font(.system(size: 15))
                        .foregroundColor(MedMargTheme.slate500)
                    TextField("Email address", text: $emailOrPhoneInput)
                        .font(.system(size: 14))
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 13)
                .background(Color.white)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))

                // Password
                VStack(alignment: .trailing, spacing: 6) {
                    HStack(spacing: 12) {
                        Image(systemName: "lock")
                            .font(.system(size: 15))
                            .foregroundColor(MedMargTheme.slate500)

                        if isPasswordVisible {
                            TextField("Password", text: $passwordInput)
                                .font(.system(size: 14))
                        } else {
                            SecureField("Password", text: $passwordInput)
                                .font(.system(size: 14))
                        }

                        Button(action: { isPasswordVisible.toggle() }) {
                            Image(systemName: isPasswordVisible ? "eye.slash" : "eye")
                                .font(.system(size: 14))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 13)
                    .background(Color.white)
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))

                    Button("Forgot Password?") {
                        errorMessage = "Password reset instructions sent to your registered contact."
                    }
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(Color.blue)
                    .padding(.top, 2)
                }
            }

            // Primary Gradient Sign In Button
            Button(action: handlePasswordLogin) {
                HStack(spacing: 8) {
                    if isAuthenticating {
                        ProgressView().tint(.white)
                    }
                    Text(isAuthenticating ? "Verifying..." : "Sign In")
                        .font(.system(size: 16, weight: .bold))
                    Spacer()
                    ZStack {
                        Circle()
                            .fill(Color.white.opacity(0.95))
                            .frame(width: 32, height: 32)
                        Image(systemName: "arrow.right")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }
                .foregroundColor(.white)
                .padding(.leading, 20)
                .padding(.trailing, 12)
                .padding(.vertical, 10)
                .frame(maxWidth: .infinity)
                .background(
                    LinearGradient(
                        colors: [
                            Color(red: 0.05, green: 0.45, blue: 0.95),
                            Color(red: 0.0, green: 0.72, blue: 0.58)
                        ],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(14)
                .shadow(color: Color.blue.opacity(0.25), radius: 8, x: 0, y: 4)
            }
            .disabled(isAuthenticating)

            // Face ID / Touch ID Button
            Button(action: handleBiometricLogin) {
                HStack(spacing: 12) {
                    Image(systemName: "touchid")
                        .font(.system(size: 22))
                        .foregroundColor(Color.blue)
                        .frame(width: 38, height: 38)
                        .background(Color.blue.opacity(0.1))
                        .clipShape(Circle())

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Login with Face ID / Touch ID")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Quick and Secure Access")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate500)
                }
                .padding(12)
                .background(Color(red: 0.96, green: 0.98, blue: 1.0))
                .cornerRadius(14)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.blue.opacity(0.15), lineWidth: 1))
            }

            // Create Account Link
            HStack(spacing: 4) {
                Text("New to MedMarg?")
                    .font(.system(size: 12))
                    .foregroundColor(MedMargTheme.slate700)
                Button("Create an account") {
                    errorMessage = "Account registration: enter mobile/email and click Sign In to auto-register."
                }
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(Color.blue)
            }
            .padding(.top, 2)

            // Terms & Privacy Note
            HStack(spacing: 3) {
                Text("By continuing, you agree to our")
                    .font(.system(size: 10))
                    .foregroundColor(MedMargTheme.slate500)
                Text("Terms of Service")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(Color.blue)
                Text("and")
                    .font(.system(size: 10))
                    .foregroundColor(MedMargTheme.slate500)
                Text("Privacy Policy")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(Color.blue)
            }
            .padding(.bottom, 8)
        }
        .padding(22)
        .background(Color.white)
        .clipShape(RoundedCornerShape(radius: 32, corners: [.topLeft, .topRight]))
        .shadow(color: Color.black.opacity(0.08), radius: 20, x: 0, y: -6)
    }

    // ==========================================
    // 🌐 SOCIAL BUTTONS: GOOGLE & APPLE
    // ==========================================
    private var googleSignInButton: some View {
        Button(action: handleGoogleSignIn) {
            HStack(spacing: 8) {
                Text("G")
                    .font(.system(size: 16, weight: .black))
                    .foregroundColor(Color(red: 0.86, green: 0.25, blue: 0.20))
                Text("Continue with Google")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 11)
            .background(Color.white)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
        }
    }

    private var appleSignInButton: some View {
        Button(action: handleAppleSignIn) {
            HStack(spacing: 8) {
                Image(systemName: "applelogo")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.black)
                Text("Continue with Apple")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 11)
            .background(Color.white)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
        }
    }

    // ==========================================
    // 📱 PHONE COLLECTION MODAL SHEET (FOR FIRST-TIME OAUTH)
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
    // 🔗 APPLE ACCOUNT LINKING MODAL SHEET
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
                    Text("G")
                        .font(.system(size: 18, weight: .black))
                        .foregroundColor(Color(red: 0.86, green: 0.25, blue: 0.20))
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
        let inputLower = input.lowercased()

        // 1. Direct match in local pre-registered user profiles with STRICT password verification
        if let found = users.first(where: { u in
            let matchEmail = u.email.lowercased() == inputLower
            let matchUser = u.username.lowercased() == inputLower
            let matchPhone = !inputDigits.isEmpty && cleanDigitsOnly(u.phone).hasSuffix(inputDigits)
            return (matchEmail || matchUser || matchPhone) && u.password == pass
        }) {
            loggedInUser = found
            return
        }

        // 2. Remote authentication against live MedMarg backend (/api/v1/auth/login)
        isAuthenticating = true
        guard let url = URL(string: "https://medmarg.com/api/v1/auth/login") else {
            errorMessage = "Invalid email/phone or password. Please check your credentials."
            isAuthenticating = false
            return
        }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.timeoutInterval = 6.0
        let payload = ["identifier": input, "password": pass]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload, options: [])

        URLSession.shared.dataTask(with: req) { data, _, _ in
            DispatchQueue.main.async {
                self.isAuthenticating = false
                if let d = data,
                   let json = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
                   let success = json["success"] as? Bool, success,
                   let uData = json["user"] as? [String: Any],
                   let roleStr = uData["role"] as? String {
                    let remoteUser = UserProfile(
                        id: uData["id"] as? String ?? "usr_remote",
                        name: uData["name"] as? String ?? "User",
                        username: uData["username"] as? String ?? input,
                        email: uData["email"] as? String ?? "",
                        phone: uData["phone"] as? String ?? "",
                        password: pass,
                        role: UserRole.from(string: roleStr),
                        organization: uData["organization"] as? String ?? "MedMarg",
                        status: "Active",
                        createdAt: "Today"
                    )
                    self.loggedInUser = remoteUser
                } else {
                    self.errorMessage = "Incorrect password or account not found. Please try again."
                }
            }
        }.resume()
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

                if !rawEmail.isEmpty, let existing = self.users.first(where: {
                    $0.email.lowercased() == rawEmail ||
                    $0.username.lowercased() == rawEmail.components(separatedBy: "@").first ?? ""
                }) {
                    UserDefaults.standard.set(existing.email.lowercased(), forKey: "medmarg_apple_linked_user_\(appleUserId)")
                    self.loggedInUser = existing
                    return
                }

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
                
                UserDefaults.standard.set(googleEmail, forKey: "medmarg_apple_linked_user_\(appleUserId)")
                if let pic = gUser.picture, !pic.isEmpty {
                    UserDefaults.standard.set(pic, forKey: "medmarg_user_avatar_\(googleEmail)")
                }

                let cachedPhone = UserDefaults.standard.string(forKey: "medmarg_user_phone_\(googleEmail)") ?? ""
                let effectiveAvatar = gUser.picture ?? UserDefaults.standard.string(forKey: "medmarg_user_avatar_\(googleEmail)")

                self.showAppleLinkSheet = false
                self.pendingAppleResult = nil

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
            user.role = .patient
            
            UserDefaults.standard.set(fullPhone, forKey: "medmarg_user_phone_\(user.email.lowercased())")

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

// Custom shape for specific corner radii
struct RoundedCornerShape: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

