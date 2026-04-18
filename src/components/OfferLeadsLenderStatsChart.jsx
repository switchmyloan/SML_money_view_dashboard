import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';
import { CheckCircle, XCircle, TriangleAlert, BarChart3, RefreshCw } from 'lucide-react';
import { getOfferLeadsLenderStats } from '../api-services/Modules/Leads';

const STATUS_COLORS = {
  success: '#10B981',
  reject: '#EF4444',
  dedupe: '#F59E0B',
};

const FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
];

const OfferLeadsLenderStatsChart = () => {
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('today');
  const [stats, setStats] = useState({
    totalLeads: 0,
    totals: { success: 0, reject: 0, dedupe: 0, total: 0 },
    lenderWise: [],
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOfferLeadsLenderStats({ type: filterType || undefined });
      const payload = res?.data?.data || {};
      setStats({
        totalLeads: payload.totalLeads || 0,
        totals: payload.totals || { success: 0, reject: 0, dedupe: 0, total: 0 },
        lenderWise: Array.isArray(payload.lenderWise) ? payload.lenderWise : [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const totals = stats.totals || {};
  const summaryCards = [
    { title: 'Success', value: totals.success || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Rejected', value: totals.reject || 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Dedupe', value: totals.dedupe || 0, icon: TriangleAlert, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  const pieData = [
    { name: 'Success', value: totals.success || 0, fill: STATUS_COLORS.success },
    { name: 'Rejected', value: totals.reject || 0, fill: STATUS_COLORS.reject },
    { name: 'Dedupe', value: totals.dedupe || 0, fill: STATUS_COLORS.dedupe },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
          <BarChart3 size={16} className="text-purple-600" />
          Lender Response Breakdown (Success / Reject / Dedupe)
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value || 'all'}
              onClick={() => setFilterType(opt.value)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all duration-200 ${
                filterType === opt.value
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={fetchStats}
            className="p-1.5 rounded-md bg-white border border-gray-300 hover:bg-purple-50 text-gray-600 hover:text-purple-700 transition-all"
            title="Refresh"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Summary cards - compact column */}
        <div className="lg:col-span-3 grid grid-cols-3 lg:grid-cols-1 gap-2">
          {summaryCards.map(card => (
            <div key={card.title} className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 truncate">{card.title}</p>
                <p className="text-base font-bold text-gray-900 leading-tight">{Number(card.value).toLocaleString()}</p>
              </div>
              <div className={`p-1.5 rounded-full ${card.bg} flex-shrink-0 ml-1`}>
                <card.icon className={card.color} size={16} />
              </div>
            </div>
          ))}
        </div>

        {/* Stacked bar chart per lender */}
        <div className="lg:col-span-6">
          <h3 className="text-xs font-semibold text-gray-700 mb-1">Lender-wise Status</h3>
          {loading ? (
            <div className="h-44 flex items-center justify-center text-gray-400 text-xs">Loading...</div>
          ) : stats.lenderWise.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.lenderWise} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="lenderName"
                  tick={{ fontSize: 9, fill: '#6b7280' }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  height={50}
                />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip wrapperStyle={{ fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                <Bar dataKey="success" name="Success" stackId="a" fill={STATUS_COLORS.success} />
                <Bar dataKey="dedupe" name="Dedupe" stackId="a" fill={STATUS_COLORS.dedupe} />
                <Bar dataKey="reject" name="Reject" stackId="a" fill={STATUS_COLORS.reject} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-gray-400 text-xs">No data available</div>
          )}
        </div>

        {/* Pie - overall split */}
        <div className="lg:col-span-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-1">Overall Share</h3>
          {loading ? (
            <div className="h-44 flex items-center justify-center text-gray-400 text-xs">Loading...</div>
          ) : (totals.total || 0) > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={32}
                  dataKey="value"
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip wrapperStyle={{ fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-gray-400 text-xs">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferLeadsLenderStatsChart;
