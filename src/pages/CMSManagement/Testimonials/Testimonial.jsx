import React, { useEffect, useState } from "react";
import DataTable from "@components/Table/DataTable";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getTestimonials, updateTestimonial, addTestimonial } from "../../../api-services/Modules/TestimonialsApi";
import ToastNotification from "@components/Notification/ToastNotification";
import { testimonialsColumn } from "@components/TableHeader";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { validationSchema } from "../../../schema";
import ValidatedTextField from "@components/Form/ValidatedTextField";
import ValidatedTextArea from "@components/Form/ValidatedTextArea";
import ValidatedLabel from "@components/Form/ValidatedLabel";
import Drawer from "@components/Drawer"; 
import SubmitBtn from '@components/Form/SubmitBtn';
import Uploader from "../../../components/Form/Uploader";

// Yup validation schema


const Testimonials = () => {
  const imageUrl = import.meta.env.VITE_IMAGE_URL;
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [query, setQuery] = useState({
    limit: 10,
    page_no: 1,
    search: "",
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      designation: "",
      company: "",
      testimonial: "",
      image: null,
      order: 1,
      isActive: true,
    },
  });

  const handleCreate = () => {
    setIsDrawerOpen(true);
    setIsEditMode(false);
    reset();
  };

  const handleEdit = (testimonial) => {
    console.log(testimonial, "edit data");
    setIsEditMode(true);
    setSelectedTestimonial(testimonial?.id);
    setIsDrawerOpen(true);
    setValue("name", testimonial.name || "");
    setValue("company", testimonial.company || "");
    setValue("designation", testimonial.designation || "");
    setValue("testimonial", testimonial.testimonial || "");

    const fullImageUrl = `${imageUrl + testimonial.image}`;
    console.log(fullImageUrl, "fullImageUrl");
    setValue("image", fullImageUrl || null);
    setValue("order", testimonial.order || 1);
    setValue("isActive", testimonial.isActive ?? true);
  };

  const fetchTestimonials = async () => {
    try {
      const response = await getTestimonials(query.page_no, query.limit, "");
      if (response?.data?.success) {
        setData(response?.data?.data?.rows || []);
        setTotalDataCount(response?.data?.data?.pagination?.total || 0);
      } else {
        ToastNotification.error(
          response?.data?.message || "Error fetching testimonials"
        );
      }
    } catch (error) {
      ToastNotification.error("Failed to fetch testimonials");
    }
  };

  const handleAddTestimonial = async (formData) => {
    setLoading(true);
    console.log(formData, "formData");
    try {
      const sanitizedData = {
        name: formData.name?.trim() || "",
        designation: formData.designation?.trim() || "",
        company: formData.company?.trim() || "",
        testimonial: formData.testimonial?.trim() || "",
        image: formData.image || "",
        isActive: formData.isActive ?? true,
        order: Number(formData.order) || 1,
      };

      const response = await addTestimonial(sanitizedData);
      if (response?.data?.success) {
        ToastNotification.success("Testimonial added successfully!");
        await fetchTestimonials();
        setIsDrawerOpen(false);
        setLoading(false);
        reset();
      } else {
        ToastNotification.error(
          response?.data?.message || "Failed to add testimonial."
        );
        setLoading(false);
      }
    } catch (error) {
      ToastNotification.error(error.message || "Something went wrong!");
      setLoading(false);
    }
  };

  const handleUpdateTestimonial = async (formData) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name?.trim() || "");
      formDataToSend.append("designation", formData.designation?.trim() || "");
      formDataToSend.append("company", formData.company?.trim() || "");
      formDataToSend.append("testimonial", formData.testimonial?.trim() || "");
      if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      } else {
        formDataToSend.append("image", formData.image || "");
      }
      formDataToSend.append("isActive", String(formData.isActive ?? true));
      formDataToSend.append("order", String(Number(formData.order) || 1));

      console.table(formData, "formDataToSend");
      const response = await updateTestimonial({ id: selectedTestimonial, ...formData });
      if (response?.data?.success) {
        ToastNotification.success("Testimonial updated successfully!");
        await fetchTestimonials();
        setIsDrawerOpen(false);
        setIsEditMode(false);
        setSelectedTestimonial(null);
        reset();
      } else {
        ToastNotification.error(
          response?.data?.message || "Failed to update testimonial."
        );
      }
    } catch (error) {
      ToastNotification.error(error.message || "Something went wrong!");
    }
  };

  const onSubmit = async (formData) => {
    if (isEditMode) {
      await handleUpdateTestimonial(formData);
    } else {
      await handleAddTestimonial(formData);
    }
  };

  const onPageChange = (pageNo) => {
    setQuery((prevQuery) => ({
      ...prevQuery,
      page_no: pageNo.pageIndex + 1,
      limit: pagination.pageSize,
    }));
  };

  useEffect(() => {
    fetchTestimonials();
  }, [query.page_no, query.limit]);

  return (
    <>
      <Toaster />
      <DataTable
        columns={testimonialsColumn({ handleEdit })}
        title="Testimonials"
        data={data}
        totalDataCount={totalDataCount}
        onCreate={handleCreate}
        createLabel="Create"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setIsEditMode(false);
          setSelectedTestimonial(null);
          reset();
        }}
        title={isEditMode ? "Update Testimonial" : "Create Testimonial"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ValidatedTextField
              name="name"
              control={control}
              label="Name"
              placeholder="Enter name"
              errors={errors}
            />
            <ValidatedTextField
              name="designation"
              control={control}
              label="Designation"
              placeholder="Enter designation"
              errors={errors}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ValidatedTextField
              name="company"
              control={control}
              label="Company"
              placeholder="Enter company"
              errors={errors}
            />
            <ValidatedTextField
              name="order"
              type="number"
              control={control}
              label="Order"
              placeholder="Enter order"
              errors={errors}
            />
          </div>
          <ValidatedLabel label="Upload Image" />
          <Uploader
            name="image"
            control={control}
            label="Upload Image"
            errors={errors}
          />
          <ValidatedTextArea
            name="testimonial"
            control={control}
            label="Testimonial"
            placeholder="Write testimonial"
            rows={4}
            errors={errors}
          />
          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              {...register("isActive")}
              className="checkbox checkbox-primary"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm">
              Is Active
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                setIsEditMode(false);
                setSelectedTestimonial(null);
                reset();
              }}
              className="btn"
            >
              Cancel
            </button>
            <SubmitBtn loading={loading} label={isEditMode ? "Update" : "Submit"} />
          </div>
        </form>
      </Drawer>
    </>
  );
};

export default Testimonials;