'use client';

import { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';

export const Features = ({ control, setValue, name, label, rules, errors, keywords, setKeywords }) => {
  const [inputValue, setInputValue] = useState('');

  // Syncs the keywords array with the form's value for submission and validation.
  useEffect(() => {
    setValue(name, keywords.join(', '), { shouldValidate: true });
  }, [keywords, name, setValue]);

  // A helper function to add a keyword to the list.
  const addKeyword = () => {
    const keyword = inputValue.trim();
    if (keyword && !keywords.includes(keyword)) {
      const newKeywords = [...keywords, keyword];
      setKeywords(newKeywords);
      setInputValue(''); // Clear the input field after adding.
    }
  };

  // Handles adding keywords when the "Enter" key is pressed.
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevents form submission.
      addKeyword();
    }
  };

  // Removes a keyword from the list.
  const handleDelete = (keyword) => {
    const newKeywords = keywords.filter((kw) => kw !== keyword);
    setKeywords(newKeywords);
  };

  return (
    <div className="w-full">
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field }) => (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            
            {/* The new container for the input and button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type and click Add"
                className={`flex-grow rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 
                  ${errors[name] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-400'}`}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                value={inputValue}
              />
              <button
                type="button"
                onClick={addKeyword}
                className="btn btn-primary min-w-max"
              >
                Add
              </button>
            </div>

            {errors[name] && (
              <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 text-sm px-3 py-1"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleDelete(keyword)}
                    className="ml-2 text-indigo-500 hover:text-red-500 focus:outline-none"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </>
        )}
      />
    </div>
  );
};