import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../assets/feedback.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../assets/feedback.js', import.meta.url), 'utf8');
const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');

test('build injects the enhancement layer', () => {
  assert.match(build, /assets\/feedback\.css/);
  assert.match(build, /assets\/feedback\.js/);
});

test('industry continuity and quick exit remain', () => {
  assert.match(js, /Your /);
  assert.match(js, /30-second takeaway/);
  assert.match(js, /Get crypto agility for your bank/);
});

test('industry images isolate selected components', () => {
  assert.match(js, /component-overlay/);
  assert.match(js, /focusComponent/);
  assert.match(js, /clipPath/);
  assert.match(css, /\.scene\.component-focus/);
  assert.match(css, /grayscale\(1\)/);
});

test('copy density is reduced with progressive disclosure', () => {
  assert.match(js, /Click a system to isolate it/);
  assert.match(js, /Why this happened/);
  assert.match(css, /result-disclosure/);
});

test('result still has an explicit trouble-to-solution turn', () => {
  assert.match(js, /The edge was the easy part/);
  assert.match(js, /Replay with crypto agility/);
});
