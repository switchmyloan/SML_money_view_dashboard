import { useController } from 'react-hook-form';
import { useEffect, useState } from 'react';
import ToastNotification from '@components/Notification/ToastNotification'; // Adjust path as needed
import ValidatedLabel from '@components/Form/ValidatedLabel'; // Adjust path as needed

const Uploader = ({ name, control, label, errors, rules }) => {
  const {
    field: { onChange, value },
  } = useController({
    name,
    control,
    rules,
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  // Handle image preview and cleanup
  useEffect(() => {
    if (value) {
      if (value instanceof File) {
        // For new uploads (create mode or new file in edit mode)
        const url = URL.createObjectURL(value);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url); // Clean up to prevent memory leaks
      } else if (typeof value === 'string' && value) {
        // For edit mode with existing image URL
        setPreviewUrl(value);
      }
    } else {
      setPreviewUrl(null); // Clear preview if no image
    }
  }, [value]);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (e.g., images only)
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        ToastNotification.error('Please upload a valid image (JPEG, PNG, GIF)');
        return;
      }
      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        ToastNotification.error('Image size must be less than 5MB');
        return;
      }
      onChange(file); // Update form value with File object
    }
  };

  return (
    <div className="mb-4">
      {/* <ValidatedLabel label={label} /> */}
      <div className="flex flex-col gap-2 cursor-pointer">
        {/* File Input */}
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        
        {/* Image Preview */}
        {previewUrl && (
          <div className="mt-2">
            <img
              src={previewUrl}
              alt="Image preview"
              className="object-cover rounded w-32 h-32"
            />
          </div>
        )}

        {/* Error Message */}
        {errors[name] && (
          <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
        )}
      </div>
    </div>
  );
};

export default Uploader;