// Case-insensitive lender → { logo, color } lookup used by the disbursal
// dashboard. Disbursement-table `lender` strings come in with inconsistent
// casing (e.g. "Poonawalla" vs the lending page's "poonawalla"; "Mpokket"
// vs "MPokket"), so the lookup is keyed on the lowercased name.
//
// `logo` is the path under public/lenders/. When a lender has no logo file
// the resolver returns null and the UI falls back to a colored initials chip.
const LENDER_META = {
    moneyview: { logo: '/lenders/moneyview-logo.svg', color: '#1f7ae0' },
    kreditbee: { logo: '/lenders/kreditbee-logo.svg', color: '#f47b20' },
    poonawalla: { logo: '/lenders/poonawalla.svg', color: '#003a70' },
    zype: { logo: '/lenders/zype.png', color: '#3b82f6' },

    // No logo file shipped yet — initials chip with brand color.
    lendingplate: { logo: null, color: '#0ea5e9' },
    creditplus: { logo: null, color: '#7c3aed' },
    smartcoin: { logo: null, color: '#f59e0b' },
    mpokket: { logo: null, color: '#ef4444' },
};

const norm = (name) => String(name || '').trim().toLowerCase();

export const getLenderMeta = (name) => LENDER_META[norm(name)] || { logo: null, color: '#6b7280' };

export const getLenderInitials = (name) =>
    String(name || 'NA').split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
