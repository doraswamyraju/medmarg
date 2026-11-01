import SwiftUI

// =========================================================================
// 🧪 CARE SEEKER TESTS & PACKAGES (MODERN DISCOVERY PORTAL + MATRIX ENGINE)
// Matches reference Image 3: 
// 1. Tests & Packages Header & Subtitle (No duplicate topbar)
// 2. Search Bar with Mic & Magnifying Glass
// 3. Recently Searched / Viewed Biomarkers Chips (CBC, HbA1c, Lipid Profile, etc.)
// 4. Quick 4 Service Hub Cards (Row of 4: Blood Tests, Health Packages, Diagnostic Scans, Popular Tests)
// 5. Test Categories 6x2 Grid (12 items matching Image 3, with More / View All opening all 24 categories)
// 6. 6-Dimension Taxonomy Navigator Bar (Organs, Concerns, Curated, Demographics, Goals, Clinical)
// 7. Popular Health Packages Carousel (Best Seller, Most Booked, Women's Health)
// 8. Featured Tests List with direct [Add] buttons (CBC, HbA1c, LFT, Lipid Profile)
// 9. Floating Search Bar With Ambient Teal Outer Glow (Above bottom nav)
// 10. All 24 Categories Bottom Sheet (from Image 2)
// 11. Full Detailed Catalog Matrix View (accessible via Matrix View toggle)
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
    @State private var addedToastItemName: String? = nil

    // Sample Recently Viewed / Searched Biomarkers
    @State private var recentSearches: [String] = [
        "CBC",
        "HbA1c",
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

            // Main Content Area
            VStack(spacing: 0) {
                if viewMode == "DISCOVERY" && searchQuery.isEmpty {
                    // Modern Multi-Category Discovery Portal (Image 3)
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 20) {
                            
                            // 1. Header Title & Subtitle + View Switcher (No duplicate topbar)
                            discoveryHeaderTitleRow
                                .padding(.horizontal, 16)
                                .padding(.top, 10)

                            // 2. Search Bar with Mic (Image 3)
                            topSearchField
                                .padding(.horizontal, 16)

                            // 3. Recently Searched / Viewed Biomarkers Chips
                            recentlySearchedBar
                                .padding(.horizontal, 16)

                            // 4. Quick 4 Service Hub Cards (Row of 4: Blood Tests, Packages, Scans, Popular)
                            quickServiceHubCards
                                .padding(.horizontal, 16)

                            // 5. Test Categories 6x2 Grid (Image 3 Reference)
                            testCategoriesSection
                                .padding(.horizontal, 16)

                            // 6. 6-Dimension Taxonomy Navigator Bar (Organs, Concerns, Demographics, etc.)
                            taxonomyDimensionPillsRow
                                .padding(.horizontal, 16)

                            // 7. Popular Health Packages Carousel (Image 3)
                            popularPackagesCarouselSection

                            // 8. Featured Tests List (Image 3)
                            featuredTestsSection
                                .padding(.horizontal, 16)

                            // Spacing for floating search bar & bottom navigation
                            Spacer().frame(height: 110)
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
                .padding(.bottom, 12)

            // Added to Cart Toast Notification
            if let toastName = addedToastItemName {
                VStack {
                    Spacer().frame(height: 10)
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.white)
                        Text("\(toastName) added to cart")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(20)
                    .shadow(color: MedMargTheme.primaryTeal.opacity(0.4), radius: 8, x: 0, y: 4)
                    .transition(.move(edge: .top).combined(with: .opacity))
                    Spacer()
                }
                .zIndex(99)
            }
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
                    .font(.system(size: 24, weight: .black, design: .rounded))
                    .foregroundColor(MedMargTheme.slate900)

                Text("Find the right tests for a healthier you")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)
            }

            Spacer()

            // Subtle Toggle to switch to Matrix view
            Button(action: {
                withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                    viewMode = (viewMode == "DISCOVERY") ? "ALL_CATALOG" : "DISCOVERY"
                }
            }) {
                HStack(spacing: 5) {
                    Image(systemName: viewMode == "DISCOVERY" ? "tablecells" : "sparkles")
                        .font(.system(size: 11, weight: .bold))
                    Text(viewMode == "DISCOVERY" ? "Matrix View" : "Discovery")
                        .font(.system(size: 11, weight: .bold))
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(MedMargTheme.lightTeal)
                .foregroundColor(MedMargTheme.darkTeal)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.primaryTeal.opacity(0.3), lineWidth: 1))
            }
        }
    }

    // =========================================================================
    // 🔍 2. TOP SEARCH BAR (IMAGE 3)
    // =========================================================================
    private var topSearchField: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(MedMargTheme.slate400)
                .font(.system(size: 15))

            TextField("Search for tests, packages, scans or health concerns...", text: $searchQuery)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(MedMargTheme.slate900)
                .onSubmit {
                    if !searchQuery.isEmpty {
                        viewMode = "ALL_CATALOG"
                    }
                }

            if !searchQuery.isEmpty {
                Button(action: { searchQuery = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(MedMargTheme.slate400)
                        .font(.system(size: 14))
                }
            }

            Button(action: { showVoiceSearchAlert = true }) {
                Image(systemName: "mic.fill")
                    .foregroundColor(MedMargTheme.slate500)
                    .font(.system(size: 14))
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 2)
    }

    // =========================================================================
    // 🕒 3. RECENTLY SEARCHED / SEEN TESTS ROW (HORIZONTAL CHIPS)
    // =========================================================================
    private var recentlySearchedBar: some View {
        HStack(spacing: 8) {
            Image(systemName: "clock.arrow.circlepath")
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(MedMargTheme.slate400)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    ForEach(recentSearches, id: \.self) { search in
                        Button(action: {
                            searchQuery = search
                            viewMode = "ALL_CATALOG"
                        }) {
                            Text(search)
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(MedMargTheme.slate700)
                                .padding(.horizontal, 9)
                                .padding(.vertical, 5)
                                .background(Color.white)
                                .cornerRadius(12)
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
                        }
                    }
                }
            }
        }
    }

    // =========================================================================
    // 🩸 4. QUICK SERVICE HUB CARDS (ROW OF 4) - IMAGE 3 EXACT
    // =========================================================================
    private var quickServiceHubCards: some View {
        HStack(spacing: 8) {
            quickHubCard(
                title: "Blood Tests",
                subtitle: "500+ Tests",
                icon: "drop.fill",
                iconColor: Color(red: 0.92, green: 0.25, blue: 0.25),
                bgColor: Color(red: 0.99, green: 0.93, blue: 0.93),
                action: {
                    catalogSubTab = "TESTS"
                    viewMode = "ALL_CATALOG"
                }
            )

            quickHubCard(
                title: "Health Packages",
                subtitle: "Curated Packages",
                icon: "heart.fill",
                iconColor: Color(red: 0.05, green: 0.65, blue: 0.55),
                bgColor: Color(red: 0.90, green: 0.98, blue: 0.96),
                action: {
                    catalogSubTab = "PACKAGES"
                    viewMode = "ALL_CATALOG"
                }
            )

            quickHubCard(
                title: "Diagnostic Scans",
                subtitle: "X-Ray, CT, MRI & more",
                icon: "viewfinder",
                iconColor: Color(red: 0.2, green: 0.5, blue: 0.95),
                bgColor: Color(red: 0.92, green: 0.95, blue: 1.0),
                action: {
                    catalogSubTab = "ALL"
                    viewMode = "ALL_CATALOG"
                }
            )

            quickHubCard(
                title: "Popular Tests",
                subtitle: "Most Booked",
                icon: "flask.fill",
                iconColor: Color(red: 0.95, green: 0.55, blue: 0.15),
                bgColor: Color(red: 1.0, green: 0.95, blue: 0.9),
                action: {
                    selectedCategoryId = "CAT_POPULAR"
                    viewMode = "ALL_CATALOG"
                }
            )
        }
    }

    private func quickHubCard(title: String, subtitle: String, icon: String, iconColor: Color, bgColor: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 6) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(bgColor)
                        .frame(width: 44, height: 44)

                    Image(systemName: icon)
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(iconColor)
                }

                Text(title)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineLimit(1)
                    .minimumScaleFactor(0.85)

                Text(subtitle)
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .padding(.horizontal, 4)
            .background(Color.white)
            .cornerRadius(14)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
            .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 2)
        }
    }

    // =========================================================================
    // 🩺 5. TEST CATEGORIES 6x2 GRID (IMAGE 3 REFERENCE)
    // =========================================================================
    private var testCategoriesSection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Test Categories")
                    .font(.system(size: 17, weight: .bold, design: .rounded))
                    .foregroundColor(MedMargTheme.slate900)

                Spacer()

                Button(action: { showAllCategoriesSheet = "ALL" }) {
                    HStack(spacing: 3) {
                        Text("View All")
                            .font(.system(size: 12, weight: .bold))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 10, weight: .bold))
                    }
                    .foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            // 12 Items in a 6 columns x 2 rows layout (Image 3)
            let top12Categories: [(id: String, name: String, count: String, icon: String, color: Color, isMore: Bool)] = [
                ("CAT_DIABETES", "Diabetes", "12 Tests", "drop.fill", Color(red: 0.95, green: 0.35, blue: 0.35), false),
                ("CAT_HEART", "Heart", "28 Tests", "heart.fill", Color(red: 0.92, green: 0.25, blue: 0.3), false),
                ("CAT_LIVER", "Liver", "22 Tests", "flame.fill", Color(red: 0.95, green: 0.55, blue: 0.2), false),
                ("CAT_KIDNEY", "Kidney", "20 Tests", "crosshair", Color(red: 0.95, green: 0.3, blue: 0.35), false),
                ("CAT_THYROID", "Thyroid", "14 Tests", "cross.fill", Color(red: 0.7, green: 0.4, blue: 0.9), false),
                ("CAT_CLIN_HORM", "Hormones", "18 Tests", "circle.hexagongrid.fill", Color(red: 0.15, green: 0.6, blue: 0.95), false),
                ("CAT_ORG_DIGEST", "Gastro", "16 Tests", "drop.fill", Color(red: 0.95, green: 0.65, blue: 0.3), false),
                ("CAT_BONE_JOINT", "Bone & Joint", "14 Tests", "shield.fill", Color(red: 0.25, green: 0.6, blue: 0.95), false),
                ("CAT_FEVER", "Infection", "24 Tests", "allergens", Color(red: 0.1, green: 0.7, blue: 0.55), false),
                ("CAT_CLIN_BIO", "Vitamins", "18 Tests", "pills.fill", Color(red: 0.2, green: 0.55, blue: 0.95), false),
                ("CAT_CANCER", "Cancer Markers", "20 Tests", "bookmark.fill", Color(red: 0.9, green: 0.35, blue: 0.65), false),
                ("MORE", "More", "View All", "ellipsis", MedMargTheme.slate500, true)
            ]

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 6), spacing: 14) {
                ForEach(top12Categories, id: \.id) { cat in
                    Button(action: {
                        if cat.isMore {
                            showAllCategoriesSheet = "ALL"
                        } else {
                            selectedCategoryId = cat.id
                            viewMode = "ALL_CATALOG"
                        }
                    }) {
                        VStack(spacing: 5) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(cat.color.opacity(0.12))
                                    .frame(width: 44, height: 44)

                                Image(systemName: cat.icon)
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(cat.color)
                            }

                            Text(cat.name)
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                                .lineLimit(1)
                                .minimumScaleFactor(0.8)

                            Text(cat.count)
                                .font(.system(size: 8, weight: .medium))
                                .foregroundColor(MedMargTheme.slate500)
                                .lineLimit(1)
                        }
                    }
                }
            }
        }
    }

    // =========================================================================
    // 🧭 6. 6-DIMENSION TAXONOMY PILLS BAR
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
                        if key != "ALL" {
                            showAllCategoriesSheet = key
                        }
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
                        .shadow(color: isSel ? MedMargTheme.darkTeal.opacity(0.15) : Color.clear, radius: 4, x: 0, y: 2)
                    }
                }
            }
        }
    }

    // =========================================================================
    // 🎁 7. POPULAR HEALTH PACKAGES CAROUSEL (IMAGE 3 EXACT)
    // =========================================================================
    private var popularPackagesCarouselSection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Popular Health Packages")
                    .font(.system(size: 17, weight: .bold, design: .rounded))
                    .foregroundColor(MedMargTheme.slate900)

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
                    // Package 1: Full Body Health Checkup (Best Seller)
                    popularPackageCard(
                        tag: "Best Seller",
                        tagColor: MedMargTheme.darkTeal,
                        tagBg: MedMargTheme.emeraldLight,
                        title: "Full Body Health Checkup",
                        testsSummary: "85 Tests | Includes CBC, LFT, KFT, Lipid, Sugar & more",
                        price: 999,
                        mrp: 1500,
                        discount: "33% OFF",
                        imageIcon: "person.3.fill",
                        imageBgColor: Color(red: 0.92, green: 0.97, blue: 0.95),
                        onAdd: {
                            if let pkg = catalogStore.packages.first(where: { $0.name.contains("Full Body") }) ?? catalogStore.packages.first {
                                onAddToCart(pkg)
                                showToast(name: "Full Body Checkup")
                            }
                        }
                    )

                    // Package 2: Diabetes Profile (Most Booked)
                    popularPackageCard(
                        tag: "Most Booked",
                        tagColor: Color(red: 0.0, green: 0.5, blue: 0.45),
                        tagBg: Color(red: 0.88, green: 0.97, blue: 0.95),
                        title: "Diabetes Profile",
                        testsSummary: "12 Tests | HbA1c, Fasting Sugar, Lipid & more",
                        price: 499,
                        mrp: 800,
                        discount: "38% OFF",
                        imageIcon: "cross.vial.fill",
                        imageBgColor: Color(red: 0.93, green: 0.96, blue: 0.98),
                        onAdd: {
                            if let pkg = catalogStore.packages.first(where: { $0.name.contains("Diabetes") }) ?? catalogStore.packages.first {
                                onAddToCart(pkg)
                                showToast(name: "Diabetes Profile")
                            }
                        }
                    )

                    // Package 3: Women's Wellness Package
                    popularPackageCard(
                        tag: "Women's Health",
                        tagColor: Color(red: 0.85, green: 0.25, blue: 0.5),
                        tagBg: Color(red: 0.99, green: 0.91, blue: 0.95),
                        title: "Women's Wellness Package",
                        testsSummary: "52 Tests | Hormones, Vitamins, CBC & more",
                        price: 1299,
                        mrp: 2000,
                        discount: "33% OFF",
                        imageIcon: "heart.fill",
                        imageBgColor: Color(red: 0.99, green: 0.93, blue: 0.96),
                        onAdd: {
                            if let pkg = catalogStore.packages.first(where: { $0.name.contains("Women") }) ?? catalogStore.packages.first {
                                onAddToCart(pkg)
                                showToast(name: "Women's Wellness")
                            }
                        }
                    )
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 2)
            }
        }
    }

    private func popularPackageCard(
        tag: String,
        tagColor: Color,
        tagBg: Color,
        title: String,
        testsSummary: String,
        price: Int,
        mrp: Int,
        discount: String,
        imageIcon: String,
        imageBgColor: Color,
        onAdd: @escaping () -> Void
    ) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            // Top Image/Illustration Container with Tag Badge
            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: 12)
                    .fill(imageBgColor)
                    .frame(height: 90)

                HStack {
                    Spacer()
                    Image(systemName: imageIcon)
                        .font(.system(size: 40))
                        .foregroundColor(tagColor.opacity(0.2))
                        .padding(.trailing, 12)
                        .padding(.top, 16)
                }

                Text(tag)
                    .font(.system(size: 9, weight: .black))
                    .foregroundColor(tagColor)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(tagBg)
                    .cornerRadius(6)
                    .padding(8)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineLimit(1)

                Text(testsSummary)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)
                    .lineLimit(2)
                    .frame(height: 26, alignment: .topLeading)

                HStack(alignment: .lastTextBaseline, spacing: 6) {
                    Text("₹ \(price)")
                        .font(.system(size: 15, weight: .black, design: .rounded))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("₹ \(mrp)")
                        .font(.system(size: 11))
                        .strikethrough()
                        .foregroundColor(MedMargTheme.slate400)

                    Text(discount)
                        .font(.system(size: 9, weight: .black))
                        .foregroundColor(Color(red: 0.05, green: 0.6, blue: 0.35))
                        .padding(.horizontal, 4)
                        .padding(.vertical, 2)
                        .background(MedMargTheme.emeraldLight)
                        .cornerRadius(4)

                    Spacer()

                    Button(action: onAdd) {
                        Text("Add")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(Color.white)
                            .cornerRadius(6)
                            .overlay(RoundedRectangle(cornerRadius: 6).stroke(MedMargTheme.primaryTeal, lineWidth: 1))
                    }
                }
            }
            .padding(.horizontal, 6)
            .padding(.bottom, 6)
        }
        .frame(width: 220)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.03), radius: 4, x: 0, y: 2)
    }

    // =========================================================================
    // 🔬 8. FEATURED TESTS LIST (IMAGE 3 EXACT)
    // =========================================================================
    private var featuredTestsSection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Featured Tests")
                    .font(.system(size: 17, weight: .bold, design: .rounded))
                    .foregroundColor(MedMargTheme.slate900)

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

            let featuredItems: [(name: String, params: String, price: Int, icon: String, iconColor: Color, iconBg: Color)] = [
                ("Complete Blood Count (CBC)", "11 Parameters • Blood Test", 199, "drop.fill", Color.red, Color.red.opacity(0.1)),
                ("HbA1c (Glycated Hemoglobin)", "1 Parameter • Blood Test", 299, "cube.fill", Color.blue, Color.blue.opacity(0.1)),
                ("Liver Function Test (LFT)", "11 Parameters • Blood Test", 399, "flame.fill", Color.orange, Color.orange.opacity(0.1)),
                ("Lipid Profile", "8 Parameters • Blood Test", 399, "drop.fill", Color.purple, Color.purple.opacity(0.1))
            ]

            VStack(spacing: 10) {
                ForEach(featuredItems, id: \.name) { item in
                    HStack(spacing: 12) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(item.iconBg)
                                .frame(width: 40, height: 40)

                            Image(systemName: item.icon)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(item.iconColor)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.name)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                                .lineLimit(1)

                            Text(item.params)
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Text("₹ \(item.price)")
                            .font(.system(size: 14, weight: .black, design: .rounded))
                            .foregroundColor(MedMargTheme.slate900)

                        Button(action: {
                            if let liveItem = catalogStore.tests.first(where: { $0.name.lowercased().contains(item.name.prefix(4).lowercased()) }) ?? catalogStore.tests.first {
                                onAddToCart(liveItem)
                                showToast(name: item.name)
                            }
                        }) {
                            Text("Add")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 6)
                                .background(Color.white)
                                .cornerRadius(8)
                                .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.primaryTeal, lineWidth: 1))
                        }
                    }
                    .padding(12)
                    .background(Color.white)
                    .cornerRadius(14)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
                    .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 2)
                }
            }
        }
    }

    private func showToast(name: String) {
        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
            addedToastItemName = name
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            withAnimation(.easeOut(duration: 0.3)) {
                addedToastItemName = nil
            }
        }
    }

    // =========================================================================
    // ✨ 9. FLOATING SEARCH BAR WITH AMBIENT TEAL OUTER GLOW
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
    // 🗂️ 10. ALL 24 CATEGORIES BOTTOM SHEET (IMAGE 2 GRID REFERENCE)
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

                    // 24 Categories from Image 2
                    let all24MedicalCategories: [(id: String, name: String, icon: String, color: Color, desc: String)] = [
                        ("CAT_HEART", "Heart Health", "heart.fill", Color.red, "Lipid profile, ECG, cardiac risk markers"),
                        ("CAT_DIABETES", "Diabetes", "drop.fill", Color.red, "HbA1c, Fasting & PP glucose"),
                        ("CAT_ORG_LUNGS", "Respiratory", "waveform.path.ecg", Color.pink, "Lungs, asthma, chest, allergy"),
                        ("CAT_ORG_DIGEST", "Digestive Health", "drop.fill", Color.orange, "Stomach, gut, endoscopy, pancreas"),
                        ("CAT_LIVER", "Liver Health", "flame.fill", Color.red, "LFT, Bilirubin, SGOT, SGPT enzymes"),
                        ("CAT_KIDNEY", "Kidney Health", "crosshair", Color.blue, "KFT, Creatinine, BUN, electrolytes"),
                        ("CAT_NEURO", "Neurology", "brain.head.profile", Color.pink, "Brain, nerve conduction, B12"),
                        ("CAT_BONE_JOINT", "Bone & Joint", "shield.fill", Color.blue, "Calcium, Vitamin D3, uric acid, RA"),
                        ("CAT_CLIN_IMM", "Immunity", "shield.checkerboard", Color.blue, "Antibodies, immunoglobulins, viral"),
                        ("CAT_THYROID", "Thyroid", "cross.fill", Color.purple, "TSH, Total & Free T3, T4"),
                        ("CAT_CANCER", "Cancer Screening", "bookmark.fill", Color.purple, "PSA, CEA, CA-125, oncology markers"),
                        ("CAT_CLIN_HORM", "Hormonal Health", "circle.hexagongrid.fill", Color.blue, "PCOS, testosterone, fertility"),
                        ("CAT_WOMEN", "Women's Health", "figure.dress.line.vertical.figure", Color.pink, "Hormones, CBC, iron, wellness"),
                        ("CAT_MEN", "Men's Health", "person.fill", Color.blue, "PSA, vitality, cardiac & lipid"),
                        ("CAT_DEMO_CHILD", "Child Health", "figure.and.child.holdinghands", Color.teal, "Pediatric growth, nutrition, CBC"),
                        ("CAT_SENIOR", "Senior Care", "figure.seated.side.right", Color.purple, "Geriatric vitals, diabetes, arthritis"),
                        ("CAT_SKIN_HAIR", "Skin, Hair & Nails", "sparkles", Color.orange, "Biotin, Zinc, Iron, Vitamin D"),
                        ("CAT_EYE", "Eye Care", "eye.fill", Color.blue, "Diabetic retinopathy, vision labs"),
                        ("CAT_DENTAL", "Dental Health", "mouth.fill", Color.cyan, "Oral infection, calcium, fluoride"),
                        ("CAT_FEVER", "Infectious Diseases", "microscope", Color.teal, "Dengue, Malaria, Typhoid, viral"),
                        ("CAT_CLIN_HEM", "Anemia & Blood Health", "drop.fill", Color.red, "Complete Hemogram, Ferritin, iron"),
                        ("CAT_METABOLISM", "Weight & Metabolism", "scalemass.fill", Color.green, "Lipid, insulin, thyroid, BMI"),
                        ("CAT_MENTAL", "Mental Health", "brain", Color.blue, "Neurotransmitters, cortisol, stress"),
                        ("CAT_ALLERGY", "Allergy & Immunology", "allergens", Color.orange, "Total IgE, dust, food allergen panels")
                    ]

                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 4), spacing: 14) {
                        ForEach(all24MedicalCategories, id: \.id) { cat in
                            Button(action: {
                                selectedCategoryId = cat.id
                                showAllCategoriesSheet = nil
                                viewMode = "ALL_CATALOG"
                            }) {
                                VStack(spacing: 5) {
                                    ZStack {
                                        RoundedRectangle(cornerRadius: 14)
                                            .fill(cat.color.opacity(0.12))
                                            .frame(width: 52, height: 52)

                                        Image(systemName: cat.icon)
                                            .font(.system(size: 20, weight: .bold))
                                            .foregroundColor(cat.color)
                                    }

                                    Text(cat.name)
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundColor(MedMargTheme.slate900)
                                        .multilineTextAlignment(.center)
                                        .lineLimit(2)
                                        .frame(height: 24)

                                    Text(cat.desc)
                                        .font(.system(size: 8, weight: .medium))
                                        .foregroundColor(MedMargTheme.slate500)
                                        .lineLimit(1)
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 16)

                    Spacer().frame(height: 30)
                }
            }
            .navigationTitle("All 24 Health Categories")
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

    // =========================================================================
    // 📊 11. DETAILED MATRIX VIEW (TABULAR WITH LAB PRICING)
    // =========================================================================
    private var catalogMatrixView: some View {
        VStack(spacing: 0) {
            // Header with search & filters
            VStack(spacing: 10) {
                HStack {
                    Button(action: {
                        withAnimation {
                            viewMode = "DISCOVERY"
                            searchQuery = ""
                        }
                    }) {
                        HStack(spacing: 4) {
                            Image(systemName: "chevron.left")
                            Text("Discovery")
                        }
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    }

                    Spacer()

                    Text("All Tests & Packages (\(filteredItems.count))")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Spacer()

                    Button(action: {
                        selectedCategoryId = "ALL"
                        fastingFilter = "ALL"
                        sampleFilter = "ALL"
                        searchQuery = ""
                    }) {
                        Text("Reset")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 10)

                // Sub-tabs (ALL, PACKAGES, PROFILES, TESTS)
                HStack(spacing: 8) {
                    subTabButton(key: "ALL", label: "All Items")
                    subTabButton(key: "PACKAGES", label: "Packages")
                    subTabButton(key: "PROFILES", label: "Profiles")
                    subTabButton(key: "TESTS", label: "Single Tests")
                }
                .padding(.horizontal, 16)
            }
            .padding(.bottom, 8)
            .background(Color.white)
            .shadow(color: Color.black.opacity(0.03), radius: 4, x: 0, y: 2)

            // Scrollable List of Items
            ScrollView(showsIndicators: false) {
                LazyVStack(spacing: 10) {
                    ForEach(filteredItems) { item in
                        matrixItemCard(item: item)
                    }
                    Spacer().frame(height: 90)
                }
                .padding(.horizontal, 16)
                .padding(.top, 12)
            }
        }
    }

    private func subTabButton(key: String, label: String) -> some View {
        let isSel = catalogSubTab == key
        return Button(action: { catalogSubTab = key }) {
            Text(label)
                .font(.system(size: 11, weight: isSel ? .bold : .medium))
                .foregroundColor(isSel ? MedMargTheme.darkTeal : MedMargTheme.slate600)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(isSel ? MedMargTheme.lightTeal : Color.clear)
                .cornerRadius(10)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(isSel ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1))
        }
    }

    private func matrixItemCard(item: CatalogItem) -> some View {
        let isInCart = cartItemIds.contains(item.id) || cartItemIds.contains(item.code)
        let savingsPct = item.mrp > item.price ? Int(round(Double(item.mrp - item.price) / Double(item.mrp) * 100.0)) : 0

        return VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .top, spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(item.isPackage ? MedMargTheme.lightTeal : (item.isProfile ? Color.purple.opacity(0.1) : Color.blue.opacity(0.1)))
                        .frame(width: 40, height: 40)

                    Image(systemName: item.isPackage ? "cube.box.fill" : (item.isProfile ? "rectangle.stack.fill" : "flask.fill"))
                        .font(.system(size: 16))
                        .foregroundColor(item.isPackage ? MedMargTheme.primaryTeal : (item.isProfile ? .purple : .blue))
                }

                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 6) {
                        Text(item.name)
                            .font(.system(size: 13, weight: .bold))
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
                    }
                }

                Spacer()
            }

            Divider()

            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 1) {
                    HStack(alignment: .lastTextBaseline, spacing: 6) {
                        Text("₹\(item.price)")
                            .font(.system(size: 16, weight: .black, design: .rounded))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        if item.mrp > item.price {
                            Text("₹\(item.mrp)")
                                .font(.system(size: 11))
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
                        Text(isInCart ? "Added" : "Add")
                            .font(.system(size: 11, weight: .bold))
                    }
                    .foregroundColor(isInCart ? MedMargTheme.darkTeal : .white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(isInCart ? MedMargTheme.emeraldLight : MedMargTheme.primaryTeal)
                    .cornerRadius(8)
                }
            }
        }
        .padding(12)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 2)
    }
}
