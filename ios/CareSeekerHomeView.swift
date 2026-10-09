import SwiftUI

// =========================================================================
// 🏠 CARE SEEKER HOME VIEW (100% FEATURE PARITY WITH WEB)
// Curated Plans, Live Telemetry, Quick Action Dock, Offers Zone
// =========================================================================

struct CareSeekerHomeView: View {
    @Binding var selectedTab: Int
    @ObservedObject var healthKit = HealthKitManager.shared
    let onAddToCart: (CatalogItem) -> Void
    let onOpenPrescriptionModal: () -> Void
    let onOpenAddressModal: () -> Void
    let onOpenDetail: (CatalogItem) -> Void

    @State private var searchQuery: String = ""
    @State private var activeOfferIndex: Int = 0

    private let curatedPackages: [CatalogItem] = [
        CatalogItem(
            id: "MM_MASTER",
            serialNo: 1,
            code: "MM_MASTER",
            name: "MedMarg Master Health Checkup (Comprehensive)",
            sampleType: "SERUM, EDTA, URINE",
            fasting: "YES",
            category: "Full Body Packages",
            mrp: 3999,
            price: 1499,
            tatHours: 24,
            description: "104 vital clinical parameters including CBC, Lipid Profile, Liver Function (LFT), Kidney Function (KFT), Thyroid TSH, Fasting Blood Sugar, and Vitamin D3/B12.",
            active: true,
            itemType: "PACKAGE",
            profiles: nil,
            tests: ["Complete Blood Count (CBC 24 Params)", "Lipid Profile Total (8 Params)", "Liver Function Tests (LFT 11 Params)", "Kidney Function Tests (KFT 9 Params)", "Thyroid Stimulating Hormone (TSH)", "Fasting Blood Sugar (FBS)", "HbA1c Glycated Hemoglobin", "Vitamin D3 (25-OH)", "Vitamin B12"],
            testCount: 104,
            discountPercent: 62,
            tagline: "MOST COMPREHENSIVE • 104 PARAMETERS",
            popular: true,
            fastingNote: "10-12 Hours Fasting Required",
            sampleTypes: ["SERUM", "EDTA", "URINE"]
        ),
        CatalogItem(
            id: "MM_CARDIAC",
            serialNo: 2,
            code: "MM_CARDIAC",
            name: "Executive Cardiac Risk & Lipid Panel",
            sampleType: "SERUM, EDTA",
            fasting: "YES",
            category: "Heart & Vascular",
            mrp: 2499,
            price: 899,
            tatHours: 24,
            description: "Advanced cardiac risk biomarkers including High-Sensitivity CRP (hs-CRP), Apolipoprotein A1/B, Total Cholesterol, HDL, LDL, Triglycerides, and Homocysteine.",
            active: true,
            itemType: "PACKAGE",
            profiles: nil,
            tests: ["High Sensitivity CRP (hs-CRP)", "Apolipoprotein A1 & B", "Lipid Profile Complete", "Homocysteine", "Serum Creatinine"],
            testCount: 22,
            discountPercent: 64,
            tagline: "CARDIOLOGIST RECOMMENDED",
            popular: true,
            fastingNote: "12 Hours Fasting Required",
            sampleTypes: ["SERUM", "EDTA"]
        ),
        CatalogItem(
            id: "MM_DIABETES",
            serialNo: 3,
            code: "MM_DIABETES",
            name: "Diabetic Care & Glycemic Index Shield",
            sampleType: "EDTA, SERUM",
            fasting: "YES",
            category: "Diabetes Care",
            mrp: 1800,
            price: 649,
            tatHours: 24,
            description: "Gold-standard 3-month glycemic control evaluation including HbA1c, Fasting Blood Sugar, Post-Prandial Glucose, Urine Microalbumin, and Estimated Average Glucose (eAG).",
            active: true,
            itemType: "PACKAGE",
            profiles: nil,
            tests: ["HbA1c (Glycated Hemoglobin)", "Fasting Blood Glucose (FBS)", "Average Blood Glucose (eAG)", "Serum Creatinine", "Urine Microalbumin"],
            testCount: 14,
            discountPercent: 63,
            tagline: "DIABETOLOGIST BACKED",
            popular: true,
            fastingNote: "8-10 Hours Fasting",
            sampleTypes: ["EDTA", "SERUM"]
        ),
        CatalogItem(
            id: "MM_WOMEN",
            serialNo: 4,
            code: "MM_WOMEN",
            name: "Women's Wellness & Hormonal Balance Panel",
            sampleType: "SERUM, EDTA",
            fasting: "NO",
            category: "Women's Health",
            mrp: 2999,
            price: 1199,
            tatHours: 24,
            description: "Tailored for women's preventive health: Thyroid Profile Total (T3/T4/TSH), CBC, Iron Deficiency Profile with Ferritin, Calcium, Vitamin D3, and Hormonal Markers.",
            active: true,
            itemType: "PACKAGE",
            profiles: nil,
            tests: ["Thyroid Profile Total (T3, T4, TSH)", "Complete Hemogram (Anemia Screen)", "Iron & Total Iron Binding Capacity", "Serum Ferritin", "Serum Calcium", "Vitamin D3 (25-OH)"],
            testCount: 48,
            discountPercent: 60,
            tagline: "WOMEN'S SPECIAL",
            popular: true,
            fastingNote: "No Fasting Required",
            sampleTypes: ["SERUM", "EDTA"]
        )
    ]

    private let promoOffers: [(code: String, title: String, desc: String, bg: Color, icon: String)] = [
        ("WELLNESS200", "Flat ₹200 OFF on Full Body Checkups", "Use code WELLNESS200 on cart above ₹999", MedMargTheme.darkTeal, "gift.fill"),
        ("HEART50", "Cardiac Risk Panel Special: ₹899 Only", "Comprehensive hs-CRP & Lipid profile", Color(red: 0.7, green: 0.1, blue: 0.2), "heart.fill"),
        ("FASTING60", "Early Bird 06:00 AM Slot Phlebotomy", "Fastest 60-min doorstep sample pickup", Color(red: 0.05, green: 0.45, blue: 0.35), "bolt.fill")
    ]

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                
                // 1. Live Apple Health Telemetry Quick Bar (Clickable -> Vitals Tab)
                appleHealthQuickBar

                // 2. Active Live Dispatch Radar Banner (if order active)
                activeDispatchQuickBanner

                // 3. Search Bar for 913+ Tests
                searchBarSection

                // 4. Quick Action Dock (4 Core Channels: 60-Min, Rx, WhatsApp, Call)
                quickActionDock

                // 5. Curated Preventive Diagnostic Health Plans
                curatedHealthPlansSection

                // 6. Offers Zone Carousel
                offersZoneCarousel

