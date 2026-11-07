package com.medmarg.patient.ui.profile

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.data.PatientMedicalMeta
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*

/**
 * 1-on-1 Replicated ABHA Health Locker Digital ID Card Modal (`ios/CareSeekerProfileView.swift` lines 929-994).
 */
@Composable
fun AbhaDigitalIdModal(
    user: UserProfile,
    medicalMeta: PatientMedicalMeta,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val abhaAddress = remember(user.name) {
        user.name.lowercase().replace(" ", "") + "@abdm"
    }
    var cardDownloaded by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 24.dp),
            shape = RoundedCornerShape(28.dp),
            color = PureWhite,
            shadowElevation = 24.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(22.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Top Bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(MedTealLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.VerifiedUser,
                                contentDescription = null,
                                tint = MedTealPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "ABHA Digital Health ID",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Black,
                                color = Slate900
                            )
                            Text(
                                text = "Ayushman Bharat Digital Mission (ABDM)",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MedTealPrimary
                            )
                        }
                    }

                    Surface(
                        onClick = onDismiss,
                        shape = CircleShape,
                        color = Slate100,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Close",
                                tint = Slate600,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Official-Style Dark Emerald/Slate ABHA Digital Card
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(22.dp),
                    shadowElevation = 8.dp
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
                            .padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "NATIONAL HEALTH AUTHORITY",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color(0xFF10B981),
                                    letterSpacing = 1.sp
                                )
                                Text(
                                    text = "Ayushman Bharat Health Account",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PureWhite
                                )
                            }

                            Surface(
                                color = Color(0xFFF59E0B).copy(alpha = 0.2f),
                                shape = RoundedCornerShape(50),
                                border = BorderStroke(1.dp, Color(0xFFF59E0B).copy(alpha = 0.5f))
                            ) {
                                Text(
                                    text = "COMING SOON",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color(0xFFFBBF24),
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(18.dp))

                        // Crisp Vector QR Code Box
                        Surface(
                            shape = RoundedCornerShape(18.dp),
                            color = PureWhite,
                            shadowElevation = 6.dp,
                            modifier = Modifier.size(170.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(14.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                AbhaQrMatrixCanvas(seed = medicalMeta.abhaId)
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = user.name,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black,
                            color = PureWhite
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                text = medicalMeta.abhaId,
                                fontSize = 16.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF34D399)
                            )
                            Surface(
                                onClick = {
                                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    clipboard.setPrimaryClip(ClipData.newPlainText("ABHA ID", medicalMeta.abhaId))
                                    Toast.makeText(context, "ABHA Number copied", Toast.LENGTH_SHORT).show()
                                },
                                shape = CircleShape,
                                color = PureWhite.copy(alpha = 0.14f),
                                modifier = Modifier.size(26.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        imageVector = Icons.Default.ContentCopy,
                                        contentDescription = "Copy",
                                        tint = PureWhite,
                                        modifier = Modifier.size(13.dp)
                                    )
                                }
                            }
                        }

                        Text(
                            text = "PHR Address: $abhaAddress",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = PureWhite.copy(alpha = 0.78f),
                            modifier = Modifier.padding(top = 4.dp)
                        )

                        Spacer(modifier = Modifier.height(14.dp))
                        HorizontalDivider(color = PureWhite.copy(alpha = 0.12f))
                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            AbhaMetaPill("AGE / SEX", "${medicalMeta.age} Yrs / ${medicalMeta.gender}")
                            AbhaMetaPill("BLOOD GROUP", medicalMeta.bloodGroup)
                            AbhaMetaPill("STATE", "Andhra Pradesh")
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Scan this QR at any NABL Accredited Lab, Hospital OPD desk, or MedMarg Phlebotomist Terminal to auto-link your diagnostic reports.",
                    fontSize = 11.sp,
                    color = Slate500,
                    textAlign = TextAlign.Center,
                    lineHeight = 16.sp
                )

                Spacer(modifier = Modifier.height(18.dp))

                Button(
                    onClick = {
                        cardDownloaded = true
                        Toast.makeText(
                            context,
                            "ABHA Digital Health Card saved to device",
                            Toast.LENGTH_SHORT
                        ).show()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (cardDownloaded) EmeraldSuccess else MedTealPrimary
                    )
                ) {
                    Icon(
                        imageVector = if (cardDownloaded) Icons.Default.CheckCircle else Icons.Default.Download,
                        contentDescription = null,
                        tint = PureWhite,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (cardDownloaded) "ABHA Card Saved to Device" else "Download Official ABHA Card",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                }
            }
        }
    }
}

@Composable
private fun AbhaMetaPill(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = label,
            fontSize = 8.sp,
            fontWeight = FontWeight.Bold,
            color = PureWhite.copy(alpha = 0.55f)
        )
        Text(
            text = value,
            fontSize = 11.sp,
            fontWeight = FontWeight.ExtraBold,
            color = PureWhite,
            modifier = Modifier.padding(top = 2.dp)
        )
    }
}

@Composable
private fun AbhaQrMatrixCanvas(seed: String) {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val grid = 15
        val cell = size.width / grid
        val dark = Color(0xFF0F172A)

        fun isFinderCorner(r: Int, c: Int): Boolean {
            val topLeft = r in 0..4 && c in 0..4
            val topRight = r in 0..4 && c in (grid - 5) until grid
            val bottomLeft = r in (grid - 5) until grid && c in 0..4
            return topLeft || topRight || bottomLeft
        }

        for (r in 0 until grid) {
            for (c in 0 until grid) {
                val drawCell = if (isFinderCorner(r, c)) {
                    val lr = if (r >= grid - 5) r - (grid - 5) else r
                    val lc = if (c >= grid - 5) c - (grid - 5) else c
                    lr == 0 || lr == 4 || lc == 0 || lc == 4 || (lr in 1..3 && lc in 1..3 && !(lr in 1..3 && lc in 1..3 && (lr == 1 || lr == 3 || lc == 1 || lc == 3)))
                } else {
                    val hash = (r * 31 + c * 17 + seed.hashCode()).let { if (it < 0) -it else it }
                    hash % 3 != 0
                }
                if (drawCell) {
                    drawRect(
                        color = dark,
                        topLeft = Offset(c * cell, r * cell),
                        size = Size(cell * 0.88f, cell * 0.88f)
                    )
                }
            }
        }
    }
}

