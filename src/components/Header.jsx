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
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#c9a84c] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <UtensilsCrossed size={18} className="text-[#111b33] sm:hidden" strokeWidth={2.5} />
              <UtensilsCrossed size={22} className="text-[#111b33] hidden sm:block" strokeWidth={2.5} />
            </div>
            <div className="hidden xs:block">
              <div className="text-[#c9a84c] font-serif text-base sm:text-xl font-bold tracking-wide leading-none">Bookends</div>
              <div className="text-slate-400 text-[9px] sm:text-[10px] font-light tracking-[0.2em] uppercase mt-0.5 hidden sm:block">Catering & Events</div>
            </div>
          </div>
          <div className="w-px h-7 sm:h-9 bg-[#243460] mx-0.5 sm:mx-1 hidden sm:block" />
          <div className="min-w-0">
            <h1 className="text-white font-semibold text-sm sm:text-lg tracking-tight truncate">Sales Event Calendar</h1>
            <p className="text-slate-400 text-[10px] sm:text-xs mt-0.5 hidden sm:block">{formattedDate}</p>
          </div>
        </div>

        {/* Right: timestamp + refresh */}
        <div className="flex items-center gap-3 sm:gap-5 ml-auto">
          <div className="text-right hidden md:block">
            <div className="flex items-center gap-1.5 justify-end">
              <Clock size={12} className="text-[#c9a84c]" />
              <span className="text-slate-400 text-[10px] uppercase tracking-widest">Last updated</span>
            </div>
            <div className="text-white font-mono text-base font-semibold mt-0.5">{formattedTime}</div>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 sm:gap-2 bg-[#1a2744] hover:bg-[#243460] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 border border-[#243460] hover:border-[#c9a84c] group flex-shrink-0"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
            <span className="hidden xs:inline">{isLoading ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
