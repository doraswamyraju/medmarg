import SwiftUI

struct AdminFleetView: View {
    @Binding var fleetAgents: [FleetAgentStatus]

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Field Collection Fleet & Cold-Chain Telemetry")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            ForEach(fleetAgents) { agent in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(agent.name) (\(agent.id))")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Assigned Zone: \(agent.area)")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Text(agent.temp)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.darkTeal)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(MedMargTheme.emeraldLight)
                            .cornerRadius(6)
                    }

                    HStack(spacing: 16) {
                        Text("Samples Today: \(agent.samplesToday)")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        Text("IOT Battery: \(agent.battery)")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)

                        Spacer()

                        Text(agent.status)
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.slate700)
                    }
                }
                .padding(14)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(12)
            }
        }
    }
}
