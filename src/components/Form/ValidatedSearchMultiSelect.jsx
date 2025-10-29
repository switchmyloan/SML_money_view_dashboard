import React, { useState } from "react";
import { Controller } from "react-hook-form";
import Select from "react-select";

const ValidatedSearchMultiSelect = ({
  name,
  control,
  rules,
  label,
  options = [],
  errors,
  setGlobalFilter,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // 🔎 Search handling
  const handleSearchChange = (newValue) => {
    setSearchQuery(newValue);
    if (setGlobalFilter) setGlobalFilter(newValue);
  };

  const isError = !!errors[name];

  // ✅ "Select All" option ko prepend kiya
  const enhancedOptions = [
    { label: "Select All", value: "select-all" },
    ...options.map((option) => ({
      label: option.label,
      value: option.value,
    })),
  ];

  // 🔄 Handle multi-selection with "Select All"
  const handleChange = (selectedOptions, field) => {
    const selectedValues = Array.isArray(selectedOptions)
      ? selectedOptions.map((opt) => opt.value)
      : selectedOptions
      ? [selectedOptions.value]
      : [];

    if (selectedValues.includes("select-all")) {
      const allValues = options.map((opt) => opt.value);
      field.onChange(allValues);
      return;
    }

    field.onChange(selectedValues);
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <Select
            {...field}
            inputValue={searchQuery}
            onInputChange={handleSearchChange}
            options={enhancedOptions}
            value={enhancedOptions.filter((opt) =>
              field.value?.includes(opt.value)
            )}
            onChange={(selectedOptions) => handleChange(selectedOptions, field)}
            placeholder="Select options..."
            isLoading={isLoading}
            isClearable
            noOptionsMessage={() => "No options"}
            isMulti
            classNamePrefix="react-select"
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: "38px",
                borderRadius: "0.5rem",
                borderColor: isError
                  ? "rgb(239 68 68)" // red-500
                  : state.isFocused
                  ? "rgb(59 130 246)" // blue-500
                  : "rgb(209 213 219)", // gray-300
                boxShadow: "none",
                "&:hover": {
                  borderColor: isError
                    ? "rgb(239 68 68)"
                    : "rgb(59 130 246)",
                },
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? "rgb(229 231 235)" // gray-200
                  : state.isFocused
                  ? "rgb(243 244 246)" // gray-100
                  : "transparent",
                color: "#111827", // gray-900
                cursor: "pointer",
              }),
            }}
          />
        )}
      />

      {isError && (
        <p className="mt-1 text-xs text-red-500">{errors[name]?.message}</p>
      )}
    </div>
  );
};

export default ValidatedSearchMultiSelect;
