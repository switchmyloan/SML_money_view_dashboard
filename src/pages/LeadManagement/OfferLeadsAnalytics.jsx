import { useEffect, useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { getAnalytics, getDistinctLenders } from '../../api-services/Modules/Leads';
import ToastNotification from '../../components/Notification/ToastNotification';
import OfferLeadsLenderStatsChart from '../../components/OfferLeadsLenderStatsChart';
import ModuleInfoCard from '../../components/ModuleInfoCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList,
} from 'recharts';
import {
  Calendar, RefreshCw, TrendingUp, Building2,
  Users, FileText, ClipboardList, CheckCircle, XCircle, TriangleAlert,
  Target, Cake, Briefcase, IndianRupee,
} from 'lucide-react';

const COLORS = [
  '#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
  '#6366F1', '#14B8A6', '#E11D48', '#A855F7', '#0EA5E9',
];

const OfferLeadsAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [lender, setLender] = useState('');
  const [lenderOptions, setLenderOptions] = useState([]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType === 'range' && dateRange.startDate && dateRange.endDate) {
        params.fromDate = dateRange.startDate;
        params.toDate = dateRange.endDate;
      } else if (filterType) {
        params.type = filterType;
      }
      if (lender) params.lender = lender;

      const res = await getAnalytics(params);
      if (res?.data?.success) {
        setAnalyticsData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      ToastNotification.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [filterType, dateRange.startDate, dateRange.endDate, lender]);

  useEffect(() => {
    if (filterType !== 'range') {
      fetchAnalytics();
    }
  }, [filterType, lender]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDistinctLenders();
        const list = res?.data?.data || res?.data || [];
        const names = (Array.isArray(list) ? list : [])
          .map((x) => (typeof x === 'string' ? x : x?.lenderName || x?.name))
          .filter(Boolean);
        setLenderOptions(Array.from(new Set(names)).sort());
      } catch (err) {
        console.error('Failed to load lenders', err);
      }
    })();
  }, []);

  const handleDateRangeApply = () => {
    if (dateRange.startDate && dateRange.endDate) {
      setFilterType('range');
      setShowDatePicker(false);
      fetchAnalytics();
    } else {
      ToastNotification.error('Please select both start and end dates');
    }
  };

  const summary = analyticsData?.summary || {};
  const lenderWiseData = analyticsData?.lenderWise || [];
  const kbSummary = summary.kbLendingPage || {};
  const withPercent = (rows) => {
    const total = rows.reduce((sum, r) => sum + (Number(r.count) || 0), 0);
    return rows.map(r => ({
      ...r,
      percent: total > 0 ? Number(((r.count / total) * 100).toFixed(1)) : 0,
    }));
  };

  const loanPurposeData = withPercent(
    (analyticsData?.loanPurposeWise || []).map(d => ({ name: d.loanPurpose, count: d.count }))
  );
  const ageRangeData = withPercent(
    (analyticsData?.ageRangeWise || []).map(d => ({ name: d.ageRange, count: d.count }))
  );
  const professionData = Object.values(
    (analyticsData?.professionWise || []).reduce((acc, d) => {
      const key = (d.profession || 'UNKNOWN').toUpperCase();
      if (!acc[key]) acc[key] = { name: key, value: 0 };
      acc[key].value += d.count;
      return acc;
    }, {})
  );
  const incomeRangeData = withPercent(
    (analyticsData?.incomeRangeWise || []).map(d => ({ name: d.incomeRange, count: d.count }))
  );

  // Module-wise overview cards data
  const moduleCards = [
    { title: 'Offer Leads', value: summary.offerLeads || 0, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Selected Lenders', value: summary.selectedLenders || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    // { title: 'KB Lending Page', value: kbSummary.total || 0, icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Draft Leads', value: summary.draftLeads || 0, icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { title: 'MV Success', value: summary.mvSuccess || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  // KB Lending Page status cards
  const kbStatusCards = [
    // { title: 'KB Success', value: kbSummary.success || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    // { title: 'KB Rejected', value: kbSummary.reject || 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    // { title: 'KB Duplicate', value: kbSummary.duplicate || 0, icon: TriangleAlert, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  const lenderBarData = withPercent(
    lenderWiseData.map(item => ({
      name: item.lenderName || 'Unknown',
      count: Number(item.total) || 0,
    }))
  );

  const lenderPieData = lenderWiseData.map(item => ({
    name: item.lenderName || 'Unknown',
    value: Number(item.total) || 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const pct = payload[0]?.payload?.percent;
      return (
        <div className="bg-white px-4 py-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label || payload[0]?.name}</p>
          <p className="text-purple-600 font-medium">
            Count: {payload[0]?.value?.toLocaleString()}
          </p>
          {pct !== undefined && (
            <p className="text-gray-600 text-sm">Share: {pct}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  const SkeletonCard = () => (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-8 bg-gray-300 rounded w-3/4"></div>
    </div>
  );

  return (
    <>
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-purple-600" size={28} />
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">All Modules Overview & Lender-wise Analytics</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {['today', 'yesterday', 'week', 'month'].map(type => (
            <button
              key={type}
              onClick={() => {
                // Toggle: clicking the active button again clears it (back to "All Data")
                setFilterType(prev => (prev === type ? '' : type));
                setDateRange({ startDate: '', endDate: '' });
                setShowDatePicker(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterType === type
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}

          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-all duration-200 ${
                filterType === 'range'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <Calendar size={14} />
              Custom
            </button>
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-72">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                    />
                  </div>
                  <button
                    onClick={handleDateRangeApply}
                    className="w-full bg-purple-600 text-white rounded-md py-1.5 text-sm font-medium hover:bg-purple-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-purple-50 text-gray-600 hover:text-purple-700 transition-all"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Module-wise Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          moduleCards.map(card => (
            <div key={card.title} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 transition duration-300 hover:shadow-md">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-full ${card.bg}`}>
                <card.icon className={card.color} size={24} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* KB Lending Page Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          kbStatusCards.map(card => (
            <div key={card.title} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 transition duration-300 hover:shadow-md">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-full ${card.bg}`}>
                <card.icon className={card.color} size={24} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lender Response Breakdown (Success / Reject / Dedupe) */}
      {/* <OfferLeadsLenderStatsChart /> */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Lender-wise Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-purple-600" />
            Lender-wise Lead Distribution
          </h2>
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="loading loading-spinner loading-lg text-purple-600"></div>
            </div>
          ) : lenderBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={lenderBarData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {lenderBarData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="percent"
                    position="top"
                    formatter={(v) => `${v}%`}
                    style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              No lender data available
            </div>
          )}
        </div>

        {/* Pie Chart - Lender Share */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-600" />
            Lender Share (%)
          </h2>
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="loading loading-spinner loading-lg text-purple-600"></div>
            </div>
          ) : lenderPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={lenderPieData}
                  cx="50%"
                  cy="45%"
                  outerRadius={120}
                  dataKey="value"
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    if (!percent || percent < 0.03) return null;
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{ fontSize: 11, fontWeight: 700 }}
                      >
                        {`${(percent * 100).toFixed(1)}%`}
                      </text>
                    );
                  }}
                >
                  {lenderPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              No lender data available
            </div>
          )}
        </div>
      </div>

      {/* Lender-wise Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 size={20} className="text-purple-600" />
          Lender-wise Breakdown (Selected Lenders)
        </h2>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-gray-100 rounded"></div>
            ))}
          </div>
        ) : lenderWiseData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Lender Name</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Total Leads</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Share %</th>
                </tr>
              </thead>
              <tbody>
                {lenderWiseData.map((lender, index) => {
                  const total = Number(lender.total) || 0;
                  const grandTotal = lenderWiseData.reduce((sum, l) => sum + (Number(l.total) || 0), 0);
                  const share = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          {lender.lenderName || 'Unknown'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-800">{total.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {share}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-3 px-4" colSpan={2}>Total</td>
                  <td className="py-3 px-4 text-right">
                    {lenderWiseData.reduce((sum, l) => sum + (Number(l.total) || 0), 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      100%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">
            No lender data available for the selected period
          </div>
        )}
      </div>

      {/* Offer Leads - Demographic & Loan Insights */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-purple-600" size={22} />
            Offer Leads - Demographic & Loan Insights
          </h2>
          <select
            value={lender}
            onChange={(e) => setLender(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border bg-white text-gray-600 border-gray-300 hover:bg-purple-50 hover:text-purple-700"
            title="Filter by lender"
          >
            <option value="">All Lenders</option>
            {lenderOptions.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loan Purpose Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Target size={20} className="text-purple-600" />
              Loan Purpose Distribution
            </h3>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-purple-600"></div>
              </div>
            ) : loanPurposeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={loanPurposeData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={70}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {loanPurposeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <LabelList
                      dataKey="percent"
                      position="top"
                      formatter={(v) => `${v}%`}
                      style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                No loan purpose data available
              </div>
            )}
          </div>

          {/* Age Range Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Cake size={20} className="text-pink-600" />
              Age Group Distribution
            </h3>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-pink-600"></div>
              </div>
            ) : ageRangeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={ageRangeData} margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {ageRangeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                    <LabelList
                      dataKey="percent"
                      position="top"
                      formatter={(v) => `${v}%`}
                      style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                No age data available
              </div>
            )}
          </div>

          {/* Profession Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              Profession (Salaried / Self-Employed)
            </h3>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-blue-600"></div>
              </div>
            ) : professionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={professionData}
                    cx="50%"
                    cy="45%"
                    outerRadius={100}
                    innerRadius={55}
                    dataKey="value"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      if (!percent) return null;
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#ffffff"
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{ fontSize: 12, fontWeight: 700 }}
                        >
                          {`${(percent * 100).toFixed(1)}%`}
                        </text>
                      );
                    }}
                  >
                    {professionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                No profession data available
              </div>
            )}
          </div>

          {/* Income Range Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <IndianRupee size={20} className="text-green-600" />
              Monthly Income Range
            </h3>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-green-600"></div>
              </div>
            ) : incomeRangeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={incomeRangeData} margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {incomeRangeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 6) % COLORS.length]} />
                    ))}
                    <LabelList
                      dataKey="percent"
                      position="top"
                      formatter={(v) => `${v}%`}
                      style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                No income data available
              </div>
            )}
          </div>
        </div>

        <ModuleInfoCard
          title="High Analytics Dashboard"
          subtitle="High-level charts and metrics summarising the full applicant pool for any selected date range."
          whatYouSee={[
            'Top-line numbers: total applicants, unique phone numbers, and counts for the top-performing lenders.',
            'A per-lender bar chart showing Success / Reject / Duplicate counts at a glance.',
            'Breakdowns by loan purpose, employment type, age, and monthly income.',
            'Date range filter and per-lender filter — every chart re-runs against the same scope.',
          ]}
          dataSource={[
            'Calculated on demand from the same master applicant list that powers the Offer Leads page.',
            'No separate data warehouse — every number you see here is live and reflects the latest state.',
            'The lender filter narrows the view to applicants for whom the chosen lender returned a successful response.',
          ]}
          flow={[
            'User selects date range and lender',
            'System reads the applicant pool',
            'Numbers are aggregated',
            'Charts render with the result',
          ]}
        />
      </div>
    </>
  );
};

export default OfferLeadsAnalytics;
