# Project notes

- **MAD photo gallery link:** always use `https://www.mikeayresdesign.co.uk/pages/sensory-gallery-v2`
  (Design Book: `…/sensory-gallery-v2#design-book`). Never link to the old
  `/pages/sensory-room-photos` page.
- Southpaw and MAD share `js/app.js` and `js/calendar.js` (copy root → `mike-ayres-design/js/`);
  per-brand differences belong in each `js/config.js`.
- MAD form CSS must stay scoped to `#sensory-app` — the Boost theme reuses class names like `.btn`.
- **MAD form images live in the theme**, not `config.js`: `sections/design-form-images.liquid`
  (repo copy: `mike-ayres-design/theme/`), rendered by the page template `page.design-consultation`.
  It overrides the config images, which are only a fallback — change images there (or via
  `mike-ayres-design/gallery/form-image-manager.html`), not in `config.js`.
- MAD gallery images: `sections/sp-gallery-section-v2.liquid`, edited with
  `mike-ayres-design/gallery/image-manager.html`.
- **Booking service:** `booking-service/Code.gs` is an Apps Script web app (same file deployed
  twice: Nick's copy serves MAD and runs MAD's reminders/notes via `jobsAccount`; John's copy serves
  Southpaw). When `bookingService.url` is set in a brand's config, the form
  sends bookings to it and the build leaves the Google login out of the page. Customer emails
  are built inside the script; keep its templates in step with `buildCustomerEmailHtml` in app.js.
