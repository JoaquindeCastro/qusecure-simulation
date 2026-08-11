import { cp, mkdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(resolve(root, "index.html"), resolve(dist, "index.html"));

const assets = resolve(root, "assets");
if (await stat(assets).then(() => true, () => false)) {
  await cp(assets, resolve(dist, "assets"), { recursive: true });
  console.log("Copied assets/ into dist/");
}

console.log("Built static site in dist/");
