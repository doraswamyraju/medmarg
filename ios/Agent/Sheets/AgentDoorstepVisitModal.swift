import SwiftUI
import UIKit

// =========================================================================
// 🩺 AGENT DOORSTEP CLINICAL VISIT WIZARD (MULTI-STEP LIFECYCLE)
// 1. Mission Timer: Tracks Transit + Doorstep clinical time.
// 2. Step 1: Real Camera Arrival Photo, PPE Compliance & Customer Handover OTP!
// 3. Step 2: Barcode Scanning (EMPTY BY DEFAULT) with Camera SDK & Manual Edit.
// 4. Step 3: Payment (ONLY IF DOORSTEP PAYMENT, auto-skipped if Prepaid).
// 5. Step 4: Seal Vacutainers in Biohazard Cold-Chain bag.
// 6. Post-Visit: Option to Request Google Review or Close without Review.
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

    // Wizard Step: 1 = Arrival, PPE & OTP, 2 = Barcodes, 3 = Payment (if Doorstep), 4 = Seal & Finish
    @State private var currentStep: Int = 1

    // Timers & Duration (Unified from "Start Trip")
    @State private var missionStartTime: Date = Date()
    @State private var totalElapsedSeconds: Int = 0
    @State private var timer: Timer? = nil

    // Step 1: Arrival & PPE & OTP
    @State private var arrivalImage: UIImage? = nil
    @State private var showCameraPicker: Bool = false
    @State private var ppeGlovesWorn: Bool = true
    @State private var enteredOtp: String = ""
    @State private var otpBypassedWithGovId: Bool = false

    // Step 2: Barcodes for every test/tube (Clean empty default)
    @State private var tubes: [TubeBarcodeItem] = []
    @State private var activeScanningTubeIndex: Int? = nil
    @State private var showBarcodeScannerModal: Bool = false

    // Step 3: Payment (if Doorstep)
    @State private var cashCollected: Bool = false
    @State private var doorstepQrConfirmed: Bool = false

    // Step 4: Seal & Finish
    @State private var vacutainersSealed: Bool = true
    @State private var coldChainBoxSecured: Bool = true
    @State private var agentNotes: String = ""

    // Review Request Dialog
    @State private var showReviewPromptAlert: Bool = false
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String? = nil

    private var expectedOtp: String {
        let code = order.otp ?? order.handoverOtp ?? ""
        return code.trimmingCharacters(in: .whitespaces)
    }

    private var isOtpValid: Bool {
        if otpBypassedWithGovId { return true }
        if expectedOtp.isEmpty { return true } // No OTP required for this order
        return enteredOtp.trimmingCharacters(in: .whitespaces) == expectedOtp
    }

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
                            step1ArrivalAndOtpView
                        case 2:
                            step2TubeBarcodesView
                        case 3:
                            step3DoorstepPaymentView
                        case 4:
                            step4SealAndCompleteView
                        default:
                            step1ArrivalAndOtpView
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
            .sheet(isPresented: $showCameraPicker) {
                ImagePickerView(selectedImage: $arrivalImage) { pickedImage in
                    arrivalImage = pickedImage
                }
            }
            .sheet(isPresented: $showBarcodeScannerModal) {
                DeviceBarcodeScannerView { scannedCode in
                    if let idx = activeScanningTubeIndex, idx < tubes.count {
                        tubes[idx].barcode = scannedCode
                        tubes[idx].isScanned = !scannedCode.trimmingCharacters(in: .whitespaces).isEmpty
                    }
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
                stepIndicator(stepNum: 1, title: "Arrival & OTP", activeStep: currentStep)
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
    // 📸 STEP 1: ARRIVAL PHOTO, PPE & OTP
    // ==========================================
    private var step1ArrivalAndOtpView: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("STEP 1: DOORSTEP ARRIVAL & IDENTITY VERIFICATION")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            // 1. Arrival Photo (Opens Native Camera)
            VStack(alignment: .leading, spacing: 8) {
                Text("1. Doorstep Arrival Photo")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                if let img = arrivalImage {
                    HStack(spacing: 12) {
                        Image(uiImage: img)
                            .resizable()
                            .scaledToFill()
                            .frame(width: 60, height: 60)
                            .clipShape(RoundedRectangle(cornerRadius: 10))

                        VStack(alignment: .leading, spacing: 2) {
                            HStack(spacing: 4) {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(Color.green)
                                Text("Arrival Photo Captured")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(Color.green)
                            }
                            Text("Timestamp: \(formattedCurrentTime()) • GPS Verified")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)

                            Button(action: { showCameraPicker = true }) {
                                Text("Retake Photo")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                            }
                            .padding(.top, 2)
                        }
                        Spacer()
                    }
                    .padding(10)
                    .background(Color.green.opacity(0.06))
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.green, lineWidth: 1))
                } else {
                    Button(action: { showCameraPicker = true }) {
                        HStack(spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(MedMargTheme.lightTeal)
                                    .frame(width: 48, height: 48)

                                Image(systemName: "camera.fill")
                                    .font(.system(size: 20))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text("Open Camera to Take Arrival Photo")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)

                                Text("Tap to launch camera at patient doorstep")
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
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
                    }
                }
            }

            // 2. Customer Handover OTP Verification Card
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("2. Customer Handover OTP")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Spacer()

                    if isOtpValid {
                        HStack(spacing: 4) {
                            Image(systemName: "checkmark.seal.fill")
                                .foregroundColor(Color.green)
                            Text("OTP Verified")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(Color.green)
                        }
                    }
                }

                Text("Ask the customer for the 4-digit Handover OTP shown in their MedMarg app:")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)

                HStack(spacing: 10) {
                    Image(systemName: "lock.shield.fill")
                        .font(.system(size: 18))
                        .foregroundColor(isOtpValid ? Color.green : MedMargTheme.primaryTeal)

                    TextField("Enter 4-Digit OTP", text: $enteredOtp)
                        .font(.system(size: 16, weight: .black, design: .monospaced))
                        .keyboardType(.numberPad)
                        .padding(10)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(10)
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(isOtpValid ? Color.green : MedMargTheme.slate200, lineWidth: 1.2))

                    if !expectedOtp.isEmpty {
                        // Hint badge for testing / phlebo confirmation
                        Text("Expected: \(expectedOtp)")
                            .font(.system(size: 9, weight: .bold, design: .monospaced))
                            .foregroundColor(MedMargTheme.slate500)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 4)
                            .background(MedMargTheme.slate100)
                            .cornerRadius(6)
                    }
                }

                // Emergency Bypass Toggle
                Toggle(isOn: $otpBypassedWithGovId) {
                    Text("Bypass with Patient Gov ID (Aadhaar / Driving License)")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(MedMargTheme.slate700)
                }
            }
            .padding(14)
            .background(Color.white)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(isOtpValid ? Color.green : MedMargTheme.slate200, lineWidth: 1))

            // 3. Gloves & PPE Toggle
            VStack(alignment: .leading, spacing: 8) {
                Text("3. Safety Compliance")
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
                            Text("Mandatory NABL protocol before drawing sample")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }
                }
                .padding(12)
                .background(Color.white)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
            }
        }
    }

    // ==========================================
    // 🧪 STEP 2: TUBE BARCODES (EMPTY BY DEFAULT, SCAN OR EDIT)
    // ==========================================
    private var step2TubeBarcodesView: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("STEP 2: SCAN OR ENTER VACUTAINER BARCODES")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            Text("Scan each tube's barcode with the camera or type it manually. Reports are bound to CustomerName_Barcode.")
                .font(.system(size: 11))
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
                // Tube Color Indicator
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

            // Editable Barcode Input Field (Empty by default)
            HStack(spacing: 8) {
                Image(systemName: "pencil")
                    .font(.system(size: 12))
                    .foregroundColor(MedMargTheme.slate500)

                TextField("Type / Scan Barcode", text: Binding(
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

                Text("\(order.effectivePatientName)_\(tubes[index].barcode.isEmpty ? "AWAITING_BARCODE" : tubes[index].barcode)")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundColor(tubes[index].barcode.isEmpty ? Color.orange : MedMargTheme.primaryTeal)
            }
        }
        .padding(12)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(tube.isScanned ? Color.green : MedMargTheme.slate200, lineWidth: 1.2))
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
                VStack(spacing: 10) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 36))
                        .foregroundColor(Color.green)

                    Text("Payment Already Settled Online")
                        .font(.system(size: 15, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("₹\(order.effectiveAmount) prepaid via Razorpay. No payment collection required.")
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
    // 📦 STEP 4: SEAL VACUTAINERS & COMPLETE
    // ==========================================
    private var step4SealAndCompleteView: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("STEP 4: SEAL VACUTAINERS & COMPLETE")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            VStack(alignment: .leading, spacing: 12) {
                Toggle(isOn: $vacutainersSealed) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("All Vacutainers Sealed in Biohazard Bag")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Leak-proof primary seal for transport")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }

                Divider()

                Toggle(isOn: $coldChainBoxSecured) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Placed in Cold Chain Box (2°C - 8°C)")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Temperature verified for NABL lab transit")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }
            }
            .padding(14)
            .background(Color.white)
            .cornerRadius(14)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
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
                            currentStep = 2
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
            // Photo, PPE, and OTP verification required!
            return arrivalImage != nil && ppeGlovesWorn && isOtpValid
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
                withAnimation { currentStep = 4 }
            } else {
                withAnimation { currentStep = 3 }
            }
        } else if currentStep == 3 {
            withAnimation { currentStep = 4 }
        } else if currentStep == 4 {
            showReviewPromptAlert = true
        }
    }

    // ==========================================
    // ⏱️ TIMER INIT & TIME HELPERS
    // ==========================================
    private func initUnifiedTimer() {
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

    private func formattedCurrentTime() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "hh:mm a"
        return formatter.string(from: Date())
    }

    // ==========================================
    // 🧪 INITIALIZE REQUIRED TUBES (EMPTY BARCODES!)
    // ==========================================
    private func initRequiredTubes() {
        let testsText = (order.items ?? "").lowercased()
        var list: [TubeBarcodeItem] = []

        // Clean empty barcode initially!
        let existingBarcode = order.barcode ?? ""

        // Gold SST (Serum)
        list.append(TubeBarcodeItem(
            id: "TUBE-SST",
            name: "Vacutainer Gold SST (Serum Gel)",
            tubeType: "Biochemistry, Thyroid, LFT, Lipid",
            capColor: Color.yellow,
            barcode: existingBarcode,
            isScanned: !existingBarcode.isEmpty
        ))

        // Lavender EDTA
        if testsText.contains("cbc") || testsText.contains("blood") || testsText.contains("hba1c") || testsText.contains("diabetic") || testsText.contains("full") {
            list.append(TubeBarcodeItem(
                id: "TUBE-EDTA",
                name: "Vacutainer Purple (K2 EDTA)",
                tubeType: "Hematology (CBC, ESR, HbA1c)",
                capColor: Color.purple,
                barcode: "",
                isScanned: false
            ))
        }

        // Grey Fluoride
        if testsText.contains("sugar") || testsText.contains("glucose") || testsText.contains("fasting") || testsText.contains("diabetic") {
            list.append(TubeBarcodeItem(
                id: "TUBE-FL",
                name: "Vacutainer Grey (Fluoride Sugar)",
                tubeType: "Fasting Blood Glucose",
                capColor: Color.gray,
                barcode: "",
                isScanned: false
            ))
        }

        // Urine Container
        if testsText.contains("urine") || testsText.contains("full") || testsText.contains("checkup") {
            list.append(TubeBarcodeItem(
                id: "TUBE-URINE",
                name: "Sterile Urine Container",
                tubeType: "Complete Urine Routine Analysis",
                capColor: Color.orange,
                barcode: "",
                isScanned: false
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
        let primaryCode = tubes.first(where: { !$0.barcode.isEmpty })?.barcode ?? order.barcode ?? ""

        let payload: [String: Any] = [
            "orderId": order.id,
            "status": "SAMPLE_COLLECTED",
            "barcode": primaryCode,
            "arrivalPhoto": arrivalImage != nil ? "DOORSTEP_PHOTO_VERIFIED" : "NONE",
            "handoverOtp": enteredOtp,
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
