package com.medmarg.patient.ui.screens

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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.PatientSessionStore
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.profile.EditProfileModal
import com.medmarg.patient.ui.profile.FamilyMembersModal
import com.medmarg.patient.ui.profile.SavedAddressesModal
import com.medmarg.patient.ui.theme.*

@Composable
fun ProfileScreen(
    user: UserProfile,
    onOpenLocationPicker: () -> Unit,
    onSwitchRole: () -> Unit,
    onLogout: () -> Unit,
    onOpenMyOrders: () -> Unit = {},
    onOpenVaultReports: () -> Unit = {},
    onOpenVitals: () -> Unit = {},
    onUserUpdated: (UserProfile) -> Unit = {}
) {
    val meta = PatientSessionStore.medicalMeta
    val familyMembers = PatientSessionStore.familyMembers
    val savedAddresses = PatientSessionStore.savedAddresses
    val liveOrdersCount = PatientSessionStore.liveOrders.size

    var healthConnectEnabled by remember { mutableStateOf(true) }
    var butterflyNeedlePreferred by remember { mutableStateOf(true) }
    var whatsappReportsEnabled by remember { mutableStateOf(true) }

    var showEditProfileModal by remember { mutableStateOf(false) }
    var showFamilyModal by remember { mutableStateOf(false) }
    var showAddressesModal by remember { mutableStateOf(false) }
    var showDeleteAccountDialog by remember { mutableStateOf(false) }

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
            shape = RoundedCornerShape(18.dp),
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
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
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
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Black,
                                color = Slate900
                            )
                            Text(
                                text = user.phone,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Slate600
                            )
                            Text(
                                text = user.email,
                                fontSize = 11.sp,
                                color = Slate400
                            )
                        }
                    }

                    TextButton(onClick = { showEditProfileModal = true }) {
                        Icon(Icons.Default.Edit, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Edit", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                    }
                }

                HorizontalDivider(color = Slate100, modifier = Modifier.padding(vertical = 12.dp))

                // Patient Medical Biomarkers Snapshot
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    ProfileBadge(title = "Age", value = "${meta.age} Yrs")
                    ProfileBadge(title = "Gender", value = meta.gender)
                    ProfileBadge(title = "Blood Group", value = meta.bloodGroup)
                    ProfileBadge(title = "Height/Weight", value = meta.heightWeight)
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 2. Quick Stats & Navigation Row (Orders, Reports, Family, Vitals)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            QuickProfileStatTile(
                modifier = Modifier.weight(1f),
                icon = Icons.Default.ReceiptLong,
                count = "$liveOrdersCount",
                label = "My Orders",
                onClick = onOpenMyOrders
            )
            QuickProfileStatTile(
                modifier = Modifier.weight(1f),
                icon = Icons.Default.FolderShared,
                count = "Vault",
                label = "Lab Reports",
                onClick = onOpenVaultReports
            )
            QuickProfileStatTile(
                modifier = Modifier.weight(1f),
                icon = Icons.Default.Group,
                count = "${familyMembers.size}",
                label = "Family",
                onClick = { showFamilyModal = true }
            )
            QuickProfileStatTile(
                modifier = Modifier.weight(1f),
                icon = Icons.Default.MonitorHeart,
                count = "Live",
                label = "Vitals Hub",
                onClick = onOpenVitals
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 3. ABHA (Ayushman Bharat Health Account) Digital Health Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = MedTealDark)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        color = EmeraldAccent.copy(alpha = 0.2f),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = "ABHA HEALTH LOCKER VERIFIED",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            color = EmeraldAccent,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                    Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(18.dp))
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "ABHA ID: ${meta.abhaId}",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Black,
                    color = PureWhite
                )
                Text(
                    text = "PHR Address: ${user.username.lowercase()}@abdm • Linked with MedMarg NABL Network",
                    fontSize = 11.sp,
                    color = Slate400,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 4. Medical Profile & Clinical History
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
                    Text(
                        text = "Edit",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = MedTealPrimary,
                        modifier = Modifier.clickable { showEditProfileModal = true }
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                MedicalInfoRow(label = "Known Allergies", value = meta.allergies, color = AmberWarning)
                MedicalInfoRow(label = "Chronic Conditions", value = meta.chronicConditions, color = Slate700)
                MedicalInfoRow(label = "Current Medications", value = meta.currentMedications, color = MedTealPrimary)
                MedicalInfoRow(label = "Emergency Contact", value = meta.emergencyContact.ifEmpty { user.phone }, color = Slate900)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 5. Saved Doorstep Addresses Section
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
                    Text("Saved Doorstep Addresses (${savedAddresses.size})", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate900)
                    Text(
                        text = "Manage / + Add",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = MedTealPrimary,
                        modifier = Modifier.clickable { showAddressesModal = true }
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                savedAddresses.forEach { addr ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showAddressesModal = true }
                            .padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Icon(Icons.Default.LocationOn, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(addr.label, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                    if (addr.isDefault) {
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Surface(color = EmeraldLight, shape = RoundedCornerShape(4.dp)) {
                                            Text(
                                                text = "DEFAULT",
                                                fontSize = 8.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = EmeraldAccent,
                                                modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp)
                                            )
                                        }
                                    }
                                }
                                Text(addr.fullAddress, fontSize = 11.sp, color = Slate500)
                            }
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate400, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 6. Linked Family Beneficiaries Section
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
                    Text("Linked Family Members (${familyMembers.size})", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate900)
                    Text(
                        text = "+ Add Member",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = MedTealPrimary,
                        modifier = Modifier.clickable { showFamilyModal = true }
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                familyMembers.forEach { member ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showFamilyModal = true }
                            .padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(34.dp)
                                    .clip(CircleShape)
                                    .background(MedTealLight),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(member.name.take(1), fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text("${member.name} (${member.relationship})", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                Text("${member.age} Yrs • ${member.gender} • Blood: ${member.bloodGroup}", fontSize = 11.sp, color = Slate500)
                            }
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate400, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 7. Sample Collection & App Preferences
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Sample Collection & Health Preferences", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Slate900)
                Spacer(modifier = Modifier.height(10.dp))

                PreferenceToggleRow(
                    title = "Pediatric / Butterfly Needle Preference",
                    subtitle = "Request ultra-fine painless butterfly needle for blood draw",
                    checked = butterflyNeedlePreferred,
                    onCheckedChange = { butterflyNeedlePreferred = it }
                )
                HorizontalDivider(color = Slate100, modifier = Modifier.padding(vertical = 6.dp))
                PreferenceToggleRow(
                    title = "Android Health Connect Vitals Sync",
                    subtitle = "Correlate smartwatch vitals with pathology reports",
                    checked = healthConnectEnabled,
                    onCheckedChange = { healthConnectEnabled = it }
                )
                HorizontalDivider(color = Slate100, modifier = Modifier.padding(vertical = 6.dp))
                PreferenceToggleRow(
                    title = "Instant WhatsApp PDF Report Delivery",
                    subtitle = "Receive verified lab reports on ${user.phone}",
                    checked = whatsappReportsEnabled,
                    onCheckedChange = { whatsappReportsEnabled = it }
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // 8. Logout & Delete Account Actions
        Button(
            onClick = onLogout,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = RoseError)
        ) {
            Icon(Icons.Default.Logout, contentDescription = null, tint = PureWhite, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Sign Out of MedMarg", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PureWhite)
        }

        Spacer(modifier = Modifier.height(10.dp))

        TextButton(
            onClick = { showDeleteAccountDialog = true },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "Request Permanent Account & Data Deletion",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Slate500
            )
        }
    }

    // Modular Modals
    if (showEditProfileModal) {
        EditProfileModal(
            user = user,
            onDismiss = { showEditProfileModal = false },
            onUserUpdated = onUserUpdated
        )
    }

    if (showFamilyModal) {
        FamilyMembersModal(
            user = user,
            onDismiss = { showFamilyModal = false }
        )
    }

    if (showAddressesModal) {
        SavedAddressesModal(
            user = user,
            onDismiss = { showAddressesModal = false }
        )
    }

    if (showDeleteAccountDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteAccountDialog = false },
            title = { Text("Delete MedMarg Account?", fontWeight = FontWeight.Bold) },
            text = {
                Text("This will permanently erase your patient profile, saved addresses, and local health locker cache from this device.")
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showDeleteAccountDialog = false
                        onLogout()
                    }
                ) {
                    Text("Delete Account", color = RoseError, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteAccountDialog = false }) {
                    Text("Cancel", color = Slate600)
                }
            }
        )
    }
}

