import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Filter, Loader2, UserX } from "lucide-react";
import MCTablesLayouts from "@/shared/components/tables/MCTablesLayouts";
import MCDoctorsCards from "@/shared/components/MCDoctorsCards";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/shared/ui/pagination";
import MCPDFButton from "@/shared/components/forms/MCPDFButton";
import MCGeneratePDF from "@/shared/components/MCGeneratePDF";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/shared/ui/empty";
import MCButton from "@/shared/components/forms/MCButton";
import MCToogle from "@/shared/components/forms/MCToogle";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import FullFilterStaff from "@/features/center/components/filters/FullFilterStaff";
import useCenterStaff from "@/features/center/hooks/useCenterStaff";
import { useDoctorAllianceDelete } from "@/features/search/hooks/useDoctorAllianceDelete";

import StaffTable from "../components/staff/StaffTable";

// Types
export type StaffFilters = {
  specialty: string | string[];
  rating: string | string[];
  languages: string | string[];
  experience: string | string[];
  status: string | string[];
  joinDate: { from: Date | null; to: Date | null };
};

const ITEMS_PER_PAGE = 8;

function StaffPage() {
  const { t } = useTranslation("center");
  const isMobile = useIsMobile();
  const { data: staffList = [], isLoading, isError, refetch, error } =
    useCenterStaff();
  const deleteAllianceMutation = useDoctorAllianceDelete();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [showCards, setShowCards] = useState(() => {
    try {
      const saved = localStorage.getItem("staffView");
      return saved ? saved === "card" : true;
    } catch {
      return true;
    }
  });

  const [filters, setFilters] = useState<StaffFilters>({
    specialty: [],
    rating: [],
    languages: [],
    experience: [],
    status: [],
    joinDate: { from: null, to: null },
  });

  const toArray = (val: string | string[]): string[] => {
    if (!val || (Array.isArray(val) && val.length === 0)) return [];
    return Array.isArray(val) ? val : [val];
  };

  const filteredStaff = useMemo(() => {
    const specialty = toArray(filters.specialty);
    const rating = toArray(filters.rating);
    const languages = toArray(filters.languages);
    const experience = toArray(filters.experience);
    const status = toArray(filters.status);

    return staffList
      .filter(
        (staff) =>
          staff.name.toLowerCase().includes(search.toLowerCase()) ||
          staff.specialty.toLowerCase().includes(search.toLowerCase()),
      )
      .filter((staff) => {
        if (specialty.length > 0 && !specialty.includes("all")) {
          const matchesBySpecialtyId = staff.specialtyIds.some((specialtyId) =>
            specialty.includes(specialtyId),
          );
          const matchesBySpecialtyName = specialty.includes(staff.specialty);

          if (!matchesBySpecialtyId && !matchesBySpecialtyName) return false;
        }

        if (
          rating.length > 0 &&
          !rating.includes("0") &&
          !rating.includes("all")
        ) {
          const minRating = Math.min(...rating.map((value) => parseFloat(value)));
          if (staff.rating < minRating) return false;
        }

        if (languages.length > 0 && !languages.includes("all")) {
          const hasCommonLanguage = staff.languages.some((lang) =>
            languages.includes(lang),
          );
          if (!hasCommonLanguage) return false;
        }

        if (experience.length > 0 && !experience.includes("all")) {
          const matchesExperience = experience.some((exp) => {
            switch (exp) {
              case "0-2":
                return (
                  staff.yearsOfExperience >= 0 && staff.yearsOfExperience <= 2
                );
              case "3-5":
                return (
                  staff.yearsOfExperience >= 3 && staff.yearsOfExperience <= 5
                );
              case "6-10":
                return (
                  staff.yearsOfExperience >= 6 && staff.yearsOfExperience <= 10
                );
              case "11-15":
                return (
                  staff.yearsOfExperience >= 11 && staff.yearsOfExperience <= 15
                );
              case "16-20":
                return (
                  staff.yearsOfExperience >= 16 && staff.yearsOfExperience <= 20
                );
              case "21-25":
                return (
                  staff.yearsOfExperience >= 21 && staff.yearsOfExperience <= 25
                );
              case "25+":
                return staff.yearsOfExperience > 25;
              default:
                return false;
            }
          });
          if (!matchesExperience) return false;
        }

        if (status.length > 0 && !status.includes("all")) {
          if (!status.includes(staff.status)) return false;
        }

        if (filters.joinDate.from) {
          const staffDate = new Date(staff.joinDate);
          const fromDate = new Date(filters.joinDate.from);
          fromDate.setHours(0, 0, 0, 0);
          if (staffDate < fromDate) return false;
        }

        if (filters.joinDate.to) {
          const staffDate = new Date(staff.joinDate);
          const toDate = new Date(filters.joinDate.to);
          toDate.setHours(23, 59, 59, 999);
          if (staffDate > toDate) return false;
        }

        return true;
      });
  }, [search, filters, staffList]);

  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [page, totalPages]);

  const paginatedStaff = filteredStaff.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  function getActiveFiltersCount() {
    let count = 0;
    const s = toArray(filters.specialty);
    const r = toArray(filters.rating);
    const l = toArray(filters.languages);
    const e = toArray(filters.experience);
    const st = toArray(filters.status);

    if (s.length > 0 && !s.includes("all")) count++;
    if (r.length > 0 && !r.includes("all") && !r.includes("0")) count++;
    if (l.length > 0 && !l.includes("all")) count++;
    if (e.length > 0 && !e.includes("all")) count++;
    if (st.length > 0 && !st.includes("all")) count++;
    if (filters.joinDate.from || filters.joinDate.to) count++;
    if (search.trim() !== "") count++;

    return count;
  }

  function resetFilters() {
    setFilters({
      specialty: [],
      rating: [],
      languages: [],
      experience: [],
      status: [],
      joinDate: { from: null, to: null },
    });
    setSearch("");
    setPage(1);
  }

  function updateFilters(newFilters: Partial<StaffFilters>) {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  }

  const handleDisconnectStaff = async (requestId: string) => {
    await deleteAllianceMutation.mutateAsync(requestId);
    await refetch();
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  const handleToggle = (val: string) => {
    setShowCards(val === "card");
    try {
      localStorage.setItem("staffView", val);
    } catch {}
  };

  const toggleView = (
    <MCToogle value={showCards ? "card" : "list"} onChange={handleToggle} />
  );

  const pdfGeneratorComponent = (
    <MCPDFButton
      onClick={async () => {
        setIsPdfLoading(true);
        await MCGeneratePDF({
          columns: [
            { title: t("staff.pdf.columnDoctor"), key: "name" },
            { title: t("staff.pdf.columnSpecialty"), key: "specialty" },
            { title: t("staff.pdf.columnRating"), key: "rating" },
            {
              title: t("staff.pdf.columnExperience"),
              key: "yearsOfExperience",
            },
            {
              title: t("staff.pdf.columnAppointments"),
              key: "totalAppointments",
            },
            { title: t("staff.pdf.columnConnectionDate"), key: "joinDate" },
          ],
          data: filteredStaff,
          fileName: t("staff.pdf.fileName"),
          title: t("staff.pdf.title"),
          subtitle: t("staff.pdf.subtitle"),
        });
        setIsPdfLoading(false);
      }}
      loading={isPdfLoading}
    />
  );

  const filterComponent = (
    <FullFilterStaff
      filters={filters}
      onFiltersChange={updateFilters}
      onClearFilters={resetFilters}
      activeFiltersCount={getActiveFiltersCount()}
    />
  );

  const searchComponent = (
    <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
      <MCFilterInput
        placeholder={t("staff.searchPlaceholder")}
        value={search}
        onChange={(value: string) => {
          setPage(1);
          setSearch(value);
        }}
      />
    </div>
  );

  const loadingComponent = (
    <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>{t("staff.loading")}</span>
    </div>
  );

  const errorComponent = (
    <Empty>
      <EmptyHeader>
        <div className="flex flex-col items-center gap-2 px-4">
          <span className="flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            <EmptyTitle
              className={`font-semibold ${isMobile ? "text-lg" : "text-xl"}`}
            >
              {t("staff.error.title")}
            </EmptyTitle>
          </span>
          <EmptyDescription
            className={`text-muted-foreground text-center max-w-md mx-auto ${
              isMobile ? "text-sm" : "text-base"
            }`}
          >
            {error?.message || t("staff.error.description")}
          </EmptyDescription>
        </div>
      </EmptyHeader>
      <EmptyContent>
        <MCButton variant="outline" onClick={() => refetch()} size="sm">
          {t("staff.error.retry")}
        </MCButton>
      </EmptyContent>
    </Empty>
  );

  const emptyComponent = (
    <Empty>
      <EmptyHeader>
        <div className="flex flex-col items-center gap-2 px-4">
          <span className="flex items-center justify-center gap-2 text-primary">
            {hasActiveFilters ? (
              <Filter className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            ) : (
              <UserX className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            )}
            <EmptyTitle
              className={`font-semibold ${isMobile ? "text-lg" : "text-xl"}`}
            >
              {hasActiveFilters
                ? t("staff.empty.noResults")
                : t("staff.empty.noStaff")}
            </EmptyTitle>
          </span>
          <EmptyDescription
            className={`text-muted-foreground text-center max-w-md mx-auto ${
              isMobile ? "text-sm" : "text-base"
            }`}
          >
            {hasActiveFilters
              ? t("staff.empty.noResultsDescription")
              : t("staff.empty.noStaffDescription")}
          </EmptyDescription>
        </div>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col items-center gap-3 px-4">
          {hasActiveFilters && (
            <MCButton
              variant="outline"
              onClick={resetFilters}
              className={isMobile ? "px-4 py-2" : "px-6 py-2"}
              size="sm"
            >
              {t("staff.clearFilters")}
            </MCButton>
          )}
        </div>
      </EmptyContent>
    </Empty>
  );

  const paginationComponent = totalPages > 1 && (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setPage(Math.max(1, page - 1))}
            className={
              page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (currentPage) => (
            <PaginationItem key={currentPage}>
              <PaginationLink
                onClick={() => setPage(currentPage)}
                isActive={page === currentPage}
                className="cursor-pointer"
              >
                {currentPage}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className={
              page === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  const tableComponent = isLoading ? (
    loadingComponent
  ) : isError ? (
    errorComponent
  ) : showCards ? (
    filteredStaff.length === 0 ? (
      emptyComponent
    ) : (
      <>
        <div
          className={`grid gap-4 ${
            isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {paginatedStaff.map((staff) => (
            <MCDoctorsCards
              key={staff.id}
              id={staff.doctorId}
              name={staff.name}
              specialty={staff.specialty}
              rating={staff.rating}
              yearsOfExperience={staff.yearsOfExperience}
              languages={staff.languages}
              insuranceAccepted={staff.insuranceAccepted}
              isFavorite={staff.isFavorite}
              urlImage={staff.urlImage}
              connectionStatus="connected"
              onConnect={() => handleDisconnectStaff(staff.id)}
              isConnectionSubmitting={deleteAllianceMutation.isPending}
            />
          ))}
        </div>
        {paginationComponent}
      </>
    )
  ) : filteredStaff.length === 0 ? (
    emptyComponent
  ) : (
    <StaffTable staffData={filteredStaff} />
  );

  return (
    <MCTablesLayouts
      title={t("staff.pageTitle")}
      filtersInlineWithTitle
      searchComponent={searchComponent}
      pdfGeneratorComponent={pdfGeneratorComponent}
      filterComponent={filterComponent}
      toogleView={toggleView}
      tableComponent={tableComponent}
    />
  );
}

export default StaffPage;
