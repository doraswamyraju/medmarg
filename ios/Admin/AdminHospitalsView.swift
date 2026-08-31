import SwiftUI

struct HospitalPartner: Identifiable {
    let id: String
    let name: String
    let city: String
    let address: String
    let opdTokensDaily: Int
    let doctorsCount: Int
    let status: String
}

struct AdminHospitalsView: View {
    @State private var hospitals: [HospitalPartner] = [
        HospitalPartner(id: "HOSP-01", name: "SVIMS Super Specialty Hospital", city: "Tirupati", address: "Alipiri Rd, Tirupati", opdTokensDaily: 450, doctorsCount: 38, status: "ACTIVE"),
        HospitalPartner(id: "HOSP-02", name: "SVRR Government General Hospital", city: "Tirupati", address: "Renigunta Rd, Tirupati", opdTokensDaily: 620, doctorsCount: 52, status: "ACTIVE"),
        HospitalPartner(id: "HOSP-03", name: "Apollo Specialty Hospital Hub", city: "Tirupati", address: "Air Bypass Rd, Tirupati", opdTokensDaily: 280, doctorsCount: 24, status: "ACTIVE")
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Partner Hospitals & OPD Hubs")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Digital OPD Token Booking & Hospital Telemetry")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }
                Spacer()

                Button(action: {}) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                        Text("Add Hospital")
                    }
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(8)
                }
            }

            ForEach(hospitals) { hospital in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Image(systemName: "cross.case.fill")
                            .font(.system(size: 24))
                            .foregroundColor(MedMargTheme.primaryTeal)
                            .padding(8)
                            .background(MedMargTheme.lightTeal)
                            .cornerRadius(10)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(hospital.name)
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text(hospital.address)
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Text(hospital.status)
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.green)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.green.opacity(0.1))
                            .cornerRadius(6)
                    }

                    HStack(spacing: 16) {
                        Text("OPD Tokens/Day: \(hospital.opdTokensDaily)")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        Text("Doctors: \(hospital.doctorsCount)")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
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
