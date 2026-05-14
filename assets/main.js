/* ─────────────────────────────────────────────
   Shared behaviour across all pages:
   - sticky nav scroll state
   - mobile menu toggle
   - active-link highlighting (by current page)
   - card IntersectionObserver helper
   ───────────────────────────────────────────── */

(function () {
  // ─── NAV SCROLL ───
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 60) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── MOBILE MENU ───
  const navToggle  = document.getElementById('navToggle');
  const navOverlay = document.getElementById('navOverlay');
  const navClose   = document.getElementById('navClose');
  if (navToggle && navOverlay && navClose) {
    const closeOverlay = () => navOverlay.classList.remove('open');
    navToggle.addEventListener('click', () => navOverlay.classList.add('open'));
    navClose.addEventListener('click', closeOverlay);
    document.querySelectorAll('.nav-overlay a').forEach(a =>
      a.addEventListener('click', closeOverlay)
    );
  }

  // ─── ACTIVE NAV LINK BY PAGE ───
  const page = document.body.dataset.page;
  if (page) {
    document.querySelectorAll('[data-nav-page]').forEach(el => {
      if (el.dataset.navPage === page) el.classList.add('active');
    });
  }

  // ─── data-href click pattern ───
  // For "card-like" rows that can't be wrapped in a single <a> because they
  // contain inner anchors (e.g. talk rows with LinkedIn/Slides/Video pills).
  // Set data-href on the container and JS opens it on click — except when the
  // click started on a real <a> or <button> inside, which behaves normally.
  document.addEventListener('click', (e) => {
    const inner = e.target.closest('a, button');
    if (inner) return;
    const row = e.target.closest('[data-href]');
    if (!row) return;
    const href = row.dataset.href;
    if (!href || href === '#') return;
    if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener');
    } else {
      window.location.href = href;
    }
  });

  // ─── THEME TOGGLE ───
  // The initial theme is set by an inline script in <head> before CSS loads,
  // so there's no flash. Here we just wire up clicks on every .theme-toggle
  // button (nav + mobile overlay) and keep them in sync.
  const root = document.documentElement;
  const toggles = document.querySelectorAll('.theme-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      if (isLight) {
        root.removeAttribute('data-theme');
        try { localStorage.setItem('theme', 'dark'); } catch (e) {}
      } else {
        root.setAttribute('data-theme', 'light');
        try { localStorage.setItem('theme', 'light'); } catch (e) {}
      }
    });
  });

  // Track system preference changes — only apply if user hasn't set a preference.
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handle = (e) => {
      let saved = null;
      try { saved = localStorage.getItem('theme'); } catch (err) {}
      if (saved) return;
      if (e.matches) root.setAttribute('data-theme', 'light');
      else root.removeAttribute('data-theme');
    };
    if (mq.addEventListener) mq.addEventListener('change', handle);
    else if (mq.addListener) mq.addListener(handle);
  }
})();

// ─── HELPERS ───
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).toUpperCase();
  } catch (e) { return iso; }
}

function platformBadge(p) {
  if (!p) return null;
  const k = p.toLowerCase();
  if (k === 'hackthebox') return { cls: 'platform-htb',     label: 'HTB' };
  if (k === 'tryhackme')  return { cls: 'platform-thm',     label: 'THM' };
  if (k === 'vulnhub')    return { cls: 'platform-vulnhub', label: 'VulnHub' };
  return { cls: 'platform-vulnhub', label: p };
}

/* ─── STATS COUNT-UP ───
   When the stats bar scrolls into view, each .stat-value counts up from 0
   to its target with an ease-out curve. Fires once per page load. */
(function () {
  const statsSection = document.querySelector('.stats');
  if (!statsSection) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let fired = false;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || fired) return;
      fired = true;
      statsSection.querySelectorAll('.stat-value').forEach(animateStatValue);
      obs.disconnect();
    });
  }, { threshold: 0.35 });

  obs.observe(statsSection);

  function animateStatValue(el) {
    const raw = el.textContent.trim();
    const m = raw.match(/^(\d+)(.*)$/);
    if (!m) return;
    const target = parseInt(m[1], 10);
    const suffix = m[2];
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    el.textContent = '0' + suffix;
    requestAnimationFrame(tick);
  }
})();

