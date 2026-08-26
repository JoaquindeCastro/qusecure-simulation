import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../assets/feedback.css', import.meta.url), 'utf8');
const liveCss = await readFile(new URL('../assets/agility-flow.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../assets/feedback.js', import.meta.url), 'utf8');
const modelPatch = await readFile(new URL('../assets/model-patch.js', import.meta.url), 'utf8');
const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');

test('build injects the production model before the replacement presentation layer', () => {
  assert.match(build, /assets\/feedback\.css/);
  assert.match(build, /assets\/agility-flow\.css/);
  assert.match(build, /assets\/model-patch\.js/);
  assert.match(build, /assets\/feedback\.js/);
  assert.ok(build.indexOf('model-patch.js') < build.indexOf('feedback.js'));
  assert.doesNotMatch(build, /assets\/ui-patch\.js/);
});

test('production scripts are valid JavaScript', () => {
  assert.doesNotThrow(() => new Function(js));
  assert.doesNotThrow(() => new Function(modelPatch));
});

test('industry selection is a single grid', () => {
  assert.match(js, /qv2-industry-grid/);
  assert.match(css, /grid-template-columns: repeat\(4/);
  assert.doesNotMatch(js, /Previous industry|industry-context|INDUSTRY LOCKED IN/i);
});

test('the chosen industry remains in a persistent split workspace', () => {
  assert.match(js, /qv2-stage/);
  assert.match(js, /qv2-visual/);
  assert.match(js, /qv2-side/);
  assert.match(css, /height: 100dvh/);
});

test('readiness has explicit stages including none and broad migration', () => {
  assert.match(js, /None \/ Not sure/);
  assert.match(js, /Public edge only/);
  assert.match(js, /A few internal systems/);
  assert.match(js, /Most internal systems/);
  assert.match(js, /Broad migration/);
  assert.match(js, /migrationSet/);
});

test('scenario choice is a translucent overlay with concrete production scenarios', () => {
  assert.match(js, /qv2-overlay/);
  assert.match(css, /backdrop-filter: blur/);
  assert.match(js, /PQC migration deadline/);
  assert.match(js, /PQC vulnerability found/);
  assert.doesNotMatch(js, /Old protocol banned/);
});

test('replay explicitly uses reconnaissance, resilience, and reporting', () => {
  assert.match(js, /Reconnaissance/);
  assert.match(js, /Resilience/);
  assert.match(js, /Reporting/);
  assert.match(js, /recon: true/);
  assert.match(js, /orch: 90/);
  assert.match(js, /previously unknown systems identified/);
  assert.match(liveCss, /qv2-agility-flow/);
});

test('component isolation grays the rest of the industry image', () => {
  assert.match(js, /focusAsset/);
  assert.match(js, /clipPath/);
  assert.match(css, /grayscale\(1\)/);
  assert.match(css, /qv2-highlight-image/);
});
