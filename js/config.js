/**
 * ============================================================
 * SENSORY ROOM BOOKING SYSTEM - CONFIGURATION
 * ============================================================
 * Edit this file to change all content, images, and settings.
 * ============================================================
 */

const CONFIG = {

  // ── General Settings ──────────────────────────────────────
  siteName: 'Southpaw Sensory Room Design',
  heroTitle: 'Design Your Sensory Room',
  heroSubtitle: 'Start your journey to creating the perfect sensory environment. Choose where you\'d like to begin.',
  emailTo: 'design-visit@somatogroup.co.uk',
  formAction: 'https://formsubmit.co/ajax/design-visit@somatogroup.co.uk',

  // ── External Links ────────────────────────────────────────
  designBookUrl: '/pages/design-book',
  designProcessUrl: '/pages/design-process',

  // ── Google Calendar Integration ─────────────────────────
  googleCalendar: {
    calendarId: 'c_a5f29fda9f946928e38859e140e427d27c046af14517c7c3713ac7a1cd2d9aa0@group.calendar.google.com',
    apiKey: 'AIzaSyBOibqLNgZ_EojAKcdLH1_13zF819wSX3I',
    clientId: '',  // Set in Shopify page directly
    clientSecret: '',  // Set in Shopify page directly
    // After running auth-setup.html once, paste your refresh token here:
    refreshToken: '',
  },

  // ── Landing Page Cards ────────────────────────────────────
  landingCards: {
    room: {
      title: 'Choose Your Room',
      description: 'Tell us about the type of sensory room you\'d like to create and we\'ll help bring your vision to life.',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/choose_your_room.jpg?v=1770835035',
    },
    designer: {
      title: 'Choose Your Designer',
      description: 'Meet our expert sensory room designers and book a free consultation at a time that suits you.',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/choose1.png?v=1770893310',
    }
  },

  // ── Room Type Options (7 options, multi-select, 2-per-row) ──
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
      image: '',
    },
    {
      id: 'de-escalation',
      title: 'De-escalation',
      description: 'De-escalation Room',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/de-escalation.png?v=1770916420',
    },
    {
      id: 'projection',
      title: 'Projection',
      description: 'Immersive Projection',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/projector.jpg?v=1770915105',
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
    { id: 'bubble-tubes',       title: 'Bubble Tubes',            image: '' },
    { id: 'swings',             title: 'Swings',                  image: '' },
    { id: 'projectors',         title: 'Projector/s',             image: '' },
    { id: 'tactile-panels',     title: 'Tactile Panels',          image: '' },
    { id: 'tactile-mural',      title: 'Tactile Mural',           image: '' },
    { id: 'soft-play-elements', title: 'Soft Play Elements',      image: '' },
    { id: 'padding',            title: 'Padding',                 image: '' },
    { id: 'vibration',          title: 'Vibration',               image: '' },
    { id: 'lighting',           title: 'Lighting / Fibre Optics', image: '' },
    { id: 'interactive-panels', title: 'Interactive Panels',       image: '' },
    { id: 'weight-resistance',  title: 'Weight / Resistance',     image: '' },
    { id: 'balance',            title: 'Balance',                 image: '' },
    { id: 'ball-pool',          title: 'Ball Pool',               image: '' },
    { id: 'climbing',           title: 'Climbing',                image: '' },
    { id: 'seating',            title: 'Seating',                 image: '' },
  ],

  // ── Designers ─────────────────────────────────────────────
  designers: [
    {
      id: 'designer-1',
      name: 'Gemma',
      role: 'Senior Sensory Room Designer',
      bio: 'With years of experience designing sensory environments, specialising in multi-sensory rooms and sensory integration spaces.',
      image: 'https://cdn.shopify.com/s/files/1/0652/8044/2581/files/gemma.webp?v=1770836704',
    },
    {
      id: 'designer-2',
      name: 'Designer Two',
      role: 'Sensory Room Designer',
      bio: 'Passionate about creating engaging sensory spaces for children and young people, with expertise in soft play and interactive environments.',
      image: '',
    },
    {
      id: 'designer-3',
      name: 'Designer Three',
      role: 'Sensory Room Designer',
      bio: 'Specialising in projection and immersive environments, bringing cutting-edge technology to sensory room design.',
      image: '',
    },
    {
      id: 'designer-4',
      name: 'Designer Four',
      role: 'Sensory Room Designer',
      bio: 'Expert in de-escalation and therapeutic environments, creating calming spaces that make a real difference.',
      image: '',
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
    slotDuration: 60,
    calendarNote: 'Initial consultations typically last 15-20 minutes, but we book a full hour slot to ensure we have plenty of time to discuss your project.',
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
      title: 'What Equipment Might You Need?',
      subtitle: '',
    },
    designer: {
      title: 'Choose Your Designer',
      subtitle: 'Meet our team of expert sensory room designers.',
    },
    calendar: {
      title: 'Book Your Consultation',
      subtitle: 'Select a convenient date and time for your free design consultation.',
    },
    contact: {
      title: 'Your Details',
      subtitle: 'Please provide your contact information so we can get in touch.',
    },
  },
};
