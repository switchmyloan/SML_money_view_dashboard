
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainTable from '../../components/Table/MainTable';
import { getOfferLeads, getOfferLeadsLenderKeys, getOfferLeadsFilterValues } from '../../api-services/Modules/Leads';
import { offerLeadsColumn } from '../../components/TableHeader';
import SummaryCards from '../../components/Table/SummaryCards';
import OfferLeadsLenderStatsChart from '../../components/OfferLeadsLenderStatsChart';
import ExportModal from '../../components/ExportModal';
import ToastNotification from '../../components/Notification/ToastNotification';
import { useAuth } from '../../custom-hooks/useAuth';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const OfferLeads = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canExport = ["super-admin", "mv-page-admin"].includes(user?.role);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredCount, setFilteredCount] = useState(0);
  const [tablePagination, setTablePagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [summaryData, setSummaryData] = useState({
    totalLeads: 0,
    distinctLoanPurposes: [],
  });

  const [query, setQuery] = useState({
    page_no: 1,
    limit: 10,
    search: '',
    filter_date: '',
    startDate: null,
    endDate: null,
    minLoanAmount: '',
    maxLoanAmount: '',
    dobFromDate: '',
    dobToDate: '',
    loanPurpose: '',
    minMonthlyIncome: '',
    maxMonthlyIncome: '',
    lender: '',
    disbStatus: '',
    city: '',
    employmentType: '',
    utmMedium: '',
  });

  const MEDIUM_OPTIONS = [
    { value: 'moneyview', label: 'moneyview' },
    { value: 'kreditbee', label: 'kreditbee' },
    { value: 'zype', label: 'zype' },
    { value: 'SC', label: 'SC' },
  ];

  // Friendly display labels for known lender keys. Anything missing falls back
  // to the raw key from the DB.
  const LENDER_LABEL_OVERRIDES = {
    SmartCoinHighIntent: 'Smart Coin (High Intent)',
    smartCoin: 'Smart Coin',
    Zype_Dedupe: 'Zype',
    trueBalance: 'TrueBalance',
    poonawalla: 'Poonawalla',
    vivifi: 'Vivifi',
  };

  // Lender dropdown options — populated from the DB so it always reflects the
  // actual keys present in offerLeads.lender_response.
  const [lenderOptions, setLenderOptions] = useState([]);
  // City + employment type dropdown values, also from DB. Cities are derived
  // server-side from distinct pincodes via india-pincode-lookup.
  const [cityOptions, setCityOptions] = useState([]);
  const [employmentTypeOptions, setEmploymentTypeOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getOfferLeadsLenderKeys()
      .then(res => {
        if (cancelled) return;
        const keys = res?.data?.data || [];
        const opts = keys.map(k => ({
          value: k,
          label: LENDER_LABEL_OVERRIDES[k] || k,
        }));
        setLenderOptions(opts);
      })
      .catch(err => console.error('Failed to load lender keys:', err));

    getOfferLeadsFilterValues()
      .then(res => {
        if (cancelled) return;
        const d = res?.data?.data || {};
        setCityOptions(d.cities || []);
        setEmploymentTypeOptions(d.employmentTypes || []);
      })
      .catch(err => console.error('Failed to load filter values:', err));

    return () => { cancelled = true; };
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOfferLeads({
        perPage: query.limit,
        currentPage: query.page_no,
        search: query.search,
        type: query.filter_date || undefined,
        fromDate: query.startDate || undefined,
        toDate: query.endDate || undefined,
        minLoanAmount: query.minLoanAmount || undefined,
        maxLoanAmount: query.maxLoanAmount || undefined,
        dobFromDate: query.dobFromDate || undefined,
        dobToDate: query.dobToDate || undefined,
        loanPurpose: query.loanPurpose || undefined,
        minMonthlyIncome: query.minMonthlyIncome || undefined,
        maxMonthlyIncome: query.maxMonthlyIncome || undefined,
        lender: query.lender || undefined,
        disbStatus: query.disbStatus || undefined,
        city: query.city || undefined,
        employmentType: query.employmentType || undefined,
        utmMedium: query.utmMedium || undefined,
      });
      if (res?.data?.success) {
        setRawData(res?.data?.data?.data || []);
        setFilteredCount(res?.data?.data?.pagination?.total || 0);
        const s = res?.data?.data?.summaryObj || {};
        setSummaryData(prev => ({
          totalLeads: Number(s.total) || 0,
          // Keep distinctLoanPurposes stable across requests so dropdown doesn't flicker on filter change
          distinctLoanPurposes: Array.isArray(s.distinctLoanPurposes) && s.distinctLoanPurposes.length > 0
            ? s.distinctLoanPurposes
            : prev.distinctLoanPurposes,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    query.limit, query.page_no, query.search, query.filter_date,
    query.startDate, query.endDate, query.minLoanAmount, query.maxLoanAmount,
    query.dobFromDate, query.dobToDate, query.loanPurpose,
    query.minMonthlyIncome, query.maxMonthlyIncome, query.lender,
    query.disbStatus, query.city, query.employmentType, query.utmMedium,
  ]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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

  const handleLoanAmountApply = useCallback(({ min, max }) => {
    setQuery(prev => ({ ...prev, minLoanAmount: min, maxLoanAmount: max, page_no: 1 }));
  }, []);

  const handleLoanAmountClear = useCallback(() => {
    setQuery(prev => ({ ...prev, minLoanAmount: '', maxLoanAmount: '', page_no: 1 }));
  }, []);

  const handleDobRangeFilter = useCallback(({ startDate, endDate }) => {
    setQuery(prev => ({ ...prev, dobFromDate: startDate || '', dobToDate: endDate || '', page_no: 1 }));
  }, []);

  const handleLoanPurposeFilter = useCallback(newPurpose => {
    setQuery(prev => ({ ...prev, loanPurpose: newPurpose, page_no: 1 }));
  }, []);

  const handleMonthlyIncomeApply = useCallback(({ min, max }) => {
    setQuery(prev => ({ ...prev, minMonthlyIncome: min, maxMonthlyIncome: max, page_no: 1 }));
  }, []);

  const handleMonthlyIncomeClear = useCallback(() => {
    setQuery(prev => ({ ...prev, minMonthlyIncome: '', maxMonthlyIncome: '', page_no: 1 }));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setQuery(prev => ({
      ...prev,
      page_no: 1,
      search: '',
      filter_date: '',
      startDate: null,
      endDate: null,
      minLoanAmount: '',
      maxLoanAmount: '',
      dobFromDate: '',
      dobToDate: '',
      loanPurpose: '',
      minMonthlyIncome: '',
      maxMonthlyIncome: '',
      lender: '',
      disbStatus: '',
      city: '',
      employmentType: '',
      utmMedium: '',
    }));
  }, []);

  const handleLenderFilter = useCallback((newLender) => {
    setQuery(prev => ({ ...prev, lender: newLender, page_no: 1 }));
  }, []);

  const handleCityFilter = useCallback((newCity) => {
    setQuery(prev => ({ ...prev, city: newCity, page_no: 1 }));
  }, []);

  const handleEmploymentTypeFilter = useCallback((newType) => {
    setQuery(prev => ({ ...prev, employmentType: newType, page_no: 1 }));
  }, []);

  const handleDisbStatusFilter = useCallback((newStatus) => {
    setQuery(prev => ({ ...prev, disbStatus: newStatus, page_no: 1 }));
  }, []);

  const handleUtmMediumFilter = useCallback((newMedium) => {
    setQuery(prev => ({ ...prev, utmMedium: newMedium, page_no: 1 }));
  }, []);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

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
      downloadFileName = `SML_Offer_Leads_${date}_${time}.csv`;
    } else if (mode === "range" && startDate && endDate) {
      urlParams.append("fromDate", startDate);
      urlParams.append("toDate", endDate);
      downloadFileName = `SML_Offer_Leads_${startDate}_to_${endDate}.csv`;
    } else {
      ToastNotification.error("Please select valid export filter.");
      setExportLoading(false);
      return;
    }

    // Apply currently active filters to export so CSV matches what user sees
    if (query.search) urlParams.append("search", query.search);
    if (query.minLoanAmount) urlParams.append("minLoanAmount", query.minLoanAmount);
    if (query.maxLoanAmount) urlParams.append("maxLoanAmount", query.maxLoanAmount);
    if (query.dobFromDate) urlParams.append("dobFromDate", query.dobFromDate);
    if (query.dobToDate) urlParams.append("dobToDate", query.dobToDate);
    if (query.loanPurpose) urlParams.append("loanPurpose", query.loanPurpose);
    if (query.minMonthlyIncome) urlParams.append("minMonthlyIncome", query.minMonthlyIncome);
    if (query.maxMonthlyIncome) urlParams.append("maxMonthlyIncome", query.maxMonthlyIncome);

    try {
      ToastNotification.success("Starting CSV download...");
      const url = `${import.meta.env.VITE_API_URL}/offer-leads/export?${urlParams.toString()}`;
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
    navigate(`/offer-leads/${lead.id}`, { state: { lead } });
  };

  return (
    <>
      <Toaster />
      {/* {canExport && (
        <div className="flex justify-end mb-4">
          <Link
            to="/offer-leads-analytics"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all shadow-sm"
          >
            <BarChart3 size={16} />
            Analytics Dashboard
          </Link>
        </div>
      )} */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onSubmit={handleExportSubmit}
        isSubmitting={exportLoading}
      />
      <SummaryCards
        totalLeads={Number(summaryData.totalLeads) || 0}
        loading={loading}
      />
      <OfferLeadsLenderStatsChart />

      {/* Lender Success Filter */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-3 my-3">
        <label className="text-sm font-semibold text-gray-700">
          Filter by Lender (Success):
        </label>
        <select
          value={query.lender}
          onChange={(e) => handleLenderFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
        >
          <option value="">All Lenders</option>
          {lenderOptions.map((lender) => (
            <option key={lender.value} value={lender.value}>
              {lender.label} — Success
            </option>
          ))}
        </select>
        {query.lender && (
          <button
            onClick={() => handleLenderFilter('')}
            className="text-xs px-3 py-1 rounded-md bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition"
          >
            Clear
          </button>
        )}
        {query.lender && (
          <span className="text-xs text-gray-500 italic">
            Showing leads where <b>{lenderOptions.find(l => l.value === query.lender)?.label || query.lender}</b> message is "success"
          </span>
        )}

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <label className="text-sm font-semibold text-gray-700">
          Disbursement:
        </label>
        <select
          value={query.disbStatus}
          onChange={(e) => handleDisbStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[170px]"
        >
          <option value="">All</option>
          <option value="disbursed">Disbursed Only</option>
          <option value="notDisbursed">Not Disbursed</option>
        </select>
        {query.disbStatus && (
          <button
            onClick={() => handleDisbStatusFilter('')}
            className="text-xs px-3 py-1 rounded-md bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition"
          >
            Clear
          </button>
        )}

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <label className="text-sm font-semibold text-gray-700">
          Medium:
        </label>
        <select
          value={query.utmMedium}
          onChange={(e) => handleUtmMediumFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[170px]"
        >
          <option value="">All Mediums</option>
          {MEDIUM_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        {query.utmMedium && (
          <button
            onClick={() => handleUtmMediumFilter('')}
            className="text-xs px-3 py-1 rounded-md bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition"
          >
            Clear
          </button>
        )}
      </div>

      <MainTable
        columns={offerLeadsColumn({ handleEdit })}
        data={rawData}
        totalDataCount={filteredCount}
        loading={loading}
        onPageChange={onPageChange}
        onSearch={debouncedSearch}
        onRefresh={fetchLeads}
        onExport={canExport ? handleExport : undefined}
        title="Offer Leads"
        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}
        onFilterByRange={onFilterByRange}
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}
        onLoanAmountFilter={handleLoanAmountApply}
        onLoanAmountClear={handleLoanAmountClear}
        activeLoanAmount={{ min: query.minLoanAmount, max: query.maxLoanAmount }}
        onDobRangeFilter={handleDobRangeFilter}
        activeDobRange={{ startDate: query.dobFromDate, endDate: query.dobToDate }}
        onLoanPurposeFilter={handleLoanPurposeFilter}
        activeLoanPurpose={query.loanPurpose}
        loanPurposeOptions={summaryData.distinctLoanPurposes}
        onMonthlyIncomeFilter={handleMonthlyIncomeApply}
        onMonthlyIncomeClear={handleMonthlyIncomeClear}
        activeMonthlyIncome={{ min: query.minMonthlyIncome, max: query.maxMonthlyIncome }}
        onPincodeFilter={handleCityFilter}
        activePincode={query.city}
        pincodeOptions={cityOptions}
        pincodeFilterPlaceholder="All Cities"
        onEmploymentTypeFilter={handleEmploymentTypeFilter}
        activeEmploymentType={query.employmentType}
        employmentTypeOptions={employmentTypeOptions}
        onClearAllFilters={handleClearAllFilters}
      />
    </>
  );
};

export default OfferLeads;
