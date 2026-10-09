import SwiftUI

// =========================================================================
// 🛒 FLOATING VIEW CART BAR (DYNAMIC MODULE ON CART > 0)
// 100% Feature Parity with Web FloatingCartButton.jsx
// =========================================================================

struct CareSeekerFloatingCartBar: View {
    let cartItems: [CartItem]
    let selectedLabProvider: String
    let onOpenCart: () -> Void

    private var cartTotal: Int {
        cartItems.reduce(0) { $0 + $1.price }
    }

    private var activeLabName: String {
        switch selectedLabProvider {
        case "thyrocare": return "Thyrocare"
        case "lalpath": return "Dr. Lal PathLabs"
        default: return "MedMarg Direct"
        }
    }

    var body: some View {
        if !cartItems.isEmpty {
            Button(action: onOpenCart) {
                HStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(Color.white.opacity(0.2))
                            .frame(width: 38, height: 38)
                        Image(systemName: "cart.fill")
                            .font(.system(size: 16))
                            .foregroundColor(MedMargTheme.amberGold)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 6) {
                            Text("\(cartItems.count) \(cartItems.count == 1 ? "Test" : "Tests") Added")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(.white)
                            Text("• ₹\(cartTotal)")
                                .font(.system(size: 13, weight: .black))
                                .foregroundColor(MedMargTheme.amberLight)
                        }
                        Text("Lab: \(activeLabName) • Free Home Phlebotomy")
                            .font(.system(size: 10))
                            .foregroundColor(MedMargTheme.emeraldLight)
                            .lineLimit(1)
                    }

                    Spacer()

                    HStack(spacing: 4) {
                        Text("View Cart")
                            .font(.system(size: 13, weight: .bold))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 11, weight: .bold))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.white.opacity(0.18))
                    .cornerRadius(10)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(
                    LinearGradient(
                        colors: [MedMargTheme.darkTeal, Color(red: 0.0, green: 0.35, blue: 0.32)],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(18)
                .shadow(color: MedMargTheme.darkTeal.opacity(0.4), radius: 10, x: 0, y: 5)
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 65)
            .transition(.move(edge: .bottom).combined(with: .opacity))
        }
    }
}
