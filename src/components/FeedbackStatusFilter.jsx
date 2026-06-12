import { FEEDBACK_STATUSES } from './LeadFeedback/LeadFeedback';

// Dropdown to filter a leads list by its call-center feedback disposition.
// Visible to every user. '' = no filter, '__none__' = leads with no feedback yet.
const FeedbackStatusFilter = ({ value, onChange }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-sm font-semibold text-gray-700">Feedback:</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[170px]"
    >
      <option value="">All Feedback</option>
      <option value="__none__">No feedback yet</option>
      {FEEDBACK_STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
    {value ? (
      <button
        onClick={() => onChange('')}
        className="text-xs px-3 py-1 rounded-md bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition"
      >
        Clear
      </button>
    ) : null}
  </div>
);

export default FeedbackStatusFilter;
