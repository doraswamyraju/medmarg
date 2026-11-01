import SwiftUI

// =========================================================================
// 🏠 CARE SEEKER HOME VIEW (REDESIGNED MATCHING REFERENCE)
// Scenic Tirupati Hero, Search Bar, Quick Categories, Family Banner,
// Segmented Packages Carousel, Common Tests, and Health Profiles
// =========================================================================

struct CareSeekerHomeView: View {
    @Binding var selectedTab: Int
    var user: UserProfile? = nil
    var currentCity: String = "Tirupati"
    @ObservedObject var healthKit = HealthKitManager.shared
    let onAddToCart: (CatalogItem) -> Void
    let onOpenPrescriptionModal: () -> Void
    let onOpenAddressModal: () -> Void
    let onOpenDetail: (CatalogItem) -> Void

    @State private var activeLiveOrder: LiveOrderModel? = nil
    @State private var packageTab: String = "POPULAR" // "POPULAR", "RECOMMENDED", "PROFILES"
    @State private var addedToast: String? = nil

    private var greetingText: String {
        let hour = Calendar.current.component(.hour, from: Date())
        if hour < 12 { return "Good Morning," }
        if hour < 17 { return "Good Afternoon," }
        return "Good Evening,"
    }

    private var displayName: String {
        if let name = user?.name, !name.isEmpty {
            return name
        }
        return "Ravi Kumar"
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {

                // 1. Scenic City Hero Header (Tirupati Skyline, Greeting, Embedded Search)
                scenicCityHeroSection

                // 2. Active Order Banner (If user has live phlebotomist enroute)
                if let ord = activeLiveOrder, ord.status != "COMPLETED" {
                    activeDispatchQuickBanner(order: ord)
                        .padding(.horizontal, 16)
                }

                // 3. Quick Health Categories Row (6 Square Tiles)
                quickCategoriesRow
                    .padding(.horizontal, 16)

                // 4. Hero Family Promotion Banner ("Prevent Today for a Healthier Tomorrow")
                heroFamilyPromoBanner
                    .padding(.horizontal, 16)

                // 5. Segmented Packages Section (Popular Packages | Recommended | Health Profiles)
                segmentedPackagesSection

                // 6. Common Tests (Horizontal Scroll with Direct [Add])
                commonTestsSection

                // 7. Health Profiles (Men, Women, Senior)
                healthProfilesSection
                    .padding(.horizontal, 16)

                Spacer().frame(height: 70)
            }
            .padding(.bottom, 20)
        }
        .background(MedMargTheme.slate50)
        .overlay(alignment: .bottom) {
            if let toast = addedToast {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.white)
                    Text(toast)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.white)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(Color(red: 0.02, green: 0.58, blue: 0.41))
                .cornerRadius(20)
                .shadow(color: Color.black.opacity(0.15), radius: 8, x: 0, y: 4)
                .padding(.bottom, 80)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .onAppear {
            checkActiveOrder()
        }
    }

    // =========================================================================
    // 🌄 1. SCENIC CITY HERO HEADER (TIRUPATI TEMPLE, GREETING, SEARCH BAR)
    // =========================================================================
    private var scenicCityHeroSection: some View {
        ZStack(alignment: .bottom) {
            // Scenic Background with subtle Temple Gopuram & Mountain Silhouette
            ZStack {
                LinearGradient(
                    colors: [
                        Color(red: 0.82, green: 0.93, blue: 0.98),
                        Color(red: 0.90, green: 0.96, blue: 0.95),
                        Color.white
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )

                // Artistic Temple Gopuram & Hills graphic in top right
                HStack {
                    Spacer()
                    VStack(alignment: .trailing, spacing: 0) {
                        ZStack(alignment: .bottomTrailing) {
                            // Mountain range backdrop
                            Image(systemName: "mountain.2.fill")
                                .font(.system(size: 110))
                                .foregroundColor(Color(red: 0.40, green: 0.65, blue: 0.75).opacity(0.20))
                                .offset(x: 10, y: 10)

                            // Temple Gopuram Tower Silhouette
                            VStack(spacing: 2) {
                                Image(systemName: "triangle.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(Color(red: 0.70, green: 0.55, blue: 0.25).opacity(0.45))
                                Rectangle()
                                    .fill(Color(red: 0.70, green: 0.55, blue: 0.25).opacity(0.35))
                                    .frame(width: 28, height: 16)
                                Rectangle()
                                    .fill(Color(red: 0.70, green: 0.55, blue: 0.25).opacity(0.35))
                                    .frame(width: 36, height: 18)
                                Rectangle()
                                    .fill(Color(red: 0.70, green: 0.55, blue: 0.25).opacity(0.35))
                                    .frame(width: 44, height: 20)
                                Rectangle()
                                    .fill(Color(red: 0.70, green: 0.55, blue: 0.25).opacity(0.35))
                                    .frame(width: 52, height: 24)
                            }
                            .offset(x: -16, y: -4)
                        }
                    }
                }
                .padding(.trailing, 4)
            }
            .frame(height: 195)

            // Content Overlay (Greeting + Search Bar)
            VStack(alignment: .leading, spacing: 14) {
                // Greeting & Location
                VStack(alignment: .leading, spacing: 2) {
                    Text(greetingText)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(MedMargTheme.slate600)

                    Text(displayName)
                        .font(.system(size: 24, weight: .black, design: .rounded))
                        .foregroundColor(MedMargTheme.slate900)

                    HStack(spacing: 4) {
                        Text("Your health partner in")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(MedMargTheme.slate600)
                        Text(currentCity)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }
                .padding(.horizontal, 16)

                // Embedded Search Bar
                Button(action: {
                    selectedTab = 1
                }) {
                    HStack(spacing: 10) {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(MedMargTheme.slate400)
                            .font(.system(size: 16, weight: .bold))

                        Text("Search for tests, packages or health concerns...")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(MedMargTheme.slate500)
                            .lineLimit(1)

                        Spacer()

                        Image(systemName: "slider.horizontal.3")
                            .foregroundColor(MedMargTheme.slate600)
                            .font(.system(size: 16, weight: .semibold))
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 12)
                    .background(Color.white)
                    .cornerRadius(24)
                    .overlay(RoundedRectangle(cornerRadius: 24).stroke(MedMargTheme.slate200, lineWidth: 1))
                    .shadow(color: Color.black.opacity(0.06), radius: 8, x: 0, y: 3)
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 6)
            }
        }
    }

    // =========================================================================
    // 🏷️ 2. ACTIVE LIVE ORDER QUICK BANNER
    // =========================================================================
    private func activeDispatchQuickBanner(order: LiveOrderModel) -> some View {
        let isEnroute = order.status.uppercased() == "ENROUTE" || order.status.uppercased() == "EN_ROUTE"
        let title = isEnroute ? "Phlebotomist Enroute" : "Order Scheduled"
        let badge = isEnroute ? "LIVE" : "CONFIRMED"
        let badgeColor = isEnroute ? Color.red : MedMargTheme.primaryTeal

        return Button(action: { selectedTab = 7 }) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.amberGold.opacity(0.2))
                        .frame(width: 40, height: 40)
                    Image(systemName: isEnroute ? "location.fill.viewfinder" : "calendar.badge.clock")
                        .foregroundColor(MedMargTheme.amberGold)
                        .font(.system(size: 18))
                }

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text(title)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text(badge)
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(.white)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 1)
                            .background(badgeColor)
                            .cornerRadius(3)
                    }

                    Text("Order #\(order.id) • OTP: \(order.handoverOtp) • \(order.slot)")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
            .padding(12)
            .background(Color.white)
            .cornerRadius(14)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.amberGold.opacity(0.5), lineWidth: 1.5))
        }
    }

    // =========================================================================
    // 🔲 3. QUICK HEALTH CATEGORIES ROW (6 SQUARE TILES)
    // =========================================================================
    private var quickCategoriesRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                // 1. Full Body Checkup
                quickCategoryTile(
                    title: "Full Body\nCheckup",
                    icon: "person.fill",
                    iconColor: Color.blue,
                    bgColor: Color(red: 0.90, green: 0.95, blue: 1.0),
                    action: { selectedTab = 1 }
                )

                // 2. Diabetes
                quickCategoryTile(
                    title: "Diabetes\nCare",
                    icon: "drop.fill",
                    iconColor: Color.red,
                    bgColor: Color(red: 0.99, green: 0.92, blue: 0.92),
                    action: { selectedTab = 1 }
                )

                // 3. Heart Health
                quickCategoryTile(
                    title: "Heart\nHealth",
                    icon: "heart.fill",
                    iconColor: Color(red: 0.90, green: 0.20, blue: 0.30),
                    bgColor: Color(red: 1.0, green: 0.92, blue: 0.94),
                    action: { selectedTab = 1 }
                )

                // 4. Women's Health
                quickCategoryTile(
                    title: "Women's\nHealth",
                    icon: "figure.dress.line.vertical.figure",
                    iconColor: Color(red: 0.85, green: 0.25, blue: 0.60),
                    bgColor: Color(red: 0.99, green: 0.91, blue: 0.96),
                    action: { selectedTab = 1 }
                )

                // 5. Senior Care
                quickCategoryTile(
                    title: "Senior\nCare",
                    icon: "figure.seated.side.right",
                    iconColor: Color(red: 0.50, green: 0.35, blue: 0.80),
                    bgColor: Color(red: 0.95, green: 0.92, blue: 0.99),
                    action: { selectedTab = 1 }
                )

                // 6. View All
                quickCategoryTile(
                    title: "View\nAll",
                    icon: "square.grid.2x2.fill",
                    iconColor: Color(red: 0.05, green: 0.65, blue: 0.45),
                    bgColor: Color(red: 0.90, green: 0.98, blue: 0.94),
                    action: { selectedTab = 1 }
                )
            }
            .padding(.vertical, 2)
        }
    }

    private func quickCategoryTile(title: String, icon: String, iconColor: Color, bgColor: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 8) {
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(bgColor)
                        .frame(width: 56, height: 56)

                    Image(systemName: icon)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(iconColor)
                }

                Text(title)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .frame(width: 66, height: 28, alignment: .top)
            }
            .padding(.vertical, 6)
        }
    }

    // =========================================================================
    // 👨‍👩‍👧 4. HERO FAMILY PROMOTION BANNER ("PREVENT TODAY FOR HEALTHIER TOMORROW")
    // =========================================================================
    private var heroFamilyPromoBanner: some View {
        ZStack {
            // Soft Light Cyan & Mint Gradient
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: [
                            Color(red: 0.88, green: 0.97, blue: 0.98),
                            Color(red: 0.92, green: 0.98, blue: 0.94)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            HStack(alignment: .center, spacing: 12) {
                // Left Column: Headline, subtext, CTA button
                VStack(alignment: .leading, spacing: 6) {
                    VStack(alignment: .leading, spacing: 0) {
                        Text("Prevent Today")
                            .font(.system(size: 17, weight: .black, design: .rounded))
                            .foregroundColor(MedMargTheme.slate900)

                        HStack(spacing: 4) {
                            Text("for a")
                                .font(.system(size: 16, weight: .bold, design: .rounded))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Healthier Tomorrow")
                                .font(.system(size: 16, weight: .black, design: .rounded))
                                .foregroundColor(Color(red: 0.05, green: 0.65, blue: 0.45))
                        }
                    }

                    Text("Trusted diagnostic packages with home sample collection.")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(MedMargTheme.slate600)
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)

                    Button(action: {
                        selectedTab = 1
                    }) {
                        HStack(spacing: 4) {
                            Text("Explore Packages")
                                .font(.system(size: 12, weight: .bold))
                            Image(systemName: "arrow.right")
                                .font(.system(size: 10, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(Color(red: 0.02, green: 0.52, blue: 0.96))
                        .cornerRadius(20)
                        .shadow(color: Color(red: 0.02, green: 0.52, blue: 0.96).opacity(0.3), radius: 6, x: 0, y: 3)
                    }
                    .padding(.top, 4)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                // Center: Family Graphic
                ZStack {
                    Circle()
                        .fill(Color.white.opacity(0.6))
                        .frame(width: 80, height: 80)

                    Image(systemName: "figure.2.and.child.holdinghands")
                        .font(.system(size: 42, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }

                // Right Column: 4 Feature Value Badges
                VStack(alignment: .leading, spacing: 8) {
                    featureBadge(icon: "house.fill", text: "Home\nCollection")
                    featureBadge(icon: "flask.fill", text: "Trusted\nLabs")
                    featureBadge(icon: "doc.text.fill", text: "Accurate\nReports")
                    featureBadge(icon: "creditcard.fill", text: "No Cash\nPayments")
                }
            }
            .padding(14)
        }
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(Color.white, lineWidth: 1.5))
        .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 3)
    }

    private func featureBadge(icon: String, text: String) -> some View {
        HStack(spacing: 5) {
            ZStack {
                Circle()
                    .fill(Color(red: 0.05, green: 0.65, blue: 0.45).opacity(0.15))
                    .frame(width: 20, height: 20)
                Image(systemName: icon)
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(Color(red: 0.05, green: 0.65, blue: 0.45))
            }

            Text(text)
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(MedMargTheme.slate700)
                .lineLimit(2)
        }
    }

    // =========================================================================
    // 🎁 5. SEGMENTED PACKAGES SECTION
    // =========================================================================
    private var segmentedPackagesSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            // Segmented Header Tabs
            HStack(spacing: 20) {
                packageTabButton(key: "POPULAR", title: "Popular Packages")
                packageTabButton(key: "RECOMMENDED", title: "Recommended for You")
                packageTabButton(key: "PROFILES", title: "Health Profiles")
            }
            .padding(.horizontal, 16)

            // Horizontal Carousel of 3 Major Packages
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 14) {
                    // Card 1: Full Body Checkup Basic
                    packageHeroCard(
                        badge: "Most Popular",
                        badgeColor: Color(red: 0.05, green: 0.65, blue: 0.45),
                        icon: "person.3.fill",
                        iconColor: Color.blue,
                        title: "Full Body Checkup Basic",
                        testsSummary: "60 Tests | 12 Health Parameters",
                        price: 999,
                        mrp: 1499,
                        discount: "33% OFF",
                        onDetail: {
                            selectedTab = 1
                        }
                    )

                    // Card 2: Diabetes Care Package
                    packageHeroCard(
                        badge: nil,
                        badgeColor: nil,
                        icon: "drop.fill",
                        iconColor: Color.blue,
                        title: "Diabetes Care Package",
                        testsSummary: "45 Tests | 10 Health Parameters",
                        price: 799,
                        mrp: 1200,
                        discount: "33% OFF",
                        onDetail: {
                            selectedTab = 1
                        }
                    )

                    // Card 3: Heart Health Package
                    packageHeroCard(
                        badge: nil,
                        badgeColor: nil,
                        icon: "heart.fill",
                        iconColor: Color.red,
                        title: "Heart Health Package",
                        testsSummary: "55 Tests | 11 Health Parameters",
                        price: 1299,
                        mrp: 1999,
                        discount: "35% OFF",
                        onDetail: {
                            selectedTab = 1
                        }
                    )
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 2)
            }
        }
    }

    private func packageTabButton(key: String, title: String) -> some View {
        let isSel = packageTab == key

        return Button(action: {
            withAnimation(.spring(response: 0.3)) {
                packageTab = key
            }
        }) {
            VStack(spacing: 4) {
                Text(title)
                    .font(.system(size: 13, weight: isSel ? .bold : .semibold))
                    .foregroundColor(isSel ? MedMargTheme.primaryTeal : MedMargTheme.slate500)

                if isSel {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(MedMargTheme.primaryTeal)
                        .frame(height: 3)
                } else {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.clear)
                        .frame(height: 3)
                }
            }
        }
    }

    private func packageHeroCard(
        badge: String?,
        badgeColor: Color?,
        icon: String,
        iconColor: Color,
        title: String,
        testsSummary: String,
        price: Int,
        mrp: Int,
        discount: String,
        onDetail: @escaping () -> Void
    ) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            // Top Row: Badge & Icon
            HStack(alignment: .top) {
                if let b = badge, let col = badgeColor {
                    Text(b)
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(col)
                        .cornerRadius(6)
                } else {
                    Spacer().frame(height: 20)
                }

                Spacer()

                ZStack {
                    Circle()
                        .fill(iconColor.opacity(0.12))
                        .frame(width: 38, height: 38)
                    Image(systemName: icon)
                        .font(.system(size: 17, weight: .bold))
                        .foregroundColor(iconColor)
                }
            }

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineLimit(1)

                Text(testsSummary)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)
                    .lineLimit(1)
            }

            // Price Row
            HStack(alignment: .lastTextBaseline, spacing: 6) {
                Text("₹\(price)")
                    .font(.system(size: 18, weight: .black, design: .rounded))
                    .foregroundColor(MedMargTheme.slate900)

                Text("₹\(mrp)")
                    .font(.system(size: 11))
                    .strikethrough()
                    .foregroundColor(MedMargTheme.slate400)

                Text(discount)
                    .font(.system(size: 9, weight: .black))
                    .foregroundColor(Color.red)
                    .padding(.horizontal, 4)
                    .padding(.vertical, 2)
                    .background(Color.red.opacity(0.08))
                    .cornerRadius(4)
            }

            Divider()

            // View Details Link
            Button(action: onDetail) {
                HStack(spacing: 4) {
                    Text("View Details")
                        .font(.system(size: 12, weight: .bold))
                    Image(systemName: "arrow.right")
                        .font(.system(size: 10, weight: .bold))
                }
                .foregroundColor(MedMargTheme.primaryTeal)
            }
        }
        .padding(14)
        .frame(width: 220)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
    }

    // =========================================================================
    // 🩸 6. COMMON TESTS (HORIZONTAL SCROLL WITH INSTANT [ADD])
    // =========================================================================
    private var commonTestsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Common Tests")
                    .font(.system(size: 17, weight: .bold, design: .rounded))
                    .foregroundColor(MedMargTheme.slate900)

                Spacer()

                Button(action: { selectedTab = 1 }) {
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
                HStack(spacing: 12) {
                    commonTestCard(
                        code: "CBC",
                        name: "Complete Blood\nCount (CBC)",
                        price: 150,
                        icon: "drop.fill",
                        iconColor: Color.red,
                        bgColor: Color.red.opacity(0.08)
                    )

                    commonTestCard(
                        code: "FBS",
                        name: "Blood Sugar\n(FBS)",
                        price: 100,
                        icon: "drop.fill",
                        iconColor: Color.red,
                        bgColor: Color.red.opacity(0.08)
                    )

                    commonTestCard(
                        code: "LIPID",
                        name: "Lipid Profile\nComplete",
                        price: 250,
                        icon: "drop.fill",
                        iconColor: Color.orange,
                        bgColor: Color.orange.opacity(0.08)
                    )

                    commonTestCard(
                        code: "THYROID",
                        name: "Thyroid Profile\n(TSH, T3, T4)",
                        price: 300,
                        icon: "cross.fill",
                        iconColor: Color(red: 0.85, green: 0.25, blue: 0.60),
                        bgColor: Color.pink.opacity(0.08)
                    )

                    commonTestCard(
                        code: "VIT_D",
                        name: "Vitamin D\n(25-OH)",
                        price: 450,
                        icon: "sun.max.fill",
                        iconColor: Color.orange,
                        bgColor: Color.yellow.opacity(0.12)
                    )
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 2)
            }
        }
    }

    private func commonTestCard(code: String, name: String, price: Int, icon: String, iconColor: Color, bgColor: Color) -> some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(bgColor)
                    .frame(width: 44, height: 44)
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(iconColor)
            }

            Text(name)
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .frame(width: 100, height: 28, alignment: .top)

            Text("₹\(price)")
                .font(.system(size: 15, weight: .black, design: .rounded))
                .foregroundColor(MedMargTheme.slate900)

            Button(action: {
                let testItem = CatalogItem(
                    id: code,
                    serialNo: 1,
                    code: code,
                    name: name.replacingOccurrences(of: "\n", with: " "),
                    sampleType: "SERUM",
                    fasting: "NO",
                    mrp: price + 150,
                    price: price,
                    tatHours: 24,
                    description: "Common diagnostic investigation",
                    active: true,
                    itemType: "TEST"
                )
                onAddToCart(testItem)
                showAddedToast("Added \(code) to cart!")
            }) {
                Text("Add")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(.horizontal, 22)
                    .padding(.vertical, 5)
                    .background(Color.white)
                    .cornerRadius(8)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.primaryTeal, lineWidth: 1))
            }
        }
        .padding(10)
        .frame(width: 120)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 2)
    }

    // =========================================================================
    // 🧬 7. HEALTH PROFILES SECTION (MEN, WOMEN, SENIOR)
    // =========================================================================
    private var healthProfilesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Health Profiles")
                    .font(.system(size: 17, weight: .bold, design: .rounded))
                    .foregroundColor(MedMargTheme.slate900)

                Spacer()

                Button(action: { selectedTab = 1 }) {
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
                HStack(spacing: 12) {
                    profilePillCard(
                        title: "Men's Health\nProfile",
                        icon: "person.fill",
                        iconColor: Color.blue,
                        bgColor: Color(red: 0.92, green: 0.96, blue: 1.0)
                    )

                    profilePillCard(
                        title: "Women's Health\nProfile",
                        icon: "figure.dress.line.vertical.figure",
                        iconColor: Color(red: 0.85, green: 0.25, blue: 0.60),
                        bgColor: Color(red: 0.99, green: 0.92, blue: 0.96)
                    )

                    profilePillCard(
                        title: "Senior Care\nProfile",
                        icon: "figure.seated.side.right",
                        iconColor: Color(red: 0.50, green: 0.35, blue: 0.80),
                        bgColor: Color(red: 0.96, green: 0.93, blue: 0.99)
                    )
                }
                .padding(.vertical, 2)
            }
        }
    }

    private func profilePillCard(title: String, icon: String, iconColor: Color, bgColor: Color) -> some View {
        Button(action: { selectedTab = 1 }) {
            HStack(spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(iconColor.opacity(0.15))
                        .frame(width: 38, height: 38)
                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(iconColor)
                }

                Text(title)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .lineLimit(2)

                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.slate400)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(bgColor)
            .cornerRadius(14)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(iconColor.opacity(0.2), lineWidth: 1))
        }
    }

    // Helper functions
    private func showAddedToast(_ msg: String) {
        withAnimation { addedToast = msg }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation { addedToast = nil }
        }
    }

    private func checkActiveOrder() {
        if let dict = UserDefaults.standard.dictionary(forKey: "medmarg_last_created_order") as? [String: Any],
           let id = dict["id"] as? String {
            self.activeLiveOrder = LiveOrderModel(
                id: id,
                date: dict["date"] as? String ?? "Today",
                slot: dict["slot"] as? String ?? "07:00 AM - 08:00 AM",
                address: dict["address"] as? String ?? "",
                phleboName: dict["phleboName"] as? String ?? "Ramesh Babu",
                phleboPhone: dict["phleboPhone"] as? String ?? "+91 9876543210",
                status: dict["status"] as? String ?? "BOOKED",
                eta: dict["eta"] as? String ?? "25 mins",
                tempTelemetry: "4.2°C",
                handoverOtp: dict["handoverOtp"] as? String ?? "4892",
                items: [],
                totalAmount: dict["totalAmount"] as? Int ?? 999,
                paymentStatus: "PAID"
            )
        }
    }
}
