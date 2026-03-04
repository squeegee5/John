/**
 * ============================================================
 * CALENDAR BOOKING COMPONENT
 * ============================================================
 * Renders a day-view calendar with selectable time slots.
 * Schedule rules are read from CONFIG.calendar.
 *
 * Rules:
 *  - 24hr notice required. If current time is afternoon (>=12),
 *    earliest booking is day after tomorrow.
 *  - Only 4-5 slots shown per day (pseudo-random, seeded by date)
 *  - No bookings Monday 1-3pm
 *  - Special time request option with 15-min increments
 * ============================================================
 */

class CalendarBooking {
  constructor(containerEl, onSelect) {
    this.container = containerEl;
    this.onSelect = onSelect;
    this.weekOffset = 0;
    this.selectedSlot = null;
    this.config = CONFIG.calendar;
    this.showSpecialRequest = false;
    this.render();
  }

  /**
   * Minimum days ahead for calendar display.
   * Always start from tomorrow; individual slots are filtered
   * by the 28-hour minimum notice rule in getSlotsForDay().
   */
  getMinDaysAhead() {
    return 1;
  }

  /**
   * Returns the earliest allowed booking time (28 hours from now).
   */
  getEarliestBookingTime() {
    const now = new Date();
    return new Date(now.getTime() + 28 * 60 * 60 * 1000);
  }

