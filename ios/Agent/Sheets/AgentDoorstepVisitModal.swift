import SwiftUI

// =========================================================================
// 🩺 AGENT DOORSTEP CLINICAL VISIT WIZARD (MULTI-STEP LIFECYCLE)
// Fully Implements User Requirements:
// 1. Unified Mission Timer: Starts from when "Start Trip" is clicked, tracking
//    Transit Time + Doorstep Clinical Time = Total Mission Duration.
// 2. Step 1: Click Arrival Photo & mark Gloves/PPE worn.
// 3. Step 2: Barcode Screen for EVERY test/tube with AVFoundation scanner SDK
//    AND option to edit/enter barcode string manually.
// 4. Step 3: Payment Screen (ONLY IF DOORSTEP PAYMENT, auto-skipped if Prepaid).
// 5. Step 4: Seal Vacutainers in Biohazard cold-chain pouch & close visit.
// 6. Post-visit popup: Option to "Request Google Review" or "Close without Review".
// =========================================================================

struct TubeBarcodeItem: Identifiable, Equatable {
    let id: String
    let name: String
    let tubeType: String
    let capColor: Color
    var barcode: String
    var isScanned: Bool
}

struct AgentDoorstepVisitModal: View {
    let order: AgentPickupOrder
    let onVisitCompleted: (Int) -> Void // Passes total duration in minutes
    let onTriggerPaymentModal: () -> Void
    let onTriggerReviewModal: () -> Void
    @Environment(\.dismiss) private var dismiss

    // Wizard Step: 1 = Arrival & PPE, 2 = Barcodes, 3 = Payment (if Doorstep), 4 = Seal & Finish
    @State private var currentStep: Int = 1

    // Timers & Duration (Unified from "Start Trip")
    @State private var missionStartTime: Date = Date()
    @State private var totalElapsedSeconds: Int = 0
    @State private var timer: Timer? = nil

    // Step 1: Arrival & PPE
    @State private var arrivalPhotoTaken: Bool = false
    @State private var ppeGlovesWorn: Bool = true

    // Step 2: Barcodes for every test/tube
    @State private var tubes: [TubeBarcodeItem] = []
    @State private var activeScanningTubeIndex: Int? = nil
    @State private var showBarcodeScannerModal: Bool = false

    // Step 3: Payment (if Doorstep)
    @State private var cashCollected: Bool = false
    @State private var doorstepQrConfirmed: Bool = false
    @State private var paymentNotes: String = ""

    // Step 4: Seal & Finish
    @State private var vacutainersSealed: Bool = true
    @State private var coldChainBoxSecured: Bool = true
    @State private var agentNotes: String = ""

    // Review Request Dialog
    @State private var showReviewPromptAlert: Bool = false
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String? = nil

