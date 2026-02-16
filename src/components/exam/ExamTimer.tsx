import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ExamTimerProps {
  startedAt: number;
  timeLimitSec: number;
  onTimeUp: () => void;
}

const ExamTimer = ({ startedAt, timeLimitSec, onTimeUp }: ExamTimerProps) => {
  const [remaining, setRemaining] = useState(timeLimitSec);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, timeLimitSec - elapsed);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, timeLimitSec, onTimeUp]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const isLow = remaining < 300;

  const timeStr = hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className={`flex items-center gap-2 font-mono text-sm font-semibold px-3 py-1.5 rounded-md ${
      isLow ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground'
    }`}>
      <Clock className="h-4 w-4" />
      {timeStr}
    </div>
  );
};

export default ExamTimer;
