import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MyAppointmentsCards } from "../components/appoiments/MyAppointmentsCards";
import { MyAppointmentsTable } from "../components/appoiments/MyAppointmentsTable";
import MCTablesLayouts from "@/shared/components/tables/MCTablesLayouts";
import MCPDFButton from "@/shared/components/forms/MCPDFButton";
import MCToogle from "@/shared/components/forms/MCToogle";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import FilterMyAppointments from "../components/filters/FilterMyAppointments";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/shared/ui/pagination";
import MCGeneratePDF from "@/shared/components/MCGeneratePDF";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useAppStore } from "@/stores/useAppStore";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/shared/ui/empty";
import MCButton from "@/shared/components/forms/MCButton";
import { Filter, CalendarX, Loader2 } from "lucide-react";
import { useAppointments } from "@/lib/hooks/useAppointments";
import { mapCitasToAppointments } from "@/utils/appointmentMapper";
import type { Appointment as ApiAppointment } from "@/shared/components/calendar/AppointmentCard";
import type { CitasFilters } from "@/types/AppointmentTypes";
import type { Locale } from "date-fns";
import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { getUserAppRole } from "@/services/auth/auth.types";

// Interfaz local para los componentes de esta página
export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar: string;
  doctorSpecialty: string;
  doctorSpecialtyId: string;
  evaluationType: string;
  date: string;
  time: string;
  description?: string;
  dateISO: Date;
  appointmentType: "virtual" | "in_person";
  location?: string;
  status: "scheduled" | "pending" | "in_progress" | "completed" | "cancelled";
}

// Tipo para los filtros locales
interface LocalAppointmentFilters {
  status: string[];
  specialties: string[];
  modalities: string[];
  ServiceName: string[];
  dateRange?: [Date, Date];
  doctorName?: string;
}

// Función adaptadora: convierte el formato de API al formato local de la página
const adaptApiAppointmentToLocal = (
  apiAppointment: ApiAppointment,
  locale: Locale,
): Appointment => {
  return {
    id: apiAppointment.id,
    doctorId: apiAppointment.doctorId || "",
    doctorName: apiAppointment.clientName,
    doctorAvatar: apiAppointment.clientImage || "",
    doctorSpecialty: apiAppointment.serviceData?.especialidad?.nombre || "",
    doctorSpecialtyId: apiAppointment.serviceData?.especialidad?.id ? String(apiAppointment.serviceData.especialidad.id) : "",
    evaluationType: apiAppointment.service,
    date: format(apiAppointment.date, "dd MMM, yyyy", { locale }),
    time: apiAppointment.startTime,
    description: apiAppointment.reason,
    dateISO: apiAppointment.date,
    appointmentType: apiAppointment.isVirtual ? "virtual" : "in_person",
    location: undefined, // No disponible en el nuevo formato
    status: apiAppointment.status,
  };
};

const ITEMS_PER_PAGE = 6;

function MyAppointmentsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  // Obtener el usuario autenticado y su rol
  const user = useAppStore((state) => state.user);
  const userRole = getUserAppRole(user) || "PATIENT";

  // Lee la preferencia de vista del localStorage (por defecto "card")
  const [showCards, setShowCards] = useState(() => {
    const saved = localStorage.getItem("appointmentsView");
    return saved ? saved === "card" : true;
  });

  // Guarda la preferencia cada vez que cambia
  const handleToggleView = useCallback((val: string) => {
    setShowCards(val === "card");
    localStorage.setItem("appointmentsView", val);
  }, []);

  // Estados locales con useState
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [historicalPage, setHistoricalPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const setIsLoading = useGlobalUIStore((state) => state.setIsLoading);
  
  // Estado de filtros local
  const [filters, setFilters] = useState<LocalAppointmentFilters>({
    status: [],
    specialties: [],
    modalities: [],
    ServiceName: [],
    dateRange: undefined,
    doctorName: undefined,
  });

  // Construir filtros para la API
  const currentLanguage = i18n.resolvedLanguage || i18n.language;
  const locale = useMemo(() => (currentLanguage.startsWith("en") ? enUS : es), [currentLanguage]);

  const apiFilters: CitasFilters = useMemo(() => {
    const filters: CitasFilters = {
      limite: ITEMS_PER_PAGE * 10, // Cargar suficientes datos para filtrar localmente
      target: currentLanguage.startsWith("en") ? "en" : "es",
      source: currentLanguage.startsWith("en") ? "es" : "en",
      translate_fields: "nombre",
    };
    return filters;
  }, [currentLanguage]);

  // Fetch appointments usando React Query
  const { data: appointmentsData, isLoading, isError, refetch } = useAppointments(
    apiFilters,
    userRole,
    {
      refetchOnWindowFocus: false,
      refetchInterval: 60000,
      refetchIntervalInBackground: false,
    },
  );

  // Mapear datos de la API al formato del componente
  const allAppointments = useMemo(() => {
    if (!appointmentsData?.data) return [];
    
    const citasArray = Array.isArray(appointmentsData.data) 
      ? appointmentsData.data 
      : [appointmentsData.data];
    
    // Mapear desde la API al formato de AppointmentCard
    const apiAppointments = mapCitasToAppointments(citasArray, userRole);
    
    // Adaptar al formato local de esta página
    return apiAppointments.map((appointment) =>
      adaptApiAppointmentToLocal(appointment, locale),
    );
  }, [appointmentsData, userRole, locale]);

  // Función para actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<LocalAppointmentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Resetear paginación cuando cambian los filtros
    setUpcomingPage(1);
    setHistoricalPage(1);
  }, []);

  // Función para resetear filtros
  const resetFilters = useCallback(() => {
    setFilters({
      status: [],
      specialties: [],
      modalities: [],
      ServiceName: [],
      dateRange: undefined,
      doctorName: undefined,
    });
    setSearchTerm("");
    setUpcomingPage(1);
    setHistoricalPage(1);
  }, []);

  // Función para contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.specialties.length > 0) count++;
    if (filters.modalities.length > 0) count++;
    if (filters.ServiceName.length > 0) count++;
    if (filters.dateRange) count++;
    if (searchTerm) count++;
    return count;
  }, [filters, searchTerm]);

  const normalizedSearchTerm = useMemo(
    () => searchTerm.trim().toLowerCase(),
    [searchTerm],
  );

  // Función para filtrar las citas localmente
  const filteredAppointments = useMemo(() => {
    return allAppointments.filter((appointment) => {
      // Filtro por búsqueda de doctor/paciente
      if (
        normalizedSearchTerm &&
        !appointment.doctorName.toLowerCase().includes(normalizedSearchTerm)
      ) {
        return false;
      }

      // Filtro por estado
      if (
        filters.status.length > 0 &&
        !filters.status.includes(appointment.status)
      ) {
        return false;
      }

      // Filtro por especialidad (usando ID)
      if (
        filters.specialties.length > 0 &&
        appointment.doctorSpecialtyId &&
        !filters.specialties.includes(appointment.doctorSpecialtyId)
      ) {
        return false;
      }

      // Filtro por tipo de servicio
      if (
        filters.ServiceName.length > 0 &&
        !filters.ServiceName.includes(appointment.evaluationType)
      ) {
        return false;
      }

      // Filtro por modalidad (virtual/presencial)
      if (filters.modalities.length > 0) {
        const modalityMatch = filters.modalities.some((modality) => {
          if (modality === "virtual" || modality === "teleconsulta") {
            return appointment.appointmentType === "virtual";
          }
          if (modality === "in_person" || modality === "presencial") {
            return appointment.appointmentType === "in_person";
          }
          return false;
        });
        if (!modalityMatch) return false;
      }

      // Filtro por rango de fechas
      if (filters.dateRange) {
        const appointmentDate = new Date(appointment.dateISO);
        const [startDate, endDate] = filters.dateRange;
        if (appointmentDate < startDate || appointmentDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [allAppointments, filters, normalizedSearchTerm]);

  const { upcomingAppointments, historicalAppointments, upcomingOriginalCount, historicalOriginalCount } = useMemo(() => {
    const upcomingSource = allAppointments.filter((apt) =>
      ["scheduled", "pending", "in_progress"].includes(apt.status),
    );
    const historicalSource = allAppointments.filter((apt) =>
      ["completed", "cancelled"].includes(apt.status),
    );

    const upcoming = filteredAppointments.filter((apt) =>
      ["scheduled", "pending", "in_progress"].includes(apt.status),
    );
    const historical = filteredAppointments.filter((apt) =>
      ["completed", "cancelled"].includes(apt.status),
    );
    return {
      upcomingAppointments: upcoming,
      historicalAppointments: historical,
      upcomingOriginalCount: upcomingSource.length,
      historicalOriginalCount: historicalSource.length,
    };
  }, [allAppointments, filteredAppointments]);

  const upcomingPagination = useMemo(() => {
    const totalPages = Math.ceil(upcomingAppointments.length / ITEMS_PER_PAGE);
    const startIndex = (upcomingPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = upcomingAppointments.slice(startIndex, endIndex);

    return { totalPages, currentItems };
  }, [upcomingAppointments, upcomingPage]);

  // Calcular paginación para historial
  const historicalPagination = useMemo(() => {
    const totalPages = Math.ceil(
      historicalAppointments.length / ITEMS_PER_PAGE,
    );
    const startIndex = (historicalPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = historicalAppointments.slice(startIndex, endIndex);

    return { totalPages, currentItems };
  }, [historicalAppointments, historicalPage]);

  // Función para navegar a búsqueda
  const handleScheduleAppointment = useCallback(() => {
    navigate("/search");
  }, [navigate]);

  // Componente de paginación reutilizable
  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void,
  ) => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Función para renderizar una lista de citas
  const renderAppointments = (
    appointments: Appointment[],
    section: "upcoming" | "historical",
  ) => {
    const isUpcoming = section === "upcoming";
    const currentPage = isUpcoming ? upcomingPage : historicalPage;
    const pagination = isUpcoming ? upcomingPagination : historicalPagination;
    const setPage = isUpcoming ? setUpcomingPage : setHistoricalPage;

    // Verificar si hay filtros activos
    const hasActiveFilters = activeFiltersCount > 0;
    const originalCount = isUpcoming
      ? upcomingOriginalCount
      : historicalOriginalCount;

    if (appointments.length === 0) {
      const sectionKey = isUpcoming ? "upcomingSection" : "historySection";

      return (
        <Empty>
          <EmptyHeader>
            <div className="flex flex-col items-center gap-2">
              <span className="flex items-center justify-center gap-2 text-primary">
                {hasActiveFilters ? (
                  <Filter className="w-7 h-7" />
                ) : (
                  <CalendarX className="w-7 h-7" />
                )}
                <EmptyTitle className="text-xl font-semibold">
                  {hasActiveFilters
                    ? t("patient:myAppointments.noResults")
                    : isUpcoming
                      ? t("patient:myAppointments.noUpcoming")
                      : t("patient:myAppointments.noHistory")}
                </EmptyTitle>
              </span>
              <EmptyDescription className="text-muted-foreground text-center max-w-md mx-auto">
                {hasActiveFilters
                  ? originalCount > 0
                    ? t("patient:myAppointments.noResultsDescription", {
                        count: originalCount,
                        section: t(`patient:myAppointments.${sectionKey}`),
                      })
                    : isUpcoming
                      ? t("patient:myAppointments.noUpcomingRegistered")
                      : t("patient:myAppointments.noHistoryRegistered")
                  : isUpcoming
                    ? t("patient:myAppointments.noUpcomingDescription")
                    : t("patient:myAppointments.noHistoryDescription")}
              </EmptyDescription>
            </div>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-col items-center gap-3">
              {hasActiveFilters && originalCount > 0 ? (
                <MCButton
                  variant="outline"
                  onClick={resetFilters}
                  className="px-6 py-2"
                  size="sm"
                >
                  {t("patient:myAppointments.clearFilters")}
                </MCButton>
              ) : null}

              {(!hasActiveFilters || originalCount === 0) &&
                isUpcoming && (
                  <MCButton
                    variant="primary"
                    onClick={handleScheduleAppointment}
                    className="px-6 py-2"
                    size="sm"
                  >
                    {t("patient:myAppointments.scheduleNew")}
                  </MCButton>
                )}
            </div>
          </EmptyContent>
        </Empty>
      );
    }

    if (showCards) {
      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pagination.currentItems.map((appointment) => (
              <MyAppointmentsCards
                key={appointment.id}
                appointment={appointment}
                onViewDetails={() =>
                  console.log("View details:", appointment.id)
                }
                onReschedule={() => console.log("Reschedule:", appointment.id)}
                onCancel={() => console.log("Cancel:", appointment.id)}
                onJoin={() => console.log("Join:", appointment.id)}
              />
            ))}
          </div>
          {renderPagination(currentPage, pagination.totalPages, setPage)}
        </div>
      );
    }

    return <MyAppointmentsTable key={section} data={appointments} />;
  };

  // Componentes
  const toggleView = (
    <MCToogle value={showCards ? "card" : "list"} onChange={handleToggleView} />
  );

  const pdfGeneratorComponent = (
    <MCPDFButton
      onClick={async () => {
        setIsLoading(true);
        try {
          await MCGeneratePDF({
            columns: [
              {
                title: userRole === "DOCTOR" 
                  ? t("patient:myAppointments.pdfColumns.patient") 
                  : t("patient:myAppointments.pdfColumns.doctor"),
                key: "doctorName",
              },
              {
                title: t("patient:myAppointments.pdfColumns.specialty"),
                key: "doctorSpecialty",
              },
              {
                title: t("patient:myAppointments.pdfColumns.service"),
                key: "evaluationType",
              },
              { 
                title: t("patient:myAppointments.pdfColumns.date"), 
                key: "date" 
              },
              { 
                title: t("patient:myAppointments.pdfColumns.time"), 
                key: "time" 
              },
              {
                title: t("patient:myAppointments.pdfColumns.modality"),
                key: "appointmentType",
              },
              {
                title: t("patient:myAppointments.pdfColumns.status"),
                key: "status",
              },
            ],
            data: allAppointments,
            fileName: "mis-citas",
            title: t("patient:myAppointments.pdfTitle"),
            subtitle: t("patient:myAppointments.pdfSubtitle"),
          });
        } catch (error) {
          console.error("Error generating PDF:", error);
        } finally {
          setIsLoading(false);
        }
      }}
    />
  );

  const filterComponent = (
    <MCFilterPopover
      activeFiltersCount={activeFiltersCount}
      onClearFilters={resetFilters}
    >
      <FilterMyAppointments filters={filters} onFiltersChange={updateFilters} />
    </MCFilterPopover>
  );

  const searchInput = (
    <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
      <MCFilterInput
        placeholder={t("patient:myAppointments.searchPlaceholder")}
        value={searchTerm}
        onChange={(value: string) => {
          setSearchTerm(value);
          setUpcomingPage(1);
          setHistoricalPage(1);
        }}
      />
    </div>
  );

  // Componente principal con ambas secciones
  const tableComponent = (
    <div className="space-y-8 bg-background">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {t("patient:myAppointments.loadingAppointments")}
          </p>
        </div>
      ) : isError ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t("patient:myAppointments.errorTitle")}</EmptyTitle>
            <EmptyDescription>
              {t("patient:myAppointments.errorDescription")}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <MCButton
              variant="primary"
              onClick={() => refetch()}
              className="px-6 py-2"
              size="sm"
            >
              {t("patient:myAppointments.retry")}
            </MCButton>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          {/* Sección: Próximas Citas */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              {t("patient:myAppointments.upcomingTitle")}
            </h2>
            {renderAppointments(upcomingAppointments, "upcoming")}
          </section>

          {/* Sección: Historial de Citas */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              {t("patient:myAppointments.historyTitle")}
            </h2>
            {renderAppointments(historicalAppointments, "historical")}
          </section>
        </>
      )}
    </div>
  );

  return (
    <MCTablesLayouts
      title={t("patient:myAppointments.title")}
      tableComponent={tableComponent}
      toogleView={toggleView}
      searchComponent={searchInput}
      filterComponent={filterComponent}
      pdfGeneratorComponent={pdfGeneratorComponent}
    />
  );
}

export default MyAppointmentsPage;
