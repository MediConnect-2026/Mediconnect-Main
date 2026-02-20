import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MyAppointmentTable from "../components/appointments/MyAppointmentTable";
import MCTablesLayouts from "@/shared/components/tables/MCTablesLayouts";
import MCPDFButton from "@/shared/components/forms/MCPDFButton";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import MCGeneratePDF from "@/shared/components/MCGeneratePDF";
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
} from "lucide-react";
import FilterMyAppointments from "../components/filters/FilterMyAppoinments";

// Import the Appointment type
import type { Appointment } from "../components/appointments/MyAppointmentTable";

const mockAppointments: Appointment[] = [
  {
    id: "1",
    doctorId: "doc-1",
    patientName: "Francisco Madera",
    patientImage: "https://randomuser.me/api/portraits/men/1.jpg",
    service: "Consulta general",
    specialty: "Medicina Familiar",
    date: "11/10/2025",
    time: "10:00 AM – 10:45 AM",
    phone: "809-432-9532",
    email: "francisco.m@correo.com",
    appointmentType: "in_person",
    location: "Clínica Santo Domingo",
    status: "pending",
  },
  {
    id: "2",
    doctorId: "doc-2",
    patientName: "Emmanuel Jimenez",
    patientImage: "https://randomuser.me/api/portraits/men/2.jpg",
    service: "Evaluación de seguimiento",
    specialty: "Cardiología",
    date: "11/10/2025",
    time: "11:30 AM – 12:15 PM",
    phone: "809-432-9532",
    email: "emmanuelj@correo.com",
    appointmentType: "virtual",
    location: "N/A",
    status: "in_progress",
  },
  {
    id: "3",
    doctorId: "doc-3",
    patientName: "Derek Hernandez",
    patientImage: "https://randomuser.me/api/portraits/men/3.jpg",
    service: "Control de presión",
    specialty: "Medicina Interna",
    date: "11/10/2025",
    time: "1:00 PM – 1:30 PM",
    phone: "809-432-9532",
    email: "derekh@correo.com",
    appointmentType: "in_person",
    location: "Clínica Santo Domingo",
    status: "completed",
  },
  {
    id: "4",
    doctorId: "doc-4",
    patientName: "Jackson Martinez",
    patientImage: "https://randomuser.me/api/portraits/men/4.jpg",
    service: "Rehabilitación post-lesión",
    specialty: "Fisioterapia",
    date: "12/10/2025",
    time: "9:00 AM – 9:45 AM",
    phone: "809-432-9532",
    email: "jacksonm@correo.com",
    appointmentType: "virtual",
    location: "N/A",
    status: "scheduled",
  },
  {
    id: "5",
    doctorId: "doc-5",
    patientName: "Gabriela Melo",
    patientImage: "https://randomuser.me/api/portraits/women/5.jpg",
    service: "Plan nutricional",
    specialty: "Nutrición",
    date: "12/10/2025",
    time: "2:00 PM – 2:40 PM",
    phone: "809-432-9532",
    email: "gabrielam@correo.com",
    appointmentType: "in_person",
    location: "Clínica Santo Domingo",
    status: "in_progress",
  },
  {
    id: "6",
    doctorId: "doc-6",
    patientName: "Juan Olivo",
    patientImage: "https://randomuser.me/api/portraits/men/6.jpg",
    service: "Sesión de fisioterapia",
    specialty: "Fisioterapia",
    date: "13/10/2025",
    time: "11:00 AM – 11:45 AM",
    phone: "809-432-9532",
    email: "juanolivo@correo.com",
    appointmentType: "in_person",
    location: "Clínica Santo Domingo",
    status: "cancelled",
  },
  {
    id: "7",
    doctorId: "doc-7",
    patientName: "María Santos",
    patientImage: "https://randomuser.me/api/portraits/women/7.jpg",
    service: "Consulta general",
    specialty: "Medicina Familiar",
    date: "14/10/2025",
    time: "3:00 PM – 3:45 PM",
    phone: "809-432-9532",
    email: "maria.santos@correo.com",
    appointmentType: "virtual",
    location: "N/A",
    status: "pending",
  },
];

