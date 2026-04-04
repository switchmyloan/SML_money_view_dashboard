
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OfferLeadDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lead } = location.state || {};

  if (!lead) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Lead Not Found</h1>
        <p>No lead data available. Please go back and select a lead.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Lead Details</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Back to List
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-600">Name</h3>
            <p className="text-gray-900 text-lg">{lead.name || 'N/A'}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-600">Phone</h3>
            <p className="text-gray-900 text-lg">{lead.phone || 'N/A'}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-600">Email</h3>
            <p className="text-gray-900 text-lg">{lead?.email || 'N/A'}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-600">Pan No</h3>
            <p className="text-gray-900 text-lg">{lead?.pan_no || 'N/A'}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-600">Gender</h3>
            <p className="text-gray-900 text-lg">{lead?.gender || 'N/A'}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-600">Monthly Income</h3>
            <p className="text-gray-900 text-lg">{lead.monthly_income || 'N/A'}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-600">Loan Amount</h3>
            <p className="text-gray-900 text-lg">{lead?.loan_amount || 'N/A'}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-600">Loan Purpose</h3>
            <p className="text-gray-900 text-lg">{lead?.loan_purpose || 'N/A'}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-600">Pincode</h3>
            <p className="text-gray-900 text-lg">{lead?.pincode || 'N/A'}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-600">Profile</h3>
            <p className="text-gray-900 text-lg">{lead?.profile || 'N/A'}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-600">UTM Source</h3>
            <p className="text-gray-900 text-lg">{lead.utm_source || 'N/A'}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-600">UTM Medium</h3>
            <p className="text-gray-900 text-lg">{lead.utm_medium || 'N/A'}</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Lender Response</h2>
          <div className="bg-gray-800 text-white p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre>{JSON.stringify(lead.lender_response, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferLeadDetail;