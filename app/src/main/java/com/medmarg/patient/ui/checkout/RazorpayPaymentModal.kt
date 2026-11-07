package com.medmarg.patient.ui.checkout

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.browser.customtabs.CustomTabColorSchemeParams
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.medmarg.patient.MainActivity
import com.medmarg.patient.data.PatientApiService
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

enum class GatewayViewMode {
    INITIALIZING,        // Fetching or preparing payment session
    WAITING_FOR_PAYMENT, // Launched Custom Tabs / Browser, waiting for user return
    HOSTED_WEBVIEW,      // Sandboxed in-app WebView fallback
    VERIFYING,           // Authoritative backend order status check in flight
    PENDING_RETRY,       // Awaiting user confirmation or manual retry
    ERROR                // Terminal failure
}

/**
 * Unified Razorpay Hosted Checkout Modal for Android
 *
 * Architecture & Principles:
 * 1. Razorpay Hosted Checkout is the PRIMARY payment gateway for all Android users.
 * 2. 3-Tier Launch Hierarchy:
 *    - Priority 1: Android Custom Tabs (CustomTabsIntent with MedTeal toolbar).
 *    - Priority 2: External Default Browser (Intent.ACTION_VIEW).
 *    - Priority 3: Sandboxed in-app WebView with strict HTTPS whitelist & external UPI app handoff.
 * 3. Lifecycle-Aware Auto-Resume: Automatically triggers authoritative backend order-status polling
 *    when the user returns to the MedMarg app from Custom Tabs / External Browser / UPI app.
 * 4. Authoritative Verification: Only PAID_SUCCESS confirmed by backend with genuine paymentId triggers success.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun RazorpayPaymentModal(
    amountInRupees: Int,
    internalOrderId: String = "",
    orderAccessToken: String = "",
    patientName: String,
    patientPhone: String,
    patientEmail: String,
    onPaymentSuccess: (String) -> Unit,
    onPaymentFailed: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val activity = context as? Activity
    val coroutineScope = rememberCoroutineScope()
    val lifecycleOwner = LocalLifecycleOwner.current

    var viewMode by remember { mutableStateOf(GatewayViewMode.INITIALIZING) }
    var hostedPaymentUrl by remember { mutableStateOf("") }
    var statusMessage by remember { mutableStateOf("Preparing secure Razorpay checkout...") }
    var errorMessage by remember { mutableStateOf("") }
    var isPollingActive by remember { mutableStateOf(false) }
    var browserHasBeenLaunched by remember { mutableStateOf(false) }

    // Authoritative backend status verification with exponential delay
    fun verifyBackendPaymentStatus(
        maxAttempts: Int = 5,
        onVerified: ((Boolean, String?) -> Unit)? = null
    ) {
        if (isPollingActive) return
        if (internalOrderId.isEmpty() || orderAccessToken.isEmpty()) return

        isPollingActive = true
        viewMode = GatewayViewMode.VERIFYING
        statusMessage = "Confirming payment with MedMarg secure gateway..."

        coroutineScope.launch {
            var attempts = 0
            var verifiedPaymentId: String? = null
            var isSuccess = false

            while (attempts < maxAttempts) {
                delay(if (attempts == 0) 1000L else 2000L)
                attempts++

                val statusResult = PatientApiService.verifyOrderStatus(
                    orderId = internalOrderId,
                    orderAccessToken = orderAccessToken
                )

                if (statusResult.success && statusResult.isPaid && !statusResult.paymentId.isNullOrEmpty()) {
                    isSuccess = true
                    verifiedPaymentId = statusResult.paymentId
                    break
                }
            }

            isPollingActive = false
            if (isSuccess && verifiedPaymentId != null) {
                statusMessage = "Payment verified! Confirming order..."
                onPaymentSuccess(verifiedPaymentId)
                onVerified?.invoke(true, verifiedPaymentId)
            } else {
                viewMode = GatewayViewMode.PENDING_RETRY
                statusMessage = "Payment confirmation pending with bank."
                onVerified?.invoke(false, null)
            }
        }
    }

    // 3-Tier Browser Launcher Hierarchy
    fun launchHostedCheckout(url: String) {
        if (url.isEmpty() || activity == null) return
        val parsedUri = Uri.parse(url)

        // Priority 1: Android Custom Tabs
        try {
            val colorParams = CustomTabColorSchemeParams.Builder()
                .setToolbarColor(MedTealPrimary.toArgb())
                .build()

            val customTabsIntent = CustomTabsIntent.Builder()
                .setDefaultColorSchemeParams(colorParams)
                .setShowTitle(true)
                .build()

            customTabsIntent.launchUrl(activity, parsedUri)
            browserHasBeenLaunched = true
            viewMode = GatewayViewMode.WAITING_FOR_PAYMENT
            statusMessage = "Complete payment in the secure browser window"
            return
        } catch (_: ActivityNotFoundException) {
            // Priority 1 failed, proceed to Priority 2
        } catch (_: Exception) {
            // Any other issue, proceed to Priority 2
        }

        // Priority 2: External Default Browser
        try {
            val browserIntent = Intent(Intent.ACTION_VIEW, parsedUri).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            activity.startActivity(browserIntent)
            browserHasBeenLaunched = true
            viewMode = GatewayViewMode.WAITING_FOR_PAYMENT
            statusMessage = "Complete payment in your browser"
            return
        } catch (_: ActivityNotFoundException) {
            // Priority 2 failed, proceed to Priority 3
        } catch (_: Exception) {}

        // Priority 3: Sandboxed in-app WebView fallback
        hostedPaymentUrl = url
        viewMode = GatewayViewMode.HOSTED_WEBVIEW
    }

    // Initialize or fetch the hosted payment link
    fun initializeHostedSession() {
        viewMode = GatewayViewMode.INITIALIZING
        statusMessage = "Connecting to MedMarg Secure Gateway..."

        coroutineScope.launch {
            val switchResult = PatientApiService.switchToHostedCheckout(
                orderId = internalOrderId,
                patientName = patientName,
                patientPhone = patientPhone,
                orderAccessToken = orderAccessToken
            )

            if (switchResult.success) {
                if (switchResult.alreadyPaid && !switchResult.paymentId.isNullOrEmpty()) {
                    onPaymentSuccess(switchResult.paymentId)
                } else if (switchResult.paymentUrl.isNotEmpty()) {
                    hostedPaymentUrl = switchResult.paymentUrl
                    launchHostedCheckout(switchResult.paymentUrl)
                } else {
                    viewMode = GatewayViewMode.ERROR
                    errorMessage = switchResult.errorMessage ?: "Failed to generate payment link."
                }
            } else {
                viewMode = GatewayViewMode.ERROR
                errorMessage = switchResult.errorMessage ?: "Could not initialize checkout."
            }
        }
    }

    // Listen to deep-link redirects returned to MainActivity
    DisposableEffect(Unit) {
        MainActivity.onPaymentCallbackReceived = { orderId, paymentId, status ->
            if (status.contains("fail", ignoreCase = true) || status.contains("cancel", ignoreCase = true)) {
                viewMode = GatewayViewMode.PENDING_RETRY
                statusMessage = "Payment was not completed."
            } else if (!paymentId.isNullOrEmpty()) {
                // Instantly run cryptographic server verification
                verifyBackendPaymentStatus(maxAttempts = 3)
            } else {
                // Poll backend order status
                verifyBackendPaymentStatus(maxAttempts = 5)
            }
        }

        onDispose {
            MainActivity.onPaymentCallbackReceived = null
        }
    }

    // Lifecycle Observer: When app resumes from Custom Tabs / External Browser / UPI app, verify payment status
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME && browserHasBeenLaunched) {
                // User has returned from Custom Tabs / External Browser
                if (viewMode == GatewayViewMode.WAITING_FOR_PAYMENT) {
                    verifyBackendPaymentStatus(maxAttempts = 5)
                }
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    // Initial launch on composable start
    LaunchedEffect(Unit) {
        initializeHostedSession()
    }

    Dialog(
        onDismissRequest = {
            if (viewMode == GatewayViewMode.WAITING_FOR_PAYMENT || viewMode == GatewayViewMode.HOSTED_WEBVIEW) {
                // Verify before dismissing in case customer paid
                verifyBackendPaymentStatus(maxAttempts = 2) { paid, _ ->
                    if (!paid) onDismiss()
                }
            } else {
                onDismiss()
            }
        },
        properties = DialogProperties(
            usePlatformDefaultWidth = false,
            decorFitsSystemWindows = false
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.65f)),
            contentAlignment = Alignment.Center
        ) {
            when (viewMode) {
                GatewayViewMode.INITIALIZING, GatewayViewMode.VERIFYING -> {
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = PureWhite,
                        shadowElevation = 16.dp,
                        modifier = Modifier.padding(28.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            CircularProgressIndicator(
                                color = MedTealPrimary,
                                modifier = Modifier.size(36.dp),
                                strokeWidth = 3.dp
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = statusMessage,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate800,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Please do not close or leave the app",
                                fontSize = 11.sp,
                                color = Slate500,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }

                GatewayViewMode.WAITING_FOR_PAYMENT -> {
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = PureWhite,
                        shadowElevation = 16.dp,
                        modifier = Modifier.padding(24.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "Secure Payment",
                                tint = MedTealPrimary,
                                modifier = Modifier.size(40.dp)
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            Text(
                                text = "Complete Payment",
                                fontSize = 17.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Slate900,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Your payment window is open. Complete payment using Google Pay, PhonePe, Paytm, UPI, Cards, or NetBanking.",
                                fontSize = 12.sp,
                                color = Slate600,
                                textAlign = TextAlign.Center,
                                lineHeight = 18.sp
                            )
                            Spacer(modifier = Modifier.height(20.dp))

                            Button(
                                onClick = { verifyBackendPaymentStatus(maxAttempts = 5) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(46.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Refresh,
                                    contentDescription = null,
                                    tint = PureWhite,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("I Have Completed Payment", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PureWhite)
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            OutlinedButton(
                                onClick = {
                                    if (hostedPaymentUrl.isNotEmpty()) {
                                        launchHostedCheckout(hostedPaymentUrl)
                                    } else {
                                        initializeHostedSession()
                                    }
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(44.dp),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text("Re-open Payment Window", fontWeight = FontWeight.SemiBold, fontSize = 12.sp, color = Slate700)
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            TextButton(onClick = onDismiss) {
                                Text("Cancel", color = Slate500, fontSize = 12.sp)
                            }
                        }
                    }
                }

                GatewayViewMode.HOSTED_WEBVIEW -> {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth(0.96f)
                            .fillMaxHeight(0.92f),
                        shape = RoundedCornerShape(20.dp),
                        color = PureWhite,
                        shadowElevation = 20.dp
                    ) {
                        Column(modifier = Modifier.fillMaxSize()) {
                            // Secure Top Header Bar
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(Slate900)
                                    .padding(horizontal = 16.dp, vertical = 12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.Lock,
                                        contentDescription = "Secure",
                                        tint = EmeraldAccent,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column {
                                        Text(
                                            text = "MedMarg Secure Payment",
                                            color = PureWhite,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "Powered by Razorpay • UPI / Cards / NetBanking",
                                            color = Slate400,
                                            fontSize = 10.sp
                                        )
                                    }
                                }

                                IconButton(
                                    onClick = {
                                        verifyBackendPaymentStatus(maxAttempts = 3) { paid, _ ->
                                            if (!paid) onDismiss()
                                        }
                                    },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = "Close",
                                        tint = Slate300
                                    )
                                }
                            }

                            // Secure Sandboxed WebView with strict HTTPS whitelist & UPI intent handlers
                            AndroidView(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .weight(1f),
                                factory = { ctx ->
                                    WebView(ctx).apply {
                                        layoutParams = ViewGroup.LayoutParams(
                                            ViewGroup.LayoutParams.MATCH_PARENT,
                                            ViewGroup.LayoutParams.MATCH_PARENT
                                        )
                                        settings.javaScriptEnabled = true
                                        settings.domStorageEnabled = true
                                        settings.allowFileAccess = false
                                        settings.allowContentAccess = false
                                        settings.databaseEnabled = false
                                        webChromeClient = WebChromeClient()

                                        webViewClient = object : WebViewClient() {
                                            override fun shouldOverrideUrlLoading(
                                                view: WebView?,
                                                request: WebResourceRequest?
                                            ): Boolean {
                                                val uri = request?.url ?: return false
                                                val scheme = uri.scheme?.lowercase() ?: return false
                                                val host = uri.host?.lowercase() ?: ""

                                                // 1. Strict HTTPS domain whitelist
                                                if (scheme == "https") {
                                                    val allowedHosts = setOf(
                                                        "rzp.io",
                                                        "api.razorpay.com",
                                                        "pages.razorpay.com",
                                                        "medmarg.com"
                                                    )
                                                    if (host in allowedHosts || host.endsWith(".razorpay.com")) {
                                                        if (uri.path?.contains("/callback") == true || uri.path?.contains("payment-callback") == true) {
                                                            verifyBackendPaymentStatus(maxAttempts = 5)
                                                            return true
                                                        }
                                                        return false // Load inside WebView
                                                    }
                                                    return true // Block untrusted external HTTPS
                                                }

                                                // 2. Custom UPI App Schemes
                                                val allowedUpiSchemes = setOf(
                                                    "phonepe", "upi", "tez", "paytmmp", "bhim", "credpay", "whatsapp"
                                                )
                                                if (scheme in allowedUpiSchemes) {
                                                    try {
                                                        val intent = Intent(Intent.ACTION_VIEW, uri).apply {
                                                            flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                                        }
                                                        ctx.startActivity(intent)
                                                        verifyBackendPaymentStatus(maxAttempts = 6)
                                                        return true
                                                    } catch (_: Exception) {
                                                        Toast.makeText(ctx, "UPI application not available.", Toast.LENGTH_SHORT).show()
                                                        return true
                                                    }
                                                }

                                                // 3. Android Intent URI format
                                                if (scheme == "intent") {
                                                    try {
                                                        val parsedIntent = Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME)
                                                        val targetPackage = parsedIntent.`package`
                                                        val allowedPackages = setOf(
                                                            "com.phonepe.app",
                                                            "com.google.android.apps.nbu.paisa.user",
                                                            "net.one97.paytm",
                                                            "in.org.npci.upiapp",
                                                            "com.cred.android"
                                                        )

                                                        if (targetPackage != null && targetPackage in allowedPackages) {
                                                            parsedIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                                            ctx.startActivity(parsedIntent)
                                                            verifyBackendPaymentStatus(maxAttempts = 6)
                                                            return true
                                                        }

                                                        val fallbackUrl = parsedIntent.getStringExtra("browser_fallback_url")
                                                        if (fallbackUrl != null) {
                                                            val fbUri = Uri.parse(fallbackUrl)
                                                            if (fbUri.host in setOf("rzp.io", "pages.razorpay.com")) {
                                                                view?.loadUrl(fallbackUrl)
                                                                return true
                                                            }
                                                        }
                                                    } catch (_: Exception) {}
                                                    return true
                                                }

                                                return true
                                            }
                                        }

                                        loadUrl(hostedPaymentUrl)
                                    }
                                }
                            )

                            // Bottom Bar: Status & Refresh
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(Slate100)
                                    .padding(horizontal = 16.dp, vertical = 10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Completed payment in UPI app?",
                                    fontSize = 11.sp,
                                    color = Slate600
                                )
                                Button(
                                    onClick = { verifyBackendPaymentStatus(maxAttempts = 4) },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Refresh,
                                        contentDescription = "Check Status",
                                        tint = PureWhite,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Verify Status", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                }
                            }
                        }
                    }
                }

                GatewayViewMode.PENDING_RETRY -> {
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = PureWhite,
                        shadowElevation = 16.dp,
                        modifier = Modifier.padding(24.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Payment Status Pending",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Slate900,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = "If amount was debited from your bank account or UPI app, your order will confirm automatically. You can check status now or re-open payment.",
                                fontSize = 12.sp,
                                color = Slate600,
                                textAlign = TextAlign.Center,
                                lineHeight = 18.sp
                            )
                            Spacer(modifier = Modifier.height(20.dp))

                            Button(
                                onClick = { verifyBackendPaymentStatus(maxAttempts = 5) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(46.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                            ) {
                                Text("Check Payment Status", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PureWhite)
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            OutlinedButton(
                                onClick = {
                                    if (hostedPaymentUrl.isNotEmpty()) {
                                        launchHostedCheckout(hostedPaymentUrl)
                                    } else {
                                        initializeHostedSession()
                                    }
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(46.dp),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text("Retry Payment Window", fontWeight = FontWeight.SemiBold, fontSize = 12.sp, color = Slate700)
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            TextButton(onClick = onDismiss) {
                                Text("Dismiss", color = Slate500, fontSize = 12.sp)
                            }
                        }
                    }
                }

                GatewayViewMode.ERROR -> {
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = PureWhite,
                        shadowElevation = 16.dp,
                        modifier = Modifier.padding(24.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Payment Incomplete",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = RoseError,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = errorMessage.ifEmpty { "We could not confirm your payment." },
                                fontSize = 12.sp,
                                color = Slate600,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(18.dp))

                            Button(
                                onClick = { initializeHostedSession() },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(44.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                            ) {
                                Text("Try Again", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PureWhite)
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            TextButton(onClick = onDismiss) {
                                Text("Close", color = Slate500, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
