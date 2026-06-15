// Salary-segmented call-center roles. A user with one of these roles sees ONLY
// leads whose monthly income is inside the band AND loan amount >= minLoanAmount,
// across Offer Leads, Selected Lenders and User Track (high + short). Each list
// page forces these into its API request (and locks the matching filters), so an
// agent can't view leads outside their segment.
//
// monthly_income is an integer, so the two bands don't overlap:
//   75000  -> 40–75K team   (40000–75000 inclusive)
//   75001+ -> 75K+ team
export const CALL_CENTER_SALARY_BANDS = {
  'call-center-40-75':  { minMonthlyIncome: 40000, maxMonthlyIncome: 75000, minLoanAmount: 100000 },
  'call-center-75plus': { minMonthlyIncome: 75001, maxMonthlyIncome: '',    minLoanAmount: 100000 },
};

// Returns the band object for a role, or null for everyone else.
export const getSalaryBand = (role) => CALL_CENTER_SALARY_BANDS[role] || null;

// Map an agent's stored display name (updated_by) to their band — so when an admin
// picks a segmented agent in the funnel, Total Leads reflects only that segment's
// lead universe. Dashes are normalized (the 40-75 name uses an en-dash, –) so the
// lookup is robust against hyphen/en-dash differences.
const normAgentName = (s) => String(s || '').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
const AGENT_NAME_BANDS = {
  [normAgentName('Call Center (40K-75K)')]: CALL_CENTER_SALARY_BANDS['call-center-40-75'],
  [normAgentName('Call Center (75K+)')]:    CALL_CENTER_SALARY_BANDS['call-center-75plus'],
};
export const getBandForAgentName = (name) => AGENT_NAME_BANDS[normAgentName(name)] || null;

// True for every call-center role (general + salary-segmented). Used to hide
// controls that aren't relevant to call-center agents (e.g. Disbursement filter).
export const isCallCenterRole = (role) =>
  typeof role === 'string' && role.startsWith('call-center');

export const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
