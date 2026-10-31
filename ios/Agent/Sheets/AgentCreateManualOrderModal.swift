import SwiftUI

// =========================================================================
// ➕ AGENT CREATE MANUAL ORDER MODAL (100% WEB PARITY)
// Replicates web/src/components/admin/orders/CreateManualOrderModal.jsx
// =========================================================================

struct AgentCreateManualOrderModal: View {
    let agentId: String
    let agentName: String
    let onOrderCreated: () -> Void
    @Environment(\.dismiss) private var dismiss

    // Stepper: 1: Patient, 2: Tests & Items, 3: Schedule & Payment
    @State private var currentStep: Int = 1

    // Step 1: Patient Details
    @State private var patientName: String = ""
    @State private var patientPhone: String = ""
    @State private var patientAge: String = ""
    @State private var patientGender: String = "Male"
    @State private var deliveryAddress: String = ""
    @State private var city: String = "Tirupati"
    @State private var pincode: String = "517501"

    // Step 2: Catalog Selection
    @State private var catalogTests: [CatalogItem] = []
    @State private var searchQuery: String = ""
    @State private var selectedItems: [CatalogItem] = []

    // Step 3: Slot & Payment Mode
    @State private var selectedDate: Date = Date()
    @State private var selectedSlot: String = "07:30 AM - 08:30 AM (Fasting)"
    @State private var paymentMode: String = "DOORSTEP_QR" // DOORSTEP_QR | CASH | PREPAID_UPI
    @State private var specialNotes: String = ""

    // Execution States
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String? = nil

    private let slotOptions = [
        "06:30 AM - 07:30 AM (Fasting Early)",
        "07:30 AM - 08:30 AM (Fasting)",
        "08:30 AM - 09:30 AM (Fasting)",
        "09:30 AM - 10:30 AM (Postprandial / Routine)",
        "11:00 AM - 12:30 PM (Mid-Day)",
        "04:00 PM - 05:30 PM (Evening Routine)"
    ]

    var totalOrderPrice: Int {
        selectedItems.reduce(0) { $0 + $1.price }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Step Indicator Pills
                stepIndicatorHeader

                // Body based on active step
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        if let err = errorMessage {
                            HStack {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(.red)
                                Text(err)
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(.red)
                            }
                            .padding(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(10)
                        }

                        if currentStep == 1 {
                            patientDetailsStep
                        } else if currentStep == 2 {
                            selectTestsStep
                        } else {
                            scheduleAndPaymentStep
                        }
                    }
                    .padding(16)
                }

