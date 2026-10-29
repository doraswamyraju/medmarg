import Foundation
import SwiftUI
import Combine

// =============================================================
// 🧪 MEDMARG UNIFIED MASTER CATALOG ITEM MODEL
// =============================================================
struct CatalogItem: Identifiable, Codable, Equatable {
    let id: String
    var serialNo: Int?
    var code: String
    var name: String
    var sampleType: String?
    var fasting: String?
    var category: String?
    var mrp: Int
    var price: Int
    var tatHours: Int?
    var description: String?
    var active: Bool?
    var itemType: String? // "PACKAGE", "PROFILE", "TEST"
    var profiles: [String]?
    var tests: [String]?
    var testCount: Int?
    var discountPercent: Int?
    var tagline: String?
    var popular: Bool?
    var fastingNote: String?
    var sampleTypes: [String]?
    var aliasNames: [String]?

    // Computed Helpers
    var isPackage: Bool {
        return (itemType == "PACKAGE") || (id.hasPrefix("PKG_")) || (profiles != nil && !(profiles?.isEmpty ?? true))
    }

    var isProfile: Bool {
        return (itemType == "PROFILE") || (id.hasPrefix("PROF_"))
    }

    var isTest: Bool {
        return !isPackage && !isProfile
    }

    var displayItemType: String {
        if isPackage { return "HEALTH PACKAGE" }
        if isProfile { return "DIAGNOSTIC PROFILE" }
        return "CLINICAL TEST"
    }

    var displaySample: String {
        if let types = sampleTypes, !types.isEmpty {
            return types.joined(separator: ", ")
        }
        return sampleType ?? "SERUM"
    }

    var requiresFasting: Bool {
        return (fasting?.uppercased() == "YES")
    }

    var calculatedDiscount: Int {
        if let d = discountPercent, d > 0 { return d }
        if mrp > price && mrp > 0 {
            return Int(round(Double(mrp - price) / Double(mrp) * 100.0))
        }
        return 0
    }
}

struct RawCatalogPayload: Codable {
    var profiles: [CatalogItem]?
    var tests: [CatalogItem]?
    var packages: [CatalogItem]?
}

struct TestsApiResponse: Codable {
    var success: Bool?
    var total: Int?
    var tests: [CatalogItem]?
}

struct ProfilesApiResponse: Codable {
    var success: Bool?
    var total: Int?
    var profiles: [CatalogItem]?
}

struct PackagesApiResponse: Codable {
    var success: Bool?
    var total: Int?
    var packages: [CatalogItem]?
}

// =============================================================
// 🏬 MEDMARG CATALOG STORE (SINGLE-LAB ARCHITECTURE OBSERVER)
// =============================================================
class CatalogStore: ObservableObject {
    static let shared = CatalogStore()

    @Published var tests: [CatalogItem] = []
    @Published var profiles: [CatalogItem] = []
    @Published var packages: [CatalogItem] = []
    @Published var allItems: [CatalogItem] = []

    @Published var isLoading: Bool = false
    @Published var isOnlineSynced: Bool = false
    @Published var lastSyncedText: String = "Loaded from Master Store"

    // Default backend URL (Production Hostinger VPS API)
    var backendBaseURL: String = "https://medmarg.com"

    private let userDefaultsKey = "medmarg_cached_catalog_v3"

    init() {
        loadInitialCatalog()
        syncWithBackend()
    }

    // ---------------------------------------------------------
    // 📂 LOAD FROM LOCAL CACHE OR BUNDLED JSON
    // ---------------------------------------------------------
    func loadInitialCatalog() {
        // 1. Check if we have cached catalog in UserDefaults
        if let data = UserDefaults.standard.data(forKey: userDefaultsKey) {
            do {
                let decoded = try JSONDecoder().decode(RawCatalogPayload.self, from: data)
                if let t = decoded.tests, !t.isEmpty {
                    self.applyCatalog(profiles: decoded.profiles ?? [], tests: t, packages: decoded.packages ?? [])
                    self.lastSyncedText = "Loaded from Local Cache"
                    return
                }
            } catch {
                print("Failed to decode cached catalog:", error)
            }
        }

        // 2. Fallback to bundled catalogData.json
        loadBundledCatalog()
    }

