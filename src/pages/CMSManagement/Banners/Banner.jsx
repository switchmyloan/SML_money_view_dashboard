// import React, { useEffect, useState } from 'react'
// import DataTable from '@components/Table/DataTable';
// import { Toaster } from 'react-hot-toast';
// import ToastNotification from '@components/Notification/ToastNotification';
// import Drawer from '../../../components/Drawer';
// import ValidatedTextField from "../../../components/Form/ValidatedTextField";
// import ImageUploadField from "../../../components/Form/ImageUploadField";
// import ValidatedLabel from "../../../components/Form/ValidatedLabel";
// import ValidatedTextArea from "../../../components/Form/ValidatedTextArea";
// import { useForm } from "react-hook-form";
// import { AddBanner, getBanners, getBannerById, UpdateBanner, deleteBanner } from '../../../api-services/Modules/BannerApi';
// import { bannerColumn } from '../../../components/TableHeader';
// import SubmitBtn from '@components/Form/SubmitBtn'
// import ConfirmModal from '../../../components/ConfirmationationModal';
// import Uploader from '../../../components/Form/Uploader';


// const Banner = () => {
//   const imageUrl = import.meta.env.VITE_IMAGE_URL
//   const [data, setData] = useState([]);
//   const [totalDataCount, setTotalDataCount] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [selectedBanner, setSelectedBanner] = useState(null);
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [bannerToDelete, setBannerToDelete] = useState(null);
//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 10,
//   })
//   const [query, setQuery] = useState({
//     limit: 10,
//     page_no: 1,
//     search: ''
//   })

//   const {
//     control,
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     setValue,
//   } = useForm({
//     defaultValues: {
//       bannerTitle: "",
//       bannerDescription: "",
//       bannerImage: "",
//       bannerBtn: '',
//       bannerLink: '',
//       isActive: true,
//     },
//   });

//   const handleCreate = () => {
//     setIsDrawerOpen(true);
//     setIsEditMode(false);
//     reset();
//   };

//   const handleEdit = async (data) => {
//     try {
//       // setLoading(true);
//       const response = await getBannerById(data.id);
//       if (response?.data?.success) {
//         const banner = response.data.data; 
//         console.log(banner, 'banner data from getBannerById');

//         setIsEditMode(true);
//         setSelectedBanner(data.id);
//         setIsDrawerOpen(true);
//         setValue('bannerTitle', banner.bannerTitle || '');
//         setValue('bannerDescription', banner.bannerDescription || '');
//         setValue('bannerBtn', banner.bannerBtn || '');
//         setValue('bannerLink', banner.bannerLink || '');
//         setValue('isActive', banner.isActive !== undefined ? banner.isActive : true);

//         if (banner.bannerImage) {
//           const fullImageUrl = `${imageUrl}${banner?.bannerImage}`;
//           console.log(fullImageUrl, "fullImageUrl")
//           setValue('bannerImage', fullImageUrl);
//         } else {
//           setValue('bannerImage', '');
//         }
//       } else {
//         ToastNotification.error('Failed to fetch banner details');
//       }
//     } catch (error) {
//       console.error('Error fetching banner:', error);
//       ToastNotification.error('Failed to fetch banner details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchBanners = async () => {
//     try {
//       setLoading(true);
//       const response = await getBanners(query.page_no, query.limit, '');

//       console.log('Response:', response.data.data.data);
//       if (response?.data?.success) {
//         setData(response?.data?.data?.rows || []);
//         setTotalDataCount(response?.data?.data?.pagination?.total || 0);
//       } else {
//         ToastNotification.error("Error fetching data");
//       }
//     } catch (error) {
//       console.error('Error fetching:', error);
//       //   ToastNotification.error('Failed to fetch data');
//       // router.push('/login');
//     } finally {
//       setLoading(false);
//     }
//   };


//   useEffect(() => {
//     fetchBanners();
//   }, [query.page_no]);

//   const onPageChange = (pageNo) => {
//     setQuery((prevQuery) => {
//       return {
//         ...prevQuery,
//         page_no: pageNo.pageIndex + 1
//       };
//     });
//   };

//   const onSubmit = async (formData) => {
//     setLoading(true);
//     try {
//       const formDataToSend = new FormData();
//       formDataToSend.append('bannerTitle', formData.bannerTitle);
//       formDataToSend.append('bannerDescription', formData.bannerDescription);
//       formDataToSend.append('bannerBtn', formData.bannerBtn);
//       formDataToSend.append('bannerLink', formData.bannerLink);
//       formDataToSend.append('isActive', formData.isActive);
//       if (formData.bannerImage && formData.bannerImage instanceof File) {
//         formDataToSend.append('bannerImage', formData.bannerImage);
//       }

