import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../utm/index.html', import.meta.url), 'utf8');
const controller = await readFile(new URL('../assets/js/utm.js', import.meta.url), 'utf8');

assert.match(page, /href="\.\.\/assets\/css\/main\.css"/);
assert.match(page, /href="\.\.\/assets\/css\/utm\.css"/);
assert.match(page, /src="\.\.\/assets\/js\/nav\.js"/);
assert.match(page, /src="\.\.\/assets\/js\/main\.js"/);
assert.match(page, /src="\.\.\/assets\/js\/utm\.js"/);
assert.doesNotMatch(page, /<script type="module" src="\.\.\/assets\/js\/utm\.js"><\/script>/);
assert.doesNotMatch(page, /(?:href|src)="\/assets\//);
assert.match(page, /id="utm-source"[^>]*value="yandex_direct"/);
assert.doesNotMatch(page, /старые UTM удалим/);
assert.match(page, /id="generate-utm"/);
assert.match(page, /Собрать ссылку/);
assert.match(page, /utm_content/);
assert.match(page, /utm_term/);
assert.match(page, /<label for="utm-content">Содержание <small>utm_content<\/small><\/label>/);
assert.doesNotMatch(page, /Содержание \/ креатив/);
assert.match(page, /placeholder="reels_01"/);
assert.match(page, /Динамические шаблоны[\s\S]*продвинутый уровень/);
assert.doesNotMatch(controller, /^import\s/m);
assert.match(controller, /let hasSubmitted = false/);
assert.doesNotMatch(controller, /Скопировать шаблон/);
assert.match(controller, /const message = showErrors \? errors\[name\] \?\? '' : ''/);
assert.match(controller, /if \(Object\.keys\(errors\)\.length \|\| !hasSubmitted\)/);
assert.match(controller, /copyText\(macro\.value, null\)/);

console.log('PASS: UTM page assets use paths that work from /utm/ and file previews');
