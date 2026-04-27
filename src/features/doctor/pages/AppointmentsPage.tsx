import {
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useDoctorAppointments } from "@/lib/hooks/useDoctorAppointments";
import { useDoctorCitasStats } from "@/lib/hooks/useDoctorStats";
import { useQueryClient } from "@tanstack/react-query";
import MyAppointmentTable from "../components/appointments/MyAppointmentTable";
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
  CalendarX,
  Clock,
  XCircle,
  CheckCircle,
  Calendar,
  AlertCircle,
} from "lucide-react";
import FilterMyAppointments from "../components/filters/FilterMyAppoinments";
import type { CitasFilters, CitaDetalle } from "@/types/AppointmentTypes";

// Import the Appointment type
import type { Appointment } from "../components/appointments/MyAppointmentTable";
import { format, addDays } from "date-fns";
import {
  mapCitaEstadoToAppointmentStatus,
  isVirtualModality,
} from "@/utils/appointmentMapper";
import { QUERY_KEYS } from "@/lib/react-query/config";

type AppointmentsFiltersState = {
  status: string;
  appointmentType: string;
  specialty: string;
  service: string;
  dateRange: [Date, Date] | undefined;
};

type PageToken = number | "ellipsis";

const STATUS_FILTER_VALUES = {
  all: "appointments.filters.values.status.all",
  scheduled: "appointments.filters.values.status.scheduled",
  inProgress: "appointments.filters.values.status.inProgress",
  completed: "appointments.filters.values.status.completed",
  cancelled: "appointments.filters.values.status.cancelled",
} as const;

const APPOINTMENT_TYPE_FILTER_VALUES = {
  all: "appointments.filters.values.type.all",
  virtual: "appointments.filters.values.type.virtual",
  inPerson: "appointments.filters.values.type.inPerson",
} as const;

const STATUS_FILTER_CANONICAL_VALUES: Set<string> = new Set(
  Object.values(STATUS_FILTER_VALUES)
);
const APPOINTMENT_TYPE_FILTER_CANONICAL_VALUES: Set<string> = new Set(
  Object.values(APPOINTMENT_TYPE_FILTER_VALUES)
);

const normalizeFilterAliasKey = (value: string): string =>
  value.trim().toLowerCase().replace(/[\s_-]+/g, "_");

const STATUS_FILTER_ALIASES: Record<string, string> = {
  all: STATUS_FILTER_VALUES.all,
  todos: STATUS_FILTER_VALUES.all,
  scheduled: STATUS_FILTER_VALUES.scheduled,
  programada: STATUS_FILTER_VALUES.scheduled,
  "in progress": STATUS_FILTER_VALUES.inProgress,
  "en progreso": STATUS_FILTER_VALUES.inProgress,
  in_progress: STATUS_FILTER_VALUES.inProgress,
  en_progreso: STATUS_FILTER_VALUES.inProgress,
  completed: STATUS_FILTER_VALUES.completed,
  completada: STATUS_FILTER_VALUES.completed,
  cancelled: STATUS_FILTER_VALUES.cancelled,
  cancelada: STATUS_FILTER_VALUES.cancelled,
};

const APPOINTMENT_TYPE_FILTER_ALIASES: Record<string, string> = {
  all: APPOINTMENT_TYPE_FILTER_VALUES.all,
  todos: APPOINTMENT_TYPE_FILTER_VALUES.all,
  virtual: APPOINTMENT_TYPE_FILTER_VALUES.virtual,
  teleconsulta: APPOINTMENT_TYPE_FILTER_VALUES.virtual,
  "in person": APPOINTMENT_TYPE_FILTER_VALUES.inPerson,
  in_person: APPOINTMENT_TYPE_FILTER_VALUES.inPerson,
  presencial: APPOINTMENT_TYPE_FILTER_VALUES.inPerson,
};

const normalizeStatusFilterValue = (value: string): string => {
  if (STATUS_FILTER_CANONICAL_VALUES.has(value)) return value;
  const normalizedKey = normalizeFilterAliasKey(value);
  return STATUS_FILTER_ALIASES[normalizedKey] ?? STATUS_FILTER_VALUES.all;
};

