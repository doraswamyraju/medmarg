import SwiftUI

// =========================================================================
// 👤 CARE SEEKER PROFILE, ABHA ID & FAMILY MANAGEMENT VIEW
// 100% Feature Parity with Web PatientProfileTab.jsx
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
    let onLogout: () -> Void
    let onOpenAddressModal: () -> Void

    @State private var profileName: String = "Rahul Sharma"
    @State private var phone: String = "+91 98765 43210"
    @State private var email: String = "rahul.sharma@medmarg.in"
    @State private var bloodGroup: String = "O+ (Positive)"
    @State private var preferredLanguage: String = "Telugu & English"
    @State private var needleSensitivity: String = "Normal (Butterfly Needle)"

    // ABHA
    private let abhaNumber: String = "91-4829-1029-4820"
    private let abhaAddress: String = "rahulsharma@abdm"

    // Family Members
    @State private var familyMembers: [FamilyMemberItem] = [
        FamilyMemberItem(id: "f1", name: "Sunita Sharma", relation: "Spouse", age: 31, gender: "Female", bloodGroup: "B+", chronicConditions: ["Thyroid (Hypothyroidism)"], abhaId: "91-3829-1920-1120"),
        FamilyMemberItem(id: "f2", name: "Aarav Sharma", relation: "Son", age: 6, gender: "Male", bloodGroup: "O+", chronicConditions: ["None / Pediatric"], abhaId: "91-8839-4410-9921"),
        FamilyMemberItem(id: "f3", name: "K. Somasekhar Sharma", relation: "Father", age: 64, gender: "Male", bloodGroup: "O+", chronicConditions: ["Type-2 Diabetes", "Hypertension"], abhaId: "91-1192-3349-8812")
    ]

    // Addresses
    @State private var savedAddresses: [SavedAddressItem] = [
        SavedAddressItem(id: "addr_1", label: "Home", address: "Plot 42, Air Bypass Road, Tirupati, AP - 517501", isDefault: true, city: "Tirupati, AP", pincode: "517501"),
        SavedAddressItem(id: "addr_2", label: "Parents", address: "Door 12-4/A, Gandhi Road, Tirupati, AP - 517502", isDefault: false, city: "Tirupati, AP", pincode: "517502")
    ]

    @State private var showAddFamilySheet: Bool = false
    @State private var newFamName: String = ""
    @State private var newFamRelation: String = "Spouse"
    @State private var newFamAge: String = "28"
    @State private var newFamGender: String = "Female"
    @State private var newFamBlood: String = "O+"
    @State private var newFamCondition: String = "None"

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                
                // 1. Care Seeker Profile Header Card
                profileHeaderCard

                // 2. Health & Phlebotomy Preferences Grid
                healthPreferencesCard

                // 3. ABDM / Ayushman Bharat Digital ID Card
                abhaDigitalIdCard

                // 4. Linked Family Members Manager
                familyMembersSection

                // 5. Saved Doorstep Addresses
                savedAddressesSection

                // 6. Logout Button
                logoutCard

                Spacer().frame(height: 80)
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
        }
        .background(MedMargTheme.slate50)
        .sheet(isPresented: $showAddFamilySheet) {
            addFamilyMemberSheet
        }
    }

    // ==========================================
    // 👤 1. PROFILE HEADER CARD
    // ==========================================
    private var profileHeaderCard: some View {
        VStack(spacing: 16) {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.darkTeal)
                        .frame(width: 68, height: 68)
                    Text(profileName.prefix(1))
                        .font(.system(size: 26, weight: .black))
                        .foregroundColor(.white)
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
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("📞 \(phone)")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)

                    Text("✉️ \(email)")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()
            }

            Divider()

            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "location.fill")
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text("Serving in Tirupati, AP")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                }
                Spacer()
                Text("60-Min Phlebotomy")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🩺 2. HEALTH PREFERENCES CARD
    // ==========================================
    private var healthPreferencesCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Health & Sample Collection Preferences")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                preferenceItem(title: "BLOOD GROUP", value: bloodGroup, icon: "drop.fill", color: .red)
                preferenceItem(title: "LANGUAGE", value: preferredLanguage, icon: "globe", color: .blue)
                preferenceItem(title: "NEEDLE GAUGE", value: needleSensitivity, icon: "cross.vial.fill", color: .green)
                preferenceItem(title: "REPORTS VAULT", value: "Google Drive Sync", icon: "cloud.fill", color: MedMargTheme.primaryTeal)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))
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
    // 🆔 3. ABHA DIGITAL ID CARD
    // ==========================================
    private var abhaDigitalIdCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Ayushman Bharat Digital Mission (ABHA)")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.white)
                    Text("Govt of India Digital Health Locker")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.emeraldLight)
                }
                Spacer()
                Image(systemName: "qrcode")
                    .font(.system(size: 26))
                    .foregroundColor(MedMargTheme.amberGold)
            }

            Divider().background(Color.white.opacity(0.2))

            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("ABHA NUMBER")
                        .font(.system(size: 9, weight: .black))
                        .foregroundColor(MedMargTheme.lightTeal)
                    Text(abhaNumber)
                        .font(.system(size: 15, weight: .black, design: .monospaced))
                        .foregroundColor(.white)
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
                colors: [Color(red: 0.0, green: 0.35, blue: 0.32), MedMargTheme.darkTeal],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(18)
    }

    // ==========================================
    // 👨‍👩‍👧 4. FAMILY MEMBERS SECTION
    // ==========================================
    private var familyMembersSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Linked Family Members (\(familyMembers.count))")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Spacer()

                Button(action: { showAddFamilySheet = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                        Text("Add Member")
                            .font(.system(size: 12, weight: .bold))
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(MedMargTheme.primaryTeal)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
            }

            ForEach(familyMembers) { fam in
                HStack(alignment: .top) {
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
                        }

                        Text("\(fam.age) yrs • \(fam.gender) • Blood Group: \(fam.bloodGroup)")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)

                        Text("Conditions: \(fam.chronicConditions.joined(separator: ", "))")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(Color.orange)

                        Text("ABHA: \(fam.abhaId)")
                            .font(.system(size: 10, design: .monospaced))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    Spacer()

                    Button(action: {
                        familyMembers.removeAll { $0.id == fam.id }
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
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 📍 5. SAVED ADDRESSES SECTION
    // ==========================================
    private var savedAddressesSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Saved Doorstep Addresses (\(savedAddresses.count))")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Spacer()

                Button(action: onOpenAddressModal) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                        Text("Add Address")
                            .font(.system(size: 12, weight: .bold))
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(MedMargTheme.primaryTeal)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
            }

            ForEach(savedAddresses) { addr in
                HStack(alignment: .top) {
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
                        }

                        Text(addr.address)
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate700)
                            .lineLimit(2)
                    }

                    Spacer()

                    Button(action: {
                        savedAddresses.removeAll { $0.id == addr.id }
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
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🚪 6. LOGOUT BUTTON
    // ==========================================
    private var logoutCard: some View {
        Button(action: onLogout) {
            HStack(spacing: 8) {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                Text("Sign Out of MedMarg Portal")
                    .font(.system(size: 14, weight: .bold))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.red.opacity(0.1))
            .foregroundColor(.red)
            .cornerRadius(14)
        }
    }

    // Add Family Modal
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
                        }
                    }
                    .disabled(newFamName.isEmpty)
                }
            }
        }
    }
}
