import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { createHmac, randomBytes, scryptSync } from 'node:crypto';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

let server, temporary, origin, cookie;
const testCode = 'fixture-access-code-2026';
const salt = randomBytes(16);
const signingKey = randomBytes(32);
const prefix='/guides/codex-java/';
const tokenName='__Secure-codex_java_session';
const req = (path, options={}) => fetch(origin+path,{redirect:'manual',...options});
const unlock = (code=testCode, options={}) => req(prefix+'unlock', {method:'POST', headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json','X-Real-IP':options.ip || 'local-test'},body:new URLSearchParams({code}),...options});
before(async()=>{
 temporary=await mkdtemp(join(tmpdir(),'codex-access-test-'));
 const probe=createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
 origin=`http://127.0.0.1:${port}`;
 const path=join(temporary,'auth.json');
 await writeFile(path,JSON.stringify({salt:salt.toString('hex'),digest:scryptSync(testCode,salt,32).toString('hex'),signingKey:signingKey.toString('hex')}),{mode:0o600});
 server=spawn(process.execPath,[new URL('../../ops/codex-java/auth-server.mjs',import.meta.url).pathname],{env:{...process.env,GUIDE_AUTH_CONFIG:path,GUIDE_AUTH_PORT:String(port),GUIDE_ORIGIN:origin},stdio:'pipe'});
 for(let i=0;i<50;i++){try{const r=await req('/health');if(r.ok)return;}catch{}await delay(50);}
 throw new Error('Test gateway failed to start');
});
after(async()=>{server?.kill('SIGTERM');if(temporary)await rm(temporary,{recursive:true,force:true});});
test('custom page contains exactly one code field, no username, and no browser challenge',async()=>{
 const r=await req(prefix+'signin');assert.equal(r.status,200);assert.equal(r.headers.get('www-authenticate'),null);
 const html=await r.text();assert.equal((html.match(/<input /g)||[]).length,1);assert(html.includes('name="code"'));assert(!html.includes('username'));assert(!html.includes('sk-proj-'));
 assert(r.headers.get('cache-control').includes('no-store'));
 for(const asset of ['gate.css','gate.js'])assert.equal((await req(prefix+asset)).status,200);
});
test('missing, incorrect, foreign-origin, and GET submissions cannot sign in',async()=>{
 for(const [code,status]of [['',400],['wrong-code',401]]){const r=await unlock(code);assert.equal(r.status,status);assert.equal(r.headers.get('set-cookie'),null);assert.equal(r.headers.get('www-authenticate'),null);}
 assert.equal((await req(prefix+'unlock')).status,405);
 assert.equal((await req(prefix+'unlock',{method:'POST',headers:{Origin:'https://untrusted.example','Content-Type':'application/x-www-form-urlencoded'},body:'code='+testCode})).status,403);
 assert.equal((await req('/verify')).status,401);
 assert.equal((await req('/verify',{headers:{Authorization:'Basic '+Buffer.from('friend:'+testCode).toString('base64')}})).status,401);
});
test('valid code yields a signed, scoped, HttpOnly Secure session',async()=>{
 const r=await unlock();assert.equal(r.status,200);assert.deepEqual(await r.json(),{ok:true});
 const setting=r.headers.get('set-cookie');for(const flag of ['HttpOnly','Secure','SameSite=Strict','Max-Age=28800',`Path=${prefix}`])assert(setting.includes(flag));
 assert(!setting.includes(testCode));cookie=setting.split(';')[0];
 assert.equal((await req('/verify',{headers:{Cookie:cookie}})).status,204);
 assert.equal((await req(prefix+'signin',{headers:{Cookie:cookie}})).status,303);
});
test('tampered, expired, duplicate, and forged sessions are rejected',async()=>{
 const expired=`${randomBytes(18).toString('base64url')}.${Math.floor(Date.now()/1000)-1}`;
 const expiredToken=expired+'.'+createHmac('sha256',signingKey).update(expired).digest('hex');
 for(const value of [cookie.slice(0,-1)+(cookie.endsWith('0')?'1':'0'),`${tokenName}=${expiredToken}`,cookie+'; '+cookie,`${tokenName}=forged`])assert.equal((await req('/verify',{headers:{Cookie:value}})).status,401);
});
test('signout clears the cookie and redirects to the custom screen',async()=>{
 const r=await req(prefix+'signout',{method:'POST',headers:{Cookie:cookie,Origin:origin}});assert.equal(r.status,303);assert(r.headers.get('set-cookie').includes('Max-Age=0'));assert.equal(r.headers.get('location'),prefix+'signin');
});
test('repeated wrong codes are limited without revealing the access code',async()=>{
 let r;for(let i=0;i<9;i++)r=await unlock('wrong-code',{ip:'rate-test'});
 assert.equal(r.status,429);assert(!(await r.text()).includes(testCode));
});
test('native form submission also works without JavaScript',async()=>{
 const r=await req(prefix+'unlock',{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded','X-Real-IP':'no-js'},body:new URLSearchParams({code:testCode})});
 assert.equal(r.status,303);assert.equal(r.headers.get('location'),prefix);assert(r.headers.get('set-cookie'));
});
