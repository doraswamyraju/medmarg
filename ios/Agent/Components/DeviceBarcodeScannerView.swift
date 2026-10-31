import SwiftUI
import AVFoundation

// =========================================================================
// 📷 ROBUST DEVICE CAMERA BARCODE SCANNER
// Features:
// - Camera permission verification & asynchronous initialization
// - Simulator fallback with simulated scan so the app NEVER freezes
// - Live laser targeting reticle with haptic feedback
// - Manual barcode entry option
// - Top cancel/close button always visible
// =========================================================================

struct DeviceBarcodeScannerView: View {
    let onBarcodeScanned: (String) -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var hasPermission: Bool = false
    @State private var isCameraAvailable: Bool = true
    @State private var manualInput: String = ""
    @State private var isScanningActive: Bool = true

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                if isCameraAvailable {
                    NativeCameraScannerRepresentable(
                        isActive: $isScanningActive,
                        onFound: { code in
                            handleScanned(code: code)
                        }
                    )
                    .ignoresSafeArea()

                    // Visual Scanner Reticle Overlay
                    scannerReticleOverlay
                } else {
                    // Simulator or Camera Unavailable Fallback
                    cameraUnavailableFallbackView
                }

                // Bottom Manual Barcode Entry Card
                VStack {
                    Spacer()
                    bottomManualEntryCard
                }
            }
            .navigationTitle("Scan Tube Barcode")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
                }
            }
            .onAppear {
                checkCameraAvailability()
            }
        }
    }

    private func checkCameraAvailability() {
        #if targetEnvironment(simulator)
        isCameraAvailable = false
        #else
        if AVCaptureDevice.default(for: .video) == nil {
            isCameraAvailable = false
        } else {
            let status = AVCaptureDevice.authorizationStatus(for: .video)
            if status == .authorized {
                hasPermission = true
                isCameraAvailable = true
            } else if status == .notDetermined {
                AVCaptureDevice.requestAccess(for: .video) { granted in
                    DispatchQueue.main.async {
                        self.hasPermission = granted
                        self.isCameraAvailable = granted
                    }
                }
            } else {
                isCameraAvailable = false
            }
        }
        #endif
    }

    private func handleScanned(code: String) {
        let clean = code.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty else { return }
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
        onBarcodeScanned(clean)
        dismiss()
    }

    // ==========================================
    // 🎯 SCANNER RETICLE OVERLAY
    // ==========================================
    private var scannerReticleOverlay: some View {
        VStack(spacing: 20) {
            Spacer()

            ZStack {
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color(red: 0.05, green: 0.72, blue: 0.45), lineWidth: 3)
                    .frame(width: 280, height: 160)
                    .background(Color.black.opacity(0.15))

                // Corner brackets visual
                VStack {
                    HStack {
                        Image(systemName: "viewfinder")
                            .font(.system(size: 28))
                            .foregroundColor(Color(red: 0.05, green: 0.72, blue: 0.45))
                        Spacer()
                    }
                    Spacer()
                }
                .frame(width: 280, height: 160)
                .padding(10)
            }

            Text("Align vacutainer tube barcode inside frame")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.black.opacity(0.75))
                .cornerRadius(10)

            Spacer()
            Spacer()
        }
    }

    // ==========================================
    // ⌨️ BOTTOM MANUAL ENTRY CARD
    // ==========================================
    private var bottomManualEntryCard: some View {
        VStack(spacing: 10) {
            Text("OR ENTER BARCODE MANUALLY")
                .font(.system(size: 10, weight: .black))
                .foregroundColor(MedMargTheme.slate500)

            HStack(spacing: 8) {
                Image(systemName: "pencil")
                    .foregroundColor(MedMargTheme.slate500)

                TextField("Type Barcode (e.g. MM-482910)", text: $manualInput)
                    .font(.system(size: 13, weight: .bold, design: .monospaced))
                    .foregroundColor(MedMargTheme.slate900)
                    .textInputAutocapitalization(.characters)
                    .autocorrectionDisabled()

                if !manualInput.trimmingCharacters(in: .whitespaces).isEmpty {
                    Button(action: {
                        handleScanned(code: manualInput)
                    }) {
                        Text("Apply")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(MedMargTheme.primaryTeal)
                            .cornerRadius(8)
                    }
                }
            }
            .padding(10)
            .background(Color.white)
            .cornerRadius(12)
        }
        .padding(14)
        .background(Color(red: 0.1, green: 0.1, blue: 0.1).opacity(0.95))
        .cornerRadius(18)
        .padding(.horizontal, 16)
        .padding(.bottom, 20)
    }

    // ==========================================
    // 💻 SIMULATOR FALLBACK VIEW
    // ==========================================
    private var cameraUnavailableFallbackView: some View {
        VStack(spacing: 16) {
            Image(systemName: "camera.badge.ellipsis")
                .font(.system(size: 50))
                .foregroundColor(Color.orange)

            Text("Camera Scanner Offline / Simulator")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)

            Text("Camera hardware is not available in the iOS Simulator or camera access was restricted. You can type or simulate a barcode below.")
                .font(.system(size: 12))
                .foregroundColor(Color.white.opacity(0.8))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)

            Button(action: {
                handleScanned(code: "MM-\(Int.random(in: 100000...999999))")
            }) {
                HStack(spacing: 6) {
                    Image(systemName: "barcode.viewfinder")
                    Text("Generate Test Barcode")
                        .font(.system(size: 13, weight: .bold))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 18)
                .padding(.vertical, 10)
                .background(MedMargTheme.primaryTeal)
                .cornerRadius(10)
            }
        }
        .padding(24)
    }
}

// =========================================================================
// 🎥 NATIVE AVCAPTURESESSION WRAPPER
// =========================================================================

struct NativeCameraScannerRepresentable: UIViewControllerRepresentable {
    @Binding var isActive: Bool
    let onFound: (String) -> Void

    func makeUIViewController(context: Context) -> ScannerViewController {
        let vc = ScannerViewController()
        vc.onCodeDetected = onFound
        return vc
    }

    func updateUIViewController(_ uiViewController: ScannerViewController, context: Context) {}
}

class ScannerViewController: UIViewController, AVCaptureMetadataOutputObjectsDelegate {
    var onCodeDetected: ((String) -> Void)?
    private var captureSession: AVCaptureSession?
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var hasFired: Bool = false

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        startSession()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer?.frame = view.bounds
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.captureSession?.stopRunning()
        }
    }

    private func startSession() {
        guard let device = AVCaptureDevice.default(for: .video) else { return }

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }

            let session = AVCaptureSession()
            session.sessionPreset = .high

            do {
                let input = try AVCaptureDeviceInput(device: device)
                if session.canAddInput(input) {
                    session.addInput(input)
                }

                let output = AVCaptureMetadataOutput()
                if session.canAddOutput(output) {
                    session.addOutput(output)
                    output.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
                    output.metadataObjectTypes = [.code128, .code39, .ean13, .qr, .ean8]
                }

                DispatchQueue.main.async {
                    let preview = AVCaptureVideoPreviewLayer(session: session)
                    preview.videoGravity = .resizeAspectFill
                    preview.frame = self.view.bounds
                    self.view.layer.addSublayer(preview)
                    self.previewLayer = preview
                }

                self.captureSession = session
                session.startRunning()
            } catch {
                print("⚠️ Camera initialization failed: \(error)")
            }
        }
    }

    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        guard !hasFired, let obj = metadataObjects.first as? AVMetadataMachineReadableCodeObject, let code = obj.stringValue else { return }
        hasFired = true
        onCodeDetected?(code)
    }
}
