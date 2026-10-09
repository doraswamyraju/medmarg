import SwiftUI

// =========================================================================
// 🛒 CARE SEEKER CART DRAWER & MULTI-LAB COMPARISON DESK
// 100% Feature Parity with Web PatientCartDrawer.jsx
// =========================================================================

struct LabOptionTotal: Identifiable, Equatable {
    let id: String // "medmarg_suggested", "thyrocare", "lalpath"
    let name: String
    let subtitle: String
    let badge: String
    let totalPrice: Int
    let totalMrp: Int
    let totalSavings: Int
    let tat: String
    let color: Color
}

struct CareSeekerCartDrawer: View {
    @Binding var isOpen: Bool
    @Binding var cartItems: [CartItem]
    @Binding var selectedLabProvider: String // "medmarg_suggested", "thyrocare", "lalpath"
    let onProceedToCheckout: () -> Void
    let onAddToCart: (CatalogItem) -> Void

    @AppStorage("medmarg_preferred_lab_choice") private var savedPreferredLab: String = "medmarg_suggested"
    @State private var rememberPreference: Bool = true
    @State private var inCartSearch: String = ""

    private var hasFasting: Bool {
        cartItems.contains { $0.subtitle.lowercased().contains("fasting") || $0.type.lowercased().contains("fasting") }
    }

    private var labOptions: [LabOptionTotal] {
        let baseTotal = cartItems.reduce(0) { $0 + $1.price }
        let baseMrp = cartItems.reduce(0) { $0 + $1.mrp }

        return [
            LabOptionTotal(
                id: "medmarg_suggested",
                name: "MedMarg Direct (Best Value)",
                subtitle: "Certified Regional Hub • Fastest Dispatch",
                badge: "RECOMMENDED",
                totalPrice: baseTotal,
                totalMrp: max(baseMrp, Int(Double(baseTotal) * 1.6)),
                totalSavings: max(0, max(baseMrp, Int(Double(baseTotal) * 1.6)) - baseTotal),
                tat: "24h TAT",
                color: MedMargTheme.primaryTeal
            ),
            LabOptionTotal(
                id: "thyrocare",
                name: "Thyrocare Technologies",
                subtitle: "NABL & CAP Accredited Central Processing Hub",
                badge: "NABL ACCREDITED",
                totalPrice: Int(Double(baseTotal) * 1.05),
                totalMrp: max(baseMrp, Int(Double(baseTotal) * 1.7)),
                totalSavings: max(0, max(baseMrp, Int(Double(baseTotal) * 1.7)) - Int(Double(baseTotal) * 1.05)),
                tat: "24-36h TAT",
                color: Color.blue
            ),
            LabOptionTotal(
                id: "lalpath",
                name: "Dr. Lal PathLabs",
                subtitle: "Gold Standard Reference Pathology Lab",
                badge: "PREMIUM",
                totalPrice: Int(Double(baseTotal) * 1.15),
                totalMrp: max(baseMrp, Int(Double(baseTotal) * 1.8)),
                totalSavings: max(0, max(baseMrp, Int(Double(baseTotal) * 1.8)) - Int(Double(baseTotal) * 1.15)),
                tat: "24-48h TAT",
                color: Color.purple
            )
        ]
    }

    private var currentLabTotal: LabOptionTotal {
        labOptions.first { $0.id == selectedLabProvider } ?? labOptions[0]
    }

    // Quick Add-on Tests
    private let quickAddOns: [(code: String, name: String, price: Int, mrp: Int, sample: String)] = [
        ("VIT_D", "Vitamin D3 (25-OH)", 499, 1200, "SERUM"),
        ("VIT_B12", "Vitamin B12 (Active)", 449, 1100, "SERUM"),
        ("THYROID_T", "Thyroid Profile Total (T3/T4/TSH)", 299, 650, "SERUM"),
        ("HBA1C", "HbA1c Glycated Hemoglobin", 299, 600, "EDTA"),
        ("CBC", "Complete Blood Count CBC", 249, 500, "EDTA")
    ]

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    
                    if cartItems.isEmpty {
                        emptyCartView
                    } else {
                        // 1. Multi-Laboratory Selection Desk
                        multiLabComparisonDesk

                        // 2. Fasting Alert Banner (if applicable)
                        if hasFasting {
                            fastingNoticeBanner
                        }

                        // 3. Cart Items Breakdown
                        cartItemsSection

                        // 4. Quick Diagnostic Add-ons Carousel
                        quickAddOnsSection

                        // 5. Bill Details & Price Summary
                        billSummaryCard

                        // 6. Checkout CTA Bar
                        checkoutCTAButton
                    }

