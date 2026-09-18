package com.medmarg.patient.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GooglePhoneSheet(
    tempUser: UserProfile,
    onDismissRequest: () -> Unit,
    onConfirmPhone: (String) -> Unit
) {
    var phoneInput by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf("") }

    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        containerColor = PureWhite,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(vertical = 10.dp)
                    .width(40.dp)
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(Slate400.copy(alpha = 0.5f))
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 36.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(EmeraldLight),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Phone,
                    contentDescription = null,
                    tint = EmeraldAccent,
                    modifier = Modifier.size(24.dp)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "Complete Your Profile",
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Slate900
            )

            Text(
                text = "Welcome ${tempUser.name}! Please enter your 10-digit mobile number for doorstep sample collection and SMS report updates.",
                fontSize = 13.sp,
                color = Slate600,
                modifier = Modifier.padding(top = 4.dp),
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(18.dp))

            OutlinedTextField(
                value = phoneInput,
                onValueChange = {
                    if (it.length <= 10 && it.all { char -> char.isDigit() }) {
                        phoneInput = it
                        errorMessage = ""
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Enter 10-digit Mobile Number", color = Slate400, fontSize = 14.sp) },
                prefix = {
                    Text(
                        text = "+91 ",
                        fontWeight = FontWeight.Bold,
                        color = Slate900,
                        fontSize = 14.sp
                    )
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MedTealPrimary,
                    unfocusedBorderColor = Slate200,
                    focusedContainerColor = Slate50,
                    unfocusedContainerColor = Slate50
                ),
                singleLine = true
            )

            if (errorMessage.isNotEmpty()) {
                Text(
                    text = errorMessage,
                    color = RoseError,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(top = 6.dp)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(Slate50)
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Security,
                    contentDescription = null,
                    tint = Slate500,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Your number is encrypted and used only for doorstep delivery & reports.",
                    fontSize = 10.sp,
                    color = Slate500
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Button(
                onClick = {
                    if (phoneInput.length == 10) {
                        onConfirmPhone("+91 $phoneInput")
                    } else {
                        errorMessage = "Please enter a valid 10-digit mobile number"
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
            ) {
                Text(
                    text = "Verify & Access MedMarg",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = PureWhite
                )
            }
        }
    }
}
