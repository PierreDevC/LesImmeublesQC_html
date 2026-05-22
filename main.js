// ── Nav data ──
const navItems = [
  { label: "Accueil", href: "index.html" },
  { label: "Locations d'appartements", href: "#locations" },
  { label: "Le projet", href: "/projet" },
  { label: "Le quartier", href: "quartier.html" },
  { label: "FAQ", href: "#faq" },
  { label: "Galerie", href: "#galerie" },
  { label: "À propos", href: "apropos.html" },
  { label: "Contact", href: "#footer" },
];

// ── Marquee ──
function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  const text = "Fais une réservation maintenant au 514 908-0303.";
  const html = Array(20).fill(null).map(() =>
    `<span class="marquee-item">${text}</span>`
  ).join('');
  track.innerHTML = html + html;
}

// ── Schools marquee ──
(function () {
  const track = document.getElementById('schools-track');
  if (!track) return;
  const schools = ['Concordia', 'Dawson', 'LaSalle', 'McGill'];
  const items = Array(8).fill(schools).flat()
    .map(s => `<span class="schools-item">${s}</span>`).join('');
  track.innerHTML = items + items;
})();

// ── Desktop nav ──
let openDropdownLabel = null;
let closeTimer = null;

function buildDesktopNav() {
  const nav = document.getElementById('nav-links');
  navItems.forEach(item => {
    if (item.children) {
      const btn = document.createElement('button');
      btn.className = 'nav-btn';
      btn.dataset.label = item.label;
      btn.innerHTML = `${item.label} <svg class="nav-chevron" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      btn.addEventListener('mouseenter', () => openNav(item.label));
      btn.addEventListener('mouseleave', scheduleClose);
      nav.appendChild(btn);
    } else {
      const a = document.createElement('a');
      a.href = item.href;
      a.className = 'nav-btn';
      a.textContent = item.label;
      a.addEventListener('mouseenter', scheduleClose);
      nav.appendChild(a);
    }
  });
}

function openNav(label) {
  if (closeTimer) clearTimeout(closeTimer);
  openDropdownLabel = label;
  const panel = document.getElementById('dropdown-panel');
  const inner = document.getElementById('dropdown-inner');
  const item = navItems.find(i => i.label === label);
  inner.innerHTML = '';
  if (item && item.children) {
    item.children.forEach(child => {
      const a = document.createElement('a');
      a.href = child.href;
      a.className = 'dropdown-link';
      a.textContent = child.label;
      a.addEventListener('click', closeNav);
      inner.appendChild(a);
    });
    panel.classList.add('open');
  }
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('open', b.dataset.label === label);
  });
}

function closeNav() {
  openDropdownLabel = null;
  document.getElementById('dropdown-panel').classList.remove('open');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('open'));
}

function scheduleClose() {
  closeTimer = setTimeout(closeNav, 120);
}

function bindDropdownPanel() {
  document.getElementById('dropdown-panel').addEventListener('mouseenter', () => {
    if (closeTimer) clearTimeout(closeTimer);
  });
  document.getElementById('dropdown-panel').addEventListener('mouseleave', scheduleClose);
}

// ── Mobile nav ──
let mobileOpen = false;
let mobileOpenItem = null;

function buildMobileNav() {
  const inner = document.getElementById('mobile-menu-inner');
  navItems.forEach(item => {
    const wrap = document.createElement('div');
    const btn = document.createElement('button');
    btn.className = 'mobile-nav-btn';
    if (item.children) {
      const id = item.label.replace(/\s/g, '');
      btn.innerHTML = `${item.label} <svg class="mobile-chevron" id="mc-${id}" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      btn.addEventListener('click', () => toggleMobileSub(item.label));
      const sub = document.createElement('div');
      sub.className = 'mobile-sub';
      sub.id = `msub-${id}`;
      const subInner = document.createElement('div');
      subInner.className = 'mobile-sub-inner';
      item.children.forEach(child => {
        const a = document.createElement('a');
        a.href = child.href;
        a.className = 'mobile-sub-link';
        a.textContent = child.label;
        a.addEventListener('click', () => { mobileOpen = false; updateMobileMenu(); });
        subInner.appendChild(a);
      });
      sub.appendChild(subInner);
      wrap.appendChild(btn);
      wrap.appendChild(sub);
    } else {
      btn.textContent = item.label;
      btn.addEventListener('click', () => { window.location.href = item.href; });
      wrap.appendChild(btn);
    }
    inner.appendChild(wrap);
  });
  const cta = document.createElement('a');
  cta.href = '/louer';
  cta.className = 'mobile-cta';
  cta.textContent = 'Louer un appartement';
  cta.addEventListener('click', () => { mobileOpen = false; updateMobileMenu(); });
  inner.appendChild(cta);
}

