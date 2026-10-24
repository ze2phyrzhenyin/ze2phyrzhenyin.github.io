const form = document.querySelector('#gate-form');
const input = document.querySelector('#access-code');
const toggle = document.querySelector('#toggle-code');
const message = document.querySelector('#gate-message');
const submit = form.querySelector('[type=submit]');
toggle.addEventListener('click', () => {
  const visible = input.type === 'password';
  input.type = visible ? 'text' : 'password';
  toggle.setAttribute('aria-label', visible ? '隐藏访问码' : '显示访问码');
  toggle.setAttribute('aria-pressed', String(visible));
});
input.addEventListener('input', () => {
  message.textContent = '';
  input.removeAttribute('aria-invalid');
  input.closest('.input-wrap').classList.remove('invalid');
});
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submit.disabled) return;
  submit.disabled = true;
  document.querySelector('#submit-text').textContent = '正在为你打开…';
  message.textContent = '';
  try {
    const response = await fetch(form.action, {
      method: 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({ code: input.value.trim() }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '暂时无法进入，请稍后再试。');
    input.value = '';
    location.replace('/guides/codex-java/');
  } catch (error) {
    message.textContent = error instanceof TypeError ? '网络暂时没有连接上，请稍后再试。' : error.message;
    input.setAttribute('aria-invalid', 'true');
    input.closest('.input-wrap').classList.add('invalid');
    input.focus(); input.select();
    submit.disabled = false;
    document.querySelector('#submit-text').textContent = '进入教程';
  }
});
window.addEventListener('pageshow', () => {
  submit.disabled = false;
  document.querySelector('#submit-text').textContent = '进入教程';
});
