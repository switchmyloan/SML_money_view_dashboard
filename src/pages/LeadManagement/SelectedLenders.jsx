
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainTable from '../../components/Table/MainTable';
import { getSelectedLenders, getDistinctLenders } from '../../api-services/Modules/Leads';
import { selectedLendersColumn } from '../../components/TableHeader';
import SummaryCards from '../../components/Table/SummaryCards';
import ExportModal from '../../components/ExportModal';
import ToastNotification from '../../components/Notification/ToastNotification';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const SelectedLenders = () => {
  const navigate = useNavigate();
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredCount, setFilteredCount] = useState(0);
  const [tablePagination, setTablePagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [summaryData, setSummaryData] = useState({
    totalLeads: 0,
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
  });

  // Fetch distinct lenders for dropdown
  useEffect(() => {
    const fetchLenders = async () => {
      try {
        const res = await getDistinctLenders();
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
      const res = await getSelectedLenders({
        perPage: query.limit,
        currentPage: query.page_no,
        search: query.search,
        type: query.filter_date || undefined,
        fromDate: query.startDate || undefined,
        toDate: query.endDate || undefined,
        lenderName: query.lenderName || undefined,
      });

      if (res?.data?.success) {
        setRawData(res?.data?.data || []);
        setFilteredCount(res?.data?.pagination?.total || 0);
        setSummaryData({
          totalLeads: res?.data?.summaryObj?.total || 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query.limit, query.page_no, query.search, query.filter_date, query.startDate, query.endDate, query.lenderName]);

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
      downloadFileName = `SML_Selected_Lenders_${date}_${time}.csv`;
    } else if (mode === "range" && startDate && endDate) {
      urlParams.append("fromDate", startDate);
      urlParams.append("toDate", endDate);
      downloadFileName = `SML_Selected_Lenders_${startDate}_to_${endDate}.csv`;
    } else {
      ToastNotification.error("Please select valid export filter.");
      setExportLoading(false);
      return;
    }

    if (query.lenderName) {
      urlParams.append("lenderName", query.lenderName);
    }

    try {
      ToastNotification.success("Starting CSV download...");
      const url = `${import.meta.env.VITE_API_URL}/selected-lenders/export?${urlParams.toString()}`;
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
    navigate(`/selected-lenders/${lead.id}`, { state: { lead } });
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
        totalLeads={Number(summaryData.totalLeads) || 0}
        loading={loading}
      />
      <MainTable
        columns={selectedLendersColumn({ handleEdit })}
        data={rawData}
        totalDataCount={filteredCount}
        loading={loading}
        onPageChange={onPageChange}
        onSearch={debouncedSearch}
        onRefresh={fetchSelectedLenders}
        onExport={handleExport}
        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}
        onFilterByRange={onFilterByRange}
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}
        onLenderFilter={handleLenderFilter}
        activeLenderFilter={query.lenderName}
        lenderOptions={lenderOptions}
      />
    </>
  );
};

export default SelectedLenders;
