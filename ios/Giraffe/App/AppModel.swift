import SwiftUI

@MainActor
final class AppModel: ObservableObject {
    @Published var isShowingNativeSettings = false
    @Published var lastUpdateCheckReason = "cold-start"

    private var hasBeenInBackground = false

    init() {
        // Stage A records the lifecycle trigger. WebUpdateService will own the real check in stage D.
        requestUpdateCheck(reason: "cold-start")
    }

    func scenePhaseChanged(_ phase: ScenePhase) {
        switch phase {
        case .background:
            hasBeenInBackground = true
        case .active where hasBeenInBackground:
            hasBeenInBackground = false
            requestUpdateCheck(reason: "foreground-resume")
        default:
            break
        }
    }

    func requestUpdateCheck(reason: String) {
        lastUpdateCheckReason = reason
    }
}
