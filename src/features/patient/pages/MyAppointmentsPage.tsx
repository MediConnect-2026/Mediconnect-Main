import React, { useState, useMemo } from "react";
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
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/shared/ui/empty";
import MCButton from "@/shared/components/forms/MCButton";
import { Filter, CalendarX } from "lucide-react";

// Interfaz de cita
export interface Appointment {
  id: string;
  doctorId: string; // <-- Agrega este campo
  doctorName: string;
  doctorAvatar: string;
  doctorSpecialty: string;
  evaluationType: string;
  date: string;
  time: string;
  description?: string;
  appointmentType: "virtual" | "in_person";
  location?: string;
  status: "scheduled" | "pending" | "in_progress" | "completed" | "cancelled";
}

// Tipo para los filtros locales
interface AppointmentFilters {
  status: string[];
  specialties: string[];
  modalities: string[];
  ServiceName: string[];
  dateRange?: [Date, Date];
  doctorName?: string;
}

// Datos de ejemplo
const mockAppointments: Appointment[] = [
  {
    id: "1",
    doctorId: "d1", // <-- Agrega un id único para cada doctor
    doctorName: "Daniel Ramírez",
    doctorSpecialty: "Terapeuta",
    doctorAvatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Evaluación Cardíaca Integral",
    date: "28 Oct, 2025",
    time: "10:30 AM",
    appointmentType: "in_person",
    location: "Av. Sarasota, Plaza Médica Sarasota",
    status: "scheduled",
  },
  {
    id: "2",
    doctorId: "d2",
    doctorName: "Mariana López",
    doctorSpecialty: "Terapeuta",
    doctorAvatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Evaluación Cardíaca Integral",
    date: "28 Oct, 2025",
    time: "10:30 AM",
    appointmentType: "in_person",
    location: "Av. Sarasota, Plaza Médica Sarasota",
    status: "pending",
  },
  {
    id: "3",
    doctorId: "d3",
    doctorName: "Santiago Pérez",
    doctorSpecialty: "Terapeuta",
    doctorAvatar:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Evaluación Cardíaca Integral",
    date: "28 Oct, 2025",
    time: "10:30 AM",
    appointmentType: "virtual",
    status: "in_progress",
  },
  {
    id: "4",
    doctorId: "d4",
    doctorName: "Dr. Cristoforo Criparni",
    doctorSpecialty: "Ginecología",
    doctorAvatar:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Evaluación Cardíaca Integral",
    description:
      "Consulta virtual para diagnóstico de hipertensión y control de ritmo cardíaco.",
    date: "28 Oct, 2025",
    time: "10:30 AM",
    appointmentType: "in_person",
    location: "Av. Sarasota, Plaza Médica Sarasota",
    status: "scheduled",
  },
  {
    id: "5",
    doctorId: "d5",
    doctorName: "Sofía Torres",
    doctorSpecialty: "Terapeuta",
    doctorAvatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Evaluación Cardíaca Integral",
    date: "28 Oct, 2025",
    time: "10:30 AM",
    appointmentType: "in_person",
    location: "Av. Sarasota, Plaza Médica Sarasota",
    status: "cancelled",
  },
  {
    id: "6",
    doctorId: "d6",
    doctorName: "Alejandro Díaz",
    doctorSpecialty: "Terapeuta",
    doctorAvatar:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Evaluación Cardíaca Integral",
    date: "28 Oct, 2025",
    time: "10:30 AM",
    appointmentType: "in_person",
    location: "Av. Sarasota, Plaza Médica Sarasota",
    status: "completed",
  },
  {
    id: "7",
    doctorId: "d7",
    doctorName: "Dra. Laura Méndez",
    doctorSpecialty: "Cardiología",
    doctorAvatar:
      "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Chequeo Cardiovascular",
    description: "Control rutinario de presión arterial y electrocardiograma.",
    date: "25 Oct, 2025",
    time: "09:00 AM",
    appointmentType: "in_person",
    location: "Centro Médico Nacional, Piso 3",
    status: "completed",
  },
  {
    id: "8",
    doctorId: "d8",
    doctorName: "Dr. Roberto García",
    doctorSpecialty: "Medicina General",
    doctorAvatar:
      "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Consulta General",
    date: "20 Oct, 2025",
    time: "14:00 PM",
    appointmentType: "virtual",
    status: "cancelled",
  },
  {
    id: "9",
    doctorId: "d9",
    doctorName: "Dr. Pablo Herrera",
    doctorSpecialty: "Dermatología",
    doctorAvatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Consulta Dermatológica",
    date: "30 Oct, 2025",
    time: "11:00 AM",
    appointmentType: "in_person",
    location: "Clínica Central, Piso 2",
    status: "scheduled",
  },
  {
    id: "10",
    doctorId: "d10",
    doctorName: "Dra. Carla Jiménez",
    doctorSpecialty: "Pediatría",
    doctorAvatar:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Chequeo Pediátrico",
    date: "31 Oct, 2025",
    time: "09:30 AM",
    appointmentType: "virtual",
    status: "pending",
  },
  {
    id: "11",
    doctorId: "d11",
    doctorName: "Dr. Luis Martínez",
    doctorSpecialty: "Oftalmología",
    doctorAvatar:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Evaluación Visual",
    date: "01 Nov, 2025",
    time: "13:00 PM",
    appointmentType: "in_person",
    location: "Centro Óptico, Sala 5",
    status: "completed",
  },
  {
    id: "12",
    doctorId: "d12",
    doctorName: "Dra. Patricia Gómez",
    doctorSpecialty: "Endocrinología",
    doctorAvatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Control de Diabetes",
    date: "02 Nov, 2025",
    time: "15:00 PM",
    appointmentType: "virtual",
    status: "cancelled",
  },
  {
    id: "13",
    doctorId: "d13",
    doctorName: "Dr. Andrés Castro",
    doctorSpecialty: "Neurología",
    doctorAvatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face",
    evaluationType: "Consulta Neurológica",
    date: "03 Nov, 2025",
    time: "16:30 PM",
    appointmentType: "in_person",
    location: "Hospital General, Consultorio 12",
    status: "in_progress",
  },
];

