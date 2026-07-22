"use client";

import { groupColor } from "@/lib/cohort";

interface Props {
  /** Gaps per group for the uploaded batch. */
  groups: { group: string; gaps: number[] }[];
  height?: number;
}

interface BoxStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  n: number;
}

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
}

function stats(values: number[]): BoxStats | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  return {
    min: s[0],
    q1: quantile(s, 0.25),
    median: quantile(s, 0.5),
    q3: quantile(s, 0.75),
    max: s[s.length - 1],
    n: s.length,
  };
}

export default function GroupBoxplot({ groups, height = 320 }: Props) {
  const width = 640;
  const padL = 56;
  const padR = 20;
  const padT = 16;
  const padB = 52;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const boxes = groups.map((g) => ({ group: g.group, s: stats(g.gaps) }));
  const allVals = groups.flatMap((g) => g.gaps);
  if (allVals.length === 0) return <p className="text-sm text-[var(--ink-soft)]">No data to plot.</p>;

  const dataMin = Math.min(...allVals);
  const dataMax = Math.max(...allVals);
  const pad = (dataMax - dataMin) * 0.1 || 1;
  const yMin = dataMin - pad;
  const yMax = dataMax + pad;

  const y = (v: number) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const slot = plotW / boxes.length;
  const boxW = Math.min(80, slot * 0.5);

  const ticks: number[] = [];
  const step = niceStep((yMax - yMin) / 5);
  for (let t = Math.ceil(yMin / step) * step; t <= yMax; t += step) ticks.push(Math.round(t));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }} role="img" aria-label="Boxplot of brain-age gap by group">
      {/* gridlines + y ticks */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={width - padR} y1={y(t)} y2={y(t)} stroke="#eee7db" />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize={12} fill="#5b6472">{t}</text>
        </g>
      ))}
      {/* zero line */}
      {0 >= yMin && 0 <= yMax && (
        <line x1={padL} x2={width - padR} y1={y(0)} y2={y(0)} stroke="#9aa2b1" strokeDasharray="4 4" />
      )}
      {/* axis label */}
      <text x={16} y={padT + plotH / 2} fontSize={12} fill="#5b6472" transform={`rotate(-90 16 ${padT + plotH / 2})`} textAnchor="middle">
        Brain-age gap (years)
      </text>

      {boxes.map((b, i) => {
        const cx = padL + slot * i + slot / 2;
        const color = groupColor(b.group);
        if (!b.s) {
          return (
            <text key={b.group} x={cx} y={padT + plotH / 2} textAnchor="middle" fontSize={12} fill="#9aa2b1">no rows</text>
          );
        }
        const { min, q1, median, q3, max, n } = b.s;
        return (
          <g key={b.group}>
            {/* whiskers */}
            <line x1={cx} x2={cx} y1={y(max)} y2={y(q3)} stroke={color} strokeWidth={1.5} />
            <line x1={cx} x2={cx} y1={y(q1)} y2={y(min)} stroke={color} strokeWidth={1.5} />
            <line x1={cx - boxW / 4} x2={cx + boxW / 4} y1={y(max)} y2={y(max)} stroke={color} strokeWidth={1.5} />
            <line x1={cx - boxW / 4} x2={cx + boxW / 4} y1={y(min)} y2={y(min)} stroke={color} strokeWidth={1.5} />
            {/* box */}
            <rect
              x={cx - boxW / 2}
              y={y(q3)}
              width={boxW}
              height={Math.max(1, y(q1) - y(q3))}
              fill={color}
              fillOpacity={0.18}
              stroke={color}
              strokeWidth={1.5}
              rx={3}
            />
            {/* median */}
            <line x1={cx - boxW / 2} x2={cx + boxW / 2} y1={y(median)} y2={y(median)} stroke={color} strokeWidth={2.5} />
            {/* labels */}
            <text x={cx} y={height - padB + 20} textAnchor="middle" fontSize={13} fill="#1f2430" fontWeight={600}>{b.group}</text>
            <text x={cx} y={height - padB + 36} textAnchor="middle" fontSize={11} fill="#5b6472">
              median {median.toFixed(1)} · n={n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function niceStep(raw: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / pow;
  const nice = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  return nice * pow;
}
