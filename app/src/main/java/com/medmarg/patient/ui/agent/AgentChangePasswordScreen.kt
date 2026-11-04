package com.medmarg.patient.ui.agent

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// =========================================================================
// 🔒 AGENT CHANGE PASSWORD SCREEN
// 1-on-1 replication of ios/Agent/Views/AgentChangePasswordView.swift
// =========================================================================

@Composable
fun AgentChangePasswordScreen(
    user: UserProfile,
    onBack: () -> Unit,
    onPasswordUpdated: () -> Unit = {}
) {
    val coroutineScope = rememberCoroutineScope()

    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    var isCurrentPasswordVisible by remember { mutableStateOf(false) }
    var isNewPasswordVisible by remember { mutableStateOf(false) }
    var isConfirmPasswordVisible by remember { mutableStateOf(false) }

    var isSubmitting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }
    var forgotPasswordStatus by remember { mutableStateOf<String?>(null) }

    val effectiveAgentId = if (user.username.isNotEmpty()) user.username else if (user.id.isNotEmpty()) user.id else "AG-01"

    val hasMinLength = newPassword.length >= 8
    val hasUppercase = newPassword.any { it.isUpperCase() }
    val hasLowercase = newPassword.any { it.isLowerCase() }
    val hasNumber = newPassword.any { it.isDigit() }
    val hasSpecialChar = newPassword.any { !it.isLetterOrDigit() }

    val strengthScore = remember(hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar) {
        var score = 0
        if (hasMinLength) score += 1
        if (hasUppercase && hasLowercase) score += 1
        if (hasNumber) score += 1
        if (hasSpecialChar) score += 1
        score
    }

    val (strengthLabel, strengthColor) = when (strengthScore) {
        0, 1 -> "Weak" to RoseError
        2 -> "Fair" to Color(0xFFF97316)
        3 -> "Good" to Color(0xFFEAB308)
        4 -> "Strong" to EmeraldAccent
        else -> "" to Slate200
    }

    val canSubmit = currentPassword.isNotEmpty() &&
        hasMinLength &&
        hasUppercase &&
        hasLowercase &&
        hasNumber &&
        hasSpecialChar &&
        newPassword == confirmPassword &&
        !isSubmitting

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Back button & Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Icon(
                imageVector = Icons.Default.ArrowBack,
                contentDescription = "Back",
                tint = Slate900,
                modifier = Modifier
                    .size(22.dp)
                    .clickable { onBack() }
            )
            Text("Change Password", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Slate900)
        }

        Text("Update your password to keep your account secure", fontSize = 12.sp, color = Slate500)

        // 2. Keep Your Account Secure Banner
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
        ) {
            Row(
                modifier = Modifier.padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(MedTealLight),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Security, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(22.dp))
                }
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text("Keep Your Account Secure", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                    Text(
                        "Use a strong password to protect your MedMarg agent account and personal information.",
                        fontSize = 11.sp,
                        color = Slate500
                    )
                }
            }
        }

        errorMessage?.let { err ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(RoseError)
                    .padding(10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(Icons.Default.Warning, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                Text(err, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite)
            }
        }

        successMessage?.let { succ ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(EmeraldAccent)
                    .padding(10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                Text(succ, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite)
            }
        }

        // 3. Current Password Field
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Current Password", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                Text(
                    text = "Forgot?",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MedTealPrimary,
                    modifier = Modifier.clickable {
                        coroutineScope.launch {
                            forgotPasswordStatus = AgentRepository.sendForgotPasswordEmail(user.email, effectiveAgentId)
                        }
                    }
                )
            }

            OutlinedTextField(
                value = currentPassword,
                onValueChange = { currentPassword = it },
                placeholder = { Text("Enter your current password") },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                trailingIcon = {
                    IconButton(onClick = { isCurrentPasswordVisible = !isCurrentPasswordVisible }) {
                        Icon(if (isCurrentPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility, contentDescription = null)
                    }
                },
                visualTransformation = if (isCurrentPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
        }

        // 4. New Password Field
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("New Password", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
            OutlinedTextField(
                value = newPassword,
                onValueChange = { newPassword = it },
                placeholder = { Text("Enter new password") },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                trailingIcon = {
                    IconButton(onClick = { isNewPasswordVisible = !isNewPasswordVisible }) {
                        Icon(if (isNewPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility, contentDescription = null)
                    }
                },
                visualTransformation = if (isNewPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            // 4-Segment Strength Meter Bar
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                (1..4).forEach { idx ->
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(4.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(if (idx <= strengthScore) strengthColor else Slate200)
                    )
                }
            }
            Text(
                text = if (newPassword.isNotEmpty()) "Password strength: $strengthLabel" else "Password strength",
                fontSize = 10.sp,
                fontWeight = if (newPassword.isNotEmpty()) FontWeight.Bold else FontWeight.Normal,
                color = if (newPassword.isNotEmpty()) strengthColor else Slate500
            )
        }

        // 5. Confirm New Password Field
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Confirm New Password", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
            OutlinedTextField(
                value = confirmPassword,
                onValueChange = { confirmPassword = it },
                placeholder = { Text("Confirm new password") },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                trailingIcon = {
                    IconButton(onClick = { isConfirmPasswordVisible = !isConfirmPasswordVisible }) {
                        Icon(if (isConfirmPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility, contentDescription = null)
                    }
                },
                visualTransformation = if (isConfirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                isError = confirmPassword.isNotEmpty() && confirmPassword != newPassword,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            if (confirmPassword.isNotEmpty() && confirmPassword != newPassword) {
                Text("Passwords do not match", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = RoseError)
            }
        }

        // 6. Password Requirements Checklist
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = PureWhite),
            border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Password Requirements", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
                listOf(
                    "At least 8 characters" to hasMinLength,
                    "Includes at least one uppercase letter (A-Z)" to hasUppercase,
                    "Includes at least one lowercase letter (a-z)" to hasLowercase,
                    "Includes at least one number (0-9)" to hasNumber,
                    "Includes at least one special character (e.g. ! @ # $ % ^ & *)" to hasSpecialChar
                ).forEach { (label, met) ->
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(
                            imageVector = if (met) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
                            contentDescription = null,
                            tint = if (met) EmeraldAccent else Slate400,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(label, fontSize = 11.sp, color = if (met) Slate900 else Slate500)
                    }
                }
            }
        }

        // 7. Update Password Button
        Button(
            onClick = {
                coroutineScope.launch {
                    isSubmitting = true
                    errorMessage = null
                    successMessage = null
                    val (ok, msg) = AgentRepository.changePassword(
                        userId = effectiveAgentId,
                        email = user.email,
                        currentPassword = currentPassword,
                        newPassword = newPassword
                    )
                    isSubmitting = false
                    if (ok) {
                        successMessage = msg
                        currentPassword = ""
                        newPassword = ""
                        confirmPassword = ""
                        onPasswordUpdated()
                        delay(1200L)
                        onBack()
                    } else {
                        errorMessage = msg
                    }
                }
            },
            enabled = canSubmit,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = MedTealDark),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(
                text = if (isSubmitting) "Updating..." else "Update Password",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = PureWhite,
                modifier = Modifier.padding(vertical = 6.dp)
            )
        }

        Spacer(modifier = Modifier.height(60.dp))
    }

    forgotPasswordStatus?.let { statusMsg ->
        AlertDialog(
            onDismissRequest = { forgotPasswordStatus = null },
            title = { Text("Forgot Password Link Dispatched", fontWeight = FontWeight.Black, fontSize = 16.sp) },
            text = { Text(statusMsg, fontSize = 12.sp, color = Slate700) },
            confirmButton = {
                Button(
                    onClick = { forgotPasswordStatus = null },
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                ) {
                    Text("OK", color = PureWhite, fontWeight = FontWeight.Bold)
                }
            }
        )
    }
}

