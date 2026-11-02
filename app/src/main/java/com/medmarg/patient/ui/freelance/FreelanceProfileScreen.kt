package com.medmarg.patient.ui.freelance

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Verified
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
// 👤 FREELANCE AGENT PROFILE & MLT CREDENTIALS SCREEN (TAB 4)
// Replicated 1-on-1 with iOS FreelanceProfileView.swift
// =========================================================================

@Composable
fun FreelanceProfileScreen(
    user: UserProfile,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isOnDuty by remember { mutableStateOf(true) }

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
                        .background(Color(0xFFFFF7ED)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Person, contentDescription = null, tint = Color(0xFFEA580C), modifier = Modifier.size(38.dp))
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(user.name, fontSize = 18.sp, fontWeight = FontWeight.Black, color = Slate900)
                Text("Freelance Phlebotomist (Gig)", fontSize = 12.sp, color = Color(0xFFEA580C), fontWeight = FontWeight.Bold)
                Text(user.phone, fontSize = 12.sp, color = Slate500)

                Spacer(modifier = Modifier.height(10.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(EmeraldLight)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Verified, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(12.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Verified MLT Professional", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                        }
                    }
                }
            }
        }

        // Credentials Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Phlebotomy Qualifications", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900)
                Spacer(modifier = Modifier.height(10.dp))

                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    CredentialRow("MLT Reg No", "AP-MLT-2024-8891")
                    CredentialRow("Degree", "B.Sc Medical Laboratory Technology")
                    CredentialRow("Experience", "4 Years in Clinical Venipuncture")
                    CredentialRow("Primary Operating Hub", "Tirupati City & Suburbs")
                }
            }
        }

        // Duty Switch
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Available for Live Gigs", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                    Text("Receive broadcast overflow orders", fontSize = 11.sp, color = Slate500)
                }

                Switch(
                    checked = isOnDuty,
                    onCheckedChange = { isOnDuty = it },
                    colors = SwitchDefaults.colors(checkedThumbColor = PureWhite, checkedTrackColor = Color(0xFF00B86B))
                )
            }
        }

        // Logout
        Button(
            onClick = onLogout,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = PureWhite),
            border = androidx.compose.foundation.BorderStroke(1.dp, RoseError.copy(alpha = 0.5f)),
            shape = RoundedCornerShape(12.dp),
            contentPadding = PaddingValues(vertical = 12.dp)
        ) {
            Text("Logout of Freelance Portal", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = RoseError)
        }
    }
}

@Composable
private fun CredentialRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, fontSize = 12.sp, color = Slate500)
        Text(value, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
    }
}