const ITEMS_PER_PAGE = 6;

function MyAppointmentsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Estados locales con useState
  const [showCards, setShowCards] = useState(true);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [historicalPage, setHistoricalPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const setIsLoading = useGlobalUIStore((state) => state.setIsLoading);
  // Estado de filtros local
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: [],
    specialties: [],
    modalities: [],
    ServiceName: [],
    dateRange: undefined,
    doctorName: undefined,
  });

  // Función para actualizar filtros
  const updateFilters = (newFilters: Partial<AppointmentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Función para resetear filtros
  const resetFilters = () => {
    setFilters({
      status: [],
      specialties: [],
      modalities: [],
      ServiceName: [],
      dateRange: undefined,
      doctorName: undefined,
    });
    setSearchTerm("");
  };

  // Función para contar filtros activos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.specialties.length > 0) count++;
    if (filters.modalities.length > 0) count++;
    if (filters.ServiceName.length > 0) count++;
    if (filters.dateRange) count++;
    if (searchTerm) count++;
    return count;
  };

  // Función para filtrar las citas
  const filterAppointments = (appointments: Appointment[]) => {
    return appointments.filter((appointment) => {
      // Filtro por búsqueda de doctor
      if (
        searchTerm &&
        !appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
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

      // Filtro por especialidad
      if (
        filters.specialties.length > 0 &&
        !filters.specialties.includes(appointment.doctorSpecialty)
      ) {
        return false;
      }

      // Filtro por modalidad
      if (
        filters.modalities.length > 0 &&
        !filters.modalities.includes(appointment.appointmentType)
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

      // Filtro por rango de fechas
      if (filters.dateRange) {
        const appointmentDate = new Date(appointment.date);
        const [startDate, endDate] = filters.dateRange;
        if (appointmentDate < startDate || appointmentDate > endDate) {
          return false;
        }
      }

      return true;
    });
  };

  // Separar citas próximas e historial con filtros aplicados
  const { upcomingAppointments, historicalAppointments } = useMemo(() => {
    const filteredAppointments = filterAppointments(mockAppointments);

    const upcoming = filteredAppointments.filter((apt) =>
      ["scheduled", "pending", "in_progress"].includes(apt.status),
    );
    const historical = filteredAppointments.filter((apt) =>
      ["completed", "cancelled"].includes(apt.status),
    );
    return {
      upcomingAppointments: upcoming,
      historicalAppointments: historical,
    };
  }, [filters, searchTerm]);

  // Calcular paginación para citas próximas
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
  const handleScheduleAppointment = () => {
    navigate("/search");
  };

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
    const hasActiveFilters = getActiveFiltersCount() > 0;
    const originalAppointments = isUpcoming
      ? mockAppointments.filter((apt) =>
          ["scheduled", "pending", "in_progress"].includes(apt.status),
        )
      : mockAppointments.filter((apt) =>
          ["completed", "cancelled"].includes(apt.status),
        );

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
                  ? originalAppointments.length > 0
                    ? t("patient:myAppointments.noResultsDescription", {
                        count: originalAppointments.length,
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
              {hasActiveFilters && originalAppointments.length > 0 ? (
                <MCButton
                  variant="outline"
                  onClick={resetFilters}
                  className="px-6 py-2"
                >
                  {t("patient:myAppointments.clearFilters")}
                </MCButton>
              ) : null}

              {(!hasActiveFilters || originalAppointments.length === 0) &&
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
    <MCToogle
      value={showCards ? "card" : "list"}
      onChange={(val) => setShowCards(val === "card")}
    />
  );

  const pdfGeneratorComponent = (
    <MCPDFButton
      onClick={async () => {
        setIsLoading(true);
        await MCGeneratePDF({
          columns: [
            {
              title: t("patient:myAppointments.pdfColumns.doctor"),
              key: "doctorName",
            },
            {
              title: t("patient:myAppointments.pdfColumns.specialty"),
              key: "doctorSpecialty",
            },
            {
              title: t("patient:myAppointments.pdfColumns.evaluationType"),
              key: "evaluationType",
            },
            { title: t("patient:myAppointments.pdfColumns.date"), key: "date" },
            { title: t("patient:myAppointments.pdfColumns.time"), key: "time" },
            {
              title: t("patient:myAppointments.pdfColumns.appointmentType"),
              key: "appointmentType",
            },
            {
              title: t("patient:myAppointments.pdfColumns.location"),
              key: "location",
            },
            {
              title: t("patient:myAppointments.pdfColumns.status"),
              key: "status",
            },
          ],
          data: mockAppointments,
          fileName: "mis-citas",
          title: t("patient:myAppointments.pdfTitle"),
          subtitle: t("patient:myAppointments.pdfSubtitle"),
        });
        setIsLoading(false);
      }}
    />
  );

  const filterComponent = (
    <MCFilterPopover
      activeFiltersCount={getActiveFiltersCount()}
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
        onChange={(value: string) => setSearchTerm(value)}
      />
    </div>
  );

  // Componente principal con ambas secciones
  const tableComponent = (
    <div className="space-y-8 bg-background">
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
