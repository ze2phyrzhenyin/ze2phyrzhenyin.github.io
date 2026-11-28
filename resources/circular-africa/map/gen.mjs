// Map data for the explorer: Africa (Natural Earth via world-atlas 2.0.2), Ghana at 1:10m,
// neighbours at 1:50m, lakes and rivers at 1:50m (Natural Earth 5.1.2), projected once.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import * as topo from 'topojson-client';
import { geoAzimuthalEqualArea, geoPath, geoBounds, geoDistance, geoContains } from 'd3-geo';
const require = createRequire(import.meta.url);
const w110 = require('world-atlas/countries-110m.json'), w50 = require('world-atlas/countries-50m.json'), w10 = require('world-atlas/countries-10m.json');
const AF = new Set('012 024 204 072 854 108 132 120 140 148 174 178 180 384 262 818 226 232 748 231 266 270 288 324 624 404 426 430 434 450 454 466 478 480 504 508 516 562 566 646 678 686 690 694 706 710 728 729 834 768 788 800 894 716 732'.split(' '));
const feats = w => topo.feature(w, w.objects.countries).features;
const africa110 = feats(w110).filter(f => AF.has(f.id) || f.properties.name === 'Somaliland');
const by50 = new Map(feats(w50).map(f => [f.id, f])), by10 = new Map(feats(w10).map(f => [f.id, f]));
const W = 600, H = 640;
const proj = geoAzimuthalEqualArea().rotate([-17, -3]).fitExtent([[10, 10], [W - 10, H - 10]], { type: 'FeatureCollection', features: africa110 });
const path = geoPath(proj);
const r = (d, n = 1) => d ? d.replace(/-?\d+\.\d+/g, m => (+m).toFixed(n).replace(/\.?0+$/, '')) : '';
const interactive = { '288': 'ghana', '384': 'cote-divoire', '566': 'nigeria', '404': 'kenya', '710': 'south-africa', '504': 'morocco', '120': 'cameroon' };
const detail = { '288': [by10, 3], '384': [by50, 2], '768': [by50, 2], '854': [by50, 2] }; // Ghana 10m, neighbours 50m
const out = { viewBox: [0, 0, W, H], base: '', countries: {}, lakes: '', rivers: '', points: {}, boxes: {}, kmPerUnit: 0 };
for (const f of africa110) {
  const [src, prec] = detail[f.id] || [null, 1];
  const feat = src ? src.get(f.id) : f;
  const d = r(path(feat), prec);
  if (interactive[f.id]) out.countries[interactive[f.id]] = d; else out.base += d;
}
// Lakes and rivers inside Africa's bounding box.
const land = { type: 'FeatureCollection', features: africa110 };
const coordsOf = g => g.type === 'LineString' ? g.coordinates : g.type === 'MultiLineString' ? g.coordinates.flat() : g.type === 'Polygon' ? g.coordinates[0] : g.coordinates.flat(2);
// Keep a lake or river when most of its points fall on African land.
const inAfrica = f => { const c = coordsOf(f.geometry).filter((_, i, a) => i % Math.max(1, Math.floor(a.length / 25)) === 0); const inside = c.filter(p => africa110.some(a => geoContains(a, p))).length; return inside / c.length > 0.6; };
const lakes = JSON.parse(readFileSync('ne/ne_50m_lakes.geojson', 'utf8')).features.filter(inAfrica).filter(f => f.properties.scalerank <= 4);
out.lakes = lakes.map(f => r(path(f), 2)).join('');
const rivers = JSON.parse(readFileSync('ne/ne_50m_rivers_lake_centerlines.geojson', 'utf8')).features.filter(inAfrica).filter(f => f.properties.scalerank <= 5);
out.rivers = rivers.map(f => r(path(f), 2)).join('');
const pts = {
  accra: [-0.187, 5.6037], kumasi: [-1.6244, 6.6885], abidjan: [-4.0083, 5.36], lagos: [3.3792, 6.5244], nairobi: [36.8219, -1.2921],
  casablanca: [-7.5898, 33.5731], douala: [9.7679, 4.0511], johannesburg: [28.0473, -26.2041], capetown: [18.4241, -33.9249],
  circle: [-0.2156, 5.5697], kantamanto: [-0.2103, 5.5505], 'old-fadama': [-0.227, 5.547], 'osu-nima-airport': [-0.1867, 5.5815], legon: [-0.1869, 5.6508],
  tema: [-0.0166, 5.6698], kpone: [0.04, 5.7], adum: [-1.6244, 6.6885], kejetia: [-1.6235, 6.697], aboabo: [-1.602, 6.705], ejisu: [-1.463, 6.718],
  enchi: [-2.8167, 5.8167], sunyani: [-2.3123, 7.3349],
};
for (const [k, c] of Object.entries(pts)) out.points[k] = proj(c).map(v => +v.toFixed(3));
// Zoom boxes [x, y, w, h] with the map's aspect ratio.
function box(lonlats, pad, minW) {
  const p = lonlats.map(c => proj(c));
  let x0 = Math.min(...p.map(q => q[0])), x1 = Math.max(...p.map(q => q[0])), y0 = Math.min(...p.map(q => q[1])), y1 = Math.max(...p.map(q => q[1]));
  let w = Math.max(x1 - x0, minW) * (1 + pad), h = Math.max(y1 - y0, minW * H / W) * (1 + pad);
  if (w / h > W / H) h = w * H / W; else w = h * W / H;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return [cx - w / 2, cy - h / 2, w, h].map(v => +v.toFixed(3));
}
const bboxOf = f => { const [[a, b], [c, d]] = geoBounds(f); return [[a, b], [c, d], [a, d], [c, b]]; };
const f110 = id => africa110.find(f => f.id === id);
out.boxes = {
  africa: [0, 0, W, H],
  ghana: box(bboxOf(by10.get('288')), 0.22, 0),
  accra: box([pts.circle, pts.kantamanto, pts['old-fadama'], pts.legon, pts.tema, pts.kpone, [-0.33, 5.56], [0.09, 5.70]], 0.18, 0),
  kumasi: box([pts.adum, pts.kejetia, pts.aboabo, pts.ejisu, [-1.70, 6.69]], 0.45, 0),
  'cote-divoire': box(bboxOf(by50.get('384')), 0.9, 0), nigeria: box(bboxOf(f110('566')), 0.7, 0), kenya: box(bboxOf(f110('404')), 0.9, 0),
  'south-africa': box(bboxOf(f110('710')), 0.5, 0), morocco: box(bboxOf(f110('504')), 0.7, 0), cameroon: box(bboxOf(f110('120')), 0.9, 0),
};
// Kilometres per map unit near Accra (for the scale bar).
const a = proj([-0.2, 5.6]), b = proj([0.8, 5.6]);
out.kmPerUnit = +((geoDistance([-0.2, 5.6], [0.8, 5.6]) * 6371) / Math.hypot(b[0] - a[0], b[1] - a[1])).toFixed(4);
const json = JSON.stringify(out);
writeFileSync(process.argv[2], json);
console.log('bytes', json.length, 'base', out.base.length, 'gha', out.countries.ghana.length, 'lakes', out.lakes.length, lakes.length, 'rivers', out.rivers.length, rivers.length, 'km/unit', out.kmPerUnit);
console.log(out.boxes);
