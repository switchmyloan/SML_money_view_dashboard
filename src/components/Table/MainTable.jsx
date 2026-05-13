import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCcw, Download, Calendar, Search, Cake, IndianRupee, X } from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender
} from '@tanstack/react-table';

// Searchable single-select dropdown — used where the option list can be long
// (e.g. thousands of pincodes) and a native <select> is impractical.
// Keeps the trigger button styled like the other filter buttons so it fits
// in the same toolbar row.
const SearchableSelect = ({ options, value, onChange, placeholder, isOpen, onToggle, onClose }) => {
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                onClose && onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    useEffect(() => { if (!isOpen) setSearch(''); }, [isOpen]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return options;
        return options.filter(o => String(o).toLowerCase().includes(q));
    }, [options, search]);

    return (
        <div ref={containerRef} className="relative inline-block">
            <button
                type="button"
                onClick={onToggle}
                className={`flex items-center justify-between gap-2 px-3 py-1.5 text-sm rounded border min-w-[160px] transition ${
                    value
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-400'
                }`}
            >
                <span className="truncate">{value || placeholder}</span>
                <ChevronRight size={12} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute left-0 mt-2 z-30 bg-white border border-gray-300 rounded-lg shadow-lg w-64">
                    <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                autoFocus
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search…"
                                className="w-full pl-7 pr-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-400"
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => { onChange(''); onClose && onClose(); }}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-purple-50 ${!value ? 'bg-purple-100 font-medium' : ''}`}
                        >
                            {placeholder}
                        </button>
                        {filtered.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-400 italic">No matches</div>
                        ) : (
                            filtered.map((opt, idx) => (
                                <button
                                    key={`${opt}-${idx}`}
                                    type="button"
                                    onClick={() => { onChange(opt); onClose && onClose(); }}
                                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-purple-50 ${value === opt ? 'bg-purple-100 font-medium' : ''}`}
                                >
                                    {opt}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

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
    onFilterChange,
    onLoanAmountFilter,
    onLoanAmountClear,
    activeLoanAmount = { min: '', max: '' },
    onLenderFilter,
    activeLenderFilter = '',
    lenderOptions = [],
    onStatusFilter,
    statusOptions = [],
    // DOB range filter (offer-leads only)
    onDobRangeFilter,
    activeDobRange = { startDate: null, endDate: null },
    // Loan purpose filter (offer-leads only)
    onLoanPurposeFilter,
    activeLoanPurpose = '',
    loanPurposeOptions = [],
    // Monthly income / salary range filter (offer-leads, kb-lending, draft-leads)
    onMonthlyIncomeFilter,
    onMonthlyIncomeClear,
    activeMonthlyIncome = { min: '', max: '' },
    monthlyIncomeLabel = 'Income', // button label - "Income" or "Salary"
    // Profession filter (kb-lending, draft-leads)
    onProfessionFilter,
    activeProfession = '',
    professionOptions = [],
    // City/Pincode filter (offer-leads)
    onPincodeFilter,
    activePincode = '',
    pincodeOptions = [],
    // Employment type filter (offer-leads)
    onEmploymentTypeFilter,
    activeEmploymentType = '',
    employmentTypeOptions = [],
    // Clear all filters at once (opt-in)
    onClearAllFilters,
}) {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [selectedGoTo, setSelectedGoTo] = useState(pagination.pageIndex + 1);
    const [globalFilter, setGlobalFilter] = useState('');

    // Single popover state - only one filter open at a time
    // Possible values: null | 'dateRange' | 'loanAmount' | 'dob' | 'income'
    const [openFilter, setOpenFilter] = useState(null);
    const filterContainerRef = useRef(null);

    const toggleFilter = (name) => (e) => {
        e.stopPropagation();
        setOpenFilter(prev => (prev === name ? null : name));
    };

    // Close any open popover when clicking outside the filter container
    useEffect(() => {
        if (!openFilter) return;
        const handleClickOutside = (event) => {
            if (filterContainerRef.current && !filterContainerRef.current.contains(event.target)) {
                setOpenFilter(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openFilter]);

    const [dateRangeFilter, setDateRangeFilter] = useState({
        startDate: activeDateRange.startDate ? new Date(activeDateRange.startDate).toISOString().split('T')[0] : '',
        endDate: activeDateRange.endDate ? new Date(activeDateRange.endDate).toISOString().split('T')[0] : ''
    });
    const [loanAmountFilter, setLoanAmountFilter] = useState({ min: activeLoanAmount.min || '', max: activeLoanAmount.max || '' });

    // DOB range filter state
    const [dobRangeFilter, setDobRangeFilter] = useState({
        startDate: activeDobRange.startDate ? new Date(activeDobRange.startDate).toISOString().split('T')[0] : '',
        endDate: activeDobRange.endDate ? new Date(activeDobRange.endDate).toISOString().split('T')[0] : ''
    });

    // Monthly income range filter state
    const [monthlyIncomeFilter, setMonthlyIncomeFilter] = useState({ min: activeMonthlyIncome.min || '', max: activeMonthlyIncome.max || '' });

    // Check if any filter is currently active (used to show Clear All button)
    const hasActiveFilters = !!(
        activeFilter ||
        (activeDateRange.startDate || activeDateRange.endDate) ||
        (activeLoanAmount.min || activeLoanAmount.max) ||
        (activeDobRange.startDate || activeDobRange.endDate) ||
        (activeMonthlyIncome.min || activeMonthlyIncome.max) ||
        activeLenderFilter ||
        activeLoanPurpose ||
        activeProfession ||
        activePincode ||
        activeEmploymentType ||
        (activeStatusFilter && activeStatusFilter !== 'success')
    );

    // Quick range presets
    const LOAN_AMOUNT_PRESETS = [
        { label: '< 50K', min: '', max: '50000' },
        { label: '50K-1L', min: '50000', max: '100000' },
        { label: '1L-3L', min: '100000', max: '300000' },
        { label: '3L-5L', min: '300000', max: '500000' },
        { label: '5L+', min: '500000', max: '' },
    ];

    const MONTHLY_INCOME_PRESETS = [
        { label: '< 25K', min: '', max: '25000' },
        { label: '25K-50K', min: '25000', max: '50000' },
        { label: '50K-1L', min: '50000', max: '100000' },
        { label: '1L-2L', min: '100000', max: '200000' },
        { label: '2L+', min: '200000', max: '' },
    ];

    // Convert age range -> dob date range (today - maxAge to today - minAge)
    const computeDobFromAgeRange = (minAge, maxAge) => {
        const today = new Date();
        const toDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
        const fromDate = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate() + 1);
        const fmt = (d) => d.toISOString().split('T')[0];
        return { startDate: fmt(fromDate), endDate: fmt(toDate) };
    };

    const DOB_AGE_PRESETS = [
        { label: '18-24', minAge: 18, maxAge: 24 },
        { label: '25-34', minAge: 25, maxAge: 34 },
        { label: '35-44', minAge: 35, maxAge: 44 },
        { label: '45-54', minAge: 45, maxAge: 54 },
        { label: '55+', minAge: 55, maxAge: 100 },
    ];

    const handleDobRangeApply = () => {
        const { startDate, endDate } = dobRangeFilter;
        if (!startDate && !endDate) return;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start > end) return alert("Start date cannot be after end date");
        }
        onDobRangeFilter && onDobRangeFilter({ startDate, endDate });
        setOpenFilter(null);
    };

    const handleDobRangeClear = () => {
        setDobRangeFilter({ startDate: '', endDate: '' });
        onDobRangeFilter && onDobRangeFilter({ startDate: '', endDate: '' });
        setOpenFilter(null);
    };

    const applyDobAgePreset = (preset) => {
        const { startDate, endDate } = computeDobFromAgeRange(preset.minAge, preset.maxAge);
        setDobRangeFilter({ startDate, endDate });
        onDobRangeFilter && onDobRangeFilter({ startDate, endDate });
        setOpenFilter(null);
    };

    const handleMonthlyIncomeApply = () => {
        const { min, max } = monthlyIncomeFilter;
        if (!min && !max) return;
        if (min && max && Number(min) > Number(max)) return alert("Min income cannot be greater than max income");
        onMonthlyIncomeFilter && onMonthlyIncomeFilter({ min, max });
        setOpenFilter(null);
    };

    const handleMonthlyIncomeClear = () => {
        setMonthlyIncomeFilter({ min: '', max: '' });
        onMonthlyIncomeClear && onMonthlyIncomeClear();
        setOpenFilter(null);
    };

    const applyMonthlyIncomePreset = (preset) => {
        setMonthlyIncomeFilter({ min: preset.min, max: preset.max });
        onMonthlyIncomeFilter && onMonthlyIncomeFilter({ min: preset.min, max: preset.max });
        setOpenFilter(null);
    };

    const applyLoanAmountPreset = (preset) => {
        setLoanAmountFilter({ min: preset.min, max: preset.max });
        onLoanAmountFilter && onLoanAmountFilter({ min: preset.min, max: preset.max });
        setOpenFilter(null);
    };

    // Clear All - resets local popover state then calls parent's onClearAllFilters
    const handleClearAllInternal = () => {
        setDateRangeFilter({ startDate: '', endDate: '' });
        setLoanAmountFilter({ min: '', max: '' });
        setDobRangeFilter({ startDate: '', endDate: '' });
        setMonthlyIncomeFilter({ min: '', max: '' });
        setGlobalFilter('');
        setOpenFilter(null);
        onClearAllFilters && onClearAllFilters();
    };

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
        onPageChange(pagination);
    }, [pagination, onPageChange])

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
        setOpenFilter(null);
    };

    const handleLoanAmountApply = () => {
        const { min, max } = loanAmountFilter;
        if (!min && !max) return;
        if (min && max && Number(min) > Number(max)) return alert("Min amount cannot be greater than max amount");
        onLoanAmountFilter && onLoanAmountFilter({ min, max });
        setOpenFilter(null);
    };

    const handleLoanAmountClear = () => {
        setLoanAmountFilter({ min: '', max: '' });
        onLoanAmountClear && onLoanAmountClear();
        setOpenFilter(null);
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-2">
                <h1 className="text-lg font-semibold text-gray-800 whitespace-nowrap shrink-0">{title}</h1>
                <div ref={filterContainerRef} className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end">
                    <span className="text-gray-600 text-sm whitespace-nowrap shrink-0">{totalDataCount} entries</span>

                    {/* Clear All Filters */}
                    {onClearAllFilters && hasActiveFilters && (
                        <button
                            onClick={handleClearAllInternal}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition whitespace-nowrap shrink-0"
                            title="Clear all active filters"
                        >
                            <X size={14} />
                            Clear All
                        </button>
                    )}

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
                                <option value="rejected">❌ Rejected</option>
                                <option value="dedupted">🔁 Duplicate</option>
                                <option value="error">❌ Error</option>
                            </select>
                        </div>
                    )}

                    {/* Free-text Status Filter (dynamic options from data) */}
                    {onStatusFilter && statusOptions.length > 0 && (
                        <div className="z-20 flex flex-col w-44">
                            <select
                                onChange={(e) => onStatusFilter(e.target.value)}
                                value={activeStatusFilter}
                                className="p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                            >
                                <option value="">All Statuses</option>
                                {statusOptions.map((s, idx) => (
                                    <option key={idx} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Lender Filter */}
                    {onLenderFilter && lenderOptions.length > 0 && (
                        <div className="z-20 flex flex-col w-44">
                            <select
                                onChange={(e) => onLenderFilter(e.target.value)}
                                value={activeLenderFilter}
                                className="p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                            >
                                <option value="">All Lenders</option>
                                {lenderOptions.map((lender, idx) => (
                                    <option key={idx} value={lender}>{lender}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Loan Purpose Filter */}
                    {onLoanPurposeFilter && loanPurposeOptions.length > 0 && (
                        <div className="z-20 flex flex-col w-44">
                            <select
                                onChange={(e) => onLoanPurposeFilter(e.target.value)}
                                value={activeLoanPurpose}
                                className="p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                            >
                                <option value="">All Loan Purposes</option>
                                {loanPurposeOptions.map((p, idx) => (
                                    <option key={idx} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* City / Pincode Filter — searchable combobox */}
                    {onPincodeFilter && (
                        <SearchableSelect
                            options={pincodeOptions}
                            value={activePincode}
                            onChange={onPincodeFilter}
                            placeholder="All Cities / Pincodes"
                            isOpen={openFilter === 'pincode'}
                            onToggle={toggleFilter('pincode')}
                            onClose={() => setOpenFilter(null)}
                        />
                    )}

                    {/* Employment Type Filter (offer-leads) */}
                    {onEmploymentTypeFilter && (
                        <div className="z-20 flex flex-col w-40">
                            <select
                                onChange={(e) => onEmploymentTypeFilter(e.target.value)}
                                value={activeEmploymentType}
                                className="p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                            >
                                <option value="">All Employment Types</option>
                                {employmentTypeOptions.map((t, idx) => (
                                    <option key={idx} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Profession Filter */}
                    {onProfessionFilter && professionOptions.length > 0 && (
                        <div className="z-20 flex flex-col w-40">
                            <select
                                onChange={(e) => onProfessionFilter(e.target.value)}
                                value={activeProfession}
                                className="p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                            >
                                <option value="">All Professions</option>
                                {professionOptions.map((p, idx) => (
                                    <option key={idx} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Monthly Income Range Filter */}
                    {onMonthlyIncomeFilter && (
                        <div className="relative inline-block">
                            <button
                                onClick={toggleFilter('income')}
                                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border transition ${activeMonthlyIncome.min || activeMonthlyIncome.max
                                    ? 'bg-purple-600 text-white border-purple-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-400'
                                    }`}
                            >
                                <IndianRupee size={14} />
                                {activeMonthlyIncome.min || activeMonthlyIncome.max
                                    ? `${activeMonthlyIncome.min || '0'} - ${activeMonthlyIncome.max || '∞'}`
                                    : monthlyIncomeLabel}
                            </button>

                            {openFilter === 'income' && (
                                <div className="absolute right-0 mt-2 z-30 p-3 flex flex-col gap-2 bg-white border border-gray-300 rounded-lg shadow-lg w-72">
                                    <p className="text-xs font-semibold text-gray-700">Quick Select</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {MONTHLY_INCOME_PRESETS.map(p => (
                                            <button
                                                key={p.label}
                                                onClick={() => applyMonthlyIncomePreset(p)}
                                                className="px-2 py-1 text-xs font-medium rounded-md border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 mt-1">
                                        <p className="text-xs font-semibold text-gray-700 mb-1">Custom Range</p>
                                        <label className="text-xs font-medium text-gray-600">Min {monthlyIncomeLabel}</label>
                                        <input
                                            type="number"
                                            value={monthlyIncomeFilter.min}
                                            onChange={(e) => setMonthlyIncomeFilter(prev => ({ ...prev, min: e.target.value }))}
                                            placeholder="e.g. 25000"
                                            className="w-full p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                                        />
                                        <label className="text-xs font-medium text-gray-600 mt-1 block">Max {monthlyIncomeLabel}</label>
                                        <input
                                            type="number"
                                            value={monthlyIncomeFilter.max}
                                            onChange={(e) => setMonthlyIncomeFilter(prev => ({ ...prev, max: e.target.value }))}
                                            placeholder="e.g. 200000"
                                            className="w-full p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={handleMonthlyIncomeApply}
                                            className="flex-1 px-2 py-1 bg-purple-600 text-white rounded-md text-xs font-medium hover:bg-purple-700 transition"
                                        >
                                            Apply
                                        </button>
                                        <button
                                            onClick={handleMonthlyIncomeClear}
                                            className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300 transition"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* DOB Range Filter (with age presets) */}
                    {onDobRangeFilter && (
                        <div className="relative inline-block">
                            <button
                                onClick={toggleFilter('dob')}
                                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border transition ${activeDobRange.startDate || activeDobRange.endDate
                                    ? 'bg-purple-600 text-white border-purple-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-400'
                                    }`}
                            >
                                <Cake size={14} />
                                {activeDobRange.startDate || activeDobRange.endDate ? 'Age/DOB' : 'Age/DOB'}
                            </button>

                            {openFilter === 'dob' && (
                                <div className="absolute right-0 mt-2 z-30 p-3 flex flex-col gap-2 bg-white border border-gray-300 rounded-lg shadow-lg w-72">
                                    <p className="text-xs font-semibold text-gray-700">Quick Select by Age</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {DOB_AGE_PRESETS.map(p => (
                                            <button
                                                key={p.label}
                                                onClick={() => applyDobAgePreset(p)}
                                                className="px-2 py-1 text-xs font-medium rounded-md border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 mt-1">
                                        <p className="text-xs font-semibold text-gray-700 mb-1">Custom DOB Range</p>
                                        <label className="text-xs font-medium text-gray-600">DOB From</label>
                                        <input
                                            type="date"
                                            value={dobRangeFilter.startDate}
                                            onChange={(e) => setDobRangeFilter(prev => ({ ...prev, startDate: e.target.value }))}
                                            className="w-full p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                                        />
                                        <label className="text-xs font-medium text-gray-600 mt-1 block">DOB To</label>
                                        <input
                                            type="date"
                                            value={dobRangeFilter.endDate}
                                            onChange={(e) => setDobRangeFilter(prev => ({ ...prev, endDate: e.target.value }))}
                                            className="w-full p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={handleDobRangeApply}
                                            className="flex-1 px-2 py-1 bg-purple-600 text-white rounded-md text-xs font-medium hover:bg-purple-700 transition"
                                        >
                                            Apply
                                        </button>
                                        <button
                                            onClick={handleDobRangeClear}
                                            className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300 transition"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loan Amount Filter */}
                    {onLoanAmountFilter && (
                        <div className="relative inline-block">
                            <button
                                onClick={toggleFilter('loanAmount')}
                                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border transition ${activeLoanAmount.min || activeLoanAmount.max
                                    ? 'bg-purple-600 text-white border-purple-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-400'
                                    }`}
                            >
                                ₹ {activeLoanAmount.min || activeLoanAmount.max
                                    ? `${activeLoanAmount.min || '0'} - ${activeLoanAmount.max || '∞'}`
                                    : 'Loan Amount'}
                            </button>

                            {openFilter === 'loanAmount' && (
                                <div className="absolute right-0 mt-2 z-30 p-3 flex flex-col gap-2 bg-white border border-gray-300 rounded-lg shadow-lg w-72">
                                    <p className="text-xs font-semibold text-gray-700">Quick Select</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {LOAN_AMOUNT_PRESETS.map(p => (
                                            <button
                                                key={p.label}
                                                onClick={() => applyLoanAmountPreset(p)}
                                                className="px-2 py-1 text-xs font-medium rounded-md border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 mt-1">
                                        <p className="text-xs font-semibold text-gray-700 mb-1">Custom Range</p>
                                        <label className="text-xs font-medium text-gray-600">Min Amount</label>
                                        <input
                                            type="number"
                                            value={loanAmountFilter.min}
                                            onChange={(e) => setLoanAmountFilter(prev => ({ ...prev, min: e.target.value }))}
                                            placeholder="e.g. 10000"
                                            className="w-full p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                                        />
                                        <label className="text-xs font-medium text-gray-600 mt-1 block">Max Amount</label>
                                        <input
                                            type="number"
                                            value={loanAmountFilter.max}
                                            onChange={(e) => setLoanAmountFilter(prev => ({ ...prev, max: e.target.value }))}
                                            placeholder="e.g. 500000"
                                            className="w-full p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={handleLoanAmountApply}
                                            className="flex-1 px-2 py-1 bg-purple-600 text-white rounded-md text-xs font-medium hover:bg-purple-700 transition"
                                        >
                                            Apply
                                        </button>
                                        <button
                                            onClick={handleLoanAmountClear}
                                            className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300 transition"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Date Range Filter */}
                    {onFilterByRange && (
                        <div className="relative inline-block">
                            <button
                                onClick={toggleFilter('dateRange')}
                                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border transition ${activeDateRange.startDate
                                    ? 'bg-purple-600 text-white border-purple-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-400'
                                    } disabled:opacity-50`}
                            >
                                <Calendar size={14} />
                                {dateRangeDisplay}
                            </button>

                            {openFilter === 'dateRange' && (
                                <div className="absolute right-0 mt-2 z-30 p-3 flex flex-col gap-2 bg-white border border-gray-300 rounded-lg shadow-lg w-64">
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

                <div className="flex items-center gap-3">
                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-1">
                        <button
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft size={16} />
                        </button>
                        <button
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-medium text-gray-700 mx-2">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                        <button
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => setPagination(prev => ({
                                ...prev,
                                pageIndex: prev.pageIndex + 1
                            }))}
                            disabled={(pagination.pageIndex + 1) >= table.getPageCount()}
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => setPagination(prev => ({
                                ...prev,
                                pageIndex: table.getPageCount() - 1
                            }))}
                            disabled={(pagination.pageIndex + 1) >= table.getPageCount()}
                        >
                            <ChevronsRight size={16} />
                        </button>
                    </div>

                    {/* Go to Page Dropdown */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">Go to:</span>
                        <select
                            value={selectedGoTo}
                            onChange={handleGoToChange}
                            className="p-2 border border-gray-300 rounded-lg text-sm"
                            disabled={totalDataCount === 0} // Disable if no data
                        >
                            {pageOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MainTable;
