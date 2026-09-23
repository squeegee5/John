/**
 * Consultation Notes Helper — Google Apps Script
 *
 * Google Meet saves "Notes by Gemini" for every design call into the Drive of
 * the account that created the Meet link. The booking form creates events with
 * john@southpaw.co.uk, so every notes doc lands in John's Drive, shared with
 * nobody else, and only John gets the notes email.
 *
 * This script runs every 10 minutes as john@southpaw.co.uk and, for each new
 * notes doc from a booking-form call (titles starting "Southpaw Design Call" or
 * "Mike Ayres Design Call" — John's other meetings are never touched):
 *   1. Shares it so anyone at Somato Group with the link can edit
 *   2. Optionally moves it into a shared folder / Shared Drive
 *   3. Emails the notes and link to design-visit@southpaw.co.uk (once)
 *
 * Customers are never given access: sharing is company-only.
 *
 * SETUP (one time, about 2 minutes):
 *  1. Go to https://script.google.com signed in as john@southpaw.co.uk
 *     (check the account icon top-right — NOT a personal Gmail account)
 *  2. New project → paste this whole file over the placeholder code
 *  3. Rename the project "Consultation Notes Helper"
 *  4. Choose "setup" in the function dropdown at the top and click Run
 *  5. Approve the permissions prompt (Advanced → Go to project → Allow)
 *
 * setup() shares every existing consultation notes doc with the company
 * straight away (without emailing old ones), then schedules itself to run
 * every 10 minutes. Nothing needs deploying. Run setup() again at any time;
 * it replaces its own schedule rather than adding a second one.
 */

const SETTINGS = {
  // Only notes docs whose titles start with one of these are processed
  callTitlePrefixes: ['Southpaw Design Call', 'Mike Ayres Design Call'],
  notesTitleMarker: 'Notes by Gemini',

  // Who gets emailed when new notes are ready
  notifyEmail: 'design-visit@southpaw.co.uk',

  // Optional: ID of a Drive folder (e.g. a folder in a Shared Drive) to move
  // notes into. It's the long ID at the end of the folder's URL.
  // Leave as '' to keep notes where Google Meet puts them.
  moveToFolderId: '',

  // Wait this long after Gemini last wrote to the doc before processing it
  settleMinutes: 5,

  // How far back each run looks for new notes
  lookbackDays: 7,
};

function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'processNewNotes') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('processNewNotes').timeBased().everyMinutes(10).create();
  backfillSharing();
}

/**
 * Shares every existing consultation notes doc with the company and marks it
 * as handled, without emailing — so switching this on doesn't send a flood of
 * old notes to design-visit@.
 */
function backfillSharing() {
  var files = findNotes_(null);
  var shared = 0;
  files.forEach(function (f) {
    if (shareWithCompany_(f)) shared++;
    markDone_(f.getId());
  });
  Logger.log('Backfill: checked ' + files.length + ' notes docs, newly shared ' + shared + '.');
}

/**
 * Runs on the 10-minute schedule.
 */
function processNewNotes() {
  var since = new Date(Date.now() - SETTINGS.lookbackDays * 24 * 60 * 60 * 1000);
  var settledBefore = Date.now() - SETTINGS.settleMinutes * 60 * 1000;

  findNotes_(since).forEach(function (f) {
    if (isDone_(f.getId())) return;
    if (f.getLastUpdated().getTime() > settledBefore) return; // Gemini may still be writing

    shareWithCompany_(f);
    moveIfConfigured_(f);
    emailNotes_(f);
    markDone_(f.getId());
  });
}

// ── Helpers ─────────────────────────────────────────────────

function findNotes_(since) {
  var q = "title contains '" + SETTINGS.notesTitleMarker + "'" +
    " and mimeType = 'application/vnd.google-apps.document'" +
    " and 'me' in owners and trashed = false";
  if (since) q += " and modifiedDate > '" + since.toISOString() + "'";

  var out = [];
  var it = DriveApp.searchFiles(q);
  while (it.hasNext()) {
    var f = it.next();
    var name = f.getName();
    var isConsultation = SETTINGS.callTitlePrefixes.some(function (p) {
      return name.indexOf(p) === 0;
    });
    if (isConsultation && name.indexOf(SETTINGS.notesTitleMarker) !== -1) out.push(f);
  }
  return out;
}

/**
 * Makes the doc editable by anyone at the company with the link. Only acts on
 * docs that are private, or company-shared without edit rights — never
 * touches a doc someone has deliberately shared more widely.
 */
function shareWithCompany_(file) {
  var access = file.getSharingAccess();
  var perm = file.getSharingPermission();
  var companyWide = access === DriveApp.Access.DOMAIN || access === DriveApp.Access.DOMAIN_WITH_LINK;

  if (companyWide && perm === DriveApp.Permission.EDIT) return false;
  if (access !== DriveApp.Access.PRIVATE && !companyWide) return false;

  try {
    file.setSharing(companyWide ? access : DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.EDIT);
    return true;
  } catch (e) {
    Logger.log('Could not share "' + file.getName() + '": ' + e);
    return false;
  }
}

function moveIfConfigured_(file) {
  if (!SETTINGS.moveToFolderId) return;
  try {
    file.moveTo(DriveApp.getFolderById(SETTINGS.moveToFolderId));
  } catch (e) {
    Logger.log('Could not move "' + file.getName() + '": ' + e);
  }
}

function emailNotes_(file) {
  var callName = file.getName()
    .replace(new RegExp('\\s*[–-]\\s*' + SETTINGS.notesTitleMarker + '\\s*$'), '');

  var notesText = '';
  try {
    notesText = DocumentApp.openById(file.getId()).getBody().getText().trim();
    if (notesText.length > 8000) notesText = notesText.slice(0, 8000) + '\n…';
  } catch (e) {
    Logger.log('Could not read "' + file.getName() + '": ' + e);
  }

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#333;line-height:1.5;max-width:640px;">' +
    '<p>Notes from <strong>' + escapeHtml_(callName) + '</strong> are ready. ' +
    'Anyone at Southpaw can open and edit them.</p>' +
    '<p><a href="' + file.getUrl() + '" style="color:#1a73e8;font-weight:bold;">Open the notes</a></p>' +
    (notesText
      ? '<hr style="border:none;border-top:1px solid #ddd;">' +
        '<div style="white-space:pre-wrap;font-size:14px;">' + escapeHtml_(notesText) + '</div>'
      : '') +
    '</div>';

  GmailApp.sendEmail(
    SETTINGS.notifyEmail,
    'Consultation notes: ' + callName,
    'Notes from ' + callName + ':\n' + file.getUrl() + '\n\n' + notesText,
    { htmlBody: html, name: 'Southpaw Consultation Notes' }
  );
}

function isDone_(id) {
  return PropertiesService.getScriptProperties().getProperty('done:' + id) === '1';
}

function markDone_(id) {
  PropertiesService.getScriptProperties().setProperty('done:' + id, '1');
}

function escapeHtml_(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
