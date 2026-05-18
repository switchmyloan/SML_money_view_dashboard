import { useEffect, useMemo, useState, useCallback } from 'react';
import {
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import {
    Search, Download, RefreshCw, ChevronLeft, ChevronRight,
    Activity, ArrowUpRight, ArrowDownRight, ArrowUpDown, Layers, Wallet,
    Banknote, Timer, Calendar, FileDown, Building2, IndianRupee,
    TrendingUp, Hash, X,
} from 'lucide-react';
import {
    getDisbursalKpis, getDisbursalTrend, getDisbursalLenderStats,
    getDisbursalLenderBreakdown, getDisbursalEmploymentMix,
    getDisbursalTransactions, getDisbursalFilterOptions,
} from '../../api-services/Modules/Disbursal';
import { getLenderMeta, getLenderInitials } from '../../utils/lenderLogos';
import ModuleInfoCard from '../../components/ModuleInfoCard';

const LenderAvatar = ({ name, size = 24 }) => {
    const meta = getLenderMeta(name);
    const cls = 'rounded-md grid place-items-center overflow-hidden flex-shrink-0';
    const style = { width: size, height: size };
    if (meta.logo) {
        return (
            <div className={`${cls} bg-white border border-gray-200`} style={style}>
                <img src={meta.logo} alt={name || ''} className="w-full h-full object-contain" />
            </div>
        );
    }
    return (
        <div
            className={`${cls} text-white text-[10px] font-semibold`}
            style={{ ...style, background: meta.color }}
        >
            {getLenderInitials(name)}
        </div>
    );
};

/* FORMATTERS */
const fmtINR = (n) => {
    if (n == null || isNaN(n)) return '₹0';
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
    if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
    return `₹${Number(n).toLocaleString('en-IN')}`;
};
const fmtINRFull = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtNum = (n) => Number(n || 0).toLocaleString('en-IN');
const fmtTimeAgo = (ts) => {
    if (!ts) return '—';
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
};
const fmtDate = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtBucketLabel = (bucket, granularity) => {
    if (!bucket) return '';
    const d = new Date(bucket);
    if (granularity === 'monthly') return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    if (granularity === 'weekly') return `W ${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const COLORS = {
    brand: '#047857',
    brand2: '#0d9488',
    accent: '#0891b2',
    info: '#2563eb',
    pos: '#059669',
    neg: '#dc2626',
    warn: '#b45309',
};

/* KPI CARD */
const KpiCard = ({ icon: Icon, label, value, sub, delta, deltaPositive, color = COLORS.brand }) => (
    <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm p-5 overflow-hidden hover:shadow-md transition-all">
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, ${COLORS.brand2})` }} />
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 grid place-items-center rounded-lg bg-gray-50 border border-gray-200">
                    <Icon size={14} className="text-gray-600" />
                </div>
                <span className="text-[12.5px] font-medium text-gray-600">{label}</span>
            </div>
            {delta != null && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    deltaPositive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                    {deltaPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                    {Math.abs(delta).toFixed(1)}%
                </span>
            )}
        </div>
        <div className="text-[30px] font-semibold tracking-tight leading-none mt-4 text-gray-900">{value}</div>
        {sub && <div className="text-[12px] text-gray-500 mt-1.5">{sub}</div>}
    </div>
);

