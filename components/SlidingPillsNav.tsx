'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface SlidingPillsNavProps<T extends string = string> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  activeColor?: string;
  activeTextColor?: string;
}

interface PillPosition {
  left: number;
  width: number;
  top: number;
  height: number;
}

export default function SlidingPillsNav<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel = 'Category Filters',
  activeColor = 'var(--orange)',
  activeTextColor = '#FFFFFF',
}: SlidingPillsNavProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState<PillPosition | null>(null);

  const updateIndicator = useCallback(() => {
    const selectedIndex = options.findIndex((opt) => opt === value);
    if (selectedIndex < 0) return;

    const btn = buttonRefs.current[selectedIndex];
    const container = containerRef.current;

    if (btn && container) {
      setIndicator({
        left: btn.offsetLeft,
        width: btn.offsetWidth,
        top: btn.offsetTop,
        height: btn.offsetHeight,
      });

      // Scroll selected item into view smoothly if offscreen
      const btnLeft = btn.offsetLeft;
      const btnRight = btnLeft + btn.offsetWidth;
      const scrollLeft = container.scrollLeft;
      const viewportWidth = container.clientWidth;

      if (btnLeft < scrollLeft) {
        container.scrollTo({ left: btnLeft - 16, behavior: 'smooth' });
      } else if (btnRight > scrollLeft + viewportWidth) {
        container.scrollTo({ left: btnRight - viewportWidth + 16, behavior: 'smooth' });
      }
    }
  }, [options, value]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 select-none w-full"
      role="tablist"
      aria-label={ariaLabel}
    >
      {/* ── Sliding Active Background Pill (Solid Vibrant Accent) ── */}
      {indicator && (
        <div
          className="absolute rounded-full shadow-md pointer-events-none transition-all duration-350"
          style={{
            left: `${indicator.left}px`,
            width: `${indicator.width}px`,
            top: `${indicator.top}px`,
            height: `${indicator.height}px`,
            background: activeColor,
            boxShadow: activeColor.includes('orange') || activeColor.includes('var(--orange)')
              ? '0 2px 12px rgba(207, 86, 23, 0.35)'
              : '0 2px 10px rgba(0, 0, 0, 0.15)',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      )}

      {/* ── Option Buttons ── */}
      {options.map((opt, idx) => {
        const isSelected = opt === value;
        return (
          <button
            key={opt}
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            type="button"
            onClick={() => onChange(opt)}
            role="tab"
            aria-selected={isSelected}
            className="relative z-10 py-2.5 px-4 rounded-full text-xs font-black flex-shrink-0 transition-colors duration-300 min-h-[44px] flex items-center justify-center border"
            style={{
              color: isSelected ? activeTextColor : 'var(--text-main)',
              background: isSelected ? 'transparent' : 'var(--card-bg-solid)',
              borderColor: isSelected ? 'transparent' : 'var(--card-border)',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
