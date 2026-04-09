import { Pie, PieChart as RechartsPieChart, Cell } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/ui/empty";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@/shared/ui/chart";
import { useTranslation } from "react-i18next";

interface PieServicesProps {
  data: { name: string; value: number; color: string }[];
  config?: ChartConfig;
  title: string;
  description?: string;
  width?: number;
  height?: number;
}

function PieServices({
  data = [],
  config,
  title,
  description,
  width = 220,
  height = 220,
}: PieServicesProps) {
  const { t } = useTranslation("center");
  const autoConfig: ChartConfig = Object.fromEntries(
    data.map((d) => [
      d.name,
      {
        label: d.name,
        color: d.color,
      },
    ]),
  );
  const hasChartData = data.some((item) => item.value > 0);

  return (
    <Card className="h-full flex flex-col shadow-none">
      <CardHeader className="flex flex-col items-start justify-center p-0">
        <CardTitle className="text-base md:text-2xl font-semibold">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-center h-full">
        {data.length === 0 || !hasChartData ? (
          <Empty>
            <EmptyHeader>
              <div className="flex flex-col items-center gap-2 px-4">
                <span className="flex items-center justify-center gap-2 text-primary">
                  <PieChartIcon className="w-6 h-6" />
                  <EmptyTitle className="font-semibold text-lg">
                    {t("dashboard.specialties.emptyTitle", "Sin datos para mostrar")}
                  </EmptyTitle>
                </span>
                <EmptyDescription className="text-muted-foreground text-center max-w-md mx-auto text-sm">
                  {t("dashboard.specialties.emptyDescription", t("dashboard.specialties.noData"))}
                </EmptyDescription>
              </div>
            </EmptyHeader>
          </Empty>
        ) : (
          <ChartContainer config={config ?? autoConfig} className="h-full w-full">
            <RechartsPieChart width={width} height={height}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie data={data} dataKey="value" nameKey="name">
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="grid grid-cols-2 gap-2 justify-between items-centers"
              />
            </RechartsPieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default PieServices;
