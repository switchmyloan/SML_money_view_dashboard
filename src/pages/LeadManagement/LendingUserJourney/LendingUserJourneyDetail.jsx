import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  FileText, ShieldCheck, Sparkles, MousePointerClick,
  ArrowLeft, Phone, Mail, Clock, MapPin, Hash, Globe,
  ChevronDown, ChevronRight, User, Briefcase, CalendarDays,
  IndianRupee, CheckCircle2, XCircle, AlertTriangle, Loader2,
  Copy,
} from 'lucide-react';

import { getLendingUserJourneyDetail } from '../../../api-services/Modules/Leads';
import ToastNotification from '../../../components/Notification/ToastNotification';

// =========================================================================
// Formatting helpers
// =========================================================================
const formatDateTime = (v) => {
  if (!v) return 'N/A';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
};

const formatINR = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
};

const titleCase = (s) => (s || '').split(/\s+/).filter(Boolean).map(w => w[0]?.toUpperCase() + w.slice(1).toLowerCase()).join(' ');

// Duration between two timestamps ("5m 12s ago" style).
const durationBetween = (from, to) => {
  if (!from || !to) return null;
  const diff = Math.abs(new Date(to) - new Date(from)) / 1000;
  if (diff < 60) return `${Math.round(diff)}s`;
  if (diff < 3600) return `${Math.round(diff / 60)}m`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h`;
  return `${Math.round(diff / 86400)}d`;
};

// Classify a single lender's response message into success/dedupe/reject/pending.
// Kept in sync with the backend's classifyLenderResponse (offerLeads.services.js).
const classifyLenderMessage = (raw) => {
  if (raw === null || raw === undefined) return 'pending';
  const rawStr = String(raw);
  if (rawStr === 'success') return 'success';
  const m = rawStr.toLowerCase().trim();
  if (!m) return 'pending';
  if (m.includes('isrepeat = false') && m.includes('iseligible = true')) return 'success';
  if (m.includes('duplicate') || m.includes('dedupe') || m.includes('deduped') || m.includes('isrepeat = true')) return 'dedupe';
  if (m.includes('reject')) return 'reject';
  if (m.includes('success')) return 'success';
  return 'other';
};

const STATUS_STYLES = {
  success: { Icon: CheckCircle2,   bg: 'bg-green-100',  text: 'text-green-700',  label: 'Success' },
  reject:  { Icon: XCircle,        bg: 'bg-red-100',    text: 'text-red-700',    label: 'Rejected' },
  dedupe:  { Icon: AlertTriangle,  bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Duplicate' },
  pending: { Icon: Loader2,        bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Pending' },
  other:   { Icon: AlertTriangle,  bg: 'bg-gray-100',   text: 'text-gray-700',   label: 'Other' },
};

const copyToClipboard = async (text, label = 'Copied') => {
  try {
    await navigator.clipboard.writeText(String(text));
    ToastNotification.success(label);
  } catch {
    ToastNotification.error('Copy fail');
  }
};

// =========================================================================
// Tiny re-usable bits
// =========================================================================
const Field = ({ label, value, Icon, copyable }) => (
  <div className="min-w-0">
    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
      {Icon && <Icon size={11} />} {label}
    </p>
    <div className="flex items-center gap-1.5 mt-0.5">
      <p className="text-sm text-gray-800 font-medium break-all truncate">
        {value !== undefined && value !== null && value !== '' ? value : <span className="text-gray-400 italic">N/A</span>}
      </p>
      {copyable && value && (
        <button
          type="button"
          onClick={() => copyToClipboard(value, `${label} copied`)}
          className="text-gray-400 hover:text-gray-700 shrink-0"
        >
          <Copy size={12} />
        </button>
      )}
    </div>
  </div>
);

const StatusPill = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.other;
  const { Icon } = style;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      <Icon size={12} /> {style.label}
    </span>
  );
};

const Section = ({ title, subtitle, Icon, accent = 'purple', defaultOpen = true, right, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  const accentMap = {
    gray:   { ring: 'ring-gray-200',   iconBg: 'bg-gray-100',   iconText: 'text-gray-600' },
    amber:  { ring: 'ring-amber-200',  iconBg: 'bg-amber-100',  iconText: 'text-amber-600' },
    purple: { ring: 'ring-purple-200', iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
    green:  { ring: 'ring-green-200',  iconBg: 'bg-green-100',  iconText: 'text-green-600' },
    blue:   { ring: 'ring-blue-200',   iconBg: 'bg-blue-100',   iconText: 'text-blue-600' },
  }[accent];

  return (
    <section className={`bg-white rounded-lg shadow-sm border border-gray-200 mb-4 ring-1 ${accentMap.ring}`}>
      <header
        className="flex items-center justify-between px-5 py-3 cursor-pointer select-none"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentMap.iconBg} ${accentMap.iconText}`}>
            {Icon && <Icon size={18} />}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {right}
          {open ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
        </div>
      </header>
      {open && <div className="px-5 pb-5 border-t border-gray-100">{children}</div>}
    </section>
  );
};

