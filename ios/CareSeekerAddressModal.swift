import SwiftUI

// =========================================================================
// 📍 CARE SEEKER ADDRESS ENTRY & PINPOINT GPS MODAL
// 100% Feature Parity with Web CareSeekerAddressModal.jsx
// =========================================================================

struct CareSeekerAddressModal: View {
    @Binding var isOpen: Bool
    let onSaveAddress: (SavedAddressItem) -> Void

    @State private var label: String = "Home"
    @State private var flatNo: String = ""
    @State private var streetAddress: String = "Air Bypass Road"
    @State private var landmark: String = "Near Rama Temple"
    @State private var city: String = "Tirupati, AP"
    @State private var pincode: String = "517501"
    @State private var isDefault: Bool = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    
                    // Pinpoint Map Simulation Box
                    pinpointMapBox

                    // Address Label Switcher (Home, Work, Parents, Other)
                    addressLabelSelector

                    // Form Fields
                    addressFormFields

                    // Save Button
                    saveAddressCTAButton

                    Spacer().frame(height: 30)
                }
                .padding(16)
            }
            .background(MedMargTheme.slate50)
            .navigationTitle("Add Doorstep Address")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { isOpen = false }
                }
            }
        }
    }

    private var pinpointMapBox: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(red: 0.93, green: 0.95, blue: 0.96))
                .frame(height: 160)

            VStack(spacing: 16) {
                ForEach(0..<4) { _ in
                    Divider().background(Color.black.opacity(0.04))
                }
            }

            VStack(spacing: 4) {
                ZStack {
                    Circle()
                        .fill(MedMargTheme.primaryTeal.opacity(0.2))
                        .frame(width: 44, height: 44)
                    Image(systemName: "mappin.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(MedMargTheme.primaryTeal)
                }
                Text("Pinpoint Location: 13.6288° N, 79.4192° E")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.white)
                    .foregroundColor(MedMargTheme.slate900)
                    .cornerRadius(6)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    private var addressLabelSelector: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Address Type")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            HStack(spacing: 8) {
                ForEach(["Home", "Parents", "Work", "Other"], id: \.self) { item in
                    let isSelected = label == item
                    Button(action: { label = item }) {
                        Text(item)
                            .font(.system(size: 12, weight: .bold))
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(isSelected ? MedMargTheme.primaryTeal : Color.white)
                            .foregroundColor(isSelected ? .white : MedMargTheme.slate700)
                            .cornerRadius(8)
                            .overlay(RoundedRectangle(cornerRadius: 8).stroke(isSelected ? MedMargTheme.primaryTeal : MedMargTheme.slate200, lineWidth: 1))
                    }
                }
            }
        }
    }

    private var addressFormFields: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Address Details")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            TextField("Flat / Door No / Building Name (e.g. Plot 42)", text: $flatNo)
                .padding(10)
                .background(Color.white)
                .cornerRadius(8)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))

            TextField("Street / Area / Road (e.g. Air Bypass Road)", text: $streetAddress)
                .padding(10)
                .background(Color.white)
                .cornerRadius(8)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))

            TextField("Landmark (e.g. Near Rama Temple)", text: $landmark)
                .padding(10)
                .background(Color.white)
                .cornerRadius(8)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))

            HStack(spacing: 10) {
                TextField("City (e.g. Tirupati, AP)", text: $city)
                    .padding(10)
                    .background(Color.white)
                    .cornerRadius(8)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))

                TextField("Pincode", text: $pincode)
                    .keyboardType(.numberPad)
                    .padding(10)
                    .background(Color.white)
                    .cornerRadius(8)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))
            }

            Toggle(isOn: $isDefault) {
                Text("Set as default collection address")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(MedMargTheme.slate700)
            }
            .toggleStyle(SwitchToggleStyle(tint: MedMargTheme.primaryTeal))
            .padding(.top, 4)
        }
    }

    private var saveAddressCTAButton: some View {
        Button(action: {
            let full = "\(flatNo.isEmpty ? "" : "\(flatNo), ")\(streetAddress), \(city) - \(pincode)"
            let newAddr = SavedAddressItem(
                id: "addr_\(Date().timeIntervalSince1970)",
                label: label,
                address: full,
                isDefault: isDefault,
                city: city,
                pincode: pincode
            )
            onSaveAddress(newAddr)
            isOpen = false
        }) {
            Text("Save Address")
                .font(.system(size: 14, weight: .bold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(MedMargTheme.primaryTeal)
                .foregroundColor(.white)
                .cornerRadius(14)
        }
    }
}
