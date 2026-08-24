import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../assets/brand-overrides.css', import.meta.url), 'utf8');
const patch = await readFile(new URL('../assets/ui-patch.js', import.meta.url), 'utf8');
const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');

test('production build loads brand overrides after the base presentation', () => {
  assert.match(build, /brand-overrides\.css/);
  assert.match(build, /ui-patch\.js/);
});

test('QuSecure brand guide palette is represented exactly', () => {
  for (const hex of ['#010748', '#2F6FED', '#39E0E8', '#A9FD91', '#C56B4D', '#FFA95E', '#DF9262', '#072A79', '#6CC9F3']) {
    assert.match(css, new RegExp(hex, 'i'));
  }
  assert.match(css, /Albert Sans/);
});

test('industry chooser removes card borders and keeps labels below imagery', () => {
  assert.match(css, /\.qv2-industry-card[\s\S]*border:\s*0\s*!important/);
  assert.match(css, /\.qv2-industry-copy b/);
  assert.match(css, /\.qv2-industry-copy span[\s\S]*display:\s*none/);
});

test('component overlay labels are hidden and bottom label is emphasized', () => {
  assert.match(css, /\.qv2-spot span[\s\S]*display:\s*none/);
  assert.match(css, /\.qv2-scene-label[\s\S]*font-size:\s*17px/);
  assert.match(css, /\.qv2-scene-label[\s\S]*font-weight:\s*700/);
});

test('agile replay shows a bold new timing beside a struck old timing', () => {
  assert.doesNotThrow(() => new Function(patch));
  assert.match(patch, /qv2-new-stat/);
  assert.match(patch, /qv2-old-stat/);
  assert.match(patch, /<s class=/);
});
