import { useEffect, useState } from 'react';
import { Sparkles, ClipboardList } from 'lucide-react';

// Premium first-load page-level loader. Same visual language as the
// /disbursal-dashboard and /offer-leads loaders, but parameterized so each
// page just supplies its own theme + title + phrases + tiles instead of
// duplicating ~200 lines of JSX per file.
//
// Usage:
//   <PremiumPageLoader
//     theme="sky"
//     title="Loading Short Offer Leads"
//     brandLabel="Live Short Offer Leads"
//     icon={ClipboardList}
//     phrases={['...', '...']}
//     tiles={[{ label: 'Total' }, { label: 'Lenders' }, { label: 'Today' }]}
//     progressLabel="Preparing your leads"
//   />
//
// Themes — predefined Tailwind color triplets that get inlined into the
// gradient classes. Add more here if a new section needs its own palette.
const THEMES = {
    purple: {  // High Ticket leads (default)
        bg:       'from-slate-50 via-purple-50/40 to-indigo-50/50',
        floatTxt: 'text-indigo-900',
        blob1:    'bg-purple-300/30',
        blob2:    'bg-indigo-300/30',
        conic:    'conic-gradient(from 0deg, transparent 0%, #a855f7 22%, #6366f1 38%, transparent 55%, transparent 100%)',
        cardShadow: 'shadow-purple-500/15',
        gradFrom: '#a855f7',
        gradMid:  '#6366f1',
        arcTrack: '#ede9fe',
        innerRing: 'border-indigo-200/40 border-b-indigo-500 border-r-indigo-500',
        ripple:   'border-purple-400/50',
        halo:     'from-purple-500/25 to-indigo-500/25',
        iconBg:   'from-purple-600 via-violet-600 to-indigo-700 shadow-purple-500/40',
        pillBg:   'from-purple-50 to-indigo-50 border-purple-200/50',
        pillText: 'text-purple-700',
        titleGrad: 'from-purple-800 via-violet-700 to-indigo-800',
        tileBorder: 'border-purple-200/40',
        tileLabel: 'text-purple-700/70',
        tileBar:  'from-purple-200/80 via-violet-300/70 to-indigo-200/80',
        progressBg: 'bg-purple-100/70',
        progressBar: 'from-purple-500 via-violet-500 to-indigo-500',
        progressShadow: '0 0 12px rgba(139,92,246,0.6)',
        pctGrad:  'from-purple-700 to-indigo-700',
        dot1: 'bg-purple-500',
        dot2: 'bg-violet-500',
        dot3: 'bg-indigo-500',
    },
    sky: {     // Short Ticket
        bg:       'from-slate-50 via-sky-50/40 to-cyan-50/50',
        floatTxt: 'text-sky-900',
        blob1:    'bg-sky-300/30',
        blob2:    'bg-cyan-300/30',
        conic:    'conic-gradient(from 0deg, transparent 0%, #0ea5e9 22%, #06b6d4 38%, transparent 55%, transparent 100%)',
        cardShadow: 'shadow-sky-500/15',
        gradFrom: '#0ea5e9',
        gradMid:  '#06b6d4',
        arcTrack: '#e0f2fe',
        innerRing: 'border-cyan-200/40 border-b-cyan-500 border-r-cyan-500',
        ripple:   'border-sky-400/50',
        halo:     'from-sky-500/25 to-cyan-500/25',
        iconBg:   'from-sky-600 via-cyan-600 to-blue-700 shadow-sky-500/40',
        pillBg:   'from-sky-50 to-cyan-50 border-sky-200/50',
        pillText: 'text-sky-700',
        titleGrad: 'from-sky-800 via-cyan-700 to-blue-800',
        tileBorder: 'border-sky-200/40',
        tileLabel: 'text-sky-700/70',
        tileBar:  'from-sky-200/80 via-cyan-300/70 to-blue-200/80',
        progressBg: 'bg-sky-100/70',
        progressBar: 'from-sky-500 via-cyan-500 to-blue-500',
        progressShadow: '0 0 12px rgba(14,165,233,0.6)',
        pctGrad:  'from-sky-700 to-cyan-700',
        dot1: 'bg-sky-500',
        dot2: 'bg-cyan-500',
        dot3: 'bg-blue-500',
    },
    emerald: { // Disbursal Dashboard
        bg:       'from-slate-50 via-emerald-50/40 to-teal-50/50',
        floatTxt: 'text-emerald-900',
        blob1:    'bg-emerald-300/30',
        blob2:    'bg-teal-300/30',
        conic:    'conic-gradient(from 0deg, transparent 0%, #10b981 22%, #14b8a6 38%, transparent 55%, transparent 100%)',
        cardShadow: 'shadow-emerald-500/15',
        gradFrom: '#10b981',
        gradMid:  '#14b8a6',
        arcTrack: '#d1fae5',
        innerRing: 'border-teal-200/40 border-b-teal-500 border-r-teal-500',
        ripple:   'border-emerald-400/50',
        halo:     'from-emerald-500/25 to-teal-500/25',
        iconBg:   'from-emerald-600 via-teal-600 to-emerald-700 shadow-emerald-500/40',
        pillBg:   'from-emerald-50 to-teal-50 border-emerald-200/50',
        pillText: 'text-emerald-700',
        titleGrad: 'from-emerald-800 via-teal-700 to-emerald-800',
        tileBorder: 'border-emerald-200/40',
        tileLabel: 'text-emerald-700/70',
        tileBar:  'from-emerald-200/80 via-teal-300/70 to-emerald-200/80',
        progressBg: 'bg-emerald-100/70',
        progressBar: 'from-emerald-500 via-teal-500 to-emerald-500',
        progressShadow: '0 0 12px rgba(16,185,129,0.6)',
        pctGrad:  'from-emerald-700 to-teal-700',
        dot1: 'bg-emerald-500',
        dot2: 'bg-teal-500',
        dot3: 'bg-cyan-500',
    },
};

