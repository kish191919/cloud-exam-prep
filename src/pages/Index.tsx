import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Shield, BarChart3, Clock, BookOpen, ArrowRight,
  Cloud, Zap, Target, Users, Smartphone, CheckCircle2, Star, Map, Gift,
  Briefcase, GraduationCap, Rocket, Brain, Database, TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const Index = () => {
  const { t } = useTranslation(['pages', 'common']);
  const { canInstall, install } = usePWAInstall();

  const features = t('index.features', { returnObjects: true }) as Array<{ title: string; desc: string; icon: string }>;
  const steps = t('index.steps', { returnObjects: true }) as Array<{ num: string; title: string; desc: string }>;
  const faqs = t('index.faq.questions', { returnObjects: true }) as Array<{ q: string; a: string }>;
  const routineSteps = t('index.routine.steps', { returnObjects: true }) as Array<{
    time: string; duration: string; title: string; desc: string; icon: string;
  }>;
  const testimonials = t('index.testimonials.items', { returnObjects: true }) as Array<{
    name: string; role: string; cert: string; score: string; quote: string; period: string;
  }>;

  const audienceItems = t('index.audience.items', { returnObjects: true }) as Array<{ icon: string; title: string; desc: string }>;
  const whyCloudItems = t('index.whyCloud.items', { returnObjects: true }) as Array<{ icon: string; title: string; desc: string }>;

  const iconMap: Record<string, any> = {
    Shield, BarChart3, Clock, BookOpen, Target, Users, Smartphone,
    Briefcase, GraduationCap, Rocket, Brain, Database, TrendingUp,
  };

  // 기업 스크롤 데이터 (텍스트 전용 — 상표권 안전)
  const companiesRow1 = ['Netflix', '삼성전자', 'Kakao', 'Naver', '현대자동차', 'LG전자', '쿠팡', 'SK텔레콤', 'LINE', 'Airbnb', 'Spotify', 'Toyota', 'BMW'];
  const companiesRow2 = ['NASA', 'Slack', 'Zoom', 'Adobe', 'Dropbox', 'Reddit', 'Pinterest', 'Twitch', 'McDonald\'s', 'GE', 'Pfizer', '배달의민족', 'Hyundai'];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Beta Announcement Bar */}
      <div className="pt-14 w-full bg-gradient-to-r from-accent/12 via-accent/8 to-accent/12 border-b border-accent/20">
        <div className="flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:py-4 flex-wrap text-center">
          <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
          <span className="text-sm sm:text-base font-black uppercase tracking-widest text-accent">베타 오픈 기간</span>
          <span className="text-xs sm:text-sm bg-accent text-accent-foreground font-bold px-2.5 py-0.5 rounded-full">FREE</span>
          <p className="text-sm sm:text-base text-foreground/80 font-medium leading-relaxed break-keep">
            지금은 <strong className="text-accent font-bold">AWS · GCP · Azure 전체 문제</strong>를 완전 무료로 이용하실 수 있어요.
          </p>
        </div>
      </div>

      {/* Hero */}
      <section className="relative hero-gradient text-primary-foreground pt-12 md:pt-20 pb-20 md:pb-28 px-4 overflow-hidden">
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 hero-dots pointer-events-none" />

        {/* Background blur decorations */}
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-0 w-64 h-64 bg-accent rounded-full blur-3xl -translate-x-1/2" />
          <div className="absolute bottom-10 right-0 w-80 h-80 bg-primary rounded-full blur-3xl translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Floating data particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-accent/60"
              style={{
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                left: `${5 + i * 7}%`,
                top: `${30 + (i % 6) * 12}%`,
                animation: `float-up ${3.5 + (i % 5) * 0.8}s ease-out infinite`,
                animationDelay: `${i * 0.35}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto text-center max-w-5xl relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-accent/30 text-sm mb-6 bg-accent/10 backdrop-blur-sm shadow-lg">
            <Zap className="h-4 w-4 text-accent animate-pulse" />
            <span className="font-semibold whitespace-nowrap">{t('index.hero.badge')}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.2] mt-4 mb-5 md:mb-8 tracking-tight break-keep">
            {t('index.hero.title')}
            <br />
            <span className="bg-gradient-to-r from-accent via-accent/80 to-accent bg-clip-text text-transparent">
              {t('index.hero.titleAccent')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed font-medium break-keep">
            {t('index.hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-14 md:mb-20">
            <Link to="/exams" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-base sm:text-lg font-bold px-8 sm:px-10 py-5 sm:py-7 rounded-xl shadow-2xl hover:shadow-accent/50 transition-all duration-300 hover:scale-105 accent-glow w-full"
              >
                {t('index.hero.ctaPrimary')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="ghost"
                className="border-2 border-primary-foreground/50 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 hover:text-primary-foreground text-base sm:text-lg font-semibold px-8 sm:px-10 py-5 sm:py-7 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 w-full"
              >
                {t('index.hero.ctaSecondary')}
              </Button>
            </a>
          </div>

          {/* Stats Section — always 3 columns */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="bg-primary-foreground/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 border border-primary-foreground/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-2xl sm:text-4xl md:text-6xl font-black text-accent mb-1 sm:mb-2 tracking-tight">{t('index.hero.stats.questions.value')}</div>
              <div className="text-xs sm:text-sm md:text-base text-primary-foreground/70 font-semibold uppercase tracking-wide leading-tight break-keep">{t('index.hero.stats.questions.label')}</div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 border border-primary-foreground/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-2xl sm:text-4xl md:text-6xl font-black text-accent mb-1 sm:mb-2 tracking-tight">{t('index.hero.stats.passRate.value')}</div>
              <div className="text-xs sm:text-sm md:text-base text-primary-foreground/70 font-semibold uppercase tracking-wide leading-tight break-keep">{t('index.hero.stats.passRate.label')}</div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 border border-primary-foreground/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-2xl sm:text-4xl md:text-6xl font-black text-accent mb-1 sm:mb-2 tracking-tight">{t('index.hero.stats.providers.value')}</div>
              <div className="text-xs sm:text-sm md:text-base text-primary-foreground/70 font-semibold uppercase tracking-wide leading-tight break-keep">{t('index.hero.stats.providers.label')}</div>
            </div>
          </div>

        </div>
      </section>

      {/* 왜 클라우드 자격증인가 */}
      <section className="relative hero-gradient text-primary-foreground py-16 md:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 hero-dots pointer-events-none opacity-50" />
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 break-keep">{t('index.whyCloud.title')}</h2>
            <p className="text-primary-foreground/70 text-base md:text-lg max-w-2xl mx-auto break-keep">
              {t('index.whyCloud.subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 md:gap-8">
            {whyCloudItems.map((item, i) => {
              const IconComponent = iconMap[item.icon];
              return (
                <div key={i} className="bg-primary-foreground/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all duration-300 hover:scale-105">
                  <div className="relative w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                    <div
                      className="absolute inset-0 rounded-xl bg-accent/30"
                      style={{ animation: `ping-slow 2.5s ease-out infinite`, animationDelay: `${i * 0.6}s` }}
                    />
                    {IconComponent && <IconComponent className="h-6 w-6 text-accent relative z-10" />}
                  </div>
                  <h3 className="font-bold text-lg md:text-xl mb-3 break-keep">{item.title}</h3>
                  <p className="text-sm md:text-base text-primary-foreground/70 leading-relaxed break-keep">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 기업 신뢰 스크롤 */}
      <section className="py-14 md:py-16 px-4 bg-card border-y border-border overflow-hidden">
        <div className="container mx-auto max-w-4xl text-center mb-8 md:mb-10">
          <h2 className="text-xl md:text-3xl font-bold mb-2 break-keep">{t('index.trustedBy.title')}</h2>
          <p className="text-muted-foreground text-sm md:text-base break-keep">{t('index.trustedBy.subtitle')}</p>
        </div>

        {/* Row 1 — left to right */}
        <div className="marquee-wrapper overflow-hidden mb-3">
          <div className="flex gap-3 animate-marquee" style={{ width: 'max-content' }}>
            {[...companiesRow1, ...companiesRow1].map((name, i) => (
              <span
                key={i}
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-background dark:bg-white/10 border border-border dark:border-white/20 text-sm font-semibold text-muted-foreground dark:text-white/75 hover:text-foreground hover:border-accent/50 transition-colors flex-shrink-0 cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Row 2 — right to left */}
        <div className="marquee-wrapper overflow-hidden">
          <div className="flex gap-3 animate-marquee-reverse" style={{ width: 'max-content' }}>
            {[...companiesRow2, ...companiesRow2].map((name, i) => (
              <span
                key={i}
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-background dark:bg-white/10 border border-border dark:border-white/20 text-sm font-semibold text-muted-foreground dark:text-white/75 hover:text-foreground hover:border-accent/50 transition-colors flex-shrink-0 cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6 break-keep">
          * {t('index.trustedBy.disclaimer')}
        </p>
      </section>

      {/* 자격증 로드맵 CTA */}
      <section className="py-10 md:py-12 px-4 bg-accent/5 border-y border-accent/10">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">
            {t('certifications.roadmapCta.eyebrow')}
          </p>
          <h2 className="text-xl md:text-3xl font-bold mb-2 break-keep">
            {t('certifications.roadmapCta.title')}
          </h2>
          <p className="text-muted-foreground mb-5 text-sm md:text-base break-keep">
            {t('certifications.roadmapCta.subtitle')}
          </p>
          <Link to="/certifications">
            <Button
              variant="outline"
              size="lg"
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <Map className="mr-2 h-5 w-5" />
              {t('certifications.roadmapCta.button')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 break-keep">{t('index.featuresSection.title')}</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto break-keep">
              {t('index.featuresSection.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {features.map((f, i) => {
              const IconComponent = iconMap[f.icon];
              return (
                <div key={i} className="bg-card rounded-xl p-4 md:p-6 border card-hover" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-3 md:mb-4">
                    {IconComponent && <IconComponent className="h-5 w-5 md:h-6 md:w-6 text-accent" />}
                  </div>
                  <h3 className="font-semibold text-sm md:text-lg mb-1 md:mb-2 break-keep">{f.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed break-keep">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 학습 대상 */}
      <section className="py-16 md:py-20 px-4 section-alt">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 break-keep">{t('index.audience.title')}</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto break-keep">
              {t('index.audience.subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 md:gap-8">
            {audienceItems.map((item, i) => {
              const IconComponent = iconMap[item.icon];
              return (
                <a key={i} href="https://cloudmasterit.com/exams" className="block bg-card rounded-2xl p-6 md:p-8 border card-hover text-center">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    {IconComponent && <IconComponent className="h-7 w-7 text-accent" />}
                  </div>
                  <h3 className="font-bold text-lg md:text-xl mb-3 break-keep">{item.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed break-keep">{item.desc}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* 30분 루틴 */}
      <section id="routine" className="py-16 md:py-20 px-4 bg-card">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-5">
              <CheckCircle2 className="h-4 w-4" />
              {t('index.routine.badge')}
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-3 break-keep">{t('index.routine.title')}</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto break-keep">
              {t('index.routine.subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 md:gap-8">
            {routineSteps.map((step, i) => {
              const IconComponent = iconMap[step.icon];
              return (
                <a key={i} href="https://cloudmasterit.com/exams" className="block bg-background rounded-2xl p-5 md:p-6 border card-hover">
                  {/* 헤더: 아이콘 + 시간 배지 + 소요시간 — 한 줄 */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      {IconComponent && <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-accent" />}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold flex-1 min-w-0">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{step.time}</span>
                    </div>
                    <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-black text-center leading-tight flex-shrink-0">
                      {step.duration}
                    </div>
                  </div>
                  <h3 className="font-bold text-base md:text-lg mb-2 break-keep">{step.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed break-keep">{step.desc}</p>
                </a>
              );
            })}
          </div>
          <div className="mt-10 md:mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-2xl px-6 md:px-8 py-3 md:py-4">
              <span className="text-2xl md:text-3xl font-black text-accent">{t('index.routine.totalTime')}</span>
              <span className="text-muted-foreground font-medium text-sm md:text-base break-keep">{t('index.routine.totalTimeDesc')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 md:mb-14 break-keep">{t('index.howItWorks.title')}</h2>
          <div className="grid sm:grid-cols-3 gap-8 md:gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-extrabold text-accent">{s.num}</span>
                </div>
                <h3 className="font-semibold text-base md:text-lg mb-2 break-keep">{s.title}</h3>
                <p className="text-sm text-muted-foreground break-keep">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 합격 후기 — hidden until real reviews are available */}
      {false && <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-6">
              <Star className="h-4 w-4" />
              {t('index.testimonials.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('index.testimonials.title')}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto break-keep">
              {t('index.testimonials.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <div key={i} className="bg-background rounded-2xl p-6 border card-hover flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed mb-5 flex-1 break-keep">
                  "{item.quote}"
                </blockquote>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold mb-4 self-start">
                  <Shield className="h-3 w-3" />
                  {item.cert} · {item.score}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-black text-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.role} · {item.period}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-20 px-4 bg-card">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 md:mb-14 break-keep">{t('index.faq.title')}</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-background rounded-lg border px-4">
                <AccordionTrigger className="text-sm font-medium hover:no-underline text-left break-keep">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground break-keep">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient text-primary-foreground py-16 md:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 hero-dots pointer-events-none" />
        <div className="container mx-auto text-center max-w-2xl relative z-10">
          <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 break-keep">{t('index.cta.title')}</h2>
          <p className="text-primary-foreground/70 mb-7 md:mb-8 text-base md:text-lg break-keep">
            {t('index.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/exams" className="w-full sm:w-auto">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 py-6 accent-glow w-full">
                {t('index.cta.button')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            {canInstall && (
              <Button
                size="lg"
                variant="ghost"
                onClick={install}
                className="border-2 border-primary-foreground/40 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 hover:text-primary-foreground text-base px-8 py-6 backdrop-blur-sm w-full sm:w-auto"
              >
                <Smartphone className="mr-2 h-5 w-5" />
                앱으로 설치
              </Button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
