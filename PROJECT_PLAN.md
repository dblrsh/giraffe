# Giraffe iOS 项目规划与实现规范

版本：1.1 · 日期：2026-09-20 · 项目目录：`D:\work\giraffe`

本文是后续 Codex 实现的项目依据。本次仅规划，不代表功能已实现。默认面向个人 iPhone，通过付费 Apple Developer Program 的 Ad Hoc 分发；开发者使用 Windows，编译签名由 GitHub Actions macOS Runner 完成。

## 1. 产品目标与明确边界

开发一个本地优先的个人健康与 AI 助手：Swift 原生壳承载 Web 界面，Web 页面负责展示和普通业务交互，Swift 负责数据保存、健康数据、相机、密钥、AI 网络请求和资源更新。

核心要求：

- 聊天记录、照片、设置、健康摘要和用户创建的数据，由应用持久保存于手机，不建立业务后端，不使用云数据库或跨设备同步。
- 日常界面、样式和使用既有原生接口的业务逻辑，可下载 Web 资源包更新，无需重新安装 IPA。
- Web 使用 React + TypeScript。每次冷启动，以及从后台重新打开 App 时，检查服务器是否发布新版本；有兼容更新则自动下载并在安全时机应用，无需用户确认更新。
- 安装包内置可用的 Web 基础版本；首次启动及断网时仍能打开应用和查看本地数据。
- 支持调用 DeepSeek API、拍摄照片、读取用户明确授权的 HealthKit 数据。
- 原生功能或权限变化、签名到期仍可能需要重新构建并覆盖安装 IPA。网络更新不能延长 Ad Hoc 签名有效期。
- 不要求用户购买 Mac；必须提供 Windows 开发 Web、云端构建 iOS、手机 OTA 安装的工作流。

### 1.1 “只在本地存储”与 DeepSeek 的关系

本项目对该要求采用以下可实施解释：**应用不向自建服务器存储业务数据；用户选择调用 DeepSeek 时，将确认的请求内容直接发送给 DeepSeek 进行云端推理。**

DeepSeek 必须接收请求内容才能回答。其服务端日志、缓存和保留行为取决于提供方政策，不能承诺“内容从不离开手机”或“提供方绝不留存”。上线 AI 接入前核对当时 API 数据政策，并在首次启用时明确告知。

采用以下默认规则：

- AI 联网默认关闭，由用户在原生设置中启用、填写自己的 API Key。
- 每次 AI 请求均由原生确认界面展示目标服务、模型和实际待发送内容，包括被选中的历史对话与附件摘要；确认前不发送。
- 健康数据、照片和 OCR 文本不自动加入提示词；必须由用户选择，再在原生界面确认。
- 拒绝发送或未配置 API Key 时，本地功能正常使用。
- 如果用户要求“任何数据绝不离开手机”，启用纯本地模式，并禁用 DeepSeek；本地模型不属于首版范围。

### 1.2 备份与系统服务边界

- 不启用 CloudKit、iCloud Documents、Keychain 同步，不写入公共相册作为默认存储方式。
- 对应用管理的业务目录设置备份排除标记，并在文件替换后重新设置、检查。
- Apple 文档说明备份排除标记是给系统的指引，并非绝对保证。严格本地使用时，设置页面提供关闭本 App iCloud 备份的操作说明，不宣称应用可以控制所有系统备份。
- HealthKit 原始记录由系统健康数据库管理；用户是否开启“健康”的 iCloud 同步由系统设置决定，本 App 无权代为关闭。
- 照片只存 App 沙盒，首版不主动保存到系统相册，避免触发相册云同步。
- 清除应用数据不能删除已经发送给 DeepSeek 的服务端记录，也不删除系统 HealthKit 数据。
- 首版不提供云端导出；卸载应用或设备丢失可能导致本地记录无法恢复，设置中清楚说明。

## 2. 首版功能与页面

首版是可实际使用的闭环，不构建通用小程序运行时，不实现账户系统、社交、支付或任意插件执行。

| 页面 | 首版功能 | 数据位置 |
|---|---|---|
| 首页 | 今日步数、近期睡眠摘要、最近会话、最近照片入口、离线状态 | 本机查询与本地缓存 |
| AI 会话 | 创建/删除会话、选择历史上下文、发送、流式回答、取消、失败重试 | 手机数据库；确认后的请求发送 DeepSeek |
| 健康 | 授权入口、步数/心率/睡眠查看、日期范围选择、摘要展示 | 系统 HealthKit 与本机短期缓存 |
| 相机与照片 | 原生拍摄、预览、删除、可选本地 OCR | 手机沙盒 |
| 设置 | 原生 API Key 设置入口、AI 联网开关、权限说明、Web/壳版本、更新、回滚、删除本地数据 | 手机；密钥保存在 Keychain |

