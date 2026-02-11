/**
 * ============================================================
 * SENSORY ROOM BOOKING SYSTEM - MAIN APPLICATION
 * ============================================================
 * Handles step navigation, card rendering, state management,
 * form validation, and email submission.
 * ============================================================
 */

(function () {
  'use strict';

  // ── State ────────────────────────────────────────────────
  const state = {
    currentStep: 'landing',
    history: [],            // navigation history for back button
    firstPath: null,        // 'room' or 'designer' - which path the user chose first
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
    },
    contactFilled: false,
  };

  let calendarInstance = null;

  // ── Placeholder SVG icons ────────────────────────────────
  // These are used when no image URL is provided in config.
  // Each returns an SVG string for the card placeholder.
  const placeholderIcons = {
    // Room types
    'si': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="40" cy="30" r="12" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 65c0-12 9-20 20-20s20 8 20 20" fill="none" stroke="currentColor" stroke-width="2"/><path d="M55 35l8-8M55 25l8 8M25 35l-8-8M25 25l-8 8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'mse': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="15" y="20" width="50" height="35" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="37" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="50" cy="37" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M25 50h30M15 55v8M65 55v8" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    'soft-play': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="30" cy="45" r="14" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="52" cy="38" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="45" cy="55" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M18 25c5-5 12-5 17 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'de-escalation': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="40" cy="40" r="22" fill="none" stroke="currentColor" stroke-width="2"/><path d="M32 38c2-4 6-6 8-3s2 8-1 10-7 1-8-3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M48 38c-2-4-6-6-8-3s-2 8 1 10 7 1 8-3" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'projection': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="10" y="25" width="25" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="22" cy="34" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M35 34l30-12v24z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    'mural': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="12" y="15" width="56" height="42" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 45l15-12 10 8 15-15 16 12" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="28" cy="28" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M30 57h20" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    'other': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="40" cy="34" r="16" fill="none" stroke="currentColor" stroke-width="2"/><path d="M36 28c0-4 3-6 5-6s4 2 4 4c0 3-3 4-4 6v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="40" cy="43" r="1.5" fill="currentColor"/><path d="M22 58h36" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'multiple-rooms': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="10" y="18" width="28" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><rect x="42" y="18" width="28" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><rect x="10" y="42" width="28" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><rect x="42" y="42" width="28" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,

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

    // Equipment (generic icons)
    'bubble-tubes': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="30" y="15" width="20" height="50" rx="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="40" cy="50" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="37" cy="40" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="43" cy="30" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'swings': `<svg viewBox="0 0 80 80" class="placeholder-icon"><path d="M15 15h50" stroke="currentColor" stroke-width="2.5"/><path d="M30 15v35M50 15v35" stroke="currentColor" stroke-width="2"/><rect x="25" y="50" width="30" height="6" rx="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    'projectors': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="10" y="28" width="30" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="25" cy="39" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M40 34l25-10v30L40 44z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'tactile-panels': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="15" y="15" width="50" height="50" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="30" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="42" y="25" width="12" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M25 48h30" stroke="currentColor" stroke-width="2"/><path d="M25 55h20" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'tactile-mural': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="10" y="12" width="60" height="44" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 40l18-14 12 10 12-8 18 12" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="25" cy="26" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M30 60h20" stroke="currentColor" stroke-width="2"/></svg>`,
    'soft-play-elements': `<svg viewBox="0 0 80 80" class="placeholder-icon"><circle cx="28" cy="48" r="14" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="52" cy="42" r="10" fill="none" stroke="currentColor" stroke-width="2"/><rect x="20" y="18" width="24" height="14" rx="7" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    'padding': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="12" y="12" width="56" height="56" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="18" y="18" width="44" height="44" rx="4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 2"/></svg>`,
    'vibration': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="30" y="20" width="20" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 28c-4 4-4 16 0 20M56 28c4 4 4 16 0 20" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M18 24c-6 6-6 22 0 28M62 24c6 6 6 22 0 28" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'lighting': `<svg viewBox="0 0 80 80" class="placeholder-icon"><path d="M40 12v8M18 22l5 5M62 22l-5 5M12 40h8M60 40h8" stroke="currentColor" stroke-width="2"/><circle cx="40" cy="40" r="14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M34 54v6h12v-6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M34 62h12M36 66h8" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'interactive-panels': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="14" y="14" width="52" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 54h52M32 54v10M48 54v10M28 64h24" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="40" cy="34" r="3" fill="currentColor"/><path d="M40 34l-6 8h12z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'weight-resistance': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="34" y="20" width="12" height="40" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="14" y="28" width="12" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="54" y="28" width="12" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M26 40h8M46 40h8" stroke="currentColor" stroke-width="2"/></svg>`,
    'balance': `<svg viewBox="0 0 80 80" class="placeholder-icon"><ellipse cx="40" cy="55" rx="28" ry="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M40 55V25" stroke="currentColor" stroke-width="2"/><circle cx="40" cy="22" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M30 50c3-3 7-4 10-4s7 1 10 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'ball-pool': `<svg viewBox="0 0 80 80" class="placeholder-icon"><path d="M12 40c0 16 12 28 28 28s28-12 28-28" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="28" cy="48" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="44" cy="52" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="36" cy="38" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="52" cy="42" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="22" cy="38" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    'climbing': `<svg viewBox="0 0 80 80" class="placeholder-icon"><rect x="15" y="10" width="50" height="60" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="28" cy="24" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="50" cy="36" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="32" cy="48" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="48" cy="58" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="24" cy="38" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
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

    // Room card
    container.appendChild(createLandingCard('room', CONFIG.landingCards.room, 'room'));
    // Designer card
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
        // Deselect siblings
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
        // Auto-advance after short delay
        setTimeout(() => navigateTo('room-age'), 350);
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
        // Update equipment state from selected cards
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
        // If designer-first path, go through room selections before calendar
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
            // Auto-advance after slot selection
            setTimeout(() => {
              if (state.contactFilled) {
                // Already have contact details, submit
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
    // Build steps list based on current path
    const steps = ['landing'];
    if (state.firstPath === 'room') {
      steps.push('room-type', 'room-age', 'room-size', 'room-equipment', 'contact', 'confirmation');
    } else if (state.firstPath === 'designer') {
      // Designer-first: designer → room path → contact → calendar → confirmation
      steps.push('designer-select', 'room-type', 'room-age', 'room-size', 'room-equipment', 'contact', 'designer-calendar', 'confirmation');
    } else {
      steps.push('room-type', 'room-age', 'room-size', 'room-equipment',
                  'designer-select', 'designer-calendar', 'contact', 'confirmation');
    }
    return steps;
  }

  // ── Global Event Binding ─────────────────────────────────

  function bindGlobalEvents() {
    // Back buttons
    document.querySelectorAll('[data-action="back"]').forEach(btn => {
      btn.addEventListener('click', goBack);
    });

    // Equipment continue button
    const equipNext = document.querySelector('[data-action="equipment-next"]');
    if (equipNext) {
      equipNext.addEventListener('click', () => {
        // After equipment, go to contact details
        navigateTo('contact');
      });
    }

    // Contact form
    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateContactForm()) {
          collectContactData();
          state.contactFilled = true;

          // If designer-first path, go to calendar after contact
          if (state.firstPath === 'designer' && state.designer && !state.appointmentSlot) {
            navigateTo('designer-calendar');
          } else if (state.firstPath === 'room' && !state.completedPaths.has('room')) {
            // Room-first path: submit room data
            state.completedPaths.add('room');
            submitAndConfirm();
          } else {
            // Fallback: submit whatever we have
            const currentPath = getCurrentPath();
            if (currentPath) state.completedPaths.add(currentPath);
            submitAndConfirm();
          }
        }
      });
    }
  }

  function getCurrentPath() {
    // Determine which path we are on based on history
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
    ];

    fields.forEach(field => {
      const input = document.getElementById(field.id);
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
    };
  }

  // Pre-fill contact form if data exists
  function prefillContactForm() {
    if (state.contactFilled) {
      document.getElementById('contactName').value = state.contact.name;
      document.getElementById('contactEmail').value = state.contact.email;
      document.getElementById('contactPhone').value = state.contact.phone;
      document.getElementById('contactPostcode').value = state.contact.postcode;
      document.getElementById('contactPremises').value = state.contact.premises;
    }
  }

  // Populate contact page options (Choose Designer / Book a call)
  function populateContactOptions() {
    const container = document.getElementById('contactOptions');
    if (!container) return;

    let html = '';
    // Only show options on room-first path when designer not yet chosen
    if (state.firstPath === 'room' && !state.completedPaths.has('designer') && !state.designer) {
      html += `
        <button class="btn btn-outline" id="contactChooseDesigner">Choose Your Designer</button>
        <span class="contact-options-divider">or</span>
        <button class="btn btn-secondary" id="contactBookCall">Book a Phone / Video Call</button>
        <span class="contact-options-divider">or just submit your details below</span>
      `;
    }
    container.innerHTML = html;

    // Bind buttons
    const chooseDesigner = document.getElementById('contactChooseDesigner');
    if (chooseDesigner) {
      chooseDesigner.addEventListener('click', () => {
        // Collect contact data first if form is filled
        if (validateContactForm()) {
          collectContactData();
          state.contactFilled = true;
          state.completedPaths.add('room');
        }
        navigateTo('designer-select');
      });
    }

    const bookCall = document.getElementById('contactBookCall');
    if (bookCall) {
      bookCall.addEventListener('click', () => {
        // Collect contact data first if form is filled
        if (validateContactForm()) {
          collectContactData();
          state.contactFilled = true;
          state.completedPaths.add('room');
        }
        navigateTo('designer-calendar');
      });
    }
  }

  // ── Submit & Confirm ─────────────────────────────────────

  function submitAndConfirm() {
    const data = buildSubmissionData();
    showLoading(true);

    sendEmail(data)
      .then(() => {
        showLoading(false);
        showConfirmation();
      })
      .catch((err) => {
        showLoading(false);
        console.error('Submission error:', err);
        // Still show confirmation - data might have sent
        // In production, show an error message
        showConfirmation();
      });
  }

  function buildSubmissionData() {
    const data = {};
    const currentPath = getCurrentPath();

    // Contact
    data['Name'] = state.contact.name;
    data['Email'] = state.contact.email;
    data['Phone'] = state.contact.phone;
    if (state.contact.postcode) data['Postcode'] = state.contact.postcode;
    if (state.contact.premises) data['Premises'] = state.contact.premises;

    // Room selections
    if (state.roomType) data['Room Type'] = state.roomType.title;
    if (state.ageGroup) data['Age Group'] = state.ageGroup.title;
    if (state.roomSize) data['Room Size'] = state.roomSize.title;
    if (state.equipment.length > 0) {
      data['Equipment'] = state.equipment.map(e => e.title).join(', ');
    }

    // Designer selections
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

    // Build summary
    const summaryEl = document.getElementById('confirmationSummary');
    let summaryHtml = '<h3>Your Selections</h3>';

    if (state.contact.name) {
      summaryHtml += summaryRow('Name', state.contact.name);
    }
    if (state.contact.email) {
      summaryHtml += summaryRow('Email', state.contact.email);
    }
    if (state.contact.phone) {
      summaryHtml += summaryRow('Phone', state.contact.phone);
    }
    if (state.contact.postcode) {
      summaryHtml += summaryRow('Postcode', state.contact.postcode);
    }
    if (state.contact.premises) {
      summaryHtml += summaryRow('Premises', state.contact.premises);
    }
    if (state.roomType) {
      summaryHtml += summaryRow('Room Type', state.roomType.title);
    }
    if (state.ageGroup) {
      summaryHtml += summaryRow('Age Group', state.ageGroup.title);
    }
    if (state.roomSize) {
      summaryHtml += summaryRow('Room Size', state.roomSize.title);
    }
    if (state.equipment.length > 0) {
      summaryHtml += summaryRow('Equipment', state.equipment.map(e => e.title).join(', '));
    }
    if (state.designer) {
      summaryHtml += summaryRow('Designer', state.designer.name);
    }
    if (state.appointmentSlot) {
      summaryHtml += summaryRow('Appointment', state.appointmentSlot.label);
    }

    summaryEl.innerHTML = summaryHtml;

    // Build action buttons
    const actionsEl = document.getElementById('confirmationActions');
    let actionsHtml = '';

    // Offer the other path if not completed
    if (!state.completedPaths.has('designer') && currentPath === 'room') {
      actionsHtml += `<button class="btn btn-primary" id="continueToDesigner">Choose Your Designer</button>`;
    }
    if (!state.completedPaths.has('room') && currentPath === 'designer') {
      actionsHtml += `<button class="btn btn-primary" id="continueToRoom">Choose Your Room Type</button>`;
    }

    // Design Book link
    actionsHtml += `<a href="${CONFIG.designBookUrl}" target="_blank" class="btn btn-outline">View Our Design Book</a>`;

    // Design Process link
    actionsHtml += `<a href="${CONFIG.designProcessUrl}" target="_blank" class="btn btn-accent">Learn About Our Design Process</a>`;

    actionsEl.innerHTML = actionsHtml;

    // Bind continue buttons
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

    // Navigate to confirmation
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
  // Use a MutationObserver to detect when the contact step becomes active.
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

    // Observe contact step visibility
    const contactStep = document.querySelector('.step[data-step="contact"]');
    if (contactStep) {
      observer.observe(contactStep, { attributes: true, attributeFilter: ['class'] });
    }
  });

})();
