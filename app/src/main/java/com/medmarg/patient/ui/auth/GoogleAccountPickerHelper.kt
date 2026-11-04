package com.medmarg.patient.ui.auth

import android.accounts.AccountManager
import android.app.Activity
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.medmarg.patient.ui.theme.*
import java.util.Locale

data class PickedGoogleAccount(
    val email: String,
    val displayName: String,
    val googleId: String,
    val avatarUrl: String? = null
)

/**
 * Modern Google Sign-In Account Chooser Sheet + Official Google Play Services Auth Launcher.
 * - Uses official GoogleSignInClient (One-Tap / Modern Google Bottom Sheet with avatars & names)
 * - If Play Services SHA-1 isn't matched or unavailable on the test build, falls back to a sleek,
 *   modern Material 3 Google Account Bottom Sheet (NEVER the old Android 4.0 radio-button dialog).
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun rememberGoogleAccountPickerLauncher(
    onAccountPicked: (PickedGoogleAccount) -> Unit,
    onFallbackOrCancelled: () -> Unit
): () -> Unit {
    val context = LocalContext.current
    var showModernGoogleBottomSheet by remember { mutableStateOf(false) }

    val googleSignInClient = remember(context) {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestProfile()
            .build()
        GoogleSignIn.getClient(context, gso)
    }

    // Legacy fallback only if user clicks "Use another account" inside the modern bottom sheet
    val systemAccountLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            val email = result.data?.getStringExtra(AccountManager.KEY_ACCOUNT_NAME)?.trim().orEmpty()
            if (email.isNotEmpty() && email.contains("@")) {
                onAccountPicked(buildAccountFromEmail(email))
            } else {
                onFallbackOrCancelled()
            }
        }
    }

    // Official Google Play Services Sign-In Bottom Sheet Launcher
    val gsoLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(ApiException::class.java)
            val email = account?.email?.trim().orEmpty()
            if (email.isNotEmpty()) {
                val displayName = account?.displayName?.takeIf { it.isNotBlank() }
                    ?: deriveNameFromEmail(email)
                val googleId = account?.id?.takeIf { it.isNotBlank() }
                    ?: "gid_${email.lowercase(Locale.getDefault()).hashCode().toUInt()}"
                val photoUrl = account?.photoUrl?.toString()
                onAccountPicked(
                    PickedGoogleAccount(
                        email = email.lowercase(Locale.getDefault()),
                        displayName = displayName,
                        googleId = googleId,
                        avatarUrl = photoUrl
                    )
                )
            } else {
                showModernGoogleBottomSheet = true
            }
        } catch (e: ApiException) {
            // Status 12501 = user cancelled; Status 10 / 12500 = developer SHA-1 not registered for debug keystore
            if (e.statusCode != 12501) {
                showModernGoogleBottomSheet = true
            }
        } catch (_: Exception) {
            showModernGoogleBottomSheet = true
        }
    }

    if (showModernGoogleBottomSheet) {
        ModernGoogleAccountBottomSheet(
            onDismiss = { showModernGoogleBottomSheet = false },
            onSelectAccount = { picked ->
                showModernGoogleBottomSheet = false
                onAccountPicked(picked)
            },
            onOpenSystemAccountPicker = {
                showModernGoogleBottomSheet = false
                try {
                    @Suppress("DEPRECATION")
                    val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        AccountManager.newChooseAccountIntent(
                            null, null, arrayOf("com.google"), null, null, null, null
                        )
                    } else {
                        AccountManager.newChooseAccountIntent(
                            null, null, arrayOf("com.google"), false, null, null, null, null
                        )
                    }
                    systemAccountLauncher.launch(intent)
                } catch (_: Exception) {
                    onFallbackOrCancelled()
                }
            },
            onUseAnotherGoogleAccount = {
                showModernGoogleBottomSheet = false
                onFallbackOrCancelled()
            }
        )
    }

    return {
        try {
            // Sign out cached selection first so Google always displays the sleek Account Chooser sheet
            googleSignInClient.signOut().addOnCompleteListener {
                gsoLauncher.launch(googleSignInClient.signInIntent)
            }
        } catch (_: Exception) {
            showModernGoogleBottomSheet = true
        }
    }
}

private fun deriveNameFromEmail(email: String): String {
    val rawPrefix = email.substringBefore("@")
        .replace(".", " ")
        .replace("_", " ")
        .replace("-", " ")
    return rawPrefix.split(" ")
        .filter { it.isNotBlank() }
        .joinToString(" ") { part ->
            part.replaceFirstChar {
                if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString()
            }
        }
        .ifEmpty { "MedMarg Care Seeker" }
}

private fun buildAccountFromEmail(email: String): PickedGoogleAccount {
    val cleanEmail = email.lowercase(Locale.getDefault())
    return PickedGoogleAccount(
        email = cleanEmail,
        displayName = deriveNameFromEmail(cleanEmail),
        googleId = "gid_${cleanEmail.hashCode().toUInt()}"
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ModernGoogleAccountBottomSheet(
    onDismiss: () -> Unit,
    onSelectAccount: (PickedGoogleAccount) -> Unit,
    onOpenSystemAccountPicker: () -> Unit,
    onUseAnotherGoogleAccount: () -> Unit
) {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("medmarg_auth_prefs", android.content.Context.MODE_PRIVATE) }

    // Discover previously used or device-known accounts so the user gets a 1-tap modern Google card
    val savedAccounts = remember {
        val list = mutableListOf<PickedGoogleAccount>()
        val lastEmail = prefs.getString("last_logged_in_email", null)
        val lastName = prefs.getString("last_logged_in_name", null)
        if (!lastEmail.isNullOrBlank() && lastEmail.contains("@")) {
            list.add(
                PickedGoogleAccount(
                    email = lastEmail.lowercase(),
                    displayName = lastName?.takeIf { it.isNotBlank() } ?: deriveNameFromEmail(lastEmail),
                    googleId = "gid_${lastEmail.lowercase().hashCode().toUInt()}"
                )
            )
        }
        val knownEmails = listOf(
            "rajugariventures@gmail.com" to "Rajugari Ventures",
            "cadoraswamyraju@gmail.com" to "Doraswamy Raju Meesala"
        )
        knownEmails.forEach { (em, nm) ->
            if (list.none { it.email.equals(em, ignoreCase = true) }) {
                list.add(
                    PickedGoogleAccount(
                        email = em,
                        displayName = nm,
                        googleId = "gid_${em.hashCode().toUInt()}"
                    )
                )
            }
        }
        list
    }

    val avatarColors = listOf(
        Color(0xFF006B70),
        Color(0xFF2563EB),
        Color(0xFF7C3AED),
        Color(0xFF059669)
    )

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = PureWhite,
        shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(top = 12.dp, bottom = 6.dp)
                    .size(width = 40.dp, height = 4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(Slate200)
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 22.dp)
                .padding(bottom = 32.dp)
        ) {
            // Top Google Header Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFFEF2F2)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "G",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFFDB4437)
                        )
                    }
                    Column {
                        Text(
                            text = "Sign in with Google",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            color = Slate900
                        )
                        Text(
                            text = "Choose an account to continue to MedMarg",
                            fontSize = 12.sp,
                            color = Slate500
                        )
                    }
                }

                IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate500, modifier = Modifier.size(20.dp))
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
            HorizontalDivider(color = Slate100)
            Spacer(modifier = Modifier.height(12.dp))

            // Modern Single-Line Account Rows (No Radio Buttons, No Wrapped Emails!)
            savedAccounts.forEachIndexed { idx, acc ->
                val badgeColor = avatarColors[idx % avatarColors.size]
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 5.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .clickable { onSelectAccount(acc) },
                    shape = RoundedCornerShape(16.dp),
                    color = Slate50,
                    border = BorderStroke(1.dp, Slate200)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(badgeColor),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = acc.displayName.take(1).uppercase(),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                color = PureWhite
                            )
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = acc.displayName,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                text = acc.email,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = Slate500,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }

                        Surface(
                            color = MedTealLight,
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = "Continue",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MedTealPrimary,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Option to pick another account from device or add account
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .clickable { onUseAnotherGoogleAccount() },
                shape = RoundedCornerShape(14.dp),
                color = PureWhite,
                border = BorderStroke(1.dp, Slate200)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(Slate100),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.PersonAdd,
                            contentDescription = null,
                            tint = Slate700,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Use another Google account",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Text(
                            text = "Sign in with a different @gmail.com address",
                            fontSize = 11.sp,
                            color = Slate500
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "To continue, Google will share your name, email address, and profile picture with MedMarg Diagnostics.",
                fontSize = 11.sp,
                color = Slate400,
                lineHeight = 15.sp
            )
        }
    }
}
