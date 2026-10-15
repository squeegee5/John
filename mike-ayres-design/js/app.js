/**
 * ============================================================
 * SENSORY ROOM BOOKING SYSTEM - MAIN APPLICATION
 * ============================================================
 * Handles step navigation, card rendering, state management,
 * form validation, email submission, and Google Calendar booking.
 * ============================================================
 */

(function () {
  'use strict';

  // ── State ────────────────────────────────────────────────
  const state = {
    currentStep: 'landing',
    history: [],
    firstPath: null,
    completedPaths: new Set(),

    // Room selections
    roomType: null,
    ageGroup: [],
    roomSize: null,
    equipment: [],

    // Designer selections
    designer: null,
    appointmentSlot: null,

    // Contact details
    contact: {
      firstName: '',
      surname: '',
      email: '',
      phone: '',
      postcode: '',
      premises: '',
      address: '',
      notes: '',
    },
    contactFilled: false,
  };

  // Brand wording/styling and consultation settings come from config.js, so
  // Southpaw and Mike Ayres Design share this file unchanged.
  const BRAND = CONFIG.brand;
  const CONSULT = CONFIG.consultations || { enabled: true, callTypes: ['video'] };
  state.callType = (CONSULT.callTypes || ['video'])[0];

  let calendarInstance = null;

  // ── Placeholder SVG icons ────────────────────────────────
  const placeholderIcons = {
    // Room types
    'si': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="40" cy="30" r="12" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 65c0-12 9-20 20-20s20 8 20 20" fill="none" stroke="currentColor" stroke-width="2"/><path d="M55 35l8-8M55 25l8 8M25 35l-8-8M25 25l-8 8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'mse': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="15" y="20" width="50" height="35" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="37" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="50" cy="37" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M25 50h30M15 55v8M65 55v8" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    'soft-play': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="30" cy="45" r="14" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="52" cy="38" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="45" cy="55" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M18 25c5-5 12-5 17 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'de-escalation': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="40" cy="40" r="22" fill="none" stroke="currentColor" stroke-width="2"/><path d="M32 38c2-4 6-6 8-3s2 8-1 10-7 1-8-3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M48 38c-2-4-6-6-8-3s-2 8 1 10 7 1 8-3" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'projection': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="10" y="25" width="25" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="22" cy="34" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M35 34l30-12v24z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    'mural': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="12" y="15" width="56" height="42" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 45l15-12 10 8 15-15 16 12" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="28" cy="28" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M30 57h20" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    'other': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="40" cy="34" r="16" fill="none" stroke="currentColor" stroke-width="2"/><path d="M36 28c0-4 3-6 5-6s4 2 4 4c0 3-3 4-4 6v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="40" cy="43" r="1.5" fill="currentColor"/><path d="M22 58h36" stroke="currentColor" stroke-width="1.5"/></svg>`,

    // Age groups
    '0-5': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="40" cy="28" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M28 65c0-8 5-16 12-18m0 0c7 2 12 10 12 18" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="36" cy="26" r="1.5" fill="currentColor"/><circle cx="44" cy="26" r="1.5" fill="currentColor"/><path d="M36 31c2 2 6 2 8 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    '6-12': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="40" cy="24" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M26 65c0-10 6-18 14-20m0 0c8 2 14 10 14 20" fill="none" stroke="currentColor" stroke-width="2"/><rect x="34" y="50" width="12" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    '13-18': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="40" cy="22" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 68c0-12 7-20 16-22m0 0c9 2 16 10 16 22" fill="none" stroke="currentColor" stroke-width="2"/><path d="M34 42h12v8H34z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'older': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="40" cy="22" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M22 68c0-12 8-22 18-24m0 0c10 2 18 12 18 24" fill="none" stroke="currentColor" stroke-width="2"/><path d="M35 28h10M35 32h10" fill="none" stroke="currentColor" stroke-width="1"/></svg>`,

    // Room sizes
    'small': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="24" y="24" width="32" height="32" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 40h32M40 24v32" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/></svg>`,
    'medium': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="16" y="20" width="48" height="40" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 40h48M40 20v40" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/></svg>`,
    'large': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="8" y="16" width="64" height="48" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 40h64M40 16v48M24 16v48M56 16v48" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/></svg>`,
    'various': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="8" y="10" width="28" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="44" y="10" width="28" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="8" y="42" width="36" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="52" y="46" width="20" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,

    // Equipment icons
    'bubble-tubes': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="28" y="10" width="24" height="52" rx="12" fill="none" stroke="currentColor" stroke-width="2"/><rect x="24" y="62" width="32" height="6" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="40" cy="50" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="36" cy="38" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="44" cy="26" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="38" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="1"/></svg>`,
    'swings': `<svg viewBox="0 0 80 80" class="placeholder-icon"><path d="M15 15h50" stroke="currentColor" stroke-width="2.5"/><path d="M30 15v35M50 15v35" stroke="currentColor" stroke-width="2"/><rect x="25" y="50" width="30" height="6" rx="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    'projectors': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="8" y="28" width="32" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="39" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="24" cy="39" r="3" fill="none" stroke="currentColor" stroke-width="1"/><path d="M40 35l22-8M40 39h24M40 43l22 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/><path d="M8 50v6h4v-6M36 50v6h4v-6" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'tactile-panels': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="15" y="15" width="50" height="50" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="30" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="42" y="25" width="12" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M25 48h30" stroke="currentColor" stroke-width="2"/><path d="M25 55h20" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'tactile-mural': `<svg viewBox="0 0 80 80" class="placeholder-icon"><path d="M5 68q18-8 35-8t35 8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M32 68V38" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="24" rx="15" ry="16" fill="none" stroke="currentColor" stroke-width="2"/><path d="M22 30c-3-8 1-18 10-22" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M42 30c3-8-1-18-10-22" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="62" cy="16" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M62 6v3M62 23v3M52 16h3M69 16h3M55 9l2 2M67 21l2 2M55 23l2-2M67 11l2-2" stroke="currentColor" stroke-width="1"/><path d="M52 68c0-6 3-12 6-12s5 6 5 12" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 68c0-4 2-8 4-8s3 4 3 8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'soft-play-elements': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="8" y="52" width="64" height="16" rx="8" fill="none" stroke="currentColor" stroke-width="2"/><rect x="16" y="36" width="48" height="16" rx="8" fill="none" stroke="currentColor" stroke-width="2"/><rect x="24" y="20" width="32" height="16" rx="8" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    'padding': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="12" y="8" width="24" height="48" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 20h24M12 32h24M12 44h24" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><rect x="44" y="8" width="24" height="48" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M44 20h24M44 32h24M44 44h24" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><rect x="8" y="60" width="64" height="12" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 66h48" stroke="currentColor" stroke-width="1.5" opacity="0.4"/></svg>`,
    'vibration': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="30" y="20" width="20" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 28c-4 4-4 16 0 20M56 28c4 4 4 16 0 20" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M18 24c-6 6-6 22 0 28M62 24c6 6 6 22 0 28" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'lighting': `<svg viewBox="0 0 80 80" class="placeholder-icon"><path d="M40 10c-13 0-22 10-22 22 0 9 5 16 11 20v6h22v-6c6-4 11-11 11-20 0-12-9-22-22-22z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M32 58h16M34 64h12M36 70h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M40 26v12M34 30l4 6M46 30l-4 6" stroke="currentColor" stroke-width="1.5" opacity="0.4"/></svg>`,
    'interactive-panels': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="10" y="8" width="60" height="64" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 16h60" stroke="currentColor" stroke-width="1.5"/><path d="M40 40c4-1 8 0 9 4s0 9-4 12-10 2-12-3 1-10 4-12 8-2 10 1 2 7-1 10" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="40" cy="40" r="2.5" fill="currentColor" opacity="0.5"/><circle cx="22" cy="60" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="40" cy="60" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="58" cy="60" r="4" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    'weight-resistance': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="34" y="20" width="12" height="40" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="14" y="28" width="12" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="54" y="28" width="12" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M26 40h8M46 40h8" stroke="currentColor" stroke-width="2"/></svg>`,
    'balance': `<svg viewBox="0 0 80 80" class="placeholder-icon"><ellipse cx="40" cy="64" rx="18" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M40 64V44" stroke="currentColor" stroke-width="1.5"/><circle cx="40" cy="24" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M40 30v14" stroke="currentColor" stroke-width="2"/><path d="M32 38l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M34 50l6-6 6 6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'ball-pool': `<svg viewBox="0 0 80 80" class="placeholder-icon"><path d="M12 26l28-14 28 14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 26v34l28 14V40" fill="none" stroke="currentColor" stroke-width="2"/><path d="M68 26v34l-28 14V40" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="52" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="44" cy="48" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="36" cy="38" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="50" cy="56" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="24" cy="42" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="42" cy="60" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="54" cy="42" r="3.5" fill="none" stroke="currentColor" stroke-width="1"/></svg>`,
    'climbing': `<svg viewBox="0 0 80 80" class="placeholder-icon"><path d="M62 5v70" stroke="currentColor" stroke-width="2.5"/><circle cx="62" cy="22" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="58" cy="40" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="62" cy="56" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="38" cy="20" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M38 26v18" stroke="currentColor" stroke-width="2"/><path d="M38 30l16-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M38 30l-10 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M38 44l14 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M38 44l-8 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    'seating': `<svg viewBox="0 0 80 80" class="placeholder-icon"><path d="M18 45h44v8c0 2-2 4-4 4H22c-2 0-4-2-4-4v-8z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M22 45V30c0-2 2-4 4-4h28c2 0 4 2 4 4v15" fill="none" stroke="currentColor" stroke-width="2"/><path d="M18 57v8M62 57v8" stroke="currentColor" stroke-width="2"/></svg>`,

    // Designer (person icon)
    'designer': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="40" cy="28" r="14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 68c0-14 10-24 24-24s24 10 24 24" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,

    // Landing page
    'room': `<svg viewBox="0 0 120 90" class="placeholder-icon" style="width:96px;height:72px"><rect x="10" y="10" width="100" height="65" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 55l25-18 15 12 20-15 30 18" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="35" cy="30" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'designer-landing': `<svg viewBox="0 0 120 90" class="placeholder-icon" style="width:96px;height:72px"><circle cx="40" cy="30" r="14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 72c0-14 10-24 24-24s24 10 24 24" fill="none" stroke="currentColor" stroke-width="2"/><rect x="68" y="20" width="36" height="44" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M74 32h24M74 40h24M74 48h16" stroke="currentColor" stroke-width="1.5"/></svg>`,
  };

  function updateMultiSelectButton(stepName, count) {
    var section = document.querySelector('[data-step="' + stepName + '"]');
    if (!section) return;
    var btn = section.querySelector('.btn-primary');
    if (!btn) return;
    btn.style.display = count > 0 ? '' : 'none';
  }

  // ── Initialization ───────────────────────────────────────
  function init() {
    applyImageOverrides();
    populateLandingPage();
    populateRoomTypeCards();
    populateAgeCards();
    populateSizeCards();
    populateEquipmentCards();
    populateDesignerCards();
    populateHeadings();
    setDesignBookLinks();
    bindGlobalEvents();
    updateProgress();
  }

  // Images can be swapped without a redeploy via a theme file that outputs
  // <script type="application/json" id="design-form-images"> (MAD:
  // sections/design-form-images.liquid, edited with the form image manager).
  // If it's missing or not valid JSON, the config images are used.
  function applyImageOverrides() {
    const el = document.getElementById('design-form-images');
    if (!el) return;
    let data;
    try {
      data = JSON.parse(el.textContent);
    } catch (e) {
      console.warn('design-form-images: not valid JSON, using built-in images');
      return;
    }
    const isUrl = v => typeof v === 'string' && v.trim() !== '';

    const room = CONFIG.landingCards && CONFIG.landingCards.room;
    const slides = Array.isArray(data.slideshow) ? data.slideshow.filter(isUrl) : [];
    if (room && slides.length) {
      room.images = slides;
      room.image = slides[0];
    }
    const designerCard = CONFIG.landingCards && CONFIG.landingCards.designer;
    if (designerCard && isUrl(data.designerCard)) designerCard.image = data.designerCard;

    ['roomTypes', 'ageGroups', 'roomSizes', 'equipment', 'designers'].forEach(key => {
      if (!Array.isArray(data[key]) || !Array.isArray(CONFIG[key])) return;
      data[key].forEach(o => {
        const item = o && CONFIG[key].find(i => i.id === o.id);
        if (item && isUrl(o.image)) item.image = o.image;
      });
    });
  }

  // ── Populate sections from config ────────────────────────

  function populateLandingPage() {
    document.getElementById('heroTitle').textContent = CONFIG.heroTitle;
    document.getElementById('heroSubtitle').textContent = CONFIG.heroSubtitle;

    const container = document.getElementById('landingCards');
    container.innerHTML = '';

    container.appendChild(createLandingCard('room', CONFIG.landingCards.room, 'room'));
    container.appendChild(createLandingCard('designer', CONFIG.landingCards.designer, 'designer-landing'));
  }

  function createLandingCard(value, data, iconKey) {
    const card = document.createElement('div');
    card.className = 'choice-card';
    card.dataset.value = value;

    const imgContainer = document.createElement('div');
    imgContainer.className = 'card-image-container';
    if (data.images && data.images.length > 1) {
      // Slideshow: stack images, fade between them
      imgContainer.style.position = 'relative';
      data.images.forEach((src, i) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = data.title;
        img.loading = i === 0 ? 'eager' : 'lazy';
        img.className = 'slideshow-img';
        if (i > 0) img.style.opacity = '0';
        imgContainer.appendChild(img);
      });
      // Start slideshow
      let current = 0;
      const imgs = imgContainer.querySelectorAll('.slideshow-img');
      setInterval(() => {
        imgs[current].style.opacity = '0';
        current = (current + 1) % imgs.length;
        imgs[current].style.opacity = '1';
      }, 5000);
    } else if (data.image) {
      const img = document.createElement('img');
      img.src = data.image;
      img.alt = data.title;
      img.loading = 'lazy';
      imgContainer.appendChild(img);
    } else {
      imgContainer.innerHTML = placeholderIcons[iconKey] || placeholderIcons['room'];
    }

    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = `<h3>${data.title}</h3><p>${data.description}</p>`;

    card.appendChild(imgContainer);
    card.appendChild(body);

    card.addEventListener('click', () => {
      state.firstPath = value;
      if (value === 'room') {
        navigateTo('room-type');
      } else {
        navigateTo('designer-select');
      }
    });

    return card;
  }

  function createChoiceCard(item, iconKey, multiSelect, onSelect) {
    const card = document.createElement('div');
    card.className = 'choice-card';
    card.dataset.id = item.id;

    const imgContainer = document.createElement('div');
    imgContainer.className = 'card-image-container';
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title;
      img.loading = 'lazy';
      imgContainer.appendChild(img);
    } else {
      const key = iconKey || item.id;
      imgContainer.innerHTML = placeholderIcons[key] || placeholderIcons['room'];
    }

    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = `<h3>${item.title}</h3>` + (item.description ? `<p>${item.description}</p>` : '');

    card.appendChild(imgContainer);
    card.appendChild(body);

    card.addEventListener('click', () => {
      if (multiSelect) {
        card.classList.toggle('selected');
      } else {
        card.parentElement.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      }
      if (onSelect) onSelect(item, card);
    });

    return card;
  }

  function populateRoomTypeCards() {
    const container = document.getElementById('roomTypeCards');
    container.innerHTML = '';
    container.classList.add('room-type-grid');
    CONFIG.roomTypes.forEach(item => {
      container.appendChild(createChoiceCard(item, item.id, false, (selected) => {
        state.roomType = selected;
        setTimeout(() => navigateTo('room-age'), 350);
      }));
    });
  }

  function populateAgeCards() {
    const container = document.getElementById('ageCards');
    container.innerHTML = '';
    CONFIG.ageGroups.forEach(item => {
      container.appendChild(createChoiceCard(item, item.id, true, () => {
        state.ageGroup = [];
        container.querySelectorAll('.choice-card.selected').forEach(card => {
          const ag = CONFIG.ageGroups.find(a => a.id === card.dataset.id);
          if (ag) state.ageGroup.push(ag);
        });
        updateMultiSelectButton('room-age', state.ageGroup.length);
      }));
    });
    updateMultiSelectButton('room-age', 0);
  }

  function populateSizeCards() {
    const container = document.getElementById('sizeCards');
    container.innerHTML = '';
    CONFIG.roomSizes.forEach(item => {
      container.appendChild(createChoiceCard(item, item.id, false, (selected) => {
        state.roomSize = selected;
        setTimeout(() => navigateTo('room-equipment'), 350);
      }));
    });
  }

  function populateEquipmentCards() {
    const container = document.getElementById('equipmentCards');
    container.innerHTML = '';

    CONFIG.equipment.forEach(item => {
      container.appendChild(createChoiceCard(item, item.id, true, () => {
        state.equipment = [];
        container.querySelectorAll('.choice-card.selected').forEach(card => {
          const equip = CONFIG.equipment.find(e => e.id === card.dataset.id);
          if (equip) state.equipment.push(equip);
        });
        updateMultiSelectButton('room-equipment', state.equipment.length);
      }));
    });
    updateMultiSelectButton('room-equipment', 0);
  }

  function populateDesignerCards() {
    const container = document.getElementById('designerCards');
    container.innerHTML = '';
    CONFIG.designers.forEach(item => {
      const card = document.createElement('div');
      card.className = 'choice-card';
      card.dataset.id = item.id;

      const imgContainer = document.createElement('div');
      imgContainer.className = 'card-image-container';
      if (item.image) {
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        img.loading = 'lazy';
        imgContainer.appendChild(img);
      } else {
        imgContainer.innerHTML = placeholderIcons['designer'];
      }

      const body = document.createElement('div');
      body.className = 'card-body';
      body.innerHTML = `
        <h3>${item.name}</h3>
        <p class="designer-role">${item.role}</p>
        <p class="designer-bio">${item.bio}</p>
      `;

      card.appendChild(imgContainer);
      card.appendChild(body);

      card.addEventListener('click', () => {
        container.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.designer = item;
        if (state.firstPath === 'designer') {
          setTimeout(() => navigateTo('room-type'), 350);
        } else {
          setTimeout(proceedToScheduling, 350);
        }
      });

      container.appendChild(card);
    });
  }

  function populateHeadings() {
    const h = CONFIG.headings;
    setText('roomTypeTitle', h.roomType.title);
    setText('roomTypeSubtitle', h.roomType.subtitle);
    setText('ageTitle', h.age.title);
    setText('ageSubtitle', h.age.subtitle);
    setText('sizeTitle', h.size.title);
    setText('sizeSubtitle', h.size.subtitle);
    setText('equipmentTitle', h.equipment.title);
    setText('equipmentSubtitle', h.equipment.subtitle);
    setText('designerTitle', h.designer.title);
    setText('designerSubtitle', h.designer.subtitle);
    setText('calendarTitle', h.calendar.title);
    setText('calendarSubtitle', h.calendar.subtitle);
    setText('contactTitle', h.contact.title);
    setText('contactSubtitle', h.contact.subtitle);
    setText('calendarNote', CONFIG.calendar.calendarNote);
  }

  function setDesignBookLinks() {
    const linkRoom = document.getElementById('designBookLinkRoom');
    if (linkRoom) linkRoom.href = CONFIG.designBookUrl;
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ── Navigation ───────────────────────────────────────────

  // True when customers can pick a consultation time: switched on in config
  // and at least one bookable day remains in the calendar's range.
  function consultationsAvailable() {
    if (!CONSULT.enabled) return false;
    const cal = calendarInstance || Object.assign(Object.create(CalendarBooking.prototype), {
      config: CONFIG.calendar,
      busySlots: [],
      weekOffset: 0,
    });
    return cal.getTotalPages() > 0;
  }

  // Once the customer's details (and designer, if chosen) are in: go to the
  // date picker, or send the enquiry straight away when bookings are off.
  function proceedToScheduling() {
    if (consultationsAvailable()) {
      navigateTo('designer-calendar');
    } else if (state.contactFilled) {
      submitAndConfirm();
    } else {
      navigateTo('contact');
    }
  }

  function navigateTo(step) {
    // Initialize or re-render calendar when navigating to calendar step
    if (step === 'designer-calendar') {
      renderCallTypeChoice();
      setTimeout(() => {
        const container = document.getElementById('calendarContainer');
        if (!calendarInstance) {
          calendarInstance = new CalendarBooking(container, (slotData) => {
            state.appointmentSlot = slotData;
            setTimeout(() => {
              if (state.contactFilled) {
                state.completedPaths.add('designer');
                submitAndConfirm();
              } else {
                navigateTo('contact');
              }
            }, 400);
          });
        } else {
          calendarInstance.render();
        }
      }, 100);
    }

    state.history.push(state.currentStep);
    state.currentStep = step;
    showStep(step);
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    if (state.history.length === 0) return;
    const prevStep = state.history.pop();
    state.currentStep = prevStep;
    showStep(prevStep);
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const target = document.querySelector(`.step[data-step="${step}"]`);
    if (target) target.classList.add('active');
  }

  function updateProgress() {
    const steps = getStepsForProgress();
    const currentIndex = steps.indexOf(state.currentStep);
    const progress = currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
    const bar = document.getElementById('progressBar');
    if (bar) bar.style.width = `${progress}%`;
  }

  function getStepsForProgress() {
    const steps = ['landing'];
    if (state.firstPath === 'room') {
      steps.push('room-type', 'room-age', 'room-size', 'room-equipment', 'contact', 'confirmation');
    } else if (state.firstPath === 'designer') {
      steps.push('designer-select', 'room-type', 'room-age', 'room-size', 'room-equipment', 'contact', 'designer-calendar', 'confirmation');
    } else {
      steps.push('room-type', 'room-age', 'room-size', 'room-equipment',
                  'designer-select', 'designer-calendar', 'contact', 'confirmation');
    }
    if (!CONSULT.enabled) return steps.filter(s => s !== 'designer-calendar');
    return steps;
  }

  // Video or phone call choice, shown above the calendar when the brand
  // offers more than one call type.
  function renderCallTypeChoice() {
    const el = document.getElementById('callTypeChoice');
    if (!el) return;
    const types = CONSULT.callTypes || ['video'];
    if (types.length < 2) {
      el.innerHTML = '';
      return;
    }
    const labels = CONSULT.callTypeLabels || { video: 'Video call', phone: 'Phone call' };
    el.innerHTML =
      '<p class="call-type-label">How would you like to speak with us?</p>' +
      '<div class="call-type-options">' +
      types.map(t =>
        `<button type="button" class="call-type-btn${state.callType === t ? ' selected' : ''}" data-call-type="${t}">${labels[t] || t}</button>`
      ).join('') +
      '</div>';
    el.querySelectorAll('.call-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.callType = btn.dataset.callType;
        renderCallTypeChoice();
      });
    });
  }

  function isPhoneCall() {
    return state.callType === 'phone';
  }

  // ── Global Event Binding ─────────────────────────────────

  function bindGlobalEvents() {
    document.querySelectorAll('[data-action="back"]').forEach(btn => {
      btn.addEventListener('click', goBack);
    });

    // Room type continue buttons (top + bottom)
    document.querySelectorAll('[data-action="room-type-next"]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateTo('room-age');
      });
    });

    // Age continue button (multi-select needs explicit continue)
    document.querySelectorAll('[data-action="age-next"]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateTo('room-size');
      });
    });

    // Equipment continue buttons (top + bottom)
    document.querySelectorAll('[data-action="equipment-next"]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateTo('contact');
      });
    });

    // Contact form
    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateContactForm()) {
          collectContactData();
          state.contactFilled = true;

          if (state.firstPath === 'designer' && state.designer && !state.appointmentSlot) {
            // Designer-first: go to calendar (email sent after slot selected)
            proceedToScheduling();
          } else if (state.firstPath === 'room' && !state.completedPaths.has('room')) {
            state.completedPaths.add('room');
            // Room path submit: go to calendar (email sent after slot selected)
            proceedToScheduling();
          } else {
            const currentPath = getCurrentPath();
            if (currentPath) state.completedPaths.add(currentPath);
            // Already has appointment: send email + calendar event
            if (state.appointmentSlot) {
              submitAndConfirm();
            } else {
              proceedToScheduling();
            }
          }
        }
      });
    }

    // Anytime button on calendar page
    const anytimeBtn = document.getElementById('anytimeBtn');
    if (anytimeBtn) {
      anytimeBtn.addEventListener('click', () => {
        // Schedule at 11am on the next working day at least 2 days ahead
        const slot = getAnytimeSlot();
        state.appointmentSlot = slot;
        setTimeout(() => {
          if (state.contactFilled) {
            state.completedPaths.add('designer');
            submitAndConfirm();
          } else {
            navigateTo('contact');
          }
        }, 200);
      });
    }
  }

  // Get the "anytime" slot: first free hour (11am preferred) on the next
  // bookable day at least minDaysAhead ahead. Applies the same availability
  // rules as the customer-facing calendar.
  function getAnytimeSlot() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minAhead = CONFIG.calendar.minDaysAhead || 2;
    const cal = calendarInstance || Object.assign(Object.create(CalendarBooking.prototype), {
      config: CONFIG.calendar,
      busySlots: [],
    });

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + minAhead);

    let d = new Date(startDate);
    const maxLookahead = cal.getMaxLookaheadDays();
    for (let i = 0; i < maxLookahead; i++) {
      if (cal.usesWindows()) {
        // Explicit time windows: 11am if it's free, else the first free slot
        const free = cal.getWindowSlots(d);
        const pick = free.find(s => s.hour === 11 && s.minute === 0) || free[0];
        if (pick) return cal.describeSlot(new Date(d), pick.hour, pick.minute, pick.duration);
        d.setDate(d.getDate() + 1);
        continue;
      }
      const bookable = cal.isWorkingDay(d) && !cal.isBlockedDate(d) &&
        !cal.isDateClosed(d) && !cal.isPostHolidayBuffer(d);
      if (bookable) {
        const hours = cal.getHoursForDate(d);
        const candidates = [];
        for (let h = hours.start; h < hours.end; h++) candidates.push(h);
        // Prefer 11am, otherwise the earliest free hour that day
        candidates.sort((a, b) => (a === 11 ? -1 : b === 11 ? 1 : a - b));
        const hour = candidates.find(h => !cal.isRangeBlocked(d, h, 0, hours));
        if (hour != null) {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          const dateLong = `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
          const pad = (n) => String(n).padStart(2, '0');
          const timeLabel = `${pad(hour)}:00 - ${pad(hour + 1)}:00`;
          return {
            date: new Date(d),
            hour: hour,
            dateFormatted: dateLong,
            timeFormatted: timeLabel,
            label: `${dateLong}, ${timeLabel}`,
          };
        }
      }
      d.setDate(d.getDate() + 1);
    }
    return null;
  }

  function getCurrentPath() {
    const roomSteps = ['room-type', 'room-age', 'room-size', 'room-equipment'];
    const designerSteps = ['designer-select', 'designer-calendar'];

    for (let i = state.history.length - 1; i >= 0; i--) {
      if (roomSteps.includes(state.history[i])) return 'room';
      if (designerSteps.includes(state.history[i])) return 'designer';
    }
    return state.firstPath;
  }

  // ── Contact Form ─────────────────────────────────────────

  function validateContactForm() {
    let valid = true;
    const fields = [
      { id: 'contactFirstName', required: true },
      { id: 'contactSurname', required: true },
      { id: 'contactEmail', required: true, type: 'email' },
      { id: 'contactPhone', required: true },
      { id: 'contactPostcode', required: true },
      { id: 'contactPremises', required: true },
      { id: 'contactAddress', required: true },
      { id: 'contactNotes', required: true },
    ];

    fields.forEach(field => {
      const input = document.getElementById(field.id);
      if (!input) return;
      const value = input.value.trim();
      let fieldValid = true;

      if (field.required && !value) {
        fieldValid = false;
      }
      if (field.type === 'email' && value && !isValidEmail(value)) {
        fieldValid = false;
      }

      if (!fieldValid) {
        input.classList.add('error');
        valid = false;
      } else {
        input.classList.remove('error');
      }
    });

    // Textarea validation (notes - optional, but we validate its container)
    const notesEl = document.getElementById('contactNotes');
    if (notesEl) notesEl.classList.remove('error');

    return valid;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function collectContactData() {
    state.contact = {
      firstName: document.getElementById('contactFirstName').value.trim(),
      surname: document.getElementById('contactSurname').value.trim(),
      email: document.getElementById('contactEmail').value.trim(),
      phone: document.getElementById('contactPhone').value.trim(),
      postcode: document.getElementById('contactPostcode').value.trim(),
      premises: document.getElementById('contactPremises').value.trim(),
      address: document.getElementById('contactAddress') ? document.getElementById('contactAddress').value.trim() : '',
      notes: document.getElementById('contactNotes') ? document.getElementById('contactNotes').value.trim() : '',
    };
  }

  function getFullName() {
    return `${state.contact.firstName} ${state.contact.surname}`.trim();
  }

  function prefillContactForm() {
    if (state.contactFilled) {
      document.getElementById('contactFirstName').value = state.contact.firstName;
      document.getElementById('contactSurname').value = state.contact.surname;
      document.getElementById('contactEmail').value = state.contact.email;
      document.getElementById('contactPhone').value = state.contact.phone;
      document.getElementById('contactPostcode').value = state.contact.postcode;
      document.getElementById('contactPremises').value = state.contact.premises;
      var addressEl = document.getElementById('contactAddress');
      if (addressEl) addressEl.value = state.contact.address;
      const notesEl = document.getElementById('contactNotes');
      if (notesEl) notesEl.value = state.contact.notes;
    }
  }

  // Populate contact page options (Choose Designer / Next)
  function populateContactOptions() {
    const container = document.getElementById('contactOptions');
    if (!container) return;

    let html = '';
    const submitBtn = document.getElementById('contactSubmitBtn');
    // Show options on room-first path when designer not yet chosen
    if (state.firstPath === 'room' && !state.completedPaths.has('designer') && !state.designer) {
      html += `
        <button type="button" class="btn btn-outline" id="contactChooseDesigner">Choose Your Designer</button>
        <span class="contact-options-divider">or</span>
        <button type="button" class="btn btn-primary" id="contactNext">Next</button>
      `;
      if (submitBtn) submitBtn.style.display = 'none';
    } else {
      if (submitBtn) submitBtn.style.display = '';
    }
    container.innerHTML = html;

    const chooseDesigner = document.getElementById('contactChooseDesigner');
    if (chooseDesigner) {
      chooseDesigner.addEventListener('click', () => {
        if (validateContactForm()) {
          collectContactData();
          state.contactFilled = true;
          state.completedPaths.add('room');
          navigateTo('designer-select');
        }
      });
    }

    const nextBtn = document.getElementById('contactNext');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (validateContactForm()) {
          collectContactData();
          state.contactFilled = true;
          state.completedPaths.add('room');
          proceedToScheduling();
        }
      });
    }
  }

  // ── Google Calendar Integration ─────────────────────────

  var _tokenPromise = null;
  function getAccessToken() {
    if (_tokenPromise) return _tokenPromise;
    const gc = CONFIG.googleCalendar;
    if (!gc.refreshToken) {
      console.warn('No refresh token configured');
      return Promise.resolve(null);
    }

    _tokenPromise = fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: gc.clientId,
        client_secret: gc.clientSecret,
        refresh_token: gc.refreshToken,
        grant_type: 'refresh_token',
      }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        console.error('OAuth token error:', data.error, data.error_description);
        showApiError('OAuth: ' + (data.error_description || data.error));
        return null;
      }
      return data.access_token || null;
    })
    .catch(err => {
      console.error('OAuth fetch error:', err);
      showApiError('OAuth fetch failed: ' + err.message);
      return null;
    });
    return _tokenPromise;
  }

  function getSlotMinutes() {
    return CONFIG.calendar.slotDuration || 60;
  }

  function buildCalendarDescription() {
    let desc = '';

    // Contact details with clickable links
    const fullName = getFullName();
    if (fullName) desc += `Name: ${fullName}\n`;
    if (state.contact.email) {
      desc += `Email: ${state.contact.email}\n`;
    }
    if (state.contact.phone) desc += `Phone: ${state.contact.phone}\n`;
    if (state.contact.postcode) desc += `Postcode: ${state.contact.postcode}\n`;
    if (state.contact.premises) desc += `Premises: ${state.contact.premises}${state.contact.address ? ', ' + state.contact.address : ''}\n`;
    if (state.appointmentSlot) {
      desc += isPhoneCall()
        ? `Call Type: Phone call (call the customer on ${state.contact.phone})\n`
        : 'Call Type: Video call (Google Meet)\n';
    }

    desc += '\n--- Selections ---\n';
    if (state.roomType) desc += `Room Type: ${state.roomType.title}\n`;
    if (state.ageGroup.length > 0) desc += `Age Group: ${state.ageGroup.map(a => a.title).join(', ')}\n`;
    if (state.roomSize) desc += `Room Size: ${state.roomSize.title}\n`;
    if (state.equipment.length > 0) desc += `Equipment: ${state.equipment.map(e => e.title).join(', ')}\n`;
    const designerLabel = !state.designer || state.designer.id === 'designer-any' ? 'Any (No Preference)' : state.designer.name;
    desc += `Designer: ${designerLabel}\n`;
    if (state.appointmentSlot && state.appointmentSlot.isSpecial) {
      desc += `Special Time Request: ${state.appointmentSlot.label}\n`;
      if (state.appointmentSlot.specialInfo) desc += `Request Info: ${state.appointmentSlot.specialInfo}\n`;
    }
    if (state.contact.notes) desc += `\nAdditional Notes: ${state.contact.notes}\n`;

    // Add clickable Gmail compose links
    desc += '\n--- Quick Actions ---\n';
    if (state.contact.email) {
      const subject = encodeURIComponent(`Sensory Room Consultation - ${fullName}`);
      const gmailLink = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(state.contact.email)}&su=${subject}`;
      desc += `Email: ${gmailLink}\n`;
    }
    if (state.contact.phone) {
      desc += `Phone: ${state.contact.phone}\n`;
    }

    return desc;
  }

  function createCalendarEvent() {
    return getAccessToken().then(token => {
      if (!token) {
        console.warn('No Google Calendar access token - skipping calendar event');
        return null;
      }

      const gc = CONFIG.googleCalendar;
      const slot = state.appointmentSlot;

      // Build event start/end (support special request with minute offset)
      const startDate = new Date(slot.date);
      const minute = slot.minute || 0;
      startDate.setHours(slot.hour, minute, 0, 0);
      const endDate = new Date(startDate.getTime() + (slot.duration || getSlotMinutes()) * 60 * 1000);

      const specialTag = slot.isSpecial ? ' (Special Request)' : '';
      const phoneTag = isPhoneCall() ? ' (Phone)' : '';
      const fullName = getFullName();
      const eventTitle = `${BRAND.callTitle}: ${fullName} - ${state.contact.premises || 'No Premises'}${phoneTag}${specialTag}`;

      const event = {
        summary: eventTitle,
        description: buildCalendarDescription(),
        colorId: BRAND.calendarColorId,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'Europe/London',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Europe/London',
        },
        // Invite the customer
        attendees: [
          { email: state.contact.email, displayName: fullName },
        ],
        guestsCanModify: false,
        guestsCanInviteOthers: false,
      };
      if (!isPhoneCall()) {
        // Google Meet video conference
        event.conferenceData = {
          createRequest: {
            requestId: `consult-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        };
      }

      return fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(gc.calendarId)}/events?conferenceDataVersion=1&sendUpdates=none`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            const msg = errData.error ? errData.error.message : ('HTTP ' + res.status);
            console.error('Calendar API error:', msg, errData);
            showApiError('Calendar: ' + msg);
            return null;
          });
        }
        return res.json();
      })
      .then(data => {
        if (data && data.htmlLink) console.log('Calendar event created:', data.htmlLink);
        return data;
      })
      .catch(err => {
        console.error('Failed to create calendar event:', err);
        showApiError('Calendar: ' + err.message);
        return null;
      });
    });
  }

  // ── Submit Helpers ───────────────────────────────────────

  function submitAndConfirm() {
    showLoading(true);

    var calendarPromise = state.appointmentSlot
      ? createCalendarEvent().catch(function(err) { console.error('Calendar error:', err); return null; })
      : Promise.resolve(null);

    calendarPromise.then(function(eventData) {
      var meetLink = null;
      try {
        if (eventData && eventData.conferenceData && eventData.conferenceData.entryPoints) {
          var eps = eventData.conferenceData.entryPoints;
          for (var i = 0; i < eps.length; i++) {
            if (eps[i].entryPointType === 'video') { meetLink = eps[i].uri; break; }
          }
        }
      } catch (e) {}

      return sendCustomerEmail(meetLink);
    }).then(function() {
      showLoading(false);
      showConfirmation();
    }).catch(function(err) {
      console.error('Submit flow error:', err);
      showLoading(false);
      showConfirmation();
    });
  }

  // ── Gmail Send Helper ─────────────────────────────────────

  function gmailSend(token, fromName, fromEmail, toName, toEmail, subject, htmlBody, bcc, ics) {
    var headers = [
      'MIME-Version: 1.0',
      'From: ' + fromName + ' <' + fromEmail + '>',
      'Reply-To: ' + fromName + ' <' + fromEmail + '>',
      'To: ' + toName + ' <' + toEmail + '>',
    ];
    if (bcc) headers.push('Bcc: ' + bcc);
    headers.push('Subject: =?UTF-8?B?' + btoa(unescape(encodeURIComponent(subject))) + '?=');

    if (ics) {
      // Multipart: HTML body + calendar invite attachment
      var boundary = 'sp_' + Date.now().toString(36);
      headers.push('Content-Type: multipart/mixed; boundary="' + boundary + '"');
      headers.push('');
      headers.push('--' + boundary);
      headers.push('Content-Type: text/html; charset=utf-8');
      headers.push('');
      headers.push(htmlBody);
      headers.push('');
      headers.push('--' + boundary);
      headers.push('Content-Type: text/calendar; method=REQUEST; charset=utf-8');
      headers.push('Content-Disposition: attachment; filename="invite.ics"');
      headers.push('');
      headers.push(ics);
      headers.push('');
      headers.push('--' + boundary + '--');
    } else {
      headers.push('Content-Type: text/html; charset=utf-8');
      headers.push('');
      headers.push(htmlBody);
    }

    var raw = headers.join('\r\n');
    var encoded = btoa(unescape(encodeURIComponent(raw)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded }),
    }).then(function(res) {
      if (!res.ok) {
        return res.text().then(function(body) {
          console.error('Gmail API ' + res.status + ':', body);
          return null;
        });
      }
      return res.json();
    }).catch(function(err) {
      console.error('Gmail fetch error:', err);
      return null;
    });
  }

  // ── Calendar invite (.ics) attached to customer email ────
  // Sent from design-visit@ so the customer never sees a personal address.

  function buildCustomerIcs(meetLink) {
    var slot = state.appointmentSlot;
    if (!slot) return null;
    var start = new Date(slot.date);
    start.setHours(slot.hour, slot.minute || 0, 0, 0);
    var end = new Date(start.getTime() + (slot.duration || getSlotMinutes()) * 60 * 1000);
    function fmt(d) {
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }
    var fullName = getFullName();
    var description, location;
    if (isPhoneCall()) {
      description = 'We will call you on ' + state.contact.phone;
      location = 'Phone call';
    } else {
      description = meetLink ? 'Join via Google Meet: ' + meetLink : 'Initial design consultation – details to follow';
      location = meetLink || '';
    }
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//' + BRAND.name + '//Design Consultation//EN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      'UID:consultation-' + Date.now() + '@' + CONFIG.emailTo.split('@')[1],
      'DTSTAMP:' + fmt(new Date()),
      'DTSTART:' + fmt(start),
      'DTEND:' + fmt(end),
      'SUMMARY:' + BRAND.callTitle + (isPhoneCall() ? ' (phone call)' : ''),
      'DESCRIPTION:' + description,
      location ? 'LOCATION:' + location : '',
      'ORGANIZER;CN=' + BRAND.senderName + ':mailto:' + CONFIG.emailTo,
      'ATTENDEE;CN=' + fullName + ';RSVP=TRUE:mailto:' + state.contact.email,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean);
    return lines.join('\r\n');
  }

  // ── Customer + company emails via Gmail API ─────────────
  // With a booked slot these confirm the consultation; without one (when
  // consultations are switched off) they acknowledge an enquiry.

  function sendCustomerEmail(meetLink) {
    return getAccessToken().then(function(token) {
      if (!token) return null;
      var booked = !!state.appointmentSlot;
      var fromName = BRAND.senderName;
      var fromEmail = CONFIG.emailTo;
      var fullName = getFullName();

      // Customer email (with calendar invite attached when booked)
      var custHtml = buildCustomerEmailHtml(meetLink);
      var custSubject = 'Next steps on your ' + BRAND.designLabel + ' Journey…';
      var custIcs = booked ? buildCustomerIcs(meetLink) : null;
      var custPromise = gmailSend(token, fromName, fromEmail, fullName, state.contact.email, custSubject, custHtml, null, custIcs);

      // Company notification to the design-visit@ group
      var compHtml = buildCompanyNotificationHtml(meetLink);
      var compSubject = BRAND.designLabel + (booked ? ' Consultation Booked' : ' Enquiry');
      var compTo = BRAND.name + (booked ? ' Bookings' : ' Enquiries');
      var compPromise = gmailSend(token, fromName, fromEmail, compTo, CONFIG.emailTo, compSubject, compHtml);

      return Promise.all([custPromise, compPromise]).then(function(results) {
        if (results[0] && results[0].id) console.log('Customer email sent:', results[0].id);
        if (results[1] && results[1].id) console.log('Company email sent:', results[1].id);
        return results;
      });
    }).catch(function(err) {
      console.error('Email error:', err);
      return null;
    });
  }

  // ── Company Notification Email (with images) ───────────

  function buildCompanyNotificationHtml(meetLink) {
    var hdr = BRAND.emailHeader;
    var booked = !!state.appointmentSlot;
    var s = '';
    s += '<div style="font-family:Arial,Helvetica,sans-serif;color:#333;line-height:1.6;max-width:640px;margin:0 auto;padding:20px;">';

    // Header with logo
    s += '<div style="background:' + hdr.background + ';color:' + hdr.textColor + ';padding:16px 24px;border-radius:8px 8px 0 0;' +
      (hdr.borderBottom ? 'border-bottom:' + hdr.borderBottom + ';' : '') + '">';
    s += '<img src="' + hdr.logoUrl + '" alt="' + BRAND.name + '" height="' + hdr.logoHeight + '" style="display:block;margin-bottom:8px;" />';
    s += '<h2 style="margin:0;font-size:20px;color:' + hdr.textColor + ';">' +
      (booked ? 'New Design Consultation Booking' : 'New Design Enquiry') + '<\/h2>';
    s += '<\/div>';

    // Contact details section
    var fullName = getFullName();
    s += '<div style="background:#f8f6f3;padding:16px 24px;border-bottom:2px solid ' + hdr.accent + ';">';
    s += '<h3 style="color:#2c3e50;font-size:16px;margin:0 0 10px;">Contact Details<\/h3>';
    s += '<table style="width:100%;border-collapse:collapse;">';
    if (fullName) s += companyRow('Name', fullName);
    if (state.contact.email) s += companyRow('Email', '<a href="mailto:' + state.contact.email + '" style="color:#1a73e8;">' + state.contact.email + '<\/a>');
    if (state.contact.phone) s += companyRow('Phone', state.contact.phone);
    if (state.contact.postcode) s += companyRow('Postcode', state.contact.postcode);
    if (state.contact.premises) {
      var premisesVal = state.contact.premises;
      if (state.contact.address) premisesVal += ', ' + state.contact.address;
      s += companyRow('Premises', premisesVal);
    }
    s += '<\/table><\/div>';

    // Appointment section
    if (booked) {
      s += '<div style="background:#fff;padding:16px 24px;border-bottom:1px solid #eee;">';
      s += '<h3 style="color:#2c3e50;font-size:16px;margin:0 0 10px;">Appointment<\/h3>';
      s += '<table style="width:100%;border-collapse:collapse;">';
      s += companyRow('Date & Time', state.appointmentSlot.label);
      if (isPhoneCall()) {
        s += companyRow('Call Type', 'Phone call – call the customer on <strong>' + state.contact.phone + '<\/strong>');
      } else {
        s += companyRow('Call Type', 'Video call (Google Meet)');
        if (meetLink) s += companyRow('Google Meet', '<a href="' + meetLink + '" style="color:#1a73e8;">' + meetLink + '<\/a>');
      }
      if (state.appointmentSlot.isSpecial && state.appointmentSlot.specialInfo) {
        s += companyRow('Special Request', state.appointmentSlot.specialInfo);
      }
      s += '<\/table><\/div>';
    }

    // Designer section with photo
    if (state.designer) {
      var dName = state.designer.id === 'designer-any' ? 'Any (No Preference)' : state.designer.name;
      s += '<div style="background:#f8f6f3;padding:16px 24px;border-bottom:1px solid #eee;">';
      s += '<h3 style="color:#2c3e50;font-size:16px;margin:0 0 10px;">Designer<\/h3>';
      if (state.designer.image && state.designer.id !== 'designer-any') {
        s += '<div style="display:inline-block;vertical-align:middle;margin-right:12px;">';
        s += '<img src="' + state.designer.image + '" alt="' + dName + '" width="60" height="60" style="border-radius:50%;object-fit:cover;" />';
        s += '<\/div>';
        s += '<span style="font-size:15px;font-weight:600;color:#2c3e50;vertical-align:middle;">' + dName + '<\/span>';
      } else {
        s += '<span style="font-size:15px;color:#333;">' + dName + '<\/span>';
      }
      s += '<\/div>';
    }

    // Room details
    s += '<div style="background:#fff;padding:16px 24px;border-bottom:1px solid #eee;">';
    s += '<h3 style="color:#2c3e50;font-size:16px;margin:0 0 10px;">Room Details<\/h3>';
    s += '<table style="width:100%;border-collapse:collapse;">';
    if (state.roomType) {
      var rtImg = state.roomType.image ? '<img src="' + state.roomType.image + '" width="40" height="30" style="border-radius:4px;vertical-align:middle;margin-right:8px;object-fit:cover;" />' : '';
      s += companyRow('Room Type', rtImg + '<span style="vertical-align:middle;">' + state.roomType.description + '<\/span>');
    }
    if (state.ageGroup.length > 0) {
      s += companyRow('Age Group', state.ageGroup.map(function(a) { return a.title; }).join(', '));
    }
    if (state.roomSize) s += companyRow('Room Size', state.roomSize.title);
    if (state.contact.notes) s += companyRow('Notes', '“' + state.contact.notes + '”');
    s += '<\/table><\/div>';

    // Equipment with images (grid)
    if (state.equipment.length > 0) {
      s += '<div style="background:#f8f6f3;padding:16px 24px;border-bottom:1px solid #eee;">';
      s += '<h3 style="color:#2c3e50;font-size:16px;margin:0 0 12px;">Equipment Selected<\/h3>';
      state.equipment.forEach(function(eq) {
        s += '<div style="display:inline-block;text-align:center;width:100px;margin:0 8px 12px 0;vertical-align:top;">';
        if (eq.image) {
          s += '<img src="' + eq.image + '" alt="' + eq.title + '" width="80" height="60" style="border-radius:6px;object-fit:cover;display:block;margin:0 auto 4px;" />';
        }
        s += '<span style="font-size:12px;color:#555;">' + eq.title + '<\/span>';
        s += '<\/div>';
      });
      s += '<\/div>';
    }

    s += '<\/div>';
    return s;
  }

  function companyRow(label, value) {
    return '<tr>' +
      '<td style="padding:6px 10px 6px 0;font-weight:600;color:#2c3e50;width:120px;vertical-align:top;font-size:14px;">' + label + '<\/td>' +
      '<td style="padding:6px 0;color:#333;font-size:14px;">' + value + '<\/td>' +
      '<\/tr>';
  }

  // ── Customer Email (via Gmail API) ──────────────────────

  function buildEmailSummaryHtml() {
    const rowStyle = 'display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:14px;';
    const labelStyle = 'font-weight:600;color:#2c3e50;';
    const valueStyle = 'color:#555;text-align:right;';
    const row = (label, value) =>
      '<div style="' + rowStyle + '"><span style="' + labelStyle + '">' + label + '<\/span><span style="' + valueStyle + '">' + value + '<\/span><\/div>';
    let rows = '';
    const fullName = getFullName();
    if (fullName) rows += row('Name', fullName);
    if (state.contact.email) rows += row('Email', state.contact.email);
    if (state.roomType) rows += row('Room Type', state.roomType.title);
    if (state.ageGroup.length > 0) rows += row('Age Group', state.ageGroup.map(a => a.title).join(', '));
    if (state.roomSize) rows += row('Room Size', state.roomSize.title);
    if (state.equipment.length > 0) rows += row('Equipment', state.equipment.map(e => e.title).join(', '));
    const designerLabel = (!state.designer || state.designer.id === 'designer-any') ? 'Any (No Preference)' : state.designer.name;
    rows += row('Designer', designerLabel);
    if (state.appointmentSlot) {
      rows += row('Call Type', isPhoneCall() ? 'Phone call' : 'Video call (Google Meet)');
      rows += row('Appointment', state.appointmentSlot.label);
    }
    if (!rows) return '';
    return '<h3 style="color:#2c3e50;margin-top:30px;font-size:18px;">' +
      (state.appointmentSlot ? 'Your Booking Summary' : 'Your Enquiry Summary') + '<\/h3>' +
      '<div style="background:#f8f6f3;border-radius:8px;padding:16px 20px;margin:12px 0 20px;">' + rows + '<\/div>';
  }

  function buildPrepListHtml() {
    return '<ul style="padding-left: 20px;">' +
        '<li>Photos of the room(s) as they currently are<\/li>' +
        '<li>Floor plans or measurements (if available)<\/li>' +
        '<li>Inspiration images, Pinterest boards, or styles you’re drawn to – you can browse our <a href="' + BRAND.photosUrl + '" style="color: #1a73e8;">sensory room photos<\/a> for ideas<\/li>' +
        '<li>Whether this is an existing room being redesigned or a completely new space<\/li>' +
        '<li>Your approximate budget for this project<\/li>' +
        '<li>Your ideal timescale<\/li>' +
        '<li>Details of any other stakeholders involved in the decision-making process<\/li>' +
        '<li>Any particular challenges or requirements you’d like us to be aware of<\/li>' +
      '<\/ul>';
  }

  function buildCustomerEmailHtml(meetLink) {
    const firstName = state.contact.firstName;
    const open = '<div style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">' +
      '<p>Dear ' + firstName + ',<\/p>';
    const close = buildEmailSummaryHtml() +
      '<p>Warm regards,<br><strong>' + BRAND.teamName + '<\/strong><\/p>' +
      '<\/div>';

    // Enquiry only (consultations switched off)
    if (!state.appointmentSlot) {
      return open +
        '<p>Thank you for your enquiry. Our team will be in contact shortly using the details you’ve provided. We look forward to helping you.<\/p>' +
        '<p>In the meantime, if you’re able to share any of the following, it will help us prepare (no problem at all if not):<\/p>' +
        '<ul style="padding-left: 20px;">' +
          '<li>Whether this is an existing room being redesigned or a completely new space<\/li>' +
          '<li>Your approximate budget for this project<\/li>' +
          '<li>Your ideal timescale<\/li>' +
          '<li>Details of any stakeholders involved in the decision-making process<\/li>' +
          '<li>Any particular challenges or requirements you’d like us to be aware of<\/li>' +
        '<\/ul>' +
        '<p>Simply reply to this email with anything you’d like to send over.<\/p>' +
        '<p>Following our initial consultation, we may need to conduct a site visit to gather further details and additional information. This is where our Sales Director, ' + BRAND.salesDirector + ', will take you through the process in more detail. This initial step ensures we have everything required to move your project forward accurately and efficiently.<\/p>' +
        close;
    }

    const slot = state.appointmentSlot;
    let meeting;
    if (isPhoneCall()) {
      meeting = '<p>We will call you on <strong>' + state.contact.phone + '<\/strong> on <strong>' + slot.dateFormatted + '<\/strong> at <strong>' + slot.timeFormatted + '<\/strong>.<\/p>' +
        '<p>If you would prefer a video call instead, or would like us to use a different number, just reply to this email and let us know.<\/p>';
    } else {
      meeting = (meetLink
        ? '<p>We are scheduled to meet on <strong>' + slot.dateFormatted + '</strong> at <strong>' + slot.timeFormatted + '</strong> via Google Meet:<br>' +
          '<a href="' + meetLink + '" style="color: #1a73e8; font-weight: bold;">' + meetLink + '<\/a><\/p>'
        : '<p>We will send you a Google Meet link for your consultation shortly.<\/p>') +
        '<p>If you would prefer to speak via phone or WhatsApp instead, just let us know and we will happily arrange that.<\/p>';
    }

    return open +
      '<p>Thank you for booking your initial design consultation, we’re really looking forward to speaking with you and learning more about your project.<\/p>' +
      '<p>Our initial discussion will take ' + (CONSULT.typicalLength || 'approximately 15–20 minutes') + ' and will give us a clearer understanding of your space, your vision, and how we can best support you.<\/p>' +
      '<p>To help us prepare ahead of our ' + (isPhoneCall() ? 'call' : 'meeting') + ', it would be greatly appreciated if you could share any of the following (where possible):<\/p>' +
      buildPrepListHtml() +
      '<p>If you’re unable to gather all of this information, please don’t worry, we can absolutely still have a valuable conversation. However, the more detail we have beforehand, the more productive and focused our time together will be.<\/p>' +
      '<p>Following our initial consultation, we may need to conduct a site visit to gather further details and additional information. This is where our Sales Director, ' + BRAND.salesDirector + ', will take you through the process in more detail. This initial step ensures we have everything required to move your project forward accurately and efficiently.<\/p>' +
      '<h3 style="color: #2c3e50; margin-top: 30px; font-size: 18px;">' + (isPhoneCall() ? 'Call Details' : 'Meeting Details') + '<\/h3>' +
      meeting +
      '<p>If you have any questions ahead of our call, please feel free to get in touch. We look forward to speaking with you soon.<\/p>' +
      close;
  }

  function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
  }

  // Show API errors visually (temporary debug banner)
  function showApiError(msg) {
    let banner = document.getElementById('apiErrorBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'apiErrorBanner';
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:10000;background:#c0392b;color:#fff;padding:12px 20px;font-size:14px;font-family:Arial,sans-serif;';
      banner.innerHTML = '<strong>API Errors (debug):</strong><br>';
      document.body.appendChild(banner);
    }
    banner.innerHTML += msg + '<br>';
  }

  function showConfirmation() {
    // Store summary data for the thank you page
    const summaryData = {};
    const fullName = getFullName();
    if (fullName) summaryData.name = fullName;
    if (state.contact.email) summaryData.email = state.contact.email;
    if (state.roomType) summaryData.roomType = state.roomType.title;
    if (state.ageGroup.length > 0) summaryData.ageGroup = state.ageGroup.map(a => a.title).join(', ');
    if (state.roomSize) summaryData.roomSize = state.roomSize.title;
    if (state.equipment.length > 0) summaryData.equipment = state.equipment.map(e => e.title).join(', ');
    const designerConfLabel = (!state.designer || state.designer.id === 'designer-any') ? 'Any (No Preference)' : state.designer.name;
    summaryData.designer = designerConfLabel;
    if (state.appointmentSlot) {
      summaryData.callType = isPhoneCall() ? 'Phone call' : 'Video call (Google Meet)';
      summaryData.appointment = state.appointmentSlot.label;
    }

    // Brands with their own thank-you page: hand the summary over and go there
    if (BRAND.thankYouUrl) {
      try {
        sessionStorage.setItem(BRAND.storageKey, JSON.stringify(summaryData));
      } catch (e) { /* ignore storage errors */ }
      window.location.href = BRAND.thankYouUrl;
      return;
    }

    // Otherwise show the thank-you step built into the form
    const ty = CONFIG.thankYou || {};
    const section = document.querySelector('.step[data-step="confirmation"]');
    if (section && ty.title) section.querySelector('h2').textContent = ty.title;
    if (ty.message) setText('confirmationMessage', ty.message);

    const labels = {
      name: 'Name', email: 'Email', roomType: 'Room Type', ageGroup: 'Age Group',
      roomSize: 'Room Size', equipment: 'Equipment', designer: 'Designer',
      callType: 'Call Type', appointment: 'Appointment',
    };
    const summaryEl = document.getElementById('confirmationSummary');
    if (summaryEl) {
      summaryEl.innerHTML = `<h3>${state.appointmentSlot ? 'Your Booking Summary' : 'Your Enquiry Summary'}</h3>` +
        Object.keys(labels).filter(k => summaryData[k]).map(k => summaryRow(labels[k], summaryData[k])).join('');
    }
    const actionsEl = document.getElementById('confirmationActions');
    if (actionsEl) actionsEl.innerHTML = '';

    navigateTo('confirmation');
  }

  function summaryRow(label, value) {
    return `<div class="summary-item"><span class="summary-label">${label}</span><span class="summary-value">${value}</span></div>`;
  }

  // ── Pre-fill contact on navigate ─────────────────────────
  const observer = new MutationObserver(() => {
    const contactStep = document.querySelector('.step[data-step="contact"]');
    if (contactStep && contactStep.classList.contains('active')) {
      prefillContactForm();
      populateContactOptions();
    }
  });

  // ── Hide Shopify Page Heading (JS fallback) ──────────────
  function hidePageHeading() {
    const app = document.getElementById('sensory-app');
    if (!app) return;
    if (BRAND.pageChrome === 'boost') {
      // Boost theme (Mike Ayres Design): hide only the page title and
      // breadcrumbs inside the main content, never the site header or footer
      const mainEl = document.querySelector('main') || document.querySelector('#MainContent') || document.querySelector('[role="main"]');
      if (mainEl) {
        mainEl.querySelectorAll('h1, .page-title, .page__title, .page__title-wrapper, .page-heading').forEach(el => {
          if (!app.contains(el)) el.style.display = 'none';
        });
      }
      document.querySelectorAll('.breadcrumb, .breadcrumbs, nav.breadcrumb, .breadcrumb-wrapper').forEach(el => {
        el.style.display = 'none';
      });
      return;
    }
    // Hide any h1/h2 elements that appear before the app container
    let el = app.previousElementSibling;
    while (el) {
      if (el.tagName === 'H1' || el.tagName === 'H2' || el.classList.contains('page-header') || el.classList.contains('page__title-wrapper')) {
        el.style.display = 'none';
      }
      el = el.previousElementSibling;
    }
    // Also hide parent section headers if the app is inside a Shopify section
    const parent = app.parentElement;
    if (parent) {
      const headings = parent.querySelectorAll('h1, h2.page-title, .page-header');
      headings.forEach(h => {
        if (!app.contains(h)) h.style.display = 'none';
      });
    }
    // Hide anything after the app that's part of the template
    let sibling = app.nextElementSibling;
    while (sibling) {
      if (sibling.tagName !== 'SCRIPT' && sibling.tagName !== 'STYLE') {
        sibling.style.display = 'none';
      }
      sibling = sibling.nextElementSibling;
    }
  }

  // ── Boot ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    hidePageHeading();
    init();

    const contactStep = document.querySelector('.step[data-step="contact"]');
    if (contactStep) {
      observer.observe(contactStep, { attributes: true, attributeFilter: ['class'] });
    }
  });

})();
