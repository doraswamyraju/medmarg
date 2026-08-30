package com.medmarg.patient.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.medmarg.patient.data.SampleDataProvider
import com.medmarg.patient.model.InsurancePolicy
import com.medmarg.patient.ui.theme.*

@Composable
fun InsuranceScreen(
    modifier: Modifier = Modifier
) {
    val policies = SampleDataProvider.insurancePolicies

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        // Insurance Header Banner
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MedTealPrimary)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            color = PureWhite.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "CASHLESS DIAGNOSTICS & OPD",
                                color = PureWhite,
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                        Icon(
                            imageVector = Icons.Default.Shield,
                            contentDescription = "Insurance",
                            tint = PureWhite,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Instant Cashless Diagnostic Pre-Approval",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                    Text(
                        text = "Link your health insurance to get 0-cost pre-authorized scans & lab tests across 180+ network centers.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MedTealLight
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = {},
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PureWhite)
                    ) {
                        Text(
                            text = "+ Link New Policy",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = MedTealPrimary
                        )
                    }
                }
            }
        }

        item {
            Text(
                text = "Active Insurance Policies",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = Slate900,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )
        }

        items(policies) { policy ->
            InsurancePolicyCard(policy = policy)
        }

        // Cashless Claim Process Steps
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = BorderStroke(1.dp, CardBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "How Cashless Diagnostics Works",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    ClaimStepItem(step = "1", title = "Select Test / Scan", desc = "Choose accredited lab or radiology center")
                    ClaimStepItem(step = "2", title = "Select 'Pay via Insurance'", desc = "MedMarg auto-submits pre-authorization request")
                    ClaimStepItem(step = "3", title = "Walk-in Cashless", desc = "Avail your scan or test with zero out-of-pocket hassle")
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

@Composable
fun InsurancePolicyCard(policy: InsurancePolicy) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = BorderStroke(1.dp, CardBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = policy.providerName,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Surface(
                    color = EmeraldLight,
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = "Active",
                        color = EmeraldAccent,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Policy No: ${policy.policyNumber}",
                style = MaterialTheme.typography.bodyMedium,
                color = Slate500
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Sum Insured",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400
                    )
                    Text(
                        text = policy.sumInsured,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MedTealPrimary
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "Valid Till",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400
                    )
                    Text(
                        text = policy.validTill,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = Slate800
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Covered: ${policy.membersCovered.joinToString(", ")}",
                style = MaterialTheme.typography.bodyMedium,
                color = Slate600
            )
        }
    }
}

@Composable
fun ClaimStepItem(step: String, title: String, desc: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(28.dp)
                .clip(CircleShape)
                .background(MedTealLight),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = step,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = MedTealPrimary
            )
        }
        Spacer(modifier = Modifier.width(10.dp))
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
            Text(
                text = desc,
                style = MaterialTheme.typography.labelSmall,
                color = Slate500
            )
        }
    }
}
