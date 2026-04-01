import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/shared/ui/card";
import MCMetricCard from "@/shared/components/MCMetricCard";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import {
  UsersIcon,
  CalendarCheckIcon,
  StarIcon,
  StethoscopeIcon,
} from "lucide-react";
import MCTablesLayouts from "@/shared/components/tables/MCTablesLayouts";
import AreaChart from "../components/dashboard/AreaChart";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import PieServices from "../components/dashboard/PieServices";
import StaffTable from "../components/dashboard/StaffTable";
import FilterStaff from "../components/filters/FilterStaff";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import MCPDFButton from "@/shared/components/forms/MCPDFButton";
import MCGeneratePDF from "@/shared/components/MCGeneratePDF";
import { useCenterStatsResumen } from '@/lib/hooks/useCenterStats';
import { Skeleton } from '@/shared/ui/skeleton';

type DateRangeType = "week" | "month" | "3months" | "year" | "all";

function DashboardPage() {
  const isMobile = useIsMobile();
  const { t } = useTranslation("center");
  const [dateRange, setDateRange] = useState<DateRangeType>("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [staffFilters, setStaffFilters] = useState({
    specialty: "",
    rating: "",
    joinDate: { from: null as Date | null, to: null as Date | null },
  });
  const [filters, setFilters] = useState({
    specialty: "",
    location: "",
    availability: "",
  });

  const especialidadesData = [
    {
      name: t("staff.specialties.cardiology"),
      value: 85,
      color: "hsl(var(--chart-1))",
    },
    {
      name: t("staff.specialties.pediatrics"),
      value: 72,
      color: "hsl(var(--chart-2))",
    },
    {
      name: t("staff.specialties.dermatology"),
      value: 58,
      color: "hsl(var(--chart-3))",
    },
    {
      name: t("staff.specialties.neurology"),
      value: 45,
      color: "hsl(var(--chart-4))",
    },
    {
      name: t("staff.specialties.internalMedicine"),
      value: 68,
      color: "hsl(var(--chart-5))",
    },
    {
      name: t("dashboard.specialties.others"),
      value: 84,
      color: "hsl(var(--chart-6))",
    },
  ];

  const resetFilters = () => {
    setFilters({ specialty: "", location: "", availability: "" });
  };

  const resetStaffFilters = () => {
    setStaffFilters({
      specialty: "",
      rating: "",
      joinDate: { from: null, to: null },
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      (value) => value !== "" && value !== null && value !== undefined,
    ).length;
  };

  const getActiveStaffFiltersCount = () => {
    let count = 0;
    if (staffFilters.specialty && staffFilters.specialty !== "") count++;
    if (staffFilters.rating && staffFilters.rating !== "") count++;
    if (staffFilters.joinDate.from || staffFilters.joinDate.to) count++;
    return count;
  };

  const searchComponent = (
    <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
      <MCFilterInput
        placeholder={t("staff.searchPlaceholder")}
        value={searchTerm}
        onChange={setSearchTerm}
      />
    </div>
  );

  const filterComponent = (
    <FilterStaff
      filters={staffFilters}
      onFiltersChange={setStaffFilters}
      onClearFilters={resetStaffFilters}
      activeFiltersCount={getActiveStaffFiltersCount()}
    />
  );

  const pdfGeneratorComponent = (
    <MCPDFButton
      onClick={async () => {
        const medicalStaff = [
          {
            doctor: "Dra. María González",
            especialidad: t("staff.specialties.dermatology"),
            fechaConexion: "23 de oct de 2025",
            citasTotales: 130,
            calificacion: 4.8,
            estado: t("staff.status.active"),
          },
          {
            doctor: "Dr. Carlos Rodríguez",
            especialidad: t("staff.specialties.cardiology"),
            fechaConexion: "15 de sep de 2025",
            citasTotales: 98,
            calificacion: 4.9,
            estado: t("staff.status.active"),
          },
          {
            doctor: "Dra. Ana Martínez",
            especialidad: t("staff.specialties.pediatrics"),
            fechaConexion: "10 de ago de 2025",
            citasTotales: 156,
            calificacion: 4.7,
            estado: t("staff.status.inactive"),
          },
        ];

        await MCGeneratePDF({
          columns: [
            { title: t("staff.pdf.columnDoctor"), key: "doctor" },
            { title: t("staff.pdf.columnSpecialty"), key: "especialidad" },
            {
              title: t("staff.pdf.columnConnectionDate"),
              key: "fechaConexion",
            },
            { title: t("staff.pdf.columnAppointments"), key: "citasTotales" },
            { title: t("staff.pdf.columnRating"), key: "calificacion" },
            { title: t("staff.pdf.columnStatus"), key: "estado" },
          ],
          data: medicalStaff,
          fileName: t("staff.pdf.fileName"),
          title: t("staff.pdf.title"),
          subtitle: t("staff.pdf.subtitle"),
        });
      }}
    />
  );

  return (
    <motion.main {...fadeInUp} className="min-h-screen">
      <div className="flex flex-col gap-4">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
          {(() => {
            // Hook to fetch center stats
            const { data: centerStats, isLoading, isError } = useCenterStatsResumen();

            const metrics = useMemo(() => ({
              totalDoctors: centerStats?.totalMedicos ?? 0,
              specialties: centerStats?.totalEspecialidades ?? 0,
              appointmentsWeek: centerStats?.citasSemanaActual ?? 0,
              avgRating: centerStats?.valoracionPromedio ?? null,
            }), [centerStats]);

            // Loading skeletons
            if (isLoading) {
              return (
                <>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`relative flex flex-col justify-start w-full rounded-4xl bg-background shadow-sm p-6 border border-primary/10`}
                    >
                      <div className="flex items-start gap-4 mb-6">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-1/2 mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>

                      <Skeleton className="h-12 w-1/3" />
                    </div>
                  ))}
                </>
              );
            }

            // Error state: render cards with placeholders and small error hint
            if (isError) {
              return (
                <>
                  <MCMetricCard
                    title={t("dashboard.metrics.totalDoctors")}
                    icon={<StethoscopeIcon />}
                    value={'-'}
                    subtitle={t("dashboard.metrics.totalDoctorsSubtitle")}
                    percentage=""
                    bordered
                  />
                  <MCMetricCard
                    title={t("dashboard.metrics.specialtiesCovered")}
                    icon={<UsersIcon />}
                    value={'-'}
                    subtitle={t("dashboard.metrics.specialtiesCoveredSubtitle")}
                    percentage=""
                    bordered
                  />
                  <MCMetricCard
                    title={t("dashboard.metrics.appointmentsThisWeek")}
                    icon={<CalendarCheckIcon />}
                    value={'-'}
                    subtitle={t("dashboard.metrics.appointmentsThisWeekSubtitle")}
                    percentage=""
                    bordered
                  />
                  <MCMetricCard
                    title={t("dashboard.metrics.averageRating")}
                    icon={<StarIcon />}
                    value={'-'}
                    subtitle={t("dashboard.metrics.averageRatingSubtitle")}
                    percentage=""
                    bordered
                  />
                </>
              );
            }

            // Success state
            return (
              <>
                <MCMetricCard
                  title={t("dashboard.metrics.totalDoctors")}
                  icon={<StethoscopeIcon />}
                  value={metrics.totalDoctors}
                  subtitle={t("dashboard.metrics.totalDoctorsSubtitle")}
                  percentage=""
                  bordered
                />
                <MCMetricCard
                  title={t("dashboard.metrics.specialtiesCovered")}
                  icon={<UsersIcon />}
                  value={metrics.specialties}
                  subtitle={t("dashboard.metrics.specialtiesCoveredSubtitle")}
                  percentage=""
                  bordered
                />
                <MCMetricCard
                  title={t("dashboard.metrics.appointmentsThisWeek")}
                  icon={<CalendarCheckIcon />}
                  value={metrics.appointmentsWeek}
                  subtitle={t("dashboard.metrics.appointmentsThisWeekSubtitle")}
                  percentage=""
                  bordered
                />
                <MCMetricCard
                  title={t("dashboard.metrics.averageRating")}
                  icon={<StarIcon />}
                  value={metrics.avgRating !== null ? metrics.avgRating.toFixed(1) : 0}
                  subtitle={t("dashboard.metrics.averageRatingSubtitle")}
                  percentage=""
                  bordered
                />
              </>
            );
          })()}
        </div>

        {/* Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-4">
          {/* Growth Chart */}
          <Card className="rounded-2xl md:rounded-4xl min-h-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 px-4">
              <h2 className="text-xl sm:text-2xl font-semibold">
                {t("dashboard.chart.affiliatedDoctorsGrowth")}
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
                      { label: t("dashboard.chart.week"), value: "week" },
                      { label: t("dashboard.chart.month"), value: "month" },
                      {
                        label: t("dashboard.chart.threeMonths"),
                        value: "3months",
                      },
                      { label: t("dashboard.chart.year"), value: "year" },
                      { label: t("dashboard.chart.all"), value: "all" },
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

          {/* Specialties Pie Chart */}
          <Card className="rounded-2xl md:rounded-4xl min-h-0 h-[400px] lg:h-full overflow-hidden flex">
            <PieServices
              data={especialidadesData}
              title={t("dashboard.specialties.distributionTitle")}
            />
          </Card>
        </section>

        {/* Staff Table */}
        <Card className="rounded-2xl md:rounded-4xl min-h-[400px] overflow-hidden">
          <MCTablesLayouts
            titleSize="text-2xl"
            isDashboard
            title={t("dashboard.staffTable.title")}
            searchComponent={searchComponent}
            filterComponent={filterComponent}
            pdfGeneratorComponent={pdfGeneratorComponent}
            tableComponent={
              <StaffTable
                searchTerm={searchTerm}
                filters={staffFilters}
                onClearFilters={resetStaffFilters}
                onClearSearch={() => setSearchTerm("")}
              />
            }
          />
        </Card>
      </div>
    </motion.main>
  );
}

export default DashboardPage;
