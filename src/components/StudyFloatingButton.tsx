import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

export default function StudyFloatingButton() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { user, openAuthModal } = useAuth();
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      navigate('/exams');
    }
  };

  return (
    <div className="fixed bottom-[5.25rem] right-6 z-40 flex items-center justify-end">
      {/* 호버 시 슬라이드 인 라벨 */}
      <div
        className={`
          mr-3 px-3 py-1.5 rounded-full bg-card border border-border shadow-md
          text-sm font-medium text-foreground whitespace-nowrap
          transition-all duration-300 ease-out
          ${hovered ? 'opacity-100 translate-x-0 pointer-events-none' : 'opacity-0 translate-x-3 pointer-events-none'}
        `}
      >
        {t('floating.study')}
      </div>

      {/* 펄스 링 레이어 */}
      <div className="relative">
        {/* 외부 펄스 링 (느린) */}
        <span
          className={`
            absolute inset-0 rounded-full bg-primary
            transition-opacity duration-300
            ${hovered ? 'opacity-0' : 'animate-ping opacity-20'}
          `}
          style={{ animationDuration: '2.5s' }}
        />
        {/* 내부 펄스 링 (빠른) */}
        <span
          className={`
            absolute inset-0 rounded-full bg-primary
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
          aria-label={t('floating.studyAria')}
          className={`
            relative flex items-center justify-center
            w-12 h-12 rounded-full
            bg-primary text-primary-foreground
            shadow-lg shadow-primary/30
            transition-all duration-300 ease-out
            ${hovered
              ? 'scale-110 shadow-xl shadow-primary/40 bg-primary/90'
              : 'scale-100'
            }
            active:scale-95
          `}
        >
          <BookOpen
            className={`h-5 w-5 transition-all duration-200 ${hovered ? 'scale-110' : 'scale-100'}`}
          />
        </button>
      </div>
    </div>
  );
}