const normalizeAppointmentTypeFilterValue = (value: string): string => {
  if (APPOINTMENT_TYPE_FILTER_CANONICAL_VALUES.has(value)) return value;
  const normalizedKey = normalizeFilterAliasKey(value);
  return APPOINTMENT_TYPE_FILTER_ALIASES[normalizedKey] ?? APPOINTMENT_TYPE_FILTER_VALUES.all;
};

const normalizeLanguageCode = (language: string): "es" | "en" =>
  language.toLowerCase().startsWith("en") ? "en" : "es";

/**
 * Mapea una cita del API (CitaDetalle) al formato de UI (Appointment)
 */
const mapCitaDetalleToAppointment = (
  cita: CitaDetalle,
  locale: string,
): Appointment => {
  const parseBackendDateAsLocal = (rawDate: string): Date => {
    // Evita desfases por zona horaria cuando el backend devuelve YYYY-MM-DD.
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      const [year, month, day] = rawDate.split("-").map(Number);
      return new Date(year, month - 1, day, 12, 0, 0, 0);
    }

    const parsed = new Date(rawDate);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const fechaInicio = parseBackendDateAsLocal(cita.fechaInicio);

  // Formatear fecha como DD/MM/YYYY
  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fechaInicio);

  // Formatear hora como HH:MM
  const horaInicio = cita.horaInicio.substring(0, 5);
  const horaFin = cita.horaFin.substring(0, 5);
  const formattedTime = `${horaInicio} – ${horaFin}`;

  const isVirtual = isVirtualModality(cita.modalidad);

  return {
    id: cita.id.toString(),
    doctorId: cita.doctorId?.toString() || "",
    patientName: `${cita.paciente.nombre} ${cita.paciente.apellido}`,
    patientImage: cita.paciente.usuario.fotoPerfil || undefined,
    service: cita.servicio.nombre,
    specialty: cita.servicio.especialidad.nombre,
    specialtyId: cita.servicio.especialidad.id.toString(),
    date: formattedDate,
    time: formattedTime,
    phone: cita.paciente.usuario.email || "N/A",
    email: cita.paciente.usuario.email || "N/A",
    appointmentType: isVirtual ? "virtual" : "in_person",
    location: isVirtual ? "Virtual" : cita.servicio.ubicaciones.direccionCompleta,
    status: mapCitaEstadoToAppointmentStatus(cita.estado),
  };
};


