#!/usr/bin/env python3
"""Install custom code-only access. Credentials arrive over stdin, never arguments."""
import datetime
import grp
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import subprocess
import sys
import time

assert os.geteuid() == 0, 'Administrator execution required'
source = Path(__file__).resolve().parent
vhost = Path('/etc/nginx/sites-available/zhaoyang.fr')
original = vhost.read_text()
anchor = 'include /etc/nginx/snippets/static-siteweb.conf;'
assert original.count(anchor) == 1, 'Unexpected vhost; inspect before changing'
data = json.load(sys.stdin)
assert re.fullmatch(r'sk-[A-Za-z0-9_-]{100,}', data['key']), 'Invalid key format'
assert re.fullmatch(r'[A-Za-z0-9_-]{20,}', data['accessCode']), 'Invalid access code'
www_gid = grp.getgrnam('www-data').gr_gid

def write_atomic(path, body, mode=0o644, gid=0):
    temporary = path.with_name(path.name + '.codex-java-new')
    fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL, mode)
    with os.fdopen(fd, 'w') as f:
        f.write(body)
    os.chown(temporary, 0, gid)
    os.replace(temporary, path)

# Keep the API key outside both the static release and the auth service.
for name in ['/var/lib/siteweb-private', '/var/lib/siteweb-private/codex-java']:
    directory = Path(name)
    directory.mkdir(parents=True, exist_ok=True)
    directory.chmod(0o750)
    os.chown(directory, 0, www_gid)
write_atomic(Path('/var/lib/siteweb-private/codex-java/key.json'), json.dumps({'key': data['key'], 'expiresAt': data['expiresAt']}) + '\n', 0o640, www_gid)
private = Path('/etc/siteweb-codex-java')
private.mkdir(exist_ok=True)
private.chmod(0o700)
salt = secrets.token_bytes(16)
settings = {'salt': salt.hex(), 'digest': hashlib.scrypt(data['accessCode'].encode(), salt=salt, n=16384, r=8, p=1, dklen=32).hex(), 'signingKey': secrets.token_hex(32)}
existing_config = private / 'auth.json'
if existing_config.exists():
    previous = json.loads(existing_config.read_text())
    previous_digest = hashlib.scrypt(data['accessCode'].encode(), salt=bytes.fromhex(previous['salt']), n=16384, r=8, p=1, dklen=32).hex()
    if secrets.compare_digest(previous_digest, previous['digest']):
        settings = previous
write_atomic(existing_config, json.dumps(settings) + '\n', 0o600)
app = Path('/usr/local/lib/siteweb-codex-java-auth')
app.mkdir(exist_ok=True)
for name in ['auth-server.mjs', 'gate.html', 'gate.css', 'gate.js', 'theme.js']:
    write_atomic(app / name, (source / name).read_text())
unit = 'siteweb-codex-java-auth.service'
write_atomic(Path('/etc/systemd/system') / unit, (source / unit).read_text())
subprocess.run(['systemctl', 'daemon-reload'], check=True)
subprocess.run(['systemctl', 'enable', unit], check=True, stdout=subprocess.DEVNULL)
active = subprocess.run(['systemctl', 'is-active', '--quiet', unit]).returncode == 0
subprocess.run(['systemctl', 'restart' if active else 'start', unit], check=True)
ready = False
for _ in range(40):
    check = subprocess.run(['curl', '--silent', '--fail', '--unix-socket', '/run/siteweb-codex-java-auth/auth.sock', 'http://localhost/health'], capture_output=True)
    if check.returncode == 0 and check.stdout == b'ok':
        ready = True
        break
    time.sleep(0.25)
assert ready, 'Auth service not ready; previous Nginx guard left in place'

stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
backup = Path('/var/backups/siteweb-codex-java') / stamp
backup.mkdir(parents=True)
backup.chmod(0o700)
targets = [('auth.conf', 'codex-java-auth.conf'), ('headers.conf', 'codex-java-headers.conf'), ('locations.conf', 'codex-java.conf'), ('proxy.conf', 'codex-java-proxy.conf')]
prior = {}
for name, target in targets:
    path = Path('/etc/nginx/snippets') / target
    prior[path] = path.read_text() if path.exists() else None
    if prior[path] is not None:
        write_atomic(backup / target, prior[path], 0o600)
    write_atomic(path, (source / name).read_text())
include = 'include /etc/nginx/snippets/codex-java.conf;'
if include not in original:
    write_atomic(backup / 'zhaoyang.fr.conf', original, 0o600)
    write_atomic(vhost, original.replace(anchor, include + '\n' + anchor))
check = subprocess.run(['nginx', '-t'], capture_output=True, text=True)
if check.returncode:
    for path, previous in prior.items():
        if previous is None:
            path.unlink()
        else:
            write_atomic(path, previous)
    write_atomic(vhost, original)
    sys.exit('Nginx validation failed; previous files restored, no reload performed.')
subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
# Legacy credential file belongs only to the old version of this route.
legacy = Path('/etc/nginx/private/codex-java.htpasswd')
if legacy.exists():
    legacy.unlink()
print('Custom access-code gateway ready. Nginx validated and reloaded; credentials not displayed.')
