import assert from 'node:assert/strict';

import {
  DYNAMIC_TEMPLATES,
  MEDIUM_PRESETS,
  SOURCE_PRESETS,
  buildUtmUrl,
  cleanTargetUrl,
  isDynamicMacro,
  normalizeValue,
  templateExample,
  validateRequired,
} from '../assets/js/utm-utils.mjs';

const tests = [
  ['normalizes manually entered Cyrillic text without changing hyphens', () => {
    assert.equal(normalizeValue('Рилс UTM — Октябрь'), 'rils_utm_-_oktyabr');
    assert.equal(normalizeValue('Dubai-real estate'), 'dubai-real_estate');
  }],
  ['keeps a complete dynamic macro verbatim', () => {
    assert.equal(isDynamicMacro('{keyword}'), true);
    assert.equal(normalizeValue('{keyword}'), '{keyword}');
  }],
  ['removes query parameters and hash from the target URL', () => {
    const result = cleanTargetUrl('https://example.com/offer?old=1&utm_source=old#section');
    assert.equal(result.toString(), 'https://example.com/offer');
  }],
  ['builds a fresh URL from normalized required and optional UTM values', () => {
    assert.equal(
      buildUtmUrl('https://example.com/offer?old=1', {
        source: 'Яндекс Директ', medium: 'CPC', campaign: 'Дубай — Осень', content: '', term: '{keyword}',
      }),
      'https://example.com/offer?utm_source=yandeks_direkt&utm_medium=cpc&utm_campaign=dubay_-_osen&utm_term=%7Bkeyword%7D',
    );
  }],
  ['exposes the approved presets and documented Google and Yandex macros', () => {
    assert.deepEqual(SOURCE_PRESETS.map((preset) => preset.label), ['Telegram', 'Instagram', 'Яндекс.Директ', 'Google Ads', 'VK Реклама']);
    assert.deepEqual(MEDIUM_PRESETS.slice(0, 4), ['cpc', 'cpm', 'cpa', 'affiliate']);
    assert.ok(DYNAMIC_TEMPLATES.google.macros.some((macro) => macro.value === '{campaignid}'));
    assert.ok(DYNAMIC_TEMPLATES.yandex.macros.some((macro) => macro.value === '{campaign_id}'));
  }],
  ['reports only missing required UTM fields', () => {
    assert.deepEqual(
      validateRequired({ target: '', source: 'telegram', medium: '', campaign: '', content: 'article_1', term: '' }),
      { target: 'Укажите ссылку на страницу.', medium: 'Укажите канал.', campaign: 'Укажите название кампании.' },
    );
  }],
  ['rejects required UTM values that become empty after normalization', () => {
    assert.deepEqual(
      validateRequired({ target: 'https://example.com', source: '!!!', medium: '🚀', campaign: '💥', content: '', term: '' }),
      { source: 'Укажите источник.', medium: 'Укажите канал.', campaign: 'Укажите название кампании.' },
    );
  }],
  ['returns a documented platform template and rejects an unknown platform', () => {
    assert.equal(templateExample('google'), 'utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}');
    assert.throws(() => templateExample('unknown'), /Неизвестная рекламная площадка/);
  }],
  ['keeps only the verified VK Ads template macros', () => {
    assert.equal(DYNAMIC_TEMPLATES.vk.macros.some((macro) => macro.value === '{{ad_id}}'), false);
  }],
];

let passed = 0;
for (const [name, run] of tests) {
  run();
  passed += 1;
  console.log(`PASS: ${name}`);
}
console.log(`${passed}/${tests.length} tests passed`);
