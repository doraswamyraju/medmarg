package com.medmarg.patient.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.model.BiomarkerStatus
import com.medmarg.patient.ui.theme.*

@Composable
fun MedMargTopHeader(
    currentLocation: String = "Indiranagar, Bangalore",
    cartCount: Int = 1,
    onLocationClick: () -> Unit = {},
    onCartClick: () -> Unit = {}
) {
    Surface(
        color = MedTealDark,
        contentColor = PureWhite
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .clickable { onLocationClick() }
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(EmeraldAccent),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = "Location",
                            tint = PureWhite,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Delivering to / Serving at",
                                style = MaterialTheme.typography.labelSmall,
                                color = MedTealLight
                            )
                            Icon(
                                imageVector = Icons.Default.KeyboardArrowDown,
                                contentDescription = "Change Location",
                                tint = MedTealLight,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        Text(
                            text = currentLocation,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = PureWhite
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = onCartClick,
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.15f))
                    ) {
                        BadgedBox(
                            badge = {
                                if (cartCount > 0) {
                                    Badge(
                                        containerColor = EmeraldAccent,
                                        contentColor = PureWhite
                                    ) {
                                        Text(text = cartCount.toString())
                                    }
                                }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.ShoppingCart,
                                contentDescription = "Cart",
                                tint = PureWhite
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SearchBarHeader(
    query: String,
    onQueryChange: (String) -> Unit,
    placeholder: String = "Search 500+ tests (Lipid, HbA1c), Scans (MRI), Labs...",
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Search,
                contentDescription = "Search",
                tint = MedTealPrimary,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = if (query.isEmpty()) placeholder else query,
                style = MaterialTheme.typography.bodyMedium,
                color = if (query.isEmpty()) Slate400 else Slate900,
                modifier = Modifier.weight(1f)
            )
            Icon(
                imageVector = Icons.Default.Mic,
                contentDescription = "Voice Search",
                tint = Slate500,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@Composable
fun NablAccreditedBadge(modifier: Modifier = Modifier) {
    Surface(
        color = NablBlueLight,
        shape = RoundedCornerShape(6.dp),
        modifier = modifier
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Verified,
                contentDescription = "NABL",
                tint = NablBlue,
                modifier = Modifier.size(13.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "NABL Accredited",
                style = MaterialTheme.typography.labelSmall,
                color = NablBlue,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun BiomarkerTag(status: BiomarkerStatus) {
    val (bgColor, textColor, label) = when (status) {
        BiomarkerStatus.NORMAL -> Triple(EmeraldLight, EmeraldAccent, "Normal")
        BiomarkerStatus.BORDERLINE -> Triple(AmberWarningLight, AmberWarning, "Borderline")
        BiomarkerStatus.HIGH -> Triple(RoseErrorLight, RoseError, "High")
        BiomarkerStatus.LOW -> Triple(RoseErrorLight, RoseError, "Low")
    }
    Surface(
        color = bgColor,
        shape = RoundedCornerShape(6.dp)
    ) {
        Text(
            text = label,
            color = textColor,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        )
    }
}
