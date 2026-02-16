import { Link } from 'react-router-dom';
import { Cloud, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Cloud className="h-7 w-7 text-accent" />
          <span>CloudMaster</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
          <Link to="/exams">
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Start Free
            </Button>
          </Link>
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-3">
          <a href="#features" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Features</a>
          <a href="#pricing" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Pricing</a>
          <a href="#faq" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>FAQ</a>
          <Link to="/dashboard" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Sign In</Link>
          <Link to="/exams" onClick={() => setOpen(false)}>
            <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Start Free</Button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
