import { inr } from '../custom-hooks/callCenterBands';

// Read-only notice shown on every list page a salary-segmented call-center agent
// can open, so it's obvious the queue is intentionally filtered to their band.
const CallCenterBandBanner = ({ band }) => {
  if (!band) return null;
  return (
    <div className="flex items-center gap-2.5 mb-3 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2.5">
      <span className="grid place-items-center w-7 h-7 rounded-lg bg-purple-600 text-white text-[13px] font-bold shrink-0">₹</span>
      <p className="text-[12.5px] text-purple-900">
        Your queue is locked to{' '}
        <b>
          monthly income {inr(band.minMonthlyIncome)}
          {band.maxMonthlyIncome ? `–${inr(band.maxMonthlyIncome)}` : '+'}
        </b>{' '}
        and <b>loan amount ≥ {inr(band.minLoanAmount)}</b>. Other leads aren’t shown.
      </p>
    </div>
  );
};

export default CallCenterBandBanner;
