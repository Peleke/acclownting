'use client';

import { useEffect, useState } from 'react';

const THEMES = ['wine-gold', 'classic', 'dark'] as const;
type Theme = (typeof THEMES)[number];

const STORAGE_KEY = 'acclownting-theme';

const THEME_META: Record<Theme, { label: string; icon: React.ReactNode }> = {
  'wine-gold': {
    label: 'Wine & Gold',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h8l-1.5 5.5a2.5 2.5 0 0 1-5 0L4 2z" />
        <path d="M8 10v4" />
        <path d="M5 14h6" />
      </svg>
    ),
  },
  classic: {
    label: 'Classic',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 2v6l4 2" />
      </svg>
    ),
  },
  dark: {
    label: 'Dark',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.5 8a5.5 5.5 0 1 1-7-5.2A4.5 4.5 0 0 0 13.5 8z" />
      </svg>
    ),
  },
};

function applyTheme(theme: Theme) {
  if (theme === 'wine-gold') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('wine-gold');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && THEMES.includes(stored)) {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  function cycle() {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  const meta = THEME_META[theme];

  return (
    <button
      onClick={cycle}
      className="text-muted-foreground/70 hover:text-foreground flex items-center gap-1.5 text-[13px] font-medium"
      aria-label={`Theme: ${meta.label}. Click to switch.`}
      title={meta.label}
    >
      {meta.icon}
      <span className="hidden sm:inline">{meta.label}</span>
    </button>
  );
}
