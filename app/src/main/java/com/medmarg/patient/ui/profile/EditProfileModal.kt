package com.medmarg.patient.ui.profile

import android.content.Context
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import com.medmarg.patient.data.PatientSessionStore
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*

/**
 * 1-on-1 Replicated Patient & Clinical Collection Preferences Editor (`ios/CareSeekerProfileView.swift` lines 817-926).
 * Supports photo avatar picker, name, phone, email, and clinical phlebotomy preferences.
 */
@Composable
fun EditProfileModal(
    user: UserProfile,
    onDismiss: () -> Unit,
    onUserUpdated: (UserProfile) -> Unit
) {
    val context = LocalContext.current
    val meta = PatientSessionStore.medicalMeta

    var avatarUrlInput by remember { mutableStateOf(user.avatarUrl) }
    var nameInput by remember { mutableStateOf(user.name) }
    var phoneInput by remember { mutableStateOf(user.phone) }
    var emailInput by remember { mutableStateOf(user.email) }
    var ageInput by remember { mutableStateOf(meta.age.toString()) }
    var genderInput by remember { mutableStateOf(meta.gender) }
    var bloodGroupInput by remember { mutableStateOf(meta.bloodGroup) }
    var needleSensitivityInput by remember { mutableStateOf(meta.needleSensitivity) }
    var preferredLanguageInput by remember { mutableStateOf(meta.preferredLanguage) }
    var heightWeightInput by remember { mutableStateOf(meta.heightWeight) }
    var allergiesInput by remember { mutableStateOf(meta.allergies) }
    var conditionsInput by remember { mutableStateOf(meta.chronicConditions) }
    var medsInput by remember { mutableStateOf(meta.currentMedications) }
    var emergencyNameInput by remember { mutableStateOf(meta.emergencyContactName) }
    var emergencyPhoneInput by remember { mutableStateOf(meta.emergencyContact.ifEmpty { user.phone }) }

    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) {
            avatarUrlInput = uri.toString()
        }
    }

    val bloodGroups = listOf("O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-")
    val needleOptions = listOf("Butterfly 23G (Sensitive)", "Standard 21G", "Pediatric 25G")
    val languageOptions = listOf("Telugu & English", "Telugu Only", "English Only", "Hindi & English")

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
                            text = "Edit Care Seeker Profile",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Black,
                            color = Slate900
                        )
                        Text(
                            text = "Personal Identity, Photo & Phlebotomy Preferences",
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
                            Icon(
                                Icons.Default.Close,
                                contentDescription = "Close",
                                tint = Slate600,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }

                HorizontalDivider(color = Slate100)

                // Scrollable Body
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Profile Photo Picker Header
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(Slate50)
                            .border(1.dp, Slate200, RoundedCornerShape(16.dp))
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Box(
                            contentAlignment = Alignment.BottomEnd,
                            modifier = Modifier.clickable { photoPickerLauncher.launch("image/*") }
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(68.dp)
                                    .clip(CircleShape)
                                    .background(
                                        Brush.linearGradient(
                                            listOf(
                                                MedTealPrimary.copy(alpha = 0.2f),
                                                MedTealPrimary.copy(alpha = 0.08f)
                                            )
                                        )
                                    )
                                    .border(2.dp, MedTealPrimary, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                if (avatarUrlInput.isNotBlank()) {
                                    AsyncImage(
                                        model = avatarUrlInput,
                                        contentDescription = nameInput,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .clip(CircleShape)
                                    )
                                } else {
                                    Text(
                                        text = nameInput.take(1).uppercase().ifEmpty { "U" },
                                        fontSize = 26.sp,
                                        fontWeight = FontWeight.Black,
                                        color = MedTealPrimary
                                    )
                                }
                            }

                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(CircleShape)
                                    .background(MedTealPrimary),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CameraAlt,
                                    contentDescription = "Upload",
                                    tint = PureWhite,
                                    modifier = Modifier.size(13.dp)
                                )
                            }
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Profile Photo",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                            Text(
                                text = "Tap camera icon to change your photo",
                                fontSize = 11.sp,
                                color = Slate500
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Surface(
                                onClick = { photoPickerLauncher.launch("image/*") },
                                shape = RoundedCornerShape(8.dp),
                                color = MedTealLight
                            ) {
                                Text(
                                    text = "Choose from Gallery",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MedTealPrimary,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }

                    Text(
                        text = "PERSONAL DETAILS",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate500,
                        letterSpacing = 0.6.sp
                    )

                    OutlinedTextField(
                        value = nameInput,
                        onValueChange = { nameInput = it },
                        label = { Text("Patient Full Name") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = phoneInput,
                            onValueChange = { phoneInput = it },
                            label = { Text("Mobile Number") },
                            modifier = Modifier.weight(1.2f),
                            shape = RoundedCornerShape(12.dp),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = ageInput,
                            onValueChange = { ageInput = it.filter { c -> c.isDigit() }.take(3) },
                            label = { Text("Age (Yrs)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(0.8f),
                            shape = RoundedCornerShape(12.dp),
                            singleLine = true
                        )
                    }

                    OutlinedTextField(
                        value = emailInput,
                        onValueChange = { emailInput = it },
                        label = { Text("Email Address (For Reports & Google Sync)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )

                    // Gender Selector
                    Text(
                        text = "BIOLOGICAL SEX",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate500,
                        letterSpacing = 0.6.sp
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("Male", "Female", "Other").forEach { g ->
                            val selected = genderInput.equals(g, ignoreCase = true)
                            Surface(
                                onClick = { genderInput = g },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp),
                                color = if (selected) MedTealPrimary else Slate50,
                                border = BorderStroke(1.dp, if (selected) MedTealPrimary else Slate200)
                            ) {
                                Box(
                                    modifier = Modifier.padding(vertical = 9.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = g,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (selected) PureWhite else Slate700
                                    )
                                }
                            }
                        }
                    }

                    // Blood Group Selector
                    Text(
                        text = "BLOOD GROUP",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate500,
                        letterSpacing = 0.6.sp
                    )
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        bloodGroups.forEach { bg ->
                            val selected = bloodGroupInput == bg
                            Surface(
                                onClick = { bloodGroupInput = bg },
                                shape = RoundedCornerShape(10.dp),
                                color = if (selected) RoseError else Slate50,
                                border = BorderStroke(1.dp, if (selected) RoseError else Slate200)
                            ) {
                                Text(
                                    text = bg,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (selected) PureWhite else Slate700,
                                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                                )
                            }
                        }
                    }

                    // Needle Gauge Sensitivity Selector
                    Text(
                        text = "PHLEBOTOMY NEEDLE GAUGE PREFERENCE",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate500,
                        letterSpacing = 0.6.sp
                    )
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        needleOptions.forEach { option ->
                            val selected = needleSensitivityInput == option
                            Surface(
                                onClick = { needleSensitivityInput = option },
                                shape = RoundedCornerShape(10.dp),
                                color = if (selected) MedTealLight else Slate50,
                                border = BorderStroke(1.dp, if (selected) MedTealPrimary else Slate200)
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 12.dp, vertical = 10.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = option,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (selected) MedTealPrimary else Slate800
                                    )
                                    if (selected) {
                                        Icon(
                                            imageVector = Icons.Default.CheckCircle,
                                            contentDescription = null,
                                            tint = MedTealPrimary,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Communication Language Selector
                    Text(
                        text = "PHLEBOTOMIST COMMUNICATION LANGUAGE",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate500,
                        letterSpacing = 0.6.sp
                    )
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        languageOptions.forEach { lang ->
                            val selected = preferredLanguageInput == lang
                            Surface(
                                onClick = { preferredLanguageInput = lang },
                                shape = RoundedCornerShape(10.dp),
                                color = if (selected) MedTealPrimary else Slate50,
                                border = BorderStroke(1.dp, if (selected) MedTealPrimary else Slate200)
                            ) {
                                Text(
                                    text = lang,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (selected) PureWhite else Slate700,
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                                )
                            }
                        }
                    }

                    Text(
                        text = "CLINICAL HISTORY & EMERGENCY CONTACT",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate500,
                        letterSpacing = 0.6.sp
                    )

                    OutlinedTextField(
                        value = heightWeightInput,
                        onValueChange = { heightWeightInput = it },
                        label = { Text("Height / Weight (e.g., 174cm / 70kg)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = allergiesInput,
                        onValueChange = { allergiesInput = it },
                        label = { Text("Known Allergies (Latex, Spirit, Medications)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = conditionsInput,
                        onValueChange = { conditionsInput = it },
                        label = { Text("Chronic Conditions (Diabetes, Thyroid, BP)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = medsInput,
                        onValueChange = { medsInput = it },
                        label = { Text("Current Regular Medications") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = emergencyNameInput,
                            onValueChange = { emergencyNameInput = it },
                            label = { Text("Emergency Contact Name") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = emergencyPhoneInput,
                            onValueChange = { emergencyPhoneInput = it },
                            label = { Text("Emergency Phone") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            singleLine = true
                        )
                    }
                }

                HorizontalDivider(color = Slate100)

                // Footer Save Button
                Box(modifier = Modifier.padding(16.dp)) {
                    Button(
                        onClick = {
                            val cleanEmail = emailInput.trim().lowercase().ifEmpty { user.email.lowercase() }
                            val updatedUser = user.copy(
                                name = nameInput.trim().ifEmpty { user.name },
                                phone = phoneInput.trim().ifEmpty { user.phone },
                                email = cleanEmail,
                                avatarUrl = avatarUrlInput
                            )
                            val updatedMeta = meta.copy(
                                age = ageInput.toIntOrNull() ?: 29,
                                gender = genderInput.ifEmpty { "Male" },
                                bloodGroup = bloodGroupInput.ifEmpty { "O+" },
                                needleSensitivity = needleSensitivityInput,
                                preferredLanguage = preferredLanguageInput,
                                heightWeight = heightWeightInput.ifEmpty { "174cm / 70kg" },
                                allergies = allergiesInput.ifEmpty { "None reported" },
                                chronicConditions = conditionsInput.ifEmpty { "None reported" },
                                currentMedications = medsInput.ifEmpty { "None" },
                                emergencyContactName = emergencyNameInput.ifEmpty { "Family Emergency" },
                                emergencyContact = emergencyPhoneInput.ifEmpty { updatedUser.phone }
                            )

                            // Persist to SharedPreferences so it survives sessions
                            val prefs = context.getSharedPreferences("medmarg_auth_prefs", Context.MODE_PRIVATE)
                            prefs.edit()
                                .putString("medmarg_user_name_$cleanEmail", updatedUser.name)
                                .putString("medmarg_user_phone_$cleanEmail", updatedUser.phone)
                                .putString("medmarg_user_avatar_$cleanEmail", updatedUser.avatarUrl)
                                .putString("last_logged_in_name", updatedUser.name)
                                .putString("last_logged_in_phone", updatedUser.phone)
                                .apply()

                            PatientSessionStore.saveMedicalMeta(context, updatedUser, updatedMeta)
                            onUserUpdated(updatedUser)
                            onDismiss()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = PureWhite,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Save Profile & Preferences",
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
