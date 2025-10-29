import React, { useEffect, useState } from "react";
import DataTable from "@components/Table/DataTable";
import { Toaster } from "react-hot-toast";
import ToastNotification from "@components/Notification/ToastNotification";
import { pressColumn } from "@components/TableHeader";
import { useForm } from "react-hook-form";
import ValidatedTextField from "@components/Form/ValidatedTextField";
import ValidatedTextArea from "@components/Form/ValidatedTextArea";
import Drawer from "../../../components/Drawer";
import { AddPress, getPress, UpdatePress } from "../../../api-services/Modules/PressApi";
import ValidatedLabel from "../../../components/Form/ValidatedLabel";
import Uploader from "../../../components/Form/Uploader";
import { yupResolver } from "@hookform/resolvers/yup";
import { validationPressSchema } from "../../../schema/Press/create.schema";

const Press = () => {
  const imageUrl = import.meta.env.VITE_IMAGE_URL;
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
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
  const [selectedPress, setSelectedPress] = useState(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(validationPressSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      sourceLogo: "",
      redirectLink: "",
      status: "draft",
      // order: 0
    },
  });

  const handleCreate = () => {
    setIsDrawerOpen(true);
    setIsEditMode(false);
    reset();
  };

  const handleEdit = (press) => {
    console.log(press, "presssss");
    setIsEditMode(true);
    setSelectedPress(press?.id);
    setIsDrawerOpen(true);

    // prefill form values
    const fullImageUrl = `${imageUrl + press?.image}`;
    const fullSourceLogoUrl = `${imageUrl + press?.sourceLogo}`;
    setValue("title", press?.title);
    setValue("description", press?.description);
    setValue("image", fullImageUrl);
    setValue("sourceLogo", fullSourceLogoUrl);
    setValue("redirectLink", press?.redirectLink);
    setValue("status", press?.status);
    // setValue("order", press?.order);
  };

  const fetchPress = async () => {
    try {
      const response = await getPress(query.page_no, query.limit, "");
      if (response?.data?.success) {
        setData(response?.data?.data?.rows || []);
        setTotalDataCount(response?.data?.data?.pagination?.total || 0);
      } else {
        ToastNotification.error("Error fetching Press");
      }
    } catch (error) {
      console.error("Error fetching:", error);
      ToastNotification.error("Failed to fetch Press");
    }
  };

  const onSubmit = async (formData) => {
    try {
      console.table(formData, "formdata");
      if (isEditMode) {
        const response = await UpdatePress({ id: selectedPress, ...formData });
        if (response?.data?.success) {
          ToastNotification.success("Press updated successfully!");
          fetchPress();
          closeDrawer();
        } else {
          ToastNotification.error("Failed to update Press.");
        }
      } else {
        const response = await AddPress(formData);
        if (response?.data?.success) {
          ToastNotification.success("Press created successfully!");
          fetchPress();
          closeDrawer();
        } else {
          ToastNotification.error("Failed to create Press.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      ToastNotification.error("Something went wrong!");
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setIsEditMode(false);
    setSelectedPress(null);
    reset();
  };

  const onPageChange = (pageNo) => {
    setQuery((prevQuery) => ({
      ...prevQuery,
      page_no: pageNo.pageIndex + 1,
      limit: pagination.pageSize,
    }));
  };

  useEffect(() => {
    fetchPress();
  }, [query.page_no, query.limit]);

  return (
    <>
      <Toaster />
      <DataTable
        columns={pressColumn({ handleEdit })}
        title="Press Room"
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
        onClose={closeDrawer}
        title={isEditMode ? "Update Press" : "Create Press"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <ValidatedTextField
            name="title"
            control={control}
            label="Title"
            placeholder="Enter title"
            errors={errors}
          />

          {/* Description */}
          <ValidatedTextArea
            name="description"
            control={control}
            label="Description"
            errors={errors}
            placeholder="Enter description"
            rows={4}
          />

          {/* Image */}
          <ValidatedLabel label="Image" />
          <Uploader
            name="image"
            control={control}
            label="Image URL"
            errors={errors}
          />

          {/* Source Logo */}
          <ValidatedLabel label="Source Logo" />
          <Uploader
            name="sourceLogo"
            control={control}
            label="Source Logo"
            errors={errors}
          />

          {/* Redirect Link */}
          <ValidatedTextField
            name="redirectLink"
            control={control}
            label="Redirect Link"
            placeholder="Enter redirect link"
            errors={errors}
          />
          {/* <ValidatedTextField
            name="order"
            control={control}
            label="Order"
            placeholder="Enter order"
            errors={errors}
          /> */}

          {/* Status */}
          <div>
            <label className="block mb-1">Status</label>
            <select {...register("status")} className="select select-bordered w-full">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={closeDrawer} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Drawer>
    </>
  );
};

export default Press;