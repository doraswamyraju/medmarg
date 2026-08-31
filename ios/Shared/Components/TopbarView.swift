import SwiftUI

struct TopbarView: View {
    let user: UserProfile
    @Binding var currentCity: String
    @Binding var showSidebar: Bool
    @Binding var showCityPicker: Bool
    @Binding var showCartSheet: Bool
    let cartItemCount: Int

    var body: some View {
        HStack(spacing: 12) {
            // Sidebar Drawer Toggle Button
            Button(action: { withAnimation { showSidebar.toggle() } }) {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(8)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(10)
            }

            // Location Selector Widget
            VStack(alignment: .leading, spacing: 1) {
                Text("Serving in")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(MedMargTheme.slate500)

                Button(action: { showCityPicker = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "location.fill")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.primaryTeal)
                        Text(currentCity)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                            .lineLimit(1)
                        Image(systemName: "chevron.down")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }
            }

            Spacer()

            // Cart Action Icon with Live Badge
            Button(action: { showCartSheet = true }) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "cart.fill")
                        .font(.system(size: 18))
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .padding(8)
                        .background(MedMargTheme.lightTeal)
                        .cornerRadius(10)

                    if cartItemCount > 0 {
                        Text("\(cartItemCount)")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white)
                            .padding(4)
                            .background(Color.red)
                            .clipShape(Circle())
                            .offset(x: 4, y: -4)
                    }
                }
            }

            // User Profile Avatar Circle
            Button(action: { withAnimation { showSidebar.toggle() } }) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.primaryTeal)
                        .frame(width: 34, height: 34)
                    Text(String(user.name.prefix(1)))
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(MedMargTheme.pureWhite)
        .shadow(color: Color.black.opacity(0.03), radius: 4, x: 0, y: 2)
    }
}
