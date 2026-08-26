import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const sourceHtml = await readFile(resolve(root, "index.html"), "utf8");
const shareDescription = "See how Q-Day will affect your industry… and how crypto-agility can help.";
const enhancedHtml = sourceHtml
  .replace(/<title>[^<]*<\/title>/, "<title>Q-Day Simulator</title>")
  .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${shareDescription}">`)
  .replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="Q-Day Simulator">')
  .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${shareDescription}">`)
  .replace(
    "</head>",
    "<link rel=\"stylesheet\" href=\"assets/feedback.css\">\n" +
    "<link rel=\"stylesheet\" href=\"assets/brand-overrides.css\">\n" +
    "<link rel=\"stylesheet\" href=\"assets/industry-screen-fix.css\">\n" +
    "<link rel=\"stylesheet\" href=\"assets/agility-flow.css\">\n</head>"
  )
  .replace(
    "</body>",
    "<script src=\"assets/model-patch.js\"></script>\n" +
    "<script src=\"assets/feedback.js\"></script>\n</body>"
  );
await writeFile(resolve(dist, "index.html"), enhancedHtml);

const assets = resolve(root, "assets");
if (await stat(assets).then(() => true, () => false)) {
  await cp(assets, resolve(dist, "assets"), { recursive: true });
  console.log("Copied assets/ into dist/");
}

console.log("Built static site in dist/ with Q-Day production model and QuSecure presentation layer");
