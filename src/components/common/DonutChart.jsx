import React from 'react';

/**
 * @param {{label:string, value:number, color:string}[]} segments
 * @param {number} size - outer diameter in px
 */
export function DonutChart({ segments, size = 180, strokeWidth = 26, centerLabel, centerValue }) {
  const total = segments.reduce((sum, s) => sum + (s.value || 0), 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const visibleSegments = segments.filter((s) => s.value > 0);

  const arcs = visibleSegments.map((s, index) => {
    const fraction = total > 0 ? s.value / total : 0;
    const dash = fraction * circumference;

    const offset = visibleSegments
      .slice(0, index)
      .reduce((sum, previous) => {
        const previousFraction = total > 0 ? previous.value / total : 0;
        return sum + previousFraction * circumference;
      }, 0);

    return (
      <circle
        key={s.label}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={s.color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        strokeLinecap={visibleSegments.length === 1 ? 'butt' : 'round'}
      />
    );
  });

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {total === 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
        )}
        {arcs}
      </svg>

      {(centerLabel || centerValue !== undefined) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue !== undefined && (
            <span className="text-2xl font-bold text-slate-900">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-xs text-slate-500">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function DonutLegend({ segments }) {
  const total = segments.reduce((sum, s) => sum + (s.value || 0), 0);

  return (
    <div className="space-y-2.5">
      {segments.map((s) => (
        <div key={s.label} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 text-slate-600 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="truncate">{s.label}</span>
          </span>

          <span className="text-slate-500 shrink-0">
            <span className="font-semibold text-slate-800">{s.value}</span>{' '}
            {total > 0 && (
              <span className="text-xs">
                ({Math.round((s.value / total) * 100)}%)
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}