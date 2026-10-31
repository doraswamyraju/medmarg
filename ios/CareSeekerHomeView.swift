import SwiftUI

// =========================================================================
// 🏠 CARE SEEKER HOME VIEW
// Redesigned: Clean, visual, low-text, visual health categories with icons & color gradients
// ==========================================

struct HealthCategoryItem: Identifiable {
    let id: String
    let title: String
    let subtitle: String
    let icon: String
    let gradient: [Color]
    let filterKey: String // "PACKAGES", "PROFILES", "TESTS", or specific query
}

struct CareSeekerHomeView: View {
    @Binding var selectedTab: Int
    @ObservedObject var healthKit = HealthKitManager.shared
    let onAddToCart: (CatalogItem) -> Void
    let onOpenPrescriptionModal: () -> Void
    let onOpenAddressModal: () -> Void
    let onOpenDetail: (CatalogItem) -> Void

    @State private var activeLiveOrder: LiveOrderModel? = nil
    @State private var activeOfferIndex: Int = 0

    // Visual Categories with Rich Icons & Harmonious Medical Gradients
    private let categories: [HealthCategoryItem] = [
        HealthCategoryItem(
            id: "full_body",
            title: "Full Body Checkup",
            subtitle: "104+ Parameters",
            icon: "figure.walk",
            gradient: [MedMargTheme.primaryTeal, MedMargTheme.darkTeal],
            filterKey: "PACKAGES"
        ),
        HealthCategoryItem(
            id: "diabetes",
            title: "Diabetes Care",
            subtitle: "HbA1c & Glucose",
            icon: "drop.fill",
            gradient: [Color(red: 0.15, green: 0.55, blue: 0.85), Color(red: 0.05, green: 0.35, blue: 0.70)],
            filterKey: "PROFILES"
        ),
        HealthCategoryItem(
            id: "cardiac",
            title: "Heart Health",
            subtitle: "Lipid & hs-CRP",
            icon: "heart.fill",
            gradient: [Color(red: 0.90, green: 0.25, blue: 0.35), Color(red: 0.70, green: 0.10, blue: 0.20)],
            filterKey: "PROFILES"
        ),
        HealthCategoryItem(
            id: "thyroid",
            title: "Thyroid Care",
            subtitle: "T3, T4, TSH Ultra",
            icon: "waveform.path.ecg",
            gradient: [Color(red: 0.60, green: 0.35, blue: 0.85), Color(red: 0.40, green: 0.20, blue: 0.65)],
            filterKey: "PROFILES"
        ),
        HealthCategoryItem(
            id: "vitamins",
            title: "Vitamins & Immunity",
            subtitle: "Vit D3 & B12",
            icon: "sun.max.fill",
            gradient: [Color(red: 0.95, green: 0.55, blue: 0.15), Color(red: 0.85, green: 0.40, blue: 0.05)],
            filterKey: "TESTS"
        ),
        HealthCategoryItem(
            id: "women",
            title: "Women's Wellness",
            subtitle: "Hormones & CBC",
            icon: "sparkles",
            gradient: [Color(red: 0.85, green: 0.30, blue: 0.60), Color(red: 0.65, green: 0.15, blue: 0.45)],
            filterKey: "PROFILES"
        ),
        HealthCategoryItem(
            id: "fever",
            title: "Fever & Infection",
            subtitle: "CBC, Dengue, ESR",
            icon: "thermometer.medium",
            gradient: [Color(red: 0.20, green: 0.70, blue: 0.50), Color(red: 0.10, green: 0.50, blue: 0.35)],
            filterKey: "TESTS"
        ),
        HealthCategoryItem(
            id: "senior",
            title: "Senior Citizen",
            subtitle: "Vital Organs Panel",
            icon: "shield.checkerboard",
            gradient: [Color(red: 0.30, green: 0.40, blue: 0.55), Color(red: 0.18, green: 0.25, blue: 0.38)],
            filterKey: "PACKAGES"
        )
    ]

    private let curatedPackages: [CatalogItem] = [
        CatalogItem(
            id: "MM_MASTER",
            serialNo: 1,
            code: "MM_MASTER",
            name: "MedMarg Master Health Checkup",
            sampleType: "SERUM, EDTA, URINE",
            fasting: "YES",
            category: "Full Body Packages",
            mrp: 3999,
            price: 1499,
            tatHours: 24,
            description: "104 vital clinical parameters: CBC, Lipid, Liver LFT, Kidney KFT, Thyroid TSH, Glucose, Vitamin D3 & B12.",
            active: true,
            itemType: "PACKAGE",
            profiles: nil,
            tests: ["CBC (24 Params)", "Lipid Profile", "Liver LFT", "Kidney KFT", "Thyroid TSH", "Fasting Sugar", "HbA1c", "Vit D3", "Vit B12"],
            testCount: 104,
            discountPercent: 62,
            tagline: "MOST POPULAR • 104 TESTS",
            popular: true,
            fastingNote: "10-12 Hours Fasting",
            sampleTypes: ["SERUM", "EDTA", "URINE"]
        ),
        CatalogItem(
            id: "MM_CARDIAC",
            serialNo: 2,
            code: "MM_CARDIAC",
            name: "Cardiac Risk & Lipid Panel",
            sampleType: "SERUM, EDTA",
            fasting: "YES",
            category: "Heart & Vascular",
            mrp: 2499,
            price: 899,
            tatHours: 24,
            description: "Advanced cardiac risk biomarkers: High-Sensitivity CRP (hs-CRP), Apolipoprotein A1/B, Total Cholesterol, HDL, LDL, Triglycerides.",
            active: true,
            itemType: "PACKAGE",
            profiles: nil,
            tests: ["hs-CRP", "Apolipoprotein A1/B", "Lipid Profile Complete", "Homocysteine"],
            testCount: 22,
            discountPercent: 64,
            tagline: "CARDIOLOGIST BACKED",
            popular: true,
            fastingNote: "12 Hours Fasting",
            sampleTypes: ["SERUM", "EDTA"]
        ),
        CatalogItem(
            id: "MM_DIABETES",
            serialNo: 3,
            code: "MM_DIABETES",
            name: "Diabetic Care & Glycemic Shield",
            sampleType: "EDTA, SERUM",
            fasting: "YES",
            category: "Diabetes Care",
            mrp: 1800,
            price: 649,
            tatHours: 24,
            description: "Gold standard 3-month glycemic control: HbA1c, Fasting Blood Sugar, Urine Microalbumin, Average Blood Sugar.",
            active: true,
            itemType: "PACKAGE",
            profiles: nil,
            tests: ["HbA1c", "Fasting Glucose (FBS)", "Average Blood Glucose (eAG)", "Serum Creatinine"],
            testCount: 14,
            discountPercent: 63,
            tagline: "ESSENTIAL DIABETIC",
            popular: true,
            fastingNote: "8-10 Hours Fasting",
            sampleTypes: ["EDTA", "SERUM"]
        )
    ]

