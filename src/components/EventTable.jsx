import { ChevronUp, ChevronDown, Users, IndianRupee } from 'lucide-react';
import { useState } from 'react';

export const STATUS_STYLES = {
  Lead: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  },
  'Proposal Sent': {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
  },
  Confirmed: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  'Advance Received': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  'In Progress': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  Completed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-700',
  },
  Cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES['Lead'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

function formatINR(amount) {
  if (!amount && amount !== 0) return '—';
  return '₹' + amount.toLocaleString('en-IN');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const COLUMNS = [
  { key: 'eventDate', label: 'Date', sortable: true },
  { key: 'eventName', label: 'Event Name', sortable: true },
  { key: 'location', label: 'Location', sortable: true },
  { key: 'pax', label: 'Pax', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'eventValue', label: 'Event Value', sortable: true },
  { key: 'pricePerPax', label: 'Price / Pax', sortable: true },
  { key: 'advanceReceived', label: 'Advance', sortable: true },
  { key: 'balanceDue', label: 'Balance Due', sortable: true },
];

export default function EventTable({ events, onRowClick, isLoading }) {
  const [sortKey, setSortKey] = useState('eventDate');
  const [sortDir, setSortDir] = useState('asc');

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = [...events].sort((a, b) => {
    let av = a[sortKey];
    let bv = b[sortKey];
    if (sortKey === 'eventValue') {
      av = (a.pax || 0) * (a.pricePerPax || 0);
      bv = (b.pax || 0) * (b.pricePerPax || 0);
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
      ? <ChevronUp size={12} className="text-bookends-gold" />
      : <ChevronDown size={12} className="text-bookends-gold" />;
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-bookends-beige-dark overflow-hidden">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-10 h-10 border-4 border-bookends-beige-dark border-t-bookends-navy rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading events…</p>
        </div>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-bookends-beige-dark overflow-hidden">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-14 h-14 bg-bookends-beige rounded-2xl flex items-center justify-center">
            <IndianRupee size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No events found</p>
          <p className="text-slate-400 text-sm">Try adjusting your filters or search query</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-bookends-beige-dark overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bookends-navy-dark text-white">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer hover:bg-bookends-navy select-none' : ''
                  }`}
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
              const eventValue = (event.pax || 0) * (event.pricePerPax || 0);
              const isToday = event.eventDate === new Date().toISOString().split('T')[0];
              return (
                <tr
                  key={idx}
                  onClick={() => onRowClick(event)}
                  className={`table-row ${isToday ? 'bg-blue-50/40' : ''}`}
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {isToday && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" title="Today" />
                      )}
                      <span className={`font-medium ${isToday ? 'text-blue-700' : 'text-bookends-navy'}`}>
                        {formatDate(event.eventDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-bookends-navy">{event.eventName}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{event.location}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Users size={13} className="text-slate-400" />
                      {event.pax?.toLocaleString('en-IN') ?? '—'}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-5 py-4 font-semibold text-bookends-navy whitespace-nowrap">
                    {formatINR(eventValue)}
                  </td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                    {formatINR(event.pricePerPax)}
                  </td>
                  <td className="px-5 py-4 text-emerald-700 font-medium whitespace-nowrap">
                    {formatINR(event.advanceReceived)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`font-semibold ${
                        (event.balanceDue || 0) > 0 ? 'text-red-600' : 'text-slate-400'
                      }`}
                    >
                      {(event.balanceDue || 0) > 0 ? formatINR(event.balanceDue) : 'Cleared'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Footer totals row */}
          <tfoot>
            <tr className="bg-bookends-beige border-t-2 border-bookends-beige-dark">
              <td colSpan={4} className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Totals ({sorted.length} events)
              </td>
              <td />
              <td className="px-5 py-3.5 font-bold text-bookends-navy text-sm">
                {formatINR(sorted.reduce((s, e) => s + (e.pax || 0) * (e.pricePerPax || 0), 0))}
              </td>
              <td />
              <td className="px-5 py-3.5 font-bold text-emerald-700 text-sm">
                {formatINR(sorted.reduce((s, e) => s + (e.advanceReceived || 0), 0))}
              </td>
              <td className="px-5 py-3.5 font-bold text-red-600 text-sm">
                {formatINR(sorted.reduce((s, e) => s + (e.balanceDue || 0), 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
