import SwiftUI

// =========================================================================
// 🎁 CARE SEEKER REFERRAL & CORPORATE STAFF WELLNESS VIEW
// 100% Feature Parity with Web PatientReferralAndCorporate.jsx
// =========================================================================

struct ReferralRecord: Identifiable, Equatable {
    let id: String
    let friendName: String
    let date: String
    let testBooked: String
    let rewardEarned: Int
    let status: String
}

struct CorporateStaffMember: Identifiable, Equatable {
    let id: String
    var name: String
    var designation: String
    var age: Int
    var gender: String
    var packageAssigned: String
    var status: String // SCHEDULED, SAMPLE_COLLECTED, REPORT_READY
}

struct CareSeekerReferralCorporateView: View {
    @State private var subTab: String = "REFERRAL" // "REFERRAL" | "CORPORATE"
    @State private var referralCode: String = "MM-HEALTH-RAHUL200"
    @State private var walletBalance: Int = 400
    @State private var isCopied: Bool = false

    @State private var referralHistory: [ReferralRecord] = [
        ReferralRecord(id: "ref_1", friendName: "Suresh Varma", date: "24 Aug 2026", testBooked: "Aarogyam 1.3 Full Body", rewardEarned: 200, status: "CREDITED"),
        ReferralRecord(id: "ref_2", friendName: "Priya Reddy", date: "11 Aug 2026", testBooked: "Thyroid Total Profile", rewardEarned: 200, status: "CREDITED")
    ]

    // Corporate State
    @State private var companyName: String = "Sri Balaji Tech Solutions Pvt Ltd"
    @State private var companyGstin: String = "37AAAAA0000A1Z5"
    @State private var staffList: [CorporateStaffMember] = [
        CorporateStaffMember(id: "emp_101", name: "M. Doraswamy Raju", designation: "Engineering Lead", age: 34, gender: "Male", packageAssigned: "Executive Annual Wellness (92 Params)", status: "SAMPLE_COLLECTED"),
        CorporateStaffMember(id: "emp_102", name: "K. Suneetha", designation: "Operations Manager", age: 29, gender: "Female", packageAssigned: "Executive Annual Wellness (92 Params)", status: "REPORT_READY"),
        CorporateStaffMember(id: "emp_103", name: "R. Naveen Kumar", designation: "QA Specialist", age: 27, gender: "Male", packageAssigned: "Pre-Employment Health Screen", status: "SCHEDULED")
    ]

    @State private var showAddStaffSheet: Bool = false
    @State private var newStaffName: String = ""
    @State private var newStaffDesig: String = ""
    @State private var newStaffAge: String = "28"
    @State private var newStaffGender: String = "Male"
    @State private var newStaffPkg: String = "Executive Annual Wellness (92 Params)"

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                
                // 1. Dual Sub-Tab Switcher
                subTabSwitcherBar

                if subTab == "REFERRAL" {
                    referralSection
                } else {
                    corporateSection
                }

