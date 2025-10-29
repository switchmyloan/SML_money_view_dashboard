'use client'

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog } from "@headlessui/react";
import ImageUploadField from "../Form/ImageUploadField";

const CreateAuthorTagModal = ({ open, handleClose, type, onSubmit }) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
     defaultValues: {
      name: "",
      email: "",
      description: "",
      designation: "",
      socialLink: "",
      file: null,
    },
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (type === "author") {
      reset({
        name: "",
        email: "",
        description: "",
        designation: "",
        socialLink: "",
        file: null,
      });
    } else {
      reset({
        name: "",
        description: "",
      });
    }
  }, [type, reset]);


const handleFormSubmit = (data) => {
    console.log("submitted ✅", data);

    let payload = { ...data };
    if (type === "author") {
      payload.profileImageUrl = data.file ? data.file[0] : null;
    }

    onSubmit(payload);
    reset();
    setImagePreview(null);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <Dialog.Title className="text-lg font-semibold mb-4">
          {type === "author" ? "Create Author" : "Create Tag"}
        </Dialog.Title>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {type === "author" ? (
            <>
              {/* Name + Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Author Name
                  </label>
                  <input
                    type="text"
                    {...register("name", { required: "Author Name is required" })}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Designation
                  </label>
                  <input
                    type="text"
                    {...register("designation", { required: "Designation is required" })}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      errors.designation
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors.designation && (
                    <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>
                  )}
                </div>
              </div>

              {/* Social Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Social Link
                </label>
                <input
                  type="text"
                  {...register("socialLink", { required: "Social Link is required" })}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    errors.socialLink
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.socialLink && (
                  <p className="text-red-500 text-xs mt-1">{errors.socialLink.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  {...register("description", { required: "Description is required" })}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    errors.description
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profile Image
                </label>
                <Controller
                  name="file"
                  control={control}
                  rules={{ required: "Image is required" }}
                  render={({ field }) => (
                    <ImageUploadField
                      name="file"
                      control={control}
                      label="Upload Image"
                      errors={errors}
                      rules={{ required: "Image is required" }}
                      onChange={(file) => {
                        field.onChange(file); // Update form state
                        setImagePreview(file ? URL.createObjectURL(file[0]) : null); // Update preview
                      }}
                    />
                  )}
                />
                {errors.file && (
                  <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>
                )}
              </div>

              {imagePreview && (
                <div className="flex justify-center mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tag Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Tag Name is required" })}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tag Description
                </label>
                <textarea
                  rows={3}
                  {...register("description")}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default CreateAuthorTagModal;