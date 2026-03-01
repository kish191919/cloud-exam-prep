import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const label = theme === 'dark'
    ? (isKo ? '라이트 모드로 전환' : 'Switch to Light Mode')
    : (isKo ? '다크 모드로 전환' : 'Switch to Dark Mode');

  const shortLabel = theme === 'dark'
    ? (isKo ? '라이트' : 'Light')
    : (isKo ? '다크' : 'Dark');

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
          {theme === 'dark'
            ? <Sun className="h-4 w-4 flex-shrink-0" />
            : <Moon className="h-4 w-4 flex-shrink-0" />}
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
