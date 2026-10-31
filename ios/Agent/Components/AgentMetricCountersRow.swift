import SwiftUI

// =========================================================================
// 📊 AGENT METRIC COUNTERS (SINGLE HORIZONTAL SCROLLABLE ROW)
// 100% Live Telemetry - STRICTLY ZERO DUMMY/SAMPLE/HARDCODED DATA
// Tappable cards:
// 1. Today's Collections (₹) -> opens Payments ledger
// 2. Assigned Orders -> opens Orders tab
// 3. Completed (Daily Quota) -> opens Shift Targets / Quota
// 4. On-Time Rate (%) -> opens Performance / Reports
// =========================================================================

struct AgentMetricCountersRow: View {
    let todayEarnings: Int
    let assignedCount: Int
    let completedCount: Int
    let totalTarget: Int
    let onTimePercentage: Int
    var onSelectMetric: (Int) -> Void = { _ in }

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                // 1. Today's Collections (Tapping navigates to Payments tab 3)
                Button(action: { onSelectMetric(3) }) {
                    metricCard(
                        title: "Today's Collections",
                        value: "₹\(todayEarnings.formatted())",
                        trendText: todayEarnings > 0 ? "Live" : "No visits closed",
                        trendSub: "",
                        icon: "testtube.2",
                        accentColor: MedMargTheme.primaryTeal,
                        hasProgressBar: false
                    )
                }
                .buttonStyle(PlainButtonStyle())

                // 2. Assigned Orders (Tapping navigates to Orders tab 7)
                Button(action: { onSelectMetric(7) }) {
                    metricCard(
                        title: "Assigned Orders",
                        value: "\(assignedCount)",
                        trendText: "\(max(0, assignedCount - completedCount)) Pending",
                        trendSub: "",
                        icon: "doc.text.fill",
                        accentColor: Color(red: 0.2, green: 0.5, blue: 0.95),
                        hasProgressBar: false
                    )
                }
                .buttonStyle(PlainButtonStyle())

                // 3. Completed Quota (Tapping navigates to Shift Quota tab 2)
                Button(action: { onSelectMetric(2) }) {
                    metricCard(
                        title: "Completed",
                        value: "\(completedCount) / \(max(1, totalTarget))",
                        trendText: "Daily Quota",
                        trendSub: "",
                        icon: "checkmark.circle.fill",
                        accentColor: Color.orange,
                        hasProgressBar: true
                    )
                }
                .buttonStyle(PlainButtonStyle())

                // 4. On-Time Rate (Tapping navigates to Reports tab 4)
                Button(action: { onSelectMetric(4) }) {
                    metricCard(
                        title: "On-Time Rate",
                        value: "\(onTimePercentage)%",
                        trendText: onTimePercentage >= 90 ? "Excellent" : "Standard",
                        trendSub: "",
                        icon: "clock.fill",
                        accentColor: Color(red: 0.55, green: 0.35, blue: 0.85),
                        hasProgressBar: false
                    )
                }
                .buttonStyle(PlainButtonStyle())
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 4)
        }
    }

    private func metricCard(
        title: String,
        value: String,
        trendText: String,
        trendSub: String,
        icon: String,
        accentColor: Color,
        hasProgressBar: Bool = false
    ) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            // Icon Square
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(accentColor.opacity(0.12))
                    .frame(width: 28, height: 28)
                Image(systemName: icon)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(accentColor)
            }

            Text(title)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(MedMargTheme.slate500)
                .lineLimit(1)

            HStack {
                Text(value)
                    .font(.system(size: 18, weight: .black, design: .rounded))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.slate500)
            }

            if hasProgressBar {
                // Live Progress bar
                GeometryReader { g in
                    ZStack(alignment: .leading) {
                        Capsule()
                            .fill(MedMargTheme.slate200)
                            .frame(height: 5)
                        Capsule()
                            .fill(accentColor)
                            .frame(width: g.size.width * CGFloat(min(1.0, Double(completedCount) / Double(max(1, totalTarget)))), height: 5)
                    }
                }
                .frame(height: 5)
                .padding(.top, 2)
            }

            if !trendText.isEmpty {
                HStack(spacing: 4) {
                    if title == "On-Time Rate" {
                        Circle()
                            .fill(accentColor)
                            .frame(width: 5, height: 5)
                    } else if title == "Today's Collections" && todayEarnings > 0 {
                        Image(systemName: "arrow.up")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundColor(accentColor)
                    }

                    Text(trendText)
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(accentColor)

                    if !trendSub.isEmpty {
                        Text(trendSub)
                            .font(.system(size: 9))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }
            }
        }
        .padding(12)
        .frame(width: 145, alignment: .leading)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
    }
}
