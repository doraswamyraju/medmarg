package com.medmarg.patient.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.ui.theme.*

data class TrendPoint(
    val dateLabel: String,
    val value: Float,
    val isAbnormal: Boolean = false
)

@Composable
fun BiomarkerTrendChart(
    title: String,
    unit: String,
    normalRangeText: String,
    points: List<TrendPoint>,
    modifier: Modifier = Modifier
) {
    Surface(
        color = Slate50,
        shape = RoundedCornerShape(12.dp),
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Text(
                        text = "Normal Range: $normalRangeText",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate500
                    )
                }

                points.lastOrNull()?.let { latest ->
                    Text(
                        text = "${latest.value.toInt()} $unit",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = if (latest.isAbnormal) RoseError else EmeraldAccent
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Canvas Line Chart
            if (points.size >= 2) {
                val minVal = (points.minOfOrNull { it.value } ?: 0f) * 0.85f
                val maxVal = (points.maxOfOrNull { it.value } ?: 100f) * 1.15f
                val valRange = (maxVal - minVal).coerceAtLeast(1f)

                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(80.dp)
                ) {
                    val width = size.width
                    val height = size.height
                    val stepX = width / (points.size - 1)

                    // Draw grid reference line
                    drawLine(
                        color = Slate200,
                        start = Offset(0f, height * 0.5f),
                        end = Offset(width, height * 0.5f),
                        strokeWidth = 2f
                    )

                    val path = Path()
                    points.forEachIndexed { index, point ->
                        val x = index * stepX
                        val normY = (point.value - minVal) / valRange
                        val y = height - (normY * height)

                        if (index == 0) {
                            path.moveTo(x, y)
                        } else {
                            path.lineTo(x, y)
                        }
                    }

                    drawPath(
                        path = path,
                        color = MedTealPrimary,
                        style = Stroke(width = 4f, cap = StrokeCap.Round)
                    )

                    // Draw data point dots
                    points.forEachIndexed { index, point ->
                        val x = index * stepX
                        val normY = (point.value - minVal) / valRange
                        val y = height - (normY * height)
                        val dotColor = if (point.isAbnormal) RoseError else EmeraldAccent

                        drawCircle(
                            color = dotColor,
                            radius = 6f,
                            center = Offset(x, y)
                        )
                        drawCircle(
                            color = PureWhite,
                            radius = 3f,
                            center = Offset(x, y)
                        )
                    }
                }

                // Date Labels
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    points.forEach { point ->
                        Text(
                            text = point.dateLabel,
                            style = MaterialTheme.typography.labelSmall,
                            color = Slate400,
                            fontSize = 10.sp
                        )
                    }
                }
            }
        }
    }
}
