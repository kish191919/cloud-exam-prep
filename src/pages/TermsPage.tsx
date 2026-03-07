import AppLayout from '@/components/AppLayout';
import { useTranslation } from 'react-i18next';

const TermsPage = () => {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  if (!isKo) return <TermsEn />;
  return <TermsKo />;
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </section>
);

const TermsKo = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">이용약관</h1>
      <p className="text-sm text-muted-foreground mb-8">최종 업데이트: 2026년 2월</p>

      <Section title="1. 서비스 소개">
        <p>CloudMaster(이하 "서비스")는 AWS, GCP, Azure 클라우드 자격증 시험을 준비하는 사용자를 위한 독립적인 온라인 교육 플랫폼입니다. 본 약관은 서비스 이용에 관한 이용자와 CloudMaster 간의 권리·의무를 규정합니다.</p>
        <p>본 서비스는 Amazon Web Services(AWS), Microsoft, Google Cloud와 제휴·후원·승인 관계가 없는 독립 교육 플랫폼입니다.</p>
      </Section>

      <Section title="2. 이용 조건">
        <ul className="list-disc pl-5 space-y-1">
          <li>만 14세 이상인 경우 본 서비스를 이용할 수 있습니다.</li>
          <li>회원가입 시 정확한 정보를 제공해야 합니다.</li>
          <li>계정 보안(비밀번호 등)은 이용자 본인이 책임집니다.</li>
          <li>하나의 이용자는 하나의 계정만 생성할 수 있습니다.</li>
        </ul>
      </Section>

      <Section title="3. 무료 및 유료 서비스">
        <p>CloudMaster는 일부 기능을 무료로 제공하며, 추가 기능은 유료 구독을 통해 이용할 수 있습니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>무료:</strong> 샘플 문제 및 제한된 시험 세트 이용</li>
          <li><strong>유료:</strong> 전체 문제 은행, 무제한 시험, 상세 분석 등</li>
        </ul>
        <p>가격 및 제공 내용은 서비스 내 안내를 따르며, 사전 공지 후 변경될 수 있습니다.</p>
      </Section>

      <Section title="4. 금지 행위">
        <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>서비스 내 문제·해설 등 콘텐츠의 무단 복제, 배포, 판매</li>
          <li>자동화 도구(봇, 스크레이퍼 등)를 이용한 데이터 수집</li>
          <li>타인의 계정 도용 또는 무단 접근 시도</li>
          <li>서비스의 정상적인 운영을 방해하는 행위</li>
          <li>관련 법령에 위반되는 행위</li>
        </ul>
      </Section>

      <Section title="5. 지식재산권">
        <p>서비스 내 모든 콘텐츠(문제, 해설, UI 등)의 저작권은 CloudMaster에 귀속됩니다. 이용자는 개인 학습 목적으로만 서비스를 이용할 수 있으며, 상업적 이용은 금지됩니다.</p>
        <p>AWS, Amazon Web Services, Microsoft, Azure, Google Cloud 및 관련 상표는 각 소유자의 재산이며, CloudMaster와 무관합니다. 해당 명칭은 식별 목적으로만 사용됩니다.</p>
        <p>이용자는 사전 서면 허가 없이 서비스 내 콘텐츠를 복제, 재배포 또는 판매할 수 없습니다.</p>
      </Section>

      <Section title="6. 서비스 중단 및 변경">
        <p>CloudMaster는 서비스 개선, 유지보수, 사업상의 이유로 서비스의 일부 또는 전부를 변경하거나 중단할 수 있습니다. 중요한 변경 또는 서비스 종료 시 사전에 공지합니다.</p>
      </Section>

      <Section title="7. 면책 조항">
        <ul className="list-disc pl-5 space-y-1">
          <li>CloudMaster는 서비스 내 문제·해설의 정확성을 위해 노력하나, 완전한 정확성을 보장하지 않습니다.</li>
          <li>서비스 내 모든 연습 문제는 교육 목적으로 독자적으로 제작된 것이며, 실제 자격증 시험 문제가 아닙니다.</li>
          <li>실제 자격증 시험 합격을 보장하지 않습니다.</li>
          <li>본 서비스는 AWS, Microsoft, Google Cloud와 공식 제휴 관계가 없으며, 해당 기업들의 승인을 받지 않았습니다.</li>
          <li>천재지변, 서버 장애 등 불가항력에 의한 서비스 중단에 대해 책임지지 않습니다.</li>
          <li>서비스는 어떠한 종류의 보증 없이 "있는 그대로" 제공됩니다.</li>
        </ul>
      </Section>

      <Section title="8. 계정 해지">
        <p>이용자는 언제든지 계정을 삭제할 수 있습니다. CloudMaster는 약관 위반 시 사전 통보 없이 이용을 제한하거나 계정을 해지할 수 있습니다.</p>
      </Section>

      <Section title="9. 약관 변경">
        <p>본 약관은 필요 시 변경될 수 있으며, 변경 시 서비스 내 공지 또는 이메일을 통해 안내합니다. 변경 후 계속 서비스를 이용하면 변경된 약관에 동의한 것으로 봅니다.</p>
      </Section>

      <Section title="10. 문의">
        <p>이용약관에 관한 문의: cloudmasterit.service@gmail.com</p>
        <p>저작권 침해 신고: cloudmasterit.service@gmail.com</p>
      </Section>
    </div>
  </AppLayout>
);

