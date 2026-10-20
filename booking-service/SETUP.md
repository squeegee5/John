# Booking service: setup

`Code.gs` is a Google Apps Script web app. The enquiry form sends booking
details to it; it creates the calendar booking and Google Meet and sends the
emails from the account that deploys it. The web page then holds no Google
login.

For Mike Ayres Design it runs in **nick@mikeayresdesign.co.uk**.

## 1. Let Nick's Gmail send as design-visit@ (recommended)

Without this, customer emails come from nick@mikeayresdesign.co.uk (replies
still go to design-visit@).

1. Signed in as Nick, open Gmail → ⚙ → **See all settings** → **Accounts**.
2. **Send mail as** → **Add another email address**.
3. Name: `Mike Ayres Design Team`. Email: `design-visit@mikeayresdesign.co.uk`.
   Leave **Treat as an alias** ticked → **Next step**.
4. If asked to verify, a code is emailed to the design-visit@ group: open it
   and enter the code (or click the link).

## 2. Create the script

1. Signed in as Nick, go to <https://script.google.com> → **New project**.
2. Rename it (top left) to `MAD Booking Service`.
3. Delete everything in `Code.gs`, paste the whole of `booking-service/Code.gs`, click **Save**.
4. Left sidebar: **Services +** → **Google Calendar API** → **Add**.
5. In the function dropdown (top toolbar) choose **setup** → **Run**.
   Approve the permissions (Nick's account → Allow).
6. The log should say `Running as nick@mikeayresdesign.co.uk. Bookings calendar: "Sensory Design Video/Call".`
   and whether customer emails will come from design-visit@.

## 3. Publish it

1. **Deploy** → **New deployment** → ⚙ next to "Select type" → **Web app**.
2. Description: `Booking form`. Execute as: **Me (nick@mikeayresdesign.co.uk)**.
   Who has access: **Anyone**.
3. **Deploy**, approve if asked, and copy the **Web app URL** (ends in `/exec`).
4. Send that URL to be added to the form (`bookingService.url` in `mike-ayres-design/js/config.js`).

If **Anyone** isn't offered, the Google Workspace admin needs to allow web
apps to be shared outside the organisation.

## 4. After the form is switched over

In John's **Southpaw and MAD – 24hr Reminder** script, delete the `mad: { … },`
block in `BRANDS` and save, otherwise MAD customers get two reminders. Nick's
script now sends them.

## Updating the code later

Paste the new code, **Save**, then **Deploy → Manage deployments** → ✏ →
Version: **New version** → **Deploy**. The URL stays the same.
