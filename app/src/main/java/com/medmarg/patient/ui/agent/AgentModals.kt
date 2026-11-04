package com.medmarg.patient.ui.agent

import androidx.compose.runtime.Composable
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.ui.agent.sheets.AgentCreateManualOrderModal as SheetCreateManualOrderModal
import com.medmarg.patient.ui.agent.sheets.AgentDoorstepQrPaymentModal as SheetDoorstepQrPaymentModal
import com.medmarg.patient.ui.agent.sheets.AgentDoorstepVisitModal as SheetDoorstepVisitModal

// =========================================================================
// 🔗 MODULAR SHEET DELEGATES FOR AGENT WORKFLOWS
// Each modal is implemented in its own separate file under ui/agent/sheets/
// and ui/agent/AgentLabHandoverScreen.kt, exposed here for seamless invocation.
// =========================================================================

@Composable
fun AgentDoorstepVisitModal(
    order: AgentPickupOrder,
    onDismiss: () -> Unit,
    onCollectQrPayment: () -> Unit,
    onCompleteVisit: () -> Unit
) {
    SheetDoorstepVisitModal(
        order = order,
        onDismiss = onDismiss,
        onCollectQrPayment = onCollectQrPayment,
        onCompleteVisit = onCompleteVisit
    )
}

@Composable
fun AgentDoorstepQrPaymentModal(
    order: AgentPickupOrder,
    onDismiss: () -> Unit,
    onPaymentDone: () -> Unit
) {
    SheetDoorstepQrPaymentModal(
        order = order,
        onDismiss = onDismiss,
        onPaymentDone = onPaymentDone
    )
}

@Composable
fun AgentCreateManualOrderModal(
    agentId: String,
    onDismiss: () -> Unit,
    onOrderCreated: () -> Unit
) {
    SheetCreateManualOrderModal(
        agentId = agentId,
        onDismiss = onDismiss,
        onOrderCreated = onOrderCreated
    )
}

@Composable
fun AgentLabHandoverModal(
    collectedOrders: List<AgentPickupOrder>,
    onDismiss: () -> Unit,
    onHandoverComplete: () -> Unit
) {
    AgentLabHandoverScreen(
        agentId = "AG-01",
        agentName = "Ramesh Kumar",
        collectedOrders = collectedOrders,
        onDismiss = onDismiss,
        onHandoverSuccess = onHandoverComplete
    )
}
