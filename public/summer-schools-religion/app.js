
(function () {
  'use strict';

  /* ══════════════════════════════════════
     TRILINGUAL UI STRINGS
     ══════════════════════════════════════ */
  var UI = {
    zh: {
      siteTitle: '欧洲宗教学暑校导航',
      brand: '欧洲宗教学暑校',
      headerTitle: '欧洲宗教学暑校｜本科研究导航',
      verified: '核实于',
      searchPlaceholder: '搜索课程名称、主办方、关键词…',
      clearFilters: '清除筛选',
      showing: '显示',
      of: '/',
      programmes: '个项目',
      activeFilters: '个筛选条件',
      noResults: '没有匹配的项目，请调整筛选条件。',
      expandAll: '展开全部',
      collapseAll: '收起全部',
      // detail labels
      host: '主办方',
      city: '城市',
      country: '国家',
      dates: '日期',
      fee: '费用',
      language: '授课语言',
      credit: '学分',
      deadline: '截止日期',
      status: '状态',
      mode: '授课方式',
      summary: '项目简介',
      admission: '申请条件',
      learning: '教学方式',
      caution: '注意事项',
      sources: '信息来源',
      methods: '教学方法',
      // filter labels
      filterEligibility: '申请资格',
      filterTrack: '学科方向',
      filterCountry: '国家',
      filterMode: '授课方式',
      filterStatus: '项目状态',
      // excluded
      excludedTitle: '排除项目',
      excludedToggle: function (n) { return '查看 ' + n + ' 个排除项目（不面向本科生或不在范围内）'; },
      excludedReason: '排除原因',
      // footer
      footer: '数据来源于各校官方网站，仅作参考。申请前请向主办方确认最新信息。',
      footerLink: '返回主站'
    },
    fr: {
      siteTitle: 'Universités d\'été en études religieuses',
      brand: 'Écoles d\'été religieuses',
      headerTitle: 'Écoles d\'été européennes en études religieuses',
      verified: 'Vérifié le',
      searchPlaceholder: 'Rechercher par nom, organisateur, mot-clé…',
      clearFilters: 'Réinitialiser',
      showing: 'Affichage',
      of: '/',
      programmes: 'programmes',
      activeFilters: 'filtres actifs',
      noResults: 'Aucun programme ne correspond aux critères.',
      expandAll: 'Tout déployer',
      collapseAll: 'Tout replier',
      host: 'Organisateur',
      city: 'Ville',
      country: 'Pays',
      dates: 'Dates',
      fee: 'Frais',
      language: 'Langue',
      credit: 'Crédits',
      deadline: 'Date limite',
      status: 'Statut',
      mode: 'Modalité',
      summary: 'Présentation',
      admission: 'Conditions d\'admission',
      learning: 'Format pédagogique',
      caution: 'Points d\'attention',
      sources: 'Sources',
      methods: 'Méthodes',
      filterEligibility: 'Éligibilité',
      filterTrack: 'Discipline',
      filterCountry: 'Pays',
      filterMode: 'Modalité',
      filterStatus: 'Statut',
      excludedTitle: 'Programmes exclus',
      excludedToggle: function (n) { return 'Voir ' + n + ' programmes exclus (hors périmètre licence)'; },
      excludedReason: 'Motif d\'exclusion',
      footer: 'Données issues des sites officiels des universités. Vérifiez auprès des organisateurs avant de postuler.',
      footerLink: 'Retour au site'
    },
    en: {
      siteTitle: 'European Religious Studies Summer Schools',
      brand: 'Religion Summer Schools',
      headerTitle: 'European Religious Studies Summer Schools — Undergraduate Guide',
      verified: 'Verified on',
      searchPlaceholder: 'Search by name, host, keyword...',
      clearFilters: 'Clear filters',
      showing: 'Showing',
      of: '/',
      programmes: 'programmes',
      activeFilters: 'active filters',
      noResults: 'No programmes match your criteria.',
      expandAll: 'Expand all',
      collapseAll: 'Collapse all',
      host: 'Host',
      city: 'City',
      country: 'Country',
      dates: 'Dates',
      fee: 'Fee',
      language: 'Language',
      credit: 'Credits',
      deadline: 'Deadline',
      status: 'Status',
      mode: 'Mode',
      summary: 'Summary',
      admission: 'Admission',
      learning: 'Learning format',
      caution: 'Caution',
      sources: 'Sources',
      methods: 'Methods',
      filterEligibility: 'Eligibility',
      filterTrack: 'Track',
      filterCountry: 'Country',
      filterMode: 'Mode',
      filterStatus: 'Status',
      excludedTitle: 'Excluded programmes',
      excludedToggle: function (n) { return 'View ' + n + ' excluded programmes (not open to undergraduates)'; },
      excludedReason: 'Reason for exclusion',
      footer: 'Data sourced from official university websites. Verify with organisers before applying.',
      footerLink: 'Back to main site'
    }
  };

  /* ── trilingual mappings ── */
  var TRACKS = {
    '宗教学研究':   { zh: '宗教学研究', fr: 'Études religieuses', en: 'Religious Studies' },
    '神学与经文':   { zh: '神学与经文', fr: 'Théologie et textes sacrés', en: 'Theology & Scripture' },
    '研究语言':     { zh: '研究语言', fr: 'Langues de recherche', en: 'Research Languages' },
    '跨宗教对话':   { zh: '跨宗教对话', fr: 'Dialogue interreligieux', en: 'Interfaith Dialogue' },
    '学术入门':     { zh: '学术入门', fr: 'Introduction académique', en: 'Academic Introduction' }
  };

  var ELIGIBILITY = {
    explicit: { zh: '明确接受本科', fr: 'Licence acceptée', en: 'Undergrad accepted' },
    open:     { zh: '学生／成人开放', fr: 'Ouvert aux étudiants / adultes', en: 'Open to students / adults' },
    pending:  { zh: '本科待确认', fr: 'À confirmer', en: 'To be confirmed' }
  };

  var COUNTRIES = {
    '荷兰': { zh: '荷兰', fr: 'Pays-Bas', en: 'Netherlands' },
    '丹麦': { zh: '丹麦', fr: 'Danemark', en: 'Denmark' },
    '瑞士': { zh: '瑞士', fr: 'Suisse', en: 'Switzerland' },
    '波黑': { zh: '波黑', fr: 'Bosnie-Herzégovine', en: 'Bosnia & Herzegovina' },
    '黑山': { zh: '黑山', fr: 'Monténégro', en: 'Montenegro' },
    '奥地利': { zh: '奥地利', fr: 'Autriche', en: 'Austria' },
    '英国': { zh: '英国', fr: 'Royaume-Uni', en: 'United Kingdom' },
    '法国': { zh: '法国', fr: 'France', en: 'France' },
    '捷克': { zh: '捷克', fr: 'Tchéquie', en: 'Czechia' },
    '挪威': { zh: '挪威', fr: 'Norvège', en: 'Norway' }
  };

  var MODES = {
    '线上': { zh: '线上', fr: 'En ligne', en: 'Online' },
    '线下': { zh: '线下', fr: 'Présentiel', en: 'On-site' }
  };

  var STATUSES = {
    '2027 暂定': { zh: '2027 暂定', fr: '2027 provisoire', en: '2027 tentative' },
    '2026 往届': { zh: '2026 往届', fr: '2026 passé', en: '2026 past' },
    '更早往届':   { zh: '更早往届', fr: 'Édition antérieure', en: 'Earlier edition' },
    '届次待核实': { zh: '届次待核实', fr: 'Édition à vérifier', en: 'Edition unverified' }
  };

  /* French programme title mappings */
  var FR_TITLES = {
    'uva-esotericism': 'Mondes arcanes : nouvelles frontières en ésotérisme',
    'aarhus-buddhism': 'Bouddhisme mondial',
    'bern-conflicts': 'Conflits religieux et stratégies d\'adaptation',
    'utrecht-bible': 'Leadership divin ?! Politique, spiritualité et la Bible',
    'cas-islam': 'L\'islam dans le monde contemporain',
    'hohenems-jewish': 'Université d\'été européenne d\'études juives',
    'salzburg-crossculture': 'Études religieuses interculturelles',
    'oxford-world': 'Trois grandes religions du monde',
    'oxford-theology': 'École d\'été de théologie d\'Oxford',
    'utrecht-oldcatholic': 'Théologie vieille-catholique : foi, histoire et praxis',
    'oxford-hebrew': 'École d\'été d\'hébreu biblique d\'Oxford',
    'pau-languages': 'Académie des langues anciennes',
    'bangor-intro': 'École d\'été de philosophie, éthique et religion',
    'olomouc-jewish': 'École d\'été d\'études juives',
    'groningen-cities': 'Religion dans les villes',
    'uco-art-bible': 'Art et Bible',
    'bergen-zor200': 'École d\'été d\'études zoroastriennes',
    'maastricht-culture': 'Religion et culture : repenser les frontières',
    'radboud-islam': 'Revisiter l\'islam et l\'Europe',
    'utrecht-ecumenical': 'Catholicité œcuménique : le témoignage vieux-catholique',
    'utrecht-anglican': 'L\'anglicanisme en perspective européenne',
    'oxford-ancient': 'Religion antique et les sens',
    'bristol-pali': 'École d\'été de pali',
    'cmcs-dialogue': 'École d\'été musulmane-chrétienne d\'Oxford'
  };

  /* methods translations */
  var METHODS_MAP = {
    '原典研读': { zh: '原典研读', fr: 'Lecture de textes originaux', en: 'Primary source reading' },
    '馆藏访问': { zh: '馆藏访问', fr: 'Visite de collections', en: 'Collection visit' },
    '实地访问': { zh: '实地访问', fr: 'Visite de terrain', en: 'Field visit' },
    '研究方法': { zh: '研究方法', fr: 'Méthodes de recherche', en: 'Research methods' },
    '案例分析': { zh: '案例分析', fr: 'Étude de cas', en: 'Case study' },
    '学生展示': { zh: '学生展示', fr: 'Présentation étudiante', en: 'Student presentation' },
    '学术讨论': { zh: '学术讨论', fr: 'Discussion académique', en: 'Academic discussion' },
    '跨学科研讨': { zh: '跨学科研讨', fr: 'Séminaire interdisciplinaire', en: 'Interdisciplinary seminar' },
    '学术论文': { zh: '学术论文', fr: 'Article académique', en: 'Academic paper' },
    '一对一辅导': { zh: '一对一辅导', fr: 'Tutorat individuel', en: 'One-on-one tutorial' },
    '专题研讨': { zh: '专题研讨', fr: 'Séminaire thématique', en: 'Thematic seminar' },
    '文献研读': { zh: '文献研读', fr: 'Lecture de textes', en: 'Text reading' },
    '语言强化': { zh: '语言强化', fr: 'Formation linguistique intensive', en: 'Intensive language training' },
    '原典工具': { zh: '原典工具', fr: 'Outils de textes originaux', en: 'Primary text tools' },
    '主题讲座': { zh: '主题讲座', fr: 'Conférence thématique', en: 'Thematic lecture' },
    '宗教史专题': { zh: '宗教史专题', fr: 'Histoire religieuse thématique', en: 'Religious history topic' },
    '艺术与经文': { zh: '艺术与经文', fr: 'Art et textes sacrés', en: 'Art & Scripture' },
    '课程作业': { zh: '课程作业', fr: 'Travaux de cours', en: 'Coursework' },
    '经典讨论': { zh: '经典讨论', fr: 'Discussion de textes classiques', en: 'Classics discussion' },
    '跨宗教交流': { zh: '跨宗教交流', fr: 'Échange interreligieux', en: 'Interfaith exchange' }
  };

  /* ══════════════════════════════════════
     STATE
     ══════════════════════════════════════ */
  var lang = document.documentElement.lang.slice(0, 2);
  var data = null;
  var filters = {
    search: '',
    eligibility: [],
    track: [],
    country: [],
    mode: [],
    status: []
  };
  var expandedCards = {};
  var params = new URLSearchParams(location.search);
  filters.search = params.get('q') || '';
  ['eligibility','track','country','mode','status'].forEach(function(key) {
    filters[key] = params.getAll(key);
  });
  (params.get('expanded') || '').split(',').filter(Boolean).forEach(function(id) { expandedCards[id] = true; });
  document.getElementById('search-input').value = filters.search;
  function persistView() {
    var url = new URL(location.href);
    filters.search ? url.searchParams.set('q', filters.search) : url.searchParams.delete('q');
    ['eligibility','track','country','mode','status'].forEach(function(key) {
      url.searchParams.delete(key);
      filters[key].forEach(function(value) { url.searchParams.append(key,value); });
    });
    var expanded = Object.keys(expandedCards).filter(function(id) { return expandedCards[id]; });
    expanded.length ? url.searchParams.set('expanded',expanded.join(',')) : url.searchParams.delete('expanded');
    history.replaceState(null,'',url);
  }

  /* ══════════════════════════════════════
     HELPERS
     ══════════════════════════════════════ */
  function t(key) { return UI[lang][key] || UI.zh[key] || key; }

  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function getTitle(p) {
    if (lang === 'zh') return p.title;
    if (lang === 'en') return p.name;
    return FR_TITLES[p.id] || p.name;
  }

  function getSubtitle(p) {
    if (lang === 'zh') return p.name;
    return p.name;
  }

  function getTrack(val) {
    var m = TRACKS[val];
    return m ? m[lang] : val;
  }

  function getEligibility(val) {
    var m = ELIGIBILITY[val];
    return m ? m[lang] : val;
  }

  function getCountry(val) {
    var m = COUNTRIES[val];
    return m ? m[lang] : val;
  }

  function getMode(val) {
    var m = MODES[val];
    return m ? m[lang] : val;
  }

  function getStatus(val) {
    var m = STATUSES[val];
    return m ? m[lang] : val;
  }

  function getMethod(val) {
    var m = METHODS_MAP[val];
    return m ? m[lang] : val;
  }

  function getScope() {
    if (lang === 'zh') return data.scope;
    if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS.scope && TRANSLATIONS.scope[lang]) return TRANSLATIONS.scope[lang];
    return data.scope;
  }

  /* get translated field for a programme */
  function pField(p, field) {
    if (lang === 'zh') return p[field] || '';
    if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS.programmes && TRANSLATIONS.programmes[p.id]) {
      var t = TRANSLATIONS.programmes[p.id][lang];
      if (t && t[field]) return t[field];
    }
    return p[field] || '';
  }

  /* get translated source label */
  function sourceLabel(p, idx) {
    if (lang === 'zh') return p.sources[idx].label;
    if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS.sources && TRANSLATIONS.sources[p.id]) {
      var s = TRANSLATIONS.sources[p.id][idx];
      if (s && s[lang]) return s[lang];
    }
    return p.sources[idx].label;
  }

  /* get translated excluded item */
  function exField(idx, field) {
    if (lang === 'zh') return data.excluded[idx][field] || '';
    if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS.excluded && TRANSLATIONS.excluded[idx]) {
      var t = TRANSLATIONS.excluded[idx][lang];
      if (t && t[field]) return t[field];
    }
    return data.excluded[idx][field] || '';
  }

  function statusBadgeClass(status) {
    if (status.indexOf('暂定') > -1) return 'badge-status-tentative';
    if (status === '2026 往届') return 'badge-status-past';
    if (status === '更早往届') return 'badge-status-older';
    if (status === '届次待核实') return 'badge-status-unverified';
    return 'badge-status-past';
  }

  /* ══════════════════════════════════════
     FILTERING
     ══════════════════════════════════════ */
  function matchesSearch(p, q) {
    if (!q) return true;
    var hay = [p.title, p.name, p.host, p.summary, p.city, p.track, getTitle(p), pField(p, 'summary'), getTrack(p.track)]
      .concat(p.countries, p.countries.map(getCountry))
      .join(' ').toLowerCase();
    var terms = q.toLowerCase().split(/\s+/);
    return terms.every(function (w) { return hay.indexOf(w) > -1; });
  }

  function matchesFilter(p) {
    if (filters.eligibility.length && filters.eligibility.indexOf(p.eligibility) === -1) return false;
    if (filters.track.length && filters.track.indexOf(p.track) === -1) return false;
    if (filters.country.length) {
      var hit = p.countries.some(function (c) { return filters.country.indexOf(c) > -1; });
      if (!hit) return false;
    }
    if (filters.mode.length && filters.mode.indexOf(p.mode) === -1) return false;
    if (filters.status.length && filters.status.indexOf(p.status) === -1) return false;
    return matchesSearch(p, filters.search);
  }

  function getFiltered() {
    if (!data) return [];
    return data.programmes.filter(matchesFilter);
  }

  function activeFilterCount() {
    return filters.eligibility.length + filters.track.length +
      filters.country.length + filters.mode.length + filters.status.length +
      (filters.search ? 1 : 0);
  }

  /* ══════════════════════════════════════
     COLLECT UNIQUE VALUES
     ══════════════════════════════════════ */
  function uniqueCountries() {
    var set = {};
    data.programmes.forEach(function (p) {
      p.countries.forEach(function (c) { set[c] = true; });
    });
    return Object.keys(set).sort();
  }

  function uniqueTracks() {
    var set = {};
    data.programmes.forEach(function (p) { set[p.track] = true; });
    return Object.keys(set);
  }

  function uniqueStatuses() {
    var set = {};
    data.programmes.forEach(function (p) { set[p.status] = true; });
    return Object.keys(set);
  }

  /* ══════════════════════════════════════
     RENDER
     ══════════════════════════════════════ */

  function renderHeader() {
    document.title = t('siteTitle');
    document.querySelector('meta[property="og:title"]').content = t('siteTitle');
    document.querySelector('meta[name=description]').content = getScope();
    document.querySelector('meta[property="og:description"]').content = getScope();
    document.getElementById('brand-link').textContent = t('brand');
    var hdr = document.getElementById('page-header');
    hdr.innerHTML =
      '<h1>' + esc(t('headerTitle')) + '</h1>' +
      '<p class="scope">' + esc(getScope()) + '</p>' +
      '<p class="verified">' + esc(t('verified')) + ' ' + esc(data.verified_on) + '</p>';
  }

  function renderControls() {
    document.getElementById('search-input').placeholder = t('searchPlaceholder');
    document.getElementById('search-input').setAttribute('aria-label', t('searchPlaceholder'));
    document.getElementById('btn-clear').textContent = t('clearFilters');

    var row = document.getElementById('filter-row');
    row.innerHTML = '';

    var filterDefs = [
      { key: 'eligibility', label: t('filterEligibility'), values: ['explicit', 'open', 'pending'], display: function (v) { return getEligibility(v); } },
      { key: 'track', label: t('filterTrack'), values: uniqueTracks(), display: function (v) { return getTrack(v); } },
      { key: 'country', label: t('filterCountry'), values: uniqueCountries(), display: function (v) { return getCountry(v); } },
      { key: 'mode', label: t('filterMode'), values: ['线上', '线下'], display: function (v) { return getMode(v); } },
      { key: 'status', label: t('filterStatus'), values: uniqueStatuses(), display: function (v) { return getStatus(v); } }
    ];

    filterDefs.forEach(function (fd) {
      var group = document.createElement('div');
      group.className = 'filter-group';

      var btn = document.createElement('button');
      btn.className = 'filter-btn' + (filters[fd.key].length ? ' has-active' : '');
      btn.textContent = fd.label + (filters[fd.key].length ? ' (' + filters[fd.key].length + ')' : '');

      var dd = document.createElement('div');
      dd.className = 'filter-dropdown';
      dd.innerHTML = fd.values.map(function (v) {
        var checked = filters[fd.key].indexOf(v) > -1 ? ' checked' : '';
        return '<label><input type="checkbox" value="' + esc(v) + '"' + checked + '> ' + esc(fd.display(v)) + '</label>';
      }).join('');

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        // close other dropdowns
        document.querySelectorAll('.filter-dropdown.open').forEach(function (el) {
          if (el !== dd) el.classList.remove('open');
        });
        dd.classList.toggle('open');
      });

      dd.addEventListener('change', function (e) {
        var val = e.target.value;
        var idx = filters[fd.key].indexOf(val);
        if (e.target.checked && idx === -1) filters[fd.key].push(val);
        if (!e.target.checked && idx > -1) filters[fd.key].splice(idx, 1);
        render();
      });

      group.appendChild(btn);
      group.appendChild(dd);
      row.appendChild(group);
    });
  }

  function renderStats(filtered) {
    var bar = document.getElementById('stats-bar');
    var total = data.programmes.length;
    var count = filtered.length;
    var fc = activeFilterCount();
    bar.innerHTML = '<span>' + t('showing') + ' <strong>' + count + '</strong>' + t('of') + '<strong>' + total + '</strong> ' + t('programmes') + '</span>' +
      (fc ? '<span>' + fc + ' ' + t('activeFilters') + '</span>' : '');
  }

  function renderCard(p) {
    var isExpanded = expandedCards[p.id];
    var cls = 'programme-card' + (isExpanded ? ' expanded' : '');
    var title = getTitle(p);
    var subtitle = getSubtitle(p);

    var badges = '<span class="badge badge-track">' + esc(getTrack(p.track)) + '</span> ' +
      '<span class="badge badge-' + p.eligibility + '">' + esc(getEligibility(p.eligibility)) + '</span> ' +
      '<span class="badge badge-' + (p.mode === '线上' ? 'online' : 'offline') + '">' + esc(getMode(p.mode)) + '</span>';

    if (p.new) badges += ' <span class="badge badge-new">' + (lang === 'zh' ? '新增' : lang === 'fr' ? 'Nouveau' : 'New') + '</span>';

    var countries = p.countries.map(function (c) { return getCountry(c); }).join(', ');

    var header =
      '<div class="card-header" role="button" tabindex="0" aria-expanded="' + Boolean(isExpanded) + '" data-id="' + p.id + '">' +
        '<div>' +
          '<div class="card-title">' + esc(title) + '</div>' +
          '<div class="card-subtitle">' + esc(subtitle) + '</div>' +
          '<div style="margin-bottom:8px">' + badges + '</div>' +
          '<div class="card-meta">' +
            '<span>' + esc(pField(p, 'host')) + '</span>' +
            '<span>' + esc(countries) + '</span>' +
            '<span>' + esc(pField(p, 'dates')) + '</span>' +
            '<span class="badge ' + statusBadgeClass(p.status) + '">' + esc(getStatus(p.status)) + '</span>' +
          '</div>' +
        '</div>' +
        '<span class="card-chevron">&#9654;</span>' +
      '</div>';

    var detailItems = [
      [t('dates'), pField(p, 'dates')],
      [t('fee'), pField(p, 'fee')],
      [t('language'), pField(p, 'language')],
      [t('credit'), pField(p, 'credit')],
      [t('deadline'), pField(p, 'deadline')],
      [t('mode'), getMode(p.mode)]
    ];

    var grid = '<dl class="detail-grid">' +
      detailItems.map(function (d) {
        return '<div><dt>' + esc(d[0]) + '</dt><dd>' + esc(d[1] || '—') + '</dd></div>';
      }).join('') + '</dl>';

    var sections = '';

    if (p.summary) {
      sections += '<div class="detail-section"><h4>' + esc(t('summary')) + '</h4><p>' + esc(pField(p, 'summary')) + '</p></div>';
    }
    if (p.admission) {
      sections += '<div class="detail-section"><h4>' + esc(t('admission')) + '</h4><p>' + esc(pField(p, 'admission')) + '</p></div>';
    }
    if (p.learning) {
      sections += '<div class="detail-section"><h4>' + esc(t('learning')) + '</h4><p>' + esc(pField(p, 'learning')) + '</p></div>';
    }
    if (p.caution) {
      sections += '<div class="detail-caution">' + esc(pField(p, 'caution')) + '</div>';
    }
    if (p.sources && p.sources.length) {
      sections += '<div class="detail-section"><h4>' + esc(t('sources')) + '</h4><div class="detail-sources">' +
        p.sources.map(function (s, si) {
          return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(sourceLabel(p, si)) + ' &#8599;</a>';
        }).join('') + '</div></div>';
    }
    if (p.methods && p.methods.length) {
      sections += '<div class="detail-section"><h4>' + esc(t('methods')) + '</h4><div class="methods-tags">' +
        p.methods.map(function (m) {
          return '<span>' + esc(getMethod(m)) + '</span>';
        }).join('') + '</div></div>';
    }

    var detail = '<div class="card-detail">' + grid + sections + '</div>';

    return '<div class="' + cls + '" data-id="' + p.id + '">' + header + detail + '</div>';
  }

  function renderCards(filtered) {
    var list = document.getElementById('card-list');
    if (!filtered.length) {
      list.innerHTML = '<div class="empty-state">' + esc(t('noResults')) + '</div>';
      return;
    }
    list.innerHTML = filtered.map(renderCard).join('');
  }

  function renderExcluded() {
    var sec = document.getElementById('excluded-section');
    if (!data.excluded || !data.excluded.length) { sec.innerHTML = ''; return; }

    var reasonLabel = t('excludedReason');
    sec.innerHTML =
      '<button class="excluded-toggle" id="excl-toggle">' + t('excludedToggle')(data.excluded.length) + '</button>' +
      '<div class="excluded-list" id="excl-list">' +
        data.excluded.map(function (ex, ei) {
          return '<div class="excluded-item">' +
            '<strong>' + esc(exField(ei, 'title')) + '</strong>' +
            '<div class="reason">' + esc(reasonLabel) + ': ' + esc(exField(ei, 'reason')) + '</div>' +
            (ex.url ? '<a href="' + esc(ex.url) + '" target="_blank" rel="noopener">' + esc(exField(ei, 'label') || 'Source') + ' &#8599;</a>' : '') +
          '</div>';
        }).join('') +
      '</div>';

    document.getElementById('excl-toggle').addEventListener('click', function () {
      document.getElementById('excl-list').classList.toggle('open');
    });
  }

  function renderFooter() {
    document.getElementById('foot').innerHTML =
      esc(t('footer')) + '<br>' +
      '<a href="https://zhaoyang.fr/">' + esc(t('footerLink')) + '</a>';
  }

  function render() {
    persistView();
    var filtered = getFiltered();
    renderHeader();
    renderControls();
    renderStats(filtered);
    renderCards(filtered);
    renderExcluded();
    renderFooter();
  }

  /* ══════════════════════════════════════
     EVENTS
     ══════════════════════════════════════ */

  // language switcher
  document.getElementById('lang-sw').addEventListener('click', function (e) {
    var control = e.target.closest('[data-lang]');
    if (!control) return;
    e.preventDefault();
    lang = control.getAttribute('data-lang');
    document.querySelectorAll('#lang-sw [data-lang]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
    var url = new URL(location.href);
    url.pathname = '/summer-schools-religion/' + lang + '/';
    history.replaceState(null, '', url);
    document.querySelector('link[rel=canonical]').href = url.origin + url.pathname;
    document.querySelector('meta[property="og:url"]').content = url.origin + url.pathname;
    render();
  });

  document.getElementById('card-list').addEventListener('keydown', function(e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.card-header')) { e.preventDefault(); e.target.click(); }
  });

  // search
  document.getElementById('search-input').addEventListener('input', function (e) {
    filters.search = e.target.value.trim();
    persistView();
    var filtered = getFiltered();
    renderStats(filtered);
    renderCards(filtered);
  });

  // clear
  document.getElementById('btn-clear').addEventListener('click', function () {
    filters = { search: '', eligibility: [], track: [], country: [], mode: [], status: [] };
    document.getElementById('search-input').value = '';
    render();
  });

  // card expand/collapse
  document.getElementById('card-list').addEventListener('click', function (e) {
    var header = e.target.closest('.card-header');
    if (!header) return;
    var id = header.getAttribute('data-id');
    expandedCards[id] = !expandedCards[id];
    persistView();
    var card = header.closest('.programme-card');
    card.classList.toggle('expanded');
    header.setAttribute('aria-expanded', String(Boolean(expandedCards[id])));
  });

  // close dropdowns on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.filter-group')) {
      document.querySelectorAll('.filter-dropdown.open').forEach(function (el) {
        el.classList.remove('open');
      });
    }
  });

  /* ══════════════════════════════════════
     INIT
     ══════════════════════════════════════ */
  fetch('/summer-schools-religion/data.json')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      data = d;
      render();
      document.dispatchEvent(new Event('guide-ready'));
    })
    .catch(function () {
      document.getElementById('card-list').innerHTML =
        '<div class="empty-state">' + ({en:'Could not load the directory. Please refresh.',fr:'Impossible de charger le répertoire. Veuillez actualiser la page.',zh:'目录加载失败，请刷新重试。'})[lang] + '</div>';
    });
})();
