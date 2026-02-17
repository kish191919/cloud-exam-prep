import AppLayout from '@/components/AppLayout';
import { useTranslation } from 'react-i18next';

const PrivacyPage = () => {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  if (!isKo) return <PrivacyEn />;
  return <PrivacyKo />;
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </section>
);

const PrivacyKo = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">개인정보 처리방침</h1>
      <p className="text-sm text-muted-foreground mb-8">최종 업데이트: 2026년 2월</p>

      <Section title="1. 수집하는 개인정보">
        <p>CloudMaster는 서비스 제공을 위해 다음 정보를 수집합니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>계정 정보:</strong> 이메일 주소 (회원가입 및 로그인 시)</li>
          <li><strong>학습 데이터:</strong> 시험 세션, 정답/오답 기록, 북마크</li>
          <li><strong>기기 정보:</strong> 브라우저 종류, 접속 시간 (서비스 개선 목적)</li>
        </ul>
      </Section>

      <Section title="2. 개인정보 이용 목적">
        <ul className="list-disc pl-5 space-y-1">
          <li>로그인 인증 및 계정 관리</li>
          <li>학습 진도 및 오답/북마크 데이터 저장·동기화 (기기 간)</li>
          <li>서비스 품질 개선 및 오류 분석</li>
        </ul>
      </Section>

      <Section title="3. 개인정보 보유 기간">
        <p>수집된 개인정보는 회원 탈퇴 시 또는 수집·이용 목적이 달성된 후 지체 없이 삭제됩니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
      </Section>

      <Section title="4. 제3자 제공 및 위탁">
        <p>CloudMaster는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 서비스 운영을 위해 아래 업체에 처리를 위탁합니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Supabase:</strong> 데이터베이스 및 인증 (미국 소재, GDPR 준수)</li>
          <li><strong>Vercel:</strong> 웹 호스팅 (미국 소재)</li>
        </ul>
      </Section>

      <Section title="5. 이용자의 권리">
        <p>이용자는 언제든지 자신의 개인정보에 대해 다음 권리를 행사할 수 있습니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>개인정보 열람, 수정, 삭제 요청</li>
          <li>처리 정지 요청</li>
          <li>회원 탈퇴 (계정 및 모든 학습 데이터 삭제)</li>
        </ul>
        <p>문의: 서비스 내 고객센터 또는 이메일로 연락해 주세요.</p>
      </Section>

      <Section title="6. 쿠키 및 로컬 스토리지">
        <p>CloudMaster는 로그인 상태 유지 및 학습 데이터 임시 저장을 위해 브라우저의 로컬 스토리지와 세션 스토리지를 사용합니다. 비로그인 상태에서의 학습 데이터는 브라우저 종료 시 자동으로 삭제됩니다.</p>
      </Section>

      <Section title="7. 개인정보 보호책임자">
        <p>개인정보 처리에 관한 문의 및 불만 처리는 아래로 연락해 주세요.</p>
        <p>이메일: support@cloudmaster.app</p>
      </Section>

      <Section title="8. 방침 변경">
        <p>본 개인정보 처리방침은 법령 및 서비스 변경에 따라 업데이트될 수 있습니다. 변경 시 서비스 내 공지를 통해 안내합니다.</p>
      </Section>
    </div>
  </AppLayout>
);

const PrivacyEn = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

      <Section title="1. Information We Collect">
        <p>CloudMaster collects the following information to provide our service.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account information:</strong> Email address (when signing up or logging in)</li>
          <li><strong>Learning data:</strong> Exam sessions, correct/wrong answer records, bookmarks</li>
          <li><strong>Device information:</strong> Browser type, access time (for service improvement)</li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul className="list-disc pl-5 space-y-1">
          <li>Authentication and account management</li>
          <li>Storing and syncing your learning progress, wrong answers, and bookmarks across devices</li>
          <li>Improving service quality and analyzing errors</li>
        </ul>
      </Section>

      <Section title="3. Data Retention">
        <p>Collected personal data is deleted upon account deletion or once the purpose of collection is fulfilled. Data may be retained longer if required by applicable law.</p>
      </Section>

      <Section title="4. Third-Party Services">
        <p>CloudMaster does not sell your data. We use the following services to operate our platform.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Supabase:</strong> Database and authentication (US-based, GDPR compliant)</li>
          <li><strong>Vercel:</strong> Web hosting (US-based)</li>
        </ul>
      </Section>

      <Section title="5. Your Rights">
        <p>You may exercise the following rights at any time.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access, correct, or delete your personal data</li>
          <li>Request restriction of processing</li>
          <li>Delete your account (removes all data)</li>
        </ul>
        <p>Contact us via email for any requests.</p>
      </Section>

      <Section title="6. Cookies & Local Storage">
        <p>CloudMaster uses browser local storage and session storage to maintain login state and temporarily save learning data. Learning data for non-logged-in users is automatically deleted when the browser is closed.</p>
      </Section>

      <Section title="7. Contact">
        <p>For privacy-related inquiries, please contact us at:</p>
        <p>Email: support@cloudmaster.app</p>
      </Section>

      <Section title="8. Policy Updates">
        <p>This privacy policy may be updated in response to legal or service changes. We will notify users via in-service announcements.</p>
      </Section>
    </div>
  </AppLayout>
);

export default PrivacyPage;
