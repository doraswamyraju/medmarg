package com.medmarg.patient.model

enum class BiomarkerStatus { NORMAL, BORDERLINE, HIGH, LOW }
enum class ServiceType { LAB_TEST, SCAN_RADIOLOGY, DOCTOR_CONSULT, PHARMACY, INSURANCE }

enum class UserRole(val displayName: String, val badgeColorHex: Long) {
    PATIENT("Patient (Customer)", 0xFF006B70),
    DOCTOR("Doctor (In-Clinic OPD)", 0xFF8B5CF6),
    ADMIN("Super Admin (Central Lab)", 0xFFEF4444),
    DIAGNOSTIC_LAB("Diagnostic Lab Partner", 0xFF2563EB),
    SCAN_CENTER("Radiology & Scan Center", 0xFF06B6D4),
    PHARMACY("Generic Pharmacy Partner", 0xFF10B981),
    COLLECTION_AGENT("Collection Agent (Fleet)", 0xFFF59E0B)
}

data class UserProfile(
    val id: String,
    val name: String,
    val username: String,
    val email: String,
    val phone: String,
    val password: String = "password123",
    val role: UserRole = UserRole.PATIENT,
    val organization: String = "Air Bypass Road, Tirupati - 517501",
    val status: String = "Active",
    val createdAt: String = "30-Aug-2026",
    val avatarUrl: String = ""
)

data class CatalogItem(
    val id: String,
    val serialNo: Int? = null,
    val code: String = "",
    val name: String,
    val sampleType: String? = "SERUM",
    val fasting: String? = "NO",
    val category: String? = "General",
    val mrp: Int = 0,
    val price: Int = 0,
    val tatHours: Int? = 24,
    val description: String? = null,
    val active: Boolean? = true,
    val itemType: String? = "TEST", // "PACKAGE", "PROFILE", "TEST"
    val profiles: List<String>? = null,
    val tests: List<String>? = null,
    val testCount: Int? = null,
    val discountPercent: Int? = null,
    val tagline: String? = null,
    val popular: Boolean? = false,
    val fastingNote: String? = null,
    val sampleTypes: List<String>? = null
) {
    val isPackage: Boolean
        get() = (itemType == "PACKAGE") || id.startsWith("PKG_") || (profiles != null && profiles.isNotEmpty())

    val isProfile: Boolean
        get() = (itemType == "PROFILE") || id.startsWith("PROF_")

    val isTest: Boolean
        get() = !isPackage && !isProfile

    val displayItemType: String
        get() = when {
            isPackage -> "HEALTH PACKAGE"
            isProfile -> "DIAGNOSTIC PROFILE"
            else -> "CLINICAL TEST"
        }

    val displaySample: String
        get() = if (!sampleTypes.isNullOrEmpty()) {
            sampleTypes.joinToString(", ")
        } else {
            sampleType ?: "SERUM"
        }

    val requiresFasting: Boolean
        get() = fasting?.equals("YES", ignoreCase = true) == true

    val calculatedDiscount: Int
        get() {
            if (discountPercent != null && discountPercent > 0) return discountPercent
            if (mrp > price && mrp > 0) {
                return ((mrp - price).toDouble() / mrp.toDouble() * 100.0).toInt()
            }
            return 0
        }
}

data class CartItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val provider: String = "MedMarg Central Lab",
    val providerName: String = provider,
    val price: Int,
    val mrp: Int = price,
    val originalPrice: Int = mrp,
    val type: String = "Lab Test",
    val serviceType: ServiceType = ServiceType.LAB_TEST,
    val appointmentDate: String = "Tomorrow, 07:30 AM",
    val isHomeCollection: Boolean = true
)

data class SavedAddress(
    val id: String,
    val label: String, // Home, Work, Parents, Other
    val fullAddress: String,
    val landmark: String = "",
    val city: String = "Tirupati",
    val pincode: String = "517501",
    val lat: Double = 13.6288,
    val lng: Double = 79.4192,
    val isDefault: Boolean = false,
    val contactPhone: String = "+91 98765 43210"
)

data class FamilyMember(
    val id: String,
    val name: String,
    val relationship: String, // Self, Father, Mother, Spouse, Child
    val age: Int,
    val gender: String,
    val bloodGroup: String = "O+"
)

data class HealthMetric(
    val id: String,
    val title: String,
    val value: String,
    val unit: String,
    val recordedAt: String,
    val source: String, // Health Connect, Apple Health, Patient Entered, Lab Report
    val status: BiomarkerStatus = BiomarkerStatus.NORMAL,
    val referenceRange: String = ""
)

