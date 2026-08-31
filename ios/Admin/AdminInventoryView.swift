import SwiftUI

struct InventoryItem: Identifiable {
    let id: String
    let name: String
    let category: String
    let currentQty: Int
    let minThreshold: Int
    let unitPrice: Int
    let status: String
}

struct AdminInventoryView: View {
    @State private var inventory: [InventoryItem] = [
        InventoryItem(id: "INV-01", name: "BD Vacutainer EDTA K2 Tubes (Purple Cap)", category: "Phlebotomy Consumables", currentQty: 1450, minThreshold: 300, unitPrice: 12, status: "IN_STOCK"),
        InventoryItem(id: "INV-02", name: "BCT Serum Gel Separator Tubes (Yellow Cap)", category: "Phlebotomy Consumables", currentQty: 980, minThreshold: 250, unitPrice: 15, status: "IN_STOCK"),
        InventoryItem(id: "INV-03", name: "Cold-Chain Gel Ice Packs (500g)", category: "Cold-Chain Storage", currentQty: 320, minThreshold: 100, unitPrice: 45, status: "IN_STOCK"),
        InventoryItem(id: "INV-04", name: "Sterile Butterfly Needles 23G", category: "Phlebotomy Consumables", currentQty: 85, minThreshold: 150, unitPrice: 18, status: "LOW_STOCK")
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Medical Inventory & Phlebotomist Supplies")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Central Warehouse Consumables & Reagent Stock Telemetry")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }
                Spacer()

                Button(action: {}) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                        Text("Add Stock")
                    }
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(8)
                }
            }

            ForEach(inventory) { item in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Image(systemName: "box.truck.fill")
                            .font(.system(size: 24))
                            .foregroundColor(item.status == "LOW_STOCK" ? .orange : MedMargTheme.primaryTeal)
                            .padding(8)
                            .background(item.status == "LOW_STOCK" ? Color.orange.opacity(0.1) : MedMargTheme.lightTeal)
                            .cornerRadius(10)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.name)
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text(item.category)
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Text(item.status == "LOW_STOCK" ? "LOW STOCK" : "IN STOCK")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(item.status == "LOW_STOCK" ? .orange : .green)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(item.status == "LOW_STOCK" ? Color.orange.opacity(0.1) : Color.green.opacity(0.1))
                            .cornerRadius(6)
                    }

                    HStack(spacing: 16) {
                        Text("Current Stock: \(item.currentQty)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(item.currentQty <= item.minThreshold ? .orange : MedMargTheme.primaryTeal)

                        Text("Min Threshold: \(item.minThreshold)")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)

                        Spacer()

                        Text("₹\(item.unitPrice)/unit")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(MedMargTheme.slate700)
                    }
                }
                .padding(14)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(12)
                .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 2)
            }
        }
    }
}
