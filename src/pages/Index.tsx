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
  Shield, BarChart3, Clock, BookOpen, CheckCircle, ArrowRight,
  Cloud, Zap, Target, Star, Users,
} from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Realistic CBT Experience',
    desc: 'Timed exams with auto-save, bookmarks, pause/resume, and question navigation — just like the real test.',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    desc: 'Track scores by topic, identify weak areas, and review wrong answers with detailed explanations.',
  },
  {
    icon: Shield,
    title: 'Multi-Cloud Coverage',
    desc: 'AWS, GCP, and Azure certifications in one platform. Always updated for the latest exam versions.',
  },
];

const steps = [
  { num: '01', title: 'Choose Your Exam', desc: 'Select from AWS, GCP, or Azure certification practice tests.' },
  { num: '02', title: 'Take the Test', desc: 'Experience a realistic CBT environment with timer and auto-save.' },
  { num: '03', title: 'Review & Improve', desc: 'Analyze results, study explanations, and retake weak areas.' },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Try before you buy',
    features: ['10 sample questions', '1 practice exam', 'Basic results'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    desc: 'For serious learners',
    features: ['Full question bank', 'Unlimited exams', 'Detailed analytics', 'Wrong answer drills', 'Bookmark & notes'],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Team',
    price: '$49',
    period: '/month',
    desc: 'For teams & bootcamps',
    features: ['Everything in Pro', 'Team management', 'Progress tracking', 'Bulk licensing', 'Priority support'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const faqs = [
  {
    q: 'What certifications are covered?',
    a: 'We currently offer practice exams for AWS certifications including AIF-C01, SAA-C03, and DEA-C01. GCP and Azure exams are coming soon.',
  },
  {
    q: 'How realistic are the practice exams?',
    a: 'Our CBT interface mirrors the actual exam experience with timed sessions, question navigation panels, bookmarking, and the same question formats you\'ll encounter on test day.',
  },
  {
    q: 'Can I access on mobile?',
    a: 'Yes! CloudMaster is fully responsive and works on desktop, tablet, and mobile devices. Study anywhere, anytime.',
  },
  {
    q: 'What happens if I lose connection during an exam?',
    a: 'Your progress is auto-saved after every answer. If you lose connection or close your browser, you can resume exactly where you left off.',
  },
  {
    q: 'How do I track my progress?',
    a: 'Your dashboard shows score trends, topic-by-topic breakdowns, and identifies your weakest areas so you can focus your study time effectively.',
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient text-primary-foreground pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-foreground/20 text-sm mb-8 bg-primary-foreground/5">
            <Zap className="h-4 w-4 text-accent" />
            <span>AWS AIF-C01 practice exam now available</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Master Cloud Certifications
            <br />
            <span className="text-accent">With Confidence</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10">
            Practice with realistic CBT exams for AWS, GCP & Azure. Track your progress, review mistakes, and pass on your first try.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/exams">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 py-6 accent-glow">
                Start Free Practice <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 py-6">
                Learn More
              </Button>
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div>
              <div className="text-3xl font-bold text-accent">500+</div>
              <div className="text-sm text-primary-foreground/60">Questions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">95%</div>
              <div className="text-sm text-primary-foreground/60">Pass Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">3</div>
              <div className="text-sm text-primary-foreground/60">Cloud Providers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Pass</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built by certified professionals who understand what it takes to ace cloud exams.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border card-hover" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">How It Works</h2>
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

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-center mb-14 text-lg">Start free, upgrade when you're ready.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-xl p-6 border-2 card-hover ${
                  plan.popular ? 'border-accent bg-card shadow-lg relative' : 'border-border bg-card'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/exams">
                  <Button
                    className={`w-full ${plan.popular ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">Frequently Asked Questions</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Certified?</h2>
          <p className="text-primary-foreground/70 mb-8 text-lg">
            Join thousands of cloud professionals who passed their exams with CloudMaster.
          </p>
          <Link to="/exams">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 py-6 accent-glow">
              Start Practicing Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-10 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold">
            <Cloud className="h-5 w-5 text-accent" />
            CloudMaster
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Community</a>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 CloudMaster. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
