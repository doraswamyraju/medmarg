package com.medmarg.patient.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.TrendingDown
import androidx.compose.material.icons.filled.TrendingFlat
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
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
    val isAbnormal: Boolean = false,
    val secondaryValue: Float? = null // For dual metrics like Diastolic BP
)

/**
 * High-Fidelity Canvas Graphical Trend Chart with Target Range Band, Gradient Fill & Point Markers
 */
@Composable
fun BiomarkerTrendChart(
    title: String,
    unit: String,
    latestValue: String,
    statusText: String,
    statusColor: Color,
    normalMin: Float,
    normalMax: Float,
    points: List<TrendPoint>,
    hasSecondarySeries: Boolean = false,
    secondaryTitle: String = "Diastolic",
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate200),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header Info & Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = title,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Text(
                        text = "Normal: $normalMin - $normalMax $unit",
                        fontSize = 11.sp,
                        color = Slate500
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "$latestValue $unit",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )
                    Surface(
                        color = statusColor.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(
                            text = statusText,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = statusColor,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Graphical Curve Presentation Canvas
            if (points.size >= 2) {
                val allValues = points.flatMap { listOfNotNull(it.value, it.secondaryValue) }
                val minVal = (allValues.minOrNull() ?: normalMin).coerceAtMost(normalMin) * 0.9f
                val maxVal = (allValues.maxOrNull() ?: normalMax).coerceAtLeast(normalMax) * 1.1f
                val valRange = (maxVal - minVal).coerceAtLeast(1f)

                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(110.dp)
                ) {
                    val width = size.width
                    val height = size.height
                    val stepX = width / (points.size - 1)

                    // 1. Draw Normal Green Reference Band
                    val normBandTop = height - (((normalMax - minVal) / valRange) * height)
                    val normBandBottom = height - (((normalMin - minVal) / valRange) * height)
                    val bandHeight = (normBandBottom - normBandTop).coerceAtLeast(4f)

                    drawRect(
                        color = EmeraldAccent.copy(alpha = 0.08f),
                        topLeft = Offset(0f, normBandTop),
                        size = androidx.compose.ui.geometry.Size(width, bandHeight)
                    )

                    // 2. Draw Horizontal Dotted Gridlines
                    drawLine(
                        color = Slate200,
                        start = Offset(0f, normBandTop),
                        end = Offset(width, normBandTop),
                        strokeWidth = 1f
                    )
                    drawLine(
                        color = Slate200,
                        start = Offset(0f, normBandBottom),
                        end = Offset(width, normBandBottom),
                        strokeWidth = 1f
                    )

                    // 3. Primary Series Gradient Fill & Line
                    val primaryPath = Path()
                    val fillPath = Path()

                    points.forEachIndexed { index, point ->
                        val x = index * stepX
                        val normY = (point.value - minVal) / valRange
                        val y = height - (normY * height)

                        if (index == 0) {
                            primaryPath.moveTo(x, y)
                            fillPath.moveTo(x, height)
                            fillPath.lineTo(x, y)
                        } else {
                            // Smooth bezier curve
                            val prevX = (index - 1) * stepX
                            val prevNormY = (points[index - 1].value - minVal) / valRange
                            val prevY = height - (prevNormY * height)
                            val midX = (prevX + x) / 2f
                            primaryPath.cubicTo(midX, prevY, midX, y, x, y)
                            fillPath.cubicTo(midX, prevY, midX, y, x, y)
                        }
                    }
                    fillPath.lineTo(width, height)
                    fillPath.close()

                    // Draw area gradient fill
                    drawPath(
                        path = fillPath,
                        brush = Brush.verticalGradient(
                            listOf(MedTealPrimary.copy(alpha = 0.25f), MedTealPrimary.copy(alpha = 0.02f))
                        )
                    )

                    // Draw smooth stroke line
                    drawPath(
                        path = primaryPath,
                        color = MedTealPrimary,
                        style = Stroke(width = 3.5f, cap = StrokeCap.Round)
                    )

                    // 4. Secondary Series (if BP Diastolic present)
                    if (hasSecondarySeries) {
                        val secondaryPath = Path()
                        points.forEachIndexed { index, point ->
                            val secVal = point.secondaryValue ?: point.value
                            val x = index * stepX
                            val normY = (secVal - minVal) / valRange
                            val y = height - (normY * height)

                            if (index == 0) {
                                secondaryPath.moveTo(x, y)
                            } else {
                                val prevX = (index - 1) * stepX
                                val prevSecVal = points[index - 1].secondaryValue ?: points[index - 1].value
                                val prevNormY = (prevSecVal - minVal) / valRange
                                val prevY = height - (prevNormY * height)
                                val midX = (prevX + x) / 2f
                                secondaryPath.cubicTo(midX, prevY, midX, y, x, y)
                            }
                        }
                        drawPath(
                            path = secondaryPath,
                            color = CyanAccent,
                            style = Stroke(width = 3f, cap = StrokeCap.Round)
                        )
                    }

                    // 5. Draw Circular Data Markers
                    points.forEachIndexed { index, point ->
                        val x = index * stepX
                        val normY = (point.value - minVal) / valRange
                        val y = height - (normY * height)
                        val markerColor = if (point.isAbnormal) RoseError else MedTealPrimary

                        drawCircle(
                            color = markerColor,
                            radius = 5.5f,
                            center = Offset(x, y)
                        )
                        drawCircle(
                            color = PureWhite,
                            radius = 2.5f,
                            center = Offset(x, y)
                        )

                        if (hasSecondarySeries && point.secondaryValue != null) {
                            val secNormY = (point.secondaryValue - minVal) / valRange
                            val secY = height - (secNormY * height)
                            drawCircle(
                                color = CyanAccent,
                                radius = 4.5f,
                                center = Offset(x, secY)
                            )
                            drawCircle(
                                color = PureWhite,
                                radius = 2f,
                                center = Offset(x, secY)
                            )
                        }
                    }
                }

                // X-Axis Timeline Labels
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    points.forEach { point ->
                        Text(
                            text = point.dateLabel,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate500
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Footer Legend & Insights
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Slate50, RoundedCornerShape(8.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(MedTealPrimary))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(if (hasSecondarySeries) "Systolic" else "Reading", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate700)
                    }
                    if (hasSecondarySeries) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(CyanAccent))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(secondaryTitle, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate700)
                        }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(modifier = Modifier.size(8.dp).background(EmeraldAccent.copy(alpha = 0.3f)))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Target Zone", fontSize = 10.sp, color = Slate500)
                    }
                }

                Text(
                    text = "7-Day Stable ↘",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = EmeraldAccent
                )
            }
        }
    }
}

/**
 * Mini Sparkline graphical curve for inclusion inside summary metric cards
 */
@Composable
fun BiomarkerSparkline(
    values: List<Float>,
    lineColor: Color = MedTealPrimary,
    modifier: Modifier = Modifier
) {
    if (values.size < 2) return
    val minVal = values.minOrNull() ?: 0f
    val maxVal = values.maxOrNull() ?: 100f
    val range = (maxVal - minVal).coerceAtLeast(1f)

    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .height(24.dp)
    ) {
        val width = size.width
        val height = size.height
        val stepX = width / (values.size - 1)

        val path = Path()
        values.forEachIndexed { index, value ->
            val x = index * stepX
            val normY = (value - minVal) / range
            val y = height - (normY * height)

            if (index == 0) {
                path.moveTo(x, y)
            } else {
                val prevX = (index - 1) * stepX
                val prevNormY = (values[index - 1] - minVal) / range
                val prevY = height - (prevNormY * height)
                val midX = (prevX + x) / 2f
                path.cubicTo(midX, prevY, midX, y, x, y)
            }
        }

        drawPath(
            path = path,
            color = lineColor,
            style = Stroke(width = 2.5f, cap = StrokeCap.Round)
        )
    }
}
