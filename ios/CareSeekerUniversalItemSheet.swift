import SwiftUI

// =========================================================================
// 🔬 CARE SEEKER UNIVERSAL TEST/PACKAGE DETAIL SHEET
// 100% Feature Parity with Web CareSeekerUniversalItemSheet.jsx
// =========================================================================

struct CareSeekerUniversalItemSheet: View {
    let item: CatalogItem?
    @Binding var isOpen: Bool
    let onAddToCart: (CatalogItem) -> Void
    let isInCart: Bool

    var body: some View {
        NavigationStack {
            if let item = item {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        
                        // Header Box
                        headerBox(item: item)

                        // Quick Specifications Grid
                        specsGrid(item: item)

                        // Multi-Lab Pricing Table
                        multiLabPricingTable(item: item)

                        // Clinical Biomarkers Description
                        biomarkersDescriptionSection(item: item)

                        // Bottom Add to Cart CTA
                        bottomCTAButton(item: item)

                        Spacer().frame(height: 30)
                    }
                    .padding(16)
                }
                .background(MedMargTheme.slate50)
                .navigationTitle(item.code)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Close") { isOpen = false }
                    }
                }
            } else {
                EmptyView()
            }
        }
    }

    private func headerBox(item: CatalogItem) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                Text(item.itemType ?? "DIAGNOSTIC TEST")
                    .font(.system(size: 9, weight: .black))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(MedMargTheme.amberLight)
                    .foregroundColor(MedMargTheme.amberGold)
                    .cornerRadius(4)

                Text("CODE: \(item.code)")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundColor(MedMargTheme.lightTeal)
            }

            Text(item.name)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(3)

            Text("100% NABL Accredited Pathology Processing • Free Home Phlebotomy")
                .font(.system(size: 11))
                .foregroundColor(MedMargTheme.emeraldLight)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [MedMargTheme.darkTeal, Color(red: 0.0, green: 0.35, blue: 0.32)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(18)
    }

    private func specsGrid(item: CatalogItem) -> some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
            specItem(title: "SPECIMEN TUBE", value: item.sampleType ?? "SERUM (Gold SST)", icon: "drop.fill", color: .red)
            specItem(
                title: "FASTING REQUIREMENT",
                value: (item.fasting == "YES") ? "10-12 Hrs Fasting" : "No Fasting Required",
                icon: "clock.fill",
                color: (item.fasting == "YES") ? .orange : .green
            )
            specItem(title: "REPORT TURNAROUND", value: "\(item.tatHours ?? 24) Hours TAT", icon: "bolt.fill", color: MedMargTheme.primaryTeal)
            specItem(title: "BIOMARKERS", value: "\(item.testCount ?? 1) Parameters", icon: "waveform.path.ecg", color: .blue)
        }
    }

    private func specItem(title: String, value: String, icon: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 10))
                    .foregroundColor(color)
                Text(title)
                    .font(.system(size: 8, weight: .black))
                    .foregroundColor(MedMargTheme.slate500)
            }
            Text(value)
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)
                .lineLimit(2)
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .cornerRadius(10)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    private func multiLabPricingTable(item: CatalogItem) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Laboratory Processing Options")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            VStack(spacing: 8) {
                labPriceRow(labName: "MedMarg Direct (Best Value)", price: item.price, mrp: item.mrp > 0 ? item.mrp : Int(Double(item.price) * 1.6), badge: "SUGGESTED")
                labPriceRow(labName: "Thyrocare Technologies", price: Int(Double(item.price) * 1.05), mrp: item.mrp > 0 ? item.mrp : Int(Double(item.price) * 1.6), badge: "NABL")
                labPriceRow(labName: "Dr. Lal PathLabs", price: Int(Double(item.price) * 1.15), mrp: item.mrp > 0 ? item.mrp : Int(Double(item.price) * 1.6), badge: "PREMIUM")
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    private func labPriceRow(labName: String, price: Int, mrp: Int, badge: String) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(labName)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text(badge)
                        .font(.system(size: 8, weight: .black))
                        .padding(.horizontal, 4)
                        .padding(.vertical, 2)
                        .background(MedMargTheme.lightTeal)
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .cornerRadius(4)
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 1) {
                Text("₹\(price)")
                    .font(.system(size: 13, weight: .black))
                    .foregroundColor(MedMargTheme.primaryTeal)
                Text("₹\(mrp)")
                    .font(.system(size: 10))
                    .strikethrough()
                    .foregroundColor(MedMargTheme.slate500)
            }
        }
        .padding(8)
        .background(MedMargTheme.slate50)
        .cornerRadius(8)
    }

    private func biomarkersDescriptionSection(item: CatalogItem) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Clinical Information & Parameters")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            if let desc = item.description, !desc.isEmpty {
                Text(desc)
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate700)
                    .lineSpacing(3)
            } else {
                Text("Comprehensive pathology evaluation processed in NABL accredited ISO 15189 certified diagnostic hub with double doctor verification.")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate700)
            }

            if let tests = item.tests, !tests.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Included Tests & Biomarkers:")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    ForEach(tests, id: \.self) { t in
                        HStack(spacing: 6) {
                            Circle()
                                .fill(MedMargTheme.primaryTeal)
                                .frame(width: 5, height: 5)
                            Text(t)
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate700)
                        }
                    }
                }
                .padding(.top, 4)
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    private func bottomCTAButton(item: CatalogItem) -> some View {
        Button(action: {
            onAddToCart(item)
            isOpen = false
        }) {
            HStack {
                VStack(alignment: .leading, spacing: 1) {
                    Text("Starts from ₹\(item.price)")
                        .font(.system(size: 15, weight: .black))
                        .foregroundColor(.white)
                    Text("Free Home Phlebotomy")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.emeraldLight)
                }

                Spacer()

                HStack(spacing: 6) {
                    Image(systemName: isInCart ? "checkmark.circle.fill" : "plus.circle.fill")
                    Text(isInCart ? "In Cart" : "Add to Cart")
                        .font(.system(size: 14, weight: .bold))
                }
                .foregroundColor(.white)
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 14)
            .background(isInCart ? Color.green : MedMargTheme.primaryTeal)
            .cornerRadius(14)
            .shadow(color: MedMargTheme.primaryTeal.opacity(0.35), radius: 8, x: 0, y: 4)
        }
    }
}
