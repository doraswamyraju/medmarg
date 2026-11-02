package com.medmarg.patient.ui.agent

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*

// =========================================================================
// 👤 AGENT PROFILE & PERFORMANCE SCREEN (TAB 4)
// 1-on-1 Parity with iOS AgentProfileView.swift
// =========================================================================

@Composable
fun AgentProfileScreen(
    user: UserProfile,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isOnDuty by remember { mutableStateOf(true) }
    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "AG-01"

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate50)
            .statusBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 14.dp)
            .padding(bottom = 90.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Profile Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(68.dp)
                        .clip(CircleShape)
                        .background(MedTealLight),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Person, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(38.dp))
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(user.name, fontSize = 18.sp, fontWeight = FontWeight.Black, color = Slate900)
                Text("Fleet Phlebotomist • $effectiveAgentId", fontSize = 12.sp, color = MedTealPrimary, fontWeight = FontWeight.Bold)
                Text(user.phone, fontSize = 12.sp, color = Slate500)

                Spacer(modifier = Modifier.height(10.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(AmberWarningLight)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text("★ 4.9 Rating", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = AmberWarning)
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(EmeraldLight)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text("Active Fleet Pilot", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                    }
                }
            }
        }

        // Shift Performance Quota Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Shift Quota & Performance", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900)
                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    PerformanceItem("Target Today", "10 Samples", Color(0xFF2563EB))
                    PerformanceItem("On-Time Rate", "96%", EmeraldAccent)
                    PerformanceItem("Fasting Accuracy", "100%", MedTealPrimary)
                }
            }
        }

        // Equipment & Telemetry
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Assigned Vehicle & Hardware", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900)
                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Two-Wheeler (EV)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                        Text("AP 03 AB 4582 • Inspected", fontSize = 11.sp, color = Slate500)
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(EmeraldLight)
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text("Verified", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Divider(color = Slate100)
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Cold Box IoT Telemetry", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                        Text("Realtime BLE Sensor Sensor_04", fontSize = 11.sp, color = Slate500)
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(MedTealLight)
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text("4.2°C (Optimal)", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                    }
                }
            }
        }

        // Settings & Actions
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Duty Status", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                    Switch(
                        checked = isOnDuty,
                        onCheckedChange = { isOnDuty = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = PureWhite, checkedTrackColor = Color(0xFF00B86B))
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))
                Divider(color = Slate100)
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { /* Emergency SOS */ }
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Emergency SOS Dispatch", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = RoseError)
                    Icon(Icons.Default.Warning, contentDescription = null, tint = RoseError, modifier = Modifier.size(18.dp))
                }
            }
        }

        // Logout Button
        Button(
            onClick = onLogout,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = PureWhite),
            border = androidx.compose.foundation.BorderStroke(1.dp, RoseError.copy(alpha = 0.5f)),
            shape = RoundedCornerShape(12.dp),
            contentPadding = PaddingValues(vertical = 12.dp)
        ) {
            Text("Logout of Agent Portal", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = RoseError)
        }
    }
}

@Composable
private fun PerformanceItem(title: String, value: String, color: Color) {
    Column {
        Text(title, fontSize = 10.sp, color = Slate400)
        Text(value, fontSize = 14.sp, fontWeight = FontWeight.Black, color = color)
    }
}
