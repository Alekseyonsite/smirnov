import {
  DYNAMIC_TEMPLATES,
  MEDIUM_PRESETS,
  SOURCE_PRESETS,
  buildUtmUrl,
  cleanTargetUrl,
  templateExample,
  validateRequired,
} from './utm-utils.mjs';

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
const tabs = document.getElementById('template-tabs');
const templateContent = document.getElementById('template-content');

let generatedUrl = '';
let activeTemplate = 'google';

function getValues() {
  return Object.fromEntries(
    Object.entries(fields).map(([name, field]) => [name, field.value]),
  );
}

function setStatus(message) {
  status.textContent = message;
}

function setErrors(errors) {
  Object.entries(fields).forEach(([name, field]) => {
    const error = document.getElementById(`${field.id}-error`);
    field.setAttribute('aria-invalid', String(Boolean(errors[name])));
    if (error) error.textContent = errors[name] ?? '';
  });
}

function updateResult() {
  const values = getValues();
  const errors = validateRequired(values);

  if (!errors.target && values.target.trim()) {
    try {
      const targetUrl = cleanTargetUrl(values.target);
      if (!/^https?:$/.test(targetUrl.protocol)) throw new Error('unsupported protocol');
    } catch {
      errors.target = 'Введите корректную ссылку с http:// или https://.';
    }
  }

  setErrors(errors);
  if (Object.keys(errors).length) {
    generatedUrl = '';
    output.textContent = '';
    result.hidden = true;
    return;
  }

  generatedUrl = buildUtmUrl(values.target, values);
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
    setStatus(message);
    return true;
  } catch {
    setStatus('Не получилось скопировать ссылку. Скопируйте её вручную.');
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
    button.addEventListener('click', () => copyText(macro.value, `Параметр ${macro.value} скопирован.`));
    macroGrid.append(button);
  });

  const fragment = document.createElement('div');
  fragment.className = 'utm-template-fragment';
  const fragmentValue = document.createElement('code');
  fragmentValue.textContent = templateExample(activeTemplate);
  const fragmentCopy = document.createElement('button');
  fragmentCopy.type = 'button';
  fragmentCopy.className = 'utm-template-copy';
  fragmentCopy.textContent = 'Скопировать шаблон';
  fragmentCopy.addEventListener('click', () => copyText(templateExample(activeTemplate), 'Шаблон скопирован.'));
  fragment.append(fragmentValue, fragmentCopy);
  templateContent.append(title, intro, macroGrid, fragment);
}

form.addEventListener('input', (event) => {
  const group = Object.entries(fields).find(([, field]) => field === event.target)?.[0];
  if (group === 'source' || group === 'medium') updatePresetStates(group);
  updateResult();
});

form.addEventListener('submit', (event) => event.preventDefault());
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
updateResult();