function toggleMobileSub(label) {
  mobileOpenItem = mobileOpenItem === label ? null : label;
  navItems.forEach(item => {
    if (!item.children) return;
    const id = item.label.replace(/\s/g, '');
    const sub = document.getElementById(`msub-${id}`);
    const chev = document.getElementById(`mc-${id}`);
    if (sub) sub.classList.toggle('open', mobileOpenItem === item.label);
    if (chev) chev.classList.toggle('open', mobileOpenItem === item.label);
  });
}

function updateMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('open', mobileOpen);
  document.getElementById('hamburger').classList.toggle('open', mobileOpen);
}

function bindHamburger() {
  document.getElementById('hamburger').addEventListener('click', () => {
    mobileOpen = !mobileOpen;
    mobileOpenItem = null;
    updateMobileMenu();
  });
}

// ── Navbar scroll shrink + auto-hide ──
let lastScrollY = 0;
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const navbar = document.getElementById('navbar');
      const currentY = window.scrollY;

      navbar.classList.toggle('scrolled', currentY > 40);

      if (currentY > 80) {
        navbar.classList.toggle('nav-hidden', currentY > lastScrollY);
      } else {
        navbar.classList.remove('nav-hidden');
      }

      if (currentY > lastScrollY && mobileOpen) {
        mobileOpen = false;
        updateMobileMenu();
      }

      lastScrollY = currentY;
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// ── Hero scroll expand ──
window.addEventListener('scroll', () => {
  const c = document.getElementById('hero-container');
  if (!c) return;
  const maxPad = window.innerWidth < 768 ? 8 : 24;
  const progress = Math.min(window.scrollY / 500, 1);
  const pad = Math.round((1 - progress) * maxPad);
  c.style.marginLeft = pad + 'px';
  c.style.marginRight = pad + 'px';
  c.style.borderRadius = `${pad}px ${pad}px 0 0`;
}, { passive: true });

// ── Apartment table ──
const units = [
  { unite: "1",  superficie: 420, chambres: "1 chambre", sallesDeBain: 1, prix: 1400, occupation: "—", statut: "Occupé" },
  { unite: "2",  superficie: 390, chambres: "1 chambre", sallesDeBain: 1, prix: 1350, occupation: "—", statut: "Occupé" },
  { unite: "3",  superficie: 450, chambres: "1 chambre", sallesDeBain: 1, prix: 1425, occupation: "—", statut: "Occupé" },
  { unite: "4",  superficie: 410, chambres: "1 chambre", sallesDeBain: 1, prix: 1380, occupation: "—", statut: "Occupé" },
  { unite: "5",  superficie: 480, chambres: "1 chambre", sallesDeBain: 1, prix: 1450, occupation: "—", statut: "Occupé" },
  { unite: "6",  superficie: 400, chambres: "1 chambre", sallesDeBain: 1, prix: 1360, occupation: "—", statut: "Occupé" },
  { unite: "7",  superficie: 430, chambres: "1 chambre", sallesDeBain: 1, prix: 1410, occupation: "—", statut: "Occupé" },
  { unite: "8",  superficie: 460, chambres: "1 chambre", sallesDeBain: 1, prix: 1440, occupation: "—", statut: "Occupé" },
  { unite: "9",  superficie: 395, chambres: "1 chambre", sallesDeBain: 1, prix: 1355, occupation: "—", statut: "Occupé" },
  { unite: "10", superficie: 470, chambres: "1 chambre", sallesDeBain: 1, prix: 1460, occupation: "—", statut: "Occupé" },
  { unite: "11", superficie: 415, chambres: "1 chambre", sallesDeBain: 1, prix: 1390, occupation: "—", statut: "Occupé" },
  { unite: "12", superficie: 440, chambres: "1 chambre", sallesDeBain: 1, prix: 1420, occupation: "—", statut: "Occupé" },
  { unite: "13", superficie: 405, chambres: "1 chambre", sallesDeBain: 1, prix: 1370, occupation: "—", statut: "Occupé" },
  { unite: "14", superficie: 490, chambres: "1 chambre", sallesDeBain: 1, prix: 1475, occupation: "—", statut: "Occupé" },
  { unite: "15", superficie: 425, chambres: "1 chambre", sallesDeBain: 1, prix: 1395, occupation: "—", statut: "Occupé" },
  { unite: "16", superficie: 400, chambres: "1 chambre", sallesDeBain: 1, prix: 1558, occupation: "Immédiate", statut: "Disponible" },
  { unite: "17", superficie: 500, chambres: "1 chambre", sallesDeBain: 1, prix: 1375, occupation: "Immédiate", statut: "Disponible" },
];