// =========================================================================
// Journey progress bar (4 stages — visual funnel at top)
// =========================================================================
const JourneyProgress = ({ milestones }) => {
  const stages = [
    { key: 'drafted_at',     label: '1. Landed',           Icon: FileText,          at: milestones.drafted_at },
    { key: 'otp_verified',   label: '2. OTP Verified',     Icon: ShieldCheck,       at: milestones.otp_verified_at },
    { key: 'form_submitted', label: '3. Form Submitted',   Icon: Sparkles,          at: milestones.submitted_at },
    { key: 'lender_clicked', label: '4. Clicked Lender',   Icon: MousePointerClick, at: milestones.clicked_at },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Journey Progress</p>
      <div className="flex items-stretch">
        {stages.map((s, i) => {
          const done = !!s.at;
          const prev = stages[i - 1];
          const gap = prev?.at && s.at ? durationBetween(prev.at, s.at) : null;
          return (
            <div key={s.key} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition ${
                  done ? 'bg-green-500 border-green-500 text-white shadow-md' : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <s.Icon size={18} />
                </div>
                <p className={`mt-2 text-xs font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 text-center min-h-[14px]">
                  {done ? formatDateTime(s.at) : 'Not yet'}
                </p>
              </div>
              {i < stages.length - 1 && (
                <div className="flex-1 flex flex-col items-center justify-center relative -mt-8">
                  <div className={`h-1 w-full rounded ${stages[i + 1].at ? 'bg-green-500' : 'bg-gray-200'}`} />
                  {gap && stages[i + 1].at && (
                    <span className="absolute -top-3 text-[10px] text-gray-500 bg-white px-1">+{gap}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =========================================================================
// Compact "what was typed on the landing page" snapshot
// =========================================================================
const LandingSnapshot = ({ latestDraft }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
    <Field label="Full Name"   Icon={User}          value={latestDraft.fullname || `${latestDraft.firstName || latestDraft.first_name || ''} ${latestDraft.lastName || latestDraft.last_name || ''}`.trim() || null} />
    <Field label="PAN"         Icon={Hash}          value={latestDraft.panNumber || latestDraft.pan_number} copyable />
    <Field label="DOB"         Icon={CalendarDays}  value={latestDraft.dob} />
    <Field label="Profession"  Icon={Briefcase}     value={latestDraft.profession} />
    <Field label="Pincode"     Icon={MapPin}        value={latestDraft.pincode} />
    <Field label="Salary"      Icon={IndianRupee}   value={formatINR(latestDraft.salary)} />
    <Field label="Loan Amount" Icon={IndianRupee}   value={formatINR(latestDraft.loanAmount || latestDraft.loan_amount)} />
    <Field label="Gender"                           value={latestDraft.gender} />
    <Field label="UTM Source"  Icon={Globe}         value={latestDraft.utm_source} />
    <Field label="UTM Medium"                       value={latestDraft.utm_medium} />
    <Field label="UTM Campaign"                     value={latestDraft.utm_campaign} />
    <Field label="UTM Content"                      value={latestDraft.utm_content} />
    <Field label="Session ID"                       value={latestDraft.sessionId || latestDraft.session_id} copyable />
    <Field label="MRN"                              value={latestDraft.mrn} copyable />
    <Field label="IP Address"                       value={latestDraft.ipAddress || latestDraft.ip_address} />
  </div>
);

// =========================================================================
// Drafts timeline — shows each auto-save (esp. useful if user edited multiple times)
// =========================================================================
const DraftsList = ({ drafts }) => {
  if (!drafts?.length) return <p className="text-sm text-gray-500 pt-4">No drafts captured.</p>;
  return (
    <div className="pt-4">
      <p className="text-xs text-gray-500 mb-2">{drafts.length} draft snapshot{drafts.length === 1 ? '' : 's'} captured</p>
      <div className="divide-y divide-gray-100 border border-gray-100 rounded-md">
        {drafts.map((d, i) => (
          <div key={d.id} className="px-3 py-2 flex items-center justify-between text-sm">
            <div>
              <span className="font-medium text-gray-700">
                {i === 0 ? 'Draft #1 created' : `Draft #${i + 1}`}
              </span>
              <span className="text-gray-500 ml-2">
                {d.fullname || `${d.firstName || d.first_name || ''} ${d.lastName || d.last_name || ''}`.trim() || '—'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>Loan: {formatINR(d.loanAmount || d.loan_amount) || '—'}</span>
              <span>{formatDateTime(d.createdAt || d.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================================
// OTP Verification section — now driven by the `otpVerified` flag on the
// draft table (set by onOtpVerifiedController). No separate leads table query.
// =========================================================================
const OtpSection = ({ verifiedAt, phone }) => {
  if (!verifiedAt) {
    return (
      <p className="text-sm text-gray-500 pt-4">
        OTP has not been verified yet — user stopped at draft stage.
      </p>
    );
  }
  return (
    <div className="pt-4">
      <div className="border border-green-100 bg-green-50 rounded-md p-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
            </svg>
          </span>
          <p className="text-sm font-semibold text-green-800">OTP successfully verified</p>
        </div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Phone Number" value={phone} copyable />
          <Field label="Verified At"  value={formatDateTime(verifiedAt)} />
          <Field label="Source"       value="Cready Landing Page OTP Flow" />
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// Offers section — parses lender_response JSON to show each lender's verdict
// =========================================================================
const parseLenderResponse = (lr) => {
  if (!lr) return [];
  let obj = lr;
  if (typeof lr === 'string') { try { obj = JSON.parse(lr); } catch { return []; } }
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj)
    .filter(([k, v]) => v && typeof v === 'object' && k !== 'staticLenders' && k !== 'isSalaried')
    .map(([lenderName, payload]) => {
      const msg = payload?.message ?? payload?.data?.message ?? null;
      const offer = payload?.data?.resData?.data?.response?.offerObjects?.[0]?.loanAmount
        || payload?.offerAmount
        || null;
      return {
        lenderName,
        status: classifyLenderMessage(msg),
        message: msg,
        offerAmount: offer,
      };
    });
};

const OffersSection = ({ offers }) => {
  if (!offers?.length) {
    return (
      <p className="text-sm text-gray-500 pt-4">
        User did not submit Stage 2 form — offers were not fetched.
      </p>
    );
  }

  return (
    <div className="pt-4 space-y-4">
      {offers.map(o => {
        const lenderRows = parseLenderResponse(o.lender_response);
        const successCount = lenderRows.filter(r => r.status === 'success').length;

        return (
          <div key={o.id} className="border border-gray-100 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Offer Lead #{o.id} — Form submitted
                </p>
                <p className="text-[11px] text-gray-500">{lenderRows.length} lender responses • {successCount} success</p>
              </div>
              <span className="text-xs text-gray-500">{formatDateTime(o.createdAt)}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <Field label="Name"           value={`${o.first_name || ''} ${o.last_name || ''}`.trim() || o.name} />
              <Field label="Email"          value={o.email} copyable />
              <Field label="Gender"         value={o.gender} />
              <Field label="DOB"            value={o.dob} />
              <Field label="PAN"            value={o.pan_no} copyable />
              <Field label="Pincode"        value={o.pincode} />
              <Field label="Profile"        value={o.profile} />
              <Field label="Monthly Income" value={formatINR(o.monthly_income)} />
              <Field label="Loan Amount"    value={formatINR(o.loan_amount)} />
              <Field label="Loan Purpose"   value={o.loan_purpose} />
              <Field label="UTM Source"     value={o.utm_source} />
              <Field label="MRN"            value={o.mrn} copyable />
            </div>

            {lenderRows.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Lenders Shown To User</p>
                <div className="overflow-x-auto border border-gray-100 rounded-md">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase text-gray-500 bg-gray-50 border-b">
                        <th className="py-2 px-3">Lender</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Offer Amount</th>
                        <th className="py-2 px-3">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lenderRows.map(r => (
                        <tr key={r.lenderName} className="border-b last:border-none">
                          <td className="py-2 px-3 font-medium text-gray-800">{r.lenderName}</td>
                          <td className="py-2 px-3"><StatusPill status={r.status} /></td>
                          <td className="py-2 px-3 text-gray-700">{formatINR(r.offerAmount) || '—'}</td>
                          <td className="py-2 px-3 text-xs text-gray-500 max-w-md truncate" title={r.message || ''}>
                            {r.message || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// =========================================================================
// Lenders CLICKED section — each Apply-now click with timestamps
// =========================================================================
const LendersClickedSection = ({ lenders, offeredAt }) => {
  if (!lenders?.length) {
    return <p className="text-sm text-gray-500 pt-4">User did not click Apply on any lender.</p>;
  }
  return (
    <div className="pt-4">
      <div className="overflow-x-auto border border-gray-100 rounded-md">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase text-gray-500 bg-gray-50 border-b">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Lender</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">MRN</th>
              <th className="py-2 px-3">Clicked At</th>
              <th className="py-2 px-3">After Seeing Offers</th>
            </tr>
          </thead>
          <tbody>
            {lenders.map((l, i) => (
              <tr key={l.id} className="border-b last:border-none hover:bg-gray-50">
                <td className="py-2 px-3 text-gray-500">{i + 1}</td>
                <td className="py-2 px-3 font-medium text-gray-800">{l.lenderName || 'N/A'}</td>
                <td className="py-2 px-3"><StatusPill status={classifyLenderMessage(l.status)} /></td>
                <td className="py-2 px-3 text-xs text-gray-500">{l.mrn || '—'}</td>
                <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{formatDateTime(l.createdAt)}</td>
                <td className="py-2 px-3 text-gray-500">
                  {offeredAt ? `+${durationBetween(offeredAt, l.createdAt) || '—'}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =========================================================================
// Timeline (chronological, compact) — cross-table event feed
// =========================================================================
const EVENT_META = {
  draft_started:  { label: 'Landing Page Visit', Icon: FileText,          dot: 'bg-gray-400' },
  draft_updated:  { label: 'Draft Updated',      Icon: FileText,          dot: 'bg-gray-300' },
  otp_verified:   { label: 'OTP Verified',       Icon: ShieldCheck,       dot: 'bg-amber-500' },
  form_submitted: { label: 'Form Submitted',     Icon: Sparkles,          dot: 'bg-purple-500' },
  lender_clicked: { label: 'Clicked Lender',     Icon: MousePointerClick, dot: 'bg-green-500' },
};

const Timeline = ({ events }) => {
  if (!events?.length) return <p className="text-sm text-gray-500 pt-4">No events found.</p>;
  return (
    <div className="pt-4 relative pl-2">
      {events.map((ev, idx) => {
        const meta = EVENT_META[ev.event] || { label: ev.event, Icon: Clock, dot: 'bg-gray-400' };
        const { Icon } = meta;
        let summary = null;
        if (ev.event === 'lender_clicked') summary = `${ev.details?.lenderName || 'Unknown'} — ${ev.details?.status || 'clicked'}`;
        else if (ev.event === 'form_submitted') summary = `Loan ${formatINR(ev.details?.loan_amount) || '—'}  •  Income ${formatINR(ev.details?.monthly_income) || '—'}`;
        else if (ev.event === 'otp_verified') summary = formatDateTime(ev.at);
        else {
          const n = ev.details?.fullname || `${ev.details?.firstName || ev.details?.first_name || ''} ${ev.details?.lastName || ev.details?.last_name || ''}`.trim();
          summary = n || ev.details?.phone || '';
        }
        return (
          <div key={idx} className="flex gap-3 pb-5 last:pb-0 relative">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${meta.dot} ring-4 ring-white shadow`} />
              {idx < events.length - 1 && <div className="flex-1 w-px bg-gray-200 mt-1" />}
            </div>
            <div className="flex-1 -mt-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <Icon size={14} className="text-gray-500" />
                <p className="text-sm font-semibold text-gray-900">{meta.label}</p>
                <p className="text-[11px] text-gray-500">{formatDateTime(ev.at)}</p>
                <span className="text-[10px] uppercase tracking-wide text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{ev.source}</span>
              </div>
              {summary && <p className="text-xs text-gray-600 mt-0.5">{summary}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// =========================================================================
// Main page
// =========================================================================
const LendingUserJourneyDetail = () => {
  const { phone } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialRow = location.state?.row || null;
  const decodedPhone = phone ? decodeURIComponent(phone) : initialRow?.phone;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!decodedPhone) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getLendingUserJourneyDetail({ phone: decodedPhone });
        if (!cancelled) {
          if (res?.data?.success) setDetail(res.data.data);
          else ToastNotification.error('Failed to load journey');
        }
      } catch {
        if (!cancelled) ToastNotification.error('Failed to load journey');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [decodedPhone]);

  // Milestones (earliest event per stage) — drives progress bar + summary.
  // OTP verification now comes directly from the draft table's otpVerified flag
  // (set by onOtpVerifiedController when the user successfully verifies OTP).
  const milestones = useMemo(() => ({
    drafted_at:       detail?.drafts?.[0]?.createdAt || detail?.drafts?.[0]?.created_at || initialRow?.drafted_at || null,
    otp_verified_at:  detail?.otpVerifiedAt || initialRow?.otp_verified_at || null,
    submitted_at:     detail?.offers?.[0]?.createdAt || initialRow?.submitted_at || null,
    clicked_at:       detail?.lenders?.[0]?.createdAt || initialRow?.clicked_at || null,
  }), [detail, initialRow]);

  if (!decodedPhone) {
    return (
      <div className="p-10 border border-red-300 bg-red-50 rounded-lg">
        <h1 className="text-2xl font-bold text-red-800 mb-2">Phone Missing</h1>
        <p className="text-red-700">No phone number was provided.</p>
        <button onClick={() => navigate(-1)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Go Back</button>
      </div>
    );
  }

  const latestDraft = detail?.drafts?.[detail.drafts.length - 1] || initialRow || {};
  const counts = detail?.counts || { drafts: 0, offers: 0, lenders: 0, otpVerified: false };

  const name = titleCase(
    initialRow?.name
    || latestDraft.fullname
    || `${latestDraft.firstName || latestDraft.first_name || ''} ${latestDraft.lastName || latestDraft.last_name || ''}`.trim()
    || 'Unknown User'
  );

  // Final stage reached — drives the header pill.
  const stageLabel = milestones.clicked_at      ? { text: 'Clicked Lender',  bg: 'bg-green-100',  tx: 'text-green-700' }
                   : milestones.submitted_at    ? { text: 'Form Submitted',  bg: 'bg-purple-100', tx: 'text-purple-700' }
                   : milestones.otp_verified_at ? { text: 'OTP Verified',    bg: 'bg-amber-100',  tx: 'text-amber-700' }
                   : { text: 'Only Drafted', bg: 'bg-gray-100', tx: 'text-gray-700' };

  return (
    <div className="w-full">
      {/* Back + title */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft size={16} /> Back to list
      </button>

      {/* Header card */}
      <div className="p-5 rounded-lg shadow-sm bg-white border border-gray-200 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${stageLabel.bg} ${stageLabel.tx}`}>
                Reached: {stageLabel.text}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-4 flex-wrap text-sm text-gray-600">
              <span className="inline-flex items-center gap-1">
                <Phone size={14} className="text-gray-400" />
                <a href={`tel:${decodedPhone}`} className="hover:text-purple-700 font-mono">{decodedPhone}</a>
                <button onClick={() => copyToClipboard(decodedPhone, 'Phone copied')} className="text-gray-400 hover:text-gray-700"><Copy size={12} /></button>
              </span>
              {latestDraft.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail size={14} className="text-gray-400" />
                  <a href={`mailto:${latestDraft.email}`} className="hover:text-purple-700">{latestDraft.email}</a>
                </span>
              )}
              {latestDraft.utm_source && (
                <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">
                  <Globe size={12} /> {latestDraft.utm_source}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">Drafts: {counts.drafts}</span>
            <span className={`px-2.5 py-1 text-xs rounded-full ${counts.otpVerified ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
              OTP: {counts.otpVerified ? 'Verified' : 'Not yet'}
            </span>
            <span className="px-2.5 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">Offers: {counts.offers}</span>
            <span className="px-2.5 py-1 text-xs bg-green-100 text-green-700 rounded-full">Lenders Clicked: {counts.lenders}</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="p-6 text-sm text-gray-500 bg-white rounded-lg border border-gray-200 mb-4">Loading full journey…</div>
      )}

      <JourneyProgress milestones={milestones} />

      {/* Stage 1 — Landing page visit */}
      <Section
        title="1. Landing Page Visit"
        subtitle={milestones.drafted_at ? `Arrived at ${formatDateTime(milestones.drafted_at)}` : 'Not captured'}
        Icon={FileText}
        accent="gray"
        right={<span className="text-xs text-gray-500">{counts.drafts} draft{counts.drafts === 1 ? '' : 's'}</span>}
      >
        <LandingSnapshot latestDraft={latestDraft} />
        <DraftsList drafts={detail?.drafts} />
      </Section>

      {/* Stage 2 — OTP Verified (driven by draft table flag) */}
      <Section
        title="2. OTP Verified"
        subtitle={milestones.otp_verified_at ? `Verified at ${formatDateTime(milestones.otp_verified_at)}` : 'Not verified yet'}
        Icon={ShieldCheck}
        accent="amber"
        right={<span className="text-xs text-gray-500">{milestones.otp_verified_at ? 'Yes' : 'No'}</span>}
      >
        <OtpSection verifiedAt={milestones.otp_verified_at} phone={decodedPhone} />
      </Section>

      {/* Stage 3 — Final form submit (offerLeads entry) */}
      <Section
        title="3. Form Submitted (Final)"
        subtitle={milestones.submitted_at ? `Submitted at ${formatDateTime(milestones.submitted_at)}` : 'Form not submitted yet'}
        Icon={Sparkles}
        accent="purple"
        right={<span className="text-xs text-gray-500">{counts.offers} submission{counts.offers === 1 ? '' : 's'}</span>}
      >
        <OffersSection offers={detail?.offers} />
      </Section>

      {/* Stage 4 — Lender clicks */}
      <Section
        title="4. Lenders Clicked (Apply Now)"
        subtitle={milestones.clicked_at ? `First click at ${formatDateTime(milestones.clicked_at)}` : 'No lender clicked'}
        Icon={MousePointerClick}
        accent="green"
        right={<span className="text-xs text-gray-500">{counts.lenders} click{counts.lenders === 1 ? '' : 's'}</span>}
      >
        <LendersClickedSection lenders={detail?.lenders} offeredAt={milestones.submitted_at} />
      </Section>

      {/* Timeline — flat event stream */}
      <Section title="Full Timeline" subtitle="All events in chronological order" Icon={Clock} accent="blue" defaultOpen={false}>
        <Timeline events={detail?.timeline} />
      </Section>
    </div>
  );
};

export default LendingUserJourneyDetail;
