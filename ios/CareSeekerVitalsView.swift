import SwiftUI
import HealthKit

// =========================================================================
// 🫀 CARE SEEKER LIVE VITALS & APPLE HEALTH TELEMETRY DASHBOARD
// =========================================================================

@MainActor
struct CareSeekerVitalsView: View {
    @ObservedObject var healthKit = HealthKitManager.shared
    @Binding var selectedTab: Int
    let onAddToCart: (CatalogItem) -> Void

    @State private var showManualLogSheet: Bool = false
    @State private var showShareSheet: Bool = false
    @State private var selectedVitalCategory: String = "ALL"
    @State private var isPulseAnimating: Bool = false

    init(
        selectedTab: Binding<Int>,
        onAddToCart: @escaping (CatalogItem) -> Void = { _ in }
    ) {
        self._selectedTab = selectedTab
        self.onAddToCart = onAddToCart
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                
                // 1. Apple Health Connection & Live Telemetry Banner
                appleHealthHeaderBanner

                // 2. Critical Health Alerts (if any vitals outside range)
                if !healthKit.activeAlerts.isEmpty {
                    vitalAlertsSection
                }

                // 3. Recommended Diagnostic Tests Based on Live Vitals
                recommendedTestsSection

                // 4. Primary Vitals 2x2 Telemetry Grid
                primaryVitalsGrid

                // 5. Activity & Sleep Metrics (Apple Watch / iPhone Sensors)
                activityAndRecoverySection

                // 6. Manual Vital Reading Logger Trigger
                manualLogActionBar

                Spacer().frame(height: 30)
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
        }
        .background(MedMargTheme.slate50)
        .sheet(isPresented: $showManualLogSheet) {
            ManualVitalEntrySheet(healthKit: healthKit)
        }
        .sheet(isPresented: $showShareSheet) {
            VitalsDoctorReportSheet(healthKit: healthKit)
        }
        .onAppear {
            isPulseAnimating = true
            if !healthKit.isAuthorized {
                healthKit.requestAuthorization()
            }
        }
    }

    // ==========================================
    // 🩺 1. APPLE HEALTH HEADER BANNER
    // ==========================================
    private var appleHealthHeaderBanner: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Image(systemName: "heart.fill")
                            .foregroundColor(.red)
                            .scaleEffect(isPulseAnimating ? 1.15 : 1.0)
                            .animation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true), value: isPulseAnimating)
                        
                        Text("APPLE HEALTH LIVE TELEMETRY")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(MedMargTheme.emeraldLight)
                            .tracking(1.0)
                    }

                    Text("Care Seeker Vitals Hub")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.white)

                    Text("Continuous biometrics from Apple Watch, HealthKit & Connected Sensors.")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.lightTeal)
                }

                Spacer()

                // Sync HealthKit Button
                Button(action: {
                    healthKit.requestAuthorization { _ in
                        healthKit.fetchAllVitalsFromAppleHealth()
                    }
                }) {
                    VStack(spacing: 4) {
                        ZStack {
                            Circle()
                                .fill(Color.white.opacity(0.15))
                                .frame(width: 44, height: 44)

                            if healthKit.isSyncing {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Image(systemName: "arrow.triangle.2.circlepath")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(MedMargTheme.amberGold)
                            }
                        }

                        Text(healthKit.isSyncing ? "Syncing..." : "Sync Now")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
            }

            Divider().background(Color.white.opacity(0.2))

            // Sync Status & Metadata
            HStack {
                HStack(spacing: 6) {
                    Circle()
                        .fill(healthKit.isAuthorized ? Color.green : Color.orange)
                        .frame(width: 8, height: 8)
                    Text(healthKit.isAuthorized ? "Connected to Apple Health" : "HealthKit Demo Mode (Tap to Connect)")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.white)
                }

                Spacer()

                Button(action: { showShareSheet = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 11, weight: .bold))
                        Text("Share with Doctor")
                            .font(.system(size: 11, weight: .bold))
                    }
                    .foregroundColor(MedMargTheme.slate900)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(MedMargTheme.amberGold)
                    .cornerRadius(8)
                }
            }
        }
        .padding(18)
        .background(
            LinearGradient(
                colors: [MedMargTheme.darkTeal, MedMargTheme.primaryTeal, Color(red: 0.0, green: 0.45, blue: 0.48)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(20)
        .shadow(color: MedMargTheme.darkTeal.opacity(0.35), radius: 10, x: 0, y: 5)
    }

    // ==========================================
    // ⚠️ 2. VITAL ALERTS & NOTIFICATIONS
    // ==========================================
    private var vitalAlertsSection: some View {
        VStack(spacing: 8) {
            ForEach(healthKit.activeAlerts) { alert in
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: alert.severity == .critical ? "exclamationmark.triangle.fill" : "info.circle.fill")
                        .font(.system(size: 18))
                        .foregroundColor(alert.severity == .critical ? .red : .orange)
                        .padding(.top, 2)

                    VStack(alignment: .leading, spacing: 3) {
                        Text(alert.title)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)

                        Text(alert.message)
                            .font(.system(size: 12))
                            .foregroundColor(MedMargTheme.slate700)

                        if let test = alert.relatedTest {
                            HStack(spacing: 4) {
                                Text("Recommended Lab Action:")
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundColor(MedMargTheme.slate500)
                                Text(test)
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                            }
                            .padding(.top, 2)
                        }
                    }

                    Spacer()
                }
                .padding(12)
                .background(alert.severity == .critical ? Color.red.opacity(0.08) : Color.orange.opacity(0.08))
                .cornerRadius(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(alert.severity == .critical ? Color.red.opacity(0.3) : Color.orange.opacity(0.3), lineWidth: 1)
                )
            }
        }
    }

    // ==========================================
    // 🧪 3. RECOMMENDED DIAGNOSTIC TESTS (SMART ENGINE)
    // ==========================================
    private var recommendedTestsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "sparkles")
                    .foregroundColor(MedMargTheme.amberGold)
                Text("Vitals-Correlated Lab Tests")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                Text("AI Telemetry Engine")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(6)
            }

            ForEach(healthKit.recommendedTests, id: \.id) { test in
                HStack(spacing: 12) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(MedMargTheme.lightTeal)
                            .frame(width: 46, height: 46)
                        Image(systemName: "flask.fill")
                            .font(.system(size: 20))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 6) {
                            Text(test.title)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                                .lineLimit(1)
                            
                            Text(test.urgency)
                                .font(.system(size: 9, weight: .black))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.red.opacity(0.1))
                                .foregroundColor(.red)
                                .cornerRadius(4)
                        }

                        Text(test.reason)
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                            .lineLimit(2)

                        HStack(spacing: 6) {
                            Text("₹\(test.labPrice)")
                                .font(.system(size: 14, weight: .black))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text("₹\(test.mrp)")
                                .font(.system(size: 11))
                                .strikethrough()
                                .foregroundColor(MedMargTheme.slate500)
                            Text("• \(test.labProvider)")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }

                    Spacer()

                    // Quick Add to Cart Button
                    Button(action: {
                        let item = CatalogItem(
                            id: test.id,
                            serialNo: nil,
                            code: test.id,
                            name: test.title,
                            sampleType: test.sampleType,
                            fasting: "NO",
                            category: "Recommended Diagnostics",
                            mrp: test.mrp,
                            price: test.labPrice,
                            tatHours: 24,
                            description: test.reason,
                            active: true,
                            itemType: "TEST",
                            profiles: nil,
                            tests: nil,
                            testCount: 1,
                            discountPercent: nil,
                            tagline: nil,
                            popular: true,
                            fastingNote: nil,
                            sampleTypes: nil
                        )
                        onAddToCart(item)
                    }) {
                        HStack(spacing: 4) {
                            Image(systemName: "plus")
                                .font(.system(size: 12, weight: .bold))
                            Text("Book")
                                .font(.system(size: 12, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(10)
                        .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 4, x: 0, y: 2)
                    }
                }
                .padding(12)
                .background(Color.white)
                .cornerRadius(16)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
            }
        }
    }

    // ==========================================
    // 🫀 4. PRIMARY VITALS 2x2 TELEMETRY GRID
    // ==========================================
    private var primaryVitalsGrid: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Core Vital Biomarkers")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                
                // Card 1: Heart Rate
                VitalMetricCard(
                    icon: "heart.fill",
                    iconColor: .red,
                    bgColor: Color.red.opacity(0.08),
                    title: "Heart Rate",
                    value: "\(Int(healthKit.heartRate))",
                    unit: "BPM",
                    subtitle: "Resting: \(Int(healthKit.restingHeartRate)) BPM",
                    statusText: healthKit.heartRate < 60 ? "Bradycardia" : (healthKit.heartRate > 100 ? "Tachycardia" : "Optimal (60-100)"),
                    statusColor: (healthKit.heartRate >= 60 && healthKit.heartRate <= 100) ? .green : .orange
                )

                // Card 2: Blood Oxygen SpO2
                VitalMetricCard(
                    icon: "lungs.fill",
                    iconColor: .blue,
                    bgColor: Color.blue.opacity(0.08),
                    title: "Blood Oxygen (SpO2)",
                    value: String(format: "%.1f", healthKit.bloodOxygen),
                    unit: "%",
                    subtitle: "Apple Sensor Telemetry",
                    statusText: healthKit.bloodOxygen >= 95.0 ? "Normal (>95%)" : "Low Oxygen Alert",
                    statusColor: healthKit.bloodOxygen >= 95.0 ? .green : .red
                )

                // Card 3: Blood Pressure
                VitalMetricCard(
                    icon: "waveform.path.ecg",
                    iconColor: MedMargTheme.primaryTeal,
                    bgColor: MedMargTheme.lightTeal,
                    title: "Blood Pressure",
                    value: "\(Int(healthKit.systolicBP))/\(Int(healthKit.diastolicBP))",
                    unit: "mmHg",
                    subtitle: "Target: <120/80",
                    statusText: healthKit.systolicBP < 120 ? "Normal BP" : (healthKit.systolicBP < 130 ? "Elevated" : "Hypertension"),
                    statusColor: healthKit.systolicBP < 120 ? .green : (healthKit.systolicBP < 130 ? .orange : .red)
                )

                // Card 4: Blood Glucose
                VitalMetricCard(
                    icon: "drop.fill",
                    iconColor: .purple,
                    bgColor: Color.purple.opacity(0.08),
                    title: "Blood Glucose",
                    value: "\(Int(healthKit.bloodGlucose))",
                    unit: "mg/dL",
                    subtitle: "Fasting Benchmark",
                    statusText: healthKit.bloodGlucose < 100 ? "Normal Fasting" : (healthKit.bloodGlucose < 126 ? "Pre-Diabetes" : "High Glucose"),
                    statusColor: healthKit.bloodGlucose < 100 ? .green : (healthKit.bloodGlucose < 126 ? .orange : .red)
                )
            }
        }
    }

    // ==========================================
    // 🏃 5. ACTIVITY & RECOVERY SECTION
    // ==========================================
    private var activityAndRecoverySection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Activity, Sleep & Temperature")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            HStack(spacing: 12) {
                // Steps
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "figure.walk")
                            .foregroundColor(.orange)
                        Text("Daily Steps")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    Text("\(healthKit.stepCount)")
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Goal: 10,000 • \(Int(healthKit.activeCalories)) kcal")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.slate500)
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.white)
                .cornerRadius(14)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))

                // Temperature
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "thermometer.medium")
                            .foregroundColor(.pink)
                        Text("Body Temp")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    Text("\(String(format: "%.1f", healthKit.bodyTemperature))°F")
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Normal Range (97-99°F)")
                        .font(.system(size: 10))
                        .foregroundColor(.green)
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.white)
                .cornerRadius(14)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))

                // Sleep
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "bed.double.fill")
                            .foregroundColor(.indigo)
                        Text("Sleep")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    Text("\(String(format: "%.1f", healthKit.sleepHours))h")
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Restorative Sleep")
                        .font(.system(size: 10))
                        .foregroundColor(.green)
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.white)
                .cornerRadius(14)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
            }
        }
    }

    // ==========================================
    // ✍️ 6. MANUAL VITAL LOGGER BUTTON
    // ==========================================
    private var manualLogActionBar: some View {
        Button(action: { showManualLogSheet = true }) {
            HStack(spacing: 8) {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 16, weight: .bold))
                Text("Log Manual Vital Reading (BP, Glucose, Temp, Pulse)")
                    .font(.system(size: 13, weight: .bold))
            }
            .foregroundColor(MedMargTheme.primaryTeal)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(MedMargTheme.lightTeal)
            .cornerRadius(14)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.primaryTeal.opacity(0.3), lineWidth: 1.5))
        }
    }
}

// =========================================================================
// 🎛️ REUSABLE VITAL METRIC CARD
// =========================================================================
struct VitalMetricCard: View {
    let icon: String
    let iconColor: Color
    let bgColor: Color
    let title: String
    let value: String
    let unit: String
    let subtitle: String
    let statusText: String
    let statusColor: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                ZStack {
                    Circle()
                        .fill(bgColor)
                        .frame(width: 36, height: 36)
                    Image(systemName: icon)
                        .font(.system(size: 16))
                        .foregroundColor(iconColor)
                }

                Spacer()

                Text(statusText)
                    .font(.system(size: 9, weight: .bold))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(statusColor.opacity(0.12))
                    .foregroundColor(statusColor)
                    .cornerRadius(6)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)

                HStack(alignment: .lastTextBaseline, spacing: 4) {
                    Text(value)
                        .font(.system(size: 24, weight: .black, design: .rounded))
                        .foregroundColor(MedMargTheme.slate900)

                    Text(unit)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Text(subtitle)
                    .font(.system(size: 10))
                    .foregroundColor(MedMargTheme.slate500)
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(18)
        .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 3)
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(MedMargTheme.slate200, lineWidth: 1))
    }
}

// =========================================================================
// ✍️ MANUAL VITAL ENTRY SHEET
// =========================================================================
struct ManualVitalEntrySheet: View {
    @ObservedObject var healthKit: HealthKitManager
    @Environment(\.presentationMode) var presentationMode

    @State private var systolicInput: String = "120"
    @State private var diastolicInput: String = "80"
    @State private var pulseInput: String = "72"
    @State private var glucoseInput: String = "95"
    @State private var spo2Input: String = "99"
    @State private var tempInput: String = "98.6"
    @State private var saveSuccess: Bool = false

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Blood Pressure (mmHg)")) {
                    HStack {
                        Text("Systolic")
                        Spacer()
                        TextField("120", text: $systolicInput)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                    }
                    HStack {
                        Text("Diastolic")
                        Spacer()
                        TextField("80", text: $diastolicInput)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                    }
                }

                Section(header: Text("Pulse & Oxygen")) {
                    HStack {
                        Text("Pulse (BPM)")
                        Spacer()
                        TextField("72", text: $pulseInput)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                    }
                    HStack {
                        Text("SpO2 Blood Oxygen (%)")
                        Spacer()
                        TextField("99", text: $spo2Input)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                }

                Section(header: Text("Blood Glucose & Temperature")) {
                    HStack {
                        Text("Blood Glucose (mg/dL)")
                        Spacer()
                        TextField("95", text: $glucoseInput)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                    }
                    HStack {
                        Text("Body Temp (°F)")
                        Spacer()
                        TextField("98.6", text: $tempInput)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                }

                Section {
                    Button(action: saveReadings) {
                        HStack {
                            Spacer()
                            Text(saveSuccess ? "✓ Saved to Apple Health" : "Save & Sync to HealthKit")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(saveSuccess ? .green : MedMargTheme.primaryTeal)
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Log Vital Reading")
            .navigationBarItems(trailing: Button("Done") {
                presentationMode.wrappedValue.dismiss()
            })
        }
    }

    private func saveReadings() {
        if let sys = Double(systolicInput) { healthKit.systolicBP = sys }
        if let dia = Double(diastolicInput) { healthKit.diastolicBP = dia }
        if let pulse = Double(pulseInput) { healthKit.heartRate = pulse }
        if let gluc = Double(glucoseInput) { healthKit.bloodGlucose = gluc }
        if let sp = Double(spo2Input) { healthKit.bloodOxygen = sp }
        if let t = Double(tempInput) { healthKit.bodyTemperature = t }

        healthKit.evaluateVitalsAndRecommendTests()
        saveSuccess = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            presentationMode.wrappedValue.dismiss()
        }
    }
}

// =========================================================================
// 📄 DOCTOR VITALS REPORT EXPORT SHEET
// =========================================================================
struct VitalsDoctorReportSheet: View {
    @ObservedObject var healthKit: HealthKitManager
    @Environment(\.presentationMode) var presentationMode

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("MedMarg Telemetry Health Passport")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                        Text("Generated for Doctor Consultation & Phlebotomist Baseline Review")
                            .font(.system(size: 12))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(12)

                    VStack(spacing: 12) {
                        reportRow(label: "Heart Rate", value: "\(Int(healthKit.heartRate)) BPM", status: "Normal")
                        reportRow(label: "Resting Pulse", value: "\(Int(healthKit.restingHeartRate)) BPM", status: "Optimal")
                        reportRow(label: "Blood Oxygen (SpO2)", value: "\(healthKit.bloodOxygen)%", status: "Good")
                        reportRow(label: "Blood Pressure", value: "\(Int(healthKit.systolicBP))/\(Int(healthKit.diastolicBP)) mmHg", status: "Monitored")
                        reportRow(label: "Fasting Glucose", value: "\(Int(healthKit.bloodGlucose)) mg/dL", status: "Monitored")
                        reportRow(label: "Body Temperature", value: "\(healthKit.bodyTemperature)°F", status: "Normal")
                    }
                    .padding()
                    .background(Color.white)
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))

                    Button(action: { presentationMode.wrappedValue.dismiss() }) {
                        HStack {
                            Image(systemName: "square.and.arrow.up")
                            Text("Export PDF & Share to WhatsApp Doctor")
                        }
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(12)
                    }
                }
                .padding(16)
            }
            .navigationTitle("Doctor Health Summary")
            .navigationBarItems(trailing: Button("Close") {
                presentationMode.wrappedValue.dismiss()
            })
        }
    }

    private func reportRow(label: String, value: String, status: String) -> some View {
        HStack {
            Text(label)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(MedMargTheme.slate700)
            Spacer()
            Text(value)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)
            Text(status)
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(MedMargTheme.primaryTeal)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(MedMargTheme.lightTeal)
                .cornerRadius(4)
        }
    }
}
