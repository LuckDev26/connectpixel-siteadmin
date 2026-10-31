import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';

const html = await readFile(new URL('../public/admin/index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../public/admin/studio.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../public/admin/studio.js', import.meta.url), 'utf8');
const redesignCSS=await readFile(new URL('../public/admin/studio-redesign.css', import.meta.url), 'utf8');
const enhancedLogin=await readFile(new URL('../public/admin/login-experience.js', import.meta.url), 'utf8');


assert.ok(html.includes('href="/admin/studio.css"'), 'Studio CSS must load');
assert.ok(html.includes('src="/admin/studio.js"'), 'Studio JS must load');
assert.ok(html.includes('id="portfolio"') && html.includes('id="media"'));
assert.ok(!html.includes('\\n<script>\\n(function(){'), 'No escaped-newline V12 block');
assert.ok(css.includes('.studio-collapsed') && css.includes('.studio-menu-open'));
assert.ok(js.includes('cp_studio_active_tab') && js.includes('aria-expanded'));
assert.ok(html.includes('<div class="login-shell">') && html.includes('id="studioLoginForm"'), 'Redesigned login structure');
assert.ok(html.includes('aria-live="polite"') && html.includes('id="studioPasswordToggle"'), 'Accessible error and password control');
assert.ok(html.includes('href="/admin/studio-redesign.css"') && html.includes('src="/admin/login-experience.js"'), 'Redesign assets load');
assert.ok(redesignCSS.includes('.login-story') && redesignCSS.includes('.login-auth') && redesignCSS.includes('@media(max-width:900px)'), 'Responsive split login');
assert.ok(redesignCSS.includes('body.logged .card') && redesignCSS.includes('.studio-preview-cards'), 'Dashboard design and decorative login preview');
assert.ok(enhancedLogin.includes('getModifierState("CapsLock")') && enhancedLogin.includes('studioPasswordToggle'), 'Password UX');
assert.ok(!html.includes('localStorage.getItem("cp_token")'), 'No shared admin secret in localStorage');
assert.ok(html.includes('id="loginUsername"') && html.includes('autocomplete="username"'), 'Real username field must be present');
assert.ok(html.includes('id="loginToken"') && html.includes('autocomplete="current-password"'), 'Password field retains browser autocomplete semantics');
assert.ok(html.indexOf('id="loginUsername"') < html.indexOf('id="loginToken"'), 'Username must precede password');
assert.equal((html.match(/class="login-mobile-brand"/g)||[]).length,1,'Only one mobile brand mark');
assert.equal((html.match(/class="login-emblem"/g)||[]).length,0,'Duplicate login emblem removed');
assert.ok(html.includes('JSON.stringify({username,password})'), 'Login must send username and password to API');
assert.ok(redesignCSS.includes('Studio Auth 2.1') && redesignCSS.includes('.login-emblem { display:none!important; }'), 'Compact mobile layout removes duplicate logo');
assert.ok(enhancedLogin.includes('byId("loginUsername")'), 'Username errors can clear on input');

new Script(enhancedLogin, {filename:'login-experience.js'});


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
console.log('Studio UI: single logo on mobile, two real auth fields, compact layout and dashboard scripts valid.');
