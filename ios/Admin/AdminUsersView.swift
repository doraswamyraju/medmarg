import SwiftUI

struct AdminUsersView: View {
    @Binding var users: [UserProfile]
    @Binding var showAddUserSheet: Bool
    @State private var searchQuery: String = ""
    @State private var roleFilter: String = "ALL"

    var body: some View {
        VStack(spacing: 12) {
            // Action & Search Header
            HStack {
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(MedMargTheme.slate500)
                    TextField("Search users by name, email, role...", text: $searchQuery)
                        .autocapitalization(.none)
                }
                .padding(10)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(10)

                Button(action: { showAddUserSheet = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                        Text("Add User")
                    }
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(10)
                }
            }

            // Role Filter Pills
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    roleFilterPill(roleKey: "ALL", label: "All Users")
                    ForEach(UserRole.allCases) { role in
                        roleFilterPill(roleKey: role.rawValue, label: role.rawValue)
                    }
                }
            }

            // Users List
            let filteredUsers = users.filter { user in
                (roleFilter == "ALL" || user.role.rawValue == roleFilter) &&
                (searchQuery.isEmpty || user.name.localizedCaseInsensitiveContains(searchQuery) || user.email.localizedCaseInsensitiveContains(searchQuery) || user.username.localizedCaseInsensitiveContains(searchQuery))
            }

            ForEach(filteredUsers) { user in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        ZStack {
                            Circle().fill(MedMargTheme.primaryTeal.opacity(0.15)).frame(width: 40, height: 40)
                            Text(String(user.name.prefix(1)))
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            HStack(spacing: 6) {
                                Text(user.name)
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)

                                Text(user.role.rawValue)
                                    .font(.system(size: 9, weight: .bold))
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(MedMargTheme.lightTeal)
                                    .foregroundColor(MedMargTheme.primaryTeal)
                                    .cornerRadius(4)
                            }

                            Text("@\(user.username) • \(user.email)")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Text(user.status)
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(user.status == "Active" ? .green : .red)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(user.status == "Active" ? Color.green.opacity(0.1) : Color.red.opacity(0.1))
                            .cornerRadius(6)
                    }

                    Text("Org/Address: \(user.organization)")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate700)

                    Divider()

                    // Action Controls
                    HStack {
                        Button(action: { toggleUserStatus(userId: user.id) }) {
                            Text(user.status == "Active" ? "Suspend Account" : "Activate Account")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(user.status == "Active" ? .red : .green)
                        }

                        Spacer()

                        Button(action: { deleteUser(userId: user.id) }) {
                            Image(systemName: "trash.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.red)
                        }
                    }
                }
                .padding(14)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(12)
            }
        }
    }

    private func roleFilterPill(roleKey: String, label: String) -> some View {
        Button(action: { roleFilter = roleKey }) {
            Text(label)
                .font(.system(size: 11, weight: roleFilter == roleKey ? .bold : .medium))
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(roleFilter == roleKey ? MedMargTheme.primaryTeal : MedMargTheme.pureWhite)
                .foregroundColor(roleFilter == roleKey ? .white : MedMargTheme.slate700)
                .cornerRadius(14)
        }
    }

    private func toggleUserStatus(userId: String) {
        if let idx = users.firstIndex(where: { $0.id == userId }) {
            users[idx].status = (users[idx].status == "Active") ? "Suspended" : "Active"
        }
    }

    private func deleteUser(userId: String) {
        users.removeAll(where: { $0.id == userId })
    }
}