界面默认简体中文，适配 iPhone 安全区域、软键盘、深色模式和动态字号。图表、日期选择、页面导航由 Web 实现；系统授权、拍摄、密钥输入、AI 外发确认和恢复页面由 Swift 实现。

## 3. 技术栈

| 层 | 选择 | 理由 |
|---|---|---|
| iOS 最低版本 | iOS 17，实施前根据实际手机确认 | 保持首版范围明确 |
| 原生 | Swift + SwiftUI + WKWebView | 原生权限与 Web 容器 |
| Web | TypeScript + React + Vite + React Router | Windows 上快速开发与构建 |
| Web 路由 | React Router HashRouter | 避免本地资源路径刷新问题 |
| Bridge SDK | TypeScript 类型定义 + Swift 显式方法路由 | 稳定契约与能力检测 |
| 业务数据库 | SQLite，通过 GRDB 的 Swift Package 管理 | 事务、显式迁移和清晰的数据访问层 |
| 本地附件 | Application Support 下受保护的独立目录 | 与 UI 资源包分离 |
| 密钥/加密 | Keychain + CryptoKit | 不向 Web 暴露凭据 |
| 网络 | Swift URLSession | 统一限制外发、错误处理与流式解析 |
| 健康 | HealthKit，首版只读 | 防止误写健康记录 |
| 相机 | 原生系统拍摄界面；必要时再扩展 AVFoundation | 先完成可靠拍摄闭环 |
| OCR | Vision 本地识别，作为拍摄闭环后的增量 | 图片无需上传即可提取文本 |
| 项目生成 | XcodeGen + project.yml | Windows 可维护项目声明，CI 生成 Xcode 工程 |
| 构建 | GitHub Actions macOS Runner + xcodebuild | 无本地 Mac 构建 Ad Hoc IPA |

实施时核对并锁定稳定的依赖、Xcode 与 Runner 组合；提交包锁文件。不长期依赖浮动的 `macos-latest` 或未经锁定的依赖版本。

React 使用函数组件和 Hooks，页面组件使用 `.tsx`，桥接 SDK 与模型使用 `.ts`；开启 TypeScript strict。通过 `tsc --noEmit` 独立检查类型，不能用 Vite 构建成功代替类型检查。NativeClient 单例与组件生命周期分离，订阅必须在卸载时清理，React StrictMode 不得导致重复原生调用或重复 AI 请求。采用静态单页应用，不引入 Next.js、SSR 或必须在线运行的 Web 服务端。

## 4. 架构与数据流

```text
SwiftUI 壳
  ├─ WKWebView：执行已验签并缓存到手机的 Web 资源
  │    └─ TypeScript NativeClient：业务请求与事件订阅
  ├─ BridgeRouter：来源验证、类型校验、方法白名单、请求生命周期
  ├─ LocalRepository：数据库、照片、事务、删除和迁移
  ├─ HealthService：系统授权、HealthKit 查询与摘要
  ├─ CameraService / OCRService：拍摄与本地处理
  ├─ DeepSeekService：原生确认、Keychain、直连 API、流式输出
  ├─ WebUpdateService：下载、验签、解压、兼容性检查、回滚
  └─ 原生设置/恢复界面：Web 故障时依然可访问

网络仅有两个应用业务方向：
  1. 下载更新服务器上的签名 Web 静态资源，不上传用户记录。
  2. 用户确认后，手机直接调用 DeepSeek，不经过自建代理。
```

Web 从本地 `giraffe://app/index.html` 加载，由 `WKURLSchemeHandler` 映射到当前资源目录；媒体通过另一个受限的本地资源路径访问，只接收附件 ID，不暴露任意文件路径。

不得以“直接加载远程网站”代替本方案。首次启动和更新服务器不可用时，仍需使用本地界面。自定义 scheme 的模块脚本、MIME、相对路径、路由、媒体展示与 WebKit Origin 行为必须在架构验证阶段实机确认；若遇到兼容问题，可改为限制读目录的 `loadFileURL`，但必须保留同等来源校验与离线能力，并更新设计记录。

浏览器开发模式使用 MockNativeClient 和合成数据。WKWebView 使用非持久 WebsiteDataStore，业务数据不写 localStorage、IndexedDB 或 Service Worker 缓存。Web 状态只是可重建的视图缓存。

## 5. 本地数据模型与保护

建议结构：

