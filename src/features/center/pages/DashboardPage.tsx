import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/shared/ui/card";
import MCMetricCard from "@/shared/components/MCMetricCard";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import {
  AlertCircle,
  CalendarCheckIcon,
  Filter,
  Loader2,
  StarIcon,
  StethoscopeIcon,
  UserX,
  UsersIcon,
} from "lucide-react";
import MCTablesLayouts from "@/shared/components/tables/MCTablesLayouts";
import AreaChart from "../components/dashboard/AreaChart";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import PieServices from "../components/dashboard/PieServices";
import StaffTable from "../components/staff/StaffTable";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import MCPDFButton from "@/shared/components/forms/MCPDFButton";
import MCGeneratePDF from "@/shared/components/MCGeneratePDF";
import {
  useCenterSpecialtiesDistribution,
  useCenterStatsResumen,
} from "@/lib/hooks/useCenterStats";
import { Skeleton } from "@/shared/ui/skeleton";
import FilterStaff from "@/features/center/components/filters/FilterStaff";
import useCenterStaff from "@/features/center/hooks/useCenterStaff";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/ui/empty";
import MCButton from "@/shared/components/forms/MCButton";

type DateRangeType = "week" | "month" | "3months" | "year" | "all";

type StaffFilters = {
  specialty: string | string[];
  rating: string | string[];
  joinDate: { from: Date | null; to: Date | null };
};

