import { useEffect, useState } from 'react';
import { MessageSquare, Save, Clock } from 'lucide-react';
import {
  getLeadFeedback, saveLeadFeedback,
  getShortLeadFeedback, saveShortLeadFeedback,
} from '../../api-services/Modules/Leads';
import { useAuth } from '../../custom-hooks/useAuth';
import ToastNotification from '../Notification/ToastNotification';

// Call-center dispositions shown in the dropdown. Edit this list to change the
// options — values are stored verbatim, so keep them stable for reporting.
// Exported so the list-page "Feedback" filters offer the same options.
export const FEEDBACK_STATUSES = [
  'Not Connected',
  'Interested',
  'Not Interested',
  'Call Back Later',
  'Wrong Number',
  'Switched Off / Not Reachable',
  'Language Barrier',
  'Documents Pending',
  'Already Availed Loan',
  'Not Eligible',
  'Converted / Disbursed',
];

const formatDateTime = (v) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

// A per-lead feedback card. Keyed by phone — the same record is shown/edited
// across the three modules of a ticket (backend normalizes the phone to its last
// 10 digits, so format differences don't matter). `scope` selects which table is
// used: 'high' → lead_feedback, 'short' → short_feedback (kept separate).
const LeadFeedback = ({ phone, scope = 'high' }) => {
  const { user } = useAuth();
  const fetchFeedback = scope === 'short' ? getShortLeadFeedback : getLeadFeedback;
  const persistFeedback = scope === 'short' ? saveShortLeadFeedback : saveLeadFeedback;
  const [status, setStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [initial, setInitial] = useState({ status: '', remark: '' });
  const [meta, setMeta] = useState(null); // { updated_by, updatedAt }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!phone) return;
    let cancelled = false;
    setLoading(true);
    fetchFeedback(phone)
      .then((res) => {
        if (cancelled) return;
        const row = res?.data?.data;
        if (row) {
          setStatus(row.status || '');
          setRemark(row.remark || '');
          setInitial({ status: row.status || '', remark: row.remark || '' });
          setMeta({ updated_by: row.updated_by, updatedAt: row.updatedAt });
        } else {
          setStatus(''); setRemark(''); setInitial({ status: '', remark: '' }); setMeta(null);
        }
      })
      .catch(() => { /* table may not exist yet — start with an empty form */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [phone, scope]);

  const dirty = status !== initial.status || remark !== initial.remark;

  const handleSave = async () => {
    if (!phone) { ToastNotification.error('No phone number for this lead'); return; }
    setSaving(true);
    try {
      const res = await persistFeedback({
        phone,
        status,
        remark,
        updatedBy: user?.name || user?.email || 'CMS user',
      });
      if (res?.data?.success) {
        const row = res.data.data;
        ToastNotification.success('Feedback saved');
        setInitial({ status, remark });
        if (row) setMeta({ updated_by: row.updated_by, updatedAt: row.updatedAt });
      } else {
        ToastNotification.error('Could not save feedback');
      }
    } catch (err) {
      ToastNotification.error(err?.response?.data?.message || 'Could not save feedback');
    } finally {
      setSaving(false);
    }
  };

  const updatedLabel = formatDateTime(meta?.updatedAt);

  return (
    <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="grid place-items-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600">
          <MessageSquare size={16} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800 tracking-tight">Call Center Feedback</h3>
          <p className="text-[11px] text-gray-400">Update the disposition for this lead</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={loading || saving}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 disabled:bg-gray-50"
          >
            <option value="">— Select status —</option>
            {FEEDBACK_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Remark</label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            disabled={loading || saving}
            rows={2}
            placeholder="Add a note about the call…"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 disabled:bg-gray-50 resize-y"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
          {updatedLabel ? (
            <><Clock size={12} /> Last updated {meta?.updated_by ? `by ${meta.updated_by} ` : ''}on {updatedLabel}</>
          ) : (loading ? 'Loading…' : 'No feedback recorded yet')}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading || !dirty}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-sm hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={15} /> {saving ? 'Saving…' : 'Save Feedback'}
        </button>
      </div>
    </div>
  );
};

export default LeadFeedback;
