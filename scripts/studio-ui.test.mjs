import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';

const html = await readFile(new URL('../public/admin/index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../public/admin/studio.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../public/admin/studio.js', import.meta.url), 'utf8');

assert.ok(html.includes('href="/admin/studio.css"'), 'Studio CSS must load');
assert.ok(html.includes('src="/admin/studio.js"'), 'Studio JS must load');
assert.ok(html.includes('id="portfolio"') && html.includes('id="media"'));
assert.ok(!html.includes('\\n<script>\\n(function(){'), 'No escaped-newline V12 block');
assert.ok(css.includes('.studio-collapsed') && css.includes('.studio-menu-open'));
assert.ok(js.includes('cp_studio_active_tab') && js.includes('aria-expanded'));

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(([, attributes]) => !/\bsrc\s*=/.test(attributes));
assert.ok(scripts.length >= 2, 'Expected inline application and enhancement scripts');
scripts.forEach(([, , source], index) => {
  try {
    new Script(source, {filename: 'admin-inline-' + index + '.js'});
  } catch (error) {
    throw new Error('Invalid inline admin script #' + index + ': ' + error.message);
  }
});
console.log('Studio UI: connected styles, mobile/collapsible navigation, section persistence, inline JS valid.');
