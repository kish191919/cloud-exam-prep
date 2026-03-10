import AppLayout from '@/components/AppLayout';
import { useTranslation } from 'react-i18next';

const TermsPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  if (lang === 'ko') return <TermsKo />;
  if (lang === 'es') return <TermsEs />;
  if (lang === 'pt') return <TermsPt />;
  if (lang === 'ja') return <TermsJa />;
  return <TermsEn />;
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
        <p>CloudMasterIT LLC(이하 "서비스")는 AWS, GCP, AZURE 클라우드 자격증 시험을 준비하는 사용자를 위한 독립적인 온라인 교육 플랫폼입니다. 본 약관은 서비스 이용에 관한 이용자와 CloudMasterIT LLC 간의 권리·의무를 규정합니다.</p>
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
        <p>CloudMasterIT LLC는 일부 기능을 무료로 제공하며, 추가 기능은 유료 구독을 통해 이용할 수 있습니다.</p>
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
        <p>서비스 내 모든 콘텐츠(문제, 해설, UI 등)의 저작권은 CloudMasterIT LLC에 귀속됩니다. 이용자는 개인 학습 목적으로만 서비스를 이용할 수 있으며, 상업적 이용은 금지됩니다.</p>
        <p>AWS, Amazon Web Services, Microsoft, AZURE, Google Cloud 및 관련 상표는 각 소유자의 재산이며, CloudMasterIT LLC와 무관합니다. 해당 명칭은 식별 목적으로만 사용됩니다.</p>
        <p>이용자는 사전 서면 허가 없이 서비스 내 콘텐츠를 복제, 재배포 또는 판매할 수 없습니다.</p>
      </Section>

      <Section title="6. 서비스 중단 및 변경">
        <p>CloudMasterIT LLC는 서비스 개선, 유지보수, 사업상의 이유로 서비스의 일부 또는 전부를 변경하거나 중단할 수 있습니다. 중요한 변경 또는 서비스 종료 시 사전에 공지합니다.</p>
      </Section>

      <Section title="7. 면책 조항">
        <ul className="list-disc pl-5 space-y-1">
          <li>CloudMasterIT LLC는 서비스 내 문제·해설의 정확성을 위해 노력하나, 완전한 정확성을 보장하지 않습니다.</li>
          <li>서비스 내 모든 연습 문제는 교육 목적으로 독자적으로 제작된 것이며, 실제 자격증 시험 문제가 아닙니다.</li>
          <li>실제 자격증 시험 합격을 보장하지 않습니다.</li>
          <li>본 서비스는 AWS, Microsoft, Google Cloud와 공식 제휴 관계가 없으며, 해당 기업들의 승인을 받지 않았습니다.</li>
          <li>천재지변, 서버 장애 등 불가항력에 의한 서비스 중단에 대해 책임지지 않습니다.</li>
          <li>서비스는 어떠한 종류의 보증 없이 "있는 그대로" 제공됩니다.</li>
        </ul>
      </Section>

      <Section title="8. 계정 해지">
        <p>이용자는 언제든지 계정을 삭제할 수 있습니다. CloudMasterIT LLC는 약관 위반 시 사전 통보 없이 이용을 제한하거나 계정을 해지할 수 있습니다.</p>
      </Section>

      <Section title="9. 약관 변경">
        <p>본 약관은 필요 시 변경될 수 있으며, 변경 시 서비스 내 공지 또는 이메일을 통해 안내합니다. 변경 후 계속 서비스를 이용하면 변경된 약관에 동의한 것으로 봅니다.</p>
      </Section>

      <Section title="10. 문의">
        <p>이용약관에 관한 문의: admin@cloudmasterit.com</p>
        <p>저작권 침해 신고: admin@cloudmasterit.com</p>
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
        <p>CloudMasterIT LLC ("Service") is an independent online educational platform for users preparing for AWS, GCP and AZURE cloud certifications. These Terms govern the relationship between users and CloudMasterIT LLC regarding the use of the Service.</p>
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
        <p>CloudMasterIT LLC provides some features for free and additional features through a paid subscription.</p>
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
        <p>All content within the Service (questions, explanations, UI, etc.) is owned by CloudMasterIT LLC. Users may use the Service for personal study purposes only. Commercial use is prohibited.</p>
        <p>AWS, Amazon Web Services, Microsoft, AZURE, Google Cloud, and related trademarks are the property of their respective owners and are not affiliated with CloudMasterIT LLC. These names are used for identification purposes only.</p>
        <p>Users may not copy, reproduce, distribute, or republish any content from this website without prior written permission.</p>
      </Section>

      <Section title="6. Service Changes">
        <p>CloudMasterIT LLC may modify or discontinue the Service in whole or in part for improvement, maintenance, or business reasons. Significant changes or service terminations will be announced in advance.</p>
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
        <p>You may delete your account at any time. CloudMasterIT LLC reserves the right to restrict or terminate accounts that violate these Terms without prior notice.</p>
      </Section>

      <Section title="9. Changes to Terms">
        <p>These Terms may be updated as needed. We will notify users via in-service announcements or email. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
      </Section>

      <Section title="10. Contact">
        <p>For inquiries about these Terms: admin@cloudmasterit.com</p>
        <p>Copyright infringement reports: admin@cloudmasterit.com</p>
      </Section>
    </div>
  </AppLayout>
);

