package com.medmarg.patient.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.medmarg.patient.data.SampleDataProvider
import com.medmarg.patient.model.Doctor
import com.medmarg.patient.ui.components.SearchBarHeader
import com.medmarg.patient.ui.theme.*

@Composable
fun DoctorsScreen(
    onBookDoctor: (Doctor) -> Unit,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    val specialties = listOf("All", "General Physician", "Cardiologist", "Dermatologist", "Pediatrician", "Gynecologist")
    var selectedSpecialty by remember { mutableStateOf("All") }

    val doctors = SampleDataProvider.doctorsList

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        SearchBarHeader(
            query = searchQuery,
            onQueryChange = { searchQuery = it },
            placeholder = "Search doctor by name or specialty (e.g. Diabetologist)..."
        )

        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(specialties) { spec ->
                val isSelected = selectedSpecialty == spec
                FilterChip(
                    selected = isSelected,
                    onClick = { selectedSpecialty = spec },
                    label = {
                        Text(
                            text = spec,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MedTealPrimary,
                        selectedLabelColor = PureWhite,
                        containerColor = PureWhite,
                        labelColor = Slate700
                    ),
                    shape = RoundedCornerShape(20.dp)
                )
            }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 16.dp)
        ) {
            items(doctors) { doctor ->
                DoctorCard(
                    doctor = doctor,
                    onBook = { onBookDoctor(doctor) }
                )
            }

            item {
                Spacer(modifier = Modifier.height(40.dp))
            }
        }
    }
}

@Composable
fun DoctorCard(
    doctor: Doctor,
    onBook: () -> Unit
) {
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
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(54.dp)
                        .clip(CircleShape)
                        .background(MedTealLight),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Doctor",
                        tint = MedTealPrimary,
                        modifier = Modifier.size(32.dp)
                    )
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = doctor.name,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Text(
                        text = doctor.specialty,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MedTealPrimary
                    )
                    Text(
                        text = "${doctor.qualification} • ${doctor.experienceYears} yrs exp",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate500
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Hospital/Clinic: ${doctor.clinicOrHospital}",
                style = MaterialTheme.typography.bodyMedium,
                color = Slate600
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Consultation Fee",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400
                    )
                    Text(
                        text = "₹${doctor.fee}",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                }

                Button(
                    onClick = onBook,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary),
                    contentPadding = PaddingValues(horizontal = 18.dp, vertical = 8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CalendarMonth,
                        contentDescription = "Book Appointment",
                        tint = PureWhite,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Book Clinic Visit",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                }
            }
        }
    }
}
