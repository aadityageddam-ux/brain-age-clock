"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { referenceCohort } from "@/lib/cohort";

interface Props {
  batchGaps: number[];
  height?: number;
}

const BIN_WIDTH = 3;

function histogram(values: number[], min: number, max: number) {
  const counts: Record<number, number> = {};
  for (let b = min; b < max; b += BIN_WIDTH) counts[b] = 0;
  for (const v of values) {
    const b = Math.floor((v - min) / BIN_WIDTH) * BIN_WIDTH + min;
    const clamped = Math.min(Math.max(b, min), max - BIN_WIDTH);
    counts[clamped] = (counts[clamped] ?? 0) + 1;
  }
  return counts;
}

export default function GapHistogram({ batchGaps, height = 320 }: Props) {
  const refGaps = referenceCohort.map((r) => r.brain_age_gap);
  const all = [...refGaps, ...batchGaps];
  const min = Math.floor(Math.min(...all) / BIN_WIDTH) * BIN_WIDTH;
  const max = Math.ceil(Math.max(...all) / BIN_WIDTH) * BIN_WIDTH + BIN_WIDTH;

  const refH = histogram(refGaps, min, max);
  const batchH = histogram(batchGaps, min, max);

  const data: { bin: string; center: number; reference: number; uploaded: number }[] = [];
  for (let b = min; b < max; b += BIN_WIDTH) {
    data.push({
      bin: `${b}`,
      center: b + BIN_WIDTH / 2,
      reference: refH[b] ?? 0,
      uploaded: batchH[b] ?? 0,
    });
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 18, bottom: 28, left: 8 }} barGap={0} barCategoryGap="10%">
        <CartesianGrid stroke="#eee7db" vertical={false} />
        <XAxis
          dataKey="center"
          type="number"
          domain={[min, max]}
          tick={{ fontSize: 12, fill: "#5b6472" }}
          label={{ value: "Brain-age gap (years)", position: "bottom", offset: 6, fontSize: 12, fill: "#5b6472" }}
        />
        <YAxis tick={{ fontSize: 12, fill: "#5b6472" }} label={{ value: "Count", angle: -90, position: "insideLeft", fontSize: 12, fill: "#5b6472" }} />
        <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e7e1d6", fontSize: 12 }} labelFormatter={(v) => `gap ≈ ${v} yrs`} />
        <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine x={0} stroke="#9aa2b1" strokeDasharray="4 4" />
        <Bar dataKey="reference" name="Reference cohort" fill="#c9c1b3" />
        <Bar dataKey="uploaded" name="Uploaded batch" fill="#6d5bd0" />
      </BarChart>
    </ResponsiveContainer>
  );
}
