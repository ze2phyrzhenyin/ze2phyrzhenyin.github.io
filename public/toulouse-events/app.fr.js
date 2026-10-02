(() => {
  "use strict";

  const DATA_URL = "/toulouse-events/events.fr.json";
  const STORAGE_KEY = "toulouse-events-2026-saved";
  const PAGE_SIZE = 48;
  const MONTHS = [9, 10, 11, 12];

  const FEATURES = [
    ["TLS-0003", "Ouverture du tribunal à domicile", "Le premier match à domicile du TFC à l'automne, la dernière fois ; il suffit de regarder l'espace public officiel et la revente officielle."],
    ["TLS-0005", "Deux choses en une nuit", "L'Olympique XIII de Toulouse joue à domicile et M. Pokora se produit, ce qui est une soirée croisée rare cette saison."],
    ["TLS-0057", "Premier choix d'étape", "Théâtre, cirque, danse et musique live sont réunis dans une même œuvre, et le langage live est complet."],
    ["TLS-0060", "Grand écran et symphonie", "\"The Empire Strikes Back\" propose une symphonie live, adaptée à votre premier grand concert de cinéma."],
    ["TLS-0115", "Ouverture en octobre", "Purple Disco Machine, Selah Sue et Caravan Palace sont sur la même scène, avec une programmation dense."],
    ["TLS-0181", "Une bataille acharnée", "Stade Toulousain contre Exeter, l'ambiance et la rareté du match suffisent."],
    ["TLS-0205", "Plus qu'un simple piano", "La scène de Chilly Gonzales se situe quelque part entre solo, performance et crossover live."],
    ["TLS-0208", "Scène à grande échelle", "Le show d'Orelsan du 30 octobre est toujours disponible ; ne manquez pas le spectacle annulé du 29 octobre."],
    ["TLS-0214", "Toute la ville est sur la route", "La journée du marathon est aussi une journée pour visiter la ville ; même si vous ne participez pas, vous devez faire attention aux ajustements de circulation dans la zone centrale."],
    ["TLS-0233", "Musique de film", "Spécifications de tournées à grande échelle, adaptées aux personnes qui préfèrent les bandes originales de films mais ne veulent pas commencer par de la musique classique pure."],
    ["TLS-0261", "Stade local", "Bigflo & Oli reviennent à Toulouse pour deux nuits consécutives en novembre, en comparant d'abord les salles et les sièges."],
    ["TLS-0284", "Points clés de l'opéra", "\"Peter Grimes\" est d'une haute intensité musicale et dramatique et est la pièce maîtresse de la ligne d'opéra d'automne."],
    ["TLS-0337", "Le rappel doit être défini", "TFC contre Paris, restez à l'écoute des mises à jour officielles concernant la billetterie et l'heure exacte du coup d'envoi."],
    ["TLS-0359", "Musiques du monde", "Angélique Kidjo Arrivé en décembre, il a un style certain et convient également pour sortir entre amis."],
    ["TLS-0371", "Ballet de fin d'année", "\"Les Trois Mousquetaires\" entrera au programme à partir du 19 décembre et les projections spécifiques pourront être sélectionnées dans le calendrier officiel."],
    ["TLS-0375", "Sauvez l'année", "Le concert du Nouvel An à la Halle aux Grains clôture en beauté le mois de décembre."]
  ];

  const LIVE_LINKS = [
    ["Le Taquin", "Toulouse", "Jazz · Musiques du monde", "https://www.le-taquin.fr/"],
    ["Le Bijou", "Toulouse", "Chanson · Petite scène", "https://www.le-bijou.net/"],
    ["Cave Poésie", "Toulouse", "Poésie · Littérature · Drame", "https://www.cave-poesie.com/"],
    ["Théâtre du Pavé", "Toulouse", "Drame · Production locale", "https://theatredupave.org/"],
    ["Théâtre du Grand Rond", "Toulouse", "Drame · Famille · Déjeuner", "https://www.grand-rond.org/"],
    ["Théâtre de la Violette", "Toulouse", "Petit théâtre · Comédie", "https://www.theatredelaviolette.com/"],
    ["Les 3T Café-Théâtre", "Toulouse", "Comédie · Résident de longue durée", "https://www.3tcafetheatre.com/"],
    ["Comédie de Toulouse", "Toulouse", "Stand-up · Comédie", "https://www.comediedetoulouse.com/"],
    ["Théâtre des Mazades", "Toulouse", "Théâtre communautaire · Famille", "https://metropole.toulouse.fr/annuaire/theatre-des-mazades"],
    ["Altigone", "Saint-Orens", "Drame · Musique · Comédie", "https://www.altigone.fr/"],
    ["L’Escale", "Tournefeuille", "Performance globale de la zone métropolitaine", "https://www.mairie-tournefeuille.fr/"],
    ["Aria", "Cornebarrieu", "Musique · Drame · Comédie", "https://www.cornebarrieu.fr/"],
    ["Le Bascala", "Bruguières", "Tournées · Musique · Comédie", "https://www.le-bascala.com/"],
    ["Espace Roguet", "Toulouse", "Gratuit · Performance contemporaine", "https://www.haute-garonne.fr/service/espace-roguet"],
    ["Salle Nougaro", "Toulouse", "Jazz · Musiques du monde · Chanson", "https://sallenougaro.com/"],
    ["Grenier Théâtre", "Toulouse", "Drame · Programmation intensive", "https://www.greniertheatre.org/"],
    ["Comédie de la Roseraie", "Toulouse", "Comédie · Petit Théâtre", "https://www.lacomediedelaroseraie.fr/"],
    ["Interference", "Balma", "Concert · Électronique", "https://interference-toulouse.fr/"],
    ["Le Cri de la Mouette", "Toulouse", "Scène à bord · Activités nocturnes", "https://www.lecridelamouette.com/"],
    ["Toulouse Métropole Basket", "Toulouse", "Basketball féminin · Calendrier de la nouvelle saison", "https://www.tmb-basket.com/calendrier-and-classement"],
    ["Spacers Toulouse Volley", "Toulouse", "Équipe masculine de volleyball · Facturation par lots", "https://billetterie.spacerstoulouse.fr/"],
    ["TFC", "Toulouse", "Football masculin · Heure à déterminer après la diffusion", "https://billetterie.toulousefc.com/fr/calendrier-des-matchs"],
    ["Stade Toulousain", "Toulouse", "Top 14 · Date et heure ultérieures", "https://billetterie.stadetoulousain.fr/fr/calendrier"]
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
    return new Intl.DateTimeFormat("fr-FR", {
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
    return new Intl.DateTimeFormat("fr-FR", { month: "long", day: "numeric", weekday: "short" })
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
    toast(state.saved.has(id) ? "Ajouté aux favoris" : "Supprimé des favoris");
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
            <button class="save-button ${saved ? "is-saved" : ""}" type="button" data-save="${event.id}" aria-label="${saved ? "Retirer des favoris : " : "Ajouter aux favoris : "}${escapeHtml(event.name)}" aria-pressed="${saved}">${saved ? "✓" : "+"}</button>
          </div>
          <p class="feature-kicker">${escapeHtml(label)} · ${escapeHtml(event.category)}</p>
          <h3>${escapeHtml(event.name)}</h3>
          <p>${escapeHtml(summary)}</p>
          <div class="feature-bottom">
            <div class="feature-meta">${escapeHtml(event.venue)} · ${escapeHtml(event.time)}<br><span class="status-badge ${statusClass(event)}">${escapeHtml(event.status)}</span></div>
            <a class="feature-link" href="${escapeHtml(event.ticket)}" target="_blank" rel="noopener">Achat / demande de billets officiels ↗</a>
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
      const more = events.length > visible.length ? `<span class="day-more">+ ${events.length - visible.length}</span>` : "";
      cells.push(`
        <button class="calendar-day ${events.length ? "has-events" : ""} ${state.date === dateKey ? "is-selected" : ""} ${current ? "is-today" : ""}" type="button" role="gridcell" data-date="${dateKey}" aria-label="${escapeHtml(`${dateLong(dateKey)} : ${events.length} événements`)}">
          <span class="day-number">${day}</span>
          <span class="day-events">${eventNames}${more}</span>
        </button>`);
    }
    while (cells.length % 7 !== 0) cells.push(`<div class="calendar-day blank" aria-hidden="true"></div>`);

    el.monthTitle.textContent = new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(firstDay);
    el.monthGrid.setAttribute("aria-label", el.monthTitle.textContent);
    el.monthGrid.innerHTML = cells.join("");
    el.previousMonth.disabled = month === MONTHS[0];
    el.nextMonth.disabled = month === MONTHS[MONTHS.length - 1];
  }

  function eventDetailsMarkup(event) {
    return `
      <div class="event-details" id="details-${event.id}" hidden>
        <p><strong>Points forts</strong><br>${escapeHtml(cleanWhy(event.why))}</p>
        <p><strong>Confirmer avant d'arriver sur place</strong><br>${escapeHtml(event.notes)}</p>
        <div class="event-links">
          <a href="${escapeHtml(event.ticket)}" target="_blank" rel="noopener">Achat de billets officiel ↗</a>
          <a href="${escapeHtml(event.source)}" target="_blank" rel="noopener">Source ↗</a>
          <button type="button" data-calendar="${event.id}">Ajouter au calendrier</button>
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
          <button class="save-button ${saved ? "is-saved" : ""}" type="button" data-save="${event.id}" aria-label="${saved ? "Retirer des favoris : " : "Ajouter aux favoris : "}${escapeHtml(event.name)}" aria-pressed="${saved}">${saved ? "✓" : "+"}</button>
          <button class="detail-button" type="button" data-detail="${event.id}" aria-expanded="false" aria-controls="details-${event.id}" aria-label="Développer ${escapeHtml(event.name)} ">⌄</button>
        </div>
        ${eventDetailsMarkup(event)}
      </article>`;
  }

  function groupLabel(month) {
    const monthNames = { 9: "septembre", 10: "octobre", 11: "novembre", 12: "décembre" };
    return monthNames[month] || `${month} mois`;
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
        <div class="event-group-title"><strong id="group-${month}">${groupLabel(month)}</strong><span>${events.length} éléments sont affichés</span></div>
        ${events.map(eventRowMarkup).join("")}
      </section>`).join("");

    const labels = [];
    if (state.savedOnly) labels.push("Favoris");
    if (state.date) labels.push(dateLong(state.date));
    else if (state.month !== "all") labels.push(groupLabel(state.month));
    if (state.category !== "all") labels.push(document.querySelector(`[data-category="${state.category}"]`)?.textContent.trim() || "Classement");
    if (state.query) labels.push(`“${state.query}”`);
    el.resultCount.textContent = `${labels.length ? labels.join(" · ") + " : " : ""}${results.length} ${results.length === 1 ? "résultat" : "résultats"}${shown.length < results.length ? ` (${shown.length} affichés)` : ""}`;
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
      "PRODID:-//zhaoyang.fr//Toulouse Events 2026//FR",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${event.id}@zhaoyang.fr`,
      dateLines,
      `SUMMARY:${escapeIcs(event.name)}`,
      `LOCATION:${escapeIcs(`${event.venue}, ${event.area}`)}`,
      `DESCRIPTION:${escapeIcs(`${event.notes}
Billetterie officielle :${event.ticket}`)}`,
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
    toast("Le fichier de calendrier a été généré");
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
      if (!Array.isArray(data) || data.length === 0) throw new Error("Les données d'activité sont vides");
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
      el.resultCount.textContent = "La lecture du calendrier a échoué, veuillez l'actualiser plus tard.";
      el.eventList.innerHTML = `<p class="noscript">Les données d'activité ne peuvent pas être lues temporairement. Les instructions en vedette et avant le départ sont toujours disponibles.</p>`;
    }
  }

  init();
})();
