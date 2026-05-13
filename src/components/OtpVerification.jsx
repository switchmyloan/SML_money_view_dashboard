import React, { useEffect, useState } from "react";
import { ShieldCheck, Smartphone } from "lucide-react";
import OtpInput from "react-otp-input";
import ToastNotification from "./Notification/ToastNotification";

const OTP_LENGTH = 4;

const OtpVerification = ({
  onChange,
  resetSignal,
  sendOtpUrl = `${import.meta.env.VITE_API_URL}/auth/send-otp`,
  numInputs = OTP_LENGTH,
  title = "Two-Factor Authentication",
  subtitle = "For security purposes, please verify your identity.",
}) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [hashedOtp, setHashedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    setMobileNumber("");
    setOtp("");
    setHashedOtp("");
    setOtpSent(false);
    setSendingOtp(false);
  }, [resetSignal]);

  useEffect(() => {
    onChange?.({ otp, hashedOtp, mobileNumber, otpSent });
  }, [otp, hashedOtp, mobileNumber, otpSent, onChange]);

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
      ToastNotification.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setSendingOtp(true);
    try {
      const response = await fetch(sendOtpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  if (!otpSent) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center text-center">
          <ShieldCheck className="text-green-500" size={40} />
          <h3 className="text-lg font-semibold text-gray-700 ml-3">{title}</h3>
        </div>
        <p className="text-center text-sm text-gray-500">{subtitle}</p>
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
    );
  }

  return (
    <div>
      <label
        className="block text-sm font-medium text-gray-700 mb-2"
        htmlFor="otp"
      >
        Enter OTP sent to <span className="font-bold">{mobileNumber}</span>
      </label>
      <div className="relative flex justify-center">
        <OtpInput
          value={otp}
          onChange={setOtp}
          numInputs={numInputs}
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
  );
};

export default OtpVerification;
