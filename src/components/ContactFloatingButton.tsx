import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import ContactModal from './ContactModal';

export default function ContactFloatingButton() {
  const { t } = useTranslation('common');
  const { user, openAuthModal } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      {/* 펄스 링 + 버튼 컨테이너 */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center justify-end">
        {/* 호버 시 슬라이드 인 라벨 */}
        <div
          className={`
            mr-3 px-3 py-1.5 rounded-full bg-card border border-border shadow-md
            text-sm font-medium text-foreground whitespace-nowrap
            transition-all duration-300 ease-out
            ${hovered ? 'opacity-100 translate-x-0 pointer-events-none' : 'opacity-0 translate-x-3 pointer-events-none'}
          `}
        >
          {user ? t('floating.contact') : t('floating.contactLogin')}
        </div>

        {/* 펄스 링 레이어 */}
        <div className="relative">
          {/* 외부 펄스 링 (느린) */}
          <span
            className={`
              absolute inset-0 rounded-full bg-accent
              transition-opacity duration-300
              ${hovered ? 'opacity-0' : 'animate-ping opacity-20'}
            `}
            style={{ animationDuration: '2.5s' }}
          />
          {/* 내부 펄스 링 (빠른) */}
          <span
            className={`
              absolute inset-0 rounded-full bg-accent
              transition-opacity duration-300
              ${hovered ? 'opacity-0' : 'animate-ping opacity-10'}
            `}
            style={{ animationDuration: '1.8s', animationDelay: '0.4s' }}
          />

          {/* 메인 버튼 */}
          <button
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            aria-label={t('floating.contactAria')}
            className={`
              relative flex items-center justify-center
              w-12 h-12 md:w-14 md:h-14 rounded-full
              bg-accent text-accent-foreground
              shadow-lg shadow-accent/30
              transition-all duration-300 ease-out
              ${hovered
                ? 'scale-110 shadow-xl shadow-accent/40 bg-accent/90'
                : 'scale-100'
              }
              active:scale-95
            `}
          >
            <MessageSquare
              className={`h-5 w-5 md:h-6 md:w-6 transition-all duration-200 ${hovered ? 'scale-110' : 'scale-100'}`}
            />
          </button>
        </div>
      </div>

      <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
