// Builds the map data for /guides/circular-africa/.
//   cd <scratch folder with node_modules and data> && node <repo>/resources/circular-africa/map/gen.mjs <repo>/resources/circular-africa/assets
// Inputs in the working folder:
//   node_modules: world-atlas@2.0.2, topojson-client@3.1.0, d3-geo@3.1.1
//   ne/ne_50m_lakes.geojson, ne/ne_50m_rivers_lake_centerlines.geojson, ne/ne_10m_lakes.geojson,
//   ne/ne_10m_rivers_lake_centerlines.geojson (Natural Earth 5.1.2, public domain)
//   gb-gha-adm1.geojson (geoBoundaries gbOpen GHA ADM1, 16 regions, from OpenStreetMap)
//   osm/accra.json, osm/kumasi.json, osm/ghana.json (Overpass API extracts, © OpenStreetMap contributors, ODbL)
//   osm/route-accra-kumasi.json, osm/route-enchi-kumasi.json (OSRM driving routes on OpenStreetMap data)
// Outputs: map.json (continent, inlined in the page) and map-detail.json (Ghana, Accra, Kumasi; loaded on zoom).
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import * as topo from 'topojson-client';
import { geoAzimuthalEqualArea, geoPath, geoBounds, geoDistance, geoContains, geoCentroid, geoArea } from 'd3-geo';

const require = createRequire(import.meta.url);
const out = process.argv[2];
const read = f => JSON.parse(readFileSync(f, 'utf8'));
const w110 = require('world-atlas/countries-110m.json'), w50 = require('world-atlas/countries-50m.json'), w10 = require('world-atlas/countries-10m.json');
const feats = w => topo.feature(w, w.objects.countries).features;
// ISO 3166 numeric -> alpha-2 for the African countries (labels come from Intl.DisplayNames at build time).
const A2 = { '012': 'DZ', '024': 'AO', '204': 'BJ', '072': 'BW', '854': 'BF', '108': 'BI', '132': 'CV', '120': 'CM', '140': 'CF', '148': 'TD', '174': 'KM', '178': 'CG', '180': 'CD', '384': 'CI', '262': 'DJ', '818': 'EG', '226': 'GQ', '232': 'ER', '748': 'SZ', '231': 'ET', '266': 'GA', '270': 'GM', '288': 'GH', '324': 'GN', '624': 'GW', '404': 'KE', '426': 'LS', '430': 'LR', '434': 'LY', '450': 'MG', '454': 'MW', '466': 'ML', '478': 'MR', '480': 'MU', '504': 'MA', '508': 'MZ', '516': 'NA', '562': 'NE', '566': 'NG', '646': 'RW', '678': 'ST', '686': 'SN', '690': 'SC', '694': 'SL', '706': 'SO', '710': 'ZA', '728': 'SS', '729': 'SD', '834': 'TZ', '768': 'TG', '788': 'TN', '800': 'UG', '894': 'ZM', '716': 'ZW', '732': 'EH' };
const africa110 = feats(w110).filter(f => A2[f.id] || f.properties.name === 'Somaliland');
const africa50 = feats(w50).filter(f => A2[f.id] || f.properties.name === 'Somaliland');
const by10 = new Map(feats(w10).map(f => [f.id, f]));
const W = 600, H = 640;
const proj = geoAzimuthalEqualArea().rotate([-17, -3]).fitExtent([[10, 10], [W - 10, H - 10]], { type: 'FeatureCollection', features: africa110 });
const P = c => proj(c);

// ---- geometry helpers: project, simplify (Douglas-Peucker on projected points), serialise ----
function dp(points, tol) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length); keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let max = 0, idx = -1;
    const [x1, y1] = points[a], [x2, y2] = points[b], dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    for (let i = a + 1; i < b; i++) {
      // A closed ring starts and ends on the same point: measure from that point instead of a zero-length segment.
      const d = len < 1e-9 ? Math.hypot(points[i][0] - x1, points[i][1] - y1) : Math.abs(dy * points[i][0] - dx * points[i][1] + x2 * y1 - y2 * x1) / len;
      if (d > max) { max = d; idx = i; }
    }
    if (max > tol) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return points.filter((_, i) => keep[i]);
}
const fx = (v, n) => { const s = v.toFixed(n); return s.includes('.') ? s.replace(/\.?0+$/, '') : s; };
function line(coords, tol, n, closed = false) {
  const pts = dp(coords.map(P), tol);
  if (pts.length < 2) return '';
  return 'M' + pts.map(p => `${fx(p[0], n)} ${fx(p[1], n)}`).join('L') + (closed ? 'Z' : '');
}
function geomPath(g, tol, n) {
  if (!g) return '';
  if (g.type === 'Polygon') return g.coordinates.map(r => line(r, tol, n, true)).join('');
  if (g.type === 'MultiPolygon') return g.coordinates.flat().map(r => line(r, tol, n, true)).join('');
  if (g.type === 'LineString') return line(g.coordinates, tol, n);
  if (g.type === 'MultiLineString') return g.coordinates.map(c => line(c, tol, n)).join('');
  return '';
}
const r1 = d => d.replace(/-?\d+\.\d+/g, m => fx(+m, 1));
const path = geoPath(proj);
const inBox = (lon, lat, [x0, y0, x1, y1]) => lon >= x0 && lon <= x1 && lat >= y0 && lat <= y1;
const featIn = (f, box) => { const [[a, b], [c, d]] = geoBounds(f); return c >= box[0] && a <= box[2] && d >= box[1] && b <= box[3]; };

// ---------- continent ----------
const interactive = { '288': 'ghana', '384': 'cote-divoire', '566': 'nigeria', '404': 'kenya', '710': 'south-africa', '504': 'morocco', '120': 'cameroon' };
const base = { viewBox: [0, 0, W, H], countries: [], lakes: '', rivers: '', equator: '', oceans: {}, points: {}, boxes: {}, kmPerUnit: 0 };
for (const f of africa50) {
  const id = f.id, a2 = A2[id] || null;
  const g = id === '288' ? by10.get('288') : f;
  const d = id === '288' ? geomPath(g.geometry, 0.02, 2) : r1(path(f));
  const [cx, cy] = P(geoCentroid(f));
  base.countries.push({ id: interactive[id] || null, a2, d, lx: +cx.toFixed(1), ly: +cy.toFixed(1), area: +(geoArea(f) * 1e4).toFixed(1) });
}
// Label nudges where the centroid sits badly.
const nudge = { MA: [-6, -10], ZA: [0, 6], MZ: [8, 8], EG: [0, 6], SO: [8, 14], CD: [0, 0], GM: [-14, 0], GW: [-14, 4] };
for (const c of base.countries) if (nudge[c.a2]) { c.lx += nudge[c.a2][0]; c.ly += nudge[c.a2][1]; }
const land = { type: 'FeatureCollection', features: africa110 };
const coordsOf = g => g.type === 'LineString' ? g.coordinates : g.type === 'MultiLineString' ? g.coordinates.flat() : g.type === 'Polygon' ? g.coordinates[0] : g.coordinates.flat(2);
const onAfrica = f => { const c = coordsOf(f.geometry).filter((_, i, a) => i % Math.max(1, Math.floor(a.length / 25)) === 0); return c.filter(p => africa110.some(a => geoContains(a, p))).length / c.length > 0.6; };
base.lakes = read('ne/ne_50m_lakes.geojson').features.filter(f => f.properties.scalerank <= 4).filter(onAfrica).map(f => geomPath(f.geometry, 0.15, 1)).join('');
base.rivers = read('ne/ne_50m_rivers_lake_centerlines.geojson').features.filter(f => f.properties.scalerank <= 5).filter(onAfrica).map(f => geomPath(f.geometry, 0.15, 1)).join('');
base.equator = line(Array.from({ length: 101 }, (_, i) => [-24 + i * 0.8, 0]), 0.05, 1);
for (const [k, c] of Object.entries({ atlantic: [-17, -4], indian: [50, -22], guinea: [2.5, 1.5], mediterranean: [17, 34.6], red: [38.6, 19.6], equator: [-21.5, 0] })) base.oceans[k] = P(c).map(v => +v.toFixed(1));
void land;

