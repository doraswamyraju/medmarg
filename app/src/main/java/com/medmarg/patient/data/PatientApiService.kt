package com.medmarg.patient.data

import com.medmarg.patient.model.Biomarker
import com.medmarg.patient.model.BiomarkerStatus
import com.medmarg.patient.model.HealthRecord
import com.medmarg.patient.model.UserProfile
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class LiveOrderTestItem(
    val code: String,
    val name: String,
    val price: Int,
    val sampleType: String = "SERUM"
)

data class LivePatientOrder(
    val id: String,
    val patientName: String,
    val phone: String,
    val email: String = "",
    val beneficiaryRelation: String = "Self",
    val address: String,
    val slot: String,
    val date: String,
    val status: String, // PENDING_DISPATCH, ASSIGNED, ENROUTE, SAMPLE_COLLECTED, IN_LAB, COMPLETED, CANCELLED
    val tests: List<LiveOrderTestItem>,
    val totalAmount: Int,
    val paymentMode: String, // ONLINE_PREPAID, PAY_AT_DOORSTEP
    val paymentStatus: String, // PAID, PENDING_DOORSTEP
    val labName: String,
    val otp: String,
    val assignedAgentName: String,
    val assignedAgentPhone: String = "+91 98765 55555",
    val isExpress60Min: Boolean = false
) {
    val isActive: Boolean
        get() = status.uppercase() !in listOf("COMPLETED", "CANCELLED")
}

data class RazorpayOrderInfo(
    val orderId: String,
    val keyId: String,
    val amountPaise: Int,
    val currency: String = "INR",
    val paymentUrl: String = ""
)

data class BookingResult(
    val order: LivePatientOrder,
    val orderAccessToken: String = ""
)

data class NativeVerificationResult(
    val success: Boolean,
    val verified: Boolean,
    val paymentStatus: String,
    val paymentId: String?,
    val errorMessage: String? = null
)

data class SwitchToHostedResult(
    val success: Boolean,
    val alreadyPaid: Boolean,
    val paymentStatus: String = "",
    val paymentId: String? = null,
    val paymentUrl: String = "",
    val paymentLinkId: String = "",
    val errorMessage: String? = null
)

data class OrderStatusResult(
    val success: Boolean,
    val orderId: String,
    val isPaid: Boolean,
    val paymentStatus: String,
    val paymentMode: String,
    val paymentId: String? = null,
    val amount: Int = 0,
    val errorMessage: String? = null
)

object PatientApiService {
    private const val BASE_URL = "https://medmarg.com/api/v1"

    private fun cleanDigits(str: String): String = str.filter { it.isDigit() }

