import React, { useEffect, useState } from 'react'
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { getBlogs } from '@api/Modules/BlogsApi';
import ToastNotification from '@components/Notification/ToastNotification';
import { blogColumn } from '@components/TableHeader';
import { getLender } from '../../../api-services/Modules/LenderApi';
import { lenderColumn } from '../../../components/TableHeader';


const Blogs = () => {
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
    search: ''
  })

  const handleCreate = () => {

    navigate("/on-borde-lender-from");
  }

  const fetchBlogs = async () => {
    try {
     setLoading(true); 
      const response = await getLender(query.page_no, query.limit, '');

      console.log('Response:', response.data);
      if (response?.data?.success) {
        setData(response?.data?.data.rows || []);
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
    navigate(`/on-borde-lender-from/${data?.id}`)
  }

  useEffect(() => {
    fetchBlogs();
  }, [query.page_no]);
  const onPageChange = (pageNo) => {
    // console.log(pageNo.pageIndex, 'onPageChange');
    setQuery((prevQuery) => {
      // console.log(prevQuery); // Log the previous query state
      return {
        ...prevQuery,
        page_no: pageNo.pageIndex + 1 // Increment page number by 1
      };
    });
  };

  console.log(data, 'blogColumnblogColumnblogColumn')
  return (
    <>
      <Toaster />
      <DataTable
        columns={lenderColumn({
          handleEdit
        })}
        title='List Of Lender'
        data={data}
        totalDataCount={totalDataCount}
        onCreate={handleCreate}
        createLabel="On Board Lender"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
        loading={loading}
      />
    </>
  )
}

export default Blogs
