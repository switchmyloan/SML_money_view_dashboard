// import React, { useState, useEffect } from "react";
// import ToastNotification from "./Notification/ToastNotification";

// const getYYYYMMDD = (date) => {
//     const y = date.getFullYear();
//     const m = String(date.getMonth() + 1).padStart(2, '0');
//     const d = String(date.getDate()).padStart(2, '0');
//     return `${y}-${m}-${d}`;
// };

// const ExportModal = ({ open, onClose, onSubmit, isSubmitting = false }) => {
//     const [dates, setDates] = useState({ startDate: "", endDate: "" });
//     const [exportMode, setExportMode] = useState('range');
//     const [mobileNumber, setMobileNumber] = useState('');
//     const [otp, setOtp] = useState('');
//     const [hashedOtp, setHashedOtp] = useState('');
//     const [otpSent, setOtpSent] = useState(false);
//     const [sendingOtp, setSendingOtp] = useState(false);

//     useEffect(() => {
//         if (open) {
//             setDates({ startDate: "", endDate: "" });
//             setExportMode('range');
//             setMobileNumber('');
//             setOtp('');
//             setHashedOtp('');
//             setOtpSent(false);
//             setSendingOtp(false);
//         }
//     }, [open]);

//     if (!open) return null;

//     const handleDateChange = (e) => {
//         if (exportMode === 'range') {
//             setDates({ ...dates, [e.target.name]: e.target.value });
//         }
//     };

//     const handleModeChange = (e) => {
//         const newMode = e.target.value;
//         setExportMode(newMode);
//         if (newMode !== 'range') {
//             setDates({ startDate: "", endDate: "" });
//         }
//     };

//     const handleSendOtp = async () => {
//         if (!/^\d{10}$/.test(mobileNumber)) {
//             ToastNotification.error("Please enter a valid 10-digit mobile number.");
//             return;
//         }
//         setSendingOtp(true);
//         try {
//             const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-otp`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ mobileNumber }),
//             });
//             const data = await response.json();
//             if (response.ok) {
//                 setHashedOtp(data.data.hashedOtp);
//                 setOtpSent(true);
//                 ToastNotification.success("OTP sent successfully!");
//             } else {
//                 ToastNotification.error(data.message || "Failed to send OTP.");
//             }
//         } catch (error) {
//             ToastNotification.error("An error occurred while sending OTP.");
//         } finally {
//             setSendingOtp(false);
//         }
//     };

//     const calculateDateRange = () => {
//         const today = new Date();
//         const yesterday = new Date(today);
//         yesterday.setDate(today.getDate() - 1);

//         if (exportMode === 'today') {
//             const dateString = getYYYYMMDD(today);
//             return { startDate: dateString, endDate: dateString };
//         }
//         if (exportMode === 'yesterday') {
//             const dateString = getYYYYMMDD(yesterday);
//             return { startDate: dateString, endDate: dateString };
//         }
//         return dates;
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (isSubmitting) return;

//         const { startDate, endDate } = calculateDateRange();
        
//         if (exportMode === 'range' && (!startDate || !endDate)) {
//             ToastNotification.error("Please select a start and end date for the range.");
//             return;
//         }

//         onSubmit({ startDate, endDate, mode: exportMode, otp, hashedOtp, mobileNumber });
//     };

//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm mx-4">
//                 <h2 className="text-xl font-extrabold text-blue-600 mb-6 border-b pb-2">
//                     Export Data
//                 </h2>
//                 <form onSubmit={handleSubmit}>
//                     {!otpSent ? (
//                         <div className="mb-4">
//                             <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="mobileNumber">
//                                 Enter Mobile Number to Verify
//                             </label>
//                             <div className="flex items-center gap-2">
//                                 <input
//                                     type="tel"
//                                     id="mobileNumber"
//                                     value={mobileNumber}
//                                     onChange={(e) => setMobileNumber(e.target.value)}
//                                     placeholder="10-digit mobile number"
//                                     className="flex-1 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={handleSendOtp}
//                                     disabled={sendingOtp || !/^\d{10}$/.test(mobileNumber)}
//                                     className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
//                                 >
//                                     {sendingOtp ? 'Sending...' : 'Send OTP'}
//                                 </button>
//                             </div>
//                         </div>
//                     ) : (
//                         <>
//                             <div className="mb-4">
//                                 <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="otp">
//                                     Enter OTP sent to {mobileNumber}
//                                 </label>
//                                 <input
//                                     type="text"
//                                     id="otp"
//                                     value={otp}
//                                     onChange={(e) => setOtp(e.target.value)}
//                                     placeholder="4-digit OTP"
//                                     required
//                                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                                 />
//                             </div>

