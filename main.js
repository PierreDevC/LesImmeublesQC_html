// Fallback for static HTML page preview (where wpThemeData is undefined)
if (typeof wpThemeData === 'undefined') {
  window.wpThemeData = {
    homeUrl: "index.html",
    locationsUrl: "location-appartements-etudiants-montreal.html",
    projetsUrl: "projets.html",
    quartierUrl: "quartier.html",
    aproposUrl: "apropos.html",
    mentionsLegalesUrl: "mentions-legales.html",
    themeUrl: "",
  };
}

// ── Nav data ──
const navItems = [
  { label: "Accueil", href: wpThemeData.homeUrl },
  { label: "Locations d'appartements", href: wpThemeData.locationsUrl },
  { label: "Les projets", href: wpThemeData.projetsUrl },
  { label: "Le quartier", href: wpThemeData.quartierUrl },
  { label: "FAQ", href: wpThemeData.homeUrl + "#faq" },
  { label: "Galerie", href: wpThemeData.homeUrl + "#galerie" },
  { label: "À propos", href: wpThemeData.aproposUrl },
  { label: "Contact", href: wpThemeData.homeUrl + "#footer" },
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
  if (!nav) return;
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
  const panel = document.getElementById('dropdown-panel');
  if (!panel) return;
  panel.addEventListener('mouseenter', () => {
    if (closeTimer) clearTimeout(closeTimer);
  });
  panel.addEventListener('mouseleave', scheduleClose);
}

// ── Mobile nav ──
let mobileOpen = false;
let mobileOpenItem = null;

function buildMobileNav() {
  const inner = document.getElementById('mobile-menu-inner');
  if (!inner) return;
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
  cta.href = wpThemeData.locationsUrl;
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
  const menu = document.getElementById('mobile-menu');
  const btn = document.getElementById('hamburger');
  if (menu) menu.classList.toggle('open', mobileOpen);
  if (btn) btn.classList.toggle('open', mobileOpen);
}