//       if (isEditMode) {
//         // Call PATCH API for updating banner
//         const response = await UpdateBanner(selectedBanner, formDataToSend);
//         if (response?.data?.success) {
//           ToastNotification.success('Banner Updated Successfully!');
//           fetchBanners();
//           closeDrawer();
//            setLoading(false);
//         } else {
//           ToastNotification.error('Failed to Update Banner!');
//           setLoading(false);
//         }
//       } else {
//         // Call POST API for creating banner
//         const response = await AddBanner(formDataToSend);
//         if (response?.data?.success) {
//           ToastNotification.success('Banner created successfully!');
//           fetchBanners();
//           closeDrawer();
//           setLoading(false);
//         } else {
//           ToastNotification.error('Failed to create Banner!');
//           setLoading(false);
//         }
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       ToastNotification.error('Something went wrong!');
//       setLoading(false);
//     }
//   };

//   const closeDrawer = () => {
//     setIsDrawerOpen(false);
//     setIsEditMode(false);
//     setSelectedBanner(null);
//     reset();
//   };

//   const handleDeleteClick = (id) => {
//     setBannerToDelete(id);
//     setConfirmOpen(true);
//   };

//   const confirmDelete = async () => {
//     try {
//       setLoading(true);
//       const response = await deleteBanner(bannerToDelete);
//       if (response?.data?.success) {
//         ToastNotification.success("Banner deleted successfully!");
//         fetchBanners();
//       } else {
//         ToastNotification.error("Failed to delete banner!");
//       }
//     } catch (error) {
//       console.error("Delete error:", error);
//       ToastNotification.error("Something went wrong!");
//     } finally {
//       setLoading(false);
//       setConfirmOpen(false);
//       setBannerToDelete(null);
//     }
//   };

//   return (
//     <>
//       <Toaster />
//       <DataTable
//         columns={
//           bannerColumn(
//             {
//               handleEdit,
//               handleDelete : handleDeleteClick,
//             })}
//         title='Banners'
//         data={data}
//         totalDataCount={totalDataCount}
//         onCreate={handleCreate}
//         createLabel="Create"
//         onPageChange={onPageChange}
//         setPagination={setPagination}
//         pagination={pagination}
//         loading={loading}
//       />

//        <ConfirmModal
//         isOpen={confirmOpen}
//         onClose={() => setConfirmOpen(false)}
//         onConfirm={confirmDelete}
//         loading={loading}
//         title="Delete Confirmation"
//         message="Are you sure you want to delete this banner? This action cannot be undone."
//       />

//       <Drawer
//         isOpen={isDrawerOpen}
//         onClose={closeDrawer}
//         title={isEditMode ? "Update Banner" : "Create Banner"}
//       >
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <ValidatedTextField
//             name="bannerTitle"
//             control={control}
//             rules={{ required: true }}
//             label="Title"
//             placeholder="Enter Title"
//             errors={errors}
//             helperText="Title is required!"
//           />

//           <ValidatedTextField
//             name="bannerBtn"
//             control={control}
//             rules={{ required: true }}
//             label="Button Text"
//             placeholder="Enter Button Text"
//             errors={errors}
//             helperText="Button Text is required!"
//           />

//           <ValidatedTextField
//             name="bannerLink"
//             control={control}
//             rules={{ required: true }}
//             label="Button Link"
//             placeholder="Enter Button Link"
//             errors={errors}
//             helperText="Button Link is required!"
//           />

//           <ValidatedTextArea
//             name="bannerDescription"
//             control={control}
//             label="Description"
//             errors={errors}
//             placeholder="Enter description"
//             rows={4}
//             rules={{ required: "Description is required" }}
//           />

//           <ValidatedLabel label="Image" />

//           <Uploader
//                 name="bannerImage"
//                 control={control}
//                 label="Image"
//                 errors={errors}
//                 rules={{ required: "Image is required" }}
//             />

//           <div>
//             <label className="block mb-1">Status</label>
//             <select
//               {...register("isActive")}
//               className="select select-bordered w-full"
//             >
//               <option value="true">Active</option>
//               <option value="false">Inactive</option>
//             </select>
//           </div>

//           <div className="flex justify-end gap-2 pt-4">
//             <button
//               type="button"
//               onClick={closeDrawer}
//               className="btn btn-ghost"
//             >
//               Cancel
//             </button>
//             <div>
//               <SubmitBtn loading={loading} label={isEditMode ? "Update" : "Submit"} />
//             </div>
//           </div>
//         </form>
//       </Drawer>
//     </>
//   )
// }

