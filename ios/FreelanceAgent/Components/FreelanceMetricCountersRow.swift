import SwiftUI

// =========================================================================
// ⚡ FREELANCE AGENT METRIC COUNTERS ROW
// Replaces salaried quota counters with live gig earnings & active overflow stats
// =========================================================================

struct FreelanceMetricCountersRow: View {
    let todayEarnings: Int
    let activeGigsCount: Int
    let completedCount: Int
    let ratingScore: String
    let onSelectMetric: (Int) -> Void // Tab callback: 3 for Wallet, 7 for Orders, 4 for Profile

    var body: some View {
        HStack(spacing: 8) {
            // Card 1: Today's Gig Earnings (Green accent, taps to Wallet)
            Button(action: { onSelectMetric(3) }) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 4) {
                        Image(systemName: "indianrupeesign.circle.fill")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.accentEmerald)
                        Text("Today's Gig")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                        Spacer(minLength: 0)
                        Circle()
                            .fill(MedMargTheme.accentEmerald)
                            .frame(width: 5, height: 5)
                    }

                    Text("₹\(todayEarnings)")
                        .font(.system(size: 16, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                        .minimumScaleFactor(0.8)
                        .lineLimit(1)

                    HStack(spacing: 2) {
                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 8, weight: .bold))
                        Text("Live Wallet")
                            .font(.system(size: 9, weight: .bold))
                    }
                    .foregroundColor(MedMargTheme.accentEmerald)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.white)
                .cornerRadius(14)
                .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
            }
            .buttonStyle(PlainButtonStyle())

            // Card 2: Active Pickups / Gigs (Blue accent, taps to Orders)
            Button(action: { onSelectMetric(7) }) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 4) {
                        Image(systemName: "bicycle")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(Color.blue)
                        Text("Active Gigs")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                        Spacer(minLength: 0)
                    }

                    Text("\(activeGigsCount)")
                        .font(.system(size: 16, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)

                    Text(activeGigsCount == 0 ? "Open for Gigs" : "In Progress")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(activeGigsCount > 0 ? Color.blue : MedMargTheme.slate500)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.white)
                .cornerRadius(14)
                .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
            }
            .buttonStyle(PlainButtonStyle())

            // Card 3: Completed Gigs Today (Teal accent, taps to Orders)
            Button(action: { onSelectMetric(7) }) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 4) {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                        Text("Completed")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                        Spacer(minLength: 0)
                    }

                    Text("\(completedCount)")
                        .font(.system(size: 16, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("Samples Done")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.white)
                .cornerRadius(14)
                .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
            }
            .buttonStyle(PlainButtonStyle())

            // Card 4: Partner Rating / Paramedical Status (Orange accent, taps to Profile)
            Button(action: { onSelectMetric(4) }) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(Color.orange)
                        Text("Rating")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                        Spacer(minLength: 0)
                    }

                    Text(ratingScore.isEmpty ? "5.0 ★" : ratingScore)
                        .font(.system(size: 16, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                        .lineLimit(1)

                    Text("Verified MLT")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(Color.orange)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.white)
                .cornerRadius(14)
                .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
            }
            .buttonStyle(PlainButtonStyle())
        }
        .padding(.horizontal, 16)
    }
}

