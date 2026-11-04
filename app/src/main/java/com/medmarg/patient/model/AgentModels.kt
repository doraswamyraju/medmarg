package com.medmarg.patient.model

// =========================================================================
// 🛵 AGENT & FREELANCE LIVE DATA MODELS (100% LIVE BACKEND PARITY)
// Replicated 1-on-1 from iOS Models & backend /api/v1/agent/* endpoints
// =========================================================================

data class AgentPickupOrder(
    val id: String,
    val patientName: String? = null,
    val careSeekerName: String? = null,
    val phone: String? = null,
    val patientPhone: String? = null,
    val city: String? = "Tirupati",
    val address: String? = null,
    val items: String? = null,
    val totalPersons: Int? = 1,
    val selectedLabProvider: String? = null,
    val labName: String? = null,
    val amount: Int? = null,
    val totalAmount: Int? = null,
    val status: String? = "ASSIGNED", // ASSIGNED, ENROUTE, ARRIVED, KIT_ASSIGNED, SAMPLE_COLLECTED, DELIVERED, COMPLETED
    val assignedAgent: String? = null,
    val phleboName: String? = null,
    val phleboPhone: String? = null,
    val phleboRating: String? = null,
    val otp: String? = null,
    val handoverOtp: String? = null,
    val slot: String? = null,
    val date: String? = null,
    val eta: String? = "15 mins",
    val tempTelemetry: String? = "4.2°C",
    val paymentMode: String? = null,
    val paymentStatus: String? = "PENDING", // PENDING, PAID_SUCCESS, PAID_DOORSTEP_QR, PAID_ONLINE, CASH_COLLECTED
    val barcode: String? = null,
    val arrivalPhoto: String? = null,
    val samplePhotos: List<String>? = null,
    val reviewRequestSent: Boolean? = false,
    val reviewStatus: String? = null,
    val phleboVitals: PhleboVitalsRecord? = null,
    val kitAssigned: Boolean? = false,
    val kitNotRequired: Boolean? = false,
    val tripStartedAt: String? = null,
    val transactionId: String? = null,
    val paymentNotes: String? = null
) {
    val effectivePatientName: String
        get() = patientName?.ifEmpty { null } ?: careSeekerName?.ifEmpty { null } ?: "Care Seeker"

    val effectivePhone: String
        get() = phone?.ifEmpty { null } ?: patientPhone?.ifEmpty { null } ?: "+91 98765 43210"

    val effectiveAmount: Int
        get() = amount ?: totalAmount ?: 0

    val isPaid: Boolean
        get() = paymentStatus == "PAID_SUCCESS" ||
            paymentStatus == "PAID_DOORSTEP_QR" ||
            paymentStatus == "PAID_ONLINE" ||
            paymentStatus == "CASH_COLLECTED" ||
            paymentStatus == "PAID" ||
            (paymentMode == "ONLINE" && paymentStatus != "FAILED")
}

data class PhleboVitalsRecord(
    val recordedAt: String? = null,
    val bp: String? = null,
    val pulse: String? = null,
    val spo2: String? = null,
    val sugar: String? = null,
    val temp: String? = null,
    val notes: String? = null
)

data class AgentInventoryItem(
    val id: String,
    val name: String,
    val code: String,
    val stock: Int,
    val unit: String = "Pcs",
    val minThreshold: Int? = 5,
    val category: String = "Consumables"
)

data class AgentInventoryDetailItem(
    val id: String,
    val name: String,
    val code: String,
    val category: String,
    val unit: String,
    val stock: Int,
    val maxCapacity: Int,
    val subtitle: String,
    val tubeColor: String // "purple", "red", "grey", "yellow", "blue", "green"
)

data class AgentWarehouseStockItem(
    val code: String,
    val name: String,
    val type: String? = "TUBE",
    val category: String? = "Phlebotomy",
    val stock: Int,
    val unit: String = "Pcs",
    val unitCost: Int? = 5
)

