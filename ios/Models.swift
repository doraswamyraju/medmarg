import Foundation

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
    var status: String // Active / Inactive
    var createdAt: String
}

struct LabTestItem: Identifiable {
    let id: String
    let name: String
    let category: String
    let labName: String
    let price: Int
    let originalPrice: Int
    let params: Int
    let tatHours: Int
    let isNabl: Bool
    let isHomeCollection: Bool
}

struct HealthPackageItem: Identifiable {
    let id: String
    let name: String
    let includedCount: Int
    let params: Int
    let price: Int
    let originalPrice: Int
    let discountPercent: Int
    let yellowTag: String
}

struct DoctorPatientItem: Identifiable {
    let id: String
    let name: String
    let age: Int
    let gender: String
    let phone: String
    let address: String
    let appAccessGranted: Bool
}

struct DoctorOrderItem: Identifiable {
    let id: String
    let doctorName: String
    let patientName: String
    let phone: String
    let tests: [String]
    let labCost: Int
    let doctorPrice: Int
    let doctorMargin: Int
    let status: String
    let driveReport: String
    let date: String
}

struct CollectionAgentItem: Identifiable {
    let id: String
    let name: String
    let phone: String
    let area: String
    let samplesToday: Int
    let temp: String
    let battery: String
    let status: String
    let rating: Double
}

struct MedicalInventoryItem: Identifiable {
    let id: String
    let name: String
    let category: String
    var currentQty: Int
    let minThreshold: Int
    let unit: String
    let unitCost: Double
    let supplier: String
}

struct ScanServiceItem: Identifiable {
    let id: String
    let name: String
    let centerName: String
    let machineSpec: String
    let price: Int
    let originalPrice: Int
    let nextSlot: String
}

struct DoctorItem: Identifiable {
    let id: String
    let name: String
    let specialty: String
    let qualification: String
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
