import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const html = await readFile(resolve(root, "index.html"), "utf8");

test("contains the full four-step workflow", () => {
  for (const step of ["Industry", "Adoption", "Stress event", "Results"]) assert.ok(html.includes(step));
});

test("contains the four industry environments", () => {
  for (const industry of ["Healthcare", "Financial services", "Government", "Critical infrastructure"]) assert.ok(html.includes(industry), industry);
});

test("contains multiple crypto-agility stress events", () => {
  for (const event of ["Q-Day", "TLS 1.2", "ML-KEM", "Certificate authority"]) assert.ok(html.includes(event));
});

test("contains interactive model controls and the architecture scene", () => {
  for (const token of ["inventory", "Orchestration", "scene", "hot", "layer", "tiers"]) assert.ok(html.includes(token), token);
});

test("every industry illustration referenced by the page exists on disk", async () => {
  const refs = [...html.matchAll(/assets\/industry\/([a-z-]+\.png)/g)].map((m) => m[1]);
  assert.equal(new Set(refs).size, 4);
  for (const file of new Set(refs)) {
    const info = await stat(resolve(root, "assets", "industry", file));
    assert.ok(info.size > 0, `${file} is empty`);
  }
});

test("hotspot coordinates stay inside the illustration", () => {
  const coords = [...html.matchAll(/x:(\d+(?:\.\d+)?),y:(\d+(?:\.\d+)?)/g)];
  assert.ok(coords.length >= 30, `expected hotspots across four industries, found ${coords.length}`);
  for (const [, x, y] of coords) {
    assert.ok(Number(x) >= 0 && Number(x) <= 100, `x out of range: ${x}`);
    assert.ok(Number(y) >= 0 && Number(y) <= 100, `y out of range: ${y}`);
  }
});

test("respects reduced motion", () => {
  assert.ok(html.includes("prefers-reduced-motion"));
});
