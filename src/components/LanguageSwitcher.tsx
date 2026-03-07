import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { GEO_LANG_CACHE_KEY } from '@/hooks/useGeoLanguage';

const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];
  const nextLang = languages.find(lang => lang.code !== i18n.language) || languages[0];

  const label = i18n.language === 'ko' ? 'Switch to English' : '한국어로 전환';

  const handleChange = () => {
    // 사용자가 직접 전환하면 geo 감지가 다시 실행되지 않도록 마킹
    localStorage.setItem(GEO_LANG_CACHE_KEY, 'user');
    i18n.changeLanguage(nextLang.code);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" onClick={handleChange}>
          <span className="text-lg">{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.name}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default LanguageSwitcher;
