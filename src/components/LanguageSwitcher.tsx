import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];
  const nextLang = languages.find(lang => lang.code !== i18n.language) || languages[0];

  return (
    <Button variant="ghost" size="sm" className="gap-2" onClick={() => i18n.changeLanguage(nextLang.code)}>
      <span className="text-lg">{currentLang.flag}</span>
      <span className="hidden sm:inline">{currentLang.name}</span>
    </Button>
  );
};

export default LanguageSwitcher;
