import { useEffect, useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  Filter, RefreshCw, Users, Headphones, PhoneCall, ThumbsUp, BadgeCheck,
  Clock, Calendar, TrendingDown, Download,
} from 'lucide-react';
import { getFollowupFunnel, exportStageLeads } from '../../api-services/Modules/Leads';
import ToastNotification from '../../components/Notification/ToastNotification';
import StageLeadsModal from '../../components/StageLeadsModal/StageLeadsModal';
import { useAuth } from '../../custom-hooks/useAuth';

const SCOPES = [
  { value: 'all',   label: 'All' },
  { value: 'high',  label: 'High Ticket' },
  { value: 'short', label: 'Short Ticket' },
];

const RANGES = [
  { value: 'all',       label: 'All' },
  { value: 'today',     label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d',        label: '7D' },
  { value: '30d',       label: '30D' },
  { value: '90d',       label: '90D' },
  { value: 'custom',    label: 'Custom' },
];

// Stage visual config (top → bottom of the funnel).
const STAGE_META = {
  totalLeads: { Icon: Users,      grad: 'from-slate-400 to-slate-500',    ring: 'bg-slate-50 text-slate-600' },
  followedUp: { Icon: Headphones, grad: 'from-purple-500 to-violet-600',  ring: 'bg-purple-50 text-purple-600' },
  connected:  { Icon: PhoneCall,  grad: 'from-indigo-500 to-blue-600',    ring: 'bg-indigo-50 text-indigo-600' },
  interested: { Icon: ThumbsUp,   grad: 'from-sky-500 to-cyan-600',       ring: 'bg-sky-50 text-sky-600' },
  converted:  { Icon: BadgeCheck, grad: 'from-emerald-500 to-teal-600',   ring: 'bg-emerald-50 text-emerald-600' },
};

// Disposition bar colour by sentiment (positive → green/purple, dead → grey, negative → red).
const DISPO_TONE = {
  'converted / disbursed':        'from-emerald-400 to-teal-500',
  'interested':                   'from-purple-400 to-violet-500',
  'call back later':              'from-indigo-400 to-blue-500',
  'documents pending':            'from-blue-400 to-cyan-500',
  'not interested':               'from-rose-400 to-red-500',
  'not eligible':                 'from-rose-400 to-red-500',
  'already availed loan':         'from-amber-400 to-orange-500',
  'language barrier':             'from-amber-400 to-yellow-500',
  'not connected':                'from-gray-300 to-gray-400',
  'wrong number':                 'from-gray-300 to-gray-400',
  'switched off / not reachable': 'from-gray-300 to-gray-400',
};
const dispoTone = (s) => DISPO_TONE[String(s || '').toLowerCase().trim()] || 'from-purple-400 to-indigo-500';

const pct = (n, d) => (d > 0 ? (n / d) * 100 : 0);
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const KpiCard = ({ icon, ring, label, value, sub, loading, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading || !onClick}
    className="text-left w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-purple-200 hover:shadow-md disabled:cursor-default disabled:hover:border-gray-100 disabled:hover:shadow-sm"
  >
    <div className="flex items-center gap-2.5">
      <div className={`grid place-items-center w-9 h-9 rounded-xl ${ring}`}>
        {icon}
      </div>
      <p className="text-[12px] font-semibold text-gray-500">{label}</p>
    </div>
    {loading
      ? <div className="mt-2.5 h-6 w-20 rounded-md bg-gray-200 animate-pulse" />
      : <p className="mt-2 text-2xl font-bold text-gray-900 leading-none">{fmt(value)}</p>}
    {loading
      ? (sub ? <div className="mt-2 h-2.5 w-16 rounded bg-gray-100 animate-pulse" /> : null)
      : (sub ? <p className="mt-1 text-[11px] text-gray-400">{sub}</p> : null)}
  </button>
);

const FollowupFunnel = ({ embedded = false, agent, minMonthlyIncome, maxMonthlyIncome, minLoanAmount }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super-admin';
  const [scope, setScope] = useState('all');
  const [range, setRange] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState(null); // { stage, label } when a card is clicked
  const [exporting, setExporting] = useState(false);

  const fetchFunnel = useCallback(async () => {
    const params = { scope };
    if (agent) params.agent = agent;
    if (minMonthlyIncome) params.minMonthlyIncome = minMonthlyIncome;
    if (maxMonthlyIncome) params.maxMonthlyIncome = maxMonthlyIncome;
    if (minLoanAmount) params.minLoanAmount = minLoanAmount;
    if (range === 'custom') {
      // Wait for a complete, valid custom range before hitting the API — otherwise
      // it would silently return all-time data while "Custom" looks selected.
      if (!customFrom || !customTo || customFrom > customTo) { setLoading(false); return; }
      params.fromDate = customFrom;
      params.toDate = customTo;
    } else if (range !== 'all') {
      params.type = range;
    }
    setLoading(true);
    try {
      const res = await getFollowupFunnel(params);
      if (res?.data?.success) setData(res.data.data);
      else ToastNotification.error('Could not load the funnel');
    } catch (err) {
      ToastNotification.error(err?.response?.data?.message || 'Could not load the funnel');
    } finally {
      setLoading(false);
    }
  }, [scope, range, customFrom, customTo, agent, minMonthlyIncome, maxMonthlyIncome, minLoanAmount]);

  useEffect(() => { fetchFunnel(); }, [fetchFunnel]);

  const totals = data?.totals || {};
  const funnel = data?.funnel || [];
  const breakdown = data?.statusBreakdown || [];
  const top = funnel[0]?.count || 0;            // Total Leads (the universe)
  const followedUp = funnel[1]?.count || 0;     // base for the dispositions "% of followed"
  const maxStatus = breakdown.reduce((m, b) => Math.max(m, b.count), 0);
  const agents = data?.agents || [];

  // Scope a clicked stage's customer list to match the funnel exactly.
  const stageParams = {
    scope,
    ...(agent ? { agent } : {}),
    ...(minMonthlyIncome ? { minMonthlyIncome } : {}),
    ...(maxMonthlyIncome ? { maxMonthlyIncome } : {}),
    ...(minLoanAmount ? { minLoanAmount } : {}),
    ...(range === 'custom'
      ? (customFrom && customTo && customFrom <= customTo ? { fromDate: customFrom, toDate: customTo } : {})
      : (range !== 'all' ? { type: range } : {})),
  };
  const openStage = (stage, label) => setActiveStage({ stage, label });

  // Super-admin: download every followed-up customer in the current funnel scope.
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportStageLeads({ ...stageParams, stage: 'followedUp' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `followup_customers_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      ToastNotification.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {!embedded && (
        <div className="relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-5 shadow-sm mb-4">
          <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500" />
          <div className="flex items-center gap-3">
            <div className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 text-white shadow-md">
              <Filter size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Follow-up Funnel</h1>
              <p className="text-sm text-gray-400">How many customers the call-center followed up, reached, engaged and converted.</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Filters ─── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          {SCOPES.map((s) => (
            <button
              key={s.value}
              onClick={() => setScope(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                scope === s.value
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <span className="hidden sm:inline-block w-px h-6 bg-gray-200" />

        <div className="flex items-center gap-1.5 flex-wrap">
          <Calendar size={15} className="text-gray-400" />
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                range === r.value
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {range === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200" />
            <span className="text-gray-400 text-xs">to</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200" />
            {(!customFrom || !customTo || customFrom > customTo) && (
              <span className="text-[11px] text-amber-600">Pick both dates (from ≤ to)</span>
            )}
          </div>
        )}

        {isSuperAdmin && (
          <button
            onClick={handleExport}
            disabled={exporting}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50"
            title="Export every followed-up customer (current scope) as CSV"
          >
            <Download size={13} /> {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        )}
        <button
          onClick={fetchFunnel}
          className={`${isSuperAdmin ? '' : 'ml-auto '}inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition`}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* ─── KPI cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <KpiCard loading={loading} onClick={() => openStage('totalLeads', 'Total Leads')}     icon={<Users size={17} />}      ring="bg-slate-50 text-slate-600"     label="Total Leads"   value={totals.totalLeads} />
        <KpiCard loading={loading} onClick={() => openStage('followedUp', 'Followed Up')}     icon={<Headphones size={17} />} ring="bg-purple-50 text-purple-600"   label="Followed Up"   value={totals.followedUp}  sub={`${pct(totals.followedUp, totals.totalLeads).toFixed(1)}% of leads`} />
        <KpiCard loading={loading} onClick={() => openStage('connected', 'Connected')}        icon={<PhoneCall size={17} />}  ring="bg-indigo-50 text-indigo-600"   label="Connected"     value={totals.connected}   sub={`${pct(totals.connected, totals.followedUp).toFixed(1)}% of followed`} />
        <KpiCard loading={loading} onClick={() => openStage('interested', 'Interested')}      icon={<ThumbsUp size={17} />}   ring="bg-sky-50 text-sky-600"         label="Interested"    value={totals.interested} />
        <KpiCard loading={loading} onClick={() => openStage('converted', 'Converted')}        icon={<BadgeCheck size={17} />} ring="bg-emerald-50 text-emerald-600" label="Converted"     value={totals.converted}   sub={`${pct(totals.converted, totals.totalLeads).toFixed(1)}% of leads`} />
        <KpiCard loading={loading} onClick={() => openStage('pending', 'Pending Callbacks')}  icon={<Clock size={17} />}      ring="bg-amber-50 text-amber-600"     label="Pending Callbacks" value={totals.pendingCallbacks} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ─── Funnel ─── */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-1">Conversion Funnel</h3>
          <p className="text-[11px] text-gray-400 mb-5">Each stage as a share of total leads, with the drop-off from the previous stage.</p>

          {loading ? (
            <div className="space-y-3">
              {[100, 72, 52, 36, 22].map((w, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-12 rounded bg-gray-100 animate-pulse" />
                  </div>
                  <div className="h-9 rounded-lg bg-gray-200 animate-pulse" style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>
          ) : top === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No leads in this range.</p>
          ) : (
            <div className="space-y-3">
              {funnel.map((stage, i) => {
                const meta = STAGE_META[stage.key] || STAGE_META.totalLeads;
                const shareOfTotal = pct(stage.count, top);
                const prev = i > 0 ? funnel[i - 1].count : null;
                const fromPrev = (prev != null && prev > 0) ? pct(stage.count, prev) : null;
                const width = Math.max(shareOfTotal, stage.count > 0 ? 12 : 6);
                return (
                  <div key={stage.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-700">
                        <meta.Icon size={13} className="text-gray-400" /> {stage.stage}
                      </span>
                      <span className="text-[12px] font-bold text-gray-800">
                        {fmt(stage.count)} <span className="text-[10px] font-medium text-gray-400">({shareOfTotal.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-9 rounded-lg bg-gradient-to-r ${meta.grad} shadow-sm flex items-center px-3 transition-all duration-500`}
                        style={{ width: `${width}%` }}
                      >
                        <span className="text-[11px] font-bold text-white/95">{fmt(stage.count)}</span>
                      </div>
                      {fromPrev != null && (
                        <span className={`text-[10px] font-semibold inline-flex items-center gap-0.5 ${fromPrev < 100 ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {fromPrev < 100 ? <TrendingDown size={11} /> : null}{fromPrev.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Disposition breakdown ─── */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-1">Dispositions</h3>
          <p className="text-[11px] text-gray-400 mb-4">Followed-up customers by feedback status.</p>

          {loading ? (
            <div className="space-y-3">
              {[80, 64, 52, 40, 28].map((w, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-8 rounded bg-gray-100 animate-pulse" />
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 animate-pulse" style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>
          ) : breakdown.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No feedback recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {breakdown.map((b) => (
                <div key={b.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-gray-700 truncate pr-2">{b.status}</span>
                    <span className="text-[12px] font-bold text-gray-800">
                      {fmt(b.count)} <span className="text-[10px] font-medium text-gray-400">({pct(b.count, followedUp).toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${dispoTone(b.status)}`}
                      style={{ width: `${Math.max(pct(b.count, maxStatus), 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Agent Activity ─── */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden mt-4">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
          <div className="grid place-items-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600"><Headphones size={16} /></div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Agent Activity</h3>
            <p className="text-[11px] text-gray-400">How many customers each call-center agent contacted in this period.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-2.5 font-semibold">Agent</th>
                <th className="px-3 py-2.5 font-semibold text-right">Customers Contacted</th>
                <th className="px-3 py-2.5 font-semibold text-right">Follow-ups (calls)</th>
                <th className="px-3 py-2.5 font-semibold text-right">Converted</th>
                <th className="px-3 py-2.5 font-semibold text-right">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse shrink-0" />
                        <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
                      </div>
                    </td>
                    <td className="px-3 py-3"><div className="h-3 w-10 ml-auto rounded bg-gray-200 animate-pulse" /></td>
                    <td className="px-3 py-3"><div className="h-3 w-10 ml-auto rounded bg-gray-100 animate-pulse" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-8 ml-auto rounded-full bg-gray-100 animate-pulse" /></td>
                    <td className="px-3 py-3"><div className="h-3 w-20 ml-auto rounded bg-gray-100 animate-pulse" /></td>
                  </tr>
                ))
              ) : agents.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">No agent activity in this period.</td></tr>
              ) : agents.map((a) => (
                <tr key={a.agent} className="border-b border-gray-50 hover:bg-purple-50/20 transition">
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="grid place-items-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-[11px] font-bold shrink-0">
                        {(a.agent || '?').charAt(0).toUpperCase()}
                      </span>
                      <span className="text-[13px] font-semibold text-gray-800">{a.agent}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-[13px] font-bold text-gray-900">{fmt(a.contacted)}</td>
                  <td className="px-3 py-3 text-right text-[13px] text-gray-600">{fmt(a.actions)}</td>
                  <td className="px-3 py-3 text-right">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">{fmt(a.converted)}</span>
                  </td>
                  <td className="px-3 py-3 text-right text-[11px] text-gray-400">
                    {a.lastActive ? new Date(a.lastActive).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeStage && (
        <StageLeadsModal
          stage={activeStage.stage}
          label={activeStage.label}
          params={stageParams}
          canExport={isSuperAdmin}
          onClose={() => setActiveStage(null)}
        />
      )}
    </div>
  );
};

export default FollowupFunnel;
