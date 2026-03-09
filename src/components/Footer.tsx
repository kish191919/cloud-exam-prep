import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import ContactModal from './ContactModal';

const Footer = () => {
  const { t } = useTranslation(['common', 'pages']);
  const { user, openAuthModal } = useAuth();
  const [contactOpen, setContactOpen] = useState(false);
  const year = new Date().getFullYear();

  const handleContactClick = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      setContactOpen(true);
    }
  };

  return (
    <>
      <footer className="bg-card border-t py-8 px-4 mt-auto">
        <div className="container mx-auto flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-2 font-bold">
            <Cloud className="h-5 w-5 text-accent" />
            {t('common:brand')}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              {t('pages:index.footer.privacy')}
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              {t('pages:index.footer.terms')}
            </Link>
            <Link to="/disclaimer" className="hover:text-foreground transition-colors">
              {t('pages:index.footer.disclaimer')}
            </Link>
            <a
              href="https://open.kakao.com/o/pnEbOZgi"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {t('pages:index.footer.community')}
            </a>
            <Link to="/board" className="hover:text-foreground transition-colors">
              {t('pages:index.footer.board')}
            </Link>
            <button
              onClick={handleContactClick}
              className="hover:text-foreground transition-colors"
            >
              {t('pages:index.footer.contact')}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            © {year} CloudMaster. All rights reserved.
          </p>
        </div>
        <div className="container mx-auto mt-4 px-4">
          <p className="text-xs text-muted-foreground text-center">
            {t('pages:index.footer.nonAffiliation')}
          </p>
        </div>
      </footer>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
};

export default Footer;
