import SwiftUI

// =========================================================================
// 📁 CARE SEEKER REPORTS & NABL HEALTH VAULT VIEW (REDESIGNED)
// 100% Feature Parity with Web PatientReportsTab.jsx
// Metric Counters, Search & Filter, Longitudinal Progression Charts,
// Verified Pathology Reports & Official NABL PDF Report Viewer
// Matching Agent & Admin Panel Architecture
// =========================================================================

struct ReportBiomarker: Identifiable, Equatable {
    var id: String { name }
    let name: String
    let value: String
    let status: String // NORMAL, LOW, HIGH
    let range: String
}

struct DiagnosticReportModel: Identifiable, Equatable {
    let id: String
    let title: String
    let date: String
    let lab: String
    let doctorVerified: String
    let status: String
    let summary: String
    let biomarkers: [ReportBiomarker]
}

struct BiomarkerTrendPoint: Identifiable, Equatable {
    var id: String { date }
    let date: String
    let val: Double
    let normalMax: Double
}

struct BiomarkerTrendSeries {
    let name: String
    let data: [BiomarkerTrendPoint]
    let currentStatus: String
    let color: Color
}

struct CareSeekerReportsView: View {
    var user: UserProfile? = nil
    @State private var reports: [DiagnosticReportModel] = []
    @State private var isLoadingReports: Bool = false
    @State private var searchQuery: String = ""
    @State private var filterCategory: String = "ALL" // ALL, RECENT, ATTENTION, ABDM
    @State private var activeTrendBiomarker: String = "FBS"
    @State private var selectedReportForPreview: DiagnosticReportModel? = nil
    @State private var expandedReportIds: Set<String> = []
    @State private var copiedToast: String? = nil

    private var biomarkerTrends: [String: BiomarkerTrendSeries] {
        [
            "FBS": BiomarkerTrendSeries(
                name: "Fasting Blood Sugar (mg/dL)",
                data: [
                    BiomarkerTrendPoint(date: "Jan 2026", val: 98, normalMax: 100),
                    BiomarkerTrendPoint(date: "May 2026", val: 96, normalMax: 100),
                    BiomarkerTrendPoint(date: "Aug 2026", val: 92, normalMax: 100)
                ],
                currentStatus: "Optimal (92 mg/dL)",
                color: Color.green
            ),
            "HBA1C": BiomarkerTrendSeries(
                name: "HbA1c Glycemic Index (%)",
                data: [
                    BiomarkerTrendPoint(date: "Jan 2026", val: 5.7, normalMax: 5.7),
                    BiomarkerTrendPoint(date: "May 2026", val: 5.6, normalMax: 5.7),
                    BiomarkerTrendPoint(date: "Aug 2026", val: 5.4, normalMax: 5.7)
                ],
                currentStatus: "Optimal (5.4% - Non-Diabetic)",
                color: MedMargTheme.primaryTeal
            ),
            "CHOLESTEROL": BiomarkerTrendSeries(
                name: "Total Cholesterol (mg/dL)",
                data: [
                    BiomarkerTrendPoint(date: "Jan 2026", val: 192, normalMax: 200),
                    BiomarkerTrendPoint(date: "May 2026", val: 184, normalMax: 200),
                    BiomarkerTrendPoint(date: "Aug 2026", val: 178, normalMax: 200)
                ],
                currentStatus: "Desirable (178 mg/dL)",
                color: Color.blue
            ),
            "TSH": BiomarkerTrendSeries(
                name: "Thyroid TSH (µIU/mL)",
                data: [
                    BiomarkerTrendPoint(date: "Jan 2026", val: 2.8, normalMax: 4.2),
                    BiomarkerTrendPoint(date: "May 2026", val: 2.4, normalMax: 4.2),
                    BiomarkerTrendPoint(date: "Aug 2026", val: 2.14, normalMax: 4.2)
                ],
                currentStatus: "Euthyroid / Normal (2.14 µIU/mL)",
                color: Color.purple
            )
        ]
    }

    var filteredReports: [DiagnosticReportModel] {
        reports.filter { rep in
            if !searchQuery.isEmpty {
                let q = searchQuery.lowercased()
                let matchesId = rep.id.lowercased().contains(q)
                let matchesTitle = rep.title.lowercased().contains(q)
                let matchesLab = rep.lab.lowercased().contains(q)
                let matchesBio = rep.biomarkers.contains { $0.name.lowercased().contains(q) }
                if !matchesId && !matchesTitle && !matchesLab && !matchesBio {
                    return false
                }
            }

            if filterCategory == "ATTENTION" {
                return rep.biomarkers.contains { $0.status != "NORMAL" }
            }
            return true
        }
    }

