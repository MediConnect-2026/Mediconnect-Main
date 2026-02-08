import * as React from "react";
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
import { Ellipsis, CalendarX } from "lucide-react";
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
  EmptyContent,
} from "@/shared/ui/empty";
const PAGE_SIZE = 10;

const appointments = [
  {
    id: "1",
    name: "Armando Balcacer",
    status: "pending",
    service: "Consulta general",
    type: "Presencial",
    appointmentType: "in_person",
    doctorId: "doc-1",
    date: "10 de Oct, 2025",
    contact: "809-432-9532",
    specialty: "Medicina interna",
    time: "3:00 PM - 4:00 PM",
    avatar: "",
  },
  {
    id: "2",
    name: "Roamel Cabral",
    status: "in_progress",
    service: "Consulta general",
    type: "Virtual",
    appointmentType: "virtual",
    doctorId: "doc-1",
    date: "10 de Oct, 2025",
    contact: "809-432-9532",
    specialty: "Medicina interna",
    time: "3:00 PM - 4:00 PM",
  },
  {
    id: "3",
    name: "Juan Capellan",
    status: "completed",
    service: "Consulta general",
    type: "Presencial",
    appointmentType: "in_person",
    doctorId: "doc-1",
    date: "10 de Oct, 2025",
    contact: "809-432-9532",
    specialty: "Medicina interna",
    time: "3:00 PM - 4:00 PM",
  },
  {
    id: "4",
    name: "Ashli Cuevas",
    status: "scheduled",
    service: "Consulta general",
    type: "Virtual",
    appointmentType: "virtual",
    doctorId: "doc-1",
    date: "10 de Oct, 2025",
    contact: "809-432-9532",
    specialty: "Medicina interna",
    time: "3:00 PM - 4:00 PM",
  },
  {
    id: "5",
    name: "Francis Miguel",
    status: "cancelled",
    service: "Consulta general",
    type: "Presencial",
    appointmentType: "in_person",
    doctorId: "doc-1",
    date: "10 de Oct, 2025",
    contact: "809-432-9532",
    specialty: "Medicina interna",
    time: "3:00 PM - 4:00 PM",
  },
  {
    id: "6",
    name: "Eduardo Grau",
    status: "in_progress",
    service: "Consulta general",
    type: "Presencial",
    appointmentType: "in_person",
    doctorId: "doc-1",
    date: "10 de Oct, 2025",
    contact: "809-432-9532",
    specialty: "Medicina interna",
    time: "3:00 PM - 4:00 PM",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function DashboardTable() {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.ceil(appointments.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = appointments.slice(startIndex, endIndex);

  React.useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [appointments.length, page, totalPages]);

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Horario</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <Empty>
                  <EmptyHeader>
                    <div className="flex flex-col items-center gap-2">
                      <span className="flex items-center justify-center gap-2 text-primary">
                        <CalendarX className="w-7 h-7" />
                        <EmptyTitle className="text-xl font-semibold">
                          No hay citas registradas
                        </EmptyTitle>
                      </span>
                      <EmptyDescription className="text-muted-foreground text-center max-w-md mx-auto">
                        No se encontraron citas para mostrar en esta sección.
                      </EmptyDescription>
                    </div>
                  </EmptyHeader>
                  <EmptyContent>
                    <div className="flex flex-col items-center gap-3">
                      <Button
                        onClick={() => {
                          /* lógica para agendar cita */
                        }}
                        className="px-6 py-2"
                        size="sm"
                      >
                        Agendar nueva cita
                      </Button>
                    </div>
                  </EmptyContent>
                </Empty>
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((a) => (
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
                          appointmentType: a.appointmentType as "in_person" | "virtual",
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
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={
                  page === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={
                  page === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default DashboardTable;
