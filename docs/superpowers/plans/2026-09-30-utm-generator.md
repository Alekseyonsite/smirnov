# UTM Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first UTM generator at `/utm/` that creates, copies, and shares normalized UTM URLs without registration.

**Architecture:** Keep the feature static and browser-only. A small ESM utility module owns URL cleanup, transliteration, normalization, and template data; a page controller owns the DOM, copy/share interactions, validation, and template tabs. The page has its own CSS but reuses the site's global tokens and injected navigation/footer.

**Tech Stack:** Static HTML, CSS, browser JavaScript modules, Node's built-in test runner; no dependencies, build step, backend, or database.

**Spec:** `docs/superpowers/specs/2026-09-30-utm-generator-design.md`

## Global Constraints

- Preserve the existing static HTML/CSS/JS architecture and site navigation/footer behavior.
- Do not add a library, backend, registration, history, or analytics storage.
- Use the approved dark style; mobile is primary and desktop uses the approved two-column form grid.
- Required fields are target URL, `utm_source`, `utm_medium`, and `utm_campaign`; their asterisks are red.
- Normalize manual values to lowercase transliterated Latin with spaces replaced by `_` and hyphens preserved; never alter brace-wrapped dynamic macros.
- Strip existing query parameters and old UTM tags from an entered URL before generating the new URL.
- Use the exact approved H1 and action labels: `Соберите ссылку с UTM-меткой без путаницы`, `Скопировать ссылку`, and `Переслать` with a trailing paper-plane icon.
- The URL text itself uses the normal light site text color, not accent yellow.
- Update the sitemap for `/utm/`; do not weaken existing headers or change privacy/analytics behavior.

## Review Focus

- URLs with an existing query string or hash must become a clean origin-and-path URL before the new UTM query is attached — Task 1 test.
- A Cyrillic campaign name must transliterate, lowercase, turn spaces into `_`, and retain hyphens — Task 1 test.
- `{keyword}` and other brace-wrapped macros must remain verbatim while manual text normalizes — Task 1 test.
- Failed clipboard or native share calls must preserve all entered fields and expose a clear Russian fallback message — Task 4 manual verification.
- The share action must not claim to save directly to Notes; it must invoke the device's system share UI — Task 4 manual verification.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `assets/js/utm-utils.mjs` | Pure URL parsing, parameter normalization, URL assembly, presets, and documented dynamic-template catalog. |
| `assets/js/utm.js` | DOM controller for validation, form synchronization, copy/share, template tabs, macro copying, and success/error feedback. |
| `assets/css/utm.css` | Page-specific mobile-first layout and the approved dark visual treatment. |
| `utm/index.html` | SEO-complete UTM page markup, form, explainer, dynamic-template section, and case card. |
| `assets/js/nav.js` | Active route detection and desktop/mobile navigation link for `/utm/`. |
| `tests/utm-utils.test.mjs` | Node built-in tests for the utility module's public functions. |
| `sitemap.xml` | Public URL entry for the new tool. |

### Task 1: UTM utility module

**Files:**

- Create: `assets/js/utm-utils.mjs`
- Create: `tests/utm-utils.test.mjs`

**Interfaces:**

- Produces `normalizeValue(value: string): string`, `isDynamicMacro(value: string): boolean`, `cleanTargetUrl(value: string): URL`, `buildUtmUrl(target: string, values: UTMValues): string`, `SOURCE_PRESETS`, `MEDIUM_PRESETS`, and `DYNAMIC_TEMPLATES`.
- Consumes no application modules.

- [ ] **Step 1: Write failing Node tests for URL cleanup, normalization, macro preservation, and URL generation**

```js
assert.equal(normalizeValue('Рилс UTM — Октябрь'), 'rils_utm_-_oktyabr');
assert.equal(normalizeValue('{keyword}'), '{keyword}');
assert.equal(
  buildUtmUrl('https://example.com/offer?old=1', {
    source: 'Яндекс Директ', medium: 'CPC', campaign: 'Дубай — Осень', content: '', term: '{keyword}'
  }),
  'https://example.com/offer?utm_source=yandeks_direkt&utm_medium=cpc&utm_campaign=dubai_-_osen&utm_term={keyword}'
);
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/utm-utils.test.mjs`

