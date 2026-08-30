import Foundation
import SwiftUI

// ==========================================
// 🎨 MEDMARG BRAND DESIGN SYSTEM & TOKENS
// ==========================================
struct MedMargTheme {
    static let primaryTeal = Color(red: 0.0, green: 0.42, blue: 0.44)       // #006B70
    static let darkTeal = Color(red: 0.0, green: 0.30, blue: 0.32)          // #004D40
    static let lightTeal = Color(red: 0.88, green: 0.95, blue: 0.95)        // #E0F2F1
    static let accentEmerald = Color(red: 0.06, green: 0.73, blue: 0.51)    // #10B981
    static let emeraldLight = Color(red: 0.82, green: 0.98, blue: 0.90)     // #D1FAE5
    static let amberGold = Color(red: 0.96, green: 0.62, blue: 0.04)        // #F59E0B
    static let amberLight = Color(red: 0.99, green: 0.95, blue: 0.78)       // #FEF3C7
    static let cyanBlue = Color(red: 0.02, green: 0.71, blue: 0.83)         // #06B6D4
    static let purpleClinic = Color(red: 0.55, green: 0.36, blue: 0.96)     // #8B5CF6
    static let slate900 = Color(red: 0.06, green: 0.09, blue: 0.16)         // #0F172A
    static let slate700 = Color(red: 0.20, green: 0.25, blue: 0.33)         // #334155
    static let slate500 = Color(red: 0.39, green: 0.45, blue: 0.55)         // #64748B
    static let slate200 = Color(red: 0.89, green: 0.91, blue: 0.94)         // #E2E8F0
    static let slate50 = Color(red: 0.97, green: 0.98, blue: 0.99)          // #F8FAFC
    static let pureWhite = Color.white
}

// ==========================================
// 🧑‍💼 USER ROLES & PROFILES
// ==========================================
enum UserRole: String, CaseIterable, Identifiable {
    case patient = "PATIENT"
    case doctor = "DOCTOR"
    case admin = "ADMIN"
    case diagnosticLab = "DIAGNOSTIC_LAB"
    case scanCenter = "SCAN_CENTER"
    case pharmacy = "PHARMACY"
    case collectionAgent = "COLLECTION_AGENT"

    var id: String { self.rawValue }

    var displayName: String {
        switch self {
        case .patient: return "Patient (Customer)"
        case .doctor: return "Doctor (In-Clinic OPD)"
        case .admin: return "Super Admin (Central Lab)"
        case .diagnosticLab: return "Diagnostic Lab Partner"
        case .scanCenter: return "Radiology & Scan Center"
        case .pharmacy: return "Generic Pharmacy Partner"
        case .collectionAgent: return "Collection Agent (Fleet)"
        }
    }

    var iconName: String {
        switch self {
        case .patient: return "person.crop.circle.fill"
        case .doctor: return "stethoscope"
        case .admin: return "shield.fill"
        case .diagnosticLab: return "flask.fill"
        case .scanCenter: return "waveform.path.ecg.rectangle"
        case .pharmacy: return "pills.fill"
        case .collectionAgent: return "car.fill"
        }
    }
}

struct UserProfile: Identifiable, Equatable {
    let id: String
    var name: String
    var username: String
    var email: String
    var phone: String
    var password: String
    var role: UserRole
    var organization: String
    var status: String
    var createdAt: String
}

// ==========================================
// 🧪 LIVE DIAGNOSTIC & HEALTHCARE MODELS
// ==========================================
struct LabTestItem: Identifiable, Equatable {
    let id: String
    let name: String
    let category: String
    let sampleType: String
    let fastingHours: Int
    let params: Int
    let thyrocarePrice: Int
    let apolloPrice: Int
    let lalPrice: Int
    let mrp: Int
    let tatHours: Int
    let tags: [String]
}

struct HealthPackageItem: Identifiable, Equatable {
    let id: String
    let name: String
    let testsCount: Int
    let paramsCount: Int
    let dealPrice: Int
    let mrp: Int
    let discountPercent: Int
    let tag: String
    let description: String
    let includedTests: [String]
}

struct ScanServiceItem: Identifiable, Equatable {
    let id: String
    let name: String
    let category: String
    let centerName: String
    let machineSpec: String
    let price: Int
    let mrp: Int
    let durationMins: Int
    let nextSlot: String
    let fastingRequired: Bool
}

struct GenericMedicineItem: Identifiable, Equatable {
    let id: String
    let brandName: String
    let genericName: String
    let category: String
    let manufacturer: String
    let brandMrp: Double
    let genericPrice: Double
    let packSize: String
    let savingsPercent: Int
}

struct HealthRecordItem: Identifiable, Equatable {
    let id: String
    let testTitle: String
    let labName: String
    let date: String
    let status: String
    let summary: String
    let driveUrl: String
    let biomarkers: [(String, String, String)] // Name, Value, Status (Normal/High/Borderline)
}

struct CartItem: Identifiable, Equatable {
    let id: String
    let title: String
    let subtitle: String
    let provider: String
    let price: Int
    let mrp: Int
    let type: String // Lab Test / MRI Scan / Medicine
}
