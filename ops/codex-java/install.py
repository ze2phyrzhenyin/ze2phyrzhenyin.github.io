#!/usr/bin/env python3
"""Install the authorized route guard on rex-ovh. Read credentials from stdin only."""
import datetime
import grp
import json
import os
from pathlib import Path
import re
import subprocess
import sys

assert os.geteuid() == 0, 'Must run as the authorized server administrator'
source = Path(__file__).resolve().parent
vhost = Path('/etc/nginx/sites-available/zhaoyang.fr')
assert vhost.exists(), 'Expected zhaoyang.fr vhost is missing'
original = vhost.read_text()
anchor = 'include /etc/nginx/snippets/static-siteweb.conf;'
assert original.count(anchor) == 1, 'Unexpected vhost structure; inspect before changing'
data = json.load(sys.stdin)
assert re.fullmatch(r'sk-[A-Za-z0-9_-]{100,}', data['key']), 'Invalid secret format'
assert data['username'] == 'friend'
assert re.fullmatch(r'[A-Za-z0-9_-]{20,}', data['accessCode']), 'Access code too short'
www_gid = grp.getgrnam('www-data').gr_gid

def private_dir(path):
    path.mkdir(parents=True, exist_ok=True)
    path.chmod(0o750)
    os.chown(path, 0, www_gid)

def write_atomic(path, body, mode=0o640, gid=www_gid):
    temp = path.with_name(path.name + '.codex-java-new')
    fd = os.open(temp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, mode)
    with os.fdopen(fd, 'w') as f:
        f.write(body)
    os.chown(temp, 0, gid)
    os.replace(temp, path)

private_dir(Path('/etc/nginx/private'))
private_dir(Path('/var/lib/siteweb-private'))
private_dir(Path('/var/lib/siteweb-private/codex-java'))
password_hash = subprocess.run(['openssl', 'passwd', '-6', '-stdin'], input=data['accessCode'] + '\n', text=True, capture_output=True, check=True).stdout.strip()
assert password_hash.startswith('$6$')
write_atomic(Path('/etc/nginx/private/codex-java.htpasswd'), 'friend:' + password_hash + '\n')
write_atomic(Path('/var/lib/siteweb-private/codex-java/key.json'), json.dumps({'key': data['key'], 'expiresAt': data['expiresAt']}) + '\n')
for name, target in [('auth.conf', 'codex-java-auth.conf'), ('locations.conf', 'codex-java.conf')]:
    write_atomic(Path('/etc/nginx/snippets') / target, (source / name).read_text(), 0o644, 0)
include = 'include /etc/nginx/snippets/codex-java.conf;'
if include not in original:
    backup = Path('/var/backups/siteweb-codex-java')
    backup.mkdir(parents=True, exist_ok=True)
    backup.chmod(0o700)
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    write_atomic(backup / (stamp + '-zhaoyang.fr.conf'), original, 0o600, 0)
    write_atomic(vhost, original.replace(anchor, include + '\n' + anchor), 0o644, 0)
check = subprocess.run(['nginx', '-t'], capture_output=True, text=True)
if check.returncode:
    write_atomic(vhost, original, 0o644, 0)
    print('Nginx validation failed; original vhost restored. No reload performed.', file=sys.stderr)
    sys.exit(1)
subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
print('Protected tutorial route installed; nginx configuration validated and reloaded. Secrets not displayed.')
