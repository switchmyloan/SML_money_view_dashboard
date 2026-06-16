import { useEffect, useState, useCallback, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import MainTable from '../../components/Table/MainTable';
import { getHighMisFunnel } from '../../api-services/Modules/Leads';
import { highMisFunnelColumn } from '../../components/TableHeader';
import ModuleInfoCard from '../../components/ModuleInfoCard';
import { ClipboardList, ListChecks } from 'lucide-react';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// MIS feed uses "-" (or blank) as a placeholder when no real status is set.
const displayStatus = (v) => {
  const t = String(v ?? '').trim();
  return (!t || t === '-') ? 'No Status' : t;
};

const CARD_COLORS = [
  { bg: 'bg-purple-50', text: 'text-purple-600' },
  { bg: 'bg-blue-50', text: 'text-blue-600' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { bg: 'bg-amber-50', text: 'text-amber-600' },
];

const HighMisFunnel = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredCount, setFilteredCount] = useState(0);
  const [summaryData, setSummaryData] = useState({ total: 0, statusWise: [], distinctStatuses: [] });

  const [query, setQuery] = useState({
    page_no: 1,
    limit: 10,
    search: '',
    // Default to "today" so a fresh visit lands on today's data (consistent with
    // the other high-ticket modules).
    filter_date: 'today',
    startDate: null,
    endDate: null,
    misStatus: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getHighMisFunnel({
        perPage: query.limit,
        currentPage: query.page_no,
        search: query.search,
        type: query.filter_date || undefined,
        fromDate: query.startDate || undefined,
        toDate: query.endDate || undefined,
        misStatus: query.misStatus || undefined,
      });
      if (res?.data?.success) {
        setRawData(res?.data?.data || []);
        setFilteredCount(res?.data?.pagination?.total || 0);
        const s = res?.data?.summaryObj || {};
        setSummaryData({
          total: Number(s.total) || 0,
          statusWise: Array.isArray(s.statusWise) ? s.statusWise : [],
          distinctStatuses: Array.isArray(s.distinctStatuses) ? s.distinctStatuses : [],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query.limit, query.page_no, query.search, query.filter_date, query.startDate, query.endDate, query.misStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onPageChange = useCallback((pageInfo) => {
    setQuery((prev) => ({ ...prev, page_no: pageInfo.pageIndex + 1, limit: pageInfo.pageSize }));
  }, []);

  const onSearchHandler = useCallback((term) => setQuery((prev) => ({ ...prev, search: term, page_no: 1 })), []);
  const debouncedSearch = useMemo(() => debounce(onSearchHandler, 300), [onSearchHandler]);

  const onFilterByDate = useCallback((type) => {
    setQuery((prev) => ({ ...prev, filter_date: prev.filter_date === type ? '' : type, startDate: null, endDate: null, page_no: 1 }));
  }, []);

  const onFilterByRange = useCallback((range) => {
    setQuery((prev) => ({ ...prev, startDate: range.startDate, endDate: range.endDate, filter_date: '', page_no: 1 }));
  }, []);

  const handleStatusFilter = useCallback((newStatus) => {
    setQuery((prev) => ({ ...prev, misStatus: newStatus, page_no: 1 }));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setQuery((prev) => ({ ...prev, page_no: 1, search: '', filter_date: '', startDate: null, endDate: null, misStatus: '' }));
  }, []);

  const SkeletonCard = () => (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="h-4 w-1/2 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer mb-3" />
      <div className="h-8 w-3/4 rounded-md bg-gradient-to-r from-indigo-100 via-purple-200 to-indigo-100 bg-[length:200%_100%] animate-shimmer" />
    </div>
  );

  const topStatuses = summaryData.statusWise.slice(0, 4);

  return (
    <>
      <Toaster />

      {/* Summary cards — Total + top MIS statuses (click a card to filter) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
              <div>
                <p className="text-sm font-medium text-gray-500">Total MIS Leads</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{summaryData.total.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">{summaryData.statusWise.length} statuses</p>
              </div>
              <div className="p-3 rounded-full bg-indigo-50">
                <ListChecks className="text-indigo-600" size={24} />
              </div>
            </div>

            {topStatuses.length > 0 ? topStatuses.map((s, idx) => {
              const colors = CARD_COLORS[idx];
              const share = summaryData.total > 0 ? ((s.count / summaryData.total) * 100).toFixed(1) : '0.0';
              const active = query.misStatus && query.misStatus.toLowerCase() === String(s.mis_status).toLowerCase();
              return (
                <div
                  key={s.mis_status}
                  className={`flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border transition cursor-pointer hover:shadow-md ${active ? 'border-indigo-400 ring-1 ring-indigo-200' : 'border-gray-200'}`}
                  onClick={() => handleStatusFilter(active ? '' : s.mis_status)}
                  title="Click to filter by this MIS status"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-500 truncate">{displayStatus(s.mis_status)}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{s.count.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">{share}% share</p>
                  </div>
                  <div className={`p-3 rounded-full ${colors.bg} flex-shrink-0 ml-2`}>
                    <ClipboardList className={colors.text} size={24} />
                  </div>
                </div>
              );
            }) : (
              <div className="lg:col-span-4 flex items-center justify-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-400 text-sm">
                No MIS data for selected period
              </div>
            )}
          </>
        )}
      </div>

      <MainTable
        columns={highMisFunnelColumn()}
        data={rawData}
        totalDataCount={filteredCount}
        loading={loading}
        onPageChange={onPageChange}
        onSearch={debouncedSearch}
        onRefresh={fetchData}
        title="High MIS Funnel"
        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}
        onFilterByRange={onFilterByRange}
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}
        onClearAllFilters={handleClearAllFilters}
      />

      <ModuleInfoCard
        title="High MIS Funnel"
        subtitle="MIS status of high-ticket leads — matched to applicants by phone."
        whatYouSee={[
          'One row per MIS entry from the cready_landingpage_misstatus feed.',
          'MIS status, rejection reason, partner, lead type and lead-created date.',
          'Applicant name pulled from Offer Leads (matched by phone).',
          'Summary cards count leads by MIS status — click a card to filter.',
        ]}
        dataSource={[
          'Rows come from the cready_landingpage_misstatus MIS feed.',
          'The applicant name is enriched from the latest Offer Leads record for that phone.',
        ]}
        flow={[
          'Lead submitted on landing page',
          'Pushed to partner',
          'Partner returns MIS status',
          'Status lands in cready_landingpage_misstatus',
          'Row appears here',
        ]}
      />
    </>
  );
};

export default HighMisFunnel;
