import { Pie, PieChart as RechartsPieChart, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@/shared/ui/chart";

interface PieServicesProps {
  data: { name: string; value: number; color: string }[];
  config?: ChartConfig;
  title: string;
  description: string;
  width?: number;
  height?: number;
}

function PieServices({
  data = [],
  config,
  title,

  width = 220, // Valor por defecto
  height = 220, // Valor por defecto
}: PieServicesProps) {
  const autoConfig: ChartConfig = Object.fromEntries(
    data.map((d) => [
      d.name,
      {
        label: d.name,
        color: d.color,
      },
    ]),
  );

  return (
    <Card className="h-full flex flex-col  shadow-none">
      <CardHeader className="flex flex-col items-start justify-center p-0">
        <CardTitle className="text-base md:text-2xl font-semibold ">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex items-center justify-center h-full">
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
      </CardContent>
    </Card>
  );
}

export default PieServices;
