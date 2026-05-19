import React from 'react';

// Premium loader used across dashboard chart / table / panel placeholders.
// Visual stack:
//   1. Pulsing radial halo (soft indigo→purple glow with breathing scale)
//   2. Static dotted track (subtle ring suggesting precision)
//   3. Outer rotating gradient arc (clockwise, indigo→purple)
//   4. Inner counter-rotating arc (slower, opposite direction)
//   5. Three orbital dots that ping in sequence
//   6. Pulsing centre dot with gradient fill
//   7. Optional shimmering label below
//
// Variants via `size` prop: 'sm' | 'md' (default) | 'lg'.
// Pass `fullHeight` when the parent container has a fixed height (e.g. chart
// areas) so the loader vertically centers inside it.

const SIZE_MAP = {
  sm: {
    outer: 'w-10 h-10',
    inner: 'w-6 h-6',
    border: 'border-[2px]',
    innerBorder: 'border-[2px]',
    label: 'text-xs',
    gap: 'gap-2',
    dot: 'w-1 h-1',
    orbitDot: 'w-[5px] h-[5px]',
  },
  md: {
    outer: 'w-14 h-14',
    inner: 'w-8 h-8',
    border: 'border-[3px]',
    innerBorder: 'border-[2px]',
    label: 'text-sm',
    gap: 'gap-3',
    dot: 'w-1.5 h-1.5',
    orbitDot: 'w-[6px] h-[6px]',
  },
  lg: {
    outer: 'w-20 h-20',
    inner: 'w-12 h-12',
    border: 'border-[3px]',
    innerBorder: 'border-[2px]',
    label: 'text-[15px]',
    gap: 'gap-4',
    dot: 'w-2 h-2',
    orbitDot: 'w-[7px] h-[7px]',
  },
};

const PremiumLoader = ({
  size = 'md',
  label = 'Loading…',
  sublabel,
  fullHeight = false,
  className = '',
}) => {
  const s = SIZE_MAP[size] || SIZE_MAP.md;
  return (
    <div
      className={`${fullHeight ? 'h-full' : ''} w-full flex items-center justify-center ${className}`}
    >
      <div className={`flex flex-col items-center justify-center ${s.gap}`}>
        {/* The composed spinner. inline-flex so it shrinks to content; relative
            so the absolutely-positioned layers anchor to the centre. */}
        <div className={`relative ${s.outer} flex items-center justify-center`}>
          {/* Layer 1 — breathing halo. ping animates scale + opacity, blur softens it. */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 blur-lg animate-ping"
            style={{ animationDuration: '2.2s' }}
          />
          {/* Layer 2 — secondary glow that breathes more slowly behind the ring. */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-400/20 to-purple-400/20 blur-md animate-pulse"
            style={{ animationDuration: '1.6s' }}
          />

          {/* Layer 3 — static dotted track (subtle, premium feel). */}
          <div
            className={`absolute inset-0 ${s.outer} rounded-full border-dotted border-indigo-200/70 ${s.border}`}
          />

          {/* Layer 4 — outer rotating arc (clockwise, indigo→purple). */}
          <div
            className={`absolute inset-0 ${s.outer} ${s.border} rounded-full border-transparent border-t-indigo-500 border-r-purple-500 animate-spin`}
            style={{ animationDuration: '1.1s' }}
          />

          {/* Layer 5 — inner counter-rotating arc, slower for contrast. */}
          <div
            className={`${s.inner} ${s.innerBorder} rounded-full border-transparent border-b-purple-400 border-l-indigo-400 animate-spin`}
            style={{ animationDuration: '1.6s', animationDirection: 'reverse' }}
          />

          {/* Layer 6 — three orbiting dots that ping in staggered phase. They
              sit just inside the outer ring (top / right / left) and pulse to
              hint at motion without being noisy. */}
          <span
            className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 ${s.orbitDot} rounded-full bg-indigo-500 animate-ping`}
            style={{ animationDuration: '1.8s' }}
          />
          <span
            className={`absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 ${s.orbitDot} rounded-full bg-purple-500 animate-ping`}
            style={{ animationDuration: '1.8s', animationDelay: '0.6s' }}
          />
          <span
            className={`absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 ${s.orbitDot} rounded-full bg-indigo-400 animate-ping`}
            style={{ animationDuration: '1.8s', animationDelay: '1.2s' }}
          />

          {/* Layer 7 — pulsing gradient centre dot. */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${s.dot} rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.6)]`} />
          </div>
        </div>

        {label && (
          <div className={`${s.label} font-medium text-gray-600 tracking-wide animate-pulse`} style={{ animationDuration: '2s' }}>
            {label}
          </div>
        )}
        {sublabel && (
          <div className="text-[11px] text-gray-400">{sublabel}</div>
        )}
      </div>
    </div>
  );
};

export default PremiumLoader;
