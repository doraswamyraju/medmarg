import SwiftUI

// =========================================================================
// 🎯 AGENT NEXT ASSIGNED PICKUP HERO CARD
// Redesigned to pixel-match reference Image 3:
// - Left: 10:30 AM slot badge (rounded gray square with time & "Today")
// - Middle: Ramesh Kumar, 34 yrs • Male, Address, Full Body Checkup (12 Tests)
//   Tags: [Doorstep Collection] (red/pink pill), [Prepaid] (blue pill)
// - Right: Distance & ETA pill (2.4 km ~ 8 mins), blue gradient "Start Trip" button with airplane icon
// =========================================================================

struct AgentNextAssignedCard: View {
    let order: AgentPickupOrder
    let onStartTrip: () -> Void
    let onAssessKit: () -> Void
    let onOpenVisit: () -> Void
    let onDoorstepQr: () -> Void

    var body: some View {
        VStack(spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                // 1. Time Slot Box (rounded gray/blue container)
                VStack(spacing: 2) {
                    Text(order.slot?.components(separatedBy: " ").first ?? "10:30")
                        .font(.system(size: 15, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)
                    Text(order.slot?.components(separatedBy: " ").dropFirst().first ?? "AM")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Today")
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(MedMargTheme.slate500)
                }
                .frame(width: 58, height: 64)
                .background(Color(red: 0.94, green: 0.96, blue: 0.99))
                .cornerRadius(12)

                // 2. Patient Info, Address & Tests
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(order.effectivePatientName)
                            .font(.system(size: 15, weight: .black))
                            .foregroundColor(MedMargTheme.slate900)

                        Text("• 34 yrs • Male")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(MedMargTheme.slate500)
                    }

                    HStack(spacing: 4) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.primaryTeal)
                        Text(order.address ?? "Srinivas Nagar, Tirupati")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                            .lineLimit(1)
                    }

                    HStack(spacing: 4) {
                        Image(systemName: "testtube.2")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.primaryTeal)
                        Text(order.items ?? "Full Body Checkup (12 Tests)")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(MedMargTheme.slate700)
                            .lineLimit(1)
                    }

                    // Pills: [Doorstep Collection] [Prepaid]
                    HStack(spacing: 6) {
                        Text("Doorstep Collection")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(Color(red: 0.85, green: 0.25, blue: 0.25))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color(red: 1.0, green: 0.92, blue: 0.92))
                            .cornerRadius(4)

                        Text(order.isPaid ? "Prepaid" : "Doorstep QR")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(Color.blue)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(4)
                    }
                    .padding(.top, 2)
                }

                Spacer(minLength: 0)

                // 3. Right Action Column: ETA & Start Trip Button
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

                    // Start Trip / Lifecycle Action Button
                    if order.status == "BOOKED" || order.status == "ASSIGNED" {
                        Button(action: onAssessKit) {
                            HStack(spacing: 4) {
                                Image(systemName: "archivebox.fill")
                                    .font(.system(size: 11))
                                Text("Assess Kit")
                                    .font(.system(size: 12, weight: .bold))
                            }
                            .foregroundColor(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(MedMargTheme.primaryTeal)
                            .cornerRadius(10)
                        }
                    } else if order.status == "KIT_ASSIGNED" {
                        Button(action: onStartTrip) {
                            HStack(spacing: 4) {
                                Image(systemName: "paperplane.fill")
                                    .font(.system(size: 11))
                                Text("Start Trip")
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
                    } else {
                        Button(action: onOpenVisit) {
                            HStack(spacing: 4) {
                                Image(systemName: order.status == "COMPLETED" ? "checkmark" : "play.fill")
                                    .font(.system(size: 10))
                                Text(order.status == "COMPLETED" ? "Summary" : "Visit")
                                    .font(.system(size: 12, weight: .bold))
                            }
                            .foregroundColor(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(order.status == "COMPLETED" ? Color.green : MedMargTheme.primaryTeal)
                            .cornerRadius(10)
                        }
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
}
