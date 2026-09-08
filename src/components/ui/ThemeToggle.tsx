'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse ${className}`} />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      className={`relative p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
        isDark
          ? 'bg-stone-800 text-gold-300 hover:bg-stone-700 hover:text-gold-200 border border-stone-700 shadow-md'
          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-harmony-900 border border-stone-200 shadow-xs'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-gold-400 rotate-0 scale-100 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-harmony-900 rotate-0 scale-100 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
