package com.medmarg.patient.ui.customer.topbar

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.ui.theme.MedTealPrimary
import com.medmarg.patient.ui.theme.Slate100
import com.medmarg.patient.ui.theme.Slate500
import com.medmarg.patient.ui.theme.Slate900

/**
 * 3. Interactive Location & Doorstep Address Pill for Care Seekers.
 * - Displays active city with dropdown indicator.
 * - Displays doorstep phlebotomist collection address.
 * - Clicking opens the Pinpoint Collection Address or City Picker sheet.
 */
@Composable
fun CustomerTopbarLocationPill(
    city: String,
    address: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val displayCity = city.substringBefore(",").trim().ifEmpty { "Tirupati" }
    val displayAddress = address.trim().ifEmpty { "Air Bypass Road, Tirupati" }

    Row(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(Slate100)
            .clickable { onClick() }
            .padding(horizontal = 8.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(5.dp)
    ) {
        Icon(
            imageVector = Icons.Default.LocationOn,
            contentDescription = "Doorstep Location",
            tint = MedTealPrimary,
            modifier = Modifier.size(15.dp)
        )

        Column(
            modifier = Modifier.widthIn(max = 130.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                Text(
                    text = displayCity,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Icon(
                    imageVector = Icons.Default.KeyboardArrowDown,
                    contentDescription = null,
                    tint = MedTealPrimary,
                    modifier = Modifier.size(12.dp)
                )
            }

            Text(
                text = displayAddress,
                fontSize = 9.sp,
                fontWeight = FontWeight.Medium,
                color = Slate500,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}