                Spacer().frame(height: 80)
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
        }
        .background(MedMargTheme.slate50)
        .sheet(isPresented: $showAddStaffSheet) {
            addStaffSheet
        }
    }

    // ==========================================
    // 🔀 1. SUB-TAB SWITCHER BAR
    // ==========================================
    private var subTabSwitcherBar: some View {
        HStack(spacing: 8) {
            Button(action: { subTab = "REFERRAL" }) {
                HStack(spacing: 6) {
                    Image(systemName: "gift.fill")
                        .foregroundColor(subTab == "REFERRAL" ? MedMargTheme.amberGold : MedMargTheme.slate500)
                    Text("Refer & Earn (₹\(walletBalance) Wallet)")
                        .font(.system(size: 12, weight: .bold))
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(subTab == "REFERRAL" ? MedMargTheme.primaryTeal : Color.white)
                .foregroundColor(subTab == "REFERRAL" ? .white : MedMargTheme.slate700)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(subTab == "REFERRAL" ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1.5))
            }

            Button(action: { subTab = "CORPORATE" }) {
                HStack(spacing: 6) {
                    Image(systemName: "building.2.fill")
                        .foregroundColor(subTab == "CORPORATE" ? MedMargTheme.amberGold : MedMargTheme.slate500)
                    Text("Corporate (\(staffList.count) Staff)")
                        .font(.system(size: 12, weight: .bold))
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(subTab == "CORPORATE" ? MedMargTheme.primaryTeal : Color.white)
                .foregroundColor(subTab == "CORPORATE" ? .white : MedMargTheme.slate700)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(subTab == "CORPORATE" ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1.5))
            }
        }
    }

    // ==========================================
    // 🎁 2. REFERRAL SECTION
    // ==========================================
    private var referralSection: some View {
        VStack(spacing: 16) {
            
            // Hero Banner
            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 6) {
                            Image(systemName: "sparkles")
                                .foregroundColor(MedMargTheme.amberGold)
                            Text("COMMUNITY HEALTH REWARDS")
                                .font(.system(size: 11, weight: .black))
                                .foregroundColor(MedMargTheme.amberLight)
                        }

                        Text("Refer Friends, Earn ₹200")
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(.white)

                        Text("Give ₹200 OFF on their first home sample collection. Get ₹200 Wallet cash when they complete their test.")
                            .font(.system(size: 12))
                            .foregroundColor(MedMargTheme.lightTeal)
                    }

                    Spacer()
                }

                // Wallet Balance Pill
                HStack {
                    HStack(spacing: 8) {
                        Image(systemName: "wallet.pass.fill")
                            .foregroundColor(MedMargTheme.amberGold)
                        Text("Available Wallet Cash:")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(MedMargTheme.lightTeal)
                        Text("₹\(walletBalance)")
                            .font(.system(size: 18, weight: .black))
                            .foregroundColor(.white)
                    }

                    Spacer()

                    Text("Auto-Applied on Cart")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MedMargTheme.amberLight)
                }
                .padding(12)
                .background(Color.white.opacity(0.12))
                .cornerRadius(12)
            }
            .padding(20)
            .background(
                LinearGradient(
                    colors: [MedMargTheme.darkTeal, Color(red: 0.0, green: 0.35, blue: 0.32)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .cornerRadius(22)
            .shadow(color: MedMargTheme.darkTeal.opacity(0.3), radius: 12, x: 0, y: 6)

            // Referral Code & Share Actions
            VStack(spacing: 14) {
                Text("YOUR EXCLUSIVE REFERRAL CODE")
                    .font(.system(size: 11, weight: .black))
                    .foregroundColor(MedMargTheme.slate500)

                HStack {
                    Text(referralCode)
                        .font(.system(size: 20, weight: .black, design: .monospaced))
                        .foregroundColor(MedMargTheme.slate900)
                        .tracking(2)

                    Spacer()

                    Button(action: {
                        UIPasteboard.general.string = referralCode
                        isCopied = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            isCopied = false
                        }
                    }) {
                        HStack(spacing: 4) {
                            Image(systemName: isCopied ? "checkmark" : "doc.on.doc.fill")
                            Text(isCopied ? "Copied!" : "Copy")
                                .font(.system(size: 12, weight: .bold))
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(MedMargTheme.lightTeal)
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .cornerRadius(8)
                    }
                }
                .padding(14)
                .background(MedMargTheme.slate50)
                .cornerRadius(14)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))

                // Share Buttons
                HStack(spacing: 10) {
                    Button(action: {
                        let msg = "Book NABL certified diagnostic health tests at home in Tirupati with MedMarg. Use my referral code *\(referralCode)* to get ₹200 OFF: https://medmarg.sriddha.com"
                        let urlStr = "https://wa.me/?text=\(msg.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
                        if let url = URL(string: urlStr) {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        HStack(spacing: 6) {
                            Image(systemName: "message.fill")
                            Text("Share via WhatsApp")
                                .font(.system(size: 13, weight: .bold))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color(red: 0.15, green: 0.78, blue: 0.40))
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                }
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(20)
            .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))

            // Referral History Section
            VStack(alignment: .leading, spacing: 12) {
                Text("Referral Earnings History (\(referralHistory.count))")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                ForEach(referralHistory) { ref in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(ref.friendName)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("\(ref.testBooked) • \(ref.date)")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 2) {
                            Text("+₹\(ref.rewardEarned)")
                                .font(.system(size: 14, weight: .black))
                                .foregroundColor(Color.green)
                            Text(ref.status)
                                .font(.system(size: 9, weight: .black))
                                .foregroundColor(Color.green)
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
    }

    // ==========================================
    // 🏢 3. CORPORATE SECTION
    // ==========================================
    private var corporateSection: some View {
        VStack(spacing: 16) {
            
            // Company Card
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(companyName)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("GSTIN: \(companyGstin)")
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    Spacer()

                    Text("Active Corporate Account")
                        .font(.system(size: 10, weight: .black))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(MedMargTheme.lightTeal)
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .cornerRadius(6)
                }
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(20)
            .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))

            // Staff Roster Card
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    Text("Staff Health Roster (\(staffList.count))")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Spacer()

                    Button(action: { showAddStaffSheet = true }) {
                        HStack(spacing: 4) {
                            Image(systemName: "plus")
                            Text("Add Employee")
                                .font(.system(size: 12, weight: .bold))
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(MedMargTheme.primaryTeal)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                }

                ForEach(staffList) { emp in
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 3) {
                            Text(emp.name)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("\(emp.designation) • \(emp.age) yrs • \(emp.gender)")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                            Text("Package: \(emp.packageAssigned)")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }

                        Spacer()

                        Text(emp.status)
                            .font(.system(size: 9, weight: .black))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 3)
                            .background(emp.status == "REPORT_READY" ? Color.green.opacity(0.12) : MedMargTheme.lightTeal)
                            .foregroundColor(emp.status == "REPORT_READY" ? Color.green : MedMargTheme.primaryTeal)
                            .cornerRadius(4)
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
    }

    // Add Staff Modal
    private var addStaffSheet: some View {
        NavigationStack {
            Form {
                Section(header: Text("Employee Details")) {
                    TextField("Full Name", text: $newStaffName)
                    TextField("Designation / Role", text: $newStaffDesig)
                    TextField("Age", text: $newStaffAge)
                        .keyboardType(.numberPad)
                    Picker("Gender", selection: $newStaffGender) {
                        Text("Male").tag("Male")
                        Text("Female").tag("Female")
                        Text("Other").tag("Other")
                    }
                }

                Section(header: Text("Corporate Wellness Package")) {
                    Picker("Assigned Package", selection: $newStaffPkg) {
                        Text("Executive Annual Wellness (92 Params)").tag("Executive Annual Wellness (92 Params)")
                        Text("Pre-Employment Health Screen").tag("Pre-Employment Health Screen")
                        Text("Women's Executive Wellness Shield").tag("Women's Executive Wellness Shield")
                    }
                }
            }
            .navigationTitle("Add Corporate Staff")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { showAddStaffSheet = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        if !newStaffName.isEmpty {
                            staffList.append(CorporateStaffMember(
                                id: "emp_\(Date().timeIntervalSince1970)",
                                name: newStaffName,
                                designation: newStaffDesig.isEmpty ? "Team Member" : newStaffDesig,
                                age: Int(newStaffAge) ?? 28,
                                gender: newStaffGender,
                                packageAssigned: newStaffPkg,
                                status: "SCHEDULED"
                            ))
                            newStaffName = ""
                            newStaffDesig = ""
                            showAddStaffSheet = false
                        }
                    }
                    .disabled(newStaffName.isEmpty)
                }
            }
        }
    }
}