function bindHamburger() {
  const btn = document.getElementById('hamburger');
  if (!btn) return;
  btn.addEventListener('click', () => {
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
      if (!navbar) {
        ticking = false;
        return;
      }
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
  { unite: "1935 Rue Tupper, apt. 16", superficie: 400, chambres: "1 chambre", sallesDeBain: 1, prix: 1558, occupation: "Immédiate", statut: "Disponible", projet: "tupper", secteur: "centre-ville", permalink: "http://localhost/LesImmeublesQC/appartements/16/" },
  { unite: "1935 Rue Tupper, app. 17", superficie: 500, chambres: "1 chambre", sallesDeBain: 1, prix: 1375, occupation: "Immédiate", statut: "Disponible", projet: "tupper", secteur: "centre-ville", permalink: "http://localhost/LesImmeublesQC/appartements/17/" },
  { unite: "2930 Rue Aubry (Top Floor)", superficie: 700, chambres: "2 chambres", sallesDeBain: 1, prix: 1675, occupation: "Immédiate", statut: "Occupé", projet: "aubry", secteur: "tetreaultville", permalink: "http://localhost/LesImmeublesQC/appartements/2930-rue-aubry-top-floor/" },
  { unite: "2930 Rue Aubry (Ground / 2nd Floor)", superficie: 750, chambres: "2 chambres", sallesDeBain: 1, prix: 1650, occupation: "Immédiate", statut: "Occupé", projet: "aubry", secteur: "tetreaultville", permalink: "http://localhost/LesImmeublesQC/appartements/2930-rue-aubry-ground-2nd-floor/" },
  { unite: "2930 Rue Aubry (Semi-Basement)", superficie: 650, chambres: "2 chambres", sallesDeBain: 1, prix: 1550, occupation: "Immédiate", statut: "Occupé", projet: "aubry", secteur: "tetreaultville", permalink: "http://localhost/LesImmeublesQC/appartements/2930-rue-aubry-semi-basement/" }
];

let sortKey = 'prix';
let sortDir = 'asc';

function getFilteredUnits() {
  const sourceUnits = (typeof wpThemeData !== 'undefined' && wpThemeData.units && wpThemeData.units.length > 0) ? wpThemeData.units : units;
  
  const query = (document.getElementById('search-text')?.value || '').toLowerCase().trim();
  const secteur = document.getElementById('filter-secteur')?.value || '';
  const projet = document.getElementById('filter-projet')?.value || '';
  const disponibilite = document.getElementById('filter-disponibilite')?.value || '';
  const superficie = document.getElementById('filter-superficie')?.value || '';
  const prix = document.getElementById('filter-prix')?.value || '';

  return sourceUnits.filter(u => {
    // Resolve project and sector dynamically
    const title = (u.unite || '').toLowerCase();
    const chambresText = (u.chambres || '').toLowerCase();
    if (!u.projet || !u.secteur) {
      console.warn(`[Les Immeubles QC] Unit "${u.unite}" is missing taxonomy terms (projet="${u.projet}", secteur="${u.secteur}"). Assign terms in WP Admin to avoid misclassification.`);
    }
    const resolvedProjet = u.projet || (title.includes('aubry') ? 'aubry' : 'tupper');
    const resolvedSecteur = u.secteur || (resolvedProjet === 'aubry' ? 'tetreaultville' : 'centre-ville');

    // Keyword text search
    if (query) {
      const matchText = `${u.unite} ${u.chambres} ${resolvedProjet} ${resolvedSecteur} ${u.occupation || ''}`.toLowerCase();
      if (!matchText.includes(query)) return false;
    }

    // Secteur filter
    if (secteur && resolvedSecteur !== secteur) return false;

    // Projet filter
    if (projet && resolvedProjet !== projet) return false;

    // Disponibilité filter
    if (disponibilite) {
      const uStatut = (u.statut || '').toLowerCase();
      if (disponibilite === 'disponible' && uStatut !== 'disponible') return false;
      if (disponibilite === 'occupe' && uStatut !== 'occupé' && uStatut !== 'occupe') return false;
      if (disponibilite === 'reserve' && uStatut !== 'réservé' && uStatut !== 'reserve') return false;
    }

    // Superficie filter
    if (superficie) {
      const area = parseInt(u.superficie) || 0;
      if (superficie === 'small' && area >= 400) return false;
      if (superficie === 'medium' && (area < 400 || area > 500)) return false;
      if (superficie === 'large' && area <= 500) return false;
    }

    // Prix filter
    if (prix) {
      const price = parseInt(u.prix) || 0;
      if (prix === 'low' && price >= 1400) return false;
      if (prix === 'mid' && (price < 1400 || price > 1600)) return false;
      if (prix === 'high' && price <= 1600) return false;
    }

    return true;
  });
}

function updateResetButtonVisibility() {
  const resetBtn = document.getElementById('search-reset-btn');
  if (!resetBtn) return;
  
  const query = document.getElementById('search-text')?.value || '';
  const secteur = document.getElementById('filter-secteur')?.value || '';
  const projet = document.getElementById('filter-projet')?.value || '';
  const disponibilite = document.getElementById('filter-disponibilite')?.value || '';
  const superficie = document.getElementById('filter-superficie')?.value || '';
  const prix = document.getElementById('filter-prix')?.value || '';

  if (query || secteur || projet || disponibilite || superficie || prix) {
    resetBtn.style.display = 'inline-block';
  } else {
    resetBtn.style.display = 'none';
  }
}

function initSearch() {
  const searchForm = document.getElementById('listings-search-form');
  if (!searchForm) return;

  // Parse URL Parameters
  const params = new URLSearchParams(window.location.search);
  
  const qVal = params.get('q');
  const secteurVal = params.get('secteur');
  const projetVal = params.get('projet');
  const dispoVal = params.get('disponibilite');
  const superficieVal = params.get('superficie');
  const prixVal = params.get('prix');

  if (qVal !== null) document.getElementById('search-text').value = qVal;
  if (secteurVal !== null) document.getElementById('filter-secteur').value = secteurVal;
  if (projetVal !== null) document.getElementById('filter-projet').value = projetVal;
  if (dispoVal !== null) document.getElementById('filter-disponibilite').value = dispoVal;
  if (superficieVal !== null) document.getElementById('filter-superficie').value = superficieVal;
  if (prixVal !== null) document.getElementById('filter-prix').value = prixVal;

  updateResetButtonVisibility();

  // Bind Event Listeners for Live Updates
  const controls = [
    { id: 'search-text', event: 'input' },
    { id: 'filter-secteur', event: 'change' },
    { id: 'filter-projet', event: 'change' },
    { id: 'filter-disponibilite', event: 'change' },
    { id: 'filter-superficie', event: 'change' },
    { id: 'filter-prix', event: 'change' }
  ];

  controls.forEach(ctrl => {
    const el = document.getElementById(ctrl.id);
    if (el) {
      el.addEventListener(ctrl.event, () => {
        // Update URL Query parameters live without reloading
        const newParams = new URLSearchParams();
        controls.forEach(c => {
          const val = document.getElementById(c.id)?.value || '';
          if (val) {
            const key = c.id === 'search-text' ? 'q' : c.id.replace('filter-', '');
            newParams.set(key, val);
          }
        });
        
        const newQuery = newParams.toString();
        const newUrl = window.location.pathname + (newQuery ? '?' + newQuery : '');
        window.history.replaceState({}, '', newUrl);

        updateResetButtonVisibility();
        renderTable();
      });
    }
  });

  // Reset Button Action
  const resetBtn = document.getElementById('search-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      controls.forEach(c => {
        const el = document.getElementById(c.id);
        if (el) el.value = '';
      });
      window.history.replaceState({}, '', window.location.pathname);
      updateResetButtonVisibility();
      renderTable();
    });
  }
}

