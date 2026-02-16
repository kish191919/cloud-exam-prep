import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllExams } from '@/services/examService';
import { getSetsForExam, getQuestionsForSet } from '@/services/questionService';
import { createSession } from '@/hooks/useExamSession';
import {
  Clock, HelpCircle, Target, Play, Loader2,
  ChevronDown, ChevronUp, BookOpen, FlaskConical, CheckCircle2,
} from 'lucide-react';
import type { ExamConfig, ExamSet } from '@/types/exam';
import { useTranslation } from 'react-i18next';

const certColors: Record<string, string> = {
  AWS: 'bg-accent text-accent-foreground',
  GCP: 'bg-primary text-primary-foreground',
  Azure: 'bg-primary text-primary-foreground',
};

const ExamList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('pages');

  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [setsMap, setSetsMap] = useState<Record<string, ExamSet[]>>({});
  const [loadingSets, setLoadingSets] = useState<Record<string, boolean>>({});
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
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
      return;
    }
    setExpandedId(examId);
    setSelectedSetId(null);

    if (!setsMap[examId]) {
      setLoadingSets(prev => ({ ...prev, [examId]: true }));
      const sets = await getSetsForExam(examId);
      setSetsMap(prev => ({ ...prev, [examId]: sets }));
      setLoadingSets(prev => ({ ...prev, [examId]: false }));
    }
  };

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSetId || !expandedId || starting) return;

    const config = exams.find(ex => ex.id === expandedId);
    if (!config) return;

    setStarting(true);
    try {
      const questions = await getQuestionsForSet(selectedSetId);
      if (questions.length === 0) return;
      const sessionId = await createSession(expandedId, config.title, questions, config.timeLimitMinutes);
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
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${certColors[exam.certification]}`}>
                            {exam.certification}
                          </span>
                          <span className="text-xs text-muted-foreground">{exam.code}</span>
                          <span className="text-xs text-muted-foreground">v{exam.version}</span>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{exam.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{exam.description}</p>
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

                    {/* Expanded: set selection */}
                    {isExpanded && (
                      <div
                        className="mt-5 pt-5 border-t border-border"
                        onClick={e => e.stopPropagation()}
                      >
                        <p className="text-sm font-semibold mb-3">{t('examList.selectSet')}</p>

                        {isLoadingSet ? (
                          <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('examList.loadingSets')}
                          </div>
                        ) : sets.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">{t('examList.noSets')}</p>
                        ) : (
                          <div className="space-y-2 mb-4">
                            {sets.map(set => {
                              const isSelected = selectedSetId === set.id;
                              return (
                                <div
                                  key={set.id}
                                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                                    isSelected
                                      ? 'border-accent bg-accent/5 ring-1 ring-accent/40'
                                      : 'border-border hover:border-accent/40 hover:bg-muted/40'
                                  }`}
                                  onClick={() => setSelectedSetId(set.id)}
                                >
                                  {/* Custom radio indicator */}
                                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected ? 'border-accent' : 'border-muted-foreground/40'
                                  }`}>
                                    {isSelected && (
                                      <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                                    )}
                                  </div>

                                  {/* Type icon */}
                                  <div className={`p-2 rounded-lg shrink-0 ${set.type === 'sample' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                                    {set.type === 'sample'
                                      ? <FlaskConical className="h-4 w-4 text-primary" />
                                      : <BookOpen className="h-4 w-4 text-accent" />
                                    }
                                  </div>

                                  {/* Set info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium text-sm">{set.name}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        set.type === 'sample'
                                          ? 'bg-primary/10 text-primary'
                                          : 'bg-accent/10 text-accent'
                                      }`}>
                                        {set.type === 'sample' ? t('examList.sampleBadge') : t('examList.fullBadge')}
                                      </span>
                                    </div>
                                    {set.description && (
                                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{set.description}</p>
                                    )}
                                  </div>

                                  {/* Question count */}
                                  <div className="text-right shrink-0">
                                    <span className="text-sm font-semibold">{set.questionCount}</span>
                                    <span className="text-xs text-muted-foreground ml-1">{t('examList.questions')}</span>
                                  </div>

                                  {isSelected && (
                                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Start button */}
                        <div className="flex justify-end">
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
