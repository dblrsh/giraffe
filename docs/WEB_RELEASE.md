# Web 发布

当前只提供静态构建、资源同步、ZIP 打包与清单 schema。远程更新保持禁用，直到配置真实 HTTPS 源和 Ed25519 公钥。

本地生成候选包：

```bash
cd web && npm ci && npm run build
cd .. && node scripts/package-web.mjs
```

`web-release.yml` 可生成 ZIP、原始 UTF-8 `manifest.json` 和 Ed25519 `manifest.sig` 候选产物，需要受保护环境中的 `WEB_RELEASE_PRIVATE_KEY_BASE64`。发布方仍须先把不可变 ZIP 放到输入的最终 HTTPS URL，再发布清单与签名。Web 发布签名密钥不能与 Apple 代码签名密钥混用；手机端下载、验签和回滚状态机在阶段 D 实现。
