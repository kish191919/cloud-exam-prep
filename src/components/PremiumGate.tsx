import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface PremiumGateProps {
  children: React.ReactNode;
  onUpgrade: () => void;
  locked?: boolean;
}

/**
 * 프리미엄 전용 콘텐츠 게이트
 * - locked=true: children을 블러 처리하고 잠금 오버레이 표시
 * - locked=false: children을 그대로 렌더링
 */
const PremiumGate = ({ children, onUpgrade, locked = true }: PremiumGateProps) => {
  const { t } = useTranslation('exam');

  if (!locked) return <>{children}</>;

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* 블러 처리된 실제 콘텐츠 (티저 효과) */}
      <div className="blur-sm select-none pointer-events-none opacity-70">
        {children}
      </div>
      {/* 잠금 오버레이 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/50 rounded-xl">
        <Lock className="h-5 w-5 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground">
          {t('premiumGate.premiumOnly')}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={onUpgrade}
          className="text-xs h-7 px-3"
        >
          {t('premiumGate.subscribe')}
        </Button>
      </div>
    </div>
  );
};

export default PremiumGate;
