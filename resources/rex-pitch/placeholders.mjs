// Puts a placeholder at every asset path of /guides/rex-pitch/ that is still empty, so that the page can be built and checked
// before the deck files exist. Existing files are never touched.
//   node resources/rex-pitch/placeholders.mjs
// Each placeholder's SHA-256 goes into placeholders.json: build.mjs reports those files (and --strict refuses them)
// until the real files replace them. Delete placeholders.json once every real file is in place.
import {createHash} from 'node:crypto';
import {mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {demo, downloads, slideCount, slideName} from './content.mjs';

const out = new URL('../../public/guides/rex-pitch/', import.meta.url);
const record = new URL('placeholders.json', import.meta.url);
const exists = url => stat(url).then(() => true, () => false);
const hashes = (await exists(record)) ? JSON.parse(await readFile(record, 'utf8')) : {};
const made = [];

async function put(path, bytes) {
  const target = new URL(path, out);
  if (await exists(target)) return;
  await mkdir(dirname(fileURLToPath(target)), {recursive: true});
  await writeFile(target, bytes);
  hashes[path] = createHash('sha256').update(bytes).digest('hex');
  made.push(path);
}

for (const item of downloads) await put(`files/${item.file}`, `REX-PITCH-PLACEHOLDER\nReplace this file with the real ${item.file}.\n`);

// Slide pictures: 1920 x 1080 PNGs that say what they are.
const {default: sharp} = await import('sharp');
for (let n = 1; n <= slideCount; n++) {
  const pngPath = `slides/${slideName(n)}.png`, webpPath = `slides/${slideName(n)}.webp`;
  if (await exists(new URL(pngPath, out)) || await exists(new URL(webpPath, out))) continue;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="#011536"/><rect x="120" y="520" width="240" height="4" fill="#00B9F2"/><text x="120" y="470" font-family="Helvetica, Arial, sans-serif" font-size="120" font-weight="700" fill="#ffffff">Slide ${n}</text><text x="120" y="640" font-family="Helvetica, Arial, sans-serif" font-size="56" fill="#9fb0c8">Placeholder: replace ${pngPath}</text></svg>`;
  await put(pngPath, await sharp(Buffer.from(svg)).png().toBuffer());
}

// Deck player: same controls as the deckkit player (Space / Enter / arrow keys / PageUp / PageDown, click on the stage), and a
// #clock that reads "slide / slides", so the page and its browser check work the same way with the placeholder and the real deck.
const player = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Placeholder deck player</title>
<style>html,body{margin:0;height:100%;background:#0b0b0c;overflow:hidden}body{display:flex;flex-direction:column;align-items:center;justify-content:center;font:12px/1 ui-monospace,Menlo,monospace;color:#8b8b90}
#stage{position:relative;display:flex;flex-direction:column;justify-content:center;gap:18px;box-sizing:border-box;padding:0 6%;width:min(100vw,calc((100vh - 34px) * 16 / 9));aspect-ratio:16/9;background:#011536;color:#fff;font:700 clamp(16px,4vw,56px)/1.1 Helvetica,Arial,sans-serif;cursor:pointer}
#stage small{font:400 clamp(11px,1.6vw,22px)/1.3 Helvetica,Arial,sans-serif;color:#9fb0c8}
#bar{display:flex;align-items:center;justify-content:flex-end;width:min(100vw,calc((100vh - 34px) * 16 / 9));height:34px;padding:0 12px;box-sizing:border-box}</style></head>
<body><div id="stage"><span id="title">Slide 1</span><small>Placeholder: replace public/guides/rex-pitch/${demo} and demo/assets/ with the deckkit player.</small></div><div id="bar"><span id="clock"></span></div>
<script>(function(){var n=${slideCount},i=0,steps=0,clock=document.getElementById('clock'),title=document.getElementById('title');
function ui(){title.textContent='Slide '+(i+1)+(steps?' \\u00b7 step '+steps:'');clock.textContent=(i+1)+' / '+n+' \\u00b7 step '+steps;}
function step(){steps++;if(steps>2){steps=0;i=Math.min(n-1,i+1);}ui();}
function back(){steps=0;i=Math.max(0,i-1);ui();}
document.getElementById('stage').addEventListener('click',step);
document.addEventListener('keydown',function(e){if(e.key===' '||e.key==='Enter'||e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();step();}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();back();}});
ui();})();</script></body></html>
`;
await put(demo, player);

await writeFile(record, JSON.stringify(hashes, null, 2) + '\n');
console.log(made.length ? `rex-pitch placeholders written:\n${made.map(path => `  public/guides/rex-pitch/${path}`).join('\n')}` : 'rex-pitch: every asset path already has a file, no placeholder written');
