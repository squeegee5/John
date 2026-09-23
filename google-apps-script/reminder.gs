/**
 * ============================================================
 * SENSORY DESIGN – 24-HOUR CONSULTATION REMINDER
 * ============================================================
 * Google Apps Script that runs daily via a time-driven trigger.
 * It checks the shared design calendar for events happening
 * tomorrow and sends a branded reminder email to the customer.
 *
 * Supports BOTH brands:
 *  - Southpaw (events starting with "Southpaw Design Call:")
 *    → sends from design-visit@southpaw.co.uk
 *  - Mike Ayres Design (events starting with "Mike Ayres Design Call:")
 *    → sends from design-visit@mikeayresdesign.co.uk
 *
 * SETUP:
 *  1. Go to https://script.google.com and create a new project
 *  2. Paste this entire file into the editor
 *  3. Run sendReminders() once manually and authorise the permissions
 *  4. Click Services (+) → add Google Calendar API
 *  5. Set up a daily trigger:
 *     - Click the clock icon (Triggers) in the left sidebar
 *     - Click "+ Add Trigger"
 *     - Function: sendReminders
 *     - Event source: Time-driven
 *     - Type: Day timer
 *     - Time of day: 9am to 10am
 *     - Click Save
 * ============================================================
 */

// ── Configuration ────────────────────────────────────────────
var CALENDAR_ID = 'c_a5f29fda9f946928e38859e140e427d27c046af14517c7c3713ac7a1cd2d9aa0@group.calendar.google.com';

// Brand configurations
var BRANDS = {
  southpaw: {
    prefix: 'Southpaw Design Call:',
    email: 'design-visit@southpaw.co.uk',
    name: 'Southpaw Design Team',
    subject: 'Reminder: your Southpaw design consultation is tomorrow',
    teamName: 'The Southpaw Team',
    galleryUrl: 'https://southpaw.co.uk/pages/sensory-room-photos',
    brandName: 'Southpaw',
  },
  mad: {
    prefix: 'Mike Ayres Design Call:',
    email: 'design-visit@mikeayresdesign.co.uk',
    name: 'Mike Ayres Design Team',
    subject: 'Reminder: your Mike Ayres Design consultation is tomorrow',
    teamName: 'The Mike Ayres Design Team',
    galleryUrl: 'https://mikeayresdesign.co.uk/pages/sensory-room-photos',
    brandName: 'Mike Ayres Design',
  },
};

// ── Main function (called by trigger) ────────────────────────
function sendReminders() {
  var calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  if (!calendar) {
    Logger.log('Calendar not found: ' + CALENDAR_ID);
    return;
  }

  // Get events for tomorrow
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var startOfDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0);
  var endOfDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59);

  var events = calendar.getEvents(startOfDay, endOfDay);
  Logger.log('Found ' + events.length + ' events tomorrow');

  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var title = event.getTitle();

    // Determine which brand this event belongs to
    var brand = null;
    for (var key in BRANDS) {
      if (title.indexOf(BRANDS[key].prefix) === 0) {
        brand = BRANDS[key];
        break;
      }
    }
    // Also support legacy "Consultation:" prefix (treat as Southpaw)
    if (!brand && title.indexOf('Consultation:') === 0) {
      brand = BRANDS.southpaw;
    }

    if (!brand) {
      Logger.log('Skipping non-consultation event: ' + title);
      continue;
    }

    var description = event.getDescription() || '';
    var customerInfo = parseDescription(description);

    if (!customerInfo.email) {
      Logger.log('No customer email found for event: ' + title);
      continue;
    }

    // Check if reminder was already sent (using event tag)
    if (event.getTag('reminderSent') === 'true') {
      Logger.log('Reminder already sent for: ' + title);
      continue;
    }

    // Build the time string
    var startTime = event.getStartTime();
    var timeStr = formatTime(startTime);
    var dateStr = formatDateLong(startTime);

    // Get Google Meet link from event
    var meetLink = getMeetLink(event);

    // Build and send the email
    var html = buildReminderHtml(customerInfo.firstName, dateStr, timeStr, meetLink, brand);

    try {
      GmailApp.sendEmail(customerInfo.email, brand.subject, '', {
        htmlBody: html,
        from: brand.email,
        name: brand.name,
        replyTo: brand.email,
      });

      // Mark as sent so we don't send duplicates
      event.setTag('reminderSent', 'true');
      Logger.log('[' + brand.brandName + '] Reminder sent to ' + customerInfo.email + ' for ' + title);
    } catch (e) {
      Logger.log('Failed to send reminder to ' + customerInfo.email + ': ' + e.message);
    }
  }
}

