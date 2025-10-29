import React, { useEffect, useState } from 'react'
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { getBlogs } from '@api/Modules/BlogsApi';
import ToastNotification from '@components/Notification/ToastNotification';
import { blogColumn } from '@components/TableHeader';


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

    navigate("/blogs/create");
  }

  const fetchBlogs = async () => {
    try {
     setLoading(true); 
      const response = await getBlogs(query.page_no, query.limit, '');

      console.log('Response:', response.data.data);
      if (response?.data?.success) {
        setData(response?.data?.data?.data || []);
        setTotalDataCount(response?.data?.data?.pagination?.totalItems || 0);
      } else {
        ToastNotification.error("Error fetching data");
      }
    } catch (error) {
      console.error('Error fetching:', error);
    //   ToastNotification.error('Failed to fetch data');
      // router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (data) => {
    navigate(`/blogs/${data?.id}`)
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
  return (
    <>
      <Toaster />
      <DataTable
        columns={blogColumn({
          handleEdit
        })}
        title='Social Icons'
        data={[]}
        totalDataCount={totalDataCount}
        onCreate={handleCreate}
        createLabel="Create"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
        loading={loading}
      />
    </>
  )
}

export default Blogs
