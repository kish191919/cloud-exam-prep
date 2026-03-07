import AppLayout from '@/components/AppLayout';
import { useTranslation } from 'react-i18next';

const DisclaimerPage = () => {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  if (!isKo) return <DisclaimerEn />;
  return <DisclaimerKo />;
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </section>
);

const DisclaimerKo = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">면책 조항 및 저작권 고지</h1>
      <p className="text-sm text-muted-foreground mb-8">최종 업데이트: 2026년 2월</p>

      <Section title="1. 면책 조항 (Disclaimer)">
        <p>
          CloudMaster는 클라우드 자격증 시험 준비를 위한 독립적인 교육 플랫폼입니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>본 웹사이트는 Amazon Web Services(AWS), Microsoft, Google Cloud와 제휴·후원·승인·인증 관계가 없습니다.</li>
          <li>AWS, Amazon Web Services, Microsoft, Azure, Google Cloud 및 관련 상표는 각 소유자의 재산입니다.</li>
          <li>본 웹사이트의 모든 연습 문제와 학습 자료는 교육 및 시험 준비 목적으로 독자적으로 제작되었습니다. 이 문제들은 실제 자격증 시험 문제가 아니며, 어떠한 공식 시험에서도 발췌하지 않았습니다.</li>
          <li>공식적이고 권위 있는 정보를 위해 AWS, Microsoft, Google Cloud의 공식 문서 및 교육 자료를 반드시 참고하시기 바랍니다.</li>
        </ul>
      </Section>

      <Section title="2. 저작권 및 상표권 고지 (Copyright & Trademark Notice)">
        <p>© 2026 CloudMaster. All rights reserved.</p>
        <p>본 웹사이트의 모든 연습 문제, 해설, 블로그 게시물 및 학습 자료는 저작권법의 보호를 받습니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>사전 서면 허가 없이 본 웹사이트의 콘텐츠를 무단으로 복제, 재배포 또는 재발행하는 것은 엄격히 금지됩니다.</li>
          <li>
            AWS, Amazon Web Services, Microsoft, Azure, Google Cloud 및 관련 상표는 각 소유자의 재산이며,
            CloudMaster와 무관합니다. 해당 명칭은 식별 목적으로만 사용됩니다.
          </li>
        </ul>
      </Section>

      <Section title="3. 저작권 침해 신고">
        <p>
          본 웹사이트의 콘텐츠가 저작권 또는 시험 정책을 침해한다고 판단되시면,
          즉시 검토 후 필요한 경우 해당 콘텐츠를 삭제하겠습니다.
        </p>
        <p>문의: cloudmasterit.service@gmail.com</p>
      </Section>
    </div>
  </AppLayout>
);

const DisclaimerEn = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">Disclaimer & Copyright Notice</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

      <Section title="1. Disclaimer">
        <p>
          CloudMaster is an independent educational platform for cloud certification exam preparation.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>This website is not affiliated with, endorsed by, or sponsored by Amazon Web Services (AWS), Microsoft, or Google Cloud.</li>
          <li>AWS, Amazon Web Services, Microsoft, Azure, Google Cloud, and all related trademarks are the property of their respective owners.</li>
          <li>All practice questions and study materials on this website are created independently for educational and exam preparation purposes only. They are not actual exam questions and are not taken from any official certification exams.</li>
          <li>Users should rely on official documentation and training provided by AWS, Microsoft, and Google Cloud for authoritative information.</li>
        </ul>
      </Section>

      <Section title="2. Copyright & Trademark Notice">
        <p>© 2026 CloudMaster. All rights reserved.</p>
        <p>All practice questions, explanations, blog posts, and educational materials on this website are protected by copyright law.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Unauthorized copying, redistribution, or reproduction of any content from this website is strictly prohibited without prior written permission.</li>
          <li>
            AWS, Amazon Web Services, Microsoft, Azure, Google Cloud, and related trademarks are the property of
            their respective owners and are used for identification purposes only. Their use does not imply any
            affiliation with or endorsement by CloudMaster.
          </li>
        </ul>
      </Section>

      <Section title="3. Copyright Infringement Notice">
        <p>
          We respect the intellectual property rights of certification providers. If you believe any content on
          this website violates copyright or exam policies, please contact us and we will promptly review and
          remove the content if necessary.
        </p>
        <p>Contact: cloudmasterit.service@gmail.com</p>
      </Section>
    </div>
  </AppLayout>
);

export default DisclaimerPage;
