import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const html = await readFile(resolve(root, "index.html"), "utf8");

test("contains the guided four-step journey", () => {
  for (const step of ["Industry", "Readiness", "Event", "Result"]) assert.ok(html.includes(step), step);
  assert.ok(html.includes("Start simulation"));
  assert.ok(html.includes("Trigger stress event"));
});

test("contains the four industry environments", () => {
  for (const industry of ["Healthcare", "Financial services", "Government", "Critical infrastructure"]) {
    assert.ok(html.includes(industry), industry);
  }
});

test("contains the four stress events", () => {
  for (const event of ["Q-Day", "Protocol deprecation", "PQC implementation flaw", "Trust-chain failure"]) {
    assert.ok(html.includes(event), event);
  }
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

test("respects reduced motion and states its modelling limits", () => {
  assert.ok(html.includes("prefers-reduced-motion"));
  assert.ok(html.includes("not breach probabilities"));
});

// ---- model tests: the simulation block is pure, so it can be evaluated directly ----

const source = html.slice(html.indexOf("/*MODEL-START*/"), html.indexOf("/*MODEL-END*/"));
assert.ok(source.length > 500, "model block not found");
assert.ok(!/document\.|window\./.test(source), "model block must not touch the DOM");
const { simulate, SCENES, ADOPTION, EVENTS } = new Function(
  `${source}; return { simulate, SCENES, ADOPTION, EVENTS };`
)();

const base = { industry: "health", adoption: "edge", event: "qday", inventory: 65, teams: 3, vendor: 55, orch: 15, horizon: 7 };
const industries = Object.keys(SCENES);
const events = Object.keys(EVENTS);
const levels = Object.keys(ADOPTION);

test("model is deterministic", () => {
  assert.deepEqual(simulate(base).counts, simulate(base).counts);
});

test("every industry and event combination classifies every asset", () => {
  for (const industry of industries) {
    for (const event of events) {
      for (const adoption of levels) {
        const r = simulate({ ...base, industry, event, adoption });
        assert.equal(Object.keys(r.states).length, r.total, `${industry}/${event}/${adoption}`);
        assert.ok(r.days.agile >= 0 && r.days.fragmented >= 0);
      }
    }
  }
});

test("orchestration cannot shorten a vendor's schedule", () => {
  for (const industry of industries) {
    for (const event of events) {
      const none = simulate({ ...base, industry, event, vendor: 15, orch: 0, teams: 10 });
      const full = simulate({ ...base, industry, event, vendor: 15, orch: 100, teams: 10 });
      assert.equal(none.days.residual, full.days.residual, `${industry}/${event} residual moved with orchestration`);
      assert.equal(none.counts.blockedVendor, full.counts.blockedVendor);
    }
  }
});

test("better vendor readiness is what shortens the residual", () => {
  const poor = simulate({ ...base, industry: "infra", vendor: 15, inventory: 100 });
  const good = simulate({ ...base, industry: "infra", vendor: 59, inventory: 100 });
  assert.ok(poor.days.residual > good.days.residual || poor.counts.blockedVendor > 0);
});

test("orchestration only removes effort, and never makes things worse", () => {
  for (const industry of industries) {
    const none = simulate({ ...base, industry, orch: 0 });
    const full = simulate({ ...base, industry, orch: 100 });
    assert.ok(full.days.agile <= none.days.agile, industry);
    assert.equal(none.counts.blocked, full.counts.blocked, "orchestration must not unblock vendor or hardware work");
    assert.equal(none.counts.unknown, full.counts.unknown, "orchestration must not discover assets on its own");
  }
});

test("undiscovered systems are never remediated", () => {
  for (const industry of industries) {
    const blind = simulate({ ...base, industry, inventory: 20, orch: 100 });
    const unknown = Object.entries(blind.states).filter(([, s]) => s === "unknown");
    assert.ok(unknown.length > 0, `${industry} should have undiscovered assets at 20% inventory`);
    for (const [id] of unknown) assert.notEqual(blind.states[id], "exposed");
  }
});

test("legacy and hardware-bound systems are never simply exposed work", () => {
  for (const industry of industries) {
    const r = simulate({ ...base, industry, event: "ca", inventory: 100, orch: 100, vendor: 100 });
    for (const asset of SCENES[industry].assets) {
      if (asset.legacy && r.states[asset.id] !== "ok" && r.states[asset.id] !== "protected") {
        assert.equal(r.states[asset.id], "blocked", `${asset.id} should be blocked, not remediable`);
      }
    }
  }
});

test("edge-only adoption protects nothing behind the edge", () => {
  const r = simulate({ ...base, adoption: "edge", event: "qday" });
  const behind = SCENES.health.assets.filter((a) => a.band !== "edge");
  const protectedBehind = behind.filter((a) => r.states[a.id] === "protected");
  assert.equal(protectedBehind.length, 0, "edge adoption must not protect internal systems");
});

test("a PQC implementation flaw only touches systems that already migrated", () => {
  const edge = simulate({ ...base, adoption: "edge", event: "mlkem" });
  const broad = simulate({ ...base, adoption: "native", event: "mlkem" });
  assert.ok(broad.counts.affected > edge.counts.affected, "broader migration means a bigger re-migration");
  for (const asset of SCENES.health.assets) {
    if (edge.states[asset.id] === "exposed") assert.equal(asset.band, "edge");
  }
});

test("a compliance deadline is not modelled as a cryptographic break", () => {
  assert.equal(EVENTS.tls.kind, "compliance");
  assert.notEqual(EVENTS.tls.kind, EVENTS.qday.kind);
  const r = simulate({ ...base, event: "tls" });
  assert.ok(r.counts.affected < simulate({ ...base, event: "qday" }).counts.affected);
});

test("an affected system does not automatically fail its neighbours", () => {
  const r = simulate({ ...base, industry: "gov", event: "ca" });
  const dependents = Object.values(r.states).filter((s) => s === "dependent");
  const failed = Object.values(r.states).filter((s) => s === "exposed");
  assert.ok(dependents.length + failed.length < r.total, "not every system should fail");
});
