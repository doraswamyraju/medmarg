import SwiftUI

struct SystemNotificationItem: Identifiable {
    let id: String
    let title: String
    let message: String
    let time: String
    let category: String // "SYNC", "ACCESS", "LICENSE", "TELEMETRY", "REVENUE"
    let icon: String
    let color: Color
    var isRead: Bool
}

struct NotificationCenterSheet: View {
    @Binding var isPresented: Bool
    @State private var filterCategory: String = "ALL"
    @State private var notifications: [SystemNotificationItem] = []
    @State private var isLoading: Bool = false

    var body: some View {
        VStack(spacing: 0) {
            // Drag Handle Indicator
            Capsule()
                .fill(MedMargTheme.slate500.opacity(0.3))
                .frame(width: 40, height: 5)
                .padding(.top, 10)
                .padding(.bottom, 8)

            // Header Bar
            HStack {
                HStack(spacing: 8) {
                    Image(systemName: "bell.badge.fill")
                        .font(.system(size: 20))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    VStack(alignment: .leading, spacing: 1) {
                        Text("Notification Center")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)

                        let unreadCount = notifications.filter { !$0.isRead }.count
                        Text(unreadCount > 0 ? "\(unreadCount) unread alerts" : (notifications.isEmpty ? "No active alerts" : "All notifications read"))
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                }

                Spacer()

                if !notifications.isEmpty {
                    Button(action: markAllAsRead) {
                        Text("Mark All Read")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                }

                Button(action: { isPresented = false }) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 22))
                        .foregroundColor(MedMargTheme.slate500)
                        .padding(.leading, 8)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 10)

            Divider()

            // Filter Tabs Bar
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    notificationFilterPill(key: "ALL", label: "All Alerts (\(notifications.count))")
                    notificationFilterPill(key: "SYNC", label: "Catalog Sync")
                    notificationFilterPill(key: "ACCESS", label: "Users & Doctors")
                    notificationFilterPill(key: "LICENSE", label: "NABL Labs")
                    notificationFilterPill(key: "TELEMETRY", label: "Cold-Chain")
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
            }
            .background(MedMargTheme.slate50)

            // Notifications List
            let filteredNotifications = notifications.filter { item in
                filterCategory == "ALL" || item.category == filterCategory
            }

            if filteredNotifications.isEmpty {
                VStack(spacing: 12) {
                    Spacer().frame(height: 40)
                    Image(systemName: "bell.slash")
                        .font(.system(size: 36))
                        .foregroundColor(MedMargTheme.slate500)
                    Text("No Notifications")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate700)
                    Text("You're all caught up with your medical alerts.")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.slate500)
                    Spacer()
                }
                .frame(maxWidth: .infinity)
            } else {
                ScrollView {
                    VStack(spacing: 12) {
                        ForEach(filteredNotifications) { item in
                            HStack(alignment: .top, spacing: 12) {
                                // Category Icon
                                Image(systemName: item.icon)
                                    .font(.system(size: 24))
                                    .foregroundColor(item.color)
                                    .frame(width: 36, height: 36)
                                    .background(item.color.opacity(0.12))
                                    .cornerRadius(10)

                                VStack(alignment: .leading, spacing: 4) {
                                    HStack {
                                        Text(item.title)
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(MedMargTheme.slate900)

                                        Spacer()

                                        Text(item.time)
                                            .font(.system(size: 10))
                                            .foregroundColor(MedMargTheme.slate500)
                                    }

                                    Text(item.message)
                                        .font(.system(size: 12))
                                        .foregroundColor(MedMargTheme.slate700)
                                        .fixedSize(horizontal: false, vertical: true)
                                }

                                if !item.isRead {
                                    Circle()
                                        .fill(MedMargTheme.primaryTeal)
                                        .frame(width: 8, height: 8)
                                        .padding(.top, 4)
                                }
                            }
                            .padding(14)
                            .background(item.isRead ? MedMargTheme.pureWhite : MedMargTheme.lightTeal.opacity(0.3))
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(item.isRead ? MedMargTheme.slate200 : MedMargTheme.primaryTeal.opacity(0.3), lineWidth: 1)
                            )
                        }
                    }
                    .padding(20)
                }
            }

            Spacer()
        }
        .background(MedMargTheme.pureWhite)
        .onAppear {
            fetchLiveNotifications()
        }
    }

    private func notificationFilterPill(key: String, label: String) -> some View {
        Button(action: { filterCategory = key }) {
            Text(label)
                .font(.system(size: 11, weight: filterCategory == key ? .bold : .medium))
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(filterCategory == key ? MedMargTheme.primaryTeal : MedMargTheme.pureWhite)
                .foregroundColor(filterCategory == key ? .white : MedMargTheme.slate700)
                .cornerRadius(16)
        }
    }

    private func markAllAsRead() {
        for idx in notifications.indices {
            notifications[idx].isRead = true
        }
    }

    private func fetchLiveNotifications() {
        isLoading = true
        guard let url = URL(string: "https://medmarg.com/api/v1/notifications/user-stream") else { return }
        URLSession.shared.dataTask(with: url) { data, _, _ in
            DispatchQueue.main.async {
                self.isLoading = false
                guard let d = data,
                      let json = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
                      let list = json["notifications"] as? [[String: Any]], !list.isEmpty else {
                    self.notifications = []
                    return
                }

                self.notifications = list.compactMap { dict in
                    let id = dict["id"] as? String ?? UUID().uuidString
                    let title = dict["title"] as? String ?? "Alert"
                    let msg = dict["message"] as? String ?? ""
                    let cat = dict["category"] as? String ?? "GENERAL"
                    let isRead = dict["read"] as? Bool ?? false

                    return SystemNotificationItem(
                        id: id,
                        title: title,
                        message: msg,
                        time: "Recent",
                        category: cat,
                        icon: "bell.fill",
                        color: MedMargTheme.primaryTeal,
                        isRead: isRead
                    )
                }
            }
        }.resume()
    }
}
