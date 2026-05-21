
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainTable from '../../../components/Table/MainTable';
import { getShortSelectedLenders, getShortDistinctLenders } from '../../../api-services/Modules/Leads';
import { selectedLendersColumn } from '../../../components/TableHeader';
import ExportModal from '../../../components/ExportModal';
import ToastNotification from '../../../components/Notification/ToastNotification';
import { useAuth } from '../../../custom-hooks/useAuth';
import { Building2, Users } from 'lucide-react';
import PremiumPageLoader from '../../../components/PremiumPageLoader';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const ShortSelectedLenders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canExport = ["super-admin", "short-page-admin"].includes(user?.role);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [filteredCount, setFilteredCount] = useState(0);
  const [tablePagination, setTablePagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [summaryData, setSummaryData] = useState({
    totalLeads: 0,
    lenderWise: [],
    distinctStatuses: [],
  });
  const [lenderOptions, setLenderOptions] = useState([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [query, setQuery] = useState({
    page_no: 1,
    limit: 10,
    search: '',
    filter_date: '',
    startDate: null,
    endDate: null,
    lenderName: '',
    status: '',
  });

  useEffect(() => {
    const fetchLenders = async () => {
      try {
        const res = await getShortDistinctLenders();
        if (res?.data?.success) {
          setLenderOptions(res.data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLenders();
  }, []);

  const fetchSelectedLenders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getShortSelectedLenders({
        perPage: query.limit,
        currentPage: query.page_no,
        search: query.search,
        type: query.filter_date || undefined,
        fromDate: query.startDate || undefined,
        toDate: query.endDate || undefined,
        lenderName: query.lenderName || undefined,
        status: query.status || undefined,
      });

      if (res?.data?.success) {
        setRawData(res?.data?.data || []);
        setFilteredCount(res?.data?.pagination?.total || 0);
        const s = res?.data?.summaryObj || {};
        setSummaryData({
          totalLeads: Number(s.total) || 0,
          lenderWise: Array.isArray(s.lenderWise) ? s.lenderWise : [],
          distinctStatuses: Array.isArray(s.distinctStatuses) ? s.distinctStatuses : [],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setFirstLoad(false);
    }
  }, [query.limit, query.page_no, query.search, query.filter_date, query.startDate, query.endDate, query.lenderName, query.status]);

  useEffect(() => {
    fetchSelectedLenders();
  }, [fetchSelectedLenders]);

  const onPageChange = useCallback((pageInfo) => {
    setTablePagination({
      pageIndex: pageInfo.pageIndex,
      pageSize: pageInfo.pageSize,
    });
    setQuery((prevQuery) => ({
      ...prevQuery,
      page_no: pageInfo.pageIndex + 1,
      limit: pageInfo.pageSize,
    }));
  }, []);

  const onSearchHandler = useCallback(term => {
    setQuery(prev => ({ ...prev, search: term, page_no: 1 }));
  }, []);

  const debouncedSearch = useMemo(() => debounce(onSearchHandler, 300), [onSearchHandler]);

  const onFilterByDate = useCallback(type => {
    setQuery(prev => ({
      ...prev,
      filter_date: prev.filter_date === type ? '' : type,
      startDate: null,
      endDate: null,
      page_no: 1
    }));
  }, []);

  const onFilterByRange = useCallback(range => {
    setQuery(prev => ({
      ...prev,
      startDate: range.startDate,
      endDate: range.endDate,
      filter_date: '',
      page_no: 1
    }));
  }, []);

  const handleLenderFilter = useCallback(newLender => {
    setQuery(prev => ({ ...prev, lenderName: newLender, page_no: 1 }));
  }, []);

  const handleStatusFilter = useCallback(newStatus => {
    setQuery(prev => ({ ...prev, status: newStatus, page_no: 1 }));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setQuery(prev => ({
      ...prev,
      page_no: 1,
      search: '',
      filter_date: '',
      startDate: null,
      endDate: null,
      lenderName: '',
      status: '',
    }));
  }, []);

  const handleExport = () => setExportModalOpen(true);

  const handleExportSubmit = async ({ startDate, endDate, mode }) => {
    setExportLoading(true);
    const urlParams = new URLSearchParams({ mode: "download" });
    let downloadFileName;

    const now = new Date();
    const date = now.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }).replace(/:/g, "-").replace(" ", "");

    if (mode === "today" || mode === "yesterday") {
      urlParams.append("type", mode);
      downloadFileName = `SML_Short_Selected_Lenders_${date}_${time}.csv`;
    } else if (mode === "range" && startDate && endDate) {
      urlParams.append("fromDate", startDate);
      urlParams.append("toDate", endDate);
      downloadFileName = `SML_Short_Selected_Lenders_${startDate}_to_${endDate}.csv`;
    } else {
      ToastNotification.error("Please select valid export filter.");
      setExportLoading(false);
      return;
    }

    if (query.lenderName) urlParams.append("lenderName", query.lenderName);
    if (query.status) urlParams.append("status", query.status);

    try {
      ToastNotification.success("Starting CSV download...");
      const url = `${import.meta.env.VITE_API_URL}/short-selected-lenders/export?${urlParams.toString()}`;
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      ToastNotification.success("Download started!");
    } catch (err) {
      console.error(err);
      ToastNotification.error("Export failed!");
    } finally {
      setExportLoading(false);
      setExportModalOpen(false);
    }
  };

  const handleEdit = (lead) => {
    navigate(`/short-selected-lenders/${lead.id}`, { state: { lead } });
  };

  const topLenderColors = [
    { bg: 'bg-purple-50', text: 'text-purple-600' },
    { bg: 'bg-blue-50', text: 'text-blue-600' },
    { bg: 'bg-green-50', text: 'text-green-600' },
    { bg: 'bg-orange-50', text: 'text-orange-600' },
  ];
  const topLenders = summaryData.lenderWise.slice(0, 4);

  const SkeletonCard = () => (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-8 bg-gray-300 rounded w-3/4"></div>
    </div>
  );

  if (firstLoad) {
    return (
      <>
        <Toaster />
        <PremiumPageLoader
          theme="sky"
          title="Loading Short Selected Lenders"
          brandLabel="Live Short Lender Selections"
          icon={Building2}
          phrases={[
            'Fetching lender selections…',
            'Computing per-lender breakdown…',
            'Resolving applicant journeys…',
            'Polishing the table…',
          ]}
          tiles={[
            { label: 'Total clicks' },
            { label: 'Lenders' },
            { label: 'Today' },
          ]}
          progressLabel="Preparing the data"
        />
      </>
    );
  }

  return (
    <>
      <Toaster />
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onSubmit={handleExportSubmit}
        isSubmitting={exportLoading}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Leads</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{summaryData.totalLeads.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">{summaryData.lenderWise.length} lenders</p>
              </div>
              <div className="p-3 rounded-full bg-indigo-50">
                <Users className="text-indigo-600" size={24} />
              </div>
            </div>

            {topLenders.length > 0 ? topLenders.map((lender, idx) => {
              const colors = topLenderColors[idx];
              const share = summaryData.totalLeads > 0
                ? ((lender.count / summaryData.totalLeads) * 100).toFixed(1)
                : '0.0';
              return (
                <div
                  key={lender.lenderName}
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer"
                  onClick={() => handleLenderFilter(lender.lenderName === query.lenderName ? '' : lender.lenderName)}
                  title="Click to filter by this lender"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-500 truncate">{lender.lenderName}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{lender.count.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">{share}% share</p>
                  </div>
                  <div className={`p-3 rounded-full ${colors.bg} flex-shrink-0 ml-2`}>
                    <Building2 className={colors.text} size={24} />
                  </div>
                </div>
              );
            }) : (
              <div className="lg:col-span-4 flex items-center justify-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-400 text-sm">
                No lender data for selected period
              </div>
            )}
          </>
        )}
      </div>

      <MainTable
        columns={selectedLendersColumn({ handleEdit })}
        data={rawData}
        totalDataCount={filteredCount}
        loading={loading}
        onPageChange={onPageChange}
        onSearch={debouncedSearch}
        onRefresh={fetchSelectedLenders}
        onExport={canExport ? handleExport : undefined}
        title="Short Selected Lenders"
        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}
        onFilterByRange={onFilterByRange}
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}
        onLenderFilter={handleLenderFilter}
        activeLenderFilter={query.lenderName}
        lenderOptions={lenderOptions}
        onStatusFilter={handleStatusFilter}
        activeStatusFilter={query.status}
        statusOptions={summaryData.distinctStatuses}
        onClearAllFilters={handleClearAllFilters}
      />
    </>
  );
};

export default ShortSelectedLenders;