  /**
   * Pseudo-random number seeded by date string.
   * Returns a value between 0 and 1.
   */
  seededRandom(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
    }
    h = Math.abs(h);
    return (h % 10000) / 10000;
  }

  /**
   * Get visible working days for the current page.
   */
  getVisibleDays() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysToShow = this.config.daysToShow || 3;
    const minAhead = this.getMinDaysAhead();
    const scheduleDays = Object.keys(this.config.schedule).map(Number);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + minAhead);

    const totalNeeded = (this.weekOffset + 1) * daysToShow;
    const workingDays = [];
    const maxLookahead = this.config.weeksAhead * 7 + 14;
    let d = new Date(startDate);
    for (let i = 0; i < maxLookahead && workingDays.length < totalNeeded; i++) {
      if (scheduleDays.includes(d.getDay())) {
        workingDays.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }

    const startIdx = this.weekOffset * daysToShow;
    return workingDays.slice(startIdx, startIdx + daysToShow);
  }

  getTotalPages() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysToShow = this.config.daysToShow || 3;
    const minAhead = this.getMinDaysAhead();
    const scheduleDays = Object.keys(this.config.schedule).map(Number);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + minAhead);

    const maxLookahead = this.config.weeksAhead * 7 + 14;
    let count = 0;
    let d = new Date(startDate);
    for (let i = 0; i < maxLookahead; i++) {
      if (scheduleDays.includes(d.getDay())) count++;
      d.setDate(d.getDate() + 1);
    }
    return Math.ceil(count / daysToShow);
  }

  /**
   * Get available slots for a given date.
   * Applies: blocked hours, Monday 1-3pm block, random slot hiding.
   */
  getSlotsForDay(date) {
    const dayOfWeek = date.getDay();
    const schedule = this.config.schedule[dayOfWeek];
    if (!schedule) return [];

    const earliest = this.getEarliestBookingTime(); // 28 hours from now
    const isMonday = dayOfWeek === 1;
    const mondayBlocked = this.config.mondayBlockedHours || [];

    // Build all possible slots
    const allSlots = [];
    for (let hour = schedule.start; hour < schedule.end; hour++) {
      const isBlocked = this.config.blockedHours.includes(hour);
      const isMondayBlocked = isMonday && mondayBlocked.includes(hour);

      // Check 28-hour minimum: slot start time must be >= earliest
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      const tooSoon = slotStart < earliest;

      let isUnavailable = tooSoon || isBlocked || isMondayBlocked;

      allSlots.push({
        hour,
        label: `${this.formatHour(hour)} \u2013 ${this.formatHour(hour + 1)}`,
        date: new Date(date),
        unavailable: isUnavailable,
        blocked: isBlocked || isMondayBlocked,
      });
    }

    // Filter to only available slots, then randomly select 4-5
    const available = allSlots.filter(s => !s.unavailable);
    const slotsToShow = this.config.slotsToShow || 5;

    if (available.length > slotsToShow) {
      // Use date as seed so the same slots appear on refresh
      const seed = date.toISOString().slice(0, 10);
      const shuffled = available.slice();
      // Fisher-Yates with seeded random
      for (let i = shuffled.length - 1; i > 0; i--) {
        const r = this.seededRandom(seed + i);
        const j = Math.floor(r * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const shown = shuffled.slice(0, slotsToShow);
      // Sort by hour for display
      shown.sort((a, b) => a.hour - b.hour);
      return shown;
    }

    return available;
  }

  formatHour(h) {
    if (h === 0 || h === 24) return '12:00';
    if (h < 12) return `${h}:00`;
    if (h === 12) return '12:00';
    return `${h - 12}:00`;
  }

  formatHour24(h) {
    return `${String(h).padStart(2, '0')}:00`;
  }

  formatTime15(h, m) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  formatDate(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  }

  formatDateLong(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  getDayLabel(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  canGoPrev() { return this.weekOffset > 0; }
  canGoNext() { return this.weekOffset < this.getTotalPages() - 1; }

  render() {
    const days = this.getVisibleDays();
    if (days.length === 0) return;
    const firstDay = days[0];
    const lastDay = days[days.length - 1];
    const monthLabel = this.getMonthLabel(firstDay, lastDay);

    let html = `
      <div class="calendar-header">
        <button class="calendar-nav-btn" id="calPrev" ${!this.canGoPrev() ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 3L5 8l5 5"/>
          </svg>
        </button>
        <h3>${monthLabel}</h3>
        <button class="calendar-nav-btn" id="calNext" ${!this.canGoNext() ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 3l5 5-5 5"/>
          </svg>
        </button>
      </div>
      <div class="calendar-grid">
    `;

    for (const day of days) {
      const slots = this.getSlotsForDay(day);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

      html += `<div class="calendar-day">`;
      html += `
        <div class="calendar-day-header">
          ${this.getDayLabel(day)}
          <span class="day-date">${day.getDate()} ${months[day.getMonth()]}</span>
        </div>
      `;
      html += `<div class="calendar-day-slots">`;
      if (slots.length === 0) {
        html += `<div class="calendar-slot unavailable">No slots</div>`;
      } else {
        for (const slot of slots) {
          const isSelected = this.selectedSlot &&
            this.selectedSlot.date.toDateString() === slot.date.toDateString() &&
            this.selectedSlot.hour === slot.hour &&
            !this.selectedSlot.isSpecial;
          const classes = ['calendar-slot'];
          if (slot.unavailable) classes.push('unavailable');
          if (isSelected) classes.push('selected');
          html += `
            <div class="${classes.join(' ')}"
                 data-date="${slot.date.toISOString()}"
                 data-hour="${slot.hour}">
              ${slot.label}
            </div>
          `;
        }
      }
      html += `</div>`;
      html += `</div>`;
    }

    html += `</div>`;
    this.container.innerHTML = html;

    // Special time request section (rendered outside the calendar container)
    this.renderSpecialRequest();
    this.bindEvents();
  }

  renderSpecialRequest() {
    let reqEl = this.container.parentElement.querySelector('.special-request-section');
    if (!reqEl) {
      reqEl = document.createElement('div');
      reqEl.className = 'special-request-section';
      // Insert after the calendar container
      this.container.parentElement.insertBefore(reqEl, this.container.nextSibling);
    }

    if (this.showSpecialRequest) {
      // Build date options from visible working days (all future days)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const minAhead = this.getMinDaysAhead();
      const scheduleDays = Object.keys(this.config.schedule).map(Number);
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + minAhead);
      const datOpts = [];
      let d = new Date(startDate);
      for (let i = 0; i < 28; i++) {
        if (scheduleDays.includes(d.getDay())) {
          datOpts.push(new Date(d));
        }
        d.setDate(d.getDate() + 1);
      }

      let dateOptionsHtml = datOpts.map(dt => {
        return `<option value="${dt.toISOString()}">${this.formatDateLong(dt)}</option>`;
      }).join('');

      // Time options in 15-min increments (9:00 to 15:45)
      let timeOptionsHtml = '';
      for (let h = 9; h < 16; h++) {
        for (let m = 0; m < 60; m += 15) {
          if (h === 15 && m > 0) break; // stop at 15:00 (3pm)
          const label = this.formatTime15(h, m);
          timeOptionsHtml += `<option value="${h}:${m}">${label}</option>`;
        }
      }

      reqEl.innerHTML = `
        <div class="special-request-form">
          <h4>Request a Specific Time</h4>
          <p class="special-hint">If none of the available slots work for you, request a specific date and time below.</p>
          <div class="special-fields">
            <div class="special-field">
              <label>Date</label>
              <select id="specialDate">${dateOptionsHtml}</select>
            </div>
            <div class="special-field">
              <label>Time</label>
              <select id="specialTime">${timeOptionsHtml}</select>
            </div>
          </div>
          <div class="special-field" style="margin-top:var(--space-sm);">
            <label>Additional Info (optional)</label>
            <input type="text" id="specialInfo" placeholder="e.g. I'm only free until 3pm...">
          </div>
          <div class="special-actions">
            <button class="btn btn-back btn-sm" id="specialCancel">Cancel</button>
            <button class="btn btn-primary btn-sm" id="specialSubmit">Request This Time</button>
          </div>
        </div>
      `;
    } else {
      reqEl.innerHTML = `
        <button class="btn btn-outline special-request-btn" id="specialRequestToggle">
          Request a Specific Time
        </button>
      `;
    }

    // Bind special request events
    const toggleBtn = reqEl.querySelector('#specialRequestToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.showSpecialRequest = true;
        this.renderSpecialRequest();
      });
    }

    const cancelBtn = reqEl.querySelector('#specialCancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.showSpecialRequest = false;
        this.renderSpecialRequest();
      });
    }

    const submitBtn = reqEl.querySelector('#specialSubmit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const dateEl = reqEl.querySelector('#specialDate');
        const timeEl = reqEl.querySelector('#specialTime');
        const infoEl = reqEl.querySelector('#specialInfo');
        const date = new Date(dateEl.value);
        const [hour, minute] = timeEl.value.split(':').map(Number);
        const endMin = minute + 30;
        const endHour = hour + Math.floor(endMin / 60);
        const endMinute = endMin % 60;

        const timeLabel = `${this.formatTime15(hour, minute)} - ${this.formatTime15(endHour, endMinute)}`;
        const info = infoEl ? infoEl.value.trim() : '';

        this.selectedSlot = { date, hour, minute, isSpecial: true };
        this.showSpecialRequest = false;
        this.render();

        if (this.onSelect) {
          this.onSelect({
            date,
            hour,
            minute,
            isSpecial: true,
            specialInfo: info,
            dateFormatted: this.formatDateLong(date),
            timeFormatted: timeLabel,
            label: `${this.formatDateLong(date)}, ${timeLabel} (Special Request)`,
          });
        }
      });
    }
  }

  getMonthLabel(first, last) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    if (first.getMonth() === last.getMonth()) {
      return `${months[first.getMonth()]} ${first.getFullYear()}`;
    }
    return `${months[first.getMonth()]} \u2013 ${months[last.getMonth()]} ${first.getFullYear()}`;
  }

  bindEvents() {
    const prevBtn = this.container.querySelector('#calPrev');
    const nextBtn = this.container.querySelector('#calNext');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.canGoPrev()) { this.weekOffset--; this.render(); }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.canGoNext()) { this.weekOffset++; this.render(); }
      });
    }

    const slots = this.container.querySelectorAll('.calendar-slot:not(.unavailable)');
    slots.forEach(slotEl => {
      slotEl.addEventListener('click', () => {
        const date = new Date(slotEl.dataset.date);
        const hour = parseInt(slotEl.dataset.hour);

        this.selectedSlot = { date, hour };
        this.render();

        if (this.onSelect) {
          this.onSelect({
            date,
            hour,
            dateFormatted: this.formatDateLong(date),
            timeFormatted: `${this.formatHour24(hour)} - ${this.formatHour24(hour + 1)}`,
            label: `${this.formatDateLong(date)}, ${this.formatHour24(hour)} - ${this.formatHour24(hour + 1)}`,
          });
        }
      });
    });
  }

  getSelection() {
    if (!this.selectedSlot) return null;
    return {
      date: this.selectedSlot.date,
      hour: this.selectedSlot.hour,
      dateFormatted: this.formatDateLong(this.selectedSlot.date),
      timeFormatted: `${this.formatHour24(this.selectedSlot.hour)} - ${this.formatHour24(this.selectedSlot.hour + 1)}`,
      label: `${this.formatDateLong(this.selectedSlot.date)}, ${this.formatHour24(this.selectedSlot.hour)} - ${this.formatHour24(this.selectedSlot.hour + 1)}`,
    };
  }

  clearSelection() {
    this.selectedSlot = null;
    this.render();
  }
}
