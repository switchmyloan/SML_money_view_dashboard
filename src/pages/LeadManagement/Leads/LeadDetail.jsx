"use client";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const containsHtml = (str) => {
    if (!str || typeof str !== 'string') return false;
    return /<\s*(html|body|pre|doctype)/i.test(str.trim());
};

const shouldHideResponse = (response) => {
    if (!response || response.success === undefined) {
        return true; 
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
    if (!response) {
        return null;
    }

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
        </div>
    );
};

export default function Tabs() {
    const location = useLocation();
    const lead = location.state?.lead;

    const [activeTab, setActiveTab] = useState("Basic");

    const tabs = ["Basic", "Offers"];

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
                                    <p className="text-sm font-medium text-gray-700">Created At:</p>
                                    <p className="text-gray-700 font-medium">{new Date(lead.consentDatetime).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

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
                    {activeTab === "Offers" && (
                        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-xl">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                                🤝 MoneyView Loan Offers
                            </h2>

                            {lead?.lender_response?.MoneyView?.data?.resData?.data?.response?.offerObjects?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                    {lead.lender_response.MoneyView.data.resData.data.response.offerObjects.map((item, index) => (
                                        <div
                                            key={index}
                                            className="bg-white border border-blue-200 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden"
                                        >
                                            <div className="p-5">
                                                <h3 className="text-lg font-extrabold text-blue-700 mb-4 border-b pb-2">
                                                    Offer Option #{index + 1}
                                                </h3>

                                                {/* Loan Amount */}
                                                <div className="flex justify-between items-center py-1">
                                                    <span className="text-sm font-semibold text-gray-600">Loan Amount:</span>
                                                    <span className="text-base font-bold text-gray-900">
                                                        ₹ {parseFloat(item?.loanAmount).toLocaleString('en-IN')}
                                                    </span>
                                                </div>

                                                {/* Loan Tenure */}
                                                <div className="flex justify-between items-center py-1">
                                                    <span className="text-sm font-semibold text-gray-600">Tenure:</span>
                                                    <span className="text-base font-bold text-gray-900">
                                                        {item?.loanTenure} Months
                                                    </span>
                                                </div>

                                                {/* Rate of Interest */}
                                                <div className="flex justify-between items-center py-1">
                                                    <span className="text-sm font-semibold text-gray-600">Rate of Interest (p.a.):</span>
                                                    <span className="text-base font-bold text-red-600">
                                                        {item?.rateOfInterest}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Separator and EMI/Processing Fee Section */}
                                            <div className="bg-blue-50 border-t border-blue-100 p-5">
                                                {/* Monthly EMI (The most crucial piece of data) */}
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-md font-bold text-blue-800">Monthly EMI:</span>
                                                    <span className="text-xl font-extrabold text-blue-900">
                                                        ₹ {parseFloat(item?.loanEmi).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>

                                                {/* Processing Fee */}
                                                <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                                                    <span className="text-xs font-medium text-gray-500">Processing Fee:</span>
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        ₹ {parseFloat(item?.processingFeeAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-gray-50 border border-gray-300 rounded-lg">
                                    <p className="text-lg font-medium text-gray-500">
                                        😞 No loan offers were found from MoneyView for this lead.
                                    </p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Check the lender response status for more details.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}