                Spacer().frame(height: 80)
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
        }
        .background(MedMargTheme.slate50)
    }

    // ==========================================
    // 🫀 1. APPLE HEALTH QUICK BAR
    // ==========================================
    private var appleHealthQuickBar: some View {
        Button(action: { selectedTab = 2 }) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(Color.red.opacity(0.12))
                        .frame(width: 44, height: 44)
                    Image(systemName: "heart.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.red)
                }

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text("Apple Health Live Vitals")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)

                        Text("LIVE")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(.white)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(Color.green)
                            .cornerRadius(4)
                    }

                    Text("\(Int(healthKit.restingHeartRate)) BPM • SpO2 \(String(format: "%.1f", healthKit.bloodOxygen))% • BP \(Int(healthKit.systolicBP))/\(Int(healthKit.diastolicBP)) • \(Int(healthKit.stepCount)) Steps")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(MedMargTheme.slate500)
                        .lineLimit(1)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
            .padding(14)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        }
    }

    // ==========================================
    // 📡 2. ACTIVE DISPATCH QUICK BANNER
    // ==========================================
    private var activeDispatchQuickBanner: some View {
        Button(action: { selectedTab = 3 }) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.amberGold.opacity(0.2))
                        .frame(width: 44, height: 44)
                    Image(systemName: "bicycle")
                        .font(.system(size: 20))
                        .foregroundColor(MedMargTheme.amberGold)
                }

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text("Order #MM-LAB-9842 • Enroute")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)

                        Text("ETA 14 Mins")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(MedMargTheme.primaryTeal)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(MedMargTheme.lightTeal)
                            .cornerRadius(4)
                    }

                    Text("Ramesh Kumar • IoT Cold-Chain: 3.8°C • OTP: 4821")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(MedMargTheme.slate500)
                        .lineLimit(1)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
            .padding(14)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        }
    }

    // ==========================================
    // 🔍 3. ULTRA-PREMIUM SEARCH BAR
    // ==========================================
    private var searchBarSection: some View {
        Button(action: { selectedTab = 1 }) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [MedMargTheme.primaryTeal.opacity(0.18), MedMargTheme.accentEmerald.opacity(0.12)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 38, height: 38)

                    Image(systemName: "magnifyingglass")
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .font(.system(size: 16, weight: .bold))
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("Search 913+ Tests & Health Packages")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("e.g. Vitamin D, Thyroid TSH, CBC, HbA1c, Lipid...")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                HStack(spacing: 4) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 10, weight: .bold))
                    Text("Browse Matrix")
                        .font(.system(size: 11, weight: .bold))
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(
                    LinearGradient(
                        colors: [MedMargTheme.primaryTeal, MedMargTheme.accentEmerald],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .foregroundColor(.white)
                .cornerRadius(10)
                .shadow(color: MedMargTheme.accentEmerald.opacity(0.3), radius: 4, x: 0, y: 2)
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 18)
                    .fill(Color.white)
                    .shadow(color: MedMargTheme.primaryTeal.opacity(0.08), radius: 12, x: 0, y: 4)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 18)
                    .stroke(
                        LinearGradient(
                            colors: [MedMargTheme.primaryTeal.opacity(0.5), MedMargTheme.accentEmerald.opacity(0.35), MedMargTheme.primaryTeal.opacity(0.15)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1.5
                    )
            )
        }
    }

    // ==========================================
    // ⚡ 4. QUICK ACTION DOCK
    // ==========================================
    private var quickActionDock: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Instant Healthcare Services")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                
                // 1. Upload Rx
                Button(action: onOpenPrescriptionModal) {
                    HStack(spacing: 10) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(MedMargTheme.lightTeal)
                                .frame(width: 38, height: 38)
                            Image(systemName: "doc.viewfinder.fill")
                                .font(.system(size: 18))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Upload Rx")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("15-Min Callback")
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

                // 2. 60-Min Phlebotomy
                Button(action: { selectedTab = 1 }) {
                    HStack(spacing: 10) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color.orange.opacity(0.12))
                                .frame(width: 38, height: 38)
                            Image(systemName: "bolt.fill")
                                .font(.system(size: 18))
                                .foregroundColor(.orange)
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            Text("60-Min Phlebo")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Fastest Doorstep")
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

                // 3. WhatsApp Booking
                Button(action: {
                    let urlStr = "https://wa.me/919876543210?text=Hello%20MedMarg,%20I%20would%20like%20to%20book%20a%20Diagnostic%20Health%20Checkup."
                    if let url = URL(string: urlStr) {
                        UIApplication.shared.open(url)
                    }
                }) {
                    HStack(spacing: 10) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color.green.opacity(0.12))
                                .frame(width: 38, height: 38)
                            Image(systemName: "message.fill")
                                .font(.system(size: 18))
                                .foregroundColor(Color(red: 0.15, green: 0.78, blue: 0.40))
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            Text("WhatsApp")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Instant Chat")
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

                // 4. Call Helpline
                Button(action: {
                    if let url = URL(string: "tel://919876543210") {
                        UIApplication.shared.open(url)
                    }
                }) {
                    HStack(spacing: 10) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color.blue.opacity(0.12))
                                .frame(width: 38, height: 38)
                            Image(systemName: "phone.fill")
                                .font(.system(size: 18))
                                .foregroundColor(.blue)
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Helpline 24/7")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Doctor Support")
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
    }

    // ==========================================
    // 🧪 5. CURATED HEALTH PLANS
    // ==========================================
    private var curatedHealthPlansSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Curated Preventive Health Plans")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("NABL ISO 15189 certified labs with free home phlebotomy")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Button(action: { selectedTab = 1 }) {
                    Text("See All 913+")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
            }

            VStack(spacing: 14) {
                ForEach(curatedPackages) { pkg in
                    VStack(alignment: .leading, spacing: 12) {
                        
                        // Top Badge & Code
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

                            Text(pkg.fasting == "YES" ? "⏱ Fasting Required" : "✓ No Fasting")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(pkg.fasting == "YES" ? .orange : .green)
                        }

                        // Title & Description
                        VStack(alignment: .leading, spacing: 4) {
                            Text(pkg.name)
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)

                            if let desc = pkg.description {
                                Text(desc)
                                    .font(.system(size: 11))
                                    .foregroundColor(MedMargTheme.slate500)
                                    .lineLimit(2)
                            }
                        }

                        // Specs Bar
                        HStack(spacing: 12) {
                            HStack(spacing: 4) {
                                Image(systemName: "drop.fill")
                                    .font(.system(size: 10))
                                    .foregroundColor(.red)
                                Text(pkg.sampleType ?? "SERUM")
                                    .font(.system(size: 10, weight: .medium))
                                    .foregroundColor(MedMargTheme.slate700)
                            }

                            HStack(spacing: 4) {
                                Image(systemName: "bolt.fill")
                                    .font(.system(size: 10))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                Text("\(pkg.tatHours ?? 24)h TAT")
                                    .font(.system(size: 10, weight: .medium))
                                    .foregroundColor(MedMargTheme.slate700)
                            }

                            HStack(spacing: 4) {
                                Image(systemName: "waveform.path.ecg")
                                    .font(.system(size: 10))
                                    .foregroundColor(.blue)
                                Text("\(pkg.testCount ?? 1) Params")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                            }
                        }

                        Divider()

                        // Price & Book Row
                        HStack {
                            VStack(alignment: .leading, spacing: 1) {
                                HStack(spacing: 6) {
                                    Text("Starts from ₹\(pkg.price)")
                                        .font(.system(size: 16, weight: .black))
                                        .foregroundColor(MedMargTheme.primaryTeal)

                                    if pkg.mrp > pkg.price {
                                        Text("₹\(pkg.mrp)")
                                            .font(.system(size: 11))
                                            .strikethrough()
                                            .foregroundColor(MedMargTheme.slate500)
                                    }
                                }

                                Text("Free Home Phlebotomy")
                                    .font(.system(size: 10))
                                    .foregroundColor(Color.green)
                            }

                            Spacer()

                            HStack(spacing: 8) {
                                Button(action: { onOpenDetail(pkg) }) {
                                    Text("Details")
                                        .font(.system(size: 12, weight: .bold))
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 8)
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
                                    .padding(.vertical, 8)
                                    .background(MedMargTheme.primaryTeal)
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                                }
                            }
                        }
                    }
                    .padding(16)
                    .background(Color.white)
                    .cornerRadius(18)
                    .overlay(RoundedRectangle(cornerRadius: 18).stroke(MedMargTheme.slate200, lineWidth: 1))
                }
            }
        }
    }

    // ==========================================
    // 🎁 6. OFFERS ZONE CAROUSEL
    // ==========================================
    private var offersZoneCarousel: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Special Offers Zone")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                Text("Promotions")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }

            TabView(selection: $activeOfferIndex) {
                ForEach(0..<promoOffers.count, id: \.self) { idx in
                    let offer = promoOffers[idx]
                    HStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(Color.white.opacity(0.2))
                                .frame(width: 44, height: 44)
                            Image(systemName: offer.icon)
                                .font(.system(size: 20))
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
                    .cornerRadius(16)
                    .tag(idx)
                }
            }
            .frame(height: 110)
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .automatic))
        }
    }
}
