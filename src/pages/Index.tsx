import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Shield, BarChart3, Clock, BookOpen, ArrowRight,
  Cloud, Zap, Target, Users, Download, Smartphone,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const Index = () => {
  const { t } = useTranslation(['pages', 'common']);
  const { canInstall, install } = usePWAInstall();

  const features = t('index.features', { returnObjects: true }) as Array<{ title: string; desc: string; icon: string }>;
  const steps = t('index.steps', { returnObjects: true }) as Array<{ num: string; title: string; desc: string }>;
const faqs = t('index.faq.questions', { returnObjects: true }) as Array<{ q: string; a: string }>;

  const iconMap: Record<string, any> = {
    Shield, BarChart3, Clock, BookOpen, Target, Users,
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
            <a href="#features">
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

      {/* How it works */}
      <section className="py-20 px-4 bg-card">
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

      {/* Pricing — hidden during beta */}

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-card">
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

      {/* App Install Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-2xl border bg-card p-8 md:p-10 shadow-lg flex flex-col md:flex-row items-center gap-8">
            {/* Icon */}
            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center shadow-inner">
              <Smartphone className="h-10 w-10 text-accent" />
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-1">앱으로 설치하기</h2>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                홈 화면에 추가하면 앱처럼 빠르게 실행할 수 있어요.<br />
                인터넷 연결 없이도 최근 학습 내용을 이어갈 수 있습니다.
              </p>

              {canInstall ? (
                <Button
                  onClick={install}
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold px-8 gap-2"
                >
                  <Download className="h-5 w-5" />
                  지금 설치하기
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="flex items-start gap-3 bg-muted rounded-xl px-4 py-3 flex-1">
                    <span className="text-xl leading-none">🤖</span>
                    <div>
                      <div className="font-semibold mb-0.5">Android / PC</div>
                      <div className="text-muted-foreground">주소창 오른쪽 <span className="font-medium text-foreground">설치 아이콘</span> 클릭</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-muted rounded-xl px-4 py-3 flex-1">
                    <span className="text-xl leading-none">🍎</span>
                    <div>
                      <div className="font-semibold mb-0.5">iPhone / iPad</div>
                      <div className="text-muted-foreground">Safari 공유 버튼 → <span className="font-medium text-foreground">홈 화면에 추가</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient text-primary-foreground py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('index.cta.title')}</h2>
          <p className="text-primary-foreground/70 mb-8 text-lg">
            {t('index.cta.subtitle')}
          </p>
          <Link to="/exams">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 py-6 accent-glow">
              {t('index.cta.button')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-10 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold">
            <Cloud className="h-5 w-5 text-accent" />
            {t('common:brand')}
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t('index.footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">{t('index.footer.terms')}</Link>
            <a href="https://open.kakao.com/o/pnEbOZgi" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">{t('index.footer.community')}</a>
          </div>
          <p className="text-xs text-muted-foreground">{t('index.footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
