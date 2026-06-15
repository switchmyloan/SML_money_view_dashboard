import { useEffect, useState, useCallback } from 'react';
import { X, Download, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { getStageLeads, exportStageLeads } from '../../api-services/Modules/Leads';
import ToastNotification from '../Notification/ToastNotification';

const fmtDateTime = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const inr = (n) => (n || n === 0) ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

// Drill-down list of the customers behind one funnel stage. `params` carries the
// funnel's current scope/agent/band/date so the list matches the clicked card.
const StageLeadsModal = ({ stage, label, params, canExport, onClose }) => {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [kind, setKind] = useState('feedback');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { setPage(1); }, [stage]);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStageLeads({ ...params, stage, page, perPage: 50 });
      if (res?.data?.success) {
        setRows(res.data.data || []);
        setPagination(res.data.pagination || { total: 0, totalPages: 0 });
        setKind(res.data.kind || 'feedback');
      } else {
        ToastNotification.error('Could not load the list');
      }
    } catch (e) {
      ToastNotification.error(e?.response?.data?.message || 'Could not load the list');
    } finally {
      setLoading(false);
    }
    // params is a fresh object each render but its values are stable per open; stage/page drive refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, page]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportStageLeads({ ...params, stage });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `followup_${stage}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      ToastNotification.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const isLead = kind === 'lead';
  const total = pagination.total || 0;
  const totalPages = pagination.totalPages || 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div>
            <h3 className="text-base font-bold text-gray-900">{label}</h3>
            <p className="text-[11px] text-gray-400">{total.toLocaleString('en-IN')} customer{total === 1 ? '' : 's'}</p>
          </div>
          <div className="flex items-center gap-2">
            {canExport && (
              <button
                onClick={handleExport}
                disabled={exporting || total === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <Download size={13} /> {exporting ? 'Exporting…' : 'Export CSV'}
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition" aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-gray-50/95 backdrop-blur">
              <tr className="text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-5 py-2.5 font-semibold">Customer</th>
                <th className="px-3 py-2.5 font-semibold">Ticket</th>
                {isLead ? (
                  <>
                    <th className="px-3 py-2.5 font-semibold text-right">Monthly Income</th>
                    <th className="px-3 py-2.5 font-semibold text-right">Loan Amount</th>
                    <th className="px-3 py-2.5 font-semibold">Created</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-2.5 font-semibold">Disposition</th>
                    <th className="px-3 py-2.5 font-semibold">Updated By</th>
                    <th className="px-3 py-2.5 font-semibold">Last Updated</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">No customers in this stage.</td></tr>
              ) : rows.map((r, i) => (
                <tr key={`${r.scope}-${r.phone}-${i}`} className="border-b border-gray-50 hover:bg-purple-50/20 transition">
                  <td className="px-5 py-2.5">
                    <p className="text-[13px] font-semibold text-gray-800">{r.name || 'Unknown'}</p>
                    <a href={`tel:${r.phone}`} className="text-[11px] text-purple-600 inline-flex items-center gap-1 hover:underline"><Phone size={10} /> {r.phone}</a>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[9px] font-bold uppercase">{r.scope === 'short' ? 'Short' : 'High'}</span>
                  </td>
                  {isLead ? (
                    <>
                      <td className="px-3 py-2.5 text-right text-[12px] text-gray-700">{inr(r.monthly_income)}</td>
                      <td className="px-3 py-2.5 text-right text-[12px] text-gray-700">{inr(r.loan_amount)}</td>
                      <td className="px-3 py-2.5 text-[11px] text-gray-500">{fmtDateTime(r.activity_at)}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2.5">{r.status ? <span className="text-[12px] text-gray-700">{r.status}</span> : <span className="text-[11px] text-gray-400 italic">No disposition</span>}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-600">{r.updated_by || '—'}</td>
                      <td className="px-3 py-2.5 text-[11px] text-gray-500">{fmtDateTime(r.activity_at)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-[12px] text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={14} /> Prev
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StageLeadsModal;
