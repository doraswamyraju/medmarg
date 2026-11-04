package com.medmarg.patient.ui.customer.topbar

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.medmarg.patient.ui.theme.MedTealLight
import com.medmarg.patient.ui.theme.MedTealPrimary

/**
 * 1. Hamburger button to toggle the slide-out navigation drawer/sidebar.
 */
@Composable
fun CustomerTopbarHamburger(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .size(34.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(MedTealLight)
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = Icons.Default.Menu,
            contentDescription = "Open Sidebar Navigation",
            tint = MedTealPrimary,
            modifier = Modifier.size(18.dp)
        )
    }
}
