import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const patch = await readFile(new URL('../assets/model-patch.js', import.meta.url), 'utf8');
const source = html.slice(html.indexOf('/*MODEL-START*/'), html.indexOf('/*MODEL-END*/'));

const model = new Function(
  `${source}\n${patch}\nreturn { simulate, SCENES, ADOPTION, EVENTS, migrationSet, readinessKnownSet, READINESS_TARGETS };`
)();

const { simulate, SCENES, EVENTS, migrationSet, readinessKnownSet } = model;
const base = {
  industry: 'health',
  adoption: 'none',
  event: 'qday',
  inventory: 65,
  teams: 3,
  vendor: 55,
  orch: 15,
  horizon: 7,
  recon: false
};

test('live production model removes the generic proto mechanism', () => {
  for (const scene of Object.values(SCENES)) {
    for (const asset of scene.assets) assert.equal(asset.proto, undefined);
  }
  assert.equal(EVENTS.tls.label, 'PQC migration deadline');
  assert.equal(EVENTS.tls.kind, 'compliance');
});

test('readiness is explicit and monotonic for every industry', () => {
  const order = ['none', 'edge', 'pilot', 'orchestrated', 'native'];
  for (const industry of Object.keys(SCENES)) {
    const assets = SCENES[industry].assets;
    let prior = -1;
    for (const adoption of order) {
      const count = Object.keys(migrationSet(assets, adoption, { ...base, industry, adoption })).length;
      assert.ok(count >= prior, `${industry}/${adoption} regressed from ${prior} to ${count}`);
      prior = count;
    }
  }
});

test('broad migration means every known system is migrated', () => {
  for (const industry of Object.keys(SCENES)) {
    const assets = SCENES[industry].assets;
    const input = { ...base, industry, adoption: 'native' };
    assert.deepEqual(migrationSet(assets, 'native', input), readinessKnownSet(assets, 'native', input));
  }
});

test('reconnaissance discovers the complete finite tabletop estate', () => {
  for (const industry of Object.keys(SCENES)) {
    const before = simulate({ ...base, industry, event: 'qday' });
    const after = simulate({ ...base, industry, event: 'qday', recon: true, orch: 90 });
    assert.equal(after.counts.known, after.total, industry);
    assert.equal(after.counts.unknown, 0, industry);
    assert.ok(after.counts.unknown <= before.counts.unknown, industry);
  }
});

test('reconnaissance does not automatically migrate newly discovered broad-migration blind spots', () => {
  for (const industry of Object.keys(SCENES)) {
    const assets = SCENES[industry].assets;
    const beforeInput = { ...base, industry, adoption: 'native', recon: false };
    const afterInput = { ...beforeInput, recon: true, orch: 90 };
    const migratedBefore = migrationSet(assets, 'native', beforeInput);
    const migratedAfter = migrationSet(assets, 'native', afterInput);
    assert.deepEqual(migratedAfter, migratedBefore, industry);
    assert.equal(Object.keys(readinessKnownSet(assets, 'native', afterInput)).length, assets.length, industry);
  }
});

test('orchestration alone still does not discover systems', () => {
  for (const industry of Object.keys(SCENES)) {
    const low = simulate({ ...base, industry, orch: 0, recon: false });
    const high = simulate({ ...base, industry, orch: 100, recon: false });
    assert.equal(low.counts.unknown, high.counts.unknown, industry);
  }
});

test('PQC migration deadline is a policy event over quantum-vulnerable dependencies', () => {
  for (const industry of Object.keys(SCENES)) {
    const deadline = simulate({ ...base, industry, event: 'tls' });
    const qday = simulate({ ...base, industry, event: 'qday' });
    assert.equal(deadline.counts.affected, qday.counts.affected, industry);
    assert.equal(deadline.event.kind, 'compliance');
    assert.equal(qday.event.kind, 'vulnerability');
  }
});

test('PQC vulnerability scenario only hits the deployed migration set', () => {
  for (const industry of Object.keys(SCENES)) {
    const none = simulate({ ...base, industry, event: 'mlkem', adoption: 'none' });
    const pilotInput = { ...base, industry, event: 'mlkem', adoption: 'pilot' };
    const pilot = simulate(pilotInput);
    assert.equal(none.counts.affected, 0, industry);
    assert.equal(
      pilot.counts.affected,
      Object.keys(migrationSet(SCENES[industry].assets, 'pilot', pilotInput)).length,
      industry
    );
  }
});