function AppointmentsPage() {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    appointmentType: "all",
    specialty: "all",
    service: "all",
    dateRange: undefined as [Date, Date] | undefined, // Actualizado
  });

  // Contar filtros activos
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "dateRange") {
      return value !== undefined;
    }
    return value !== "all" && value !== "";
  }).length;

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      status: "all",
      appointmentType: "all",
      specialty: "all",
      service: "all",
      dateRange: undefined,
    });
  };

  // Función auxiliar para parsear fecha
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  // Función para filtrar por rango de fechas personalizado
  const matchesCustomDateRange = (
    dateStr: string,
    range?: [Date, Date],
  ): boolean => {
    if (!range) return true;

    const appointmentDate = parseDate(dateStr);
    appointmentDate.setHours(0, 0, 0, 0);

    const startDate = new Date(range[0]);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(range[1]);
    endDate.setHours(23, 59, 59, 999);

    return appointmentDate >= startDate && appointmentDate <= endDate;
  };

  // Filtrar citas
  const filteredAppointments = useMemo(() => {
    return mockAppointments.filter((appointment) => {
      // Búsqueda por texto
      const matchesSearch =
        appointment.patientName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtros
      const matchesStatus =
        filters.status === "all" || appointment.status === filters.status;
      const matchesType =
        filters.appointmentType === "all" ||
        appointment.appointmentType === filters.appointmentType;
      const matchesSpecialty =
        filters.specialty === "all" ||
        appointment.specialty
          .toLowerCase()
          .includes(filters.specialty.replace("-", " "));
      const matchesService =
        filters.service === "all" ||
        appointment.service
          .toLowerCase()
          .includes(filters.service.replace("-", " "));
      const matchesDate = matchesCustomDateRange(
        appointment.date,
        filters.dateRange,
      );

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesSpecialty &&
        matchesService &&
        matchesDate
      );
    });
  }, [searchTerm, filters]);

  // Search input
  const searchComponent = (
    <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
      <MCFilterInput
        placeholder={t("appointments.searchPlaceholder")}
        value={searchTerm}
        onChange={setSearchTerm}
      />
    </div>
  );

  // PDF generator
  const pdfGeneratorComponent = (
    <MCPDFButton
      onClick={async () => {
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
      }}
    />
  );

  const filterComponent = (
    <MCFilterPopover
      activeFiltersCount={activeFiltersCount}
      onClearFilters={clearFilters}
    >
      <FilterMyAppointments
        filters={filters}
        onFiltersChange={(newFilters) =>
          setFilters((prev) => ({ ...prev, ...newFilters }))
        }
      />
    </MCFilterPopover>
  );

  // Empty state
  const emptyState = (
    <Empty>
      <EmptyHeader>
        <div className="flex flex-col items-center gap-2">
          <span className="flex items-center justify-center gap-2 text-primary">
            {activeFiltersCount > 0 ? (
              <Filter className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            ) : (
              <CalendarX className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            )}
            <EmptyTitle
              className={`font-semibold ${isMobile ? "text-lg" : "text-xl"}`}
            >
              {activeFiltersCount > 0
                ? t("appointments.empty.noResults")
                : t("appointments.empty.noAppointments")}
            </EmptyTitle>
          </span>
          <EmptyDescription
            className={`text-muted-foreground text-center max-w-md mx-auto ${
              isMobile ? "text-sm" : "text-base"
            }`}
          >
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
  );

  // Tabla con empty state
  const tableComponent =
    filteredAppointments.length === 0 ? (
      emptyState
    ) : (
      <MyAppointmentTable appointments={filteredAppointments} />
    );

  // Métricas
  const metrics = [
    {
      title: t("appointments.metrics.total"),
      value: mockAppointments.length,
      subtitle: t("appointments.metrics.totalSubtitle"),
      icon: <Calendar />,
    },
    {
      title: t("appointments.metrics.pending"),
      value: mockAppointments.filter((a) => a.status === "pending").length,
      subtitle: t("appointments.metrics.pendingSubtitle"),
      icon: <Clock />,
    },
    {
      title: t("appointments.metrics.cancelled"),
      value: mockAppointments.filter((a) => a.status === "cancelled").length,
      subtitle: t("appointments.metrics.cancelledSubtitle"),
      icon: <XCircle />,
    },
    {
      title: t("appointments.metrics.completed"),
      value: mockAppointments.filter((a) => a.status === "completed").length,
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
    />
  );
}

export default AppointmentsPage;
