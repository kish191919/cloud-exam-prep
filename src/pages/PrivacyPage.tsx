import AppLayout from '@/components/AppLayout';
import { useTranslation } from 'react-i18next';

const PrivacyPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  if (lang === 'ko') return <PrivacyKo />;
  if (lang === 'es') return <PrivacyEs />;
  if (lang === 'pt') return <PrivacyPt />;
  if (lang === 'ja') return <PrivacyJa />;
  return <PrivacyEn />;
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
        <p>CloudMaster는 이용자의 개인정보를 제3자에게 판매하거나 임대하지 않습니다. 또한 법령에 의한 경우를 제외하고 제3자에게 제공하지 않습니다. 다만 서비스 운영을 위해 아래 업체에 처리를 위탁합니다.</p>
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
        <p>본 서비스를 이용함으로써 본 방침에 따른 정보 수집 및 이용에 동의한 것으로 간주합니다.</p>
      </Section>

      <Section title="7. 개인정보 보호책임자">
        <p>개인정보 처리에 관한 문의 및 불만 처리는 아래로 연락해 주세요.</p>
        <p>이메일: cloudmasterit.service@gmail.com</p>
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
        <p>We do not sell, rent, or share your personal information with third parties except as described below or as required by law. We use the following services to operate our platform.</p>
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
        <p>By using this website, you consent to the collection and use of information in accordance with this Privacy Policy.</p>
      </Section>

      <Section title="7. Contact">
        <p>For privacy-related inquiries, please contact us at:</p>
        <p>Email: cloudmasterit.service@gmail.com</p>
      </Section>

      <Section title="8. Policy Updates">
        <p>This privacy policy may be updated in response to legal or service changes. We will notify users via in-service announcements.</p>
      </Section>
    </div>
  </AppLayout>
);

const PrivacyEs = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">Política de Privacidad</h1>
      <p className="text-sm text-muted-foreground mb-8">Última actualización: febrero de 2026</p>

      <Section title="1. Información que recopilamos">
        <p>CloudMaster recopila la siguiente información para prestar el servicio.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Información de cuenta:</strong> Dirección de correo electrónico (al registrarse o iniciar sesión)</li>
          <li><strong>Datos de aprendizaje:</strong> Sesiones de examen, registros de respuestas correctas/incorrectas, marcadores</li>
          <li><strong>Información del dispositivo:</strong> Tipo de navegador, hora de acceso (para mejorar el servicio)</li>
        </ul>
      </Section>

      <Section title="2. Cómo usamos su información">
        <ul className="list-disc pl-5 space-y-1">
          <li>Autenticación y gestión de cuentas</li>
          <li>Almacenamiento y sincronización de su progreso de aprendizaje, respuestas incorrectas y marcadores entre dispositivos</li>
          <li>Mejora de la calidad del servicio y análisis de errores</li>
        </ul>
      </Section>

      <Section title="3. Retención de datos">
        <p>Los datos personales recopilados se eliminan cuando se borra la cuenta o una vez cumplida la finalidad de su recopilación. Los datos podrán conservarse por más tiempo si así lo exige la legislación aplicable.</p>
      </Section>

      <Section title="4. Servicios de terceros">
        <p>No vendemos, alquilamos ni compartimos su información personal con terceros, salvo lo descrito a continuación o cuando lo exija la ley. Utilizamos los siguientes servicios para operar nuestra plataforma.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Supabase:</strong> Base de datos y autenticación (con sede en EE. UU., cumple con el GDPR)</li>
          <li><strong>Vercel:</strong> Alojamiento web (con sede en EE. UU.)</li>
        </ul>
      </Section>

      <Section title="5. Sus derechos">
        <p>Puede ejercer los siguientes derechos en cualquier momento.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Acceder, corregir o eliminar sus datos personales</li>
          <li>Solicitar la restricción del tratamiento</li>
          <li>Eliminar su cuenta (se eliminan todos los datos)</li>
        </ul>
        <p>Contáctenos por correo electrónico para cualquier solicitud.</p>
      </Section>

      <Section title="6. Cookies y almacenamiento local">
        <p>CloudMaster utiliza el almacenamiento local y de sesión del navegador para mantener el estado de inicio de sesión y guardar temporalmente los datos de aprendizaje. Los datos de aprendizaje de usuarios no registrados se eliminan automáticamente al cerrar el navegador.</p>
        <p>Al utilizar este sitio web, usted consiente la recopilación y el uso de información de acuerdo con esta Política de Privacidad.</p>
      </Section>

      <Section title="7. Contacto">
        <p>Para consultas relacionadas con la privacidad, contáctenos en:</p>
        <p>Correo electrónico: cloudmasterit.service@gmail.com</p>
      </Section>

      <Section title="8. Actualizaciones de la política">
        <p>Esta política de privacidad puede actualizarse en respuesta a cambios legales o del servicio. Notificaremos a los usuarios mediante avisos dentro del servicio.</p>
      </Section>
    </div>
  </AppLayout>
);

