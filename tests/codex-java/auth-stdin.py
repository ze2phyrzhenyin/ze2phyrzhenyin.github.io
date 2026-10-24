#!/usr/bin/env python3
"""Exercise the displayed Unix login snippet with a PTY and a fake Codex executable."""
import json
import os
from pathlib import Path
import pty
import select
import subprocess
import sys
import tempfile
import time

root = Path(__file__).resolve().parents[2]
source = root / 'public/guides/codex-java/content.js'
commands = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', f'import {{ unixLogin,windowsLogin }} from {json.dumps(source.as_uri())}; console.log(JSON.stringify({{unixLogin,windowsLogin}}));'], text=True))
with tempfile.TemporaryDirectory(prefix='codex-login-check-') as folder:
    folder = Path(folder)
    stub = folder / 'codex'
    stub.write_text('#!/bin/sh\n[ "$1" = login ] && [ "$2" = --with-api-key ] || exit 3\nvalue=$(cat)\n[ "$value" = "tutorial-dummy-input" ] || exit 4\nprintf "STDIN_OK\\n"\n')
    stub.chmod(0o700)
    for shell in ['/bin/bash', '/bin/zsh']:
        if not Path(shell).exists():
            continue
        for value, expected in [(b'tutorial-dummy-input\n', 0), (b'\n', 1)]:
            pid, fd = pty.fork()
            if pid == 0:
                os.environ['PATH'] = str(folder) + os.pathsep + os.environ['PATH']
                os.execv(shell, [shell, '-c', commands['unixLogin']])
            output = b''
            sent = False
            deadline = time.time() + 10
            while time.time() < deadline:
                ready, _, _ = select.select([fd], [], [], .1)
                if ready:
                    try:
                        chunk = os.read(fd, 4096)
                    except OSError:
                        break
                    if not chunk:
                        break
                    output += chunk
                if not sent and b'Paste API Key, then press Enter: ' in output:
                    os.write(fd, value)
                    sent = True
                done, status = os.waitpid(pid, os.WNOHANG)
                if done:
                    break
            else:
                os.kill(pid, 15)
                raise AssertionError('Hidden-input test timeout')
            try:
                _, status = os.waitpid(pid, 0)
            except ChildProcessError:
                pass
            os.close(fd)
            assert os.waitstatus_to_exitcode(status) == expected
            assert b'tutorial-dummy-input' not in output, 'Input was echoed'
            assert (b'STDIN_OK' in output) == (expected == 0)
            print(f'PASS {shell}: hidden stdin and empty-input handling ({expected})')
print('No real credential, Codex login state, or paid API was used.')
