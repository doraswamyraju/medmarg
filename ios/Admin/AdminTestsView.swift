import SwiftUI

struct AdminTestsView: View {
    @Binding var testsList: [LabTestItem]
    @Binding var showAddTestSheet: Bool

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Diagnostic Tests & Packages Catalog")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Spacer()

                Button(action: { showAddTestSheet = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                        Text("Add Test")
                    }
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(MedMargTheme.primaryTeal)
                    .cornerRadius(8)
                }
            }

            ForEach(testsList) { test in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(test.name)
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(MedMargTheme.slate900)
                            Text("\(test.category) • \(test.params) Parameters")
                                .font(.system(size: 11))
                                .foregroundColor(MedMargTheme.slate500)
                        }
                        Spacer()
                        Text(test.yellowTag)
                            .font(.system(size: 9, weight: .bold))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(MedMargTheme.amberLight)
                            .foregroundColor(MedMargTheme.amberGold)
                            .cornerRadius(4)
                    }

                    // Multi-Lab Pricing Bar
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 1) {
                            Text("Thyrocare Rate")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                            Text("₹\(test.thyrocarePrice)")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }

                        VStack(alignment: .leading, spacing: 1) {
                            Text("Apollo Price")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                            Text("₹\(test.apolloPrice)")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(MedMargTheme.slate700)
                        }

                        VStack(alignment: .leading, spacing: 1) {
                            Text("Lal Path Price")
                                .font(.system(size: 10))
                                .foregroundColor(MedMargTheme.slate500)
                            Text("₹\(test.lalPrice)")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(MedMargTheme.slate700)
                        }

                        Spacer()

                        Button(action: {
                            testsList.removeAll(where: { $0.id == test.id })
                        }) {
                            Image(systemName: "trash")
                                .foregroundColor(.red)
                                .font(.system(size: 14))
                        }
                    }
                    .padding(8)
                    .background(MedMargTheme.slate50)
                    .cornerRadius(8)
                }
                .padding(14)
                .background(MedMargTheme.pureWhite)
                .cornerRadius(12)
            }
        }
    }
}
