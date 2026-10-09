import SwiftUI

// =========================================================================
// 📄 CARE SEEKER PRESCRIPTION UPLOAD MODAL
// 100% Feature Parity with Web CareSeekerPrescriptionModal.jsx
// =========================================================================

struct CareSeekerPrescriptionModal: View {
    @Binding var isOpen: Bool

    @State private var careSeekerName: String = "Rahul Sharma"
    @State private var phone: String = "+91 98765 43210"
    @State private var address: String = "Plot 42, Air Bypass Road, Tirupati, AP"
    @State private var notes: String = ""
    @State private var isUploaded: Bool = false
    @State private var isSubmitting: Bool = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    
                    if isUploaded {
                        uploadSuccessCard
                    } else {
                        // 1. Upload Banner
                        uploadBanner

                        // 2. Prescription File Picker Box
                        prescriptionPickerBox

                        // 3. Contact & Address Form
                        contactDetailsForm

                        // 4. Submit CTA Button
                        submitCTAButton
                    }

                    Spacer().frame(height: 30)
                }
                .padding(16)
            }
            .background(MedMargTheme.slate50)
            .navigationTitle("Upload Doctor Prescription")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { isOpen = false }
                }
            }
        }
    }

    // ==========================================
    // 📢 1. UPLOAD BANNER
    // ==========================================
    private var uploadBanner: some View {
        HStack(spacing: 12) {
            Image(systemName: "clock.badge.checkmark.fill")
                .font(.system(size: 24))
                .foregroundColor(MedMargTheme.amberGold)

            VStack(alignment: .leading, spacing: 2) {
                Text("15-Minute Pharmacist Callback")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Text("Our certified medical team reviews your Rx and prepares the exact diagnostic test cart.")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
            }
            Spacer()
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 📸 2. PRESCRIPTION PICKER BOX
    // ==========================================
    private var prescriptionPickerBox: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(MedMargTheme.lightTeal)
                    .frame(width: 56, height: 56)
                Image(systemName: "camera.fill")
                    .font(.system(size: 24))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }

            Text("Take Photo or Upload Prescription")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            Text("Supports JPG, PNG or PDF (Max 10MB)")
                .font(.system(size: 11))
                .foregroundColor(MedMargTheme.slate500)

            HStack(spacing: 10) {
                Button(action: {}) {
                    HStack(spacing: 4) {
                        Image(systemName: "camera")
                        Text("Capture Photo")
                    }
                    .font(.system(size: 12, weight: .bold))
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(MedMargTheme.primaryTeal)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }

                Button(action: {}) {
                    HStack(spacing: 4) {
                        Image(systemName: "photo.on.rectangle")
                        Text("Gallery")
                    }
                    .font(.system(size: 12, weight: .bold))
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(MedMargTheme.lightTeal)
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .cornerRadius(8)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(20)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(style: StrokeStyle(lineWidth: 1.5, dash: [6, 4]))
                .foregroundColor(MedMargTheme.primaryTeal)
        )
    }

    // ==========================================
    // ✍️ 3. CONTACT FORM
    // ==========================================
    private var contactDetailsForm: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Care Seeker Contact Details")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            VStack(spacing: 10) {
                TextField("Patient Full Name", text: $careSeekerName)
                    .padding(10)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(8)

                TextField("Contact Phone Number", text: $phone)
                    .keyboardType(.phonePad)
                    .padding(10)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(8)

                TextField("Delivery / Collection Address", text: $address)
                    .padding(10)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(8)

                TextField("Any doctor instructions or specific test names", text: $notes)
                    .padding(10)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(8)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🚀 4. SUBMIT CTA
    // ==========================================
    private var submitCTAButton: some View {
        Button(action: {
            isSubmitting = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                isSubmitting = false
                isUploaded = true
            }
        }) {
            HStack(spacing: 6) {
                if isSubmitting {
                    ProgressView().tint(.white)
                }
                Text(isSubmitting ? "Uploading..." : "Submit Prescription for Pharmacist Review")
                    .font(.system(size: 14, weight: .bold))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(MedMargTheme.primaryTeal)
            .foregroundColor(.white)
            .cornerRadius(14)
        }
    }

    private var uploadSuccessCard: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.green.opacity(0.12))
                    .frame(width: 72, height: 72)
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 40))
                    .foregroundColor(Color.green)
            }
            .padding(.top, 20)

            Text("Prescription Uploaded Successfully!")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            Text("Our medical team is reviewing your prescription. You will receive a call within 15 minutes at \(phone) with your test recommendations and doorstep phlebotomy schedule.")
                .font(.system(size: 12))
                .foregroundColor(MedMargTheme.slate500)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 20)

            Button(action: { isOpen = false }) {
                Text("Done")
                    .font(.system(size: 14, weight: .bold))
                    .padding(.horizontal, 32)
                    .padding(.vertical, 12)
                    .background(MedMargTheme.primaryTeal)
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
        }
        .padding(20)
        .background(Color.white)
        .cornerRadius(20)
    }
}
