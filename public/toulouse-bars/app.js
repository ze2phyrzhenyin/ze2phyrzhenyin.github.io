(() => {
  "use strict";

  const DATA = window.BAR_GUIDE_DATA;
  if (!DATA) {
    console.error("BAR_GUIDE_DATA is missing.");
    return;
  }

  const categoryLabels = {
    lounge: "Lounge / Speakeasy",
    spirits: "烈酒",
    cocktails: "鸡尾酒",
    "jazz-live": "Jazz / 现场",
    quiet: "安静聊天",
    unique: "特色空间",
    award: "专业榜单",
    late: "深夜营业"
  };

  const categorySearchTerms = {
    lounge: "lounge speakeasy whisky whiskey 暗光 皮沙发 软座 安静 干邑 cognac armagnac 单桶 single cask 纯饮 neat",
    spirits: "烈酒 spirits whisky whiskey rhum rum cognac armagnac mezcal tequila gin absinthe pastis",
    cocktails: "鸡尾酒 cocktails mixology 调酒",
    "jazz-live": "jazz live music concert piano jam 演出 现场 音乐",
    quiet: "安静 calm quiet 约会 聊天 酒店",
    unique: "特色 主题 hidden secret unusual",
    award: "高评价 榜单 award french bar awards",
    late: "深夜 late 02 03"
  };

  const weekdayLabels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const displayDayOrder = [1, 2, 3, 4, 5, 6, 0];
  const dayNameFromEnglish = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  const params = new URLSearchParams(location.search);
  const state = {
    filter: params.get("filter") || "all",
    search: params.get("q") || "",
    openOnly: params.get("open") === "1",
    sort: params.get("sort") || "editorial"
  };

  const elements = {
    barCount: document.getElementById("bar-count"),
    loungeCount: document.getElementById("lounge-count"),
    verifiedDate: document.getElementById("verified-date"),
    footerDate: document.getElementById("footer-date"),
    loungeConclusion: document.getElementById("lounge-conclusion"),
    loungeAnswers: document.getElementById("lounge-answers"),
    loungeTableBody: document.getElementById("lounge-table-body"),
    quickTableBody: document.getElementById("quick-table-body"),
    directoryTableBody: document.getElementById("directory-table-body"),
    routeTableBody: document.getElementById("route-table-body"),
    searchInput: document.getElementById("search-input"),
    clearSearch: document.getElementById("clear-search"),
    filterButtons: [...document.querySelectorAll(".filter-button")],
    openNowToggle: document.getElementById("open-now-toggle"),
    sortSelect: document.getElementById("sort-select"),
    resultCount: document.getElementById("result-count"),
    resetFilters: document.getElementById("reset-filters"),
    emptyState: document.getElementById("empty-state"),
    emptyReset: document.getElementById("empty-reset"),
    seasonalAlert: document.getElementById("seasonal-alert"),
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

  function normalizeText(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[’'*·/–—-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getParisNow(date = new Date()) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: DATA.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });

    const parts = Object.fromEntries(
      formatter.formatToParts(date)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );

    const hour = Number(parts.hour);
    const minute = Number(parts.minute);
    return {
      year: Number(parts.year),
      month: Number(parts.month),
      day: Number(parts.day),
      hour,
      minute,
      minutes: hour * 60 + minute,
      dayIndex: dayNameFromEnglish[parts.weekday],
      dateKey: `${parts.year}-${parts.month}-${parts.day}`
    };
  }

  function dateKeyOffset(baseDateKey, offsetDays) {
    const [year, month, day] = baseDateKey.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + offsetDays));
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  }

  function dateLabel(dateKey) {
    const [, month, day] = dateKey.split("-");
    return `${month}-${day}`;
  }

  function getIntervals(bar, dateKey, dayIndex) {
    if (bar.dateOverrides && Object.prototype.hasOwnProperty.call(bar.dateOverrides, dateKey)) {
      return bar.dateOverrides[dateKey];
    }
    return bar.schedule?.[dayIndex] ?? [];
  }

  function formatClock(totalMinutes) {
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const hour = Math.floor(normalized / 60);
    const minute = normalized % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  function formatIntervals(intervals) {
    if (!intervals || intervals.length === 0) return "休息";
    return intervals.map(([start, end]) => `${formatClock(start)}–${formatClock(end)}`).join(" / ");
  }

  function isBeforeReopen(bar, dateKey) {
    return Boolean(bar.reopenDate && dateKey < bar.reopenDate);
  }

  function findNextOpening(bar, now) {
    for (let offset = 0; offset <= 8; offset += 1) {
      const dateKey = dateKeyOffset(now.dateKey, offset);
      if (isBeforeReopen(bar, dateKey)) continue;
      const dayIndex = (now.dayIndex + offset) % 7;
      const intervals = getIntervals(bar, dateKey, dayIndex);
      for (const [start] of intervals) {
        if (offset === 0 && start <= now.minutes) continue;
        return { offset, dayIndex, time: formatClock(start), dateKey };
      }
    }
    return null;
  }

  function getStatus(bar, now = getParisNow()) {
    if (isBeforeReopen(bar, now.dateKey)) {
      return {
        state: "closed",
        label: `暂停至 ${dateLabel(bar.reopenDate)}`,
        detail: bar.specialNotice || "暂未营业"
      };
    }

    if (bar.eventOnly) {
      return {
        state: "event",
        label: "按节目开放",
        detail: bar.specialNotice || "请查看当晚节目"
      };
    }

    const todayIntervals = getIntervals(bar, now.dateKey, now.dayIndex);
    const previousDateKey = dateKeyOffset(now.dateKey, -1);
    const previousDayIndex = (now.dayIndex + 6) % 7;
    const previousIntervals = getIntervals(bar, previousDateKey, previousDayIndex);

    let activeEnd = null;
    for (const [start, end] of todayIntervals) {
      if (start <= now.minutes && now.minutes < Math.min(end, 1440)) {
        activeEnd = end;
        break;
      }
    }

    if (activeEnd === null) {
      for (const [, end] of previousIntervals) {
        if (end > 1440 && now.minutes < end - 1440) {
          activeEnd = end;
          break;
        }
      }
    }

    if (activeEnd !== null) {
      const currentAbsolute = activeEnd > 1440 && now.minutes < activeEnd - 1440
        ? 1440 + now.minutes
        : now.minutes;
      const remaining = activeEnd - currentAbsolute;
      return {
        state: remaining <= 90 ? "closing" : "open",
        label: remaining <= 90 ? `${formatClock(activeEnd)} 关门` : `营业至 ${formatClock(activeEnd)}`,
        detail: `约 ${Math.max(0, remaining)} 分钟后关门`,
        remaining
      };
    }

    const next = findNextOpening(bar, now);
    if (next) {
      return {
        state: "closed",
        label: next.offset === 0 ? `${next.time} 开` : `${weekdayLabels[next.dayIndex]} ${next.time}`,
        detail: next.offset === 0 ? "今天稍后营业" : "下次营业"
      };
    }

    return { state: "closed", label: "当前休息", detail: "请查看官方信息" };
  }

  function mapUrl(bar) {
    const query = encodeURIComponent(`${bar.name}, ${bar.address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  function routeMapUrl(route) {
    const stops = route.steps
      .map((step) => DATA.bars.find((bar) => bar.id === step.barId))
      .filter(Boolean)
      .map((bar) => `${bar.name}, ${bar.address}`);

    if (stops.length < 2) return stops.length === 1 ? mapUrl(DATA.bars.find((bar) => `${bar.name}, ${bar.address}` === stops[0])) : "https://www.google.com/maps";

    const params = new URLSearchParams({
      api: "1",
      origin: stops[0],
      destination: stops[stops.length - 1]
    });
    if (stops.length > 2) params.set("waypoints", stops.slice(1, -1).join("|"));
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  function categoryTagClass(category) {
    if (category === "spirits") return "is-spirits";
    if (category === "cocktails") return "is-cocktails";
    if (category === "jazz-live") return "is-live";
    if (category === "quiet") return "is-quiet";
    if (category === "lounge") return "is-lounge";
    return "";
  }

  function renderCategoryTags(bar, limit = 5) {
    const categories = [...bar.categories]
      .sort((a, b) => {
        const priority = ["lounge", "spirits", "cocktails", "jazz-live", "quiet", "award", "unique", "late"];
        return priority.indexOf(a) - priority.indexOf(b);
      })
      .slice(0, limit);

    return `<div class="tag-list">${categories.map((category) => (
      `<span class="tag ${categoryTagClass(category)}">${escapeHtml(categoryLabels[category] || category)}</span>`
    )).join("")}</div>`;
  }

  function renderFitMeter(fit) {
    const safeFit = Math.max(0, Math.min(5, Number(fit) || 0));
    const dots = Array.from({ length: 5 }, (_, index) => `<span class="fit-dot ${index < safeFit ? "is-filled" : ""}"></span>`).join("");
    return `<div class="fit-meter" aria-label="场景匹配度 ${safeFit} / 5">${dots}<span class="fit-label">${safeFit}/5</span></div>`;
  }

  function renderHoursCell(bar, now = getParisNow(), includeDetails = true) {
    const status = getStatus(bar, now);
    const todayIntervals = getIntervals(bar, now.dateKey, now.dayIndex);
    const todayText = bar.eventOnly ? "以当晚节目为准" : `${weekdayLabels[now.dayIndex]}：${formatIntervals(todayIntervals)}`;

    const details = includeDetails ? `
      <details class="hours-details">
        <summary>查看一周</summary>
        <ul>
          ${displayDayOrder.map((dayIndex) => {
            const intervals = bar.schedule?.[dayIndex] ?? [];
            return `<li class="${dayIndex === now.dayIndex ? "is-today" : ""}"><span>${weekdayLabels[dayIndex]}</span><span>${escapeHtml(formatIntervals(intervals))}</span></li>`;
          }).join("")}
        </ul>
      </details>` : "";

    return `
      <span class="status-pill is-${escapeHtml(status.state)}" title="${escapeHtml(status.detail)}">${escapeHtml(status.label)}</span>
      <div class="hours-primary">${escapeHtml(todayText)}</div>
      ${details}
      ${bar.hoursNote ? `<span class="cell-note">${escapeHtml(bar.hoursNote)}</span>` : ""}
    `;
  }

  function renderLinks(bar) {
    return `
      <div class="link-stack">
        <a class="map-link" href="${escapeHtml(mapUrl(bar))}" target="_blank" rel="noopener noreferrer">Google 地图 ↗</a>
        <a href="${escapeHtml(bar.website)}" target="_blank" rel="noopener noreferrer">官网 / 节目 ↗</a>
      </div>
    `;
  }

  function renderLoungeSection() {
    const summary = DATA.loungeSummary || {};
    elements.loungeConclusion.textContent = summary.conclusion || "";
    elements.loungeAnswers.innerHTML = (summary.choices || []).map((choice) => {
      const bar = DATA.bars.find((item) => item.id === choice.barId);
      if (!bar) return "";
      return `
        <div class="answer-item">
          <span class="answer-label">${escapeHtml(choice.label)}</span>
          <a href="#bar-${escapeHtml(bar.id)}" data-bar-target="${escapeHtml(bar.id)}">${escapeHtml(bar.name)}</a>
        </div>`;
    }).join("");

    const loungeBars = DATA.bars
      .filter((bar) => bar.loungeProfile)
      .sort((a, b) => a.loungeProfile.rank - b.loungeProfile.rank);

    const now = getParisNow();
    elements.loungeTableBody.innerHTML = loungeBars.map((bar) => {
      const profile = bar.loungeProfile;
      return `
        <tr>
          <td data-label="场所">
            <a class="table-name" href="#bar-${escapeHtml(bar.id)}" data-bar-target="${escapeHtml(bar.id)}">${escapeHtml(bar.name)}</a>
            <span class="subline">${escapeHtml(bar.neighborhood)} · ${escapeHtml(bar.price)}</span>
            ${renderFitMeter(profile.fit)}
          </td>
          <td data-label="匹配结论"><span class="cell-title">${escapeHtml(profile.verdict)}</span><span class="cell-copy">${escapeHtml(bar.mood)}</span></td>
          <td data-label="空间与安静度"><span class="cell-copy">${escapeHtml(profile.room)}</span></td>
          <td data-label="适合点什么"><span class="cell-copy">${escapeHtml(profile.pour)}</span><span class="cell-note">限制：${escapeHtml(profile.caveat)}</span></td>
          <td data-label="营业时间">${renderHoursCell(bar, now, false)}</td>
          <td data-label="位置 / 链接"><span class="cell-copy">${escapeHtml(bar.address)}</span><span class="subline">${escapeHtml(bar.metro)}</span>${renderLinks(bar)}</td>
        </tr>`;
    }).join("");
  }

  function renderQuickPicks() {
    elements.quickTableBody.innerHTML = DATA.quickPicks.map((pick) => {
      const bar = DATA.bars.find((item) => item.id === pick.barId);
      if (!bar) return "";
      return `
        <tr>
          <td><span class="cell-title">${escapeHtml(pick.label)}</span></td>
          <td><a class="table-name" href="#bar-${escapeHtml(bar.id)}" data-bar-target="${escapeHtml(bar.id)}">${escapeHtml(bar.name)}</a><span class="subline">${escapeHtml(bar.neighborhood)}</span></td>
          <td><span class="cell-copy">${escapeHtml(pick.note)}</span></td>
        </tr>`;
    }).join("");
  }

  function barSearchText(bar) {
    const profile = bar.loungeProfile || {};
    return normalizeText([
      bar.name,
      bar.neighborhood,
      bar.address,
      bar.metro,
      bar.mood,
      bar.summary,
      ...(bar.highlights || []),
      ...(bar.badges || []).map((badge) => badge.label),
      bar.searchTerms,
      ...bar.categories.flatMap((category) => [categoryLabels[category] || category, category]),
      profile.verdict,
      profile.room,
      profile.pour
    ].filter(Boolean).join(" "));
  }

  function getLateScore(bar) {
    const intervals = Object.values(bar.schedule || {}).flat();
    return intervals.length ? Math.max(...intervals.map((interval) => interval[1])) : 0;
  }

  function getFilteredBars() {
    const now = getParisNow();
    let bars = DATA.bars.filter((bar) => {
      if (state.filter !== "all" && !bar.categories.includes(state.filter)) return false;
      if (state.search && !barSearchText(bar).includes(normalizeText(state.search))) return false;
      if (state.openOnly) {
        const status = getStatus(bar, now);
        if (!(["open", "closing"].includes(status.state))) return false;
      }
      return true;
    });

    bars = [...bars].sort((a, b) => {
      if (state.sort === "name") return a.name.localeCompare(b.name, "fr");
      if (state.sort === "closing") return getLateScore(b) - getLateScore(a) || a.editorialRank - b.editorialRank;
      if (state.sort === "lounge") {
        const aRank = a.loungeProfile?.rank ?? 999;
        const bRank = b.loungeProfile?.rank ?? 999;
        return aRank - bRank || a.editorialRank - b.editorialRank;
      }
      return a.editorialRank - b.editorialRank;
    });

    return bars;
  }

  function renderDirectory() {
    const url = new URL(location.href);
    for (const [key,value] of Object.entries({filter:state.filter === 'all' ? '' : state.filter,q:state.search,open:state.openOnly ? '1' : '',sort:state.sort === 'editorial' ? '' : state.sort})) {
      value ? url.searchParams.set(key,value) : url.searchParams.delete(key);
    }
    history.replaceState(null,'',url);
    const bars = getFilteredBars();
    const now = getParisNow();
    elements.directoryTableBody.innerHTML = bars.map((bar) => {
      const highlights = (bar.highlights || []).slice(0, 2).join("；");
      const loungeNote = bar.loungeProfile ? `<span class="cell-note">Lounge 场景：${escapeHtml(bar.loungeProfile.verdict)}（${bar.loungeProfile.fit}/5）</span>` : "";
      return `
        <tr class="directory-row" id="bar-${escapeHtml(bar.id)}" data-bar-id="${escapeHtml(bar.id)}">
          <td data-label="酒吧">
            <a class="table-name" href="${escapeHtml(bar.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(bar.name)}</a>
            <span class="subline">${escapeHtml(bar.neighborhood)} · ${escapeHtml(bar.price)}</span>
          </td>
          <td data-label="类别 / 氛围">${renderCategoryTags(bar)}<span class="cell-note">${escapeHtml(bar.mood)}</span></td>
          <td data-label="位置"><span class="cell-copy">${escapeHtml(bar.address)}</span><span class="subline">${escapeHtml(bar.metro)}</span></td>
          <td data-label="营业时间">${renderHoursCell(bar, now, true)}</td>
          <td data-label="特点"><span class="cell-copy">${escapeHtml(bar.summary)}</span>${highlights ? `<span class="cell-note">适合：${escapeHtml(highlights)}</span>` : ""}${loungeNote}</td>
          <td data-label="链接">${renderLinks(bar)}</td>
        </tr>`;
    }).join("");

    elements.resultCount.textContent = `显示 ${bars.length} / ${DATA.bars.length} 家`;
    elements.emptyState.hidden = bars.length !== 0;
    document.querySelector(".directory-scroll").hidden = bars.length === 0;
  }

  function renderRoutes() {
    elements.routeTableBody.innerHTML = DATA.routes.map((route) => {
      const steps = route.steps.map((step) => {
        const bar = DATA.bars.find((item) => item.id === step.barId);
        if (!bar) return "";
        return `
          <li>
            <span class="route-time">${escapeHtml(step.time)}</span>
            <a href="#bar-${escapeHtml(bar.id)}" data-bar-target="${escapeHtml(bar.id)}">${escapeHtml(bar.name)}</a>
            <span class="route-detail">${escapeHtml(step.note)}</span>
          </li>`;
      }).join("");
      return `
        <tr>
          <td><span class="cell-title">${escapeHtml(route.title)}</span><span class="subline">${escapeHtml(route.kicker)}</span></td>
          <td><ol class="route-steps">${steps}</ol></td>
          <td><span class="cell-copy">${escapeHtml(route.intro)}</span><span class="cell-note">${escapeHtml(route.footer)}</span></td>
          <td><a class="map-link" href="${escapeHtml(routeMapUrl(route))}" target="_blank" rel="noopener noreferrer">打开路线 ↗</a></td>
        </tr>`;
    }).join("");
  }

  function renderSeasonalAlert() {
    const now = getParisNow();
    const closures = DATA.bars
      .filter((bar) => isBeforeReopen(bar, now.dateKey))
      .sort((a, b) => a.reopenDate.localeCompare(b.reopenDate));

    const eventOnlyCount = DATA.bars.filter((bar) => bar.eventOnly).length;
    if (closures.length === 0 && eventOnlyCount === 0) {
      elements.seasonalAlert.classList.remove("is-visible");
      elements.seasonalAlert.innerHTML = "";
      return;
    }

    const closureText = closures.length
      ? closures.map((bar) => `<strong>${escapeHtml(bar.name)}</strong>：${escapeHtml(bar.specialNotice || `预计 ${bar.reopenDate} 恢复`)}`).join("；")
      : "";
    const eventText = eventOnlyCount ? `另有 ${eventOnlyCount} 家演出型场所按节目开放。` : "";
    elements.seasonalAlert.innerHTML = `<p>${closureText}${closureText && eventText ? "。" : ""}${eventText} 出发前请打开对应官网确认。</p>`;
    elements.seasonalAlert.classList.add("is-visible");
  }

  function resetFilters() {
    state.filter = "all";
    state.search = "";
    state.openOnly = false;
    state.sort = "editorial";
    elements.searchInput.value = "";
    elements.openNowToggle.checked = false;
    elements.sortSelect.value = "editorial";
    elements.filterButtons.forEach((button) => {
      const active = button.dataset.filter === "all";
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderDirectory();
  }

  function showToast(message) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 1800);
  }

  function jumpToBar(barId) {
    resetFilters();
    window.requestAnimationFrame(() => {
      const target = document.getElementById(`bar-${barId}`);
      if (!target) {
        showToast("未找到对应条目");
        return;
      }
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.remove("is-highlighted");
      void target.offsetWidth;
      target.classList.add("is-highlighted");
    });
  }

  function bindEvents() {
    elements.searchInput.addEventListener("input", (event) => {
      state.search = event.target.value;
      renderDirectory();
    });

    elements.clearSearch.addEventListener("click", () => {
      state.search = "";
      elements.searchInput.value = "";
      elements.searchInput.focus();
      renderDirectory();
    });

    elements.filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.filter;
        elements.filterButtons.forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        renderDirectory();
      });
    });

    elements.openNowToggle.addEventListener("change", (event) => {
      state.openOnly = event.target.checked;
      renderDirectory();
    });

    elements.sortSelect.addEventListener("change", (event) => {
      state.sort = event.target.value;
      renderDirectory();
    });

    elements.resetFilters.addEventListener("click", resetFilters);
    elements.emptyReset.addEventListener("click", resetFilters);

    document.addEventListener("click", (event) => {
      const link = event.target.closest("[data-bar-target]");
      if (!link) return;
      event.preventDefault();
      jumpToBar(link.dataset.barTarget);
    });

    window.setInterval(() => {
      renderDirectory();
      renderLoungeSection();
    }, 60_000);
  }

  function init() {
    elements.searchInput.value = state.search;
    elements.openNowToggle.checked = state.openOnly;
    elements.sortSelect.value = state.sort;
    elements.filterButtons.forEach(button => {
      const active = button.dataset.filter === state.filter;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-pressed', String(active));
    });
    elements.barCount.textContent = String(DATA.bars.length);
    if (elements.loungeCount) elements.loungeCount.textContent = String(DATA.bars.filter((bar) => bar.loungeProfile).length);
    elements.verifiedDate.textContent = DATA.verifiedAt;
    elements.footerDate.textContent = DATA.verifiedAt;
    renderLoungeSection();
    renderQuickPicks();
    renderDirectory();
    renderRoutes();
    renderSeasonalAlert();
    bindEvents();
    document.dispatchEvent(new Event('guide-ready'));
  }

  init();
})();