// Sites: positions checked against OpenStreetMap on 28 Nov 2026 (Kantamanto Market way, Kejetia Market node, suburb nodes).
const pts = {
  accra: [-0.2012, 5.5571], kumasi: [-1.6233, 6.6986], abidjan: [-4.0083, 5.36], lagos: [3.3792, 6.5244], nairobi: [36.8219, -1.2921],
  casablanca: [-7.5898, 33.5731], douala: [9.7679, 4.0511], johannesburg: [28.0473, -26.2041],
  circle: [-0.2163, 5.5716], kantamanto: [-0.2131, 5.5495], 'old-fadama': [-0.2234, 5.5455], 'osu-nima-airport': [-0.1882, 5.5827], legon: [-0.1872, 5.6467],
  tema: [-0.0097, 5.6596], kpone: [0.0283, 5.7034], adum: [-1.6233, 6.6943], kejetia: [-1.6210, 6.6958], aboabo: [-1.5979, 6.6990], ejisu: [-1.4666, 6.7140],
  enchi: [-2.8237, 5.8232], sunyani: [-2.3309, 7.3384],
};
for (const [k, c] of Object.entries(pts)) base.points[k] = P(c).map(v => +v.toFixed(4));
function box(lonlats, pad) {
  const p = lonlats.map(P);
  let x0 = Math.min(...p.map(q => q[0])), x1 = Math.max(...p.map(q => q[0])), y0 = Math.min(...p.map(q => q[1])), y1 = Math.max(...p.map(q => q[1]));
  let w = (x1 - x0) * (1 + pad), h = (y1 - y0) * (1 + pad);
  if (w / h > W / H) h = w * H / W; else w = h * W / H;
  return [(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - h / 2, w, h].map(v => +v.toFixed(4));
}
const bboxOf = f => { const [[a, b], [c, d]] = geoBounds(f); return [[a, b], [c, d]]; };
const f110 = id => africa110.find(f => f.id === id);
base.boxes = {
  africa: [0, 0, W, H],
  ghana: box(bboxOf(by10.get('288')), 0.16),
  accra: box([[-0.30, 5.54], [0.07, 5.75]], 0.06),
  kumasi: box([[-1.69, 6.64], [-1.44, 6.75]], 0.12),
  'cote-divoire': box(bboxOf(feats(w50).find(f => f.id === '384')), 0.8), nigeria: box(bboxOf(f110('566')), 0.6), kenya: box(bboxOf(f110('404')), 0.8),
  'south-africa': box(bboxOf(f110('710')), 0.45), morocco: box(bboxOf(f110('504')), 0.6), cameroon: box(bboxOf(f110('120')), 0.8),
};
const a = P([-0.2, 5.6]), b = P([0.8, 5.6]);
base.kmPerUnit = +((geoDistance([-0.2, 5.6], [0.8, 5.6]) * 6371) / Math.hypot(b[0] - a[0], b[1] - a[1])).toFixed(4);

// ---------- detail ----------
const detail = { ghana: {}, accra: {}, kumasi: {} };
const GBOX = [-3.6, 4.4, 1.5, 11.3];
const gh10 = by10.get('288');
detail.ghana.outline = geomPath(gh10.geometry, 0.0015, 3);
const neighbours = ['384', '854', '768'].map(id => by10.get(id)).map(f => geomPath(f.geometry, 0.01, 2)).join('');
detail.ghana.neighbours = neighbours;
const regions = read('gb-gha-adm1.geojson').features;
detail.ghana.regions = regions.map(f => geomPath(f.geometry, 0.02, 2)).join('');
// Planar centroid of the largest ring (geoBoundaries rings do not follow d3's spherical winding, so geoCentroid would flip them).
function ringCentroid(g) {
  const rings = g.type === 'Polygon' ? [g.coordinates[0]] : g.coordinates.map(p => p[0]);
  let best = null, bestA = 0;
  for (const ring of rings) {
    const pts = ring.map(P); let a = 0, x = 0, y = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const f = pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1]; a += f; x += (pts[j][0] + pts[i][0]) * f; y += (pts[j][1] + pts[i][1]) * f; }
    if (Math.abs(a) > bestA) { bestA = Math.abs(a); best = [x / (3 * a), y / (3 * a)]; }
  }
  return best;
}
detail.ghana.regionLabels = regions.map(f => { const [x, y] = ringCentroid(f.geometry); return { name: f.properties.shapeName.replace(/ Region$/, ''), x: +x.toFixed(3), y: +y.toFixed(3) }; });
detail.ghana.lakes = read('ne/ne_10m_lakes.geojson').features.filter(f => featIn(f, GBOX)).map(f => geomPath(f.geometry, 0.004, 3)).join('');
detail.ghana.rivers = read('ne/ne_10m_rivers_lake_centerlines.geojson').features.filter(f => featIn(f, GBOX)).map(f => geomPath(f.geometry, 0.03, 2)).join('');
const ghanaOsm = read('osm/ghana.json').elements;
const roadsBy = (els, classes, tol, n) => Object.fromEntries(classes.map(c => [c, els.filter(e => e.type === 'way' && e.tags?.highway === c && e.geometry).map(e => line(e.geometry.map(p => [p.lon, p.lat]), tol, n)).join('')]));
detail.ghana.roads = roadsBy(ghanaOsm, ['motorway', 'trunk', 'primary'], 0.03, 2);
const capitals = ['Accra', 'Kumasi', 'Sekondi-Takoradi', 'Sefwi Wiawso', 'Cape Coast', 'Koforidua', 'Ho', 'Dambai', 'Sunyani', 'Techiman', 'Goaso', 'Tamale', 'Damongo', 'Nalerigu', 'Bolgatanga', 'Wa'];
detail.ghana.towns = capitals.map(n => ghanaOsm.find(e => e.type === 'node' && e.tags?.name === n)).filter(Boolean).map(e => { const [x, y] = P([e.lon, e.lat]); return { name: e.tags.name, x: +x.toFixed(3), y: +y.toFixed(3) }; });
const route = f => line(read(f).routes[0].geometry.coordinates, 0.002, 3);
detail.ghana.routes = { parcel: route('osm/route-accra-kumasi.json'), enchi: route('osm/route-enchi-kumasi.json') };
detail.ghana.routeKm = { parcel: Math.round(read('osm/route-accra-kumasi.json').routes[0].distance / 1000), enchi: Math.round(read('osm/route-enchi-kumasi.json').routes[0].distance / 1000) };