Expected: FAIL because `assets/js/utm-utils.mjs` does not exist.

- [ ] **Step 3: Implement the pure module in `assets/js/utm-utils.mjs`**

Use `URL` to validate and clean the target. Store the Russian-to-Latin transliteration map in this module. Preserve the origin and pathname, remove the existing search and hash, omit optional empty UTM parameters, and encode all generated query values. Keep macro strings unchanged only when the complete value matches the brace-wrapped macro pattern.

- [ ] **Step 4: Add and pass catalog-shape tests**

Assert source/medium presets include the approved values and Google/Yandex catalogs include every macro named in the spec. Keep VK's catalog behind a documented verification point; do not release inferred macro syntax.

Run: `node --test tests/utm-utils.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit the utility module and tests**

```bash
git add assets/js/utm-utils.mjs tests/utm-utils.test.mjs
git commit -m "feat: add UTM URL utilities"
```

### Task 2: Page shell, SEO, and navigation

**Files:**

- Create: `utm/index.html`
- Modify: `assets/js/nav.js`
- Modify: `sitemap.xml`

**Interfaces:**

- Consumes the global CSS, injected navigation/footer behavior, and the script modules created in Task 1.
- Produces stable DOM IDs and `data-*` hooks consumed by `assets/js/utm.js`: `#utm-form`, `#target-url`, `#utm-source`, `#utm-medium`, `#utm-campaign`, `#utm-content`, `#utm-term`, `#utm-result`, `#copy-utm`, `#share-utm`, `#template-tabs`, and `#template-content`.

- [ ] **Step 1: Add the failing structural assertions to `tests/utm-utils.test.mjs` only if a no-dependency HTML read test is practical; otherwise record the exact manual checklist in the task verification step**

The static repository has no HTML test framework. Do not introduce one for a single page. The manual check must assert one H1, required metadata, correct canonical URL, normal `nav.js` injection, and all DOM IDs above.

- [ ] **Step 2: Create `utm/index.html` with the approved content hierarchy and complete SEO metadata**

Include the normal site script order, one H1, canonical `https://smirnovads.com/utm/`, unique Russian title/description, all required Open Graph fields, `twitter:card`, the visible UTM explainer before the form, form markup in the approved field order, result actions, dynamic-template panel, and the UAE case card that links to `/cases/uae-real-estate/`. Reuse verified case wording instead of inventing metrics.

- [ ] **Step 3: Add `/utm/` to desktop and mobile navigation in `assets/js/nav.js`**

Extend `getActiveSection()` with `utm`; add a `UTM-генератор` link to both `navOnlyHTML` and `mobileOnlyHTML`; make the active state apply only on `/utm/`.

- [ ] **Step 4: Add the new public page to `sitemap.xml`**

Use `https://smirnovads.com/utm/`, current implementation date as `lastmod`, `monthly` change frequency, and a priority suitable for a useful tool page. Confirm `robots.txt` still references `https://smirnovads.com/sitemap.xml`.

- [ ] **Step 5: Manually verify page structure and navigation**

Open `/utm/` locally. Verify the ordinary desktop header, burger menu, active navigation state, all internal links, one H1, canonical/OG/Twitter metadata, and sitemap XML well-formedness.

- [ ] **Step 6: Commit the page shell, nav, and sitemap changes**

```bash
git add utm/index.html assets/js/nav.js sitemap.xml
git commit -m "feat: add UTM generator page shell"
```

### Task 3: Approved visual system and responsive layout

**Files:**

- Create: `assets/css/utm.css`
- Modify: `utm/index.html`

**Interfaces:**

- Consumes the DOM hooks established in Task 2 and global tokens from `assets/css/main.css`.
- Produces responsive visual behavior for the controller in Task 4 without changing DOM semantics.

- [ ] **Step 1: Create `assets/css/utm.css` from the approved dark design**

Style the intro, explainer, form, red required asterisks, chips, result container, neutral light generated URL, secondary copy button, amber `Переслать` button with trailing paper-plane icon, template tiles, and case card. Use CSS classes only; do not add inline styles.

- [ ] **Step 2: Implement the mobile and desktop layouts**

At small widths, use one field column and comfortably touchable chips/buttons. At desktop widths, use the exact two-column order: source/medium, campaign/content, term beneath campaign. Keep the standard header and case card readable in both modes.

