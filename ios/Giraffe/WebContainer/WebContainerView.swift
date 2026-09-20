import SwiftUI
import WebKit

struct WebContainerView: UIViewRepresentable {
    @EnvironmentObject private var model: AppModel

    func makeCoordinator() -> Coordinator { Coordinator(model: model) }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.setURLSchemeHandler(LocalWebSchemeHandler(), forURLScheme: "giraffe")
        configuration.userContentController.addScriptMessageHandler(
            context.coordinator.router,
            contentWorld: .page,
            name: BridgeRouter.handlerName
        )

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.isInspectable = true
        webView.load(URLRequest(url: URL(string: "giraffe://app/index.html")!))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate {
        let router: BridgeRouter

        init(model: AppModel) {
            router = BridgeRouter(model: model)
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.cancel)
                return
            }
            let isTrustedLocalNavigation = url.scheme == "giraffe" && url.host == "app"
            decisionHandler(isTrustedLocalNavigation ? .allow : .cancel)
        }

        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for navigationAction: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? { nil }
    }
}
