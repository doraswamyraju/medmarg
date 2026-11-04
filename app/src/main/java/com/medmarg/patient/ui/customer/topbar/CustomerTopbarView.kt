package com.medmarg.patient.ui.customer.topbar

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.PureWhite

/**
 * Modern Care Seeker / Customer Top Bar (1-on-1 Parity with iOS TopbarView.swift).
 * - Left: Hamburger Toggle + MedMarg Logo + Location / Doorstep Address Pill
 * - Center: Flexible Spacer
 * - Right: Notification Bell + Profile Avatar + Logout Power Button
 *
 * All individual items are implemented in dedicated modular files in this package.
 */
@Composable
fun CustomerTopbarView(
    user: UserProfile,
    city: String = "Tirupati",
    address: String = "Air Bypass Road, Tirupati",
    onMenuClick: () -> Unit,
    onLogoClick: () -> Unit,
    onLocationClick: () -> Unit,
    onNotificationClick: () -> Unit,
    onProfileClick: () -> Unit,
    onLogoutClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        color = PureWhite,
        shadowElevation = 2.dp,
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 14.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // 1. Hamburger Toggle Button
            CustomerTopbarHamburger(onClick = onMenuClick)

            // 2. MedMarg Brand Logo (Clickable -> Home, Zero Role Text)
            CustomerTopbarLogo(onClick = onLogoClick)

            // 3. Location / Doorstep Collection Address Pill
            CustomerTopbarLocationPill(
                city = city,
                address = address,
                onClick = onLocationClick
            )

            // Spacer pushes right-aligned actions
            Spacer(modifier = Modifier.weight(1f))

            // 4. Notification Center Bell Icon (with dynamic unread dot)
            CustomerTopbarNotificationButton(onClick = onNotificationClick)

            // 5. User Profile Avatar Photo (Clickable -> Profile Settings Screen)
            CustomerTopbarProfileAvatar(
                avatarUrl = user.avatarUrl,
                userName = user.name,
                onClick = onProfileClick
            )

            // 6. Logout Power Action Button
            CustomerTopbarLogoutButton(onClick = onLogoutClick)
        }
    }
}