                    Spacer().frame(height: 30)
                }
                .padding(16)
            }
            .background(MedMargTheme.slate50)
            .navigationTitle("Your Cart (\(cartItems.count))")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { isOpen = false }
                }
            }
        }
    }

    // ==========================================
    // 🏢 1. MULTI-LAB COMPARISON DESK
    // ==========================================
    private var multiLabComparisonDesk: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Select Diagnostic Lab Provider")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Transparent multi-lab pricing for your selected tests")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }
                Spacer()
            }

            VStack(spacing: 8) {
                ForEach(labOptions) { lab in
                    let isSelected = lab.id == selectedLabProvider

                    Button(action: {
                        selectedLabProvider = lab.id
                        if rememberPreference {
                            savedPreferredLab = lab.id
                        }
                    }) {
                        HStack(alignment: .top, spacing: 10) {
                            ZStack {
                                Circle()
                                    .stroke(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 2)
                                    .frame(width: 20, height: 20)

                                if isSelected {
                                    Circle()
                                        .fill(MedMargTheme.primaryTeal)
                                        .frame(width: 12, height: 12)
                                }
                            }
                            .padding(.top, 2)

                            VStack(alignment: .leading, spacing: 2) {
                                HStack(spacing: 6) {
                                    Text(lab.name)
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundColor(MedMargTheme.slate900)

                                    Text(lab.badge)
                                        .font(.system(size: 8, weight: .black))
                                        .padding(.horizontal, 5)
                                        .padding(.vertical, 2)
                                        .background(isSelected ? MedMargTheme.lightTeal : MedMargTheme.slate100)
                                        .foregroundColor(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate700)
                                        .cornerRadius(4)
                                }

                                Text(lab.subtitle)
                                    .font(.system(size: 10))
                                    .foregroundColor(MedMargTheme.slate500)

                                HStack(spacing: 6) {
                                    Text("⚡ \(lab.tat)")
                                        .font(.system(size: 10, weight: .medium))
                                        .foregroundColor(MedMargTheme.primaryTeal)
                                    Text("• Save ₹\(lab.totalSavings)")
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundColor(Color.green)
                                }
                            }

                            Spacer()

                            VStack(alignment: .trailing, spacing: 2) {
                                Text("₹\(lab.totalPrice)")
                                    .font(.system(size: 16, weight: .black))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                Text("₹\(lab.totalMrp)")
                                    .font(.system(size: 11))
                                    .strikethrough()
                                    .foregroundColor(MedMargTheme.slate500)
                            }
                        }
                        .padding(12)
                        .background(isSelected ? MedMargTheme.lightTeal.opacity(0.3) : Color.white)
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: isSelected ? 1.5 : 1)
                        )
                    }
                }
            }

            // Remember Lab Choice Checkbox
            Toggle(isOn: $rememberPreference) {
                Text("Remember my laboratory selection for future orders")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(MedMargTheme.slate700)
            }
            .toggleStyle(SwitchToggleStyle(tint: MedMargTheme.primaryTeal))
            .padding(.top, 4)
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // ⏱ 2. FASTING NOTICE BANNER
    // ==========================================
    private var fastingNoticeBanner: some View {
        HStack(spacing: 10) {
            Image(systemName: "clock.badge.exclamationmark.fill")
                .foregroundColor(.orange)
            VStack(alignment: .leading, spacing: 2) {
                Text("Fasting Required (10-12 Hours)")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(Color(red: 0.6, green: 0.3, blue: 0.0))
                Text("One or more tests in your cart require fasting. Water is permitted.")
                    .font(.system(size: 10))
                    .foregroundColor(MedMargTheme.slate700)
            }
            Spacer()
        }
        .padding(12)
        .background(Color.orange.opacity(0.1))
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.orange.opacity(0.3), lineWidth: 1))
    }

    // ==========================================
    // 🧪 3. CART ITEMS SECTION
    // ==========================================
    private var cartItemsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Selected Diagnostic Items (\(cartItems.count))")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            ForEach(cartItems) { itm in
                HStack(alignment: .top, spacing: 10) {
                    ZStack {
                        Circle()
                            .fill(MedMargTheme.lightTeal)
                            .frame(width: 36, height: 36)
                        Image(systemName: "flask.fill")
                            .font(.system(size: 14))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(itm.title)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                            .lineLimit(2)

                        Text(itm.subtitle)
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)

                        HStack(spacing: 6) {
                            Text("₹\(itm.price)")
                                .font(.system(size: 13, weight: .black))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text("₹\(itm.mrp)")
                                .font(.system(size: 10))
                                .strikethrough()
                                .foregroundColor(MedMargTheme.slate500)
                        }
                    }

                    Spacer()

                    Button(action: {
                        cartItems.removeAll { $0.id == itm.id }
                    }) {
                        Image(systemName: "trash")
                            .font(.system(size: 13))
                            .foregroundColor(.red.opacity(0.8))
                            .padding(6)
                    }
                }
                .padding(12)
                .background(Color.white)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
            }
        }
    }

    // ==========================================
    // ➕ 4. QUICK ADD-ONS SECTION
    // ==========================================
    private var quickAddOnsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Frequently Added with These Tests")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(quickAddOns, id: \.code) { addon in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(addon.name)
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                                .lineLimit(1)

                            HStack(spacing: 4) {
                                Text("₹\(addon.price)")
                                    .font(.system(size: 12, weight: .black))
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                Text("₹\(addon.mrp)")
                                    .font(.system(size: 10))
                                    .strikethrough()
                                    .foregroundColor(MedMargTheme.slate500)
                            }

                            Button(action: {
                                cartItems.append(CartItem(
                                    id: addon.code,
                                    title: addon.name,
                                    subtitle: "\(addon.sample) • 24h TAT",
                                    provider: currentLabTotal.name,
                                    price: addon.price,
                                    mrp: addon.mrp,
                                    type: "Diagnostic Test"
                                ))
                            }) {
                                HStack(spacing: 2) {
                                    Image(systemName: "plus")
                                    Text("Add")
                                }
                                .font(.system(size: 10, weight: .bold))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 6)
                                .background(MedMargTheme.lightTeal)
                                .foregroundColor(MedMargTheme.primaryTeal)
                                .cornerRadius(6)
                            }
                        }
                        .frame(width: 140)
                        .padding(10)
                        .background(Color.white)
                        .cornerRadius(12)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
                    }
                }
            }
        }
    }

    // ==========================================
    // 💵 5. BILL SUMMARY CARD
    // ==========================================
    private var billSummaryCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Bill Details")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            VStack(spacing: 8) {
                HStack {
                    Text("Total Item MRP")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate500)
                    Spacer()
                    Text("₹\(currentLabTotal.totalMrp)")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate900)
                }

                HStack {
                    Text("MedMarg NABL Discount")
                        .font(.system(size: 12))
                        .foregroundColor(Color.green)
                    Spacer()
                    Text("-₹\(currentLabTotal.totalSavings)")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color.green)
                }

                HStack {
                    Text("Home Sample Collection")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate500)
                    Spacer()
                    Text("FREE")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color.green)
                }

                Divider()

                HStack {
                    Text("To Pay (\(currentLabTotal.name))")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Spacer()
                    Text("₹\(currentLabTotal.totalPrice)")
                        .font(.system(size: 18, weight: .black))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🚀 6. CHECKOUT CTA BUTTON
    // ==========================================
    private var checkoutCTAButton: some View {
        Button(action: {
            isOpen = false
            onProceedToCheckout()
        }) {
            HStack {
                VStack(alignment: .leading, spacing: 1) {
                    Text("₹\(currentLabTotal.totalPrice)")
                        .font(.system(size: 16, weight: .black))
                        .foregroundColor(.white)
                    Text("Selected: \(currentLabTotal.name)")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.emeraldLight)
                        .lineLimit(1)
                }

                Spacer()

                HStack(spacing: 6) {
                    Text("Proceed to Checkout")
                        .font(.system(size: 14, weight: .bold))
                    Image(systemName: "arrow.right")
                        .font(.system(size: 13, weight: .bold))
                }
                .foregroundColor(.white)
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 14)
            .background(MedMargTheme.primaryTeal)
            .cornerRadius(14)
            .shadow(color: MedMargTheme.primaryTeal.opacity(0.35), radius: 8, x: 0, y: 4)
        }
    }

    private var emptyCartView: some View {
        VStack(spacing: 16) {
            Image(systemName: "cart")
                .font(.system(size: 48))
                .foregroundColor(MedMargTheme.slate500)
                .padding(.top, 40)

            Text("Your Diagnostic Cart is Empty")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            Text("Add diagnostic tests, packages or profiles from the Tests tab to compare labs and book doorstep phlebotomy.")
                .font(.system(size: 12))
                .foregroundColor(MedMargTheme.slate500)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 20)

            Button(action: { isOpen = false }) {
                Text("Browse Diagnostic Tests")
                    .font(.system(size: 13, weight: .bold))
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(MedMargTheme.primaryTeal)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
        }
    }
}
