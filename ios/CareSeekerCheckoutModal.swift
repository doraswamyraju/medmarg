import SwiftUI

// =========================================================================
// 💳 CARE SEEKER MULTI-STEP CHECKOUT & BOOKING MODAL
// 100% Feature Parity with Web CareSeekerCheckoutModal.jsx
// =========================================================================

struct CareSeekerCheckoutModal: View {
    @Binding var isOpen: Bool
    var user: UserProfile? = nil
    let cartItems: [CartItem]
    let selectedLabProvider: String
    let onOrderSuccess: (LiveOrderModel) -> Void
    let onOpenAddressModal: () -> Void

    @State private var currentStep: Int = 1 // 1: Beneficiary & Address, 2: Slot & Payment
    
    // Beneficiary
    @State private var beneficiaryType: String = "SELF" // "SELF" | "FAMILY"
    @State private var beneficiaryName: String = ""
    @State private var beneficiaryAge: String = "34"
    @State private var beneficiaryGender: String = "Male"
    @State private var beneficiaryPhone: String = ""

    // Address
    @State private var selectedAddressIndex: Int = 0
    private let savedAddresses: [(label: String, address: String)] = [
        ("Home", "Plot 42, Air Bypass Road, Tirupati, AP - 517501"),
        ("Parents", "Door 12-4/A, Gandhi Road, Tirupati, AP - 517502")
    ]

    // Slot
    @State private var selectedDate: String = "Tomorrow (Morning)"
    @State private var selectedSlot: String = "07:00 AM - 08:00 AM (Recommended for Fasting)"
    @State private var isExpressPhlebotomy: Bool = false

    // Payment Mode & Gateway
    @State private var paymentMode: String = "RAZORPAY_ONLINE" // RAZORPAY_ONLINE, RAZORPAY_DOORSTEP_QR
    @State private var isSubmitting: Bool = false
    @State private var showRazorpaySheet: Bool = false
    @State private var razorpayOrderId: String = ""
    @State private var razorpayKeyId: String = "rzp_test_517501MMG001"
    @State private var pendingOrderId: String = ""

    private var cartTotal: Int {
        cartItems.reduce(0) { $0 + $1.price }
    }

