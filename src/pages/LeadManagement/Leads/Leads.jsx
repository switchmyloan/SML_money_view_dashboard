import { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from '@components/Table/DataTable';
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
  const [data1, setData1] = useState([])

  const [query, setQuery] = useState({
    page_no: 1,
    limit: 10,
    search: '',
    filter_date: '',
    startDate: null,
    endDate: null,
    status: ''
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLeads(query.page_no, query.limit, query.search);
      if (res?.data?.success) {
        setRawData(res.data.data || []);
        setData1(res.data.data || [])
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query.page_no, query.limit, query.search]);

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
    }

    if (query.search) {
      const s = query.search.toLowerCase();
      list = list.filter(lead =>
        `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone}`
          .toLowerCase()
          .includes(s)
      );
    }

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