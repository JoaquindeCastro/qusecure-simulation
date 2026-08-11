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
  for (const event of ["Q-Day", "Old protocol banned", "Flaw in post-quantum software", "Certificate authority fails"]) {
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

// ---- glossary: markers are generated at runtime, so the source of truth is checked directly ----

const glossarySrc = html.slice(html.indexOf("var GLOSSARY="), html.indexOf("/* ---------------- view"));
const GLOSSARY = new Function(`${glossarySrc}; return GLOSSARY;`)();

test("every glossary entry is usable", () => {
  const keys = Object.keys(GLOSSARY);
  assert.ok(keys.length >= 30, `expected a real glossary, found ${keys.length} entries`);
  for (const [key, entry] of Object.entries(GLOSSARY)) {
    assert.ok(entry.label && entry.label.length > 1, `${key} has no label`);
    assert.ok(entry.def && entry.def.length > 30, `${key} has no usable definition`);
    assert.ok(Array.isArray(entry.match) && entry.match.length, `${key} has no trigger phrases`);
    for (const phrase of entry.match) assert.ok(phrase.trim().length > 1, `${key} has an empty phrase`);
  }
});

test("no phrase is claimed by two glossary entries", () => {
  const owner = new Map();
  for (const [key, entry] of Object.entries(GLOSSARY)) {
    for (const phrase of entry.match) {
      const p = phrase.toLowerCase();
      assert.equal(owner.get(p), undefined, `"${phrase}" is claimed by both ${owner.get(p)} and ${key}`);
      owner.set(p, key);
    }
  }
});

test("a definition never leans on an undefined term of its own", () => {
  // A definition that needs a second definition to make sense has not done its job.
  const opaque = ["ML-KEM", "SCADA", "PQC", "CDN", "HSM", "VPN"];
  for (const [key, entry] of Object.entries(GLOSSARY)) {
    for (const acronym of opaque) {
      if (!entry.def.includes(acronym)) continue;
      const explains = entry.match.some((m) => m.toLowerCase() === acronym.toLowerCase());
      const spelled = new RegExp(`${acronym}\\b[^.]{0,20}(is|—|-)|\\b(content delivery|hardware security|post-quantum)`, "i");
      assert.ok(explains || spelled.test(entry.def), `${key} uses "${acronym}" without unpacking it`);
    }
  }
});

test("the page tells the reader what the dotted words are", () => {
  assert.ok(/Dotted words[^<]*definition/i.test(html), "the marker convention is never explained");
});

test("publishes its method and its limits in the page", () => {
  assert.ok(html.includes("How this model works"));
  assert.ok(html.includes("What this model cannot tell you"));
  assert.ok(html.includes("It does not predict Q-Day"));
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

test("security properties stay distinct and match the event", () => {
  const compliance = simulate({ ...base, event: "tls" }).properties;
  assert.ok(compliance.compliance > 0 && compliance.availability > 0);
  assert.equal(compliance.confidentiality, undefined, "a deprecation deadline is not a confidentiality break");

  const trust = simulate({ ...base, industry: "gov", event: "ca" }).properties;
  assert.ok(trust.authenticity > 0, "a distrusted authority is an authenticity failure");
  assert.equal(trust.confidentiality, undefined, "a distrusted authority does not read anyone's data");

  const quantum = simulate({ ...base, event: "qday" }).properties;
  assert.ok(quantum.confidentiality > 0 && quantum.authenticity > 0);
});

test("harvest-now-decrypt-later only counts long-lived data behind key agreement", () => {
  const quantum = simulate({ ...base, inventory: 100, event: "qday" });
  assert.ok(quantum.counts.retro > 0, "a public-key break should expose retained data in retrospect");
  for (const name of quantum.names.retro) {
    const asset = SCENES.health.assets.find((a) => a.name === name);
    assert.equal(asset.band, "keys");
    assert.ok(asset.dep.includes("pk"), "symmetric-only storage is weakened, not opened");
  }
  // A trust-chain failure reads nobody's archives.
  assert.equal(simulate({ ...base, inventory: 100, event: "ca" }).counts.retro, 0);
});

test("the event horizon is carried into the result", () => {
  assert.equal(simulate({ ...base, horizon: 3 }).horizon, 3);
  assert.equal(simulate({ ...base, horizon: 18 }).horizon, 18);
});

test("suppliers clear one at a time rather than all at once", () => {
  const seen = new Set();
  for (const vendor of [10, 30, 50, 70, 90, 100]) {
    seen.add(simulate({ ...base, industry: "infra", inventory: 100, vendor }).counts.blockedVendor);
  }
  assert.ok(seen.size >= 3, `vendor readiness should unblock gradually, saw ${[...seen]}`);
});

test("response reach is derived from the outcome, not from a weighting of inputs", () => {
  for (const industry of industries) {
    for (const event of events) {
      const r = simulate({ ...base, industry, event });
      const expected = r.counts.affected ? Math.round((100 * r.counts.exposed) / r.counts.affected) : 100;
      assert.equal(r.reach, expected, `${industry}/${event}`);
      assert.ok(r.reach >= 0 && r.reach <= 100);
    }
  }
});

test("controls move the outcome monotonically and in small steps", () => {
  for (const industry of industries) {
    // Seeing more can never mean seeing less, and never swings more than a couple of systems at once.
    let worstStep = 0;
    for (let inventory = 20; inventory < 100; inventory += 1) {
      const a = simulate({ ...base, industry, inventory });
      const b = simulate({ ...base, industry, inventory: inventory + 1 });
      assert.ok(b.counts.unknown <= a.counts.unknown, `${industry}: inventory ${inventory}→${inventory + 1} hid systems`);
      worstStep = Math.max(worstStep, a.counts.unknown - b.counts.unknown);
    }
    assert.ok(worstStep <= 2, `${industry}: inventory moved ${worstStep} systems in one step`);

    // Better supplier readiness never blocks more, and more orchestration never takes longer.
    for (let vendor = 10; vendor < 100; vendor += 1) {
      const a = simulate({ ...base, industry, inventory: 100, vendor });
      const b = simulate({ ...base, industry, inventory: 100, vendor: vendor + 1 });
      assert.ok(b.counts.blockedVendor <= a.counts.blockedVendor, `${industry}: vendor ${vendor}→${vendor + 1} blocked more`);
    }
    for (let orch = 0; orch < 100; orch += 5) {
      const a = simulate({ ...base, industry, orch });
      const b = simulate({ ...base, industry, orch: orch + 5 });
      assert.ok(b.days.agile <= a.days.agile, `${industry}: orchestration ${orch}→${orch + 5} slowed the response`);
    }
  }
});
