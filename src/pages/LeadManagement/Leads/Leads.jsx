// import { useEffect, useState } from 'react'
// import DataTable from '@components/Table/DataTable';
// import { Toaster } from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom'
// import ToastNotification from '@components/Notification/ToastNotification';
// import { getLeads } from '../../../api-services/Modules/Leads';
// import { leadsColumn } from '../../../components/TableHeader';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';


// const Leads = () => {
//   const navigate = useNavigate();
//   const [data, setData] = useState([]);
//   const [totalDataCount, setTotalDataCount] = useState(0);
//   const [loading, setLoading] = useState(false); // N
//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 10,
//     // totalDataCount: totalDataCount ? totalDataCount : 1
//   })
//   const [query, setQuery] = useState({
//     limit: 10,
//     page_no: 1,
//     search: '',

//   })

//   const handleCreate = () => {

//     navigate("/blogs/create");
//   }


//   const fetchBlogs = async () => {
//     try {
//       setLoading(true);
//       const response = await getLeads(query.page_no, query.limit, '');
//       if (response?.data?.success) {
//         let blogs = response?.data?.data || [];

//         // Sort by createdAt ascending
//         blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//         setData(blogs);
//         setTotalDataCount(response?.data?.data?.pagination?.total || 0);
//       } else {
//         ToastNotification.error("Error fetching data");
//       }
//     } catch (error) {
//       console.error('Error fetching:', error);
//       ToastNotification.error('Failed to fetch data');
//       // router.push('/login');
//     } finally {
//       setLoading(false);
//     }
//   };


//   const handleEdit = (data) => {
//     navigate(`/lead-detail/${data?.id}`, {
//       state: { lead: data }
//     })
//   }

//   const onPageChange = (pageNo) => {
//     setQuery((prevQuery) => {
//       return {
//         ...prevQuery,
//         page_no: pageNo.pageIndex + 1
//       };
//     });
//   };


//   const handleExport = () => {
//     if (data.length === 0) {
//       ToastNotification.info("No data to export.");
//       console.log("No data to export.");
//       return;
//     }

//    const exportData = data.map(lead => ({
//         // 1. Basic Info
//         'Lead ID': lead.id,
//         'Created At': new Date(lead.createdAt).toLocaleString(),
//         'Is Active': lead.isActive ? 'Yes' : 'No',

//         // 2. Personal/Contact Info
//         'First Name': lead.firstName,
//         'Last Name': lead.lastName,
//         'Full Name': `${lead.firstName} ${lead.lastName}`, // Combined field for convenience
//         'Email': lead.email,
//         'Phone': lead.phone,
//         'Gender': lead.gender,
//         'is_moneyview_user': lead.is_moneyview_user,
//         'MoneyView_status' : lead.lender_response?.MoneyView?.message,
//         'Date of Birth': lead.dob ? new Date(lead.dob).toLocaleDateString() : 'N/A',

//         // 3. Financial/Identity Info
//         'PAN Number': lead.panNumber,
//         'Profession': lead.profession,
//         'Salary': lead.salary,
//         'Loan Amount': lead.loanAmount,
//         'Pincode': lead.pincode
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

//     // Convert Workbook to Binary Excel Data (Buffer)
//     const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

//     // Save the File using file-saver
//     const fileName = `leads_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
//     const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
//     saveAs(dataBlob, fileName);

//     ToastNotification.success("Export successful!");
//   };


//   useEffect(() => {
//     fetchBlogs();
//   }, [query.page_no]);
//   return (
//     <>
//       <Toaster />
//       <DataTable
//       columns={leadsColumn({
//           handleEdit
//         })}
//         title='Logs'
//         data={data}
//         totalDataCount={totalDataCount}
//         // onCreate={handleCreate}
//         createLabel="Create"
//         onPageChange={onPageChange}
//         setPagination={setPagination}
//         pagination={pagination}
//         loading={loading}
//         onRefresh={fetchBlogs}
//         onExport={handleExport}
//       />
//     </>
//   )
// }

// export default Leads




