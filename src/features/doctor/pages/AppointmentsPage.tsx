import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useDoctorAppointments } from "@/lib/hooks/useDoctorAppointments";
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
import { format, addDays } from 'date-fns';
import { mapCitaEstadoToAppointmentStatus, isVirtualModality } from "@/utils/appointmentMapper";

/**
 * Mapea una cita del API (CitaDetalle) al formato de UI (Appointment)
 */
const mapCitaDetalleToAppointment = (cita: CitaDetalle): Appointment => {
  const fechaInicio = new Date(cita.fechaInicio);

  // Formatear fecha como DD/MM/YYYY
  const formattedDate = fechaInicio.toLocaleDateString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Formatear hora como HH:MM
  const horaInicio = cita.horaInicio.substring(0, 5);
  const horaFin = cita.horaFin.substring(0, 5);
  const formattedTime = `${horaInicio} – ${horaFin}`;

  const isVirtual = isVirtualModality(cita.modalidad);

  return {
    id: cita.id.toString(),
    doctorId: cita.doctorId?.toString() || '',
    patientName: `${cita.paciente.nombre} ${cita.paciente.apellido}`,
    patientImage: cita.paciente.usuario.fotoPerfil || undefined,
    service: cita.servicio.nombre,
    specialty: cita.servicio.especialidad.nombre,
    date: formattedDate,
    time: formattedTime,
    phone: cita.paciente.usuario.email || 'N/A',
    email: cita.paciente.usuario.email || 'N/A',
    appointmentType: isVirtual ? 'virtual' : 'in_person',
    location: isVirtual ? 'Virtual' : 'En sitio',
    status: mapCitaEstadoToAppointmentStatus(cita.estado),
  };
};