const PrivacyPt = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">Política de Privacidade</h1>
      <p className="text-sm text-muted-foreground mb-8">Última atualização: fevereiro de 2026</p>

      <Section title="1. Informações que coletamos">
        <p>O CloudMaster coleta as seguintes informações para prestar o serviço.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Informações de conta:</strong> Endereço de e-mail (ao se cadastrar ou fazer login)</li>
          <li><strong>Dados de aprendizado:</strong> Sessões de exame, registros de respostas corretas/incorretas, favoritos</li>
          <li><strong>Informações do dispositivo:</strong> Tipo de navegador, horário de acesso (para melhoria do serviço)</li>
        </ul>
      </Section>

      <Section title="2. Como usamos suas informações">
        <ul className="list-disc pl-5 space-y-1">
          <li>Autenticação e gerenciamento de conta</li>
          <li>Armazenamento e sincronização do seu progresso de aprendizado, respostas incorretas e favoritos entre dispositivos</li>
          <li>Melhoria da qualidade do serviço e análise de erros</li>
        </ul>
      </Section>

      <Section title="3. Retenção de dados">
        <p>Os dados pessoais coletados são excluídos quando a conta é encerrada ou após o cumprimento da finalidade de sua coleta. Os dados poderão ser retidos por mais tempo se exigido pela legislação aplicável.</p>
      </Section>

      <Section title="4. Serviços de terceiros">
        <p>Não vendemos, alugamos nem compartilhamos suas informações pessoais com terceiros, exceto conforme descrito abaixo ou quando exigido por lei. Utilizamos os seguintes serviços para operar nossa plataforma.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Supabase:</strong> Banco de dados e autenticação (com sede nos EUA, em conformidade com o GDPR)</li>
          <li><strong>Vercel:</strong> Hospedagem web (com sede nos EUA)</li>
        </ul>
      </Section>

      <Section title="5. Seus direitos">
        <p>Você pode exercer os seguintes direitos a qualquer momento.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Acessar, corrigir ou excluir seus dados pessoais</li>
          <li>Solicitar a restrição do processamento</li>
          <li>Excluir sua conta (remove todos os dados)</li>
        </ul>
        <p>Entre em contato conosco por e-mail para qualquer solicitação.</p>
      </Section>

      <Section title="6. Cookies e armazenamento local">
        <p>O CloudMaster usa o armazenamento local e de sessão do navegador para manter o estado de login e salvar temporariamente os dados de aprendizado. Os dados de aprendizado de usuários não logados são excluídos automaticamente ao fechar o navegador.</p>
        <p>Ao usar este site, você consente com a coleta e o uso de informações de acordo com esta Política de Privacidade.</p>
      </Section>

      <Section title="7. Contato">
        <p>Para dúvidas relacionadas à privacidade, entre em contato conosco:</p>
        <p>E-mail: cloudmasterit.service@gmail.com</p>
      </Section>

      <Section title="8. Atualizações da política">
        <p>Esta política de privacidade pode ser atualizada em resposta a mudanças legais ou no serviço. Notificaremos os usuários por meio de avisos dentro do serviço.</p>
      </Section>
    </div>
  </AppLayout>
);

const PrivacyJa = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">プライバシーポリシー</h1>
      <p className="text-sm text-muted-foreground mb-8">最終更新: 2026年2月</p>

      <Section title="1. 収集する情報">
        <p>CloudMasterは、サービス提供のために以下の情報を収集します。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>アカウント情報:</strong> メールアドレス（会員登録またはログイン時）</li>
          <li><strong>学習データ:</strong> 試験セッション、正解・不正解の記録、ブックマーク</li>
          <li><strong>デバイス情報:</strong> ブラウザの種類、アクセス時刻（サービス改善目的）</li>
        </ul>
      </Section>

      <Section title="2. 情報の利用目的">
        <ul className="list-disc pl-5 space-y-1">
          <li>ログイン認証およびアカウント管理</li>
          <li>学習進捗、不正解・ブックマークデータのデバイス間での保存・同期</li>
          <li>サービス品質の向上およびエラー分析</li>
        </ul>
      </Section>

      <Section title="3. データの保持期間">
        <p>収集した個人データは、アカウント削除時または収集目的が達成された時点で速やかに削除されます。ただし、適用法令により保存が必要な場合は、該当期間中保管します。</p>
      </Section>

      <Section title="4. 第三者への提供">
        <p>CloudMasterは、以下に記載されている場合または法令で義務付けられている場合を除き、お客様の個人情報を第三者に販売、貸与、または共有しません。プラットフォームの運営のために以下のサービスを利用しています。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Supabase:</strong> データベースおよび認証（米国拠点、GDPR準拠）</li>
          <li><strong>Vercel:</strong> ウェブホスティング（米国拠点）</li>
        </ul>
      </Section>

      <Section title="5. お客様の権利">
        <p>お客様はいつでも以下の権利を行使できます。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>個人データへのアクセス、訂正、または削除のリクエスト</li>
          <li>処理の制限のリクエスト</li>
          <li>アカウントの削除（すべてのデータを削除）</li>
        </ul>
        <p>ご要望はメールにてお問い合わせください。</p>
      </Section>

      <Section title="6. Cookie およびローカルストレージ">
        <p>CloudMasterは、ログイン状態の維持と学習データの一時保存のために、ブラウザのローカルストレージおよびセッションストレージを使用します。未ログイン状態の学習データは、ブラウザを閉じると自動的に削除されます。</p>
        <p>本サービスを利用することにより、本プライバシーポリシーに基づく情報の収集および利用に同意したものとみなされます。</p>
      </Section>

      <Section title="7. お問い合わせ">
        <p>プライバシーに関するお問い合わせは、以下までご連絡ください。</p>
        <p>メール: cloudmasterit.service@gmail.com</p>
      </Section>

      <Section title="8. ポリシーの更新">
        <p>本プライバシーポリシーは、法令またはサービスの変更に応じて更新される場合があります。変更時はサービス内のお知らせを通じてご案内します。</p>
      </Section>
    </div>
  </AppLayout>
);

export default PrivacyPage;