    func loadBundledCatalog() {
        var jsonURL = Bundle.main.url(forResource: "catalogData", withExtension: "json")
        
        // If not found directly in bundle root, try looking at relative or alternative path
        if jsonURL == nil {
            let possiblePaths = [
                Bundle.main.bundlePath + "/catalogData.json",
                Bundle.main.bundlePath + "/Contents/Resources/catalogData.json"
            ]
            for path in possiblePaths {
                if FileManager.default.fileExists(atPath: path) {
                    jsonURL = URL(fileURLWithPath: path)
                    break
                }
            }
        }

        guard let url = jsonURL, let data = try? Data(contentsOf: url) else {
            print("⚠️ catalogData.json not found in bundle, using default seed data")
            seedFallbackData()
            return
        }

        do {
            let payload = try JSONDecoder().decode(RawCatalogPayload.self, from: data)
            let profs = payload.profiles ?? []
            let tsts = payload.tests ?? []
            let pkgs = payload.packages ?? []
            self.applyCatalog(profiles: profs, tests: tsts, packages: pkgs)
            self.lastSyncedText = "Loaded \(tsts.count) Tests & \(profs.count) Profiles"
        } catch {
            print("⚠️ Error parsing catalogData.json:", error)
            seedFallbackData()
        }
    }

    private func applyCatalog(profiles: [CatalogItem], tests: [CatalogItem], packages: [CatalogItem]) {
        DispatchQueue.main.async {
            let preparedProfiles = profiles.map { var p = $0; p.itemType = "PROFILE"; return p }
            let preparedTests = tests.map { var t = $0; t.itemType = "TEST"; return t }
            let preparedPackages = packages.map { var pkg = $0; pkg.itemType = "PACKAGE"; return pkg }

            self.profiles = preparedProfiles
            self.tests = preparedTests
            self.packages = preparedPackages

            // Combined list
            var combined: [CatalogItem] = []
            combined.append(contentsOf: preparedPackages)
            combined.append(contentsOf: preparedProfiles)
            combined.append(contentsOf: preparedTests)
            self.allItems = combined
        }
    }

    // ---------------------------------------------------------
    // 🌐 SYNC WITH BACKEND API (ASYNC)
    // ---------------------------------------------------------
    func syncWithBackend() {
        guard let summaryUrl = URL(string: "\(backendBaseURL)/api/v1/catalog/summary") else { return }

        self.isLoading = true

        var request = URLRequest(url: summaryUrl)
        request.timeoutInterval = 3.0

        URLSession.shared.dataTask(with: request) { [weak self] _, response, error in
            guard let self = self else { return }

            if let httpResp = response as? HTTPURLResponse, httpResp.statusCode == 200 {
                // Backend is live! Fetch full sets
                self.fetchFullCatalogFromBackend()
            } else {
                DispatchQueue.main.async {
                    self.isLoading = false
                    print("Backend offline, running on offline master catalog store.")
                }
            }
        }.resume()
    }

    private func fetchFullCatalogFromBackend() {
        let dispatchGroup = DispatchGroup()

        var fetchedPackages: [CatalogItem] = []
        var fetchedProfiles: [CatalogItem] = []
        var fetchedTests: [CatalogItem] = []

        // 1. Packages
        if let url = URL(string: "\(backendBaseURL)/api/v1/catalog/packages") {
            dispatchGroup.enter()
            URLSession.shared.dataTask(with: url) { data, _, _ in
                defer { dispatchGroup.leave() }
                if let d = data, let res = try? JSONDecoder().decode(PackagesApiResponse.self, from: d) {
                    fetchedPackages = res.packages ?? []
                }
            }.resume()
        }

        // 2. Profiles
        if let url = URL(string: "\(backendBaseURL)/api/v1/catalog/profiles") {
            dispatchGroup.enter()
            URLSession.shared.dataTask(with: url) { data, _, _ in
                defer { dispatchGroup.leave() }
                if let d = data, let res = try? JSONDecoder().decode(ProfilesApiResponse.self, from: d) {
                    fetchedProfiles = res.profiles ?? []
                }
            }.resume()
        }

        // 3. Tests
        if let url = URL(string: "\(backendBaseURL)/api/v1/catalog/tests?limit=2000") {
            dispatchGroup.enter()
            URLSession.shared.dataTask(with: url) { data, _, _ in
                defer { dispatchGroup.leave() }
                if let d = data, let res = try? JSONDecoder().decode(TestsApiResponse.self, from: d) {
                    fetchedTests = res.tests ?? []
                }
            }.resume()
        }

        dispatchGroup.notify(queue: .main) { [weak self] in
            guard let self = self else { return }
            self.isLoading = false

            if !fetchedTests.isEmpty || !fetchedProfiles.isEmpty || !fetchedPackages.isEmpty {
                let finalPackages = fetchedPackages.isEmpty ? self.packages : fetchedPackages
                let finalProfiles = fetchedProfiles.isEmpty ? self.profiles : fetchedProfiles
                let finalTests = fetchedTests.isEmpty ? self.tests : fetchedTests

                self.applyCatalog(profiles: finalProfiles, tests: finalTests, packages: finalPackages)
                self.isOnlineSynced = true
                self.lastSyncedText = "Synced with Live Backend (\(finalTests.count) Tests, \(finalProfiles.count) Profiles, \(finalPackages.count) Packages)"

                // Cache in UserDefaults
                let payload = RawCatalogPayload(profiles: finalProfiles, tests: finalTests, packages: finalPackages)
                if let encoded = try? JSONEncoder().encode(payload) {
                    UserDefaults.standard.set(encoded, forKey: self.userDefaultsKey)
                }
            }
        }
    }

    // ---------------------------------------------------------
    // 🔍 FILTER & SEARCH CATALOG ITEMS
    // ---------------------------------------------------------
    func filterItems(tab: String, query: String, fastingFilter: String, sampleFilter: String) -> [CatalogItem] {
        var baseList: [CatalogItem]

        switch tab {
        case "PACKAGES":
            baseList = packages
        case "PROFILES":
            baseList = profiles
        case "TESTS":
            baseList = tests
        default: // "ALL"
            baseList = allItems
        }

        let q = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        return baseList.filter { item in
            // Search query match (name, code, sampleType, description)
            let matchesQuery: Bool = {
                if q.isEmpty { return true }
                if item.name.lowercased().contains(q) { return true }
                if item.code.lowercased().contains(q) { return true }
                if let st = item.sampleType, st.lowercased().contains(q) { return true }
                if let desc = item.description, desc.lowercased().contains(q) { return true }
                if let cat = item.category, cat.lowercased().contains(q) { return true }
                if let aliases = item.aliasNames, aliases.contains(where: { $0.lowercased().contains(q) }) { return true }
                return false
            }()

            // Fasting filter match
            let matchesFasting: Bool = {
                if fastingFilter == "ALL" { return true }
                let isFasting = item.requiresFasting
                if fastingFilter == "YES" { return isFasting }
                if fastingFilter == "NO" { return !isFasting }
                return true
            }()

            // Sample filter match
            let matchesSample: Bool = {
                if sampleFilter == "ALL" { return true }
                let sampleUpper = sampleFilter.uppercased()
                if let st = item.sampleType?.uppercased(), st.contains(sampleUpper) { return true }
                if let types = item.sampleTypes {
                    return types.contains(where: { $0.uppercased().contains(sampleUpper) })
                }
                return false
            }()

            return matchesQuery && matchesFasting && matchesSample
        }
    }

    // ---------------------------------------------------------
    // ➕ ADD NEW TEST ITEM (FOR ADMIN)
    // ---------------------------------------------------------
    func addTest(code: String, name: String, sampleType: String, fasting: String, mrp: Int, price: Int, tatHours: Int, description: String) {
        let newTest = CatalogItem(
            id: "TEST_\(tests.count + 1)",
            serialNo: tests.count + 1,
            code: code.trimmingCharacters(in: .whitespacesAndNewlines).uppercased(),
            name: name.trimmingCharacters(in: .whitespacesAndNewlines),
            sampleType: sampleType.uppercased(),
            fasting: fasting.uppercased(),
            category: "Individual Test",
            mrp: mrp,
            price: price,
            tatHours: tatHours,
            description: description,
            active: true,
            itemType: "TEST"
        )

        DispatchQueue.main.async {
            self.tests.insert(newTest, at: 0)
            self.allItems.insert(newTest, at: 0)
        }
    }

