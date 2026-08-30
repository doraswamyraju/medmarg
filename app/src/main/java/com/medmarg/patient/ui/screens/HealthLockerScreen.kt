package com.medmarg.patient.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.medmarg.patient.data.SampleDataProvider
import com.medmarg.patient.model.Biomarker
import com.medmarg.patient.model.HealthRecord
import com.medmarg.patient.ui.components.BiomarkerTag
import com.medmarg.patient.ui.components.BiomarkerTrendChart
import com.medmarg.patient.ui.components.TrendPoint
import com.medmarg.patient.ui.theme.*

@Composable
fun HealthLockerScreen(
    modifier: Modifier = Modifier
) {
    val records = SampleDataProvider.healthRecords

    val cholesterolTrends = listOf(
        TrendPoint("Feb '26", 235f, true),
        TrendPoint("Apr '26", 228f, true),
        TrendPoint("Jun '26", 220f, true),
        TrendPoint("Aug '26", 215f, true)
    )

    val hba1cTrends = listOf(
        TrendPoint("Nov '25", 6.4f, true),
        TrendPoint("Feb '26", 6.1f, true),
        TrendPoint("May '26", 5.9f, true),
        TrendPoint("Jul '26", 5.8f, false)
    )

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        // ABHA Card Header
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900)
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
                                text = "ABHA HEALTH LOCKER (Ayushman Bharat)",
                                color = EmeraldAccent,
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                        Icon(
                            imageVector = Icons.Default.QrCode2,
                            contentDescription = "ABHA QR",
                            tint = PureWhite,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "ABHA ID: rahul.sharma@abdm",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                    Text(
                        text = "Linked with 14 Diagnostic Labs & 3 Hospital Networks",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate400
                    )
                }
            }
        }

        // Historical Biomarker Trend Visualizers
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Text(
                    text = "Biomarker Analytics & Trends",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Text(
                    text = "Track your vital diagnostic values automatically across different labs over time",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate500
                )
                Spacer(modifier = Modifier.height(8.dp))

                BiomarkerTrendChart(
                    title = "Total Cholesterol Trend",
                    unit = "mg/dL",
                    normalRangeText = "< 200 mg/dL",
                    points = cholesterolTrends
                )

                BiomarkerTrendChart(
                    title = "HbA1c (Average Blood Sugar)",
                    unit = "%",
                    normalRangeText = "< 5.7 %",
                    points = hba1cTrends
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Recent Diagnostic Lab Reports",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = Slate900,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )
        }

        items(records) { record ->
            HealthRecordCard(record = record)
        }

        item {
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

@Composable
fun HealthRecordCard(
    record: HealthRecord
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = BorderStroke(1.dp, CardBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = record.title,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Text(
                        text = "${record.provider} • ${record.date}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate500
                    )
                }

                IconButton(onClick = {}) {
                    Icon(
                        imageVector = Icons.Default.Download,
                        contentDescription = "Download PDF",
                        tint = MedTealPrimary
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Extracted Biomarkers",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.SemiBold,
                color = Slate700
            )

            Spacer(modifier = Modifier.height(8.dp))

            record.biomarkers.forEach { biomarker ->
                Surface(
                    color = Slate50,
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, Slate200),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 6.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = biomarker.name,
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = Slate900
                            )
                            Text(
                                text = "Ref: ${biomarker.referenceRange}",
                                style = MaterialTheme.typography.labelSmall,
                                color = Slate500
                            )
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "${biomarker.value} ${biomarker.unit}",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            BiomarkerTag(status = biomarker.status)
                        }
                    }
                }
            }
        }
    }
}
