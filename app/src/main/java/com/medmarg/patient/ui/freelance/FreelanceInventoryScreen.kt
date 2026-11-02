package com.medmarg.patient.ui.freelance

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medmarg.patient.model.AgentInventoryItem
import com.medmarg.patient.model.UserProfile
import com.medmarg.patient.ui.theme.*

// =========================================================================
// 🧪 FREELANCE CONSUMABLES & PHLEBOTOMY KIT INVENTORY (TAB 1)
// Replicated 1-on-1 with iOS FreelanceInventoryView.swift
// =========================================================================

@Composable
fun FreelanceInventoryScreen(
    user: UserProfile,
    modifier: Modifier = Modifier
) {
    var kitItems by remember {
        mutableStateOf(
            listOf(
                AgentInventoryItem("f_1", "EDTA K2 Purple Tubes", "EDTA", 20, "Tubes", 10),
                AgentInventoryItem("f_2", "SST Gel Gold Tubes", "SST", 15, "Tubes", 10),
                AgentInventoryItem("f_3", "Grey Fluoride Tubes", "FL", 10, "Tubes", 5),
                AgentInventoryItem("f_4", "Flashback Needles 21G", "NEEDLE", 30, "Pcs", 15),
                AgentInventoryItem("f_5", "Tourniquet Band", "TOURNIQUET", 2, "Pcs", 1),
                AgentInventoryItem("f_6", "Alcohol Swabs", "SWABS", 40, "Pcs", 20),
                AgentInventoryItem("f_7", "Specimen Biohazard Bags", "BIO_BAG", 25, "Bags", 10)
            )
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate50)
            .statusBarsPadding()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(PureWhite)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Freelance Kit & Consumables",
                fontSize = 18.sp,
                fontWeight = FontWeight.Black,
                color = Slate900,
                modifier = Modifier.weight(1f)
            )

            Button(
                onClick = { /* Order kit */ },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEA580C)),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Order Kit", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 12.dp)
                .padding(bottom = 90.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("My Phlebotomy Bag Supplies", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Text("Stocked by MedMarg Central Supply Hub", fontSize = 11.sp, color = Slate500)

                    Spacer(modifier = Modifier.height(12.dp))

                    kitItems.forEach { item ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(item.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                Text(item.code, fontSize = 10.sp, color = Slate400)
                            }

                            Text(
                                text = "${item.stock} ${item.unit}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Black,
                                color = if (item.stock < 10) RoseError else MedTealPrimary
                            )
                        }
                        Divider(color = Slate100, thickness = 0.5.dp)
                    }
                }
            }
        }
    }
}

