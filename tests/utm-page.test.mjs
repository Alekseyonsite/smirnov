import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../utm/index.html', import.meta.url), 'utf8');

assert.match(page, /href="\.\.\/assets\/css\/main\.css"/);
assert.match(page, /href="\.\.\/assets\/css\/utm\.css"/);
assert.match(page, /src="\.\.\/assets\/js\/nav\.js"/);
assert.match(page, /src="\.\.\/assets\/js\/main\.js"/);
assert.match(page, /src="\.\.\/assets\/js\/utm\.js"/);
assert.doesNotMatch(page, /(?:href|src)="\/assets\//);

console.log('PASS: UTM page assets use paths that work from /utm/ and file previews');
