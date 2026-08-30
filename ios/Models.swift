import Foundation

enum UserRole: String, CaseIterable, Identifiable {
    case patient = "PATIENT"
    case diagnosticLab = "DIAGNOSTIC_LAB"
    case scanCenter = "SCAN_CENTER"
    case doctor = "DOCTOR"
    case pharmacy = "PHARMACY"
    case admin = "ADMIN"

    var id: String { self.rawValue }

    var displayName: String {
        switch self {
        case .patient: return "Patient (Customer)"
        case .diagnosticLab: return "Diagnostic Lab Partner"
        case .scanCenter: return "Radiology & Scan Center"
        case .doctor: return "Doctor (In-Clinic OPD)"
        case .pharmacy: return "Pharmacy Partner"
        case .admin: return "MedMarg Super Admin"
        }
    }
}

struct UserProfile: Identifiable {
    let id: String
    let name: String
    let identifier: String
    let role: UserRole
    let organization: String
}

struct LabTestItem: Identifiable {
    let id: String
    let name: String
    let category: String
    let labName: String
    let price: Int
    let originalPrice: Int
    let tatHours: Int
    let isNabl: Bool
    let isHomeCollection: Bool
}

struct ScanServiceItem: Identifiable {
    let id: String
    let name: String
    let centerName: String
    let machineSpec: String
    let price: Int
    let nextSlot: String
}

struct DoctorItem: Identifiable {
    let id: String
    let name: String
    let specialty: String
    let clinic: String
    let fee: Int
    let nextSlot: String
}

struct HealthRecordItem: Identifiable {
    let id: String
    let title: String
    let labName: String
    let date: String
    let driveUrl: String
}
