// ─── Configuration ────────────────────────────────────────────────────────────
export const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRvwdnqvIOlunsOPZ-4vxWd-eO3529MS_NQ2DOlzE8fgNyyELIAU9rYB0hMQtVSeJGCVmAgcokHsr7j/pub?gid=1893580456&single=true&output=csv';

export const USE_MOCK_DATA = false;

// ─── Number helper ────────────────────────────────────────────────────────────
// Returns null for blank / "-" / "pending" / any non-numeric text.
// Returns a number for actual numeric values.
function toNumber(val) {
  if (!val) return null;
  const s = String(val).trim();
  if (s === '' || s === '-') return null;
  const n = parseFloat(s.replace(/[₹,]/g, ''));
  return isNaN(n) ? null : n;
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  function splitLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());
    return fields;
  }

  const rows = lines.slice(1);
  return rows
    .map(line => {
      const col = splitLine(line);
      if (!col[0] && !col[1]) return null;
      return {
        eventDate:       col[0] || '',
        eventName:       col[1] || '',
        location:        col[2] || '',
        pax:             col[3] || '',        // kept as raw text — supports "ticketed event"
        menu:            col[4] || '',
        status:          col[5] || '',
        specialRequest:  col[6] || '',
        pricePerPax:     toNumber(col[7]),    // null if blank/pending/"-"
        advanceReceived: toNumber(col[8]),    // null if blank/pending/"-"
        balanceDue:      toNumber(col[9]),    // null if blank/pending/"-"
      };
    })
    .filter(Boolean);
}

// ─── Date normalizer ──────────────────────────────────────────────────────────
function normalizeDate(raw) {
  if (!raw) return '';
  const s = String(raw).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  if (s.includes('T') || s.endsWith('Z')) {
    const d = new Date(s);
    const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    return ist.toISOString().split('T')[0];
  }

  const dmy = s.match(/^(\d{1,2})[-\/]([A-Za-z]+)[-\/](\d{2,4})$/);
  if (dmy) {
    const months = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
    const m = months[dmy[2].toLowerCase().slice(0, 3)];
    const y = dmy[3].length === 2 ? '20' + dmy[3] : dmy[3];
    if (m) return `${y}-${String(m).padStart(2,'0')}-${String(dmy[1]).padStart(2,'0')}`;
  }

  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    return `${slash[3]}-${String(slash[2]).padStart(2,'0')}-${String(slash[1]).padStart(2,'0')}`;
  }

  const d = new Date(s);
  if (!isNaN(d)) return d.toISOString().split('T')[0];

  return s;
}

function normalizeEvent(ev) {
  return { ...ev, eventDate: normalizeDate(ev.eventDate) };
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d); };

export const MOCK_EVENTS = [
  { eventDate: fmt(today),  eventName: 'Dholakia Wedding',         location: 'Surat',     pax: '350',             menu: 'Pizza Live, Pasta Live', status: 'Confirmed',        specialRequest: 'Separate Jain Counter', pricePerPax: 850,  advanceReceived: 150000, balanceDue: 147500 },
  { eventDate: fmt(today),  eventName: 'TechCorp Annual Meet',     location: 'Ahmedabad', pax: '120',             menu: 'Continental Buffet',     status: 'Advance Received', specialRequest: 'Vegan options',         pricePerPax: 1200, advanceReceived: 72000,  balanceDue: 72000  },
  { eventDate: addDays(1),  eventName: 'Garba Foodoholics',        location: 'AHM',       pax: 'ticketed event',  menu: '',                       status: 'Just dates blocked',specialRequest: '',                     pricePerPax: null, advanceReceived: null,   balanceDue: null   },
  { eventDate: addDays(2),  eventName: 'Shah Corporate Lunch',     location: 'Vadodara',  pax: '80',              menu: 'Executive Lunch Menu',   status: 'Proposal Sent',    specialRequest: 'Halal certified',       pricePerPax: 750,  advanceReceived: null,   balanceDue: null   },
  { eventDate: addDays(3),  eventName: 'Mehta Engagement',         location: 'Surat',     pax: '450',             menu: 'Kathiyawadi Special',    status: 'Confirmed',        specialRequest: 'Kids menu for 50',      pricePerPax: 1100, advanceReceived: 247500, balanceDue: 247500 },
  { eventDate: addDays(-1), eventName: 'Joshi Anniversary Dinner', location: 'Surat',     pax: '150',             menu: 'Fine Dining Set Menu',   status: 'Completed',        specialRequest: 'Surprise cake at 9 PM', pricePerPax: 1800, advanceReceived: 270000, balanceDue: 0      },
];

// ─── Main fetch function ──────────────────────────────────────────────────────
export async function fetchEvents() {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 600));
    return MOCK_EVENTS.map(normalizeEvent);
  }

  const url = `${CSV_URL}&t=${Date.now()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch sheet data`);
  }

  const text = await response.text();
  const events = parseCSV(text);
  return events.map(normalizeEvent);
}
