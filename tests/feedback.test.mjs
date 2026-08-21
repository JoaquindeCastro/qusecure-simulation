import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../assets/feedback.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../assets/feedback.js', import.meta.url), 'utf8');
const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');

test('build injects the narrative enhancement layer', () => {
  assert.match(build, /assets\/feedback\.css/);
  assert.match(build, /assets\/feedback\.js/);
});

test('industry continuity and quick exit are present', () => {
  assert.match(js, /Here’s your/);
  assert.match(js, /30-second takeaway/);
  assert.match(js, /Get crypto agility for your bank/);
});

test('readiness bridge and visual drill-down are present', () => {
  assert.match(js, /What “protected” means here/);
  assert.match(js, /Focus the network/);
  assert.match(css, /\.scene\.layer-focus/);
});

test('result has an explicit trouble-to-solution turn', () => {
  assert.match(js, /You’re exposed\. This is the part you can change\./);
  assert.match(js, /Replay with crypto agility/);
});
