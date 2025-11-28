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
    if (!open) return null;

    // Handler for date range inputs
    const handleDateChange = (e) => {
        // Dates ko sirf tab update karo jab 'range' mode selected ho.
        if (exportMode === 'range') {
            setDates({ ...dates, [e.target.name]: e.target.value });
        }
    };

    // Handler for radio button mode selection
    const handleModeChange = (e) => {
        const newMode = e.target.value;
        setExportMode(newMode);
        // Reset manual dates only when switching *from* range mode
        if (newMode !== 'range') {
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
        e.preventDefault(); // Prevents default form submission

        if (isSubmitting) return;

        const { startDate, endDate } = calculateDateRange();

        // Pass calculated dates and the selected mode to the parent handler
        onSubmit({ startDate, endDate, mode: exportMode });
    };


    return (
        // OVERLAY: fixed, full screen, centered, high z-index
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            {/* MODAL BOX */}
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm mx-4 transform transition-all">

                <h2 className="text-xl font-extrabold text-blue-600 mb-6 border-b pb-2">
                    Select Export Range
                </h2>

                {/* Submit handler is on the form */}
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
                                    required={exportMode === 'range'}
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
                                    required={exportMode === 'range'}
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
                        <button
                            type="submit" // FIX: Changed from type="button" and removed incorrect onClick={onSubmit}
                            disabled={isSubmitting}
                            className={`
                            px-4 py-2 text-sm font-semibold rounded-lg shadow-lg transition duration-300 flex items-center justify-center relative overflow-hidden
                            ${isSubmitting
                                    ? 'bg-indigo-600 cursor-not-allowed text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-xl'
                                }
                        `}
                        >Export</button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default ExportModal;