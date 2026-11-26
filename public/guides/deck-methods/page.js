// /guides/deck-methods/ : theme button, the seven cues that drive the reel, language links that keep the place.
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

  // Reel. The player in the frame exposes __deck (seek, play, pause, slides) and prints the current slide in #clock.
  const frame = document.getElementById('player');
  const screen = frame.closest('.screen');
  const bar = document.querySelector('.topbar');
  const methods = [...document.querySelectorAll('.method[data-chapter]')];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let deck = null;
  let asked = null;

  const chosen = () => methods.find(method => method.dataset.chapter === new URLSearchParams(location.search).get('m'));
  function startOf(method) {
    const slide = deck.slides[Number(method.dataset.first) - 1];
    return slide.start + slide.trd;
  }
  function mark(slide) {
    frame.dataset.slide = String(slide);
    for (const method of methods) {
      const on = slide >= Number(method.dataset.first) && slide <= Number(method.dataset.last);
      method.classList.toggle('is-playing', on);
      const cue = method.querySelector('.cue');
      if (on) cue.setAttribute('aria-current', 'true'); else cue.removeAttribute('aria-current');
    }
  }
  function connect() {
    if (deck) return;
    let view, clock;
    try { view = frame.contentWindow; clock = frame.contentDocument.getElementById('clock'); } catch { return; }
    if (!view || !view.__deck || !clock) return;
    deck = view.__deck;
    const read = () => mark(parseInt(clock.textContent, 10) || 0);
    new MutationObserver(read).observe(clock, {childList: true, characterData: true, subtree: true});
    const wanted = asked || chosen();
    if (asked) { deck.seek(startOf(asked)); deck.play(); }
    else if (still) { deck.pause(); deck.seek(wanted ? startOf(wanted) : 0); }
    else if (wanted) deck.seek(startOf(wanted));
    read();
    root.classList.add('reel-ready');
  }
  frame.addEventListener('load', connect);
  connect();

  for (const method of methods) method.querySelector('.cue').addEventListener('click', () => {
    // The chosen method goes in the address, so a reload or a language change returns to it.
    const url = new URL(location.href);
    url.searchParams.set('m', method.dataset.chapter);
    history.replaceState(history.state, '', url);
    if (deck) { deck.seek(startOf(method)); deck.play(); } else asked = method;
    // Bring the whole reel into view. Near the end of the list the pinned reel slides up under the bar.
    const box = screen.getBoundingClientRect(), under = bar.getBoundingClientRect().bottom;
    const behavior = still ? 'auto' : 'smooth';
    if (box.top < under - 1) scrollBy({top: box.top - under, behavior});
    else if (box.bottom > innerHeight) screen.scrollIntoView({block: 'nearest', behavior});
  });

  // Language links carry the chosen method and the item being read.
  function place() {
    if (scrollY < 8) return '';
    // The reading line is under the bar, and under the reel while the reel is pinned.
    const pinned = getComputedStyle(screen).position === 'sticky' ? screen.getBoundingClientRect().bottom : 0;
    const line = Math.max(bar.getBoundingClientRect().bottom, pinned) + 20;
    let current = '';
    for (const anchor of document.querySelectorAll('[data-anchor]')) if (anchor.getBoundingClientRect().top <= line) current = anchor.id;
    return current;
  }
  for (const link of document.querySelectorAll('.languages a')) {
    const carry = () => {
      const url = new URL(link.getAttribute('href'), location.href);
      const id = place();
      url.search = location.search;
      url.hash = id ? '#' + id : '';
      link.href = url.href;
    };
    for (const type of ['click', 'auxclick', 'contextmenu']) link.addEventListener(type, carry);
  }
})();
