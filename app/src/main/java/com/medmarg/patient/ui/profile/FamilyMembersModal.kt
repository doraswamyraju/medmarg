package com.medmarg.patient.ui.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.medmarg.patient.data.PatientSessionStore
import com.medmarg.patient.model.FamilyMember
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*

/**
 * Modular Family Beneficiaries Management Modal.
 */
@Composable
fun FamilyMembersModal(
    user: UserProfile,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var nameInput by remember { mutableStateOf("") }
    var relationInput by remember { mutableStateOf("Mother") }
    var ageInput by remember { mutableStateOf("45") }
    var genderInput by remember { mutableStateOf("Female") }
    var bloodGroupInput by remember { mutableStateOf("O+") }
    var errorMsg by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .wrapContentHeight(),
            shape = RoundedCornerShape(22.dp),
            color = PureWhite,
            shadowElevation = 24.dp
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Linked Family Beneficiaries",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate500)
                    }
                }

                Text(
                    text = "Book diagnostic tests for parents, spouse, or children under a single MedMarg account.",
                    fontSize = 11.sp,
                    color = Slate500,
                    modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
                )

                // Existing Members List
                PatientSessionStore.familyMembers.forEach { member ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = Slate50),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                Box(
                                    modifier = Modifier
                                        .size(34.dp)
                                        .clip(CircleShape)
                                        .background(MedTealLight),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = member.name.take(1).uppercase(),
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MedTealPrimary
                                    )
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = "${member.name} (${member.relationship})",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Slate900
                                    )
                                    Text(
                                        text = "${member.age} Yrs • ${member.gender} • Blood: ${member.bloodGroup}",
                                        fontSize = 10.sp,
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
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(Icons.Default.DeleteOutline, contentDescription = "Remove", tint = RoseError, modifier = Modifier.size(18.dp))
                                }
                            }
                        }
                    }
                }

                HorizontalDivider(color = Slate200, modifier = Modifier.padding(vertical = 12.dp))

                Text(
                    text = "ADD NEW FAMILY MEMBER",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate500
                )

                if (errorMsg.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(errorMsg, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = RoseError)
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = nameInput,
                    onValueChange = {
                        nameInput = it
                        errorMsg = ""
                    },
                    label = { Text("Family Member Full Name") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("Mother", "Father", "Spouse", "Child").forEach { rel ->
                        val isSel = relationInput == rel
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .clickable {
                                    relationInput = rel
                                    genderInput = if (rel == "Mother" || rel == "Spouse") "Female" else "Male"
                                },
                            color = if (isSel) MedTealLight else Slate50,
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) MedTealPrimary else Slate200)
                        ) {
                            Text(
                                text = rel,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSel) MedTealPrimary else Slate700,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = ageInput,
                        onValueChange = { ageInput = it.filter { c -> c.isDigit() }.take(3) },
                        label = { Text("Age (Yrs)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = bloodGroupInput,
                        onValueChange = { bloodGroupInput = it },
                        label = { Text("Blood Group") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Button(
                    onClick = {
                        if (nameInput.trim().length < 2) {
                            errorMsg = "Please enter family member's full name."
                            return@Button
                        }
                        PatientSessionStore.familyMembers.add(
                            FamilyMember(
                                id = "fam_${System.currentTimeMillis()}",
                                name = nameInput.trim(),
                                relationship = relationInput,
                                age = ageInput.toIntOrNull() ?: 35,
                                gender = genderInput,
                                bloodGroup = bloodGroupInput.ifEmpty { "O+" }
                            )
                        )
                        PatientSessionStore.saveFamilyMembers(context, user)
                        nameInput = ""
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(46.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                ) {
                    Icon(Icons.Default.PersonAdd, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Add Family Beneficiary", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                }
            }
        }
    }
}

