import AppLayout from '@/components/AppLayout';
import { useTranslation } from 'react-i18next';

const DisclaimerPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  if (lang === 'ko') return <DisclaimerKo />;
  if (lang === 'es') return <DisclaimerEs />;
  if (lang === 'pt') return <DisclaimerPt />;
  if (lang === 'ja') return <DisclaimerJa />;
  return <DisclaimerEn />;
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
          <li>AWS, Amazon Web Services, Microsoft, AZURE, Google Cloud 및 관련 상표는 각 소유자의 재산입니다.</li>
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
            AWS, Amazon Web Services, Microsoft, AZURE, Google Cloud 및 관련 상표는 각 소유자의 재산이며,
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
          <li>AWS, Amazon Web Services, Microsoft, AZURE, Google Cloud, and all related trademarks are the property of their respective owners.</li>
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
            AWS, Amazon Web Services, Microsoft, AZURE, Google Cloud, and related trademarks are the property of
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

const DisclaimerEs = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">Aviso Legal y Derechos de Autor</h1>
      <p className="text-sm text-muted-foreground mb-8">Última actualización: febrero de 2026</p>

      <Section title="1. Aviso legal">
        <p>
          CloudMaster es una plataforma educativa independiente para la preparación de exámenes de certificación en la nube.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Este sitio web no tiene afiliación, respaldo, patrocinio ni certificación de Amazon Web Services (AWS), Microsoft ni Google Cloud.</li>
          <li>AWS, Amazon Web Services, Microsoft, AZURE, Google Cloud y las marcas comerciales relacionadas son propiedad de sus respectivos dueños.</li>
          <li>Todas las preguntas de práctica y materiales de estudio de este sitio web son creados de forma independiente con fines educativos y de preparación para exámenes únicamente. No son preguntas reales de exámenes de certificación ni están extraídas de ningún examen oficial.</li>
          <li>Para obtener información oficial y autorizada, consulte la documentación oficial y los materiales de capacitación de AWS, Microsoft y Google Cloud.</li>
        </ul>
      </Section>

      <Section title="2. Aviso de derechos de autor y marcas comerciales">
        <p>© 2026 CloudMaster. Todos los derechos reservados.</p>
        <p>Todas las preguntas de práctica, explicaciones, publicaciones de blog y materiales educativos de este sitio web están protegidos por la ley de derechos de autor.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Está estrictamente prohibido copiar, redistribuir o reproducir cualquier contenido de este sitio web sin permiso previo por escrito.</li>
          <li>
            AWS, Amazon Web Services, Microsoft, AZURE, Google Cloud y las marcas comerciales relacionadas son propiedad de sus respectivos dueños y se utilizan únicamente con fines de identificación. Su uso no implica ninguna afiliación con CloudMaster ni respaldo por parte de CloudMaster.
          </li>
        </ul>
      </Section>

      <Section title="3. Aviso de infracción de derechos de autor">
        <p>
          Respetamos los derechos de propiedad intelectual de los proveedores de certificaciones. Si considera que algún contenido de este sitio web infringe los derechos de autor o las políticas de examen, comuníquese con nosotros y revisaremos y eliminaremos el contenido de forma inmediata si fuera necesario.
        </p>
        <p>Contacto: cloudmasterit.service@gmail.com</p>
      </Section>
    </div>
  </AppLayout>
);

