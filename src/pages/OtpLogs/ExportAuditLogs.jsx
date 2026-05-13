import { useCallback, useEffect, useMemo, useState } from "react";
import { Toaster } from "react-hot-toast";
import { RefreshCw, Search, FileDown, Eye, X, MapPin, Monitor } from "lucide-react";
import ToastNotification from "../../components/Notification/ToastNotification";
import { getExportAuditLogs } from "../../api-services/Modules/Leads";

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

const ExportAuditLogs = () => {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [detailsModal, setDetailsModal] = useState(null);

  const [query, setQuery] = useState({
    perPage: 10,
    currentPage: 1,
    search: "",
    exportType: "",
    fromDate: "",
    toDate: "",
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getExportAuditLogs({
        perPage: query.perPage,
        currentPage: query.currentPage,
        search: query.search,
        exportType: query.exportType || undefined,
        fromDate: query.fromDate || undefined,
        toDate: query.toDate || undefined,
      });
      const payload = res?.data;
      if (payload?.success) {
        setRows(payload.data || []);
        setPagination(payload.pagination || { total: 0, totalPages: 0 });
      } else {
        ToastNotification.error(payload?.message || "Failed to load export logs.");
      }
    } catch (err) {
      ToastNotification.error(err?.response?.data?.message || "Failed to load export logs.");
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

  const handleDateChange = (e) =>
    setQuery((p) => ({ ...p, [e.target.name]: e.target.value, currentPage: 1 }));

  const handleExportType = (e) =>
    setQuery((p) => ({ ...p, exportType: e.target.value, currentPage: 1 }));

  const handlePerPage = (e) =>
    setQuery((p) => ({ ...p, perPage: Number(e.target.value), currentPage: 1 }));

  const goToPage = (page) => {
    if (page < 1 || page > (pagination.totalPages || 1)) return;
    setQuery((p) => ({ ...p, currentPage: page }));
  };

  return (
    <div className="p-6 space-y-6">
      <Toaster />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileDown className="text-purple-600" /> Export Audit Logs
          </h1>
          <p className="text-sm text-gray-500">
            Every CSV export across the platform — kisne, kab, konsi file, kitna data, kahaan se.
          </p>
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

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search mobile / file / IP / endpoint"
              defaultValue={query.search}
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <input
            type="text"
            placeholder="Export type (e.g. user-track)"
            value={query.exportType}
            onChange={handleExportType}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

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
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">When</th>
                <th className="px-4 py-3 text-left">Mobile</th>
                <th className="px-4 py-3 text-left">Export Type</th>
                <th className="px-4 py-3 text-left">File</th>
                <th className="px-4 py-3 text-right">Records</th>
                <th className="px-4 py-3 text-left">IP / Location</th>
                <th className="px-4 py-3 text-left">Device</th>
                <th className="px-4 py-3 text-left">OTP</th>
                <th className="px-4 py-3 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">Loading...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">No export logs found.</td>
                </tr>
              ) : (
                rows.map((r, i) => {
                  const location = formatLocation(r.geo);
                  return (
                    <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">
                        {(query.currentPage - 1) * query.perPage + i + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-xs whitespace-nowrap">
                        {formatDateTime(r.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {r.mobileNumber || r.otpSession?.mobileNumber || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700">
                          {r.exportType || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700" title={r.fileName || ""}>
                        {truncate(r.fileName, 36)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{r.recordCount ?? 0}</td>
                      <td className="px-4 py-3 text-xs">
                        <div className="font-mono text-gray-700">{r.ipAddress || "-"}</div>
                        <div className="flex items-center gap-1 text-gray-500">
                          {location ? (
                            <>
                              <MapPin size={11} className="text-purple-500" /> {location}
                            </>
                          ) : (
                            <span className="text-gray-400">unknown</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" title={r.userAgent || ""}>
                        <div className="flex items-center gap-1 text-gray-700">
                          <Monitor size={11} /> {r.device || "-"}
                        </div>
                        <div className="text-gray-500">
                          {[r.browser, r.os].filter(Boolean).join(" · ") || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {r.otpSession ? (
                          <div>
                            <div className="font-medium text-green-700">#{r.otpSession.id}</div>
                            <div className="text-gray-500">{r.otpSession.status}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">direct</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDetailsModal(r)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
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

      {detailsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-800">Export #{detailsModal.id} — full audit</h3>
              <button onClick={() => setDetailsModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <DetailRow label="When" value={formatDateTime(detailsModal.createdAt)} />
              <DetailRow label="Export Type" value={detailsModal.exportType} />
              <DetailRow label="File Name" value={detailsModal.fileName} mono />
              <DetailRow label="Records Exported" value={detailsModal.recordCount ?? 0} />
              <DetailRow
                label="Triggered By"
                value={detailsModal.mobileNumber || detailsModal.otpSession?.mobileNumber || "Direct (no OTP)"}
              />
              <DetailRow label="OTP Session" value={detailsModal.otpSession ? `#${detailsModal.otpSession.id} (${detailsModal.otpSession.status})` : "—"} />
              <DetailRow label="IP Address" value={detailsModal.ipAddress} mono />
              <DetailRow label="Location" value={formatLocation(detailsModal.geo) || "unknown"} />
              <DetailRow label="Device" value={detailsModal.device} />
              <DetailRow label="Browser" value={detailsModal.browser} />
              <DetailRow label="OS" value={detailsModal.os} />
              <DetailRow label="Endpoint" value={detailsModal.endpoint} mono />
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Full User Agent</div>
                <div className="text-xs font-mono text-gray-700 bg-gray-50 border border-gray-200 rounded p-2 break-all">
                  {detailsModal.userAgent || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Filters used</div>
                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-800 overflow-auto max-h-64">
                  {JSON.stringify(detailsModal.filters, null, 2) || "—"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value, mono }) => (
  <div className="grid grid-cols-3 gap-3 py-1 border-b border-gray-50 last:border-0">
    <div className="text-xs font-semibold text-gray-500 uppercase">{label}</div>
    <div className={`col-span-2 text-gray-800 ${mono ? "font-mono text-xs break-all" : ""}`}>
      {value || <span className="text-gray-400">—</span>}
    </div>
  </div>
);

export default ExportAuditLogs;
