import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import KPICards from './components/KPICards';
import CalendarView from './components/CalendarView';
import EventTable from './components/EventTable';
import EventModal from './components/EventModal';
import { fetchEvents } from './services/api';

const TABS = [
  { key: 'calendar', label: 'Calendar' },
  { key: 'table', label: 'All Events' },
];

export default function App() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchEvents();
      setEvents(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadEvents]);

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Header lastUpdated={lastUpdated} onRefresh={loadEvents} isLoading={isLoading} />

      <main className="flex-1 px-3 sm:px-6 pb-6 sm:pb-8 max-w-[1800px] mx-auto w-full">
        {/* KPI Cards */}
        <div className="mt-4 sm:mt-5">
          <KPICards events={events} />
        </div>

        {/* Tab bar */}
        <div className="mt-4 sm:mt-5 flex items-center gap-1 sm:gap-2 border-b border-[#e0d9cc] overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all -mb-px whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white text-[#1a2744] border border-b-white border-[#e0d9cc]'
                  : 'text-slate-500 hover:text-[#1a2744] hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
            <span className="font-semibold">Error:</span> {error}
            <button onClick={loadEvents} className="ml-auto text-red-600 underline text-sm">Retry</button>
          </div>
        )}

        {/* Tab content */}
        <div className="mt-0 bg-white rounded-b-2xl rounded-tr-2xl border border-t-0 border-[#e0d9cc] shadow-sm">
          {activeTab === 'calendar' && (
            <CalendarView events={events} isLoading={isLoading} onEventClick={setSelectedEvent} />
          )}
          {activeTab === 'table' && (
            <div className="p-2 sm:p-5">
              <EventTable events={events} onRowClick={setSelectedEvent} isLoading={isLoading} />
            </div>
          )}
        </div>
      </main>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
