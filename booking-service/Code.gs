/**
 * Design Consultation Booking Service — Google Apps Script web app
 *
 * The websites' enquiry forms (Mike Ayres Design and Southpaw) talk to this script instead of holding a
 * Google login in the page. The script runs as the account that deploys it:
 * that account creates the calendar booking, owns the Google Meet and sends
 * the emails (customer emails from the fromAlias address). The host
 * (hostEmail) is invited to every call.
 *
 * Optionally it also sends this brand's 24-hour reminders and shares its
 * Gemini notes (SETTINGS.sendReminders / shareNotes) — leave those off
 * while the separate reminder and notes scripts handle them.
 *
 * Customer emails are built here from plain details, never taken from the
 * browser, so the script can't be used to send anyone else's content.
 *
 * Setup and updating: see booking-service/SETUP.md.
 */

var SETTINGS = {
  calendarId: 'c_a5f29fda9f946928e38859e140e427d27c046af14517c7c3713ac7a1cd2d9aa0@group.calendar.google.com',

  // Booking rules (the form applies the same ones)
  minNoticeHours: 24,
  maxDaysAhead: 180,
  bookingGapMinutes: 60,   // consultations start at least this far apart

  // Limits against misuse
  maxPerCustomer: 3,       // per email address, per 6 hours
  maxPerHour: 20,          // all bookings and enquiries

  // Off: the existing "24hr Reminder" and "Consultation Notes Helper"
  // scripts already do these. Only switch on if this script replaces them
  // (they then run for the Mike Ayres Design site).
  sendReminders: false,    // daily, 9–10am: reminder to tomorrow's customers
  shareNotes: false,       // every 10 min: share Gemini notes, forward to notesNotifyEmail

  // One block per website. The form says which one it is.
  sites: {
    mad: {
      allowBookings: true,
      brand: {
        name: 'Mike Ayres Design',
        designLabel: 'Mike Ayres Design',
        senderName: 'Mike Ayres Design Team',     // From name on every email
        teamName: 'The Mike Ayres Design Team',    // email sign-off
        callTitle: 'Mike Ayres Design Call',       // calendar event title prefix
        calendarColorId: '9',
        photosUrl: 'https://www.mikeayresdesign.co.uk/pages/sensory-gallery-v2',
        salesDirector: 'Nick',
        typicalLength: 'around 15 minutes',        // booking email
        reminderCallLength: 'around 20 minutes',   // reminder email
      },
      // Customer emails come from this address when it's a "Send mail as"
      // address in this account's Gmail; otherwise from the account itself.
      fromAlias: 'design-visit@mikeayresdesign.co.uk',
      replyTo: 'design-visit@mikeayresdesign.co.uk',
      // Hosts every call: gets Google's calendar invite (with the Meet link).
      // Leave '' if the script runs in the host's own account.
      hostEmail: 'nick@mikeayresdesign.co.uk',
      // New booking / enquiry notifications
      notifyTo: 'nick@mikeayresdesign.co.uk',
      notifyBcc: 'design-visit@mikeayresdesign.co.uk',
      notesNotifyEmail: 'design-visit@mikeayresdesign.co.uk',
    },
    southpaw: {
      allowBookings: false,   // the Southpaw form only takes enquiries
      brand: {
        name: 'Southpaw',
        designLabel: 'Southpaw Design',
        senderName: 'Southpaw Design Team',
        teamName: 'The Southpaw Team',
        callTitle: 'Southpaw Design Call',
        calendarColorId: '11',
        photosUrl: 'https://southpaw.co.uk/pages/sensory-room-photos',
        salesDirector: 'Mike',
        typicalLength: 'approximately 15–20 minutes',
        reminderCallLength: 'around 15–20 minutes',
      },
      fromAlias: 'design-visit@southpaw.co.uk',
      replyTo: 'design-visit@southpaw.co.uk',
      hostEmail: '',
      notifyTo: 'design-visit@southpaw.co.uk',
      notifyBcc: '',
      notesNotifyEmail: 'design-visit@southpaw.co.uk',
    },
  },
};

// The website this request is for (set by useSite_)
var SITE = SETTINGS.sites.mad;

function useSite_(key) {
  SITE = SETTINGS.sites[key] || SETTINGS.sites.mad;
  return SITE;
}

var TZ = 'Europe/London';

// ════════════════════════════════════════════════════════════
// Web app
// ════════════════════════════════════════════════════════════

function doGet(e) {
  var p = (e && e.parameter) || {};
  useSite_(p.site);
  if (p.action === 'busy') return json_(getBusy_(Number(p.days) || 60));
  return json_({ ok: true, service: SITE.brand.name + ' bookings' });
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'invalid' });
  }
  useSite_(data.site);
  try {
    if (data.action === 'book' && SITE.allowBookings) return json_(book_(data));
    if (data.action === 'enquiry') return json_(enquiry_(data));
    return json_({ ok: false, error: 'invalid' });
  } catch (err) {
    if (err && err.userError) return json_({ ok: false, error: err.userError });
    console.error('Booking failed: ' + (err && err.stack || err));
    return json_({ ok: false, error: 'server' });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Times the form must not offer: every event in the bookings calendar.
// Only times and a "this is a booking" flag are shared, never titles.
function getBusy_(days) {
  days = Math.min(Math.max(days, 1), SETTINGS.maxDaysAhead + 14);
  var now = new Date();
  var res = Calendar.Events.list(SETTINGS.calendarId, {
    timeMin: now.toISOString(),
    timeMax: new Date(now.getTime() + days * 864e5).toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 2500,
    fields: 'items(start,end,status,summary)',
  });
  var items = (res.items || [])
    .filter(function (ev) { return ev.status !== 'cancelled'; })
    .map(function (ev) {
      return {
        start: ev.start.dateTime || ev.start.date,
        end: ev.end.dateTime || ev.end.date,
        isBooking: isBooking_(ev.summary),
      };
    });
  return { ok: true, items: items };
}

function isBooking_(summary) {
  return String(summary || '').indexOf(SITE.brand.callTitle) === 0;
}

// ════════════════════════════════════════════════════════════
// Bookings and enquiries
// ════════════════════════════════════════════════════════════

function book_(data) {
  var b = clean_(data);
  var slot = data.slot || {};
  var start = new Date(slot.start);
  var minutes = Math.round(Number(slot.minutes));
  var now = Date.now();
  if (isNaN(start.getTime()) || !(minutes >= 10 && minutes <= 60) || start.getUTCMinutes() % 5 !== 0 ||
      start.getTime() < now + SETTINGS.minNoticeHours * 36e5 ||
      start.getTime() > now + SETTINGS.maxDaysAhead * 864e5) {
    throw userError_('invalid');
  }
  var end = new Date(start.getTime() + minutes * 6e4);
  b.isSpecial = !!slot.isSpecial;
  b.specialInfo = str_(slot.specialInfo, 500);

  // One booking at a time, so two people can't take the same slot
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  var ev;
  try {
    if (!slotFree_(start, end)) throw userError_('taken');
    if (!withinLimits_(b.email)) throw userError_('limit');
    ev = createEvent_(b, start, end);
  } finally {
    lock.releaseLock();
  }

  var meetLink = meetLinkOf_(ev);
  sendCustomerEmail_(b, start, end, meetLink);
  sendCompanyEmail_(b, start, end, meetLink);
  return { ok: true, meetLink: meetLink };
}

function enquiry_(data) {
  var b = clean_(data);
  if (!withinLimits_(b.email)) throw userError_('limit');
  sendCustomerEmail_(b, null, null, null);
  sendCompanyEmail_(b, null, null, null);
  return { ok: true };
}

function userError_(code) {
  var err = new Error(code);
  err.userError = code;
  return err;
}

function str_(v, max) {
  return String(v == null ? '' : v)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max || 200);
}

function list_(v, max) {
  return (Array.isArray(v) ? v : []).slice(0, 30)
    .map(function (x) { return str_(x, max || 80); })
    .filter(function (x) { return x; });
}

function clean_(d) {
  var c = d.contact || {};
  var s = d.selections || {};
  var b = {
    firstName: str_(c.firstName, 60),
    surname: str_(c.surname, 60),
    email: str_(c.email, 120),
    phone: str_(c.phone, 40),
    postcode: str_(c.postcode, 20),
    premises: str_(c.premises, 150),
    address: str_(c.address, 250),
    notes: str_(c.notes, 3000),
    roomType: str_(s.roomType, 80),
    roomTypeDescription: str_(s.roomTypeDescription, 120),
    ageGroups: list_(s.ageGroups),
    roomSize: str_(s.roomSize, 60),
    equipment: list_(s.equipment),
    designer: str_(s.designer, 80) || 'Any (No Preference)',
    callType: d.callType === 'phone' ? 'phone' : 'video',
    companyHtml: typeof d.companyHtml === 'string' ? d.companyHtml.slice(0, 200000) : '',
  };
  if (!b.firstName || !/^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/.test(b.email)) throw userError_('invalid');
  b.fullName = (b.firstName + ' ' + b.surname).trim();
  return b;
}