                // Footer Navigation Buttons
                footerButtonsBar
            }
            .background(MedMargTheme.slate50)
            .navigationTitle("Create Manual Order")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onAppear {
                fetchCatalog()
            }
        }
    }

    // ==========================================
    // 🔘 STEP INDICATOR
    // ==========================================
    private var stepIndicatorHeader: some View {
        HStack(spacing: 8) {
            stepPill(number: 1, title: "Patient", isActive: currentStep == 1, isCompleted: currentStep > 1)
            stepDivider
            stepPill(number: 2, title: "Tests", isActive: currentStep == 2, isCompleted: currentStep > 2)
            stepDivider
            stepPill(number: 3, title: "Schedule", isActive: currentStep == 3, isCompleted: false)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.white)
        .overlay(Rectangle().frame(height: 1).foregroundColor(MedMargTheme.slate200), alignment: .bottom)
    }

    private func stepPill(number: Int, title: String, isActive: Bool, isCompleted: Bool) -> some View {
        HStack(spacing: 6) {
            ZStack {
                Circle()
                    .fill(isCompleted ? Color.green : (isActive ? MedMargTheme.primaryTeal : MedMargTheme.slate200))
                    .frame(width: 22, height: 22)

                if isCompleted {
                    Image(systemName: "checkmark")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white)
                } else {
                    Text("\(number)")
                        .font(.system(size: 11, weight: .black))
                        .foregroundColor(isActive ? .white : MedMargTheme.slate500)
                }
            }

            Text(title)
                .font(.system(size: 12, weight: isActive ? .black : .bold))
                .foregroundColor(isActive ? MedMargTheme.slate900 : MedMargTheme.slate500)
        }
    }

    private var stepDivider: some View {
        Rectangle()
            .fill(MedMargTheme.slate200)
            .frame(height: 1)
            .frame(maxWidth: 30)
    }

    // ==========================================
    // 👤 STEP 1: PATIENT DETAILS
    // ==========================================
    private var patientDetailsStep: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("1. PATIENT DEMOGRAPHICS")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            VStack(alignment: .leading, spacing: 6) {
                Text("Full Name *")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate700)
                TextField("e.g. Ramesh Varma", text: $patientName)
                    .padding(10)
                    .background(Color.white)
                    .cornerRadius(8)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Mobile Phone Number *")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate700)
                TextField("+91 98765 43210", text: $patientPhone)
                    .keyboardType(.phonePad)
                    .padding(10)
                    .background(Color.white)
                    .cornerRadius(8)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))
            }

            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Age")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                    TextField("45", text: $patientAge)
                        .keyboardType(.numberPad)
                        .padding(10)
                        .background(Color.white)
                        .cornerRadius(8)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Gender")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                    Picker("Gender", selection: $patientGender) {
                        Text("Male").tag("Male")
                        Text("Female").tag("Female")
                        Text("Other").tag("Other")
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Doorstep Address *")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate700)
                TextEditor(text: $deliveryAddress)
                    .frame(height: 70)
                    .padding(6)
                    .background(Color.white)
                    .cornerRadius(8)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))
            }

            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("City")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                    TextField("Tirupati", text: $city)
                        .padding(10)
                        .background(Color.white)
                        .cornerRadius(8)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Pincode")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                    TextField("517501", text: $pincode)
                        .keyboardType(.numberPad)
                        .padding(10)
                        .background(Color.white)
                        .cornerRadius(8)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))
                }
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(14)
    }

    // ==========================================
    // 🧪 STEP 2: SELECT TESTS FROM CATALOG
    // ==========================================
    private var selectTestsStep: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("2. SELECT TESTS & PROFILES")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            // Search Bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(MedMargTheme.slate500)
                TextField("Search CBC, Thyroid, Lipid, Sugar...", text: $searchQuery)
                    .font(.system(size: 13))
            }
            .padding(10)
            .background(MedMargTheme.slate50)
            .cornerRadius(10)

            // Selected Items Pill Bar
            if !selectedItems.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Selected Items (\(selectedItems.count)):")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    ForEach(selectedItems, id: \.id) { item in
                        HStack {
                            Text(item.name)
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Spacer()
                            Text("₹\(item.price)")
                                .font(.system(size: 12, weight: .black))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Button(action: {
                                selectedItems.removeAll { $0.id == item.id }
                            }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.red)
                            }
                        }
                        .padding(8)
                        .background(MedMargTheme.lightTeal.opacity(0.3))
                        .cornerRadius(8)
                    }
                }
                .padding(10)
                .background(Color.white)
                .cornerRadius(10)
            }

            // Catalog Items List
            let filtered = catalogTests.filter { item in
                searchQuery.isEmpty || item.name.localizedCaseInsensitiveContains(searchQuery)
            }

            ForEach(filtered.prefix(15)) { test in
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(test.name)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("\(test.sampleType ?? "SERUM") • \(test.tatHours ?? 24)h TAT")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    Spacer()

                    Text("₹\(test.price)")
                        .font(.system(size: 13, weight: .black))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    Button(action: {
                        if selectedItems.contains(where: { $0.id == test.id }) {
                            selectedItems.removeAll { $0.id == test.id }
                        } else {
                            selectedItems.append(test)
                        }
                    }) {
                        Text(selectedItems.contains(where: { $0.id == test.id }) ? "Added" : "+ Add")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(selectedItems.contains(where: { $0.id == test.id }) ? .white : MedMargTheme.primaryTeal)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(selectedItems.contains(where: { $0.id == test.id }) ? Color.green : MedMargTheme.lightTeal)
                            .cornerRadius(8)
                    }
                }
                .padding(10)
                .background(Color.white)
                .cornerRadius(10)
            }
        }
    }

    // ==========================================
    // 📅 STEP 3: SCHEDULE & PAYMENT
    // ==========================================
    private var scheduleAndPaymentStep: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("3. SCHEDULE & PAYMENT COLLECTION")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            // Slot Picker
            slotPickerSection

            // Payment Mode
            paymentModeSection

            // Order Cost Summary
            orderCostSummarySection
        }
    }

    private var slotPickerSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Select Doorstep Time Slot *")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(MedMargTheme.slate700)

            Picker("Slot", selection: $selectedSlot) {
                ForEach(slotOptions, id: \.self) { slot in
                    Text(slot).tag(slot)
                }
            }
            .pickerStyle(MenuPickerStyle())
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white)
            .cornerRadius(8)
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))
        }
    }

    private var paymentModeSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Payment Method *")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(MedMargTheme.slate700)

            HStack(spacing: 8) {
                paymentPill(title: "Doorstep QR", mode: "DOORSTEP_QR", icon: "qrcode")
                paymentPill(title: "Cash", mode: "CASH", icon: "banknote")
                paymentPill(title: "Prepaid UPI", mode: "PREPAID_UPI", icon: "creditcard")
            }
        }
    }

    private var orderCostSummarySection: some View {
        VStack(spacing: 8) {
            HStack {
                Text("Total Selected Tests (\(selectedItems.count))")
                    .font(.system(size: 12))
                    .foregroundColor(MedMargTheme.slate500)
                Spacer()
                Text("₹\(totalOrderPrice)")
                    .font(.system(size: 12, weight: .bold))
            }

            HStack {
                Text("Doorstep Phlebotomy Fee")
                    .font(.system(size: 12))
                    .foregroundColor(MedMargTheme.slate500)
                Spacer()
                Text("FREE (Fleet Handled)")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(Color.green)
            }

            Divider()

            HStack {
                Text("Total Payable")
                    .font(.system(size: 14, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                Text("₹\(totalOrderPrice)")
                    .font(.system(size: 17, weight: .black))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(12)
    }

    private func paymentPill(title: String, mode: String, icon: String) -> some View {
        Button(action: { paymentMode = mode }) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                Text(title)
            }
            .font(.system(size: 11, weight: .bold))
            .foregroundColor(paymentMode == mode ? .white : MedMargTheme.slate700)
            .padding(.horizontal, 10)
            .padding(.vertical, 10)
            .frame(maxWidth: .infinity)
            .background(paymentMode == mode ? MedMargTheme.primaryTeal : Color.white)
            .cornerRadius(10)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
        }
    }

    // ==========================================
    // ⏭️ FOOTER BUTTONS
    // ==========================================
    private var footerButtonsBar: some View {
        HStack(spacing: 12) {
            if currentStep > 1 {
                Button(action: { currentStep -= 1 }) {
                    Text("Back")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.white)
                        .cornerRadius(10)
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
                }
            }

            Button(action: handleNextOrSubmit) {
                HStack(spacing: 6) {
                    if isSubmitting {
                        ProgressView().tint(.white)
                    }
                    Text(currentStep == 3 ? (isSubmitting ? "Placing Order..." : "✓ Confirm & Create Request") : "Continue")
                        .font(.system(size: 13, weight: .black))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(MedMargTheme.primaryTeal)
                .cornerRadius(10)
            }
            .disabled(isSubmitting)
        }
        .padding(14)
        .background(Color.white)
    }

    private func handleNextOrSubmit() {
        if currentStep == 1 {
            guard !patientName.trimmingCharacters(in: .whitespaces).isEmpty else {
                errorMessage = "Please enter patient name"
                return
            }
            guard !patientPhone.trimmingCharacters(in: .whitespaces).isEmpty else {
                errorMessage = "Please enter contact mobile number"
                return
            }
            guard !deliveryAddress.trimmingCharacters(in: .whitespaces).isEmpty else {
                errorMessage = "Please enter doorstep address"
                return
            }
            errorMessage = nil
            currentStep = 2
        } else if currentStep == 2 {
            guard !selectedItems.isEmpty else {
                errorMessage = "Please select at least 1 diagnostic test from catalog"
                return
            }
            errorMessage = nil
            currentStep = 3
        } else {
            submitOrder()
        }
    }

    private func fetchCatalog() {
        guard let url = URL(string: "https://medmarg.com/api/v1/catalog/tests") else { return }
        URLSession.shared.dataTask(with: url) { data, _, _ in
            guard let d = data,
                  let json = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
                  let list = json["tests"] as? [[String: Any]] else { return }

            DispatchQueue.main.async {
                self.catalogTests = list.compactMap { d in
                    let id = d["id"] as? String ?? UUID().uuidString
                    let name = d["name"] as? String ?? ""
                    let price = d["price"] as? Int ?? (d["mrp"] as? Int ?? 299)
                    let mrp = d["mrp"] as? Int ?? price
                    let sample = d["sampleType"] as? String ?? "SERUM"
                    return CatalogItem(id: id, code: id, name: name, sampleType: sample, category: "Test", mrp: mrp, price: price, tatHours: 24, itemType: "TEST")
                }
            }
        }.resume()
    }

    private func submitOrder() {
        isSubmitting = true
        errorMessage = nil

        guard let url = URL(string: "https://medmarg.com/api/v1/orders/book") else {
            isSubmitting = false
            return
        }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload: [String: Any] = [
            "patientName": patientName,
            "patientPhone": patientPhone,
            "address": deliveryAddress,
            "city": city,
            "pincode": pincode,
            "scheduledSlot": selectedSlot,
            "items": selectedItems.map { ["id": $0.id, "name": $0.name, "price": $0.price] },
            "totalAmount": totalOrderPrice,
            "paymentMode": paymentMode,
            "paymentStatus": paymentMode == "PREPAID_UPI" ? "PAID_SUCCESS" : "PENDING_DOORSTEP",
            "assignedAgent": "\(agentName) (\(agentId))"
        ]

        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

        URLSession.shared.dataTask(with: req) { data, _, err in
            DispatchQueue.main.async {
                self.isSubmitting = false
                if let err = err {
                    self.errorMessage = err.localizedDescription
                    return
                }

                self.onOrderCreated()
                self.dismiss()
            }
        }.resume()
    }
}
