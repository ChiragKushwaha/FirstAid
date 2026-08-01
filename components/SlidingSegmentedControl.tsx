'use client';

import { ReactNode } from 'react';

export interface SegmentOption<T extends string = string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface SlidingSegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  activeColor?: string;
  activeTextColor?: string;
}

export default function SlidingSegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel = 'Segment Control',
  activeColor = 'var(--orange)',
  activeTextColor = '#FFFFFF',
}: SlidingSegmentedControlProps<T>) {
  const selectedIndex = options.findIndex((opt) => opt.id === value);
  const safeIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const count = options.length;

  return (
    <div
      className="relative flex items-center p-1 rounded-full border border-[var(--card-border)] bg-[var(--cream-card)] select-none overflow-hidden w-full"
      role="radiogroup"
      aria-label={ariaLabel}
      style={{
        boxShadow: '0 1px 3px rgba(160, 140, 100, 0.05)',
      }}
    >
      {/* ── Sliding Active Background Pill (Exact full size matching original button) ── */}
      <div
        className="absolute top-1 bottom-1 rounded-full pointer-events-none transition-all duration-350"
        style={{
          left: `calc(4px + ${safeIndex} * ((100% - 8px) / ${count}))`,
          width: `calc((100% - 8px) / ${count})`,
          background: activeColor,
          boxShadow: activeColor.includes('orange') || activeColor.includes('var(--orange)')
            ? '0 2px 12px rgba(232, 122, 58, 0.3)'
            : '0 2px 10px rgba(0, 0, 0, 0.15)',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* ── Option Buttons ── */}
      {options.map((opt) => {
        const isSelected = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            role="radio"
            aria-checked={isSelected}
            className="relative z-10 flex-1 py-3 px-4 rounded-full text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-colors duration-300 min-h-[48px]"
            style={{
              color: isSelected ? activeTextColor : 'var(--text-sub)',
            }}
          >
            {opt.icon}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
