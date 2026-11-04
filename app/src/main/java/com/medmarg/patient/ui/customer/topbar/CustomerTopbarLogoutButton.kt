package com.medmarg.patient.ui.customer.topbar

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PowerSettingsNew
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.medmarg.patient.ui.theme.RoseError

/**
 * 6. Logout Power Action Button.
 * - Displays a red power icon inside a light red rounded square (1-on-1 parity with iOS).
 * - Clicking triggers logout/sign out confirmation.
 */
@Composable
fun CustomerTopbarLogoutButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .size(34.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(RoseError.copy(alpha = 0.08f))
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = Icons.Default.PowerSettingsNew,
            contentDescription = "Logout",
            tint = RoseError,
            modifier = Modifier.size(17.dp)
        )
    }
}
