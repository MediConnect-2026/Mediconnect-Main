import React from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import MCMetricCard from "@/shared/components/MCMetricCard";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface Metric {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
  subtitle?: string;
}

interface MCTablesLayoutsProps {
  title: string;
  metrics?: Metric[];
  searchComponent?: React.ReactNode;
  filterComponent?: React.ReactNode;
  tableComponent?: React.ReactNode;
  toogleView?: React.ReactNode;
  filtersInlineWithTitle?: boolean;
  pdfGeneratorComponent?: React.ReactNode;
  actionPlusComponent?: React.ReactNode;
  isDashboard?: boolean;
  titleSize?: string;
  paginationComponent?: React.ReactNode;
}

function MCTablesLayouts({
  title,
  metrics = [],
  searchComponent,
  filterComponent,
  tableComponent,
  toogleView,
  pdfGeneratorComponent,
  actionPlusComponent,
  isDashboard = false,
  titleSize,
  paginationComponent,
}: MCTablesLayoutsProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={`bg-background ${!isDashboard ? "min-h-screen" : "h-fit"} flex flex-col gap-4 rounded-4xl ${
        isDashboard ? "p-10" : isMobile ? "py-6 px-6" : "p-10"
      }`}
    >
      <motion.main
        {...fadeInUp}
        className="w-full flex flex-col flex-1 min-h-0"
      >
        {/* Header con título y acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1
            className={`${
              titleSize
                ? titleSize
                : isDashboard
                  ? isMobile
                    ? "text-2xl"
                    : "text-3xl"
                  : isMobile
                    ? "text-2xl"
                    : "text-3xl"
            } font-bold text-foreground`}
          >
            {title}
          </h1>

          {/* Acciones */}
          {(searchComponent ||
            filterComponent ||
            toogleView ||
            pdfGeneratorComponent ||
            actionPlusComponent) && (
            <div
              className={`flex ${
                isMobile ? "flex-col w-full" : "flex-row"
              } gap-3 items-stretch sm:items-center justify-end ${
                isMobile ? "w-full" : "max-w-lg"
              }`}
            >
              <div
                className={`flex ${
                  isMobile
                    ? "grid grid-cols-2 grid-rows-2 auto-rows-[48px] gap-3 items-center w-full"
                    : "flex-row gap-3"
                }`}
              >
                {searchComponent}
                {filterComponent}
                {toogleView}
                {pdfGeneratorComponent}
                {actionPlusComponent}
              </div>
            </div>
          )}
        </div>

        {/* Métricas Cards */}
        {metrics.length > 0 && (
          <div
            className={`grid gap-4 mt-6 ${
              isMobile
                ? "grid-cols-1 auto-rows-[160px]"
                : metrics.length === 4
                  ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
                  : metrics.length === 3
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : metrics.length === 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1"
            }`}
          >
            {metrics.map((metric, index) => (
              <div key={index} className="h-full">
                <MCMetricCard
                  title={metric.title}
                  value={metric.value}
                  icon={metric.icon}
                  subtitle={metric.subtitle}
                />
              </div>
            ))}
          </div>
        )}

        {/* Tabla/Contenido: scroll horizontal en móvil cuando la tabla no cabe */}
        <div className="flex-1 min-h-0 mt-6 overflow-y-auto">
          <div className="w-full overflow-x-auto">
            <div className="min-w-full [&_table]:min-w-[640px] [&_table]:sm:min-w-full">
              {tableComponent}
            </div>
          </div>
        </div>

        {/* Paginación fija en la parte inferior */}
        {paginationComponent && (
          <div className="mt-4 pt-4 border-t border-border">
            {paginationComponent}
          </div>
        )}
      </motion.main>
    </div>
  );
}

export default MCTablesLayouts;
