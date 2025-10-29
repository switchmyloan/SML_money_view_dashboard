import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { getLeads } from "../api-services/Modules/Leads";

const Home = () => {
  const navigate = useNavigate();
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTotalLeads = async () => {
    try {
      setLoading(true);
      const response = await getLeads(1, 1, ""); // fetch first page
      console.log("API response:", response.data.data); // check structure

    if (response?.data?.success) {
  const total = Array.isArray(response?.data?.data)
    ? response.data.data.length
    : 0; // if it's not an array, default to 0

  console.log("Total leads fetched:", total);
  setTotalLeads(total);
}else {
        console.error("Error fetching leads count");
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalLeads();
  }, []);

  return (
    <div className="p-6 flex-1 overflow-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Grid container for future multiple cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Leads Card */}
        <div
          onClick={() => navigate("/leads")}
          className="cursor-pointer flex items-center justify-between p-6 border rounded-2xl shadow-sm hover:shadow-md transition bg-blue-50 border-blue-200"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Total Leads</h2>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? "..." : totalLeads}
            </p>
          </div>
          <div className="p-3 bg-white rounded-full shadow-sm">
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
