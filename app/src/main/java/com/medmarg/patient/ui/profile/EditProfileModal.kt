package com.medmarg.patient.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.medmarg.patient.data.PatientMedicalMeta
import com.medmarg.patient.data.PatientSessionStore
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*

/**
 * Modular Patient Profile & Medical History Editor Modal.
 */
@Composable
fun EditProfileModal(
    user: UserProfile,
    onDismiss: () -> Unit,
    onUserUpdated: (UserProfile) -> Unit
) {
    val context = LocalContext.current
    val meta = PatientSessionStore.medicalMeta

    var nameInput by remember { mutableStateOf(user.name) }
    var phoneInput by remember { mutableStateOf(user.phone) }
    var ageInput by remember { mutableStateOf(meta.age.toString()) }
    var genderInput by remember { mutableStateOf(meta.gender) }
    var bloodGroupInput by remember { mutableStateOf(meta.bloodGroup) }
    var heightWeightInput by remember { mutableStateOf(meta.heightWeight) }
    var allergiesInput by remember { mutableStateOf(meta.allergies) }
    var conditionsInput by remember { mutableStateOf(meta.chronicConditions) }
    var medsInput by remember { mutableStateOf(meta.currentMedications) }
    var emergencyInput by remember { mutableStateOf(meta.emergencyContact.ifEmpty { user.phone }) }

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
                        text = "Edit Patient & Clinical Profile",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate500)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = nameInput,
                    onValueChange = { nameInput = it },
                    label = { Text("Patient Full Name") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = phoneInput,
                    onValueChange = { phoneInput = it },
                    label = { Text("Mobile Number") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

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
                        value = genderInput,
                        onValueChange = { genderInput = it },
                        label = { Text("Gender") },
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

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = heightWeightInput,
                    onValueChange = { heightWeightInput = it },
                    label = { Text("Height / Weight") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = allergiesInput,
                    onValueChange = { allergiesInput = it },
                    label = { Text("Known Allergies") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = conditionsInput,
                    onValueChange = { conditionsInput = it },
                    label = { Text("Chronic Conditions") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = medsInput,
                    onValueChange = { medsInput = it },
                    label = { Text("Current Medications") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = emergencyInput,
                    onValueChange = { emergencyInput = it },
                    label = { Text("Emergency Contact") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        val updatedUser = user.copy(
                            name = nameInput.trim().ifEmpty { user.name },
                            phone = phoneInput.trim().ifEmpty { user.phone }
                        )
                        val updatedMeta = PatientMedicalMeta(
                            age = ageInput.toIntOrNull() ?: 29,
                            gender = genderInput.ifEmpty { "Male" },
                            bloodGroup = bloodGroupInput.ifEmpty { "O+" },
                            heightWeight = heightWeightInput.ifEmpty { "174cm / 70kg" },
                            abhaId = meta.abhaId,
                            allergies = allergiesInput.ifEmpty { "None reported" },
                            chronicConditions = conditionsInput.ifEmpty { "None reported" },
                            currentMedications = medsInput.ifEmpty { "None" },
                            emergencyContact = emergencyInput.ifEmpty { updatedUser.phone }
                        )
                        PatientSessionStore.saveMedicalMeta(context, updatedUser, updatedMeta)
                        onUserUpdated(updatedUser)
                        onDismiss()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                ) {
                    Text("Save Changes", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                }
            }
        }
    }
}

