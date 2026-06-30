import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Users, MapPin, Calendar } from 'lucide-react';

// ─── Safe local date string: avoids UTC-shift bug ────────────────────────────
function toLocalDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatINR(amount) {
  if (amount === null || amount === undefined) return 'Pending';
  if (amount === 0) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

function formatPax(pax) {
  if (!pax && pax !== 0) return '';
  const n = Number(pax);
  if (isNaN(n)) return pax; // "ticketed event"
  return `${n.toLocaleString('en-IN')} pax`;
}

function formatBalance(amount) {
  if (amount === null || amount === undefined) return { label: 'Pending', cls: 'text-amber-600' };
  if (amount === 0) return { label: 'Cleared', cls: 'text-slate-400' };
  return { label: formatINR(amount), cls: 'text-red-600' };
}

// ─── Mini event chip inside a calendar cell (desktop/tablet) ─────────────────
function EventChip({ event, onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(event); }}
      className="w-full text-left px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-[#eef2fa] text-[#1a2744] hover:bg-[#dde6f5] transition-all"
    >
      <div className="flex items-center gap-1 sm:gap-1.5">
        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#1a2744] opacity-40 flex-shrink-0" />
        <span className="font-semibold text-[9px] sm:text-[11px] truncate leading-tight">{event.eventName}</span>
      </div>
      <div className="mt-0.5 pl-2.5 sm:pl-3 hidden sm:block">
        <span className="text-[10px] text-slate-500 truncate block">
          {event.location}{event.pax ? ` · ${formatPax(event.pax)}` : ''}
        </span>
      </div>
    </button>
  );
}

