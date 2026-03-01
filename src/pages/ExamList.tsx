import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllExams } from '@/services/examService';
import { getSetsForExam, getQuestionsForSet } from '@/services/questionService';
import { createSession, getAllSessions } from '@/hooks/useExamSession';
import {
  Play, Loader2,
  BookOpen, FlaskConical, CheckCircle2,
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
  Icon: React.ElementType;
  activeClass: string;
};

const FILTER_PROVIDERS = [
  { value: 'all', label: '전체' },
  { value: 'AWS', label: 'AWS' },
  { value: 'GCP', label: 'GCP' },
  { value: 'Azure', label: 'Azure' },
];

const MODE_OPTIONS: ModeOption[] = [
  {
    id: 'practice',
    labelKo: '연습모드',
    labelEn: 'Practice',
    Icon: Pencil,
    activeClass: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border-green-400 dark:border-green-500',
  },
  {
    id: 'study',
    labelKo: '해설모드',
    labelEn: 'Study',
    Icon: Eye,
    activeClass: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500',
  },
  {
    id: 'exam',
    labelKo: '실전모드',
    labelEn: 'Exam',
    Icon: Timer,
    activeClass: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-400 dark:border-orange-500',
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>('all');

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

  const handleModeSelect = async (examId: string, mode: ExamMode, e: React.MouseEvent) => {
    e.stopPropagation();
    const exam = exams.find(ex => ex.id === examId);
    if (!exam?.questionCount) return;

    // 같은 모드 재클릭 → 접기 (토글)
    if (expandedId === examId && selectedMode === mode) {
      setExpandedId(null);
      setSelectedMode(null);
      setSelectedSetId(null);
      setRandomizeOptions(false);
      return;
    }

    const isSwitchingExam = expandedId !== examId;

    // 다른 exam으로 전환 → set selection 초기화
    if (isSwitchingExam) {
      setSelectedSetId(null);
      setRandomizeOptions(false);
    }

    setExpandedId(examId);
    setSelectedMode(mode);

    // 샘플 세트 자동 선택 (없으면 첫 번째 세트)
    const autoSelectSample = (sets: ExamSet[]) => {
      const sample = sets.find(s => s.type === 'sample');
      setSelectedSetId(sample?.id ?? sets[0]?.id ?? null);
    };

    if (!setsMap[examId]) {
      setLoadingSets(prev => ({ ...prev, [examId]: true }));
      const sets = await getSetsForExam(examId);
      setSetsMap(prev => ({ ...prev, [examId]: sets }));
      setLoadingSets(prev => ({ ...prev, [examId]: false }));
      autoSelectSample(sets);
    } else if (isSwitchingExam) {
      autoSelectSample(setsMap[examId]);
    }
    // 같은 exam에서 모드만 전환 → 기존 세트 선택 유지
  };

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(null);
    setSelectedMode(null);
    setSelectedSetId(null);
    setRandomizeOptions(false);
  };

  const handleFilterChange = (provider: string) => {
    setFilterProvider(provider);
    setExpandedId(null);
    setSelectedMode(null);
    setSelectedSetId(null);
  };

  const filteredExams = filterProvider === 'all'
    ? exams
    : exams.filter(ex => ex.certification.toLowerCase() === filterProvider.toLowerCase());

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSetId || !selectedMode || !expandedId || starting) return;

    const config = exams.find(ex => ex.id === expandedId);
    if (!config) return;

    const sets = setsMap[expandedId] ?? [];
    const selectedSet = sets.find(s => s.id === selectedSetId);
    const setName = selectedSet?.name || '';

    setStarting(true);
    try {
      const questions = await getQuestionsForSet(selectedSetId);
      if (questions.length === 0) return;

      const allSessions = await getAllSessions(user?.id);

      const questionLastUpdated: Record<string, number> = {};
      const latestBookmarkStatus: Record<string, boolean> = {};

      allSessions
        .filter(s => s.examId === expandedId)
        .forEach(s => {
          const timestamp = s.startedAt;
          s.bookmarks.forEach(qid => {
            if (!questionLastUpdated[qid] || timestamp > questionLastUpdated[qid]) {
              questionLastUpdated[qid] = timestamp;
              latestBookmarkStatus[qid] = true;
            }
          });
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

      const questionIds = new Set(questions.map(q => q.id));
      const initialBookmarks = Array.from(questionIds).filter(qid => latestBookmarkStatus[qid] === true);

      const sessionTitle = setName ? `${config.title} - ${setName}` : config.title;

      const sessionId = await createSession(
        expandedId,
        sessionTitle,
        questions,
        config.timeLimitMinutes,
        selectedMode,
        randomizeOptions,
        user?.id || null,
        initialBookmarks,
        selectedSet?.type ?? 'full',
        selectedSet?.id
      );
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Error starting exam:', error);
    } finally {
      setStarting(false);
    }
  };

  // 세트 선택 패널 (데스크탑/모바일 분리)
  const renderSetPanel = (exam: ExamConfig, isMobile: boolean) => {
    const sets = setsMap[exam.id] ?? [];
    const isLoadingSet = loadingSets[exam.id];
    const modeOption = MODE_OPTIONS.find(m => m.id === selectedMode)!;

    // ── 모바일: 기존 세로 레이아웃 유지 ──
    if (isMobile) {
      return (
        <div
          className="animate-in fade-in duration-200 flex flex-col gap-3 w-full"
          onClick={e => e.stopPropagation()}
        >
          {/* 선택된 모드 표시 + 닫기 */}
          <button
            onClick={handleCollapse}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${modeOption.activeClass}`}
          >
            <modeOption.Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{isKo ? modeOption.labelKo : modeOption.labelEn}</span>
            <X className="h-3.5 w-3.5 ml-auto shrink-0" />
          </button>

          {/* 세트 목록 */}
          {isLoadingSet ? (
            <div className="flex items-center gap-2 py-3 text-muted-foreground text-sm">
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
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/30 ring-1 ring-green-400'
                        : 'border-border hover:border-green-400 hover:bg-muted/40'
                    }`}
                    onClick={() => setSelectedSetId(set.id)}
                  >
                    <div className={`p-1 rounded-md shrink-0 ${set.type === 'sample' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                      {set.type === 'sample'
                        ? <FlaskConical className="h-3 w-3 text-primary" />
                        : <BookOpen className="h-3 w-3 text-accent" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{set.name}</p>
                      <p className="text-xs text-muted-foreground">{set.questionCount}{t('examList.questions')}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* 랜덤화 + 시작 버튼 */}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={randomizeOptions}
                onChange={e => setRandomizeOptions(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
              />
              <Shuffle className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">{isKo ? '보기 순서 랜덤화' : 'Randomize Options'}</span>
            </label>
            <Button
              size="default"
              disabled={!selectedSetId || starting}
              onClick={handleStart}
              className={`w-full font-semibold transition-all ${
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
      );
    }

    // ── 데스크탑: 가로 레이아웃 (카드 높이 고정) ──
    return (
      <div
        className="animate-in fade-in duration-200 flex items-center gap-2"
        onClick={e => e.stopPropagation()}
      >
        {/* 모드 닫기 버튼 (compact 세로) */}
        <button
          onClick={handleCollapse}
          className={`flex flex-col items-center justify-center gap-1 px-2.5 py-2 rounded-xl border-2 text-xs font-semibold transition-all shrink-0 self-stretch ${modeOption.activeClass}`}
          style={{ minWidth: '52px' }}
        >
          <modeOption.Icon className="h-3.5 w-3.5 shrink-0" />
          <span className="text-center leading-tight text-[11px]">{isKo ? modeOption.labelKo : modeOption.labelEn}</span>
          <X className="h-3 w-3 shrink-0" />
        </button>

        {/* 세트 목록 (최대 2행, 세트 수에 따라 열 동적 확장) */}
        {isLoadingSet ? (
          <div className="flex items-center gap-2 px-3 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('examList.loadingSets')}
          </div>
        ) : sets.length === 0 ? (
          <p className="text-sm text-muted-foreground px-2">{t('examList.noSets')}</p>
        ) : (
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${sets.length <= 1 ? 1 : Math.max(2, Math.ceil(sets.length / 2))}, 110px)` }}
          >
            {sets.map(set => {
              const isSelected = selectedSetId === set.id;
              return (
                <div
                  key={set.id}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30 ring-1 ring-green-400'
                      : 'border-border hover:border-green-400 hover:bg-muted/40'
                  }`}
                  onClick={() => setSelectedSetId(set.id)}
                >
                  <div className={`p-0.5 rounded-md shrink-0 ${set.type === 'sample' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                    {set.type === 'sample'
                      ? <FlaskConical className="h-3 w-3 text-primary" />
                      : <BookOpen className="h-3 w-3 text-accent" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs truncate">{set.name}</p>
                    <p className="text-[10px] text-muted-foreground">{set.questionCount}{t('examList.questions')}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        )}

        {/* 랜덤화 + 시작 버튼 (우측 고정) */}
        <div className="flex flex-col gap-2 shrink-0 pl-2 border-l border-border" style={{ minWidth: '116px' }}>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={randomizeOptions}
              onChange={e => setRandomizeOptions(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-accent focus:ring-accent"
            />
            <Shuffle className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs leading-tight">{isKo ? '보기 순서 랜덤화' : 'Randomize'}</span>
          </label>
          <Button
            size="sm"
            disabled={!selectedSetId || starting}
            onClick={handleStart}
            className={`w-full font-semibold transition-all ${
              selectedSetId
                ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-md'
                : ''
            }`}
          >
            {starting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                {t('examList.starting')}
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-1" />
                {t('examList.startExam')}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{t('examList.title')}</h1>
          <p className="text-muted-foreground">{t('examList.subtitle')}</p>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {FILTER_PROVIDERS.map(p => (
              <button
                key={p.value}
                onClick={() => handleFilterChange(p.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                  filterProvider === p.value
                    ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                    : 'bg-transparent text-muted-foreground border-border hover:border-muted-foreground/50 hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExams.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                {filterProvider} {isKo ? '자격증이 아직 준비 중입니다.' : 'certifications are coming soon.'}
              </div>
            )}
            {filteredExams.map(exam => {
              const available = exam.questionCount > 0;
              const isExpanded = expandedId === exam.id;

              return (
                <Card
                  key={exam.id}
                  onMouseEnter={() => available && setHoveredId(exam.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`transition-all duration-200 ${
                    !available ? 'opacity-60' : 'hover:shadow-md hover:border-accent/50'
                  } ${isExpanded ? 'border-accent/60 shadow-md' : ''}`}
                >
                  <CardContent className="p-5 md:p-6">

                    {/* ── 헤더 행: 뱃지 + 정보 + 우측 패널(데스크탑) ── */}
                    <div className="flex items-stretch gap-4 md:gap-5">

                      {/* 뱃지 이미지 */}
                      {EXAM_BADGE_MAP[exam.id] && (
                        <>
                          {/* 데스크탑: 카드 높이 전체 채우기 */}
                          <div className="hidden md:flex shrink-0 self-stretch items-center">
                            <img
                              src={EXAM_BADGE_MAP[exam.id]}
                              alt={`${exam.title} badge`}
                              className="h-full w-24 object-contain rounded-lg"
                              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                          {/* 모바일: 고정 크기 */}
                          <img
                            src={EXAM_BADGE_MAP[exam.id]}
                            alt={`${exam.title} badge`}
                            className="md:hidden w-20 h-20 shrink-0 object-contain rounded-lg"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        </>
                      )}

                      {/* 제목 + 설명 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${certColors[exam.certification]}`}>
                            {exam.certification}
                          </span>
                          <span className="text-xs text-muted-foreground">{exam.code}</span>
                          <span className="text-xs text-muted-foreground">v{exam.version}</span>
                          {!available && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                              {t('examList.comingSoon')}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg leading-snug">{exam.title}</h3>
                        {/* 설명: 데스크탑에서만 표시, 확장 시 숨김 */}
                        <p className={`text-sm text-muted-foreground mt-1 line-clamp-2 ${isExpanded ? 'hidden' : 'hidden md:block'}`}>
                          {isKo
                            ? (EXAM_DESC_MAP[exam.id]?.ko ?? exam.description)
                            : (EXAM_DESC_MAP[exam.id]?.en ?? exam.description)
                          }
                        </p>
                      </div>

                      {/* 데스크탑: 세트 선택 패널 (확장 시에만 우측 표시) */}
                      {isExpanded && selectedMode && (
                        <div className="hidden md:block shrink-0">
                          {renderSetPanel(exam, false)}
                        </div>
                      )}
                    </div>

                    {/* ── 하단: 모드 버튼 (가로) OR 세트 선택 패널 (모바일) ── */}
                    <div>
                      {/* 모바일: 확장 시 세트 선택 패널 */}
                      {isExpanded && selectedMode && (
                        <div className="md:hidden mt-3">
                          {renderSetPanel(exam, true)}
                        </div>
                      )}

                      {/* 모드 버튼: 모바일 항상 표시 / 데스크탑 hover·확장 시 표시 */}
                      {!isExpanded && (
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out
                          max-h-16 opacity-100 mt-3
                          ${hoveredId === exam.id
                            ? 'md:max-h-16 md:opacity-100 md:mt-4'
                            : 'md:max-h-0 md:opacity-0 md:mt-0 md:pointer-events-none'
                          }
                        `}>
                          <div className="grid grid-cols-3 gap-2 md:gap-3">
                            {MODE_OPTIONS.map(m => (
                              <button
                                key={m.id}
                                onClick={(e) => handleModeSelect(exam.id, m.id, e)}
                                disabled={!available}
                                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 transition-all
                                  ${!available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                  border-border hover:border-muted-foreground/40 bg-card hover:bg-muted/30`}
                              >
                                <m.Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="font-semibold text-sm">{isKo ? m.labelKo : m.labelEn}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

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
