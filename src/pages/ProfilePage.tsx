import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { getAllSessions } from '@/hooks/useExamSession';
import type { ExamSession } from '@/types/exam';
import { Crown, BookOpen, Target, TrendingUp, Calendar, LogIn, Mail, Star, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const PROVIDER_LABEL: Record<string, string> = {
  google: 'Google',
  kakao: '카카오',
  naver: '네이버',
  email: '이메일',
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ProfilePage() {
  const { user, subscriptionTier, isPremium, hasFullAccess, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();

  const [profile, setProfile] = useState<{
    subscription_expires_at: string | null;
    created_at: string;
  } | null>(null);
  const [freeEventExpiry, setFreeEventExpiry] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const [profileResult, settingsResult, sessionData] = await Promise.all([
        supabase
          .from('profiles')
          .select('subscription_expires_at, created_at')
          .eq('id', user.id)
          .single(),
        supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'free_access_event')
          .single(),
        getAllSessions(user.id),
      ]);

      if (profileResult.data) setProfile(profileResult.data);
      setFreeEventExpiry(settingsResult.data?.value?.expires_at ?? null);
      setSessions(sessionData);
      setLoading(false);
    };

    loadData();
  }, [user]);

  if (!user) {
    openAuthModal('login');
    return <Navigate to="/" replace />;
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자';
  const userInitial = userName[0]?.toUpperCase() || 'U';
  const provider = (user.identities?.[0]?.provider ?? 'email') as string;
  const providerLabel = PROVIDER_LABEL[provider] ?? '이메일';

  const submitted = sessions.filter((s) => s.status === 'submitted');
  const inProgress = sessions.filter((s) => s.status === 'in_progress');
  const avgScore =
    submitted.length > 0
      ? Math.round(submitted.reduce((sum, s) => sum + (s.score || 0), 0) / submitted.length)
      : 0;

  const stats = [
    { icon: BookOpen, label: '완료한 시험', value: `${submitted.length}회` },
    { icon: Target, label: '평균 점수', value: submitted.length > 0 ? `${avgScore}%` : '-' },
    { icon: TrendingUp, label: '진행 중', value: `${inProgress.length}개` },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-24 max-w-3xl">
        {/* 프로필 헤더 */}
        <div className="flex items-center gap-5 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-accent text-accent-foreground text-2xl font-bold">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{userName}</h1>
            <p className="text-muted-foreground text-sm truncate">{user.email}</p>
            <Badge variant="outline" className="mt-1 text-xs">
              {providerLabel} 로그인
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 구독 상태 */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="h-4 w-4 text-amber-500" />
                구독 상태
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className={
                    isPremium
                      ? 'bg-amber-500 text-white hover:bg-amber-500'
                      : 'bg-muted text-muted-foreground hover:bg-muted'
                  }
                >
                  {isPremium ? '프리미엄' : '무료'}
                </Badge>

                {isPremium && profile?.subscription_expires_at && (
                  <span className="text-sm text-muted-foreground">
                    만료일: {formatDate(profile.subscription_expires_at)}
                  </span>
                )}

                {!isPremium && hasFullAccess && freeEventExpiry && (
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">
                    무료 이벤트 기간 중 ({formatDate(freeEventExpiry)}까지 전체 이용 가능)
                  </span>
                )}
              </div>

              {!isPremium && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                  <Star className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-sm text-muted-foreground flex-1">
                    프리미엄으로 업그레이드하면 모든 시험 문제를 제한 없이 이용할 수 있습니다.
                  </p>
                  <Button size="sm" disabled className="shrink-0">
                    준비 중
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 학습 통계 */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-accent" />
                학습 통계
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">불러오는 중...</p>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 text-center">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <s.icon className="h-5 w-5 text-accent" />
                      </div>
                      <p className="text-xl font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {!loading && submitted.length > 0 && (
                <div className="mt-4">
                  <Link to="/review">
                    <Button variant="outline" size="sm">
                      오답 복습 보기
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 환경 설정 */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-accent" />
                환경 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm font-medium mb-2">화면 모드</p>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    라이트
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    다크
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">언어</p>
                <div className="flex gap-2">
                  <Button
                    variant={i18n.language === 'ko' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => i18n.changeLanguage('ko')}
                  >
                    🇰🇷 한국어
                  </Button>
                  <Button
                    variant={i18n.language === 'en' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => i18n.changeLanguage('en')}
                  >
                    🇺🇸 English
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 계정 정보 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-accent" />
                계정 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">가입일</span>
                <span>{formatDate(profile?.created_at || user.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">마지막 로그인</span>
                <span>{formatDate(user.last_sign_in_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">로그인 방법</span>
                <span>{providerLabel}</span>
              </div>
            </CardContent>
          </Card>

          {/* 빠른 이동 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <LogIn className="h-4 w-4 text-accent" />
                빠른 이동
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link to="/exams">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  연습 문제 풀기
                </Button>
              </Link>
              <Link to="/certifications">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  자격증 로드맵
                </Button>
              </Link>
              {submitted.length > 0 && (
                <Link to="/review">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    오답 복습
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
