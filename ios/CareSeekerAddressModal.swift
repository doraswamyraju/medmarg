import SwiftUI
import MapKit
import CoreLocation

// =========================================================================
// 📍 CARE SEEKER INTERACTIVE ADDRESS ENTRY & PINPOINT GPS MAP MODAL
// Real Interactive MapKit Pinpoint + Zone Auto-Assignment + Custom Other Tag
// =========================================================================

struct InteractiveAddressPickerMapView: UIViewRepresentable {
    @Binding var centerCoordinate: CLLocationCoordinate2D
    var onRegionChanged: ((CLLocationCoordinate2D) -> Void)?

    func makeUIView(context: Context) -> MKMapView {
        let mapView = MKMapView()
        mapView.delegate = context.coordinator
        mapView.showsUserLocation = true
        mapView.isRotateEnabled = false
        mapView.isPitchEnabled = false
        
        let initialRegion = MKCoordinateRegion(
            center: centerCoordinate,
            latitudinalMeters: 1000,
            longitudinalMeters: 1000
        )
        mapView.setRegion(initialRegion, animated: false)
        return mapView
    }

    func updateUIView(_ uiView: MKMapView, context: Context) {
        // Only re-center if significantly changed programmatically
        let currentCenter = uiView.centerCoordinate
        let latDiff = abs(currentCenter.latitude - centerCoordinate.latitude)
        let lonDiff = abs(currentCenter.longitude - centerCoordinate.longitude)
        if latDiff > 0.005 || lonDiff > 0.005 {
            let region = MKCoordinateRegion(
                center: centerCoordinate,
                latitudinalMeters: 1000,
                longitudinalMeters: 1000
            )
            uiView.setRegion(region, animated: true)
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, MKMapViewDelegate {
        var parent: InteractiveAddressPickerMapView

        init(_ parent: InteractiveAddressPickerMapView) {
            self.parent = parent
        }

        func mapView(_ mapView: MKMapView, regionDidChangeAnimated animated: Bool) {
            let newCenter = mapView.centerCoordinate
            DispatchQueue.main.async {
                self.parent.centerCoordinate = newCenter
                self.parent.onRegionChanged?(newCenter)
            }
        }
    }
}

struct CareSeekerAddressModal: View {
    @Binding var isOpen: Bool
    let onSaveAddress: (SavedAddressItem) -> Void

    @State private var label: String = "Home" // "Home", "Parents", "Work", "Other"
    @State private var otherLabelName: String = ""
    @State private var flatNo: String = ""
    @State private var streetAddress: String = "Air Bypass Road"
    @State private var landmark: String = "Near Rama Temple"
    @State private var city: String = "Tirupati, AP"
    @State private var pincode: String = "517501"
    @State private var isDefault: Bool = false
    
    // GPS & Zone Coordinates
    @State private var selectedCoordinate: CLLocationCoordinate2D = CLLocationCoordinate2D(latitude: 13.6288, longitude: 79.4192)
    @State private var detectedZone: String = "Zone 1 (Tirupati Central Hub)"
    @State private var assignedAgent: String = "Phlebotomist Fleet: Ramesh Kumar (AG-01)"
    @State private var isGeocoding: Bool = false

    var effectiveLabel: String {
        if label == "Other" {
            let trimmed = otherLabelName.trimmingCharacters(in: .whitespacesAndNewlines)
            return trimmed.isEmpty ? "Other Location" : trimmed
        }
        return label
    }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    
                    // 1. Live Interactive Map with Center Pinpoint Crosshair
                    interactiveMapPinpointSection

                    // 2. Zone & Phlebotomist Fleet Assignment Badge
                    zoneAssignmentBadge

                    // 3. Address Type Label Switcher + Other Custom Name
                    addressLabelSelector

                    // 4. Detailed Address Form Fields
                    addressFormFields

                    // 5. Save CTA Button
                    saveAddressCTAButton

                    Spacer().frame(height: 30)
                }
                .padding(16)
            }
            .background(MedMargTheme.slate50)
            .navigationTitle("Pinpoint Collection Address")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { isOpen = false }
                }
            }
        }
    }

    // ==========================================
    // 🗺 1. INTERACTIVE MAP SECTION
    // ==========================================
    private var interactiveMapPinpointSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("Drag map to set exact doorstep pin")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(MedMargTheme.slate900)

                Spacer()

                Button(action: locateCurrentGPS) {
                    HStack(spacing: 4) {
                        Image(systemName: "location.fill")
                        Text("Current GPS")
                    }
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(MedMargTheme.primaryTeal)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(MedMargTheme.lightTeal)
                    .cornerRadius(6)
                }
            }

            ZStack {
                InteractiveAddressPickerMapView(
                    centerCoordinate: $selectedCoordinate,
                    onRegionChanged: { coord in
                        updateZoneAndReverseGeocode(coord)
                    }
                )
                .frame(height: 220)
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.08), radius: 6, x: 0, y: 3)

                // Fixed Center Crosshair Pin
                VStack(spacing: 0) {
                    ZStack {
                        Circle()
                            .fill(MedMargTheme.primaryTeal)
                            .frame(width: 36, height: 36)
                            .shadow(color: MedMargTheme.primaryTeal.opacity(0.5), radius: 6, x: 0, y: 3)

                        Image(systemName: "house.fill")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                    }

                    Image(systemName: "arrowtriangle.down.fill")
                        .font(.system(size: 12))
                        .foregroundColor(MedMargTheme.primaryTeal)
                        .offset(y: -3)

                    Circle()
                        .fill(Color.black.opacity(0.25))
                        .frame(width: 8, height: 4)
                }
                .offset(y: -16) // Center the bottom tip of pin over exact center

                // Floating Coordinates Bar
                VStack {
                    Spacer()
                    HStack {
                        HStack(spacing: 6) {
                            Circle()
                                .fill(Color.green)
                                .frame(width: 7, height: 7)
                            Text(String(format: "%.4f° N, %.4f° E", selectedCoordinate.latitude, selectedCoordinate.longitude))
                                .font(.system(size: 11, weight: .bold, design: .monospaced))
                                .foregroundColor(MedMargTheme.slate900)
                        }

                        Spacer()

                        if isGeocoding {
                            ProgressView()
                                .scaleEffect(0.7)
                        } else {
                            Text("GPS Linked")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(MedMargTheme.primaryTeal)
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.white.opacity(0.95))
                    .cornerRadius(10)
                    .shadow(color: Color.black.opacity(0.08), radius: 4, x: 0, y: 2)
                    .padding(8)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(MedMargTheme.slate200, lineWidth: 1))
        }
    }

    // ==========================================
    // 🏢 2. ZONE ASSIGNMENT BADGE
    // ==========================================
    private var zoneAssignmentBadge: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(MedMargTheme.lightTeal)
                    .frame(width: 38, height: 38)
                Image(systemName: "bicycle")
                    .font(.system(size: 18))
                    .foregroundColor(MedMargTheme.primaryTeal)
            }

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(detectedZone)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(MedMargTheme.slate900)

                    Text("AUTO-DISPATCH")
                        .font(.system(size: 8, weight: .black))
                        .foregroundColor(.white)
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(MedMargTheme.accentEmerald)
                        .cornerRadius(4)
                }

                Text(assignedAgent)
                    .font(.system(size: 11))
                    .foregroundColor(MedMargTheme.slate500)
            }

            Spacer()
        }
        .padding(12)
        .background(Color.white)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(MedMargTheme.slate200, lineWidth: 1))
    }

    // ==========================================
    // 🏷 3. ADDRESS LABEL SELECTOR
    // ==========================================
    private var addressLabelSelector: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Address Type")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            HStack(spacing: 8) {
                ForEach(["Home", "Parents", "Work", "Other"], id: \.self) { item in
                    let isSelected = label == item
                    Button(action: {
                        withAnimation {
                            label = item
                        }
                    }) {
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

            // If "Other" is selected, open dedicated custom label name input
            if label == "Other" {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Specify Address Name")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(MedMargTheme.primaryTeal)

                    TextField("e.g. Sister's Flat, Doctor Clinic, Guest House, Office", text: $otherLabelName)
                        .font(.system(size: 13))
                        .padding(10)
                        .background(Color.white)
                        .cornerRadius(8)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.primaryTeal, lineWidth: 1.2))
                }
                .padding(.top, 4)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
    }

    // ==========================================
    // 📝 4. ADDRESS FORM FIELDS
    // ==========================================
    private var addressFormFields: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Doorstep Details")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(MedMargTheme.slate900)

            TextField("Flat / Door No / Apartment Name (e.g. Flat 302, Sri Sai Nilayam)", text: $flatNo)
                .font(.system(size: 13))
                .padding(10)
                .background(Color.white)
                .cornerRadius(8)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))

            TextField("Street / Area / Road (e.g. Air Bypass Road)", text: $streetAddress)
                .font(.system(size: 13))
                .padding(10)
                .background(Color.white)
                .cornerRadius(8)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))

            TextField("Landmark (e.g. Opposite SBI Bank / Near Rama Temple)", text: $landmark)
                .font(.system(size: 13))
                .padding(10)
                .background(Color.white)
                .cornerRadius(8)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))

            HStack(spacing: 10) {
                TextField("City (e.g. Tirupati, AP)", text: $city)
                    .font(.system(size: 13))
                    .padding(10)
                    .background(Color.white)
                    .cornerRadius(8)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(MedMargTheme.slate200, lineWidth: 1))

                TextField("Pincode", text: $pincode)
                    .keyboardType(.numberPad)
                    .font(.system(size: 13))
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

    // ==========================================
    // 💾 5. SAVE CTA BUTTON
    // ==========================================
    private var saveAddressCTAButton: some View {
        Button(action: {
            let full = "\(flatNo.isEmpty ? "" : "\(flatNo), ")\(streetAddress), \(landmark.isEmpty ? "" : "\(landmark), ")\(city) - \(pincode)"
            let newAddr = SavedAddressItem(
                id: "addr_\(Int(Date().timeIntervalSince1970))",
                label: effectiveLabel,
                address: full,
                isDefault: isDefault,
                city: city,
                pincode: pincode
            )
            onSaveAddress(newAddr)
            isOpen = false
        }) {
            HStack(spacing: 6) {
                Image(systemName: "checkmark.circle.fill")
                Text("Confirm Location & Save Address")
            }
            .font(.system(size: 14, weight: .bold))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(MedMargTheme.primaryTeal)
            .foregroundColor(.white)
            .cornerRadius(14)
            .shadow(color: MedMargTheme.primaryTeal.opacity(0.3), radius: 6, x: 0, y: 3)
        }
    }

    // ==========================================
    // 🧭 GEOCODING & ZONE CALCULATION
    // ==========================================
    private func updateZoneAndReverseGeocode(_ coord: CLLocationCoordinate2D) {
        // Compute Zone based on latitude / longitude
        if coord.latitude > 13.6350 {
            detectedZone = "Zone 2 (Renigunta Hub)"
            assignedAgent = "Phlebotomist Fleet: Anand Reddy (AG-02)"
        } else if coord.longitude < 79.4100 {
            detectedZone = "Zone 3 (Chandragiri Road Hub)"
            assignedAgent = "Phlebotomist Fleet: Suresh Babu (AG-03)"
        } else {
            detectedZone = "Zone 1 (Tirupati Central Hub)"
            assignedAgent = "Phlebotomist Fleet: Ramesh Kumar (AG-01)"
        }

        // Reverse Geocode
        isGeocoding = true
        let geocoder = CLGeocoder()
        let location = CLLocation(latitude: coord.latitude, longitude: coord.longitude)
        geocoder.reverseGeocodeLocation(location) { placemarks, error in
            DispatchQueue.main.async {
                self.isGeocoding = false
                if let pm = placemarks?.first {
                    if let thoroughfare = pm.thoroughfare {
                        self.streetAddress = thoroughfare
                    } else if let subLocality = pm.subLocality {
                        self.streetAddress = subLocality
                    }
                    if let locality = pm.locality {
                        self.city = "\(locality), AP"
                    }
                    if let postalCode = pm.postalCode {
                        self.pincode = postalCode
                    }
                }
            }
        }
    }

    private func locateCurrentGPS() {
        selectedCoordinate = CLLocationCoordinate2D(latitude: 13.6288, longitude: 79.4192)
        updateZoneAndReverseGeocode(selectedCoordinate)
    }
}
