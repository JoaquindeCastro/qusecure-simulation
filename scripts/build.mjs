import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const sourceHtml = await readFile(resolve(root, "index.html"), "utf8");
const enhancedHtml = sourceHtml
  .replace("</head>", "<link rel=\"stylesheet\" href=\"assets/feedback.css\">\n</head>")
  .replace("</body>", "<script src=\"assets/feedback.js\"></script>\n</body>");
await writeFile(resolve(dist, "index.html"), enhancedHtml);

const assets = resolve(root, "assets");
if (await stat(assets).then(() => true, () => false)) {
  await cp(assets, resolve(dist, "assets"), { recursive: true });
  console.log("Copied assets/ into dist/");
}

console.log("Built static site in dist/ with narrative enhancement layer");
