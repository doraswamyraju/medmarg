import SwiftUI

struct AdminOverviewView: View {
    var body: some View {
        VStack(spacing: 16) {
            // Live Status Banner
            HStack {
                HStack(spacing: 8) {
                    Circle().fill(Color.green).frame(width: 10, height: 10)
                    Text("Central Processing Hub Online")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.darkTeal)
                }
                Spacer()
                Text("NABL Sync Active")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }
            .padding(12)
            .background(MedMargTheme.lightTeal)
            .cornerRadius(10)

            // Metrics 2x2 Grid
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                adminMetricCard(title: "Revenue Today", value: "₹4,82,500", trend: "+14.2% vs yesterday", icon: "indianrupeesign.circle.fill", color: Color.green)
                adminMetricCard(title: "Lab Bookings", value: "1,420 Orders", trend: "104 Full Checkups", icon: "doc.plaintext.fill", color: Color.blue)
                adminMetricCard(title: "NABL Labs", value: "14 Partners", trend: "100% Compliant", icon: "building.2.fill", color: Color.purple)
                adminMetricCard(title: "On-Duty Fleet", value: "32 Agents", trend: "Avg Temp: 4.2°C", icon: "truck.box.fill", color: Color.orange)
            }

            // Platform Activity Stream
            VStack(alignment: .leading, spacing: 12) {
                Text("Recent System Activity")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                adminActivityRow(icon: "checkmark.circle.fill", color: .green, title: "Thyrocare Price Sync Completed", subtitle: "104 test parameters updated across Tirupati hub", time: "10 mins ago")
                adminActivityRow(icon: "person.crop.circle.badge.plus", color: .blue, title: "New Doctor Onboarded", subtitle: "Dr. Ananya Sharma MD verified for OPD token booking", time: "25 mins ago")
                adminActivityRow(icon: "building.badge.gearshape.fill", color: .purple, title: "Lab Onboarding Requested", subtitle: "Star Diagnostics submitted NABL license for review", time: "1 hour ago")
            }
            .padding(14)
            .background(MedMargTheme.pureWhite)
            .cornerRadius(12)
        }
    }

    private func adminMetricCard(title: String, value: String, trend: String, icon: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
                Spacer()
            }

            Text(value)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            Text(title)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(MedMargTheme.slate500)

            Text(trend)
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(color)
        }
        .padding(14)
        .background(MedMargTheme.pureWhite)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 2)
    }

    private func adminActivityRow(icon: String, color: Color, title: String, subtitle: String, time: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(color)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Text(subtitle)
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
            }

            Spacer()

            Text(time)
                .font(.system(size: 10))
                .foregroundColor(MedMargTheme.slate500)
        }
        .padding(.vertical, 6)
    }
}
