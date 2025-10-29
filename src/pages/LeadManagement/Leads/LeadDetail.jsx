"use client";
import { useState } from "react";
import { useLocation } from "react-router-dom";

// Helper function to check if a string looks like raw HTML (like a server error message)
const containsHtml = (str) => {
    if (!str || typeof str !== 'string') return false;
    // Simple check for common HTML tags like <html, <body, <pre
    return /<\s*(html|body|pre|doctype)/i.test(str.trim());
};

/**
 * Determines if the lender response represents a low-value technical failure 
 * (like a 404 or an HTML error response) that should be hidden from non-technical users.
 * @param {object} response - The lender response object.
 * @returns {boolean} True if the response should be hidden.
 */
const shouldHideResponse = (response) => {
    if (!response || response.success === undefined) {
        return true; // Hide if no valid response object or no success status
    }

    const statusCode = response.statusCode;
    const message = String(response.message || '');

    if (statusCode >= 400 && statusCode < 600) {
        if (response.success === false) {
            return true;
        }
    }

    if (containsHtml(message)) {
        return true;
    }

    return false;
};

const LenderCard = ({ lenderName, response }) => {
    const [showRawData, setShowRawData] = useState(false);

    if (!response) {
        return null;
    }

    const statusCodeString = String(response.statusCode || 'N/A');
    const messageString = String(response.message || 'N/A');
    const isHtmlMessage = containsHtml(messageString);

    const mainDetails = [
        {
            label: "Success Status",
            value: response.success !== undefined ? (response.success ? "✅ Successful" : "❌ Failed") : 'N/A'
        }
    ];

    const specificDetails = [];
    if (lenderName === 'smartCoin' && response.isDuplicate !== undefined) {
        specificDetails.push({
            label: "Duplicate Lead?",
            value: response.isDuplicate ? "⚠️ Yes (Lead already exists)" : "No"
        });
    }
    if (lenderName === 'MPokket' && response.isEligible !== undefined) {
        specificDetails.push({
            label: "Customer Eligible?",
            value: response.isEligible ? "✅ Yes" : "❌ No"
        });
    }

    const safeStringify = (data) => {
        if (data === null || data === undefined) return 'N/A';
        try {
            return JSON.stringify(data, null, 2);
        } catch (e) {
            return 'Error converting data to string';
        }
    };

    const requestData = response.data?.requestBody || response.data?.reqData || response.data?.reqBody;
    const responseData = response.data?.response || response.data?.resData || response.data?.resBody || response.data?.dedupeResponse || response.data;


    return (
        <div className="p-6 border border-gray-200 rounded-xl shadow-lg bg-white transition-shadow hover:shadow-xl">
            <h3 className="text-lg font-bold text-indigo-700 mb-4">{lenderName} Response</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6  pb-4">
                {mainDetails.map((item) => (
                    <div key={item.label}>
                        <p className="text-sm font-semibold text-gray-600">{item.label}</p>
                        <p className={`text-sm font-bold ${String(item.value).includes('✅') ? 'text-green-600' : String(item.value).includes('❌') || String(item.value).includes('⚠️') ? 'text-red-600' : 'text-gray-900'}`}>{item.value}</p>
                    </div>
                ))}
                <div className="">
                    <p className="text-sm font-semibold text-gray-600">Partner Message</p>
                    <p className="text-sm text-gray-900">
                        {isHtmlMessage ?
                            <span className="text-red-600">Internal Server/API Error</span> :
                            messageString
                        }
                    </p>
                </div>
            </div>

            {/* {specificDetails.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Special Check</h4>
                    {specificDetails.map((item) => (
                        <div key={item.label} className="flex justify-between p-2 bg-indigo-50 rounded-lg">
                             <p className="text-sm font-semibold text-indigo-800">{item.label}:</p>
                             <p className={`font-bold ${item.value.includes('✅') ? 'text-green-600' : item.value.includes('❌') || item.value.includes('⚠️') ? 'text-red-600' : 'text-indigo-800'}`}>{item.value}</p>
                        </div>
                    ))}
                </div>
            )} */}

            {/* <button
                onClick={() => setShowRawData(!showRawData)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none mt-2"
            >
                {showRawData ? "👆 Hide Raw Request/Response Data" : "👇 View Raw Request/Response Data (For Technical Team)"}
            </button>
            
            {showRawData && (
                <div className="mt-4 border-t pt-4 space-y-4">
                    
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Request Data (Sent to Lender):</p>
                        <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto text-gray-800 border">
                            {safeStringify(requestData)}
                        </pre>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Response Data (Received from Lender):</p>
                        <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto text-gray-800 border">
                            {safeStringify(responseData)}
                        </pre>
                    </div>
                </div>
            )} */}
        </div>
    );
};
// End of LenderCard component

// ----------------------------------------------------
// Main Tabs Component
// ----------------------------------------------------

