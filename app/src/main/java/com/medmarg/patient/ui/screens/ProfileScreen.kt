package com.medmarg.patient.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.model.FamilyMember
import com.medmarg.patient.model.SavedAddress
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*

@Composable
fun ProfileScreen(
    user: UserProfile,
    onOpenLocationPicker: () -> Unit,
    onSwitchRole: () -> Unit,
    onLogout: () -> Unit
) {
    var healthConnectEnabled by remember { mutableStateOf(true) }
    var biometricEnabled by remember { mutableStateOf(true) }

    val savedAddresses = listOf(
        SavedAddress("addr_1", "Primary Home", "Plot 42, Air Bypass Road, Tirupati - 517501", landmark = "Near Hero Showroom", isDefault = true),
        SavedAddress("addr_2", "Parents' Residence", "Door 12-4, Gandhi Road, Tirupati - 517501", landmark = "Opp. SBI Bank", isDefault = false),
        SavedAddress("addr_3", "Office / Tech Park", "Renigunta Main Road, Tirupati - 517506", landmark = "Near Airport Junction", isDefault = false)
    )

    val familyMembers = listOf(
        FamilyMember("fam_1", user.name, "Self", 28, "Male", "O+"),
        FamilyMember("fam_2", "Priya Sharma", "Spouse", 26, "Female", "B+"),
        FamilyMember("fam_3", "K. Sharma", "Father", 58, "Male", "O+"),
        FamilyMember("fam_4", "Sunita Sharma", "Mother", 54, "Female", "A+")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .padding(bottom = 120.dp)
    ) {
        // 1. User Header & Primary Profile Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                                .background(Brush.linearGradient(listOf(MedTealPrimary, EmeraldAccent))),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = user.name.take(1).uppercase(),
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Black,
                                color = PureWhite
                            )
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column {
                            Text(
                                text = user.name,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                            Text(
                                text = user.phone,
                                fontSize = 12.sp,
                                color = Slate500
                            )
                            Text(
                                text = user.email,
                                fontSize = 11.sp,
                                color = Slate400
                            )
                        }
                    }

                    Surface(
                        color = MedTealLight,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = user.role.displayName,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = MedTealPrimary,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }

                Divider(color = Slate100, modifier = Modifier.padding(vertical = 12.dp))

                // Patient Medical Biomarkers Snapshot
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    ProfileBadge(title = "Age", value = "28 Yrs")
                    ProfileBadge(title = "Gender", value = "Male")
                    ProfileBadge(title = "Blood Group", value = "O+")
                    ProfileBadge(title = "Height/Weight", value = "176cm / 68kg")
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 2. Medical Profile & Clinical History
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Medical Profile & Allergies", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate900)
                    Text("Edit", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                }

                Spacer(modifier = Modifier.height(10.dp))

                MedicalInfoRow(label = "Known Allergies", value = "Penicillin (Mild rash)", color = AmberWarning)
                MedicalInfoRow(label = "Chronic Conditions", value = "Mild Hypertension (Under control)", color = Slate700)
                MedicalInfoRow(label = "Current Medications", value = "Telmisartan 40mg (Once daily morning)", color = MedTealPrimary)
                MedicalInfoRow(label = "Emergency Contact", value = "Priya Sharma (+91 98765 43211)", color = Slate900)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 3. Saved Addresses Section (Multi-Address Management)
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Saved Doorstep Addresses", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate900)
                    Text("+ Add", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary, modifier = Modifier.clickable { onOpenLocationPicker() })
                }

                Spacer(modifier = Modifier.height(10.dp))

                savedAddresses.forEach { addr ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Icon(Icons.Default.LocationOn, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(addr.label, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                    if (addr.isDefault) {
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Surface(color = EmeraldLight, shape = RoundedCornerShape(4.dp)) {
                                            Text("Default", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent, modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp))
                                        }
                                    }
                                }
                                Text(addr.fullAddress, fontSize = 11.sp, color = Slate500, maxLines = 1)
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 4. Family Member Profiles
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Family Healthcare Profiles", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate900)
                    Text("+ Add Member", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                }

                Spacer(modifier = Modifier.height(10.dp))

                familyMembers.forEach { member ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(CircleShape)
                                    .background(MedTealLight),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(member.name.take(1), fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(member.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                Text("${member.relationship} • ${member.age} yrs • Blood Group: ${member.bloodGroup}", fontSize = 11.sp, color = Slate500)
                            }
                        }

                        Text("Manage", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 5. Health Connect & Biometrics
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Health & Security Integrations", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate900)

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Favorite, contentDescription = null, tint = RoseError, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text("Android Health Connect", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            Text("Auto-sync BP, Glucose & Steps", fontSize = 11.sp, color = Slate500)
                        }
                    }
                    Switch(
                        checked = healthConnectEnabled,
                        onCheckedChange = { healthConnectEnabled = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = PureWhite, checkedTrackColor = EmeraldAccent)
                    )
                }

                Divider(color = Slate100, modifier = Modifier.padding(vertical = 10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Fingerprint, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text("Biometric App Unlock", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            Text("Fingerprint & Face Unlock", fontSize = 11.sp, color = Slate500)
                        }
                    }
                    Switch(
                        checked = biometricEnabled,
                        onCheckedChange = { biometricEnabled = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = PureWhite, checkedTrackColor = MedTealPrimary)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // 6. Role Switcher & Sign Out
        Button(
            onClick = onSwitchRole,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Slate900)
        ) {
            Icon(Icons.Default.SwapHoriz, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Switch User Workspace / Role", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(10.dp))

        Button(
            onClick = onLogout,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color.Red.copy(alpha = 0.08f))
        ) {
            Icon(Icons.Default.PowerSettingsNew, contentDescription = null, tint = Color.Red, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Sign Out of MedMarg", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.Red)
        }
    }
}

@Composable
private fun ProfileBadge(title: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(title, fontSize = 10.sp, color = Slate500)
        Text(value, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
    }
}

@Composable
private fun MedicalInfoRow(label: String, value: String, color: Color) {
    Column(modifier = Modifier.padding(vertical = 4.dp)) {
        Text(label, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Slate500)
        Text(value, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = color)
    }
}
