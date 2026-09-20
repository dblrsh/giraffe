import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const source = resolve(root, "web", "dist");
const outputDir = resolve(root, "artifacts");
const output = resolve(outputDir, "giraffe-web.zip");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const full = resolve(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`资源目录禁止符号链接: ${full}`);
    return entry.isDirectory() ? walk(full) : [full];
  }))).flat();
}

await mkdir(outputDir, { recursive: true });
await rm(output, { force: true });
const files = await walk(source);
if (!files.some((file) => basename(file) === "index.html")) throw new Error("资源包缺少 index.html");
if (files.length > 2000) throw new Error("资源文件数超过 2000");
const unpackedSize = (await Promise.all(files.map((file) => stat(file)))).reduce((sum, value) => sum + value.size, 0);
if (unpackedSize > 80 * 1024 * 1024) throw new Error("解压后大小超过 80 MB");

const command = process.platform === "win32" ? "powershell" : "zip";
const args = process.platform === "win32"
  ? ["-NoProfile", "-Command", `Compress-Archive -Path '${source.replaceAll("'", "''")}\\*' -DestinationPath '${output.replaceAll("'", "''")}' -Force`]
  : ["-q", "-r", output, "."];
await new Promise((accept, reject) => {
  const child = spawn(command, args, { cwd: source, stdio: "inherit" });
  child.on("error", reject);
  child.on("exit", (code) => code === 0 ? accept() : reject(new Error(`压缩失败 (${code})`)));
});

const digest = createHash("sha256");
await new Promise((accept, reject) => createReadStream(output).on("data", (chunk) => digest.update(chunk)).on("end", accept).on("error", reject));
const packageSize = (await stat(output)).size;
if (packageSize > 20 * 1024 * 1024) throw new Error("ZIP 大小超过 20 MB");
console.log(JSON.stringify({ output, packageSHA256: digest.digest("hex"), packageSize, unpackedSize, fileCount: files.length }, null, 2));
