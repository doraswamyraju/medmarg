package com.medmarg.patient.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = MedTealPrimary,
    onPrimary = PureWhite,
    primaryContainer = MedTealContainer,
    onPrimaryContainer = MedTealOnContainer,
    secondary = EmeraldAccent,
    onSecondary = PureWhite,
    secondaryContainer = EmeraldLight,
    onSecondaryContainer = Slate900,
    tertiary = CyanAccent,
    background = Slate50,
    onBackground = Slate900,
    surface = PureWhite,
    onSurface = Slate900,
    surfaceVariant = Slate100,
    onSurfaceVariant = Slate700,
    outline = Slate200,
    error = RoseError,
    onError = PureWhite
)

private val DarkColorScheme = darkColorScheme(
    primary = CyanAccent,
    onPrimary = Slate900,
    primaryContainer = MedTealDark,
    onPrimaryContainer = MedTealLight,
    secondary = EmeraldAccent,
    background = Slate900,
    onBackground = Slate50,
    surface = Slate800,
    onSurface = Slate50,
    surfaceVariant = Slate700,
    outline = Slate600
)

@Composable
fun MedMargTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = MedTealDark.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
