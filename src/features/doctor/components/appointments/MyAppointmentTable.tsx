import * as React from "react";
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
import { Ellipsis } from "lucide-react";
import MCAppointmentsStatus from "@/shared/components/tables/MCAppointmentsStatus";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/shared/ui/pagination";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import AppointmentActions from "@/features/patient/components/appoiments/AppointmentActions";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";

export interface Appointment {
  id: string;
  doctorId: string;
  patientName: string;
  patientImage?: string;
  service: string;
  specialty: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  appointmentType: "virtual" | "in_person";
  location?: string;
  status: "scheduled" | "pending" | "in_progress" | "completed" | "cancelled";
}

interface MyAppointmentTableProps {
  appointments: Appointment[];
}

const PAGE_SIZE = 10;

const truncate = (text: string | undefined, maxLength: number = 30): string => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export default function MyAppointmentTable({
  appointments,
}: MyAppointmentTableProps) {
  const { t } = useTranslation("doctor");
  const [page, setPage] = React.useState(1);

  const totalPages = Math.ceil(appointments.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = appointments.slice(startIndex, endIndex);

  // Reset page if data changes and current page is out of bounds
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
            <TableHead className="w-[250px]">
              {t("appointments.table.patient")}
            </TableHead>
            <TableHead className="w-[200px]">
              {t("appointments.table.serviceSpecialty")}
            </TableHead>
            <TableHead className="w-[180px]">
              {t("appointments.table.contact")}
            </TableHead>
            <TableHead className="w-[150px]">
              {t("appointments.table.date")}
            </TableHead>
            <TableHead className="w-[180px]">
              {t("appointments.table.typeLocation")}
            </TableHead>
            <TableHead className="w-[120px]">
              {t("appointments.table.status")}
            </TableHead>
            <TableHead className="w-[80px]">
              {t("appointments.table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="w-[250px]">
                  <div className="flex items-center gap-2">
                    <div className="h-16 w-16 relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center">
                      {row.patientImage ? (
                        <Avatar className="h-16 w-16 rounded-full overflow-hidden">
                          <AvatarImage
                            src={row.patientImage}
                            alt={row.patientName}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {row.patientName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <MCUserAvatar
                          name={row.patientName}
                          square
                          size={64}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{row.patientName}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="w-[200px]">
                  <div className="font-medium">{row.service}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.specialty}
                  </div>
                </TableCell>
                <TableCell className="w-[180px]">
                  <div className="font-medium">{row.phone}</div>
                  {row.email && row.email.length > 30 ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-xs text-muted-foreground cursor-help">
                            {truncate(row.email)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{row.email}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : row.email ? (
                    <div className="text-xs text-muted-foreground">
                      {row.email}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="w-[150px]">
                  <div className="font-medium">{row.date}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.time}
                  </div>
                </TableCell>
                <TableCell className="w-[180px]">
                  {row.appointmentType === "virtual" ? (
                    t("appointments.table.virtual")
                  ) : (
                    <>
                      {t("appointments.table.inPerson")}
                      {row.location && (
                        <div className="text-xs text-muted-foreground">
                          {row.location}
                        </div>
                      )}
                    </>
                  )}
                </TableCell>
                <TableCell className="w-[120px]">
                  <MCAppointmentsStatus status={row.status} />
                </TableCell>
                <TableCell className="w-[80px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-bg-btn-secondary rounded-full transition-colors hover:bg-primary/10 active:bg-primary/20 group"
                      >
                        <Ellipsis className="h-4 w-4 text-primary group-hover:text-primary/80 group-active:text-primary/60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent isTablet placement="left">
                      <AppointmentActions appointment={row} />
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                {t("appointments.table.noAppointments")}
              </TableCell>
            </TableRow>
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
