import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

const THEME_META = {
  light: { Icon: Moon, nextLabel: { ko: '다크로 전환',   en: 'Switch to Dark'  }, nextShort: { ko: '다크',   en: 'Dark'  } },
  dark:  { Icon: Sun,  nextLabel: { ko: '라이트로 전환', en: 'Switch to Light' }, nextShort: { ko: '라이트', en: 'Light' } },
} as const;

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ko' ? 'ko' : 'en';

  const meta = THEME_META[theme as 'light' | 'dark'] ?? THEME_META.light;
  const label = meta.nextLabel[lang];
  const shortLabel = meta.nextShort[lang];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-8 sm:h-9 px-2 sm:px-2.5 gap-1 text-muted-foreground hover:text-foreground"
          aria-label={label}
        >
          <meta.Icon className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline text-xs font-medium">{shortLabel}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ThemeToggle;
