package com.medmarg.patient.viewmodel

import androidx.lifecycle.ViewModel
import com.medmarg.patient.data.SampleDataProvider
import com.medmarg.patient.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

enum class LabSortOption { RELEVANCE, PRICE_LOW_TO_HIGH, FASTEST_TAT, HIGHEST_RATING, DISTANCE }

data class DiagnosticsUiState(
    val searchQuery: String = "",
    val selectedCategory: String = "All",
    val selectedFilterIndex: Int = 0,
    val sortOption: LabSortOption = LabSortOption.RELEVANCE,
    val tests: List<DiagnosticTest> = SampleDataProvider.popularTests
)

class DiagnosticsViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(DiagnosticsUiState())
    val uiState: StateFlow<DiagnosticsUiState> = _uiState.asStateFlow()

    fun updateSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
        applyFilters()
    }

    fun selectCategory(category: String) {
        _uiState.update { it.copy(selectedCategory = category) }
        applyFilters()
    }

    fun selectFilter(index: Int) {
        _uiState.update { it.copy(selectedFilterIndex = index) }
        applyFilters()
    }

    fun setSortOption(sortOption: LabSortOption) {
        _uiState.update { it.copy(sortOption = sortOption) }
        applyFilters()
    }

    private fun applyFilters() {
        val currentState = _uiState.value
        val all = SampleDataProvider.popularTests

        val filtered = all.filter { test ->
            val matchesCategory = currentState.selectedCategory == "All" || test.category == currentState.selectedCategory
            val matchesQuery = currentState.searchQuery.isEmpty() ||
                    test.name.contains(currentState.searchQuery, ignoreCase = true) ||
                    test.category.contains(currentState.searchQuery, ignoreCase = true)
            matchesCategory && matchesQuery
        }.map { test ->
            // Sort labs inside each test based on sort option
            val sortedLabs = when (currentState.sortOption) {
                LabSortOption.PRICE_LOW_TO_HIGH -> test.labPricings.sortedBy { it.discountedPrice }
                LabSortOption.FASTEST_TAT -> test.labPricings.sortedBy { it.tatHours }
                LabSortOption.HIGHEST_RATING -> test.labPricings.sortedByDescending { it.rating }
                LabSortOption.DISTANCE -> test.labPricings.sortedBy { it.distanceKm }
                LabSortOption.RELEVANCE -> test.labPricings
            }

            // Filter labs based on quick filter index
            val filteredLabs = when (currentState.selectedFilterIndex) {
                1 -> sortedLabs.filter { it.isNabl } // NABL only
                2 -> sortedLabs.filter { it.homeCollectionAvailable && it.homeCollectionFee == 0 } // Free Home Collection
                3 -> sortedLabs.filter { it.tatHours <= 6 } // Fast TAT
                4 -> sortedLabs.sortedBy { it.discountedPrice } // Lowest Price
                else -> sortedLabs
            }

            test.copy(labPricings = filteredLabs)
        }.filter { it.labPricings.isNotEmpty() }

        _uiState.update { it.copy(tests = filtered) }
    }
}
