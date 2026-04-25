import React, { useState, useEffect } from "react";
import ToastNotification from "./Notification/ToastNotification";

const getYYYYMMDD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const ExportModal = ({ open, onClose, onSubmit, isSubmitting = false }) => {
    const [dates, setDates] = useState({ startDate: "", endDate: "" });
    const [exportMode, setExportMode] = useState('range');
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [hashedOtp, setHashedOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

    useEffect(() => {
        if (open) {
            setDates({ startDate: "", endDate: "" });
            setExportMode('range');
            setMobileNumber('');
            setOtp('');
            setHashedOtp('');
            setOtpSent(false);
            setSendingOtp(false);
        }
    }, [open]);

    if (!open) return null;

    const handleDateChange = (e) => {
        if (exportMode === 'range') {
            setDates({ ...dates, [e.target.name]: e.target.value });
        }
    };

    const handleModeChange = (e) => {
        const newMode = e.target.value;
        setExportMode(newMode);
        if (newMode !== 'range') {
            setDates({ startDate: "", endDate: "" });
        }
    };

    const handleSendOtp = async () => {
        if (!/^\d{10}$/.test(mobileNumber)) {
            ToastNotification.error("Please enter a valid 10-digit mobile number.");
            return;
        }
        setSendingOtp(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobileNumber }),
            });
            const data = await response.json();
            if (response.ok) {
                setHashedOtp(data.data.hashedOtp);
                setOtpSent(true);
                ToastNotification.success("OTP sent successfully!");
            } else {
                ToastNotification.error(data.message || "Failed to send OTP.");
            }
        } catch (error) {
            ToastNotification.error("An error occurred while sending OTP.");
        } finally {
            setSendingOtp(false);
        }
    };

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
        return dates;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const { startDate, endDate } = calculateDateRange();
        
        if (exportMode === 'range' && (!startDate || !endDate)) {
            ToastNotification.error("Please select a start and end date for the range.");
            return;
        }

        onSubmit({ startDate, endDate, mode: exportMode, otp, hashedOtp });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm mx-4">
                <h2 className="text-xl font-extrabold text-blue-600 mb-6 border-b pb-2">
                    Export Data
                </h2>
                <form onSubmit={handleSubmit}>
                    {!otpSent ? (
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="mobileNumber">
                                Enter Mobile Number to Verify
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="tel"
                                    id="mobileNumber"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="10-digit mobile number"
                                    className="flex-1 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={sendingOtp || !/^\d{10}$/.test(mobileNumber)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {sendingOtp ? 'Sending...' : 'Send OTP'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="otp">
                                    Enter OTP sent to {mobileNumber}
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="4-digit OTP"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="my-4 border-t border-gray-200" />

                            <h3 className="text-base font-bold text-gray-800 mb-3">
                                Select Export Range
                            </h3>
                            
                            <div className="mb-6 flex flex-col space-y-3">
                                <div className="flex items-center space-x-2">
                                    <input type="radio" id="radio-today" name="exportMode" value="today" checked={exportMode === 'today'} onChange={handleModeChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <label htmlFor="radio-today" className="text-sm font-medium text-gray-700">Today</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="radio" id="radio-yesterday" name="exportMode" value="yesterday" checked={exportMode === 'yesterday'} onChange={handleModeChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <label htmlFor="radio-yesterday" className="text-sm font-medium text-gray-700">Yesterday</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="radio" id="radio-range" name="exportMode" value="range" checked={exportMode === 'range'} onChange={handleModeChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <label htmlFor="radio-range" className="text-sm font-medium text-gray-700">Date Range</label>
                                </div>
                            </div>

                            {exportMode === 'range' && (
                                <div className="space-y-4 pt-2 border-t border-gray-100">
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="startDate">Start Date</label>
                                        <input type="date" id="startDate" name="startDate" value={dates.startDate} onChange={handleDateChange} required={exportMode === 'range'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150" />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="endDate">End Date</label>
                                        <input type="date" id="endDate" name="endDate" value={dates.endDate} onChange={handleDateChange} required={exportMode === 'range'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div className="flex justify-end space-x-3 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        {otpSent && (
                            <button type="submit" disabled={isSubmitting || !otp} className="px-4 py-2 text-sm font-semibold rounded-lg shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">
                                {isSubmitting ? 'Verifying...' : 'Verify & Export'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExportModal;