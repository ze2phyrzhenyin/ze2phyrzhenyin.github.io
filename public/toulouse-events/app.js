(() => {
  "use strict";

  const DATA_URL = "/toulouse-events/events.json";
  const STORAGE_KEY = "toulouse-events-2026-saved";
  const PAGE_SIZE = 48;
  const MONTHS = [9, 10, 11, 12];

  const FEATURES = [
    ["TLS-0003", "揭幕主场", "秋季第一场 TFC 主场，时间最近；只看官方公众区和官方转售。"],
    ["TLS-0005", "一晚两件事", "Toulouse Olympique XIII 主场加 M. Pokora 演出，是本季少见的跨界夜。"],
    ["TLS-0057", "舞台首选", "戏剧、马戏、舞蹈和现场音乐放在同一部作品里，现场语言很完整。"],
    ["TLS-0060", "大银幕与交响", "《帝国反击战》配现场交响，适合第一次去大型电影音乐会。"],
    ["TLS-0115", "十月开场", "Purple Disco Machine、Selah Sue 与 Caravan Palace 同场，阵容密度高。"],
    ["TLS-0181", "强强对阵", "Stade Toulousain 对 Exeter，现场氛围和对阵稀缺度都够。"],
    ["TLS-0205", "不只是一场钢琴", "Chilly Gonzales 的舞台介于独奏、表演与跨界现场之间。"],
    ["TLS-0208", "大型现场", "Orelsan 的 10 月 30 日场仍在售；不要误看已取消的 10 月 29 日场。"],
    ["TLS-0214", "全城在路上", "马拉松日也是看城市的日子；不参赛也要留意中心区交通调整。"],
    ["TLS-0233", "电影音乐", "大型巡演规格，适合偏爱电影配乐、又不想从纯古典入门的人。"],
    ["TLS-0261", "本地主场", "Bigflo & Oli 回到图卢兹，11 月连续两晚，先比较场次和座位。"],
    ["TLS-0284", "歌剧重点", "《彼得·格莱姆斯》音乐和戏剧强度都高，是秋季歌剧线的核心。"],
    ["TLS-0337", "必须设提醒", "TFC 对巴黎，票务和确切开球时间都要紧盯官方更新。"],
    ["TLS-0359", "世界音乐", "Angélique Kidjo 十二月到场，风格明确，也适合与朋友一起去。"],
    ["TLS-0371", "年末芭蕾", "《三个火枪手》从 12 月 19 日进入档期，具体场次在官方日历选择。"],
    ["TLS-0375", "把一年收住", "Halle aux Grains 的新年音乐会，适合把它当作十二月的收尾。"]
  ];

  const LIVE_LINKS = [
    ["Le Taquin", "Toulouse", "爵士 · 世界音乐", "https://www.le-taquin.fr/"],
    ["Le Bijou", "Toulouse", "香颂 · 小型现场", "https://www.le-bijou.net/"],
    ["Cave Poésie", "Toulouse", "诗歌 · 文学 · 戏剧", "https://www.cave-poesie.com/"],
    ["Théâtre du Pavé", "Toulouse", "戏剧 · 本地制作", "https://theatredupave.org/"],
    ["Théâtre du Grand Rond", "Toulouse", "戏剧 · 家庭 · 午间场", "https://www.grand-rond.org/"],
    ["Théâtre de la Violette", "Toulouse", "小剧场 · 喜剧", "https://www.theatredelaviolette.com/"],
    ["Les 3T Café-Théâtre", "Toulouse", "喜剧 · 长期驻演", "https://www.3tcafetheatre.com/"],
    ["Comédie de Toulouse", "Toulouse", "单口 · 喜剧", "https://www.comediedetoulouse.com/"],
    ["Théâtre des Mazades", "Toulouse", "社区剧院 · 家庭", "https://metropole.toulouse.fr/annuaire/theatre-des-mazades"],
    ["Altigone", "Saint-Orens", "戏剧 · 音乐 · 喜剧", "https://www.altigone.fr/"],
    ["L’Escale", "Tournefeuille", "都会区综合演出", "https://www.mairie-tournefeuille.fr/"],
    ["Aria", "Cornebarrieu", "音乐 · 戏剧 · 喜剧", "https://www.cornebarrieu.fr/"],
    ["Le Bascala", "Bruguières", "巡演 · 音乐 · 喜剧", "https://www.le-bascala.com/"],
    ["Espace Roguet", "Toulouse", "免费 · 当代表演", "https://www.haute-garonne.fr/service/espace-roguet"],
    ["Salle Nougaro", "Toulouse", "爵士 · 世界音乐 · 香颂", "https://sallenougaro.com/"],
    ["Grenier Théâtre", "Toulouse", "戏剧 · 密集排期", "https://www.greniertheatre.org/"],
    ["Comédie de la Roseraie", "Toulouse", "喜剧 · 小剧场", "https://www.lacomediedelaroseraie.fr/"],
    ["Interference", "Balma", "音乐会 · 电子", "https://interference-toulouse.fr/"],
    ["Le Cri de la Mouette", "Toulouse", "船上现场 · 夜间活动", "https://www.lecridelamouette.com/"],
    ["Toulouse Métropole Basket", "Toulouse", "女篮 · 新赛季赛程", "https://www.tmb-basket.com/calendrier-and-classement"],
    ["Spacers Toulouse Volley", "Toulouse", "男排 · 分批开票", "https://billetterie.spacerstoulouse.fr/"],
    ["TFC", "Toulouse", "男足 · 转播后定时间", "https://billetterie.toulousefc.com/fr/calendrier-des-matchs"],
    ["Stade Toulousain", "Toulouse", "Top 14 · 后定日时", "https://billetterie.stadetoulousain.fr/fr/calendrier"]
  ];

  const state = {
    events: [],
    month: "9",
    calendarMonth: 9,
    category: "all",
    status: "all",
    query: "",
    date: null,
    savedOnly: false,
    visible: PAGE_SIZE,
    saved: new Set()
  };

  const el = {
    featureGrid: document.getElementById("feature-grid"),
    monthButtons: [...document.querySelectorAll("[data-month]")],
    categoryButtons: [...document.querySelectorAll("[data-category]")],
    monthTitle: document.getElementById("month-calendar-title"),
    monthGrid: document.getElementById("month-grid"),
    previousMonth: document.getElementById("previous-month"),
    nextMonth: document.getElementById("next-month"),
    search: document.getElementById("search"),
    clearSearch: document.getElementById("clear-search"),
    status: document.getElementById("status-filter"),
    resultCount: document.getElementById("result-count"),
    eventList: document.getElementById("event-list"),
    emptyState: document.getElementById("empty-state"),
    resetFilters: document.getElementById("reset-filters"),
    emptyReset: document.getElementById("empty-reset"),
    loadWrap: document.getElementById("load-more-wrap"),
    loadMore: document.getElementById("load-more"),
    remaining: document.getElementById("remaining-count"),
    showSaved: document.getElementById("show-saved"),
    savedCount: document.getElementById("saved-count"),
    liveLinks: document.getElementById("live-links"),
    toast: document.getElementById("toast")
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[’'·/–—-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseLocalDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDate(value, includeYear = false) {
    return new Intl.DateTimeFormat("zh-CN", {
      ...(includeYear ? { year: "numeric" } : {}),
      month: "short",
      day: "numeric"
    }).format(parseLocalDate(value));
  }

  function dateLabel(event) {
    if (event.start === event.end) return formatDate(event.start);
    return `${formatDate(event.start)}—${formatDate(event.end)}`;
  }

  function dateLong(value) {
    return new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "short" })
      .format(parseLocalDate(value));
  }

  function eventFamily(event) {
    event = event._classification || event;
    if (event.domain === "体育比赛") return "sport";
    const category = normalize(event.category);
    if (/古典|交响|歌剧|芭蕾|管风琴|室内乐|声乐|钢琴/.test(category)) return "classical";
    if (/戏剧|舞蹈|马戏|表演|朗读|文学|音乐剧|木偶/.test(category)) return "stage";
    if (/电子|dj|techno|夜店|trance|drum|disco/.test(category)) return "night";
    if (/家庭|节庆|开放日|工作坊|科学|导赏|交流/.test(category)) return "family";
    return "music";
  }

  function statusGroup(event) {
    event = event._classification || event;
    const status = event.status;
    if (/取消|延期/.test(status)) return "unavailable";
    if (/售罄/.test(status) && !/电话|查询/.test(status)) return "unavailable";
    if (/免费/.test(status) || /免费/.test(event.price)) return "free";
    if (/待|查询|紧张|冲突|日期|时间|提醒|已公布|配额售罄|需预约|循环/.test(status)) return "watch";
    return "available";
  }

  function statusClass(event) {
    const group = statusGroup(event);
    return group === "available" ? "" : group;
  }

  function eventStartsInMonth(event, month) {
    return Number(event.start.slice(5, 7)) === month;
  }

  function eventSearchText(event) {
    return normalize([event.name, event.venue, event.area, event.category, event.domain, event.price, event.status, event.why, event.notes].join(" "));
  }

  function isFree(event) {
    return statusGroup(event) === "free";
  }

  function cleanWhy(value) {
    const rewrites = new Map([
      ["Paul Lay 的爵士取向与你的偏好高度匹配。", "Paul Lay 的爵士取向鲜明，值得列入九月钢琴节的优先场次。"],
      ["《Qui som?》兼具戏剧、马戏、舞蹈和社会思考，是四个月内与你兴趣最贴合的舞台作品之一。", "《Qui som?》兼具戏剧、马戏、舞蹈和社会思考，是四个月里很值得看的舞台作品。"],
      ["你最优先的主队现场；主场氛围与可达性都应排在其他常规赛事之前。", "TFC 主场氛围好，从市区前往也方便，值得在常规比赛里优先考虑。"],
      ["文学性和思想性较强的小剧场制作，与你对哲学和社会议题的兴趣较贴合。", "文学性和思想性较强，适合想看哲学或社会议题小剧场的人。"]
    ]);
    return rewrites.get(value) || value;
  }

  function matchesCommonFilters(event) {
    if (state.query && !eventSearchText(event).includes(normalize(state.query))) return false;
    if (state.category === "free" && !isFree(event)) return false;
    if (state.category !== "all" && state.category !== "free" && eventFamily(event) !== state.category) return false;
    if (state.status !== "all" && statusGroup(event) !== state.status) return false;
    if (state.savedOnly && !state.saved.has(event.id)) return false;
    return true;
  }

  function filteredEvents() {
    return state.events.filter((event) => {
      if (!matchesCommonFilters(event)) return false;
      if (state.month !== "all" && !eventStartsInMonth(event, Number(state.month))) return false;
      if (state.date && event.start !== state.date) return false;
      return true;
    });
  }

  function calendarEventsForDay(day) {
    const key = `2026-${String(state.calendarMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return state.events.filter((event) => event.start === key && matchesCommonFilters(event));
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.saved]));
    el.savedCount.textContent = String(state.saved.size);
  }

  function toggleSaved(id) {
    if (state.saved.has(id)) state.saved.delete(id);
    else state.saved.add(id);
    saveState();
    renderFeatures();
    renderCalendar();
    renderEventList();
    toast(state.saved.has(id) ? "已加入收藏" : "已从收藏移除");
  }

  function toast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("is-visible");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => el.toast.classList.remove("is-visible"), 1800);
  }

  function renderFeatures() {
    const byId = new Map(state.events.map((event) => [event.id, event]));
    el.featureGrid.innerHTML = FEATURES.map(([id, label, summary]) => {
      const event = byId.get(id);
      if (!event) return "";
      const saved = state.saved.has(id);
      return `
        <article class="feature-card">
          <div class="feature-top">
            <span class="feature-date">${escapeHtml(dateLabel(event))}</span>
            <button class="save-button ${saved ? "is-saved" : ""}" type="button" data-save="${event.id}" aria-label="${saved ? "取消收藏" : "收藏"}${escapeHtml(event.name)}" aria-pressed="${saved}">${saved ? "✓" : "+"}</button>
          </div>
          <p class="feature-kicker">${escapeHtml(label)} · ${escapeHtml(event.category)}</p>
          <h3>${escapeHtml(event.name)}</h3>
          <p>${escapeHtml(summary)}</p>
          <div class="feature-bottom">
            <div class="feature-meta">${escapeHtml(event.venue)} · ${escapeHtml(event.time)}<br><span class="status-badge ${statusClass(event)}">${escapeHtml(event.status)}</span></div>
            <a class="feature-link" href="${escapeHtml(event.ticket)}" target="_blank" rel="noopener">官方购票 / 查询 ↗</a>
          </div>
        </article>`;
    }).join("");
  }

  function setMonth(month) {
    state.month = String(month);
    if (month !== "all") state.calendarMonth = Number(month);
    state.date = null;
    state.visible = PAGE_SIZE;
    state.savedOnly = false;
    updateControls();
    renderCalendar();
    renderEventList();
  }

  function updateControls() {
    el.monthButtons.forEach((button) => {
      const active = button.dataset.month === state.month;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    el.categoryButtons.forEach((button) => {
      const active = button.dataset.category === state.category;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    el.status.value = state.status;
    el.search.value = state.query;
    el.clearSearch.hidden = !state.query;
    el.showSaved.setAttribute("aria-pressed", String(state.savedOnly));
  }

  function renderMonthCounts() {
    MONTHS.forEach((month) => {
      const count = state.events.filter((event) => eventStartsInMonth(event, month)).length;
      document.getElementById(`month-count-${month}`).textContent = String(count);
    });
  }

  function renderCalendar() {
    const month = state.calendarMonth;
    const firstDay = new Date(2026, month - 1, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const days = new Date(2026, month, 0).getDate();
    const cells = [];
    const today = new Date();
    const isCurrentYear = today.getFullYear() === 2026;

    for (let index = 0; index < offset; index += 1) cells.push(`<div class="calendar-day blank" aria-hidden="true"></div>`);
    for (let day = 1; day <= days; day += 1) {
      const events = calendarEventsForDay(day);
      const dateKey = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const visible = events.slice(0, 3);
      const current = isCurrentYear && today.getMonth() + 1 === month && today.getDate() === day;
      const eventNames = visible.map((event) => `<span class="day-event ${eventFamily(event)}">${event.start !== event.end ? "↔ " : ""}${escapeHtml(event.name)}</span>`).join("");
      const more = events.length > visible.length ? `<span class="day-more">另有 ${events.length - visible.length} 条</span>` : "";
      cells.push(`
        <button class="calendar-day ${events.length ? "has-events" : ""} ${state.date === dateKey ? "is-selected" : ""} ${current ? "is-today" : ""}" type="button" role="gridcell" data-date="${dateKey}" aria-label="${month} 月 ${day} 日，${events.length} 条活动">
          <span class="day-number">${day}</span>
          <span class="day-events">${eventNames}${more}</span>
        </button>`);
    }
    while (cells.length % 7 !== 0) cells.push(`<div class="calendar-day blank" aria-hidden="true"></div>`);

    el.monthTitle.textContent = `2026 年 ${month} 月`;
    el.monthGrid.setAttribute("aria-label", `2026 年 ${month} 月活动月历`);
    el.monthGrid.innerHTML = cells.join("");
    el.previousMonth.disabled = month === MONTHS[0];
    el.nextMonth.disabled = month === MONTHS[MONTHS.length - 1];
  }

  function eventDetailsMarkup(event) {
    return `
      <div class="event-details" id="details-${event.id}" hidden>
        <p><strong>看点</strong><br>${escapeHtml(cleanWhy(event.why))}</p>
        <p><strong>到场前再确认</strong><br>${escapeHtml(event.notes)}</p>
        <div class="event-links">
          <a href="${escapeHtml(event.ticket)}" target="_blank" rel="noopener">官方购票 ↗</a>
          <a href="${escapeHtml(event.source)}" target="_blank" rel="noopener">资料来源 ↗</a>
          <button type="button" data-calendar="${event.id}">加入日历</button>
        </div>
      </div>`;
  }

  function eventRowMarkup(event) {
    const saved = state.saved.has(event.id);
    return `
      <article class="event-row" data-event="${event.id}">
        <div class="event-date"><strong>${escapeHtml(dateLabel(event))}</strong><span>${escapeHtml(event.time)}</span></div>
        <div class="event-main"><h3>${escapeHtml(event.name)}</h3><p>${escapeHtml(event.category)} · ${escapeHtml(event.domain)}</p></div>
        <div class="event-venue"><strong>${escapeHtml(event.venue)}</strong><p>${escapeHtml(event.area)}</p></div>
        <div class="event-ticket"><strong>${escapeHtml(event.price)}</strong><span class="status-badge ${statusClass(event)}">${escapeHtml(event.status)}</span></div>
        <div class="event-actions">
          <button class="save-button ${saved ? "is-saved" : ""}" type="button" data-save="${event.id}" aria-label="${saved ? "取消收藏" : "收藏"}${escapeHtml(event.name)}" aria-pressed="${saved}">${saved ? "✓" : "+"}</button>
          <button class="detail-button" type="button" data-detail="${event.id}" aria-expanded="false" aria-controls="details-${event.id}" aria-label="展开 ${escapeHtml(event.name)} 的详情">⌄</button>
        </div>
        ${eventDetailsMarkup(event)}
      </article>`;
  }

  function groupLabel(month) {
    const monthNames = { 9: "九月", 10: "十月", 11: "十一月", 12: "十二月" };
    return monthNames[month] || `${month} 月`;
  }

  function renderEventList() {
    const url = new URL(location.href);
    for (const [key,value] of Object.entries({month:state.month,category:state.category === 'all' ? '' : state.category,status:state.status === 'all' ? '' : state.status,q:state.query,date:state.date || '',saved:state.savedOnly ? '1' : '',limit:state.visible === PAGE_SIZE ? '' : String(state.visible)})) {
      value ? url.searchParams.set(key,value) : url.searchParams.delete(key);
    }
    history.replaceState(null,'',url);
    const results = filteredEvents().sort((a, b) => a.start.localeCompare(b.start) || a.time.localeCompare(b.time) || b.score - a.score);
    const shown = results.slice(0, state.visible);
    const groups = new Map();
    shown.forEach((event) => {
      const month = Number(event.start.slice(5, 7));
      if (!groups.has(month)) groups.set(month, []);
      groups.get(month).push(event);
    });

    el.eventList.innerHTML = [...groups.entries()].map(([month, events]) => `
      <section class="event-group" aria-labelledby="group-${month}">
        <div class="event-group-title"><strong id="group-${month}">${groupLabel(month)}</strong><span>${events.length} 条正在显示</span></div>
        ${events.map(eventRowMarkup).join("")}
      </section>`).join("");

    const labels = [];
    if (state.savedOnly) labels.push("收藏");
    if (state.date) labels.push(dateLong(state.date));
    else if (state.month !== "all") labels.push(`${state.month} 月`);
    if (state.category !== "all") labels.push(document.querySelector(`[data-category="${state.category}"]`)?.textContent.trim() || "分类");
    if (state.query) labels.push(`“${state.query}”`);
    el.resultCount.textContent = `${labels.length ? `${labels.join(" · ")}：` : ""}${results.length} 条结果${shown.length < results.length ? `，已显示 ${shown.length} 条` : ""}`;
    el.emptyState.hidden = results.length !== 0;
    el.loadWrap.hidden = shown.length >= results.length;
    el.remaining.textContent = String(Math.min(PAGE_SIZE, results.length - shown.length));
  }

  function resetFilters() {
    const now = new Date();
    const defaultMonth = now.getFullYear() === 2026 && MONTHS.includes(now.getMonth() + 1) ? now.getMonth() + 1 : 9;
    state.month = String(defaultMonth);
    state.calendarMonth = defaultMonth;
    state.category = "all";
    state.status = "all";
    state.query = "";
    state.date = null;
    state.savedOnly = false;
    state.visible = PAGE_SIZE;
    updateControls();
    renderCalendar();
    renderEventList();
  }

  function escapeIcs(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  }

  function icsDate(date) {
    return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  }

  function icsDateTime(date) {
    return `${icsDate(date)}T${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}00`;
  }

  function addToCalendar(id) {
    const event = state.events.find((item) => item.id === id);
    if (!event) return;
    const timeMatch = event.time.match(/^(\d{1,2}):(\d{2})$/);
    const start = parseLocalDate(event.start);
    const end = parseLocalDate(event.end);
    let dateLines;
    if (timeMatch && event.start === event.end) {
      start.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
      end.setTime(start.getTime() + 2 * 60 * 60 * 1000);
      dateLines = `DTSTART;TZID=Europe/Paris:${icsDateTime(start)}\r\nDTEND;TZID=Europe/Paris:${icsDateTime(end)}`;
    } else {
      end.setDate(end.getDate() + 1);
      dateLines = `DTSTART;VALUE=DATE:${icsDate(start)}\r\nDTEND;VALUE=DATE:${icsDate(end)}`;
    }
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//zhaoyang.fr//Toulouse Events 2026//ZH",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${event.id}@zhaoyang.fr`,
      dateLines,
      `SUMMARY:${escapeIcs(event.name)}`,
      `LOCATION:${escapeIcs(`${event.venue}, ${event.area}`)}`,
      `DESCRIPTION:${escapeIcs(`${event.notes}\n官方票务：${event.ticket}`)}`,
      `URL:${event.ticket}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.id}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast("日历文件已生成");
  }

  function renderLiveLinks() {
    el.liveLinks.innerHTML = LIVE_LINKS.map(([name, area, note, url]) => `
      <a class="live-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">
        <strong>${escapeHtml(name)}</strong>
        <span>${escapeHtml(area)} ↗</span>
        <p>${escapeHtml(note)}</p>
      </a>`).join("");
  }

  function bindEvents() {
    el.monthButtons.forEach((button) => button.addEventListener("click", () => setMonth(button.dataset.month)));
    el.categoryButtons.forEach((button) => button.addEventListener("click", () => {
      state.category = button.dataset.category;
      state.date = null;
      state.visible = PAGE_SIZE;
      updateControls();
      renderCalendar();
      renderEventList();
    }));
    el.previousMonth.addEventListener("click", () => setMonth(state.calendarMonth - 1));
    el.nextMonth.addEventListener("click", () => setMonth(state.calendarMonth + 1));
    el.search.addEventListener("input", () => {
      state.query = el.search.value.trim();
      state.date = null;
      state.visible = PAGE_SIZE;
      el.clearSearch.hidden = !state.query;
      renderCalendar();
      renderEventList();
    });
    el.clearSearch.addEventListener("click", () => {
      state.query = "";
      el.search.value = "";
      el.clearSearch.hidden = true;
      renderCalendar();
      renderEventList();
      el.search.focus();
    });
    el.status.addEventListener("change", () => {
      state.status = el.status.value;
      state.date = null;
      state.visible = PAGE_SIZE;
      renderCalendar();
      renderEventList();
    });
    el.resetFilters.addEventListener("click", resetFilters);
    el.emptyReset.addEventListener("click", resetFilters);
    el.loadMore.addEventListener("click", () => {
      state.visible += PAGE_SIZE;
      renderEventList();
    });
    el.showSaved.addEventListener("click", () => {
      state.savedOnly = !state.savedOnly;
      state.month = "all";
      state.date = null;
      state.visible = PAGE_SIZE;
      updateControls();
      renderCalendar();
      renderEventList();
      document.getElementById("calendar").scrollIntoView({ behavior: "smooth" });
    });
    document.addEventListener("click", (event) => {
      const save = event.target.closest("[data-save]");
      if (save) {
        toggleSaved(save.dataset.save);
        return;
      }
      const detail = event.target.closest("[data-detail]");
      if (detail) {
        const panel = document.getElementById(`details-${detail.dataset.detail}`);
        const expanded = detail.getAttribute("aria-expanded") === "true";
        detail.setAttribute("aria-expanded", String(!expanded));
        detail.textContent = expanded ? "⌄" : "⌃";
        panel.hidden = expanded;
        return;
      }
      const calendar = event.target.closest("[data-calendar]");
      if (calendar) {
        addToCalendar(calendar.dataset.calendar);
        return;
      }
      const day = event.target.closest("[data-date]");
      if (day) {
        state.date = state.date === day.dataset.date ? null : day.dataset.date;
        state.month = String(state.calendarMonth);
        state.visible = PAGE_SIZE;
        updateControls();
        renderCalendar();
        renderEventList();
        document.querySelector(".result-line").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  async function init() {
    renderLiveLinks();
    try {
      state.saved = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {
      state.saved = new Set();
    }
    el.savedCount.textContent = String(state.saved.size);

    const now = new Date();
    const initialMonth = now.getFullYear() === 2026 && MONTHS.includes(now.getMonth() + 1) ? now.getMonth() + 1 : 9;
    state.month = String(initialMonth);
    state.calendarMonth = initialMonth;

    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error("活动数据为空");
      state.events = data;
      const params = new URLSearchParams(location.search);
      const month = params.get('month');
      if (month === 'all' || MONTHS.includes(Number(month))) state.month = month;
      if (MONTHS.includes(Number(state.month))) state.calendarMonth = Number(state.month);
      state.query = params.get('q') || '';
      const category = params.get('category');
      if (['all','sport','classical','stage','night','family','music','free'].includes(category)) state.category = category;
      const status = params.get('status');
      if (['all','unavailable','free','watch','available'].includes(status)) state.status = status;
      const date = params.get('date');
      if (/^2026-(09|10|11|12)-\d{2}$/.test(date)) state.date = date;
      state.savedOnly = params.get('saved') === '1';
      const limit = Number(params.get('limit'));
      if (limit > PAGE_SIZE && limit <= data.length) state.visible = limit;
      renderMonthCounts();
      renderFeatures();
      updateControls();
      renderCalendar();
      renderEventList();
      bindEvents();
      document.dispatchEvent(new Event('guide-ready'));
    } catch (error) {
      console.error(error);
      el.resultCount.textContent = "日历读取失败，请稍后刷新。";
      el.eventList.innerHTML = `<p class="noscript">活动数据暂时无法读取。精选和出发前说明仍可使用。</p>`;
    }
  }

  init();
})();
