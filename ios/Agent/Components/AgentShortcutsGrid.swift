import SwiftUI

// =========================================================================
// ⚡ AGENT SHORTCUTS GRID (QUICK WORKSPACE NAVIGATION)
// Pixel-perfect match to reference Image 3:
// 4 Action Cards in 2x2 Grid with matching icons, bold titles & colored round backgrounds
// 1. Inventory Bag (green)
// 2. Shift Quota (purple calendar)
// 3. Scan Barcode (blue barcode)
// 4. Lab Handover (orange truck)
// =========================================================================

struct AgentShortcutsGrid: View {
    let onSelectShortcut: (Int) -> Void
    var onBarcodeScanTap: () -> Void = {}
    var onLabHandoverTap: () -> Void = {}

    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            // 1. Inventory Bag (Green)
            actionCard(
                title: "Inventory\nBag",
                icon: "shippingbox.fill",
                color: Color(red: 0.05, green: 0.72, blue: 0.45)
            ) {
                onSelectShortcut(1)
            }

            // 2. Shift Quota (Purple)
            actionCard(
                title: "Shift\nQuota",
                icon: "calendar.badge.clock",
                color: Color(red: 0.6, green: 0.35, blue: 0.85)
            ) {
                onSelectShortcut(2)
            }

            // 3. Scan Barcode (Blue)
            actionCard(
                title: "Scan\nBarcode",
                icon: "qrcode.viewfinder",
                color: Color(red: 0.15, green: 0.5, blue: 0.95)
            ) {
                onBarcodeScanTap()
            }

            // 4. Lab Handover (Orange)
            actionCard(
                title: "Lab\nHandover",
                icon: "truck.box.fill",
                color: Color(red: 0.95, green: 0.55, blue: 0.15)
            ) {
                onLabHandoverTap()
            }
        }
        .padding(.horizontal, 16)
    }

    private func actionCard(
        title: String,
        icon: String,
        color: Color,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            HStack(alignment: .center, spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(color.opacity(0.12))
                        .frame(width: 42, height: 42)
                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(color)
                }

                Text(title)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                    .multilineTextAlignment(.leading)
                    .lineSpacing(2)

                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(color.opacity(0.7))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 14)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(MedMargTheme.slate200, lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(PlainButtonStyle())
    }
}