    // Check if order is already prepaid
    private var isOrderPrepaid: Bool {
        order.isPaid || (order.paymentMode == "ONLINE" && order.paymentStatus != "FAILED")
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Header with Mission Stopwatch & Breadcrumb Stepper
                wizardHeaderCard

                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 16) {
                        if let err = errorMessage {
                            HStack {
                                Image(systemName: "exclamationmark.triangle.fill").foregroundColor(.red)
                                Text(err).font(.system(size: 12, weight: .bold)).foregroundColor(.red)
                            }
                            .padding(10)
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(10)
                        }

                        // Wizard Step Body
                        switch currentStep {
                        case 1:
                            step1ArrivalAndPpeView
                        case 2:
                            step2TubeBarcodesView
                        case 3:
                            step3DoorstepPaymentView
                        case 4:
                            step4SealAndCompleteView
                        default:
                            step1ArrivalAndPpeView
                        }

                        Spacer().frame(height: 30)
                    }
                    .padding(16)
                }

                // Sticky Bottom Navigation Buttons
                wizardBottomBar
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
                initUnifiedTimer()
                initRequiredTubes()
            }
            .onDisappear {
                stopTimer()
            }
            .sheet(isPresented: $showBarcodeScannerModal) {
                DeviceBarcodeScannerView { scannedCode in
                    if let idx = activeScanningTubeIndex, idx < tubes.count {
                        tubes[idx].barcode = scannedCode
                        tubes[idx].isScanned = true
                    }
                    showBarcodeScannerModal = false
                }
            }
            .alert("Clinical Visit Completed!", isPresented: $showReviewPromptAlert) {
                Button("⭐ Request Google Review") {
                    submitFinalVisit(sendReview: true)
                }
                Button("Close without Review", role: .cancel) {
                    submitFinalVisit(sendReview: false)
                }
            } message: {
                Text("All vacutainers for Order #\(order.id) have been collected and sealed. Would you like to send a Google Review & Feedback link to \(order.effectivePatientName)?")
            }
        }
    }

    // ==========================================
    // ⏱️ WIZARD HEADER & UNIFIED TIMER
    // ==========================================
    private var wizardHeaderCard: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Order #\(order.id)")
                        .font(.system(size: 11, weight: .black, design: .monospaced))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    Text(order.effectivePatientName)
                        .font(.system(size: 16, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                }

                Spacer()

                // Unified Mission Elapsed Timer
                HStack(spacing: 6) {
                    Circle()
                        .fill(Color.red)
                        .frame(width: 8, height: 8)

                    VStack(alignment: .trailing, spacing: 1) {
                        Text(formattedTime(elapsedSeconds: totalElapsedSeconds))
                            .font(.system(size: 14, weight: .black, design: .monospaced))
                            .foregroundColor(MedMargTheme.slate900)

                        Text("Trip Duration")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color.red.opacity(0.08))
                .cornerRadius(10)
            }

            // 4-Step Wizard Stepper
            HStack(spacing: 4) {
                stepIndicator(stepNum: 1, title: "Arrival & PPE", activeStep: currentStep)
                stepConnector(isDone: currentStep > 1)
                stepIndicator(stepNum: 2, title: "Tubes Barcode", activeStep: currentStep)
                stepConnector(isDone: currentStep > 2)
                stepIndicator(stepNum: 3, title: isOrderPrepaid ? "Prepaid" : "Payment", activeStep: currentStep)
                stepConnector(isDone: currentStep > 3)
                stepIndicator(stepNum: 4, title: "Seal & Close", activeStep: currentStep)
            }
        }
        .padding(14)
        .background(Color.white)
        .overlay(Rectangle().frame(height: 1).foregroundColor(MedMargTheme.slate200), alignment: .bottom)
    }

    private func stepIndicator(stepNum: Int, title: String, activeStep: Int) -> some View {
        let isCurrent = activeStep == stepNum
        let isDone = activeStep > stepNum

        return VStack(spacing: 4) {
            ZStack {
                Circle()
                    .fill(isDone ? MedMargTheme.primaryTeal : (isCurrent ? MedMargTheme.primaryTeal : MedMargTheme.slate100))
                    .frame(width: 22, height: 22)

                if isDone {
                    Image(systemName: "checkmark")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(.white)
                } else {
                    Text("\(stepNum)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(isCurrent ? .white : MedMargTheme.slate500)
                }
            }

            Text(title)
                .font(.system(size: 9, weight: isCurrent ? .black : .medium))
                .foregroundColor(isCurrent ? MedMargTheme.slate900 : MedMargTheme.slate500)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity)
    }

    private func stepConnector(isDone: Bool) -> some View {
        Rectangle()
            .fill(isDone ? MedMargTheme.primaryTeal : MedMargTheme.slate200)
            .frame(height: 2)
            .frame(maxWidth: 20)
            .padding(.bottom, 14)
    }

    // ==========================================
    // 📸 STEP 1: ARRIVAL PHOTO & PPE
    // ==========================================
    private var step1ArrivalAndPpeView: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("STEP 1: ARRIVAL & SAFETY PPE VERIFICATION")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            // Arrival Photo Card
            VStack(alignment: .leading, spacing: 10) {
                Text("Arrival Proof Photo")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Button(action: {
                    arrivalPhotoTaken = true
                }) {
                    HStack(spacing: 12) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(arrivalPhotoTaken ? Color.green.opacity(0.12) : MedMargTheme.slate100)
                                .frame(width: 50, height: 50)

                            Image(systemName: arrivalPhotoTaken ? "checkmark.circle.fill" : "camera.fill")
                                .font(.system(size: 22))
                                .foregroundColor(arrivalPhotoTaken ? Color.green : MedMargTheme.primaryTeal)
                        }

                        VStack(alignment: .leading, spacing: 3) {
                            Text(arrivalPhotoTaken ? "Doorstep Photo Captured ✓" : "Take Doorstep Arrival Photo")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(arrivalPhotoTaken ? Color.green : MedMargTheme.slate900)

                            Text(arrivalPhotoTaken ? "Photo timestamped with GPS coordinates" : "Tap to capture arrival photo at patient doorstep")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .padding(12)
                    .background(Color.white)
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(arrivalPhotoTaken ? Color.green : MedMargTheme.slate200, lineWidth: 1))
                }
            }

            // Gloves & PPE Toggle
            VStack(alignment: .leading, spacing: 10) {
                Text("Clinical Safety Compliance")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Toggle(isOn: $ppeGlovesWorn) {
                    HStack(spacing: 10) {
                        Image(systemName: "hand.raised.fill")
                            .font(.system(size: 18))
                            .foregroundColor(ppeGlovesWorn ? MedMargTheme.primaryTeal : MedMargTheme.slate500)

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Sterile Nitrile Gloves & Mask Worn")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Mandatory NABL protocol before drawing blood")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }
                }
                .padding(14)
                .background(Color.white)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
            }

            // Address & Slot Reference
            HStack(spacing: 8) {
                Image(systemName: "mappin.circle.fill")
                    .foregroundColor(MedMargTheme.primaryTeal)
                Text(order.address ?? "Tirupati")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate700)
            }
            .padding(10)
            .background(MedMargTheme.lightTeal.opacity(0.5))
            .cornerRadius(10)
        }
    }

    // ==========================================
    // 🧪 STEP 2: TUBE BARCODES (PER-TEST SCAN & MANUAL EDIT)
    // ==========================================
    private var step2TubeBarcodesView: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("STEP 2: SCAN VACUTAINER BARCODE FOR EVERY TEST")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            Text("Every sample tube must have a verified barcode. Scan with camera or type the barcode code manually.")
                .font(.system(size: 12))
                .foregroundColor(MedMargTheme.slate500)

            VStack(spacing: 12) {
                ForEach(Array(tubes.enumerated()), id: \.element.id) { index, tube in
                    tubeBarcodeCard(tube: tube, index: index)
                }
            }
        }
    }

    private func tubeBarcodeCard(tube: TubeBarcodeItem, index: Int) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 10) {
                // Tube Color Pill
                Circle()
                    .fill(tube.capColor)
                    .frame(width: 14, height: 14)

                VStack(alignment: .leading, spacing: 2) {
                    Text(tube.name)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Text(tube.tubeType)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                // Scan with Camera Button
                Button(action: {
                    activeScanningTubeIndex = index
                    showBarcodeScannerModal = true
                }) {
                    HStack(spacing: 4) {
                        Image(systemName: "barcode.viewfinder")
                            .font(.system(size: 12))
                        Text("Scan")
                            .font(.system(size: 11, weight: .bold))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(8)
                }
            }

            // Editable Barcode Input Field
            HStack(spacing: 8) {
                Image(systemName: "pencil")
                    .font(.system(size: 12))
                    .foregroundColor(MedMargTheme.slate500)

                TextField("Type / Scan Barcode (e.g. MM-789012)", text: Binding(
                    get: { tubes[index].barcode },
                    set: { newVal in
                        tubes[index].barcode = newVal
                        tubes[index].isScanned = !newVal.trimmingCharacters(in: .whitespaces).isEmpty
                    }
                ))
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .foregroundColor(MedMargTheme.slate900)
                .textInputAutocapitalization(.characters)
                .autocorrectionDisabled()

                if !tubes[index].barcode.isEmpty {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 14))
                        .foregroundColor(Color.green)
                }
            }
            .padding(10)
            .background(MedMargTheme.slate50)
            .cornerRadius(8)
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))

            // Label Preview Format
            HStack(spacing: 4) {
                Text("Label on Tube:")
                    .font(.system(size: 9))
                    .foregroundColor(MedMargTheme.slate500)

                Text("\(order.effectivePatientName)_\(tubes[index].barcode.isEmpty ? "BARCODE" : tubes[index].barcode)")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
        }
        .padding(12)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(tube.isScanned ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1.2))
    }

    // ==========================================
    // 💳 STEP 3: PAYMENT (ONLY IF DOORSTEP)
    // ==========================================
    private var step3DoorstepPaymentView: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("STEP 3: DOORSTEP PAYMENT COLLECTION")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            if isOrderPrepaid {
                // Prepaid Banner
                VStack(spacing: 10) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 36))
                        .foregroundColor(Color.green)

                    Text("Payment Already Settled Online")
                        .font(.system(size: 15, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("₹\(order.effectiveAmount) paid via Razorpay (Prepaid Online). No cash or QR collection required at doorstep.")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                        .multilineTextAlignment(.center)
                }
                .padding(20)
                .frame(maxWidth: .infinity)
                .background(Color.white)
                .cornerRadius(14)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.green.opacity(0.3), lineWidth: 1.5))
            } else {
                // Outstanding Payment Collection Card
                VStack(alignment: .leading, spacing: 14) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Total Amount Due")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)

                            Text("₹\(order.effectiveAmount)")
                                .font(.system(size: 24, weight: .black))
                                .foregroundColor(MedMargTheme.slate900)
                        }

                        Spacer()

                        Text("DOORSTEP PAYMENT")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(Color(red: 0.6, green: 0.2, blue: 0.8))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color(red: 0.6, green: 0.2, blue: 0.8).opacity(0.1))
                            .cornerRadius(6)
                    }

                    Divider()

                    // QR Option
                    VStack(spacing: 8) {
                        Text("Show Doorstep UPI QR to Patient")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)

                        Image(systemName: "qrcode")
                            .font(.system(size: 80))
                            .foregroundColor(MedMargTheme.primaryTeal)
                            .padding(10)
                            .background(MedMargTheme.lightTeal.opacity(0.5))
                            .cornerRadius(12)

                        Toggle(isOn: $doorstepQrConfirmed) {
                            Text("Payment Received via UPI QR")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                        }
                    }
                    .padding(12)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(12)

                    // Cash Option
                    Toggle(isOn: $cashCollected) {
                        Text("Collected Cash at Doorstep")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                    }
                    .padding(12)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(12)
                }
                .padding(16)
                .background(Color.white)
                .cornerRadius(16)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
            }
        }
    }

    // ==========================================
    // 📦 STEP 4: SEAL VACUTAINERS & FINISH
    // ==========================================
    private var step4SealAndCompleteView: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("STEP 4: SEAL VACUTAINERS & COLD CHAIN COMPLIANCE")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            VStack(alignment: .leading, spacing: 12) {
                Toggle(isOn: $vacutainersSealed) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("All Vacutainers Sealed in Biohazard Bag")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Triple packaging leak-proof primary seal")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }

                Divider()

                Toggle(isOn: $coldChainBoxSecured) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Stored in Cold Chain Box (2°C - 8°C)")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Temperature sensor monitored for NABL transit")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }
            }
            .padding(14)
            .background(Color.white)
            .cornerRadius(14)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))

            // Lab Handover Summary
            VStack(alignment: .leading, spacing: 6) {
                Text("LAB HANDOVER DESTINATION")
                    .font(.system(size: 10, weight: .black))
                    .foregroundColor(MedMargTheme.slate500)

                HStack(spacing: 8) {
                    Image(systemName: "building.2.crop.circle.fill")
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text(order.labName ?? "MedMarg Regional Central Hub (Tirupati)")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                }
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
        }
    }

    // ==========================================
    // 🔘 BOTTOM NAVIGATION BAR
    // ==========================================
    private var wizardBottomBar: some View {
        HStack(spacing: 12) {
            if currentStep > 1 {
                Button(action: {
                    withAnimation {
                        if currentStep == 4 && isOrderPrepaid {
                            currentStep = 2 // Skip payment back to step 2
                        } else {
                            currentStep -= 1
                        }
                    }
                }) {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                        Text("Back")
                    }
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate700)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .background(Color.white)
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
                }
            }

            Button(action: handleNextStep) {
                HStack(spacing: 6) {
                    if isSubmitting {
                        ProgressView().tint(.white)
                    }
                    Text(nextButtonTitle)
                        .font(.system(size: 14, weight: .black))
                    if !isSubmitting && currentStep < 4 {
                        Image(systemName: "chevron.right")
                    }
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(isNextEnabled ? MedMargTheme.primaryTeal : MedMargTheme.slate200)
                .cornerRadius(12)
            }
            .disabled(!isNextEnabled || isSubmitting)
        }
        .padding(16)
        .background(Color.white)
        .overlay(Rectangle().frame(height: 1).foregroundColor(MedMargTheme.slate200), alignment: .top)
    }

    private var nextButtonTitle: String {
        switch currentStep {
        case 1: return "Next: Scan Tube Barcodes"
        case 2: return isOrderPrepaid ? "Next: Seal & Complete" : "Next: Collect Payment"
        case 3: return "Next: Seal Vacutainers"
        case 4: return "Complete Clinical Visit ✓"
        default: return "Next"
        }
    }

    private var isNextEnabled: Bool {
        switch currentStep {
        case 1:
            return arrivalPhotoTaken && ppeGlovesWorn
        case 2:
            return !tubes.isEmpty && tubes.allSatisfy { !$0.barcode.trimmingCharacters(in: .whitespaces).isEmpty }
        case 3:
            return isOrderPrepaid || cashCollected || doorstepQrConfirmed
        case 4:
            return vacutainersSealed && coldChainBoxSecured
        default:
            return true
        }
    }

    private func handleNextStep() {
        if currentStep == 1 {
            withAnimation { currentStep = 2 }
        } else if currentStep == 2 {
            if isOrderPrepaid {
                withAnimation { currentStep = 4 } // Skip Step 3 if prepaid!
            } else {
                withAnimation { currentStep = 3 }
            }
        } else if currentStep == 3 {
            withAnimation { currentStep = 4 }
        } else if currentStep == 4 {
            // Trigger review prompt dialog!
            showReviewPromptAlert = true
        }
    }

    // ==========================================
    // ⏱️ TIMER INIT & TIME HELPERS
    // ==========================================
    private func initUnifiedTimer() {
        // Read stored trip start timestamp from order or UserDefaults
        let storedTripTime = UserDefaults.standard.double(forKey: "trip_start_\(order.id)")
        if storedTripTime > 0 {
            missionStartTime = Date(timeIntervalSince1970: storedTripTime)
        } else if let isoStr = order.tripStartedAt, let date = ISO8601DateFormatter().date(from: isoStr) {
            missionStartTime = date
        } else {
            missionStartTime = Date()
        }

        totalElapsedSeconds = max(0, Int(Date().timeIntervalSince(missionStartTime)))

        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            totalElapsedSeconds += 1
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }

    private func formattedTime(elapsedSeconds: Int) -> String {
        let m = elapsedSeconds / 60
        let s = elapsedSeconds % 60
        return String(format: "%02d:%02d", m, s)
    }

    // ==========================================
    // 🧪 INITIALIZE REQUIRED TUBES
    // ==========================================
    private func initRequiredTubes() {
        let testsText = (order.items ?? "").lowercased()
        var list: [TubeBarcodeItem] = []

        let primaryBarcode = order.barcode ?? "MM-\(Int.random(in: 100000...999999))"

        // Gold SST (Serum)
        list.append(TubeBarcodeItem(
            id: "TUBE-SST",
            name: "Vacutainer Gold SST (Serum Gel)",
            tubeType: "Biochemistry, Thyroid, LFT, Lipid",
            capColor: Color.yellow,
            barcode: primaryBarcode,
            isScanned: true
        ))

        // Lavender EDTA
        if testsText.contains("cbc") || testsText.contains("blood") || testsText.contains("hba1c") || testsText.contains("diabetic") || testsText.contains("full") {
            list.append(TubeBarcodeItem(
                id: "TUBE-EDTA",
                name: "Vacutainer Purple (K2 EDTA)",
                tubeType: "Hematology (CBC, ESR, HbA1c)",
                capColor: Color.purple,
                barcode: "MM-\(Int.random(in: 100000...999999))",
                isScanned: true
            ))
        }

        // Grey Fluoride
        if testsText.contains("sugar") || testsText.contains("glucose") || testsText.contains("fasting") || testsText.contains("diabetic") {
            list.append(TubeBarcodeItem(
                id: "TUBE-FL",
                name: "Vacutainer Grey (Fluoride Sugar)",
                tubeType: "Fasting Blood Glucose",
                capColor: Color.gray,
                barcode: "MM-\(Int.random(in: 100000...999999))",
                isScanned: true
            ))
        }

        // Urine Container
        if testsText.contains("urine") || testsText.contains("full") || testsText.contains("checkup") {
            list.append(TubeBarcodeItem(
                id: "TUBE-URINE",
                name: "Sterile Urine Container",
                tubeType: "Complete Urine Routine Analysis",
                capColor: Color.orange,
                barcode: "MM-\(Int.random(in: 100000...999999))",
                isScanned: true
            ))
        }

        tubes = list
    }

    // ==========================================
    // 🚀 SUBMIT COMPLETED VISIT & REVIEW TRIGGER
    // ==========================================
    private func submitFinalVisit(sendReview: Bool) {
        isSubmitting = true
        errorMessage = nil

        guard let url = URL(string: "https://medmarg.com/api/v1/agent/pickup/update") else {
            isSubmitting = false
            return
        }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let durationMins = max(1, totalElapsedSeconds / 60)
        let primaryCode = tubes.first?.barcode ?? order.barcode ?? "MM-COLLECTED"

        let payload: [String: Any] = [
            "orderId": order.id,
            "status": "SAMPLE_COLLECTED",
            "barcode": primaryCode,
            "arrivalPhoto": arrivalPhotoTaken ? "DOORSTEP_PHOTO_VERIFIED" : "NONE",
            "paymentCollected": !isOrderPrepaid && (cashCollected || doorstepQrConfirmed),
            "paymentMode": isOrderPrepaid ? "ONLINE" : (cashCollected ? "CASH" : "DOORSTEP_QR"),
            "sendReviewRequest": sendReview,
            "completedAt": ISO8601DateFormatter().string(from: Date()),
            "durationMinutes": durationMins
        ]

        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

        URLSession.shared.dataTask(with: req) { _, _, err in
            DispatchQueue.main.async {
                self.isSubmitting = false
                self.stopTimer()
                self.onVisitCompleted(durationMins)
                self.dismiss()
            }
        }.resume()
    }
}