const TermsEn = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

      <Section title="1. About the Service">
        <p>CloudMaster ("Service") is an independent online educational platform for users preparing for AWS, GCP, and Azure cloud certifications. These Terms govern the relationship between users and CloudMaster regarding the use of the Service.</p>
        <p>This website is not affiliated with, endorsed by, or sponsored by Amazon Web Services (AWS), Microsoft, or Google Cloud.</p>
      </Section>

      <Section title="2. Eligibility">
        <ul className="list-disc pl-5 space-y-1">
          <li>You must be at least 14 years old to use this Service.</li>
          <li>You must provide accurate information when registering.</li>
          <li>You are responsible for maintaining the security of your account.</li>
          <li>Each user may create only one account.</li>
        </ul>
      </Section>

      <Section title="3. Free & Paid Features">
        <p>CloudMaster provides some features for free and additional features through a paid subscription.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Free:</strong> Sample questions and limited exam sets</li>
          <li><strong>Paid:</strong> Full question bank, unlimited exams, detailed analytics, and more</li>
        </ul>
        <p>Pricing and offerings are subject to change with prior notice.</p>
      </Section>

      <Section title="4. Prohibited Activities">
        <p>You may not:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Copy, distribute, or sell any content (questions, explanations, UI) without authorization</li>
          <li>Use automated tools (bots, scrapers) to collect data</li>
          <li>Impersonate others or attempt unauthorized access</li>
          <li>Interfere with the normal operation of the Service</li>
          <li>Engage in any activity that violates applicable laws</li>
        </ul>
      </Section>

      <Section title="5. Intellectual Property">
        <p>All content within the Service (questions, explanations, UI, etc.) is owned by CloudMaster. Users may use the Service for personal study purposes only. Commercial use is prohibited.</p>
        <p>AWS, Amazon Web Services, Microsoft, Azure, Google Cloud, and related trademarks are the property of their respective owners and are not affiliated with CloudMaster. These names are used for identification purposes only.</p>
        <p>Users may not copy, reproduce, distribute, or republish any content from this website without prior written permission.</p>
      </Section>

      <Section title="6. Service Changes">
        <p>CloudMaster may modify or discontinue the Service in whole or in part for improvement, maintenance, or business reasons. Significant changes or service terminations will be announced in advance.</p>
      </Section>

      <Section title="7. Disclaimers">
        <ul className="list-disc pl-5 space-y-1">
          <li>We strive for accuracy but do not guarantee that all content is error-free.</li>
          <li>All practice questions on this website are independently created for educational purposes and are not actual certification exam questions.</li>
          <li>We do not guarantee passing any certification exam.</li>
          <li>This website is not affiliated with, endorsed by, or sponsored by AWS, Microsoft, or Google Cloud.</li>
          <li>We are not liable for service interruptions caused by force majeure or server failures.</li>
          <li>The Service is provided "as is" without warranties of any kind.</li>
        </ul>
      </Section>

      <Section title="8. Account Termination">
        <p>You may delete your account at any time. CloudMaster reserves the right to restrict or terminate accounts that violate these Terms without prior notice.</p>
      </Section>

      <Section title="9. Changes to Terms">
        <p>These Terms may be updated as needed. We will notify users via in-service announcements or email. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
      </Section>

      <Section title="10. Contact">
        <p>For inquiries about these Terms: cloudmasterit.service@gmail.com</p>
        <p>Copyright infringement reports: cloudmasterit.service@gmail.com</p>
      </Section>
    </div>
  </AppLayout>
);

export default TermsPage;
