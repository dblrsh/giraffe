import SwiftUI

struct NativeSettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var model: AppModel

    var body: some View {
        NavigationStack {
            Form {
                Section("AI 联网") {
                    LabeledContent("状态", value: "关闭")
                    Text("API Key 的 Keychain 保存和发送前确认将在阶段 C 实现。Web 页面不会获得读取密钥的接口。")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                Section("诊断") {
                    LabeledContent("原生版本", value: Bundle.main.shortVersion)
                    LabeledContent("Bridge", value: "1")
                    LabeledContent("更新检查触发", value: model.lastUpdateCheckReason)
                    LabeledContent("远程更新", value: "未配置，安全禁用")
                }
                Section("本地数据") {
                    Text("数据库、加密附件与清除全部数据流程将在阶段 B 实现。")
                }
            }
            .navigationTitle("原生设置")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("完成") { dismiss() }
                }
            }
        }
    }
}

extension Bundle {
    var shortVersion: String {
        object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "未知"
    }
}