function AppointmentsPage() {
  const { t, i18n } = useTranslation("doctor");
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const currentLanguage = normalizeLanguageCode(i18n.language);
  const sourceLanguage = currentLanguage === "es" ? "en" : "es";

  useEffect(() => {
    // Reset pagination and force a fresh fetch when language changes.
    setCurrentPage(1);
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CITAS() });
  }, [currentLanguage, queryClient]);

  // Estados UI
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 10;

  const [filters, setFilters] = useState<AppointmentsFiltersState>({
    status: STATUS_FILTER_VALUES.all,
    appointmentType: APPOINTMENT_TYPE_FILTER_VALUES.all,
    specialty: "all",
    service: "all",
    dateRange: undefined,
  });

  const normalizedStatusFilter = useMemo(
    () => normalizeStatusFilterValue(filters.status),
    [filters.status]
  );

  const normalizedAppointmentTypeFilter = useMemo(
    () => normalizeAppointmentTypeFilterValue(filters.appointmentType),
    [filters.appointmentType]
  );

  // Convertir filtros UI a filtros API
  const apiFilters = useMemo<CitasFilters>(() => {
    const converted: CitasFilters = {
      pagina: currentPage,
      limite: PAGE_SIZE,
      source: sourceLanguage,
      target: currentLanguage,
      translate_fields:
        "nombre,modalidad,estado,servicio.nombre,servicio.especialidad.nombre,servicio.ubicaciones.direccionCompleta,servicio.descripcion",
    };

    // Mapear estado
    if (normalizedStatusFilter !== STATUS_FILTER_VALUES.all) { 
      const statusMap: Record<string, CitasFilters["estado"]> = {
        [STATUS_FILTER_VALUES.scheduled]: "Programada",
        [STATUS_FILTER_VALUES.inProgress]: "En Progreso",
        [STATUS_FILTER_VALUES.completed]: "Completada",
        [STATUS_FILTER_VALUES.cancelled]: "Cancelada",
      };
      converted.estado = statusMap[normalizedStatusFilter];
    }

    // Mapear rango de fechas
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;

      // Reconstruir la fecha en local noon para evitar desfase UTC
      const toLocalNoon = (date: Date): Date => {
        return new Date(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          12,
          0,
          0,
          0
        );
      };

      const localStart = toLocalNoon(startDate);
      const localEnd = toLocalNoon(endDate);

      converted.fechaDesde = format(addDays(localStart, 1), "MM/dd/yyyy");
      converted.fechaHasta = format(addDays(localEnd, 1), "MM/dd/yyyy");
    }

    return converted;
  }, [normalizedStatusFilter, filters.dateRange, currentPage, sourceLanguage, currentLanguage]);

  // Petición al API
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isPlaceholderData,
    error,
  } = useDoctorAppointments(apiFilters);
  const { data: doctorCitasStats } = useDoctorCitasStats();

  // Consistent with DashboardTable: only true during page transition with previous data shown.
  const isChangingPage = isFetching && isPlaceholderData;

  // Mapear respuesta del API
  const allAppointments = useMemo(() => {
    if (!apiResponse?.data) return [];
    const data = Array.isArray(apiResponse.data) ? apiResponse.data : [apiResponse.data];
    const activeLocale = currentLanguage === "en" ? "en-US" : "es-DO";
    return data.map((cita) => mapCitaDetalleToAppointment(cita, activeLocale));
  }, [apiResponse?.data, currentLanguage]);

  // Extraer opciones dinámicamente de los datos cargados (client-side)
  const serviceOptions = useMemo(() => {
    const services = new Set<string>();
    allAppointments.forEach((apt) => {
      services.add(apt.service);
    });
    return Array.from(services).sort();
  }, [allAppointments]);

  // Filtrar por búsqueda y filtros client-side (cliente-side)
  const filteredAppointments = useMemo(() => {
    let result = allAppointments;

    // Filtrar por rango de especialidades (client-side)
    if (filters.specialty !== "all") {
      result = result.filter((apt) => apt.specialtyId === filters.specialty);
    }

    // Filtrar por servicio (client-side)
    if (filters.service !== "all") {
      result = result.filter((apt) => apt.service === filters.service);
    }

    // Filtrar por tipo de cita (client-side)
    if (normalizedAppointmentTypeFilter !== APPOINTMENT_TYPE_FILTER_VALUES.all) {
      const appointmentTypeValueMap: Record<string, Appointment["appointmentType"]> = {
        [APPOINTMENT_TYPE_FILTER_VALUES.virtual]: "virtual",
        [APPOINTMENT_TYPE_FILTER_VALUES.inPerson]: "in_person",
      };

      const selectedType =
        appointmentTypeValueMap[normalizedAppointmentTypeFilter];

      if (selectedType) {
        result = result.filter((apt) => apt.appointmentType === selectedType);
      }
    }

    // Filtrar por búsqueda de texto (client-side)
    if (deferredSearchTerm) {
      const searchLower = deferredSearchTerm.toLowerCase();
      result = result.filter(
        (appointment) =>
          appointment.patientName.toLowerCase().includes(searchLower) ||
          appointment.service.toLowerCase().includes(searchLower) ||
          appointment.specialty.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [
    allAppointments,
    filters.specialty,
    filters.service,
    normalizedAppointmentTypeFilter,
    deferredSearchTerm,
  ]);

  // Usar paginación del API
  const totalPages = apiResponse?.paginacion?.totalPaginas || 1;

  // Datos paginados (ya vienen paginados del API)
  const paginatedAppointments = filteredAppointments;

  // Contar filtros activos
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "dateRange") {
      return value !== undefined;
    }
    if (key === "status") {
      return value !== STATUS_FILTER_VALUES.all;
    }
    if (key === "appointmentType") {
      return value !== APPOINTMENT_TYPE_FILTER_VALUES.all;
    }
    return value !== "all" && value !== "";
  }).length;

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      status: STATUS_FILTER_VALUES.all,
      appointmentType: APPOINTMENT_TYPE_FILTER_VALUES.all,
      specialty: "all",
      service: "all",
      dateRange: undefined,
    });
    setCurrentPage(1);
  }, []);

  // Manejar cambios de filtros
  const handleFiltersChange = useCallback(
    (newFilters: Partial<AppointmentsFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Resetear a página 1 al cambiar filtros
    },
    []
  );

  // Search input - Memoizar para evitar re-renders
  const searchComponent = useMemo(
    () => (
      <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
        <MCFilterInput
          placeholder={t("appointments.searchPlaceholder")}
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>
    ),
    [searchTerm, t]
  );

  // Callback para generar PDF - Memoizado
  const handleGeneratePDF = useCallback(async () => {
    await MCGeneratePDF({
      columns: [
        { title: t("appointments.table.patient"), key: "patientName" },
        { title: t("appointments.table.status"), key: "status" },
        { title: t("appointments.table.service"), key: "service" },
        { title: t("appointments.table.specialty"), key: "specialty" },
        { title: t("appointments.table.schedule"), key: "date" },
        { title: t("appointments.table.type"), key: "appointmentType" },
        { title: t("appointments.table.location"), key: "location" },
      ],
      data: filteredAppointments.map((apt) => ({
        ...apt,
        status: t(`appointments.status.${apt.status}`),
        appointmentType:
          apt.appointmentType === "virtual"
            ? t("appointments.type.virtual")
            : t("appointments.type.inPerson"),
      })),
      fileName: "citas",
      title: t("appointments.title"),
      subtitle: t("appointments.subtitle"),
    });
  }, [filteredAppointments, t]);

  // PDF generator - Memoizar para evitar re-renders
  const pdfGeneratorComponent = useMemo(
    () => <MCPDFButton onClick={handleGeneratePDF} />,
    [handleGeneratePDF]
  );

  const filterComponent = useMemo(
    () => (
      <MCFilterPopover
        activeFiltersCount={activeFiltersCount}
        onClearFilters={clearFilters}
      >
        <FilterMyAppointments
          key={currentLanguage}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          serviceOptions={serviceOptions}
        />
      </MCFilterPopover>
    ),
    [
      activeFiltersCount,
      clearFilters,
      currentLanguage,
      filters,
      handleFiltersChange,
      serviceOptions,
    ]
  );

  const visiblePages = useMemo<PageToken[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }

    const pages: PageToken[] = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push("ellipsis");
    for (let page = start; page <= end; page++) pages.push(page);
    if (end < totalPages - 1) pages.push("ellipsis");

    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  // Callbacks para paginación - Memoizados
  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1 && !isChangingPage) setCurrentPage((p) => Math.max(1, p - 1));
  }, [currentPage, isChangingPage]);

  const handlePageClick = useCallback(
    (pageNum: number) => {
      if (!isChangingPage) setCurrentPage(pageNum);
    },
    [isChangingPage]
  );

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages && !isChangingPage)
      setCurrentPage((p) => Math.min(totalPages, p + 1));
  }, [currentPage, totalPages, isChangingPage]);

  // Componente de paginación separado - Memoizar para evitar re-renders
  const paginationComponent = useMemo(
    () =>
      totalPages > 1 ? (
        <Pagination>
          <PaginationContent className="flex-wrap gap-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                aria-disabled={currentPage === 1 || isChangingPage}
                tabIndex={currentPage === 1 || isChangingPage ? -1 : 0}
                className={
                  currentPage === 1 || isChangingPage
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {visiblePages.map((page, idx) =>
              page === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <span className="px-2 text-muted-foreground">...</span>
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => handlePageClick(page)}
                    className={
                      isChangingPage
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
                aria-disabled={currentPage === totalPages || isChangingPage}
                tabIndex={currentPage === totalPages || isChangingPage ? -1 : 0}
                className={
                  currentPage === totalPages || isChangingPage
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null,
    [
      totalPages,
      currentPage,
      isChangingPage,
      handlePreviousPage,
      handlePageClick,
      handleNextPage,
      visiblePages,
    ]
  );

  // Error state
  if (error) {
    return (
      <MCTablesLayouts
        title={t("appointments.title")}
        metrics={[]}
        filtersInlineWithTitle
        tableComponent={
          <Empty>
            <EmptyHeader>
              <div className="flex flex-col items-center gap-2">
                <span className="flex items-center justify-center gap-2 text-destructive">
                  <AlertCircle className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
                  <EmptyTitle className={`font-semibold ${isMobile ? "text-lg" : "text-xl"}`}>
                    {t("common.error")}
                  </EmptyTitle>
                </span>
                <EmptyDescription className={`text-muted-foreground text-center max-w-md mx-auto ${isMobile ? "text-sm" : "text-base"}`}>
                  {t("appointments.empty.loadError")}
                </EmptyDescription>
              </div>
            </EmptyHeader>
            <EmptyContent>
              <MCButton
                variant="outline"
                onClick={() => window.location.reload()}
                className={isMobile ? "px-4 py-2" : "px-6 py-2"}
                size="sm"
              >
                {t("common.retry")}
              </MCButton>
            </EmptyContent>
          </Empty>
        }
        searchComponent={searchComponent}
        pdfGeneratorComponent={pdfGeneratorComponent}
        filterComponent={filterComponent}
      />
    );
  }

  // Mostrar estado vacío solo si no está cargando y no hay citas
  const tableComponent = (!isLoading && filteredAppointments.length === 0) ? (
    // Empty state
    <Empty>
      <EmptyHeader>
        <div className="flex flex-col items-center gap-2">
          <span className="flex items-center justify-center gap-2 text-primary">
            {activeFiltersCount > 0 ? (
              <Filter className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            ) : (
              <CalendarX className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            )}
            <EmptyTitle className={`font-semibold ${isMobile ? "text-lg" : "text-xl"}`}>
              {activeFiltersCount > 0
                ? t("appointments.empty.noResults")
                : t("appointments.empty.noAppointments")}
            </EmptyTitle>
          </span>
          <EmptyDescription className={`text-muted-foreground text-center max-w-md mx-auto ${isMobile ? "text-sm" : "text-base"}`}>
            {activeFiltersCount > 0
              ? t("appointments.empty.noResultsDescription")
              : t("appointments.empty.noAppointmentsDescription")}
          </EmptyDescription>
        </div>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col items-center gap-3">
          {activeFiltersCount > 0 && (
            <MCButton
              variant="outline"
              onClick={clearFilters}
              className={isMobile ? "px-4 py-2" : "px-6 py-2"}
              size="sm"
            >
              {t("appointments.empty.clearFilters")}
            </MCButton>
          )}
        </div>
      </EmptyContent>
    </Empty>
  ) : (
    <MyAppointmentTable appointments={paginatedAppointments} isChangingPage={isChangingPage} />
  );

  // Métricas: Calcular desde los datos cargados
  const getMetricValue = (
    stats: Record<string, unknown> | null | undefined,
    keys: string[]
  ): number => {
    for (const key of keys) {
      const value = stats?.[key];
      if (typeof value === "number") return value;
    }
    return 0;
  };

  const metricsValues = {
    total: getMetricValue(doctorCitasStats, ["totalCitas", "total", "citasTotales"]),
    pending: getMetricValue(doctorCitasStats, ["programadas", "citasProgramadas", "pendientes", "citasPendientes"]),
    cancelled: getMetricValue(doctorCitasStats, ["canceladas", "citasCanceladas"]),
    completed: getMetricValue(doctorCitasStats, ["completadas", "citasCompletadas"]),
  };

  const metrics = [
    {
      title: t("appointments.metrics.total"),
      value: metricsValues.total,
      subtitle: t("appointments.metrics.totalSubtitle"),
      icon: <Calendar />,
    },
    {
      title: t("appointments.metrics.pending"),
      value: metricsValues.pending,
      subtitle: t("appointments.metrics.pendingSubtitle"),
      icon: <Clock />,
    },
    {
      title: t("appointments.metrics.cancelled"),
      value: metricsValues.cancelled,
      subtitle: t("appointments.metrics.cancelledSubtitle"),
      icon: <XCircle />,
    },
    {
      title: t("appointments.metrics.completed"),
      value: metricsValues.completed,
      subtitle: t("appointments.metrics.completedSubtitle"),
      icon: <CheckCircle />,
    },
  ];

  return (
    <MCTablesLayouts
      title={t("appointments.title")}
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

export default AppointmentsPage;