function observeCards(selector) {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 110);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(c => obs.observe(c));
}

/* ─────────────────────────────────────────────
   EFFECTS LAYER — spotlight, glitch reveal, palette, live-tail terminal
   ───────────────────────────────────────────── */

const REDUCED_MOTION = window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── 1. CURSOR SPOTLIGHT ───
   Attach pointermove on every "card-like" element. JS-side, we only set
   two CSS custom properties (--mx, --my); the gradient itself lives in CSS. */
const SPOTLIGHT_SELECTORS = [
  '.card', '.featured-card', '.capability', '.tool-card',
  '.topic', '.expertise', '.channel', '.about-teaser-side',
  '.hero-card-post', '.hero-card-now'
].join(', ');

function bindSpotlight(root) {
  (root || document).querySelectorAll(SPOTLIGHT_SELECTORS).forEach(el => {
    if (el.dataset.spotlightBound) return;
    el.dataset.spotlightBound = '1';
    el.classList.add('spotlight');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      el.style.setProperty('--mx', x + 'px');
      el.style.setProperty('--my', y + 'px');
      /* Normalised -0.5..0.5 — drives the 3D tilt in CSS via perspective+rotate */
      el.style.setProperty('--ry',  (x / r.width  - 0.5).toFixed(3));
      el.style.setProperty('--rx', -(y / r.height - 0.5).toFixed(3));
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0');
      el.style.setProperty('--ry', '0');
    });
  });
}
bindSpotlight();

// Cards are often rendered late (research grid, tools grid). Watch for inserts.
const spotObs = new MutationObserver(() => bindSpotlight());
spotObs.observe(document.body, { childList: true, subtree: true });

/* ─── 2. H2 LETTER REVEAL + GLITCH ───
   Each .glitch element gets its text split into <span class="ltr"> children
   when it scrolls into view. Letters slide+fade in with a stagger; after the
   last letter settles, the existing glitch animation fires for one beat. */
(function () {
  const targets = document.querySelectorAll('.glitch');
  if (!targets.length || REDUCED_MOTION) return;

  /* Walk text nodes, wrap each character in a <span class="ltr"> with an
     individual animation-delay. Preserves inline structure (<br>, <span>). */
  function splitLetters(el) {
    let idx = 0;
    function walk(node) {
      if (node.nodeType === 3) {
        const text = node.textContent;
        if (!text || !text.trim()) return;
        const frag = document.createDocumentFragment();
        for (const ch of text) {
          if (ch === ' ') {
            frag.appendChild(document.createTextNode(' '));
            idx++;
            continue;
          }
          const s = document.createElement('span');
          s.className = 'ltr';
          s.style.animationDelay = (idx * 0.035) + 's';
          s.textContent = ch;
          frag.appendChild(s);
          idx++;
        }
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        [...node.childNodes].forEach(walk);
      }
    }
    walk(el);
    return idx;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const count = splitLetters(el);
      requestAnimationFrame(() => el.classList.add('letters-in'));
      /* After the last letter finishes its 0.85s animation, fire the
         glitch for one beat. count*35ms stagger + 900ms anim. */
      const total = count * 35 + 900;
      setTimeout(() => el.classList.add('go'), total);
      obs.unobserve(el);
    });
  }, { threshold: 0.35 });
  targets.forEach(t => obs.observe(t));
})();

/* ─── 3. COMMAND PALETTE ───
   Cmd+K (Mac) / Ctrl+K (others) / "/" opens a fuzzy nav palette built from
   DATA. We inject the DOM once into <body>, then drive everything from JS. */