@Composable
private fun QuickProfileStatTile(
    modifier: Modifier = Modifier,
    icon: ImageVector,
    count: String,
    label: String,
    onClick: () -> Unit
) {
    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .clickable { onClick() },
        color = PureWhite,
        shape = RoundedCornerShape(14.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
    ) {
        Column(
            modifier = Modifier.padding(vertical = 12.dp, horizontal = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.height(4.dp))
            Text(count, fontSize = 14.sp, fontWeight = FontWeight.Black, color = Slate900)
            Text(label, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = Slate500)
        }
    }
}

@Composable
private fun PreferenceToggleRow(
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
            Text(subtitle, fontSize = 11.sp, color = Slate500)
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(checkedThumbColor = PureWhite, checkedTrackColor = MedTealPrimary)
        )
    }
}

@Composable
private fun ProfileBadge(title: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = title, fontSize = 10.sp, color = Slate400, fontWeight = FontWeight.Medium)
        Spacer(modifier = Modifier.height(2.dp))
        Text(text = value, fontSize = 13.sp, color = Slate900, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun MedicalInfoRow(label: String, value: String, color: Color) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, fontSize = 12.sp, color = Slate500, modifier = Modifier.weight(0.4f))
        Text(text = value, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = color, modifier = Modifier.weight(0.6f))
    }
}
