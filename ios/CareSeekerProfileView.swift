import SwiftUI

// =========================================================================
// 👤 CARE SEEKER PROFILE, ABHA ID & FAMILY MANAGEMENT VIEW (REDESIGNED)
// Incorporating Metric Counters, ABDM Health Locker, Family Health Profiles,
// Phlebotomy Preferences, Security & Doorstep Address Management
// Matching Agent & Admin Panel Architecture
// =========================================================================

struct FamilyMemberItem: Identifiable, Equatable {
    let id: String
    var name: String
    var relation: String
    var age: Int
    var gender: String
    var bloodGroup: String
    var chronicConditions: [String]
    var abhaId: String
}

struct SavedAddressItem: Identifiable, Equatable {
    let id: String
    var label: String
    var address: String
    var isDefault: Bool
    var city: String
    var pincode: String
}

struct CareSeekerProfileView: View {
    let user: UserProfile
    let onLogout: () -> Void
    let onOpenAddressModal: () -> Void

    @State private var profileName: String
    @State private var phone: String
    @State private var email: String
    @State private var bloodGroup: String = "O+ (Positive)"
    @State private var preferredLanguage: String = "Telugu & English"
    @State private var needleSensitivity: String = "Butterfly 23G (Sensitive)"
    @State private var emergencyContactName: String = "Sunita Sharma (Spouse)"
    @State private var emergencyContactPhone: String = "+91 94401 23456"

    // App Preferences Toggles
    @State private var biometricsEnabled: Bool = true
    @State private var whatsAppNotifications: Bool = true
    @State private var smsOrderUpdates: Bool = true

    // Sheets & Dialogs
    @State private var showEditProfileSheet: Bool = false
    @State private var showAddFamilySheet: Bool = false
    @State private var showAbhaDetailsSheet: Bool = false
    @State private var showLogoutConfirmation: Bool = false
    @State private var copiedToast: String? = nil

    // Family Member Form State
    @State private var newFamName: String = ""
    @State private var newFamRelation: String = "Spouse"
    @State private var newFamAge: String = "28"
    @State private var newFamGender: String = "Female"
    @State private var newFamBlood: String = "O+"
    @State private var newFamCondition: String = "None"

    // ABHA Identity
    private let abhaNumber: String = "91-4829-1029-4820"
    private let abhaAddress: String = "rahulsharma@abdm"

    // Family Members
    @State private var familyMembers: [FamilyMemberItem] = [
        FamilyMemberItem(id: "f1", name: "Sunita Sharma", relation: "Spouse", age: 31, gender: "Female", bloodGroup: "B+", chronicConditions: ["Thyroid (Hypothyroidism)"], abhaId: "91-3829-1920-1120"),
        FamilyMemberItem(id: "f2", name: "Aarav Sharma", relation: "Son", age: 6, gender: "Male", bloodGroup: "O+", chronicConditions: ["Pediatric Care"], abhaId: "91-8839-4410-9921"),
        FamilyMemberItem(id: "f3", name: "K. Somasekhar Sharma", relation: "Father", age: 64, gender: "Male", bloodGroup: "O+", chronicConditions: ["Type-2 Diabetes", "Hypertension"], abhaId: "91-1192-3349-8812")
    ]

    // Saved Addresses
    @State private var savedAddresses: [SavedAddressItem] = [
        SavedAddressItem(id: "addr_1", label: "Home", address: "Plot 42, Air Bypass Road, Tirupati, AP - 517501", isDefault: true, city: "Tirupati, AP", pincode: "517501"),
        SavedAddressItem(id: "addr_2", label: "Parents", address: "Door 12-4/A, Gandhi Road, Tirupati, AP - 517502", isDefault: false, city: "Tirupati, AP", pincode: "517502")
    ]

