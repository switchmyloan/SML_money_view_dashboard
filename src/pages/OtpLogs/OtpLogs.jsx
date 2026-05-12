import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Toaster } from "react-hot-toast";
import {
  RefreshCw, Search, Smartphone, ShieldCheck, AlertTriangle, Clock, Send,
  ChevronRight, ChevronDown, FileDown, Eye, X,
} from "lucide-react";
import ToastNotification from "../../components/Notification/ToastNotification";
import { getOtpLogs } from "../../api-services/Modules/Leads";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "SENT", label: "Sent" },
  { value: "VERIFIED", label: "Verified" },
  { value: "FAILED", label: "Failed" },
  { value: "EXPIRED", label: "Expired" },
];

const STATUS_BADGE = {
  SENT: "bg-blue-100 text-blue-700",
  VERIFIED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-200 text-gray-700",
};

const SUMMARY_CARDS = [
  { key: "total", label: "Total", icon: Send, color: "text-indigo-600 bg-indigo-50" },
  { key: "SENT", label: "Sent", icon: Smartphone, color: "text-blue-600 bg-blue-50" },
  { key: "VERIFIED", label: "Verified", icon: ShieldCheck, color: "text-green-600 bg-green-50" },
  { key: "FAILED", label: "Failed", icon: AlertTriangle, color: "text-red-600 bg-red-50" },
  { key: "EXPIRED", label: "Expired", icon: Clock, color: "text-gray-600 bg-gray-100" },
];

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const truncate = (value, n = 60) => {
  if (!value) return "-";
  const s = String(value);
  return s.length > n ? `${s.slice(0, n)}…` : s;
};

