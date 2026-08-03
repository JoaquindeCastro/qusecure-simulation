import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const html = await readFile(resolve(import.meta.dirname, "..", "index.html"), "utf8");

test("contains the full four-step workflow", () => {
  for (const step of ["Industry", "Adoption", "Stress event", "Results"]) assert.ok(html.includes(step));
});

test("contains the three industry environments", () => {
  for (const industry of ["Healthcare", "Financial services", "Government"]) assert.ok(html.includes(industry));
});

test("contains multiple crypto-agility stress events", () => {
  for (const event of ["Q-Day", "TLS 1.2", "ML-KEM", "Certificate authority"]) assert.ok(html.includes(event));
});

test("contains interactive model controls and isometric visual classes", () => {
  for (const token of ["inventory", "orchestration", "island", "building", "layer"]) assert.ok(html.includes(token));
});
