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
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/utils/formatCurrency";

interface ChartDataItem {
  day: string;
  consultas: number;
  ingresos: number;
}

interface AreaChartProps {
  data?: ChartDataItem[];
  showFooter?: boolean;
  height?: number;
  dateRange?: "week" | "month" | "3months" | "year" | "all";
}



function AreaChart({
  data,
  showFooter = false,
  height = 250,
  dateRange = "week",
}: AreaChartProps) {
  // Usar datos personalizados o datos según el período seleccionado
  const chartData = data;

  const { t } = useTranslation("doctor");

  const chartConfig: ChartConfig = {
    consultas: {
      label: t("dashboard.metrics.totalAppointments"),
      color: "var(--accent)",
    },
    ingresos: {
      label: t("dashboard.metrics.totalEarned"),
      color: "var(--secondary)",
    },
  };

  return (
    <Card className="h-full flex flex-col rounded-3xl border-none shadow-none p-0 m-0">
      <CardContent className="flex items-center justify-center h-full">
        <ChartContainer config={chartConfig} className="h-full w-full p-0 m-0">
          <ResponsiveContainer width="100%" height={height}>
            <RechartsAreaChart
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
              <Tooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value, name) => {
                      if (name === "ingresos") {
                        return (
                          <div className="flex w-full flex-wrap items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                              style={{ backgroundColor: "var(--secondary)" }}
                            />
                            <div className="flex flex-1 justify-between leading-none items-center">
                              <span className="text-muted-foreground font-bold">
                                {chartConfig.ingresos.label}
                              </span>
                              <span className="text-foreground font-mono font-medium tabular-nums ml-3">
                                {formatCurrency(value)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="flex w-full flex-wrap items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: "var(--accent)" }}
                          />
                          <div className="flex flex-1 justify-between leading-none items-center">
                            <span className="text-muted-foreground font-bold">
                              {chartConfig.consultas.label}
                            </span>
                            <span className="text-foreground font-mono font-medium tabular-nums ml-3">
                              {Number(value).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                }
              />

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
