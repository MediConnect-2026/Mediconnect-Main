"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/shared/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import { useTranslation } from "react-i18next";

interface ChartDataItem {
  day: string;
  medicos: number;
}

interface AreaChartProps {
  dateRange?: "week" | "month" | "3months" | "year" | "all";
}

const dataByPeriod: Record<string, ChartDataItem[]> = {
  week: [
    { day: "Lun", medicos: 405 },
    { day: "Mar", medicos: 407 },
    { day: "Mié", medicos: 408 },
    { day: "Jue", medicos: 410 },
    { day: "Vie", medicos: 411 },
    { day: "Sáb", medicos: 412 },
    { day: "Dom", medicos: 412 },
  ],
  month: [
    { day: "Sem 1", medicos: 395 },
    { day: "Sem 2", medicos: 400 },
    { day: "Sem 3", medicos: 406 },
    { day: "Sem 4", medicos: 412 },
  ],
  "3months": [
    { day: "Ene", medicos: 380 },
    { day: "Feb", medicos: 396 },
    { day: "Mar", medicos: 412 },
  ],
  year: [
    { day: "Ene", medicos: 320 },
    { day: "Feb", medicos: 335 },
    { day: "Mar", medicos: 348 },
    { day: "Abr", medicos: 355 },
    { day: "May", medicos: 362 },
    { day: "Jun", medicos: 370 },
    { day: "Jul", medicos: 378 },
    { day: "Ago", medicos: 385 },
    { day: "Sep", medicos: 392 },
    { day: "Oct", medicos: 400 },
    { day: "Nov", medicos: 406 },
    { day: "Dic", medicos: 412 },
  ],
  all: [
    { day: "2021", medicos: 150 },
    { day: "2022", medicos: 220 },
    { day: "2023", medicos: 295 },
    { day: "2024", medicos: 370 },
    { day: "2025", medicos: 412 },
  ],
};

function AreaChart({ dateRange = "month" }: AreaChartProps) {
  const { t } = useTranslation("center");
  const chartData = dataByPeriod[dateRange];

  const chartConfig: ChartConfig = {
    medicos: {
      label: t("dashboard.chart.affiliatedDoctorsLabel"),
      color: "var(--accent)",
    },
  };

  return (
    <Card className="h-full flex flex-col rounded-3xl border-none shadow-none p-0 m-0">
      <CardContent className="flex items-center justify-center h-full">
        <ChartContainer config={chartConfig} className="h-full w-full p-0 m-0">
          <RechartsAreaChart
            width={982}
            height={325}
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <Tooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="medicos"
              type="monotone"
              fill="var(--accent)"
              fillOpacity={0.3}
              stroke="var(--accent)"
              strokeWidth={2}
            />
          </RechartsAreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default AreaChart;