- [ ] **Step 3: Manually verify visual acceptance criteria at 375px and 1280px widths**

Check the page against the approved mobile and desktop mockups: no horizontal overflow; full form visible before result; explainer precedes the form; dynamic templates precede the case; generated URL is not yellow; share action is amber and labeled `Переслать` with a trailing plane icon.

- [ ] **Step 4: Commit the visual system**

```bash
git add assets/css/utm.css utm/index.html
git commit -m "feat: style UTM generator"
```

### Task 4: Page controller, copy/share, and dynamic-template interactions

**Files:**

- Create: `assets/js/utm.js`
- Modify: `utm/index.html`
- Modify: `assets/js/utm-utils.mjs`
- Modify: `tests/utm-utils.test.mjs`

**Interfaces:**

- Consumes Task 1's named exports and Task 2's DOM IDs.
- Produces live result rendering, inline validation/status text, copy/share behavior, accessible tab selection, and copyable macro tiles.

- [ ] **Step 1: Write failing tests for controller-owned pure helpers added to `assets/js/utm-utils.mjs`**

Add tests for `validateRequired(values: UTMValues): Record<string, string>` and `templateExample(platform: 'google' | 'yandex' | 'vk'): string`, including the missing-required-field and unknown-platform cases.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/utm-utils.test.mjs`

Expected: FAIL because the newly named exports do not exist.

- [ ] **Step 3: Implement the helpers and controller**

Import utilities in `assets/js/utm.js`. Listen to every form input and preset choice; preserve user input on errors; show the result only when all required fields validate. Use `navigator.clipboard.writeText` for copy, `navigator.share({ title, text, url })` for `Переслать`, and the copy fallback on unavailable/rejected share. Update the UI in Russian without implying a direct Notes save.

- [ ] **Step 4: Implement dynamic template tabs and macro copy controls**

Make each tab a real button with `aria-selected`. Render the selected platform's macro tiles from `DYNAMIC_TEMPLATES`; a tile copies only its macro, and the ready fragment has its own copy action. Before adding the VK tab's macro list, verify it against official VK Ads documentation and add the source URL in a code comment or visible reference, as appropriate.

- [ ] **Step 5: Run utility tests and manually verify browser behavior**

Run: `node --test tests/utm-utils.test.mjs`

Expected: PASS.

Manual checks: invalid URL, empty required input, Cyrillic input, hyphen input, dynamic macro, URL with existing query/hash, copy success/failure, supported and unsupported/rejected share, all three template tabs, macro copy, keyboard tab selection, and field preservation after every error.

- [ ] **Step 6: Commit functional interactions**

```bash
git add assets/js/utm.js assets/js/utm-utils.mjs tests/utm-utils.test.mjs utm/index.html
git commit -m "feat: implement UTM generator interactions"
```

### Task 5: Final repository verification

**Files:**

- Modify only if verification reveals a scoped defect: files from Tasks 1-4.

**Interfaces:**

- Consumes the complete page and its test suite.
- Produces an evidence-backed final handoff.

- [ ] **Step 1: Run automated verification**

Run: `node --test tests/utm-utils.test.mjs`

Expected: PASS.

- [ ] **Step 2: Run static checks**

Run: `git diff --check` and validate that `sitemap.xml` remains well-formed using the locally available XML parser.

Expected: no whitespace errors and valid XML.

- [ ] **Step 3: Run browser checks at mobile and desktop sizes**

Verify navigation, form generation, copy/share fallback, template tabs, macro copying, links to the UAE case, all internal links from the page, one H1, responsive layout, and required metadata.

- [ ] **Step 4: Commit only scoped verification fixes, if any**

```bash
git add <scoped files>
git commit -m "fix: verify UTM generator"
```

## Self-review

- Spec coverage: Tasks 1-4 cover every functional, visual, SEO, navigation, and template requirement; Task 5 covers repository and browser verification.
- Step scan: every step names a concrete file, interface, command, or manual behavior.
- Type consistency: Task 1 exports are the only utility interface; Task 4 imports those exact names.
- Review focus: all five listed risks are assigned to a test or manual check in the owning task.
- Proportion: the plan defines boundaries and acceptance checks without duplicating implementation bodies.
