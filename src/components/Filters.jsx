import { Search, X } from 'lucide-react';

const FILTER_OPTIONS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Events' },
];

export default function Filters({ activeFilter, onFilterChange, searchQuery, onSearchChange, totalShown, totalAll }) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Filter buttons */}
      <div className="flex items-center gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onFilterChange(opt.key)}
            className={`filter-btn ${
              activeFilter === opt.key ? 'filter-btn-active' : 'filter-btn-inactive'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Right side: count + search */}
      <div className="flex items-center gap-4">
        <span className="text-slate-500 text-sm">
          Showing <span className="font-semibold text-bookends-navy">{totalShown}</span>
          {' '}of{' '}
          <span className="font-semibold text-bookends-navy">{totalAll}</span> events
        </span>

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search events…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 py-2.5 rounded-xl border border-bookends-beige-dark bg-white text-sm text-bookends-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-bookends-navy focus:border-transparent w-60 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-bookends-navy"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