data class AgentIndentItem(
    val id: String,
    val agentType: String? = "Salaried",
    val agentName: String? = null,
    val area: String? = "Tirupati Central",
    val requestedItems: String,
    val status: String = "PENDING", // PENDING, APPROVED, DISPATCHED, REJECTED
    val date: String? = null,
    val paymentMode: String? = null
)

data class AgentQuotaStats(
    val agentId: String? = "AG-01",
    val name: String? = "Ramesh Kumar",
    val samplesToday: Int? = 0,
    val maxDailyQuota: Int? = 12,
    val quotaRemaining: Int? = 12,
    val rating: Double? = 4.9,
    val zone: String? = "Tirupati Hub",
    val onTimeRate: String? = "96%",
    val fastingAccuracy: String? = "100%",
    val earningsToday: Int? = 0,
    val completedToday: Int? = 0,
    val targetToday: Int? = 10,
    val pendingToday: Int? = 0,
    val incentivesEarned: Int? = 0
)

data class AgentLiveProfileData(
    val id: String = "AG-01",
    val name: String = "Ramesh Kumar",
    val phleboId: String? = "AP-PMC-89102",
    val phone: String? = null,
    val email: String? = null,
    val avatarUrl: String? = null,
    val gender: String? = "Male",
    val age: Int? = 34,
    val certification: String? = "Certified Phlebotomist (NABL Guidelines)",
    val vaccinationStatus: String? = "Double Vaccinated",
    val experience: String? = "3+ Years",
    val zone: String? = "Tirupati Urban & Bypass (Zone 1)",
    val bankAccount: String? = "HDFC Bank • **** 4321",
    val upiId: String? = "ramesh.kumar@hdfcbank",
    val paymentCycle: String? = "Weekly (Every Monday)",
    val rating: Double? = 4.9,
    val totalCollections: Int? = 1,
    val documents: List<AgentProfileDocumentItem>? = emptyList()
)

data class AgentProfileDocumentItem(
    val title: String,
    val issuer: String,
    val verified: Boolean = true
)

data class OrderedTestDisplayItem(
    val name: String,
    val category: String,
    val testsCount: Int,
    val sampleType: String,
    val fasting: String,
    val tat: String,
    val mrp: Int,
    val offerPrice: Int,
    val profiles: List<String>
)

data class TubeBarcodeItem(
    val id: String,
    val name: String,
    val tubeType: String,
    val capColorHex: Long,
    val barcode: String = "",
    val isScanned: Boolean = false
)

data class AgentPaymentTxn(
    val id: String,
    val orderId: String? = null,
    val patientName: String? = null,
    val phone: String? = null,
    val amount: Int? = 0,
    val paymentMode: String? = "DOORSTEP_QR",
    val paymentStatus: String? = "PAID_SUCCESS",
    val date: String? = null,
    val razorpayPaymentId: String? = null
)

data class FreelanceBroadcastJobItem(
    val id: String,
    val patientName: String? = "Care Seeker",
    val age: String? = "45 Yrs",
    val timeSlot: String? = "07:30 AM - 08:30 AM",
    val address: String? = "Srinivas Nagar, Tirupati",
    val phone: String? = "+91 98765 43210",
    val tests: String? = "Complete Blood Count + Lipid Profile",
    val tubes: List<String>? = listOf("EDTA", "SST"),
    val payout: Int? = 350,
    val distance: String? = "2.4 km",
    val fastingRequired: Boolean? = true,
    val urgency: String? = "FASTING"
) {
    val effectivePayout: Int
        get() = payout ?: 350
}

data class FreelanceWalletSummary(
    val availableBalance: Int = 4250,
    val totalLifetimeEarnings: Int = 28400,
    val pendingPayouts: Int = 0,
    val completedGigs: Int = 48,
    val upiId: String = "vikram.mlt@oksbi",
    val bankAccountNumber: String = "XXXX XXXX 8921",
    val bankIfsc: String = "SBIN0001234",
    val bankHolderName: String = "Vikram Reddy"
)

data class FreelancePayoutRequest(
    val id: String,
    val amount: Int,
    val status: String = "PROCESSED", // PENDING, PROCESSED, IN_REVIEW
    val date: String,
    val upiId: String,
    val transactionRef: String? = null
)