const TermsEs = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">Términos de Servicio</h1>
      <p className="text-sm text-muted-foreground mb-8">Última actualización: febrero de 2026</p>

      <Section title="1. Acerca del servicio">
        <p>CloudMasterIT LLC ("Servicio") es una plataforma educativa en línea independiente para usuarios que se preparan para las certificaciones en la nube de AWS, GCP y AZURE. Estos Términos rigen la relación entre los usuarios y CloudMasterIT LLC con respecto al uso del Servicio.</p>
        <p>Este sitio web no tiene afiliación, respaldo ni patrocinio de Amazon Web Services (AWS), Microsoft ni Google Cloud.</p>
      </Section>

      <Section title="2. Requisitos de elegibilidad">
        <ul className="list-disc pl-5 space-y-1">
          <li>Debe tener al menos 14 años para utilizar este Servicio.</li>
          <li>Debe proporcionar información precisa al registrarse.</li>
          <li>Usted es responsable de mantener la seguridad de su cuenta.</li>
          <li>Cada usuario puede crear únicamente una cuenta.</li>
        </ul>
      </Section>

      <Section title="3. Funciones gratuitas y de pago">
        <p>CloudMasterIT LLC ofrece algunas funciones de forma gratuita y funciones adicionales mediante una suscripción de pago.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Gratuito:</strong> Preguntas de muestra y conjuntos de exámenes limitados</li>
          <li><strong>De pago:</strong> Banco de preguntas completo, exámenes ilimitados, análisis detallados y más</li>
        </ul>
        <p>Los precios y la oferta están sujetos a cambios con previo aviso.</p>
      </Section>

      <Section title="4. Actividades prohibidas">
        <p>Queda prohibido:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Copiar, distribuir o vender cualquier contenido (preguntas, explicaciones, interfaz) sin autorización</li>
          <li>Usar herramientas automatizadas (bots, scrapers) para recopilar datos</li>
          <li>Suplantar la identidad de otros o intentar accesos no autorizados</li>
          <li>Interferir con el funcionamiento normal del Servicio</li>
          <li>Realizar cualquier actividad que infrinja las leyes aplicables</li>
        </ul>
      </Section>

      <Section title="5. Propiedad intelectual">
        <p>Todo el contenido del Servicio (preguntas, explicaciones, interfaz, etc.) es propiedad de CloudMasterIT LLC. Los usuarios pueden utilizar el Servicio únicamente para fines de estudio personal. El uso comercial está prohibido.</p>
        <p>AWS, Amazon Web Services, Microsoft, AZURE, Google Cloud y las marcas comerciales relacionadas son propiedad de sus respectivos dueños y no tienen afiliación con CloudMasterIT LLC. Estos nombres se utilizan únicamente con fines de identificación.</p>
        <p>Los usuarios no pueden copiar, reproducir, distribuir ni republicar ningún contenido de este sitio web sin permiso previo por escrito.</p>
      </Section>

      <Section title="6. Cambios en el servicio">
        <p>CloudMasterIT LLC puede modificar o interrumpir el Servicio total o parcialmente por motivos de mejora, mantenimiento o razones comerciales. Los cambios significativos o la terminación del servicio se anunciarán con anticipación.</p>
      </Section>

      <Section title="7. Exenciones de responsabilidad">
        <ul className="list-disc pl-5 space-y-1">
          <li>Nos esforzamos por la precisión, pero no garantizamos que todo el contenido esté libre de errores.</li>
          <li>Todas las preguntas de práctica de este sitio web son creadas de forma independiente con fines educativos y no son preguntas reales de exámenes de certificación.</li>
          <li>No garantizamos aprobar ningún examen de certificación.</li>
          <li>Este sitio web no tiene afiliación, respaldo ni patrocinio de AWS, Microsoft ni Google Cloud.</li>
          <li>No somos responsables de interrupciones del servicio causadas por fuerza mayor o fallas de servidor.</li>
          <li>El Servicio se proporciona "tal cual" sin garantías de ningún tipo.</li>
        </ul>
      </Section>

      <Section title="8. Terminación de cuenta">
        <p>Puede eliminar su cuenta en cualquier momento. CloudMasterIT LLC se reserva el derecho de restringir o cancelar cuentas que infrinjan estos Términos sin previo aviso.</p>
      </Section>

      <Section title="9. Cambios en los términos">
        <p>Estos Términos pueden actualizarse según sea necesario. Notificaremos a los usuarios mediante avisos dentro del servicio o por correo electrónico. El uso continuado del Servicio tras los cambios constituye la aceptación de los Términos actualizados.</p>
      </Section>

      <Section title="10. Contacto">
        <p>Para consultas sobre estos Términos: admin@cloudmasterit.com</p>
        <p>Informes de infracción de derechos de autor: admin@cloudmasterit.com</p>
      </Section>
    </div>
  </AppLayout>
);

