import { useState, useMemo, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { QUERY_KEYS } from "@/lib/react-query/config";
import { getDoctorPatientsStats } from "@/services/api/doctor-stats.service";
import { useDoctorPatients } from "@/features/doctor/hooks/useDoctorPatients";
import MyPatientsTable from "../components/patients/PatientsTable";
import MCTablesLayouts from "@/shared/components/tables/MCTablesLayouts";
import MCPDFButton from "@/shared/components/forms/MCPDFButton";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import MCGeneratePDF from "@/shared/components/MCGeneratePDF";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/shared/ui/pagination";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/shared/ui/empty";
import MCButton from "@/shared/components/forms/MCButton";
import {
  Filter,
  Users,
  ShieldAlert,
  AlertTriangle,
  BarChart2,
  Loader2,
} from "lucide-react";
import FilterMyPatients from "../components/filters/FilterPatients";
import {
  mapPacientesAPIToUI,
  normalizarGenero,
  getUbicacionNombre,
  getEspecialidadNombre,
  construirFiltrosAPI,
  type PacienteUI,
} from "@/features/doctor/utilities/patientMapper";

// ─── Constants ──────────────────────────────────────────────────────────────
const DEFAULT_PAGE_SIZE = 10;
const STALE_TIME = 1000 * 60 * 5; // 5 minutes
const SEARCH_DEBOUNCE_MS = 500;

// Plain object — NOT `as const` so string fields remain `string`, not `"all"` literal.
// This keeps PatientFilters assignable to MyPatientFilters (which uses `string`).
interface PatientFilters {
  gender: string;
  specialty: string;
  location: string;
  hasCondition: string;
  hasAllergy: string;
  lastVisitRange?: [Date, Date];
}

const DEFAULT_FILTERS: PatientFilters = {
  gender: "all",
  specialty: "all",
  location: "all",
  hasCondition: "all",
  hasAllergy: "all",
  lastVisitRange: undefined,
};

// ─── Sub-component: Table Patient row shape ──────────────────────────────────
// Note: `ultimaCita` is intentionally omitted — PatientsTable.Patient expects
// an object shape for that field. We supply the data through the flattened
// aliases (`lastVisit`, `serviceReceived`, `specialty`) that the table also
// accepts via its union type.
interface TablePatient {
  pacienteId: number;
  id: string;
  nombre: string;
  patientName: string;
  apellido: string;
  fotoPerfil: string;
  patientImage: string;
  edad: number;
  age: number;
  genero: "male" | "female" | "other";
  gender: "male" | "female" | "other";
  email: string;
  telefono: string;
  phone: string;
  condiciones: { total: number; lista: never[] };
  conditionsCount: number;
  allergiesCount: number;
  lastVisit: string;
  serviceReceived: string;
  specialty: string;
  ubicacionUltimaCita: { nombre: string };
  location: string;
  totalCitas: number;
  conversationId?: string;
}

// ─── Mappers (pure, defined outside component to avoid re-creation) ──────────
const toTablePatient = (p: PacienteUI): TablePatient => ({
  pacienteId: p.pacienteId,
  id: p.id.toString(),
  nombre: p.nombre,
  patientName: p.nombreCompleto,
  apellido: p.apellido,
  fotoPerfil: p.fotoPerfil,
  patientImage: p.fotoPerfil,
  edad: p.edad,
  age: p.edad,
  genero: normalizarGenero(p.genero),
  gender: normalizarGenero(p.genero),
  email: p.email,
  telefono: p.telefono,
  phone: p.telefono,
  condiciones: { total: p.condicionesTotal, lista: [] },
  conditionsCount: p.condicionesTotal,
  allergiesCount: p.alergias,
  lastVisit: p.ultimaCitaFecha,
  serviceReceived: p.servicioNombre,
  specialty: getEspecialidadNombre(p),
  ubicacionUltimaCita: { nombre: p.ubicacionNombre },
  location: getUbicacionNombre(p),
  totalCitas: p.totalCitas,
  conversationId: p.conversationId,
});

// ─── PDF columns are static — defined once outside the component ─────────────
const PDF_COLUMN_KEYS = [
  "patientName",
  "age",
  "gender",
  "phone",
  "lastVisit",
  "serviceReceived",
  "location",
] as const;

// ─── Memoized sub-components ─────────────────────────────────────────────────
const LoadingState = memo(({ text }: { text: string }) => (
  <div className="flex items-center justify-center w-full h-64">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>{text}</span>
    </div>
  </div>
));
LoadingState.displayName = "LoadingState";

const ErrorState = memo(
  ({
    isMobile,
    title,
    description,
    retryLabel,
  }: {
    isMobile: boolean;
    title: string;
    description: string;
    retryLabel: string;
  }) => (
    <Empty>
      <EmptyHeader>
        <div className="flex flex-col items-center gap-2">
          <span className="flex items-center justify-center gap-2 text-destructive">
            <AlertTriangle className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            <EmptyTitle className={`font-semibold ${isMobile ? "text-lg" : "text-xl"}`}>
              {title}
            </EmptyTitle>
          </span>
          <EmptyDescription
            className={`text-muted-foreground text-center max-w-md mx-auto ${
              isMobile ? "text-sm" : "text-base"
            }`}
          >
            {description}
          </EmptyDescription>
        </div>
      </EmptyHeader>
      <EmptyContent>
        <MCButton
          onClick={() => window.location.reload()}
          className={isMobile ? "px-4 py-2" : "px-6 py-2"}
          size="sm"
        >
          {retryLabel}
        </MCButton>
      </EmptyContent>
    </Empty>
  )
);
ErrorState.displayName = "ErrorState";

const EmptyState = memo(
  ({
    isMobile,
    hasActiveFilters,
    onClearFilters,
    t,
  }: {
    isMobile: boolean;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    t: (key: string) => string;
  }) => (
    <Empty>
      <EmptyHeader>
        <div className="flex flex-col items-center gap-2">
          <span className="flex items-center justify-center gap-2 text-primary">
            {hasActiveFilters ? (
              <Filter className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            ) : (
              <Users className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            )}
            <EmptyTitle className={`font-semibold ${isMobile ? "text-lg" : "text-xl"}`}>
              {hasActiveFilters
                ? t("patients.empty.noResults")
                : t("patients.empty.noPatients")}
            </EmptyTitle>
          </span>
          <EmptyDescription
            className={`text-muted-foreground text-center max-w-md mx-auto ${
              isMobile ? "text-sm" : "text-base"
            }`}
          >
            {hasActiveFilters
              ? t("patients.empty.noResultsDescription")
              : t("patients.empty.noPatientsDescription")}
          </EmptyDescription>
        </div>
      </EmptyHeader>
      {hasActiveFilters && (
        <EmptyContent>
          <MCButton
            variant="outline"
            onClick={onClearFilters}
            className={isMobile ? "px-4 py-2" : "px-6 py-2"}
            size="sm"
          >
            {t("patients.empty.clearFilters")}
          </MCButton>
        </EmptyContent>
      )}
    </Empty>
  )
);
EmptyState.displayName = "EmptyState";

// ─── Page Component ───────────────────────────────────────────────────────────
function PatientsPage() {
  const { t, i18n } = useTranslation("doctor");
  const isMobile = useIsMobile();

  // ─── State ─────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<PatientFilters>({ ...DEFAULT_FILTERS });
  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

  // ─── Derived: active filter count ──────────────────────────────────────
  const activeFiltersCount = useMemo(
    () =>
      Object.entries(filters).filter(([key, value]) =>
        key === "lastVisitRange" ? value !== undefined : value !== "all"
      ).length,
    [filters]
  );

  // ─── Derived: API filters (stable reference when inputs are equal) ──────
  const apiFilters = useMemo(
    () =>
      construirFiltrosAPI(
        filters,
        currentPage,
        DEFAULT_PAGE_SIZE,
        debouncedSearchTerm,
        i18n.language
      ),
    [filters, currentPage, debouncedSearchTerm, i18n.language]
  );

  // ─── Queries ────────────────────────────────────────────────────────────
  const { data: patientsStats, isLoading: statsLoading } = useQuery({
    queryKey: QUERY_KEYS.DOCTOR_STATS_PACIENTES,
    queryFn: getDoctorPatientsStats,
    staleTime: STALE_TIME,
  });

  const {
    data: patientsResponse,
    isLoading: patientsLoading,
    isFetching: patientsFetching,
    isError: patientsError,
    error: patientsErrorDetail,
  } = useDoctorPatients(apiFilters);

  const totalPages = patientsResponse?.paginacion?.totalPaginas || 1;

  // ─── Data transformations ───────────────────────────────────────────────
  // Two-step transform: keep intermediate result lean
  const patientsUI = useMemo(
    () => (patientsResponse?.data ? mapPacientesAPIToUI(patientsResponse.data) : []),
    [patientsResponse?.data]
  );

  const tablePatients = useMemo<TablePatient[]>(
    () => patientsUI.map(toTablePatient),
    [patientsUI]
  );

  // ─── Metrics ────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const base = [
      {
        title: t("patients.metrics.total"),
        value: patientsStats?.totalPacientes ?? "—",
        subtitle: t("patients.metrics.totalSubtitle"),
        icon: <Users />,
      },
      {
        title: t("patients.metrics.withConditions"),
        value: patientsStats?.pacientesConCondicionesActivas ?? "—",
        subtitle: t("patients.metrics.withConditionsSubtitle"),
        icon: <ShieldAlert />,
      },
      {
        title: t("patients.metrics.withAllergies"),
        value: patientsStats?.pacientesConAlergias ?? "—",
        subtitle: t("patients.metrics.withAllergiesSubtitle"),
        icon: <AlertTriangle />,
      },
      {
        title: t("patients.metrics.avgAge"),
        value: patientsStats
          ? `${patientsStats.edadPromedio.toFixed(1)} ${t("patients.metrics.years")}`
          : "—",
        subtitle: t("patients.metrics.avgAgeSubtitle"),
        icon: <BarChart2 />,
      },
    ];
    return base;
  }, [patientsStats, t]);

  // ─── Callbacks ──────────────────────────────────────────────────────────
  const clearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<PatientFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  // ─── Pagination Callbacks ────────────────────────────────────────────────
  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1 && !patientsFetching) setCurrentPage((p) => Math.max(1, p - 1));
  }, [currentPage, patientsFetching]);

  const handlePageClick = useCallback(
    (pageNum: number) => {
      if (!patientsFetching) setCurrentPage(pageNum);
    },
    [patientsFetching]
  );

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages && !patientsFetching)
      setCurrentPage((p) => Math.min(totalPages, p + 1));
  }, [currentPage, totalPages, patientsFetching]);

  // ─── PDF export ──────────────────────────────────────────────────────────
  // Columns built once — keys are static
  const handleExportPDF = useCallback(async () => {
    const columnTitleMap: Record<string, string> = {
      patientName: t("patients.table.patient"),
      age: t("patients.table.age"),
      gender: t("patients.table.gender"),
      phone: t("patients.table.contact"),
      lastVisit: t("patients.table.lastVisit"),
      serviceReceived: t("patients.table.serviceSpecialty"),
      location: t("patients.table.location"),
    };

    await MCGeneratePDF({
      columns: PDF_COLUMN_KEYS.map((key) => ({ title: columnTitleMap[key], key })),
      data: tablePatients.map((p) => ({
        ...p,
        gender: t(`patients.table.${p.gender}`),
      })),
      fileName: "pacientes",
      title: t("patients.title"),
      subtitle: t("patients.subtitle"),
    });
  }, [t, tablePatients]);

  // ─── Render helpers ──────────────────────────────────────────────────────
  const pdfGeneratorComponent = useMemo(
    () => <MCPDFButton onClick={handleExportPDF} />,
    [handleExportPDF]
  );

  const filterComponent = useMemo(
    () => (
      <MCFilterPopover
        activeFiltersCount={activeFiltersCount}
        onClearFilters={clearFilters}
      >
        <FilterMyPatients filters={filters} onFiltersChange={handleFilterChange} />
      </MCFilterPopover>
    ),
    [activeFiltersCount, clearFilters, filters, handleFilterChange]
  );

  const searchComponent = useMemo(
    () => (
      <MCFilterInput
        placeholder={t("patients.search.placeholder")}
        value={searchTerm}
        onChange={handleSearchChange}
      />
    ),
    [t, searchTerm, handleSearchChange]
  );

  const paginationComponent = useMemo(
    () =>
      totalPages > 1 ? (
        <Pagination>
          <PaginationContent className="flex-wrap gap-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                aria-disabled={currentPage === 1 || patientsFetching}
                tabIndex={currentPage === 1 || patientsFetching ? -1 : 0}
                className={
                  currentPage === 1 || patientsFetching
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <PaginationItem key={idx}>
                <PaginationLink
                  isActive={currentPage === idx + 1}
                  onClick={() => handlePageClick(idx + 1)}
                  className={
                    patientsFetching ? "pointer-events-none opacity-50" : "cursor-pointer"
                  }
                >
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
                aria-disabled={currentPage === totalPages || patientsFetching}
                tabIndex={currentPage === totalPages || patientsFetching ? -1 : 0}
                className={
                  currentPage === totalPages || patientsFetching
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null,
    [totalPages, currentPage, patientsFetching, handlePreviousPage, handlePageClick, handleNextPage]
  );

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (statsLoading || patientsLoading) {
    return (
      <MCTablesLayouts
        title={t("patients.title")}
        metrics={metrics}
        filtersInlineWithTitle
        tableComponent={
          <LoadingState text={t("common.loading") || "Cargando..."} />
        }
      />
    );
  }

  // ─── Error ───────────────────────────────────────────────────────────────
  if (patientsError) {
    return (
      <MCTablesLayouts
        title={t("patients.title")}
        filtersInlineWithTitle
        tableComponent={
          <ErrorState
            isMobile={isMobile}
            title={t("patients.error.title")}
            description={
              (patientsErrorDetail as Error)?.message ||
              t("patients.error.description")
            }
            retryLabel={t("patients.error.retry")}
          />
        }
      />
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────
  const tableComponent =
    tablePatients.length === 0 ? (
      <EmptyState
        isMobile={isMobile}
        hasActiveFilters={activeFiltersCount > 0}
        onClearFilters={clearFilters}
        t={t}
      />
    ) : (
      <div className="relative">
        {patientsFetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground font-medium">
                {t("common.loading") || "Cargando..."}
              </p>
            </div>
          </div>
        )}
        <div className={`transition-opacity duration-300 ${patientsFetching ? "opacity-40" : "opacity-100"}`}>
          <MyPatientsTable patients={tablePatients} />
        </div>
      </div>
    );

  return (
    <MCTablesLayouts
      title={t("patients.title")}
      metrics={metrics}
      filtersInlineWithTitle
      tableComponent={tableComponent}
      searchComponent={searchComponent}
      pdfGeneratorComponent={pdfGeneratorComponent}
      filterComponent={filterComponent}
      paginationComponent={paginationComponent}
    />
  );
}

export default PatientsPage;