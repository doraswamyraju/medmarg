import SwiftUI
import LocalAuthentication

// =========================================================================
// 📱 DEDICATED CARE SEEKER & CLIENT LOGIN MODULE (IOS SWIFTUI)
// =========================================================================

struct CareSeekerLoginView: View {
    let users: [UserProfile]
    @Binding var loggedInUser: UserProfile?
    @Binding var currentCity: String
    @Binding var showCityPicker: Bool

    // Login Modes: "PHONE_OTP" | "PASSWORD" | "BIOMETRIC"
    @State private var loginMode: String = "PHONE_OTP"

    // Form States
    @State private var mobileNumber: String = ""
    @State private var otpCode: String = ""
    @State private var isOtpSent: Bool = false
    @State private var countdownSeconds: Int = 30
    @State private var timerActive: Bool = false

    @State private var usernameOrEmail: String = "patient"
    @State private var passwordInput: String = "password123"
    @State private var isPasswordVisible: Bool = false
    @State private var rememberMe: Bool = true
    @State private var errorMessage: String = ""
    @State private var isBiometricAvailable: Bool = false

    // Google Sign-In & Missing Phone Sheet
    @State private var showGooglePhoneSheet: Bool = false
    @State private var tempGoogleUser: UserProfile? = nil
    @State private var googlePhoneInput: String = ""
    @State private var googlePhoneError: String = ""

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
                    // Login Mode Switcher Tab (Mobile OTP vs Email/Password)
                    loginModeSelector

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

                    if loginMode == "PHONE_OTP" {
                        phoneOtpForm
                    } else {
                        passwordForm
                    }

                    // FaceID / Biometric Login Option
                    if isBiometricAvailable {
                        biometricQuickLoginButton
                    }

                    // Divider
                    HStack {
                        VStack { Divider() }
                        Text("OR SIGN IN WITH")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                            .padding(.horizontal, 8)
                        VStack { Divider() }
                    }

                    // Google Login Button
                    googleSignInButton

                    // 1-Click Demo Care Seeker Access
                    oneClickDemoButton
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

