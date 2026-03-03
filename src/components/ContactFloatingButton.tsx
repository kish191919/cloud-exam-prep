import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ContactModal from './ContactModal';

export default function ContactFloatingButton() {
  const { user, openAuthModal } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        aria-label="고객의 소리 문의하기"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 active:scale-95 transition-all"
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