data class DiagnosticBooking(
    val id: String,
    val serviceName: String,
    val serviceType: String, // Lab Test, Package, Scan
    val price: Int,
    val patientName: String,
    val bookingDate: String,
    val slotTime: String,
    val address: String,
    val collectionType: String = "Home Sample Collection",
    val status: String, // Booking Confirmed, Agent Assigned, On the Way, Arrived, Sample Collected, Processing, Report Ready
    val agentName: String = "Ramesh Kumar (Phlebo AG-01)",
    val agentPhone: String = "+91 98765 55555",
    val agentLat: Double = 13.6350,
    val agentLng: Double = 79.4250,
    val etaMinutes: Int = 14,
    val coldChainTemp: Double = 4.2,
    val driveReportUrl: String? = null,
    val driveFolderId: String = "MedMarg/Laboratory Reports/2026/"
)

data class Biomarker(
    val name: String,
    val value: String,
    val unit: String,
    val referenceRange: String,
    val status: BiomarkerStatus
)

data class HealthRecord(
    val id: String,
    val title: String,
    val provider: String = "MedMarg Certified Partner Lab",
    val date: String,
    val category: String, // Laboratory, Radiology, Prescription
    val reportUrl: String = "",
    val googleDriveFileId: String? = "1AbCdEfGhIjKlMnOpQrStUv",
    val googleDrivePath: String = "MedMarg/Laboratory Reports/2026/",
    val isDriveSynced: Boolean = true,
    val biomarkers: List<Biomarker> = emptyList()
)

// Legacy & Auxiliary module support
data class LabTestPricing(
    val labId: String,
    val labName: String,
    val rating: Double,
    val reviewCount: Int,
    val isNabl: Boolean,
    val isCapAccredited: Boolean = false,
    val distanceKm: Double,
    val originalPrice: Int,
    val discountedPrice: Int,
    val tatHours: Int,
    val homeCollectionAvailable: Boolean = true,
    val homeCollectionFee: Int = 0
)

data class DiagnosticTest(
    val id: String,
    val name: String,
    val category: String,
    val sampleType: String,
    val fastingRequiredHours: Int,
    val description: String,
    val parametersCount: Int,
    val tags: List<String>,
    val labPricings: List<LabTestPricing>
)

data class ScanCenterPricing(
    val centerId: String,
    val centerName: String,
    val machineSpec: String,
    val price: Int,
    val originalPrice: Int,
    val distanceKm: Double,
    val rating: Double,
    val nextSlot: String,
    val address: String
)

data class ScanService(
    val id: String,
    val name: String,
    val modality: String,
    val bodyPart: String,
    val preparation: String,
    val durationMinutes: Int,
    val precautions: String,
    val centerPricings: List<ScanCenterPricing>
)

data class Doctor(
    val id: String,
    val name: String,
    val specialty: String,
    val experienceYears: Int,
    val qualification: String,
    val clinicOrHospital: String,
    val rating: Double,
    val reviewsCount: Int,
    val fee: Int,
    val isAvailableVideo: Boolean = true,
    val isAvailableClinic: Boolean = true,
    val nextSlot: String = "Today, 4:30 PM"
)

data class GenericAlt(
    val name: String,
    val manufacturer: String,
    val mrp: Int,
    val discountedPrice: Int,
    val savingsPercent: Int
)

data class Medicine(
    val id: String,
    val name: String,
    val composition: String,
    val manufacturer: String,
    val mrp: Int,
    val price: Int,
    val packSize: String,
    val isPrescriptionRequired: Boolean,
    val genericAlternative: GenericAlt? = null
)

data class InsurancePolicy(
    val id: String,
    val providerName: String,
    val policyNumber: String,
    val sumInsured: String,
    val validTill: String,
    val membersCovered: List<String>,
    val cashlessLabsCount: Int = 145
)

data class LabOrder(
    val orderId: String,
    val patientName: String,
    val testName: String,
    val collectionType: String,
    val status: String,
    val sampleTubeBarcode: String,
    val timeSlot: String,
    val address: String,
    val phlebotomistName: String = "Suresh Kumar"
)

data class ScanAppointment(
    val bookingId: String,
    val patientName: String,
    val scanName: String,
    val machine: String,
    val slotTime: String,
    val prepStatus: String,
    val status: String
)

data class DoctorAppointment(
    val appointmentId: String,
    val patientName: String,
    val ageGender: String,
    val reason: String,
    val slotTime: String,
    val isVideo: Boolean,
    val status: String
)

data class PharmacyOrder(
    val orderId: String,
    val patientName: String,
    val prescriptionUrl: String,
    val medicines: List<String>,
    val genericSubstituted: Boolean,
    val totalAmount: Int,
    val status: String
)