//                             <div className="my-4 border-t border-gray-200" />

//                             <h3 className="text-base font-bold text-gray-800 mb-3">
//                                 Select Export Range
//                             </h3>
                            
//                             <div className="mb-6 flex flex-col space-y-3">
//                                 <div className="flex items-center space-x-2">
//                                     <input type="radio" id="radio-today" name="exportMode" value="today" checked={exportMode === 'today'} onChange={handleModeChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
//                                     <label htmlFor="radio-today" className="text-sm font-medium text-gray-700">Today</label>
//                                  </div>
//                                 <div className="flex items-center space-x-2">
//                                     <input type="radio" id="radio-yesterday" name="exportMode" value="yesterday" checked={exportMode === 'yesterday'} onChange={handleModeChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
//                                     <label htmlFor="radio-yesterday" className="text-sm font-medium text-gray-700">Yesterday</label>
//                                 </div>
//                                 <div className="flex items-center space-x-2">
//                                     <input type="radio" id="radio-range" name="exportMode" value="range" checked={exportMode === 'range'} onChange={handleModeChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
//                                     <label htmlFor="radio-range" className="text-sm font-medium text-gray-700">Date Range</label>
//                                 </div>
//                             </div>

//                             {exportMode === 'range' && (
//                                 <div className="space-y-4 pt-2 border-t border-gray-100">
//                                     <div className="mb-4">
//                                         <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="startDate">Start Date</label>
//                                         <input type="date" id="startDate" name="startDate" value={dates.startDate} onChange={handleDateChange} required={exportMode === 'range'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150" />
//                                     </div>
//                                     <div className="mb-6">
//                                         <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="endDate">End Date</label>
//                                         <input type="date" id="endDate" name="endDate" value={dates.endDate} onChange={handleDateChange} required={exportMode === 'range'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150" />
//                                     </div>
//                                 </div>
//                             )}
//                         </>
//                     )}
//                     <div className="flex justify-end space-x-3 mt-4">
//                         <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
//                             Cancel
//                         </button>
//                         {otpSent && (
//                             <button type="submit" disabled={isSubmitting || !otp} className="px-4 py-2 text-sm font-semibold rounded-lg shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">
//                                 {isSubmitting ? 'Verifying...' : 'Verify & Export'}
//                             </button>
//                         )}
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default ExportModal;


import React, { useState, useEffect } from "react";
import { X, ShieldCheck, FileDown, Calendar, Smartphone } from "lucide-react";
import ToastNotification from "./Notification/ToastNotification";
import OtpInput from "react-otp-input";

const getYYYYMMDD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const ExportModal = ({ open, onClose, onSubmit, isSubmitting = false }) => {
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [exportMode, setExportMode] = useState("range");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [hashedOtp, setHashedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    if (open) {
      setDates({ startDate: "", endDate: "" });
      setExportMode("range");
      setMobileNumber("");
      setOtp("");
      setHashedOtp("");
      setOtpSent(false);
      setSendingOtp(false);
    }
  }, [open]);

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

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
      ToastNotification.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setSendingOtp(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobileNumber }),
        },
      );
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

    onSubmit({ startDate, endDate, mode: exportMode, otp, hashedOtp });
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
          {!otpSent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center text-center">
                <ShieldCheck className="text-green-500" size={40} />
                <h3 className="text-lg font-semibold text-gray-700 ml-3">
                  Two-Factor Authentication
                </h3>
              </div>
              <p className="text-center text-sm text-gray-500">
                For security purposes, please verify your identity.
              </p>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="mobileNumber"
                >
                  Enter Mobile Number
                </label>
                <div className="relative">
                  <Smartphone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="tel"
                    id="mobileNumber"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp || !/^\d{10}$/.test(mobileNumber)}
                className="w-full flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
              >
                {sendingOtp ? "Sending..." : "Send OTP"}
              </button>
            </div>
          ) : (
            <>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="otp"
                >
                  Enter OTP sent to{" "}
                  <span className="font-bold">{mobileNumber}</span>
                </label>
                <div className="relative flex justify-center">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={4}
                    renderSeparator={<span className="w-4" />}
                    renderInput={(props) => (
                      <input
                        {...props}
                        style={{
                          width: "64px",
                          height: "64px",
                          fontSize: "1.5rem",
                          textAlign: "center",
                          borderRadius: "8px",
                          border: "1px solid #D1D5DB",
                        }}
                      />
                    )}
                    containerStyle={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "12px",
                    }}
                  />
                </div>
              </div>

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
            {otpSent && (
              <button
                type="submit"
                disabled={isSubmitting || !otp}
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