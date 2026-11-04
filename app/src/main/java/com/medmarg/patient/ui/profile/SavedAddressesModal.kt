package com.medmarg.patient.ui.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.medmarg.patient.data.PatientSessionStore
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.checkout.AddressPinpointModal
import com.medmarg.patient.ui.theme.*

/**
 * Modular Saved Doorstep Addresses Management Modal.
 */
@Composable
fun SavedAddressesModal(
    user: UserProfile,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var showAddPinpointModal by remember { mutableStateOf(false) }

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
                        text = "Saved Doorstep Addresses",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate500)
                    }
                }

                Text(
                    text = "Manage GPS doorstep pins for early morning phlebotomist sample collection.",
                    fontSize = 11.sp,
                    color = Slate500,
                    modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
                )

                PatientSessionStore.savedAddresses.forEachIndexed { idx, addr ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clickable {
                                for (i in PatientSessionStore.savedAddresses.indices) {
                                    PatientSessionStore.savedAddresses[i] = PatientSessionStore.savedAddresses[i].copy(isDefault = i == idx)
                                }
                                PatientSessionStore.saveAddresses(context, user)
                            },
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (addr.isDefault) MedTealLight else Slate50
                        ),
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (addr.isDefault) MedTealPrimary else Slate200
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                Icon(
                                    imageVector = Icons.Default.LocationOn,
                                    contentDescription = null,
                                    tint = MedTealPrimary,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = addr.label,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Slate900
                                        )
                                        if (addr.isDefault) {
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Surface(
                                                color = EmeraldAccent,
                                                shape = RoundedCornerShape(4.dp)
                                            ) {
                                                Text(
                                                    text = "DEFAULT",
                                                    fontSize = 8.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = PureWhite,
                                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                                )
                                            }
                                        }
                                    }
                                    Text(
                                        text = addr.fullAddress,
                                        fontSize = 11.sp,
                                        color = Slate600
                                    )
                                }
                            }

                            if (PatientSessionStore.savedAddresses.size > 1) {
                                IconButton(
                                    onClick = {
                                        PatientSessionStore.savedAddresses.remove(addr)
                                        PatientSessionStore.saveAddresses(context, user)
                                    },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = RoseError, modifier = Modifier.size(18.dp))
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Button(
                    onClick = { showAddPinpointModal = true },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                ) {
                    Icon(Icons.Default.AddLocationAlt, contentDescription = null, tint = PureWhite, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Pinpoint & Add New Address", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                }
            }
        }
    }

    if (showAddPinpointModal) {
        AddressPinpointModal(
            defaultPhone = user.phone,
            onDismiss = { showAddPinpointModal = false },
            onAddressSaved = { newAddr ->
                if (newAddr.isDefault) {
                    for (i in PatientSessionStore.savedAddresses.indices) {
                        PatientSessionStore.savedAddresses[i] = PatientSessionStore.savedAddresses[i].copy(isDefault = false)
                    }
                }
                PatientSessionStore.savedAddresses.add(0, newAddr)
                PatientSessionStore.saveAddresses(context, user)
                showAddPinpointModal = false
            }
        )
    }
}

