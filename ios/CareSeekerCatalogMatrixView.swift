import SwiftUI

// =========================================================================
// 🧪 CARE SEEKER TESTS & PACKAGES (MODERN DISCOVERY PORTAL + MATRIX ENGINE)
// =========================================================================

struct CareSeekerCatalogMatrixView: View {
    @ObservedObject var catalogStore: CatalogStore
    @Binding var selectedTab: Int
    let onAddToCart: (CatalogItem) -> Void
    let onOpenDetail: (CatalogItem) -> Void
    let cartItemIds: Set<String>

    // View Modes: "DISCOVERY" or "ALL_CATALOG" (Detailed Matrix)
    @State private var viewMode: String = "DISCOVERY" 
    @State private var searchQuery: String = ""
    @State private var catalogSubTab: String = "ALL" // ALL, PACKAGES, PROFILES, TESTS
    @State private var selectedCategoryId: String = "ALL"
    @State private var selectedTaxonomyFilter: String = "ALL" // ALL, ORGAN, CONDITION, DEMOGRAPHIC, GOAL, CLINICAL, CURATED
    @State private var fastingFilter: String = "ALL" // ALL, YES, NO
    @State private var sampleFilter: String = "ALL"  // ALL, SERUM, EDTA, URINE, PLASMA
    @State private var showAllCategoriesSheet: String? = nil // nil or group filter
    @State private var showVoiceSearchAlert: Bool = false

    // Sample Recently Viewed / Searched Biomarkers
    @State private var recentSearches: [String] = [
        "Complete Blood Count (CBC)",
        "HbA1c Diabetes",
        "Lipid Profile",
        "Thyroid TSH",
        "Vitamin D3",
        "Liver Function (LFT)"
    ]

    var filteredItems: [CatalogItem] {
        var items: [CatalogItem] = []
        switch catalogSubTab {
        case "PACKAGES": items = catalogStore.packages
        case "PROFILES": items = catalogStore.profiles
        case "TESTS": items = catalogStore.tests
        default: items = catalogStore.allItems
        }

        return items.filter { item in
            // Category Filter
            if selectedCategoryId != "ALL" {
                let catIds = item.categoryIds ?? []
                if !catIds.contains(selectedCategoryId) {
                    return false
                }
            }

            // Search Query
            if !searchQuery.isEmpty {
                let q = searchQuery.lowercased()
                let nameMatch = item.name.lowercased().contains(q)
                let codeMatch = item.code.lowercased().contains(q)
                let descMatch = item.description?.lowercased().contains(q) ?? false
                let catMatch = item.category?.lowercased().contains(q) ?? false
                let aliasMatch = item.aliasNames?.contains(where: { $0.lowercased().contains(q) }) ?? false
                if !nameMatch && !codeMatch && !descMatch && !catMatch && !aliasMatch { return false }
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
        ZStack(alignment: .bottom) {
            // Background
            MedMargTheme.slate50
                .ignoresSafeArea()

            // Main Content Area (No duplicate topbar; ContentView already renders global TopbarView)
            VStack(spacing: 0) {
                if viewMode == "DISCOVERY" && searchQuery.isEmpty {
                    // Modern Multi-Category Discovery Portal
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 22) {
                            
                            // 1. Header Title & Subtitle + View Switcher
                            discoveryHeaderTitleRow
                                .padding(.horizontal, 16)
                                .padding(.top, 12)

                            // 2. Recently Searched / Viewed Biomarkers
                            recentlySearchedBar
                                .padding(.horizontal, 16)

                            // 3. Quick 4 Service Hub Cards
                            quickServiceHubCards
                                .padding(.horizontal, 16)

                            // 4. 6-Dimension Taxonomy Navigator Bar
                            taxonomyDimensionPillsRow
                                .padding(.horizontal, 16)

                            // 5. Category 1: Body Organs & Systems (ORGAN)
                            if selectedTaxonomyFilter == "ALL" || selectedTaxonomyFilter == "ORGAN" {
                                bodyOrgansSection
                                    .padding(.horizontal, 16)
                            }

                            // 6. Category 2: Health Concerns & Conditions (CONDITION)
                            if selectedTaxonomyFilter == "ALL" || selectedTaxonomyFilter == "CONDITION" {
                                healthConcernsSection
                                    .padding(.horizontal, 16)
                            }

                            // 7. Category 3: Curated Popular Health Packages (CURATED)
                            if selectedTaxonomyFilter == "ALL" || selectedTaxonomyFilter == "CURATED" {
                                popularPackagesCarouselSection
                            }

                            // 8. Category 4: Demographic Collections (DEMOGRAPHIC)
                            if selectedTaxonomyFilter == "ALL" || selectedTaxonomyFilter == "DEMOGRAPHIC" {
                                demographicsSection
                                    .padding(.horizontal, 16)
                            }

                            // 9. Category 5: Health Goals & Intent (GOAL)
                            if selectedTaxonomyFilter == "ALL" || selectedTaxonomyFilter == "GOAL" {
                                healthGoalsSection
                                    .padding(.horizontal, 16)
                            }

                            // 10. Category 6: Clinical Specialties & Featured Biomarkers (CLINICAL)
                            if selectedTaxonomyFilter == "ALL" || selectedTaxonomyFilter == "CLINICAL" {
                                clinicalSpecialtiesAndFeaturedSection
                                    .padding(.horizontal, 16)
                            }

                            // Safe spacing for bottom floating search bar and bottom navigation
                            Spacer().frame(height: 100)
                        }
                    }
                } else {
                    // Detailed Catalog Matrix View (100% Comprehensive with lab comparison)
                    catalogMatrixView
                }
            }

            // Floating Search Bar With Ambient Teal Outer Glow (Above bottom nav)
            floatingGlowSearchBar
                .padding(.horizontal, 16)
                .padding(.bottom, 10)
        }
        .sheet(isPresented: Binding(
            get: { showAllCategoriesSheet != nil },
            set: { if !$0 { showAllCategoriesSheet = nil } }
        )) {
            allCategoriesSheetView
        }
        .alert("Voice Search", isPresented: $showVoiceSearchAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("Listening for tests, packages, or health concerns...")
        }
    }