function withinLimits_(email) {
  var cache = CacheService.getScriptCache();
  var kCust = 'cust:' + email.toLowerCase();
  var kHour = 'hour:' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHH');
  var nCust = Number(cache.get(kCust) || 0);
  var nHour = Number(cache.get(kHour) || 0);
  if (nCust >= SETTINGS.maxPerCustomer || nHour >= SETTINGS.maxPerHour) return false;
  cache.put(kCust, String(nCust + 1), 21600);
  cache.put(kHour, String(nHour + 1), 3600);
  return true;
}

// Free if nothing in the calendar overlaps it, and no other booking
// starts within bookingGapMinutes of it.
function slotFree_(start, end) {
  var gap = SETTINGS.bookingGapMinutes * 6e4;
  var res = Calendar.Events.list(SETTINGS.calendarId, {
    timeMin: new Date(start.getTime() - 864e5).toISOString(),
    timeMax: new Date(end.getTime() + 864e5).toISOString(),
    singleEvents: true,
    maxResults: 250,
    fields: 'items(start,end,status,summary)',
  });
  return !(res.items || []).some(function (ev) {
    if (ev.status === 'cancelled') return false;
    var s = new Date(ev.start.dateTime || ev.start.date);
    var e = new Date(ev.end.dateTime || ev.end.date);
    if (start < e && end > s) return true;
    return isBooking_(ev.summary) && Math.abs(s - start) < gap;
  });
}

function createEvent_(b, start, end) {
  var phone = b.callType === 'phone';
  var owner = Session.getEffectiveUser().getEmail();
  var host = SITE.hostEmail && SITE.hostEmail.toLowerCase() !== owner.toLowerCase() ? SITE.hostEmail : '';
  var customer = { email: b.email, displayName: b.fullName };
  var resource = {
    summary: SITE.brand.callTitle + ': ' + b.fullName + ' - ' + (b.premises || 'No Premises') +
      (phone ? ' (Phone)' : '') + (b.isSpecial ? ' (Special Request)' : ''),
    description: description_(b, start, end),
    colorId: SITE.brand.calendarColorId,
    start: { dateTime: start.toISOString(), timeZone: TZ },
    end: { dateTime: end.toISOString(), timeZone: TZ },
    // The host gets it in their own calendar; the customer is a guest so
    // they can join the Meet directly. The customer gets our own email
    // rather than Google's, and can't see the guest list.
    attendees: [
      { email: owner, responseStatus: 'accepted' },
      customer,
    ],
    guestsCanModify: false,
    guestsCanInviteOthers: false,
    guestsCanSeeOtherGuests: false,
  };
  if (!phone) {
    resource.conferenceData = {
      createRequest: { requestId: Utilities.getUuid(), conferenceSolutionKey: { type: 'hangoutsMeet' } },
    };
  }
  var ev;
  if (host) {
    // Google can't email just one guest, so: create the event with only the
    // host as a guest and invites on (the host gets Google's invite), then
    // add the customer without any Google email.
    resource.attendees = [{ email: host }];
    ev = Calendar.Events.insert(resource, SETTINGS.calendarId, { conferenceDataVersion: 1, sendUpdates: 'all' });
    try {
      ev = Calendar.Events.patch({ attendees: [{ email: host }, customer] }, SETTINGS.calendarId, ev.id, { sendUpdates: 'none' });
    } catch (e) {
      console.error('Booked, but could not add the customer as a guest: ' + e); // they still get our email
    }
  } else {
    ev = Calendar.Events.insert(resource, SETTINGS.calendarId, { conferenceDataVersion: 1, sendUpdates: 'none' });
  }
  // The Meet link is usually ready at once; if not, give it a few seconds
  for (var i = 0; i < 5 && !phone && !meetLinkOf_(ev); i++) {
    Utilities.sleep(1000);
    ev = Calendar.Events.get(SETTINGS.calendarId, ev.id);
  }
  return ev;
}