// ── Parse customer details from event description ────────────
function parseDescription(desc) {
  var info = { firstName: '', email: '' };

  var nameMatch = desc.match(/Name:\s*(.+)/);
  if (nameMatch) {
    var fullName = nameMatch[1].trim();
    info.firstName = fullName.split(' ')[0];
  }

  var emailMatch = desc.match(/Email:\s*([^\s\n]+@[^\s\n]+)/);
  if (emailMatch) {
    info.email = emailMatch[1].trim();
  }

  return info;
}

// ── Get Google Meet link from calendar event ─────────────────
function getMeetLink(event) {
  try {
    var desc = event.getDescription() || '';
    var meetMatch = desc.match(/https:\/\/meet\.google\.com\/[a-z\-]+/i);
    if (meetMatch) return meetMatch[0];
  } catch (e) {
    Logger.log('Error getting meet link: ' + e.message);
  }

  // Fallback: use Calendar Advanced Service if enabled
  try {
    var calEvent = Calendar.Events.get(CALENDAR_ID, event.getId().replace('@google.com', ''));
    if (calEvent.conferenceData && calEvent.conferenceData.entryPoints) {
      for (var i = 0; i < calEvent.conferenceData.entryPoints.length; i++) {
        if (calEvent.conferenceData.entryPoints[i].entryPointType === 'video') {
          return calEvent.conferenceData.entryPoints[i].uri;
        }
      }
    }
    if (calEvent.hangoutLink) return calEvent.hangoutLink;
  } catch (e) {
    Logger.log('Advanced Calendar API not available: ' + e.message);
  }

  return null;
}

// ── Build the reminder email HTML ────────────────────────────
function buildReminderHtml(firstName, dateStr, timeStr, meetLink, brand) {
  var html = '<div style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">';

  html += '<p>Dear ' + escapeHtml(firstName) + ',</p>';

  html += '<p>Just a quick reminder that your initial ' + escapeHtml(brand.brandName) + ' design consultation is scheduled for tomorrow, <strong>' + escapeHtml(dateStr) + '</strong> at <strong>' + escapeHtml(timeStr) + '</strong>.</p>';

  if (meetLink) {
    html += '<p>You can join the meeting here:<br><a href="' + escapeHtml(meetLink) + '" style="color: #1a73e8; font-weight: bold;">' + escapeHtml(meetLink) + '</a></p>';
  } else {
    html += '<p>Your meeting link will be included in your calendar invite.</p>';
  }

  html += '<p>The call will take around 15\u201320 minutes and will give us a chance to learn more about your space, your goals, and how we can best support your project.</p>';

  html += '<p>If you would prefer to speak via phone or WhatsApp instead, simply reply to this email and let us know, and we will happily arrange that.</p>';

  html += '<p>If you have any photos of the room, floor plans, measurements, or inspiration images you would like to share beforehand, please feel free to send them across. No problem at all if not. Also, feel free to check out our sensory room gallery <a href="' + escapeHtml(brand.galleryUrl) + '" style="color: #1a73e8;">here</a> for inspiration.</p>';

  html += '<p>We look forward to speaking with you.</p>';

  html += '<p>Warm regards,<br><strong>' + escapeHtml(brand.teamName) + '</strong></p>';

  html += '</div>';
  return html;
}

// ── Helpers ──────────────────────────────────────────────────

function formatTime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  var h = hours % 12;
  if (h === 0) h = 12;
  var m = minutes > 0 ? ':' + (minutes < 10 ? '0' : '') + minutes : ':00';
  return h + m + ampm;
}

function formatDateLong(date) {
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var months = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
  return days[date.getDay()] + ' ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Test function (run manually to verify) ───────────────────
function testReminders() {
  Logger.log('Testing reminder system...');
  sendReminders();
  Logger.log('Done. Check the Execution Log for details.');
}
