import { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from '@components/Table/DataTable';
import SummaryCards from '@components/Table/SummaryCards';
import { Toaster } from 'react-hot-toast';
import { leadsColumn } from '../../../components/TableHeader';
import { useNavigate } from 'react-router-dom';
import { getLeads } from '../../../api-services/Modules/Leads';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  const [data1, setData1] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalLeads: 0,
    successCount: 0,
    rejectCount: 0,
    duplicateCount: 0,
  });

  const [query, setQuery] = useState({
    page_no: 1,
    limit: 10,
    search: '',
    filter_date: 'today',
    startDate: null,
    endDate: null,
    status: ''
  });

  const [filteredCount, setFilteredCount] = useState(0);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLeads({
        type: query.filter_date || null,
        fromDate: query.startDate,
        toDate: query.endDate,
        perPage: query.limit,
        currentPage: query.page_no,
        status: query.status,
        search: query.search,
      });
      if (res?.data?.success) {
        setRawData(res.data.data?.data || []);
        setData1(res.data.data?.data || []);
        setFilteredCount(res.data.data?.pagination?.total || 0);
        const summary = res.data.data?.summary;
        if (summary) {
          setSummaryMetrics({
            totalLeads: summary.total || 0,
            successCount: summary.success || 0,
            rejectCount: summary.rejected || 0,
            duplicateCount: summary.duplicate || 0,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query.filter_date, query.startDate, query.endDate, query.limit, query.page_no, query.status, query.search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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
    const data = data1.map(l => ({
      Name: `${l.firstName} ${l.lastName}`,
      Email: l.email,
      Phone: l.phone,
      salary: l.salary,
      profession: l.profession,
      pincode: l.pincode,
      panNumber: l.panNumber,
      loanAmount: l.loanAmount,
      is_moneyview_user: l.is_moneyview_user,
      gender: l.gender,
      dob: l.dob,
      Status: l.lender_response?.MoneyView?.message || 'N/A',
      Created: new Date(l.createdAt).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf]), `leads_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleEdit = (lead) => {
    navigate(`/lead-detail/${lead.id}`, { state: { lead } });
  };

  return (
    <>
      <Toaster />
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
        data={rawData}
        totalDataCount={filteredCount}
        loading={loading}
        onPageChange={onPageChange}
        onSearch={debouncedSearch}
        onRefresh={fetchLeads}
        onExport={handleExport}
        onCreate={() => navigate('/leads/create')}
        createLabel="Add Lead"
        title="Logs"

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