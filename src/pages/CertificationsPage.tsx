import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, ChevronDown, BookOpen } from 'lucide-react';
import {
  PROVIDERS,
  LEVEL_META,
  CAREER_META,
  type CareerPath,
  type CertLevel,
  type Certification,
  type ProviderConfig,
} from '@/data/certifications';

// ────────────────────────────────────────────────────────────────────────────
// Career Filter Bar
// ────────────────────────────────────────────────────────────────────────────
const CAREER_FILTERS: CareerPath[] = ['all', 'cloud-architect', 'devops', 'data-ml', 'security', 'developer'];

interface CareerFilterProps {
  active: CareerPath;
  onChange: (c: CareerPath) => void;
}

function CareerFilter({ active, onChange }: CareerFilterProps) {
  const { t } = useTranslation('pages');
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {CAREER_FILTERS.map((c) => {
        const emoji = CAREER_META[c].emoji;
        const label = t(`certifications.careers.${c}.label`);
        const isActive = active === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`
              inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
              border transition-all duration-200
              ${isActive
                ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                : 'bg-background text-muted-foreground border-border hover:border-accent/50 hover:text-foreground'
              }
            `}
          >
            <span>{emoji}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Certification Card
// ────────────────────────────────────────────────────────────────────────────
interface CertCardProps {
  cert: Certification;
  providerColor: string;
  activeCareer: CareerPath;
  isKo: boolean;
}

function CertCard({ cert, providerColor, activeCareer, isKo }: CertCardProps) {
  const { t } = useTranslation('pages');
  const levelMeta = LEVEL_META[cert.level];
  const isHighlighted = activeCareer === 'all' || cert.careerPaths.includes(activeCareer);
  const hasExam = Boolean(cert.examId);
  const description = isKo ? cert.description : cert.descriptionEn;

  return (
    <div
      className={`
        bg-card rounded-xl border p-5 flex flex-col gap-3
        transition-all duration-300 card-hover
        ${isHighlighted ? 'opacity-100' : 'opacity-35'}
      `}
    >
      {/* Level Badge + availability */}
      <div className="flex items-start justify-between gap-2">
        <span
          className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
            ${levelMeta.colorClass} ${levelMeta.bgClass} ${levelMeta.borderClass}
          `}
        >
          {t(`certifications.levels.${cert.level}.label`)}
        </span>
        {hasExam ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {t('certifications.available')}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
            {t('certifications.comingSoon')}
          </span>
        )}
      </div>

      {/* Name & Code */}
      <div>
        <h3 className="font-bold text-base leading-snug">{cert.name}</h3>
        <p className="text-sm font-mono mt-0.5" style={{ color: providerColor }}>
          {cert.code}
        </p>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed flex-1" style={{ wordBreak: 'keep-all' }}>
        {description}
      </p>

      {/* Career Tags */}
      <div className="flex flex-wrap gap-1.5">
        {cert.careerPaths.map((cp) => {
          const emoji = CAREER_META[cp].emoji;
          const label = t(`certifications.careers.${cp}.label`);
          return (
            <span
              key={cp}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-accent/10 text-accent font-medium"
            >
              {emoji} {label}
            </span>
          );
        })}
      </div>

      {/* CTA */}
      {hasExam ? (
        <div className="flex flex-col gap-2 mt-1">
          <Link to={`/cert/${cert.examId}`}>
            <Button size="sm" variant="outline" className="w-full border-accent/50 text-accent hover:bg-accent/10">
              {isKo ? '자세히 보기' : 'Learn More'}
            </Button>
          </Link>
          <Link to="/exams">
            <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              {t('certifications.practiceBtn')}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      ) : (
        <Button size="sm" variant="outline" disabled className="w-full mt-1 opacity-50">
          {t('certifications.comingSoon')}
        </Button>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Level Section
// ────────────────────────────────────────────────────────────────────────────
interface LevelSectionProps {
  level: CertLevel;
  certs: Certification[];
  providerColor: string;
  activeCareer: CareerPath;
  isKo: boolean;
}

function LevelSection({ level, certs, providerColor, activeCareer, isKo }: LevelSectionProps) {
  const { t } = useTranslation('pages');
  if (certs.length === 0) return null;
  const meta = LEVEL_META[level];

  return (
    <div>
      {/* Level header */}
      <div className={`flex items-center gap-3 rounded-xl px-5 py-3 mb-4 border ${meta.bgClass} ${meta.borderClass}`}>
        <span className={`text-sm font-black uppercase tracking-wider ${meta.colorClass}`}>
          {t(`certifications.levels.${level}.label`)}
        </span>
        <span className="text-xs text-muted-foreground">
          {t(`certifications.levels.${level}.description`)}
        </span>
      </div>

      {/* Cert cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certs.map((cert) => (
          <CertCard
            key={cert.id}
            cert={cert}
            providerColor={providerColor}
            activeCareer={activeCareer}
            isKo={isKo}
          />
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Provider Roadmap
// ────────────────────────────────────────────────────────────────────────────
interface ProviderRoadmapProps {
  provider: ProviderConfig;
  activeCareer: CareerPath;
  isKo: boolean;
}

function ProviderRoadmap({ provider, activeCareer, isKo }: ProviderRoadmapProps) {
  const { t } = useTranslation('pages');
  const tagline = isKo ? provider.tagline : provider.taglineEn;

  return (
    <div className="space-y-6">
      {/* Provider intro */}
      <div className="flex items-center gap-3 mb-8 p-4 bg-card rounded-xl border">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0"
          style={{ backgroundColor: provider.color }}
        >
          {provider.id === 'AWS' ? 'AWS' : provider.id === 'GCP' ? 'GCP' : 'AZ'}
        </div>
        <div>
          <h3 className="font-bold">{provider.name}</h3>
          <p className="text-sm text-muted-foreground">{tagline}</p>
        </div>
        <div className="ml-auto text-sm font-medium text-muted-foreground">
          {t('certifications.certCount', { count: provider.certifications.length })}
        </div>
      </div>

      {/* Levels */}
      {provider.levels.map((level, idx) => {
        const certs = provider.certifications.filter((c) => c.level === level);
        if (certs.length === 0) return null;

        return (
          <div key={level}>
            <LevelSection
              level={level}
              certs={certs}
              providerColor={provider.color}
              activeCareer={activeCareer}
              isKo={isKo}
            />
            {idx < provider.levels.length - 1 && (
              <div className="flex justify-center py-3">
                <ChevronDown className="h-6 w-6 text-muted-foreground/40" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────
const CertificationsPage = () => {
  const [activeCareer, setActiveCareer] = useState<CareerPath>('all');
  const { t, i18n } = useTranslation('pages');
  const isKo = i18n.language === 'ko';

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient text-primary-foreground pt-24 md:pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-sm font-semibold mb-6">
            <span>☁️</span>
            <span>{t('certifications.hero.badge')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-5">
            {t('certifications.hero.title')}
            <br />
            <span className="bg-gradient-to-r from-accent via-accent/80 to-accent bg-clip-text text-transparent">
              {t('certifications.hero.titleAccent')}
            </span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto leading-relaxed" style={{ wordBreak: 'keep-all' }}>
            {t('certifications.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Career Filter */}
      <section className="py-8 px-4 bg-card border-b border-border sticky top-[61px] z-40 backdrop-blur-md bg-card/90">
        <div className="container mx-auto max-w-4xl">
          <p className="text-center text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
            {t('certifications.filterLabel')}
          </p>
          <CareerFilter active={activeCareer} onChange={setActiveCareer} />
        </div>
      </section>

      {/* Roadmap Tabs */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Tabs defaultValue="AWS">
            <TabsList className="grid grid-cols-3 w-full max-w-sm mx-auto mb-10 h-11">
              {PROVIDERS.map((p) => (
                <TabsTrigger key={p.id} value={p.id} className="font-bold">
                  {p.id}
                </TabsTrigger>
              ))}
            </TabsList>

            {PROVIDERS.map((provider) => (
              <TabsContent key={provider.id} value={provider.id}>
                <ProviderRoadmap provider={provider} activeCareer={activeCareer} isKo={isKo} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-card border-t border-border">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {t('certifications.cta.title')}
          </h2>
          <p className="text-muted-foreground mb-8" style={{ wordBreak: 'keep-all' }}>
            {t('certifications.cta.subtitle')}
          </p>
          <Link to="/exams">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 py-6 accent-glow">
              {t('certifications.cta.button')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CertificationsPage;
