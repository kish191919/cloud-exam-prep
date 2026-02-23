import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {CAREER_FILTERS.map((c) => {
        const meta = CAREER_META[c];
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
            <span>{meta.emoji}</span>
            {meta.label}
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
}

function CertCard({ cert, providerColor, activeCareer }: CertCardProps) {
  const levelMeta = LEVEL_META[cert.level];
  const isHighlighted = activeCareer === 'all' || cert.careerPaths.includes(activeCareer);
  const hasExam = Boolean(cert.examId);

  return (
    <div
      className={`
        bg-card rounded-xl border p-5 flex flex-col gap-3
        transition-all duration-300 card-hover
        ${isHighlighted ? 'opacity-100' : 'opacity-35'}
      `}
    >
      {/* Level Badge */}
      <div className="flex items-start justify-between gap-2">
        <span
          className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
            ${levelMeta.colorClass} ${levelMeta.bgClass} ${levelMeta.borderClass}
          `}
        >
          {levelMeta.label}
        </span>
        {hasExam ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            문제 있음
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
            준비중
          </span>
        )}
      </div>

      {/* Name & Code */}
      <div>
        <h3 className="font-bold text-base leading-snug">{cert.name}</h3>
        <p className="text-sm font-mono text-muted-foreground mt-0.5" style={{ color: providerColor }}>
          {cert.code}
        </p>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed flex-1" style={{ wordBreak: 'keep-all' }}>
        {cert.description}
      </p>

      {/* Career Tags */}
      <div className="flex flex-wrap gap-1.5">
        {cert.careerPaths.map((cp) => {
          const m = CAREER_META[cp];
          return (
            <span
              key={cp}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-accent/10 text-accent font-medium"
            >
              {m.emoji} {m.label}
            </span>
          );
        })}
      </div>

      {/* CTA */}
      {hasExam ? (
        <Link to="/exams">
          <Button
            size="sm"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-1"
          >
            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
            실습하기
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
      ) : (
        <Button size="sm" variant="outline" disabled className="w-full mt-1 opacity-50">
          준비중
        </Button>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Level Section (one level row in the roadmap)
// ────────────────────────────────────────────────────────────────────────────
interface LevelSectionProps {
  level: CertLevel;
  certs: Certification[];
  providerColor: string;
  activeCareer: CareerPath;
}

function LevelSection({ level, certs, providerColor, activeCareer }: LevelSectionProps) {
  if (certs.length === 0) return null;
  const meta = LEVEL_META[level];

  return (
    <div>
      {/* Level header */}
      <div className={`flex items-center gap-3 rounded-xl px-5 py-3 mb-4 border ${meta.bgClass} ${meta.borderClass}`}>
        <span className={`text-sm font-black uppercase tracking-wider ${meta.colorClass}`}>
          {meta.label}
        </span>
        <span className="text-xs text-muted-foreground">{meta.description}</span>
      </div>

      {/* Cert cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certs.map((cert) => (
          <CertCard
            key={cert.id}
            cert={cert}
            providerColor={providerColor}
            activeCareer={activeCareer}
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
}

function ProviderRoadmap({ provider, activeCareer }: ProviderRoadmapProps) {
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
          <p className="text-sm text-muted-foreground">{provider.tagline}</p>
        </div>
        <div className="ml-auto text-sm font-medium text-muted-foreground">
          {provider.certifications.length}개 자격증
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
            />
            {/* Arrow between levels */}
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

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient text-primary-foreground pt-24 md:pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-sm font-semibold mb-6">
            <span>☁️</span>
            <span>클라우드 자격증 로드맵</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-5">
            어떤 자격증부터
            <br />
            <span className="bg-gradient-to-r from-accent via-accent/80 to-accent bg-clip-text text-transparent">
              시작해야 할까요?
            </span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto leading-relaxed" style={{ wordBreak: 'keep-all' }}>
            AWS · GCP · Azure 자격증 체계와 레벨별 로드맵을 한눈에 확인하고,
            내 커리어에 맞는 첫 번째 자격증을 찾아보세요.
          </p>
        </div>
      </section>

      {/* Career Filter */}
      <section className="py-8 px-4 bg-card border-b border-border sticky top-[61px] z-40 backdrop-blur-md bg-card/90">
        <div className="container mx-auto max-w-4xl">
          <p className="text-center text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
            커리어 경로로 필터링
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
                <ProviderRoadmap provider={provider} activeCareer={activeCareer} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-card border-t border-border">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">지금 바로 시작하세요</h2>
          <p className="text-muted-foreground mb-8" style={{ wordBreak: 'keep-all' }}>
            AWS AI Practitioner 문제가 준비되어 있습니다. 무료로 실력을 확인해보세요.
          </p>
          <Link to="/exams">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 py-6 accent-glow">
              문제 풀기 시작 <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CertificationsPage;
