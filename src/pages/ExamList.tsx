import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllExams } from '@/services/examService';
import { getSetsForExam, getQuestionsForSet } from '@/services/questionService';
import { createSession, getAllSessions } from '@/hooks/useExamSession';
import {
  Clock, HelpCircle, Target, Play, Loader2,
  ChevronDown, ChevronUp, BookOpen, FlaskConical, CheckCircle2,
  Pencil, Eye, Timer, Shuffle, X,
} from 'lucide-react';
import type { ExamConfig, ExamSet, ExamMode } from '@/types/exam';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { PROVIDERS } from '@/data/certifications';

const certColors: Record<string, string> = {
  AWS: 'bg-accent text-accent-foreground',
  GCP: 'bg-primary text-primary-foreground',
  Azure: 'bg-primary text-primary-foreground',
};

const EXAM_BADGE_MAP: Record<string, string> = {
  'aws-aif-c01': '/badges/aws-aif-c01.png',
  'aws-clf-c02': '/badges/aws-clf-c02.png',
  'aws-dea-c01': '/badges/aws-dea-c01.png',
  'aws-saa-c03': '/badges/aws-saa-c03.png',
};

// certifications.ts의 description(한국어) / descriptionEn(영어) 데이터를 examId 기준으로 매핑
const EXAM_DESC_MAP: Record<string, { ko: string; en: string }> = {
  'aws-dea-c01': {
    ko: 'AWS 데이터 서비스를 활용한 데이터 파이프라인 구축과 데이터 저장소 설계 역량을 검증합니다.',
    en: 'Validates skills in implementing data pipelines and designing data stores using AWS data services.',
  },
};
for (const provider of PROVIDERS) {
  for (const cert of provider.certifications) {
    if (cert.examId && !EXAM_DESC_MAP[cert.examId]) {
      EXAM_DESC_MAP[cert.examId] = {
        ko: cert.description,
        en: cert.descriptionEn,
      };
    }
  }
}

type ModeOption = {
  id: ExamMode;
  labelKo: string;
  labelEn: string;
  descKo: string;
  descEn: string;
  Icon: React.ElementType;
  color: string;
};

