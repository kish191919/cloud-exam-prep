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
  Cloud, Zap, Target, Users, Smartphone, CheckCircle2, Star,
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

  const iconMap: Record<string, any> = {
    Shield, BarChart3, Clock, BookOpen, Target, Users, Smartphone,
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative hero-gradient text-primary-foreground pt-24 md:pt-32 pb-24 md:pb-32 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto text-center max-w-5xl relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-accent/30 text-sm mb-8 bg-accent/10 backdrop-blur-sm shadow-lg">
            <Zap className="h-4 w-4 text-accent animate-pulse" />
            <span className="font-semibold">{t('index.hero.badge')}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.15] mt-4 mb-10 tracking-tight">
            {t('index.hero.title')}
            <br />
            <span className="bg-gradient-to-r from-accent via-accent/80 to-accent bg-clip-text text-transparent">
              {t('index.hero.titleAccent')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-2xl mx-auto mb-14 leading-relaxed font-medium" style={{ wordBreak: 'keep-all' }}>
            {t('index.hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20">
            <Link to="/exams">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg font-bold px-10 py-7 rounded-xl shadow-2xl hover:shadow-accent/50 transition-all duration-300 hover:scale-105 accent-glow w-full sm:w-auto"
              >
                {t('index.hero.ctaPrimary')} <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <a href="#routine">
              <Button
                size="lg"
                variant="ghost"
                className="border-2 border-primary-foreground/50 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 hover:text-primary-foreground text-lg font-semibold px-10 py-7 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                {t('index.hero.ctaSecondary')}
              </Button>
            </a>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-primary-foreground/10 backdrop-blur-md rounded-2xl p-8 border border-primary-foreground/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-5xl md:text-6xl font-black text-accent mb-2 tracking-tight">{t('index.hero.stats.questions.value')}</div>
              <div className="text-base text-primary-foreground/70 font-semibold uppercase tracking-wide">{t('index.hero.stats.questions.label')}</div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-md rounded-2xl p-8 border border-primary-foreground/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-5xl md:text-6xl font-black text-accent mb-2 tracking-tight">{t('index.hero.stats.passRate.value')}</div>
              <div className="text-base text-primary-foreground/70 font-semibold uppercase tracking-wide">{t('index.hero.stats.passRate.label')}</div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-md rounded-2xl p-8 border border-primary-foreground/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-5xl md:text-6xl font-black text-accent mb-2 tracking-tight">{t('index.hero.stats.providers.value')}</div>
              <div className="text-base text-primary-foreground/70 font-semibold uppercase tracking-wide">{t('index.hero.stats.providers.label')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('index.featuresSection.title')}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('index.featuresSection.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const IconComponent = iconMap[f.icon];
              return (
                <div key={i} className="bg-card rounded-xl p-6 border card-hover" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    {IconComponent && <IconComponent className="h-6 w-6 text-accent" />}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 30분 루틴 */}
      <section id="routine" className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-6">
              <CheckCircle2 className="h-4 w-4" />
              {t('index.routine.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('index.routine.title')}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto" style={{ wordBreak: 'keep-all' }}>
              {t('index.routine.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {routineSteps.map((step, i) => {
              const IconComponent = iconMap[step.icon];
              return (
                <div key={i} className="relative bg-background rounded-2xl p-6 border card-hover">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold mb-4">
                    <Clock className="h-3 w-3" />
                    {step.time}
                  </div>
                  <div className="absolute top-4 right-4 w-14 h-14 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-black text-center leading-tight">
                    {step.duration}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                    {IconComponent && <IconComponent className="h-5 w-5 text-accent" />}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-2xl px-8 py-4">
              <span className="text-3xl font-black text-accent">{t('index.routine.totalTime')}</span>
              <span className="text-muted-foreground font-medium">{t('index.routine.totalTimeDesc')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">{t('index.howItWorks.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-extrabold text-accent/20 mb-3">{s.num}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 합격 후기 */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-6">
              <Star className="h-4 w-4" />
              {t('index.testimonials.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('index.testimonials.title')}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto" style={{ wordBreak: 'keep-all' }}>
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
                <blockquote className="text-sm leading-relaxed mb-5 flex-1" style={{ wordBreak: 'keep-all' }}>
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
      </section>

      {/* Pricing — hidden during beta */}

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">{t('index.faq.title')}</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-background rounded-lg border px-4">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient text-primary-foreground py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('index.cta.title')}</h2>
          <p className="text-primary-foreground/70 mb-8 text-lg" style={{ wordBreak: 'keep-all' }}>
            {t('index.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/exams">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 py-6 accent-glow">
                {t('index.cta.button')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            {canInstall && (
              <Button
                size="lg"
                variant="ghost"
                onClick={install}
                className="border-2 border-primary-foreground/40 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 hover:text-primary-foreground text-base px-8 py-6 backdrop-blur-sm"
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
