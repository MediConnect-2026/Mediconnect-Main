"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { AlertCircle, BarChart3, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import { useTranslation } from "react-i18next";
import { useCenterDoctorsGrowth } from "@/lib/hooks/useCenterStats";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/ui/empty";
import MCButton from "@/shared/components/forms/MCButton";

interface ChartDataItem {
  day: string;
  medicos: number;
}

interface AreaChartProps {
  dateRange?: "week" | "month" | "3months" | "year" | "all";
}

function AreaChart({ dateRange = "month" }: AreaChartProps) {
  const { t } = useTranslation("center");
  const {
    data: growthPoints = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCenterDoctorsGrowth(dateRange);

  const chartData: ChartDataItem[] = growthPoints.map((point) => ({
    day: point.label,
    medicos: point.total,
  }));
  const hasChartData = chartData.some((item) => item.medicos > 0);

  const chartConfig: ChartConfig = {
    medicos: {
      label: t("dashboard.chart.affiliatedDoctorsLabel"),
      color: "var(--accent)",
    },
  };

  return (
    <Card className="h-full flex flex-col rounded-3xl border-none shadow-none p-0 m-0">
      <CardContent className="flex items-center justify-center h-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full w-full gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("dashboard.chart.loading")}</span>
          </div>
        ) : isError ? (
          <Empty>
            <EmptyHeader>
              <div className="flex flex-col items-center gap-2 px-4">
                <span className="flex items-center justify-center gap-2 text-destructive">
                  <AlertCircle className="w-6 h-6" />
                  <EmptyTitle className="font-semibold text-lg">
                    {t("dashboard.chart.errorTitle")}
                  </EmptyTitle>
                </span>
                <EmptyDescription className="text-muted-foreground text-center max-w-md mx-auto text-sm">
                  {error?.message || t("dashboard.chart.errorDescription")}
                </EmptyDescription>
              </div>
            </EmptyHeader>
            <EmptyContent>
              <MCButton variant="outline" onClick={() => refetch()} size="sm">
                {t("dashboard.chart.retry")}
              </MCButton>
            </EmptyContent>
          </Empty>
        ) : chartData.length === 0 || !hasChartData ? (
          <Empty>
            <EmptyHeader>
              <div className="flex flex-col items-center gap-2 px-4">
                <span className="flex items-center justify-center gap-2 text-primary">
                  <BarChart3 className="w-6 h-6" />
                  <EmptyTitle className="font-semibold text-lg">
                    {t("dashboard.chart.emptyTitle")}
                  </EmptyTitle>
                </span>
                <EmptyDescription className="text-muted-foreground text-center max-w-md mx-auto text-sm">
                  {t("dashboard.chart.emptyDescription")}
                </EmptyDescription>
              </div>
            </EmptyHeader>
          </Empty>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}

export default AreaChart;
