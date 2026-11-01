import SwiftUI

// =========================================================================
// ⚡ FREELANCE AGENT SHORTCUTS GRID
// Quick action cards tailored for freelance gig phlebotomists
// =========================================================================

struct FreelanceShortcutsGrid: View {
    let onClaimGigsTap: () -> Void
    let onInventoryTap: () -> Void
    let onBarcodeScanTap: () -> Void
    let onLabHandoverTap: () -> Void

    var body: some View {
        VStack(spacing: 10) {
            // 2x2 Grid
            HStack(spacing: 10) {
                // Shortcut 1: Claim Gigs (Emerald accent)
                Button(action: onClaimGigsTap) {
                    HStack(spacing: 10) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(MedMargTheme.accentEmerald.opacity(0.12))
                                .frame(width: 42, height: 42)
                            Image(systemName: "bolt.fill")
                                .font(.system(size: 18, weight: .black))
                                .foregroundColor(MedMargTheme.accentEmerald)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Claim Gigs")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Open Broadcasts")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        Spacer(minLength: 0)
                        Image(systemName: "chevron.right")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate400)
                    }
                    .padding(10)
                    .background(Color.white)
                    .cornerRadius(14)
                    .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
                }
                .buttonStyle(PlainButtonStyle())

                // Shortcut 2: Kit & Credits (Teal accent)
                Button(action: onInventoryTap) {
                    HStack(spacing: 10) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(MedMargTheme.primaryTeal.opacity(0.12))
                                .frame(width: 42, height: 42)
                            Image(systemName: "shippingbox.fill")
                                .font(.system(size: 18))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Kit & Credits")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("₹2,000 Wallet")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        Spacer(minLength: 0)
                        Image(systemName: "chevron.right")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate400)
                    }
                    .padding(10)
                    .background(Color.white)
                    .cornerRadius(14)
                    .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
                }
                .buttonStyle(PlainButtonStyle())
            }

            HStack(spacing: 10) {
                // Shortcut 3: Scan Barcode (Blue accent)
                Button(action: onBarcodeScanTap) {
                    HStack(spacing: 10) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.blue.opacity(0.12))
                                .frame(width: 42, height: 42)
                            Image(systemName: "qrcode.viewfinder")
                                .font(.system(size: 18))
                                .foregroundColor(Color.blue)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Scan Barcode")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Google Vision")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        Spacer(minLength: 0)
                        Image(systemName: "chevron.right")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate400)
                    }
                    .padding(10)
                    .background(Color.white)
                    .cornerRadius(14)
                    .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
                }
                .buttonStyle(PlainButtonStyle())

                // Shortcut 4: Lab Handover (Orange accent)
                Button(action: onLabHandoverTap) {
                    HStack(spacing: 10) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.orange.opacity(0.12))
                                .frame(width: 42, height: 42)
                            Image(systemName: "shippingbox.and.arrow.backward.fill")
                                .font(.system(size: 18))
                                .foregroundColor(Color.orange)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Lab Handover")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Deliver Samples")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        Spacer(minLength: 0)
                        Image(systemName: "chevron.right")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate400)
                    }
                    .padding(10)
                    .background(Color.white)
                    .cornerRadius(14)
                    .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
                }
                .buttonStyle(PlainButtonStyle())
            }

            // Full-width IoT Cold-Chain Banner
            HStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color(red: 0.05, green: 0.55, blue: 0.85).opacity(0.12))
                        .frame(width: 38, height: 38)
                    Image(systemName: "snowflake")
                        .font(.system(size: 18))
                        .foregroundColor(Color(red: 0.05, green: 0.55, blue: 0.85))
                }

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text("IoT Cold-Chain Monitoring")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text("Active")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(Color.blue)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.blue.opacity(0.12))
                            .cornerRadius(6)
                    }
                    Text("Bluetooth Smart Sensor Pairing for sample safety (2°C - 8°C)")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate400)
            }
            .padding(12)
            .background(Color.white)
            .cornerRadius(14)
            .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
        }
        .padding(.horizontal, 16)
    }
}

