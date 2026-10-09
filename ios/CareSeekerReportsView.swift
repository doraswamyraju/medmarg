import SwiftUI

// =========================================================================
// 📁 CARE SEEKER REPORTS & NABL HEALTH VAULT VIEW
// 100% Feature Parity with Web PatientReportsTab.jsx
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
    @State private var reports: [DiagnosticReportModel] = [
        DiagnosticReportModel(
            id: "REP-8821",
            title: "MedMarg Master Health Checkup (Comprehensive 104 Params)",
            date: "28 Aug 2026",
            lab: "MedMarg Central Diagnostics (NABL ISO 15189)",
            doctorVerified: "Dr. Ananya Sharma (MD Pathologist)",
            status: "VERIFIED_NABL",
            summary: "All vital parameters within normal ranges. Vitamin D3 slightly low (22 ng/mL - mild insufficiency).",
            biomarkers: [
                ReportBiomarker(name: "Fasting Blood Sugar (FBS)", value: "92 mg/dL", status: "NORMAL", range: "70 - 100 mg/dL"),
                ReportBiomarker(name: "HbA1c (Glycated Hemoglobin)", value: "5.4%", status: "NORMAL", range: "< 5.7%"),
                ReportBiomarker(name: "Total Cholesterol", value: "178 mg/dL", status: "NORMAL", range: "< 200 mg/dL"),
                ReportBiomarker(name: "Thyroid TSH", value: "2.14 µIU/mL", status: "NORMAL", range: "0.4 - 4.2 µIU/mL"),
                ReportBiomarker(name: "Vitamin D3 (25-OH)", value: "22.4 ng/mL", status: "LOW", range: "30 - 100 ng/mL"),
                ReportBiomarker(name: "Hemoglobin (CBC)", value: "14.8 g/dL", status: "NORMAL", range: "13.0 - 17.0 g/dL")
            ]
        ),
        DiagnosticReportModel(
            id: "REP-7910",
            title: "Diabetic & Lipid Comprehensive Panel",
            date: "14 May 2026",
            lab: "Apollo Diagnostics Hub / MedMarg Sync",
            doctorVerified: "Dr. K. Sivasankar (Consultant Biochemist)",
            status: "VERIFIED_NABL",
            summary: "Lipid profile optimal. Glycemic control is under healthy limits.",
            biomarkers: [
                ReportBiomarker(name: "Fasting Blood Sugar (FBS)", value: "96 mg/dL", status: "NORMAL", range: "70 - 100 mg/dL"),
                ReportBiomarker(name: "HbA1c", value: "5.6%", status: "NORMAL", range: "< 5.7%"),
                ReportBiomarker(name: "Total Cholesterol", value: "184 mg/dL", status: "NORMAL", range: "< 200 mg/dL")
            ]
        )
    ]

    @State private var activeTrendBiomarker: String = "FBS"
    @State private var selectedReportForPreview: DiagnosticReportModel? = nil
    @State private var expandedReportIds: Set<String> = ["REP-8821"]

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

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                
                // 1. NABL Health Vault Hero Banner
                healthVaultHeroBanner

                // 2. Multi-Month Biomarker Longitudinal Progression Analyzer
                biomarkerProgressionCard

                // 3. Verified Diagnostic Reports List
                diagnosticReportsListSection

                Spacer().frame(height: 80)
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
        }
        .background(MedMargTheme.slate50)
        .sheet(item: $selectedReportForPreview) { rep in
            NABLReportViewerSheet(report: rep)
        }
    }

    // ==========================================
    // 🛡 1. NABL HEALTH VAULT HERO BANNER
    // ==========================================
    private var healthVaultHeroBanner: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Image(systemName: "checkmark.shield.fill")
                            .foregroundColor(MedMargTheme.emeraldLight)
                        Text("100% NABL ACCREDITED LAB REPORTS")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(MedMargTheme.emeraldLight)
                            .tracking(0.5)
                    }

                    Text("Digital Health Vault")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.white)

                    Text("Lifetime tamper-proof encrypted pathology records with doctor digital signatures.")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.lightTeal)
                }

                Spacer()
            }

            // Google Drive Sync Indicator
            HStack(spacing: 8) {
                Image(systemName: "cloud.fill")
                    .foregroundColor(MedMargTheme.emeraldLight)
                Text("Google Drive Auto-Sync: Encrypted & Active")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(Color.white)
                Spacer()
                Text("24/7 Access")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.amberLight)
            }
            .padding(10)
            .background(Color.white.opacity(0.12))
            .cornerRadius(10)
        }
        .padding(20)
        .background(
            LinearGradient(
                colors: [MedMargTheme.darkTeal, Color(red: 0.0, green: 0.35, blue: 0.32)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(22)
        .shadow(color: MedMargTheme.darkTeal.opacity(0.3), radius: 12, x: 0, y: 6)
    }

    // ==========================================
    // 📈 2. BIOMARKER PROGRESSION ANALYZER
    // ==========================================
    private var biomarkerProgressionCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Biomarker Progression Radar")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)
                    Text("Historical multi-test comparative progression analysis")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate500)
                }

                Spacer()

                Text("NABL Verified")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
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
                                .font(.system(size: 12, weight: .bold))
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate100)
                                .foregroundColor(isSelected ? .white : MedMargTheme.slate700)
                                .cornerRadius(10)
                        }
                    }
                }
            }

            // Trend Chart Content
            if let trend = biomarkerTrends[activeTrendBiomarker] {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text(trend.name)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(MedMargTheme.slate900)
                        Spacer()
                        Text(trend.currentStatus)
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(trend.color)
                    }

                    // Visual Bar / Line progression
                    HStack(alignment: .bottom, spacing: 16) {
                        ForEach(trend.data) { pt in
                            VStack(spacing: 6) {
                                Text("\(String(format: "%.1f", pt.val))")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(MedMargTheme.slate900)

                                ZStack(alignment: .bottom) {
                                    RoundedRectangle(cornerRadius: 6)
                                        .fill(MedMargTheme.slate200)
                                        .frame(width: 38, height: 90)

                                    RoundedRectangle(cornerRadius: 6)
                                        .fill(trend.color)
                                        .frame(width: 38, height: CGFloat(min(pt.val / pt.normalMax, 1.2)) * 70)
                                }

                                Text(pt.date)
                                    .font(.system(size: 10, weight: .medium))
                                    .foregroundColor(MedMargTheme.slate500)
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }
                    .padding(.vertical, 8)
                }
                .padding(14)
                .background(MedMargTheme.slate50)
                .cornerRadius(14)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 📑 3. DIAGNOSTIC REPORTS LIST
    // ==========================================
    private var diagnosticReportsListSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Verified Pathology Reports (\(reports.count))")
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            ForEach(reports) { rep in
                let isExpanded = expandedReportIds.contains(rep.id)

                VStack(alignment: .leading, spacing: 12) {
                    
                    // Card Top
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
                            }

                            Text(rep.title)
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)

                            Text("Processing Hub: \(rep.lab)")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)

                            Text("Signed by: \(rep.doctorVerified)")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }

                        Spacer()

                        Button(action: { selectedReportForPreview = rep }) {
                            HStack(spacing: 4) {
                                Image(systemName: "doc.text.viewfinder")
                                Text("View PDF")
                                    .font(.system(size: 12, weight: .bold))
                            }
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(MedMargTheme.primaryTeal)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                        }
                    }

                    // Clinical Summary
                    Text("Remarks: \(rep.summary)")
                        .font(.system(size: 11))
                        .foregroundColor(MedMargTheme.slate700)
                        .padding(8)
                        .background(MedMargTheme.slate50)
                        .cornerRadius(8)

                    // Expandable Biomarkers Toggle
                    Button(action: {
                        if isExpanded {
                            expandedReportIds.remove(rep.id)
                        } else {
                            expandedReportIds.insert(rep.id)
                        }
                    }) {
                        HStack {
                            Text(isExpanded ? "Hide Biomarkers" : "View \(rep.biomarkers.count) Biomarkers")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }
                    }

                    // Biomarkers Table
                    if isExpanded {
                        VStack(spacing: 6) {
                            ForEach(rep.biomarkers) { bio in
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(bio.name)
                                            .font(.system(size: 12, weight: .medium))
                                            .foregroundColor(MedMargTheme.slate900)
                                        Text("Ref Range: \(bio.range)")
                                            .font(.system(size: 10))
                                            .foregroundColor(MedMargTheme.slate500)
                                    }

                                    Spacer()

                                    Text(bio.value)
                                        .font(.system(size: 12, weight: .bold))
                                        .foregroundColor(MedMargTheme.slate900)

                                    Text(bio.status)
                                        .font(.system(size: 9, weight: .black))
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(bio.status == "NORMAL" ? Color.green.opacity(0.12) : Color.orange.opacity(0.12))
                                        .foregroundColor(bio.status == "NORMAL" ? Color(red: 0.03, green: 0.5, blue: 0.3) : Color.orange)
                                        .cornerRadius(4)
                                }
                                .padding(8)
                                .background(MedMargTheme.slate50)
                                .cornerRadius(8)
                            }
                        }
                    }
                }
                .padding(16)
                .background(Color.white)
                .cornerRadius(20)
                .overlay(RoundedRectangle(cornerRadius: 20).stroke(MedMargTheme.slate200, lineWidth: 1))
            }
        }
    }
}

