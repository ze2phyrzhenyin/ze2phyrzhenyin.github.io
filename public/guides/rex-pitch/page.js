// /guides/rex-pitch/ : theme button, full screen for the deck player, language links that keep the place.
// All text comes from the page; this file holds none.
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');

  // Theme. The choice is stored by /guides/theme.js and shared with the other guides.
  const themeButton = document.getElementById('theme-toggle');
  function showTheme() {
    const dark = root.dataset.theme === 'dark';
    themeButton.textContent = dark ? themeButton.dataset.light : themeButton.dataset.dark;
    themeButton.setAttribute('aria-label', dark ? themeButton.dataset.toLight : themeButton.dataset.toDark);
  }
  if (themeButton && window.GuideTheme) {
    themeButton.addEventListener('click', () => window.GuideTheme.toggle());
    document.addEventListener('guide-theme-change', showTheme);
    showTheme();
  }

  // Full screen. The frame itself goes full screen, then takes the keyboard so that Space, arrows and a clicker reach the player.
  const frame = document.getElementById('player');
  const button = document.getElementById('fullscreen');
  const request = frame && (frame.requestFullscreen || frame.webkitRequestFullscreen);
  const enabled = document.fullscreenEnabled || document.webkitFullscreenEnabled;
  const current = () => document.fullscreenElement || document.webkitFullscreenElement || null;
  function focusPlayer() {
    frame.focus();
    try { frame.contentWindow.focus(); } catch { /* The player still gets clicks. */ }
  }
  if (button && request && enabled) {
    button.hidden = false;
    // Without a user gesture or with full screen refused, the new-tab link next to the button stays the way out.
    button.addEventListener('click', () => {
      try {
        const result = request.call(frame);
        if (result && result.catch) result.catch(() => focusPlayer());
      } catch { focusPlayer(); }
    });
    let wasFull = false;
    const changed = () => {
      if (current() === frame) { wasFull = true; focusPlayer(); }
      else if (wasFull) { wasFull = false; button.focus(); }
    };
    document.addEventListener('fullscreenchange', changed);
    document.addEventListener('webkitfullscreenchange', changed);
    // Keys that still reach this page while the player fills the screen are passed on to it.
    const keys = new Set([' ', 'Enter', 'ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp']);
    document.addEventListener('keydown', event => {
      if (current() !== frame || !keys.has(event.key)) return;
      let inner;
      try { inner = frame.contentDocument; } catch { return; }
      if (!inner) return;
      event.preventDefault();
      inner.dispatchEvent(new KeyboardEvent('keydown', {key: event.key, code: event.code, bubbles: true, cancelable: true}));
      focusPlayer();
    });
  }

  // Language links carry the section or slide being read.
  const bar = document.querySelector('.topbar');
  function place() {
    if (scrollY < 8) return '';
    const line = bar.getBoundingClientRect().bottom + 20;
    let found = '';
    for (const anchor of document.querySelectorAll('[data-anchor]')) if (anchor.getBoundingClientRect().top <= line) found = anchor.id;
    return found;
  }
  for (const link of document.querySelectorAll('.languages a')) {
    const carry = () => {
      const url = new URL(link.getAttribute('href'), location.href);
      const id = place();
      url.hash = id ? '#' + id : '';
      link.href = url.href;
    };
    for (const type of ['click', 'auxclick', 'contextmenu']) link.addEventListener(type, carry);
  }
})();
