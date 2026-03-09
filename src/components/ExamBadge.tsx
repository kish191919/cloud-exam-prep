interface ExamBadgeProps {
  provider: 'AWS' | 'AZURE' | 'GCP';
  code: string;
  size?: number;
}

const PROVIDER_CONFIG = {
  AWS:   { accent: '#FF9900', label: 'AWS' },
  AZURE: { accent: '#0078D4', label: 'AZURE' },
  GCP:   { accent: '#4285F4', label: 'GCP' },
};

export default function ExamBadge({ provider, code, size = 80 }: ExamBadgeProps) {
  const { accent, label } = PROVIDER_CONFIG[provider as keyof typeof PROVIDER_CONFIG]
    ?? { accent: '#888888', label: provider };
  const dashIdx = code.indexOf('-');
  const hasDash = dashIdx !== -1;
  const part1 = hasDash ? code.slice(0, dashIdx) : code;
  const part2 = hasDash ? code.slice(dashIdx + 1) : '';

  // Scale text positions relative to 80×80 base
  const scale = size / 80;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      aria-label={`${label} ${code} certification badge`}
    >
      {/* Hexagon background */}
      <polygon
        points="40,2 73,21 73,59 40,78 7,59 7,21"
        fill="#1e2d40"
        stroke={accent}
        strokeWidth="2.5"
      />

      {/* Separator line */}
      <line x1="14" y1="36" x2="66" y2="36" stroke={accent} strokeWidth="0.8" opacity="0.7" />

      {/* Provider label */}
      <text
        x="40"
        y="29"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={accent}
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.5"
      >
        {label}
      </text>

      {hasDash ? (
        <>
          {/* Code part 1 (e.g. AIF, CLF, SAA) */}
          <text
            x="40"
            y="51"
            textAnchor="middle"
            fontSize="15"
            fontWeight="800"
            fill="white"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {part1}
          </text>
          {/* Code part 2 (e.g. C01, C02, C03) */}
          <text
            x="40"
            y="64"
            textAnchor="middle"
            fontSize="10"
            fontWeight="500"
            fill="#94a3b8"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {part2}
          </text>
        </>
      ) : (
        /* Single-part code (e.g. ACE, PCA) */
        <text
          x="40"
          y="57"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fill="white"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {part1}
        </text>
      )}
    </svg>
  );
}
