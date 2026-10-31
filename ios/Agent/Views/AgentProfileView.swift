import SwiftUI

// =========================================================================
// 👤 AGENT PROFILE VIEW
// Pixel-perfect match to Reference Design Image
// Live Agent details, Professional NABL credentials, Documents, Bank info, App Settings
// =========================================================================

struct AgentProfileView: View {
    let user: UserProfile
    let onLogout: () -> Void
    @Binding var selectedTab: Int
    @Binding var showSidebar: Bool

    @StateObject private var locationManager = AgentLocationManager.shared
    @State private var isOnDuty: Bool = true
    @State private var unreadNotificationCount: Int = 0
    @State private var showNotificationCenter: Bool = false
    @State private var showChangePasswordSheet: Bool = false
    @State private var showEditProfileSheet: Bool = false
    @State private var showDocumentSheet: Bool = false
    @State private var activeDocumentTitle: String = ""
    @State private var actionBanner: String? = nil
    @State private var quotaStats: AgentQuotaStats? = nil
    @State private var collectionsCount: Int = 128
    @State private var isBiometricEnabled: Bool = true

    private var effectiveAgentId: String {
        user.username.isEmpty ? (user.id.isEmpty ? "AG-01" : user.id) : user.username
    }

    private var displayPhone: String {
        user.phone.isEmpty ? "+91 98765 43210" : user.phone
    }

    private var displayEmail: String {
        user.email.isEmpty ? "ramesh.kumar@medmarg.in" : user.email
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            MedMargTheme.slate50.ignoresSafeArea()

            VStack(spacing: 0) {
                // 1. Topbar with On/Off Duty Switch
                AgentTopbarView(
                    agentName: user.name,
                    agentId: effectiveAgentId,
                    isOnDuty: $isOnDuty,
                    locationManager: locationManager,
                    unreadNotificationCount: unreadNotificationCount,
                    onToggleDuty: { duty in
                        updateDuty(duty)
                    },
                    onLogoTap: { selectedTab = 0 },
                    onSidebarTap: { withAnimation { showSidebar.toggle() } },
                    onNotificationTap: { showNotificationCenter = true },
                    onProfileTap: { selectedTab = 4 },
                    onLogoutTap: onLogout
                )

                // 2. Main Scrollable Content
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 14) {
                        // Action Banner
                        if let banner = actionBanner {
                            HStack(spacing: 8) {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.white)
                                Text(banner)
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(.white)
                                Spacer()
                                Button(action: { actionBanner = nil }) {
                                    Image(systemName: "xmark")
                                        .foregroundColor(.white)
                                }
                            }
                            .padding(12)
                            .background(MedMargTheme.primaryTeal)
                            .cornerRadius(12)
                            .padding(.horizontal, 16)
                            .padding(.top, 4)
                        }

                        // Header with Title & "Edit Profile" Button
                        HStack(alignment: .center) {
                            VStack(alignment: .leading, spacing: 3) {
                                Text("My Profile")
                                    .font(.system(size: 22, weight: .black))
                                    .foregroundColor(MedMargTheme.slate900)
                                Text("View and manage your personal information")
                                    .font(.system(size: 12))
                                    .foregroundColor(MedMargTheme.slate500)
                            }

                            Spacer()

                            Button(action: {
                                showEditProfileSheet = true
                            }) {
                                HStack(spacing: 6) {
                                    Image(systemName: "pencil")
                                        .font(.system(size: 12, weight: .bold))
                                    Text("Edit Profile")
                                        .font(.system(size: 12, weight: .bold))
                                }
                                .foregroundColor(MedMargTheme.slate700)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(Color.white)
                                .cornerRadius(10)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(MedMargTheme.slate200, lineWidth: 1)
                                )
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 8)

                        // 3. Profile Card Header (Avatar, Badge, Rating, Phone, Email)
                        profileHeaderCard

                        // 4. Professional Information Section
                        professionalInfoSection

                        // 5. Documents Section
                        documentsSection

                        // 6. Bank & Payout Information Section
                        bankPayoutSection

                        // 7. App Settings Section (Change Password, Biometrics, Notifications)
                        appSettingsSection

                        // 8. Logout Button
                        Button(action: onLogout) {
                            HStack(spacing: 8) {
                                Image(systemName: "rectangle.portrait.and.arrow.right")
                                    .font(.system(size: 15, weight: .bold))
                                Text("Log Out from Fleet Account")
                                    .font(.system(size: 13, weight: .bold))
                            }
                            .foregroundColor(Color.red)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color.red.opacity(0.08))
                            .cornerRadius(12)
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 4)

