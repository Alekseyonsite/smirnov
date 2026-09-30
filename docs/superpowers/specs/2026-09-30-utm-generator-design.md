# Design: UTM generator

Date: 2026-09-30

## Goal

Create a mobile-first UTM generator at `https://smirnovads.com/utm/`.

The page is a useful tool promoted from Instagram Reels. Its primary job is to let a visitor create a clean UTM URL, copy it or send it to themselves without registration. Its secondary job is to introduce the visitor to Alexey Smirnov's expertise through the existing UAE real-estate case.

## Experience and visual direction

- Use the site's existing dark theme, typography, standard desktop navigation, and mobile burger menu.
- Do not make the page a standalone app or hide the normal site navigation.
- The mobile page is the primary experience; desktop uses the same content with a two-column parameter grid.
- H1: `Соберите ссылку с UTM-меткой без путаницы`.
- Intro explains that users may pick a preset or enter their own values and that the tool normalizes values.
- Required-field asterisks are red.

## Page structure

1. Standard site header with a new `UTM-генератор` navigation item.
2. Intro: H1, short explanation, and a compact normalization rule.
3. A visible UTM explainer immediately before the form:
   - `Источник` — where the visitor came from;
   - `Канал` — traffic type;
   - `Кампания` — what is being promoted.
4. UTM form.
5. Generated URL and two actions.
6. Dynamic templates for Google Ads, Yandex Direct, and VK Ads.
7. Existing UAE real-estate case card linking to `/cases/uae-real-estate/`.

## Form

### Field order on desktop

1. Full width: target page URL.
2. Left: `Источник` / `utm_source`; right: `Канал` / `utm_medium`.
3. Left: `Название кампании` / `utm_campaign`; right: `Содержание / креатив` / `utm_content`.
4. Left: `Ключевое слово` / `utm_term`.

On mobile, fields appear in the same sequence in one column.

### Required fields

- Target page URL;
- `utm_source`;
- `utm_medium`;
- `utm_campaign`.

`utm_content` and `utm_term` are optional.

### Presets and examples

All presets are editable; they never restrict manual input.

- `utm_source`: Telegram, Instagram, Яндекс.Директ, Google Ads, VK Реклама, and a custom value. The Yandex Direct preset writes `yandex_direct`.
- `utm_medium`: `cpc`, `cpm`, `cpa`, `affiliate`; retain the broader helpful options `social`, `paid_social`, `email`, `display`, `video`, `referral`, and `messenger` if they fit the compact preset UI.
- `utm_content` examples: `article_1`, `banner_blue`, `reels_01`.
- `utm_term` can take a manually entered keyword or an ad-platform macro such as `{keyword}`.

### Normalization

For manually entered parameter values:

- transliterate Cyrillic to Latin;
- convert to lower case;
- replace spaces with `_`;
- retain existing hyphens;
- URL-encode the generated values.

Dynamic ad-platform macros enclosed in braces, such as `{keyword}`, must not be transliterated, lowercased, or otherwise changed.

When the visitor enters a URL that already contains query parameters or old UTM tags, use only its base page address (origin and path) for the result. Generate a fresh query string from the form values.

## Generated URL and actions

The URL updates as the form changes. It is displayed only after the required values are valid.

- Secondary button: `Скопировать ссылку`; copies the result and briefly confirms success.
- Primary amber button: `Переслать` with a trailing paper-plane share icon. It opens the native share sheet where supported, so a visitor can send the result to Notes, Telegram, email, or another application. If the share API is unavailable, fall back to copying the URL and show an explanatory success message.
- Render the generated URL itself in the site's normal light text color, not accent yellow. The result container may retain a restrained amber outline or label.

No account, history, database, analytics event storage, or cross-device state is required.

## Dynamic templates

Place this section after the generated URL. It must explain both purpose and interaction:

> Динамические параметры автоматически подставляют данные рекламы. Нажмите на макрос, чтобы скопировать его и вставить в нужное поле.

The visual contains three tabs: Google Ads, Яндекс.Директ, VK Реклама. Each tab shows individually copyable macro tiles, a short explanation, and a ready-to-copy UTM fragment.

### Google Ads

Include at least these ValueTrack parameters:

- `{campaignid}` — campaign ID;
- `{adgroupid}` — ad group ID;
- `{creative}` — ad ID;
- `{keyword}` — keyword;
- `{placement}` — placement;
- `{device}` — device;
- `{network}` — network;
- `{matchtype}` — keyword match type;
- `{targetid}` — target ID;
- `{loc_physical_ms}` — physical-location ID.

Example fragment:

`utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}`

### Yandex Direct

Include the relevant documented parameters:

- `{campaign_id}`, `{campaign_name_lat}`, `{campaign_type}`;
- `{ad_id}`, `{banner_id}`, `{creative_id}`, `{gbid}`;
- `{keyword}`, `{phrase_id}`, `{retargeting_id}`;
- `{source_type}`, `{device_type}`;
- `{region_id}`, `{region_name}`, `{yclid}`.

Example fragment:

`utm_source=yandex_direct&utm_medium=cpc&utm_campaign={campaign_id}&utm_content={ad_id}&utm_term={keyword}`

### VK Ads

Show a dedicated tab with the platform's supported dynamic parameters and an example UTM fragment. Before implementation, verify the exact macro syntax and current supported set against VK Ads' official documentation; do not infer it from third-party examples.

## Case card

Use a wide visual card after the dynamic-template section.

- Label: `Кейс из практики`.
- Title: `Продажа недвижимости в ОАЭ`.
- Reuse only verified facts and language from `/cases/uae-real-estate/`; do not introduce fabricated metrics.
- Link label: `Читать кейс →`.

## Technical approach

- Add `/utm/index.html`.
- Add page-specific rules to a new stylesheet, `assets/css/utm.css`; reuse global tokens and navigation rather than duplicating base styles.
- Add `assets/js/utm.js` for URL parsing, normalization, generation, copy/share actions, dynamic-template copy interactions, and client-side validation.
- Update `assets/js/nav.js` only as needed to add the navigation item consistently across the site.
- Reuse the site's ordinary header/footer markup and existing mobile navigation behavior.
- Do not add third-party libraries or a backend.

## SEO and metadata

The new page must include:

- unique title and meta description;
- canonical `https://smirnovads.com/utm/`;
- `og:type`, `og:url`, `og:title`, `og:description`, and `og:image`;
- `twitter:card` and matching social image;
- exactly one H1;
- a new entry in `sitemap.xml` with the implementation date as `lastmod`.

`robots.txt` already points to the sitemap; verify it remains correct.

## Validation and error handling

- Validate URL with the browser URL parser; show a clear Russian error beside the target URL field when invalid.
- Do not generate/copy/share a URL until required fields are valid.
- Handle clipboard and native-share failures without losing entered values.
- Test source/medium presets, custom values, Cyrillic normalization, hyphen retention, optional fields, existing-query cleanup, `{keyword}` preservation, mobile navigation, desktop navigation, and links to the case.

## Acceptance criteria

- A mobile visitor can create and copy a valid UTM URL in one short pass without registration.
- The mobile layout matches the approved dark design, including red asterisks and the amber `Переслать` action with a paper-plane share icon.
- The desktop layout maintains the approved two-column arrangement.
- Dynamic templates are useful, copyable, documented, and accurate for their platform.
- The page integrates with the existing site navigation and sends interested visitors to the existing UAE real-estate case.
- The page passes the repository SEO checklist and does not break internal links or current navigation.
