import { createContext, useContext, useEffect, useState } from 'react';

export type FontFamily = 'outfit' | 'inter' | 'noto-sans-kr';

interface FontFamilyContextValue {
  fontFamily: FontFamily;
  setFontFamily: (family: FontFamily) => void;
}

const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  outfit: '"Outfit Variable", Outfit, system-ui, sans-serif',
  inter: '"Inter Variable", Inter, system-ui, sans-serif',
  'noto-sans-kr': '"Noto Sans KR", system-ui, sans-serif',
};

const FontFamilyContext = createContext<FontFamilyContextValue>({
  fontFamily: 'outfit',
  setFontFamily: () => {},
});

export function FontFamilyProvider({ children }: { children: React.ReactNode }) {
  const [fontFamily, setFontFamilyState] = useState<FontFamily>(() => {
    const saved = localStorage.getItem('cloudmaster_fontFamily') as FontFamily | null;
    if (saved === 'outfit' || saved === 'inter' || saved === 'noto-sans-kr') return saved;
    return 'outfit';
  });

  useEffect(() => {
    document.body.style.fontFamily = FONT_FAMILY_MAP[fontFamily];
    localStorage.setItem('cloudmaster_fontFamily', fontFamily);
  }, [fontFamily]);

  const setFontFamily = (family: FontFamily) => setFontFamilyState(family);

  return (
    <FontFamilyContext.Provider value={{ fontFamily, setFontFamily }}>
      {children}
    </FontFamilyContext.Provider>
  );
}

export function useFontFamily() {
  return useContext(FontFamilyContext);
}
