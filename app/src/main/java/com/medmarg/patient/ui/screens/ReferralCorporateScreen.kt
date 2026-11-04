package com.medmarg.patient.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*

data class CorporateStaffEntry(
    val id: String,
    val name: String,
    val department: String,
    val packageAssigned: String,
    val status: String
)

/**
 * 1-on-1 Replicated Refer & Earn ₹200 + Corporate Wellness Hub (`ios/CareSeekerReferralCorporateView.swift`).
 */
@Composable
fun ReferralCorporateScreen(
    user: UserProfile,
    initialSubTab: Int = 0,
    onNavigateToCatalog: () -> Unit = {}
) {
    val context = LocalContext.current
    var activeSegment by remember(initialSubTab) { mutableIntStateOf(if (initialSubTab >= 1) 1 else 0) }
    var showAddStaffDialog by remember { mutableStateOf(false) }

    val referralCode = remember(user.name) {
        val prefix = user.name.filter { it.isLetter() }.take(4).uppercase().ifEmpty { "MEDM" }
        "${prefix}200"
    }

    val staffRoster = remember {
        mutableStateListOf(
            CorporateStaffEntry("EMP-101", "Kiran Kumar Reddy", "Engineering • Tirupati", "Annual Executive Full Body (88 Tests)", "Report Ready"),
            CorporateStaffEntry("EMP-102", "Sravani Devi", "Finance & Ops • Tirupati", "Women Wellness Gold Panel", "Sample Collected"),
            CorporateStaffEntry("EMP-103", "Ramesh Babu", "Field Logistics • Renigunta", "Cardiac & Diabetes Screening", "Scheduled Tomorrow")
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .padding(bottom = 84.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Segmented Switcher
        Surface(
            shape = RoundedCornerShape(14.dp),
            color = PureWhite,
            border = BorderStroke(1.dp, Slate200)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(4.dp)
            ) {
                listOf(
                    0 to "Refer & Earn ₹200",
                    1 to "Corporate Wellness"
                ).forEach { (idx, title) ->
                    val selected = activeSegment == idx
                    Surface(
                        onClick = { activeSegment = idx },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        color = if (selected) MedTealPrimary else Color.Transparent
                    ) {
                        Box(
                            modifier = Modifier.padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = title,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (selected) PureWhite else Slate600
                            )
                        }
                    }
                }
            }
        }

        if (activeSegment == 0) {
            // 1. Refer & Earn Hero Card
            Surface(
                shape = RoundedCornerShape(22.dp),
                shadowElevation = 6.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(
                                listOf(
                                    Color(0xFF0A3A31),
                                    Color(0xFF0D7C66)
                                )
                            )
                        )
                        .padding(20.dp)
                ) {
                    Surface(
                        color = PureWhite.copy(alpha = 0.16f),
                        shape = RoundedCornerShape(50)
                    ) {
                        Text(
                            text = "TIRUPATI FAMILY HEALTH REWARDS",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF6EE7B7),
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Give ₹200, Get ₹200 in Health Credits",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        color = PureWhite,
                        lineHeight = 28.sp
                    )

                    Text(
                        text = "Invite friends or family in Tirupati for doorstep blood tests. They get ₹200 off their first booking, and you earn ₹200 in your MedMarg Wallet.",
                        fontSize = 12.sp,
                        color = PureWhite.copy(alpha = 0.85f),
                        modifier = Modifier.padding(top = 6.dp),
                        lineHeight = 17.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Referral Code Box
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = PureWhite
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "YOUR INVITE CODE",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate400
                                )
                                Text(
                                    text = referralCode,
                                    fontSize = 20.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Black,
                                    color = MedTealPrimary
                                )
                            }

                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedButton(
                                    onClick = {
                                        val cb = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                        cb.setPrimaryClip(ClipData.newPlainText("MedMarg Referral", referralCode))
                                        Toast.makeText(context, "Referral code $referralCode copied!", Toast.LENGTH_SHORT).show()
                                    },
                                    shape = RoundedCornerShape(10.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Copy", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }

                                Button(
                                    onClick = {
                                        val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                            type = "text/plain"
                                            putExtra(
                                                Intent.EXTRA_TEXT,
                                                "Book NABL accredited doorstep blood tests in 60 mins with MedMarg! Use my code $referralCode to get ₹200 OFF your first health checkup: https://medmarg.com"
                                            )
                                        }
                                        context.startActivity(Intent.createChooser(shareIntent, "Share Referral Code"))
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                                    shape = RoundedCornerShape(10.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Share", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            // Wallet Summary Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ReferralStatBox(Modifier.weight(1f), "Wallet Balance", "₹400", EmeraldSuccess)
                ReferralStatBox(Modifier.weight(1f), "Friends Joined", "2 Verified", MedTealPrimary)
                ReferralStatBox(Modifier.weight(1f), "Pending Credits", "₹200", AmberWarning)
            }

            // How It Works Card
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = PureWhite,
                border = BorderStroke(1.dp, Slate200)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "How MedMarg Referral Works",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Slate900
                    )
                    ReferralStepRow("1", "Share your invite code via WhatsApp or SMS", "Your friend signs up and enters $referralCode at checkout.")
                    ReferralStepRow("2", "60-Min Doorstep Sample Collection", "Our certified phlebotomist collects their sample at home.")
                    ReferralStepRow("3", "Instant ₹200 Health Wallet Credit", "Use your credits on any Full Body Package or family test.")
                }
            }
        } else {
            // Corporate Wellness & Staff Roster
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = PureWhite,
                border = BorderStroke(1.dp, Slate200)
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Corporate Annual Health Desk",
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Black,
                                color = Slate900
                            )
                            Text(
                                text = "Manage employee health checkups, GST invoices & bulk camp scheduling",
                                fontSize = 11.sp,
                                color = Slate500
                            )
                        }

                        Button(
                            onClick = { showAddStaffDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Icon(Icons.Default.PersonAdd, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Add Staff", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    HorizontalDivider(color = Slate100)

                    staffRoster.forEach { emp ->
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = Slate50,
                            border = BorderStroke(1.dp, Slate200)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text(
                                            text = emp.name,
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Slate900
                                        )
                                        Text(
                                            text = emp.id,
                                            fontSize = 10.sp,
                                            fontFamily = FontFamily.Monospace,
                                            fontWeight = FontWeight.Bold,
                                            color = Slate500
                                        )
                                    }
                                    Text(
                                        text = emp.department,
                                        fontSize = 11.sp,
                                        color = Slate500
                                    )
                                    Text(
                                        text = emp.packageAssigned,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = MedTealPrimary,
                                        modifier = Modifier.padding(top = 2.dp)
                                    )
                                }

                                Surface(
                                    shape = RoundedCornerShape(50),
                                    color = MedTealLight
                                ) {
                                    Text(
                                        text = emp.status,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MedTealPrimary,
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showAddStaffDialog) {
        var empName by remember { mutableStateOf("") }
        var empDept by remember { mutableStateOf("Operations • Tirupati") }
        var empPkg by remember { mutableStateOf("Annual Executive Full Body (88 Tests)") }

        Dialog(onDismissRequest = { showAddStaffDialog = false }) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = PureWhite
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Enroll Employee for Wellness Check",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )
                    OutlinedTextField(
                        value = empName,
                        onValueChange = { empName = it },
                        label = { Text("Employee Full Name *") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = empDept,
                        onValueChange = { empDept = it },
                        label = { Text("Department & Branch") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = empPkg,
                        onValueChange = { empPkg = it },
                        label = { Text("Wellness Package") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(onClick = { showAddStaffDialog = false }) {
                            Text("Cancel")
                        }
                        Button(
                            onClick = {
                                if (empName.isNotBlank()) {
                                    staffRoster.add(
                                        0,
                                        CorporateStaffEntry(
                                            id = "EMP-${104 + staffRoster.size}",
                                            name = empName.trim(),
                                            department = empDept.trim(),
                                            packageAssigned = empPkg.trim(),
                                            status = "Slot Assigned"
                                        )
                                    )
                                    showAddStaffDialog = false
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                        ) {
                            Text("Enroll Employee")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ReferralStatBox(
    modifier: Modifier = Modifier,
    label: String,
    value: String,
    tint: Color
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        color = PureWhite,
        border = BorderStroke(1.dp, Slate200)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = value,
                fontSize = 16.sp,
                fontWeight = FontWeight.Black,
                color = tint
            )
            Text(
                text = label,
                fontSize = 10.sp,
                fontWeight = FontWeight.SemiBold,
                color = Slate500,
                modifier = Modifier.padding(top = 2.dp)
            )
        }
    }
}

@Composable
private fun ReferralStepRow(step: String, title: String, subtitle: String) {
    Row(
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Box(
            modifier = Modifier
                .size(26.dp)
                .clip(CircleShape)
                .background(MedTealLight),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = step,
                fontSize = 12.sp,
                fontWeight = FontWeight.Black,
                color = MedTealPrimary
            )
        }
        Column {
            Text(
                text = title,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
            Text(
                text = subtitle,
                fontSize = 11.sp,
                color = Slate500
            )
        }
    }
}

