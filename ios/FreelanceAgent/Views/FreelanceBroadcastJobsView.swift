import SwiftUI

// =========================================================================
// ⚡ FREELANCE BROADCAST JOBS VIEW (GIG MARKETPLACE)
// Live feed of unassigned overflow jobs in phlebotomist's zone
// "First to claim gets assigned"
// =========================================================================

struct FreelanceBroadcastJobsView: View {
    let user: UserProfile
    let onJobClaimed: (AgentPickupOrder) -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var jobs: [FreelanceBroadcastJobItem] = []
    @State private var isLoading: Bool = true
    @State private var claimingJobId: String? = nil
    @State private var selectedFilter: String = "ALL" // "ALL", "FASTING", "HIGH_PRIORITY"
    @State private var bannerMessage: String? = nil

    private var effectiveAgentName: String {
        user.name.isEmpty ? (user.username.isEmpty ? "Freelance Phlebo" : user.username) : user.name
    }

    private var filteredJobs: [FreelanceBroadcastJobItem] {
        switch selectedFilter {
        case "FASTING":
            return jobs.filter { $0.fastingRequired == true }
        case "HIGH_PRIORITY":
            return jobs.filter { ($0.urgency ?? "").uppercased().contains("HIGH") }
        default:
            return jobs
        }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                filterBar
                Divider()

                if let msg = bannerMessage {
                    bannerAlert(msg: msg)
                }

                feedContent
            }
            .background(MedMargTheme.slate50.ignoresSafeArea())
            .navigationTitle("⚡ Available Broadcast Gigs")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
            .onAppear {
                Task {
                    await fetchBroadcastJobs()
                }
            }
        }
    }

    private var filterBar: some View {
        HStack(spacing: 8) {
            filterChip(title: "All Gigs (\(jobs.count))", key: "ALL")
            filterChip(title: "Fasting Req.", key: "FASTING")
            filterChip(title: "🔥 High Priority", key: "HIGH_PRIORITY")
            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.white)
    }

    private func bannerAlert(msg: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(.white)
            Text(msg)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(.white)
            Spacer()
            Button(action: { bannerMessage = nil }) {
                Image(systemName: "xmark")
                    .foregroundColor(.white)
            }
        }
        .padding(12)
        .background(MedMargTheme.accentEmerald)
        .cornerRadius(12)
        .padding(.horizontal, 16)
        .padding(.top, 10)
    }

    private var feedContent: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 14) {
                infoAnnouncementCard

                if isLoading {
                    VStack(spacing: 12) {
                        ProgressView().tint(MedMargTheme.primaryTeal)
                        Text("Scanning for nearby broadcast gigs...")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .padding(.top, 40)
                } else if filteredJobs.isEmpty {
                    emptyGigsCard
                } else {
                    ForEach(filteredJobs) { job in
                        FreelanceBroadcastCard(
                            job: job,
                            isClaiming: claimingJobId == job.id,
                            onClaim: {
                                claimJob(job)
                            }
                        )
                    }
                }

                Spacer().frame(height: 60)
            }
            .padding(.horizontal, 16)
        }
        .refreshable {
            await fetchBroadcastJobs()
        }
    }

    private var infoAnnouncementCard: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(MedMargTheme.accentEmerald.opacity(0.15))
                    .frame(width: 36, height: 36)
                Image(systemName: "bell.badge.fill")
                    .font(.system(size: 16))
                    .foregroundColor(MedMargTheme.accentEmerald)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text("First Claim Wins!")
                    .font(.system(size: 13, weight: .black))
                    .foregroundColor(MedMargTheme.slate900)
                Text("Nearby patient overflow pickups broadcasted directly to verified freelance phlebotomists.")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate600)
            }
        }
        .padding(12)
        .background(MedMargTheme.accentEmerald.opacity(0.08))
        .cornerRadius(14)
        .padding(.top, 8)
    }

    private var emptyGigsCard: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle")
                .font(.system(size: 48))
                .foregroundColor(MedMargTheme.slate400)
            Text("No Open Overflow Jobs")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(MedMargTheme.slate700)
            Text("All diagnostic collection slots in your area are covered. New gigs will appear automatically as orders arrive.")
                .font(.system(size: 12))
                .foregroundColor(MedMargTheme.slate500)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
        .padding(.top, 60)
    }

    private func filterChip(title: String, key: String) -> some View {
        let isSel = selectedFilter == key
        return Button(action: {
            withAnimation(.spring(response: 0.25)) {
                selectedFilter = key
            }
        }) {
            Text(title)
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(isSel ? .white : MedMargTheme.slate700)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSel ? MedMargTheme.primaryTeal : MedMargTheme.slate100)
                .cornerRadius(20)
        }
        .buttonStyle(PlainButtonStyle())
    }

    private func fetchBroadcastJobs() async {
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/broadcast-jobs") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let arr = json["jobs"] as? [[String: Any]] {
                let parsed: [FreelanceBroadcastJobItem] = arr.compactMap { d in
                    guard let id = d["id"] as? String else { return nil }
                    return FreelanceBroadcastJobItem(
                        id: id,
                        patientName: d["patientName"] as? String,
                        age: d["age"] as? String,
                        timeSlot: d["timeSlot"] as? String,
                        address: d["address"] as? String,
                        phone: d["phone"] as? String,
                        tests: d["tests"] as? String,
                        tubes: d["tubes"] as? [String],
                        payout: d["payout"] as? Int,
                        distance: d["distance"] as? String,
                        fastingRequired: d["fastingRequired"] as? Bool,
                        urgency: d["urgency"] as? String
                    )
                }
                await MainActor.run {
                    self.jobs = parsed
                    self.isLoading = false
                }
            }
        } catch {
            await MainActor.run { self.isLoading = false }
        }
    }

    private func claimJob(_ job: FreelanceBroadcastJobItem) {
        claimingJobId = job.id
        Task {
            guard let url = URL(string: "https://medmarg.com/api/v1/agent/broadcast-jobs/claim") else { return }
            var req = URLRequest(url: url)
            req.httpMethod = "POST"
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")

            let body: [String: Any] = [
                "jobId": job.id,
                "agentName": effectiveAgentName,
                "patientName": job.patientName ?? "Patient",
                "timeSlot": job.timeSlot ?? "Today",
                "address": job.address ?? "Tirupati Doorstep",
                "tests": job.tests ?? "Diagnostic Collection"
            ]
            req.httpBody = try? JSONSerialization.data(withJSONObject: body)

            do {
                let (data, _) = try await URLSession.shared.data(for: req)
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let ordDict = json["order"] as? [String: Any] {
                    let claimedOrder = AgentPickupOrder(
                        id: ordDict["id"] as? String ?? "MM-901",
                        patientName: ordDict["patientName"] as? String,
                        careSeekerName: ordDict["patientName"] as? String,
                        phone: job.phone,
                        patientPhone: job.phone,
                        city: "Tirupati",
                        address: ordDict["address"] as? String,
                        items: ordDict["tests"] as? String,
                        totalPersons: 1,
                        selectedLabProvider: "MedMarg Central Pathology",
                        labName: "MedMarg Central Pathology",
                        amount: ordDict["amount"] as? Int ?? 899,
                        totalAmount: ordDict["amount"] as? Int ?? 899,
                        status: "ASSIGNED",
                        assignedAgent: effectiveAgentName,
                        phleboName: effectiveAgentName,
                        phleboPhone: user.phone,
                        phleboRating: "5.0 ★",
                        otp: "4829",
                        handoverOtp: "4829",
                        slot: ordDict["time"] as? String,
                        date: "Today",
                        eta: "15 mins",
                        tempTelemetry: "4.2°C",
                        paymentMode: "Doorstep QR",
                        paymentStatus: "PENDING",
                        barcode: nil,
                        arrivalPhoto: nil,
                        samplePhotos: nil,
                        reviewRequestSent: false,
                        reviewStatus: nil,
                        phleboVitals: nil,
                        kitAssigned: false,
                        kitNotRequired: false,
                        tripStartedAt: nil,
                        transactionId: nil,
                        paymentNotes: "Claimed Freelance Gig"
                    )

                    await MainActor.run {
                        self.claimingJobId = nil
                        self.jobs.removeAll(where: { $0.id == job.id })
                        self.bannerMessage = "⚡ Gig \(job.id) successfully claimed! Added to your active pickups."
                        onJobClaimed(claimedOrder)
                    }
                }
            } catch {
                await MainActor.run {
                    self.claimingJobId = nil
                }
            }
        }
    }
}
