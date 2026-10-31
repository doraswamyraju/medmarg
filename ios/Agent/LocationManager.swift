import Foundation
import CoreLocation
import Combine

// =========================================================================
// 📍 MEDMARG AGENT CORE LOCATION & TELEMETRY ENGINE
// Requests runtime permissions & broadcasts live GPS to MedMarg backend
// =========================================================================

class AgentLocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    static let shared = AgentLocationManager()

    private let clManager = CLLocationManager()
    
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    @Published var lastLocation: CLLocation? = nil
    @Published var isTransmitting: Bool = false
    @Published var permissionDenied: Bool = false

    private var activeAgentId: String = "AG-01"
    private var activeAgentName: String = "Ramesh Kumar"
    private var lastBroadcastTime: Date = Date.distantPast

    override init() {
        super.init()
        clManager.delegate = self
        clManager.desiredAccuracy = kCLLocationAccuracyBest
        clManager.distanceFilter = 15.0 // Broadcast every 15 meters
        self.authorizationStatus = clManager.authorizationStatus
    }

    func configureAgent(id: String, name: String) {
        self.activeAgentId = id.isEmpty ? "AG-01" : id
        self.activeAgentName = name.isEmpty ? "Ramesh Kumar" : name
    }

    func requestLocationPermission() {
        if authorizationStatus == .notDetermined {
            clManager.requestWhenInUseAuthorization()
        } else if authorizationStatus == .denied || authorizationStatus == .restricted {
            permissionDenied = true
        } else {
            clManager.startUpdatingLocation()
        }
    }

    func startBroadcasting(duty: Bool) {
        guard duty else {
            stopBroadcasting()
            return
        }

        requestLocationPermission()

        if authorizationStatus == .authorizedWhenInUse || authorizationStatus == .authorizedAlways {
            clManager.startUpdatingLocation()
            isTransmitting = true
            permissionDenied = false
        }
    }

    func stopBroadcasting() {
        clManager.stopUpdatingLocation()
        isTransmitting = false
    }

    // ==========================================
    // 📡 CoreLocation Delegate Callbacks
    // ==========================================

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        DispatchQueue.main.async {
            self.authorizationStatus = manager.authorizationStatus
            switch manager.authorizationStatus {
            case .authorizedAlways, .authorizedWhenInUse:
                self.permissionDenied = false
                self.clManager.startUpdatingLocation()
                self.isTransmitting = true
            case .denied, .restricted:
                self.permissionDenied = true
                self.isTransmitting = false
            case .notDetermined:
                self.permissionDenied = false
            @unknown default:
                break
            }
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }

        DispatchQueue.main.async {
            self.lastLocation = location
        }

        // Throttle server transmission to at most once per 6 seconds
        let now = Date()
        guard now.timeIntervalSince(lastBroadcastTime) >= 6.0 else { return }
        lastBroadcastTime = now

        transmitLocationToServer(location: location)
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("[AgentLocationManager] Error updating location:", error.localizedDescription)
    }

    // ==========================================
    // 🌐 Transmit coordinates to MedMarg Dispatch Engine
    // ==========================================
    private func transmitLocationToServer(location: CLLocation) {
        guard let url = URL(string: "https://medmarg.com/api/v1/agent/location") else { return }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.timeoutInterval = 5.0

        let payload: [String: Any] = [
            "agentId": activeAgentId,
            "agentName": activeAgentName,
            "lat": location.coordinate.latitude,
            "lng": location.coordinate.longitude,
            "speed": max(0, location.speed),
            "heading": max(0, location.course),
            "accuracy": location.horizontalAccuracy,
            "timestamp": Date().timeIntervalSince1970
        ]

        req.httpBody = try? JSONSerialization.data(withJSONObject: payload, options: [])
        URLSession.shared.dataTask(with: req).resume()
    }
}

