// ─── Configuration ────────────────────────────────────────────────────────────
// Google Sheets "Publish to web" CSV URL (File → Share → Publish to web →
// select "For Dashboard" tab → CSV → Publish)
export const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRvwdnqvIOlunsOPZ-4vxWd-eO3529MS_NQ2DOlzE8fgNyyELIAU9rYB0hMQtVSeJGCVmAgcokHsr7j/pub?gid=1893580456&single=true&output=csv';

// Set to true to use mock data instead of the live sheet
export const USE_MOCK_DATA = false;

// ─── CSV Parser ───────────────────────────────────────────────────────────────
// Parses a CSV string into an array of objects using the first row as headers.
// Handles quoted fields (including fields with commas inside quotes).
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

  // Skip the header row — we map by column position to match sheet order:
  // A=eventDate, B=eventName, C=location, D=pax, E=menu,
  // F=status, G=specialRequest, H=pricePerPax, I=advanceReceived, J=balanceDue
  const rows = lines.slice(1);
  return rows
    .map(line => {
      const col = splitLine(line);
      // Skip completely empty rows
      if (!col[0] && !col[1]) return null;
      return {
        eventDate:       col[0]  || '',
        eventName:       col[1]  || '',
        location:        col[2]  || '',
        pax:             parseFloat(col[3])  || 0,
        menu:            col[4]  || '',
        status:          col[5]  || '',
        specialRequest:  col[6]  || '',
        pricePerPax:     parseFloat(col[7])  || 0,
        advanceReceived: parseFloat(col[8])  || 0,
        balanceDue:      parseFloat(col[9])  || 0,
      };
    })
    .filter(Boolean);
}

// ─── Date normalizer ──────────────────────────────────────────────────────────
// Google Sheets CSV exports dates in various formats depending on locale:
//   "10-Jun-2026", "10/06/2026", "2026-06-10", "2026-06-09T18:30:00.000Z"
// We normalize all of them to YYYY-MM-DD (IST-aware for ISO timestamps).
function normalizeDate(raw) {
  if (!raw) return '';
  const s = String(raw).trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // ISO timestamp — shift to IST (+5:30) before extracting date
  if (s.includes('T') || s.endsWith('Z')) {
    const d = new Date(s);
    const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    return ist.toISOString().split('T')[0];
  }

  // "10-Jun-2026" or "10-Jun-26"
  const dmy = s.match(/^(\d{1,2})[-\/]([A-Za-z]+)[-\/](\d{2,4})$/);
  if (dmy) {
    const months = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
    const m = months[dmy[2].toLowerCase().slice(0, 3)];
    const y = dmy[3].length === 2 ? '20' + dmy[3] : dmy[3];
    if (m) return `${y}-${String(m).padStart(2,'0')}-${String(dmy[1]).padStart(2,'0')}`;
  }

  // "DD/MM/YYYY" or "MM/DD/YYYY" — assume DD/MM/YYYY (Indian locale)
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    return `${slash[3]}-${String(slash[2]).padStart(2,'0')}-${String(slash[1]).padStart(2,'0')}`;
  }

  // Fallback: let JS parse it
  const d = new Date(s);
  if (!isNaN(d)) return d.toISOString().split('T')[0];

  return s;
}

function normalizeEvent(ev) {
  return { ...ev, eventDate: normalizeDate(ev.eventDate) };
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const today = new Date();
const fmt  = (d) => d.toISOString().split('T')[0];
const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d); };

export const MOCK_EVENTS = [
  { eventDate: fmt(today),  eventName: 'Dholakia Wedding',        location: 'Surat',      pax: 350, menu: 'Pizza Live, Pasta Live, Main Course', status: 'Confirmed',       specialRequest: 'Separate Jain Counter', pricePerPax: 850,  advanceReceived: 150000, balanceDue: 147500 },
  { eventDate: fmt(today),  eventName: 'TechCorp Annual Meet',    location: 'Ahmedabad',  pax: 120, menu: 'Continental Buffet, Tea & Coffee',    status: 'Advance Received',specialRequest: 'Vegan options required',pricePerPax: 1200, advanceReceived: 72000,  balanceDue: 72000  },
  { eventDate: addDays(1),  eventName: 'Patel Birthday Gala',     location: 'Surat',      pax: 200, menu: 'Punjabi Night, Live Chaat',           status: 'Confirmed',       specialRequest: 'Gold & White theme',    pricePerPax: 950,  advanceReceived: 95000,  balanceDue: 95000  },
  { eventDate: addDays(2),  eventName: 'Shah Corporate Lunch',    location: 'Vadodara',   pax: 80,  menu: 'Executive Lunch Menu',                status: 'Proposal Sent',   specialRequest: 'Halal certified',       pricePerPax: 750,  advanceReceived: 0,      balanceDue: 60000  },
  { eventDate: addDays(3),  eventName: 'Mehta Engagement',        location: 'Surat',      pax: 450, menu: 'Kathiyawadi Special, Ice Cream Bar',  status: 'Confirmed',       specialRequest: 'Kids menu for 50',      pricePerPax: 1100, advanceReceived: 247500, balanceDue: 247500 },
  { eventDate: addDays(-1), eventName: 'Joshi Anniversary Dinner',location: 'Surat',      pax: 150, menu: 'Fine Dining Set Menu',                status: 'Completed',       specialRequest: 'Surprise cake at 9 PM', pricePerPax: 1800, advanceReceived: 270000, balanceDue: 0      },
  { eventDate: addDays(-2), eventName: 'Agarwal Reception',       location: 'Bharuch',    pax: 600, menu: 'Grand Wedding Spread',                status: 'Completed',       specialRequest: 'Dry event',             pricePerPax: 900,  advanceReceived: 540000, balanceDue: 0      },
];

// ─── Main fetch function ───────────────────────────────────────────────────────
export async function fetchEvents() {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 600));
    return MOCK_EVENTS.map(normalizeEvent);
  }

  // Append a cache-busting timestamp so the browser always gets fresh data
  const url = `${CSV_URL}&t=${Date.now()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch sheet data`);
  }

  const text = await response.text();
  const events = parseCSV(text);
  return events.map(normalizeEvent);
}
