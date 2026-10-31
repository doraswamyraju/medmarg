import SwiftUI
import WebKit

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
    @State private var razorpayKeyId: String = "rzp_live_Tno7dmuqnwn1YS"
    @State private var razorpayPaymentUrl: String = ""
    @State private var pendingOrderId: String = ""
    @State private var errorMessage: String? = nil

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
        let patientEmail = user?.email.lowercased() ?? "patient@medmarg.com"

        let body: [String: Any] = [
            "amount": cartTotal,
            "orderId": orderId,
            "patientName": patientEffectiveName,
            "patientPhone": patientEffectivePhone,
            "notes": [
                "itemsCount": cartItems.count,
                "slot": "\(selectedDate), \(selectedSlot)",
                "lab": activeLabName,
                "email": patientEmail
            ]
        ]

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.timeoutInterval = 8.0
        req.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])

        URLSession.shared.dataTask(with: req) { data, _, err in
            DispatchQueue.main.async {
                self.isSubmitting = false
                if let d = data,
                   let json = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
                   let pData = json["data"] as? [String: Any] {
                    self.razorpayOrderId = pData["orderId"] as? String ?? ""
                    self.razorpayKeyId = pData["keyId"] as? String ?? "rzp_live_Tno7dmuqnwn1YS"
                    self.razorpayPaymentUrl = pData["paymentUrl"] as? String ?? ""
                }
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

        let initialStatus = isExpressPhlebotomy ? "ENROUTE" : "BOOKED"
        let initialEta = isExpressPhlebotomy ? "15 Mins" : selectedSlot

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
            "status": initialStatus,
            "eta": initialEta,
            "phleboName": "Ramesh Kumar (Certified Phlebotomist)",
            "phleboPhone": "+91 98765 11223",
            "handoverOtp": otpCode,
            "otp": otpCode,
            "labName": activeLabName,
            "selectedLabProvider": selectedLabProvider,
            "isExpress": isExpressPhlebotomy,
            "tempTelemetry": "3.8°C (Optimal Cold-Chain)",
            "date": selectedDate
        ]

        // 1. Submit single booking to unified orders API
        if let bookUrl = URL(string: "https://medmarg.com/api/v1/orders/book") {
            var req = URLRequest(url: bookUrl)
            req.httpMethod = "POST"
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.timeoutInterval = 8.0
            req.httpBody = try? JSONSerialization.data(withJSONObject: bookingPayload, options: [])
            URLSession.shared.dataTask(with: req).resume()
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            self.completeLocalOrder(orderId: orderId, address: chosenAddress, items: itemsList, paymentStatus: paymentStatus, otp: otpCode, status: initialStatus, eta: initialEta)
        }
    }

    private func completeLocalOrder(orderId: String, address: String, items: [LiveOrderItem], paymentStatus: String, otp: String, status: String, eta: String) {
        self.isSubmitting = false
        self.showRazorpaySheet = false
        let newOrder = LiveOrderModel(
            id: orderId,
            date: selectedDate,
            slot: selectedSlot,
            address: address,
            phleboName: "Ramesh Kumar (Certified Phlebotomist)",
            phleboPhone: "+91 98765 11223",
            status: status,
            eta: eta,
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
    // 💳 RAZORPAY OFFICIAL CHECKOUT SHEET
    // ==========================================
    private var razorpayPaymentGatewayModal: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.05, green: 0.08, blue: 0.17).ignoresSafeArea()

                RazorpayStandardCheckoutWebView(
                    keyId: razorpayKeyId,
                    orderId: razorpayOrderId,
                    amount: cartTotal,
                    businessName: "Medcare Health Services",
                    productDescription: "MedMarg Diagnostics (\(cartItems.count) Tests)",
                    prefillName: beneficiaryName.isEmpty ? (user?.name ?? "Patient") : beneficiaryName,
                    prefillEmail: user?.email.lowercased() ?? "patient@medmarg.com",
                    prefillContact: beneficiaryPhone.replacingOccurrences(of: " ", with: ""),
                    hostedFallbackUrl: razorpayPaymentUrl,
                    onSuccess: { paymentId, rzpOrderId, signature in
                        DispatchQueue.main.async {
                            self.isSubmitting = true
                            self.executeOrderPersistence(orderId: self.pendingOrderId, paymentStatus: "PAID_SUCCESS")
                        }
                    },
                    onFailure: { errDesc in
                        DispatchQueue.main.async {
                            self.errorMessage = errDesc
                        }
                    },
                    onDismiss: {
                        DispatchQueue.main.async {
                            self.showRazorpaySheet = false
                        }
                    }
                )
            }
            .navigationTitle("Razorpay Secure Checkout")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(action: { showRazorpaySheet = false }) {
                        Text("Close")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
            }
        }
    }
}

// =========================================================================
// 🌐 RAZORPAY STANDARD JAVASCRIPT CHECKOUT WEBVIEW (OFFICIAL SDK PARITY)
// Embeds the official checkout.razorpay.com standard frame on iOS
// =========================================================================