function DashboardPage() {
  const isMobile = useIsMobile();
  const { t, i18n } = useTranslation("center");
  const [dateRange, setDateRange] = useState<DateRangeType>("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [staffFilters, setStaffFilters] = useState<StaffFilters>({
    specialty: "",
    rating: "",
    joinDate: { from: null as Date | null, to: null as Date | null },
  });
  const {
    data: staffList = [],
    isLoading: isStaffLoading,
    isError: isStaffError,
    refetch: refetchStaff,
    error: staffError,
  } = useCenterStaff();
  const {
    data: specialtiesDistribution = [],
    isLoading: isSpecialtiesDistributionLoading,
    isError: isSpecialtiesDistributionError,
  } = useCenterSpecialtiesDistribution();
  const [filters, setFilters] = useState({
    specialty: "",
    location: "",
    availability: "",
  });

  const specialtiesColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
  ];

  const especialidadesData = useMemo(
    () =>
      specialtiesDistribution.map((item, index) => ({
        name: item.nombre,
        value: item.totalMedicos,
        color: specialtiesColors[index % specialtiesColors.length],
      })),
    [specialtiesDistribution],
  );

  const resetFilters = () => {
    setFilters({ specialty: "", location: "", availability: "" });
  };

  const resetStaffFilters = () => {
    setStaffFilters({
      specialty: "",
      rating: "",
      joinDate: { from: null, to: null },
    });
    setSearchTerm("");
  };

  const toArray = (val: string | string[]): string[] => {
    if (!val || (Array.isArray(val) && val.length === 0)) return [];
    return Array.isArray(val) ? val : [val];
  };

  const filteredStaff = useMemo(() => {
    const specialty = toArray(staffFilters.specialty);
    const rating = toArray(staffFilters.rating);

    return staffList
      .filter(
        (staff) =>
          staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .filter((staff) => {
        if (specialty.length > 0 && !specialty.includes("all")) {
          const matchesBySpecialtyId = staff.specialtyIds.some((specialtyId) =>
            specialty.includes(specialtyId),
          );
          const matchesBySpecialtyName = specialty.includes(staff.specialty);

          if (!matchesBySpecialtyId && !matchesBySpecialtyName) return false;
        }

        if (
          rating.length > 0 &&
          !rating.includes("0") &&
          !rating.includes("all")
        ) {
          const minRating = Math.min(...rating.map((value) => parseFloat(value)));
          if (staff.rating < minRating) return false;
        }

        if (staffFilters.joinDate.from) {
          const staffDate = new Date(staff.joinDate);
          const fromDate = new Date(staffFilters.joinDate.from);
          fromDate.setHours(0, 0, 0, 0);
          if (staffDate < fromDate) return false;
        }

        if (staffFilters.joinDate.to) {
          const staffDate = new Date(staff.joinDate);
          const toDate = new Date(staffFilters.joinDate.to);
          toDate.setHours(23, 59, 59, 999);
          if (staffDate > toDate) return false;
        }

        return true;
      });
  }, [searchTerm, staffFilters, staffList]);

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      (value) => value !== "" && value !== null && value !== undefined,
    ).length;
  };

  const getActiveStaffFiltersCount = () => {
    let count = 0;
    const s = toArray(staffFilters.specialty);
    const r = toArray(staffFilters.rating);

    if (s.length > 0 && !s.includes("all")) count++;
    if (r.length > 0 && !r.includes("all") && !r.includes("0")) count++;
    if (staffFilters.joinDate.from || staffFilters.joinDate.to) count++;
    if (searchTerm.trim() !== "") count++;
    return count;
  };

  const searchComponent = (
    <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
      <MCFilterInput
        placeholder={t("staff.searchPlaceholder")}
        value={searchTerm}
        onChange={(value) => setSearchTerm(value)}
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
          data: filteredStaff.map((staff) => ({
            doctor: staff.name,
            especialidad: staff.specialty,
            fechaConexion: new Date(staff.joinDate).toLocaleDateString(
              i18n.language === "en" ? "en-US" : "es-DO",
              { dateStyle: "medium" },
            ),
            citasTotales: staff.totalAppointments,
            calificacion: staff.rating,
            estado: t(`staff.status.${staff.status}`),
          })),
          fileName: t("staff.pdf.fileName"),
          title: t("staff.pdf.title"),
          subtitle: t("staff.pdf.subtitle"),
        });
      }}
    />
  );

  const hasActiveStaffFilters = getActiveStaffFiltersCount() > 0;

  const staffTableComponent = isStaffLoading ? (
    <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>{t("staff.loading")}</span>
    </div>
  ) : isStaffError ? (
    <Empty>
      <EmptyHeader>
        <div className="flex flex-col items-center gap-2 px-4">
          <span className="flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            <EmptyTitle className={`font-semibold ${isMobile ? "text-lg" : "text-xl"}`}>
              {t("staff.error.title")}
            </EmptyTitle>
          </span>
          <EmptyDescription
            className={`text-muted-foreground text-center max-w-md mx-auto ${
              isMobile ? "text-sm" : "text-base"
            }`}
          >
            {staffError?.message || t("staff.error.description")}
          </EmptyDescription>
        </div>
      </EmptyHeader>
      <EmptyContent>
        <MCButton variant="outline" onClick={() => refetchStaff()} size="sm">
          {t("staff.error.retry")}
        </MCButton>
      </EmptyContent>
    </Empty>
  ) : filteredStaff.length === 0 ? (
    <Empty>
      <EmptyHeader>
        <div className="flex flex-col items-center gap-2 px-4">
          <span className="flex items-center justify-center gap-2 text-primary">
            {hasActiveStaffFilters ? (
              <Filter className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            ) : (
              <UserX className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            )}
            <EmptyTitle
              className={`font-semibold ${isMobile ? "text-lg" : "text-xl"}`}
            >
              {hasActiveStaffFilters
                ? t("staff.empty.noResults")
                : t("staff.empty.noStaff")}
            </EmptyTitle>
          </span>
          <EmptyDescription
            className={`text-muted-foreground text-center max-w-md mx-auto ${
              isMobile ? "text-sm" : "text-base"
            }`}
          >
            {hasActiveStaffFilters
              ? t("staff.empty.noResultsDescription")
              : t("staff.empty.noStaffDescription")}
          </EmptyDescription>
        </div>
      </EmptyHeader>
      <EmptyContent>
        {hasActiveStaffFilters && (
          <MCButton variant="outline" onClick={resetStaffFilters} size="sm">
            {t("staff.clearFilters")}
          </MCButton>
        )}
      </EmptyContent>
    </Empty>
  ) : (
    <StaffTable staffData={filteredStaff} />
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
              description={
                isSpecialtiesDistributionLoading
                  ? t("dashboard.specialties.loading")
                  : isSpecialtiesDistributionError
                    ? t("dashboard.specialties.error")
                    : especialidadesData.length === 0
                      ? t("dashboard.specialties.noData")
                      : undefined
              }
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
            tableComponent={staffTableComponent}
          />
        </Card>
      </div>
    </motion.main>
  );
}

export default DashboardPage;
