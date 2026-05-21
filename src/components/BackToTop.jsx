import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

// Floating "scroll-to-top" button — appears in the bottom-right once the
// page is scrolled past ~300px, smooth-scrolls to top on click. Premium
// emerald/teal gradient with a subtle outer glow, hover-lift, and tap
// feedback. Tracks both window scroll AND the layout's <main> scroll (the
// app's primary scroll container in DefaultLayout uses `overflow-y-auto`).
const BackToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // The DefaultLayout's <main> has `overflow-y-auto` but its parent
        // chain doesn't constrain height, so in practice the WINDOW scrolls
        // (not main). Listen on both — whichever actually moves will fire.
        const mainEl = document.querySelector('main');

        const getScrollTop = () => Math.max(
            window.scrollY || 0,
            document.documentElement.scrollTop || 0,
            document.body.scrollTop || 0,
            mainEl ? mainEl.scrollTop : 0,
        );

        const onScroll = () => setVisible(getScrollTop() > 300);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        if (mainEl) mainEl.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (mainEl) mainEl.removeEventListener('scroll', onScroll);
        };
    }, []);

    const scrollToTop = () => {
        const mainEl = document.querySelector('main');
        // Scroll both — whichever has actual scrollTop will move; the other
        // is a no-op. Smooth-scroll behavior is per-target.
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (mainEl && mainEl.scrollTop > 0) {
            mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <button
            type="button"
            aria-label="Scroll to top"
            onClick={scrollToTop}
            className={`fixed bottom-6 right-6 z-50 group transition-all duration-300 ease-out ${
                visible
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
        >
            {/* Outer glow ring */}
            <span className="absolute inset-0 rounded-full bg-emerald-500/40 blur-lg group-hover:bg-emerald-500/60 transition" />

            {/* Conic glow border on hover */}
            <span
                className="absolute -inset-0.5 rounded-full opacity-0 group-hover:opacity-100 blur-[1px] transition-opacity"
                style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, #10b981 30%, #14b8a6 50%, transparent 80%)',
                    animation: 'spin 3s linear infinite',
                }}
            />

            {/* Button face */}
            <span className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 shadow-lg shadow-emerald-500/40 ring-1 ring-white/40 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-transform">
                <ChevronUp size={22} className="text-white drop-shadow group-hover:-translate-y-0.5 transition-transform" />
            </span>
        </button>
    );
};

export default BackToTop;