function renderTable() {
  const grid = document.getElementById('rentals-grid');
  if (!grid) return;
  
  let data = getFilteredUnits();
  // Sort priority: Available units first
  data.sort((a, b) => {
    const dispo = (x) => x.statut === 'Disponible' ? 0 : 1;
    if (dispo(a) !== dispo(b)) return dispo(a) - dispo(b);
    const av = a[sortKey], bv = b[sortKey];
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv, 'fr') : bv.localeCompare(av, 'fr');
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const countText = `${data.length} logement${data.length !== 1 ? 's' : ''}`;
  document.getElementById('table-count').textContent = countText;

  if (data.length === 0) {
    grid.innerHTML = `<div class="empty-grid">Aucun logement pour ces critères.</div>`;
  } else {
    const statutClass = { 'Disponible': 'statut-dispo', 'Loué': 'statut-loue', 'Réservé': 'statut-reserve', 'Occupé': 'statut-loue' };
    
    grid.innerHTML = data.map((u, index) => {
      const bedroomsText = u.chambres;
      const statusLabel = u.statut;
      const badgeClass = statutClass[u.statut] || 'statut-loue';
      
      let priceText = '—';
      if (u.statut === 'Disponible') {
        const formattedPrice = u.prix.toLocaleString('fr-CA');
        priceText = `${formattedPrice} $`;
      }
      
      const sizeText = u.superficie ? `${u.superficie} pi²` : '—';
      
      // Determine image to display
      let imgUrl = '';
      if (typeof wpThemeData !== 'undefined' && wpThemeData.themeUrl) {
        imgUrl = u.photo_1 || (wpThemeData.themeUrl + 'assets/apt16/apt16_img0.webp');
      } else {
        imgUrl = `assets/apt16/apt16_img${index % 11}.webp`;
      }

      // Address text based on project
      const title = (u.unite || '').toLowerCase();
      const resolvedProjet = u.projet || (title.includes('aubry') ? 'aubry' : 'tupper');
      const addressText = resolvedProjet === 'aubry' 
        ? "2930 Rue Aubry, Montréal (Tétreaultville)"
        : "1935 Rue Tupper, Montréal (Centre-Ville)";

      // Details or CTA Link
      const ctaUrl = u.permalink || (typeof wpThemeData !== 'undefined' ? wpThemeData.homeUrl + '#footer' : '#');

      return `
        <div class="rental-card">
          <a href="${ctaUrl}" class="rental-card-img-wrap">
            <img src="${imgUrl}" alt="${u.unite}" class="rental-card-img" loading="lazy" />
            <span class="statut-badge ${badgeClass} rental-card-badge">${statusLabel}</span>
          </a>
          <div class="rental-card-content">
            <div class="rental-card-price-row">
              <span class="rental-card-price">${priceText}</span>
              ${u.statut === 'Disponible' ? '<span class="rental-card-period">/ mois</span>' : ''}
            </div>
            <h3 class="rental-card-title">${u.unite}</h3>
            <div class="rental-card-specs">
              <div class="rental-card-spec-item">
                <svg class="spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M22 4v16M2 8h20M2 14h20M6 8v6M18 8v6"/></svg>
                <span>${bedroomsText}</span>
              </div>
              <div class="rental-card-spec-item">
                <svg class="spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4zM4 9h16M9 4v16M14 4v16"/></svg>
                <span>${u.sallesDeBain || 1} bain</span>
              </div>
              <div class="rental-card-spec-item">
                <svg class="spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                <span>${sizeText}</span>
              </div>
            </div>
            <div class="rental-card-address">
              <svg class="address-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${addressText}</span>
            </div>
            <a href="${ctaUrl}" class="rental-card-cta">Voir appartement</a>
          </div>
        </div>
      `;
    }).join('');
  }
}

function sortTable(key) {
  if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  else { sortKey = key; sortDir = 'asc'; }
  renderTable();
}


// ── Showcase Carousel ──
const showcasePhotos = [
  wpThemeData.themeUrl + 'assets/apt16/apt16_img0.webp',
  wpThemeData.themeUrl + 'assets/apt16/apt16_img1.webp',
  wpThemeData.themeUrl + 'assets/apt16/apt16_img2.webp',
  wpThemeData.themeUrl + 'assets/apt16/apt16_img3.webp',
  wpThemeData.themeUrl + 'assets/apt16/apt16_img4.webp',
  wpThemeData.themeUrl + 'assets/apt16/apt16_img5.webp',
  wpThemeData.themeUrl + 'assets/apt16/apt16_img6.webp',
  wpThemeData.themeUrl + 'assets/apt16/apt16_img7.webp',
  wpThemeData.themeUrl + 'assets/apt16/apt16_img8.webp',
  wpThemeData.themeUrl + 'assets/apt16/apt16_img9.webp',
  wpThemeData.themeUrl + 'assets/apt16/apt16_img10.webp',
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
    main.style.animation = 'none';
    void main.offsetHeight;
    main.style.animation = '';
  }, 200);
  document.querySelectorAll('.showcase-thumb').forEach((btn, i) => {
    const isActive = i === showcaseIdx;
    btn.classList.toggle('active', isActive);
    if (isActive) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  });
}

// ── POI Pills Float ──
function initPoiCanvas() {
  const canvas = document.getElementById('poi-canvas');
  if (!canvas) return;

  const pills = Array.from(canvas.querySelectorAll('.poi-pill'));

  if (window.innerWidth <= 767) return;

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
  // Handled natively by Contact Form 7 AJAX script
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
(function () {
  buildDesktopNav();
  buildMobileNav();
  initMarquee();
  bindDropdownPanel();
  bindHamburger();
  bindFooterForm();
  initSearch();
  renderTable();
  initPoiCanvas();
  initPoiCardStack();
})();
