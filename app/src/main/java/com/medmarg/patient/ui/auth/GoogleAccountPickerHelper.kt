package com.medmarg.patient.ui.auth

import android.accounts.AccountManager
import android.app.Activity
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import java.net.URLEncoder
import java.util.Locale

data class PickedGoogleAccount(
    val email: String,
    val displayName: String,
    val googleId: String,
    val avatarUrl: String? = null
)

/**
 * Native Android Google Account Chooser Launcher.
 * - Pops up the Android system Google account picker containing accounts already logged in on the phone.
 * - Immediately returns the chosen email, display name, and avatar WITHOUT showing any intermediate screen or second bottom sheet.
 * - If account doesn't exist, LoginScreen will create one and prompt for mobile number.
 */
@Composable
fun rememberGoogleAccountPickerLauncher(
    onAccountPicked: (PickedGoogleAccount) -> Unit,
    onFallbackOrCancelled: () -> Unit
): () -> Unit {
    val context = LocalContext.current

    // Official Google Play Services Sign-In Client
    val googleSignInClient = GoogleSignIn.getClient(
        context,
        GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestProfile()
            .build()
    )

    // Android System Native Account Picker Launcher (Supports all device-logged-in Google accounts)
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
        } else {
            onFallbackOrCancelled()
        }
    }

    // Google Play Services Sign-In Launcher (Used if available on device)
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
                    ?: generateDefaultAvatar(displayName)
                onAccountPicked(
                    PickedGoogleAccount(
                        email = email.lowercase(Locale.getDefault()),
                        displayName = displayName,
                        googleId = googleId,
                        avatarUrl = photoUrl
                    )
                )
            } else {
                launchSystemAccountPicker(systemAccountLauncher)
            }
        } catch (e: ApiException) {
            if (e.statusCode == 12501) {
                // User explicitly clicked Cancel in the Google popup
                onFallbackOrCancelled()
            } else {
                // Developer SHA-1 mismatch or GMS error -> Launch native system AccountManager picker directly!
                launchSystemAccountPicker(systemAccountLauncher)
            }
        } catch (_: Exception) {
            launchSystemAccountPicker(systemAccountLauncher)
        }
    }

    return {
        try {
            // First attempt Google Play Services Sign-In Intent
            googleSignInClient.signOut().addOnCompleteListener {
                try {
                    gsoLauncher.launch(googleSignInClient.signInIntent)
                } catch (_: Exception) {
                    launchSystemAccountPicker(systemAccountLauncher)
                }
            }
        } catch (_: Exception) {
            launchSystemAccountPicker(systemAccountLauncher)
        }
    }
}

private fun launchSystemAccountPicker(
    launcher: androidx.activity.result.ActivityResultLauncher<android.content.Intent>
) {
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
        launcher.launch(intent)
    } catch (_: Exception) {}
}

fun deriveNameFromEmail(email: String): String {
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
        .ifEmpty { "Care Seeker" }
}

fun generateDefaultAvatar(name: String): String {
    val encoded = try {
        URLEncoder.encode(name, "UTF-8")
    } catch (_: Exception) {
        "User"
    }
    return "https://ui-avatars.com/api/?name=$encoded&background=006B70&color=fff&size=256&bold=true"
}

fun buildAccountFromEmail(email: String): PickedGoogleAccount {
    val cleanEmail = email.lowercase(Locale.getDefault())
    val name = deriveNameFromEmail(cleanEmail)
    return PickedGoogleAccount(
        email = cleanEmail,
        displayName = name,
        googleId = "gid_${cleanEmail.hashCode().toUInt()}",
        avatarUrl = generateDefaultAvatar(name)
    )
}
