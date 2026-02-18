import { Link, useLocation } from 'react-router-dom';
import { Cloud, BookOpen, RotateCcw, Settings2, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { t } = useTranslation('common');
  const { t: tAuth } = useTranslation('auth');
  const { user, signOut, openAuthModal } = useAuth();

  const userInitial = user?.user_metadata?.full_name?.[0]?.toUpperCase()
    || user?.email?.[0]?.toUpperCase()
    || 'U';

  const navItems = [
    { to: '/exams', icon: BookOpen, label: t('navigation.exams') },
    { to: '/review', icon: RotateCcw, label: t('navigation.review') },
    ...(isAdmin(user?.email) ? [{ to: '/admin', icon: Settings2, label: '관리자' }] : []),
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
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-accent text-accent-foreground text-sm font-bold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || user.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/exams" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      {tAuth('myPage')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    {tAuth('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9"
                onClick={() => openAuthModal('login')}
                title={tAuth('signIn')}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default AppLayout;
