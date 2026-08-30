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
// 🧪 WEB MODULE OFFICIAL TEST & DATA MODELS
// ==========================================
struct LabTestItem: Identifiable, Equatable {
    let id: String
    let name: String
    let category: String
    let params: Int
    let sampleType: String
    let description: String
    let mrp: Int
    let thyrocarePrice: Int
    let apolloPrice: Int
    let lalPrice: Int
    let tat: String
    let fasting: String
    let bestseller: Bool
    let yellowTag: String
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

struct BiomarkerRecord: Identifiable, Equatable {
    var id: String { name }
    let name: String
    let value: String
    let status: String
}

struct HealthRecordItem: Identifiable, Equatable {
    let id: String
    let testTitle: String
    let labName: String
    let date: String
    let status: String
    let summary: String
    let driveUrl: String
    let biomarkers: [BiomarkerRecord]
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

// ==========================================
// 📍 OFFICIAL WEB MODULE CATEGORIES & TESTS
// ==========================================
let WEB_THYROCARE_CATEGORIES = [
    "All Tests & Packages",
    "Aarogyam Full Body Profiles",
    "Thyroid & Hormones",
    "Diabetes Screening",
    "Heart & Lipid Profile",
    "Liver Function (LFT)",
    "Kidney Function (KFT/RFT)",
    "Vitamins & Minerals",
    "Complete Blood Count (CBC)",
    "Cardiac Risk & Iron",
    "Cancer Screening Markers"
]

let WEB_THYROCARE_TESTS: [LabTestItem] = [
    // 1. Aarogyam Full Body Profiles
    LabTestItem(
        id: "th_aarogyam_complete",
        name: "Aarogyam Complete 1.3 (Full Body Checkup)",
        category: "Aarogyam Full Body Profiles",
        params: 104,
        sampleType: "Blood (10-12h Fasting) + Urine",
        description: "Includes Liver (11), Kidney (8), Lipid (8), Thyroid (3), Iron Def (4), Vitamin D & B12, Cardiac Risk (5), Complete Hemogram (28), Pancreatic & Toxic Elements (22).",
        mrp: 3500,
        thyrocarePrice: 1499,
        apolloPrice: 1999,
        lalPrice: 2200,
        tat: "24 hrs",
        fasting: "10-12 hrs Fasting",
        bestseller: true,
        yellowTag: "MEGA 57% OFF"
    ),
    LabTestItem(
        id: "th_aarogyam_basic",
        name: "Aarogyam Basic 1.1 (Essential Health Check)",
        category: "Aarogyam Full Body Profiles",
        params: 63,
        sampleType: "Blood (10h Fasting)",
        description: "Essential health panel covering Complete Hemogram, Thyroid Total, Lipid Profile, Liver Function, and Kidney Function.",
        mrp: 1800,
        thyrocarePrice: 899,
        apolloPrice: 1250,
        lalPrice: 1400,
        tat: "12 hrs",
        fasting: "10 hrs Fasting",
        bestseller: true,
        yellowTag: "POPULAR"
    ),
    LabTestItem(
        id: "th_aarogyam_senior",
        name: "Aarogyam Senior Citizen Profile (Advanced)",
        category: "Aarogyam Full Body Profiles",
        params: 110,
        sampleType: "Blood (12h Fasting) + Urine",
        description: "Tailored for senior adults including Arthritis Screening, Bone Health (Calcium/D3), Cardiac Markers (hsCRP), HbA1c, Liver, Kidney & Electrolytes.",
        mrp: 4200,
        thyrocarePrice: 1999,
        apolloPrice: 2600,
        lalPrice: 2850,
        tat: "24 hrs",
        fasting: "12 hrs Fasting",
        bestseller: false,
        yellowTag: "SENIOR CARE"
    ),

    // 2. Thyroid & Hormones
    LabTestItem(
        id: "th_thyroid_total",
        name: "Thyroid Profile Total (T3, T4, TSH)",
        category: "Thyroid & Hormones",
        params: 3,
        sampleType: "Blood (Morning)",
        description: "Gold standard automated CLIA technology screening for Hypothyroidism and Hyperthyroidism.",
        mrp: 650,
        thyrocarePrice: 299,
        apolloPrice: 450,
        lalPrice: 499,
        tat: "6 hrs",
        fasting: "No Fasting Required",
        bestseller: true,
        yellowTag: "TOP TEST"
    ),
    LabTestItem(
        id: "th_thyroid_free",
        name: "Free Thyroid Profile (FT3, FT4, TSH Ultrasensitive)",
        category: "Thyroid & Hormones",
        params: 3,
        sampleType: "Blood",
        description: "Unbound active thyroid hormones assessment for precise endocrinological evaluation.",
        mrp: 950,
        thyrocarePrice: 499,
        apolloPrice: 750,
        lalPrice: 800,
        tat: "8 hrs",
        fasting: "No Fasting Required",
        bestseller: false,
        yellowTag: "ADVANCED"
    ),
    LabTestItem(
        id: "th_anti_tpo",
        name: "Anti-TPO (Thyroid Peroxidase Antibody)",
        category: "Thyroid & Hormones",
        params: 1,
        sampleType: "Blood",
        description: "Detects autoimmune Hashimoto thyroiditis and Graves disease.",
        mrp: 1400,
        thyrocarePrice: 699,
        apolloPrice: 1100,
        lalPrice: 1200,
        tat: "24 hrs",
        fasting: "No Fasting",
        bestseller: false,
        yellowTag: "AUTOIMMUNE"
    ),
    LabTestItem(
        id: "th_testosterone",
        name: "Testosterone Total (Hormone Panel)",
        category: "Thyroid & Hormones",
        params: 1,
        sampleType: "Blood (Morning Sample)",
        description: "Measures total androgenic hormone levels for vitality, muscle health, and reproductive endocrine function.",
        mrp: 850,
        thyrocarePrice: 399,
        apolloPrice: 650,
        lalPrice: 700,
        tat: "12 hrs",
        fasting: "Morning Sample",
        bestseller: false,
        yellowTag: "HORMONES"
    ),

    // 3. Diabetes Screening
    LabTestItem(
        id: "th_hba1c",
        name: "HbA1c (Glycosylated Hemoglobin) with eAG",
        category: "Diabetes Screening",
        params: 2,
        sampleType: "Blood (Whole Blood EDTA)",
        description: "HPLC methodology 3-month average blood glucose level. Certified NGSP / IFCC protocol.",
        mrp: 600,
        thyrocarePrice: 299,
        apolloPrice: 350,
        lalPrice: 399,
        tat: "6 hrs",
        fasting: "No Fasting Required",
        bestseller: true,
        yellowTag: "ESSENTIAL"
    ),
    LabTestItem(
        id: "th_fasting_glucose",
        name: "Fasting Blood Sugar (FBS) + Post Prandial (PPBS)",
        category: "Diabetes Screening",
        params: 2,
        sampleType: "Blood (Fluoride Tube)",
        description: "Instant plasma glucose measurement before and 2 hours after breakfast.",
        mrp: 300,
        thyrocarePrice: 149,
        apolloPrice: 220,
        lalPrice: 250,
        tat: "4 hrs",
        fasting: "8-10 hrs Fasting",
        bestseller: false,
        yellowTag: "DAILY CARE"
    ),
    LabTestItem(
        id: "th_insulin_fasting",
        name: "Fasting Insulin + HOMA-IR (Insulin Resistance)",
        category: "Diabetes Screening",
        params: 2,
        sampleType: "Blood (Fasting)",
        description: "Evaluates metabolic syndrome, pre-diabetes risk, and insulin resistance severity.",
        mrp: 1200,
        thyrocarePrice: 599,
        apolloPrice: 900,
        lalPrice: 950,
        tat: "12 hrs",
        fasting: "10 hrs Fasting",
        bestseller: false,
        yellowTag: "INSULIN CHECK"
    ),

    // 4. Heart & Lipid Profile
    LabTestItem(
        id: "th_lipid_profile",
        name: "Lipid Profile (Complete Cholesterol Panel)",
        category: "Heart & Lipid Profile",
        params: 8,
        sampleType: "Blood (12h Fasting)",
        description: "Total Cholesterol, HDL, LDL, VLDL, Triglycerides, Non-HDL Cholesterol, and TC/HDL Ratio.",
        mrp: 750,
        thyrocarePrice: 399,
        apolloPrice: 499,
        lalPrice: 549,
        tat: "6 hrs",
        fasting: "12 hrs Fasting Required",
        bestseller: true,
        yellowTag: "HEART CARE"
    ),
    LabTestItem(
        id: "th_cardiac_hs_crp",
        name: "hs-CRP (High Sensitivity C-Reactive Protein)",
        category: "Heart & Lipid Profile",
        params: 1,
        sampleType: "Blood",
        description: "Predictive vascular inflammatory marker assessing immediate risk of heart disease and stroke.",
        mrp: 800,
        thyrocarePrice: 399,
        apolloPrice: 600,
        lalPrice: 650,
        tat: "12 hrs",
        fasting: "No Fasting",
        bestseller: false,
        yellowTag: "CARDIAC RISK"
    ),
    LabTestItem(
        id: "th_homocysteine",
        name: "Homocysteine (Vascular Health Marker)",
        category: "Heart & Lipid Profile",
        params: 1,
        sampleType: "Blood",
        description: "Cardiovascular & cerebrovascular arterial plaque risk marker.",
        mrp: 1500,
        thyrocarePrice: 699,
        apolloPrice: 1100,
        lalPrice: 1250,
        tat: "18 hrs",
        fasting: "10 hrs Fasting",
        bestseller: false,
        yellowTag: "SPECIALIZED"
    ),

    // 5. Liver Function (LFT)
    LabTestItem(
        id: "th_lft",
        name: "Liver Function Test (LFT - 11 Parameters)",
        category: "Liver Function (LFT)",
        params: 11,
        sampleType: "Blood",
        description: "Bilirubin Total/Direct/Indirect, SGOT (AST), SGPT (ALT), Alkaline Phosphatase, Total Protein, Albumin, Globulin & A/G Ratio.",
        mrp: 750,
        thyrocarePrice: 399,
        apolloPrice: 550,
        lalPrice: 600,
        tat: "6 hrs",
        fasting: "No Fasting",
        bestseller: true,
        yellowTag: "LIVER DETOX"
    ),

    // 6. Kidney Function (KFT/RFT)
    LabTestItem(
        id: "th_kft",
        name: "Kidney Function Test (KFT / RFT with Electrolytes)",
        category: "Kidney Function (KFT/RFT)",
        params: 8,
        sampleType: "Blood",
        description: "Serum Creatinine, Blood Urea, Uric Acid, BUN, Calcium, Sodium, Potassium & Chloride.",
        mrp: 850,
        thyrocarePrice: 449,
        apolloPrice: 600,
        lalPrice: 680,
        tat: "6 hrs",
        fasting: "No Fasting",
        bestseller: true,
        yellowTag: "RENAL HEALTH"
    ),

    // 7. Vitamins & Minerals
    LabTestItem(
        id: "th_vitamin_d_b12",
        name: "Vitamin D3 (25-OH) + Vitamin B12 Duo",
        category: "Vitamins & Minerals",
        params: 2,
        sampleType: "Blood",
        description: "Essential combination checking bone density, immune response, nerve function, and red blood cell production.",
        mrp: 2200,
        thyrocarePrice: 799,
        apolloPrice: 1300,
        lalPrice: 1450,
        tat: "12 hrs",
        fasting: "No Fasting Required",
        bestseller: true,
        yellowTag: "BEST VALUE 64% OFF"
    ),
    LabTestItem(
        id: "th_iron_deficiency",
        name: "Iron Deficiency Profile (Iron, TIBC, Ferritin, % Saturation)",
        category: "Vitamins & Minerals",
        params: 4,
        sampleType: "Blood",
        description: "Complete assessment of serum iron reserves to detect early-stage and chronic anemia.",
        mrp: 1100,
        thyrocarePrice: 499,
        apolloPrice: 800,
        lalPrice: 850,
        tat: "8 hrs",
        fasting: "No Fasting",
        bestseller: false,
        yellowTag: "ANEMIA CHECK"
    ),

    // 8. Complete Blood Count (CBC)
    LabTestItem(
        id: "th_cbc",
        name: "Complete Hemogram (CBC + ESR - 28 Parameters)",
        category: "Complete Blood Count (CBC)",
        params: 28,
        sampleType: "Blood (EDTA Whole Blood)",
        description: "6-Part Differential Hemogram: Hemoglobin, Total Leukocyte Count, Platelet Count, Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils, MCV, MCH, MCHC, RDW, ESR.",
        mrp: 450,
        thyrocarePrice: 249,
        apolloPrice: 320,
        lalPrice: 350,
        tat: "4 hrs",
        fasting: "No Fasting Required",
        bestseller: true,
        yellowTag: "ROUTINE"
    ),

    // 9. Cancer Screening Markers
    LabTestItem(
        id: "th_psa",
        name: "PSA Total (Prostate Specific Antigen - Men)",
        category: "Cancer Screening Markers",
        params: 1,
        sampleType: "Blood",
        description: "Prostate health and early oncological screening marker for men aged 40+.",
        mrp: 900,
        thyrocarePrice: 499,
        apolloPrice: 750,
        lalPrice: 800,
        tat: "12 hrs",
        fasting: "No Fasting",
        bestseller: false,
        yellowTag: "MEN HEALTH"
    ),
    LabTestItem(
        id: "th_ca125",
        name: "CA-125 (Ovarian Cancer Screening Marker - Women)",
        category: "Cancer Screening Markers",
        params: 1,
        sampleType: "Blood",
        description: "Tumor marker for ovarian and pelvic reproductive tissue evaluation.",
        mrp: 1500,
        thyrocarePrice: 799,
        apolloPrice: 1200,
        lalPrice: 1300,
        tat: "18 hrs",
        fasting: "No Fasting",
        bestseller: false,
        yellowTag: "WOMEN HEALTH"
    )
]

// ==========================================
// 📍 OFFICIAL WEB MODULE CITIES
// ==========================================
let WEB_CITIES = [
    "Tirupati, Andhra Pradesh",
    "Vijayawada, Andhra Pradesh",
    "Visakhapatnam, Andhra Pradesh",
    "Nellore, Andhra Pradesh",
    "Guntur, Andhra Pradesh",
    "Hyderabad, Telangana",
    "Bengaluru, Karnataka",
    "Chennai, Tamil Nadu",
    "Mumbai, Maharashtra",
    "Delhi NCR"
]
