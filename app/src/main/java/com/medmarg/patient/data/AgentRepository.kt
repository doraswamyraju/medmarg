package com.medmarg.patient.data

import com.medmarg.patient.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

// =========================================================================
// 🌐 AGENT & FREELANCE LIVE API REPOSITORY (100% LIVE BACKEND PARITY)
// Direct parity with iOS Agent Network Service -> https://medmarg.com/api/v1/agent/*
// =========================================================================

object AgentRepository {
    private const val BASE_URL = "https://medmarg.com"

    private fun makeGetRequest(endpoint: String): String? {
        var conn: HttpURLConnection? = null
        return try {
            val url = URL(if (endpoint.startsWith("http")) endpoint else "$BASE_URL$endpoint")
            conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "GET"
            conn.connectTimeout = 8000
            conn.readTimeout = 8000
            conn.setRequestProperty("Accept", "application/json")

            if (conn.responseCode in 200..299) {
                val reader = BufferedReader(InputStreamReader(conn.inputStream))
                val sb = StringBuilder()
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    sb.append(line)
                }
                reader.close()
                sb.toString()
            } else {
                null
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            conn?.disconnect()
        }
    }

    private fun makePostRequest(endpoint: String, jsonBody: JSONObject): String? {
        var conn: HttpURLConnection? = null
        return try {
            val url = URL(if (endpoint.startsWith("http")) endpoint else "$BASE_URL$endpoint")
            conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.connectTimeout = 8000
            conn.readTimeout = 8000
            conn.doOutput = true
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
            conn.setRequestProperty("Accept", "application/json")

            val writer = OutputStreamWriter(conn.outputStream, "UTF-8")
            writer.write(jsonBody.toString())
            writer.flush()
            writer.close()

            if (conn.responseCode in 200..299) {
                val reader = BufferedReader(InputStreamReader(conn.inputStream))
                val sb = StringBuilder()
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    sb.append(line)
                }
                reader.close()
                sb.toString()
            } else {
                null
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            conn?.disconnect()
        }
    }

