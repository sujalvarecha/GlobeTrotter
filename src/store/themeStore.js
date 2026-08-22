import { create } from 'zustand';

const THEME_KEY = 'globetrotter-theme';

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // fallback
  }
  return 'dark';
};

const applyThemeToDOM = (theme) => {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
    document.body.style.backgroundColor = '#FAF7F2';
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
    document.body.style.backgroundColor = '#060E1A';
  }
};

const initial = getInitialTheme();
applyThemeToDOM(initial);

export const useThemeStore = create((set, get) => ({
  theme: initial,

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // ignore
    }
    applyThemeToDOM(nextTheme);
    set({ theme: nextTheme });
  },

  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
    applyThemeToDOM(theme);
    set({ theme });
  },
}));

export default useThemeStore;
