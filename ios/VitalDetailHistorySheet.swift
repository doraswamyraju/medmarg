import SwiftUI

// =========================================================================
// 📈 VITAL DETAIL & HISTORICAL TIMELINE ANALYTICS SHEET
// =========================================================================

struct VitalDetailHistorySheet: View {
    let vitalKey: String
    let profile: VitalDetailProfile
    @ObservedObject var healthKit: HealthKitManager
    let onAddToCart: (CatalogItem) -> Void
    @Environment(\.presentationMode) var presentationMode

    @State private var selectedRange: VitalTimeRange = .week7d
    @State private var samples: [HistoricalVitalSample] = []
    @State private var isLoading: Bool = true
    @State private var showLogModal: Bool = false

    var currentValue: String {
        switch vitalKey {
        case "HEART_RATE": return "\(Int(healthKit.heartRate))"
        case "RESTING_PULSE": return "\(Int(healthKit.restingHeartRate))"
        case "SPO2": return String(format: "%.1f", healthKit.bloodOxygen)
        case "BP": return "\(Int(healthKit.systolicBP))/\(Int(healthKit.diastolicBP))"
        case "GLUCOSE": return "\(Int(healthKit.bloodGlucose))"
        case "STEPS": return "\(healthKit.stepCount)"
        case "TEMP": return String(format: "%.1f", healthKit.bodyTemperature)
        case "RESPIRATORY": return "\(Int(healthKit.respiratoryRate))"
        default: return "--"
        }
    }

    var averageValue: String {
        guard !samples.isEmpty else { return "--" }
        let avg = samples.reduce(0.0) { $0 + $1.value } / Double(samples.count)
        return String(format: "%.1f", avg)
    }

    var minValue: String {
        guard !samples.isEmpty else { return "--" }
        let minVal = samples.map(\.value).min() ?? 0
        return String(format: "%.1f", minVal)
    }

    var maxValue: String {
        guard !samples.isEmpty else { return "--" }
        let maxVal = samples.map(\.value).max() ?? 0
        return String(format: "%.1f", maxVal)
    }