let sortKey = 'prix';
let sortDir = 'asc';

function renderTable() {
  if (!document.getElementById('apt-tbody')) return;
  let data = [...units].sort((a, b) => {
    const dispo = (x) => x.statut === 'Disponible' ? 0 : 1;
    if (dispo(a) !== dispo(b)) return dispo(a) - dispo(b);
    const av = a[sortKey], bv = b[sortKey];
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv, 'fr') : bv.localeCompare(av, 'fr');
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  document.getElementById('table-count').textContent =
    `${data.length} logement${data.length !== 1 ? 's' : ''}`;

  const tbody = document.getElementById('apt-tbody');
  if (data.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="4">Aucun logement pour ces critères.</td></tr>`;
  } else {
    const statutClass = { 'Disponible': 'statut-dispo', 'Loué': 'statut-loue', 'Réservé': 'statut-reserve' };
    const isMobile = window.innerWidth < 768;
    tbody.innerHTML = data.map(u => `
      <tr>
        <td class="td-unit">${u.unite}</td>
        <td>${u.superficie} pi²</td>
        <td>${u.chambres}</td>
        <td class="td-price">${u.statut === 'Disponible' ? u.prix.toLocaleString('fr-CA') + (isMobile ? ' $' : ' $/mois') : '—'}</td>
        <td><span class="statut-badge ${statutClass[u.statut] || ''}">${u.statut}</span></td>
      </tr>
    `).join('');
  }

  ['unite', 'superficie', 'chambres', 'prix', 'statut'].forEach(k => {
    document.getElementById(`th-${k}`).classList.toggle('sort-active', k === sortKey);
    const sa = document.getElementById(`sa-${k}`);
    sa.classList.toggle('active', k === sortKey);
    sa.classList.toggle('desc', k === sortKey && sortDir === 'desc');
  });
}

function sortTable(key) {
  if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  else { sortKey = key; sortDir = 'asc'; }
  renderTable();
}


// ── Showcase Carousel ──
const showcasePhotos = [
  'assets/apt16/apt16_img0.jpeg',
  'assets/apt16/apt16_img1.jpeg',
  'assets/apt16/apt16_img2.jpeg',
  'assets/apt16/apt16_img3.jpeg',
  'assets/apt16/apt16_img4.jpeg',
  'assets/apt16/apt16_img5.jpeg',
  'assets/apt16/apt16_img6.jpeg',
  'assets/apt16/apt16_img7.jpeg',
  'assets/apt16/apt16_img8.jpeg',
  'assets/apt16/apt16_img9.jpeg',
  'assets/apt16/apt16_img10.jpeg',
];
let showcaseIdx = 0;

function showcaseGo(idx) {
  const main = document.getElementById('showcase-main');
  if (!main) return;
  showcaseIdx = ((idx % showcasePhotos.length) + showcasePhotos.length) % showcasePhotos.length;
  main.style.opacity = '0';
  setTimeout(() => {
    main.src = showcasePhotos[showcaseIdx];
    main.style.opacity = '1';
  }, 200);
  document.querySelectorAll('.showcase-thumb').forEach((btn, i) => {
    btn.classList.toggle('active', i === showcaseIdx);
  });
}

// ── POI Pills Float ──
function initPoiCanvas() {
  const canvas = document.getElementById('poi-canvas');
  if (!canvas) return;

  const pills = Array.from(canvas.querySelectorAll('.poi-pill'));
  pills.forEach(p => { p.style.rotate = (p.dataset.rot || '0') + 'deg'; });

  requestAnimationFrame(() => {
    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;
    const cols = 2;
    const rows = Math.ceil(pills.length / cols);

    const state = pills.map((p, i) => {
      const pw = p.offsetWidth;
      const ph = p.offsetHeight;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cellW = cw / cols;
      const cellH = ch / rows;
      const cx = cellW * col + (cellW - pw) / 2 + (Math.random() - 0.5) * cellW * 0.3;
      const cy = cellH * row + (cellH - ph) / 2 + (Math.random() - 0.5) * cellH * 0.3;
      return {
        el: p,
        cx: Math.max(0, Math.min(cw - pw, cx)),
        cy: Math.max(0, Math.min(ch - ph, cy)),
        ax: 14 + Math.random() * 18,
        ay: 10 + Math.random() * 14,
        fx: 0.18 + Math.random() * 0.22,
        fy: 0.15 + Math.random() * 0.2,
        px: Math.random() * Math.PI * 2,
        py: Math.random() * Math.PI * 2,
      };
    });

    let t0 = null;
    (function animate(ts) {
      if (!t0) t0 = ts;
      const t = (ts - t0) / 1000;
      state.forEach(s => {
        const x = s.cx + Math.sin(t * s.fx + s.px) * s.ax;
        const y = s.cy + Math.sin(t * s.fy + s.py) * s.ay;
        s.el.style.translate = `${x}px ${y}px`;
      });
      requestAnimationFrame(animate);
    })(performance.now());
  });
}

// ── FAQ accordion ──
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

// ── Footer form ──
function bindFooterForm() {
  document.getElementById('footer-form')?.addEventListener('submit', function (e) {
    e.preventDefault();
    this.querySelectorAll('.footer-input, .footer-submit').forEach(el => el.disabled = true);
    document.getElementById('footer-success').classList.add('visible');
  });
}

// ── POI card stack shuffle ──
function initPoiCardStack() {
  const stack = document.getElementById('poi-card-stack');
  if (!stack) return;
  const cards = Array.from(stack.querySelectorAll('.poi-card'));
  const pos = ['pos-front', 'pos-mid', 'pos-back'];
  // posOf[cardIdx] = positionIdx: 0=front, 1=mid, 2=back
  let posOf = [2, 1, 0]; // card0→back, card1→mid, card2→front
  let animating = false;

  function shuffle() {
    if (animating) return;
    animating = true;
    const frontIdx = posOf.indexOf(0);
    cards[frontIdx].style.zIndex = '0';
    posOf = posOf.map(p => (p + 2) % 3);
    cards.forEach((card, i) => {
      card.className = 'poi-card ' + pos[posOf[i]];
    });
    setTimeout(() => {
      cards[frontIdx].style.zIndex = '';
      animating = false;
    }, 580);
  }

  stack.addEventListener('click', shuffle);
  setInterval(shuffle, 1500);
}

// ── Init ──
(async function () {
  const base = document.querySelector('script[src="main.js"]')
    ? '' : '../';

  const [navbarHTML, footerHTML] = await Promise.all([
    fetch(`${base}partials/navbar.html`).then(r => r.text()),
    fetch(`${base}partials/footer.html`).then(r => r.text()),
  ]);

  document.getElementById('navbar-placeholder').outerHTML = navbarHTML;
  document.getElementById('footer-placeholder').outerHTML = footerHTML;

  initMarquee();
  bindDropdownPanel();
  bindHamburger();
  bindFooterForm();
  buildDesktopNav();
  buildMobileNav();
  renderTable();
  initPoiCanvas();
  initPoiCardStack();
})();
