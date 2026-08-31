import SwiftUI

struct AdminLabsView: View {
    @Binding var labPartners: [LabPartner]
    @Binding var pendingLabRequests: [LabRequest]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Active Labs
            Text("Active NABL Diagnostic Lab Partners")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            ForEach(labPartners) { lab in
                HStack(spacing: 12) {
                    Image(systemName: "building.2.crop.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(lab.name)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("\(lab.type) • \(lab.city)")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                        Text("Accreditation: \(lab.nabl) • Commission Margin: \(lab.margin)")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }

                    Spacer()
                }
                .padding(14)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(12)
            }

            // Onboarding Requests
            Text("Pending Onboarding Applications (\(pendingLabRequests.count))")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            ForEach(pendingLabRequests) { req in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(req.name)
                                .font(.system(size: 14, weight: .bold))
                            Text("Applicant: \(req.applicant) • \(req.city)")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        Spacer()
                        Text("UNDER REVIEW")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.orange)
                            .padding(4)
                            .background(Color.orange.opacity(0.1))
                            .cornerRadius(4)
                    }

                    HStack {
                        Button(action: {
                            labPartners.append(LabPartner(id: req.id, name: req.name, type: "Approved Partner Lab", city: req.city, nabl: req.license, status: "ACTIVE", margin: "15%", testsCount: req.testsOffered))
                            pendingLabRequests.removeAll(where: { $0.id == req.id })
                        }) {
                            Text("Approve & Onboard")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.green)
                                .cornerRadius(6)
                        }

                        Button(action: {
                            pendingLabRequests.removeAll(where: { $0.id == req.id })
                        }) {
                            Text("Reject Application")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.red)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.red.opacity(0.1))
                                .cornerRadius(6)
                        }
                    }
                }
                .padding(14)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(12)
            }
        }
    }
}
