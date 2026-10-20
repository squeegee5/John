/**
 * ============================================================
 * SENSORY ROOM BOOKING SYSTEM - CONFIGURATION
 * ============================================================
 * Edit this file to change all content, images, and settings.
 * ============================================================
 */

const CONFIG = {

  // ── General Settings ──────────────────────────────────────
  siteName: 'Mike Ayres Design Sensory Room Design',
  heroTitle: 'Design Your Sensory Room',
  heroSubtitle: 'Start your journey to creating the perfect sensory environment. Choose where you\'d like to begin.',
  emailTo: 'design-visit@mikeayresdesign.co.uk',

  // ── Brand (wording, colours and links used by the shared app code) ──
  brand: {
    name: 'Mike Ayres Design',
    designLabel: 'Mike Ayres Design',        // "… Consultation Booked", "… Journey"
    senderName: 'Mike Ayres Design Team',    // From name on emails
    teamName: 'The Mike Ayres Design Team',  // email sign-off
    salesDirector: 'Nick',                   // named in the booking email
    hostEmail: 'nick@mikeayresdesign.co.uk', // hosts every call: gets Google's invite email
    callTitle: 'Mike Ayres Design Call',     // calendar event title prefix
    calendarColorId: '9',                    // blue dot on the shared calendar
    photosUrl: 'https://www.mikeayresdesign.co.uk/pages/sensory-gallery-v2',
    thankYouUrl: 'https://www.mikeayresdesign.co.uk/pages/thank-you',
    storageKey: 'mad_booking',
    pageChrome: 'boost',
    emailHeader: {
      background: '#ffffff',
      textColor: '#231f20',
      accent: '#ed1c2e',
      borderBottom: '4px solid #ed1c2e',
      logoUrl: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/mike_ayres_design_logo_email.png?v=1791996486&width=320',
      logoHeight: 72,
    },
  },

  // ── Design Consultations ──────────────────────────────────
  // Customers choose a video (Google Meet) or phone call, then a time.
  consultations: {
    enabled: true,
    callTypes: ['video', 'phone'],
    callTypeLabels: { video: 'Video call (Google Meet)', phone: 'Phone call' },
    typicalLength: 'around 15 minutes', // "Our initial discussion will take …" in the email
  },

  // "Anything else you'd like to tell us…" box on the contact step
  notesRequired: false,

  // ── External Links ────────────────────────────────────────
  designBookUrl: 'https://www.mikeayresdesign.co.uk/pages/sensory-gallery-v2#design-book',
  designProcessUrl: '/pages/design-process',

  // ── Email Signature Image ────────────────────────────────
  emailSignatureImage: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/SP_Email_Signature_3cd2d1d3-13f3-4fd4-b527-fb98fe4ace70.png?v=1772620100',

  // ── Booking service (Google Apps Script web app) ─────────
  // When set, the form talks to this script (booking-service/Code.gs) and
  // the page holds no Google login. Empty = old direct method.
  bookingService: {
    url: 'https://script.google.com/macros/s/AKfycbxmQIHpFgOIAncv-CQUaA505DpL5fcqv19rIeG_UnTw8jqLjoBvyUpor7Sb5auVTtI/exec',
  },

  // ── Google Calendar Integration ─────────────────────────
  googleCalendar: {
    calendarId: 'c_a5f29fda9f946928e38859e140e427d27c046af14517c7c3713ac7a1cd2d9aa0@group.calendar.google.com',
    apiKey: 'AIzaSyBOibqLNgZ_EojAKcdLH1_13zF819wSX3I',
    clientId: '',  // Set in Shopify page directly
    clientSecret: '',  // Set in Shopify page directly
    refreshToken: '',  // Set in Shopify page directly
  },

  // ── Landing Page Cards ────────────────────────────────────
  landingCards: {
    room: {
      title: 'Choose Your Room',
      description: 'Tell us about the type of sensory room you\'d like to create and we\'ll help bring your vision to life.',
      images: [
        'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/mad_room_3_softplay_blue.webp?v=1792075475&width=1000',
        'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/mad_room_1_immersive.webp?v=1792075475&width=1000',
        'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/mad_room_2_softplay.jpg?v=1792075475&width=1000',
        'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/mad_room_4_interactive_floor.jpg?v=1792075475&width=1000',
        'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/mad_room_5_tactile_mural.jpg?v=1792075475&width=1000',
      ],
    },
    designer: {
      title: 'Choose Your Designer',
      description: 'Meet our expert sensory room designers and book a free consultation at a time that suits you.',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/designerchoice.png?v=1770933730',
    }
  },

  // ── Room Type Options (8 options, multi-select, 3-per-row) ──
  roomTypes: [
    {
      id: 'si',
      title: 'SI',
      description: 'Sensory Integration',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/SI.webp?v=1770914146',
    },
    {
      id: 'mse',
      title: 'MSE',
      description: 'Multi-Sensory Environment',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/MSE.webp?v=1770914161',
    },
    {
      id: 'soft-play',
      title: 'Soft Play',
      description: 'Soft Play Area',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/soft_play.jpg?v=1770915081',
    },
    {
      id: 'de-escalation',
      title: 'De-escalation',
      description: 'De-escalation Room',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/deescalation_7.jpg?v=1772120397',
    },
    {
      id: 'projection',
      title: 'Projection',
      description: 'Immersive Projection',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/486309898_1393031628781579_1968299947873302313_n.jpg?v=1772324776',
    },
    {
      id: 'mural',
      title: 'Mural',
      description: 'Sensory Mural',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/mural.webp?v=1770916099',
    },
    {
      id: 'other',
      title: 'Other',
      description: 'Custom Room Type',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/other.png?v=1770916776',
    },
    {
      id: 'multiple-rooms',
      title: 'Multiple Rooms',
      description: 'More Than One Room',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/486760940_1232511201679375_685949428353330236_n.jpg?v=1772221577',
    },
  ],

  // ── Age Groups ────────────────────────────────────────────
  ageGroups: [
    { id: '0-5',   title: '0 - 5',   description: 'Early Years', image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/0-5.png?v=1770913562' },
    { id: '6-12',  title: '6 - 12',  description: 'Primary',     image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/6-12.png?v=1770913561' },
    { id: '13-18', title: '13 - 18', description: 'Secondary',   image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/18.png?v=1770913546' },
    { id: 'older', title: 'Older',   description: 'Adults',      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/older.png?v=1770913546' },
  ],

  // ── Room Sizes ────────────────────────────────────────────
  roomSizes: [
    { id: 'small',   title: 'Small',   description: 'Compact space',   image: '' },
    { id: 'medium',  title: 'Medium',  description: 'Standard room',   image: '' },
    { id: 'large',   title: 'Large',   description: 'Spacious area',   image: '' },
    { id: 'various', title: 'Various', description: 'Multiple sizes',  image: '' },
  ],

  // ── Equipment (multi-select) - 15 items, 5 per row ───────
  equipment: [
    { id: 'bubble-tubes',       title: 'Bubble Tubes',            image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/bubble_tube1_abdf2f81-f466-46b2-8837-520fcbc0981c.png?v=1772116758' },
    { id: 'swings',             title: 'Swings',                  image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/swing.jpg?v=1772114204' },
    { id: 'projectors',         title: 'Projector/s',             image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/projector.png?v=1772114204' },
    { id: 'tactile-panels',     title: 'Tactile Panels',          image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/panels.png?v=1772117311' },
    { id: 'tactile-mural',      title: 'Tactile Mural',           image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/murals.png?v=1772117310' },
    { id: 'soft-play-elements', title: 'Soft Play Elements',      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/soft_play_1f110b54-8e52-4490-b923-1f4fe3b164f2.jpg?v=1772117309' },
    { id: 'padding',            title: 'Padding',                 image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/Gemini_Generated_Image_d0svsud0svsud0sv.png?v=1772114210' },
    { id: 'vibration',          title: 'Vibration',               image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/vibration.png?v=1772117311' },
    { id: 'lighting',           title: 'Lighting / Fibre Optics', image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/Gemini_Generated_Image_j2ic8ej2ic8ej2ic.png?v=1772109759' },
    { id: 'interactive-panels', title: 'Interactive Panels',       image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/interactive_panels_e19f0654-e2a8-44cb-b9fe-5da33c9b2a54.jpg?v=1772114203' },
    { id: 'weight-resistance',  title: 'Weight / Resistance',     image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/weighted.webp?v=1772114202' },
    { id: 'balance',            title: 'Balance',                 image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/balance.png?v=1772114206' },
    { id: 'ball-pool',          title: 'Ball Pool',               image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/crash_pit_new_6478398c-c69e-480d-b9df-5852a83652d7.jpg?v=1772114205' },
    { id: 'climbing',           title: 'Climbing',                image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/climbing.jpg?v=1772114205' },
    { id: 'seating',            title: 'Seating',                 image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/seating.webp?v=1772114201' },
  ],

  // ── Designers (6 options, 3-per-row) ──────────────────────
  designers: [
    {
      id: 'designer-1',
      name: 'Gemma',
      role: 'Sensory Room Designer',
      bio: 'With years of experience designing sensory environments, specialising in multi-sensory rooms and sensory integration spaces.',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/gem.png?v=1772310022',
    },
    {
      id: 'designer-2',
      name: 'Priya',
      role: 'Sensory Room Designer',
      bio: 'Expert in de-escalation and therapeutic environments, creating calming spaces that make a real difference.',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/1.png?v=1772216644',
    },
    {
      id: 'designer-3',
      name: 'Natalia',
      role: 'Sensory Room Designer',
      bio: 'Known for creating immersive sensory spaces for SEND settings, with a strong focus on combining technology and therapeutic principles.',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/natalia_4.png?v=1772620086',
    },
    {
      id: 'designer-4',
      name: 'Mike',
      role: 'Sensory Room Designer',
      bio: 'Dedicated to designing inclusive environments that honour diverse sensory profiles, from high-energy soft play to tranquil retreat zones.',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/mike.png?v=1772452114',
    },
    {
      id: 'designer-5',
      name: 'John',
      role: 'Sensory Room Designer',
      bio: 'Expert in interactive multi-sensory rooms where programmable lighting and acoustic engineering empower users with complex needs.',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/john.png?v=1772451311',
    },
    {
      id: 'designer-any',
      name: 'Any',
      role: '',
      bio: 'No preference. Let us match you with the best available designer for your project.',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/any.png?v=1772452309',
    },
  ],

  // ── Calendar Settings ─────────────────────────────────────
  calendar: {
    weeksAhead: 4,
    minDaysAhead: 2,
    daysToShow: 3,
    schedule: {
      1: { start: 9, end: 16, label: 'Monday' },
      2: { start: 9, end: 16, label: 'Tuesday' },
      3: { start: 9, end: 16, label: 'Wednesday' },
      4: { start: 9, end: 16, label: 'Thursday' },
      5: { start: 9, end: 13, label: 'Friday' },
    },
    blockedHours: [12],
    mondayBlockedHours: [13, 14],
    slotsToShow: 0,      // 0 = show every free slot
    slotDuration: 20,    // each consultation is a 20-minute call…
    slotInterval: 30,    // …starting on the hour or half hour (9:00, 9:30, 10:00 …)
    bookingGap: 60,      // consultations start at least an hour apart, so a 9:00
                         // booking also rules out 9:30 (overruns + prep time)
    calendarNote: 'Initial consultations are 20-minute calls. Choose whichever time suits you best.',
    // ONLY these dates and times can be booked (24h clock, YYYY-MM-DD).
    // While this list has entries, the weekday schedule above is ignored.
    // Times already booked in the shared calendar are still unavailable.
    availabilityWindows: {
      '2026-10-20': [['09:00', '12:30'], ['14:30', '16:00']], // Tue 20 Oct
      '2026-10-21': [['10:30', '13:00'], ['14:30', '15:30']], // Wed 21 Oct
      '2026-10-26': [['08:30', '09:45'], ['15:00', '16:00']], // Mon 26 Oct
      '2026-10-27': [['09:00', '12:30'], ['14:30', '16:00']], // Tue 27 Oct
      '2026-10-29': [['09:00', '12:30'], ['14:30', '16:00']], // Thu 29 Oct
      '2026-11-03': [['09:00', '12:30'], ['13:30', '15:30']], // Tue 3 Nov
      '2026-11-04': [['09:00', '13:00'], ['15:00', '16:00']], // Wed 4 Nov
      '2026-11-05': [['09:30', '12:30'], ['14:30', '15:30']], // Thu 5 Nov
      '2026-11-09': [['08:30', '09:45'], ['15:30', '16:00']], // Mon 9 Nov
    },
    // UK Bank Holidays & Christmas closures (YYYY-MM-DD)
    blockedDates: [
      // 2026
      '2026-01-01', // New Year's Day
      '2026-04-03', // Good Friday
      '2026-04-06', // Easter Monday
      '2026-05-04', // Early May Bank Holiday
      '2026-05-25', // Spring Bank Holiday
      '2026-08-31', // Summer Bank Holiday
      '2026-12-23','2026-12-24','2026-12-25','2026-12-26','2026-12-27',
      '2026-12-28','2026-12-29','2026-12-30','2026-12-31',
      // 2027
      '2027-01-01', // New Year's Day
      '2027-03-26', // Good Friday
      '2027-03-29', // Easter Monday
      '2027-05-03', // Early May Bank Holiday
      '2027-05-31', // Spring Bank Holiday
      '2027-08-30', // Summer Bank Holiday
      '2027-12-23','2027-12-24','2027-12-25','2027-12-26','2027-12-27',
      '2027-12-28','2027-12-29','2027-12-30','2027-12-31',
    ],
  },

  // ── Section Headings ──────────────────────────────────────
  headings: {
    roomType: {
      title: 'Choose Your Room Type',
      subtitle: 'What type of sensory room are you looking for?',
    },
    age: {
      title: 'What Age Group?',
      subtitle: 'Select the primary age group for the room.',
    },
    size: {
      title: 'What Size Is Your Room?',
      subtitle: 'The size of the space where your sensory room will be.',
    },
    equipment: {
      title: 'What Sensory Equipment Might You Need?',
      subtitle: '',
    },
    designer: {
      title: 'Choose Your Designer',
      subtitle: 'Meet our team of expert sensory room designers.',
    },
    calendar: {
      title: 'Book Your Consultation',
      subtitle: 'Select a convenient date and time for your initial design consultation.',
    },
    contact: {
      title: 'Your Details',
      subtitle: 'Please provide your contact information so we can get in touch.',
    },
  },
};
