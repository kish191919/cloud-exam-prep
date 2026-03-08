import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

const ALL_THEME_CLASSES = ['dark', 'sepia', 'forest'] as const;
const CYCLE: Theme[] = ['light', 'dark'];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('cloudmaster_theme') as Theme | null;
    if (saved && CYCLE.includes(saved)) return saved;
    // Default to light mode on first visit
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...ALL_THEME_CLASSES);
    if (theme !== 'light') root.classList.add(theme);
    localStorage.setItem('cloudmaster_theme', theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () =>
    setThemeState(prev => CYCLE[(CYCLE.indexOf(prev) + 1) % CYCLE.length]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
