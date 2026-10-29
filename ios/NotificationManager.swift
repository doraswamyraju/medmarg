import Foundation
import UIKit
import UserNotifications

// =============================================================
// 🔔 MEDMARG PUSH & IN-APP NOTIFICATION MANAGER (iOS)
// =============================================================

class NotificationManager: NSObject, ObservableObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationManager()

    @Published var deviceTokenString: String? = nil
    @Published var permissionGranted: Bool = false

    private let backendURL = "https://medmarg.com/api/v1/notifications"

    override init() {
        super.init()
        UNUserNotificationCenter.current().delegate = self
    }

    /// Request Push Notification Authorization
    func requestAuthorization(completion: @escaping (Bool) -> Void = { _ in }) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            DispatchQueue.main.async {
                self.permissionGranted = granted
                if granted {
                    UIApplication.shared.registerForRemoteNotifications()
                    print("✅ [NotificationManager] iOS Push notification authorization granted.")
                } else if let error = error {
                    print("⚠️ [NotificationManager] Push notification permission error: \(error.localizedDescription)")
                }
                completion(granted)
            }
        }
    }

    /// Handle Received Device Token from APNs & Sync with MedMarg Backend
    func registerDeviceToken(_ deviceToken: Data, userId: String? = nil, email: String? = nil) {
        let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
        let token = tokenParts.joined()
        self.deviceTokenString = token
        print("📲 [NotificationManager] APNs Device Token: \(token)")

        // Send to MedMarg backend API
        guard let url = URL(string: "\(backendURL)/register-token") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload: [String: Any] = [
            "token": token,
            "platform": "ios",
            "userId": userId ?? "GUEST_IOS",
            "email": email ?? ""
        ]

        guard let httpBody = try? JSONSerialization.data(withJSONObject: payload, options: []) else { return }
        request.httpBody = httpBody

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("⚠️ [NotificationManager] Failed to sync push token with backend: \(error.localizedDescription)")
            } else {
                print("✅ [NotificationManager] Successfully synced device push token with MedMarg Backend!")
            }
        }.resume()
    }

    // UNUserNotificationCenterDelegate: Handle Foreground Notifications
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .badge, .sound])
    }

    // UNUserNotificationCenterDelegate: Handle Notification Tap Action
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        print("🔔 [NotificationManager] User tapped notification with payload: \(userInfo)")
        completionHandler()
    }
}
