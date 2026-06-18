import { useState, useEffect } from 'react';
import { MessageSquare, BarChart3, ListChecks, UserRound } from 'lucide-react';
import FollowupFunnel from './FollowupFunnel';
import FeedbackRecords from './FeedbackRecords';
import { useAuth } from '../../custom-hooks/useAuth';
import { isCallCenterRole, getSalaryBand, getBandForAgentName } from '../../custom-hooks/callCenterBands';
import { getFeedbackAgents } from '../../api-services/Modules/Leads';

// Single call-center module. Two tabs so there is ONE sidebar entry, not two:
//   Overview → the follow-up funnel, agent activity and disposition mix
//   Records  → every individual feedback entry (filterable, with history)
const TABS = [
  { key: 'overview', label: 'Overview',  Icon: BarChart3 },
  { key: 'records',  label: 'Records',   Icon: ListChecks },
];

// Admin/manager "All agents" view still excludes leads no call-center agent would
// ever work: salary ≥ 45k and loan ≥ 1 lakh. (Segmented agents use their own band.)
const ADMIN_BASELINE_BAND = { minMonthlyIncome: 45000, maxMonthlyIncome: '', minLoanAmount: 100000 };

const CallCenterFeedback = () => {
  const { user } = useAuth();
  const isCC = isCallCenterRole(user?.role);
  const [tab, setTab] = useState('overview');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [agentList, setAgentList] = useState([]);

  // Admins/managers can filter to one agent; load the picker list once.
  useEffect(() => {
    if (isCC) return undefined;
    let cancelled = false;
    getFeedbackAgents()
      .then((res) => { if (!cancelled && res?.data?.success) setAgentList(res.data.data || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isCC]);

  // Call-center agents are locked to their OWN data (identifier matches updated_by);
  // admins pass the dropdown selection (empty = all agents).
  const agent = isCC ? (user?.name || user?.email || 'CMS user') : (selectedAgent || undefined);

  // Segmented agents only work a salary band — scope the funnel's lead universe to
  // it (self via role; admin-picked agent via their name). Admin "All agents" (or a
  // non-segmented pick) falls back to the 45k/1-lakh baseline instead of all leads.
  const band = isCC ? getSalaryBand(user?.role) : (getBandForAgentName(selectedAgent) || ADMIN_BASELINE_BAND);

  return (
    <div className="w-full">
      {/* ─── Shared hero + tabs ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-5 shadow-sm mb-4">
        <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500" />
        <div className="flex items-center gap-3">
          <div className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 text-white shadow-md">
            <MessageSquare size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Call-Center Feedback</h1>
            <p className="text-sm text-gray-400">{isCC
              ? 'Your own follow-ups — how many customers you called, and every disposition.'
              : 'How many customers were called, by whom, and every follow-up — high & short ticket.'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                tab === t.key ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <t.Icon size={15} /> {t.label}
            </button>
          ))}

          {/* Admin-only: scope the whole module (both tabs) to one agent. */}
          {!isCC && (
            <div className="ml-auto flex items-center gap-1.5">
              <UserRound size={15} className="text-gray-400" />
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="">All agents</option>
                {agentList.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {tab === 'overview'
        ? <FollowupFunnel embedded agent={agent} minMonthlyIncome={band?.minMonthlyIncome} maxMonthlyIncome={band?.maxMonthlyIncome} minLoanAmount={band?.minLoanAmount} />
        : <FeedbackRecords embedded agent={agent} minMonthlyIncome={band?.minMonthlyIncome} maxMonthlyIncome={band?.maxMonthlyIncome} minLoanAmount={band?.minLoanAmount} />}
    </div>
  );
};

export default CallCenterFeedback;
