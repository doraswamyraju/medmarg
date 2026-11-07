package com.medmarg.patient.model

data class AgentWalletData(
    val availableCashoutBalance: Int = 0,
    val totalLifetimeEarnings: Int = 0,
    val todayEarnings: Int = 0,
    val completedTripsToday: Int = 0,
    val distancePayout: Int = 0,
    val tipsBonus: Int = 0,
    val inventoryCredits: Int = 2000,
    val recentPayouts: List<AgentWalletPayoutTxn> = emptyList()
)

data class AgentWalletPayoutTxn(
    val id: String,
    val date: String,
    val amount: Int,
    val method: String = "UPI",
    val status: String = "SETTLED"
)

data class AgentProfileSummary(
    val name: String = "",
    val phone: String = "",
    val email: String = "",
    val phleboId: String = "FL-502",
    val qualification: String = "DMLT (Diploma Medical Lab Tech)",
    val zone: String = "All Zones (Open Broadcast)",
    val kycStatus: String = "APPROVED",
    val rating: Double = 5.0,
    val totalCollections: Int = 0,
    val bankAccount: String = "",
    val bankName: String = "HDFC Bank",
    val ifscCode: String = "HDFC0001824",
    val accountHolderName: String = "",
    val upiId: String = "9848022338@upi",
    val avatarUrl: String = ""
)

