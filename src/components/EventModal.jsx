import { X, Calendar, MapPin, Users, UtensilsCrossed, Star, IndianRupee, TrendingUp, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(amount) {
  if (amount === null || amount === undefined) return 'Pending';
  if (amount === 0) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

function formatBalance(amount) {
  if (amount === null || amount === undefined) return { label: 'Pending', cls: 'text-amber-600' };
  if (amount === 0) return { label: 'Cleared ✓', cls: 'text-emerald-600' };
  return { label: formatINR(amount), cls: 'text-red-600' };
}

function formatPax(pax) {
  if (!pax && pax !== 0) return '—';
  const n = Number(pax);
  if (isNaN(n)) return String(pax); // e.g. "ticketed event"
  return n.toLocaleString('en-IN') + ' guests';
}

function formatDate(s) {
  if (!s) return '—';
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function DetailRow({ icon: Icon, label, value, valueClass = '' }) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-[#f0ebe0] last:border-0">
      <div className="w-8 h-8 bg-[#f5f0e8] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-[#1a2744]" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{label}</p>
        <p className={`text-[#1a2744] font-semibold mt-0.5 text-sm leading-relaxed ${valueClass}`}>{value || '—'}</p>
      </div>
    </div>
  );
}

export default function EventModal({ event, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!event) return null;

  const numericPax = parseFloat(event.pax) || 0;
  const eventValue = numericPax * (event.pricePerPax || 0);
  const advance = event.advanceReceived;
  const pct = (eventValue > 0 && advance !== null && advance !== undefined)
    ? Math.round((advance / eventValue) * 100)
    : 0;

  const balance = formatBalance(event.balanceDue);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-6" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col"
        style={{ animation: 'modalIn 0.2s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }`}</style>

        {/* Header */}
        <div className="bg-[#111b33] px-6 py-5 relative">
          <div className="h-1 absolute top-0 left-0 right-0 bg-[#c9a84c]" />
          <div className="flex items-start justify-between gap-3 mt-1">
            <div className="flex-1 min-w-0">
              {event.status && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#1a2744] text-slate-300 mb-2">
                  {event.status}
                </span>
              )}
              <h2 className="text-white text-lg font-bold leading-tight">{event.eventName}</h2>
              <p className="text-slate-400 text-xs mt-1 flex items-center gap-1.5">
                <MapPin size={11} />{event.location}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#1a2744] flex items-center justify-center text-slate-400 hover:text-white transition-colors mt-1"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Collection progress */}
        <div className="px-6 py-3.5 bg-[#f5f0e8] border-b border-[#e0d9cc]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Collection Progress</span>
            <span className="text-xs font-bold text-[#1a2744]">
              {advance === null || advance === undefined ? 'Pending' : `${pct}%`}
            </span>
          </div>
          <div className="h-2 bg-[#e0d9cc] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1a2744] to-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-emerald-600 font-medium">
              {formatINR(event.advanceReceived)} received
            </span>
            <span className="text-[10px] text-red-500 font-medium">
              {event.balanceDue === null || event.balanceDue === undefined
                ? 'Balance pending'
                : event.balanceDue === 0
                ? 'Cleared'
                : `${formatINR(event.balanceDue)} due`}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 max-h-64 overflow-y-auto">
          <DetailRow icon={Calendar} label="Event Date" value={formatDate(event.eventDate)} />
          <DetailRow icon={Users} label="Guest Count" value={formatPax(event.pax)} />
          {event.menu && <DetailRow icon={UtensilsCrossed} label="Menu" value={event.menu} />}
          {event.specialRequest && (
            <DetailRow icon={Star} label="Special Request" value={event.specialRequest} valueClass="text-amber-700" />
          )}
        </div>

        {/* Financials */}
        <div className="mx-6 mb-6 mt-3 bg-[#f5f0e8] rounded-2xl p-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IndianRupee size={11} className="text-slate-400" />
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Per Head</span>
            </div>
            <p className="font-bold text-base text-[#1a2744]">
              {event.pricePerPax === null || event.pricePerPax === undefined ? 'Pending' : formatINR(event.pricePerPax)}
            </p>
          </div>
          <div className="text-center border-x border-[#e0d9cc]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={11} className="text-slate-400" />
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Total Value</span>
            </div>
            <p className="font-bold text-base text-[#1a2744]">
              {eventValue > 0 ? formatINR(eventValue) : 'Pending'}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertCircle size={11} className="text-slate-400" />
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Balance</span>
            </div>
            <p className={`font-bold text-base ${balance.cls}`}>{balance.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