function meetLinkOf_(ev) {
  var eps = ev && ev.conferenceData && ev.conferenceData.entryPoints || [];
  for (var i = 0; i < eps.length; i++) {
    if (eps[i].entryPointType === 'video') return eps[i].uri;
  }
  return (ev && ev.hangoutLink) || null;
}

// Plain-text event description. The reminder reads Name, Email, Phone and
// Call Type from it, so keep those labels.
function description_(b, start, end) {
  var d = '';
  d += 'Name: ' + b.fullName + '\n';
  d += 'Email: ' + b.email + '\n';
  if (b.phone) d += 'Phone: ' + b.phone + '\n';
  if (b.postcode) d += 'Postcode: ' + b.postcode + '\n';
  if (b.premises) d += 'Premises: ' + b.premises + (b.address ? ', ' + b.address : '') + '\n';
  d += b.callType === 'phone'
    ? 'Call Type: Phone call (call the customer on ' + b.phone + ')\n'
    : 'Call Type: Video call (Google Meet)\n';
  d += '\n--- Selections ---\n';
  if (b.roomType) d += 'Room Type: ' + b.roomType + '\n';
  if (b.ageGroups.length) d += 'Age Group: ' + b.ageGroups.join(', ') + '\n';
  if (b.roomSize) d += 'Room Size: ' + b.roomSize + '\n';
  if (b.equipment.length) d += 'Equipment: ' + b.equipment.join(', ') + '\n';
  d += 'Designer: ' + b.designer + '\n';
  if (b.isSpecial) {
    d += 'Special Time Request: ' + slotLabel_(start, end) + '\n';
    if (b.specialInfo) d += 'Request Info: ' + b.specialInfo + '\n';
  }
  if (b.notes) d += '\nAdditional Notes: ' + b.notes + '\n';
  d += '\n--- Quick Actions ---\n';
  d += 'Email: https://mail.google.com/mail/?view=cm&to=' + encodeURIComponent(b.email) +
    '&su=' + encodeURIComponent('Sensory Room Consultation - ' + b.fullName) + '\n';
  if (b.phone) d += 'Phone: ' + b.phone + '\n';
  return d;
}

// ════════════════════════════════════════════════════════════
// Emails
// ════════════════════════════════════════════════════════════

function esc_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDateLong_(d) { return Utilities.formatDate(d, TZ, 'EEEE d MMMM yyyy'); }
function fmtHM_(d) { return Utilities.formatDate(d, TZ, 'HH:mm'); }
function slotTime_(start, end) { return fmtHM_(start) + ' - ' + fmtHM_(end); }
function slotLabel_(start, end) { return fmtDateLong_(start) + ', ' + slotTime_(start, end); }

function senderOptions_() {
  var opts = { name: SITE.brand.senderName, replyTo: SITE.replyTo };
  if (SITE.fromAlias && GmailApp.getAliases().indexOf(SITE.fromAlias) !== -1) {
    opts.from = SITE.fromAlias;
  }
  return opts;
}

function sendMail_(to, subject, html, extra) {
  var opts = senderOptions_();
  opts.htmlBody = html;
  for (var k in extra) opts[k] = extra[k];
  var text = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|h\d|li|div|tr)>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n').trim();
  GmailApp.sendEmail(to, subject, text, opts);
}

function sendCustomerEmail_(b, start, end, meetLink) {
  var html = customerEmailHtml_(b, start, end, meetLink);
  var extra = {};
  if (start) {
    extra.attachments = [Utilities.newBlob(customerIcs_(b, start, end, meetLink), 'text/calendar', 'invite.ics')];
  }
  sendMail_(b.email, 'Next steps on your ' + SITE.brand.designLabel + ' Journey…', html, extra);
}

// The form sends its designed notification (photos and all) with
// %%MEET_LINK%% where the Meet link goes. It only ever goes to our own
// addresses. If it's missing, a plain version is built here.
function sendCompanyEmail_(b, start, end, meetLink) {
  var html = b.companyHtml
    ? b.companyHtml.split('%%MEET_LINK%%').join(esc_(meetLink || ''))
    : companyEmailFallback_(b, start, end, meetLink);
  var subject = SITE.brand.designLabel + (start ? ' Consultation Booked' : ' Enquiry');
  var extra = { replyTo: b.email };
  if (SITE.notifyBcc) extra.bcc = SITE.notifyBcc;
  sendMail_(SITE.notifyTo, subject, html, extra);
}

