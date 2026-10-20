# Booking service: setup

`Code.gs` is a Google Apps Script web app. The enquiry form sends booking
details to it; it creates the calendar booking and Google Meet and sends the
emails from the account that deploys it. The web page then holds no Google
login.

One deployment serves both websites (the form says which site it is; see
`SETTINGS.sites`). It runs in **john@southpaw.co.uk**. For Mike Ayres Design,
customer emails come from design-visit@mikeayresdesign.co.uk, Nick
(`hostEmail`) gets Google's invite for every call, and new-booking emails go
to Nick with a Bcc to design-visit@. For Southpaw (enquiries only) emails come
from and go to design-visit@southpaw.co.uk. The existing
24-hour reminder and notes scripts carry on unchanged.

It can be moved to another account later (for example a dedicated bookings
account) by repeating these steps there and changing the form's URL.

## 1. Create the script

1. Signed in as John, go to <https://script.google.com> → **New project**.
2. Rename it (top left) to `MAD Booking Service`.
3. Delete everything in `Code.gs`, paste the whole of `booking-service/Code.gs`, click **Save**.
4. Left sidebar: **Services +** → **Google Calendar API** → **Add**.
5. In the function dropdown (top toolbar) choose **setup** → **Run** and approve the permissions.
6. The log should say `Bookings calendar: "Sensory Design Video/Call"` and
   `Customer emails will come from design-visit@mikeayresdesign.co.uk.`

## 2. Publish it

1. **Deploy** → **New deployment** → ⚙ next to "Select type" → **Web app**.
2. Description: `Booking form`. Execute as: **Me**. Who has access: **Anyone**.
3. **Deploy**, approve if asked, and copy the **Web app URL** (ends in `/exec`).
4. That URL goes in `bookingService.url` in both `js/config.js` (Southpaw) and
   `mike-ayres-design/js/config.js`.

If **Anyone** isn't offered, the Google Workspace admin needs to allow web
apps to be shared outside the organisation.

## Updating the code later

Paste the new code, **Save**, then **Deploy → Manage deployments** → ✏ →
Version: **New version** → **Deploy**. The URL stays the same.
