import Foundation
import SwiftUI
import HealthKit

// =========================================================================
// 🫀 HEALTHKIT TELEMETRY & ACTUAL VITALS MANAGER FOR MEDMARG CLIENT
// =========================================================================

struct VitalAlert: Identifiable, Equatable {
    let id = UUID().uuidString
    let title: String
    let message: String
    let severity: AlertSeverity // normal, warning, critical
    let timestamp: String
    let relatedTest: String?

    enum AlertSeverity: String {
        case normal
        case warning
        case critical
    }
}

struct RecommendedDiagnosticTest: Identifiable, Equatable {
    let id: String
    let title: String
    let reason: String
    let labPrice: Int
    let mrp: Int
    let sampleType: String
    let urgency: String
    let labProvider: String
}

@MainActor
class HealthKitManager: ObservableObject {
    static let shared = HealthKitManager()

    private let healthStore = HKHealthStore()

    @Published var isHealthDataAvailable: Bool = false
    @Published var isAuthorized: Bool = false
    @Published var isSyncing: Bool = false
    @Published var lastSyncDate: Date? = nil
    @Published var authorizationError: String? = nil

    // 🫀 Live Vitals State (Synced from Apple Health or Real-Time Sensors)
    @Published var heartRate: Double = 74.0 // BPM
    @Published var restingHeartRate: Double = 68.0 // BPM
    @Published var bloodOxygen: Double = 98.4 // SpO2 %
    @Published var systolicBP: Double = 122.0 // mmHg
    @Published var diastolicBP: Double = 81.0 // mmHg
    @Published var bloodGlucose: Double = 98.0 // mg/dL (Fasting)
    @Published var stepCount: Int = 6842 // Steps
    @Published var activeCalories: Double = 428.0 // kcal
    @Published var bodyTemperature: Double = 98.6 // °F
    @Published var respiratoryRate: Double = 16.0 // breaths/min
    @Published var sleepHours: Double = 7.4 // hrs
    @Published var bodyWeight: Double = 68.5 // kg
    @Published var heartRateTrend: [Double] = [72, 70, 75, 78, 74, 76, 73, 75, 74]

    // Diagnostic Correlations & Smart Alerts
    @Published var activeAlerts: [VitalAlert] = []
    @Published var recommendedTests: [RecommendedDiagnosticTest] = []

    init() {
        self.isHealthDataAvailable = HKHealthStore.isHealthDataAvailable()
        evaluateVitalsAndRecommendTests()
    }

    // ==========================================
    // 🔐 REQUEST HEALTHKIT READ & WRITE PERMISSION
    // ==========================================
    func requestAuthorization(completion: @escaping (Bool) -> Void = { _ in }) {
        guard HKHealthStore.isHealthDataAvailable() else {
            self.authorizationError = "Health data is not available on this device."
            completion(false)
            return
        }

        // Quantities to Read from Apple Health
        var typesToRead: Set<HKObjectType> = []
        
        let quantityIdentifiers: [HKQuantityTypeIdentifier] = [
            .heartRate,
            .restingHeartRate,
            .oxygenSaturation,
            .bloodPressureSystolic,
            .bloodPressureDiastolic,
            .bloodGlucose,
            .stepCount,
            .activeEnergyBurned,
            .bodyTemperature,
            .respiratoryRate,
            .bodyMass
        ]

        for id in quantityIdentifiers {
            if let type = HKQuantityType.quantityType(forIdentifier: id) {
                typesToRead.insert(type)
            }
        }

        if let sleepType = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis) {
            typesToRead.insert(sleepType)
        }

        // Quantities MedMarg can log back to Apple Health
        var typesToWrite: Set<HKSampleType> = []
        if let hrType = HKQuantityType.quantityType(forIdentifier: .heartRate) { typesToWrite.insert(hrType) }
        if let bpSys = HKQuantityType.quantityType(forIdentifier: .bloodPressureSystolic) { typesToWrite.insert(bpSys) }
        if let bpDia = HKQuantityType.quantityType(forIdentifier: .bloodPressureDiastolic) { typesToWrite.insert(bpDia) }
        if let glucose = HKQuantityType.quantityType(forIdentifier: .bloodGlucose) { typesToWrite.insert(glucose) }
        if let spo2 = HKQuantityType.quantityType(forIdentifier: .oxygenSaturation) { typesToWrite.insert(spo2) }
        if let temp = HKQuantityType.quantityType(forIdentifier: .bodyTemperature) { typesToWrite.insert(temp) }

