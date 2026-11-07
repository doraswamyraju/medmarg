package com.medmarg.patient.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.data.LiveOrderTestItem
import com.medmarg.patient.data.LivePatientOrder
import com.medmarg.patient.data.PatientApiService
import com.medmarg.patient.data.PatientSessionStore
import com.medmarg.patient.model.CartItem
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.checkout.AddressPinpointModal
import com.medmarg.patient.ui.checkout.RazorpayPaymentModal
import com.medmarg.patient.ui.profile.FamilyMembersModal
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutSheet(
    user: UserProfile,
    cartItems: List<CartItem>,
    selectedLabName: String,
    isExpress60Min: Boolean,
    payableAmount: Int,
    onDismissRequest: () -> Unit,
    onOrderBooked: (LivePatientOrder) -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    val familyList = PatientSessionStore.familyMembers
    val addressList = PatientSessionStore.savedAddresses

    var selectedMember by remember {
        mutableStateOf(familyList.firstOrNull() ?: com.medmarg.patient.model.FamilyMember("fam_self", user.name, "Self", 29, "Male"))
    }
    var selectedAddress by remember {
        mutableStateOf(
            addressList.firstOrNull { it.isDefault }
                ?: addressList.firstOrNull()
                ?: com.medmarg.patient.model.SavedAddress("addr_def", "Home", user.organization, contactPhone = user.phone)
        )
    }

    val upcomingDates = remember {
        val fmt = SimpleDateFormat("EEE, dd MMM", Locale.ENGLISH)
        val cal = Calendar.getInstance()
        val d0 = "Today, ${fmt.format(cal.time)}"
        cal.add(Calendar.DAY_OF_YEAR, 1)
        val d1 = "Tomorrow, ${fmt.format(cal.time)}"
        cal.add(Calendar.DAY_OF_YEAR, 1)
        val d2 = fmt.format(cal.time)
        listOf(d0, d1, d2)
    }

    var selectedDate by remember { mutableStateOf(upcomingDates[1]) }
    var selectedSlot by remember { mutableStateOf("06:30 AM - 07:30 AM (Recommended Fasting)") }
    var selectedPaymentMode by remember { mutableStateOf("ONLINE_PREPAID") } // ONLINE_PREPAID or PAY_AT_DOORSTEP

    var showAddressPinpointModal by remember { mutableStateOf(false) }
    var showFamilyMembersModal by remember { mutableStateOf(false) }
    var showRazorpayGatewayModal by remember { mutableStateOf(false) }
    var activeInternalOrderId by remember { mutableStateOf("") }
    var activeOrderAccessToken by remember { mutableStateOf("") }
    var isBookingOrder by remember { mutableStateOf(false) }
    var errorBanner by remember { mutableStateOf("") }

    fun finalizeBooking(razorpayPaymentId: String?) {
        isBookingOrder = true
        errorBanner = ""
        coroutineScope.launch {
            val testItems = cartItems.mapIndexed { idx, c ->
                LiveOrderTestItem(
                    code = c.id.uppercase().take(12),
                    name = c.title,
                    price = c.price,
                    sampleType = if (c.subtitle.contains("URINE", true)) "URINE" else "SERUM"
                )
            }
            val bookingResult = PatientApiService.bookPatientOrderWithToken(
                patientName = selectedMember.name,
                phone = user.phone,
                email = user.email,
                beneficiaryRelation = selectedMember.relationship,
                address = selectedAddress.fullAddress,
                slot = if (isExpress60Min) "Express 60-Min Doorstep Arrival" else selectedSlot,
                date = if (isExpress60Min) upcomingDates[0] else selectedDate,
                tests = testItems,
                totalAmount = payableAmount,
                paymentMode = selectedPaymentMode,
                paymentId = razorpayPaymentId,
                labName = selectedLabName,
                isExpress60Min = isExpress60Min
            )

            val booked = bookingResult?.order ?: LivePatientOrder(
                id = "MM-${(10000..99999).random()}",
                patientName = selectedMember.name,
                phone = user.phone,
                email = user.email,
                beneficiaryRelation = selectedMember.relationship,
                address = selectedAddress.fullAddress,
                slot = if (isExpress60Min) "Express 60-Min Doorstep Arrival" else selectedSlot,
                date = if (isExpress60Min) upcomingDates[0] else selectedDate,
                status = "PENDING_DISPATCH",
                tests = testItems,
                totalAmount = payableAmount,
                paymentMode = selectedPaymentMode,
                paymentStatus = if (selectedPaymentMode == "ONLINE_PREPAID") "PAID" else "PENDING_DOORSTEP",
                labName = selectedLabName,
                otp = "${(1000..9999).random()}",
                assignedAgentName = "Dispatching Nearest Certified Phlebotomist",
                isExpress60Min = isExpress60Min
            )

            if (selectedPaymentMode == "ONLINE_PREPAID" && razorpayPaymentId == null && bookingResult != null) {
                // Pre-created order for payment authorization binding
                activeInternalOrderId = bookingResult.order.id
                activeOrderAccessToken = bookingResult.orderAccessToken
                isBookingOrder = false
                showRazorpayGatewayModal = true
            } else {
                PatientSessionStore.liveOrders.add(0, booked)
                isBookingOrder = false
                // Wipe token from local state upon completion
                activeOrderAccessToken = ""
                activeInternalOrderId = ""
                onOrderBooked(booked)
            }
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        containerColor = PureWhite,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(vertical = 10.dp)
                    .width(40.dp)
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(Slate400.copy(alpha = 0.5f))
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .verticalScroll(rememberScrollState())
                .padding(bottom = 36.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Slot, Address & Payment Checkout",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Slate900
                    )
                    Text(
                        text = "$selectedLabName • Doorstep Sample Collection",
                        fontSize = 11.sp,
                        color = MedTealPrimary,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                Text(
                    text = "Back",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate500,
                    modifier = Modifier.clickable { onDismissRequest() }
                )
            }

            if (errorBanner.isNotEmpty()) {
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    color = Color(0xFFFEE2E2),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = errorBanner,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = RoseError,
                        modifier = Modifier.padding(10.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 1. Select Beneficiary Patient
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "1. Select Beneficiary Patient",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Text(
                    text = "+ Add Member",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MedTealPrimary,
                    modifier = Modifier.clickable { showFamilyMembersModal = true }
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                familyList.forEach { member ->
                    val isSel = selectedMember.id == member.id
                    Surface(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .clickable { selectedMember = member },
                        color = if (isSel) MedTealLight else Slate50,
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) MedTealPrimary else Slate200)
                    ) {
                        Text(
                            text = "${member.name} (${member.relationship})",
                            fontSize = 12.sp,
                            fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSel) MedTealPrimary else Slate700,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                        )
                    }
                }

                // Inline quick add button pill
                Surface(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .clickable { showFamilyMembersModal = true },
                    color = Slate50,
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate300)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, tint = MedTealPrimary, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "New Member",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MedTealPrimary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 2. Doorstep Collection Address
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "2. Doorstep Collection Address",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Text(
                    text = "+ Pinpoint New Address",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MedTealPrimary,
                    modifier = Modifier.clickable { showAddressPinpointModal = true }
                )
            }
            Spacer(modifier = Modifier.height(6.dp))

            addressList.forEach { addr ->
                val isSel = selectedAddress.id == addr.id
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 3.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (isSel) MedTealLight else Slate50)
                        .border(1.dp, if (isSel) MedTealPrimary else Slate200, RoundedCornerShape(10.dp))
                        .clickable { selectedAddress = addr }
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (isSel) Icons.Default.RadioButtonChecked else Icons.Default.RadioButtonUnchecked,
                        contentDescription = null,
                        tint = if (isSel) MedTealPrimary else Slate400,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "${addr.label} • ${addr.city}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Text(
                            text = addr.fullAddress,
                            fontSize = 11.sp,
                            color = Slate600
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 3. Date & Morning Slot Selector
            if (!isExpress60Min) {
                Text(
                    text = "3. Select Collection Date & Fasting Slot",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Spacer(modifier = Modifier.height(6.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    upcomingDates.forEach { dt ->
                        val isSel = selectedDate == dt
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .clickable { selectedDate = dt },
                            color = if (isSel) MedTealPrimary else Slate50,
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) MedTealPrimary else Slate200)
                        ) {
                            Text(
                                text = dt,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSel) PureWhite else Slate700,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf(
                        "06:30 AM - 07:30 AM (Recommended Fasting)",
                        "07:30 AM - 08:30 AM (Popular Morning Slot)",
                        "08:30 AM - 09:30 AM",
                        "10:00 AM - 11:00 AM (Non-Fasting)"
                    ).forEach { slot ->
                        val isSel = selectedSlot == slot
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSel) EmeraldLight else Slate50)
                                .border(1.dp, if (isSel) EmeraldAccent else Slate200, RoundedCornerShape(10.dp))
                                .clickable { selectedSlot = slot }
                                .padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = if (isSel) Icons.Default.RadioButtonChecked else Icons.Default.RadioButtonUnchecked,
                                contentDescription = null,
                                tint = if (isSel) EmeraldAccent else Slate400,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = slot,
                                fontSize = 12.sp,
                                fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                                color = Slate900
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
            }

            // 4. Payment Mode Selector (Razorpay Online vs Pay at Doorstep)
            Text(
                text = "4. Select Payment Method",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
            Spacer(modifier = Modifier.height(6.dp))

            // Option A: Razorpay Online Payment
            val isOnline = selectedPaymentMode == "ONLINE_PREPAID"
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (isOnline) MedTealLight else Slate50)
                    .border(1.5.dp, if (isOnline) MedTealPrimary else Slate200, RoundedCornerShape(12.dp))
                    .clickable { selectedPaymentMode = "ONLINE_PREPAID" }
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = if (isOnline) Icons.Default.RadioButtonChecked else Icons.Default.RadioButtonUnchecked,
                    contentDescription = null,
                    tint = if (isOnline) MedTealPrimary else Slate400,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Pay Online via Razorpay",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Surface(color = EmeraldAccent, shape = RoundedCornerShape(4.dp)) {
                            Text(
                                text = "INSTANT RECEIPT",
                                fontSize = 8.sp,
                                fontWeight = FontWeight.Black,
                                color = PureWhite,
                                modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Text(
                        text = "Google Pay, PhonePe, Paytm UPI, Credit/Debit Cards, NetBanking",
                        fontSize = 11.sp,
                        color = Slate600
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Option B: Pay at Doorstep
            val isCod = selectedPaymentMode == "PAY_AT_DOORSTEP"
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (isCod) MedTealLight else Slate50)
                    .border(1.5.dp, if (isCod) MedTealPrimary else Slate200, RoundedCornerShape(12.dp))
                    .clickable { selectedPaymentMode = "PAY_AT_DOORSTEP" }
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = if (isCod) Icons.Default.RadioButtonChecked else Icons.Default.RadioButtonUnchecked,
                    contentDescription = null,
                    tint = if (isCod) MedTealPrimary else Slate400,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Pay at Doorstep on Sample Collection",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Text(
                        text = "Pay via UPI QR or Cash directly to the certified phlebotomist",
                        fontSize = 11.sp,
                        color = Slate600
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // 5. Primary Action CTA
            Button(
                onClick = {
                    finalizeBooking(null)
                },
                enabled = !isBookingOrder,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (selectedPaymentMode == "ONLINE_PREPAID") MedTealPrimary else EmeraldAccent
                )
            ) {
                if (isBookingOrder) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp, color = PureWhite)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Dispatching Phlebotomist...", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                } else {
                    Icon(
                        imageVector = if (selectedPaymentMode == "ONLINE_PREPAID") Icons.Default.Lock else Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = PureWhite,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (selectedPaymentMode == "ONLINE_PREPAID") {
                            "Pay ₹$payableAmount Online via Razorpay"
                        } else {
                            "Confirm Doorstep Booking • ₹$payableAmount"
                        },
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                }
            }
        }
    }

    // Modular Address Pinpoint Modal
    if (showAddressPinpointModal) {
        AddressPinpointModal(
            defaultPhone = user.phone,
            onDismiss = { showAddressPinpointModal = false },
            onAddressSaved = { newAddr ->
                if (newAddr.isDefault) {
                    for (i in PatientSessionStore.savedAddresses.indices) {
                        PatientSessionStore.savedAddresses[i] = PatientSessionStore.savedAddresses[i].copy(isDefault = false)
                    }
                }
                PatientSessionStore.savedAddresses.add(0, newAddr)
                PatientSessionStore.saveAddresses(context, user)
                selectedAddress = newAddr
                showAddressPinpointModal = false
            }
        )
    }

    // Modular Family Member Addition Modal directly from Checkout
    if (showFamilyMembersModal) {
        FamilyMembersModal(
            user = user,
            onDismiss = {
                // If a new member was added to PatientSessionStore.familyMembers, auto-select the latest
                PatientSessionStore.familyMembers.firstOrNull()?.let {
                    selectedMember = it
                }
                showFamilyMembersModal = false
            }
        )
    }

    // Modular Live Razorpay Payment Gateway Modal
    if (showRazorpayGatewayModal) {
        RazorpayPaymentModal(
            amountInRupees = payableAmount,
            internalOrderId = activeInternalOrderId,
            orderAccessToken = activeOrderAccessToken,
            patientName = selectedMember.name,
            patientPhone = user.phone,
            patientEmail = user.email,
            onPaymentSuccess = { paymentId ->
                showRazorpayGatewayModal = false
                finalizeBooking(paymentId)
            },
            onPaymentFailed = { err ->
                showRazorpayGatewayModal = false
                errorBanner = "Razorpay Payment Incomplete: $err. You can retry or select Pay at Doorstep."
            },
            onDismiss = {
                showRazorpayGatewayModal = false
            }
        )
    }
}
