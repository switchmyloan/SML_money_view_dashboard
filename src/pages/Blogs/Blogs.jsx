import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getBlogs } from '../../api-services/Modules/BlogsApi';
import ToastNotification from '@components/Notification/ToastNotification';
import { CiSearch, CiMenuKebab } from 'react-icons/ci';

const BASE_URL = import.meta.env.VITE_IMAGE_URL;

const Blogs = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({
    limit: 10,
    page_no: 1,
    search: '',
  });

  const [sortOption, setSortOption] = useState('name')
  const handleCreate = () => {
    navigate('/blog/create');
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await getBlogs(query.page_no, query.limit, query.search);

      if (response?.data?.success) {
        const blogsData = response?.data?.data?.rows;

        if (Array.isArray(blogsData)) {
          setData(blogsData);
        } else {
          console.error("API did not return an array for blogs. Received:", blogsData);
          setData([]);
        }
      } else {
        ToastNotification.error("Error fetching data");
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching:', error);
      ToastNotification.error('Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setQuery((prev) => ({ ...prev, search: searchTerm }));
  };

  useEffect(() => {
    fetchBlogs();
  }, [query.page_no, query.search]);

  return (
    <div className=" text-gray-800 min-h-screen    font-sans">
      <Toaster />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-bold">Blogs</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex items-center">
            <CiSearch className="absolute left-3 text-gray-600 text-xl" />
            <input
              type="text"
              placeholder="Search blogs..."
              className="bg-white border border-gray-200 text-gray-800 rounded-md py-2 px-3 pl-10 outline-none w-full sm:w-64"
              value={query.search}
              onChange={handleSearch}
            />
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md border-none cursor-pointer font-bold whitespace-nowrap transition-colors duration-200"
            onClick={handleCreate}
          >
            Create blog
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-gray-600">Loading blogs...</p>
        ) : (
          data && Array.isArray(data) && data.length > 0 ? (
            data.map((blog) => (
              <div
                key={blog.id}
                className="flex flex-col sm:flex-row bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => handleEdit(blog.id)}
              >
              
                <div className="w-full sm:w-1/3 h-48 sm:h-40">
                  <img
                    src={`${BASE_URL}${blog.metaImage}` || 'https://via.placeholder.com/150'}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center sm:pt-0 sm:pb-0">
                  <h3 className="text-sm sm:text-lg font-bold mb-1">{blog.title}</h3>
                 
                  <p className="text-sm text-gray-700 mb-2">{blog.description}</p>
                 
                  <p className="text-sm text-gray-500">
                    {blog.readTime} min read · {blog.author.name}
                  </p>
                
                  <div className="flex flex-wrap gap-2 mt-2">
                    {blog.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end p-4 sm:p-6">

                  <span
                    className={`text-sm font-semibold py-1 px-3 rounded-full whitespace-nowrap
    ${blog.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}
                  >
                    {blog.status === 'draft' ? 'Draft' : 'Published'}
                  </span>
                  <button
                    className="bg-transparent border-none text-gray-500 hover:text-gray-700 text-xl cursor-pointer mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <CiMenuKebab />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No blogs found.</p>
          )
        )}
      </div>
    </div>
  );
};

export default Blogs;