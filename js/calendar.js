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
 *  - Working weekdays can change from a given date (CONFIG scheduleFrom)
 *  - Per-date closures / restricted hours (CONFIG dateOverrides)
 *  - Or: only explicit per-date time windows (CONFIG availabilityWindows)
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
    this.busySlots = []; // [{start: Date, end: Date}, ...]
    this.busyLoaded = false;
    this.loadBusyTimes().then(() => this.render());
  }

  /**
   * Fetch busy times from Google Calendar to prevent double booking.
   */
  loadBusyTimes() {
    const service = CONFIG.bookingService && CONFIG.bookingService.url;
    if (service) {
      // The booking service (Apps Script) reads the calendar for us
      return fetch(`${service}?action=busy&site=${CONFIG.bookingService.site || ''}&days=${this.getMaxLookaheadDays() + 7}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.items) {
            this.busySlots = data.items.map(ev => ({
              start: new Date(ev.start),
              end: new Date(ev.end),
              isBooking: !!ev.isBooking,
            }));
          }
        })
        .catch(err => console.warn('Failed to load busy times:', err))
        .finally(() => { this.busyLoaded = true; });
    }

    const gc = CONFIG.googleCalendar;
    if (!gc.refreshToken) {
      this.busyLoaded = true;
      this.render();
      return Promise.resolve();
    }

    // Get access token
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
    .then(tokenData => {
      if (tokenData.error || !tokenData.access_token) {
        console.warn('Could not get token for busy times:', tokenData.error);
        return;
      }

      // Cover every day the calendar can show, plus a week of headroom,
      // so no bookable day is ever displayed without busy data.
      const now = new Date();
      const timeMin = now.toISOString();
      const end = new Date(now);
      end.setDate(end.getDate() + this.getMaxLookaheadDays() + 7);
      const timeMax = end.toISOString();

      return fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(gc.calendarId)}/events?` +
        `timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
        `&singleEvents=true&orderBy=startTime&maxResults=2500&fields=items(start,end,status,summary)`,
        {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
        }
      )
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          const callTitle = (CONFIG.brand && CONFIG.brand.callTitle) || '';
          this.busySlots = data.items
            .filter(ev => ev.status !== 'cancelled')
            .map(ev => ({
              start: new Date(ev.start.dateTime || ev.start.date),
              end: new Date(ev.end.dateTime || ev.end.date),
              // A consultation booked through this brand's form
              isBooking: !!callTitle && String(ev.summary || '').indexOf(callTitle) === 0,
            }));
        }
      });
    })
    .catch(err => {
      console.warn('Failed to load busy times:', err);
    })
    .finally(() => {
      this.busyLoaded = true;
    });
  }

  /**
   * How many calendar days ahead the booking window reaches. With only a
   * couple of bookable weekdays this needs to span many weeks to offer a
   * useful number of days.
   */
  getMaxLookaheadDays() {
    if (this.usesWindows()) {
      // Reach the last listed date, however far ahead it is
      const keys = Object.keys(this.config.availabilityWindows).sort();
      const [y, m, d] = keys[keys.length - 1].split('-').map(Number);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return Math.max(1, Math.ceil((new Date(y, m - 1, d) - today) / 86400000) + 2);
    }
    return (this.config.weeksAhead || 4) * 7 + 14;
  }

  // ── Date-specific availability windows ──────────────────
  // When config.availabilityWindows is set, ONLY the listed dates and times
  // are bookable; the weekday schedule, blocked hours and prep-day buffer
  // are not used. Existing calendar bookings are still respected.

  usesWindows() {
    const w = this.config.availabilityWindows;
    return !!w && Object.keys(w).length > 0;
  }

  toMinutes(hhmm) {
    const [h, m] = String(hhmm).split(':').map(Number);
    return h * 60 + (m || 0);
  }

  getWindowsForDate(date) {
    const list = (this.config.availabilityWindows || {})[this.dateKey(date)] || [];
    return list.map(([s, e]) => ({ start: this.toMinutes(s), end: this.toMinutes(e) }));
  }

  getSlotMinutes() {
    return this.config.slotDuration || 60;
  }

  // Shortest slot allowed when a full one won't fit (windows mode only)
  getMinSlotMinutes() {
    return Math.min(this.config.minSlotDuration || this.getSlotMinutes(), this.getSlotMinutes());
  }

  isRangeBusy(start, end) {
    return this.busySlots.some(busy => start < busy.end && end > busy.start);
  }

  /**
   * True if a consultation starting at `start` would begin within
   * config.bookingGap minutes of another consultation booked through the
   * form, e.g. with a 60-minute gap a 9:00 booking also rules out 9:30
   * (and 8:30), leaving time for overruns and preparation.
   */
  isTooCloseToBooking(start) {
    const gap = (this.config.bookingGap || 0) * 60000;
    if (!gap) return false;
    return this.busySlots.some(busy => busy.isBooking && Math.abs(busy.start - start) < gap);
  }

  // Fixed-length slots unless a shorter minimum is configured
  hasFixedSlotLength() {
    return !this.config.minSlotDuration || this.config.minSlotDuration >= this.getSlotMinutes();
  }

  /**
   * Length of a slot starting at `startMin` (minutes from midnight) in a
   * window ending at `windowEnd`: the full slot length, cut short by the end
   * of the window or the next existing booking, in 15-minute steps.
   * Returns 0 if that leaves less than the minimum slot length.
   */
  slotLengthAt(date, startMin, windowEnd) {
    const start = new Date(date);
    start.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0);
    let len = Math.min(this.getSlotMinutes(), windowEnd - startMin);
    const fullEnd = new Date(start.getTime() + len * 60000);
    for (const busy of this.busySlots) {
      if (busy.start <= start && busy.end > start) return 0; // already booked
      if (busy.start > start && busy.start < fullEnd) {
        len = Math.min(len, Math.floor((busy.start - start) / 60000));
      }
    }
    len = Math.floor(len / 15) * 15;
    return len >= this.getMinSlotMinutes() ? len : 0;
  }

  /**
   * Every bookable slot on a date in windows mode: one starting every
   * `stepMinutes` from each window's start, as long as the slot length
   * allowed there (see slotLengthAt) and the minimum notice are met.
   */
  getWindowSlots(date, stepMinutes) {
    const step = stepMinutes || this.config.slotInterval || this.getSlotMinutes();
    const earliest = this.getEarliestBookingTime();
    const out = [];
    if (this.hasFixedSlotLength()) {
      // Every slot is the full length, starting on the step grid
      // (e.g. 9:00, 9:30, 10:00 …) and finishing inside its window
      const len = this.getSlotMinutes();
      this.getWindowsForDate(date).forEach(w => {
        for (let t = Math.ceil(w.start / step) * step; t + len <= w.end; t += step) {
          const start = new Date(date);
          start.setHours(Math.floor(t / 60), t % 60, 0, 0);
          const end = new Date(start.getTime() + len * 60000);
          if (start < earliest || this.isRangeBusy(start, end) || this.isTooCloseToBooking(start)) continue;
          out.push({ hour: start.getHours(), minute: start.getMinutes(), duration: len, date: new Date(date) });
        }
      });
      return out;
    }
    this.getWindowsForDate(date).forEach(w => {
      for (let t = w.start; t + this.getMinSlotMinutes() <= w.end; t += step) {
        const start = new Date(date);
        start.setHours(Math.floor(t / 60), t % 60, 0, 0);
        if (start < earliest) continue;
        const duration = this.slotLengthAt(date, t, w.end);
        if (!duration) continue;
        out.push({ hour: start.getHours(), minute: start.getMinutes(), duration, date: new Date(date) });
      }
    });
    return out;
  }

  /**
   * Check if a given hour slot on a date overlaps with any busy time.
   */
  isSlotBusy(date, hour) {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(date);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return this.busySlots.some(busy =>
      slotStart < busy.end && slotEnd > busy.start
    );
  }

  buildSpecialTimeOptions(date) {
    if (!date) return '';
    if (this.usesWindows()) {
      const opts = this.getWindowSlots(date, 15).map(s =>
        `<option value="${s.hour}:${s.minute}:${s.duration}">${this.formatTime15(s.hour, s.minute)}</option>`
      ).join('');
      return opts || '<option value="" disabled>No times available</option>';
    }
    const hours = this.getHoursForDate(date);
    if (!hours || this.isDateClosed(date) || this.isBlockedDate(date) || this.isPostHolidayBuffer(date)) {
      return '<option value="" disabled>No times available</option>';
    }

    const earliest = this.getEarliestBookingTime();

    let html = '';
    for (let h = hours.start; h < hours.end; h++) {
      for (let m = 0; m < 60; m += 15) {
        const slotStart = new Date(date);
        slotStart.setHours(h, m, 0, 0);
        if (slotStart < earliest) continue;
        if (this.isRangeBlocked(date, h, m, hours)) continue;

        const label = this.formatTime15(h, m);
        html += `<option value="${h}:${m}">${label}</option>`;
      }
    }
    if (!html) html = '<option value="" disabled>No times available</option>';
    return html;
  }

  getMinDaysAhead() {
    const today = new Date();
    const dow = today.getDay(); // 0=Sun … 5=Fri 6=Sat
    // Friday bookings → earliest Tuesday (skip Mon for prep)
    if (dow === 5) return 4; // Fri → Tue
    if (dow === 6) return 3; // Sat → Tue
    if (dow === 0) return 2; // Sun → Tue
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
   * Check if a date falls on a blocked date (bank holiday, Christmas, etc).
   */
  isBlockedDate(date) {
    const blockedDates = this.config.blockedDates || [];
    return blockedDates.includes(this.dateKey(date));
  }

  /**
   * YYYY-MM-DD key for a date, in local time.
   */
  dateKey(date) {
    return date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
  }

  /**
   * One-off availability override for a specific date, or null.
   * Returns 'closed' or { start, end }.
   */
  getDateOverride(date) {
    const overrides = this.config.dateOverrides || {};
    return overrides[this.dateKey(date)] || null;
  }

  /**
   * True if this specific date is closed for consultations.
   * Unlike a blocked date, this does not add a prep buffer to the next day.
   */
  isDateClosed(date) {
    return this.getDateOverride(date) === 'closed';
  }

  /**
   * The weekday schedule in effect on a given date. Entries in
   * config.scheduleFrom replace the base schedule from their date onwards.
   */
  getScheduleForDate(date) {
    const key = this.dateKey(date);
    let active = this.config.schedule || {};
    const changes = this.config.scheduleFrom || [];
    for (const change of changes) {
      if (change && change.from && key >= change.from) active = change.schedule || {};
    }
    return active;
  }

  /**
   * True if consultations run on this date's weekday.
   */
  isWorkingDay(date) {
    if (this.usesWindows()) return this.getWindowsForDate(date).length > 0;
    return !!this.getScheduleForDate(date)[date.getDay()];
  }

  /**
   * True if a consultation starting at startHour:startMinute would clash with
   * a blocked window (lunch, the Monday morning block), run past the end of
   * the day's consultation hours, or overlap an existing calendar booking.
   */
  isRangeBlocked(date, startHour, startMinute, hours) {
    const start = new Date(date);
    start.setHours(startHour, startMinute, 0, 0);
    const end = new Date(start.getTime() + (this.config.slotDuration || 60) * 60000);

    // Must finish within the day's consultation hours
    const dayEnd = new Date(date);
    dayEnd.setHours(hours.end, 0, 0, 0);
    if (end > dayEnd) return true;

    // Blocked hours — any overlap, not just a matching start hour
    const blocked = ((hours && hours.blockedHours) || []).slice();
    if (date.getDay() === 1) {
      (this.config.mondayBlockedHours || []).forEach(h => blocked.push(h));
    }
    for (const h of blocked) {
      const bStart = new Date(date);
      bStart.setHours(h, 0, 0, 0);
      const bEnd = new Date(date);
      bEnd.setHours(h + 1, 0, 0, 0);
      if (start < bEnd && end > bStart) return true;
    }

    // Existing Google Calendar bookings — any overlap
    return this.busySlots.some(busy => start < busy.end && end > busy.start);
  }

  /**
   * Working hours for a date: the weekday schedule in effect on that date,
   * narrowed by any date-specific override. Null if not a working day.
   */
  getHoursForDate(date) {
    const schedule = this.getScheduleForDate(date)[date.getDay()];
    if (!schedule) return null;
    // A schedule entry may set its own blockedHours (e.g. Friday has no
    // 12pm-1pm break); otherwise the site-wide list applies.
    const blockedHours = schedule.blockedHours != null
      ? schedule.blockedHours
      : (this.config.blockedHours || []);
    const override = this.getDateOverride(date);
    if (override && override !== 'closed') {
      return {
        start: override.start != null ? override.start : schedule.start,
        end: override.end != null ? override.end : schedule.end,
        blockedHours: blockedHours,
      };
    }
    return { start: schedule.start, end: schedule.end, blockedHours: blockedHours };
  }

  /**
   * Check if a date is the first working day after a holiday/break.
   * Walk backwards: if we hit a blocked date before a normal working day,
   * this day needs a buffer (designers need prep time).
   */
  isPostHolidayBuffer(date) {
    if (this.usesWindows()) return false; // listed dates are explicit
    let check = new Date(date);
    check.setDate(check.getDate() - 1);

    for (let i = 0; i < 10; i++) {
      if (this.isBlockedDate(check)) return true;
      if (this.isWorkingDay(check)) return false;
      check.setDate(check.getDate() - 1);
    }
    return false;
  }

  /**
   * Get visible working days for the current page.
   */
  getVisibleDays() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysToShow = this.config.daysToShow || 3;
    const minAhead = this.getMinDaysAhead();

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + minAhead);

    const totalNeeded = (this.weekOffset + 1) * daysToShow;
    const workingDays = [];
    const maxLookahead = this.getMaxLookaheadDays();
    let d = new Date(startDate);
    for (let i = 0; i < maxLookahead && workingDays.length < totalNeeded; i++) {
      if (this.isWorkingDay(d) && !this.isBlockedDate(d) && !this.isDateClosed(d) && !this.isPostHolidayBuffer(d)) {
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

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + minAhead);

    const maxLookahead = this.getMaxLookaheadDays();
    let count = 0;
    let d = new Date(startDate);
    for (let i = 0; i < maxLookahead; i++) {
      if (this.isWorkingDay(d) && !this.isBlockedDate(d) && !this.isDateClosed(d) && !this.isPostHolidayBuffer(d)) count++;
      d.setDate(d.getDate() + 1);
    }
    return Math.ceil(count / daysToShow);
  }

  /**
   * Get available slots for a given date.
   * Applies: blocked hours, Monday 1-3pm block, random slot hiding.
   */
  getSlotsForDay(date) {
    if (this.usesWindows()) {
      const slots = this.getWindowSlots(date).map(s => {
        const end = s.hour * 60 + s.minute + s.duration;
        return Object.assign(s, {
          label: `${this.formatTime12(s.hour, s.minute)} – ${this.formatTime12(Math.floor(end / 60), end % 60)}`,
        });
      });
      return this.pickSlots(date, slots);
    }

    const dayOfWeek = date.getDay();
    const schedule = this.getHoursForDate(date);
    if (!schedule || this.isDateClosed(date)) return [];

    const earliest = this.getEarliestBookingTime(); // 28 hours from now
    const isMonday = dayOfWeek === 1;
    const mondayBlocked = this.config.mondayBlockedHours || [];

    // Build all possible slots
    const allSlots = [];
    for (let hour = schedule.start; hour < schedule.end; hour++) {
      const isBlocked = (schedule.blockedHours || []).includes(hour);
      const isMondayBlocked = isMonday && mondayBlocked.includes(hour);

      // Check 28-hour minimum: slot start time must be >= earliest
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      const tooSoon = slotStart < earliest;

      const isBusy = this.isSlotBusy(date, hour);
      let isUnavailable = tooSoon || isBlocked || isMondayBlocked || isBusy;

      allSlots.push({
        hour,
        minute: 0,
        label: `${this.formatHour(hour)} \u2013 ${this.formatHour(hour + 1)}`,
        date: new Date(date),
        unavailable: isUnavailable,
        blocked: isBlocked || isMondayBlocked,
        booked: isBusy,
      });
    }

    return this.pickSlots(date, allSlots.filter(s => !s.unavailable));
  }

  /**
   * Show at most config.slotsToShow of the available slots, chosen
   * pseudo-randomly (seeded by date so a refresh shows the same ones).
   */
  pickSlots(date, available) {
    if (this.config.slotsToShow === 0) return available; // 0 = show them all
    const slotsToShow = this.config.slotsToShow || 5;
    if (available.length <= slotsToShow) return available;

    const seed = date.toISOString().slice(0, 10);
    const shuffled = available.slice();
    // Fisher-Yates with seeded random
    for (let i = shuffled.length - 1; i > 0; i--) {
      const r = this.seededRandom(seed + i);
      const j = Math.floor(r * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const shown = shuffled.slice(0, slotsToShow);
    shown.sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));
    return shown;
  }

  formatHour(h) {
    if (h === 0 || h === 24) return '12am';
    if (h < 12) return `${h}:00am`;
    if (h === 12) return '12:00pm';
    return `${h - 12}:00pm`;
  }

  formatHour24(h) {
    return `${String(h).padStart(2, '0')}:00`;
  }

  formatTime15(h, m) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  formatTime12(h, m) {
    const suffix = h < 12 || h === 24 ? 'am' : 'pm';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, '0')}${suffix}`;
  }

  /**
   * Slot details passed to onSelect: "09:00 - 09:30" style times, using
   * the configured slot length.
   */
  describeSlot(date, hour, minute, duration) {
    duration = duration || this.getSlotMinutes();
    const end = hour * 60 + minute + duration;
    const time = `${this.formatTime15(hour, minute)} - ${this.formatTime15(Math.floor(end / 60), end % 60)}`;
    return {
      date,
      hour,
      minute,
      duration,
      dateFormatted: this.formatDateLong(date),
      timeFormatted: time,
      label: `${this.formatDateLong(date)}, ${time}`,
    };
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
    if (days.length === 0) {
      this.container.innerHTML = '<div class="calendar-slot unavailable">' +
        'There are no consultation times available at the moment. ' +
        'Please go back and send your details, and our team will be in touch.</div>';
      return;
    }
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
            (this.selectedSlot.minute || 0) === (slot.minute || 0) &&
            !this.selectedSlot.isSpecial;
          const classes = ['calendar-slot'];
          if (slot.unavailable) classes.push('unavailable');
          if (isSelected) classes.push('selected');
          html += `
            <div class="${classes.join(' ')}"
                 data-date="${slot.date.toISOString()}"
                 data-hour="${slot.hour}"
                 data-minute="${slot.minute || 0}"
                 data-duration="${slot.duration || ''}">
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
      // Build date options using the same rules as the main calendar
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const minAhead = this.getMinDaysAhead();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + minAhead);
      const datOpts = [];
      let d = new Date(startDate);
      const maxLookahead = this.getMaxLookaheadDays();
      for (let i = 0; i < maxLookahead; i++) {
        if (this.isWorkingDay(d) && !this.isBlockedDate(d) && !this.isDateClosed(d) && !this.isPostHolidayBuffer(d)) {
          datOpts.push(new Date(d));
        }
        d.setDate(d.getDate() + 1);
      }

      let dateOptionsHtml = datOpts.map(dt => {
        return `<option value="${dt.toISOString()}">${this.formatDateLong(dt)}</option>`;
      }).join('');

      // Build initial time options for the first date
      const firstDate = datOpts.length > 0 ? datOpts[0] : null;
      let timeOptionsHtml = this.buildSpecialTimeOptions(firstDate);

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

    const dateSelect = reqEl.querySelector('#specialDate');
    if (dateSelect) {
      dateSelect.addEventListener('change', () => {
        const timeSelect = reqEl.querySelector('#specialTime');
        if (timeSelect) {
          const selectedDate = new Date(dateSelect.value);
          timeSelect.innerHTML = this.buildSpecialTimeOptions(selectedDate);
        }
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
        if (!timeEl.value) return; // "No times available"
        const date = new Date(dateEl.value);
        const [hour, minute, duration] = timeEl.value.split(':').map(Number);
        const info = infoEl ? infoEl.value.trim() : '';

        this.selectedSlot = { date, hour, minute, duration, isSpecial: true };
        this.showSpecialRequest = false;
        this.render();

        if (this.onSelect) {
          const slot = this.describeSlot(date, hour, minute, duration);
          slot.isSpecial = true;
          slot.specialInfo = info;
          slot.label += ' (Special Request)';
          this.onSelect(slot);
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
        const hour = parseInt(slotEl.dataset.hour, 10);
        const minute = parseInt(slotEl.dataset.minute || '0', 10);
        const duration = parseInt(slotEl.dataset.duration, 10) || undefined;

        this.selectedSlot = { date, hour, minute, duration };
        this.render();

        if (this.onSelect) this.onSelect(this.describeSlot(date, hour, minute, duration));
      });
    });
  }

  getSelection() {
    if (!this.selectedSlot) return null;
    const s = this.selectedSlot;
    return this.describeSlot(s.date, s.hour, s.minute || 0, s.duration);
  }

  clearSelection() {
    this.selectedSlot = null;
    this.render();
  }
}
