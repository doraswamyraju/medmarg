import SwiftUI

// =========================================================================
// ⚡ AGENT SHORTCUTS GRID (QUICK WORKSPACE NAVIGATION)
// Direct access to: Supplies, Daily Quota, Lab Handover, Telemetry
// =========================================================================

struct AgentShortcutsGrid: View {
    let onSelectShortcut: (Int) -> Void
    var onBarcodeScanTap: () -> Void = {}
    var onLabHandoverTap: () -> Void = {}

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("QUICK SHORTCUTS")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(MedMargTheme.slate500)
                .tracking(0.5)
                .padding(.horizontal, 16)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                // 1. In-Hand Consumables (Tab 1)
                shortcutButton(
                    title: "Field Supplies",
                    subtitle: "Tubes, Needles & Indents",
                    icon: "archivebox.fill",
                    color: MedMargTheme.primaryTeal
                ) {
                    onSelectShortcut(1)
                }

                // 2. Shift Targets & Quota (Tab 2)
                shortcutButton(
                    title: "Shift Targets",
                    subtitle: "Quota & Milestones",
                    icon: "target",
                    color: Color.orange
                ) {
                    onSelectShortcut(2)
                }

                // 3. Scan Vacutainer Barcode
                shortcutButton(
                    title: "Scan Barcode",
                    subtitle: "Sample Identification",
                    icon: "barcode.viewfinder",
                    color: Color.blue
                ) {
                    onBarcodeScanTap()
                }

                // 4. Lab Handover Batch
                shortcutButton(
                    title: "Lab Handover",
                    subtitle: "NABL Processing Delivery",
                    icon: "building.2.crop.circle.fill",
                    color: MedMargTheme.accentEmerald
                ) {
                    onLabHandoverTap()
                }
            }
            .padding(.horizontal, 16)
        }
    }

    private func shortcutButton(
        title: String,
        subtitle: String,
        icon: String,
        color: Color,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(color.opacity(0.12))
                        .frame(width: 40, height: 40)
                    Image(systemName: icon)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(color)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text(subtitle)
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.slate500)
                        .lineLimit(1)
                }

                Spacer(minLength: 0)
            }
            .padding(12)
            .background(Color.white)
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(MedMargTheme.slate200, lineWidth: 1)
            )
        }
    }
}

