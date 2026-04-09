import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Ellipsis, CalendarX, AlertCircle, Loader2 } from "lucide-react";
import MCAppointmentsStatus from "@/shared/components/tables/MCAppointmentsStatus";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import AppointmentActions from "@/features/patient/components/appoiments/AppointmentActions";
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
} from "@/shared/ui/empty";
import { useDoctorAppointments } from "@/lib/hooks/useDoctorAppointments";
import type { CitaDetalle, CitasFilters } from "@/types/AppointmentTypes";
import {
  formatTimeTo12h,
  isVirtualModality,
  mapCitaEstadoToAppointmentStatus,
} from "@/utils/appointmentMapper";
import type { Appointment } from "../appointments/MyAppointmentTable";

const PAGE_SIZE = 5;

type DashboardAppointmentRow = Pick<Appointment, "id" | "doctorId" | "appointmentType" | "status"> & {
  name: string;
  service: string;
  type: string;
  date: string;
  contact: string;
  specialty: string;
  time: string;
  avatar?: string;
};

const mapCitaToDashboardRow = (
  cita: CitaDetalle,
  t: (key: string) => string
): DashboardAppointmentRow => {
  const startTime = formatTimeTo12h(cita.horaInicio) || cita.horaInicio.slice(0, 5);
  const endTime = formatTimeTo12h(cita.horaFin) || cita.horaFin.slice(0, 5);
  const isVirtual = isVirtualModality(cita.modalidad);

  return {
    id: cita.id.toString(),
    name: `${cita.paciente.nombre} ${cita.paciente.apellido}`,
    status: mapCitaEstadoToAppointmentStatus(cita.estado),
    service: cita.servicio.nombre,
    type: isVirtual
      ? t("appointments.table.virtual")
      : t("appointments.table.inPerson"),
    appointmentType: isVirtual ? "virtual" : "in_person",
    doctorId: cita.doctorId?.toString() || "",
    date: cita.fechaInicio,
    contact: cita.paciente.usuario.email || "N/A",
    specialty: cita.servicio.especialidad.nombre,
    time: endTime ? `${startTime} - ${endTime}` : startTime,
    avatar: cita.paciente.usuario.fotoPerfil || undefined,
  };
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function DashboardTable() {
  const { t } = useTranslation("doctor");
  const { i18n } = useTranslation();
  const [page, setPage] = useState(1);

  const filters = useMemo<CitasFilters>(
    () => ({
      pagina: page,
      limite: PAGE_SIZE,
      source: i18n.language === "es" ? "en" : "es",
      target: i18n.language === "es" ? "es" : "en",
      translate_fields: "servicio.especialidad.nombre, nombre",
    }),
    [i18n.language, page]
  );

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isPlaceholderData,
    error,
  } = useDoctorAppointments(filters);

  // true solo durante la transición entre páginas (datos anteriores visibles)
  const isChangingPage = isFetching && isPlaceholderData;

  const rows = useMemo(() => {
    if (!apiResponse?.data) return [];
    const list = Array.isArray(apiResponse.data)
      ? apiResponse.data
      : [apiResponse.data];
    return list.map((cita) => mapCitaToDashboardRow(cita, t));
  }, [apiResponse?.data, t]);

  const totalPages = apiResponse?.paginacion?.totalPaginas || 1;

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [page, totalPages]);

  const handlePreviousPage = useCallback(() => {
    if (page > 1 && !isChangingPage) {
      setPage((currentPage) => Math.max(1, currentPage - 1));
    }
  }, [isChangingPage, page]);

  const handleNextPage = useCallback(() => {
    if (page < totalPages && !isChangingPage) {
      setPage((currentPage) => Math.min(totalPages, currentPage + 1));
    }
  }, [isChangingPage, page, totalPages]);

  const handlePageClick = useCallback(
    (targetPage: number) => {
      if (!isChangingPage) {
        setPage(targetPage);
      }
    },
    [isChangingPage]
  );

  return (
    // Flex column: tabla hace scroll, paginación se queda abajo
    <div className="flex flex-col h-full min-h-0">
      {/* Scrollable table area */}
      <div className="flex-1 overflow-auto min-h-0 relative">
        {/* Overlay sutil mientras cambia de página (datos anteriores visibles) */}
        {isChangingPage && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-md">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead>{t("appointments.table.patient")}</TableHead>
              <TableHead>{t("appointments.table.status")}</TableHead>
              <TableHead>{t("appointments.table.service")}</TableHead>
              <TableHead>{t("appointments.table.type")}</TableHead>
              <TableHead>{t("appointments.table.schedule")}</TableHead>
              <TableHead>{t("appointments.table.contact")}</TableHead>
              <TableHead>{t("appointments.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <Empty>
                    <EmptyHeader>
                      <div className="flex flex-col items-center gap-2 py-8">
                        <span className="flex items-center justify-center gap-2 text-destructive">
                          <AlertCircle className="w-6 h-6" />
                          <EmptyTitle className="text-lg font-semibold">
                            {t("common.error")}
                          </EmptyTitle>
                        </span>
                        <EmptyDescription className="text-muted-foreground text-center max-w-md mx-auto">
                          {t("appointments.empty.loadError")}
                        </EmptyDescription>
                        <Button variant="outline" onClick={() => window.location.reload()} size="sm">
                          {t("common.retry")}
                        </Button>
                      </div>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-[400px]">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {t("common.loading")}...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <Empty>
                    <EmptyHeader>
                      <div className="flex flex-col items-center gap-2">
                        <span className="flex items-center justify-center gap-2 text-primary">
                          <CalendarX className="w-7 h-7" />
                          <EmptyTitle className="text-xl font-semibold">
                            {t("appointments.empty.noAppointments")}
                          </EmptyTitle>
                        </span>
                        <EmptyDescription className="text-muted-foreground text-center max-w-md mx-auto">
                          {t("appointments.empty.noAppointmentsDescription")}
                        </EmptyDescription>
                      </div>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {a.avatar ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={a.avatar} alt={a.name} />
                          <AvatarFallback>{getInitials(a.name)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <MCUserAvatar
                          name={a.name}
                          square={false}
                          size={32}
                          className="h-8 w-8"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{a.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {a.specialty}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <MCAppointmentsStatus
                      status={
                        a.status as
                        | "pending"
                        | "in_progress"
                        | "completed"
                        | "scheduled"
                        | "cancelled"
                      }
                    />
                  </TableCell>
                  <TableCell>{a.service}</TableCell>
                  <TableCell>{a.type}</TableCell>
                  <TableCell>
                    <div>{a.date}</div>
                    <div className="text-xs text-muted-foreground">{a.time}</div>
                  </TableCell>
                  <TableCell>{a.contact}</TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-bg-btn-secondary p-2 w-fit h-fit m-0 rounded-full transition-colors hover:bg-primary/10 active:bg-primary/20 group"
                        >
                          <Ellipsis className="h-4 w-4 text-primary group-hover:text-primary/80 group-active:text-primary/60" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent isTablet placement="left">
                        <AppointmentActions
                          appointment={{
                            id: a.id,
                            doctorId: a.doctorId,
                            appointmentType: a.appointmentType as
                              | "in_person"
                              | "virtual",
                            status: a.status,
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination anchored to bottom — always visible */}
      {totalPages > 1 && !isLoading && (
        <div className="flex-shrink-0 border-t px-4 py-5">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePreviousPage}
                  className={
                    page === 1 || isChangingPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    onClick={() => handlePageClick(i + 1)}
                    className={
                      isChangingPage ? "pointer-events-none opacity-50" : "cursor-pointer"
                    }
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={handleNextPage}
                  className={
                    page === totalPages || isChangingPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

export default DashboardTable;