import SwiftUI

// =========================================================================
// 📊 AGENT METRIC COUNTERS (SINGLE HORIZONTAL SCROLLABLE ROW)
// Shows: Today's Collection (₹), Assigned Pickups, Completed Quota, On-Time %
// =========================================================================

struct AgentMetricCountersRow: View {
    let todayEarnings: Int
    let assignedCount: Int
    let completedCount: Int
    let totalTarget: Int
    let onTimePercentage: Int

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                // 1. Today's Collected Cash / UPI
                metricCard(
                    title: "COLLECTED TODAY",
                    value: "₹\(todayEarnings.formatted())",
                    caption: "Doorstep & Prepaid",
                    icon: "indianrupeesign.circle.fill",
                    accentColor: MedMargTheme.primaryTeal,
                    bgColor: MedMargTheme.lightTeal.opacity(0.4)
                )

                // 2. Assigned Field Orders
                metricCard(
                    title: "ASSIGNED PICKUPS",
                    value: "\(assignedCount)",
                    caption: "\(completedCount) completed",
                    icon: "bicycle.circle.fill",
                    accentColor: Color.blue,
                    bgColor: Color.blue.opacity(0.08)
                )

                // 3. Daily Shift Quota
                metricCard(
                    title: "SHIFT QUOTA",
                    value: "\(completedCount)/\(totalTarget)",
                    caption: "\(max(0, totalTarget - completedCount)) remaining",
                    icon: "target",
                    accentColor: Color.orange,
                    bgColor: Color.orange.opacity(0.08)
                )

                // 4. On-Time SLA Rate
                metricCard(
                    title: "ON-TIME SLA",
                    value: "\(onTimePercentage)%",
                    caption: "Field Reliability",
                    icon: "checkmark.seal.fill",
                    accentColor: MedMargTheme.accentEmerald,
                    bgColor: MedMargTheme.accentEmerald.opacity(0.08)
                )
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 4)
        }
    }

    private func metricCard(
        title: String,
        value: String,
        caption: String,
        icon: String,
        accentColor: Color,
        bgColor: Color
    ) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(accentColor)
                Text(title)
                    .font(.system(size: 9, weight: .black))
                    .foregroundColor(MedMargTheme.slate500)
                    .tracking(0.5)
            }

            Text(value)
                .font(.system(size: 20, weight: .black, design: .rounded))
                .foregroundColor(MedMargTheme.slate900)

            Text(caption)
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(accentColor)
        }
        .padding(12)
        .frame(minWidth: 140, alignment: .leading)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(MedMargTheme.slate200, lineWidth: 1)
        )
        .shadow(color: Color.black.opacity(0.02), radius: 3, x: 0, y: 1)
    }
}