        healthStore.requestAuthorization(toShare: typesToWrite, read: typesToRead) { success, error in
            DispatchQueue.main.async {
                self.isAuthorized = success
                if success {
                    self.authorizationError = nil
                    self.fetchAllVitalsFromAppleHealth()
                } else {
                    self.authorizationError = error?.localizedDescription ?? "HealthKit access was denied."
                }
                completion(success)
            }
        }
    }

    // ==========================================
    // 📊 FETCH ALL ACTUAL VITALS FROM HEALTHKIT
    // ==========================================
    func fetchAllVitalsFromAppleHealth() {
        guard HKHealthStore.isHealthDataAvailable() else { return }
        
        self.isSyncing = true
        let group = DispatchGroup()

        // 1. Heart Rate (Latest Sample)
        group.enter()
        fetchLatestQuantity(for: .heartRate, unit: HKUnit.count().unitDivided(by: .minute())) { [weak self] value in
            if let val = value {
                self?.heartRate = round(val)
            }
            group.leave()
        }

        // 2. Resting Heart Rate
        group.enter()
        fetchLatestQuantity(for: .restingHeartRate, unit: HKUnit.count().unitDivided(by: .minute())) { [weak self] value in
            if let val = value {
                self?.restingHeartRate = round(val)
            }
            group.leave()
        }

        // 3. SpO2 Blood Oxygen (Converted to %)
        group.enter()
        fetchLatestQuantity(for: .oxygenSaturation, unit: HKUnit.percent()) { [weak self] value in
            if let val = value {
                self?.bloodOxygen = round(val * 1000.0) / 10.0 // e.g. 0.984 -> 98.4%
            }
            group.leave()
        }

        // 4. Blood Pressure (Systolic & Diastolic)
        group.enter()
        fetchLatestQuantity(for: .bloodPressureSystolic, unit: HKUnit.millimeterOfMercury()) { [weak self] valSys in
            if let sys = valSys {
                self?.systolicBP = round(sys)
            }
            self?.fetchLatestQuantity(for: .bloodPressureDiastolic, unit: HKUnit.millimeterOfMercury()) { valDia in
                if let dia = valDia {
                    self?.diastolicBP = round(dia)
                }
                group.leave()
            }
        }

        // 5. Blood Glucose (mg/dL)
        group.enter()
        let mgPerDl = HKUnit(from: "mg/dL")
        fetchLatestQuantity(for: .bloodGlucose, unit: mgPerDl) { [weak self] value in
            if let val = value {
                self?.bloodGlucose = round(val)
            }
            group.leave()
        }

        // 6. Step Count (Today Cumulative)
        group.enter()
        fetchTodayCumulativeSum(for: .stepCount, unit: HKUnit.count()) { [weak self] sum in
            if let s = sum {
                self?.stepCount = Int(s)
            }
            group.leave()
        }

        // 7. Active Calories (kcal Today)
        group.enter()
        fetchTodayCumulativeSum(for: .activeEnergyBurned, unit: HKUnit.kilocalorie()) { [weak self] kcal in
            if let k = kcal {
                self?.activeCalories = round(k)
            }
            group.leave()
        }

        // 8. Body Temperature (°F)
        group.enter()
        fetchLatestQuantity(for: .bodyTemperature, unit: HKUnit.degreeFahrenheit()) { [weak self] temp in
            if let t = temp {
                self?.bodyTemperature = round(t * 10.0) / 10.0
            }
            group.leave()
        }

        // 9. Respiratory Rate
        group.enter()
        fetchLatestQuantity(for: .respiratoryRate, unit: HKUnit.count().unitDivided(by: .minute())) { [weak self] resp in
            if let r = resp {
                self?.respiratoryRate = round(r)
            }
            group.leave()
        }

        group.notify(queue: .main) {
            self.isSyncing = false
            self.lastSyncDate = Date()
            self.evaluateVitalsAndRecommendTests()
        }
    }

    // ==========================================
    // 🩺 HELPER: FETCH LATEST QUANTITY SAMPLE
    // ==========================================
    private func fetchLatestQuantity(
        for identifier: HKQuantityTypeIdentifier,
        unit: HKUnit,
        completion: @escaping (Double?) -> Void
    ) {
        guard let quantityType = HKQuantityType.quantityType(forIdentifier: identifier) else {
            completion(nil)
            return
        }

        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
        let query = HKSampleQuery(
            sampleType: quantityType,
            predicate: nil,
            limit: 1,
            sortDescriptors: [sortDescriptor]
        ) { _, results, _ in
            guard let sample = results?.first as? HKQuantitySample else {
                completion(nil)
                return
            }
            let value = sample.quantity.doubleValue(for: unit)
            DispatchQueue.main.async {
                completion(value)
            }
        }

        healthStore.execute(query)
    }

    // ==========================================
    // 🏃 HELPER: FETCH TODAY'S CUMULATIVE SUM
    // ==========================================
    private func fetchTodayCumulativeSum(
        for identifier: HKQuantityTypeIdentifier,
        unit: HKUnit,
        completion: @escaping (Double?) -> Void
    ) {
        guard let quantityType = HKQuantityType.quantityType(forIdentifier: identifier) else {
            completion(nil)
            return
        }

        let calendar = Calendar.current
        let now = Date()
        let startOfDay = calendar.startOfDay(for: now)
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: now, options: .strictStartDate)

        let query = HKStatisticsQuery(
            quantityType: quantityType,
            quantitySamplePredicate: predicate,
            options: .cumulativeSum
        ) { _, statistics, _ in
            guard let sum = statistics?.sumQuantity() else {
                completion(nil)
                return
            }
            let value = sum.doubleValue(for: unit)
            DispatchQueue.main.async {
                completion(value)
            }
        }

        healthStore.execute(query)
    }

    // ==========================================
    // ✍️ LOG MANUAL VITAL READING INTO HEALTHKIT
    // ==========================================
    func logManualReading(
        type: HKQuantityTypeIdentifier,
        value: Double,
        unit: HKUnit,
        date: Date = Date(),
        completion: @escaping (Bool) -> Void
    ) {
        guard let quantityType = HKQuantityType.quantityType(forIdentifier: type) else {
            completion(false)
            return
        }

        let quantity = HKQuantity(unit: unit, doubleValue: value)
        let sample = HKQuantitySample(
            type: quantityType,
            quantity: quantity,
            start: date,
            end: date
        )

        healthStore.save(sample) { [weak self] success, _ in
            DispatchQueue.main.async {
                if success {
                    self?.fetchAllVitalsFromAppleHealth()
                }
                completion(success)
            }
        }
    }

    // ==========================================
    // 💡 DIAGNOSTIC CORRELATION & LAB RECOMMENDATION
    // ==========================================
    func evaluateVitalsAndRecommendTests() {
        var alerts: [VitalAlert] = []
        var recs: [RecommendedDiagnosticTest] = []

        let nowStr = "Live Telemetry"

        // Blood Pressure Evaluation
        if systolicBP >= 140 || diastolicBP >= 90 {
            alerts.append(VitalAlert(
                title: "Stage 2 Hypertension Indicator",
                message: "BP reading (\(Int(systolicBP))/\(Int(diastolicBP)) mmHg) is elevated above normal.",
                severity: .critical,
                timestamp: nowStr,
                relatedTest: "Lipid Profile + Renal Function Panel"
            ))
            recs.append(RecommendedDiagnosticTest(
                id: "rec_cardio",
                title: "Comprehensive Lipid & Renal Risk Panel",
                reason: "Recommended due to elevated blood pressure (\(Int(systolicBP))/\(Int(diastolicBP)) mmHg).",
                labPrice: 699,
                mrp: 1400,
                sampleType: "Blood (10h Fasting)",
                urgency: "High Priority",
                labProvider: "Thyrocare Technologies"
            ))
        } else if systolicBP >= 125 || diastolicBP >= 83 {
            alerts.append(VitalAlert(
                title: "Elevated Blood Pressure",
                message: "Systolic BP (\(Int(systolicBP)) mmHg) is slightly above the ideal 120/80 range.",
                severity: .warning,
                timestamp: nowStr,
                relatedTest: "Cardiac Risk Panel"
            ))
        }

        // Blood Glucose Evaluation
        if bloodGlucose >= 126 {
            alerts.append(VitalAlert(
                title: "High Fasting Blood Glucose",
                message: "Fasting glucose is \(Int(bloodGlucose)) mg/dL (Normal is < 100 mg/dL).",
                severity: .critical,
                timestamp: nowStr,
                relatedTest: "HbA1c Glycated Hemoglobin Test"
            ))
            recs.append(RecommendedDiagnosticTest(
                id: "rec_diabetes",
                title: "HbA1c & Fasting Insulin Combo",
                reason: "3-Month Blood Sugar control check recommended for glucose \(Int(bloodGlucose)) mg/dL.",
                labPrice: 399,
                mrp: 900,
                sampleType: "EDTA Whole Blood",
                urgency: "Recommended",
                labProvider: "Dr. Lal PathLabs"
            ))
        } else if bloodGlucose >= 105 {
            alerts.append(VitalAlert(
                title: "Pre-Diabetes Glucose Marker",
                message: "Fasting glucose is \(Int(bloodGlucose)) mg/dL (Borderline 100-125 range).",
                severity: .warning,
                timestamp: nowStr,
                relatedTest: "HbA1c Screen"
            ))
        }

        // SpO2 Blood Oxygen Evaluation
        if bloodOxygen < 95.0 {
            alerts.append(VitalAlert(
                title: "Low Blood Oxygen Saturation (SpO2)",
                message: "SpO2 is \(bloodOxygen)%. Normal range is 95% - 100%.",
                severity: .critical,
                timestamp: nowStr,
                relatedTest: "Complete Hemogram (CBC) + ABG"
            ))
            recs.append(RecommendedDiagnosticTest(
                id: "rec_pulmonary",
                title: "Complete Hemogram & Anemia Profile",
                reason: "Checks Hemoglobin and Oxygen-carrying capacity of RBCs.",
                labPrice: 299,
                mrp: 650,
                sampleType: "EDTA Blood",
                urgency: "Urgent Check",
                labProvider: "MedMarg Direct"
            ))
        }

        // Resting Heart Rate Evaluation
        if restingHeartRate > 95 {
            alerts.append(VitalAlert(
                title: "Elevated Resting Heart Rate",
                message: "Resting pulse is \(Int(restingHeartRate)) BPM (Tachycardia threshold).",
                severity: .warning,
                timestamp: nowStr,
                relatedTest: "Thyroid Profile Total (T3/T4/TSH)"
            ))
            recs.append(RecommendedDiagnosticTest(
                id: "rec_thyroid",
                title: "Thyroid Profile Total (T3, T4, TSH Ultra)",
                reason: "Checks thyroid hyperactivity which frequently elevates resting pulse.",
                labPrice: 299,
                mrp: 650,
                sampleType: "SST Serum",
                urgency: "Recommended",
                labProvider: "Thyrocare Direct"
            ))
        }

        // Default General Wellness Check if all vitals optimal
        if recs.isEmpty {
            recs.append(RecommendedDiagnosticTest(
                id: "rec_general",
                title: "MedMarg Annual Preventive Health Checkup",
                reason: "Your Apple Health vitals are optimal! Maintain your health baseline with an annual 63-test panel.",
                labPrice: 899,
                mrp: 2200,
                sampleType: "Serum + EDTA",
                urgency: "Preventive Care",
                labProvider: "MedMarg Certified Hub"
            ))
        }

        self.activeAlerts = alerts
        self.recommendedTests = recs
    }
}
