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
import { Ellipsis, UserX, Star } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import StaffActions from "../StaffActions";
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

const PAGE_SIZE = 10;

const medicalStaff = [
  {
    id: "1",
    name: "Dra. María González",
    specialty: "Dermatología",
    connectionDate: "23 de oct de 2025",
    totalAppointments: 130,
    rating: 4.8,
    status: "active",
    avatar: "",
  },
  {
    id: "2",
    name: "Dr. Carlos Rodríguez",
    specialty: "Cardiología",
    connectionDate: "15 de sep de 2025",
    totalAppointments: 98,
    rating: 4.9,
    status: "active",
    avatar: "",
  },
  {
    id: "3",
    name: "Dra. Ana Martínez",
    specialty: "Pediatría",
    connectionDate: "10 de ago de 2025",
    totalAppointments: 156,
    rating: 4.7,
    status: "inactive",
    avatar: "",
  },
  {
    id: "4",
    name: "Dr. Luis Fernández",
    specialty: "Neurología",
    connectionDate: "5 de jul de 2025",
    totalAppointments: 87,
    rating: 4.6,
    status: "active",
    avatar: "",
  },
  {
    id: "5",
    name: "Dra. Carmen López",
    specialty: "Medicina Interna",
    connectionDate: "2 de jun de 2025",
    totalAppointments: 142,
    rating: 4.9,
    status: "active",
    avatar: "",
  },
];

const MONTHS_ES: Record<string, number> = {
  ene: 0,
  feb: 1,
  mar: 2,
  abr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dic: 11,
};

function parseSpanishDate(dateStr: string): Date | null {
  const match = dateStr.match(/(\d{1,2})\s+de\s+(\w{3,})\s+de\s+(\d{4})/i);
  if (!match) return null;
  const [, day, monthStr, year] = match;
  const month = MONTHS_ES[monthStr.toLowerCase().slice(0, 3)];
  if (month === undefined) return null;
  return new Date(Number(year), month, Number(day));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

interface StaffTableProps {
  searchTerm?: string;
  filters?: {
    specialty: string;
    rating: string;
    joinDate: { from: Date | null; to: Date | null };
  };
  onClearFilters?: () => void;
  onClearSearch?: () => void;
}

function StaffTable({
  searchTerm = "",
  filters,
  onClearFilters,
  onClearSearch,
}: StaffTableProps) {
  const { t } = useTranslation("center");
  const [page, setPage] = React.useState(1);

  const filteredData = React.useMemo(() => {
    return medicalStaff.filter((doctor) => {
      const matchesSearch = doctor.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (!filters) return matchesSearch;

      const matchesSpecialty =
        !filters.specialty ||
        doctor.specialty
          .toLowerCase()
          .includes(filters.specialty.toLowerCase());

      const matchesRating =
        !filters.rating ||
        filters.rating === "0" ||
        doctor.rating >= parseFloat(filters.rating);

      let matchesDate = true;
      if (filters.joinDate.from || filters.joinDate.to) {
        const doctorDate = parseSpanishDate(doctor.connectionDate);
        if (doctorDate) {
          if (filters.joinDate.from) {
            const from = new Date(filters.joinDate.from);
            from.setHours(0, 0, 0, 0);
            matchesDate = matchesDate && doctorDate >= from;
          }
          if (filters.joinDate.to) {
            const to = new Date(filters.joinDate.to);
            to.setHours(23, 59, 59, 999);
            matchesDate = matchesDate && doctorDate <= to;
          }
        } else {
          matchesDate = false;
        }
      }

      return matchesSearch && matchesSpecialty && matchesRating && matchesDate;
    });
  }, [searchTerm, filters]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  React.useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [filteredData.length, page, totalPages]);

  const activeFiltersCount = filters
    ? (filters.specialty ? 1 : 0) +
      (filters.rating && filters.rating !== "0" ? 1 : 0) +
      (filters.joinDate.from || filters.joinDate.to ? 1 : 0)
    : 0;

  if (filteredData.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <div className="flex flex-col items-center gap-2">
            <span className="flex items-center justify-center gap-2 text-primary">
              <UserX className="w-7 h-7" />
              <EmptyTitle className="text-xl font-semibold">
                {activeFiltersCount > 0 || searchTerm
                  ? "No se encontraron médicos"
                  : "No hay médicos registrados"}
              </EmptyTitle>
            </span>
            <EmptyDescription className="text-muted-foreground text-center max-w-md mx-auto">
              {activeFiltersCount > 0 || searchTerm
                ? "No hay médicos que coincidan con los criterios de búsqueda."
                : "No tienes médicos conectados a tu centro médico aún."}
            </EmptyDescription>
          </div>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-col items-center gap-3">
            {activeFiltersCount > 0 || searchTerm ? (
              <MCButton
                variant="outline"
                onClick={() => {
                  onClearFilters?.();
                  onClearSearch?.();
                }}
                className="px-6 py-2"
                size="sm"
              >
                Limpiar filtros
              </MCButton>
            ) : (
              <Button
                onClick={() => {
                  /* lógica para invitar médico */
                }}
                className="px-6 py-2"
                size="sm"
              >
                Invitar Médico
              </Button>
            )}
          </div>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Doctor</TableHead>
            <TableHead className="w-[200px]">Especialidad</TableHead>
            <TableHead className="w-[150px]">Fecha Conexión</TableHead>
            <TableHead className="w-[120px]">
              <div className="flex items-center justify-center gap-1">
                <span>Calificación</span>
              </div>
            </TableHead>
            <TableHead className="w-[80px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((doctor) => (
            <TableRow key={doctor.id}>
              <TableCell className="w-[250px]">
                <div className="flex items-center gap-2">
                  <div className="h-16 w-16 relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center">
                    {doctor.avatar ? (
                      <Avatar className="h-16 w-16 rounded-full overflow-hidden">
                        <AvatarImage
                          src={doctor.avatar}
                          alt={doctor.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {doctor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <MCUserAvatar
                        name={doctor.name}
                        square
                        size={64}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{doctor.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-[200px]">
                <div className="font-medium">{doctor.specialty}</div>
              </TableCell>
              <TableCell className="w-[150px]">
                <div className="font-medium">{doctor.connectionDate}</div>
              </TableCell>
              <TableCell className="w-[120px]">
                <div className="flex items-center justify-center gap-1">
                  <span className="font-medium">{doctor.rating}</span>
                  <Star
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                  />
                </div>
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
                    <StaffActions
                      doctor={{
                        id: doctor.id,
                        name: doctor.name,
                        status: doctor.status,
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
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

export default StaffTable;
