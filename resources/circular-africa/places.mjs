// Places on the map: names, roles, figures (all from the report and the directory) and which
// report text each place panel shows. Text blocks point at English strings by prefix or at table
// cells; build.mjs resolves them to the translated strings.

export const VIEW_OF = {
  ghana: 'ghana', enchi: 'ghana', parcel: 'ghana', sunyani: 'ghana',
  accra: 'accra', circle: 'accra', kantamanto: 'accra', 'old-fadama': 'accra', 'osu-nima-airport': 'accra', legon: 'accra', tema: 'accra', kpone: 'accra',
  kumasi: 'kumasi', adum: 'kumasi', kejetia: 'kumasi', aboabo: 'kumasi', ejisu: 'kumasi',
  'cote-divoire': 'cote-divoire', nigeria: 'nigeria', kenya: 'kenya', 'south-africa': 'south-africa', morocco: 'morocco', cameroon: 'cameroon',
};
export const PARENT = {
  ghana: null, 'cote-divoire': null, nigeria: null, kenya: null, 'south-africa': null, morocco: null, cameroon: null,
  accra: 'ghana', kumasi: 'ghana', enchi: 'ghana', parcel: 'ghana', sunyani: 'ghana',
  circle: 'accra', kantamanto: 'accra', 'old-fadama': 'accra', 'osu-nima-airport': 'accra', legon: 'accra', tema: 'accra', kpone: 'accra',
  adum: 'kumasi', kejetia: 'kumasi', aboabo: 'kumasi', ejisu: 'kumasi',
};
export const CHILDREN = {
  ghana: ['accra', 'kumasi', 'parcel', 'enchi', 'sunyani'],
  accra: ['circle', 'kantamanto', 'old-fadama', 'osu-nima-airport', 'legon', 'tema', 'kpone'],
  kumasi: ['adum', 'kejetia', 'aboabo', 'ejisu'],
};
export const CHIPS = ['ghana', 'accra', 'kumasi', 'cote-divoire', 'nigeria', 'kenya', 'south-africa', 'morocco', 'cameroon'];

// Markers: map point, label, which views show it, and the place it opens.
export const MARKERS = [
  { pt: 'accra', go: 'accra', views: ['africa', 'cote-divoire', 'nigeria', 'cameroon', 'ghana'], primary: true, dx: 7, dy: 15 },
  { pt: 'kumasi', go: 'kumasi', views: ['africa', 'cote-divoire', 'nigeria', 'cameroon', 'ghana'], primary: true, dx: -7, dy: -7, anchor: 'end' },
  { pt: 'abidjan', go: 'cote-divoire', views: ['africa', 'cote-divoire', 'nigeria', 'cameroon'], dx: -7, dy: 13, anchor: 'end' },
  { pt: 'lagos', go: 'nigeria', views: ['africa', 'cote-divoire', 'nigeria', 'cameroon'], dx: 6, dy: -7 },
  { pt: 'douala', go: 'cameroon', views: ['africa', 'nigeria', 'cameroon'], dx: 7, dy: 13 },
  { pt: 'nairobi', go: 'kenya', views: ['africa', 'kenya'], dx: 8, dy: 4 },
  { pt: 'casablanca', go: 'morocco', views: ['africa', 'morocco'], dx: 8, dy: 4 },
  { pt: 'enchi', go: 'enchi', views: ['ghana'], dx: -7, dy: 4, anchor: 'end' },
  { pt: 'sunyani', go: 'sunyani', views: ['ghana'], dx: 7, dy: 4 },
  { pt: 'circle', go: 'circle', views: ['accra'], primary: true, dx: -9, dy: -6, anchor: 'end' },
  { pt: 'kantamanto', go: 'kantamanto', views: ['accra'], primary: true, dx: 8, dy: 15 },
  { pt: 'old-fadama', go: 'old-fadama', views: ['accra'], dx: -9, dy: 14, anchor: 'end' },
  { pt: 'osu-nima-airport', go: 'osu-nima-airport', views: ['accra'], dx: 9, dy: 4 },
  { pt: 'legon', go: 'legon', views: ['accra'], dx: 9, dy: 4 },
  { pt: 'tema', go: 'tema', views: ['accra'], dx: -2, dy: 18, anchor: 'middle' },
  { pt: 'kpone', go: 'kpone', views: ['accra'], dx: 2, dy: -10, anchor: 'middle' },
  { pt: 'adum', go: 'adum', views: ['kumasi'], primary: true, dx: -9, dy: 14, anchor: 'end' },
  { pt: 'kejetia', go: 'kejetia', views: ['kumasi'], dx: -9, dy: -6, anchor: 'end' },
  { pt: 'aboabo', go: 'aboabo', views: ['kumasi'], dx: 9, dy: -6 },
  { pt: 'ejisu', go: 'ejisu', views: ['kumasi'], dx: 0, dy: 18, anchor: 'middle' },
];

