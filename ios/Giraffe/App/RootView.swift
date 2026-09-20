import SwiftUI

struct RootView: View {
    @EnvironmentObject private var model: AppModel

    var body: some View {
        NavigationStack {
            WebContainerView()
                .ignoresSafeArea()
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("原生设置", systemImage: "lock.shield") {
                            model.isShowingNativeSettings = true
                        }
                        .labelStyle(.iconOnly)
                    }
                }
        }
        .sheet(isPresented: $model.isShowingNativeSettings) {
            NativeSettingsView()
        }
    }
}
