import Foundation
import UniformTypeIdentifiers
import WebKit

final class LocalWebSchemeHandler: NSObject, WKURLSchemeHandler {
    private let rootURL: URL?

    override init() {
        rootURL = Bundle.main.resourceURL?.appendingPathComponent("WebFallback", isDirectory: true)
        super.init()
    }

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let requestURL = urlSchemeTask.request.url,
              requestURL.scheme == "giraffe",
              requestURL.host == "app",
              let relativePath = LocalPathPolicy.safeRelativePath(requestURL.path),
              let rootURL else {
            fail(urlSchemeTask, code: .fileNoSuchFile)
            return
        }

        let fileURL = rootURL.appendingPathComponent(relativePath).standardizedFileURL
        guard fileURL.path.hasPrefix(rootURL.standardizedFileURL.path),
              let data = try? Data(contentsOf: fileURL) else {
            fail(urlSchemeTask, code: .fileNoSuchFile)
            return
        }

        let mimeType = UTType(filenameExtension: fileURL.pathExtension)?.preferredMIMEType ?? "application/octet-stream"
        let response = URLResponse(url: requestURL, mimeType: mimeType, expectedContentLength: data.count, textEncodingName: "utf-8")
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}

    private func fail(_ task: WKURLSchemeTask, code: CocoaError.Code) {
        task.didFailWithError(CocoaError(code))
    }
}

enum LocalPathPolicy {
    static func safeRelativePath(_ rawPath: String) -> String? {
        let decoded = rawPath.removingPercentEncoding ?? rawPath
        let path = decoded == "/" ? "index.html" : String(decoded.drop(while: { $0 == "/" }))
        let components = path.split(separator: "/", omittingEmptySubsequences: false)
        guard !path.isEmpty,
              !components.contains(where: { $0 == ".." || $0 == "." || $0.isEmpty }),
              !path.contains("\\") else { return nil }
        return path
    }
}