```text
Library/Application Support/Giraffe/
  Data/app.sqlite             # 数据库及 WAL/SHM，统一保护
  Media/<uuid>.enc            # 加密照片与缩略图
  WebReleases/<version>/      # 完整 Web 资源包
  UpdateState/                # 当前版本、上个稳定版本、失败记录
Library/Caches/Giraffe/       # 可丢弃的查询/图片缓存
tmp/Giraffe/                  # 临时拍摄与更新下载文件，及时清理
Keychain                     # DeepSeek Key、本地加密主密钥
```

最低表设计：

| 表 | 主要字段 |
|---|---|
| conversations | id、titleEncrypted、createdAt、updatedAt |
| messages | id、conversationId、role、contentEncrypted、status、model、createdAt |
| attachments | id、localRelativePath、mimeType、width、height、byteCount、createdAt |
| message_attachments | messageId、attachmentId；关联表，支持引用清理 |
| drafts | id、conversationId（可空）、contentEncrypted、attachmentIdsEncrypted、updatedAt；更新切换与重启恢复 |
| health_snapshots | id、type、startAt、endAt、timeZone、summaryEncrypted、fetchedAt、expiresAt |
| settings | key、value；只允许非敏感设置，不含凭据 |
| schema_migrations | 已执行迁移版本 |

- 用户内容、健康缓存和照片使用 CryptoKit AES-GCM 加密；主密钥仅保存在不参与同步的 Keychain `WhenUnlockedThisDeviceOnly` 项中。
- 数据库结构和时间等元数据并非全部加密，不声称等同整库加密。数据库及附件同时启用 iOS 文件保护，首版锁屏时拒绝读取敏感内容。
- API Key 只能通过原生安全输入界面设置；Bridge 只返回“已配置/未配置”，没有读取 Key 的方法。
- 不在日志、崩溃报告、CI 输出或剪贴板记录密钥、提示词、健康原始记录、照片内容。
- 健康缓存默认最多保留 7 天，可清除；刷新从 HealthKit 重读，不建立整库健康镜像。
- 删除会话时事务清除相关消息，并回收不再被引用的附件。全量清除同时删除数据库、附件、健康缓存、API Key 和本地主密钥，再初始化空库。
- 数据库迁移只能由原生代码控制；Web 更新不得提交 SQL、修改数据库 schema 或执行不可逆迁移。
- 首版不做通用文件导出、任意 SQL 或任意路径读写接口。

## 6. Web ↔ Swift Bridge 契约

版本从 `1` 开始，Web 初始化时获取 `bridgeVersion`、`nativeVersion` 和 `capabilities`。所有调用经统一 SDK，使用 Promise；事件订阅可取消。

请求示例：

```json
{
  "id": "request-uuid",
  "bridgeVersion": 1,
  "method": "health.querySteps",
  "params": { "from": "2026-09-01", "to": "2026-09-20", "timeZone": "Asia/Shanghai" }
}
```

响应与事件示例：

```json
{ "id": "request-uuid", "ok": true, "data": { "days": [] } }
{ "id": "request-uuid", "ok": false, "error": { "code": "PERMISSION_REQUIRED", "message": "需要授权" } }
{ "event": "ai.delta", "streamId": "stream-uuid", "sequence": 1, "data": { "text": "你好" } }
```

| 方法组 | 首版接口 |
|---|---|
| app | getCapabilities、getVersions、openNativeSettings |
| conversation | list、create、get、delete |
| message | list；保存由原生会话服务管理，避免 Web 伪造流式状态 |
| draft | get、save、delete；限定草稿字段与大小，保存成功后才标记编辑已落盘 |
| ai | prepareRequest、requestSend、cancel；requestSend 必须触发原生确认 |
| health | requestAuthorization、querySteps、queryHeartRate、querySleep、clearCache |
| camera | capture；返回附件 ID 与元数据 |
| media | list、delete、getDisplayResource；不返回任意磁盘路径 |
| ocr | recognize；仅接受已有本地附件 ID |
| settings | get、update；字段白名单，敏感设置仅打开原生界面 |
| updates | getStatus、check、reportEditingState、requestApply、requestRollback；原生自主执行启动检查与自动应用，编辑状态只能延后切换，不能绕过原生忙碌状态 |
| privacy | requestEraseAll；原生二次确认 |

Bridge 实现要求：

- 在 Swift 验证消息来自受信的本地顶层主框架，拒绝 iframe、外部 Origin、未知方法和未知字段。
- 不提供任意 URL 请求代理、任意代码执行、任意 Keychain 或数据库访问。
- 限制查询跨度、记录数量、分页、消息体大小与调用频率；健康查询默认 7 天，单次最多 90 天，分页结果最多 500 条。
- UUID 请求关联；普通调用默认 30 秒超时，拍摄/系统授权允许更长交互；超时与取消必须清理原生任务和 Promise。
- 流式任务使用 streamId 和递增 sequence；Web 重载时取消未确认请求，已开始 AI 流取消并持久化已有文本为 interrupted，禁止自动重发。
- JSON 序列化传参，不把用户内容直接拼接进 JavaScript 字符串执行。
- 不支持的能力返回 `CAPABILITY_UNAVAILABLE`，旧壳必须能显示兼容提示，不白屏。
- 不预先授予未来可能需要的所有权限，不为减少重装而暴露无限制的硬件接口。

