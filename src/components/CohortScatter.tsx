"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";
import { referenceCohort, GROUP_COLORS, GROUP_ORDER, perfectLine } from "@/lib/cohort";

export interface UserPoint {
  age: number;
  predicted_age: number;
  label?: string;
}

interface Props {
  /** Optional single result (Flow A) rendered as a large star. */
  userPoint?: UserPoint | null;
  /** Optional batch of scored points (Flow B) overlaid on the cohort. */
  batchPoints?: { age: number; predicted_age: number; group?: string }[];
  height?: number;
}

const line = perfectLine();

function StarShape(props: { cx?: number; cy?: number }) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <path
        d={starPath(cx, cy, 11, 5)}
        fill="#111318"
        stroke="#fff"
        strokeWidth={1.5}
      />
    </g>
  );
}

function starPath(cx: number, cy: number, r: number, points: number): string {
  const inner = r * 0.45;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const rad = (Math.PI / points) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : inner;
    d += `${i === 0 ? "M" : "L"}${cx + rr * Math.cos(rad)},${cy + rr * Math.sin(rad)}`;
  }
  return d + "Z";
}

export default function CohortScatter({ userPoint, batchPoints, height = 380 }: Props) {
  const grouped = GROUP_ORDER.map((g) => ({
    group: g,
    data: referenceCohort.filter((r) => r.group === g),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 18, bottom: 28, left: 8 }}>
        <CartesianGrid stroke="#eee7db" />
        <XAxis
          type="number"
          dataKey="age"
          name="Chronological age"
          domain={["dataMin - 2", "dataMax + 2"]}
          tick={{ fontSize: 12, fill: "#5b6472" }}
          label={{ value: "Chronological age (years)", position: "bottom", offset: 6, fontSize: 12, fill: "#5b6472" }}
        />
        <YAxis
          type="number"
          dataKey="predicted_age"
          name="Illustrative output"
          domain={["dataMin - 2", "dataMax + 2"]}
          tick={{ fontSize: 12, fill: "#5b6472" }}
          label={{ value: "Illustrative output (years)", angle: -90, position: "insideLeft", offset: 18, fontSize: 12, fill: "#5b6472" }}
        />
        <ZAxis range={[36, 36]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          formatter={(v) => `${v} yrs`}
          labelFormatter={() => ""}
          contentStyle={{ borderRadius: 10, border: "1px solid #e7e1d6", fontSize: 12 }}
        />
        <Legend verticalAlign="top" height={30} iconType="circle" wrapperStyle={{ fontSize: 12 }} />

        {/* Diagonal perfect-prediction reference line */}
        <ReferenceLine
          segment={line}
          stroke="#9aa2b1"
          strokeDasharray="5 5"
          ifOverflow="extendDomain"
        />

        {grouped.map(({ group, data }) => (
          <Scatter
            key={group}
            name={group}
            data={data}
            fill={GROUP_COLORS[group]}
            fillOpacity={batchPoints ? 0.28 : 0.62}
          />
        ))}

        {batchPoints && (
          <Scatter
            name="Uploaded"
            data={batchPoints}
            shape="triangle"
            fill="#111318"
            fillOpacity={0.7}
          />
        )}

        {userPoint && (
          <Scatter
            name="Example input"
            data={[userPoint]}
            shape={<StarShape />}
            legendType="star"
          />
        )}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
