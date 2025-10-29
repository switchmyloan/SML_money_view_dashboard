import React, { useState, useMemo } from "react";
import { Controller } from "react-hook-form";
import Select from "react-select";

const ValidatedSearchableSelectField = ({
  name,
  control,
  rules,
  label,
  options = [],
  errors,
  setGlobalFilter,
  isLoading = false,
  onChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  // 🔎 Handle search text
  const handleSearchChange = (newValue) => {
    setSearchQuery(newValue);
    if (setGlobalFilter) setGlobalFilter(newValue);
  };

  // ✅ Ensure selected option remains available even if not in options
  const mergedOptions = useMemo(() => {
    if (selectedOption && !options.some((opt) => opt.value === selectedOption.value)) {
      return [...options, selectedOption];
    }
    return options;
  }, [options, selectedOption]);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
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
            options={mergedOptions}
            value={mergedOptions.find((opt) => opt.value === field.value) || null}
            onChange={(selected) => {
              setSelectedOption(selected);
              field.onChange(selected ? selected.value : null);
              if (onChange) onChange(selected);
            }}
            placeholder="Select..."
            isLoading={isLoading}
            isClearable
            noOptionsMessage={() => "No options found"}
            classNamePrefix="react-select"
            className={`react-select-container ${
              errors[name] ? "border-red-500 focus:border-red-500" : "border-gray-300"
            }`}
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: "38px",
                borderRadius: "0.5rem",
                borderColor: errors[name]
                  ? "rgb(239 68 68)" // red-500
                  : state.isFocused
                  ? "rgb(59 130 246)" // blue-500
                  : "rgb(209 213 219)", // gray-300
                boxShadow: "none",
                "&:hover": {
                  borderColor: errors[name]
                    ? "rgb(239 68 68)"
                    : "rgb(59 130 246)",
                },
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
        )}
      />

      {errors[name] && (
        <p className="mt-1 text-xs text-red-500">{errors[name]?.message}</p>
      )}
    </div>
  );
};

export default ValidatedSearchableSelectField;
