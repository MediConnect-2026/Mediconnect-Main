"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";

interface ChartDataItem {
  day: string;
  consultas: number;
  ingresos: number;
}

// Props del componente
interface AreaChartProps {
  data?: ChartDataItem[];
  showFooter?: boolean;
  height?: number;
}

const chartConfig: ChartConfig = {
  consultas: {
    label: "Consultas",
    color: "var(--accent)",
  },
  ingresos: {
    label: "Ingresos",
    color: "var(--secondary)",
  },
};

// Datos por defecto (fallback)
const defaultChartData: ChartDataItem[] = [
  { day: "Lunes", consultas: 120, ingresos: 3500 },
  { day: "Martes", consultas: 180, ingresos: 4200 },
  { day: "Miércoles", consultas: 150, ingresos: 3900 },
  { day: "Jueves", consultas: 200, ingresos: 4800 },
  { day: "Viernes", consultas: 170, ingresos: 4100 },
  { day: "Sábado", consultas: 90, ingresos: 2100 },
];

function AreaChart({
  data = defaultChartData,
  showFooter = false,
  height = 250,
}: AreaChartProps) {
  return (
    <Card className="h-full flex flex-col rounded-3xl border-none shadow-none p-0 m-0">
      <CardContent className="flex items-center justify-center h-full">
        <ChartContainer config={chartConfig} className="h-full w-full p-0 m-0">
          <ResponsiveContainer width="100%" height={height}>
            <RechartsAreaChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              {/* YAxis izquierdo para Consultas */}
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="var(--primary)"
              />
              {/* YAxis derecho para Ingresos */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="var(--primary)"
              />
              <Tooltip content={<ChartTooltipContent indicator="dot" />} />

              {/* Área de Consultas - sin stackId para que no se apile */}
              <Area
                yAxisId="left"
                dataKey="consultas"
                type="monotone"
                fill="var(--accent)"
                fillOpacity={0.3}
                stroke="var(--accent)"
                strokeWidth={2}
              />
              {/* Área de Ingresos - sin stackId para que no se apile */}
              <Area
                yAxisId="right"
                dataKey="ingresos"
                type="monotone"
                fill="var(--secondary)"
                fillOpacity={0.3}
                stroke="var(--secondary)"
                strokeWidth={2}
              />
            </RechartsAreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      {showFooter && <CardFooter></CardFooter>}
    </Card>
  );
}

export default AreaChart;
