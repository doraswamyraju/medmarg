import SwiftUI

// =========================================================================
// 🎯 AGENT NEXT ASSIGNED PICKUP HERO CARD
// Redesigned to pixel-match reference Image 3:
// - Left: Time slot badge (clean time, AM/PM, Today/Tmrw)
// - Middle: Patient name, Address, Tests
//   Tags: [Doorstep Collection] (pink/red), [Prepaid / Doorstep QR] (blue)
// - Right: Distance & ETA pill (2.4 km ~ 8 mins), blue gradient "Start" button with play/paperplane icon
// - Clicking on the card or Start button triggers order details / visit tracking
// =========================================================================

struct AgentNextAssignedCard: View {
    let order: AgentPickupOrder
    let onStartTrip: () -> Void
    let onAssessKit: () -> Void
    let onOpenVisit: () -> Void
    let onDoorstepQr: () -> Void

    var body: some View {
        Button(action: onOpenVisit) {
            VStack(spacing: 12) {
                HStack(alignment: .top, spacing: 12) {
                    // 1. Time Slot Box
                    VStack(spacing: 2) {
                        Text(cleanSlotTime(order.slot))
                            .font(.system(size: 13, weight: .black))
                            .foregroundColor(MedMargTheme.slate900)
                            .lineLimit(1)
                        Text(order.slot?.contains("PM") == true ? "PM" : "AM")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.slate700)
                        Text(order.date?.contains("Tomorrow") == true ? "Tmrw" : "Today")
                            .font(.system(size: 9, weight: .medium))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .frame(width: 54, height: 62)
                    .background(Color(red: 0.94, green: 0.96, blue: 0.99))
                    .cornerRadius(12)

                    // 2. Patient Info, Address & Tests
                    VStack(alignment: .leading, spacing: 3) {
                        Text(order.effectivePatientName.capitalized)
                            .font(.system(size: 14, weight: .black))
                            .foregroundColor(MedMargTheme.slate900)
                            .lineLimit(1)

                        HStack(spacing: 4) {
                            Image(systemName: "mappin.circle.fill")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text(order.address ?? "Srinivas Nagar, Tirupati")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                                .lineLimit(1)
                        }

                        HStack(spacing: 4) {
                            Image(systemName: "testtube.2")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text(order.items ?? "Diagnostic Pathology Panel")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(MedMargTheme.slate700)
                                .lineLimit(1)
                        }

                        // Status Pills
                        HStack(spacing: 5) {
                            Text("Doorstep Collection")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(Color(red: 0.85, green: 0.25, blue: 0.25))
                                .padding(.horizontal, 5)
                                .padding(.vertical, 2)
                                .background(Color(red: 1.0, green: 0.92, blue: 0.92))
                                .cornerRadius(4)

                            Text(order.isPaid ? "Prepaid" : "Doorstep QR")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(Color.blue)
                                .padding(.horizontal, 5)
                                .padding(.vertical, 2)
                                .background(Color.blue.opacity(0.1))
                                .cornerRadius(4)
                        }
                        .padding(.top, 1)
                    }

                    Spacer(minLength: 0)

                    // 3. Right Action Column: ETA & Start Button
                    VStack(alignment: .trailing, spacing: 8) {
                        // Distance pill
                        HStack(spacing: 4) {
                            Image(systemName: "location.north.fill")
                                .font(.system(size: 10))
                                .foregroundColor(Color.blue)
                            VStack(alignment: .trailing, spacing: 1) {
                                Text("2.4 km")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)
                                Text("~ 8 mins")
                                    .font(.system(size: 9))
                                    .foregroundColor(MedMargTheme.slate500)
                            }
                            Image(systemName: "chevron.right")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        .padding(.horizontal, 6)
                        .padding(.vertical, 4)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(8)

                        // Start / Lifecycle Button (matching reference image "Start Trip")
                        Button(action: onOpenVisit) {
                            HStack(spacing: 4) {
                                Image(systemName: "play.fill")
                                    .font(.system(size: 11))
                                Text("Start")
                                    .font(.system(size: 12, weight: .bold))
                            }
                            .foregroundColor(.white)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(
                                LinearGradient(
                                    colors: [Color(red: 0.1, green: 0.5, blue: 1.0), Color(red: 0.0, green: 0.4, blue: 0.9)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .cornerRadius(10)
                            .shadow(color: Color.blue.opacity(0.3), radius: 4, y: 2)
                        }
                    }
                }
            }
            .padding(14)
            .background(Color.white)
            .cornerRadius(18)
            .overlay(
                RoundedRectangle(cornerRadius: 18)
                    .stroke(MedMargTheme.slate200, lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 3)
            .padding(.horizontal, 16)
        }
        .buttonStyle(PlainButtonStyle())
    }

    private func cleanSlotTime(_ slot: String?) -> String {
        guard let s = slot, !s.isEmpty else { return "10:30" }
        let parts = s.components(separatedBy: CharacterSet.whitespacesAndNewlines)
        for p in parts {
            if p.contains(":") {
                return p
            }
        }
        return parts.first ?? "10:30"
    }
}
