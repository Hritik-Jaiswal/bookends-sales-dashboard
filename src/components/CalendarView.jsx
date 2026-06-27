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

// ─── Mini event chip inside a calendar cell ───────────────────────────────────
function EventChip({ event, onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(event); }}
      className="w-full text-left px-2 py-1 rounded-lg bg-[#eef2fa] text-[#1a2744] hover:bg-[#dde6f5] transition-all"
    >
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1a2744] opacity-40 flex-shrink-0" />
        <span className="font-semibold text-[11px] truncate leading-tight">{event.eventName}</span>
      </div>
      <div className="mt-0.5 pl-3">
        <span className="text-[10px] text-slate-500 truncate block">
          {event.location}{event.pax ? ` · ${formatPax(event.pax)}` : ''}
        </span>
      </div>
    </button>
  );
}

// ─── Day cell ─────────────────────────────────────────────────────────────────
function DayCell({ date, events, isCurrentMonth, isToday, isSelected, onClick, onEventClick }) {
  const MAX_SHOWN = 2;
  const shown = events.slice(0, MAX_SHOWN);
  const overflow = events.length - MAX_SHOWN;

  return (
    <div
      onClick={() => onClick(date)}
      className={`min-h-[110px] p-2 cursor-pointer transition-all border-r border-b border-[#e8e0d0] flex flex-col gap-1
        ${!isCurrentMonth ? 'bg-[#f9f6f0]' : 'bg-white hover:bg-[#faf8f4]'}
        ${isSelected ? 'ring-2 ring-inset ring-[#1a2744]' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full leading-none
          ${isToday ? 'bg-[#1a2744] text-white' : isCurrentMonth ? 'text-[#1a2744]' : 'text-slate-300'}
        `}>
          {date.getDate()}
        </span>
        {events.length > 0 && (
          <span className="text-[9px] text-slate-400 font-medium">{events.length} event{events.length > 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
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

// ─── Selected day detail panel ────────────────────────────────────────────────
function DayPanel({ date, events, onEventClick }) {
  if (!date) return null;
  const dayLabel = formatDate(toLocalDateStr(date));

  return (
    <div className="border-t border-[#e0d9cc] bg-[#f5f0e8] px-6 py-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-[#1a2744] rounded-lg flex items-center justify-center">
          <Calendar size={15} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-[#1a2744] text-base">{dayLabel}</h3>
          <p className="text-slate-500 text-xs">{events.length} event{events.length !== 1 ? 's' : ''} scheduled</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">No events on this day</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event, i) => {
            const numericPax = parseFloat(event.pax) || 0;
            const eventValue = numericPax * (event.pricePerPax || 0);
            const balance = formatBalance(event.balanceDue);
            return (
              <button
                key={i}
                onClick={() => onEventClick(event)}
                className="text-left rounded-2xl bg-white border border-[#e0d9cc] overflow-hidden hover:shadow-md transition-all"
              >
                <div className="h-1 bg-[#1a2744]" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-[#1a2744] text-sm leading-tight">{event.eventName}</h4>
                    {event.status && (
                      <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f5f0e8] text-slate-600">
                        {event.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin size={10} />{event.location || '—'}</span>
                    {event.pax && <span className="flex items-center gap-1"><Users size={10} />{formatPax(event.pax)}</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center bg-[#f5f0e8] rounded-xl p-2.5">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wide">Value</p>
                      <p className="text-xs font-bold text-[#1a2744]">{eventValue > 0 ? formatINR(eventValue) : '—'}</p>
                    </div>
                    <div className="border-x border-[#e0d9cc]">
                      <p className="text-[9px] text-slate-400 uppercase tracking-wide">Advance</p>
                      <p className={`text-xs font-bold ${event.advanceReceived === null || event.advanceReceived === undefined ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {formatINR(event.advanceReceived)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wide">Balance</p>
                      <p className={`text-xs font-bold ${balance.cls}`}>{balance.label}</p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Event list for Upcoming / All Events views ───────────────────────────────
function EventList({ events, onEventClick }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">No events found</div>
    );
  }

  return (
    <div className="px-6 py-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event, i) => {
          const numericPax = parseFloat(event.pax) || 0;
          const eventValue = numericPax * (event.pricePerPax || 0);
          const balance = formatBalance(event.balanceDue);
          return (
            <button
              key={i}
              onClick={() => onEventClick(event)}
              className="text-left rounded-2xl bg-white border border-[#e0d9cc] overflow-hidden hover:shadow-md transition-all"
            >
              <div className="h-1 bg-[#1a2744]" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-bold text-[#1a2744] text-sm leading-tight">{event.eventName}</h4>
                  {event.status && (
                    <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f5f0e8] text-slate-600">
                      {event.status}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#c9a84c] font-semibold mb-2">{formatDate(event.eventDate)}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin size={10} />{event.location || '—'}</span>
                  {event.pax && <span className="flex items-center gap-1"><Users size={10} />{formatPax(event.pax)}</span>}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center bg-[#f5f0e8] rounded-xl p-2.5">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide">Value</p>
                    <p className="text-xs font-bold text-[#1a2744]">{eventValue > 0 ? formatINR(eventValue) : '—'}</p>
                  </div>
                  <div className="border-x border-[#e0d9cc]">
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide">Advance</p>
                    <p className={`text-xs font-bold ${event.advanceReceived === null || event.advanceReceived === undefined ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {formatINR(event.advanceReceived)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide">Balance</p>
                    <p className={`text-xs font-bold ${balance.cls}`}>{balance.label}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main CalendarView ────────────────────────────────────────────────────────
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
    if (filter === 'all') {
      return [...events].sort((a, b) => a.eventDate.localeCompare(b.eventDate));
    }
    return events; // 'month' — not used for list, calendar handles it
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
      <div className="flex items-center justify-center py-32 gap-3 flex-col">
        <div className="w-10 h-10 border-4 border-[#e0d9cc] border-t-[#1a2744] rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading calendar…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-[#e0d9cc]">
        <div className="flex items-center gap-2">
          {[
            { key: 'month',    label: 'Month View' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'all',      label: 'All Events' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === f.key ? 'bg-[#1a2744] text-white shadow' : 'bg-[#f5f0e8] text-slate-600 hover:bg-[#e8e0d0]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={goToday} className="text-xs font-semibold text-[#1a2744] px-3 py-1.5 rounded-lg border border-[#e0d9cc] hover:bg-[#f5f0e8]">
            Today
          </button>
          {filter === 'month' && (
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f0e8] text-[#1a2744]">
                <ChevronLeft size={16} />
              </button>
              <h2 className="text-base font-bold text-[#1a2744] w-44 text-center">{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f0e8] text-[#1a2744]">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          {filter === 'month' && (
            <span className="text-xs text-slate-400 font-medium">{monthEventCount} event{monthEventCount !== 1 ? 's' : ''} this month</span>
          )}
          {filter === 'upcoming' && (
            <span className="text-xs text-slate-400 font-medium">{filteredEvents.length} upcoming event{filteredEvents.length !== 1 ? 's' : ''}</span>
          )}
          {filter === 'all' && (
            <span className="text-xs text-slate-400 font-medium">{filteredEvents.length} total event{filteredEvents.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Month view */}
      {filter === 'month' && (
        <>
          {/* Calendar grid */}
          <div className="border-b border-[#e0d9cc]">
            <div className="grid grid-cols-7 bg-[#f5f0e8]">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest py-2.5 border-r border-[#e8e0d0] last:border-0">
                  {d}
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

      {/* Upcoming / All Events list view */}
      {(filter === 'upcoming' || filter === 'all') && (
        <EventList events={filteredEvents} onEventClick={onEventClick} />
      )}
    </div>
  );
}