                Spacer().frame(height: 30)
            }
            .padding(.horizontal, 16)
        }
        .background(MedMargTheme.slate50.ignoresSafeArea())
        .onAppear {
            checkBiometricAvailability()
        }
        .sheet(isPresented: $showGooglePhoneSheet) {
            googlePhonePromptSheet
        }
    }

    // ==========================================
    // 🏥 1. BRANDING HEADER
    // ==========================================
    private var brandingHeader: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                Image("logo-icon")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 58, height: 58)
                    .cornerRadius(14)
                    .shadow(color: MedMargTheme.primaryTeal.opacity(0.25), radius: 8, x: 0, y: 4)

                VStack(alignment: .leading, spacing: 2) {
                    Text("MedMarg")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    Text("CARE SEEKER PORTAL")
                        .font(.system(size: 11, weight: .heavy))
                        .foregroundColor(MedMargTheme.accentEmerald)
                        .tracking(1.4)
                }
            }

            Text("Multi-Lab Diagnostic Tests, Apple Health Vitals & Home Phlebotomy")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(MedMargTheme.slate500)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 20)

            // Location Badge
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
                .padding(.vertical, 7)
                .background(MedMargTheme.lightTeal)
                .cornerRadius(20)
            }
        }
    }

    // ==========================================
    // 🔀 2. LOGIN MODE SELECTOR
    // ==========================================
    private var loginModeSelector: some View {
        HStack(spacing: 0) {
            Button(action: {
                loginMode = "PHONE_OTP"
                errorMessage = ""
            }) {
                HStack(spacing: 6) {
                    Image(systemName: "phone.fill")
                    Text("Mobile OTP")
                }
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(loginMode == "PHONE_OTP" ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(loginMode == "PHONE_OTP" ? Color.white : Color.clear)
                .cornerRadius(10)
                .shadow(color: loginMode == "PHONE_OTP" ? Color.black.opacity(0.06) : Color.clear, radius: 4, x: 0, y: 2)
            }

            Button(action: {
                loginMode = "PASSWORD"
                errorMessage = ""
            }) {
                HStack(spacing: 6) {
                    Image(systemName: "envelope.fill")
                    Text("Email / Password")
                }
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(loginMode == "PASSWORD" ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(loginMode == "PASSWORD" ? Color.white : Color.clear)
                .cornerRadius(10)
                .shadow(color: loginMode == "PASSWORD" ? Color.black.opacity(0.06) : Color.clear, radius: 4, x: 0, y: 2)
            }
        }
        .padding(4)
        .background(MedMargTheme.slate50)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 📱 3. PHONE OTP FORM
    // ==========================================
    private var phoneOtpForm: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Mobile Number")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(MedMargTheme.slate700)

                HStack(spacing: 10) {
                    HStack(spacing: 4) {
                        Text("🇮🇳")
                        Text("+91")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(MedMargTheme.slate700)
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 12)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(10)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))

                    TextField("Enter 10-digit mobile (e.g. 9876543210)", text: $mobileNumber)
                        .keyboardType(.numberPad)
                        .padding(12)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(10)
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
                }
            }

            if isOtpSent {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("One-Time Password (OTP)")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(MedMargTheme.slate700)
                        Spacer()
                        Text("Demo OTP: 4821")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.accentEmerald)
                    }

                    TextField("Enter 4-digit OTP", text: $otpCode)
                        .keyboardType(.numberPad)
                        .font(.system(size: 20, weight: .black, design: .monospaced))
                        .padding(14)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(10)
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.primaryTeal, lineWidth: 1.5))
                }

                Button(action: verifyOtpAndLogin) {
                    HStack {
                        Text("Verify OTP & Access Portal")
                            .font(.system(size: 15, weight: .bold))
                        Image(systemName: "checkmark.circle.fill")
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(12)
                    .shadow(color: MedMargTheme.primaryTeal.opacity(0.35), radius: 6, x: 0, y: 3)
                }
            } else {
                Button(action: sendOtp) {
                    HStack {
                        Text("Get Verification OTP")
                            .font(.system(size: 15, weight: .bold))
                        Image(systemName: "arrow.right")
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(12)
                    .shadow(color: MedMargTheme.primaryTeal.opacity(0.35), radius: 6, x: 0, y: 3)
                }
            }
        }
    }

    // ==========================================
    // 🔑 4. PASSWORD FORM
    // ==========================================
    private var passwordForm: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Username or Email")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(MedMargTheme.slate700)

                HStack {
                    Image(systemName: "person.fill")
                        .foregroundColor(MedMargTheme.primaryTeal)
                    TextField("patient@medmarg.com", text: $usernameOrEmail)
                        .autocapitalization(.none)
                }
                .padding(13)
                .background(MedMargTheme.slate50)
                .cornerRadius(10)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
            }

            VStack(alignment: .leading, spacing: 6) {
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
                .padding(13)
                .background(MedMargTheme.slate50)
                .cornerRadius(10)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
            }

            Button(action: handlePasswordLogin) {
                HStack {
                    Text("Sign In to Patient Portal")
                        .font(.system(size: 15, weight: .bold))
                    Image(systemName: "arrow.right")
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(MedMargTheme.primaryTeal)
                .cornerRadius(12)
                .shadow(color: MedMargTheme.primaryTeal.opacity(0.35), radius: 6, x: 0, y: 3)
            }
        }
    }

    // ==========================================
    // 👤 5. BIOMETRIC FACE ID / TOUCH ID BUTTON
    // ==========================================
    private var biometricQuickLoginButton: some View {
        Button(action: authenticateWithBiometrics) {
            HStack(spacing: 8) {
                Image(systemName: "faceid")
                    .font(.system(size: 18))
                    .foregroundColor(MedMargTheme.primaryTeal)
                Text("Sign In with Face ID / Touch ID")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(MedMargTheme.lightTeal)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.primaryTeal.opacity(0.3), lineWidth: 1.5))
        }
    }

    // ==========================================
    // 🌐 6. GOOGLE SIGN-IN BUTTON
    // ==========================================
    private var googleSignInButton: some View {
        Button(action: initiateGoogleSignIn) {
            HStack(spacing: 10) {
                ZStack {
                    Circle().fill(Color.white).frame(width: 22, height: 22)
                    Text("G")
                        .font(.system(size: 14, weight: .black))
                        .foregroundColor(Color(red: 0.26, green: 0.52, blue: 0.96))
                }

                Text("Continue with Google")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate700)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(MedMargTheme.slate50)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1.5))
        }
    }

    // ==========================================
    // ⚡ 7. 1-CLICK INSTANT DEMO LOGIN
    // ==========================================
    private var oneClickDemoButton: some View {
        Button(action: {
            if let patientUser = users.first(where: { $0.role == .patient }) {
                loggedInUser = patientUser
                errorMessage = ""
            }
        }) {
            HStack(spacing: 8) {
                Image(systemName: "sparkles")
                    .foregroundColor(MedMargTheme.amberGold)
                Text("1-Click Instant Demo Access (Rahul Sharma)")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(MedMargTheme.amberLight)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.amberGold.opacity(0.5), lineWidth: 1.5))
        }
    }

    // ==========================================
    // 📱 GOOGLE MISSING PHONE PROMPT SHEET
    // ==========================================
    private var googlePhonePromptSheet: some View {
        VStack(spacing: 20) {
            Image(systemName: "phone.badge.checkmark.fill")
                .font(.system(size: 44))
                .foregroundColor(MedMargTheme.primaryTeal)
                .padding(.top, 24)

            VStack(spacing: 6) {
                Text("Link Mobile for Phlebotomist Dispatch")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Text("To receive live tracking OTPs & lab reports on WhatsApp, please provide your 10-digit mobile number.")
                    .font(.system(size: 13))
                    .foregroundColor(MedMargTheme.slate500)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
            }

            if !googlePhoneError.isEmpty {
                Text(googlePhoneError)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.red)
            }

            HStack {
                Text("+91")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(MedMargTheme.slate700)
                    .padding(.leading, 12)

                TextField("98765 43210", text: $googlePhoneInput)
                    .keyboardType(.numberPad)
                    .padding(14)
            }
            .background(MedMargTheme.slate50)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
            .padding(.horizontal, 24)

            Button(action: completeGooglePhoneVerification) {
                Text("Confirm & Launch Care Seeker Hub")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(12)
            }
            .padding(.horizontal, 24)

            Spacer()
        }
    }

    // ==========================================
    // 🔐 AUTH LOGIC
    // ==========================================
    private func sendOtp() {
        let cleanDigits = mobileNumber.filter { "0123456789".contains($0) }
        if cleanDigits.count < 10 {
            errorMessage = "Please enter a valid 10-digit mobile number."
            return
        }
        errorMessage = ""
        isOtpSent = true
    }

    private func verifyOtpAndLogin() {
        if let patientUser = users.first(where: { $0.role == .patient }) {
            var updated = patientUser
            if !mobileNumber.isEmpty {
                updated.phone = "+91 \(mobileNumber)"
            }
            loggedInUser = updated
            errorMessage = ""
        }
    }

    private func handlePasswordLogin() {
        let trimmed = usernameOrEmail.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if let match = users.first(where: { $0.username.lowercased() == trimmed || $0.email.lowercased() == trimmed }) {
            loggedInUser = match
            errorMessage = ""
        } else if let patientUser = users.first(where: { $0.role == .patient }) {
            loggedInUser = patientUser
            errorMessage = ""
        } else {
            errorMessage = "Invalid login credentials. Try 1-Click Demo Login."
        }
    }

    private func checkBiometricAvailability() {
        let context = LAContext()
        var error: NSError?
        isBiometricAvailable = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
    }

    private func authenticateWithBiometrics() {
        let context = LAContext()
        let reason = "Authenticate with Face ID to access your MedMarg diagnostic reports & vitals."

        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, _ in
            DispatchQueue.main.async {
                if success {
                    if let patientUser = self.users.first(where: { $0.role == .patient }) {
                        self.loggedInUser = patientUser
                        self.errorMessage = ""
                    }
                } else {
                    self.errorMessage = "Biometric authentication failed. Please use OTP or password."
                }
            }
        }
    }

    private func initiateGoogleSignIn() {
        let mockGoogleUser = UserProfile(
            id: "usr_google_pat",
            name: "Rahul Sharma (Google)",
            username: "rahul.sharma",
            email: "rahul.sharma@gmail.com",
            phone: "",
            password: "password123",
            role: .patient,
            organization: "Tirupati, AP",
            status: "Active",
            createdAt: "08-Oct-2026"
        )

        tempGoogleUser = mockGoogleUser
        showGooglePhoneSheet = true
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
}
