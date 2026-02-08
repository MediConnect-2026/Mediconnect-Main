import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/shared/ui/card";
import { AppointmentsCalendar } from "@/shared/components/calendar/AppointmentsCalendar";
import MCMetricCard from "@/shared/components/MCMetricCard";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { UsersIcon, CalendarCheckIcon, DollarSignIcon } from "lucide-react";
import DashboardTable from "../components/dashboard/DashboardTable";
import MCTablesLayouts from "@/shared/components/tables/MCTablesLayouts";
import AreaChart from "../components/dashboard/AreaChart";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import PieServices from "../components/dashboard/PieServices";
// Data de ejemplo para servicios más utilizados
const serviciosMasUtilizados = [
  { name: "Consulta médica", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Sesión física", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Seguimiento", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Rehabilitación", value: 10, color: "hsl(var(--chart-4))" },
  { name: "Presión arterial", value: 6, color: "hsl(var(--chart-5))" },
  { name: "Ejercicios guiados", value: 4, color: "hsl(var(--chart-6))" },
];

function DashboardPage() {
  const isMobile = useIsMobile();
  const { t } = useTranslation("patient");

  return (
    <motion.main {...fadeInUp} className="min-h-screen">
      <div className="flex flex-col gap-4">
        <main className="grid grid-cols-[7fr_3fr] h-[800px] gap-4">
          <div id="cards" className="flex flex-col gap-4 h-full">
            <div className="flex gap-4 flex-shrink-0">
              <MCMetricCard
                title="Total de Pacientes"
                icon={<UsersIcon />}
                value={412}
                subtitle="Cantidad total de pacientes atendidos este mes."
                percentage="12%"
                bordered
              />
              <MCMetricCard
                title="Total de Consultas"
                icon={<CalendarCheckIcon />}
                value={285}
                subtitle="Cantidad total de consultas realizadas este mes."
                percentage="8%"
                bordered
              />
              <MCMetricCard
                title="Total Ganado"
                icon={<DollarSignIcon />}
                value="RD$ 87,500"
                subtitle="Monto total generado durante este mes."
                percentage="15%"
                bordered
              />
            </div>
            <Card className="rounded-2xl md:rounded-4xl flex-1 min-h-0 overflow-hidden">
              <MCTablesLayouts
                isDashboard
                title="Gestion de Citas"
                tableComponent={<DashboardTable />}
              />
            </Card>
          </div>
          <Card className="rounded-2xl md:rounded-4xl h-full overflow-hidden">
            <AppointmentsCalendar orientation="vertical" />
          </Card>
        </main>
        <section className="grid grid-cols-[7fr_3fr] gap-4">
          <Card className="rounded-2xl md:rounded-4xl min-h-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 px-4">
              <h2 className="text-2xl font-semibold">
                Análisis de productividad
              </h2>
              <div>
                <MCFilterPopover
                  activeFiltersCount={0}
                  onClearFilters={() => {}}
                  compact
                >
                  <MCFilterSelect
                    name="dateRange"
                    options={[
                      { label: "Semana", value: "week" },
                      { label: "Mes", value: "month" },
                      { label: "3 Meses", value: "3months" },
                      { label: "Año", value: "year" },
                      { label: "Todo", value: "all" },
                    ]}
                    value="month"
                    onChange={() => {
                      /* lógica para cambiar filtro */
                      4;
                    }}
                  />
                </MCFilterPopover>
              </div>
            </div>
            <div className="h-[325px] w-full bg-red">
              <AreaChart />
            </div>
          </Card>
          <Card className="rounded-2xl md:rounded-4xl min-h-0 h-full overflow-hidden flex">
            <PieServices
              data={serviciosMasUtilizados}
              title="Servicios más utilizados"
              description="Lista de los servicios más utilizados por los pacientes este mes."
            />
          </Card>
        </section>
      </div>
    </motion.main>
  );
}

export default DashboardPage;
