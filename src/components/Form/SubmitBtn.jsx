import React from "react";

function SubmitBtn({ loading, label }) {
  return (
    <div className="w-full text-right">
      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-2 text-sm font-medium rounded-lg shadow-md transition 
          ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-white"
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
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            Loading...
          </div>
        ) : (
          label
        )}
      </button>
    </div>
  );
}

export default SubmitBtn;