function companyEmailFallback_(b, start, end, meetLink) {
  var row = function (l, v) { return v ? '<tr><td style="padding:4px 12px 4px 0;font-weight:600;">' + l + '</td><td>' + esc_(v) + '</td></tr>' : ''; };
  return '<div style="font-family:Arial,Helvetica,sans-serif;color:#333;">' +
    '<h2>' + (start ? 'New Design Consultation Booking' : 'New Design Enquiry') + '</h2><table>' +
    row('Name', b.fullName) + row('Email', b.email) + row('Phone', b.phone) + row('Postcode', b.postcode) +
    row('Premises', b.premises + (b.address ? ', ' + b.address : '')) +
    (start ? row('Date & Time', slotLabel_(start, end)) + row('Call Type', b.callType === 'phone' ? 'Phone call' : 'Video call (Google Meet)') + row('Google Meet', meetLink) : '') +
    row('Designer', b.designer) + row('Room Type', b.roomTypeDescription || b.roomType) + row('Age Group', b.ageGroups.join(', ')) +
    row('Room Size', b.roomSize) + row('Equipment', b.equipment.join(', ')) + row('Notes', b.notes) +
    '</table></div>';
}

function summaryHtml_(b, start, end) {
  var row = function (label, value) {
    return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:14px;">' +
      '<span style="font-weight:600;color:#2c3e50;">' + label + '</span>' +
      '<span style="color:#555;text-align:right;">' + esc_(value) + '</span></div>';
  };
  var rows = '';
  rows += row('Name', b.fullName);
  rows += row('Email', b.email);
  if (b.roomType) rows += row('Room Type', b.roomType);
  if (b.ageGroups.length) rows += row('Age Group', b.ageGroups.join(', '));
  if (b.roomSize) rows += row('Room Size', b.roomSize);
  if (b.equipment.length) rows += row('Equipment', b.equipment.join(', '));
  rows += row('Designer', b.designer);
  if (start) {
    rows += row('Call Type', b.callType === 'phone' ? 'Phone call' : 'Video call (Google Meet)');
    rows += row('Appointment', slotLabel_(start, end));
  }
  return '<h3 style="color:#2c3e50;margin-top:30px;font-size:18px;">' + (start ? 'Your Booking Summary' : 'Your Enquiry Summary') + '</h3>' +
    '<div style="background:#f8f6f3;border-radius:8px;padding:16px 20px;margin:12px 0 20px;">' + rows + '</div>';
}

