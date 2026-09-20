import Foundation
import WebKit

@MainActor
final class BridgeRouter: NSObject, WKScriptMessageHandlerWithReply {
    static let handlerName = "nativeBridge"
    static let bridgeVersion = 1
    static let capabilities = [
        "app.getCapabilities",
        "app.getVersions",
        "app.openNativeSettings",
        "updates.getStatus"
    ]

    private weak var model: AppModel?

    init(model: AppModel) {
        self.model = model
    }

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage,
        replyHandler: @escaping (Any?, String?) -> Void
    ) {
        guard message.frameInfo.isMainFrame,
              message.frameInfo.securityOrigin.protocol == "giraffe",
              message.frameInfo.securityOrigin.host == "app" else {
            replyHandler(Self.failure(id: nil, code: .untrustedSource, message: "Bridge 仅允许本地主框架调用"), nil)
            return
        }
        guard JSONSerialization.isValidJSONObject(message.body),
              let data = try? JSONSerialization.data(withJSONObject: message.body),
              let request = try? JSONDecoder().decode(BridgeRequest.self, from: data) else {
            replyHandler(Self.failure(id: nil, code: .invalidRequest, message: "请求格式无效"), nil)
            return
        }
        guard request.bridgeVersion == Self.bridgeVersion else {
            replyHandler(Self.failure(id: request.id, code: .versionMismatch, message: "Bridge 版本不兼容"), nil)
            return
        }
        guard Self.capabilities.contains(request.method) else {
            replyHandler(Self.failure(id: request.id, code: .capabilityUnavailable, message: "当前原生壳不支持此能力"), nil)
            return
        }
        guard request.params.isEmpty else {
            replyHandler(Self.failure(id: request.id, code: .invalidRequest, message: "此方法不接受参数"), nil)
            return
        }

        switch request.method {
        case "app.getCapabilities":
            replyHandler(Self.success(id: request.id, data: [
                "bridgeVersion": Self.bridgeVersion,
                "nativeVersion": Bundle.main.shortVersion,
                "capabilities": Self.capabilities
            ]), nil)
        case "app.getVersions":
            replyHandler(Self.success(id: request.id, data: [
                "nativeVersion": Bundle.main.shortVersion,
                "webVersion": "0.1.0",
                "bridgeVersion": Self.bridgeVersion
            ]), nil)
        case "app.openNativeSettings":
            model?.isShowingNativeSettings = true
            replyHandler(Self.success(id: request.id, data: ["opened": true]), nil)
        case "updates.getStatus":
            replyHandler(Self.success(id: request.id, data: [
                "state": "disabled",
                "activeWebVersion": "0.1.0",
                "message": "远程更新域名和公钥未配置"
            ]), nil)
        default:
            replyHandler(Self.failure(id: request.id, code: .capabilityUnavailable, message: "尚未实现"), nil)
        }
    }

    private static func success(id: UUID, data: Any) -> [String: Any] {
        ["id": id.uuidString.lowercased(), "ok": true, "data": data]
    }

    private static func failure(id: UUID?, code: BridgeErrorCode, message: String) -> [String: Any] {
        [
            "id": id?.uuidString.lowercased() ?? "unknown",
            "ok": false,
            "error": ["code": code.rawValue, "message": message]
        ]
    }
}
