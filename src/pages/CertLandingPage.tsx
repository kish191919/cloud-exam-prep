import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock, FileText, Target, ExternalLink, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ExamBadge from '@/components/ExamBadge';
import { CERT_LANDING_DATA } from '@/data/certLandingData';
import { PROVIDERS } from '@/data/certifications';

const CertLandingPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const { user, openAuthModal } = useAuth();
  const { t, i18n } = useTranslation('pages');
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

  const certName = isKo ? data.fullName : data.fullNameEn;
  const pageTitle = `${certName} (${data.code}) ${t('certLanding.seo.titleSuffix')} | CloudMasterIT`;
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
      label: t('certLanding.stats.duration'),
      value: `${data.durationMin}${t('certLanding.stats.durationUnit')}`,
      icon: <Clock className="h-4 w-4" />,
    },
    {
      label: t('certLanding.stats.questions'),
      value: `${data.examQuestions}${t('certLanding.stats.questionsUnit')}`,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: t('certLanding.stats.passScore'),
      value: `${data.passingScore}/1000`,
      icon: <Target className="h-4 w-4" />,
    },
    {
      label: t('certLanding.stats.practiceQ'),
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

      <Navbar />

      {/* Hero */}
      <section className="relative hero-gradient text-primary-foreground pt-24 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 hero-dots pointer-events-none" />
        <div className="container mx-auto max-w-4xl relative z-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-primary-foreground/60 mb-6">
            <Link to="/" className="hover:text-primary-foreground/90 transition-colors">
              {t('certLanding.home')}
            </Link>
            <span>/</span>
            <Link to="/certifications" className="hover:text-primary-foreground/90 transition-colors">
              {t('certLanding.certifications')}
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
                {certName}
                <span className="block text-accent mt-1">
                  ({data.code}) {t('certLanding.practiceExamBadge')}
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
              {t('certLanding.startFree')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <a href={data.officialUrl} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="ghost"
                className="border-2 border-primary-foreground/50 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 hover:text-primary-foreground font-semibold px-6 py-6 text-base rounded-xl backdrop-blur-sm transition-all hover:scale-105"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('certLanding.officialGuide')}
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
              {t('certLanding.validity', { years: data.renewalYears })}
            </p>
          )}
        </div>
      </section>

      {/* Domain Breakdown */}
      <section className="py-14 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-xl md:text-3xl font-bold mb-2 break-keep">
            {t('certLanding.domainTitle')}
          </h2>
          <p className="text-sm text-muted-foreground mb-8 break-keep">
            {t('certLanding.domainSubtitle', { questions: data.examQuestions, duration: data.durationMin, score: data.passingScore })}
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
                      {isKo ? topic : (domain.topicsEn?.[ti] ?? topic)}
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
            {t('certLanding.studyModesTitle')}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8 break-keep">
            {t('certLanding.studyModesSubtitle')}
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                color: 'border-green-400 bg-green-50 dark:bg-green-950/40',
                textColor: 'text-green-700 dark:text-green-400',
                title: t('certLanding.practiceMode.title'),
                desc: t('certLanding.practiceMode.desc'),
              },
              {
                color: 'border-blue-400 bg-blue-50 dark:bg-blue-950/40',
                textColor: 'text-blue-700 dark:text-blue-400',
                title: t('certLanding.studyMode.title'),
                desc: t('certLanding.studyMode.desc'),
              },
              {
                color: 'border-orange-400 bg-orange-50 dark:bg-orange-950/40',
                textColor: 'text-orange-700 dark:text-orange-400',
                title: t('certLanding.examMode.title'),
                desc: t('certLanding.examMode.desc', { duration: data.durationMin }),
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
            {t('certLanding.ctaTitle', { code: data.code })}
          </h2>
          <p className="text-primary-foreground/70 mb-7 break-keep">
            {t('certLanding.ctaSubtitle', { count: data.dbCountApprox.toLocaleString() })}
          </p>
          <Button
            size="lg"
            onClick={handleStartClick}
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-10 py-6 accent-glow"
          >
            {t('certLanding.startFree')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CertLandingPage;
