// ─── Configuration ────────────────────────────────────────────────────────────
export const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwFUY5Ul0lDDjINvqz14HBMZajncW6Y3prNCjfvQ3MxeuylCbTB3q_Bs6O-zwYKVb52/exec';

// Set to false to fetch from the live Google Apps Script endpoint
export const USE_MOCK_DATA = false;

// ─── Normalize a date value to YYYY-MM-DD ─────────────────────────────────────
// Google Sheets / Apps Script returns dates as full ISO strings like
// "2026-06-24T18:30:00.000Z". We strip the time part so all calendar
// lookups work on a plain "YYYY-MM-DD" key.
function normalizeDate(raw) {
  if (!raw) return raw;
  // Already a plain date string
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(raw))) return raw;
  // ISO timestamp — take the date portion in IST (+5:30) to avoid UTC rollback
  const d = new Date(raw);
  // Shift to IST
  const ist = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
  return ist.toISOString().split('T')[0];
}

function normalizeEvent(ev) {
  return { ...ev, eventDate: normalizeDate(ev.eventDate) };
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return fmt(d);
};

export const MOCK_EVENTS = [
  {
    eventDate: fmt(today),
    eventName: 'Dholakia Wedding',
    location: 'Surat',
    pax: 350,
    menu: 'Pizza Live, Pasta Live, Main Course, Dessert Counter',
    status: 'Confirmed',
    specialRequest: 'Separate Jain Counter, No Onion No Garlic section',
    pricePerPax: 850,
    advanceReceived: 150000,
    balanceDue: 147500,
  },
  {
    eventDate: fmt(today),
    eventName: 'TechCorp Annual Meet',
    location: 'Ahmedabad',
    pax: 120,
    menu: 'Continental Buffet, Tea & Coffee Station',
    status: 'Advance Received',
    specialRequest: 'Vegan options required',
    pricePerPax: 1200,
    advanceReceived: 72000,
    balanceDue: 72000,
  },
  {
    eventDate: addDays(1),
    eventName: 'Patel Birthday Gala',
    location: 'Surat',
    pax: 200,
    menu: 'Punjabi Night, Live Chaat, Welcome Drinks',
    status: 'Confirmed',
    specialRequest: 'Theme decoration in Gold & White',
    pricePerPax: 950,
    advanceReceived: 95000,
    balanceDue: 95000,
  },
  {
    eventDate: addDays(2),
    eventName: 'Shah Corporate Lunch',
    location: 'Vadodara',
    pax: 80,
    menu: 'Executive Lunch Menu, Juices Counter',
    status: 'Proposal Sent',
    specialRequest: 'Halal certified meat only',
    pricePerPax: 750,
    advanceReceived: 0,
    balanceDue: 60000,
  },
  {
    eventDate: addDays(3),
    eventName: 'Mehta Engagement Ceremony',
    location: 'Surat',
    pax: 450,
    menu: 'Kathiyawadi Special, Live Counters x3, Ice Cream Bar',
    status: 'Confirmed',
    specialRequest: 'Children menu for 50 kids, High chairs needed',
    pricePerPax: 1100,
    advanceReceived: 247500,
    balanceDue: 247500,
  },
  {
    eventDate: addDays(4),
    eventName: 'Reliance Team Outing',
    location: 'Navsari',
    pax: 60,
    menu: 'BBQ Night, Mocktail Bar',
    status: 'Lead',
    specialRequest: '',
    pricePerPax: 1500,
    advanceReceived: 0,
    balanceDue: 90000,
  },
  {
    eventDate: addDays(-1),
    eventName: 'Joshi Anniversary Dinner',
    location: 'Surat',
    pax: 150,
    menu: 'Fine Dining Set Menu, Wine & Cheese',
    status: 'Completed',
    specialRequest: 'Surprise cake arrangement at 9 PM',
    pricePerPax: 1800,
    advanceReceived: 270000,
    balanceDue: 0,
  },
  {
    eventDate: addDays(-2),
    eventName: 'Agarwal Reception',
    location: 'Bharuch',
    pax: 600,
    menu: 'Grand Wedding Spread, 6 Live Counters, Mocktail Bar',
    status: 'Completed',
    specialRequest: 'Dry event, no alcohol',
    pricePerPax: 900,
    advanceReceived: 540000,
    balanceDue: 0,
  },
  {
    eventDate: addDays(6),
    eventName: 'Government Officer Banquet',
    location: 'Gandhinagar',
    pax: 250,
    menu: 'Gujarati Thali, Farsan Counter',
    status: 'Proposal Sent',
    specialRequest: 'Satvik food only',
    pricePerPax: 700,
    advanceReceived: 0,
    balanceDue: 175000,
  },
  {
    eventDate: addDays(5),
    eventName: 'Desai House Party',
    location: 'Surat',
    pax: 50,
    menu: 'Fusion Menu, Cocktail Snacks',
    status: 'In Progress',
    specialRequest: 'Outdoor setup, garden party theme',
    pricePerPax: 2000,
    advanceReceived: 50000,
    balanceDue: 50000,
  },
  {
    eventDate: addDays(-3),
    eventName: 'Cancelled Corporate Event',
    location: 'Surat',
    pax: 100,
    menu: 'Standard Buffet',
    status: 'Cancelled',
    specialRequest: '',
    pricePerPax: 800,
    advanceReceived: 40000,
    balanceDue: 0,
  },
];

// ─── API Functions ─────────────────────────────────────────────────────────────
export async function fetchEvents() {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 600));
    return MOCK_EVENTS.map(normalizeEvent);
  }

  const response = await fetch(APPS_SCRIPT_URL);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch events`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeEvent) : [];
}
