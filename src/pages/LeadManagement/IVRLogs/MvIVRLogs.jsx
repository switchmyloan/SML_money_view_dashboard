import { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { leadsColumn } from '../../../components/TableHeader';
import { useNavigate } from 'react-router-dom';
import { getMviIVRLogs } from '../../../api-services/Modules/Leads';
import ToastNotification from '@components/Notification/ToastNotification';
import SummaryCards from '../../../components/Table/SummaryCards';
import ExportModal from '../../../components/ExportModal';

// Debounce utility (kept as is)
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Leads = () => {
  const navigate = useNavigate();
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // State initialization
  const [query, setQuery] = useState({
    page_no: 1,
    limit: 10,
    search: '',
    filter_date: 'today',
    startDate: null,
    endDate: null,
    status: 'success'
  });

  // State to hold calculated metrics
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalLeads: 0,
    successCount: 0,
    rejectCount: 0,
    duplicateCount: 0
  });

  // Helper function to extract and normalize MoneyView message
  const getLeadStatusMsg = (lead) => {
    return (lead?.lender_response?.MoneyView?.message || '').toLowerCase().trim();
  };

  /**
   * Fetches raw lead data from API.
   * FIX: Dependency array updated to use query.endDate instead of the non-existent query.fromDate.
   */
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      // NOTE: API is currently called without search, limit, page_no, or status.
      const res = await getMviIVRLogs(
        query.filter_date,
        query.startDate,
        query.endDate
      );
      if (res?.data?.success) {
        setRawData(res.data.data || []);
      } else {
        ToastNotification.error('Failed to fetch logs');
      }
    } catch (err) {
      console.error(err);
      ToastNotification.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, [query.filter_date, query.startDate, query.endDate]); // Dependency fix

  // Fetch data on component mount and when fetch parameters change
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  /**
   * Consolidated Filtering, Pagination, and Summary Calculation.
   * IMPROVEMENT: This single useMemo calculates the full filtered list, derives
   * summary metrics from it, and then paginates the data for the table.
   */
  const { tableData, filteredCount } = useMemo(() => {
    let list = [...rawData];

    // 1. DATE/TIME FILTER (filter_date or custom range)
    if (query.filter_date) {
      const todayTimestamp = new Date().setHours(0, 0, 0, 0);
      const dateForYesterday = new Date();
      dateForYesterday.setDate(dateForYesterday.getDate() - 1);
      const yesterdayTimestamp = dateForYesterday.setHours(0, 0, 0, 0);

      list = list.filter(lead => {
        const leadDateTimestamp = new Date(lead.createdAt).setHours(0, 0, 0, 0);

        return query.filter_date === 'today'
          ? leadDateTimestamp === todayTimestamp
          : leadDateTimestamp === yesterdayTimestamp;
      });
    } else if (query.startDate && query.endDate) {
      const start = new Date(query.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);

      list = list.filter(lead => {
        const d = new Date(lead.createdAt);
        return d >= start && d <= end;
      });
    }

    // 2. STATUS FILTER
    const wantStatus = query.status.toLowerCase().trim();
    list = list.filter(lead => {
      const got = getLeadStatusMsg(lead);

      if (wantStatus === 'success') {
        return got.includes('success');
      }
      // Note: Assumes 'reject' and 'duplicate user' are the explicit statuses for other modes.
      if (wantStatus === 'reject') {
         return got.includes('lead has been rejected.');
      }
      if (wantStatus.includes('duplicate')) { // Check for 'duplicate' or 'duplicate user'
        return got.includes('duplicate user (dedupe)');
      }
      return true; // Should not happen if query.status is strictly controlled
    });

    // 3. Search (FE fallback)
    if (query.search) {
      const s = query.search.toLowerCase();
      list = list.filter(lead =>
        `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone}`
          .toLowerCase()
          .includes(s)
      );
    }

    // --- SUMMARY METRICS CALCULATION (from the fully filtered list) ---
    const currentSummaryMetrics = {
      totalLeads: list.length,
      successCount: list.filter(lead => getLeadStatusMsg(lead).includes('success')).length,
      rejectCount: list.filter(lead => getLeadStatusMsg(lead).includes('lead has been rejected.')).length,
      duplicateCount: list.filter(lead => getLeadStatusMsg(lead).includes('duplicate user (dedupe)')).length
    };
    
    // Set the metrics state (side-effect in useMemo is acceptable here for derived state)
    // We set it outside the return block.
    setSummaryMetrics(currentSummaryMetrics);
    
    // Set data list for export
    // NOTE: If you need to export the FE filtered list, uncomment this. 
    // If export happens via API, this is unnecessary. The existing API logic suggests backend export.
    // setExportDataList(list);

    // 4. Pagination
    const count = list.length;
    const start = (query.page_no - 1) * query.limit;
    const pageData = list.slice(start, start + query.limit);

    return { tableData: pageData, filteredCount: count };
  }, [rawData, query]); // Dependencies for re-calculation

  // The rest of the handlers are kept clean and use useCallback

  const onPageChange = useCallback(p => {
    setQuery(prev => ({ ...prev, page_no: p.pageIndex + 1, limit: p.pageSize }));
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

  const handleExport = () => {
    setExportModalOpen(true);
  }

  const handleExportSubmit = async ({ startDate, endDate, mode }) => {
    setExportLoading(true);
    const exportMode = mode ;

    let urlParams = new URLSearchParams({ mode: 's3' });
    let downloadFileName;

    const now = new Date();

    const date = now.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');

    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
      .replace(/:/g, '-')
      .replace(' ', '');

    // 1. Logic to dynamically build URL based on mode
    if (exportMode === 'today' || exportMode === 'yesterday') {
      // Case 1: Predefined filter (today/yesterday)
      urlParams.append('type', exportMode);
      downloadFileName = `SML_filtered_leads_export_${date}_${time}.csv`;
    } else if (exportMode === 'range' && startDate && endDate) {
      // Case 2: Date Range filter
      urlParams.append('fromDate', startDate);
      urlParams.append('toDate', endDate);
      downloadFileName = `MV_Export_${startDate}_to_${endDate}.csv`;
    } else {
      // Validation check for range mode
      if (exportMode === 'range') {
        ToastNotification.error("Please select both start and end date for export.");
      } else {
        ToastNotification.error("Invalid export selection.");
      }
      setExportLoading(false);
      return;
    }
    
    try {
      ToastNotification.success("Generating CSV...");

      // Final URL construction
      const url = `${import.meta.env.VITE_API_URL}/leads/mv-success-leads-export?${urlParams.toString()}`;

      const response = await fetch(url);

      if (!response.ok) throw new Error("Failed to export");

      // CSV blob download
      const blob = await response.blob();
      const link = document.createElement("a");

      link.href = URL.createObjectURL(blob);
      link.download = downloadFileName; // Use dynamic file name
      link.click();

      ToastNotification.success("Exported successfully!");

    } catch (err) {
      console.error(err);
      ToastNotification.error("Export failed!");
    } finally {
      setExportLoading(false);
      setExportModalOpen(false); // Close modal regardless of success/fail
    }
  };

  const handleEdit = (lead) => {
    navigate(`/mv-ivr-logs/${lead.id}`, { state: { lead } });
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
        totalLeads={summaryMetrics.totalLeads}
        successCount={summaryMetrics.successCount}
        rejectCount={summaryMetrics.rejectCount}
        duplicateCount={summaryMetrics.duplicateCount}
        loading={loading}
        duplicateCard={true}
      />
      <DataTable
        columns={leadsColumn({ handleEdit })}
        data={tableData}
        totalDataCount={filteredCount}
        loading={loading}
        onPageChange={onPageChange}
        onSearch={debouncedSearch}
        onRefresh={fetchLeads}
        onExport={handleExport}
        onCreate={() => navigate('/leads/create')}
        createLabel="Add Lead"
        title="IVR MV LOGS"

        // Filters
        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}
        onFilterByRange={onFilterByRange}
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}

        // STATUS FILTER
        onFilterChange={handleStatusFilter}
        activeStatusFilter={query.status}
      />

    </>
  );
};

export default Leads;