## 7. DeepSeek 接入

由 Swift 直连官方 API，默认端点 `https://api.deepseek.com/chat/completions`，使用 Bearer API Key。模型 ID 在原生配置中选择，实施时核对官方可用模型，不把历史模型名作为永久假设。

首版先支持文本聊天和 SSE 流式输出；照片拍摄与 AI 识图是独立能力，不因支持相机就默认支持图片模型。

发送流程：

1. Web 提交当前输入、会话 ID、选中的历史消息 ID 和明确选择的附件/健康摘要 ID。
2. Swift 从本地数据库读取数据，按上下文预算生成待发送内容；不自动发送整个数据库。
3. 生成不可变请求快照；原生预览展示完整内容、目标服务与模型，用户确认后冻结该快照并发出请求。
4. Swift 从 Keychain 取 Key，使用无磁盘缓存的 URLSession 发送；不接受 Web 传入的任意域名或授权头。
5. 接收 SSE，正确处理网络块拆分、UTF-8 分片、多个事件、结束标志与断线；将文本事件发给 Web。
6. 回答增量在原生节流落盘；成功、取消和失败均保存明确状态，重开应用可恢复查看。

其他规则：

- HTTPS 主机允许列表与重定向校验在 Swift 实现，不能通过更新包随意改为第三方代理。
- 处理 401、429、余额/配额不足、5xx、断网和取消；不静默重试可能已计费的请求。用户重试重新确认。
- “测试连接”只发最小、无用户业务数据的请求，并告知可能产生 API 费用。
- HealthKit 摘要外发使用单独明确选择，默认关闭；不开放 AI 工具自动抓取健康数据、照片或执行 Bridge。
- 回答只作普通文本/净化后的 Markdown 渲染，禁止执行模型返回的 HTML/脚本；远程图片默认不加载。
- 图片理解为后续增量：先核对选定模型支持情况；如支持，在本机压缩并清除 EXIF，确认后直接发送内联图片，不上传到自建图床或建立远端文件库。
- OCR 可先在本机生成文字，用户编辑确认后作为文本发送。

## 8. 相机与健康数据

### 8.1 相机

- 用户点击拍摄时，由 Swift 请求相机权限并呈现系统原生相机。
- 配置 `NSCameraUsageDescription`；首版无录像，因此不申请麦克风权限。
- 拍摄结果进入本地加密附件库，生成缩略图；Web 仅得到附件 ID 和受限展示资源。
- 取消不保存，拒绝权限显示系统设置入口；无相机设备/模拟器显示“当前环境不支持”。
- 首版仅拍照，不申请整库照片访问，不自动保存系统相册，不自动上传。

### 8.2 HealthKit

- 启用 HealthKit Capability、对应 Entitlement 和 `NSHealthShareUsageDescription`，签名描述文件必须匹配。
- 首版仅请求只读的 stepCount、heartRate、sleepAnalysis；不请求临床记录、不写入健康数据。
- 权限按需申请；调用 `isHealthDataAvailable()` 后再查询。
- HealthKit 不向 App 明确透露读取权限被拒绝的状态。无结果显示“暂无可读取数据”，不能把授权流程完成当成已获所有读取权限。
- 步数使用合适的 HealthKit 统计查询，不自行把多个设备的原始记录简单相加；以系统健康 App 对照验证。
- 心率保留测量时间与单位 bpm；睡眠保留来源和阶段，合并重叠区间，避免重复计算 inBed 与 asleep。
- 日期边界按用户时区处理，覆盖跨午夜、夏令时与多个来源；不把缺失数据当作 0 或诊断结果。
- 首版前台按需读取，无后台持续采集。后续确需后台更新再增加 Observer Query、Background Delivery Entitlement 和原生处理；不能依靠 Web 定时器保活。

## 9. Web 网络更新

### 9.1 发布内容与边界

更新服务只托管静态文件：版本清单、签名、资源包，不接收聊天/照片/健康数据。下载请求仍可能产生 IP、时间等基础访问日志；禁用第三方分析和唯一设备跟踪参数，不承诺互联网访问不产生任何网络元数据。

资源包只允许 HTML、CSS、JS、JSON、字体和图片等约定类型，不下载执行原生动态库、二进制可执行文件或任意插件。新原生接口、系统能力、权限说明和数据库迁移都通过新版 IPA 交付。

