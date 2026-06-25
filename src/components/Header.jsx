import { RefreshCw, Clock, UtensilsCrossed } from 'lucide-react';

export default function Header({ lastUpdated, onRefresh, isLoading }) {
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';
  const formattedDate = lastUpdated
    ? lastUpdated.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <header className="bg-[#111b33] shadow-xl">
      <div className="h-1 bg-gradient-to-r from-[#c9a84c] via-[#e8c96a] to-[#c9a84c]" />
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#c9a84c] rounded-xl flex items-center justify-center shadow-lg">
              <UtensilsCrossed size={22} className="text-[#111b33]" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[#c9a84c] font-serif text-xl font-bold tracking-wide leading-none">Bookends</div>
              <div className="text-slate-400 text-[10px] font-light tracking-[0.2em] uppercase mt-0.5">Catering & Events</div>
            </div>
          </div>
          <div className="w-px h-9 bg-[#243460] mx-1" />
          <div>
            <h1 className="text-white font-semibold text-lg tracking-tight">Sales Event Calendar</h1>
            <p className="text-slate-400 text-xs mt-0.5">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Clock size={12} className="text-[#c9a84c]" />
              <span className="text-slate-400 text-[10px] uppercase tracking-widest">Last updated</span>
            </div>
            <div className="text-white font-mono text-base font-semibold mt-0.5">{formattedTime}</div>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 bg-[#1a2744] hover:bg-[#243460] px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 border border-[#243460] hover:border-[#c9a84c] group"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
            {isLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>
    </header>
  );
}
