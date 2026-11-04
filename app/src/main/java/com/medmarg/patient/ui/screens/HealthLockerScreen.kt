package com.medmarg.patient.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.PatientApiService
import com.medmarg.patient.model.HealthRecord
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.reports.ReportDetailModal
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun HealthLockerScreen(
    user: UserProfile? = null,
    onBrowseTests: () -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var selectedCategory by remember { mutableStateOf("ALL") }
    var isLoading by remember { mutableStateOf(true) }
    val liveReports = remember { mutableStateListOf<HealthRecord>() }
    var selectedReportForDetail by remember { mutableStateOf<HealthRecord?>(null) }

    fun refreshReports() {
        coroutineScope.launch {
            isLoading = true
            val fetched = PatientApiService.fetchPatientReports(user)
            liveReports.clear()
            liveReports.addAll(fetched)
            isLoading = false
        }
    }

    LaunchedEffect(user?.id, user?.phone) {
        refreshReports()
    }

    val filteredRecords = liveReports.filter {
        selectedCategory == "ALL" || it.category.equals(selectedCategory, ignoreCase = true)
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // 1. Digital Health Locker Vault Header
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
                                text = "DIGITAL HEALTH VAULT • ABDM READY",
                                color = EmeraldAccent,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.clickable { refreshReports() }
                        ) {
                            Icon(Icons.Default.CloudDone, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Live Sync", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = EmeraldAccent)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Encrypted Diagnostic Reports Vault",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                    Text(
                        text = "NABL certified lab reports published for ${user?.name ?: "your account"} appear automatically here.",
                        fontSize = 11.sp,
                        color = Slate400,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
            }
        }

        // 2. Category Filters
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("ALL", "Pathology", "Radiology", "Prescription").forEach { cat ->
                    val isSel = selectedCategory == cat
                    Surface(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .clickable { selectedCategory = cat },
                        color = if (isSel) MedTealPrimary else PureWhite,
                        shape = RoundedCornerShape(20.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) MedTealPrimary else Slate200)
                    ) {
                        Text(
                            text = if (cat == "ALL") "All Reports (${liveReports.size})" else cat,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSel) PureWhite else Slate700,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                        )
                    }
                }
            }
        }

        // 3. Live Reports List or Clean Empty State (Zero Dummy Reports!)
        if (isLoading) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 48.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = MedTealPrimary)
                }
            }
        } else if (filteredRecords.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(28.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(MedTealLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.FolderShared,
                                contentDescription = null,
                                tint = MedTealPrimary,
                                modifier = Modifier.size(32.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Text(
                            text = "No Published Lab Reports Yet",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Black,
                            color = Slate900
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = "Once your blood or urine sample is analyzed at our NABL partner lab, your verified digital report and biomarker breakdown will appear here automatically.",
                            fontSize = 12.sp,
                            color = Slate500,
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(18.dp))

                        Button(
                            onClick = onBrowseTests,
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                        ) {
                            Icon(Icons.Default.Biotech, contentDescription = null, tint = PureWhite, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Book Diagnostic Test", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                        }
                    }
                }
            }
        } else {
            items(filteredRecords, key = { it.id }) { record ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { selectedReportForDetail = record },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PureWhite),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate200)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                color = MedTealLight,
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = record.category.uppercase(),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MedTealPrimary,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                            Text(
                                text = record.date,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                color = Slate500
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = record.title,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Text(
                            text = record.provider,
                            fontSize = 12.sp,
                            color = Slate500
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Button(
                                onClick = { selectedReportForDetail = record },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                            ) {
                                Text("View Biomarkers", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                            }
                            OutlinedButton(
                                onClick = {
                                    val url = record.reportUrl.ifEmpty { "https://medmarg.com" }
                                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                                },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text("Download PDF", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MedTealPrimary)
                            }
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(100.dp))
        }
    }

    selectedReportForDetail?.let { rec ->
        ReportDetailModal(
            record = rec,
            onDismiss = { selectedReportForDetail = null }
        )
    }
}
