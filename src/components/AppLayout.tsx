import { Link, useLocation } from 'react-router-dom';
import { Cloud, LayoutDashboard, BookOpen, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { t } = useTranslation('common');

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('navigation.dashboard') },
    { to: '/exams', icon: BookOpen, label: t('navigation.exams') },
    { to: '/review', icon: RotateCcw, label: t('navigation.review') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Cloud className="h-6 w-6 text-accent" />
            {t('brand')}
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.to
                    ? 'bg-secondary text-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default AppLayout;
