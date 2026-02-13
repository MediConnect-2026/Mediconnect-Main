import { useState } from "react";
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

type DateRangeType = "week" | "month" | "3months" | "year" | "all";

function DashboardPage() {
  const isMobile = useIsMobile();
  const { t } = useTranslation("doctor");
  const [dateRange, setDateRange] = useState<DateRangeType>("month");
  const [filters, setFilters] = useState({
    specialty: "",
    location: "",
    availability: "",
    // ... otros filtros
  });

  const resetFilters = () => {
    setFilters({
      specialty: "",
      location: "",
      availability: "",
      // ... resetear todos los filtros a sus valores iniciales
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      (value) => value !== "" && value !== null && value !== undefined,
    ).length;
  };

  return (
    <motion.main {...fadeInUp} className="min-h-screen">
      <div className="flex flex-col gap-4">
        {/* Main Dashboard Section */}
        <main className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-4 h-auto lg:h-[800px]">
          <div id="cards" className="flex flex-col gap-4 h-full">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-shrink-0">
              <MCMetricCard
                title={t("dashboard.metrics.totalPatients")}
                icon={<UsersIcon />}
                value={412}
                subtitle={t("dashboard.metrics.totalPatientsSubtitle")}
                percentage="12%"
                bordered
              />
              <MCMetricCard
                title={t("dashboard.metrics.totalAppointments")}
                icon={<CalendarCheckIcon />}
                value={285}
                subtitle={t("dashboard.metrics.totalAppointmentsSubtitle")}
                percentage="8%"
                bordered
              />
              <MCMetricCard
                title={t("dashboard.metrics.totalEarned")}
                icon={<DollarSignIcon />}
                value="RD$ 87,500"
                subtitle={t("dashboard.metrics.totalEarnedSubtitle")}
                percentage="15%"
                bordered
              />
            </div>

            {/* Appointments Table */}
            <Card className="rounded-2xl md:rounded-4xl flex-1 min-h-[400px] lg:min-h-0 overflow-hidden">
              <MCTablesLayouts
                titleSize="text-2xl"
                isDashboard
                title={t("dashboard.appointmentsManagement")}
                tableComponent={<DashboardTable />}
              />
            </Card>
          </div>

          {/* Calendar */}
          <Card
            className={`rounded-2xl md:rounded-4xl ${!isMobile ? "h-[500px]" : ""} lg:h-full overflow-hidden`}
          >
            <AppointmentsCalendar orientation={"vertical"} />
          </Card>
        </main>

        {/* Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-4">
          {/* Productivity Chart */}
          <Card className="rounded-2xl md:rounded-4xl min-h-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 px-4">
              <h2 className="text-xl sm:text-2xl font-semibold">
                {t("dashboard.productivityAnalysis")}
              </h2>
              <div className="w-full sm:w-auto">
                <MCFilterPopover
                  activeFiltersCount={getActiveFiltersCount()}
                  onClearFilters={resetFilters}
                  compact
                >
                  <MCFilterSelect
                    name="dateRange"
                    options={[
                      { label: t("dashboard.filters.week"), value: "week" },
                      { label: t("dashboard.filters.month"), value: "month" },
                      {
                        label: t("dashboard.filters.3months"),
                        value: "3months",
                      },
                      { label: t("dashboard.filters.year"), value: "year" },
                      { label: t("dashboard.filters.all"), value: "all" },
                    ]}
                    value={dateRange}
                    onChange={(value) => setDateRange(value as DateRangeType)}
                  />
                </MCFilterPopover>
              </div>
            </div>
            <div className="h-[250px] sm:h-[325px] w-full">
              <AreaChart dateRange={dateRange} />
            </div>
          </Card>

          {/* Services Pie Chart */}
          <Card className="rounded-2xl md:rounded-4xl min-h-0 h-[400px] lg:h-full overflow-hidden flex">
            <PieServices
              data={serviciosMasUtilizados}
              title={t("dashboard.mostUsedServices")}
              description={t("dashboard.mostUsedServicesDescription")}
            />
          </Card>
        </section>
      </div>
    </motion.main>
  );
}

export default DashboardPage;
