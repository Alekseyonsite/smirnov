(() => {
const CYRILLIC_TO_LATIN = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
const SOURCE_PRESETS = [
  { label: 'Telegram', value: 'telegram' }, { label: 'Instagram', value: 'instagram' },
  { label: 'Яндекс.Директ', value: 'yandex_direct' }, { label: 'Google Ads', value: 'google_ads' }, { label: 'VK Реклама', value: 'vk_ads' },
];
const MEDIUM_PRESETS = [
  { label: 'CPC (оплата за клики)', value: 'cpc' }, { label: 'CPA (оплата за целевые действия)', value: 'cpa' },
  { label: 'Affiliate (партнёрские программы)', value: 'affiliate' }, { label: 'Social (соцсети)', value: 'social' },
  { label: 'Email (рассылки)', value: 'email' },
];
const DYNAMIC_TEMPLATES = {
  yandex: { label: 'Яндекс.Директ', macros: [
    { value: '{campaign_id}', label: 'ID кампании' }, { value: '{campaign_name_lat}', label: 'Название кампании' }, { value: '{campaign_type}', label: 'Тип кампании' }, { value: '{ad_id}', label: 'ID объявления' }, { value: '{banner_id}', label: 'ID баннера' }, { value: '{creative_id}', label: 'ID креатива' }, { value: '{gbid}', label: 'ID группы' }, { value: '{keyword}', label: 'Ключевая фраза' }, { value: '{phrase_id}', label: 'ID ключевой фразы' }, { value: '{retargeting_id}', label: 'ID ретаргетинга' }, { value: '{source_type}', label: 'Тип площадки' }, { value: '{device_type}', label: 'Устройство' }, { value: '{region_id}', label: 'ID региона' }, { value: '{region_name}', label: 'Регион' }, { value: '{yclid}', label: 'ID клика' },
  ], fragment: 'utm_source=yandex_direct&utm_medium=cpc&utm_campaign={campaign_id}&utm_content={ad_id}&utm_term={keyword}' },
  vk: { label: 'VK Реклама', macros: [
    { value: '{{campaign_id}}', label: 'ID кампании' }, { value: '{{banner_id}}', label: 'ID баннера' }, { value: '{{geo}}', label: 'Гео показа' }, { value: '{{gender}}', label: 'Пол' }, { value: '{{age}}', label: 'Возраст' },
  ], fragment: 'utm_source=vk_ads&utm_medium=cpa&utm_campaign={{campaign_id}}&utm_content={{banner_id}}' },
  google: { label: 'Google Ads', macros: [
    { value: '{campaignid}', label: 'ID кампании' }, { value: '{adgroupid}', label: 'ID группы' }, { value: '{creative}', label: 'ID объявления' }, { value: '{keyword}', label: 'Ключевое слово' }, { value: '{placement}', label: 'Площадка' }, { value: '{device}', label: 'Устройство' }, { value: '{network}', label: 'Сеть' }, { value: '{matchtype}', label: 'Тип соответствия' }, { value: '{targetid}', label: 'ID таргетинга' }, { value: '{loc_physical_ms}', label: 'ID геолокации' },
  ], fragment: 'utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}' },
};

function isDynamicMacro(value) { return /^(?:\{[^{}]+\}|\{\{[^{}]+\}\})$/.test(String(value).trim()); }
function normalizeValue(value) {
  const original = String(value ?? '').trim();
  if (!original || isDynamicMacro(original)) return original;
  return original.toLowerCase().replace(/[—–]/g, '-').split('').map((character) => CYRILLIC_TO_LATIN[character] ?? character).join('').replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '').replace(/_+/g, '_');
}
function cleanTargetUrl(value) { const rawValue = String(value).trim(); const url = new URL(/^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`); url.search = ''; url.hash = ''; return url; }
function buildUtmUrl(target, values) {
  const url = cleanTargetUrl(target);
  [['utm_source', values.source], ['utm_medium', values.medium], ['utm_campaign', values.campaign], ['utm_content', values.content], ['utm_term', values.term]].forEach(([key, value]) => { const normalized = normalizeValue(value); if (normalized) url.searchParams.set(key, normalized); });
  return url.toString().replace(/%7B/gi, '{').replace(/%7D/gi, '}');
}
function validateRequired(values) {
  const errors = {};
  if (!String(values.target ?? '').trim()) errors.target = 'Укажите ссылку на страницу.';
  if (!normalizeValue(values.source)) errors.source = 'Укажите источник.';
  if (!normalizeValue(values.medium)) errors.medium = 'Укажите канал.';
  if (!normalizeValue(values.campaign)) errors.campaign = 'Укажите название кампании.';
  return errors;
}
function validateTargetUrl(value) {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) return 'Укажите ссылку на страницу.';
  const host = rawValue.replace(/^https?:\/\//i, '').split(/[/?#]/)[0];
  if (!host.includes('.') || host.startsWith('.') || host.endsWith('.')) return 'Укажите доменную зону (.ru, .com, .io и т. д.), например: https://site.com.';
  try { const url = cleanTargetUrl(rawValue); return /^https?:$/.test(url.protocol) ? '' : 'Введите корректную ссылку с http:// или https://.'; } catch { return 'Введите корректную ссылку с http:// или https://.'; }
}
function templateExample(platform) { const template = DYNAMIC_TEMPLATES[platform]; if (!template) throw new Error('Неизвестная рекламная площадка.'); return template.fragment; }

const fieldIds = {
  target: 'target-url',
  source: 'utm-source',
  medium: 'utm-medium',
  campaign: 'utm-campaign',
  content: 'utm-content',
  term: 'utm-term',
};

const fields = Object.fromEntries(
  Object.entries(fieldIds).map(([name, id]) => [name, document.getElementById(id)]),
);
const form = document.getElementById('utm-form');
const result = document.getElementById('utm-result');
const output = document.getElementById('utm-output');
const status = document.getElementById('utm-action-status');
const copyButton = document.getElementById('copy-utm');
const shareButton = document.getElementById('share-utm');
const generateButton = document.getElementById('generate-utm');
const formStatus = document.getElementById('utm-form-status');
const tabs = document.getElementById('template-tabs');
const templateContent = document.getElementById('template-content');
const keywordMacro = document.getElementById('insert-keyword-macro');

let generatedUrl = '';
let activeTemplate = 'yandex';
let hasSubmitted = false;

function getValues() {
  return Object.fromEntries(
    Object.entries(fields).map(([name, field]) => [name, field.value]),
  );
}

function setStatus(message) {
  status.textContent = message;
}

function setErrors(errors, showErrors) {
  Object.entries(fields).forEach(([name, field]) => {
    const error = document.getElementById(`${field.id}-error`);
    const message = showErrors ? errors[name] ?? '' : '';
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) {
      error.textContent = message ?? '';
      error.dataset.hint = String(name === 'target' && message.includes('доменную зону'));
    }
  });
}

function updateResult(showErrors = hasSubmitted) {
  const values = getValues();
  const errors = validateRequired(values);
  const targetError = validateTargetUrl(values.target);
  if (targetError) errors.target = targetError;

  setErrors(errors, showErrors);
  if (Object.keys(errors).length || !hasSubmitted) {
    formStatus.textContent = showErrors ? `Не удалось собрать ссылку: ${Object.values(errors).join(' ')}` : '';
    generatedUrl = '';
    output.textContent = '';
    result.hidden = true;
    return;
  }

  generatedUrl = buildUtmUrl(values.target, values);
  formStatus.textContent = '';
  output.textContent = generatedUrl;
  result.hidden = false;
}

function renderPresetGroup(group, presets) {
  const container = document.querySelector(`[data-preset-group="${group}"]`);
  if (!container) return;

  container.replaceChildren(...presets.map((preset) => {
    const option = typeof preset === 'string' ? { label: preset, value: preset } : preset;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'utm-chip';
    button.textContent = option.label;
    button.dataset.value = option.value;
    button.addEventListener('click', () => {
      fields[group].value = option.value;
      updatePresetStates(group);
      updateResult();
    });
    return button;
  }));

  updatePresetStates(group);
}

function updatePresetStates(group) {
  const value = fields[group].value.trim().toLowerCase();
  document.querySelectorAll(`[data-preset-group="${group}"] .utm-chip`).forEach((button) => {
    button.classList.toggle('is-active', button.dataset.value === value);
  });
}

async function copyText(value, message = 'Ссылка скопирована.') {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const temporaryField = document.createElement('textarea');
      temporaryField.value = value;
      temporaryField.setAttribute('readonly', '');
      temporaryField.className = 'utm-copy-fallback';
      document.body.append(temporaryField);
      temporaryField.select();
      const copied = document.execCommand('copy');
      temporaryField.remove();
      if (!copied) throw new Error('copy command was rejected');
    }
    if (message) setStatus(message);
    return true;
  } catch {
    if (message) setStatus('Не получилось скопировать ссылку. Скопируйте её вручную.');
    return false;
  }
}

function renderTemplates() {
  const template = DYNAMIC_TEMPLATES[activeTemplate];
  tabs.replaceChildren(...Object.entries(DYNAMIC_TEMPLATES).map(([key, item]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'utm-template-tab';
    button.id = `template-tab-${key}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', 'template-content');
    button.setAttribute('aria-selected', String(key === activeTemplate));
    button.textContent = item.label;
    button.addEventListener('click', () => {
      activeTemplate = key;
      renderTemplates();
    });
    return button;
  }));

  templateContent.setAttribute('aria-labelledby', `template-tab-${activeTemplate}`);
  templateContent.replaceChildren();
  const title = document.createElement('h3');
  title.textContent = `${template.label} · часто используемые параметры`;
  const intro = document.createElement('p');
  intro.textContent = 'Площадка подставит фактические данные при переходе по рекламе. Нажмите, чтобы скопировать параметр.';
  const macroGrid = document.createElement('div');
  macroGrid.className = 'utm-macro-grid';
  template.macros.forEach((macro) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'utm-macro';
    const value = document.createElement('code');
    value.textContent = macro.value;
    const label = document.createElement('span');
    label.textContent = macro.label;
    button.append(value, label);
    button.addEventListener('click', () => copyText(macro.value, null));
    macroGrid.append(button);
  });

  templateContent.append(title, intro, macroGrid);
}

