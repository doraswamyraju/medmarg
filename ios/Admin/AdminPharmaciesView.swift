import SwiftUI

struct PharmacyPartner: Identifiable {
    let id: String
    let name: String
    let city: String
    let address: String
    let license: String
    let ordersFulfilled: Int
    let status: String
}

struct AdminPharmaciesView: View {
    @State private var pharmacies: [PharmacyPartner] = [
        PharmacyPartner(id: "PHARM-01", name: "MedMarg Generic Chemist Hub", city: "Tirupati", address: "Air Bypass Rd, Tirupati", license: "AP-DRUG-2026-88", ordersFulfilled: 1240, status: "ACTIVE"),
        PharmacyPartner(id: "PHARM-02", name: "Apollo Pharmacy Partner Outlet", city: "Tirupati", address: "Renigunta Rd, Tirupati", license: "AP-DRUG-2026-44", ordersFulfilled: 890, status: "ACTIVE"),
        PharmacyPartner(id: "PHARM-03", name: "Srinivasa Generic Medical Store", city: "Tirupati", address: "Alipiri, Tirupati", license: "AP-DRUG-2026-12", ordersFulfilled: 650, status: "ACTIVE")
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Generic Chemist & Pharmacy Outlets")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Prescription Order Dispatch & Drug License Governance")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }
                Spacer()

                Button(action: {}) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                        Text("Add Pharmacy")
                    }
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(8)
                }
            }

            ForEach(pharmacies) { pharmacy in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Image(systemName: "pills.fill")
                            .font(.system(size: 24))
                            .foregroundColor(MedMargTheme.primaryTeal)
                            .padding(8)
                            .background(MedMargTheme.lightTeal)
                            .cornerRadius(10)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(pharmacy.name)
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("\(pharmacy.address) • Drug Lic: \(pharmacy.license)")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Text(pharmacy.status)
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.green)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.green.opacity(0.1))
                            .cornerRadius(6)
                    }

                    HStack(spacing: 16) {
                        Text("Orders Fulfilled: \(pharmacy.ordersFulfilled)")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(MedMargTheme.primaryTeal)
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
