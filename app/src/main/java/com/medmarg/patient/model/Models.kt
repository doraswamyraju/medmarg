package com.medmarg.patient.model

enum class BiomarkerStatus { NORMAL, BORDERLINE, HIGH, LOW }
enum class ServiceType { LAB_TEST, SCAN_RADIOLOGY, DOCTOR_CONSULT, PHARMACY, INSURANCE }

enum class UserRole(val displayName: String, val badgeColorHex: Long) {
    PATIENT("Patient", 0xFF006B70),
    DIAGNOSTIC_LAB("Diagnostic Lab Partner", 0xFF2563EB),
    SCAN_CENTER("Radiology & Scan Center", 0xFF06B6D4),
    DOCTOR("Doctor / Consultant", 0xFF8B5CF6),
    PHARMACY("Pharmacy Partner", 0xFF10B981),
    SUPER_ADMIN("MedMarg Admin", 0xFFEF4444)
}

data class UserProfile(
    val id: String,
    val name: String,
    val phone: String,
    val email: String,
    val activeRole: UserRole,
    val availableRoles: List<UserRole> = listOf(activeRole),
    val organizationName: String = "",
    val accreditationNumber: String = "",
    val avatarUrl: String = ""
)

data class LabOrder(
    val orderId: String,
    val patientName: String,
    val testName: String,
    val collectionType: String, // Home Collection / Walk-in
    val status: String, // Assigned, Collected, Analyzing, Report Ready
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
    val prepStatus: String, // Fasting verified / Metal check done
    val status: String // Scheduled / In-Progress / Report Uploaded
)

data class DoctorAppointment(
    val appointmentId: String,
    val patientName: String,
    val ageGender: String,
    val reason: String,
    val slotTime: String,
    val isVideo: Boolean,
    val status: String // Waiting / In-Consult / Completed
)

data class PharmacyOrder(
    val orderId: String,
    val patientName: String,
    val prescriptionUrl: String,
    val medicines: List<String>,
    val genericSubstituted: Boolean,
    val totalAmount: Int,
    val status: String // Rx Verified / Packed / Dispatched
)

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
    val sampleType: String, // Blood, Urine, etc.
    val fastingRequiredHours: Int, // 0 if no fasting
    val description: String,
    val parametersCount: Int,
    val tags: List<String>,
    val labPricings: List<LabTestPricing>
)

data class ScanCenterPricing(
    val centerId: String,
    val centerName: String,
    val machineSpec: String, // e.g. "3.0 Tesla Silent MRI", "128-Slice High Speed CT"
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
    val modality: String, // MRI, CT, Ultrasound, X-Ray, PET-CT, Dexa
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
    val provider: String,
    val date: String,
    val category: String,
    val reportUrl: String = "",
    val biomarkers: List<Biomarker> = emptyList()
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

data class CartItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val providerName: String,
    val price: Int,
    val originalPrice: Int,
    val serviceType: ServiceType,
    val appointmentDate: String = "Tomorrow, 8:00 AM",
    val isHomeCollection: Boolean = true
)