// Report and directory text per place. Kinds: p (paragraph by English prefix), cells (table, row, columns),
// opp (opportunity id), company (company id), entry (directory entry id).
export const BLOCKS = {
  ghana: [{ p: 'Start at **Kwame Nkrumah Circle, Accra**', chapter: 'summary' }],
  'cote-divoire': [{ p: '**Côte d’Ivoire · Abidjan.**', chapter: 'comparison' }, { cells: ['continental', 0, [1, 2]] }],
  nigeria: [{ p: 'GSMA’s consumer survey found', chapter: 'comparison' }, { cells: ['continental', 0, [1, 2]] }],
  kenya: [{ p: '**Kenya · Nairobi.**', chapter: 'comparison' }, { cells: ['continental', 1, [1, 2]] }],
  'south-africa': [{ p: '**South Africa · urban fashion resale.**', chapter: 'comparison' }, { p: '**Evidence that surplus can sell.**', chapter: 'continental' }, { cells: ['continental', 2, [1, 2]] }],
  morocco: [{ cells: ['continental', 3, [1, 2]] }],
  cameroon: [{ cells: ['continental', 4, [1, 2]] }],
  accra: [{ row: ['where-to-start', 0] }, { row: ['where-to-start', 1] }, { row: ['where-to-start', 3] }],
  kumasi: [{ row: ['where-to-start', 2] }, { row: ['where-to-start', 4] }],
  circle: [{ cells: ['where-to-start', 0, [1, 2]], chapter: 'handset' }, { cells: ['denominators', 3, [1, 2]] }],
  kantamanto: [{ cells: ['where-to-start', 1, [1, 2]], chapter: 'bale' }, { p: '**An observed loss.**', chapter: 'bale' }, { cells: ['handover', 5, [1, 2]] }],
  'old-fadama': [{ cells: ['denominators', 1, [1, 2]], chapter: 'denominators' }],
  'osu-nima-airport': [{ p: '**Local phone supply.**', chapter: 'cases' }],
  legon: [{ opp: 'O08' }],
  tema: [{ opp: 'O11' }],
  kpone: [{ p: '**A practical inclusion rule.**', chapter: 'impact' }, { entry: 'S049-02' }],
  adum: [{ cells: ['where-to-start', 2, [1, 2]], chapter: 'fieldwork' }, { p: '**Kumasi, October 2019.**', chapter: 'fieldwork' }],
  kejetia: [{ cells: ['unknowns', 2, [1, 2]], chapter: 'unknowns' }],
  aboabo: [{ company: 'C04' }],
  ejisu: [{ p: '**Three routes for surplus food.**', chapter: 'cases' }],
  sunyani: [{ opp: 'O12' }],
  enchi: [{ p: '**Kumasi, October 2019.**', chapter: 'fieldwork' }, { p: '**1 · Buyers already pay for trust.**', chapter: 'summary' }],
  parcel: [{ p: '**Payments and delivery.**', chapter: 'impact' }],
};
export const EVENTS = {
  ghana: ['E01', 'E02', 'E05', 'E06', 'E09', 'E10', 'E12', 'E15', 'E16', 'E17', 'E20', 'E23'],
  kenya: ['E03', 'E11', 'E13', 'E14', 'E19'], 'cote-divoire': ['E07', 'E18'], 'south-africa': ['E08', 'E22'], nigeria: ['E21'],
  accra: ['R05', 'R09'], kumasi: ['R06', 'R08'],
  kantamanto: ['E05', 'E10', 'E12', 'E15', 'E16', 'E20', 'R02', 'R03', 'R09'], circle: ['E02', 'R05'], 'old-fadama': ['E17', 'R05'],
  tema: ['E23'], adum: ['R01'], enchi: ['R01'], ejisu: ['R08'],
};
export const REGION = { ghana: 'ghana', kenya: 'kenya', 'cote-divoire': 'cote-divoire', 'south-africa': 'south-africa', nigeria: 'nigeria', morocco: 'morocco', cameroon: 'cameroon' };
export const SEARCH = { accra: 'Accra', kumasi: 'Kumasi', kantamanto: 'Kantamanto', circle: 'Circle', tema: 'Tema', legon: 'Legon', kpone: 'Kpone', aboabo: 'Aboabo' };

