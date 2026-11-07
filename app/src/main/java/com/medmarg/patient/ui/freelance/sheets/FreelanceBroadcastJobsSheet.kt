package com.medmarg.patient.ui.freelance.sheets

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.data.AgentRepository
import com.medmarg.patient.model.AgentPickupOrder
import com.medmarg.patient.model.FreelanceBroadcastJobItem
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.freelance.components.FreelanceBroadcastCard
import com.medmarg.patient.ui.theme.*
import kotlinx.coroutines.launch

/**
 * ⚡ FREELANCE BROADCAST JOBS VIEW (Replicated 1-on-1 with iOS FreelanceBroadcastJobsView.swift)
 * Live feed of unassigned overflow jobs in the phlebotomist's zone.
 * "First to claim gets assigned".
 */
@Composable
fun FreelanceBroadcastJobsSheet(
    user: UserProfile,
    onDismiss: () -> Unit,
    onJobClaimed: (AgentPickupOrder) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var jobs by remember { mutableStateOf<List<FreelanceBroadcastJobItem>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var claimingJobId by remember { mutableStateOf<String?>(null) }
    var selectedFilter by remember { mutableStateOf("ALL") } // "ALL", "FASTING", "HIGH_PRIORITY"
    var bannerMessage by remember { mutableStateOf<String?>(null) }

    val effectiveAgentName = if (user.name.isNotBlank()) user.name else if (user.username.isNotBlank()) user.username else "Freelance Phlebo"

    fun loadJobs() {
        coroutineScope.launch {
            isLoading = true
            jobs = AgentRepository.fetchBroadcastGigs()
            isLoading = false
        }
    }

    LaunchedEffect(Unit) {
        loadJobs()
    }

    val filteredJobs = remember(jobs, selectedFilter) {
        when (selectedFilter) {
            "FASTING" -> jobs.filter { it.fastingRequired == true }
            "HIGH_PRIORITY" -> jobs.filter { it.urgency?.uppercase()?.contains("HIGH") == true }
            else -> jobs
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier.fillMaxSize().padding(top = 28.dp),
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
            color = Slate50
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header Bar
                Surface(
                    color = PureWhite,
                    shadowElevation = 2.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(Icons.Default.Bolt, contentDescription = null, tint = Color(0xFF00B86B), modifier = Modifier.size(20.dp))
                                Text("Available Broadcast Gigs", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Slate900)
                            }

                            IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                                Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate500)
                            }
                        }

                        // Filter Chips Bar
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState())
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            FilterChipItem("All Gigs (${jobs.size})", "ALL", selectedFilter) { selectedFilter = it }
                            FilterChipItem("Fasting Req.", "FASTING", selectedFilter) { selectedFilter = it }
                            FilterChipItem("🔥 High Priority", "HIGH_PRIORITY", selectedFilter) { selectedFilter = it }
                        }
                    }
                }

                bannerMessage?.let { msg ->
                    Surface(
                        color = Color(0xFF00B86B),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text(msg, fontSize = 12.sp, color = PureWhite, fontWeight = FontWeight.Bold, modifier = Modifier.padding(10.dp))
                    }
                }

                // Scrollable Feed
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Info Announcement Card
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = Color(0xFF00B86B).copy(alpha = 0.08f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF00B86B).copy(alpha = 0.2f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF00B86B).copy(alpha = 0.15f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.NotificationsActive, contentDescription = null, tint = Color(0xFF00B86B), modifier = Modifier.size(18.dp))
                            }

                            Column {
                                Text("First Claim Wins!", fontSize = 13.sp, fontWeight = FontWeight.Black, color = Slate900)
                                Text("Nearby patient overflow pickups broadcasted directly to verified freelance phlebotomists.", fontSize = 11.sp, color = Slate600)
                            }
                        }
                    }

                    if (isLoading) {
                        Box(
                            modifier = Modifier.fillMaxWidth().padding(top = 40.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                CircularProgressIndicator(color = MedTealPrimary)
                                Spacer(modifier = Modifier.height(10.dp))
                                Text("Scanning for nearby broadcast gigs...", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate500)
                            }
                        }
                    } else if (filteredJobs.isEmpty()) {
                        Column(
                            modifier = Modifier.fillMaxWidth().padding(top = 60.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Slate400, modifier = Modifier.size(48.dp))
                            Text("No Open Overflow Jobs", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Slate700)
                            Text(
                                "All diagnostic collection slots in your area are covered. New gigs will appear automatically as orders arrive.",
                                fontSize = 12.sp,
                                color = Slate500,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                modifier = Modifier.padding(horizontal = 24.dp)
                            )
                        }
                    } else {
                        filteredJobs.forEach { job ->
                            FreelanceBroadcastCard(
                                job = job,
                                isClaiming = claimingJobId == job.id,
                                onClaim = {
                                    claimingJobId = job.id
                                    coroutineScope.launch {
                                        val claimed = AgentRepository.claimBroadcastGig(job.id, effectiveAgentName)
                                        claimingJobId = null
                                        if (claimed != null) {
                                            bannerMessage = "⚡ Gig ${claimed.id} claimed successfully! Added to your schedule."
                                            onJobClaimed(claimed)
                                            loadJobs()
                                        }
                                    }
                                }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(80.dp))
                }
            }
        }
    }
}

@Composable
private fun FilterChipItem(
    title: String,
    key: String,
    selected: String,
    onClick: (String) -> Unit
) {
    val isSelected = selected == key
    Surface(
        modifier = Modifier.clickable { onClick(key) },
        shape = RoundedCornerShape(20.dp),
        color = if (isSelected) MedTealPrimary else Slate100
    ) {
        Text(
            text = title,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = if (isSelected) PureWhite else Slate700,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}

