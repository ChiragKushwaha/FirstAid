'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') as 'dark' | 'light';
    if (current) setTheme(current);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    const applyThemeChange = () => {
      setTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('fieldaid_theme', nextTheme);

      const announcer = document.getElementById('aria-announcer');
      if (announcer) {
        announcer.textContent = `Switched to ${nextTheme} mode`;
      }
    };

    // Use native View Transitions API if supported for liquid smooth theme transition
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(applyThemeChange);
    } else {
      applyThemeChange();
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      className="icon-btn relative overflow-hidden transition-all duration-300 active:scale-90 flex items-center justify-center"
    >
      <div
        className={`transition-all duration-400 ease-out transform flex items-center justify-center ${
          theme === 'dark'
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0 absolute'
        }`}
      >
        <Sun className="w-5 h-5 text-[var(--gold)] stroke-[2.2]" />
      </div>
      <div
        className={`transition-all duration-400 ease-out transform flex items-center justify-center ${
          theme === 'light'
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0 absolute'
        }`}
      >
        <Moon className="w-5 h-5 stroke-[2.2]" />
      </div>
    </button>
  );
}
