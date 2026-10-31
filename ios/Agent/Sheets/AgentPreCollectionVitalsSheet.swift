import SwiftUI

// =========================================================================
// 🩺 AGENT BEDSIDE PRE-COLLECTION VITALS RECORDING SHEET
// Mandatory step after reaching customer doorstep, prior to tube phlebotomy
// Records: Blood Pressure (Systolic / Diastolic), Pulse Rate, SpO2, Blood Sugar, Temperature
// Syncs to Backend & Customer Health Vault
// =========================================================================

struct AgentPreCollectionVitalsSheet: View {
    let order: AgentPickupOrder
    let onVitalsRecorded: (PhleboVitalsRecord) -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var systolic: String = "120"
    @State private var diastolic: String = "80"
    @State private var pulse: String = "74"
    @State private var spo2: String = "98"
    @State private var bloodSugar: String = ""
    @State private var bodyTemp: String = "98.4"
    @State private var clinicalNotes: String = ""
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String? = nil

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 18) {
                    // Header Patient Summary Card
                    HStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(MedMargTheme.primaryTeal.opacity(0.12))
                                .frame(width: 46, height: 46)
                            Image(systemName: "heart.text.square.fill")
                                .font(.system(size: 22))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(order.effectivePatientName.capitalized)
                                .font(.system(size: 16, weight: .black))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Pre-Sample Clinical Baseline Assessment")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.white)
                    .cornerRadius(14)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))

                    if let err = errorMessage {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill").foregroundColor(.red)
                            Text(err).font(.system(size: 12, weight: .bold)).foregroundColor(.red)
                        }
                        .padding(10)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(10)
                    }

                    // 1. Blood Pressure
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Image(systemName: "gauge.with.dots.needle.bottom.50percent")
                                .foregroundColor(Color.red)
                            Text("Blood Pressure (mmHg) *")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                        }

                        HStack(spacing: 12) {
                            vitalsInputField(title: "Systolic", value: $systolic, placeholder: "120")
                            Text("/").font(.title2).foregroundColor(MedMargTheme.slate500)
                            vitalsInputField(title: "Diastolic", value: $diastolic, placeholder: "80")
                        }
                    }
                    .padding(14)
                    .background(Color.white)
                    .cornerRadius(14)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))

                    // 2. Pulse & SpO2
                    HStack(spacing: 12) {
                        // Pulse
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Image(systemName: "heart.fill").foregroundColor(.red)
                                Text("Pulse (BPM)")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)
                            }
                            TextField("72", text: $pulse)
                                .keyboardType(.numberPad)
                                .font(.system(size: 16, weight: .black))
                                .padding(10)
                                .background(MedMargTheme.slate50)
                                .cornerRadius(8)
                        }
                        .padding(12)
                        .background(Color.white)
                        .cornerRadius(14)
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))

                        // SpO2
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Image(systemName: "lungs.fill").foregroundColor(.blue)
                                Text("SpO2 (%)")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)
                            }
                            TextField("98", text: $spo2)
                                .keyboardType(.numberPad)
                                .font(.system(size: 16, weight: .black))
                                .padding(10)
                                .background(MedMargTheme.slate50)
                                .cornerRadius(8)
                        }
                        .padding(12)
                        .background(Color.white)
                        .cornerRadius(14)
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
                    }

                    // 3. Body Temperature & Random Sugar
                    HStack(spacing: 12) {
                        // Temp
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Image(systemName: "thermometer.medium").foregroundColor(.orange)
                                Text("Temp (°F)")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)
                            }
                            TextField("98.4", text: $bodyTemp)
                                .keyboardType(.decimalPad)
                                .font(.system(size: 16, weight: .black))
                                .padding(10)
                                .background(MedMargTheme.slate50)
                                .cornerRadius(8)
                        }
                        .padding(12)
                        .background(Color.white)
                        .cornerRadius(14)
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))

                        // Blood Sugar
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Image(systemName: "drop.fill").foregroundColor(.purple)
                                Text("Sugar (mg/dL)")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)
                            }
                            TextField("Optional", text: $bloodSugar)
                                .keyboardType(.numberPad)
                                .font(.system(size: 16, weight: .black))
                                .padding(10)
                                .background(MedMargTheme.slate50)
                                .cornerRadius(8)
                        }
                        .padding(12)
                        .background(Color.white)
                        .cornerRadius(14)
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
                    }

                    // 4. Clinical Notes
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Patient Fasting & Clinical Notes")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.slate700)

                        TextField("e.g. 10 hours fasting confirmed, calm demeanor", text: $clinicalNotes)
                            .font(.system(size: 13))
                            .padding(12)
                            .background(MedMargTheme.slate50)
                            .cornerRadius(10)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
                    }
                    .padding(14)
                    .background(Color.white)
                    .cornerRadius(14)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))

                    // Save Vitals & Proceed to Collection
                    Button(action: saveVitalsAndProceed) {
                        HStack(spacing: 8) {
                            if isSubmitting {
                                ProgressView().tint(.white)
                            }
                            Text(isSubmitting ? "Saving Vitals..." : "Confirm Vitals & Proceed to Sample Draw")
                                .font(.system(size: 15, weight: .bold))
                            Image(systemName: "arrow.right")
                                .font(.system(size: 13, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 15)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(14)
                        .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 8, y: 3)
                    }
                    .disabled(isSubmitting)
                }
                .padding(16)
            }
            .background(MedMargTheme.slate50)
            .navigationTitle("Bedside Vitals Check")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private func vitalsInputField(title: String, value: Binding<String>, placeholder: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(MedMargTheme.slate500)
            TextField(placeholder, text: value)
                .keyboardType(.numberPad)
                .font(.system(size: 18, weight: .black))
                .padding(10)
                .background(MedMargTheme.slate50)
                .cornerRadius(8)
        }
    }

    private func saveVitalsAndProceed() {
        guard !systolic.isEmpty, !diastolic.isEmpty else {
            errorMessage = "Please enter Blood Pressure readings."
            return
        }

        isSubmitting = true
        let record = PhleboVitalsRecord(
            recordedAt: ISO8601DateFormatter().string(from: Date()),
            bp: "\(systolic)/\(diastolic)",
            pulse: pulse,
            spo2: "\(spo2)%",
            sugar: bloodSugar.isEmpty ? nil : bloodSugar,
            temp: "\(bodyTemp)°F",
            notes: clinicalNotes
        )

        // Save to backend
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/pickup/update") else {
            onVitalsRecorded(record)
            dismiss()
            return
        }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload: [String: Any] = [
            "orderId": order.id,
            "status": "ARRIVED",
            "vitals": [
                "bp": "\(systolic)/\(diastolic)",
                "pulse": pulse,
                "spo2": "\(spo2)%",
                "sugar": bloodSugar,
                "temp": bodyTemp,
                "notes": clinicalNotes
            ]
        ]

        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

        URLSession.shared.dataTask(with: req) { _, _, _ in
            DispatchQueue.main.async {
                self.isSubmitting = false
                self.onVitalsRecorded(record)
                self.dismiss()
            }
        }.resume()
    }
}