// ─── Day cell ─────────────────────────────────────────────────────────────────
function DayCell({ date, events, isCurrentMonth, isToday, isSelected, onClick, onEventClick }) {
  // Fewer chips shown on the smallest screens to keep cells compact
  const MAX_SHOWN = 2;
  const shown = events.slice(0, MAX_SHOWN);
  const overflow = events.length - MAX_SHOWN;

  return (
    <div
      onClick={() => onClick(date)}
      className={`min-h-[64px] sm:min-h-[90px] lg:min-h-[110px] p-1 sm:p-1.5 lg:p-2 cursor-pointer transition-all border-r border-b border-[#e8e0d0] flex flex-col gap-0.5 sm:gap-1
        ${!isCurrentMonth ? 'bg-[#f9f6f0]' : 'bg-white hover:bg-[#faf8f4]'}
        ${isSelected ? 'ring-2 ring-inset ring-[#1a2744]' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className={`text-[11px] sm:text-sm font-bold w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full leading-none
          ${isToday ? 'bg-[#1a2744] text-white' : isCurrentMonth ? 'text-[#1a2744]' : 'text-slate-300'}
        `}>
          {date.getDate()}
        </span>
        {events.length > 0 && (
          <span className="text-[8px] sm:text-[9px] text-slate-400 font-medium hidden sm:inline">{events.length} event{events.length > 1 ? 's' : ''}</span>
        )}
      </div>

      {/* On the smallest screens: show dots only. From sm up: show chips. */}
      <div className="flex sm:hidden flex-wrap gap-0.5">
        {events.slice(0, 4).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#1a2744] opacity-50" />
        ))}
      </div>

      <div className="hidden sm:flex flex-col gap-0.5">
        {shown.map((ev, i) => (
          <EventChip key={i} event={ev} onClick={onEventClick} />
        ))}
        {overflow > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onClick(date); }}
            className="text-[10px] text-[#1a2744] font-semibold pl-2 py-0.5 hover:underline text-left"
          >
            +{overflow} more
          </button>
        )}
      </div>
    </div>
  );
}

// ─── A single event card (reused in DayPanel and EventList) ──────────────────
function EventCard({ event, onClick, showDate }) {
  const numericPax = parseFloat(event.pax) || 0;
  const eventValue = numericPax * (event.pricePerPax || 0);
  const balance = formatBalance(event.balanceDue);

  return (
    <button
      onClick={() => onClick(event)}
      className="text-left rounded-2xl bg-white border border-[#e0d9cc] overflow-hidden hover:shadow-md transition-all w-full"
    >
      <div className="h-1 bg-[#1a2744]" />
      <div className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
          <h4 className="font-bold text-[#1a2744] text-sm leading-tight">{event.eventName}</h4>
          {event.status && (
            <span className="flex-shrink-0 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#f5f0e8] text-slate-600">
              {event.status}
            </span>
          )}
        </div>
        {showDate && (
          <p className="text-[11px] text-[#c9a84c] font-semibold mb-2">{formatDateShort(event.eventDate)}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-2.5 sm:mb-3">
          <span className="flex items-center gap-1"><MapPin size={10} />{event.location || '—'}</span>
          {event.pax && <span className="flex items-center gap-1"><Users size={10} />{formatPax(event.pax)}</span>}
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center bg-[#f5f0e8] rounded-xl p-2 sm:p-2.5">
          <div>
            <p className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wide">Value</p>
            <p className="text-[11px] sm:text-xs font-bold text-[#1a2744]">{eventValue > 0 ? formatINR(eventValue) : '—'}</p>
          </div>
          <div className="border-x border-[#e0d9cc]">
            <p className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wide">Advance</p>
            <p className={`text-[11px] sm:text-xs font-bold ${event.advanceReceived === null || event.advanceReceived === undefined ? 'text-amber-600' : 'text-emerald-600'}`}>
              {formatINR(event.advanceReceived)}
            </p>
          </div>
          <div>
            <p className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wide">Balance</p>
            <p className={`text-[11px] sm:text-xs font-bold ${balance.cls}`}>{balance.label}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Selected day detail panel ────────────────────────────────────────────────
function DayPanel({ date, events, onEventClick }) {
  if (!date) return null;
  const dayLabel = formatDate(toLocalDateStr(date));

  return (
    <div className="border-t border-[#e0d9cc] bg-[#f5f0e8] px-4 sm:px-6 py-4 sm:py-5">
      <div className="flex items-center gap-3 mb-3 sm:mb-4">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1a2744] rounded-lg flex items-center justify-center flex-shrink-0">
          <Calendar size={14} className="text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-[#1a2744] text-sm sm:text-base truncate">{dayLabel}</h3>
          <p className="text-slate-500 text-xs">{events.length} event{events.length !== 1 ? 's' : ''} scheduled</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">No events on this day</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event, i) => (
            <EventCard key={i} event={event} onClick={onEventClick} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Event list for Upcoming view ─────────────────────────────────────────────
function EventList({ events, onEventClick }) {
  if (events.length === 0) {
    return <div className="text-center py-16 text-slate-400 text-sm">No events found</div>;
  }

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((event, i) => (
          <EventCard key={i} event={event} onClick={onEventClick} showDate />
        ))}
      </div>
    </div>
  );
}

// ─── Main CalendarView ────────────────────────────────────────────────────────
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarView({ events, isLoading, onEventClick }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [filter, setFilter] = useState('month');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) days.push({ date: new Date(year, month - 1, daysInPrev - i), currentMonth: false });
    for (let d = 1; d <= daysInMonth; d++) days.push({ date: new Date(year, month, d), currentMonth: true });
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) days.push({ date: new Date(year, month + 1, d), currentMonth: false });
    return days;
  }, [year, month]);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(ev => {
      const key = ev.eventDate;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [events]);

  const filteredEvents = useMemo(() => {
    const todayStr = toLocalDateStr(today);
    if (filter === 'upcoming') {
      return [...events]
        .filter(e => e.eventDate >= todayStr)
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
    }
    return events;
  }, [events, filter]);

  const todayStr = toLocalDateStr(today);
  const selectedDateStr = selectedDate ? toLocalDateStr(selectedDate) : null;
  const selectedEvents = selectedDateStr ? (eventsByDate[selectedDateStr] || []) : [];

  const monthEventCount = Object.entries(eventsByDate)
    .filter(([k]) => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
    .reduce((s, [, v]) => s + v.length, 0);

  function prevMonth() { setViewDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setViewDate(new Date(year, month + 1, 1)); }
  function goToday()   { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(today); setFilter('month'); }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 sm:py-32 gap-3 flex-col">
        <div className="w-10 h-10 border-4 border-[#e0d9cc] border-t-[#1a2744] rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading calendar…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e0d9cc]">
        <div className="flex items-center gap-2 order-2 sm:order-1">
          {[
            { key: 'month',    label: 'Month View' },
            { key: 'upcoming', label: 'Upcoming' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === f.key ? 'bg-[#1a2744] text-white shadow' : 'bg-[#f5f0e8] text-slate-600 hover:bg-[#e8e0d0]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 order-1 sm:order-2">
          {filter === 'month' && (
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f0e8] text-[#1a2744]">
                <ChevronLeft size={16} />
              </button>
              <h2 className="text-sm sm:text-base font-bold text-[#1a2744] w-32 sm:w-44 text-center">{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f0e8] text-[#1a2744]">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          <button onClick={goToday} className="text-xs font-semibold text-[#1a2744] px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#e0d9cc] hover:bg-[#f5f0e8] flex-shrink-0">
            Today
          </button>
        </div>

        {filter === 'month' && (
          <span className="text-xs text-slate-400 font-medium order-3 hidden sm:block">{monthEventCount} event{monthEventCount !== 1 ? 's' : ''} this month</span>
        )}
        {filter === 'upcoming' && (
          <span className="text-xs text-slate-400 font-medium order-3 hidden sm:block">{filteredEvents.length} upcoming event{filteredEvents.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Month view */}
      {filter === 'month' && (
        <>
          {/* Calendar grid */}
          <div className="border-b border-[#e0d9cc]">
            <div className="grid grid-cols-7 bg-[#f5f0e8]">
              {DAYS.map((d, i) => (
                <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest py-1.5 sm:py-2.5 border-r border-[#e8e0d0] last:border-0">
                  <span className="sm:hidden">{DAYS_SHORT[i]}</span>
                  <span className="hidden sm:inline">{d}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 border-l border-t border-[#e8e0d0]">
              {calendarDays.map(({ date, currentMonth }, i) => {
                const key = toLocalDateStr(date);
                const dayEvents = eventsByDate[key] || [];
                return (
                  <DayCell
                    key={i}
                    date={date}
                    events={dayEvents}
                    isCurrentMonth={currentMonth}
                    isToday={key === todayStr}
                    isSelected={key === selectedDateStr}
                    onClick={setSelectedDate}
                    onEventClick={onEventClick}
                  />
                );
              })}
            </div>
          </div>

          {/* Selected day panel */}
          {selectedDate && (
            <DayPanel date={selectedDate} events={selectedEvents} onEventClick={onEventClick} />
          )}
        </>
      )}

      {/* Upcoming list view */}
      {filter === 'upcoming' && (
        <EventList events={filteredEvents} onEventClick={onEventClick} />
      )}
    </div>
  );
}