const DisclaimerPt = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">Isenção de Responsabilidade e Aviso de Direitos Autorais</h1>
      <p className="text-sm text-muted-foreground mb-8">Última atualização: fevereiro de 2026</p>

      <Section title="1. Isenção de responsabilidade">
        <p>
          O CloudMaster é uma plataforma educacional independente para preparação de exames de certificação em nuvem.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Este site não é afiliado, endossado, patrocinado nem certificado pela Amazon Web Services (AWS), Microsoft ou Google Cloud.</li>
          <li>AWS, Amazon Web Services, Microsoft, AZURE, Google Cloud e todas as marcas registradas relacionadas são propriedade de seus respectivos donos.</li>
          <li>Todas as questões de prática e materiais de estudo deste site são criados de forma independente apenas para fins educacionais e de preparação para exames. Não são questões reais de exames de certificação nem foram retiradas de nenhum exame oficial.</li>
          <li>Para informações oficiais e autorizadas, consulte a documentação oficial e os materiais de treinamento da AWS, Microsoft e Google Cloud.</li>
        </ul>
      </Section>

      <Section title="2. Aviso de direitos autorais e marcas registradas">
        <p>© 2026 CloudMaster. Todos os direitos reservados.</p>
        <p>Todas as questões de prática, explicações, postagens de blog e materiais educacionais deste site são protegidos pela lei de direitos autorais.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>É estritamente proibido copiar, redistribuir ou reproduzir qualquer conteúdo deste site sem permissão prévia por escrito.</li>
          <li>
            AWS, Amazon Web Services, Microsoft, AZURE, Google Cloud e marcas relacionadas são propriedade de seus respectivos donos e são usadas apenas para fins de identificação. Seu uso não implica qualquer afiliação com o CloudMaster nem endosso pelo CloudMaster.
          </li>
        </ul>
      </Section>

      <Section title="3. Aviso de violação de direitos autorais">
        <p>
          Respeitamos os direitos de propriedade intelectual dos provedores de certificação. Se você acreditar que algum conteúdo deste site viola direitos autorais ou políticas de exame, entre em contato conosco e revisaremos e removeremos o conteúdo prontamente, se necessário.
        </p>
        <p>Contato: cloudmasterit.service@gmail.com</p>
      </Section>
    </div>
  </AppLayout>
);

const DisclaimerJa = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-2xl font-bold mb-2">免責事項および著作権表示</h1>
      <p className="text-sm text-muted-foreground mb-8">最終更新: 2026年2月</p>

      <Section title="1. 免責事項">
        <p>
          CloudMasterはクラウド認定試験の準備のための独立した教育プラットフォームです。
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>本サービスはAmazon Web Services（AWS）、Microsoft、Google Cloudとの提携・後援・承認・認定関係はありません。</li>
          <li>AWS、Amazon Web Services、Microsoft、AZURE、Google Cloudおよび関連商標は各所有者の財産です。</li>
          <li>本サービスのすべての練習問題と学習教材は、教育および試験準備目的のために独自に作成されたものです。これらは実際の認定試験の問題ではなく、いかなる公式試験からも引用されていません。</li>
          <li>正確で権威ある情報については、AWS、Microsoft、Google Cloudの公式ドキュメントおよびトレーニング教材を必ずご参照ください。</li>
        </ul>
      </Section>

      <Section title="2. 著作権および商標表示">
        <p>© 2026 CloudMaster. All rights reserved.</p>
        <p>本サービスのすべての練習問題、解説、ブログ記事、学習教材は著作権法の保護を受けています。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>事前の書面による許可なく、本サービスのコンテンツを無断で複製、再配布、または再発行することは厳禁です。</li>
          <li>
            AWS、Amazon Web Services、Microsoft、AZURE、Google Cloudおよび関連商標は各所有者の財産であり、CloudMasterとは無関係です。これらの名称は識別目的のみに使用されており、CloudMasterとの提携や承認を示すものではありません。
          </li>
        </ul>
      </Section>

      <Section title="3. 著作権侵害の申告">
        <p>
          認定プロバイダーの知的財産権を尊重しています。本サービスのコンテンツが著作権または試験ポリシーに違反していると思われる場合は、お問い合わせください。速やかに確認し、必要に応じて該当コンテンツを削除いたします。
        </p>
        <p>お問い合わせ: cloudmasterit.service@gmail.com</p>
      </Section>
    </div>
  </AppLayout>
);

export default DisclaimerPage;