/* TREND CHART */
const TrendChart = ({ range, scope, fromDate, toDate }) => {
    const [granularity, setGranularity] = useState('daily');
    const [metric, setMetric] = useState('amount');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (range === 'Custom' && (!fromDate || !toDate)) return;
        let cancel = false;
        setLoading(true);
        getDisbursalTrend({ range, granularity, scope, fromDate, toDate })
            .then(res => { if (!cancel) setData(res?.data?.data || []); })
            .catch(e => console.error(e))
            .finally(() => { if (!cancel) setLoading(false); });
        return () => { cancel = true; };
    }, [range, granularity, scope, fromDate, toDate]);

    const chartData = useMemo(
        () => data.map(d => ({ ...d, label: fmtBucketLabel(d.bucket, granularity) })),
        [data, granularity]
    );
    const seriesKey = metric === 'amount' ? 'amount' : 'count';
    const total = chartData.reduce((s, d) => s + (d[seriesKey] || 0), 0);
    const avg = chartData.length ? total / chartData.length : 0;
    const peak = chartData.reduce((m, d) => (d[seriesKey] > (m?.[seriesKey] ?? -Infinity) ? d : m), chartData[0]);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-[14.5px] font-semibold tracking-tight text-gray-900">Disbursal trend</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            {granularity}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-3 mt-2">
                        <span className="text-[24px] font-semibold leading-none">
                            {metric === 'amount' ? `₹${total.toFixed(2)} Cr` : fmtNum(total)}
                        </span>
                        <span className="text-[12px] text-gray-500">
                            total · avg <span className="font-mono text-gray-800">
                                {metric === 'amount' ? `₹${avg.toFixed(2)} Cr` : fmtNum(Math.round(avg))}
                            </span> per {granularity === 'daily' ? 'day' : granularity === 'weekly' ? 'week' : 'month'}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <div className="inline-flex p-[3px] gap-[2px] rounded-lg bg-gray-100 border border-gray-200">
                        {[
                            { v: 'amount', icon: IndianRupee, label: 'Amount' },
                            { v: 'count', icon: Hash, label: 'Count' },
                        ].map(opt => (
                            <button key={opt.v}
                                onClick={() => setMetric(opt.v)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium transition ${
                                    metric === opt.v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                }`}>
                                <opt.icon size={11} /> {opt.label}
                            </button>
                        ))}
                    </div>
                    <div className="inline-flex p-[3px] gap-[2px] rounded-lg bg-gray-100 border border-gray-200">
                        {['daily', 'weekly', 'monthly'].map(g => (
                            <button key={g}
                                onClick={() => setGranularity(g)}
                                className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition ${
                                    granularity === g ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                }`}>
                                {g[0].toUpperCase() + g.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-[260px]">
                {loading ? (
                    <div className="h-full grid place-items-center text-gray-400 text-sm">Loading…</div>
                ) : chartData.length === 0 ? (
                    <div className="h-full grid place-items-center text-gray-400 text-sm">No data in selected range</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                            <defs>
                                <linearGradient id="grad-trend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={COLORS.brand} stopOpacity={0.4} />
                                    <stop offset="60%" stopColor={COLORS.brand} stopOpacity={0.1} />
                                    <stop offset="100%" stopColor={COLORS.brand} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#ededea" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="label" tick={{ fill: '#8a8f9a', fontSize: 11 }} axisLine={false} tickLine={false} dy={4} />
                            <YAxis tick={{ fill: '#8a8f9a', fontSize: 11 }} axisLine={false} tickLine={false}
                                tickFormatter={(v) => metric === 'amount' ? `₹${v}` : fmtNum(v)} />
                            <Tooltip
                                cursor={{ stroke: '#d6d4cb', strokeWidth: 1, strokeDasharray: '3 3' }}
                                contentStyle={{ background: '#fff', border: '1px solid #d6d4cb', borderRadius: 10, fontSize: 12 }}
                                formatter={(v) => [metric === 'amount' ? `₹${Number(v).toFixed(2)} Cr` : fmtNum(v), metric === 'amount' ? 'Amount' : 'Count']}
                            />
                            <Area type="monotone" dataKey={seriesKey}
                                stroke={COLORS.brand} strokeWidth={2.2}
                                fill="url(#grad-trend)" dot={{ r: 0 }}
                                activeDot={{ r: 5, fill: COLORS.brand, stroke: '#fff', strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {peak && (
                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-[12px] flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <div className="w-[10px] h-[10px] rounded-[3px]" style={{ background: `linear-gradient(90deg, ${COLORS.brand}, ${COLORS.brand2})` }} />
                        <span className="text-gray-500">Disbursal {metric}</span>
                    </div>
                    <div className="text-gray-500 ml-auto">
                        Peak: <span className="font-mono text-gray-800">
                            {metric === 'amount' ? `₹${peak.amount} Cr` : fmtNum(peak.count)}
                        </span> · {peak.label}
                    </div>
                </div>
            )}
        </div>
    );
};

/* EMPLOYMENT MIX (replaces Product Mix from PDF — we don't have product column) */
const EmploymentMix = ({ range, scope, fromDate, toDate }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const palette = ['#047857', '#0891b2', '#7c3aed', '#b45309', '#dc2626', '#0d9488'];

    useEffect(() => {
        if (range === 'Custom' && (!fromDate || !toDate)) return;
        let cancel = false;
        setLoading(true);
        getDisbursalEmploymentMix({ range, scope, fromDate, toDate })
            .then(res => { if (!cancel) setData(res?.data?.data || []); })
            .catch(e => console.error(e))
            .finally(() => { if (!cancel) setLoading(false); });
        return () => { cancel = true; };
    }, [range, scope, fromDate, toDate]);

    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full flex flex-col">
            <div>
                <h3 className="text-[14.5px] font-semibold tracking-tight text-gray-900">Employment mix</h3>
                <p className="text-[12.5px] text-gray-500 mt-1">Disbursals by employment type</p>
            </div>

            <div className="relative h-[190px] mt-3">
                {loading ? (
                    <div className="h-full grid place-items-center text-gray-400 text-sm">Loading…</div>
                ) : data.length === 0 ? (
                    <div className="h-full grid place-items-center text-gray-400 text-sm">No data</div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} dataKey="value" innerRadius={58} outerRadius={82} paddingAngle={3} stroke="#fff" strokeWidth={3}>
                                    {data.map((d, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#fff', border: '1px solid #d6d4cb', borderRadius: 10, fontSize: 12 }}
                                    formatter={(v, n) => [`${fmtNum(v)} (${((v / total) * 100).toFixed(1)}%)`, n]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[24px] font-semibold leading-none">{fmtNum(total)}</span>
                            <span className="text-[10px] text-gray-400 mt-1 tracking-wider">DISBURSALS</span>
                        </div>
                    </>
                )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
                {data.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-[9px] h-[9px] rounded-[3px]" style={{ background: palette[i % palette.length] }} />
                            <span className="text-[12.5px] truncate max-w-[150px]">{d.name}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="font-mono text-[12.5px] font-medium">{fmtNum(d.value)}</span>
                            <span className="font-mono text-[11px] text-gray-400 min-w-[42px] text-right">
                                {total ? ((d.value / total) * 100).toFixed(1) : '0.0'}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* LENDER DATE-WISE BREAKDOWN MODAL */
const LenderBreakdownModal = ({ lender, range, scope, fromDate, toDate, onClose }) => {
    const [data, setData] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sortDir, setSortDir] = useState('desc'); // 'desc' = newest first

    useEffect(() => {
        if (!lender) return;
        let cancel = false;
        setLoading(true);
        getDisbursalLenderBreakdown({ lender, range, scope, fromDate, toDate })
            .then(res => {
                if (cancel) return;
                const d = res?.data?.data || {};
                setData(d.data || []);
                setTotalAmount(d.totalAmount || 0);
                setTotalCount(d.totalCount || 0);
            })
            .catch(e => console.error(e))
            .finally(() => { if (!cancel) setLoading(false); });
        return () => { cancel = true; };
    }, [lender, range, scope, fromDate, toDate]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const sortedData = useMemo(
        () => [...data].sort((a, b) =>
            sortDir === 'desc'
                ? new Date(b.bucket) - new Date(a.bucket)
                : new Date(a.bucket) - new Date(b.bucket)
        ),
        [data, sortDir]
    );

    const maxAmount = sortedData.reduce((m, d) => Math.max(m, d.amount), 0) || 1;

    const exportCsv = () => {
        const header = ['Date', 'Amount', 'Count'];
        const rows = sortedData.map(d => [fmtDate(d.bucket), d.amount, d.count]);
        const csv = [header, ...rows]
            .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${lender}-daily-breakdown-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-[720px] max-h-[88vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-start gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <LenderAvatar name={lender} size={36} />
                            <div>
                                <h3 className="text-[15px] font-semibold tracking-tight text-gray-900">{lender}</h3>
                                <p className="text-[12px] text-gray-500">Date-wise disbursal breakdown · {range}</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition">
                        <X size={14} />
                    </button>
                </div>

                {/* Summary */}
                <div className="px-5 py-3 grid grid-cols-3 gap-3 border-b border-gray-100 bg-gray-50/60">
                    <div>
                        <div className="text-[10.5px] text-gray-400 uppercase tracking-wider">Total Amount</div>
                        <div className="font-mono text-[15px] font-semibold text-emerald-700 mt-0.5">
                            {fmtINRFull(totalAmount)}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10.5px] text-gray-400 uppercase tracking-wider">Total Disbursals</div>
                        <div className="font-mono text-[15px] font-semibold text-gray-900 mt-0.5">{fmtNum(totalCount)}</div>
                    </div>
                    <div>
                        <div className="text-[10.5px] text-gray-400 uppercase tracking-wider">Active Days</div>
                        <div className="font-mono text-[15px] font-semibold text-gray-900 mt-0.5">{fmtNum(sortedData.length)}</div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="px-5 py-2 flex justify-between items-center border-b border-gray-100">
                    <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition">
                        <ArrowUpDown size={11} />
                        Date: {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
                    </button>
                    <button onClick={exportCsv}
                        disabled={!sortedData.length}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                        <Download size={11} /> Export CSV
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-y-auto flex-1">
                    {loading ? (
                        <div className="h-[200px] grid place-items-center text-gray-400 text-sm">Loading…</div>
                    ) : sortedData.length === 0 ? (
                        <div className="h-[200px] grid place-items-center text-gray-400 text-sm">No disbursals in selected range</div>
                    ) : (
                        <table className="w-full text-[13px]">
                            <thead className="sticky top-0 bg-white border-b border-gray-200">
                                <tr>
                                    <th className="text-left font-medium text-[11px] tracking-wider uppercase text-gray-400 px-5 py-2.5">Date</th>
                                    <th className="text-left font-medium text-[11px] tracking-wider uppercase text-gray-400 px-5 py-2.5">Share</th>
                                    <th className="text-right font-medium text-[11px] tracking-wider uppercase text-gray-400 px-5 py-2.5">Count</th>
                                    <th className="text-right font-medium text-[11px] tracking-wider uppercase text-gray-400 px-5 py-2.5">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((d, i) => {
                                    const pct = (d.amount / maxAmount) * 100;
                                    const sharePct = totalAmount ? (d.amount / totalAmount) * 100 : 0;
                                    return (
                                        <tr key={d.bucket || i} className="hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0">
                                            <td className="px-5 py-2.5">
                                                <div className="font-mono text-[12.5px] text-gray-800">{fmtDate(d.bucket)}</div>
                                                <div className="text-[10.5px] text-gray-400 mt-0.5">{fmtTimeAgo(d.bucket)}</div>
                                            </td>
                                            <td className="px-5 py-2.5">
                                                <div className="flex items-center gap-2 min-w-[140px]">
                                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full"
                                                            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS.brand}, ${COLORS.brand2})` }} />
                                                    </div>
                                                    <span className="font-mono text-[10.5px] text-gray-400 min-w-[34px] text-right">
                                                        {sharePct.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-2.5 font-mono text-right text-[12.5px] text-gray-700">{fmtNum(d.count)}</td>
                                            <td className="px-5 py-2.5 font-mono text-right text-[13px] font-semibold text-emerald-700">
                                                {fmtINRFull(d.amount)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

/* LENDER LIST (used for both amount & count) */
const LenderChart = ({ kind, data, loading, onLenderClick }) => {
    const isAmount = kind === 'amount';
    const sorted = useMemo(
        () => [...data].sort((a, b) => isAmount ? b.amount - a.amount : b.count - a.count),
        [data, isAmount]
    );
    const max = sorted[0]?.[kind] || 1;
    const total = sorted.reduce((s, d) => s + d[kind], 0);
    const Icon = isAmount ? Wallet : Hash;
    const title = isAmount ? 'Total disbursal amount by lender' : 'Disbursal count by lender';
    const subtitle = isAmount ? 'Ranked by ₹ value' : 'Ranked by transaction volume';
    const accent = isAmount ? COLORS.brand : COLORS.info;
    const accentBg = isAmount ? 'bg-emerald-50' : 'bg-blue-50';

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg grid place-items-center ${accentBg}`}>
                            <Icon size={13} style={{ color: accent }} />
                        </div>
                        <h3 className="text-[14.5px] font-semibold tracking-tight text-gray-900">{title}</h3>
                    </div>
                    <p className="text-[12.5px] text-gray-500 mt-1 ml-9">{subtitle}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    <Building2 size={11} /> {sorted.length} lenders
                </span>
            </div>

            {loading ? (
                <div className="h-[300px] grid place-items-center text-gray-400 text-sm">Loading…</div>
            ) : sorted.length === 0 ? (
                <div className="h-[300px] grid place-items-center text-gray-400 text-sm">No data</div>
            ) : (
                <div className="flex flex-col gap-1">
                    {sorted.map((d, i) => {
                        const v = d[kind];
                        const pct = (v / max) * 100;
                        const sharePct = total ? (v / total) * 100 : 0;
                        return (
                            <div key={d.name + i}
                                onClick={() => onLenderClick && onLenderClick(d.name)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' && onLenderClick) onLenderClick(d.name); }}
                                title="Click to view date-wise breakdown"
                                className="grid grid-cols-[140px_1fr_90px] gap-3 items-center py-2 px-1 rounded-md hover:bg-gray-50 cursor-pointer transition">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-[11px] w-[18px] text-gray-400">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <LenderAvatar name={d.name} size={20} />
                                    <span className="text-[12.5px] font-medium truncate" title={d.name}>{d.name}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all"
                                            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, ${COLORS.brand2})` }} />
                                    </div>
                                    <div className="text-[10.5px] text-gray-400">{sharePct.toFixed(1)}% share</div>
                                </div>
                                <div className="font-mono text-[12.5px] font-semibold text-right">
                                    {isAmount ? fmtINRFull(v) : fmtNum(v)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-[12px]">
                <span className="text-gray-400">Total</span>
                <span className="font-mono font-semibold">
                    {isAmount ? fmtINRFull(Math.round(total)) : fmtNum(total)}
                </span>
            </div>
        </div>
    );
};

/* TRANSACTIONS TABLE */
const TransactionsTable = ({ range, scope, fromDate, toDate }) => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [lenderFilter, setLenderFilter] = useState('All');
    const [empFilter, setEmpFilter] = useState('All');
    const [sortKey, setSortKey] = useState('disb_dt');
    const [sortDir, setSortDir] = useState('desc');

    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [filteredAmount, setFilteredAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filterOptions, setFilterOptions] = useState({ lenders: [], employmentTypes: [] });

    useEffect(() => {
        getDisbursalFilterOptions({ scope })
            .then(res => setFilterOptions(res?.data?.data || { lenders: [], employmentTypes: [] }))
            .catch(e => console.error(e));
    }, [scope]);

    const fetchData = useCallback(() => {
        if (range === 'Custom' && (!fromDate || !toDate)) return;
        setLoading(true);
        getDisbursalTransactions({
            currentPage: page,
            perPage,
            search,
            range,
            fromDate,
            toDate,
            lender: lenderFilter,
            employmentType: empFilter,
            scope,
        })
            .then(res => {
                const d = res?.data?.data || {};
                setRows(d.data || []);
                setTotal(d.pagination?.total || 0);
                setFilteredAmount(d.filteredAmount || 0);
            })
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, [page, perPage, search, range, fromDate, toDate, lenderFilter, empFilter, scope]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { setPage(1); }, [search, lenderFilter, empFilter, range, fromDate, toDate]);

    const totalPages = Math.max(1, Math.ceil(total / perPage));

    // Client-side sort on the current page (server already sorts by disb_dt DESC)
    const displayRows = useMemo(() => {
        const arr = [...rows];
        arr.sort((a, b) => {
            let av = a[sortKey], bv = b[sortKey];
            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;
            if (typeof av === 'string') { av = av.toLowerCase(); bv = String(bv).toLowerCase(); }
            if (av < bv) return sortDir === 'asc' ? -1 : 1;
            if (av > bv) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return arr;
    }, [rows, sortKey, sortDir]);

    const toggleSort = (k) => {
        if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(k); setSortDir('desc'); }
    };

    const SortHead = ({ k, children, align = 'left' }) => (
        <th onClick={() => toggleSort(k)}
            className="text-left font-medium text-[11px] tracking-wider uppercase text-gray-400 px-4 py-3 border-b border-gray-200 bg-gray-50 cursor-pointer select-none hover:text-gray-600"
            style={{ textAlign: align }}>
            <span className="inline-flex items-center gap-1">
                {children}
                <ArrowUpDown size={11} style={{ opacity: sortKey === k ? 1 : 0.35 }} />
            </span>
        </th>
    );

    const exportCsv = () => {
        const header = ['LeadID', 'Customer', 'Phone', 'Lender', 'Entity', 'DisbAmount', 'DisbDate', 'SanctionAmount', 'EmploymentType', 'MISStatus', 'ClientStatus'];
        const rowsCsv = displayRows.map(t => [
            t.lead_id, t.customer_name, t.phone, t.lender, t.entity,
            t.disb_amt, t.disb_dt ? new Date(t.disb_dt).toISOString() : '',
            t.sanction_amt, t.employment_type, t.mis_status, t.client_status,
        ]);
        const csv = [header, ...rowsCsv]
            .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `disbursals-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                <div className="flex justify-between items-start flex-wrap gap-3">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h3 className="text-[14.5px] font-semibold tracking-tight text-gray-900">Disbursal monitoring</h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                {fmtNum(total)} disbursals
                            </span>
                        </div>
                        <p className="text-[12.5px] text-gray-500 mt-1">
                            Total in view: <span className="font-mono text-gray-800 font-medium">{fmtINR(filteredAmount)}</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchData} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12.5px] font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition">
                            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
                        </button>
                        <button onClick={exportCsv} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[12.5px] font-medium hover:bg-emerald-700 transition">
                            <FileDown size={13} /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <div className="relative min-w-[260px] flex-1 max-w-[360px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input className="w-full rounded-lg py-1.5 pr-8 pl-9 text-[13px] border border-gray-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            placeholder="Search lead, customer, phone, lender, UID…"
                            value={search} onChange={e => setSearch(e.target.value)} />
                        {search && (
                            <button onClick={() => setSearch('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 grid place-items-center rounded text-gray-400 hover:text-gray-700">
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    <select value={lenderFilter} onChange={(e) => setLenderFilter(e.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-[12.5px] outline-none focus:border-emerald-500">
                        <option value="All">All Lenders</option>
                        {filterOptions.lenders.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <select value={empFilter} onChange={(e) => setEmpFilter(e.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-[12.5px] outline-none focus:border-emerald-500">
                        <option value="All">All Employment</option>
                        {filterOptions.employmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-[13px] border-collapse">
                    <thead>
                        <tr>
                            <SortHead k="lead_id">Lead ID</SortHead>
                            <SortHead k="customer_name">Customer</SortHead>
                            <SortHead k="lender">Lender</SortHead>
                            <SortHead k="disb_amt" align="right">Disb Amount</SortHead>
                            <SortHead k="sanction_amt" align="right">Sanction</SortHead>
                            <SortHead k="employment_type">Employment</SortHead>
                            <SortHead k="disb_dt">Disb Date</SortHead>
                            <SortHead k="mis_status">Status</SortHead>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && rows.length === 0 && (
                            <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading…</td></tr>
                        )}
                        {!loading && rows.length === 0 && (
                            <tr><td colSpan={8} className="text-center py-12 text-gray-400">No disbursals match your filters.</td></tr>
                        )}
                        {displayRows.map((t, idx) => (
                            <tr key={`${t.lead_id || idx}-${idx}`} className="hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0">
                                <td className="px-4 py-3 font-mono text-[12px] font-semibold text-gray-800">{t.lead_id || '—'}</td>
                                <td className="px-4 py-3">
                                    <div className="text-[13px] text-gray-800">{t.customer_name || '—'}</div>
                                    <div className="text-[11px] text-gray-400 mt-0.5 font-mono">{t.phone10 || t.phone || ''}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <LenderAvatar name={t.lender} size={24} />
                                        <span className="text-[13px]">{t.lender || '—'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-right text-[13px] font-semibold text-emerald-700">
                                    {fmtINRFull(t.disb_amt)}
                                </td>
                                <td className="px-4 py-3 font-mono text-right text-[12.5px] text-gray-600">
                                    {t.sanction_amt ? fmtINRFull(t.sanction_amt) : '—'}
                                </td>
                                <td className="px-4 py-3 text-[12.5px] text-gray-700">{t.employment_type || '—'}</td>
                                <td className="px-4 py-3 font-mono text-[12px] text-gray-600">
                                    <div>{fmtDate(t.disb_dt)}</div>
                                    <div className="text-[10.5px] text-gray-400 mt-0.5">{fmtTimeAgo(t.disb_dt)}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                        /(disbur|success|approved)/i.test(t.mis_status || '')
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : /(reject|fail|cancel)/i.test(t.mis_status || '')
                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                : 'bg-gray-100 text-gray-600 border-gray-200'
                                    }`}>
                                        {t.mis_status || '—'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-5 py-3 flex justify-between items-center border-t border-gray-100">
                <div className="flex items-center gap-3">
                    <span className="text-[12px] text-gray-500">
                        Showing {total === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {fmtNum(total)}
                    </span>
                    <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                        className="rounded-md border border-gray-200 px-2 py-1 text-[12px] outline-none">
                        {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="p-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                        <ChevronLeft size={14} />
                    </button>
                    <span className="font-mono text-[12px] text-gray-600">Page {page} / {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="p-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

/* MAIN DASHBOARD
 * scope: 'mv'    -> only phones present in offerLeads
 *        'short' -> only phones present in shortOfferLeads
 *        undef   -> all disbursements (super-admin view)
 */
const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function DisbursalDashboard({ scope, title, subtitle }) {
    // Default to "Today" so a fresh visit lands on today's disbursals instead of
    // the entire historical pool (kept consistent with the other high-ticket modules).
    const [range, setRange] = useState('Today');
    const [fromDate, setFromDate] = useState(todayISO());
    const [toDate, setToDate] = useState(todayISO());
    const [kpis, setKpis] = useState({ totalAmount: 0, count: 0, avgTicket: 0, avgProcMin: 0 });
    const [lenderStats, setLenderStats] = useState([]);
    const [kpiLoading, setKpiLoading] = useState(true);
    const [lenderLoading, setLenderLoading] = useState(true);
    const [selectedLender, setSelectedLender] = useState(null);

    // Skip API calls when Custom is selected but dates are missing.
    const customIncomplete = range === 'Custom' && (!fromDate || !toDate);

    useEffect(() => {
        if (customIncomplete) return;
        let cancel = false;
        setKpiLoading(true);
        getDisbursalKpis({ range, scope, fromDate, toDate })
            .then(res => { if (!cancel) setKpis(res?.data?.data || {}); })
            .catch(e => console.error(e))
            .finally(() => { if (!cancel) setKpiLoading(false); });
        return () => { cancel = true; };
    }, [range, scope, fromDate, toDate, customIncomplete]);

    useEffect(() => {
        if (customIncomplete) return;
        let cancel = false;
        setLenderLoading(true);
        getDisbursalLenderStats({ range, scope, fromDate, toDate })
            .then(res => { if (!cancel) setLenderStats(res?.data?.data || []); })
            .catch(e => console.error(e))
            .finally(() => { if (!cancel) setLenderLoading(false); });
        return () => { cancel = true; };
    }, [range, scope, fromDate, toDate, customIncomplete]);

    return (
        <div className="max-w-[1440px] mx-auto px-2 pb-10">
            <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
                <div>
                    <div className="flex items-center gap-2.5 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <TrendingUp size={11} /> Operations
                        </span>
                        <span className="text-[12px] text-gray-400">Live disbursal data</span>
                    </div>
                    <h1 className="text-[28px] font-bold leading-tight tracking-tight text-gray-900 flex items-center gap-2">
                        <Layers size={22} className="text-emerald-600" />
                        {title || 'Disbursal monitoring'}
                    </h1>
                    <p className="text-[13px] text-gray-500 mt-1">
                        {subtitle || 'Real-time view of loan disbursals across all lender partners.'}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 text-gray-400 mr-1">
                        <Calendar size={13} />
                        <span className="text-[12px] font-medium">Range:</span>
                    </div>
                    <div className="inline-flex p-[3px] gap-[2px] rounded-lg bg-gray-100 border border-gray-200 flex-wrap">
                        {['Today', 'Yesterday', '24H', '7D', '30D', '90D', 'All', 'Custom'].map(r => (
                            <button key={r}
                                onClick={() => setRange(r)}
                                className={`px-3 py-1 rounded-md text-[12px] font-medium transition ${
                                    range === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                }`}>
                                {r}
                            </button>
                        ))}
                    </div>
                    {range === 'Custom' && (
                        <div className="inline-flex items-center gap-1.5">
                            <input type="date"
                                value={fromDate}
                                max={toDate || todayISO()}
                                onChange={e => setFromDate(e.target.value)}
                                className="rounded-lg border border-gray-200 px-2 py-1 text-[12px] outline-none focus:border-emerald-500" />
                            <span className="text-[12px] text-gray-400">to</span>
                            <input type="date"
                                value={toDate}
                                min={fromDate}
                                max={todayISO()}
                                onChange={e => setToDate(e.target.value)}
                                className="rounded-lg border border-gray-200 px-2 py-1 text-[12px] outline-none focus:border-emerald-500" />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <KpiCard icon={Wallet} label="Total disbursed"
                    value={kpiLoading ? '—' : fmtINRFull(Math.round(kpis.totalAmount || 0))}
                    sub={`across ${fmtNum(kpis.count)} disbursals · ${range}`}
                    color={COLORS.pos} />
                <KpiCard icon={Activity} label="Total disbursals"
                    value={kpiLoading ? '—' : fmtNum(kpis.count)}
                    sub={`in last ${range.toLowerCase()}`}
                    color={COLORS.accent} />
                <KpiCard icon={Banknote} label="Avg. ticket size"
                    value={kpiLoading ? '—' : fmtINRFull(Math.round(kpis.avgTicket || 0))}
                    sub="per disbursal"
                    color={COLORS.brand2} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
                <div className="lg:col-span-2"><TrendChart range={range} scope={scope} fromDate={fromDate} toDate={toDate} /></div>
                <div><EmploymentMix range={range} scope={scope} fromDate={fromDate} toDate={toDate} /></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                <LenderChart kind="amount" data={lenderStats} loading={lenderLoading} onLenderClick={setSelectedLender} />
                <LenderChart kind="count" data={lenderStats} loading={lenderLoading} onLenderClick={setSelectedLender} />
            </div>

            <TransactionsTable range={range} scope={scope} fromDate={fromDate} toDate={toDate} />

            {selectedLender && (
                <LenderBreakdownModal
                    lender={selectedLender}
                    range={range}
                    scope={scope}
                    fromDate={fromDate}
                    toDate={toDate}
                    onClose={() => setSelectedLender(null)}
                />
            )}

            <ModuleInfoCard
                title={scope === 'mv' ? 'High Disbursal Dashboard' : 'Disbursal Dashboard'}
                subtitle="Tracks which lenders actually disbursed loans — how much, how often, and to whom."
                whatYouSee={[
                    'Headline numbers: total amount disbursed, number of transactions, average ticket size, and success rate.',
                    'Trend chart showing daily / weekly disbursal volume over the selected date range.',
                    'Per-lender breakdown of disbursed amount and transaction count, with each lender’s share of the total.',
                    'Employment mix (Salaried vs Self-Employed) to understand which segments are converting.',
                    'A paginated list of individual disbursal transactions with applicant, lender, amount, and timestamp.',
                ]}
                dataSource={[
                    'Disbursal records are maintained by the finance team in their own system and synced into the dashboard.',
                    'Only disbursals that match an applicant from our offer leads are shown here — non-applicant disbursals are excluded.',
                    'Filters available: date range, lender, employment type, and amount range.',
                ]}
                flow={[
                    'Lender disburses a loan',
                    'Finance team records the disbursal',
                    'System syncs the data in',
                    'Matched with our applicants by phone',
                    'Aggregated into KPIs and charts',
                    'Dashboard renders',
                ]}
            />
        </div>
    );
}
