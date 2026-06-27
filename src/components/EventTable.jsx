import { ChevronUp, ChevronDown, IndianRupee } from 'lucide-react';
import { useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(amount) {
  if (amount === null || amount === undefined) return 'Pending';
  if (amount === 0) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

function formatBalance(amount) {
  if (amount === null || amount === undefined) return { label: 'Pending', cls: 'text-amber-600 font-semibold' };
  if (amount === 0) return { label: 'Cleared', cls: 'text-slate-400' };
  return { label: formatINR(amount), cls: 'text-red-600 font-semibold' };
}

function formatPax(pax) {
  if (!pax && pax !== 0) return '—';
  const n = Number(pax);
  if (isNaN(n)) return String(pax); // "ticketed event" etc.
  return n.toLocaleString('en-IN');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const COLUMNS = [
  { key: 'eventDate',      label: 'Date',        sortable: true  },
  { key: 'eventName',      label: 'Event Name',  sortable: true  },
  { key: 'location',       label: 'Location',    sortable: true  },
  { key: 'pax',            label: 'Pax',         sortable: false },
  { key: 'status',         label: 'Status/Notes',sortable: true  },
  { key: 'eventValue',     label: 'Event Value', sortable: true  },
  { key: 'pricePerPax',    label: 'Price / Pax', sortable: true  },
  { key: 'advanceReceived',label: 'Advance',     sortable: true  },
  { key: 'balanceDue',     label: 'Balance Due', sortable: true  },
];

export default function EventTable({ events, onRowClick, isLoading }) {
  const [sortKey, setSortKey] = useState('eventDate');
  const [sortDir, setSortDir] = useState('asc');

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const sorted = [...events].sort((a, b) => {
    let av = a[sortKey];
    let bv = b[sortKey];
    if (sortKey === 'eventValue') {
      av = (parseFloat(a.pax) || 0) * (a.pricePerPax || 0);
      bv = (parseFloat(b.pax) || 0) * (b.pricePerPax || 0);
    }
    if (av === undefined || av === null) return 1;
    if (bv === undefined || bv === null) return -1;
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function SortIcon({ col }) {
    if (sortKey !== col) return <ChevronUp size={12} className="opacity-20" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-[#c9a84c]" />
      : <ChevronDown size={12} className="text-[#c9a84c]" />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-10 h-10 border-4 border-[#e0d9cc] border-t-[#1a2744] rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading events…</p>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-14 h-14 bg-[#f5f0e8] rounded-2xl flex items-center justify-center">
          <IndianRupee size={28} className="text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">No events found</p>
      </div>
    );
  }

  // Totals (only numeric values)
  const totalValue    = sorted.reduce((s, e) => s + (parseFloat(e.pax) || 0) * (e.pricePerPax || 0), 0);
  const totalAdvance  = sorted.reduce((s, e) => s + (e.advanceReceived ?? 0), 0);
  const totalBalance  = sorted.reduce((s, e) => s + (e.balanceDue ?? 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-[#e0d9cc] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#111b33] text-white">
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:bg-[#1a2744] select-none' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && <SortIcon col={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((event, idx) => {
              const numericPax = parseFloat(event.pax) || 0;
              const eventValue = numericPax * (event.pricePerPax || 0);
              const balance = formatBalance(event.balanceDue);
              return (
                <tr
                  key={idx}
                  onClick={() => onRowClick(event)}
                  className="border-b border-[#f0ebe0] hover:bg-[#f5f0e8] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4 whitespace-nowrap font-medium text-[#1a2744]">
                    {formatDate(event.eventDate)}
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#1a2744]">{event.eventName}</td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{event.location || '—'}</td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{formatPax(event.pax)}</td>
                  <td className="px-5 py-4 text-slate-600 max-w-[180px]">
                    <span className="truncate block">{event.status || '—'}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#1a2744] whitespace-nowrap">
                    {eventValue > 0 ? formatINR(eventValue) : '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                    {event.pricePerPax === null || event.pricePerPax === undefined ? 'Pending' : formatINR(event.pricePerPax)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={event.advanceReceived === null || event.advanceReceived === undefined ? 'text-amber-600 font-semibold' : 'text-emerald-700 font-medium'}>
                      {formatINR(event.advanceReceived)}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={balance.cls}>{balance.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[#f5f0e8] border-t-2 border-[#e0d9cc]">
              <td colSpan={4} className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Totals ({sorted.length} events)
              </td>
              <td />
              <td className="px-5 py-3.5 font-bold text-[#1a2744] text-sm">{formatINR(totalValue)}</td>
              <td />
              <td className="px-5 py-3.5 font-bold text-emerald-700 text-sm">{formatINR(totalAdvance)}</td>
              <td className="px-5 py-3.5 font-bold text-red-600 text-sm">{formatINR(totalBalance)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
