import React, { useEffect, useState } from 'react'
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import ToastNotification from '@components/Notification/ToastNotification';
import { signInColumns } from '@components/TableHeader';
import { getInAppLeads } from '../../../api-services/Modules/Leads';

const SignInUsers = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [query, setQuery] = useState({
    limit: 10,
    page_no: 1,
    search: ''
  })

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await getInAppLeads(query.page_no, query.limit, '');
      if (response?.data?.success) {
        setData(response?.data?.data?.rows || []);
        setTotalDataCount(response?.data?.data?.pagination?.total || 0);
      } else {
        ToastNotification.error("Error fetching data");
      }
    } catch (error) {
      console.error('Error fetching:', error);

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

  useEffect(() => {
    fetchBlogs();
  }, [query.page_no]);
  
  return (
    <>
      <Toaster />
      <DataTable
        columns={signInColumns({
          handleEdit
        })}
        title='Sign In Users'
        data={data}
        totalDataCount={totalDataCount}
        // onCreate={handleCreate}
        createLabel="Create"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
        loading={loading}
      />
    </>
  )
}

export default SignInUsers;