    // 1. Fetch Agent Roster (Salaried or Freelance)
    suspend fun fetchRoster(agentId: String): List<AgentPickupOrder> = withContext(Dispatchers.IO) {
        val jsonStr = makeGetRequest("/api/v1/agent/roster?agentId=$agentId")
        val result = mutableListOf<AgentPickupOrder>()
        if (jsonStr != null) {
            try {
                val root = JSONObject(jsonStr)
                val rosterArr = root.optJSONArray("roster") ?: JSONArray()
                for (i in 0 until rosterArr.length()) {
                    val o = rosterArr.getJSONObject(i)
                    result.add(parseOrder(o))
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        result
    }

    // 2. Update Pickup Status (START_TRIP, ARRIVE, COLLECT_SAMPLE, HANDOVER, etc.)
    suspend fun updatePickupStatus(
        orderId: String,
        status: String,
        barcode: String? = null,
        vitals: PhleboVitalsRecord? = null,
        paymentCollected: Boolean = false,
        paymentMode: String? = null,
        notes: String? = null
    ): Boolean = withContext(Dispatchers.IO) {
        val payload = JSONObject().apply {
            put("orderId", orderId)
            put("status", status)
            if (barcode != null) put("barcode", barcode)
            if (paymentMode != null) put("paymentMode", paymentMode)
            if (paymentCollected) put("paymentCollected", true)
            if (notes != null) put("notes", notes)
            if (vitals != null) {
                put("phleboVitals", JSONObject().apply {
                    put("bp", vitals.bp ?: "")
                    put("pulse", vitals.pulse ?: "")
                    put("spo2", vitals.spo2 ?: "")
                    put("sugar", vitals.sugar ?: "")
                    put("temp", vitals.temp ?: "")
                })
            }
        }
        val res = makePostRequest("/api/v1/agent/pickup/update", payload)
        res != null
    }

    // 3. Fetch Agent Inventory Bag & Warehouse Stock
    suspend fun fetchInventory(agentId: String): Pair<List<AgentInventoryItem>, List<AgentWarehouseStockItem>> = withContext(Dispatchers.IO) {
        val jsonStr = makeGetRequest("/api/v1/agent/inventory?agentId=$agentId")
        val agentItems = mutableListOf<AgentInventoryItem>()
        val warehouseItems = mutableListOf<AgentWarehouseStockItem>()
        if (jsonStr != null) {
            try {
                val root = JSONObject(jsonStr)
                val invArr = root.optJSONArray("inventory") ?: root.optJSONArray("agentInventory") ?: JSONArray()
                for (i in 0 until invArr.length()) {
                    val o = invArr.getJSONObject(i)
                    agentItems.add(
                        AgentInventoryItem(
                            id = o.optString("id", "inv_$i"),
                            name = o.optString("name", "Consumable"),
                            code = o.optString("code", ""),
                            stock = o.optInt("stock", 0),
                            unit = o.optString("unit", "Pcs"),
                            minThreshold = o.optInt("minThreshold", 10)
                        )
                    )
                }

                val whArr = root.optJSONArray("warehouseStock") ?: JSONArray()
                for (i in 0 until whArr.length()) {
                    val o = whArr.getJSONObject(i)
                    warehouseItems.add(
                        AgentWarehouseStockItem(
                            code = o.optString("code", "wh_$i"),
                            name = o.optString("name", "Item"),
                            type = o.optString("type", "TUBE"),
                            category = o.optString("category", "General"),
                            stock = o.optInt("stock", 0),
                            unit = o.optString("unit", "Pcs"),
                            unitCost = o.optInt("unitCost", 5)
                        )
                    )
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        Pair(agentItems, warehouseItems)
    }

    // 4. Request Restock Indent from Warehouse
    suspend fun requestIndent(agentId: String, requestedItems: String): Boolean = withContext(Dispatchers.IO) {
        val payload = JSONObject().apply {
            put("agentId", agentId)
            put("requestedItems", requestedItems)
        }
        val res = makePostRequest("/api/v1/agent/inventory/request", payload)
        res != null
    }

    // 5. Update Agent On/Off Duty
    suspend fun updateDuty(agentId: String, onDuty: Boolean): Boolean = withContext(Dispatchers.IO) {
        val payload = JSONObject().apply {
            put("agentId", agentId)
            put("onDuty", onDuty)
        }
        val res = makePostRequest("/api/v1/agent/duty", payload)
        res != null
    }

    // 6. Fetch Broadcast Overflow Gigs (Freelance)
    suspend fun fetchBroadcastGigs(): List<FreelanceBroadcastJobItem> = withContext(Dispatchers.IO) {
        val jsonStr = makeGetRequest("/api/v1/agent/broadcasts")
        val result = mutableListOf<FreelanceBroadcastJobItem>()
        if (jsonStr != null) {
            try {
                val root = JSONObject(jsonStr)
                val arr = root.optJSONArray("broadcasts") ?: root.optJSONArray("jobs") ?: JSONArray()
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    result.add(
                        FreelanceBroadcastJobItem(
                            id = o.optString("id", "gig_$i"),
                            patientName = o.optString("patientName", "Care Seeker"),
                            age = o.optString("age", "42 Yrs"),
                            timeSlot = o.optString("timeSlot", o.optString("slot", "07:30 AM")),
                            address = o.optString("address", "Tirupati"),
                            phone = o.optString("phone", "+91 98765 43210"),
                            tests = o.optString("tests", o.optString("items", "Diagnostic Panel")),
                            payout = o.optInt("payout", 350),
                            distance = o.optString("distance", "2.1 km"),
                            fastingRequired = o.optBoolean("fastingRequired", true),
                            urgency = o.optString("urgency", "FASTING")
                        )
                    )
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        result
    }

    // 7. Claim Broadcast Gig (Freelance)
    suspend fun claimBroadcastGig(agentId: String, gigId: String): Boolean = withContext(Dispatchers.IO) {
        val payload = JSONObject().apply {
            put("agentId", agentId)
            put("gigId", gigId)
        }
        val res = makePostRequest("/api/v1/agent/broadcasts/claim", payload)
        res != null
    }

    // 8. Create Manual Customer Order
    suspend fun createManualOrder(
        agentId: String,
        patientName: String,
        phone: String,
        address: String,
        tests: String,
        amount: Int,
        slot: String
    ): Boolean = withContext(Dispatchers.IO) {
        val payload = JSONObject().apply {
            put("agentId", agentId)
            put("patientName", patientName)
            put("phone", phone)
            put("address", address)
            put("items", tests)
            put("amount", amount)
            put("slot", slot)
        }
        val res = makePostRequest("/api/v1/agent/manual-order", payload)
        res != null
    }

    private fun parseOrder(o: JSONObject): AgentPickupOrder {
        val vitalsObj = o.optJSONObject("phleboVitals")
        val vitals = vitalsObj?.let {
            PhleboVitalsRecord(
                recordedAt = it.optString("recordedAt"),
                bp = it.optString("bp"),
                pulse = it.optString("pulse"),
                spo2 = it.optString("spo2"),
                sugar = it.optString("sugar"),
                temp = it.optString("temp")
            )
        }

        return AgentPickupOrder(
            id = o.optString("id", o.optString("_id", "ord_0")),
            patientName = o.optString("patientName", null),
            careSeekerName = o.optString("careSeekerName", null),
            phone = o.optString("phone", null),
            patientPhone = o.optString("patientPhone", null),
            city = o.optString("city", "Tirupati"),
            address = o.optString("address", "Air Bypass Road, Tirupati"),
            items = o.optString("items", "Complete Blood Count"),
            totalPersons = o.optInt("totalPersons", 1),
            selectedLabProvider = o.optString("selectedLabProvider", null),
            labName = o.optString("labName", "MedMarg Central Diagnostics"),
            amount = o.optInt("amount", 499),
            totalAmount = o.optInt("totalAmount", 499),
            status = o.optString("status", "ASSIGNED"),
            assignedAgent = o.optString("assignedAgent", null),
            phleboName = o.optString("phleboName", null),
            phleboPhone = o.optString("phleboPhone", null),
            otp = o.optString("otp", "1234"),
            handoverOtp = o.optString("handoverOtp", "5678"),
            slot = o.optString("slot", "07:30 AM - 08:30 AM"),
            date = o.optString("date", "Today"),
            eta = o.optString("eta", "15 mins"),
            tempTelemetry = o.optString("tempTelemetry", "4.2°C"),
            paymentMode = o.optString("paymentMode", "DOORSTEP_QR"),
            paymentStatus = o.optString("paymentStatus", "PENDING"),
            barcode = o.optString("barcode", null),
            arrivalPhoto = o.optString("arrivalPhoto", null),
            reviewRequestSent = o.optBoolean("reviewRequestSent", false),
            phleboVitals = vitals,
            kitAssigned = o.optBoolean("kitAssigned", false),
            tripStartedAt = o.optString("tripStartedAt", null)
        )
    }
}

