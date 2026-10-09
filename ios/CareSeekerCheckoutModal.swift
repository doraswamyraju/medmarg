import SwiftUI

// =========================================================================
// 💳 CARE SEEKER MULTI-STEP CHECKOUT & BOOKING MODAL
// 100% Feature Parity with Web CareSeekerCheckoutModal.jsx
// =========================================================================

struct CareSeekerCheckoutModal: View {
    @Binding var isOpen: Bool
    let cartItems: [CartItem]
    let selectedLabProvider: String
    let onOrderSuccess: (LiveOrderModel) -> Void
    let onOpenAddressModal: () -> Void

    @State private var currentStep: Int = 1 // 1: Beneficiary & Address, 2: Slot & Payment
    
    // Beneficiary
    @State private var beneficiaryType: String = "SELF" // "SELF" | "FAMILY"
    @State private var beneficiaryName: String = "Rahul Sharma"
    @State private var beneficiaryAge: String = "34"
    @State private var beneficiaryGender: String = "Male"
    @State private var beneficiaryPhone: String = "+91 98765 43210"

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

    // Payment Mode
    @State private var paymentMode: String = "PREPAID_UPI" // PREPAID_UPI, DOORSTEP_QR, CASH
    @State private var isSubmitting: Bool = false

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
                        beneficiaryName = "Rahul Sharma"
                        beneficiaryAge = "34"
                        beneficiaryGender = "Male"
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
                        beneficiaryName = "Sunita Sharma"
                        beneficiaryAge = "31"
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

            // Payment Mode
            VStack(alignment: .leading, spacing: 12) {
                Text("Payment Method")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                VStack(spacing: 8) {
                    paymentOption(key: "PREPAID_UPI", name: "Prepaid UPI / Google Pay / PhonePe", desc: "Instant confirmation & 5% instant discount", discount: "5% OFF")
                    paymentOption(key: "DOORSTEP_QR", name: "Doorstep QR Scan (UPI / Cards)", desc: "Pay phlebotomist via dynamic QR on arrival", discount: "")
                    paymentOption(key: "NET_BANKING_CARD", name: "Credit / Debit Cards & Net Banking", desc: "Secure 256-bit encrypted gateway", discount: "")
                }
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

    private func handlePlaceOrder() {
        isSubmitting = true

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            isSubmitting = false
            let newOrder = LiveOrderModel(
                id: "MM-LAB-\(Int.random(in: 1000...9999))",
                date: "Today",
                slot: selectedSlot,
                address: savedAddresses[selectedAddressIndex].address,
                phleboName: "Ramesh Kumar (Certified Phlebotomist)",
                phleboPhone: "+91 98765 11223",
                status: "ASSIGNED",
                eta: isExpressPhlebotomy ? "30 Mins" : "Tomorrow Morning",
                tempTelemetry: "3.8°C (Optimal Cold-Chain)",
                handoverOtp: "\(Int.random(in: 1000...9999))",
                items: cartItems.map { LiveOrderItem(id: $0.id, name: $0.title, price: $0.price) },
                totalAmount: cartTotal,
                paymentStatus: paymentMode == "PREPAID_UPI" ? "PAID" : "PENDING_DOORSTEP"
            )
            onOrderSuccess(newOrder)
            isOpen = false
        }
    }
}
