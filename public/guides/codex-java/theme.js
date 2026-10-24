(() => {
  const saved = () => { try { return localStorage.getItem('codex-java-theme'); } catch { return null; } };
  let theme = saved();
  if (!['light', 'dark'].includes(theme)) theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  function apply() {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.textContent = theme === 'dark' ? '浅色' : '深色';
      button.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
    });
  }
  apply();
  document.addEventListener('DOMContentLoaded', apply);
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-theme-toggle]')) return;
    theme = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('codex-java-theme', theme); } catch { /* preference only */ }
    apply();
  });
})();