// Leads.jsx
import { useEffect, useState, useMemo } from 'react';
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '@components/Notification/ToastNotification';
import { getLeads } from '../../../api-services/Modules/Leads';
import { leadsColumn } from '../../../components/TableHeader';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Leads = () => {
  const navigate = useNavigate();

  const [rawData, setRawData] = useState([]); // Full data from API
  const [filteredData, setFilteredData] = useState([]); // After frontend filter
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState({
    page_no: 1,
    limit: 10,
    search: '',
    filter_date: '', // 'today' | 'yesterday' | ''
  });

  // Fetch all leads (no date filter in API)
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await getLeads(query.page_no, query.limit, query.search);

      if (response?.data?.success) {
        const leads = response.data.data || [];
        setRawData(leads);
        setTotalDataCount(response.data.pagination?.total || leads.length);
      } else {
        ToastNotification.error('Failed to fetch leads');
      }
    } catch (error) {
      console.error('Error:', error);
      ToastNotification.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when pagination or search changes
  useEffect(() => {
    fetchLeads();
  }, [query.page_no, query.limit, query.search]);

  // Frontend filtering: Today / Yesterday
  const filteredLeads = useMemo(() => {
    if (!query.filter_date) return rawData;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    return rawData.filter((lead) => {
      const leadDate = new Date(lead.createdAt);
      const leadDay = new Date(leadDate.getFullYear(), leadDate.getMonth(), leadDate.getDate());

      if (query.filter_date === 'today') {
        return leadDay.getTime() === today.getTime();
      } else if (query.filter_date === 'yesterday') {
        return leadDay.getTime() === yesterday.getTime();
      }
      return true;
    });
  }, [rawData, query.filter_date]);

  // Apply search filter on filteredLeads
  const searchFiltered = useMemo(() => {
    if (!query.search) return filteredLeads;

    const lowerSearch = query.search.toLowerCase();
    return filteredLeads.filter((lead) =>
      `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone} ${lead.panNumber}`
        .toLowerCase()
        .includes(lowerSearch)
    );
  }, [filteredLeads, query.search]);

  // Final data for DataTable
  const tableData = searchFiltered;

  // Update DataTable when filter changes
  useEffect(() => {
    setFilteredData(tableData);
  }, [tableData]);

  // Pagination handler
  const onPageChange = (pagination) => {
    setQuery((prev) => ({
      ...prev,
      page_no: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    }));
  };

  // Search handler
  const onSearch = (searchTerm) => {
    setQuery((prev) => ({
      ...prev,
      search: searchTerm,
      page_no: 1,
    }));
  };

  // Today / Yesterday filter
  const onFilterByDate = (type) => {
    setQuery((prev) => ({
      ...prev,
      filter_date: prev.filter_date === type ? '' : type,
      page_no: 1, // reset page
    }));
  };

  const handleExport = () => {
    if (tableData.length === 0) {
      ToastNotification.info('No data to export.');
      return;
    }

    const exportData = tableData.map((lead) => ({
      'Lead ID': lead.id,
      'Created At': new Date(lead.createdAt).toLocaleString(),
      'First Name': lead.firstName,
      'Last Name': lead.lastName,
      'Email': lead.email,
      'Phone': lead.phone,
      'PAN': lead.panNumber,
      'DOB': lead.dob ? new Date(lead.dob).toLocaleDateString() : 'N/A',
      'Profession': lead.profession,
      'Salary': lead.salary,
      'Loan Amount': lead.loanAmount,
      'Pincode': lead.pincode,
      'MoneyView User': lead.is_moneyview_user ? 'Yes' : 'No',
      'MoneyView Status': lead.lender_response?.MoneyView?.message || 'N/A',
      'Is Active': lead.isActive ? 'Yes' : 'No',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const fileName = `leads_${query.filter_date || 'all'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(new Blob([excelBuffer]), fileName);

    ToastNotification.success('Exported successfully!');
  };

  const handleEdit = (lead) => {
    navigate(`/lead-detail/${lead.id}`, { state: { lead } });
  };

  const handleCreate = () => {
    navigate('/leads/create');
  };

      const filteredCount = searchFiltered.length;

  return (
    <>
      <Toaster/>
      <DataTable
        columns={leadsColumn({ handleEdit })}
        data={filteredData} 
        totalDataCount={filteredCount}
        title="Logs"
        loading={loading}
        onPageChange={onPageChange}
        onRefresh={fetchLeads}
        onExport={handleExport}
        onCreate={handleCreate}
        createLabel="Add Lead"
        onFilterByDate={onFilterByDate}

        activeFilter={query.filter_date}
      />
    </>
  );
};

export default Leads;