const formatLocation = (geo) => {
  if (!geo || typeof geo !== "object") return null;
  const parts = [geo.city, geo.region, geo.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
};

const OtpLogs = () => {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ total: 0, SENT: 0, VERIFIED: 0, FAILED: 0, EXPIRED: 0 });
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(() => new Set());
  const [filtersModal, setFiltersModal] = useState(null);

  const [query, setQuery] = useState({
    perPage: 10,
    currentPage: 1,
    search: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOtpLogs({
        perPage: query.perPage,
        currentPage: query.currentPage,
        search: query.search,
        status: query.status || undefined,
        fromDate: query.fromDate || undefined,
        toDate: query.toDate || undefined,
      });

      const payload = res?.data;
      if (payload?.success) {
        setRows(payload.data || []);
        setPagination(payload.pagination || { total: 0, totalPages: 0 });
        setSummary({
          total: payload.summary?.total || 0,
          SENT: payload.summary?.SENT || 0,
          VERIFIED: payload.summary?.VERIFIED || 0,
          FAILED: payload.summary?.FAILED || 0,
          EXPIRED: payload.summary?.EXPIRED || 0,
        });
      } else {
        ToastNotification.error(payload?.message || "Failed to load OTP logs.");
      }
    } catch (err) {
      ToastNotification.error(err?.response?.data?.message || "Failed to load OTP logs.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const debouncedSearch = useMemo(
    () => debounce((v) => setQuery((p) => ({ ...p, search: v, currentPage: 1 })), 300),
    [],
  );

  const handleStatusChange = (e) => {
    setQuery((p) => ({ ...p, status: e.target.value, currentPage: 1 }));
  };

  const handleDateChange = (e) => {
    setQuery((p) => ({ ...p, [e.target.name]: e.target.value, currentPage: 1 }));
  };

  const handlePerPage = (e) => {
    setQuery((p) => ({ ...p, perPage: Number(e.target.value), currentPage: 1 }));
  };

  const goToPage = (page) => {
    if (page < 1 || page > (pagination.totalPages || 1)) return;
    setQuery((p) => ({ ...p, currentPage: page }));
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6">
      <Toaster />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">OTP Logs</h1>
          <p className="text-sm text-gray-500">Audit trail of all OTPs sent for verification, with linked CSV export details.</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg shadow hover:bg-purple-700 disabled:bg-gray-400"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {SUMMARY_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <p className="mt-3 text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{summary[key] || 0}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search by mobile number"
              defaultValue={query.search}
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={query.status}
            onChange={handleStatusChange}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <input
            type="date"
            name="fromDate"
            value={query.fromDate}
            onChange={handleDateChange}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="date"
            name="toDate"
            value={query.toDate}
            onChange={handleDateChange}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-2 py-3 w-8"></th>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Mobile</th>
                <th className="px-4 py-3 text-left">OTP</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Purpose</th>
                <th className="px-4 py-3 text-left">Sent At</th>
                <th className="px-4 py-3 text-left">Verified At</th>
                <th className="px-4 py-3 text-left">Expires At</th>
                <th className="px-4 py-3 text-left">IP</th>
                <th className="px-4 py-3 text-left">Exports</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-gray-500">Loading...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-gray-500">No OTP logs found.</td>
                </tr>
              ) : (
                rows.map((r, i) => {
                  const exports = Array.isArray(r.exports) ? r.exports : [];
                  const hasExports = exports.length > 0;
                  const isOpen = expanded.has(r.id);
                  return (
                    <Fragment key={r.id}>
                      <tr className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-2 py-3 text-gray-400">
                          {hasExports ? (
                            <button
                              onClick={() => toggleExpand(r.id)}
                              className="p-1 rounded hover:bg-gray-200"
                              aria-label={isOpen ? "Collapse" : "Expand"}
                            >
                              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {(query.currentPage - 1) * query.perPage + i + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{r.mobileNumber || "-"}</td>
                        <td className="px-4 py-3 font-mono text-gray-700">{r.otp || "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[r.status] || "bg-gray-100 text-gray-700"}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 capitalize">{r.purpose || "-"}</td>
                        <td className="px-4 py-3 text-gray-700">{formatDateTime(r.createdAt)}</td>
                        <td className="px-4 py-3 text-gray-700">{formatDateTime(r.verifiedAt)}</td>
                        <td className="px-4 py-3 text-gray-700">{formatDateTime(r.expiresAt)}</td>
                        <td className="px-4 py-3 text-gray-500">{r.ipAddress || "-"}</td>
                        <td className="px-4 py-3">
                          {hasExports ? (
                            <button
                              onClick={() => toggleExpand(r.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200"
                            >
                              <FileDown size={14} /> {exports.length} file{exports.length > 1 ? "s" : ""}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                      {hasExports && isOpen && (
                        <tr className="bg-purple-50/30">
                          <td colSpan={11} className="px-6 py-4">
                            <div className="space-y-3">
                              <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                CSV Exports authorized by this OTP
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs bg-white border border-gray-200 rounded-lg">
                                  <thead className="bg-gray-100 text-gray-600">
                                    <tr>
                                      <th className="px-3 py-2 text-left">When</th>
                                      <th className="px-3 py-2 text-left">Export Type</th>
                                      <th className="px-3 py-2 text-left">File Name</th>
                                      <th className="px-3 py-2 text-right">Records</th>
                                      <th className="px-3 py-2 text-left">Filters</th>
                                      <th className="px-3 py-2 text-left">IP / Location</th>
                                      <th className="px-3 py-2 text-left">Device</th>
                                      <th className="px-3 py-2 text-left">Endpoint</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {exports.map((e) => {
                                      const loc = formatLocation(e.geo);
                                      return (
                                        <tr key={e.id} className="border-t border-gray-100">
                                          <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{formatDateTime(e.createdAt)}</td>
                                          <td className="px-3 py-2">
                                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                                              {e.exportType || "-"}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2 font-mono text-gray-700" title={e.fileName || ""}>
                                            {truncate(e.fileName, 40)}
                                          </td>
                                          <td className="px-3 py-2 text-right font-semibold text-gray-800">{e.recordCount ?? 0}</td>
                                          <td className="px-3 py-2">
                                            {e.filters ? (
                                              <button
                                                onClick={() => setFiltersModal(e)}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 rounded"
                                              >
                                                <Eye size={12} /> View
                                              </button>
                                            ) : (
                                              <span className="text-gray-400">-</span>
                                            )}
                                          </td>
                                          <td className="px-3 py-2">
                                            <div className="font-mono text-gray-700">{e.ipAddress || "-"}</div>
                                            <div className="text-gray-500">{loc || <span className="text-gray-400">unknown</span>}</div>
                                          </td>
                                          <td className="px-3 py-2">
                                            <div className="text-gray-700">{e.device || "-"}</div>
                                            <div className="text-gray-500">{[e.browser, e.os].filter(Boolean).join(" · ") || "-"}</div>
                                          </td>
                                          <td className="px-3 py-2 font-mono text-gray-600" title={e.endpoint || ""}>
                                            {truncate(e.endpoint, 28)}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-t border-gray-100 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <span>Rows per page:</span>
            <select
              value={query.perPage}
              onChange={handlePerPage}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="ml-3">
              {pagination.total
                ? `${(query.currentPage - 1) * query.perPage + 1}–${Math.min(query.currentPage * query.perPage, pagination.total)} of ${pagination.total}`
                : "0 of 0"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={query.currentPage <= 1 || loading}
              onClick={() => goToPage(query.currentPage - 1)}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-gray-600">
              Page {query.currentPage} of {pagination.totalPages || 1}
            </span>
            <button
              disabled={query.currentPage >= (pagination.totalPages || 1) || loading}
              onClick={() => goToPage(query.currentPage + 1)}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {filtersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="text-lg font-bold text-gray-800">Filters used for export #{filtersModal.id}</h3>
              <button onClick={() => setFiltersModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-800 overflow-auto max-h-96">
                {JSON.stringify(filtersModal.filters, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtpLogs;
