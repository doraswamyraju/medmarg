package com.medmarg.patient.ui.customer.topbar

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.medmarg.patient.ui.theme.EmeraldAccent
import com.medmarg.patient.ui.theme.MedTealDark
import com.medmarg.patient.ui.theme.MedTealPrimary
import com.medmarg.patient.ui.theme.PureWhite

/**
 * 5. Circular Profile Avatar Action Button.
 * - Displays Google profile photo or stylish initial letter.
 * - Surrounded by an emerald/teal accent ring.
 * - Clicking navigates the user directly to the Profile & Settings screen.
 */
@Composable
fun CustomerTopbarProfileAvatar(
    avatarUrl: String?,
    userName: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val initial = userName.trim().firstOrNull()?.uppercase() ?: "C"

    Box(
        modifier = modifier
            .size(36.dp)
            .shadow(4.dp, CircleShape, spotColor = MedTealPrimary.copy(alpha = 0.3f))
            .clip(CircleShape)
            .border(1.5.dp, EmeraldAccent, CircleShape)
            .background(
                Brush.linearGradient(
                    listOf(MedTealPrimary, MedTealDark)
                )
            )
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        if (!avatarUrl.isNullOrBlank()) {
            AsyncImage(
                model = avatarUrl,
                contentDescription = "Profile Settings",
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CircleShape),
                contentScale = ContentScale.Crop
            )
        } else {
            Text(
                text = initial,
                fontSize = 14.sp,
                fontWeight = FontWeight.Black,
                color = PureWhite
            )
        }
    }
}