    var body: some View {
        NavigationView {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    
                    // 1. Vital Highlight Header
                    vitalHeaderCard

                    // 2. Time Range Switcher (24H, 7D, 30D)
                    timeRangeSelector

                    // 3. KPI Summary Cards (Current, Avg, Min, Max)
                    kpiSummaryGrid

                    // 4. Interactive Trend Graph
                    trendGraphSection

                    // 5. Correlated Diagnostic Recommendation
                    diagnosticRecommendationCard

                    // 6. Detailed Chronological Sample Log
                    historicalSampleLogSection

                    Spacer().frame(height: 30)
                }
                .padding(16)
            }
            .background(MedMargTheme.slate50)
            .navigationTitle(profile.title)
            .navigationBarItems(
                leading: Button("Close") {
                    presentationMode.wrappedValue.dismiss()
                },
                trailing: Button(action: { showLogModal = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                        Text("Log")
                    }
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                }
            )
            .sheet(isPresented: $showLogModal) {
                ManualVitalEntrySheet(healthKit: healthKit)
            }
            .onAppear {
                loadHistory()
            }
            .onChange(of: selectedRange) { _ in
                loadHistory()
            }
        }
    }

    // ==========================================
    // 🩺 1. VITAL HEADER CARD
    // ==========================================
    private var vitalHeaderCard: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(profile.iconColor.opacity(0.12))
                    .frame(width: 54, height: 54)
                Image(systemName: profile.icon)
                    .font(.system(size: 24))
                    .foregroundColor(profile.iconColor)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack(alignment: .lastTextBaseline, spacing: 6) {
                    Text(currentValue)
                        .font(.system(size: 32, weight: .black, design: .rounded))
                        .foregroundColor(MedMargTheme.slate900)
                    Text(profile.unit)
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Text("Target: \(profile.clinicalTarget)")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(MedMargTheme.accentEmerald)

                Text(profile.description)
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
                    .lineLimit(2)
            }

            Spacer()
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(18)
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 📅 2. TIME RANGE SELECTOR
    // ==========================================
    private var timeRangeSelector: some View {
        HStack(spacing: 0) {
            ForEach(VitalTimeRange.allCases) { range in
                Button(action: {
                    selectedRange = range
                }) {
                    Text(range.rawValue)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(selectedRange == range ? MedMargTheme.primaryTeal : MedMargTheme.slate500)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(selectedRange == range ? Color.white : Color.clear)
                        .cornerRadius(8)
                        .shadow(color: selectedRange == range ? Color.black.opacity(0.06) : Color.clear, radius: 4, x: 0, y: 2)
                }
            }
        }
        .padding(4)
        .background(MedMargTheme.slate200.opacity(0.6))
        .cornerRadius(10)
    }

    // ==========================================
    // 📊 3. KPI SUMMARY GRID
    // ==========================================
    private var kpiSummaryGrid: some View {
        HStack(spacing: 10) {
            kpiCard(title: "AVERAGE", value: averageValue, color: MedMargTheme.primaryTeal)
            kpiCard(title: "MINIMUM", value: minValue, color: Color.blue)
            kpiCard(title: "MAXIMUM", value: maxValue, color: Color.orange)
        }
    }

    private func kpiCard(title: String, value: String, color: Color) -> some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.system(size: 10, weight: .heavy))
                .foregroundColor(MedMargTheme.slate500)
            HStack(alignment: .lastTextBaseline, spacing: 2) {
                Text(value)
                    .font(.system(size: 18, weight: .black, design: .rounded))
                    .foregroundColor(color)
                Text(profile.unit)
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(MedMargTheme.slate500)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(Color.white)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 📈 4. INTERACTIVE TREND GRAPH
    // ==========================================
    private var trendGraphSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Telemetry Trend (\(selectedRange.rawValue))")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                Text("\(samples.count) Data Points")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(MedMargTheme.slate500)
            }

            if isLoading {
                HStack {
                    Spacer()
                    ProgressView("Querying Apple Health...")
                    Spacer()
                }
                .frame(height: 140)
            } else if samples.isEmpty {
                VStack(spacing: 6) {
                    Image(systemName: "waveform.path.ecg")
                        .font(.system(size: 28))
                        .foregroundColor(MedMargTheme.slate500)
                    Text("No sensor readings in this time window.")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate500)
                }
                .frame(maxWidth: .infinity)
                .frame(height: 140)
            } else {
                // Interactive Bar/Trend Visualizer
                HStack(alignment: .bottom, spacing: 6) {
                    let maxSampleVal = max(1.0, samples.map(\.value).max() ?? 100.0)

                    ForEach(samples.prefix(16).reversed()) { sample in
                        VStack(spacing: 4) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(
                                    LinearGradient(
                                        colors: [profile.iconColor.opacity(0.9), profile.iconColor.opacity(0.4)],
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )
                                .frame(height: max(16, CGFloat(sample.value / maxSampleVal) * 110))

                            Text(sample.formattedTime.prefix(5))
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                .frame(height: 140)
                .padding(.top, 8)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(18)
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🧪 5. CORRELATED DIAGNOSTIC RECOMMENDATION
    // ==========================================
    private var diagnosticRecommendationCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "sparkles")
                    .foregroundColor(MedMargTheme.amberGold)
                Text("Correlated Clinical Action")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                Text("MedMarg AI")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(4)
            }

            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.lightTeal)
                        .frame(width: 42, height: 42)
                    Image(systemName: "flask.fill")
                        .foregroundColor(MedMargTheme.primaryTeal)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(profile.relatedTest)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Price: ₹\(profile.testPrice) • Free Home Phlebotomy")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Button(action: {
                    let item = CatalogItem(
                        id: "rec_\(vitalKey)",
                        serialNo: nil,
                        code: "REC_\(vitalKey)",
                        name: profile.relatedTest,
                        sampleType: "Blood (Serum / EDTA)",
                        fasting: "YES",
                        category: "Vitals Correlated",
                        mrp: profile.testPrice * 2,
                        price: profile.testPrice,
                        tatHours: 24,
                        description: "Recommended based on your Apple Health \(profile.title) telemetry.",
                        active: true,
                        itemType: "PACKAGE",
                        profiles: nil,
                        tests: nil,
                        testCount: 12,
                        discountPercent: 50,
                        tagline: "VITALS SPECIAL",
                        popular: true,
                        fastingNote: "10h Fasting",
                        sampleTypes: ["SERUM", "EDTA"]
                    )
                    onAddToCart(item)
                    presentationMode.wrappedValue.dismiss()
                }) {
                    Text("Book")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(8)
                }
            }
        }
        .padding(14)
        .background(MedMargTheme.lightTeal.opacity(0.5))
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.primaryTeal.opacity(0.3), lineWidth: 1.5))
    }

    // ==========================================
    // 📋 6. CHRONOLOGICAL SAMPLE LOG
    // ==========================================
    private var historicalSampleLogSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recorded Historical Samples (\(samples.count))")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            ForEach(samples) { sample in
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 6) {
                            Text("\(sample.formattedTime)")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("• \(sample.formattedDate)")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        HStack(spacing: 4) {
                            Image(systemName: "applewatch")
                                .font(.system(size: 10))
                            Text(sample.sourceName)
                                .font(.system(size: 10, weight: .medium))
                        }
                        .foregroundColor(MedMargTheme.slate500)
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 2) {
                        HStack(alignment: .lastTextBaseline, spacing: 3) {
                            Text(String(format: "%.1f", sample.value))
                                .font(.system(size: 16, weight: .black, design: .rounded))
                                .foregroundColor(MedMargTheme.slate900)
                            Text(sample.unit)
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Text(sample.classification)
                            .font(.system(size: 9, weight: .bold))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(MedMargTheme.lightTeal)
                            .foregroundColor(MedMargTheme.primaryTeal)
                            .cornerRadius(4)
                    }
                }
                .padding(12)
                .background(Color.white)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
            }
        }
    }

    private func loadHistory() {
        isLoading = true
        healthKit.fetchHistoricalSamples(vitalKey: vitalKey, timeRange: selectedRange) { loaded in
            self.samples = loaded
            self.isLoading = false
        }
    }
}
