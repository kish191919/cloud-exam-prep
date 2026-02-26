import { Button } from '@/components/ui/button';
import { useFontSize } from '@/contexts/FontSizeContext';

const LABEL: Record<string, string> = {
  sm: 'A−',
  md: 'A',
  lg: 'A+',
};

const TITLE: Record<string, string> = {
  sm: '글씨 크기: 작게 (클릭하면 보통으로)',
  md: '글씨 크기: 보통 (클릭하면 크게)',
  lg: '글씨 크기: 크게 (클릭하면 작게)',
};

const FontSizeToggle = () => {
  const { fontSize, cycleFontSize } = useFontSize();

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={cycleFontSize}
      className="text-xs sm:text-sm px-2 sm:px-2.5 h-8 text-muted-foreground hover:text-foreground font-semibold"
      title={TITLE[fontSize]}
      aria-label={TITLE[fontSize]}
    >
      {LABEL[fontSize]}
    </Button>
  );
};

export default FontSizeToggle;
