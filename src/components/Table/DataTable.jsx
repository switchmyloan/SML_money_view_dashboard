import React, { useEffect, useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCcw, Download } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
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
  title = "Page",
  loading = false,
  onExport

}) {
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [selectedGoTo, setSelectedGoTo] = React.useState(pagination.pageIndex + 1);
  const prevPaginationRef = useRef(pagination);

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

  // useEffect(() => {
  //   if (
  //     pagination.pageIndex !== prevPaginationRef.current.pageIndex ||
  //     pagination.pageSize !== prevPaginationRef.current.pageSize
  //   ) {
  //     table.setPageIndex(pagination.pageIndex);
  //     onPageChange(pagination);
  //     prevPaginationRef.current = pagination;
  //   }
  // }, [pagination, onPageChange, table]);
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalDataCount: totalDataCount || 0 // Ensure total data count is up-to-date
    }));
  }, [totalDataCount]);

  useEffect(() => {
    console.log(data, "data")
    // console.log(pagination, "pagination")
    onPageChange(pagination);
  }, [pagination])

  useEffect(() => setSelectedGoTo(pagination.pageIndex + 1), [pagination.pageIndex]);

  const handleGoToChange = (e) => {
    const page = Number(e.target.value);
    setSelectedGoTo(page);
    setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
  };

  // const pageOptions = Array.from(
  //   { length: Math.ceil(totalDataCount / pagination.pageSize) },
  //   (_, index) => ({ value: index + 1, label: `Page ${index + 1}` })
  // );

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

  return (
    <div className="p-3 md:p-4 md:pb-2 md:pt-2 bg-gray-50 rounded-lg shadow-sm  pt-0 pb-0 ">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-1">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">{title}</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">

          <div className="relative group inline-block">
            <button className="p-2 rounded-md hover:bg-gray-300 transition" onClick={() => onRefresh()} title='Refresh'>
              <RefreshCcw size={16} />
            </button>


            {/* <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-2 text-sm text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Refresh

              <span className="absolute left-full top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
            </span> */}
          </div>

          {/* NEW: EXPORT Button (Tooltip is also left-aligned) */}
          {onExport && (
            <div className="relative group inline-block cursor-pointer">
              <button
                className="p-2 rounded-md hover:bg-gray-300 transition cursor-pointer"
                onClick={onExport}
                title='Export Data'
                // disabled={loading || totalDataCount == 0} 
              >
                <Download size={16} />
              </button>
            </div>
          )}

          <input
            type="text"
            placeholder="Search..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full sm:w-52 p-2 border border-gray-300 rounded-lg 
             focus:outline-none focus:ring-2 focus:ring-purple-400 
             transition-all duration-200 shadow-sm text-sm"
            disabled={loading}
          />
          {onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-4 py-[6px] bg-gradient-to-r 
             from-purple-600 to-purple-700 text-white font-medium 
             rounded-lg shadow-md hover:from-purple-700 hover:to-purple-800 
             hover:shadow-lg transition-all duration-300"
              disabled={loading}
            >
              {/* <Plus size={16} /> */}
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
                  <div className="flex items-center gap-1">
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
                      // <td key={cell.id} className="px-4 py-0 border-b border-gray-200 text-sm whitespace-nowrap">
                      <td 
  key={cell.id} 
  className="px-4 **py-3** border-b border-gray-200 text-sm whitespace-nowrap"
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-1 p-1 bg-white border-gray-200 rounded-lg shadow-sm">
        <span className="text-gray-600 text-sm">
          Showing {totalDataCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1} to{' '}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalDataCount)} of {totalDataCount} entries
        </span>

        <div className="flex flex-wrap items-center gap-3">
          {/* Rows per page */}
          {/* <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Rows per page:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => setPagination({ ...pagination, pageSize: Number(e.target.value), pageIndex: 0 })}
              className="p-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div> */}

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
