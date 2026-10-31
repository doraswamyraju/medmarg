import SwiftUI

// =========================================================================
// 🎯 AGENT NEXT ASSIGNED PICKUP HERO CARD
// Primary call-to-action for the next immediate patient collection visit
// =========================================================================

struct AgentNextAssignedCard: View {
    let order: AgentPickupOrder
    let onStartTrip: () -> Void
    let onAssessKit: () -> Void
    let onOpenVisit: () -> Void
    let onDoorstepQr: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            // Header: Top priority badge & Slot
            HStack {
                HStack(spacing: 5) {
                    Circle()
                        .fill(statusColor(for: order.status ?? ""))
                        .frame(width: 8, height: 8)
                    Text(order.status ?? "ASSIGNED")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(statusColor(for: order.status ?? ""))
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(statusColor(for: order.status ?? "").opacity(0.12))
                .cornerRadius(8)

                Spacer()

                HStack(spacing: 4) {
                    Image(systemName: "clock.fill")
                        .font(.system(size: 10))
                    Text(order.slot ?? "Scheduled Slot")
                        .font(.system(size: 11, weight: .bold))
                }
                .foregroundColor(MedMargTheme.slate700)
            }

            // Patient Name, Order ID & Destination Address
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(order.effectivePatientName)
                        .font(.system(size: 17, weight: .black))
                        .foregroundColor(MedMargTheme.slate900)

                    Spacer()

                    Text("#\(order.id)")
                        .font(.system(size: 12, weight: .black, design: .monospaced))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }

                HStack(alignment: .top, spacing: 6) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.system(size: 13))
                        .foregroundColor(MedMargTheme.primaryTeal)
                    Text(order.address ?? "Tirupati, AP")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate700)
                        .lineLimit(2)
                }
            }

            // Diagnostic Tests & Handover OTP
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("DIAGNOSTIC TESTS:")
                        .font(.system(size: 9, weight: .black))
                        .foregroundColor(MedMargTheme.slate500)
                    Text(order.items ?? "Pathology Panel")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                        .lineLimit(2)
                }

                Spacer()

                if let otp = order.otp ?? order.handoverOtp, !otp.isEmpty {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("HANDOVER OTP")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(MedMargTheme.primaryTeal)
                        Text(otp)
                            .font(.system(size: 16, weight: .black, design: .monospaced))
                            .foregroundColor(MedMargTheme.slate900)
                    }
                    .padding(8)
                    .background(MedMargTheme.lightTeal.opacity(0.4))
                    .cornerRadius(8)
                }
            }
            .padding(10)
            .background(MedMargTheme.slate50)
            .cornerRadius(10)

            // Primary Clinical Action Button Row
            HStack(spacing: 8) {
                // Call Patient
                Button(action: {
                    let cleaned = order.effectivePhone.filter { "0123456789".contains($0) }
                    if let url = URL(string: "tel:\(cleaned)") {
                        UIApplication.shared.open(url)
                    }
                }) {
                    Image(systemName: "phone.fill")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .frame(width: 40, height: 40)
                        .background(MedMargTheme.lightTeal)
                        .cornerRadius(10)
                }

                // Apple Maps
                Button(action: {
                    let query = order.address ?? "Tirupati"
                    if let encoded = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
                       let url = URL(string: "https://maps.apple.com/?q=\(encoded)") {
                        UIApplication.shared.open(url)
                    }
                }) {
                    Image(systemName: "map.fill")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .frame(width: 40, height: 40)
                        .background(MedMargTheme.lightTeal)
                        .cornerRadius(10)
                }

                // Doorstep QR Button (if unpaid)
                if !order.isPaid {
                    Button(action: onDoorstepQr) {
                        Image(systemName: "qrcode.viewfinder")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.white)
                            .frame(width: 40, height: 40)
                            .background(
                                LinearGradient(
                                    colors: [Color(red: 0.05, green: 0.35, blue: 0.8), Color(red: 0.1, green: 0.5, blue: 0.9)],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(10)
                    }
                }

                // Main Lifecycle Trigger
                if order.status == "BOOKED" || order.status == "ASSIGNED" {
                    Button(action: onAssessKit) {
                        HStack(spacing: 6) {
                            Image(systemName: "archivebox.fill")
                            Text("Assess Kit")
                        }
                        .font(.system(size: 13, weight: .black))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 40)
                        .background(MedMargTheme.primaryTeal)
                        .cornerRadius(10)
                    }
                } else if order.status == "KIT_ASSIGNED" {
                    Button(action: onStartTrip) {
                        HStack(spacing: 6) {
                            Image(systemName: "paperplane.fill")
                            Text("Start Trip")
                        }
                        .font(.system(size: 13, weight: .black))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 40)
                        .background(MedMargTheme.accentEmerald)
                        .cornerRadius(10)
                    }
                } else {
                    Button(action: onOpenVisit) {
                        HStack(spacing: 6) {
                            Image(systemName: order.status == "COMPLETED" ? "checkmark.circle.fill" : "play.fill")
                            Text(order.status == "COMPLETED" ? "Visit Summary" : "Doorstep Visit")
                        }
                        .font(.system(size: 13, weight: .black))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 40)
                        .background(order.status == "COMPLETED" ? Color.green : MedMargTheme.primaryTeal)
                        .cornerRadius(10)
                    }
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(MedMargTheme.primaryTeal.opacity(0.4), lineWidth: 1.5)
        )
        .shadow(color: MedMargTheme.primaryTeal.opacity(0.06), radius: 8, x: 0, y: 3)
        .padding(.horizontal, 16)
    }

    private func statusColor(for status: String) -> Color {
        switch status.uppercased() {
        case "COMPLETED": return Color.green
        case "ENROUTE", "EN_ROUTE": return Color.blue
        case "KIT_ASSIGNED": return MedMargTheme.accentEmerald
        case "ARRIVED": return Color.purple
        default: return Color.orange
        }
    }
}
