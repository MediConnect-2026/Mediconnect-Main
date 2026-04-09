import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Star } from "lucide-react";
import MCServicesStatus from "@/shared/components/tables/MCServicesStatus";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/shared/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useNavigate } from "react-router-dom";
import ServicesActions from "./ServicesActions";

const PAGE_SIZE = 15;

interface Service {
  id: string;
  servicio: string;
  especialidad: string;
  ubicacion: string | string[];
  modalidad: string;
  precio: string;
  duracion: string;
  rating: number;
  estado: string;
  imagen: string;
}

interface MyServicesTableProps {
  services?: Service[];
  onViewDetails?: (serviceId: string) => void;
  onEdit?: (serviceId: string) => void;
  onDeactivate?: (serviceId: string) => void;
  onActivate?: (serviceId: string) => void;
  onDelete?: (serviceId: string) => void;
}

function MyServicesTable({ services = [], onViewDetails, onEdit, onDeactivate, onActivate, onDelete }: MyServicesTableProps) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);

  // Handler wrappers: call the provided prop if present, otherwise fallback
  const handleView = (serviceId: string) => {
    if (onViewDetails) {
      onViewDetails(serviceId);
    } else {
      navigate(`/service/${serviceId}`);
    }
  };

  const handleEdit = (serviceId: string) => {
    if (onEdit) {
      onEdit(serviceId);
    } else {
      console.warn("⚠️ [MyServicesTable] onEdit callback not provided for service:", serviceId);
    }
  };

  const handleDeactivate = (serviceId: string) => {
    if (onDeactivate) {
      onDeactivate(serviceId);
    } else {
      console.warn("⚠️ [MyServicesTable] onDeactivate callback not provided for service:", serviceId);
    }
  };

  const handleActivate = (serviceId: string) => {
    if (onActivate) {
      onActivate(serviceId);
    } else {
      console.warn("⚠️ [MyServicesTable] onActivate callback not provided for service:", serviceId);
    }
  };

  const handleDelete = (serviceId: string) => {
    if (onDelete) {
      onDelete(serviceId);
    } else {
      console.warn("⚠️ [MyServicesTable] onDelete callback not provided for service:", serviceId);
    }
  };

  const totalPages = Math.ceil(services.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = services.slice(startIndex, endIndex);

  React.useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [page, totalPages]);

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("services.table.service")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("services.table.specialty")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("services.table.location")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("services.table.modality")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("services.table.price")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("services.table.duration")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("services.table.rating")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("services.table.status")}
            </TableHead>
            <TableHead className={isMobile ? "text-xs" : ""}>
              {t("services.table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {row.imagen ? (
                      <div
                        className={`${isMobile ? "h-12 w-12" : "h-16 w-16"} relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center`}
                      >
                        <Avatar
                          className={`${isMobile ? "h-12 w-12" : "h-16 w-16"} rounded-full overflow-hidden`}
                        >
                          <AvatarImage
                            src={row.imagen}
                            alt={row.servicio}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {row.servicio
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    ) : null}
                    <span
                      className={`font-medium ${isMobile ? "text-xs" : ""}`}
                    >
                      {row.servicio}
                    </span>
                  </div>
                </TableCell>
                <TableCell className={isMobile ? "text-xs" : ""}>
                  {row.especialidad}
                </TableCell>
                <TableCell className={isMobile ? "text-xs" : ""}>
                  {Array.isArray(row.ubicacion) ? (
                    row.ubicacion.length > 1 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="underline cursor-pointer">
                              {row.ubicacion[0]} +{row.ubicacion.length - 1}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="flex flex-col gap-1">
                              {row.ubicacion.map((u, idx) => (
                                <span key={idx} className="text-xs">
                                  {u}
                                </span>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span>{row.ubicacion[0]}</span>
                    )
                  ) : (
                    <span>{row.ubicacion}</span>
                  )}
                </TableCell>
                <TableCell className={isMobile ? "text-xs" : ""}>
                  {row.modalidad}
                </TableCell>
                <TableCell className={isMobile ? "text-xs" : ""}>
                  {row.precio}
                </TableCell>
                <TableCell className={isMobile ? "text-xs" : ""}>
                  {row.duracion}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Star
                      size={isMobile ? 14 : 16}
                      fill="#F7B500"
                      className="text-yellow-400 mb-0.5"
                    />
                    <span
                      className={`font-medium ${isMobile ? "text-xs" : ""}`}
                    >
                      {row.rating}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <MCServicesStatus
                    variant="default"
                    status={row.estado === "Activo" ? "active" : "inactive"}
                  />
                </TableCell>
                <TableCell>
                  <ServicesActions
                    status={row.estado === "Activo" ? "active" : "inactive"}
                    serviceId={row.id}
                    onView={() => handleView(row.id)}
                    onEdit={() => handleEdit(row.id)}
                    onDeactivate={() => handleDeactivate(row.id)}
                    onActivate={() => handleActivate(row.id)}
                    onDelete={() => handleDelete(row.id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={9}
                className={`text-center ${isMobile ? "text-xs" : ""}`}
              >
                {t("services.table.noServices")}
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

export default MyServicesTable;
