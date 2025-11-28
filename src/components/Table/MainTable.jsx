import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCcw, Download, Calendar, Search } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender
} from '@tanstack/react-table';

// Debounced input component
const DebouncedInput = ({ value: initialValue, onChange, onSearch, debounce = 300, placeholder = "Search..." }) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => setValue(initialValue), [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);
    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  const handleSearch = () => onSearch && onSearch(value);

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
      <button type="button" className="absolute right-3 text-gray-500 hover:text-[#6232FF]" onClick={handleSearch}>
        <Search size={20} />
      </button>
    </div>
  );
};

function MainTable({
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
  onFilterByRange,
  activeDateRange = { startDate: null, endDate: null },
  activeStatusFilter = 'success',
  onFilterChange
}) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [selectedGoTo, setSelectedGoTo] = useState(pagination.pageIndex + 1);
  const [globalFilter, setGlobalFilter] = useState('');
  const dropdownRef = useRef(null);
  const [showDateRangeInputs, setShowDateRangeInputs] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: activeDateRange.startDate ? new Date(activeDateRange.startDate).toISOString().split('T')[0] : '',
    endDate: activeDateRange.endDate ? new Date(activeDateRange.endDate).toISOString().split('T')[0] : ''
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination
    },
    pageCount: Math.ceil(totalDataCount / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true
  });

  useEffect(() => {
    onPageChange && onPageChange({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize });
  }, [pagination, onPageChange]);

  useEffect(() => {
    onSearch && onSearch(globalFilter);
  }, [globalFilter, onSearch]);

  const handleGoToChange = (e) => {
    const page = Number(e.target.value);
    setSelectedGoTo(page);
    setPagination(prev => ({ ...prev, pageIndex: page - 1 }));
  };

  const handleDateRangeApply = () => {
    const { startDate, endDate } = dateRangeFilter;
    if (!startDate || !endDate) return alert("Please select both start and end date");

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start > end) return alert("Start date cannot be after end date");
    if (end > today) return alert("End date cannot be in the future");

    onFilterByRange && onFilterByRange({ startDate, endDate });
    setShowDateRangeInputs(false);
  };

  const formatDateDisplay = date => date ? new Date(date).toLocaleDateString() : 'N/A';
  const dateRangeDisplay = activeDateRange.startDate && activeDateRange.endDate
    ? `${formatDateDisplay(activeDateRange.startDate)} - ${formatDateDisplay(activeDateRange.endDate)}`
    : 'Filter';

  const pageOptions = Array.from({ length: Math.ceil(totalDataCount / pagination.pageSize) }, (_, index) => ({
    value: index + 1,
    label: `Page ${index + 1}`,
  }));

  // Skeleton Loader
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {columns.map((_, index) => (
        <td key={index} className="px-3 py-4 border-b border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="p-3 md:p-4 md:pb-2 md:pt-2 bg-gray-50 rounded-lg shadow-sm pt-0 pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-1">
        <h1 className="text-lg md:text-lg font-semibold text-gray-800">{title}</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <span className="text-gray-600 text-sm">{totalDataCount} entries</span>

          {/* Status Filter */}
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
              </select>
            </div>
          )}

          {/* Date Range Filter */}
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
              >
                <Calendar size={14} />
                {dateRangeDisplay}
              </button>

              {showDateRangeInputs && (
                <div className="absolute right-0 mt-2 z-20 p-3 flex flex-col gap-2 bg-white border border-gray-300 rounded-lg shadow-lg w-64">
                  <label className="text-xs font-medium text-gray-600">Start Date</label>
                  <input
                    type="date"
                    value={dateRangeFilter.startDate}
                    onChange={(e) => setDateRangeFilter(prev => ({ ...prev, startDate: e.target.value }))}
                    className="p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                  <label className="text-xs font-medium text-gray-600">End Date</label>
                  <input
                    type="date"
                    value={dateRangeFilter.endDate}
                    onChange={(e) => setDateRangeFilter(prev => ({ ...prev, endDate: e.target.value }))}
                    className="p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                  <button
                    onClick={handleDateRangeApply}
                    className="mt-2 w-full px-2 py-1 bg-purple-600 text-white rounded-md text-xs font-medium hover:bg-purple-700 transition"
                  >
                    Apply Filter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Today/Yesterday Filter */}
          {onFilterByDate && (
            <div className="flex gap-2">
              {['today', 'yesterday'].map((type) => (
                <button
                  key={type}
                  onClick={() => onFilterByDate(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition ${activeFilter === type
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-400'
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Refresh */}
          {onRefresh && (
            <button className="p-2 rounded-md hover:bg-gray-300 transition" onClick={onRefresh} title='Refresh'>
              <RefreshCcw size={16} />
            </button>
          )}

          {/* Export */}
          {onExport && (
            <button className="p-2 rounded-md hover:bg-gray-300 transition" onClick={onExport} title='Export Data'>
              <Download size={16} />
            </button>
          )}

          {/* Search */}
          <DebouncedInput value={globalFilter} onChange={setGlobalFilter} onSearch={(v) => onSearch && onSearch(v)} placeholder="Search..." />

          {/* Create */}
          {onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-4 py-[6px] bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg shadow-md hover:from-purple-700 hover:to-purple-800 hover:shadow-lg transition-all duration-300"
            >
              {createLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <thead className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wide border-b border-gray-200">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="px-4 py-3 text-left cursor-pointer select-none hover:bg-gray-200 transition-colors duration-200">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="text-gray-700 text-sm">
          {loading ? Array.from({ length: pagination.pageSize }).map((_, idx) => <SkeletonRow key={idx} />)
            : table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-6 text-gray-500 italic">No data available</td></tr>
            ) : table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-purple-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 border-b border-gray-200 text-sm whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-1 p-1 bg-white border-gray-200 rounded-lg shadow-sm">
        <span className="text-gray-600 text-sm">
          Showing {totalDataCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1} to {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalDataCount)} of {totalDataCount} entries
        </span>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Go to:</span>
            <select value={selectedGoTo} onChange={handleGoToChange} className="p-2 border border-gray-300 rounded-lg text-sm">
              {pageOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainTable;
