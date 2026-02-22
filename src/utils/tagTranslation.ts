const TAG_EN: Record<string, string> = {
  'AI 및 ML의 기초': 'Fundamentals of AI and ML',
  'GenAI의 기초': 'Fundamentals of GenAI',
  '파운데이션 모델의 적용': 'Applications of Foundation Models',
  '책임 있는 AI에 대한 가이드라인': 'Guidelines for Responsible AI',
  'AI 솔루션의 보안, 규정 준수 및 거버넌스':
    'Security, Compliance, and Governance for AI Solutions',
};

export function translateTag(tag: string, isEn: boolean): string {
  return isEn ? (TAG_EN[tag] ?? tag) : tag;
}