export default function Tabs() {
    const location = useLocation();
    const lead = location.state?.lead;

    const [activeTab, setActiveTab] = useState("Basic");

    const tabs = ["Basic"];

    // Check if lead data exists overall
    if (!lead) {
        return (
            <div className="p-10 border border-red-300 bg-red-50 rounded-lg">
                <h1 className="text-2xl font-bold text-red-800 mb-2">Data Loading Error!</h1>
                <p className="text-red-700">Lead data could not be found. Please ensure you are navigating from the correct page and that the `location.state.lead` object was passed.</p>
            </div>
        );
    }

    const formatConsentTime = (timestamp) => {
        const timeInMs = Number(timestamp);
        if (isNaN(timeInMs)) return "Invalid Time";
        return new Date(timeInMs).toLocaleString();
    };

    console.log(lead?.lender_response?.MoneyView?.message)

    // ... rest of the component
    return (
        <>
            <div className="w-full">
                <div className="rounded-lg shadow-sm px-4">
                    <div className="flex space-x-8 ">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative pb-2 text-sm font-medium transition-colors
                  ${activeTab === tab
                                        ? "text-indigo-600"
                                        : "text-gray-600 hover:text-indigo-600"
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <span className="absolute left-0 -bottom-[1px] h-0.5 w-full bg-indigo-600 rounded"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 🔹 Tab Content */}
                <div className="mt-4 p-4 rounded-lg shadow-sm bg-white">
                    {/* -------------------- */}
                    {/* 1. Basic Info Tab Content */}
                    {/* -------------------- */}
                    {activeTab === "Basic" && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Info</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-12">

                                <div>
                                    <p className="text-sm font-medium text-gray-700">First Name:</p>
                                    <p className="text-gray-700 font-medium">{lead.firstName}</p>
                                </div>
                              

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Last Name:</p>
                                    <p className="text-gray-700 font-medium">{lead.lastName}</p>
                                </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Lender Message:</p>
                                    <p className="text-gray-700 font-medium">{lead?.lender_response?.MoneyView?.message}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Phone Number:</p>
                                    <p className="text-gray-700 font-medium">{lead.phone}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Email:</p>
                                    <p className="text-gray-700 font-medium">{lead.email ?? "Not Provided"}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Gender:</p>
                                    <p className="text-gray-700 font-medium">{lead.gender}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Date of Birth:</p>
                                    <p className="text-gray-700 font-medium">{new Date(lead.dob).toLocaleDateString()}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Loan Amount:</p>
                                    <p className="text-gray-700 font-medium">{lead.loanAmount ?? "Not Provided"}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Salary:</p>
                                    <p className="text-gray-700 font-medium">{lead.salary ?? "Not Provided"}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Pin Code:</p>
                                    <p className="text-gray-700 font-medium">{lead.pincode ?? "Not Provided"}</p>
                                </div>


                                <div>
                                    <p className="text-sm font-medium text-gray-700">PAN Number:</p>
                                    <p className="text-gray-700 font-medium">{lead.panNumber}</p>
                                </div>


                                <div>
                                    <p className="text-sm font-medium text-gray-700">Profession:</p>
                                    <p className="text-gray-700 font-medium">{lead.profession ?? "Not Provided"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">UTM Campaign:</p>
                                    <p className="text-gray-700 font-medium">{lead.utm_campaign ?? "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">UTM Content:</p>
                                    <p className="text-gray-700 font-medium">{lead.utm_content ?? "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">UTM Link:</p>
                                    <p className="text-gray-700 font-medium">{lead.utm_link ?? "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">UTM Medium:</p>
                                    <p className="text-gray-700 font-medium">{lead.utm_medium ?? "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">UTM Source:</p>
                                    <p className="text-gray-700 font-medium">{lead.utm_source ?? "-"}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Created At:</p>
                                    <p className="text-gray-700 font-medium">{new Date(lead.consentDatetime).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* -------------------- */}
                    {/* 2. Lender Details Tab Content */}
                    {/* -------------------- */}
                    {activeTab === "Lender Details" && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Lender Responses</h2>
                            {lead?.lender_response?.MoneyView?.data && Object.keys(lead?.lender_response?.MoneyView?.data).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.entries(lead?.lender_response?.MoneyView?.data)
                                        .filter(([_, response]) => !shouldHideResponse(response))
                                        .map(([lenderName, response]) => (
                                            <LenderCard
                                                key={lenderName}
                                                lenderName={lenderName}
                                                response={response}
                                            />
                                        ))}

                                    {Object.entries(lead.lenderresponse).filter(([_, response]) => !shouldHideResponse(response)).length === 0 && (
                                        <div className="md:col-span-2"> 
                                            <p className="text-gray-500 p-4 border border-gray-200 rounded-lg">No meaningful lender responses to display. All responses were filtered out due to technical errors.</p>
                                        </div>
                                    )}

                                </div>
                            ) : (
                                <p className="text-gray-500 p-4 border border-gray-200 rounded-lg">No lender response data is available for this lead.</p>
                            )}
                        </div>
                    )}


                    {activeTab === "Consent Data" && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-6">Consent Records</h2>
                            {lead?.consentData && lead.consentData.length > 0 ? (
                                <div className="space-y-6">
                                    {lead.consentData.map((consentItem, index) => (
                                        <div key={index} className="border border-green-200 bg-green-50 p-4 rounded-lg shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-md font-medium text-green-800">Consent #{index + 1}</h3>
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${consentItem.consentIsGiven ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {consentItem.consentIsGiven ? 'GIVEN' : 'NOT GIVEN'}
                                                </span>
                                            </div>

                                            <p className="text-sm font-medium text-gray-700">Time Recorded:</p>
                                            <p className="text-gray-600 mb-4">{formatConsentTime(consentItem.consentTime)}</p>

                                            <p className="text-sm font-medium text-gray-700">Consent Statement:</p>
                                            <p className="text-gray-600 italic text-wrap">{consentItem.consent}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 p-4 border border-gray-200 rounded-lg">No explicit consent data records were found for this lead.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </>
    );
}