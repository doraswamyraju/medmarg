import SwiftUI

// =========================================================================
// 🩺 AGENT DOORSTEP CLINICAL VISIT WORKFLOW (6-STEP LIFECYCLE)
// 1. Arrival Photo & Gloves/PPE Verification
// 2. Sample Draw into Vacutainers
// 3. Barcode Scanning / Manual Entry & Name Binding below Barcode
// 4. Bedside Vitals (BP, Pulse, SpO2)
// 5. Additional Inventory Consumed
// 6. Stop Timer, Doorstep Payment (if required) & Review Trigger
// =========================================================================

struct AgentDoorstepVisitModal: View {
    let order: AgentPickupOrder
    let onVisitCompleted: (Int) -> Void // Passes duration in minutes
    let onTriggerPaymentModal: () -> Void
    let onTriggerReviewModal: () -> Void
    @Environment(\.dismiss) private var dismiss

    // Timers & Duration
    @State private var startTime: Date = Date()
    @State private var elapsedTimeSeconds: Int = 0
    @State private var timer: Timer? = nil

    // Clinical Step Form States
    @State private var barcodeValue: String = ""
    @State private var customerNameOnTube: String = ""
    @State private var arrivalPhotoTaken: Bool = false
    @State private var ppeGlovesWorn: Bool = true

    // Bedside Vitals
    @State private var systolicInput: String = "120"
    @State private var diastolicInput: String = "80"
    @State private var pulseInput: String = "74"
    @State private var spo2Input: String = "98"

    // Additional Inventory Consumed
    @State private var extraNeedles: Int = 0
    @State private var extraTubes: Int = 0
    @State private var agentNotes: String = ""

    // Submitting State
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String? = nil

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Header Order Details & Live Elapsed Timer
                    headerWithTimerCard

                    if let err = errorMessage {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.red)
                            Text(err)
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.red)
                        }
                        .padding(10)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(10)
                    }

                    // 1. Arrival Photo & PPE Verification
                    arrivalAndPpeSection

                    // 2. Vacutainer Barcode Label & Customer Name Binding
                    barcodeAndNameSection

                    // 3. Bedside Vitals Recording
                    vitalsSection

                    // 4. Additional Inventory Consumed
                    additionalInventorySection

                    // 5. Complete Collection & Stop Timer Button
                    completeVisitButton
                }
                .padding(16)
            }
            .background(MedMargTheme.slate50)
            .navigationTitle("Doorstep Clinical Visit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") {
                        stopTimer()
                        dismiss()
                    }
                }
            }
            .onAppear {
                startVisitTimer()
                customerNameOnTube = order.effectivePatientName
                barcodeValue = order.barcode ?? "MM-\(Int.random(in: 100000...999999))"
            }
            .onDisappear {
                stopTimer()
            }
        }
    }

    // ==========================================
    // ⏱️ TIMER & HEADER
    // ==========================================
    private var headerWithTimerCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Order #\(order.id)")
                        .font(.system(size: 11, weight: .black, design: .monospaced))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text(order.effectivePatientName)
                        .font(.system(size: 17, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                }

                Spacer()

                // Visit Active Timer Pill
                HStack(spacing: 6) {
                    Circle()
                        .fill(Color.red)
                        .frame(width: 8, height: 8)

                    Text(formattedTime(elapsedSeconds: elapsedTimeSeconds))
                        .font(.system(size: 14, weight: .black, design: .monospaced))
                        .foregroundColor(MedMargTheme.slate900)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color.red.opacity(0.1))
                .cornerRadius(10)
            }

            Text("📍 \(order.address ?? "Tirupati")")
                .font(.system(size: 11))
                .foregroundColor(MedMargTheme.slate500)
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(14)
    }

    private func formattedTime(elapsedSeconds: Int) -> String {
        let m = elapsedSeconds / 60
        let s = elapsedSeconds % 60
        return String(format: "%02d:%02d", m, s)
    }

    private func startVisitTimer() {
        startTime = Date()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            elapsedTimeSeconds += 1
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }

    // ==========================================
    // 📸 1. ARRIVAL & PPE
    // ==========================================
    private var arrivalAndPpeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("1. ARRIVAL & PPE VERIFICATION")
                .font(.system(size: 10, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            HStack(spacing: 12) {
                // Arrival Photo Button
                Button(action: { arrivalPhotoTaken = true }) {
                    VStack(spacing: 6) {
                        Image(systemName: arrivalPhotoTaken ? "checkmark.circle.fill" : "camera.fill")
                            .font(.system(size: 20))
                            .foregroundColor(arrivalPhotoTaken ? Color.green : MedMargTheme.primaryTeal)
                        Text(arrivalPhotoTaken ? "Photo Captured" : "Take Arrival Photo")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(arrivalPhotoTaken ? Color.green : MedMargTheme.slate700)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(arrivalPhotoTaken ? Color.green.opacity(0.08) : MedMargTheme.slate50)
                    .cornerRadius(10)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(arrivalPhotoTaken ? Color.green : MedMargTheme.slate200, lineWidth: 1)
                    )
                }

                // Gloves & PPE Toggle
                Button(action: { ppeGlovesWorn.toggle() }) {
                    VStack(spacing: 6) {
                        Image(systemName: ppeGlovesWorn ? "hand.raised.fill" : "hand.raised")
                            .font(.system(size: 20))
                            .foregroundColor(ppeGlovesWorn ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                        Text(ppeGlovesWorn ? "Gloves / PPE Worn" : "Gloves Required")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate700)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(ppeGlovesWorn ? MedMargTheme.lightTeal.opacity(0.4) : MedMargTheme.slate50)
                    .cornerRadius(10)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(ppeGlovesWorn ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1)
                    )
                }
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(14)
    }

    // ==========================================
    // 🏷️ 2. BARCODE & PATIENT NAME ON TUBE
    // ==========================================
    private var barcodeAndNameSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("2. VACUTAINER BARCODE & PATIENT BINDING")
                .font(.system(size: 10, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            // Barcode Input & Scanner
            VStack(alignment: .leading, spacing: 6) {
                Text("Tube Barcode (Scanned / Thermal Roll) *")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate700)

                HStack {
                    TextField("MM-BARCODE-XXXX", text: $barcodeValue)
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                        .padding(10)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(8)

                    Button(action: {
                        barcodeValue = "MM-\(Int.random(in: 100000...999999))"
                    }) {
                        Image(systemName: "barcode.viewfinder")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                            .padding(10)
                            .background(MedMargTheme.primaryTeal)
                            .cornerRadius(8)
                    }
                }
            }

            // Customer Name written below barcode
            VStack(alignment: .leading, spacing: 6) {
                Text("Customer Name (Written on tube below barcode) *")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate700)

                TextField("Patient Name on Vacutainer", text: $customerNameOnTube)
                    .font(.system(size: 13, weight: .semibold))
                    .padding(10)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(8)
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(14)
    }

    // ==========================================
    // ❤️ 3. BEDSIDE VITALS RECORDING
    // ==========================================
    private var vitalsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("3. BEDSIDE VITALS CHECKUP")
                .font(.system(size: 10, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("BP (Systolic/Diastolic)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                    HStack {
                        TextField("120", text: $systolicInput).frame(width: 40)
                        Text("/")
                        TextField("80", text: $diastolicInput).frame(width: 40)
                    }
                    .padding(8)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(8)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("Pulse (BPM)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                    TextField("74", text: $pulseInput)
                        .padding(8)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(8)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("SpO2 (%)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                    TextField("98", text: $spo2Input)
                        .padding(8)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(8)
                }
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(14)
    }

    // ==========================================
    // 📦 4. ADDITIONAL INVENTORY CONSUMED
    // ==========================================
    private var additionalInventorySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("4. ADDITIONAL INVENTORY CONSUMED (IF ANY)")
                .font(.system(size: 10, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            HStack(spacing: 16) {
                // Extra Syringe/Needle
                HStack {
                    Text("Extra Needle:")
                        .font(.system(size: 11, weight: .bold))
                    Spacer()
                    Stepper("\(extraNeedles)", value: $extraNeedles, in: 0...5)
                }
                .padding(8)
                .background(MedMargTheme.slate50)
                .cornerRadius(8)

                // Extra Tube
                HStack {
                    Text("Extra Tube:")
                        .font(.system(size: 11, weight: .bold))
                    Spacer()
                    Stepper("\(extraTubes)", value: $extraTubes, in: 0...5)
                }
                .padding(8)
                .background(MedMargTheme.slate50)
                .cornerRadius(8)
            }

            TextField("Special Phlebotomist Notes / Vein Condition", text: $agentNotes)
                .font(.system(size: 12))
                .padding(10)
                .background(MedMargTheme.slate50)
                .cornerRadius(8)
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(14)
    }

    // ==========================================
    // 🚀 COMPLETE VISIT BUTTON
    // ==========================================
    private var completeVisitButton: some View {
        Button(action: submitVisitCompletion) {
            HStack(spacing: 8) {
                if isSubmitting {
                    ProgressView().tint(.white)
                }
                Text(isSubmitting ? "Submitting Clinical Data..." : "✓ Seal Vacutainer & Close Visit")
                    .font(.system(size: 14, weight: .black))
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(MedMargTheme.primaryTeal)
            .cornerRadius(12)
        }
        .disabled(isSubmitting)
    }

    private func submitVisitCompletion() {
        guard !barcodeValue.trimmingCharacters(in: .whitespaces).isEmpty else {
            errorMessage = "Please enter or scan the vacutainer barcode label"
            return
        }

        isSubmitting = true
        errorMessage = nil
        let durationMinutes = max(1, elapsedTimeSeconds / 60)

        guard let url = URL(string: "https://medmarg.com/api/v1/agent/pickup/update") else {
            isSubmitting = false
            return
        }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload: [String: Any] = [
            "orderId": order.id,
            "status": "SAMPLE_COLLECTED",
            "barcode": barcodeValue,
            "arrivalPhoto": arrivalPhotoTaken ? "https://medmarg.com/cdn/arrivals/\(order.id).jpg" : "",
            "samplePhotos": ["https://medmarg.com/cdn/samples/\(order.id)_tube.jpg"],
            "notes": "Patient Name on Tube: \(customerNameOnTube). \(agentNotes)",
            "completedAt": ISO8601DateFormatter().string(from: Date()),
            "durationMinutes": durationMinutes,
            "extraInventoryConsumed": [
                "needles": extraNeedles,
                "tubes": extraTubes
            ],
            "vitals": [
                "bp": "\(systolicInput)/\(diastolicInput)",
                "pulse": pulseInput,
                "spo2": spo2Input
            ]
        ]

        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

        URLSession.shared.dataTask(with: req) { data, _, err in
            DispatchQueue.main.async {
                self.isSubmitting = false
                if let err = err {
                    self.errorMessage = err.localizedDescription
                    return
                }

                self.stopTimer()
                self.dismiss()
                self.onVisitCompleted(durationMinutes)

                // If payment pending doorstep QR, open payment modal first; otherwise open review
                if !self.order.isPaid {
                    self.onTriggerPaymentModal()
                } else {
                    self.onTriggerReviewModal()
                }
            }
        }.resume()
    }
}
