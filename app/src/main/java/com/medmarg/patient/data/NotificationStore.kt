package com.medmarg.patient.data

import android.content.Context
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.DirectionsBike
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Timer
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject

data class PatientNotificationItem(
    val id: String,
    val title: String,
    val message: String,
    val timestamp: String,
    val type: String = "SYSTEM", // "BOOKING", "REPORT", "REMINDER", "SYSTEM"
    val isUnread: Boolean = true
) {
    val icon: ImageVector
        get() = when (type) {
            "BOOKING" -> Icons.Default.DirectionsBike
            "REPORT" -> Icons.Default.CloudDone
            "REMINDER" -> Icons.Default.Timer
            else -> Icons.Default.Notifications
        }

    val iconColor: Color
        get() = when (type) {
            "BOOKING" -> EmeraldAccent
            "REPORT" -> MedTealPrimary
            "REMINDER" -> AmberWarning
            else -> MedTealPrimary
        }

    val bgColor: Color
        get() = when (type) {
            "BOOKING" -> EmeraldLight
            "REPORT" -> MedTealLight
            "REMINDER" -> AmberWarningLight
            else -> MedTealLight
        }
}

/**
 * Dedicated Store for Patient Notifications.
 * - Persistent per-user in SharedPreferences (scoped by user email/phone).
 * - Fresh signups/logins have ZERO dummy notifications and 0 unread count!
 * - Supports real marking as read individually and mark-all-as-read.
 */
object NotificationStore {
    private const val PREFS_NAME = "medmarg_notifications_store"

    private val _notifications = MutableStateFlow<List<PatientNotificationItem>>(emptyList())
    val notifications: StateFlow<List<PatientNotificationItem>> = _notifications.asStateFlow()

    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: StateFlow<Int> = _unreadCount.asStateFlow()

    private var activeUserKey: String = ""

    fun initializeForUser(context: Context, userEmailOrPhone: String) {
        val cleanKey = userEmailOrPhone.trim().lowercase().ifEmpty { "guest" }
        activeUserKey = cleanKey
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        val jsonStr = prefs.getString("notifs_$cleanKey", null)
        if (jsonStr.isNullOrEmpty()) {
            // Fresh signup or login -> 0 notifications!
            _notifications.value = emptyList()
            _unreadCount.value = 0
        } else {
            try {
                val arr = JSONArray(jsonStr)
                val list = mutableListOf<PatientNotificationItem>()
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    list.add(
                        PatientNotificationItem(
                            id = o.optString("id", "n_$i"),
                            title = o.optString("title", ""),
                            message = o.optString("message", ""),
                            timestamp = o.optString("timestamp", "Just now"),
                            type = o.optString("type", "SYSTEM"),
                            isUnread = o.optBoolean("isUnread", false)
                        )
                    )
                }
                _notifications.value = list
                _unreadCount.value = list.count { it.isUnread }
            } catch (_: Exception) {
                _notifications.value = emptyList()
                _unreadCount.value = 0
            }
        }
    }

    fun markAsRead(context: Context, id: String) {
        val current = _notifications.value.toMutableList()
        val idx = current.indexOfFirst { it.id == id }
        if (idx >= 0 && current[idx].isUnread) {
            current[idx] = current[idx].copy(isUnread = false)
            _notifications.value = current
            _unreadCount.value = current.count { it.isUnread }
            persist(context)
        }
    }

    fun markAllAsRead(context: Context) {
        val current = _notifications.value.map { it.copy(isUnread = false) }
        _notifications.value = current
        _unreadCount.value = 0
        persist(context)
    }

    fun addNotification(
        context: Context,
        title: String,
        message: String,
        type: String = "SYSTEM"
    ) {
        val newItem = PatientNotificationItem(
            id = "notif_${System.currentTimeMillis()}",
            title = title,
            message = message,
            timestamp = "Just now",
            type = type,
            isUnread = true
        )
        val updated = listOf(newItem) + _notifications.value
        _notifications.value = updated
        _unreadCount.value = updated.count { it.isUnread }
        persist(context)
    }

    fun clearAll(context: Context) {
        _notifications.value = emptyList()
        _unreadCount.value = 0
        persist(context)
    }

    private fun persist(context: Context) {
        if (activeUserKey.isEmpty()) return
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val arr = JSONArray()
        _notifications.value.forEach { item ->
            arr.put(
                JSONObject().apply {
                    put("id", item.id)
                    put("title", item.title)
                    put("message", item.message)
                    put("timestamp", item.timestamp)
                    put("type", item.type)
                    put("isUnread", item.isUnread)
                }
            )
        }
        prefs.edit().putString("notifs_$activeUserKey", arr.toString()).apply()
    }
}