// =========================================================================
// 📄 NABL OFFICIAL LAB REPORT VIEWER SHEET
// =========================================================================

struct NABLReportViewerSheet: View {
    let report: DiagnosticReportModel
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    
                    // Official Report Header
                    VStack(spacing: 8) {
                        HStack {
                            Image(systemName: "cross.case.fill")
                                .foregroundColor(MedMargTheme.primaryTeal)
                            Text("MEDMARG CENTRAL DIAGNOSTICS & RESEARCH HUB")
                                .font(.system(size: 11, weight: .black))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }

                        Text("NABL ACCREDITED (ISO 15189:2022) | ICMR RECOGNIZED")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(MedMargTheme.slate500)

                        Divider()

                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Report ID: \(report.id)")
                                    .font(.system(size: 11, weight: .bold))
                                Text("Patient: Rahul Sharma • Age: 34 • Male")
                                    .font(.system(size: 11))
                            }
                            Spacer()
                            VStack(alignment: .trailing, spacing: 2) {
                                Text("Date: \(report.date)")
                                    .font(.system(size: 11))
                                Text("Status: DIGITALLY VERIFIED")
                                    .font(.system(size: 10, weight: .black))
                                    .foregroundColor(Color.green)
                            }
                        }
                        .foregroundColor(MedMargTheme.slate700)
                    }
                    .padding(14)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(12)

                    // Biomarkers Detailed Breakdown
                    VStack(alignment: .leading, spacing: 8) {
                        Text("CLINICAL BIOMARKERS EVALUATION")
                            .font(.system(size: 12, weight: .black))
                            .foregroundColor(MedMargTheme.slate900)

                        ForEach(report.biomarkers) { bio in
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(bio.name)
                                        .font(.system(size: 12, weight: .bold))
                                        .foregroundColor(MedMargTheme.slate900)
                                    Text("Reference Range: \(bio.range)")
                                        .font(.system(size: 10))
                                        .foregroundColor(MedMargTheme.slate500)
                                }
                                Spacer()
                                Text(bio.value)
                                    .font(.system(size: 13, weight: .black))
                                    .foregroundColor(MedMargTheme.slate900)
                                Text(bio.status)
                                    .font(.system(size: 9, weight: .black))
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(bio.status == "NORMAL" ? Color.green.opacity(0.12) : Color.orange.opacity(0.12))
                                    .foregroundColor(bio.status == "NORMAL" ? Color(red: 0.03, green: 0.5, blue: 0.3) : Color.orange)
                                    .cornerRadius(4)
                            }
                            .padding(10)
                            .background(Color.white)
                            .cornerRadius(10)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(MedMargTheme.slate200, lineWidth: 1))
                        }
                    }

                    // Doctor Sign-off & Encryption Verification
                    VStack(alignment: .leading, spacing: 8) {
                        Text("PATHOLOGIST SIGN-OFF & CRYPTOGRAPHIC PROOF")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(MedMargTheme.slate900)

                        Text("Verified by: \(report.doctorVerified)")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(MedMargTheme.primaryTeal)

                        Text("SHA-256 Hash Verified: e8f9201948ba91c098192a019284fa")
                            .font(.system(size: 10, design: .monospaced))
                            .foregroundColor(MedMargTheme.slate500)
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(12)
                }
                .padding(16)
            }
            .navigationTitle("NABL Lab Report")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
    }
}