form.addEventListener('input', (event) => {
  const group = Object.entries(fields).find(([, field]) => field === event.target)?.[0];
  if (group === 'source' || group === 'medium') updatePresetStates(group);
  updateResult();
});

form.addEventListener('submit', (event) => event.preventDefault());
keywordMacro.addEventListener('click', () => {
  fields.term.value = '{keyword}';
  fields.term.focus();
  updateResult();
});
generateButton.addEventListener('click', () => {
  hasSubmitted = true;
  updateResult();
  if (generatedUrl) result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
copyButton.addEventListener('click', () => copyText(generatedUrl));
shareButton.addEventListener('click', async () => {
  if (!generatedUrl) return;
  if (!navigator.share) {
    await copyText(generatedUrl, 'На этом устройстве пересылка недоступна — ссылка скопирована.');
    return;
  }

  try {
    await navigator.share({ title: 'UTM-ссылка', text: generatedUrl, url: generatedUrl });
    setStatus('Ссылку можно отправить в выбранное приложение.');
  } catch (error) {
    if (error?.name === 'AbortError') return;
    await copyText(generatedUrl, 'Не удалось открыть пересылку — ссылка скопирована.');
  }
});

renderPresetGroup('source', SOURCE_PRESETS);
renderPresetGroup('medium', MEDIUM_PRESETS);
renderTemplates();
updateResult(false);
})();
