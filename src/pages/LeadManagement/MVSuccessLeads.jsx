import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import ToastNotification from '@components/Notification/ToastNotification';

import { getMvSuccessFromOfferLeads } from '../../api-services/Modules/Leads';
import ExportModal from '../../components/ExportModal';
import ModuleInfoCard from '../../components/ModuleInfoCard';
import SummaryCards from '../../components/Table/SummaryCards';
import MainTable from '../../components/Table/MainTable';
import { mvOfferLeadsColumn } from '../../components/TableHeader';

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const MVSuccessLeads = () => {
  const navigate = useNavigate();
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [filteredCount, setFilteredCount] = useState(0);
  const [tablePagination, setTablePagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [query, setQuery] = useState({
    page_no: 1,
    limit: 10,
    search: '',
    filter_date: 'today',
    startDate: null,
    endDate: null,
    status: 'success'
  });

  const [summaryMetrics, setSummaryMetrics] = useState({
    totalLeads: 0,
    successCount: 0,
    rejectCount: 0,
    duplicateCount: 0
  });

  // Fetch backend data
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMvSuccessFromOfferLeads({
        type: query.filter_date || null,
        fromDate: query.startDate,
        toDate: query.endDate,
        perPage: query.limit,
        currentPage: query.page_no,
        status: query.status,
        search: query.search
      });

      if (res?.data?.success) {
        setRawData(res?.data?.data?.data || []);
        setFilteredCount(res?.data?.data?.pagination?.total || 0);
        const s = res?.data?.data?.summary || {};
        setSummaryMetrics({
          totalLeads: s.total || 0,
          successCount: s.success || 0,
          rejectCount: s.rejected || 0,
          duplicateCount: s.deduped || 0
        });
      } else {
        ToastNotification.error('Failed to fetch logs');
      }
    } catch (err) {
      console.error(err);
      ToastNotification.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, [query.filter_date, query.startDate, query.endDate, query.limit, query.page_no, query.status, query.search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const onPageChange = useCallback((pageInfo) => {
    setTablePagination({
      pageIndex: pageInfo.pageIndex,
      pageSize: pageInfo.pageSize,
    });
    setQuery((prevQuery) => {
      return {
        ...prevQuery,
        page_no: pageInfo.pageIndex + 1,
        limit: pageInfo.pageSize,
      };
    });
  }, []);

  const handleStatusFilter = useCallback(newStatus => {
    setQuery(prev => ({ ...prev, status: newStatus, page_no: 1 }));
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

  const handleExport = () => setExportModalOpen(true);

  const handleExportSubmit = async ({ startDate, endDate, mode }) => {
    setExportLoading(true);
    let urlParams = new URLSearchParams({ mode: "download" });
    let downloadFileName;

    const now = new Date();
    const date = now.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }).replace(/:/g, "-").replace(" ", "");

    if (mode === "today" || mode === "yesterday") {
      urlParams.append("type", mode);
      downloadFileName = `MV_Success_Leads_${date}_${time}.csv`;
    } else if (mode === "range" && startDate && endDate) {
      urlParams.append("fromDate", startDate);
      urlParams.append("toDate", endDate);
      downloadFileName = `SML_MV_SUCCESS_Leads_${startDate}_to_${endDate}.csv`;
    } else {
      ToastNotification.error("Please select valid export filter.");
      setExportLoading(false);
      return;
    }

    // Apply currently active filters to export so CSV matches what user sees
    if (query.search) urlParams.append("search", query.search);
    if (query.status) urlParams.append("status", query.status);
    if (query.minLoanAmount) urlParams.append("minLoanAmount", query.minLoanAmount);
    if (query.maxLoanAmount) urlParams.append("maxLoanAmount", query.maxLoanAmount);
    if (query.minSalary) urlParams.append("minSalary", query.minSalary);
    if (query.maxSalary) urlParams.append("maxSalary", query.maxSalary);
    if (query.dobFromDate) urlParams.append("dobFromDate", query.dobFromDate);
    if (query.dobToDate) urlParams.append("dobToDate", query.dobToDate);
    if (query.profession) urlParams.append("profession", query.profession);

    try {
      ToastNotification.success("Starting CSV download...");
      const url = `${import.meta.env.VITE_API_URL}/offer-leads/mv-success-track-export?${urlParams.toString()}`;
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
    navigate(`/mv-success-leads/${lead.id}`, { state: { lead } });
  };

  return (
    <>
      <Toaster />
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onSubmit={handleExportSubmit}
        isSubmitting={exportLoading}
      />
      <SummaryCards
        totalLeads={Number(summaryMetrics.totalLeads) || 0}
        successCount={Number(summaryMetrics.successCount) || 0}
        rejectCount={Number(summaryMetrics.rejectCount) || 0}
        duplicateCount={Number(summaryMetrics.duplicateCount) || 0}
        loading={loading}
        duplicateCard={true}
      />
      <MainTable
        columns={mvOfferLeadsColumn({ handleEdit })}
        data={rawData || []}
        totalDataCount={filteredCount || 0}
        loading={loading}
        onPageChange={onPageChange}
        onSearch={debouncedSearch}
        onRefresh={fetchLeads}
        onExport={handleExport}
        createLabel="Add Lead"
        title="MV SUCCESS LEADS"

        // Filters
        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}
        onFilterByRange={onFilterByRange}
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}

        // STATUS FILTER
        onFilterChange={handleStatusFilter}
        activeStatusFilter={query.status}
      />

      <ModuleInfoCard
        title="High MV Success Leads"
        subtitle="Tracks every applicant who pressed Apply on the MoneyView offer card."
        whatYouSee={[
          'Only applicants who clicked Apply on the MoneyView card — categorised as Success, Rejected, Duplicate, or Error.',
          'A status badge per applicant for a quick read; hover shows the original message from MoneyView.',
          'Summary cards: total / success / rejected / duplicate counts for the selected date range.',
          'Export includes the MoneyView Lead ID and the offered loan amount for each applicant.',
        ]}
        dataSource={[
          'Built from the main applicant list, narrowed to applicants who pressed Apply on MoneyView.',
          'The very first outcome is preserved — if an applicant clicks again later, the original result is not overwritten by a downgrade.',
          'Lead ID and offer amount come directly from MoneyView’s response when the apply succeeds.',
        ]}
        flow={[
          'Applicant on offer page',
          'Clicks MoneyView Apply',
          'MoneyView processes',
          'Result captured',
          'Status finalised',
          'Row appears here',
        ]}
      />
    </>
  );
};

export default MVSuccessLeads;
