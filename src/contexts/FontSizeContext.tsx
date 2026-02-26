import { createContext, useContext, useEffect, useState } from 'react';

type FontSize = 'sm' | 'md' | 'lg';

interface FontSizeContextValue {
  fontSize: FontSize;
  cycleFontSize: () => void;
}

const FontSizeContext = createContext<FontSizeContextValue>({
  fontSize: 'md',
  cycleFontSize: () => {},
});

const FONT_SIZE_MAP: Record<FontSize, string> = {
  sm: '14px',
  md: '16px',
  lg: '18px',
};

const CYCLE_ORDER: FontSize[] = ['sm', 'md', 'lg'];

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem('cloudmaster_fontSize') as FontSize | null;
    if (saved === 'sm' || saved === 'md' || saved === 'lg') return saved;
    return 'md';
  });

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_MAP[fontSize];
    localStorage.setItem('cloudmaster_fontSize', fontSize);
  }, [fontSize]);

  const cycleFontSize = () => {
    setFontSize(prev => {
      const idx = CYCLE_ORDER.indexOf(prev);
      return CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
    });
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, cycleFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  return useContext(FontSizeContext);
}