    /**
     * Fetches live orders from https://medmarg.com/api/v1/patient/orders
     * Filtered specifically to the logged-in patient's phone, email, or name.
     */
    suspend fun fetchPatientOrders(user: UserProfile?): List<LivePatientOrder> = withContext(Dispatchers.IO) {
        if (user == null) return@withContext emptyList()
        try {
            val url = URL("$BASE_URL/patient/orders")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "GET"
            conn.connectTimeout = 7000
            conn.readTimeout = 7000

            if (conn.responseCode !in 200..299) return@withContext emptyList()
            val bodyStr = conn.inputStream.bufferedReader().use { it.readText() }
            val json = JSONObject(bodyStr)
            val arr = json.optJSONArray("data") ?: return@withContext emptyList()

            val myPhoneDigits = cleanDigits(user.phone).takeLast(10)
            val myNameLower = user.name.trim().lowercase()
            val myEmailLower = user.email.trim().lowercase()

            val result = mutableListOf<LivePatientOrder>()
            for (i in 0 until arr.length()) {
                val obj = arr.optJSONObject(i) ?: continue
                val orderPhone = obj.optString("phone", "")
                val orderPhoneDigits = cleanDigits(orderPhone).takeLast(10)
                val orderPatientName = obj.optString("patientName", "").trim()
                val orderEmail = obj.optString("email", "").trim().lowercase()

                val matchesPhone = myPhoneDigits.length == 10 && orderPhoneDigits == myPhoneDigits
                val matchesEmail = myEmailLower.isNotEmpty() && orderEmail == myEmailLower
                val matchesName = myNameLower.isNotEmpty() && (
                    orderPatientName.lowercase() == myNameLower ||
                        orderPatientName.lowercase().contains(myNameLower)
                    )

                if (!matchesPhone && !matchesEmail && !matchesName) continue

                val testsArr = obj.optJSONArray("tests") ?: JSONArray()
                val parsedTests = mutableListOf<LiveOrderTestItem>()
                for (tIdx in 0 until testsArr.length()) {
                    val tObj = testsArr.optJSONObject(tIdx)
                    if (tObj != null) {
                        parsedTests.add(
                            LiveOrderTestItem(
                                code = tObj.optString("code", "TEST-${tIdx + 1}"),
                                name = tObj.optString("name", "Diagnostic Test"),
                                price = tObj.optInt("price", 0),
                                sampleType = tObj.optString("sampleType", "SERUM")
                            )
                        )
                    } else {
                        val tStr = testsArr.optString(tIdx, "Diagnostic Test")
                        parsedTests.add(LiveOrderTestItem("TEST", tStr, 0))
                    }
                }

                result.add(
                    LivePatientOrder(
                        id = obj.optString("id", "MM-ORD-$i"),
                        patientName = orderPatientName.ifEmpty { user.name },
                        phone = orderPhone.ifEmpty { user.phone },
                        email = orderEmail.ifEmpty { user.email },
                        beneficiaryRelation = obj.optString("beneficiaryRelation", "Self"),
                        address = obj.optString("address", user.organization),
                        slot = obj.optString("slot", "07:00 AM - 08:00 AM"),
                        date = obj.optString("date", "Today"),
                        status = obj.optString("status", "PENDING_DISPATCH"),
                        tests = parsedTests,
                        totalAmount = obj.optInt("totalAmount", parsedTests.sumOf { it.price }),
                        paymentMode = obj.optString("paymentMode", "PAY_AT_DOORSTEP"),
                        paymentStatus = obj.optString("paymentStatus", "PENDING_DOORSTEP"),
                        labName = obj.optString("labName", "MedMarg Accredited Partner Lab"),
                        otp = obj.optString("otp", "4829"),
                        assignedAgentName = obj.optString("assignedAgentName", "Awaiting Phlebotomist Assignment"),
                        assignedAgentPhone = obj.optString("assignedAgentPhone", "+91 98765 55555"),
                        isExpress60Min = obj.optBoolean("isExpress60Min", false)
                    )
                )
            }
            result
        } catch (e: Exception) {
            emptyList()
        }
    }

