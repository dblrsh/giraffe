# 签名与安装

当前骨架不包含任何证书、描述文件、设备 UDID 或正式 Bundle ID，也不声称已生成可安装 IPA。

Ad Hoc 工作流接入前需确定稳定的 Team ID、Bundle ID 与 Keychain 访问组，并配置受保护的 GitHub Environment secrets。证书导入临时钥匙串，构建结束后清理；Profile 必须覆盖 HealthKit entitlement 和目标设备。

`ios-adhoc.yml` 需要 `ios-release` 环境中的 `APPLE_CERTIFICATE_P12_BASE64`、`APPLE_CERTIFICATE_PASSWORD`、`APPLE_PROVISIONING_PROFILE_BASE64`、`BUILD_KEYCHAIN_PASSWORD`、`APPLE_TEAM_ID` 和 `APP_BUNDLE_ID`。工作流固定 Xcode 16.4，并在运行时确认 XcodeGen 2.46.0；若 GitHub Runner 不再提供该 Xcode 镜像，应显式评估并更新版本，不能静默漂移。

覆盖安装保留数据、描述文件到期日、OTA HTTPS 托管和 `itms-services` 安装流程必须在实际设备与签名材料齐备后验证。