const L = (en, es, zh) => ({ en, es, zh });
export const NAMES = {
  ghana: L('Ghana', 'Ghana', '加纳'), 'cote-divoire': L('Côte d’Ivoire', 'Costa de Marfil', '科特迪瓦'), nigeria: L('Nigeria', 'Nigeria', '尼日利亚'),
  kenya: L('Kenya', 'Kenia', '肯尼亚'), 'south-africa': L('South Africa', 'Sudáfrica', '南非'), morocco: L('Morocco', 'Marruecos', '摩洛哥'), cameroon: L('Cameroon', 'Camerún', '喀麦隆'),
  accra: L('Accra', 'Acra', '阿克拉'), kumasi: L('Kumasi', 'Kumasi', '库马西'), abidjan: L('Abidjan', 'Abiyán', '阿比让'), lagos: L('Lagos', 'Lagos', '拉各斯'),
  douala: L('Douala', 'Duala', '杜阿拉'), nairobi: L('Nairobi', 'Nairobi', '内罗毕'), casablanca: L('Casablanca', 'Casablanca', '卡萨布兰卡'),
  circle: L('Kwame Nkrumah Circle', 'Kwame Nkrumah Circle', 'Kwame Nkrumah Circle'), kantamanto: L('Kantamanto', 'Kantamanto', 'Kantamanto'),
  'old-fadama': L('Old Fadama', 'Old Fadama', 'Old Fadama'), 'osu-nima-airport': L('Osu · Nima · Airport', 'Osu · Nima · Airport', 'Osu · Nima · Airport'),
  legon: L('Legon', 'Legon', 'Legon'), tema: L('Tema', 'Tema', '特马'), kpone: L('Kpone', 'Kpone', 'Kpone'),
  adum: L('Adum', 'Adum', 'Adum'), kejetia: L('Kejetia · Asafo', 'Kejetia · Asafo', 'Kejetia · Asafo'), aboabo: L('Aboabo', 'Aboabo', 'Aboabo'), ejisu: L('Ejisu', 'Ejisu', 'Ejisu'),
  sunyani: L('Sunyani', 'Sunyani', '苏尼亚尼'), enchi: L('Enchi to Kumasi', 'De Enchi a Kumasi', '从 Enchi 到库马西'), parcel: L('Accra–Kumasi parcels', 'Paquetes Acra–Kumasi', '阿克拉到库马西的包裹'),
};
const country = L('Comparison market', 'Mercado de comparación', '比较市场');
export const ROLES = {
  ghana: L('Primary market', 'Mercado principal', '主要市场'), 'cote-divoire': L('Francophone comparison', 'Comparación francófona', '法语区对照'),
  nigeria: L('Comparator', 'Comparador', '参照市场'), kenya: L('Depth market: repairs', 'Mercado de profundidad: reparaciones', '深入对照：维修'),
  'south-africa': L('Depth market: protected delivery', 'Mercado de profundidad: envío protegido', '深入对照：有保障的配送'),
  morocco: L('Directional scan', 'Exploración orientativa', '方向性扫描'), cameroon: L('Directional scan', 'Exploración orientativa', '方向性扫描'),
  accra: L('First city to visit', 'Primera ciudad', '第一站'), kumasi: L('Comparison city', 'Ciudad de comparación', '对照城市'),
  circle: L('Phone market', 'Mercado de teléfonos', '手机市场'), kantamanto: L('Second-hand clothing market', 'Mercado de ropa usada', '二手衣物市场'),
  'old-fadama': L('E-waste collection', 'Recogida de residuos electrónicos', '电子废弃物收集'), 'osu-nima-airport': L('Household survey', 'Encuesta a hogares', '住户调查'),
  legon: L('Open tender', 'Licitación abierta', '公开招标'), tema: L('Open tender', 'Licitación abierta', '公开招标'), kpone: L('Waste pickers', 'Recicladores', '拾荒者'),
  adum: L('Phone repair', 'Reparación de teléfonos', '手机维修'), kejetia: L('Food markets', 'Mercados de alimentos', '食品市场'), aboabo: L('Repair workshop', 'Taller de reparación', '维修作坊'),
  ejisu: L('Produce traders', 'Comerciantes de productos frescos', '农产品商户'), sunyani: L('Exhibition', 'Exposición', '展会'),
  enchi: L('Warranty trip, 2019', 'Viaje por garantía, 2019', '保修之行，2019 年'), parcel: L('Parcel route', 'Ruta de paquetería', '包裹线路'),
};
void country;

