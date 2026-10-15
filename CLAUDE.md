# Project notes

- **MAD photo gallery link:** always use `https://www.mikeayresdesign.co.uk/pages/sensory-gallery-v2`
  (Design Book: `…/sensory-gallery-v2#design-book`). Never link to the old
  `/pages/sensory-room-photos` page.
- Southpaw and MAD share `js/app.js` and `js/calendar.js` (copy root → `mike-ayres-design/js/`);
  per-brand differences belong in each `js/config.js`.
- MAD form CSS must stay scoped to `#sensory-app` — the Boost theme reuses class names like `.btn`.
