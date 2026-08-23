import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../assets/feedback.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../assets/feedback.js', import.meta.url), 'utf8');
const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');

test('build injects the replacement presentation layer', () => {
  assert.match(build, /assets\/feedback\.css/);
  assert.match(build, /assets\/feedback\.js/);
});

test('presentation script is valid JavaScript', () => {
  assert.doesNotThrow(() => new Function(js));
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

test('scenario choice is a translucent overlay', () => {
  assert.match(js, /qv2-overlay/);
  assert.match(css, /backdrop-filter: blur/);
  assert.match(js, /chooseScenario/);
});

test('result replaces the side panel and can replay with agility', () => {
  assert.match(js, /side\.textContent = ''/);
  assert.match(js, /Replay with crypto agility/);
  assert.match(js, /orch: 90/);
});

test('component isolation grays the rest of the industry image', () => {
  assert.match(js, /focusAsset/);
  assert.match(js, /clipPath/);
  assert.match(css, /grayscale\(1\)/);
  assert.match(css, /qv2-highlight-image/);
});
