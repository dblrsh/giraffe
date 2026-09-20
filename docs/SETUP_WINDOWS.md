# Windows 开发

## 前置条件

- Git；
- Node.js 当前 LTS 与 npm；
- 可访问 GitHub Actions 的仓库。

## Web 开发

在 PowerShell 中执行：

```powershell
cd web
npm ci
npm run dev
```

浏览器模式自动启用固定合成数据，不读取真实健康信息、照片或密钥。提交前执行 `npm run check`。

## iOS 构建边界

Windows 不直接运行 Xcode。推送后由 `ios-ci.yml` 在固定的 macOS/Xcode 环境中生成工程、编译模拟器目标并运行单元测试。浏览器 Mock 通过不代表 HealthKit、相机、自定义 scheme 或签名已通过真机验证。

修改 Web 后，CI 会构建静态资源，并运行 `node scripts/sync-web-fallback.mjs` 嵌入 IPA 的离线基础版本。

## 尚需项目所有者提供

- 正式 Bundle ID 和 Apple Team ID；
- Apple Distribution P12、密码和匹配设备 UDID/Entitlements 的 Ad Hoc Profile；
- 经 HTTPS 托管的更新域名与内置 Ed25519 公钥；
- 实机型号与 iOS 版本。

这些材料不得提交到源码。未配置时只能完成无签名模拟器构建，不能生成或宣称已验证可安装 IPA。
