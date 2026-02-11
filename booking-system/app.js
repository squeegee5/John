/* ============================================================
   SOUTHPAW BOOKING SYSTEM — APPLICATION
   ============================================================ */

(function () {
  "use strict";

  /* ── State ──────────────────────────────────────────────── */
  const state = {
    // Path tracking
    path: null,            // 'room' | 'designer'
    completedPaths: [],    // ['room', 'designer']
    history: [],           // step history for back navigation

    // Room selections
    roomType: null,
    ageRange: null,
    roomSize: null,
    equipment: [],

    // Designer selections
    designer: null,
    appointmentDate: null,
    appointmentTime: null,

    // Contact
    contactFilled: false,
    contact: {
      name: "",
      email: "",
      phone: "",
      postcode: "",
      premises: "",
      notes: "",
    },

    // Calendar state
    calendarMonth: null,
    calendarYear: null,
  };

  /* ── DOM refs ───────────────────────────────────────────── */
  const $wizard = document.getElementById("wizard");
  const $progressFill = document.getElementById("progressFill");
  const $progressText = document.getElementById("progressText");

  /* ── Step definitions with progress weights ─────────────── */
  const ROOM_STEPS = ["room-type", "age", "size", "equipment", "contact", "room-complete"];
  const DESIGNER_STEPS = ["designer", "calendar", "contact", "designer-complete"];

  /* ── Initialise ─────────────────────────────────────────── */
  function init() {
    renderRoomTypes();
    renderAgeRanges();
    renderRoomSizes();
    renderEquipment();
    renderDesigners();
    setExternalLinks();
    bindGlobalEvents();
    showStep("welcome");
  }

  /* ── External Links ─────────────────────────────────────── */
  function setExternalLinks() {
    const bookLinks = [
      "linkDesignBookRoom", "linkDesignBookDesigner", "linkDesignBookFinal"
    ];
    const processLinks = [
      "linkDesignProcessRoom", "linkDesignProcessDesigner", "linkDesignProcessFinal"
    ];
    bookLinks.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.href = CONFIG.links.designBook;
    });
    processLinks.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.href = CONFIG.links.designProcess;
    });
  }

  /* ── Step Navigation ────────────────────────────────────── */
  function showStep(stepId) {
    // Hide all steps
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));

    // Show target
    const target = document.getElementById("step-" + stepId);
    if (target) {
      target.classList.add("active");
      // Re-trigger animation
      target.style.animation = "none";
      target.offsetHeight; // force reflow
      target.style.animation = "";
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Update progress
    updateProgress(stepId);

    // Special handling for certain steps
    if (stepId === "calendar") {
      initCalendar();
    }
    if (stepId === "contact") {
      prefillContact();
    }
    if (stepId === "designer-complete") {
      updateDesignerCompleteScreen();
    }
    if (stepId === "room-complete") {
      // If designer already done, skip "choose designer" button
      if (state.completedPaths.includes("designer")) {
        // Both done — go to final
        showStep("done");
        return;
      }
    }
    if (stepId === "designer-complete") {
      const gotoRoomBtn = document.getElementById("gotoRoomBtn");
      if (gotoRoomBtn) {
        gotoRoomBtn.style.display = state.completedPaths.includes("room") ? "none" : "inline-flex";
      }
      if (state.completedPaths.includes("room")) {
        // Both done — go to final
        showStep("done");
        return;
      }
    }
  }

  function navigateTo(stepId) {
    const currentStep = getCurrentStep();
    if (currentStep) state.history.push(currentStep);
    showStep(stepId);
  }

  function goBack() {
    if (state.history.length > 0) {
      const prev = state.history.pop();
      showStep(prev);
    }
  }

  function getCurrentStep() {
    const active = document.querySelector(".step.active");
    return active ? active.dataset.step : null;
  }

  /* ── Progress Bar ───────────────────────────────────────── */
  function updateProgress(stepId) {
    let percent = 0;
    let label = "";

    if (stepId === "welcome") {
      percent = 0;
      label = "";
    } else if (state.path === "room" || ROOM_STEPS.includes(stepId)) {
      const idx = ROOM_STEPS.indexOf(stepId);
      if (idx >= 0) {
        const base = state.completedPaths.includes("designer") ? 50 : 0;
        const range = state.completedPaths.includes("designer") ? 50 : 50;
        percent = base + ((idx + 1) / ROOM_STEPS.length) * range;
      }
      label = `Step ${idx + 1} of ${ROOM_STEPS.length}`;
    } else if (state.path === "designer" || DESIGNER_STEPS.includes(stepId)) {
      const idx = DESIGNER_STEPS.indexOf(stepId);
      if (idx >= 0) {
        const base = state.completedPaths.includes("room") ? 50 : 0;
        const range = state.completedPaths.includes("room") ? 50 : 50;
        percent = base + ((idx + 1) / DESIGNER_STEPS.length) * range;
      }
      label = `Step ${idx + 1} of ${DESIGNER_STEPS.length}`;
    }

    if (stepId === "done") {
      percent = 100;
      label = "Complete";
    }

    $progressFill.style.width = Math.min(percent, 100) + "%";
    $progressText.textContent = label;
  }

  /* ── Render Functions ───────────────────────────────────── */

  function createImageContent(item) {
    const img = new Image();
    img.src = item.image;
    img.alt = item.title;

    // Create placeholder
    const placeholder = document.createElement("div");
    placeholder.className = "choice-card__placeholder";
    placeholder.style.background = item.placeholderColor;
    placeholder.innerHTML = `<span class="choice-card__icon">${item.placeholderIcon}</span>`;

    // Try loading the image
    const wrapper = document.createElement("div");
    wrapper.appendChild(placeholder);

    img.onload = function () {
      placeholder.replaceWith(img);
    };
    // If image fails, placeholder stays

    return wrapper;
  }

  function renderRoomTypes() {
    const grid = document.getElementById("roomTypeGrid");
    CONFIG.roomTypes.forEach(rt => {
      const card = document.createElement("button");
      card.className = "choice-card";
      card.dataset.id = rt.id;
      card.dataset.action = "select-room-type";
      card.innerHTML = `
        <div class="choice-card__image-wrap">
          <div class="choice-card__placeholder" style="background:${rt.placeholderColor}">
            <span class="choice-card__icon">${rt.placeholderIcon}</span>
          </div>
        </div>
        <div class="choice-card__body">
          <div class="choice-card__subtitle">${rt.subtitle}</div>
          <h3 class="choice-card__title">${rt.title}</h3>
        </div>
      `;
      tryLoadImage(card, rt.image, rt.title);
      grid.appendChild(card);
    });
  }

  function renderAgeRanges() {
    const grid = document.getElementById("ageGrid");
    CONFIG.ageRanges.forEach(ar => {
      const card = document.createElement("button");
      card.className = "choice-card";
      card.dataset.id = ar.id;
      card.dataset.action = "select-age";
      card.innerHTML = `
        <div class="choice-card__image-wrap">
          <div class="choice-card__placeholder" style="background:${ar.placeholderColor}">
            <span class="choice-card__icon">${ar.placeholderIcon}</span>
          </div>
        </div>
        <div class="choice-card__body">
          <div class="choice-card__subtitle">${ar.subtitle}</div>
          <h3 class="choice-card__title">${ar.title}</h3>
        </div>
      `;
      tryLoadImage(card, ar.image, ar.title);
      grid.appendChild(card);
    });
  }

  function renderRoomSizes() {
    const grid = document.getElementById("sizeGrid");
    CONFIG.roomSizes.forEach(rs => {
      const card = document.createElement("button");
      card.className = "choice-card";
      card.dataset.id = rs.id;
      card.dataset.action = "select-size";
      card.innerHTML = `
        <div class="choice-card__image-wrap">
          <div class="choice-card__placeholder" style="background:${rs.placeholderColor}">
            <span class="choice-card__icon">${rs.placeholderIcon}</span>
          </div>
        </div>
        <div class="choice-card__body">
          <div class="choice-card__subtitle">${rs.subtitle}</div>
          <h3 class="choice-card__title">${rs.title}</h3>
        </div>
      `;
      tryLoadImage(card, rs.image, rs.title);
      grid.appendChild(card);
    });
  }

  function renderEquipment() {
    const grid = document.getElementById("equipmentGrid");
    CONFIG.equipment.forEach(eq => {
      const card = document.createElement("button");
      card.className = "equipment-card";
      card.dataset.id = eq.id;
      card.dataset.action = "toggle-equipment";
      card.innerHTML = `
        <div class="equipment-card__image-wrap">
          <div class="choice-card__placeholder" style="background:${eq.placeholderColor}">
            <span class="choice-card__icon">${eq.placeholderIcon}</span>
          </div>
        </div>
        <div class="equipment-card__title">${eq.title}</div>
      `;
      tryLoadImage(card, eq.image, eq.title);
      grid.appendChild(card);
    });
  }

  function renderDesigners() {
    const grid = document.getElementById("designerGrid");
    CONFIG.designers.forEach(d => {
      const card = document.createElement("button");
      card.className = "designer-card";
      card.dataset.id = d.id;
      card.dataset.action = "select-designer";
      card.innerHTML = `
        <div class="designer-card__image-wrap">
          <div class="choice-card__placeholder" style="background:${d.placeholderColor}">
            <span class="choice-card__icon">${d.placeholderIcon}</span>
          </div>
        </div>
        <div class="designer-card__body">
          <h3 class="designer-card__name">${d.name}</h3>
          <div class="designer-card__role">${d.role}</div>
          <p class="designer-card__bio">${d.bio}</p>
        </div>
      `;
      tryLoadImage(card, d.image, d.name);
      grid.appendChild(card);
    });
  }

  function tryLoadImage(card, src, alt) {
    const img = new Image();
    img.src = src;
    img.alt = alt;
    img.loading = "lazy";
    img.onload = function () {
      const placeholder = card.querySelector(".choice-card__placeholder");
      if (placeholder) {
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        placeholder.replaceWith(img);
      }
    };
  }

  /* ── Event Handling ─────────────────────────────────────── */
  function bindGlobalEvents() {
    // Delegate click events
    $wizard.addEventListener("click", handleWizardClick);

    // Contact form
    document.getElementById("contactForm").addEventListener("submit", handleContactSubmit);
  }

  function handleWizardClick(e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;

    switch (action) {
      case "start-room":
        state.path = "room";
        navigateTo("room-type");
        break;

      case "start-designer":
        state.path = "designer";
        navigateTo("designer");
        break;

      case "back":
        goBack();
        break;

      case "select-room-type":
        state.roomType = btn.dataset.id;
        markSelected(btn);
        setTimeout(() => navigateTo("age"), 300);
        break;

      case "select-age":
        state.ageRange = btn.dataset.id;
        markSelected(btn);
        setTimeout(() => navigateTo("size"), 300);
        break;

      case "select-size":
        state.roomSize = btn.dataset.id;
        markSelected(btn);
        setTimeout(() => navigateTo("equipment"), 300);
        break;

      case "toggle-equipment":
        toggleEquipment(btn);
        break;

      case "equipment-next":
        if (state.contactFilled) {
          // Already have contact info — skip form, send and complete
          sendEmail("room");
          state.completedPaths.push("room");
          navigateTo("room-complete");
        } else {
          navigateTo("contact");
        }
        break;

      case "goto-designer":
        state.path = "designer";
        navigateTo("designer");
        break;

      case "goto-room":
        state.path = "room";
        navigateTo("room-type");
        break;

      case "select-designer":
        state.designer = btn.dataset.id;
        markDesignerSelected(btn);
        setTimeout(() => navigateTo("calendar"), 300);
        break;

      case "confirm-booking":
        handleBookingConfirm();
        break;

      case "start-over":
        location.reload();
        break;
    }
  }

  function markSelected(card) {
    const siblings = card.parentElement.querySelectorAll(".choice-card");
    siblings.forEach(s => s.classList.remove("selected"));
    card.classList.add("selected");
  }

  function markDesignerSelected(card) {
    const siblings = card.parentElement.querySelectorAll(".designer-card");
    siblings.forEach(s => s.classList.remove("selected"));
    card.classList.add("selected");
  }

  function toggleEquipment(card) {
    const id = card.dataset.id;
    card.classList.toggle("selected");
    if (state.equipment.includes(id)) {
      state.equipment = state.equipment.filter(e => e !== id);
    } else {
      state.equipment.push(id);
    }
  }

  /* ── Contact Form ───────────────────────────────────────── */
  function prefillContact() {
    if (state.contactFilled) {
      document.getElementById("contactName").value = state.contact.name;
      document.getElementById("contactEmail").value = state.contact.email;
      document.getElementById("contactPhone").value = state.contact.phone;
      document.getElementById("contactPostcode").value = state.contact.postcode;
      document.getElementById("contactPremises").value = state.contact.premises;
      document.getElementById("contactNotes").value = state.contact.notes;
    }
    // Update submit button text based on context
    const submitText = document.getElementById("contactSubmitText");
    if (submitText) {
      if (state.path === "room") {
        submitText.textContent = "Submit & Continue";
      } else if (state.path === "designer") {
        submitText.textContent = "Submit & Book Appointment";
      }
    }
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    if (!validateContact()) return;

    // Save contact info
    state.contact.name = document.getElementById("contactName").value.trim();
    state.contact.email = document.getElementById("contactEmail").value.trim();
    state.contact.phone = document.getElementById("contactPhone").value.trim();
    state.contact.postcode = document.getElementById("contactPostcode").value.trim();
    state.contact.premises = document.getElementById("contactPremises").value.trim();
    state.contact.notes = document.getElementById("contactNotes").value.trim();
    state.contactFilled = true;

    // Determine what to send
    if (state.path === "room") {
      sendEmail("room");
      state.completedPaths.push("room");
      navigateTo("room-complete");
    } else if (state.path === "designer") {
      sendEmail("designer");
      state.completedPaths.push("designer");
      navigateTo("designer-complete");
    }
  }

  function validateContact() {
    let valid = true;
    const name = document.getElementById("contactName");
    const email = document.getElementById("contactEmail");
    const phone = document.getElementById("contactPhone");

    // Reset
    [name, email, phone].forEach(f => f.classList.remove("error"));
    document.getElementById("errorName").textContent = "";
    document.getElementById("errorEmail").textContent = "";
    document.getElementById("errorPhone").textContent = "";

    if (!name.value.trim()) {
      name.classList.add("error");
      document.getElementById("errorName").textContent = "Please enter your name";
      valid = false;
    }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      email.classList.add("error");
      document.getElementById("errorEmail").textContent = "Please enter a valid email";
      valid = false;
    }
    if (!phone.value.trim()) {
      phone.classList.add("error");
      document.getElementById("errorPhone").textContent = "Please enter your phone number";
      valid = false;
    }

    return valid;
  }

  /* ── Calendar ───────────────────────────────────────────── */
  function initCalendar() {
    const now = new Date();
    // Start from tomorrow at minimum
    if (state.calendarMonth === null) {
      state.calendarMonth = now.getMonth();
      state.calendarYear = now.getFullYear();
    }
    renderCalendar();
  }

  function renderCalendar() {
    const container = document.getElementById("calendarContainer");
    const year = state.calendarYear;
    const month = state.calendarMonth;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Calculate max date
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + CONFIG.calendar.weeksAhead * 7);

    // Can navigate prev?
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const canPrev = new Date(year, month, 1) > today;

    // Can navigate next?
    const canNext = new Date(year, month + 1, 1) <= maxDate;

    let html = `
      <div class="calendar-nav">
        <button class="calendar-nav__btn" ${!canPrev ? "disabled" : ""} onclick="App.calendarPrev()">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="calendar-nav__title">${monthNames[month]} ${year}</div>
        <button class="calendar-nav__btn" ${!canNext ? "disabled" : ""} onclick="App.calendarNext()">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="calendar-grid">
    `;

    // Day headers (Mon–Sun)
    dayNames.forEach(d => {
      html += `<div class="calendar-grid__header">${d}</div>`;
    });

    // First day of month (0=Sun, convert to Mon-based)
    const firstDay = new Date(year, month, 1).getDay();
    const mondayFirst = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty cells before first day
    for (let i = 0; i < mondayFirst; i++) {
      html += `<div class="calendar-day calendar-day--empty"></div>`;
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay(); // 0=Sun
      const isPast = date < today;
      const isBeyondMax = date > maxDate;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isToday = date.getTime() === today.getTime();
      const isSelected = state.appointmentDate &&
        state.appointmentDate.getTime() === date.getTime();
      const disabled = isPast || isBeyondMax || isWeekend;

      let classes = "calendar-day";
      if (disabled) classes += " calendar-day--disabled";
      if (isToday) classes += " calendar-day--today";
      if (isSelected) classes += " calendar-day--selected";

      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      html += `<div class="${classes}" ${!disabled ? `onclick="App.selectDate('${dateStr}')"` : ""}>${day}</div>`;
    }

    html += `</div>`;

    // Time slots (if date selected)
    if (state.appointmentDate) {
      html += renderTimeSlots();
    }

    container.innerHTML = html;
  }

  function renderTimeSlots() {
    if (!state.appointmentDate) return "";

    const dayOfWeek = state.appointmentDate.getDay(); // 0=Sun, 5=Fri
    const isFriday = dayOfWeek === 5;
    const slots = isFriday ? CONFIG.calendar.fridaySlots : CONFIG.calendar.weekdaySlots;

    const dateStr = state.appointmentDate.toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });

    let html = `
      <div class="time-slots">
        <div class="time-slots__title">${dateStr}</div>
        <div class="time-slots__grid">
    `;

    // Add morning slots
    slots.forEach(slot => {
      if (slot.start === 13 && isFriday) return; // Skip afternoon on Friday

      const dateKey = formatDateKey(state.appointmentDate) + "T" + slot.start;
      const isBooked = CONFIG.calendar.bookedSlots.includes(dateKey);
      const isSelected = state.appointmentTime === slot.start;

      let classes = "time-slot";
      if (isSelected) classes += " time-slot--selected";
      if (isBooked) classes += " time-slot--booked";

      html += `<button class="${classes}" ${isBooked ? "disabled" : ""} onclick="App.selectTime(${slot.start})">${slot.label}</button>`;
    });

    html += `</div>`;

    // Confirm button
    if (state.appointmentTime !== null) {
      const btnLabel = state.contactFilled ? "Confirm Booking" : "Continue to Your Details";
      html += `
        <div class="calendar-confirm">
          <button class="btn btn--primary btn--lg" data-action="confirm-booking">
            ${btnLabel}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      `;
    }

    html += `</div>`;
    return html;
  }

  function formatDateKey(date) {
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  }

  function selectDate(dateStr) {
    const parts = dateStr.split("-");
    state.appointmentDate = new Date(
      parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])
    );
    state.appointmentTime = null;
    renderCalendar();
  }

  function selectTime(hour) {
    state.appointmentTime = hour;
    renderCalendar();
  }

  function calendarPrev() {
    if (state.calendarMonth === 0) {
      state.calendarMonth = 11;
      state.calendarYear--;
    } else {
      state.calendarMonth--;
    }
    renderCalendar();
  }

  function calendarNext() {
    if (state.calendarMonth === 11) {
      state.calendarMonth = 0;
      state.calendarYear++;
    } else {
      state.calendarMonth++;
    }
    renderCalendar();
  }

  /* ── Booking Confirm ────────────────────────────────────── */
  function handleBookingConfirm() {
    if (!state.appointmentDate || state.appointmentTime === null) return;

    if (state.contactFilled) {
      // Already have contact info — send and complete
      sendEmail("designer");
      state.completedPaths.push("designer");
      navigateTo("designer-complete");
    } else {
      // Need contact info first — go to contact, then come back
      navigateTo("contact");
    }
  }

  /* ── Designer Complete Screen ───────────────────────────── */
  function updateDesignerCompleteScreen() {
    const msg = document.getElementById("designerCompleteMsg");
    if (msg && state.appointmentDate && state.appointmentTime !== null) {
      const designerObj = CONFIG.designers.find(d => d.id === state.designer);
      const designerName = designerObj ? designerObj.name : "our team";
      const dateStr = state.appointmentDate.toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });
      const slot = [...CONFIG.calendar.weekdaySlots, ...CONFIG.calendar.fridaySlots]
        .find(s => s.start === state.appointmentTime);
      const timeStr = slot ? slot.label : "";

      msg.textContent = `Your consultation with ${designerName} is booked for ${dateStr}, ${timeStr}. We'll be in touch shortly to confirm.`;
    }
  }

  /* ── Email Sending ──────────────────────────────────────── */
  function sendEmail(type) {
    const data = buildEmailData(type);

    // If EmailJS is configured, use it
    if (CONFIG.email.emailjsPublicKey && CONFIG.email.emailjsServiceId) {
      sendViaEmailJS(data);
    } else {
      // Fallback: log and use mailto
      sendViaMailto(data);
    }
  }

  function buildEmailData(type) {
    const data = {
      to: CONFIG.email.recipient,
      from_name: state.contact.name || "Not provided",
      from_email: state.contact.email || "Not provided",
      phone: state.contact.phone || "Not provided",
      postcode: state.contact.postcode || "Not provided",
      premises: state.contact.premises || "Not provided",
      notes: state.contact.notes || "",
    };

    // Room data
    if (state.roomType || state.completedPaths.includes("room")) {
      const roomObj = CONFIG.roomTypes.find(r => r.id === state.roomType);
      const ageObj = CONFIG.ageRanges.find(a => a.id === state.ageRange);
      const sizeObj = CONFIG.roomSizes.find(s => s.id === state.roomSize);
      const equipNames = state.equipment.map(id => {
        const eq = CONFIG.equipment.find(e => e.id === id);
        return eq ? eq.title : id;
      });

      data.room_type = roomObj ? roomObj.title : "Not selected";
      data.age_range = ageObj ? ageObj.title : "Not selected";
      data.room_size = sizeObj ? sizeObj.title : "Not selected";
      data.equipment = equipNames.length > 0 ? equipNames.join(", ") : "None selected";
    }

    // Designer data
    if (state.designer || state.completedPaths.includes("designer")) {
      const designerObj = CONFIG.designers.find(d => d.id === state.designer);
      data.designer = designerObj ? designerObj.name : "Not selected";

      if (state.appointmentDate && state.appointmentTime !== null) {
        data.appointment_date = state.appointmentDate.toLocaleDateString("en-GB", {
          weekday: "long", day: "numeric", month: "long", year: "numeric"
        });
        const slot = [...CONFIG.calendar.weekdaySlots, ...CONFIG.calendar.fridaySlots]
          .find(s => s.start === state.appointmentTime);
        data.appointment_time = slot ? slot.label : "";
      }
    }

    // Build message
    let message = "=== SOUTHPAW DESIGN CONSULTATION BOOKING ===\n\n";
    message += "--- Contact Details ---\n";
    message += `Name: ${data.from_name}\n`;
    message += `Email: ${data.from_email}\n`;
    message += `Phone: ${data.phone}\n`;
    message += `Postcode: ${data.postcode}\n`;
    message += `Premises: ${data.premises}\n`;
    if (data.notes) message += `Notes: ${data.notes}\n`;

    if (data.room_type) {
      message += "\n--- Room Preferences ---\n";
      message += `Room Type: ${data.room_type}\n`;
      message += `Age Range: ${data.age_range}\n`;
      message += `Room Size: ${data.room_size}\n`;
      message += `Equipment: ${data.equipment}\n`;
    }

    if (data.designer) {
      message += "\n--- Designer & Appointment ---\n";
      message += `Designer: ${data.designer}\n`;
      if (data.appointment_date) {
        message += `Date: ${data.appointment_date}\n`;
        message += `Time: ${data.appointment_time}\n`;
      }
    }

    data.message = message;
    return data;
  }

  function sendViaEmailJS(data) {
    try {
      emailjs.init(CONFIG.email.emailjsPublicKey);
      emailjs.send(CONFIG.email.emailjsServiceId, CONFIG.email.emailjsTemplateId, data)
        .then(() => console.log("Email sent successfully"))
        .catch(err => {
          console.error("EmailJS error:", err);
          sendViaMailto(data);
        });
    } catch (err) {
      console.error("EmailJS init error:", err);
      sendViaMailto(data);
    }
  }

  function sendViaMailto(data) {
    // Build a mailto link as fallback
    const subject = encodeURIComponent("Southpaw Design Consultation Booking - " + data.from_name);
    const body = encodeURIComponent(data.message);
    const mailto = `mailto:${data.to}?subject=${subject}&body=${body}`;

    // Also log to console for development
    console.log("=== BOOKING DATA ===");
    console.log(data.message);
    console.log("====================");

    // In production, you'd use a server endpoint instead
    // For now, open mailto as fallback
    // Only open if no EmailJS (don't annoy user)
    if (!CONFIG.email.emailjsPublicKey) {
      // Create a hidden form to submit via Formspree or similar
      // For demo purposes, just log it
      console.log("Configure EmailJS in config.js to send emails automatically.");
      console.log("Mailto link:", mailto);
    }
  }

  /* ── Public API (for calendar onclick handlers) ─────────── */
  window.App = {
    selectDate,
    selectTime,
    calendarPrev,
    calendarNext,
  };

  /* ── Boot ───────────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", init);

})();
