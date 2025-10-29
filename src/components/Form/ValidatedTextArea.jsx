import React from "react";
import { Controller } from "react-hook-form";

const ValidatedTextArea = ({
  name,
  control,
  rules,
  label,
  placeholder,
  errors,
  helperText,
  disable = false,
  rows = 4,
  required = false
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block mb-1 text-sm font-medium text-gray-900"
        >
          {label}{" "}
           {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <textarea
            {...field}
            id={name}
            rows={rows}
            disabled={disable}
            placeholder={placeholder}
            className={`w-full px-3 py-2 text-sm rounded-lg border outline-none 
              ${errors[name] 
                ? "border-red-500 focus:ring-red-500" 
                : "border-gray-300 focus:ring-blue-500"} 
              focus:ring-2 focus:border-transparent`}
          />
        )}
      />

      {(errors[name] || helperText) && (
        <p className="mt-1 text-xs text-red-500">
          {errors[name]?.message || helperText}
        </p>
      )}
    </div>
  );
};

export default ValidatedTextArea;
