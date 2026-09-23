# Sensory Room Booking System - Setup Guide

## Quick Start (Local Development)

Open `index.html` in a browser to preview the booking system locally.

## How It Works

The system is a single-page app built with vanilla HTML/CSS/JS (no frameworks needed):

| File | Purpose |
|------|---------|
| `index.html` | Main page structure |
| `css/styles.css` | All styles, responsive design |
| `js/config.js` | **Edit this to change content, images, designers, calendar settings** |
| `js/calendar.js` | Calendar booking component |
| `js/app.js` | Quiz logic, navigation, form handling, email submission |

## User Flow

```
Landing Page
├── "Choose Your Room Type"
│   ├── Room Type (SI, MSE, Soft Play, etc.)
│   ├── Age Group (0-5, 6-12, 13-18, Older)
│   ├── Room Size (Small, Medium, Large, Various)
│   ├── Equipment (multi-select, 16 options)
│   ├── Contact Details
│   ├── ✅ Confirmation → email sent
│   └── Offer: "Choose Your Designer" →
│
└── "Choose Your Designer"
    ├── Select Designer (4 designers with bios)
    ├── Calendar Booking (Mon-Thu 9-4, Fri 9-1)
    ├── Contact Details (skipped if already filled)
    ├── ✅ Confirmation → email sent
    └── Offer: "Choose Your Room Type" →
```

## Editing Content

All editable content is in `js/config.js`. Key sections:

### Adding Images

Replace the empty `image: ''` fields with image URLs:

```js
{
  id: 'si',
  title: 'SI',
  description: 'Sensory Integration',
  image: 'https://cdn.shopify.com/s/files/1/your-store/files/si-room.jpg',
}
```

**Image recommendations:**
- Quiz cards: 400x300px (4:3 ratio)
- Designer photos: 400x400px (1:1 ratio, displayed in circle)
- Landing page cards: 600x400px (3:2 ratio)
- Use `.jpg` or `.webp` format

### Updating Designer Profiles

```js
designers: [
  {
    id: 'designer-1',
    name: 'Jane Smith',
    role: 'Senior Sensory Room Designer',
    bio: 'Your bio text here...',
    image: 'https://cdn.shopify.com/s/files/1/your-store/files/jane.jpg',
  },
  // ... more designers
]
```

### Changing Calendar Schedule

```js
calendar: {
  schedule: {
    1: { start: 9, end: 16, label: 'Monday' },    // Mon 9am-4pm
    2: { start: 9, end: 16, label: 'Tuesday' },
    3: { start: 9, end: 16, label: 'Wednesday' },
    4: { start: 9, end: 16, label: 'Thursday' },
    5: { start: 9, end: 13, label: 'Friday' },     // Fri 9am-1pm
  },
  blockedHours: [12], // 12pm-1pm blocked for lunch
}
```

### Changing Colours

Edit the CSS variables at the top of `css/styles.css`:

```css
:root {
  --color-primary: #2c3e50;      /* Main dark colour */
  --color-accent: #e8a87c;       /* Warm accent */
  --color-bg-soft: #f8f6f3;      /* Light background */
}
```

## Shopify Integration

### Option A: Custom Page (Simplest)

1. **Upload files to Shopify:**
   - Go to **Settings > Files** in Shopify admin
   - Upload `css/styles.css`, `js/config.js`, `js/calendar.js`, `js/app.js`
   - Note the URLs Shopify gives you for each file

2. **Create a new page:**
   - Go to **Online Store > Pages > Add page**
   - Click the `<>` (HTML) button in the editor
   - Paste the contents of the `<div id="sensory-app">...</div>` from `index.html`
   - Add at the top:
     ```html
     <link rel="stylesheet" href="YOUR_SHOPIFY_CSS_URL">
     ```
   - Add at the bottom:
     ```html
     <script src="YOUR_SHOPIFY_CONFIG_JS_URL"></script>
     <script src="YOUR_SHOPIFY_CALENDAR_JS_URL"></script>
     <script src="YOUR_SHOPIFY_APP_JS_URL"></script>
     ```

### Option B: Custom Page Template (Recommended)

1. **Upload JS/CSS files** to Shopify Files as above

2. **Create a custom template:**
   - Go to **Online Store > Themes > Edit code**
   - Under **Templates**, add a new template: `page.booking.liquid`
   - Paste:
     ```liquid
     {% section 'booking-system' %}
     ```

3. **Create the section:**
   - Under **Sections**, add: `booking-system.liquid`
   - Paste the full HTML from `index.html` (the `<div id="sensory-app">...</div>` part)
   - Include the CSS inline in a `<style>` tag or link to uploaded files
   - Include the JS via `<script>` tags

4. **Assign the template:**
   - Create a new page
   - Set its template to `page.booking`

## Email Setup

The system uses [FormSubmit.co](https://formsubmit.co/) to send emails to `design-visit@somatogroup.co.uk`.

**First-time setup:**
1. The first form submission will trigger a verification email from FormSubmit.co
2. Click the verification link in the email
3. All subsequent submissions will go directly to your inbox

**Email format:**
Each submission includes all data the customer selected (room type, age, size, equipment, designer, appointment slot, contact details).

**To change the email address:**
Edit `formAction` in `js/config.js`:
```js
formAction: 'https://formsubmit.co/ajax/your-new-email@example.com',
```

## External Links

Set these URLs in `js/config.js`:
```js
designBookUrl: '/pages/design-book',       // Your Design Book page
designProcessUrl: '/pages/design-process', // Your Design Process page
```
