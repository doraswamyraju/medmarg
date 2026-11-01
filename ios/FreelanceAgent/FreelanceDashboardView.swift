import SwiftUI

// =========================================================================
// ⚡ FREELANCE AGENT DASHBOARD CONTAINER (ROOT FREELANCE VIEW)
// Hosts Home, Orders & Broadcasts, Inventory & Credits, Wallet & Payouts, Profile
// =========================================================================

struct FreelanceDashboardView: View {
    let user: UserProfile
    let onLogout: () -> Void
    @Binding var selectedTab: Int // 0: Home, 7: Orders, 1: Inventory, 3: Wallet/Payouts, 4: Profile
    @Binding var showSidebar: Bool

    var body: some View {
        ZStack {
            MedMargTheme.slate50.ignoresSafeArea()

            Group {
                if selectedTab == 0 {
                    // Tab 0: Dedicated Freelance Home Dashboard
                    FreelanceHomeDashboardView(
                        user: user,
                        onLogout: onLogout,
                        selectedTab: $selectedTab,
                        showSidebar: $showSidebar
                    )
                } else if selectedTab == 7 {
                    // Tab 7: Dedicated Freelance Orders & Gigs View
                    FreelanceOrdersView(
                        user: user,
                        selectedTab: $selectedTab,
                        showSidebar: $showSidebar
                    )
                } else if selectedTab == 1 {
                    // Tab 1: Dedicated Freelance Inventory & Credits View
                    FreelanceInventoryView(
                        user: user,
                        selectedTab: $selectedTab,
                        showSidebar: $showSidebar
                    )
                } else if selectedTab == 3 {
                    // Tab 3: Dedicated Freelance Wallet & Payouts View
                    FreelanceWalletPayoutView(
                        user: user,
                        selectedTab: $selectedTab,
                        showSidebar: $showSidebar
                    )
                } else if selectedTab == 4 {
                    // Tab 4: Dedicated Freelance Profile & KYC View
                    FreelanceProfileView(
                        user: user,
                        onLogout: onLogout,
                        selectedTab: $selectedTab,
                        showSidebar: $showSidebar
                    )
                } else {
                    // Fallback to Home
                    FreelanceHomeDashboardView(
                        user: user,
                        onLogout: onLogout,
                        selectedTab: $selectedTab,
                        showSidebar: $showSidebar
                    )
                }
            }
        }
    }
}

