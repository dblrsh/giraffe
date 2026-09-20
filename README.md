# Giraffe

Giraffe 是一个本地优先的 iOS 健康与 AI 助手。原生 SwiftUI 壳负责权限、存储和网络边界，React 页面负责界面与普通交互。

当前仓库提供项目骨架（阶段 A）：

- React + TypeScript + Vite Web 应用，浏览器中自动使用脱敏 Mock 数据；
- SwiftUI + `WKWebView` 壳，从内置 `giraffe://app/` 资源加载页面；
- Bridge v1 的请求、响应、能力协商和来源校验骨架；
- XcodeGen 工程声明和 GitHub Actions 无签名构建；
- Web 更新清单与 Bridge 的机器可读契约。

## 快速开始

```powershell
cd web
npm ci
npm run dev
```

完整检查：

```powershell
cd web
npm run check
```

iOS 工程需在 macOS 安装 XcodeGen 后生成：

```bash
cd ios
xcodegen generate
open Giraffe.xcodeproj
```

CI 在生成 Xcode 工程前会执行 `npm run build`，再把 `web/dist` 同步到原生内置资源目录。项目目标、隐私边界及分阶段验收标准见 [PROJECT_PLAN.md](PROJECT_PLAN.md)。Windows 开发说明见 [docs/SETUP_WINDOWS.md](docs/SETUP_WINDOWS.md)。
giraffe ios app
