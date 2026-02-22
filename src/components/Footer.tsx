import { Link } from 'react-router-dom';
import { Cloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation(['common', 'pages']);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t py-8 px-4 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-bold">
          <Cloud className="h-5 w-5 text-accent" />
          {t('common:brand')}
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            {t('pages:index.footer.privacy')}
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            {t('pages:index.footer.terms')}
          </Link>
          <a
            href="https://open.kakao.com/o/pnEbOZgi"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            {t('pages:index.footer.community')}
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          © {year} CloudMaster. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
