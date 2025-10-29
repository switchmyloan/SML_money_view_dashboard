// import React, { useState, useEffect } from "react";
// import { Controller } from "react-hook-form";
// import { X, Upload } from "lucide-react";

// const ImageUploadField = ({
//   name,
//   control,
//   label = "Upload Image",
//   rules,
//   errors,
//   defaultPreview = null,
//   maxWidth = 100,
//   maxHeight = 100,
//   handleFileInputChangeBanner,
//   value,
//   handleFileInputReset,
//   isUploading,
//   imgSrc
// }) => {
 

//   return (
//     <Controller
//       name={name}
//       control={control}
//       rules={rules}
//       render={({ field: { onChange } }) => (
//         <div className="space-y-3">
//           {/* Upload Button */}
//           {!imgSrc && (
//             <label className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed ${errors?.[name] ? 'border-red-500' : 'border-gray-300 '} rounded-lg cursor-pointer hover:border-blue-400 transition`}>
//               <input
//                 name={name}
//                 type="file"
//                 value={value}
//                 accept="image/*"
//                 className="hidden"
//                 onChange={handleFileInputChangeBanner}
//               />
//               <Upload className={`w-6 h-6 ${errors?.[name] ? 'text-red-500' : 'text-gray-500'}   mb-1`} />
//               <span className={`${errors?.[name] ? 'text-red-500' : 'text-gray-600'}  text-sm`}>{label}</span>
//             </label>
//           )}

//           {/* Preview Section */}
//           {imgSrc && (
//             <div className="relative w-fit">
//               <img
//                 src={imgSrc}
//                 alt="imgSrc"
//                 className="rounded-lg shadow object-contain transition"
//                 style={{
//                   maxWidth: maxWidth,
//                   maxHeight: maxHeight,
//                 }}
//                 onError={(e) => {
//                   console.error("Image failed to load:", imgSrc);
//                   e.currentTarget.src =
//                     "https://avatar.iran.liara.run/public/38";
//                 }}
//               />
//               {/* Remove Button */}
//               <button
//                 type="button"
//                 onClick={handleFileInputReset}
//                 className="absolute top-2 right-2 bg-white rounded-full shadow p-1 hover:bg-red-500 hover:text-white transition"
//               >
//                 <X size={16} />
//               </button>
//             </div>
//           )}

//           {/* Error Message */}
//           {errors?.[name] && (
//             <p className="text-red-500 text-sm">{errors[name]?.message}</p>
//           )}
//         </div>
//       )}
//     />
//   );
// };

// export default ImageUploadField;

import React from 'react';
import { Controller } from 'react-hook-form';
import { X, Upload } from 'lucide-react';

const ImageUploadField = ({
  name,
  control,
  label = 'Upload Image',
  rules,
  errors,
  helperText,
  defaultPreview = null,
  maxWidth = 100,
  maxHeight = 100,
  handleFileInputChangeBanner,
  handleFileInputReset,
  isUploading,
  imgSrc,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultPreview || ''}
      render={({ field: { onChange, value } }) => (
        <div className="space-y-3">
          {/* Upload Button */}
          {!imgSrc && (
            <label
              className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed ${
                errors?.[name] ? 'border-red-500' : 'border-gray-300'
              } rounded-lg cursor-pointer hover:border-blue-400 transition ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <input
                name={name}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  onChange(e.target.files[0] || null); // Update form state with file
                  handleFileInputChangeBanner(e); // Call parent handler
                }}
                disabled={isUploading}
              />
              <Upload
                className={`w-6 h-6 ${
                  errors?.[name] ? 'text-red-500' : 'text-gray-500'
                } mb-1`}
              />
              <span
                className={`${
                  errors?.[name] ? 'text-red-500' : 'text-gray-600'
                } text-sm`}
              >
                {isUploading ? 'Uploading...' : label}
              </span>
            </label>
          )}

          {/* Preview Section */}
          {imgSrc && (
            <div className="relative w-fit">
              <img
                src={imgSrc}
                alt="Preview"
                className="rounded-lg shadow object-contain transition"
                style={{
                  maxWidth: maxWidth,
                  maxHeight: maxHeight,
                }}
                onError={(e) => {
                  console.error('Image failed to load:', imgSrc);
                  e.currentTarget.src = 'https://avatar.iran.liara.run/public/38';
                  handleFileInputReset(); // Reset on error
                  onChange(''); // Clear form state
                }}
              />
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => {
                  handleFileInputReset(); // Call parent reset
                  onChange(''); // Clear form state
                }}
                className="absolute top-2 right-2 bg-white rounded-full shadow p-1 hover:bg-red-500 hover:text-white transition"
                disabled={isUploading}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Helper Text and Error Message */}
          {errors?.[name] && (
            <p className="text-red-500 text-sm">{errors[name]?.message}</p>
          )}
          {!errors?.[name] && helperText && (
            <p className="text-gray-500 text-sm">{helperText}</p>
          )}
        </div>
      )}
    />
  );
};

export default ImageUploadField;