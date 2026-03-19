/**
 * ============================================================
 * SOUTHPAW DESIGN – 24-HOUR CONSULTATION REMINDER
 * ============================================================
 * Google Apps Script that runs daily via a time-driven trigger.
 * It checks the Southpaw design calendar for events happening
 * tomorrow and sends a branded reminder email to the customer.
 *
 * SETUP:
 *  1. Go to https://script.google.com and create a new project
 *  2. Paste this entire file into the editor
 *  3. Update CALENDAR_ID and SEND_AS_EMAIL below if needed
 *  4. Run sendReminders() once manually and authorise the permissions
 *  5. Set up a daily trigger:
 *     - Click the clock icon (Triggers) in the left sidebar
 *     - Click "+ Add Trigger"
 *     - Function: sendReminders
 *     - Event source: Time-driven
 *     - Type: Day timer
 *     - Time of day: 9am to 10am (so reminders go out morning before)
 *     - Click Save
 *
 * The script reads each event's description to extract the
 * customer name and email, then sends the reminder via Gmail
 * using the design-visit@southpaw.co.uk alias.
 * ============================================================
 */

// ── Configuration ────────────────────────────────────────────
var CALENDAR_ID = 'c_a5f29fda9f946928e38859e140e427d27c046af14517c7c3713ac7a1cd2d9aa0@group.calendar.google.com';
var SEND_AS_EMAIL = 'design-visit@southpaw.co.uk';
var SUBJECT = 'Reminder: your Southpaw design consultation is tomorrow';

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

    // Only process Southpaw Design Call events
    if (title.indexOf('Southpaw Design Call:') !== 0 &&
        title.indexOf('Consultation:') !== 0) {
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
    var html = buildReminderHtml(customerInfo.firstName, dateStr, timeStr, meetLink);

    try {
      GmailApp.sendEmail(customerInfo.email, SUBJECT, '', {
        htmlBody: html,
        from: SEND_AS_EMAIL,
        name: 'Southpaw Design Team',
        replyTo: SEND_AS_EMAIL,
      });

      // Mark as sent so we don't send duplicates
      event.setTag('reminderSent', 'true');
      Logger.log('Reminder sent to ' + customerInfo.email + ' for ' + title);
    } catch (e) {
      Logger.log('Failed to send reminder to ' + customerInfo.email + ': ' + e.message);
    }
  }
}

// ── Parse customer details from event description ────────────
function parseDescription(desc) {
  var info = { firstName: '', email: '' };

  // Extract name (first line: "Name: First Last")
  var nameMatch = desc.match(/Name:\s*(.+)/);
  if (nameMatch) {
    var fullName = nameMatch[1].trim();
    info.firstName = fullName.split(' ')[0];
  }

  // Extract email
  var emailMatch = desc.match(/Email:\s*([^\s\n]+@[^\s\n]+)/);
  if (emailMatch) {
    info.email = emailMatch[1].trim();
  }

  return info;
}

// ── Get Google Meet link from calendar event ─────────────────
function getMeetLink(event) {
  // Try hangout link (Maps to conferenceData in Calendar API)
  try {
    // Apps Script doesn't expose conferenceData directly,
    // but we can use the Calendar Advanced Service or check description
    var desc = event.getDescription() || '';

    // Check for meet link in description
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
    // Also check hangoutLink
    if (calEvent.hangoutLink) return calEvent.hangoutLink;
  } catch (e) {
    // Calendar Advanced Service may not be enabled
    Logger.log('Advanced Calendar API not available: ' + e.message);
  }

  return null;
}

// ── Build the reminder email HTML ────────────────────────────
function buildReminderHtml(firstName, dateStr, timeStr, meetLink) {
  var html = '<div style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">';

  html += '<p>Dear ' + escapeHtml(firstName) + ',</p>';

  html += '<p>Just a quick reminder that your initial Southpaw design consultation is scheduled for tomorrow, <strong>' + escapeHtml(dateStr) + '</strong> at <strong>' + escapeHtml(timeStr) + '</strong>.</p>';

  if (meetLink) {
    html += '<p>You can join the meeting here:<br><a href="' + escapeHtml(meetLink) + '" style="color: #1a73e8; font-weight: bold;">' + escapeHtml(meetLink) + '</a></p>';
  } else {
    html += '<p>Your meeting link will be included in your calendar invite.</p>';
  }

  html += '<p>The call will take around 15\u201320 minutes and will give us a chance to learn more about your space, your goals, and how we can best support your project.</p>';

  html += '<p>If you would prefer to speak via phone or WhatsApp instead, simply reply to this email and let us know, and we will happily arrange that.</p>';

  html += '<p>If you have any photos of the room, floor plans, measurements, or inspiration images you would like to share beforehand, please feel free to send them across. No problem at all if not. Also, feel free to check out our sensory room gallery <a href="https://southpaw.co.uk/pages/sensory-room-photos" style="color: #1a73e8;">here</a> for inspiration.</p>';

  html += '<p>We look forward to speaking with you.</p>';

  html += '<p>Warm regards,<br><strong>The Southpaw Team</strong></p>';

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
