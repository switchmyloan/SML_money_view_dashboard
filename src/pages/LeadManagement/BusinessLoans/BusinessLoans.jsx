import { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { businessColumn, leadsColumn } from '../../../components/TableHeader';
 import { useNavigate } from 'react-router-dom';
import { getBusinessLoans, getLeads } from '../../../api-services/Modules/Leads';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const BusinessLoans = () => {
  const navigate = useNavigate();
  const [rawData, setRawData] = useState([]);
  const [data1, setData1] = useState([]);
  const [loading, setLoading] = useState(false);

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
      const res = await getBusinessLoans(query.page_no, query.limit, query.search);
      if (res?.data?.success) {
        setRawData(res.data.data || []);
        setData1(res.data.data || []);
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

  // 🔥🔥 MAIN MAGIC — STATUS FILTER 100% WORKING 🔥🔥
  const { tableData, filteredCount } = useMemo(() => {
    let list = [...rawData];

    // 1. Today / Yesterday
    if (query.filter_date) {
      const today = new Date().setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      list = list.filter(lead => {
        const d = new Date(lead.createdAt).setHours(0, 0, 0, 0);
        return query.filter_date === 'today' ? d === today : d === yesterday;
      });
    }

    // 2. Date Range
    if (query.startDate && query.endDate) {
      const start = new Date(query.startDate);
      const end = new Date(query.endDate);
      end.setDate(end.getDate() + 1);

      list = list.filter(lead => {
        const d = new Date(lead.createdAt);
        return d >= start && d < end;
      });
    }

    // 3. 🔥 STATUS FILTER — SUCCESS = includes, बाकी exact
    if (query.status) {
      const want = query.status.toLowerCase().trim();

      list = list.filter(lead => {
        const msg = lead?.lender_response?.MoneyView?.message || '';
        const got = msg.toLowerCase().trim();

        if (want === 'success') {
          return got.includes('success');  // ✅ Offer generated successfully
        }
        return got === want;  // ❌ Rejected, Duplicate, etc.
      });
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
      companyName: l.companyName,
      turnover: l.turnover,
      requiredLoanAmount : l.requiredLoanAmount,
      firmType : l.firmType,
      industryType : l?.industryType,
      gst : l.gst,
      gstNumber : l?.gstNumber,
      state : l?.state,
      city : l?.city,
      street : l?.street,
      pincode : l?.pincode,
      Created: new Date(l.createdAt).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Business Loans');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf]), `business_loans_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

   const handleEdit = (lead) => {
    navigate(`/business-loans/${lead.id}`, { state: { lead } });
  };

  return (
    <>
      <Toaster />
      <DataTable
       columns={businessColumn({ handleEdit })}
        data={tableData}
        totalDataCount={filteredCount}
        loading={loading}
        onPageChange={onPageChange}
        onSearch={debouncedSearch}
        onRefresh={fetchLeads}
        onExport={handleExport}
        onCreate={() => navigate('/leads/create')}
        createLabel="Add Lead"
        title="Business Loans"

        // Filters
        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}
        onFilterByRange={onFilterByRange}
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}
        
        // STATUS FILTER
        onFilterChange={false}
        activeStatusFilter={false}
      />
    </>
  );
};

export default BusinessLoans;