// export default Banner


import React, { useEffect, useState, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getBanners, deleteBanner, getBannerById, UpdateBanner } from '../../../api-services/Modules/BannerApi';
import ToastNotification from '@components/Notification/ToastNotification';
import { CiSearch, CiMenuKebab, CiEdit, CiTrash } from 'react-icons/ci';
import ConfirmModal from '../../../components/ConfirmationationModal';
import Drawer from '../../../components/Drawer';
import { useForm } from 'react-hook-form';
import ValidatedTextField from "../../../components/Form/ValidatedTextField";
import ValidatedLabel from "../../../components/Form/ValidatedLabel";
import ValidatedTextArea from "../../../components/Form/ValidatedTextArea";
 import Uploader from '../../../components/Form/Uploader';
 import SubmitBtn from '@components/Form/SubmitBtn'

const BASE_URL = import.meta.env.VITE_IMAGE_URL;
const imageUrl = import.meta.env.VITE_IMAGE_URL

const Banner = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [query, setQuery] = useState({
    limit: 10,
    page_no: 1,
    search: '',
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const dropdownRef = useRef(null);


    const handleCreate = () => {
    setIsDrawerOpen(true);
    setIsEditMode(false);
    reset();
  };

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      bannerTitle: "",
      bannerDescription: "",
      bannerImage: "",
      bannerBtn: '',
      bannerLink: '',
      isActive: true,
    },
  });

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await getBanners(query.page_no, query.limit, query.search);
      if (response?.data?.success) {
        const bannersData = response?.data?.data?.rows;
        if (Array.isArray(bannersData)) {
          setData(bannersData);
          setTotalDataCount(response.data.data.pagination.total || 0);
        } else {
          console.error("API did not return an array for banners. Received:", bannersData);
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

  // const handleCreate = () => {
  //   navigate('/banner/create');
  // };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await deleteBanner(bannerToDelete);
      if (response?.data?.success) {
        ToastNotification.success("Banner deleted successfully!");
        fetchBanners();
      } else {
        ToastNotification.error("Failed to delete banner!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      ToastNotification.error("Something went wrong!");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setBannerToDelete(null);
    }
  };

  const onPageChange = (pageNo) => {
    setQuery((prev) => ({ ...prev, page_no: pageNo }));
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setQuery((prev) => ({ ...prev, search: searchTerm, page_no: 1 }));
  };

  useEffect(() => {
    fetchBanners();
  }, [query.page_no, query.search]);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('bannerTitle', formData.bannerTitle);
      formDataToSend.append('bannerDescription', formData.bannerDescription);
      formDataToSend.append('bannerBtn', formData.bannerBtn);
      formDataToSend.append('bannerLink', formData.bannerLink);
      formDataToSend.append('isActive', formData.isActive);
      if (formData.bannerImage && formData.bannerImage instanceof File) {
        formDataToSend.append('bannerImage', formData.bannerImage);
      }

      if (isEditMode) {
        // Call PATCH API for updating banner
        const response = await UpdateBanner(selectedBanner, formDataToSend);
        if (response?.data?.success) {
          ToastNotification.success('Banner Updated Successfully!');
          fetchBanners();
          closeDrawer();
           setLoading(false);
        } else {
          ToastNotification.error('Failed to Update Banner!');
          setLoading(false);
        }
      } else {
        // Call POST API for creating banner
        const response = await AddBanner(formDataToSend);
        if (response?.data?.success) {
          ToastNotification.success('Banner created successfully!');
          fetchBanners();
          closeDrawer();
          setLoading(false);
        } else {
          ToastNotification.error('Failed to create Banner!');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      ToastNotification.error('Something went wrong!');
      setLoading(false);
    }
  };

  const handleEdit = async (data) => {
    try {
      // setLoading(true);
      console.log(data, 'data id on edit click');
      const response = await getBannerById(data);
      // console.log(response, 'response from getBannerById');
      if (response?.data?.success) {
        const banner = response.data.data; 
        console.log(banner, 'banner data from getBannerById');

        setIsEditMode(true);
        setSelectedBanner(data);
        setIsDrawerOpen(true);
        setValue('bannerTitle', banner.bannerTitle || '');
        setValue('bannerDescription', banner.bannerDescription || '');
        setValue('bannerBtn', banner.bannerBtn || '');
        setValue('bannerLink', banner.bannerLink || '');
        setValue('isActive', banner.isActive !== undefined ? banner.isActive : true);

        if (banner.bannerImage) {
          const fullImageUrl = `${imageUrl}${banner?.bannerImage}`;
          console.log(fullImageUrl, "fullImageUrl")
          setValue('bannerImage', fullImageUrl);
        } else {
          setValue('bannerImage', '');
        }
      } else {
        console.log('Failed to fetch banner details');
        ToastNotification.error('Failed to fetch banner details');
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
      ToastNotification.error('Failed to fetch banner details');
    } finally {
      setLoading(false);
    }
  };

    const closeDrawer = () => {
    setIsDrawerOpen(false);
    setIsEditMode(false);
    setSelectedBanner(null);
    reset();
  };

  const totalPages = Math.ceil(totalDataCount / query.limit);
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, query.page_no - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8  lg:pt-0 font-sans bg-gray-50 min-h-screen">
      <Toaster />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Banners</h1>
          <p className="text-gray-600 mt-1">Manage all your website banners from one place.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1">
            <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
            <input
              type="text"
              placeholder="Search banners..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={query.search}
              onChange={handleSearch}
            />
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            onClick={handleCreate}
          >
            Create Banner
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 animate-pulse">Loading banners...</p>
        </div>
      ) : data && Array.isArray(data) && data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6">
            {data.map((banner) => (
              <div
                key={banner.id}
                className="relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 w-full h-80 flex items-center"
              >
                <img
                  src={`${BASE_URL}${banner.bannerImage}` || 'https://via.placeholder.com/1200x320.png?text=No+Banner+Image'}
                  alt={banner.bannerTitle}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>

                <div className="relative z-10 p-6 flex flex-col-reverse h-full w-full max-w-lg text-white justify-between">
                  <div>
                  <h3 className="text-3xl font-bold mb-2">{banner.bannerTitle}</h3>
                  <p className="text-lg mb-4 line-clamp-2">{banner.bannerDescription}</p>
                  
                  <div className="flex items-center gap-4">
                    {banner.bannerBtn && (
                      <a 
                        href={banner.bannerLink} 
                        className="bg-white text-gray-900 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200 text-base flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {banner.bannerBtn}
                      </a>
                    )}
                  </div>
                  </div>

                  <div className="absolute top-4  flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      banner.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="relative" ref={openDropdownId === banner.id ? dropdownRef : null}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === banner.id ? null : banner.id);
                        }}
                        className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
                      >
                        <CiMenuKebab size={24} />
                      </button>
                      {openDropdownId === banner.id && (
                        <ul className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                          <li
                            onClick={() => {
                              console.log(banner.id, 'banner data on edit click');
                              handleEdit(banner?.id)
                              
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                          >
                            <CiEdit /> Edit
                          </li>
                          <li
                            onClick={(e) => { e.stopPropagation(); setBannerToDelete(banner.id); setConfirmOpen(true); setOpenDropdownId(null); }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                          >
                            <CiTrash /> Delete
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            {totalPages > 1 && (
              <nav className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => onPageChange(query.page_no - 1)}
                  disabled={query.page_no === 1}
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      query.page_no === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => onPageChange(query.page_no + 1)}
                  disabled={query.page_no === totalPages}
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            )}
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">No banners found.</p>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Banner"
        message="Are you sure you want to delete this banner? This action cannot be undone."
        loading={loading}
      />



      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={isEditMode ? "Update Banner" : "Create Banner"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ValidatedTextField
            name="bannerTitle"
            control={control}
            rules={{ required: true }}
            label="Title"
            placeholder="Enter Title"
            errors={errors}
            helperText="Title is required!"
          />

          <ValidatedTextField
            name="bannerBtn"
            control={control}
            rules={{ required: true }}
            label="Button Text"
            placeholder="Enter Button Text"
            errors={errors}
            helperText="Button Text is required!"
          />

          <ValidatedTextField
            name="bannerLink"
            control={control}
            rules={{ required: true }}
            label="Button Link"
            placeholder="Enter Button Link"
            errors={errors}
            helperText="Button Link is required!"
          />

          <ValidatedTextArea
            name="bannerDescription"
            control={control}
            label="Description"
            errors={errors}
            placeholder="Enter description"
            rows={4}
            rules={{ required: "Description is required" }}
          />

          <ValidatedLabel label="Image" />

          <Uploader
                name="bannerImage"
                control={control}
                label="Image"
                errors={errors}
                rules={{ required: "Image is required" }}
            />

          <div>
            <label className="block mb-1">Status</label>
            <select
              {...register("isActive")}
              className="select select-bordered w-full"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={closeDrawer}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <div>
              <SubmitBtn loading={loading} label={isEditMode ? "Update" : "Submit"} />
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default Banner;