function AppointmentsPage() {
  const { t } = useTranslation("doctor");
  const { i18n } = useTranslation();
  const isMobile = useIsMobile();

  // Estados UI
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const [filters, setFilters] = useState({
    status: "all",
    appointmentType: "all",
    specialty: "all",
    service: "all",
    dateRange: undefined as [Date, Date] | undefined,
  });

  // Convertir filtros UI a filtros API
  const apiFilters = useMemo<CitasFilters>(() => {
    const converted: CitasFilters = {
      pagina: currentPage,
      limite: PAGE_SIZE,
      source: i18n.language === "es" ? "en" : "es",
      target: i18n.language === "es" ? "es" : "en",
      translate_fields: "nombre",
    };

    // Mapear estado
    if (filters.status !== "all") {
      const statusMap: { [key: string]: CitasFilters['estado'] } = {
        'scheduled': 'Programada',
        'in_progress': 'En Progreso',
        'completed': 'Completada',
        'cancelled': 'Cancelada',
      };
      converted.estado = statusMap[filters.status];
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
          12, 0, 0, 0  // mediodía local — nunca cruza medianoche por timezone
        );
      };

      const localStart = toLocalNoon(startDate);
      const localEnd = toLocalNoon(endDate);

      converted.fechaDesde = format(addDays(localStart, 1), 'MM/dd/yyyy');
      converted.fechaHasta = format(addDays(localEnd, 1), 'MM/dd/yyyy');
    }

    return converted;
  }, [filters.status, filters.dateRange, currentPage, i18n.language]);

  // Petición al API
  const { data: apiResponse, isLoading, isFetching, error } = useDoctorAppointments(apiFilters);

  // Mapear respuesta del API
  const allAppointments = useMemo(() => {
    if (!apiResponse?.data) return [];
    const data = Array.isArray(apiResponse.data) ? apiResponse.data : [apiResponse.data];
    return data.map(mapCitaDetalleToAppointment);
  }, [apiResponse?.data]);

  // Extraer opciones dinámicamente de los datos cargados (client-side)
  const { specialtyOptions, serviceOptions } = useMemo(() => {
    const specialties = new Map<string, boolean>();
    const services = new Map<string, boolean>();

    allAppointments.forEach((apt) => {
      specialties.set(apt.specialty, true);
      services.set(apt.service, true);
    });

    return {
      specialtyOptions: Array.from(specialties.keys()).sort(),
      serviceOptions: Array.from(services.keys()).sort(),
    };
  }, [allAppointments]);

  // Filtrar por búsqueda y filtros client-side (cliente-side)
  const filteredAppointments = useMemo(() => {
    let result = allAppointments;

    // Filtrar por rango de especialidades (client-side)
    if (filters.specialty !== "all") {
      result = result.filter((apt) => apt.specialty === filters.specialty);
    }

    // Filtrar por servicio (client-side)
    if (filters.service !== "all") {
      result = result.filter((apt) => apt.service === filters.service);
    }

    // Filtrar por tipo de cita (client-side)
    if (filters.appointmentType !== "all") {
      result = result.filter((apt) => apt.appointmentType === filters.appointmentType);
    }

    // Filtrar por búsqueda de texto (client-side)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (appointment) =>
          appointment.patientName.toLowerCase().includes(searchLower) ||
          appointment.service.toLowerCase().includes(searchLower) ||
          appointment.specialty.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [allAppointments, filters.specialty, filters.service, filters.appointmentType, searchTerm]);

  // Usar paginación del API
  const totalPages = apiResponse?.paginacion?.totalPaginas || 1;

  // Datos paginados (ya vienen paginados del API)
  const paginatedAppointments = filteredAppointments;

  // Contar filtros activos
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "dateRange") {
      return value !== undefined;
    }
    return value !== "all" && value !== "";
  }).length;

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      status: "all",
      appointmentType: "all",
      specialty: "all",
      service: "all",
      dateRange: undefined,
    });
    setCurrentPage(1);
  }, []);

  // Manejar cambios de filtros
  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Resetear a página 1 al cambiar filtros
  }, []);

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

  const filterComponent = (
    <MCFilterPopover
      activeFiltersCount={activeFiltersCount}
      onClearFilters={clearFilters}
    >
      <FilterMyAppointments
        filters={filters}
        onFiltersChange={handleFiltersChange}
        specialtyOptions={specialtyOptions}
        serviceOptions={serviceOptions}
      />
    </MCFilterPopover>
  );

  // Callbacks para paginación - Memoizados
  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1 && !isFetching) setCurrentPage((p) => Math.max(1, p - 1));
  }, [currentPage, isFetching]);

  const handlePageClick = useCallback(
    (pageNum: number) => {
      if (!isFetching) setCurrentPage(pageNum);
    },
    [isFetching]
  );

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages && !isFetching)
      setCurrentPage((p) => Math.min(totalPages, p + 1));
  }, [currentPage, totalPages, isFetching]);

  // Componente de paginación separado - Memoizar para evitar re-renders
  const paginationComponent = useMemo(
    () =>
      totalPages > 1 ? (
        <Pagination>
          <PaginationContent className="flex-wrap gap-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                aria-disabled={currentPage === 1 || isFetching}
                tabIndex={currentPage === 1 || isFetching ? -1 : 0}
                className={
                  currentPage === 1 || isFetching
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
                    isFetching ? "pointer-events-none opacity-50" : "cursor-pointer"
                  }
                >
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
                aria-disabled={currentPage === totalPages || isFetching}
                tabIndex={currentPage === totalPages || isFetching ? -1 : 0}
                className={
                  currentPage === totalPages || isFetching
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null,
    [totalPages, currentPage, isFetching, handlePreviousPage, handlePageClick, handleNextPage]
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

  // Loading state - mostrar tabla vacía con esqueleto
  const tableComponent = isLoading ? (
    <div className="space-y-4">
      {[...Array(PAGE_SIZE)].map((_, i) => (
        <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  ) : filteredAppointments.length === 0 ? (
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
    <div className="relative">
      {/* Spinner overlay cuando está cargando */}
      {isFetching && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground font-medium">
              {t("common.loading")}
            </p>
          </div>
        </div>
      )}
      <div className={`transition-opacity duration-300 ${isFetching ? "opacity-40" : "opacity-100"}`}>
        <MyAppointmentTable appointments={paginatedAppointments} />
      </div>
    </div>
  );

  // Métricas: Calcular desde los datos cargados
  const metrics = [
    {
      title: t("appointments.metrics.total"),
      value: apiResponse?.paginacion.total || 0,
      subtitle: t("appointments.metrics.totalSubtitle"),
      icon: <Calendar />,
    },
    {
      title: t("appointments.metrics.pending"),
      value: allAppointments.filter((a) => a.status === "scheduled").length,
      subtitle: t("appointments.metrics.pendingSubtitle"),
      icon: <Clock />,
    },
    {
      title: t("appointments.metrics.cancelled"),
      value: allAppointments.filter((a) => a.status === "cancelled").length,
      subtitle: t("appointments.metrics.cancelledSubtitle"),
      icon: <XCircle />,
    },
    {
      title: t("appointments.metrics.completed"),
      value: allAppointments.filter((a) => a.status === "completed").length,
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