### 9.2 清单格式与签名

使用两层文件，避免 JSON 重排造成验签歧义：`manifest.json` 原始 UTF-8 字节及其分离签名 `manifest.sig`。使用 CryptoKit 对应的 Ed25519 验证，签名私钥只保存在受保护的发布环境，公钥内置原生壳。

```json
{
  "formatVersion": 1,
  "channel": "stable",
  "webVersion": "1.0.1",
  "releaseSequence": 2,
  "minNativeVersion": "1.0.0",
  "bridgeVersion": 1,
  "requiredCapabilities": ["health.querySteps", "camera.capture"],
  "packageURL": "https://updates.example.com/giraffe/1.0.1/web.zip",
  "packageSHA256": "<64位十六进制SHA256>",
  "packageSize": 123456,
  "unpackedSize": 456789,
  "publishedAt": "2026-09-20T12:00:00Z",
  "releaseNotes": "改善健康图表展示"
}
```

域名是占位符，未配置真实可信域名与公钥时，禁用远程更新并使用内置资源。不得用任意临时公开地址或跳过验签来伪装更新已完成。

### 9.3 更新事务

1. 每次进程冷启动检查一次；App 经真实后台状态返回前台时再检查一次。不设置“每天一次”的限制。系统权限弹窗、控制中心等临时 inactive → active 不算重新打开；同一启动事件和正在进行的检查/下载合并处理，避免重复任务。保留手动检查。
2. 向服务器重新验证版本清单（可用 ETag / If-None-Match，不能仅依赖本地缓存）。下载清单和签名；先验证签名，再信任里面的版本、URL 和哈希。以 releaseSequence 和 packageSHA256 判断发布变化；没有新包则不重复下载 ZIP。只接受正式构建发布的静态资源，不在手机上拉 Git 仓库或编译 TypeScript。
3. 检查原生版本、Bridge 版本与 capabilities；不兼容时保留现有版本并提示需更新壳。
4. 下载到 staging；限制压缩包最多 20 MB、解压后最多 80 MB、文件数最多 2000，下载前检查空间。
5. 校验 SHA-256；安全解压，拒绝路径穿越、绝对路径、符号链接、重复覆盖和超限压缩包。
6. 检查 index.html、资源列表和路径完整性；包内所有依赖自包含，不使用外部 CDN。
7. 验证通过后自动原子切换 active 指针并重建 WebView，不弹更新确认框。若存在 AI 流、拍摄、原生确认窗口或未保存编辑，先将版本标为 pending，当前任务结束且草稿落盘后自动切换；若始终忙碌则下次启动应用。Swift 管理原生忙碌状态，Web 通过受限接口报告编辑状态，不因更新取消进行中的 AI 请求或丢失输入。
8. Web 在 15 秒内完成 Bridge 握手并报告 ready；失败则自动退回上一稳定版本。
9. 若切换后连续两次启动未成功，进入原生恢复界面，可退回内置版本；记录该失败包，避免自动重装循环。
10. 保留当前版本、上一稳定版本和安装包内置版本，清理其他资源版本，绝不清理业务数据库与照片。

只在成功启动后标记更新稳定。在线清单拒绝低于已接受序号的自动降级；用户主动回滚只允许已经验证的本机版本。Web 不能执行破坏性数据迁移，确保 UI 回滚后仍可读原有数据。

启动体验与发布要求：

- 冷启动显示原生启动状态，检查、下载与验证等待总预算为 5 秒；在预算内完成更新则直接进入最新 Web。无变化立即进入当前版本，已知断网或检查失败立即回退本地，不等待满 5 秒。
- 超过 5 秒先打开现有本地版本；本次运行内继续下载，完成后按上述空闲规则自动切换。进入后台后不承诺继续执行或后台保活；被中断时安全恢复或重新下载。
- 前台恢复检查不阻塞现有界面，遵循同样的自动下载与安全切换规则。
- 304 只能复用对应 ETag 的已验签清单；本机目标资源包缺失时仍需下载，不能把 304 当作“资源已安装”。相同序号却不同哈希视为发布异常，不覆盖已信任版本。
- 发布方先上传不可变的版本资源包、清单与签名，完整可用后再切换最新版本入口；入口重验证，版本文件可长期缓存。分离清单与签名若因发布时序暂不匹配，保留旧版并重取一次，不跳过验签。
- 自动回滚后隔离失败包的版本与哈希。后续启动仍检查服务器，有更新的正常版本则自动恢复升级；被隔离的同一坏包不反复安装。
- 自动更新不改变本地存储政策；所有用户记录与待保存草稿不放入 Web 资源目录。草稿在原生数据库增加独立记录并通过受限 Bridge 保存/恢复，作为自动切换前置条件。

