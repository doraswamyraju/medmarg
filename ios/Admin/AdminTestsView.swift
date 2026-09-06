import SwiftUI

struct AdminTestsView: View {
    @ObservedObject var catalogStore: CatalogStore = CatalogStore.shared
    @Binding var showAddTestSheet: Bool
    
    @State private var catalogTab: String = "ALL" // "ALL", "PACKAGES", "PROFILES", "TESTS"
    @State private var searchQuery: String = ""
    @State private var fastingFilter: String = "ALL"
    @State private var sampleFilter: String = "ALL"
    
    var body: some View {
        VStack(spacing: 14) {
            // Header Bar
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Master Diagnostic Catalog")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Single-Lab Unified Architecture • \(catalogStore.tests.count) Tests, \(catalogStore.profiles.count) Profiles, \(catalogStore.packages.count) Packages")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Button(action: {
                    catalogStore.syncWithBackend()
                }) {
                    HStack(spacing: 4) {
                        Image(systemName: "arrow.triangle.2.circlepath")
                            .rotationEffect(.degrees(catalogStore.isLoading ? 360 : 0))
                            .animation(catalogStore.isLoading ? Animation.linear(duration: 1).repeatForever(autoreverses: false) : .default, value: catalogStore.isLoading)
                        Text(catalogStore.isLoading ? "Syncing..." : "Sync")
                    }
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(8)
                }

                Button(action: { showAddTestSheet = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                        Text("Add Item")
                    }
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 7)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(8)
                }
            }

            // Search Bar
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(MedMargTheme.slate500)
                    .font(.system(size: 13))
                TextField("Search by code (e.g. CBC, ALDRR), test name, or sample type...", text: $searchQuery)
                    .font(.system(size: 13))
                if !searchQuery.isEmpty {
                    Button(action: { searchQuery = "" }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(MedMargTheme.slate500)
                            .font(.system(size: 13))
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(MedMargTheme.pureWhite)
            .cornerRadius(10)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))

            // Sub-Tab Switcher
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    adminSubTabPill(tabKey: "ALL", label: "All Items (\(catalogStore.allItems.count))")
                    adminSubTabPill(tabKey: "PACKAGES", label: "✨ Packages (\(catalogStore.packages.count))")
                    adminSubTabPill(tabKey: "PROFILES", label: "🔬 Profiles (\(catalogStore.profiles.count))")
                    adminSubTabPill(tabKey: "TESTS", label: "🧪 Tests (\(catalogStore.tests.count))")
                }
            }

            // Status Banner
            HStack {
                Circle()
                    .fill(catalogStore.isOnlineSynced ? MedMargTheme.accentEmerald : MedMargTheme.amberGold)
                    .frame(width: 6, height: 6)
                Text(catalogStore.lastSyncedText)
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
                Spacer()
            }
            .padding(.horizontal, 4)

            // Items List
            let filteredItems = catalogStore.filterItems(
                tab: catalogTab,
                query: searchQuery,
                fastingFilter: fastingFilter,
                sampleFilter: sampleFilter
            )

            if filteredItems.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "tray")
                        .font(.system(size: 32))
                        .foregroundColor(MedMargTheme.slate500)
                    Text("No items found matching '\(searchQuery)'")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(MedMargTheme.slate700)
                }
                .frame(maxWidth: .infinity)
                .padding(32)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(12)
            } else {
                // Show up to 100 items with smooth scrolling
                ForEach(Array(filteredItems.prefix(80))) { item in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 3) {
                                HStack(spacing: 6) {
                                    Text(item.displayItemType)
                                        .font(.system(size: 9, weight: .black))
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(
                                            item.isPackage ? MedMargTheme.amberLight :
                                            (item.isProfile ? MedMargTheme.lightTeal : MedMargTheme.emeraldLight)
                                        )
                                        .foregroundColor(
                                            item.isPackage ? MedMargTheme.amberGold :
                                            (item.isProfile ? MedMargTheme.darkTeal : MedMargTheme.accentEmerald)
                                        )
                                        .cornerRadius(4)

                                    Text(item.code)
                                        .font(.system(size: 10, weight: .bold))
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(MedMargTheme.slate50)
                                        .foregroundColor(MedMargTheme.slate700)
                                        .cornerRadius(4)
                                        .overlay(RoundedRectangle(cornerRadius: 4).stroke(MedMargTheme.slate200, lineWidth: 1))
                                }

                                Text(item.name)
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)

                                if let desc = item.description, !desc.isEmpty {
                                    Text(desc)
                                        .font(.system(size: 11))
                                        .foregroundColor(MedMargTheme.slate500)
                                        .lineLimit(2)
                                }
                            }

                            Spacer()

                            Button(action: {
                                catalogStore.deleteItem(id: item.id)
                            }) {
                                Image(systemName: "trash")
                                    .foregroundColor(.red.opacity(0.8))
                                    .font(.system(size: 13))
                                    .padding(6)
                                    .background(Color.red.opacity(0.08))
                                    .cornerRadius(6)
                            }
                        }

                        Divider()

                        // Metadata Details
                        HStack(spacing: 12) {
                            HStack(spacing: 4) {
                                Image(systemName: "drop.fill")
                                    .font(.system(size: 10))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                Text(item.displaySample)
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundColor(MedMargTheme.slate700)
                            }

                            HStack(spacing: 4) {
                                Image(systemName: "clock.fill")
                                    .font(.system(size: 10))
                                    .foregroundColor(MedMargTheme.slate500)
                                Text(item.requiresFasting ? "Fasting Required" : "No Fasting")
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundColor(item.requiresFasting ? MedMargTheme.amberGold : MedMargTheme.slate500)
                            }

                            Spacer()

                            VStack(alignment: .trailing, spacing: 1) {
                                HStack(spacing: 4) {
                                    Text("₹\(item.price)")
                                        .font(.system(size: 15, weight: .black))
                                        .foregroundColor(MedMargTheme.primaryTeal)
                                    if item.mrp > item.price {
                                        Text("₹\(item.mrp)")
                                            .font(.system(size: 10))
                                            .foregroundColor(MedMargTheme.slate500)
                                            .strikethrough()
                                    }
                                }
                            }
                        }
                    }
                    .padding(14)
                    .background(MedMargTheme.pureWhite)
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200.opacity(0.6), lineWidth: 1))
                }

                if filteredItems.count > 80 {
                    Text("Showing 80 of \(filteredItems.count) items. Use search to narrow results.")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                        .padding(.vertical, 8)
                }
            }
        }
    }

    private func adminSubTabPill(tabKey: String, label: String) -> some View {
        Button(action: { catalogTab = tabKey }) {
            Text(label)
                .font(.system(size: 12, weight: catalogTab == tabKey ? .bold : .medium))
                .padding(.horizontal, 12)
                .padding(.vertical, 7)
                .background(catalogTab == tabKey ? MedMargTheme.primaryTeal : MedMargTheme.pureWhite)
                .foregroundColor(catalogTab == tabKey ? .white : MedMargTheme.slate700)
                .cornerRadius(16)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(catalogTab == tabKey ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1)
                )
        }
    }
}
