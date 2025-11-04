
// // Leads.jsx
// import { useEffect, useState, useMemo } from 'react';
// import DataTable from '@components/Table/DataTable';
// import { Toaster } from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';
// import ToastNotification from '@components/Notification/ToastNotification';
// import { getLeads } from '../../../api-services/Modules/Leads';
// import { leadsColumn } from '../../../components/TableHeader';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

// const Leads = () => {
//   const navigate = useNavigate();

//   const [rawData, setRawData] = useState([]); // Full data from API
//   const [filteredData, setFilteredData] = useState([]); // After frontend filter
//   const [totalDataCount, setTotalDataCount] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const [query, setQuery] = useState({
//     page_no: 1,
//     limit: 10,
//     search: '',
//     filter_date: '', // 'today' | 'yesterday' | ''
//   });

//   // Fetch all leads (no date filter in API)
//   const fetchLeads = async () => {
//     setLoading(true);
//     try {
//       const response = await getLeads(query.page_no, query.limit, query.search);

//       if (response?.data?.success) {
//         const leads = response.data.data || [];
//         setRawData(leads);
//         setTotalDataCount(response.data.pagination?.total || leads.length);
//       } else {
//         ToastNotification.error('Failed to fetch leads');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       ToastNotification.error('Failed to fetch leads');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Re-fetch when pagination or search changes
//   useEffect(() => {
//     fetchLeads();
//   }, [query.page_no, query.limit, query.search]);

//   // Frontend filtering: Today / Yesterday
//   const filteredLeads = useMemo(() => {
//     if (!query.filter_date) return rawData;

//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const yesterday = new Date(today);
//     yesterday.setDate(today.getDate() - 1);

//     return rawData.filter((lead) => {
//       const leadDate = new Date(lead.createdAt);
//       const leadDay = new Date(leadDate.getFullYear(), leadDate.getMonth(), leadDate.getDate());

//       if (query.filter_date === 'today') {
//         return leadDay.getTime() === today.getTime();
//       } else if (query.filter_date === 'yesterday') {
//         return leadDay.getTime() === yesterday.getTime();
//       }
//       return true;
//     });
//   }, [rawData, query.filter_date]);

//   // Apply search filter on filteredLeads
//   const searchFiltered = useMemo(() => {
//     if (!query.search) return filteredLeads;

//     const lowerSearch = query.search.toLowerCase();
//     return filteredLeads.filter((lead) =>
//       `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone} ${lead.panNumber}`
//         .toLowerCase()
//         .includes(lowerSearch)
//     );
//   }, [filteredLeads, query.search]);

//   // Final data for DataTable
//   const tableData = searchFiltered;

//   // Update DataTable when filter changes
//   useEffect(() => {
//     setFilteredData(tableData);
//   }, [tableData]);

//   // Pagination handler
//   const onPageChange = (pagination) => {
//     setQuery((prev) => ({
//       ...prev,
//       page_no: pagination.pageIndex + 1,
//       limit: pagination.pageSize,
//     }));
//   };

//   // Search handler
//   const onSearch = (searchTerm) => {
//     setQuery((prev) => ({
//       ...prev,
//       search: searchTerm,
//       page_no: 1,
//     }));
//   };

//   // Today / Yesterday filter
//   const onFilterByDate = (type) => {
//     setQuery((prev) => ({
//       ...prev,
//       filter_date: prev.filter_date === type ? '' : type,
//       page_no: 1, // reset page
//     }));
//   };

//   const handleExport = () => {
//     if (tableData.length === 0) {
//       ToastNotification.info('No data to export.');
//       return;
//     }

//     const exportData = tableData.map((lead) => ({
//       'Lead ID': lead.id,
//       'Created At': new Date(lead.createdAt).toLocaleString(),
//       'First Name': lead.firstName,
//       'Last Name': lead.lastName,
//       'Email': lead.email,
//       'Phone': lead.phone,
//       'PAN': lead.panNumber,
//       'DOB': lead.dob ? new Date(lead.dob).toLocaleDateString() : 'N/A',
//       'Profession': lead.profession,
//       'Salary': lead.salary,
//       'Loan Amount': lead.loanAmount,
//       'Pincode': lead.pincode,
//       'MoneyView User': lead.is_moneyview_user ? 'Yes' : 'No',
//       'MoneyView Status': lead.lender_response?.MoneyView?.message || 'N/A',
//       'Is Active': lead.isActive ? 'Yes' : 'No',
//     }));