### 9.4 Web 内容隔离

- CSP 默认拒绝网络连接：`connect-src 'none'`；只允许受控本地脚本、样式、字体和媒体，禁止 eval、远程脚本、iframe、表单外发。
- 由 Swift 控制导航和新窗口；外部链接不在带 Bridge 的 WebView 内加载，需用户操作后在系统浏览器打开。
- 校验主框架来源，阻止页面通过图片、CSS、导航或其他资源请求外传业务内容；CSP 只是其中一层，需结合导航/资源策略实机测试。
- 发布签名私钥可授权拥有本机数据访问能力的 Web 代码，必须与普通 PR 构建隔离；仅受保护发布流程可使用。
- 健康外发、密钥管理和数据删除的关键确认界面始终由原生控制，不能由 Web 更新取消。

## 10. 开发、构建与安装

### 10.1 Windows 日常开发

- Web 使用 Node LTS、npm 和锁文件；提供 dev、build、typecheck、test 命令。
- 使用 React 开发服务器与浏览器 Mock 快速迭代；发布时由 Vite 将 TS/TSX 编译成自包含的 HTML/CSS/JS 资源包，手机下一次打开会自动检查并获取更新。
- 浏览器用固定合成数据验证页面与桥接契约；不把真实健康数据、照片、API Key 提交 Git。
- 修改 Swift 后推送 CI 编译；浏览器 Mock 不能代替 HealthKit、相机、WebKit scheme 与签名的实机验证。
- 首版就提供可在手机查看的脱敏诊断页面：原生版本、Web 版本、Bridge 能力、更新状态及错误码，不包含用户内容。

### 10.2 GitHub Actions 工作流

| 工作流 | 触发 | 产物/用途 |
|---|---|---|
| web-ci.yml | push / PR | Web 类型检查、契约测试、构建 |
| ios-ci.yml | push / PR | macOS 生成工程、模拟器编译、原生单元测试；不使用发布密钥 |
| ios-adhoc.yml | 手动可信分支/版本标签 | 内嵌 Web、签名 IPA、OTA manifest、构建信息 |
| web-release.yml | 手动可信版本标签 | Web ZIP、manifest、分离签名；通过保护环境发布静态更新 |

Ad Hoc 签名环境需要：Apple Distribution P12 及密码、匹配当前 Bundle ID/Entitlements/设备 UDID 的 Profile、Team ID。Bundle ID 由开发者确定，不擅自占用示例值进行正式签名。

- Runner 临时钥匙串导入证书，结束后清理；证书、私钥和 Profile 不放进普通构建产物或源码。
- 固定 Xcode 路径，依据该版本 `xcodebuild -help` 确认 Ad Hoc 对应导出参数，不照搬已废弃的 method 名称。
- 受信 Workflow 签名；第三方 PR 不得获得发布密钥，第三方 Actions 固定可信提交。
- Web 发布签名与 Apple IPA 签名是两套密钥，不能混用。
- 私有仓库 macOS 构建可能消耗额度/产生费用，由 GitHub 账户计划决定。
- 未配置签名材料时允许跑无签名 CI，必须明确输出“尚未完成可安装 IPA”，不能宣称安装验证通过。

### 10.3 手机安装与续签

- 在 Apple Developer 后台登记 iPhone UDID；UDID 不等于序列号或 IMEI。提供经实际 Windows 环境验证的获取步骤。
- CI 生成 Ad Hoc IPA 与 OTA 安装清单，由 HTTPS 静态托管提供 iOS 安装服务能直接读取的文件。
- 普通 Actions Artifact 登录下载页不能直接作为 OTA 文件 URL；私有托管可用受限时效签名链接，清单和 IPA 链接须在完整安装期间有效。
- iPhone Safari 打开安装页面，使用 `itms-services` 清单链接安装；根据系统要求启用开发者模式并完成首次联网验证。
- 安装页面与 Web 更新源可以同一基础设施，但二者是独立流程。更新网页不等于重新签名 IPA。
- 原生显示签名描述文件到期日并在临近到期时提示重新安装；具体以实际签名文件为准，不能保证每次安装都有整整一年。
- 保持 Team ID、Bundle ID 和 Keychain 访问组稳定，通常可覆盖安装保留数据；实机验证此路径，不指导用户先卸载。

## 11. 建议仓库结构

