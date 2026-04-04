
import { useLocation, useNavigate } from 'react-router-dom';

const DraftLeadsNewDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lead } = location.state || {};

  if (!lead) {
    return (
      <div className="p-10 border border-red-300 bg-red-50 rounded-lg">
        <h1 className="text-2xl font-bold text-red-800 mb-2">Data Loading Error!</h1>
        <p className="text-red-700">Lead data could not be found. Please go back and select a lead.</p>
        <button onClick={() => navigate(-1)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Go Back</button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mt-4 p-4 rounded-lg shadow-sm bg-white">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Draft Lead Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-12">
          <div>
            <p className="text-sm font-medium text-gray-700">Full Name:</p>
            <p className="text-gray-700 font-medium">{lead.fullname || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">First Name:</p>
            <p className="text-gray-700 font-medium">{lead.firstName || lead.first_name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Last Name:</p>
            <p className="text-gray-700 font-medium">{lead.lastName || lead.last_name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Phone:</p>
            <p className="text-gray-700 font-medium">{lead.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Email:</p>
            <p className="text-gray-700 font-medium">{lead.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Gender:</p>
            <p className="text-gray-700 font-medium">{lead.gender || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Date of Birth:</p>
            <p className="text-gray-700 font-medium">{lead.dob || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">PAN Number:</p>
            <p className="text-gray-700 font-medium">{lead.panNumber || lead.pan_number || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Pincode:</p>
            <p className="text-gray-700 font-medium">{lead.pincode || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Profession:</p>
            <p className="text-gray-700 font-medium">{lead.profession || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Salary:</p>
            <p className="text-gray-700 font-medium">{lead.salary ? `₹ ${Number(lead.salary).toLocaleString('en-IN')}` : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Loan Amount:</p>
            <p className="text-gray-700 font-medium">{lead.loanAmount || lead.loan_amount ? `₹ ${Number(lead.loanAmount || lead.loan_amount).toLocaleString('en-IN')}` : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">IP Address:</p>
            <p className="text-gray-700 font-medium">{lead.ipAddress || lead.ip_address || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Session ID:</p>
            <p className="text-gray-700 font-medium">{lead.sessionId || lead.session_id || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">UTM Source:</p>
            <p className="text-gray-700 font-medium">{lead.utm_source || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">UTM Medium:</p>
            <p className="text-gray-700 font-medium">{lead.utm_medium || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">UTM Campaign:</p>
            <p className="text-gray-700 font-medium">{lead.utm_campaign || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">UTM Content:</p>
            <p className="text-gray-700 font-medium">{lead.utm_content || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Created At:</p>
            <p className="text-gray-700 font-medium">{lead.createdAt || lead.created_at ? new Date(lead.createdAt || lead.created_at).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftLeadsNewDetail;
