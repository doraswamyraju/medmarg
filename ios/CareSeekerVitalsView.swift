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
    @State private var activeDetailProfile: VitalDetailProfile? = nil

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
                
                // 1. Apple Health Connection & Personal Metrics Banner
                appleHealthHeaderBanner

                // Connect Apple Watch & HealthKit Hero Card (when not yet granted)
                if !healthKit.isAuthorized {
                    connectWatchHeroBanner
                }

                // 2. Medical & Telemetry Disclaimer Banner
                medicalDisclaimerBanner

                // 3. Primary Vitals 2x2 Telemetry Grid (Clickable to view past data)
                primaryVitalsGrid

                // 4. Activity & Sleep Metrics (Apple Watch / iPhone Sensors)
                activityAndRecoverySection

                // 5. Manual Vital Reading Logger Trigger
                manualLogActionBar

                // 6. Secondary Medical Disclaimer
                medicalDisclaimerBanner

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
        .sheet(item: $activeDetailProfile) { profile in
            VitalDetailHistorySheet(
                vitalKey: profile.id,
                profile: profile,
                healthKit: healthKit,
                onAddToCart: onAddToCart
            )
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
                        
                        Text("APPLE HEALTH PERSONAL VITALS")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(MedMargTheme.emeraldLight)
                            .tracking(1.0)
                    }

                    Text("Personal Health & Vitals")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.white)

                    Text("Recorded wellness biometrics synced from Apple Health & connected monitors.")
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
                    Text(healthKit.isAuthorized ? "Apple Watch & Apple Health Active" : "Sensors Not Linked (Tap to Connect)")
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
    // ⌚️ CONNECT APPLE WATCH & SENSORS HERO
    // ==========================================
    private var connectWatchHeroBanner: some View {
        Button(action: {
            healthKit.requestAuthorization { success in
                if success {
                    healthKit.fetchAllVitalsFromAppleHealth()
                }
            }
        }) {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.primaryTeal.opacity(0.12))
                        .frame(width: 48, height: 48)

                    Image(systemName: "applewatch.side.right")
                        .font(.system(size: 24))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }

                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 6) {
                        Text("Connect Apple Watch & Apple Health")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)

                        Text("Sync")
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(MedMargTheme.primaryTeal)
                            .cornerRadius(4)
                    }

                    Text("Tap to authorize read access to your Heart Rate, SpO2, and Vitals from Apple Watch & paired health sensors.")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                        .lineLimit(2)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(MedMargTheme.slate500)
            }
            .padding(14)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(MedMargTheme.primaryTeal.opacity(0.3), lineWidth: 1.5)
            )
            .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 3)
        }
    }

    // ==========================================
    // ⚠️ MEDICAL & TELEMETRY DISCLAIMER
    // ==========================================
    private var medicalDisclaimerBanner: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "cross.case.fill")
                .font(.system(size: 18))
                .foregroundColor(MedMargTheme.primaryTeal)
                .padding(.top, 2)

            VStack(alignment: .leading, spacing: 4) {
                Text("Medical Disclaimer")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Text("The health metrics displayed in MedMarg are synced from Apple Health, paired wearables, or logged during doorstep phlebotomy visits for personal wellness tracking and sample collection records only. MedMarg does not provide medical diagnoses, treatment, or clinical advice. Always seek the advice of a qualified physician or healthcare provider with any questions regarding a medical condition and before making any medical decisions.")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate600)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer()
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(MedMargTheme.primaryTeal.opacity(0.3), lineWidth: 1)
        )
        .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
    }

    // ==========================================
    // 🫀 4. PRIMARY VITALS 2x2 TELEMETRY GRID (TAP TO VIEW PAST DATA)
    // ==========================================
    private var primaryVitalsGrid: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Core Vital Biomarkers")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                Text("Tap card for Past Trends & Logs ➔")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }

            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                
                // Card 1: Heart Rate
                Button(action: {
                    activeDetailProfile = VitalDetailProfile(
                        id: "HEART_RATE",
                        title: "Heart Rate (BPM)",
                        icon: "heart.fill",
                        iconColor: .red,
                        unit: "BPM",
                        clinicalTarget: "Standard Reference: 60 - 100 BPM",
                        description: "Heart rate biometrics recorded via Apple Watch or connected sensors for personal fitness tracking.",
                        relatedTest: "",
                        testPrice: 0
                    )
                }) {
                    VitalMetricCard(
                        icon: "heart.fill",
                        iconColor: .red,
                        bgColor: Color.red.opacity(0.08),
                        title: "Heart Rate",
                        value: "\(Int(healthKit.heartRate))",
                        unit: "BPM",
                        subtitle: "Resting: \(Int(healthKit.restingHeartRate)) BPM",
                        statusText: "Ref: 60-100 BPM",
                        statusColor: MedMargTheme.primaryTeal
                    )
                }

                // Card 2: Blood Oxygen SpO2
                Button(action: {
                    activeDetailProfile = VitalDetailProfile(
                        id: "SPO2",
                        title: "Blood Oxygen (SpO2)",
                        icon: "lungs.fill",
                        iconColor: .blue,
                        unit: "%",
                        clinicalTarget: "Standard Reference: ≥ 95%",
                        description: "Peripheral blood oxygen saturation recorded by connected health sensors for personal fitness tracking.",
                        relatedTest: "",
                        testPrice: 0
                    )
                }) {
                    VitalMetricCard(
                        icon: "lungs.fill",
                        iconColor: .blue,
                        bgColor: Color.blue.opacity(0.08),
                        title: "Blood Oxygen (SpO2)",
                        value: String(format: "%.1f", healthKit.bloodOxygen),
                        unit: "%",
                        subtitle: "Apple Sensor Telemetry",
                        statusText: "Recorded: \(String(format: "%.1f", healthKit.bloodOxygen))%",
                        statusColor: MedMargTheme.primaryTeal
                    )
                }

                // Card 3: Blood Pressure
                Button(action: {
                    activeDetailProfile = VitalDetailProfile(
                        id: "BP",
                        title: "Blood Pressure",
                        icon: "waveform.path.ecg",
                        iconColor: MedMargTheme.primaryTeal,
                        unit: "mmHg",
                        clinicalTarget: "Standard Reference: < 120/80 mmHg",
                        description: "Systolic & Diastolic arterial pressure logged from connected monitors or phlebotomy visits.",
                        relatedTest: "",
                        testPrice: 0
                    )
                }) {
                    VitalMetricCard(
                        icon: "waveform.path.ecg",
                        iconColor: MedMargTheme.primaryTeal,
                        bgColor: MedMargTheme.lightTeal,
                        title: "Blood Pressure",
                        value: "\(Int(healthKit.systolicBP))/\(Int(healthKit.diastolicBP))",
                        unit: "mmHg",
                        subtitle: "Target: <120/80",
                        statusText: "Recorded: \(Int(healthKit.systolicBP))/\(Int(healthKit.diastolicBP))",
                        statusColor: MedMargTheme.primaryTeal
                    )
                }

                // Card 4: Blood Glucose
                Button(action: {
                    activeDetailProfile = VitalDetailProfile(
                        id: "GLUCOSE",
                        title: "Blood Glucose",
                        icon: "drop.fill",
                        iconColor: .purple,
                        unit: "mg/dL",
                        clinicalTarget: "Standard Reference: < 100 mg/dL (Fasting)",
                        description: "Plasma glucose reading recorded from personal glucometer logs or doorstep health visits.",
                        relatedTest: "",
                        testPrice: 0
                    )
                }) {
                    VitalMetricCard(
                        icon: "drop.fill",
                        iconColor: .purple,
                        bgColor: Color.purple.opacity(0.08),
                        title: "Blood Glucose",
                        value: "\(Int(healthKit.bloodGlucose))",
                        unit: "mg/dL",
                        subtitle: "Fasting Benchmark",
                        statusText: "Recorded: \(Int(healthKit.bloodGlucose)) mg/dL",
                        statusColor: MedMargTheme.primaryTeal
                    )
                }
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
                Button(action: {
                    activeDetailProfile = VitalDetailProfile(
                        id: "STEPS",
                        title: "Daily Steps & Activity",
                        icon: "figure.walk",
                        iconColor: .orange,
                        unit: "steps",
                        clinicalTarget: "Standard Reference: 10,000 Steps / Day",
                        description: "Daily pedometer step count & active calorie burn from iPhone accelerometer & Apple Watch.",
                        relatedTest: "",
                        testPrice: 0
                    )
                }) {
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
                        Text("Goal: 10k • \(Int(healthKit.activeCalories)) kcal")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.white)
                    .cornerRadius(14)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
                }

                // Temperature
                Button(action: {
                    activeDetailProfile = VitalDetailProfile(
                        id: "TEMP",
                        title: "Body Temperature",
                        icon: "thermometer.medium",
                        iconColor: .pink,
                        unit: "°F",
                        clinicalTarget: "Standard Reference: 97.0°F - 99.0°F",
                        description: "Core basal body temperature readings logged from connected clinical thermometer or personal entry.",
                        relatedTest: "",
                        testPrice: 0
                    )
                }) {
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
                        Text("Ref: 97-99°F")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.white)
                    .cornerRadius(14)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
                }

                // Sleep
                Button(action: {
                    activeDetailProfile = VitalDetailProfile(
                        id: "SLEEP",
                        title: "Sleep & Recovery",
                        icon: "bed.double.fill",
                        iconColor: .indigo,
                        unit: "hrs",
                        clinicalTarget: "Standard Reference: 7.0 - 9.0 Hours",
                        description: "Sleep duration and recovery time recorded by Apple Health and paired Apple Watch sleep tracking.",
                        relatedTest: "",
                        testPrice: 0
                    )
                }) {
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
                        Text("Logged")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.white)
                    .cornerRadius(14)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
                }
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