(function () {
  // DATA may not be loaded yet (palette init runs from main.js, which may load
  // before data.js on some pages). Defer until window.DATA is present.
  function init() {
    if (typeof DATA === 'undefined') {
      setTimeout(init, 30);
      return;
    }
    mount();
  }

  function mount() {
    const items = buildItems(DATA);

    const wrap = document.createElement('div');
    wrap.className = 'palette';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'Command palette');
    wrap.innerHTML = `
      <div class="palette-backdrop"></div>
      <div class="palette-modal">
        <div class="palette-header">
          <span class="palette-prompt">&gt;</span>
          <input class="palette-input" type="text" placeholder="Jump to a page, post, tool, or talk..." autocomplete="off" spellcheck="false" />
          <kbd>ESC</kbd>
        </div>
        <div class="palette-results"></div>
        <div class="palette-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd>&nbsp;navigate</span>
          <span><kbd>↵</kbd>&nbsp;select</span>
          <span><kbd>esc</kbd>&nbsp;close</span>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    const input    = wrap.querySelector('.palette-input');
    const resultsEl= wrap.querySelector('.palette-results');
    const backdrop = wrap.querySelector('.palette-backdrop');

    let activeIdx = 0;
    let filtered  = items;

    function render() {
      if (!filtered.length) {
        resultsEl.innerHTML = `<div class="palette-empty">No matches. Try a different query.</div>`;
        return;
      }
      // Group rendering preserving order
      const groups = {};
      const groupOrder = [];
      filtered.forEach((it, i) => {
        if (!groups[it.section]) { groups[it.section] = []; groupOrder.push(it.section); }
        groups[it.section].push({ ...it, _i: i });
      });

      resultsEl.innerHTML = groupOrder.map(g => `
        <div class="palette-group">
          <div class="palette-group-title">${g}</div>
          ${groups[g].map(it => `
            <div class="palette-item ${it._i === activeIdx ? 'active' : ''}" data-idx="${it._i}">
              <span class="pi-icon">${it.icon}</span>
              <span class="pi-label">${escapeHTML(it.label)}</span>
              ${it.hint ? `<span class="pi-hint">${escapeHTML(it.hint)}</span>` : ''}
            </div>
          `).join('')}
        </div>
      `).join('');

      resultsEl.querySelectorAll('.palette-item').forEach(el => {
        el.addEventListener('mouseenter', () => {
          activeIdx = parseInt(el.dataset.idx, 10);
          updateActive();
        });
        el.addEventListener('click', () => {
          activeIdx = parseInt(el.dataset.idx, 10);
          execute(filtered[activeIdx]);
        });
      });
      scrollActiveIntoView();
    }

    function updateActive() {
      resultsEl.querySelectorAll('.palette-item').forEach(el => {
        const idx = parseInt(el.dataset.idx, 10);
        el.classList.toggle('active', idx === activeIdx);
      });
      scrollActiveIntoView();
    }

    function scrollActiveIntoView() {
      const el = resultsEl.querySelector('.palette-item.active');
      if (el) el.scrollIntoView({ block: 'nearest' });
    }

    function filter(q) {
      const query = q.trim().toLowerCase();
      if (!query) { filtered = items; activeIdx = 0; render(); return; }
      filtered = items.filter(it => {
        return it.label.toLowerCase().includes(query) ||
               (it.hint && it.hint.toLowerCase().includes(query)) ||
               (it.section && it.section.toLowerCase().includes(query)) ||
               (it.keywords && it.keywords.some(k => k.toLowerCase().includes(query)));
      });
      activeIdx = 0;
      render();
    }

    function open() {
      wrap.classList.add('open');
      input.value = '';
      filtered = items;
      activeIdx = 0;
      render();
      setTimeout(() => input.focus(), 20);
    }

    function close() {
      wrap.classList.remove('open');
    }

    function execute(item) {
      if (!item) return;
      close();
      if (item.action === 'toggle-theme') {
        const t = document.querySelector('.theme-toggle');
        if (t) t.click();
        return;
      }
      if (item.url && item.url.startsWith('http')) {
        window.open(item.url, '_blank', 'noopener');
        return;
      }
      if (item.url && item.url !== '#') window.location.href = item.url;
    }

    // Keyboard — global open shortcut + in-palette navigation.
    document.addEventListener('keydown', (e) => {
      const isOpen = wrap.classList.contains('open');
      const isMod  = e.metaKey || e.ctrlKey;

      if (!isOpen && isMod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        open();
        return;
      }
      if (!isOpen && e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        open();
        return;
      }
      if (!isOpen) return;

      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIdx = Math.min(filtered.length - 1, activeIdx + 1);
        updateActive();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIdx = Math.max(0, activeIdx - 1);
        updateActive();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        execute(filtered[activeIdx]);
      }
    });

    backdrop.addEventListener('click', close);
    input.addEventListener('input', (e) => filter(e.target.value));

    // Expose for the search button (clickable to open palette)
    window.__openPalette = open;

    // Inject a Search button into the top nav (next to logo) and the
    // mobile burger overlay. One source of truth for the markup.
    const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
    const SEARCH_ICON_SVG = '<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="6.25"/><line x1="13.5" y1="13.5" x2="17.5" y2="17.5"/></svg>';
    const SHORTCUT_LABEL  = isMac ? '⌘ K' : 'Ctrl K';

    function makeSearchButton() {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-btn';
      btn.setAttribute('aria-label', 'Open search');
      btn.title = 'Search (' + SHORTCUT_LABEL + ')';
      btn.innerHTML =
        SEARCH_ICON_SVG +
        '<span class="search-label">Search</span>' +
        '<kbd>' + SHORTCUT_LABEL + '</kbd>';
      btn.addEventListener('click', open);
      return btn;
    }

    // Top nav
    const logo = document.querySelector('.nav-inner .logo');
    if (logo && !logo.parentElement.querySelector('.search-btn')) {
      logo.insertAdjacentElement('afterend', makeSearchButton());
    }

    // Mobile overlay — placed at the bottom of the link stack
    const overlay = document.getElementById('navOverlay');
    if (overlay && !overlay.querySelector('.search-btn')) {
      const overlayBtn = makeSearchButton();
      // Close the overlay when the search is invoked from inside it.
      overlayBtn.addEventListener('click', () => overlay.classList.remove('open'));
      overlay.appendChild(overlayBtn);
    }
  }

  function buildItems(data) {
    const items = [
      { kind: 'page', icon: '◇', label: 'Home',     url: 'index.html',    section: 'Pages' },
      { kind: 'page', icon: '◇', label: 'Research', url: 'research.html', section: 'Pages' },
      { kind: 'page', icon: '◇', label: 'Talks',    url: 'talks.html',    section: 'Pages' },
      { kind: 'page', icon: '◇', label: 'Tools',    url: 'tools.html',    section: 'Pages' },
      { kind: 'page', icon: '◇', label: 'About',    url: 'about.html',    section: 'Pages' },
      { kind: 'page', icon: '◇', label: 'Contact',  url: 'contact.html',  section: 'Pages' },

      { kind: 'action', icon: '☼', label: 'Toggle light / dark mode', action: 'toggle-theme', section: 'Actions', keywords: ['theme', 'dark', 'light'] },
      { kind: 'action', icon: '↗', label: 'Open blog (Hashnode)',  url: (data.links && data.links.hashnode) || '#', section: 'Actions', keywords: ['blog', 'writing'] },
      { kind: 'action', icon: '↗', label: 'Open GitHub',            url: (data.links && data.links.github)   || '#', section: 'Actions', keywords: ['code', 'repos'] },
      { kind: 'action', icon: '↗', label: 'Open LinkedIn',          url: (data.links && data.links.linkedin) || '#', section: 'Actions' },
      { kind: 'action', icon: '↗', label: 'Open Twitter / X',       url: (data.links && data.links.twitter)  || '#', section: 'Actions' }
    ];

    (data.posts || []).forEach(p => {
      items.push({
        kind: 'post',
        icon: '✎',
        label: p.title,
        hint: p.type,
        url: p.url || '#',
        section: 'Research',
        keywords: p.tags
      });
    });

    (data.tools || []).forEach(t => {
      items.push({
        kind: 'tool',
        icon: '⌬',
        label: t.name,
        hint: t.lang,
        url: t.url || '#',
        section: 'Tools',
        keywords: t.stack
      });
    });

    (data.talks || []).forEach(t => {
      items.push({
        kind: 'talk',
        icon: '◆',
        label: t.title,
        hint: t.event,
        url: 'talks.html',
        section: 'Talks',
        keywords: [t.location, t.type, t.audience].filter(Boolean)
      });
    });

    return items;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  init();
})();

/* ─── 4. LIVE-TAIL TERMINAL ───
   Call startLiveTail(terminalEl) after the typewriter finishes. It appends
   a dim log line every ~6–10 seconds, capped at MAX visible lines. */
function startLiveTail(terminal) {
  if (!terminal || REDUCED_MOTION) return;
  const MAX = 12;
  const MESSAGES = [
    { level: 'info',  text: 'passive-dns sweep complete · 4 new domains' },
    { level: 'info',  text: 'jarm scan: 173.x.x.x — match: cs-default' },
    { level: 'debug', text: 'ioc feed sync · +12 entries' },
    { level: 'warn',  text: 'beacon detected · interval=60s · jitter=20%' },
    { level: 'info',  text: 'adcs enum: 18 templates analysed' },
    { level: 'debug', text: 'bloodhound query: shortest path · 0.4s' },
    { level: 'warn',  text: 'phishing kit fingerprint observed · evilginx2' },
    { level: 'info',  text: 'malware sample triaged · family=lockbit-derived' },
    { level: 'debug', text: 'tls handshake captured · fingerprint stored' },
    { level: 'info',  text: 'volatility plugin: malfind · 2 suspect regions' },
    { level: 'warn',  text: 'fast-flux cluster observed · 18 unique a-records' },
    { level: 'debug', text: 'yara sweep · 0 hits across 412 samples' }
  ];

  // Start clock from a "current" time and tick by ~30–60s per line so the
  // log looks like it's accumulating in real time.
  let clock = new Date();
  clock.setSeconds(0);

  function tickClock() {
    const bump = 25 + Math.floor(Math.random() * 60);
    clock = new Date(clock.getTime() + bump * 1000);
    return clock.toTimeString().slice(0, 8);
  }

  function append() {
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    const ts  = tickClock();
    const line = document.createElement('div');
    line.className = 'tail-line';
    line.innerHTML = `<span class="ts">${ts}</span> <span class="tag-${msg.level}">[${msg.level.toUpperCase()}]</span> ${escapeTermHTML(msg.text)}`;

    // Insert before the trailing blink cursor so the cursor stays at bottom.
    const blink = terminal.querySelector('.blink');
    if (blink && blink.parentElement && blink.parentElement.parentElement === terminal) {
      terminal.insertBefore(line, blink.parentElement);
    } else {
      terminal.appendChild(line);
    }

    // Cap to MAX tail lines — older lines fade out.
    const tails = terminal.querySelectorAll('.tail-line');
    if (tails.length > MAX) {
      tails[0].remove();
    }

    schedule();
  }

  function schedule() {
    const delay = 6000 + Math.floor(Math.random() * 4000);
    setTimeout(append, delay);
  }

  function escapeTermHTML(s) {
    return String(s).replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c]));
  }

  schedule();
}

/* ─── 5. PAGE TRANSITIONS — amber sweep ───
   Intercept clicks on internal links and play a 200ms amber sweep before
   navigation. External links, hash links, mailto, and target=_blank skip it.
   On page load, replay the sweep going the other way to soften the inbound.
   Skipped entirely on the home page — landing reads cleaner without it. */
(function () {
  if (REDUCED_MOTION) return;
  if (document.body.dataset.page === 'home') return;

  /* Inbound sweep is handled by CSS (body::after) so it appears from the
     first paint, before this script even loads. See styles.css. */

  /* Outbound sweep on internal link click */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;
    /* Skip: external, hash, mailto/tel, _blank, modifier keys held */
    if (href.startsWith('http') || href.startsWith('#') ||
        href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (link.target === '_blank') return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    const sweep = document.createElement('div');
    sweep.className = 'page-sweep';
    document.body.appendChild(sweep);
    setTimeout(() => { window.location.href = href; }, 550);
  });
})();
