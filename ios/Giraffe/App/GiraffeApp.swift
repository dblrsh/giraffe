import SwiftUI

@main
struct GiraffeApp: App {
    @Environment(\.scenePhase) private var scenePhase
    @StateObject private var model = AppModel()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(model)
        }
        .onChange(of: scenePhase) { _, newPhase in
            model.scenePhaseChanged(newPhase)
        }
    }
}
