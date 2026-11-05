package com.medmarg.patient.ui.checkout

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
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
                    val cleanDigits = patientPhone.filter { it.isDigit() }.takeLast(10).ifEmpty { "9876543210" }
                    val safeName = patientName.replace("'", "").ifEmpty { "MedMarg Patient" }
                    val safeEmail = patientEmail.replace("'", "").ifEmpty { "care@medmarg.com" }
                    val orderFieldJs = if (info.orderId.isNotEmpty()) "\"order_id\": \"${info.orderId}\"," else ""

                    val checkoutHtml = remember(info) {
                        """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
                            <style>
                                body {
                                    margin: 0;
                                    padding: 24px;
                                    background: #F8FAFC;
                                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    min-height: 85vh;
                                    text-align: center;
                                }
                                .card {
                                    background: white;
                                    border-radius: 16px;
                                    padding: 24px;
                                    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
                                    max-width: 340px;
                                    width: 100%;
                                }
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
                                }
                            </style>
                        </head>
                        <body>
                            <div class="card">
                                <h3 style="margin:0 0 6px 0;color:#0F172A;">Medcare Health Services</h3>
                                <p style="margin:0 0 12px 0;color:#64748B;font-size:13px;">Diagnostic Home Sample Collection</p>
                                <div style="font-size:26px;font-weight:900;color:#006B70;">₹$amountInRupees</div>
                                <button class="btn" onclick="openRazorpay()">Open Razorpay Payment Options</button>
                            </div>
                            <script>
                                var options = {
                                    "key": "${info.keyId}",
                                    "amount": "${info.amountPaise}",
                                    "currency": "INR",
                                    "name": "Medcare Health Services",
                                    "description": "MedMarg Diagnostic Home Collection",
                                    $orderFieldJs
                                    "prefill": {
                                        "name": "$safeName",
                                        "email": "$safeEmail",
                                        "contact": "$cleanDigits"
                                    },
                                    "theme": {
                                        "color": "#006B70"
                                    },
                                    "handler": function (response) {
                                        if (window.RazorpayAndroid) {
                                            window.RazorpayAndroid.onPaymentSuccess(
                                                response.razorpay_payment_id || "",
                                                response.razorpay_order_id || "",
                                                response.razorpay_signature || ""
                                            );
                                        }
                                    },
                                    "modal": {
                                        "ondismiss": function () {
                                            if (window.RazorpayAndroid) {
                                                window.RazorpayAndroid.onModalDismiss();
                                            }
                                        }
                                    }
                                };
                                function openRazorpay() {
                                    try {
                                        var rzp = new Razorpay(options);
                                        rzp.on('payment.failed', function (resp) {
                                            if (window.RazorpayAndroid) {
                                                var desc = (resp && resp.error && resp.error.description) ? resp.error.description : "Payment declined";
                                                window.RazorpayAndroid.onPaymentError(desc);
                                            }
                                        });
                                        rzp.open();
                                    } catch (e) {
                                        if (window.RazorpayAndroid) {
                                            window.RazorpayAndroid.onPaymentError(e.message || "Razorpay initialization failed");
                                        }
                                    }
                                }
                                window.onload = function() {
                                    setTimeout(openRazorpay, 250);
                                };
                            </script>
                        </body>
                        </html>
                        """.trimIndent()
                    }

                    AndroidView(
                        modifier = Modifier.fillMaxSize(),
                        factory = { ctx ->
                            WebView(ctx).apply {
                                settings.javaScriptEnabled = true
                                settings.domStorageEnabled = true
                                settings.javaScriptCanOpenWindowsAutomatically = true
                                settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                                CookieManager.getInstance().setAcceptCookie(true)
                                CookieManager.getInstance().setAcceptThirdPartyCookies(this, true)

                                addJavascriptInterface(
                                    AndroidRazorpayBridge(
                                        mainHandler = Handler(Looper.getMainLooper()),
                                        onSuccess = { payId -> onPaymentSuccess(payId) },
                                        onError = { err -> onPaymentFailed(err) },
                                        onCancelled = { onDismiss() }
                                    ),
                                    "RazorpayAndroid"
                                )

                                webViewClient = object : WebViewClient() {
                                    override fun shouldOverrideUrlLoading(
                                        view: WebView?,
                                        request: WebResourceRequest?
                                    ): Boolean {
                                        val urlStr = request?.url?.toString() ?: return false
                                        if (urlStr.startsWith("upi://") ||
                                            urlStr.startsWith("tez://") ||
                                            urlStr.startsWith("phonepe://") ||
                                            urlStr.startsWith("paytmmp://") ||
                                            urlStr.startsWith("intent://")
                                        ) {
                                            return try {
                                                val intent = if (urlStr.startsWith("intent://")) {
                                                    Intent.parseUri(urlStr, Intent.URI_INTENT_SCHEME)
                                                } else {
                                                    Intent(Intent.ACTION_VIEW, Uri.parse(urlStr))
                                                }
                                                ctx.startActivity(intent)
                                                true
                                            } catch (e: Exception) {
                                                true
                                            }
                                        }
                                        return false
                                    }
                                }

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

