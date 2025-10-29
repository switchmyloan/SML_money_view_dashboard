import { useEffect, useState } from 'react'
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import ToastNotification from '@components/Notification/ToastNotification';
import { getLeads } from '../../../api-services/Modules/Leads';
import { leadsColumn } from '../../../components/TableHeader';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


const Leads = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false); // N
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    // totalDataCount: totalDataCount ? totalDataCount : 1
  })
  const [query, setQuery] = useState({
    limit: 10,
    page_no: 1,
    search: '',

  })

  const handleCreate = () => {

    navigate("/blogs/create");
  }


  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await getLeads(query.page_no, query.limit, '');
      if (response?.data?.success) {
        let blogs = response?.data?.data || [];

        // Sort by createdAt ascending
        blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setData(blogs);
        setTotalDataCount(response?.data?.data?.pagination?.total || 0);
      } else {
        ToastNotification.error("Error fetching data");
      }
    } catch (error) {
      console.error('Error fetching:', error);
      ToastNotification.error('Failed to fetch data');
      // router.push('/login');
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (data) => {
    navigate(`/lead-detail/${data?.id}`, {
      state: { lead: data }
    })
  }

  const onPageChange = (pageNo) => {
    setQuery((prevQuery) => {
      return {
        ...prevQuery,
        page_no: pageNo.pageIndex + 1
      };
    });
  };


  const handleExport = () => {
    if (data.length === 0) {
      ToastNotification.info("No data to export.");
      console.log("No data to export.");
      return;
    }

   const exportData = data.map(lead => ({
        // 1. Basic Info
        'Lead ID': lead.id,
        'Created At': new Date(lead.createdAt).toLocaleString(),
        'Is Active': lead.isActive ? 'Yes' : 'No',
        
        // 2. Personal/Contact Info
        'First Name': lead.firstName,
        'Last Name': lead.lastName,
        'Full Name': `${lead.firstName} ${lead.lastName}`, // Combined field for convenience
        'Email': lead.email,
        'Phone': lead.phone,
        'Gender': lead.gender,
        'is_moneyview_user': lead.is_moneyview_user,
        'Date of Birth': lead.dob ? new Date(lead.dob).toLocaleDateString() : 'N/A',
        
        // 3. Financial/Identity Info
        'PAN Number': lead.panNumber,
        'Profession': lead.profession,
        'Salary': lead.salary,
        'Loan Amount': lead.loanAmount,
        'Pincode': lead.pincode
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    // Convert Workbook to Binary Excel Data (Buffer)
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Save the File using file-saver
    const fileName = `leads_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, fileName);

    ToastNotification.success("Export successful!");
  };


  useEffect(() => {
    fetchBlogs();
  }, [query.page_no]);
  return (
    <>
      <Toaster />
      <DataTable
        columns={leadsColumn({
          handleEdit
        })}
        title='Logs'
        data={data}
        totalDataCount={totalDataCount}
        // onCreate={handleCreate}
        createLabel="Create"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
        loading={loading}
        onRefresh={fetchBlogs}
        onExport={handleExport}
      />
    </>
  )
}

export default Leads


