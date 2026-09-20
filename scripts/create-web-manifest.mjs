import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [webVersion, releaseSequenceText, minNativeVersion, packageURL, releaseNotes = ""] = process.argv.slice(2);
if (!webVersion || !releaseSequenceText || !minNativeVersion || !packageURL) {
  throw new Error("用法: create-web-manifest.mjs <webVersion> <releaseSequence> <minNativeVersion> <packageURL> [releaseNotes]");
}
const releaseSequence = Number(releaseSequenceText);
if (!Number.isSafeInteger(releaseSequence) || releaseSequence < 1) throw new Error("releaseSequence 必须是正整数");
const parsedURL = new URL(packageURL);
if (parsedURL.protocol !== "https:") throw new Error("packageURL 必须使用 HTTPS");

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const packagePath = resolve(root, "artifacts", "giraffe-web.zip");
const dist = resolve(root, "web", "dist");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const full = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  }))).flat();
}

const digest = createHash("sha256");
await new Promise((accept, reject) => createReadStream(packagePath).on("data", (chunk) => digest.update(chunk)).on("end", accept).on("error", reject));
const files = await walk(dist);
const unpackedSize = (await Promise.all(files.map((file) => stat(file)))).reduce((sum, value) => sum + value.size, 0);
const manifest = {
  formatVersion: 1,
  channel: "stable",
  webVersion,
  releaseSequence,
  minNativeVersion,
  bridgeVersion: 1,
  requiredCapabilities: ["app.getCapabilities", "app.getVersions"],
  packageURL,
  packageSHA256: digest.digest("hex"),
  packageSize: (await stat(packagePath)).size,
  unpackedSize,
  publishedAt: new Date().toISOString(),
  releaseNotes,
};
await writeFile(resolve(root, "artifacts", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