    private let promoOffers: [(code: String, title: String, desc: String, bg: Color, icon: String)] = [
        ("WELLNESS200", "Flat ₹200 OFF on Full Body Checkups", "Use code WELLNESS200 on cart above ₹999", MedMargTheme.darkTeal, "gift.fill"),
        ("FASTING60", "Early Bird 06:00 AM Slot Phlebotomy", "Fastest 60-min doorstep sample pickup", Color(red: 0.05, green: 0.45, blue: 0.35), "bolt.fill")
    ]

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 18) {
                
                // 1. Clean Pinned-Style Search Header
                searchBarBanner

                // 2. Active Live Order Status (ONLY if user has active order)
                if let ord = activeLiveOrder, ord.status != "COMPLETED" {
                    activeDispatchQuickBanner(order: ord)
                }

                // 3. Visual Health Categories Grid (Visual Icons, Minimal Text)
                healthCategoriesSection

                // 4. Instant Action Dock (Upload Rx, 60-Min, WhatsApp, Call)
                quickActionDock

                // 5. Featured Preventive Health Plans
                featuredPlansSection

                // 6. Special Offers
                offersZoneCarousel

                Spacer().frame(height: 80)
            }
            .padding(.horizontal, 16)
            .padding(.top, 14)
        }
        .background(MedMargTheme.slate50)
        .onAppear {
            checkActiveOrder()
        }
    }

    // ==========================================
    // 🔍 1. SEARCH BAR BANNER
    // ==========================================
    private var searchBarBanner: some View {
        Button(action: { selectedTab = 1 }) {
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .font(.system(size: 16, weight: .bold))

                Text("Search tests, packages, organs...")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)

                Spacer()

                Text("913+ Tests")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(6)
            }
            .padding(12)
            .background(Color.white)
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(MedMargTheme.slate200, lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
        }
    }

    // ==========================================
    // 🏷️ 2. ACTIVE LIVE ORDER QUICK BANNER
    // ==========================================
    private func activeDispatchQuickBanner(order: LiveOrderModel) -> some View {
        let isEnroute = order.status.uppercased() == "ENROUTE" || order.status.uppercased() == "EN_ROUTE"
        let title = isEnroute ? "Phlebotomist Enroute" : "Order Scheduled"
        let badge = isEnroute ? "LIVE" : "CONFIRMED"
        let badgeColor = isEnroute ? Color.red : MedMargTheme.primaryTeal

        return Button(action: { selectedTab = 3 }) {
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

    // ==========================================
    // 🎨 3. VISUAL HEALTH CATEGORIES (ICON + COLOR GRADIENTS)
    // ==========================================
    private var healthCategoriesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Popular Health Checks")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                Button(action: { selectedTab = 1 }) {
                    Text("View All")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(categories) { cat in
                    Button(action: { selectedTab = 1 }) {
                        VStack(spacing: 8) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(
                                        LinearGradient(
                                            colors: cat.gradient,
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .frame(width: 54, height: 54)
                                    .shadow(color: cat.gradient[0].opacity(0.3), radius: 6, x: 0, y: 3)

                                Image(systemName: cat.icon)
                                    .font(.system(size: 24))
                                    .foregroundColor(.white)
                            }

                            Text(cat.title)
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                                .multilineTextAlignment(.center)
                                .lineLimit(2)
                                .frame(height: 28, alignment: .top)
                        }
                    }
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(18)
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // ⚡ 4. QUICK ACTION DOCK
    // ==========================================
    private var quickActionDock: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
            // Upload Rx
            Button(action: onOpenPrescriptionModal) {
                HStack(spacing: 10) {
                    ZStack {
                        Circle()
                            .fill(MedMargTheme.lightTeal)
                            .frame(width: 36, height: 36)
                        Image(systemName: "doc.viewfinder.fill")
                            .font(.system(size: 16))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                    VStack(alignment: .leading, spacing: 1) {
                        Text("Upload Rx")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Free Pharmacist Callback")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    Spacer()
                }
                .padding(10)
                .background(Color.white)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
            }

            // WhatsApp Support
            Button(action: {
                let urlStr = "https://wa.me/919876543210?text=Hello%20MedMarg,%20I%20would%20like%20to%20book%20a%20Diagnostic%20Health%20Checkup."
                if let url = URL(string: urlStr) {
                    UIApplication.shared.open(url)
                }
            }) {
                HStack(spacing: 10) {
                    ZStack {
                        Circle()
                            .fill(Color.green.opacity(0.12))
                            .frame(width: 36, height: 36)
                        Image(systemName: "message.fill")
                            .font(.system(size: 16))
                            .foregroundColor(Color(red: 0.15, green: 0.78, blue: 0.40))
                    }
                    VStack(alignment: .leading, spacing: 1) {
                        Text("WhatsApp")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Instant Booking")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    Spacer()
                }
                .padding(10)
                .background(Color.white)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
            }
        }
    }

    // ==========================================
    // 🧪 5. FEATURED HEALTH PLANS
    // ==========================================
    private var featuredPlansSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Featured Health Packages")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                Button(action: { selectedTab = 1 }) {
                    Text("View All")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            VStack(spacing: 12) {
                ForEach(curatedPackages) { pkg in
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            if let tag = pkg.tagline {
                                Text(tag)
                                    .font(.system(size: 9, weight: .black))
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(MedMargTheme.amberLight)
                                    .foregroundColor(MedMargTheme.amberGold)
                                    .cornerRadius(4)
                            }
                            Spacer()
                            Text(pkg.fasting == "YES" ? "⏳ Fasting" : "⚡ Non-Fasting")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(pkg.fasting == "YES" ? .orange : .green)
                        }

                        Text(pkg.name)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)

                        if let desc = pkg.description {
                            Text(desc)
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                                .lineLimit(2)
                        }

                        Divider()

                        HStack {
                            VStack(alignment: .leading, spacing: 1) {
                                Text("₹\(pkg.price)")
                                    .font(.system(size: 18, weight: .black, design: .rounded))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                Text("₹\(pkg.mrp)")
                                    .font(.system(size: 11))
                                    .strikethrough()
                                    .foregroundColor(MedMargTheme.slate500)
                            }

                            Spacer()

                            HStack(spacing: 8) {
                                Button(action: { onOpenDetail(pkg) }) {
                                    Text("Details")
                                        .font(.system(size: 11, weight: .bold))
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 6)
                                        .background(MedMargTheme.lightTeal)
                                        .foregroundColor(MedMargTheme.primaryTeal)
                                        .cornerRadius(8)
                                }

                                Button(action: { onAddToCart(pkg) }) {
                                    HStack(spacing: 4) {
                                        Image(systemName: "plus")
                                        Text("Book")
                                    }
                                    .font(.system(size: 12, weight: .bold))
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 6)
                                    .background(MedMargTheme.primaryTeal)
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                                }
                            }
                        }
                    }
                    .padding(14)
                    .background(Color.white)
                    .cornerRadius(16)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
                }
            }
        }
    }

    // ==========================================
    // 🎁 6. OFFERS CAROUSEL
    // ==========================================
    private var offersZoneCarousel: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Exclusive Offers")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            TabView(selection: $activeOfferIndex) {
                ForEach(0..<promoOffers.count, id: \.self) { idx in
                    let offer = promoOffers[idx]
                    HStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(Color.white.opacity(0.2))
                                .frame(width: 40, height: 40)
                            Image(systemName: offer.icon)
                                .font(.system(size: 18))
                                .foregroundColor(.white)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(offer.title)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(.white)

                            Text(offer.desc)
                                .font(.system(size: 10))
                                .foregroundColor(Color.white.opacity(0.85))

                            Text("CODE: \(offer.code)")
                                .font(.system(size: 9, weight: .black, design: .monospaced))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.white.opacity(0.25))
                                .foregroundColor(.white)
                                .cornerRadius(4)
                        }

                        Spacer()
                    }
                    .padding(14)
                    .background(offer.bg)
                    .cornerRadius(14)
                    .tag(idx)
                }
            }
            .frame(height: 100)
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .automatic))
        }
    }

    private func checkActiveOrder() {
        guard let url = URL(string: "https://medmarg.com/api/v1/admin/orders") else { return }
        URLSession.shared.dataTask(with: url) { data, _, _ in
            guard let d = data,
                  let json = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
                  let ordersArray = (json["orders"] as? [[String: Any]]) ?? (json["data"] as? [[String: Any]]) else {
                DispatchQueue.main.async { self.activeLiveOrder = nil }
                return
            }

            if let activeDict = ordersArray.first(where: {
                let st = ($0["status"] as? String)?.uppercased() ?? ""
                return st == "BOOKED" || st == "CONFIRMED" || st == "ASSIGNED" || st == "ENROUTE" || st == "EN_ROUTE" || st == "SAMPLE_COLLECTED" || st == "IN_LAB" || st == "COLLECTION_ASSIGNED"
            }) {
                let id = activeDict["id"] as? String ?? "MM-ORD"
                let phlebo = activeDict["phleboName"] as? String ?? "Certified Phlebotomist"
                let phleboPhone = activeDict["phleboPhone"] as? String ?? "+91 98765 11223"
                let status = activeDict["status"] as? String ?? "BOOKED"
                let otp = activeDict["handoverOtp"] as? String ?? "\(activeDict["otp"] as? String ?? "4821")"
                let amt = activeDict["amount"] as? Int ?? (activeDict["totalAmount"] as? Int ?? 499)
                let slot = activeDict["slot"] as? String ?? "Morning Slot"
                let date = activeDict["date"] as? String ?? "Today"
                let rawEta = activeDict["eta"] as? String ?? ""

                let orderObj = LiveOrderModel(
                    id: id,
                    date: date,
                    slot: slot,
                    address: activeDict["address"] as? String ?? "Tirupati, AP",
                    phleboName: phlebo,
                    phleboPhone: phleboPhone,
                    status: status,
                    eta: rawEta.isEmpty ? slot : rawEta,
                    tempTelemetry: "3.8°C",
                    handoverOtp: otp,
                    items: [],
                    totalAmount: amt,
                    paymentStatus: "PAID"
                )

                DispatchQueue.main.async {
                    self.activeLiveOrder = orderObj
                }
            } else {
                DispatchQueue.main.async {
                    self.activeLiveOrder = nil
                }
            }
        }.resume()
    }
}
