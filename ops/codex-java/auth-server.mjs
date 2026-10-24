import { createServer } from 'node:http';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFileSync, existsSync, unlinkSync, chmodSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const directory = new URL('./', import.meta.url);
const configPath = process.env.GUIDE_AUTH_CONFIG || `${process.env.CREDENTIALS_DIRECTORY}/auth.json`;
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const salt = Buffer.from(config.salt, 'hex');
const digest = Buffer.from(config.digest, 'hex');
const signingKey = Buffer.from(config.signingKey, 'hex');
if (salt.length !== 16 || digest.length !== 32 || signingKey.length !== 32) throw new Error('Invalid access configuration');
const prefix = '/guides/codex-java/';
const cookieName = '__Secure-codex_java_session';
const lifetime = 8 * 60 * 60;
const origin = process.env.GUIDE_ORIGIN || 'https://zhaoyang.fr';
const pageTemplate = readFileSync(new URL('gate.html', directory), 'utf8');
const assets = new Map(['gate.css', 'gate.js'].map(name => [name, readFileSync(new URL(name, directory))]));
const attempts = new Map();
const headers = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'none'; style-src 'self'; script-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};
function sign(value) { return createHmac('sha256', signingKey).update(value).digest('hex'); }
function authorized(request) {
  const cookies = (request.headers.cookie || '').split(';').map(x => x.trim()).filter(x => x.startsWith(cookieName + '='));
  if (cookies.length !== 1) return false;
  const token = cookies[0].slice(cookieName.length + 1);
  if (!/^[A-Za-z0-9_-]{24}\.[0-9]{10}\.[a-f0-9]{64}$/.test(token)) return false;
  const [nonce, expires, signature] = token.split('.');
  const now = Math.floor(Date.now() / 1000);
  if (Number(expires) <= now || Number(expires) > now + lifetime) return false;
  return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(sign(`${nonce}.${expires}`), 'hex'));
}
function cookie(token, maxAge = lifetime) {
  return `${cookieName}=${token}; Path=${prefix}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
function send(response, status, body = '', extra = {}) {
  response.writeHead(status, { ...headers, 'Content-Type': 'text/html; charset=utf-8', ...extra });
  response.end(body);
}
function error(request, response, status, message) {
  if ((request.headers.accept || '').includes('application/json')) return send(response, status, JSON.stringify({ error: message }), { 'Content-Type': 'application/json' });
  send(response, status, pageTemplate.replace('{{ERROR}}', message));
}
function rateLimited(ip) {
  const now = Date.now();
  if (attempts.size > 2000) for (const [key, value] of attempts) if (now - value.start > 60_000) attempts.delete(key);
  if (attempts.size > 4000 && !attempts.has(ip)) return true;
  const record = attempts.get(ip);
  if (!record || now - record.start > 60_000) { attempts.set(ip, { start: now, count: 1 }); return false; }
  record.count++;
  return record.count > 8;
}
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, origin).pathname;
    if (path === '/health') return send(response, 200, 'ok', { 'Content-Type': 'text/plain' });
    if (path === '/verify') return send(response, authorized(request) ? 204 : 401);
    const route = path.startsWith(prefix) ? path.slice(prefix.length) : '';
    if ((request.method === 'GET' || request.method === 'HEAD') && assets.has(route)) {
      return send(response, 200, request.method === 'HEAD' ? '' : assets.get(route), { 'Content-Type': route.endsWith('.css') ? 'text/css; charset=utf-8' : 'application/javascript; charset=utf-8' });
    }
    if (route === 'signin' && ['GET', 'HEAD'].includes(request.method)) {
      if (authorized(request)) return send(response, 303, '', { Location: prefix });
      return send(response, 200, request.method === 'HEAD' ? '' : pageTemplate.replace('{{ERROR}}', ''));
    }
    if (!['unlock', 'signout'].includes(route)) return send(response, 404, 'Not found');
    if (request.method !== 'POST') return send(response, 405, 'Method not allowed', { Allow: 'POST' });
    if (request.headers.origin !== origin) return error(request, response, 403, '请从本页面提交访问码。');
    if (route === 'signout') return send(response, 303, '', { 'Set-Cookie': cookie('', 0), Location: prefix + 'signin' });
    const ip = request.headers['x-real-ip'] || request.socket.remoteAddress || 'local';
    if (rateLimited(ip)) return error(request, response, 429, '尝试次数有点多，请等一分钟再试。');
    if (!(request.headers['content-type'] || '').startsWith('application/x-www-form-urlencoded')) return error(request, response, 415, '请通过访问码输入框进入。');
    let body = '';
    for await (const chunk of request) {
      body += chunk.toString('utf8');
      if (Buffer.byteLength(body) > 1024) { send(response, 413, 'Request too large'); return; }
    }
    const fields = new URLSearchParams(body);
    const code = (fields.get('code') || '').trim();
    if (fields.getAll('code').length !== 1 || !code || code.length > 128) return error(request, response, 400, '请粘贴朋友发给你的访问码。');
    const candidate = scryptSync(code, salt, 32);
    if (!timingSafeEqual(candidate, digest)) return error(request, response, 401, '访问码不正确，请检查后再试。');
    attempts.delete(ip);
    const value = `${randomBytes(18).toString('base64url')}.${Math.floor(Date.now() / 1000) + lifetime}`;
    const session = cookie(`${value}.${sign(value)}`);
    if ((request.headers.accept || '').includes('application/json')) return send(response, 200, JSON.stringify({ ok: true }), { 'Content-Type': 'application/json', 'Set-Cookie': session });
    send(response, 303, '', { Location: prefix, 'Set-Cookie': session });
  } catch {
    // Never log submitted codes, cookies, credentials, or request bodies.
    if (!response.headersSent) send(response, 500, '暂时无法验证访问码，请稍后重试。');
    else response.end();
  }
});
server.requestTimeout = 10_000;
server.headersTimeout = 10_000;
server.maxHeadersCount = 30;
if (process.env.GUIDE_AUTH_PORT) {
  server.listen(Number(process.env.GUIDE_AUTH_PORT), '127.0.0.1', () => console.log('Guide access service ready on loopback.'));
} else {
  const socket = '/run/siteweb-codex-java-auth/auth.sock';
  if (existsSync(socket)) unlinkSync(socket);
  server.listen(socket, () => { chmodSync(socket, 0o660); console.log('Guide access service ready.'); });
}