const TermsPt = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">Termos de Serviço</h1>
      <p className="text-sm text-muted-foreground mb-8">Última atualização: fevereiro de 2026</p>

      <Section title="1. Sobre o serviço">
        <p>O CloudMasterIT LLC ("Serviço") é uma plataforma educacional online independente para usuários que se preparam para as certificações em nuvem AWS, GCP e AZURE. Estes Termos regem a relação entre os usuários e o CloudMasterIT LLC no que diz respeito ao uso do Serviço.</p>
        <p>Este site não é afiliado, endossado nem patrocinado pela Amazon Web Services (AWS), Microsoft ou Google Cloud.</p>
      </Section>

      <Section title="2. Requisitos de elegibilidade">
        <ul className="list-disc pl-5 space-y-1">
          <li>Você deve ter pelo menos 14 anos para usar este Serviço.</li>
          <li>Você deve fornecer informações precisas ao se registrar.</li>
          <li>Você é responsável por manter a segurança de sua conta.</li>
          <li>Cada usuário pode criar apenas uma conta.</li>
        </ul>
      </Section>

      <Section title="3. Recursos gratuitos e pagos">
        <p>O CloudMasterIT LLC oferece alguns recursos gratuitamente e recursos adicionais por meio de uma assinatura paga.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Gratuito:</strong> Questões de amostra e conjuntos de exames limitados</li>
          <li><strong>Pago:</strong> Banco de questões completo, exames ilimitados, análises detalhadas e mais</li>
        </ul>
        <p>Os preços e ofertas estão sujeitos a alterações mediante aviso prévio.</p>
      </Section>

      <Section title="4. Atividades proibidas">
        <p>É proibido:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Copiar, distribuir ou vender qualquer conteúdo (questões, explicações, interface) sem autorização</li>
          <li>Usar ferramentas automatizadas (bots, scrapers) para coletar dados</li>
          <li>Representar outras pessoas ou tentar acessos não autorizados</li>
          <li>Interferir no funcionamento normal do Serviço</li>
          <li>Realizar qualquer atividade que viole as leis aplicáveis</li>
        </ul>
      </Section>

      <Section title="5. Propriedade intelectual">
        <p>Todo o conteúdo do Serviço (questões, explicações, interface, etc.) é de propriedade do CloudMasterIT LLC. Os usuários podem usar o Serviço apenas para fins de estudo pessoal. O uso comercial é proibido.</p>
        <p>AWS, Amazon Web Services, Microsoft, AZURE, Google Cloud e marcas relacionadas são propriedade de seus respectivos donos e não são afiliadas ao CloudMasterIT LLC. Esses nomes são usados apenas para fins de identificação.</p>
        <p>Os usuários não podem copiar, reproduzir, distribuir ou republicar qualquer conteúdo deste site sem permissão prévia por escrito.</p>
      </Section>

      <Section title="6. Alterações no serviço">
        <p>O CloudMasterIT LLC pode modificar ou descontinuar o Serviço total ou parcialmente por razões de melhoria, manutenção ou negócios. Alterações significativas ou encerramento do serviço serão anunciados com antecedência.</p>
      </Section>

      <Section title="7. Isenções de responsabilidade">
        <ul className="list-disc pl-5 space-y-1">
          <li>Nos esforçamos pela precisão, mas não garantimos que todo o conteúdo esteja livre de erros.</li>
          <li>Todas as questões de prática deste site são criadas de forma independente para fins educacionais e não são questões reais de exames de certificação.</li>
          <li>Não garantimos a aprovação em nenhum exame de certificação.</li>
          <li>Este site não é afiliado, endossado nem patrocinado pela AWS, Microsoft ou Google Cloud.</li>
          <li>Não somos responsáveis por interrupções do serviço causadas por força maior ou falhas de servidor.</li>
          <li>O Serviço é fornecido "no estado em que se encontra", sem garantias de qualquer tipo.</li>
        </ul>
      </Section>

      <Section title="8. Encerramento de conta">
        <p>Você pode excluir sua conta a qualquer momento. O CloudMasterIT LLC se reserva o direito de restringir ou encerrar contas que violem estes Termos sem aviso prévio.</p>
      </Section>

      <Section title="9. Alterações nos termos">
        <p>Estes Termos podem ser atualizados conforme necessário. Notificaremos os usuários por meio de avisos dentro do serviço ou por e-mail. O uso continuado do Serviço após as alterações constitui aceitação dos Termos atualizados.</p>
      </Section>

      <Section title="10. Contato">
        <p>Para dúvidas sobre estes Termos: admin@cloudmasterit.com</p>
        <p>Relatos de violação de direitos autorais: admin@cloudmasterit.com</p>
      </Section>
    </div>
  </AppLayout>
);