function customerEmailHtml_(b, start, end, meetLink) {
  var B = SITE.brand;
  var phone = b.callType === 'phone';
  var siteVisit = '<p>Following our initial consultation, we may need to conduct a site visit to gather further details and additional information. This is where our Sales Director, ' + esc_(B.salesDirector) + ', will take you through the process in more detail. This initial step ensures we have everything required to move your project forward accurately and efficiently.</p>';
  var open = '<div style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">' +
    '<p>Dear ' + esc_(b.firstName) + ',</p>';
  var close = summaryHtml_(b, start, end) +
    '<p>Warm regards,<br><strong>' + esc_(B.teamName) + '</strong></p></div>';

  if (!start) {
    return open +
      '<p>Thank you for your enquiry. Our team will be in contact shortly using the details you’ve provided. We look forward to helping you.</p>' +
      '<p>In the meantime, if you’re able to share any of the following, it will help us prepare (no problem at all if not):</p>' +
      '<ul style="padding-left: 20px;">' +
        '<li>Whether this is an existing room being redesigned or a completely new space</li>' +
        '<li>Your approximate budget for this project</li>' +
        '<li>Your ideal timescale</li>' +
        '<li>Details of any stakeholders involved in the decision-making process</li>' +
        '<li>Any particular challenges or requirements you’d like us to be aware of</li>' +
      '</ul>' +
      '<p>Simply reply to this email with anything you’d like to send over.</p>' +
      siteVisit + close;
  }

  var dateStr = esc_(fmtDateLong_(start));
  var timeStr = esc_(slotTime_(start, end));
  var meeting;
  if (phone) {
    meeting = '<p>We will call you on <strong>' + esc_(b.phone) + '</strong> on <strong>' + dateStr + '</strong> at <strong>' + timeStr + '</strong>.</p>' +
      '<p>If you would prefer a video call instead, or would like us to use a different number, just reply to this email and let us know.</p>';
  } else {
    meeting = (meetLink
      ? '<p>We are scheduled to meet on <strong>' + dateStr + '</strong> at <strong>' + timeStr + '</strong> via Google Meet:<br>' +
        '<a href="' + esc_(meetLink) + '" style="color: #1a73e8; font-weight: bold;">' + esc_(meetLink) + '</a></p>'
      : '<p>We will send you a Google Meet link for your consultation shortly.</p>') +
      '<p>If you would prefer to speak via phone or WhatsApp instead, just let us know and we will happily arrange that.</p>';
  }

  return open +
    '<p>Thank you for booking your initial design consultation, we’re really looking forward to speaking with you and learning more about your project.</p>' +
    '<p>Our initial discussion will take ' + esc_(B.typicalLength) + ' and will give us a clearer understanding of your space, your vision, and how we can best support you.</p>' +
    '<p>To help us prepare ahead of our ' + (phone ? 'call' : 'meeting') + ', it would be greatly appreciated if you could share any of the following (where possible):</p>' +
    '<ul style="padding-left: 20px;">' +
      '<li>Photos of the room(s) as they currently are</li>' +
      '<li>Floor plans or measurements (if available)</li>' +
      '<li>Inspiration images, Pinterest boards, or styles you’re drawn to – you can browse our <a href="' + esc_(B.photosUrl) + '" style="color: #1a73e8;">sensory room photos</a> for ideas</li>' +
      '<li>Whether this is an existing room being redesigned or a completely new space</li>' +
      '<li>Your approximate budget for this project</li>' +
      '<li>Your ideal timescale</li>' +
      '<li>Details of any other stakeholders involved in the decision-making process</li>' +
      '<li>Any particular challenges or requirements you’d like us to be aware of</li>' +
    '</ul>' +
    '<p>If you’re unable to gather all of this information, please don’t worry, we can absolutely still have a valuable conversation. However, the more detail we have beforehand, the more productive and focused our time together will be.</p>' +
    siteVisit +
    '<h3 style="color: #2c3e50; margin-top: 30px; font-size: 18px;">' + (phone ? 'Call Details' : 'Meeting Details') + '</h3>' +
    meeting +
    '<p>If you have any questions ahead of our call, please feel free to get in touch. We look forward to speaking with you soon.</p>' +
    close;
}

function customerIcs_(b, start, end, meetLink) {
  var phone = b.callType === 'phone';
  var fmt = function (d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
  var icsText = function (s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); };
  var description = phone ? 'We will call you on ' + b.phone
    : (meetLink ? 'Join via Google Meet: ' + meetLink : 'Initial design consultation – details to follow');
  var location = phone ? 'Phone call' : (meetLink || '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//' + SITE.brand.name + '//Design Consultation//EN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    'UID:consultation-' + Utilities.getUuid() + '@' + SITE.replyTo.split('@')[1],
    'DTSTAMP:' + fmt(new Date()),
    'DTSTART:' + fmt(start),
    'DTEND:' + fmt(end),
    'SUMMARY:' + icsText(SITE.brand.callTitle + (phone ? ' (phone call)' : '')),
    'DESCRIPTION:' + icsText(description),
    location ? 'LOCATION:' + icsText(location) : '',
    'ORGANIZER;CN=' + SITE.brand.senderName + ':mailto:' + SITE.replyTo,
    'ATTENDEE;CN=' + icsText(b.fullName).replace(/[:;]/g, ' ') + ';RSVP=TRUE:mailto:' + b.email,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(function (l) { return l; }).join('\r\n');
}

// ════════════════════════════════════════════════════════════
// 24-hour reminders (daily trigger)
// ════════════════════════════════════════════════════════════

function sendReminders() {
  useSite_('mad');
  var calendar = CalendarApp.getCalendarById(SETTINGS.calendarId);
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var from = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0);
  var to = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59);

  calendar.getEvents(from, to).forEach(function (event) {
    var title = event.getTitle();
    if (title.indexOf(SITE.brand.callTitle + ':') !== 0) return;
    if (event.getTag('reminderSent') === 'true') return;
    var info = parseDescription_(event.getDescription() || '');
    if (!info.email) return;
    var start = event.getStartTime();
    var html = reminderHtml_(info, start, meetLinkForEvent_(event));
    try {
      sendMail_(info.email, 'Reminder: your ' + SITE.brand.name + ' consultation is tomorrow', html, {});
      event.setTag('reminderSent', 'true');
      console.log('Reminder sent to ' + info.email + ' for ' + title);
    } catch (e) {
      console.error('Reminder failed for ' + info.email + ': ' + e.message);
    }
  });
}