    /**
     * Creates a live Razorpay order via POST https://medmarg.com/api/v1/payments/create-order
     */
    suspend fun createRazorpayOrder(
        amountInRupees: Int,
        patientName: String,
        patientPhone: String
    ): RazorpayOrderInfo? = withContext(Dispatchers.IO) {
        try {
            val url = URL("$BASE_URL/payments/create-order")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.connectTimeout = 8000
            conn.readTimeout = 8000
            conn.doOutput = true

            val payload = JSONObject().apply {
                put("amount", amountInRupees)
                put("currency", "INR")
                put("receipt", "MM-ANDROID-${System.currentTimeMillis()}")
                put(
                    "notes",
                    JSONObject().apply {
                        put("patientName", patientName)
                        put("phone", patientPhone)
                        put("platform", "Android")
                    }
                )
            }

            conn.outputStream.use { it.write(payload.toString().toByteArray()) }

            if (conn.responseCode in 200..299) {
                val contentType = conn.contentType ?: ""
                val respStr = conn.inputStream.bufferedReader().use { it.readText() }
                if (contentType.contains("application/json", ignoreCase = true) || respStr.trim().startsWith("{")) {
                    val json = JSONObject(respStr)
                    if (json.optBoolean("success", false)) {
                        val dataObj = json.optJSONObject("data")
                        val orderId = dataObj?.optString("orderId", "")?.ifEmpty { null }
                            ?: json.optString("order_id", "")
                        val keyId = dataObj?.optString("keyId", "")?.ifEmpty { null }
                            ?: json.optString("key_id", "rzp_live_Tno7dmuqnwn1YS")
                        val amountPaise = dataObj?.optInt("amount", 0)?.takeIf { it > 0 }
                            ?: json.optInt("amount", amountInRupees * 100)
                        val paymentUrl = dataObj?.optString("paymentUrl", "") ?: ""

                        return@withContext RazorpayOrderInfo(
                            orderId = orderId,
                            keyId = if (keyId.isNotEmpty()) keyId else "rzp_live_Tno7dmuqnwn1YS",
                            amountPaise = if (amountPaise > 0) amountPaise else amountInRupees * 100,
                            paymentUrl = paymentUrl
                        )
                    }
                }
            }
            null
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Books a new diagnostic order on the live MedMarg backend via POST /api/v1/patient/orders/book
     */
    suspend fun bookPatientOrder(
        patientName: String,
        phone: String,
        email: String,
        beneficiaryRelation: String,
        address: String,
        slot: String,
        date: String,
        tests: List<LiveOrderTestItem>,
        totalAmount: Int,
        paymentMode: String,
        paymentId: String?,
        labName: String,
        isExpress60Min: Boolean
    ): LivePatientOrder? = withContext(Dispatchers.IO) {
        try {
            val url = URL("$BASE_URL/patient/orders/book")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.connectTimeout = 8000
            conn.readTimeout = 8000
            conn.doOutput = true

            val testsJson = JSONArray()
            tests.forEach { t ->
                testsJson.put(
                    JSONObject().apply {
                        put("code", t.code)
                        put("name", t.name)
                        put("price", t.price)
                        put("sampleType", t.sampleType)
                    }
                )
            }

            val payload = JSONObject().apply {
                put("patientName", patientName)
                put("phone", phone)
                put("email", email)
                put("beneficiaryRelation", beneficiaryRelation)
                put("address", address)
                put("slot", slot)
                put("date", date)
                put("tests", testsJson)
                put("totalAmount", totalAmount)
                put("paymentMode", paymentMode)
                if (!paymentId.isNullOrEmpty()) {
                    put("razorpayPaymentId", paymentId)
                }
                put("labName", labName)
                put("isExpress60Min", isExpress60Min)
            }

            conn.outputStream.use { it.write(payload.toString().toByteArray()) }

            if (conn.responseCode in 200..299) {
                val respStr = conn.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(respStr)
                val orderObj = json.optJSONObject("order") ?: json.optJSONObject("data")
                val orderId = orderObj?.optString("id") ?: "MM-${(10000..99999).random()}"
                val otp = orderObj?.optString("otp") ?: "${(1000..9999).random()}"
                return@withContext LivePatientOrder(
                    id = orderId,
                    patientName = patientName,
                    phone = phone,
                    email = email,
                    beneficiaryRelation = beneficiaryRelation,
                    address = address,
                    slot = slot,
                    date = date,
                    status = orderObj?.optString("status") ?: "PENDING_DISPATCH",
                    tests = tests,
                    totalAmount = totalAmount,
                    paymentMode = paymentMode,
                    paymentStatus = if (paymentMode == "ONLINE_PREPAID") "PAID" else "PENDING_DOORSTEP",
                    labName = labName,
                    otp = otp,
                    assignedAgentName = orderObj?.optString("assignedAgentName") ?: "Awaiting Phlebotomist Assignment",
                    isExpress60Min = isExpress60Min
                )
            }
            null
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Books an order and captures both the created order and its secret per-order access token.
     */
    suspend fun bookPatientOrderWithToken(
        patientName: String,
        phone: String,
        email: String,
        beneficiaryRelation: String,
        address: String,
        slot: String,
        date: String,
        tests: List<LiveOrderTestItem>,
        totalAmount: Int,
        paymentMode: String,
        paymentId: String?,
        labName: String,
        isExpress60Min: Boolean
    ): BookingResult? = withContext(Dispatchers.IO) {
        try {
            val url = URL("$BASE_URL/patient/orders/book")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.connectTimeout = 8000
            conn.readTimeout = 8000
            conn.doOutput = true

            val testsJson = JSONArray()
            tests.forEach { t ->
                testsJson.put(
                    JSONObject().apply {
                        put("code", t.code)
                        put("name", t.name)
                        put("price", t.price)
                        put("sampleType", t.sampleType)
                    }
                )
            }

            val payload = JSONObject().apply {
                put("patientName", patientName)
                put("phone", phone)
                put("email", email)
                put("beneficiaryRelation", beneficiaryRelation)
                put("address", address)
                put("slot", slot)
                put("date", date)
                put("tests", testsJson)
                put("totalAmount", totalAmount)
                put("paymentMode", paymentMode)
                if (!paymentId.isNullOrEmpty()) {
                    put("paymentStatus", "PAID_SUCCESS")
                    put("razorpayPaymentId", paymentId)
                }
                put("labName", labName)
                put("isExpress60Min", isExpress60Min)
            }

            conn.outputStream.use { it.write(payload.toString().toByteArray()) }

            if (conn.responseCode in 200..299) {
                val contentType = conn.contentType ?: ""
                val respStr = conn.inputStream.bufferedReader().use { it.readText() }
                if (!contentType.contains("application/json", ignoreCase = true) && !respStr.trim().startsWith("{")) {
                    return@withContext null
                }
                val json = try { JSONObject(respStr) } catch (_: Exception) { return@withContext null }
                val orderObj = json.optJSONObject("order") ?: json.optJSONObject("data")
                val orderAccessToken = json.optString("orderAccessToken", "")
                val orderId = orderObj?.optString("id") ?: "MM-${(10000..99999).random()}"
                val otp = orderObj?.optString("otp") ?: "${(1000..9999).random()}"
                val order = LivePatientOrder(
                    id = orderId,
                    patientName = patientName,
                    phone = phone,
                    email = email,
                    beneficiaryRelation = beneficiaryRelation,
                    address = address,
                    slot = slot,
                    date = date,
                    status = orderObj?.optString("status") ?: "PENDING_DISPATCH",
                    tests = tests,
                    totalAmount = totalAmount,
                    paymentMode = paymentMode,
                    paymentStatus = if (paymentMode == "ONLINE_PREPAID") "PENDING_ONLINE" else "PENDING_DOORSTEP",
                    labName = labName,
                    otp = otp,
                    assignedAgentName = orderObj?.optString("assignedAgentName") ?: "Awaiting Phlebotomist Assignment",
                    isExpress60Min = isExpress60Min
                )
                return@withContext BookingResult(order = order, orderAccessToken = orderAccessToken)
            }
            null
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Authoritatively verifies Native Razorpay payment on MedMarg backend.
     */
    suspend fun verifyNativePayment(
        orderId: String,
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        orderAccessToken: String
    ): NativeVerificationResult = withContext(Dispatchers.IO) {
        try {
            val url = URL("$BASE_URL/payments/verify-native")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            if (orderAccessToken.isNotEmpty()) {
                conn.setRequestProperty("x-order-token", orderAccessToken)
            }
            conn.connectTimeout = 8000
            conn.readTimeout = 8000
            conn.doOutput = true

            val payload = JSONObject().apply {
                put("orderId", orderId)
                put("razorpayOrderId", razorpayOrderId)
                put("razorpayPaymentId", razorpayPaymentId)
                put("razorpaySignature", razorpaySignature)
            }

            conn.outputStream.use { it.write(payload.toString().toByteArray()) }

            val stream = if (conn.responseCode in 200..299) conn.inputStream else conn.errorStream
            val contentType = conn.contentType ?: ""
            val respStr = stream?.bufferedReader()?.use { it.readText() } ?: "{}"

            // Validate that server returned JSON rather than HTML error page
            val json = if (contentType.contains("application/json", ignoreCase = true) || respStr.trim().startsWith("{")) {
                try {
                    JSONObject(respStr)
                } catch (e: Exception) {
                    JSONObject()
                }
            } else {
                JSONObject().apply {
                    put("success", false)
                    put("error", "Server returned non-JSON response (${conn.responseCode})")
                }
            }

            if (conn.responseCode in 200..299 && json.optBoolean("success", false)) {
                NativeVerificationResult(
                    success = true,
                    verified = json.optBoolean("verified", false),
                    paymentStatus = json.optString("paymentStatus", "PAID_SUCCESS"),
                    paymentId = json.optString("paymentId").ifEmpty { null }
                )
            } else {
                NativeVerificationResult(
                    success = false,
                    verified = false,
                    paymentStatus = json.optString("paymentStatus", "FAILED"),
                    paymentId = null,
                    errorMessage = json.optString("message", json.optString("error", "Verification rejected (${conn.responseCode})"))
                )
            }
        } catch (e: Exception) {
            NativeVerificationResult(
                success = false,
                verified = false,
                paymentStatus = "NETWORK_ERROR",
                paymentId = null,
                errorMessage = e.message ?: "Network error during verification"
            )
        }
    }

    /**
     * Safely checks prior payment attempts and switches to hosted checkout without duplicate payments.
     */
    suspend fun switchToHostedCheckout(
        orderId: String,
        patientName: String,
        patientPhone: String,
        orderAccessToken: String
    ): SwitchToHostedResult = withContext(Dispatchers.IO) {
        try {
            val url = URL("$BASE_URL/payments/switch-to-hosted")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            if (orderAccessToken.isNotEmpty()) {
                conn.setRequestProperty("x-order-token", orderAccessToken)
            }
            conn.connectTimeout = 8000
            conn.readTimeout = 8000
            conn.doOutput = true

            val payload = JSONObject().apply {
                put("orderId", orderId)
                put("patientName", patientName)
                put("patientPhone", patientPhone)
            }

            conn.outputStream.use { it.write(payload.toString().toByteArray()) }

            val stream = if (conn.responseCode in 200..299) conn.inputStream else conn.errorStream
            val contentType = conn.contentType ?: ""
            val respStr = stream?.bufferedReader()?.use { it.readText() } ?: "{}"

            // Safely validate and parse JSON response, avoiding crash on HTML error pages
            val json = if (contentType.contains("application/json", ignoreCase = true) || respStr.trim().startsWith("{")) {
                try {
                    JSONObject(respStr)
                } catch (_: Exception) {
                    JSONObject()
                }
            } else {
                JSONObject().apply {
                    put("success", false)
                    put("error", "Gateway endpoint unavailable (${conn.responseCode})")
                }
            }

            if (conn.responseCode in 200..299 && json.optBoolean("success", false)) {
                SwitchToHostedResult(
                    success = true,
                    alreadyPaid = json.optBoolean("alreadyPaid", false),
                    paymentStatus = json.optString("paymentStatus", ""),
                    paymentId = json.optString("paymentId").ifEmpty { null },
                    paymentUrl = json.optString("paymentUrl", ""),
                    paymentLinkId = json.optString("paymentLinkId", "")
                )
            } else {
                SwitchToHostedResult(
                    success = false,
                    alreadyPaid = false,
                    errorMessage = json.optString("message", json.optString("error", "Switch request failed (${conn.responseCode})"))
                )
            }
        } catch (e: Exception) {
            SwitchToHostedResult(
                success = false,
                alreadyPaid = false,
                errorMessage = e.message ?: "Network error during gateway switch"
            )
        }
    }

    /**
     * Authoritatively checks live order payment status on MedMarg backend.
     */
    suspend fun verifyOrderStatus(
        orderId: String,
        orderAccessToken: String
    ): OrderStatusResult = withContext(Dispatchers.IO) {
        try {
            val url = URL("$BASE_URL/payments/order-status/$orderId")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "GET"
            if (orderAccessToken.isNotEmpty()) {
                conn.setRequestProperty("x-order-token", orderAccessToken)
            }
            conn.connectTimeout = 7000
            conn.readTimeout = 7000

            val stream = if (conn.responseCode in 200..299) conn.inputStream else conn.errorStream
            val contentType = conn.contentType ?: ""
            val respStr = stream?.bufferedReader()?.use { it.readText() } ?: "{}"

            // Safely validate and parse JSON response, avoiding crash on HTML error pages
            val json = if (contentType.contains("application/json", ignoreCase = true) || respStr.trim().startsWith("{")) {
                try {
                    JSONObject(respStr)
                } catch (_: Exception) {
                    JSONObject()
                }
            } else {
                JSONObject().apply {
                    put("success", false)
                    put("error", "Status service unavailable (${conn.responseCode})")
                }
            }

            if (conn.responseCode in 200..299 && json.optBoolean("success", false)) {
                OrderStatusResult(
                    success = true,
                    orderId = json.optString("orderId", orderId),
                    isPaid = json.optBoolean("isPaid", false),
                    paymentStatus = json.optString("paymentStatus", "PENDING"),
                    paymentMode = json.optString("paymentMode", "ONLINE_PREPAID"),
                    paymentId = json.optString("paymentId").ifEmpty { null },
                    amount = json.optInt("amount", 0)
                )
            } else {
                OrderStatusResult(
                    success = false,
                    orderId = orderId,
                    isPaid = false,
                    paymentStatus = "FAILED",
                    paymentMode = "",
                    paymentId = null,
                    errorMessage = json.optString("error", json.optString("message", "Status lookup failed (${conn.responseCode})"))
                )
            }
        } catch (e: Exception) {
            OrderStatusResult(
                success = false,
                orderId = orderId,
                isPaid = false,
                paymentStatus = "NETWORK_ERROR",
                paymentMode = "",
                paymentId = null,
                errorMessage = e.message ?: "Network error"
            )
        }
    }

    /**
     * Fetches live diagnostic reports from GET https://medmarg.com/api/v1/patient/reports
     * Filtered for the logged-in patient.
     */
    suspend fun fetchPatientReports(user: UserProfile?): List<HealthRecord> = withContext(Dispatchers.IO) {
        if (user == null) return@withContext emptyList()
        try {
            val url = URL("$BASE_URL/patient/reports")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "GET"
            conn.connectTimeout = 7000
            conn.readTimeout = 7000

            if (conn.responseCode !in 200..299) return@withContext emptyList()
            val bodyStr = conn.inputStream.bufferedReader().use { it.readText() }
            val json = JSONObject(bodyStr)
            val arr = json.optJSONArray("data") ?: return@withContext emptyList()

            val myPhoneDigits = cleanDigits(user.phone).takeLast(10)
            val myNameLower = user.name.trim().lowercase()
            val myEmailLower = user.email.trim().lowercase()

            val records = mutableListOf<HealthRecord>()
            for (i in 0 until arr.length()) {
                val obj = arr.optJSONObject(i) ?: continue
                val repPhoneDigits = cleanDigits(obj.optString("phone", "")).takeLast(10)
                val repName = obj.optString("patientName", "").trim().lowercase()
                val repEmail = obj.optString("email", "").trim().lowercase()

                val matchesPhone = myPhoneDigits.length == 10 && repPhoneDigits == myPhoneDigits
                val matchesName = myNameLower.isNotEmpty() && (repName == myNameLower || repName.contains(myNameLower))
                val matchesEmail = myEmailLower.isNotEmpty() && repEmail == myEmailLower

                if (!matchesPhone && !matchesName && !matchesEmail) continue

                val paramsArr = obj.optJSONArray("parameters") ?: obj.optJSONArray("biomarkers") ?: JSONArray()
                val biomarkers = mutableListOf<Biomarker>()
                for (pIdx in 0 until paramsArr.length()) {
                    val pObj = paramsArr.optJSONObject(pIdx) ?: continue
                    val flagStr = pObj.optString("flag", pObj.optString("status", "NORMAL")).uppercase()
                    val status = when {
                        flagStr.contains("HIGH") -> BiomarkerStatus.HIGH
                        flagStr.contains("LOW") -> BiomarkerStatus.LOW
                        flagStr.contains("BORDER") || flagStr.contains("ABNORMAL") -> BiomarkerStatus.BORDERLINE
                        else -> BiomarkerStatus.NORMAL
                    }
                    biomarkers.add(
                        Biomarker(
                            name = pObj.optString("name", "Parameter"),
                            value = pObj.optString("value", "-"),
                            unit = pObj.optString("unit", ""),
                            referenceRange = pObj.optString("range", pObj.optString("referenceRange", "")),
                            status = status
                        )
                    )
                }

                records.add(
                    HealthRecord(
                        id = obj.optString("id", "REP-${i + 1}"),
                        title = obj.optString("testName", obj.optString("title", "Diagnostic Report")),
                        provider = obj.optString("labName", obj.optString("provider", "MedMarg Accredited Partner Lab")),
                        date = obj.optString("date", "Recent"),
                        category = obj.optString("category", "Pathology"),
                        reportUrl = obj.optString("pdfUrl", obj.optString("reportUrl", "https://medmarg.com")),
                        googleDrivePath = "MedMarg/Laboratory Reports/${obj.optString("id", "Report")}.pdf",
                        biomarkers = biomarkers
                    )
                )
            }
            records
        } catch (e: Exception) {
            emptyList()
        }
    }
}

