package com.medmarg.patient.ui.auth

import android.accounts.AccountManager
import android.app.Activity
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import java.util.Locale

data class PickedGoogleAccount(
    val email: String,
    val displayName: String,
    val googleId: String
)

/**
 * Native Android System Google Account Picker Launcher.
 * Opens the native OS Account Chooser displaying all Google ("com.google") accounts
 * already signed in on the Android device in 1 tap — without opening a WebView password login!
 */
@Composable
fun rememberGoogleAccountPickerLauncher(
    onAccountPicked: (PickedGoogleAccount) -> Unit,
    onFallbackOrCancelled: () -> Unit
): () -> Unit {
    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            val email = result.data?.getStringExtra(AccountManager.KEY_ACCOUNT_NAME)?.trim().orEmpty()
            if (email.isNotEmpty() && email.contains("@")) {
                val rawPrefix = email.substringBefore("@")
                    .replace(".", " ")
                    .replace("_", " ")
                    .replace("-", " ")
                val derivedName = rawPrefix.split(" ")
                    .filter { it.isNotBlank() }
                    .joinToString(" ") { part ->
                        part.replaceFirstChar {
                            if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString()
                        }
                    }
                    .ifEmpty { "MedMarg Care Seeker" }

                onAccountPicked(
                    PickedGoogleAccount(
                        email = email.lowercase(Locale.getDefault()),
                        displayName = derivedName,
                        googleId = "gid_${email.lowercase(Locale.getDefault()).hashCode().toUInt()}"
                    )
                )
            } else {
                onFallbackOrCancelled()
            }
        } else {
            // If user cancelled the native account picker, do nothing or notify
        }
    }

    return {
        try {
            @Suppress("DEPRECATION")
            val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                AccountManager.newChooseAccountIntent(
                    null,
                    null,
                    arrayOf("com.google"),
                    null,
                    null,
                    null,
                    null
                )
            } else {
                AccountManager.newChooseAccountIntent(
                    null,
                    null,
                    arrayOf("com.google"),
                    false,
                    null,
                    null,
                    null,
                    null
                )
            }
            launcher.launch(intent)
        } catch (e: Exception) {
            onFallbackOrCancelled()
        }
    }
}

