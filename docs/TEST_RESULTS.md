# 测试记录

此文件随实现阶段持续更新。测试结果必须区分 Windows/浏览器、macOS 模拟器、iPhone 真机和真实 DeepSeek 请求，Mock 结果不能作为真机验收证据。

## 阶段 A

- Web 类型检查：2026-09-20 Windows 通过；
- Web Bridge Mock 单元测试：2026-09-20 Windows，2/2 通过；
- Web 生产构建：2026-09-20 Windows，Vite 生产构建通过；
- Web ZIP 打包：2026-09-20 Windows，通过（3 个文件，约 84 KiB）；
- Ed25519 清单签名脚本：2026-09-20 Windows，临时测试密钥生成 64 字节签名；
- iOS 模拟器编译与单元测试：由 GitHub Actions 验证；
- 自定义 scheme 与 Bridge 真机验证：待具备签名材料和设备后执行。
