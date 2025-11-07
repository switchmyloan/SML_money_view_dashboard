// import { useEffect, useState, useCallback } from 'react';
// import DataTable from '@components/Table/DataTable';
// import { Toaster } from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';
// import ToastNotification from '@components/Notification/ToastNotification';
// import { getLeads } from '../../../api-services/Modules/Leads';
// import { leadsColumn } from '../../../components/TableHeader';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

// const Leads = () => {
//   const navigate = useNavigate();

//   const [rawData, setRawData] = useState([]); // Full data from API
//   // Removed totalDataCount state to prevent loop
//   const [loading, setLoading] = useState(false);

//   const [query, setQuery] = useState({
//     page_no: 1,
//     limit: 10,
//     search: '',
//     filter_date: '', // 'today' | 'yesterday' | ''
//     startDate: null,
//     endDate: null,
//   });

//   // API Fetch Function
//   const fetchLeads = useCallback(async () => {
//     setLoading(true);
//     try {
//       // API call for pagination and search (if implemented on backend)
//       const response = await getLeads(query.page_no, query.limit, query.search); 

//       if (response?.data?.success) {
//         const leads = response.data.data || [];
//         setRawData(leads);
//       } else {
//         ToastNotification.error('Failed to fetch leads');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       ToastNotification.error('Failed to fetch leads');
//     } finally {
//       setLoading(false);
//     }
//   }, [query.page_no, query.limit, query.search]); // query dependencies for API fetch

//   // Re-fetch when pagination or search changes
//   useEffect(() => {
//     fetchLeads();
//   }, [fetchLeads]); 

//   // ------------------------------------------------------------------
//   // 🚀 Frontend Filtering and Data Processing (Pure Functions - No useMemo)
//   // ------------------------------------------------------------------

//   let currentFilteredData = rawData;

//   // 1. Today / Yesterday Filter Logic
//   if (query.filter_date) {
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const yesterday = new Date(today);
//     yesterday.setDate(today.getDate() - 1);

//     currentFilteredData = currentFilteredData.filter((lead) => {
//       const leadDate = new Date(lead.createdAt);
//       const leadDay = new Date(leadDate.getFullYear(), leadDate.getMonth(), leadDate.getDate());

//       if (query.filter_date === 'today') {
//         return leadDay.getTime() === today.getTime();
//       } else if (query.filter_date === 'yesterday') {
//         return leadDay.getTime() === yesterday.getTime();
//       }
//       return true;
//     });
//   }

//   // 2. Date Range Filter Logic
//   if (query.startDate && query.endDate) {
//     const filterStart = new Date(query.startDate);
//     const filterEndExclusive = new Date(query.endDate);
//     filterEndExclusive.setDate(filterEndExclusive.getDate() + 1); 

//     currentFilteredData = currentFilteredData.filter((lead) => {
//       const leadDate = new Date(lead.createdAt);
//       
//       return leadDate >= filterStart && leadDate < filterEndExclusive;
//     });
//   }

//   // 3. Search Filter
//   let searchFiltered = currentFilteredData;
//   if (query.search) {
//     const lowerSearch = query.search.toLowerCase();
//     searchFiltered = currentFilteredData.filter((lead) =>
//       `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone} ${lead.panNumber}`
//         .toLowerCase()
//         .includes(lowerSearch)
//     );
//   }

//   // Total count of filtered items
//   const filteredCount = searchFiltered.length;

//   // 4. Apply Pagination Slice (Final Data for Table)
//   const start = (query.page_no - 1) * query.limit;
//   const end = start + query.limit;
//   const tableData = searchFiltered.slice(start, end);


//   // ------------------------------------------------------------------
//   // 🛠️ Handlers (Unchanged)
//   // ------------------------------------------------------------------
//   const onPageChange = useCallback((pagination) => {
//     setQuery((prev) => ({
//       ...prev,
//       page_no: pagination.pageIndex + 1,
//       limit: pagination.pageSize,
//     }));
//   }, []);


