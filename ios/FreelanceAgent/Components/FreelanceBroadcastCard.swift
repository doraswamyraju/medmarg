import SwiftUI

// =========================================================================
// ⚡ FREELANCE BROADCAST CARD
// Standalone card displaying an unassigned overflow gig from central dispatch
// "First to claim gets assigned"
// =========================================================================

struct FreelanceBroadcastJobItem: Identifiable, Codable, Equatable {
    let id: String
    var patientName: String?
    var age: String?
    var timeSlot: String?
    var address: String?
    var phone: String?
    var tests: String?
    var tubes: [String]?
    var payout: Int?
    var distance: String?
    var fastingRequired: Bool?
    var urgency: String?

    var effectivePayout: Int {
        payout ?? 350
    }
}

struct FreelanceBroadcastCard: View {
    let job: FreelanceBroadcastJobItem
    let isClaiming: Bool
    let onClaim: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Top Row: Urgency, Fasting Tag, Distance
            HStack(spacing: 6) {
                // Urgency Chip
                if (job.urgency ?? "").uppercased().contains("HIGH") {
                    HStack(spacing: 3) {
                        Image(systemName: "flame.fill")
                        Text("HIGH PRIORITY")
                    }
                    .font(.system(size: 9, weight: .black))
                    .foregroundColor(Color.red)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(Color.red.opacity(0.12))
                    .cornerRadius(6)
                }

                // Fasting Requirement Tag
                if job.fastingRequired == true {
                    HStack(spacing: 3) {
                        Image(systemName: "drop.fill")
                        Text("FASTING (10-12 HRS)")
                    }
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(Color.orange)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(Color.orange.opacity(0.12))
                    .cornerRadius(6)
                }

                Spacer()

                // Distance Badge
                HStack(spacing: 3) {
                    Image(systemName: "location.fill")
                        .font(.system(size: 9))
                    Text(job.distance ?? "2.5 km")
                        .font(.system(size: 11, weight: .bold))
                }
                .foregroundColor(MedMargTheme.primaryTeal)
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .background(MedMargTheme.lightTeal)
                .cornerRadius(6)
            }

            // Patient Name, Age & Area
            VStack(alignment: .leading, spacing: 3) {
                HStack(alignment: .firstTextBaseline) {
                    Text(job.patientName ?? "Patient")
                        .font(.system(size: 16, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)

                    if let age = job.age {
                        Text(age)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    Spacer()

                    // Time Slot
                    HStack(spacing: 3) {
                        Image(systemName: "clock")
                            .font(.system(size: 10))
                        Text(job.timeSlot ?? "Today")
                            .font(.system(size: 11, weight: .semibold))
                    }
                    .foregroundColor(MedMargTheme.slate600)
                }

                HStack(spacing: 4) {
                    Image(systemName: "mappin.and.ellipse")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate400)
                    Text(job.address ?? "Tirupati Doorstep")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate600)
                        .lineLimit(1)
                }
            }

            // Diagnostic Tests & Tube Pills
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 4) {
                    Image(systemName: "cross.case.fill")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text(job.tests ?? "Diagnostic Collection")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate800)
                        .lineLimit(1)
                }

                // Vacutainer Tubes
                if let tubes = job.tubes, !tubes.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 6) {
                            ForEach(tubes, id: \.self) { tube in
                                HStack(spacing: 4) {
                                    Circle()
                                        .fill(tubeColor(for: tube))
                                        .frame(width: 7, height: 7)
                                    Text(tube)
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundColor(MedMargTheme.slate700)
                                }
                                .padding(.horizontal, 7)
                                .padding(.vertical, 3)
                                .background(MedMargTheme.slate100)
                                .cornerRadius(6)
                            }
                        }
                    }
                }
            }

            Divider()

            // Footer: Payout Pill & Claim Button
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 1) {
                    Text("Guaranteed Payout")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(MedMargTheme.slate500)
                    HStack(spacing: 2) {
                        Text("₹\(job.effectivePayout)")
                            .font(.system(size: 20, weight: .black))
                            .foregroundColor(MedMargTheme.accentEmerald)
                        Text("+ Tips & Bonus")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.slate400)
                    }
                }

                Spacer()

                Button(action: onClaim) {
                    HStack(spacing: 6) {
                        if isClaiming {
                            ProgressView()
                                .tint(.white)
                                .scaleEffect(0.8)
                        } else {
                            Image(systemName: "bolt.fill")
                                .font(.system(size: 12, weight: .black))
                            Text("⚡ Claim Job")
                                .font(.system(size: 13, weight: .bold))
                        }
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(
                        LinearGradient(
                            colors: [MedMargTheme.accentEmerald, Color(red: 0.0, green: 0.58, blue: 0.40)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(10)
                    .shadow(color: MedMargTheme.accentEmerald.opacity(0.3), radius: 6, x: 0, y: 3)
                }
                .disabled(isClaiming)
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(job.urgency?.contains("HIGH") == true ? Color.red.opacity(0.3) : MedMargTheme.slate200, lineWidth: 1)
        )
        .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 2)
    }

    private func tubeColor(for name: String) -> Color {
        let n = name.lowercased()
        if n.contains("yellow") || n.contains("sst") || n.contains("gold") {
            return Color.yellow
        } else if n.contains("lavender") || n.contains("purple") || n.contains("edta") {
            return Color.purple
        } else if n.contains("grey") || n.contains("gray") || n.contains("sugar") || n.contains("fluoride") {
            return Color.gray
        } else if n.contains("green") || n.contains("heparin") {
            return Color.green
        } else if n.contains("blue") || n.contains("citrate") {
            return Color.blue
        }
        return MedMargTheme.primaryTeal
    }
}

