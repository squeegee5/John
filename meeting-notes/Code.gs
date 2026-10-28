/**
 * Consultation Notes Helper — Google Apps Script (runs as john@southpaw.co.uk)
 *
 * Every 10 minutes, for "Notes by Gemini" from booking-form calls only
 * (titles starting "Southpaw Design Call" / "Mike Ayres Design Call"):
 *   1. Shares the notes doc so anyone at Somato Group with the link can edit
 *      (company only — customers never get access)
 *   2. Forwards Gemini's own notes email to that brand's design-visit@
 *      address, after the doc is shared, so colleagues can open
 *      "View the full notes":
 *        Southpaw Design Call    → design-visit@southpaw.co.uk
 *
 * First-time setup: choose "setup" in the function dropdown, Run, approve.
 * Updating this code: just paste and save — the schedule keeps running.
 */

const SETTINGS = {
  // Calls whose notes are handled, and where each brand's notes are sent
  brands: [
    { prefix: 'Southpaw Design Call', notifyEmail: 'design-visit@southpaw.co.uk', senderName: 'Southpaw Design Team' },
    // Mike Ayres Design calls: not handled here. Nick hosts them and gets
    // Gemini's notes himself; nothing is forwarded to the team.
  ],
  notesTitleMarker: 'Notes by Gemini',
  geminiSender: 'gemini-notes@google.com',
  // Optional: folder ID (e.g. in a Shared Drive) to move notes into. '' = leave in place.
  moveToFolderId: '',
  settleMinutes: 5,
  lookbackDays: 7,
};

function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'processNewNotes') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('processNewNotes').timeBased().everyMinutes(10).create();
  backfillSharing();
}

function backfillSharing() {
  // Apps Script stops a run after 6 minutes, so stop early and let a re-run
  // pick up where this one left off (handled docs are skipped).
  var started = Date.now();
  var files = findNotes_(null);
  var shared = 0, handled = 0, remaining = 0;
  files.forEach(function (f) {
    if (isDone_(f.getId())) return;
    if (Date.now() - started > 4.5 * 60 * 1000) { remaining++; return; }
    if (shareWithCompany_(f)) shared++;
    markDone_(f.getId());
    handled++;
  });
  Logger.log('Backfill: handled ' + handled + ', newly shared ' + shared +
    (remaining ? ', ' + remaining + ' still to do. Run backfillSharing again.' : '. All done.'));
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
    markDone_(f.getId());
  });

  forwardGeminiEmails_();
}

/**
 * Forwards Gemini's notes email for each consultation call to design-visit@,
 * making sure the linked doc is shared first. Gemini emails that arrived
 * before this feature was switched on are never forwarded.
 */
function forwardGeminiEmails_() {
  var props = PropertiesService.getScriptProperties();
  var startedAt = Number(props.getProperty('forwardingStartedAt'));
  if (!startedAt) {
    startedAt = Date.now();
    props.setProperty('forwardingStartedAt', String(startedAt));
  }

  var threads = GmailApp.search('from:' + SETTINGS.geminiSender + ' newer_than:' + SETTINGS.lookbackDays + 'd');
  threads.forEach(function (thread) {
    thread.getMessages().forEach(function (msg) {
      var key = 'msg:' + msg.getId();
      if (props.getProperty(key) === '1') return;
      if (msg.getDate().getTime() < startedAt) return;
      if (msg.getFrom().indexOf(SETTINGS.geminiSender) === -1) return;

      var file = consultationDocFromEmail_(msg.getBody());
      if (file === undefined) return;          // doc not readable yet — try next run
      if (file) {                              // null = not a consultation call
        shareWithCompany_(file);
        var brand = brandFor_(file.getName());
        msg.forward(brand.notifyEmail, { name: brand.senderName });
      }
      props.setProperty(key, '1');
    });
  });
}

/**
 * Finds the Gemini notes doc linked from an email.
 * Returns the file, null if the email isn't for a consultation call, or
 * undefined if the doc couldn't be opened (so it's retried next run).
 */
function consultationDocFromEmail_(html) {
  var text = String(html).replace(/%2F/gi, '/');
  var re = /document\/d\/([A-Za-z0-9_-]{20,})/g;
  var ids = {}, m, sawUnreadable = false;
  while ((m = re.exec(text)) !== null) ids[m[1]] = true;

  for (var id in ids) {
    var file;
    try { file = DriveApp.getFileById(id); } catch (e) { sawUnreadable = true; continue; }
    if (isConsultationNotes_(file.getName())) return file;
  }
  return sawUnreadable ? undefined : null;
}

// ── Helpers ─────────────────────────────────────────────────

function brandFor_(name) {
  for (var i = 0; i < SETTINGS.brands.length; i++) {
    if (name.indexOf(SETTINGS.brands[i].prefix) === 0) return SETTINGS.brands[i];
  }
  return null;
}

function isConsultationNotes_(name) {
  return !!brandFor_(name) && name.indexOf(SETTINGS.notesTitleMarker) !== -1;
}

function findNotes_(since) {
  var q = "title contains '" + SETTINGS.notesTitleMarker + "'" +
    " and mimeType = 'application/vnd.google-apps.document'" +
    " and 'me' in owners and trashed = false";
  if (since) q += " and modifiedDate > '" + since.toISOString() + "'";

  var out = [];
  var it = DriveApp.searchFiles(q);
  while (it.hasNext()) {
    var f = it.next();
    if (isConsultationNotes_(f.getName())) out.push(f);
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

function isDone_(id) {
  return PropertiesService.getScriptProperties().getProperty('done:' + id) === '1';
}

function markDone_(id) {
  PropertiesService.getScriptProperties().setProperty('done:' + id, '1');
}