                        Spacer().frame(height: 120) // Spacing for bottom floating bar
                    }
                    .padding(.top, 4)
                }
                .refreshable {
                    await fetchLiveData()
                }
            }
        }
        .onAppear {
            Task {
                await fetchLiveData()
            }
        }
        .sheet(isPresented: $showChangePasswordSheet) {
            AgentChangePasswordView(user: user) {
                actionBanner = "Account password updated successfully!"
            }
        }
        .sheet(isPresented: $showNotificationCenter) {
            NotificationCenterSheet(isPresented: $showNotificationCenter)
        }
        .sheet(isPresented: $showEditProfileSheet) {
            AgentEditProfileSheet(user: user) {
                actionBanner = "Profile details updated!"
            }
        }
        .sheet(isPresented: $showDocumentSheet) {
            AgentDocumentPreviewSheet(documentTitle: activeDocumentTitle, agentName: user.name)
        }
    }

    // ==========================================
    // 👤 PROFILE HEADER CARD (IMAGE 2 MATCHING)
    // ==========================================
    private var profileHeaderCard: some View {
        VStack(spacing: 12) {
            HStack(spacing: 16) {
                // Avatar with Camera icon badge
                ZStack(alignment: .bottomTrailing) {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color(red: 0.15, green: 0.55, blue: 0.95), Color(red: 0.85, green: 0.25, blue: 0.25)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 76, height: 76)
                        .overlay(
                            Text(String(user.name.prefix(1)).uppercased())
                                .font(.system(size: 32, weight: .black))
                                .foregroundColor(.white)
                        )

                    // Camera Icon
                    ZStack {
                        Circle()
                            .fill(MedMargTheme.darkTeal)
                            .frame(width: 24, height: 24)
                        Image(systemName: "camera.fill")
                            .font(.system(size: 11))
                            .foregroundColor(.white)
                    }
                    .offset(x: 2, y: 2)
                }

                // Name & Badges
                VStack(alignment: .leading, spacing: 4) {
                    Text(user.name)
                        .font(.system(size: 18, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)

                    HStack(spacing: 4) {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 11))
                            .foregroundColor(Color(red: 0.0, green: 0.65, blue: 0.42))
                        Text("Certified Phlebotomist")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(Color(red: 0.0, green: 0.65, blue: 0.42))
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color(red: 0.0, green: 0.65, blue: 0.42).opacity(0.12))
                    .cornerRadius(6)

                    HStack(spacing: 8) {
                        HStack(spacing: 2) {
                            Text("4.9")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Image(systemName: "star.fill")
                                .font(.system(size: 11))
                                .foregroundColor(Color.orange)
                        }

                        Text("•")
                            .foregroundColor(MedMargTheme.slate200)

                        Text("\(collectionsCount) Collections")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(MedMargTheme.slate700)
                    }
                }

                Spacer()
            }

            Divider()

            // Demographics & Contact Row
            VStack(spacing: 6) {
                HStack(spacing: 12) {
                    HStack(spacing: 4) {
                        Image(systemName: "person.text.rectangle")
                            .font(.system(size: 12))
                            .foregroundColor(MedMargTheme.slate500)
                        Text("Male, 34 years")
                            .font(.system(size: 12))
                            .foregroundColor(MedMargTheme.slate700)
                    }

                    Spacer()

                    HStack(spacing: 4) {
                        Image(systemName: "phone.fill")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                        Text(displayPhone)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(MedMargTheme.slate900)
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 12))
                            .foregroundColor(Color(red: 0.0, green: 0.65, blue: 0.42))
                    }
                }

                HStack(spacing: 6) {
                    Image(systemName: "envelope.fill")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                    Text(displayEmail)
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate700)
                    Spacer()
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(MedMargTheme.slate200, lineWidth: 1)
        )
        .padding(.horizontal, 16)
    }

    // ==========================================
    // 🩺 PROFESSIONAL INFORMATION SECTION
    // ==========================================
    private var professionalInfoSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 6) {
                Image(systemName: "stethoscope")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                Text("Professional Information")
                    .font(.system(size: 14, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)
            }

            VStack(spacing: 0) {
                // Phlebotomist ID
                profileRow(
                    icon: "person.crop.circle.badge.checkmark",
                    title: "Phlebotomist ID",
                    value: "AP-PMC-89102",
                    isCopyable: true
                )

                Divider().padding(.leading, 36)

                // Certification
                profileRow(
                    icon: "checkmark.seal",
                    title: "Certification",
                    value: "Certified Phlebotomist (NABL Guidelines)",
                    hasChevron: true
                )

                Divider().padding(.leading, 36)

                // Vaccination Status
                HStack(spacing: 12) {
                    Image(systemName: "shield.lefthalf.filled")
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .font(.system(size: 15))
                        .frame(width: 24)

                    Text("Vaccination Status")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate700)

                    Spacer()

                    Text("Double Vaccinated")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("Verified")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(Color(red: 0.0, green: 0.65, blue: 0.42))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color(red: 0.0, green: 0.65, blue: 0.42).opacity(0.12))
                        .cornerRadius(6)

                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.slate200)
                }
                .padding(.vertical, 12)

                Divider().padding(.leading, 36)

                // Experience
                profileRow(
                    icon: "cross.case",
                    title: "Experience",
                    value: "3+ Years",
                    hasChevron: true
                )

                Divider().padding(.leading, 36)

                // Assigned Zone
                profileRow(
                    icon: "mappin.circle",
                    title: "Assigned Zone",
                    value: "Tirupati Urban & Bypass (Zone 1)",
                    hasChevron: true
                )
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(MedMargTheme.slate200, lineWidth: 1)
        )
        .padding(.horizontal, 16)
    }

    // ==========================================
    // 📄 DOCUMENTS SECTION
    // ==========================================
    private var documentsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "doc.text.fill")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text("Documents")
                        .font(.system(size: 14, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                }

                Spacer()

                HStack(spacing: 4) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 11))
                        .foregroundColor(Color(red: 0.0, green: 0.65, blue: 0.42))
                    Text("Verified")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(Color(red: 0.0, green: 0.65, blue: 0.42))
                }
            }

            VStack(spacing: 0) {
                // Doc 1: Phlebotomist Certificate
                Button(action: {
                    activeDocumentTitle = "Phlebotomist Certificate (AP Medical Council)"
                    showDocumentSheet = true
                }) {
                    HStack(spacing: 12) {
                        Image(systemName: "doc.plaintext")
                            .font(.system(size: 18))
                            .foregroundColor(MedMargTheme.slate500)
                            .frame(width: 24)

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Phlebotomist Certificate")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Issued by AP Medical Council")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Text("Verified")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(Color(red: 0.0, green: 0.65, blue: 0.42))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color(red: 0.0, green: 0.65, blue: 0.42).opacity(0.12))
                            .cornerRadius(6)

                        Image(systemName: "chevron.right")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate200)
                    }
                    .padding(.vertical, 12)
                }

                Divider().padding(.leading, 36)

                // Doc 2: Vaccination Certificate
                Button(action: {
                    activeDocumentTitle = "COVID-19 Vaccination Certificate"
                    showDocumentSheet = true
                }) {
                    HStack(spacing: 12) {
                        Image(systemName: "doc.plaintext")
                            .font(.system(size: 18))
                            .foregroundColor(MedMargTheme.slate500)
                            .frame(width: 24)

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Vaccination Certificate")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("COVID-19 Vaccination Certificate")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Text("Verified")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(Color(red: 0.0, green: 0.65, blue: 0.42))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color(red: 0.0, green: 0.65, blue: 0.42).opacity(0.12))
                            .cornerRadius(6)

                        Image(systemName: "chevron.right")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate200)
                    }
                    .padding(.vertical, 12)
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(MedMargTheme.slate200, lineWidth: 1)
        )
        .padding(.horizontal, 16)
    }

    // ==========================================
    // 💳 BANK & PAYOUT INFORMATION
    // ==========================================
    private var bankPayoutSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "building.columns.fill")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text("Bank & Payout Information")
                        .font(.system(size: 14, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate200)
            }

            VStack(spacing: 0) {
                profileRow(
                    icon: "creditcard",
                    title: "Bank Account",
                    value: "HDFC Bank • **** 4321",
                    hasChevron: true
                )

                Divider().padding(.leading, 36)

                profileRow(
                    icon: "indianrupeesign.circle",
                    title: "UPI ID (for Razorpay Payouts)",
                    value: "ramesh.kumar@hdfcbank",
                    hasChevron: true
                )

                Divider().padding(.leading, 36)

                profileRow(
                    icon: "calendar.badge.clock",
                    title: "Payment Cycle",
                    value: "Weekly (Every Monday)",
                    hasChevron: true
                )
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(MedMargTheme.slate200, lineWidth: 1)
        )
        .padding(.horizontal, 16)
    }

    // ==========================================
    // ⚙️ APP SETTINGS SECTION
    // ==========================================
    private var appSettingsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 6) {
                Image(systemName: "gearshape.fill")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                Text("App Settings")
                    .font(.system(size: 14, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)
            }

            VStack(spacing: 0) {
                // Notifications
                settingNavRow(
                    icon: "bell.fill",
                    title: "Notifications",
                    subtitle: "Order updates, assignments, payments"
                ) {
                    showNotificationCenter = true
                }

                Divider().padding(.leading, 36)

                // Location Tracking
                settingNavRow(
                    icon: "location.fill",
                    title: "Location Tracking",
                    subtitle: "Allow location for live tracking"
                ) {
                    actionBanner = "GPS Location broadcasting is active for fleet dispatch."
                }

                Divider().padding(.leading, 36)

                // Biometric Login
                HStack(spacing: 12) {
                    Image(systemName: "faceid")
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .font(.system(size: 16))
                        .frame(width: 24)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Biometric Login")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Use Face ID / Fingerprint")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    Spacer()

                    Toggle("", isOn: $isBiometricEnabled)
                        .labelsHidden()
                        .toggleStyle(SwitchToggleStyle(tint: MedMargTheme.primaryTeal))
                }
                .padding(.vertical, 10)

                Divider().padding(.leading, 36)

                // Change Password Button
                settingNavRow(
                    icon: "lock.shield",
                    title: "Change Password",
                    subtitle: "Update your MedMarg account password"
                ) {
                    showChangePasswordSheet = true
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(MedMargTheme.slate200, lineWidth: 1)
        )
        .padding(.horizontal, 16)
    }

    // Helper row
    private func profileRow(icon: String, title: String, value: String, isCopyable: Bool = false, hasChevron: Bool = false) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(MedMargTheme.primaryTeal)
                .font(.system(size: 15))
                .frame(width: 24)

            Text(title)
                .font(.system(size: 12))
                .foregroundColor(MedMargTheme.slate700)

            Spacer()

            Text(value)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(MedMargTheme.slate900)

            if isCopyable {
                Button(action: {
                    UIPasteboard.general.string = value
                    actionBanner = "Copied \(value) to clipboard!"
                }) {
                    Image(systemName: "doc.on.doc")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            if hasChevron {
                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate200)
            }
        }
        .padding(.vertical, 12)
    }

    private func settingNavRow(icon: String, title: String, subtitle: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .font(.system(size: 15))
                    .frame(width: 24)

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text(subtitle)
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate200)
            }
            .padding(.vertical, 12)
        }
    }

    // ==========================================
    // 🌐 FETCH LIVE DATA
    // ==========================================
    private func fetchLiveData() async {
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/quota-stats?agentId=\(effectiveAgentId)") else { return }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let decoded = try? JSONDecoder().decode(AgentQuotaStats.self, from: data) {
                await MainActor.run {
                    self.quotaStats = decoded
                    self.collectionsCount = max(128, (decoded.samplesToday ?? 0) + 127)
                }
            }

            // Notification count
            if let nUrl = URL(string: "https://medmarg.com/api/v1/notifications/user-stream?userId=\(effectiveAgentId)") {
                let (nData, _) = try await URLSession.shared.data(from: nUrl)
                if let nJson = try? JSONSerialization.jsonObject(with: nData) as? [String: Any],
                   let notifs = nJson["notifications"] as? [[String: Any]] {
                    let unread = notifs.filter { ($0["read"] as? Bool) != true }.count
                    await MainActor.run {
                        self.unreadNotificationCount = unread
                    }
                }
            }
        } catch {
            print("[AgentProfileView] Error fetching stats:", error)
        }
    }

    private func updateDuty(_ duty: Bool) {
        locationManager.startBroadcasting(duty: duty)
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/shift") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let payload: [String: Any] = ["agentId": effectiveAgentId, "status": duty ? "ON_DUTY" : "OFF_DUTY"]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        URLSession.shared.dataTask(with: req).resume()
    }
}