//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Leads');
//     const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     const fileName = `leads_${query.filter_date || 'all'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
//     saveAs(new Blob([excelBuffer]), fileName);

//     ToastNotification.success('Exported successfully!');
//   };

//   const handleEdit = (lead) => {
//     navigate(`/lead-detail/${lead.id}`, { state: { lead } });
//   };

//   const handleCreate = () => {
//     navigate('/leads/create');
//   };

//       const filteredCount = searchFiltered.length;

//   return (
//     <>
//       <Toaster/>
//       <DataTable
//         columns={leadsColumn({ handleEdit })}
//         data={filteredData} 
//         totalDataCount={filteredCount}
//         title="Logs"
//         loading={loading}
//         onPageChange={onPageChange}
//         onRefresh={fetchLeads}
//         onExport={handleExport}
//         // onCreate={handleCreate}
//         createLabel="Add Lead"
//         onFilterByDate={onFilterByDate}

//         activeFilter={query.filter_date}

//       />
//     </>
//   );
// };

// export default Leads;


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



// import { useEffect, useState, useCallback, useMemo } from 'react'; // useMemo imported
// import DataTable from '@components/Table/DataTable';
// import { Toaster } from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';
// import ToastNotification from '@components/Notification/ToastNotification';
// import { getLeads } from '../../../api-services/Modules/Leads';
// import { leadsColumn } from '../../../components/TableHeader';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

// // --- Debounce Utility Function ---
// const debounce = (func, delay) => {
//   let timeoutId;
//   const debounced = (...args) => {
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => func(...args), delay);
//   };
//   debounced.cancel = () => {
//     clearTimeout(timeoutId);
//   };
//   return debounced;
// };
// // ---------------------------------


// const Leads = () => {
//   const navigate = useNavigate();

//   const [rawData, setRawData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [query, setQuery] = useState({
//     page_no: 1,
//     limit: 10,
//     search: '',
//     filter_date: '',
//     startDate: null,
//     endDate: null,
//     status: ''
//   });

//   // ------------------------------------------------------------------
//   // 1. Stable API Fetch Function
//   // ------------------------------------------------------------------
//   const fetchLeads = useCallback(async () => {
//     setLoading(true);
//     try {
//       // यहाँ आपके बैकएंड को केवल pagination और search के लिए query भेजने की आवश्यकता है
//       // क्योंकि filter_date और dateRange का उपयोग फ्रंटएंड पर फ़िल्टरिंग के लिए हो रहा है।
//       const response = await getLeads(query.page_no, query.limit, query.search);

//       if (response?.data?.success) {
//         // **महत्वपूर्ण:** हम rawData में पूरा डेटा स्टोर कर रहे हैं जो API से आता है
//         // ताकि फ्रंटएंड फ़िल्टरिंग (date/range) इस पर चल सके।
//         const leads = response.data.data || [];
//         setRawData(leads);
//       } else {
//         ToastNotification.error('Failed to fetch leads');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       ToastNotification.error('Failed to fetch leads');
//     } finally {
//       setLoading(false);
//     }
//   }, [query.page_no, query.limit, query.search]); // केवल वही dependencies जो API कॉल को ट्रिगर करती हैं

//   // Re-fetch when pagination or search changes
//   useEffect(() => {
//     fetchLeads();
//   }, [fetchLeads]);

//   // ------------------------------------------------------------------
//   // 2. Frontend Filtering and Data Processing
//   // ------------------------------------------------------------------

//   // डेटा प्रोसेसिंग को useMemo में रैप करना अत्यधिक कुशल है 
//   // ताकि यह केवल तभी चले जब rawData या query बदले।
//   const { tableData, filteredCount } = useMemo(() => {
//     let currentFilteredData = rawData;

//     // 1. Today / Yesterday Filter Logic
//     if (query.filter_date) {
//       const now = new Date();
//       const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//       const yesterday = new Date(today);
//       yesterday.setDate(today.getDate() - 1);

//       currentFilteredData = currentFilteredData.filter((lead) => {
//         const leadDate = new Date(lead.createdAt);
//         const leadDay = new Date(leadDate.getFullYear(), leadDate.getMonth(), leadDate.getDate());

//         if (query.filter_date === 'today') {
//           return leadDay.getTime() === today.getTime();
//         } else if (query.filter_date === 'yesterday') {
//           return leadDay.getTime() === yesterday.getTime();
//         }
//         return true;
//       });
//     }

