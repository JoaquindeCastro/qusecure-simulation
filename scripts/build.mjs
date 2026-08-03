import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const name of ["index.html", "styles.css", "app.js"]) {
  await cp(resolve(root, name), resolve(dist, name));
}
console.log("Built static site in dist/");
