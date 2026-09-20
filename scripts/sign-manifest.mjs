import { createPrivateKey, sign } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const [manifestPath, privateKeyPath, signaturePath] = process.argv.slice(2);
if (!manifestPath || !privateKeyPath || !signaturePath) {
  throw new Error("用法: sign-manifest.mjs <manifest.json> <ed25519-private-key.pem> <manifest.sig>");
}
const manifestBytes = await readFile(manifestPath);
const privateKey = createPrivateKey(await readFile(privateKeyPath));
if (privateKey.asymmetricKeyType !== "ed25519") throw new Error("发布私钥必须为 Ed25519");
await writeFile(signaturePath, sign(null, manifestBytes, privateKey));
console.log("manifest.sig 已生成（未输出密钥或清单内容）");
