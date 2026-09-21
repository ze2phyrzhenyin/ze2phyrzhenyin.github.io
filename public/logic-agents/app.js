const filterButtons = Array.from(document.querySelectorAll('.filter-button'));
const agentCards = Array.from(document.querySelectorAll('.agent-card'));
const filterEmpty = document.querySelector('#filter-empty');

function applyFilter(filter) {
  let visibleCount = 0;

  for (const card of agentCards) {
    const visible = filter === 'all' || card.dataset.group === filter;
    card.hidden = !visible;
    card.classList.toggle('is-entering', visible);
    if (visible) visibleCount += 1;
  }

  for (const button of filterButtons) {
    const selected = button.dataset.filter === filter;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  }

  if (filterEmpty) filterEmpty.hidden = visibleCount !== 0;
}

for (const button of filterButtons) {
  button.addEventListener('click', () => applyFilter(button.dataset.filter));
}

const copyButton = document.querySelector('#copy-spec');
const specTemplate = document.querySelector('#spec-template');
const copyStatus = document.querySelector('#copy-status');

async function copyTemplate() {
  const value = specTemplate?.textContent?.trim() ?? '';
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    copyStatus.textContent = 'Template copied.';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(specTemplate);
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = 'Automatic copy failed. The template text is selected.';
  }

  window.setTimeout(() => {
    copyStatus.textContent = '';
  }, 2400);
}

copyButton?.addEventListener('click', copyTemplate);

const navLinks = Array.from(document.querySelectorAll('.topnav a'));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && sections.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    for (const link of navLinks) {
      const current = link.getAttribute('href') === `#${visible.target.id}`;
      link.classList.toggle('is-current', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }, {
    rootMargin: '-20% 0px -65% 0px',
    threshold: [0, 0.15, 0.4],
  });

  sections.forEach((section) => observer.observe(section));
}