function parseDescription_(desc) {
  var info = { firstName: '', email: '', phone: '', isPhoneCall: false };
  var m = desc.match(/Name:\s*(.+)/);
  if (m) info.firstName = m[1].trim().split(' ')[0];
  m = desc.match(/Email:\s*([^\s\n]+@[^\s\n]+)/);
  if (m) info.email = m[1].trim();
  m = desc.match(/Phone:\s*(.+)/);
  if (m) info.phone = m[1].trim();
  info.isPhoneCall = /Call Type:\s*Phone call/i.test(desc);
  return info;
}

function meetLinkForEvent_(event) {
  try {
    return meetLinkOf_(Calendar.Events.get(SETTINGS.calendarId, event.getId().replace('@google.com', '')));
  } catch (e) {
    return null;
  }
}

function reminderHtml_(info, start, meetLink) {
  var B = SITE.brand;
  var time = Utilities.formatDate(start, TZ, 'h:mma').toLowerCase();
  var h = '<div style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">';
  h += '<p>Dear ' + esc_(info.firstName) + ',</p>';
  h += '<p>Just a quick reminder that your initial ' + esc_(B.name) + ' design consultation is scheduled for tomorrow, <strong>' + esc_(fmtDateLong_(start)) + '</strong> at <strong>' + esc_(time) + '</strong>.</p>';
  if (info.isPhoneCall) {
    h += '<p>We will call you on <strong>' + esc_(info.phone) + '</strong>.</p>';
  } else if (meetLink) {
    h += '<p>You can join the meeting here:<br><a href="' + esc_(meetLink) + '" style="color: #1a73e8; font-weight: bold;">' + esc_(meetLink) + '</a></p>';
  } else {
    h += '<p>Your meeting link will be included in your calendar invite.</p>';
  }
  h += '<p>The call will take ' + esc_(B.reminderCallLength) + ' and will give us a chance to learn more about your space, your goals, and how we can best support your project.</p>';
  h += info.isPhoneCall
    ? '<p>If you would prefer a video call instead, or would like us to use a different number, simply reply to this email and let us know.</p>'
    : '<p>If you would prefer to speak via phone or WhatsApp instead, simply reply to this email and let us know, and we will happily arrange that.</p>';
  h += '<p>If you have any photos of the room, floor plans, measurements, or inspiration images you would like to share beforehand, please feel free to send them across. No problem at all if not. Also, feel free to check out our sensory room gallery <a href="' + esc_(B.photosUrl) + '" style="color: #1a73e8;">here</a> for inspiration.</p>';
  h += '<p>We look forward to speaking with you.</p>';
  h += '<p>Warm regards,<br><strong>' + esc_(B.teamName) + '</strong></p></div>';
  return h;
}

// ════════════════════════════════════════════════════════════
// Gemini notes (every 10 minutes)
// Shares this brand's "Notes by Gemini" docs so anyone in the company can
// edit them (never customers), then forwards Gemini's email about them.
// ════════════════════════════════════════════════════════════

function processNewNotes() {
  useSite_('mad');
  var since = new Date(Date.now() - 7 * 864e5);
  var settled = Date.now() - 5 * 6e4;
  findNotes_(since).forEach(function (f) {
    if (isDone_(f.getId())) return;
    if (f.getLastUpdated().getTime() > settled) return; // Gemini may still be writing
    shareWithCompany_(f);
    markDone_(f.getId());
  });
  forwardGeminiEmails_();
}

function isNotesDoc_(name) {
  return name.indexOf(SITE.brand.callTitle) === 0 && name.indexOf('Notes by Gemini') !== -1;
}

