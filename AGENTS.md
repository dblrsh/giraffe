# Giraffe Agent 开发规范

本文件供后续在本仓库工作的自动化代理使用。开始任何任务前，必须先完整阅读 `PROJECT_PLAN.md`；本文是执行摘要，若两者冲突，以 `PROJECT_PLAN.md` 和用户当前指令为准。

本文件是 Codex 与 Claude Code 共用的唯一项目规范源。`CLAUDE.md` 仅负责导入本文件；新增或修改代理规范时，只编辑 `AGENTS.md`，不要在 `CLAUDE.md` 中复制规则。

## 项目定位

Giraffe 是本地优先的个人 iOS 健康与 AI 助手：

- SwiftUI 原生壳负责持久化、HealthKit、相机、Keychain、AI 网络请求、Web 更新和所有敏感确认；
- React + TypeScript Web 应用负责页面展示、导航、图表和普通交互；
- 不建设业务后端、账户系统、云数据库、云同步、远程图床或 API Key 中转服务；
- 安装包必须内置可用 Web 版本，断网和首次启动时仍能进入应用；
- Web 更新只能发布受签名保护的静态资源，不能增加原生权限、执行数据库迁移或改变信任边界。

## 开始工作前

1. 阅读 `PROJECT_PLAN.md`、本文件及任务涉及目录中的说明文件。
2. 执行 `git status --short`，保留用户已有改动，不覆盖无关文件。
3. 检查当前实现阶段、测试记录和未完成项：`docs/TEST_RESULTS.md`。
4. 缺少 Bundle ID、Team ID、证书、UDID、更新域名、公钥或 API Key 时，继续完成可独立验证的代码，并明确记录缺失项；禁止伪造配置或成功结果。

## 架构与目录

```text
ios/                    SwiftUI 原生壳与 XcodeGen 工程
  Giraffe/App/          生命周期与根界面
  Giraffe/WebContainer/ WKWebView、本地 scheme 与导航限制
  Giraffe/Bridge/       Bridge v1 显式路由和类型校验
  Giraffe/Services/     Health、Camera、AI、Updates 原生服务
  Giraffe/Storage/      数据库、加密、Keychain 和附件存储
web/                    React + TypeScript + Vite 应用
contracts/              Bridge 和更新清单机器可读契约
scripts/                构建、同步、打包和签名脚本
docs/                   配置、隐私、发布与测试证据
.github/workflows/      Web、iOS、Ad Hoc 和 Web 发布工作流
```

保持原生、Web、契约与发布工具分离。Web 不得直接读取数据库、任意磁盘路径或密钥。

## 实现顺序

按 `PROJECT_PLAN.md` 的阶段推进：

1. 阶段 A：Swift 壳、内置 Web、Bridge 握手、浏览器 Mock、无签名 CI、Ad Hoc 工作流骨架。
2. 阶段 B：SQLite/GRDB、迁移、Keychain、AES-GCM、文件保护、相机、HealthKit 和清除数据。
3. 阶段 C：DeepSeek 原生密钥输入、不可变请求快照、原生确认、SSE、取消和历史恢复。
4. 阶段 D：签名 Web 更新、兼容检查、安全解压、原子切换、握手、隔离和回滚。
5. 阶段 E：图表、照片管理、OCR、错误体验、操作文档和真机证据。

不要为后续阶段预先暴露宽泛的 Bridge 或系统权限。

## Web 约束

- 使用 React 函数组件、Hooks、TypeScript strict、Vite 和 `HashRouter`。
- 页面组件使用 `.tsx`，Bridge、模型和状态代码使用 `.ts`。
- NativeClient 与组件生命周期分离；订阅卸载时必须清理。
- React StrictMode 下不得重复触发原生操作、AI 请求或数据写入。
- 业务数据不得写入 localStorage、IndexedDB、Service Worker 或持久 Web 数据存储。
- CSP 默认使用 `connect-src 'none'`；禁止远程脚本、外部 CDN、iframe、表单外发和模型返回 HTML 执行。
- 浏览器开发模式只能使用固定的脱敏合成数据。
- 修改 Bridge 方法时同步更新：
  - `web/src/bridge/types.ts`
  - `ios/Giraffe/Bridge/`
  - `contracts/bridge-v1.json`
  - 对应测试

常用验证命令：

```powershell
cd web
npm ci
npm run typecheck
npm test
npm run build
```

构建完成后，从仓库根目录同步原生离线资源：

```powershell
node scripts/sync-web-fallback.mjs
node scripts/package-web.mjs
```

必须提交 `package-lock.json`，不得使用未锁定的 `latest` 依赖。

## iOS 与 Bridge 约束

- 最低版本 iOS 17；使用 Swift、SwiftUI、WKWebView 和 XcodeGen。
- Web 从本地 `giraffe://app/index.html` 加载；不得改成直接加载远程网站。
- WKWebView 使用非持久 `WKWebsiteDataStore`。
- Bridge 只接受受信本地主框架请求，拒绝 iframe、外部 Origin、未知方法、未知字段和版本不匹配。
- Bridge 方法采用显式白名单、严格参数校验、UUID 关联、大小/数量/跨度限制和结构化错误。
- 不提供任意 URL 代理、任意 SQL、任意文件路径、任意 Keychain、任意代码执行或泛化硬件接口。
- API Key 只能通过原生安全界面写入 Keychain；Bridge 只能返回是否已配置。
- 敏感确认、权限说明、数据删除、恢复入口必须保留为原生界面。
- 新增系统权限、Entitlement、原生 API、数据库 schema 或信任公钥时，必须发布新版 IPA。

Windows 环境不能作为 iOS 编译或真机验证证据。原生修改至少应通过 `.github/workflows/ios-ci.yml`；HealthKit、相机、自定义 scheme、签名、OTA 和覆盖安装仍需 iPhone 实机验证。

## 本地数据与隐私

- 聊天、草稿、照片、设置和健康缓存只保存在 App 沙盒。
- 用户内容、健康缓存和附件使用 CryptoKit AES-GCM；主密钥使用不参与同步的 `WhenUnlockedThisDeviceOnly` Keychain 项。
- 数据库和附件启用文件保护；业务目录设置并检查备份排除标记。
- 照片默认不写系统相册；HealthKit 首版只读。
- 健康缓存默认最多保留 7 天，不建立完整 HealthKit 镜像。
- 删除会话必须事务删除关联数据并回收无引用附件。
- 清除全部数据必须由原生二次确认，并删除本应用数据库、附件、缓存、API Key 和本地主密钥；不得删除 HealthKit 源数据。
- 日志、错误信息、CI 输出、剪贴板和测试 fixture 中不得出现密钥、提示词、健康原始记录或照片内容。

## AI 网络请求

- AI 联网默认关闭，由用户在原生设置中配置自己的 Key。
- Swift 只允许直连内置允许列表中的 DeepSeek HTTPS 主机；Web 不能传入任意域名或授权头。
- 每次发送前由 Swift 从本地数据构建不可变快照，并在原生界面完整展示服务、模型和实际发送内容。
- 健康数据、照片、OCR 和历史消息默认不加入请求，必须由用户明确选择并再次确认。
- 用户拒绝、未配置 Key 或处于纯本地模式时不得产生 AI 请求。
- SSE 解析必须覆盖网络分块、UTF-8 分片、多事件、结束标志、断线和取消；不得静默重试可能计费的请求。
- 成功、取消、失败或中断均应节流持久化已有回答和明确状态。

## Web 更新安全

- 未配置真实 HTTPS 更新源和内置 Ed25519 公钥时，远程更新必须保持禁用。
- 先验证 `manifest.json` 原始字节的分离签名，再信任版本、URL、哈希或大小字段。
- 检查原生版本、Bridge 版本和 capabilities；不兼容资源包不得安装。
- 限制 ZIP 为 20 MB、解压后 80 MB、文件数 2000；拒绝路径穿越、绝对路径、符号链接和重复覆盖。
- 只允许约定的静态资源类型，包内依赖必须自包含。
- 更新使用 staging 和原子 active 指针；保留当前、上一稳定和内置版本。
- AI 流、拍摄、原生确认或未保存编辑期间只能标记 pending，不得打断任务或丢失草稿。
- 新 Web 必须在 15 秒内完成 Bridge 握手并报告 ready，否则自动回滚。
- 同序号不同哈希视为异常；失败包必须隔离，不能形成重复安装循环。
- Web 更新不得修改业务数据库 schema，也不得清理数据库、密钥或照片。

## CI、签名与发布

- 日常 CI 不得读取发布证书或私钥。
- 发布工作流必须使用受保护 GitHub Environment；第三方 PR 不得获得 secrets。
- Apple IPA 签名密钥和 Web Ed25519 发布密钥必须分离。
- 不将 `.p12`、`.mobileprovision`、私钥、UDID 或 API Key 提交仓库或上传为普通构建产物。
- 固定 Node、Xcode、XcodeGen 和依赖版本；升级前核对兼容性并更新测试证据。
- 未配置签名材料时，只能说明无签名模拟器构建状态，不能宣称已经生成可安装 IPA。
- Actions Artifact 登录下载地址不能作为 OTA 文件直链；正式 OTA 文件必须通过 iPhone 可访问的 HTTPS 地址托管。

## 测试与交付要求

每次修改按风险执行相关检查，并更新 `docs/TEST_RESULTS.md`。至少区分以下证据：

- Windows 浏览器与脚本测试；
- GitHub macOS 模拟器构建；
- iPhone 真机测试；
- 真实 DeepSeek 请求；
- Ad Hoc OTA 安装与覆盖升级。

Mock 或模拟器结果不得冒充真机验收。重点自动化覆盖 Bridge 白名单和参数校验、数据库迁移事务、加密读写、SSE 分片、清单验签、安全解压与更新状态机。

交付说明应包含：完成内容、运行过的命令及结果、尚未验证的环境、缺失配置和下一阶段工作。不要提交用户未要求的 commit，也不要修改无关文件。
