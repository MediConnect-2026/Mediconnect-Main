import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/utils/formatCurrency";
import { Card } from "@/shared/ui/card";
import { AppointmentsCalendar } from "@/shared/components/calendar/AppointmentsCalendar";
import MCMetricCard from "@/shared/components/MCMetricCard";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useDoctorStatsResumen, useDoctorMostUsedServices, useDoctorProductivity } from "@/lib/hooks/useDoctorStats";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { UsersIcon, CalendarCheckIcon, DollarSignIcon } from "lucide-react";
import DashboardTable from "../components/dashboard/DashboardTable";
import MCTablesLayouts from "@/shared/components/tables/MCTablesLayouts";
import AreaChart from "../components/dashboard/AreaChart";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import PieServices from "../components/dashboard/PieServices";


type DateRangeType = "week" | "month" | "3months" | "year" | "all";

// Mapeo de dateRange a período para el API
const dateRangeToPeriodo = (dateRange: DateRangeType): string => {
  const periodoMap: Record<DateRangeType, string> = {
    week: "semana",
    month: "mes",
    "3months": "3meses",
    year: "año",
    all: "todo",
  };
  return periodoMap[dateRange];
};


function DashboardPage() {
  const isMobile = useIsMobile();
  const { t } = useTranslation("doctor");
  const { i18n } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRangeType>("month");
  const [filters, setFilters] = useState({
    specialty: "",
    location: "",
    availability: "",
    // ... otros filtros
  });

  // Obtener estadísticas del doctor
  const {
    data: statsData,
    isLoading: isStatsLoading,
    error: statsError,
  } = useDoctorStatsResumen();

  // Obtener servicios más utilizados
  const {
    data: serviciosRawData,
    error: serviciosError
  } = useDoctorMostUsedServices(i18n.language);

  // Obtener datos de productividad con período mapeado
  const {
    data: productividadData,
    error: productividadError
  } = useDoctorProductivity(dateRangeToPeriodo(dateRange));

  // Transformar servicios más utilizados al formato esperado por PieServices
  const serviciosMasUtilizados = useMemo(() => {
    return serviciosRawData
      ? serviciosRawData.map((servicio) => ({
        name: servicio.nombre || "Sin nombre",
        value: servicio.totalCitas || 0,
        color: servicio.color || "hsl(var(--chart-1))",
      }))
      : [];
  }, [serviciosRawData, i18n.language]);

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

  // Manejar error en estadísticas
  if (statsError) {
    console.error("Error loading doctor stats:", statsError);
  }

  if (serviciosError) {
    console.error("Error loading most used services:", serviciosError);
  }

  if (productividadError) {
    console.error("Error loading productivity stats:", productividadError);
  }

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
                value={isStatsLoading ? "..." : statsData?.totalPacientes || 0}
                subtitle={t("dashboard.metrics.totalPatientsSubtitle")}
                // percentage={statsData?.porcentajeCambio ? `${statsData.porcentajeCambio}%` : undefined}
                bordered
              />
              <MCMetricCard
                title={t("dashboard.metrics.totalAppointments")}
                icon={<CalendarCheckIcon />}
                value={isStatsLoading ? "..." : statsData?.totalConsultas || 0}
                subtitle={t("dashboard.metrics.totalAppointmentsSubtitle")}
                // percentage={statsData?.porcentajeCambio ? `${statsData.porcentajeCambio}%` : undefined}
                bordered
              />
              <MCMetricCard
                title={t("dashboard.metrics.totalEarned")}
                icon={<DollarSignIcon />}
                value={isStatsLoading ? "..." : formatCurrency(statsData?.totalDineroGanado)}
                subtitle={t("dashboard.metrics.totalEarnedSubtitle")}
                // percentage={statsData?.porcentajeCambio ? `${statsData.porcentajeCambio}%` : undefined}
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
              <AreaChart
                data={productividadData}
                dateRange={dateRange}
                showFooter={false}
              />
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
