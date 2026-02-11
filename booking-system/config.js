/*
 * ============================================================
 *  SOUTHPAW BOOKING SYSTEM — CONFIGURATION
 * ============================================================
 *  Edit images, text, designers, and settings below.
 *  All image paths are relative to the booking-system folder.
 * ============================================================
 */

const CONFIG = {

  // ── Branding ──────────────────────────────────────────────
  brand: {
    name: "Southpaw",
    logo: "images/logo-placeholder.svg",
    primaryColor: "#2A7B88",      // Teal
    primaryColorDark: "#1E5F6A",
    accentColor: "#E8734A",       // Warm orange for CTAs
    accentColorDark: "#D4612F",
    backgroundColor: "#F5F7FA",
    cardBackground: "#FFFFFF",
    textColor: "#2D3748",
    textColorLight: "#718096",
    heroGradientStart: "#2A7B88",
    heroGradientEnd: "#1B4F58",
  },

  // ── External Links ────────────────────────────────────────
  links: {
    designBook: "https://southpaw.co.uk/pages/design-book",
    designProcess: "https://southpaw.co.uk/pages/design-process",
  },

  // ── Email Settings ────────────────────────────────────────
  email: {
    recipient: "design-visit@somatogroup.co.uk",
    // EmailJS configuration (sign up free at emailjs.com)
    // 1. Create an account at https://www.emailjs.com/
    // 2. Add an email service (Gmail, Outlook, etc.)
    // 3. Create an email template with variables:
    //    {{from_name}}, {{from_email}}, {{phone}}, {{postcode}},
    //    {{premises}}, {{room_type}}, {{age_range}}, {{room_size}},
    //    {{equipment}}, {{designer}}, {{appointment_date}},
    //    {{appointment_time}}, {{message}}
    // 4. Paste your IDs below:
    emailjsPublicKey: "",   // Your EmailJS public key
    emailjsServiceId: "",   // Your EmailJS service ID
    emailjsTemplateId: "",  // Your EmailJS template ID
  },

  // ── Room Types ────────────────────────────────────────────
  roomTypes: [
    {
      id: "si",
      title: "Sensory Integration",
      subtitle: "SI Room",
      image: "images/room-si.jpg",
      // Fallback colour used for placeholder if image missing
      placeholderColor: "#4ECDC4",
      placeholderIcon: "🧩",
    },
    {
      id: "mse",
      title: "Multi-Sensory",
      subtitle: "MSE Room",
      image: "images/room-mse.jpg",
      placeholderColor: "#45B7D1",
      placeholderIcon: "✨",
    },
    {
      id: "soft-play",
      title: "Soft Play",
      subtitle: "Soft Play Area",
      image: "images/room-softplay.jpg",
      placeholderColor: "#96CEB4",
      placeholderIcon: "🎪",
    },
    {
      id: "de-escalation",
      title: "De-escalation",
      subtitle: "Calm Room",
      image: "images/room-deescalation.jpg",
      placeholderColor: "#A8D8EA",
      placeholderIcon: "🕊️",
    },
    {
      id: "projection",
      title: "Projection",
      subtitle: "Immersive Room",
      image: "images/room-projection.jpg",
      placeholderColor: "#7C5CBF",
      placeholderIcon: "🎬",
    },
    {
      id: "mural",
      title: "Mural",
      subtitle: "Themed Room",
      image: "images/room-mural.jpg",
      placeholderColor: "#F093A0",
      placeholderIcon: "🎨",
    },
    {
      id: "other",
      title: "Other / Multiple",
      subtitle: "Multiple Rooms",
      image: "images/room-other.jpg",
      placeholderColor: "#F9D56E",
      placeholderIcon: "🏗️",
    },
  ],

  // ── Age Ranges ────────────────────────────────────────────
  ageRanges: [
    {
      id: "0-5",
      title: "0 – 5",
      subtitle: "Early Years",
      image: "images/age-0-5.jpg",
      placeholderColor: "#FFB7B2",
      placeholderIcon: "👶",
    },
    {
      id: "6-12",
      title: "6 – 12",
      subtitle: "Primary",
      image: "images/age-6-12.jpg",
      placeholderColor: "#FFDAC1",
      placeholderIcon: "🧒",
    },
    {
      id: "13-18",
      title: "13 – 18",
      subtitle: "Secondary",
      image: "images/age-13-18.jpg",
      placeholderColor: "#B5EAD7",
      placeholderIcon: "🧑",
    },
    {
      id: "older",
      title: "Older",
      subtitle: "Adult",
      image: "images/age-older.jpg",
      placeholderColor: "#C7CEEA",
      placeholderIcon: "👤",
    },
  ],

  // ── Room Sizes ────────────────────────────────────────────
  roomSizes: [
    {
      id: "small",
      title: "Small",
      subtitle: "Up to 15m²",
      image: "images/size-small.jpg",
      placeholderColor: "#D4E09B",
      placeholderIcon: "🔹",
    },
    {
      id: "medium",
      title: "Medium",
      subtitle: "15 – 30m²",
      image: "images/size-medium.jpg",
      placeholderColor: "#F6D55C",
      placeholderIcon: "🔷",
    },
    {
      id: "large",
      title: "Large",
      subtitle: "30m² +",
      image: "images/size-large.jpg",
      placeholderColor: "#3CAEA3",
      placeholderIcon: "⬛",
    },
    {
      id: "various",
      title: "Various",
      subtitle: "Multiple Rooms",
      image: "images/size-various.jpg",
      placeholderColor: "#ED553B",
      placeholderIcon: "🔶",
    },
  ],

  // ── Equipment (multi-select) ──────────────────────────────
  equipment: [
    { id: "bubble-tubes",     title: "Bubble Tubes",          image: "images/equip-bubble.jpg",     placeholderColor: "#45B7D1", placeholderIcon: "🫧" },
    { id: "swings",           title: "Swings",                image: "images/equip-swings.jpg",     placeholderColor: "#96CEB4", placeholderIcon: "🪢" },
    { id: "projectors",       title: "Projector/s",           image: "images/equip-projector.jpg",  placeholderColor: "#7C5CBF", placeholderIcon: "📽️" },
    { id: "tactile-panels",   title: "Tactile Panels",        image: "images/equip-tactile.jpg",    placeholderColor: "#F093A0", placeholderIcon: "🖐️" },
    { id: "tactile-mural",    title: "Tactile Mural",         image: "images/equip-mural.jpg",      placeholderColor: "#E8734A", placeholderIcon: "🎨" },
    { id: "soft-play",        title: "Soft Play Elements",    image: "images/equip-softplay.jpg",   placeholderColor: "#FFB7B2", placeholderIcon: "🧸" },
    { id: "padding",          title: "Padding",               image: "images/equip-padding.jpg",    placeholderColor: "#B5EAD7", placeholderIcon: "🛡️" },
    { id: "vibration",        title: "Vibration",             image: "images/equip-vibration.jpg",  placeholderColor: "#FFDAC1", placeholderIcon: "〰️" },
    { id: "music",            title: "Music",                 image: "images/equip-music.jpg",      placeholderColor: "#C7CEEA", placeholderIcon: "🎵" },
    { id: "lighting",         title: "Lighting / Fibre Optics", image: "images/equip-lighting.jpg", placeholderColor: "#F9D56E", placeholderIcon: "💡" },
    { id: "interactive",      title: "Interactive Panels",    image: "images/equip-interactive.jpg", placeholderColor: "#4ECDC4", placeholderIcon: "🖥️" },
    { id: "weight-resistance", title: "Weight / Resistance",  image: "images/equip-weight.jpg",     placeholderColor: "#D4E09B", placeholderIcon: "🏋️" },
    { id: "balance",          title: "Balance",               image: "images/equip-balance.jpg",    placeholderColor: "#3CAEA3", placeholderIcon: "⚖️" },
    { id: "ball-pool",        title: "Ball Pool",             image: "images/equip-ballpool.jpg",   placeholderColor: "#ED553B", placeholderIcon: "🔴" },
    { id: "climbing",         title: "Climbing",              image: "images/equip-climbing.jpg",   placeholderColor: "#2A7B88", placeholderIcon: "🧗" },
    { id: "seating",          title: "Seating",               image: "images/equip-seating.jpg",    placeholderColor: "#A8D8EA", placeholderIcon: "🪑" },
  ],

  // ── Designers ─────────────────────────────────────────────
  designers: [
    {
      id: "designer-1",
      name: "Sarah Mitchell",
      role: "Lead Sensory Designer",
      bio: "Sarah has over 12 years' experience designing sensory environments for schools, hospitals and care homes. She specialises in multi-sensory and SI rooms.",
      image: "images/designer-sarah.jpg",
      placeholderColor: "#F093A0",
      placeholderIcon: "👩‍🎨",
    },
    {
      id: "designer-2",
      name: "James Carter",
      role: "Senior Design Consultant",
      bio: "James brings a background in occupational therapy to his design work, ensuring every space is both therapeutic and engaging. He focuses on de-escalation and calm spaces.",
      image: "images/designer-james.jpg",
      placeholderColor: "#45B7D1",
      placeholderIcon: "👨‍🎨",
    },
    {
      id: "designer-3",
      name: "Emma Thompson",
      role: "Creative Director",
      bio: "Emma leads our creative team with a passion for immersive projection and mural designs. She transforms ordinary rooms into extraordinary sensory experiences.",
      image: "images/designer-emma.jpg",
      placeholderColor: "#96CEB4",
      placeholderIcon: "👩‍💼",
    },
    {
      id: "designer-4",
      name: "David Okonkwo",
      role: "Design Consultant",
      bio: "David specialises in soft play and active sensory spaces. With a background in inclusive design, he creates environments that are accessible and stimulating for all ages.",
      image: "images/designer-david.jpg",
      placeholderColor: "#7C5CBF",
      placeholderIcon: "👨‍💼",
    },
  ],

  // ── Calendar Settings ─────────────────────────────────────
  calendar: {
    // Slots available per day (24-hour format)
    // Mon–Thu
    weekdaySlots: [
      { start: 9,  label: "9:00 AM – 10:00 AM" },
      { start: 10, label: "10:00 AM – 11:00 AM" },
      { start: 11, label: "11:00 AM – 12:00 PM" },
      // 12–1 lunch break
      { start: 13, label: "1:00 PM – 2:00 PM" },
      { start: 14, label: "2:00 PM – 3:00 PM" },
      { start: 15, label: "3:00 PM – 4:00 PM" },
    ],
    // Friday
    fridaySlots: [
      { start: 9,  label: "9:00 AM – 10:00 AM" },
      { start: 10, label: "10:00 AM – 11:00 AM" },
      { start: 11, label: "11:00 AM – 12:00 PM" },
    ],
    // How many weeks ahead to allow booking
    weeksAhead: 8,
    // Booked slots (managed manually or via integration)
    // Format: ["2026-02-15T09", "2026-02-15T10"]  (dateThour)
    bookedSlots: [],
  },
};
