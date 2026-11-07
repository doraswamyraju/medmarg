package com.medmarg.patient.ui.checkout

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.os.Message
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.data.PatientApiService
import com.medmarg.patient.data.RazorpayOrderInfo
import com.medmarg.patient.ui.theme.*

private class AndroidRazorpayBridge(
    private val mainHandler: Handler,
    private val onSuccess: (String) -> Unit,
    private val onError: (String) -> Unit,
    private val onCancelled: () -> Unit
) {
    @JavascriptInterface
    fun onPaymentSuccess(paymentId: String, orderId: String, signature: String) {
        mainHandler.post {
            onSuccess(paymentId.ifEmpty { "pay_live_${System.currentTimeMillis()}" })
        }
    }

    @JavascriptInterface
    fun onPaymentError(errorDesc: String) {
        mainHandler.post {
            onError(errorDesc.ifEmpty { "Payment could not be completed." })
        }
    }

    @JavascriptInterface
    fun onModalDismiss() {
        mainHandler.post {
            onCancelled()
        }
    }
}

/**
 * Modular Razorpay Live Payment Gateway Modal (1:1 parity with iOS CareSeekerCheckoutModal RazorpayWebView).
 * Calls POST https://medmarg.com/api/v1/payments/create-order and renders official Razorpay Checkout.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun RazorpayPaymentModal(
    amountInRupees: Int,
    patientName: String,
    patientPhone: String,
    patientEmail: String,
    onPaymentSuccess: (razorpayPaymentId: String) -> Unit,
    onPaymentFailed: (errorMessage: String) -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var isLoadingOrder by remember { mutableStateOf(true) }
    var orderInfo by remember { mutableStateOf<RazorpayOrderInfo?>(null) }
    var webViewLoading by remember { mutableStateOf(true) }

    LaunchedEffect(amountInRupees) {
        isLoadingOrder = true
        val created = PatientApiService.createRazorpayOrder(
            amountInRupees = amountInRupees,
            patientName = patientName,
            patientPhone = patientPhone
        )
        orderInfo = created ?: RazorpayOrderInfo(
            orderId = "",
            keyId = "rzp_live_Tno7dmuqnwn1YS",
            amountPaise = maxOf(1, amountInRupees) * 100
        )
        isLoadingOrder = false
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            shape = RoundedCornerShape(22.dp),
            color = PureWhite,
            shadowElevation = 24.dp
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Slate900)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = null,
                            tint = EmeraldAccent,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "Medcare Health Services • Razorpay",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = PureWhite
                            )
                            Text(
                                text = "256-Bit Encrypted UPI / Card / NetBanking Gateway • ₹$amountInRupees",
                                fontSize = 10.sp,
                                color = Slate400
                            )
                        }
                    }

                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = PureWhite)
                    }
                }

                if (isLoadingOrder) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator(color = MedTealPrimary)
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "Initializing Razorpay Secure Gateway (₹$amountInRupees)...",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate700
                            )
                        }
                    }
                } else {
                    val info = orderInfo!!
                    val cleanDigits = patientPhone.filter { it.isDigit() }.takeLast(10).ifEmpty { "7997991101" }
                    val safeContact = if (cleanDigits.startsWith("+")) cleanDigits else "+91$cleanDigits"
                    val safeName = patientName.replace("'", "").ifEmpty { "MedMarg Patient" }
                    val safeEmail = patientEmail.replace("'", "").ifEmpty { "patient@medmarg.com" }
                    val orderFieldJs = if (info.orderId.isNotEmpty()) "\"order_id\": \"${info.orderId}\"," else ""

                    // 1:1 Parity HTML matching iOS CareSeekerCheckoutModal.swift
                    val checkoutHtml = remember(info) {
                        """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                            <title>Razorpay Checkout</title>
                            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
                            <style>
                                * { box-sizing: border-box; }
                                body {
                                    margin: 0;
                                    padding: 0;
                                    background: #0B132B;
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    min-height: 100vh;
                                    color: #FFFFFF;
                                }
                                .loader-container {
                                    text-align: center;
                                    padding: 24px;
                                }
                                .spinner {
                                    width: 44px;
                                    height: 44px;
                                    border: 4px solid rgba(255, 255, 255, 0.15);
                                    border-radius: 50%;
                                    border-top-color: #006B70;
                                    animation: spin 0.8s linear infinite;
                                    margin: 0 auto 16px;
                                }
                                @keyframes spin {
                                    to { transform: rotate(360deg); }
                                }
                                h3 { margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #FFFFFF; }
                                p { margin: 0; font-size: 13px; color: #94A3B8; }
                                .btn {
                                    background: #006B70;
                                    color: white;
                                    border: none;
                                    padding: 14px 20px;
                                    border-radius: 12px;
                                    font-weight: 700;
                                    font-size: 14px;
                                    width: 100%;
                                    margin-top: 16px;
                                    cursor: pointer;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="loader-container">
                                <div class="spinner"></div>
                                <h3>Connecting to Razorpay</h3>
                                <p>Opening official payment gateway (₹$amountInRupees)...</p>
                                <button class="btn" onclick="openRazorpay()">Proceed to Pay</button>
                            </div>
                            <script>
                                function openRazorpay() {
                                    try {
                                        var options = {
                                            "key": "${info.keyId}",
                                            "amount": "${info.amountPaise}",
                                            "currency": "INR",
                                            "name": "Medcare Health Services",
                                            "description": "MedMarg Diagnostic Home Collection",
                                            $orderFieldJs
                                            "image": "https://medmarg.com/logo-icon.png",
                                            "prefill": {
                                                "name": "$safeName",
                                                "email": "$safeEmail",
                                                "contact": "$safeContact"
                                            },
                                            "theme": {
                                                "color": "#006B70",
                                                "backdrop_color": "#0B132B"
                                            },
                                            "modal": {
                                                "backdropclose": false,
                                                "escape": false,
                                                "handleback": true,
                                                "ondismiss": function() {
                                                    if (window.RazorpayAndroid) {
                                                        window.RazorpayAndroid.onModalDismiss();
                                                    }
                                                }
                                            },
                                            "handler": function (response) {
                                                if (window.RazorpayAndroid) {
                                                    window.RazorpayAndroid.onPaymentSuccess(
                                                        response.razorpay_payment_id || "",
                                                        response.razorpay_order_id || "",
                                                        response.razorpay_signature || ""
                                                    );
                                                }
                                            }
                                        };
                                        var rzp = new Razorpay(options);
                                        rzp.on('payment.failed', function (response){
                                            if (window.RazorpayAndroid) {
                                                var desc = (response && response.error && response.error.description) ? response.error.description : "Payment could not be processed";
                                                window.RazorpayAndroid.onPaymentError(desc);
                                            }
                                        });
                                        rzp.open();
                                    } catch (e) {
                                        if (window.RazorpayAndroid) {
                                            window.RazorpayAndroid.onPaymentError(e.message || "Failed to launch Razorpay");
                                        }
                                    }
                                }
                                window.onload = function() {
                                    setTimeout(openRazorpay, 300);
                                };
                            </script>
                        </body>
                        </html>
                        """.trimIndent()
                    }

                    Box(modifier = Modifier.fillMaxSize()) {
                        AndroidView(
                            modifier = Modifier.fillMaxSize(),
                            factory = { ctx ->
                                WebView(ctx).apply {
                                    // 1. Full web settings configuration
                                    settings.javaScriptEnabled = true
                                    settings.domStorageEnabled = true
                                    settings.javaScriptCanOpenWindowsAutomatically = true
                                    settings.setSupportMultipleWindows(true)
                                    settings.databaseEnabled = true
                                    settings.allowFileAccess = true
                                    settings.allowContentAccess = true
                                    settings.useWideViewPort = true
                                    settings.loadWithOverviewMode = true
                                    settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                                    CookieManager.getInstance().setAcceptCookie(true)
                                    CookieManager.getInstance().setAcceptThirdPartyCookies(this, true)

                                    // 2. JavaScript Interface
                                    addJavascriptInterface(
                                        AndroidRazorpayBridge(
                                            mainHandler = Handler(Looper.getMainLooper()),
                                            onSuccess = { payId -> onPaymentSuccess(payId) },
                                            onError = { err -> onPaymentFailed(err) },
                                            onCancelled = { onDismiss() }
                                        ),
                                        "RazorpayAndroid"
                                    )

                                    // 3. WebChromeClient with window.open (target="_blank" / popup) handling
                                    webChromeClient = object : WebChromeClient() {
                                        override fun onCreateWindow(
                                            view: WebView?,
                                            isDialog: Boolean,
                                            isUserGesture: Boolean,
                                            resultMsg: Message?
                                        ): Boolean {
                                            val transport = resultMsg?.obj as? WebView.WebViewTransport
                                            transport?.webView = view
                                            resultMsg?.sendToTarget()
                                            return true
                                        }
                                    }

                                    // 4. WebViewClient intercepting UPI intents & payment completion
                                    webViewClient = object : WebViewClient() {
                                        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                                            super.onPageStarted(view, url, favicon)
                                            webViewLoading = false
                                        }

                                        override fun shouldOverrideUrlLoading(
                                            view: WebView?,
                                            request: WebResourceRequest?
                                        ): Boolean {
                                            val urlStr = request?.url?.toString() ?: return false

                                            // A. Deep-link to Native UPI Apps (GPay, PhonePe, Paytm, BHIM, Cred)
                                            if (urlStr.startsWith("upi://") ||
                                                urlStr.startsWith("tez://") ||
                                                urlStr.startsWith("phonepe://") ||
                                                urlStr.startsWith("paytmmp://") ||
                                                urlStr.startsWith("bhim://") ||
                                                urlStr.startsWith("credpay://") ||
                                                urlStr.startsWith("intent://")
                                            ) {
                                                return try {
                                                    val intent = if (urlStr.startsWith("intent://")) {
                                                        Intent.parseUri(urlStr, Intent.URI_INTENT_SCHEME)
                                                    } else {
                                                        Intent(Intent.ACTION_VIEW, Uri.parse(urlStr))
                                                    }
                                                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                                    ctx.startActivity(intent)
                                                    true
                                                } catch (e: Exception) {
                                                    // Fallback if app not installed: try browser
                                                    try {
                                                        val fallbackUrl = if (urlStr.startsWith("intent://")) {
                                                            val parsed = Intent.parseUri(urlStr, Intent.URI_INTENT_SCHEME)
                                                            parsed.getStringExtra("browser_fallback_url")
                                                        } else null
                                                        if (!fallbackUrl.isNullOrEmpty()) {
                                                            view?.loadUrl(fallbackUrl)
                                                        }
                                                    } catch (_: Exception) {}
                                                    true
                                                }
                                            }

                                            // B. Intercept payment success redirect
                                            if (urlStr.contains("payment_id=") || urlStr.contains("razorpay_payment_id=")) {
                                                val uri = Uri.parse(urlStr)
                                                val paymentId = uri.getQueryParameter("razorpay_payment_id")
                                                    ?: uri.getQueryParameter("payment_id")
                                                    ?: "pay_live_${System.currentTimeMillis()}"
                                                onPaymentSuccess(paymentId)
                                                return true
                                            }

                                            // C. Intercept payment failure or cancel
                                            if (urlStr.contains("/payment/cancel") || urlStr.contains("status=failed")) {
                                                onPaymentFailed("Payment was cancelled or failed.")
                                                return true
                                            }

                                            return false
                                        }
                                    }

                                    // 5. Load official Razorpay Checkout HTML
                                    loadDataWithBaseURL(
                                        "https://medmarg.com",
                                        checkoutHtml,
                                        "text/html",
                                        "UTF-8",
                                        null
                                    )
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}