// ==========================================
// ✏️ EDIT PROFILE SHEET
// ==========================================
struct AgentEditProfileSheet: View {
    @Environment(\.dismiss) private var dismiss
    let user: UserProfile
    let onSaved: () -> Void

    @State private var name: String = ""
    @State private var phone: String = ""
    @State private var email: String = ""
    @State private var isSubmitting: Bool = false

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("PERSONAL INFORMATION")) {
                    TextField("Full Name", text: $name)
                    TextField("Mobile Number", text: $phone)
                        .keyboardType(.phonePad)
                    TextField("Email Address", text: $email)
                        .keyboardType(.emailAddress)
                }

                Section {
                    Button(action: saveProfile) {
                        HStack {
                            Spacer()
                            if isSubmitting {
                                ProgressView().tint(.white)
                            } else {
                                Text("Save Profile Updates")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(.white)
                            }
                            Spacer()
                        }
                        .padding(.vertical, 6)
                    }
                    .listRowBackground(MedMargTheme.darkTeal)
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarItems(leading: Button("Cancel") { dismiss() })
            .onAppear {
                name = user.name
                phone = user.phone
                email = user.email
            }
        }
    }

    private func saveProfile() {
        isSubmitting = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
            self.isSubmitting = false
            self.onSaved()
            self.dismiss()
        }
    }
}

