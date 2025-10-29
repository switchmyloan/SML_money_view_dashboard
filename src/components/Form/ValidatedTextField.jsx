import React from 'react';
import { Controller } from 'react-hook-form';

const ValidatedTextField = ({
  name,
  control,
  rules,
  label,
  placeholder,
  errors,
  helperText,
  disable = false,
  value,
  type = "text",
  required = false
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}{" "}
           {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <input
            {...field}
            id={name}
            type={name === 'user_password' ? 'password' : type}
            placeholder={placeholder}
            disabled={disable}
            value={value ?? field.value}
            className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none 
              ${errors[name]
                ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
        )}
      />

      {errors[name] && (
        <p className="mt-1 text-xs text-red-500">
          {errors[name]?.message || helperText}
        </p>
      )}
    </div>
  );
};

export default ValidatedTextField;
