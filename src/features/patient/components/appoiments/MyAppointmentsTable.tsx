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

export interface Appointment {
  id: string;
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

interface MyAppointmentsTableProps {
  data: Appointment[];
}

const PAGE_SIZE = 5;

const truncate = (text: string | undefined, maxLength: number = 30): string => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export function MyAppointmentsTable({ data }: MyAppointmentsTableProps) {
  const { t } = useTranslation("patient");
  const [page, setPage] = React.useState(1);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = data.slice(startIndex, endIndex);

  // Reset page if data changes and current page is out of bounds
  React.useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [data.length, page, totalPages]);

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">
              {t("appointments.table.doctor")}
            </TableHead>
            <TableHead className="w-[200px]">
              {t("appointments.table.evaluation")}
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
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={row.doctorAvatar}
                        alt={row.doctorName}
                      />
                      <AvatarFallback>
                        {row.doctorName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{row.doctorName}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.doctorSpecialty}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="w-[200px]">
                  <div className="font-medium">{row.evaluationType}</div>
                  {row.description && row.description.length > 30 ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-xs text-muted-foreground cursor-help">
                            {truncate(row.description)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{row.description}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : row.description ? (
                    <div className="text-xs text-muted-foreground">
                      {row.description}
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
                  <Button variant="ghost" size="icon">
                    <Ellipsis className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
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