```text
giraffe/
  PROJECT_PLAN.md
  README.md
  ios/
    project.yml
    Giraffe/
      App/
      WebContainer/
      Bridge/
      Services/{Health,Camera,AI,Updates}/
      Storage/
      NativeUI/
      Resources/WebFallback/
    GiraffeTests/
  web/
    src/{pages,components,bridge,stores,mocks}/
    tests/
    package.json
    package-lock.json
  contracts/
    bridge-v1.json
    web-manifest-v1.schema.json
    fixtures/
  scripts/
    package-web.*
    sign-manifest.*
    export-ipa.*
  docs/
    SETUP_WINDOWS.md
    SIGNING_AND_INSTALL.md
    WEB_RELEASE.md
    PRIVACY_AND_DATA_FLOW.md
    TEST_RESULTS.md
  .github/workflows/
```

目录名可按实现工具合理调整，但保持原生、Web、契约与发布脚本分离。README 指向本文并记录最小运行步骤。

## 12. 分阶段实现顺序与完成条件

### 阶段 A：验证最关键路径

建立 Swift 壳、内置 React + TypeScript 页面、Bridge ping/getCapabilities、GitHub macOS 无签名构建，再准备 Ad Hoc 构建流程。

完成条件：Web 可在 Windows 浏览器运行；CI 可编译；在真机验证本地 scheme 下脚本、样式、路由和 Bridge。没有证书时先交付可编译部分，并精确列出待提供材料，不能停留在只有网页的原型。

### 阶段 B：本地存储与原生能力

实现 SQLite、Keychain、加密附件、相机、HealthKit 只读查询、权限错误状态、原生设置和清除功能。

完成条件：拍摄、查询、重启恢复、锁屏保护、删除都通过实机验证；无业务上传。

### 阶段 C：DeepSeek 文本闭环

实现原生密钥输入、请求快照预览、用户确认、直连 API、SSE、取消及本地历史。

完成条件：用户拒绝时没有请求；发送内容与确认快照一致；断流后内容可恢复；密钥不进入 Web 或日志。

### 阶段 D：Web 更新闭环

实现签名打包、静态发布、下载验签、兼容检查、原子切换与恢复。

完成条件：手机安装同一个 IPA，发布 Web v2 后下次启动或从后台重新打开自动检查、下载并应用；无需确认更新，数据不变。多次同日启动均检查，无变化不重复下载；断网可启动，坏包、错误签名与启动失败能回退。

### 阶段 E：交付与体验完善

完成健康图表、照片管理、本地 OCR、网络状态、错误文案、Windows 操作说明、续签说明和测试证据。

最终交付包括源代码、锁定依赖、可复现构建脚本、测试结果、安装步骤和已知限制。模拟器测试、真实设备测试、真实 DeepSeek 调用分别标注，禁止用 Mock 结果冒充真机验收。

## 13. 验收矩阵

| 场景 | 预期 |
|---|---|
| 新安装后断网启动 | 显示内置界面，本地功能可用，无需从网络获取首页 |
| 同一天多次冷启动或从后台重新打开 | 每次检查最新清单，不受每日限频影响 |
| 系统权限弹窗关闭后恢复 active | 不重复触发更新检查；不打断授权流程 |
| 发布兼容新 Web 后打开 App | 自动下载、验签、应用，不要求更新确认或重新安装 IPA |
| 清单未变化/服务器返回 304 | 复用已验签清单；资源包完整则不重复下载，缺失则补下载 |
| 更新检查或下载超过启动预算 | 最迟 5 秒结束更新等待并加载本地版，下载完成后安全切换 |
| AI 流、拍摄或未保存输入期间下载完成 | 更新暂存，任务完成且草稿落盘后切换，输入和结果保留 |
| 自动回滚后再次打开 App | 继续检查新发布，隔离旧坏包，正常新版可继续自动升级 |
| 保存会话/照片后杀进程重开 | 记录和照片仍在；未完成回答标记中断 |
| 未配置 API Key | 本地页面和健康查询可用；AI 提示配置 |
| 取消 AI 原生确认 | 不向 DeepSeek 发送请求 |
| 选择健康摘要发送 | 仅确认的日期、字段与历史上下文外发 |
| 拍照后未选择发送 | 照片不产生上传流量 |
| HealthKit 拒绝/无记录 | 无崩溃，不错误声称已获得读取权限 |
| 步数/睡眠多个来源 | 不简单累加导致重复；与系统数据对照 |
| SSE 分片/断流/取消 | Unicode 正确，UI 不重复，已有回答本地保留 |
| 第三方 iframe/外部页面调用 Bridge | Swift 拒绝 |
| 模型返回恶意 HTML/图片 URL | 不执行脚本、不自动外发请求 |
| 篡改 ZIP/清单、错误签名、解压越界 | 拒绝安装，本地数据和旧界面不受影响 |
| 下载中断/空间不足/进程被杀 | 仍可启动稳定版本，无半安装状态 |
| Web 需要不存在的原生能力 | 不安装不兼容包，明确提示更新壳 |
| 新 Web 白屏/不握手 | 回滚上个稳定版本，原生恢复入口可访问 |
| Web 更新和回滚 | 数据库、密钥、照片保留 |
| 所有业务网络出口检查 | 仅明确确认的 DeepSeek 请求和静态更新下载，无第三方埋点 |
| 检查备份/文件保护/Keychain 属性 | 不主动云同步，排除标记正确；系统限制在文档说明 |
| 同标识 IPA 覆盖安装 | 数据和密钥可继续读取；不依赖先卸载 |
| 清除全部本地数据 | 沙盒业务记录和本应用 Keychain 内容清除，HealthKit 源数据不变 |