//   const onSearch = (searchTerm) => {
//     setQuery((prev) => ({
//       ...prev,
//       search: searchTerm,
//       page_no: 1,
//     }));
//   };

// //   const onFilterByDate = (type) => {
// //     setQuery((prev) => ({
// //       ...prev,
// //       filter_date: prev.filter_date === type ? '' : type,
// //       startDate: null, // Clear date range filter
// //       endDate: null,   // Clear date range filter
// //       page_no: 1, // reset page
// //     }));
// //   };
//   
//   const onFilterByRange = (dateRange) => {
//     setQuery((prev) => ({
//       ...prev,
//       startDate: dateRange.startDate,
//       endDate: dateRange.endDate,
//       filter_date: '', // Clear Today/Yesterday filter
//       page_no: 1, // Reset page
//     }));
//   };

//   const handleExport = () => {
//     if (searchFiltered.length === 0) {
//       ToastNotification.info('No data to export.');
//       return;
//     }

//     const exportData = searchFiltered.map((lead) => ({
//       'Lead ID': lead.id,
//       'Created At': new Date(lead.createdAt).toLocaleString(),
//       'First Name': lead.firstName,
//       'Last Name': lead.lastName,
//       'Email': lead.email,
//       'Phone': lead.phone,
//       'PAN': lead.panNumber,
//       'DOB': lead.dob ? new Date(lead.dob).toLocaleDateString() : 'N/A',
//       'Profession': lead.profession,
//       'Salary': lead.salary,
//       'Loan Amount': lead.loanAmount,
//       'Pincode': lead.pincode,
//       'MoneyView User': lead.is_moneyview_user ? 'Yes' : 'No',
//       'MoneyView Status': lead.lender_response?.MoneyView?.message || 'N/A',
//       'Is Active': lead.isActive ? 'Yes' : 'No',
//     }));

//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Leads');
//     const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     const fileName = `leads_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
//     saveAs(new Blob([excelBuffer]), fileName);

//     ToastNotification.success('Exported successfully!');
//   };

//   const handleEdit = (lead) => {
//     navigate(`/lead-detail/${lead.id}`, { state: { lead } });
//   };

//   const handleCreate = () => {
//     navigate('/leads/create');
//   };


//   return (
//     <>
//       <Toaster/>
//       <DataTable
//         columns={leadsColumn({ handleEdit })}
//         data={tableData} // Uses the paginated slice
//         totalDataCount={filteredCount} // Uses the total count after frontend filters
//         title="Logs"
//         loading={loading}
//         onPageChange={onPageChange}
//         onSearch={onSearch}
//         onRefresh={fetchLeads}
//         onExport={handleExport}
//         createLabel="Add Lead"
//         
//         // Today/Yesterday props
// //         onFilterByDate={onFilterByDate}
//         activeFilter={query.filter_date}
//         
//         // Date Range Filter props
//         onFilterByRange={onFilterByRange}
//         activeDateRange={{ 
//           startDate: query.startDate, 
//           endDate: query.endDate 
//         }}
//       />
//     </>
//   );
// };

// export default Leads;


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

    // 2. Date Range
    // if (query.startDate && query.endDate) {
    //   const start = new Date(query.startDate);
    //   const end = new Date(query.endDate);
    //   end.setDate(end.getDate() + 1);

    //   list = list.filter(lead => {
    //     const d = new Date(lead.createdAt);
    //     return d > start && d < end;
    //   });
    // }

    // 2. Date Range
    if (query.startDate && query.endDate) {
      // Start date should be the beginning of the day (inclusive)
      const start = new Date(query.startDate);
      start.setHours(0, 0, 0, 0); // Ensure start is 00:00:00 on start date

      // End date should be the end of the day (inclusive)
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999); // Set end to 23:59:59.999 on end date

      // 🛑 REMOVE THIS LINE: end.setDate(end.getDate() + 1); 

      list = list.filter(lead => {
        const d = new Date(lead.createdAt);
        // Change d < end to d <= end to make the end date inclusive
        return d >= start && d <= end;
      });
    }

    // 3. 🔥 STATUS FILTER — SUCCESS = includes, बाकी exact
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