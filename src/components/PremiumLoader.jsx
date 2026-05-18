import React from 'react';

// Premium loader used across dashboard chart / table / panel placeholders.
// Visual: a static indigo track + a rotating gradient arc on top, a soft
// blurred halo behind it for depth, and a pulsing center dot. Pairs with a
// brand-matched label below.
//
// Variants via `size` prop: 'sm' | 'md' (default) | 'lg'.
// Pass `fullHeight` when the parent container has a fixed height (e.g. chart
// areas) so the loader vertically centers inside it.

const SIZE_MAP = {
  sm: { ring: 'w-8 h-8', border: 'border-[2px]', label: 'text-xs', gap: 'gap-2' },
  md: { ring: 'w-12 h-12', border: 'border-[3px]', label: 'text-sm', gap: 'gap-3' },
  lg: { ring: 'w-16 h-16', border: 'border-[3px]', label: 'text-[15px]', gap: 'gap-4' },
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
        <div className={`relative ${s.ring}`}>
          {/* Soft halo behind the ring */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/25 to-purple-500/25 blur-md animate-pulse"
          />
          {/* Static track */}
          <div
            className={`${s.ring} ${s.border} rounded-full border-indigo-100`}
          />
          {/* Rotating coloured arc */}
          <div
            className={`${s.ring} ${s.border} rounded-full border-transparent border-t-indigo-500 border-r-purple-500 absolute inset-0 animate-spin`}
          />
          {/* Pulsing dot in the centre */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 animate-pulse" />
          </div>
        </div>
        {label && (
          <div className={`${s.label} font-medium text-gray-600 tracking-wide`}>
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
