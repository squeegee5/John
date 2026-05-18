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
      notes: '',
    },
    contactFilled: false,
  };

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

  // ── Initialization ───────────────────────────────────────
  function init() {
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
        // Update age group state from selected cards
        state.ageGroup = [];
        container.querySelectorAll('.choice-card.selected').forEach(card => {
          const ag = CONFIG.ageGroups.find(a => a.id === card.dataset.id);
          if (ag) state.ageGroup.push(ag);
        });
      }));
    });
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
      }));
    });
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
          setTimeout(() => navigateTo('designer-calendar'), 350);
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

  function navigateTo(step) {
    // Initialize or re-render calendar when navigating to calendar step
    if (step === 'designer-calendar') {
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
    return steps;
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
            navigateTo('designer-calendar');
          } else if (state.firstPath === 'room' && !state.completedPaths.has('room')) {
            state.completedPaths.add('room');
            // Room path submit: go to calendar (email sent after slot selected)
            navigateTo('designer-calendar');
          } else {
            const currentPath = getCurrentPath();
            if (currentPath) state.completedPaths.add(currentPath);
            // Already has appointment: send email + calendar event
            if (state.appointmentSlot) {
              submitAndConfirm();
            } else {
              navigateTo('designer-calendar');
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

  // Get the "anytime" slot: 11am on next working day at least 2 days ahead
  function getAnytimeSlot() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minAhead = CONFIG.calendar.minDaysAhead || 2;
    const scheduleDays = Object.keys(CONFIG.calendar.schedule).map(Number);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + minAhead);

    let d = new Date(startDate);
    for (let i = 0; i < 14; i++) {
      if (scheduleDays.includes(d.getDay())) {
        const hour = 11;
        const calInst = calendarInstance || { formatDateLong: CalendarBooking.prototype.formatDateLong, formatHour24: CalendarBooking.prototype.formatHour24 };
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const dateLong = `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
        return {
          date: new Date(d),
          hour: hour,
          dateFormatted: dateLong,
          timeFormatted: '11:00 - 12:00',
          label: `${dateLong}, 11:00 - 12:00`,
        };
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
          navigateTo('designer-calendar');
        }
      });
    }
  }

  // ── Google Calendar Integration ─────────────────────────

  function getAccessToken() {
    const gc = CONFIG.googleCalendar;
    if (!gc.refreshToken) {
      console.warn('No refresh token configured');
      return Promise.resolve(null);
    }

    return fetch('https://oauth2.googleapis.com/token', {
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
    if (state.contact.premises) desc += `Premises: ${state.contact.premises}\n`;

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
      const endDate = new Date(startDate);
      endDate.setTime(startDate.getTime() + 60 * 60 * 1000); // 1 hour

      const specialTag = slot.isSpecial ? ' (Special Request)' : '';
      const fullName = getFullName();
      const eventTitle = `Mike Ayres Design Call: ${fullName} - ${state.contact.premises || 'No Premises'}${specialTag}`;

      const event = {
        summary: eventTitle,
        description: buildCalendarDescription(),
        colorId: '9', // Blue (Blueberry) dot on calendar
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'Europe/London',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Europe/London',
        },
        // Google Meet video conference
        conferenceData: {
          createRequest: {
            requestId: `consult-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        // Invite the customer
        attendees: [
          { email: state.contact.email, displayName: fullName },
        ],
        guestsCanModify: false,
        guestsCanInviteOthers: false,
      };

      return fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(gc.calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`, {
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

  // Create calendar event first (for Meet link), then send both emails
  function submitAndConfirm() {
    showLoading(true);

    // Step 1: Create calendar event (needed for Meet link)
    const calendarPromise = state.appointmentSlot
      ? createCalendarEvent().catch(err => { console.error('Calendar error:', err); return null; })
      : Promise.resolve(null);

    calendarPromise.then(eventData => {
      // Extract Google Meet link from event response
      let meetLink = null;
      if (eventData && eventData.conferenceData && eventData.conferenceData.entryPoints) {
        const videoEntry = eventData.conferenceData.entryPoints.find(e => e.entryPointType === 'video');
        if (videoEntry) meetLink = videoEntry.uri;
      }

      // Include Meet link in submission data
      const data = buildSubmissionData();
      if (meetLink) data['Google Meet'] = meetLink;

      // Step 2: Send company email + customer email in parallel
      const companyEmail = sendEmail(data, meetLink).catch(err => {
        console.error('Company email error:', err);
        showApiError('Company email: ' + err.message);
      });
      // Always send customer email (with or without Meet link)
      const customerEmail = sendCustomerEmail(meetLink).catch(err => {
        console.error('Customer email error:', err);
        showApiError('Customer email: ' + err.message);
      });

      return Promise.all([companyEmail, customerEmail]);
    }).then(() => {
      showLoading(false);
      showConfirmation();
    });
  }

  function buildSubmissionData() {
    const data = {};

    data['Name'] = getFullName();
    data['Email'] = state.contact.email;
    data['Phone'] = state.contact.phone;
    if (state.contact.postcode) data['Postcode'] = state.contact.postcode;
    if (state.contact.premises) data['Premises'] = state.contact.premises;
    if (state.contact.notes) data['Notes'] = state.contact.notes;

    if (state.roomType) data['Room Type'] = state.roomType.title;
    if (state.ageGroup.length > 0) data['Age Group'] = state.ageGroup.map(a => a.title).join(', ');
    if (state.roomSize) data['Room Size'] = state.roomSize.title;
    if (state.equipment.length > 0) {
      data['Equipment'] = state.equipment.map(e => e.title).join(', ');
    }

    data['Designer'] = (!state.designer || state.designer.id === 'designer-any') ? 'Any (No Preference)' : state.designer.name;
    if (state.appointmentSlot) {
      data['Appointment'] = state.appointmentSlot.label;
      if (state.appointmentSlot.isSpecial && state.appointmentSlot.specialInfo) {
        data['Special Request Info'] = state.appointmentSlot.specialInfo;
      }
    }

    data['_subject'] = 'Mike Ayres Design Consultation Booked';
    data['_replyto'] = state.contact.email;

    return data;
  }

  function sendEmail(data, meetLink) {
    return getAccessToken().then(token => {
      if (!token) {
        console.warn('No access token - skipping company notification email');
        return null;
      }

      const subject = 'Mike Ayres Design Consultation Booked';
      const emailHtml = buildCompanyEmailHtml(data, meetLink);

      const message = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        `From: Mike Ayres Design Team <${CONFIG.emailTo}>`,
        'To: john@southpaw.co.uk',
        `Cc: ${CONFIG.emailTo}`,
        `Reply-To: ${data['Name']} <${data['Email']}>`,
        'Subject: =?UTF-8?B?' + btoa(unescape(encodeURIComponent(subject))) + '?=',
        '',
        emailHtml,
      ].join('\r\n');

      const encoded = btoa(unescape(encodeURIComponent(message)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      return fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encoded }),
      }).then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            const msg = errData.error ? errData.error.message : ('HTTP ' + res.status);
            console.error('Company email API error:', msg);
            throw new Error(msg);
          });
        }
        return res.json();
      });
    });
  }

  function buildCompanyEmailHtml(data, meetLink) {
    const rowStyle = 'padding:10px 14px;border-bottom:1px solid #eee;font-size:14px;';
    const labelStyle = 'font-weight:600;color:#2c3e50;width:160px;vertical-align:top;';
    const valueStyle = 'color:#333;';

    let rows = '';
    const fields = ['Name', 'Email', 'Phone', 'Postcode', 'Premises', 'Room Type', 'Age Group', 'Room Size', 'Equipment', 'Designer', 'Appointment', 'Special Request Info', 'Google Meet', 'Notes'];
    fields.forEach(function(field) {
      if (data[field]) {
        let val = data[field];
        if (field === 'Google Meet') val = '<a href="' + val + '" style="color:#1a73e8;">' + val + '<\/a>';
        if (field === 'Email') val = '<a href="mailto:' + val + '" style="color:#1a73e8;">' + val + '<\/a>';
        rows += '<tr><td style="' + rowStyle + labelStyle + '">' + field + '<\/td><td style="' + rowStyle + valueStyle + '">' + val + '<\/td><\/tr>';
      }
    });

    return '<div style="font-family:Arial,Helvetica,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;">' +
      '<h2 style="color:#2c3e50;font-size:20px;margin-bottom:16px;">New Design Consultation Booking<\/h2>' +
      '<table style="width:100%;border-collapse:collapse;background:#f8f6f3;border-radius:8px;overflow:hidden;">' + rows + '<\/table>' +
      '<p style="margin-top:16px;font-size:13px;color:#888;">This notification was sent automatically from the Mike Ayres Design booking form.<\/p>' +
    '<\/div>';
  }

  // ── Customer Email (via Gmail API) ──────────────────────

  function getDesignerFirstName() {
    if (!state.designer || state.designer.id === 'designer-any') {
      return 'The Mike Ayres Design Team';
    }
    return state.designer.name.split(' ')[0];
  }

  function buildEmailSummaryHtml() {
    const rowStyle = 'display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:14px;';
    const labelStyle = 'font-weight:600;color:#2c3e50;';
    const valueStyle = 'color:#555;text-align:right;';
    let rows = '';
    const fullName = getFullName();
    if (fullName) rows += '<div style="' + rowStyle + '"><span style="' + labelStyle + '">Name<\/span><span style="' + valueStyle + '">' + fullName + '<\/span><\/div>';
    if (state.contact.email) rows += '<div style="' + rowStyle + '"><span style="' + labelStyle + '">Email<\/span><span style="' + valueStyle + '">' + state.contact.email + '<\/span><\/div>';
    if (state.roomType) rows += '<div style="' + rowStyle + '"><span style="' + labelStyle + '">Room Type<\/span><span style="' + valueStyle + '">' + state.roomType.title + '<\/span><\/div>';
    if (state.ageGroup.length > 0) rows += '<div style="' + rowStyle + '"><span style="' + labelStyle + '">Age Group<\/span><span style="' + valueStyle + '">' + state.ageGroup.map(a => a.title).join(', ') + '<\/span><\/div>';
    if (state.roomSize) rows += '<div style="' + rowStyle + '"><span style="' + labelStyle + '">Room Size<\/span><span style="' + valueStyle + '">' + state.roomSize.title + '<\/span><\/div>';
    if (state.equipment.length > 0) rows += '<div style="' + rowStyle + '"><span style="' + labelStyle + '">Equipment<\/span><span style="' + valueStyle + '">' + state.equipment.map(e => e.title).join(', ') + '<\/span><\/div>';
    const designerLabel = (!state.designer || state.designer.id === 'designer-any') ? 'Any (No Preference)' : state.designer.name;
    rows += '<div style="' + rowStyle + '"><span style="' + labelStyle + '">Designer<\/span><span style="' + valueStyle + '">' + designerLabel + '<\/span><\/div>';
    if (state.appointmentSlot) rows += '<div style="' + rowStyle + 'border-bottom:none;"><span style="' + labelStyle + '">Appointment<\/span><span style="' + valueStyle + '">' + state.appointmentSlot.label + '<\/span><\/div>';
    if (!rows) return '';
    return '<h3 style="color:#2c3e50;margin-top:30px;font-size:18px;">Your Booking Summary<\/h3>' +
      '<div style="background:#f8f6f3;border-radius:8px;padding:16px 20px;margin:12px 0 20px;">' + rows + '<\/div>';
  }

  function buildCustomerEmailHtml(meetLink) {
    const firstName = state.contact.firstName;

    return '<div style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">' +
      '<p>Dear ' + firstName + ',<\/p>' +
      '<p>Thank you for booking your initial design consultation, we\u2019re really looking forward to speaking with you and learning more about your project.<\/p>' +
      '<p>Our discussion will take approximately 15\u201320 minutes and will give us a clearer understanding of your space, your vision, and how we can best support you.<\/p>' +
      '<p>To help us prepare ahead of our meeting, it would be greatly appreciated if you could share any of the following (where possible):<\/p>' +
      '<ul style="padding-left: 20px;">' +
        '<li>Photos of the room(s) as they currently are<\/li>' +
        '<li>Floor plans or measurements (if available)<\/li>' +
        '<li>Inspiration images, Pinterest boards, or styles you\u2019re drawn to \u2013 you can browse our <a href="https:\/\/mikeayresdesign.co.uk\/pages\/sensory-room-photos" style="color: #1a73e8;">sensory room photos<\/a> for ideas<\/li>' +
        '<li>Whether this is an existing room being redesigned or a completely new space<\/li>' +
        '<li>Your approximate budget range<\/li>' +
        '<li>Your ideal timescale<\/li>' +
        '<li>Any other stakeholders involved in the decision-making process<\/li>' +
        '<li>Any particular challenges or requirements you\u2019d like us to be aware of<\/li>' +
      '<\/ul>' +
      '<p>If you\u2019re unable to gather all of this information, please don\u2019t worry, we can absolutely still have a valuable conversation. However, the more detail we have beforehand, the more productive and focused our time together will be.<\/p>' +
      '<p>Following our initial consultation, we may need to conduct a site visit to gather further details and additional information. This is where our Sales Director, Mike, will take you through the process in more detail. This initial step ensures we have everything required to move your project forward accurately and efficiently.<\/p>' +
      '<h3 style="color: #2c3e50; margin-top: 30px; font-size: 18px;">Meeting Details<\/h3>' +
      (meetLink
        ? '<p>We are scheduled to meet on <strong>' + state.appointmentSlot.dateFormatted + '</strong> at <strong>' + state.appointmentSlot.timeFormatted + '</strong> via Google Meet:<br>' +
          '<a href="' + meetLink + '" style="color: #1a73e8; font-weight: bold;">' + meetLink + '<\/a><\/p>'
        : '<p>We will send you a Google Meet link for your consultation shortly.<\/p>') +
      '<p>If you would prefer to speak via phone or WhatsApp instead, just let us know and we will happily arrange that.<\/p>' +
      '<p>If you have any questions ahead of our call, please feel free to get in touch. We look forward to speaking with you soon.<\/p>' +
      buildEmailSummaryHtml() +
      '<p>Warm regards,<br><strong>The Mike Ayres Design Team<\/strong><\/p>' +
    '<\/div>';
  }

  function sendCustomerEmail(meetLink) {
    return getAccessToken().then(token => {
      if (!token) {
        console.warn('No access token - skipping customer email');
        return null;
      }

      const fullName = getFullName();
      const emailHtml = buildCustomerEmailHtml(meetLink);

      // Construct MIME message (From uses the alias configured in Gmail)
      const message = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        `From: Mike Ayres Design Team <${CONFIG.emailTo}>`,
        `Reply-To: Mike Ayres Design Team <${CONFIG.emailTo}>`,
        `To: ${fullName} <${state.contact.email}>`,
        'Subject: =?UTF-8?B?' + btoa(unescape(encodeURIComponent('Next steps on your Mike Ayres Design Journey\u2026'))) + '?=',
        '',
        emailHtml,
      ].join('\r\n');

      // Base64url encode
      const encoded = btoa(unescape(encodeURIComponent(message)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      return fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encoded }),
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            const msg = errData.error ? (errData.error.message || errData.error.status) : ('HTTP ' + res.status);
            console.error('Gmail API error:', msg, errData);
            showApiError('Gmail: ' + msg);
            return null;
          });
        }
        return res.json();
      })
      .then(data => {
        if (data && data.id) console.log('Customer email sent:', data.id);
        return data;
      })
      .catch(err => {
        console.error('Failed to send customer email:', err);
        showApiError('Gmail: ' + err.message);
        return null;
      });
    });
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
    if (state.appointmentSlot) summaryData.appointment = state.appointmentSlot.label;

    try {
      sessionStorage.setItem('mad_booking', JSON.stringify(summaryData));
    } catch (e) { /* ignore storage errors */ }

    // Redirect to the thank you page (for Google Ads conversion tracking)
    window.location.href = 'https://mikeayresdesign.co.uk/pages/thank-you';
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
    // Only hide the page-level "Design Consultation" title, not the site header
    const mainEl = document.querySelector('main') || document.querySelector('#MainContent') || document.querySelector('[role="main"]');
    if (!mainEl) return;
    // Hide h1 page titles within the main content area only
    mainEl.querySelectorAll('h1, .page-title, .page__title, .page__title-wrapper, .page-heading').forEach(el => {
      const app = document.getElementById('sensory-app');
      if (app && !app.contains(el)) el.style.display = 'none';
    });
    // Hide breadcrumbs
    document.querySelectorAll('.breadcrumb, .breadcrumbs, nav.breadcrumb, .breadcrumb-wrapper').forEach(el => {
      el.style.display = 'none';
    });
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