export const FIGURES = {
  ghana: {
    en: [['USD 115.28m', 'worn-clothing imports reported for 2025 (WITS)'], ['27.1m', 'active mobile-money accounts, Oct 2026 (Bank of Ghana)'], ['72 kt', 'e-waste generated in 2022 (Global E-waste Monitor)'], ['127', 'repair centres counted at Circle']],
    es: [['USD 115.28 millones', 'importaciones de ropa usada declaradas en 2025 (WITS)'], ['27.1 millones', 'cuentas activas de dinero móvil, oct 2026 (Bank of Ghana)'], ['72 000 t', 'residuos electrónicos generados en 2022 (Global E-waste Monitor)'], ['127', 'centros de reparación contados en Circle']],
    zh: [['115.28 百万美元', '2025 年申报的旧衣物进口额（WITS）'], ['27.1 百万', '2026 年 10 月活跃移动货币账户（Bank of Ghana）'], ['7.2 万吨', '2022 年产生的电子废弃物（Global E-waste Monitor）'], ['127', 'Circle 统计到的维修中心']],
  },
  'cote-divoire': {
    en: [['117,000 FCFA', 'iPhone 11 128 GB ask, Abidjan, 16 Oct 2025'], ['115,000 FCFA', 'same seller and model, 24 Oct 2025']],
    es: [['117,000 FCFA', 'precio pedido por un iPhone 11 128 GB, Abiyán, 16 oct 2025'], ['115,000 FCFA', 'mismo vendedor y modelo, 24 oct 2025']],
    zh: [['FCFA 117,000', '阿比让 iPhone 11 128 GB 挂牌价，2025 年 10 月 16 日'], ['FCFA 115,000', '同一卖家、同一型号，2025 年 10 月 24 日']],
  },
  nigeria: {
    en: [['18%', 'of surveyed Nigerian consumers bought their current phone used (GSMA)']],
    es: [['18 %', 'de los consumidores nigerianos encuestados compró usado su teléfono actual (GSMA)']],
    zh: [['18%', '受访尼日利亚消费者现用手机为二手购入的比例（GSMA）']],
  },
  kenya: {
    en: [['250,527 t', 'second-hand clothing imports, 2025 (KNBS)'], ['183,830 t', 'the same in 2021'], ['KSh 30.26bn', 'import value, 2025']],
    es: [['250,527 t', 'importaciones de ropa de segunda mano, 2025 (KNBS)'], ['183,830 t', 'la misma cifra en 2021'], ['KSh 30.26 mil millones', 'valor de las importaciones, 2025']],
    zh: [['250,527 吨', '2025 年二手衣物进口量（KNBS）'], ['183,830 吨', '2021 年同一指标'], ['KSh 30.26 十亿', '2025 年进口额']],
  },
  'south-africa': {
    en: [['~5%', 'usual Yaga buyer fee, plus a fixed amount'], ['23,200', 'paid surprise bags or more, 50 SPAR-format stores, Apr 2025–Jul 2026'], ['14%', 'of surveyed South Africans bought their current phone used (GSMA)']],
    es: [['~5 %', 'comisión habitual de Yaga al comprador, más un importe fijo'], ['23,200', 'bolsas sorpresa pagadas como mínimo, 50 tiendas de formato SPAR, abr 2025–jul 2026'], ['14 %', 'de los sudafricanos encuestados compró usado su teléfono actual (GSMA)']],
    zh: [['约 5%', 'Yaga 通常向买家收取的费用，另加固定金额'], ['23,200', '袋以上付费惊喜袋，50 家 SPAR 门店，2025 年 4 月至 2026 年 7 月'], ['14%', '受访南非人现用手机为二手购入的比例（GSMA）']],
  },
  cameroon: {
    en: [['73,008 t', 'friperie imports, 2025 (INS)'], ['72,600 t', 'the same in 2024'], ['CFA 42.543bn', 'nominal value, 2025']],
    es: [['73,008 t', 'importaciones de friperie, 2025 (INS)'], ['72,600 t', 'la misma cifra en 2024'], ['CFA 42.543 mil millones', 'valor nominal, 2025']],
    zh: [['73,008 吨', '2025 年 friperie 进口量（INS）'], ['72,600 吨', '2024 年同一指标'], ['CFA 42.543 十亿', '2025 年名义值']],
  },
  accra: {
    en: [['GHS 95', 'Jibu 18.9 L bottle, new'], ['GHS 22', 'the same bottle, refill']],
    es: [['GHS 95', 'garrafón Jibu de 18.9 L, nuevo'], ['GHS 22', 'el mismo garrafón, recarga']],
    zh: [['GHS 95', 'Jibu 18.9 L 新水桶'], ['GHS 22', '同一水桶续装']],
  },
  kumasi: {
    en: [['23.8%', 'of bale weight classified as textile waste (621 shops, 279 bales)'], ['376', 'tomato and cocoyam-leaf traders studied in five markets and Ejisu']],
    es: [['23.8 %', 'del peso de los fardos clasificado como residuo textil (621 tiendas, 279 fardos)'], ['376', 'comerciantes de tomate y hojas de cocoyam estudiados en cinco mercados y Ejisu']],
    zh: [['23.8%', '原包重量被归为纺织废料的比例（621 家店，279 个原包）'], ['376', '五个市场和 Ejisu 受访的番茄和芋叶商户']],
  },
  circle: {
    en: [['127', 'repair centres'], ['47', 'phone and accessory vendors'], ['Over 200', 'itinerant vendors'], ['GHS 2,950', 'Valmont ask for a used iPhone 12 128 GB']],
    es: [['127', 'centros de reparación'], ['47', 'vendedores de teléfonos y accesorios'], ['Más de 200', 'vendedores ambulantes'], ['GHS 2,950', 'precio pedido por Valmont por un iPhone 12 128 GB usado']],
    zh: [['127', '家维修中心'], ['47', '家手机和配件商'], ['200 多', '名流动商贩'], ['GHS 2,950', 'Valmont 二手 iPhone 12 128 GB 挂牌价']],
  },
  kantamanto: {
    en: [['GHS 2,200', 'paid for one bale of 193 jeans and trousers, Oct 2023'], ['99 of 193', 'pieces rejected at opening'], ['GHS 100', 'annual operating permit per shop from 11 May 2026']],
    es: [['GHS 2,200', 'pagados por un fardo de 193 vaqueros y pantalones, oct 2023'], ['99 de 193', 'piezas rechazadas en la apertura'], ['GHS 100', 'permiso anual por tienda desde el 11 may 2026']],
    zh: [['GHS 2,200', '一包 193 条牛仔裤和长裤的进价，2023 年 10 月'], ['99 / 193', '开包时剔除的件数'], ['GHS 100', '2026 年 5 月 11 日起每店每年的经营许可费']],
  },
  'old-fadama': {
    en: [['275.59 t', 'procured in 2024 by the incentive pilot, including batteries, plastics and cables']],
    es: [['275.59 t', 'adquiridas en 2024 por el piloto de incentivos, incluidas baterías, plásticos y cables']],
    zh: [['275.59 吨', '激励试点 2024 年的收购量，含电池、塑料和电缆']],
  },
  'osu-nima-airport': {
    en: [['61%', 'of 269 respondents said they would not buy used']],
    es: [['61 %', 'de 269 personas encuestadas dijo que no compraría usado']],
    zh: [['61%', '269 名受访者中表示不会买二手的比例']],
  },
  legon: {
    en: [['GHS 500', 'participation fee'], ['17 Dec 2026', 'bid deadline, 11:00 GMT']],
    es: [['GHS 500', 'tasa de participación'], ['17 dic 2026', 'cierre de ofertas, 11:00 GMT']],
    zh: [['GHS 500', '投标参与费'], ['12 月 17 日', '2026 年投标截止，11:00 GMT']],
  },
  tema: {
    en: [['GHS 200', 'participation fee'], ['10 or 14 Dec', 'two deadlines in the official notices']],
    es: [['GHS 200', 'tasa de participación'], ['10 o 14 dic', 'dos plazos en los avisos oficiales']],
    zh: [['GHS 200', '投标参与费'], ['12 月 10 日或 14 日', '官方公告里的两个截止日期']],
  },
  adum: {
    en: [['GHS 400', 'Tecno handset bought in Adum, 2019'], ['GHS 70', 'bus fare for both legs of one warranty trip']],
    es: [['GHS 400', 'teléfono Tecno comprado en Adum, 2019'], ['GHS 70', 'pasaje de ida y vuelta para un viaje por garantía']],
    zh: [['GHS 400', '2019 年在 Adum 买的 Tecno 手机'], ['GHS 70', '一次保修往返的车费']],
  },
  enchi: {
    en: [['7½ h', 'each way, Enchi to Kumasi'], ['GHS 35', 'bus fare per leg'], ['17.5%', 'of the handset price spent on transport']],
    es: [['7½ h', 'por trayecto, de Enchi a Kumasi'], ['GHS 35', 'pasaje por trayecto'], ['17.5 %', 'del precio del teléfono gastado en transporte']],
    zh: [['7½ 小时', 'Enchi 到库马西单程'], ['GHS 35', '单程车费'], ['17.5%', '交通费占手机价格的比例']],
  },
  parcel: {
    en: [['GHS 35', 'office to office'], ['GHS 50', 'with collection and doorstep delivery'], ['24–72 h', 'quoted delivery time']],
    es: [['GHS 35', 'de oficina a oficina'], ['GHS 50', 'con recogida y entrega a domicilio'], ['24–72 h', 'plazo de entrega indicado']],
    zh: [['GHS 35', '网点到网点'], ['GHS 50', '上门取件并送货上门'], ['24–72 小时', '报价中的送达时间']],
  },
  sunyani: {
    en: [['30 Nov–4 Dec 2026', 'NAFAGRO and National Farmers’ Day exhibition']],
    es: [['30 nov–4 dic 2026', 'NAFAGRO y exposición del National Farmers’ Day']],
    zh: [['11 月 30 日至 12 月 4 日', '2026 年 NAFAGRO 与全国农民节展会']],
  },
  ejisu: {
    en: [['376', 'traders studied in five Kumasi markets and Ejisu']],
    es: [['376', 'comerciantes estudiados en cinco mercados de Kumasi y Ejisu']],
    zh: [['376', '库马西五个市场和 Ejisu 受访的商户']],
  },
};

export const EXPLORE_UI = {
  en: { onMap: 'On the map', all: 'Show all of Africa', close: 'Close', events: 'Dated events', inDirectory: n => `${n} directory entries`, search: q => `Search the directory for ${q}`, report: 'In the report', inside: 'Places here', scale: 'km', mapLabel: 'Map of Africa. Select a country or a city.' },
  es: { onMap: 'En el mapa', all: 'Ver toda África', close: 'Cerrar', events: 'Hechos fechados', inDirectory: n => `${n} entradas del directorio`, search: q => `Buscar ${q} en el directorio`, report: 'En el informe', inside: 'Lugares', scale: 'km', mapLabel: 'Mapa de África. Seleccione un país o una ciudad.' },
  zh: { onMap: '地图上的地点', all: '回到全非洲', close: '关闭', events: '带日期的事件', inDirectory: n => `目录中的 ${n} 个条目`, search: q => `在目录中搜索 ${q}`, report: '报告中的章节', inside: '这里的地点', scale: '公里', mapLabel: '非洲地图，可选择国家或城市。' },
};
