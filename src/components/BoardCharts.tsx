import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
} from 'recharts';

// ─── Salary Bar Chart ─────────────────────────────────────────────────────────
const salaryDataKo = [
  { cert: 'AWS SAA', min: 5500, max: 9000, avg: 7200 },
  { cert: 'AWS SAP', min: 7000, max: 12000, avg: 9500 },
  { cert: 'GCP ACE', min: 5000, max: 8500, avg: 6800 },
  { cert: 'GCP PCA', min: 6500, max: 11000, avg: 9000 },
  { cert: 'AZ-104',  min: 5000, max: 8000, avg: 6500 },
  { cert: 'AZ-305',  min: 6500, max: 10500, avg: 8500 },
];

const salaryDataEn = [
  { cert: 'AWS SAA', min: 95, max: 145, avg: 120 },
  { cert: 'AWS SAP', min: 120, max: 185, avg: 155 },
  { cert: 'GCP ACE', min: 88, max: 135, avg: 112 },
  { cert: 'GCP PCA', min: 110, max: 170, avg: 142 },
  { cert: 'AZ-104',  min: 90, max: 140, avg: 115 },
  { cert: 'AZ-305',  min: 112, max: 165, avg: 140 },
];

const SALARY_COLORS = {
  min: '#94a3b8',
  avg: '#6366f1',
  max: '#22c55e',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  isKo: boolean;
}

function SalaryTooltip({ active, payload, label, isKo }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const unit = isKo ? '만원' : 'K USD';
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="flex gap-2">
          <span>{p.name}:</span>
          <span className="font-mono font-semibold">{p.value.toLocaleString()} {unit}</span>
        </p>
      ))}
    </div>
  );
}

export function SalaryBarChart() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const data = isKo ? salaryDataKo : salaryDataEn;
  const unit = isKo ? '만원' : 'K';

  const labels = isKo
    ? { min: '최솟값', avg: '평균', max: '최댓값' }
    : { min: 'Min', avg: 'Avg', max: 'Max' };

  return (
    <div className="my-6 p-5 rounded-2xl border border-border bg-muted/20">
      <h4 className="text-sm font-semibold mb-1">
        {isKo ? '자격증별 연봉 비교' : 'Salary by Certification'}
      </h4>
      <p className="text-xs text-muted-foreground mb-4">
        {isKo ? `단위: 만원/년 (2026년 기준 국내 채용 공고 평균)` : 'Unit: K USD/yr (2026 job posting avg)'}
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="cert" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={v => `${v}${unit}`}
            width={isKo ? 58 : 42}
          />
          <Tooltip content={<SalaryTooltip isKo={isKo} />} />
          <Legend
            formatter={(value) => {
              if (value === 'min') return labels.min;
              if (value === 'avg') return labels.avg;
              if (value === 'max') return labels.max;
              return value;
            }}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="min" name="min" fill={SALARY_COLORS.min} radius={[3, 3, 0, 0]} />
          <Bar dataKey="avg" name="avg" fill={SALARY_COLORS.avg} radius={[3, 3, 0, 0]} />
          <Bar dataKey="max" name="max" fill={SALARY_COLORS.max} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Market Share Pie Chart ────────────────────────────────────────────────────
const marketData = [
  { name: 'AWS',   value: 31, color: '#f97316' },
  { name: 'Azure', value: 22, color: '#3b82f6' },
  { name: 'GCP',   value: 11, color: '#22c55e' },
  { name: 'Other', value: 36, color: '#94a3b8' },
];

interface MarketTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}

function MarketTooltip({ active, payload }: MarketTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold">{payload[0].name}</p>
      <p className="font-mono">{payload[0].value}%</p>
    </div>
  );
}

export function MarketShareChart() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  return (
    <div className="my-6 p-5 rounded-2xl border border-border bg-muted/20">
      <h4 className="text-sm font-semibold mb-1">
        {isKo ? '클라우드 시장점유율 (2026)' : 'Cloud Market Share (2026)'}
      </h4>
      <p className="text-xs text-muted-foreground mb-4">
        {isKo ? '출처: Synergy Research Group, 2026년 Q1' : 'Source: Synergy Research Group, Q1 2026'}
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={marketData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            label={({ name, value }) => `${name} ${value}%`}
            labelLine={false}
          >
            {marketData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<MarketTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
