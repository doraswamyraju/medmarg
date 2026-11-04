package com.medmarg.patient.ui.checkout

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.model.SavedAddress
import com.medmarg.patient.ui.theme.*

/**
 * Modular GPS Doorstep Address Pinpoint Modal (1:1 parity with iOS AddressPinpointModal.swift).
 */
@Composable
fun AddressPinpointModal(
    defaultPhone: String = "",
    onDismiss: () -> Unit,
    onAddressSaved: (SavedAddress) -> Unit
) {
    var selectedTag by remember { mutableStateOf("Home") }
    var houseFlatInput by remember { mutableStateOf("") }
    var areaStreetInput by remember { mutableStateOf("Air Bypass Road, Tirupati") }
    var landmarkInput by remember { mutableStateOf("") }
    var pincodeInput by remember { mutableStateOf("517501") }
    var isDefaultAddress by remember { mutableStateOf(true) }
    var errorMsg by remember { mutableStateOf("") }

    var pinOffsetX by remember { mutableFloatStateOf(0.5f) }
    var pinOffsetY by remember { mutableFloatStateOf(0.5f) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            shape = RoundedCornerShape(24.dp),
            color = PureWhite,
            shadowElevation = 24.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
            ) {
                // Top Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Cancel",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = MedTealPrimary,
                        modifier = Modifier.clickable { onDismiss() }
                    )
                    Text(
                        text = "Pinpoint Collection Address",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Slate900
                    )
                    Icon(
                        imageVector = Icons.Default.MyLocation,
                        contentDescription = "Locate",
                        tint = MedTealPrimary,
                        modifier = Modifier
                            .size(20.dp)
                            .clickable {
                                pinOffsetX = 0.5f
                                pinOffsetY = 0.5f
                                areaStreetInput = "Air Bypass Road, Tirupati"
                            }
                    )
                }

                // Interactive Map Canvas
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(210.dp)
                        .background(Color(0xFFE2E8F0))
                        .clickable {
                            pinOffsetX = (35..65).random() / 100f
                            pinOffsetY = (35..65).random() / 100f
                        }
                ) {
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val w = size.width
                        val h = size.height
                        drawRect(color = Color(0xFFF1F5F9))
                        // City roads
                        listOf(0.28f, 0.55f, 0.80f).forEach { yf ->
                            drawLine(Color.White, Offset(0f, h * yf), Offset(w, h * yf), strokeWidth = 22f)
                        }
                        listOf(0.25f, 0.52f, 0.78f).forEach { xf ->
                            drawLine(Color.White, Offset(w * xf, 0f), Offset(w * xf, h), strokeWidth = 20f)
                        }
                        // GPS accuracy circle
                        val cx = w * pinOffsetX
                        val cy = h * pinOffsetY
                        drawCircle(
                            color = MedTealPrimary.copy(alpha = 0.18f),
                            radius = 48f,
                            center = Offset(cx, cy)
                        )
                        drawCircle(
                            color = MedTealPrimary,
                            radius = 12f,
                            center = Offset(cx, cy)
                        )
                        drawCircle(
                            color = Color.White,
                            radius = 5f,
                            center = Offset(cx, cy)
                        )
                    }

                    Surface(
                        color = PureWhite.copy(alpha = 0.94f),
                        shape = RoundedCornerShape(10.dp),
                        shadowElevation = 4.dp,
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .padding(12.dp)
                    ) {
                        Text(
                            text = "Tap map to adjust exact doorstep pin",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate700,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }

                    Surface(
                        color = PureWhite,
                        shape = RoundedCornerShape(12.dp),
                        shadowElevation = 4.dp,
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .fillMaxWidth()
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.LocationOn, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(22.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = areaStreetInput.ifEmpty { "Tirupati Urban Zone" },
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )
                                Text(
                                    text = "GPS: 13.6288° N, 79.4192° E • Exact Phlebotomist Drop Pin",
                                    fontSize = 10.sp,
                                    color = Slate500
                                )
                            }
                        }
                    }
                }

                // Form Section
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "ADDRESS TAG",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate500
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("Home", "Office", "Parents", "Other").forEach { tag ->
                            val isSel = selectedTag == tag
                            Surface(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(20.dp))
                                    .clickable { selectedTag = tag },
                                color = if (isSel) MedTealLight else Slate50,
                                shape = RoundedCornerShape(20.dp),
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isSel) MedTealPrimary else Slate200
                                )
                            ) {
                                Text(
                                    text = tag,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSel) MedTealPrimary else Slate700,
                                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                                )
                            }
                        }
                    }

                    if (errorMsg.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(errorMsg, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = RoseError)
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = houseFlatInput,
                        onValueChange = {
                            houseFlatInput = it
                            errorMsg = ""
                        },
                        label = { Text("House / Flat / Door No. *") },
                        placeholder = { Text("e.g., Flat 302, Sri Sai Residency") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = areaStreetInput,
                        onValueChange = {
                            areaStreetInput = it
                            errorMsg = ""
                        },
                        label = { Text("Street / Colony / Area *") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = landmarkInput,
                            onValueChange = { landmarkInput = it },
                            label = { Text("Nearby Landmark") },
                            placeholder = { Text("Near Bus Stand") },
                            modifier = Modifier.weight(1.4f),
                            shape = RoundedCornerShape(12.dp),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = pincodeInput,
                            onValueChange = { pincodeInput = it.filter { c -> c.isDigit() }.take(6) },
                            label = { Text("Pincode *") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            singleLine = true
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Set as default doorstep collection address",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Slate700
                        )
                        Switch(
                            checked = isDefaultAddress,
                            onCheckedChange = { isDefaultAddress = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = PureWhite, checkedTrackColor = MedTealPrimary)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = {
                            if (houseFlatInput.trim().isEmpty() || areaStreetInput.trim().isEmpty()) {
                                errorMsg = "Please enter your House/Flat No. and Street/Area."
                                return@Button
                            }
                            val combinedAddress = "${houseFlatInput.trim()}, ${areaStreetInput.trim()} - ${pincodeInput.ifEmpty { "517501" }}"
                            onAddressSaved(
                                SavedAddress(
                                    id = "addr_${System.currentTimeMillis()}",
                                    label = selectedTag,
                                    fullAddress = combinedAddress,
                                    landmark = landmarkInput.trim(),
                                    city = "Tirupati",
                                    pincode = pincodeInput.ifEmpty { "517501" },
                                    isDefault = isDefaultAddress,
                                    contactPhone = defaultPhone
                                )
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = PureWhite, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Confirm Pinpoint & Save Address",
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