function city(file, labels) {
  const els = read(file).elements, o = {};
  const ways = els.filter(e => e.type === 'way' && e.geometry);
  o.roads = roadsBy(ways, ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'], 0.003, 3);
  o.rail = ways.filter(e => e.tags?.railway === 'rail').map(e => line(e.geometry.map(p => [p.lon, p.lat]), 0.003, 3)).join('');
  const closed = e => e.geometry.length > 3 && e.geometry[0].lat === e.geometry.at(-1).lat && e.geometry[0].lon === e.geometry.at(-1).lon;
  o.water = ways.filter(e => e.tags?.natural === 'water' && closed(e) && e.geometry.length > 8).map(e => line(e.geometry.map(p => [p.lon, p.lat]), 0.002, 3, true)).join('');
  o.waterways = ways.filter(e => /^(river|canal)$/.test(e.tags?.waterway || '')).map(e => line(e.geometry.map(p => [p.lon, p.lat]), 0.003, 3)).join('');
  const area = (pred, tol = 0.0006) => ways.filter(e => pred(e.tags || {}) && closed(e)).map(e => line(e.geometry.map(p => [p.lon, p.lat]), tol, 3, true)).join('');
  o.markets = area(t => t.amenity === 'marketplace');
  o.campus = area(t => t.amenity === 'university');
  o.airport = area(t => t.aeroway === 'aerodrome');
  o.landfill = area(t => t.landuse === 'landfill');
  o.labels = labels.map(n => els.find(e => e.type === 'node' && e.tags?.name === n && e.tags.place)).filter(Boolean).map(e => { const [x, y] = P([e.lon, e.lat]); return { name: e.tags.name, x: +x.toFixed(4), y: +y.toFixed(4) }; });
  return o;
}
// Accra coast from OpenStreetMap: land north of it and sea south of it correct the 1:10m country outline at street level.
function coast(file) {
  const ways = read(file).elements.filter(e => e.type === 'way');
  const byStart = new Map(ways.map(e => [e.nodes[0], e]));
  const ends = new Set(ways.map(e => e.nodes.at(-1)));
  const chains = [];
  for (const start of ways.filter(e => !ends.has(e.nodes[0]))) {
    let cur = start, pts = [];
    const seen = new Set();
    while (cur && !seen.has(cur.id)) { seen.add(cur.id); pts = pts.concat(cur.geometry.map(p => [p.lon, p.lat]).slice(pts.length ? 1 : 0)); cur = byStart.get(cur.nodes.at(-1)); }
    chains.push(pts);
  }
  const main = chains.sort((a, b) => b.length - a.length)[0];
  const first = main[0], lastP = main.at(-1);
  return {
    land: line([...main, [lastP[0], 5.98], [first[0], 5.98]], 0.0006, 3, true),
    sea: line([...main, [lastP[0], 5.2], [first[0], 5.2]], 0.0006, 3, true),
    line: line(main, 0.0006, 3),
  };
}
detail.accra = city('osm/accra.json', ['Osu', 'Adabraka', 'Achimota', 'Madina', 'East Legon', 'Dansoman', 'Teshie', 'Nungua', 'Kaneshie', 'Labadi', 'Cantonments', 'Dzorwulu', 'Abeka', 'Lapaz', 'Tema Newtown', 'Sakumono', 'Spintex', 'Ashaiman', 'Weija', 'Kwashieman']);
detail.accra.coast = coast('osm/coast-accra.json');
detail.kumasi = city('osm/kumasi.json', ['Bantama', 'Suame', 'Kwadaso', 'Ahodwo', 'Tafo', 'Manhyia', 'Ayigya', 'Asokwa', 'Santasi', 'Oforikrom', 'Atonsu', 'Ayeduase', 'Asawase', 'Tanoso', 'Krofrom', 'Breman']);

writeFileSync(`${out}/map.json`, JSON.stringify(base));
writeFileSync(`${out}/map-detail.json`, JSON.stringify(detail));
const size = o => JSON.stringify(o).length;
console.log('map.json', size(base), 'countries', base.countries.length, 'lakes', base.lakes.length, 'rivers', base.rivers.length);
console.log('map-detail.json', size(detail), Object.fromEntries(Object.entries(detail).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([a, b]) => [a, size(b)]))])));
console.log('labels', detail.accra.labels.length, detail.kumasi.labels.length, 'towns', detail.ghana.towns.length, 'routes km', detail.ghana.routeKm);
console.log(base.boxes);
