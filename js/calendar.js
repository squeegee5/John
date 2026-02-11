/**
 * ============================================================
 * CALENDAR BOOKING COMPONENT
 * ============================================================
 * Renders a week-view calendar with selectable time slots.
 * Schedule rules are read from CONFIG.calendar.
 * ============================================================
 */

class CalendarBooking {
  constructor(containerEl, onSelect) {
    this.container = containerEl;
    this.onSelect = onSelect;       // callback(slotData | null)
    this.weekOffset = 0;            // 0 = current/first available week
    this.selectedSlot = null;
    this.config = CONFIG.calendar;
    this.render();
  }

  /**
   * Get the next N working days starting from minDaysAhead,
   * offset by pageOffset pages of daysToShow.
   */
  getVisibleDays() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysToShow = this.config.daysToShow || 3;
    const minAhead = this.config.minDaysAhead || 2;
    const scheduleDays = Object.keys(this.config.schedule).map(Number);

    // Collect all working days starting from minDaysAhead
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + minAhead);

    // Gather enough working days for all pages
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

    // Return the page slice
    const startIdx = this.weekOffset * daysToShow;
    return workingDays.slice(startIdx, startIdx + daysToShow);
  }

  /**
   * Total pages available.
   */
  getTotalPages() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysToShow = this.config.daysToShow || 3;
    const minAhead = this.config.minDaysAhead || 2;
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
   */
  getSlotsForDay(date) {
    const dayOfWeek = date.getDay();
    const schedule = this.config.schedule[dayOfWeek];
    if (!schedule) return [];

    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + this.config.minDaysAhead);
    minDate.setHours(0, 0, 0, 0);

    const isPast = date < minDate;
    const isToday = date.toDateString() === today.toDateString();

    const slots = [];
    for (let hour = schedule.start; hour < schedule.end; hour++) {
      const isBlocked = this.config.blockedHours.includes(hour);
      let isUnavailable = isPast || isBlocked;

      // If it's today (and minDaysAhead is 0), block past hours
      if (isToday && !isPast) {
        if (hour <= today.getHours()) {
          isUnavailable = true;
        }
      }

      slots.push({
        hour,
        label: `${this.formatHour(hour)} \u2013 ${this.formatHour(hour + 1)}`,
        date: new Date(date),
        unavailable: isUnavailable,
        blocked: isBlocked,
      });
    }
    return slots;
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

  /**
   * Check if we can go to the previous page.
   */
  canGoPrev() {
    return this.weekOffset > 0;
  }

  /**
   * Check if we can go to the next page.
   */
  canGoNext() {
    return this.weekOffset < this.getTotalPages() - 1;
  }

  /**
   * Render the entire calendar.
   */
  render() {
    const days = this.getVisibleDays();
    if (days.length === 0) return;
    const firstDay = days[0];
    const lastDay = days[days.length - 1];

    // Build header
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

    // Each day is a column container with header + slots together
    // This ensures correct stacking on mobile
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
            this.selectedSlot.hour === slot.hour;
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
    this.bindEvents();
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
    // Navigation
    const prevBtn = this.container.querySelector('#calPrev');
    const nextBtn = this.container.querySelector('#calNext');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.canGoPrev()) {
          this.weekOffset--;
          this.render();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.canGoNext()) {
          this.weekOffset++;
          this.render();
        }
      });
    }

    // Slot selection
    const slots = this.container.querySelectorAll('.calendar-slot:not(.unavailable)');
    slots.forEach(slotEl => {
      slotEl.addEventListener('click', () => {
        const date = new Date(slotEl.dataset.date);
        const hour = parseInt(slotEl.dataset.hour);

        this.selectedSlot = { date, hour };
        this.render(); // Re-render to show selection

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

  /**
   * Get the currently selected slot data.
   */
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

  /**
   * Clear selection.
   */
  clearSelection() {
    this.selectedSlot = null;
    this.render();
  }
}