    // =========================================================================
    // 📝 1. HEADER TITLE & SUBTITLE + VIEW TOGGLE SWITCHER
    // =========================================================================
    private var discoveryHeaderTitleRow: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 3) {
                Text("Tests & Packages")
                    .font(.system(size: 22, weight: .black, design: .rounded))
                    .foregroundColor(MedMargTheme.slate900)

                Text("Find the right tests for a healthier you")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)
            }

            Spacer()

            // Toggle switch between Discovery Portal and Detailed Matrix View
            Button(action: {
                withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                    viewMode = (viewMode == "DISCOVERY") ? "ALL_CATALOG" : "DISCOVERY"
                }
            }) {
                HStack(spacing: 5) {
                    Image(systemName: viewMode == "DISCOVERY" ? "list.bullet.rectangle.portrait" : "sparkles")
                        .font(.system(size: 11, weight: .bold))
                    Text(viewMode == "DISCOVERY" ? "All Matrix" : "Discovery")
                        .font(.system(size: 11, weight: .bold))
                }
                .padding(.horizontal, 11)
                .padding(.vertical, 7)
                .background(MedMargTheme.lightTeal)
                .foregroundColor(MedMargTheme.darkTeal)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.primaryTeal.opacity(0.3), lineWidth: 1))
            }
        }
    }

    // =========================================================================
    // 🕒 2. RECENTLY SEARCHED / SEEN TESTS ROW (HORIZONTAL CHIPS)
    // =========================================================================
    private var recentlySearchedBar: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 4) {
                Image(systemName: "clock.arrow.circlepath")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.slate400)
                Text("RECENTLY SEARCHED / VIEWED")
                    .font(.system(size: 10, weight: .black))
                    .foregroundColor(MedMargTheme.slate500)
                    .tracking(0.5)
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(recentSearches, id: \.self) { search in
                        Button(action: {
                            searchQuery = search
                            viewMode = "ALL_CATALOG"
                        }) {
                            HStack(spacing: 4) {
                                Image(systemName: "magnifyingglass")
                                    .font(.system(size: 10))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                Text(search)
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate800)
                            }
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.white)
                            .cornerRadius(14)
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
                            .shadow(color: Color.black.opacity(0.02), radius: 2, x: 0, y: 1)
                        }
                    }
                }
            }
        }
    }

    // =========================================================================
    // 🩸 3. QUICK SERVICE HUB CARDS (ROW OF 4)
    // =========================================================================
    private var quickServiceHubCards: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
            hubCard(
                title: "Blood Tests",
                subtitle: "500+ Single Tests",
                icon: "drop.fill",
                iconColor: Color.red,
                bgColor: Color.red.opacity(0.08),
                action: {
                    catalogSubTab = "TESTS"
                    viewMode = "ALL_CATALOG"
                }
            )

            hubCard(
                title: "Health Packages",
                subtitle: "Curated Profiles",
                icon: "heart.fill",
                iconColor: MedMargTheme.primaryTeal,
                bgColor: MedMargTheme.lightTeal,
                action: {
                    catalogSubTab = "PACKAGES"
                    viewMode = "ALL_CATALOG"
                }
            )

            hubCard(
                title: "Diagnostic Scans",
                subtitle: "X-Ray, CT, MRI & more",
                icon: "viewfinder",
                iconColor: Color.blue,
                bgColor: Color.blue.opacity(0.08),
                action: {
                    catalogSubTab = "ALL"
                    viewMode = "ALL_CATALOG"
                }
            )

            hubCard(
                title: "Popular Tests",
                subtitle: "Most Booked",
                icon: "flame.fill",
                iconColor: Color.orange,
                bgColor: Color.orange.opacity(0.08),
                action: {
                    selectedCategoryId = "CAT_POPULAR"
                    viewMode = "ALL_CATALOG"
                }
            )
        }
    }

    private func hubCard(title: String, subtitle: String, icon: String, iconColor: Color, bgColor: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(bgColor)
                        .frame(width: 42, height: 42)

                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(iconColor)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text(subtitle)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()
            }
            .padding(10)
            .background(Color.white)
            .cornerRadius(14)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
            .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 2)
        }
    }

    // =========================================================================
    // 🧭 4. 6-DIMENSION TAXONOMY PILLS BAR
    // =========================================================================
    private var taxonomyDimensionPillsRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                let dimensions = [
                    ("ALL", "All Dimensions", "square.grid.2x2.fill"),
                    ("ORGAN", "🫀 Body Organs", "heart.fill"),
                    ("CONDITION", "🩺 Health Concerns", "cross.fill"),
                    ("CURATED", "⭐ Curated Packages", "sparkles"),
                    ("DEMOGRAPHIC", "👥 Demographics", "person.2.fill"),
                    ("GOAL", "🎯 Health Goals", "target"),
                    ("CLINICAL", "🔬 Clinical Specialties", "flask.fill")
                ]

                ForEach(dimensions, id: \.0) { key, label, icon in
                    let isSel = selectedTaxonomyFilter == key
                    Button(action: {
                        withAnimation { selectedTaxonomyFilter = key }
                    }) {
                        HStack(spacing: 4) {
                            Image(systemName: icon)
                                .font(.system(size: 10, weight: .bold))
                            Text(label)
                                .font(.system(size: 11, weight: isSel ? .bold : .semibold))
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(isSel ? MedMargTheme.darkTeal : Color.white)
                        .foregroundColor(isSel ? .white : MedMargTheme.slate700)
                        .cornerRadius(14)
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(isSel ? MedMargTheme.darkTeal : MedMargTheme.slate200, lineWidth: 1))
                        .shadow(color: isSel ? MedMargTheme.darkTeal.opacity(0.2) : Color.clear, radius: 4, x: 0, y: 2)
                    }
                }
            }
        }
    }

    // =========================================================================
    // 🫀 5. CATEGORY 1: BODY ORGANS & SYSTEMS (IMAGE 1 TILES)
    // =========================================================================
    private var bodyOrgansSection: some View {
        VStack(spacing: 12) {
            HStack {
                HStack(spacing: 5) {
                    Text("🫀")
                    Text("Body Organs & Systems")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(MedMargTheme.slate900)
                }

                Spacer()

                Button(action: { showAllCategoriesSheet = "ORGAN" }) {
                    HStack(spacing: 3) {
                        Text("View All")
                            .font(.system(size: 12, weight: .bold))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 10, weight: .bold))
                    }
                    .foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            let organCategories = catalogStore.categories.filter { ($0.group ?? "CONDITION") == "ORGAN" && ($0.active ?? true) }
            let displayOrgans = organCategories.isEmpty ? catalogStore.categories.prefix(8) : organCategories.prefix(8)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 4), spacing: 12) {
                ForEach(displayOrgans) { cat in
                    categoryTileCell(cat: cat)
                }
            }
        }
    }

    // =========================================================================
    // 🩺 6. CATEGORY 2: HEALTH CONCERNS & CONDITIONS
    // =========================================================================
    private var healthConcernsSection: some View {
        VStack(spacing: 12) {
            HStack {
                HStack(spacing: 5) {
                    Text("🩺")
                    Text("Health Concerns & Conditions")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(MedMargTheme.slate900)
                }

                Spacer()

                Button(action: { showAllCategoriesSheet = "CONDITION" }) {
                    HStack(spacing: 3) {
                        Text("View All")
                            .font(.system(size: 12, weight: .bold))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 10, weight: .bold))
                    }
                    .foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            let conditionCategories = catalogStore.categories.filter { ($0.group ?? "CONDITION") == "CONDITION" && ($0.active ?? true) }
            let displayConditions = conditionCategories.isEmpty ? catalogStore.categories.prefix(8) : conditionCategories.prefix(8)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 4), spacing: 12) {
                ForEach(displayConditions) { cat in
                    categoryTileCell(cat: cat)
                }
            }
        }
    }

    private func categoryTileCell(cat: CatalogCategory) -> some View {
        let themeColor = (cat.color != nil && !cat.color!.isEmpty) ? Color(hex: cat.color!) : MedMargTheme.primaryTeal
        let totalItems = cat.totalItems ?? 14

        return Button(action: {
            selectedCategoryId = cat.id
            viewMode = "ALL_CATALOG"
        }) {
            VStack(spacing: 5) {
                ZStack {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(themeColor.opacity(0.12))
                        .frame(width: 52, height: 52)

                    if let imgUrl = cat.imageUrl, !imgUrl.isEmpty,
                       let fullUrl = URL(string: imgUrl.hasPrefix("http") ? imgUrl : "\(catalogStore.backendBaseURL)\(imgUrl)") {
                        AsyncImage(url: fullUrl) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .scaledToFill()
                                    .frame(width: 32, height: 32)
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                            default:
                                Image(systemName: cat.icon ?? "cross.fill")
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundColor(themeColor)
                            }
                        }
                    } else {
                        Image(systemName: cat.icon ?? "cross.fill")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(themeColor)
                    }
                }

                Text(cat.name)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineLimit(1)

                Text("\(totalItems) Tests")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundColor(MedMargTheme.slate500)
            }
        }
    }

    // =========================================================================
    // 🎁 7. CATEGORY 3: POPULAR HEALTH PACKAGES CAROUSEL (IMAGE 2)
    // =========================================================================
    private var popularPackagesCarouselSection: some View {
        VStack(spacing: 12) {
            HStack {
                HStack(spacing: 5) {
                    Text("⭐")
                    Text("Popular Health Packages")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(MedMargTheme.slate900)
                }

                Spacer()

                Button(action: {
                    catalogSubTab = "PACKAGES"
                    viewMode = "ALL_CATALOG"
                }) {
                    HStack(spacing: 3) {
                        Text("View All")
                            .font(.system(size: 12, weight: .bold))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 10, weight: .bold))
                    }
                    .foregroundColor(MedMargTheme.primaryTeal)
                }
            }
            .padding(.horizontal, 16)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 14) {
                    let packages = catalogStore.packages.isEmpty ? catalogStore.allItems.filter { $0.isPackage } : catalogStore.packages

                    ForEach(packages.prefix(5)) { pkg in
                        packageCuratedCard(pkg: pkg)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 2)
            }
        }
    }

    private func packageCuratedCard(pkg: CatalogItem) -> some View {
        let isInCart = cartItemIds.contains(pkg.id) || cartItemIds.contains(pkg.code)
        let savingsPct = pkg.mrp > pkg.price ? Int(round(Double(pkg.mrp - pkg.price) / Double(pkg.mrp) * 100.0)) : 33

        return VStack(alignment: .leading, spacing: 8) {
            // Banner Top Area with Badge
            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: 12)
                    .fill(
                        LinearGradient(
                            colors: [MedMargTheme.lightTeal, Color.white],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(height: 100)

                HStack {
                    Spacer()
                    Image(systemName: "cross.vial.fill")
                        .font(.system(size: 46))
                        .foregroundColor(MedMargTheme.primaryTeal.opacity(0.18))
                        .padding(.trailing, 10)
                        .padding(.top, 14)
                }

                Text(pkg.code == "LIPID" ? "Most Booked" : (pkg.name.contains("Women") ? "Women's Health" : "Best Seller"))
                    .font(.system(size: 10, weight: .black))
                    .foregroundColor(MedMargTheme.darkTeal)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.white.opacity(0.92))
                    .cornerRadius(6)
                    .padding(8)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(pkg.name)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineLimit(1)

                Text(pkg.description ?? "\(pkg.testCount ?? 85) Tests | Full Vital Screening")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)
                    .lineLimit(2)
                    .frame(height: 26, alignment: .topLeading)

                HStack(alignment: .lastTextBaseline, spacing: 6) {
                    Text("₹\(pkg.price)")
                        .font(.system(size: 16, weight: .black, design: .rounded))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    if pkg.mrp > pkg.price {
                        Text("₹\(pkg.mrp)")
                            .font(.system(size: 11))
                            .strikethrough()
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    Text("\(savingsPct)% OFF")
                        .font(.system(size: 9, weight: .black))
                        .foregroundColor(MedMargTheme.darkTeal)
                        .padding(.horizontal, 4)
                        .padding(.vertical, 2)
                        .background(MedMargTheme.emeraldLight)
                        .cornerRadius(4)

                    Spacer()

                    Button(action: { onAddToCart(pkg) }) {
                        HStack(spacing: 3) {
                            Image(systemName: isInCart ? "checkmark" : "plus")
                                .font(.system(size: 10, weight: .bold))
                            Text(isInCart ? "Added" : "Book")
                                .font(.system(size: 11, weight: .bold))
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(isInCart ? MedMargTheme.emeraldLight : MedMargTheme.primaryTeal)
                        .foregroundColor(isInCart ? MedMargTheme.darkTeal : .white)
                        .cornerRadius(8)
                    }
                }
            }
            .padding(.horizontal, 8)
            .padding(.bottom, 8)
        }
        .frame(width: 230)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 3)
    }

    // =========================================================================
    // 👥 8. CATEGORY 4: DEMOGRAPHIC COLLECTIONS (CHILDREN, SENIORS, WOMEN, MEN)
    // =========================================================================
    private var demographicsSection: some View {
        VStack(spacing: 10) {
            HStack {
                HStack(spacing: 5) {
                    Text("👥")
                    Text("By Age & Life Stage")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(MedMargTheme.slate900)
                }

                Spacer()

                Button(action: { showAllCategoriesSheet = "DEMOGRAPHIC" }) {
                    HStack(spacing: 3) {
                        Text("View All")
                            .font(.system(size: 12, weight: .bold))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 10, weight: .bold))
                    }
                    .foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            let demoList = [
                ("CAT_DEMO_CHILD", "Children (0-14 yrs)", "figure.and.child.holdinghands", Color.teal, "Growth & pediatric CBC"),
                ("CAT_DEMO_ADULT", "Adults (18-59 yrs)", "person.fill", Color.blue, "Active vitality & lifestyle"),
                ("CAT_SENIOR", "Senior Citizens (60+)", "figure.seated.side.right", Color.purple, "Geriatric vitals & arthritis"),
                ("CAT_DEMO_PREG", "Pregnancy & Maternity", "heart.fill", Color.pink, "Antenatal & trimesters")
            ]

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                ForEach(demoList, id: \.0) { id, title, icon, color, desc in
                    Button(action: {
                        selectedCategoryId = id
                        viewMode = "ALL_CATALOG"
                    }) {
                        HStack(spacing: 10) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(color.opacity(0.12))
                                    .frame(width: 38, height: 38)
                                Image(systemName: icon)
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundColor(color)
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text(title)
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)
                                    .lineLimit(1)
                                Text(desc)
                                    .font(.system(size: 9, weight: .medium))
                                    .foregroundColor(MedMargTheme.slate500)
                                    .lineLimit(1)
                            }
                            Spacer()
                        }
                        .padding(9)
                        .background(Color.white)
                        .cornerRadius(12)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
                    }
                }
            }
        }
    }

    // =========================================================================
    // 🎯 9. CATEGORY 5: HEALTH GOALS & INTENT (PREVENTIVE, ANNUAL, FITNESS)
    // =========================================================================
    private var healthGoalsSection: some View {
        VStack(spacing: 10) {
            HStack {
                HStack(spacing: 5) {
                    Text("🎯")
                    Text("Health Goals & Intent")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(MedMargTheme.slate900)
                }

                Spacer()

                Button(action: { showAllCategoriesSheet = "GOAL" }) {
                    HStack(spacing: 3) {
                        Text("View All")
                            .font(.system(size: 12, weight: .bold))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 10, weight: .bold))
                    }
                    .foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    goalCard(title: "Preventive Screening", icon: "shield.checkerboard", color: Color.green, subtitle: "Catch risks early")
                    goalCard(title: "Master Annual Checkup", icon: "calendar.badge.clock", color: MedMargTheme.primaryTeal, subtitle: "80+ vital biomarkers")
                    goalCard(title: "Routine Monitoring", icon: "waveform.path.ecg", color: Color.blue, subtitle: "BP & Sugar checks")
                    goalCard(title: "Fitness & Recovery", icon: "flame.fill", color: Color.orange, subtitle: "Protein & vitamins")
                    goalCard(title: "Doctor-Prescribed (Rx)", icon: "stethoscope", color: Color.purple, subtitle: "Fast Rx booking")
                }
            }
        }
    }

    private func goalCard(title: String, icon: String, color: Color, subtitle: String) -> some View {
        Button(action: {
            catalogSubTab = "PACKAGES"
            viewMode = "ALL_CATALOG"
        }) {
            VStack(alignment: .leading, spacing: 6) {
                ZStack {
                    Circle()
                        .fill(color.opacity(0.12))
                        .frame(width: 36, height: 36)
                    Image(systemName: icon)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(color)
                }

                Text(title)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineLimit(1)

                Text(subtitle)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)
                    .lineLimit(1)
            }
            .padding(10)
            .frame(width: 150, alignment: .leading)
            .background(Color.white)
            .cornerRadius(14)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
            .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 2)
        }
    }

    // =========================================================================
    // 🔬 10. CATEGORY 6: CLINICAL SPECIALTIES & FEATURED BIOMARKERS
    // =========================================================================
    private var clinicalSpecialtiesAndFeaturedSection: some View {
        VStack(spacing: 12) {
            HStack {
                HStack(spacing: 5) {
                    Text("🔬")
                    Text("Clinical Specialties & Biomarkers")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(MedMargTheme.slate900)
                }

                Spacer()

                Button(action: {
                    catalogSubTab = "TESTS"
                    viewMode = "ALL_CATALOG"
                }) {
                    HStack(spacing: 3) {
                        Text("View All")
                            .font(.system(size: 12, weight: .bold))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 10, weight: .bold))
                    }
                    .foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            // Clinical Specialties Quick Chips
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    let clinicalDisciplines = [
                        ("CAT_CLIN_HEM", "Hematology"),
                        ("CAT_CLIN_BIO", "Biochemistry"),
                        ("CAT_CLIN_HORM", "Thyroid & Hormones"),
                        ("CAT_CLIN_IMM", "Immunology"),
                        ("CAT_CLIN_MICRO", "Microbiology"),
                        ("CAT_CLIN_MOL", "Molecular RT-PCR")
                    ]

                    ForEach(clinicalDisciplines, id: \.0) { id, name in
                        Button(action: {
                            selectedCategoryId = id
                            viewMode = "ALL_CATALOG"
                        }) {
                            Text(name)
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(MedMargTheme.lightTeal)
                                .cornerRadius(12)
                        }
                    }
                }
            }

            // Featured Tests Rows
            let featuredTests = catalogStore.tests.prefix(4)
            ForEach(featuredTests) { test in
                featuredTestRow(test: test)
            }
        }
    }

    private func featuredTestRow(test: CatalogItem) -> some View {
        let isInCart = cartItemIds.contains(test.id) || cartItemIds.contains(test.code)

        return HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color.red.opacity(0.1))
                    .frame(width: 42, height: 42)

                Image(systemName: "drop.fill")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(Color.red)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(test.name)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineLimit(1)

                Text("\(test.testCount ?? 1) Parameters • Blood Test")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)
            }

            Spacer()

            Text("₹\(test.price)")
                .font(.system(size: 15, weight: .black, design: .rounded))
                .foregroundColor(MedMargTheme.slate900)

            Button(action: { onAddToCart(test) }) {
                Text(isInCart ? "Added" : "Add")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(isInCart ? MedMargTheme.darkTeal : MedMargTheme.primaryTeal)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 6)
                    .background(isInCart ? MedMargTheme.emeraldLight : Color.white)
                    .cornerRadius(8)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(isInCart ? MedMargTheme.accentEmerald : MedMargTheme.primaryTeal, lineWidth: 1))
            }
        }
        .padding(12)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 2)
    }

    // =========================================================================
    // ✨ 11. FLOATING SEARCH BAR WITH AMBIENT TEAL OUTER GLOW
    // =========================================================================
    private var floatingGlowSearchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(MedMargTheme.primaryTeal)
                .font(.system(size: 15, weight: .bold))

            TextField("Search for tests, packages, scans or health concerns...", text: $searchQuery)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(MedMargTheme.slate900)
                .onSubmit {
                    if !searchQuery.isEmpty {
                        viewMode = "ALL_CATALOG"
                    }
                }

            if !searchQuery.isEmpty {
                Button(action: { searchQuery = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(MedMargTheme.slate500)
                        .font(.system(size: 15))
                }
            }

            Button(action: { showVoiceSearchAlert = true }) {
                Image(systemName: "mic.fill")
                    .font(.system(size: 14))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(Color.white.opacity(0.96))
                .shadow(color: MedMargTheme.primaryTeal.opacity(0.35), radius: 12, x: 0, y: 4)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .stroke(
                    LinearGradient(
                        colors: [MedMargTheme.primaryTeal, MedMargTheme.accentEmerald, MedMargTheme.primaryTeal.opacity(0.3)],
                        startPoint: .leading,
                        endPoint: .trailing
                    ),
                    lineWidth: 1.5
                )
        )
    }

    // =========================================================================
    // 📊 12. DETAILED CATALOG MATRIX VIEW (100% PARITY WITH WEB)
    // =========================================================================
    private var catalogMatrixView: some View {
        VStack(spacing: 0) {
            VStack(spacing: 8) {
                HStack {
                    Button(action: {
                        withAnimation { viewMode = "DISCOVERY" }
                    }) {
                        HStack(spacing: 4) {
                            Image(systemName: "arrow.left")
                                .font(.system(size: 11, weight: .bold))
                            Text("Discovery Hub")
                                .font(.system(size: 11, weight: .bold))
                        }
                        .foregroundColor(MedMargTheme.primaryTeal)
                    }

                    Spacer()

                    Text("\(filteredItems.count) Results")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate600)
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)

                // SubTabs (All | Packages | Profiles | Tests)
                subTabsPillsBar

                // Discovery Categories
                discoveryCategoriesRow

                // Fasting & Sample Chips
                filterChipsRow
            }
            .padding(.bottom, 8)
            .background(Color.white)
            .shadow(color: Color.black.opacity(0.04), radius: 4, x: 0, y: 2)

            // Scrollable Matrix Items
            ScrollView(showsIndicators: false) {
                LazyVStack(spacing: 12) {
                    ForEach(filteredItems) { item in
                        matrixItemCard(item: item)
                    }

                    Spacer().frame(height: 100)
                }
                .padding(.horizontal, 16)
                .padding(.top, 10)
            }
        }
    }

    private var subTabsPillsBar: some View {
        HStack(spacing: 8) {
            subTabButton(key: "ALL", label: "All Tests", icon: "square.grid.2x2.fill")
            subTabButton(key: "PACKAGES", label: "Packages", icon: "cube.box.fill")
            subTabButton(key: "PROFILES", label: "Profiles", icon: "rectangle.stack.fill")
            subTabButton(key: "TESTS", label: "Single Tests", icon: "flask.fill")
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
            .padding(.vertical, 7)
            .background(catalogSubTab == key ? MedMargTheme.primaryTeal : Color.white)
            .foregroundColor(catalogSubTab == key ? .white : MedMargTheme.slate700)
            .cornerRadius(10)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(catalogSubTab == key ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1))
        }
    }

    private var discoveryCategoriesRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                categoryPill(
                    id: "ALL",
                    name: "All Categories",
                    icon: "square.grid.2x2.fill",
                    imageUrl: nil,
                    colorHex: nil
                )

                ForEach(catalogStore.categories.filter { $0.active ?? true }) { cat in
                    categoryPill(
                        id: cat.id,
                        name: cat.name,
                        icon: cat.icon ?? "tag.fill",
                        imageUrl: cat.imageUrl,
                        colorHex: cat.color
                    )
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 2)
        }
    }

    private func categoryPill(id: String, name: String, icon: String, imageUrl: String? = nil, colorHex: String? = nil) -> some View {
        let isSel = selectedCategoryId == id
        let themeColor = (colorHex != nil && !colorHex!.isEmpty) ? Color(hex: colorHex!) : MedMargTheme.primaryTeal

        return Button(action: { selectedCategoryId = id }) {
            HStack(spacing: 6) {
                if let imgUrl = imageUrl, !imgUrl.isEmpty,
                   let fullUrl = URL(string: imgUrl.hasPrefix("http") ? imgUrl : "\(catalogStore.backendBaseURL)\(imgUrl)") {
                    AsyncImage(url: fullUrl) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFill()
                                .frame(width: 14, height: 14)
                                .clipShape(Circle())
                        default:
                            Image(systemName: icon)
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(isSel ? .white : themeColor)
                        }
                    }
                } else {
                    Image(systemName: icon)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(isSel ? .white : themeColor)
                }

                Text(name)
                    .font(.system(size: 11, weight: isSel ? .bold : .semibold))
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(isSel ? themeColor : Color.white)
            .foregroundColor(isSel ? .white : MedMargTheme.slate700)
            .cornerRadius(18)
            .overlay(
                RoundedRectangle(cornerRadius: 18)
                    .stroke(isSel ? themeColor : MedMargTheme.slate200, lineWidth: 1)
            )
        }
    }

    private var filterChipsRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                fastingChip(key: "ALL", label: "All Fasting")
                fastingChip(key: "YES", label: "⏳ 10-12h Fasting")
                fastingChip(key: "NO", label: "⚡ Non-Fasting")

                Divider().frame(height: 20)

                sampleChip(key: "ALL", label: "All Samples")
                sampleChip(key: "SERUM", label: "🟡 Serum (SST)")
                sampleChip(key: "EDTA", label: "🟣 EDTA")
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

    private func matrixItemCard(item: CatalogItem) -> some View {
        let isInCart = cartItemIds.contains(item.id) || cartItemIds.contains(item.code)
        let savingsPct = item.mrp > item.price ? Int(round(Double(item.mrp - item.price) / Double(item.mrp) * 100.0)) : 0

        return VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top, spacing: 12) {
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

                Button(action: { onOpenDetail(item) }) {
                    Text("View Details")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                }

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

    // =========================================================================
    // 🗂️ 13. ALL 24 CATEGORIES BOTTOM SHEET (IMAGE 1 GRID)
    // =========================================================================
    private var allCategoriesSheetView: some View {
        NavigationView {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    Text("Browse diagnostic tests, profiles & health packages across 24 anatomical organs, clinical specialties & demographic collections.")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(MedMargTheme.slate600)
                        .multilineTextAlignment(.leading)
                        .padding(.horizontal, 16)
                        .padding(.top, 8)

                    let targetGroup = showAllCategoriesSheet ?? "ALL"
                    let list = catalogStore.categories.filter { cat in
                        if targetGroup != "ALL" {
                            return (cat.group ?? "CONDITION") == targetGroup && (cat.active ?? true)
                        }
                        return cat.active ?? true
                    }

                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 4), spacing: 16) {
                        ForEach(list) { cat in
                            categoryTileCell(cat: cat)
                        }
                    }
                    .padding(.horizontal, 16)

                    Spacer().frame(height: 30)
                }
            }
            .navigationTitle("All Health Categories")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        showAllCategoriesSheet = nil
                    }
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                }
            }
        }
    }
}
