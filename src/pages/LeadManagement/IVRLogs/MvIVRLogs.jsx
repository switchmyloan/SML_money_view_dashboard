import { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { leadsColumn } from '../../../components/TableHeader';
import { useNavigate } from 'react-router-dom';
import { getMviIVRLogs } from '../../../api-services/Modules/Leads';
import ToastNotification from '@components/Notification/ToastNotification';
import SummaryCards from '../../../components/Table/SummaryCards';
import ExportModal from '../../../components/ExportModal';


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
  const [exportDataList, setExportDataList] = useState([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);


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

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {

      const res = await getMviIVRLogs(
        query.filter_date,
        query.startDate,
        query.endDate);
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
  }, [query.filter_date, query.startDate, query.fromDate]);

  useEffect(() => {
    let _list = [...rawData];

    if (query.filter_date) {
      const todayTimestamp = new Date().setHours(0, 0, 0, 0);
      const dateForYesterday = new Date();
      dateForYesterday.setDate(dateForYesterday.getDate() - 1);

      const yesterdayTimestamp = dateForYesterday.setHours(0, 0, 0, 0);

      _list = _list.filter(lead => {
        const leadDateTimestamp = new Date(lead.createdAt).setHours(0, 0, 0, 0);

        return query.filter_date === 'today'
          ? leadDateTimestamp === todayTimestamp
          : leadDateTimestamp === yesterdayTimestamp;
      });
    }

    setSummaryMetrics({
      totalLeads: _list.length,
      successCount: _list.filter(lead => {
        const msg = lead?.lender_response?.MoneyView?.message || '';
        const got = msg.toLowerCase().trim();
        return got.includes('success');
      }).length,
      rejectCount: _list.filter(lead => {
        const msg = lead?.lender_response?.MoneyView?.message || '';
        const got = msg.toLowerCase().trim();
        return got.includes('lead has been rejected.');
      }).length,
      duplicateCount: _list.filter(lead => {
        const msg = lead?.lender_response?.MoneyView?.message || '';
        const got = msg.toLowerCase().trim();
        return got.includes('duplicate user (dedupe)');
      }).length
    })
  }, [query.filter_date, query]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const { tableData, filteredCount } = useMemo(() => {
    let list = [...rawData];

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
    }

    if (query.startDate && query.endDate) {
      const start = new Date(query.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);

      list = list.filter(lead => {
        const d = new Date(lead.createdAt);
        return d >= start && d <= end;
      });
    }

    // 3. STATUS FILTER
    if (query.status) {
      const want = query.status.toLowerCase().trim();
      list = list.filter(lead => {
        const msg = lead?.lender_response?.MoneyView?.message || '';
        const got = msg.toLowerCase().trim();

        if (want === 'success') {
          return got.includes('success');
        }
        return got === want;
      });
      console.log(list, "list")
    }

    // 4. Search (FE fallback)
    if (query.search) {
      const s = query.search.toLowerCase();
      list = list.filter(lead =>
        `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone}`
          .toLowerCase()
          .includes(s)
      );
    }

    setExportDataList(list);

    const count = list.length;
    const start = (query.page_no - 1) * query.limit;
    const pageData = list.slice(start, start + query.limit);

    return { tableData: pageData, filteredCount: count };
  }, [rawData, query]);

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
    console.log(exportModalOpen)
    setExportModalOpen(!exportModalOpen)
  }

  const handleExportSubmit = async ({ startDate, endDate, mode }) => {
    setExportLoading(true);
    const exportMode = mode || 'range';

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
      //       downloadFileName = `MV_Export_${exportMode}.csv`;
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
      setExportLoading(false);

    } catch (err) {
      console.error(err);
      ToastNotification.error("Export failed!");
      setExportLoading(false);
    }

    setExportModalOpen(false);
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