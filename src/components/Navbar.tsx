import { Link } from 'react-router-dom';
import { Cloud, Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('common');
  const { t: tAuth } = useTranslation('auth');
  const { user, signOut, openAuthModal } = useAuth();

  const userInitial = user?.user_metadata?.full_name?.[0]?.toUpperCase()
    || user?.email?.[0]?.toUpperCase()
    || 'U';

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Cloud className="h-7 w-7 text-accent" />
          <span>{t('brand')}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('navigation.features')}</a>
          <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('navigation.faq')}</a>
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
                  <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    {tAuth('myPage')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  {tAuth('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="font-medium"
              onClick={() => openAuthModal('login')}
            >
              {tAuth('signIn')}
            </Button>
          )}

          <Link to="/exams">
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {t('navigation.startFree')}
            </Button>
          </Link>
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-3">
          <a href="#features" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>{t('navigation.features')}</a>
          <a href="#faq" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>{t('navigation.faq')}</a>

          {user ? (
            <>
              <Link to="/dashboard" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>
                {tAuth('myPage')}
              </Link>
              <button
                className="block text-sm font-medium text-destructive text-left"
                onClick={handleSignOut}
              >
                {tAuth('logout')}
              </button>
            </>
          ) : (
            <button
              className="block text-sm font-medium text-muted-foreground text-left"
              onClick={() => { openAuthModal('login'); setOpen(false); }}
            >
              {tAuth('signIn')}
            </button>
          )}

          <Link to="/exams" onClick={() => setOpen(false)}>
            <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">{t('navigation.startFree')}</Button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
