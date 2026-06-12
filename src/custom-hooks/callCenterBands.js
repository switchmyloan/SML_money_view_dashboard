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

export const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
