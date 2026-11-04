package com.medmarg.patient.ui.profile

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.data.PatientSessionStore
import com.medmarg.patient.model.FamilyMember
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*

/**
 * 1-on-1 Replicated Family Beneficiaries Management Modal (`ios/CareSeekerProfileView.swift` lines 1000-1122).
 */
@Composable
fun FamilyMembersModal(
    user: UserProfile,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var nameInput by remember { mutableStateOf("") }
    var relationInput by remember { mutableStateOf("Mother") }
    var ageInput by remember { mutableStateOf("54") }
    var genderInput by remember { mutableStateOf("Female") }
    var bloodGroupInput by remember { mutableStateOf("O+") }
    var errorMsg by remember { mutableStateOf("") }

    val relations = listOf("Mother", "Father", "Spouse", "Son", "Daughter", "Other")
    val bloodGroups = listOf("O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-")

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 12.dp, vertical = 18.dp),
            shape = RoundedCornerShape(24.dp),
            color = PureWhite,
            shadowElevation = 24.dp
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 18.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Linked Family Beneficiaries",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Black,
                            color = Slate900
                        )
                        Text(
                            text = "One-tap booking & ABHA health vault for your family",
                            fontSize = 11.sp,
                            color = Slate500
                        )
                    }
                    Surface(
                        onClick = onDismiss,
                        shape = CircleShape,
                        color = Slate100,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate600, modifier = Modifier.size(16.dp))
                        }
                    }
                }

                HorizontalDivider(color = Slate100)

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "REGISTERED BENEFICIARIES (${PatientSessionStore.familyMembers.size})",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate500,
                        letterSpacing = 0.6.sp
                    )

                    PatientSessionStore.familyMembers.forEachIndexed { index, member ->
                        val abhaNum = remember(member.id) {
                            "91-${3400 + index * 217}-${7100 + index * 113}-${1920 + index * 89}"
                        }
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            color = Slate50,
                            border = BorderStroke(1.dp, Slate200)
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
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column {
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
                                                shape = RoundedCornerShape(6.dp),
                                                color = MedTealPrimary.copy(alpha = 0.12f)
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
                                                shape = RoundedCornerShape(6.dp),
                                                color = RoseError.copy(alpha = 0.1f)
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
                                            color = Slate500,
                                            modifier = Modifier.padding(top = 3.dp)
                                        )
                                    }
                                }

                                if (!member.relationship.equals("Self", ignoreCase = true)) {
                                    IconButton(
                                        onClick = {
                                            PatientSessionStore.familyMembers.remove(member)
                                            PatientSessionStore.saveFamilyMembers(context, user)
                                        },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.DeleteOutline,
                                            contentDescription = "Remove",
                                            tint = RoseError,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }

                    HorizontalDivider(color = Slate200, modifier = Modifier.padding(vertical = 6.dp))

                    Text(
                        text = "LINK NEW FAMILY BENEFICIARY",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate500,
                        letterSpacing = 0.6.sp
                    )

                    if (errorMsg.isNotEmpty()) {
                        Text(errorMsg, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = RoseError)
                    }

                    OutlinedTextField(
                        value = nameInput,
                        onValueChange = {
                            nameInput = it
                            errorMsg = ""
                        },
                        label = { Text("Family Member Full Name *") },
                        placeholder = { Text("e.g., Lakshmi Devi") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )

                    Text(
                        text = "RELATIONSHIP",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate500
                    )
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        relations.forEach { rel ->
                            val isSel = relationInput == rel
                            Surface(
                                onClick = {
                                    relationInput = rel
                                    genderInput = when (rel) {
                                        "Mother", "Daughter", "Spouse" -> "Female"
                                        "Father", "Son" -> "Male"
                                        else -> genderInput
                                    }
                                },
                                color = if (isSel) MedTealPrimary else Slate50,
                                shape = RoundedCornerShape(10.dp),
                                border = BorderStroke(1.dp, if (isSel) MedTealPrimary else Slate200)
                            ) {
                                Text(
                                    text = rel,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSel) PureWhite else Slate700,
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp)
                                )
                            }
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = ageInput,
                            onValueChange = { ageInput = it.filter { c -> c.isDigit() }.take(3) },
                            label = { Text("Age (Years)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            singleLine = true
                        )

                        Column(modifier = Modifier.weight(1.2f)) {
                            Text(
                                text = "GENDER",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate500
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                listOf("Female", "Male").forEach { g ->
                                    val sel = genderInput == g
                                    Surface(
                                        onClick = { genderInput = g },
                                        modifier = Modifier.weight(1f),
                                        shape = RoundedCornerShape(10.dp),
                                        color = if (sel) MedTealLight else Slate50,
                                        border = BorderStroke(1.dp, if (sel) MedTealPrimary else Slate200)
                                    ) {
                                        Box(
                                            modifier = Modifier.padding(vertical = 10.dp),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = g,
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (sel) MedTealPrimary else Slate700
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Text(
                        text = "BLOOD GROUP",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate500
                    )
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        bloodGroups.forEach { bg ->
                            val sel = bloodGroupInput == bg
                            Surface(
                                onClick = { bloodGroupInput = bg },
                                shape = RoundedCornerShape(10.dp),
                                color = if (sel) RoseError else Slate50,
                                border = BorderStroke(1.dp, if (sel) RoseError else Slate200)
                            ) {
                                Text(
                                    text = bg,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (sel) PureWhite else Slate700,
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp)
                                )
                            }
                        }
                    }
                }

                HorizontalDivider(color = Slate100)

                Box(modifier = Modifier.padding(16.dp)) {
                    Button(
                        onClick = {
                            if (nameInput.trim().length < 2) {
                                errorMsg = "Please enter the family member's full name."
                                return@Button
                            }
                            PatientSessionStore.familyMembers.add(
                                FamilyMember(
                                    id = "fam_${System.currentTimeMillis()}",
                                    name = nameInput.trim(),
                                    relationship = relationInput,
                                    age = ageInput.toIntOrNull() ?: 45,
                                    gender = genderInput,
                                    bloodGroup = bloodGroupInput.ifEmpty { "O+" }
                                )
                            )
                            PatientSessionStore.saveFamilyMembers(context, user)
                            nameInput = ""
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                    ) {
                        Icon(
                            Icons.Default.PersonAdd,
                            contentDescription = null,
                            tint = PureWhite,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Link Family Beneficiary",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = PureWhite
                        )
                    }
                }
            }
        }
    }
}
