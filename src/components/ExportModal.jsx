import React, { useState, useEffect, useCallback } from "react";
import { X, ShieldCheck, FileDown, Calendar } from "lucide-react";
import ToastNotification from "./Notification/ToastNotification";
import OtpVerification from "./OtpVerification";

const getYYYYMMDD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const ExportModal = ({ open, onClose, onSubmit, isSubmitting = false }) => {
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [exportMode, setExportMode] = useState("range");
  const [otpData, setOtpData] = useState({
    otp: "",
    hashedOtp: "",
    mobileNumber: "",
    otpSent: false,
  });

  useEffect(() => {
    if (open) {
      setDates({ startDate: "", endDate: "" });
      setExportMode("range");
      setOtpData({ otp: "", hashedOtp: "", mobileNumber: "", otpSent: false });
    }
  }, [open]);

  const handleOtpChange = useCallback((data) => {
    setOtpData(data);
  }, []);

  if (!open) return null;

  const handleDateChange = (e) => {
    if (exportMode === "range") {
      setDates({ ...dates, [e.target.name]: e.target.value });
    }
  };

  const handleModeChange = (e) => {
    const newMode = e.target.value;
    setExportMode(newMode);
    if (newMode !== "range") {
      setDates({ startDate: "", endDate: "" });
    }
  };

  const calculateDateRange = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (exportMode === "today") {
      const dateString = getYYYYMMDD(today);
      return { startDate: dateString, endDate: dateString };
    }
    if (exportMode === "yesterday") {
      const dateString = getYYYYMMDD(yesterday);
      return { startDate: dateString, endDate: dateString };
    }
    return dates;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { startDate, endDate } = calculateDateRange();

    if (exportMode === "range" && (!startDate || !endDate)) {
      ToastNotification.error(
        "Please select a start and end date for the range.",
      );
      return;
    }

    onSubmit({
      startDate,
      endDate,
      mode: exportMode,
      otp: otpData.otp,
      hashedOtp: otpData.hashedOtp,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FileDown className="text-blue-600" />
            Export Data
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <OtpVerification onChange={handleOtpChange} resetSignal={open} />

          {otpData.otpSent && (
            <>
              <div className="my-6 border-t border-gray-200" />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="text-blue-600" />
                  Select Export Range
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <label
                    htmlFor="radio-today"
                    className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${exportMode === "today" ? "bg-blue-50 border-blue-500 text-blue-700" : "border-gray-300 hover:border-blue-400"}`}
                  >
                    <input
                      type="radio"
                      id="radio-today"
                      name="exportMode"
                      value="today"
                      checked={exportMode === "today"}
                      onChange={handleModeChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">Today</span>
                  </label>
                  <label
                    htmlFor="radio-yesterday"
                    className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${exportMode === "yesterday" ? "bg-blue-50 border-blue-500 text-blue-700" : "border-gray-300 hover:border-blue-400"}`}
                  >
                    <input
                      type="radio"
                      id="radio-yesterday"
                      name="exportMode"
                      value="yesterday"
                      checked={exportMode === "yesterday"}
                      onChange={handleModeChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">Yesterday</span>
                  </label>
                  <label
                    htmlFor="radio-range"
                    className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${exportMode === "range" ? "bg-blue-50 border-blue-500 text-blue-700" : "border-gray-300 hover:border-blue-400"}`}
                  >
                    <input
                      type="radio"
                      id="radio-range"
                      name="exportMode"
                      value="range"
                      checked={exportMode === "range"}
                      onChange={handleModeChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">Date Range</span>
                  </label>
                </div>
              </div>

              {exportMode === "range" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      htmlFor="startDate"
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={dates.startDate}
                      onChange={handleDateChange}
                      required={exportMode === "range"}
                      className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      htmlFor="endDate"
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={dates.endDate}
                      onChange={handleDateChange}
                      required={exportMode === "range"}
                      className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            {otpData.otpSent && (
              <button
                type="submit"
                disabled={isSubmitting || !otpData.otp}
                className="px-6 py-2 text-sm font-semibold rounded-lg shadow-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                <ShieldCheck size={18} />
                {isSubmitting ? "Verifying..." : "Verify & Export"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportModal;
