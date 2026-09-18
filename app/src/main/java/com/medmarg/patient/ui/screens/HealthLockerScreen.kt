package com.medmarg.patient.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.model.Biomarker
import com.medmarg.patient.model.BiomarkerStatus
import com.medmarg.patient.model.HealthRecord
import com.medmarg.patient.ui.components.BiomarkerTrendChart
import com.medmarg.patient.ui.components.TrendPoint
import com.medmarg.patient.ui.theme.*

@Composable
fun HealthLockerScreen() {
    val context = LocalContext.current
    var selectedCategory by remember { mutableStateOf("ALL") }

    val sampleRecords = listOf(
        HealthRecord(
            id = "rec_1",
            title = "Aarogyam Complete 1.3 (Full Body Checkup)",
            provider = "MedMarg Certified Partner Lab",
            date = "04-Sep-2026",
            category = "Pathology",
            reportUrl = "https://drive.google.com",
            googleDrivePath = "MedMarg/Laboratory Reports/2026/September/",
            biomarkers = listOf(
                Biomarker("HbA1c (Glycated Hemoglobin)", "5.6", "%", "< 5.7", BiomarkerStatus.NORMAL),
                Biomarker("Total Cholesterol", "185", "mg/dL", "< 200", BiomarkerStatus.NORMAL),
                Biomarker("Vitamin D3 (25-OH)", "32.4", "ng/mL", "30 - 100", BiomarkerStatus.NORMAL),
                Biomarker("TSH (Thyroid Stimulating)", "2.45", "µIU/mL", "0.45 - 4.5", BiomarkerStatus.NORMAL)
            )
        ),
        HealthRecord(
            id = "rec_2",
            title = "Digital Chest X-Ray (PA View)",
            provider = "MedMarg Diagnostic Imaging Center",
            date = "12-Aug-2026",
            category = "Radiology",
            reportUrl = "https://drive.google.com",
            googleDrivePath = "MedMarg/Scan Reports/2026/August/",
            biomarkers = emptyList()
        ),
        HealthRecord(
            id = "rec_3",
            title = "Complete Lipid Profile (8 Parameters)",
            provider = "MedMarg Certified Partner Lab",
            date = "22-Jul-2026",
            category = "Pathology",
            reportUrl = "https://drive.google.com",
            googleDrivePath = "MedMarg/Laboratory Reports/2026/July/",
            biomarkers = listOf(
                Biomarker("Triglycerides", "142", "mg/dL", "< 150", BiomarkerStatus.NORMAL),
                Biomarker("HDL (Good Cholesterol)", "48", "mg/dL", "> 40", BiomarkerStatus.NORMAL),
                Biomarker("LDL (Bad Cholesterol)", "108", "mg/dL", "< 100", BiomarkerStatus.BORDERLINE)
            )
        )
    )

    val filteredRecords = remember(selectedCategory) {
        if (selectedCategory == "ALL") sampleRecords
        else sampleRecords.filter { it.category.equals(selectedCategory, ignoreCase = true) }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // 1. Google Drive Vault Connected Status Header
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            color = EmeraldAccent.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "GOOGLE DRIVE HEALTH VAULT",
                                color = EmeraldAccent,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.CloudDone, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Synced", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Encrypted Digital Health Locker",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                    Text(
                        text = "Folder: MedMarg/Laboratory Reports/2026/ • Zero permanent VPS storage",
                        fontSize = 11.sp,
                        color = Slate400,
                        modifier = Modifier.padding(top = 2.dp)
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://drive.google.com"))
                            context.startActivity(intent)
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent),
                        contentPadding = PaddingValues(vertical = 10.dp)
                    ) {
                        Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(16.dp), tint = PureWhite)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Open in Google Drive", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                    }
                }
            }
        }

        // 2. Graphical Longitudinal Biomarker Curves
        item {
            Column {
                Text(
                    text = "Longitudinal Biomarker Analysis",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Text(
                    text = "Track progression across periodic NABL accredited lab tests",
                    fontSize = 11.sp,
                    color = Slate500
                )
                Spacer(modifier = Modifier.height(8.dp))

                BiomarkerTrendChart(
                    title = "HbA1c (Glycated Hemoglobin)",
                    unit = "%",
                    latestValue = "5.6",
                    statusText = "Non-Diabetic Range",
                    statusColor = EmeraldAccent,
                    normalMin = 4.0f,
                    normalMax = 5.7f,
                    points = listOf(
                        TrendPoint("Jan 26", 6.1f, true),
                        TrendPoint("Apr 26", 5.9f, true),
                        TrendPoint("Jul 26", 5.7f, false),
                        TrendPoint("Sep 26", 5.6f, false)
                    )
                )
            }
        }

        // 3. Category Filters
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("ALL" to "All Records (${sampleRecords.size})",
                       "Pathology" to "Pathology & Blood",
                       "Radiology" to "Scans & Imaging",
                       "Prescriptions" to "Prescriptions").forEach { (key, label) ->
                    val isSel = selectedCategory == key
                    Surface(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .clickable { selectedCategory = key },
                        color = if (isSel) MedTealPrimary else PureWhite,
                        shape = RoundedCornerShape(20.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) MedTealPrimary else Slate200)
                    ) {
                        Text(
                            text = label,
                            fontSize = 11.sp,
                            fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSel) PureWhite else Slate700,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }
            }
        }

        // 3. Health Records List
        items(filteredRecords, key = { it.id }) { record ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Surface(
                                color = if (record.category == "Pathology") MedTealLight else CyanLight,
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = record.category.uppercase(),
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (record.category == "Pathology") MedTealPrimary else CyanAccent,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = record.title,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                            Text(
                                text = "${record.provider} • ${record.date}",
                                fontSize = 11.sp,
                                color = Slate500
                            )
                        }

                        IconButton(onClick = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(record.reportUrl))
                            context.startActivity(intent)
                        }) {
                            Icon(Icons.Default.Download, contentDescription = "Download Report", tint = MedTealPrimary)
                        }
                    }

                    // Biomarkers Preview if available
                    if (record.biomarkers.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(Slate50)
                                .padding(10.dp)
                        ) {
                            Text(
                                text = "Key Biomarker Parameters:",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate700
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            record.biomarkers.forEach { b ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 2.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(b.name, fontSize = 11.sp, color = Slate600)
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text("${b.value} ${b.unit}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Surface(
                                            color = if (b.status == BiomarkerStatus.NORMAL) EmeraldLight else AmberWarningLight,
                                            shape = RoundedCornerShape(4.dp)
                                        ) {
                                            Text(
                                                text = b.status.name,
                                                fontSize = 8.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (b.status == BiomarkerStatus.NORMAL) EmeraldAccent else AmberWarning,
                                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
