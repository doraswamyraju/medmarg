package com.medmarg.patient

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.medmarg.patient.ui.auth.GoogleSignInManager
import com.medmarg.patient.ui.theme.MedMargTheme
import com.razorpay.Checkout
import com.razorpay.PaymentData
import com.razorpay.PaymentResultWithDataListener

class MainActivity : ComponentActivity(), PaymentResultWithDataListener {

    companion object {
        var onPaymentSuccessCallback: ((paymentId: String, orderId: String, signature: String) -> Unit)? = null
        var onPaymentErrorCallback: ((code: Int, response: String?) -> Unit)? = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        handleRedirectUri(intent)

        // Preload Razorpay Checkout for zero-latency presentation
        try {
            Checkout.preload(applicationContext)
        } catch (_: Exception) {}

        setContent {
            MedMargTheme {
                MedMargApp()
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleRedirectUri(intent)
    }

    private fun handleRedirectUri(intent: Intent?) {
        val uri = intent?.data ?: return
        if (uri.scheme == "medmarg" && uri.host == "payment-callback") {
            val paymentId = uri.getQueryParameter("razorpay_payment_id")
                ?: uri.getQueryParameter("payment_id")
            val orderId = uri.getQueryParameter("razorpay_order_id") ?: ""
            val signature = uri.getQueryParameter("razorpay_signature") ?: ""
            val status = uri.getQueryParameter("status") ?: "success"

            if (status.contains("fail", ignoreCase = true) || status.contains("cancel", ignoreCase = true)) {
                onPaymentErrorCallback?.invoke(Checkout.PAYMENT_CANCELED, "Payment was cancelled or failed.")
            } else if (!paymentId.isNullOrEmpty()) {
                onPaymentSuccessCallback?.invoke(paymentId, orderId, signature)
            } else {
                onPaymentErrorCallback?.invoke(Checkout.NETWORK_ERROR, "No payment ID returned from gateway.")
            }
            return
        }
        GoogleSignInManager.handleRedirectUri(uri)
    }

    override fun onPaymentSuccess(razorpayPaymentId: String?, paymentData: PaymentData?) {
        val paymentId = razorpayPaymentId ?: paymentData?.paymentId
        val orderId = paymentData?.orderId ?: ""
        val signature = paymentData?.signature ?: ""

        if (!paymentId.isNullOrEmpty()) {
            onPaymentSuccessCallback?.invoke(paymentId, orderId, signature)
        } else {
            onPaymentErrorCallback?.invoke(Checkout.NETWORK_ERROR, "Razorpay reported success without payment identifier.")
        }
    }

    override fun onPaymentError(code: Int, response: String?, paymentData: PaymentData?) {
        onPaymentErrorCallback?.invoke(code, response)
    }
}
