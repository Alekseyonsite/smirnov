const CYRILLIC_TO_LATIN = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export const SOURCE_PRESETS = [
  { label: 'Telegram', value: 'telegram' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Яндекс.Директ', value: 'yandex_direct' },
  { label: 'Google Ads', value: 'google_ads' },
  { label: 'VK Реклама', value: 'vk_ads' },
];

export const MEDIUM_PRESETS = [
  { label: 'CPC (оплата за клики)', value: 'cpc' },
  { label: 'CPA (оплата за целевые действия)', value: 'cpa' },
  { label: 'Affiliate (партнёрские программы)', value: 'affiliate' },
  { label: 'Social (соцсети)', value: 'social' },
  { label: 'Email (рассылки)', value: 'email' },
];

export const DYNAMIC_TEMPLATES = {
  yandex: {
    label: 'Яндекс.Директ',
    macros: [
      { value: '{campaign_id}', label: 'ID кампании' },
      { value: '{campaign_name_lat}', label: 'Название кампании' },
      { value: '{campaign_type}', label: 'Тип кампании' },
      { value: '{ad_id}', label: 'ID объявления' },
      { value: '{banner_id}', label: 'ID баннера' },
      { value: '{creative_id}', label: 'ID креатива' },
      { value: '{gbid}', label: 'ID группы' },
      { value: '{keyword}', label: 'Ключевая фраза' },
      { value: '{phrase_id}', label: 'ID ключевой фразы' },
      { value: '{retargeting_id}', label: 'ID ретаргетинга' },
      { value: '{source_type}', label: 'Тип площадки' },
      { value: '{device_type}', label: 'Устройство' },
      { value: '{region_id}', label: 'ID региона' },
      { value: '{region_name}', label: 'Регион' },
      { value: '{yclid}', label: 'ID клика' },
    ],
    fragment: 'utm_source=yandex_direct&utm_medium=cpc&utm_campaign={campaign_id}&utm_content={ad_id}&utm_term={keyword}',
  },
  vk: {
    // VK Ads template examples use {{campaign_id}} and {{banner_id}}:
    // https://object2-ac.vk-apps.com/vk-education-0554ff56-27eb-4093-a702-685722cef6d9/media/ad/79ad8eafc5324d46a3c153cd5e9a2a32.pdf
    label: 'VK Реклама',
    macros: [
      { value: '{{campaign_id}}', label: 'ID кампании' },
      { value: '{{banner_id}}', label: 'ID баннера' },
      { value: '{{geo}}', label: 'Гео показа' },
      { value: '{{gender}}', label: 'Пол' },
      { value: '{{age}}', label: 'Возраст' },
    ],
    fragment: 'utm_source=vk_ads&utm_medium=cpa&utm_campaign={{campaign_id}}&utm_content={{banner_id}}',
  },
  google: {
    label: 'Google Ads',
    macros: [
      { value: '{campaignid}', label: 'ID кампании' },
      { value: '{adgroupid}', label: 'ID группы' },
      { value: '{creative}', label: 'ID объявления' },
      { value: '{keyword}', label: 'Ключевое слово' },
      { value: '{placement}', label: 'Площадка' },
      { value: '{device}', label: 'Устройство' },
      { value: '{network}', label: 'Сеть' },
      { value: '{matchtype}', label: 'Тип соответствия' },
      { value: '{targetid}', label: 'ID таргетинга' },
      { value: '{loc_physical_ms}', label: 'ID геолокации' },
    ],
    fragment: 'utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}',
  },
};

export function isDynamicMacro(value) {
  return /^(?:\{[^{}]+\}|\{\{[^{}]+\}\})$/.test(String(value).trim());
}

export function normalizeValue(value) {
  const original = String(value ?? '').trim();
  if (!original || isDynamicMacro(original)) return original;

  return original
    .toLowerCase()
    .replace(/[—–]/g, '-')
    .split('')
    .map((character) => CYRILLIC_TO_LATIN[character] ?? character)
    .join('')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/_+/g, '_');
}

export function cleanTargetUrl(value) {
  const rawValue = String(value).trim();
  const url = new URL(/^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`);
  url.search = '';
  url.hash = '';
  return url;
}

export function buildUtmUrl(target, values) {
  const url = cleanTargetUrl(target);
  const entries = [
    ['utm_source', values.source],
    ['utm_medium', values.medium],
    ['utm_campaign', values.campaign],
    ['utm_content', values.content],
    ['utm_term', values.term],
  ];

  entries.forEach(([key, value]) => {
    const normalized = normalizeValue(value);
    if (normalized) url.searchParams.set(key, normalized);
  });

  return url.toString().replace(/%7B/gi, '{').replace(/%7D/gi, '}');
}

export function validateRequired(values) {
  const errors = {};

  if (!String(values.target ?? '').trim()) errors.target = 'Укажите ссылку на страницу.';
  if (!normalizeValue(values.source)) errors.source = 'Укажите источник.';
  if (!normalizeValue(values.medium)) errors.medium = 'Укажите канал.';
  if (!normalizeValue(values.campaign)) errors.campaign = 'Укажите название кампании.';

  return errors;
}

export function validateTargetUrl(value) {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) return 'Укажите ссылку на страницу.';
  const host = rawValue.replace(/^https?:\/\//i, '').split(/[/?#]/)[0];
  if (!host.includes('.') || host.startsWith('.') || host.endsWith('.')) return 'Укажите доменную зону (.ru, .com, .io и т. д.), например: https://site.com.';

  try {
    const url = cleanTargetUrl(rawValue);
    return /^https?:$/.test(url.protocol) ? '' : 'Введите корректную ссылку с http:// или https://.';
  } catch {
    return 'Введите корректную ссылку с http:// или https://.';
  }
}

export function templateExample(platform) {
  const template = DYNAMIC_TEMPLATES[platform];
  if (!template) throw new Error('Неизвестная рекламная площадка.');
  return template.fragment;
}