    init(user: UserProfile, onLogout: @escaping () -> Void, onOpenAddressModal: @escaping () -> Void) {
        self.user = user
        self.onLogout = onLogout
        self.onOpenAddressModal = onOpenAddressModal
        self._profileName = State(initialValue: user.name.isEmpty ? "Rahul Sharma" : user.name)
        self._phone = State(initialValue: user.phone.isEmpty ? "+91 98765 43210" : user.phone)
        self._email = State(initialValue: user.email.isEmpty ? "rahul.sharma@medmarg.com" : user.email)
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                
                // 1. Care Seeker Profile Header Card
                profileHeaderCard

                // 2. Metric Counters Row (Matching Agent / Admin Panels)
                patientMetricCountersRow

                // 3. ABDM / Ayushman Bharat Digital ID Card
                abhaDigitalIdCard

                // 4. Health & Phlebotomy Preferences Grid
                healthPreferencesCard

                // 5. Linked Family Members Manager
                familyMembersSection

                // 6. Saved Doorstep Addresses
                savedAddressesSection

                // 7. Security, Notifications & App Preferences
                securityAndSettingsSection

                // 8. Sign Out Button
                logoutButtonSection

                Spacer().frame(height: 80)
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
        }
        .background(MedMargTheme.slate50)
        .overlay(alignment: .bottom) {
            if let toast = copiedToast {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.white)
                    Text(toast)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.white)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(MedMargTheme.primaryTeal)
                .cornerRadius(20)
                .shadow(color: Color.black.opacity(0.15), radius: 8, x: 0, y: 4)
                .padding(.bottom, 80)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .sheet(isPresented: $showEditProfileSheet) {
            editProfileSheet
        }
        .sheet(isPresented: $showAddFamilySheet) {
            addFamilyMemberSheet
        }
        .sheet(isPresented: $showAbhaDetailsSheet) {
            abhaLockerDetailSheet
        }
        .alert("Sign Out", isPresented: $showLogoutConfirmation) {
            Button("Cancel", role: .cancel) {}
            Button("Sign Out", role: .destructive) { onLogout() }
        } message: {
            Text("Are you sure you want to sign out of MedMarg? You will need to log back in to access your lab bookings and reports.")
        }
    }

    // ==========================================
    // 👤 1. PROFILE HEADER CARD
    // ==========================================
    private var profileHeaderCard: some View {
        VStack(spacing: 16) {
            HStack(spacing: 14) {
                // Avatar with Emerald Ring
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [MedMargTheme.primaryTeal, MedMargTheme.darkTeal],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 68, height: 68)
                        .overlay(
                            Circle()
                                .stroke(MedMargTheme.accentEmerald, lineWidth: 2)
                        )
                        .shadow(color: MedMargTheme.primaryTeal.opacity(0.2), radius: 6, x: 0, y: 3)

                    Text(profileName.isEmpty ? "C" : String(profileName.prefix(1)).uppercased())
                        .font(.system(size: 26, weight: .black, design: .rounded))
                        .foregroundColor(.white)

                    // Small Verified Icon Badge
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 18))
                        .foregroundColor(MedMargTheme.accentEmerald)
                        .background(Color.white.clipShape(Circle()))
                        .offset(x: 24, y: 24)
                }

                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 6) {
                        Text("VERIFIED CARE SEEKER")
                            .font(.system(size: 9, weight: .black))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(MedMargTheme.lightTeal)
                            .foregroundColor(MedMargTheme.primaryTeal)
                            .cornerRadius(4)

                        Text("ABDM READY")
                            .font(.system(size: 9, weight: .black))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(MedMargTheme.amberLight)
                            .foregroundColor(MedMargTheme.amberGold)
                            .cornerRadius(4)
                    }

                    Text(profileName)
                        .font(.system(size: 19, weight: .bold, design: .rounded))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("📞 \(phone)")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(MedMargTheme.slate500)

                    Text("✉️ \(email)")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                // Edit Profile Icon Button
                Button(action: { showEditProfileSheet = true }) {
                    Image(systemName: "pencil")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .padding(8)
                        .background(MedMargTheme.lightTeal)
                        .cornerRadius(10)
                }
            }

            Divider()

            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "mappin.circle.fill")
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text("Tirupati Central Zone • 60-Min Dispatch")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                }

                Spacer()

                HStack(spacing: 4) {
                    Circle()
                        .fill(MedMargTheme.accentEmerald)
                        .frame(width: 7, height: 7)
                    Text("Cold-Chain Ready")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MedMargTheme.accentEmerald)
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
    }

    // ==========================================
    // 📊 2. METRIC COUNTERS ROW
    // ==========================================
    private var patientMetricCountersRow: some View {
        HStack(spacing: 10) {
            metricCounterCard(
                value: "14",
                label: "Tests Booked",
                icon: "cross.vial.fill",
                color: MedMargTheme.primaryTeal,
                bgColor: MedMargTheme.lightTeal
            )

            metricCounterCard(
                value: "12",
                label: "Lab Reports",
                icon: "doc.text.fill",
                color: MedMargTheme.accentEmerald,
                bgColor: Color(red: 0.90, green: 0.98, blue: 0.94)
            )

            metricCounterCard(
                value: "\(familyMembers.count)",
                label: "Family Linked",
                icon: "person.3.fill",
                color: Color.blue,
                bgColor: Color(red: 0.92, green: 0.96, blue: 1.0)
            )

            metricCounterCard(
                value: "\(savedAddresses.count)",
                label: "Addresses",
                icon: "house.fill",
                color: MedMargTheme.amberGold,
                bgColor: MedMargTheme.amberLight
            )
        }
    }

    private func metricCounterCard(value: String, label: String, icon: String, color: Color, bgColor: Color) -> some View {
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.12))
                    .frame(width: 28, height: 28)
                Image(systemName: icon)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(color)
            }

            Text(value)
                .font(.system(size: 17, weight: .black, design: .rounded))
                .foregroundColor(MedMargTheme.slate900)

            Text(label)
                .font(.system(size: 9, weight: .semibold))
                .foregroundColor(MedMargTheme.slate500)
                .multilineTextAlignment(.center)
                .lineLimit(1)
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 4)
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 1)
    }

    // ==========================================
    // 🆔 3. ABHA DIGITAL ID CARD
    // ==========================================
    private var abhaDigitalIdCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 5) {
                        Image(systemName: "building.columns.fill")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.amberGold)
                        Text("AYUSHMAN BHARAT DIGITAL MISSION")
                            .font(.system(size: 9, weight: .heavy))
                            .foregroundColor(MedMargTheme.amberGold)
                            .tracking(0.8)
                    }

                    Text("ABHA Health Locker")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)

                    Text("Official Govt. of India Digital Health Passport")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.emeraldLight)
                }

                Spacer()

                Button(action: { showAbhaDetailsSheet = true }) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 10)
                            .fill(Color.white.opacity(0.15))
                            .frame(width: 44, height: 44)
                        Image(systemName: "qrcode")
                            .font(.system(size: 24))
                            .foregroundColor(Color.white)
                    }
                }
            }

            Divider().background(Color.white.opacity(0.25))

            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("ABHA NUMBER")
                        .font(.system(size: 9, weight: .black))
                        .foregroundColor(MedMargTheme.lightTeal)

                    HStack(spacing: 6) {
                        Text(abhaNumber)
                            .font(.system(size: 14, weight: .black, design: .monospaced))
                            .foregroundColor(.white)

                        Button(action: {
                            UIPasteboard.general.string = abhaNumber
                            showToast("Copied ABHA: \(abhaNumber)")
                        }) {
                            Image(systemName: "doc.on.doc")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.amberLight)
                        }
                    }
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text("ABHA ADDRESS")
                        .font(.system(size: 9, weight: .black))
                        .foregroundColor(MedMargTheme.lightTeal)

                    Text(abhaAddress)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.amberLight)
                }
            }
        }
        .padding(16)
        .background(
            LinearGradient(
                colors: [Color(red: 0.0, green: 0.38, blue: 0.35), MedMargTheme.darkTeal],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(18)
        .shadow(color: MedMargTheme.primaryTeal.opacity(0.2), radius: 8, x: 0, y: 3)
    }

    // ==========================================
    // 🩺 4. HEALTH PREFERENCES CARD
    // ==========================================
    private var healthPreferencesCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Health & Sample Collection Preferences")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Spacer()

                Button(action: { showEditProfileSheet = true }) {
                    Text("Modify")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                preferenceItem(title: "BLOOD GROUP", value: bloodGroup, icon: "drop.fill", color: .red)
                preferenceItem(title: "COMMUNICATION", value: preferredLanguage, icon: "globe", color: .blue)
                preferenceItem(title: "NEEDLE GAUGE", value: needleSensitivity, icon: "cross.vial.fill", color: .green)
                preferenceItem(title: "VAULT SYNC", value: "Apple Health & Drive", icon: "cloud.fill", color: MedMargTheme.primaryTeal)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 6, x: 0, y: 2)
    }

    private func preferenceItem(title: String, value: String, icon: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 10))
                    .foregroundColor(color)
                Text(title)
                    .font(.system(size: 9, weight: .black))
                    .foregroundColor(MedMargTheme.slate500)
            }
            Text(value)
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)
                .lineLimit(1)
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(MedMargTheme.slate50)
        .cornerRadius(10)
    }

    // ==========================================
    // 👨‍👩‍👧 5. FAMILY MEMBERS SECTION
    // ==========================================
    private var familyMembersSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Linked Family Members (\(familyMembers.count))")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Manage health profiles & book tests for dependents")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Button(action: { showAddFamilySheet = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                            .font(.system(size: 11, weight: .bold))
                        Text("Add Member")
                            .font(.system(size: 11, weight: .bold))
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(MedMargTheme.primaryTeal)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
            }

            ForEach(familyMembers) { fam in
                familyMemberCard(fam: fam)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 6, x: 0, y: 2)
    }

    private func familyMemberCard(fam: FamilyMemberItem) -> some View {
        HStack(alignment: .top, spacing: 12) {
            ZStack {
                Circle()
                    .fill(MedMargTheme.lightTeal)
                    .frame(width: 40, height: 40)
                Image(systemName: fam.gender == "Female" ? "figure.dress.line.vertical.figure" : "figure.stand")
                    .font(.system(size: 18))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(fam.name)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Text(fam.relation.uppercased())
                        .font(.system(size: 9, weight: .black))
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(MedMargTheme.lightTeal)
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .cornerRadius(4)

                    Text(fam.bloodGroup)
                        .font(.system(size: 9, weight: .black))
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(Color.red.opacity(0.1))
                        .foregroundColor(Color.red)
                        .cornerRadius(4)
                }

                Text("\(fam.age) yrs • \(fam.gender) • ABHA: \(fam.abhaId)")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)

                if !fam.chronicConditions.isEmpty && fam.chronicConditions.first != "None" {
                    HStack(spacing: 4) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 9))
                            .foregroundColor(MedMargTheme.amberGold)
                        Text(fam.chronicConditions.joined(separator: ", "))
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(MedMargTheme.amberGold)
                    }
                }
            }

            Spacer()

            Button(action: {
                familyMembers.removeAll { $0.id == fam.id }
                showToast("Removed \(fam.name)")
            }) {
                Image(systemName: "trash")
                    .font(.system(size: 12))
                    .foregroundColor(.red.opacity(0.8))
                    .padding(6)
            }
        }
        .padding(12)
        .background(MedMargTheme.slate50)
        .cornerRadius(12)
    }

    // ==========================================
    // 📍 6. SAVED ADDRESSES SECTION
    // ==========================================
    private var savedAddressesSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Saved Doorstep Addresses (\(savedAddresses.count))")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Phlebotomists dispatch to your verified GPS doorsteps")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Button(action: onOpenAddressModal) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                            .font(.system(size: 11, weight: .bold))
                        Text("Add Address")
                            .font(.system(size: 11, weight: .bold))
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(MedMargTheme.primaryTeal)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
            }

            ForEach(savedAddresses) { addr in
                addressCard(addr: addr)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 6, x: 0, y: 2)
    }

    private func addressCard(addr: SavedAddressItem) -> some View {
        HStack(alignment: .top, spacing: 12) {
            ZStack {
                Circle()
                    .fill(MedMargTheme.lightTeal)
                    .frame(width: 36, height: 36)
                Image(systemName: addr.label == "Home" ? "house.fill" : (addr.label == "Work" ? "briefcase.fill" : "mappin.and.ellipse"))
                    .font(.system(size: 15))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(addr.label)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    if addr.isDefault {
                        Text("DEFAULT")
                            .font(.system(size: 9, weight: .black))
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(Color.green.opacity(0.12))
                            .foregroundColor(Color.green)
                            .cornerRadius(4)
                    }

                    Text("Zone 1")
                        .font(.system(size: 9, weight: .bold))
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(MedMargTheme.slate200)
                        .foregroundColor(MedMargTheme.slate700)
                        .cornerRadius(4)
                }

                Text(addr.address)
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate700)
                    .lineLimit(2)
            }

            Spacer()

            Button(action: {
                savedAddresses.removeAll { $0.id == addr.id }
                showToast("Removed address")
            }) {
                Image(systemName: "trash")
                    .font(.system(size: 12))
                    .foregroundColor(.red.opacity(0.8))
                    .padding(6)
            }
        }
        .padding(12)
        .background(MedMargTheme.slate50)
        .cornerRadius(12)
    }

    // ==========================================
    // ⚙️ 7. SECURITY & SETTINGS SECTION
    // ==========================================
    private var securityAndSettingsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Security & Notification Preferences")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            VStack(spacing: 12) {
                Toggle(isOn: $biometricsEnabled) {
                    HStack(spacing: 10) {
                        Image(systemName: "faceid")
                            .foregroundColor(MedMargTheme.primaryTeal)
                            .font(.system(size: 16))
                        VStack(alignment: .leading, spacing: 1) {
                            Text("Face ID & Biometric Protection")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Require authentication to open NABL diagnostic reports")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }
                }
                .tint(MedMargTheme.primaryTeal)

                Divider()

                Toggle(isOn: $whatsAppNotifications) {
                    HStack(spacing: 10) {
                        Image(systemName: "message.fill")
                            .foregroundColor(Color(red: 0.15, green: 0.75, blue: 0.35))
                            .font(.system(size: 16))
                        VStack(alignment: .leading, spacing: 1) {
                            Text("WhatsApp PDF Reports & Alerts")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Instant verified report download links via official WhatsApp")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }
                }
                .tint(MedMargTheme.primaryTeal)

                Divider()

                HStack {
                    HStack(spacing: 10) {
                        Image(systemName: "phone.badge.waveform.fill")
                            .foregroundColor(Color.red)
                            .font(.system(size: 16))
                        VStack(alignment: .leading, spacing: 1) {
                            Text("Emergency Medical Contact")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("\(emergencyContactName) • \(emergencyContactPhone)")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }
                    Spacer()
                }
            }

            Divider()

            // App Version & Disclaimers
            VStack(alignment: .leading, spacing: 4) {
                Text("MedMarg Universal Diagnostic Care • iOS v2.4.0 (Build 2026)")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)
                Text("100% NABL Accredited & ICMR Approved Partner Laboratory Telemetry.")
                    .font(.system(size: 9))
                    .foregroundColor(MedMargTheme.slate400)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 6, x: 0, y: 2)
    }

    // ==========================================
    // 🚪 8. LOGOUT BUTTON
    // ==========================================
    private var logoutButtonSection: some View {
        Button(action: { showLogoutConfirmation = true }) {
            HStack(spacing: 8) {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                Text("Sign Out of MedMarg Portal")
                    .font(.system(size: 14, weight: .bold))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.red.opacity(0.08))
            .foregroundColor(.red)
            .cornerRadius(14)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.red.opacity(0.2), lineWidth: 1))
        }
    }

    // ==========================================
    // 📝 EDIT PROFILE SHEET
    // ==========================================
    private var editProfileSheet: some View {
        NavigationStack {
            Form {
                Section(header: Text("Personal Information")) {
                    TextField("Full Name", text: $profileName)
                    TextField("Phone Number", text: $phone)
                        .keyboardType(.phonePad)
                    TextField("Email Address", text: $email)
                        .keyboardType(.emailAddress)
                }

                Section(header: Text("Clinical & Phlebotomy Preferences")) {
                    Picker("Blood Group", selection: $bloodGroup) {
                        Text("O+ (Positive)").tag("O+ (Positive)")
                        Text("A+ (Positive)").tag("A+ (Positive)")
                        Text("B+ (Positive)").tag("B+ (Positive)")
                        Text("AB+ (Positive)").tag("AB+ (Positive)")
                        Text("O- (Negative)").tag("O- (Negative)")
                        Text("A- (Negative)").tag("A- (Negative)")
                        Text("B- (Negative)").tag("B- (Negative)")
                        Text("AB- (Negative)").tag("AB- (Negative)")
                    }

                    Picker("Needle Gauge Sensitivity", selection: $needleSensitivity) {
                        Text("Butterfly 23G (Sensitive)").tag("Butterfly 23G (Sensitive)")
                        Text("Standard 21G").tag("Standard 21G")
                        Text("Pediatric 25G").tag("Pediatric 25G")
                    }

                    Picker("Language Preference", selection: $preferredLanguage) {
                        Text("Telugu & English").tag("Telugu & English")
                        Text("Telugu Only").tag("Telugu Only")
                        Text("English Only").tag("English Only")
                        Text("Hindi & English").tag("Hindi & English")
                    }
                }

                Section(header: Text("Emergency Contact")) {
                    TextField("Contact Person Name", text: $emergencyContactName)
                    TextField("Emergency Phone", text: $emergencyContactPhone)
                        .keyboardType(.phonePad)
                }
            }
            .navigationTitle("Edit Health Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { showEditProfileSheet = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        showEditProfileSheet = false
                        showToast("Profile Updated Successfully")
                    }
                    .bold()
                }
            }
        }
    }

    // ==========================================
    // ➕ ADD FAMILY MEMBER SHEET
    // ==========================================
    private var addFamilyMemberSheet: some View {
        NavigationStack {
            Form {
                Section(header: Text("Member Details")) {
                    TextField("Full Name", text: $newFamName)
                    Picker("Relation", selection: $newFamRelation) {
                        Text("Spouse").tag("Spouse")
                        Text("Son").tag("Son")
                        Text("Daughter").tag("Daughter")
                        Text("Father").tag("Father")
                        Text("Mother").tag("Mother")
                        Text("Other").tag("Other")
                    }
                    TextField("Age", text: $newFamAge)
                        .keyboardType(.numberPad)
                    Picker("Gender", selection: $newFamGender) {
                        Text("Male").tag("Male")
                        Text("Female").tag("Female")
                        Text("Other").tag("Other")
                    }
                    Picker("Blood Group", selection: $newFamBlood) {
                        Text("O+").tag("O+")
                        Text("A+").tag("A+")
                        Text("B+").tag("B+")
                        Text("AB+").tag("AB+")
                        Text("O-").tag("O-")
                        Text("A-").tag("A-")
                        Text("B-").tag("B-")
                        Text("AB-").tag("AB-")
                    }
                    TextField("Chronic Conditions (e.g. Thyroid, Diabetes)", text: $newFamCondition)
                }
            }
            .navigationTitle("Add Family Member")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { showAddFamilySheet = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        if !newFamName.isEmpty {
                            familyMembers.append(FamilyMemberItem(
                                id: "f_\(Date().timeIntervalSince1970)",
                                name: newFamName,
                                relation: newFamRelation,
                                age: Int(newFamAge) ?? 28,
                                gender: newFamGender,
                                bloodGroup: newFamBlood,
                                chronicConditions: [newFamCondition.isEmpty ? "None" : newFamCondition],
                                abhaId: "91-\(Int.random(in: 1000...9999))-\(Int.random(in: 1000...9999))-\(Int.random(in: 1000...9999))"
                            ))
                            newFamName = ""
                            showAddFamilySheet = false
                            showToast("Added family member")
                        }
                    }
                    .disabled(newFamName.isEmpty)
                }
            }
        }
    }

    // ==========================================
    // 🆔 ABHA LOCKER DETAIL SHEET
    // ==========================================
    private var abhaLockerDetailSheet: some View {
        NavigationStack {
            VStack(spacing: 20) {
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.white)
                        .frame(width: 200, height: 200)
                        .shadow(color: Color.black.opacity(0.08), radius: 8, x: 0, y: 4)

                    Image(systemName: "qrcode")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 160, height: 160)
                        .foregroundColor(MedMargTheme.slate900)
                }
                .padding(.top, 20)

                VStack(spacing: 6) {
                    Text("Ayushman Bharat Health Account (ABHA)")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Text(abhaNumber)
                        .font(.system(size: 18, weight: .black, design: .monospaced))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    Text(abhaAddress)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Text("Show this QR code at hospitals and diagnostic centers across India to securely link and share your electronic health records (EHR).")
                    .font(.system(size: 12))
                    .foregroundColor(MedMargTheme.slate600)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)

                Spacer()

                Button(action: {
                    showAbhaDetailsSheet = false
                    showToast("ABHA Card Saved to Photos")
                }) {
                    HStack(spacing: 6) {
                        Image(systemName: "square.and.arrow.down.fill")
                        Text("Download Official ABHA Card")
                            .font(.system(size: 14, weight: .bold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(MedMargTheme.primaryTeal)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
            }
            .navigationTitle("ABHA Digital Passport")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { showAbhaDetailsSheet = false }
                }
            }
        }
    }

    private func showToast(_ message: String) {
        withAnimation(.spring(response: 0.3)) {
            copiedToast = message
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
            withAnimation(.spring(response: 0.3)) {
                copiedToast = nil
            }
        }
    }
}
