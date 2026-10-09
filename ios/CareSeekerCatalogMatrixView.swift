import SwiftUI

// =========================================================================
// 🧪 CARE SEEKER CATALOG MATRIX VIEW (100% PARITY WITH WEB)
// =========================================================================

struct CareSeekerCatalogMatrixView: View {
    @ObservedObject var catalogStore: CatalogStore
    @Binding var selectedTab: Int
    let onAddToCart: (CatalogItem) -> Void
    let onOpenDetail: (CatalogItem) -> Void
    let cartItemIds: Set<String>

    @State private var searchQuery: String = ""
    @State private var catalogSubTab: String = "ALL" // ALL, PACKAGES, PROFILES, TESTS
    @State private var fastingFilter: String = "ALL" // ALL, YES, NO
    @State private var sampleFilter: String = "ALL"  // ALL, SERUM, EDTA, URINE, PLASMA
    @State private var selectedLabFilter: String = "ALL"

    var filteredItems: [CatalogItem] {
        var items: [CatalogItem] = []
        switch catalogSubTab {
        case "PACKAGES": items = catalogStore.packages
        case "PROFILES": items = catalogStore.profiles
        case "TESTS": items = catalogStore.tests
        default: items = catalogStore.allItems
        }

        return items.filter { item in
            // Search Query
            if !searchQuery.isEmpty {
                let q = searchQuery.lowercased()
                let nameMatch = item.name.lowercased().contains(q)
                let codeMatch = item.code.lowercased().contains(q)
                let descMatch = item.description?.lowercased().contains(q) ?? false
                let catMatch = item.category?.lowercased().contains(q) ?? false
                if !nameMatch && !codeMatch && !descMatch && !catMatch { return false }
            }

            // Fasting Filter
            if fastingFilter != "ALL" {
                let itemFasting = item.fasting?.uppercased() ?? "NO"
                if itemFasting != fastingFilter { return false }
            }

            // Sample Filter
            if sampleFilter != "ALL" {
                let sampleStr = (item.sampleType ?? "") + " " + (item.sampleTypes?.joined(separator: " ") ?? "")
                if !sampleStr.uppercased().contains(sampleFilter) { return false }
            }

            return true
        }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                
                // 1. Search & Filter Bar
                searchAndFiltersSection

                // 2. Sub-Tabs Pills (ALL, PACKAGES, PROFILES, TESTS)
                subTabsPillsBar

                // 3. Fasting & Specimen Chips Row
                filterChipsRow

                // 4. Count & Summary
                HStack {
                    Text("\(filteredItems.count) Diagnostic Tests & Packages Available")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate500)
                    Spacer()
                    Text("Starts From Pricing")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
                .padding(.horizontal, 16)

                // 5. Diagnostic Test Matrix Cards
                LazyVStack(spacing: 12) {
                    ForEach(filteredItems) { item in
                        matrixItemCard(item: item)
                    }
                }
                .padding(.horizontal, 16)

                Spacer().frame(height: 80)
            }
            .padding(.top, 12)
        }
        .background(MedMargTheme.slate50)
    }

    // ==========================================
    // 🔍 1. SEARCH & FILTERS SECTION
    // ==========================================
    private var searchAndFiltersSection: some View {
        VStack(spacing: 10) {
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(MedMargTheme.primaryTeal)
                TextField("Search from 913+ tests (e.g. Thyroid, CBC, HbA1c, Vitamin D, Lipid, Liver)...", text: $searchQuery)
                    .font(.system(size: 13))
                if !searchQuery.isEmpty {
                    Button(action: { searchQuery = "" }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }
            }
            .padding(12)
            .background(Color.white)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
        }
        .padding(.horizontal, 16)
    }

    // ==========================================
    // 🔀 2. SUB-TABS PILLS BAR
    // ==========================================
    private var subTabsPillsBar: some View {
        HStack(spacing: 6) {
            subTabButton(key: "ALL", label: "All Tests (\(catalogStore.allItems.count))", icon: "square.grid.2x2.fill")
            subTabButton(key: "PACKAGES", label: "Full Body (\(catalogStore.packages.count))", icon: "cube.box.fill")
            subTabButton(key: "PROFILES", label: "Profiles (\(catalogStore.profiles.count))", icon: "rectangle.stack.fill")
            subTabButton(key: "TESTS", label: "Single Tests (\(catalogStore.tests.count))", icon: "flask.fill")
        }
        .padding(.horizontal, 16)
    }

    private func subTabButton(key: String, label: String, icon: String) -> some View {
        Button(action: { catalogSubTab = key }) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 11))
                Text(label)
                    .font(.system(size: 11, weight: .bold))
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .background(catalogSubTab == key ? MedMargTheme.primaryTeal : Color.white)
            .foregroundColor(catalogSubTab == key ? .white : MedMargTheme.slate700)
            .cornerRadius(10)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(catalogSubTab == key ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1))
        }
    }

    // ==========================================
    // 🏷️ 3. FILTER CHIPS ROW
    // ==========================================
    private var filterChipsRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                // Fasting Filters
                fastingChip(key: "ALL", label: "All Fasting")
                fastingChip(key: "YES", label: "⏳ 10-12h Fasting")
                fastingChip(key: "NO", label: "⚡ Non-Fasting")

                Divider().frame(height: 20)

                // Specimen Filters
                sampleChip(key: "ALL", label: "All Samples")
                sampleChip(key: "SERUM", label: "🟡 Serum (SST)")
                sampleChip(key: "EDTA", label: "🟣 EDTA (Whole Blood)")
                sampleChip(key: "URINE", label: "🧪 Urine")
            }
            .padding(.horizontal, 16)
        }
    }

    private func fastingChip(key: String, label: String) -> some View {
        Button(action: { fastingFilter = key }) {
            Text(label)
                .font(.system(size: 10, weight: .bold))
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(fastingFilter == key ? MedMargTheme.amberGold : Color.white)
                .foregroundColor(fastingFilter == key ? MedMargTheme.slate900 : MedMargTheme.slate700)
                .cornerRadius(8)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(fastingFilter == key ? MedMargTheme.amberGold : MedMargTheme.slate200, lineWidth: 1))
        }
    }

    private func sampleChip(key: String, label: String) -> some View {
        Button(action: { sampleFilter = key }) {
            Text(label)
                .font(.system(size: 10, weight: .bold))
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(sampleFilter == key ? MedMargTheme.darkTeal : Color.white)
                .foregroundColor(sampleFilter == key ? .white : MedMargTheme.slate700)
                .cornerRadius(8)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(sampleFilter == key ? MedMargTheme.darkTeal : MedMargTheme.slate200, lineWidth: 1))
        }
    }

    // ==========================================
    // 🧪 4. MATRIX ITEM CARD (PARITY WITH WEB)
    // ==========================================
    private func matrixItemCard(item: CatalogItem) -> some View {
        let isInCart = cartItemIds.contains(item.id) || cartItemIds.contains(item.code)
        let savingsPct = item.mrp > item.price ? Int(round(Double(item.mrp - item.price) / Double(item.mrp) * 100.0)) : 0

        return VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top, spacing: 12) {
                // Item Type Icon Badge
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(item.isPackage ? MedMargTheme.lightTeal : (item.isProfile ? Color.purple.opacity(0.1) : Color.blue.opacity(0.1)))
                        .frame(width: 44, height: 44)

                    Image(systemName: item.isPackage ? "cube.box.fill" : (item.isProfile ? "rectangle.stack.fill" : "flask.fill"))
                        .font(.system(size: 18))
                        .foregroundColor(item.isPackage ? MedMargTheme.primaryTeal : (item.isProfile ? .purple : .blue))
                }

                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 6) {
                        Text(item.name)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                            .lineLimit(2)

                        if savingsPct > 0 {
                            Text("\(savingsPct)% OFF")
                                .font(.system(size: 9, weight: .black))
                                .padding(.horizontal, 5)
                                .padding(.vertical, 2)
                                .background(MedMargTheme.emeraldLight)
                                .foregroundColor(MedMargTheme.darkTeal)
                                .cornerRadius(4)
                        }
                    }

                    // Metadata Pill Row (Specimen, Fasting, TAT)
                    HStack(spacing: 6) {
                        if let specimen = item.sampleType ?? item.sampleTypes?.joined(separator: ", ") {
                            Text(specimen)
                                .font(.system(size: 10, weight: .semibold))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(MedMargTheme.slate50)
                                .foregroundColor(MedMargTheme.slate700)
                                .cornerRadius(4)
                        }

                        let isFasting = item.fasting?.uppercased() == "YES"
                        Text(isFasting ? "⏳ 10-12h Fasting" : "⚡ Non-Fasting")
                            .font(.system(size: 10, weight: .semibold))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(isFasting ? MedMargTheme.amberLight : MedMargTheme.slate50)
                            .foregroundColor(isFasting ? Color(red: 0.7, green: 0.4, blue: 0.0) : MedMargTheme.slate700)
                            .cornerRadius(4)

                        Text("⏱️ \(item.tatHours ?? 24)h TAT")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }

                Spacer()
            }

            if let desc = item.description, !desc.isEmpty {
                Text(desc)
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
                    .lineLimit(2)
            }

            Divider()

            // Pricing & Add Button Row
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 1) {
                    Text("Starts From")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(MedMargTheme.slate500)

                    HStack(alignment: .lastTextBaseline, spacing: 6) {
                        Text("₹\(item.price)")
                            .font(.system(size: 18, weight: .black, design: .rounded))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        if item.mrp > item.price {
                            Text("₹\(item.mrp)")
                                .font(.system(size: 12))
                                .strikethrough()
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }
                }

                Spacer()

                // Detail Sheet Trigger
                Button(action: { onOpenDetail(item) }) {
                    Text("View Details")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                }

                // Add to Cart Button
                Button(action: { onAddToCart(item) }) {
                    HStack(spacing: 4) {
                        Image(systemName: isInCart ? "checkmark" : "plus")
                            .font(.system(size: 11, weight: .bold))
                        Text(isInCart ? "Added" : "+ Add")
                            .font(.system(size: 12, weight: .bold))
                    }
                    .foregroundColor(isInCart ? MedMargTheme.darkTeal : .white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(isInCart ? MedMargTheme.emeraldLight : MedMargTheme.primaryTeal)
                    .cornerRadius(10)
                    .shadow(color: isInCart ? Color.clear : MedMargTheme.primaryTeal.opacity(0.3), radius: 4, x: 0, y: 2)
                }
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(isInCart ? MedMargTheme.accentEmerald : MedMargTheme.slate200, lineWidth: isInCart ? 1.5 : 1))
        .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 3)
    }
}