重点自动化测试：Bridge 白名单/参数校验、数据库迁移事务、加密读写、SSE 解析、清单验签、解压安全、更新状态机。实机重点：HealthKit、相机、WebKit 加载、安全来源判断、OTA 安装和覆盖升级。

## 14. 更新范围判定

| 变更 | 更新 Web 即可 | 需新版 IPA |
|---|---|---|
| 页面排版、图表、文案、导航 | 是 | 否 |
| 使用已有方法组合新流程 | 是，受原生外发/权限边界约束 | 否 |
| 调整既有健康查询的日期范围 | 是，不能越过原生参数限制 | 否 |
| 新增尚未被原生白名单支持的健康类型 | 否 | 是，并按需重新授权 |
| 新增蓝牙、后台采集或新原生 API | 否 | 是 |
| 修改数据库 schema、原生密钥策略 | 否 | 是 |
| 更新下载公钥、受信服务域名或 API 协议能力 | 否，首版不支持远程改写这些信任边界 | 是 |
| 签名到期、修改原生权限说明 | 否 | 是 |

## 15. 给后续 Codex 的执行要求

1. 先读取本文及仓库 AGENTS.md（若有），检查已有文件和用户修改；按阶段实现，不覆盖无关内容。
2. 用户已确定方向：Swift 壳、React + TypeScript Web 界面、本地数据、DeepSeek、相机、HealthKit、GitHub 云端构建；每次启动/后台重开自动检查并下载兼容的最新 Web 资源。无需再次询问这些架构选择，不恢复每日限频或人工确认更新机制。
3. 不引入云数据库、登录后端、API Key 中转服务器、第三方分析、远程图床或云同步来方便实现。
4. 缺少真实 Bundle ID、Team ID、证书、UDID、更新域名、公钥或 API Key 时，保留明确配置入口，先完成可独立验证的代码与测试，再列出缺失项。API Key 在手机原生界面输入，不要求提交仓库。
5. 签名材料和发布配置未齐备时，不虚构已发布地址、成功安装或测试结果。
6. 任何网络外发功能必须复用原生确认与网络策略；Web 或 AI 不能绕过它们。
7. 首版不提供健康写入、自动模型工具调用、通用插件或泛化任意硬件访问。
8. 每阶段更新实现说明、测试证据和未完成项，确保可交接。实际部署和真实设备验收按可用权限与环境完成。

## 16. 官方参考与需重新核对事项

参考核对日期：2026-09-20。API、模型和构建镜像会变化，实施时以官方文档和实际 SDK 为准。

- [Apple WKWebView](https://developer.apple.com/documentation/webkit/wkwebview/)
- [Apple WKURLSchemeHandler](https://developer.apple.com/documentation/webkit/wkurlschemehandler)
- [Apple WKScriptMessageHandler](https://developer.apple.com/documentation/webkit/wkscriptmessagehandler)
- [Apple HealthKit 配置](https://developer.apple.com/documentation/healthkit/setting-up-healthkit)
- [Apple 健康数据授权](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data)
- [Apple HealthKit 后台观察查询](https://developer.apple.com/documentation/healthkit/executing-observer-queries)
- [Apple iCloud 备份排除的实际边界](https://developer.apple.com/documentation/foundation/optimizing-your-app-s-data-for-icloud-backup)
- [Apple 注册设备分发](https://developer.apple.com/documentation/xcode/distributing-your-app-to-registered-devices)
- [Apple Provisioning Profile 有效期](https://developer.apple.com/documentation/technotes/tn3125-inside-code-signing-provisioning-profiles)
- [GitHub Hosted Runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- [DeepSeek Chat Completions API](https://api-docs.deepseek.com/api/create-chat-completion/)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

本项目以 Ad Hoc 个人开发测试为首要交付方式。若未来转为 App Store 发行，需重新评估 Web 动态更新、最低功能、健康隐私及 AI 数据共享规则；不将此设计描述为绕过商店审核的方案。