//     // 2. Date Range Filter Logic
//     if (query.startDate && query.endDate) {
//       const filterStart = new Date(query.startDate);
//       const filterEndExclusive = new Date(query.endDate);
//       filterEndExclusive.setDate(filterEndExclusive.getDate() + 1);

//       currentFilteredData = currentFilteredData.filter((lead) => {
//         const leadDate = new Date(lead.createdAt);

//         return leadDate >= filterStart && leadDate < filterEndExclusive;
//       });
//     }

//     // 3. Search Filter (Already part of API, but doing it again on FE for consistency)
//     // NOTE: If API does not support search, you should do the search on rawData.
//     // Since fetchLeads depends on query.search, we assume API handles the primary search.
//     // This FE search is redundant if API works perfectly with `query.search`.
//     // Keeping it for robust FE filtering:
//     let searchFiltered = currentFilteredData;
//     if (query.search) {
//       const lowerSearch = query.search.toLowerCase();
//       searchFiltered = currentFilteredData.filter((lead) =>
//         `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone} ${lead.panNumber}`
//           .toLowerCase()
//           .includes(lowerSearch)
//       );
//     }


//     if (query.status) {
//       const want = query.status.toLowerCase().trim();

//       currentFilteredData = currentFilteredData.filter((lead) => {
//         const msg = lead?.lender_response?.MoneyView?.message || "";
//         const got = msg.toLowerCase().trim();

//         if (want === "success") {
//           return got.includes("success");
//         }
//         return got === want;
//       });
//     }

//     // Total count of filtered items
//     const filteredCount = searchFiltered.length;

//     // 4. Apply Pagination Slice (Final Data for Table)
//     const start = (query.page_no - 1) * query.limit;
//     const end = start + query.limit;
//     const tableData = searchFiltered.slice(start, end);

//     return { tableData, filteredCount };
//   }, [rawData, query.filter_date, query.startDate, query.endDate, query.search, query.page_no, query.limit, query.status]);


//   // ------------------------------------------------------------------
//   // 🛠️ Handlers (Loop Fix Applied Here)
//   // ------------------------------------------------------------------

//   const onPageChange = useCallback((pagination) => {
//     setQuery((prev) => ({
//       ...prev,
//       page_no: pagination.pageIndex + 1,
//       limit: pagination.pageSize,
//     }));
//   }, []);

//   //   const handleStatusFilter = useCallback((newStatus) => {
//   //     setQuery((prev) => ({
//   //       ...prev,
//   //       status: newStatus,
//   //       page_no: 1, // Reset page
//   //     }));
//   //   }, []);

//   const handleStatusFilter = useCallback((newStatus) => {
//     setQuery(prev => ({
//       ...prev,
//       status: newStatus,
//       page_no: 1
//     }));
//   }, []);


//   // 🛑 LOOP FIX: onSearchHandler को स्थिर करें और Debounce लागू करें
//   const onSearchHandler = useCallback((searchTerm) => {
//     setQuery((prev) => ({
//       ...prev,
//       search: searchTerm,
//       page_no: 1,
//     }));
//   }, []); // setQuery स्थिर है, इसलिए कोई dependency नहीं

//   // Debounced फ़ंक्शन बनाएं (300ms delay)
//   const debouncedSearch = useMemo(
//     () => debounce(onSearchHandler, 300),
//     [onSearchHandler]
//   );


//   // 🛑 MISSING HANDLER: onFilterByDate (जो आपने कमेंट आउट किया था, उसे वापस जोड़ें)
//   const onFilterByDate = useCallback((type) => {
//     debouncedSearch.cancel(); // Cancel any pending search
//     setQuery((prev) => ({
//       ...prev,
//       filter_date: prev.filter_date === type ? '' : type,
//       startDate: null, // Clear date range filter
//       endDate: null,   // Clear date range filter
//       page_no: 1, // reset page
//       // search: '' // Optional: Clear search term
//     }));
//   }, [debouncedSearch]);


//   const onFilterByRange = useCallback((dateRange) => {
//     debouncedSearch.cancel();
//     setQuery((prev) => ({
//       ...prev,
//       startDate: dateRange.startDate,
//       endDate: dateRange.endDate,
//       filter_date: '', // Clear Today/Yesterday filter
//       page_no: 1, // Reset page
//       // search: '' // Optional: Clear search term
//     }));
//   }, [debouncedSearch]);


