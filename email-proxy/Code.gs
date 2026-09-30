/**
 * Google Apps Script Email Proxy — with detailed logging
 *
 * IMPORTANT: After updating this code, you must REDEPLOY:
 * 1. Click "Deploy" > "Manage deployments"
 * 2. Click the pencil icon (Edit) next to the existing deployment
 * 3. Change "Version" to "New version"
 * 4. Click "Deploy"
 * 5. The URL stays the same — no need to update anywhere else
 */

function doPost(e) {
  var log = {
    received: new Date().toISOString(),
    hasPostData: !!(e && e.postData),
    contentLength: e && e.postData ? e.postData.length : 0,
    contentType: e && e.postData ? e.postData.type : null,
    parameters: e ? Object.keys(e.parameters || {}) : []
  };

  try {
    if (!e || !e.postData || !e.postData.contents) {
      Logger.log('NO POST DATA: ' + JSON.stringify(log));
      return ContentService.createTextOutput(JSON.stringify({
        success: false, error: 'no_post_data', log: log
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      log.parseError = parseErr.toString();
      log.rawSnippet = e.postData.contents.substring(0, 200);
      Logger.log('JSON PARSE FAILED: ' + JSON.stringify(log));
      return ContentService.createTextOutput(JSON.stringify({
        success: false, error: 'parse_failed', log: log
      })).setMimeType(ContentService.MimeType.JSON);
    }

    log.to = data.to;
    log.subject = data.subject;
    log.htmlBodyLength = data.htmlBody ? data.htmlBody.length : 0;
    log.from = data.from;
    log.activeUser = Session.getActiveUser().getEmail();
    log.effectiveUser = Session.getEffectiveUser().getEmail();

    if (!data.to || !data.subject || !data.htmlBody) {
      Logger.log('MISSING FIELDS: ' + JSON.stringify(log));
      return ContentService.createTextOutput(JSON.stringify({
        success: false, error: 'missing_fields', log: log
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var options = {
      htmlBody: data.htmlBody,
      name: data.fromName || 'Southpaw Design Team'
    };
    if (data.replyTo) options.replyTo = data.replyTo;
    if (data.from) {
      try {
        var aliases = GmailApp.getAliases();
        log.availableAliases = aliases;
        if (aliases.indexOf(data.from) !== -1) {
          options.from = data.from;
          log.usingAlias = data.from;
        } else {
          log.aliasNotAvailable = data.from;
        }
      } catch (aliasErr) {
        log.aliasError = aliasErr.toString();
      }
    }

    GmailApp.sendEmail(data.to, data.subject, '', options);
    log.sent = true;
    Logger.log('EMAIL SENT: ' + JSON.stringify(log));

    return ContentService.createTextOutput(JSON.stringify({
      success: true, log: log
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    log.error = err.toString();
    log.stack = err.stack ? err.stack.substring(0, 500) : null;
    Logger.log('EXCEPTION: ' + JSON.stringify(log));
    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: err.toString(), log: log
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'Email proxy is running',
    activeUser: Session.getActiveUser().getEmail(),
    effectiveUser: Session.getEffectiveUser().getEmail(),
    aliases: GmailApp.getAliases()
  })).setMimeType(ContentService.MimeType.JSON);
}