struct RazorpayStandardCheckoutWebView: UIViewRepresentable {
    let keyId: String
    let orderId: String
    let amount: Int
    let businessName: String
    let productDescription: String
    let prefillName: String
    let prefillEmail: String
    let prefillContact: String
    let hostedFallbackUrl: String
    let onSuccess: (String, String, String) -> Void
    let onFailure: (String) -> Void
    let onDismiss: () -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeUIView(context: Context) -> WKWebView {
        let contentController = WKUserContentController()
        contentController.add(context.coordinator, name: "razorpayHandler")

        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.preferences.javaScriptCanOpenWindowsAutomatically = true

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.05, green: 0.08, blue: 0.17, alpha: 1.0)
        webView.scrollView.backgroundColor = UIColor(red: 0.05, green: 0.08, blue: 0.17, alpha: 1.0)

        // If a hosted Razorpay payment link was generated by the backend, load that directly
        if let linkUrl = URL(string: hostedFallbackUrl), !hostedFallbackUrl.isEmpty {
            let req = URLRequest(url: linkUrl)
            webView.load(req)
            return webView
        }

        // Standard official Razorpay embedded checkout script
        let safeContact = prefillContact.hasPrefix("+") ? prefillContact : "+91\(prefillContact)"
        let html = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>Razorpay Checkout</title>
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            <style>
                * { box-sizing: border-box; }
                body {
                    margin: 0;
                    padding: 0;
                    background: #0B132B;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    color: #FFFFFF;
                }
                .loader-container {
                    text-align: center;
                    padding: 24px;
                }
                .spinner {
                    width: 44px;
                    height: 44px;
                    border: 4px solid rgba(255, 255, 255, 0.15);
                    border-radius: 50%;
                    border-top-color: #006B70;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 16px;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                h3 { margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #FFFFFF; }
                p { margin: 0; font-size: 13px; color: #94A3B8; }
            </style>
        </head>
        <body>
            <div class="loader-container">
                <div class="spinner"></div>
                <h3>Connecting to Razorpay</h3>
                <p>Opening official payment gateway...</p>
            </div>
            <script>
                window.onload = function() {
                    try {
                        var options = {
                            "key": "\(keyId)",
                            "amount": "\(amount * 100)",
                            "currency": "INR",
                            "name": "\(businessName)",
                            "description": "\(productDescription)",
                            \(orderId.isEmpty ? "" : "\"order_id\": \"\(orderId)\",")
                            "image": "https://medmarg.com/logo-icon.png",
                            "prefill": {
                                "name": "\(prefillName)",
                                "email": "\(prefillEmail)",
                                "contact": "\(safeContact)"
                            },
                            "theme": {
                                "color": "#006B70",
                                "backdrop_color": "#0B132B"
                            },
                            "modal": {
                                "backdropclose": false,
                                "escape": false,
                                "handleback": true,
                                "ondismiss": function() {
                                    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.razorpayHandler) {
                                        window.webkit.messageHandlers.razorpayHandler.postMessage({
                                            "status": "dismissed"
                                        });
                                    }
                                }
                            },
                            "handler": function (response) {
                                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.razorpayHandler) {
                                    window.webkit.messageHandlers.razorpayHandler.postMessage({
                                        "status": "success",
                                        "payment_id": response.razorpay_payment_id || "",
                                        "order_id": response.razorpay_order_id || "",
                                        "signature": response.razorpay_signature || ""
                                    });
                                }
                            }
                        };
                        var rzp = new Razorpay(options);
                        rzp.on('payment.failed', function (response){
                            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.razorpayHandler) {
                                window.webkit.messageHandlers.razorpayHandler.postMessage({
                                    "status": "failed",
                                    "error": (response.error && response.error.description) ? response.error.description : "Payment could not be processed"
                                });
                            }
                        });
                        rzp.open();
                    } catch (e) {
                        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.razorpayHandler) {
                            window.webkit.messageHandlers.razorpayHandler.postMessage({
                                "status": "failed",
                                "error": e.message || "Failed to launch Razorpay"
                            });
                        }
                    }
                };
            </script>
        </body>
        </html>
        """

        webView.loadHTMLString(html, baseURL: URL(string: "https://medmarg.com"))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        var parent: RazorpayStandardCheckoutWebView

        init(_ parent: RazorpayStandardCheckoutWebView) {
            self.parent = parent
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let dict = message.body as? [String: Any],
                  let status = dict["status"] as? String else { return }

            if status == "success" {
                let paymentId = dict["payment_id"] as? String ?? ""
                let orderId = dict["order_id"] as? String ?? ""
                let sig = dict["signature"] as? String ?? ""
                parent.onSuccess(paymentId, orderId, sig)
            } else if status == "failed" {
                let err = dict["error"] as? String ?? "Payment failed"
                parent.onFailure(err)
            } else if status == "dismissed" {
                parent.onDismiss()
            }
        }

        // Allow navigation to external UPI intent URLs (phonepe://, paytmmp://, gpay://, etc.)
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if let url = navigationAction.request.url {
                let scheme = url.scheme?.lowercased() ?? ""
                if scheme != "http" && scheme != "https" && scheme != "about" {
                    if UIApplication.shared.canOpenURL(url) {
                        UIApplication.shared.open(url, options: [:], completionHandler: nil)
                        decisionHandler(.cancel)
                        return
                    }
                }
            }
            decisionHandler(.allow)
        }
    }
}