//   const handleExport = () => {
//     // use `searchFiltered` (जिसे मैंने `tableData` और `filteredCount` के साथ useMemo में रैप किया है)
//     const exportData = rawData // Note: Exporting ALL rawData, not just the page slice
//       .filter(lead => {
//         // Re-apply the frontend date/range/search filters on ALL rawData for export accuracy
//         // This part should be aligned with the FE filtering logic inside useMemo, 
//         // but for simplicity and full data export, we'll use the already filtered list if possible
//         // However, to export the CURRENTLY visible filtered set, you'd need the whole filtered list, 
//         // not just the paginated slice. Since you already have the whole filtering logic, 
//         // I'm assuming you want to export the entire data set that matches the current filters.
//         // Re-running the FE filter logic here on rawData for full list export:
//         // This requires accessing the full `searchFiltered` array, which is hard outside useMemo.

//         // For now, I'll simplify: just check if the current query requires refetching for full export.
//         // A proper solution might involve an API call for 'export all filtered'.
//         // Since the current setup only loads a limited set (limit:10), we cannot export everything 
//         // unless we fetch all data first.
//         return true; // Keep original logic for now, assuming only the loaded 10 are exported, which is incorrect. 
//       });

//     // **WARNING:** With your current API setup (limit:10), `rawData` only has 10 leads. 
//     // Exporting based on `rawData` will only export 10 leads.
//     // To fix this, you need a dedicated "Export API" or fetch ALL data before export.

//     const dataToExport = rawData.map((lead) => ({
//       'Lead ID': lead.id,
//       'Created At': new Date(lead.createdAt).toLocaleString(),
//       'First Name': lead.firstName,
//       'Last Name': lead.lastName,
//       'Email': lead.email,
//       'Phone': lead.phone,
//       'PAN': lead.panNumber,
//       'DOB': lead.dob ? new Date(lead.dob).toLocaleDateString() : 'N/A',
//       'Profession': lead.profession,
//       'Salary': lead.salary,
//       'Loan Amount': lead.loanAmount,
//       'Pincode': lead.pincode,
//       'MoneyView User': lead.is_moneyview_user ? 'Yes' : 'No',
//       'MoneyView Status': lead.lender_response?.MoneyView?.message || 'N/A',
//       'Is Active': lead.isActive ? 'Yes' : 'No',
//     }));

//     if (dataToExport.length === 0) {
//       ToastNotification.info('No data to export.');
//       return;
//     }

//     const ws = XLSX.utils.json_to_sheet(dataToExport);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Leads');
//     const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     const fileName = `leads_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
//     saveAs(new Blob([excelBuffer]), fileName);

//     ToastNotification.success('Exported successfully!');
//   };

//   const handleEdit = (lead) => {
//     navigate(`/lead-detail/${lead.id}`, { state: { lead } });
//   };

//   const handleCreate = () => {
//     navigate('/leads/create');
//   };

//   // Clean up the debounce function on component unmount
//   useEffect(() => {
//     return () => {
//       debouncedSearch.cancel && debouncedSearch.cancel();
//     };
//   }, [debouncedSearch]);


//   return (
//     <>
//       <Toaster />
//       <DataTable
//         columns={leadsColumn({ handleEdit })}
//         data={tableData} // Uses the paginated slice from useMemo
//         totalDataCount={filteredCount} // Uses the total count after frontend filters from useMemo
//         title="Logs"
//         loading={loading}
//         onPageChange={onPageChange}
//         onSearch={debouncedSearch} // 👈 Stable Debounced Search
//         onRefresh={fetchLeads}
//         onExport={handleExport}
//         createLabel="Add Lead"

//         // Today/Yesterday props
//         onFilterByDate={onFilterByDate} // 👈 Un-commented and stable
//         activeFilter={query.filter_date}

//         // Date Range Filter props
//         onFilterByRange={onFilterByRange}
//         activeDateRange={{
//           startDate: query.startDate,
//           endDate: query.endDate
//         }}
//         onCreate={handleCreate}
//         onFilterChange={handleStatusFilter}
//         activeStatusFilter={query.status}
//       />
//     </>
//   );
// };

// export default Leads;


import { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { leadsColumn } from '../../../components/TableHeader';
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
    const data = tableData.map(l => ({
      Name: `${l.firstName} ${l.lastName}`,
      Email: l.email,
      Phone: l.phone,
      Status: l.lender_response?.MoneyView?.message || 'N/A',
      Created: new Date(l.createdAt).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf]), `leads_${new Date().toISOString().slice(0,10)}.xlsx`);
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
        title="Leads"

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

export default BusinessLoans;