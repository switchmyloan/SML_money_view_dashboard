import { Search } from "lucide-react";

const DebouncedInput = ({ value: initialValue, onChange, onSearch, debounce = 1000,placeholder = "Search...", ...props }) => {
  // States
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);
  const mode  = "light"
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, debounce, onChange]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(value);
    }
    // console.log("Current Search Value:", value);
  };

  useEffect(() => {
    // console.log(value, "sdad")
    if (value !== '' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [value]);

  return (
    <div className="relative flex items-center">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-gray-300 px-5 py-2.5 pr-12 text-sm text-gray-700 placeholder-gray-400 focus:border-[#6232FF] focus:ring-1 focus:ring-[#6232FF] outline-none transition"
      />
      <button
        type="button"
        className="absolute right-3 text-gray-500 hover:text-[#6232FF] transition"
      >
        <Search size={20} />
      </button>
    </div>
  );
};


import React, { useEffect, useRef, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCcw, Download, Calendar } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

function DataTable({
  columns,
  data,
  onCreate,
  createLabel = 'Create',
  onRefresh,
  totalDataCount,
  onPageChange,
  onSearch, 
  title = "Page",
  loading = false,
  onExport,
  onFilterByDate,
  activeFilter,
  // PROPS FOR DATE RANGE FILTER
  onFilterByRange,
  activeDateRange = { startDate: null, endDate: null },
  activeStatusFilter = 'success',
  onFilterChange,
}) {
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [selectedGoTo, setSelectedGoTo] = React.useState(pagination.pageIndex + 1);
  const dropdownRef = useRef(null); 
  const [showDateRangeInputs, setShowDateRangeInputs] = React.useState(false);

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  };

  const [dateRangeFilter, setDateRangeFilter] = React.useState({
    startDate: formatDateForInput(activeDateRange.startDate),
    endDate: formatDateForInput(activeDateRange.endDate),
  });

  useEffect(() => {
    setDateRangeFilter({
      startDate: formatDateForInput(activeDateRange.startDate),
      endDate: formatDateForInput(activeDateRange.endDate),
    });
    if (!activeDateRange.startDate && !activeDateRange.endDate && showDateRangeInputs) {
      // setShowDateRangeInputs(false); // Commenting out might cause flicker, but keeping it ensures state consistency
    }
  }, [activeDateRange.startDate, activeDateRange.endDate]); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDateRangeInputs(false);
      }
    };

    if (showDateRangeInputs) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDateRangeInputs]);


  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalDataCount / pagination.pageSize),
  });

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalDataCount: totalDataCount || 0
    }));
  }, [totalDataCount]);

  useEffect(() => {
    onPageChange(pagination);
  }, [pagination, onPageChange])

  useEffect(() => {
    if (onSearch) {
      onSearch(globalFilter);
    }
  }, [globalFilter, onSearch]);

  useEffect(() => setSelectedGoTo(pagination.pageIndex + 1), [pagination.pageIndex]);

  const handleGoToChange = (e) => {
    const page = Number(e.target.value);
    setSelectedGoTo(page);
    setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
  };

  const handleDateRangeApply = () => {
    const { startDate, endDate } = dateRangeFilter;

    if (!startDate || !endDate) {
      alert("Please select both a start date and an end date.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1. Basic Validation: Start Date vs End Date
    if (start > end) {
      alert("Start date cannot be after end date.");
      return;
    }

    // 🛑 NEW/FIXED VALIDATION: Check for Future Date
    const today = new Date();

    // Set both today and the selected end date to midnight for a pure date-only comparison
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Now, if the selected end date is strictly greater than today, it means it's a future day.
    if (end > today) {
      alert("End Date cannot be a future date.");
      return;
    }
    // 🛑 END FIXED VALIDATION

    if (onFilterByRange) {
      onFilterByRange(dateRangeFilter);
      setShowDateRangeInputs(false);
    }
  };

  // Helper to format the active date range display
  const formatDateDisplay = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';
  const dateRangeDisplay = activeDateRange.startDate && activeDateRange.endDate
    ? `${formatDateDisplay(activeDateRange.startDate)} - ${formatDateDisplay(activeDateRange.endDate)}`
    : 'Filter';


  const pageOptions = Array.from({ length: Math.ceil(totalDataCount / table.getState().pagination.pageSize) }, (_, index) => ({
    value: index + 1,
    label: `Page ${index + 1}`,
  }));

  // Skeleton Loader Component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {columns.map((_, index) => (
        <td key={index} className="px-3 py-4 border-b border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
  
  const handleSearch = (value) => {
    setGlobalFilter(value);
  };

  return (
    <div className="p-3 md:p-4 md:pb-2 md:pt-2 bg-gray-50 rounded-lg shadow-sm  pt-0 pb-0 ">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-1">
        <h1 className="text-lg md:text-lg font-semibold text-gray-800">{title}</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <span className="text-gray-600 text-sm">
            {totalDataCount} entries
          </span>

          {onFilterChange && (
            <div className="z-20 flex flex-col w-38">
              <select
                onChange={(e) => onFilterChange(e.target.value)}
                value={activeStatusFilter}
                className="p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
              >
                <option value="">All Status</option>
                <option value="success">✅ Success</option>
                <option value="Lead has been rejected.">❌ Rejected</option>
                <option value="duplicate user (dedupe)">🔁 Duplicate</option>
                <option value="invalid data to get offer for lead">⚠️ Invalid Data</option>
              </select>
            </div>

          )}

          {/* DATE RANGE FILTER UI (FIXED) */}
          {onFilterByRange && (
            <div className="relative inline-block" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDateRangeInputs(!showDateRangeInputs);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border transition ${activeDateRange.startDate
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-400'
                  } disabled:opacity-50`}
                disabled={loading}
              >
                <Calendar size={14} />
                {dateRangeDisplay}
              </button>

              {/* Date Inputs Dropdown */}
              {showDateRangeInputs && (
                <div className="absolute right-0 mt-2 z-20 p-3 flex flex-col gap-2 bg-white border border-gray-300 rounded-lg shadow-lg w-64">
                  <label className="text-xs font-medium text-gray-600">Start Date</label>
                  <input
                    type="date"
                    value={dateRangeFilter.startDate}
                    onChange={(e) => setDateRangeFilter(prev => ({ ...prev, startDate: e.target.value }))}
                    className="p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                    placeholder="Start Date"
                    disabled={loading}
                  />
                  <label className="text-xs font-medium text-gray-600">End Date</label>
                  <input
                    type="date"
                    value={dateRangeFilter.endDate}
                    onChange={(e) => setDateRangeFilter(prev => ({ ...prev, endDate: e.target.value }))}
                    className="p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                    placeholder="End Date"
                    disabled={loading}
                  />
                  <button
                    onClick={handleDateRangeApply}
                    className="mt-2 w-full px-2 py-1 bg-purple-600 text-white rounded-md text-xs font-medium hover:bg-purple-700 transition disabled:opacity-50"
                    disabled={loading || !dateRangeFilter.startDate || !dateRangeFilter.endDate}
                  >
                    Apply Filter
                  </button>

                  {/* Clear Button */}
                  {(activeDateRange.startDate || activeDateRange.endDate) && (
                    <button
                      onClick={() => {
                        setDateRangeFilter({ startDate: '', endDate: '' });
                        onFilterByRange({ startDate: null, endDate: null }); // Clear filter in parent
                        setShowDateRangeInputs(false); // Close dropdown
                      }}
                      className="w-full text-xs text-red-500 hover:text-red-700 mt-1"
                      disabled={loading}
                    >
                      Clear Current Range
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TODAY / YESTERDAY BUTTONS */}
          {onFilterByDate && (
            <div className="flex gap-2">
              {['today', 'yesterday'].map((type) => (
                <button
                  key={type}
                  onClick={() => onFilterByDate(type)}
                  disabled={loading}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition
          ${activeFilter === type
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-400'
                    } disabled:opacity-50`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          )}

          <div className="relative group inline-block">
            <button className="p-2 rounded-md hover:bg-gray-300 transition" onClick={() => onRefresh()} title='Refresh'>
              <RefreshCcw size={16} />
            </button>
          </div>

          {/* EXPORT Button */}
          {onExport && (
            <div className="relative group inline-block cursor-pointer">
              <button
                className="p-2 rounded-md hover:bg-gray-300 transition cursor-pointer"
                onClick={onExport}
                title='Export Data'
              >
                <Download size={16} />
              </button>
            </div>
          )}
           <DebouncedInput
              value={globalFilter}
              onChange={setGlobalFilter}
              onSearch={handleSearch}
              placeholder="Search..."
            />
          {!onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-4 py-[6px] bg-gradient-to-r 
             from-purple-600 to-purple-700 text-white font-medium 
             rounded-lg shadow-md hover:from-purple-700 hover:to-purple-800 
             hover:shadow-lg transition-all duration-300"
              disabled={loading}
            >
              {createLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden" >
        <thead className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wide border-b border-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="px-4 py-3 text-left cursor-pointer select-none hover:bg-gray-200 transition-colors duration-200"
                >
                  <div className="flex items-center gap-1 truncate">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <span className="text-gray-500">
                      {{
                        asc: '↑',
                        desc: '↓',
                      }[header.column.getIsSorted()] ?? null}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="text-gray-700 text-sm">
          {
            loading ? (
              // Render skeleton rows when loading
              Array.from({ length: pagination.pageSize }).map((_, idx) => (
                <SkeletonRow key={idx} />
              ))
            ) :
              table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className="text-center py-6 text-gray-500 italic">
                    No data available
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`transition-colors duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-purple-50`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 border-b border-gray-200 text-sm whitespace-nowrap"
                      >

                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-1 p-1 bg-white border-gray-200 rounded-lg shadow-sm ">
        <span className="text-gray-600 text-sm">
          Showing {totalDataCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1} to{' '}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalDataCount)} of {totalDataCount} entries
        </span>

        <div className="flex flex-wrap items-center gap-3">
          {/* Go to page */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Go to:</span>
            <select
              value={selectedGoTo}
              onChange={handleGoToChange}
              className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            >
              {pageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center justify-center p-2 border border-gray-300 rounded-lg 
             bg-white hover:bg-purple-50 hover:text-purple-700 
             disabled:opacity-50 disabled:cursor-not-allowed 
             transition-all duration-200"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center justify-center p-2 border border-gray-300 rounded-lg 
             bg-white hover:bg-purple-50 hover:text-purple-700 
             disabled:opacity-50 disabled:cursor-not-allowed 
             transition-all duration-200"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-gray-700 text-sm px-2">{pagination.pageIndex + 1} of {table.getPageCount()}</span>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={!table.getCanNextPage()}
              className="flex items-center justify-center p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: table.getPageCount() - 1 }))}
              disabled={!table.getCanNextPage()}
              className="flex items-center justify-center p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTable;