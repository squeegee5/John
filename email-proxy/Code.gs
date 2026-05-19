/**
 * Google Apps Script Email Proxy
 * Receives POST requests from the Southpaw/MAD booking forms
 * and sends the company notification email server-side.
 *
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to https://script.google.com while logged into john@southpaw.co.uk
 * 2. Click "New project"
 * 3. Paste this entire file into the editor (replace any existing code)
 * 4. Click the project name ("Untitled project") and rename to "Email Proxy"
 * 5. Click "Deploy" > "New deployment"
 * 6. Click the gear icon next to "Select type" and choose "Web app"
 * 7. Set "Execute as" to "Me (john@southpaw.co.uk)"
 * 8. Set "Who has access" to "Anyone"
 * 9. Click "Deploy"
 * 10. Authorize the app when prompted (click through the "unsafe" warning)
 * 11. Copy the Web app URL (looks like: https://script.google.com/macros/s/XXXX/exec)
 * 12. Give the URL to complete the setup
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (!data.to || !data.subject || !data.htmlBody) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing required fields: to, subject, htmlBody'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var options = {
      htmlBody: data.htmlBody,
      name: data.fromName || 'Southpaw Design Team'
    };

    if (data.replyTo) {
      options.replyTo = data.replyTo;
    }

    // Use alias if specified (design-visit@southpaw.co.uk)
    if (data.from) {
      options.from = data.from;
    }

    GmailApp.sendEmail(data.to, data.subject, '', options);

    return ContentService.createTextOutput(JSON.stringify({
      success: true
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'Email proxy is running',
    usage: 'POST with JSON body: {to, subject, htmlBody, fromName, from, replyTo}'
  })).setMimeType(ContentService.MimeType.JSON);
}