const PremiumPageLoader = ({
    theme = 'sky',
    title = 'Loading…',
    brandLabel = 'Live Feed',
    icon: Icon = ClipboardList,
    phrases = ['Loading data…', 'Crunching numbers…', 'Polishing the view…'],
    tiles = [{ label: 'Total' }, { label: 'Today' }, { label: 'Active' }],
    progressLabel = 'Preparing your dashboard',
}) => {
    const t = THEMES[theme] || THEMES.sky;
    const [phraseIdx, setPhraseIdx] = useState(0);
    const [pct, setPct] = useState(8);

    useEffect(() => {
        const phraseId = setInterval(
            () => setPhraseIdx((i) => (i + 1) % phrases.length),
            1400
        );
        // Asymptotic ease toward 95 — never hits 100 until the loader unmounts.
        const pctId = setInterval(
            () => setPct((p) => Math.min(p + Math.max((95 - p) * 0.12, 0.5), 95)),
            220
        );
        return () => { clearInterval(phraseId); clearInterval(pctId); };
    }, [phrases.length]);

    return (
        <div className="max-w-[1440px] mx-auto px-2 pb-10">
            <div className="relative min-h-[78vh] flex items-center justify-center overflow-hidden rounded-2xl">

                {/* Layered mesh background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${t.bg}`} />

                {/* Floating ₹ symbols */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {[
                        { top: '8%',  left: '10%', size: 'text-5xl', op: 0.06, delay: '0s'   },
                        { top: '20%', left: '82%', size: 'text-6xl', op: 0.07, delay: '1s'   },
                        { top: '55%', left: '5%',  size: 'text-7xl', op: 0.05, delay: '0.5s' },
                        { top: '72%', left: '85%', size: 'text-5xl', op: 0.06, delay: '1.5s' },
                        { top: '88%', left: '38%', size: 'text-4xl', op: 0.05, delay: '0.8s' },
                        { top: '32%', left: '50%', size: 'text-3xl', op: 0.04, delay: '2s'   },
                    ].map((s, i) => (
                        <span
                            key={i}
                            className={`absolute font-black ${t.floatTxt} ${s.size} animate-pulse`}
                            style={{ top: s.top, left: s.left, opacity: s.op, animationDelay: s.delay, animationDuration: '4s' }}
                        >₹</span>
                    ))}
                </div>

                {/* Floating gradient blobs */}
                <div className={`pointer-events-none absolute -top-32 -left-24 w-96 h-96 rounded-full ${t.blob1} blur-3xl animate-pulse`} />
                <div className={`pointer-events-none absolute -bottom-32 -right-24 w-96 h-96 rounded-full ${t.blob2} blur-3xl animate-pulse`} style={{ animationDelay: '0.8s' }} />
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-amber-200/15 blur-3xl" />

                {/* Card wrapper with rotating conic-gradient glow border */}
                <div className="relative max-w-md w-full mx-4">
                    <div
                        className="absolute -inset-[1.5px] rounded-3xl opacity-70 blur-[2px]"
                        style={{ background: t.conic, animation: 'spin 4s linear infinite' }}
                    />

                    {/* Glassmorphism card */}
                    <div className={`relative z-10 flex flex-col items-center gap-6 px-10 py-12 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl ${t.cardShadow}`}>

                        {/* Icon zone */}
                        <div className="relative w-36 h-36 flex items-center justify-center">

                            {/* Sparkles */}
                            <Sparkles size={12} className="absolute top-1  left-3  text-amber-400 animate-pulse" style={{ animationDelay: '0s',   animationDuration: '1.8s' }} />
                            <Sparkles size={10} className="absolute top-4  right-2 text-amber-300 animate-pulse" style={{ animationDelay: '0.6s', animationDuration: '2.2s' }} />
                            <Sparkles size={11} className="absolute bottom-2 left-5 text-amber-400 animate-pulse" style={{ animationDelay: '1.2s', animationDuration: '2s'   }} />
                            <Sparkles size={9}  className="absolute bottom-5 right-4 text-amber-300 animate-pulse" style={{ animationDelay: '0.3s', animationDuration: '2.4s' }} />

                            {/* Outer rotating gradient arc */}
                            <svg
                                className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)]"
                                viewBox="0 0 100 100"
                                style={{ animation: 'spin 3.5s linear infinite' }}
                            >
                                <defs>
                                    <linearGradient id={`arcGrad-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%"   stopColor={t.gradFrom} />
                                        <stop offset="50%"  stopColor={t.gradMid} />
                                        <stop offset="100%" stopColor={t.gradFrom} stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <circle cx="50" cy="50" r="46" fill="none" stroke={t.arcTrack} strokeWidth="2" />
                                <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#arcGrad-${theme})`} strokeWidth="3" strokeLinecap="round" strokeDasharray="80 220" />
                            </svg>

                            <div className={`absolute inset-5 rounded-full border-[1.5px] ${t.innerRing}`} style={{ animation: 'spin 2.2s linear infinite reverse' }} />
                            <div className={`absolute inset-8 rounded-2xl border-2 ${t.ripple} animate-ping`} style={{ animationDuration: '2.5s' }} />
                            <div className={`absolute inset-8 rounded-full bg-gradient-to-br ${t.halo} blur-xl animate-pulse`} />

                            {/* Icon card with gold ₹ sparkle badge */}
                            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${t.iconBg} flex items-center justify-center shadow-xl ring-1 ring-white/30`}>
                                <Icon size={28} className="text-white drop-shadow-md" />
                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-md shadow-amber-400/50 ring-2 ring-white">
                                    <span className="text-[9px] font-black text-amber-900 leading-none">₹</span>
                                </div>
                            </div>
                        </div>

                        {/* Brand pill + title + rotating phrase */}
                        <div className="text-center">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-full bg-gradient-to-r ${t.pillBg} border`}>
                                <span className="relative flex w-1.5 h-1.5">
                                    <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                                    <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500" />
                                </span>
                                <span className={`text-[10.5px] font-semibold tracking-[0.12em] ${t.pillText} uppercase`}>{brandLabel}</span>
                            </div>
                            <h2 className={`text-[23px] font-bold bg-gradient-to-r ${t.titleGrad} bg-clip-text text-transparent tracking-tight leading-tight`}>
                                {title}
                            </h2>
                            <div className="mt-3 h-5 overflow-hidden">
                                <p
                                    key={phraseIdx}
                                    className="text-[13px] text-gray-600 font-medium"
                                    style={{ animation: 'pulse 0.6s ease-out' }}
                                >
                                    {phrases[phraseIdx]}
                                </p>
                            </div>
                        </div>

                        {/* Mini KPI tile teasers */}
                        <div className="grid grid-cols-3 gap-2 w-full">
                            {tiles.slice(0, 3).map((tile, i) => (
                                <div
                                    key={i}
                                    className={`relative h-14 rounded-xl bg-gradient-to-br from-white/80 to-white/40 border ${t.tileBorder} p-2 overflow-hidden`}
                                >
                                    <span className={`text-[8.5px] font-semibold ${t.tileLabel} tracking-wider uppercase`}>{tile.label}</span>
                                    <div className={`mt-1 h-3 w-2/3 rounded bg-gradient-to-r ${t.tileBar} bg-[length:200%_100%] animate-shimmer`} />
                                </div>
                            ))}
                        </div>

                        {/* Premium progress bar */}
                        <div className="w-full">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10.5px] text-gray-500 font-medium">{progressLabel}</span>
                                <span className={`text-[11.5px] font-bold tabular-nums bg-gradient-to-r ${t.pctGrad} bg-clip-text text-transparent`}>
                                    {Math.round(pct)}%
                                </span>
                            </div>
                            <div className={`relative h-1.5 rounded-full ${t.progressBg} overflow-hidden`}>
                                <div
                                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${t.progressBar} transition-[width] duration-500 ease-out`}
                                    style={{ width: `${pct}%`, boxShadow: t.progressShadow }}
                                />
                                <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer bg-[length:200%_100%]"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-[10px] text-gray-400 font-semibold tracking-[0.14em] uppercase">Secure · Encrypted</span>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${t.dot1} animate-bounce`} style={{ animationDelay: '0s' }} />
                                    <span className={`w-1.5 h-1.5 rounded-full ${t.dot2} animate-bounce`} style={{ animationDelay: '0.15s' }} />
                                    <span className={`w-1.5 h-1.5 rounded-full ${t.dot3} animate-bounce`} style={{ animationDelay: '0.3s' }} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumPageLoader;