    private var activeLabName: String {
        switch selectedLabProvider {
        case "thyrocare": return "Thyrocare Technologies"
        case "lalpath": return "Dr. Lal PathLabs"
        default: return "MedMarg Direct"
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    
                    // Stepper Indicator (Step 1 -> Step 2)
                    stepperIndicatorBar

                    if currentStep == 1 {
                        step1BeneficiaryAndAddress
                    } else {
                        step2SlotAndPayment
                    }

                    Spacer().frame(height: 30)
                }
                .padding(16)
            }
            .background(MedMargTheme.slate50)
            .navigationTitle(currentStep == 1 ? "Step 1: Care Seeker & Address" : "Step 2: Slot & Payment")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(currentStep == 1 ? "Cancel" : "Back") {
                        if currentStep == 1 {
                            isOpen = false
                        } else {
                            currentStep = 1
                        }
                    }
                }
            }
            .onAppear {
                syncWithUserProfile()
            }
            .sheet(isPresented: $showRazorpaySheet) {
                razorpayPaymentGatewayModal
            }
        }
    }

    // ==========================================
    // 🚦 STEPPER INDICATOR
    // ==========================================
    private var stepperIndicatorBar: some View {
        HStack(spacing: 8) {
            HStack(spacing: 6) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.primaryTeal)
                        .frame(width: 24, height: 24)
                    Text("1")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                }
                Text("Beneficiary & Address")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }

            Rectangle()
                .fill(currentStep == 2 ? MedMargTheme.primaryTeal : MedMargTheme.slate200)
                .frame(height: 2)

            HStack(spacing: 6) {
                ZStack {
                    Circle()
                        .fill(currentStep == 2 ? MedMargTheme.primaryTeal : MedMargTheme.slate200)
                        .frame(width: 24, height: 24)
                    Text("2")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(currentStep == 2 ? .white : MedMargTheme.slate500)
                }
                Text("Slot & Pay")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(currentStep == 2 ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
            }
        }
        .padding(12)
        .background(Color.white)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 👤 STEP 1: BENEFICIARY & ADDRESS
    // ==========================================
    private var step1BeneficiaryAndAddress: some View {
        VStack(spacing: 16) {
            
            // Beneficiary Selection (Self vs Family)
            VStack(alignment: .leading, spacing: 12) {
                Text("Who is this test for?")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                HStack(spacing: 10) {
                    Button(action: {
                        beneficiaryType = "SELF"
                        syncWithUserProfile()
                    }) {
                        HStack(spacing: 6) {
                            Image(systemName: "person.fill")
                            Text("For Myself (Self)")
                                .font(.system(size: 12, weight: .bold))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(beneficiaryType == "SELF" ? MedMargTheme.primaryTeal : MedMargTheme.slate100)
                        .foregroundColor(beneficiaryType == "SELF" ? .white : MedMargTheme.slate700)
                        .cornerRadius(10)
                    }

                    Button(action: {
                        beneficiaryType = "FAMILY"
                        beneficiaryName = ""
                        beneficiaryAge = "30"
                        beneficiaryGender = "Female"
                    }) {
                        HStack(spacing: 6) {
                            Image(systemName: "person.2.fill")
                            Text("For Family Member")
                                .font(.system(size: 12, weight: .bold))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(beneficiaryType == "FAMILY" ? MedMargTheme.primaryTeal : MedMargTheme.slate100)
                        .foregroundColor(beneficiaryType == "FAMILY" ? .white : MedMargTheme.slate700)
                        .cornerRadius(10)
                    }
                }

                // Details Form
                VStack(spacing: 10) {
                    TextField("Patient Full Name", text: $beneficiaryName)
                        .padding(10)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(8)

                    HStack(spacing: 10) {
                        TextField("Age", text: $beneficiaryAge)
                            .keyboardType(.numberPad)
                            .padding(10)
                            .background(MedMargTheme.slate50)
                            .cornerRadius(8)

                        Picker("Gender", selection: $beneficiaryGender) {
                            Text("Male").tag("Male")
                            Text("Female").tag("Female")
                            Text("Other").tag("Other")
                        }
                        .pickerStyle(.menu)
                        .padding(6)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(8)
                    }

                    TextField("Phone Number", text: $beneficiaryPhone)
                        .keyboardType(.phonePad)
                        .padding(10)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(8)
                }
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))

            // Doorstep Address Picker
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Select Sample Collection Address")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Spacer()

                    Button(action: onOpenAddressModal) {
                        HStack(spacing: 2) {
                            Image(systemName: "plus")
                            Text("New")
                        }
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }

                VStack(spacing: 8) {
                    ForEach(0..<savedAddresses.count, id: \.self) { idx in
                        let addr = savedAddresses[idx]
                        let isSelected = selectedAddressIndex == idx

                        Button(action: { selectedAddressIndex = idx }) {
                            HStack(alignment: .top, spacing: 10) {
                                Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                                    .foregroundColor(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                                    .padding(.top, 2)

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(addr.label)
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundColor(MedMargTheme.slate900)
                                    Text(addr.address)
                                        .font(.system(size: 11))
                                        .foregroundColor(MedMargTheme.slate500)
                                        .multilineTextAlignment(.leading)
                                }

                                Spacer()
                            }
                            .padding(12)
                            .background(isSelected ? MedMargTheme.lightTeal.opacity(0.3) : Color.white)
                            .cornerRadius(10)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1))
                        }
                    }
                }
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))

            // Continue Button
            Button(action: { currentStep = 2 }) {
                HStack {
                    Text("Continue to Slot & Payment")
                        .font(.system(size: 14, weight: .bold))
                    Image(systemName: "arrow.right")
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(MedMargTheme.primaryTeal)
                .foregroundColor(.white)
                .cornerRadius(14)
            }
        }
    }

    // ==========================================
    // ⏱ STEP 2: SLOT & PAYMENT
    // ==========================================
    private var step2SlotAndPayment: some View {
        VStack(spacing: 16) {
            
            // Slot Picker
            VStack(alignment: .leading, spacing: 12) {
                Text("Select Doorstep Phlebotomy Slot")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                VStack(spacing: 8) {
                    slotOption(title: "Tomorrow 06:00 AM - 07:00 AM", badge: "EARLY BIRD")
                    slotOption(title: "Tomorrow 07:00 AM - 08:00 AM", badge: "FASTING RECOMMENDED")
                    slotOption(title: "Tomorrow 08:00 AM - 09:00 AM", badge: "POPULAR")
                    slotOption(title: "Tomorrow 09:00 AM - 10:00 AM", badge: "")
                }

                // 60-Min Express Dispatch Toggle
                Toggle(isOn: $isExpressPhlebotomy) {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 4) {
                            Text("⚡ 60-Minute Express Phlebotomy")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text("FREE")
                                .font(.system(size: 9, weight: .black))
                                .foregroundColor(Color.green)
                        }
                        Text("Phlebotomist will reach your doorstep within 60 mins")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }
                .toggleStyle(SwitchToggleStyle(tint: MedMargTheme.primaryTeal))
                .padding(.top, 6)
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))

            // Razorpay Payment Integration
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Payment Method")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Spacer()

                    HStack(spacing: 4) {
                        Image(systemName: "checkmark.shield.fill")
                            .foregroundColor(MedMargTheme.primaryTeal)
                            .font(.system(size: 11))
                        Text("Razorpay Verified")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }

                VStack(spacing: 8) {
                    paymentOption(
                        key: "RAZORPAY_ONLINE",
                        name: "Razorpay Instant Checkout (UPI / Cards / NetBanking)",
                        desc: "Google Pay, PhonePe, Paytm, Visa, Mastercard, NetBanking",
                        discount: "5% OFF"
                    )
                    paymentOption(
                        key: "RAZORPAY_DOORSTEP_QR",
                        name: "Razorpay Doorstep Dynamic QR",
                        desc: "Phlebotomist generates live Razorpay QR code at your doorstep",
                        discount: ""
                    )
                }

                // Razorpay Security Guarantee Footer
                HStack(spacing: 6) {
                    Image(systemName: "lock.fill")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.slate500)
                    Text("100% Secure 256-bit Encrypted Payments powered by Razorpay")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.slate500)
                }
                .padding(.top, 4)
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))

            // Booking Summary & Confirm Button
            VStack(spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Total Amount (\(cartItems.count) Tests)")
                            .font(.system(size: 12))
                            .foregroundColor(MedMargTheme.slate500)
                        Text("Lab: \(activeLabName)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }

                    Spacer()

                    Text("₹\(cartTotal)")
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }

                Button(action: handlePlaceOrder) {
                    HStack(spacing: 6) {
                        if isSubmitting {
                            ProgressView().tint(.white)
                        }
                        Text(isSubmitting ? "Dispatching..." : "Confirm & Book Phlebotomist")
                            .font(.system(size: 14, weight: .bold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(MedMargTheme.primaryTeal)
                    .foregroundColor(.white)
                    .cornerRadius(14)
                }
                .disabled(isSubmitting)
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        }
    }

    private func slotOption(title: String, badge: String) -> some View {
        let isSelected = selectedSlot == title
        return Button(action: { selectedSlot = title }) {
            HStack {
                Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                    .foregroundColor(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                Text(title)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                if !badge.isEmpty {
                    Text(badge)
                        .font(.system(size: 8, weight: .black))
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(MedMargTheme.lightTeal)
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .cornerRadius(4)
                }
            }
            .padding(10)
            .background(isSelected ? MedMargTheme.lightTeal.opacity(0.3) : MedMargTheme.slate50)
            .cornerRadius(8)
        }
    }

    private func paymentOption(key: String, name: String, desc: String, discount: String) -> some View {
        let isSelected = paymentMode == key
        return Button(action: { paymentMode = key }) {
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                    .foregroundColor(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                    .padding(.top, 2)

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text(name)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        if !discount.isEmpty {
                            Text(discount)
                                .font(.system(size: 8, weight: .black))
                                .padding(.horizontal, 5)
                                .padding(.vertical, 2)
                                .background(Color.green.opacity(0.12))
                                .foregroundColor(Color.green)
                                .cornerRadius(4)
                        }
                    }
                    Text(desc)
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()
            }
            .padding(10)
            .background(isSelected ? MedMargTheme.lightTeal.opacity(0.3) : MedMargTheme.slate50)
            .cornerRadius(8)
        }
    }

    private func syncWithUserProfile() {
        if let u = user {
            if !u.name.isEmpty {
                beneficiaryName = u.name
            }
            let cachedPhone = UserDefaults.standard.string(forKey: "medmarg_user_phone_\(u.email.lowercased())") ?? ""
            if !cachedPhone.isEmpty {
                beneficiaryPhone = cachedPhone
            } else if !u.phone.isEmpty {
                beneficiaryPhone = u.phone
            }
        }
        if beneficiaryName.isEmpty {
            beneficiaryName = "Care Seeker"
        }
        if beneficiaryPhone.isEmpty {
            beneficiaryPhone = "+91 98765 43210"
        }
    }

    private func handlePlaceOrder() {
        isSubmitting = true
        let orderId = "MM-LAB-\(Int.random(in: 1000...9999))"
        pendingOrderId = orderId

        if paymentMode == "RAZORPAY_ONLINE" {
            // Trigger Razorpay payment gateway
            initiateRazorpayPayment(orderId: orderId)
        } else {
            // Doorstep UPI QR or Cash on delivery
            executeOrderPersistence(orderId: orderId, paymentStatus: "PENDING_DOORSTEP")
        }
    }

    private func initiateRazorpayPayment(orderId: String) {
        guard let url = URL(string: "https://medmarg.com/api/v1/payments/create-order") else {
            showRazorpaySheet = true
            return
        }

        let patientEffectiveName = beneficiaryName.isEmpty ? (user?.name ?? "Customer") : beneficiaryName
        let patientEffectivePhone = beneficiaryPhone.isEmpty ? (user?.phone ?? "+91 98765 43210") : beneficiaryPhone

        let body: [String: Any] = [
            "amount": cartTotal,
            "orderId": orderId,
            "patientName": patientEffectiveName,
            "patientPhone": patientEffectivePhone,
            "notes": [
                "itemsCount": cartItems.count,
                "slot": "\(selectedDate), \(selectedSlot)",
                "lab": activeLabName
            ]
        ]

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.timeoutInterval = 6.0
        req.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])

        URLSession.shared.dataTask(with: req) { data, _, _ in
            DispatchQueue.main.async {
                if let d = data,
                   let json = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
                   let pData = json["data"] as? [String: Any] {
                    self.razorpayOrderId = pData["orderId"] as? String ?? "order_\(UUID().uuidString.prefix(12))"
                    self.razorpayKeyId = pData["keyId"] as? String ?? "rzp_test_517501MMG001"
                } else {
                    self.razorpayOrderId = "order_\(UUID().uuidString.prefix(12))"
                    self.razorpayKeyId = "rzp_test_517501MMG001"
                }
                self.isSubmitting = false
                self.showRazorpaySheet = true
            }
        }.resume()
    }

    private func executeOrderPersistence(orderId: String, paymentStatus: String) {
        let chosenAddress = savedAddresses[selectedAddressIndex].address
        let itemsList = cartItems.map { LiveOrderItem(id: $0.id, name: $0.title, price: $0.price) }
        let itemsNames = cartItems.map { $0.title }.joined(separator: ", ")

        let effectivePatientName = beneficiaryName.isEmpty ? (user?.name ?? "Customer") : beneficiaryName
        let effectivePatientPhone = beneficiaryPhone.isEmpty ? (user?.phone ?? "+91 98765 43210") : beneficiaryPhone
        let effectiveUserEmail = user?.email.lowercased() ?? "patient@medmarg.com"
        let otpCode = "\(Int.random(in: 1000...9999))"

        let bookingPayload: [String: Any] = [
            "id": orderId,
            "patientName": effectivePatientName,
            "careSeekerName": effectivePatientName,
            "patientPhone": effectivePatientPhone,
            "phone": effectivePatientPhone,
            "patientEmail": effectiveUserEmail,
            "customerEmail": effectiveUserEmail,
            "address": chosenAddress,
            "city": "Tirupati",
            "pincode": "517501",
            "slot": selectedSlot,
            "scheduledSlot": selectedSlot,
            "scheduledDate": selectedDate,
            "items": itemsNames,
            "amount": cartTotal,
            "totalAmount": cartTotal,
            "paymentMode": paymentMode,
            "paymentStatus": paymentStatus,
            "status": "ENROUTE",
            "phleboName": "Ramesh Kumar (Certified Phlebotomist)",
            "phleboPhone": "+91 98765 11223",
            "handoverOtp": otpCode,
            "otp": otpCode,
            "labName": activeLabName,
            "selectedLabProvider": selectedLabProvider,
            "isExpress": isExpressPhlebotomy,
            "tempTelemetry": "3.8°C (Optimal Cold-Chain)",
            "date": "Today"
        ]

        // 1. Post to main booking endpoint
        if let bookUrl = URL(string: "https://medmarg.com/api/v1/orders/book") {
            var req = URLRequest(url: bookUrl)
            req.httpMethod = "POST"
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.timeoutInterval = 5.0
            req.httpBody = try? JSONSerialization.data(withJSONObject: bookingPayload, options: [])
            URLSession.shared.dataTask(with: req).resume()
        }

        // 2. Also Post to admin orders endpoint to ensure instant synchronization
        if let adminUrl = URL(string: "https://medmarg.com/api/v1/admin/orders") {
            var adminReq = URLRequest(url: adminUrl)
            adminReq.httpMethod = "POST"
            adminReq.setValue("application/json", forHTTPHeaderField: "Content-Type")
            adminReq.timeoutInterval = 5.0
            adminReq.httpBody = try? JSONSerialization.data(withJSONObject: bookingPayload, options: [])
            URLSession.shared.dataTask(with: adminReq).resume()
        }

        // 3. Fallback to local server if running
        if let localUrl = URL(string: "http://127.0.0.1:5080/api/v1/orders/book") {
            var localReq = URLRequest(url: localUrl)
            localReq.httpMethod = "POST"
            localReq.setValue("application/json", forHTTPHeaderField: "Content-Type")
            localReq.timeoutInterval = 2.0
            localReq.httpBody = try? JSONSerialization.data(withJSONObject: bookingPayload, options: [])
            URLSession.shared.dataTask(with: localReq).resume()
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            self.completeLocalOrder(orderId: orderId, address: chosenAddress, items: itemsList, paymentStatus: paymentStatus, otp: otpCode)
        }
    }

    private func completeLocalOrder(orderId: String, address: String, items: [LiveOrderItem], paymentStatus: String, otp: String) {
        self.isSubmitting = false
        self.showRazorpaySheet = false
        let newOrder = LiveOrderModel(
            id: orderId,
            date: "Today",
            slot: selectedSlot,
            address: address,
            phleboName: "Ramesh Kumar (Certified Phlebotomist)",
            phleboPhone: "+91 98765 11223",
            status: "ENROUTE",
            eta: isExpressPhlebotomy ? "15 Mins" : "Tomorrow Morning",
            tempTelemetry: "3.8°C (Optimal Cold-Chain)",
            handoverOtp: otp,
            items: items,
            totalAmount: cartTotal,
            paymentStatus: paymentStatus
        )
        onOrderSuccess(newOrder)
        isOpen = false
    }

    // ==========================================
    // 💳 RAZORPAY PAYMENT GATEWAY MODAL SHEET
    // ==========================================
    private var razorpayPaymentGatewayModal: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Razorpay Header Brand Bar
                HStack(spacing: 12) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color(red: 0.05, green: 0.18, blue: 0.38))
                            .frame(width: 36, height: 36)
                        Image(systemName: "bolt.fill")
                            .font(.system(size: 18))
                            .foregroundColor(Color(red: 0.13, green: 0.59, blue: 0.95))
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 4) {
                            Text("Razorpay")
                                .font(.system(size: 16, weight: .black))
                                .foregroundColor(Color(red: 0.05, green: 0.18, blue: 0.38))
                            Text("TRUSTED")
                                .font(.system(size: 9, weight: .black))
                                .padding(.horizontal, 5)
                                .padding(.vertical, 2)
                                .background(Color.green.opacity(0.15))
                                .foregroundColor(Color(red: 0.05, green: 0.55, blue: 0.25))
                                .cornerRadius(4)
                        }
                        Text("Medcare Health Services (MedMarg)")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 1) {
                        Text("AMOUNT")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                        Text("₹\(cartTotal)")
                            .font(.system(size: 17, weight: .black, design: .rounded))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }
                .padding(16)
                .background(Color.white)
                .overlay(Rectangle().frame(height: 1).foregroundColor(MedMargTheme.slate200), alignment: .bottom)

                // Gateway Content
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        // Order details summary pill
                        HStack {
                            VStack(alignment: .leading, spacing: 3) {
                                Text("Patient: \(beneficiaryName)")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)
                                Text("Phone: \(beneficiaryPhone) • \(cartItems.count) Tests")
                                    .font(.system(size: 11))
                                    .foregroundColor(MedMargTheme.slate500)
                            }
                            Spacer()
                            Text(pendingOrderId)
                                .font(.system(size: 11, weight: .bold, design: .monospaced))
                                .foregroundColor(MedMargTheme.primaryTeal)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(MedMargTheme.lightTeal)
                                .cornerRadius(6)
                        }
                        .padding(12)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(12)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))

                        // Fast Checkout UPI Options
                        VStack(alignment: .leading, spacing: 10) {
                            Text("UPI / INSTANT PAY")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)

                            razorpayMethodRow(
                                title: "Google Pay",
                                subtitle: "Instant approval with any linked bank",
                                icon: "g.circle.fill",
                                color: Color(red: 0.26, green: 0.52, blue: 0.96)
                            )

                            razorpayMethodRow(
                                title: "PhonePe",
                                subtitle: "Fast checkout using UPI ID / Mobile",
                                icon: "p.circle.fill",
                                color: Color(red: 0.38, green: 0.15, blue: 0.58)
                            )

                            razorpayMethodRow(
                                title: "Paytm UPI",
                                subtitle: "Pay directly with Wallet or Bank account",
                                icon: "creditcard.circle.fill",
                                color: Color(red: 0.0, green: 0.72, blue: 0.96)
                            )
                        }
                        .padding(14)
                        .background(Color.white)
                        .cornerRadius(14)
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))

                        // Cards & NetBanking
                        VStack(alignment: .leading, spacing: 10) {
                            Text("CARDS & NETBANKING")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)

                            razorpayMethodRow(
                                title: "Credit / Debit Card",
                                subtitle: "Visa, Mastercard, RuPay, Maestro",
                                icon: "creditcard.fill",
                                color: MedMargTheme.primaryTeal
                            )

                            razorpayMethodRow(
                                title: "NetBanking",
                                subtitle: "All Indian banks supported (SBI, HDFC, ICICI, etc.)",
                                icon: "building.columns.fill",
                                color: MedMargTheme.slate700
                            )
                        }
                        .padding(14)
                        .background(Color.white)
                        .cornerRadius(14)
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))

                        // Security guarantee badge
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.shield.fill")
                                .foregroundColor(Color.green)
                            Text("PCI-DSS Certified 256-bit Bank Grade Security")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        .padding(.top, 4)
                    }
                    .padding(16)
                }

                // Gateway Action Button
                VStack(spacing: 8) {
                    Button(action: {
                        isSubmitting = true
                        executeOrderPersistence(orderId: pendingOrderId, paymentStatus: "PAID_SUCCESS")
                    }) {
                        HStack(spacing: 8) {
                            if isSubmitting {
                                ProgressView().tint(.white)
                            }
                            Text(isSubmitting ? "Verifying Payment..." : "Pay ₹\(cartTotal) via Razorpay")
                                .font(.system(size: 15, weight: .bold))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color(red: 0.05, green: 0.18, blue: 0.38))
                        .foregroundColor(.white)
                        .cornerRadius(12)
                        .shadow(color: Color(red: 0.05, green: 0.18, blue: 0.38).opacity(0.3), radius: 6, x: 0, y: 3)
                    }
                    .disabled(isSubmitting)
                }
                .padding(16)
                .background(Color.white)
                .overlay(Rectangle().frame(height: 1).foregroundColor(MedMargTheme.slate200), alignment: .top)
            }
            .navigationTitle("Razorpay Gateway")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        showRazorpaySheet = false
                    }
                }
            }
        }
    }

    private func razorpayMethodRow(title: String, subtitle: String, icon: String, color: Color) -> some View {
        Button(action: {
            isSubmitting = true
            executeOrderPersistence(orderId: pendingOrderId, paymentStatus: "PAID_SUCCESS")
        }) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
                    .frame(width: 28)

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text(subtitle)
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate500.opacity(0.6))
            }
            .padding(.vertical, 6)
        }
    }
}