const TermsJa = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">利用規約</h1>
      <p className="text-sm text-muted-foreground mb-8">最終更新: 2026年2月</p>

      <Section title="1. サービスについて">
        <p>CloudMasterIT LLC（以下「サービス」）は、AWS、GCP、AZUREのクラウド認定試験を準備するユーザー向けの独立したオンライン教育プラットフォームです。本規約は、サービスの利用に関するユーザーとCloudMasterIT LLCの間の権利・義務を定めるものです。</p>
        <p>本サービスは、Amazon Web Services（AWS）、Microsoft、Google Cloudとの提携・後援・承認関係のない独立した教育プラットフォームです。</p>
      </Section>

      <Section title="2. 利用資格">
        <ul className="list-disc pl-5 space-y-1">
          <li>本サービスをご利用いただくには、14歳以上である必要があります。</li>
          <li>登録時に正確な情報を提供する必要があります。</li>
          <li>アカウントのセキュリティ（パスワード等）の維持はユーザー本人の責任です。</li>
          <li>各ユーザーは1つのアカウントのみ作成できます。</li>
        </ul>
      </Section>

      <Section title="3. 無料・有料機能">
        <p>CloudMasterIT LLCは一部の機能を無料で提供し、追加機能は有料サブスクリプションでご利用いただけます。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>無料:</strong> サンプル問題および限定的な試験セット</li>
          <li><strong>有料:</strong> 全問題バンク、無制限の試験、詳細な分析など</li>
        </ul>
        <p>料金および提供内容は事前通知のうえ変更される場合があります。</p>
      </Section>

      <Section title="4. 禁止行為">
        <p>以下の行為を禁止します。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>サービス内の問題・解説等のコンテンツの無断複製、配布、販売</li>
          <li>自動化ツール（ボット、スクレイパー等）を使用したデータ収集</li>
          <li>他人のアカウントの不正使用または不正アクセスの試み</li>
          <li>サービスの正常な運営を妨げる行為</li>
          <li>関連法令に違反する行為</li>
        </ul>
      </Section>

      <Section title="5. 知的財産権">
        <p>サービス内のすべてのコンテンツ（問題、解説、UIなど）の著作権はCloudMasterIT LLCに帰属します。ユーザーは個人学習目的のみサービスを利用できます。商業的利用は禁止されています。</p>
        <p>AWS、Amazon Web Services、Microsoft、AZURE、Google Cloudおよび関連商標は各所有者の財産であり、CloudMasterIT LLCとは無関係です。これらの名称は識別目的のみに使用されています。</p>
        <p>ユーザーは事前の書面による許可なく、本サービスのコンテンツを複製、再配布、販売することはできません。</p>
      </Section>

      <Section title="6. サービスの変更・中断">
        <p>CloudMasterIT LLCはサービスの改善、メンテナンス、事業上の理由により、サービスの一部または全部を変更または中断することがあります。重要な変更またはサービス終了の際は事前にお知らせします。</p>
      </Section>

      <Section title="7. 免責事項">
        <ul className="list-disc pl-5 space-y-1">
          <li>正確性の確保に努めますが、すべてのコンテンツが誤りなく提供されることを保証するものではありません。</li>
          <li>本サービスのすべての練習問題は教育目的のために独自に作成されたものであり、実際の認定試験の問題ではありません。</li>
          <li>認定試験の合格を保証するものではありません。</li>
          <li>本サービスはAWS、Microsoft、Google Cloudとの公式提携関係はなく、これらの企業による承認も受けていません。</li>
          <li>不可抗力またはサーバー障害によるサービス中断については責任を負いません。</li>
          <li>本サービスはいかなる種類の保証もなく「現状のまま」提供されます。</li>
        </ul>
      </Section>

      <Section title="8. アカウントの解約">
        <p>ユーザーはいつでもアカウントを削除できます。CloudMasterIT LLCは規約違反があった場合、事前通知なしにサービスの利用を制限またはアカウントを停止する権利を有します。</p>
      </Section>

      <Section title="9. 規約の変更">
        <p>本規約は必要に応じて変更される場合があります。変更時はサービス内のお知らせまたはメールを通じてご案内します。変更後もサービスを継続して利用した場合、変更された規約に同意したものとみなされます。</p>
      </Section>

      <Section title="10. お問い合わせ">
        <p>本規約に関するお問い合わせ: admin@cloudmasterit.com</p>
        <p>著作権侵害の申告: admin@cloudmasterit.com</p>
      </Section>
    </div>
  </AppLayout>
);

export default TermsPage;
