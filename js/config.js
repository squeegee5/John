/**
 * ============================================================
 * SENSORY ROOM BOOKING SYSTEM - CONFIGURATION
 * ============================================================
 *
 * Edit this file to change:
 * - Quiz options (images, titles, descriptions)
 * - Designer profiles
 * - Calendar settings
 * - Contact form fields
 * - Email settings
 * - Link URLs
 *
 * IMAGE TIPS:
 * - Recommended image size: 400x300px (4:3 ratio)
 * - Use .jpg or .webp for photos, .svg for icons
 * - Upload images to Shopify Files (Settings > Files)
 *   then paste the URL here
 * - Or use any image hosting URL
 * ============================================================
 */

const CONFIG = {

  // ── General Settings ──────────────────────────────────────
  siteName: 'Southpaw Sensory Room Design',
  heroTitle: 'Design Your Sensory Room',
  heroSubtitle: 'Start your journey to creating the perfect sensory environment. Choose where you\'d like to begin.',
  emailTo: 'design-visit@somatogroup.co.uk',

  // FormSubmit.co endpoint (replace with your verified email hash if needed)
  // First submission will require email verification from FormSubmit.co
  formAction: 'https://formsubmit.co/ajax/design-visit@somatogroup.co.uk',

  // ── External Links ────────────────────────────────────────
  designBookUrl: '/pages/design-book',       // Change to your Design Book page URL
  designProcessUrl: '/pages/design-process', // Change to your Design Process page URL

  // ── Landing Page Cards ────────────────────────────────────
  landingCards: {
    room: {
      title: 'Choose Your Room Type',
      description: 'Tell us about the sensory room you\'d like to create and we\'ll help bring your vision to life.',
      // Replace with your image URL:
      image: '',
    },
    designer: {
      title: 'Choose Your Designer',
      description: 'Meet our expert sensory room designers and book a free consultation at a time that suits you.',
      // Replace with your image URL:
      image: '',
    }
  },

  // ── Room Type Options ─────────────────────────────────────
  // Section 1: Room Type
  roomTypes: [
    {
      id: 'si',
      title: 'SI',
      description: 'Sensory Integration',
      // Replace with your image URL:
      image: '',
    },
    {
      id: 'mse',
      title: 'MSE',
      description: 'Multi-Sensory Environment',
      image: '',
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
      image: '',
    },
    {
      id: 'projection',
      title: 'Projection',
      description: 'Immersive Projection',
      image: '',
    },
    {
      id: 'mural',
      title: 'Mural',
      description: 'Sensory Mural',
      image: '',
    },
    {
      id: 'other-multiple',
      title: 'Other / Multiple Rooms',
      description: 'Custom or Multiple Rooms',
      image: '',
    },
  ],

  // Section 2: Age Group
  ageGroups: [
    {
      id: '0-5',
      title: '0 - 5',
      description: 'Early Years',
      image: '',
    },
    {
      id: '6-12',
      title: '6 - 12',
      description: 'Primary',
      image: '',
    },
    {
      id: '13-18',
      title: '13 - 18',
      description: 'Secondary',
      image: '',
    },
    {
      id: 'older',
      title: 'Older',
      description: 'Adults',
      image: '',
    },
  ],

  // Section 3: Room Size
  roomSizes: [
    {
      id: 'small',
      title: 'Small',
      description: 'Compact space',
      image: '',
    },
    {
      id: 'medium',
      title: 'Medium',
      description: 'Standard room',
      image: '',
    },
    {
      id: 'large',
      title: 'Large',
      description: 'Spacious area',
      image: '',
    },
    {
      id: 'various',
      title: 'Various',
      description: 'Multiple sizes',
      image: '',
    },
  ],

  // Section 4: Equipment (multi-select)
  equipment: [
    { id: 'bubble-tubes',     title: 'Bubble Tubes',          image: '' },
    { id: 'swings',           title: 'Swings',                image: '' },
    { id: 'projectors',       title: 'Projector/s',           image: '' },
    { id: 'tactile-panels',   title: 'Tactile Panels',        image: '' },
    { id: 'tactile-mural',    title: 'Tactile Mural',         image: '' },
    { id: 'soft-play-elements', title: 'Soft Play Elements',  image: '' },
    { id: 'padding',          title: 'Padding',               image: '' },
    { id: 'vibration',        title: 'Vibration',             image: '' },
    { id: 'music',            title: 'Music',                 image: '' },
    { id: 'lighting',         title: 'Lighting / Fibre Optics', image: '' },
    { id: 'interactive-panels', title: 'Interactive Panels',   image: '' },
    { id: 'weight-resistance', title: 'Weight / Resistance',   image: '' },
    { id: 'balance',          title: 'Balance',               image: '' },
    { id: 'ball-pool',        title: 'Ball Pool',             image: '' },
    { id: 'climbing',         title: 'Climbing',              image: '' },
    { id: 'seating',          title: 'Seating',               image: '' },
  ],

  // ── Designers ─────────────────────────────────────────────
  designers: [
    {
      id: 'designer-1',
      name: 'Designer One',
      role: 'Senior Sensory Room Designer',
      bio: 'With years of experience designing sensory environments, specialising in multi-sensory rooms and sensory integration spaces.',
      // Replace with designer photo URL:
      image: '',
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
    // Number of weeks to show ahead
    weeksAhead: 4,
    // Minimum days in advance for booking
    minDaysAhead: 1,
    // Schedule: day of week (0=Sun, 1=Mon, ..., 6=Sat)
    schedule: {
      1: { start: 9, end: 16, label: 'Monday' },    // Mon 9am-4pm
      2: { start: 9, end: 16, label: 'Tuesday' },    // Tue 9am-4pm
      3: { start: 9, end: 16, label: 'Wednesday' },  // Wed 9am-4pm
      4: { start: 9, end: 16, label: 'Thursday' },   // Thu 9am-4pm
      5: { start: 9, end: 13, label: 'Friday' },     // Fri 9am-1pm
    },
    // Blocked hours (lunch break)
    blockedHours: [12], // 12:00-13:00 blocked
    // Slot duration in minutes
    slotDuration: 60,
    // Note shown below calendar
    calendarNote: 'Initial consultations typically last 15-20 minutes, but we book a full hour slot to ensure we have plenty of time to discuss your project.',
  },

  // ── Section Headings ──────────────────────────────────────
  // Edit these to change the headings shown on each step
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
      title: 'What Equipment Do You Need?',
      subtitle: 'Select all the equipment you\'re interested in.',
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