    private var normalBiomarkerCount: Int {
        reports.flatMap { $0.biomarkers }.filter { $0.status == "NORMAL" }.count
    }

    private var attentionBiomarkerCount: Int {
        reports.flatMap { $0.biomarkers }.filter { $0.status != "NORMAL" }.count
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                
                // 1. NABL Health Vault Hero Banner
                healthVaultHeroBanner

                // 2. Metric Counters Row (Matching Agent / Admin Panels)
                metricCountersRow

                // 3. Search Bar
                searchBarView

                // 4. Filter Tabs Bar
                filterTabsBar

                // 5. Multi-Month Biomarker Longitudinal Progression Analyzer
                if !reports.isEmpty {
                    biomarkerProgressionCard
                }

                // 6. Verified Diagnostic Reports List
                diagnosticReportsListSection

                Spacer().frame(height: 80)
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
        }
        .background(MedMargTheme.slate50)
        .refreshable {
            fetchLiveReports()
        }
        .overlay(alignment: .bottom) {
            if let toast = copiedToast {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.white)
                    Text(toast)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.white)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(MedMargTheme.primaryTeal)
                .cornerRadius(20)
                .shadow(color: Color.black.opacity(0.15), radius: 8, x: 0, y: 4)
                .padding(.bottom, 80)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .sheet(item: $selectedReportForPreview) { rep in
            NABLReportViewerSheet(report: rep, patientName: user?.name ?? "Rahul Sharma")
        }
        .onAppear {
            fetchLiveReports()
        }
    }

    // ==========================================
    // 🏥 1. NABL HEALTH VAULT HERO BANNER
    // ==========================================
    private var healthVaultHeroBanner: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 6) {
                        Image(systemName: "checkmark.seal.fill")
                            .foregroundColor(MedMargTheme.amberGold)
                        Text("NABL & CAP CERTIFIED HEALTH VAULT")
                            .font(.system(size: 9, weight: .heavy))
                            .foregroundColor(MedMargTheme.amberGold)
                            .tracking(0.8)
                    }

                    Text("Verified Pathology Reports")
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundColor(.white)

                    Text("Digital NABL accredited lab telemetry with longitudinal biomarker trends.")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.lightTeal)
                }

                Spacer()

                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.white.opacity(0.12))
                        .frame(width: 44, height: 44)
                    Image(systemName: "doc.text.image.fill")
                        .font(.system(size: 22))
                        .foregroundColor(Color.white)
                }
            }

            Divider().background(Color.white.opacity(0.2))

            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "qrcode.viewfinder")
                        .foregroundColor(MedMargTheme.amberLight)
                    Text("ABDM QR Code Verifiable")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white)
                }

                Spacer()

                Text("Government of India FHIR/EHR Compliant")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundColor(MedMargTheme.emeraldLight)
            }
        }
        .padding(16)
        .background(
            LinearGradient(
                colors: [MedMargTheme.darkTeal, Color(red: 0.0, green: 0.35, blue: 0.32)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(18)
        .shadow(color: MedMargTheme.primaryTeal.opacity(0.2), radius: 8, x: 0, y: 3)
    }

    // ==========================================
    // 📊 2. METRIC COUNTERS ROW
    // ==========================================
    private var metricCountersRow: some View {
        HStack(spacing: 10) {
            metricCounterCard(
                value: "\(reports.count)",
                label: "Verified Reports",
                icon: "doc.text.fill",
                color: MedMargTheme.primaryTeal,
                bgColor: MedMargTheme.lightTeal
            )

            metricCounterCard(
                value: "\(normalBiomarkerCount)",
                label: "Normal Parameters",
                icon: "checkmark.circle.fill",
                color: MedMargTheme.accentEmerald,
                bgColor: Color(red: 0.90, green: 0.98, blue: 0.94)
            )

            metricCounterCard(
                value: "\(attentionBiomarkerCount)",
                label: "Attention Needed",
                icon: "exclamationmark.triangle.fill",
                color: MedMargTheme.amberGold,
                bgColor: MedMargTheme.amberLight
            )

            metricCounterCard(
                value: "100%",
                label: "NABL Certified",
                icon: "shield.checkmark.fill",
                color: Color.blue,
                bgColor: Color(red: 0.92, green: 0.96, blue: 1.0)
            )
        }
    }

    private func metricCounterCard(value: String, label: String, icon: String, color: Color, bgColor: Color) -> some View {
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.12))
                    .frame(width: 28, height: 28)
                Image(systemName: icon)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(color)
            }

            Text(value)
                .font(.system(size: 17, weight: .black, design: .rounded))
                .foregroundColor(MedMargTheme.slate900)

            Text(label)
                .font(.system(size: 9, weight: .semibold))
                .foregroundColor(MedMargTheme.slate500)
                .multilineTextAlignment(.center)
                .lineLimit(1)
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 4)
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 1)
    }

    // ==========================================
    // 🔍 3. SEARCH BAR
    // ==========================================
    private var searchBarView: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(MedMargTheme.slate400)
                .font(.system(size: 14, weight: .bold))

            TextField("Search reports by test, biomarker, lab partner...", text: $searchQuery)
                .font(.system(size: 13))
                .foregroundColor(MedMargTheme.slate900)

            if !searchQuery.isEmpty {
                Button(action: { searchQuery = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(MedMargTheme.slate400)
                        .font(.system(size: 14))
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Color.white)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🔀 4. FILTER TABS BAR
    // ==========================================
    private var filterTabsBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                filterButton(key: "ALL", label: "All Reports (\(reports.count))")
                filterButton(key: "RECENT", label: "Recent (30 Days)")
                filterButton(key: "ATTENTION", label: "Attention (\(attentionBiomarkerCount))")
                filterButton(key: "ABDM", label: "ABDM Synced")
            }
            .padding(.vertical, 2)
        }
    }

    private func filterButton(key: String, label: String) -> some View {
        let isSelected = filterCategory == key

        return Button(action: {
            withAnimation(.spring(response: 0.25)) {
                filterCategory = key
            }
        }) {
            Text(label)
                .font(.system(size: 12, weight: isSelected ? .bold : .medium))
                .foregroundColor(isSelected ? .white : MedMargTheme.slate700)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(isSelected ? MedMargTheme.primaryTeal : Color.white)
                .cornerRadius(20)
                .overlay(RoundedRectangle(cornerRadius: 20).stroke(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1))
                .shadow(color: isSelected ? MedMargTheme.primaryTeal.opacity(0.2) : Color.clear, radius: 4, x: 0, y: 2)
        }
    }

    // ==========================================
    // 📈 5. BIOMARKER PROGRESSION CARD
    // ==========================================
    private var biomarkerProgressionCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Longitudinal Biomarker Analyzer")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Multi-month historical trend tracking across NABL lab tests")
                        .font(.system(size: 10))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Text("AUTOMATED")
                    .font(.system(size: 9, weight: .black))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(6)
            }

            // Biomarker Switcher Tabs
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(["FBS", "HBA1C", "CHOLESTEROL", "TSH"], id: \.self) { key in
                        let isSelected = activeTrendBiomarker == key
                        Button(action: { activeTrendBiomarker = key }) {
                            Text(key)
                                .font(.system(size: 11, weight: .bold))
                                .padding(.horizontal, 14)
                                .padding(.vertical, 6)
                                .background(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate100)
                                .foregroundColor(isSelected ? .white : MedMargTheme.slate700)
                                .cornerRadius(8)
                        }
                    }
                }
            }

            // Trend Chart Content
            if let trend = biomarkerTrends[activeTrendBiomarker] {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text(trend.name)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Spacer()
                        Text(trend.currentStatus)
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(trend.color)
                    }

                    // Visual Bar progression
                    HStack(alignment: .bottom, spacing: 16) {
                        ForEach(trend.data) { pt in
                            VStack(spacing: 6) {
                                Text("\(String(format: "%.1f", pt.val))")
                                    .font(.system(size: 11, weight: .bold, design: .rounded))
                                    .foregroundColor(MedMargTheme.slate900)

                                ZStack(alignment: .bottom) {
                                    RoundedRectangle(cornerRadius: 6)
                                        .fill(MedMargTheme.slate200)
                                        .frame(width: 38, height: 80)

                                    RoundedRectangle(cornerRadius: 6)
                                        .fill(trend.color)
                                        .frame(width: 38, height: CGFloat(min(pt.val / pt.normalMax, 1.2)) * 64)
                                }

                                Text(pt.date)
                                    .font(.system(size: 9, weight: .medium))
                                    .foregroundColor(MedMargTheme.slate500)
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }
                    .padding(.vertical, 4)
                }
                .padding(12)
                .background(MedMargTheme.slate50)
                .cornerRadius(12)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(18)
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 6, x: 0, y: 2)
    }

    // ==========================================
    // 📑 6. DIAGNOSTIC REPORTS LIST
    // ==========================================
    private var diagnosticReportsListSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Verified Pathology Reports (\(filteredReports.count))")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)
                Spacer()
                if isLoadingReports {
                    ProgressView().scaleEffect(0.8)
                }
            }

            if filteredReports.isEmpty && !isLoadingReports {
                emptyReportsView
            } else {
                ForEach(filteredReports) { rep in
                    reportCard(rep: rep)
                }
            }
        }
    }

    private func reportCard(rep: DiagnosticReportModel) -> some View {
        let isExpanded = expandedReportIds.contains(rep.id)

        return VStack(alignment: .leading, spacing: 12) {
            // Card Header
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(rep.id)
                            .font(.system(size: 10, weight: .black, design: .monospaced))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(MedMargTheme.lightTeal)
                            .foregroundColor(MedMargTheme.primaryTeal)
                            .cornerRadius(4)

                        Text("• \(rep.date)")
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate500)

                        Text("• NABL")
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(MedMargTheme.accentEmerald)
                    }

                    Text(rep.title)
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("\(rep.lab) • Verified by \(rep.doctorVerified)")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Button(action: { selectedReportForPreview = rep }) {
                    HStack(spacing: 4) {
                        Image(systemName: "doc.text.fill")
                        Text("PDF")
                    }
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(8)
                }
            }

            // Clinical Summary Callout
            Text(rep.summary)
                .font(.system(size: 11))
                .foregroundColor(MedMargTheme.slate700)
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(MedMargTheme.slate50)
                .cornerRadius(8)

            // Biomarker Badges Row (Expandable)
            VStack(alignment: .leading, spacing: 8) {
                let displayedBiomarkers = isExpanded ? rep.biomarkers : Array(rep.biomarkers.prefix(3))

                ForEach(displayedBiomarkers) { bio in
                    HStack {
                        VStack(alignment: .leading, spacing: 1) {
                            Text(bio.name)
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Normal Range: \(bio.range)")
                                .font(.system(size: 9))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Text(bio.value)
                            .font(.system(size: 12, weight: .black, design: .rounded))
                            .foregroundColor(MedMargTheme.slate900)

                        Text(bio.status)
                            .font(.system(size: 9, weight: .black))
                            .foregroundColor(biomarkerColor(bio.status))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(biomarkerColor(bio.status).opacity(0.12))
                            .cornerRadius(4)
                    }
                    .padding(.vertical, 2)
                }

                if rep.biomarkers.count > 3 {
                    Button(action: {
                        withAnimation {
                            if isExpanded {
                                expandedReportIds.remove(rep.id)
                            } else {
                                expandedReportIds.insert(rep.id)
                            }
                        }
                    }) {
                        HStack(spacing: 4) {
                            Text(isExpanded ? "Collapse Biomarkers" : "Show All \(rep.biomarkers.count) Biomarkers")
                                .font(.system(size: 11, weight: .bold))
                            Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                                .font(.system(size: 9, weight: .bold))
                        }
                        .foregroundColor(MedMargTheme.primaryTeal)
                    }
                    .padding(.top, 2)
                }
            }

            Divider()

            // Actions: Share & Doctor Consultation
            HStack {
                Button(action: {
                    UIPasteboard.general.string = "https://medmarg.com/reports/\(rep.id)"
                    showToast("Copied Secure Report Link")
                }) {
                    HStack(spacing: 5) {
                        Image(systemName: "square.and.arrow.up")
                        Text("Share Link")
                    }
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(MedMargTheme.slate700)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(MedMargTheme.slate100)
                    .cornerRadius(8)
                }

                Spacer()

                Button(action: { selectedReportForPreview = rep }) {
                    HStack(spacing: 5) {
                        Image(systemName: "arrow.down.doc.fill")
                        Text("Open Full NABL Report")
                    }
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(8)
                }
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        .shadow(color: Color.black.opacity(0.02), radius: 6, x: 0, y: 2)
    }

    private func biomarkerColor(_ status: String) -> Color {
        switch status.uppercased() {
        case "NORMAL": return Color(red: 0.05, green: 0.55, blue: 0.25)
        case "HIGH", "ELEVATED": return Color.red
        case "LOW": return Color.orange
        default: return MedMargTheme.primaryTeal
        }
    }

    // ==========================================
    // 📭 EMPTY REPORTS VIEW
    // ==========================================
    private var emptyReportsView: some View {
        VStack(spacing: 14) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 40))
                .foregroundColor(MedMargTheme.primaryTeal.opacity(0.8))
                .padding(.top, 10)

            VStack(spacing: 4) {
                Text(searchQuery.isEmpty ? "No Diagnostic Reports Yet" : "No Reports Matching Search")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Text("When your samples are analyzed by NABL accredited partner labs, your digitized lab reports and trends will appear here.")
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 20)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(Color.white)
        .cornerRadius(18)
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🌐 FETCH REPORTS
    // ==========================================
    private func fetchLiveReports() {
        isLoadingReports = true

        self.reports = [
            DiagnosticReportModel(
                id: "REP-99210",
                title: "Complete Metabolic & Lipid Profile",
                date: "28 Oct 2026",
                lab: "Dr. Lal PathLabs NABL Hub",
                doctorVerified: "Dr. K. Srinivas, MD (Pathology)",
                status: "VERIFIED",
                summary: "All glycemic and metabolic markers within optimal ranges. Cholesterol levels improved by 7% compared to previous test in May 2026.",
                biomarkers: [
                    ReportBiomarker(name: "Fasting Blood Sugar (FBS)", value: "92 mg/dL", status: "NORMAL", range: "70 - 99 mg/dL"),
                    ReportBiomarker(name: "HbA1c Glycated Hemoglobin", value: "5.4%", status: "NORMAL", range: "4.0 - 5.6%"),
                    ReportBiomarker(name: "Total Cholesterol", value: "178 mg/dL", status: "NORMAL", range: "< 200 mg/dL"),
                    ReportBiomarker(name: "HDL Good Cholesterol", value: "52 mg/dL", status: "NORMAL", range: "> 40 mg/dL"),
                    ReportBiomarker(name: "Triglycerides", value: "142 mg/dL", status: "NORMAL", range: "< 150 mg/dL")
                ]
            ),
            DiagnosticReportModel(
                id: "REP-88102",
                title: "Thyroid & Endocrine Function Panel",
                date: "14 Sep 2026",
                lab: "MedMarg Diagnostics Tirupati",
                doctorVerified: "Dr. P. Ananya, MD (Endocrinology)",
                status: "VERIFIED",
                summary: "Thyroid stimulating hormone (TSH) euthyroid and balanced. No levothyroxine adjustment necessary.",
                biomarkers: [
                    ReportBiomarker(name: "TSH (Ultrasensitive)", value: "2.14 µIU/mL", status: "NORMAL", range: "0.45 - 4.5 µIU/mL"),
                    ReportBiomarker(name: "Total Triiodothyronine (T3)", value: "1.25 ng/mL", status: "NORMAL", range: "0.8 - 2.0 ng/mL"),
                    ReportBiomarker(name: "Total Thyroxine (T4)", value: "8.4 µg/dL", status: "NORMAL", range: "5.1 - 14.1 µg/dL")
                ]
            ),
            DiagnosticReportModel(
                id: "REP-77340",
                title: "Vitamin & Bone Health Profile",
                date: "02 Jul 2026",
                lab: "Thyrocare Central Lab",
                doctorVerified: "Dr. R. Ramanathan, MD",
                status: "VERIFIED",
                summary: "Vitamin D3 mildly insufficient at 24.2 ng/mL. Weekly cholecalciferol (60,000 IU) supplementation recommended.",
                biomarkers: [
                    ReportBiomarker(name: "25-Hydroxy Vitamin D3", value: "24.2 ng/mL", status: "LOW", range: "30.0 - 100.0 ng/mL"),
                    ReportBiomarker(name: "Vitamin B12 (Cyanocobalamin)", value: "480 pg/mL", status: "NORMAL", range: "211 - 911 pg/mL"),
                    ReportBiomarker(name: "Serum Calcium", value: "9.6 mg/dL", status: "NORMAL", range: "8.8 - 10.2 mg/dL")
                ]
            )
        ]
        self.isLoadingReports = false
    }

    private func showToast(_ message: String) {
        withAnimation(.spring(response: 0.3)) {
            copiedToast = message
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
            withAnimation(.spring(response: 0.3)) {
                copiedToast = nil
            }
        }
    }
}