    // ---------------------------------------------------------
    // ➕ ADD NEW PROFILE ITEM (FOR ADMIN)
    // ---------------------------------------------------------
    func addProfile(code: String, name: String, sampleType: String, fasting: String, mrp: Int, price: Int, tatHours: Int, description: String) {
        let newProf = CatalogItem(
            id: "PROF_\(profiles.count + 1)",
            serialNo: profiles.count + 1,
            code: code.trimmingCharacters(in: .whitespacesAndNewlines).uppercased(),
            name: name.trimmingCharacters(in: .whitespacesAndNewlines),
            sampleType: sampleType.uppercased(),
            fasting: fasting.uppercased(),
            category: "Diagnostic Profile",
            mrp: mrp,
            price: price,
            tatHours: tatHours,
            description: description,
            active: true,
            itemType: "PROFILE"
        )

        DispatchQueue.main.async {
            self.profiles.insert(newProf, at: 0)
            self.allItems.insert(newProf, at: 0)
        }
    }

    func deleteItem(id: String) {
        DispatchQueue.main.async {
            self.tests.removeAll(where: { $0.id == id })
            self.profiles.removeAll(where: { $0.id == id })
            self.packages.removeAll(where: { $0.id == id })
            self.allItems.removeAll(where: { $0.id == id })
        }
    }

    // ---------------------------------------------------------
    // ⚡ SEED FALLBACK DATA IF FILE SYSTEM RESTRICTED
    // ---------------------------------------------------------
    private func seedFallbackData() {
        let fallbackPkgs = [
            CatalogItem(id: "PKG_1", code: "MM_MASTER", name: "MedMarg Master Full Body Checkup (100+ Biomarkers)", sampleType: "SERUM, EDTA WHOLE BLOOD", fasting: "YES", category: "Full Body Checkup", mrp: 2499, price: 1199, tatHours: 24, description: "Comprehensive Preventive Health Package covering CBC, Lipid, Liver, Kidney, Thyroid & Vitamins with doorstep collection.", active: true, itemType: "PACKAGE", profiles: ["LIPID"], tests: ["CBC"], testCount: 100, discountPercent: 52, tagline: "Comprehensive Preventive Health Package covering CBC, Lipid, Liver, Kidney, Thyroid & Vitamins", popular: true, fastingNote: "10-12 hours fasting required", sampleTypes: ["SERUM", "EDTA WHOLE BLOOD"])
        ]

        let fallbackProfs = [
            CatalogItem(id: "PROF_1", serialNo: 1, code: "LIPID", name: "Lipid Profile (Complete Heart Risk Panel)", sampleType: "SERUM", fasting: "YES", category: "Diagnostic Profile", mrp: 999, price: 599, tatHours: 24, description: "Comprehensive cardiac lipid assessment: Total Cholesterol, HDL Good Cholesterol, LDL Bad Cholesterol, Triglycerides, VLDL & TC/HDL Ratio.", active: true, itemType: "PROFILE", tests: ["CBC"], testCount: 7)
        ]

        let fallbackTests = [
            CatalogItem(id: "TEST_1", serialNo: 1, code: "CBC", name: "Complete Blood Count (CBC) with ESR", sampleType: "EDTA WHOLE BLOOD", fasting: "NO", category: "Individual Test", mrp: 450, price: 299, tatHours: 12, description: "Complete hemogram evaluating Red Blood Cells, White Blood Cells, Platelets, Hemoglobin, Hematocrit and ESR.", active: true, itemType: "TEST")
        ]

        self.applyCatalog(profiles: fallbackProfs, tests: fallbackTests, packages: fallbackPkgs)
    }
}