function findNotes_(since) {
  var q = "title contains 'Notes by Gemini' and mimeType = 'application/vnd.google-apps.document'" +
    " and 'me' in owners and trashed = false and modifiedDate > '" + since.toISOString() + "'";
  var out = [];
  var it = DriveApp.searchFiles(q);
  while (it.hasNext()) {
    var f = it.next();
    if (isNotesDoc_(f.getName())) out.push(f);
  }
  return out;
}

function shareWithCompany_(file) {
  var access = file.getSharingAccess();
  var companyWide = access === DriveApp.Access.DOMAIN || access === DriveApp.Access.DOMAIN_WITH_LINK;
  if (companyWide && file.getSharingPermission() === DriveApp.Permission.EDIT) return;
  if (access !== DriveApp.Access.PRIVATE && !companyWide) return; // shared some other way on purpose
  try {
    file.setSharing(companyWide ? access : DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.EDIT);
  } catch (e) {
    console.error('Could not share "' + file.getName() + '": ' + e);
  }
}

function forwardGeminiEmails_() {
  var props = PropertiesService.getScriptProperties();
  var startedAt = Number(props.getProperty('forwardingStartedAt'));
  if (!startedAt) {
    startedAt = Date.now();
    props.setProperty('forwardingStartedAt', String(startedAt));
  }
  GmailApp.search('from:gemini-notes@google.com newer_than:7d').forEach(function (thread) {
    thread.getMessages().forEach(function (msg) {
      var key = 'msg:' + msg.getId();
      if (props.getProperty(key) === '1' || msg.getDate().getTime() < startedAt) return;
      var file = notesDocFromEmail_(msg.getBody());
      if (file === undefined) return; // not readable yet, try next run
      if (file) {
        shareWithCompany_(file);
        msg.forward(SITE.notesNotifyEmail, { name: SITE.brand.senderName });
      }
      props.setProperty(key, '1');
    });
  });
}

// The notes doc linked from a Gemini email: the file, null if it isn't one
// of this brand's calls, or undefined if it can't be opened yet.
function notesDocFromEmail_(html) {
  var text = String(html).replace(/%2F/gi, '/');
  var re = /document\/d\/([A-Za-z0-9_-]{20,})/g;
  var ids = {}, m, unreadable = false;
  while ((m = re.exec(text)) !== null) ids[m[1]] = true;
  for (var id in ids) {
    var file;
    try { file = DriveApp.getFileById(id); } catch (e) { unreadable = true; continue; }
    if (isNotesDoc_(file.getName())) return file;
  }
  return unreadable ? undefined : null;
}

function isDone_(id) { return PropertiesService.getScriptProperties().getProperty('done:' + id) === '1'; }
function markDone_(id) { PropertiesService.getScriptProperties().setProperty('done:' + id, '1'); }

// ════════════════════════════════════════════════════════════
// Setup — run once from the editor (choose "setup", click Run)
// ════════════════════════════════════════════════════════════

function setup() {
  var me = Session.getEffectiveUser().getEmail();
  var cal = Calendar.Calendars.get(SETTINGS.calendarId);
  console.log('Running as ' + me + '. Bookings calendar: "' + cal.summary + '".');
  var aliases = GmailApp.getAliases();
  Object.keys(SETTINGS.sites).forEach(function (key) {
    var site = SETTINGS.sites[key];
    console.log(aliases.indexOf(site.fromAlias) !== -1
      ? site.brand.name + ' customer emails will come from ' + site.fromAlias + '.'
      : 'NOTE: ' + site.fromAlias + ' is not a "Send mail as" address in this Gmail, so ' + site.brand.name + ' customer emails will come from ' + me + ' (replies still go to ' + site.replyTo + ').');
  });

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (['sendReminders', 'processNewNotes'].indexOf(t.getHandlerFunction()) !== -1) ScriptApp.deleteTrigger(t);
  });
  if (SETTINGS.sendReminders) {
    ScriptApp.newTrigger('sendReminders').timeBased().everyDays(1).atHour(9).inTimezone(TZ).create();
    console.log('Daily reminders scheduled (9–10am).');
  }
  if (SETTINGS.shareNotes) {
    DriveApp.getRootFolder(); // ask for Drive access now
    ScriptApp.newTrigger('processNewNotes').timeBased().everyMinutes(10).create();
    console.log('Gemini notes sharing scheduled (every 10 minutes).');
  }
  console.log('Setup complete.');
}
