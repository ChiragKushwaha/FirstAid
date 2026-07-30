'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') as 'dark' | 'light';
    if (current) setTheme(current);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('fieldaid_theme', nextTheme);

    const announcer = document.getElementById('aria-announcer');
    if (announcer) {
      announcer.textContent = `Switched to ${nextTheme} mode`;
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 border border-current/15 bg-white/10 text-current hover:bg-white/20"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-[#F7D44C] stroke-[2.2]" />
      ) : (
        <Moon className="w-5 h-5 text-black stroke-[2.2]" />
      )}
    </button>
  );
}
