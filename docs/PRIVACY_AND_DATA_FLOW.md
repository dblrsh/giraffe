# 隐私与数据流骨架

当前阶段仅有内置 Web 页面与原生 Bridge 握手。Web CSP 的 `connect-src 'none'` 禁止页面自行联网，`WKWebView` 使用非持久数据存储。

后续允许的业务网络出口只有：

1. 受信静态更新源的签名资源下载；
2. 用户在原生界面确认后，由 Swift 直连 DeepSeek。

不得向 Web 提供 API Key、任意 URL 代理、任意文件路径、SQL 或 Keychain 接口。HealthKit、相机、存储、更新和 AI 的完整数据边界以 `PROJECT_PLAN.md` 为准。
