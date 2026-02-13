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
    ageGroup: null,
    roomSize: null,
    equipment: [],

    // Designer selections
    designer: null,
    appointmentSlot: null,

    // Contact details
    contact: {
      name: '',
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
    'tactile-mural': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="8" y="12" width="64" height="48" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M40 56V28" stroke="currentColor" stroke-width="2.5"/><path d="M40 28c-6-2-14 0-18 6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M40 34c5-1 12 1 14 6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M40 40c-5-1-10 1-12 5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M40 44c4-1 8 1 10 4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="58" cy="20" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M30 60h20" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'soft-play-elements': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="28" cy="48" r="14" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="52" cy="42" r="10" fill="none" stroke="currentColor" stroke-width="2"/><rect x="20" y="18" width="24" height="14" rx="7" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    'padding': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="14" y="10" width="12" height="44" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 16h6M17 22h6M17 28h6M17 34h6M17 40h6M17 46h6" stroke="currentColor" stroke-width="1" opacity="0.5"/><rect x="14" y="54" width="52" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 57h40M20 60h40M20 63h40" stroke="currentColor" stroke-width="1" opacity="0.5"/></svg>`,
    'vibration': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="30" y="20" width="20" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 28c-4 4-4 16 0 20M56 28c4 4 4 16 0 20" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M18 24c-6 6-6 22 0 28M62 24c6 6 6 22 0 28" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'lighting': `<svg viewBox="0 0 80 80" class="placeholder-icon"><path d="M40 68v-6" stroke="currentColor" stroke-width="2"/><path d="M40 62c-3 0-5-1-5-3v-2h10v2c0 2-2 3-5 3z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M32 56c-2-1-3-2-3-4s1-3 3-4" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><path d="M48 56c2-1 3-2 3-4s-1-3-3-4" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><path d="M35 52q5-8 5-20" stroke="currentColor" stroke-width="2" fill="none"/><path d="M45 52q-5-8-5-20" stroke="currentColor" stroke-width="2" fill="none"/><path d="M38 48q4-6 2-16" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.6"/><path d="M42 48q-4-6-2-16" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.6"/><circle cx="40" cy="28" r="2" fill="currentColor" opacity="0.3"/><circle cx="37" cy="38" r="1.5" fill="currentColor" opacity="0.3"/><circle cx="43" cy="35" r="1.5" fill="currentColor" opacity="0.3"/></svg>`,
    'interactive-panels': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="24" y="10" width="32" height="56" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 18h32" stroke="currentColor" stroke-width="1.5"/><path d="M32 30c0-5 4-8 8-8s8 3 8 8c0 6-4 8-8 14-4-6-8-8-8-14z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M36 50h8M34 55h12" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'weight-resistance': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="34" y="20" width="12" height="40" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="14" y="28" width="12" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="54" y="28" width="12" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M26 40h8M46 40h8" stroke="currentColor" stroke-width="2"/></svg>`,
    'balance': `<svg viewBox="0 0 80 80" class="placeholder-icon"><ellipse cx="40" cy="64" rx="18" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M40 64V44" stroke="currentColor" stroke-width="1.5"/><circle cx="40" cy="24" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M40 30v14" stroke="currentColor" stroke-width="2"/><path d="M32 38l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M34 50l6-6 6 6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'ball-pool': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="12" y="24" width="56" height="40" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 24h56" stroke="currentColor" stroke-width="2.5"/><path d="M8 24l4-6h56l4 6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="28" cy="48" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="44" cy="52" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="36" cy="38" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="54" cy="40" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="22" cy="38" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'climbing': `<svg viewBox="0 0 80 80" class="placeholder-icon"><path d="M20 14v52" stroke="currentColor" stroke-width="2"/><path d="M38 30c-4-2-8-1-10 2" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M28 32l10-2c4-1 6-4 6-7" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="38" cy="28" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M30 42l6-4 4 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="50" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="34" cy="60" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
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
    if (data.image) {
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
      }));
    });
  }

  function populateAgeCards() {
    const container = document.getElementById('ageCards');
    container.innerHTML = '';
    CONFIG.ageGroups.forEach(item => {
      container.appendChild(createChoiceCard(item, item.id, false, (selected) => {
        state.ageGroup = selected;
        setTimeout(() => navigateTo('room-size'), 350);
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
                createCalendarEventAndConfirm();
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
            // Designer-first: send email, then go to calendar
            sendEmailAndContinue(() => navigateTo('designer-calendar'));
          } else if (state.firstPath === 'room' && !state.completedPaths.has('room')) {
            state.completedPaths.add('room');
            sendEmailAndContinue(() => showConfirmation());
          } else {
            const currentPath = getCurrentPath();
            if (currentPath) state.completedPaths.add(currentPath);
            sendEmailAndContinue(() => showConfirmation());
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
            createCalendarEventAndConfirm();
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
      { id: 'contactName', required: true },
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
      name: document.getElementById('contactName').value.trim(),
      email: document.getElementById('contactEmail').value.trim(),
      phone: document.getElementById('contactPhone').value.trim(),
      postcode: document.getElementById('contactPostcode').value.trim(),
      premises: document.getElementById('contactPremises').value.trim(),
      notes: document.getElementById('contactNotes') ? document.getElementById('contactNotes').value.trim() : '',
    };
  }

  function prefillContactForm() {
    if (state.contactFilled) {
      document.getElementById('contactName').value = state.contact.name;
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
          sendEmailAndContinue(() => navigateTo('designer-select'));
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
          sendEmailAndContinue(() => navigateTo('designer-calendar'));
        }
      });
    }
  }

  // ── Google Calendar Integration ─────────────────────────

  function getAccessToken() {
    const gc = CONFIG.googleCalendar;
    if (!gc.refreshToken) return Promise.resolve(null);

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
    .then(data => data.access_token || null)
    .catch(() => null);
  }

  function buildCalendarDescription() {
    let desc = '';

    // Contact details with clickable links
    if (state.contact.name) desc += `Name: ${state.contact.name}\n`;
    if (state.contact.email) {
      const emailName = [state.contact.name, state.contact.premises].filter(Boolean).join(' - ');
      desc += `Email: ${state.contact.email}\n`;
    }
    if (state.contact.phone) desc += `Phone: ${state.contact.phone}\n`;
    if (state.contact.postcode) desc += `Postcode: ${state.contact.postcode}\n`;
    if (state.contact.premises) desc += `Premises: ${state.contact.premises}\n`;

    desc += '\n--- Selections ---\n';
    if (state.roomType) desc += `Room Type: ${state.roomType.title}\n`;
    if (state.ageGroup) desc += `Age Group: ${state.ageGroup.title}\n`;
    if (state.roomSize) desc += `Room Size: ${state.roomSize.title}\n`;
    if (state.equipment.length > 0) desc += `Equipment: ${state.equipment.map(e => e.title).join(', ')}\n`;
    if (state.designer) desc += `Designer: ${state.designer.name}\n`;
    if (state.contact.notes) desc += `\nAdditional Notes: ${state.contact.notes}\n`;

    // Add clickable email and phone
    desc += '\n--- Quick Actions ---\n';
    if (state.contact.email) {
      const emailName = encodeURIComponent([state.contact.name, state.contact.premises].filter(Boolean).join(' - '));
      desc += `<a href="mailto:${state.contact.email}?subject=Sensory Room Consultation&to=${emailName} <${state.contact.email}>">${state.contact.name || state.contact.email}</a>\n`;
    }
    if (state.contact.phone) {
      desc += `<a href="tel:${state.contact.phone}">${state.contact.phone}</a>\n`;
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

      // Build event start/end
      const startDate = new Date(slot.date);
      startDate.setHours(slot.hour, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(slot.hour + 1, 0, 0, 0);

      const eventTitle = `Consultation: ${state.contact.name} - ${state.contact.premises || 'No Premises'}`;

      const event = {
        summary: eventTitle,
        description: buildCalendarDescription(),
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'Europe/London',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Europe/London',
        },
      };

      return fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(gc.calendarId)}/events?key=${gc.apiKey}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })
      .then(res => {
        if (!res.ok) throw new Error(`Calendar API error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Calendar event created:', data.htmlLink);
        return data;
      })
      .catch(err => {
        console.error('Failed to create calendar event:', err);
        return null;
      });
    });
  }

  // ── Submit Helpers ───────────────────────────────────────

  // Send email only, then run callback (used on contact page Next)
  function sendEmailAndContinue(callback) {
    const data = buildSubmissionData();
    showLoading(true);
    sendEmail(data)
      .catch(err => { console.error('Email error:', err); })
      .then(() => {
        showLoading(false);
        if (callback) callback();
      });
  }

  // Create calendar event only, then show confirmation (used on calendar page)
  function createCalendarEventAndConfirm() {
    showLoading(true);
    createCalendarEvent()
      .catch(err => { console.error('Calendar error:', err); })
      .then(() => {
        showLoading(false);
        showConfirmation();
      });
  }

  function buildSubmissionData() {
    const data = {};

    data['Name'] = state.contact.name;
    data['Email'] = state.contact.email;
    data['Phone'] = state.contact.phone;
    if (state.contact.postcode) data['Postcode'] = state.contact.postcode;
    if (state.contact.premises) data['Premises'] = state.contact.premises;
    if (state.contact.notes) data['Notes'] = state.contact.notes;

    if (state.roomType) data['Room Type'] = state.roomType.title;
    if (state.ageGroup) data['Age Group'] = state.ageGroup.title;
    if (state.roomSize) data['Room Size'] = state.roomSize.title;
    if (state.equipment.length > 0) {
      data['Equipment'] = state.equipment.map(e => e.title).join(', ');
    }

    if (state.designer) data['Designer'] = state.designer.name;
    if (state.appointmentSlot) {
      data['Appointment'] = state.appointmentSlot.label;
    }

    data['_subject'] = 'New Sensory Room Design Consultation Request';

    return data;
  }

  function sendEmail(data) {
    return fetch(CONFIG.formAction, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
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

  function showConfirmation() {
    const currentPath = getCurrentPath();
    state.completedPaths.add(currentPath);

    const summaryEl = document.getElementById('confirmationSummary');
    let summaryHtml = '<h3>Your Selections</h3>';

    if (state.contact.name) summaryHtml += summaryRow('Name', state.contact.name);
    if (state.contact.email) summaryHtml += summaryRow('Email', state.contact.email);
    if (state.contact.phone) summaryHtml += summaryRow('Phone', state.contact.phone);
    if (state.contact.postcode) summaryHtml += summaryRow('Postcode', state.contact.postcode);
    if (state.contact.premises) summaryHtml += summaryRow('Premises', state.contact.premises);
    if (state.contact.notes) summaryHtml += summaryRow('Notes', state.contact.notes);
    if (state.roomType) summaryHtml += summaryRow('Room Type', state.roomType.title);
    if (state.ageGroup) summaryHtml += summaryRow('Age Group', state.ageGroup.title);
    if (state.roomSize) summaryHtml += summaryRow('Room Size', state.roomSize.title);
    if (state.equipment.length > 0) summaryHtml += summaryRow('Equipment', state.equipment.map(e => e.title).join(', '));
    if (state.designer) summaryHtml += summaryRow('Designer', state.designer.name);
    if (state.appointmentSlot) summaryHtml += summaryRow('Appointment', state.appointmentSlot.label);

    summaryEl.innerHTML = summaryHtml;

    const actionsEl = document.getElementById('confirmationActions');
    let actionsHtml = '';

    if (!state.completedPaths.has('designer') && currentPath === 'room') {
      actionsHtml += `<button class="btn btn-primary" id="continueToDesigner">Choose Your Designer</button>`;
    }
    if (!state.completedPaths.has('room') && currentPath === 'designer') {
      actionsHtml += `<button class="btn btn-primary" id="continueToRoom">Choose Your Room Type</button>`;
    }

    actionsHtml += `<p style="color:var(--color-text-light);font-size:var(--font-size-sm);margin-top:var(--space-md);">To learn more about our design process:</p>`;
    actionsHtml += `<a href="${CONFIG.designBookUrl}" onclick="window.open(this.href, 'DesignBook', 'width=800,height=600,scrollbars=yes,resizable=yes'); return false;" class="btn btn-outline" style="text-decoration:none;">View Our Design Book</a>`;

    actionsEl.innerHTML = actionsHtml;

    const continueDesigner = document.getElementById('continueToDesigner');
    if (continueDesigner) {
      continueDesigner.addEventListener('click', () => {
        state.history = [];
        navigateTo('designer-select');
      });
    }

    const continueRoom = document.getElementById('continueToRoom');
    if (continueRoom) {
      continueRoom.addEventListener('click', () => {
        state.history = [];
        navigateTo('room-type');
      });
    }

    state.history.push(state.currentStep);
    state.currentStep = 'confirmation';
    showStep('confirmation');
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // ── Boot ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    init();

    const contactStep = document.querySelector('.step[data-step="contact"]');
    if (contactStep) {
      observer.observe(contactStep, { attributes: true, attributeFilter: ['class'] });
    }
  });

})();