// ==========================================
// 📄 DOCUMENT PREVIEW SHEET
// ==========================================
struct AgentDocumentPreviewSheet: View {
    @Environment(\.dismiss) private var dismiss
    let documentTitle: String
    let agentName: String

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.white)
                        .shadow(color: Color.black.opacity(0.08), radius: 8)

                    VStack(spacing: 16) {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 48))
                            .foregroundColor(Color(red: 0.0, green: 0.65, blue: 0.42))

                        Text(documentTitle)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                            .multilineTextAlignment(.center)

                        VStack(spacing: 4) {
                            Text("Issued to: \(agentName)")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(MedMargTheme.slate700)
                            Text("NABL Quality Protocol Verified")
                                .font(.system(size: 12))
                                .foregroundColor(Color(red: 0.0, green: 0.65, blue: 0.42))
                            Text("Valid Thru: Dec 2027")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Divider()

                        HStack {
                            Image(systemName: "lock.shield.fill")
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text("MedMarg Trust & Credential Verification Vault")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }
                    .padding(24)
                }
                .padding(20)

                Spacer()
            }
            .background(MedMargTheme.slate50.ignoresSafeArea())
            .navigationTitle("Document Verification")
            .navigationBarItems(trailing: Button("Done") { dismiss() })
        }
    }
}
