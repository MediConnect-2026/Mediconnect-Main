import * as React from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Star, Ellipsis } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/shared/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import MCServicesStatus from "@/shared/components/tables/MCServicesStatus";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import StaffActions from "../StaffActions";

const PAGE_SIZE = 15;

interface StaffMember {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  yearsOfExperience: number;
  languages: string[];
  insuranceAccepted: string[];
  isFavorite: boolean;
  urlImage: string;
  joinDate: string;
  totalAppointments: number;
  status: "active" | "inactive";
}

interface StaffTableProps {
  staffData?: StaffMember[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StaffTable({ staffData = [] }: StaffTableProps) {
  const { t } = useTranslation("center");
  const isMobile = useIsMobile();
  const [page, setPage] = React.useState(1);

  const languageLabels: Record<string, string> = {
    es: t("staff.languages.es"),
    en: t("staff.languages.en"),
    fr: t("staff.languages.fr"),
    it: t("staff.languages.it"),
    pt: t("staff.languages.pt"),
    de: t("staff.languages.de"),
    ja: t("staff.languages.ja"),
    ko: t("staff.languages.ko"),
    zh: t("staff.languages.zh"),
    ru: t("staff.languages.ru"),
    ar: t("staff.languages.ar"),
  };

  const totalPages = Math.ceil(staffData.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = staffData.slice(startIndex, endIndex);

  React.useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(1);
  }, [page, totalPages]);

  const formatLanguages = (languages: string[]) => {
    return languages.map((lang) => languageLabels[lang] || lang).join(", ");
  };

  return (
    <TooltipProvider>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className={`min-w-[220px] ${isMobile ? "text-xs" : ""}`}
              >
                {t("staff.table.doctor")}
              </TableHead>
              <TableHead
                className={`min-w-[140px] ${isMobile ? "text-xs" : ""}`}
              >
                {t("staff.table.specialty")}
              </TableHead>
              <TableHead
                className={`min-w-[120px] ${isMobile ? "text-xs" : ""}`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{t("staff.table.rating")}</span>
                </div>
              </TableHead>
              <TableHead
                className={`min-w-[100px] ${isMobile ? "text-xs" : ""}`}
              >
                {t("staff.table.experience")}
              </TableHead>
              <TableHead
                className={`min-w-[150px] ${isMobile ? "text-xs" : ""}`}
              >
                {t("staff.table.languages")}
              </TableHead>
              <TableHead
                className={`min-w-[130px] ${isMobile ? "text-xs" : ""}`}
              >
                {t("staff.table.connectionDate")}
              </TableHead>
              <TableHead
                className={`min-w-[100px] ${isMobile ? "text-xs" : ""}`}
              >
                {t("staff.table.appointments")}
              </TableHead>
              <TableHead
                className={`min-w-[100px] ${isMobile ? "text-xs" : ""}`}
              >
                {t("staff.table.status")}
              </TableHead>
              <TableHead
                className={`min-w-[80px] ${isMobile ? "text-xs" : ""}`}
              >
                {t("staff.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((staff) => (
                <TableRow
                  key={staff.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`${isMobile ? "h-12 w-12" : "h-16 w-16"} relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center`}
                      >
                        <Avatar
                          className={`${isMobile ? "h-12 w-12" : "h-16 w-16"} rounded-full overflow-hidden`}
                        >
                          <AvatarImage
                            src={staff.urlImage}
                            alt={staff.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {getInitials(staff.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <span
                        className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                      >
                        {staff.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div
                      className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                    >
                      {staff.specialty}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                      >
                        {staff.rating}
                      </span>
                      <Star
                        size={isMobile ? 14 : 16}
                        fill="#F7B500"
                        className="text-yellow-400"
                      />
                    </div>
                  </TableCell>

                  <TableCell
                    className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
                  >
                    {staff.yearsOfExperience} {t("staff.table.years")}
                  </TableCell>

                  <TableCell>
                    {staff.languages.length > 2 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={`cursor-pointer underline ${isMobile ? "text-xs" : "text-sm"}`}
                          >
                            {formatLanguages(staff.languages.slice(0, 2))} +
                            {staff.languages.length - 2}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium">
                              {t("staff.table.allLanguages")}
                            </span>
                            <span className="text-xs">
                              {formatLanguages(staff.languages)}
                            </span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className={isMobile ? "text-xs" : "text-sm"}>
                        {formatLanguages(staff.languages)}
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div
                      className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                    >
                      {formatDate(staff.joinDate)}
                    </div>
                  </TableCell>

                  <TableCell
                    className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                  >
                    {staff.totalAppointments}
                  </TableCell>

                  <TableCell>
                    <MCServicesStatus
                      variant="default"
                      status={staff.status === "active" ? "active" : "inactive"}
                    />
                  </TableCell>

                  <TableCell>
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
                            id: staff.id,
                            name: staff.name,
                            status: staff.status,
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className={`text-center ${isMobile ? "text-xs" : ""}`}
                >
                  {t("staff.table.noStaff")}
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
    </TooltipProvider>
  );
}

export default StaffTable;