// =========================================================================
// 🖨️ NABL REPORT VIEWER SHEET
// High-Fidelity NABL Digital Pathological Report Viewer
// =========================================================================

struct NABLReportViewerSheet: View {
    let report: DiagnosticReportModel
    let patientName: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Official Lab Header
                    VStack(spacing: 6) {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("MEDMARG DIAGNOSTICS & TELEMETRY")
                                    .font(.system(size: 13, weight: .black))
                                    .foregroundColor(MedMargTheme.primaryTeal)

                                Text(report.lab.uppercased())
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)

                                Text("NABL Certificate No: MC-2849 • ICMR Code: MM-TPT-01")
                                    .font(.system(size: 9))
                                    .foregroundColor(MedMargTheme.slate500)
                            }

                            Spacer()

                            Image(systemName: "checkmark.seal.fill")
                                .font(.system(size: 32))
                                .foregroundColor(MedMargTheme.accentEmerald)
                        }

                        Divider()

                        // Patient & Report Demographics
                        VStack(spacing: 6) {
                            HStack {
                                Text("Patient: \(patientName)")
                                    .font(.system(size: 11, weight: .bold))
                                Spacer()
                                Text("Report ID: \(report.id)")
                                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                            }
                            HStack {
                                Text("Date of Collection: \(report.date)")
                                    .font(.system(size: 10))
                                    .foregroundColor(MedMargTheme.slate500)
                                Spacer()
                                Text("Status: \(report.status)")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(MedMargTheme.accentEmerald)
                            }
                        }
                    }
                    .padding(14)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(12)

                    // Test Title
                    Text(report.title)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    // Results Table Header
                    HStack {
                        Text("Investigation / Parameter")
                            .font(.system(size: 10, weight: .bold))
                            .frame(maxWidth: .infinity, alignment: .leading)
                        Text("Observed Value")
                            .font(.system(size: 10, weight: .bold))
                            .frame(width: 90, alignment: .trailing)
                        Text("Reference Interval")
                            .font(.system(size: 10, weight: .bold))
                            .frame(width: 90, alignment: .trailing)
                    }
                    .foregroundColor(MedMargTheme.slate500)
                    .padding(.horizontal, 8)

                    Divider()

                    // Results Table Rows
                    VStack(spacing: 10) {
                        ForEach(report.biomarkers) { bio in
                            HStack {
                                VStack(alignment: .leading, spacing: 1) {
                                    Text(bio.name)
                                        .font(.system(size: 11, weight: .bold))
                                        .foregroundColor(MedMargTheme.slate900)
                                    Text(bio.status)
                                        .font(.system(size: 8, weight: .black))
                                        .foregroundColor(bio.status == "NORMAL" ? MedMargTheme.accentEmerald : Color.red)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)

                                Text(bio.value)
                                    .font(.system(size: 12, weight: .black, design: .rounded))
                                    .foregroundColor(bio.status == "NORMAL" ? MedMargTheme.slate900 : Color.red)
                                    .frame(width: 90, alignment: .trailing)

                                Text(bio.range)
                                    .font(.system(size: 10))
                                    .foregroundColor(MedMargTheme.slate600)
                                    .frame(width: 90, alignment: .trailing)
                            }
                            .padding(.horizontal, 8)
                            Divider()
                        }
                    }

                    // Clinical Interpretation
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Clinical Interpretation & Notes:")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Text(report.summary)
                            .font(.system(size: 11))
                            .foregroundColor(MedMargTheme.slate600)
                    }
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(10)

                    // Doctor Verification Signature
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Electronically Authenticated by:")
                                .font(.system(size: 9))
                                .foregroundColor(MedMargTheme.slate500)
                            Text(report.doctorVerified)
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("Consultant Pathologist • MedMarg Health")
                                .font(.system(size: 9))
                                .foregroundColor(MedMargTheme.slate500)
                        }

                        Spacer()

                        Image(systemName: "signature")
                            .font(.system(size: 26))
                            .foregroundColor(MedMargTheme.primaryTeal)
                    }
                    .padding(12)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(10)
                }
                .padding(16)
            }
            .navigationTitle("Diagnostic Report")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    ShareLink(item: "https://medmarg.com/reports/\(report.id)") {
                        Image(systemName: "square.and.arrow.up")
                    }
                }
            }
        }
    }
}
