import { Calendar, CalendarDays, IndianRupee, AlertCircle } from 'lucide-react';

function fmt(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function KPICard({ icon: Icon, label, value, subLabel, accent, iconBg }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#e0d9cc] shadow-sm flex items-start justify-between gap-4">
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold mt-1.5 leading-none" style={{ color: accent }}>{value}</p>
        {subLabel && <p className="text-slate-400 text-xs mt-2 leading-snug max-w-[180px]">{subLabel}</p>}
      </div>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
        <Icon size={20} style={{ color: accent }} strokeWidth={2} />
      </div>
    </div>
  );
}

export default function KPICards({ events }) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  const todayEvents = events.filter(e => e.eventDate === todayStr);
  const monthEvents = events.filter(e => { const d = new Date(e.eventDate); return d >= monthStart && d <= monthEnd; });
  const totalValue = events.reduce((s, e) => s + (e.pax || 0) * (e.pricePerPax || 0), 0);
  const outstanding = events.filter(e => e.status !== 'Cancelled').reduce((s, e) => s + (e.balanceDue || 0), 0);

  return (
    <div className="grid grid-cols-4 gap-4">
      <KPICard icon={Calendar} label="Today's Events" value={todayEvents.length}
        subLabel={todayEvents.length ? todayEvents.map(e => e.eventName).join(', ') : 'No events today'}
        accent="#1a2744" iconBg="#e8f0fe" />
      <KPICard icon={CalendarDays} label="This Month's Events" value={monthEvents.length}
        subLabel={`${today.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`}
        accent="#2563eb" iconBg="#dbeafe" />
      <KPICard icon={IndianRupee} label="Total Event Value" value={fmt(totalValue)}
        subLabel={`${events.filter(e => e.status !== 'Cancelled').length} active events`}
        accent="#059669" iconBg="#d1fae5" />
      <KPICard icon={AlertCircle} label="Outstanding Balance" value={fmt(outstanding)}
        subLabel="Pending collections" accent="#d97706" iconBg="#fef3c7" />
    </div>
  );
}
