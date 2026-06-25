# Design: article about scaling PMax campaigns on one signal

Date: 2026-06-25

## Goal

Prepare a long-form blog article for smirnovads.com about a real Google Ads / Performance Max scaling hypothesis from recent work.

The article should explain how duplicating several PMax campaigns on the same CRM audience signal worked as a scaling and testing method at first, then reached a limit and started to degrade results.

Target length: about 6000 Russian characters.

## Confidentiality

The article must be NDA-safe.

Do not disclose:

- project name;
- client name;
- exact niche if it can identify the project;
- absolute budgets, CPL, CPQL, leads, QL, revenue, or campaign names;
- screenshots or raw exports from the project.

Allowed:

- percentages and relative dynamics;
- anonymous wording such as "leadgen project" or "education/service project";
- general mechanics: PMax, CRM signal, qualified leads, offline conversions, quizzes, landing pages, creatives;
- approximate operational guardrails if they are framed as one case, not a universal rule.

## Core Thesis

The main thesis is not "do not duplicate PMax campaigns."

The thesis is:

Duplicating PMax campaigns on the same strong CRM signal can be a working way to scale and simultaneously test landing pages or creatives without immediately hurting month-over-month or week-over-week performance. But this approach has a limit. In this case, the practical ceiling looked like about 5 active PMax campaigns on one signal, or roughly 130,000 ad impressions per day around that signal. After that, overlap and repeated reach became more visible, and performance started to degrade.

Important nuance:

The same volume could theoretically be concentrated in one campaign, which may be cleaner for Google Ads learning. But it increases operational risk: in some niches individual campaigns may periodically get limited by policy, assets, landing page checks, or other review issues. Several controlled campaign copies provide diversification, but too many create overlap.

## Evidence From Audit

Use the following findings from the Codex audit:

- April: the hypothesis was launched and validated. Campaign duplication on one CRM signal increased lead volume and started moving CPL/CPQL toward KPI, though the metrics were still not fully at target.
- May: the approach looked stronger. Additional copies and related tests helped grow volume and improve CPL/CPQL in relative terms.
- June: the same mechanic started to work against the account. More PMax campaigns used the same signal, similar quizzes/landing pages and overlapping creatives. Account-level frequency increased and post-click quality degraded.
- The issue was not simply CTR. In one weak June period, CTR improved while CPL and CPQL worsened. The problem sat after the click: click-to-lead, lead-to-QL, signal quality, overlap, and tracking stability.
- Account-level frequency suggested the bigger issue was many PMax campaigns overlapping, not one single campaign burning out.
- Campaign-level frequency was not enough by itself to decide. The rule should be: frequency plus weak CPQL or no QL means reduce, pause, change signal, or change assets.
- Tracking/offline-conversion issues and changes to audience signals in June also contributed, so the article must avoid saying frequency was the only cause.

## Article Structure

1. Intro: why PMax scaling often tempts advertisers to clone a working campaign.
2. Context: anonymous leadgen account, CRM signal, quizzes/landing pages, KPI by CPL and CPQL.
3. Initial hypothesis: if one campaign and one CRM signal work, several controlled copies can help scale volume and test landing pages/creatives.
4. April: first validation. More lead volume, first path toward KPI, but not yet ideal CPQL.
5. May: the method worked better. Volume grew and relative CPL/CPQL improved.
6. June: the limit appeared. Same signal, more campaign copies, similar assets, rising account-level frequency, worse post-click quality.
7. Audit: what actually broke. Use a simple heading, not a complex technical one. Recommended heading: "Что показал аудит".
8. Practical limit in this case: around 5 PMax campaigns on one signal or about 130,000 ad impressions per day. Present as a case observation, not a universal benchmark.
9. Why not just use one campaign: learning may be cleaner, but risk diversification matters when campaigns can be limited by policy or moderation.
10. Final takeaway: cloning PMax can be a valid scaling tool, but only with slots, guardrails, and signal diversification.
11. Checklist: when to stop adding copies.

## Style

Match existing articles on smirnovads.com:

- first-person expert analysis;
- short paragraphs;
- practical, not academic;
- no hype;
- no generic textbook explanation of PMax;
- concrete operational lessons;
- honest caveats where causality is not proven.

Use the site pattern:

- breadcrumb;
- article label;
- H1;
- author/date/read time;
- short opening;
- "Краткий итог" box if appropriate;
- table of contents;
- H2 sections;
- final CTA;
- author block;
- related articles.

## SEO And 2026 Content Requirements

Use people-first structure:

- original audit and firsthand experience;
- clear H1/title;
- unique meta description;
- BlogPosting JSON-LD when implemented;
- canonical URL;
- OG and Twitter metadata;
- one H1 only;
- readable sections and a concise checklist.

Do not write to a fixed word count as an SEO trick. The 6000-character target is an editorial constraint from the user.

## Proposed Title Options

Recommended:

"Как масштабировать Performance Max на одном сигнале и не перегреть аудиторию"

Alternatives:

- "Что произошло, когда мы запустили несколько PMax на один CRM-сигнал"
- "Сколько PMax-кампаний можно держать на одном сигнале: выводы из аудита"

## Risks

- Overclaiming causality. Mitigation: write "в этом кейсе", "похоже", "усиливало проблему", not "доказало навсегда".
- Revealing NDA data. Mitigation: use percentages and approximate thresholds only.
- Making the method sound bad. Mitigation: emphasize that it worked in April-May and failed only after a limit.
- Making the limit universal. Mitigation: explicitly say the 5-campaign / 130k-impressions limit is a project-specific guardrail.

## Acceptance Criteria

- Article draft is about 6000 Russian characters.
- It clearly shows the beginning, middle, and current state of the hypothesis.
- It includes the limit after which degradation began.
- It explains why several copies can be more practical than one huge campaign, despite cleaner learning in one campaign.
- No NDA-sensitive absolute numbers or project identifiers are disclosed.
- Style matches the existing blog.