const MODE_OPTIONS: ModeOption[] = [
  {
    id: 'practice',
    labelKo: '연습모드',
    labelEn: 'Practice',
    descKo: '보기 선택 즉시 정답/오답 확인. 해설 표시.',
    descEn: 'Instant feedback on each answer. Explanation shown.',
    Icon: Pencil,
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  {
    id: 'study',
    labelKo: '해설모드',
    labelEn: 'Study',
    descKo: '정답과 해설이 처음부터 표시. 개념 학습에 최적.',
    descEn: 'Answer and explanation shown immediately. Best for learning.',
    Icon: Eye,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'exam',
    labelKo: '실전모드',
    labelEn: 'Exam',
    descKo: '시간제한, 제출 후 결과 확인. 실전처럼 연습.',
    descEn: 'Timed, submit at end for results. Just like the real exam.',
    Icon: Timer,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
  },
];

const ExamList = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('pages');
  const isKo = i18n.language === 'ko';
  const { user } = useAuth();

  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [setsMap, setSetsMap] = useState<Record<string, ExamSet[]>>({});
  const [loadingSets, setLoadingSets] = useState<Record<string, boolean>>({});
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ExamMode | null>(null);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function loadExams() {
      try {
        const examData = await getAllExams();
        setExams(examData);
      } catch (error) {
        console.error('Error loading exams:', error);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  const handleExamClick = async (examId: string) => {
    if (expandedId === examId) {
      setExpandedId(null);
      setSelectedSetId(null);
      setSelectedMode(null);
      setRandomizeOptions(false);
      return;
    }
    setExpandedId(examId);
    setSelectedSetId(null);
    setSelectedMode(null);
    setRandomizeOptions(false);

    if (!setsMap[examId]) {
      setLoadingSets(prev => ({ ...prev, [examId]: true }));
      const sets = await getSetsForExam(examId);
      setSetsMap(prev => ({ ...prev, [examId]: sets }));
      setLoadingSets(prev => ({ ...prev, [examId]: false }));
    }
  };

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSetId || !selectedMode || !expandedId || starting) return;

    const config = exams.find(ex => ex.id === expandedId);
    if (!config) return;

    // Find the selected set to include its name in session title
    const sets = setsMap[expandedId] ?? [];
    const selectedSet = sets.find(s => s.id === selectedSetId);
    const setName = selectedSet?.name || '';

    setStarting(true);
    try {
      const questions = await getQuestionsForSet(selectedSetId);
      if (questions.length === 0) return;

      // Load previous bookmarks for this exam using latest-state logic
      // (same as ReviewPage) so that un-bookmarks in review sessions are respected.
      const allSessions = await getAllSessions(user?.id);

      const questionLastUpdated: Record<string, number> = {};
      const latestBookmarkStatus: Record<string, boolean> = {};

      allSessions
        .filter(s => s.examId === expandedId)
        .forEach(s => {
          const timestamp = s.startedAt;

          // Track explicitly bookmarked questions
          s.bookmarks.forEach(qid => {
            if (!questionLastUpdated[qid] || timestamp > questionLastUpdated[qid]) {
              questionLastUpdated[qid] = timestamp;
              latestBookmarkStatus[qid] = true;
            }
          });

          // Read stored question IDs from localStorage to detect un-bookmarked questions
          try {
            const storedIds = localStorage.getItem(`cloudmaster_questionids_${s.id}`);
            if (storedIds) {
              (JSON.parse(storedIds) as string[]).forEach(qid => {
                const isBookmarked = s.bookmarks.includes(qid);
                if (!questionLastUpdated[qid] || timestamp > questionLastUpdated[qid]) {
                  questionLastUpdated[qid] = timestamp;
                  latestBookmarkStatus[qid] = isBookmarked;
                }
              });
            }
          } catch {
            // ignore
          }
        });

      // Only pre-select bookmarks that are still active in the latest session
      const questionIds = new Set(questions.map(q => q.id));
      const initialBookmarks = Array.from(questionIds).filter(qid => latestBookmarkStatus[qid] === true);

      // Include set name in session title for better organization in review page
      const sessionTitle = setName ? `${config.title} - ${setName}` : config.title;

      const sessionId = await createSession(
        expandedId,
        sessionTitle,
        questions,
        config.timeLimitMinutes,
        selectedMode,
        randomizeOptions,
        user?.id || null, // userId - associate with logged-in user
        initialBookmarks,
        selectedSet?.type ?? 'full',  // setType: sample or full
        selectedSet?.id               // setId: for analytics
      );
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Error starting exam:', error);
    } finally {
      setStarting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{t('examList.title')}</h1>
          <p className="text-muted-foreground">{t('examList.subtitle')}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map(exam => {
              const available = exam.questionCount > 0;
              const isExpanded = expandedId === exam.id;
              const sets = setsMap[exam.id] ?? [];
              const isLoadingSet = loadingSets[exam.id];

              return (
                <Card
                  key={exam.id}
                  className={`transition-all duration-200 ${
                    !available
                      ? 'opacity-60'
                      : 'cursor-pointer hover:shadow-md hover:border-accent/50'
                  } ${isExpanded ? 'border-accent/60 shadow-md' : ''}`}
                  onClick={() => available && handleExamClick(exam.id)}
                >
                  <CardContent className="p-6">
                    {/* Exam header row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: badge image + exam info */}
                      <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                        {EXAM_BADGE_MAP[exam.id] && (
                          <img
                            src={EXAM_BADGE_MAP[exam.id]}
                            alt={`${exam.title} badge`}
                            className="w-14 h-14 md:w-16 md:h-16 shrink-0 object-contain rounded-lg"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${certColors[exam.certification]}`}>
                              {exam.certification}
                            </span>
                            <span className="text-xs text-muted-foreground">{exam.code}</span>
                            <span className="text-xs text-muted-foreground">v{exam.version}</span>
                          </div>
                          <h3 className="font-semibold text-lg mb-1">{exam.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {isKo
                              ? (EXAM_DESC_MAP[exam.id]?.ko ?? exam.description)
                              : (EXAM_DESC_MAP[exam.id]?.en ?? exam.description)
                            }
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <HelpCircle className="h-3.5 w-3.5" />
                              {exam.questionCount} {t('examList.questions')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {exam.timeLimitMinutes} {t('examList.minutes')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3.5 w-3.5" />
                              {exam.passingScore}% {t('examList.toPass')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {available ? (
                          isExpanded
                            ? <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            : <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <span className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-medium">
                            {t('examList.comingSoon')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expanded: mode + randomize + set selection */}
                    {isExpanded && (
                      <div
                        className="mt-5 pt-5 border-t border-border"
                        onClick={e => e.stopPropagation()}
                      >
                        {/* Mode selection OR Set selection: same vertical position */}
                        {!selectedMode ? (
                          <>
                            <p className="text-sm font-semibold mb-3">{t('examList.selectMode')}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {MODE_OPTIONS.map(m => (
                                <button
                                  key={m.id}
                                  onClick={() => setSelectedMode(m.id)}
                                  className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left border-border hover:border-muted-foreground/40 bg-card`}
                                >
                                  <div className="flex items-center gap-2">
                                    <m.Icon className="h-4 w-4" />
                                    <span className="font-semibold text-sm">
                                      {isKo ? m.labelKo : m.labelEn}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {isKo ? m.descKo : m.descEn}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="animate-in fade-in duration-200">
                            {/* Header: set selection label + selected mode badge */}
                            {(() => {
                              const modeOption = MODE_OPTIONS.find(m => m.id === selectedMode)!;
                              const ModeIcon = modeOption.Icon;
                              return (
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-sm font-semibold">{t('examList.selectSet')}</p>
                                  <button
                                    onClick={() => { setSelectedMode(null); setSelectedSetId(null); }}
                                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border hover:bg-muted/50 transition-colors ${modeOption.color}`}
                                  >
                                    <ModeIcon className="h-3 w-3" />
                                    <span>{isKo ? modeOption.labelKo : modeOption.labelEn}</span>
                                    <X className="h-3 w-3 ml-0.5 opacity-60" />
                                  </button>
                                </div>
                              );
                            })()}

                            {/* Set list */}
                            {isLoadingSet ? (
                              <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('examList.loadingSets')}
                              </div>
                            ) : sets.length === 0 ? (
                              <p className="text-sm text-muted-foreground py-2">{t('examList.noSets')}</p>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                {sets.map(set => {
                                  const isSelected = selectedSetId === set.id;
                                  return (
                                    <div
                                      key={set.id}
                                      className={`flex flex-col gap-1.5 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                                        isSelected
                                          ? 'border-green-500 bg-green-50 dark:bg-green-950/30 ring-1 ring-green-400'
                                          : 'border-border hover:border-green-400 hover:bg-muted/40'
                                      }`}
                                      onClick={() => setSelectedSetId(set.id)}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <div className={`p-1 rounded-md shrink-0 ${set.type === 'sample' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                                          {set.type === 'sample'
                                            ? <FlaskConical className="h-3 w-3 text-primary" />
                                            : <BookOpen className="h-3 w-3 text-accent" />
                                          }
                                        </div>
                                        <span className="font-medium text-sm truncate">{set.name}</span>
                                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 ml-auto" />}
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                          set.type === 'sample'
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-accent/10 text-accent'
                                        }`}>
                                          {set.type === 'sample' ? t('examList.sampleBadge') : t('examList.fullBadge')}
                                        </span>
                                        <span className="text-xs text-muted-foreground">· {set.questionCount}{t('examList.questions')}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Bottom row: randomize + start button inline */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={randomizeOptions}
                                  onChange={e => setRandomizeOptions(e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                                />
                                <Shuffle className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{isKo ? '보기 순서 랜덤화' : 'Randomize Options'}</span>
                              </label>
                              <Button
                                size="lg"
                                disabled={!selectedSetId || starting}
                                onClick={handleStart}
                                className={`font-semibold transition-all ${
                                  selectedSetId
                                    ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-md'
                                    : ''
                                }`}
                              >
                                {starting ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t('examList.starting')}
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4 mr-2" />
                                    {t('examList.startExam')}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ExamList;
