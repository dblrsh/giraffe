import { cp, mkdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const source = resolve(root, "web", "dist");
const destination = resolve(root, "ios", "Giraffe", "Resources", "WebFallback");

const sourceStat = await stat(source).catch(() => undefined);
if (!sourceStat?.isDirectory()) {
  throw new Error("web/dist 不存在；请先在 web 目录运行 npm run build");
}

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
console.log(`已同步 WebFallback: ${source} -> ${destination}`);
