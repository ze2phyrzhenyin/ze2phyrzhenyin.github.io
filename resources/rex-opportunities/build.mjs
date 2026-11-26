// Builds the REX opportunity guide in Chinese, English and French from one data set.
//   node resources/rex-opportunities/build.mjs
// Inputs:  public/guides/rex-opportunities/events.json + prompt.txt (Chinese, the source),
//          translations.json, prompt.en.txt, prompt.fr.txt and locales.mjs in this folder.
// Outputs: {zh,en,fr}/index.html, the root redirect, report.md / report.en.md / report.fr.md,
//          prompt.en.txt / prompt.fr.txt and filter-aliases.json under public/guides/rex-opportunities/.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { locales, issue } from './locales.mjs';

const here = new URL('./', import.meta.url);
const root = new URL('../../public/guides/rex-opportunities/', import.meta.url);
const site = 'https://zhaoyang.fr', base = '/guides/rex-opportunities/';
export const languages = ['zh', 'en', 'fr'];
// Han characters, kana, CJK punctuation and full-width forms: text that still needs translating.
export const cjk = /[⺀-〿぀-ヿ㈀-㏿㐀-鿿豈-﫿︰-﹏＀-￯]/u;

const NBSP = ' ', NNBSP = ' ';
// French sources are written with ordinary spaces; the no-break spaces are set here.
export const frenchSpacing = text => text
  .replace(/ ([;?!])/g, `${NNBSP}$1`)
  .replace(/ :(?=\s|$)/g, `${NBSP}:`)
  .replace(/« /g, `«${NBSP}`).replace(/ »/g, `${NBSP}»`)
  .replace(/(\d) (?=\d{3}(?!\d))/g, `$1${NNBSP}`)
  .replace(/(\d) (?=(?:€|%))/g, `$1${NNBSP}`)
  .replace(/(\d) (?=(?:m²|Mo\b))/g, `$1${NBSP}`);
function spaced(value) {
  if (typeof value === 'string') return frenchSpacing(value);
  if (typeof value === 'function') return (...args) => spaced(value(...args));
  if (Array.isArray(value)) return value.map(spaced);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, spaced(item)]));
  return value;
}

const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const sha = text => createHash('sha256').update(text).digest('hex');
const chevron = '<svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20"><path d="m6 8 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const bookmark = '<svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18"><path d="M5 3h10v14l-5-3-5 3Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
const downloadIcon = '<svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20"><path d="M10 3v10m0 0 4-4m-4 4-4-4M4 16h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const link = (id, label) => `<a href="#${id}">${label}</a>`;
const fieldOrder = ['value', 'who', 'entry', 'fee', 'eligibility', 'action', 'contacts', 'demo', 'question', 'pilot', 'checked'];
const lowerFirst = text => /^\p{Lu}(?!\p{Lu})/u.test(text) ? text[0].toLocaleLowerCase() + text.slice(1) : text;

export async function render() {
  const read = (path, from = root) => readFile(new URL(path, from), 'utf8');
  const data = JSON.parse(await read('events.json'));
  const memory = JSON.parse(await read('translations.json', here));
  const prompts = { zh: await read('prompt.txt'), en: await read('prompt.en.txt', here), fr: frenchSpacing(await read('prompt.fr.txt', here)) };
  const assets = { style: sha(await read('style.css')).slice(0, 10), app: sha(await read('app.js')).slice(0, 10) };
  const problems = [];

  if (memory.sources['prompt.txt'] !== sha(prompts.zh)) {
    problems.push(`prompt.txt changed since prompt.en.txt and prompt.fr.txt were translated. Update both, then set sources["prompt.txt"] in translations.json to ${sha(prompts.zh)}`);
  }
  const strings = new Map(memory.strings.map(entry => [entry.zh, entry]));
  const used = new Set();
  const terms = Object.fromEntries(Object.entries(memory.terms).map(([group, rows]) => [group, new Map(rows.map(row => [row.zh, row]))]));
  for (const [group, rows] of Object.entries(memory.terms)) {
    if (new Set(rows.map(row => row.key)).size !== rows.length) problems.push(`translations.json terms.${group}: duplicate key`);
  }
  // A string without Chinese (official names, URLs, dates) is the same in every language.
  function translate(lang, text, where) {
    if (lang === 'zh' || !cjk.test(text)) return text;
    const hit = strings.get(text);
    used.add(text);
    if (!hit?.[lang]) { problems.push(`${where}: no ${lang} translation in translations.json strings for “${text}”`); return text; }
    return lang === 'fr' ? frenchSpacing(hit.fr) : hit.en;
  }
  function term(group, zh, where) {
    const hit = terms[group].get(zh);
    if (!hit) { problems.push(`${where}: “${zh}” is missing from translations.json terms.${group}`); return { key: zh, zh, en: zh, fr: zh }; }
    return hit;
  }

  const baseDate = data.revisedDate && data.revisedDate !== data.reportDate ? data.revisedDate : data.reportDate;
  const isRevised = baseDate !== data.reportDate;
  const dayDiff = date => Math.round((Date.parse(date) - Date.parse(baseDate)) / 86400000);
  const records = data.events.map(event => ({
    event,
    date: /^\d{4}-\d{2}-\d{2}$/.test(event.date ?? '') ? event.date : '',
    country: term('country', event.country, `${event.id}.country`),
    city: term('city', event.city, `${event.id}.city`),
    sectors: event.sectors.map(sector => term('sector', sector, `${event.id}.sectors`)),
    goals: event.goals.map(goal => term('goal', goal, `${event.id}.goals`)),
    update: term('update', event.update, `${event.id}.update`),
  }));
  const unique = (rows, key = row => row.key) => [...new Map(rows.map(row => [key(row), row])).values()];
  const months = [...new Set(records.map(record => record.date.slice(0, 7)).filter(Boolean))];

  function view(lang) {
    const locale = locales[lang];
    const t = lang === 'fr' ? spaced(locale.ui) : locale.ui;
    const own = text => lang === 'fr' ? spaced(text) : text;
    const stamp = iso => ({ iso, monthDay: locale.date.monthDay(iso), full: locale.date.full(iso), compact: locale.date.compact(iso) });
    const when = (event) => {
      if (lang === 'zh') return event.when;
      if (cjk.test(event.when)) return translate(lang, event.when, `${event.id}.when`);
      const text = locale.date.when(event.when);
      if (!text) { problems.push(`${event.id}.when: “${event.when}” does not follow YYYY/MM/DD[–[MM/]DD][ · HH:MM[–HH:MM]]; add it to translations.json strings`); return event.when; }
      return text;
    };
    const events = records.map(record => {
      const { event } = record, at = field => `${event.id}.${field}`;
      const text = Object.fromEntries(fieldOrder.filter(field => event[field]).map(field => [field, translate(lang, event[field], at(field))]));
      const others = languages.filter(other => other !== lang && other !== 'zh');
      const labels = other => [record.country[other], record.city[other], ...record.sectors.map(row => row[other]), ...record.goals.map(row => row[other]),
        strings.get(event.name)?.[other] ?? '', event.venue && cjk.test(event.venue) ? strings.get(event.venue)?.[other] ?? '' : ''];
      return {
        ...record, text,
        name: translate(lang, event.name, at('name')),
        venue: event.venue ? translate(lang, event.venue, at('venue')) : '',
        status: translate(lang, event.status, at('status')),
        when: when(event),
        sources: event.sources.map(([label, url], index) => [translate(lang, label, at(`sources.${index}`)), url]),
        // Place, sector and goal names in the other Latin-script language, so a search survives a language switch.
        keywords: [...new Set(others.flatMap(labels).filter(Boolean))].join(' '),
      };
    });
    const notices = data.notices.map((notice, index) => ({
      ...notice,
      kind: term('kind', notice.kind, `notices.${index}.kind`)[lang],
      label: translate(lang, notice.label, `notices.${index}.label`),
      note: translate(lang, notice.note, `notices.${index}.note`),
    }));
    return {
      lang, locale, t, events, notices,
      report: stamp(data.reportDate), revised: isRevised ? stamp(data.revisedDate) : null, base: stamp(baseDate), next: stamp(data.nextReport),
      period: data.period.map(stamp), scope: translate(lang, data.scope, 'scope'), prompt: prompts[lang],
      actions: issue.actions.map(item => ({ id: item.id, text: own(item[lang]) })),
      calendar: issue.calendar.map(item => ({ ...item, place: own(item[lang]) })),
      sourceNotes: own(issue.sourceNotes[lang]),
      plans: issue.plans.map(item => own(item[lang])),
      conflicts: issue.conflicts.map(item => ({ ended: item.ended, text: own(item[lang]) })),
      materials: issue.materials.map(item => ({ events: item.events, text: own(item[lang]) })),
      archive: issue.archive.map(item => ({ ...item, text: own(item[lang]) })),
      reportPath: lang === 'zh' ? 'report.md' : `report.${lang}.md`,
      promptPath: lang === 'zh' ? 'prompt.txt' : `prompt.${lang}.txt`,
    };
  }

  function page(v) {
    const { lang, locale, t } = v;
    const url = `${site}${base}${lang}/`;
    const options = rows => rows.map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join('');
    const termOptions = rows => options(unique(rows).map(row => [row.key, row[lang]]));
    const external = ([label, href]) => `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}<span class="sr-only">${t.newWindow}</span></a>`;
    const eventHTML = e => {
      const { event, date } = e, grade = event.priority;
      return `<details class="event" id="${esc(event.id)}" data-priority="${grade}" data-city="${esc(e.city.key)}" data-country="${esc(e.country.key)}" data-sectors="${esc(e.sectors.map(row => row.key).join('|'))}" data-goals="${esc(e.goals.map(row => row.key).join('|'))}" data-date="${date}" data-deadline="${esc(event.deadline)}" data-update="${esc(e.update.key)}" data-search="${esc(e.keywords)}">
<summary><span class="event-date">${date ? `<span>${locale.date.eventMonth(+date.slice(5, 7))}</span><strong>${date.slice(8)}</strong><small>${date.slice(0, 4)}</small>` : `<span>${t.dateUnknownLabel}</span><strong>${t.dateUnknown}</strong>`}</span>
<span class="event-description"><span class="event-title">${esc(e.name)}<span class="saved-mark" hidden aria-label="${t.savedMark}">${bookmark}</span></span><span class="event-meta">${esc(e.country[lang])} · ${esc(e.city[lang])}${e.venue ? ` · ${esc(e.venue)}` : ''}</span><span class="event-context">${esc(e.sectors.map(row => row[lang]).join(' / '))}<span class="update-label">${e.update.key === 'kept' ? '' : esc(e.update[lang])}</span></span></span>
<span class="event-availability"><span>${esc(e.status)}</span><small>${esc(e.when)}</small></span><span class="priority priority-${grade.split('/')[0]}" title="${t.priorities[grade]}">${grade}<span class="sr-only"> ${t.priorities[grade]}</span></span><span class="disclosure">${chevron}</span></summary>
<div class="event-body"><p class="event-value">${esc(e.text.value)}</p><div class="event-actions">${external(e.sources[0])}<button type="button" class="save-event" data-id="${esc(event.id)}" aria-pressed="false" hidden>${bookmark}<span>${t.saveEvent}</span></button><a class="permalink" href="#${event.id}">${t.permalink}</a></div><dl>${fieldOrder.filter(field => field !== 'value' && e.text[field]).map(field => `<div><dt>${t.labels[field]}</dt><dd>${esc(e.text[field])}</dd></div>`).join('')}</dl><div class="sources">${e.sources.slice(1).map(external).join('')}</div></div></details>`;
    };
    const noticeHTML = n => `<li data-days="${dayDiff(n.date)}"><time datetime="${n.date}"><strong>${locale.date.notice(n.date)}</strong>${n.time ? `<small>${n.time}</small>` : ''}</time><div><a href="#${n.event}">${esc(n.label)}</a><span class="notice-kind">${esc(n.kind)}</span><p>${esc(n.note)}</p></div></li>`;
    const alternates = languages.map(other => `<link rel="alternate" hreflang="${locales[other].hreflang}" href="${site}${base}${other}/">`).join('') + `<link rel="alternate" hreflang="x-default" href="${site}${base}en/">`;
    const switcher = languages.map(other => `<a href="../${other}/" lang="${other}" hreflang="${locales[other].hreflang}" data-language="${other}"${other === lang ? ' aria-current="page"' : ''}>${locales[other].languageName}</a>`).join('');
    const script = JSON.stringify({
      expand: t.expand, collapse: t.collapse, resultCountOf: t.resultCountOf, filterSummary: t.filterSummary,
      views: { new: t.viewNew, priority: t.viewPriority, saved: t.viewSaved }, quoteOpen: t.quoteOpen, quoteClose: t.quoteClose,
      saveEvent: t.saveEvent, savedEvent: t.savedEvent, toastSaved: t.toastSaved, toastRemoved: t.toastRemoved, toastNoStorage: t.toastNoStorage,
      themeDark: t.themeDark, themeLight: t.themeLight, themeToDark: t.themeToDark, themeToLight: t.themeToLight,
      promptSelected: t.promptSelected, promptCopied: t.promptCopied, toastPromptCopied: t.toastPromptCopied, promptCopyBlocked: t.promptCopyBlocked,
    }).replaceAll('<', '\\u003c');
    const navItems = Object.entries(t.nav);
    const archiveRow = row => {
      const [label, action] = row.text;
      return row.current
        ? `<div class="archive-row"><time>${locale.date.compact(row.date)}</time><span>${label}</span><a href="../${v.reportPath}" download>${action}</a></div>`
        : `<div class="archive-row"><time>${locale.date.compact(row.date)}</time><span>${label}</span><a href="../${row.path}" download${lang === 'zh' ? '' : ' hreflang="zh-Hans"'}>${action}${t.chineseOnly}</a></div>`;
    };
    return `<!doctype html>
<html lang="${locale.htmlLang}" data-guide="rex-opportunities" data-locale="${lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="/guides/favicon.svg" type="image/svg+xml"><link rel="icon" href="/guides/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/guides/apple-touch-icon.png"><title>${esc(t.title)}</title>
<meta name="description" content="${esc(t.description(v.report, v.revised))}">
<meta name="theme-color" content="#f5f7f8"><link rel="canonical" href="${url}">${alternates}
<meta property="og:title" content="${esc(t.ogTitle)}"><meta property="og:description" content="${esc(t.ogDescription(v.report, v.revised, v.period[1]))}"><meta property="og:type" content="article"><meta property="og:url" content="${url}">
<script src="/guides/theme.js?v=20260924c"></script><link rel="stylesheet" href="../style.css?v=${assets.style}"><script defer src="../app.js?v=${assets.app}"></script></head>
<body><a class="skip" href="#main">${t.skip}</a>
<div class="topbar"><a class="back-link" href="/guides/${lang}/">${chevron} <span>${t.back}</span></a><a class="top-brand" href="#main">REX <span>${esc(t.brand)}</span></a><div class="top-tools"><a class="report-download" href="../${v.reportPath}" download="${esc(t.reportFile(v.report, v.revised))}">${downloadIcon}<span>${t.downloadReport}</span></a><div class="languages" aria-label="${t.languages}">${switcher}</div><button id="theme-toggle" type="button" aria-label="${t.themeToggle}" hidden>${t.themeDark}</button></div></div>
<div class="layout"><aside class="sidebar"><nav aria-label="${t.toc}">${navItems.map(([id, name], index) => `<a href="#${id}"${index === 0 ? ' aria-current="location"' : ''}>${name}</a>`).join('')}</nav><div class="sidebar-note"><span>${t.schedulePlan}</span><strong>${t.scheduleSlot}</strong><span>${t.scheduleZone}</span><p>${t.nextIssue(v.next)}</p></div></aside>
<main id="main"><header class="masthead"><div><h1>${esc(t.heading)}</h1><p class="report-date">${v.revised ? `<time datetime="${v.report.iso}">${t.reportOf(v.report)}</time><time datetime="${v.revised.iso}">${t.revisedOn(v.revised)}</time>` : `<time datetime="${v.report.iso}">${v.report.full}</time><span>${esc(data.timezone)}</span>`}</p></div><div class="period"><span>${t.periodLabel}</span><strong>${v.period[0].compact} <span>${t.periodTo}</span> ${v.period[1].compact}</strong><span>${t.periodScope}</span></div></header>
<nav class="mobile-nav" aria-label="${t.shortcuts}">${Object.entries(t.mobileNav).map(([id, name]) => `<a href="#${id}">${name}</a>`).join('')}</nav>
<section id="priorities" class="overview"><div class="section-heading"><h2>${t.prioritiesHeading}</h2><span>${t.asOf(v.base)}</span></div><div class="overview-grid"><div class="action-list">${v.actions.map(({ id, text: [date, title, text] }) => `<article><span class="action-date">${date}</span><h3>${link(id, esc(title))}</h3><p>${esc(text)}</p></article>`).join('')}</div><div class="focus-panel"><h3>${t.calendarHeading}</h3><ul>${v.calendar.map(item => `<li><time>${locale.date.month(item.month)}</time><span>${item.links.map(([id, name]) => link(id, name)).join(' / ')}<small>${esc(item.place)}</small></span></li>`).join('')}</ul><p>${t.talks(...issue.talks.map(([id, name]) => link(id, name)))}</p></div></div>
<details class="source-note"><summary>${t.sourceNoteSummary} ${chevron}</summary>${v.sourceNotes.map(text => `<p>${esc(text)}</p>`).join('')}</details></section>
<section id="events"><div class="section-heading"><h2>${t.eventsHeading}</h2><span>${t.eventsCount(v.events.length)}</span></div><p class="legend">${['A', 'B', 'C'].map(grade => `<span><b>${grade}</b> ${t.priorities[grade]}</span>`).join('')}</p>
<form id="filters" role="search" aria-label="${t.filterForm}" hidden><div class="quick-filters" aria-label="${t.quickFilters}"><button type="button" data-view="all" aria-pressed="true">${t.viewAll}</button><button type="button" data-view="new" aria-pressed="false">${t.viewNew}</button><button type="button" data-view="priority" aria-pressed="false">${t.viewPriority}</button><button type="button" data-view="saved" aria-pressed="false">${t.viewSaved} <span id="saved-count">0</span></button></div>
<div class="filter-primary"><label class="search-label">${t.search}<input id="search" type="search" placeholder="${esc(t.searchPlaceholder)}" autocomplete="off"></label><label>${t.country}<select id="country"><option value="">${t.allCountries}</option>${termOptions(v.events.map(e => e.country))}</select></label><label>${t.sector}<select id="sector"><option value="">${t.allSectors}</option>${termOptions(v.events.flatMap(e => e.sectors))}</select></label><button id="more-filters" class="filter-toggle" type="button" aria-expanded="false" aria-controls="filter-extra">${t.moreFilters} ${chevron}</button></div>
<div class="filter-extra" id="filter-extra" hidden><label>${t.goal}<select id="goal"><option value="">${t.allGoals}</option>${termOptions(memory.terms.goal)}</select></label><label>${t.city}<select id="city"><option value="">${t.allCities}</option>${termOptions(v.events.map(e => e.city))}</select></label><label>${t.priority}<select id="priority"><option value="">${t.allPriorities}</option>${options(['A', 'B', 'C'].map(grade => [grade, grade]))}</select></label><label>${t.month}<select id="month"><option value="">${t.allMonths}</option>${options(months.map(month => [month, locale.date.monthOption(month)]))}</select></label></div>
<div class="filter-footer"><span id="filter-summary">${t.filterSummary}</span><button type="reset">${t.clearFilters}</button></div></form>
<div class="list-tools"><p id="result-count" role="status" aria-live="polite">${t.resultCount.replace('{count}', v.events.length)}</p><div><label class="sort-label" hidden>${t.sort}<select id="sort"><option value="date">${t.sortDate}</option><option value="priority">${t.sortPriority}</option><option value="deadline">${t.sortDeadline}</option></select></label><button id="expand" type="button" hidden>${t.expand}</button></div></div>
<div id="event-list">${v.events.map(eventHTML).join('\n')}</div><div id="empty" class="empty" hidden><h3>${t.emptyHeading}</h3><p>${t.emptyText}</p><button id="empty-reset" type="button">${t.clearFilters}</button></div><p class="list-footnote">${t.listFootnote}</p></section>
<section id="deadlines"><div class="section-heading"><h2>${t.deadlinesHeading}</h2><span>${t.deadlinesFrom(v.base, v.revised)}</span></div><div class="deadline-tabs" hidden aria-label="${t.deadlineRange}"><button type="button" data-window="7" aria-pressed="true">${t.within7}</button><button type="button" data-window="14" aria-pressed="false">${t.within14}</button><button type="button" data-window="30" aria-pressed="false">${t.within30}</button><button type="button" data-window="all" aria-pressed="false">${t.allReminders}</button></div><ol class="deadline-list">${v.notices.map(noticeHTML).join('')}</ol><p class="minor">${t.deadlinesNote}</p></section>
<section id="schedule"><div class="section-heading"><h2>${t.scheduleHeading}</h2></div><div class="plan-list">${v.plans.map(([time, title, text]) => `<article><span>${time}</span><div><h3>${esc(title)}</h3><p>${esc(text)}</p></div></article>`).join('')}</div><h3 class="conflict-heading">${t.conflictsHeading}</h3><div class="conflicts">${v.conflicts.map(({ ended, text: [date, title, text] }) => `<details><summary><time>${date}${ended ? ` · ${t.ended}` : ''}</time><span>${esc(title)}</span>${chevron}</summary><p>${esc(text)}</p></details>`).join('')}</div></section>
<section id="materials"><div class="section-heading"><h2>${t.materialsHeading}</h2></div><p>${t.materialsIntro}</p><div class="materials">${v.materials.map(({ events, text: [title, demo, question, pilot] }) => `<article><h3>${esc(title)}</h3><p class="minor">${events}</p><dl><div><dt>${t.materialDemo}</dt><dd>${esc(demo)}</dd></div><div><dt>${t.materialQuestion}</dt><dd>${esc(question)}</dd></div><div><dt>${t.materialPilot}</dt><dd>${esc(pilot)}</dd></div></dl></article>`).join('')}</div><p class="minor">${t.materialsNote}</p></section>
<section id="profile"><div class="section-heading"><h2>${t.profileHeading}</h2></div><div class="profile-list">${t.profiles.map(([title, text]) => `<div><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`).join('')}</div><p class="minor">${t.profileNote}</p></section>
<section id="prompt"><div class="section-heading"><h2>${t.promptHeading}</h2><a href="../${v.promptPath}" download="${esc(t.promptFile)}">${t.promptDownload}</a></div><p>${t.promptIntro}</p>${t.promptOriginal ? `<p class="minor"><a href="../prompt.txt" download hreflang="zh-Hans">${t.promptOriginal}</a></p>` : ''}<div class="prompt-actions"><button id="copy-prompt" type="button" hidden>${t.promptCopy}</button><button id="select-prompt" type="button" hidden>${t.promptSelect}</button></div><p id="copy-status" role="status" aria-live="polite"></p><details class="prompt-details"><summary>${t.promptView} ${chevron}</summary><pre id="prompt-text" tabindex="0">${esc(v.prompt)}</pre></details></section>
<section id="archive"><div class="section-heading"><h2>${t.archiveHeading}</h2><button id="print" type="button" hidden>${t.print}</button></div>${v.archive.map(archiveRow).join('')}</section>
<footer><span>${t.footerTitle}</span><a href="#main">${t.backToTop}</a><p>${t.footerLine(v.report, v.revised, v.next)}</p></footer><div id="toast" role="status" aria-live="polite"></div></main></div><script type="application/json" id="guide-strings">${script}</script></body></html>`;
  }

  function report(v) {
    const { lang, locale, t } = v, r = t.report;
    const sentence = text => lang === 'zh' ? text : lowerFirst(text);
    const list = rows => rows.map(row => sentence(row[lang])).join(locale.listSeparator);
    const previous = v.revised ? r.previous({ monthDay: locale.date.monthDay(issue.previous.date) }, `${site}${base}${issue.previous.path}`) : '';
    return `# ${r.title}

${r.dated(v.report, v.revised, data.period, data.timezone)}

${r.scope(v.scope)}

${r.next(v.next)}

${r.checks}${previous && lang !== 'zh' ? ' ' : ''}${previous}

${r.legend}

## ${r.actions}

${v.plans.map(row => r.plan(...row)).join('\n')}

## ${r.notices}

${v.notices.map(n => r.notice(`${n.date}${n.time ? ' ' + n.time : ''}`, n.kind, n.label, n.note, `${site}${base}${lang}/#${n.event}`)).join('\n')}

## ${r.conflicts}

${v.conflicts.map(({ ended, text: [date, title, text] }) => r.conflict(date, title, text, ended ? t.ended : '')).join('\n')}

## ${r.materials}

${r.materialsIntro}

${v.materials.map(({ events, text: [title, demo, question, pilot] }) => `### ${title}\n\n${r.materialFor}${events}\n\n${r.materialDemo}${demo}\n\n${r.materialQuestion}${question}\n\n${r.materialPilot}${pilot}`).join('\n\n')}

## ${r.events}

${v.events.map(e => `### ${e.name}\n\n${e.when} · ${e.country[lang]} · ${e.city[lang]}${e.venue ? ' · ' + e.venue : ''} · ${r.priority(e.event.priority, t.priorities[e.event.priority])}\n${r.eventFacts(list(e.goals), sentence(e.status), sentence(e.update[lang]))}\n\n${fieldOrder.filter(field => e.text[field]).map(field => r.field(t.labels[field], e.text[field])).join('\n')}\n\n${e.sources.map(([label, url]) => `[${label}](${url})`).join(' · ')}`).join('\n\n')}

## ${r.prompt}

${v.prompt}`;
  }

  const views = Object.fromEntries(languages.map(lang => [lang, view(lang)]));
  const files = new Map();
  for (const lang of languages) {
    const v = views[lang];
    files.set(`${lang}/index.html`, page(v));
    files.set(v.reportPath, report(v));
    if (lang !== 'zh') files.set(v.promptPath, v.prompt);
  }
  const english = locales.en.ui;
  files.set('index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="icon" href="/guides/favicon.svg" type="image/svg+xml"><link rel="icon" href="/guides/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/guides/apple-touch-icon.png"><title>${esc(english.rootTitle)}</title><link rel="canonical" href="${site}${base}en/"><script src="/guides/entry.js"></script></head><body><a href="zh/">中文</a> · <a href="en/">English</a> · <a href="fr/">Français</a></body></html>\n`);
  // Lets app.js resolve filter values written as labels (links saved before the filters used keys).
  const aliases = Object.fromEntries(['country', 'sector', 'goal', 'city'].map(group => [group, Object.fromEntries(memory.terms[group].flatMap(row => languages.map(lang => [row[lang], row.key])))]));
  files.set('filter-aliases.json', JSON.stringify(aliases) + '\n');

  const unused = memory.strings.filter(entry => !used.has(entry.zh)).map(entry => entry.zh);
  return { files, problems, unused, counts: { events: data.events.length, notices: data.notices.length } };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { files, problems, unused, counts } = await render();
  if (problems.length) {
    console.error(`Not built: ${problems.length} problem(s).\n- ${problems.join('\n- ')}`);
    process.exit(1);
  }
  for (const lang of languages) await mkdir(new URL(`${lang}/`, root), { recursive: true });
  for (const [path, content] of files) await writeFile(new URL(path, root), content);
  if (unused.length) console.log(`translations.json: ${unused.length} string(s) no longer used by events.json:\n- ${unused.join('\n- ')}`);
  console.log(`Built ${counts.events} opportunities and ${counts.notices} date notices in ${languages.join(', ')}.`);
}
