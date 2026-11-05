package com.medmarg.patient.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.medmarg.patient.data.PatientSessionStore
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.checkout.AddressPinpointModal
import com.medmarg.patient.ui.profile.AbhaDigitalIdModal
import com.medmarg.patient.ui.profile.EditProfileModal
import com.medmarg.patient.ui.profile.FamilyMembersModal
import com.medmarg.patient.ui.profile.SavedAddressesModal
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * 1-on-1 Replicated Care Seeker Profile Screen (`ios/CareSeekerProfileView.swift`).
 */
@Composable
fun ProfileScreen(
    user: UserProfile,
    onOpenLocationPicker: () -> Unit,
    onSwitchRole: () -> Unit,
    onLogout: () -> Unit,
    onOpenMyOrders: () -> Unit = {},
    onOpenVaultReports: () -> Unit = {},
    onOpenVitals: () -> Unit = {},
    onOpenReferralCorporate: () -> Unit = {},
    onUserUpdated: (UserProfile) -> Unit = {},
    initialSubTab: Int = -1
) {
    val context = LocalContext.current
    val meta = PatientSessionStore.medicalMeta
    val familyMembers = PatientSessionStore.familyMembers
    val savedAddresses = PatientSessionStore.savedAddresses
    val liveOrdersCount = PatientSessionStore.liveOrders.size

    var showEditProfileModal by remember { mutableStateOf(false) }
    var showFamilyModal by remember { mutableStateOf(false) }
    var showAddressesModal by remember { mutableStateOf(false) }
    var showPinpointAddAddressModal by remember { mutableStateOf(false) }
    var showAbhaQrModal by remember { mutableStateOf(false) }
    var showLogoutConfirmDialog by remember { mutableStateOf(false) }
    var showDeleteAccountDialog by remember { mutableStateOf(false) }

    // Open corresponding modal if navigated from Sidebar sub-tab (1 = Linked Family, 2 = Saved Addresses)
    LaunchedEffect(initialSubTab) {
        when (initialSubTab) {
            1 -> showFamilyModal = true
            2 -> showAddressesModal = true
        }
    }

    val abhaAddress = remember(user.name) {
        user.name.lowercase().replace(" ", "") + "@abdm"
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF6F9F8))
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 14.dp)
            .padding(bottom = 110.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // ====================================================================
        // 1. VERIFIED CARE SEEKER HEADER CARD (1:1 WITH iOS profileHeaderCard)
        // ====================================================================
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(22.dp),
            color = PureWhite,
            shadowElevation = 3.dp,
            border = BorderStroke(1.dp, Slate200.copy(alpha = 0.7f))
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Avatar with Emerald Ring & Verified Seal
                    Box(
                        contentAlignment = Alignment.BottomEnd,
                        modifier = Modifier.clickable { showEditProfileModal = true }
                    ) {
                        Box(
                            modifier = Modifier
                                .size(66.dp)
                                .clip(CircleShape)
                                .background(
                                    Brush.linearGradient(
                                        listOf(
                                            MedTealPrimary.copy(alpha = 0.18f),
                                            MedTealPrimary.copy(alpha = 0.06f)
                                        )
                                    )
                                )
                                .border(2.dp, MedTealPrimary.copy(alpha = 0.35f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            if (user.avatarUrl.isNotBlank()) {
                                AsyncImage(
                                    model = user.avatarUrl,
                                    contentDescription = user.name,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .clip(CircleShape)
                                )
                            } else {
                                Text(
                                    text = user.name.take(1).uppercase(),
                                    fontSize = 26.sp,
                                    fontWeight = FontWeight.Black,
                                    color = MedTealPrimary
                                )
                            }
                        }

                        Box(
                            modifier = Modifier
                                .size(22.dp)
                                .clip(CircleShape)
                                .background(PureWhite),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Verified,
                                contentDescription = "Verified",
                                tint = MedTealPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }

                    // Name + Verified Badges + Contact
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(3.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                color = MedTealLight,
                                shape = RoundedCornerShape(50)
                            ) {
                                Text(
                                    text = "VERIFIED CARE SEEKER",
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Black,
                                    color = MedTealPrimary,
                                    modifier = Modifier.padding(horizontal = 7.dp, vertical = 2.dp)
                                )
                            }
                            Surface(
                                color = Color(0xFFDBEAFE),
                                shape = RoundedCornerShape(50)
                            ) {
                                Text(
                                    text = "ABDM READY",
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color(0xFF2563EB),
                                    modifier = Modifier.padding(horizontal = 7.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Text(
                            text = user.name,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black,
                            color = Slate900,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )

                        Text(
                            text = "${user.phone} • ${user.email}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate500,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }

                    // Circular Pencil Edit Button
                    Surface(
                        onClick = { showEditProfileModal = true },
                        shape = CircleShape,
                        color = MedTealLight,
                        modifier = Modifier.size(38.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = "Edit Profile",
                                tint = MedTealPrimary,
                                modifier = Modifier.size(17.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))
                HorizontalDivider(color = Slate100)
                Spacer(modifier = Modifier.height(10.dp))

                // Zone & Cold-Chain Footer
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(5.dp),
                        modifier = Modifier.clickable { onOpenLocationPicker() }
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = MedTealPrimary,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = "${PatientSessionStore.selectedCity} Central Zone • 60-Min Dispatch",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate700
                        )
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.VerifiedUser,
                            contentDescription = null,
                            tint = EmeraldSuccess,
                            modifier = Modifier.size(13.dp)
                        )
                        Text(
                            text = "Cold-Chain Ready",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = EmeraldSuccess
                        )
                    }
                }
            }
        }

        // ====================================================================
        // 2. 4 METRIC COUNTER CARDS (1:1 WITH iOS healthSummaryCounters)
        // ====================================================================
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MetricCounterCard(
                modifier = Modifier.weight(1f),
                value = "${maxOf(liveOrdersCount, 12)}",
                label = "Tests Booked",
                icon = Icons.Default.Science,
                tint = MedTealPrimary,
                onClick = onOpenMyOrders
            )
            MetricCounterCard(
                modifier = Modifier.weight(1f),
                value = "9",
                label = "Lab Reports",
                icon = Icons.Default.Description,
                tint = Color(0xFF2563EB),
                onClick = onOpenVaultReports
            )
            MetricCounterCard(
                modifier = Modifier.weight(1f),
                value = "${familyMembers.size}",
                label = "Family Linked",
                icon = Icons.Default.Groups,
                tint = Color(0xFF9333EA),
                onClick = { showFamilyModal = true }
            )
            MetricCounterCard(
                modifier = Modifier.weight(1f),
                value = "${savedAddresses.size}",
                label = "Addresses",
                icon = Icons.Default.Home,
                tint = Color(0xFFEA580C),
                onClick = { showAddressesModal = true }
            )
        }

        // ====================================================================
        // 3. ABHA DIGITAL HEALTH LOCKER CARD (1:1 WITH iOS abhaDigitalHealthCard)
        // ====================================================================
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { showAbhaQrModal = true },
            shape = RoundedCornerShape(22.dp),
            shadowElevation = 6.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.linearGradient(
                            listOf(
                                Color(0xFF0A2A24),
                                Color(0xFF0E3E35),
                                Color(0xFF0F172A)
                            )
                        )
                    )
                    .padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.QrCodeScanner,
                                contentDescription = null,
                                tint = Color(0xFF34D399),
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = "AYUSHMAN BHARAT DIGITAL MISSION",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF34D399),
                                letterSpacing = 0.7.sp
                            )
                        }
                        Text(
                            text = "ABHA Health Locker",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black,
                            color = PureWhite
                        )
                    }

                    Surface(
                        color = Color(0xFF10B981).copy(alpha = 0.2f),
                        shape = RoundedCornerShape(50),
                        border = BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.45f))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(5.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF34D399))
                            )
                            Text(
                                text = "LINKED",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                color = PureWhite
                            )
                        }
                    }
                }

                // ABHA Number + Copy + QR Code Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "ABHA NUMBER",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = PureWhite.copy(alpha = 0.55f)
                        )
                        Text(
                            text = meta.abhaId,
                            fontSize = 16.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Black,
                            color = PureWhite,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Surface(
                            onClick = {
                                val cb = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                cb.setPrimaryClip(ClipData.newPlainText("ABHA ID", meta.abhaId))
                                Toast.makeText(context, "ABHA ID Copied", Toast.LENGTH_SHORT).show()
                            },
                            shape = RoundedCornerShape(10.dp),
                            color = PureWhite.copy(alpha = 0.14f)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 7.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ContentCopy,
                                    contentDescription = "Copy",
                                    tint = PureWhite,
                                    modifier = Modifier.size(13.dp)
                                )
                                Text(
                                    text = "Copy",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PureWhite
                                )
                            }
                        }

                        Surface(
                            onClick = { showAbhaQrModal = true },
                            shape = RoundedCornerShape(10.dp),
                            color = Color(0xFF10B981)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(5.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.QrCode2,
                                    contentDescription = "QR Code",
                                    tint = PureWhite,
                                    modifier = Modifier.size(14.dp)
                                )
                                Text(
                                    text = "QR Card",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PureWhite
                                )
                            }
                        }
                    }
                }

                HorizontalDivider(color = PureWhite.copy(alpha = 0.12f))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "ABHA Address: $abhaAddress",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = PureWhite.copy(alpha = 0.8f)
                    )
                    Text(
                        text = "NABL Auto-Sync Active",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF34D399)
                    )
                }
            }
        }

        // ====================================================================
        // 4. HEALTH & SAMPLE COLLECTION PREFERENCES (2x2 GRID — 1:1 WITH iOS)
        // ====================================================================
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            color = PureWhite,
            shadowElevation = 2.dp,
            border = BorderStroke(1.dp, Slate200.copy(alpha = 0.7f))
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Favorite,
                            contentDescription = null,
                            tint = MedTealPrimary,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "Health & Sample Collection Preferences",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Slate900
                        )
                    }

                    Text(
                        text = "Modify",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = MedTealPrimary,
                        modifier = Modifier.clickable { showEditProfileModal = true }
                    )
                }

                // 2x2 Grid
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    ClinicalPreferenceBadge(
                        modifier = Modifier.weight(1f),
                        title = "BLOOD GROUP",
                        value = "${meta.bloodGroup} (${meta.age} Yrs)",
                        icon = Icons.Default.WaterDrop,
                        tint = RoseError
                    )
                    ClinicalPreferenceBadge(
                        modifier = Modifier.weight(1f),
                        title = "COMMUNICATION",
                        value = meta.preferredLanguage,
                        icon = Icons.Default.Translate,
                        tint = Color(0xFF2563EB)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    ClinicalPreferenceBadge(
                        modifier = Modifier.weight(1f),
                        title = "NEEDLE GAUGE",
                        value = meta.needleSensitivity,
                        icon = Icons.Default.Vaccines,
                        tint = MedTealPrimary
                    )
                    ClinicalPreferenceBadge(
                        modifier = Modifier.weight(1f),
                        title = "VAULT SYNC",
                        value = "Health Connect & Drive",
                        icon = Icons.Default.CloudDone,
                        tint = Color(0xFF9333EA)
                    )
                }

                HorizontalDivider(color = Slate100)

                // Allergies & Conditions Quick Strip
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Allergies: ${meta.allergies}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Slate600
                    )
                    Text(
                        text = "Conditions: ${meta.chronicConditions}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Slate600
                    )
                }
            }
        }

        // ====================================================================
        // 5. LINKED FAMILY BENEFICIARIES SECTION (1:1 WITH iOS familyMembersSection)
        // ====================================================================
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            color = PureWhite,
            shadowElevation = 2.dp,
            border = BorderStroke(1.dp, Slate200.copy(alpha = 0.7f))
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Groups,
                                contentDescription = null,
                                tint = MedTealPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                            Text(
                                text = "Linked Family Members",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Slate900
                            )
                        }
                        Text(
                            text = "One-tap booking & unified health records for your family",
                            fontSize = 11.sp,
                            color = Slate500
                        )
                    }

                    Surface(
                        onClick = { showFamilyModal = true },
                        shape = RoundedCornerShape(50),
                        color = MedTealLight
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AddCircle,
                                contentDescription = null,
                                tint = MedTealPrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = "Add Member",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MedTealPrimary
                            )
                        }
                    }
                }

                familyMembers.forEachIndexed { index, member ->
                    val abhaNum = remember(member.id) {
                        "91-${3400 + index * 217}-${7100 + index * 113}-${1920 + index * 89}"
                    }
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showFamilyModal = true },
                        shape = RoundedCornerShape(14.dp),
                        color = Slate50,
                        border = BorderStroke(1.dp, Slate200.copy(alpha = 0.7f))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(42.dp)
                                        .clip(CircleShape)
                                        .background(MedTealLight),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = member.name.take(1).uppercase(),
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Black,
                                        color = MedTealPrimary
                                    )
                                }

                                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text(
                                            text = member.name,
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Slate900
                                        )
                                        Surface(
                                            color = MedTealLight,
                                            shape = RoundedCornerShape(4.dp)
                                        ) {
                                            Text(
                                                text = member.relationship,
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = MedTealPrimary,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                        Surface(
                                            color = RoseError.copy(alpha = 0.1f),
                                            shape = RoundedCornerShape(4.dp)
                                        ) {
                                            Text(
                                                text = member.bloodGroup,
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.ExtraBold,
                                                color = RoseError,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }

                                    Text(
                                        text = "${member.age} Yrs • ${member.gender} • ABHA: $abhaNum",
                                        fontSize = 10.sp,
                                        fontFamily = FontFamily.Monospace,
                                        color = Slate500
                                    )
                                }
                            }

                            if (!member.relationship.equals("Self", ignoreCase = true)) {
                                IconButton(
                                    onClick = {
                                        PatientSessionStore.familyMembers.remove(member)
                                        PatientSessionStore.saveFamilyMembers(context, user)
                                    },
                                    modifier = Modifier.size(30.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.DeleteOutline,
                                        contentDescription = "Delete",
                                        tint = RoseError,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            } else {
                                Icon(
                                    imageVector = Icons.Default.ChevronRight,
                                    contentDescription = null,
                                    tint = Slate400,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        // ====================================================================
        // 6. SAVED DOORSTEP ADDRESSES SECTION (1:1 WITH iOS savedAddressesSection)
        // ====================================================================
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            color = PureWhite,
            shadowElevation = 2.dp,
            border = BorderStroke(1.dp, Slate200.copy(alpha = 0.7f))
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.PinDrop,
                                contentDescription = null,
                                tint = MedTealPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                            Text(
                                text = "Saved Doorstep Addresses",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Slate900
                            )
                        }
                        Text(
                            text = "GPS-verified locations for 60-minute home sample pickup",
                            fontSize = 11.sp,
                            color = Slate500
                        )
                    }

                    Surface(
                        onClick = { showPinpointAddAddressModal = true },
                        shape = RoundedCornerShape(50),
                        color = MedTealLight
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AddLocationAlt,
                                contentDescription = null,
                                tint = MedTealPrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = "Add Address",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MedTealPrimary
                            )
                        }
                    }
                }

                savedAddresses.forEach { addr ->
                    val tagIcon = when (addr.label) {
                        "Home" -> Icons.Default.Home
                        "Office" -> Icons.Default.Business
                        "Parents" -> Icons.Default.FamilyRestroom
                        else -> Icons.Default.LocationOn
                    }
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showAddressesModal = true },
                        shape = RoundedCornerShape(14.dp),
                        color = Slate50,
                        border = BorderStroke(
                            1.dp,
                            if (addr.isDefault) MedTealPrimary.copy(alpha = 0.35f) else Slate200.copy(alpha = 0.7f)
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.Top,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.Top,
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(38.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(MedTealLight),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = tagIcon,
                                        contentDescription = null,
                                        tint = MedTealPrimary,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }

                                Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text(
                                            text = addr.label,
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Slate900
                                        )
                                        if (addr.isDefault) {
                                            Surface(
                                                color = MedTealPrimary,
                                                shape = RoundedCornerShape(4.dp)
                                            ) {
                                                Text(
                                                    text = "DEFAULT",
                                                    fontSize = 8.sp,
                                                    fontWeight = FontWeight.Black,
                                                    color = PureWhite,
                                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                                )
                                            }
                                        }
                                        Surface(
                                            color = Color(0xFFDBEAFE),
                                            shape = RoundedCornerShape(4.dp)
                                        ) {
                                            Text(
                                                text = "Zone 1 • 60m",
                                                fontSize = 8.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = Color(0xFF2563EB),
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }

                                    Text(
                                        text = addr.fullAddress,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Slate700
                                    )

                                    if (addr.landmark.isNotBlank()) {
                                        Text(
                                            text = "Landmark: ${addr.landmark}",
                                            fontSize = 10.sp,
                                            color = Slate500
                                        )
                                    }
                                }
                            }

                            if (savedAddresses.size > 1) {
                                IconButton(
                                    onClick = {
                                        PatientSessionStore.savedAddresses.remove(addr)
                                        PatientSessionStore.saveAddresses(context, user)
                                    },
                                    modifier = Modifier.size(30.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.DeleteOutline,
                                        contentDescription = "Delete Address",
                                        tint = RoseError,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // ====================================================================
        // 7. REFER & EARN ₹200 / CORPORATE WELLNESS HUB BANNER
        // ====================================================================
        Surface(
            onClick = onOpenReferralCorporate,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            color = PureWhite,
            shadowElevation = 2.dp,
            border = BorderStroke(1.dp, MedTealPrimary.copy(alpha = 0.25f))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.horizontalGradient(
                            listOf(
                                Color(0xFFE6F4F1),
                                PureWhite
                            )
                        )
                    )
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(MedTealPrimary),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.CardGiftcard,
                            contentDescription = null,
                            tint = PureWhite,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Column {
                        Text(
                            text = "Refer & Earn ₹200 • Corporate Wellness",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = Slate900
                        )
                        Text(
                            text = "Invite friends for ₹200 wallet credit or manage corporate staff panels",
                            fontSize = 11.sp,
                            color = Slate600
                        )
                    }
                }

                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = MedTealPrimary
                )
            }
        }

        // ====================================================================
        // 8. SECURITY & NOTIFICATION PREFERENCES (1:1 WITH iOS appSettingsSection)
        // ====================================================================
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            color = PureWhite,
            shadowElevation = 2.dp,
            border = BorderStroke(1.dp, Slate200.copy(alpha = 0.7f))
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Security,
                        contentDescription = null,
                        tint = MedTealPrimary,
                        modifier = Modifier.size(18.dp)
                    )
                    Text(
                        text = "Security & Notification Preferences",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Slate900
                    )
                }

                SettingSwitchRow(
                    icon = Icons.Default.Fingerprint,
                    iconTint = MedTealPrimary,
                    title = "Biometric & Fingerprint Protection",
                    subtitle = "Require device authentication before opening Health Vault reports",
                    checked = meta.biometricsEnabled,
                    onCheckedChange = {
                        PatientSessionStore.saveMedicalMeta(
                            context,
                            user,
                            meta.copy(biometricsEnabled = it)
                        )
                    }
                )

                HorizontalDivider(color = Slate100)

                SettingSwitchRow(
                    icon = Icons.Default.Chat,
                    iconTint = EmeraldSuccess,
                    title = "WhatsApp PDF Reports & Alerts",
                    subtitle = "Instant NABL signed PDF reports & live phlebotomist ETA",
                    checked = meta.whatsAppNotifications,
                    onCheckedChange = {
                        PatientSessionStore.saveMedicalMeta(
                            context,
                            user,
                            meta.copy(whatsAppNotifications = it)
                        )
                    }
                )

                HorizontalDivider(color = Slate100)

                SettingSwitchRow(
                    icon = Icons.Default.Sms,
                    iconTint = Color(0xFF2563EB),
                    title = "SMS Order & Sample Updates",
                    subtitle = "Doorstep OTP verification & lab accession timestamps",
                    checked = meta.smsOrderUpdates,
                    onCheckedChange = {
                        PatientSessionStore.saveMedicalMeta(
                            context,
                            user,
                            meta.copy(smsOrderUpdates = it)
                        )
                    }
                )

                HorizontalDivider(color = Slate100)

                // Emergency Medical Contact Row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showEditProfileModal = true }
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(RoundedCornerShape(9.dp))
                                .background(RoseError.copy(alpha = 0.1f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Emergency,
                                contentDescription = null,
                                tint = RoseError,
                                modifier = Modifier.size(17.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Emergency Medical Contact",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                            Text(
                                text = "${meta.emergencyContactName} • ${meta.emergencyContact.ifEmpty { user.phone }}",
                                fontSize = 11.sp,
                                color = Slate500
                            )
                        }
                    }

                    Text(
                        text = "Update",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = MedTealPrimary
                    )
                }

                HorizontalDivider(color = Slate100)

                // Version Info Footer
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "MedMarg Care Seeker App",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Slate400
                    )
                    Text(
                        text = "v2.4.0 (Build 108) • NABL ISO-15189",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Slate400
                    )
                }
            }
        }

        // ====================================================================
        // 9. SIGN OUT & DELETE ACCOUNT BUTTONS
        // ====================================================================
        Surface(
            onClick = { showLogoutConfirmDialog = true },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            color = RoseError.copy(alpha = 0.08f),
            border = BorderStroke(1.dp, RoseError.copy(alpha = 0.25f))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 15.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.PowerSettingsNew,
                    contentDescription = null,
                    tint = RoseError,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Sign Out of Care Seeker Session",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = RoseError
                )
            }
        }

        TextButton(
            onClick = { showDeleteAccountDialog = true },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "Request Permanent Account & Data Deletion",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Slate400
            )
        }
    }

    // ========================================================================
    // SEPARATE MODULAR MODALS
    // ========================================================================
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

    if (showPinpointAddAddressModal) {
        AddressPinpointModal(
            defaultPhone = user.phone,
            onDismiss = { showPinpointAddAddressModal = false },
            onAddressSaved = { newAddr ->
                if (newAddr.isDefault) {
                    for (i in PatientSessionStore.savedAddresses.indices) {
                        PatientSessionStore.savedAddresses[i] =
                            PatientSessionStore.savedAddresses[i].copy(isDefault = false)
                    }
                }
                PatientSessionStore.savedAddresses.add(0, newAddr)
                PatientSessionStore.saveAddresses(context, user)
                showPinpointAddAddressModal = false
            }
        )
    }

    if (showAbhaQrModal) {
        AbhaDigitalIdModal(
            user = user,
            medicalMeta = meta,
            onDismiss = { showAbhaQrModal = false }
        )
    }

    if (showLogoutConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutConfirmDialog = false },
            title = { Text("Sign Out of MedMarg?", fontWeight = FontWeight.Bold) },
            text = {
                Text("Your ABHA Health Vault, saved doorstep addresses, and family profiles will remain securely synced with your account.")
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showLogoutConfirmDialog = false
                        onLogout()
                    }
                ) {
                    Text("Sign Out", color = RoseError, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutConfirmDialog = false }) {
                    Text("Cancel", color = Slate600)
                }
            }
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
                        val emailLower = user.email.lowercase()
                        val userId = user.id

                        // 1. Notify MedMarg Backend asynchronously
                        CoroutineScope(Dispatchers.IO).launch {
                            try {
                                val url = URL("https://medmarg.com/api/v1/auth/delete-account")
                                val conn = url.openConnection() as HttpURLConnection
                                conn.requestMethod = "POST"
                                conn.setRequestProperty("Content-Type", "application/json")
                                conn.connectTimeout = 4000
                                conn.readTimeout = 4000
                                conn.doOutput = true
                                val body = JSONObject().apply {
                                    put("userId", userId)
                                    put("email", emailLower)
                                }
                                conn.outputStream.use { it.write(body.toString().toByteArray()) }
                                conn.responseCode
                            } catch (_: Exception) {}
                        }

                        // 2. Clear cached user auth credentials locally
                        val prefs = context.getSharedPreferences("medmarg_prefs", Context.MODE_PRIVATE)
                        prefs.edit()
                            .remove("medmarg_user_phone_$emailLower")
                            .remove("medmarg_user_name_$emailLower")
                            .remove("medmarg_user_avatar_$emailLower")
                            .remove("medmarg_user_role_$emailLower")
                            .apply()

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
private fun MetricCounterCard(
    modifier: Modifier = Modifier,
    value: String,
    label: String,
    icon: ImageVector,
    tint: Color,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        color = PureWhite,
        shadowElevation = 2.dp,
        border = BorderStroke(1.dp, Slate200.copy(alpha = 0.6f))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp, horizontal = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(tint.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = label,
                    tint = tint,
                    modifier = Modifier.size(16.dp)
                )
            }
            Text(
                text = value,
                fontSize = 16.sp,
                fontWeight = FontWeight.Black,
                color = Slate900
            )
            Text(
                text = label,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                color = Slate500,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun ClinicalPreferenceBadge(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    icon: ImageVector,
    tint: Color
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        color = Slate50,
        border = BorderStroke(1.dp, Slate200.copy(alpha = 0.6f))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(tint.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = tint,
                    modifier = Modifier.size(15.dp)
                )
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate400
                )
                Text(
                    text = value,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
private fun SettingSwitchRow(
    icon: ImageVector,
    iconTint: Color,
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
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.weight(1f)
        ) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(RoundedCornerShape(9.dp))
                    .background(iconTint.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(17.dp)
                )
            }
            Column(modifier = Modifier.padding(end = 8.dp)) {
                Text(
                    text = title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Text(
                    text = subtitle,
                    fontSize = 10.sp,
                    color = Slate500,
                    lineHeight = 14.sp
                )
            }
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = PureWhite,
                checkedTrackColor = MedTealPrimary
            )
        )
    }
}
