import React, { useState } from "react";

const getYYYYMMDD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const ExportModal = ({ open, onClose, onSubmit, isSubmitting = false }) => {
    // State 1: Tracks the manually selected date range for 'range' mode
    const [dates, setDates] = useState({
        startDate: "",
        endDate: ""
    });

    // State 2: Tracks the active export mode ('today', 'yesterday', 'range'). Default to 'range'
    const [exportMode, setExportMode] = useState('range');

    // --- Conditional Rendering Check ---
    // if (!open) return null;

    // Handler for date range inputs
    const handleDateChange = (e) => {
        // Dates ko sirf tab update karo jab 'range' mode selected ho.
        if (exportMode === 'range') {
            setDates({ ...dates, [e.target.name]: e.target.value });
        }
    };

    // Handler for radio button mode selection
    const handleModeChange = (e) => {
        setExportMode(e.target.value);
        // Agar user range se switch karta hai, toh manual dates clear kar do.
        if (e.target.value !== 'range') {
            setDates({ startDate: "", endDate: "" });
        }
    };

    // Logic to calculate final date range based on selected mode
    const calculateDateRange = () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (exportMode === 'today') {
            const dateString = getYYYYMMDD(today);
            // Returns the calculated date for today/yesterday.
            return { startDate: dateString, endDate: dateString };
        }

        if (exportMode === 'yesterday') {
            const dateString = getYYYYMMDD(yesterday);
            return { startDate: dateString, endDate: dateString };
        }

        // 'range' mode: return manually entered dates
        return dates;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        const { startDate, endDate } = calculateDateRange(); // Calculated dates destructure karo

        // CRITICAL FIX: Selected export mode ko bhi pass karo.
        onSubmit({ startDate, endDate, mode: exportMode });
        // onClose(); 
    };

    return (
        // OVERLAY: fixed, full screen, centered, high z-index
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            {/* MODAL BOX */}
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm mx-4 transform transition-all">

                <h2 className="text-xl font-extrabold text-blue-600 mb-6 border-b pb-2">
                    Select Export Range
                </h2>

                <form onSubmit={handleSubmit}>

                    {/* Radio Button Group for Export Mode */}
                    <div className="mb-6 flex flex-col space-y-3">
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="radio-today"
                                name="exportMode"
                                value="today"
                                checked={exportMode === 'today'}
                                onChange={handleModeChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="radio-today" className="text-sm font-medium text-gray-700">
                                Today
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="radio-yesterday"
                                name="exportMode"
                                value="yesterday"
                                checked={exportMode === 'yesterday'}
                                onChange={handleModeChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="radio-yesterday" className="text-sm font-medium text-gray-700">
                                Yesterday
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="radio-range"
                                name="exportMode"
                                value="range"
                                checked={exportMode === 'range'}
                                onChange={handleModeChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="radio-range" className="text-sm font-medium text-gray-700">
                                Date Range (Select below)
                            </label>
                        </div>
                    </div>

                    {/* Date Inputs (CONDITIONAL RENDERING) */}
                    {exportMode === 'range' && (
                        <div className="space-y-4 pt-2 border-t border-gray-100">
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="startDate">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={dates.startDate}
                                    onChange={handleDateChange}
                                    required={exportMode === 'range'} // Required only if 'range' is selected
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="endDate">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={dates.endDate}
                                    onChange={handleDateChange}
                                    required={exportMode === 'range'} // Required only if 'range' is selected
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex justify-end space-x-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150"
                        >
                            Cancel
                        </button>
                         {!isSubmitting ? (
                               <span className="flex items-center justify-center">
                                {/* High-Speed Spinner (तेज गति वाला स्पिनर) */}
                                <span className="relative inline-flex items-center mr-2">
                                    {/* The main spinner SVG, classic loading animation */}
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                </span>
                                {/* Pulsating text effect for emphasis (जोर देने के लिए स्पंदनशील पाठ प्रभाव) */}
                                <span className="ml-1 font-extrabold animate-pulse">EXPORTING DATA...</span>
                            </span>
                            ) : (
                                'Export'
                            )}
                    </div>
                </form>

            </div>
        </div>
    );
};

export default ExportModal;