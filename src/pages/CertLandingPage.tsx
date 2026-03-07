import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock, FileText, Target, ExternalLink, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ExamBadge from '@/components/ExamBadge';
import ContactFloatingButton from '@/components/ContactFloatingButton';
import { CERT_LANDING_DATA } from '@/data/certLandingData';
import { PROVIDERS } from '@/data/certifications';

const CertLandingPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const { user, openAuthModal } = useAuth();
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const data = examId ? CERT_LANDING_DATA[examId] : null;
  const cert = PROVIDERS.flatMap(p => p.certifications).find(c => c.examId === examId);

  if (!data || !cert) {
    return <Navigate to="/certifications" replace />;
  }

  const handleStartClick = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      window.location.href = '/exams';
    }
  };

  const pageTitle = isKo
    ? `${data.fullName} (${data.code}) 한국어 모의고사 | CloudMasterIT`
    : `${data.fullNameEn} (${data.code}) Korean Practice Exam | CloudMasterIT`;

  const metaDesc = isKo ? data.metaDescription : data.metaDescriptionEn;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: data.fullNameEn,
    description: data.metaDescriptionEn,
    provider: {
      '@type': 'Organization',
      name: 'CloudMasterIT',
      url: 'https://cloudmasterit.com',
    },
    educationalCredentialAwarded: data.code,
    url: `https://cloudmasterit.com/cert/${examId}`,
  };

  const stats = [
    {
      label: isKo ? '시험 시간' : 'Duration',
      value: `${data.durationMin}${isKo ? '분' : 'min'}`,
      icon: <Clock className="h-4 w-4" />,
    },
    {
      label: isKo ? '출제 문항' : 'Questions',
      value: `${data.examQuestions}${isKo ? '문항' : 'Q'}`,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: isKo ? '합격 점수' : 'Pass Score',
      value: `${data.passingScore}/1000`,
      icon: <Target className="h-4 w-4" />,
    },
    {
      label: isKo ? '모의고사' : 'Practice Q',
      value: `${data.dbCountApprox.toLocaleString()}+`,
      icon: <BookOpen className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={`https://cloudmasterit.com/cert/${examId}`} />
        <link rel="canonical" href={`https://cloudmasterit.com/cert/${examId}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <ContactFloatingButton />
      <Navbar />

      {/* Hero */}
      <section className="relative hero-gradient text-primary-foreground pt-24 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 hero-dots pointer-events-none" />
        <div className="container mx-auto max-w-4xl relative z-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-primary-foreground/60 mb-6">
            <Link to="/" className="hover:text-primary-foreground/90 transition-colors">
              {isKo ? '홈' : 'Home'}
            </Link>
            <span>/</span>
            <Link to="/certifications" className="hover:text-primary-foreground/90 transition-colors">
              {isKo ? '자격증' : 'Certifications'}
            </Link>
            <span>/</span>
            <span className="text-primary-foreground/90">{data.code}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
            <div className="shrink-0">
              <ExamBadge provider={data.provider} code={data.code} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent text-accent-foreground">
                  {data.provider}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground">
                  {isKo ? data.level : data.levelEn}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight break-keep">
                {data.fullName}
                <span className="block text-accent mt-1">
                  ({data.code}) {isKo ? '한국어 모의고사' : 'Korean Practice Exam'}
                </span>
              </h1>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-primary-foreground/10 backdrop-blur-md rounded-xl p-4 border border-primary-foreground/20">
                <div className="flex items-center gap-1.5 text-primary-foreground/70 mb-1">
                  <span className="text-accent">{stat.icon}</span>
                  <span className="text-xs font-medium">{stat.label}</span>
                </div>
                <div className="text-xl font-black text-accent">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              onClick={handleStartClick}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold px-8 py-6 text-base rounded-xl shadow-2xl hover:shadow-accent/50 transition-all hover:scale-105 accent-glow"
            >
              {isKo ? '무료로 연습 시작하기' : 'Start Practicing for Free'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <a href={data.officialUrl} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="ghost"
                className="border-2 border-primary-foreground/50 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 hover:text-primary-foreground font-semibold px-6 py-6 text-base rounded-xl backdrop-blur-sm transition-all hover:scale-105"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {isKo ? '공식 시험 안내' : 'Official Exam Guide'}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-10 px-4 border-b border-border">
        <div className="container mx-auto max-w-4xl">
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed break-keep">
            {isKo ? cert.description : cert.descriptionEn}
          </p>
          {data.renewalYears > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              {isKo
                ? `유효 기간: 취득 후 ${data.renewalYears}년 (재인증 필요)`
                : `Validity: ${data.renewalYears} years after passing (renewal required)`}
            </p>
          )}
        </div>
      </section>

      {/* Domain Breakdown */}
      <section className="py-14 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-xl md:text-3xl font-bold mb-2 break-keep">
            {isKo ? '도메인별 출제 비율' : 'Exam Domain Breakdown'}
          </h2>
          <p className="text-sm text-muted-foreground mb-8 break-keep">
            {isKo
              ? `총 ${data.examQuestions}문항 · ${data.durationMin}분 · 합격 점수 ${data.passingScore}점`
              : `${data.examQuestions} questions · ${data.durationMin} min · Passing score ${data.passingScore}`}
          </p>
          <div className="space-y-4">
            {data.domains.map((domain, i) => (
              <div key={i} className="bg-card rounded-xl border p-5">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <h3 className="font-semibold text-base break-keep">
                    {isKo ? domain.name : domain.nameEn}
                  </h3>
                  <span className="text-accent font-black text-lg">{domain.percent}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full mb-3">
                  <div
                    className="h-2 bg-accent rounded-full"
                    style={{ width: `${domain.percent}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {domain.topics.map((topic, ti) => (
                    <span key={ti} className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Modes */}
      <section className="py-14 px-4 section-alt">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-xl md:text-3xl font-bold mb-2 text-center break-keep">
            {isKo ? '3가지 학습 모드' : '3 Study Modes'}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8 break-keep">
            {isKo ? '학습 목적에 맞게 모드를 선택하세요.' : 'Choose the mode that fits your learning style.'}
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                color: 'border-green-400 bg-green-50 dark:bg-green-950/40',
                textColor: 'text-green-700 dark:text-green-400',
                title: isKo ? '연습 모드' : 'Practice Mode',
                desc: isKo
                  ? '문제를 풀면 즉시 정답과 해설을 확인합니다. 틀린 문제 복습에 최적.'
                  : 'Get instant feedback after each question. Best for reviewing wrong answers.',
              },
              {
                color: 'border-blue-400 bg-blue-50 dark:bg-blue-950/40',
                textColor: 'text-blue-700 dark:text-blue-400',
                title: isKo ? '해설 모드' : 'Study Mode',
                desc: isKo
                  ? '정답·해설을 처음부터 보며 개념을 학습합니다. 처음 공부하는 분께 추천.'
                  : 'Study with answers shown from the start. Recommended for beginners.',
              },
              {
                color: 'border-orange-400 bg-orange-50 dark:bg-orange-950/40',
                textColor: 'text-orange-700 dark:text-orange-400',
                title: isKo ? '실전 모드' : 'Exam Mode',
                desc: isKo
                  ? `실제 시험과 동일한 ${data.durationMin}분 제한 환경. 실전 감각을 극대화합니다.`
                  : `Timed ${data.durationMin}-minute environment matching real exam conditions.`,
              },
            ].map((mode, i) => (
              <div key={i} className={`rounded-xl border-2 p-5 ${mode.color}`}>
                <h3 className={`font-bold text-lg mb-2 ${mode.textColor}`}>{mode.title}</h3>
                <p className="text-sm text-muted-foreground break-keep">{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient text-primary-foreground py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 hero-dots pointer-events-none" />
        <div className="container mx-auto text-center max-w-2xl relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 break-keep">
            {isKo
              ? `${data.code} 합격을 향해 지금 시작하세요`
              : `Start your ${data.code} journey today`}
          </h2>
          <p className="text-primary-foreground/70 mb-7 break-keep">
            {isKo
              ? `${data.dbCountApprox.toLocaleString()}개 이상의 한국어 문제로 실전 감각을 키우세요. 무료로 시작할 수 있습니다.`
              : `Practice with ${data.dbCountApprox.toLocaleString()}+ Korean questions. Start for free.`}
          </p>
          <Button
            size="lg"
            onClick={handleStartClick}
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-10 py-6 accent-glow"
          >
            {isKo ? '무료로 연습 시작하기' : 'Start Practicing for Free'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CertLandingPage;
