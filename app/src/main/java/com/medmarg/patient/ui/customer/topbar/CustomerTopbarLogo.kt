package com.medmarg.patient.ui.customer.topbar

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.medmarg.patient.R

/**
 * 2. MedMarg Brand Logo.
 * - Clicking navigates the user back to the Home tab.
 * - Contains ZERO role badges or user greeting labels, keeping the header clean and spacious.
 */
@Composable
fun CustomerTopbarLogo(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Image(
        painter = painterResource(id = R.drawable.logo),
        contentDescription = "MedMarg Home",
        contentScale = ContentScale.Fit,
        alignment = Alignment.CenterStart,
        modifier = modifier
            .height(26.dp)
            .width(108.dp)
            .clickable { onClick() }
    )
}

