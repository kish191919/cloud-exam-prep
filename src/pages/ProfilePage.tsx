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
import { Crown, BookOpen, Target, TrendingUp, Calendar, LogIn, Star, Sun, Moon, Globe, Leaf, Flag, MessageSquare, ChevronDown, Pencil, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { useFontSize } from '@/contexts/FontSizeContext';
import { useFontFamily } from '@/contexts/FontFamilyContext';
import { useTranslation } from 'react-i18next';
import { getMyReports, getQuestionSetInfo, REASON_LABELS, STATUS_LABELS, type QuestionReport, type QuestionSetInfo } from '@/services/reportService';
import { getMyContacts } from '@/services/contactService';
import { CATEGORY_LABELS as CONTACT_CATEGORY_LABELS, STATUS_LABELS as CONTACT_STATUS_LABELS, type ContactMessage, type ContactStatus } from '@/types/contact';

function makeDateFormatter(lang: string) {
  const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
  return (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
}

export default function ProfilePage() {
  const { user, subscriptionTier, isPremium, hasFullAccess, openAuthModal } = useAuth();
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const { fontFamily, setFontFamily } = useFontFamily();
  const { t, i18n } = useTranslation('pages');
  const formatDate = makeDateFormatter(i18n.language);

  const [profile, setProfile] = useState<{
    subscription_expires_at: string | null;
    created_at: string;
  } | null>(null);
  const [freeEventExpiry, setFreeEventExpiry] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [myReports, setMyReports] = useState<QuestionReport[]>([]);
  const [reportSetInfo, setReportSetInfo] = useState<Record<string, QuestionSetInfo>>({});
  const [myContacts, setMyContacts] = useState<ContactMessage[]>([]);
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const [profileResult, settingsResult, sessionData, reportsData, contactsData] = await Promise.all([
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
        getMyReports(user.id).catch(() => [] as QuestionReport[]),
        getMyContacts(user.id).catch(() => [] as ContactMessage[]),
      ]);

      if (profileResult.data) setProfile(profileResult.data);
      setFreeEventExpiry(settingsResult.data?.value?.expires_at ?? null);
      setSessions(sessionData);
      setMyReports(reportsData);
      setMyContacts(contactsData);

      // 신고한 문제의 세트 정보 로드
      if (reportsData.length > 0) {
        const ids = reportsData.map(r => r.question_id);
        getQuestionSetInfo(ids).then(setReportSetInfo).catch(() => {});
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  if (!user) {
    openAuthModal('login');
    return <Navigate to="/" replace />;
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || t('profile.defaultUser');
  const userInitial = userName[0]?.toUpperCase() || 'U';
  const provider = (user.identities?.[0]?.provider ?? 'email') as string;
  const providerLabel = t(`profile.providers.${provider}`, t('profile.providers.email'));

  const handleEditName = () => {
    setNameInput(userName);
    setEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === userName) {
      setEditingName(false);
      return;
    }
    setNameSaving(true);
    await supabase.auth.updateUser({ data: { full_name: trimmed } });
    setNameSaving(false);
    setEditingName(false);
    window.location.reload();
  };

  const handleCancelName = () => {
    setEditingName(false);
    setNameInput('');
  };

  const submitted = sessions.filter((s) => s.status === 'submitted');
  const inProgress = sessions.filter((s) => s.status === 'in_progress');
  const avgScore =
    submitted.length > 0
      ? Math.round(submitted.reduce((sum, s) => sum + (s.score || 0), 0) / submitted.length)
      : 0;

  const stats = [
    { icon: BookOpen, label: t('profile.stats.examsTaken'), value: `${submitted.length}${t('profile.stats.examsTakenUnit')}` },
    { icon: Target, label: t('profile.stats.averageScore'), value: submitted.length > 0 ? `${avgScore}%` : '-' },
    { icon: TrendingUp, label: t('profile.stats.inProgress'), value: `${inProgress.length}${t('profile.stats.inProgressUnit')}` },
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
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelName();
                  }}
                  className="h-8 text-lg font-bold w-48"
                  autoFocus
                  disabled={nameSaving}
                />
                <button
                  onClick={handleSaveName}
                  disabled={nameSaving}
                  className="text-accent hover:text-accent/80 disabled:opacity-50"
                  title={t('profile.saveName')}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancelName}
                  disabled={nameSaving}
                  className="text-muted-foreground hover:text-foreground"
                  title={t('profile.cancelName')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold truncate">{userName}</h1>
                <button
                  onClick={handleEditName}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title={t('profile.editName')}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}
            <Badge variant="outline" className="mt-1 text-xs">
              {t('profile.providerLogin', { provider: providerLabel })}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 구독 상태 */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="h-4 w-4 text-amber-500" />
                {t('profile.subscription.title')}
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
                  {isPremium ? t('profile.subscription.premium') : t('profile.subscription.free')}
                </Badge>

                {isPremium && profile?.subscription_expires_at && (
                  <span className="text-sm text-muted-foreground">
                    {t('profile.subscription.expiresOn', { date: formatDate(profile.subscription_expires_at) })}
                  </span>
                )}

                {!isPremium && hasFullAccess && freeEventExpiry && (
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">
                    {t('profile.subscription.freeEvent', { date: formatDate(freeEventExpiry) })}
                  </span>
                )}
              </div>

              {!isPremium && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                  <Star className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-sm text-muted-foreground flex-1">
                    {t('profile.subscription.upgradeDesc')}
                  </p>
                  <Button size="sm" disabled className="shrink-0">
                    {t('profile.subscription.upgradeBtn')}
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
                {t('profile.stats.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">{t('profile.stats.loading')}</p>
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
                      {t('profile.stats.reviewBtn')}
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
                {t('profile.settings.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm font-medium mb-2">{t('profile.settings.themeLabel')}</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { key: 'light',  Icon: Sun      },
                    { key: 'sepia',  Icon: BookOpen },
                    { key: 'forest', Icon: Leaf     },
                    { key: 'dark',   Icon: Moon     },
                  ] as const).map(({ key, Icon }) => (
                    <Button
                      key={key}
                      variant={theme === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme(key)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {t(`profile.settings.themes.${key}`)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">{t('profile.settings.languageLabel')}</p>
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

              <div>
                <p className="text-sm font-medium mb-2">{t('profile.settings.fontSizeLabel')}</p>
                <div className="flex gap-2">
                  {(['sm', 'md', 'lg'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={fontSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFontSize(size)}
                    >
                      {t(`profile.settings.fontSizes.${size}`)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">{t('profile.settings.fontFamilyLabel')}</p>
                <div className="flex flex-wrap gap-2">
                  {(['outfit', 'inter', 'noto-sans-kr', 'nanum-gothic', 'roboto', 'nunito'] as const).map((family) => (
                    <Button
                      key={family}
                      variant={fontFamily === family ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFontFamily(family)}
                    >
                      {t(`profile.settings.fontFamilies.${family}`)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 계정 정보 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-accent" />
                {t('profile.account.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('profile.account.joinedAt')}</span>
                <span>{formatDate(profile?.created_at || user.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('profile.account.lastLogin')}</span>
                <span>{formatDate(user.last_sign_in_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('profile.account.loginMethod')}</span>
                <span>{providerLabel}</span>
              </div>
            </CardContent>
          </Card>

          {/* 빠른 이동 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <LogIn className="h-4 w-4 text-accent" />
                {t('profile.quickNav.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link to="/exams">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {t('profile.quickNav.practice')}
                </Button>
              </Link>
              <Link to="/certifications">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  {t('profile.quickNav.roadmap')}
                </Button>
              </Link>
              {submitted.length > 0 && (
                <Link to="/review">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {t('profile.quickNav.review')}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* 내 신고 내역 */}
          {/* 내 문의내역 */}
          {myContacts.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-accent" />
                  {t('profile.contacts.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {myContacts.map(contact => {
                    const isExpanded = expandedContact === contact.id;
                    const statusColor: Record<ContactStatus, string> = {
                      unread: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
                      read: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
                      responded: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
                      closed: 'bg-muted text-muted-foreground',
                    };
                    return (
                      <div
                        key={contact.id}
                        className="rounded-lg border border-border text-sm"
                      >
                        <button
                          className="w-full flex items-start gap-2 p-3 text-left hover:bg-muted/30 transition-colors rounded-lg"
                          onClick={() => setExpandedContact(isExpanded ? null : contact.id)}
                        >
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                                {CONTACT_CATEGORY_LABELS[contact.category]}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${statusColor[contact.status]}`}>
                                {CONTACT_STATUS_LABELS[contact.status]}
                              </span>
                              <span className="font-medium truncate">{contact.subject}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(contact.createdAt).toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}
                            </p>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {isExpanded && (
                          <div className="px-3 pb-3 space-y-2 border-t border-border pt-3">
                            <div className="rounded-lg bg-muted/40 p-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">{t('profile.contacts.messageLabel')}</p>
                              <p className="text-sm whitespace-pre-wrap">{contact.message}</p>
                            </div>
                            {contact.adminResponse && (
                              <div className="rounded-lg p-3 bg-accent/5 border border-accent/20">
                                <p className="text-xs font-medium text-accent mb-1">{t('profile.contacts.adminReply')}</p>
                                <p className="text-sm whitespace-pre-wrap">{contact.adminResponse}</p>
                                {contact.respondedAt && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(contact.respondedAt).toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}
                                  </p>
                                )}
                              </div>
                            )}
                            {!contact.adminResponse && contact.status !== 'closed' && (
                              <p className="text-xs text-muted-foreground italic">{t('profile.contacts.noReply')}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {myReports.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Flag className="h-4 w-4 text-orange-500" />
                  {t('profile.reports.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {myReports.map(report => (
                    <div
                      key={report.id}
                      className="flex flex-col sm:flex-row sm:items-start gap-2 p-3 rounded-lg border border-border text-sm"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {reportSetInfo[report.question_id] ? (
                            <span className="text-xs font-medium">
                              {reportSetInfo[report.question_id].setName}
                              <span className="text-muted-foreground"> · {reportSetInfo[report.question_id].sortOrder}번</span>
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground">{report.question_id}</span>
                          )}
                          <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                            {REASON_LABELS[report.reason]}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            report.status === 'resolved'
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                              : report.status === 'dismissed'
                              ? 'bg-muted text-muted-foreground'
                              : report.status === 'reviewing'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400'
                          }`}>
                            {STATUS_LABELS[report.status]}
                          </span>
                        </div>
                        {report.comment && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{report.comment}</p>
                        )}
                        {report.admin_note && (
                          <div className="mt-1 p-2 rounded bg-accent/5 border border-accent/20">
                            <p className="text-xs font-medium text-accent mb-0.5">{t('profile.reports.adminNote')}</p>
                            <p className="text-xs text-foreground">{report.admin_note}</p>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(report.created_at).toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
